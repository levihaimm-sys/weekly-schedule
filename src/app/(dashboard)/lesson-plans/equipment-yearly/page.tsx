import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getYearlyEquipmentDistribution } from "@/lib/queries/lesson-plans";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EquipmentYearlyPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/today");
  }

  const distributions = await getYearlyEquipmentDistribution();

  const formatDate = (dateStr: string | null) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("he-IL", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "-";

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Link
        href="/lesson-plans/assignments"
        className="flex items-center gap-1 text-sm text-orange-600 hover:underline w-fit mb-4"
      >
        <ArrowRight size={14} />
        חזרה להקצאות שבועיות
      </Link>

      <div className="mb-6">
        <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">
          חלוקת ציוד - שנתי
        </h2>
        <p className="text-muted-foreground mt-1">
          כל חלוקות הציוד שבוצעו מתחילת שנת הלימודים ועד היום ({distributions.length} סה&quot;כ)
        </p>
      </div>

      {distributions.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          אין חלוקות ציוד רשומות
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="p-3 text-right font-medium">תאריך חלוקה</th>
                <th className="p-3 text-right font-medium">שבוע</th>
                <th className="p-3 text-right font-medium">מדריך/ה</th>
                <th className="p-3 text-right font-medium">מסלול</th>
                <th className="p-3 text-right font-medium">מערך</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {distributions.map((d) => (
                <tr key={d.id} className="text-sm hover:bg-muted/50">
                  <td className="p-3 whitespace-nowrap">{formatDate(d.distributedAt)}</td>
                  <td className="p-3 whitespace-nowrap text-muted-foreground">{formatDate(d.weekStartDate)}</td>
                  <td className="p-3 font-medium">{d.instructorName}</td>
                  <td className="p-3 text-muted-foreground">{d.route || "-"}</td>
                  <td className="p-3">
                    {d.lessonPlanName ? `${d.lessonPlanName} (${d.lessonPlanCategory})` : "ללא מערך"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
