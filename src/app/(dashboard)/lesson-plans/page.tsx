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

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917] mb-2">ציוד</h2>
        <p className="text-gray-600">
          ניהול ציוד, הקצאות שבועיות וחלוקה למדריכים
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/equipment-distribution"
          className="bg-white border border-gray-200 rounded-lg p-6 hover:border-orange-300 hover:shadow-md transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">חלוקת ציוד</h3>
              <p className="text-sm text-gray-600">
                חלוקת ציוד למדריכים לשבוע הנוכחי
              </p>
            </div>
          </div>
        </Link>

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
          className="bg-white border border-gray-200 rounded-lg p-6 hover:border-green-300 hover:shadow-md transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <Package className="w-6 h-6 text-green-600" />
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
          className="bg-white border border-gray-200 rounded-lg p-6 hover:border-red-300 hover:shadow-md transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <Package className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">דו&quot;ח ציוד חסר</h3>
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
    </div>
  );
}
