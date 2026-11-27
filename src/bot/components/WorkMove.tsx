import { setWork } from "@/bot/actions/work";
import { btn } from "@/bot/components/Inbox";

// On items from the personal number: move to the nonprofit space ("זה עבודה")
// or back to the private one ("זה פרטי"). The bot learns from each click.
export function WorkMoveButton({ table, id, work }: { table: "tasks" | "topics"; id: string; work: boolean | null | undefined }) {
  const toWork = work !== true;
  return (
    <form action={setWork}>
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="work" value={String(toWork)} />
      <button className={btn.quiet} title={toWork ? "יעבור לעמותה, והבוט ילמד" : "יחזור לפרטי, והבוט ילמד"}>
        {toWork ? "זה עבודה ← לעמותה" : "זה פרטי ← לפרטי"}
      </button>
    </form>
  );
}

// Small tag on personal-number items shown in the nonprofit space.
export function FromPersonalTag() {
  return <span className="rounded-md bg-sub border border-line px-1.5 py-0.5 text-xs font-semibold">מהווצאפ הפרטי</span>;
}
