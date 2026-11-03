import { describe, it, expect } from "vitest";
import {
  chaldeanTotal, reduceToSingleDigit, checkSpelling, validateCandidate, filterCandidates,
} from "../../server/lib/chaldean-names";

describe("Chaldean totals", () => {
  it("adds letter values (no 9)", () => {
    expect(chaldeanTotal("Rivaan")).toBe(16);   // R2 I1 V6 A1 A1 N5
    expect(reduceToSingleDigit(16)).toBe(7);
    expect(chaldeanTotal("Viiraj")).toBe(12);   // V6 I1 I1 R2 A1 J1
    expect(reduceToSingleDigit(12)).toBe(3);
  });
});

describe("spelling rule (only repeat existing letters)", () => {
  it("accepts natural repeats from the client's examples", () => {
    for (const [b, s] of [["Pranav","Praanav"],["Pranav","Prannav"],["Pranav","Pranavv"],["Rudra","Ruudra"],["Rudra","Rudrra"],["Rudra","Rudraa"],["Virat","Viirat"],["Virat","Viraat"],["Virat","Viratt"]]) {
      expect(checkSpelling(b, s), `${b}->${s}`).toBeNull();
    }
  });
  it("rejects new letters and weird repeats from the client's examples", () => {
    for (const [b, s] of [["Pranav","Pranavo"],["Pranav","Pranavik"],["Pranav","Pranavesh"],["Rudra","Rudrav"],["Rudra","Rudrax"],["Virat","Virato"],["Virat","Viratesh"]]) {
      expect(checkSpelling(b, s), `${b}->${s}`).not.toBeNull();
    }
    expect(checkSpelling("Pranav", "Praaanav")).toBe("weird-repeat");
    expect(checkSpelling("Pranav", "Praannav")).toBe("too-many-repeats");
  });
});

describe("candidate filtering", () => {
  const rules = { target: 3, prefixes: ["Vi"] };
  it("keeps only names that start right AND add up to the target", () => {
    const good = { base: "Viraj", spelling: "Viiraj", meaning: "x" }; // 12 -> 3
    const wrongNum = { base: "Vivaan", spelling: "Vivaan", meaning: "x" };
    const wrongStart = { base: "Raj", spelling: "Raj", meaning: "x" };
    expect(validateCandidate(good, rules)).toBeNull();
    expect(validateCandidate(wrongNum, rules)).toBe("wrong-number");
    expect(validateCandidate(wrongStart, rules)).toBe("bad-start");
  });
  it("drops duplicates", () => {
    const c = { base: "Viraj", spelling: "Viiraj", meaning: "x" };
    const { valid, rejected } = filterCandidates([c, { ...c }], rules);
    expect(valid.length).toBe(1);
    expect(rejected[0].why).toBe("duplicate");
  });
});
