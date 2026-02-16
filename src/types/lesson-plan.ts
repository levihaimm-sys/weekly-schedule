/**
 * Structured lesson plan data type
 * Parsed from HTML and stored as clean JSON
 */

export interface LessonPlanSection {
  title: string;
  content: string;
}

export interface LessonPlanEquipment {
  name: string;
  quantity: number;
}

export interface StructuredLessonPlan {
  id: string;
  name: string;
  duration?: string; // e.g., "45-60 דקות" - optional, we might want to hide this
  goals?: string[]; // מטרות המפגש
  equipment: LessonPlanEquipment[];
  sections: LessonPlanSection[]; // All other sections (קשת בעגן, חלק מרכזי, etc.)
  notes?: string; // Additional notes
  playlist_url?: string | null;
  pdf_path?: string | null;
}
