
/**
 * FRIENDSHIP TABLE
 * Source: Ankshaastra "Name Check Output" reference doc (Himansshu Agarwal).
 *
 * The same table is used for BOTH lookups:
 *   - Mulank (core number)  -> relation of First/Full Name Number
 *   - Bhagyank (core number) -> relation of First/Full Name Number
 *
 * Key = the core number (Mulank or Bhagyank), 1-9.
 * Value = which name-numbers are Friendly / Neutral / Enemy to that core number.
 */

export type Relation = "friendly" | "neutral" | "enemy";

export interface FriendshipRow {
  friendly: number[];
  neutral: number[];
  enemy: number[];
}

export const FRIENDSHIP_TABLE: Record<number, FriendshipRow> = {
  1: { friendly: [1, 2, 3, 5, 6, 9], neutral: [4, 7], enemy: [8] },
  2: { friendly: [1, 2, 3, 5], neutral: [6, 7], enemy: [4, 8, 9] },
  3: { friendly: [1, 2, 3, 5], neutral: [4, 7, 8, 9], enemy: [6] },
  4: { friendly: [1, 5, 6, 7], neutral: [3], enemy: [2, 4, 8, 9] },
  5: { friendly: [1, 2, 3, 5, 6], neutral: [4, 7, 8, 9], enemy: [] },
  6: { friendly: [1, 4, 5, 6, 7], neutral: [2, 8, 9], enemy: [3] },
  7: { friendly: [1, 3, 4, 5, 6], neutral: [2, 7, 8, 9], enemy: [] },
  8: { friendly: [3, 5, 6, 7], neutral: [9], enemy: [1, 2, 4, 8] },
  9: { friendly: [1, 3, 5], neutral: [6, 7, 8, 9], enemy: [2, 4] },
};

/**
 * Look up how a name-number (First Name Number or Full Name Number)
 * relates to a core number (Mulank or Bhagyank).
 *
 * Example: getRelation(mulank, firstNameNumber)
 */
export function getRelation(coreNumber: number, nameNumber: number): Relation {
  const row = FRIENDSHIP_TABLE[coreNumber];
  if (!row) {
    throw new Error(`FRIENDSHIP_TABLE has no row for core number ${coreNumber} (expected 1-9)`);
  }
  if (row.friendly.includes(nameNumber)) return "friendly";
  if (row.enemy.includes(nameNumber)) return "enemy";
  // Everything else (including numbers not explicitly listed, and the
  // explicit "neutral" list) falls back to neutral.
  return "neutral";
}
