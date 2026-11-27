import { AppShell } from "@/bot/components/AppShell";
import { requireSpace } from "@/bot/lib/space";
import { AskChat } from "./AskChat";

export default async function AskPage() {
  const { space } = await requireSpace();
  return (
    <AppShell current="/bot/ask">
      <main className="mx-auto max-w-3xl px-4 md:px-8 py-5 md:py-8 space-y-5">
        <div>
          <h1 className="text-2xl font-bold">שאל את הבוט</h1>
          <p className="text-sm text-muted mt-0.5">
            {space === "business" ? "עונה רק מתוך השיחות העסקיות." : "עונה רק מתוך השיחות הפרטיות."}
          </p>
        </div>
        {/* key: a new world starts a fresh conversation */}
        <AskChat key={space} space={space} />
      </main>
    </AppShell>
  );
}
