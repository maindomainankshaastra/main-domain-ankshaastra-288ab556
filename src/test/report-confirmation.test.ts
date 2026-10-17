import { describe, expect, it } from "vitest";
import { reportConfirmationPolicy } from "@/data/reportConfirmation";

describe("Report confirmation policy", () => {
  it("delivers all reports by email", () => {
    expect(reportConfirmationPolicy.channel).toBe("email");
  });
  it("identifies the requested confirmation sender", () => {
    expect(reportConfirmationPolicy.sender).toBe("no-reply@ankshaastra.in");
  });
  it("asks customers to check after one hour", () => {
    expect(reportConfirmationPolicy.checkAfterHours).toBe(1);
  });
  it("excludes 11 PM through 7 AM", () => {
    expect([reportConfirmationPolicy.excludedStartHour, reportConfirmationPolicy.excludedEndHour]).toEqual([23, 7]);
  });
});