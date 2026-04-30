import { getAllLocations, getAllInstructors } from "@/lib/queries/schedule";
import { BulkImportLessons } from "@/components/schedule/bulk-import-lessons";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ImportLessonsPage() {
  const [locations, instructors] = await Promise.all([
    getAllLocations(),
    getAllInstructors(),
  ]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">
          ייבוא שיעורים
        </h2>
        <Link
          href="/schedule/weekly"
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted md:px-4 md:py-2 md:text-sm"
        >
          חזרה ללוח שבועי
        </Link>
      </div>
      <BulkImportLessons locations={locations} instructors={instructors} />
    </div>
  );
}
