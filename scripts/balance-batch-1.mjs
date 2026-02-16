/**
 * Perfect styling - Balance lessons 1-2
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
  'שיווי משקל 1': `
<div class="max-w-4xl mx-auto space-y-6">
  
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 1 - שיווי משקל, קורדינציה וויסות כוח</h1>
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
      <p class="text-gray-700 text-sm">2 קורת פלציב, 37 מקלות שיווי משקל, 1 מזרון צבעוני, 6 קונוסים קטנים עגולים, משוכה נמוכה, משוכה בינונית, משוכה גבוהה</p>
    </div>
    <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⭐</span>
        <h3 class="font-bold text-green-900">חותמת</h3>
      </div>
      <p class="text-gray-700">פרפר</p>
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
        <h3 class="font-bold text-gray-800 mb-2">1. חימום עם מוזיקה - "סינדרלה"</h3>
        <p class="text-gray-700 mb-2">מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך.</p>
        <p class="text-gray-700 mb-2">עושים חימום של כל איברי הגוף השונים. מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.</p>
        <p class="text-gray-700 mb-2">מבקשים מהם ללכת מהר, ואז ממש לאט במהירויות שונות.</p>
        <p class="text-gray-700">ללכת בהליכות שונות בחדר - הליכה צידית, משקל מרגל לרגל, עקב אחרי אגודל, קפיצת צפרדע, הליכת סרטן, הליכת ברווז - הליכה שפופה.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. משחק ים/יבשה</h3>
        <p class="text-gray-700 mb-2">משחקים את המשחק ים יבשה. אנחנו רוצים שכל פעם הם ידרכו על ים רק עם רגל ימין ויבשה רק עם רגל שמאל.</p>
        <p class="text-gray-700">במילה אי - עומדים על 2 הרגליים. כך נתרגל את שיווי המשקל.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">3. ריקוד הציפורים</h3>
        <p class="text-gray-700">ללמד אותם את ריקוד הציפורים ואז לעשות אותו לפי השיר.</p>
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
      
      <p class="text-gray-700 font-semibold mb-3">נחלק לכל ילד מקלות שיווי משקל. נפעיל אותם בתרגילים שונים לפי ההוראות:</p>

      <div class="space-y-3">
        <div class="bg-purple-50 rounded-lg p-3">
          <p class="text-gray-700"><span class="font-semibold">1.</span> צד אחד של המקל על הרצפה ובצד השני אצבע אחת מחזיקה את המקל שלא יפול. אצבע שניה - של היד השנייה אומרת שלום ומחליפים בין האצבעות מבלי שהמקל ייפול X3 לכל יד</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-3">
          <p class="text-gray-700"><span class="font-semibold">2.</span> אצבע אחת מחזיקה את המקל מלמעלה (כשהמקל עומד על הרצפה) ואצבע של היד השנייה נכנסת בין הריצפה למקל ואוחזת אותו בצד השני. מרימים את הידיים מעל הראש ומציירים עיגולים גדולים באוויר, קדימה ואחורה X3</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-3">
          <p class="text-gray-700"><span class="font-semibold">3.</span> ידיים מתיישרות מעל הראש ויורדות בקו ישר קדימה עד הריצפה וחזרה גבוה אל מעל הראש (מתיחה של חוליות הגב) X3</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-3">
          <p class="text-gray-700"><span class="font-semibold">4.</span> מעבירים קצה אחד של המקל אל האף ומדמים חדק של פיל, להחליף בין האצבעות שמחזיקות בקצה השני</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-3">
          <p class="text-gray-700"><span class="font-semibold">5.</span> בעמידה, נעמיד את המקל על הרצפה וננסה להחזיק אותו עם הרגל</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-3">
          <p class="text-gray-700"><span class="font-semibold">6.</span> שתי ידיים אוחזות במקל והולכים הליכה ברווז (הליכה שפופה)</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-3">
          <p class="text-gray-700"><span class="font-semibold">7.</span> שתי ידיים אוחזות במקל מעל הראש ולנסות לעמוד על רגל אחת, לנסות לקפוץ על רגל אחת</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-3">
          <p class="text-gray-700"><span class="font-semibold">8.</span> עמידת שש, להחזיק את המקל ביד אחת ולהרים את היד, לנסות להרים גם את הרגל הנגדית ולהחליף את היד והרגל</p>
        </div>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2 mt-4">בזוגות:</h3>
        <ul class="space-y-2">
          <li class="text-gray-700">• לכל זוג מקל אחד. אוחזים ביד הקרובה במקל (כל ילד מחזיק עם יד אחת) ומתקדמים יחד בהליכה/קפיצה על רגל אחת</li>
          <li class="text-gray-700">• לאזן את המקל יד מול יד בלי שיפול, לאזן ולהחזיק בטן לבטן, רגל לרגל, אף לאף - רעיונות של איברים שונים</li>
        </ul>
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
      
      <p class="text-gray-700 mb-3">3 מסלולים שונים פרוסים ביחד:</p>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">מסלול 1</h3>
        <p class="text-gray-700">קורת פלציב ועליה מסודרים קונוסים קטנים עגולים, לסדר במרחק שווה וגדול אחד מהשני שיהיה מקום לרגל. ללכת על הקורה ולהרים את הרגל מעל הקונוסים.</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">מסלול 2</h3>
        <p class="text-gray-700">קורת פלציב ומעליה 3 משוכות (נמוכה, בינונית וגבוהה). ללכת על הקורה ולהרים את הרגל מעל המשוכה.</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">מסלול 3</h3>
        <p class="text-gray-700 mb-2">קורה על 2 סולמות ומזרון בסוף המסלול - קופצים מהקורה אל המזרון הצבעוני.</p>
        <p class="text-gray-700 text-sm">להסביר להם שזו קורה ושהולכים עליה, מטפסים על הסולם והולכים על הקורה לאט לאט עקב לצד אגודל, עד לסוף הקורה ואז קופצים אל המזרון אל הצבע שהכי קרוב אלינו.</p>
      </div>

      <p class="text-gray-700 text-sm italic mt-3">💡 להזמין ילד אחד להדגים את כל המסלול מההתחלה עד הסוף ואז להזמין ילד ילד. בכל פעם יהיו לפחות 5-7 ילדים במסלול כדי שלא יצטרכו לשבת הרבה זמן ולחכות.</p>

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
      חלוקת חותמת: פרפר
    </h3>
    <p class="text-3xl">🦋</p>
  </div>

  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md py-4">
    <p class="text-xl font-bold">בהצלחה! 🎉</p>
  </div>

</div>
`,

  'שיווי משקל 2': `
<div class="max-w-4xl mx-auto space-y-6">
  
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 2 - שיווי משקל, קורדינציה וויסות כוח</h1>
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
      <p class="text-gray-700 text-sm">26 זוגות קביים מפלסטיק, כרית אוויר כחולה, צלחת מסתובבת, 5 חישוקים</p>
    </div>
    <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⭐</span>
        <h3 class="font-bold text-green-900">חותמת</h3>
      </div>
      <p class="text-gray-700">קוף גדול</p>
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
        <h3 class="font-bold text-gray-800 mb-2">2. "עקב אצבעות"</h3>
        <p class="text-gray-700">לפי מילות השיר, אפשר בישיבה ובעמידה.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">3. משחק איזון - "Dance monkey"</h3>
        <p class="text-gray-700 mb-2">לשים ברקע את השיר. ריצה מפוזרת במרחב.</p>
        <p class="text-gray-700 mb-2">כשנקרא בשם של איבר הילדים יעצרו ויאזנו עליו את גופם:</p>
        <ul class="mr-6 space-y-1 mt-2">
          <li class="text-gray-700">• <span class="font-semibold">אגן</span> - איזון הגוף על האגן (בטן) בשכיבה על הבטן תוך כדי הרמת ידיים ורגליים מהרצפה</li>
          <li class="text-gray-700">• <span class="font-semibold">עקבים</span> - כיפוף ברכיים והרמת כפות רגליים מהרצפה – אפשר להעזר ביד למי שקשה</li>
          <li class="text-gray-700">• <span class="font-semibold">רגל אחת</span> - לעמוד על רגל אחת ואז על השנייה</li>
          <li class="text-gray-700">• <span class="font-semibold">ישבן</span> - להרים רגליים מהרצפה</li>
        </ul>
        <p class="text-gray-700 text-sm italic mt-2">💡 אפשר לחזור על זה כמה פעמים או לעלות שלב ולבקש שכמה איברים יגעו ברצפה</p>
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
      
      <div>
        <h3 class="font-bold text-gray-800 mb-2">קביים - עבודה בקבוצות</h3>
        <p class="text-gray-700 mb-2">נחלק את הקביים לחצי קבוצה. כל אחד מקבל קביים בתורו ומחכה בסבלנות.</p>
        <p class="text-gray-700 mb-2">כל ילד מהקבוצה ללא הקביים יעזור לילד עם הקביים לא ליפול.</p>
        <p class="text-gray-700 font-semibold">הדגשים: אפשר להחליק וליפול מהקביים, כל אחד הולך לאט ובזהירות במרחב.</p>
      </div>

      <div class="space-y-3">
        <div class="bg-purple-50 rounded-lg p-3">
          <p class="text-gray-700"><span class="font-semibold">1.</span> כל ילד קם מישיבה על הכיסא, שם רגל אחת על הקביים, רגל שנייה, מחזיק את החבל, עומד ומתחיל ללכת. לעזור להם לפי הצורך</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-3">
          <p class="text-gray-700"><span class="font-semibold">2.</span> לתת זמן חופשי להתנסות - התנסות ללא הוראה. אפשר לשים מוזיקת רקע שקטה ונעימה. קביים מפוזרות במרחב</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-3">
          <p class="text-gray-700"><span class="font-semibold">3.</span> נעמוד עליהם וננסה לנתק רגל אחת ואז את הרגל השנייה</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-3">
          <p class="text-gray-700"><span class="font-semibold">4.</span> לתופף על הקביים</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-3">
          <p class="text-gray-700"><span class="font-semibold">5.</span> לשאול את הילדים מה עוד אפשר לעשות עם הקביים (אולי להחביא את היד בתוכו? אולי כובע על הראש? הסתרת איבר אחר? לשבת על הקב ולהרים רגל למעלה? לקחת רעיונות מילדים וליישם)</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-3">
          <p class="text-gray-700"><span class="font-semibold">6.</span> להתקדם על הקביים בצורות שונות: קדימה, אחורה, הליכה צידית - לשני הכיוונים</p>
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
        <h3 class="font-bold text-orange-900 mb-2">תחנה 1: טור קביים</h3>
        <p class="text-gray-700">טור של קביים מפלסטיק במרווחים (לסדר יפה שהשרוך יהיה בצד והילדים לא ימעדו). הילדים ילכו על הקביים מבלי לגעת ברצפה. אפשר לאתגר בהליכה צידית.</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 2: כרית אוויר כחולה</h3>
        <p class="text-gray-700">לאחר מכן הילדים יקפצו על הכרית אוויר הכחולה.</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 3: צלחת מסתובבת</h3>
        <p class="text-gray-700">יסתובבו על הצלחת וישמרו על שיווי משקל בקרוסלות עץ.</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 4: חישוקים</h3>
        <p class="text-gray-700">5 חישוקים - לקפוץ על רגל אחת בין כל חישוק, להחליף רגל.</p>
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
      חלוקת חותמת: קוף גדול
    </h3>
    <p class="text-3xl">🐵</p>
  </div>

  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md py-4">
    <p class="text-xl font-bold">בהצלחה! 🎉</p>
  </div>

</div>
`
};

console.log('Starting balance batch 1: שיווי משקל 1-2...');

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

console.log('✨ Balance batch 1 complete!');
process.exit(0);
