/**
 * Adds the 38 new equipment-station lesson plans (מערך 3 - מערך 40) provided on 2026-09-29.
 * "מערך 1" and "מערך 2" already exist as the 10 "פתיחת שנה, היכרות וכללי בסיס" plans
 * (היכרות ואות העצירה 1 / מבנים קבוצתיים וזוגות 2 variants) — nothing to add for those.
 *
 * All 38 share category "מערכים חדשים - תחנות ציוד" so the dropdown can group/reorder them
 * as one block. week_number just needs to be unique and is not used for real calendar
 * scheduling here — continuing after the current max.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const NEW_CATEGORY = 'מערכים חדשים - תחנות ציוד';

const SETS = [
  { n: 3, title: 'חקירה עצמית ולחץ עמוק', equipment: [['כריות שעועית', 40], ['נודלים', 10], ['מזרנים צבעוניים', 4]] },
  { n: 4, title: 'מגע מכבד עם חבר', equipment: [['כריות שעועית', 40], ['נודלים', 10], ['מזרנים צבעוניים', 4]] },
  { n: 5, title: 'מתיחה ותנועה ליד חבר', equipment: [['גומיות אישיות', 40], ['חבל משיכה לבן', 1]] },
  { n: 6, title: 'משיכה הדדית ואמון', equipment: [['גומיות אישיות', 40], ['חבל משיכה לבן', 1], ['כיפות סימון', 8]] },
  { n: 7, title: 'עצירה על איתות ושינוי כיוון', equipment: [['קונוסים רגילים', 20], ['נקודות סימון', 15], ['חצים צהובים', 4]] },
  { n: 8, title: 'סלאלום ותופסת מבוקרת', equipment: [['קונוסים רגילים', 20], ['ידיים מגומי', 10], ['רגליים מגומי', 10]] },
  { n: 9, title: 'עמידה יציבה ובקרת גוף', equipment: [['קורות עץ', 4], ['צלחת מסתובבת', 1], ['חצי כריות אוויר סגולות', 5], ['מזרנים צבעוניים', 3]] },
  { n: 10, title: 'הליכה על קורה ומשטחים משתנים', equipment: [['קורות עץ', 4], ['קורות פלציב', 1], ['אבני דריכה', 8], ['מזרנים צבעוניים', 3]] },
  { n: 11, title: 'תורות וחלוקת תפקידים', equipment: [['כדורים חלקים צבעוניים', 40], ['דליים קטנים', 6], ['דליים גדולים', 2]] },
  { n: 12, title: 'עבודה בקבוצה קטנה', equipment: [['כדורים חלקים צבעוניים', 10], ['מקלות פעילות ארוכים', 8], ['ביצים', 40], ['כפות פלסטיק', 40], ['מסילות לכדורים', 1]] },
  { n: 13, title: 'קפיצות בשתי רגליים', equipment: [['חבלים אישיים', 40]] },
  { n: 14, title: 'מסלול קפיצות משולב', equipment: [['חבלים אישיים', 40], ['מנהרות קפיצים', 2], ['סולמות', 2]] },
  { n: 15, title: 'נשימה עם עוגן פיזי', equipment: [['מטפחות', 40], ['חבלים אישיים', 6]] },
  { n: 16, title: 'שקט וסערה', equipment: [['מטפחות', 40]] },
  { n: 17, title: 'חיקוי ומעברי חישוק', equipment: [['חישוקים שטוחים', 40], ['חישוקים עם חיבורים', 8]] },
  { n: 18, title: 'שרשרת הקשבה', equipment: [['חישוקים שטוחים', 15], ['תופסנים לחישוקים', 10], ['כובע סביבון', 3]] },
  { n: 19, title: 'זריקה עצמית ותפיסה קרובה', equipment: [['כדורי ספוג', 40], ['כדורי ג\'אגלינג', 40], ['צלחות מעופפות', 15]] },
  { n: 20, title: 'זריקה לחבר ולמטרה', equipment: [['כדורי ספוג', 40], ['טבעות פלסטיק', 15], ['דליים קטנים', 6]] },
  { n: 21, title: 'מנוע מהיר, מנוע איטי', equipment: [['הגאים להחזקה', 20], ['סקוטרים', 2], ['קונוסים רגילים', 20], ['חבלים ארוכים', 1]] },
  { n: 22, title: 'שולטים במנוע שלנו', equipment: [['הגאים להחזקה', 20], ['סקוטרים', 2], ['קונוסים רגילים', 20]] },
  { n: 23, title: 'גלים במצנח', equipment: [['מצנח פעילות גדול', 1], ['כדורי ספוג', 6]] },
  { n: 24, title: 'משחקי מצנח', equipment: [['מצנח פעילות גדול', 1], ['כדורי ספוג', 6]] },
  { n: 25, title: 'מאזנים על המקל', equipment: [['מקלות שיווי משקל', 40]] },
  { n: 26, title: 'קביים וצלחת מסתובבת', equipment: [['זוגות קביים מפלסטיק', 4], ['צלחת מסתובבת', 1], ['מקלות שיווי משקל', 40], ['מזרנים צבעוניים', 1]] },
  { n: 27, title: 'רעש ושקט', equipment: [['צמידי פעמון', 40], ['כדורים רעשנים', 6]] },
  { n: 28, title: 'מרגישים ונרגעים', equipment: [['צמידי פעמון', 40], ['כריות אוויר', 2], ['קוביות יוגה וספוג קשה', 4], ['מזרנים צבעוניים', 1]] },
  { n: 29, title: 'בונים מסלול יחד', equipment: [['חבלים ארוכים', 1], ['קונוסים גדולים מחוררים', 8], ['משוכות בגבהים שונים', 8]] },
  { n: 30, title: 'משימת הצוות הגדולה', equipment: [['חבלים ארוכים', 1], ['קונוסים גדולים מחוררים', 4], ['מקלות פעילות ארוכים', 6], ['תופסנים לחישוקים', 2], ['חישוקים שטוחים', 2], ['מסילות לכדורים', 1]] },
  { n: 31, title: 'הכדור ברגליים', equipment: [['כדורי גומי', 20], ['קונוסים גדולים מחוררים', 2], ['מקלות פעילות ארוכים', 1]] },
  { n: 32, title: 'שער!', equipment: [['כדורי גומי', 20], ['קונוסים גדולים מחוררים', 4], ['מקלות פעילות ארוכים', 3]] },
  { n: 33, title: 'מתנדנדים לאט', equipment: [['נדנדות', 2], ['משטחים נגד החלקה', 1], ['מזרנים צבעוניים', 1]] },
  { n: 34, title: 'מסתובבים בעדינות', equipment: [['קרוסלות עץ', 2], ['משטחים נגד החלקה', 1], ['מזרנים צבעוניים', 1]] },
  { n: 35, title: 'איך מפילים את כולם', equipment: [['בקבוקי באולינג', 15], ['כדורי ספוג', 10]] },
  { n: 36, title: 'ממציאים משחק', equipment: [['בקבוקי באולינג', 15], ['כפות פלסטיק', 1], ['ביצים', 15]] },
  { n: 37, title: 'קולעים לחישוק', equipment: [['כדורי ספוג', 40], ['טבעות פלסטיק', 40], ['קונוסים גדולים מחוררים', 2], ['מקלות פעילות ארוכים', 1], ['תופסנים לחישוקים', 2], ['חישוקים שטוחים', 1]] },
  { n: 38, title: 'תחרות קליעה ידידותית', equipment: [['כדורי ספוג', 40], ['טבעות פלסטיק', 40], ['דליים קטנים', 4]] },
  { n: 39, title: 'הכף והכדור', equipment: [['הכף והכדור', 40], ['מחבטי טניס', 8], ['כריות שעועית', 40]] },
  { n: 40, title: 'מכים בכדור בעדינות', equipment: [['מחבטי טניס', 32], ['כדורי ספוג', 40], ['הכף והכדור', 40]] },
];

const { data: existing } = await supabase.from('lesson_plans').select('week_number').order('week_number', { ascending: false }).limit(1);
let nextWeek = (existing?.[0]?.week_number ?? 0) + 1;

for (const set of SETS) {
  const name = `מערך ${set.n} - ${set.title}`;

  const { data: dup } = await supabase.from('lesson_plans').select('id').eq('name', name).maybeSingle();
  if (dup) {
    console.log(`skip (already exists): ${name}`);
    continue;
  }

  const { data: plan, error: planErr } = await supabase
    .from('lesson_plans')
    .insert({ week_number: nextWeek, name, category: NEW_CATEGORY })
    .select('id')
    .single();

  if (planErr) {
    console.error(`FAILED to create ${name}:`, planErr.message);
    continue;
  }
  nextWeek++;

  for (const [equipmentName, quantity] of set.equipment) {
    const { data: eq, error: eqErr } = await supabase
      .from('equipment')
      .select('id')
      .eq('name', equipmentName)
      .maybeSingle();

    if (eqErr || !eq) {
      console.error(`  MISSING equipment "${equipmentName}" for ${name}`);
      continue;
    }

    const { error: lpeErr } = await supabase
      .from('lesson_plan_equipment')
      .insert({ lesson_plan_id: plan.id, equipment_id: eq.id, quantity, equipment_type: 'main' });

    if (lpeErr) console.error(`  FAILED to link ${equipmentName} to ${name}:`, lpeErr.message);
  }

  console.log(`created: ${name} (${set.equipment.length} equipment rows)`);
}

console.log('\nDone.');
process.exit(0);
