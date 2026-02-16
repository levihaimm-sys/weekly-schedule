/**
 * Test redesign - פתיחת שנה 4 with perfect styling
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const perfectHTML = `
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
      <p class="text-gray-700">37 כריות שעועית</p>
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
        <h3 class="font-bold text-gray-800 mb-2">2. "הוקי פוקי"</h3>
        <p class="text-gray-700">זזים בחדר לפי מילות השיר.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">3. מעגל שמות עם תנועה</h3>
        <p class="text-gray-700 mb-2">קודם כל מציגים את עצמנו ועושים תנועה עם הגוף בישיבה. עושים סבב של כל הילדים וצריך לחקות את התנועה של כל ילד ביחד עם זה שאומרים את השם.</p>
        <p class="text-gray-700 text-sm italic">לדוגמה: "קוראים לי שירה (אני עושה תנועה של מחיאת כף)" - כולם צריכים לחזור אחרי השם שלי יחד עם מחיאת כף</p>
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
        <h3 class="font-bold text-gray-800 mb-2">1. חקירת הכריות</h3>
        <p class="text-gray-700 mb-2">מחלקים לכל ילד כרית שעועית. לתת לילדים לחוש את הכרית ולתאר מה הם מרגישים:</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• איזה מרקם?</li>
          <li class="text-gray-700">• צבע?</li>
          <li class="text-gray-700">• ריח?</li>
          <li class="text-gray-700">• קשה, רך?</li>
        </ul>
        <p class="text-gray-700 text-sm italic mt-2">ממש לאפיין את הכריות ולחוש אותן עם כל החושים</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. איזון הכרית בעמידה</h3>
        <p class="text-gray-700 mb-2">בעמידה - תוך כדי צעידה בחדר להניח את הכרית מבלי שתיפול על:</p>
        <p class="text-gray-700">הראש, כף היד, גב כף היד, האף, הכתף, מרפק, ברך, גב כף הרגל</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">3. איזון בעמידה על רגל אחת</h3>
        <p class="text-gray-700">בעמידה על רגל אחת - אותם האיברים.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">4. תרגילים בשכיבה על הגב</h3>
        <p class="text-gray-700 mb-2">בשכיבה על הגב - כרית על כף הרגל. נעמוד כמו סרטן והכרית על הבטן:</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• נרים רגל אחת ושהכרית לא תיפול</li>
          <li class="text-gray-700">• רגל שניה</li>
          <li class="text-gray-700">• ננסה להרים יד אחת ויד שניה</li>
        </ul>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">5-7. תרגילי זחילה והליכה</h3>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• <span class="font-semibold">בשכיבה על הבטן:</span> כרית על הגב ונזחל כמו נחש</li>
          <li class="text-gray-700">• <span class="font-semibold">עמידת שש:</span> כרית על הגב ונלך כמו כלב</li>
          <li class="text-gray-700">• <span class="font-semibold">עמידה על ארבע:</span> כרית על הישבן ונלך עם עכביש, טוסיק למעלה</li>
        </ul>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">8. משחק הפסלים</h3>
        <p class="text-gray-700 mb-2">להניח את הכריות על הרצפה בחדר. מטיילים מסביב לכריות.</p>
        <p class="text-gray-700 mb-2">בכל פעם שהמוזיקה פועלת נתקדם לפי הוראה שאתן (נדלג, נרוץ, נקפוץ). כשהמוזיקה תעצור, נעצור מעל כרית ונקבל הוראה חדשה:</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• מרפק על כרית</li>
          <li class="text-gray-700">• רק הישבן על הכרית (ידיים ורגליים באוויר)</li>
          <li class="text-gray-700">• להעביר את הכרית מיד ליד מבלי שתיפול</li>
          <li class="text-gray-700">• נעמוד על רגל אחת, הרגל שבאוויר כשכף הרגל לכיוון הישבן וננסה לאזן את הכרית על כף הרגל (לקטנים - הרגל שבאוויר כפופה מלפנים ונאזן את הכרית על הירך)</li>
        </ul>
        <p class="text-gray-700 text-sm italic mt-2">💡 בנוסף, אפשר לשים להם שוב את השיר "רוצו רוצו" וישוטטו בין הכריות ויעצרו בין הכריות מבלי לגעת בהם</p>
        <p class="text-gray-700 text-sm mt-2">משאירים את הכריות מפוזרות בחדר וחוזרים לשבת במקום</p>
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
        <h3 class="font-bold text-orange-900 mb-2">מסלול 1: נחש מפותל</h3>
        <p class="text-gray-700 mb-2">נסדר מסלול ארוך מכל הכריות - מפותל כמו נחש. ניצור רווח קטן בין כרית לכרית כדי שלא יהיו צמודים אחד לשני ונתקדם כל הילדים ביחד.</p>
        <p class="text-gray-700 mb-2">נזמין אותם אחד אחרי השני ברצף שכולם ילכו ביחד.</p>
        <p class="text-gray-700">נלך מעל הכריות ועל הכריות.</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">מסלול 2: זיגזג</h3>
        <p class="text-gray-700 mb-2">נסדר את המסלול בזיגזג ושוב ילכו מעל ועל הכריות.</p>
        <p class="text-gray-700 text-sm">אפשר לשלב צורות התקדמות: על קצות האצבעות, עקבים, קפיצות וכד'...</p>
        <p class="text-gray-700 text-sm italic mt-2">💡 אם הילדים גדולים אפשר ליצור צורה יותר מורכבת כדי ללכת עליה במסלול</p>
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
`;

console.log('Testing redesign: פתיחת שנה 4...');

const { data } = await supabase
  .from('lesson_plans')
  .select('id')
  .eq('name', 'פתיחת שנה 4')
  .single();

if (data) {
  await supabase
    .from('lesson_plans')
    .update({ content: perfectHTML })
    .eq('id', data.id);
  console.log('✅ פתיחת שנה 4 - REDESIGNED WITH PERFECT STYLING!');
} else {
  console.log('❌ Not found: פתיחת שנה 4');
}

console.log('✨ Test complete! Please check the result in the app.');
process.exit(0);
