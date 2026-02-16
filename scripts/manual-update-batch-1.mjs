/**
 * Manual perfect styling - Batch 1
 * פתיחת שנה 1-9 + שיווי משקל 3
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
  'פתיחת שנה 1': `
<div class="max-w-4xl mx-auto space-y-6">
  
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 1 - פתיחת שנה ומודעות לגוף</h1>
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
      <p class="text-gray-700 text-sm">2 מנהרות קפיצים, 2 חבלים ארוכים, 37 נקודות שטוחות צבעוניות</p>
    </div>
    <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⭐</span>
        <h3 class="font-bold text-green-900">חותמת</h3>
      </div>
      <p class="text-gray-700">דב</p>
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
          <span class="text-gray-700">הילדים ילמדו להכיר איברים שונים בגופם</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-1">•</span>
          <span class="text-gray-700">הילדים ילמדו להתאים את הגוף למרחבים שניצור עבורם (לצמצם, להרחיב, לזחול, הליכה שפופה)</span>
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
        <h3 class="font-bold text-gray-800 mb-2">1. מעגל שמות עם תנועה</h3>
        <p class="text-gray-700 mb-2">עושים מעגל שמות עם תנועה, קודם כל מציגים את עצמנו ועושים תנועה עם הגוף בישיבה.</p>
        <p class="text-gray-700 mb-2">עושים סבב של כל הילדים וצריך לחקות את התנועה של כל ילד ביחד עם זה שאומרים את השם.</p>
        <p class="text-gray-700 italic">"קוראים לי שירה (אני עושה תנועה של מחיאת כף)" - כולם צריכים לחזור אחרי השם שלי יחד עם מחיאת כף.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. שיר חימום - מואנה "בכיף שלך"</h3>
        <p class="text-gray-700 mb-2">מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך.</p>
        <p class="text-gray-700 mb-2">עושים חימום של כל איברי הגוף השונים. מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.</p>
        <p class="text-gray-700">מבקשים מהם ללכת מהר, ואז ממש לאט במהירויות שונות.</p>
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
        <h3 class="font-bold text-gray-800 mb-2">1. הסתדרות במבנים שונים</h3>
        <p class="text-gray-700 mb-2">מבקשים מהילדים להסתדר לפי מבנים שונים במרחבי הגן.</p>
        <p class="text-gray-700 mb-2">אומרים להם שהחוק הוא - להסתדר במבנים כמה שיותר מהר.</p>
        <p class="text-gray-700 mb-2">ברקע אפשר לנגן את השיר - "כל הילדים קופצים"</p>
        <ul class="mr-6 space-y-1 mt-2">
          <li class="flex items-start gap-2">
            <span class="text-purple-500">•</span>
            <span class="text-gray-700">חלוקה לזוגות</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-purple-500">•</span>
            <span class="text-gray-700">מעגל</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-purple-500">•</span>
            <span class="text-gray-700">2 טורים</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-purple-500">•</span>
            <span class="text-gray-700">שורה אחת ארוכה (אפשר 2 שורות אם אין מקום)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-purple-500">•</span>
            <span class="text-gray-700">שלשות</span>
          </li>
        </ul>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. משחק עם נקודות צבעוניות</h3>
        <p class="text-gray-700 mb-2">מפזרים 20 נקודות שטוחות ברחבי הגן.</p>
        <p class="text-gray-700 mb-2">מבקשים מהילדים ללכת במרחב בלי לגעת/להרים את הנקודות הצבעוניות.</p>
        <p class="text-gray-700 mb-2">מסבירים לילדים שהחוק הוא - כל פעם שאת מוחאת כף מניחים איבר שונה בגוף שלנו על הנקודה. יש לשים לב לחברים שלנו ולעבוד לאט.</p>
        <div class="bg-purple-50 rounded-lg p-3 mt-2">
          <p class="text-sm text-gray-700 mb-1">דוגמאות להוראות:</p>
          <ul class="mr-6 space-y-1">
            <li class="text-gray-700 text-sm">• "לשים את היד על הנקודה"</li>
            <li class="text-gray-700 text-sm">• "לשים את היד השנייה"</li>
            <li class="text-gray-700 text-sm">• "להניח ברך על הנקודה ואז את השנייה"</li>
            <li class="text-gray-700 text-sm">• "להניח את הראש בזהירות"</li>
            <li class="text-gray-700 text-sm">• "שתי ידיים"</li>
          </ul>
        </div>
        <p class="text-gray-700 mt-2 text-sm italic">💡 יכולה לחשוב על עוד איברים של הגוף: ישבן, גב, כתף, אצבע...</p>
        <p class="text-gray-700 text-sm italic">💡 לילדים הגדולים אפשר לבקש לשים 2-3 איברים במקביל (יד וראש, 2 מרפקים, מצח ואצבע)</p>
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
      
      <p class="text-gray-700 font-semibold">מטרת המסלול היא לאפשר לילדים להתאים את גופם למרחבים שונים.</p>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 1: נקודות לפיסוק</h3>
        <p class="text-gray-700">ליצור 2 טורים מהנקודות במרחק של פיסוק של הילדים (10 זוגות של נקודות).</p>
        <p class="text-gray-700">הם צריכים ללכת בפיסוק עם הידיים מתוחות לצדדים כל פעם עוברים מרגל לרגל.</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 2: מנהרות קפיצים</h3>
        <p class="text-gray-700">אחרי הנקודות, נפתח 2 מנהרות קפיצים שהם צריכים לזחול בתוכם.</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 3: חבלים</h3>
        <p class="text-gray-700">2 חבלים מסודרים אחד מול השני, הם צריכים ללכת בהליכה צידית ולא לגעת בחבלים.</p>
      </div>

      <p class="text-gray-700 text-sm italic mt-4">💡 בסוף המסלול, כל ילד חוזר לשבת, וכשכולם מסיימים אפשר לבקש מכל ילד בתורות לקפל חלק מהמסלול ולהביא אלייך (מי שרוצה).</p>

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
      חלוקת חותמת: דב
    </h3>
    <p class="text-3xl">🐻</p>
  </div>

  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md py-4">
    <p class="text-xl font-bold">בהצלחה! 🎉</p>
  </div>

</div>
`,

  'פתיחת שנה 2': `
<div class="max-w-4xl mx-auto space-y-6">
  
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 2 - פתיחת שנה ומודעות לגוף</h1>
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
      <p class="text-gray-700 text-sm">37 צמידי פעמונים, 22 דליים, 3 משוכות כתומות, 2 משוכות צהובות גבוהות</p>
    </div>
    <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⭐</span>
        <h3 class="font-bold text-green-900">חותמת</h3>
      </div>
      <p class="text-gray-700">ברבור</p>
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
        <h3 class="font-bold text-gray-800 mb-2">1. משחק ים יבשה</h3>
        <p class="text-gray-700 mb-2">פורסים חבל ארוך ומסבירים לילדים איזה צד זה ים, יבשה.</p>
        <p class="text-gray-700 mb-2">לגדולים יותר אפשר להוסיף "אי" - לעמוד בפיסוק, רגל אחת בצד של הים והשנייה בצד של היבשה.</p>
        <p class="text-gray-700">החוק הוא - מי שמתבלבל חוזר לשבת. חשוב לעשות משחק ניסיון כדי לתת להם צ'אנס להבין את החוקים.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. שיר חימום - "הגלשן" / דני סנדרסון</h3>
        <p class="text-gray-700 mb-2">מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך.</p>
        <p class="text-gray-700 mb-2">עושים חימום של כל איברי הגוף השונים. מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.</p>
        <p class="text-gray-700">מבקשים מהם ללכת מהר, ואז ממש לאט במהירויות שונות.</p>
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
        <h3 class="font-bold text-gray-800 mb-2">1. משחק עם צמידי פעמונים</h3>
        <p class="text-gray-700 mb-2">מחלקים לילדים צמידי פעמונים בישיבה.</p>
        <p class="text-gray-700 mb-2">אנחנו רוצים קודם לקשקש בהם (ואז לעשות מלא רעש) ואז לעצור אותם ושיהיה שקט.</p>
        <p class="text-gray-700 mb-2">💡 לשאול אותם כמה מהר הם יכולים לעבור מרעש לשקט.</p>
        <p class="text-gray-700">💡 לעשות 2 סבבים של המשחק הזה.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. צמיד על איברים שונים</h3>
        <p class="text-gray-700">לבקש מהילדים לשים את הצמיד על היד - ולחזור על המשחק של השיקשוק והשקט.</p>
        <ul class="mr-6 space-y-1 mt-2">
          <li class="flex items-start gap-2">
            <span class="text-purple-500">•</span>
            <span class="text-gray-700">לשים את הצמיד על הרגל</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-purple-500">•</span>
            <span class="text-gray-700">על 2 הידיים</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-purple-500">•</span>
            <span class="text-gray-700">על 2 הרגליים</span>
          </li>
        </ul>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">3. משחק "דג מלוח"</h3>
        <p class="text-gray-700 mb-2">לארגן מראש סלסלה לאיסוף הצמידים.</p>
        <p class="text-gray-700 mb-2">את עומדת בצד השני של החדר וכל הילדים עם הפעמונים עומדים מולך.</p>
        <p class="text-gray-700 mb-2">את עוצמת עיניים ואומרת - "1,2,3 דג מלוח". בזמן הזה הם צריכים להתקדם וכשאת עוצרת הם צריכים לקפוא ולא לעשות רעש עם הפעמון.</p>
        <p class="text-gray-700 mb-2">מי שעושה רעש מחזיר את הפעמון לסלסלה - וחוזר לשבת.</p>
        <p class="text-gray-700 text-sm italic">💡 אם הילדים גדולים יותר אפשר ממש לפסול אותם מהר, ואם הם קטנים אז לוותר להם. לשים לב שהמשחק לא מתארך יותר מדי.</p>
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
      
      <p class="text-gray-700 font-semibold mb-4">הוראות:</p>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 1: 16 דליים</h3>
        <p class="text-gray-700">טור של 16 דליים מסודרים על משטח נגד החלקה - הולכים קדימה על קצות האצבעות מעל כל דלי - מבלי לגעת בדלי.</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 2: 3 משוכות נמוכות כתומות</h3>
        <p class="text-gray-700">עוברים מעל (אפשר לעלות דרגת קושי לילדים גדולים ולקפוץ מעל המשוכות).</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 3: 6 דליים</h3>
        <p class="text-gray-700">נניח עוד טור של 6 דליים - הולכים הליכה צידית מעל הדלי.</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 4: משוכות גבוהות צהובות</h3>
        <p class="text-gray-700">2 משוכות גבוהות צהובות - זוחלים מתחת. מסיימים בזחילה על הבטן מתחת למשוכה הצהובה.</p>
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
      חלוקת חותמת: ברבור
    </h3>
    <p class="text-3xl">🦢</p>
  </div>

  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md py-4">
    <p class="text-xl font-bold">בהצלחה! 🎉</p>
  </div>

</div>
`
};

// Continue with more lessons in next message...
console.log('Starting batch 1: First 2 lessons...');

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

console.log('✨ Batch 1 complete!');
process.exit(0);
