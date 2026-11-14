// /**
//  * "NUMEROLOGICALLY ALIGNED BABY NAMES" report - follows the client's 16-page sample
//  * (Numerologically_Aligned_Baby_Names.pdf, page size 930 x 1315.5 pt).
//  *
//  *   static (image)   1 cover | 2-3 index | 13 next steps | 14-15 terms | 16 back cover
//  *   dynamic (code)   4 birth details + core numbers
//  *                    5 Lo Shu grid
//  *                    6 favourable / unfavourable numbers
//  *                    7 last name - the reverse methodology (combination table)
//  *                    8 our recommendation
//  *                    9 / 10 / 11 new name suggestions (12 + 12 + 8 slots, kept by package)
//  *                    12 analysis of the names the parents shared
//  *
//  * Package rule (client): Rs 3437 -> pages 10, 11 removed (12 names); Rs 5957 -> page 11 removed (24 names);
//  * Rs 5957 + extra-names add-on -> all three pages (32 names).
//  *
//  * All layout numbers below are in the sample's pixel space (924 x 1308) and scaled to points with K.
//  */

// import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb, RGB } from "pdf-lib";
// import { buildStandardLoShuGrid } from "@/lib/baby-reports/shared/loshu-grid";
// import { getRelation } from "@/lib/name-check/friendship-table";
// import { chaldeanRawSum } from "@/lib/name-check/numerology";
// import { namePageCount, nameSlots, NAMES_PER_PAGE, type PackageChoice } from "@/lib/swar/nameFinderPackage";
// import type { ComboRow, NameFinderProfile } from "@/lib/swar/nameFinder";

// export const NAME_FINDER_ASSET_BASE = "/name-finder-assets";
// export const NAME_FINDER_FONT_BASE = "/name-check-assets/fonts";

// export interface ReportName { name: string; meaning: string }
// export interface AnalysisRow { name: string; firstNo: number | string; fullNo: number | string; suitability: string; corrected?: string }

// export interface NameFinderReportInput {
//   dob: string;                 // yyyy-mm-dd
//   time?: string;               // HH:mm
//   place?: string;
//   gender: "boy" | "girl";
//   middleName?: string;
//   middleIsFather?: boolean;
//   lastName?: string;
//   swar?: string;               // recommended swar / first alphabet (Step 1)
//   firstAlphabets?: string;     // final alphabets chosen by the parents (Step 2)
//   preference?: string;         // name preference chosen by the parents
//   profile: NameFinderProfile;
//   package: PackageChoice;
//   names: ReportName[];
//   analysis?: AnalysisRow[];    // names the parents shared (Step 4/5)
// }

// export interface NameFinderAssets {
//   statics: Partial<Record<number, Uint8Array>>; // sample page number -> JPG
//   background: Uint8Array;                       // paper texture JPG
//   footprints?: Uint8Array;                      // PNG with alpha
//   fonts?: Partial<Record<"cinzelBold" | "cinzelRegular" | "quicksandBold" | "quicksandRegular" | "cardo", Uint8Array>>;
// }

// // ------------------------------------------------------------------ geometry / colours
// const W = 930, H = 1315.5, K = W / 924;
// const ORANGE = rgb(1, 0.647, 0);
// const BLACK = rgb(0.05, 0.05, 0.05);
// const WHITE = rgb(1, 1, 1);
// const GRID = rgb(0.1, 0.1, 0.1);
// const X = (x: number) => x * K;
// const Y = (y: number) => H - y * K;

// interface Fonts { title: PDFFont; titleReg: PDFFont; bold: PDFFont; reg: PDFFont; foot: PDFFont }
// interface Ctx {
//   doc: PDFDocument;
//   f: Fonts;
//   bg: Awaited<ReturnType<PDFDocument["embedJpg"]>>;
//   fp: Awaited<ReturnType<PDFDocument["embedPng"]>> | null;
// }

// const safe = (s: string) =>
//   s.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u2013\u2014]/g, "-").replace(/[^\x20-\x7E\u00A0-\u00FF]/g, "");

// // ------------------------------------------------------------------ drawing helpers (px coordinates, y down)
// function textC(p: PDFPage, s: string, cx: number, cy: number, size: number, font: PDFFont, color: RGB = BLACK) {
//   const t = safe(s);
//   const w = font.widthOfTextAtSize(t, size * K);
//   p.drawText(t, { x: X(cx) - w / 2, y: Y(cy) - size * K * 0.34, size: size * K, font, color });
// }
// function textL(p: PDFPage, s: string, x: number, cy: number, size: number, font: PDFFont, color: RGB = BLACK) {
//   p.drawText(safe(s), { x: X(x), y: Y(cy) - size * K * 0.34, size: size * K, font, color });
// }
// /** Shrinks the font until the text fits maxW, then centres it. */
// function fitC(p: PDFPage, s: string, cx: number, cy: number, size: number, maxW: number, font: PDFFont, color: RGB = BLACK) {
//   let z = size;
//   while (z > 8 && font.widthOfTextAtSize(safe(s), z * K) > maxW * K) z -= 0.5;
//   textC(p, s, cx, cy, z, font, color);
// }
// type Run = { t: string; font: PDFFont };
// /** Greedy word wrap over mixed-font runs; returns lines of runs. */
// function wrapRuns(runs: Run[], maxW: number, size: number): Run[][] {
//   const lines: Run[][] = [[]];
//   let w = 0;
//   for (const r of runs) {
//     for (const word of safe(r.t).split(/(\s+)/)) {
//       if (!word) continue;
//       const ww = r.font.widthOfTextAtSize(word, size * K) / K;
//       if (w + ww > maxW && lines[lines.length - 1].length && word.trim()) { lines.push([]); w = 0; }
//       if (!w && !word.trim()) continue; // no leading space on a new line
//       lines[lines.length - 1].push({ t: word, font: r.font });
//       w += ww;
//     }
//   }
//   return lines;
// }
// function drawLines(p: PDFPage, lines: Run[][], cx: number, firstCy: number, size: number, lh: number, color: RGB = BLACK) {
//   lines.forEach((ln, i) => {
//     const total = ln.reduce((a, r) => a + r.font.widthOfTextAtSize(r.t, size * K), 0);
//     let x = X(cx) - total / 2;
//     for (const r of ln) {
//       p.drawText(r.t, { x, y: Y(firstCy + i * lh) - size * K * 0.34, size: size * K, font: r.font, color });
//       x += r.font.widthOfTextAtSize(r.t, size * K);
//     }
//   });
// }
// /** Wraps runs into a box (cx, cy centre, maxW x maxH); shrinks the font until it fits. */
// function paragraphIn(p: PDFPage, runs: Run[], cx: number, cy: number, maxW: number, maxH: number, size: number, color: RGB = BLACK, minSize = 9) {
//   let z = size, lines = wrapRuns(runs, maxW, z);
//   while (z > minSize && lines.length * z * 1.28 > maxH) { z -= 0.5; lines = wrapRuns(runs, maxW, z); }
//   const lh = z * 1.28;
//   drawLines(p, lines, cx, cy - ((lines.length - 1) * lh) / 2, z, lh, color);
// }

// function path(p: PDFPage, d: string, o: { fill?: RGB; stroke?: RGB; width?: number }) {
//   p.drawSvgPath(d, { x: 0, y: H, color: o.fill, borderColor: o.stroke, borderWidth: o.stroke ? (o.width ?? 1) : undefined });
// }
// function rrect(p: PDFPage, x: number, y: number, w: number, h: number, r: number, o: { fill?: RGB; stroke?: RGB; width?: number }) {
//   const [a, b, c, d, e] = [x * K, y * K, w * K, h * K, r * K];
//   path(p, `M ${a + e} ${b} L ${a + c - e} ${b} A ${e} ${e} 0 0 1 ${a + c} ${b + e} L ${a + c} ${b + d - e} A ${e} ${e} 0 0 1 ${a + c - e} ${b + d} L ${a + e} ${b + d} A ${e} ${e} 0 0 1 ${a} ${b + d - e} L ${a} ${b + e} A ${e} ${e} 0 0 1 ${a + e} ${b} Z`, o);
// }
// function box(p: PDFPage, x: number, y: number, w: number, h: number, o: { fill?: RGB; stroke?: RGB; width?: number }) {
//   p.drawRectangle({ x: X(x), y: Y(y + h), width: w * K, height: h * K, color: o.fill, borderColor: o.stroke, borderWidth: o.stroke ? (o.width ?? 1) : undefined });
// }
// function line(p: PDFPage, x1: number, y1: number, x2: number, y2: number, color: RGB, width = 1) {
//   p.drawLine({ start: { x: X(x1), y: Y(y1) }, end: { x: X(x2), y: Y(y2) }, thickness: width * K, color });
// }

