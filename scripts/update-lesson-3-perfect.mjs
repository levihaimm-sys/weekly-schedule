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
  
  <!-- כותרת ראשית -->
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 3 - שיווי משקל, קורדינציה וויסות כוח</h1>
  </div>

  <!-- מידע בסיסי -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    
    <!-- זמן -->
    <div class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⏱️</span>
        <h3 class="font-bold text-blue-900">זמן מערך</h3>
      </div>
      <p class="text-gray-700">45-30 דקות</p>
    </div>

    <!-- ציוד -->
    <div class="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">📦</span>
        <h3 class="font-bold text-purple-900">ציוד</h3>
      </div>
      <p class="text-gray-700 text-sm">37 כפות פלסטיק, 37 כדורים רעשנים, 11 ספוגים, 4 קורות עץ</p>
    </div>

    <!-- חותמת -->
    <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⭐</span>
        <h3 class="font-bold text-green-900">חותמת</h3>
      </div>
      <p class="text-gray-700">זברה</p>
    </div>
  </div>

  <!-- מטרת המפגש -->
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
          <span class="text-gray-700">הילדים ילמדו לשמור על שיווי משקל סטטי ודינמי</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-1">•</span>
          <span class="text-gray-700">הילדים ילמדו לאזן אביזרים על חלקי גוף שונים</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-1">•</span>
          <span class="text-gray-700">הילדים יכירו את המושג קורדינציה ויתרגלו את העבודה עליה</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-1">•</span>
          <span class="text-gray-700">הילדים יכירו תנועה סיבובית ותנועה של המפרקים בגוף</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-1">•</span>
          <span class="text-gray-700">הילדים ילמדו לשמור על שיווי משקל נגד כוחות חיצוניים (דחיפה)</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-1">•</span>
          <span class="text-gray-700">הילדים יכירו את תפקידם של השרירים ואת היכולת לווסת את הכוח שהם מפעילים</span>
        </li>
      </ul>
    </div>
  </div>

  <!-- פתיחה -->
  <div class="bg-white border-2 border-green-200 rounded-xl shadow-md overflow-hidden">
    <div class="bg-green-100 px-6 py-4 border-b-2 border-green-200">
      <h2 class="text-2xl font-bold text-green-900 flex items-center gap-2">
        <span>🚀</span>
        פתיחה: 5 דק'
      </h2>
    </div>
    <div class="p-6 space-y-4">
      
      <div>
        <h3 class="font-bold text-gray-800 mb-2">1. חימום עם מוזיקה - סילסולים</h3>
        <p class="text-gray-700 mb-2">מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך.</p>
        <p class="text-gray-700 mb-2">עושים חימום של כל איברי הגוף השונים. מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.</p>
        <p class="text-gray-700 mb-2">מבקשים מהם ללכת מהר, ואז ממש לאט במהירויות שונות.</p>
        <p class="text-gray-700">ללכת בהליכות שונות בחדר - הליכה צידית, משקל מרגל לרגל, עקב אחרי אגודל, קפיצת צפרדע, הליכת סרטן, הליכת ברווז - הליכה שפופה.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. שיר רקע - מה נעים וקל</h3>
        <p class="text-gray-700 mb-2">לשמור על שיווי משקל לפי מילות השיר.</p>
        <p class="text-gray-700 mb-2">בפזמון הולכים בצעדים קטנים קטנים ובתנועות גוף שמנסות לשמור על שיווי משקל.</p>
        <p class="text-gray-700">להזכיר את נושא החודש ולשאול במה שיחקנו בשבוע שעבר.</p>
      </div>

    </div>
  </div>

  <!-- גוף השיעור -->
  <div class="bg-white border-2 border-purple-200 rounded-xl shadow-md overflow-hidden">
    <div class="bg-purple-100 px-6 py-4 border-b-2 border-purple-200">
      <h2 class="text-2xl font-bold text-purple-900 flex items-center gap-2">
        <span>💪</span>
        גוף השיעור: 10 דק'
      </h2>
    </div>
    <div class="p-6 space-y-4">
      
      <p class="text-gray-700 font-semibold">נעבוד עם כפות פלסטיק וכדור מרשרש.</p>
      <p class="text-gray-700">כל אחד מקבל כף בתורו ושם אותה בין הרגליים/ברכיים.</p>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">1. איזון הכף על אברי הגוף</h3>
        <p class="text-gray-700">בישיבה על הרצפה. נתחיל באיזון הכף על אברי הגוף, על המצח, מתחת לאף, על כתף ימין ושמאל, על כף היד, על גב היד, על גב הרגל...</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. מיטה של הכדור</h3>
        <p class="text-gray-700">נוציא כדור מהתיק, זה כדור מרשרש, נשים את הכדור בתוך הכף ונסביר שהכף משמשת כמיטה של הכדור ומדגימים להם: כשהכדור שוכב בתוך הכף הוא נח ולא משמיע קול, כשאנו מעירים אותו ומנערים אותו הוא מרשרש וכשנשכיב שוב, שוב הכדור נח ולא משמיע קול.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">3. חלוקת כדורים</h3>
        <p class="text-gray-700">הילדים מניחים את הכף על הרצפה בין הרגליים ואנו מגלגלים/מחלקים לכל ילד כדור אל תוך הכף.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">4. ספירה לשלוש</h3>
        <p class="text-gray-700">בספירה לשלוש כולם מרימים את הכדור מהכף ומנערים חזק (במשך כמה שניות) ושוב בספירה עד שלוש מחזירים את הכדור לנוח בתוך הכף - המקל.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">5. קרוב ורחוק מהגוף</h3>
        <p class="text-gray-700">יישור וכיפוף של המרפק - הם מחזיקים את הכף ביד אחת כשהכדור מונח בתוכו ומנסים שהכדור לא יפול ולא ישמיע קול. להחליף ליד השנייה. המטרה היא שיווי משקל שנדע שקיים לפי השקט בחדר.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">6. בהליכה</h3>
        <p class="text-gray-700">להחזיק את הכף עם יד אחת כשהכדור מונח על הכף. להתקדם בלי להעיר את הכדור ושהכדור לא ייפול, בזמן שהולכים אפשר לשים ברקע את השיר "אנחנו הפילים" ולבקש מהם להרים את הרגליים גבוה בהליכה.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">7. אתגרים</h3>
        <p class="text-gray-700 mb-2">בלי שהכדור ייפול:</p>
        <ul class="mr-6 space-y-1">
          <li class="flex items-start gap-2">
            <span class="text-purple-500">•</span>
            <span class="text-gray-700">נעמוד על רגל אחת ואז השנייה</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-purple-500">•</span>
            <span class="text-gray-700">להחליף/להעביר מיד ליד</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-purple-500">•</span>
            <span class="text-gray-700">להניח על הרצפה ולהרים</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-purple-500">•</span>
            <span class="text-gray-700">לעשות סיבוב</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-purple-500">•</span>
            <span class="text-gray-700">ללכת בעיניים עצומות</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-purple-500">•</span>
            <span class="text-gray-700">להתכופף ולעמוד על קצות האצבעות</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-purple-500">•</span>
            <span class="text-gray-700">לעמוד על העקבים</span>
          </li>
        </ul>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">8. מסביב לגוף</h3>
        <p class="text-gray-700 mb-2">לנסות להעביר את הכף כשהכדור מונח בתוכו מאחורי הגב (מסביב לגוף).</p>
        <p class="text-gray-700 mb-2">הבוגרים יכולים לנסות להחליף ביניהם כף וכדור מבלי שהכדור ייפול, להדגיש שלא חייבים להצליח, אנחנו מנסים.</p>
        <p class="text-gray-700 italic">💡 בין התרגילים כדאי לומר להם לתפוס את הכדור ביד ולרשרש חזק חזק!</p>
      </div>

    </div>
  </div>

  <!-- מסלול -->
  <div class="bg-white border-2 border-orange-200 rounded-xl shadow-md overflow-hidden">
    <div class="bg-orange-100 px-6 py-4 border-b-2 border-orange-200">
      <h2 class="text-2xl font-bold text-orange-900 flex items-center gap-2">
        <span>🏃</span>
        מסלול: 15 דק'
      </h2>
    </div>
    <div class="p-6 space-y-4">
      
      <p class="text-gray-700 font-semibold">4 מסלולים שונים פרוסים במרחב:</p>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 1: ארבעה ספוגים לרוחב</h3>
        <p class="text-gray-700">דורכים עם שתי כפות רגליים על הספוג</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 2: שלושה ספוגים צמודים לאורך</h3>
        <p class="text-gray-700">הולכים על הספוגים (כמו קורה)</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 3: שתי קורות עץ צמודות</h3>
        <p class="text-gray-700">הולכים במרכז הקורות על המדבקות הכתומות לאט ובזהירות</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 4: ספוגים וקורות</h3>
        <p class="text-gray-700 mb-2">ארבעה ספוגים על הרצפה ובמרכזן/עליהם 2 קורות עץ.</p>
        <p class="text-gray-700">ללכת לאט לאט בשיווי משקל כשהם הולכים במרכז הקורות על המדבקות הכתומות.</p>
      </div>

      <p class="text-gray-700 text-sm italic">💡 אנו עומדים ליד המסלול ונותנים להם יד, אפשר להתקדם בהליכה צידית (פיסוק וסגירה בהתקדמות).</p>

    </div>
  </div>

  <!-- סיכום -->
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

  <!-- חלוקת חותמת -->
  <div class="bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 rounded-xl shadow-lg p-6 text-center">
    <h3 class="text-xl font-bold text-yellow-900 mb-2 flex items-center justify-center gap-2">
      <span>🎖️</span>
      חלוקת חותמת: זברה
    </h3>
    <p class="text-2xl">🦓</p>
  </div>

  <!-- בהצלחה -->
  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md py-4">
    <p class="text-xl font-bold">בהצלחה! 🎉</p>
  </div>

</div>
`;

// Update the database
const { data } = await supabase
  .from('lesson_plans')
  .select('id')
  .eq('name', 'שיווי משקל 3')
  .single();

if (data) {
  await supabase
    .from('lesson_plans')
    .update({ content: perfectHTML })
    .eq('id', data.id);
  
  console.log('✅ עדכנתי את שיווי משקל 3 בהצלחה!');
} else {
  console.log('❌ לא מצאתי את המערך');
}

process.exit(0);
