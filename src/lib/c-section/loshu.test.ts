import { describe, expect, it } from "vitest";
import { babyLoshu } from "./loshu.ts";

describe("baby Lo Shu (client's Excel rule)", () => {
  it("19 Nov 2026: digits + Bhagyank 4 + Mulank 1", () => {
    const l = babyLoshu("2026-11-19");
    expect(l.mulankInGrid).toBe(true);
    expect(l.counts[1]).toBe(4);
    expect(l.counts[2]).toBe(2);
    expect(l.counts[4]).toBe(1);
    expect(l.counts[6]).toBe(1);
    expect(l.counts[9]).toBe(1);
    expect(l.missing).toEqual([3, 5, 7, 8]);
    expect(l.repeated.map((r) => r.digit)).toEqual([1, 2]);
  });
  it("leaves Mulank out on days 1-9, 10, 20, 30", () => {
    expect(babyLoshu("2026-11-10").mulankInGrid).toBe(false);
    expect(babyLoshu("2026-11-20").mulankInGrid).toBe(false);
    expect(babyLoshu("2026-11-05").mulankInGrid).toBe(false);
    expect(babyLoshu("2026-11-30").mulankInGrid).toBe(false);
    expect(babyLoshu("2026-11-21").mulankInGrid).toBe(true);
  });
  it("20 Nov 2026: 2,0,1,1,2,0,2,6 + Bhagyank 5 (no Mulank)", () => {
    const l = babyLoshu("2026-11-20");
    expect(l.counts[2]).toBe(3);
    expect(l.counts[1]).toBe(2);
    expect(l.counts[5]).toBe(1);
    expect(l.counts[6]).toBe(1);
    expect(l.missing).toEqual([3, 4, 7, 8, 9]);
  });
  it("grid uses the fixed 4 9 2 / 3 5 7 / 8 1 6 layout", () => {
    const l = babyLoshu("2026-11-19");
    expect(l.grid.map((r) => r.map((c) => c.digit))).toEqual([[4, 9, 2], [3, 5, 7], [8, 1, 6]]);
  });
});
