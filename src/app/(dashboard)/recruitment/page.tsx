import { createClient } from "@/lib/supabase/server";
import { RecruitmentManager } from "@/components/recruitment/recruitment-manager";

export default async function RecruitmentPage() {
  const supabase = await createClient();

  const { data: candidates } = await supabase
    .from("recruitment_candidates")
    .select("id, first_name, last_name, email, phone, area, inquiry_date, status, is_archived, cv_url, converted_instructor_id, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">גיוס</h2>
      <RecruitmentManager candidates={candidates ?? []} />
    </div>
  );
}