// /** Gold knot divider under the titles. */
// function divider(p: PDFPage, cy: number) {
//   const soft = rgb(1, 0.78, 0.35);
//   line(p, 360, cy, 446, cy, soft, 1);
//   line(p, 478, cy, 566, cy, soft, 1);
//   p.drawEllipse({ x: X(456), y: Y(cy), xScale: 7 * K, yScale: 4.5 * K, borderColor: ORANGE, borderWidth: 1.1 });
//   p.drawEllipse({ x: X(468), y: Y(cy), xScale: 7 * K, yScale: 4.5 * K, borderColor: ORANGE, borderWidth: 1.1 });
// }
// function footprints(c: Ctx, p: PDFPage, cx = 462, cy = 1172) {
//   if (!c.fp) return;
//   const w = 50, h = (w * c.fp.height) / c.fp.width;
//   p.drawImage(c.fp, { x: X(cx - w / 2), y: Y(cy + h / 2), width: w * K, height: h * K });
// }
// function footer(c: Ctx, p: PDFPage) {
//   const t = "WWW.ANKSHAASTRA.COM", size = 20 * K, track = 11 * K;
//   const total = [...t].reduce((a, ch) => a + c.f.foot.widthOfTextAtSize(ch, size) + track, -track);
//   let x = X(462) - total / 2;
//   for (const ch of t) { p.drawText(ch, { x, y: Y(1228) - size * 0.34, size, font: c.f.foot, color: ORANGE }); x += c.f.foot.widthOfTextAtSize(ch, size) + track; }
// }
// function newPage(c: Ctx, titleLines: string[], o: { divY?: number; titleY?: number[]; foot?: boolean; titleSize?: number } = {}): PDFPage {
//   const p = c.doc.addPage([W, H]);
//   p.drawImage(c.bg, { x: 0, y: 0, width: W, height: H });
//   rrect(p, 22, 25, 880, 1257, 24, { stroke: ORANGE, width: 3.2 });
//   const ys = o.titleY ?? (titleLines.length === 1 ? [118] : [118, 170]);
//   titleLines.forEach((t, i) => fitC(p, t, 462, ys[i], o.titleSize ?? 46, 770, c.f.title, ORANGE));
//   if (o.divY !== undefined) divider(p, o.divY);
//   if (o.foot !== false) footer(c, p);
//   return p;
// }

// // ------------------------------------------------------------------ text helpers
// const DOB_LABEL = (iso: string) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso); return m ? `${Number(m[3])}/${Number(m[2])}/${m[1]}` : iso; };
// function time12(t?: string) { const m = /^(\d{1,2}):(\d{2})/.exec(t || ""); if (!m) return "-"; const h = Number(m[1]); return `${h % 12 || 12}:${m[2]} ${h >= 12 ? "PM" : "AM"}`; }
// const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
// const COUNT_WORD = ["", "once", "twice", "three times", "four times", "five times", "six times", "seven times", "eight times", "nine times"];

// function relationSentence(m: number, b: number, n: number): string {
//   const rm = getRelation(m, n), rb = getRelation(b, n);
//   return rm === "friendly" && rb === "friendly" ? "Friendly to both Mulank and Bhagyank" : `${cap(rm)} to Mulank and ${cap(rb)} to Bhagyank`;
// }
// function firstNameSentence(row: ComboRow, m: number, b: number): string {
//   const rm = getRelation(m, row.n), rb = getRelation(b, row.n);
//   if (row.mark === "tick") return `The first name (${row.n}) is Friendly to both Mulank and Bhagyank.`;
//   const who = rm === "neutral" && rb === "neutral" ? "both Mulank and Bhagyank" : rm === "neutral" ? "Mulank" : "Bhagyank";
//   return `The first name (${row.n}) is Neutral to ${who}, which is why it is circled and not ticked.`;
// }

// // ------------------------------------------------------------------ page 4
// function pageBirth(c: Ctx, i: NameFinderReportInput) {
//   const p = newPage(c, ["BIRTH", "DETAILS"], { divY: 218 });
//   const rows: [string, string][] = [
//     ["Date of Birth", DOB_LABEL(i.dob)],
//     ["Time of Birth", time12(i.time)],
//     ["Place of Birth", i.place || "-"],
//     ["Gender", i.gender === "girl" ? "Female" : "Male"],
//     ["Middle Name (If any)", i.middleName || ""],
//     ["Is Middle Name Father\u2019s Name", i.middleName ? (i.middleIsFather ? "Yes" : "No") : ""],
//     ["Last Name", i.lastName || ""],
//   ];
//   const x0 = 97, x1 = 462, x2 = 827, y0 = 273, rh = 67;
//   rows.forEach(([k, v], r) => {
//     const y = y0 + r * rh;
//     box(p, x0, y, x1 - x0, rh, { fill: ORANGE, stroke: GRID, width: 1 });
//     box(p, x1, y, x2 - x1, rh, { fill: WHITE, stroke: GRID, width: 1 });
//     fitC(p, k, (x0 + x1) / 2, y + rh / 2, 21, 330, c.f.bold, WHITE);
//     fitC(p, v, (x1 + x2) / 2, y + rh / 2, 22, 340, c.f.reg, BLACK);
//   });
//   fitC(p, "CORE NUMBERS", 462, 842, 46, 760, c.f.title, ORANGE);
//   divider(p, 889);
//   ([["MULANK", i.profile.mulank, 93], ["BHAGYANK", i.profile.bhagyank, 477]] as const).forEach(([label, n, x]) => {
//     rrect(p, x, 933, 354, 222, 22, { stroke: ORANGE, width: 2.2 });
//     textC(p, label, x + 177, 972, 21, c.f.bold, ORANGE);
//     p.drawCircle({ x: X(x + 177), y: Y(1069), size: 62 * K, color: ORANGE });
//     textC(p, String(n), x + 177, 1069, 64, c.f.title, WHITE);
//   });
// }

// // ------------------------------------------------------------------ page 5
// function pageLoShu(c: Ctx, i: NameFinderReportInput) {
//   const p = newPage(c, ["LOSHU", "GRID & NUMBERS"], { divY: 218 });
//   const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(i.dob)!;
//   const grid = buildStandardLoShuGrid(Number(m[3]), Number(m[2]), Number(m[1]));
//   const counts = grid.counts as Record<number, number>;
//   const layout = [[4, 9, 2], [3, 5, 7], [8, 1, 6]];
//   const gx = 209, gy = 268, cw = 506 / 3, ch = 506 / 3;
//   layout.forEach((row, r) => row.forEach((d, col) => {
//     const n = counts[d] ?? 0, x = gx + col * cw, y = gy + r * ch;
//     box(p, x, y, cw, ch, { fill: n ? ORANGE : WHITE, stroke: GRID, width: 1 });
//     fitC(p, n ? String(d).repeat(n) : `${d} (Missing)`, x + cw / 2, y + ch / 2, 28, cw - 14, c.f.bold, n ? WHITE : ORANGE);
//   }));
//   const present = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => (counts[d] ?? 0) > 0);
//   const missing = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => !counts[d]);
//   const repeated = present.filter((d) => counts[d] > 1).map((d) => `${d} (${COUNT_WORD[Math.min(counts[d], 9)]})`);
//   const info: [string, string, number, number, number][] = [
//     ["Present", present.join(", ") || "-", 118, 851, 283],
//     ["Repeated", repeated.join(", ") || "None", 514, 851, 283],
//     ["Missing", missing.join(", ") || "None", 320, 1000, 283],
//   ];
//   for (const [label, val, x, y, w] of info) {
//     rrect(p, x, y, w, 111, 16, { stroke: ORANGE, width: 2 });
//     rrect(p, x + w / 2 - 66, y - 24, 132, 49, 24, { fill: WHITE, stroke: ORANGE, width: 2 });
//     textC(p, label, x + w / 2, y + 1, 22, c.f.reg, BLACK);
//     paragraphIn(p, [{ t: val, font: c.f.reg }], x + w / 2, y + 62, w - 40, 62, 22);
//   }
//   footprints(c, p, 462, 1172);
// }

// // ------------------------------------------------------------------ page 6
// type Status = "Lucky" | "Neutral" | "Avoid";
// /** Lucky = Friendly to both core numbers; Avoid = Enemy to either; everything else Neutral. */
// export function favourableTable(m: number, b: number) {
//   return [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
//     const rm = getRelation(m, n), rb = getRelation(b, n);
//     const status: Status = rm === "enemy" || rb === "enemy" ? "Avoid" : rm === "friendly" && rb === "friendly" ? "Lucky" : "Neutral";
//     return { n, rm: cap(rm), rb: cap(rb), status };
//   });
// }
// function pageFavourable(c: Ctx, i: NameFinderReportInput) {
//   const p = newPage(c, ["YOUR FAVOURABLE &", "UNFAVOURABLE NUMBERS"], { divY: 218, titleSize: 44, foot: false });
//   const cols = [89, 206, 430, 650, 835], y0 = 267, hh = 67;
//   ["Number", "Mulank", "Bhagyank", "Final Status"].forEach((h, k) => {
//     box(p, cols[k], y0, cols[k + 1] - cols[k], hh, { fill: ORANGE, stroke: GRID, width: 1 });
//     textC(p, h, (cols[k] + cols[k + 1]) / 2, y0 + hh / 2, 22, c.f.bold, WHITE);
//   });
//   const rows = favourableTable(i.profile.mulank, i.profile.bhagyank);
//   rows.forEach((r, ri) => {
//     const y = y0 + hh + ri * 67;
//     [String(r.n), r.rm, r.rb, r.status].forEach((v, k) => {
//       box(p, cols[k], y, cols[k + 1] - cols[k], 67, { fill: WHITE, stroke: GRID, width: 1 });
//       textC(p, v, (cols[k] + cols[k + 1]) / 2, y + 33.5, 22, c.f.reg, BLACK);
//     });
//   });
//   const lucky = rows.filter((r) => r.status === "Lucky").map((r) => r.n).join(", ") || "None";
//   const avoid = rows.filter((r) => r.status === "Avoid").map((r) => r.n).join(", ") || "None";
//   ([["Lucky Numbers", lucky, 966], ["Numbers to Avoid", avoid, 1092]] as const).forEach(([label, val, y]) => {
//     rrect(p, 200, y + 25, 523, 76, 16, { stroke: ORANGE, width: 2 });
//     rrect(p, 462 - 132, y, 264, 50, 25, { fill: WHITE, stroke: ORANGE, width: 2 });
//     textC(p, label, 462, y + 25, 22, c.f.bold, ORANGE);
//     textC(p, val, 462, y + 75, 23, c.f.reg, BLACK);
//   });
// }

