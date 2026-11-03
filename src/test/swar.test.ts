import { describe, it, expect } from "vitest";
import { calculateSwar } from "@/lib/swar/swarCalculator";
import { DRIK_SWAR, NAKSHATRAS, getSwar } from "@/lib/swar/swarData";
import { numerologyAlternatives } from "@/lib/swar/chaldean";
import { formatDob, formatTime12 } from "@/lib/swar/swarMessage";

// Real orders sent by the client (Drik Panchang results). Times are IST.
const ORDERS: [string, string, string, string, number, string][] = [
  ["2026-10-14", "12:20", "Anuradha", "Anuradha", 2, "Nee, Ni, N"],
  ["2026-10-22", "10:13", "Shatabhisha", "Shatabhisha", 3, "See, Si, Shee, Shi, S"],
  ["2026-10-19", "07:09", "Uttara Ashadha", "Uttara Ashadha", 3, "Jaa, Ja, J"],
  ["2026-09-14", "17:41", "Swati", "Swati", 1, "Roo, Ru, R"],
  ["2026-10-30", "12:09", "Ardra", "Ardra", 1, "Ku, Koo, K"],
  ["2026-10-26", "16:02", "Ashwini", "Ashwini", 4, "Laa, La, L"],
];

describe("Swar calculator vs real client orders", () => {
  it.each(ORDERS)("%s %s", (dob, time, _label, nak, pada, swar) => {
    const r = calculateSwar(dob, time);
    expect(r.entry.nakshatra).toBe(nak);
    expect(r.entry.pada).toBe(pada);
    expect(r.entry.variants.join(", ")).toBe(swar);
    expect(r.nearBoundary).toBe(false);
  });

  it("numerology alternatives match the client's examples", () => {
    expect(numerologyAlternatives("N").sort()).toEqual(["E", "H", "X"]);
    expect(numerologyAlternatives("C").sort()).toEqual(["G", "L", "S"]);
  });
});

describe("Swar table integrity", () => {
  it("has 27 nakshatras x 4 padas with a Swar in each", () => {
    expect(NAKSHATRAS.length).toBe(27);
    expect(DRIK_SWAR.length).toBe(27);
    DRIK_SWAR.forEach((row) => { expect(row.length).toBe(4); row.forEach((s) => expect(s.length).toBeGreaterThan(0)); });
  });
  it("marks unverified variants as not confirmed", () => {
    expect(getSwar(17, 2).confirmed).toBe(true);
    expect(getSwar(2, 1).confirmed).toBe(false);
  });
});

describe("message formatting", () => {
  it("formats date and time like the client's messages", () => {
    expect(formatDob("2026-10-14")).toBe("14th October, 2026");
    expect(formatDob("2026-10-22")).toBe("22nd October, 2026");
    expect(formatDob("2026-10-19")).toBe("19th October, 2026");
    expect(formatTime12("12:20")).toBe("12:20 PM");
    expect(formatTime12("07:09")).toBe("7:09 AM");
    expect(formatTime12("00:05")).toBe("12:05 AM");
  });
});
