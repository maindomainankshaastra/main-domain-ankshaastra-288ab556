import { describe, expect, it } from "vitest";
import { varshphalPackages } from "@/data/serviceCatalog";
import { payLink } from "@/config/pricing";
import { resolveServiceDisplay } from "@/lib/service-display";

describe("Varshphal report offer", () => {
  it("offers the 2027 edition at the retained price with the existing birth-details form", () => {
    const report = varshphalPackages[0];
    expect(report.serviceTitle).toBe("Varshphal Report 2027");
    expect(report.price).toBe(699);
    expect(report.formType).toBe("kundali");
    expect(resolveServiceDisplay(report.serviceTitle)?.packageName).toBe("Varshphal Report 2027");
    const url = new URL(payLink(report.serviceTitle, report.price, report.formType), "https://example.test");
    expect(url.searchParams.get("service")).toBe("Varshphal Report 2027");
    expect(url.searchParams.get("amount")).toBe("699");
  });
});