// // ------------------------------------------------------------------ page 7
// function markShape(p: PDFPage, mark: "cross" | "circle" | "tick", star: boolean, cx: number, cy: number) {
//   const s = 11;
//   if (star) {
//     const pts: string[] = [];
//     for (let k = 0; k < 10; k++) {
//       const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 === 0 ? 14 : 5.8;
//       pts.push(`${k ? "L" : "M"} ${(cx + r * Math.cos(a)) * K} ${(cy + r * Math.sin(a)) * K}`);
//     }
//     path(p, pts.join(" ") + " Z", { fill: BLACK });
//   } else if (mark === "cross") {
//     line(p, cx - s, cy - s, cx + s, cy + s, BLACK, 2.6); line(p, cx - s, cy + s, cx + s, cy - s, BLACK, 2.6);
//   } else if (mark === "tick") {
//     line(p, cx - s, cy, cx - 3, cy + s - 1, BLACK, 2.8); line(p, cx - 3, cy + s - 1, cx + s + 2, cy - s, BLACK, 2.8);
//   } else {
//     p.drawCircle({ x: X(cx), y: Y(cy), size: 10.5 * K, borderColor: BLACK, borderWidth: 2.4 * K });
//   }
// }
// function pageReverse(c: Ctx, i: NameFinderReportInput) {
//   const p = newPage(c, ["LAST NAME-THE REVERSE", "METHODOLOGY"], { divY: 218, titleSize: 44 });
//   const pr = i.profile, sn = pr.surname;
//   // letters strip
//   const letters = (sn?.text ?? "").replace(/[^A-Za-z]/g, "").toUpperCase().split("").filter(Boolean);
//   const slots = Math.max(8, letters.length), x0 = 92, xT = 637, x2 = 831;
//   box(p, x0, 299, xT - x0, 75, { fill: ORANGE, stroke: GRID, width: 1 });
//   box(p, x0, 374, xT - x0, 74, { fill: ORANGE, stroke: GRID, width: 1 });
//   box(p, xT, 299, x2 - xT, 75, { fill: ORANGE, stroke: GRID, width: 1 });
//   box(p, xT, 374, x2 - xT, 74, { fill: ORANGE, stroke: GRID, width: 1 });
//   const sw = (xT - x0 - 30) / slots;
//   for (let k = 0; k < slots; k++) {
//     const cx = x0 + 15 + sw * (k + 0.5), ch = letters[k];
//     textC(p, ch ?? "-", cx, 337, 22, c.f.bold, WHITE);
//     textC(p, ch ? String(chaldeanRawSum(ch)) : "-", cx, 411, 22, c.f.bold, WHITE);
//   }
//   textC(p, "TOTAL", (xT + x2) / 2, 337, 22, c.f.bold, WHITE);
//   if (sn && sn.total > 9) {
//     const cx = (xT + x2) / 2, tw = c.f.bold.widthOfTextAtSize(String(sn.total), 22 * K) / K;
//     const nw = c.f.bold.widthOfTextAtSize(String(sn.number), 22 * K) / K;
//     const total = tw + 14 + 30 + 14 + nw, left = cx - total / 2;
//     textL(p, String(sn.total), left, 411, 22, c.f.bold, WHITE);
//     const ax = left + tw + 14;
//     line(p, ax, 411, ax + 30, 411, WHITE, 2.4); line(p, ax + 21, 403, ax + 30, 411, WHITE, 2.4); line(p, ax + 21, 419, ax + 30, 411, WHITE, 2.4);
//     textL(p, String(sn.number), ax + 30 + 14, 411, 22, c.f.bold, WHITE);
//   } else textC(p, sn ? String(sn.number) : "-", (xT + x2) / 2, 411, 22, c.f.bold, WHITE);

//   // combination table
//   const cols = [92, 188, 280, 377, 466, 831], ty = 491, hh = 69, rh = 67;
//   ["First\nName", "Last\nName", "Full\nName", "Status", "Reason"].forEach((h, k) => {
//     box(p, cols[k], ty, cols[k + 1] - cols[k], hh, { fill: ORANGE, stroke: GRID, width: 1 });
//     const parts = h.split("\n"), cx = (cols[k] + cols[k + 1]) / 2;
//     parts.forEach((t, li) => textC(p, t, cx, ty + hh / 2 + (li - (parts.length - 1) / 2) * 25, 22, c.f.bold, WHITE));
//   });
//   const table = pr.table ?? [];
//   const survivors = table.filter((r) => r.mark !== "cross").length;
//   table.forEach((r, ri) => {
//     const y = ty + hh + ri * rh;
//     [String(r.n), String(r.surname), String(r.total)].forEach((v, k) => {
//       box(p, cols[k], y, cols[k + 1] - cols[k], rh, { fill: WHITE, stroke: GRID, width: 1 });
//       textC(p, v, (cols[k] + cols[k + 1]) / 2, y + rh / 2, 22, c.f.reg, BLACK);
//     });
//     box(p, cols[3], y, cols[4] - cols[3], rh, { fill: WHITE, stroke: GRID, width: 1 });
//     markShape(p, r.mark, r.star, (cols[3] + cols[4]) / 2, y + rh / 2);
//     box(p, cols[4], y, cols[5] - cols[4], rh, { fill: WHITE, stroke: GRID, width: 1 });
//     const runs: Run[] = [];
//     if (r.mark === "cross") runs.push({ t: r.reason, font: c.f.reg });
//     else {
//       const lead = r.star ? "Top combination." : survivors === 1 ? "Top combination, the only one without a cross." : "Workable combination, no cross.";
//       runs.push({ t: lead + " ", font: c.f.bold });
//       const rm = getRelation(pr.mulank, r.total), rb = getRelation(pr.bhagyank, r.total);
//       const full = rm === "friendly" && rb === "friendly" ? "Friendly to both" : `${cap(rm)} to Mulank, ${cap(rb)} to Bhagyank`;
//       const fm = getRelation(pr.mulank, r.n), fb = getRelation(pr.bhagyank, r.n);
//       const first = r.mark === "tick" ? "Friendly to both" : `Neutral to ${fm === "neutral" && fb === "neutral" ? "both" : fm === "neutral" ? "Mulank" : "Bhagyank"}`;
//       runs.push({ t: `Full name ${r.total}: ${full}. First name ${r.n}: ${first}${r.mark === "circle" ? " (circled)" : ""}.`, font: c.f.reg });
//     }
//     paragraphIn(p, runs, (cols[4] + cols[5]) / 2, y + rh / 2, cols[5] - cols[4] - 24, rh - 8, 15, BLACK, 9);
//   });
//   if (!table.length) textC(p, "Enter the surname in Step 3 to build this table.", 462, 700, 20, c.f.reg, BLACK);
// }

// // ------------------------------------------------------------------ page 8
// function pageRecommendation(c: Ctx, i: NameFinderReportInput) {
//   const p = newPage(c, ["OUR", "RECOMMENDATION"], { divY: 218 });
//   const pr = i.profile, sn = pr.surname;
//   const ranked = (pr.table ?? []).filter((r) => r.mark !== "cross")
//     .sort((a, b) => (a.star ? 0 : a.mark === "tick" ? 1 : 2) - (b.star ? 0 : b.mark === "tick" ? 1 : 2) || a.n - b.n);
//   const only = ranked.length === 1;
//   const surname = i.lastName || sn?.text || "the surname";
//   const blocks = ["First choice", "Second choice"].map((label, k) => {
//     const r = ranked[k];
//     const y = k === 0 ? 281 : 704;
//     if (!r) {
//       const none = ranked.length === 0;
//       return {
//         label, y,
//         sub: none ? "NO COMBINATION AVOIDS EVERY CROSS" : "NO OTHER COMBINATION AVOIDS EVERY CROSS",
//         body: none
//           ? `With the surname ${surname}${sn ? ` (${sn.number})` : ""}, every first-name number carries an Enemy or a restricted number. Please discuss a spelling adjustment of the surname with us.`
//           : "For this surname only one first-name number works. Every other number carries an Enemy or a restricted number, as shown in the table on the previous page.",
//       };
//     }
//     const intro = only
//       ? `With the surname ${surname} (${sn?.number}), only this combination avoids every Enemy and every restricted number.`
//       : `With the surname ${surname} (${sn?.number}), this combination avoids every Enemy and every restricted number.`;
//     return {
//       label, y,
//       sub: `A FIRST NAME THAT TOTALS ${r.n}, GIVING A FULL NAME THAT TOTALS ${r.total}`,
//       body: `${intro} The full name lands on ${r.total}, which is ${relationSentence(pr.mulank, pr.bhagyank, r.total)}. ${firstNameSentence(r, pr.mulank, pr.bhagyank)}`,
//     };
//   });
//   blocks.forEach(({ label, sub, body, y }, k) => {
//     rrect(p, 210, y + 40, 503, 73, 36, { stroke: ORANGE, width: 2.4 });
//     p.drawCircle({ x: X(223), y: Y(y + 39), size: 38 * K, color: ORANGE });
//     textC(p, `0${k + 1}`, 223, y + 39, 30, c.f.title, WHITE);
//     textC(p, label, 462, y + 77, 30, c.f.titleReg, ORANGE);
//     fitC(p, sub, 462, y + 174, 17.5, 800, c.f.bold, ORANGE);
//     divider(p, y + 210);
//     paragraphIn(p, [{ t: body, font: c.f.reg }], 462, y + 305, 740, 150, 21.5, BLACK, 14);
//   });
//   footprints(c, p, 462, 1172);
// }

