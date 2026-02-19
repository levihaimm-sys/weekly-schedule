export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded-xl bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl bg-muted/50 p-6 h-28" />
        ))}
      </div>
      <div className="rounded-2xl bg-muted/50 p-6 h-64" />
    </div>
  );
}
