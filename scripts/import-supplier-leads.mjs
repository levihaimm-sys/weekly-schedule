import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Source: suppliers_master_zaharonim_FINAL.xlsx, sheet "ספקים - מאסטר" (22 rows).
// Rows matching existing active clients (טומשין, ינוקא, אופק) were left out.
// Two rows carried an "★" note: they were already flagged as known to us
// (column "איש קשר" = "מוכר") even though not yet signed clients.
const leads = [
  { name: "כפיר צהרונים / אמיתי לוי יזמות בע\"מ", category: "מפעיל רב-רשותי", region: "ראש העין, באר טוביה, רעננה", phone: "052-306-0857", email: "officekfirz@gmail.com", website: "https://kfir-p.co.il", notes: "מעל 20 שנות ניסיון. מפעילה צהרונים וקייטנות בגנים ובבתי ספר.", priority: "high" },
  { name: "בית לגדול בו בע\"מ", category: "מפעיל רב-רשותי", region: "צור הדסה (מועצה מקומית)", phone: "077-9520570", email: "baitligdolbo@gmail.com", website: "https://www.bait.org.il", notes: "צהרוני גנים וקייטנות. בגזר פעילות עדכנית תשפ\"ו-תשפ\"ז.", priority: "high" },
  { name: "צהרונות עם המושבות בע\"מ", category: "מפעיל רב-רשותי", region: "פתח תקווה, קריית אונו ועוד", phone: "03-9238877", email: "tzemhamoshavot@gmail.com", website: "https://tzem.co.il", notes: "רשת פעילה משנת 2001. צהרונים וקייטנות.", priority: "high" },
  { name: "נבון פרויקטים בחינוך בע\"מ", category: "מפעיל רב-רשותי", region: "יבנה (עירייה)", phone: "08-6694007", email: "office@navon-p.co.il", website: "https://navon-p.co.il", notes: "צהרוני ניצנים וקייטנות. מופיעה כזוכה/מפעילה במספר רשויות.", priority: "high" },
  { name: "המשכיל פרויקטים חינוכיים בע\"מ", category: "מפעיל רב-רשותי", region: "רשויות שונות במרכז, כולל מזכרת בתיה בעבר", phone: "1-700-70-65-60", email: "info@hamaskil.com", website: "https://www.hamaskil.com", notes: "רשת צהרונים וקייטנות בגנים ובבתי ספר.", priority: "high" },
  { name: "מעלות - מפעלי חינוך וחברה", category: "מפעיל צהרונים", region: "נס ציונה", phone: "08-9450257", email: "info@mlt.co.il", website: "https://mlt.co.il", notes: "מופיעה כזוכה במכרז צהרוני גני ילדים בנס ציונה 2025.", priority: "medium" },
  { name: "פתחיה - מוסדות לחינוך מיוחד (ע\"ר)", category: "מפעיל צהרונים", region: "אשדוד (עירייה)", phone: "02-6268888", email: null, website: null, notes: "מטרות העמותה כוללות הפעלת צהרונים בחינוך המיוחד, המשולב והרגיל. זכתה באשדוד לפי תוצר יפעת.", priority: "medium" },
  { name: "אליעד מרכז לפעילות חינוכית (ע\"ר)", category: "ספק/זוכה במכרז", region: "נס ציונה", phone: null, email: null, website: null, notes: "הופיע בין 10 הזוכות במכרז צהרוני גנים 2025 בנס ציונה. צריך אימות פרטי קשר.", priority: "medium" },
  { name: "עמותת אלדקיאא אלאוואיל (ע\"ר)", category: "מפעיל צהרונים", region: "טירה (עירייה), נצרת (עירייה)", phone: "052-6430516", email: null, website: null, notes: "130 עובדים לפי מקור ציבורי. הופיעה כזוכה במכרזים בתוצר יפעת.", priority: "medium" },
  { name: "אקדמיית אלקאסמי (ע\"ר)", category: "מפעיל צהרונים", region: "זמר (מועצה מקומית), כפר כנא (מועצה מקומית), נווה מדבר (מועצה אזורית)", phone: "04-6286604", email: null, website: null, notes: "מופיעה במספר מכרזים כמפעילת צהרונים בתוצר יפעת.", priority: "medium" },
  { name: "אלאקדמיוו אלערב בע\"מ", category: "מפעיל רב-רשותי", region: "מעליא (מועצה מקומית), שגב שלום (מועצה מקומית)", phone: "04-9081835", email: null, website: null, notes: "חברה פעילה. מופיעה כזוכה במספר מכרזים בתוצר יפעת.", priority: "high" },
  { name: "אתגרים הדרכות בע\"מ / אפטר סקול", category: "מפעיל רב-רשותי", region: "בת ים, גבעתיים, הוד השרון, הרצליה, חולון, כפר סבא, נתניה, עומר, פתח תקווה, ראשון לציון, רחובות, רמת גן, רמת השרון (עירייה), רעננה, שוהם, תל אביב-יפו", phone: "1-700-501-100", email: null, website: "https://www.etgarim2000.co.il", notes: "★ ליד מוכר לנו מבעבר. רשת אפטר סקול. מפעילה צהרונים בגנים ובבתי ספר.", priority: "high" },
  { name: "האומץ להיות - עמותה לחינוך בלתי פורמלי", category: "מפעיל רב-רשותי", region: "גבעתיים, הר אדר (מועצה אזורית), מבשרת ציון, נס ציונה (עירייה), שערי תקווה", phone: "03-5530522", email: "office@omets.org", website: "https://www.omets.org", notes: "★ ליד מוכר לנו מבעבר. מפעילה צהרונים בגנים במספר רשויות.", priority: "high" },
  { name: "בת שבע הימלפרב", category: "מפעיל מקומי", region: "גבעתיים", phone: "052-3317623", email: "bat1491966@gmail.com", website: null, notes: "מפעילה צהרוני גנים בגבעתיים. ליד טוב, אך לא ספק רב-רשותי מוכח.", priority: "medium" },
  { name: "גילית נגר", category: "מפעיל מקומי/אזורי", region: "מטה יהודה - ייצוב טל שחר", phone: null, email: null, website: null, notes: "זוכה בתוצר יפעת להפעלת צהרון ביישוב טל שחר.", priority: "medium" },
  { name: "נטלי עמדי", category: "מפעיל מקומי/אזורי", region: "מטה יהודה - כלל הישובים", phone: null, email: null, website: null, notes: "זוכה בתוצר יפעת להפעלת צהרוני הילדים בישובי המועצה.", priority: "medium" },
  { name: "ויצו", category: "מפעיל ארצי/רב-רשותי", region: "חיפה, מודיעין מכבים רעות, נתניה", phone: null, email: null, website: null, notes: "הופיע בתוצרי המיפוי הקודמים. נדרש אימות היקף הפעילות בגני ילדים.", priority: "low" },
  { name: "נופית", category: "מפעיל אזורי", region: "בת ים, רחובות, רמת גן", phone: null, email: null, website: null, notes: "הופיע בתוצרי המיפוי הקודמים. נדרש אימות היקף הפעילות בגני ילדים.", priority: "low" },
];

