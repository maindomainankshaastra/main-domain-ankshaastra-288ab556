/**
 * C-Section date engine. Grading is the client's Excel logic (Layer 1 hard exclusions, Layer 2 tier average),
 * applied to every time segment of every date, plus Gand Mool and the extra factors. Shubh windows are the
 * graded-good segments minus every inauspicious period, so a recommended time can never clash with one.
 */
import { DAGDHA_TITHI_NO, MOON_SIGN_TIER, NAKSHATRA_TIER, TITHI_TIER } from "./tables.ts";
import { dateNumerology, luckTier, type DateNumerology } from "./numerology.ts";
import {
  BAD_YOGAS, GAND_MOOL, dayParts, stateAt, timeline,
  type DayParts, type Ephemeris, type Location, type PanchangState, type Period, type Segment,
} from "./panchang.ts";
import { WEEKDAYS, addDays, diffDays, weekdayOf, zonedToUtc } from "./time.ts";

export type Grade = 1 | 2 | 3 | 4;
export const GRADE_LABEL: Record<Grade, string> = { 1: "Avoided", 2: "Neutral", 3: "Auspicious", 4: "Highly Auspicious" };

export interface CSectionInput {
  /** Doctor's delivery window, "YYYY-MM-DD" (inclusive) */
  windowStart: string;
  windowEnd: string;
  location: Location;
  /** Hospital operation theatre hours, local "HH:mm". Default 08:00-18:00. */
  otStart?: string;
  otEnd?: string;
  /**
   * "nakshatra": the whole of the six Gand Mool nakshatras is avoided (default).
   * "gandanta-only": only the junction zone (last/first 3d20') is avoided.
   */
  gandMoolMode?: "nakshatra" | "gandanta-only";
  /** Extra factors beyond the Excel (all on by default). */
  bhadra?: boolean;
  badYoga?: boolean;
  panchak?: boolean;
  lagnaGandanta?: boolean;
  minWindowMinutes?: number;
  topN?: number;
}

export interface GradeResult {
  grade: Grade;
  /** Unrounded average of the four tiers (1 when a Layer 1 exclusion hits). */
  score: number;
  tiers: { nakshatra: number; tithi: number; moonSign: number; numerology: number };
  /** Layer 1 reasons. Empty when the segment is graded by average. */
  exclusions: string[];
}

export function gradeState(s: PanchangState, weekday: string, num: DateNumerology, gandMoolMode: "nakshatra" | "gandanta-only"): GradeResult {
  const tiers = {
    nakshatra: NAKSHATRA_TIER[s.nakshatra],
    tithi: TITHI_TIER[s.tithi].tier,
    moonSign: MOON_SIGN_TIER[s.rashi],
    numerology: luckTier(num.luckPct),
  };
  const ex: string[] = [];
  if (s.moonGandanta) ex.push(`Gandanta (Moon at the ${s.nakshatra} junction)`);
  if (gandMoolMode === "nakshatra" && GAND_MOOL.has(s.nakshatra)) ex.push(`Gand Mool nakshatra (${s.nakshatra})`);
  if (tiers.tithi === 1) ex.push(`${s.tithi} tithi (avoided tithi)`);
  if (s.tithiInPaksha === DAGDHA_TITHI_NO[weekday] && tiers.tithi !== 1) ex.push(`Dagdha tithi for ${weekday} (${s.tithi})`);
  if (num.mulank === 8 || num.bhagyank === 8) ex.push("Mulank or Bhagyank of the date is 8");
  if (num.luckPct <= 20) ex.push(`Numerology luck ${num.luckPct}% (Avoid band)`);
  if (s.rashi === "Scorpio" && tiers.nakshatra === 1) ex.push(`Moon in Scorpio with avoided nakshatra (${s.nakshatra})`);
  if (ex.length) return { grade: 1, score: 1, tiers, exclusions: ex };
  const score = (tiers.nakshatra + tiers.tithi + tiers.moonSign + tiers.numerology) / 4;
  return { grade: Math.round(score) as Grade, score, tiers, exclusions: [] };
}

export interface AvoidPeriod {
  kind: "rahu" | "yamaganda" | "gulika" | "gandmool" | "gandanta" | "bhadra" | "yoga" | "panchak" | "lagna-gandanta" | "grading";
  label: string;
  start: Date;
  end: Date;
}

export interface ShubhWindow {
  start: Date;
  end: Date;
  minutes: number;
  grade: Grade;
  score: number;
  lagna: string;
  nakshatra: string;
  tithi: string;
  moonSign: string;
  yoga: string;
  karana: string;
  /** Informational: overlaps Abhijit / Vijaya muhurat */
  tags: string[];
  /** Cautions touching this window: Panchak always; Bhadra / Ashubh Yoga / Gandanta Lagna only on relaxed days. */
  cautions: string[];
}

