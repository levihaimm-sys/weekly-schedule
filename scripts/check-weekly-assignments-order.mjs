import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const names = [
  'אריאל ברמן',
  'קארין גינתי',
  'ליאור',
  'עדי שאמו',
  'מורן דגיר',
  'עליזה אברבנל',
  'חווי פוקס',
  'טל שומרת',
  'אילת סופר',
];

const { data: allInstructors } = await supabase
  .from('instructors')
  .select('id, full_name, rotation_order, route, is_active')
  .order('rotation_order', { ascending: true, nullsFirst: false });

console.log('=== All instructors (rotation_order order) ===');
for (const i of allInstructors ?? []) {
  console.log(`${i.rotation_order ?? '-'}\t${i.full_name}\troute=${i.route}\tactive=${i.is_active}`);
}

console.log('\n=== Fuzzy match check for requested names ===');
for (const name of names) {
  const exact = (allInstructors ?? []).find((i) => i.full_name === name);
  if (exact) {
    console.log(`OK exact: "${name}" -> id=${exact.id} rotation_order=${exact.rotation_order}`);
  } else {
    const { data: fuzzy } = await supabase
      .from('instructors')
      .select('id, full_name, rotation_order')
      .ilike('full_name', `%${name.split(' ')[0]}%`);
    console.log(`MISSING exact match: "${name}" — fuzzy candidates:`, fuzzy);
  }
}

console.log('\n=== instructor -> city via recurring_schedule ===');
const { data: scheduleData } = await supabase
  .from('recurring_schedule')
  .select('instructor_id, instructor:instructors(full_name), location:locations(city)');

const cityByInstructor = new Map();
for (const row of scheduleData ?? []) {
  if (row.instructor_id && row.location?.city && !cityByInstructor.has(row.instructor_id)) {
    cityByInstructor.set(row.instructor_id, { name: row.instructor?.full_name, city: row.location.city });
  }
}
for (const name of names) {
  const inst = (allInstructors ?? []).find((i) => i.full_name === name);
  if (!inst) continue;
  const cityInfo = cityByInstructor.get(inst.id);
  console.log(`${name} -> ${cityInfo ? cityInfo.city : '(no recurring_schedule city found)'}`);
}
const choi = (allInstructors ?? []).find((i) => i.full_name === 'חוי פוקס');
if (choi) {
  const cityInfo = cityByInstructor.get(choi.id);
  console.log(`חוי פוקס -> ${cityInfo ? cityInfo.city : '(no recurring_schedule city found)'}`);
}

console.log('\n=== Locations table (name + city) ===');
const { data: locations } = await supabase.from('locations').select('id, name, city').order('city');
for (const l of locations ?? []) {
  console.log(`${l.city ?? '(no city)'} | ${l.name}`);
}


// Determine current week's Sunday + whether assignments already exist for it
const now = new Date();
const day = now.getDay();
const sunday = new Date(now);
sunday.setDate(now.getDate() - day);
const weekStartDate = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`;
console.log('\n=== Current week start date ===', weekStartDate);

const { data: currentAssignments } = await supabase
  .from('weekly_lesson_assignments')
  .select('instructor_id, instructor:instructors(full_name), lesson_plan_id, equipment_distributed, lesson_plan:lesson_plans(name)')
  .eq('week_start_date', weekStartDate);

console.log('=== Assignments already existing for current week ===');
for (const a of currentAssignments ?? []) {
  console.log(`${a.instructor?.full_name}: plan=${a.lesson_plan?.name ?? '(none)'} equipment_distributed=${a.equipment_distributed}`);
}
