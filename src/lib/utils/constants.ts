export const DAYS_HEBREW = [
  "יום ראשון",
  "יום שני",
  "יום שלישי",
  "יום רביעי",
  "יום חמישי",
  "יום שישי",
  "שבת",
] as const;

export const DAYS_SHORT = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"] as const;

export const LESSON_STATUS = {
  scheduled: "מתוכנן",
  completed: "הושלם",
  cancelled: "בוטל",
  substitute: "מחליף",
} as const;

export type LessonStatus = keyof typeof LESSON_STATUS;

export const ROLES = {
  admin: "מנהל",
  instructor: "מדריך",
} as const;

export type UserRole = keyof typeof ROLES;

export const INSTRUCTOR_REQUEST_TYPES = {
  absence: "חיסור",
  lateness: "איחור צפוי",
  other: "הודעה",
} as const;

export type InstructorRequestType = keyof typeof INSTRUCTOR_REQUEST_TYPES;

export const INSTRUCTOR_STATUS = {
  active: "פעיל",
  substitute: "משלים",
  inactive: "לא פעיל",
} as const;

export type InstructorStatusType = keyof typeof INSTRUCTOR_STATUS;
