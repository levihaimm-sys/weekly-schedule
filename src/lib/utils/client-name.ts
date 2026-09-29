/**
 * Resolves a lesson's real client: the lesson's own client_name (set directly on
 * one-off lessons that have no recurring_schedule row), or the client_name of the
 * recurring_schedule row it was generated from (set on lessons created from the
 * fixed/weekly schedule). Returns null if neither is available.
 */
export function resolveLessonClient(
  lessonClientName: string | null | undefined,
  recurringItemId: string | null | undefined,
  recurringClientMap: Map<string, string>
): string | null {
  const trimmedLessonName = lessonClientName?.trim();
  if (trimmedLessonName) return trimmedLessonName;
  if (recurringItemId) return recurringClientMap.get(recurringItemId)?.trim() || null;
  return null;
}
