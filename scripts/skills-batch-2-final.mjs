/**
 * Perfect styling - Basic Skills lessons 4-6 (FINAL BATCH!)
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
  'מיומנות יסוד 4': `
<div class="max-w-4xl mx-auto space-y-6">
  
  <div class="text-center bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 4 - מיומנויות יסוד ותנועה במרחב</h1>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⏱️</span>
        <h3 class="font-bold text-green-900">זמן מערך</h3>
      </div>
      <p class="text-gray-700">45-30 דקות</p>
    </div>
    <div class="bg-teal-50 border-l-4 border-teal-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">📦</span>
        <h3 class="font-bold text-teal-900">ציוד</h3>
      </div>
      <p class="text-gray-700 text-sm">37 ידיים מגומי, 5 חישוקים שטוחים, 2 כיפות צהובות, 3 מקלות ארוכים צהובים, 2 קונוסים כחולים גדולים, 2 תופסנים לחישוק, מזרון צבעוני</p>
    </div>
    <div class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⭐</span>
        <h3 class="font-bold text-blue-900">חותמת</h3>
      </div>
      <p class="text-gray-700">אפרוח</p>
    </div>
  </div>

  <div class="bg-white border-2 border-green-200 rounded-xl shadow-md overflow-hidden">
    <div class="bg-green-100 px-6 py-4 border-b-2 border-green-200">
      <h2 class="text-2xl font-bold text-green-900 flex items-center gap-2">
        <span>🎯</span>
        מטרת המפגש
      </h2>
    </div>
    <div class="p-6">
      <ul class="space-y-2">
        <li class="flex items-start gap-2"><span class="text-green-500 mt-1">•</span><span class="text-gray-700">הילדים יכירו כיוונים שונים - לצדדים, קדימה, אחורה, מעל, מתחת, ליד, בתוך ומחוץ</span></li>
        <li class="flex items-start gap-2"><span class="text-green-500 mt-1">•</span><span class="text-gray-700">תנועה במהירויות שונות: האטה - האצה, זינוק, עצירה</span></li>
        <li class="flex items-start gap-2"><span class="text-green-500 mt-1">•</span><span class="text-gray-700">תנועה בכיוונים שונים וברמות גובה שונות</span></li>
        <li class="flex items-start gap-2"><span class="text-green-500 mt-1">•</span><span class="text-gray-700">תנועה במסלולים שונים (ישר, זיג זג, עגול, מפותל, סיבוב) עם ובלי אביזר</span></li>
        <li class="flex items-start gap-2"><span class="text-green-500 mt-1">•</span><span class="text-gray-700">תנועה במרחב הכללי באופני התקדמות שונים</span></li>
      </ul>
    </div>
  </div>

  <div class="bg-white border-2 border-teal-200 rounded-xl shadow-md overflow-hidden">
    <div class="bg-teal-100 px-6 py-4 border-b-2 border-teal-200">
      <h2 class="text-2xl font-bold text-teal-900 flex items-center gap-2">
        <span>🚀</span>
        פתיחה: 5 דק'
      </h2>
    </div>
    <div class="p-6 space-y-4">
      <div>
        <h3 class="font-bold text-gray-800 mb-2">1. חימום עם מוזיקה - "On The Floor" (Jennifer Lopez)</h3>
        <p class="text-gray-700 mb-2">מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך.</p>
        <p class="text-gray-700 mb-2">עושים חימום של כל איברי הגוף השונים. מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.</p>
        <p class="text-gray-700">מבקשים מהם ללכת מהר, ואז ממש לאט במהירויות שונות.</p>
      </div>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. משחק תנועה עם המוזיקה - "Un Poco Loco" (From "Coco")</h3>
        <p class="text-gray-700 mb-2">כשהמוזיקה מתנגנת הם צריכים ללכת מהר וכשהיא נעצרת הם צריכים כל פעם לעשות משהו אחר:</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">1. לעמוד על רגל אחת</li>
          <li class="text-gray-700">2. לעבור לעמידה על שש</li>
          <li class="text-gray-700">3. לשבת בישיבה מזרחית</li>
          <li class="text-gray-700">4. לשבת בישיבה שלמה</li>
          <li class="text-gray-700">5. לשכב על הרצפה</li>
          <li class="text-gray-700">6. להרים ידיים מעל הראש</li>
          <li class="text-gray-700">7. לעמוד בעמידת כוכב</li>
        </ul>
        <p class="text-gray-700 text-sm italic mt-2">להזכיר את נושא החודש ולשאול במה שיחקנו בשבוע שעבר</p>
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
      <p class="text-gray-700 font-semibold mb-3">37 ידיים ורגליים מגומי - כל ילד מקבל יד ורגל</p>
      
      <div>
        <h4 class="font-semibold text-purple-900 mb-2">1. חקירת הידיים והרגליים</h4>
        <p class="text-gray-700 mb-2">בהתחלה אנחנו חוקרים את הידיים והרגליים:</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• צבע</li>
          <li class="text-gray-700">• מרקם</li>
          <li class="text-gray-700">• קשה או רך</li>
          <li class="text-gray-700">• כבד או קל</li>
          <li class="text-gray-700">• גמיש או יציב</li>
        </ul>
      </div>

      <div>
        <h4 class="font-semibold text-purple-900 mb-2">2. הוראות עם היד והרגל מגומי</h4>
        <p class="text-gray-700 mb-2">נבקש מהם לשים את היד מגומי או הרגל מגומי על איבר שונה בגופם.</p>
        <p class="text-gray-700 mb-2">לדוגמה - "לשים את היד על היד שלהם ואז על היד השנייה". כל פעם על איבר אחר (ראש, מרפק, צוואר).</p>
        <p class="text-gray-700 text-sm">💡 אפשר לבקש מהם לשים בו זמנית את היד על הרגל ואת הרגל על היד (נבלבל אותם לפי רמת הגיל שלהם. אם הם גדולים זה יצור אתגר עבורם)</p>
      </div>

      <div>
        <h4 class="font-semibold text-purple-900 mb-2">3. הליכה במרחב עם היד והרגל מגומי</h4>
        <p class="text-gray-700 mb-2">נבקש מהם לשים את היד מגומי על הראש ואת הרגל נחזיק בשתי ידיים ונלך בצורות שונות במרחב:</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• עקב בצד אגודל</li>
          <li class="text-gray-700">• נלך ממש מהר</li>
          <li class="text-gray-700">• נלך לאט</li>
          <li class="text-gray-700">• נלך על שש</li>
          <li class="text-gray-700">• נלך על 4</li>
          <li class="text-gray-700">• נלך הליכה צידית</li>
          <li class="text-gray-700">• נדלג</li>
        </ul>
        <p class="text-gray-700 text-sm font-semibold mt-2">⚠️ כל זה מבלי להפיל את היד מגומי ולא להיעזר בידיים. הם רק מחזיקות את הרגל מגומי</p>
        <p class="text-gray-700 text-sm italic">בסוף אוספים את כל הידיים והרגליים</p>
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
        <h3 class="font-bold text-orange-900 mb-2">מסלול חישוקים</h3>
        <p class="text-gray-700">לסדר טור של חישוקים שטוחים במרחק אחד מהשני (אילוץ לשימוש בשתי הרגליים) ולקפוץ מחישוק לחישוק.</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">חישוק בין כיפות</h3>
        <p class="text-gray-700">החישוק האחרון תפוס על המקלות בגובה הכי נמוך שאפשר מהריצפה על הכיפות הצהובים. לקפוץ לתוך החישוק ולקפוץ החוצה.</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">מקל בין 2 קונוסים</h3>
        <p class="text-gray-700">מקל בשלב הראשון של הקונוסים הכחולים ולקפוץ מעל המקל אל מזרון צבעוני - המזרון ולעשות גלגול.</p>
      </div>

      <p class="text-gray-700 text-sm italic mt-3">💡 בכל פעם 6-7 ילדים משתתפים במסלול</p>
      <p class="text-gray-700 text-sm italic">💡 פירוק המסלול בעזרת מי שישב וכיבד את החברים, כל ילד שבחרנו מביא חלק מהמסלול</p>
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
        <li class="flex items-start gap-2"><span class="text-pink-500">•</span><span class="text-gray-700">לעמוד באמצע ולהזמין לחיבוק פרידה מי שרוצה</span></li>
        <li class="flex items-start gap-2"><span class="text-pink-500">•</span><span class="text-gray-700">אפשר לעשות הרפייה על הרצפה, לכבות את האורות בגן ולשים מוזיקה מרגיעה</span></li>
        <li class="flex items-start gap-2"><span class="text-pink-500">•</span><span class="text-gray-700">אפשר להנחות אותם לפתוח את הידיים גדול גדול לצדדים ואז לקרב לאט לאט עד שמגיעים לחיבוק עצמי. לתת נשיקה לכל כתף ולהגיד תודה לגוף שלי</span></li>
        <li class="flex items-start gap-2"><span class="text-pink-500">•</span><span class="text-gray-700">אפשר למתוח את הגוף ולעשות לו מסאז לכל חלק בגוף</span></li>
      </ul>
    </div>
  </div>

  <div class="bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 rounded-xl shadow-lg p-6 text-center">
    <h3 class="text-xl font-bold text-yellow-900 mb-2 flex items-center justify-center gap-2">
      <span>🎖️</span>
      חלוקת חותמת: אפרוח
    </h3>
    <p class="text-3xl">🐣</p>
  </div>

  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md py-4">
    <p class="text-xl font-bold">בהצלחה! 🎉</p>
  </div>

</div>
`,

  'מיומנות יסוד 5': `
<div class="max-w-4xl mx-auto space-y-6">
  
  <div class="text-center bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 5 - מיומנויות יסוד ותנועה במרחב</h1>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⏱️</span>
        <h3 class="font-bold text-green-900">זמן מערך</h3>
      </div>
      <p class="text-gray-700">45-30 דקות</p>
    </div>
    <div class="bg-teal-50 border-l-4 border-teal-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">📦</span>
        <h3 class="font-bold text-teal-900">ציוד</h3>
      </div>
      <p class="text-gray-700">10 כיפות, 10 תופסנים, 15 מקלות כתומים</p>
    </div>
    <div class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⭐</span>
        <h3 class="font-bold text-blue-900">חותמת</h3>
      </div>
      <p class="text-gray-700">סוס</p>
    </div>
  </div>

  <div class="bg-white border-2 border-green-200 rounded-xl shadow-md overflow-hidden">
    <div class="bg-green-100 px-6 py-4 border-b-2 border-green-200">
      <h2 class="text-2xl font-bold text-green-900 flex items-center gap-2">
        <span>🎯</span>
        מטרת המפגש
      </h2>
    </div>
    <div class="p-6">
      <ul class="space-y-2">
        <li class="flex items-start gap-2"><span class="text-green-500 mt-1">•</span><span class="text-gray-700">הילדים יכירו כיוונים שונים - לצדדים, קדימה, אחורה, מעל, מתחת, ליד, בתוך ומחוץ</span></li>
        <li class="flex items-start gap-2"><span class="text-green-500 mt-1">•</span><span class="text-gray-700">תנועה במהירויות שונות: האטה - האצה, זינוק, עצירה</span></li>
        <li class="flex items-start gap-2"><span class="text-green-500 mt-1">•</span><span class="text-gray-700">תנועה בכיוונים שונים וברמות גובה שונות</span></li>
        <li class="flex items-start gap-2"><span class="text-green-500 mt-1">•</span><span class="text-gray-700">תנועה במסלולים שונים (ישר, זיג זג, עגול, מפותל, סיבוב) עם ובלי אביזר</span></li>
        <li class="flex items-start gap-2"><span class="text-green-500 mt-1">•</span><span class="text-gray-700">תנועה במרחב הכללי באופני התקדמות שונים</span></li>
      </ul>
    </div>
  </div>

  <div class="bg-white border-2 border-teal-200 rounded-xl shadow-md overflow-hidden">
    <div class="bg-teal-100 px-6 py-4 border-b-2 border-teal-200">
      <h2 class="text-2xl font-bold text-teal-900 flex items-center gap-2">
        <span>🚀</span>
        פתיחה: 5 דק'
      </h2>
    </div>
    <div class="p-6 space-y-4">
      <div>
        <h3 class="font-bold text-gray-800 mb-2">1. חימום עם מוזיקה - "Dancing Queen"</h3>
        <p class="text-gray-700 mb-2">מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך.</p>
        <p class="text-gray-700 mb-2">עושים חימום של כל איברי הגוף השונים. מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.</p>
        <p class="text-gray-700">מבקשים מהם ללכת מהר, ואז ממש לאט במהירויות שונות.</p>
      </div>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. משחק החיות</h3>
        <p class="text-gray-700 mb-2">מסתובבים בחדר וכל פעם ילד עובר בין פיסוק של ילד אחר.</p>
        <p class="text-gray-700 mb-2">כל פעם הולכים כמו חיה אחרת (סוס, עכביש, חתול, תולעת) ואז מישהו מפסק רגלים והחיה מסתתרת באורווה, במחילה של התולעת, בבית, בין קורי העכביש.</p>
        <p class="text-gray-700">הילד שמפסק יכול לעשות כמו הצורה של המחילה.</p>
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
      <div>
        <h4 class="font-semibold text-purple-900 mb-2">הכנת עמדות מעברים במרחב</h4>
        <p class="text-gray-700 mb-2">מסדרים בפיזור במרחב החדר עמדות מעברים:</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• כל עמדה כוללת 2 כיפות, 3 מקלות ו-2 תופסנים</li>
          <li class="text-gray-700">• נעמיד מקל בכל כיפה, נחבר לכל מקל תופסן ואל התופסנים נחבר מקל נוסף אשר יצור את המעבר לפי הגובה המתאים</li>
        </ul>
        <p class="text-gray-700 text-sm font-semibold mt-2">⚠️ דגש: בין שיר לשיר הילדים חוזרים לשבת במקום ואנו מסדרים את הגובה הדרוש לפעילות, תוך כדי בניית סיפור מתאים לצורת ההתקדמות הבאה</p>
        <p class="text-gray-700 text-sm">בניית הסיפור תהיה קשורה לחיה אותה נדמה (סוס, עכביש, שבלול, תולעת)</p>
      </div>

      <div class="space-y-3">
        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-semibold text-purple-900 mb-1">1. דהירה - סוס אביר</h4>
          <p class="text-gray-700 text-sm">מסדרים את התופסנים גבוה. דוהרים כמו סוסים לצלילי השיר "סוס אביר". נאפשר לילדים לדהור מתחת למעברים שהמקלות יוצרים.</p>
          <p class="text-gray-700 text-sm font-semibold">דגש: להרים ברכיים ולקפץ</p>
        </div>

        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-semibold text-purple-900 mb-1">2. התקדמות על ארבע - עכבישים</h4>
          <p class="text-gray-700 text-sm">מסדרים את התופסנים והמקלות בגובה הליכה על ארבע. הולכים כמו עכבישים לצלילי השיר "עכבישים".</p>
          <p class="text-gray-700 text-sm font-semibold">דגש: הישבן גבוה גבוה למעלה, הולכים רק על כפות הידיים והרגליים</p>
        </div>

        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-semibold text-purple-900 mb-1">3. התקדמות כמו עובר/שבלול</h4>
          <p class="text-gray-700 text-sm">מסדרים את התופסנים והמקלות בגובה שלא יאפשר להם לעלות על שש. עוברים כמו שבלולים איטיים לצלילי השיר "שבלול". הידיים מושטות קדימה והגוף מחליק על הריצפה עד קו כפות הידיים.</p>
          <p class="text-gray-700 text-sm font-semibold">דגש: הדגימו להם את צורת ההתקדמות של השבלול</p>
        </div>

        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-semibold text-purple-900 mb-1">4. זחילה על הבטן - תולעת</h4>
          <p class="text-gray-700 text-sm">מסדרים את התופסנים והמקלות ממש נמוך. זוחלים כמו תולעת קטנה לצלילי השיר "תול תולעת".</p>
          <p class="text-gray-700 text-sm font-semibold">דגש: לזחול על הבטן מבלי להרים את הישבן – ציינו זאת בפניהם</p>
        </div>
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
      <p class="text-gray-700 mb-3">בכל עמדה 2 כיפות, 3 מקלות ו-2 תופסנים. מסדרים את הערכה לפי סדר גבוה לנמוך ברצף.</p>
      <p class="text-gray-700 text-sm font-semibold mb-3">⚠️ הדגשים: נכנסים מצד אחד ויוצאים מצד שני. כל ילד שמסיים ללכת במעברים חוזר למקום. לשים לב שאנו מכבדים את החברים לפנינו ואחרינו.</p>
      
      <div class="space-y-2">
        <div class="bg-orange-50 rounded-lg p-3">
          <p class="text-gray-700"><span class="font-semibold">1.</span> ללכת גבוה על קצות האצבעות ולגעת עם הידיים במקל - ללטף חלש</p>
        </div>
        <div class="bg-orange-50 rounded-lg p-3">
          <p class="text-gray-700"><span class="font-semibold">2.</span> הליכה שפופה בהליכת ברווז</p>
        </div>
        <div class="bg-orange-50 rounded-lg p-3">
          <p class="text-gray-700"><span class="font-semibold">3.</span> הליכה על ארבע, ישבן למעלה</p>
        </div>
        <div class="bg-orange-50 rounded-lg p-3">
          <p class="text-gray-700"><span class="font-semibold">4.</span> זחילה של שבלול - כמו תנוחת עובר</p>
        </div>
        <div class="bg-orange-50 rounded-lg p-3">
          <p class="text-gray-700"><span class="font-semibold">5.</span> זחילה על הבטן כמו נחש</p>
        </div>
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
        <li class="flex items-start gap-2"><span class="text-pink-500">•</span><span class="text-gray-700">לעמוד באמצע ולהזמין לחיבוק פרידה מי שרוצה</span></li>
        <li class="flex items-start gap-2"><span class="text-pink-500">•</span><span class="text-gray-700">אפשר לעשות הרפייה על הרצפה, לכבות את האורות בגן ולשים מוזיקה מרגיעה</span></li>
        <li class="flex items-start gap-2"><span class="text-pink-500">•</span><span class="text-gray-700">אפשר להנחות אותם לפתוח את הידיים גדול גדול לצדדים ואז לקרב לאט לאט עד שמגיעים לחיבוק עצמי. לתת נשיקה לכל כתף ולהגיד תודה לגוף שלי</span></li>
        <li class="flex items-start gap-2"><span class="text-pink-500">•</span><span class="text-gray-700">אפשר למתוח את הגוף ולעשות לו מסאז לכל חלק בגוף</span></li>
      </ul>
    </div>
  </div>

  <div class="bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 rounded-xl shadow-lg p-6 text-center">
    <h3 class="text-xl font-bold text-yellow-900 mb-2 flex items-center justify-center gap-2">
      <span>🎖️</span>
      חלוקת חותמת: סוס
    </h3>
    <p class="text-3xl">🐴</p>
  </div>

  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md py-4">
    <p class="text-xl font-bold">בהצלחה! 🎉</p>
  </div>

</div>
`,

  'מיומנות יסוד 6': `
<div class="max-w-4xl mx-auto space-y-6">
  
  <div class="text-center bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 6 - מיומנויות יסוד ותנועה במרחב</h1>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⏱️</span>
        <h3 class="font-bold text-green-900">זמן מערך</h3>
      </div>
      <p class="text-gray-700">45-30 דקות</p>
    </div>
    <div class="bg-teal-50 border-l-4 border-teal-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">📦</span>
        <h3 class="font-bold text-teal-900">ציוד</h3>
      </div>
      <p class="text-gray-700">37 חישוקים, 8 חצים צהובים, 7 קונוסים כתומים גדולים, חבל לבן</p>
    </div>
    <div class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⭐</span>
        <h3 class="font-bold text-blue-900">חותמת</h3>
      </div>
      <p class="text-gray-700">צב</p>
    </div>
  </div>

  <div class="bg-white border-2 border-green-200 rounded-xl shadow-md overflow-hidden">
    <div class="bg-green-100 px-6 py-4 border-b-2 border-green-200">
      <h2 class="text-2xl font-bold text-green-900 flex items-center gap-2">
        <span>🎯</span>
        מטרת המפגש
      </h2>
    </div>
    <div class="p-6">
      <ul class="space-y-2">
        <li class="flex items-start gap-2"><span class="text-green-500 mt-1">•</span><span class="text-gray-700">הילדים יכירו כיוונים שונים - לצדדים, קדימה, אחורה, מעל, מתחת, ליד, בתוך ומחוץ</span></li>
        <li class="flex items-start gap-2"><span class="text-green-500 mt-1">•</span><span class="text-gray-700">תנועה במהירויות שונות: האטה - האצה, זינוק, עצירה</span></li>
        <li class="flex items-start gap-2"><span class="text-green-500 mt-1">•</span><span class="text-gray-700">תנועה בכיוונים שונים וברמות גובה שונות</span></li>
        <li class="flex items-start gap-2"><span class="text-green-500 mt-1">•</span><span class="text-gray-700">תנועה במסלולים שונים (ישר, זיג זג, עגול, מפותל, סיבוב) עם ובלי אביזר</span></li>
        <li class="flex items-start gap-2"><span class="text-green-500 mt-1">•</span><span class="text-gray-700">תנועה במרחב הכללי באופני התקדמות שונים</span></li>
      </ul>
    </div>
  </div>

  <div class="bg-white border-2 border-teal-200 rounded-xl shadow-md overflow-hidden">
    <div class="bg-teal-100 px-6 py-4 border-b-2 border-teal-200">
      <h2 class="text-2xl font-bold text-teal-900 flex items-center gap-2">
        <span>🚀</span>
        פתיחה: 5 דק'
      </h2>
    </div>
    <div class="p-6 space-y-4">
      <div>
        <h3 class="font-bold text-gray-800 mb-2">1. חימום עם מוזיקה - "Toy" (נטע ברזילי)</h3>
        <p class="text-gray-700 mb-2">מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך.</p>
        <p class="text-gray-700 mb-2">עושים חימום של כל איברי הגוף השונים. מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.</p>
        <p class="text-gray-700">מבקשים מהם ללכת מהר, ואז ממש לאט במהירויות שונות.</p>
      </div>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. פעילות לפי השיר - "קדימה ואחורה"</h3>
        <p class="text-gray-700">לפי מילות השיר - קדימה ועצור, סיבוב, גלגול ידיים וקפיצה. אחורה עצור, סיבוב, גלגול ידיים וקפיצה.</p>
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
      <p class="text-gray-700 mb-3">נסדר את החישוקים על הרצפה במעגל. נזמין את הילדים לעמוד כל אחד בתוך חישוק. הילדים מרימים את החישוק מהרצפה.</p>
      
      <div class="space-y-3">
        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-semibold text-purple-900 mb-1">גלגול קדימה</h4>
          <p class="text-gray-700 text-sm">מגלגלים את החישוק קדימה, כל הילדים נכנסים פנימה למעגל.</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-semibold text-purple-900 mb-1">גלגול אחורה</h4>
          <p class="text-gray-700 text-sm">ממרכז המעגל נלך אחורה – נגלגל את החישוק אחורה חזרה למקום שלנו, לפני הכיסא.</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-semibold text-purple-900 mb-1">גלגול ימינה ושמאלה</h4>
          <p class="text-gray-700 text-sm mb-2"><span class="font-semibold">גילאי חובה:</span> נגלגל עם יד אחת את החישוק לחבר שמימיננו וביד השניה נקבל חישוק מהחבר משמאלנו.</p>
          <p class="text-gray-700 text-sm"><span class="font-semibold">גילאי 3-4:</span> נגלגל ימינה ושמאלה.</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-semibold text-purple-900 mb-1">קפיצות בגבהים שונים</h4>
          <p class="text-gray-700 text-sm">נעמוד בתוך החישוק – נקפוץ לגובה, עמידה שפופה - נמוך, קפיצה – לגובה.</p>
        </div>
      </div>

      <div class="bg-purple-50 rounded-lg p-3 mt-3">
        <h4 class="font-semibold text-purple-900 mb-1">💡 במידה ויש זמן</h4>
        <p class="text-gray-700 text-sm">נכנסים לתוך המעגל ולצלילי מוזיקת רקע (אפשר להשתמש בשיר הקצבי של החימום - "Toy" טוי). הולכים הליכה שפופה כמו ברווזים, וקופצים לגובה כמו צפרדעים.</p>
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
        <h3 class="font-bold text-orange-900 mb-2">תחנה 1: חצים</h3>
        <p class="text-gray-700 mb-2">מסדרים 8 חצים בטור שמכוונים לכיוונים שונים (קדימה, אחורה, ימינה, שמאלה).</p>
        <p class="text-gray-700">על הילדים לעמוד מעל החץ ברגליים פסוקות כשהחץ בין כפות הרגליים שלהם ולקפוץ לכיוון שמראה החץ.</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 2: סלאלום בקונוסים</h3>
        <p class="text-gray-700">7 קונוסים – מסודרים בטור במרחק שווה אחד מהשני. הילדים צריכים ללכת ביניהם בסלאלום.</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 3: הליכה על חבל</h3>
        <p class="text-gray-700 mb-2">חבל לבן – מסדרים את החבל בזיגזג. על הילדים ללכת לאורך החבל.</p>
        <p class="text-gray-700 text-sm italic">💡 כדי לאתגר את הילדים במסלול לפי הגילאים השונים יש להקשות לפי גובה, לפי מרחק ולפי עמידה על רגל אחת, קפיצה, לסגור את העיניים, ידיים על הראש</p>
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
        <li class="flex items-start gap-2"><span class="text-pink-500">•</span><span class="text-gray-700">לעמוד באמצע ולהזמין לחיבוק פרידה מי שרוצה</span></li>
        <li class="flex items-start gap-2"><span class="text-pink-500">•</span><span class="text-gray-700">אפשר לעשות הרפייה על הרצפה, לכבות את האורות בגן ולשים מוזיקה מרגיעה</span></li>
        <li class="flex items-start gap-2"><span class="text-pink-500">•</span><span class="text-gray-700">אפשר להנחות אותם לפתוח את הידיים גדול גדול לצדדים ואז לקרב לאט לאט עד שמגיעים לחיבוק עצמי. לתת נשיקה לכל כתף ולהגיד תודה לגוף שלי</span></li>
        <li class="flex items-start gap-2"><span class="text-pink-500">•</span><span class="text-gray-700">אפשר למתוח את הגוף ולעשות לו מסאז לכל חלק בגוף</span></li>
      </ul>
    </div>
  </div>

  <div class="bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 rounded-xl shadow-lg p-6 text-center">
    <h3 class="text-xl font-bold text-yellow-900 mb-2 flex items-center justify-center gap-2">
      <span>🎖️</span>
      חלוקת חותמת: צב
    </h3>
    <p class="text-3xl">🐢</p>
  </div>

  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md py-4">
    <p class="text-xl font-bold">בהצלחה! 🎉</p>
  </div>

</div>
`
};

console.log('Starting basic skills batch 2 (FINAL): מיומנות יסוד 4-6...');

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

console.log('✨✨✨ Basic skills batch 2 complete! (6/11 in series) ✨✨✨');
process.exit(0);
