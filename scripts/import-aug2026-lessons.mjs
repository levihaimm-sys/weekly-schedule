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

// --- CSV parser (handles quoted fields with embedded commas / doubled quotes) ---
function parseCSVLine(line) {
  const cols = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += c;
      }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") {
        cols.push(current);
        current = "";
      } else current += c;
    }
  }
  cols.push(current);
  return cols.map((c) => c.trim());
}

const CITY_ALIASES = {
  "פתח תקווה": "פת",
};

function normalizeCity(city) {
  const clean = city.replace(/["']/g, "").trim();
  return CITY_ALIASES[clean] ?? clean;
}

function parseDate(raw) {
  const dmy = /^(\d{1,2})[\/.\\-](\d{1,2})[\/.\\-](\d{2,4})$/.exec(raw.trim());
  if (!dmy) return null;
  const year = dmy[3].length === 2 ? 2000 + parseInt(dmy[3]) : parseInt(dmy[3]);
  return `${year}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
}

function normalizeTime(t) {
  const parts = t.trim().split(":");
  if (parts.length === 2) return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:00`;
  return t;
}

const csvPath = "C:/Users/levih/Downloads/lessons_template (4).csv";
const content = fs.readFileSync(csvPath, "utf8").replace(/^﻿/, "");
const lines = content.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
const header = parseCSVLine(lines[0]);
console.log("Header:", header);

const rows = [];
for (let i = 1; i < lines.length; i++) {
  const values = parseCSVLine(lines[i]);
  const row = {};
  header.forEach((col, idx) => (row[col] = values[idx] ?? ""));
  rows.push({ lineNo: i + 1, ...row });
}
console.log(`Parsed ${rows.length} data rows\n`);

// --- Load existing instructors & locations ---
const { data: allInstructors } = await supabase
  .from("instructors")
  .select("id, full_name, status");
const instructorMap = new Map((allInstructors ?? []).map((i) => [i.full_name.trim(), i]));

const { data: allLocations } = await supabase.from("locations").select("id, name, city, street");
const locationMap = new Map(
  (allLocations ?? []).map((l) => [`${l.city.trim()}||${l.name.trim()}`, l])
);

// --- Build prepared rows ---
const prepared = [];
const problems = [];
const locationsToCreate = new Map(); // key -> {name, city, street}

for (const row of rows) {
  const city = normalizeCity(row["עיר"]);
  const street = row["רחוב"] || null;
  const gardenName = row["שם הגן"].trim();
  const locKey = `${city}||${gardenName}`;

  let loc = locationMap.get(locKey);
  if (!loc && !locationsToCreate.has(locKey)) {
    locationsToCreate.set(locKey, { name: gardenName, city, street });
  }

  const instructorName = row["מדריך"].trim();
  const instructor = instructorMap.get(instructorName);
  if (!instructor) {
    problems.push(`שורה ${row.lineNo}: מדריך/ה לא נמצא/ה בטבלה: "${instructorName}"`);
    continue;
  }
  if (instructor.status !== "active" && instructor.status !== "substitute") {
    problems.push(`שורה ${row.lineNo}: מדריך/ה "${instructorName}" לא פעיל/ה (status=${instructor.status})`);
    continue;
  }

  const dateVal = parseDate(row["תאריך"]);
  if (!dateVal) {
    problems.push(`שורה ${row.lineNo}: תאריך לא תקין: "${row["תאריך"]}"`);
    continue;
  }

  const timeVal = row["שעה"];
  if (!/^\d{1,2}:\d{2}$/.test(timeVal)) {
    problems.push(`שורה ${row.lineNo}: שעה לא תקינה: "${timeVal}"`);
    continue;
  }

  prepared.push({
    lineNo: row.lineNo,
    locKey,
    city,
    gardenName,
    instructor_id: instructor.id,
    instructorName,
    lesson_date: dateVal,
    start_time: normalizeTime(timeVal),
    change_notes: row["הערות"] || null,
    clientName: row["שם הלקוח"] || null,
  });
}

console.log(`=== בעיות (${problems.length}) ===`);
problems.forEach((p) => console.log(" - " + p));

console.log(`\n=== גנים חדשים שייווצרו (${locationsToCreate.size}) ===`);
for (const [key, v] of locationsToCreate) console.log(` - ${v.city} / ${v.name} (${v.street ?? "-"})`);

// --- Detect within-file duplicates (same instructor+garden+date+time) ---
const seen = new Map();
const duplicatesInFile = [];
for (const p of prepared) {
  const key = `${p.instructor_id}|${p.locKey}|${p.lesson_date}|${p.start_time}`;
  if (seen.has(key)) {
    duplicatesInFile.push({ first: seen.get(key), dup: p });
  }
  seen.set(key, p);
}
console.log(`\n=== שיעורים כפולים בתוך הקובץ עצמו (${duplicatesInFile.length}) ===`);
duplicatesInFile.forEach(({ first, dup }) =>
  console.log(` - שורה ${first.lineNo} וגם שורה ${dup.lineNo}: ${dup.city} / ${dup.gardenName} ב-${dup.lesson_date} ${dup.start_time}`)
);

console.log(`\n=== סה"כ שורות תקינות מוכנות לטעינה: ${prepared.length} ===`);

fs.writeFileSync(
  "C:/Users/levih/Documents/weekly-schedule/scripts/.aug2026-dryrun.json",
  JSON.stringify({ prepared, locationsToCreate: [...locationsToCreate.entries()], problems, duplicatesInFile }, null, 2),
  "utf8"
);
console.log("\nDry-run data written to scripts/.aug2026-dryrun.json");
