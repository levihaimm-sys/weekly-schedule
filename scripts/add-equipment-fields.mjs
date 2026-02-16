import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('Adding equipment distribution fields...\n');

// First, check if columns already exist by trying to select them
console.log('1. Checking weekly_lesson_assignments table...');
const { data: testAssignment, error: testError } = await supabase
  .from('weekly_lesson_assignments')
  .select('id, equipment_distributed, equipment_distributed_at')
  .limit(1);

if (testError && testError.message.includes('column')) {
  console.log('   Columns need to be added (this is expected)');
} else {
  console.log('   ✓ Columns already exist!');
}

// Check instructors table
console.log('2. Checking instructors table...');
const { data: testInstructor, error: testError2 } = await supabase
  .from('instructors')
  .select('id, route')
  .limit(1);

if (testError2 && testError2.message.includes('column')) {
  console.log('   Route column needs to be added (this is expected)');
} else {
  console.log('   ✓ Route column exists!');
}

// Now let's check if we can read instructors at all
console.log('\n3. Testing instructors query...');
const { data: instructors, error: instrError } = await supabase
  .from('instructors')
  .select('id, full_name, phone');

if (instrError) {
  console.error('   ✗ Error reading instructors:', instrError);
} else {
  console.log(`   ✓ Found ${instructors?.length || 0} instructors`);
  if (instructors && instructors.length > 0) {
    console.log('   Sample:', instructors[0].full_name);
  }
}

// Check weekly assignments
console.log('\n4. Testing weekly_lesson_assignments query...');
const { data: assignments, error: assignError } = await supabase
  .from('weekly_lesson_assignments')
  .select('id, instructor_id, lesson_plan_id')
  .limit(5);

if (assignError) {
  console.error('   ✗ Error reading assignments:', assignError);
} else {
  console.log(`   ✓ Found ${assignments?.length || 0} assignments`);
}

console.log('\n✅ Diagnostic complete!');
console.log('\n📝 Next steps:');
console.log('   1. Go to Supabase Dashboard → SQL Editor');
console.log('   2. Run the migration SQL from: supabase/migrations/014_add_equipment_distribution.sql');
console.log('   3. Or copy this SQL and run it:');
console.log('\n' + `
ALTER TABLE weekly_lesson_assignments
ADD COLUMN IF NOT EXISTS equipment_distributed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS equipment_distributed_at TIMESTAMPTZ;

ALTER TABLE instructors
ADD COLUMN IF NOT EXISTS route TEXT;

UPDATE weekly_lesson_assignments
SET equipment_distributed = FALSE
WHERE equipment_distributed IS NULL;
`.trim());

process.exit(0);
