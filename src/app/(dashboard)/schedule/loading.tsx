export default function ScheduleLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-36 rounded-lg bg-muted" />
      <div className="h-14 rounded-lg bg-muted/60" />
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="h-20 rounded-lg bg-muted/50" />
        ))}
      </div>
    </div>
  );
}
