// The WhatsApp bot pages run next to the bot's database (Ireland). The rest of
// the app runs next to its own database (Singapore, see vercel.json).
export const preferredRegion = "dub1";

export default function BotLayout({ children }: { children: React.ReactNode }) {
  return children;
}
