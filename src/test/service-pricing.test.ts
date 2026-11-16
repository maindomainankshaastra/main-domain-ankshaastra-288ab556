import { describe, expect, it } from "vitest";
import { pricing } from "@/config/pricing";
import { servicesCatalogListings } from "@/data/serviceRegistry";
import { callConsultationHub } from "@/data/serviceCatalog";
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

  it("prices 1:1 audio consultations at ₹11,000 for 45 minutes", () => {
    expect(callConsultationHub.packages.find((plan) => plan.serviceTitle.endsWith("Audio 45"))?.price).toBe(11000);
  });

  it("prices 1:1 audio consultations at ₹12,500 for 60 minutes", () => {
    expect(callConsultationHub.packages.find((plan) => plan.serviceTitle.endsWith("Audio 60"))?.price).toBe(12500);
  });

  it("prices 1:1 audio consultations at ₹14,000 for 75 minutes", () => {
    expect(callConsultationHub.packages.find((plan) => plan.serviceTitle.endsWith("Audio 75"))?.price).toBe(14000);
  });

  it("prices 1:1 video consultations at ₹14,000 for 45 minutes", () => {
    expect(callConsultationHub.packages.find((plan) => plan.serviceTitle.endsWith("Video 45"))?.price).toBe(14000);
  });

  it("prices 1:1 video consultations at ₹16,000 for 60 minutes", () => {
    expect(callConsultationHub.packages.find((plan) => plan.serviceTitle.endsWith("Video 60"))?.price).toBe(16000);
  });

  it("prices 1:1 video consultations at ₹21,000 for 75 minutes", () => {
    expect(callConsultationHub.packages.find((plan) => plan.serviceTitle.endsWith("Video 75"))?.price).toBe(21000);
  });
});