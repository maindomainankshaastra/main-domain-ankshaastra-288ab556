/** Complete Baby Blueprint — Lucky Number / Lucky Color / Kua Lucky Direction (docx PART-10, 11, 12). */

const FRIENDLY: Record<number, number[]> = {
  1: [1, 2, 3, 5, 6, 9], 2: [1, 2, 3, 5], 3: [1, 2, 3, 5], 4: [1, 5, 6, 7], 5: [1, 2, 3, 5, 6],
  6: [1, 4, 5, 6, 7], 7: [1, 3, 4, 5, 6], 8: [3, 5, 6, 7], 9: [1, 3, 5],
};

/**
 * Lucky numbers = numbers that are FRIENDLY to BOTH Mulank and Bhagyank.
 * Any number that is neutral/enemy to either core number is dropped (conflict rule).
 */
export function getLuckyNumbers(mulank: number, bhagyank: number): number[] {
  const a = FRIENDLY[mulank] ?? [];
  const b = FRIENDLY[bhagyank] ?? [];
  return a.filter((n) => b.includes(n)).sort((x, y) => x - y);
}

/** "1, 3, 5 & 6" */
export function formatLuckyNumbers(nums: number[]): string {
  if (nums.length === 0) return "—";
  if (nums.length === 1) return String(nums[0]);
  return `${nums.slice(0, -1).join(", ")} & ${nums[nums.length - 1]}`;
}

/** By Mulank. */
export const LUCKY_COLOR: Record<number, string> = {
  1: "Red & Shades of Red",
  2: "White & Shades of White",
  3: "Yellow & Shades of Yellow",
  4: "Black/Grey & Shades of Black/Grey",
  5: "Green & Shades of Green",
  6: "White & Rainbow Color",
  7: "Black/Grey & Shades of Black/Grey",
  8: "Blue & Shades of Blue",
  9: "Red & Shades of Red",
};

export interface LuckyDirections { wealth: string; health: string; love: string; growth: string }

/** Key = Kua number (1,2,3,4,6,7,8,9 — 5 never occurs; it is mapped to 2 (male) / 8 (female)). */
export const KUA_DIRECTIONS: Record<number, LuckyDirections> = {
  1: { wealth: "South East", health: "East", love: "South", growth: "North" },
  2: { wealth: "North East", health: "West", love: "North West", growth: "South West" },
  3: { wealth: "South", health: "North", love: "South East", growth: "East" },
  4: { wealth: "North", health: "South", love: "East", growth: "South West" },
  6: { wealth: "West", health: "North East", love: "South West", growth: "North West" },
  7: { wealth: "North West", health: "South West", love: "North East", growth: "West" },
  8: { wealth: "South West", health: "North West", love: "West", growth: "North East" },
  9: { wealth: "East", health: "South East", love: "North", growth: "South" },
};

export function getLuckyDirections(kua: number | null): LuckyDirections | null {
  return kua ? KUA_DIRECTIONS[kua] ?? null : null;
}
