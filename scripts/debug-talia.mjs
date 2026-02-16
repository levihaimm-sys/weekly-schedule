import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// List all unique categories
const { data: allPlans } = await supabase
  .from('lesson_plans')
  .select('category')
  .order('category');

const categories = [...new Set(allPlans?.map(p => p.category))];
console.log('=== All unique categories in DB ===');
categories.forEach(c => console.log(`  "${c}"`));

process.exit(0);
