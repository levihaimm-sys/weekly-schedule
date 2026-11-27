// The WhatsApp section's menu: shown in weekly-schedule's sidebar, and as a
// strip at the top of the bot pages on phones. No server code here, so the
// (client) sidebar can import it.

export type BotSpace = "personal" | "business";
export type NavItem = { href: string; label: string; icon: string; count?: boolean };

export const NAV: Record<BotSpace, NavItem[]> = {
  personal: [
    { href: "/bot", label: "סוף היום", icon: "sun", count: true },
    { href: "/bot/topics", label: "תמונת מצב", icon: "topics" },
    { href: "/bot/ask", label: "שאל את הבוט", icon: "ask" },
    { href: "/bot/chats", label: "צ'אטים", icon: "chats" },
    { href: "/bot/preferences", label: "מה מעניין אותי", icon: "prefs" },
  ],
  business: [
    { href: "/bot", label: "סוף היום", icon: "sun", count: true },
    { href: "/bot/topics", label: "תמונת מצב", icon: "topics" },
    { href: "/bot/ask", label: "שאל את הבוט", icon: "ask" },
    { href: "/bot/chats", label: "אנשי קשר", icon: "chats" },
    { href: "/bot/learn", label: "הכרת העסק", icon: "learn" },
    { href: "/bot/preferences", label: "מה מעניין אותי", icon: "prefs" },
  ],
};

// Sidebar only: the less used pages.
export const NAV_EXTRA: NavItem[] = [
  { href: "/bot/connection", label: "חיבור לוואטסאפ", icon: "plug" },
  { href: "/bot/messages", label: "הודעות אחרונות", icon: "list" },
];

export const BOT_SPACE_COOKIE = "bot_space";
