/**
 * Step 5: for every name the customer chose, the numerologist needs
 *   - the name and its total,
 *   - how suitable it is (Yes / Moderate / No),
 *   - and, when it is not, a corrected spelling with its own total and number.
 *
 * A corrected spelling only repeats letters the name already has (the same rule as the name generator): one or two
 * letters doubled, never the first letter. Doubled vowels come first because they read naturally (Mivank ->
 * Mivaank); doubled consonants are the last resort. The first spelling the rule engine rates "good" wins, so the
 * correction is always the smallest change that works.
 */
import { analyseName, type Grade } from "@/lib/swar/nameSteps";

const isVowel = (c: string) => "aeiou".includes(c.toLowerCase());
const tidy = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

/** Spellings to try, in order: 1 vowel doubled, 1 consonant doubled, then 2 letters (vowel+vowel, vowel+consonant). */
export function correctionCandidates(name: string): string[] {
  const letters = [...name.trim()].filter((c) => /[A-Za-z]/.test(c));
  const n = letters.length;
  if (n < 2) return [];
  const same = (a: number, b: number) => letters[a].toLowerCase() === letters[b].toLowerCase();
  // a letter can be doubled unless it is the first one or already sits next to the same letter (no "aaa")
  const canDouble = (i: number) => i >= 1 && !same(i, i - 1) && (i + 1 >= n || !same(i, i + 1));
  const vowels: number[] = [];
  const consonants: number[] = [];
  for (let i = 1; i < n; i++) if (canDouble(i)) (isVowel(letters[i]) ? vowels : consonants).push(i);

  const build = (idx: number[]) => letters.map((c, i) => (idx.includes(i) ? c + c : c)).join("");
  const pairs = (a: number[], b: number[], sameList: boolean) => {
    const out: number[][] = [];
    for (const i of a) for (const j of b) {
      if (sameList ? j <= i : false) continue;
      if (Math.abs(i - j) <= 1) continue; // never double two neighbours (Mivaannk)
      out.push(i < j ? [i, j] : [j, i]);
    }
    return out;
  };
  const tries: number[][] = [
    ...vowels.map((i) => [i]), ...consonants.map((i) => [i]),
    ...pairs(vowels, vowels, true), ...pairs(vowels, consonants, false),   // two doubled consonants (Vyyomm) look odd: never
  ];
  const seen = new Set<string>([tidy(letters.join(""))]);
  const out: string[] = [];
  for (const t of tries) {
    const w = tidy(build(t));
    if (!seen.has(w)) { seen.add(w); out.push(w); }
  }
  return out;
}

/** Words used for the Name Suitability column (Step 5 and the report): highly suitable / acceptable / not recommended. */
export const SUITABILITY: Record<Grade, string> = { good: "Yes", ok: "Moderate", avoid: "No" };

export interface NameSummary {
  name: string;
  total: number;
  number: number;
  /** How the rule engine rates the name. A correction is looked for whenever this is not "good". */
  grade: Grade;
  /** true only for "good" (no correction needed) */
  ok: boolean;
  error?: string;
  /** Smallest spelling change that makes the name suitable. null when the name is already fine or none was found. */
  corrected: { name: string; total: number; number: number } | null;
}

export function summariseName(dob: string, name: string, surname = ""): NameSummary {
  const a = analyseName(dob, name, surname);
  if (a.error) return { name, total: a.total, number: a.number, grade: a.grade, ok: false, error: a.error, corrected: null };
  const ok = a.grade === "good";
  const base = { name, total: a.total, number: a.number, grade: a.grade, ok };
  if (ok) return { ...base, corrected: null };
  for (const cand of correctionCandidates(name)) {
    const c = analyseName(dob, cand, surname);
    if (!c.error && c.grade === "good") return { ...base, corrected: { name: cand, total: c.total, number: c.number } };
  }
  return { ...base, corrected: null };
}
