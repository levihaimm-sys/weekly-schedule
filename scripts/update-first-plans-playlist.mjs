import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PLAYLIST_URL = 'https://hspisrael.wixsite.com/newbuli/copy-of-%D7%A4%D7%AA%D7%99%D7%97%D7%AA-%D7%A9%D7%A0%D7%94-1';

const { data, error } = await supabase
  .from('lesson_plans')
  .update({ playlist_url: PLAYLIST_URL })
  .or('name.ilike.%היכרות ואות העצירה%,name.ilike.%מבנים קבוצתיים וזוגות%')
  .select('id, name, playlist_url');

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

console.log(`Updated ${data.length} plans:\n`);
for (const p of data) {
  console.log(`${p.name} -> ${p.playlist_url}`);
}
