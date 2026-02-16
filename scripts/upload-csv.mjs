import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const SUPABASE_URL = "https://gkkylaztfhasasndnfbg.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdra3lsYXp0Zmhhc2FzbmRuZmJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMTE2OTEsImV4cCI6MjA4NTg4NzY5MX0.uP3x22ZmR13tzdgMtNf4FEv7VC5Do8KJWeZK0R768F0";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- CSV Parser ---
function parseCSV(content) {
  const lines = content.split("\n").filter((l) => l.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    const cols = [];
    let current = "";
    let inQuotes = false;
    for (const c of row) {
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === "," && !inQuotes) {
        cols.push(current.trim());
        current = "";
      } else {
        current += c;
      }
    }
    cols.push(current.trim());
    // Only include rows with actual data (at least city + kindergarten name)
    if (cols[0] && cols[2]) {
      rows.push({
        city: cols[0],
        street: cols[1] || "",
        setting_name: cols[2],
        ages: cols[3] || "",
        day: cols[4] || "",
        time: cols[5] || "",
        instructor: cols[6] || "",
        group_name: cols[7] || "",
        changes: cols[8] || "",
      });
    }
  }
  return rows;
}

// --- Day mapping ---
const DAY_MAP = {
  "יום א'": 0,
  "יום ב'": 1,
  "יום ג'": 2,
  "יום ד'": 3,
  "יום ה'": 4,
  "יום ו'": 5,
  "יום שבת": 6,
};

// --- Time normalizer: "14:40" -> "14:40:00" ---
function normalizeTime(t) {
  if (!t) return "00:00:00";
  const parts = t.split(":");
  if (parts.length === 2) return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:00`;
  return t;
}

async function main() {
  const csvPath = "C:/Users/levih/Downloads/main haim in motion.csv";
  const content = readFileSync(csvPath, "utf-8").replace(/^\uFEFF/, ""); // remove BOM
  const rows = parseCSV(content);
  console.log(`Parsed ${rows.length} data rows from CSV\n`);

  // ============ STEP 1: Upload Instructors ============
  console.log("=== Step 1: Uploading Instructors ===");
  const uniqueInstructors = [...new Set(rows.map((r) => r.instructor).filter(Boolean))];
  console.log(`Found ${uniqueInstructors.length} unique instructors:`, uniqueInstructors);

  const instructorRecords = uniqueInstructors.map((name) => ({ full_name: name }));
  const { data: insertedInstructors, error: instErr } = await supabase
    .from("instructors")
    .upsert(instructorRecords, { onConflict: "full_name", ignoreDuplicates: true })
    .select();

  if (instErr) {
    console.error("Error uploading instructors:", instErr);
    // Try inserting one by one to see which ones fail
    console.log("Trying individual inserts...");
    for (const rec of instructorRecords) {
      const { error } = await supabase.from("instructors").insert(rec);
      if (error) console.error(`  Failed: ${rec.full_name} -`, error.message);
      else console.log(`  OK: ${rec.full_name}`);
    }
  } else {
    console.log(`Uploaded ${insertedInstructors?.length} instructors`);
  }

  // Fetch all instructors to build a lookup map
  const { data: allInstructors } = await supabase.from("instructors").select("id, full_name");
  const instructorMap = {};
  for (const inst of allInstructors || []) {
    instructorMap[inst.full_name] = inst.id;
  }
  console.log("Instructor map built:", Object.keys(instructorMap).length, "entries\n");

  // ============ STEP 2: Upload Locations ============
  console.log("=== Step 2: Uploading Locations ===");
  const locationSet = new Map();
  for (const row of rows) {
    const key = `${row.city}||${row.street}||${row.setting_name}`;
    if (!locationSet.has(key)) {
      locationSet.set(key, {
        name: row.setting_name,
        city: row.city,
        street: row.street,
        age_group: row.ages,
      });
    }
  }

  const locationRecords = [...locationSet.values()];
  console.log(`Found ${locationRecords.length} unique locations`);

  // Upload in batches of 100
  const locationResults = [];
  for (let i = 0; i < locationRecords.length; i += 100) {
    const batch = locationRecords.slice(i, i + 100);
    const { data, error } = await supabase.from("locations").insert(batch).select();
    if (error) {
      console.error(`Error uploading locations batch ${i}:`, error);
    } else {
      locationResults.push(...(data || []));
      console.log(`  Batch ${i}-${i + batch.length}: ${data?.length} inserted`);
    }
  }

  // Build location lookup: "city||street||name" -> id
  const { data: allLocations } = await supabase.from("locations").select("id, name, city, street");
  const locationMap = {};
  for (const loc of allLocations || []) {
    const key = `${loc.city}||${loc.street}||${loc.name}`;
    locationMap[key] = loc.id;
  }
  console.log("Location map built:", Object.keys(locationMap).length, "entries\n");

  // ============ STEP 3: Upload Recurring Schedule ============
  console.log("=== Step 3: Uploading Recurring Schedule ===");
  const scheduleRecords = [];
  let skipped = 0;

  for (const row of rows) {
    const instructorId = instructorMap[row.instructor];
    const locationKey = `${row.city}||${row.street}||${row.setting_name}`;
    const locationId = locationMap[locationKey];
    const dayOfWeek = DAY_MAP[row.day];

    if (!instructorId) {
      skipped++;
      continue;
    }
    if (locationId === undefined) {
      skipped++;
      continue;
    }
    if (dayOfWeek === undefined) {
      skipped++;
      continue;
    }

    scheduleRecords.push({
      instructor_id: instructorId,
      location_id: locationId,
      day_of_week: dayOfWeek,
      start_time: normalizeTime(row.time),
      group_name: row.group_name || null,
    });
  }

  console.log(`Prepared ${scheduleRecords.length} schedule records (skipped ${skipped})`);

  // Upload in batches of 100
  let totalInserted = 0;
  for (let i = 0; i < scheduleRecords.length; i += 100) {
    const batch = scheduleRecords.slice(i, i + 100);
    const { data, error } = await supabase.from("recurring_schedule").insert(batch).select();
    if (error) {
      console.error(`Error uploading schedule batch ${i}:`, error);
    } else {
      totalInserted += data?.length || 0;
      if ((i / 100) % 5 === 0) {
        console.log(`  Progress: ${totalInserted}/${scheduleRecords.length}`);
      }
    }
  }

  console.log(`\n=== DONE ===`);
  console.log(`Instructors: ${Object.keys(instructorMap).length}`);
  console.log(`Locations: ${Object.keys(locationMap).length}`);
  console.log(`Schedule entries: ${totalInserted}`);
}

main().catch(console.error);
