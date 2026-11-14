import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { PDFDocument } from "pdf-lib";
import { buildNameFinderReport, type NameFinderAssets, type NameFinderReportInput } from "@/lib/swar/nameFinderReport";
import { buildNameFinderProfile } from "@/lib/swar/nameFinder";

const A = "public/name-finder-assets";
const file = (n: string) => new Uint8Array(readFileSync(`${A}/${n}`));
const statics = { 1: file("static-p01.jpg"), 2: file("static-p02.jpg"), 3: file("static-p03.jpg"), 13: file("static-p13.jpg"),
  14: file("static-p14.jpg"), 15: file("static-p15.jpg"), 16: file("static-p16.jpg") };
const assets = (withNoAnalysisIndex: boolean): NameFinderAssets => ({
  background: file("bg.jpg"), footprints: file("footprints.png"),
  statics: withNoAnalysisIndex ? { ...statics, 103: file("static-p03-no-analysis.jpg") } : statics,
});
const input = (analysis: NameFinderReportInput["analysis"]): NameFinderReportInput => ({
  dob: "2026-11-09", time: "17:01", place: "Mumbai, Maharashtra", gender: "girl", middleName: "Gaurang", middleIsFather: true,
  lastName: "Patel", swar: "Te, T", firstAlphabets: "Te, T", preference: "", package: { tier: "perfect", extraNames: false },
  profile: buildNameFinderProfile("2026-11-09", "girl", "Patel", "Gaurang", false)!,
  names: [{ name: "Tanisha", meaning: "Queen, ruler, noble and gracious" }], analysis,
});
const pages = async (i: NameFinderReportInput, a: NameFinderAssets) => (await PDFDocument.load(await buildNameFinderReport(i, a))).getPageCount();

describe("analysis page of the names report", () => {
  it("is part of the report when the parents shared names", async () => {
    const rows = [{ name: "Dheer", firstNo: 3, fullNo: 6, suitability: "Yes" }];
    expect(await pages(input(rows), assets(true))).toBe(14);
  });
  it("is left out when no names were shared, and the index loses its 08 line", async () => {
    expect(await pages(input([]), assets(true))).toBe(13);
    expect(await pages(input(undefined), assets(true))).toBe(13);
  });
  it("is kept if the edited index image is missing, so the index never lists a missing page", async () => {
    expect(await pages(input([]), assets(false))).toBe(14);
  });
});
