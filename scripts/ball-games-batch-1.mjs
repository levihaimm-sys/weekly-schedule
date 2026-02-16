import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const lessons = {
  'משחקי כדור 1': `
<div class="max-w-4xl mx-auto space-y-6">
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 1 - משחקי כדור, תקשורת ופתרון בעיות</h1>
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
        <span class="text-2xl">⚽</span>
        <h3 class="font-bold text-green-900">ציוד</h3>
      </div>
      <p class="text-gray-700">19 כדורגל, 2 שערים, 6 קונוסים</p>
    </div>

    <div class="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">🐴</span>
        <h3 class="font-bold text-purple-900">חותמת</h3>
      </div>
      <p class="text-gray-700">סוס ים</p>
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
          1. חימום עם מוזיקה - UNICORN נעה קירל
        </h3>
        <p class="text-gray-700 leading-relaxed mb-2">
          מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך. עושים חימום של כל איברי הגוף השונים.
          מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.
          מבקשים מהם ללכת מהר, ואז ממש לאט במהירויות שונות.
        </p>
        <p class="text-gray-700">ללכת בהליכות שונות בחדר - הליכה צידית, משקל מרגל לרגל, עקב אחרי אגודל, קפיצת צפרדע, הליכת סרטן, הליכת ברווז - הליכה שפופה.</p>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <h3 class="font-bold text-green-900 mb-3 flex items-center gap-2">
          <span>🎶</span>
          2. שיר רקע - כי זה רק ספורט
        </h3>
        <p class="text-gray-600 text-sm italic mb-2">(יש להתאים את רמת החימום לגיל של הילדים, בגילאים הקטנים לשמור על פשטות זאת מילת המפתח)</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">1. עמידה בפיסוק, מתיחה, יד ימין נוגעת ברגל שמאל ויד שמאל מונפת למעלה - כמו מאוורר והפוך</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">2. עמידה בפיסוק, שתי ידיים באמצע מונפות למעלה ולמטה, זקיפה וכפיפה של הגב</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">3. עמידה בפיסוק, מתיחה, רגל מכופפת ורגל ישרה לאחור, נגיעה בכף רגל המכופפת בספירה עד 4 והפוך</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">4. יד אחת על המותן, היד השנייה למעלה ועושים ניעות הצידה וצד שני</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">5. ריצה מהירה במקום</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">6. ריצה איטית במקום כשהברכיים נוגעות בכפות הידיים</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">7. ניתור ברגליים צמודות בצד לצד</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">8. ניתור מרגל אחת אל הרגל השנייה</p>
          </div>
        </div>
        <p class="text-gray-600 text-sm italic mt-2">להזכיר את נושא החודש ולשאול במה שיחקנו בשבוע שעבר</p>
      </div>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">⚽</span>
      <h2 class="text-2xl font-bold text-green-800">גוף השיעור - 10 דקות</h2>
    </div>
    
    <div class="space-y-4">
      <div class="bg-yellow-50 rounded-lg p-4 border-r-4 border-yellow-500">
        <p class="text-gray-700 leading-relaxed mb-2">
          מחלקים אותם לזוג ולכל זוג נותנים כדורגל.
        </p>
        <p class="text-orange-600 font-semibold">הדגשים: חוקי המשחק, שימוש ברגליים בלבד</p>
        <p class="text-blue-600 font-semibold mt-2">שיר רקע: מלך המגרש</p>
      </div>

      <div class="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
        <h3 class="font-bold text-gray-800 mb-3">מתרגלים עם הילדים את המשחק עם הכדור - משימות:</h3>
        
        <div class="space-y-2">
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-gray-700 text-sm">• לשים רגל אחת על הכדור ולספור עד 5, ואותו הדבר ברגל השנייה</p>
          </div>
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-gray-700 text-sm">• לגלגל את הכדור מתחת לכף הרגל ולתת לבן זוג לעשות את אותו דבר</p>
          </div>
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-gray-700 text-sm">• לעבור מעל הכדור ברגליים פסוקות, ובחזרה אחורה</p>
          </div>
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-gray-700 text-sm">• להתמסר עם הכדור בעזרת הרגליים אחד עם השנייה בגלגול</p>
          </div>
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-gray-700 text-sm">• בעמידה, אחד מפסק רגליים והשני בועט את הכדור אל בין הרגליים של החבר מולו</p>
            <p class="text-red-600 text-sm font-semibold mt-1">⚠️ לשים לב לא לבעוט חזק את הכדור. ללמוד בעוצמה של הבעיטה</p>
          </div>
        </div>
      </div>

      <div class="bg-red-50 rounded-lg p-3">
        <p class="text-gray-700 font-semibold">החזרת הכדורים אל השק וחזרה למקום הישיבה</p>
      </div>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">🥅</span>
      <h2 class="text-2xl font-bold text-purple-800">מסלול - 15 דקות</h2>
    </div>
    
    <div class="space-y-3">
      <div class="bg-purple-50 rounded-lg p-4">
        <h3 class="font-bold text-purple-900 mb-2">בועטים את הכדורים לשער ⚽</h3>
        <p class="text-gray-700 text-sm mb-2">עומדים ב-2 טורים מסודר וכל פעם שני ילדים עומדים מול שער ובועטים את הכדור לתוך השער.</p>
      </div>

      <div class="bg-pink-50 rounded-lg p-4">
        <h3 class="font-bold text-pink-900 mb-2">העלאת רמת קושי 🎯</h3>
        <p class="text-gray-700 text-sm">אחר כך מעלים את רמת הקושי (אצל הילדים הגדולים יותר) ומזמינים אותם לגלגל את הכדור מסביב לקונוסים ואז לבעוט לשער.</p>
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
    <p class="text-2xl font-bold">🐴 חלוקת חותמת: סוס ים</p>
    <p class="text-xl mt-2">בהצלחה! 🌟</p>
  </div>
</div>
  `,

  'משחקי כדור 2': `
<div class="max-w-4xl mx-auto space-y-6">
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 2 - משחקי כדור, תקשורת ופתרון בעיות</h1>
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
        <span class="text-2xl">🏀</span>
        <h3 class="font-bold text-green-900">ציוד</h3>
      </div>
      <p class="text-gray-700 text-sm">19 כדורסל, 6 קונוסים גדולים, 6 מקלות כתומים, 6 תופסנים, 6 חישוקים שטוחים</p>
    </div>

    <div class="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">🐻</span>
        <h3 class="font-bold text-purple-900">חותמת</h3>
      </div>
      <p class="text-gray-700">דובי</p>
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
          1. חימום עם מוזיקה - אני אוהב להתעמל
        </h3>
        <p class="text-gray-700 leading-relaxed mb-2">
          מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך. עושים חימום של כל איברי הגוף השונים.
          מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.
        </p>
        <p class="text-gray-700">ללכת בהליכות שונות בחדר - הליכה צידית, משקל מרגל לרגל, עקב אחרי אגודל, קפיצת צפרדע, הליכת סרטן, הליכת ברווז - הליכה שפופה.</p>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <h3 class="font-bold text-green-900 mb-3 flex items-center gap-2">
          <span>🎶</span>
          2. שיר רקע - כי זה רק ספורט
        </h3>
        <p class="text-gray-600 text-sm italic mb-2">(יש להתאים את רמת החימום לגיל של הילדים, בגילאים הקטנים לשמור על פשטות זאת מילת המפתח)</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">1. עמידה בפיסוק, מתיחה, יד ימין נוגעת ברגל שמאל ויד שמאל מונפת למעלה - כמו מאוורר והפוך</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">2. עמידה בפיסוק, שתי ידיים באמצע מונפות למעלה ולמטה, זקיפה וכפיפה של הגב</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">3. עמידה בפיסוק, מתיחה, רגל מכופפת ורגל ישרה לאחור, נגיעה בכף רגל המכופפת בספירה עד 4 והפוך</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">4. יד אחת על המותן, היד השנייה למעלה ועושים ניעות הצידה וצד שני</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">5. ריצה מהירה במקום</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">6. ריצה איטית במקום כשהברכיים נוגעות בכפות הידיים</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">7. ניתור ברגליים צמודות בצד לצד</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">8. ניתור מרגל אחת אל הרגל השנייה</p>
          </div>
        </div>
        <p class="text-gray-600 text-sm italic mt-2">להזכיר את נושא החודש ולשאול במה שיחקנו בשבוע שעבר</p>
      </div>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">🏀</span>
      <h2 class="text-2xl font-bold text-green-800">גוף השיעור - 10 דקות</h2>
    </div>
    
    <div class="space-y-4">
      <div class="bg-yellow-50 rounded-lg p-4 border-r-4 border-yellow-500">
        <p class="text-blue-600 font-semibold">שיר רקע: We Are The Champions</p>
      </div>

      <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
        <h3 class="font-bold text-gray-800 mb-3">חימום המפרקים, חגורת הכתפיים, הרמה, הרחקה וקרוב השכמות:</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• ידיים על הכתפיים סיבוב לפנים ולאחור - סיבוב המרפק ומפרק הכתף</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• מרפק מעבר לראש ויד נגדית מושכת אותו לכיוון שלה</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• מרפק כלפי מעלה כשהיד מכופפת, יד נגדית דוחפת את המרפק אל מאחורי הראש</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• מרפקים מכופפים בגובה המותניים, בתנופה לצדדים, מצד אל צד</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• פיסוק הידיים לאחור לשלוח נשיקה באוויר, חיבוק הידיים על הגוף</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• מתיחה של היד על בית החזה לכיוון היד הנגדית, והפוך</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• סיבוב מפרקי כף היד + שילוב האצבעות וסיבוב מפרקי כף היד</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• עמידה בפיסוק, מתיחה, יד ימין נוגעת ברגל שמאל ויד שמאל מונפת למעלה - כמו מאוורר והפוך</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• עמידה בפיסוק, שתי ידיים באמצע מונפות למעלה ולמטה, זקיפה וכיפוף הגב</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• עמידה בפיסוק, רגל מכופפת ורגל ישרה לאחור, נגיעה בכף רגל המכופפת בספירה עד 4 ורגל שנייה</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">• יד אחת על המותן, היד השנייה למעלה ועושים ניעות הצידה וצד שני</p>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-3">2. לחלק את הילדים לזוגות ולכל זוג נותנים כדורסל</h3>
        <p class="text-gray-600 text-sm mb-2">כל פעם הם עושים את המשימה אחד אחרי השני:</p>
        
        <div class="space-y-2">
          <div class="bg-white rounded p-2">
            <p class="text-gray-700 text-sm">• בעמידה, להעביר את הכדור מיד ליד בניהם מבלי שיפול ולהחליף</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700 text-sm">• להחזיק את הכדור בשתי ידיים, יד מתחת לכדור ויד מעל הכדור, להרים את היד שלמעלה ולהחזיק את הכדור רק עם יד אחת ולספור עד 5 ולהעביר לבן זוג, כנ"ל ליד השנייה</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700 text-sm">• להרים את הכדור מעל הראש ולספור עד 5 ולהעביר לבן זוג</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700 text-sm">• לגלגל את הכדור מסביב לגוף בגובה המותניים (בטן וגב) ולהעביר</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700 text-sm">• להחזיק את הכדור בשתי ידיים בגובה המותניים, לעזוב אותו ובן הזוג צריך לתפוס אותו מהר לפני שהוא נופל לרצפה</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700 text-sm">• לכדרר את הכדור עם יד אחת, ביד ימין ושמאל</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700 text-sm">• לכדרר את הכדור מיד ליד פעם ימין ופעם שמאל</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700 text-sm">• לכדרר בהליכה</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700 text-sm">• בעמידה, להתמסר בכדור מבלי שיפול</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700 text-sm">• בעמידה, להתמסר בכדור כשבכל פעם הוא נוגע פעם אחת בלבד ברצפה</p>
          </div>
        </div>
      </div>

      <div class="bg-red-50 rounded-lg p-3">
        <p class="text-gray-700 font-semibold">החזרת הכדורים אל השק וחזרה למקומות הישיבה</p>
      </div>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">🎯</span>
      <h2 class="text-2xl font-bold text-purple-800">מסלול - 15 דקות</h2>
    </div>
    
    <div class="space-y-3">
      <div class="bg-purple-50 rounded-lg p-4">
        <h3 class="font-bold text-purple-900 mb-2">יוצרים סלים 🏀</h3>
        <p class="text-gray-700 text-sm mb-2">יוצרים סלים מהחישוקים והתופסנים. סה"כ 6 סלים.</p>
        <p class="text-gray-700 text-sm">חלוקה לקבוצות של עד שישה ילדים - 6 תחנות + 6 כדורים. כל ילד בתורו קולע אל הסל.</p>
      </div>

      <div class="bg-pink-50 rounded-lg p-4">
        <p class="text-gray-700 text-sm font-semibold">החזרת הכדורים אל השק, פירוק העמדות וחזרה למקום הישיבה</p>
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
    <p class="text-2xl font-bold">🐻 חלוקת חותמת: דובי</p>
    <p class="text-xl mt-2">בהצלחה! 🌟</p>
  </div>
</div>
  `,

  'משחקי כדור 3': `
<div class="max-w-4xl mx-auto space-y-6">
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 3 - משחקי כדור, תקשורת ופתרון בעיות</h1>
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
        <span class="text-2xl">🎾</span>
        <h3 class="font-bold text-green-900">ציוד</h3>
      </div>
      <p class="text-gray-700 text-sm">37 מחבטי טניס, 37 כדורים רכים, 20 נקודות סימון, 10 דליים גדולים</p>
    </div>

    <div class="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">🚚</span>
        <h3 class="font-bold text-purple-900">חותמת</h3>
      </div>
      <p class="text-gray-700">משאית</p>
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
          1. חימום עם מוזיקה - אני אוהב להתעמל
        </h3>
        <p class="text-gray-700 leading-relaxed">
          מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך. עושים חימום של כל איברי הגוף השונים.
          מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.
        </p>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <h3 class="font-bold text-green-900 mb-3">חימום המפרקים, חגורת הכתפיים:</h3>
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
            <p class="text-gray-700">• סיבוב מפרקי כף היד + שילוב האצבעות וסיבוב מפרקי כף היד</p>
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

      <div class="bg-purple-50 rounded-lg p-4">
        <h3 class="font-bold text-purple-900 mb-3 flex items-center gap-2">
          <span>🎶</span>
          2. שיר רקע - נעימה לפעילות 2
        </h3>
        <p class="text-gray-600 text-sm italic mb-2">(יש להתאים את רמת החימום לגיל של הילדים, בגילאים הקטנים לשמור על פשטות זאת מילת המפתח)</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">1. עמידה בפיסוק, מתיחה, יד ימין נוגעת ברגל שמאל ויד שמאל מונפת למעלה - כמו מאוורר והפוך</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">2. עמידה בפיסוק, שתי ידיים באמצע מונפות למעלה ולמטה, זקיפה וכפיפה של הגב</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">3. עמידה בפיסוק, מתיחה, רגל מכופפת ורגל ישרה לאחור, נגיעה בכף רגל המכופפת בספירה עד 4 והפוך</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">4. יד אחת על המותן, היד השנייה למעלה ועושים ניעות הצידה וצד שני</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">5. ריצה מהירה במקום</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">6. ריצה איטית במקום כשהברכיים נוגעות בכפות הידיים</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">7. ניתור ברגליים צמודות בצד לצד</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-700">8. ניתור מרגל אחת אל הרגל השנייה</p>
          </div>
        </div>
        <p class="text-gray-600 text-sm italic mt-2">להזכיר את נושא החודש ולשאול במה שיחקנו בשבוע שעבר</p>
      </div>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">🎾</span>
      <h2 class="text-2xl font-bold text-green-800">גוף השיעור - 10 דקות</h2>
    </div>
    
    <div class="space-y-4">
      <div class="bg-yellow-50 rounded-lg p-4 border-r-4 border-yellow-500">
        <p class="text-gray-700 leading-relaxed mb-2">
          לחלק לכל ילד מחבט וכדור.
        </p>
        <p class="text-orange-600 font-semibold">הדגשים: חוקי המשחק, שימוש בידיים בלבד</p>
        <p class="text-blue-600 font-semibold mt-2">שיר רקע: נעימה ליצנית</p>
      </div>

      <div class="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
        <h3 class="font-bold text-gray-800 mb-3">1. משימות:</h3>
        
        <div class="space-y-2">
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-gray-700 text-sm">• לחבוט בכדור כלפי מעלה לתקרה מבלי שהכדור יפול, ויד שנייה</p>
          </div>
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-gray-700 text-sm">• להניח את הכדור על המחבט מבלי שיפול ויד שנייה אותו הדבר</p>
          </div>
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-gray-700 text-sm">• לסובב את הכדור על המחבט מבלי שהוא ייפול. עכשיו ננסה צד שני</p>
          </div>
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-gray-700 text-sm">• לנסות ללכת בחדר כשהכדור על המחבט מבלי שיפול</p>
          </div>
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-gray-700 text-sm">• לעצור לנסות לעמוד על רגל אחת מבלי שהכדור ייפול</p>
          </div>
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-gray-700 text-sm">• ללכת על קצות האצבעות מבלי שיפול ללכת על העקבים מבלי שיפול</p>
          </div>
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-gray-700 text-sm">• לעצור לנסות להזיז רגל אחורנית מבלי שהכדור ייפול</p>
          </div>
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-gray-700 text-sm">• ללכת על צידי כף הרגל מבלי שיפול</p>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4">
        <h3 class="font-bold text-purple-900 mb-2">2. חלוקה לזוגות 👥</h3>
        <p class="text-gray-700 text-sm mb-2">לחלק לזוגות לפי בן ובת, ילד ללא מחבט יושב מול ילד עם מחבט.</p>
        <p class="text-gray-700 text-sm mb-2">בעמידה, ילד אחד חובט בכדור כלפי הילד והילד השני מנסה לתפוס את הכדור.</p>
        <p class="text-gray-700 text-sm">אפשר לנסות ולאתגר: על קצות האצבעות על העקבים, על רגל אחת.</p>
        <p class="text-red-600 text-sm font-semibold mt-2">⚠️ דגש: לשים לב שעומדים במרחק מספיק גדול בכדי שלא יפגעו אחד בשני עם המחבט, אם יש צורך, רק חצי קבוצה עובדת בזוגות ואז החצי השני</p>
      </div>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">🎯</span>
      <h2 class="text-2xl font-bold text-purple-800">מסלול - 15 דקות</h2>
    </div>
    
    <div class="space-y-3">
      <div class="bg-purple-50 rounded-lg p-4">
        <h3 class="font-bold text-purple-900 mb-2">ציוד: 8 דליים גדולים, 20 נקודות סימון</h3>
        <ul class="space-y-2 text-sm text-gray-700">
          <li>• 20 נקודות סימון במרווחים אחת אחרי השנייה</li>
          <li>• 6 דליים צמודים שהולכים ביניהם</li>
          <li>• תוך כדי הליכה ננסה להקפיץ כדור על מחבט</li>
        </ul>
      </div>

      <div class="bg-pink-50 rounded-lg p-4">
        <h3 class="font-bold text-pink-900 mb-2">קליעה לדליים 🎯</h3>
        <p class="text-gray-700 text-sm">2 טורים מול 2 דלאים, ולנסות לקלוע לתוך הדליים ממרחקים שונים תלוי בגיל וברמת הקושי.</p>
      </div>

      <div class="bg-blue-50 rounded-lg p-4">
        <p class="text-gray-700 text-sm">בסוף - מבקשים מילדים שהתנהגו יפה או שצריכים חיזוק ולא הצליחו לאסוף איתך יחד את המסלול</p>
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
    <p class="text-2xl font-bold">🚚 חלוקת חותמת: משאית</p>
    <p class="text-xl mt-2">בהצלחה! 🌟</p>
  </div>
</div>
  `
};

console.log('Starting ball games batch 1: משחקי כדור 1-3...');

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

console.log('✨ Ball games batch 1 complete!');
process.exit(0);
