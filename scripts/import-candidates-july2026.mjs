import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://gkkylaztfhasasndnfbg.supabase.co";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdra3lsYXp0Zmhhc2FzbmRuZmJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDMxMTY5MSwiZXhwIjoyMDg1ODg3NjkxfQ.Le79eV54fqEIQSdt1RHnXh4N8GO5D2hYEoCSwtmesrY";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const candidates = [
  { first_name: "נועה",    last_name: "דלומי",          phone: "058-3240107", area: "חולון",          inquiry_date: "2026-07-05" },
  { first_name: "שי",      last_name: "מנשה לוי",       phone: "050-2410049", area: "רחובות",         inquiry_date: "2026-07-05" },
  { first_name: "ריבי",    last_name: "לוי",             phone: "054-3004220", area: "בת ים",          inquiry_date: "2026-07-05" },
  { first_name: "מור",     last_name: "קייקוב",          phone: "052-6790898", area: "יבנה",           inquiry_date: "2026-07-05" },
  { first_name: "ישראל",   last_name: "אברהם שפיגעל",   phone: "053-3186451", area: "בני ברק",        inquiry_date: "2026-07-05" },
  { first_name: "שירה",    last_name: "פור",             phone: "054-8473474", area: "ראש העין",       inquiry_date: "2026-07-05" },
  { first_name: "סיון",    last_name: "סגל",             phone: "054-4967397", area: "ראשון לציון",    inquiry_date: "2026-07-05" },
  { first_name: "יגאל",    last_name: "צ'רניאבסקי",     phone: "052-7331374", area: "רמת גן",         inquiry_date: "2026-07-05" },
  { first_name: "תמוז",    last_name: "חרותי",           phone: "050-8464670", area: "תל אביב - יפו",  inquiry_date: "2026-07-05" },
  { first_name: "נועה",    last_name: "פרידמן",          phone: "050-3010725", area: "תל אביב - יפו",  inquiry_date: "2026-07-05" },
  { first_name: "שרון",    last_name: "דקל נחשוני",      phone: "052-5529977", area: "רחובות",         inquiry_date: "2026-07-05" },
  { first_name: "דנה",     last_name: "מכטיי",           phone: "052-4894417", area: "הרצליה",         inquiry_date: "2026-07-05" },
  { first_name: "דורי",    last_name: "דהן",             phone: "052-6356708", area: "תל אביב - יפו",  inquiry_date: "2026-07-05" },
  { first_name: "איריס",   last_name: "ביבי",            phone: "052-5494024", area: "תל אביב - יפו",  inquiry_date: "2026-07-05" },
  { first_name: "קרן",     last_name: "היימן",           phone: "052-8400076", area: "רמת גן",         inquiry_date: "2026-07-05" },
  { first_name: "משה",     last_name: "חתוכה",           phone: "052-6109876", area: "בת ים",          inquiry_date: "2026-07-06" },
];

let added = 0;
let skipped = 0;

for (const c of candidates) {
  // Check for duplicate by phone
  const { data: existing } = await supabase
    .from("recruitment_candidates")
    .select("id")
    .eq("phone", c.phone)
    .maybeSingle();

  if (existing) {
    console.log(`⏭️  כפול (טלפון קיים): ${c.first_name} ${c.last_name} ${c.phone}`);
    skipped++;
    continue;
  }

  const { error } = await supabase.from("recruitment_candidates").insert({
    first_name: c.first_name,
    last_name: c.last_name,
    phone: c.phone,
    area: c.area,
    inquiry_date: c.inquiry_date,
    status: "pending",
  });

  if (error) {
    console.error(`❌ שגיאה: ${c.first_name} ${c.last_name} — ${error.message}`);
  } else {
    console.log(`✅ נוסף: ${c.first_name} ${c.last_name} | ${c.phone} | ${c.area}`);
    added++;
  }
}

console.log(`\nסיום: ${added} נוספו, ${skipped} כפולים דולגו`);
