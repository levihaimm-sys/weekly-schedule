import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data, error } = await supabase
  .from('lesson_plans')
  .select('id, name, playlist_url')
  .or('name.ilike.%היכרות ואות העצירה%,name.ilike.%מבנים קבוצתיים וזוגות%');

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

console.log(`Found ${data.length} matching plans:\n`);
for (const p of data) {
  console.log(`${p.name} | playlist_url: ${p.playlist_url ?? '(none)'} | id: ${p.id}`);
}
