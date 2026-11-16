import { describe, expect, it } from "vitest";
import { analyze, gradeState, type CSectionInput } from "./engine.ts";
import { dateNumerology } from "./numerology.ts";
import { inGandanta, stateAt, timeline, type Ephemeris, type Location, type PanchangState } from "./panchang.ts";
import { addDays, tzOffsetMs, zonedToUtc } from "./time.ts";

const IST: Location = { lat: 28.6139, lon: 77.209, tz: "Asia/Kolkata", name: "Delhi" };
const norm = (x: number) => ((x % 360) + 360) % 360;
const DAY = 86400000;

/**
 * Synthetic ephemeris (mean motions) so the tests need no astronomy library: new moon at EPOCH,
 * sunrise 06:30 and sunset 17:30 local every day. It checks the engine's logic, not astronomical accuracy.
 */
const EPOCH = Date.UTC(2026, 10, 9, 21, 0);
const fake: Ephemeris = {
  sunSidereal: (t) => norm(232 + ((t.getTime() - EPOCH) / DAY) * (360 / 365.2422)),
  moonSidereal: (t) => norm(232 + ((t.getTime() - EPOCH) / DAY) * 13.17639),
  ascendantSidereal: (t) => norm(((t.getTime() - EPOCH) / (23.9345 * 3600000)) * 360),
  sunrise: (from, loc) => next(from, loc, "06:30"),
  sunset: (from, loc) => next(from, loc, "17:30"),
};
function next(from: Date, loc: Location, hhmm: string): Date {
  const local = new Date(from.getTime() + tzOffsetMs(from.getTime(), loc.tz)).toISOString().slice(0, 10);
  for (let k = 0; k < 3; k++) {
    const c = zonedToUtc(addDays(local, k), hhmm, loc.tz);
    if (c > from) return c;
  }
  throw new Error("unreachable");
}

const base = (o: Partial<PanchangState>): PanchangState => ({
  tithiNo: 5, tithi: "Panchami", paksha: "Shukla", tithiInPaksha: 5, nakshatra: "Pushya", rashi: "Taurus",
  yoga: "Siddhi", karana: "Bava", lagna: "Leo", moonGandanta: false, lagnaGandanta: false, panchak: false, moonLon: 100, ...o,
});

describe("numerology (matches the client's sample report)", () => {
  it("19, 20, 16 Nov 2026", () => {
    expect(dateNumerology("2026-11-19")).toMatchObject({ mulank: 1, bhagyank: 4, luckPct: 70 });
    expect(dateNumerology("2026-11-20")).toMatchObject({ mulank: 2, bhagyank: 5, luckPct: 60 });
    expect(dateNumerology("2026-11-16")).toMatchObject({ mulank: 7, bhagyank: 1, luckPct: 60 });
  });
});

describe("Excel grading", () => {
  const n100 = { mulank: 1, bhagyank: 9, luckPct: 100, classification: "Excellent" as const };
  it("averages the four tiers", () => {
    const g = gradeState(base({}), "Thursday", n100, "nakshatra");
    expect(g.grade).toBe(4);
    expect(g.exclusions).toEqual([]);
  });
  it("hard exclusions win over a high average", () => {
    expect(gradeState(base({ tithi: "Navami", tithiInPaksha: 9 }), "Monday", n100, "nakshatra").grade).toBe(1);
    expect(gradeState(base({ tithi: "Shashthi", tithiInPaksha: 6 }), "Thursday", n100, "nakshatra").grade).toBe(1); // Dagdha
    expect(gradeState(base({ moonGandanta: true }), "Monday", n100, "nakshatra").grade).toBe(1);
    expect(gradeState(base({}), "Monday", { ...n100, mulank: 8 }, "nakshatra").grade).toBe(1);
    expect(gradeState(base({}), "Monday", { ...n100, luckPct: 20 }, "nakshatra").grade).toBe(1);
    expect(gradeState(base({ rashi: "Scorpio", nakshatra: "Krittika" }), "Monday", n100, "nakshatra").grade).toBe(1);
  });
  it("Gand Mool: whole nakshatra in default mode, junction only in the other mode", () => {
    expect(gradeState(base({ nakshatra: "Revati" }), "Monday", n100, "nakshatra").grade).toBe(1);
    expect(gradeState(base({ nakshatra: "Revati" }), "Monday", n100, "gandanta-only").grade).toBe(4);
  });
});

