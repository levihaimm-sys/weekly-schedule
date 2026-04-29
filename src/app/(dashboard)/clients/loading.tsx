export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-32 rounded-lg bg-muted animate-pulse" />
      <div className="rounded-xl border border-border bg-background p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  );
}
