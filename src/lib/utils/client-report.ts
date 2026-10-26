/**
 * Clients whose monthly report is grouped by coordinator (the lesson's contact_name)
 * first, then by city — they review the report per coordinator as well as per city.
 */
const CLIENTS_GROUPED_BY_COORDINATOR = new Set(["אפטר סקול"]);

export const NO_COORDINATOR = "ללא רכזת";

export function isGroupedByCoordinator(clientName: string): boolean {
  return CLIENTS_GROUPED_BY_COORDINATOR.has(clientName.trim());
}

/** "עדי 054-996-3602" → "עדי" — the report shows the coordinator's name only, no phone. */
export function coordinatorName(contact: string | null | undefined): string {
  const name = (contact ?? "").replace(/[\d\s\-+()]+$/, "").trim();
  return name || NO_COORDINATOR;
}

/**
 * The frame's display name in client reports. Location names often carry schedule notes
 * ("יוחנני א,ד,ה - 12:45ב,ג - 13:30"), so prefer the recurring row's group_name ("יוחנני"),
 * falling back to the first line of the location name for one-off lessons.
 */
export function frameName(groupName: string | null | undefined, locationName: string | null | undefined): string {
  const firstLine = (s: string | null | undefined) => (s ?? "").split("\n")[0].trim();
  return firstLine(groupName) || firstLine(locationName) || "—";
}

/** Sorts coordinators alphabetically, with lessons missing a coordinator last. */
export function compareCoordinators(a: string, b: string): number {
  if (a === b) return 0;
  if (a === NO_COORDINATOR) return 1;
  if (b === NO_COORDINATOR) return -1;
  return a.localeCompare(b, "he");
}
