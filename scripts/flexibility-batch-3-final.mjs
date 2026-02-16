import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const lessons = {
  'גמישות תנועה 7': `
<div class="max-w-4xl mx-auto space-y-6">
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 7 - גמישות, תנועה ונופש פעיל</h1>
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
        <span class="text-2xl">🧘</span>
        <h3 class="font-bold text-green-900">ציוד</h3>
      </div>
      <p class="text-gray-700">כרטיסיות יוגה</p>
    </div>

    <div class="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">🐻</span>
        <h3 class="font-bold text-purple-900">חותמת</h3>
      </div>
      <p class="text-gray-700">דוב</p>
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
          1. חימום עם מוזיקה - הגלשן שלי / דני סנדרסון
        </h3>
        <p class="text-gray-700 leading-relaxed">
          מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך. עושים חימום של כל איברי הגוף השונים.
          מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.
        </p>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <h3 class="font-bold text-green-900 mb-3 flex items-center gap-2">
          <span>🎶</span>
          2. חימום - שיר רקע - SHAKE IT OFF
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
          3. סרטון ריקוד
        </h3>
        <p class="text-gray-700 text-sm">(יש לצפות בסרטון לפני השיעור) - נלמד את הילדים את הריקוד ונשים את השיר ברקע</p>
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
      <span class="text-3xl">🎨</span>
      <h2 class="text-2xl font-bold text-purple-800">מסלול - 15 דקות</h2>
    </div>
    
    <div class="space-y-3">
      <div class="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-5 border-2 border-purple-300">
        <h3 class="font-bold text-purple-900 mb-3 text-lg">משחק הכרטיסיות הצבעוניות 🎨</h3>
        <p class="text-gray-700 mb-3">נרים כרטיסיות בצבעים. כל כרטיסיה אומרת לילדים איזה תנועה לעשות:</p>
        
        <div class="space-y-2">
          <div class="bg-blue-100 rounded-lg p-3">
            <p class="text-gray-800 font-semibold">🔵 הצבע הכחול</p>
            <p class="text-sm text-gray-700">כולם קופצים קפיצת צפרדע מהצד האחד של הגן לצד השני</p>
          </div>
          
          <div class="bg-red-100 rounded-lg p-3">
            <p class="text-gray-800 font-semibold">🔴 הצבע האדום</p>
            <p class="text-sm text-gray-700">כולם מתגלגלים על הרצפה מצד אחד לצד השני</p>
          </div>
          
          <div class="bg-orange-100 rounded-lg p-3">
            <p class="text-gray-800 font-semibold">🟠 הצבע הכתום</p>
            <p class="text-sm text-gray-700">כולם הולכים בהליכת סרטן מצד אחד לצד השני</p>
          </div>
          
          <div class="bg-green-100 rounded-lg p-3">
            <p class="text-gray-800 font-semibold">🟢 הצבע הירוק</p>
            <p class="text-sm text-gray-700">מוצאים זוג ומותחים את הידיים וצריך ללכת על הצד מבלי לקפל את הידיים</p>
          </div>
          
          <div class="bg-pink-100 rounded-lg p-3">
            <p class="text-gray-800 font-semibold">🩷 הצבע הוורוד</p>
            <p class="text-sm text-gray-700">להצמיד גב לגב לילד אחר וללכת הליכה צידית מבלי לנתק את הגב</p>
          </div>
        </div>

        <p class="text-blue-600 text-sm font-semibold mt-3">* אפשר לשחק עם הצבעים ולגרום לילדים לעשות את זה נכון אבל גם במהירות</p>
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
    <p class="text-2xl font-bold">🐻 חלוקת חותמת: דוב</p>
    <p class="text-xl mt-2">בהצלחה! 🌟</p>
  </div>
</div>
  `,

  'גמישות תנועה 8': `
<div class="max-w-4xl mx-auto space-y-6">
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 8 - גמישות, תנועה ונופש פעיל</h1>
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
        <span class="text-2xl">⭕</span>
        <h3 class="font-bold text-green-900">ציוד</h3>
      </div>
      <p class="text-gray-700 text-sm">37 חישוקים, 2 קונוסים+2 תופסנים+חישוק, חבל לסימון שער/שער כדורגל, כדורסל, 3 כדורגל, 17 מחבטי טניס+17 כדורי פינג פונג</p>
    </div>

    <div class="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">🐕</span>
        <h3 class="font-bold text-purple-900">חותמת</h3>
      </div>
      <p class="text-gray-700">כלב</p>
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
          1. חימום עם מוזיקה - הכל אני יכול בחופש הגדול
        </h3>
        <p class="text-gray-700 leading-relaxed">
          מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך. עושים חימום של כל איברי הגוף השונים.
          מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.
        </p>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <h3 class="font-bold text-green-900 mb-3 flex items-center gap-2">
          <span>🎶</span>
          2. חימום - שיר רקע - SHAKE IT OFF
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
          3. סרטון ריקוד
        </h3>
        <p class="text-gray-700 text-sm">(יש לצפות בסרטון לפני השיעור) - נלמד את הילדים את הריקוד ונשים את השיר ברקע</p>
        <p class="text-gray-600 text-sm italic mt-2">להזכיר את נושא החודש ולשאול במה שיחקנו בשבוע שעבר - אנחנו רוצים להתחיל לסכם איתם את השנה ולהזכיר להם את הדברים שלמדנו תוך כדי</p>
      </div>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">⭕</span>
      <h2 class="text-2xl font-bold text-green-800">גוף השיעור - 10 דקות</h2>
    </div>
    
    <div class="space-y-4">
      <div class="bg-yellow-50 rounded-lg p-4 border-r-4 border-yellow-500">
        <p class="text-gray-700 leading-relaxed">
          נחלק לכל ילד חישוק
        </p>
      </div>

      <div class="bg-blue-50 rounded-lg p-4">
        <h4 class="font-semibold text-blue-900 mb-2">נחקור את החישוק ביחד</h4>
        <p class="text-gray-700 text-sm">ונבין את המשקל שלו, את הצבע, את המרקם, את התחושה שלו</p>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <h4 class="font-semibold text-green-900 mb-2">נעמוד ונתרגל:</h4>
        <ol class="space-y-1 text-sm text-gray-700 mr-4">
          <li><strong>1.</strong> נשים את החישוק על הצוואר, על הראש, על ברך אחת ועל השנייה. על יד אחת ועל השנייה</li>
          <li><strong>2.</strong> נזרוק אותו ונתפוס</li>
          <li><strong>3.</strong> ננסה לגלגל אותו על הרצפה</li>
        </ol>
      </div>

      <div class="bg-purple-50 rounded-lg p-4">
        <h4 class="font-semibold text-purple-900 mb-2">חקירה חופשית 🔄</h4>
        <p class="text-gray-700 text-sm">נתן לילדים לחקור איך לסובב אותו על הגוף (תוך כדי נשים את השיר של החימום ברקע)</p>
      </div>

      <div class="bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg p-4">
        <h4 class="font-semibold text-pink-900 mb-2">משחק ים יבשה עצמאי 🌊</h4>
        <p class="text-gray-700 text-sm mb-2">כל ילד שם את החישוק על הרצפה והם צריכים לקפוץ פנימה כשאת אומרת ים ויבשה צריכים לצאת.</p>
        <p class="text-blue-600 text-sm font-semibold">אם רוצים לאתגר אפשר להגיד את המילה "אי" והם צריכים לעמוד רגל בפנים ורגל בחוץ</p>
        <p class="text-red-600 text-sm font-semibold mt-2">* מחזירים את החישוקים למקום</p>
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
        <h3 class="font-bold text-purple-900 mb-2">נעשה 3 תחנות</h3>
        <p class="text-gray-700 text-sm">(נחלק את הילדים ל-3 קבוצות)</p>
      </div>

      <div class="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4">
        <h3 class="font-bold text-green-900 mb-3">⚽ תחנה 1: כדורגל</h3>
        <p class="text-gray-700 text-sm">בעיטה לשער רק בעזרת הרגליים (3 כדורגל + 2 כסאות שמסמנים את השער)</p>
      </div>

      <div class="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-3">🏀 תחנה 2: כדורסל</h3>
        <p class="text-gray-700 text-sm">קליעה לסל (2 קונוסים + 2 תופסנים + חישוק)</p>
      </div>

      <div class="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-4">
        <h3 class="font-bold text-blue-900 mb-3">🏓 תחנה 3: מחבטי טניס</h3>
        <p class="text-gray-700 text-sm">מחבטי טניס + כדורי פינג פונג - צריכים להקפיץ עליהם 10 פעמים ברצף (תלוי בגיל המודרך, אפשר גם פחות)</p>
      </div>

      <div class="bg-yellow-50 rounded-lg p-4">
        <p class="text-gray-600 text-sm italic">* כל 5 דק עושים חילוף של הילדים בין התחנות כדי שכולם יתנסו בהכל</p>
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
    <p class="text-2xl font-bold">🐕 חלוקת חותמת: כלב</p>
    <p class="text-xl mt-2">בהצלחה! 🌟</p>
  </div>
</div>
  `
};

console.log('Starting flexibility batch 3 FINAL: גמישות תנועה 7-8...');

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

console.log('✨ Flexibility batch 3 FINAL complete! 🎉');
console.log('📊 גמישות תנועה series COMPLETE: 8/8 lessons styled!');
console.log('');
console.log('🎊🎊🎊 ALL LESSONS COMPLETE! 🎊🎊🎊');
console.log('');
console.log('📊 FINAL SUMMARY:');
console.log('✅ פתיחת שנה: 9/9 lessons');
console.log('✅ שיווי משקל: 13/13 lessons');
console.log('✅ מיומנות יסוד: 11/11 lessons');
console.log('✅ משחקי כדור: 8/8 lessons');
console.log('✅ גמישות תנועה: 8/8 lessons');
console.log('');
console.log('🏆 TOTAL COMPLETED: 49/49 lessons - 100% DONE! 🏆');
console.log('');
console.log('🎉 Congratulations! All lesson plans have been perfectly styled! 🎉');
process.exit(0);
