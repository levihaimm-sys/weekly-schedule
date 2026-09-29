import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { InstructorManager } from "@/components/instructors/instructor-manager";
import { CITY_TO_CLIENT } from "@/lib/utils/constants";

export default async function InstructorsPage() {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const [{ data: instructors }, { data: profiles }, { data: authData }, { data: recurringRows }] =
    await Promise.all([
      supabase
        .from("instructors")
        .select(
          "id, full_name, phone, email, status, address, work_cities, rotation_order, employment_type, classifications, note, has_equipment, clients, id_photo_url, contract_url, monthly_report_link, whatsapp_added"
        )
        .order("full_name"),
      supabase
        .from("profiles")
        .select("id, instructor_id")
        .not("instructor_id", "is", null),
      supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
      supabase
        .from("recurring_schedule")
        .select("instructor_id, client_name, location:locations!recurring_schedule_location_id_fkey(city)"),
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

  // Build map: instructor_id → distinct client names, derived from the fixed
  // (recurring) schedule instead of manual entry.
  const scheduleClientsMap: Record<string, string[]> = {};
  if (recurringRows) {
    const setsByInstructor = new Map<string, Set<string>>();
    for (const row of recurringRows as any[]) {
      if (!row.instructor_id) continue;
      const city = row.location?.city as string | undefined;
      const client = row.client_name || (city ? CITY_TO_CLIENT[city] : undefined);
      if (!client) continue;
      if (!setsByInstructor.has(row.instructor_id)) {
        setsByInstructor.set(row.instructor_id, new Set());
      }
      setsByInstructor.get(row.instructor_id)!.add(client);
    }
    for (const [instructorId, clientSet] of setsByInstructor) {
      scheduleClientsMap[instructorId] = Array.from(clientSet).sort((a, b) => a.localeCompare(b, "he"));
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">מדריכים</h2>
      <InstructorManager
        instructors={instructors ?? []}
        lastLoginMap={lastLoginMap}
        scheduleClientsMap={scheduleClientsMap}
      />
    </div>
  );
}
