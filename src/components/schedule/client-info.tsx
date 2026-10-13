// Client / contact / kindergarten-teacher lines shown on schedule tiles when "הצג לקוח" is on.
export function ClientInfo({
  item,
  size = "sm",
}: {
  item: { client_name?: string | null; contact_name?: string | null; manager_name?: string | null };
  size?: "sm" | "base";
}) {
  const rows = [
    { label: "לקוח", value: item.client_name },
    { label: "איש קשר", value: item.contact_name },
    { label: "גננת", value: item.manager_name },
  ].filter((r) => r.value);
  if (rows.length === 0) return null;

  return (
    <div className={`mt-1 ${size === "base" ? "text-base" : "text-sm"} text-teal-700`}>
      {rows.map((r) => (
        <p key={r.label} className="leading-tight">
          <span className="text-teal-600/80">{r.label}:</span> <span className="font-medium">{r.value}</span>
        </p>
      ))}
    </div>
  );
}
