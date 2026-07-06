import { createAdminClient } from "@/lib/supabase/admin";
import { RecruitmentManager } from "@/components/recruitment/recruitment-manager";

export default async function RecruitmentPage() {
  const supabase = createAdminClient();

  const [{ data: candidates }, { data: activities }] = await Promise.all([
    supabase
      .from("recruitment_candidates")
      .select("id, first_name, last_name, email, phone, area, inquiry_date, status, is_archived, cv_url, converted_instructor_id, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("recruitment_activities")
      .select("candidate_id, note, created_at")
      .order("created_at", { ascending: false }),
  ]);

  // Latest activity note per candidate
  const lastActivityMap: Record<string, string> = {};
  for (const a of activities ?? []) {
    if (!lastActivityMap[a.candidate_id]) {
      lastActivityMap[a.candidate_id] = a.note;
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">גיוס</h2>
      <RecruitmentManager candidates={candidates ?? []} lastActivityMap={lastActivityMap} />
    </div>
  );
}
