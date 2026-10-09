import { describe, expect, it } from "vitest";
import { nameCorrectionPackages } from "@/data/serviceCatalog";
import { resolveServiceDisplay } from "@/lib/service-display";
import { nameReportOffers, nameReportConfirmation } from "@/data/nameReportOffers";

describe("single Name Check offer", () => {
  it("offers exactly one Name Check at the approved price", () => {
    const offers = nameCorrectionPackages.filter((pkg) => pkg.formType === "name-check");
    expect(offers).toHaveLength(1);
    expect(offers[0]).toMatchObject({ name: "Name Check", price: 373, originalPrice: 1100 });
  });
  it("resolves the same checkout price and does not resolve retired packages", () => {
    expect(resolveServiceDisplay("Name Check")?.price).toBe(373);
    expect(resolveServiceDisplay("Name Check 2")).toBeNull();
    expect(resolveServiceDisplay("Name Check 3")).toBeNull();
  });
  it("keeps all three report presentations aligned with catalog offers", () => {
    expect(nameReportOffers).toHaveLength(3);
    for (const report of nameReportOffers) {
      expect(nameCorrectionPackages.find(pkg => pkg.serviceTitle === report.serviceTitle)).toBeDefined();
    }
    expect(nameReportOffers.map(report => report.delivery)).toEqual(["12–24 Hours", "24–48 Hours", "24–28 Hours"]);
  });
  it("uses package-specific confirmation instructions", () => {
    expect(nameReportConfirmation("Name Check")).toContain("after 6 hours");
    expect(nameReportConfirmation("Name Correction")).toContain("WhatsApp within 24–28 hours");
    expect(nameReportConfirmation("Name Correction + Complete Blueprint")).toContain("WhatsApp within 24–28 hours");
  });
  it("aligns the Blueprint price and rating", () => {
    expect(nameCorrectionPackages.find(pkg => pkg.serviceTitle === "Name Correction + Complete Blueprint")).toMatchObject({ price: 5957, originalPrice: 15051 });
    expect(nameReportOffers[2]).toMatchObject({ rating: "5.0", sold: "8k sold" });
  });
});