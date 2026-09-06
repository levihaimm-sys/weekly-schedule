import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const HOLIDAY_DATES = [
  "2026-09-13",
  "2026-09-20", "2026-09-21",
  "2026-12-06", "2026-12-07", "2026-12-08", "2026-12-09", "2026-12-10",
  "2027-03-23", "2027-03-24",
  "2027-04-13", "2027-04-14", "2027-04-15", "2027-04-18", "2027-04-19", "2027-04-20", "2027-04-21", "2027-04-22", "2027-04-28",
  "2027-05-12",
  "2027-06-10",
];

const { data: existing, error: fetchErr } = await supabase
  .from('lessons')
  .select('id, lesson_date')
  .in('lesson_date', HOLIDAY_DATES);

if (fetchErr) {
  console.log('❌ Fetch failed:', fetchErr.message);
  process.exit(1);
}

console.log(`Found ${existing.length} lessons on holiday dates.`);
const byDate = {};
for (const l of existing) byDate[l.lesson_date] = (byDate[l.lesson_date] ?? 0) + 1;
console.log(byDate);

if (existing.length === 0) {
  console.log('Nothing to delete.');
  process.exit(0);
}

const { error: deleteErr } = await supabase
  .from('lessons')
  .delete()
  .in('lesson_date', HOLIDAY_DATES);

if (deleteErr) {
  console.log('❌ Delete failed:', deleteErr.message);
  process.exit(1);
}

console.log(`✅ Deleted ${existing.length} lessons.`);
