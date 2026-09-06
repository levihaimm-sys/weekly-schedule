import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('Running migration 046: add lesson_plan_equipment.instructor_quantity...');

const { error } = await supabase.rpc('exec_sql', {
  sql: `ALTER TABLE lesson_plan_equipment ADD COLUMN IF NOT EXISTS instructor_quantity INTEGER;`,
});

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

console.log('✅ Migration 046 completed!');
