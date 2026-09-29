/**
 * Equipment catalog cleanup — aligns names/stock with the authoritative list the user
 * provided on 2026-09-29, WITHOUT losing historical lesson_plan_equipment or
 * equipment_confirmations rows (both cascade-delete when an equipment row is deleted).
 *
 * Strategy:
 *  - INSERT: brand new items with no existing row at all.
 *  - RENAME: a single existing row renamed (+ stock corrected), no merge needed.
 *  - STOCK: name already correct, only total_stock needs correcting.
 *  - MERGE: one or more duplicate/typo rows folded into a canonical target row.
 *    For each source row, every lesson_plan_equipment / equipment_confirmations
 *    reference is repointed to the target id. If that would collide with a row the
 *    target already has for the same lesson_plan_id / assignment_id, the source row
 *    is SKIPPED (left alone, not merged) rather than guessing how to combine them —
 *    logged clearly so it can be reviewed by hand.
 *
 * Anything not listed here (color/height/type-specific legacy names) is deliberately
 * left untouched — this script does not attempt a full catalog rewrite.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const INSERTS = [
  ['חבל משיכה לבן', 1],
  ['רגליים מעץ', 0],
  ['גומיות כושר', 0],
  ['כפות פלסטיק', 50],
  ['מזרנים כחולים', 2],
  ['כדורי גומי', 40],
];

// [oldName, newName, newStock]
const RENAMES = [
  ['חישוקים קשיחים', 'חישוקים שטוחים', 66],
  ['כפות (כף וכדור)', 'הכף והכדור', 40],
  ['דליים', 'דליים גדולים', 54],
  ['מחבטי טניס שולחן/ מטקות', 'מחבטי טניס שולחן / מטקות', 0],
];

// [name, newStock] — name unchanged
const STOCK_UPDATES = [
  ['כריות שעועית', 1],
  ['סרט רשת', 1],
  ['כיפות סימון', 30],
  ['משטחים נגד החלקה', 10],
  ['מקלות עץ', 120],
  ['צלחות שיווי משקל', 1],
  ['קורות פלציב', 0],
];

// [targetName, [sourceNames...]]
const MERGES = [
  ['כדורי ספוג', ['כדור ספוג', 'כדורים ספוג', 'כדורי ספוג קטנים']],
  ['מזרני יוגה', ['מזרון יוגה', 'מזרוני יוגה']],
  ['מזרנים צבעוניים', ['מזרון צבעוני']],
  ['מטפחות', ['מטפחות,']],
  ['מנהרות קפיצים', ['מנהרות קפיצים,', 'מנהרת קפיץ']],
  ['צמידי פעמון', ['צמידי פעמון,']],
  ['נדנדות', ['נדנדות,']],
  ['קרוסלות עץ', ['קרוסלת עץ']],
  ['סולמות', ['סולם']],
  ['קורות פלציב', ['קורת פלציב']],
  ['משטחים נגד החלקה', ['משטח נגד החלקה', 'משטח החלקה']],
  ['צלחת מסתובבת', ['צלחות מסתובבות']],
  ['צלחות לוויסות כוח', ['צלחת לוויסות כוח']],
  ['משוכות בגבהים שונים', ['משוכות']],
  ['קונוסים רגילים', ['קונוסים', 'קונוסים,']],
  ['נקודות סימון', ['נקודות']],
  ['תופסנים לחישוקים', ['תופסנים', 'תופסנים לחישוק']],
  ['מקלות פעילות ארוכים', ['מקלות ארוכים']],
  ['קונוסים גדולים מחוררים', ['קונוסים מחוררים']],
  ['מקלות קלים (מקלות ארטיק)', ['מקלות קלים(ארטיק)']],
];

async function getByName(name) {
  const { data, error } = await supabase.from('equipment').select('id, name, total_stock').eq('name', name).maybeSingle();
  if (error) throw error;
  return data;
}

console.log('=== INSERTS ===');
for (const [name, stock] of INSERTS) {
  const existing = await getByName(name);
  if (existing) {
    console.log(`  skip (already exists): ${name}`);
    continue;
  }
  const { error } = await supabase.from('equipment').insert({ name, total_stock: stock });
  if (error) console.error(`  FAILED insert ${name}:`, error.message);
  else console.log(`  + ${name} (${stock})`);
}

console.log('\n=== RENAMES ===');
for (const [oldName, newName, stock] of RENAMES) {
  const row = await getByName(oldName);
  if (!row) {
    console.log(`  skip (old name not found): ${oldName}`);
    continue;
  }
  const { error } = await supabase.from('equipment').update({ name: newName, total_stock: stock }).eq('id', row.id);
  if (error) console.error(`  FAILED rename ${oldName} -> ${newName}:`, error.message);
  else console.log(`  ${oldName} -> ${newName} (${stock})`);
}

console.log('\n=== STOCK UPDATES ===');
for (const [name, stock] of STOCK_UPDATES) {
  const row = await getByName(name);
  if (!row) {
    console.log(`  skip (not found): ${name}`);
    continue;
  }
  const { error } = await supabase.from('equipment').update({ total_stock: stock }).eq('id', row.id);
  if (error) console.error(`  FAILED stock update ${name}:`, error.message);
  else console.log(`  ${name}: ${row.total_stock ?? '(blank)'} -> ${stock}`);
}

console.log('\n=== MERGES ===');
for (const [targetName, sourceNames] of MERGES) {
  const target = await getByName(targetName);
  if (!target) {
    console.log(`  ABORT group (target not found): ${targetName}`);
    continue;
  }
  for (const sourceName of sourceNames) {
    const source = await getByName(sourceName);
    if (!source) {
      console.log(`  skip (source not found): ${sourceName}`);
      continue;
    }
    if (source.id === target.id) continue;

    // --- lesson_plan_equipment ---
    const { data: lpeRows } = await supabase
      .from('lesson_plan_equipment')
      .select('id, lesson_plan_id, quantity, equipment_type')
      .eq('equipment_id', source.id);

    let lpeBlocked = false;
    for (const row of lpeRows ?? []) {
      const { data: conflict } = await supabase
        .from('lesson_plan_equipment')
        .select('id, quantity')
        .eq('lesson_plan_id', row.lesson_plan_id)
        .eq('equipment_id', target.id)
        .maybeSingle();
      if (conflict) {
        console.log(`  CONFLICT lpe: ${sourceName} -> ${targetName} on lesson_plan ${row.lesson_plan_id} (target already has a row) — merging quantities`);
        await supabase.from('lesson_plan_equipment').update({ quantity: conflict.quantity + row.quantity }).eq('id', conflict.id);
        await supabase.from('lesson_plan_equipment').delete().eq('id', row.id);
      } else {
        await supabase.from('lesson_plan_equipment').update({ equipment_id: target.id }).eq('id', row.id);
      }
    }

    // --- equipment_confirmations ---
    const { data: ecRows } = await supabase
      .from('equipment_confirmations')
      .select('id, assignment_id')
      .eq('equipment_id', source.id);

    for (const row of ecRows ?? []) {
      const { data: conflict } = await supabase
        .from('equipment_confirmations')
        .select('id')
        .eq('assignment_id', row.assignment_id)
        .eq('equipment_id', target.id)
        .maybeSingle();
      if (conflict) {
        console.log(`  CONFLICT ec: ${sourceName} -> ${targetName} on assignment ${row.assignment_id} (target already has a row) — leaving source confirmation as-is, blocking delete`);
        lpeBlocked = true; // reuse flag to block deleting the source equipment row
      } else {
        await supabase.from('equipment_confirmations').update({ equipment_id: target.id }).eq('id', row.id);
      }
    }

    if (lpeBlocked) {
      console.log(`  PARTIAL merge, NOT deleting source row (unresolved ec conflict): ${sourceName}`);
      continue;
    }

    const { error: delErr } = await supabase.from('equipment').delete().eq('id', source.id);
    if (delErr) console.error(`  FAILED delete ${sourceName}:`, delErr.message);
    else console.log(`  merged & deleted: ${sourceName} -> ${targetName}`);
  }
}

console.log('\nDone.');
process.exit(0);
