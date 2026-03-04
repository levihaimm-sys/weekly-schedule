import { getAllInstructors, getAllLocations } from "@/lib/queries/schedule";
import { FileText, MapPin } from "lucide-react";
import { ReportForm } from "@/components/reports/report-form";
import { LocationReportForm } from "@/components/reports/location-report-form";

export default async function ReportsPage() {
  const [instructors, locations] = await Promise.all([
    getAllInstructors(),
    getAllLocations(),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">דוחות חודשיים</h2>

      <div className="rounded-xl border border-border bg-background p-6">
        <div className="mb-4 flex items-center gap-3">
          <FileText className="text-orange-500" size={24} />
          <h3 className="text-lg font-semibold">דוח מדריך</h3>
        </div>
        <ReportForm instructors={instructors} />
      </div>

      <div className="rounded-xl border border-border bg-background p-6">
        <div className="mb-4 flex items-center gap-3">
          <MapPin className="text-blue-500" size={24} />
          <h3 className="text-lg font-semibold">דוח לקוח (גן)</h3>
        </div>
        <LocationReportForm locations={locations} />
      </div>
    </div>
  );
}