describe("Gandanta zones", () => {
  it("is the last/first 3d20' around 0, 120 and 240 degrees", () => {
    expect(inGandanta(359)).toBe(true);
    expect(inGandanta(1)).toBe(true);
    expect(inGandanta(118)).toBe(true);
    expect(inGandanta(122)).toBe(true);
    expect(inGandanta(238)).toBe(true);
    expect(inGandanta(245)).toBe(false);
    expect(inGandanta(100)).toBe(false);
  });
});

describe("Panchang state", () => {
  it("tithi follows the Moon-Sun distance (12 degrees each)", () => {
    expect(stateAt(fake, new Date(EPOCH + 60000), IST).tithi).toBe("Pratipada");
    expect(stateAt(fake, new Date(EPOCH + 2 * DAY), IST).tithiNo).toBe(Math.floor(((13.17639 - 360 / 365.2422) * 2) / 12) + 1);
    const half = (180 / (13.17639 - 360 / 365.2422)) * DAY;
    const s = stateAt(fake, new Date(EPOCH + half + 60000), IST);
    expect(s.tithiNo).toBe(16); // just after the full moon -> Krishna Pratipada
    expect(s.paksha).toBe("Krishna");
  });
  it("timeline segments are contiguous and cover the whole range", () => {
    const a = zonedToUtc("2026-11-19", "00:00", IST.tz);
    const b = zonedToUtc("2026-11-20", "00:00", IST.tz);
    const segs = timeline(fake, IST, a, b);
    expect(segs[0].start.getTime()).toBe(a.getTime());
    expect(segs[segs.length - 1].end.getTime()).toBe(b.getTime());
    for (let i = 1; i < segs.length; i++) expect(segs[i].start.getTime()).toBe(segs[i - 1].end.getTime());
    expect(segs.length).toBeGreaterThan(3); // lagna changes several times a day
  });
});

describe("analyze()", () => {
  const input: CSectionInput = { windowStart: "2026-11-14", windowEnd: "2026-11-20", location: IST };
  const r = analyze(input, fake);

  it("returns every date of the window and a ranked top 3", () => {
    expect(r.days).toHaveLength(7);
    expect(r.top).toHaveLength(3);
    expect(r.ranked.map((d) => d.rank)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("a shubh window NEVER overlaps an avoid period (the client's no-clash rule)", () => {
    const longer = analyze({ windowStart: "2026-12-01", windowEnd: "2026-12-30", location: IST }, fake);
    let windows = 0;
    for (const d of [...r.days, ...longer.days]) {
      for (const w of d.windows) {
        windows++;
        for (const a of d.avoid) {
          // relaxed days may touch the extra factors (shown as cautions), never the core rules
          const core = ["rahu", "yamaganda", "gulika", "gandmool", "gandanta"].includes(a.kind);
          if (d.relaxed && !core) continue;
          const overlap = Math.min(w.end.getTime(), a.end.getTime()) - Math.max(w.start.getTime(), a.start.getTime());
          expect(overlap <= 0).toBe(true);
        }
        if (!d.relaxed) expect(w.cautions).toHaveLength(0);
      }
    }
    expect(windows).toBeGreaterThan(5); // the test must actually exercise windows
  });

  it("strict days rank before relaxed days", () => {
    const longer = analyze({ windowStart: "2026-12-01", windowEnd: "2026-12-30", location: IST }, fake);
    const withWin = longer.ranked.filter((d) => d.windows.length);
    const firstRelaxed = withWin.findIndex((d) => d.relaxed);
    if (firstRelaxed >= 0) expect(withWin.slice(firstRelaxed).every((d) => d.relaxed)).toBe(true);
  });

  it("windows stay inside OT hours and are at least the minimum length", () => {
    for (const d of r.days) {
      const s = zonedToUtc(d.date, "08:00", IST.tz).getTime();
      const e = zonedToUtc(d.date, "18:00", IST.tz).getTime();
      for (const w of d.windows) {
        expect(w.start.getTime() >= s && w.end.getTime() <= e).toBe(true);
        expect(w.minutes).toBeGreaterThanOrEqual(15);
      }
    }
  });

  it("Rahu Kalam is the right eighth of the day (Thursday = 6th part of 06:30-17:30)", () => {
    const thu = r.days.find((d) => d.weekday === "Thursday")!;
    expect(thu.parts!.rahu.start.getTime()).toBe(zonedToUtc(thu.date, "06:30", IST.tz).getTime() + (5 * 11 * 3600000) / 8);
  });

  it("rejects bad input", () => {
    expect(() => analyze({ ...input, windowEnd: "2026-11-01" }, fake)).toThrow();
    expect(() => analyze({ ...input, windowEnd: "2026-12-30" }, fake)).toThrow();
    expect(() => analyze({ ...input, otStart: "18:00", otEnd: "08:00" }, fake)).toThrow();
  });
});
