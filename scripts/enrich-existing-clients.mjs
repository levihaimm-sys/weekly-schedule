import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Fills in the research data for the 3 already-existing clients that also appear
// in suppliers_master_zaharonim_FINAL.xlsx (they were skipped during the lead
// import so we wouldn't clobber a signed client, but ended up with no info at all).
const updates = [
  {
    name: "טומשין",
    legal_name: "רשת תיכוני תומשין שירותים חינוכיים בע\"מ (חל\"צ)",
    org_type: "חל\"צ",
    category: "מפעיל רב-רשותי",
    region: "גבעתיים, פתח תקווה, ראש העין",
    phone: "03-9689119",
    email: "zaharon@tomashin.co.il",
    website: "https://www.tomashin-kids.co.il",
    notes: "מפעיל צהרוני גנים במספר רשויות.",
  },
  {
    name: "ינוקא",
    legal_name: "ינוקא שירותים חינוכיים בע\"מ",
    org_type: "חברה פרטית",
    category: "מפעיל רב-רשותי",
    region: "נס ציונה ועוד",
    phone: "08-9364427",
    email: "info@yanuka.co.il",
    website: "https://yanuka.co.il",
    notes: "רשת צהרונים ומסגרות חינוך. פעילות מוכחת בגני נס ציונה.",
  },
  {
    name: "אופק",
    legal_name: "אופק",
    org_type: "חברה פרטית/רשת",
    category: "מפעיל רב-רשותי",
    region: "ראש העין ועוד",
    phone: "03-6120201 / 08-6603099",
    email: "office@ofek4kids.co.il",
    website: null,
    notes: "מפעילת צהרונים מוכרת. פרטי קשר כפי שנאספו קודם, דורשים אימות עדכני.",
  },
];

for (const u of updates) {
  const { name, phone, email, ...fields } = u;
  const { data: existing } = await supabase.from("clients").select("id").eq("name", name).maybeSingle();

  if (!existing) {
    console.log(`⚠️  לא נמצא לקוח בשם: ${name}`);
    continue;
  }

  const { error } = await supabase
    .from("clients")
    .update({ ...fields, primary_contact_phone: phone, primary_contact_email: email })
    .eq("id", existing.id);

  if (error) {
    console.error(`❌ שגיאה בעדכון ${name}: ${error.message}`);
  } else {
    console.log(`✅ עודכן: ${name}`);
  }
}
