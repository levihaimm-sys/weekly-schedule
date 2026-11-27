// A chat or person is "work" when the user marked it, or (unmarked) when the
// name contains one of the work keywords set on the preferences page.
export function nameIsWork(name: string | null | undefined, keywords: string[]): boolean {
  if (!name) return false;
  return keywords.some((k) => k && name.includes(k));
}

export function isWork(marked: boolean | null | undefined, names: (string | null | undefined)[], keywords: string[]): boolean {
  if (marked != null) return marked;
  return names.some((n) => nameIsWork(n, keywords));
}
