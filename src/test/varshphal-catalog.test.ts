import { describe, expect, it } from "vitest";
import { varshphalPackages } from "@/data/serviceCatalog";
import { payLink } from "@/config/pricing";
import { resolveServiceDisplay } from "@/lib/service-display";
import { makeVarshphalSchema, prepareVarshphalSnapshot, varshphalAdditionalReport, varshphalInclusions } from "@/data/varshphalReport";
import { extractServicePersonsFromSnapshot } from "@/lib/service-persons";

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
  const person = { fullName: "Test Person", gender: "male", pincode: "110001", pob: "Delhi, India", dob: { day: "1", month: "1", year: "1990" }, tob: { hour: "9", minute: "30", meridiem: "AM" } };
  const contact = { email: "test@example.com", whatsapp: "+91 9876543210", language: "english", currentPincode: "110001", currentCity: "Delhi", currentState: "Delhi" };
  it("discounts only the additional report by 20 percent", () => {
    expect(varshphalAdditionalReport.price).toBe(559.2);
    expect(varshphalPackages[0].price + varshphalAdditionalReport.price).toBe(1258.2);
    expect(varshphalInclusions).toHaveLength(3);
    expect(varshphalInclusions.join(" ")).not.toMatch(/remed/i);
    expect(varshphalInclusions.join(" ")).toContain("30+");
  });
  it("requires exact birth time for every report", () => {
    expect(makeVarshphalSchema(false).safeParse({ ...person, ...contact }).success).toBe(true);
    expect(makeVarshphalSchema(false).safeParse({ ...person, ...contact, tob: { hour: "", minute: "", meridiem: "" } }).success).toBe(false);
    expect(makeVarshphalSchema(true).safeParse({ ...person, ...contact }).success).toBe(false);
    expect(makeVarshphalSchema(true).safeParse({ ...person, ...contact, person2: { ...person, tob: {} } }).success).toBe(false);
    expect(makeVarshphalSchema(true).safeParse({ ...person, ...contact, person2: person }).success).toBe(true);
  });
  it("keeps both subjects in order metadata and removes the extra subject when deselected", () => {
    const data = { ...person, ...contact, person2: { ...person, fullName: "Second Person" } };
    const multi = prepareVarshphalSnapshot(data, true);
    expect(extractServicePersonsFromSnapshot(multi).map(subject => subject.full_name)).toEqual(["Test Person", "Second Person"]);
    expect(multi.purchaserName).toBe("Test Person");
    expect(extractServicePersonsFromSnapshot(prepareVarshphalSnapshot(data, false))).toHaveLength(1);
  });
});