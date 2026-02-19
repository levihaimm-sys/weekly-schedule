import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CheckCircle, XCircle, AlertCircle, Calendar, ArrowRight } from "lucide-react";
import { getAllEquipmentConfirmationsByWeek } from "@/lib/queries/lesson-plans";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ConfirmationsReviewPage() {
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

  // Get all equipment confirmations grouped by week
  const confirmations = await getAllEquipmentConfirmationsByWeek();

  // Group by week
  const groupedByWeek = confirmations.reduce(
    (acc, item) => {
      if (!acc[item.week_start_date]) {
        acc[item.week_start_date] = [];
      }
      acc[item.week_start_date].push(item);
      return acc;
    },
    {} as Record<string, typeof confirmations>
  );

  const weeks = Object.keys(groupedByWeek).sort((a, b) => b.localeCompare(a));

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Link href="/lesson-plans" className="flex items-center gap-1 text-sm text-orange-600 hover:underline w-fit mb-4">
        <ArrowRight size={14} />
        חזרה לציוד
      </Link>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917] mb-2">דיווח קבלת ציוד</h2>
        <p className="text-gray-600">
          מעקב אחר אישורי קבלת ציוד של כל המדריכות, מחולק לפי שבועות
        </p>
      </div>

      {/* No data */}
      {weeks.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            אין נתונים
          </h3>
          <p className="text-gray-500">
            טרם נוצרו אישורי ציוד למדריכות
          </p>
        </div>
      )}

      {/* Weeks */}
      {weeks.map((weekDate) => {
        const weekData = groupedByWeek[weekDate];
        const totalInstructors = weekData.length;
        const totalConfirmations = weekData.reduce(
          (sum, instructor) => sum + instructor.confirmations.length,
          0
        );
        const confirmedCount = weekData.reduce(
          (sum, instructor) =>
            sum +
            instructor.confirmations.filter((c) => c.is_confirmed).length,
          0
        );
        const extraCount = weekData.reduce(
          (sum, instructor) =>
            sum + instructor.confirmations.filter((c) => c.is_extra).length,
          0
        );

        return (
          <div
            key={weekDate}
            className="mb-8 bg-white border border-gray-200 rounded-xl overflow-hidden"
          >
            {/* Week Header */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 rounded-lg p-2">
                    <Calendar className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-blue-900">
                      שבוע {new Date(weekDate).toLocaleDateString("he-IL")}
                    </h2>
                    <p className="text-sm text-blue-700 mt-1">
                      {totalInstructors} מדריכות • {totalConfirmations} פריטי
                      ציוד
                    </p>
                  </div>
                </div>

                {/* Week Stats */}
                <div className="flex gap-4">
                  <div className="bg-white rounded-lg px-4 py-2 border border-blue-200">
                    <div className="text-2xl font-bold text-green-600">
                      {confirmedCount}
                    </div>
                    <div className="text-xs text-gray-600">אושרו</div>
                  </div>
                  <div className="bg-white rounded-lg px-4 py-2 border border-blue-200">
                    <div className="text-2xl font-bold text-orange-600">
                      {totalConfirmations - confirmedCount}
                    </div>
                    <div className="text-xs text-gray-600">ממתינים</div>
                  </div>
                  {extraCount > 0 && (
                    <div className="bg-white rounded-lg px-4 py-2 border border-purple-200">
                      <div className="text-2xl font-bold text-purple-600">
                        {extraCount}
                      </div>
                      <div className="text-xs text-gray-600">ציוד נוסף</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Instructors List */}
            <div className="divide-y divide-gray-200">
              {weekData.map((instructor) => {
                const allConfirmed = instructor.confirmations.every(
                  (c) => c.is_confirmed
                );
                const hasUnconfirmed = instructor.confirmations.some(
                  (c) => !c.is_confirmed
                );
                const hasExtra = instructor.confirmations.some(
                  (c) => c.is_extra
                );
                const hasDiscrepancy = instructor.confirmations.some(
                  (c) =>
                    c.is_confirmed &&
                    c.received_quantity !== null &&
                    c.received_quantity !== c.expected_quantity
                );

                return (
                  <div
                    key={instructor.instructor_id}
                    className={`p-6 ${
                      allConfirmed
                        ? "bg-green-50/30"
                        : hasUnconfirmed
                          ? "bg-orange-50/30"
                          : ""
                    }`}
                  >
                    {/* Instructor Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-gray-900">
                            {instructor.instructor_name}
                          </h3>
                          {allConfirmed && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 ml-1" />
                              אישרה הכל
                            </span>
                          )}
                          {hasUnconfirmed && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              <XCircle className="w-3 h-3 ml-1" />
                              לא אישרה
                            </span>
                          )}
                          {hasExtra && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              דיווחה על ציוד נוסף
                            </span>
                          )}
                          {hasDiscrepancy && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <AlertCircle className="w-3 h-3 ml-1" />
                              חוסרים
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          מערך: {instructor.lesson_plan_name}
                        </p>
                      </div>
                    </div>

                    {/* Equipment Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-y border-gray-200">
                          <tr>
                            <th className="px-4 py-2 text-right font-medium text-gray-700">
                              ציוד
                            </th>
                            <th className="px-4 py-2 text-right font-medium text-gray-700">
                              צפוי
                            </th>
                            <th className="px-4 py-2 text-right font-medium text-gray-700">
                              התקבל
                            </th>
                            <th className="px-4 py-2 text-right font-medium text-gray-700">
                              הפרש
                            </th>
                            <th className="px-4 py-2 text-right font-medium text-gray-700">
                              סטטוס
                            </th>
                            <th className="px-4 py-2 text-right font-medium text-gray-700">
                              הערות
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {instructor.confirmations.map((conf, idx) => {
                            const difference =
                              conf.received_quantity !== null
                                ? conf.expected_quantity -
                                  conf.received_quantity
                                : 0;

                            return (
                              <tr
                                key={idx}
                                className={
                                  conf.is_extra
                                    ? "bg-purple-50"
                                    : difference !== 0 && conf.is_confirmed
                                      ? "bg-yellow-50"
                                      : ""
                                }
                              >
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    {conf.equipment_name}
                                    {conf.is_extra && (
                                      <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded">
                                        נוסף
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {conf.expected_quantity}
                                </td>
                                <td className="px-4 py-3 text-gray-900 font-medium">
                                  {conf.received_quantity ?? "-"}
                                </td>
                                <td className="px-4 py-3">
                                  {conf.is_confirmed &&
                                  conf.received_quantity !== null ? (
                                    difference === 0 ? (
                                      <span className="text-green-600 font-medium">
                                        תקין
                                      </span>
                                    ) : (
                                      <span
                                        className={`font-medium ${
                                          difference > 0
                                            ? "text-red-600"
                                            : "text-blue-600"
                                        }`}
                                      >
                                        {difference > 0 ? "-" : "+"}
                                        {Math.abs(difference)}
                                      </span>
                                    )
                                  ) : (
                                    "-"
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  {conf.is_confirmed ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      <CheckCircle className="w-3 h-3 ml-1" />
                                      אושר
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                      ממתין
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-gray-600 text-xs">
                                  {conf.notes || "-"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Confirmation Date */}
                    {allConfirmed &&
                      instructor.confirmations[0]?.confirmed_at && (
                        <div className="mt-3 text-xs text-gray-500">
                          אושר ב-
                          {new Date(
                            instructor.confirmations[0].confirmed_at
                          ).toLocaleDateString("he-IL")}{" "}
                          בשעה{" "}
                          {new Date(
                            instructor.confirmations[0].confirmed_at
                          ).toLocaleTimeString("he-IL", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Help Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">
          📊 הסברים על הדוח
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>
            <strong>אושרה הכל:</strong> המדריכה אישרה קבלת כל הציוד.
          </li>
          <li>
            <strong>לא אישרה:</strong> המדריכה עדיין לא אישרה קבלת ציוד (יכולה
            לאשר רק ביום ראשון ושני).
          </li>
          <li>
            <strong>ציוד נוסף:</strong> המדריכה דיווחה על ציוד שקיבלה שלא היה
            ברשימה המקורית.
          </li>
          <li>
            <strong>חוסרים:</strong> יש הפרש בין הכמות הצפויה לכמות שהתקבלה
            בפועל.
          </li>
          <li>
            <strong>תקין:</strong> הכמות שהתקבלה תואמת לכמות הצפויה.
          </li>
        </ul>
      </div>
    </div>
  );
}
