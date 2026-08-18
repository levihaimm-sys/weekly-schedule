import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log("Checking clients table columns...");
const { data: clients, error: clientsError } = await supabase
  .from("clients")
  .select("id, name, legal_name, org_type, category, region, primary_contact_phone, primary_contact_email, website, notes, priority, status, is_archived")
  .order("name");

if (clientsError) {
  console.error("❌ clients query failed:", clientsError.message);
  process.exit(1);
}

console.log(`✅ clients table OK — ${clients.length} rows`);
for (const c of clients) {
  console.log(`   - ${c.name} | status=${c.status} | org_type=${c.org_type ?? "—"} | category=${c.category ?? "—"} | phone=${c.primary_contact_phone ?? "—"} | email=${c.primary_contact_email ?? "—"}`);
}

console.log("\nChecking client_activities table...");
const { data: activities, error: actError } = await supabase
  .from("client_activities")
  .select("id")
  .limit(1);

if (actError) {
  console.error("❌ client_activities query failed:", actError.message);
  process.exit(1);
}
console.log(`✅ client_activities table OK — ${activities.length} row(s) sampled`);

// Try inserting and deleting a test activity to confirm INSERT works (via service role)
const testClientId = clients[0]?.id;
if (testClientId) {
  const { data: inserted, error: insertError } = await supabase
    .from("client_activities")
    .insert({ client_id: testClientId, note: "__verification_test__" })
    .select("id")
    .single();

  if (insertError) {
    console.error("❌ test insert into client_activities failed:", insertError.message);
  } else {
    console.log("✅ test insert into client_activities OK");
    await supabase.from("client_activities").delete().eq("id", inserted.id);
    console.log("✅ test row cleaned up");
  }
}
