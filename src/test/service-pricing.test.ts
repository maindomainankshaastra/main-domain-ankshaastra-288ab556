import { describe, expect, it } from "vitest";
import { pricing } from "@/config/pricing";
import { servicesCatalogListings } from "@/data/serviceRegistry";
import { standaloneServices } from "@/data/standaloneServices";

describe("updated service prices", () => {
  it("prices Perfect Baby Name at ₹3,437 in the catalog", () => {
    expect(servicesCatalogListings.find((service) => service.id === "perfect-baby-name")?.price).toBe(3437);
    expect(pricing.baby.perfectName).toBe(3437);
  });

  it("prices C-Section Dates at ₹3,437 in the catalog", () => {
    expect(servicesCatalogListings.find((service) => service.id === "c-section-dates")?.price).toBe(3437);
    expect(pricing.baby.cSectionEssential).toBe(3437);
  });

  it("prices Lucky Vehicle Number at ₹1,499", () => {
    expect(standaloneServices.find((service) => service.slug === "lucky-vehicle-number")?.price).toBe(1499);
  });

  it("prices Lucky Mobile Number at ₹1,499", () => {
    expect(standaloneServices.find((service) => service.slug === "lucky-mobile-number")?.price).toBe(1499);
  });
});