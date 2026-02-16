/**
 * Perfect styling - Balance lessons 6-9 (FAST!)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Due to file size, doing 2 lessons per file
const lessons = {
  'שיווי משקל 6': `
<div class="max-w-4xl mx-auto space-y-6">
  
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 6 - שיווי משקל, קורדינציה וויסות כוח</h1>
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
      <p class="text-gray-700 text-sm">37 מקלות, 14 קונוסים אדומים ושחורים, 2 סקוטרים, 2 הגה (כהגה להחזקה)</p>
    </div>
    <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⭐</span>
        <h3 class="font-bold text-green-900">חותמת</h3>
      </div>
      <p class="text-gray-700">חתול</p>
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
        <h3 class="font-bold text-gray-800 mb-2">1. חימום עם מוזיקה - "מה שטוב לדוב"</h3>
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
        <p class="text-gray-700 text-sm italic mt-2">💡 יכולה להמציא עוד משפטי תנועה שיעזרו להם להכיר את אברי הגוף השונים. לילדים הגדולים יותר, אפשר לאתגר אותם עם שיווי משקל או התקדמות בצורות הליכה שונות</p>
      </div>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">3. "מה קורה"</h3>
        <p class="text-gray-700">מילות השיר מנחות אותנו לאיזה תנועות לעשות (אפשר בישיבה/עמידה לפי בחירה).</p>
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
      <p class="text-gray-700 mb-3">כל אחד מקבל מקל בתורו ושם אותו על הרצפה בין הרגליים.</p>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">בישיבה - תרגילים עם המקל</h3>
        <p class="text-gray-700 mb-2">ננסה לתת רעיונות מה אפשר לעשות עם המקל כששתי הרגליים שלנו משתתפות בפעילות:</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• בין כפות הרגליים כשהמקל לאורך</li>
          <li class="text-gray-700">• בין כפות הרגליים כשהמקל לרוחב ולנסות להרים את הרגליים שהמקל לא יפול</li>
          <li class="text-gray-700">• לשים מתחת לשתי הברכיים לרוחב</li>
          <li class="text-gray-700">• להחזיק בין הברכיים גם לאורך וגם לרוחב</li>
          <li class="text-gray-700">• לשים את המקל על הריצפה ולשים את שתי כפות הרגליים על המקל ולגלגל כמו מערוך (עם הרגליים)</li>
        </ul>
        <p class="text-gray-700 text-sm italic mt-2">💡 חשוב להעביר את הפעילות כמשחק. יש לתת זמן לרעיונות משלהם ואם יש רעיון שמתקשר לשימוש בשתי רגליים או התעמלות לבקש מכולם לבצע</p>
      </div>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">בעמידה - תרגילים עם המקל</h3>
        <p class="text-gray-700 mb-2">לנסות את הרעיונות שלכם ושלהם בעמידה:</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• לשים את המקל לרוחב בין הברכיים</li>
          <li class="text-gray-700">• לנסות לעלות על קצות האצבעות ולעבור לעקבים תוך כדי שהמקל בין הרגליים</li>
        </ul>
        <p class="text-gray-700 text-sm italic mt-2">החזרת המקלות: כל ילד מחזיר לתיק הגדול/השק את המקל שלו</p>
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
        <h3 class="font-bold text-orange-900 mb-2">תחנה 1: סקוטרים</h3>
        <p class="text-gray-700 mb-2">לסדר 2 סקוטרים בתחילת המסלול - כל ילד יושב בקצה של הסקוטר כששתי הרגליים על הריצפה ומתקדם (בהוראה שלכם), כששתי הרגליים מתקדמות ביחד ולא רגל רגל.</p>
        <p class="text-gray-700 text-sm">יש אפשרות לתת להם להחזיק טבעת כאילו הם אוחזים בהגה ונוסעים או להחזיק את הסקוטר מתחת לישבן</p>
      </div>
      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 2: מעברים בין קונוסים</h3>
        <p class="text-gray-700 mb-2">לסדר 2 מעברים משלוש שורות של קונוסים (7 קונוסים בכל טור). הקונוסים השחורים יוצרים מעברים והילדים יעברו ביניהם (כמו שער).</p>
        <p class="text-gray-700 text-sm">חשוב שהמעברים יהיו מספיק רחבים שיהיה אפשר לעבור ביניהם מבלי לפגוע בקונוסים</p>
        <p class="text-gray-700 text-sm italic mt-2">💡 פירוק המסלול בעזרת מי שישב וכיבד את החברים, כל ילד שבחרנו מביא משורה של קונוסים</p>
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
      חלוקת חותמת: חתול
    </h3>
    <p class="text-3xl">🐱</p>
  </div>

  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md py-4">
    <p class="text-xl font-bold">בהצלחה! 🎉</p>
  </div>

</div>
`,

  'שיווי משקל 7': `
<div class="max-w-4xl mx-auto space-y-6">
  
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 7 - שיווי משקל, קורדינציה וויסות כוח</h1>
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
      <p class="text-gray-700 text-sm">19 חישוקים שטוחים, 19 כריות, 2 רגליים מעץ, 3 כיפות הצלבה, 2 משוכות</p>
    </div>
    <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⭐</span>
        <h3 class="font-bold text-green-900">חותמת</h3>
      </div>
      <p class="text-gray-700">צב</p>
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
        <h3 class="font-bold text-gray-800 mb-2">1. חימום עם מוזיקה - "taki taki"</h3>
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
        <p class="text-gray-700 text-sm italic mt-2">💡 יכולה להמציא עוד משפטי תנועה שיעזרו להם להכיר את אברי הגוף השונים</p>
      </div>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">3. "קדימה ואחורה"</h3>
        <p class="text-gray-700">לפי מילות השיר - קדימה ועצור, סיבוב, גלגול ידיים וקפיצה. אחורה עצור, סיבוב, גלגול ידיים וקפיצה.</p>
        <p class="text-gray-700 text-sm italic">(אפשר לשים את השיר פעמיים ברצף אם הם נהנו)</p>
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
        <h3 class="font-bold text-gray-800 mb-2">חישוקים עגולים וכריות - משחק "צבים במנהרה"</h3>
        <p class="text-gray-700 mb-2">הישיבה היום במעגל. לחצי קבוצה נחלק חישוק ולחצי השני כרית (ילד חישוק, ילד כרית וכן הלאה).</p>
        <p class="text-gray-700 font-semibold mb-2">שיר רקע: "צב"</p>
      </div>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">מנהרת חישוקים</h3>
        <p class="text-gray-700 mb-2">חצי הקבוצה שקיבלה חישוק נשארת לשבת על הכיסא ומניחה את החישוק כשהוא מוחזק בעמידה על הרצפה. נוצר רצף של חישוקים היוצר מנהרה לפי צורת הישיבה.</p>
      </div>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">צבים</h3>
        <p class="text-gray-700 mb-2">כל ילד שקיבל כרית, שם את הכרית על גבו ומדמה שהיא השריון של הצב. עליו ללכת בעמידת שש כשהוא עובר בתוך החישוקים מבלי שיפול השריון (שיווי משקל).</p>
        <p class="text-gray-700 mb-2">כל ילד מתחיל ללכת ממקום הישיבה שלו בכיוון השעון למשך זמן השיר (יש אפשרות לשים את השיר פעמיים).</p>
        <p class="text-gray-700">כל ילד מחליף עם הילד שיושב לידו בהוראה שלכם, כל ילד בתורו (בנגיעה בראשו) לא כולם ביחד. מתחלפים באביזר והקבוצה השנייה עוברת בתוך החישוקים עם הכרית על הגב.</p>
      </div>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">איסוף</h3>
        <p class="text-gray-700">חוזרים לשבת ושמים את החישוק על הרצפה והכרית של החבר שיושב לידו בתוכה. לבחור ילדים שיעזרו לאסוף - אפשר לתת להם להרים את הציוד לפי חלוקה לצבעים.</p>
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
      <p class="text-gray-700 mb-3">מסדרים את הצורות הגיאומטריות אחת אחרי השנייה:</p>
      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 1: ללכת מסביב לצורות</h3>
        <p class="text-gray-700">5 חישוקים בשורה ואז 2 משוכות. לשים את הכרית על הראש וללכת מסביב לצורות הגיאומטריות - להקיף כל אחת.</p>
      </div>
      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 2: קפיצה בחישוקים</h3>
        <p class="text-gray-700">בחישוקים הם צריכים להחזיק את הכרית עם הידיים ולקפוץ מחישוק לחישוק.</p>
      </div>
      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 3: זחילת צב</h3>
        <p class="text-gray-700">בסוף שמים את הכרית על הגב כמו צב שעשינו בהתחלה וללכת על שש מתחת למשוכות.</p>
      </div>
      <p class="text-gray-700 text-sm italic mt-3">הליכה במסלול מבלי לגעת בצורות</p>
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
      חלוקת חותמת: צב
    </h3>
    <p class="text-3xl">🐢</p>
  </div>

  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md py-4">
    <p class="text-xl font-bold">בהצלחה! 🎉</p>
  </div>

</div>
`
};

console.log('Starting balance batch 3: שיווי משקל 6-7...');

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

console.log('✨ Balance batch 3 complete!');
process.exit(0);
