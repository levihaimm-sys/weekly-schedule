export default function WeeklyScheduleLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-36 rounded-lg bg-muted" />
        <div className="h-8 w-24 rounded-lg bg-muted/60" />
      </div>
      <div className="h-10 rounded-lg bg-muted/60" />
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-muted/50" />
        ))}
      </div>
    </div>
  );
}
