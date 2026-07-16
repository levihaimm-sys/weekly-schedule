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

const dates = ["2026-07-22", "2026-07-26", "2026-07-28", "2026-07-29", "2026-07-30"];
const { data, error } = await supabase
  .from("lessons")
  .select("lesson_date, start_time, change_notes, is_one_time_change, locations(name, city), instructors!lessons_instructor_id_fkey(full_name)")
  .in("lesson_date", dates)
  .eq("is_one_time_change", true)
  .order("lesson_date")
  .order("start_time");

if (error) console.error(error);
console.log(`Total one-time lessons on these dates: ${data.length}`);
for (const d of data.slice(0, 5)) {
  console.log(JSON.stringify(d));
}
