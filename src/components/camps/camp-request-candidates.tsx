"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCircle2, RotateCcw, X, Plus, Loader2 } from "lucide-react";
import {
  addRequestCandidate,
  confirmRequestCandidate,
  unconfirmRequestCandidate,
  removeRequestCandidate,
} from "@/lib/actions/camps";
import type { CampRequestWithCandidates, Instructor } from "@/types/database";

// Add any number of candidate instructors to a camp day and confirm as many as needed —
// staffing here is per workday, not per group/lesson, so confirming isn't exclusive to one
// candidate the way the staffing module's per-need confirmation is.
export function RequestCandidates({ request, instructors }: { request: CampRequestWithCandidates; instructors: Instructor[] }) {
  const router = useRouter();
  const [selectedInstructorId, setSelectedInstructorId] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const instructorById = new Map(instructors.map((i) => [i.id, i]));
  const candidateInstructorIds = new Set(request.candidates.map((c) => c.instructor_id));
  const availableInstructors = instructors.filter((i) => i.is_active && !candidateInstructorIds.has(i.id));

  async function handleAdd() {
    if (!selectedInstructorId) return;
    setError(null);
    setPendingId("new");
    const result = await addRequestCandidate(request.id, selectedInstructorId);
    setPendingId(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSelectedInstructorId("");
    router.refresh();
  }

  async function handleConfirm(candidateId: string) {
    setPendingId(candidateId);
    await confirmRequestCandidate(candidateId);
    setPendingId(null);
    router.refresh();
  }

  async function handleUnconfirm(candidateId: string) {
    setPendingId(candidateId);
    await unconfirmRequestCandidate(candidateId);
    setPendingId(null);
    router.refresh();
  }

  async function handleRemove(candidateId: string) {
    setPendingId(candidateId);
    await removeRequestCandidate(candidateId);
    setPendingId(null);
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5">
        {request.candidates.map((c) => (
          <span
            key={c.id}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs whitespace-nowrap ${
              c.is_confirmed ? "border-green-200 bg-green-50 text-green-800" : "border-border bg-muted/30 text-muted-foreground"
            }`}
          >
            {instructorById.get(c.instructor_id)?.full_name ?? "?"}
            {c.is_confirmed ? (
              <>
                <CheckCircle2 size={12} className="text-green-700" />
                <button onClick={() => handleUnconfirm(c.id)} title="בטל אישור (החזר למועמד בלבד)" className="hover:text-red-600">
                  {pendingId === c.id ? <Loader2 size={11} className="animate-spin" /> : <RotateCcw size={11} />}
                </button>
              </>
            ) : (
              <button onClick={() => handleConfirm(c.id)} title="אשר מדריך/ה ליום" className="hover:text-green-700">
                {pendingId === c.id ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
              </button>
            )}
            <button onClick={() => handleRemove(c.id)} title="הסר" className="hover:text-red-600">
              <X size={11} />
            </button>
          </span>
        ))}

        <span className="inline-flex items-center gap-1">
          <select
            value={selectedInstructorId}
            onChange={(e) => setSelectedInstructorId(e.target.value)}
            className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
          >
            <option value="">הוסף מועמד/ת...</option>
            {availableInstructors.map((i) => (
              <option key={i.id} value={i.id}>
                {i.full_name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!selectedInstructorId || pendingId === "new"}
            className="rounded-lg border border-border p-1 text-muted-foreground hover:bg-muted disabled:opacity-50"
            title="הוסף מועמד/ת"
          >
            {pendingId === "new" ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
          </button>
        </span>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
