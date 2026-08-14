/**
 * COMPOUND NUMBER REFERENCE TABLE
 * Source: Ankshaastra "Name Check Output" reference doc (Himansshu Agarwal).
 *
 * The Full Name Compound Number (raw, un-reduced Chaldean sum of the full
 * name) is looked up here to find its tier. Table only goes up to 100 —
 * see getCompoundTier() for the fallback behaviour above that.
 */

export type CompoundTier = "excellent" | "good" | "neutral" | "conditional" | "avoid";

export const COMPOUND_TABLE: Record<CompoundTier, number[]> = {
  excellent: [1, 3, 6, 17, 19, 23],
  good: [
    5, 10, 15, 21, 24, 25, 27, 32, 35, 36, 37, 39, 41, 42, 45, 48, 50, 51, 60,
    63, 66, 72, 100,
  ],
  neutral: [
    30, 46, 54, 57, 61, 65, 68, 69, 73, 75, 78, 81, 82, 84, 86, 87, 90, 91,
    93, 95, 96,
  ],
  conditional: [
    7, 8, 9, 11, 14, 20, 22, 28, 31, 33, 34, 38, 43, 47, 52, 53, 55, 56, 59,
    62, 70, 71, 74, 77, 79, 83, 88, 92, 97, 99,
  ],
  avoid: [4, 12, 13, 16, 18, 26, 29, 40, 44, 49, 58, 64, 67, 76, 80, 85, 89, 94, 98],
};

/**
 * CONFIRMED with client: the table only covers 1-100. For compound numbers
 * above 100, reduce digit-by-digit down to a DOUBLE-DIGIT number (10-99) —
 * NOT all the way to a single digit — then look that number up in the
 * table. E.g. 138 -> 1+3+8 = 12 -> already double-digit, stop there.
 * A 3+ digit intermediate result is reduced again until it's 2 digits.
 */
function reduceToDoubleDigit(n: number): number {
  let value = n;
  while (value > 99) {
    value = String(value)
      .split("")
      .reduce((sum, ch) => sum + Number(ch), 0);
  }
  return value;
}

/**
 * Look up which tier a compound number falls into. Numbers above 100 are
 * first reduced to a double-digit number (see reduceToDoubleDigit above)
 * before the table lookup.
 */
export function getCompoundTier(compoundNumber: number): CompoundTier {
  const lookupNumber = compoundNumber > 100 ? reduceToDoubleDigit(compoundNumber) : compoundNumber;

  for (const tier of Object.keys(COMPOUND_TABLE) as CompoundTier[]) {
    if (COMPOUND_TABLE[tier].includes(lookupNumber)) {
      return tier;
    }
  }
  throw new Error(
    `Compound number ${compoundNumber} (reduced to ${lookupNumber}) is not covered by COMPOUND_TABLE — ` +
      `this shouldn't happen for values 1-100; check the input.`
  );
}
