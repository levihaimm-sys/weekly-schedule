import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { count: totalCount } = await supabase
  .from('recurring_schedule')
  .select('*', { count: 'exact', head: true });

const { count: nullCount } = await supabase
  .from('recurring_schedule')
  .select('*', { count: 'exact', head: true })
  .is('instructor_id', null);

console.log(`recurring_schedule rows: ${totalCount} total, ${nullCount} with instructor_id = null`);

// How many of those null-instructor rows actually have lessons currently assigned
// to a real instructor (i.e., where the RLS gap actually bites)?
const { data: nullRows } = await supabase
  .from('recurring_schedule')
  .select('id, group_name')
  .is('instructor_id', null);

const nullIds = (nullRows ?? []).map((r) => r.id);
if (nullIds.length > 0) {
  const { count: affectedLessons } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .in('recurring_item_id', nullIds)
    .not('instructor_id', 'is', null)
    .gte('lesson_date', '2026-09-01');

  console.log(`Lessons (since 2026-09-01) pointing to a null-instructor recurring row but with a real instructor assigned: ${affectedLessons}`);
}
