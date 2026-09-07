import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data: instructors } = await supabase
  .from('instructors')
  .select('id, full_name')
  .ilike('full_name', '%אריאל%ברמן%');

console.log('Instructor:', instructors);
const instructorId = instructors?.[0]?.id;
if (!instructorId) process.exit(0);

const { data: lessons } = await supabase
  .from('lessons')
  .select('id, lesson_date, start_time, recurring_item_id, location:locations(name, city, street)')
  .eq('instructor_id', instructorId)
  .eq('lesson_date', '2026-09-07');

for (const l of lessons ?? []) {
  console.log('\nLesson:', l.start_time, l.location?.name, l.location?.city);
  if (l.recurring_item_id) {
    const { data: r } = await supabase
      .from('recurring_schedule')
      .select('address, manager_name, manager_phone, framework_name, group_name')
      .eq('id', l.recurring_item_id)
      .single();
    console.log('  recurring_schedule:', r);
  } else {
    console.log('  no recurring_item_id');
  }
}
