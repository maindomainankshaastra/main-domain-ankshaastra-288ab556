/**
 * STANDARD LOSHU GRID (shared across Name Correction, Perfect Baby Name,
 * and Complete Baby Blueprint reports).
 * Source: client's docx, "PART 9 — STANDARD LOSHU GRID".
 *
 * ⚠️ IMPORTANT — this fixes a gap found in the existing, live
 * `src/lib/name-check/lo-shu.ts` module: that module's `buildLoShuGrid()`
 * ALWAYS adds Mulank into the grid. The client's docx for this report
 * family specifies a "Mulank exception rule" (Step 7 below) that skips
 * adding Mulank on certain DOB days, to avoid double-counting a digit
 * that's already present from the raw date. This file implements that
 * exception. FLAG TO CLIENT: the existing live Name Check report likely
 * has slightly inflated counts for some digits on DOBs where day is
 * 1-10, 20, or 30 — worth confirming whether to patch that module too.
 *
 * Construction steps (verbatim from docx):
 *  1. Take the full DOB in DD-MM-YYYY format.
 *  2. Extract every digit (day, month, year), ignoring zeros.
 *  3. Place each digit into its fixed 3x3 grid position:
 *       4 | 9 | 2
 *       3 | 5 | 7
 *       8 | 1 | 6
 *  4. Compute Mulank (single-digit reduction of the day only).
 *  5. Compute Bhagyank (single-digit reduction of day+month+year combined).
 *  6. Always add Bhagyank to the grid.
 *  7. Mulank exception: if the day is 1,2,3,4,5,6,7,8,9,10,20, or 30, do
 *     NOT add Mulank to the grid (it's already one of that day's own raw
 *     digits, so adding it again would double-count it). For every other
 *     day (11-19, 21-29, 31), add Mulank to the grid.
 *  8. Final tally = raw DOB digits + Bhagyank + Mulank (if not excluded).
 */

import { getMulank, getBhagyank } from "@/lib/name-check/lo-shu";

// Fixed Lo Shu "turtle" layout - which grid position each digit 1-9 occupies.
export const LO_SHU_POSITIONS: Record<number, [row: number, col: number]> = {
  4: [0, 0], 9: [0, 1], 2: [0, 2],
  3: [1, 0], 5: [1, 1], 7: [1, 2],
  8: [2, 0], 1: [2, 1], 6: [2, 2],
};

export const OVER_AMPLIFICATION_THRESHOLD = 2;

// Days where Mulank is already inherent in the raw date digits — confirmed
// via docx Step 7 — so it must NOT be added a second time.
const MULANK_EXCLUDED_DAYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30];

export interface StandardLoShuGrid {
  mulank: number;
  bhagyank: number;
  /** True if Mulank was excluded from the tally per the Step 7 exception. */
  mulankExcludedFromGrid: boolean;
  counts: Record<number, number>;
  present: number[];
  missing: number[];
  repeating: number[];
}

/** Builds the Standard Lo Shu Grid per the client's exact 9-step method (with the Mulank exception applied). */
export function buildStandardLoShuGrid(day: number, month: number, year: number): StandardLoShuGrid {
  const mulank = getMulank(day);
  const bhagyank = getBhagyank(day, month, year);
  const mulankExcludedFromGrid = MULANK_EXCLUDED_DAYS.includes(day);

  const rawDobDigits = `${day}${month}${year}`.split("").map(Number).filter((d) => d !== 0);
  const digitsToTally = [...rawDobDigits, bhagyank, ...(mulankExcludedFromGrid ? [] : [mulank])];

  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  for (const d of digitsToTally) {
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

  return { mulank, bhagyank, mulankExcludedFromGrid, counts, present, missing, repeating };
}

/** Convenience for PDF/UI rendering: 3x3 array of {digit, count} cells in turtle-grid order. */
export function toGridCells(
  grid: StandardLoShuGrid,
): { digit: number; count: number }[][] {
  const cells: { digit: number; count: number }[][] = [[], [], []];
  for (const [digitStr, [row]] of Object.entries(LO_SHU_POSITIONS)) {
    const digit = Number(digitStr);
    cells[row].push({ digit, count: grid.counts[digit] ?? 0 });
  }
  // Sort each row left-to-right by column.
  for (let row = 0; row < 3; row++) {
    cells[row].sort((a, b) => {
      const [, colA] = LO_SHU_POSITIONS[a.digit];
      const [, colB] = LO_SHU_POSITIONS[b.digit];
      return colA - colB;
    });
  }
  return cells;
}
