import type { PDFDocument, PDFPage } from "pdf-lib";
import type { DayResult, CSectionResult } from "../engine.ts";
import { GRADE_LABEL } from "../engine.ts";
import { dayStatus, avoidReasons, mergedAvoid } from "../insights.ts";
import { babyLoshu } from "../loshu.ts";
import { dateNumerology } from "../numerology.ts";
import { fmtRange, fmtTime, weekdayOf, zonedToUtc } from "../time.ts";
import { Flow, type Mark } from "./flow.ts";
import {
  drawText, drawTextC, drawTextR, hLine, linkAnnotation, newPage, ornament, pageTitle, rect, roundRect, wrapLines, drawPara, fitSize,
  type Assets, type Fonts,
} from "./draw.ts";
import { C, CONTENT_W, MARGIN_L, MARGIN_R, PAGE_W, SOCIAL_LINKS } from "./theme.ts";

export interface ReportInput {
  motherName: string;
  fatherName: string;
  /** "YYYY-MM-DD" */
  motherDob: string;
  fatherDob: string;
  hospitalName: string;
  city: string;
  result: CSectionResult;
  contact?: { phone: string; email: string; site: string };
  /** Offer prices for page "Special Offer". Defaults to the client's package prices. */
  offers?: { perfect: { price: number; original: number }; blueprint: { price: number; original: number } };
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const longDate = (ymd: string) => { const [y, m, d] = ymd.split("-").map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };
export const slashDate = (ymd: string) => { const [y, m, d] = ymd.split("-"); return `${d}/${m}/${y}`; };
const TITLES = /^(mr|mrs|ms|miss|dr|shri|smt|shrimati|master)\.?$/i;
export function cleanName(n: string): string {
  const parts = n.trim().split(/\s+/).filter(Boolean);
  while (parts.length > 1 && TITLES.test(parts[0])) parts.shift();
  return parts.join(" ");
}
export const firstName = (n: string) => cleanName(n).split(" ")[0] ?? "";

/** "Navami until 07:06 AM, then Dashami" from the day's change list (only changes after sunrise). */
function changeLine(d: DayResult, kind: "Tithi" | "Nakshatra" | "Moon sign", base: string, tz: string): string {
  const re = new RegExp(`^${kind}: (.+) -> (.+)$`);
  let cur = base;
  const parts: string[] = [];
  for (const c of d.changes) {
    const m = re.exec(c.what);
    if (!m || (d.sunrise && c.at <= d.sunrise)) continue;
    parts.push(`${cur} until ${fmtTime(c.at, tz)}`);
    cur = m[2];
  }
  parts.push(cur);
  return parts.join(", then ");
}

const AVOID_ORDER = ["rahu", "yamaganda", "gulika", "gandmool", "gandanta", "grading", "bhadra", "yoga", "panchak", "lagna-gandanta"];

/** Avoid periods grouped by name, e.g. "Gandanta Lagna: 09:51 AM to 10:05 AM, 03:46 PM to 03:56 PM". */
export function avoidGrouped(d: DayResult, tz: string): string[] {
  const groups = new Map<string, { order: number; times: string[] }>();
  for (const a of d.avoid) {
    const root = a.label.replace(/\s*\(.*\)$/, "");
    const g = groups.get(root) ?? { order: AVOID_ORDER.indexOf(a.kind), times: [] };
    g.times.push(fmtRange(a.start, a.end, tz));
    groups.set(root, g);
  }
  return [...groups.entries()].sort((x, y) => x[1].order - y[1].order).map(([k, g]) => `${k}: ${g.times.join(", ")}`);
}

const shortCaution = (c: string) => c.split(/[:(]/)[0].trim();

export function windowLines(d: DayResult, tz: string, all = false): string[] {
  const list = all ? d.windows : d.recommended;
  return list.map((w) => {
    const extra = [...w.tags, ...(w.cautions.length ? [`caution: ${[...new Set(w.cautions.map(shortCaution))].join(", ")}`] : [])];
    return `${fmtRange(w.start, w.end, tz)} (${w.lagna} lagna${extra.length ? ", " + extra.join(", ") : ""})`;
  });
}

function dayRows(d: DayResult, tz: string): [string, string][] {
  const s = d.atSunrise;
  const gm = d.avoid.filter((a) => a.kind === "gandmool" || a.kind === "gandanta").map((a) => `${a.label}: ${fmtRange(a.start, a.end, tz)}`);
  const rows: [string, string][] = [
    ["Date", longDate(d.date)],
    ["Weekday", d.weekday],
    ["Paksha", s ? `${s.paksha} Paksha` : "-"],
    ["Tithi", s ? changeLine(d, "Tithi", s.tithi, tz) : "-"],
    ["Nakshatra", s ? changeLine(d, "Nakshatra", s.nakshatra, tz) : "-"],
    ["Moon Sign", s ? changeLine(d, "Moon sign", s.rashi, tz) : "-"],
    ["Yoga & Karana", s ? `${s.yoga} yoga, ${s.karana} karana` : "-"],
    ["Sunrise / Sunset", d.sunrise && d.sunset ? `${fmtTime(d.sunrise, tz)} / ${fmtTime(d.sunset, tz)}` : "-"],
    ["Gand Mool Check", gm.length ? gm.join("\n") : "Clear during OT hours"],
    ["Mulank", String(d.numerology.mulank)],
    ["Bhagyank", String(d.numerology.bhagyank)],
    ["Date Numerology Luck\n(Mulank x Bhagyank)", `${d.numerology.luckPct}% (${d.numerology.classification})`],
    ["Time to Avoid", avoidGrouped(d, tz).join("\n") || "Nothing during OT hours"],
    ["Shubh Muhurat", d.windows.length ? windowLines(d, tz).join("\n") : `None: ${d.noWindowReason ?? ""}`],
  ];
  if (d.notes.length) rows.push(["Note", d.notes.join("\n")]);
  return rows;
}

/* ------------------------------------------------------------------ */

export function drawCover(doc: PDFDocument, f: Fonts, a: Assets, input: ReportInput): PDFPage {
  const page = newPage(doc, f, a);
  const lw = 190;
  page.drawImage(a.logo, { x: PAGE_W / 2 - lw / 2, y: 841.89 - 54 - lw * (a.logo.height / a.logo.width), width: lw, height: lw * (a.logo.height / a.logo.width) });
  const iw = 205, ih = iw * (a.illustration.height / a.illustration.width);
  page.drawImage(a.illustration, { x: PAGE_W / 2 - iw / 2, y: 841.89 - 132 - ih, width: iw, height: ih });
  drawTextC(page, "C-Section Dates", 368, { font: f.heading, size: 38, color: C.navy });
  drawTextC(page, "Blueprint", 414, { font: f.heading, size: 38, color: C.navy });
  drawTextC(page, "Sacred Timing for Your Precious Beginning", 468, { font: f.body, size: 13.5, color: C.accent });
  ornament(page, 504, PAGE_W / 2, 110);
  drawTextC(page, "P R E P A R E D   F O R", 524, { font: f.bold, size: 8.5, color: C.muted });
  const names = `${cleanName(input.motherName)} & ${cleanName(input.fatherName)}`;
  drawTextC(page, names, 542, { font: f.heading, size: fitSize(f.heading, 17, names, 430), color: C.navy });
  drawTextC(page, "HIMANSSHU AGARWAL", 622, { font: f.heading, size: 20, color: C.navy });
  drawTextC(page, "Astro-Numerologist", 650, { font: f.body, size: 11, color: C.muted });
  return page;
}

/** Index over as many pages as given (rows split evenly): numbered navy tab, outlined row, page number pill. */
export function drawIndex(pages: PDFPage[], f: Fonts, marks: Mark[]) {
  const per = Math.ceil(marks.length / pages.length);
  pages.forEach((page, pi) => {
    pageTitle(page, f, "INDEX");
    const rows = marks.slice(pi * per, (pi + 1) * per);
    const pitch = Math.min(42, 560 / Math.max(rows.length, 1)), rh = Math.min(32, pitch - 6);
    rows.forEach((m, i) => {
      const top = 142 + i * pitch, n = pi * per + i + 1;
      roundRect(page, MARGIN_L, top, CONTENT_W, rh, 8, { fill: C.white, stroke: C.navy, sw: 1 });
      roundRect(page, MARGIN_L, top, 38, rh, 8, { fill: C.navy });
      drawTextC(page, String(n).padStart(2, "0"), top + rh / 2 - 5.5, { font: f.bold, size: 10.5, color: C.white, cx: MARGIN_L + 19 });
      drawText(page, m.title, MARGIN_L + 54, top + rh / 2 - 6, { font: f.bold, size: fitSize(f.bold, 11.5, m.title, CONTENT_W - 130), color: C.navy });
      const pg = String(m.page), pw = f.bold.widthOfTextAtSize(pg, 10.5) + 18;
      roundRect(page, MARGIN_R - pw - 8, top + 5, pw, rh - 10, (rh - 10) / 2, { fill: C.panel });
      drawTextC(page, pg, top + rh / 2 - 5.5, { font: f.bold, size: 10.5, color: C.navy, cx: MARGIN_R - 8 - pw / 2 });
    });
  });
}

export function drawQuote(doc: PDFDocument, f: Fonts, a: Assets, marks: Mark[]) {
  const page = newPage(doc, f, a);
  drawTextC(page, "\u201C", 230, { font: f.serif, size: 60, color: C.accent });
  const bottom = drawPara(page, "A child is born on that day and at that hour when the celestial rays are in mathematical harmony with their individual karma", 100, 300, PAGE_W - 200, { font: f.serif, size: 18, color: C.navy, lh: 27, align: "center" });
  ornament(page, bottom + 18);
  drawTextC(page, "Swami Sri Yukteswar", bottom + 38, { font: f.bold, size: 12, color: C.muted });
  void marks;
  return page;
}

function infoTable(page: PDFPage, f: Fonts, top: number, title: string, rows: [string, string][]): number {
  drawTextC(page, title, top, { font: f.bold, size: 12.5, color: C.navy });
  const t = top + 24, rh = 33, w = 400, x = (PAGE_W - w) / 2, h = rows.length * rh + 8;
  roundRect(page, x, t, w, h, 14, { fill: C.navy });
  rows.forEach(([k, v], i) => {
    const ry = t + 4 + i * rh;
    if (i > 0) hLine(page, x + 16, x + w - 16, ry, rgbaLine, 0.6);
    drawText(page, k, x + 24, ry + 10, { font: f.body, size: 11, color: C.white });
    const size = fitSize(f.bold, 11, v, w - 150);
    drawTextR(page, v, x + w - 24, ry + 10, { font: f.bold, size, color: C.white });
  });
  return t + h + 22;
}
const rgbaLine = C.muted;

export function drawPersonalDetails(doc: PDFDocument, f: Fonts, a: Assets, marks: Mark[], input: ReportInput) {
  const page = newPage(doc, f, a);
  marks.push({ title: "Personal Details", page: doc.getPageCount() });
  pageTitle(page, f, "PERSONAL DETAILS");
  const m = dateNumerology(input.motherDob), fa = dateNumerology(input.fatherDob);
  const r = input.result.input;
  let y = 134;
  y = infoTable(page, f, y, "Mother's Information", [["Full Name", input.motherName], ["Date of Birth", slashDate(input.motherDob)], ["Mulank", String(m.mulank)], ["Bhagyank", String(m.bhagyank)]]);
  y = infoTable(page, f, y, "Father's Information", [["Full Name", input.fatherName], ["Date of Birth", slashDate(input.fatherDob)], ["Mulank", String(fa.mulank)], ["Bhagyank", String(fa.bhagyank)]]);
  infoTable(page, f, y, "Pregnancy Details", [
    ["Expected Delivery Window", `${slashDate(r.windowStart)} - ${slashDate(r.windowEnd)}`],
    ["Hospital", input.hospitalName || "-"],
    ["City", input.city || "-"],
    ["OT Hours", `${r.otStart} to ${r.otEnd}`],
  ]);
}

/** "Your Medical Window Analysis" page (dynamic text + selection strategy). */
export function drawMedicalWindow(doc: PDFDocument, f: Fonts, a: Assets, marks: Mark[], input: ReportInput) {
  const r = input.result;
  const flow = new Flow(doc, f, a, "YOUR MEDICAL", "WINDOW ANALYSIS", marks, "Your Medical Window Analysis");
  flow.render([
    { t: "p", text: `Your doctor has approved delivery between ${longDate(r.input.windowStart)} and ${longDate(r.input.windowEnd)} (${r.days.length} day${r.days.length === 1 ? "" : "s"}). We analyzed every date in this window, and every time of the day inside your hospital's operation theatre hours (${r.input.otStart} to ${r.input.otEnd}), for ${input.city || "your city"}.` },
    { t: "h", text: "Our Selection Strategy" },
    { t: "p", text: "From your doctor's window, we selected the 3 dates that offer:" },
    { t: "ul", items: [
      "Strong Panchang: favorable tithi, nakshatra and moon sign",
      "Free of Gand Mool and Gandanta",
      "Strong Mulank and Bhagyank (date numerology luck)",
      "Clean shubh times, with no clash with Rahu Kalam, Yamaganda, Gulika or Bhadra",
      "Times that fall inside your hospital's operation theatre hours",
      "Your baby's Lo Shu Grid shown for every date, so you can compare",
    ] },
  ]);
}

const STATUS_BG = { green: C.greenBg, yellow: C.amberBg, red: C.redBg };
const STATUS_FG = { green: C.green, yellow: C.amber, red: C.red };

export function drawCalendar(doc: PDFDocument, f: Fonts, a: Assets, marks: Mark[], input: ReportInput) {
  const r = input.result;
  const flow = new Flow(doc, f, a, "YOUR WINDOW", "AT A GLANCE", marks, "Your Window at a Glance");
  flow.render([{ t: "p", text: `One box per date from ${longDate(r.input.windowStart)} to ${longDate(r.input.windowEnd)}. All Panchang times are for ${input.city || "your city"}.`, center: true }]);
  const days = r.days;
  const lead = weekdayOf(days[0].date);
  const cells: (DayResult | null)[] = [...Array(lead).fill(null), ...days];
  while (cells.length % 7) cells.push(null);
  const cw = Math.floor(CONTENT_W / 7), ch = 66, x0 = MARGIN_L + (CONTENT_W - cw * 7) / 2;
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const rows = cells.length / 7;
  flow.ensure(24 + rows * ch + 40);
  names.forEach((n, i) => drawTextC(flow.page, n, flow.top, { font: f.bold, size: 9.5, color: C.muted, cx: x0 + i * cw + cw / 2 }));
  flow.top += 18;
  cells.forEach((d, i) => {
    if (!d) return;
    const x = x0 + (i % 7) * cw + 2, top = flow.top + Math.floor(i / 7) * ch + 2;
    const st = dayStatus(d);
    roundRect(flow.page, x, top, cw - 4, ch - 4, 8, { fill: STATUS_BG[st], stroke: STATUS_FG[st], sw: 0.8 });
    const dayNo = Number(d.date.slice(8));
    drawTextC(flow.page, String(dayNo), top + 10, { font: f.bold, size: 20, color: STATUS_FG[st], cx: x + (cw - 4) / 2 });
    const sub = d.rank != null && d.rank <= r.input.topN && d.windows.length ? `Priority ${d.rank}` : st === "red" ? "Avoid" : `${d.numerology.luckPct}%`;
    drawTextC(flow.page, sub, top + 40, { font: f.bold, size: 8.5, color: C.ink, cx: x + (cw - 4) / 2 });
    if (dayNo === 1 || d === days[0]) drawText(flow.page, MONTHS[Number(d.date.slice(5, 7)) - 1].slice(0, 3), x + 4, top + 4, { font: f.body, size: 7, color: C.muted });
  });
  flow.top += rows * ch + 10;
  let lx = MARGIN_L + 40;
  for (const [st, label] of [["green", "Clean shubh time"], ["yellow", "Shubh time with cautions"], ["red", "Avoid"]] as const) {
    roundRect(flow.page, lx, flow.top, 12, 12, 3, { fill: STATUS_BG[st], stroke: STATUS_FG[st], sw: 0.8 });
    drawText(flow.page, label, lx + 18, flow.top + 1.5, { font: f.body, size: 9.5, color: C.ink });
    lx += 22 + f.body.widthOfTextAtSize(label, 9.5) + 22;
  }
  flow.top += 28;
  flow.render([{ t: "p", text: "Under each date: the numerology luck %, or its priority if it is one of your top dates.", center: true, muted: true }]);
  // Priority summary (navy / light rows, like the report's other panels)
  const tz = r.input.location.tz;
  const tops = r.top.filter((d) => d.windows.length);
  if (tops.length) {
    flow.top += 4;
    flow.ensure(30 + tops.length * 48);
    drawText(flow.page, "YOUR TOP DATES", MARGIN_L, flow.top, { font: f.bold, size: 11.5, color: C.accent });
    hLine(flow.page, MARGIN_L, MARGIN_L + CONTENT_W, flow.top + 17, C.line, 0.7);
    flow.top += 28;
    tops.forEach((d, i) => {
      const dark = i % 2 === 0, fg = dark ? C.white : C.navy, h = 40;
      roundRect(flow.page, MARGIN_L, flow.top, CONTENT_W, h, 10, dark ? { fill: C.navy } : { fill: C.panel });
      drawText(flow.page, `Priority ${d.rank}`, MARGIN_L + 14, flow.top + 8, { font: f.bold, size: 11, color: fg });
      drawText(flow.page, `${longDate(d.date)}, ${d.weekday}`, MARGIN_L + 14, flow.top + 23, { font: f.body, size: 9.5, color: fg });
      const best = d.recommended[0];
      if (best) drawTextR(flow.page, fmtRange(best.start, best.end, tz), MARGIN_R - 14, flow.top + 8, { font: f.bold, size: 11, color: fg });
      drawTextR(flow.page, `Mulank ${d.numerology.mulank} · Bhagyank ${d.numerology.bhagyank} · ${d.numerology.luckPct}%`, MARGIN_R - 14, flow.top + 23, { font: f.body, size: 9.5, color: fg });
      flow.top += h + 8;
    });
  }
}

export function drawTopDates(doc: PDFDocument, f: Fonts, a: Assets, marks: Mark[], input: ReportInput) {
  const r = input.result, tz = r.input.location.tz;
  r.top.forEach((d, i) => {
    const flow = new Flow(doc, f, a, "TOP 3 DELIVERY DATES ANALYSIS", `PRIORITY ${i + 1}`, marks, i === 0 ? "Top 3 Delivery Dates Analysis" : undefined);
    const rows = dayRows(d, tz).map(([k, v], n) => [String(n + 1), k, v]);
    flow.table([{ w: 42, center: true }, { w: 138, bold: true }, { w: 283 }], ["S No.", "Topic", "Particulars"], rows);
  });
}

function barBox(x0: number, w: number, s: number, e: number, a: number, b: number): [number, number] {
  const p = (t: number) => Math.max(0, Math.min(1, (t - s) / (e - s)));
  return [x0 + p(a) * w, Math.max(1.5, (p(b) - p(a)) * w)];
}

export function drawTimelines(doc: PDFDocument, f: Fonts, a: Assets, marks: Mark[], input: ReportInput) {
  const r = input.result, tz = r.input.location.tz;
  const flow = new Flow(doc, f, a, "DAY-WISE", "TIMELINE", marks, "Day-wise Timeline");
  flow.render([{ t: "p", text: `Each bar runs across your hospital's OT hours (${r.input.otStart} to ${r.input.otEnd}).`, center: true }]);
  const legend = (): void => {
    let lx = MARGIN_L + 20;
    for (const [col, label] of [[C.green, "Shubh time"], [C.red, "Time to avoid"], [C.gold, "Abhijit / Vijaya muhurat"]] as const) {
      roundRect(flow.page, lx, flow.top, 16, 8, 2, { fill: col });
      drawText(flow.page, label, lx + 22, flow.top - 1, { font: f.body, size: 9.2, color: C.ink });
      lx += 30 + f.body.widthOfTextAtSize(label, 9.2) + 18;
    }
    flow.top += 22;
  };
  legend();
  const startH = Number(r.input.otStart.slice(0, 2)), endH = Number(r.input.otEnd.slice(0, 2));
  r.ranked.forEach((d) => {
    const before = flow.pageNo;
    flow.ensure(66);
    if (flow.pageNo !== before) legend();
    const s = zonedToUtc(d.date, r.input.otStart, tz).getTime(), e = zonedToUtc(d.date, r.input.otEnd, tz).getTime();
    const bx = MARGIN_L + 112, bw = CONTENT_W - 112, top = flow.top;
    drawText(flow.page, `${longDate(d.date).slice(0, -5)} ${d.weekday.slice(0, 3)}`, MARGIN_L, top, { font: f.bold, size: 10, color: C.navy });
    drawText(flow.page, d.windows.length ? `Rank ${d.rank}` : "Avoid", MARGIN_L, top + 14, { font: f.body, size: 9, color: d.windows.length ? C.muted : C.red });
    roundRect(flow.page, bx, top - 2, bw, 38, 6, { fill: C.panelLight, stroke: C.line, sw: 0.5 });
    const lane = (laneTop: number, hgt: number, items: [number, number][], col: typeof C.green) => items.forEach(([x1, x2]) => {
      const [bxx, ww] = barBox(bx + 3, bw - 6, s, e, x1, x2);
      roundRect(flow.page, bxx, laneTop, ww, hgt, 1.5, { fill: col });
    });
    lane(top + 1, 6, d.parts ? [d.parts.abhijit, d.parts.vijaya].map((p) => [p.start.getTime(), p.end.getTime()] as [number, number]) : [], C.gold);
    lane(top + 10, 9, d.windows.map((w) => [w.start.getTime(), w.end.getTime()] as [number, number]), C.green);
    lane(top + 22, 9, mergedAvoid(d), C.red);
    for (let h = startH; h <= endH; h++) {
      if (h % 2) continue;
      const t = zonedToUtc(d.date, `${String(h).padStart(2, "0")}:00`, tz).getTime();
      const [tx] = barBox(bx + 3, bw - 6, s, e, t, t);
      drawTextC(flow.page, `${h % 12 || 12}${h < 12 ? "a" : "p"}`, top + 39, { font: f.body, size: 7.5, color: C.muted, cx: tx });
    }
    flow.top += 60;
  });
}

export function drawLoshuPages(doc: PDFDocument, f: Fonts, a: Assets, marks: Mark[], input: ReportInput) {
  const r = input.result;
  const flow = new Flow(doc, f, a, "YOUR BABY'S", "LO SHU GRID", marks, "Your Baby's Lo Shu Grid for Every Date");
  flow.render([{ t: "p", text: "Built from the digits of the birth date, the Bhagyank, and the Mulank (not added on days 1 to 9, 10, 20, 30). Missing numbers need conscious effort; repeated numbers are expressed strongly.", muted: true }]);
  const cardW = (CONTENT_W - 14) / 2, cardH = 114;
  for (let i = 0; i < r.ranked.length; i += 2) {
    flow.ensure(cardH + 8);
    [r.ranked[i], r.ranked[i + 1]].forEach((d, k) => {
      if (!d) return;
      const x = MARGIN_L + k * (cardW + 14), top = flow.top, l = babyLoshu(d.date), st = dayStatus(d);
      roundRect(flow.page, x, top, cardW, cardH, 12, { fill: C.panelLight, stroke: C.line, sw: 0.8 });
      drawText(flow.page, `${longDate(d.date)} (${d.weekday.slice(0, 3)})`, x + 12, top + 9, { font: f.bold, size: 10.5, color: C.navy });
      const tag = d.windows.length ? `Rank ${d.rank}` : "Avoid";
      const tw = f.bold.widthOfTextAtSize(tag, 8.5);
      roundRect(flow.page, x + cardW - tw - 24, top + 7, tw + 14, 16, 8, { fill: STATUS_BG[st], stroke: STATUS_FG[st], sw: 0.7 });
      drawText(flow.page, tag, x + cardW - tw - 17, top + 11.5, { font: f.bold, size: 8.5, color: STATUS_FG[st] });
      const cell = 27, gx = x + 14, gy = top + 32;
      l.grid.forEach((row, ri) => row.forEach((c, ci) => {
        const cx = gx + ci * (cell + 3), cy = gy + ri * (cell + 3);
        const fill = c.count === 0 ? C.white : c.count >= 2 ? C.amberBg : C.greenBg;
        roundRect(flow.page, cx, cy, cell, cell, 5, { fill, stroke: c.count === 0 ? C.line : c.count >= 2 ? C.amber : C.green, sw: 0.7 });
        const label = c.count === 0 ? String(c.digit) : String(c.digit).repeat(c.count);
        drawTextC(flow.page, label, cy + 8.5, { font: c.count === 0 ? f.body : f.bold, size: fitSize(f.bold, 13, label, cell - 4), color: c.count === 0 ? C.line : C.ink, cx: cx + cell / 2 });
      }));
      const tx = gx + 3 * (cell + 3) + 12, tww = x + cardW - tx - 10;
      let ty = top + 34;
      ty = drawPara(flow.page, `Mulank ${l.mulank}, Bhagyank ${l.bhagyank}${l.mulankInGrid ? "" : " (Mulank not added on this day)"}`, tx, ty, tww, { font: f.body, size: 8.8, color: C.ink, lh: 12 }) + 4;
      ty = drawPara(flow.page, `Missing: ${l.missing.length ? l.missing.join(", ") : "none"}`, tx, ty, tww, { font: f.body, size: 8.8, color: C.ink, lh: 12 }) + 4;
      drawPara(flow.page, `Repeated: ${l.repeated.length ? l.repeated.map((q) => `${q.digit} (x${q.count})`).join(", ") : "none"}`, tx, ty, tww, { font: f.body, size: 8.8, color: C.ink, lh: 12 });
    });
    flow.top += cardH + 6;
  }
}

export function drawAvoidDates(doc: PDFDocument, f: Fonts, a: Assets, marks: Mark[], input: ReportInput) {
  const r = input.result, tz = r.input.location.tz;
  const flow = new Flow(doc, f, a, "DATES TO", "AVOID", marks, "Dates to Avoid and Why");
  const bad = r.days.filter((d) => d.windows.length === 0);
  flow.render([{ t: "p", text: "These dates in your window are not recommended. The reason is shown for each, so you can discuss it with your doctor.", center: true }]);
  if (!bad.length) { flow.render([{ t: "callout", text: "Good news: every date in your window has at least one clean shubh time." }]); return; }
  for (const d of bad) {
    const reasons = avoidReasons(d, tz);
    const lines = reasons.map((t) => wrapLines(f.body, 10.5, t, CONTENT_W - 52));
    const body = lines.reduce((n, l) => n + l.length * 15 + 5, 0) + 16, head = 34;
    flow.ensure(head + body + 14);
    const top = flow.top;
    roundRect(flow.page, MARGIN_L, top, CONTENT_W, head + body, 12, { fill: C.redBg, stroke: C.red, sw: 0.9 });
    roundRect(flow.page, MARGIN_L, top, CONTENT_W, head, 12, { fill: C.navy });
    rect(flow.page, MARGIN_L, top + head - 12, CONTENT_W, 12, C.navy);
    drawText(flow.page, `${longDate(d.date)} (${d.weekday})`, MARGIN_L + 16, top + 10, { font: f.bold, size: 12.5, color: C.white });
    const tag = "AVOID", tw = f.bold.widthOfTextAtSize(tag, 9) + 18;
    roundRect(flow.page, MARGIN_R - tw - 12, top + 8, tw, 18, 9, { fill: C.redBg, stroke: C.red, sw: 0.8 });
    drawTextC(flow.page, tag, top + 12, { font: f.bold, size: 9, color: C.red, cx: MARGIN_R - 12 - tw / 2 });
    let y = top + head + 12;
    lines.forEach((ls) => {
      drawText(flow.page, "\u2022", MARGIN_L + 18, y, { font: f.bold, size: 10.5, color: C.red });
      ls.forEach((line) => { drawText(flow.page, line, MARGIN_L + 34, y, { font: f.body, size: 10.5, color: C.ink }); y += 15; });
      y += 5;
    });
    flow.top = top + head + body + 14;
  }
}

export function drawMuhurat(doc: PDFDocument, f: Fonts, a: Assets, marks: Mark[], input: ReportInput) {
  const r = input.result, tz = r.input.location.tz;
  const flow = new Flow(doc, f, a, "AT-A-GLANCE", "SHUBH MUHURAT", marks, "Shubh Muhurat at a Glance");
  const rows = r.top.map((d, i) => [
    String(i + 1),
    `${longDate(d.date)}\n${d.weekday}`,
    d.windows.length ? windowLines(d, tz).join("\n") : "No clean shubh time",
    avoidGrouped(d, tz).join("\n") || "Nothing during OT hours",
  ]);
  flow.table([{ w: 46, center: true }, { w: 88, bold: true }, { w: 172 }, { w: 157 }], ["Priority", "Date", "Shubh Muhurat", "Time to Avoid"], rows, 9);
  flow.render([{ t: "callout", title: "Shubh Muhurat Timings", text: "Kindly consult your family Pandit or local priest for additional auspicious Muhurat options, as Muhurat timings are based on sunrise and sunset, which vary from one location to another. While due care has been taken in sharing the above timings considering your place of delivery, it is always advisable to have them reconfirmed locally." }]);
}

export function drawOffers(doc: PDFDocument, f: Fonts, a: Assets, marks: Mark[], input: ReportInput) {
  const page = newPage(doc, f, a);
  marks.push({ title: "Your Name Decides Your Speed in Life", page: doc.getPageCount() });
  pageTitle(page, f, "YOUR NAME DECIDES", "YOUR SPEED IN LIFE");
  const o = input.offers ?? { perfect: { price: 3437, original: 7500 }, blueprint: { price: 5957, original: 15051 } };
  const money = (n: number) => `\u20B9${n.toLocaleString("en-IN")}`;
  const off = (p: { price: number; original: number }) => Math.round((1 - p.price / p.original) * 100);
  const cards = [
    { name: "Perfect Baby Name Report", ...o.perfect, items: ["10+ Numerologically Aligned Name Options", "Already Have a Name? We'll Correct It Too", "Child's Mulank & Bhagyank Analysis", "First Name & Full Name Analysis", "Compound Number Analysis", "Personal Loshu Grid", "First Alphabet Analysis", "PDF Report (50+ Pages)", "Call Consultation Included"] },
    { name: "Complete Baby Blueprint", ...o.blueprint, items: ["Everything in Perfect Baby Name Report", "10+ Extra Numerologically Aligned Names", "Nickname Analysis", "Ideal Career Path Analysis", "Lucky Direction (Feng Shui)", "Lucky Colors Analysis", "Lucky Numbers Analysis"] },
  ];
  const cw = (CONTENT_W - 14) / 2;
  cards.forEach((c, i) => {
    const x = MARGIN_L + i * (cw + 14), top = 158;
    const itemLines = c.items.map((t) => wrapLines(f.body, 9.6, t, cw - 44));
    const h = 118 + itemLines.reduce((s, l) => s + l.length * 13 + 4, 0) + 16;
    roundRect(page, x, top, cw, h, 14, { fill: C.panelLight, stroke: C.line, sw: 0.9 });
    drawPara(page, c.name, x + 12, top + 14, cw - 24, { font: f.heading, size: 13, color: C.navy, lh: 16, align: "center" });
    drawTextC(page, money(c.price), top + 52, { font: f.bold, size: 24, color: C.navy, cx: x + cw / 2 });
    const orig = money(c.original), ow = f.body.widthOfTextAtSize(orig, 11);
    drawTextC(page, orig, top + 84, { font: f.body, size: 11, color: C.muted, cx: x + cw / 2 });
    hLine(page, x + cw / 2 - ow / 2, x + cw / 2 + ow / 2, top + 90, C.muted, 0.8);
    const chip = `GET ${off(c)}% OFF`, chw = f.bold.widthOfTextAtSize(chip, 9) + 20;
    roundRect(page, x + cw / 2 - chw / 2, top + 102, chw, 18, 9, { fill: C.navy });
    drawTextC(page, chip, top + 106, { font: f.bold, size: 9, color: C.white, cx: x + cw / 2 });
    let y = top + 136;
    itemLines.forEach((ls) => {
      drawText(page, "+", x + 14, y, { font: f.bold, size: 9.6, color: C.green });
      ls.forEach((line) => { drawText(page, line, x + 28, y, { font: f.body, size: 9.6 }); y += 13; });
      y += 4;
    });
  });
  const c = input.contact ?? { phone: "9667305577", email: "social@ankshaastra.com", site: "www.ankshaastra.com" };
  drawTextC(page, `To book, message us on WhatsApp: ${c.phone}`, 690, { font: f.bold, size: 11, color: C.navy });
}

export function drawConnect(doc: PDFDocument, f: Fonts, a: Assets, marks: Mark[], input: ReportInput) {
  const page = newPage(doc, f, a);
  marks.push({ title: "Connect With Us", page: doc.getPageCount() });
  pageTitle(page, f, "CONNECT", "WITH US");
  const c = input.contact ?? { phone: "9667305577", email: "social@ankshaastra.com", site: "www.ankshaastra.com" };
  drawTextC(page, "Follow for daily wisdom, tips, and inspiration", 160, { font: f.body, size: 12, color: C.accent });
  const links: [string, string][] = [["Instagram", SOCIAL_LINKS.instagram], ["LinkedIn", SOCIAL_LINKS.linkedin], ["Facebook", SOCIAL_LINKS.facebook], ["YouTube", SOCIAL_LINKS.youtube]];
  links.forEach(([label, url], i) => {
    const x = MARGIN_L + (i % 2) * (CONTENT_W / 2 + 7), top = 196 + Math.floor(i / 2) * 62, w = CONTENT_W / 2 - 7;
    roundRect(page, x, top, w, 46, 12, { fill: C.navy });
    drawTextC(page, label, top + 15, { font: f.bold, size: 13, color: C.white, cx: x + w / 2 });
    linkAnnotation(doc, page, x, top, w, 46, url);
  });
  drawTextC(page, "Share your experience", 360, { font: f.heading, size: 18, color: C.navy });
  drawPara(page, "Your feedback helps others find guidance! If this report has helped you, we would be deeply grateful if you could share your experience. Your review helps others who are seeking authentic guidance find the support they need.", MARGIN_L + 10, 392, CONTENT_W - 20, { font: f.body, size: 11, lh: 16, align: "center" });
  roundRect(page, PAGE_W / 2 - 110, 500, 220, 46, 12, { fill: C.navy });
  drawTextC(page, "Leave a Review", 515, { font: f.bold, size: 13, color: C.white });
  linkAnnotation(doc, page, PAGE_W / 2 - 110, 500, 220, 46, SOCIAL_LINKS.review);
  drawTextC(page, "Stay connected for ongoing guidance & support", 580, { font: f.body, size: 11, color: C.muted });
  drawTextC(page, `${c.phone}  |  ${c.email}`, 602, { font: f.bold, size: 11, color: C.navy });
}

export function drawBackCover(doc: PDFDocument, f: Fonts, a: Assets) {
  const page = newPage(doc, f, a);
  const lw = 230, lh = lw * (a.logo.height / a.logo.width);
  page.drawImage(a.logo, { x: PAGE_W / 2 - lw / 2, y: 841.89 - 300 - lh, width: lw, height: lh });
  ornament(page, 380, PAGE_W / 2, 120);
  drawTextC(page, "Illuminating Lives Through Ancient Wisdom", 400, { font: f.serif, size: 15, color: C.navy });
}
