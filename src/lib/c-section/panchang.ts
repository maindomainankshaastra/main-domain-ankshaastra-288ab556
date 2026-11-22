/**
 * Panchang engine (pure logic). Everything astronomical comes through the `Ephemeris` interface so this file
 * has no dependencies; `ephemeris.ts` plugs in astronomy-engine (Lahiri ayanamsa, same system as Drik Panchang).
 */

export interface Location {
  lat: number;
  lon: number;
  /** IANA zone, e.g. "Asia/Kolkata" */
  tz: string;
  name?: string;
}

export interface Ephemeris {
  /** Sidereal (Lahiri) longitudes in degrees 0..360 */
  sunSidereal(t: Date): number;
  moonSidereal(t: Date): number;
  /** Sidereal longitude of the rising degree (Lagna) */
  ascendantSidereal(t: Date, loc: Location): number;
  /** First sunrise / sunset after `from` (within a day). null in polar cases. */
  sunrise(from: Date, loc: Location): Date | null;
  sunset(from: Date, loc: Location): Date | null;
}

export const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha",
  "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
] as const;

export const RASHIS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

const TITHI_NAMES = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami",
  "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi",
];

const YOGAS = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda",
  "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva",
  "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti",
];
/** The nine classically inauspicious yogas. */
export const BAD_YOGAS = new Set(["Vishkambha", "Atiganda", "Shula", "Ganda", "Vyaghata", "Vajra", "Vyatipata", "Parigha", "Vaidhriti"]);

const MOVABLE_KARANAS = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"];
const FIXED_KARANAS = ["Shakuni", "Chatushpada", "Naga"];

/** Gand Mool nakshatras (junction nakshatras of Mercury/Ketu). */
export const GAND_MOOL = new Set(["Ashwini", "Ashlesha", "Magha", "Jyeshtha", "Mula", "Revati"]);

const NAK_SPAN = 360 / 27;
const GANDANTA_DEG = NAK_SPAN / 4; // 3 deg 20 min = one navamsa

/** Last 3d20' of Ashlesha/Jyeshtha/Revati + first 3d20' of Magha/Mula/Ashwini. */
export function inGandanta(lon: number): boolean {
  const l = ((lon % 360) + 360) % 360;
  for (const junction of [0, 120, 240]) {
    const d = (l - junction + 540) % 360 - 180; // signed distance from the junction, -180..180
    if (d >= -GANDANTA_DEG && d < GANDANTA_DEG) return true;
  }
  return false;
}

export interface PanchangState {
  tithiNo: number; // 1..30
  tithi: string;
  paksha: "Shukla" | "Krishna";
  tithiInPaksha: number; // 1..15
  nakshatra: string;
  rashi: string; // Moon sign
  yoga: string;
  karana: string;
  lagna: string;
  moonGandanta: boolean;
  lagnaGandanta: boolean;
  /** Moon in Aquarius/Pisces (Dhanishta 2nd half .. Revati) */
  panchak: boolean;
  moonLon: number;
}

const norm = (x: number) => ((x % 360) + 360) % 360;

export function stateAt(eph: Ephemeris, t: Date, loc: Location): PanchangState {
  const sun = eph.sunSidereal(t);
  const moon = eph.moonSidereal(t);
  const asc = eph.ascendantSidereal(t, loc);
  const elong = norm(moon - sun);
  const tithiNo = Math.floor(elong / 12) + 1;
  const paksha = tithiNo <= 15 ? "Shukla" : "Krishna";
  const tithiInPaksha = tithiNo <= 15 ? tithiNo : tithiNo - 15;
  const tithi = tithiInPaksha === 15 ? (paksha === "Shukla" ? "Purnima" : "Amavasya") : TITHI_NAMES[tithiInPaksha - 1];
  const k = Math.floor(elong / 6); // 0..59
  const karana = k === 0 ? "Kimstughna" : k >= 57 ? FIXED_KARANAS[k - 57] : MOVABLE_KARANAS[(k - 1) % 7];
  return {
    tithiNo, tithi, paksha, tithiInPaksha,
    nakshatra: NAKSHATRAS[Math.floor(moon / NAK_SPAN)],
    rashi: RASHIS[Math.floor(moon / 30)],
    yoga: YOGAS[Math.floor(norm(sun + moon) / NAK_SPAN)],
    karana,
    lagna: RASHIS[Math.floor(asc / 30)],
    moonGandanta: inGandanta(moon),
    lagnaGandanta: inGandanta(asc),
    panchak: moon >= 300,
    moonLon: moon,
  };
}

