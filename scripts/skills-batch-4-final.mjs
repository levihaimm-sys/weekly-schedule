import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const lessons = {
  'מיומנות יסוד 10': `
<div class="max-w-4xl mx-auto space-y-6">
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 10 - מיומנויות יסוד ותנועה במרחב</h1>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⏱️</span>
        <h3 class="font-bold text-blue-900">זמן מערך</h3>
      </div>
      <p class="text-gray-700">45-30 דקות</p>
    </div>

    <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">🎯</span>
        <h3 class="font-bold text-green-900">ציוד</h3>
      </div>
      <p class="text-gray-700 text-sm">37 מערוך מעץ, 5 חצים צהובים, 8 חישוקים עם תופסנים, 8 ריבועי סימון</p>
    </div>

    <div class="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">🦚</span>
        <h3 class="font-bold text-purple-900">חותמת</h3>
      </div>
      <p class="text-gray-700">טווס</p>
    </div>
  </div>

  <div class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 shadow-md border border-yellow-200">
    <h2 class="text-2xl font-bold text-orange-800 mb-4 flex items-center gap-2">
      <span>🎯</span>
      מטרות המפגש
    </h2>
    <ul class="space-y-2 text-gray-700">
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>הילדים יכירו כיוונים שונים - לצדדים, קדימה, אחורה, מעל, מתחת, ליד, בתוך ומחוץ</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>גלגול והכרות עם המושג סיבוב</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>תנועה בכיוונים שונים וברמות גובה שונות</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>תנועה במסלולים שונים (ישר, זיג זג, עגול, מפותל, סיבוב) עם ובלי אביזר</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>תנועה במרחב הכללי באופני התקדמות שונים</span>
      </li>
    </ul>
    <div class="mt-4 bg-orange-100 rounded-lg p-3">
      <p class="text-sm text-orange-900 font-semibold">
        ⚠️ חשוב מאוד להתייחס למושגי היסוד במשך כל ההפעלה כדי שהילדים ילמדו את המושגים ברמה הגופנית וברמה המילולית
      </p>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">🌅</span>
      <h2 class="text-2xl font-bold text-blue-800">פתיחה - 5 דקות</h2>
    </div>
    
    <div class="space-y-4">
      <div class="bg-blue-50 rounded-lg p-4">
        <h3 class="font-bold text-blue-900 mb-2 flex items-center gap-2">
          <span>🎵</span>
          1. חימום עם מוזיקה - אני פנתרה
        </h3>
        <p class="text-gray-700 leading-relaxed">
          מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך. עושים חימום של כל איברי הגוף השונים.
          מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.
          מבקשים מהם ללכת מהר, ואז ממש לאט במהירויות שונות.
        </p>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <h3 class="font-bold text-green-900 mb-2 flex items-center gap-2">
          <span>🎶</span>
          2. שיר "עכביש קטן ועכביש גדול"
        </h3>
        <p class="text-gray-700">נזוז לפי מילות השיר. להזכיר את נושא החודש ולשאול במה שיחקנו בשבוע שעבר.</p>
      </div>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">⚡</span>
      <h2 class="text-2xl font-bold text-green-800">גוף השיעור - 10 דקות</h2>
    </div>
    
    <div class="space-y-4">
      <div class="bg-yellow-50 rounded-lg p-4 border-r-4 border-yellow-500">
        <p class="text-gray-700 leading-relaxed">
          נחלק לכל ילד מערוך. ונחקור יחד מה אפשר לעשות איתו:
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="bg-blue-50 rounded-lg p-3">
          <h4 class="font-bold text-blue-800 mb-1">1. מתיחה למעלה 🙆</h4>
          <p class="text-sm text-gray-700">ידיים מחזיקות בידיות המערוך מותחים את הידיים גבוהה גבוהה למעלה ומנדנדים מצד לצד, למתוח את הצלעות</p>
        </div>

        <div class="bg-green-50 rounded-lg p-3">
          <h4 class="font-bold text-green-800 mb-1">2-3. מתיחה למטה ⬇️</h4>
          <p class="text-sm text-gray-700">לחזור לאמצע ולרדת הכי נמוך שאנחנו יכולים והכי רחוק עד שניגע בריצפה. ונחזור הכי גבוהה עם הידיים למעלה</p>
        </div>

        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-bold text-purple-800 mb-1">4-5. גלגול קדימה 🧘</h4>
          <p class="text-sm text-gray-700">נתחיל בלשבת ישיבה מזרחית או ישיבת בייגלה - נדביק את הישבן ברצפה. נניח את המערוך על הריצפה ונגלגל אותו קדימה את הידיים הכי רחוק שאנחנו יכולים מבלי להרים את הישבן, נעצור ונספור עד חמש ונחזור בחזרה. נעשה את התרגיל פעמיים שלוש</p>
        </div>

        <div class="bg-pink-50 rounded-lg p-3">
          <h4 class="font-bold text-pink-800 mb-1">6-7. גלגול על הגוף 🎯</h4>
          <p class="text-sm text-gray-700">נניח את המערוך על הראש ונגלגל את המערוך על כל אברי הגוף עד הרגליים: ראש, עיניים, אף, פה, סנטר, צוואר, בית החזה, בטן, ירכיים, ברכיים עד לקצות האצבעות. נשאיר את המערוך על קצות האצבעות ונספור עד שלוש. ונחזור כשאנו מגלגלים את המערוך הכי מהר שאנחנו יכולים חזרה אל הראש ונשמיע קול מצחיק. נחזור על הפעולה שוב</p>
        </div>
      </div>

      <div class="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">8. תרגיל מאחורי הגב 🔄</h3>
        <p class="text-gray-700 text-sm mb-2">נניח את המערוך על הריצפה, נשים יד אחת מאחורי הגב. עם היד השנייה נרים את המערוך מהידית ונרים את היד מעל הראש. נוריד את המערוך אל מאחורי הגב וננסה לתפוס עם היד השנייה את המערוך מאחורי הגב.</p>
        <p class="text-red-600 text-sm font-semibold">⚠️ יהיה להם מאוד קשה לבצע את הפעולה, לכן, נחזור עליה לפחות 3 או 4 פעמים, כל פעם את כל ההוראה מהתחלה, כולל להניח את המערוך. ואז ננסה הפוך עם היד השנייה</p>
      </div>

      <div class="bg-teal-50 rounded-lg p-4">
        <h3 class="font-bold text-teal-900 mb-2">9. גלגול עם הרגליים 🦶</h3>
        <p class="text-gray-700 text-sm">נניח את המערוך על הריצפה, נניח עליו את שתי כפות הרגליים ונחזיק את כפות הרגליים עם הידיים. ננסה לגלגל את המערוך הכי רחוק שאנחנו יכולים מבלי לעזוב את הידיים מהרגליים ובחזרה, כמה פעמים.</p>
        <p class="text-orange-600 text-sm italic mt-2">הילדים יעזבו את הידיים מהרגליים ורק יגלגלו עם הרגליים, אנחנו רוצים לעבוד על חגורת הכתפיים, לכן נדגיש להם שלא עוזבים את הרגליים</p>
      </div>

      <div class="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4">
        <h3 class="font-bold text-purple-900 mb-2 flex items-center gap-2">
          <span>🎵</span>
          10. עבודה בזוגות - נד נד נדנדה
        </h3>
        <p class="text-gray-700 text-sm mb-2">נתחלק לזוגות בעמידה, נשים את השיר נד נד נדנדה. פנים מול פנים, מחזיקים במערוך ביחד:</p>
        <ul class="space-y-1 text-sm text-gray-700 mr-4">
          <li>• ילד אחד מיישר את המרפקים וילד שני מכופף</li>
          <li>• בפזמון ילד אחד מרים את המרפק הצידה ואז הילד השני</li>
          <li>• נדנדה קדימה ואחורה ונדנדה מצד אל צד</li>
        </ul>
      </div>

      <div class="bg-blue-50 rounded-lg p-4">
        <h3 class="font-bold text-blue-900 mb-2">11. אם נשאר זמן 🐴</h3>
        <p class="text-gray-700 text-sm">אפשר לשים את השיר דוהר כמו סוס עם המערוך בין הרגליים</p>
      </div>

      <div class="bg-red-50 rounded-lg p-3">
        <p class="text-gray-700 font-semibold">חוזרים לשבת במקום עם המערוך, לעבור עם התיק ולוודא שכל הילדים מחזירים אותו חזרה לתיק</p>
      </div>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">🏃</span>
      <h2 class="text-2xl font-bold text-purple-800">מסלול - 15 דקות</h2>
    </div>
    
    <div class="space-y-3">
      <div class="bg-purple-50 rounded-lg p-4">
        <h3 class="font-bold text-purple-900 mb-2">1. חצים צהובים ➡️</h3>
        <p class="text-gray-700 text-sm">5 חצים צהובים - נסדר אותם בזיגזג נעמוד מעליהם - ולא עליהם - עם רגליים פסוקות. נניח את הידיים קדימה על הריצפה בפיסוק ונתקדם קדימה כשכפות הידיים והרגליים על הריצפה</p>
      </div>

      <div class="bg-pink-50 rounded-lg p-4">
        <h3 class="font-bold text-pink-900 mb-2">2. חישוקים עם תופסנים ⭕</h3>
        <p class="text-gray-700 text-sm">8 חישוקים עם תופסנים - נסדר אותם מחוברים בזיגזג, 2 לכל כיוון. כפות הרגליים בתוך החישוק, כפות הידיים מונחות על הריצפה מחוץ לחישוק. מתקדמים בהליכה על קצות האצבעות בתוך החישוק וידיים בחוץ</p>
      </div>

      <div class="bg-blue-50 rounded-lg p-4">
        <h3 class="font-bold text-blue-900 mb-2">3. ריבועי סימון 🐰</h3>
        <p class="text-gray-700 text-sm">8 ריבועי סימון - מסדרים את הריבועים ברווחים שווים, אחד לימין ואחד לשמאל. צריך לקפוץ מצד לצד בהתקדמות קדימה קפיצת ארנבת: מניחים ידיים קדימה ואז קופצים עם הרגליים מבלי להרים את הידיים</p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl shadow-lg p-6">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">👋</span>
      <h2 class="text-2xl font-bold text-purple-800">סיכום - 2 דקות</h2>
    </div>
    
    <div class="space-y-2 text-gray-700">
      <p class="font-semibold">שיר פרידה - אפשרויות:</p>
      <ul class="space-y-1 mr-4">
        <li>• לעמוד באמצע ולהזמין לחיבוק פרידה מי שרוצה</li>
        <li>• הרפייה על הרצפה, לכבות את האורות בגן ולשים מוזיקה מרגיעה</li>
        <li>• לפתוח את הידיים גדול גדול לצדדים ואז לקרב לאט לאט עד שמגיעים לחיבוק עצמי. לתת נשיקה לכל כתף ולהגיד תודה לגוף שלי</li>
        <li>• למתוח את הגוף ולעשות לו מסאז לכל חלק בגוף</li>
      </ul>
    </div>
  </div>

  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-xl shadow-lg p-6">
    <p class="text-2xl font-bold">🦚 חלוקת חותמת: טווס</p>
    <p class="text-xl mt-2">בהצלחה! 🌟</p>
  </div>
</div>
  `,

  'מיומנות יסוד 11': `
<div class="max-w-4xl mx-auto space-y-6">
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 11 - מיומנויות יסוד ותנועה במרחב</h1>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⏱️</span>
        <h3 class="font-bold text-blue-900">זמן מערך</h3>
      </div>
      <p class="text-gray-700">45-30 דקות</p>
    </div>

    <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">🎯</span>
        <h3 class="font-bold text-green-900">ציוד</h3>
      </div>
      <p class="text-gray-700">37 צלחות מעופפות ורשת טניס</p>
    </div>

    <div class="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">🦋</span>
        <h3 class="font-bold text-purple-900">חותמת</h3>
      </div>
      <p class="text-gray-700">פרפר</p>
    </div>
  </div>

  <div class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 shadow-md border border-yellow-200">
    <h2 class="text-2xl font-bold text-orange-800 mb-4 flex items-center gap-2">
      <span>🎯</span>
      מטרות המפגש
    </h2>
    <ul class="space-y-2 text-gray-700">
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>הילדים יכירו כיוונים שונים - לצדדים, קדימה, אחורה, מעל, מתחת, ליד, בתוך ומחוץ</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>גלגול והכרות עם המושג סיבוב</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>תנועה בכיוונים שונים וברמות גובה שונות</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>תנועה במסלולים שונים (ישר, זיג זג, עגול, מפותל, סיבוב) עם ובלי אביזר</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>תנועה במרחב הכללי באופני התקדמות שונים</span>
      </li>
    </ul>
    <div class="mt-4 bg-orange-100 rounded-lg p-3">
      <p class="text-sm text-orange-900 font-semibold">
        ⚠️ חשוב מאוד להתייחס למושגי היסוד במשך כל ההפעלה כדי שהילדים ילמדו את המושגים ברמה הגופנית וברמה המילולית
      </p>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">🌅</span>
      <h2 class="text-2xl font-bold text-blue-800">פתיחה - 5 דקות</h2>
    </div>
    
    <div class="space-y-4">
      <div class="bg-blue-50 rounded-lg p-4">
        <h3 class="font-bold text-blue-900 mb-2 flex items-center gap-2">
          <span>🎵</span>
          1. חימום עם מוזיקה - אני פנתרה
        </h3>
        <p class="text-gray-700 leading-relaxed">
          מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך. עושים חימום של כל איברי הגוף השונים.
          מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.
          מבקשים מהם ללכת מהר, ואז ממש לאט במהירויות שונות.
        </p>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <h3 class="font-bold text-green-900 mb-2 flex items-center gap-2">
          <span>🎶</span>
          2. חימום באנגלית - shoulder & head
        </h3>
        <p class="text-gray-700">לפי מילות השיר</p>
      </div>

      <div class="bg-purple-50 rounded-lg p-4">
        <h3 class="font-bold text-purple-900 mb-2 flex items-center gap-2">
          <span>🐟</span>
          3. משחק 123 דג מלוח
        </h3>
        <p class="text-gray-700 mb-2">כל פעם שאת מסתובבת הם צריכים לעמוד בתנוחה אחרת. לפני שאת סופרת את אומרת להם איזה תנוחה:</p>
        <ul class="space-y-1 text-sm text-gray-700 mr-4">
          <li>• לעמוד עמידת כוכב</li>
          <li>• לעמוד על רגל אחת</li>
          <li>• לשכב על הרצפה</li>
          <li>• לשבת ישיבה שלמה</li>
        </ul>
        <p class="text-gray-600 text-sm italic mt-2">לשאול מה היה הנושא שסיימנו שבוע שעבר ולחשוף אותם לנושא החדש</p>
      </div>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">⚡</span>
      <h2 class="text-2xl font-bold text-green-800">גוף השיעור - 10 דקות</h2>
    </div>
    
    <div class="space-y-4">
      <div class="bg-yellow-50 rounded-lg p-4 border-r-4 border-yellow-500">
        <p class="text-gray-700 leading-relaxed font-semibold">
          מחלקים לכל ילד צלחת מעופפת
        </p>
      </div>

      <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-5 border-2 border-orange-300">
        <h3 class="font-bold text-orange-900 mb-3 text-lg flex items-center gap-2">
          <span>🍕</span>
          1. משחק דמיון - פיצריה
        </h3>
        
        <div class="space-y-3">
          <div class="bg-white rounded-lg p-3">
            <h4 class="font-semibold text-gray-800 mb-1">הכנת הפיצה:</h4>
            <ul class="space-y-1 text-sm text-gray-700 mr-4">
              <li>• שמים את הצלחת על כף היד ומעבירים מיד ליד כמו בצק של פיצה</li>
              <li>• מוסיפים רוטב פיצה, וכל מיני תוספות - זיתים, ברוקולי, עגבנייה, פטריות</li>
            </ul>
          </div>

          <div class="bg-white rounded-lg p-3">
            <h4 class="font-semibold text-gray-800 mb-1">שמים את הפיצה בתנור 🔥:</h4>
            <ul class="space-y-1 text-sm text-gray-700 mr-4">
              <li>• בישיבה (עמידת סרטן) מניחים את הידיים מאחורי הגב</li>
              <li>• מרימים מניחים את הפיצה (צלחת) מתחת לישבן, אך משאירים את הישבן באוויר</li>
              <li>• מדמים תנור - בכדי לבדוק אם הפיצה מוכנה</li>
              <li>• מורידים לאט את הישבן עד שנוגעים עם הישבן בצלחת</li>
              <li>• ואז... אייי חם חם חם מרימים בחזרה את הישבן גבוה למעלה</li>
              <li>• כמה פעמים עד שהפיצה מוכנה</li>
            </ul>
          </div>

          <div class="bg-white rounded-lg p-3">
            <h4 class="font-semibold text-gray-800 mb-1">נכבד את חברנו בפיצה שלנו 🍽️:</h4>
            <ul class="space-y-1 text-sm text-gray-700 mr-4">
              <li>• שמים את הצלחת (הפיצה) על הבטן</li>
              <li>• שוב מרימים את הישבן לעמידת סרטן</li>
              <li>• הפעם אנחנו שולחן</li>
              <li>• מרימים רגל אחת - מוציאים כיסא לחבר ואז רגל שניה</li>
              <li>• יד אחת ויד שניה (עוד כסא)</li>
              <li>• מסדרים את המפה (חולצה)</li>
              <li>• ומטיילים בחדר בהליכת סרטן ונותנים לחברים לטעום מהפיצה</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="bg-blue-50 rounded-lg p-4">
        <h3 class="font-bold text-blue-900 mb-2">2. איך מעיפים את הצלחת 🥏</h3>
        <p class="text-gray-700 text-sm mb-2">כולם חוזרים לשבת במקום עם הצלחת ומסבירים להם:</p>
        <ul class="space-y-1 text-sm text-gray-700 mr-4">
          <li>• שמים את האגודל על החלק העליון של הצלחת</li>
          <li>• 4 אצבעות מתחת לצלחת</li>
          <li>• מושיטים את היד קדימה</li>
          <li>• מחבקים את הצלחת חיבוק גדול</li>
          <li>• ובספירה עד 3 מניפים את היד קדימה ומעיפים את הצלחת הכי רחוק שאפשר</li>
        </ul>
        <p class="text-orange-600 text-sm font-semibold mt-2">הדגשים: בכל פעם אומרים לצד אחד של הקבוצה לפי ה-ח בו הם יושבים</p>
      </div>

      <div class="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4">
        <h3 class="font-bold text-purple-900 mb-2 flex items-center gap-2">
          <span>🎾</span>
          3. משחק עם רשת טניס
        </h3>
        <p class="text-gray-700 text-sm mb-2">מחלקים את הילדים לשתי קבוצות:</p>
        <ul class="space-y-1 text-sm text-gray-700 mr-4">
          <li>• רק לקבוצה אחת משאירים את הצלחת ולקבוצה השנייה אוספים</li>
          <li>• פורסים את רשת הטניס במרכז הגן</li>
          <li>• כל קבוצה בזמן שניתן לה, צריכה להעיף את כל הצלחות לצד של הקבוצה השנייה</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">🏃</span>
      <h2 class="text-2xl font-bold text-purple-800">מסלול - 15 דקות</h2>
    </div>
    
    <div class="space-y-3">
      <div class="bg-purple-50 rounded-lg p-4">
        <h3 class="font-bold text-purple-900 mb-2">1. טור ראשון - 6 צלחות 🐻</h3>
        <p class="text-gray-700 text-sm">לסדר טור של 6 צלחות - לעבור מעל הצלחות בפיסוק רגליים ובפיסוק ידיים – כמו הליכת דוב</p>
      </div>

      <div class="bg-pink-50 rounded-lg p-4">
        <h3 class="font-bold text-pink-900 mb-2">2. טור שני - 6 צלחות ↔️</h3>
        <p class="text-gray-700 text-sm">לסדר טור נוסף של 6 צלחות - לעמוד לצידי הצלחות, ידיים מעבר לצד השני, הולכים הליכת דוב צידית</p>
      </div>

      <div class="bg-blue-50 rounded-lg p-4">
        <h3 class="font-bold text-blue-900 mb-2">3. טור שלישי - 6 צלחות ↔️</h3>
        <p class="text-gray-700 text-sm">לסדר טור נוסף של 6 צלחות - לעמוד לצידי הצלחות בצד השני, ידיים מעבר לצלחות לצד השני ושוב הליכת דוב (צידית). פעם רגל שמאל נפתחת וימין מצטרפת ופעם רגל ימין נפתחת ושמאל מצטרפת, לכן עושים לשני הצדדים</p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl shadow-lg p-6">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">👋</span>
      <h2 class="text-2xl font-bold text-purple-800">סיכום - 2 דקות</h2>
    </div>
    
    <div class="space-y-2 text-gray-700">
      <p class="font-semibold">שיר פרידה - אפשרויות:</p>
      <ul class="space-y-1 mr-4">
        <li>• לעמוד באמצע ולהזמין לחיבוק פרידה מי שרוצה</li>
        <li>• הרפייה על הרצפה, לכבות את האורות בגן ולשים מוזיקה מרגיעה</li>
        <li>• לפתוח את הידיים גדול גדול לצדדים ואז לקרב לאט לאט עד שמגיעים לחיבוק עצמי. לתת נשיקה לכל כתף ולהגיד תודה לגוף שלי</li>
        <li>• למתוח את הגוף ולעשות לו מסאז לכל חלק בגוף</li>
      </ul>
    </div>
  </div>

  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-xl shadow-lg p-6">
    <p class="text-2xl font-bold">🦋 חלוקת חותמת: פרפר</p>
    <p class="text-xl mt-2">בהצלחה! 🌟</p>
  </div>
</div>
  `
};

console.log('Starting skills batch 4 FINAL: מיומנות יסוד 10-11...');

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
  } else {
    console.log(`❌ Not found: ${name}`);
  }
}

console.log('✨ Skills batch 4 FINAL complete! 🎉');
console.log('📊 מיומנות יסוד series COMPLETE: 11/11 lessons styled!');
process.exit(0);
