import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Find גל סחייק
const { data: gal, error: galError } = await supabase
  .from('instructors')
  .select('id, full_name, phone, route')
  .ilike('full_name', '%גל%');

if (galError || !gal || gal.length === 0) {
  console.error('Error finding instructor:', galError);
  console.log('No instructor found with name containing גל');
  process.exit(1);
}

console.log('Instructors found with גל:');
gal.forEach(i => console.log(`  - ${i.full_name} (ID: ${i.id})`));

// Find גל סחייק specifically
const galSahaik = gal.find(i => i.full_name.includes('סחייק') || i.full_name.includes('סהיק') || i.full_name.includes('גל'));

if (!galSahaik) {
  console.log('\nCould not find גל סחייק specifically. Using first match.');
}

const instructor = galSahaik || gal[0];
console.log('\nUsing instructor:', instructor.full_name, '(ID:', instructor.id + ')');

// Get all assignments for this instructor
const { data: assignments, error: assignError } = await supabase
  .from('weekly_lesson_assignments')
  .select(`
    id,
    week_start_date,
    is_permanent_change,
    lesson_plan:lesson_plans(id, name, category, week_number)
  `)
  .eq('instructor_id', instructor.id)
  .order('week_start_date', { ascending: true });

if (assignError) {
  console.error('Error getting assignments:', assignError);
  process.exit(1);
}

console.log(`\nAll lesson assignments for ${instructor.full_name}:`);
if (!assignments || assignments.length === 0) {
  console.log('  No assignments found.');
} else {
  assignments.forEach(a => {
    console.log(`  - ${a.week_start_date}: ${a.lesson_plan?.name || 'Unknown'} (קטגוריה: ${a.lesson_plan?.category || 'N/A'}, שבוע מספר: ${a.lesson_plan?.week_number || 'N/A'})`);
  });
  console.log(`\nTotal: ${assignments.length} assignments`);
  const last = assignments[assignments.length - 1];
  console.log(`\nLAST assignment: ${last.week_start_date} → ${last.lesson_plan?.name}`);
}

process.exit(0);
