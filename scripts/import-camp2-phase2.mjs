import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envPath = "C:/Users/levih/Documents/weekly-schedule/.env.local";
const env = {};
for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const dryrun = JSON.parse(
  fs.readFileSync("C:/Users/levih/Documents/weekly-schedule/scripts/.camp2-dryrun.json", "utf8")
);

// --- Step 1: create missing locations ---
const toCreate = dryrun.locationsToCreate.map(([, v]) => ({ name: v.name, city: v.city, street: v.street }));
console.log(`Creating ${toCreate.length} new locations...`);
const { data: created, error: createErr } = await supabase.from("locations").insert(toCreate).select("id, name, city, street");
if (createErr) {
  console.error("Error creating locations:", createErr);
  process.exit(1);
}
console.log(`Created ${created.length} locations.`);

// --- Rebuild full location map (existing + newly created) ---
const { data: allLocations } = await supabase.from("locations").select("id, name, city, street");
const locationMap = new Map((allLocations ?? []).map((l) => [`${l.city.trim()}||${l.name.trim()}`, l.id]));

// --- Step 2: resolve location_id per prepared row ---
const finalRows = dryrun.prepared.map((p) => ({
  instructor_id: p.instructor_id,
  location_id: locationMap.get(p.locKey),
  lesson_date: p.lesson_date,
  start_time: p.start_time,
  status: "scheduled",
  change_notes: p.change_notes,
  is_one_time_change: true,
  recurring_item_id: null,
  _lineNo: p.lineNo,
  _city: p.city,
  _garden: p.gardenName,
}));

const missingLoc = finalRows.filter((r) => !r.location_id);
if (missingLoc.length) {
  console.error("Rows with unresolved location_id (aborting):", missingLoc);
  process.exit(1);
}

// --- Step 3: check against EXISTING lessons for exact duplicates (instructor+location+date+time) ---
const uniqueDates = [...new Set(finalRows.map((r) => r.lesson_date))];
const { data: existingLessons } = await supabase
  .from("lessons")
  .select("id, instructor_id, location_id, lesson_date, start_time")
  .in("lesson_date", uniqueDates);

const existingMap = new Map(
  (existingLessons ?? []).map((e) => [`${e.instructor_id}|${e.location_id}|${e.lesson_date}|${e.start_time}`, e.id])
);

const toInsert = [];
const toUpdate = [];
for (const r of finalRows) {
  const key = `${r.instructor_id}|${r.location_id}|${r.lesson_date}|${r.start_time}`;
  const existingId = existingMap.get(key);
  const { _lineNo, _city, _garden, ...clean } = r;
  if (existingId) {
    console.log(`דורס שיעור קיים: שורה ${_lineNo} — ${_city} / ${_garden} ב-${r.lesson_date} ${r.start_time} (lesson id ${existingId})`);
    toUpdate.push({ id: existingId, ...clean });
  } else {
    toInsert.push(clean);
  }
}

console.log(`\nלהוספה: ${toInsert.length}, לדריסה (עדכון שיעור קיים): ${toUpdate.length}`);

// --- Step 4: insert new rows in batches ---
const BATCH = 100;
let insertedCount = 0;
for (let i = 0; i < toInsert.length; i += BATCH) {
  const batch = toInsert.slice(i, i + BATCH);
  const { data, error } = await supabase.from("lessons").insert(batch).select("id");
  if (error) {
    console.error(`Insert batch error at ${i}:`, error);
  } else {
    insertedCount += data.length;
  }
}
console.log(`Inserted ${insertedCount} new lessons.`);

// --- Step 5: update (overwrite) existing duplicate rows ---
let updatedCount = 0;
for (const u of toUpdate) {
  const { id, ...fields } = u;
  const { error } = await supabase.from("lessons").update(fields).eq("id", id);
  if (error) {
    console.error(`Update error for lesson ${id}:`, error);
  } else {
    updatedCount++;
  }
}
console.log(`Updated (overwrote) ${updatedCount} existing lessons.`);

console.log("\n=== DONE ===");
