import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Create client with service role to simulate user
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const instructorId = 'c4d09187-8bb5-4cdb-912f-ce7e7f7c8482'; // Talia's ID

// Calculate current week
const now = new Date();
const dayOfWeek = now.getDay();
const sunday = new Date(now);
sunday.setDate(now.getDate() - dayOfWeek);
sunday.setHours(0, 0, 0, 0);
const weekStartDate = sunday.toISOString().split('T')[0];

console.log('Testing query for Talia...');
console.log('Instructor ID:', instructorId);
console.log('Week start date:', weekStartDate);
console.log();

// Test the exact query from the code
const { data, error } = await supabase
  .from('weekly_lesson_assignments')
  .select(`
    *,
    instructor:instructors(id, full_name),
    lesson_plan:lesson_plans(
      id,
      name,
      category,
      pdf_path,
      week_number
    )
  `)
  .eq('instructor_id', instructorId)
  .eq('week_start_date', weekStartDate)
  .single();

console.log('Query result:');
console.log('Error:', error);
console.log('Data:', data ? 'Found assignment' : 'No data');

if (data) {
  console.log('\n✅ Assignment found:');
  console.log('   ID:', data.id);
  console.log('   Instructor:', data.instructor?.full_name);
  console.log('   Lesson:', data.lesson_plan?.name);
  console.log('   Week:', data.week_start_date);
} else {
  console.log('\n❌ No assignment found');
  
  // Try without .single()
  console.log('\nTrying without .single()...');
  const { data: data2, error: error2 } = await supabase
    .from('weekly_lesson_assignments')
    .select(`
      *,
      instructor:instructors(id, full_name),
      lesson_plan:lesson_plans(
        id,
        name,
        category,
        pdf_path,
        week_number
      )
    `)
    .eq('instructor_id', instructorId)
    .eq('week_start_date', weekStartDate);
  
  console.log('Error:', error2);
  console.log('Data count:', data2?.length || 0);
  if (data2 && data2.length > 0) {
    console.log('First result:', data2[0].lesson_plan?.name);
  }
}

process.exit(0);