const keyOf = (s: PanchangState) =>
  [s.tithiNo, s.nakshatra, s.rashi, s.yoga, s.karana, s.lagna, s.moonGandanta, s.lagnaGandanta].join("|");

export interface Segment {
  start: Date;
  end: Date;
  state: PanchangState;
}

/**
 * Splits [start, end] into segments inside which tithi, nakshatra, moon sign, yoga, karana, lagna and the
 * gandanta flags do not change. Boundaries are refined by bisection to about one second.
 */
export function timeline(eph: Ephemeris, loc: Location, start: Date, end: Date, stepMs = 5 * 60 * 1000): Segment[] {
  const out: Segment[] = [];
  let segStart = start;
  let prevT = start;
  let prevState = stateAt(eph, start, loc);
  let segState = prevState;
  let prevKey = keyOf(prevState);
  for (let ms = start.getTime() + stepMs; ; ms += stepMs) {
    const t = new Date(Math.min(ms, end.getTime()));
    const st = stateAt(eph, t, loc);
    const k = keyOf(st);
    if (k !== prevKey) {
      let lo = prevT.getTime();
      let hi = t.getTime();
      while (hi - lo > 1000) {
        const mid = Math.floor((lo + hi) / 2);
        if (keyOf(stateAt(eph, new Date(mid), loc)) === prevKey) lo = mid; else hi = mid;
      }
      const boundary = new Date(hi);
      out.push({ start: segStart, end: boundary, state: segState });
      segStart = boundary;
      segState = stateAt(eph, boundary, loc);
      prevKey = keyOf(segState);
    }
    prevT = t;
    prevState = st;
    if (t.getTime() >= end.getTime()) break;
  }
  out.push({ start: segStart, end, state: segState });
  return out;
}

export interface Period {
  start: Date;
  end: Date;
}

export interface DayParts {
  rahu: Period;
  yamaganda: Period;
  gulika: Period;
  abhijit: Period;
  vijaya: Period;
}

// 1-based eighth of the day, by weekday (0 = Sunday)
const RAHU_PART = [8, 2, 7, 5, 6, 4, 3];
const YAMA_PART = [5, 4, 3, 2, 1, 7, 6];
const GULIKA_PART = [7, 6, 5, 4, 3, 2, 1];

/** Daytime periods from sunrise/sunset. Day = 8 equal parts (Rahu/Yama/Gulika) or 15 muhurtas (Abhijit = 8th, Vijaya = 11th). */
export function dayParts(sunrise: Date, sunset: Date, weekday: number): DayParts {
  const sr = sunrise.getTime();
  const len = sunset.getTime() - sr;
  const eighth = (n: number): Period => ({ start: new Date(sr + ((n - 1) * len) / 8), end: new Date(sr + (n * len) / 8) });
  const muhurta = (n: number): Period => ({ start: new Date(sr + ((n - 1) * len) / 15), end: new Date(sr + (n * len) / 15) });
  return {
    rahu: eighth(RAHU_PART[weekday]),
    yamaganda: eighth(YAMA_PART[weekday]),
    gulika: eighth(GULIKA_PART[weekday]),
    abhijit: muhurta(8),
    vijaya: muhurta(11),
  };
}


/**
 * Varjyam (Tyajyam) start ghati per nakshatra, as listed in Drik Panchang's Nakshatra Thyajyam table
 * (its "Tyajya Ghatis" N..N+3 means the window starts after N-1 of the nakshatra's 60 ghatis).
 * Varjyam lasts 4 ghatis = 1/15 of the nakshatra's real duration.
 */
const VARJYAM_START_GHATI = [50, 24, 30, 40, 14, 21, 30, 20, 32, 30, 20, 18, 21, 20, 14, 14, 10, 14, 56, 24, 20, 10, 10, 18, 16, 24, 30];

export interface NakshatraSpan { index: number; start: Date; end: Date }

