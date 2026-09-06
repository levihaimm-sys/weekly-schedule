import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getLessonPlansWithEquipmentByCategory } from "@/lib/queries/lesson-plans";
import { EquipmentMatchingManager } from "@/components/lesson-plans/equipment-matching-manager";

export const dynamic = "force-dynamic";

export default async function EquipmentMatchingPage() {
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

  const plansByCategory = await getLessonPlansWithEquipmentByCategory();

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <Link
        href="/lesson-plans"
        className="flex items-center gap-1 text-sm text-orange-600 hover:underline w-fit mb-4"
      >
        <ArrowRight size={14} />
        חזרה לציוד
      </Link>

      <div className="mb-6">
        <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">
          התאמת ציוד למערך
        </h2>
        <p className="text-gray-600 mt-1">
          לכל מערך: הכמות הרשומה במערך מול הכמות שבפועל תוצג למדריכים (למשל, לתת מרווח לציוד
          שנשבר או אבד). השאירו ריק כדי להציג למדריך את הכמות הרשומה במערך.
        </p>
      </div>

      {Object.keys(plansByCategory).length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-600">
          אין מערכי שיעור
        </div>
      ) : (
        <EquipmentMatchingManager plansByCategory={plansByCategory} />
      )}
    </div>
  );
}