// // ------------------------------------------------------------------ pages 9-11
// function pageNames(c: Ctx, i: NameFinderReportInput, pageIdx: 0 | 1 | 2, offset: number) {
//   const count = NAMES_PER_PAGE[pageIdx];
//   const p = newPage(c, ["NEW NAME SUGGESTIONS"], { divY: pageIdx === 0 ? 163 : undefined, foot: false, titleSize: 42 });
//   fitC(p, "NUMEROLOGICALLY ALIGNED NAME OPTIONS SPECIALLY CURATED FOR", 462, 229, 17.5, 820, c.f.bold, ORANGE);
//   fitC(p, "YOUR CHILD\u2019S DATE OF BIRTH AND PREFERENCES", 462, 254, 17.5, 820, c.f.bold, ORANGE);
//   const ty = pageIdx === 0 ? 452 : pageIdx === 1 ? 355 : 394;
//   if (pageIdx === 0) {
//     rrect(p, 59, 288, 807, 139, 20, { stroke: ORANGE, width: 2 });
//     const items: [string, string][] = [
//       ["Recommended Swar / First Alphabet: ", i.swar || ""],
//       ["Final Swar / First Alphabet selected by Parents: ", i.firstAlphabets || ""],
//       ["Name Preference selected by Parents: ", i.preference || ""],
//     ];
//     items.forEach(([k, v], r) => {
//       const cy = 314 + r * 43;
//       p.drawCircle({ x: X(92), y: Y(cy), size: 3.3 * K, color: BLACK });
//       textL(p, k, 107, cy, 21, c.f.bold, BLACK);
//       textL(p, v, 107 + c.f.bold.widthOfTextAtSize(safe(k), 21 * K) / K, cy, 21, c.f.reg, BLACK);
//     });
//   }
//   const cols = [59, 140, 398, 866], hh = 50, rh = 63.5;
//   ["S.No.", "First Name", "Meaning"].forEach((h, k) => {
//     box(p, cols[k], ty, cols[k + 1] - cols[k], hh, { fill: ORANGE, stroke: GRID, width: 1 });
//     textC(p, h, (cols[k] + cols[k + 1]) / 2, ty + hh / 2, 21, c.f.bold, WHITE);
//   });
//   for (let r = 0; r < count; r++) {
//     const y = ty + hh + r * rh, item = i.names[offset + r];
//     for (let k = 0; k < 3; k++) box(p, cols[k], y, cols[k + 1] - cols[k], rh, { fill: WHITE, stroke: GRID, width: 1 });
//     textC(p, String(offset + r + 1), (cols[0] + cols[1]) / 2, y + rh / 2, 20, c.f.reg, BLACK);
//     if (item) {
//       fitC(p, item.name, (cols[1] + cols[2]) / 2, y + rh / 2, 22, cols[2] - cols[1] - 24, c.f.bold, BLACK);
//       paragraphIn(p, [{ t: item.meaning, font: c.f.reg }], (cols[2] + cols[3]) / 2, y + rh / 2, cols[3] - cols[2] - 28, rh - 8, 17, BLACK, 10);
//     }
//   }
// }

// // ------------------------------------------------------------------ page 12
// function pageAnalysis(c: Ctx, i: NameFinderReportInput) {
//   const p = newPage(c, ["ANALYSIS OF NAME OPTIONS", "SHARED BY YOU"], { divY: 218, titleY: [116, 168], titleSize: 40 });
//   const cols = [53, 217, 345, 472, 596, 871], y0 = 295, hh = 92, rh = 63;
//   ["Name\nOption", "First\nName No.", "Full Name\nNo.", "Name\nSuitability", "Corrected Name\nSpelling"].forEach((h, k) => {
//     box(p, cols[k], y0, cols[k + 1] - cols[k], hh, { fill: ORANGE, stroke: GRID, width: 1 });
//     const parts = h.split("\n"), cx = (cols[k] + cols[k + 1]) / 2;
//     parts.forEach((t, li) => textC(p, t, cx, y0 + hh / 2 + (li - (parts.length - 1) / 2) * 25, 20, c.f.bold, WHITE));
//   });
//   const rows = (i.analysis ?? []).slice(0, 12);
//   const n = Math.max(6, rows.length);
//   for (let r = 0; r < n; r++) {
//     const y = y0 + hh + r * rh, a = rows[r];
//     const vals = a ? [a.name, String(a.firstNo), String(a.fullNo), a.suitability, a.corrected || "-"] : ["", "", "", "", ""];
//     vals.forEach((v, k) => {
//       box(p, cols[k], y, cols[k + 1] - cols[k], rh, { fill: WHITE, stroke: GRID, width: 1 });
//       fitC(p, v, (cols[k] + cols[k + 1]) / 2, y + rh / 2, 20, cols[k + 1] - cols[k] - 16, c.f.reg, BLACK);
//     });
//   }
//   footprints(c, p, 462, 1172);
// }

// // ------------------------------------------------------------------ build
// export async function buildNameFinderReport(
//   input: NameFinderReportInput,
//   assets: NameFinderAssets,
//   fontkit?: unknown,
// ): Promise<Uint8Array> {
//   if (!/^\d{4}-\d{2}-\d{2}$/.test(input.dob)) throw new Error("Date of birth is required");
//   const doc = await PDFDocument.create();
//   doc.setTitle("Numerologically Aligned Baby Names");
//   doc.setProducer("Ankshaastra");

//   let f: Fonts;
//   const af = assets.fonts;
//   if (fontkit && af?.cinzelBold && af.quicksandBold && af.quicksandRegular) {
//     doc.registerFontkit(fontkit as any);
//     const [title, bold, reg] = await Promise.all([
//       doc.embedFont(af.cinzelBold, { subset: true }), doc.embedFont(af.quicksandBold, { subset: true }), doc.embedFont(af.quicksandRegular, { subset: true }),
//     ]);
//     const titleReg = af.cinzelRegular ? await doc.embedFont(af.cinzelRegular, { subset: true }) : title;
//     const foot = af.cardo ? await doc.embedFont(af.cardo, { subset: true }) : reg;
//     f = { title, titleReg, bold, reg, foot };
//   } else {
//     // No custom fonts available (tests / missing files): standard fonts keep the layout readable.
//     const [title, bold, reg, serif] = await Promise.all([
//       doc.embedFont(StandardFonts.TimesRomanBold), doc.embedFont(StandardFonts.HelveticaBold), doc.embedFont(StandardFonts.Helvetica), doc.embedFont(StandardFonts.TimesRoman),
//     ]);
//     f = { title, titleReg: serif, bold, reg, foot: serif };
//   }
//   const c: Ctx = {
//     doc, f,
//     bg: await doc.embedJpg(assets.background),
//     fp: assets.footprints ? await doc.embedPng(assets.footprints) : null,
//   };

//   const staticPage = async (n: number) => {
//     const bytes = assets.statics[n];
//     if (!bytes) return;
//     const img = await doc.embedJpg(bytes);
//     doc.addPage([W, H]).drawImage(img, { x: 0, y: 0, width: W, height: H });
//   };

//   for (const n of [1, 2, 3]) await staticPage(n);
//   pageBirth(c, input);
//   pageLoShu(c, input);
//   pageFavourable(c, input);
//   pageReverse(c, input);
//   pageRecommendation(c, input);
//   const pages = namePageCount(nameSlots(input.package));
//   let offset = 0;
//   for (let k = 0; k < pages; k++) { pageNames(c, input, k as 0 | 1 | 2, offset); offset += NAMES_PER_PAGE[k]; }
//   pageAnalysis(c, input);
//   for (const n of [13, 14, 15, 16]) await staticPage(n);
//   return doc.save();
// }

// const getBytes = async (url: string): Promise<Uint8Array | undefined> => {
//   try { const r = await fetch(url); return r.ok ? new Uint8Array(await r.arrayBuffer()) : undefined; } catch { return undefined; }
// };

// /** Browser entry point: loads the static pages, background and fonts from /public, then builds the PDF. */
// export async function generateNameFinderReport(input: NameFinderReportInput): Promise<Uint8Array> {
//   const A = NAME_FINDER_ASSET_BASE, F = NAME_FINDER_FONT_BASE;
//   const nums = [1, 2, 3, 13, 14, 15, 16];
//   const [background, footprints, cinzelBold, cinzelRegular, quicksandBold, quicksandRegular, cardo, ...st] = await Promise.all([
//     getBytes(`${A}/bg.jpg`), getBytes(`${A}/footprints.png`),
//     getBytes(`${F}/Cinzel-Bold.ttf`), getBytes(`${F}/Cinzel-Regular.ttf`), getBytes(`${F}/Quicksand-Bold.ttf`), getBytes(`${F}/Quicksand-Regular.ttf`), getBytes(`${F}/Cardo-Regular.ttf`),
//     ...nums.map((n) => getBytes(`${A}/static-p${String(n).padStart(2, "0")}.jpg`)),
//   ]);
//   if (!background) throw new Error("Report background image is missing (public/name-finder-assets/bg.jpg)");
//   const statics: Partial<Record<number, Uint8Array>> = {};
//   nums.forEach((n, k) => { if (st[k]) statics[n] = st[k]; });
//   const fontkit = (await import("@pdf-lib/fontkit")).default;
//   return buildNameFinderReport(input, { statics, background, footprints, fonts: { cinzelBold, cinzelRegular, quicksandBold, quicksandRegular, cardo } }, fontkit);
// }


