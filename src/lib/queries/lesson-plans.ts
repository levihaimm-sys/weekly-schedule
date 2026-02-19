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

  // If not, create confirmations based on lesson plan equipment
  const { data: equipmentItems } = await supabase
    .from("lesson_plan_equipment")
    .select(
      `
      equipment_id,
      quantity
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
    expected_quantity: item.quantity,
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
 * Get assignments overview across multiple weeks for the bird's-eye table.
 * Returns all assignments with instructor, lesson plan, and instructor's city.
 */
export async function getAssignmentsOverview(weeksCount = 20) {
  const supabase = await createClient();

  // Get Sunday of current week (Israel timezone)
  const now = getNowInIsrael();
  const dayOfWeek = now.getDay();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - dayOfWeek);
  const formatDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const currentWeekStart = formatDate(sunday);

  // Calculate range: a few weeks back + weeks ahead
  const weeksBack = 2;
  const rangeStart = new Date(sunday);
  rangeStart.setDate(rangeStart.getDate() - weeksBack * 7);
  const rangeStartStr = formatDate(rangeStart);

  const rangeEnd = new Date(sunday);
  rangeEnd.setDate(rangeEnd.getDate() + (weeksCount - weeksBack) * 7);
  const rangeEndStr = formatDate(rangeEnd);

  // Fetch all assignments in range
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
    .lte("week_start_date", rangeEndStr);

  if (error) {
    console.error("Error fetching assignments overview:", error, JSON.stringify(error));
    return { assignments: [], instructorCities: {} as Record<string, string>, currentWeekStart };
  }

  // Get instructor-to-city mapping from recurring_schedule
  const { data: scheduleData } = await supabase
    .from("recurring_schedule")
    .select(
      `
      instructor_id,
      location:locations(city)
    `
    );

  const instructorCities: Record<string, string> = {};
  if (scheduleData) {
    for (const item of scheduleData as any[]) {
      if (item.instructor_id && item.location?.city) {
        // Use first city found for each instructor
        if (!instructorCities[item.instructor_id]) {
          instructorCities[item.instructor_id] = item.location.city;
        }
      }
    }
  }

  return { assignments: assignments as any[] ?? [], instructorCities, currentWeekStart };
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
