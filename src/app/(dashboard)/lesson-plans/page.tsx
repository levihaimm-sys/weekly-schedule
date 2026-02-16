import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BookOpen, Package, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LessonPlansPage() {
  const supabase = await createClient();

  // Check if user is admin
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

  // Get statistics
  const { count: totalLessonPlans } = await supabase
    .from("lesson_plans")
    .select("*", { count: "exact", head: true });

  const { count: totalEquipment } = await supabase
    .from("equipment")
    .select("*", { count: "exact", head: true });

  // Get current week's assignments count
  const now = new Date();
  const dayOfWeek = now.getDay();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - dayOfWeek);
  sunday.setHours(0, 0, 0, 0);
  const weekStartDate = sunday.toISOString().split("T")[0];

  const { data: currentWeekAssignmentsData, count: currentWeekAssignments } = await supabase
    .from("weekly_lesson_assignments")
    .select("id", { count: "exact" })
    .eq("week_start_date", weekStartDate);

  // Get unconfirmed equipment count for current week
  const assignmentIds = currentWeekAssignmentsData?.map((a) => a.id) || [];
  
  const { count: unconfirmedCount } = await supabase
    .from("equipment_confirmations")
    .select("*", { count: "exact", head: true })
    .eq("is_confirmed", false)
    .in("assignment_id", assignmentIds.length > 0 ? assignmentIds : [""]);

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">ניהול מערכי שיעור</h1>
        <p className="text-gray-600">
          ניהול מערכי שיעור, ציוד והקצאות שבועיות למדריכים
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">מערכי שיעור</h3>
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {totalLessonPlans || 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">מערכים בסך הכל</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">פריטי ציוד</h3>
            <Package className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {totalEquipment || 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">סוגי ציוד שונים</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              הקצאות השבוע
            </h3>
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {currentWeekAssignments || 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">מדריכים פעילים השבוע</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              ממתינים לאישור
            </h3>
            <Package className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {unconfirmedCount || 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">פריטי ציוד לא אושרו</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/lesson-plans/assignments"
          className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">הקצאות שבועיות</h3>
              <p className="text-sm text-gray-600">
                ניהול והקצאת מערכי שיעור למדריכים לפי שבועות
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/lesson-plans/confirmations-review"
          className="bg-white border border-gray-200 rounded-lg p-6 hover:border-orange-300 hover:shadow-md transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">דיווח קבלת ציוד</h3>
              <p className="text-sm text-gray-600">
                מעקב אחר אישורי קבלת ציוד של כל המדריכות
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/lesson-plans/equipment-report"
          className="bg-white border border-gray-200 rounded-lg p-6 hover:border-green-300 hover:shadow-md transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">דו"ח ציוד חסר</h3>
              <p className="text-sm text-gray-600">
                מעקב אחר ציוד חסר וזיהוי מדריכים שאיבדו ציוד
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/lesson-plans/manage"
          className="bg-white border border-gray-200 rounded-lg p-6 hover:border-purple-300 hover:shadow-md transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">ניהול מערכים</h3>
              <p className="text-sm text-gray-600">
                עריכת מערכי שיעור, הוספת ציוד ועדכון קבצי PDF
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">
          📚 מדריך מהיר למנהלים
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>
            <strong>הקצאות שבועיות:</strong> הקצה מערכי שיעור למדריכים לפי
            שבועות. המערכים "עוברים" ממדריך למדריך כל שבוע.
          </li>
          <li>
            <strong>דו"ח ציוד:</strong> עקוב אחר ציוד שאבד. המערכת משווה בין
            הכמות שמדריך קיבל לכמות שהמדריך הבא קיבל.
          </li>
          <li>
            <strong>ניהול מערכים:</strong> ערוך מערכי שיעור, הוסף ציוד והעלה
            קבצי PDF.
          </li>
          <li>
            <strong>שינויים קבועים:</strong> כאשר משנים הקצאה, ניתן לסמן
            "שינוי קבוע" שמשפיע על כל השרשרת של המדריכים.
          </li>
        </ul>
      </div>
    </div>
  );
}