/**
 * "NUMEROLOGICALLY ALIGNED BABY NAMES" report - follows the client's 16-page sample
 * (Numerologically_Aligned_Baby_Names.pdf, page size 930 x 1315.5 pt).
 *
 *   static (image)   1 cover | 2-3 index | 13 next steps | 14-15 terms | 16 back cover
 *   dynamic (code)   4 birth details + core numbers
 *                    5 Lo Shu grid
 *                    6 favourable / unfavourable numbers
 *                    7 last name - the reverse methodology (combination table)
 *                    8 our recommendation
 *                    9 / 10 / 11 new name suggestions (12 + 12 + 8 slots, kept by package)
 *                    12 analysis of the names the parents shared
 *
 * Package rule (client): Rs 3437 -> pages 10, 11 removed (12 names); Rs 5957 -> page 11 removed (24 names);
 * Rs 5957 + extra-names add-on -> all three pages (32 names).
 *
 * All layout numbers below are in the sample's pixel space (924 x 1308) and scaled to points with K.
 */

import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb, RGB } from "pdf-lib";
import { buildStandardLoShuGrid } from "@/lib/baby-reports/shared/loshu-grid";
import { getRelation } from "@/lib/name-check/friendship-table";
import { chaldeanRawSum } from "@/lib/name-check/numerology";
import { namePageCount, nameSlots, NAMES_PER_PAGE, type PackageChoice } from "@/lib/swar/nameFinderPackage";
import type { ComboRow, NameFinderProfile } from "@/lib/swar/nameFinder";

export const NAME_FINDER_ASSET_BASE = "/name-finder-assets";
export const NAME_FINDER_FONT_BASE = "/name-check-assets/fonts";

export interface ReportName { name: string; meaning: string }
export interface AnalysisRow { name: string; firstNo: number | string; fullNo: number | string; suitability: string; corrected?: string }

export interface NameFinderReportInput {
  dob: string;                 // yyyy-mm-dd
  time?: string;               // HH:mm
  place?: string;
  gender: "boy" | "girl";
  middleName?: string;
  middleIsFather?: boolean;
  lastName?: string;
  swar?: string;               // recommended swar / first alphabet (Step 1)
  firstAlphabets?: string;     // final alphabets chosen by the parents (Step 2)
  preference?: string;         // name preference chosen by the parents
  profile: NameFinderProfile;
  package: PackageChoice;
  names: ReportName[];
  analysis?: AnalysisRow[];    // names the parents shared (Step 4/5)
}

export interface NameFinderAssets {
  statics: Partial<Record<number, Uint8Array>>; // sample page number -> JPG
  background: Uint8Array;                       // paper texture JPG
  footprints?: Uint8Array;                      // PNG with alpha
  fonts?: Partial<Record<"cinzelBold" | "cinzelRegular" | "quicksandBold" | "quicksandRegular" | "cardo", Uint8Array>>;
}

// ------------------------------------------------------------------ geometry / colours
const W = 930, H = 1315.5, K = W / 924;
const ORANGE = rgb(1, 0.647, 0);
const BLACK = rgb(0.05, 0.05, 0.05);
const WHITE = rgb(1, 1, 1);
const GRID = rgb(0.1, 0.1, 0.1);
const X = (x: number) => x * K;
const Y = (y: number) => H - y * K;

interface Fonts { title: PDFFont; titleReg: PDFFont; bold: PDFFont; reg: PDFFont; foot: PDFFont }
interface Ctx {
  doc: PDFDocument;
  f: Fonts;
  bg: Awaited<ReturnType<PDFDocument["embedJpg"]>>;
  fp: Awaited<ReturnType<PDFDocument["embedPng"]>> | null;
}

const safe = (s: string) =>
  s.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u2013\u2014]/g, "-").replace(/[^\x20-\x7E\u00A0-\u00FF]/g, "");

// ------------------------------------------------------------------ drawing helpers (px coordinates, y down)
function textC(p: PDFPage, s: string, cx: number, cy: number, size: number, font: PDFFont, color: RGB = BLACK) {
  const t = safe(s);
  const w = font.widthOfTextAtSize(t, size * K);
  p.drawText(t, { x: X(cx) - w / 2, y: Y(cy) - size * K * 0.34, size: size * K, font, color });
}
function textL(p: PDFPage, s: string, x: number, cy: number, size: number, font: PDFFont, color: RGB = BLACK) {
  p.drawText(safe(s), { x: X(x), y: Y(cy) - size * K * 0.34, size: size * K, font, color });
}
/** Shrinks the font until the text fits maxW, then centres it. */
function fitC(p: PDFPage, s: string, cx: number, cy: number, size: number, maxW: number, font: PDFFont, color: RGB = BLACK) {
  let z = size;
  while (z > 8 && font.widthOfTextAtSize(safe(s), z * K) > maxW * K) z -= 0.5;
  textC(p, s, cx, cy, z, font, color);
}
type Run = { t: string; font: PDFFont };
/** Greedy word wrap over mixed-font runs; returns lines of runs. */
function wrapRuns(runs: Run[], maxW: number, size: number): Run[][] {
  const lines: Run[][] = [[]];
  let w = 0;
  for (const r of runs) {
    for (const word of safe(r.t).split(/(\s+)/)) {
      if (!word) continue;
      const ww = r.font.widthOfTextAtSize(word, size * K) / K;
      if (w + ww > maxW && lines[lines.length - 1].length && word.trim()) { lines.push([]); w = 0; }
      if (!w && !word.trim()) continue; // no leading space on a new line
      lines[lines.length - 1].push({ t: word, font: r.font });
      w += ww;
    }
  }
  return lines;
}
function drawLines(p: PDFPage, lines: Run[][], cx: number, firstCy: number, size: number, lh: number, color: RGB = BLACK) {
  lines.forEach((ln, i) => {
    const total = ln.reduce((a, r) => a + r.font.widthOfTextAtSize(r.t, size * K), 0);
    let x = X(cx) - total / 2;
    for (const r of ln) {
      p.drawText(r.t, { x, y: Y(firstCy + i * lh) - size * K * 0.34, size: size * K, font: r.font, color });
      x += r.font.widthOfTextAtSize(r.t, size * K);
    }
  });
}
/** Wraps runs into a box (cx, cy centre, maxW x maxH); shrinks the font until it fits. */
function paragraphIn(p: PDFPage, runs: Run[], cx: number, cy: number, maxW: number, maxH: number, size: number, color: RGB = BLACK, minSize = 9) {
  let z = size, lines = wrapRuns(runs, maxW, z);
  while (z > minSize && lines.length * z * 1.28 > maxH) { z -= 0.5; lines = wrapRuns(runs, maxW, z); }
  const lh = z * 1.28;
  drawLines(p, lines, cx, cy - ((lines.length - 1) * lh) / 2, z, lh, color);
}

function path(p: PDFPage, d: string, o: { fill?: RGB; stroke?: RGB; width?: number }) {
  p.drawSvgPath(d, { x: 0, y: H, color: o.fill, borderColor: o.stroke, borderWidth: o.stroke ? (o.width ?? 1) : undefined });
}
function rrect(p: PDFPage, x: number, y: number, w: number, h: number, r: number, o: { fill?: RGB; stroke?: RGB; width?: number }) {
  const [a, b, c, d, e] = [x * K, y * K, w * K, h * K, r * K];
  path(p, `M ${a + e} ${b} L ${a + c - e} ${b} A ${e} ${e} 0 0 1 ${a + c} ${b + e} L ${a + c} ${b + d - e} A ${e} ${e} 0 0 1 ${a + c - e} ${b + d} L ${a + e} ${b + d} A ${e} ${e} 0 0 1 ${a} ${b + d - e} L ${a} ${b + e} A ${e} ${e} 0 0 1 ${a + e} ${b} Z`, o);
}
function box(p: PDFPage, x: number, y: number, w: number, h: number, o: { fill?: RGB; stroke?: RGB; width?: number }) {
  p.drawRectangle({ x: X(x), y: Y(y + h), width: w * K, height: h * K, color: o.fill, borderColor: o.stroke, borderWidth: o.stroke ? (o.width ?? 1) : undefined });
}
function line(p: PDFPage, x1: number, y1: number, x2: number, y2: number, color: RGB, width = 1) {
  p.drawLine({ start: { x: X(x1), y: Y(y1) }, end: { x: X(x2), y: Y(y2) }, thickness: width * K, color });
}

