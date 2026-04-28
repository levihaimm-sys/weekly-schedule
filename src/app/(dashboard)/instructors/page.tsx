import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { InstructorManager } from "@/components/instructors/instructor-manager";

export default async function InstructorsPage() {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const [{ data: instructors }, { data: profiles }, { data: authData }] = await Promise.all([
    supabase
      .from("instructors")
      .select("id, full_name, phone, email, status, address, work_cities, rotation_order, employment_type, clients, id_photo_url, contract_url, monthly_report_link, whatsapp_added")
      .order("full_name"),
    supabase
      .from("profiles")
      .select("id, instructor_id")
      .not("instructor_id", "is", null),
    supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  // Build map: instructor_id → last_sign_in_at
  const lastLoginMap: Record<string, string | null> = {};
  if (profiles && authData?.users) {
    const authUserMap = new Map(authData.users.map((u) => [u.id, u.last_sign_in_at ?? null]));
    for (const profile of profiles) {
      if (profile.instructor_id) {
        lastLoginMap[profile.instructor_id] = authUserMap.get(profile.id) ?? null;
      }
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">מדריכים</h2>
      <InstructorManager instructors={instructors ?? []} lastLoginMap={lastLoginMap} />
    </div>
  );
}
