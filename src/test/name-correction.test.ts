// import { describe, it, expect } from "vitest";
// import { correctionCandidates, summariseName, SUITABILITY } from "@/lib/swar/nameCorrection";
// import { analyseName } from "@/lib/swar/nameSteps";

// // 7 Oct 2026 -> Mulank 7, Bhagyank 9 (the Mokadam order)
// const DOB = "2026-10-07";
// const SUR = "Mokadam";

// describe("correctionCandidates", () => {
//   it("doubles vowels before consonants, one letter before two, and never the first letter", () => {
//     const c = correctionCandidates("Mivank");
//     expect(c.slice(0, 2)).toEqual(["Miivank", "Mivaank"]);   // the vowels
//     expect(c[2]).toBe("Mivvank");                            // then a consonant
//     expect(c).not.toContain("Mmivank");
//     expect(c.every((w) => w[0] === "M")).toBe(true);
//   });
//   it("never makes a triple letter, doubles two neighbours, or doubles two consonants", () => {
//     const c = correctionCandidates("Dheer");
//     expect(c.some((w) => /(.)\1\1/i.test(w))).toBe(false);
//     for (const w of correctionCandidates("Vyom")) expect(w).not.toBe("Vyyomm");
//     expect(correctionCandidates("Mivank")).not.toContain("Mivaannk");
//   });
// });

// describe("summariseName", () => {
//   it("a name the engine rates highly suitable is Yes and gets no correction", () => {
//     const s = summariseName(DOB, "Advik", SUR);
//     expect(s.ok).toBe(true);
//     expect(s.corrected).toBeNull();
//   });
//   it("Miransh is No and is corrected by one doubled letter", () => {
//     const s = summariseName(DOB, "Miransh", SUR);
//     expect(s.ok).toBe(false);
//     expect(s.total).toBe(21);
//     expect(s.corrected).toEqual({ name: "Mirransh", total: 23, number: 5 });
//   });
//   it("every correction it offers is itself rated highly suitable by the same rule engine", () => {
//     for (const n of ["Miransh", "Mihank", "Dheer", "Darsh", "Aarav", "Kabir", "Ishaan", "Vihaan", "Reyansh"]) {
//       const s = summariseName(DOB, n, SUR);
//       if (s.corrected) expect(analyseName(DOB, s.corrected.name, SUR).grade).toBe("good");
//     }
//   });
//   it("keeps three suitability words: an acceptable name is Moderate, not No", () => {
//     const s = summariseName(DOB, "Mivank", SUR);          // the engine rates it acceptable
//     expect(s.grade).toBe("ok");
//     expect(SUITABILITY[s.grade]).toBe("Moderate");
//     expect(SUITABILITY.good).toBe("Yes");
//     expect(SUITABILITY.avoid).toBe("No");
//   });
//   it("reports a missing date of birth instead of guessing", () => {
//     expect(summariseName("", "Advik", SUR).error).toBeTruthy();
//   });
// });


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

describe("summariseName with the number picked in Step 3", () => {
  it("corrects the spelling to the number that was clicked, so each button gives its own spelling", () => {
    expect(summariseName(DOB, "Miransh", SUR, 5).corrected?.number).toBe(5);
    expect(summariseName(DOB, "Miransh", SUR, 5).corrected?.name).toBe("Mirransh");
    expect(summariseName(DOB, "Miransh", SUR, 7).corrected?.number).toBe(7);
    expect(summariseName(DOB, "Miransh", SUR, 7).corrected?.name).not.toBe("Mirransh");
  });
  it("gives no correction when no allowed spelling reaches the clicked number (the operator can type one)", () => {
    expect(summariseName(DOB, "Miransh", SUR, 3).corrected).toBeNull();
  });
  it("never offers a spelling on a different number than the one asked for", () => {
    for (const n of ["Miransh", "Mivank", "Dheer", "Eileen"]) for (const t of [3, 5, 7]) {
      const c = summariseName(DOB, n, SUR, t).corrected;
      if (c) expect(c.number).toBe(t);
    }
  });
  it("without a number the old behaviour is unchanged", () => {
    expect(summariseName(DOB, "Miransh", SUR).corrected).toEqual({ name: "Mirransh", total: 23, number: 5 });
  });
});
