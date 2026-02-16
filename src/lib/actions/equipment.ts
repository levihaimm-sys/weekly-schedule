"use server";

/**
 * Server actions for equipment confirmations
 */

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Confirm equipment receipt
 * Instructors confirm they received the equipment (either exact quantity or different)
 */
export async function confirmEquipmentReceipt(
  confirmationId: string,
  receivedQuantity: number,
  notes?: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("equipment_confirmations")
    .update({
      received_quantity: receivedQuantity,
      is_confirmed: true,
      confirmed_at: new Date().toISOString(),
      notes: notes || null,
    })
    .eq("id", confirmationId);

  if (error) {
    console.error("Error confirming equipment:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/my-lesson-plan");
  return { success: true };
}

/**
 * Bulk confirm all equipment as received (all correct quantities)
 */
export async function confirmAllEquipmentCorrect(assignmentId: string) {
  const supabase = await createClient();

  // Get all confirmations for this assignment
  const { data: confirmations, error: fetchError } = await supabase
    .from("equipment_confirmations")
    .select("id, expected_quantity")
    .eq("assignment_id", assignmentId)
    .eq("is_confirmed", false);

  if (fetchError) {
    console.error("Error fetching confirmations:", fetchError);
    return { success: false, error: fetchError.message };
  }

  if (!confirmations || confirmations.length === 0) {
    return { success: true };
  }

  // Update all to confirmed with expected quantity
  const now = new Date().toISOString();
  for (const c of confirmations) {
    const { error: updateError } = await supabase
      .from("equipment_confirmations")
      .update({
        received_quantity: c.expected_quantity,
        is_confirmed: true,
        confirmed_at: now,
      })
      .eq("id", c.id);

    if (updateError) {
      console.error("Error confirming equipment:", updateError);
      return { success: false, error: updateError.message };
    }
  }

  revalidatePath("/my-lesson-plan");
  return { success: true };
}

/**
 * Update a single equipment confirmation quantity
 */
export async function updateEquipmentQuantity(
  confirmationId: string,
  receivedQuantity: number
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("equipment_confirmations")
    .update({
      received_quantity: receivedQuantity,
    })
    .eq("id", confirmationId);

  if (error) {
    console.error("Error updating equipment quantity:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/my-lesson-plan");
  return { success: true };
}

// =============================================
// ADMIN ACTIONS
// =============================================

/**
 * Update weekly lesson assignment
 * Can change the lesson plan for a specific instructor/week.
 *
 * isPermanentChange = true:
 *   Swaps the old and new lesson plans for the changed week AND all future weeks.
 *   This preserves the rotation integrity — if instructor A gets lesson X instead of Y,
 *   whoever had lesson X now gets lesson Y (swap), and this swap propagates forward.
 */
export async function updateWeeklyAssignment(
  assignmentId: string,
  lessonPlanId: string,
  isPermanentChange: boolean = false
) {
  const supabase = await createClient();

  // Get the current assignment to find week and instructor
  const { data: currentAssignment, error: fetchError } = await supabase
    .from("weekly_lesson_assignments")
    .select("instructor_id, week_start_date, lesson_plan_id")
    .eq("id", assignmentId)
    .single();

  if (fetchError || !currentAssignment) {
    return { success: false, error: "Assignment not found" };
  }

  const oldLessonPlanId = currentAssignment.lesson_plan_id;
  const changedWeek = currentAssignment.week_start_date;

  // Update the assignment
  const { error: updateError } = await supabase
    .from("weekly_lesson_assignments")
    .update({
      lesson_plan_id: lessonPlanId,
      is_permanent_change: isPermanentChange,
    })
    .eq("id", assignmentId);

  if (updateError) {
    console.error("Error updating assignment:", updateError);
    return { success: false, error: updateError.message };
  }

  if (isPermanentChange && oldLessonPlanId !== lessonPlanId) {
    // Swap: find who had the NEW lesson plan in this week, give them the OLD one
    const { data: swapTarget } = await supabase
      .from("weekly_lesson_assignments")
      .select("id")
      .eq("week_start_date", changedWeek)
      .eq("lesson_plan_id", lessonPlanId)
      .neq("id", assignmentId)
      .single();

    if (swapTarget) {
      await supabase
        .from("weekly_lesson_assignments")
        .update({ lesson_plan_id: oldLessonPlanId, is_permanent_change: true })
        .eq("id", swapTarget.id);
    }

    // Now propagate the same swap to ALL future weeks
    const { data: futureWeeks } = await supabase
      .from("weekly_lesson_assignments")
      .select("id, instructor_id, week_start_date, lesson_plan_id")
      .gt("week_start_date", changedWeek)
      .or(`lesson_plan_id.eq.${oldLessonPlanId},lesson_plan_id.eq.${lessonPlanId}`)
      .order("week_start_date");

    if (futureWeeks && futureWeeks.length > 0) {
      // Group by week to do swaps per week
      const byWeek = new Map<string, typeof futureWeeks>();
      for (const a of futureWeeks) {
        if (!byWeek.has(a.week_start_date)) byWeek.set(a.week_start_date, []);
        byWeek.get(a.week_start_date)!.push(a);
      }

      for (const [, weekAssignments] of byWeek) {
        const hasOld = weekAssignments.find((a) => a.lesson_plan_id === oldLessonPlanId);
        const hasNew = weekAssignments.find((a) => a.lesson_plan_id === lessonPlanId);

        // Swap them
        if (hasOld && hasNew) {
          await supabase
            .from("weekly_lesson_assignments")
            .update({ lesson_plan_id: lessonPlanId, is_permanent_change: true })
            .eq("id", hasOld.id);
          await supabase
            .from("weekly_lesson_assignments")
            .update({ lesson_plan_id: oldLessonPlanId, is_permanent_change: true })
            .eq("id", hasNew.id);
        } else if (hasOld) {
          // Only old exists, change it to new
          await supabase
            .from("weekly_lesson_assignments")
            .update({ lesson_plan_id: lessonPlanId, is_permanent_change: true })
            .eq("id", hasOld.id);
        } else if (hasNew) {
          // Only new exists, change it to old
          await supabase
            .from("weekly_lesson_assignments")
            .update({ lesson_plan_id: oldLessonPlanId, is_permanent_change: true })
            .eq("id", hasNew.id);
        }
      }
    }
  }

  revalidatePath("/schedule");
  revalidatePath("/dashboard");
  revalidatePath("/lesson-plans/assignments");
  return { success: true };
}

/**
 * Create a new weekly assignment
 */
export async function createWeeklyAssignment(
  instructorId: string,
  lessonPlanId: string,
  weekStartDate: string,
  isPermanentChange: boolean = false
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("weekly_lesson_assignments")
    .insert({
      instructor_id: instructorId,
      lesson_plan_id: lessonPlanId,
      week_start_date: weekStartDate,
      is_permanent_change: isPermanentChange,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating assignment:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/schedule");
  revalidatePath("/dashboard");
  revalidatePath("/lesson-plans/assignments");
  return { success: true, data };
}

/**
 * Delete a weekly assignment
 */
export async function deleteWeeklyAssignment(assignmentId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("weekly_lesson_assignments")
    .delete()
    .eq("id", assignmentId);

  if (error) {
    console.error("Error deleting assignment:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/schedule");
  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Mark equipment as distributed to instructor
 * This triggers the equipment confirmation flow for the instructor
 */
export async function distributeEquipmentToInstructor(
  assignmentId: string,
  lessonPlanId: string
) {
  const supabase = await createClient();

  // Update assignment to mark equipment as distributed
  const { error: updateError } = await supabase
    .from("weekly_lesson_assignments")
    .update({
      equipment_distributed: true,
      equipment_distributed_at: new Date().toISOString(),
      lesson_plan_id: lessonPlanId, // Update lesson plan if changed
    })
    .eq("id", assignmentId);

  if (updateError) {
    console.error("Error marking equipment as distributed:", updateError);
    return { success: false, error: updateError.message };
  }

  // Get assignment details to create confirmations
  const { data: assignment, error: fetchError } = await supabase
    .from("weekly_lesson_assignments")
    .select("instructor_id, lesson_plan_id")
    .eq("id", assignmentId)
    .single();

  if (fetchError || !assignment) {
    return { success: false, error: "Assignment not found" };
  }

  // Delete existing confirmations for this assignment (in case of re-distribution)
  await supabase
    .from("equipment_confirmations")
    .delete()
    .eq("assignment_id", assignmentId);

  // Get equipment for the lesson plan
  const { data: equipmentItems } = await supabase
    .from("lesson_plan_equipment")
    .select("equipment_id, quantity")
    .eq("lesson_plan_id", lessonPlanId);

  if (equipmentItems && equipmentItems.length > 0) {
    // Create confirmation records
    const confirmations = equipmentItems.map((item) => ({
      assignment_id: assignmentId,
      instructor_id: assignment.instructor_id,
      equipment_id: item.equipment_id,
      expected_quantity: item.quantity,
      received_quantity: null,
      is_confirmed: false,
    }));

    const { error: insertError } = await supabase
      .from("equipment_confirmations")
      .insert(confirmations);

    if (insertError) {
      console.error("Error creating confirmations:", insertError);
      return { success: false, error: insertError.message };
    }
  }

  revalidatePath("/equipment-distribution");
  revalidatePath("/today");
  return { success: true };
}

/**
 * Add extra equipment that the instructor received but wasn't in the original list
 */
export async function addExtraEquipment(
  assignmentId: string,
  instructorId: string,
  equipmentId: string,
  receivedQuantity: number,
  notes?: string
) {
  const supabase = await createClient();

  // Create a new confirmation record for extra equipment
  const { data, error } = await supabase
    .from("equipment_confirmations")
    .insert({
      assignment_id: assignmentId,
      instructor_id: instructorId,
      equipment_id: equipmentId,
      expected_quantity: 0, // לא היה צפוי
      received_quantity: receivedQuantity,
      is_confirmed: true, // מיד מאושר
      confirmed_at: new Date().toISOString(),
      notes: notes || null,
      is_extra: true, // ציוד נוסף
    })
    .select(
      `
      *,
      equipment:equipment(id, name)
    `
    )
    .single();

  if (error) {
    console.error("Error adding extra equipment:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/my-lesson-plan");
  revalidatePath("/today");
  return { success: true, data };
}
