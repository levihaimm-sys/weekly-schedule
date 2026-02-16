/**
 * Perfect styling - Balance lessons 8-9
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
  'שיווי משקל 8': `
<div class="max-w-4xl mx-auto space-y-6">
  
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 8 - שיווי משקל, קורדינציה וויסות כוח</h1>
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
      <p class="text-gray-700 text-sm">37 חבלים אישיים, 4 נדנדות, קורת פלציב</p>
    </div>
    <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⭐</span>
        <h3 class="font-bold text-green-900">חותמת</h3>
      </div>
      <p class="text-gray-700">זברה</p>
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
        <h3 class="font-bold text-gray-800 mb-2">1. חימום עם מוזיקה - "לינדה"</h3>
        <p class="text-gray-700 mb-2">מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך.</p>
        <p class="text-gray-700 mb-2">עושים חימום של כל איברי הגוף השונים. מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.</p>
        <p class="text-gray-700 mb-2">מבקשים מהם ללכת מהר, ואז ממש לאט במהירויות שונות.</p>
        <p class="text-gray-700">ללכת בהליכות שונות בחדר - הליכה צידית, משקל מרגל לרגל, עקב אחרי אגודל, קפיצת צפרדע, הליכת סרטן, הליכת ברווז - הליכה שפופה.</p>
      </div>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. "המלך אמר"</h3>
        <p class="text-gray-700 mb-2">אתן אומרות את המשפט - "המלך אמר - לשים יד על הראש" והם צריכים לבצע את הפעולה כמה שיותר מהר:</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• לשים 2 ידיים על המותניים</li>
          <li class="text-gray-700">• להזיז את הישבן מצד לצד</li>
          <li class="text-gray-700">• לשבת על הרצפה</li>
          <li class="text-gray-700">• למחוא כף</li>
        </ul>
      </div>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">3. "קדימה ואחורה"</h3>
        <p class="text-gray-700">לפי מילות השיר - קדימה ועצור, סיבוב, גלגול ידיים וקפיצה. אחורה עצור, סיבוב, גלגול ידיים וקפיצה.</p>
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
        <h3 class="font-bold text-gray-800 mb-2">מחלקים לכל ילד חבל</h3>
      </div>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">1. חקירה עם החבל</h3>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• מה הצבע?</li>
          <li class="text-gray-700">• מה המרקם - מחוספס או חלק?</li>
          <li class="text-gray-700">• רך או קשה?</li>
          <li class="text-gray-700">• גמיש או קשיח?</li>
        </ul>
      </div>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. מתיחות עם החבל</h3>
        <p class="text-gray-700 mb-2">מבקשים מהילדים לעמוד ולמתוח חזק חזק את החבל:</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• להרים מעל הראש</li>
          <li class="text-gray-700">• מול הגוף בידיים ישרות</li>
          <li class="text-gray-700">• למתוח אותו למטה</li>
          <li class="text-gray-700">• למתוח לצדדים</li>
        </ul>
      </div>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">3. קפיצה מעל החבל</h3>
        <p class="text-gray-700 mb-2">להחזיק את החבל בשתי ידיים וללמד אותם לקפוץ מעל החבל:</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• פעם רגל רגל</li>
          <li class="text-gray-700">• ואז להצמיד את שתי הרגליים ולקפוץ יחד</li>
        </ul>
        <p class="text-gray-700 text-sm italic mt-2">💡 לתת לילדים זמן להתאמן על הקפיצה בחבל</p>
        <p class="text-gray-700 text-sm italic">💡 אפשר לשים ברקע את המוזיקה של החימום ולעזור להם לתרגל</p>
        <p class="text-gray-700 text-sm mt-2">בסיום כל ילד מחזיר את החבל שלו לשק ומתיישב</p>
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
        <h3 class="font-bold text-orange-900 mb-2">תחנה 1: קפיצה בחבל</h3>
        <p class="text-gray-700">2 חבלים - הם קופצים בחבל עד נקודה מסוימת.</p>
      </div>
      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 2: נדנדות</h3>
        <p class="text-gray-700">עוברים על שורה של נדנדות בשמירה על שיווי משקל (לקטנים לעזור עם יד).</p>
      </div>
      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 3: קורת פלציב</h3>
        <p class="text-gray-700">ובסוף הולכים בשיווי משקל על קורת פלציב.</p>
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
      חלוקת חותמת: זברה
    </h3>
    <p class="text-3xl">🦓</p>
  </div>

  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md py-4">
    <p class="text-xl font-bold">בהצלחה! 🎉</p>
  </div>

</div>
`,

  'שיווי משקל 9': `
<div class="max-w-4xl mx-auto space-y-6">
  
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 9 - שיווי משקל, קורדינציה וויסות כוח</h1>
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
      <p class="text-gray-700 text-sm">37 צלחת לוויסות כוח, 37 משקולות לצלחת, צלחת מסתובבת, 4 קרוסלות עץ, מזרון צבעוני, 2 נקודות סימון אדום וכחול</p>
    </div>
    <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⭐</span>
        <h3 class="font-bold text-green-900">חותמת</h3>
      </div>
      <p class="text-gray-700">תנין</p>
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
        <h3 class="font-bold text-gray-800 mb-2">3. "יד ביד"</h3>
        <p class="text-gray-700">לפי מילות השיר (אפשר לשים את השיר פעמיים ברצף אם הם נהנו).</p>
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
        <h3 class="font-bold text-gray-800 mb-2">1. הסבר איך להשתמש בצלחת</h3>
        <p class="text-gray-700 mb-2">נסביר לילדים:</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• איך אוחזים את הצלחת והיכן מניחים את האצבעות</li>
          <li class="text-gray-700">• לאיזה כיוון מגלגלים את המשקולת</li>
          <li class="text-gray-700">• לא ניתן לגעת ולהרים את המשקולת מהצלחת</li>
          <li class="text-gray-700">• ננסה לגלגל את המשקולת שתחזור לבית שלה</li>
        </ul>
      </div>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. חלוקת הציוד ותרגול</h3>
        <p class="text-gray-700 mb-2">נחלק לכל ילד צלחת ולאחר מכן לכל ילד משקולת.</p>
        <p class="text-gray-700 font-semibold text-red-600 mb-2">⚠️ דגש חשוב: לשים לב שאף ילד לא מחזיק את המשקולת או מכניס אותה לפה!</p>
        <div class="space-y-2">
          <p class="text-gray-700"><span class="font-semibold">בישיבה על הכיסא:</span> נחזיק את הצלחת וננסה להחזיר את המשקולת לבית שלה</p>
          <p class="text-gray-700"><span class="font-semibold">בעמידה:</span> ננסה להחזיר את המשקולת לבית שלה בזמן שאנו הולכים במרחב החדר - נלך על קצות האצבעות, על העקבים, אחורה...</p>
        </div>
        <p class="text-gray-700 text-sm italic mt-2">💡 יש לתת זמן לרעיונות משלהם ואם יש רעיון שמתקשר לגלגולים או סיבובים לבקש מכולם לבצע</p>
      </div>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">3. החזרת הצלחת והמשקולת</h3>
        <p class="text-gray-700">כל ילד מניח את הצלחת כשהמשקולת בתוכה ליד מקום הישיבה שלנו וחוזר לשבת במקום. לספור שכל הצלחות וכל המשקולות חזרו אלינו ולא נשארה משקולת בגן.</p>
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
        <h3 class="font-bold text-orange-900 mb-2">טור ראשון</h3>
        <p class="text-gray-700">מסתובב בעמידה על צלחת מסתובבת, הולכים על 4 קרוסלות מעץ.</p>
      </div>
      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">טור שני - גלגול על מזרון צבעוני</h3>
        <p class="text-gray-700 mb-2"><span class="font-semibold">גלגול צידי:</span> נסמן בעזרת נקודת סימון איפה הראש מונח ואיפה הרגליים - הראש על הנקודה הכחולה והרגליים לכיוון הנקודה האדומה. לשים לב שאנו מחליפים להם את הצד של הראש והרגליים משיעור לשיעור שיתגלגלו פעם מצד ימין שלהם ופעם מצד שמאל.</p>
        <p class="text-gray-700 mt-2"><span class="font-semibold">גלגול אחורי:</span> הילד מגיע אלינו, יורד לישיבה שפופה, נשכב לאט ובזהירות אחורה. מניח את שתי כפות הידיים לצידי הראש (ליד האוזן, מרפקים כלפי מעלה), מרים את הרגליים עד שיגעו באף.</p>
        <p class="text-gray-700 mt-2">אנו עומדים לצידם. כשהרגליים מגיעות אל האף אנו נותנים להם תנופה ודוחפים את האגן שלהם לכיוון הגלגול. הילד צריך לדחוף חזק את המזרון עם שתי כפות הידיים בספירה שלך עד שלוש כשהרגליים מגיעות אל האף.</p>
        <p class="text-gray-700 text-sm italic mt-2">💡 לשים לב בגלגול שהרגליים נוטות לכיוון ימין או שמאל ולא בקו ישר מעל הראש</p>
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
      חלוקת חותמת: תנין
    </h3>
    <p class="text-3xl">🐊</p>
  </div>

  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md py-4">
    <p class="text-xl font-bold">בהצלחה! 🎉</p>
  </div>

</div>
`
};

console.log('Starting balance batch 4: שיווי משקל 8-9...');

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

console.log('✨ Balance batch 4 complete!');
process.exit(0);
