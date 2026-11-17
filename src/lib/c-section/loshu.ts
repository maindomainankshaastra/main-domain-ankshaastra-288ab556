/**
 * Baby's Lo Shu grid for a candidate birth date, built exactly like the client's Excel
 * (sheet "Lo Shu & Name Numerology"):
 *   digits of DDMMYYYY (zeros ignored) + Bhagyank (always)
 *   + Mulank, UNLESS the day is 1-9, 10, 20 or 30 (then Mulank is left out).
 * Layout is the fixed Lo Shu square:  4 9 2 / 3 5 7 / 8 1 6.
 */
import { dateNumerology } from "./numerology.ts";

export const LOSHU_LAYOUT: readonly (readonly number[])[] = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
];

export interface LoshuCell { digit: number; count: number }

export interface BabyLoshu {
  date: string;
  mulank: number;
  bhagyank: number;
  /** false on days 1-9, 10, 20, 30 */
  mulankInGrid: boolean;
  counts: Record<number, number>;
  grid: LoshuCell[][];
  missing: number[];
  repeated: LoshuCell[];
}

export function babyLoshu(ymd: string): BabyLoshu {
  const [y, m, d] = ymd.split("-").map(Number);
  const { mulank, bhagyank } = dateNumerology(ymd);
  const mulankInGrid = !(d <= 9 || d % 10 === 0);
  const pool = `${String(d).padStart(2, "0")}${String(m).padStart(2, "0")}${y}`
    .split("").map(Number)
    .concat(bhagyank, mulankInGrid ? [mulank] : []);
  const counts: Record<number, number> = {};
  for (let n = 1; n <= 9; n++) counts[n] = pool.filter((x) => x === n).length;
  const grid = LOSHU_LAYOUT.map((row) => row.map((digit) => ({ digit, count: counts[digit] })));
  const missing = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => counts[n] === 0);
  const repeated = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => counts[n] >= 2).map((digit) => ({ digit, count: counts[digit] }));
  return { date: ymd, mulank, bhagyank, mulankInGrid, counts, grid, missing, repeated };
}
