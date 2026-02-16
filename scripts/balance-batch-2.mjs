/**
 * Perfect styling - Balance lessons 4-5
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
  'שיווי משקל 4': `
<div class="max-w-4xl mx-auto space-y-6">
  
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 4 - שיווי משקל, קורדינציה וויסות כוח</h1>
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
      <p class="text-gray-700 text-sm">37 כדורים פזיו (מספוג מתנגד), חבל ארוך לבן, 4 גומיות כושר, 2 משוכות בגבהים שונים</p>
    </div>
    <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⭐</span>
        <h3 class="font-bold text-green-900">חותמת</h3>
      </div>
      <p class="text-gray-700">סוס</p>
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
          <span class="text-gray-700">הילדים ילמדו לשמור על שיווי משקל סטטי ודינמי</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-1">•</span>
          <span class="text-gray-700">הילדים ילמדו לאזן אביזרים על חלקי גוף שונים</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-1">•</span>
          <span class="text-gray-700">הילדים יכירו את המושג קורדינציה ויתרגלו את העבודה עליה</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-1">•</span>
          <span class="text-gray-700">הילדים יכירו תנועה סיבובית ותנועה של המפרקים בגוף</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-1">•</span>
          <span class="text-gray-700">הילדים ילמדו לשמור על שיווי משקל נגד כוחות חיצוניים (דחיפה)</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-1">•</span>
          <span class="text-gray-700">הילדים יכירו את תפקידם של השרירים ואת היכולת לווסת את הכוח שהם מפעילים</span>
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
        <h3 class="font-bold text-gray-800 mb-2">1. חימום עם מוזיקה - "todo bum"</h3>
        <p class="text-gray-700 mb-2">מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך.</p>
        <p class="text-gray-700 mb-2">עושים חימום של כל איברי הגוף השונים. מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.</p>
        <p class="text-gray-700 mb-2">מבקשים מהם ללכת מהר, ואז ממש לאט במהירויות שונות.</p>
        <p class="text-gray-700">ללכת בהליכות שונות בחדר - הליכה צידית, משקל מרגל לרגל, עקב אחרי אגודל, קפיצת צפרדע, הליכת סרטן, הליכת ברווז - הליכה שפופה.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. "אדון שוקו"</h3>
        <p class="text-gray-700 mb-2">הכל עושים יחד איתם:</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• לקפוץ קפיצות צפרדע במרחב</li>
          <li class="text-gray-700">• ללכת במרחב עם פיסוק ממש גדול</li>
          <li class="text-gray-700">• לקפוץ במרחב עם רגליים צמודות</li>
          <li class="text-gray-700">• לקפוץ מצד לצד עם רגליים צמודות</li>
        </ul>
        <p class="text-gray-700 text-sm italic mt-2">💡 אפשר לשחק עם המוזיקה - לעצור והם עוצרים, להמשיך והם ממשיכים מאותה משימה שהם קיבלו</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">3. משחק דחיפה לשיווי משקל</h3>
        <p class="text-gray-700 mb-2">עומדים בשתי שורות וכל זוג מצמיד ידיים.</p>
        <p class="text-gray-700">הם צריכים להזיז את האחר מהמקום שלו מבלי לזוז מהמקום שלהם. המשחק הוא לשמור על שיווי משקל תוך כדי שאני דוחפת את האחר בעדינות. אם אעשה את זה חזק מדי אני אפול.</p>
        <p class="text-gray-700 text-sm italic mt-2">להזכיר את נושא החודש ולשאול במה שיחקנו בשבוע שעבר</p>
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
        <h3 class="font-bold text-gray-800 mb-2">עבודה עם כדורי ספוג קשיחים</h3>
        <p class="text-gray-700 mb-2">מחלקים לכל ילד כדור ספוג קשיח. אנחנו רוצים להתחיל לדחוס אותו - ללמד את הילדים על הדבר שנקרא וויסות כוח.</p>
      </div>

      <div class="space-y-3">
        <div class="bg-purple-50 rounded-lg p-3">
          <p class="text-gray-700"><span class="font-semibold">1.</span> נבקש מהילדים בישיבה להתחיל למעוך את הכדור עם שתי ידיים ואז להרפות ולחזור על הפעולה כמה פעמים - נסביר לילדים את המושג וויסות כוח</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-3">
          <p class="text-gray-700"><span class="font-semibold">2.</span> לאחר מכן למעוך אותו על איברים שונים בגוף ולהתנגד עם הגוף בחזרה. לדוגמה: נדחוף את הכדור על הרגל, על הבטן, על הכתף, על הראש. לשים לב שהילדים לא מכאיבים לעצמם</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-3">
          <p class="text-gray-700"><span class="font-semibold">3.</span> מתחלקים לזוגות - ואנחנו רוצים לדחוף ולהצמיד את הכדור בין איברים כדי שהכדור לא יפול. לדוגמה - הם מחזיקים ביחד את הכדור תוך כדי דחיפה של הכדור אחד לכפות ידיו של האחר. אם הם יפסיקו לדחוף הכדור יפול (דומה למשחק שעשינו בפתיחה)</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-3">
          <p class="text-gray-700"><span class="font-semibold">4.</span> משמיעים מוזיקה של החימום - הילדים מסתובבים במרחב וצריכים לאזן את הכדור כל פעם על איבר אחר: על הראש, על הברך, על הרגל, על הכתף. אם הכדור נופל נעודד אותם להרים ולנסות לאזן מחדש</p>
        </div>
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
        <h3 class="font-bold text-orange-900 mb-2">תחנה 1: חבל מפותל</h3>
        <p class="text-gray-700">חבל ארוך מסודר בצורה מפותלת - הם צריכים לאזן את הכדור על יד אחת וללכת על החבל מבלי ליפול ממנו.</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 2: גומיות כוח</h3>
        <p class="text-gray-700">4 גומיות כוח - הילדים צריכים לשים את הגומיות בין הרגלים וללכת בפיסוק הכי גדול שלהם עד לנקודה מסוימת. המטרה שהם ידחפו את הגומייה כמה שיותר חזק ויפעילו כוח.</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 3: זחילה מתחת למשוכות</h3>
        <p class="text-gray-700">2 משוכות - הם צריכים לזחול שהכדור מאוזן על הגב שלהם. אם זה קשה לקטנים אפשר רק להחזיק ביד ולזחול. להתאמן על פעולת הזחילה מתחת למשוכות תוך כדי החזקה של הכדור.</p>
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
      חלוקת חותמת: סוס
    </h3>
    <p class="text-3xl">🐴</p>
  </div>

  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md py-4">
    <p class="text-xl font-bold">בהצלחה! 🎉</p>
  </div>

</div>
`,

  'שיווי משקל 5': `
<div class="max-w-4xl mx-auto space-y-6">
  
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 5 - שיווי משקל, קורדינציה וויסות כוח</h1>
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
      <p class="text-gray-700 text-sm">37 דליים קטנים, 4 קונוסים גדולים, 2 מקלות צהובים</p>
    </div>
    <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⭐</span>
        <h3 class="font-bold text-green-900">חותמת</h3>
      </div>
      <p class="text-gray-700">קשת בענן</p>
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
          <span class="text-gray-700">הילדים ילמדו לשמור על שיווי משקל סטטי ודינמי</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-1">•</span>
          <span class="text-gray-700">הילדים ילמדו לאזן אביזרים על חלקי גוף שונים</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-1">•</span>
          <span class="text-gray-700">הילדים יכירו את המושג קורדינציה ויתרגלו את העבודה עליה</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-1">•</span>
          <span class="text-gray-700">הילדים יכירו תנועה סיבובית ותנועה של המפרקים בגוף</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-1">•</span>
          <span class="text-gray-700">הילדים ילמדו לשמור על שיווי משקל נגד כוחות חיצוניים (דחיפה)</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-1">•</span>
          <span class="text-gray-700">הילדים יכירו את תפקידם של השרירים ואת היכולת לווסת את הכוח שהם מפעילים</span>
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
        <h3 class="font-bold text-gray-800 mb-2">1. חימום עם מוזיקה - "מה שטוב לדוב"</h3>
        <p class="text-gray-700 mb-2">מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך.</p>
        <p class="text-gray-700 mb-2">עושים חימום של כל איברי הגוף השונים. מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.</p>
        <p class="text-gray-700 mb-2">מבקשים מהם ללכת מהר, ואז ממש לאט במהירויות שונות.</p>
        <p class="text-gray-700">ללכת בהליכות שונות בחדר - הליכה צידית, משקל מרגל לרגל, עקב אחרי אגודל, קפיצת צפרדע, הליכת סרטן, הליכת ברווז - הליכה שפופה.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. "נפרוס הידיים לצדדים"</h3>
        <p class="text-gray-700 mb-2">עושים לפי מילות השיר ואפשר להוסיף את התרגילים הבאים גם (הכל עושים יחד איתם):</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• לקפוץ קפיצות צפרדע במרחב</li>
          <li class="text-gray-700">• ללכת במרחב עם פיסוק ממש גדול</li>
          <li class="text-gray-700">• לקפוץ במרחב עם רגליים צמודות</li>
          <li class="text-gray-700">• לקפוץ מצד לצד עם רגליים צמודות</li>
        </ul>
        <p class="text-gray-700 text-sm italic mt-2">💡 אפשר לשחק עם המוזיקה - לעצור והם עוצרים, להמשיך והם ממשיכים מאותה משימה שהם קיבלו</p>
        <p class="text-gray-700 text-sm italic">להזכיר את נושא החודש ולשאול במה שיחקנו בשבוע שעבר</p>
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
      
      <p class="text-gray-700 mb-3">כל אחד מקבל דלי בתורו ושם אותו על הרצפה בין הרגליים.</p>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">בישיבה - יושבים במעגל גדול כמה שניתן</h3>
        <p class="text-gray-700 mb-2">מניחים את הדליים בידיים מול בית החזה עם הגב לכיסא - מתקדמים למרכז המעגל וחזרה.</p>
        <p class="text-gray-700">מתקדמים בישיבה עם הדלי עם שתי הרגליים על הריצפה ביחד, וחזרה אחורה עם 2 הרגליים.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">משחק התקדמות עם המוזיקה - "אנ דנ דינו"</h3>
        <p class="text-gray-700 mb-2">כשהמוזיקה מתנגנת הם זזים ביחד עם הדלי בין הרגליים. חשוב לשמור על התקדמות עם שתי הרגליים ביחד כדי שהדלי לא יפול. ללחוץ אותו בין הירכיים.</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• כשהמוזיקה מפסיקה - הם עוצרים</li>
          <li class="text-gray-700">• להמשיך את המוזיקה מהר עוד לפני שהם מספיקים להחליף בין המצבים</li>
        </ul>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">בעמידה</h3>
        <p class="text-gray-700 mb-2">לשאול את הילדים - מי יכול להתקדם רק עם הרגליים:</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• שהדלי על הראש?</li>
          <li class="text-gray-700">• שהדלי על הברך? (מבלי שייפול)</li>
          <li class="text-gray-700">• בואו נעצור וננתק רגל אחת למעלה/הצידה/אחורה</li>
          <li class="text-gray-700">• דלי על הכתף - להתקדם מבלי שייפול</li>
          <li class="text-gray-700">• נעצור וננסה להרים יד גבוה מבלי שייפול</li>
        </ul>
        <p class="text-gray-700 text-sm mt-2">כל הזמן צריך לשמור על הדלי שלא ייפול מהאיבר שציינו שהוא מונח עליו.</p>
        <p class="text-gray-700 text-sm italic mt-2">💡 בסוף כל ילד מניח את הדלי על הריצפה, לבחור ילד שיאסוף מספר של דליים לפי הוראה שלך</p>
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
      
      <p class="text-gray-700 mb-3">לסדר דליים קטנים במרחק שווה:</p>

      <div class="space-y-3">
        <div class="bg-orange-50 rounded-lg p-4">
          <h3 class="font-bold text-orange-900 mb-2">חלק 1: סלאלום</h3>
          <p class="text-gray-700">10 דליים עם מרווחים שווים - נתחיל בסלאלום (אפשר לאתגר סלאלום על רגל אחת לילדים גדולים יותר)</p>
        </div>
        
        <div class="bg-orange-50 rounded-lg p-4">
          <h3 class="font-bold text-orange-900 mb-2">חלק 2: זיג זג</h3>
          <p class="text-gray-700">10 דליים בזיג זג - נמשיך לקפיצה בזיג זג לפי כיווני הקונוסים</p>
        </div>
        
        <div class="bg-orange-50 rounded-lg p-4">
          <h3 class="font-bold text-orange-900 mb-2">חלק 3: הליכת דב</h3>
          <p class="text-gray-700">10 דליים צמודים - ונסיים בהליכת דב (הליכה רחבה עם פישוק) מבלי לגעת בדליים</p>
        </div>
        
        <div class="bg-orange-50 rounded-lg p-4">
          <h3 class="font-bold text-orange-900 mb-2">סיום: מעבר מעל משוכה</h3>
          <p class="text-gray-700">שני קונוסים ומקל ביניהם כמשוכה (כפול 2). בסיום המסלול נשים לילד דלי על הראש והוא ינסה לעבור מעל המקל עם הקונוסים מבלי שהדלי ייפול.</p>
        </div>
      </div>

      <p class="text-gray-700 text-sm italic mt-3">💡 פירוק המסלול בעזרת מי שישב וכיבד את החברים, כל ילד שבחרנו מביא חלק מהמסלול</p>

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
      חלוקת חותמת: קשת בענן
    </h3>
    <p class="text-3xl">🌈</p>
  </div>

  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md py-4">
    <p class="text-xl font-bold">בהצלחה! 🎉</p>
  </div>

</div>
`
};

console.log('Starting balance batch 2: שיווי משקל 4-5...');

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

console.log('✨ Balance batch 2 complete!');
process.exit(0);
