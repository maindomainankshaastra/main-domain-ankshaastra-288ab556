
/**
 * LO SHU GRID
 * Construction method confirmed via client-shared reference:
 * https://www.occultscience.in/tools/numerology-calculator/
 *
 * Method:
 *  1. Take the DOB digits (DD/MM/YYYY), IGNORE any zeros.
 *  2. Driver Number (= Mulank) = day digits reduced to a single digit.
 *  3. Conductor Number (= Bhagyank) = all DOB digits (day+month+year)
 *     summed and reduced to a single digit.
 *  4. Combine: (original DOB digits, zeros dropped) + Driver + Conductor
 *     into one pool of digits, then place each into the fixed 3x3
 *     "turtle" grid position for that digit:
 *
 *         4 | 9 | 2
 *         3 | 5 | 7
 *         8 | 1 | 6
 *
 *  5. A digit is "present" if it appears >=1 time, "missing" if it never
 *     appears, "repeating" if it appears 2+ times.
 *
 * OPEN QUESTION (not yet confirmed by client): exact repetition count
 * needed to call a number "over-amplified" — assumed 2+ below as the
 * standard convention. If client confirms a different number (3 or 4),
 * change ONLY the OVER_AMPLIFICATION_THRESHOLD constant, nothing else.
 */

// Fixed Lo Shu "turtle" layout - which grid position each digit 1-9 occupies.
export const LO_SHU_POSITIONS: Record<number, [row: number, col: number]> = {
  4: [0, 0], 9: [0, 1], 2: [0, 2],
  3: [1, 0], 5: [1, 1], 7: [1, 2],
  8: [2, 0], 1: [2, 1], 6: [2, 2],
};

// TBD with client — currently assumed 2+ occurrences = over-amplified.
export const OVER_AMPLIFICATION_THRESHOLD = 2;

export interface LoShuResult {
  /** How many times each digit 1-9 appeared in the grid. */
  counts: Record<number, number>;
  /** Digits that appeared at least once. */
  present: number[];
  /** Digits that never appeared. */
  missing: number[];
  /** Digits that appeared >= OVER_AMPLIFICATION_THRESHOLD times. */
  repeating: number[];
}

/** Reduce a number to a single digit (1-9), e.g. 28 -> 10 -> 1. */
export function reduceToSingleDigit(n: number): number {
  let value = Math.abs(n);
  while (value > 9) {
    value = String(value)
      .split("")
      .reduce((sum, ch) => sum + Number(ch), 0);
  }
  return value;
}

/**
 * Mulank (Driver Number) = day-of-birth digits reduced to a single digit.
 * @param day 1-31
 */
export function getMulank(day: number): number {
  return reduceToSingleDigit(day);
}

/**
 * Bhagyank (Conductor/Destiny Number) = all DOB digits (day+month+year)
 * summed and reduced to a single digit.
 * @param day 1-31, month 1-12, year e.g. 1994
 */
export function getBhagyank(day: number, month: number, year: number): number {
  const allDigits = `${day}${month}${year}`.split("").map(Number);
  const sum = allDigits.reduce((a, b) => a + b, 0);
  return reduceToSingleDigit(sum);
}

/**
 * Build the Lo Shu grid result from a DOB.
 * @param day 1-31, month 1-12, year e.g. 1994
 */
export function buildLoShuGrid(day: number, month: number, year: number): LoShuResult {
  const mulank = getMulank(day);
  const bhagyank = getBhagyank(day, month, year);

  // Original DOB digits (day + month + year), zeros dropped, plus Mulank + Bhagyank.
  const rawDigits = `${day}${month}${year}${mulank}${bhagyank}`
    .split("")
    .map(Number)
    .filter((d) => d !== 0);

  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  for (const d of rawDigits) {
    counts[d] = (counts[d] ?? 0) + 1;
  }

  const present: number[] = [];
  const missing: number[] = [];
  const repeating: number[] = [];

  for (let digit = 1; digit <= 9; digit++) {
    const count = counts[digit];
    if (count > 0) present.push(digit);
    else missing.push(digit);
    if (count >= OVER_AMPLIFICATION_THRESHOLD) repeating.push(digit);
  }

  return { counts, present, missing, repeating };
}

/**
 * Is a given name-number "over-amplified" in this person's Lo Shu grid?
 * (i.e. does the name-number match a digit that's already dominant in the DOB)
 */
export function isOverAmplified(nameNumber: number, grid: LoShuResult): boolean {
  return grid.repeating.includes(nameNumber);
}
