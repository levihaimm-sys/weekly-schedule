/**
 * Reads net pay ("נטו לתשלום") per employee out of the accountant's payslips PDF text.
 *
 * Input is page → reading-order lines (from /api/payslips/extract). Hebrew PDFs sometimes
 * come out in visual (reversed) order, so labels and names are checked both as-is and
 * reversed. A page is assigned to the employee whose every name word appears on it;
 * a page with no recognised name continues the previous employee's slip.
 */

export type PayslipResult = {
  /** person id → net pay */
  nets: Record<string, number>;
  /** pages where no known name was found and there was no previous slip to attach to */
  unmatchedPages: number[];
  /** ids whose slip was found but no net amount could be read */
  missingNet: string[];
};

const reverse = (s: string) => [...s].reverse().join("");

const NUM_RE = /\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?/g;

function numbersIn(line: string): number[] {
  return (line.match(NUM_RE) ?? []).map((n) => Number(n.replace(/,/g, ""))).filter((n) => n > 0);
}

function pickAmount(line: string): number | null {
  const nums = numbersIn(line);
  if (nums.length === 0) return null;
  // Prefer an amount written with agorot (e.g. 4,523.10); otherwise the largest number.
  const withDecimals = (line.match(NUM_RE) ?? []).filter((n) => n.includes("."));
  if (withDecimals.length > 0) return Number(withDecimals[0].replace(/,/g, ""));
  return Math.max(...nums);
}

function isNetLabel(line: string): boolean {
  const norm = line.replace(/\s+/g, " ");
  const both = norm + " | " + reverse(norm);
  return /נטו\s*ל?תשלום|תשלום\s*נטו/.test(both);
}

function findNet(lines: string[]): number | null {
  for (let i = 0; i < lines.length; i++) {
    if (!isNetLabel(lines[i])) continue;
    const same = pickAmount(lines[i]);
    if (same != null) return same;
    // Value printed on the line below the label.
    const next = lines[i + 1] ? pickAmount(lines[i + 1]) : null;
    if (next != null) return next;
  }
  return null;
}

function wordsOf(lines: string[]): Set<string> {
  const set = new Set<string>();
  for (const line of lines) {
    for (const variant of [line, reverse(line)]) {
      for (const w of variant.split(/[\s,.:;()"'\-/]+/)) if (w) set.add(w);
    }
  }
  return set;
}

export function parsePayslips(
  pages: string[][],
  people: Array<{ id: string; name: string }>
): PayslipResult {
  const candidates = people
    .map((p) => ({ id: p.id, tokens: p.name.trim().split(/\s+/).filter(Boolean) }))
    // One-word names (e.g. "חיים") would match the company name on every slip.
    .filter((p) => p.tokens.length > 1)
    // Longer names first so "גל סחיים" wins over a one-word name it contains.
    .sort((a, b) => b.tokens.length - a.tokens.length);

  const nets: Record<string, number> = {};
  const seen = new Set<string>();
  const unmatchedPages: number[] = [];
  let current: string | null = null;

  pages.forEach((lines, idx) => {
    const words = wordsOf(lines);
    const match = candidates.find((c) => c.tokens.every((t) => words.has(t)));
    if (match) current = match.id;
    if (!current) {
      unmatchedPages.push(idx + 1);
      return;
    }
    seen.add(current);
    if (nets[current] == null) {
      const net = findNet(lines);
      if (net != null) nets[current] = net;
    }
  });

  return {
    nets,
    unmatchedPages,
    missingNet: [...seen].filter((id) => nets[id] == null),
  };
}
