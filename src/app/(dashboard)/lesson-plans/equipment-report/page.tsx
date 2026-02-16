import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AlertTriangle, CheckCircle, Package } from "lucide-react";
import { getMissingEquipmentReport } from "@/lib/queries/lesson-plans";

export const dynamic = "force-dynamic";

export default async function EquipmentReportPage() {
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

  // Get missing equipment report (all weeks)
  const missingEquipment = await getMissingEquipmentReport();

  // Group by instructor
  const byInstructor = missingEquipment.reduce(
    (acc, item) => {
      if (!acc[item.instructor_name]) {
        acc[item.instructor_name] = [];
      }
      acc[item.instructor_name].push(item);
      return acc;
    },
    {} as Record<string, typeof missingEquipment>
  );

  // Calculate totals by instructor
  const instructorSummary = Object.entries(byInstructor).map(
    ([name, items]) => {
      const totalMissing = items.reduce(
        (sum, item) => sum + Math.abs(item.difference),
        0
      );
      const incidents = items.length;
      return { name, totalMissing, incidents, items };
    }
  );

  // Sort by total missing (highest first)
  instructorSummary.sort((a, b) => b.totalMissing - a.totalMissing);

  const totalIncidents = missingEquipment.length;
  const totalItemsMissing = missingEquipment.reduce(
    (sum, item) => sum + Math.abs(item.difference),
    0
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">דו"ח ציוד חסר</h1>
        <p className="text-gray-600">
          מעקב אחר ציוד שאבד - השוואה בין כמות שהתקבלה לכמות שהועברה למדריך
          הבא
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              סה"כ אירועים
            </h3>
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {totalIncidents}
          </div>
          <p className="text-xs text-gray-500 mt-1">פריטי ציוד חסרים</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              יחידות חסרות
            </h3>
            <Package className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {totalItemsMissing}
          </div>
          <p className="text-xs text-gray-500 mt-1">יחידות בסך הכל</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              מדריכים מעורבים
            </h3>
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {instructorSummary.length}
          </div>
          <p className="text-xs text-gray-500 mt-1">מדריכים עם ציוד חסר</p>
        </div>
      </div>

      {/* No Issues */}
      {totalIncidents === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-900 mb-2">
            אין ציוד חסר! 🎉
          </h3>
          <p className="text-green-700">
            כל הציוד מאושר ואין הפרשים בין המדריכים
          </p>
        </div>
      )}

      {/* Reports by Instructor */}
      {totalIncidents > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">דו"חות לפי מדריך</h2>

          {instructorSummary.map(({ name, totalMissing, incidents, items }) => (
            <div
              key={name}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Instructor Header */}
              <div className="bg-gray-50 border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {incidents} אירועים • {totalMissing} יחידות חסרות בסך הכל
                    </p>
                  </div>
                  <div className="text-left">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      <AlertTriangle className="w-4 h-4 ml-1" />
                      חסר ציוד
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        תאריך
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        מערך שיעור
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        ציוד
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        צפוי
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        התקבל
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        חסר
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {new Date(item.week_start_date).toLocaleDateString(
                            "he-IL"
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.lesson_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            {item.equipment_name}
                            {item.is_extra && (
                              <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded">
                                נוסף
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {item.expected}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {item.received}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              item.difference > 0
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {item.difference > 0 ? "-" : "+"}
                            {Math.abs(item.difference)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">
          📊 איך הדו"ח עובד?
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>
            <strong>השוואה אוטומטית:</strong> המערכת משווה את הכמות שכל מדריך
            אישר שקיבל לכמות שהמדריך הבא (באותו מערך שיעור) אישר.
          </li>
          <li>
            <strong>זיהוי אובדן:</strong> אם מדריך קיבל 37 כדורים והמדריך הבא
            קיבל רק 30, המערכת מזהה שחסרים 7 כדורים.
          </li>
          <li>
            <strong>מעקב היסטורי:</strong> הדו"ח כולל את כל השבועות מתחילת
            השנה.
          </li>
          <li>
            <strong>פעולה נדרשת:</strong> צור קשר עם המדריכים המופיעים בדו"ח
            ודרוש תשלום או החזרת הציוד.
          </li>
        </ul>
      </div>
    </div>
  );
}
