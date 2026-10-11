// Generic framework *types* stored in the `framework` column — anything else there is
// actually a framework name that was typed into the wrong field.
const FRAMEWORK_TYPES = new Set(["גנים", "גן", "בי\"ס", "ביס", "בית ספר", "אין"]);

function clean(v: string | null | undefined): string {
  const t = v?.trim() ?? "";
  return t && t !== "אין" ? t : "";
}

// The framework name to show for a lesson: explicit name first, then a non-generic `framework`
// value, then the location's name.
export function resolveFrameworkName(lesson: {
  group_name?: string | null;
  framework_name?: string | null;
  framework?: string | null;
  location?: { name?: string | null } | null;
}): string {
  const fw = clean(lesson.framework);
  return (
    clean(lesson.group_name) ||
    clean(lesson.framework_name) ||
    (fw && !FRAMEWORK_TYPES.has(fw) ? fw : "") ||
    clean(lesson.location?.name)
  );
}
