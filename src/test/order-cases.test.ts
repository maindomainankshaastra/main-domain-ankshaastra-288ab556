import { describe, it, expect } from "vitest";
import { caseFromOrder, isPaidLike } from "@/lib/swar/orderCases";
import { preferenceFromNameOptions } from "@/lib/swar/nameFinderPackage";

// Shapes copied from real orders (names/phones shortened).
const base = { service_title: "perfect-baby-name-report", total_amount: 3437, customer_phone: "9405418127", status: "paid" };
const meta = (m: object) => ({ ...base, id: "o1", metadata: m });

describe("caseFromOrder", () => {
  it("Perfect order, father's name as middle name", () => {
    const c = caseFromOrder(meta({
      childDob: "2026-10-07", timeOfBirth: "09:17 AM", placeOfBirth: "Nagpur", state: "Maharashtra", pinCode: "440024",
      gender: "Male", mobile: "9405418127", name: "Ankit Surendra Mokadam", childLastName: "Mokadam",
      childMiddleName: "Ankit", fatherFirstNameAsMiddleName: "yes", packageType: "perfect-baby-name-report",
      nameOptions: "[NAME STYLE: Mix of All] [NOTES: Please connect with us.]",
    }));
    expect(c.snapshot.dob).toBe("2026-10-07");
    expect(c.snapshot.time).toBe("09:17");
    expect(c.snapshot.place).toBe("Nagpur, Maharashtra");
    expect(c.snapshot.gender).toBe("boy");
    expect(c.snapshot.surname).toBe("Mokadam");
    expect(c.snapshot.middle).toBe("Ankit");
    expect(c.snapshot.middleNotFather).toBe(false);
    expect(c.snapshot.pkg).toEqual({ tier: "perfect", extraNames: false });
    expect(c.snapshot.preference).toBe("Style: Mix of All. Notes: Please connect with us.");
    expect(c.missing).toEqual([]);
  });

  it("Complete order, 5:26 PM becomes 17:26, girl, no middle name", () => {
    const c = caseFromOrder({ ...base, id: "o2", service_title: "complete-baby-name-blueprint", total_amount: 5957,
      metadata: { childDob: "2026-11-05", timeOfBirth: "05:26 PM", placeOfBirth: "Kolkata", state: "West Bengal", gender: "Female",
        mobile: "9830015879", name: "KOUSHIK PAL", childLastName: "PAL", childMiddleName: null, packageType: "complete-baby-name-blueprint" } });
    expect(c.snapshot.time).toBe("17:26");
    expect(c.snapshot.gender).toBe("girl");
    expect(c.snapshot.middle).toBe("");
    expect(c.snapshot.pkg.tier).toBe("blueprint");
    expect(c.packageLabel).toContain("Complete Blueprint");
  });

  it("does not repeat the city when the state field holds the same word", () => {
    const c = caseFromOrder(meta({ childDob: "2026-11-05", timeOfBirth: "08:34 AM", placeOfBirth: "BASIRHAT", state: "Basirhat",
      gender: "Male", mobile: "7001342346", childLastName: "Das", packageType: "perfect-baby-name-report" }));
    expect(c.snapshot.place).toBe("BASIRHAT");
  });

  it("lists what the order is missing instead of guessing", () => {
    const c = caseFromOrder({ ...base, customer_phone: null, metadata: { childDob: "2026-11-05" } });
    expect(c.missing).toEqual(expect.arrayContaining(["time of birth", "place", "gender", "phone"]));
  });
});

describe("helpers", () => {
  it("skips unpaid orders", () => {
    expect(isPaidLike({ status: "paid" })).toBe(true);
    expect(isPaidLike({ status: "pending" })).toBe(false);
    expect(isPaidLike({ status: "failed" })).toBe(false);
  });
  it("keeps notes that contain brackets-free text and drops add-on tags", () => {
    expect(preferenceFromNameOptions("[NAME STYLE: Sanskrit/Vedic] [NOTES: A) Bengali touch\nB) Maa Durga] [ADD-ON: +10 names (Rs 737)]"))
      .toBe("Style: Sanskrit/Vedic. Notes: A) Bengali touch B) Maa Durga");
  });
});
