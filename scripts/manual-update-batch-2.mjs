/**
 * Manual perfect styling - Batch 2
 * מערכים 3-9 מפתיחת שנה + שיווי משקל 3
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
  'פתיחת שנה 3': `
<div class="max-w-4xl mx-auto space-y-6">
  
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 3 - פתיחת שנה ומודעות לגוף</h1>
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
      <p class="text-gray-700 text-sm">37 כדורי טניס, 12 כדורי דריכה, 2 קונוסים, 4 טבעות, 4 משוכות</p>
    </div>
    <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⭐</span>
        <h3 class="font-bold text-green-900">חותמת</h3>
      </div>
      <p class="text-gray-700">דג</p>
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
        <h3 class="font-bold text-gray-800 mb-2">1. חימום עם מוזיקה - "יד ביד"</h3>
        <p class="text-gray-700">לפי מילות השיר, בעמידה במרחב / בזוגות / במעגל</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. משחק "מולקולות"</h3>
        <p class="text-gray-700 mb-2">הילדים הולכים במרחב ואז את מכריזה בקול על מספר - 4. הילדים צריכים להתחבר עם ילדים כדי ליצור קבוצה של 4 (4 ילדים בקבוצה).</p>
        <p class="text-gray-700 mb-2">לאחר מכן הילדים חוזרים להסתובב בחדר ואת מכריזה מספר 2, הילדים צריכים להתחלק לזוגות.</p>
        <p class="text-gray-700 text-sm italic">💡 לא תמיד כל הילדים יצליחו להתחלק וזה בסדר, לשים לב לא להשאיר אותם בקבוצות הרבה זמן</p>
        <p class="text-gray-700 text-sm italic">💡 אם הקבוצה היא בוגרת אפשר גם לחלק אותם למספרים גדולים – 12, 22, 16 ואז זה יאתגר אותם</p>
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
      
      <p class="text-gray-700 font-semibold">חלוקה לכל ילד כדור טניס בישיבה וחקירה של הכדור ביחד עם איברי גוף שונים.</p>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">1. מסאז' עם הכדור</h3>
        <p class="text-gray-700 mb-2">מתחילים לעשות מסאז' עם הכדור על איברים שונים. ומנחים את הילדים לעשות מסאז' מהראש עד לכפות הרגליים.</p>
        <p class="text-gray-700">בדרך אומרים את האיברים בקול: ראש, צוואר, עורף, כתף ימין ושמאל, זרועות, בטן, אגן, גב, ירכיים, ברכיים, שוקיים, כפות רגליים</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. חוקרים יחד את הכדור</h3>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• לשאול את הילדים איזה מרקם יש לכדור? (מחוספס, חלק)</li>
          <li class="text-gray-700">• לשאול אותם איזה צבע הכדור?</li>
          <li class="text-gray-700">• לשאול אותם אם הוא קשה או רך?</li>
          <li class="text-gray-700">• לשאול אותם אם הוא קל או כבד?</li>
        </ul>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">3. איזון הכדור</h3>
        <p class="text-gray-700 mb-2">מבקשים מהם להרים את הכדור הכי גבוה שיש, לגעת עם הכדור ברצפה, לנסות לאזן אותו על כף יד אחת ואז על כף יד השנייה.</p>
        <p class="text-gray-700">מבקשים מהם לאזן את הכדור על איברים שונים בגוף.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">4. עבודה בזוגות</h3>
        <p class="text-gray-700 mb-2">מבקשים מהילדים לעמוד ולהתחלק לזוגות. הם צריכים לשבת מול הזוג שלהם ולגלגל את הכדור אחד לשני.</p>
        <p class="text-gray-700 mb-2">אם זה קל אפשר למסור אותו (ביד אחת עם אם שתי ידיים).</p>
        <p class="text-gray-700 text-sm italic">💡 אפשר לשחק עם רמות הקושי של מסירת הכדור. אפשר לשחק עם הגובה. אפשר לשחק עם המרחק שהם יושבים אחד מול השנייה או הדרך בה הם יושבים/שוכבים</p>
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
      
      <p class="text-gray-700 mb-2">שיר רקע: "הילדים קופצים"</p>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 1: כיפות דריכה</h3>
        <p class="text-gray-700">בתחילת המסלול יש 2 טורים של 6 כיפות דריכה. הם צריכים ללכת מכיפה לכיפה והם יכולים ללכת רגל רגל או רגל ולהצמיד אליה את השנייה.</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 2: קליעה לטבעת</h3>
        <p class="text-gray-700">לקלוע טבעת על קונוס - 2 קונוסים ו-2 טבעות (אחת לכל טור).</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 3: זחילה מתחת למשוכות</h3>
        <p class="text-gray-700">לזחול מתחת ל-2 משוכות לכל טור (4 סה"כ).</p>
      </div>

      <p class="text-gray-700 text-sm italic mt-4">💡 אם הילדים מסיימים את המסלול מהר אפשר לעשות כמה סבבים. אפשר לשים מוזיקה תוך כדי.</p>

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
      חלוקת חותמת: דג
    </h3>
    <p class="text-3xl">🐟</p>
  </div>

  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md py-4">
    <p class="text-xl font-bold">בהצלחה! 🎉</p>
  </div>

</div>
`,
// Continue in next file due to size...
};

console.log('Starting batch 2 (part 1): פתיחת שנה 3...');

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

console.log('✨ Batch 2 part 1 complete!');
process.exit(0);
