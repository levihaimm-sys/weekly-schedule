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
  .ilike('full_name', '%אילת%');

console.log('Instructors matching אילת:', instructors);

for (const inst of instructors ?? []) {
  const { data: assignments } = await supabase
    .from('weekly_lesson_assignments')
    .select('id, week_start_date, lesson_plan_id, lesson_plan:lesson_plans(name)')
    .eq('instructor_id', inst.id)
    .order('week_start_date', { ascending: false })
    .limit(5);

  console.log(`\nAssignments for ${inst.full_name}:`, assignments);

  for (const a of assignments ?? []) {
    const { data: confirmations } = await supabase
      .from('equipment_confirmations')
      .select('equipment_id, expected_quantity, equipment:equipment(name)')
      .eq('assignment_id', a.id);
    const { data: planEquipment } = await supabase
      .from('lesson_plan_equipment')
      .select('equipment_id, quantity, equipment:equipment(name)')
      .eq('lesson_plan_id', a.lesson_plan_id);

    console.log(`  week ${a.week_start_date} plan=${a.lesson_plan?.name}`);
    console.log(`    confirmations:`, confirmations?.map(c => `${c.expected_quantity} ${c.equipment?.name}`));
    console.log(`    plan equipment:`, planEquipment?.map(c => `${c.quantity} ${c.equipment?.name}`));
  }
}
