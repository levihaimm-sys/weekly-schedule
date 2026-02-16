/**
 * Perfect styling - Balance lessons 10-13 (FINAL BALANCE SERIES!)
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
  'שיווי משקל 10': `
<div class="max-w-4xl mx-auto space-y-6">
  
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 10 - שיווי משקל, קורדינציה וויסות כוח</h1>
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
      <p class="text-gray-700 text-sm">37 קונוסים רגילים אדומים, 4 קונוסים גדולים מחוררים, 3 מקלות כתומים ארוכים</p>
    </div>
    <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⭐</span>
        <h3 class="font-bold text-green-900">חותמת</h3>
      </div>
      <p class="text-gray-700">פיל עץ</p>
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
        <li class="flex items-start gap-2"><span class="text-blue-500 mt-1">•</span><span class="text-gray-700">הילדים ילמדו לשמור על שיווי משקל סטטי ודינמי</span></li>
        <li class="flex items-start gap-2"><span class="text-blue-500 mt-1">•</span><span class="text-gray-700">הילדים ילמדו לאזן אביזרים על חלקי גוף שונים</span></li>
        <li class="flex items-start gap-2"><span class="text-blue-500 mt-1">•</span><span class="text-gray-700">הילדים יכירו את המושג קורדינציה ויתרגלו את העבודה עליה</span></li>
        <li class="flex items-start gap-2"><span class="text-blue-500 mt-1">•</span><span class="text-gray-700">הילדים יכירו תנועה סיבובית ותנועה של המפרקים בגוף</span></li>
        <li class="flex items-start gap-2"><span class="text-blue-500 mt-1">•</span><span class="text-gray-700">הילדים ילמדו לשמור על שיווי משקל נגד כוחות חיצוניים (דחיפה)</span></li>
        <li class="flex items-start gap-2"><span class="text-blue-500 mt-1">•</span><span class="text-gray-700">הילדים יכירו את תפקידם של השרירים ואת היכולת לווסת את הכוח שהם מפעילים</span></li>
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
        <h3 class="font-bold text-gray-800 mb-2">1. חימום עם מוזיקה - "מלכת השושנים" (עדן בן זקן)</h3>
        <p class="text-gray-700 mb-2">מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך.</p>
        <p class="text-gray-700 mb-2">עושים חימום של כל איברי הגוף השונים. מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.</p>
        <p class="text-gray-700 mb-2">מבקשים מהם ללכת מהר, ואז ממש לאט במהירויות שונות.</p>
        <p class="text-gray-700">ללכת בהליכות שונות בחדר - הליכה צידית, משקל מרגל לרגל, עקב אחרי אגודל, קפיצת צפרדע, הליכת סרטן, הליכת ברווז - הליכה שפופה.</p>
      </div>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. "גן הפסלים" - ארטיק מסטיק אגם בוחבוט</h3>
        <p class="text-gray-700 mb-2">שמים מוזיקה וכשהיא עוצרת הם צריכים לעשות את ההוראות הבאות:</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• לשים 2 ידיים על המותניים</li>
          <li class="text-gray-700">• להזיז את הישבן מצד לצד</li>
          <li class="text-gray-700">• לשבת על הרצפה</li>
          <li class="text-gray-700">• למחוא כף</li>
        </ul>
      </div>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">3. משחק המראה - "קרמלה" (משה פרץ)</h3>
        <p class="text-gray-700 mb-2">מתחלקים לזוגות ועומדים אחד מול השני. אחד עושה תנועה והשני צריך לחקות את אותה תנועה. ואז מתחלפים.</p>
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
        <h3 class="font-bold text-gray-800 mb-2">סיפור מסגרת: יצאנו לג'ונגל/ליער</h3>
        <p class="text-gray-700 mb-3">מפזרים את הקונוסים במרחק שווה בחדר (כמספר הילדים) ומשמיעים מוזיקה. הילדים צריכים לעבור בין הקונוסים מבלי לגעת בהם בצורות ההתקדמות הבאות:</p>
      </div>
      <div class="space-y-3">
        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-semibold text-purple-900 mb-1">הליכת דוב</h4>
          <p class="text-gray-700">עומדים על כפות הרגליים וכפות הידיים מונחות קדימה על הרצפה וצועדים כמו דוב (עמידת שש) במרחב החדר. כשהמוזיקה עוצרת, תופסים קונוס ומרימים אותו ביד אחת.</p>
        </div>
        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-semibold text-purple-900 mb-1">הליכת סרטן</h4>
          <p class="text-gray-700">בישיבה, ידיים מונחות מאחורי הגב, מרימים את הישבן לאוויר ומטיילים במרחב החדר. כשהמוזיקה עוצרת הסרטן תופס אוכל, הוא מאוד רעב - מרימים קונוס ומחליפים בין הידיים.</p>
        </div>
        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-semibold text-purple-900 mb-1">נחש (זחילה על הגחון)</h4>
          <p class="text-gray-700">שוכבים על הבטן, ידיים מושטות קדימה ומתקדמים רק על ידי משיכה של כפות הידיים את הרצפה. כפות הרגליים מקופלות אל הישבן. בכל פעם יד ישרה ויד שנייה עם מרפק מכופפת. בעצירת המוזיקה מניחים את היד על הקונוס.</p>
        </div>
        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-semibold text-purple-900 mb-1">זחילה על מרפקים (כמו תינוק)</h4>
          <p class="text-gray-700">בשכיבה על הבטן, נשענים על המרפקים ומתקדמים בעזרתם. כשהמוזיקה עוצרת, למתוח יד קדימה להרים את הקונוס ולשתות כמו תינוק מבקבוק, להחזיר ויד שניה מושטת קדימה ושותה מהבקבוק.</p>
        </div>
      </div>
      <p class="text-gray-700 text-sm italic mt-3">💡 אפשר לחלק את הקבוצה לשתיים, ובכל פעם רק קבוצה אחת נמצאת על הרצפה כדי שיהיה להם יותר מקום. חשוב להעביר את הפעילות כמשחק</p>
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
      <p class="text-gray-700 mb-3">4 עמדות של קונוסים עם חורים:</p>
      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">הכנת המסלול</h3>
        <p class="text-gray-700 mb-2">4 קונוסים גדולים בשורה לרוחב החדר, במרכז החדר ביניהם מחברים מקלות כתומים ארוכים על השלב הכי גבוהה, היוצרים שלושה מעברים/גשרים.</p>
        <p class="text-gray-700 mb-2">בקצה אחד של החדר יעמדו הקונוסים רגילים ויסמנו את תחילת המסלול.</p>
        <p class="text-gray-700">בקצה השני של החדר יעמדו שורה של קונוסים רגילים ויסמנו את סוף המסלול.</p>
      </div>
      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">ביצוע המסלול</h3>
        <p class="text-gray-700 mb-2">בכל פעם ייגשו למסלול שלושה ילדים לפי הסדר.</p>
        <p class="text-gray-700 mb-2">בשכיבה עם הבטן על הסקוטר, ידיים מושטות קדימה על הרצפה, כפות הרגליים מקופלות לכיוון הישבן.</p>
        <p class="text-gray-700 mb-2">הם צריכים למשוך עם שתי ידיים את הגוף ולהתקדם אל מתחת למקלות הכתומים מבלי לגעת בהם. מתקדמים רק בעזרת הידיים, עד לשורת הקונוסים בקצה השני.</p>
        <p class="text-gray-700">עוצרים, וחוזרים למקום. שלושה ילדים נוספים מגיעים עד שכולם עושים את המסלול.</p>
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
        <li class="flex items-start gap-2"><span class="text-pink-500">•</span><span class="text-gray-700">לעמוד באמצע ולהזמין לחיבוק פרידה מי שרוצה</span></li>
        <li class="flex items-start gap-2"><span class="text-pink-500">•</span><span class="text-gray-700">אפשר לעשות הרפייה על הרצפה, לכבות את האורות בגן ולשים מוזיקה מרגיעה</span></li>
        <li class="flex items-start gap-2"><span class="text-pink-500">•</span><span class="text-gray-700">אפשר להנחות אותם לפתוח את הידיים גדול גדול לצדדים ואז לקרב לאט לאט עד שמגיעים לחיבוק עצמי. לתת נשיקה לכל כתף ולהגיד תודה לגוף שלי</span></li>
        <li class="flex items-start gap-2"><span class="text-pink-500">•</span><span class="text-gray-700">אפשר למתוח את הגוף ולעשות לו מסאז לכל חלק בגוף</span></li>
      </ul>
    </div>
  </div>

  <div class="bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 rounded-xl shadow-lg p-6 text-center">
    <h3 class="text-xl font-bold text-yellow-900 mb-2 flex items-center justify-center gap-2">
      <span>🎖️</span>
      חלוקת חותמת: פיל עץ
    </h3>
    <p class="text-3xl">🐘</p>
  </div>

  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md py-4">
    <p class="text-xl font-bold">בהצלחה! 🎉</p>
  </div>

</div>
`,

  'שיווי משקל 11': `
<div class="max-w-4xl mx-auto space-y-6">
  
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 11 - שיווי משקל, קורדינציה וויסות כוח</h1>
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
      <p class="text-gray-700 text-sm">36 משקולות ונדנדות שיווי משקל, 5 חצי כריות אוויר סגולות, 6 חישוקים עם חיבורים, 7 קונוסים צהובים, 1 מזרון צבעוני</p>
    </div>
    <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⭐</span>
        <h3 class="font-bold text-green-900">חותמת</h3>
      </div>
      <p class="text-gray-700">שמש</p>
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
        <li class="flex items-start gap-2"><span class="text-blue-500 mt-1">•</span><span class="text-gray-700">הילדים ילמדו לשמור על שיווי משקל סטטי ודינמי</span></li>
        <li class="flex items-start gap-2"><span class="text-blue-500 mt-1">•</span><span class="text-gray-700">הילדים ילמדו לאזן אביזרים על חלקי גוף שונים</span></li>
        <li class="flex items-start gap-2"><span class="text-blue-500 mt-1">•</span><span class="text-gray-700">הילדים יכירו את המושג קורדינציה ויתרגלו את העבודה עליה</span></li>
        <li class="flex items-start gap-2"><span class="text-blue-500 mt-1">•</span><span class="text-gray-700">הילדים יכירו תנועה סיבובית ותנועה של המפרקים בגוף</span></li>
        <li class="flex items-start gap-2"><span class="text-blue-500 mt-1">•</span><span class="text-gray-700">הילדים ילמדו לשמור על שיווי משקל נגד כוחות חיצוניים (דחיפה)</span></li>
        <li class="flex items-start gap-2"><span class="text-blue-500 mt-1">•</span><span class="text-gray-700">הילדים יכירו את תפקידם של השרירים ואת היכולת לווסת את הכוח שהם מפעילים</span></li>
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
        <h3 class="font-bold text-gray-800 mb-2">1. חימום עם מוזיקה - "אפס מאמץ" (נטע ברזילאי)</h3>
        <p class="text-gray-700 mb-2">מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך.</p>
        <p class="text-gray-700 mb-2">עושים חימום של כל איברי הגוף השונים. מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.</p>
        <p class="text-gray-700 mb-2">מבקשים מהם ללכת מהר, ואז ממש לאט במהירויות שונות.</p>
        <p class="text-gray-700">ללכת בהליכות שונות בחדר - הליכה צידית, משקל מרגל לרגל, עקב אחרי אגודל, קפיצת צפרדע, הליכת סרטן, הליכת ברווז - הליכה שפופה.</p>
      </div>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. שיר רקע - "קפיץ קפוץ נקפץ"</h3>
        <p class="text-gray-700">לפי מילות השיר, בעמידה.</p>
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
        <h3 class="font-bold text-gray-800 mb-2">1. אימון כושר - כפיפות בטן</h3>
        <p class="text-gray-700 mb-2">נספר לילדים שהיום נרגיש את השרירים שלנו בבטן ונלמד להכיר אותם. נלמד את הילדים לעשות כפיפות בטן.</p>
        <p class="text-gray-700 mb-2">נבקש מהם לשכב על הגב ולשים את הידיים מאחורי הראש. ורק בעזרת השרירים של הבטן להרים את הראש למעלה קצת. נחזור על הפעולה כמה פעמים.</p>
        <p class="text-gray-700">לאחר מכן נבקש מהם ליישר את הרגלים למטה ולהוריד אותן לאט לאט כמעט עד שנוגעות ברצפה ואז לעלות. נעשה את אותו הדבר רק שנפתח את הרגליים בפיסוק, נוריד למטה ונעלה.</p>
        <p class="text-gray-700 text-sm italic">💡 נעשה את הפעולות לא יותר מכמה דק'</p>
      </div>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. משקולת לוויסות כוח</h3>
        <p class="text-gray-700 mb-2">המשקולת ונדנדה קטנה - נדגים להם איך להשתמש בזה. נחלק לכל ילד משקולת, מי שמקבל מנסה להעמיד את המשקולת מבלי שתיפול עד שכל החברים יקבלו.</p>
        <div class="space-y-2 mt-2">
          <p class="text-gray-700"><span class="font-semibold">התנסות חופשית:</span> התנסות ללא הוראה</p>
          <p class="text-gray-700"><span class="font-semibold">התנסות משותפת:</span></p>
          <ul class="mr-6 space-y-1">
            <li class="text-gray-700 text-sm">• להעמיד את המשקולת על הרצפה, לשים את מרכז כף היד על המשקולת ולנסות לגלגל אותה גלגול אחד אל עבר היד השנייה ולתפוס עם מרכז כף היד השנייה</li>
            <li class="text-gray-700 text-sm">• אותו הדבר כשמתחילים עם היד השנייה</li>
            <li class="text-gray-700 text-sm">• עכשיו ננסה להעמיד את המשקולת ולהחזיק אותה רק עם אצבע אחת ולגלגל אותה לעבר היד השנייה ולתפוס גם עם אצבע אחת</li>
            <li class="text-gray-700 text-sm">• לנסות לגלגל את משקולת קדימה</li>
            <li class="text-gray-700 text-sm">• לנסות לאזן את המשקולת על חלקים שונים של הגוף</li>
          </ul>
        </div>
        <p class="text-gray-700 text-sm italic mt-2">החזרת המשקולת: לעבור עם התיק ולאסוף מכל ילד את המשקולת, לשים לב שכולם מחזירים</p>
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
        <h3 class="font-bold text-orange-900 mb-2">תחנה 1: חישוקים עם חיבורים</h3>
        <p class="text-gray-700">6 חישוקים - לקפוץ מחישוק לחישוק כשהחישוקים מסודרים בשורה/זיגזג. חישוק בצד ימין ואז חישוק בצד שמאל וחוזר על עצמו – קופצים מימין לשמאל ומשמאל לימין ושוב...</p>
      </div>
      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 2: חצי כיפות אוויר סגולות</h3>
        <p class="text-gray-700">5 חצי כיפות - גם מסודרות בזיגזג. לעבור מכרית לכרית: רגל ימין, שמאל, ימין...</p>
      </div>
      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 3: קונוסים צהובים</h3>
        <p class="text-gray-700">7 קונוסים צהובים קטנים – מסודרים בשורה עם רווחים והולכים בינהם בסלאלום.</p>
      </div>
      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 4: מזרון צבעוני</h3>
        <p class="text-gray-700">גלגול קדימה – כמו המשקולת.</p>
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
        <li class="flex items-start gap-2"><span class="text-pink-500">•</span><span class="text-gray-700">לעמוד באמצע ולהזמין לחיבוק פרידה מי שרוצה</span></li>
        <li class="flex items-start gap-2"><span class="text-pink-500">•</span><span class="text-gray-700">אפשר לעשות הרפייה על הרצפה, לכבות את האורות בגן ולשים מוזיקה מרגיעה</span></li>
        <li class="flex items-start gap-2"><span class="text-pink-500">•</span><span class="text-gray-700">אפשר להנחות אותם לפתוח את הידיים גדול גדול לצדדים ואז לקרב לאט לאט עד שמגיעים לחיבוק עצמי. לתת נשיקה לכל כתף ולהגיד תודה לגוף שלי</span></li>
        <li class="flex items-start gap-2"><span class="text-pink-500">•</span><span class="text-gray-700">אפשר למתוח את הגוף ולעשות לו מסאז לכל חלק בגוף</span></li>
      </ul>
    </div>
  </div>

  <div class="bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 rounded-xl shadow-lg p-6 text-center">
    <h3 class="text-xl font-bold text-yellow-900 mb-2 flex items-center justify-center gap-2">
      <span>🎖️</span>
      חלוקת חותמת: שמש
    </h3>
    <p class="text-3xl">☀️</p>
  </div>

  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md py-4">
    <p class="text-xl font-bold">בהצלחה! 🎉</p>
  </div>

</div>
`,

  'שיווי משקל 12': `
<div class="max-w-4xl mx-auto space-y-6">
  
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 12 - שיווי משקל, קורדינציה וויסות כוח</h1>
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
      <p class="text-gray-700 text-sm">36 נקודות פעילות, מזרן יוגה/משטח נגד החלקה, משולש + נדנדה גדולה</p>
    </div>
    <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⭐</span>
        <h3 class="font-bold text-green-900">חותמת</h3>
      </div>
      <p class="text-gray-700">סרטן גדול</p>
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
        <li class="flex items-start gap-2"><span class="text-blue-500 mt-1">•</span><span class="text-gray-700">הילדים ילמדו לשמור על שיווי משקל סטטי ודינמי</span></li>
        <li class="flex items-start gap-2"><span class="text-blue-500 mt-1">•</span><span class="text-gray-700">הילדים ילמדו לאזן אביזרים על חלקי גוף שונים</span></li>
        <li class="flex items-start gap-2"><span class="text-blue-500 mt-1">•</span><span class="text-gray-700">הילדים יכירו את המושג קורדינציה ויתרגלו את העבודה עליה</span></li>
        <li class="flex items-start gap-2"><span class="text-blue-500 mt-1">•</span><span class="text-gray-700">הילדים יכירו תנועה סיבובית ותנועה של המפרקים בגוף</span></li>
        <li class="flex items-start gap-2"><span class="text-blue-500 mt-1">•</span><span class="text-gray-700">הילדים ילמדו לשמור על שיווי משקל נגד כוחות חיצוניים (דחיפה)</span></li>
        <li class="flex items-start gap-2"><span class="text-blue-500 mt-1">•</span><span class="text-gray-700">הילדים יכירו את תפקידם של השרירים ואת היכולת לווסת את הכוח שהם מפעילים</span></li>
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
        <h3 class="font-bold text-gray-800 mb-2">1. חימום עם מוזיקה - "עולה על שולחנות" (מארינה מקסימיליאן בלומין)</h3>
        <p class="text-gray-700 mb-2">מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך.</p>
        <p class="text-gray-700 mb-2">עושים חימום של כל איברי הגוף השונים. מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.</p>
        <p class="text-gray-700 mb-2">מבקשים מהם ללכת מהר, ואז ממש לאט במהירויות שונות.</p>
        <p class="text-gray-700">ללכת בהליכות שונות בחדר - הליכה צידית, משקל מרגל לרגל, עקב אחרי אגודל, קפיצת צפרדע, הליכת סרטן, הליכת ברווז - הליכה שפופה.</p>
      </div>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. "חפש את הצבע"</h3>
        <p class="text-gray-700">כשאת מכריזה על שם של צבע הם צריכים לחפש בגן את הצבע הזה ולגעת בו.</p>
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
      <p class="text-gray-700 font-semibold mb-3">נעבוד עם נקודות פעילות</p>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">1. חלוקת הילדים לזוגות</h3>
        <p class="text-gray-700 mb-2">לסדר 2 נקודות במרחק שווה וקטן אחת מהשנייה, מפוזרים בחדר. כל זוג עומד אחד מול השני, כל אחד על הנקודה שלו. רגל אחת על הנקודה, רגל אחת על הרצפה.</p>
        <p class="text-gray-700 text-sm font-semibold">הדגשים: לא יורדים מהנקודה, רגל אחת נמצאת על נקודה אחת כל הזמן</p>
      </div>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. הפעלת הילדים על הנקודות</h3>
        <p class="text-gray-700 mb-2">כל ילד עומד עם רגל על נקודה בפיסוק קטן. אנו נעביר את משקל הגוף מנקודה לרצפה:</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• כשבכל פעם נרים רגל אחת ונעמוד על הרגל השנייה - פעם אחת נעמוד על רגל ימין ופעם על רגל שמאל</li>
          <li class="text-gray-700">• נתנדנד מצד אל צד</li>
          <li class="text-gray-700">• נבצע את אותה הפעולה רק שהפעם נבצע אותה סופר לאט</li>
          <li class="text-gray-700">• בהוראה שלכם נעבור לעמוד על רגל ימין, ידיים מפוסקות לצדדים, ונרגיש את משקל הגוף. ומעבר לרגל השניה עם הידיים מפוסקות</li>
          <li class="text-gray-700">• ננסה את הפעולה בעיניים עצומות</li>
          <li class="text-gray-700">• נעמוד על נקודה אחת עם 2 הרגליים. קופצים ומחליפים רגליים, רגל שמאל קדימה וימין אחורה</li>
        </ul>
      </div>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">3. משחק הנקודות</h3>
        <p class="text-gray-700 mb-2">שמים מוזיקה קופצנית ברקע. כל פעם כשהמוזיקה עוצרת צריך לעמוד על נקודה.</p>
        <p class="text-gray-700 mb-2">אפשר כל פעם לתת הוראה אחרת על איך לעמוד על הנקודה:</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700 text-sm">• אפשר רגל אחת כל פעם</li>
          <li class="text-gray-700 text-sm">• לגעת בה רק עם יד ימין ואז יד שמאל ואז שתי ידיים</li>
          <li class="text-gray-700 text-sm">• אפשר לגעת עם איברים שונים כל פעם</li>
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
      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 1: נקודות פעילות בזיגזג</h3>
        <p class="text-gray-700">לסדר את נקודות פעילות בזיגזג - צועדים על הנקודות, כל פעם רק רגל אחת על נקודה. הילדים צריכים להעביר את המשקל מצד לצד. לחזור על הפעולה רק לאחור או פשוט לחזור את המסלול לכיוון השני.</p>
      </div>
      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 2: נדנדה גדולה</h3>
        <p class="text-gray-700 mb-2">לפרוס מזרון יוגה, להניח את המשולש ועליו את הנדנדה. בצד אחד של הנדנדה יש קרש קטן, נניח את הנדנדה כשהקרש בצד בו הילדים יתחילו את המסלול.</p>
        <p class="text-gray-700 font-semibold mb-2">הוראות:</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• עולים על הנדנדה מההתחלה</li>
          <li class="text-gray-700">• כשמגיעים לקו הצהוב עוצרים</li>
          <li class="text-gray-700">• מעבירים רגל אחת אל הצד השני ולאט לאט מעבירים את המשקל והנדנדה יורדת</li>
        </ul>
        <p class="text-gray-700 text-sm italic mt-2">💡 לשים לב לא להזמין הרבה ילדים ביחד שלא יעמדו ליד הנדנדה</p>
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
        <li class="flex items-start gap-2"><span class="text-pink-500">•</span><span class="text-gray-700">לעמוד באמצע ולהזמין לחיבוק פרידה מי שרוצה</span></li>
        <li class="flex items-start gap-2"><span class="text-pink-500">•</span><span class="text-gray-700">אפשר לעשות הרפייה על הרצפה, לכבות את האורות בגן ולשים מוזיקה מרגיעה</span></li>
        <li class="flex items-start gap-2"><span class="text-pink-500">•</span><span class="text-gray-700">אפשר להנחות אותם לפתוח את הידיים גדול גדול לצדדים ואז לקרב לאט לאט עד שמגיעים לחיבוק עצמי. לתת נשיקה לכל כתף ולהגיד תודה לגוף שלי</span></li>
        <li class="flex items-start gap-2"><span class="text-pink-500">•</span><span class="text-gray-700">אפשר למתוח את הגוף ולעשות לו מסאז לכל חלק בגוף</span></li>
      </ul>
    </div>
  </div>

  <div class="bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 rounded-xl shadow-lg p-6 text-center">
    <h3 class="text-xl font-bold text-yellow-900 mb-2 flex items-center justify-center gap-2">
      <span>🎖️</span>
      חלוקת חותמת: סרטן גדול
    </h3>
    <p class="text-3xl">🦀</p>
  </div>

  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md py-4">
    <p class="text-xl font-bold">בהצלחה! 🎉</p>
  </div>

</div>
`,

  'שיווי משקל 13': `
<div class="max-w-4xl mx-auto space-y-6">
  
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 13 - שיווי משקל, קורדינציה וויסות כוח</h1>
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
      <p class="text-gray-700 text-sm">37 ספוג קשה מרובע או קוביות יוגה, 2 כריות אוויר, 4 קורות עץ, 2 מתקנים מעץ, 2 נדנדות</p>
    </div>
    <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⭐</span>
        <h3 class="font-bold text-green-900">חותמת</h3>
      </div>
      <p class="text-gray-700">פרה</p>
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
        <li class="flex items-start gap-2"><span class="text-blue-500 mt-1">•</span><span class="text-gray-700">הילדים ילמדו לשמור על שיווי משקל סטטי ודינמי</span></li>
        <li class="flex items-start gap-2"><span class="text-blue-500 mt-1">•</span><span class="text-gray-700">הילדים ילמדו לאזן אביזרים על חלקי גוף שונים</span></li>
        <li class="flex items-start gap-2"><span class="text-blue-500 mt-1">•</span><span class="text-gray-700">הילדים יכירו את המושג קורדינציה ויתרגלו את העבודה עליה</span></li>
        <li class="flex items-start gap-2"><span class="text-blue-500 mt-1">•</span><span class="text-gray-700">הילדים יכירו תנועה סיבובית ותנועה של המפרקים בגוף</span></li>
        <li class="flex items-start gap-2"><span class="text-blue-500 mt-1">•</span><span class="text-gray-700">הילדים ילמדו לשמור על שיווי משקל נגד כוחות חיצוניים (דחיפה)</span></li>
        <li class="flex items-start gap-2"><span class="text-blue-500 mt-1">•</span><span class="text-gray-700">הילדים יכירו את תפקידם של השרירים ואת היכולת לווסת את הכוח שהם מפעילים</span></li>
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
        <h3 class="font-bold text-gray-800 mb-2">1. חימום עם מוזיקה - "לעוף" (נעה קירל)</h3>
        <p class="text-gray-700 mb-2">מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך.</p>
        <p class="text-gray-700 mb-2">עושים חימום של כל איברי הגוף השונים. מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.</p>
        <p class="text-gray-700 mb-2">מבקשים מהם ללכת מהר, ואז ממש לאט במהירויות שונות.</p>
        <p class="text-gray-700">ללכת בהליכות שונות בחדר - הליכה צידית, משקל מרגל לרגל, עקב אחרי אגודל, קפיצת צפרדע, הליכת סרטן, הליכת ברווז - הליכה שפופה.</p>
      </div>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. שיר רקע - "קפיץ קפוץ נקפץ"</h3>
        <p class="text-gray-700">לפי מילות השיר, בעמידה.</p>
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
      <p class="text-gray-700 mb-3">מחלקים לכל ילד קוביית יוגה / ספוגים כחולים.</p>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">1. חוקרים את הקוביות</h3>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• מה המרקם שלהם?</li>
          <li class="text-gray-700">• מה הצבע?</li>
          <li class="text-gray-700">• קשה או רך?</li>
          <li class="text-gray-700">• גמיש או קשה?</li>
        </ul>
        <p class="text-gray-700 mt-2">לנסות לייצב את הקובייה על היד ועל איברים שונים בישיבה ואז בעמידה.</p>
      </div>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. תרגילים עם הקוביה</h3>
        <p class="text-gray-700 mb-2">לבקש מהילדים לעמוד ולהניח את הקוביה מולם:</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• לנסות לעמוד עם רגל אחת על הקובייה</li>
          <li class="text-gray-700">• לנסות לשבת על הקובייה ולהרים את הרגליים למעלה כשהם צמודות וישרות שלא יגעו ברצפה</li>
          <li class="text-gray-700">• לשכב על הצד על הקובייה ולהרים את הידיים והרגליים מהרצפה</li>
          <li class="text-gray-700">• לשכב על הבטן על הקובייה ולהרים את הידיים והרגליים באוויר</li>
          <li class="text-gray-700">• לשכב על הגב ולהרים את הרגליים והידיים</li>
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
      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 1: כריות אוויר</h3>
        <p class="text-gray-700">2 כריות אוויר - לעמוד ברגלים פסוקות על הפיתה ולהתנדנד מצד לצד.</p>
      </div>
      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 2: קורות עץ על הרצפה</h3>
        <p class="text-gray-700">2 קורות עץ מונחות על הרצפה במרחק אחת מהשנייה - ללכת בפיסוק רגליים קטן.</p>
      </div>
      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 3: קורות עץ במתקן</h3>
        <p class="text-gray-700">2 קורות עץ בתוך מתקן העץ, כל צד עומד על נדנדה.</p>
      </div>
      <p class="text-gray-700 text-sm italic mt-3">💡 פירוק המסלול בעזרת מי שישב וכיבד את החברים, כל ילד שבחרנו מביא כרית אחת, את קורות העץ את מרימה</p>
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
        <li class="flex items-start gap-2"><span class="text-pink-500">•</span><span class="text-gray-700">לעמוד באמצע ולהזמין לחיבוק פרידה מי שרוצה</span></li>
        <li class="flex items-start gap-2"><span class="text-pink-500">•</span><span class="text-gray-700">אפשר לעשות הרפייה על הרצפה, לכבות את האורות בגן ולשים מוזיקה מרגיעה</span></li>
        <li class="flex items-start gap-2"><span class="text-pink-500">•</span><span class="text-gray-700">אפשר להנחות אותם לפתוח את הידיים גדול גדול לצדדים ואז לקרב לאט לאט עד שמגיעים לחיבוק עצמי. לתת נשיקה לכל כתף ולהגיד תודה לגוף שלי</span></li>
        <li class="flex items-start gap-2"><span class="text-pink-500">•</span><span class="text-gray-700">אפשר למתוח את הגוף ולעשות לו מסאז לכל חלק בגוף</span></li>
      </ul>
    </div>
  </div>

  <div class="bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 rounded-xl shadow-lg p-6 text-center">
    <h3 class="text-xl font-bold text-yellow-900 mb-2 flex items-center justify-center gap-2">
      <span>🎖️</span>
      חלוקת חותמת: פרה
    </h3>
    <p class="text-3xl">🐄</p>
  </div>

  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md py-4">
    <p class="text-xl font-bold">בהצלחה! 🎉</p>
  </div>

</div>
`
};

console.log('Starting balance batch 5 (FINAL!): שיווי משקל 10-13...');

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

console.log('✨✨✨ ALL BALANCE SERIES COMPLETE! (13 lessons) ✨✨✨');
process.exit(0);
