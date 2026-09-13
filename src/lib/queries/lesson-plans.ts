/**
 * Queries for lesson plans system
 */

import { createClient } from "@/lib/supabase/server";
import { getNowInIsrael } from "@/lib/utils/date";
import type {
  LessonPlan,
  Equipment,
  WeeklyLessonAssignment,
  EquipmentConfirmation,
  WeeklyLessonAssignmentWithDetails,
  LessonPlanWithEquipment,
} from "@/types/database";

// =============================================
// INSTRUCTOR QUERIES
// =============================================

/**
 * Get instructor's current weekly lesson assignment
 * Returns the lesson plan for the current week
 */
export async function getInstructorCurrentWeekAssignment(
  instructorId: string
): Promise<WeeklyLessonAssignmentWithDetails | null> {
  const supabase = await createClient();

  // Get Sunday of current week (Israel timezone)
  const now = getNowInIsrael();
  const dayOfWeek = now.getDay();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - dayOfWeek);
  const weekStartDate = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, "0")}-${String(sunday.getDate()).padStart(2, "0")}`;

  console.log("[getInstructorCurrentWeekAssignment] Query params:", {
    instructorId,
    weekStartDate,
    dayOfWeek,
  });

  const { data, error } = await supabase
    .from("weekly_lesson_assignments")
    .select(
      `
      id,
      instructor_id,
      lesson_plan_id,
      week_start_date,
      is_permanent_change,
      instructor:instructors(id, full_name),
      lesson_plan:lesson_plans(id, name, category, pdf_path, week_number)
    `
    )
    .eq("instructor_id", instructorId)
    .eq("week_start_date", weekStartDate)
    .single();

  if (error) {
    console.error("[getInstructorCurrentWeekAssignment] Error:", JSON.stringify(error, null, 2));
    console.error("[getInstructorCurrentWeekAssignment] Error details:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    console.error("[getInstructorCurrentWeekAssignment] Query params:", {
      instructorId,
      weekStartDate,
    });
    return null;
  }

  console.log("[getInstructorCurrentWeekAssignment] Success:", {
    assignmentId: data?.id,
    lessonName: data?.lesson_plan?.name,
  });

  return data as any;
}

/**
 * Get instructor's next weekly lesson assignment
 * Returns the lesson plan for the following week
 */
export async function getInstructorNextWeekAssignment(
  instructorId: string
): Promise<WeeklyLessonAssignmentWithDetails | null> {
  const supabase = await createClient();

  // Get Sunday of next week (Israel timezone)
  const now = getNowInIsrael();
  const dayOfWeek = now.getDay();
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() - dayOfWeek + 7);
  const weekStartDate = `${nextSunday.getFullYear()}-${String(nextSunday.getMonth() + 1).padStart(2, "0")}-${String(nextSunday.getDate()).padStart(2, "0")}`;

  const { data, error } = await supabase
    .from("weekly_lesson_assignments")
    .select(
      `
      id,
      instructor_id,
      lesson_plan_id,
      week_start_date,
      is_permanent_change,
      instructor:instructors(id, full_name),
      lesson_plan:lesson_plans(id, name, category, pdf_path, week_number)
    `
    )
    .eq("instructor_id", instructorId)
    .eq("week_start_date", weekStartDate)
    .single();

  if (error) {
    return null;
  }

  return data as any;
}

/**
 * Get lesson plan with all equipment details
 */
export async function getLessonPlanWithEquipment(
  lessonPlanId: string
): Promise<LessonPlanWithEquipment | null> {
  const supabase = await createClient();

  const { data: lessonPlan, error: lessonError } = await supabase
    .from("lesson_plans")
    .select("*")
    .eq("id", lessonPlanId)
    .single();

  if (lessonError || !lessonPlan) {
    console.error("Error fetching lesson plan:", lessonError);
    return null;
  }

  const { data: equipmentData, error: equipmentError } = await supabase
    .from("lesson_plan_equipment")
    .select(
      `
      equipment_id,
      quantity,
      instructor_quantity,
      equipment_type,
      equipment:equipment(id, name)
    `
    )
    .eq("lesson_plan_id", lessonPlanId);

  if (equipmentError) {
    console.error("Error fetching equipment:", equipmentError);
    return lessonPlan as LessonPlanWithEquipment;
  }

  const equipment = equipmentData.map((item: any) => ({
    equipment_id: item.equipment_id,
    equipment_name: item.equipment.name,
    quantity: item.quantity,
    instructor_quantity: item.instructor_quantity,
    equipment_type: item.equipment_type,
  }));

  return {
    ...lessonPlan,
    equipment,
  } as LessonPlanWithEquipment;
}

/**
 * Get equipment confirmations for an assignment
 */
export async function getEquipmentConfirmations(
  assignmentId: string
): Promise<EquipmentConfirmation[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("equipment_confirmations")
    .select(
      `
      *,
      equipment:equipment(id, name)
    `
    )
    .eq("assignment_id", assignmentId)
    .order("equipment(name)");

  if (error) {
    console.error("Error fetching confirmations:", error);
    return [];
  }

  return data as any;
}

/**
 * Get or create equipment confirmations for current week
 * If confirmations don't exist, creates them based on lesson plan equipment
 */
export async function getOrCreateEquipmentConfirmations(
  instructorId: string,
  assignmentId: string,
  lessonPlanId: string
): Promise<EquipmentConfirmation[]> {
  const supabase = await createClient();

  // First, check if confirmations already exist
  const { data: existing } = await supabase
    .from("equipment_confirmations")
    .select(
      `
      *,
      equipment:equipment(id, name)
    `
    )
    .eq("assignment_id", assignmentId);

  if (existing && existing.length > 0) {
    return existing as any;
  }

  // If not, create confirmations based on lesson plan equipment. instructor_quantity is an
  // admin override for what's actually handed out (e.g. extra units to cover breakage/loss) —
  // it takes precedence over the plan's nominal required quantity when set.
  const { data: equipmentItems } = await supabase
    .from("lesson_plan_equipment")
    .select(
      `
      equipment_id,
      quantity,
      instructor_quantity
    `
    )
    .eq("lesson_plan_id", lessonPlanId);

  if (!equipmentItems || equipmentItems.length === 0) {
    return [];
  }

  const confirmations = equipmentItems.map((item) => ({
    assignment_id: assignmentId,
    instructor_id: instructorId,
    equipment_id: item.equipment_id,
    expected_quantity: item.instructor_quantity ?? item.quantity,
    received_quantity: null,
    is_confirmed: false,
  }));

  const { data: created, error } = await supabase
    .from("equipment_confirmations")
    .insert(confirmations)
    .select(
      `
      *,
      equipment:equipment(id, name)
    `
    );

  if (error) {
    console.error("Error creating confirmations:", error);
    return [];
  }

  return created as any;
}

// =============================================
// ADMIN QUERIES
// =============================================

/**
 * Get all weekly assignments for a specific week
 */
export async function getWeeklyAssignments(
  weekStartDate: string
): Promise<WeeklyLessonAssignmentWithDetails[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("weekly_lesson_assignments")
    .select(
      `
      *,
      instructor:instructors(id, full_name, phone, email),
      lesson_plan:lesson_plans(id, name, category, pdf_path, week_number)
    `
    )
    .eq("week_start_date", weekStartDate)
    .order("instructor(full_name)");

  if (error) {
    console.error("Error fetching weekly assignments:", error);
    return [];
  }

  return data as any;
}

/**
 * Get missing equipment report
 * Shows differences between expected and received quantities
 */
export async function getMissingEquipmentReport(
  weekStartDate?: string
): Promise<
  Array<{
    instructor_name: string;
    equipment_name: string;
    expected: number;
    received: number;
    difference: number;
    week_start_date: string;
    lesson_name: string;
    is_extra: boolean;
  }>
> {
  const supabase = await createClient();

  let query = supabase
    .from("equipment_confirmations")
    .select(
      `
      expected_quantity,
      received_quantity,
      is_confirmed,
      is_extra,
      assignment:weekly_lesson_assignments!inner(
        week_start_date,
        instructor:instructors(full_name),
        lesson_plan:lesson_plans(name)
      ),
      equipment:equipment(name)
    `
    )
    .eq("is_confirmed", true)
    .not("received_quantity", "is", null);

  if (weekStartDate) {
    // Filter by specific week via the assignment relationship
    query = query.eq("assignment.week_start_date", weekStartDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching missing equipment:", error);
    return [];
  }

  return (data as any[])
    .filter((item: any) => item.received_quantity !== item.expected_quantity)
    .map((item: any) => ({
      instructor_name: item.assignment.instructor.full_name,
      equipment_name: item.equipment.name,
      expected: item.expected_quantity,
      received: item.received_quantity,
      difference: item.expected_quantity - item.received_quantity,
      week_start_date: item.assignment.week_start_date,
      lesson_name: item.assignment.lesson_plan.name,
      is_extra: item.is_extra || false,
    }));
}

/**
 * Get equipment confirmation status per instructor for a specific week.
 * Returns all instructors who had equipment distributed that week,
 * along with their confirmation details.
 */
export async function getWeeklyEquipmentConfirmations(weekStartDate: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("equipment_confirmations")
    .select(
      `
      id,
      expected_quantity,
      received_quantity,
      is_confirmed,
      confirmed_at,
      is_extra,
      notes,
      equipment:equipment(id, name),
      assignment:weekly_lesson_assignments!inner(
        id,
        week_start_date,
        equipment_distributed_at,
        instructor:instructors(id, full_name, route),
        lesson_plan:lesson_plans(id, name, category)
      )
    `
    )
    .eq("assignment.week_start_date", weekStartDate);

  if (error) {
    console.error("Error fetching weekly equipment confirmations:", error);
    return [];
  }

  return data as any[];
}

/**
 * Get all distinct weeks that have equipment confirmations
 */
export async function getEquipmentConfirmationWeeks(): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("weekly_lesson_assignments")
    .select("week_start_date")
    .eq("equipment_distributed", true)
    .order("week_start_date", { ascending: false });

  if (error) {
    console.error("Error fetching equipment weeks:", error);
    return [];
  }

  const uniqueWeeks = [...new Set((data || []).map((d) => d.week_start_date))];
  return uniqueWeeks;
}

/**
 * Get all lesson plans grouped by category
 */
export async function getLessonPlansByCategory(): Promise<
  Record<string, LessonPlan[]>
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lesson_plans")
    .select("*")
    .order("week_number");

  if (error) {
    console.error("Error fetching lesson plans:", error);
    return {};
  }

  const grouped: Record<string, LessonPlan[]> = {};
  data.forEach((plan) => {
    if (!grouped[plan.category]) {
      grouped[plan.category] = [];
    }
    grouped[plan.category].push(plan);
  });

  return grouped;
}

/**
 * Get every lesson plan together with its full equipment list (required quantity and the
 * instructor-facing override), grouped by category — for the equipment-matching admin screen.
 */
export async function getLessonPlansWithEquipmentByCategory(): Promise<
  Record<
    string,
    Array<
      LessonPlan & {
        equipment: Array<{
          id: string;
          equipment_id: string;
          equipment_name: string;
          quantity: number;
          instructor_quantity: number | null;
        }>;
      }
    >
  >
> {
  const supabase = await createClient();

  const { data: plans, error } = await supabase
    .from("lesson_plans")
    .select("*")
    .order("category")
    .order("week_number");

  if (error || !plans) {
    console.error("Error fetching lesson plans:", error);
    return {};
  }

  const { data: equipmentRows } = await supabase
    .from("lesson_plan_equipment")
    .select(
      `
      id,
      lesson_plan_id,
      equipment_id,
      quantity,
      instructor_quantity,
      equipment:equipment(id, name)
    `
    );

  const equipmentByPlan = new Map<string, Array<{
    id: string;
    equipment_id: string;
    equipment_name: string;
    quantity: number;
    instructor_quantity: number | null;
  }>>();
  for (const row of (equipmentRows ?? []) as any[]) {
    const list = equipmentByPlan.get(row.lesson_plan_id) ?? [];
    list.push({
      id: row.id,
      equipment_id: row.equipment_id,
      equipment_name: row.equipment.name,
      quantity: row.quantity,
      instructor_quantity: row.instructor_quantity,
    });
    equipmentByPlan.set(row.lesson_plan_id, list);
  }

  const grouped: Record<string, Array<LessonPlan & { equipment: any[] }>> = {};
  for (const plan of plans) {
    if (!grouped[plan.category]) grouped[plan.category] = [];
    grouped[plan.category].push({
      ...plan,
      equipment: equipmentByPlan.get(plan.id) ?? [],
    });
  }

  return grouped;
}

/**
 * Get assignments overview across multiple weeks for the bird's-eye table.
 * Returns all assignments with instructor, lesson plan, and instructor's city.
 */
export async function getAssignmentsOverview() {
  const supabase = await createClient();

  // Get Sunday of current week (Israel timezone)
  const now = getNowInIsrael();
  const dayOfWeek = now.getDay();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - dayOfWeek);
  const formatDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const currentWeekStart = formatDate(sunday);

  // Generate weeks: 8 back + current + 8 ahead (covers ~2 months each direction),
  // but never before the current school year's first Sunday - a new year's table
  // shouldn't scroll back into last year's rows.
  const schoolYearStartCalendarYear = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  const sept1 = new Date(schoolYearStartCalendarYear, 8, 1);
  const schoolYearStartSunday = new Date(sept1);
  schoolYearStartSunday.setDate(sept1.getDate() + ((7 - sept1.getDay()) % 7));

  const eightWeeksBack = new Date(sunday);
  eightWeeksBack.setDate(eightWeeksBack.getDate() - 8 * 7);

  const rangeStart = eightWeeksBack > schoolYearStartSunday ? eightWeeksBack : schoolYearStartSunday;
  const weeksCount = Math.round((sunday.getTime() - rangeStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 9; // back to rangeStart + current + 8 ahead
  const weeks: string[] = [];
  for (let i = 0; i < weeksCount; i++) {
    const d = new Date(rangeStart);
    d.setDate(d.getDate() + i * 7);
    weeks.push(formatDate(d));
  }
  const rangeStartStr = weeks[0];
  const rangeEndStr = weeks[weeks.length - 1];

  const { data: assignments, error } = await supabase
    .from("weekly_lesson_assignments")
    .select(
      `
      *,
      instructor:instructors(id, full_name),
      lesson_plan:lesson_plans(id, name, category, pdf_path, week_number)
    `
    )
    .gte("week_start_date", rangeStartStr)
    .lte("week_start_date", rangeEndStr)
    .order("week_start_date");

  if (error) {
    console.error("Error fetching assignments overview:", error, JSON.stringify(error));
    return { assignments: [], instructorCities: {} as Record<string, string>, currentWeekStart };
  }

  // Get instructor-to-route mapping (manually-set route label, e.g. "ראש העין") -
  // this is intentionally not the actual recurring class location, since a route
  // can group several instructors and doesn't need to track real scheduling changes.
  const { data: routeData } = await supabase
    .from("instructors")
    .select("id, route");

  const instructorCities: Record<string, string> = {};
  if (routeData) {
    for (const inst of routeData) {
      if (inst.route) {
        instructorCities[inst.id] = inst.route;
      }
    }
  }

  return { assignments: assignments as any[] ?? [], instructorCities, currentWeekStart, weeks };
}

/**
 * Get every equipment distribution recorded during the current school year
 * (from September 1st through today), for the yearly equipment history page.
 */
export async function getYearlyEquipmentDistribution() {
  const supabase = await createClient();

  const now = getNowInIsrael();
  // School year starts Sept 1st. If we're before September, the year started last calendar year.
  const schoolYearStartYear = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  const rangeStartStr = `${schoolYearStartYear}-09-01`;
  const formatDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const rangeEndStr = formatDate(now);

  const { data, error } = await supabase
    .from("weekly_lesson_assignments")
    .select(
      `
      id,
      week_start_date,
      equipment_distributed_at,
      instructor:instructors(id, full_name, route),
      lesson_plan:lesson_plans(id, name, category)
    `
    )
    .eq("equipment_distributed", true)
    .gte("week_start_date", rangeStartStr)
    .lte("week_start_date", rangeEndStr)
    .order("week_start_date", { ascending: false });

  if (error) {
    console.error("Error fetching yearly equipment distribution:", error);
    return [];
  }

  return (data as any[]).map((row) => ({
    id: row.id,
    weekStartDate: row.week_start_date,
    distributedAt: row.equipment_distributed_at,
    instructorName: row.instructor?.full_name ?? "",
    route: row.instructor?.route ?? null,
    lessonPlanName: row.lesson_plan?.name ?? null,
    lessonPlanCategory: row.lesson_plan?.category ?? null,
  }));
}

/**
 * Get the full equipment inventory (total stock per item) together with how much of each
 * item is currently out with instructors, based on the current week's row on the weekly
 * assignments page (whatever lesson plan is listed for each instructor this week).
 */
export async function getEquipmentInventoryOverview(): Promise<{
  weekStartDate: string;
  rows: Array<{
    equipment_id: string;
    equipment_name: string;
    total_stock: number | null;
    with_instructors: number;
    holders: Array<{ instructor_name: string; lesson_plan_name: string; quantity: number }>;
  }>;
}> {
  const supabase = await createClient();

  const { data: equipmentList, error: equipmentError } = await supabase
    .from("equipment")
    .select("id, name, total_stock")
    .order("name");

  // Get Sunday of current week (Israel timezone) - same logic as getAssignmentsOverview
  const now = getNowInIsrael();
  const dayOfWeek = now.getDay();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - dayOfWeek);
  const weekStartDate = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, "0")}-${String(sunday.getDate()).padStart(2, "0")}`;

  if (equipmentError || !equipmentList) {
    console.error("Error fetching equipment inventory:", equipmentError);
    return { weekStartDate, rows: [] };
  }

  const { data: assignments } = await supabase
    .from("weekly_lesson_assignments")
    .select(
      `
      lesson_plan_id,
      instructor:instructors(full_name),
      lesson_plan:lesson_plans(id, name)
    `
    )
    .eq("week_start_date", weekStartDate)
    .not("lesson_plan_id", "is", null);

  const lessonPlanIds = [
    ...new Set((assignments ?? []).map((a: any) => a.lesson_plan_id as string)),
  ];

  const totalsByEquipment = new Map<string, number>();
  const holdersByEquipment = new Map<
    string,
    Array<{ instructor_name: string; lesson_plan_name: string; quantity: number }>
  >();

  if (lessonPlanIds.length > 0) {
    const { data: equipmentRows } = await supabase
      .from("lesson_plan_equipment")
      .select("lesson_plan_id, equipment_id, quantity, instructor_quantity")
      .in("lesson_plan_id", lessonPlanIds);

    const equipmentByPlan = new Map<string, Array<{ equipment_id: string; quantity: number }>>();
    for (const row of (equipmentRows ?? []) as any[]) {
      const list = equipmentByPlan.get(row.lesson_plan_id) ?? [];
      list.push({
        equipment_id: row.equipment_id,
        quantity: row.instructor_quantity ?? row.quantity,
      });
      equipmentByPlan.set(row.lesson_plan_id, list);
    }

    for (const assignment of (assignments ?? []) as any[]) {
      const items = equipmentByPlan.get(assignment.lesson_plan_id) ?? [];
      for (const item of items) {
        totalsByEquipment.set(
          item.equipment_id,
          (totalsByEquipment.get(item.equipment_id) ?? 0) + item.quantity
        );
        const list = holdersByEquipment.get(item.equipment_id) ?? [];
        list.push({
          instructor_name: assignment.instructor?.full_name ?? "",
          lesson_plan_name: assignment.lesson_plan?.name ?? "",
          quantity: item.quantity,
        });
        holdersByEquipment.set(item.equipment_id, list);
      }
    }
  }

  const rows = equipmentList.map((eq) => ({
    equipment_id: eq.id,
    equipment_name: eq.name,
    total_stock: eq.total_stock,
    with_instructors: totalsByEquipment.get(eq.id) ?? 0,
    holders: holdersByEquipment.get(eq.id) ?? [],
  }));

  return { weekStartDate, rows };
}

