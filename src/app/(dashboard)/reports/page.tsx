import { getAllInstructors } from "@/lib/queries/schedule";
import { FileText } from "lucide-react";
import { ReportForm } from "@/components/reports/report-form";

export default async function ReportsPage() {
  const instructors = await getAllInstructors();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">דוחות חודשיים</h2>

      <div className="rounded-xl border border-border bg-background p-6">
        <div className="mb-4 flex items-center gap-3">
          <FileText className="text-orange-500" size={24} />
          <h3 className="text-lg font-semibold">יצירת דוח חדש</h3>
        </div>

        <ReportForm instructors={instructors} />
      </div>
    </div>
  );
}
