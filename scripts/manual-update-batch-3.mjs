/**
 * Manual perfect styling - Batch 3
 * מערכים 4-6 מפתיחת שנה
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
  'פתיחת שנה 4': `
<div class="max-w-4xl mx-auto space-y-6">
  
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 4 - פתיחת שנה ומודעות לגוף</h1>
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
      <p class="text-gray-700 text-sm">37 כריות שעועית</p>
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
        <h3 class="font-bold text-gray-800 mb-2">2. "הוקי פוקי" - זזים בחדר לפי מילות השיר</h3>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">3. מעגל שמות עם תנועה</h3>
        <p class="text-gray-700 mb-2">קודם כל מציגים את עצמנו ועושים תנועה עם הגוף בישיבה.</p>
        <p class="text-gray-700 mb-2">עושים סבב של כל הילדים וצריך לחקות את התנועה של כל ילד ביחד עם זה שאומרים את השם.</p>
        <p class="text-gray-700 italic">"קוראים לי שירה (אני עושה תנועה של מחיאת כף)" - כולם צריכים לחזור אחרי השם שלי יחד עם מחיאת כף.</p>
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
        <h3 class="font-bold text-gray-800 mb-2">1. חקירת הכרית</h3>
        <p class="text-gray-700 mb-2">מחלקים לכל ילד כרית שעועית - לתת לילדים לחוש את הכרית ולתאר מה הם מרגישים:</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• איזה מרקם?</li>
          <li class="text-gray-700">• צבע?</li>
          <li class="text-gray-700">• ריח?</li>
          <li class="text-gray-700">• קשה, רך?</li>
        </ul>
        <p class="text-gray-700 mt-2">ממש לאפיין את הכריות ולחוש אותן עם כל החושים.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. איזון בעמידה</h3>
        <p class="text-gray-700 mb-2">בעמידה - תוך כדי צעידה בחדר להניח את הכרית מבלי שתיפול:</p>
        <p class="text-gray-700">על הראש, כף היד, גב כף היד, האף, הכתף, מרפק, ברך, גב כף הרגל.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">3. איזון בעמידה על רגל אחת</h3>
        <p class="text-gray-700">בעמידה על רגל אחת - אותם האיברים.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">4. תרגילים בשכיבה</h3>
        <div class="space-y-2">
          <p class="text-gray-700"><span class="font-semibold">בשכיבה על הגב:</span> כרית על כף הרגל, נעמוד כמו סרטן והכרית על הבטן - נרים רגל אחת ושהכרית לא תיפול, רגל שניה, ננסה להרים יד אחת ויד שניה.</p>
          <p class="text-gray-700"><span class="font-semibold">בשכיבה על הבטן:</span> כרית על הגב ונזחל כמו נחש.</p>
          <p class="text-gray-700"><span class="font-semibold">עמידת שש:</span> כרית על הגב ונלך כמו כלב.</p>
          <p class="text-gray-700"><span class="font-semibold">עמידה על ארבע:</span> כרית על הישבן ונלך עמו עכביש, טוסיק למעלה.</p>
        </div>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">5. משחק הפסלים</h3>
        <p class="text-gray-700 mb-2">להניח את הכריות על הרצפה בחדר ולמטייל מסביב לכריות.</p>
        <p class="text-gray-700 mb-2">בכל פעם שהמוזיקה פועלת נתקדם לפי הוראה שאתן (נדלג, נרוץ, נקפוץ..).</p>
        <p class="text-gray-700 mb-2">כשהמוזיקה תעצור, נעצור מעל כרית ונקבל הוראה חדשה:</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• מרפק על כרית</li>
          <li class="text-gray-700">• רק הישבן על הכרית (ידיים ורגליים באוויר)</li>
          <li class="text-gray-700">• להעביר את הכרית מיד ליד מבלי שתיפול</li>
          <li class="text-gray-700">• נעמוד על רגל אחת, הרגל שבאוויר כשכף הרגל לכיוון הישבן וננסה לאזן את הכרית על כף הרגל (לקטנים - הרגל שבאוויר כפופה מלפנים ונאזן את הכרית על הירך)</li>
        </ul>
        <p class="text-gray-700 text-sm italic mt-2">💡 אפשר לשים להם שוב את השיר "רוצו רוצו" ושירוצו בין הכריות ויעצרו בין הכריות מבלי לגעת בהם</p>
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
      
      <div>
        <h3 class="font-bold text-orange-900 mb-2">מסלול 1: מסלול מפותל כמו נחש</h3>
        <p class="text-gray-700">נסדר מסלול ארוך מכל הכריות - מפותל כמו נחש.</p>
        <p class="text-gray-700">ניצור רווח קטן בין כרית לכרית כדי שלא יהיו צמודים אחד לשני ונתקדם כל הילדים ביחד.</p>
        <p class="text-gray-700">נזמין אותם אחד אחרי השני ברצף שכולם ילכו ביחד. נלך מעל הכריות ועל הכריות.</p>
      </div>

      <div>
        <h3 class="font-bold text-orange-900 mb-2">מסלול 2: בזיגזג</h3>
        <p class="text-gray-700">נסדר את המסלול בזיגזג ושוב ילכו מעל ועל הכריות.</p>
        <p class="text-gray-700 text-sm italic">💡 אפשר לשלב צורות התקדמות: על קצות האצבעות, עקבים, קפיצות וכד...</p>
        <p class="text-gray-700 text-sm italic">💡 אם הילדים גדולים אפשר ליצור צורה יותר מורכבת כדי ללכת עליה במסלול</p>
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
      חלוקת חותמת: קשת בענן
    </h3>
    <p class="text-3xl">🌈</p>
  </div>

  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md py-4">
    <p class="text-xl font-bold">בהצלחה! 🎉</p>
  </div>

</div>
`,

  'פתיחת שנה 5': `
<div class="max-w-4xl mx-auto space-y-6">
  
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 5 - פתיחת שנה ומודעות לגוף</h1>
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
      <p class="text-gray-700 text-sm">37 בקבוקי באולינג, 10 חישוקים, חבל ארוך מאוד, 4 דליים, 4 כדורים ספוג</p>
    </div>
    <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⭐</span>
        <h3 class="font-bold text-green-900">חותמת</h3>
      </div>
      <p class="text-gray-700">דולפין</p>
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
        <h3 class="font-bold text-gray-800 mb-2">1. חימום עם מוזיקה - "יום סבבה"</h3>
        <p class="text-gray-700 mb-2">מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך.</p>
        <p class="text-gray-700 mb-2">עושים חימום של כל איברי הגוף השונים. מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.</p>
        <p class="text-gray-700">מבקשים מהם ללכת מהר, ואז ממש לאט במהירויות שונות.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. "מי שטוב לו ושמח"</h3>
        <p class="text-gray-700">מסדרים את הילדים במעגל ועושים לפי השיר.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">3. שיר רקע - "צפרדע ירוקה"</h3>
        <p class="text-gray-700 mb-2">לפי מילות השיר - שני חברים עומדים פנים מול פנים נותנים יד ועוד אחת ויוצאים לקפוץ/לרוץ/לדלג.. במרחב.</p>
        <p class="text-gray-700 italic">להזכיר את נושא החודש ולשאול במה שיחקנו בשבוע שעבר.</p>
      </div>

    </div>
  </div>

  <div class="bg-white border-2 border-purple-200 rounded-xl shadow-md overflow-hidden">
    <div class="bg-purple-100 px-6 py-4 border-b-2 border-purple-200">
      <h2 class="text-2xl font-bold text-purple-900 flex items-center gap-2">
        <span>💪</span>
        גוף השיעור: 15 דק'
      </h2>
    </div>
    <div class="p-6 space-y-4">
      
      <div>
        <h3 class="font-bold text-gray-800 mb-2">1. חקירת הבקבוק</h3>
        <p class="text-gray-700 mb-2">כל ילד מקבל בקבוק ומניח אותו בין הברכיים.</p>
        <p class="text-gray-700 mb-2">נשאל את הילדים שאלות על מנת שיחקרו את האביזר בעזרת על החושים:</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• האם הוא כבד או קל?</li>
          <li class="text-gray-700">• מה הצבע שלו?</li>
          <li class="text-gray-700">• מה המרקם שלו?</li>
          <li class="text-gray-700">• האם הוא קשה או רך?</li>
        </ul>
        <p class="text-gray-700 text-sm italic mt-2">(אנחנו רוצים ללמד את הילדים בעזרת החושים לזהות את האביזר ולתת להם אוצר מילים כדי לתאר אותו)</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. תרגילים בישיבה</h3>
        <p class="text-gray-700 mb-2">נשב על הרצפה ישיבה שלמה (רגליים ישרות).</p>
        <p class="text-gray-700 text-sm italic mb-3">💡 בתרגילים הבאים חשוב לציין את שמות האיברים תוך כדי התרגיל והתזוזה. הדגש הוא על איזה איבר בגוף עושה את הפעולה.</p>
        
        <div class="space-y-3">
          <div class="bg-purple-50 rounded-lg p-3">
            <p class="text-gray-700"><span class="font-semibold">תרגיל 1:</span> יד אחת מאחורי הגב ויד אחת מחזיקה את הבקבוק על הרצפה ליד הברך. מעבירים את הבקבוק בהצלבה מצד אחד לשני מעל 2 הרגליים ובחזרה X3 (עושים את זה כל פעם עם יד אחת מסיימים ואז מחליפים ליד השנייה)</p>
          </div>
          
          <div class="bg-purple-50 rounded-lg p-3">
            <p class="text-gray-700 mb-1">נפסק מעט את הרגליים</p>
            <p class="text-gray-700"><span class="font-semibold">תרגיל 2:</span> נקפיץ את הבקבוק למרכז ולצד השני - הצלבה X3 לכל יד</p>
          </div>
          
          <div class="bg-purple-50 rounded-lg p-3">
            <p class="text-gray-700 mb-1">נשלב את הרגליים ישיבה מזרחית</p>
            <p class="text-gray-700"><span class="font-semibold">תרגיל 3:</span> נושיט יד ונניח אותה על הרצפה, עם היד השניה נקפיץ את הבקבוק מתחת ליד המושטת ובחזרה, ומעל היד המושטת ובחזרה X3 לכל יד</p>
          </div>
          
          <div class="bg-purple-50 rounded-lg p-3">
            <p class="text-gray-700"><span class="font-semibold">תרגיל 4:</span> נקפיץ את הבקבוק למעלה גבוהה על הראש ולמטה נמוך אל הריצפה X3 לכל יד</p>
          </div>
          
          <div class="bg-purple-50 rounded-lg p-3">
            <p class="text-gray-700"><span class="font-semibold">תרגיל 5:</span> נדביק את הישבן/אגן לרצפה - נחזיק את הבקבוק עם 2 ידיים ונקפיץ את הבקבוק הכי רחוק שאנחנו יכולים עם הידיים קדימה וקרוב אחורה X3 בלי ניתוק של הישבן/אגן</p>
          </div>
          
          <div class="bg-purple-50 rounded-lg p-3">
            <p class="text-gray-700"><span class="font-semibold">תרגיל 6:</span> נקפיץ את הבקבוק מאחורי הגב, מסתתר ונקפיץ אותו לפנים מציץ X3 לכל יד</p>
          </div>
        </div>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">3. תרגילים בעמידה</h3>
        <p class="text-gray-700 mb-2">עוברים לעמידה: עומדים עם הגב לכיסא ומבצעים את ההוראה בעמידה לפי אותם איברי הגוף כמו שלימדת.</p>
        <p class="text-gray-700 mb-2">למשל מתחת היה בהצלבה של הידיים – יד מתחת ליד - עכשיו להחליף לבין הרגליים.</p>
        <p class="text-gray-700">בצד היה לצד הרגל ומרכז/אמצע היה בין הרגליים.</p>
        <p class="text-gray-700 italic mt-2">💡 לאחר משחק קצר עכשיו כולם לעצום את העיניים ושוב בואו נראה מי יכול לזכור לבד מבלי להסתכל על החברים</p>
        <p class="text-gray-700 text-sm italic mt-2">💡 יש להתאים את רמת הקושי של התרגילים לגיל המודרך. החלקים של העמידה עלולים להיות מורכבים לקטנים. אז ממש לראות מה מתאים לקבוצה שלך.</p>
      </div>

    </div>
  </div>

  <div class="bg-white border-2 border-orange-200 rounded-xl shadow-md overflow-hidden">
    <div class="bg-orange-100 px-6 py-4 border-b-2 border-orange-200">
      <h2 class="text-2xl font-bold text-orange-900 flex items-center gap-2">
        <span>🏃</span>
        מסלול: 10 דק'
      </h2>
    </div>
    <div class="p-6 space-y-4">
      
      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 1: חישוקים</h3>
        <p class="text-gray-700">10 חישוקים מסודרים במעגל והם צריכים לקפוץ מחישוק לחישוק.</p>
        <p class="text-gray-700 text-sm italic">(אפשר להרחיק את החישוקים כדי שיצטרכו לקפוץ רחוק יותר, או לקפוץ על רגל אחת לגדולים יותר)</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 2: חבל ארוך</h3>
        <p class="text-gray-700">ללכת על החבל הארוך שמסודר בצורה של נחש.</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 3: קליעה לדלי</h3>
        <p class="text-gray-700">לזרוק כדור ספוג ולקלוע לדלי שממול (המרחק לפי הגיל המודרך).</p>
        <p class="text-gray-700 text-sm">מסדרים 4 דליים ו-4 כדורי ספוג כדי שלא יצטרכו לחכות.</p>
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
      חלוקת חותמת: דולפין
    </h3>
    <p class="text-3xl">🐬</p>
  </div>

  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md py-4">
    <p class="text-xl font-bold">בהצלחה! 🎉</p>
  </div>

</div>
`,

  'פתיחת שנה 6': `
<div class="max-w-4xl mx-auto space-y-6">
  
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 6 - פתיחת שנה ומודעות לגוף</h1>
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
      <p class="text-gray-700 text-sm">37 גומיות</p>
    </div>
    <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⭐</span>
        <h3 class="font-bold text-green-900">חותמת</h3>
      </div>
      <p class="text-gray-700">ילד</p>
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
        <h3 class="font-bold text-gray-800 mb-2">1. חימום עם מוזיקה - "bailando"</h3>
        <p class="text-gray-700 mb-2">מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך.</p>
        <p class="text-gray-700 mb-2">עושים חימום של כל איברי הגוף השונים. מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.</p>
        <p class="text-gray-700">מבקשים מהם ללכת מהר, ואז ממש לאט במהירויות שונות.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. שיר רקע - "החיות ביער"</h3>
        <p class="text-gray-700">לפי מילות השיר - ללכת על קצות האצבעות בשקט, מי התעורר? לרוץ..., על העקבים, על ארבע, על הגחון</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">3. מציאת הצבע בגן</h3>
        <p class="text-gray-700 mb-2">הילדים מסתובבים במרחב וכל פעם את מכריזה על צבע ואיבר בגוף.</p>
        <p class="text-gray-700 mb-2 italic">"יד ימין על צבע כחול" - הילדים צריכים לחפש ברחבי הגן את הצבע ולשים את האיבר המתאים.</p>
        <p class="text-gray-700 mb-2">אפשר לחקור את כל האיברים השונים.</p>
        <p class="text-gray-700 text-sm italic">💡 אם רוצים לאתגר אותם אפשר להגיד להם ללכת בצורות מסוימת - על שש, על 4, הליכת סרטן, ללכת בזוגות</p>
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
      
      <p class="text-gray-700 font-semibold mb-2">שיר להפעלה - "Dance Monkey - Tones and I"</p>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">1. חקירת הגומייה</h3>
        <p class="text-gray-700 mb-2">כל ילד מקבל גומייה ויחד עם השיר אנחנו חוקרים אותה:</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• מותחים אותה</li>
          <li class="text-gray-700">• מכווצים אותה</li>
          <li class="text-gray-700">• שמים כל פעם על איבר אחר בגוף, לשים על יד ולאזן</li>
          <li class="text-gray-700">• להרים את הרגל ולאזן עליה</li>
          <li class="text-gray-700">• לשים בין שתי ידיים ולפתוח את הידיים ולסגור</li>
          <li class="text-gray-700">• לשבת על הרצפה לשים את זה בין שתי הרגליים ולפתוח</li>
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
      
      <div>
        <h3 class="font-bold text-orange-900 mb-2">הוראות:</h3>
        <p class="text-gray-700 mb-2">להגיד לילדים לקחת את הכסא ולשבת מול מישהו.</p>
        <p class="text-gray-700 mb-2">לעמוד בטור איפה שמתחילים הכסאות.</p>
        <p class="text-gray-700 mb-3">למתוח גומייה מכסא אחד לשני, פעם למטה פעם למעלה.</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תיאור:</h3>
        <p class="text-gray-700 mb-2">הילדים צריכים לעבור בין הגומיות פעם לזחול ופעם מעל הגומייה.</p>
        <p class="text-gray-700 mb-2"><span class="font-semibold">החוק הוא:</span> אסור לגעת בגומיות.</p>
        <p class="text-gray-700 mb-2">מתאימים את רמת הקושי לפי הגיל המודרך:</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• אם הם קטנים - לעשות פחות גומיות וגבהים נוחים</li>
          <li class="text-gray-700">• אם הם גדולים - אפשר לאתגר יותר</li>
        </ul>
        <p class="text-gray-700 text-sm italic mt-2">💡 אפשר לעשות את המסלול כמה פעמים אם נשאר זמן</p>
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
      חלוקת חותמת: ילד
    </h3>
    <p class="text-3xl">👦</p>
  </div>

  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md py-4">
    <p class="text-xl font-bold">בהצלחה! 🎉</p>
  </div>

</div>
`
};

console.log('Starting batch 3: מערכים 4-6...');

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

console.log('✨ Batch 3 complete!');
process.exit(0);