export interface DayResult {
  date: string;
  weekday: string;
  numerology: DateNumerology;
  sunrise: Date | null;
  sunset: Date | null;
  parts: DayParts | null;
  /** Panchang at sunrise (like Drik Panchang's day header) */
  atSunrise: PanchangState | null;
  /** Times at which tithi / nakshatra / moon sign change during this civil day */
  changes: { at: Date; what: string }[];
  /** Everything to avoid while the OT is open (clipped to OT hours) */
  avoid: AvoidPeriod[];
  /** Clean shubh windows (grade >= Auspicious, no clash with anything in `avoid`) in time order */
  windows: ShubhWindow[];
  /** Best 3 windows of the day by grade, score, length */
  recommended: ShubhWindow[];
  /** Best grade of any segment by the Excel logic alone (before the clash removal) */
  excelGrade: Grade;
  /** Grade of the best clean window (1 = no clean shubh window) */
  grade: Grade;
  score: number;
  cleanMinutes: number;
  /** Why the whole date is avoided (Mulank/Bhagyank 8, luck <= 20%) */
  dateReasons: string[];
  /** Why the date had no clean window, if so */
  noWindowReason?: string;
  /**
   * true = no window was clean on the extra factors (Bhadra, Ashubh Yoga, Gandanta Lagna), so the windows
   * here only pass the client's core rules (Excel grading, Gand Mool/Gandanta, Rahu/Yamaganda/Gulika). See each window's `cautions`.
   */
  relaxed: boolean;
  /** Informational notes that do NOT exclude anything (e.g. Panchak). Also appear as a caution on each affected window. */
  notes: string[];
  rank?: number;
}

export interface CSectionResult {
  input: Required<Pick<CSectionInput, "otStart" | "otEnd" | "gandMoolMode" | "minWindowMinutes" | "topN">> & CSectionInput;
  days: DayResult[];
  ranked: DayResult[];
  top: DayResult[];
  warnings: string[];
}

const MIN = 60000;

function subtract(base: Period, blockers: Period[]): Period[] {
  let out: Period[] = [base];
  for (const b of blockers) {
    const next: Period[] = [];
    for (const p of out) {
      if (b.end <= p.start || b.start >= p.end) { next.push(p); continue; }
      if (b.start > p.start) next.push({ start: p.start, end: b.start });
      if (b.end < p.end) next.push({ start: b.end, end: p.end });
    }
    out = next;
  }
  return out;
}

const overlapMin = (a: Period, b: Period) => Math.max(0, Math.min(a.end.getTime(), b.end.getTime()) - Math.max(a.start.getTime(), b.start.getTime())) / MIN;

/** Extra (non-Excel) inauspicious conditions that hold for the whole of a segment. */
function segmentAvoids(s: PanchangState, cfg: Required<Pick<CSectionInput, "gandMoolMode" | "bhadra" | "badYoga" | "panchak" | "lagnaGandanta">>): { kind: AvoidPeriod["kind"]; label: string }[] {
  const out: { kind: AvoidPeriod["kind"]; label: string }[] = [];
  if (s.moonGandanta) out.push({ kind: "gandanta", label: `Gandanta (${s.nakshatra} junction)` });
  if (cfg.gandMoolMode === "nakshatra" && GAND_MOOL.has(s.nakshatra)) out.push({ kind: "gandmool", label: `Gand Mool nakshatra: ${s.nakshatra}` });
  if (cfg.bhadra && s.karana === "Vishti") out.push({ kind: "bhadra", label: "Bhadra (Vishti Karana)" });
  if (cfg.badYoga && BAD_YOGAS.has(s.yoga)) out.push({ kind: "yoga", label: `Ashubh Yoga: ${s.yoga}` });
  if (cfg.panchak && s.panchak) out.push({ kind: "panchak", label: `Panchak (Moon in ${s.nakshatra})` });
  if (cfg.lagnaGandanta && s.lagnaGandanta) out.push({ kind: "lagna-gandanta", label: `Gandanta Lagna (${s.lagna} junction)` });
  return out;
}

