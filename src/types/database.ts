export interface Instructor {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  rotation_order: number | null;
}

export interface Location {
  id: string;
  name: string;
  city: string;
  street: string | null;
  age_group: string | null;
  notes: string | null;
}

export interface RecurringSchedule {
  id: string;
  location_id: string;
  instructor_id: string;
  day_of_week: number;
  start_time: string;
  group_name: string | null;
}

export interface Lesson {
  id: string;
  recurring_item_id: string | null;
  location_id: string | null;
  instructor_id: string | null;
  substitute_instructor_id: string | null;
  lesson_date: string;
  start_time: string;
  status: string;
  change_notes: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  role: "admin" | "instructor";
  instructor_id: string | null;
  display_name: string;
  phone: string | null;
  email: string | null;
  created_at: string;
}

export interface Signature {
  id: string;
  lesson_id: string;
  signer_name: string;
  signer_role: string;
  signature_url: string;
  signed_at: string;
}

export interface MonthlyReport {
  id: string;
  instructor_id: string;
  month: number;
  year: number;
  pdf_url: string | null;
  generated_at: string;
}

// Joined types for queries
export interface LessonWithDetails extends Lesson {
  instructor: Pick<Instructor, "id" | "full_name"> | null;
  substitute_instructor: Pick<Instructor, "id" | "full_name"> | null;
  location: Pick<Location, "id" | "name" | "city" | "street" | "age_group"> | null;
  signature: Pick<Signature, "id" | "signer_name" | "signed_at"> | null;
}

export interface RecurringScheduleWithDetails extends RecurringSchedule {
  instructor: Pick<Instructor, "id" | "full_name">;
  location: Pick<Location, "id" | "name" | "city" | "street" | "age_group">;
}

// =============================================
// LESSON PLANS SYSTEM (מערכות שיעור)
// =============================================

export interface LessonPlan {
  id: string;
  week_number: number;
  name: string;
  category: string;
  pdf_path: string | null;
  content: string | null;
  playlist_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Equipment {
  id: string;
  name: string;
  created_at: string;
}

export interface LessonPlanEquipment {
  id: string;
  lesson_plan_id: string;
  equipment_id: string;
  quantity: number;
  equipment_type: 'main' | 'track' | 'stamp';
  created_at: string;
}

export interface WeeklyLessonAssignment {
  id: string;
  instructor_id: string;
  lesson_plan_id: string;
  week_start_date: string;
  is_permanent_change: boolean;
  created_at: string;
  updated_at: string;
}

export interface EquipmentConfirmation {
  id: string;
  assignment_id: string;
  instructor_id: string;
  equipment_id: string;
  expected_quantity: number;
  received_quantity: number | null;
  is_confirmed: boolean;
  confirmed_at: string | null;
  notes: string | null;
  created_at: string;
  is_extra: boolean;
}

// =============================================
// SCHEDULE CHANGE SEEN (סימון שינויים כנראו)
// =============================================

export interface ScheduleChangeSeen {
  id: string;
  lesson_id: string;
  seen_at: string;
}

// =============================================
// TASKS SYSTEM (משימות)
// =============================================

export interface Task {
  id: string;
  description: string;
  urgency: 'low' | 'normal' | 'urgent';
  assigned_to: string;
  created_by: string;
  due_date: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface TaskWithProfiles extends Task {
  assignee: Pick<Profile, 'id' | 'display_name'>;
  creator: Pick<Profile, 'id' | 'display_name'>;
}

// Joined types for lesson plans queries
export interface LessonPlanWithEquipment extends LessonPlan {
  equipment: Array<{
    equipment_id: string;
    equipment_name: string;
    quantity: number;
    equipment_type: 'main' | 'track' | 'stamp';
  }>;
}

export interface WeeklyLessonAssignmentWithDetails extends WeeklyLessonAssignment {
  instructor: Pick<Instructor, "id" | "full_name">;
  lesson_plan: Pick<LessonPlan, "id" | "name" | "category" | "pdf_path">;
  equipment_confirmations: EquipmentConfirmation[];
}

export interface EquipmentConfirmationWithDetails extends EquipmentConfirmation {
  equipment: Pick<Equipment, "id" | "name">;
  assignment: {
    week_start_date: string;
    lesson_plan: Pick<LessonPlan, "name">;
  };
}
