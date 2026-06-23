import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight } from "lucide-react";
import {
  getWeeklyEquipmentConfirmations,
  getEquipmentConfirmationWeeks,
} from "@/lib/queries/lesson-plans";
import { EquipmentReceiptReport } from "@/components/equipment/equipment-receipt-report";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ week?: string }>;
}

export default async function EquipmentReportPage({ searchParams }: Props) {
  const params = await searchParams;
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

  // Get available weeks
  const availableWeeks = await getEquipmentConfirmationWeeks();

  // Determine which week to show
  let weekStartDate = params.week;
  if (!weekStartDate || !availableWeeks.includes(weekStartDate)) {
    // Default to current week's Sunday
    const now = new Date();
    const dayOfWeek = now.getDay();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - dayOfWeek);
    sunday.setHours(0, 0, 0, 0);
    weekStartDate = sunday.toISOString().split("T")[0];

    // If current week has no data, use the most recent week that does
    if (!availableWeeks.includes(weekStartDate) && availableWeeks.length > 0) {
      weekStartDate = availableWeeks[0];
    }
  }

  // Ensure current week is in the list for navigation
  const allWeeks = availableWeeks.includes(weekStartDate)
    ? availableWeeks
    : [weekStartDate, ...availableWeeks].sort((a, b) => b.localeCompare(a));

  // Get confirmations for the selected week
  const rawConfirmations = await getWeeklyEquipmentConfirmations(weekStartDate);

  // Group by instructor
  const byInstructor = new Map<
    string,
    {
      instructorId: string;
      instructorName: string;
      route: string | null;
      lessonPlanName: string | null;
      items: Array<{
        id: string;
        equipment_name: string;
        expected_quantity: number;
        received_quantity: number | null;
        is_confirmed: boolean;
        confirmed_at: string | null;
        is_extra: boolean;
        notes: string | null;
      }>;
    }
  >();

  for (const c of rawConfirmations) {
    const instructorId = c.assignment.instructor.id;
    if (!byInstructor.has(instructorId)) {
      byInstructor.set(instructorId, {
        instructorId,
        instructorName: c.assignment.instructor.full_name,
        route: c.assignment.instructor.route,
        lessonPlanName: c.assignment.lesson_plan?.name || null,
        items: [],
      });
    }
    byInstructor.get(instructorId)!.items.push({
      id: c.id,
      equipment_name: c.equipment.name,
      expected_quantity: c.expected_quantity,
      received_quantity: c.received_quantity,
      is_confirmed: c.is_confirmed,
      confirmed_at: c.confirmed_at,
      is_extra: c.is_extra || false,
      notes: c.notes,
    });
  }

  // Build instructor reports with status
  const instructorReports = Array.from(byInstructor.values()).map((inst) => {
    const allConfirmed = inst.items.every((i) => i.is_confirmed);
    const hasShortages = inst.items.some(
      (i) =>
        i.is_confirmed &&
        i.received_quantity !== null &&
        i.received_quantity < i.expected_quantity
    );
    const totalExpected = inst.items.reduce(
      (sum, i) => sum + i.expected_quantity,
      0
    );
    const totalReceived = inst.items.reduce(
      (sum, i) => sum + (i.received_quantity ?? 0),
      0
    );

    return {
      ...inst,
      allConfirmed,
      hasShortages,
      totalExpected,
      totalReceived,
    };
  });

  // Sort: shortages first, then pending, then all confirmed
  instructorReports.sort((a, b) => {
    const order = (r: typeof a) =>
      r.hasShortages ? 0 : !r.allConfirmed ? 1 : 2;
    return order(a) - order(b);
  });

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Link
        href="/lesson-plans"
        className="flex items-center gap-1 text-sm text-orange-600 hover:underline w-fit mb-4"
      >
        <ArrowRight size={14} />
        חזרה לציוד
      </Link>

      <div className="mb-6">
        <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">
          דיווח קבלת ציוד
        </h2>
        <p className="text-muted-foreground mt-1">
          מעקב אישורי קבלת ציוד מהמדריכים
        </p>
      </div>

      <EquipmentReceiptReport
        instructors={instructorReports}
        weekStartDate={weekStartDate}
        availableWeeks={allWeeks}
      />
    </div>
  );
}
