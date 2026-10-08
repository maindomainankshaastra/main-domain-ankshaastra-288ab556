import { describe, expect, it } from "vitest";
import { nameCorrectionPackages } from "@/data/serviceCatalog";
import { resolveServiceDisplay } from "@/lib/service-display";

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
});