/** Gold knot divider under the titles. */
function divider(p: PDFPage, cy: number) {
  const soft = rgb(1, 0.78, 0.35);
  line(p, 360, cy, 446, cy, soft, 1);
  line(p, 478, cy, 566, cy, soft, 1);
  p.drawEllipse({ x: X(456), y: Y(cy), xScale: 7 * K, yScale: 4.5 * K, borderColor: ORANGE, borderWidth: 1.1 });
  p.drawEllipse({ x: X(468), y: Y(cy), xScale: 7 * K, yScale: 4.5 * K, borderColor: ORANGE, borderWidth: 1.1 });
}
function footprints(c: Ctx, p: PDFPage, cx = 462, cy = 1172) {
  if (!c.fp) return;
  const w = 50, h = (w * c.fp.height) / c.fp.width;
  p.drawImage(c.fp, { x: X(cx - w / 2), y: Y(cy + h / 2), width: w * K, height: h * K });
}
function footer(c: Ctx, p: PDFPage) {
  const t = "WWW.ANKSHAASTRA.COM", size = 20 * K, track = 11 * K;
  const total = [...t].reduce((a, ch) => a + c.f.foot.widthOfTextAtSize(ch, size) + track, -track);
  let x = X(462) - total / 2;
  for (const ch of t) { p.drawText(ch, { x, y: Y(1228) - size * 0.34, size, font: c.f.foot, color: ORANGE }); x += c.f.foot.widthOfTextAtSize(ch, size) + track; }
}
function newPage(c: Ctx, titleLines: string[], o: { divY?: number; titleY?: number[]; foot?: boolean; titleSize?: number } = {}): PDFPage {
  const p = c.doc.addPage([W, H]);
  p.drawImage(c.bg, { x: 0, y: 0, width: W, height: H });
  rrect(p, 22, 25, 880, 1257, 24, { stroke: ORANGE, width: 3.2 });
  const ys = o.titleY ?? (titleLines.length === 1 ? [118] : [118, 170]);
  titleLines.forEach((t, i) => fitC(p, t, 462, ys[i], o.titleSize ?? 46, 770, c.f.title, ORANGE));
  if (o.divY !== undefined) divider(p, o.divY);
  if (o.foot !== false) footer(c, p);
  return p;
}

// ------------------------------------------------------------------ text helpers
const DOB_LABEL = (iso: string) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso); return m ? `${Number(m[3])}/${Number(m[2])}/${m[1]}` : iso; };
function time12(t?: string) { const m = /^(\d{1,2}):(\d{2})/.exec(t || ""); if (!m) return "-"; const h = Number(m[1]); return `${h % 12 || 12}:${m[2]} ${h >= 12 ? "PM" : "AM"}`; }
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const COUNT_WORD = ["", "once", "twice", "three times", "four times", "five times", "six times", "seven times", "eight times", "nine times"];

function relationSentence(m: number, b: number, n: number): string {
  const rm = getRelation(m, n), rb = getRelation(b, n);
  return rm === "friendly" && rb === "friendly" ? "Friendly to both Mulank and Bhagyank" : `${cap(rm)} to Mulank and ${cap(rb)} to Bhagyank`;
}
function firstNameSentence(row: ComboRow, m: number, b: number): string {
  const rm = getRelation(m, row.n), rb = getRelation(b, row.n);
  if (row.mark === "tick") return `The first name (${row.n}) is Friendly to both Mulank and Bhagyank.`;
  const who = rm === "neutral" && rb === "neutral" ? "both Mulank and Bhagyank" : rm === "neutral" ? "Mulank" : "Bhagyank";
  return `The first name (${row.n}) is Neutral to ${who}, which is why it is circled and not ticked.`;
}

// ------------------------------------------------------------------ page 4
function pageBirth(c: Ctx, i: NameFinderReportInput) {
  const p = newPage(c, ["BIRTH", "DETAILS"], { divY: 218 });
  const rows: [string, string][] = [
    ["Date of Birth", DOB_LABEL(i.dob)],
    ["Time of Birth", time12(i.time)],
    ["Place of Birth", i.place || "-"],
    ["Gender", i.gender === "girl" ? "Female" : "Male"],
    ["Middle Name (If any)", i.middleName || ""],
    ["Is Middle Name Father\u2019s Name", i.middleName ? (i.middleIsFather ? "Yes" : "No") : ""],
    ["Last Name", i.lastName || ""],
  ];
  const x0 = 97, x1 = 462, x2 = 827, y0 = 273, rh = 67;
  rows.forEach(([k, v], r) => {
    const y = y0 + r * rh;
    box(p, x0, y, x1 - x0, rh, { fill: ORANGE, stroke: GRID, width: 1 });
    box(p, x1, y, x2 - x1, rh, { fill: WHITE, stroke: GRID, width: 1 });
    fitC(p, k, (x0 + x1) / 2, y + rh / 2, 21, 330, c.f.bold, WHITE);
    fitC(p, v, (x1 + x2) / 2, y + rh / 2, 22, 340, c.f.reg, BLACK);
  });
  fitC(p, "CORE NUMBERS", 462, 842, 46, 760, c.f.title, ORANGE);
  divider(p, 889);
  ([["MULANK", i.profile.mulank, 93], ["BHAGYANK", i.profile.bhagyank, 477]] as const).forEach(([label, n, x]) => {
    rrect(p, x, 933, 354, 222, 22, { stroke: ORANGE, width: 2.2 });
    textC(p, label, x + 177, 972, 21, c.f.bold, ORANGE);
    p.drawCircle({ x: X(x + 177), y: Y(1069), size: 62 * K, color: ORANGE });
    textC(p, String(n), x + 177, 1069, 64, c.f.title, WHITE);
  });
}

// ------------------------------------------------------------------ page 5
function pageLoShu(c: Ctx, i: NameFinderReportInput) {
  const p = newPage(c, ["LOSHU", "GRID & NUMBERS"], { divY: 218 });
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(i.dob)!;
  const grid = buildStandardLoShuGrid(Number(m[3]), Number(m[2]), Number(m[1]));
  const counts = grid.counts as Record<number, number>;
  const layout = [[4, 9, 2], [3, 5, 7], [8, 1, 6]];
  const gx = 209, gy = 268, cw = 506 / 3, ch = 506 / 3;
  layout.forEach((row, r) => row.forEach((d, col) => {
    const n = counts[d] ?? 0, x = gx + col * cw, y = gy + r * ch;
    box(p, x, y, cw, ch, { fill: n ? ORANGE : WHITE, stroke: GRID, width: 1 });
    fitC(p, n ? String(d).repeat(n) : `${d} (Missing)`, x + cw / 2, y + ch / 2, 28, cw - 14, c.f.bold, n ? WHITE : ORANGE);
  }));
  const present = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => (counts[d] ?? 0) > 0);
  const missing = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => !counts[d]);
  const repeated = present.filter((d) => counts[d] > 1).map((d) => `${d} (${COUNT_WORD[Math.min(counts[d], 9)]})`);
  const info: [string, string, number, number, number][] = [
    ["Present", present.join(", ") || "-", 118, 851, 283],
    ["Repeated", repeated.join(", ") || "None", 514, 851, 283],
    ["Missing", missing.join(", ") || "None", 320, 1000, 283],
  ];
  for (const [label, val, x, y, w] of info) {
    rrect(p, x, y, w, 111, 16, { stroke: ORANGE, width: 2 });
    rrect(p, x + w / 2 - 66, y - 24, 132, 49, 24, { fill: WHITE, stroke: ORANGE, width: 2 });
    textC(p, label, x + w / 2, y + 1, 22, c.f.reg, BLACK);
    paragraphIn(p, [{ t: val, font: c.f.reg }], x + w / 2, y + 62, w - 40, 62, 22);
  }
  footprints(c, p, 462, 1172);
}

// ------------------------------------------------------------------ page 6
type Status = "Lucky" | "Neutral" | "Avoid";
/** Lucky = Friendly to both core numbers; Avoid = Enemy to either; everything else Neutral. */
export function favourableTable(m: number, b: number) {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
    const rm = getRelation(m, n), rb = getRelation(b, n);
    const status: Status = rm === "enemy" || rb === "enemy" ? "Avoid" : rm === "friendly" && rb === "friendly" ? "Lucky" : "Neutral";
    return { n, rm: cap(rm), rb: cap(rb), status };
  });
}
function pageFavourable(c: Ctx, i: NameFinderReportInput) {
  const p = newPage(c, ["YOUR FAVOURABLE &", "UNFAVOURABLE NUMBERS"], { divY: 218, titleSize: 44, foot: false });
  const cols = [89, 206, 430, 650, 835], y0 = 267, hh = 67;
  ["Number", "Mulank", "Bhagyank", "Final Status"].forEach((h, k) => {
    box(p, cols[k], y0, cols[k + 1] - cols[k], hh, { fill: ORANGE, stroke: GRID, width: 1 });
    textC(p, h, (cols[k] + cols[k + 1]) / 2, y0 + hh / 2, 22, c.f.bold, WHITE);
  });
  const rows = favourableTable(i.profile.mulank, i.profile.bhagyank);
  rows.forEach((r, ri) => {
    const y = y0 + hh + ri * 67;
    [String(r.n), r.rm, r.rb, r.status].forEach((v, k) => {
      box(p, cols[k], y, cols[k + 1] - cols[k], 67, { fill: WHITE, stroke: GRID, width: 1 });
      textC(p, v, (cols[k] + cols[k + 1]) / 2, y + 33.5, 22, c.f.reg, BLACK);
    });
  });
  const lucky = rows.filter((r) => r.status === "Lucky").map((r) => r.n).join(", ") || "None";
  const avoid = rows.filter((r) => r.status === "Avoid").map((r) => r.n).join(", ") || "None";
  ([["Lucky Numbers", lucky, 966], ["Numbers to Avoid", avoid, 1092]] as const).forEach(([label, val, y]) => {
    rrect(p, 200, y + 25, 523, 76, 16, { stroke: ORANGE, width: 2 });
    rrect(p, 462 - 132, y, 264, 50, 25, { fill: WHITE, stroke: ORANGE, width: 2 });
    textC(p, label, 462, y + 25, 22, c.f.bold, ORANGE);
    textC(p, val, 462, y + 75, 23, c.f.reg, BLACK);
  });
}

