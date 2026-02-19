export default function InstructorLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded-xl bg-muted" />
      <div className="h-5 w-32 rounded-lg bg-muted" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl bg-muted/50 p-6 space-y-3">
            <div className="h-6 w-24 rounded-lg bg-muted" />
            <div className="h-5 w-40 rounded-lg bg-muted" />
            <div className="h-4 w-32 rounded-lg bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
