import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEquipmentInventoryOverview } from "@/lib/queries/lesson-plans";
import { EquipmentInventoryManager } from "@/components/equipment/equipment-inventory-manager";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EquipmentInventoryPage() {
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

  const { weekStartDate, rows } = await getEquipmentInventoryOverview();

  const formattedWeek = new Date(weekStartDate).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-4 p-4 md:p-6">
      <Link
        href="/lesson-plans"
        className="flex items-center gap-1 text-sm text-orange-600 hover:underline w-fit"
      >
        <ArrowRight size={14} />
        חזרה לציוד
      </Link>

      <div>
        <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">מלאי ציוד</h2>
        <p className="text-sm text-muted-foreground">
          המלאי הכולל של כל פריט, וכמה ממנו נמצא כרגע אצל מדריכות - לפי השיבוץ לשבוע המתחיל
          ב-{formattedWeek} בעמוד הקצאות שבועיות. לחצי על &quot;מלאי כולל&quot; כדי לערוך;
          השאירי ריק לסימון &quot;המון&quot; (כמות לא מוגבלת).
        </p>
      </div>

      <EquipmentInventoryManager rows={rows} />
    </div>
  );
}
