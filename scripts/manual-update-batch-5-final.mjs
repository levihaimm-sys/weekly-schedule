/**
 * Manual perfect styling - Batch 5 (FINAL 3)
 * מערכים 8-9 + שיווי משקל 3
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
  'פתיחת שנה 8': `
<div class="max-w-4xl mx-auto space-y-6">
  
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 8 - פתיחת שנה ומודעות לגוף</h1>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⏱️</span>
        <h3 class="font-bold text-blue-900">זמן מערך</h3>
      </div>
      <p class="text-gray-700">45-30 דקות</p>
    </div>
    <div class="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">📦</span>
        <h3 class="font-bold text-purple-900">ציוד</h3>
      </div>
      <p class="text-gray-700 text-sm">37 מקלות קלים (ארטיק), 12 נדנדות, 2 מזרוני יוגה</p>
    </div>
    <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⭐</span>
        <h3 class="font-bold text-green-900">חותמת</h3>
      </div>
      <p class="text-gray-700">צפרדע</p>
    </div>
  </div>

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
          <span class="text-gray-700">הילדים ילמדו להקשיב להוראות שאת מנחה אותם</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-1">•</span>
          <span class="text-gray-700">הילדים יכירו צורות שונות של מבנים קבוצתיים (שלשות, זוגות, מעגל, טור)</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-1">•</span>
          <span class="text-gray-700">הילדים ילמדו להכיר איברים שונים בגופם ותנועתם במרחב</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-1">•</span>
          <span class="text-gray-700">הילדים ילמדו לעבוד עם אביזרים שונים</span>
        </li>
      </ul>
    </div>
  </div>

  <div class="bg-white border-2 border-green-200 rounded-xl shadow-md overflow-hidden">
    <div class="bg-green-100 px-6 py-4 border-b-2 border-green-200">
      <h2 class="text-2xl font-bold text-green-900 flex items-center gap-2">
        <span>🚀</span>
        פתיחה: 5 דק'
      </h2>
    </div>
    <div class="p-6 space-y-4">
      
      <div>
        <h3 class="font-bold text-gray-800 mb-2">1. חימום עם מוזיקה - "טריליליטרללה"</h3>
        <p class="text-gray-700 mb-2">מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך.</p>
        <p class="text-gray-700 mb-2">עושים חימום של כל איברי הגוף השונים. מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.</p>
        <p class="text-gray-700">מבקשים מהם ללכת מהר, ואז ממש לאט במהירויות שונות.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. שירי הפעלה</h3>
        <p class="text-gray-700 mb-2"><span class="font-semibold">מי במעגל:</span> לפי מילות השיר, לשבת במעגל ובכל פעם כמה זוגות נכנסים למעגל ורוקדים.</p>
        <p class="text-gray-700"><span class="font-semibold">נ נ נדנדה:</span> לפי מילות השיר, במעגל כולם ביחד, מתחבקים על הכתפיים ומתנדנדים, עומדים ומתנדנדים, בזוגות, כל אחד לבד. אפשר לשים ברצף פעמיים את השיר.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">3. מעגל שמות עם תנועה</h3>
        <p class="text-gray-700 mb-2">קודם כל מציגים את עצמנו ועושים תנועה עם הגוף בישיבה.</p>
        <p class="text-gray-700 mb-2">עושים סבב של כל הילדים וצריך לחקות את התנועה של כל ילד ביחד עם זה שאומרים את השם.</p>
        <p class="text-gray-700 italic">"קוראים לי שירה (אני עושה תנועה של מחיאת כף)" - כולם צריכים לחזור אחרי השם שלי יחד עם מחיאת כף.</p>
        <p class="text-gray-700 text-sm italic mt-2">להזכיר את נושא החודש ולשאול במה שיחקנו בשבוע שעבר.</p>
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
      
      <p class="text-gray-700 mb-2">מחלקים לכל ילד מקל ואנחנו ננסה לאזן אותו על חלקים שונים בגוף.</p>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">1. בישיבה:</h3>
        <p class="text-gray-700">על הראש, על כל אחת מהידיים, על כל אחד מהרגלייים, על המצח, על האף, על הכתפיים (ועוד איברים)</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. בעמידה:</h3>
        <p class="text-gray-700 mb-2">אותם האיברים בעמידה.</p>
        <p class="text-gray-700 mb-2">בעמידה על רגל אחת.</p>
        <p class="text-gray-700">בהליכה.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">3. מחלקים לזוגות:</h3>
        <p class="text-gray-700 mb-2">שואלים את הילדים מה אפשר לעשות ביחד עם המקלות ארטיק?</p>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• לבנות גשר?</li>
          <li class="text-gray-700">• להתמסר?</li>
          <li class="text-gray-700">• איזה רעיונות יש לכם?</li>
        </ul>
        <p class="text-gray-700 text-sm italic mt-2">(מזמינים יצירתיות של הילדים ודמיון לתרגיל הזה)</p>
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
      
      <div>
        <p class="text-gray-700 mb-3">לפרוס 2 מזרוני יוגה ולסדר עליהם 2 טורים של נדנדות, בכל טור 6 נדנדות.</p>
        <p class="text-gray-700 font-semibold mb-2">הדגשים: הולכים לאט - בכל פעם נזמין 2 ילדים ללכת על המסלול.</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">מסלול 1: טור לרוחב</h3>
        <p class="text-gray-700 mb-1">האדום בצד ימין, הצהוב בצד שמאל (נדנדה מצד לצד)</p>
        <p class="text-gray-700">הולכים על הנדנדות כשאנחנו לא נוגעים בצבעים – אדום וצהוב, אלה רק באמצע הנדנדה.</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">מסלול 2: טור לרוחב</h3>
        <p class="text-gray-700 mb-1">האדום בצד ימין, הצהוב בצד שמאל (נדנדה מצד לצד)</p>
        <p class="text-gray-700">הולכים כשרגל ימין מתחילה ורגל שמאל מצטרפת - רגל ימין על הצבע האדום ורגל שמאל על הצבע הצהוב.</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">מסלול 3: טור לרוחב</h3>
        <p class="text-gray-700 mb-1">האדום בצד ימין, הצהוב בצד שמאל (נדנדה מצד לצד)</p>
        <p class="text-gray-700">הולכים כשרגל שמאל מתחילה ורגל ימין מצטרפת - רגל שמאל על הצהוב ורגל ימין על האדום.</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">מסלול 4: טור לאורך</h3>
        <p class="text-gray-700 mb-1">האדום ראשון, צהוב, אדום, צהוב, אדום... (נדנדה קדימה ואחורה)</p>
        <p class="text-gray-700">רגל ימין מתחילה על הצבע האדום ושמאל מצטרפת על הצבע הצהוב.</p>
        <p class="text-gray-700 text-sm italic">(אם השיעור זורם יפה וניראה לך שנותר זמן, אפשר להוסיף שרגל שמאל מתחילה וימין מצטרפת)</p>
      </div>

      <p class="text-gray-700 text-sm mt-3">קובעים נקודת התחלה ונקודת סיום, מזמינים בכל פעם ילד אחד ללכת במסלול, לאחר שהוא עבר לפחות 2 נדנדות מזמינים ילד נוסף, כל ילד שסיים את המסלול חוזר לשבת במקום.</p>

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

  <div class="bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 rounded-xl shadow-lg p-6 text-center">
    <h3 class="text-xl font-bold text-yellow-900 mb-2 flex items-center justify-center gap-2">
      <span>🎖️</span>
      חלוקת חותמת: צפרדע
    </h3>
    <p class="text-3xl">🐸</p>
  </div>

  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md py-4">
    <p class="text-xl font-bold">בהצלחה! 🎉</p>
  </div>

</div>
`,

  'פתיחת שנה 9': `
<div class="max-w-4xl mx-auto space-y-6">
  
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 9 - פתיחת שנה ומודעות לגוף</h1>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⏱️</span>
        <h3 class="font-bold text-blue-900">זמן מערך</h3>
      </div>
      <p class="text-gray-700">45-30 דקות</p>
    </div>
    <div class="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">📦</span>
        <h3 class="font-bold text-purple-900">ציוד</h3>
      </div>
      <p class="text-gray-700 text-sm">17 מסילות, 17 כדורים</p>
    </div>
    <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⭐</span>
        <h3 class="font-bold text-green-900">חותמת</h3>
      </div>
      <p class="text-gray-700">דינוזאור</p>
    </div>
  </div>

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
          <span class="text-gray-700">הילדים ילמדו להקשיב להוראות שאת מנחה אותם</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-1">•</span>
          <span class="text-gray-700">הילדים יכירו צורות שונות של מבנים קבוצתיים (שלשות, זוגות, מעגל, טור)</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-1">•</span>
          <span class="text-gray-700">הילדים ילמדו להכיר איברים שונים בגופם ותנועתם במרחב</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-1">•</span>
          <span class="text-gray-700">הילדים ילמדו לעבוד עם אביזרים שונים</span>
        </li>
      </ul>
    </div>
  </div>

  <div class="bg-white border-2 border-green-200 rounded-xl shadow-md overflow-hidden">
    <div class="bg-green-100 px-6 py-4 border-b-2 border-green-200">
      <h2 class="text-2xl font-bold text-green-900 flex items-center gap-2">
        <span>🚀</span>
        פתיחה: 5 דק'
      </h2>
    </div>
    <div class="p-6 space-y-4">
      
      <div>
        <h3 class="font-bold text-gray-800 mb-2">1. חימום עם מוזיקה - "מהפכה של שמחה"</h3>
        <p class="text-gray-700 mb-2">מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך.</p>
        <p class="text-gray-700 mb-2">עושים חימום של כל איברי הגוף השונים. מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.</p>
        <p class="text-gray-700">מבקשים מהם ללכת מהר, ואז ממש לאט במהירויות שונות.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. "נושיט ידיים" - לפי מילות השיר, בעמידה</h3>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">3. "באסה סבבה"</h3>
        <p class="text-gray-700">משחק הפסלים - כשהמוזיקה עוצרת להניח איבר שנקרא בשמו על הרצפה.</p>
        <p class="text-gray-700 text-sm italic">להזכיר את נושא החודש ולשאול במה שיחקנו בשבוע שעבר.</p>
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
      
      <p class="text-gray-700 font-semibold mb-3">אביזרים: כדורים ומסילות</p>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">1. הדגמה של העבודה עם האביזר</h3>
        <p class="text-gray-700">ילד אחד יושב בצד אחד של המסילה וילד אחר בצד השני, מגלגלים אחד לשני את הכדור.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. חלוקת האביזר</h3>
        <p class="text-gray-700 mb-2">לסדר על הרצפה את המסילות בשורה ארוכה.</p>
        <p class="text-gray-700 mb-2">כל ילד לפי הזמנה שלך מגיע ויושב בפיסוק על הריצפה כשהמסילה בין הרגליים. תזמיני בכל פעם לפחות 2 ילדים, אחד מצד ימין ואחד מצד שמאל.</p>
        <p class="text-gray-700">רק לאחר שכל הילדים מסודרים ליד המסילה שלהם, את מניחה את הכדור על הצבע האפור במסילה ובהוראה שלך אפשר להתחיל לגלגל את הכדור.</p>
        <div class="bg-purple-50 rounded-lg p-3 mt-2">
          <p class="text-sm font-semibold text-gray-800 mb-1">הדגשים:</p>
          <ul class="mr-6 space-y-1">
            <li class="text-gray-700 text-sm">• הכדור חייב להישאר על המסילה</li>
            <li class="text-gray-700 text-sm">• מגלגלים לאט את הכדור</li>
            <li class="text-gray-700 text-sm">• מגלגלים את הכדור בלי להיעזר בידיים</li>
            <li class="text-gray-700 text-sm">• המסילה נשארת במקום ללא תזוזה או מגע</li>
          </ul>
        </div>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">3. עבודה עם האביזר</h3>
        <ul class="space-y-2">
          <li class="text-gray-700">• לעמוד בצד אחד של החדר ובהוראה לבקש מכולם להרים את היד שקרובה אלי. את היד הזו להניח על הכדור ולגלגל לחבר שממול</li>
          <li class="text-gray-700">• לאחר כמה גלגולים לעבור לצידו השני של החדר ושוב בהוראה לבקש להרים את היד שעכשיו קרובה אלי ולגלגל עם היד הזו</li>
          <li class="text-gray-700">• לגלגל לאט אחד לשני</li>
          <li class="text-gray-700">• לגלגל מהר אחד לשני</li>
          <li class="text-gray-700">• כל ילד זז אחורה עם הישבן מהמסילה ושואלים את הילדים - איך אפשר לגלגל את הכדור לחבר שלפנינו מבלי לגעת בכדור? להצביע ולתת להם לומר – רק לומר ללא הדגמה מה דעתם..</li>
          <li class="text-gray-700">• כל ילד חוזר לשבת ליד המסילה. רק מי שיושב ליד הצבע האדום יכול להרים ולגלגל לחבר מולו את הכדור. כשהכדור מגיע לחבר מניחים את המסילה על הרצפה והחבר בצד השני מרים את המסילה (לשים לב - להרים את המסילה רק עד גובה הפופיק)</li>
          <li class="text-gray-700">• לנסות שהכדור יתגלגל מהר</li>
          <li class="text-gray-700">• לנסות שהכדור יתגלגל לאט</li>
          <li class="text-gray-700">• לנסות להרים רק עם יד אחת</li>
          <li class="text-gray-700">• לנסות את התרגיל בעמידה</li>
        </ul>
        <p class="text-gray-700 mt-2">כולם מניחים את המסילה על הרצפה וחוזרים לשבת במקום.</p>
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
      
      <div>
        <p class="text-gray-700 mb-2">ליצור 2-3 טורים בין שלוש מסילות המחוברות אחת לשנייה.</p>
        <p class="text-gray-700 mb-3">המשימה היא לגלגל את הכדור בין מסילה למסילה, כל פעם ילד בתורו.</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">דגשים:</h3>
        <ul class="mr-6 space-y-1">
          <li class="text-gray-700">• ניצור כמה טורים כדי שכמה ילדים יעבדו יחד</li>
          <li class="text-gray-700">• יש להסביר לילדים איך להתכופף ולהדגיש שאנחנו מזיזים את הכדור רק בעזרת המסילות</li>
          <li class="text-gray-700">• אפשר לשים מוזיקה לבחירתך ברקע משהו קופצני וכיפי מהרשימה</li>
          <li class="text-gray-700">• אם יש זמן אפשר לעשות סבב נוסף</li>
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

  <div class="bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 rounded-xl shadow-lg p-6 text-center">
    <h3 class="text-xl font-bold text-yellow-900 mb-2 flex items-center justify-center gap-2">
      <span>🎖️</span>
      חלוקת חותמת: דינוזאור
    </h3>
    <p class="text-3xl">🦕</p>
  </div>

  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md py-4">
    <p class="text-xl font-bold">בהצלחה! 🎉</p>
  </div>

</div>
`,

  'שיווי משקל 3': `
<div class="max-w-4xl mx-auto space-y-6">
  
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">מערך 3 - שיווי משקל, קורדינציה וויסות כוח</h1>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⏱️</span>
        <h3 class="font-bold text-blue-900">זמן מערך</h3>
      </div>
      <p class="text-gray-700">45-30 דקות</p>
    </div>
    <div class="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">📦</span>
        <h3 class="font-bold text-purple-900">ציוד</h3>
      </div>
      <p class="text-gray-700 text-sm">37 כפות פלסטיק, 37 כדורים רעשנים, 11 ספוגים, 4 קורות עץ</p>
    </div>
    <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⭐</span>
        <h3 class="font-bold text-green-900">חותמת</h3>
      </div>
      <p class="text-gray-700">זברה</p>
    </div>
  </div>

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

  <div class="bg-white border-2 border-green-200 rounded-xl shadow-md overflow-hidden">
    <div class="bg-green-100 px-6 py-4 border-b-2 border-green-200">
      <h2 class="text-2xl font-bold text-green-900 flex items-center gap-2">
        <span>🚀</span>
        פתיחה: 5 דק'
      </h2>
    </div>
    <div class="p-6 space-y-4">
      
      <div>
        <h3 class="font-bold text-gray-800 mb-2">1. חימום עם מוזיקה - "סילסולים"</h3>
        <p class="text-gray-700 mb-2">מנגנים את השיר ברקע ומבקשים לילדים לחקות אותך.</p>
        <p class="text-gray-700 mb-2">עושים חימום של כל איברי הגוף השונים. מתחילים מסיבוב של הראש והצוואר, ידיים קדימה ואחורה, סיבוב כתפיים, סיבוב אגן, מתיחות מצד לצד.</p>
        <p class="text-gray-700 mb-2">מבקשים מהם ללכת מהר, ואז ממש לאט במהירויות שונות.</p>
        <p class="text-gray-700">ללכת בהליכות שונות בחדר - הליכה צידית, משקל מרגל לרגל, עקב אחרי אגודל, קפיצת צפרדע, הליכת סרטן, הליכת ברווז - הליכה שפופה.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. שיר רקע - "מה נעים וקל"</h3>
        <p class="text-gray-700">לשמור על שיווי משקל לפי מילות השיר. בפזמון הולכים בצעדים קטנים קטנים ובתנועות גוף שמנסות לשמור על שיווי משקל.</p>
        <p class="text-gray-700 text-sm italic">להזכיר את נושא החודש ולשאול במה שיחקנו בשבוע שעבר.</p>
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
      
      <p class="text-gray-700 font-semibold mb-2">נעבוד עם כפות פלסטיק וכדור מרשרש.</p>
      <p class="text-gray-700 mb-3">כל אחד מקבל כף בתורו ושם אותה בין הרגליים/ברכיים.</p>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">1. איזון הכף - בישיבה על הרצפה</h3>
        <p class="text-gray-700">נתחיל באיזון הכף על אברי הגוף: על המצח, מתחת לאף, על כתף ימין ושמאל, על כף היד, על גב היד, על גב הרגל...</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">2. הכדור המרשרש</h3>
        <p class="text-gray-700 mb-2">נוציא כדור מהתיק, זה כדור מרשרש. נשים את הכדור בתוך הכף ונסביר שהכף משמשת כמיטה של הכדור ומדגימים להם:</p>
        <p class="text-gray-700">כשהכדור שוכב בתוך הכף הוא נח ולא משמיע קול, כשאנו מעירים אותו ומנערים אותו הוא מרשרש וכשנשכיב שוב, שוב הכדור נח ולא משמיע קול.</p>
      </div>

      <div>
        <h3 class="font-bold text-gray-800 mb-2">3. תרגילים עם הכדור והכף</h3>
        <ul class="space-y-2">
          <li class="text-gray-700">• הילדים מניחים את הכף על הרצפה בין הרגליים ואנו מגלגלים/מחלקים לכל ילד כדור אל תוך הכף</li>
          <li class="text-gray-700">• בספירה לשלוש כולם מרימים את הכדור מהכף ומנערים חזק (במשך כמה שניות) ושוב בספירה עד שלוש מחזירים את הכדור לנוח בתוך הכף</li>
          <li class="text-gray-700">• <span class="font-semibold">קרוב ורחוק מהגוף:</span> יישור וכיפוף של המרפק - הם מחזיקים את הכף ביד אחת כשהכדור מונח בתוכו ומנסים שהכדור לא יפול ולא ישמיע קול. להחליף ליד השנייה. המטרה היא שיווי משקל שנדע שקיים לפי השקט בחדר.</li>
          <li class="text-gray-700">• <span class="font-semibold">בהליכה:</span> להחזיק את הכף עם יד אחת כשהכדור מונח על הכף. להתקדם בלי להעיר את הכדור ושהכדור לא ייפול. בזמן שהולכים אפשר לשים ברקע את השיר "אנחנו הפילים" ולבקש מהם להרים את הרגליים גבוה בהליכה.</li>
          <li class="text-gray-700">• בלי שהכדור ייפול: נעמוד על רגל אחת ואז השנייה</li>
          <li class="text-gray-700">• להחליף/להעביר מיד ליד</li>
          <li class="text-gray-700">• להניח על הרצפה ולהרים</li>
          <li class="text-gray-700">• לעשות סיבוב</li>
          <li class="text-gray-700">• ללכת בעיניים עצומות</li>
          <li class="text-gray-700">• להתכופף ולעמוד על קצות האצבעות, ואז לעמוד על העקבים</li>
          <li class="text-gray-700">• לנסות להעביר את הכף כשהכדור מונח בתוכו מאחורי הגב (מסביב לגוף)</li>
          <li class="text-gray-700">• הבוגרים יכולים לנסות להחליף בניהם כף וכדור מבלי שהכדור ייפול, להדגיש שלא חייבים להצליח, אנחנו מנסים</li>
        </ul>
        <p class="text-gray-700 text-sm italic mt-3">💡 בין התרגילים כדאי לומר להם לתפוס את הכדור ביד ולרשרש חזק חזק!!</p>
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
      
      <p class="text-gray-700 mb-3">4 מסלולים שונים פרוסים במרחב:</p>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">מסלול 1</h3>
        <p class="text-gray-700">ארבעה ספוגים לרוחב – דורכים עם שתי כפות רגליים על הספוג</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">מסלול 2</h3>
        <p class="text-gray-700">שלושה ספוגים צמודים לאורך – הולכים על הספוגים (כמו קורה)</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">מסלול 3</h3>
        <p class="text-gray-700">שתי קורות עץ צמודות - הולכים במרכז הקורות על המדבקות הכתומות לאט ובזהירות</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">מסלול 4</h3>
        <p class="text-gray-700 mb-2">ארבעה ספוגים על הרצפה ובמרכזן/עליהם 2 קורות עץ.</p>
        <p class="text-gray-700 mb-2">ללכת לאט לאט בשיווי משקל כשהם הולכים במרכז הקורות על המדבקות הכתומות.</p>
        <p class="text-gray-700 text-sm">אנו עומדים ליד המסלול ונותנים להם יד. אפשר להתקדם בהליכה צידית (פיסוק וסגירה בהתקדמות).</p>
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

  <div class="bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 rounded-xl shadow-lg p-6 text-center">
    <h3 class="text-xl font-bold text-yellow-900 mb-2 flex items-center justify-center gap-2">
      <span>🎖️</span>
      חלוקת חותמת: זברה
    </h3>
    <p class="text-3xl">🦓</p>
  </div>

  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md py-4">
    <p class="text-xl font-bold">בהצלחה! 🎉</p>
  </div>

</div>
`
};

console.log('Starting batch 5 (FINAL): מערכים 8-9 + שיווי משקל 3...');

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
  }
}

console.log('✨✨✨ ALL 11 LESSONS COMPLETE! ✨✨✨');
process.exit(0);
