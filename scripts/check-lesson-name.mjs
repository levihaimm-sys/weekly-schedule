import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Check the actual lesson plan by ID
const { data: lesson } = await supabase
  .from('lesson_plans')
  .select('*')
  .eq('id', '10f9ea6d-0a07-4e6d-b1a9-156efb6098de')
  .single();

console.log('📖 Lesson Plan Details:');
console.log('   ID:', lesson.id);
console.log('   Name:', lesson.name);
console.log('   Category:', lesson.category);
console.log('   Week Number:', lesson.week_number);
console.log('   Has Content:', lesson.content ? 'Yes' : 'No');
console.log('   Content Length:', lesson.content?.length || 0);

// Check all lessons with similar names
const { data: similarLessons } = await supabase
  .from('lesson_plans')
  .select('id, name')
  .ilike('name', '%פתיחת%4%')
  .order('name');

console.log('\n📚 Lessons containing "פתיחת" and "4":');
similarLessons?.forEach(l => console.log(`   - "${l.name}" (ID: ${l.id})`));

process.exit(0);
