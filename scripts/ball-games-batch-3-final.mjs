import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const lessons = {
  'משחקי כדור 7': `
<div class="max-w-4xl mx-auto space-y-6">
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 7 - משחקי כדור, תקשורת ופתרון בעיות</h1>
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
      <p class="text-gray-700 text-sm">3 כדורים פיזיו גדולים, 2 מקלות צהובים, 4 ספוגים, 4 קונוסים מחוררים</p>
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
          1. חימום עם מוזיקה - מסיבת ריקודים - יובל המבולבל
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
      <span class="text-3xl">⚽</span>
      <h2 class="text-2xl font-bold text-green-800">גוף השיעור - 10 דקות</h2>
    </div>
    
    <div class="space-y-4">
      <div class="bg-yellow-50 rounded-lg p-4 border-r-4 border-yellow-500">
        <h3 class="font-bold text-gray-800 mb-2">מחלקים את הילדים ל-3 קבוצות</h3>
        <p class="text-gray-700 text-sm">עושים סבב ולכל ילד נותנים מספר. ואז מחלקים כל מספרי 1 לשם, 2 לשם ו-3 לשם. כך נוצרות 3 קבוצות.</p>
        <p class="text-blue-600 font-semibold mt-2">לכל קבוצה נותנים כדור פיזיו אחד</p>
      </div>

      <div class="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
        <h4 class="font-semibold text-gray-800 mb-3">תרגילים עם כדור פיזיו:</h4>
        
        <div class="space-y-3">
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-gray-700 text-sm"><strong>1.</strong> עושים מעגל ונותנים לילדים לגלגל ביניהם את הכדור פיזיו</p>
          </div>
          
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-gray-700 text-sm"><strong>2.</strong> מבקשים מהם להקפיץ את הכדור לחבר אחר במעגל וכמו התמסרות בהקפצה (לשים לב שזה לא קופץ גבוה מדי. החוק - שהכדור לא יצא מהמעגל)</p>
          </div>
          
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-gray-700 text-sm"><strong>3.</strong> מנסים להשתמש רק ברגליים כדי להתמסר ביניהם</p>
          </div>
          
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-gray-700 text-sm"><strong>4.</strong> מתמסרים ביניהם רק עם יד אחת ואז מחליפים ליד השנייה</p>
          </div>
          
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-gray-700 text-sm"><strong>5.</strong> מנסים להתמסר רק בעזרת הראש</p>
          </div>
          
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-gray-700 text-sm"><strong>6.</strong> מנסים להתמסר בעיניים עצומות (לילדים הגדולים יותר)</p>
          </div>
        </div>
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
        <h3 class="font-bold text-purple-900 mb-2">ציוד: 2 מקלות צהובים, 4 ספוגים, 4 קונוסים מחוררים</h3>
      </div>

      <div class="bg-pink-50 rounded-lg p-4">
        <h3 class="font-bold text-pink-900 mb-2">1. קפיצה מעל ספוגים 🧽</h3>
        <p class="text-gray-700 text-sm">4 ספוגים לרוחב אחד אחרי השני - צריך לקפוץ מעליהם עם שתי הרגליים ביחד!!</p>
      </div>

      <div class="bg-blue-50 rounded-lg p-4">
        <h3 class="font-bold text-blue-900 mb-2">2. סולם מעץ 🪜</h3>
        <p class="text-gray-700 text-sm mb-2">עומדים לצד הסולם עם הפנים אליך:</p>
        <ul class="space-y-1 text-sm text-gray-700 mr-4">
          <li>• קופצים קפיצה צידית שלב שלב בצד הימיני</li>
          <li>• בשלב החמישי מסתובבים לכיוון השני וקופצים בצד השמאלי</li>
        </ul>
        <p class="text-red-600 text-sm font-semibold mt-2">⚠️ לשים לב לכל הילדים שכולם קופצים קפיצה צידית עם שתי כפות הרגליים ביחד ולא רגל רודפת רגל</p>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <h3 class="font-bold text-green-900 mb-2">3. קונוסים עם מקלות 🎯</h3>
        <p class="text-gray-700 text-sm mb-2">4 קונוסים עם שתי מקלות:</p>
        <ul class="space-y-1 text-sm text-gray-700 mr-4">
          <li>• סידור של שני קונוסים עם מקל בשלב הראשון (הכי נמוך)</li>
          <li>• לקפוץ מעל המקל עם שתי כפות הרגליים ביחד</li>
        </ul>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <p class="text-sm text-gray-700">פירוק המסלול בעזרת מי שישב וכיבד את החברים, כל ילד שבחרנו מביא לפי הבקשה שלנו</p>
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

  'משחקי כדור 8': `
<div class="max-w-4xl mx-auto space-y-6">
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 8 - משחקי כדור, תקשורת ופתרון בעיות</h1>
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
        <span class="text-2xl">🏓</span>
        <h3 class="font-bold text-green-900">ציוד</h3>
      </div>
      <p class="text-gray-700 text-sm">37 מחבטי טניס שולחן/מטקות, 20 כדורי פינג פונג, מצנח גדול וכדור ספוג</p>
    </div>

    <div class="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">🦏</span>
        <h3 class="font-bold text-purple-900">חותמת</h3>
      </div>
      <p class="text-gray-700">קרנף</p>
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
          1. חימום עם מוזיקה - UPTOWN FUNK
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
        <p class="text-gray-600 text-sm italic mt-2">להזכיר את נושא החודש ולשאול במה שיחקנו בשבוע שעבר</p>
      </div>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">🏓</span>
      <h2 class="text-2xl font-bold text-green-800">גוף השיעור - 10 דקות</h2>
    </div>
    
    <div class="space-y-4">
      <div class="bg-yellow-50 rounded-lg p-4 border-r-4 border-yellow-500">
        <h3 class="font-bold text-gray-800 mb-2">מחבטי טניס שולחן ופינג פונג 🏓</h3>
        <p class="text-gray-700">מחלקים את הילדים לזוגות</p>
      </div>

      <div class="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
        <h4 class="font-semibold text-gray-800 mb-3">תרגילים:</h4>
        
        <div class="space-y-3">
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-gray-700 text-sm">• <strong>תרגול אישי:</strong> כל זוג מקבל כדור. בהתחלה ילד אחד מנסה להקפיץ פעם אחת את הכדור על המחבט שלו ואז נותן לחבר שלו</p>
          </div>
          
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-gray-700 text-sm">• <strong>תרגול בזוגות:</strong> הם מנסים להקפיץ את הכדור ביחד ביניהם</p>
          </div>
        </div>

        <div class="bg-orange-100 rounded-lg p-3 mt-3">
          <p class="text-sm text-orange-900 font-semibold">
            * ניתן לילדים זמן לתרגל את הפעולה. לקטנים זה יהיה מאתגר אז לתת להם להתנסות יחד
          </p>
        </div>
      </div>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">🪂</span>
      <h2 class="text-2xl font-bold text-purple-800">מסלול - 15 דקות</h2>
    </div>
    
    <div class="space-y-3">
      <div class="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-5 border-2 border-purple-300">
        <h3 class="font-bold text-purple-900 mb-3 text-lg flex items-center gap-2">
          <span>🪂</span>
          משחק המצנח
        </h3>
        <p class="text-gray-700 mb-3">עושים מעגל גדול ונותנים לכל ילד להחזיק חלק מהמצנח.</p>
        <p class="text-gray-700 mb-3">בתוך המצנח שמים כדור ספוג והמטרה היא להקפיץ יחד את הכדור גבוה גבוה.</p>
        <p class="text-blue-600 font-semibold">שמים להם את השיר חימום של ההתחלה ובעיקר נהנים! 🎉</p>
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
    <p class="text-2xl font-bold">🦏 חלוקת חותמת: קרנף</p>
    <p class="text-xl mt-2">בהצלחה! 🌟</p>
  </div>
</div>
  `
};

console.log('Starting ball games batch 3 FINAL: משחקי כדור 7-8...');

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

console.log('✨ Ball games batch 3 FINAL complete! 🎉');
console.log('📊 משחקי כדור series COMPLETE: 8/8 lessons styled!');
console.log('');
console.log('🎊 PROGRESS SUMMARY:');
console.log('✅ פתיחת שנה: 9/9 lessons');
console.log('✅ שיווי משקל: 13/13 lessons');
console.log('✅ מיומנות יסוד: 11/11 lessons');
console.log('✅ משחקי כדור: 8/8 lessons');
console.log('📝 TOTAL COMPLETED: 41/48 lessons');
console.log('📝 REMAINING: 7 lessons (גמישות תנועה 1-7)');
process.exit(0);
