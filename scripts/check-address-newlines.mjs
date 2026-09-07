import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data, error } = await supabase
  .from('recurring_schedule')
  .select('id, group_name, address')
  .not('address', 'is', null);

if (error) { console.error(error); process.exit(1); }

const withNewline = (data ?? []).filter((r) => r.address?.includes('\n'));
console.log(`Rows with embedded newline in address: ${withNewline.length} / ${data.length} total with an address`);
for (const r of withNewline) {
  console.log(`${r.group_name} | id=${r.id} | ${JSON.stringify(r.address)}`);
}
