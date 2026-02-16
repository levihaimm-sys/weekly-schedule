/**
 * Perfect styling - Basic Skills lessons 1-3 (FAST!)
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
  'מיומנות יסוד 1': `
<div class="max-w-4xl mx-auto space-y-6">
  
  <div class="text-center bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 1 - מיומנויות יסוד ותנועה במרחב</h1>
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
      <p class="text-gray-700">37 מטפחות וסרט רשת</p>
    </div>
    <div class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⭐</span>
        <h3 class="font-bold text-blue-900">חותמת</h3>
      </div>
      <p class="text-gray-700">רכב</p>
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
        <h3 class="font-bold text-gray-800 mb-2">1. חימום עם מוזיקה - "החיים שלנו תותים"</h3>
        <p class="text-gray-700 mb-2">מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך.</p>
        <p class="text-gray-700 mb-2">עושים חימום של כל איברי הגוף השונים. מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.</p>
        <p class="text-gray-700">מבקשים מהם ללכת מהר, ואז ממש לאט במהירויות שונות.</p>
      </div>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. שיר הפעלה - "בואו בשמחה"</h3>
        <p class="text-gray-700">עמידה במעגל לפי מילות השיר, להניף את הידיים, יד עולה יד יורדת, ידיים מצד לצד, ידיים למעלה למטה לרצפה.</p>
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
      <p class="text-gray-700 font-semibold mb-3">מחלקים לכל ילד מטפחת</p>
      
      <div class="space-y-3">
        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-semibold text-purple-900 mb-1">1. שמירה על קשר עין עם המטפחת</h4>
          <p class="text-gray-700 text-sm">זורקים את המטפחת למעלה לגובה ורואים במבט איך היא נופלת מטה ומגיעה לקרקע. כדאי לכוון את הילדים לראות את מסלול הנחיתה לפני הכל ולהבין את מסלול מעוף ונחיתת המטפחת.</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-semibold text-purple-900 mb-1">2. תפיסת המטפחת ברמות גובה שונות</h4>
          <p class="text-gray-700 text-sm">זורקים את המטפחת למעלה ומנסים לתפוס אותה. פעם שהמטפחת ממש למעלה, פעם כשהיא באמצע, ופעם שהמטפחת למטה נמוך לפני שהיא נוגעת בקרקע.</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-semibold text-purple-900 mb-1">3. עומדים ויושבים בעקבות המטפחת</h4>
          <p class="text-gray-700 text-sm">עומדים ומעיפים את המטפחת לגובה ומיד מתיישבים ומנסים לתפוס את המטפחת בישיבה.</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-semibold text-purple-900 mb-1">4. הקפצת המטפחת</h4>
          <p class="text-gray-700 text-sm">ליצור כדור מהמטפחת, מקפיצים את המטפחת עם כף היד כלפי מעלה, ולא תופסים. רק להקפיץ מבלי שהמטפחת תיפול לרצפה.</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-semibold text-purple-900 mb-1">5. איברים תופסים מטפחת</h4>
          <p class="text-gray-700 text-sm">מעיפים את המטפחת לגובה ומנסים לתפוס אותה בעזרת אחד מאיברי הגוף השונים למשל: הכתף, הבטן, הגב, המרפק, הפנים וכדומה.</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-semibold text-purple-900 mb-1">6. הקפצת המטפחת מכף הרגל</h4>
          <p class="text-gray-700 text-sm">יוצרים כדור מהמטפחת, מניחים את המטפחת על כף הרגל ומנסים להעיף אותה למעלה בתנועת הרמה אחת ולתפוס ביד.</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-semibold text-purple-900 mb-1">7. מטפחת כדור</h4>
          <p class="text-gray-700 text-sm">מועכים את המטפחת ומכווצים לכדור קטן. זורקים ומתמסרים עם חבר כמו בכדור.</p>
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
      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">סרט רשת מרובע</h3>
        <p class="text-gray-700 mb-3">מחלקים את הילדים ל-3 קבוצות:</p>
        <p class="text-gray-700 mb-2">שתי קבוצות עומדות בשורה פנים מול פנים במרחק, כמו במשחק תיפסוני, כשהרשת מוחזקת במפרק כף הרגל או בגובה הברכיים.</p>
        <p class="text-gray-700 mb-3">הקבוצה השלישית היא הקבוצה שפועלת בתוך הסרט. בכל פעם מתחלפים במקום, קבוצה 1 מתחילה בפנים ומתחלפת עם קבוצה הבאה אחריה.</p>
        
        <h4 class="font-semibold text-orange-900 mb-2 mt-3">צורות התקדמות לחיזוק חגורת הכתפיים:</h4>
        <p class="text-gray-700 text-sm mb-2">בכל פעם נשנה את גובה הסרט לצורת ההתקדמות של הילדים, כדי שרמת הקושי תתאים.</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• הליכה על 6 – חתול</li>
          <li class="text-gray-700">• הליכה על ארבע – דב</li>
          <li class="text-gray-700">• הליכה הפוך על ארבע – סרטן</li>
          <li class="text-gray-700">• זחילה על הבטן – נחש</li>
          <li class="text-gray-700">• זחילה על המרפקים – לטאה</li>
          <li class="text-gray-700">• זחילה על הגב – תולעת</li>
        </ul>
        <p class="text-gray-700 text-sm italic mt-3">💡 אם יש לכם רעיון נוסף או אם לילדים יש רעיון נוסף למשחק (משחק הפסלים, קפיצות בין הרשת וכד'), ניתן להוסיף ולשחק</p>
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
      חלוקת חותמת: רכב
    </h3>
    <p class="text-3xl">🚗</p>
  </div>

  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md py-4">
    <p class="text-xl font-bold">בהצלחה! 🎉</p>
  </div>

</div>
`,

  'מיומנות יסוד 2': `
<div class="max-w-4xl mx-auto space-y-6">
  
  <div class="text-center bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 2 - מיומנויות יסוד ותנועה במרחב</h1>
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
      <p class="text-gray-700 text-sm">37 דליים קטנים, 10 דליים גדולים, 4 קונוסים גדולים, 2 מקלות צהובים</p>
    </div>
    <div class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⭐</span>
        <h3 class="font-bold text-blue-900">חותמת</h3>
      </div>
      <p class="text-gray-700">פיל</p>
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
        <h3 class="font-bold text-gray-800 mb-2">1. חימום עם מוזיקה - "אם תרצי" (חנן בן ארי)</h3>
        <p class="text-gray-700 mb-2">מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך.</p>
        <p class="text-gray-700 mb-2">עושים חימום של כל איברי הגוף השונים. מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.</p>
        <p class="text-gray-700">מבקשים מהם ללכת מהר, ואז ממש לאט במהירויות שונות.</p>
      </div>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. חימום 2 - "שבוע טוב" (אברהם טל)</h3>
        <p class="text-gray-700 mb-2">ללכת כשבכל צעד ברך אחת עולה ומגיעה לבטן. עוצרים ובעמידה מתרגלים את שיווי המשקל על רגל אחת ואז על השנייה, ותוך כדי בהליכה.</p>
        <p class="text-gray-700 mb-2">אפשר לכלול סוגים שונים של הליכות - סרטן, הליכת שש, דילוג, צעדי רדיפה (תלוי בגיל המודרך).</p>
        <p class="text-gray-700 mb-2">נשחק קצת עם הגוף: ישיבה על הישבן, נחבק את הרגליים כשהן כפופות אל הגוף ונתנדנד קדימה ואחורה - להרגיש את משקל הגוף.</p>
        <p class="text-gray-700 mb-2">להרים ידיים מעל הראש/להניח ידיים על הראש/לפתוח ידיים לצדדים - לכל אחד איזון אחר שמתאים לו. ניישר את הרגליים קדימה באוויר - ישיבה רק על הישבן.</p>
        <p class="text-gray-700 text-sm italic">להזכיר שמתחילים היום נושא חדש ולשאול איזה נושא סיימנו בשבוע שעבר</p>
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
      <p class="text-gray-700 mb-3">לחלק לכל ילד דלי קטן ונעבוד יחד איתו</p>
      
      <div class="space-y-3">
        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-semibold text-purple-900 mb-1">1. משחק האיברים</h4>
          <p class="text-gray-700 text-sm">נבקש מהילדים לשים איברים שונים על הדלי. מי יכול להניח איבר אחד? שני איברים? שלושה איברים?</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-semibold text-purple-900 mb-1">2. הליכת דוב</h4>
          <p class="text-gray-700 text-sm">ידיים על הדלי - הדלי על הגב והולכים כמו דוב (ידיים ורגליים ישרות על הרצפה והדלי על הגב, הליכה על ארבע). בואו ננסה להתקדם לאט, מהר, על קצות האצבעות.</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-semibold text-purple-900 mb-1">3. ציפור על הדלי</h4>
          <p class="text-gray-700 text-sm">ננסה להתייצב בשכיבה עם הבטן על הדלי כשכפות הידיים וכפות הרגליים מונפות באוויר כמו ציפור.</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-semibold text-purple-900 mb-1">4. הליכת עכביש</h4>
          <p class="text-gray-700 text-sm">ידיים על הדלי והולכים קדימה (בזהירות, הולכים לאט מהסיבה שהדלי ניתקע בחיבורים של המרצפות ואפשר ליפול). ננסה להניף יד ורגל אחת באוויר כשיד אחת על הדלי ורגל אחת על הרצפה.</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-semibold text-purple-900 mb-1">5-6. עמידה ותיפוף</h4>
          <p class="text-gray-700 text-sm">לעמוד עם רגל אחת על הדלי ורגל השנייה על הרצפה. לרקוע עם הרגל שעל הדלי ולתופף עם היד הנגדית על הרגל שעל הריצפה (ולהחליף רגליים).</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-semibold text-purple-900 mb-1">7. הדלי משמש ככובע</h4>
          <p class="text-gray-700 text-sm">כובע על הראש, כובע לכף יד ימין ולכף יד שמאל, למרפק ימין ומרפק שמאל, כובע לברך ימין וברך שמאל. נשכב על הגב וננסה לשים כובע לרגל ימין ואז שמאל (למתוח את האיברים כשמרימים יד או רגל הכי גבוהה למעלה).</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-3">
          <h4 class="font-semibold text-purple-900 mb-1">8. הדלי משמש כתוף</h4>
          <p class="text-gray-700 text-sm">לשים את הדלי על הרצפה (הפוך) ולתופף חזק. להקיש עם כריות האצבעות, להקיש עם הציפורניים (לעבוד על ויסות העוצמה בכפות הידיים). להקיש במקצבים שונים ושהילדים יחזרו.</p>
        </div>
      </div>
      
      <p class="text-gray-700 text-sm italic mt-3">💡 אפשר להשמיע את השיר "בואו נתופף על התוף הגדול" - פעילות קצרה למשחק עם הדלי</p>
      <p class="text-gray-700 text-sm italic">💡 תוכלו לתת זמן לרעיונות משלהם ואם יש רעיון שמתקשר לשיווי משקל או התעמלות לבקש מכולם לבצע</p>
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
      <p class="text-gray-700 mb-3">4 מסלולים שונים פרוסים במרחב על משטחים נגד החלקה</p>
      
      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">מסלול 1: דליים גדולים</h3>
        <p class="text-gray-700">שני טורים צמודים של דליים גדולים - 5 דליים גדולים בכל טור, סה"כ 10 דליים גדולים. הליכה עם רגל ימין על טור ימין ורגל שמאל על טור שמאל.</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">מסלול 2: זיגזג בדליים קטנים</h3>
        <p class="text-gray-700">טור של 15 דליים קטנים - הליכה על העקבים בזיג זג בין הדליים הקטנים.</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">מסלול 3: משוכות</h3>
        <p class="text-gray-700 mb-2">שני קונוסים מחוררים ומקל ביניהם כמשוכה X2:</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700 text-sm">• משוכה ראשונה - מקל נמוך: מעל שני הקונוסים הראשון נקפוץ</li>
          <li class="text-gray-700 text-sm">• משוכה שנייה - מקל גבוה: מעל שני הקונוסים השניים נזחול</li>
        </ul>
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
      חלוקת חותמת: פיל
    </h3>
    <p class="text-3xl">🐘</p>
  </div>

  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md py-4">
    <p class="text-xl font-bold">בהצלחה! 🎉</p>
  </div>

</div>
`,

  'מיומנות יסוד 3': `
<div class="max-w-4xl mx-auto space-y-6">
  
  <div class="text-center bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 3 - מיומנויות יסוד ותנועה במרחב</h1>
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
      <p class="text-gray-700 text-sm">37 טבעות, 2 משוכות בגבהים שונים, משטח נגד החלקה, מזרון צבעוני, 4 מקלות ארוכים</p>
    </div>
    <div class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⭐</span>
        <h3 class="font-bold text-blue-900">חותמת</h3>
      </div>
      <p class="text-gray-700">ציפור</p>
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
        <h3 class="font-bold text-gray-800 mb-2">1. חימום עם מוזיקה - "אצל הדודה והדוד"</h3>
        <p class="text-gray-700 mb-2">מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך.</p>
        <p class="text-gray-700 mb-2">עושים חימום של כל איברי הגוף השונים. מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.</p>
        <p class="text-gray-700">מבקשים מהם ללכת מהר, ואז ממש לאט במהירויות שונות.</p>
      </div>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. ריקוד הציפורים</h3>
        <p class="text-gray-700">מנגנים את השיר ועושים עפ"י מילות השיר.</p>
      </div>
      <div>
        <h3 class="font-bold text-gray-800 mb-2">3. משחק הפסלים - "רוצו רוץ"</h3>
        <p class="text-gray-700 mb-2">מנגנים מוזיקה ברקע וברגע שעוצרת המוזיקה צריך לעמוד בצורה מסוימת:</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• שוכבים על הרצפה</li>
          <li class="text-gray-700">• עומדים בפיסוק הכי גדול שיש</li>
          <li class="text-gray-700">• עומדים בצורה הכי מכווצת שיש</li>
          <li class="text-gray-700">• עושים פרצוף של: אריה, דג, פיל, קוף</li>
          <li class="text-gray-700">• עושים פרצוף לפי רגש - עצוב, שמח, מבולבל, משוגע, מצחיק</li>
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
      <p class="text-gray-700 font-semibold mb-3">עבודה עם טבעות - נחלק לכל ילד טבעת ונבקש שישב על הרצפה</p>
      <p class="text-gray-700 mb-3">נחקור יחד את המושגים - לצדדים, קדימה, אחורה, מעל, מתחת, ליד, בתוך ומחוץ.</p>
      <p class="text-gray-700 text-sm italic mb-3">⚠️ בזמן התרגילים מאוד חשוב ללמד אותם את המושגים והם יתנסו תוך כדי שהם שומעים את המושגים הללו</p>
      
      <div>
        <h4 class="font-semibold text-purple-900 mb-2">תרגילים עם הטבעת:</h4>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">1. ניקח את הטבעת למעלה, למטה, קדימה ואחורה</li>
          <li class="text-gray-700">2. נשים את הטבעת מעל הראש ומתחת לבית השחי</li>
          <li class="text-gray-700">3. נשים את האצבע בתוך הטבעת ואז נוציא אותה החוצה</li>
          <li class="text-gray-700">4. נסובב את הטבעת בעזרת היד השנייה</li>
          <li class="text-gray-700">5. נסובב כמו סביבון - נסובב על האצבע והיד - נסובב כמו הגה</li>
        </ul>
      </div>

      <div>
        <h4 class="font-semibold text-purple-900 mb-2 mt-3">גלגולים עם הטבעת:</h4>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">1. מהבטן אל כפות הרגליים</li>
          <li class="text-gray-700">2. על הרצפה ונגלגל מיד ליד</li>
          <li class="text-gray-700">3. על הבטן ונגלגל מאחורי הגב (נשלים סיבוב חזרה לבטן)</li>
        </ul>
        <p class="text-gray-700 text-sm italic mt-2">💡 יש לתת זמן לרעיונות משלהם ואם יש רעיון שמתקשר לגלגולים או סיבובים לבקש מכולם לבצע</p>
      </div>

      <div>
        <h4 class="font-semibold text-purple-900 mb-2 mt-3">בעמידה עם שיר - "עיגולים מתגלגלים":</h4>
        <p class="text-gray-700 mb-2">לתת להם פעילות במרחב לפי מילות השיר:</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• לגלגל את הטבעת</li>
          <li class="text-gray-700">• לדחוף ולתפוס</li>
          <li class="text-gray-700">• לסובב כמו סביבון</li>
          <li class="text-gray-700">• גלגלים כמו אוטו</li>
        </ul>
      </div>

      <p class="text-gray-700 text-sm italic mt-3">החזרת הטבעות: כל הילדים חוזרים לשבת במקום ואנו עוברים עם התיק וכל ילד מחזיר לתיק - לשים לב שכל הילדים מחזירים את הטבעת שלהם</p>
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
        <h3 class="font-bold text-orange-900 mb-2">תחנה 1: טבעות בזיגזג</h3>
        <p class="text-gray-700">מסדרים 2 טורים של הטבעות - 10 בכל טור, בצורה זיגזג. הילדים צריכים ללכת מטבעת לטבעת ולא לדרוך על הרצפה.</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 2: קפיצה מעל מקלות</h3>
        <p class="text-gray-700">להניח 2 מקלות ברווח גדול (תלוי בגיל המודרך) שבסופם יש מזרון צבעוני שמונח על מזרון יוגה. הילדים צריכים לקפוץ מעל המקלות (כמו במשחק 3 מקלות) ואז לנחות בסוף על המזרון הצבעוני.</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">תחנה 3: זחילה מתחת למשוכות</h3>
        <p class="text-gray-700">2 משוכות בגבהים שונים. הילדים צריכים לזחול מתחת לשתי המשוכות.</p>
      </div>

      <p class="text-gray-700 text-sm italic mt-3">💡 אפשר לחזור על המסלול כמה פעמים</p>
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
      חלוקת חותמת: ציפור
    </h3>
    <p class="text-3xl">🐦</p>
  </div>

  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md py-4">
    <p class="text-xl font-bold">בהצלחה! 🎉</p>
  </div>

</div>
`
};

console.log('Starting basic skills batch 1: מיומנויות יסוד 1-3...');

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

console.log('✨ Basic skills batch 1 complete! (3/11 in series)');
process.exit(0);
