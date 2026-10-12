// Sandbox ("סנדבוקס") mode for the fixed-schedule grid: every edit is applied to an in-browser
// copy of the board only — nothing here ever calls a server action or touches the DB.

export interface SandboxLocation {
  id: string;
  name: string;
  city: string;
  street: string | null;
  age_group: string | null;
}

export interface SandboxItem {
  id: string;
  day_of_week: number;
  start_time: string;
  group_name: string | null;
  address: string | null;
  client_name: string | null;
  contact_name: string | null;
  manager_name: string | null;
  manager_phone: string | null;
  framework: string | null;
  framework_name: string | null;
  field: string | null;
  lesson_duration: number | null;
  lessons_count: number | null;
  notes: string | null;
  instructor: { id: string; full_name: string } | null;
  location: SandboxLocation | null;
}

export type SandboxPatch = Partial<Omit<SandboxItem, "id">>;

export interface SandboxHandlers {
  update: (ids: string[], patch: SandboxPatch) => void;
  remove: (ids: string[]) => void;
  add: (item: Omit<SandboxItem, "id">) => void;
}

export function sandboxInstructor(
  instructors: { id: string; full_name: string }[],
  id: string
): SandboxItem["instructor"] {
  if (!id) return null;
  const found = instructors.find((i) => i.id === id);
  return found ? { id: found.id, full_name: found.full_name } : null;
}

// Matches an existing gan by name+city; a new name/city just becomes a local-only location
// (in the real board it would be created in the DB — here it never leaves the browser).
export function sandboxLocation(
  locations: { id: string; name: string; city: string; street?: string | null }[],
  name: string,
  city: string
): SandboxLocation {
  const n = name.trim();
  const c = city.trim();
  const found = locations.find(
    (l) => l.name.trim().toLowerCase() === n.toLowerCase() && l.city.trim().toLowerCase() === c.toLowerCase()
  );
  if (found) return { id: found.id, name: found.name, city: found.city, street: found.street ?? null, age_group: null };
  return { id: `sandbox-loc-${n}-${c}`, name: n, city: c, street: null, age_group: null };
}
