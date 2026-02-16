import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const lessons = {
  'מיומנות יסוד 7': `
<div class="max-w-4xl mx-auto space-y-6">
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 7 - מיומנויות יסוד ותנועה במרחב</h1>
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
      <p class="text-gray-700">37 קונוסים וקורת פלציב</p>
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
        <span>הילדים יכירו כיוונים שונים - לצדדים, קדימה, אחורה, מעל, מתחת, ליד, בתוך ומחוץ</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>תנועה במהירויות שונות האטה - האצה, זינוק, עצירה</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>תנועה בכיוונים שונים וברמות גובה שונות</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>תנועה במסלולים שונים (ישר, זיג זג, עגול, מפותל, סיבוב) עם ובלי אביזר</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>תנועה במרחב הכללי באופני התקדמות שונים</span>
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
          1. חימום עם מוזיקה - can't stop the feeling
        </h3>
        <p class="text-gray-700 leading-relaxed">
          מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך. עושים חימום של כל איברי הגוף השונים. 
          מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.
          מבקשים מהם ללכת מהר, ואז ממש לאט במהירויות שונות.
        </p>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <h3 class="font-bold text-green-900 mb-2 flex items-center gap-2">
          <span>🎶</span>
          2. שיר "מי יכול"
        </h3>
        <p class="text-gray-700 leading-relaxed">
          לפי מילות השיר - לרוץ קדימה, ליפול - לצחוק - לרוץ אחורה, לקפוץ קדימה, לקפוץ אחורה.
        </p>
      </div>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">⚡</span>
      <h2 class="text-2xl font-bold text-green-800">גוף השיעור - 10 דקות</h2>
    </div>
    
    <div class="space-y-4">
      <div class="bg-yellow-50 rounded-lg p-4 border-r-4 border-yellow-500">
        <p class="text-gray-700 leading-relaxed mb-3">
          כל ילד מקבל קונוס, שם אותו בין הרגליים ומחכה בסבלנות. אחרי שכולם קיבלו נעבור לעמידה.
        </p>
        <p class="font-bold text-gray-800 mb-2">נלמד את הילדים את מושגי היסוד:</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="bg-blue-50 rounded-lg p-3">
          <h4 class="font-bold text-blue-800 mb-1">1. בתוך</h4>
          <p class="text-sm text-gray-700">מכניסים איבר לקונוס לפי הוראה: יד, ברך, אוזן, אף, מרפק, כף רגל, כף יד וכו'</p>
        </div>

        <div class="bg-green-50 rounded-lg p-3">
          <h4 class="font-bold text-green-800 mb-1">2. מחוץ</h4>
          <p class="text-sm text-gray-700">נשאל את הילדים - "איזה איברים לא יכולים להיכנס לתוך הקונוס?"</p>
        </div>

        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-bold text-purple-800 mb-1">3. על</h4>
          <p class="text-sm text-gray-700">להניח על ראש, טוסיק, בטן, ירך, גב, אמה וכו'</p>
        </div>

        <div class="bg-pink-50 rounded-lg p-3">
          <h4 class="font-bold text-pink-800 mb-1">4. מעל</h4>
          <p class="text-sm text-gray-700">להראות איך לעמוד מעל (בפיסוק רגליים) ושאנחנו לא יכולים לעמוד על הקונוס</p>
        </div>

        <div class="bg-orange-50 rounded-lg p-3">
          <h4 class="font-bold text-orange-800 mb-1">5. לפני</h4>
          <p class="text-sm text-gray-700">בואו נעשה בטן של דובה גדולה בהריון, נניח על הבטן לפנינו</p>
        </div>

        <div class="bg-teal-50 rounded-lg p-3">
          <h4 class="font-bold text-teal-800 mb-1">6. מאחורי</h4>
          <p class="text-sm text-gray-700">נעביר אותו אל מאחורי הגב, נניח על הגב ונעשה בית של הצב (שריון)</p>
        </div>
      </div>

      <div class="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 mt-4">
        <h3 class="font-bold text-purple-900 mb-3 flex items-center gap-2">
          <span>🎵</span>
          משחק מקצבים
        </h3>
        <p class="text-gray-700 mb-2">נבקש מהילדים להניח את הקונוסים על הרצפה ונפזר בחדר. מטיילים מסביב לקונוסים.</p>
        <p class="text-gray-700 mb-2">בכל פעם שאקיש על הכיסא נתקדם לפי המקצב. כשאגיד קליק נעצור מעל קונוס ונקבל הוראה:</p>
        <ul class="space-y-1 text-sm text-gray-700 mr-4">
          <li>• נקיש חזק - נלך כמו פיל, נעצור – איבר בתוך</li>
          <li>• נקיש מהר - נרוץ כמו נמרים, נעצור – איבר מחוץ</li>
          <li>• נקיש לאט - כמו בלש, נעצור – איבר מעל</li>
          <li>• נקיש עם קצות הציפורניים - צעדים קטנים על קצות האצבעות</li>
        </ul>
      </div>

      <div class="bg-blue-50 rounded-lg p-4">
        <p class="text-gray-700">
          נשים צלילים של הפעלה. נבקש מהילדים שירוצו בין הקונוסים אבל מבלי לגעת בהם תוך כדי שהם עושים עפ מילות השיר שברקע.
          בסוף משאירים את הקונוסים מפוזרים בחדר וחוזרים לשבת במקום.
        </p>
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
        <h3 class="font-bold text-purple-900 mb-2">1. מסלול מפותל</h3>
        <p class="text-gray-700">
          נסדר מסלול ארוך מכל הקונוסים, מפותל כמו נחש. ניצור רווח קטן בין קונוס לקונוס בכדי שלא יהיו צמודים אחד לשני ונתקדם כל הילדים ביחד.
          נזמין אותם אחד אחרי השני ברצף שכולם ילכו ביחד.
        </p>
      </div>

      <div class="bg-pink-50 rounded-lg p-4">
        <h3 class="font-bold text-pink-900 mb-2">2. מסלול זיגזג</h3>
        <p class="text-gray-700">
          נסדר את המסלול בזיגזג ושוב ילכו מעל הקונוסים. במידה והם נמוכים נלך בין הקונוסים - בסללום או מעל על קצות האצבעות.
        </p>
      </div>

      <div class="bg-blue-50 rounded-lg p-4">
        <h3 class="font-bold text-blue-900 mb-2">3. קורת פלציב</h3>
        <p class="text-gray-700">
          בין הקונוסים נשלב את קורת הפלציב. הילדים ילכו על הקורה (אם קל להם אפשר להקשות ע"י הליכה על קצות האצבעות, עקבים).
        </p>
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
  `,

  'מיומנות יסוד 8': `
<div class="max-w-4xl mx-auto space-y-6">
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 8 - מיומנויות יסוד ותנועה במרחב</h1>
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
      <p class="text-gray-700">22 דליים, 3 משוכות כתומות, 2 משוכות צהובות גבוהות</p>
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
        <span>הילדים יכירו כיוונים שונים - לצדדים, קדימה, אחורה, מעל, מתחת, ליד, בתוך ומחוץ</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>תנועה במהירויות שונות האטה - האצה, זינוק, עצירה</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>תנועה בכיוונים שונים וברמות גובה שונות</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>תנועה במסלולים שונים (ישר, זיג זג, עגול, מפותל, סיבוב) עם ובלי אביזר</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>תנועה במרחב הכללי באופני התקדמות שונים</span>
      </li>
    </ul>
    <div class="mt-4 bg-orange-100 rounded-lg p-3">
      <p class="text-sm text-orange-900 font-semibold">
        ⚠️ חשוב מאוד להתייחס למושגי היסוד במשך כל ההפעלה כדי שהילדים ילמדו את המושגים ברמה הגופנית וברמה המילולית
      </p>
    </div>
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
          1. חימום עם מוזיקה - האקונה מטטה
        </h3>
        <p class="text-gray-700 leading-relaxed">
          מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך. עושים חימום של כל איברי הגוף השונים.
          מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.
          מבקשים מהם ללכת מהר, ואז ממש לאט במהירויות שונות.
        </p>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <h3 class="font-bold text-green-900 mb-3 flex items-center gap-2">
          <span>🎶</span>
          2. חימום 2: בתוך הים / בת הים הקטנה
        </h3>
        <div class="space-y-2 text-sm">
          <div class="flex items-start gap-2">
            <span class="text-green-600">🐴</span>
            <p class="text-gray-700"><strong>דוהר כמו סוס</strong> - כשהסוס עוצר יושבים על הרצפה, כשהמוזיקה חוזרת חוזרים לדהור במרחב בכיוון השעון</p>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-green-600">🕷️</span>
            <p class="text-gray-700"><strong>עכבישים</strong> - מתחילים מישיבה במרחב החדר (לשים לב שהם לא קמים). מתפסים עם הידיים באוויר מישיבה לעמידה ונופלים. עכביש רץ - רצים כמו עכביש – הליכה על ארבע או על שש</p>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-green-600">🦀</span>
            <p class="text-gray-700"><strong>סרטן</strong> - הליכת סרטן, קדימה, לצד, אחורה (אם הם גדולים) חשוב לעשות לאט</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">⚡</span>
      <h2 class="text-2xl font-bold text-green-800">גוף השיעור - 10 דקות</h2>
    </div>
    
    <div class="space-y-4">
      <div class="bg-yellow-50 rounded-lg p-4 border-r-4 border-yellow-500">
        <p class="text-gray-700 leading-relaxed">
          מושיבים את הילדים ב-ח, כל ילד מקבל דלי, שם אותו בין הרגליים ומחכה בסבלנות (אפשר למנות ילד או שתיים שיעזרו לחלק).
        </p>
      </div>

      <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
        <h3 class="font-bold text-gray-800 mb-3">כולם עומדים ואנחנו מתרגלים את הכיוונים השונים:</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <h4 class="font-bold text-blue-800 mb-1">לפני 🤰</h4>
            <p class="text-sm text-gray-700">נגיד לילדים לשים את הדלי מלפניהם ולעשות בטן של דובה גדולה בהריון</p>
          </div>

          <div class="bg-white rounded-lg p-3 shadow-sm">
            <h4 class="font-bold text-green-800 mb-1">מאחורי 🐪</h4>
            <p class="text-sm text-gray-700">נגיד לילדים לשים את הדלי מאחורי הגב דבשת של גמל</p>
          </div>

          <div class="bg-white rounded-lg p-3 shadow-sm">
            <h4 class="font-bold text-purple-800 mb-1">בצד 🥁</h4>
            <p class="text-sm text-gray-700">מתחת לבית השחי כמו דרבוקה ונתופף וצד שני</p>
          </div>

          <div class="bg-white rounded-lg p-3 shadow-sm">
            <h4 class="font-bold text-pink-800 mb-1">על 🦵</h4>
            <p class="text-sm text-gray-700">יד רגל על הדלי, ברך על הדלי (אם הם קטנים איבר אחד בלבד, אם הם גדולים יותר אפשר עד 4 איברים)</p>
          </div>

          <div class="bg-white rounded-lg p-3 shadow-sm">
            <h4 class="font-bold text-orange-800 mb-1">מתחת 🚒</h4>
            <p class="text-sm text-gray-700">נניח על הראש - קסדה של סמי הכבאי, כובע של בוב הבנאי</p>
          </div>

          <div class="bg-white rounded-lg p-3 shadow-sm">
            <h4 class="font-bold text-teal-800 mb-1">ישיבה 🚗</h4>
            <p class="text-sm text-gray-700">מושיבים את הילדים והדלי הופך להגה. ידיים אוחזות בדלי. אפשר לסובב אפשר להזיז תלוי בגיל שלהם</p>
          </div>
        </div>
      </div>

      <div class="bg-purple-50 rounded-lg p-4">
        <h3 class="font-bold text-purple-900 mb-2">שוכב 🛏️</h3>
        <p class="text-gray-700">נשכב על הרצפה ונשים את הדלי מולנו, מצד ימין ומצד שמאל, להחזיק ביד אחת ואז בשנייה.</p>
      </div>

      <div class="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4">
        <h3 class="font-bold text-gray-800 mb-3">תרגיל בעמידת שש - הדלי על הגב ומתקדמים:</h3>
        <ol class="space-y-2 text-sm text-gray-700 mr-4">
          <li>1. נדמה הליכה של חיות ונעשה את הקולות שלהם (חתול/כלב/פרה)</li>
          <li>2. נשלח יד אחת קדימה ושהדלי לא ייפול. יד שנייה קדימה והדלי לא ייפול</li>
          <li>3. הליכת סרטן דלי על הבטן למי הדלי לא ייפול?</li>
          <li>4. נעצור במקום כמו פסל, נשים את הדלי על הראש ונחזיק אותו עם הידיים כשהוא על הראש. ונשאל: מי יכול לנתק רגל אחת מבלי שהדלי ייפול? מי יכול לנתק יד אחת מבלי שהדלי ייפול?</li>
        </ol>
      </div>

      <div class="bg-pink-50 rounded-lg p-4">
        <h3 class="font-bold text-pink-900 mb-2 flex items-center gap-2">
          <span>🎵</span>
          משחק ה"כסאות" רק אם דליים - (שיר טרנטלה סיצילאני)
        </h3>
        <p class="text-gray-700 mb-2">כשהמוזיקה פועלת הולכים בין הדליים על קצות האצבעות/על העקבים/הליכת דב/הליכת סרטן מבלי לגעת בדליים.</p>
        <p class="text-gray-700 mb-2">כשהמוזיקה נעצרת מנסים לבלבל את הילדים. לומר להם לשים איבר על הדלי:</p>
        <ul class="space-y-1 text-sm text-gray-700 mr-4">
          <li>• יד על הדלי</li>
          <li>• רגל על הדלי</li>
          <li>• ברך על הדלי</li>
          <li>• מרפק על הדלי</li>
        </ul>
        <p class="text-gray-700 mt-2">לאט לאט עולים ברמת הקושי. שואלים: "מי יכול להניח 2 איברים? מי יכול להניח 3 איברים" (לדוגמא: מרפק אצבע וזרת).</p>
      </div>

      <div class="bg-blue-50 rounded-lg p-4">
        <p class="text-gray-700">
          מבקשים מהילדים לעמוד בטור בשקט ולהניח את הדלי מול הרגליים שלהם. מבקשים מהם לנסות לחזור לשבת במעגל מבלי להזיז את הדלי.
        </p>
      </div>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">🏃</span>
      <h2 class="text-2xl font-bold text-purple-800">מסלול - 15 דקות</h2>
    </div>
    
    <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4">
      <h3 class="font-bold text-purple-900 mb-2">תיאור המסלול:</h3>
      <ol class="space-y-2 text-gray-700 mr-4">
        <li><strong>1.</strong> טור של 16 דליים מסודרים על משטח נגד החלקה - הולכים קדימה על קצות האצבעות מעל כל דלי - מבלי לגעת בדלי</li>
        <li><strong>2.</strong> 3 משוכות נמוכות כתומות – עוברים מעל</li>
        <li><strong>3.</strong> אחרי נניח עוד טור של 6 דליים – הולכים הליכה צידית מעל הדלי</li>
        <li><strong>4.</strong> 2 משוכות גבוהות צהובות – זוחלים מתחת</li>
      </ol>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div class="bg-blue-50 rounded-lg p-3">
        <h4 class="font-bold text-blue-800 mb-1">🪣 טור ראשון - 16 דליים</h4>
        <p class="text-sm text-gray-700">הליכה קדמית על קצות האצבעות לעבור מעל הדליים</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-3">
        <h4 class="font-bold text-orange-800 mb-1">🏃 משוכות נמוכות</h4>
        <p class="text-sm text-gray-700">עוברים מעל המשוכות (אפשר לעלות דרגת קושי לילדים גדולים ולקפוץ מעל המשוכות)</p>
      </div>

      <div class="bg-green-50 rounded-lg p-3">
        <h4 class="font-bold text-green-800 mb-1">🪣 טור שני - 6 דליים</h4>
        <p class="text-sm text-gray-700">הליכה צידית מעל הדליים מבלי לגעת</p>
      </div>

      <div class="bg-yellow-50 rounded-lg p-3">
        <h4 class="font-bold text-yellow-800 mb-1">🤸 משוכות גבוהות</h4>
        <p class="text-sm text-gray-700">זחילה על הבטן (חשוב להדגיש על הבטן!!!!) מתחת למשוכה הצהובה</p>
      </div>
    </div>

    <div class="bg-red-50 rounded-lg p-3 mt-4">
      <p class="text-gray-700 font-semibold">בסוף - ממנים אחראים לאסוף את המסלול</p>
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
  `,

  'מיומנות יסוד 9': `
<div class="max-w-4xl mx-auto space-y-6">
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 9 - מיומנויות יסוד ותנועה במרחב</h1>
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
      <p class="text-gray-700 text-sm">37 כדורים חלקים צבעוניים, חבל משיכה לבן, 4 קרוסלות עץ, 2 נקודות סימון אדום וכחול, 2 מזרנים כחולים, מזרון יוגה</p>
    </div>

    <div class="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">🏠</span>
        <h3 class="font-bold text-purple-900">חותמת</h3>
      </div>
      <p class="text-gray-700">בית</p>
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
        <span>הילדים יכירו כיוונים שונים - לצדדים, קדימה, אחורה, מעל, מתחת, ליד, בתוך ומחוץ</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>גלגול והכרות עם המושג סיבוב</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>תנועה בכיוונים שונים וברמות גובה שונות</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>תנועה במסלולים שונים (ישר, זיג זג, עגול, מפותל, סיבוב) עם ובלי אביזר</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>תנועה במרחב הכללי באופני התקדמות שונים</span>
      </li>
    </ul>
    <div class="mt-4 bg-orange-100 rounded-lg p-3">
      <p class="text-sm text-orange-900 font-semibold">
        ⚠️ חשוב מאוד להתייחס למושגי היסוד במשך כל ההפעלה כדי שהילדים ילמדו את המושגים ברמה הגופנית וברמה המילולית
      </p>
    </div>
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
          1. חימום עם מוזיקה - כמו בריו - אגם בוחבוט
        </h3>
        <p class="text-gray-700 leading-relaxed">
          מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך. עושים חימום של כל איברי הגוף השונים.
          מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.
          מבקשים מהם ללכת מהר, ואז ממש לאט במהירויות שונות.
        </p>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <h3 class="font-bold text-green-900 mb-3 flex items-center gap-2">
          <span>🎶</span>
          2. שיר רקע - חיות פיל לפי מילות השיר
        </h3>
        <p class="text-gray-700 mb-2">בהליכה בחדר לכיוון השעון:</p>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="flex items-center gap-2">
            <span>🐘</span>
            <span class="text-gray-700">פיל - חדק עם היד</span>
          </div>
          <div class="flex items-center gap-2">
            <span>🐱</span>
            <span class="text-gray-700">חתול - הליכה על שש</span>
          </div>
          <div class="flex items-center gap-2">
            <span>🐸</span>
            <span class="text-gray-700">צפרדע - קפיצה</span>
          </div>
          <div class="flex items-center gap-2">
            <span>🦅</span>
            <span class="text-gray-700">ציפור - ידיים לצדדים</span>
          </div>
          <div class="flex items-center gap-2">
            <span>🐍</span>
            <span class="text-gray-700">נחש - זחילה</span>
          </div>
          <div class="flex items-center gap-2">
            <span>🐵</span>
            <span class="text-gray-700">קוף - ניתורים קלים על קצות האצבעות</span>
          </div>
        </div>
        <p class="text-gray-700 mt-2 text-sm italic">להזכיר את נושא החודש ולשאול במה שיחקנו בשבוע שעבר</p>
      </div>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">⚡</span>
      <h2 class="text-2xl font-bold text-green-800">גוף השיעור - 10 דקות</h2>
    </div>
    
    <div class="space-y-4">
      <div class="bg-yellow-50 rounded-lg p-4 border-r-4 border-yellow-500">
        <p class="text-gray-700 leading-relaxed mb-2">
          מחלקים לכל ילד כדור. נותנים להם לחקור יחד את הכדור - צבע, צורה, משקל, מרקם.
        </p>
        <p class="text-gray-700 font-semibold">בשלב השני נבקש מהילדים להחזיק את הכדור בשתי ידיים:</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="bg-blue-50 rounded-lg p-3">
          <h4 class="font-bold text-blue-800 mb-1">1. סיבובים גדולים 🔄</h4>
          <p class="text-sm text-gray-700">נושיט את הכדור קדימה ונסובב את הידיים בסיבובים גדולים קדימה, ולאחר מכן אחורה</p>
        </div>

        <div class="bg-green-50 rounded-lg p-3">
          <h4 class="font-bold text-green-800 mb-1">2. סיבובים קטנים ⭕</h4>
          <p class="text-sm text-gray-700">נסובב את הידיים בעיגולים קטנים קטנים, קדימה ואחורה</p>
        </div>

        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-bold text-purple-800 mb-1">3. סיבוב רגליים 🦵</h4>
          <p class="text-sm text-gray-700">נשים את הכדור בין הרגליים ולסובב את הרגליים</p>
        </div>

        <div class="bg-pink-50 rounded-lg p-3">
          <h4 class="font-bold text-pink-800 mb-1">4. כדור על הראש 🎩</h4>
          <p class="text-sm text-gray-700">נרים את הידיים גבוהה למעלה ונניח את הכדור על הראש</p>
        </div>
      </div>

      <div class="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">5. גלגול על האיברים 🎯</h3>
        <p class="text-gray-700 text-sm">נגלגל את הכדור על האיברים השונים עד לכפות הרגליים:</p>
        <p class="text-gray-600 text-sm">מצח → אף → סנטר → צוואר → בית החזה → בטן → ירכיים → שוקיים → כפות רגליים → אצבעות</p>
      </div>

      <div class="bg-teal-50 rounded-lg p-4">
        <h3 class="font-bold text-teal-900 mb-2">6-7. ספירה וחזרה ⏱️</h3>
        <p class="text-gray-700 text-sm">נחזיק את הכדור על קצות האצבעות ונספור עד 10. נגלגל את הכדור הכי מהר שאנחנו יכולים בחזרה אל הראש. אפשר לחזור על הפעולה פעמיים שלוש.</p>
      </div>

      <div class="bg-blue-50 rounded-lg p-4">
        <h3 class="font-bold text-blue-900 mb-2">8. גלגול צידי ↔️</h3>
        <p class="text-gray-700 text-sm">בישיבה מזרחית, נגלגל את הכדור על הרצפה מיד ימין ליד שמאל</p>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <h3 class="font-bold text-green-900 mb-2">9. גלגול קדימה ואחורה ⬆️⬇️</h3>
        <p class="text-gray-700 text-sm">בישיבה מזרחית על הרצפה, נניח את הכדור על הרצפה, נחזיק את הכדור עם שתי ידיים ונגלגל אותו קדימה, הכי רחוק שאנחנו יכולים להגיע מבלי שהישבן יתרומם מהרצפה וחזרה אחורה. נחזור על הפעולה כמה פעמים.</p>
        <p class="text-gray-600 text-sm italic mt-2">יש לתת זמן לרעיונות משלהם ואם יש רעיון שמתקשר לגלגולים או סיבובים לבקש מכולם לבצע</p>
      </div>

      <div class="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4">
        <h3 class="font-bold text-purple-900 mb-2 flex items-center gap-2">
          <span>🎵</span>
          הפעלה יחד עם מוזיקה: עיגולים מתגלגלים
        </h3>
        <p class="text-gray-700 mb-2">פעילות חופשית בחדר בתנועה:</p>
        <ul class="space-y-1 text-sm text-gray-700 mr-4">
          <li>• לגלגל את הכדור על הרצפה</li>
          <li>• לזרוק ולתפוס</li>
          <li>• לשכב על הכדור עם הבטן ולהתקדם קדימה ואחורה בעזרת הידיים והרגליים</li>
          <li>• להעביר את הכדור בעזרת הידיים אל מאחורי הגב ובחזרה קדימה</li>
          <li>• או כל רעיון אחר שעולה לך תוך כדי</li>
        </ul>
      </div>

      <div class="bg-yellow-50 rounded-lg p-4">
        <h3 class="font-bold text-yellow-900 mb-2 flex items-center gap-2">
          <span>🎶</span>
          שיר הפעלה נוסף: מתגלגל הופ
        </h3>
        <p class="text-gray-700 text-sm">לפי מילות השיר - לגלגל ולהחביא - לנוח, מקפץ ולנוח</p>
      </div>

      <div class="bg-red-50 rounded-lg p-4">
        <h3 class="font-bold text-red-900 mb-2">החזרת הכדורים 🎒</h3>
        <p class="text-gray-700 text-sm">כל ילד חוזר למקום, מושיט את הכדור קדימה ואנו עוברים עם השק והילד מכניס את הכדור לשק – לשים לב שכל הילדים מחזירים את הכדור</p>
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
        <h3 class="font-bold text-purple-900 mb-2">1. קרוסלות מעץ 🎠</h3>
        <p class="text-gray-700 text-sm">טור של 2 קרוסלות אחת אחרי השניה. על הילדים לעבור מקרוסלה לקרוסלה מבלי לגעת ברצפה (לא ליפול מהקרוסלה)</p>
      </div>

      <div class="bg-pink-50 rounded-lg p-4">
        <h3 class="font-bold text-pink-900 mb-2">2. מזרון יוגה - גלגול עיפרון ✏️</h3>
        <p class="text-gray-700 text-sm mb-2">לעבור למזרון יוגה לשכב על הגב לרוחב המזרון ולהתגלגל גלגול צידי (גלגול עיפרון)</p>
        <p class="text-gray-600 text-sm">נסמן בעזרת נקודת סימון איפה הראש מונח ואיפה הרגליים - הראש על הנקודה הכחולה והרגליים לכיוון הנקודה האדומה</p>
      </div>

      <div class="bg-blue-50 rounded-lg p-4">
        <h3 class="font-bold text-blue-900 mb-2">3. עוד קרוסלות 🎠</h3>
        <p class="text-gray-700 text-sm">לאחר מכן עוברים עוד 2 קרוסלות מבלי ליפול</p>
        <p class="text-gray-600 text-sm italic">לשים לב שאנו מחליפים להם את הצד של הראש והרגליים שיתגלגלו פעם מצד ימין שלהם ופעם מצד שמאל על המזרון יוגה</p>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <h3 class="font-bold text-green-900 mb-2">4. חבל משיכה לבן 🪢</h3>
        <p class="text-gray-700 text-sm">לסדר את החבל בפיתול, ללכת מעל החבל ברגליים פסוקות מבלי לגעת בחבל בפיתול</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">5. מזרונים כחולים - גלגול קדמי 🤸</h3>
        <p class="text-gray-700 text-sm mb-2">טור של 2 מזרונים כחולים - גלגול קדמי:</p>
        <ul class="space-y-1 text-sm text-gray-700 mr-4">
          <li>• הילד עומד בקצה המזרון</li>
          <li>• רגליים ברוחב האגן על המזרון</li>
          <li>• מניחים את כפות הידיים בין הרגליים על המזרון</li>
          <li>• מדביקים את הסנטר לבית החזה ומניחים את הראש בין הידיים ומתגלגלים קדימה</li>
        </ul>
        <p class="text-gray-600 text-sm mt-2">אנו עומדים בקצה המזרון הראשון, מדריכים אותם לפעולה נכונה. לאחר הגלגול הראשון בליווי שלכם, הם עוברים למזרון השני ועושים שוב גלגול.</p>
        <p class="text-red-600 text-sm font-semibold mt-2">⚠️ לשים לב שהם שומרים על גב עגול + מניחים את הראש ורק לאחר מכן לוקחים את התנופה לגלגול ולא נופלים על הראש</p>
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
    <p class="text-2xl font-bold">🏠 חלוקת חותמת: בית</p>
    <p class="text-xl mt-2">בהצלחה! 🌟</p>
  </div>
</div>
  `
};

console.log('Starting skills batch 3: מיומנות יסוד 7-9...');

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

console.log('✨ Skills batch 3 complete!');
process.exit(0);
