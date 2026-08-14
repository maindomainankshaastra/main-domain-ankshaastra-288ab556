
/**
 * NUMEROLOGY CALCULATIONS (Chaldean system)
 * First Name Number, Full Name Number, and Full Name Compound Number —
 * the three name-derived numbers the rest of the engine depends on.
 *
 * Mulank / Bhagyank (DOB-derived numbers) live in lo-shu.ts, not here,
 * since they're needed by the Lo Shu grid construction too.
 */

import { reduceToSingleDigit } from "./lo-shu";

/**
 * Chaldean letter-to-number chart. Note: 9 is never assigned to a letter
 * in the Chaldean system (considered a master/sacred number).
 */
export const CHALDEAN_CHART: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

/**
 * Sum the Chaldean values of every letter in a name (spaces and
 * non-letters ignored). This is the RAW, un-reduced total — needed as-is
 * for the Full Name Compound Number lookup (compound-table.ts).
 */
export function chaldeanRawSum(name: string): number {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, "").split("");
  return letters.reduce((sum, letter) => sum + (CHALDEAN_CHART[letter] ?? 0), 0);
}

/**
 * First Name Number = the person's first name only, Chaldean sum reduced
 * to a single digit (1-9).
 * @param firstName e.g. "Bindhu"
 */
export function getFirstNameNumber(firstName: string): number {
  return reduceToSingleDigit(chaldeanRawSum(firstName));
}

/**
 * Full Name Compound Number = the RAW (un-reduced) Chaldean sum of the
 * entire full name (first + middle + last, as applicable). This is the
 * number looked up directly in compound-table.ts — do NOT reduce it
 * before that lookup.
 * @param fullName e.g. "Bindhu Sree Reddy"
 */
export function getFullNameCompoundNumber(fullName: string): number {
  return chaldeanRawSum(fullName);
}

/**
 * Full Name Number = the full name's compound number reduced to a single
 * digit (1-9). This is the number used for the Friendship Table lookup
 * (getRelation(mulank/bhagyank, fullNameNumber)) — different from the
 * Compound Number itself, which stays un-reduced.
 * @param fullName e.g. "Bindhu Sree Reddy"
 */
export function getFullNameNumber(fullName: string): number {
  return reduceToSingleDigit(getFullNameCompoundNumber(fullName));
}

/**
 * Restricted numbers per the client's rule-book: 4 (Rahu), 8 (Saturn),
 * 9 (Mars). A name-number in this set triggers HR-07/08/09 regardless of
 * its friendship-table relation.
 */
export const RESTRICTED_NUMBERS: Record<number, string> = {
  4: "Rahu",
  8: "Saturn",
  9: "Mars",
};

export function isRestrictedNumber(nameNumber: number): boolean {
  return nameNumber in RESTRICTED_NUMBERS;
}
