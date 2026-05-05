import { getAllInstructors } from "@/lib/queries/schedule";
import { FileText, Building2, BarChart3, Users } from "lucide-react";
import { ReportForm } from "@/components/reports/report-form";
import { ClientReportForm } from "@/components/reports/client-report-form";
import { MonthlySummaryForm } from "@/components/reports/monthly-summary-form";
import { InstructorSummaryForm } from "@/components/reports/instructor-summary-form";

export default async function ReportsPage() {
  const instructors = await getAllInstructors();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">דוחות חודשיים</h2>

      <div className="rounded-xl border border-border bg-background p-6">
        <div className="mb-4 flex items-center gap-3">
          <Building2 className="text-violet-500" size={24} />
          <h3 className="text-lg font-semibold">דוח לקוח</h3>
        </div>
        <ClientReportForm />
      </div>

      <div className="rounded-xl border border-border bg-background p-6">
        <div className="mb-4 flex items-center gap-3">
          <FileText className="text-orange-500" size={24} />
          <h3 className="text-lg font-semibold">דוח מדריך</h3>
        </div>
        <ReportForm instructors={instructors} />
      </div>

      <div className="rounded-xl border border-border bg-background p-6">
        <div className="mb-4 flex items-center gap-3">
          <BarChart3 className="text-emerald-500" size={24} />
          <h3 className="text-lg font-semibold">סיכום חודשי לפי לקוח</h3>
        </div>
        <MonthlySummaryForm />
      </div>

      <div className="rounded-xl border border-border bg-background p-6">
        <div className="mb-4 flex items-center gap-3">
          <Users className="text-blue-500" size={24} />
          <h3 className="text-lg font-semibold">סיכום חודשי לפי מדריך</h3>
        </div>
        <InstructorSummaryForm />
      </div>
    </div>
  );
}
