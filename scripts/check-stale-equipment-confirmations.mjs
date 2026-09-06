import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// All weekly assignments that currently have a lesson plan
const { data: assignments, error: aErr } = await supabase
  .from('weekly_lesson_assignments')
  .select('id, instructor_id, lesson_plan_id, week_start_date, instructor:instructors(full_name), lesson_plan:lesson_plans(name)')
  .not('lesson_plan_id', 'is', null);

if (aErr) { console.error(aErr); process.exit(1); }

let staleCount = 0;

for (const a of assignments) {
  const { data: confirmations } = await supabase
    .from('equipment_confirmations')
    .select('equipment_id')
    .eq('assignment_id', a.id);

  if (!confirmations || confirmations.length === 0) continue;

  const { data: planEquipment } = await supabase
    .from('lesson_plan_equipment')
    .select('equipment_id')
    .eq('lesson_plan_id', a.lesson_plan_id);

  const planEquipmentIds = new Set((planEquipment ?? []).map((e) => e.equipment_id));
  const confirmationIds = new Set(confirmations.map((c) => c.equipment_id));

  const matches =
    planEquipmentIds.size === confirmationIds.size &&
    [...planEquipmentIds].every((id) => confirmationIds.has(id));

  if (!matches) {
    staleCount++;
    console.log(
      `STALE: ${a.instructor?.full_name ?? a.instructor_id} | week ${a.week_start_date} | plan: ${a.lesson_plan?.name} | assignment: ${a.id} | confirmations: ${confirmations.length} rows, plan expects: ${planEquipmentIds.size} items`
    );
  }
}

console.log(`\nTotal stale assignments found: ${staleCount} / ${assignments.length} checked`);