function mergeAvoids(list: AvoidPeriod[]): AvoidPeriod[] {
  const sorted = [...list].sort((a, b) => a.start.getTime() - b.start.getTime());
  const out: AvoidPeriod[] = [];
  for (const p of sorted) {
    const prev = [...out].reverse().find((q) => q.kind === p.kind && q.label === p.label);
    if (prev && prev.end.getTime() >= p.start.getTime()) prev.end = new Date(Math.max(prev.end.getTime(), p.end.getTime()));
    else out.push({ ...p });
  }
  return out.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function analyzeDay(ymd: string, cfgIn: CSectionResult["input"], eph: Ephemeris, relaxed = false): DayResult {
  const loc = cfgIn.location;
  const weekdayIdx = weekdayOf(ymd);
  const weekday = WEEKDAYS[weekdayIdx];
  const num = dateNumerology(ymd);
  const dayStart = zonedToUtc(ymd, "00:00", loc.tz);
  const dayEnd = zonedToUtc(addDays(ymd, 1), "00:00", loc.tz);
  const ot: Period = { start: zonedToUtc(ymd, cfgIn.otStart, loc.tz), end: zonedToUtc(ymd, cfgIn.otEnd, loc.tz) };

  const sunrise = eph.sunrise(dayStart, loc);
  const sunset = sunrise ? eph.sunset(sunrise, loc) : null;
  const parts = sunrise && sunset ? dayParts(sunrise, sunset, weekdayIdx) : null;
  const atSunrise = sunrise ? stateAt(eph, sunrise, loc) : null;

  const segs: Segment[] = timeline(eph, loc, dayStart, dayEnd);
  const extraCfg = {
    gandMoolMode: cfgIn.gandMoolMode,
    bhadra: cfgIn.bhadra ?? true, badYoga: cfgIn.badYoga ?? true, panchak: cfgIn.panchak ?? true, lagnaGandanta: cfgIn.lagnaGandanta ?? true,
  };

  const changes: DayResult["changes"] = [];
  for (let i = 1; i < segs.length; i++) {
    const a = segs[i - 1].state, b = segs[i].state, at = segs[i].start;
    if (a.tithi !== b.tithi) changes.push({ at, what: `Tithi: ${a.tithi} -> ${b.tithi}` });
    if (a.nakshatra !== b.nakshatra) changes.push({ at, what: `Nakshatra: ${a.nakshatra} -> ${b.nakshatra}` });
    if (a.rashi !== b.rashi) changes.push({ at, what: `Moon sign: ${a.rashi} -> ${b.rashi}` });
  }

  // avoid periods (clipped to OT hours) + shubh windows
  const avoidRaw: AvoidPeriod[] = [];
  const blockers: Period[] = [];
  if (parts) {
    avoidRaw.push({ kind: "rahu", label: "Rahu Kalam", ...parts.rahu });
    avoidRaw.push({ kind: "yamaganda", label: "Yamaganda", ...parts.yamaganda });
    avoidRaw.push({ kind: "gulika", label: "Gulika Kalam", ...parts.gulika });
    blockers.push(parts.rahu, parts.yamaganda, parts.gulika);
  }
  const windows: ShubhWindow[] = [];
  const panchakNotes = new Set<string>();
  let excelGrade: Grade = 1;
  for (const seg of segs) {
    const g = gradeState(seg.state, weekday, num, cfgIn.gandMoolMode);
    const clip: Period = { start: new Date(Math.max(seg.start.getTime(), ot.start.getTime())), end: new Date(Math.min(seg.end.getTime(), ot.end.getTime())) };
    if (clip.end <= clip.start) continue;
    if (g.grade > excelGrade) excelGrade = g.grade;
    const extra = segmentAvoids(seg.state, extraCfg);
    // Panchak is a caution only: it is not an avoid time and never blocks or re-ranks a date
    for (const e of extra) if (e.kind !== "panchak") avoidRaw.push({ ...e, ...clip });
    for (const e of extra) if (e.kind === "panchak") panchakNotes.add(e.label);
    // grading exclusions that are tied to the time (tithi etc.) are shown as avoid time too
    const timeBound = g.exclusions.filter((x) => !/^(Mulank|Numerology)/.test(x) && !/^Gand/.test(x));
    for (const label of timeBound) avoidRaw.push({ kind: "grading", label, ...clip });
    const coreBlock = extra.filter((e) => e.kind === "gandanta" || e.kind === "gandmool");
    const panchak = extra.filter((e) => e.kind === "panchak");
    const soft = extra.filter((e) => e.kind !== "gandanta" && e.kind !== "gandmool" && e.kind !== "panchak");
    if (g.grade < 3 || coreBlock.length || (!relaxed && soft.length)) continue;
    for (const iv of subtract(clip, blockers)) {
      const minutes = (iv.end.getTime() - iv.start.getTime()) / MIN;
      if (minutes < cfgIn.minWindowMinutes) continue;
      const tags: string[] = [];
      if (parts && overlapMin(iv, parts.abhijit) >= 10) tags.push("Abhijit Muhurat");
      if (parts && overlapMin(iv, parts.vijaya) >= 10) tags.push("Vijaya Muhurat");
      windows.push({
        start: iv.start, end: iv.end, minutes, grade: g.grade, score: g.score,
        lagna: seg.state.lagna, nakshatra: seg.state.nakshatra, tithi: seg.state.tithi,
        moonSign: seg.state.rashi, yoga: seg.state.yoga, karana: seg.state.karana, tags,
        cautions: [...soft.map((e) => e.label), ...panchak.map((e) => e.label)],
      });
    }
  }
  const avoid = mergeAvoids(avoidRaw.filter((a) => a.end > ot.start && a.start < ot.end).map((a) => ({
    ...a, start: new Date(Math.max(a.start.getTime(), ot.start.getTime())), end: new Date(Math.min(a.end.getTime(), ot.end.getTime())),
  })));

  windows.sort((a, b) => a.start.getTime() - b.start.getTime());
  const byQuality = [...windows].sort((a, b) => b.grade - a.grade || b.score - a.score || b.minutes - a.minutes);
  const dateReasons: string[] = [];
  if (num.mulank === 8 || num.bhagyank === 8) dateReasons.push("Mulank or Bhagyank of the date is 8");
  if (num.luckPct <= 20) dateReasons.push(`Numerology luck ${num.luckPct}% (Avoid band)`);

  let noWindowReason: string | undefined;
  if (!windows.length) {
    noWindowReason = dateReasons[0]
      ?? (excelGrade < 3 ? "Panchang grade stays Neutral/Avoided during OT hours" : "Every good period clashes with an inauspicious time or falls outside OT hours");
  }
  return {
    date: ymd, weekday, numerology: num, sunrise, sunset, parts, atSunrise, changes, avoid,
    windows, recommended: byQuality.slice(0, 3), excelGrade,
    grade: (byQuality[0]?.grade ?? 1) as Grade, score: byQuality[0]?.score ?? 0,
    cleanMinutes: windows.reduce((s, w) => s + w.minutes, 0), dateReasons, noWindowReason, relaxed,
    notes: [...panchakNotes].map((l) => `${l}: caution only, date not excluded`),
  };
}

export function analyze(input: CSectionInput, eph: Ephemeris): CSectionResult {
  const cfg: CSectionResult["input"] = {
    ...input,
    otStart: input.otStart || "08:00", otEnd: input.otEnd || "18:00",
    gandMoolMode: input.gandMoolMode ?? "nakshatra",
    minWindowMinutes: input.minWindowMinutes ?? 15, topN: input.topN ?? 3,
  };
  const span = diffDays(cfg.windowStart, cfg.windowEnd);
  if (!(span >= 0)) throw new Error("Delivery window end date is before the start date");
  if (span > 30) throw new Error("Delivery window is longer than 31 days - please keep it to the doctor's window");
  if (cfg.otEnd <= cfg.otStart) throw new Error("OT end time must be after OT start time");

  const days: DayResult[] = [];
  const warnings: string[] = [];
  for (let i = 0; i <= span; i++) {
    const date = addDays(cfg.windowStart, i);
    let d = analyzeDay(date, cfg, eph);
    if (!d.windows.length) {
      // nothing clean on the extra factors: fall back to the core rules, and flag it
      const soft = analyzeDay(date, cfg, eph, true);
      if (soft.windows.length) d = soft;
    }
    if (!d.sunrise) warnings.push(`${d.date}: no sunrise at this location, Rahu Kalam etc. not available`);
    days.push(d);
  }
  const ranked = [...days].sort((a, b) =>
    Number(b.windows.length > 0) - Number(a.windows.length > 0) ||
    Number(a.relaxed) - Number(b.relaxed) ||
    b.grade - a.grade || b.score - a.score || b.numerology.luckPct - a.numerology.luckPct ||
    b.cleanMinutes - a.cleanMinutes || a.date.localeCompare(b.date));
  ranked.forEach((d, i) => { d.rank = i + 1; });
  const top = ranked.slice(0, cfg.topN);
  const withWindow = top.filter((d) => d.windows.length).length;
  for (const d of top) if (d.relaxed) warnings.push(`${d.date}: no time is clean on Bhadra / Ashubh Yoga / Gandanta Lagna, so its windows carry a caution.`);
  if (withWindow < cfg.topN) warnings.push(`Only ${withWindow} date(s) in this window have a clean shubh time. Ask the doctor for a wider window if possible.`);
  return { input: cfg, days, ranked, top, warnings };
}
