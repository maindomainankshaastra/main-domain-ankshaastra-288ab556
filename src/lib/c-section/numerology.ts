import { LUCK_GRID } from "./tables.ts";

/** Repeated digit sum until a single digit (same result as the Excel two-step formula for day / DDMMYYYY). */
export function digitalRoot(n: number): number {
  let x = Math.abs(Math.trunc(n));
  while (x > 9) x = String(x).split("").reduce((s, c) => s + Number(c), 0);
  return x;
}

export interface DateNumerology {
  mulank: number;
  bhagyank: number;
  /** Luck % from the client's Mulank x Bhagyank grid. */
  luckPct: number;
  classification: "Excellent" | "Good" | "Neutral" | "Avoid";
}

/** @param ymd "YYYY-MM-DD" */
export function dateNumerology(ymd: string): DateNumerology {
  const [y, m, d] = ymd.split("-").map(Number);
  const mulank = digitalRoot(d);
  const digits = `${String(d).padStart(2, "0")}${String(m).padStart(2, "0")}${y}`;
  const bhagyank = digitalRoot(digits.split("").reduce((s, c) => s + Number(c), 0));
  const luckPct = LUCK_GRID[mulank - 1][bhagyank - 1];
  const classification = luckPct >= 80 ? "Excellent" : luckPct >= 60 ? "Good" : luckPct >= 30 ? "Neutral" : "Avoid";
  return { mulank, bhagyank, luckPct, classification };
}

/** Numerology tier used in the average (Excel: >=80 -> 4, >=60 -> 3, >=30 -> 2, else 1). */
export function luckTier(luckPct: number): number {
  return luckPct >= 80 ? 4 : luckPct >= 60 ? 3 : luckPct >= 30 ? 2 : 1;
}
