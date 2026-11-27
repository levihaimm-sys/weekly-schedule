// Small stroke icons for the menu and buttons.
const PATHS: Record<string, string> = {
  inbox: "M4 13h4l1.5 3h5L16 13h4M5 5h14l1 8v6H4v-6z",
  tasks: "M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2",
  topics: "M4 7l8-4 8 4-8 4zM4 12l8 4 8-4M4 17l8 4 8-4",
  ask: "M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8zM18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z",
  chats: "M4 5h16v11H9l-5 4zM8 9h8M8 12h5",
  prefs: "M4 7h10M18 7h2M4 17h4M12 17h8M16 5v4M10 15v4",
  plug: "M9 3v5M15 3v5M7 8h10v3a5 5 0 01-10 0zM12 16v5",
  list: "M5 6h14M5 12h14M5 18h9",
  logout: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10",
  search: "M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4",
  updown: "M8 9l4-4 4 4M8 15l4 4 4-4",
  check: "M5 12l5 5 9-10",
  x: "M6 6l12 12M18 6L6 18",
  reply: "M10 8L5 12l5 4M5 12h9a5 5 0 015 5v1",
  back: "M10 6l6 6-6 6",
  sun: "M12 4V2M12 22v-2M4 12H2M22 12h-2M6 6L4.5 4.5M19.5 19.5L18 18M6 18l-1.5 1.5M19.5 4.5L18 6M12 8a4 4 0 100 8 4 4 0 000-8z",
  learn: "M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0012 3z",
  clock:"M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 2",
};

export function Icon({ name, className = "size-[18px]" }: { name: keyof typeof PATHS | string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={PATHS[name] ?? ""} />
    </svg>
  );
}
