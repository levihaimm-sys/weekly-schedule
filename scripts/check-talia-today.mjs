import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('Checking Talia status...\n');

// Get current week Sunday
const now = new Date();
const dayOfWeek = now.getDay();
const sunday = new Date(now);
sunday.setDate(now.getDate() - dayOfWeek);
sunday.setHours(0, 0, 0, 0);
const weekStartDate = sunday.toISOString().split("T")[0];

console.log('Current week start date:', weekStartDate);
console.log('Today is:', ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]);

// Find Talia
const { data: talia, error: taliaError } = await supabase
  .from('instructors')
  .select('id, full_name, phone, route')
  .eq('phone', '0548487254')
  .single();

if (taliaError || !talia) {
  console.error('Error finding Talia:', taliaError);
  process.exit(1);
}

console.log('\n1. Talia found:');
console.log('   ID:', talia.id);
console.log('   Name:', talia.full_name);
console.log('   Route:', talia.route || '(not set)');

// Get her current week assignment
const { data: assignment, error: assignError } = await supabase
  .from('weekly_lesson_assignments')
  .select(`
    id,
    instructor_id,
    lesson_plan_id,
    week_start_date,
    equipment_distributed,
    equipment_distributed_at,
    lesson_plan:lesson_plans(id, name, category)
  `)
  .eq('instructor_id', talia.id)
  .eq('week_start_date', weekStartDate)
  .single();

if (assignError) {
  console.error('\n2. ✗ Error getting assignment:', assignError);
  process.exit(1);
}

console.log('\n2. ✓ Assignment found:');
console.log('   Assignment ID:', assignment.id);
console.log('   Lesson Plan:', assignment.lesson_plan?.name);
console.log('   Equipment Distributed:', assignment.equipment_distributed);
console.log('   Distributed At:', assignment.equipment_distributed_at);

// Get equipment confirmations
const { data: confirmations, error: confError } = await supabase
  .from('equipment_confirmations')
  .select(`
    id,
    equipment_id,
    expected_quantity,
    received_quantity,
    is_confirmed,
    equipment:equipment(id, name)
  `)
  .eq('assignment_id', assignment.id);

console.log('\n3. Equipment confirmations:');
if (confError) {
  console.error('   ✗ Error:', confError);
} else {
  console.log(`   ✓ Found ${confirmations?.length || 0} confirmations`);
  if (confirmations && confirmations.length > 0) {
    confirmations.forEach(c => {
      console.log(`     - ${c.equipment?.name}: ${c.expected_quantity} (${c.is_confirmed ? 'confirmed' : 'pending'})`);
    });
  }
}

console.log('\n✅ Diagnostic complete!');
process.exit(0);
