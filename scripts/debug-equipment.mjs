import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Check if there's equipment data
const { data: equipment } = await supabase
  .from('equipment')
  .select('*')
  .limit(5);

console.log('Equipment table:', equipment?.length || 0, 'items');
if (equipment && equipment.length > 0) {
  console.log('Sample:', equipment[0]);
}

// Check lesson_plan_equipment
const { data: lpe } = await supabase
  .from('lesson_plan_equipment')
  .select('*')
  .limit(5);

console.log('\nLesson plan equipment:', lpe?.length || 0, 'items');
if (lpe && lpe.length > 0) {
  console.log('Sample:', lpe[0]);
}

// Check a specific lesson
const { data: lesson } = await supabase
  .from('lesson_plans')
  .select('id, name')
  .eq('name', 'פתיחת שנה 4')
  .single();

if (lesson) {
  console.log('\nLesson:', lesson.name, '- ID:', lesson.id);
  
  const { data: lessonEquip } = await supabase
    .from('lesson_plan_equipment')
    .select('*, equipment(name)')
    .eq('lesson_plan_id', lesson.id);
  
  console.log('Equipment for this lesson:', lessonEquip?.length || 0);
  if (lessonEquip) {
    lessonEquip.forEach(e => console.log(`  - ${e.equipment.name}: ${e.quantity}`));
  }
}

process.exit(0);
