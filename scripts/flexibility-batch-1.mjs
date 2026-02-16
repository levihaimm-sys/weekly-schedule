import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const lessons = {
  'גמישות תנועה 1': `
<div class="max-w-4xl mx-auto space-y-6">
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 1 - גמישות, תנועה ונופש פעיל</h1>
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
      <p class="text-gray-700">2 כובע סביבון, מזרון יוגה, מזרון צבעוני</p>
    </div>

    <div class="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">🌈</span>
        <h3 class="font-bold text-purple-900">חותמת</h3>
      </div>
      <p class="text-gray-700">קשת בענן</p>
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
          1. חימום עם מוזיקה - UPTOWN FUNK
        </h3>
        <p class="text-gray-700 leading-relaxed">
          מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך. עושים חימום של כל איברי הגוף השונים.
          מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.
        </p>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <h3 class="font-bold text-green-900 mb-3 flex items-center gap-2">
          <span>🎶</span>
          2. שיר רקע - SHAKE IT OFF
        </h3>
        <p class="text-gray-600 text-sm italic mb-2">(יש להתאים את רמת החימום לגיל של הילדים, בגילאים הקטנים לשמור על פשטות זאת מילת המפתח)</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• עמידה בפיסוק, מתיחה, יד ימין נוגעת ברגל שמאל ויד שמאל מונפת למעלה - כמו מאוורר והפוך</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• עמידה בפיסוק, שתי ידיים באמצע מונפות למעלה ולמטה, זקיפה וכפיפה של הגב</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• עמידה בפיסוק, מתיחה, רגל מכופפת ורגל ישרה לאחור, נגיעה בכף רגל המכופפת בספירה עד 4 והפוך</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• יד אחת על המותן, היד השנייה למעלה ועושים ניעות הצידה וצד שני</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• ריצה מהירה במקום</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• ריצה איטית במקום כשהברכיים נוגעות בכפות הידיים</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• ניתור ברגליים צמודות בצד לצד</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• ניתור מרגל אחת אל הרגל השנייה</p>
          </div>
        </div>
      </div>

      <div class="bg-purple-50 rounded-lg p-4">
        <h3 class="font-bold text-purple-900 mb-2 flex items-center gap-2">
          <span>💃</span>
          3. ריקוד המקרנה
        </h3>
        <p class="text-gray-700 text-sm">נלמד את הילדים את הריקוד ונשים את השיר ברקע</p>
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
        <h3 class="font-bold text-gray-800 mb-2">1. תנוחות יוגה לגמישות</h3>
        <p class="text-gray-700 text-sm mb-2">נתרגל עם הילדים תנוחות של יוגה שיעזרו להם להגמיש את הגוף. כל התנוחות אנחנו עושים מאוד לאט ומבקשים מהילדים לנשום.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="bg-blue-50 rounded-lg p-3">
          <h4 class="font-bold text-blue-800 mb-1">תנוחה 1 🙇</h4>
          <p class="text-sm text-gray-700">עומדים עם רגליים צמודות ומבקשים מהילדים להתכופף קדימה ולגעת בקצות האצבעות. הילדים יכולים לכופף את הברכיים וחשוב לא שזה לא יכאב</p>
        </div>

        <div class="bg-green-50 rounded-lg p-3">
          <h4 class="font-bold text-green-800 mb-1">תנוחה 2 🐍</h4>
          <p class="text-sm text-gray-700">שוכבים על הרצפה ובעזרת הידיים דוחפים את החזה למעלה שיגרום להקשתה של הגב (חשוב לבצע את זה בעדינות ולהגיד לילדים לעלות לאט עד שכבר לא נעים בגוף)</p>
        </div>

        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-bold text-purple-800 mb-1">תנוחה 3 👶</h4>
          <p class="text-sm text-gray-700">תנוחת הילד - יושבים על הברכיים ומתכופפים קדימה</p>
        </div>
      </div>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">🤸</span>
      <h2 class="text-2xl font-bold text-purple-800">מסלול - 15 דקות</h2>
    </div>
    
    <div class="space-y-3">
      <div class="bg-purple-50 rounded-lg p-4">
        <h3 class="font-bold text-purple-900 mb-2">1. כובע סביבון 🎩</h3>
        <p class="text-gray-700 text-sm">על הילדים לשבת עם הישבן בתוך הכובע ולהשלים סיבוב מלא</p>
      </div>

      <div class="bg-pink-50 rounded-lg p-4">
        <h3 class="font-bold text-pink-900 mb-2">2. מזרון יוגה - גלגול עיפרון ✏️</h3>
        <p class="text-gray-700 text-sm mb-2">לעבור למזרון יוגה - לשכב על הגב לרוחב המזרון ולהתגלגל גלגול צידי (גלגול עיפרון)</p>
        <p class="text-gray-600 text-sm">נסמן בעזרת נקודת סימון איפה הראש מונח ואיפה הרגליים - הראש על הנקודה הכחולה והרגליים לכיוון הנקודה האדומה</p>
      </div>

      <div class="bg-blue-50 rounded-lg p-4">
        <h3 class="font-bold text-blue-900 mb-2">3. כובע סביבון 2 🎩</h3>
        <p class="text-gray-700 text-sm">להשלים סיבוב מלא</p>
      </div>

      <div class="bg-green-50 rounded-lg p-5 border-2 border-green-300">
        <h3 class="font-bold text-green-900 mb-3">4. מזרון צבעוני - גלגול אחורי 🤸</h3>
        <p class="text-gray-700 text-sm mb-2">הילד מגיע אלינו:</p>
        <ol class="space-y-1 text-sm text-gray-700 mr-4">
          <li>• יורד לישיבה שפופה</li>
          <li>• נשכב לאט ובזהירות אחורה</li>
          <li>• מניח את שתי כפות הידיים לצידי הראש (ליד האוזן, מרפקים כלפי מעלה)</li>
          <li>• מרים את הרגליים עד שיגעו באף</li>
        </ol>
        <p class="text-blue-600 text-sm font-semibold mt-2">אנו עומדים לצידם - כשהרגליים מגיעות אל האף אנו נותנים להם תנופה ודוחפים את האגן שלהם לכיוון הגלגול.</p>
        <p class="text-orange-600 text-sm mt-2">הילד צריך לדחוף חזק את המזרון עם שתי כפות הידיים בספירה שלך עד שלוש כשהרגליים מגיעות אל האף.</p>
        <p class="text-red-600 text-sm font-semibold mt-2">⚠️ לשים לב בגלגול שהרגליים נוטות לכיוון ימין או שמאל ולא בקו ישר מעל הראש</p>
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
    <p class="text-2xl font-bold">🌈 חלוקת חותמת: קשת בענן</p>
    <p class="text-xl mt-2">בהצלחה! 🌟</p>
  </div>
</div>
  `,

  'גמישות תנועה 2': `
<div class="max-w-4xl mx-auto space-y-6">
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 2 - גמישות, תנועה ונופש פעיל</h1>
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
        <span class="text-2xl">🔔</span>
        <h3 class="font-bold text-green-900">ציוד</h3>
      </div>
      <p class="text-gray-700 text-sm">37 צמידי פעמון, 2 משוכות, 2 צלחות שיווי משקל, מזרון יוגה, מזרון צבעוני</p>
    </div>

    <div class="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">🐴</span>
        <h3 class="font-bold text-purple-900">חותמת</h3>
      </div>
      <p class="text-gray-700">סוס</p>
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
          1. חימום עם מוזיקה - UPTOWN FUNK
        </h3>
        <p class="text-gray-700 leading-relaxed">
          מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך. עושים חימום של כל איברי הגוף השונים.
          מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.
        </p>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <h3 class="font-bold text-green-900 mb-3 flex items-center gap-2">
          <span>🎶</span>
          2. שיר רקע - דב דובון
        </h3>
        <p class="text-gray-700 text-sm mb-2">לפי מילות השיר:</p>
        <ul class="space-y-1 text-sm text-gray-700 mr-4">
          <li>• מציאת בן זוג</li>
          <li>• שפשוף כפות הידיים</li>
          <li>• חילוף מקום</li>
          <li>• נשיקות באוויר</li>
          <li>• חיבוק</li>
          <li>• ריצה</li>
          <li>• מציאת מסתור - לשכב בתנוחה עוברית על הריצפה וקוקו</li>
        </ul>
        <p class="text-gray-700 text-sm mt-2">חוזרים לשבת</p>
      </div>

      <div class="bg-purple-50 rounded-lg p-4">
        <h3 class="font-bold text-purple-900 mb-2 flex items-center gap-2">
          <span>🐦</span>
          3. ריקוד הציפורים
        </h3>
        <p class="text-gray-700 text-sm">נלמד את הילדים את הריקוד ונשים את השיר ברקע</p>
        <p class="text-gray-600 text-sm italic mt-2">להזכיר את נושא החודש ולשאול במה שיחקנו בשבוע שעבר - אנחנו רוצים להתחיל לסכם איתם את השנה ולהזכיר להם את הדברים שלמדנו תוך כדי</p>
      </div>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">🔔</span>
      <h2 class="text-2xl font-bold text-green-800">גוף השיעור - 10 דקות</h2>
    </div>
    
    <div class="space-y-4">
      <div class="bg-yellow-50 rounded-lg p-4 border-r-4 border-yellow-500">
        <p class="text-gray-700 leading-relaxed">
          נחלק לכל ילד צמיד פעמונים
        </p>
      </div>

      <div class="bg-blue-50 rounded-lg p-4">
        <h4 class="font-semibold text-blue-900 mb-2">1. משחק השקט 🤫</h4>
        <p class="text-gray-700 text-sm mb-2">נבקש מהילדים לעמוד ולרוץ בחדר. כל פעם שאת מוחאת כף הם צריכים לשמור על שקט מוחלט.</p>
        <p class="text-gray-700 text-sm">נשחק את זה כמה פעמים. אפשר לבקש מהם ללכת בכל מיני צורות - הליכה צידית, לזחול, להתגלגל על הצד, קפיצות צפרדע</p>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <h4 class="font-semibold text-green-900 mb-2">2. משחק המקצבים 🎵</h4>
        <p class="text-gray-700 text-sm">מבקשים מהילדים לרשרש את הצמיד לפי הקצב שאת מכתיבה.</p>
        <p class="text-gray-600 text-sm italic">אם הם קטנים לעשות מקצבים פשוטים, 3 נקישות, 2 נקישות. אם הם גדולים יותר אפשר לתת להם מקצבים מסובכים יותר</p>
      </div>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">🤸</span>
      <h2 class="text-2xl font-bold text-purple-800">מסלול - 15 דקות</h2>
    </div>
    
    <div class="space-y-3">
      <div class="bg-purple-50 rounded-lg p-4">
        <h3 class="font-bold text-purple-900 mb-2">1. משוכות 🏃</h3>
        <p class="text-gray-700 text-sm">2 משוכות - הילדים צריכים לזחול מתחת למשוכות</p>
      </div>

      <div class="bg-pink-50 rounded-lg p-4">
        <h3 class="font-bold text-pink-900 mb-2">2. מזרון יוגה - גלגול עיפרון ✏️</h3>
        <p class="text-gray-700 text-sm mb-2">לעבור למזרון יוגה - לשכב על הגב לרוחב המזרון ולהתגלגל גלגול צידי (גלגול עיפרון)</p>
        <p class="text-gray-600 text-sm">נסמן בעזרת נקודת סימון איפה הראש מונח ואיפה הרגליים - הראש על הנקודה הכחולה והרגליים לכיוון הנקודה האדומה</p>
      </div>

      <div class="bg-blue-50 rounded-lg p-4">
        <h3 class="font-bold text-blue-900 mb-2">3. צלחות שיווי משקל ⚖️</h3>
        <p class="text-gray-700 text-sm">2 צלחות שיווי משקל - הילדים צריכים לעבור מצלחת לצלחת</p>
      </div>

      <div class="bg-green-50 rounded-lg p-5 border-2 border-green-300">
        <h3 class="font-bold text-green-900 mb-3">4. מזרון צבעוני - גלגול אחורי 🤸</h3>
        <p class="text-gray-700 text-sm mb-2">הילד מגיע אלינו:</p>
        <ol class="space-y-1 text-sm text-gray-700 mr-4">
          <li>• יורד לישיבה שפופה</li>
          <li>• נשכב לאט ובזהירות אחורה</li>
          <li>• מניח את שתי כפות הידיים לצידי הראש (ליד האוזן, מרפקים כלפי מעלה)</li>
          <li>• מרים את הרגליים עד שיגעו באף</li>
        </ol>
        <p class="text-blue-600 text-sm font-semibold mt-2">אנו עומדים לצידם - כשהרגליים מגיעות אל האף אנו נותנים להם תנופה ודוחפים את האגן שלהם לכיוון הגלגול.</p>
        <p class="text-orange-600 text-sm mt-2">הילד צריך לדחוף חזק את המזרון עם שתי כפות הידיים בספירה שלך עד שלוש כשהרגליים מגיעות אל האף.</p>
        <p class="text-red-600 text-sm font-semibold mt-2">⚠️ לשים לב בגלגול שהרגליים נוטות לכיוון ימין או שמאל ולא בקו ישר מעל הראש</p>
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
    <p class="text-2xl font-bold">🐴 חלוקת חותמת: סוס</p>
    <p class="text-xl mt-2">בהצלחה! 🌟</p>
  </div>
</div>
  `,

  'גמישות תנועה 3': `
<div class="max-w-4xl mx-auto space-y-6">
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 3 - גמישות, תנועה ונופש פעיל</h1>
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
        <span class="text-2xl">🪢</span>
        <h3 class="font-bold text-green-900">ציוד</h3>
      </div>
      <p class="text-gray-700">37 חבלים</p>
    </div>

    <div class="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">🐸</span>
        <h3 class="font-bold text-purple-900">חותמת</h3>
      </div>
      <p class="text-gray-700">צפרדע</p>
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
      <span class="text-3xl">🪢</span>
      <h2 class="text-2xl font-bold text-green-800">גוף השיעור - 10 דקות</h2>
    </div>
    
    <div class="space-y-4">
      <div class="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-5 border-2 border-orange-300">
        <h3 class="font-bold text-orange-900 mb-3 text-lg">אפשרויות להצגת האביזר - הצגת תאטרון 🎭</h3>
        <p class="text-gray-700 text-sm mb-2">לפתוח את התיק לאט, לשאול את מי הבאתי.. אולי חתול? כלב? פרה?...</p>
        <p class="text-gray-700 text-sm mb-2">ואז להגיד שהבאתי נחש פששששש, להוציא את החבל לאט מהתיק שרק צד אחד על הרצפה והצד השני ביד שלי ולהזיז את החבל כמו נחש, ולשאול אותם זה נחש? "לא"</p>
        
        <div class="space-y-2 mt-3">
          <div class="bg-white rounded p-2">
            <p class="text-sm text-gray-700">🦁 <strong>אוזניים של אריה?</strong> להדגים עם הידיות על הראש ולשאוג כמו אריה, "לא"</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-sm text-gray-700">🐘 <strong>חדק של פיל?</strong> צד אחד על האף וצד שני זז מצד לצד כמו חדק של פיל, "לא"</p>
          </div>
        </div>
      </div>

      <div class="bg-blue-50 rounded-lg p-4">
        <h4 class="font-semibold text-blue-900 mb-2">חלוקת החבלים</h4>
        <p class="text-gray-700 text-sm">כל אחד מקבל חבל בתורו ושם אותו על הרצפה בין הרגליים</p>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <h4 class="font-semibold text-green-900 mb-2">משחק בעלי החיים 🦁</h4>
        <p class="text-gray-700 text-sm mb-2">לשאול את הילדים "מה אפשר לעשות עם החבל – אולי נדמה בעלי חיים?" (דגש על האולי בדוגמאות - אנחנו רק משחקים)</p>
        <p class="text-gray-600 text-sm italic mb-2">לגילאים הגדולים יותר - לאתגר את התרגילים (דימויים) בעמידה על רגל אחת</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-2">
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">🐘 חדק של פיל – ידית אחת על האף שלנו ועם היד השנייה להחזיק בידית השנייה ולנופף כמו חדק</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">🦁 אוזניים של אריה – שתי ידיות על הראש ולשאוג כמו אריה</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">🐰 שיניים של שפן – שתי ידיות כמו שיניים ארוכות ולהשמיע קול של לעיסת גזר</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">🎧 אוזניות - ידית על כל אוזן - נהיה כולם בשקט נקשיב למוזיקה</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">🔭 משקפת - ידית על כל עיין - אני מדמיינת שדה עם פרפרים, טרקטור חורש</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">⭕ לחבר את הידיות אחת לשנייה ולצייר עיגולים גדולים קדימה ואחורה</p>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4">
        <h4 class="font-semibold text-purple-900 mb-2">לומדים לקפוץ בחבל 🪢</h4>
        
        <div class="space-y-2">
          <div class="bg-white rounded p-2">
            <p class="text-sm text-gray-700"><strong>1.</strong> מניחים את החבל על הרצפה, שתי הידיות מאחורי הגב ועומדים בתוך המעגל שנוצר מהחבל. יוצאים החוצה מעל החבל רגל רודפת רגל, ואחורה בחזרה רגל רודפת רגל X 3</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-sm text-gray-700"><strong>2.</strong> קופצים החוצה עם שתי הרגליים ביחד וחוזרים אחורה רגל רודפת רגל X 3</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-sm text-gray-700"><strong>3.</strong> להחזיק בשתי הידיות וחזרה על אותו התרגיל, קצה החבל נוגע ברצפה ועוברים קדימה רגל רודפת רגל ואחורה, ואז בקפיצה עם שתי הרגליים ביחד</p>
          </div>
        </div>

        <p class="text-blue-600 text-sm font-semibold mt-3">לתת להם זמן חופשי לקפיצה בחבל ופיתוח רעיונות</p>
        <p class="text-green-600 text-sm font-semibold">שיר רקע: כמו צפרדע</p>
      </div>

      <div class="bg-red-50 rounded-lg p-3">
        <p class="text-gray-700 text-sm">כל אחד מחזיק רק בצד אחד של החבל הכי גבוהה שהוא יכול ולהחזיר את כל החבלים חזרה אלי לאט לאט ולשבת במקום</p>
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
        <h3 class="font-bold text-purple-900 mb-2">ציוד: 37 חבלים</h3>
        <p class="text-gray-700 text-sm">מסלול: 4 מסלולים שונים פרוסים במרחב</p>
      </div>

      <div class="bg-gradient-to-r from-pink-50 to-blue-50 rounded-lg p-4">
        <h3 class="font-bold text-pink-900 mb-3">תיאור המסלולים:</h3>
        
        <div class="space-y-2">
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-gray-700 text-sm"><strong>1.</strong> ארבע שורות של חבלים - קופצים מעל כל חבל עם שתי רגליים ו ו ו ו ו</p>
          </div>
          
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-gray-700 text-sm"><strong>2.</strong> חבל לאורך – רגליים פסוקות – עוברים בקפיצות - - - - -</p>
          </div>
          
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-gray-700 text-sm"><strong>3.</strong> אותו חבל לאורך – רגליים פסוקות – עוברים בקפיצות אחורה - - - - -</p>
          </div>
          
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-gray-700 text-sm"><strong>4.</strong> ארבעה מעגלים מהחבלים – קופצים מעיגול לעיגול עם 2 כפות רגליים ביחד O O O O</p>
          </div>
          
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-gray-700 text-sm"><strong>5.</strong> אם יש לך רעיון נוסף למסלול עם החבלים, תוכלי לשלב אותו</p>
          </div>
        </div>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <p class="text-sm text-gray-700">פירוק המסלול בעזרת מי שישב וכיבד את החברים, כל ילד שבחרנו מביא מספר חבלים</p>
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
    <p class="text-2xl font-bold">🐸 חלוקת חותמת: צפרדע</p>
    <p class="text-xl mt-2">בהצלחה! 🌟</p>
  </div>
</div>
  `
};

console.log('Starting flexibility batch 1: גמישות תנועה 1-3...');

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

console.log('✨ Flexibility batch 1 complete!');
process.exit(0);
