import { describe, it, expect } from "vitest";
import { spellingVariants, variantsForTarget, checkSpelling, chaldeanTotal, reduceToSingleDigit } from "../../server/lib/chaldean-names";

describe("spellingVariants", () => {
  it("gives the name itself first, then single doubled vowels, never the first letter", () => {
    const v = spellingVariants("Vihan");
    expect(v[0]).toBe("VIHAN");
    expect(v).toContain("VIIHAN");
    expect(v).toContain("VIHAAN");
    expect(v.every((x) => x[0] === "V" && x[1] !== "V")).toBe(true);
  });
  it("doubled consonants only when asked", () => {
    expect(spellingVariants("Neel")).not.toContain("NEELL");
    expect(spellingVariants("Neel", { consonants: true })).toContain("NEELL");
  });
  it("every variant obeys the spelling rule", () => {
    for (const b of ["Pranav", "Prisha", "Aadhya", "Neel"]) {
      for (const v of spellingVariants(b, { consonants: true })) expect(checkSpelling(b, v)).toBeNull();
    }
  });
});

describe("variantsForTarget", () => {
  it("returns only spellings that start right and add up to the target", () => {
    const rules = { target: 3, prefixes: ["P"] };
    const out = variantsForTarget({ base: "Prisha", spelling: "Prisha", meaning: "x", score: 8 }, rules);
    expect(out.length).toBeGreaterThan(0);
    for (const c of out) {
      expect(c.spelling.toUpperCase().startsWith("P")).toBe(true);
      expect(reduceToSingleDigit(chaldeanTotal(c.spelling))).toBe(3);
    }
  });
  it("gives nothing when no spelling can reach the target", () => {
    // Pooja is 8+7+7+1+1 = 24 -> 6; one doubled vowel cannot make it 9
    expect(variantsForTarget({ base: "Pooja", spelling: "Pooja", meaning: "", score: 5 }, { target: 9, prefixes: ["P"] })).toEqual([]);
  });
});
