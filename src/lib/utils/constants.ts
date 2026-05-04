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

export const EMPLOYMENT_TYPE = {
  permanent: "קבוע",
  temporary: "זמני",
} as const;

export type EmploymentType = keyof typeof EMPLOYMENT_TYPE;

export const CLIENTS = ["טומשין", "טומשין כצנלסון", "עיריית הוד השרון", "אופק", "ינוקא"] as const;

export type Client = (typeof CLIENTS)[number];

export const CLIENT_CITIES: Record<string, string[]> = {
  "טומשין": ["פת", "גבעתיים", "ראש העין", "באר יעקב"],
  "טומשין כצנלסון": ["גבעתיים כצנלסון"],
  "עיריית הוד השרון": ["הוד השרון"],
  "אופק": ["נחל שורק"],
  "ינוקא": ["נס ציונה"],
};

export const CITY_TO_CLIENT: Record<string, string> = {
  "פת": "טומשין",
  "גבעתיים": "טומשין",
  "ראש העין": "טומשין",
  "באר יעקב": "טומשין",
  "גבעתיים כצנלסון": "טומשין כצנלסון",
  "הוד השרון": "עיריית הוד השרון",
  "נחל שורק": "אופק",
  "נס ציונה": "ינוקא",
};
