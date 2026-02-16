import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const lessons = {
  'גמישות תנועה 4': `
<div class="max-w-4xl mx-auto space-y-6">
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 4 - גמישות, תנועה ונופש פעיל</h1>
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
        <span class="text-2xl">🥁</span>
        <h3 class="font-bold text-green-900">ציוד</h3>
      </div>
      <p class="text-gray-700 text-sm">37 מקלות הקשה, מזרון יוגה, 2 דליים, 2 כדורי ספוג, 2 קונוסים כתומים, מנהרת קפיץ</p>
    </div>

    <div class="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⚽</span>
        <h3 class="font-bold text-purple-900">חותמת</h3>
      </div>
      <p class="text-gray-700">כדור</p>
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
        <span>הילדים יכירו ויתרגלו את הגמישות של הגוף</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>הילדים יתנסו בגלגול לפנים, גלגול לאחור, עמידת נר - תרגילי התעמלות קרקע</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>הילדים יתנסו בזכרון תנועתי של משפטי תנועה</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>תזוזה של הגוף במרחב לפי מקצבים שונים של מוזיקה</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>היכרות עם משחקים לנופש פעיל</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>סיכום המיומנויות שנלמדו במהלך השנה</span>
      </li>
    </ul>
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
          1. חימום עם מוזיקה - טריליליללה
        </h3>
        <p class="text-gray-700 leading-relaxed">
          מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך. עושים חימום של כל איברי הגוף השונים.
          מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.
        </p>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <h3 class="font-bold text-green-900 mb-3 flex items-center gap-2">
          <span>🎶</span>
          2. ALL ABOUT THE BASE
        </h3>
        <p class="text-gray-700 text-sm">מחלקים את הילדים לזוגות והם צריכים כל פעם לחקות את מי שמולם בתנועות שהוא עושה. ואז מתחלפים.</p>
        <p class="text-gray-600 text-sm italic mt-2">אנחנו רוצים שהילדים ילמדו לבטא את הגוף עם הגוף שלהם את המוזיקה</p>
      </div>

      <div class="bg-purple-50 rounded-lg p-4">
        <h3 class="font-bold text-purple-900 mb-2 flex items-center gap-2">
          <span>👏</span>
          3. משחק מחיאות כפיים
        </h3>
        <p class="text-gray-700 text-sm mb-2">נותנים לילדים מקצבים שונים עם הכפיים ומבקשים מהם לחקות את המקצב שאנחנו עשינו.</p>
        <p class="text-gray-700 text-sm">2 מחיאות כפיים, 2 מחיאות כפיים וקריאת וואו. אפשר להמציא גם מקצבים מהפה ע"י השמעת קולות (להגיד לילדים לחקות אותנו)</p>
        <p class="text-gray-600 text-sm italic mt-2">להזכיר את נושא החודש ולשאול במה שיחקנו בשבוע שעבר - אנחנו רוצים להתחיל לסכם איתם את השנה ולהזכיר להם את הדברים שלמדנו תוך כדי</p>
      </div>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">🥁</span>
      <h2 class="text-2xl font-bold text-green-800">גוף השיעור - 10 דקות</h2>
    </div>
    
    <div class="space-y-4">
      <div class="bg-yellow-50 rounded-lg p-4 border-r-4 border-yellow-500">
        <p class="text-gray-700 leading-relaxed">
          מחלקים לכל ילד 2 מקלות הקשה
        </p>
      </div>

      <div class="bg-blue-50 rounded-lg p-4">
        <h4 class="font-semibold text-blue-900 mb-2">1. לומדים להכיר את האביזר</h4>
        <p class="text-gray-700 text-sm mb-2">שואלים את הילדים:</p>
        <ul class="space-y-1 text-sm text-gray-700 mr-4">
          <li>• מה הצבע של המקלות?</li>
          <li>• קשים או רכים?</li>
          <li>• גמישים או נוקשים?</li>
          <li>• מחסופסים או חלקים?</li>
          <li>• ממה הם עשויים? (עץ)</li>
        </ul>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <h4 class="font-semibold text-green-900 mb-2">2. משחק הקצב 🎵</h4>
        <p class="text-gray-700 text-sm">מלמדים את הילדים להקיש במקלות ומשחקים איתם את המשחק של הקצב כמו שעשינו בחימום. נותנים להם מקצב והם צריכים לחקות אותנו.</p>
        <p class="text-gray-600 text-sm italic mt-2">לתת להם מקצבים שונים ומאתגרים, אם הם טעו לעשות שוב</p>
        <p class="text-red-600 text-sm font-semibold mt-2">* מחזירים בחזרה את המקלות לשק</p>
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
        <h3 class="font-bold text-purple-900 mb-2">1. מזרון יוגה - גלגול עיפרון ✏️</h3>
        <p class="text-gray-700 text-sm">נבקש מהילדים לעשות גלגול על הצד, כמו עיפרון. הראש והרגליים מחוץ למזרון</p>
      </div>

      <div class="bg-pink-50 rounded-lg p-4">
        <h3 class="font-bold text-pink-900 mb-2">2. קונוסים - הליכת סרטן 🦀</h3>
        <p class="text-gray-700 text-sm">2 קונוסים - נבקש מהילדים ללכת בהליכת סרטן מקונוס אחד לשני (המרחק תלוי בגיל המודרך)</p>
      </div>

      <div class="bg-blue-50 rounded-lg p-4">
        <h3 class="font-bold text-blue-900 mb-2">3. מנהרת קפיץ 🏃</h3>
        <p class="text-gray-700 text-sm">הילדים צריכים לזחול בתוך המנהרה</p>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <h3 class="font-bold text-green-900 mb-2">4. קליעה לדליים 🎯</h3>
        <p class="text-gray-700 text-sm">2 דליים + 2 כדורי ספוג - לקלוע את הכדור לדלי (המרחק תלוי בגיל המודרך)</p>
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
    <p class="text-2xl font-bold">⚽ חלוקת חותמת: כדור</p>
    <p class="text-xl mt-2">בהצלחה! 🌟</p>
  </div>
</div>
  `,

  'גמישות תנועה 5': `
<div class="max-w-4xl mx-auto space-y-6">
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 5 - גמישות, תנועה ונופש פעיל</h1>
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
        <span class="text-2xl">💍</span>
        <h3 class="font-bold text-green-900">ציוד</h3>
      </div>
      <p class="text-gray-700">37 טבעות</p>
    </div>

    <div class="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">🐱</span>
        <h3 class="font-bold text-purple-900">חותמת</h3>
      </div>
      <p class="text-gray-700">חתול</p>
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
        <span>הילדים יכירו ויתרגלו את הגמישות של הגוף</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>הילדים יתנסו בגלגול לפנים, גלגול לאחור, עמידת נר - תרגילי התעמלות קרקע</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>הילדים יתנסו בזכרון תנועתי של משפטי תנועה</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>תזוזה של הגוף במרחב לפי מקצבים שונים של מוזיקה</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>היכרות עם משחקים לנופש פעיל</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>סיכום המיומנויות שנלמדו במהלך השנה</span>
      </li>
    </ul>
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
          1. חימום עם מוזיקה - מסיבת ריקודים/יובל המבולבל
        </h3>
        <p class="text-gray-700 leading-relaxed">
          מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך. עושים חימום של כל איברי הגוף השונים.
          מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.
        </p>
      </div>

      <div class="bg-purple-50 rounded-lg p-4">
        <h3 class="font-bold text-purple-900 mb-2 flex items-center gap-2">
          <span>👏</span>
          3. משחק מחיאות כפיים
        </h3>
        <p class="text-gray-700 text-sm mb-2">נותנים לילדים מקצבים שונים עם הכפיים ומבקשים מהם לחקות את המקצב שאנחנו עשינו.</p>
        <p class="text-gray-700 text-sm">2 מחיאות כפיים, 2 מחיאות כפיים וקריאת וואו. אפשר להמציא גם מקצבים מהפה ע"י השמעת קולות (להגיד לילדים לחקות אותנו)</p>
        <p class="text-gray-600 text-sm italic mt-2">להזכיר את נושא החודש ולשאול במה שיחקנו בשבוע שעבר - אנחנו רוצים להתחיל לסכם איתם את השנה ולהזכיר להם את הדברים שלמדנו תוך כדי</p>
      </div>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">🧘</span>
      <h2 class="text-2xl font-bold text-green-800">גוף השיעור - 10 דקות</h2>
    </div>
    
    <div class="space-y-4">
      <div class="bg-yellow-50 rounded-lg p-4 border-r-4 border-yellow-500">
        <h3 class="font-bold text-gray-800 mb-2">1. מלמדים את הילדים למתוח את הגוף והשרירים</h3>
        <p class="text-gray-600 text-sm italic">הכל בישיבה על הרצפה</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="bg-blue-50 rounded-lg p-3">
          <h4 class="font-bold text-blue-800 mb-1">🦋 ישיבת פרפר</h4>
          <p class="text-sm text-gray-700">נשב בישיבת פרפר כפות הרגליים נוגעות אחת בשנייה. מישרים את הגב ומתכופפים לאט לאט קדימה</p>
        </div>

        <div class="bg-green-50 rounded-lg p-3">
          <h4 class="font-bold text-green-800 mb-1">➡️ רגליים קדימה</h4>
          <p class="text-sm text-gray-700">ניישר את הרגליים קדימה אפשר לכופף מעט וגם נתכופף קדימה</p>
        </div>

        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-bold text-purple-800 mb-1">↔️ מתיחה צידית</h4>
          <p class="text-sm text-gray-700">נפתח את הרגליים לצדדים ונגע עם יד שמאל בקצות האצבעות של רגל ימין. ואז הפוך יד ימין בקצות האצבעות של רגל שמאל</p>
        </div>

        <div class="bg-pink-50 rounded-lg p-3">
          <h4 class="font-bold text-pink-800 mb-1">🔄 טוויסט</h4>
          <p class="text-sm text-gray-700">נשב בישיבה מזרחית, נמתח את הידיים למעלה ונסובב את החלק גוף העליון להסתכל אחורה (טוויסט) ואז לצד השני</p>
          <p class="text-red-600 text-xs mt-1">⚠️ לשים לב לא להסתובב בכוח! הכל בעדינות והקשבה לגוף שלנו</p>
        </div>

        <div class="bg-orange-50 rounded-lg p-3">
          <h4 class="font-bold text-orange-800 mb-1">⭐ כוכב וכדור</h4>
          <p class="text-sm text-gray-700">נשכב על הרצפה ונמתח את הגוף חזק לצדדים בצורת כוכב ואז נתכווץ לכדור. לחזור על הפעולה כמה פעמים</p>
        </div>
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
    <p class="text-2xl font-bold">🐱 חלוקת חותמת: חתול</p>
    <p class="text-xl mt-2">בהצלחה! 🌟</p>
  </div>
</div>
  `,

  'גמישות תנועה 6': `
<div class="max-w-4xl mx-auto space-y-6">
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 6 - גמישות, תנועה ונופש פעיל</h1>
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
        <span class="text-2xl">🏊</span>
        <h3 class="font-bold text-green-900">ציוד</h3>
      </div>
      <p class="text-gray-700">37 נודלים, 10 חישוקים, 6 קונוסים</p>
    </div>

    <div class="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">🐑</span>
        <h3 class="font-bold text-purple-900">חותמת</h3>
      </div>
      <p class="text-gray-700">כבשה</p>
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
        <span>הילדים יכירו ויתרגלו את הגמישות של הגוף</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>הילדים יתנסו בגלגול לפנים, גלגול לאחור, עמידת נר - תרגילי התעמלות קרקע</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>הילדים יתנסו בזכרון תנועתי של משפטי תנועה</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>תזוזה של הגוף במרחב לפי מקצבים שונים של מוזיקה</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>היכרות עם משחקים לנופש פעיל</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>סיכום המיומנויות שנלמדו במהלך השנה</span>
      </li>
    </ul>
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
          1. חימום עם מוזיקה - מסיבת ריקודים/יובל המבולבל
        </h3>
        <p class="text-gray-700 leading-relaxed">
          מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך. עושים חימום של כל איברי הגוף השונים.
          מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.
        </p>
      </div>

      <div class="bg-purple-50 rounded-lg p-4">
        <h3 class="font-bold text-purple-900 mb-2 flex items-center gap-2">
          <span>👏</span>
          3. משחק מחיאות כפיים
        </h3>
        <p class="text-gray-700 text-sm mb-2">נותנים לילדים מקצבים שונים עם הכפיים ומבקשים מהם לחקות את המקצב שאנחנו עשינו.</p>
        <p class="text-gray-700 text-sm">2 מחיאות כפיים, 2 מחיאות כפיים וקריאת וואו. אפשר להמציא גם מקצבים מהפה ע"י השמעת קולות (להגיד לילדים לחקות אותנו)</p>
        <p class="text-gray-600 text-sm italic mt-2">להזכיר את נושא החודש ולשאול במה שיחקנו בשבוע שעבר - אנחנו רוצים להתחיל לסכם איתם את השנה ולהזכיר להם את הדברים שלמדנו תוך כדי</p>
      </div>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">🏊</span>
      <h2 class="text-2xl font-bold text-green-800">גוף השיעור - 10 דקות</h2>
    </div>
    
    <div class="space-y-4">
      <div class="bg-yellow-50 rounded-lg p-4 border-r-4 border-yellow-500">
        <h3 class="font-bold text-gray-800 mb-2">1. נחלק לכל ילד חצי נודל</h3>
      </div>

      <div class="bg-blue-50 rounded-lg p-4">
        <h4 class="font-semibold text-blue-900 mb-2">2. נחקור יחד עם הילדים את האביזר</h4>
        <ul class="space-y-1 text-sm text-gray-700 mr-4">
          <li>• איך הוא נראה?</li>
          <li>• מה המרקם שלו?</li>
          <li>• האם הוא רך או קשה?</li>
          <li>• האם הוא גמיש או יציב?</li>
        </ul>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <h4 class="font-semibold text-green-900 mb-2">3. נשאל את הילדים מה אפשר לעשות עם הנודל? - בעמידה</h4>
        <p class="text-gray-600 text-sm italic mb-2">(קודם ניתן לילדים לענות ואז אנחנו יכולים להציע רעיונות)</p>
        <ul class="space-y-1 text-sm text-gray-700 mr-4">
          <li>• לאזן אותו על הראש</li>
          <li>• לזרוק ולתפוס</li>
          <li>• להקיף את הגוף שלנו</li>
          <li>• להתגלגל עליו</li>
        </ul>
      </div>

      <div class="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4">
        <h4 class="font-semibold text-purple-900 mb-2">עבודה בזוגות 👥</h4>
        <p class="text-gray-700 text-sm mb-2">נחלק את הילדים לזוגות ונקח את הנודל הנותר. ניתן להם לשחק בזוג ולראות מה אפשר לעשות איתו:</p>
        <ul class="space-y-1 text-sm text-gray-700 mr-4">
          <li>• להתמסר ביניהם</li>
          <li>• ללכת בחדר כששניהם מחזיקים את הנודל</li>
          <li>• לגלגל ביניהם כשהם יושבים אחד מול השנייה</li>
        </ul>
        <p class="text-red-600 text-sm font-semibold mt-2">* נאסוף את הנודלים והם חוזרים לשבת במקום</p>
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
        <h3 class="font-bold text-purple-900 mb-2">1. חישוקים ⭕</h3>
        <p class="text-gray-700 text-sm">10 חישוקים מסודרים כמו בצורה של קלאס</p>
      </div>

      <div class="bg-pink-50 rounded-lg p-4">
        <h3 class="font-bold text-pink-900 mb-2">2. השמש ☀️</h3>
        <p class="text-gray-700 text-sm">מקלות של נודל - הם צריכים לקפוץ הלוך ואז חזור בשתי רגליים</p>
      </div>

      <div class="bg-blue-50 rounded-lg p-4">
        <h3 class="font-bold text-blue-900 mb-2">3. קונוסים - זיגזג 🔀</h3>
        <p class="text-gray-700 text-sm">6 קונוסים (בתמונה יש רק 3 אבל יש 6) והם צריכים ללכת על 4 בין הקונוסים בזיג זג</p>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <p class="text-gray-600 text-sm italic">* אם יש זמן אפשר לעשות את המסלול כמה פעמים</p>
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
    <p class="text-2xl font-bold">🐑 חלוקת חותמת: כבשה</p>
    <p class="text-xl mt-2">בהצלחה! 🌟</p>
  </div>
</div>
  `
};

console.log('Starting flexibility batch 2: גמישות תנועה 4-6...');

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

console.log('✨ Flexibility batch 2 complete!');
process.exit(0);
