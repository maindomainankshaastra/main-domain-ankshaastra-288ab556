// @vitest-environment node
import { describe, expect, it } from "vitest";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { readFileSync } from "node:fs";
import { analyze } from "../engine.ts";
import type { Ephemeris, Location } from "../panchang.ts";
import { addDays, tzOffsetMs, zonedToUtc } from "../time.ts";
import { generateCSectionReport } from "./generator.ts";

const IST: Location = { lat: 28.6139, lon: 77.209, tz: "Asia/Kolkata", name: "Delhi" };
const norm = (x: number) => ((x % 360) + 360) % 360;
const DAY = 86400000;
const EPOCH = Date.UTC(2026, 10, 9, 21, 0);
/** Synthetic ephemeris (mean motions): enough to exercise the report layout without astronomy-engine. */
const fake: Ephemeris = {
  sunSidereal: (t) => norm(232 + ((t.getTime() - EPOCH) / DAY) * (360 / 365.2422)),
  moonSidereal: (t) => norm(232 + ((t.getTime() - EPOCH) / DAY) * 13.17639),
  ascendantSidereal: (t) => norm(((t.getTime() - EPOCH) / (23.9345 * 3600000)) * 360),
  sunrise: (from, loc) => next(from, loc, "06:52"),
  sunset: (from, loc) => next(from, loc, "17:30"),
};
function next(from: Date, loc: Location, hhmm: string): Date {
  const local = new Date(from.getTime() + tzOffsetMs(from.getTime(), loc.tz)).toISOString().slice(0, 10);
  for (let k = 0; k < 3; k++) { const c = zonedToUtc(addDays(local, k), hhmm, loc.tz); if (c > from) return c; }
  throw new Error("unreachable");
}

const ASSETS = process.env.C_SECTION_ASSETS ?? "public/c-section-assets";
const STATIC = process.env.C_SECTION_STATIC ?? "public/c-section-static";
/** Standard PDF fonts only know Latin-1, so unsupported characters (the rupee sign) become "?" in this test. */
const san = (t: string) => t.replace(/[^\x00-\xFF\u2018\u2019\u201C\u201D\u2022\u2013\u2014\u2026]/g, "?");

async function build(windowStart: string, windowEnd: string) {
  const result = analyze({ windowStart, windowEnd, location: IST }, fake);
  const bytes = await generateCSectionReport(
    { motherName: "Ms. Supriya Gupta", fatherName: "Mr. Ankit Gupta", motherDob: "1993-01-04", fatherDob: "1992-08-18", hospitalName: "Samarpan Hospital", city: "Delhi", result },
    {
      loadBytes: async (f) => new Uint8Array(readFileSync(f.startsWith("static/") ? `${STATIC}/${f.slice(7)}` : `${ASSETS}/${f}`)),
      async makeFonts(doc) {
        const mk = async (n: StandardFonts) => {
          const x = await doc.embedFont(n);
          const w = x.widthOfTextAtSize.bind(x), e = x.encodeText.bind(x);
          x.widthOfTextAtSize = (t, s) => w(san(t), s);
          x.encodeText = (t) => e(san(t));
          return x;
        };
        return { heading: await mk(StandardFonts.TimesRomanBold), body: await mk(StandardFonts.Helvetica), bold: await mk(StandardFonts.HelveticaBold), serif: await mk(StandardFonts.TimesRoman) };
      },
    },
  );
  return { bytes, doc: await PDFDocument.load(bytes), result };
}

describe("C-Section report PDF", () => {
  it("builds a full report for a one-week window", async () => {
    const { bytes, doc } = await build("2026-11-14", "2026-11-20");
    expect(bytes.length).toBeGreaterThan(100000);
    expect(doc.getPageCount()).toBeGreaterThan(35);
    expect(bytes.length).toBeLessThan(8_000_000); // static pages share one background image
    expect(doc.getTitle()).toBe("C-Section Dates Blueprint - Supriya Gupta & Ankit Gupta");
  });

  it("grows with the window (more Lo Shu and timeline pages) and still builds", async () => {
    const week = await build("2026-11-14", "2026-11-20");
    const month = await build("2026-11-14", "2026-12-14");
    expect(month.doc.getPageCount()).toBeGreaterThan(week.doc.getPageCount());
  });

  it("builds for a single-day window", async () => {
    const { doc } = await build("2026-11-19", "2026-11-19");
    expect(doc.getPageCount()).toBeGreaterThan(30);
  });
});
