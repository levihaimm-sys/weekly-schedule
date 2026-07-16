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

const names = ["סתיו דהן", "גל סחייק", "רמי שמש", "מורן דגיר", "חוי פוקס", "עליזה אברבנל"];

const { data: instructors, error: e1 } = await supabase
  .from("instructors")
  .select("id, full_name, status")
  .in("full_name", names);
console.log("Matching instructors found:", JSON.stringify(instructors, null, 2));
if (e1) console.log("err1", e1);

const { data: allInstructors } = await supabase.from("instructors").select("full_name, status").order("full_name");
console.log("\nAll instructors in DB:");
console.log((allInstructors ?? []).map(i => `${i.full_name} [${i.status}]`).join("\n"));

const gardenNames = [
  "גן אקליפטוס","גן יוסף","גן תלמי אור","גן לוי יצחק","גן רגבי אור","גן מנחם","גן רבקה","גן חיה","גן חנה",
  "גן לילך","גן חצב","גן רוזמרין","גן צלף","גן גלים","גן קורל","גן ברק","גן כוכב","גן אביב","גן רקיע",
  "גן שובל","גן צדף","גן סהר","גן יובל","גן פלג","גן זמיר","גן לבונה","ביה\"ס נופים","ביה\"ס נווה דליה",
  "גן אסיף","גן אגוז","גן חיטה","גן לוטוס","גן נבטים","גן צנובר","גן רותם","גן שמש","גן כרכום"
];
const { data: locs } = await supabase.from("locations").select("id, name, city").in("name", gardenNames);
console.log("\nMatching locations already in DB:", JSON.stringify(locs, null, 2));

const { data: allLocs } = await supabase.from("locations").select("name, city").order("name");
console.log("\nTotal locations in DB:", allLocs?.length);
