import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Column C ("סוג גוף") from suppliers_master_zaharonim_FINAL.xlsx for the 18
// leads imported before org_type existed as a column.
const orgTypes = {
  "כפיר צהרונים / אמיתי לוי יזמות בע\"מ": "חברה פרטית",
  "בית לגדול בו בע\"מ": "חברה פרטית",
  "צהרונות עם המושבות בע\"מ": "חברה פרטית",
  "נבון פרויקטים בחינוך בע\"מ": "חברה פרטית",
  "המשכיל פרויקטים חינוכיים בע\"מ": "חברה פרטית",
  "מעלות - מפעלי חינוך וחברה": "עמותה/חברה בתחום החינוך",
  "פתחיה - מוסדות לחינוך מיוחד (ע\"ר)": "עמותה",
  "אליעד מרכז לפעילות חינוכית (ע\"ר)": "עמותה",
  "עמותת אלדקיאא אלאוואיל (ע\"ר)": "עמותה",
  "אקדמיית אלקאסמי (ע\"ר)": "עמותה/מוסד חינוכי",
  "אלאקדמיוו אלערב בע\"מ": "חברה פרטית",
  "אתגרים הדרכות בע\"מ / אפטר סקול": "חברה פרטית",
  "האומץ להיות - עמותה לחינוך בלתי פורמלי": "עמותה",
  "בת שבע הימלפרב": "עצמאית",
  "גילית נגר": "עצמאית",
  "נטלי עמדי": "עצמאית",
  "ויצו": "עמותה",
  "נופית": "חברה פרטית",
};

let updated = 0;
for (const [name, orgType] of Object.entries(orgTypes)) {
  const { data: existing } = await supabase.from("clients").select("id").eq("name", name).maybeSingle();
  if (!existing) {
    console.log(`⚠️  לא נמצא: ${name}`);
    continue;
  }
  const { error } = await supabase.from("clients").update({ org_type: orgType }).eq("id", existing.id);
  if (error) {
    console.error(`❌ שגיאה ב-${name}: ${error.message}`);
  } else {
    console.log(`✅ עודכן org_type: ${name} → ${orgType}`);
    updated++;
  }
}
console.log(`\nסיום: ${updated} עודכנו`);
