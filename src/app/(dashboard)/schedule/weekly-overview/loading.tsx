export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-36 rounded-xl bg-muted" />
      <div className="h-12 rounded-xl bg-muted/60" />
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-muted/50" />
        ))}
      </div>
    </div>
  );
}
