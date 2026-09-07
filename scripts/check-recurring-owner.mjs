import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const arielId = 'bc709706-e478-4a36-afe5-103d1ed400e6';

const { data: lessons } = await supabase
  .from('lessons')
  .select('id, start_time, instructor_id, recurring_item_id, location:locations(name)')
  .eq('instructor_id', arielId)
  .eq('lesson_date', '2026-09-07');

for (const l of lessons ?? []) {
  const { data: r } = await supabase
    .from('recurring_schedule')
    .select('id, instructor_id, group_name')
    .eq('id', l.recurring_item_id)
    .single();
  console.log(
    `${l.start_time} ${l.location?.name} | lesson.instructor_id=${l.instructor_id} | recurring.instructor_id=${r?.instructor_id} | MATCH=${r?.instructor_id === l.instructor_id}`
  );
}
