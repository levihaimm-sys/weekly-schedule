import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('Applying INSERT policy fix...');

const sql = `
CREATE POLICY "Instructors can insert own confirmations" ON equipment_confirmations
  FOR INSERT WITH CHECK (
    instructor_id = (SELECT instructor_id FROM profiles WHERE id = auth.uid())
  );
`;

// Execute the SQL
const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

if (error) {
  console.error('Error:', error);
  
  // Try alternative approach - check if policy already exists
  console.log('\nChecking existing policies...');
  const { data: policies, error: policyError } = await supabase
    .from('pg_policies')
    .select('*')
    .eq('tablename', 'equipment_confirmations');
  
  if (policies) {
    console.log('Existing policies:');
    policies.forEach(p => console.log(`  - ${p.policyname} (${p.cmd})`));
  }
} else {
  console.log('✅ Policy created successfully!');
}

process.exit(0);