// ------------------------------------------------------------------ page 7
function markShape(p: PDFPage, mark: "cross" | "circle" | "tick", star: boolean, cx: number, cy: number) {
  const s = 11;
  if (star) {
    const pts: string[] = [];
    for (let k = 0; k < 10; k++) {
      const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 === 0 ? 14 : 5.8;
      pts.push(`${k ? "L" : "M"} ${(cx + r * Math.cos(a)) * K} ${(cy + r * Math.sin(a)) * K}`);
    }
    path(p, pts.join(" ") + " Z", { fill: BLACK });
  } else if (mark === "cross") {
    line(p, cx - s, cy - s, cx + s, cy + s, BLACK, 2.6); line(p, cx - s, cy + s, cx + s, cy - s, BLACK, 2.6);
  } else if (mark === "tick") {
    line(p, cx - s, cy, cx - 3, cy + s - 1, BLACK, 2.8); line(p, cx - 3, cy + s - 1, cx + s + 2, cy - s, BLACK, 2.8);
  } else {
    p.drawCircle({ x: X(cx), y: Y(cy), size: 10.5 * K, borderColor: BLACK, borderWidth: 2.4 * K });
  }
}
function pageReverse(c: Ctx, i: NameFinderReportInput) {
  const p = newPage(c, ["LAST NAME-THE REVERSE", "METHODOLOGY"], { divY: 218, titleSize: 44 });
  const pr = i.profile, sn = pr.surname;
  // letters strip
  const letters = (sn?.text ?? "").replace(/[^A-Za-z]/g, "").toUpperCase().split("").filter(Boolean);
  const slots = Math.max(8, letters.length), x0 = 92, xT = 637, x2 = 831;
  box(p, x0, 299, xT - x0, 75, { fill: ORANGE, stroke: GRID, width: 1 });
  box(p, x0, 374, xT - x0, 74, { fill: ORANGE, stroke: GRID, width: 1 });
  box(p, xT, 299, x2 - xT, 75, { fill: ORANGE, stroke: GRID, width: 1 });
  box(p, xT, 374, x2 - xT, 74, { fill: ORANGE, stroke: GRID, width: 1 });
  const sw = (xT - x0 - 30) / slots;
  for (let k = 0; k < slots; k++) {
    const cx = x0 + 15 + sw * (k + 0.5), ch = letters[k];
    textC(p, ch ?? "-", cx, 337, 22, c.f.bold, WHITE);
    textC(p, ch ? String(chaldeanRawSum(ch)) : "-", cx, 411, 22, c.f.bold, WHITE);
  }
  textC(p, "TOTAL", (xT + x2) / 2, 337, 22, c.f.bold, WHITE);
  if (sn && sn.total > 9) {
    const cx = (xT + x2) / 2, tw = c.f.bold.widthOfTextAtSize(String(sn.total), 22 * K) / K;
    const nw = c.f.bold.widthOfTextAtSize(String(sn.number), 22 * K) / K;
    const total = tw + 14 + 30 + 14 + nw, left = cx - total / 2;
    textL(p, String(sn.total), left, 411, 22, c.f.bold, WHITE);
    const ax = left + tw + 14;
    line(p, ax, 411, ax + 30, 411, WHITE, 2.4); line(p, ax + 21, 403, ax + 30, 411, WHITE, 2.4); line(p, ax + 21, 419, ax + 30, 411, WHITE, 2.4);
    textL(p, String(sn.number), ax + 30 + 14, 411, 22, c.f.bold, WHITE);
  } else textC(p, sn ? String(sn.number) : "-", (xT + x2) / 2, 411, 22, c.f.bold, WHITE);

  // combination table
  const cols = [92, 188, 280, 377, 466, 831], ty = 491, hh = 69, rh = 67;
  ["First\nName", "Last\nName", "Full\nName", "Status", "Reason"].forEach((h, k) => {
    box(p, cols[k], ty, cols[k + 1] - cols[k], hh, { fill: ORANGE, stroke: GRID, width: 1 });
    const parts = h.split("\n"), cx = (cols[k] + cols[k + 1]) / 2;
    parts.forEach((t, li) => textC(p, t, cx, ty + hh / 2 + (li - (parts.length - 1) / 2) * 25, 22, c.f.bold, WHITE));
  });
  const table = pr.table ?? [];
  const survivors = table.filter((r) => r.mark !== "cross").length;
  table.forEach((r, ri) => {
    const y = ty + hh + ri * rh;
    [String(r.n), String(r.surname), String(r.total)].forEach((v, k) => {
      box(p, cols[k], y, cols[k + 1] - cols[k], rh, { fill: WHITE, stroke: GRID, width: 1 });
      textC(p, v, (cols[k] + cols[k + 1]) / 2, y + rh / 2, 22, c.f.reg, BLACK);
    });
    box(p, cols[3], y, cols[4] - cols[3], rh, { fill: WHITE, stroke: GRID, width: 1 });
    markShape(p, r.mark, r.star, (cols[3] + cols[4]) / 2, y + rh / 2);
    box(p, cols[4], y, cols[5] - cols[4], rh, { fill: WHITE, stroke: GRID, width: 1 });
    const runs: Run[] = [];
    if (r.mark === "cross") runs.push({ t: r.reason, font: c.f.reg });
    else {
      const lead = r.star ? "Top combination." : survivors === 1 ? "Top combination, the only one without a cross." : "Workable combination, no cross.";
      runs.push({ t: lead + " ", font: c.f.bold });
      const rm = getRelation(pr.mulank, r.total), rb = getRelation(pr.bhagyank, r.total);
      const full = rm === "friendly" && rb === "friendly" ? "Friendly to both" : `${cap(rm)} to Mulank, ${cap(rb)} to Bhagyank`;
      const fm = getRelation(pr.mulank, r.n), fb = getRelation(pr.bhagyank, r.n);
      const first = r.mark === "tick" ? "Friendly to both" : `Neutral to ${fm === "neutral" && fb === "neutral" ? "both" : fm === "neutral" ? "Mulank" : "Bhagyank"}`;
      runs.push({ t: `Full name ${r.total}: ${full}. First name ${r.n}: ${first}${r.mark === "circle" ? " (circled)" : ""}.`, font: c.f.reg });
    }
    paragraphIn(p, runs, (cols[4] + cols[5]) / 2, y + rh / 2, cols[5] - cols[4] - 24, rh - 8, 15, BLACK, 9);
  });
  if (!table.length) textC(p, "Enter the surname in Step 3 to build this table.", 462, 700, 20, c.f.reg, BLACK);
}

// ------------------------------------------------------------------ page 8
function pageRecommendation(c: Ctx, i: NameFinderReportInput) {
  const p = newPage(c, ["OUR", "RECOMMENDATION"], { divY: 218 });
  const pr = i.profile, sn = pr.surname;
  const ranked = (pr.table ?? []).filter((r) => r.mark !== "cross")
    .sort((a, b) => (a.star ? 0 : a.mark === "tick" ? 1 : 2) - (b.star ? 0 : b.mark === "tick" ? 1 : 2) || a.n - b.n);
  const only = ranked.length === 1;
  const surname = i.lastName || sn?.text || "the surname";
  const blocks = ["First choice", "Second choice"].map((label, k) => {
    const r = ranked[k];
    const y = k === 0 ? 281 : 704;
    if (!r) {
      const none = ranked.length === 0;
      return {
        label, y,
        sub: none ? "NO COMBINATION AVOIDS EVERY CROSS" : "NO OTHER COMBINATION AVOIDS EVERY CROSS",
        body: none
          ? `With the surname ${surname}${sn ? ` (${sn.number})` : ""}, every first-name number carries an Enemy or a restricted number. Please discuss a spelling adjustment of the surname with us.`
          : "For this surname only one first-name number works. Every other number carries an Enemy or a restricted number, as shown in the table on the previous page.",
      };
    }
    const intro = only
      ? `With the surname ${surname} (${sn?.number}), only this combination avoids every Enemy and every restricted number.`
      : `With the surname ${surname} (${sn?.number}), this combination avoids every Enemy and every restricted number.`;
    return {
      label, y,
      sub: `A FIRST NAME THAT TOTALS ${r.n}, GIVING A FULL NAME THAT TOTALS ${r.total}`,
      body: `${intro} The full name lands on ${r.total}, which is ${relationSentence(pr.mulank, pr.bhagyank, r.total)}. ${firstNameSentence(r, pr.mulank, pr.bhagyank)}`,
    };
  });
  blocks.forEach(({ label, sub, body, y }, k) => {
    rrect(p, 210, y + 40, 503, 73, 36, { stroke: ORANGE, width: 2.4 });
    p.drawCircle({ x: X(223), y: Y(y + 39), size: 38 * K, color: ORANGE });
    textC(p, `0${k + 1}`, 223, y + 39, 30, c.f.title, WHITE);
    textC(p, label, 462, y + 77, 30, c.f.titleReg, ORANGE);
    fitC(p, sub, 462, y + 174, 17.5, 800, c.f.bold, ORANGE);
    divider(p, y + 210);
    paragraphIn(p, [{ t: body, font: c.f.reg }], 462, y + 305, 740, 150, 21.5, BLACK, 14);
  });
  footprints(c, p, 462, 1172);
}

