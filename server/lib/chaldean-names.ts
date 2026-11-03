/**
 * Pure validation helpers for AI-generated baby names.
 * The AI is NEVER trusted for arithmetic or spelling rules: every candidate
 * is re-checked here and dropped if it fails.
 */

export const CHALDEAN: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

export function chaldeanTotal(name: string): number {
  let sum = 0;
  for (const ch of name.toUpperCase()) sum += CHALDEAN[ch] ?? 0;
  return sum;
}

export function reduceToSingleDigit(n: number): number {
  let x = n;
  while (x > 9) x = String(x).split("").reduce((a, d) => a + Number(d), 0);
  return x;
}

/** Collapse runs of the same letter: "PRAANNAV" -> "PRANAV". */
export function collapseRepeats(s: string): string {
  return s.toUpperCase().replace(/(.)\1+/g, "$1");
}

export interface Candidate {
  base: string;     // the original, normally spelled name, e.g. "Pranav"
  spelling: string; // numerology spelling, e.g. "Praanav"
  meaning: string;
  score?: number;
}

export interface Rules {
  target: number;          // 1..9 (reduced Chaldean total)
  prefixes: string[];      // allowed starting alphabets, e.g. ["Ni","Nee","N"]
  maxLength?: number;
}

export type Reject =
  | "not-letters" | "bad-start" | "too-long" | "wrong-number"
  | "added-letters" | "weird-repeat" | "too-many-repeats" | "duplicate";

/**
 * Spelling rule: only letters ALREADY in the base name may be repeated.
 * - removing repeats must give back exactly the base name (no new letters, none removed)
 * - at most ONE extra letter vs the base (PRANAV -> PRAANAV ok, PRAANNAV not)
 * - no letter more than twice in a row
 */
export function checkSpelling(base: string, spelling: string): Reject | null {
  const b = base.toUpperCase(), s = spelling.toUpperCase();
  if (!/^[A-Z]+$/.test(b) || !/^[A-Z]+$/.test(s)) return "not-letters";
  if (/(.)\1\1/.test(s)) return "weird-repeat";
  if (collapseRepeats(s) !== collapseRepeats(b)) return "added-letters";
  if (s.length > b.length + 1) return "too-many-repeats";
  return null;
}

export function validateCandidate(c: Candidate, rules: Rules): Reject | null {
  const sp = c.spelling.trim();
  if (!/^[A-Za-z]+$/.test(sp)) return "not-letters";
  if (sp.length > (rules.maxLength ?? 10)) return "too-long";
  const starts = rules.prefixes.some((p) => sp.toUpperCase().startsWith(p.toUpperCase()));
  if (!starts) return "bad-start";
  const spellErr = checkSpelling(c.base.trim(), sp);
  if (spellErr) return spellErr;
  if (reduceToSingleDigit(chaldeanTotal(sp)) !== rules.target) return "wrong-number";
  return null;
}

export function filterCandidates(
  candidates: Candidate[],
  rules: Rules,
  alreadyHave: Set<string> = new Set(),
): { valid: Candidate[]; rejected: { c: Candidate; why: Reject }[] } {
  const valid: Candidate[] = [];
  const rejected: { c: Candidate; why: Reject }[] = [];
  const seen = new Set(alreadyHave);
  for (const c of candidates) {
    const key = c.spelling.trim().toUpperCase();
    if (seen.has(key)) { rejected.push({ c, why: "duplicate" }); continue; }
    const why = validateCandidate(c, rules);
    if (why) { rejected.push({ c, why }); continue; }
    seen.add(key);
    valid.push({ ...c, spelling: capitalise(c.spelling.trim()), base: capitalise(c.base.trim()) });
  }
  return { valid, rejected };
}

export function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
