/**
 * Manual perfect styling - Batch 4 (FINAL)
 * מערכים 7-9 מפתיחת שנה + שיווי משקל 3
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const lessons = {
  'פתיחת שנה 7': `
<div class="max-w-4xl mx-auto space-y-6">
  
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 7 - פתיחת שנה ומודעות לגוף</h1>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⏱️</span>
        <h3 class="font-bold text-blue-900">זמן מערך</h3>
      </div>
      <p class="text-gray-700">45-30 דקות</p>
    </div>
    <div class="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">📦</span>
        <h3 class="font-bold text-purple-900">ציוד</h3>
      </div>
      <p class="text-gray-700 text-sm">37 מטפחות, 2 סולמות עם חבלים, 2 מנהרות קפיצים, 12 קונוסים רכים</p>
    </div>
    <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⭐</span>
        <h3 class="font-bold text-green-900">חותמת</h3>
      </div>
      <p class="text-gray-700">דבורה</p>
    </div>
  </div>

  <div class="bg-white border-2 border-blue-200 rounded-xl shadow-md overflow-hidden">
    <div class="bg-blue-100 px-6 py-4 border-b-2 border-blue-200">
      <h2 class="text-2xl font-bold text-blue-900 flex items-center gap-2">
        <span>🎯</span>
        מטרת המפגש
      </h2>
    </div>
    <div class="p-6">
      <ul class="space-y-2">
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-1">•</span>
          <span class="text-gray-700">הילדים ילמדו להקשיב להוראות שאת מנחה אותם</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-1">•</span>
          <span class="text-gray-700">הילדים יכירו צורות שונות של מבנים קבוצתיים (שלשות, זוגות, מעגל, טור)</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-1">•</span>
          <span class="text-gray-700">הילדים ילמדו להכיר איברים שונים בגופם ותנועתם במרחב</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-1">•</span>
          <span class="text-gray-700">הילדים ילמדו לעבוד עם אביזרים שונים</span>
        </li>
      </ul>
    </div>
  </div>

  <div class="bg-white border-2 border-green-200 rounded-xl shadow-md overflow-hidden">
    <div class="bg-green-100 px-6 py-4 border-b-2 border-green-200">
      <h2 class="text-2xl font-bold text-green-900 flex items-center gap-2">
        <span>🚀</span>
        פתיחה: 5 דק'
      </h2>
    </div>
    <div class="p-6 space-y-4">
      
      <div>
        <h3 class="font-bold text-gray-800 mb-2">1. חימום עם מוזיקה - "טריליליטרללה"</h3>
        <p class="text-gray-700 mb-2">מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך.</p>
        <p class="text-gray-700 mb-2">עושים חימום של כל איברי הגוף השונים. מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.</p>
        <p class="text-gray-700">מבקשים מהם ללכת מהר, ואז ממש לאט במהירויות שונות.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. "קוקו לוקו"</h3>
        <p class="text-gray-700 mb-2">שיר לשים ברקע - הליכה במרחב וכל פעם שעוצרים את המוזיקה הם צריכים לעשות פרצוף לחבר בקבוצה.</p>
        <p class="text-gray-700">אפשר להסתדר בשלשות ולעשות את הפרצוף ולבסוף לעשות במעגל אחד גדול פרצוף לכולם (על מנת שהילדים יכירו מבנים קבוצתיים שונים).</p>
        <div class="bg-green-50 rounded-lg p-3 mt-2">
          <p class="text-sm text-gray-700 mb-1">פרצופים לתרגל:</p>
          <ul class="mr-6 space-y-1">
            <li class="text-gray-700 text-sm">• פרצוף מצחיק</li>
            <li class="text-gray-700 text-sm">• פרצוף עצוב</li>
            <li class="text-gray-700 text-sm">• פרצוף מפחיד</li>
            <li class="text-gray-700 text-sm">• פרצוף מבולבל</li>
            <li class="text-gray-700 text-sm">• פרצוף שמח</li>
            <li class="text-gray-700 text-sm">• פרצוף מתוק</li>
            <li class="text-gray-700 text-sm">• פרצוף של קוף, פיל, אריה</li>
          </ul>
        </div>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">3. שיר רקע - "מגלגל חזק את הידיים"</h3>
        <p class="text-gray-700">לפעול ע״פ מילות השיר.</p>
        <p class="text-gray-700 text-sm italic">להזכיר את נושא החודש ולשאול במה שיחקנו בשבוע שעבר.</p>
      </div>

    </div>
  </div>

  <div class="bg-white border-2 border-purple-200 rounded-xl shadow-md overflow-hidden">
    <div class="bg-purple-100 px-6 py-4 border-b-2 border-purple-200">
      <h2 class="text-2xl font-bold text-purple-900 flex items-center gap-2">
        <span>💪</span>
        גוף השיעור: 10 דק'
      </h2>
    </div>
    <div class="p-6 space-y-4">
      
      <div>
        <h3 class="font-bold text-gray-800 mb-2">1. הצגה תיאטרלית של המטפחת</h3>
        <p class="text-gray-700 mb-2">להחביא את המטפחת בתוך כף היד כשרק פינה קטנה מציצה החוצה.</p>
        <p class="text-gray-700 mb-2">לתת לשני ילדים למשוך ממש חלש קצת את המטפחת החוצה ולזרוק רעיונות תוך כדי - אולי זה עלה, נחש, כנף של פרפר...</p>
        <p class="text-gray-700">הילד השני/שלישי מושך את המטפחת כולה ומגלים שזו מטפחת.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. בעמידה - סיבובים</h3>
        <p class="text-gray-700 mb-2">נסובב את המטפחת על איברי הגוף, כל פעם איבר אחר:</p>
        <p class="text-gray-700">מסביב ליד, מסביב לרגל, מסביב למותניים, מסביב לכל הגוף - כמו ציור של עיגול על הרצפה כשאנחנו בתוכו...</p>
        <div class="bg-purple-50 rounded-lg p-3 mt-2">
          <p class="text-sm font-semibold text-gray-800 mb-1">לילדים בגילאי חובה - מקשים את התרגיל:</p>
          <p class="text-sm text-gray-700 mb-1">לסובב את המטפחת על איבר הגוף בעמידות מוצא שונות. לדוגמא:</p>
          <ul class="mr-6 space-y-1">
            <li class="text-gray-700 text-sm">• בעמידה על רגל אחת, על הברך המורמת</li>
            <li class="text-gray-700 text-sm">• בין שתי הרגליים (בעמידה)</li>
            <li class="text-gray-700 text-sm">• על רגל אחת כשהרגל שבאויר מאחורי הגב ולסובב עליה</li>
            <li class="text-gray-700 text-sm">• ציור של שמונה בין הרגליים</li>
          </ul>
        </div>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">3. חקירה משותפת של המטפחת</h3>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• לאחוז במטפחת ולסובב את הידיים בעיגולים קטנים קטנים, קדימה ואחורה</li>
          <li class="text-gray-700">• בואו נרקוד עם המטפחות, בואו נכסה איברים עם המטפחות</li>
          <li class="text-gray-700">• בואו נניף מטפחת למעלה למטה אחורה קדימה</li>
          <li class="text-gray-700">• בואו נקפל את המטפחת ונסתיר אותה עד שלא יראו אותה יותר. לאט לאט נפתח את 2 הידיים עד שתיווצר שושנה יפה. לחזור על זה כמה פעמים - הילדים מאוד אוהבים</li>
        </ul>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">4. מתחלקים לזוגות</h3>
        <p class="text-gray-700 mb-2">כל ילד עם הילד שעומד לידו.</p>
        <p class="text-gray-700 mb-2">מסובבים את המטפחת מסביב לאיברי גופו של החבר.</p>
        <p class="text-gray-700 mb-2">להחליט מי יהיה ראשון לסובב ומי הראשון שמסובבים סביבו. הילד שמסובבים סביבו יושב והילד שמסובב עומד ואז מתחלפים.</p>
        <p class="text-gray-700 text-sm">במידה יש לתת זמן לרעיונות משלהם ואם יש רעיון שמתקשר לגלגולים או סיבובים לבקש מכולם לבצע.</p>
        <p class="text-gray-700 text-sm italic mt-2">💡 בסוף - לעבור עם התיק וכל ילד מחזיר בתורו, לשים לב שכל הילדים מחזירים את המטפחת שלהם</p>
      </div>

    </div>
  </div>

  <div class="bg-white border-2 border-orange-200 rounded-xl shadow-md overflow-hidden">
    <div class="bg-orange-100 px-6 py-4 border-b-2 border-orange-200">
      <h2 class="text-2xl font-bold text-orange-900 flex items-center gap-2">
        <span>🏃</span>
        מסלול: 15 דק'
      </h2>
    </div>
    <div class="p-6 space-y-4">
      
      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 1: סולמות עם חבלים</h3>
        <p class="text-gray-700">2 סולמות עם חבלים מסודרים ב-2 טורים. הילדים צריכים לקפוץ בין כל שלב ושלב של הסולם.</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 2: מנהרות קפיצים</h3>
        <p class="text-gray-700">2 מנהרות קפיצים - הילדים צריכים לזחול בתוך המנהרת קפיצים.</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 3: קונוסים</h3>
        <p class="text-gray-700">6 קונוסים בכל טור (12 סה"כ) - הילדים צריכים לקפוץ מעל הקונוסים.</p>
      </div>

    </div>
  </div>

  <div class="bg-white border-2 border-pink-200 rounded-xl shadow-md overflow-hidden">
    <div class="bg-pink-100 px-6 py-4 border-b-2 border-pink-200">
      <h2 class="text-2xl font-bold text-pink-900 flex items-center gap-2">
        <span>✨</span>
        סיכום: 2 דק'
      </h2>
    </div>
    <div class="p-6 space-y-4">
      
      <p class="text-gray-700 font-semibold">שיר: אפשר להיפרד בשיר פרידה</p>

      <ul class="space-y-2 mr-6">
        <li class="flex items-start gap-2">
          <span class="text-pink-500">•</span>
          <span class="text-gray-700">לעמוד באמצע ולהזמין לחיבוק פרידה מי שרוצה</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-pink-500">•</span>
          <span class="text-gray-700">אפשר לעשות הרפייה על הרצפה, לכבות את האורות בגן ולשים מוזיקה מרגיעה</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-pink-500">•</span>
          <span class="text-gray-700">אפשר להנחות אותם לפתוח את הידיים גדול גדול לצדדים ואז לקרב לאט לאט עד שמגיעים לחיבוק עצמי. לתת נשיקה לכל כתף ולהגיד תודה לגוף שלי</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-pink-500">•</span>
          <span class="text-gray-700">אפשר למתוח את הגוף ולעשות לו מסאז לכל חלק בגוף</span>
        </li>
      </ul>

    </div>
  </div>

  <div class="bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 rounded-xl shadow-lg p-6 text-center">
    <h3 class="text-xl font-bold text-yellow-900 mb-2 flex items-center justify-center gap-2">
      <span>🎖️</span>
      חלוקת חותמת: דבורה
    </h3>
    <p class="text-3xl">🐝</p>
  </div>

  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md py-4">
    <p class="text-xl font-bold">בהצלחה! 🎉</p>
  </div>

</div>
`
};

console.log('Starting batch 4 (final) part 1: מערך 7...');

for (const [name, html] of Object.entries(lessons)) {
  const { data } = await supabase
    .from('lesson_plans')
    .select('id')
    .eq('name', name)
    .single();
  
  if (data) {
    await supabase
      .from('lesson_plans')
      .update({ content: html })
      .eq('id', data.id);
    console.log(`✅ ${name}`);
  }
}

console.log('✨ Batch 4 part 1 complete!');
process.exit(0);