// ------------------------------------------------------------------ pages 9-11
function pageNames(c: Ctx, i: NameFinderReportInput, pageIdx: 0 | 1 | 2, offset: number) {
  const count = NAMES_PER_PAGE[pageIdx];
  const p = newPage(c, ["NEW NAME SUGGESTIONS"], { divY: pageIdx === 0 ? 163 : undefined, foot: false, titleSize: 42 });
  fitC(p, "NUMEROLOGICALLY ALIGNED NAME OPTIONS SPECIALLY CURATED FOR", 462, 229, 17.5, 820, c.f.bold, ORANGE);
  fitC(p, "YOUR CHILD\u2019S DATE OF BIRTH AND PREFERENCES", 462, 254, 17.5, 820, c.f.bold, ORANGE);
  const ty = pageIdx === 0 ? 452 : pageIdx === 1 ? 355 : 394;
  if (pageIdx === 0) {
    rrect(p, 59, 288, 807, 139, 20, { stroke: ORANGE, width: 2 });
    const items: [string, string][] = [
      ["Recommended Swar / First Alphabet: ", i.swar || ""],
      ["Final Swar / First Alphabet selected by Parents: ", i.firstAlphabets || ""],
      ["Name Preference selected by Parents: ", i.preference || ""],
    ];
    items.forEach(([k, v], r) => {
      const cy = 314 + r * 43;
      p.drawCircle({ x: X(92), y: Y(cy), size: 3.3 * K, color: BLACK });
      textL(p, k, 107, cy, 21, c.f.bold, BLACK);
      textL(p, v, 107 + c.f.bold.widthOfTextAtSize(safe(k), 21 * K) / K, cy, 21, c.f.reg, BLACK);
    });
  }
  const cols = [59, 140, 398, 866], hh = 50, rh = 63.5;
  ["S.No.", "First Name", "Meaning"].forEach((h, k) => {
    box(p, cols[k], ty, cols[k + 1] - cols[k], hh, { fill: ORANGE, stroke: GRID, width: 1 });
    textC(p, h, (cols[k] + cols[k + 1]) / 2, ty + hh / 2, 21, c.f.bold, WHITE);
  });
  for (let r = 0; r < count; r++) {
    const y = ty + hh + r * rh, item = i.names[offset + r];
    for (let k = 0; k < 3; k++) box(p, cols[k], y, cols[k + 1] - cols[k], rh, { fill: WHITE, stroke: GRID, width: 1 });
    textC(p, String(offset + r + 1), (cols[0] + cols[1]) / 2, y + rh / 2, 20, c.f.reg, BLACK);
    if (item) {
      fitC(p, item.name, (cols[1] + cols[2]) / 2, y + rh / 2, 22, cols[2] - cols[1] - 24, c.f.bold, BLACK);
      paragraphIn(p, [{ t: item.meaning, font: c.f.reg }], (cols[2] + cols[3]) / 2, y + rh / 2, cols[3] - cols[2] - 28, rh - 8, 17, BLACK, 10);
    }
  }
}

// ------------------------------------------------------------------ page 12
function pageAnalysis(c: Ctx, i: NameFinderReportInput) {
  const p = newPage(c, ["ANALYSIS OF NAME OPTIONS", "SHARED BY YOU"], { divY: 218, titleY: [116, 168], titleSize: 40 });
  const cols = [53, 217, 345, 472, 596, 871], y0 = 295, hh = 92, rh = 63;
  ["Name\nOption", "First\nName No.", "Full Name\nNo.", "Name\nSuitability", "Corrected Name\nSpelling"].forEach((h, k) => {
    box(p, cols[k], y0, cols[k + 1] - cols[k], hh, { fill: ORANGE, stroke: GRID, width: 1 });
    const parts = h.split("\n"), cx = (cols[k] + cols[k + 1]) / 2;
    parts.forEach((t, li) => textC(p, t, cx, y0 + hh / 2 + (li - (parts.length - 1) / 2) * 25, 20, c.f.bold, WHITE));
  });
  const rows = (i.analysis ?? []).slice(0, 12);
  const n = Math.max(6, rows.length);
  for (let r = 0; r < n; r++) {
    const y = y0 + hh + r * rh, a = rows[r];
    const vals = a ? [a.name, String(a.firstNo), String(a.fullNo), a.suitability, a.corrected || "-"] : ["", "", "", "", ""];
    vals.forEach((v, k) => {
      box(p, cols[k], y, cols[k + 1] - cols[k], rh, { fill: WHITE, stroke: GRID, width: 1 });
      fitC(p, v, (cols[k] + cols[k + 1]) / 2, y + rh / 2, 20, cols[k + 1] - cols[k] - 16, c.f.reg, BLACK);
    });
  }
  footprints(c, p, 462, 1172);
}

// ------------------------------------------------------------------ build
export async function buildNameFinderReport(
  input: NameFinderReportInput,
  assets: NameFinderAssets,
  fontkit?: unknown,
): Promise<Uint8Array> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.dob)) throw new Error("Date of birth is required");
  const doc = await PDFDocument.create();
  doc.setTitle("Numerologically Aligned Baby Names");
  doc.setProducer("Ankshaastra");

  let f: Fonts;
  const af = assets.fonts;
  if (fontkit && af?.cinzelBold && af.quicksandBold && af.quicksandRegular) {
    doc.registerFontkit(fontkit as any);
    const [title, bold, reg] = await Promise.all([
      doc.embedFont(af.cinzelBold, { subset: true }), doc.embedFont(af.quicksandBold, { subset: true }), doc.embedFont(af.quicksandRegular, { subset: true }),
    ]);
    const titleReg = af.cinzelRegular ? await doc.embedFont(af.cinzelRegular, { subset: true }) : title;
    const foot = af.cardo ? await doc.embedFont(af.cardo, { subset: true }) : reg;
    f = { title, titleReg, bold, reg, foot };
  } else {
    // No custom fonts available (tests / missing files): standard fonts keep the layout readable.
    const [title, bold, reg, serif] = await Promise.all([
      doc.embedFont(StandardFonts.TimesRomanBold), doc.embedFont(StandardFonts.HelveticaBold), doc.embedFont(StandardFonts.Helvetica), doc.embedFont(StandardFonts.TimesRoman),
    ]);
    f = { title, titleReg: serif, bold, reg, foot: serif };
  }
  const c: Ctx = {
    doc, f,
    bg: await doc.embedJpg(assets.background),
    fp: assets.footprints ? await doc.embedPng(assets.footprints) : null,
  };

  const staticPage = async (n: number) => {
    const bytes = assets.statics[n];
    if (!bytes) return;
    const img = await doc.embedJpg(bytes);
    doc.addPage([W, H]).drawImage(img, { x: 0, y: 0, width: W, height: H });
  };

  // The page "Analysis of name options shared by you" is only added when the parents have shared names. Without
  // names it would be an empty table, so it is dropped and a copy of index page 3 without the "08 Analysis" line
  // is used. If that image is missing the old layout is kept, so the index never lists a page that is not there.
  const hasAnalysis = (input.analysis ?? []).some((a) => a.name.trim());
  const dropAnalysis = !hasAnalysis && !!assets.statics[103];
  await staticPage(1); await staticPage(2); await staticPage(dropAnalysis ? 103 : 3);
  pageBirth(c, input);
  pageLoShu(c, input);
  pageFavourable(c, input);
  pageReverse(c, input);
  pageRecommendation(c, input);
  const pages = namePageCount(nameSlots(input.package));
  let offset = 0;
  for (let k = 0; k < pages; k++) { pageNames(c, input, k as 0 | 1 | 2, offset); offset += NAMES_PER_PAGE[k]; }
  if (!dropAnalysis) pageAnalysis(c, input);
  for (const n of [13, 14, 15, 16]) await staticPage(n);
  return doc.save();
}

const getBytes = async (url: string): Promise<Uint8Array | undefined> => {
  try { const r = await fetch(url); return r.ok ? new Uint8Array(await r.arrayBuffer()) : undefined; } catch { return undefined; }
};

/** Browser entry point: loads the static pages, background and fonts from /public, then builds the PDF. */
export async function generateNameFinderReport(input: NameFinderReportInput): Promise<Uint8Array> {
  const A = NAME_FINDER_ASSET_BASE, F = NAME_FINDER_FONT_BASE;
  const nums = [1, 2, 3, 13, 14, 15, 16, 103]; // 103 = index page 3 without the Analysis line
  const [background, footprints, cinzelBold, cinzelRegular, quicksandBold, quicksandRegular, cardo, ...st] = await Promise.all([
    getBytes(`${A}/bg.jpg`), getBytes(`${A}/footprints.png`),
    getBytes(`${F}/Cinzel-Bold.ttf`), getBytes(`${F}/Cinzel-Regular.ttf`), getBytes(`${F}/Quicksand-Bold.ttf`), getBytes(`${F}/Quicksand-Regular.ttf`), getBytes(`${F}/Cardo-Regular.ttf`),
    ...nums.map((n) => getBytes(n === 103 ? `${A}/static-p03-no-analysis.jpg` : `${A}/static-p${String(n).padStart(2, "0")}.jpg`)),
  ]);
  if (!background) throw new Error("Report background image is missing (public/name-finder-assets/bg.jpg)");
  const statics: Partial<Record<number, Uint8Array>> = {};
  nums.forEach((n, k) => { if (st[k]) statics[n] = st[k]; });
  const fontkit = (await import("@pdf-lib/fontkit")).default;
  return buildNameFinderReport(input, { statics, background, footprints, fonts: { cinzelBold, cinzelRegular, quicksandBold, quicksandRegular, cardo } }, fontkit);
}
