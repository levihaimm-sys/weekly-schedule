import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BookOpen, Package, Upload, ArrowRight } from "lucide-react";
import { getLessonPlansByCategory } from "@/lib/queries/lesson-plans";

export const dynamic = "force-dynamic";

export default async function ManageLessonPlansPage() {
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

  // Get all lesson plans grouped by category
  const lessonPlansByCategory = await getLessonPlansByCategory();

  // Count equipment for each lesson plan
  const lessonPlansWithEquipment = await Promise.all(
    Object.entries(lessonPlansByCategory).map(async ([category, plans]) => {
      const plansWithCounts = await Promise.all(
        plans.map(async (plan) => {
          const { count } = await supabase
            .from("lesson_plan_equipment")
            .select("*", { count: "exact", head: true })
            .eq("lesson_plan_id", plan.id);

          return {
            ...plan,
            equipmentCount: count || 0,
          };
        })
      );
      return [category, plansWithCounts] as const;
    })
  );

  const lessonPlansData = Object.fromEntries(lessonPlansWithEquipment);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Link href="/lesson-plans" className="flex items-center gap-1 text-sm text-orange-600 hover:underline w-fit mb-4">
        <ArrowRight size={14} />
        חזרה לציוד
      </Link>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917] mb-2">ניהול מערכי שיעור</h2>
        <p className="text-gray-600">
          עריכת מערכי שיעור, הוספת ציוד ועדכון קבצי PDF
        </p>
      </div>

      {/* Lesson Plans by Category */}
      <div className="space-y-8">
        {Object.entries(lessonPlansData).map(([category, plans]) => (
          <div key={category}>
            {/* Category Header */}
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {category}
              </h2>
              <p className="text-sm text-gray-500">{plans.length} מערכים</p>
            </div>

            {/* Lesson Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan: any) => (
                <div
                  key={plan.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <BookOpen className="w-4 h-4 text-purple-600" />
                          <span className="text-xs font-medium text-purple-700">
                            שבוע {plan.week_number}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900">
                          {plan.name}
                        </h3>
                      </div>
                      {/* TODO: Add edit functionality */}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    {/* Equipment Count */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Package className="w-4 h-4" />
                        <span>פריטי ציוד</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {plan.equipmentCount}
                      </span>
                    </div>

                    {/* PDF Status */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Upload className="w-4 h-4" />
                        <span>קובץ PDF</span>
                      </div>
                      {plan.pdf_path ? (
                        <span className="text-green-600 font-medium">
                          קיים ✓
                        </span>
                      ) : (
                        <span className="text-gray-400 font-medium">
                          אין
                        </span>
                      )}
                    </div>

                    {/* Notes */}
                    {plan.notes && (
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-200">
                        {plan.notes}
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                    <Link
                      href={`/lesson-plans/manage/${plan.id}`}
                      className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      ערוך מערך
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {Object.keys(lessonPlansData).length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            אין מערכי שיעור
          </h3>
          <p className="text-gray-600 mb-4">
            ייבא נתונים מקבצי ה-CSV כדי להתחיל
          </p>
          <code className="text-sm bg-gray-200 px-3 py-1 rounded">
            npm run import:lesson-plans
          </code>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="font-semibold text-purple-900 mb-3">
          🎯 ניהול מערכי שיעור
        </h3>
        <ul className="space-y-2 text-sm text-purple-800">
          <li>
            <strong>עריכת מערך:</strong> לחץ על כפתור העריכה כדי לשנות את שם
            המערך, להוסיף הערות או לעדכן פרטים.
          </li>
          <li>
            <strong>ניהול ציוד:</strong> לחץ על "צפה בפרטי ציוד" כדי לראות,
            להוסיף או לערוך את הציוד הנדרש למערך.
          </li>
          <li>
            <strong>העלאת PDF:</strong> העלה קובץ PDF של מערך השיעור כדי
            שהמדריכים יוכלו להוריד אותו.
          </li>
          <li>
            <strong>קטגוריות:</strong> המערכים מסודרים לפי נושאים (פתיחת שנה,
            מיומנות יסוד, וכו').
          </li>
        </ul>
      </div>
    </div>
  );
}
