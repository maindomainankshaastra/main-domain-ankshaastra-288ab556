/** Chaldean chart (no 9). Same values as src/lib/name-check/numerology.ts. */
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

export function letterNumber(letter: string): number | null {
  return CHALDEAN[letter.toUpperCase()] ?? null;
}

/** Other letters that share the Chaldean number of `letter` (the letter itself is excluded). */
export function numerologyAlternatives(letter: string): string[] {
  const n = letterNumber(letter);
  if (n === null) return [];
  return Object.entries(CHALDEAN)
    .filter(([l, v]) => v === n && l !== letter.toUpperCase())
    .map(([l]) => l);
}
