/**
 * Renames the existing "מערך 1" and "מערך 2" lesson plans (currently named
 * "היכרות ואות העצירה 1 (X)" / "מבנים קבוצתיים וזוגות 2 (X)") to match the
 * "מערך N - שם (variant)" naming convention used by sets 3-40.
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const RENAMES = [
  ['היכרות ואות העצירה 1 (גומיות)', 'מערך 1 - הכרות ואות עצירה (גומיות)'],
  ['היכרות ואות העצירה 1 (חישוקים)', 'מערך 1 - הכרות ואות עצירה (חישוקים)'],
  ['היכרות ואות העצירה 1 (כריות)', 'מערך 1 - הכרות ואות עצירה (כריות)'],
  ['היכרות ואות העצירה 1 (מקלות)', 'מערך 1 - הכרות ואות עצירה (מקלות)'],
  ['היכרות ואות העצירה 1 (קונוסים)', 'מערך 1 - הכרות ואות עצירה (קונוסים)'],
  ['מבנים קבוצתיים וזוגות 2 (גומיות)', 'מערך 2 - מבנים קבוצתיים וזוגות (גומיות)'],
  ['מבנים קבוצתיים וזוגות 2 (חישוקים)', 'מערך 2 - מבנים קבוצתיים וזוגות (חישוקים)'],
  ['מבנים קבוצתיים וזוגות 2 (כריות)', 'מערך 2 - מבנים קבוצתיים וזוגות (כריות)'],
  ['מבנים קבוצתיים וזוגות 2 (מקלות)', 'מערך 2 - מבנים קבוצתיים וזוגות (מקלות)'],
  ['מבנים קבוצתיים וזוגות 2 (קונוסים)', 'מערך 2 - מבנים קבוצתיים וזוגות (קונוסים)'],
];

for (const [oldName, newName] of RENAMES) {
  const { data: row } = await supabase.from('lesson_plans').select('id').eq('name', oldName).maybeSingle();
  if (!row) {
    console.log(`skip (not found): ${oldName}`);
    continue;
  }
  const { error } = await supabase.from('lesson_plans').update({ name: newName }).eq('id', row.id);
  if (error) console.error(`FAILED ${oldName}:`, error.message);
  else console.log(`${oldName} -> ${newName}`);
}

console.log('\nDone.');
process.exit(0);
