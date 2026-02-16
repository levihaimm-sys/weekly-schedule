import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const lessons = {
  'משחקי כדור 4': `
<div class="max-w-4xl mx-auto space-y-6">
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 4 - משחקי כדור, תקשורת ופתרון בעיות</h1>
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
      <p class="text-gray-700 text-sm">40 חישוקים שטוחים, 2 צלחות מסתובבות, 2 כדורים, 2 דליים</p>
    </div>

    <div class="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">🐰</span>
        <h3 class="font-bold text-purple-900">חותמת</h3>
      </div>
      <p class="text-gray-700">ארנב</p>
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
        <span>הילדים יכירו את המושגים - זריקה, תפיסה, מסירה, קליעה, קפיצות, נחיתות</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>הילדים יכירו את התנועה סביב ציר</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>הילדים יכירו את היכולת המפרקים בגוף להסתובב ולהתכופף</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>הילדים יתנסו במשחקי כדור וקליעה - שליטה בכדור ולימוד כדרור בעמידה ובהתקדמות</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>הילדים יתנסו בקפיצה לרוחק מהמקום ולאחר האצה</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>הילדים יפתחו מיומנויות תקשורת בעבודה בזוגות וקבוצות בדגש על פתרון בעיות</span>
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
          1. חימום עם מוזיקה - זה רק ספורט - דפנה דקל
        </h3>
        <p class="text-gray-700 leading-relaxed mb-2">
          מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך. עושים חימום של כל איברי הגוף השונים.
          מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.
        </p>
        
        <h4 class="font-semibold text-blue-800 mt-3 mb-2">חימום המפרקים, חגורת הכתפיים:</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• סיבוב המרפק והכתף קדימה ואחורה</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• מרפק מעבר לראש ויד נגדית מושכת אותו לכיוון שלה</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• מרפק כלפי מעלה כשהיד מכופפת, יד נגדית דוחפת את המרפק אל מאחורי הראש</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• מרפקים מכופפים בגובה המותניים, בתנופה לצדדים</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• פיסוק הידיים לאחור לשלוח נשיקה באוויר, חיבוק הידיים על הגוף</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• מתיחה של היד על בית החזה לכיוון היד הנגדית, והפוך</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• סיבוב מפרקי כף היד + שילוב האצבעות</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• עמידה בפיסוק, מתיחה, יד ימין נוגעת ברגל שמאל והפוך</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• עמידה בפיסוק, שתי ידיים באמצע מונפות למעלה ולמטה, זקיפה וכיפוף הגב</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• עמידה בפיסוק, מתיחה, רגל מכופפת ורגל ישרה לצד אחד, נגיעה בכף רגל המכופפת והפוך</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• יד אחת על המותן, היד השנייה למעלה ועושים ניעות הצידה וצד שני</p>
          </div>
        </div>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <h3 class="font-bold text-green-900 mb-3 flex items-center gap-2">
          <span>🎶</span>
          2. חימום - שיר רקע - CRAZY FROG
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
          <span>🎵</span>
          3. שני גמדים
        </h3>
        <p class="text-gray-700 text-sm">לפי מילות השיר - שני חברים עומדים פנים מול פנים נותנים יד ועוד אחת ויוצאים לקפוץ/לרוץ/לדלג במרחב</p>
        <p class="text-gray-600 text-sm italic mt-2">להזכיר את נושא החודש ולשאול במה שיחקנו בשבוע שעבר</p>
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
        <h3 class="font-bold text-gray-800 mb-2">חישוקים שטוחים - הצגת תאטרון 🎭</h3>
      </div>

      <div class="bg-blue-50 rounded-lg p-4">
        <h4 class="font-semibold text-blue-900 mb-2">1. לשאול את הילדים מה הבאתי מהשוק</h4>
        <ul class="space-y-1 text-sm text-gray-700 mr-4">
          <li>• לעשות רעש עם האביזר מבלי להראות אותו</li>
          <li>• לתאר אותו - צבע, צורה, משקל, מרקם</li>
          <li>• לתת להם לנחש</li>
        </ul>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <h4 class="font-semibold text-green-900 mb-2">2. חלוקת המכשיר</h4>
        <p class="text-sm text-gray-700 mb-2">סידור החישוקים על הריצפה במעגל גדול, לקרוא לכל ילד בנגיעה על ראשו, לבחור חישוק ולעמוד בתוכו</p>
        <p class="text-red-600 text-sm font-semibold">הדגשים: לא מזיזים את החישוקים</p>
      </div>

      <div class="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4">
        <h4 class="font-semibold text-purple-900 mb-2 flex items-center gap-2">
          <span>🎲</span>
          3. משחק הקוביות
        </h4>
        <p class="text-sm text-gray-700 mb-2">כשכל ילד עומד בתוך חישוק, אנו מטילים קובייה בתוך המעגל. כל ילד קופץ בתוך החישוק שלו כמספר הפעמים שיצא בקובייה.</p>
        <p class="text-sm text-gray-700 mb-2">נקפוץ לפי מספר הפעמים שיצא בקוביה אך בכל פעם קפיצה שונה. המטרה היא לחשוף אותם לכמה שיותר סוגי קפיצות תוך כדי משחק וצחוק.</p>
        <p class="text-blue-600 text-sm font-semibold mb-2">שיר רקע: בארץ הקפיצות</p>
        
        <h5 class="font-semibold text-gray-800 mt-3 mb-2">הוראות:</h5>
        <ul class="space-y-1 text-sm text-gray-700 mr-4">
          <li>• בפעם הראשונה אנו מטילים את הקובייה</li>
          <li>• ובכל פעם נוספת אנו נותנים לילד אחר להטיל את הקובייה</li>
          <li>• לאחר מספר זריקות נוסיף קובייה נוספת למעגל</li>
          <li>• ובכל פעם שני ילדים יטילו את הקובייה</li>
          <li>• נחבר את המספרים שהורו הקוביות ונקפוץ בתוך החישוק</li>
        </ul>

        <h5 class="font-semibold text-gray-800 mt-3 mb-2">סוגי קפיצות:</h5>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-2">
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• קפיצה ברגליים צמודות</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• לסגור ולפסק את הרגליים</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• קפיצה בסיבוב</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• קפיצה קדימה מחוץ לחישוק ואחורה לתוך החישוק</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• קפיצה מצד לצד</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• קפיצה רגל קדימה רגל אחורה – כמו מספריים</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• קפיצה בהצלבה – רגל ימין לצד שמאל ורגל שמאל לצד ימין</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• קפיצה על רגל אחת, והרגל השנייה</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• קפיצה מרגל אל רגל – ניתור לצדדים</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• 2 ידיים על הרצפה מחוץ לחישוק ועם הרגליים לקפוץ קדימה ואחורה</p>
          </div>
        </div>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h4 class="font-semibold text-orange-900 mb-2">4. קפיצה חופשית במרחב</h4>
        <p class="text-sm text-gray-700 mb-2">מוסיפים חישוקים נוספים בתוך המעגל ומפזרים קצת את החישוקים שהיו במעגל. הילדים קופצים מחישוק לחישוק באופן עצמאי.</p>
        <p class="text-sm text-gray-700">כשהמוזיקה עוצרת כל ילד מתיישב בתוך החישוק שלו. וכשהמוזיקה חוזרת לפעול ממשיך לקפוץ במרחב.</p>
      </div>

      <div class="bg-pink-50 rounded-lg p-4">
        <h4 class="font-semibold text-pink-900 mb-2">רעיונות נוספים:</h4>
        <ul class="space-y-1 text-sm text-gray-700 mr-4">
          <li>• להיכנס לתוך החישוק להתכופף למטה ולהוציא את החישוק מעל הראש</li>
          <li>• נעשה את זה כמה פעמים ובסוף נאמר לילדים מי יכול להניח את החישוק בשקט?</li>
          <li>• מי יכול לגלגל את החישוק כמו גלגל?</li>
          <li>• מי יכול לסובב כמו סביבון?</li>
          <li>• מי יכול לגלגל רחוק ולתפוס את החישוק?</li>
        </ul>
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
        <h3 class="font-bold text-purple-900 mb-2">ציוד המסלול</h3>
        <ul class="space-y-1 text-sm text-gray-700">
          <li>• 40 חישוקים שטוחים</li>
          <li>• 2 צלחות מסתובבות</li>
          <li>• 2 כדורים</li>
          <li>• 2 דליים</li>
          <li>• 3 חבלים (כחבל אחד ארוך שהילדים יוכלו ללכת עליו)</li>
        </ul>
      </div>

      <div class="bg-pink-50 rounded-lg p-4">
        <h3 class="font-bold text-pink-900 mb-2">תיאור המסלול:</h3>
        <ol class="space-y-2 text-sm text-gray-700 mr-4">
          <li><strong>1.</strong> 10 חישוקים בלי מרווחים - נקפוץ כמו בקלאס</li>
          <li><strong>2.</strong> 10 חישוקים עם מרווחים - על רגל אחת או 2 רגליים צמודות (תלוי בגיל הילדים)</li>
          <li><strong>3.</strong> נסתובב על הצלחות המסתובבות</li>
          <li><strong>4.</strong> נקלע את הכדור לתוך הדלי</li>
          <li><strong>5.</strong> מי שרוצה אתגר - עיניים עצומות ויד למדריכה</li>
        </ol>
      </div>

      <div class="bg-blue-50 rounded-lg p-4">
        <p class="text-sm text-gray-700">פירוק המסלול בעזרת מי שישב וכיבד את החברים, כל ילד שבחרנו מביא מספר חישוקים</p>
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
    <p class="text-2xl font-bold">🐰 חלוקת חותמת: ארנב</p>
    <p class="text-xl mt-2">בהצלחה! 🌟</p>
  </div>
</div>
  `,

  'משחקי כדור 5': `
<div class="max-w-4xl mx-auto space-y-6">
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 5 - משחקי כדור, תקשורת ופתרון בעיות</h1>
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
        <span class="text-2xl">🧽</span>
        <h3 class="font-bold text-green-900">ציוד</h3>
      </div>
      <p class="text-gray-700">20 כדורי ספוג, 3 מקלות ארוכים, 4 דליים</p>
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
        <span>הילדים יכירו את המושגים - זריקה, תפיסה, מסירה, קליעה, קפיצות, נחיתות</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>הילדים יכירו את התנועה סביב ציר</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>הילדים יכירו את היכולת המפרקים בגוף להסתובב ולהתכופף</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>הילדים יתנסו במשחקי כדור וקליעה - שליטה בכדור ולימוד כדרור בעמידה ובהתקדמות</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>הילדים יתנסו בסוגי מסירות (כדורי ספוג)</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>הילדים יתנסו בקפיצה לרוחק מהמקום ולאחר האצה</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>הילדים יפתחו מיומנויות תקשורת בעבודה בזוגות וקבוצות בדגש על פתרון בעיות</span>
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
          1. חימום עם מוזיקה - זה רק ספורט - דפנה דקל
        </h3>
        <p class="text-gray-700 leading-relaxed mb-2">
          מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך. עושים חימום של כל איברי הגוף השונים.
          מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.
        </p>
        
        <h4 class="font-semibold text-blue-800 mt-3 mb-2">חימום המפרקים, חגורת הכתפיים:</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• סיבוב המרפק והכתף קדימה ואחורה</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• מרפק מעבר לראש ויד נגדית מושכת אותו לכיוון שלה</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• מרפק כלפי מעלה כשהיד מכופפת, יד נגדית דוחפת את המרפק אל מאחורי הראש</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• מרפקים מכופפים בגובה המותניים, בתנופה לצדדים</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• פיסוק הידיים לאחור לשלוח נשיקה באוויר, חיבוק הידיים על הגוף</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• מתיחה של היד על בית החזה לכיוון היד הנגדית, והפוך</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• סיבוב מפרקי כף היד + שילוב האצבעות</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• עמידה בפיסוק, מתיחה, יד ימין נוגעת ברגל שמאל והפוך</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• עמידה בפיסוק, שתי ידיים באמצע מונפות למעלה ולמטה, זקיפה וכיפוף הגב</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• עמידה בפיסוק, מתיחה, רגל מכופפת ורגל ישרה לצד אחד, נגיעה בכף רגל המכופפת והפוך</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• יד אחת על המותן, היד השנייה למעלה ועושים ניעות הצידה וצד שני</p>
          </div>
        </div>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <h3 class="font-bold text-green-900 mb-3 flex items-center gap-2">
          <span>🎶</span>
          2. חימום - שיר רקע - CRAZY FROG
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
        <p class="text-gray-600 text-sm italic mt-2">להזכיר את נושא החודש ולשאול במה שיחקנו בשבוע שעבר</p>
      </div>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">🧽</span>
      <h2 class="text-2xl font-bold text-green-800">גוף השיעור - 10 דקות</h2>
    </div>
    
    <div class="space-y-4">
      <div class="bg-yellow-50 rounded-lg p-4 border-r-4 border-yellow-500">
        <h3 class="font-bold text-gray-800 mb-2">1. מחלקים את הילדים לזוגות</h3>
        <p class="text-gray-700">הילדים צריכים להתמסר ביניהם עם הכדור</p>
      </div>

      <div class="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
        <h4 class="font-semibold text-gray-800 mb-3">תרגילים:</h4>
        
        <div class="space-y-3">
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-gray-700 text-sm">• <strong>ישיבה על הרצפה:</strong> מתחילים בישיבה על הרצפה ומגלגלים את הכדור אחד אל השני</p>
          </div>
          
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-gray-700 text-sm">• <strong>מסירות בגבהים שונים:</strong> לאחר מכן הם צריכים להתמסר בהתחלה בגובה נמוך ולאט לאט להעלות את הגובה</p>
          </div>
          
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-gray-700 text-sm">• <strong>קליעה לסל אנושי:</strong> לאחר מכן, עוברים לעמידה. ילד אחד עושה צורה של סל והשני צריך לקלוע לתוכו. בהתחלה סל נמוך ואז ידיים מעל הראש בצורה של סל</p>
          </div>
        </div>
      </div>

      <div class="bg-red-50 rounded-lg p-3">
        <p class="text-gray-700 font-semibold">מחזירים את הכדורים לתוך השק וחוזרים לשבת</p>
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
        <h3 class="font-bold text-purple-900 mb-2">ציוד: 8 דליים גדולים, 3 מקלות, 2 דלאים גדולים</h3>
        <p class="text-gray-700 text-sm">כדי לפתוח 2 מסלולים כדי שלא יווצר עומס</p>
      </div>

      <div class="bg-pink-50 rounded-lg p-4">
        <h3 class="font-bold text-pink-900 mb-2">תיאור המסלול:</h3>
        <ol class="space-y-2 text-sm text-gray-700 mr-4">
          <li><strong>1.</strong> הילדים צריכים להחזיק את הכדור לקפוץ איתו יחד את 3 המקלות בשתי רגליים צמודות</li>
          <li><strong>2.</strong> בסוף לקלוע לתוך הדלי</li>
        </ol>
        <p class="text-blue-600 text-sm font-semibold mt-3">* לשים את המוזיקה של החימום ברקע</p>
      </div>

      <div class="bg-blue-50 rounded-lg p-4">
        <p class="text-sm text-gray-700">בסוף - מבקשים מילדים שהתנהגו יפה או שצריכים חיזוק ולא הצליחו לאסוף איתך יחד את המסלול</p>
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

  'משחקי כדור 6': `
<div class="max-w-4xl mx-auto space-y-6">
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 6 - משחקי כדור, תקשורת ופתרון בעיות</h1>
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
      <p class="text-gray-700 text-sm">37 נקודות, קרש קפיצה, 2 קונוסים גדולים עם חורים, מקל צהוב, מזרון צבעוני</p>
    </div>

    <div class="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">🤡</span>
        <h3 class="font-bold text-purple-900">חותמת</h3>
      </div>
      <p class="text-gray-700">ליצן</p>
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
        <span>הילדים יכירו את המושגים - זריקה, תפיסה, מסירה, קליעה, קפיצות, נחיתות</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>הילדים יכירו את התנועה סביב ציר</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>הילדים יכירו את היכולת המפרקים בגוף להסתובב ולהתכופף</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>הילדים יתנסו במשחקי כדור וקליעה - שליטה בכדור ולימוד כדרור בעמידה ובהתקדמות</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>הילדים יתנסו בקפיצה לרוחק מהמקום ולאחר האצה</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>הילדים יפתחו מיומנויות תקשורת בעבודה בזוגות וקבוצות בדגש על פתרון בעיות</span>
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
          1. חימום עם מוזיקה - HAPPY
        </h3>
        <p class="text-gray-700 leading-relaxed mb-2">
          מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך. עושים חימום של כל איברי הגוף השונים.
          מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.
        </p>
        
        <h4 class="font-semibold text-blue-800 mt-3 mb-2">חימום המפרקים, חגורת הכתפיים:</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• סיבוב המרפק והכתף קדימה ואחורה</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• מרפק מעבר לראש ויד נגדית מושכת אותו לכיוון שלה</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• מרפק כלפי מעלה כשהיד מכופפת, יד נגדית דוחפת את המרפק אל מאחורי הראש</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• מרפקים מכופפים בגובה המותניים, בתנופה לצדדים</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• פיסוק הידיים לאחור לשלוח נשיקה באוויר, חיבוק הידיים על הגוף</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• מתיחה של היד על בית החזה לכיוון היד הנגדית, והפוך</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• סיבוב מפרקי כף היד + שילוב האצבעות</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• עמידה בפיסוק, מתיחה, יד ימין נוגעת ברגל שמאל והפוך</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• עמידה בפיסוק, שתי ידיים באמצע מונפות למעלה ולמטה, זקיפה וכיפוף הגב</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• עמידה בפיסוק, מתיחה, רגל מכופפת ורגל ישרה לצד אחד, נגיעה בכף רגל המכופפת והפוך</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• יד אחת על המותן, היד השנייה למעלה ועושים ניעות הצידה וצד שני</p>
          </div>
        </div>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <h3 class="font-bold text-green-900 mb-3 flex items-center gap-2">
          <span>🎶</span>
          2. חימום - שיר רקע - CRAZY FROG
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
          <span>🐸</span>
          3. צפרדע אחת קפצה
        </h3>
        <p class="text-gray-700 text-sm">לפי מילות השיר</p>
        <p class="text-gray-600 text-sm italic mt-2">להזכיר את נושא החודש ולשאול במה שיחקנו בשבוע שעבר</p>
      </div>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">🎯</span>
      <h2 class="text-2xl font-bold text-green-800">גוף השיעור - 10 דקות</h2>
    </div>
    
    <div class="space-y-4">
      <div class="bg-yellow-50 rounded-lg p-4 border-r-4 border-yellow-500">
        <h3 class="font-bold text-gray-800 mb-2">1. כל ילד מקבל נקודה שטוחה ומניח אותה על הברכיים</h3>
      </div>

      <div class="bg-blue-50 rounded-lg p-4">
        <h4 class="font-semibold text-blue-900 mb-2">כשהם מחזיקים אותה אפשר לשאול:</h4>
        <ul class="space-y-1 text-sm text-gray-700 mr-4">
          <li>• האם הוא כבד או קל?</li>
          <li>• מה הצבע שלו?</li>
          <li>• מה המרקם שלו? קשה או רך?</li>
          <li>• לשאול כמו מה זה נראה לכם? פיתה, לאפה, חצי פיתה עם פלאפל, משקפת</li>
          <li>• על כל אחד מהם לחבר סיפור מצחיק</li>
        </ul>
        <p class="text-gray-600 text-sm italic mt-2">(אנחנו רוצים ללמד את הילדים בעזרת החושים לזהות את האביזר ולתת להם אוצר מילים כדי לתאר אותו)</p>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <h4 class="font-semibold text-green-900 mb-2">2. לבקש מכל ילד לבחור מקום בחדר</h4>
        <p class="text-sm text-gray-700 mb-2">להניח את הנקודה ולעמוד עליה. לשים לב שיש רווח אחד מהשני. לסדר גם נקודה אחת לך וכשהם עומדים על הנקודות להיות עם הפנים אליך.</p>
        <p class="text-red-600 text-sm font-semibold">הדגשים: לא מזיזים את הנקודות</p>
      </div>

      <div class="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4">
        <h4 class="font-semibold text-purple-900 mb-2 flex items-center gap-2">
          <span>🎵</span>
          3. שיר רקע: TACATA - TACABRO
        </h4>
        <p class="text-sm text-gray-700 mb-2">כשהמוזיקה פועלת כל ילד מטייל בחדר בין הנקודות. כשהמוזיקה מפסיקה כל ילד עומד על נקודה שנמצאת לידו.</p>
        <p class="text-sm text-gray-700 mb-2">אנו נותנים הוראה לאחת הקפיצות ומבצעים כל קפיצה 5 פעמים (נספור עד 5 כולם ביחד)</p>
        
        <h5 class="font-semibold text-gray-800 mt-3 mb-2">סוגי קפיצות:</h5>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">1. קפיצה ברגליים צמודות על הנקודה</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">2. לסגור ולפסק את הרגליים</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">3. קפיצה בסיבוב על הנקודה</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">4. קפיצה קדימה ואחורה - קופצים קדימה מעל הנקודה ואחורה מעל הנקודה</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">5. קפיצה מצד לצד – לצידי הנקודה/מעל הנקודה</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">6. קפיצה רגל קדימה רגל אחורה – כמו מספריים כשהנקודה בין הרגליים</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">7. קפיצה בהצלבה – רגל ימין לצד שמאל ורגל שמאל לצד ימין</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">8. קפיצה על רגל אחת, והרגל השנייה על הנקודה</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">9. קפיצה מרגל אל רגל – ניתור לצדדים מעל הנקודה/לצידי הנקודה</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">10. קפיצה מרגל אחת לשתי הרגליים – רגל אחת על הנקודה ובפיסוק לצידי הנקודה</p>
          </div>
        </div>
        <p class="text-gray-600 text-sm italic mt-2">המטרה היא להזכיר להם ולחזור איתם על הקפיצות השונות שלמדנו. יש להתאים את סוגי הקבוצות לגיל של הילדים. אם הם קטנים לשמור על קפיצות פשוטות</p>
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
        <h3 class="font-bold text-purple-900 mb-2">ציוד: 37 נקודות, קרש קפיצה, 2 קונוסים גדולים עם חורים, מקל צהוב, מזרון צבעוני</h3>
      </div>

      <div class="bg-pink-50 rounded-lg p-4">
        <h3 class="font-bold text-pink-900 mb-2">תיאור המסלול:</h3>
        <ol class="space-y-2 text-sm text-gray-700 mr-4">
          <li><strong>1.</strong> נקודה אחת – קופצים מעל הנקודה - קדימה אחורה X 5</li>
          <li><strong>2.</strong> נקודה אחת – קופצים מעל הנקודה - מצד לצד X 5</li>
          <li><strong>3.</strong> נקודה אחת – מספריים רגל קדימה רגל אחורה מעל הנקודה X 5</li>
          <li><strong>4.</strong> נקודה אחת – בסיבוב על הנקודה X 3</li>
          <li><strong>5.</strong> שלוש נקודות – עומדים על הנקודה האמצעית ובקפיצה לפיסוק רגל על כל נקודה בצדדים וסוגרים שתי רגליים לנקודה</li>
        </ol>
      </div>

      <div class="bg-blue-50 rounded-lg p-4">
        <h3 class="font-bold text-blue-900 mb-2">קרש קפיצה ומזרון 🤸</h3>
        <p class="text-sm text-gray-700 mb-2">לסדר קרש קפיצה ומולו מזרון. על המזרון קרוב/צמוד לקרש קפיצה לסדר שני קונוסים עם מקל צהוב (גובה 2 לקטנים ו-3 לגדולים).</p>
        <p class="text-sm text-gray-700 mb-2">הילד קופץ שלוש פעמים (בספירה שלנו) על הקרש ובשלוש הוא קופץ מעל המקל הצהוב אל המזרון.</p>
        <p class="text-orange-600 text-sm font-semibold">אנו עומדים מאחורי הילד או לפני המקל, מחזיקים את הילד בשתי ידיו ועוזרים לו. יש להיעזר בתנופת הקפיצה של הילד!</p>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <p class="text-sm text-gray-700">פירוק המסלול בעזרת מי שישב וכיבד את החברים, כל ילד שבחרנו מביא נקודה</p>
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
    <p class="text-2xl font-bold">🤡 חלוקת חותמת: ליצן</p>
    <p class="text-xl mt-2">בהצלחה! 🌟</p>
  </div>
</div>
  `
};

console.log('Starting ball games batch 2: משחקי כדור 4-6...');

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

console.log('✨ Ball games batch 2 complete!');
process.exit(0);
