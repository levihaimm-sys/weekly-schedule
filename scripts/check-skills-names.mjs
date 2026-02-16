import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data } = await supabase
  .from('lesson_plans')
  .select('name')
  .ilike('name', '%מיומנו%')
  .order('name');

console.log('Found lessons:');
data.forEach(l => console.log(`- "${l.name}"`));

process.exit(0);