/** Nakshatra spans (exact start/end by bisection) covering [from, to]. The first/last span may start before / end after. */
export function nakshatraSpans(eph: Ephemeris, from: Date, to: Date): NakshatraSpan[] {
  const idx = (t: number) => Math.floor(eph.moonSidereal(new Date(t)) / NAK_SPAN) % 27;
  const step = 10 * 60 * 1000;
  const first = from.getTime() - 30 * 3600 * 1000; // a nakshatra lasts at most ~27 h
  const out: NakshatraSpan[] = [];
  let prevT = first, prevI = idx(first), segStart = first;
  for (let t = first + step; t <= to.getTime() + 30 * 3600 * 1000; t += step) {
    const i = idx(t);
    if (i !== prevI) {
      let lo = prevT, hi = t;
      while (hi - lo > 1000) { const mid = Math.floor((lo + hi) / 2); if (idx(mid) === prevI) lo = mid; else hi = mid; }
      out.push({ index: prevI, start: new Date(segStart), end: new Date(hi) });
      segStart = hi; prevI = i;
    }
    prevT = t;
  }
  return out.filter((s) => s.end > from && s.start < to).slice();
}

/** Varjyam windows that START between `from` and `to` (Drik lists a day from sunrise to the next sunrise). */
export function varjyamWindows(eph: Ephemeris, from: Date, to: Date): Period[] {
  const out: Period[] = [];
  for (const sp of nakshatraSpans(eph, from, to)) {
    const dur = sp.end.getTime() - sp.start.getTime();
    const start = sp.start.getTime() + (VARJYAM_START_GHATI[sp.index] / 60) * dur;
    if (start >= from.getTime() && start < to.getTime()) out.push({ start: new Date(start), end: new Date(start + dur / 15) });
  }
  return out;
}


/**
 * Dur Muhurtam: which of the 15 day muhurtas (sunrise to sunset) / 15 night muhurtas (sunset to next sunrise)
 * are inauspicious on each weekday (0 = Sunday). Each was checked against Drik Panchang's printed times:
 * Sun, Mon, Tue, Wed, Thu, Fri and Sat all match.
 */
const DUR_MUHURTAM: Record<number, { day: number[]; night: number[] }> = {
  0: { day: [14], night: [] }, 1: { day: [9, 12], night: [] }, 2: { day: [4], night: [7] }, 3: { day: [8], night: [] },
  4: { day: [6, 12], night: [] }, 5: { day: [4, 9], night: [] }, 6: { day: [1, 2], night: [] },
};

export interface DrikDayTimes {
  brahma: Period; godhuli: Period; nishita: Period | null; durMuhurtam: Period[]; varjyam: Period[]; nextSunrise: Date | null;
}

/** Drik-Panchang style daily times that depend on sunrise / sunset / the Moon's nakshatra. `loc` is the hospital location. */
export function drikDayTimes(eph: Ephemeris, loc: Location, ymd: string, sunrise: Date, sunset: Date): DrikDayTimes {
  const sr = sunrise.getTime(), ss = sunset.getTime(), MIN = 60000;
  const prevSunset = eph.sunset(new Date(sr - 20 * 3600000), loc);
  const nextSunrise = eph.sunrise(new Date(ss), loc);
  // Brahma Muhurta: the 2nd-last night muhurta before sunrise (1/15 of the night each); Drik prints 04:29-05:22 for a 06:15 sunrise
  const preNight = prevSunset ? (sr - prevSunset.getTime()) / 15 : 48 * MIN;
  const brahma = { start: new Date(sr - 2 * preNight), end: new Date(sr - preNight) };
  // Godhuli: Drik prints about 26-27 minutes starting a minute or two before sunset
  const godhuli = { start: new Date(ss - 1 * MIN), end: new Date(ss + 25 * MIN) };
  const night = nextSunrise ? (nextSunrise.getTime() - ss) / 15 : 54 * MIN;
  const nishita = nextSunrise ? { start: new Date(ss + 7 * night), end: new Date(ss + 8 * night) } : null;
  const dow = new Date(`${ymd}T00:00:00Z`).getUTCDay();
  const dayM = (ss - sr) / 15, rule = DUR_MUHURTAM[dow];
  const durMuhurtam = [
    ...rule.day.map((n) => ({ start: new Date(sr + (n - 1) * dayM), end: new Date(sr + n * dayM) })),
    ...rule.night.map((n) => ({ start: new Date(ss + (n - 1) * night), end: new Date(ss + n * night) })),
  ];
  const varjyam = nextSunrise ? varjyamWindows(eph, sunrise, nextSunrise) : [];
  return { brahma, godhuli, nishita, durMuhurtam, varjyam, nextSunrise };
}
