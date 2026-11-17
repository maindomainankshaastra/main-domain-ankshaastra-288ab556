import { describe, it, expect } from "vitest";
import { correctionCandidates, summariseName, SUITABILITY } from "@/lib/swar/nameCorrection";
import { analyseName } from "@/lib/swar/nameSteps";

// 7 Oct 2026 -> Mulank 7, Bhagyank 9 (the Mokadam order)
const DOB = "2026-10-07";
const SUR = "Mokadam";

describe("correctionCandidates", () => {
  it("doubles vowels before consonants, one letter before two, and never the first letter", () => {
    const c = correctionCandidates("Mivank");
    expect(c.slice(0, 2)).toEqual(["Miivank", "Mivaank"]);   // the vowels
    expect(c[2]).toBe("Mivvank");                            // then a consonant
    expect(c).not.toContain("Mmivank");
    expect(c.every((w) => w[0] === "M")).toBe(true);
  });
  it("never makes a triple letter, doubles two neighbours, or doubles two consonants", () => {
    const c = correctionCandidates("Dheer");
    expect(c.some((w) => /(.)\1\1/i.test(w))).toBe(false);
    for (const w of correctionCandidates("Vyom")) expect(w).not.toBe("Vyyomm");
    expect(correctionCandidates("Mivank")).not.toContain("Mivaannk");
  });
});

describe("summariseName", () => {
  it("a name the engine rates highly suitable is Yes and gets no correction", () => {
    const s = summariseName(DOB, "Advik", SUR);
    expect(s.ok).toBe(true);
    expect(s.corrected).toBeNull();
  });
  it("Miransh is No and is corrected by one doubled letter", () => {
    const s = summariseName(DOB, "Miransh", SUR);
    expect(s.ok).toBe(false);
    expect(s.total).toBe(21);
    expect(s.corrected).toEqual({ name: "Mirransh", total: 23, number: 5 });
  });
  it("every correction it offers is itself rated highly suitable by the same rule engine", () => {
    for (const n of ["Miransh", "Mihank", "Dheer", "Darsh", "Aarav", "Kabir", "Ishaan", "Vihaan", "Reyansh"]) {
      const s = summariseName(DOB, n, SUR);
      if (s.corrected) expect(analyseName(DOB, s.corrected.name, SUR).grade).toBe("good");
    }
  });
  it("keeps three suitability words: an acceptable name is Moderate, not No", () => {
    const s = summariseName(DOB, "Mivank", SUR);          // the engine rates it acceptable
    expect(s.grade).toBe("ok");
    expect(SUITABILITY[s.grade]).toBe("Moderate");
    expect(SUITABILITY.good).toBe("Yes");
    expect(SUITABILITY.avoid).toBe("No");
  });
  it("reports a missing date of birth instead of guessing", () => {
    expect(summariseName("", "Advik", SUR).error).toBeTruthy();
  });
});