/**
 * Get all equipment items
 */
export async function getAllEquipment(): Promise<Equipment[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("equipment")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching equipment:", error);
    return [];
  }

  return data;
}

/**
 * Get all equipment confirmations grouped by week
 * For admin review of instructor equipment receipts
 */
export async function getAllEquipmentConfirmationsByWeek(
  weekStartDate?: string
): Promise<
  Array<{
    week_start_date: string;
    instructor_name: string;
    instructor_id: string;
    lesson_plan_name: string;
    confirmations: Array<{
      equipment_name: string;
      expected_quantity: number;
      received_quantity: number | null;
      is_confirmed: boolean;
      is_extra: boolean;
      confirmed_at: string | null;
      notes: string | null;
    }>;
  }>
> {
  const supabase = await createClient();

  let query = supabase
    .from("equipment_confirmations")
    .select(
      `
      expected_quantity,
      received_quantity,
      is_confirmed,
      is_extra,
      confirmed_at,
      notes,
      equipment:equipment(name),
      assignment:weekly_lesson_assignments!inner(
        week_start_date,
        instructor_id,
        instructor:instructors(id, full_name),
        lesson_plan:lesson_plans(name)
      )
    `
    )
    .order("assignment(week_start_date)", { ascending: false });

  if (weekStartDate) {
    query = query.eq("assignment.week_start_date", weekStartDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching equipment confirmations:", error);
    return [];
  }

  // Group by week and instructor
  const grouped = new Map<
    string,
    Map<
      string,
      {
        week_start_date: string;
        instructor_name: string;
        instructor_id: string;
        lesson_plan_name: string;
        confirmations: Array<{
          equipment_name: string;
          expected_quantity: number;
          received_quantity: number | null;
          is_confirmed: boolean;
          is_extra: boolean;
          confirmed_at: string | null;
          notes: string | null;
        }>;
      }
    >
  >();

  (data as any[]).forEach((item: any) => {
    const weekKey = item.assignment.week_start_date;
    const instructorKey = item.assignment.instructor_id;

    if (!grouped.has(weekKey)) {
      grouped.set(weekKey, new Map());
    }

    const weekGroup = grouped.get(weekKey)!;

    if (!weekGroup.has(instructorKey)) {
      weekGroup.set(instructorKey, {
        week_start_date: item.assignment.week_start_date,
        instructor_name: item.assignment.instructor.full_name,
        instructor_id: item.assignment.instructor_id,
        lesson_plan_name: item.assignment.lesson_plan.name,
        confirmations: [],
      });
    }

    weekGroup.get(instructorKey)!.confirmations.push({
      equipment_name: item.equipment.name,
      expected_quantity: item.expected_quantity,
      received_quantity: item.received_quantity,
      is_confirmed: item.is_confirmed,
      is_extra: item.is_extra || false,
      confirmed_at: item.confirmed_at,
      notes: item.notes,
    });
  });

  // Flatten to array
  const result: any[] = [];
  grouped.forEach((weekGroup) => {
    weekGroup.forEach((instructorData) => {
      result.push(instructorData);
    });
  });

  return result;
}
