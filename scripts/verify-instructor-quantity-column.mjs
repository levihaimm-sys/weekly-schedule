import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data, error } = await supabase
  .from('lesson_plan_equipment')
  .select('id, quantity, instructor_quantity')
  .limit(1);

if (error) {
  console.error('❌ Column check failed:', error.message);
  process.exit(1);
}

console.log('✅ Column exists. Sample row:', data);
