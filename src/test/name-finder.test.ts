import { describe, it, expect } from "vitest";
import { buildNameFinderProfile, combinationTable, kuaNumber, luckyPool, surnameBlock } from "@/lib/swar/nameFinder";

describe("Name Finder logic engine (client doc)", () => {
  it("Kua: doc example male 1990 = 1, notebook female 2026 = 8 (special case 5)", () => {
    expect(kuaNumber(1990, "boy")).toBe(1);
    expect(kuaNumber(2026, "girl")).toBe(8);
  });

  it("surname block: Gokal = 16/7; middle name only when flagged", () => {
    expect(surnameBlock("Gokal")?.display).toBe("16/7");
    expect(surnameBlock("Gokal", "Deshraj", false)?.text).toBe("Gokal");
    expect(surnameBlock("Gokal", "Deshraj", true)?.text).toBe("Deshraj Gokal");
  });

  it("lucky pool for M5 B6 = 1, 5, 6", () => {
    expect(luckyPool([5, 6])).toEqual([1, 5, 6]);
  });

  it("combination table M5 B6 surname 7: only 7 -> 5 survives (matches notebook)", () => {
    const rows = combinationTable(5, 6, 7);
    expect(rows.map((r) => r.total)).toEqual([8, 9, 1, 2, 3, 4, 5, 6, 7]);
    expect(rows.filter((r) => r.mark !== "cross").map((r) => r.n)).toEqual([7]);
    expect(rows[0].reason).toBe("Full name number 8 is on number 8 (Saturn)");
    expect(rows[2].reason).toBe("First name number 3 is Enemy to Bhagyank 6");
    expect(rows[3].reason).toBe("First name number 4 is on number 4 (Rahu)");
  });

  it("profile from DOB", () => {
    const p = buildNameFinderProfile("2026-09-23", "girl", "Gokal")!;
    expect([p.mulank, p.bhagyank, p.kua]).toEqual([5, 6, 8]);
  });
});

import { detectPackage, nameSlots, namePageCount, prefillFromOrder } from "@/lib/swar/nameFinderPackage";
import { favourableTable } from "@/lib/swar/nameFinderReport";

describe("package -> name slots (client rule)", () => {
  it("3437 = 12 names (pages 10, 11 removed); 5957 = 24 (page 11 removed); 5957 + add-on = 32", () => {
    expect(nameSlots({ tier: "perfect", extraNames: false })).toBe(12);
    expect(nameSlots({ tier: "blueprint", extraNames: false })).toBe(24);
    expect(nameSlots({ tier: "blueprint", extraNames: true })).toBe(32);
    expect([12, 24, 32].map(namePageCount)).toEqual([1, 2, 3]);
  });

  it("detects package and add-on from an order", () => {
    const o = { service_title: "complete-baby-name-blueprint", total_amount: 6694, metadata: { formSnapshot: { packageType: "premium", nameOptions: "G [NAME STYLE: Modern] [ADD-ON: +10 names (₹737)]" } } };
    const d = detectPackage(o);
    expect(d.choice).toEqual({ tier: "blueprint", extraNames: true });
    expect(detectPackage({ total_amount: 3437, metadata: { formSnapshot: { packageType: "single" } } }).choice).toEqual({ tier: "perfect", extraNames: false });
    // a nickname add-on must not count as extra names
    expect(detectPackage({ total_amount: 4174, metadata: { formSnapshot: { packageType: "single", nameOptions: "[ADD-ON: Nickname (₹737)]" } } }).choice?.extraNames).toBe(false);
  });

  it("prefills the form from an order", () => {
    const f = prefillFromOrder({ metadata: { formSnapshot: { childDob: "23/09/2026", timeOfBirth: "11:53 AM", gender: "Female", childLastName: "Gokal", placeOfBirth: "Jaipur", pinCode: "302017", fatherFirstNameAsMiddleName: "No", childMiddleName: "Deshraj" } } });
    expect(f).toMatchObject({ dob: "2026-09-23", time: "11:53", gender: "girl", lastName: "Gokal", place: "Jaipur, 302017", middleIsFather: false });
  });

  it("favourable table M5 B6: lucky 1,5,6, avoid 3", () => {
    const t = favourableTable(5, 6);
    expect(t.filter((r) => r.status === "Lucky").map((r) => r.n)).toEqual([1, 5, 6]);
    expect(t.filter((r) => r.status === "Avoid").map((r) => r.n)).toEqual([3]);
  });
});