let inserted = 0;
let skipped = 0;

for (const lead of leads) {
  const { data: existingByName } = await supabase
    .from("clients")
    .select("id")
    .ilike("name", lead.name)
    .maybeSingle();

  if (existingByName) {
    console.log(`⏭️  קיים כבר (שם): ${lead.name}`);
    skipped++;
    continue;
  }

  if (lead.phone) {
    const { data: existingByPhone } = await supabase
      .from("clients")
      .select("id")
      .eq("primary_contact_phone", lead.phone)
      .maybeSingle();

    if (existingByPhone) {
      console.log(`⏭️  קיים כבר (טלפון): ${lead.name} ${lead.phone}`);
      skipped++;
      continue;
    }
  }

  const { error } = await supabase.from("clients").insert({
    name: lead.name,
    category: lead.category,
    region: lead.region,
    primary_contact_phone: lead.phone,
    primary_contact_email: lead.email,
    website: lead.website,
    notes: lead.notes,
    priority: lead.priority,
    status: "lead_new",
  });

  if (error) {
    console.error(`❌ שגיאה: ${lead.name} — ${error.message}`);
  } else {
    console.log(`✅ נוסף: ${lead.name}`);
    inserted++;
  }
}

console.log(`\nסיום: ${inserted} נוספו, ${skipped} דולגו (כבר קיימים)`);
