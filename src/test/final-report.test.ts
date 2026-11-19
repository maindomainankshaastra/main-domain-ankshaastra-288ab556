import { describe, it, expect } from "vitest";
import { buildReportValues, reportColumns, reportGender, reportTarget, fullOption, reportMessage, reportOpenUrl } from "@/lib/swar/finalReport";
import { validateBabyForm } from "@/lib/baby-reports/perfect-baby-name/form";

const base = { name1: "Dheer", name2: "Darsh", middle: "Ankit", middleIsFather: true, surname: "Mokadam", gender: "boy",
  email: "a@b.com", phone: "9405418127", dob: "2026-10-07", fatherName: "Ankit Surendra Mokadam", nickName: "", preference: "na" as const };

describe("final report", () => {
  it("maps tier to the right table", () => {
    expect(reportTarget("perfect").table).toBe("perfect_baby_name_reports");
    expect(reportTarget("blueprint").table).toBe("complete_baby_blueprint_reports");
  });
  it("builds a valid report form from the confirmed names", () => {
    const v = buildReportValues(base);
    expect(v.option1_name).toBe("Dheer Ankit Mokadam");
    expect(v.option2_name).toBe("Darsh Ankit Mokadam");
    expect(v.first_alphabet).toBe("D");
    expect(v.gender).toBe("Male");
    expect(validateBabyForm(v)).toBeNull();
    expect(reportColumns(v).customer_name).toBe("Dheer Ankit Mokadam");
  });
  it("uses NA for the second option when only one name is final", () => {
    const v = buildReportValues({ ...base, name2: "" });
    expect(v.option2_name).toBe("NA");
    expect(validateBabyForm(v)).toBeNull();
  });
  it("fails validation without an email", () => {
    expect(validateBabyForm(buildReportValues({ ...base, email: "" }))).toMatch(/Email/);
  });
  it("small helpers", () => {
    expect(reportGender("girl")).toBe("Female");
    expect(fullOption("Vyom", "", "")).toBe("Vyom");
    expect(reportMessage("blueprint", "Vyom", "https://x.com/r/CBB-1")).toContain("Please download your report from here: https://x.com/r/CBB-1");
  });
});

describe("report hand-off from Swar", () => {
  it("opens the right report page directly, with or without auto-generate", () => {
    expect(reportOpenUrl("perfect", "PBN-AB12-CD34")).toBe("/admin/reports/perfect-baby-name?report=PBN-AB12-CD34");
    expect(reportOpenUrl("blueprint", "CBB-AB12-CD34", true)).toBe("/admin/reports/complete-baby-blueprint?report=CBB-AB12-CD34&autogenerate=1");
  });
});
