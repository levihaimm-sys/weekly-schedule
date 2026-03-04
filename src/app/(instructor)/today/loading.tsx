export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-36 rounded-xl bg-muted" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl bg-muted/50 h-24" />
      ))}
    </div>
  );
}
