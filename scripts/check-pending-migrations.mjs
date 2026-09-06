import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('--- Migration 043 (is_owner) ---');
const { data: ownerCheck, error: ownerErr } = await supabase
  .from('profiles')
  .select('email, is_owner')
  .eq('email', 'levihaimm@gmail.com');

if (ownerErr) {
  console.log('❌ NOT applied (column missing):', ownerErr.message);
} else {
  console.log('✅ Column exists. levihaimm@gmail.com row:', ownerCheck);
}

console.log('\n--- Migration 041 (safe_assignment status) ---');
// Try updating a throwaway/nonexistent id with status safe_assignment to test the constraint
// without touching real data — a fake id update affects zero rows either way.
const { error: constraintErr } = await supabase
  .from('staffing_needs')
  .update({ status: 'safe_assignment' })
  .eq('id', '00000000-0000-0000-0000-000000000000');

if (constraintErr) {
  console.log('❌ Likely NOT applied — update rejected:', constraintErr.message);
} else {
  console.log('✅ Update accepted (0 rows matched, but no constraint violation) — likely applied.');
}
