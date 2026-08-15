// /**
//  * NameCheckReportGenerator.tsx
//  * -----------------------------------------------------------------------
//  * Ankshaastra-branded Name Check Report PDF generator.
//  *
//  * Rebuilt to match the client-supplied "Ankshaastra — Empower Your Name"
//  * template: Chaldean Numerology (not Pythagorean), Mulank / Bhagyank /
//  * First Name Number / Full Name Number / Full Name Compound Number, and
//  * the same page-by-page structure and rose/maroon branding as the
//  * reference PDF. Built on pdf-lib only — runs in the browser (admin
//  * "Generate PDF" action) or in a Supabase Edge Function / Node script.
//  *
//  * Install:
//  *   npm install pdf-lib
//  *
//  * Usage (unchanged from before — same public API):
//  *   import { generateNameCheckReportPdf, nameCheckReportPdfToBlob } from "@/components/NameCheckReportGenerator";
//  *
//  *   const bytes = await generateNameCheckReportPdf({
//  *     reportId: report.report_id,
//  *     customerName: report.customer_name,   // "Vivaan Amey Madye" — auto split into first/middle/last
//  *     email: report.email,
//  *     phone: report.phone,
//  *     dob: report.dob,
//  *     gender: report.gender,
//  *     generatedDate: new Date().toISOString(),
//  *   });
//  * -----------------------------------------------------------------------
//  */

// import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb, RGB } from "pdf-lib";
// import fontkit from "@pdf-lib/fontkit";
// import { runNameCheck } from "@/lib/name-check/rule-engine";
// import { chaldeanRawSum, getFullNameCompoundNumber } from "@/lib/name-check/numerology";
// import { FIRST_NAME_BLOCKS, FULL_NAME_BLOCKS, COMPOUND_BLOCKS, comboKey } from "@/lib/name-check/content-blocks";
// import { ALL_RULES } from "@/lib/name-check/hr-oa-nr-blocks";

// /* ------------------------------------------------------------------ */
// /*  Public data contract                                               */
// /* ------------------------------------------------------------------ */

// export interface NameCheckReportInput {
//   reportId: string;
//   customerName: string;
//   email: string;
//   phone: string;
//   /** ISO date string, e.g. "2016-08-25" */
//   dob: string;
//   gender: string;
//   /** ISO datetime string. Defaults to "now" if omitted. */
//   generatedDate?: string;
//   /** Optional explicit name-parts override (else auto-split from customerName). */
//   firstName?: string;
//   middleName?: string;
//   lastName?: string;
//   /** Optional branding overrides. */
//   brand?: Partial<BrandConfig>;
// }

// interface BrandConfig {
//   companyName: string;
//   tagline: string;
//   numerologistName: string;
//   email: string;
//   phone: string;
//   website: string;
// }

// const DEFAULT_BRAND: BrandConfig = {
//   companyName: "Ankshaastra",
//   tagline: "Empower Your Name",
//   numerologistName: "Himansshu Agarwal Ji",
//   email: "support@ankshaastra.com",
//   phone: "+91 98765 43210",
//   website: "www.ankshaastra.com",
// };

// /* ------------------------------------------------------------------ */
// /*  Numerology engine — now lives in src/lib/name-check/*              */
// /*  (friendship-table.ts, compound-table.ts, lo-shu.ts, numerology.ts, */
// /*  rule-engine.ts). Only name-splitting stays local to this file.     */
// /* ------------------------------------------------------------------ */

// /** Splits a full name into first / middle / last, best-effort. */
// function splitName(fullName: string): { first: string; middle: string; last: string } {
//   const parts = fullName.trim().split(/\s+/).filter(Boolean);
//   if (parts.length === 0) return { first: "", middle: "", last: "" };
//   if (parts.length === 1) return { first: parts[0], middle: "", last: "" };
//   if (parts.length === 2) return { first: parts[0], middle: "", last: parts[1] };
//   return { first: parts[0], middle: parts.slice(1, -1).join(" "), last: parts[parts.length - 1] };
// }

// const NUMBER_KEYWORDS: Record<number, string> = {
//   1: "leadership, independence and pioneering drive, governed by the Sun",
//   2: "diplomacy, sensitivity and partnership, governed by the Moon",
//   3: "creativity, expression and expansion, governed by Jupiter",
//   4: "structure, discipline and steady building, governed by Rahu — a number many numerologists treat with caution",
//   5: "adaptability, communication and quick change, governed by Mercury",
//   6: "harmony, beauty and responsibility, governed by Venus",
//   7: "introspection, spirituality and independence, governed by Ketu/Neptune",
//   8: "ambition and material mastery, but governed by Saturn — whose restrictive energy consistently brings delays, burdens and slow progress",
//   9: "compassion, courage and humanitarian drive, governed by Mars",
// };

// /* ------------------------------------------------------------------ */
// /*  Layout constants — rose / maroon Ankshaastra palette                */
// /* ------------------------------------------------------------------ */

// const PAGE_WIDTH = 595.28; // A4 portrait, points
// const PAGE_HEIGHT = 841.89;

// const COLOR = {
//   blush: rgb(0.976, 0.933, 0.925), // pale rose page background
//   blushPanel: rgb(0.965, 0.902, 0.89), // slightly deeper rose panel fill
//   maroon: rgb(0.545, 0.161, 0.176), // primary brand maroon/red
//   maroonDark: rgb(0.42, 0.11, 0.13),
//   ink: rgb(0.2, 0.13, 0.13),
//   muted: rgb(0.5, 0.4, 0.4),
//   white: rgb(1, 1, 1),
//   cream: rgb(0.99, 0.97, 0.95),
//   green: rgb(0.15, 0.45, 0.2),
//   red: rgb(0.6, 0.15, 0.15),
// };

// interface Fonts {
//   sans: PDFFont; // Quicksand Regular — all body text, labels, bullets
//   sansBold: PDFFont; // Quicksand Bold — bold labels, table headers, banners
//   heading: PDFFont; // Cinzel Decorative Bold — big decorative section/report titles
//   quote: PDFFont; // Cardo Regular — italic-style welcome message quote only
// }

// /**
//  * Design assets extracted from the client's reference PDF (Bindhu Sree Reddy
//  * sample). Must be uploaded to the project's /public folder at these exact
//  * paths — see design-assets/ handoff for the source files.
//  */
// const ASSET_PATHS = {
//   background: "/name-check-assets/background-border.png",
//   logo: "/name-check-assets/logo-ankshaastra.png",
//   loshuGrid: "/name-check-assets/loshu-turtle-grid.png",
//   starIcon: "/name-check-assets/star-icon.png",
//   fonts: {
//     quicksandRegular: "/name-check-assets/fonts/Quicksand-Regular.ttf",
//     quicksandBold: "/name-check-assets/fonts/Quicksand-Bold.ttf",
//     cinzelDecorativeBold: "/name-check-assets/fonts/CinzelDecorative-Bold.ttf",
//     cardoRegular: "/name-check-assets/fonts/Cardo-Regular.ttf",
//     // NotoSans-Regular.ttf is fetched too but currently unused directly —
//     // reserved as a fallback for any glyph Quicksand/Cardo don't cover.
//   },
// };

// /** Fetches a static asset from /public and returns its raw bytes. */
// async function fetchAssetBytes(path: string): Promise<Uint8Array> {
//   const res = await fetch(path);
//   if (!res.ok) {
//     throw new Error(`Name Check PDF: failed to fetch design asset "${path}" (${res.status}). Check it was uploaded to /public${path}.`);
//   }
//   return new Uint8Array(await res.arrayBuffer());
// }

// /* ------------------------------------------------------------------ */
// /*  Drawing helpers                                                    */
// /* ------------------------------------------------------------------ */

// function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
//   const words = text.split(/\s+/);
//   const lines: string[] = [];
//   let current = "";

//   for (const word of words) {
//     const trial = current ? `${current} ${word}` : word;
//     if (font.widthOfTextAtSize(trial, size) > maxWidth && current) {
//       lines.push(current);
//       current = word;
//     } else {
//       current = trial;
//     }
//   }
//   if (current) lines.push(current);
//   return lines;
// }

// function drawWrappedText(
//   page: PDFPage,
//   text: string,
//   opts: { x: number; y: number; font: PDFFont; size: number; maxWidth: number; lineHeight: number; color: RGB }
// ): number {
//   const lines = wrapText(text, opts.font, opts.size, opts.maxWidth);
//   let cursorY = opts.y;
//   for (const line of lines) {
//     page.drawText(line, { x: opts.x, y: cursorY, size: opts.size, font: opts.font, color: opts.color });
//     cursorY -= opts.lineHeight;
//   }
//   return cursorY;
// }

// /** Bulleted list helper — small maroon dot + wrapped text, returns new Y. */
// function drawBulletList(
//   page: PDFPage,
//   items: string[],
//   opts: { x: number; y: number; font: PDFFont; size: number; maxWidth: number; lineHeight: number; gap: number; color: RGB }
// ): number {
//   let y = opts.y;
//   items.forEach((item) => {
//     page.drawCircle({ x: opts.x + 3, y: y - 4, size: 2.4, color: COLOR.maroon });
//     y = drawWrappedText(page, item, {
//       x: opts.x + 14,
//       y,
//       font: opts.font,
//       size: opts.size,
//       maxWidth: opts.maxWidth - 14,
//       lineHeight: opts.lineHeight,
//       color: opts.color,
//     });
//     y -= opts.gap;
//   });
//   return y;
// }

// interface Assets {
//   background: import("pdf-lib").PDFImage;
//   logo: import("pdf-lib").PDFImage;
//   loshuGrid: import("pdf-lib").PDFImage;
//   starIcon: import("pdf-lib").PDFImage;
// }

// /** Draws the real background/border image full-bleed — replaces the old flat COLOR.blush + drawFrame(). */
// function drawPageBackground(page: PDFPage, assets: Assets) {
//   page.drawImage(assets.background, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });
// }

// function drawFrame(page: PDFPage) {
//   const inset = 16;
//   page.drawRectangle({
//     x: inset,
//     y: inset,
//     width: PAGE_WIDTH - inset * 2,
//     height: PAGE_HEIGHT - inset * 2,
//     borderColor: COLOR.maroon,
//     borderWidth: 1,
//   });
// }

// /** Rounded-ish pill/banner used for section headers throughout the template. */
// function drawMaroonBanner(page: PDFPage, fonts: Fonts, text: string, x: number, y: number, width: number, height = 30) {
//   page.drawRectangle({ x, y: y - height, width, height, color: COLOR.maroon });
//   page.drawText(text.toUpperCase(), {
//     x: x + width / 2 - fonts.sansBold.widthOfTextAtSize(text.toUpperCase(), 10) / 2,
//     y: y - height / 2 - 3.5,
//     size: 10,
//     font: fonts.sansBold,
//     color: COLOR.white,
//   });
// }

// /** Standard page chrome: real background image, small logo, header title, footer. */
// function drawPageChrome(
//   page: PDFPage,
//   fonts: Fonts,
//   assets: Assets,
//   opts: { title: string; subtitle?: string; pageNumber: number; totalPages: number; brand: BrandConfig }
// ) {
//   drawPageBackground(page, assets);

//   // Small logo, top-left, on every interior page (matches client's repeated header treatment)
//   const logoDims = assets.logo.scale(0.16);
//   page.drawImage(assets.logo, { x: 44, y: PAGE_HEIGHT - 44 - logoDims.height, width: logoDims.width, height: logoDims.height });

//   page.drawText(opts.title, {
//     x: 44,
//     y: PAGE_HEIGHT - 80 - logoDims.height,
//     size: 20,
//     font: fonts.heading,
//     color: COLOR.maroon,
//   });
//   page.drawLine({
//     start: { x: 44, y: PAGE_HEIGHT - 92 - logoDims.height },
//     end: { x: 44 + 70, y: PAGE_HEIGHT - 92 - logoDims.height },
//     thickness: 1.5,
//     color: COLOR.maroon,
//   });
//   if (opts.subtitle) {
//     page.drawText(opts.subtitle, {
//       x: 44,
//       y: PAGE_HEIGHT - 108 - logoDims.height,
//       size: 10.5,
//       font: fonts.sans,
//       color: COLOR.muted,
//     });
//   }

//   // Footer
//   page.drawLine({
//     start: { x: 44, y: 50 },
//     end: { x: PAGE_WIDTH - 44, y: 50 },
//     thickness: 0.75,
//     color: COLOR.maroon,
//   });
//   page.drawText(`WWW.${opts.brand.website.replace(/^www\./i, "").toUpperCase()}`, {
//     x: 44,
//     y: 34,
//     size: 8,
//     font: fonts.sansBold,
//     color: COLOR.muted,
//   });
//   const pageStr = `Page ${opts.pageNumber} of ${opts.totalPages}`;
//   page.drawText(pageStr, {
//     x: PAGE_WIDTH - 44 - fonts.sans.widthOfTextAtSize(pageStr, 8),
//     y: 34,
//     size: 8,
//     font: fonts.sans,
//     color: COLOR.muted,
//   });
// }

// /** Two-column data table: label left, value right, alternating row tint. */
// function drawDataTable(
//   page: PDFPage,
//   fonts: Fonts,
//   rows: [string, string][],
//   opts: { x: number; y: number; width: number; rowHeight?: number }
// ): number {
//   const rowHeight = opts.rowHeight ?? 32;
//   let y = opts.y;
//   rows.forEach(([label, value], i) => {
//     if (i % 2 === 0) {
//       page.drawRectangle({ x: opts.x, y: y - rowHeight, width: opts.width, height: rowHeight, color: COLOR.blushPanel });
//     }
//     page.drawRectangle({
//       x: opts.x,
//       y: y - rowHeight,
//       width: opts.width,
//       height: rowHeight,
//       borderColor: rgb(0.86, 0.76, 0.74),
//       borderWidth: 0.5,
//     });
//     page.drawText(label, { x: opts.x + 12, y: y - rowHeight / 2 - 4, size: 10.5, font: fonts.sansBold, color: COLOR.maroonDark });
//     page.drawText(value || "—", {
//       x: opts.x + opts.width / 2 + 12,
//       y: y - rowHeight / 2 - 4,
//       size: 11,
//       font: fonts.sans,
//       color: COLOR.ink,
//     });
//     // Divider between label/value columns
//     page.drawLine({
//       start: { x: opts.x + opts.width / 2, y },
//       end: { x: opts.x + opts.width / 2, y: y - rowHeight },
//       thickness: 0.5,
//       color: rgb(0.86, 0.76, 0.74),
//     });
//     y -= rowHeight;
//   });
//   return y;
// }

// /** Simple 3x3 Loshu-style number grid (approximates the turtle illustration). */
// function drawLoshuGrid(page: PDFPage, fonts: Fonts, centerX: number, topY: number, cellSize = 46) {
//   const grid = [
//     [4, 9, 2],
//     [3, 5, 7],
//     [8, 1, 6],
//   ];
//   const gridWidth = cellSize * 3;
//   const startX = centerX - gridWidth / 2;
//   grid.forEach((row, r) => {
//     row.forEach((val, c) => {
//       const cx = startX + c * cellSize;
//       const cy = topY - r * cellSize;
//       page.drawRectangle({
//         x: cx,
//         y: cy - cellSize,
//         width: cellSize,
//         height: cellSize,
//         color: COLOR.blushPanel,
//         borderColor: COLOR.maroon,
//         borderWidth: 1,
//       });
//       const s = String(val);
//       page.drawText(s, {
//         x: cx + cellSize / 2 - fonts.sansBold.widthOfTextAtSize(s, 20) / 2,
//         y: cy - cellSize / 2 - 7,
//         size: 20,
//         font: fonts.sansBold,
//         color: COLOR.maroon,
//       });
//     });
//   });
// }

// function formatDate(iso: string): string {
//   const d = new Date(iso);
//   if (isNaN(d.getTime())) return iso;
//   return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
// }

// /* ------------------------------------------------------------------ */
// /*  Page builders                                                       */
// /* ------------------------------------------------------------------ */

// function drawCoverPage(page: PDFPage, fonts: Fonts, data: Required<NameCheckReportInput>, assets: Assets) {
//   drawPageBackground(page, assets);

//   const centerX = PAGE_WIDTH / 2;

//   // Logo (real wordmark image, replaces the old text-drawn brand name)
//   const logoDims = assets.logo.scale(0.42);
//   page.drawImage(assets.logo, {
//     x: centerX - logoDims.width / 2,
//     y: PAGE_HEIGHT - 70 - logoDims.height,
//     width: logoDims.width,
//     height: logoDims.height,
//   });

//   // Real turtle-grid illustration (static template graphic, matches client's cover exactly)
//   const gridDims = assets.loshuGrid.scale(0.62);
//   page.drawImage(assets.loshuGrid, {
//     x: centerX - gridDims.width / 2,
//     y: PAGE_HEIGHT - 300 - gridDims.height,
//     width: gridDims.width,
//     height: gridDims.height,
//   });

//   page.drawText("NAME CHECK", {
//     x: centerX - fonts.heading.widthOfTextAtSize("NAME CHECK", 30) / 2,
//     y: PAGE_HEIGHT - 480,
//     size: 30,
//     font: fonts.heading,
//     color: COLOR.maroon,
//   });
//   page.drawText("REPORT", {
//     x: centerX - fonts.heading.widthOfTextAtSize("REPORT", 30) / 2,
//     y: PAGE_HEIGHT - 518,
//     size: 30,
//     font: fonts.heading,
//     color: COLOR.maroon,
//   });

//   const nameStr = data.customerName.toUpperCase();
//   page.drawText(nameStr, {
//     x: centerX - fonts.heading.widthOfTextAtSize(nameStr, 18) / 2,
//     y: PAGE_HEIGHT - 565,
//     size: 18,
//     font: fonts.heading,
//     color: COLOR.maroonDark,
//   });
//   page.drawLine({
//     start: { x: centerX - 60, y: PAGE_HEIGHT - 558 },
//     end: { x: centerX + 60, y: PAGE_HEIGHT - 558 },
//     thickness: 1,
//     color: COLOR.maroon,
//   });

//   // Website pill at the bottom
//   const pill = `WWW.${data.brand.website.replace(/^www\./i, "").toUpperCase()}`;
//   const pillWidth = fonts.sansBold.widthOfTextAtSize(pill, 10) + 40;
//   page.drawRectangle({
//     x: centerX - pillWidth / 2,
//     y: 70,
//     width: pillWidth,
//     height: 26,
//     color: COLOR.maroon,
//   });
//   page.drawText(pill, {
//     x: centerX - fonts.sansBold.widthOfTextAtSize(pill, 10) / 2,
//     y: 79,
//     size: 10,
//     font: fonts.sansBold,
//     color: COLOR.white,
//   });
// }

// function drawIndexPage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
//   drawPageChrome(page, fonts, assets, { title: "Index", pageNumber, totalPages, brand: data.brand });

//   const rows: { no: string; title: string; items: string[] }[] = [
//     { no: "01", title: "Personal Information &\nIntroduction", items: ["Your Personal Profile", "Welcome Message"] },
//     {
//       no: "02",
//       title: "Understanding Name\nNumerology",
//       items: ["The Science of Name Numbers", "The Chaldean Number Chart", "What We'll Analyze"],
//     },
//     {
//       no: "03",
//       title: "Current Name\nBreakdown",
//       items: [
//         "Part 1: First Name Number",
//         "Part 2: Full Name Number",
//         "Part 3: Full Name Compound Number",
//       ],
//     },
//   ];

//   let y = PAGE_HEIGHT - 170;
//   const tableX = 44;
//   const tableWidth = PAGE_WIDTH - 88;
//   const numColW = 70;
//   const titleColW = 160;

//   rows.forEach((row) => {
//     const rowHeight = 22 + row.items.length * 16 + 16;
//     page.drawRectangle({
//       x: tableX,
//       y: y - rowHeight,
//       width: tableWidth,
//       height: rowHeight,
//       borderColor: COLOR.maroon,
//       borderWidth: 0.75,
//     });
//     page.drawLine({
//       start: { x: tableX + numColW, y },
//       end: { x: tableX + numColW, y: y - rowHeight },
//       thickness: 0.5,
//       color: COLOR.maroon,
//     });
//     page.drawLine({
//       start: { x: tableX + numColW + titleColW, y },
//       end: { x: tableX + numColW + titleColW, y: y - rowHeight },
//       thickness: 0.5,
//       color: COLOR.maroon,
//     });
//     page.drawText(row.no, {
//       x: tableX + numColW / 2 - fonts.sansBold.widthOfTextAtSize(row.no, 24) / 2,
//       y: y - rowHeight / 2 - 8,
//       size: 24,
//       font: fonts.sansBold,
//       color: COLOR.maroon,
//     });
//     let titleY = y - 24;
//     row.title.split("\n").forEach((line) => {
//       page.drawText(line, { x: tableX + numColW + 10, y: titleY, size: 9.5, font: fonts.sansBold, color: COLOR.maroonDark });
//       titleY -= 13;
//     });
//     let itemY = y - 24;
//     row.items.forEach((item) => {
//       page.drawText(`• ${item}`, {
//         x: tableX + numColW + titleColW + 10,
//         y: itemY,
//         size: 9.5,
//         font: fonts.sans,
//         color: COLOR.ink,
//       });
//       itemY -= 15;
//     });
//     y -= rowHeight;
//   });
// }

// function drawWelcomePage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
//   drawPageChrome(page, fonts, assets, { title: `"Namaskar ${data.firstName || data.customerName} Ji"`, pageNumber, totalPages, brand: data.brand });

//   let y = PAGE_HEIGHT - 150;
//   const message = `"This personalised Name Check Report has been prepared after careful analysis of your birth date and current name by celebrity Astro-Numerologist ${data.brand.numerologistName}. The name analysis is rooted in the approach of Chaldean Numerology and the Loshu Grid. The purpose of this report is to identify how the cosmic energies influencing your life align with your current name. Please approach these insights with faith, consistency and pure intention. May this guide illuminate your path towards prosperity, peace and spiritual growth."`;

//   y = drawWrappedText(page, message, {
//     x: 54,
//     y,
//     font: fonts.quote,
//     size: 12,
//     maxWidth: PAGE_WIDTH - 108,
//     lineHeight: 19,
//     color: COLOR.maroonDark,
//   });

//   y -= 60;
//   page.drawCircle({ x: PAGE_WIDTH / 2, y: y - 40, size: 48, color: COLOR.blushPanel, borderColor: COLOR.maroon, borderWidth: 1 });
//   const namasteText = "Namaste";
//   page.drawText(namasteText, {
//     x: PAGE_WIDTH / 2 - fonts.sansBold.widthOfTextAtSize(namasteText, 13) / 2,
//     y: y - 45,
//     size: 13,
//     font: fonts.sansBold,
//     color: COLOR.maroon,
//   });
// }

// function drawBlueprintPage(
//   page: PDFPage,
//   fonts: Fonts,
//   assets: Assets,
//   data: Required<NameCheckReportInput>,
//   numbers: { mulank: number; bhagyank: number; firstNameNumber: number; fullNameNumber: number; fullNameCompound: number },
//   pageNumber: number,
//   totalPages: number
// ) {
//   drawPageChrome(page, fonts, assets, { title: "Numerological Blueprint", pageNumber, totalPages, brand: data.brand });

//   drawMaroonBanner(page, fonts, "Personal Information", 44, PAGE_HEIGHT - 140, PAGE_WIDTH - 88);

//   const rows: [string, string][] = [
//     ["First Name (As per Aadhar Card)", data.firstName || "—"],
//     ["Middle Name (As per Aadhar Card)", data.middleName || "—"],
//     ["Last Name (As per Aadhar Card)", data.lastName || "—"],
//     ["Date of Birth", formatDate(data.dob)],
//     ["Gender", data.gender || "—"],
//     ["Mulank", String(numbers.mulank)],
//     ["Bhagyank", String(numbers.bhagyank)],
//     ["First Name Number", String(numbers.firstNameNumber)],
//     ["Full Name Number", String(numbers.fullNameNumber)],
//     ["Full Name Compound Number", String(numbers.fullNameCompound)],
//   ];

//   drawDataTable(page, fonts, rows, { x: 44, y: PAGE_HEIGHT - 150, width: PAGE_WIDTH - 88, rowHeight: 30 });
// }

// function drawScienceOfNamesPage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
//   drawPageChrome(page, fonts, assets, { title: "The Science of Name Numbers", pageNumber, totalPages, brand: data.brand });

//   let y = PAGE_HEIGHT - 140;
//   drawMaroonBanner(page, fonts, "What Is Name Numerology", 44, y, PAGE_WIDTH - 88);
//   y -= 46;
//   y = drawWrappedText(
//     page,
//     "Every letter in the alphabet carries a specific numeric vibration. When combined, the letters of a name create unique energy patterns that influence:",
//     { x: 54, y, font: fonts.sans, size: 11, maxWidth: PAGE_WIDTH - 108, lineHeight: 15, color: COLOR.ink }
//   );
//   y -= 8;
//   y = drawBulletList(
//     page,
//     [
//       "How others perceive you",
//       "Your natural talents and abilities",
//       "Career and financial opportunities",
//       "Relationship dynamics",
//       "Mental and emotional patterns",
//       "Life challenges and lessons",
//     ],
//     { x: 54, y, font: fonts.sans, size: 11, maxWidth: PAGE_WIDTH - 108, lineHeight: 15, gap: 4, color: COLOR.ink }
//   );

//   y -= 30;
//   drawMaroonBanner(page, fonts, "Why Your Name Matters", 44, y, PAGE_WIDTH - 88);
//   y -= 46;
//   drawWrappedText(
//     page,
//     "You hear and respond to your name thousands of times throughout life. Each utterance reinforces the vibrational pattern, making your name a constant affirmation — positive or negative — depending on its alignment with your destiny.",
//     { x: 54, y, font: fonts.sans, size: 11, maxWidth: PAGE_WIDTH - 108, lineHeight: 15, color: COLOR.ink }
//   );
// }

// function drawChaldeanSystemPage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
//   drawPageChrome(page, fonts, assets, { title: "Numerological Systems Used", pageNumber, totalPages, brand: data.brand });

//   let y = PAGE_HEIGHT - 140;
//   drawMaroonBanner(page, fonts, "Chaldean Numerology", 44, y, PAGE_WIDTH - 88);
//   y -= 46;
//   y = drawBulletList(
//     page,
//     [
//       "Ancient Babylonian system — considered the most accurate approach for name analysis.",
//       "Values run 1 to 8 (9 is considered sacred and is never assigned to a letter).",
//       "Focuses on the sound vibration and energy of each letter, rather than its position in the alphabet.",
//     ],
//     { x: 54, y, font: fonts.sans, size: 10.5, maxWidth: PAGE_WIDTH - 108, lineHeight: 14, gap: 6, color: COLOR.ink }
//   );

//   y -= 26;
//   drawMaroonBanner(page, fonts, "The Chaldean Number Chart", 44, y, PAGE_WIDTH - 88);
//   y -= 40;

//   const groups: [number, string][] = [
//     [1, "A I J Q Y"],
//     [2, "B K R"],
//     [3, "C G L S"],
//     [4, "D M T"],
//     [5, "E H N X"],
//     [6, "U V W"],
//     [7, "O Z"],
//     [8, "F P"],
//   ];
//   const colWidth = (PAGE_WIDTH - 88) / 4;
//   groups.forEach(([num, letters], i) => {
//     const col = i % 4;
//     const row = Math.floor(i / 4);
//     const cx = 44 + col * colWidth;
//     const cy = y - row * 90;
//     page.drawRectangle({
//       x: cx,
//       y: cy - 80,
//       width: colWidth - 8,
//       height: 80,
//       color: COLOR.blushPanel,
//       borderColor: COLOR.maroon,
//       borderWidth: 0.75,
//     });
//     const numStr = String(num);
//     page.drawText(numStr, {
//       x: cx + (colWidth - 8) / 2 - fonts.sansBold.widthOfTextAtSize(numStr, 22) / 2,
//       y: cy - 34,
//       size: 22,
//       font: fonts.sansBold,
//       color: COLOR.maroon,
//     });
//     page.drawText(letters, {
//       x: cx + (colWidth - 8) / 2 - fonts.sansBold.widthOfTextAtSize(letters, 9) / 2,
//       y: cy - 62,
//       size: 9,
//       font: fonts.sansBold,
//       color: COLOR.maroonDark,
//     });
//   });
// }

// function drawWhatWellAnalyzePage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
//   drawPageChrome(page, fonts, assets, { title: "What We'll Analyze", pageNumber, totalPages, brand: data.brand });

//   let y = PAGE_HEIGHT - 150;
//   const items = [
//     "First Name Number — your personal identity and self-expression.",
//     "Full Name Number — your complete destiny and life purpose.",
//     "Full Name Compound Number — hidden influences and karmic patterns.",
//     "Complete Date of Birth — its influence on your name number, via Mulank and Bhagyank.",
//   ];
//   drawBulletList(page, items, {
//     x: 54,
//     y,
//     font: fonts.sans,
//     size: 11.5,
//     maxWidth: PAGE_WIDTH - 108,
//     lineHeight: 16,
//     gap: 14,
//     color: COLOR.ink,
//   });
// }

// function drawCurrentNameBreakdownPage(
//   page: PDFPage,
//   fonts: Fonts,
//   assets: Assets,
//   data: Required<NameCheckReportInput>,
//   opts: {
//     heading: string;
//     nameLabel: string;
//     nameValue: string;
//     total: number;
//     reducedTo?: number;
//     bullets: string[];
//   },
//   pageNumber: number,
//   totalPages: number
// ) {
//   drawPageChrome(page, fonts, assets, { title: "Current Name Breakdown", subtitle: opts.heading, pageNumber, totalPages, brand: data.brand });

//   let y = PAGE_HEIGHT - 150;
//   const tableRows: [string, string][] = [[opts.nameLabel, opts.nameValue]];
//   drawDataTable(page, fonts, tableRows, { x: 44, y, width: PAGE_WIDTH - 88, rowHeight: 32 });
//   y -= 32;

//   const summaryRow = opts.reducedTo !== undefined
//     ? `Total: ${opts.total}     Reduced To: ${opts.reducedTo}`
//     : `Total: ${opts.total}`;
//   page.drawRectangle({ x: 44, y: y - 32, width: PAGE_WIDTH - 88, height: 32, color: COLOR.blushPanel, borderColor: rgb(0.86, 0.76, 0.74), borderWidth: 0.5 });
//   page.drawText(summaryRow, {
//     x: 44 + (PAGE_WIDTH - 88) / 2 - fonts.sansBold.widthOfTextAtSize(summaryRow, 12) / 2,
//     y: y - 20,
//     size: 12,
//     font: fonts.sansBold,
//     color: COLOR.maroonDark,
//   });
//   y -= 60;

//   drawMaroonBanner(page, fonts, "What This Represents", 44, y, PAGE_WIDTH - 88);
//   y -= 44;
//   drawBulletList(page, opts.bullets, {
//     x: 54,
//     y,
//     font: fonts.sans,
//     size: 10.5,
//     maxWidth: PAGE_WIDTH - 108,
//     lineHeight: 14.5,
//     gap: 12,
//     color: COLOR.ink,
//   });
// }

// const VERDICT_LABEL: Record<"HR" | "OA" | "NR", string> = {
//   HR: "Highly Recommended",
//   OA: "Optional / Advisable",
//   NR: "Not Required",
// };

// /**
//  * Renders the actual matched HR/OA/NR rule (from src/lib/name-check/rule-engine.ts
//  * + hr-oa-nr-blocks.ts) — replaces the old hardcoded "restricted number only" logic.
//  */
// function drawWhyCriticalPage(
//   page: PDFPage,
//   fonts: Fonts,
//   assets: Assets,
//   data: Required<NameCheckReportInput>,
//   matched: { ruleId: string; verdict: "HR" | "OA" | "NR"; isFallback: boolean },
//   pageNumber: number,
//   totalPages: number
// ) {
//   drawPageChrome(page, fonts, assets, { title: "Current Name Breakdown", subtitle: "Why This Is Critical", pageNumber, totalPages, brand: data.brand });

//   const rule = ALL_RULES.find((r) => r.id === matched.ruleId);
//   let y = PAGE_HEIGHT - 150;

//   drawMaroonBanner(page, fonts, "Why This Is Critical", 44, y, PAGE_WIDTH - 88);
//   y -= 44;

//   const bullets = rule?.paragraphs ?? [
//     "Name correction guidance could not be determined for this combination — please review this report manually before sending it to the customer.",
//   ];

//   y = drawBulletList(page, bullets, {
//     x: 54,
//     y,
//     font: fonts.sans,
//     size: 11,
//     maxWidth: PAGE_WIDTH - 108,
//     lineHeight: 15.5,
//     gap: 14,
//     color: COLOR.ink,
//   });

//   y -= 20;
//   const verdictLabel = `${VERDICT_LABEL[matched.verdict]}${matched.isFallback ? " (fallback — review recommended)" : ""}`;

//   const boxHeight = 60;
//   page.drawRectangle({ x: 44, y: y - boxHeight, width: PAGE_WIDTH - 88, height: boxHeight, color: COLOR.maroon });
//   page.drawText(verdictLabel, {
//     x: 44 + (PAGE_WIDTH - 88) / 2 - fonts.sansBold.widthOfTextAtSize(verdictLabel, 13) / 2,
//     y: y - boxHeight / 2 - 5,
//     size: 13,
//     font: fonts.sansBold,
//     color: COLOR.white,
//   });
// }

// function drawServicesPage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
//   drawPageChrome(page, fonts, assets, { title: "Services Offered", subtitle: "Illuminating Lives Through Ancient Wisdom", pageNumber, totalPages, brand: data.brand });

//   const services = [
//     "Complete Numerology Analysis",
//     "Name Correction Consultations",
//     "Lal Kitab Remedies",
//     "C-Section Baby Dates",
//     "Business Name Analysis",
//     "Child Naming Services",
//     "Mobile Numerology",
//     "Plot No. / Flat No. Analysis",
//     "Management Seating Direction",
//     "Lucky Jersey Number",
//     "Gemstone & Rudraksha Recommendations",
//   ];

//   drawBulletList(page, services, {
//     x: 60,
//     y: PAGE_HEIGHT - 150,
//     font: fonts.sans,
//     size: 11.5,
//     maxWidth: PAGE_WIDTH - 120,
//     lineHeight: 16,
//     gap: 12,
//     color: COLOR.ink,
//   });
// }

// function drawContactPage(page: PDFPage, fonts: Fonts, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
//   page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: COLOR.blush });
//   drawFrame(page);

//   const centerX = PAGE_WIDTH / 2;

//   page.drawText(data.brand.companyName.toUpperCase(), {
//     x: centerX - fonts.sansBold.widthOfTextAtSize(data.brand.companyName.toUpperCase(), 30) / 2,
//     y: PAGE_HEIGHT - 340,
//     size: 30,
//     font: fonts.sansBold,
//     color: COLOR.maroon,
//   });
//   page.drawText(data.brand.tagline.toUpperCase(), {
//     x: centerX - fonts.sansBold.widthOfTextAtSize(data.brand.tagline.toUpperCase(), 10) / 2,
//     y: PAGE_HEIGHT - 358,
//     size: 10,
//     font: fonts.sansBold,
//     color: COLOR.muted,
//   });

//   const contactLines = [data.brand.email, data.brand.phone, data.brand.website];
//   let ly = PAGE_HEIGHT - 420;
//   contactLines.forEach((line) => {
//     page.drawText(line, {
//       x: centerX - fonts.sans.widthOfTextAtSize(line, 11) / 2,
//       y: ly,
//       size: 11,
//       font: fonts.sans,
//       color: COLOR.maroonDark,
//     });
//     ly -= 18;
//   });

//   const pill = `WWW.${data.brand.website.replace(/^www\./i, "").toUpperCase()}`;
//   const pillWidth = fonts.sansBold.widthOfTextAtSize(pill, 10) + 40;
//   page.drawRectangle({ x: centerX - pillWidth / 2, y: 70, width: pillWidth, height: 26, color: COLOR.maroon });
//   page.drawText(pill, {
//     x: centerX - fonts.sansBold.widthOfTextAtSize(pill, 10) / 2,
//     y: 79,
//     size: 10,
//     font: fonts.sansBold,
//     color: COLOR.white,
//   });

//   page.drawText(`Report ID: ${data.reportId}`, {
//     x: centerX - fonts.sans.widthOfTextAtSize(`Report ID: ${data.reportId}`, 8) / 2,
//     y: 44,
//     size: 8,
//     font: fonts.sans,
//     color: COLOR.muted,
//   });
// }

// /* ------------------------------------------------------------------ */
// /*  "What This Represents" copy — now sourced verbatim from             */
// /*  src/lib/name-check/content-blocks.ts (client's exact wording),      */
// /*  looked up via FIRST_NAME_BLOCKS / FULL_NAME_BLOCKS / COMPOUND_BLOCKS*/
// /*  directly inside generateNameCheckReportPdf() below.                */
// /* ------------------------------------------------------------------ */

// /* ------------------------------------------------------------------ */
// /*  Main entry point                                                    */
// /* ------------------------------------------------------------------ */

// export async function generateNameCheckReportPdf(input: NameCheckReportInput): Promise<Uint8Array> {
//   const split = splitName(input.customerName);
//   const data: Required<NameCheckReportInput> = {
//     generatedDate: new Date().toISOString(),
//     firstName: split.first,
//     middleName: split.middle,
//     lastName: split.last,
//     ...input,
//     brand: { ...DEFAULT_BRAND, ...input.brand },
//   };

//   const dobDate = new Date(data.dob);
//   const fullName = `${data.firstName} ${data.lastName}`.trim();

//   const { facts, verdict, matchedRuleId, isFallback } = runNameCheck({
//     dob: { day: dobDate.getDate(), month: dobDate.getMonth() + 1, year: dobDate.getFullYear() },
//     firstName: data.firstName,
//     fullName,
//   });

//   if (isFallback) {
//     console.warn(
//       `Name Check PDF: rule engine hit FALLBACK for "${data.customerName}" (report ${data.reportId}) — ` +
//         `matched ${matchedRuleId} by default. Recommend manual review before sending to customer.`
//     );
//   }

//   const mulank = facts.mulank;
//   const bhagyank = facts.bhagyank;
//   const firstNameNumber = facts.firstNameNumber;
//   const firstNameSum = chaldeanRawSum(data.firstName); // raw total, for display on the breakdown page
//   const fullNameNumber = facts.fullNameNumber;
//   const fullNameSum = getFullNameCompoundNumber(fullName); // raw total, same as fullNameCompound below
//   const fullNameCompound = facts.fullNameCompoundNumber;

//   const compoundTier = facts.compoundTier; // "excellent" | "good" | "neutral" | "conditional" | "avoid"

//   const pdfDoc = await PDFDocument.create();
//   pdfDoc.setTitle(`Name Check Report - ${data.customerName}`);
//   pdfDoc.setSubject("Chaldean Numerology Name Check Report");
//   pdfDoc.setProducer(data.brand.companyName);
//   pdfDoc.setCreator(data.brand.companyName);

//   // Custom TTF embedding requires fontkit to be registered first.
//   pdfDoc.registerFontkit(fontkit);

//   // Fetch all design assets (images + fonts) from /public in parallel.
//   const [backgroundBytes, logoBytes, loshuGridBytes, starIconBytes, quicksandRegularBytes, quicksandBoldBytes, cinzelDecorativeBoldBytes, cardoRegularBytes] =
//     await Promise.all([
//       fetchAssetBytes(ASSET_PATHS.background),
//       fetchAssetBytes(ASSET_PATHS.logo),
//       fetchAssetBytes(ASSET_PATHS.loshuGrid),
//       fetchAssetBytes(ASSET_PATHS.starIcon),
//       fetchAssetBytes(ASSET_PATHS.fonts.quicksandRegular),
//       fetchAssetBytes(ASSET_PATHS.fonts.quicksandBold),
//       fetchAssetBytes(ASSET_PATHS.fonts.cinzelDecorativeBold),
//       fetchAssetBytes(ASSET_PATHS.fonts.cardoRegular),
//     ]);

//   const assets: Assets = {
//     background: await pdfDoc.embedPng(backgroundBytes),
//     logo: await pdfDoc.embedPng(logoBytes),
//     loshuGrid: await pdfDoc.embedPng(loshuGridBytes),
//     starIcon: await pdfDoc.embedPng(starIconBytes),
//   };

//   const fonts: Fonts = {
//     sans: await pdfDoc.embedFont(quicksandRegularBytes),
//     sansBold: await pdfDoc.embedFont(quicksandBoldBytes),
//     heading: await pdfDoc.embedFont(cinzelDecorativeBoldBytes),
//     quote: await pdfDoc.embedFont(cardoRegularBytes),
//   };

//   const TOTAL_PAGES = 12;
//   const addPage = () => pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

//   // 1. Cover
//   drawCoverPage(addPage(), fonts, data, assets);
//   // 2. Index
//   drawIndexPage(addPage(), fonts, assets, data, 2, TOTAL_PAGES);
//   // 3. Welcome message
//   drawWelcomePage(addPage(), fonts, assets, data, 3, TOTAL_PAGES);
//   // 4. Numerological Blueprint
//   drawBlueprintPage(addPage(), fonts, assets, data, { mulank, bhagyank, firstNameNumber, fullNameNumber, fullNameCompound }, 4, TOTAL_PAGES);
//   // 5. Science of Name Numbers
//   drawScienceOfNamesPage(addPage(), fonts, assets, data, 5, TOTAL_PAGES);
//   // 6. Chaldean System + Chart
//   drawChaldeanSystemPage(addPage(), fonts, assets, data, 6, TOTAL_PAGES);
//   // 7. What We'll Analyze
//   drawWhatWellAnalyzePage(addPage(), fonts, assets, data, 7, TOTAL_PAGES);
//   // 8. Current Name Breakdown — First Name Number
//   drawCurrentNameBreakdownPage(
//     addPage(),
//     fonts,
//     assets,
//     data,
//     {
//       heading: "First Name Number",
//       nameLabel: "First Name",
//       nameValue: data.firstName,
//       total: firstNameSum,
//       reducedTo: firstNameNumber,
//       bullets: FIRST_NAME_BLOCKS[comboKey(facts.firstNameToMulank, facts.firstNameToBhagyank)],
//     },
//     8,
//     TOTAL_PAGES
//   );
//   // 9. Current Name Breakdown — Full Name Number
//   drawCurrentNameBreakdownPage(
//     addPage(),
//     fonts,
//     assets,
//     data,
//     {
//       heading: "Full Name Number",
//       nameLabel: "First Name",
//       nameValue: fullName,
//       total: fullNameSum,
//       reducedTo: fullNameNumber,
//       bullets: FULL_NAME_BLOCKS[comboKey(facts.fullNameToMulank, facts.fullNameToBhagyank)],
//     },
//     9,
//     TOTAL_PAGES
//   );
//   // 10. Current Name Breakdown — Full Name Compound Number
//   drawCurrentNameBreakdownPage(
//     addPage(),
//     fonts,
//     assets,
//     data,
//     {
//       heading: "Full Name Compound Number",
//       nameLabel: "First Name",
//       nameValue: fullName,
//       total: fullNameCompound,
//       bullets: COMPOUND_BLOCKS[compoundTier],
//     },
//     10,
//     TOTAL_PAGES
//   );
//   // 11. Why This Is Critical — now shows the actual matched HR/OA/NR rule
//   drawWhyCriticalPage(addPage(), fonts, assets, data, { ruleId: matchedRuleId, verdict, isFallback }, 11, TOTAL_PAGES);
//   // 12. Services / Contact
//   drawServicesPage(addPage(), fonts, assets, data, 12, TOTAL_PAGES);

//   return pdfDoc.save();
// }

// /** Convenience helper for client-side "Download PDF" buttons. */
// export function downloadNameCheckReportPdf(bytes: Uint8Array, filename: string) {
//   const blob = new Blob([bytes], { type: "application/pdf" });
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement("a");
//   link.href = url;
//   link.download = filename;
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
//   URL.revokeObjectURL(url);
// }

// /** Convenience helper to get a Blob directly (e.g. for Supabase Storage upload). */
// export function nameCheckReportPdfToBlob(bytes: Uint8Array): Blob {
//   return new Blob([bytes], { type: "application/pdf" });
// }

// // Exported for reuse/testing elsewhere in the app (e.g. showing a live
// // preview of the computed numbers before the PDF is generated).
// // Core calculations now live in src/lib/name-check/* — re-exported here
// // only for convenience/backwards-compatibility with existing call sites.
// export { runNameCheck } from "@/lib/name-check/rule-engine";
// export { chaldeanRawSum, getFullNameCompoundNumber } from "@/lib/name-check/numerology";
// export const numerology = {
//   splitName,
//   NUMBER_KEYWORDS,
// };


/**
 * NameCheckReportGenerator.tsx
 * -----------------------------------------------------------------------
 * Ankshaastra-branded Name Check Report PDF generator.
 *
 * Pixel-matched to the client's reference PDF ("Bindhu Sree Reddy" /
 * "Himansshu Agarwal" sample): real extracted background/border artwork,
 * transparent logo + Loshu turtle-grid, Cinzel Decorative headings,
 * Quicksand body text, rounded maroon banners/panels, and all 15 pages
 * (cover → index → welcome → blueprint → science → systems → analyze →
 * breakdown x4 → why-critical → pricing → connect-with-me → services →
 * back cover).
 *
 * Built on pdf-lib + @pdf-lib/fontkit — runs in the browser (admin
 * "Generate PDF" action) or in a Supabase Edge Function / Node script.
 *
 * Install:
 *   npm install pdf-lib @pdf-lib/fontkit
 *
 * Usage (unchanged — same public API):
 *   import { generateNameCheckReportPdf, nameCheckReportPdfToBlob } from "@/components/NameCheckReportGenerator";
 *
 *   const bytes = await generateNameCheckReportPdf({
 *     reportId: report.report_id,
 *     customerName: report.customer_name,
 *     email: report.email,
 *     phone: report.phone,
 *     dob: report.dob,
 *     gender: report.gender,
 *     generatedDate: new Date().toISOString(),
 *   });
 * -----------------------------------------------------------------------
 */

import { PDFDocument, PDFPage, PDFFont, PDFImage, rgb, RGB } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { runNameCheck } from "@/lib/name-check/rule-engine";
import { chaldeanRawSum, getFullNameCompoundNumber } from "@/lib/name-check/numerology";
import { FIRST_NAME_BLOCKS, FULL_NAME_BLOCKS, COMPOUND_BLOCKS, comboKey } from "@/lib/name-check/content-blocks";
import { ALL_RULES } from "@/lib/name-check/hr-oa-nr-blocks";

// ---------------------------------------------------------------------
// Assets — Vite resolves these to build-time URLs (fetched + embedded
// into the PDF at generation time, see loadAssets() below).
// ---------------------------------------------------------------------
import pageBgUrl from "@/assets/name-check/page-bg.png";
import backCoverBgUrl from "@/assets/name-check/back-cover-bg.png";
import turtleGridUrl from "@/assets/name-check/turtle-grid.png";
import logoUrl from "@/assets/ankshaastra-logo-color-text-transparent-cropped.png";
import socialInstagramUrl from "@/assets/name-check/social-instagram.png";
import socialLinkedinUrl from "@/assets/name-check/social-linkedin.png";
import socialYoutubeUrl from "@/assets/name-check/social-youtube.png";
import socialFacebookUrl from "@/assets/name-check/social-facebook.png";

import cinzelBoldUrl from "@/assets/fonts/name-check/CinzelDecorative-Bold.ttf";
import cinzelRegularUrl from "@/assets/fonts/name-check/CinzelDecorative-Regular.ttf";
import quicksandRegularUrl from "@/assets/fonts/name-check/Quicksand-Regular.ttf";
import quicksandMediumUrl from "@/assets/fonts/name-check/Quicksand-Medium.ttf";
import quicksandSemiBoldUrl from "@/assets/fonts/name-check/Quicksand-SemiBold.ttf";
import quicksandBoldUrl from "@/assets/fonts/name-check/Quicksand-Bold.ttf";

/* ------------------------------------------------------------------ */
/*  Public data contract                                               */
/* ------------------------------------------------------------------ */

export interface NameCheckReportInput {
  reportId: string;
  customerName: string;
  email: string;
  phone: string;
  /** ISO date string, e.g. "2016-08-25" */
  dob: string;
  gender: string;
  /** ISO datetime string. Defaults to "now" if omitted. */
  generatedDate?: string;
  /** Optional explicit name-parts override (else auto-split from customerName). */
  firstName?: string;
  middleName?: string;
  lastName?: string;
  /** Optional branding overrides. */
  brand?: Partial<BrandConfig>;
}

interface BrandConfig {
  companyName: string;
  tagline: string;
  numerologistName: string;
  email: string;
  phone: string;
  website: string;
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  facebookUrl: string;
}

const DEFAULT_BRAND: BrandConfig = {
  companyName: "Ankshaastra",
  tagline: "Empower Your Name",
  numerologistName: "Himansshu Agarwal Ji",
  email: "support@ankshaastra.com",
  phone: "+91 98765 43210",
  website: "www.ankshaastra.com",
  instagramUrl: "https://instagram.com/ankshaastra",
  linkedinUrl: "https://linkedin.com/company/ankshaastra",
  youtubeUrl: "https://youtube.com/@ankshaastra",
  facebookUrl: "https://facebook.com/ankshaastra",
};

const NUMBER_KEYWORDS: Record<number, string> = {
  1: "leadership, independence and pioneering drive, governed by the Sun",
  2: "diplomacy, sensitivity and partnership, governed by the Moon",
  3: "creativity, expression and expansion, governed by Jupiter",
  4: "structure, discipline and steady building, governed by Rahu — a number many numerologists treat with caution",
  5: "adaptability, communication and quick change, governed by Mercury",
  6: "harmony, beauty and responsibility, governed by Venus",
  7: "introspection, spirituality and independence, governed by Ketu/Neptune",
  8: "ambition and material mastery, but governed by Saturn — whose restrictive energy consistently brings delays, burdens and slow progress",
  9: "compassion, courage and humanitarian drive, governed by Mars",
};

/* ------------------------------------------------------------------ */
/*  Layout constants — rose / maroon Ankshaastra palette                */
/* ------------------------------------------------------------------ */

const PAGE_WIDTH = 595.28; // A4 portrait, points
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 56;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

const COLOR = {
  blushPanel: rgb(0.973, 0.902, 0.898), // deeper rose panel fill (table rows)
  maroon: rgb(0.545, 0.161, 0.176), // primary brand maroon/red
  maroonDark: rgb(0.42, 0.11, 0.13),
  ink: rgb(0.32, 0.2, 0.2),
  muted: rgb(0.55, 0.42, 0.42),
  white: rgb(1, 1, 1),
  borderSoft: rgb(0.75, 0.45, 0.45),
};

interface Fonts {
  heading: PDFFont; // Cinzel Decorative Bold — big page/section titles
  headingRegular: PDFFont; // Cinzel Decorative Regular — used sparingly
  body: PDFFont; // Quicksand Regular — paragraph copy
  bodyMedium: PDFFont; // Quicksand Medium
  bodySemiBold: PDFFont; // Quicksand SemiBold — table labels
  bodyBold: PDFFont; // Quicksand Bold — banners, emphasis
}

interface Images {
  pageBg: PDFImage;
  backCoverBg: PDFImage;
  turtleGrid: PDFImage;
  logo: PDFImage;
  socialInstagram: PDFImage;
  socialLinkedin: PDFImage;
  socialYoutube: PDFImage;
  socialFacebook: PDFImage;
}

/* ------------------------------------------------------------------ */
/*  Asset loading                                                      */
/* ------------------------------------------------------------------ */

async function fetchBytes(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch asset: ${url} (${res.status})`);
  return res.arrayBuffer();
}

async function loadFonts(pdfDoc: PDFDocument): Promise<Fonts> {
  const [cinzelBold, cinzelRegular, qRegular, qMedium, qSemiBold, qBold] = await Promise.all([
    fetchBytes(cinzelBoldUrl),
    fetchBytes(cinzelRegularUrl),
    fetchBytes(quicksandRegularUrl),
    fetchBytes(quicksandMediumUrl),
    fetchBytes(quicksandSemiBoldUrl),
    fetchBytes(quicksandBoldUrl),
  ]);
  return {
    heading: await pdfDoc.embedFont(cinzelBold, { subset: true }),
    headingRegular: await pdfDoc.embedFont(cinzelRegular, { subset: true }),
    body: await pdfDoc.embedFont(qRegular, { subset: true }),
    bodyMedium: await pdfDoc.embedFont(qMedium, { subset: true }),
    bodySemiBold: await pdfDoc.embedFont(qSemiBold, { subset: true }),
    bodyBold: await pdfDoc.embedFont(qBold, { subset: true }),
  };
}

async function loadImages(pdfDoc: PDFDocument): Promise<Images> {
  const [pageBg, backCoverBg, turtleGrid, logo, socialInstagram, socialLinkedin, socialYoutube, socialFacebook] =
    await Promise.all([
      fetchBytes(pageBgUrl),
      fetchBytes(backCoverBgUrl),
      fetchBytes(turtleGridUrl),
      fetchBytes(logoUrl),
      fetchBytes(socialInstagramUrl),
      fetchBytes(socialLinkedinUrl),
      fetchBytes(socialYoutubeUrl),
      fetchBytes(socialFacebookUrl),
    ]);
  return {
    pageBg: await pdfDoc.embedPng(pageBg),
    backCoverBg: await pdfDoc.embedPng(backCoverBg),
    turtleGrid: await pdfDoc.embedPng(turtleGrid),
    logo: await pdfDoc.embedPng(logo),
    socialInstagram: await pdfDoc.embedPng(socialInstagram),
    socialLinkedin: await pdfDoc.embedPng(socialLinkedin),
    socialYoutube: await pdfDoc.embedPng(socialYoutube),
    socialFacebook: await pdfDoc.embedPng(socialFacebook),
  };
}

/* ------------------------------------------------------------------ */
/*  Low-level drawing helpers                                          */
/* ------------------------------------------------------------------ */

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const trial = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(trial, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = trial;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawWrappedText(
  page: PDFPage,
  text: string,
  opts: { x: number; y: number; font: PDFFont; size: number; maxWidth: number; lineHeight: number; color: RGB; align?: "left" | "center" }
): number {
  const lines = wrapText(text, opts.font, opts.size, opts.maxWidth);
  let cursorY = opts.y;
  for (const line of lines) {
    const x = opts.align === "center" ? opts.x + opts.maxWidth / 2 - opts.font.widthOfTextAtSize(line, opts.size) / 2 : opts.x;
    page.drawText(line, { x, y: cursorY, size: opts.size, font: opts.font, color: opts.color });
    cursorY -= opts.lineHeight;
  }
  return cursorY;
}

/** Bulleted list — small maroon dot + wrapped text, returns new Y. */
function drawBulletList(
  page: PDFPage,
  items: string[],
  opts: { x: number; y: number; font: PDFFont; size: number; maxWidth: number; lineHeight: number; gap: number; color: RGB }
): number {
  let y = opts.y;
  items.forEach((item) => {
    page.drawCircle({ x: opts.x + 2.5, y: y - opts.size * 0.35, size: 2.2, color: COLOR.maroon });
    y = drawWrappedText(page, item, {
      x: opts.x + 14,
      y,
      font: opts.font,
      size: opts.size,
      maxWidth: opts.maxWidth - 14,
      lineHeight: opts.lineHeight,
      color: opts.color,
    });
    y -= opts.gap;
  });
  return y;
}

/**
 * Rounded rectangle path for page.drawSvgPath().
 *
 * pdf-lib quirk: drawSvgPath() interprets the path's own coordinates as
 * standard SVG space (y increases DOWNWARD) relative to the anchor point
 * passed via options.x/options.y — NOT the page's normal bottom-left,
 * y-up space that every other pdf-lib draw method uses. So we always
 * anchor at the page's top-left corner (x:0, y:PAGE_HEIGHT) and convert
 * our usual bottom-left/y-up rect into "distance down from the top"
 * before building the path. This lets every other helper in this file
 * keep using normal PDF coordinates.
 */
function roundedRectPath(x: number, yBottom: number, width: number, height: number, r: number): string {
  const toSvgY = (yUp: number) => PAGE_HEIGHT - yUp;
  const top = toSvgY(yBottom + height);
  const bottom = toSvgY(yBottom);
  const right = x + width;
  const rr = Math.min(r, height / 2, width / 2);
  return [
    `M ${x + rr} ${top}`,
    `L ${right - rr} ${top}`,
    `A ${rr} ${rr} 0 0 1 ${right} ${top + rr}`,
    `L ${right} ${bottom - rr}`,
    `A ${rr} ${rr} 0 0 1 ${right - rr} ${bottom}`,
    `L ${x + rr} ${bottom}`,
    `A ${rr} ${rr} 0 0 1 ${x} ${bottom - rr}`,
    `L ${x} ${top + rr}`,
    `A ${rr} ${rr} 0 0 1 ${x + rr} ${top}`,
    "Z",
  ].join(" ");
}

function drawRoundedRect(
  page: PDFPage,
  opts: { x: number; y: number; width: number; height: number; radius: number; fill?: RGB; borderColor?: RGB; borderWidth?: number }
) {
  page.drawSvgPath(roundedRectPath(opts.x, opts.y, opts.width, opts.height, opts.radius), {
    x: 0,
    y: PAGE_HEIGHT,
    color: opts.fill,
    borderColor: opts.borderColor,
    borderWidth: opts.borderColor ? opts.borderWidth ?? 1 : undefined,
  });
}

/** Filled maroon pill/banner with centered white bold label — matches reference section headers. */
function drawBanner(page: PDFPage, fonts: Fonts, text: string, x: number, yTop: number, width: number, height = 32): number {
  const yBottom = yTop - height;
  drawRoundedRect(page, { x, y: yBottom, width, height, radius: height / 2, fill: COLOR.maroon });
  const label = text.toUpperCase();
  const size = 10.5;
  page.drawText(label, {
    x: x + width / 2 - fonts.bodyBold.widthOfTextAtSize(label, size) / 2,
    y: yBottom + height / 2 - size * 0.36,
    size,
    font: fonts.bodyBold,
    color: COLOR.white,
  });
  return yBottom;
}

/** Website pill button — filled maroon, centered, fixed size, used at page bottom / cover / back cover. */
function drawWebsitePill(page: PDFPage, fonts: Fonts, centerX: number, yBottom: number, website: string) {
  const text = `WWW.${website.replace(/^www\./i, "").toUpperCase()}`;
  const size = 10;
  const paddingX = 22;
  const height = 27;
  const width = fonts.bodyBold.widthOfTextAtSize(text, size) + paddingX * 2;
  drawRoundedRect(page, { x: centerX - width / 2, y: yBottom, width, height, radius: height / 2, fill: COLOR.maroon });
  page.drawText(text, {
    x: centerX - fonts.bodyBold.widthOfTextAtSize(text, size) / 2,
    y: yBottom + height / 2 - size * 0.36,
    size,
    font: fonts.bodyBold,
    color: COLOR.white,
  });
}

/** Two-column data table: rounded outer shape, label left (bold) / value right, divider rows. */
function drawDataTable(
  page: PDFPage,
  fonts: Fonts,
  rows: [string, string][],
  opts: { x: number; y: number; width: number; rowHeight?: number }
): number {
  const rowHeight = opts.rowHeight ?? 30;
  const totalHeight = rowHeight * rows.length;
  const yBottom = opts.y - totalHeight;

  // outer rounded frame
  drawRoundedRect(page, { x: opts.x, y: yBottom, width: opts.width, height: totalHeight, radius: 10, fill: COLOR.blushPanel });

  let y = opts.y;
  rows.forEach(([label, value], i) => {
    if (i > 0) {
      page.drawLine({
        start: { x: opts.x + 10, y },
        end: { x: opts.x + opts.width - 10, y },
        thickness: 0.5,
        color: COLOR.borderSoft,
      });
    }
    page.drawText(label, { x: opts.x + 16, y: y - rowHeight / 2 - 3.5, size: 10.5, font: fonts.bodyBold, color: COLOR.maroonDark });
    page.drawText(value || "—", {
      x: opts.x + opts.width / 2 + 4,
      y: y - rowHeight / 2 - 3.5,
      size: 11,
      font: fonts.body,
      color: COLOR.ink,
    });
    page.drawLine({
      start: { x: opts.x + opts.width / 2 - 6, y },
      end: { x: opts.x + opts.width / 2 - 6, y: y - rowHeight },
      thickness: 0.5,
      color: COLOR.borderSoft,
    });
    y -= rowHeight;
  });
  return yBottom;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/* ------------------------------------------------------------------ */
/*  Page chrome — background, logo, heading, footer                    */
/* ------------------------------------------------------------------ */

/**
 * Draws the shared page furniture (full-bleed background + border art,
 * small centered logo, page title in Cinzel Decorative, footer website
 * pill) and returns the Y coordinate where page-specific content should
 * start drawing — every page builder below is cursor-based from there,
 * so nothing can overlap the header the way the old fixed-offset layout
 * did.
 */
function drawPageChrome(
  page: PDFPage,
  fonts: Fonts,
  images: Images,
  opts: { title: string; subtitle?: string; pageNumber: number; totalPages: number; brand: BrandConfig }
): number {
  page.drawImage(images.pageBg, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });

  // logo, top-left-ish (matches reference: small logo box top of every inner page)
  const logoW = 108;
  const logoH = (images.logo.height / images.logo.width) * logoW;
  const logoTop = PAGE_HEIGHT - 46;
  page.drawImage(images.logo, { x: MARGIN_X, y: logoTop - logoH, width: logoW, height: logoH });

  let cursorY = logoTop - logoH - 34;

  // title (Cinzel Decorative Bold)
  const titleSize = 21;
  page.drawText(opts.title, { x: MARGIN_X, y: cursorY, size: titleSize, font: fonts.heading, color: COLOR.maroon });
  cursorY -= 10;
  page.drawLine({ start: { x: MARGIN_X, y: cursorY }, end: { x: MARGIN_X + 60, y: cursorY }, thickness: 1.5, color: COLOR.maroon });
  cursorY -= 20;

  if (opts.subtitle) {
    page.drawText(opts.subtitle, { x: MARGIN_X, y: cursorY, size: 10, font: fonts.bodyMedium, color: COLOR.muted });
    cursorY -= 22;
  }

  // footer
  page.drawLine({ start: { x: MARGIN_X, y: 46 }, end: { x: PAGE_WIDTH - MARGIN_X, y: 46 }, thickness: 0.75, color: COLOR.maroon });
  const footerText = `WWW.${opts.brand.website.replace(/^www\./i, "").toUpperCase()}`;
  page.drawText(footerText, { x: MARGIN_X, y: 32, size: 8, font: fonts.bodyBold, color: COLOR.muted });
  const pageStr = `Page ${opts.pageNumber} of ${opts.totalPages}`;
  page.drawText(pageStr, {
    x: PAGE_WIDTH - MARGIN_X - fonts.body.widthOfTextAtSize(pageStr, 8),
    y: 32,
    size: 8,
    font: fonts.body,
    color: COLOR.muted,
  });

  return cursorY;
}

/* ------------------------------------------------------------------ */
/*  Page builders                                                       */
/* ------------------------------------------------------------------ */

function drawCoverPage(page: PDFPage, fonts: Fonts, images: Images, data: Required<NameCheckReportInput>) {
  page.drawImage(images.pageBg, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });
  const centerX = PAGE_WIDTH / 2;

  // logo, top center
  const logoW = 190;
  const logoH = (images.logo.height / images.logo.width) * logoW;
  let cursorY = PAGE_HEIGHT - 76;
  page.drawImage(images.logo, { x: centerX - logoW / 2, y: cursorY - logoH, width: logoW, height: logoH });
  cursorY -= logoH + 46;

  // turtle / Loshu grid
  const turtleW = 232;
  const turtleH = (images.turtleGrid.height / images.turtleGrid.width) * turtleW;
  page.drawImage(images.turtleGrid, { x: centerX - turtleW / 2, y: cursorY - turtleH, width: turtleW, height: turtleH });
  cursorY -= turtleH + 54; // <- the gap that was missing before; guarantees no overlap with the heading

  // "NAME CHECK REPORT" — two-line Cinzel Decorative heading
  const headingSize = 30;
  ["NAME CHECK", "REPORT"].forEach((line) => {
    page.drawText(line, {
      x: centerX - fonts.heading.widthOfTextAtSize(line, headingSize) / 2,
      y: cursorY,
      size: headingSize,
      font: fonts.heading,
      color: COLOR.maroon,
    });
    cursorY -= headingSize + 12;
  });
  cursorY -= 20;

  // customer name
  const nameStr = data.customerName.toUpperCase();
  const nameSize = 19;
  page.drawText(nameStr, {
    x: centerX - fonts.heading.widthOfTextAtSize(nameStr, nameSize) / 2,
    y: cursorY,
    size: nameSize,
    font: fonts.heading,
    color: COLOR.maroonDark,
  });
  cursorY -= 14;
  page.drawLine({ start: { x: centerX - 60, y: cursorY }, end: { x: centerX + 60, y: cursorY }, thickness: 1, color: COLOR.maroon });

  // website pill, fixed near bottom (independent of the cursor above — always safe)
  drawWebsitePill(page, fonts, centerX, 68, data.brand.website);
}

function drawIndexPage(page: PDFPage, fonts: Fonts, images: Images, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
  page.drawImage(images.pageBg, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });
  const centerX = PAGE_WIDTH / 2;

  let cursorY = PAGE_HEIGHT - 90;
  const heading = "INDEX";
  page.drawText(heading, { x: centerX - fonts.heading.widthOfTextAtSize(heading, 26) / 2, y: cursorY, size: 26, font: fonts.heading, color: COLOR.maroon });
  cursorY -= 14;
  page.drawLine({ start: { x: centerX - 70, y: cursorY }, end: { x: centerX + 70, y: cursorY }, thickness: 1, color: COLOR.maroon });
  cursorY -= 50;

  const rows: { no: string; title: string; items: string[] }[] = [
    { no: "01", title: "Personal Information &\nIntroduction", items: ["Your Personal Profile", "Welcome Message"] },
    { no: "02", title: "Understanding Name\nNumerology", items: ["The Science of Name Numbers", "The Chaldean Number Chart", "What We'll Analyze"] },
    { no: "03", title: "Current Name\nBreakdown", items: ["Part 1: First Name Number", "Part 2: Full Name Number", "Part 3: Full Name Compound Number"] },
  ];

  const tableX = MARGIN_X;
  const tableWidth = CONTENT_WIDTH;
  const numColW = 74;
  const titleColW = 168;

  const totalTableHeight = rows.reduce((sum, r) => sum + (26 + r.items.length * 15 + 18), 0);
  drawRoundedRect(page, {
    x: tableX,
    y: cursorY - totalTableHeight,
    width: tableWidth,
    height: totalTableHeight,
    radius: 12,
    borderColor: COLOR.maroon,
    borderWidth: 1,
  });

  rows.forEach((row, idx) => {
    const rowHeight = 26 + row.items.length * 15 + 18;
    if (idx > 0) {
      page.drawLine({ start: { x: tableX, y: cursorY }, end: { x: tableX + tableWidth, y: cursorY }, thickness: 0.5, color: COLOR.maroon });
    }
    page.drawLine({ start: { x: tableX + numColW, y: cursorY }, end: { x: tableX + numColW, y: cursorY - rowHeight }, thickness: 0.5, color: COLOR.maroon });
    page.drawLine({
      start: { x: tableX + numColW + titleColW, y: cursorY },
      end: { x: tableX + numColW + titleColW, y: cursorY - rowHeight },
      thickness: 0.5,
      color: COLOR.maroon,
    });
    page.drawText(row.no, {
      x: tableX + numColW / 2 - fonts.heading.widthOfTextAtSize(row.no, 22) / 2,
      y: cursorY - rowHeight / 2 - 7,
      size: 22,
      font: fonts.heading,
      color: COLOR.maroon,
    });
    let titleY = cursorY - 22;
    row.title.split("\n").forEach((line) => {
      page.drawText(line, { x: tableX + numColW + 10, y: titleY, size: 9.5, font: fonts.bodyBold, color: COLOR.maroonDark });
      titleY -= 13;
    });
    let itemY = cursorY - 22;
    row.items.forEach((item) => {
      const lines = wrapText(`•  ${item}`, fonts.body, 9.5, tableWidth - numColW - titleColW - 20);
      lines.forEach((line) => {
        page.drawText(line, { x: tableX + numColW + titleColW + 10, y: itemY, size: 9.5, font: fonts.body, color: COLOR.ink });
        itemY -= 13.5;
      });
    });
    cursorY -= rowHeight;
  });

  drawWebsitePill(page, fonts, centerX, 68, data.brand.website);
  const pageStr = `Page ${pageNumber} of ${totalPages}`;
  page.drawText(pageStr, { x: PAGE_WIDTH - MARGIN_X - fonts.body.widthOfTextAtSize(pageStr, 8), y: 76, size: 8, font: fonts.body, color: COLOR.muted });
}

function drawWelcomePage(page: PDFPage, fonts: Fonts, images: Images, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
  let cursorY = drawPageChrome(page, fonts, images, {
    title: `"Namaskar ${data.firstName || data.customerName} Ji"`,
    pageNumber,
    totalPages,
    brand: data.brand,
  });
  cursorY -= 10;

  const message = `"This personalised Name Check Report has been prepared after careful analysis of your birth date and current name by celebrity Astro-Numerologist ${data.brand.numerologistName}. The name analysis is rooted in the approach of Chaldean Numerology and the Loshu Grid. The purpose of this report is to identify how the cosmic energies influencing your life align with your current name. Please approach these insights with faith, consistency and pure intention. May this guide illuminate your path towards prosperity, peace and spiritual growth."`;

  cursorY = drawWrappedText(page, message, {
    x: MARGIN_X,
    y: cursorY,
    font: fonts.body,
    size: 11.5,
    maxWidth: CONTENT_WIDTH,
    lineHeight: 18,
    color: COLOR.maroonDark,
  });

  cursorY -= 70;
  const circleR = 48;
  page.drawCircle({ x: PAGE_WIDTH / 2, y: cursorY - circleR, size: circleR, color: COLOR.blushPanel, borderColor: COLOR.maroon, borderWidth: 1 });
  const namasteText = "Namaste";
  page.drawText(namasteText, {
    x: PAGE_WIDTH / 2 - fonts.bodyBold.widthOfTextAtSize(namasteText, 12) / 2,
    y: cursorY - circleR - 4,
    size: 12,
    font: fonts.bodyBold,
    color: COLOR.maroon,
  });
}

function drawBlueprintPage(
  page: PDFPage,
  fonts: Fonts,
  images: Images,
  data: Required<NameCheckReportInput>,
  numbers: { mulank: number; bhagyank: number; firstNameNumber: number; fullNameNumber: number; fullNameCompound: number },
  pageNumber: number,
  totalPages: number
) {
  const cursorY = drawPageChrome(page, fonts, images, { title: "Numerological Blueprint", pageNumber, totalPages, brand: data.brand });

  const bannerBottom = drawBanner(page, fonts, "Personal Information", MARGIN_X, cursorY, CONTENT_WIDTH);

  const rows: [string, string][] = [
    ["First Name (As per Aadhar Card)", data.firstName || "—"],
    ["Middle Name (As per Aadhar Card)", data.middleName || "—"],
    ["Last Name (As per Aadhar Card)", data.lastName || "—"],
    ["Date of Birth", formatDate(data.dob)],
    ["Gender", data.gender || "—"],
    ["Mulank", String(numbers.mulank)],
    ["Bhagyank", String(numbers.bhagyank)],
    ["First Name Number", String(numbers.firstNameNumber)],
    ["Full Name Number", String(numbers.fullNameNumber)],
    ["Full Name Compound Number", String(numbers.fullNameCompound)],
  ];

  drawDataTable(page, fonts, rows, { x: MARGIN_X, y: bannerBottom - 14, width: CONTENT_WIDTH, rowHeight: 30 });
}

function drawScienceOfNamesPage(page: PDFPage, fonts: Fonts, images: Images, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
  let cursorY = drawPageChrome(page, fonts, images, { title: "The Science of Name Numbers", pageNumber, totalPages, brand: data.brand });

  cursorY = drawBanner(page, fonts, "What Is Name Numerology", MARGIN_X, cursorY, CONTENT_WIDTH) - 22;
  cursorY = drawWrappedText(
    page,
    "Every letter in the alphabet carries a specific numeric vibration. When combined, the letters of a name create unique energy patterns that influence:",
    { x: MARGIN_X + 10, y: cursorY, font: fonts.body, size: 10.5, maxWidth: CONTENT_WIDTH - 20, lineHeight: 15, color: COLOR.ink }
  );
  cursorY -= 6;
  cursorY = drawBulletList(
    page,
    ["How others perceive you", "Your natural talents and abilities", "Career and financial opportunities", "Relationship dynamics", "Mental and emotional patterns", "Life challenges and lessons"],
    { x: MARGIN_X + 10, y: cursorY, font: fonts.body, size: 10.5, maxWidth: CONTENT_WIDTH - 20, lineHeight: 14, gap: 4, color: COLOR.ink }
  );

  cursorY -= 26;
  cursorY = drawBanner(page, fonts, "Why Your Name Matters", MARGIN_X, cursorY, CONTENT_WIDTH) - 22;
  drawWrappedText(
    page,
    "You hear and respond to your name thousands of times throughout life. Each utterance reinforces the vibrational pattern, making your name a constant affirmation — positive or negative — depending on its alignment with your destiny.",
    { x: MARGIN_X + 10, y: cursorY, font: fonts.body, size: 10.5, maxWidth: CONTENT_WIDTH - 20, lineHeight: 15, color: COLOR.ink }
  );

  drawWebsitePill(page, fonts, PAGE_WIDTH / 2, 66, data.brand.website);
}

function drawChaldeanSystemPage(page: PDFPage, fonts: Fonts, images: Images, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
  let cursorY = drawPageChrome(page, fonts, images, { title: "Numerological Systems Used", pageNumber, totalPages, brand: data.brand });

  cursorY = drawBanner(page, fonts, "Chaldean Numerology", MARGIN_X, cursorY, CONTENT_WIDTH) - 22;
  cursorY = drawBulletList(
    page,
    [
      "Ancient Babylonian system — considered the most accurate approach for name analysis.",
      "Values run 1 to 8 (9 is considered sacred and is never assigned to a letter).",
      "Focuses on the sound vibration and energy of each letter, rather than its position in the alphabet.",
    ],
    { x: MARGIN_X + 10, y: cursorY, font: fonts.body, size: 10, maxWidth: CONTENT_WIDTH - 20, lineHeight: 13.5, gap: 6, color: COLOR.ink }
  );

  cursorY -= 22;
  cursorY = drawBanner(page, fonts, "The Chaldean Number Chart", MARGIN_X, cursorY, CONTENT_WIDTH) - 20;

  const groups: [number, string][] = [
    [1, "A I J Q Y"], [2, "B K R"], [3, "C G L S"], [4, "D M T"],
    [5, "E H N X"], [6, "U V W"], [7, "O Z"], [8, "F P"],
  ];
  const colWidth = (CONTENT_WIDTH - 24) / 4;
  const cellHeight = 74;
  groups.forEach(([num, letters], i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const cx = MARGIN_X + col * (colWidth + 8);
    const cyTop = cursorY - row * (cellHeight + 8);
    drawRoundedRect(page, { x: cx, y: cyTop - cellHeight, width: colWidth, height: cellHeight, radius: 8, fill: COLOR.blushPanel });
    const numStr = String(num);
    page.drawText(numStr, {
      x: cx + colWidth / 2 - fonts.heading.widthOfTextAtSize(numStr, 20) / 2,
      y: cyTop - 32,
      size: 20,
      font: fonts.heading,
      color: COLOR.maroon,
    });
    page.drawText(letters, {
      x: cx + colWidth / 2 - fonts.bodyBold.widthOfTextAtSize(letters, 8.5) / 2,
      y: cyTop - 58,
      size: 8.5,
      font: fonts.bodyBold,
      color: COLOR.maroonDark,
    });
  });

  drawWebsitePill(page, fonts, PAGE_WIDTH / 2, 66, data.brand.website);
}

function drawWhatWellAnalyzePage(page: PDFPage, fonts: Fonts, images: Images, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
  const cursorY = drawPageChrome(page, fonts, images, { title: "What We'll Analyze", pageNumber, totalPages, brand: data.brand });

  const items = [
    "First Name Number — your personal identity and self-expression.",
    "Full Name Number — your complete destiny and life purpose.",
    "Full Name Compound Number — hidden influences and karmic patterns.",
    "Complete Date of Birth — its influence on your name number, via Mulank and Bhagyank.",
  ];
  drawBulletList(page, items, { x: MARGIN_X, y: cursorY - 10, font: fonts.body, size: 11, maxWidth: CONTENT_WIDTH, lineHeight: 15.5, gap: 16, color: COLOR.ink });

  drawWebsitePill(page, fonts, PAGE_WIDTH / 2, 66, data.brand.website);
}

function drawCurrentNameBreakdownPage(
  page: PDFPage,
  fonts: Fonts,
  images: Images,
  data: Required<NameCheckReportInput>,
  opts: { heading: string; nameLabel: string; nameValue: string; total: number; reducedTo?: number; bullets: string[] },
  pageNumber: number,
  totalPages: number
) {
  let cursorY = drawPageChrome(page, fonts, images, { title: "Current Name Breakdown", subtitle: opts.heading, pageNumber, totalPages, brand: data.brand });

  const tableRows: [string, string][] = [[opts.nameLabel, opts.nameValue]];
  cursorY = drawDataTable(page, fonts, tableRows, { x: MARGIN_X, y: cursorY, width: CONTENT_WIDTH, rowHeight: 32 }) - 10;

  const summaryHeight = 32;
  const summaryText = opts.reducedTo !== undefined ? `Total: ${opts.total}     Reduced To: ${opts.reducedTo}` : `Total: ${opts.total}`;
  drawRoundedRect(page, { x: MARGIN_X, y: cursorY - summaryHeight, width: CONTENT_WIDTH, height: summaryHeight, radius: summaryHeight / 2, fill: COLOR.blushPanel });
  page.drawText(summaryText, {
    x: PAGE_WIDTH / 2 - fonts.bodyBold.widthOfTextAtSize(summaryText, 11.5) / 2,
    y: cursorY - summaryHeight / 2 - 4,
    size: 11.5,
    font: fonts.bodyBold,
    color: COLOR.maroonDark,
  });
  cursorY -= summaryHeight + 26;

  cursorY = drawBanner(page, fonts, "What This Represents", MARGIN_X, cursorY, CONTENT_WIDTH) - 22;
  drawBulletList(page, opts.bullets, { x: MARGIN_X + 10, y: cursorY, font: fonts.body, size: 10, maxWidth: CONTENT_WIDTH - 20, lineHeight: 14, gap: 12, color: COLOR.ink });

  drawWebsitePill(page, fonts, PAGE_WIDTH / 2, 66, data.brand.website);
}

const VERDICT_LABEL: Record<"HR" | "OA" | "NR", string> = {
  HR: "Highly Recommended",
  OA: "Optional / Advisable",
  NR: "Not Required",
};

function drawWhyCriticalPage(
  page: PDFPage,
  fonts: Fonts,
  images: Images,
  data: Required<NameCheckReportInput>,
  matched: { ruleId: string; verdict: "HR" | "OA" | "NR"; isFallback: boolean },
  pageNumber: number,
  totalPages: number
) {
  let cursorY = drawPageChrome(page, fonts, images, { title: "Current Name Breakdown", subtitle: "Why This Is Critical", pageNumber, totalPages, brand: data.brand });

  const rule = ALL_RULES.find((r) => r.id === matched.ruleId);
  cursorY = drawBanner(page, fonts, "Why This Is Critical", MARGIN_X, cursorY, CONTENT_WIDTH) - 22;

  const bullets = rule?.paragraphs ?? [
    "Name correction guidance could not be determined for this combination — please review this report manually before sending it to the customer.",
  ];

  cursorY = drawBulletList(page, bullets, { x: MARGIN_X + 10, y: cursorY, font: fonts.body, size: 10.5, maxWidth: CONTENT_WIDTH - 20, lineHeight: 15, gap: 14, color: COLOR.ink });

  cursorY -= 14;
  const verdictLabel = `${VERDICT_LABEL[matched.verdict]}${matched.isFallback ? " (fallback — review recommended)" : ""}`;
  const boxHeight = 56;
  drawRoundedRect(page, { x: MARGIN_X, y: cursorY - boxHeight, width: CONTENT_WIDTH, height: boxHeight, radius: 14, fill: COLOR.maroon });
  page.drawText(verdictLabel, {
    x: PAGE_WIDTH / 2 - fonts.bodyBold.widthOfTextAtSize(verdictLabel, 12.5) / 2,
    y: cursorY - boxHeight / 2 - 4,
    size: 12.5,
    font: fonts.bodyBold,
    color: COLOR.white,
  });

  drawWebsitePill(page, fonts, PAGE_WIDTH / 2, 66, data.brand.website);
}

/** Page 12 — pricing / cross-sell cards ("Your Name Decides Your Speed In Life"). */
function drawPricingPage(page: PDFPage, fonts: Fonts, images: Images, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
  page.drawImage(images.pageBg, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });
  const centerX = PAGE_WIDTH / 2;

  const logoW = 150;
  const logoH = (images.logo.height / images.logo.width) * logoW;
  let cursorY = PAGE_HEIGHT - 56;
  page.drawImage(images.logo, { x: centerX - logoW / 2, y: cursorY - logoH, width: logoW, height: logoH });
  cursorY -= logoH + 26;

  const line1 = "YOUR NAME DECIDES";
  const line2 = "YOUR SPEED IN LIFE";
  page.drawText(line1, { x: centerX - fonts.headingRegular.widthOfTextAtSize(line1, 14) / 2, y: cursorY, size: 14, font: fonts.headingRegular, color: COLOR.maroon });
  cursorY -= 20;
  page.drawText(line2, { x: centerX - fonts.heading.widthOfTextAtSize(line2, 20) / 2, y: cursorY, size: 20, font: fonts.heading, color: COLOR.maroon });
  cursorY -= 32;

  const cardTop = cursorY;
  const cardGap = 16;
  const cardWidth = (CONTENT_WIDTH - cardGap) / 2;
  const cardHeight = 400;

  type Card = { price: string; strike: string; off: string; title: string; features: string[]; blurb: string };
  const cards: Card[] = [
    {
      price: "\u20B92,987",
      strike: "\u20B97,500",
      off: "GET 60% OFF",
      title: "Name Correction Report",
      features: ["First Name & Full Name Analysis", "2 Corrected Name Spelling Options", "Compound Number Analysis", "First Alphabet Analysis"],
      blurb: "Comprehensive report with detailed name correction and analysis.",
    },
    {
      price: "\u20B93,437",
      strike: "\u20B97,500",
      off: "GET 54% OFF",
      title: "Perfect Baby Name Report",
      features: ["10+ Numerologically Aligned Names", "Mulank, Bhagyank & Rajyog Analysis", "First, Full & Compound Number Analysis", "45+ Page Report & Call Consultation Included"],
      blurb: "Get 10+ Numerologically Aligned Names for your child.",
    },
  ];

  cards.forEach((card, idx) => {
    const cardX = MARGIN_X + idx * (cardWidth + cardGap);
    drawRoundedRect(page, { x: cardX, y: cardTop - cardHeight, width: cardWidth, height: cardHeight, radius: 16, borderColor: COLOR.maroon, borderWidth: 1 });

    let cy = cardTop - 34;
    const priceSize = 17;
    const pillW = fonts.bodyBold.widthOfTextAtSize(card.price, priceSize) + 44;
    const pillH = 34;
    drawRoundedRect(page, { x: cardX + cardWidth / 2 - pillW / 2, y: cy - pillH / 2, width: pillW, height: pillH, radius: pillH / 2, fill: COLOR.maroon });
    page.drawText(card.price, {
      x: cardX + cardWidth / 2 - fonts.bodyBold.widthOfTextAtSize(card.price, priceSize) / 2,
      y: cy - pillH / 2 + pillH / 2 - priceSize * 0.36,
      size: priceSize,
      font: fonts.bodyBold,
      color: COLOR.white,
    });
    cy -= pillH / 2 + 24;

    const strikeText = card.strike;
    page.drawText(strikeText, {
      x: cardX + cardWidth / 2 - fonts.body.widthOfTextAtSize(strikeText, 9) / 2,
      y: cy,
      size: 9,
      font: fonts.body,
      color: COLOR.muted,
    });
    page.drawLine({
      start: { x: cardX + cardWidth / 2 - fonts.body.widthOfTextAtSize(strikeText, 9) / 2 - 2, y: cy + 3 },
      end: { x: cardX + cardWidth / 2 + fonts.body.widthOfTextAtSize(strikeText, 9) / 2 + 2, y: cy + 3 },
      thickness: 0.6,
      color: COLOR.muted,
    });
    cy -= 20;

    page.drawText(card.off, { x: cardX + cardWidth / 2 - fonts.bodyBold.widthOfTextAtSize(card.off, 11) / 2, y: cy, size: 11, font: fonts.bodyBold, color: COLOR.maroon });
    cy -= 22;

    page.drawText(card.title, { x: cardX + cardWidth / 2 - fonts.headingRegular.widthOfTextAtSize(card.title, 12) / 2, y: cy, size: 12, font: fonts.headingRegular, color: COLOR.maroonDark });
    cy -= 24;

    card.features.forEach((feat) => {
      const circleR = 13;
      page.drawCircle({ x: cardX + 28, y: cy - 3, size: circleR, color: COLOR.maroon });
      const lines = wrapText(feat, fonts.body, 8.5, cardWidth - 70);
      let fy = cy + (lines.length - 1) * 5;
      lines.forEach((line) => {
        page.drawText(line, { x: cardX + 50, y: fy, size: 8.5, font: fonts.body, color: COLOR.ink });
        fy -= 11;
      });
      cy -= Math.max(30, lines.length * 11 + 14);
    });

    cy -= 6;
    page.drawLine({ start: { x: cardX + 20, y: cy }, end: { x: cardX + cardWidth - 20, y: cy }, thickness: 0.5, color: COLOR.borderSoft });
    cy -= 16;
    const blurbLines = wrapText(card.blurb, fonts.body, 8.5, cardWidth - 36);
    blurbLines.forEach((line) => {
      page.drawText(line, {
        x: cardX + cardWidth / 2 - fonts.body.widthOfTextAtSize(line, 8.5) / 2,
        y: cy,
        size: 8.5,
        font: fonts.body,
        color: COLOR.muted,
      });
      cy -= 11;
    });

    const btnH = 34;
    const btnY = cardTop - cardHeight + 18;
    drawRoundedRect(page, { x: cardX + 16, y: btnY, width: cardWidth - 32, height: btnH, radius: btnH / 2, fill: COLOR.maroon });
    const btnText = "CLICK NOW";
    page.drawText(btnText, {
      x: cardX + cardWidth / 2 - fonts.bodyBold.widthOfTextAtSize(btnText, 10.5) / 2,
      y: btnY + btnH / 2 - 3.5,
      size: 10.5,
      font: fonts.bodyBold,
      color: COLOR.white,
    });
  });

  drawWebsitePill(page, fonts, centerX, 44, data.brand.website);
}

/** Page 13 — social "Connect With Me" page. */
function drawConnectPage(page: PDFPage, fonts: Fonts, images: Images, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
  page.drawImage(images.pageBg, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });
  const centerX = PAGE_WIDTH / 2;

  let cursorY = PAGE_HEIGHT - 100;
  const heading = "CONNECT WITH ME";
  page.drawText(heading, { x: centerX - fonts.heading.widthOfTextAtSize(heading, 22) / 2, y: cursorY, size: 22, font: fonts.heading, color: COLOR.maroon });
  cursorY -= 14;
  page.drawLine({ start: { x: centerX - 70, y: cursorY }, end: { x: centerX + 70, y: cursorY }, thickness: 1, color: COLOR.maroon });
  cursorY -= 44;

  const subtitle = "FOLLOW FOR DAILY WISDOM, TIPS, AND INSPIRATION";
  page.drawText(subtitle, { x: MARGIN_X, y: cursorY, size: 10, font: fonts.bodyBold, color: COLOR.maroon });
  cursorY -= 56;

  const socials: { image: PDFImage; url: string }[] = [
    { image: images.socialInstagram, url: data.brand.instagramUrl },
    { image: images.socialLinkedin, url: data.brand.linkedinUrl },
    { image: images.socialYoutube, url: data.brand.youtubeUrl },
    { image: images.socialFacebook, url: data.brand.facebookUrl },
  ];

  const colW = CONTENT_WIDTH / 2;
  const circleR = 34;
  const rowGap = 130;

  socials.forEach((social, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = MARGIN_X + colW * col + colW / 2 - 30;
    const cy = cursorY - row * rowGap;

    page.drawCircle({ x: cx, y: cy, size: circleR, borderColor: COLOR.maroon, borderWidth: 1.5 });
    const iconW = 30;
    const iconH = (social.image.height / social.image.width) * iconW;
    page.drawImage(social.image, { x: cx - iconW / 2, y: cy - iconH / 2, width: iconW, height: iconH });

    const btnW = 108;
    const btnH = 26;
    const btnY = cy - circleR - 20 - btnH;
    drawRoundedRect(page, { x: cx - btnW / 2, y: btnY, width: btnW, height: btnH, radius: btnH / 2, borderColor: COLOR.maroon, borderWidth: 1.2 });
    const btnText = "CLICK ME";
    page.drawText(btnText, {
      x: cx - fonts.bodyBold.widthOfTextAtSize(btnText, 9) / 2,
      y: btnY + btnH / 2 - 3,
      size: 9,
      font: fonts.bodyBold,
      color: COLOR.maroon,
    });
    page.drawLine({
      start: { x: cx - fonts.bodyBold.widthOfTextAtSize(btnText, 9) / 2, y: btnY + btnH / 2 - 5.5 },
      end: { x: cx + fonts.bodyBold.widthOfTextAtSize(btnText, 9) / 2, y: btnY + btnH / 2 - 5.5 },
      thickness: 0.5,
      color: COLOR.maroon,
    });
  });

  const bottomY = cursorY - rowGap - 40;
  const closing1 = "STAY CONNECTED FOR";
  const closing2 = "ONGOING GUIDANCE & SUPPORT";
  page.drawText(closing1, { x: centerX - fonts.bodyBold.widthOfTextAtSize(closing1, 12) / 2, y: bottomY, size: 12, font: fonts.bodyBold, color: COLOR.maroon });
  page.drawText(closing2, { x: centerX - fonts.bodyBold.widthOfTextAtSize(closing2, 12) / 2, y: bottomY - 18, size: 12, font: fonts.bodyBold, color: COLOR.maroon });

  drawWebsitePill(page, fonts, centerX, 66, data.brand.website);
  const pageStr = `Page ${pageNumber} of ${totalPages}`;
  page.drawText(pageStr, { x: PAGE_WIDTH - MARGIN_X - fonts.body.widthOfTextAtSize(pageStr, 8), y: 76, size: 8, font: fonts.body, color: COLOR.muted });
}

function drawServicesPage(page: PDFPage, fonts: Fonts, images: Images, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
  const cursorY = drawPageChrome(page, fonts, images, { title: "Services Offered", subtitle: "Illuminating Lives Through Ancient Wisdom", pageNumber, totalPages, brand: data.brand });

  const services = [
    "Complete Numerology Analysis",
    "Name Correction Consultations",
    "Lal Kitab Remedies",
    "C-Section Baby Dates",
    "Business Name Analysis",
    "Child Naming Services",
    "Mobile Numerology",
    "Plot No. / Flat No. Analysis",
    "Management Seating Direction",
    "Lucky Jersey Number",
    "Gemstone & Rudraksha Recommendations",
  ];

  let y = cursorY - 6;
  services.forEach((service) => {
    page.drawCircle({ x: MARGIN_X + 10, y: y - 4, size: 9, borderColor: COLOR.maroon, borderWidth: 1 });
    page.drawText(service, { x: MARGIN_X + 30, y: y - 7, size: 11, font: fonts.body, color: COLOR.ink });
    y -= 34;
  });

  drawWebsitePill(page, fonts, PAGE_WIDTH / 2, 66, data.brand.website);
}

/** Page 15 — decorative back cover (logo centered on the ornamental artwork). */
function drawBackCoverPage(page: PDFPage, fonts: Fonts, images: Images, data: Required<NameCheckReportInput>) {
  page.drawImage(images.backCoverBg, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });
  const centerX = PAGE_WIDTH / 2;

  const logoW = 260;
  const logoH = (images.logo.height / images.logo.width) * logoW;
  page.drawImage(images.logo, { x: centerX - logoW / 2, y: PAGE_HEIGHT - 460 - logoH, width: logoW, height: logoH });

  drawWebsitePill(page, fonts, centerX, 56, data.brand.website);
}

/* ------------------------------------------------------------------ */
/*  Main entry point                                                    */
/* ------------------------------------------------------------------ */

/** Splits a full name into first / middle / last, best-effort. */
function splitName(fullName: string): { first: string; middle: string; last: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "", middle: "", last: "" };
  if (parts.length === 1) return { first: parts[0], middle: "", last: "" };
  if (parts.length === 2) return { first: parts[0], middle: "", last: parts[1] };
  return { first: parts[0], middle: parts.slice(1, -1).join(" "), last: parts[parts.length - 1] };
}

export async function generateNameCheckReportPdf(input: NameCheckReportInput): Promise<Uint8Array> {
  const split = splitName(input.customerName);
  const data: Required<NameCheckReportInput> = {
    generatedDate: new Date().toISOString(),
    firstName: split.first,
    middleName: split.middle,
    lastName: split.last,
    ...input,
    brand: { ...DEFAULT_BRAND, ...input.brand },
  };

  const dobDate = new Date(data.dob);
  const fullName = `${data.firstName} ${data.lastName}`.trim();

  const { facts, verdict, matchedRuleId, isFallback } = runNameCheck({
    dob: { day: dobDate.getDate(), month: dobDate.getMonth() + 1, year: dobDate.getFullYear() },
    firstName: data.firstName,
    fullName,
  });

  if (isFallback) {
    console.warn(
      `Name Check PDF: rule engine hit FALLBACK for "${data.customerName}" (report ${data.reportId}) — ` +
        `matched ${matchedRuleId} by default. Recommend manual review before sending to customer.`
    );
  }

  const mulank = facts.mulank;
  const bhagyank = facts.bhagyank;
  const firstNameNumber = facts.firstNameNumber;
  const firstNameSum = chaldeanRawSum(data.firstName);
  const fullNameNumber = facts.fullNameNumber;
  const fullNameSum = getFullNameCompoundNumber(fullName);
  const fullNameCompound = facts.fullNameCompoundNumber;
  const compoundTier = facts.compoundTier;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  pdfDoc.setTitle(`Name Check Report - ${data.customerName}`);
  pdfDoc.setSubject("Chaldean Numerology Name Check Report");
  pdfDoc.setProducer(data.brand.companyName);
  pdfDoc.setCreator(data.brand.companyName);

  const [fonts, images] = await Promise.all([loadFonts(pdfDoc), loadImages(pdfDoc)]);

  const TOTAL_PAGES = 15;
  const addPage = () => pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

  drawCoverPage(addPage(), fonts, images, data); // 1
  drawIndexPage(addPage(), fonts, images, data, 2, TOTAL_PAGES); // 2
  drawWelcomePage(addPage(), fonts, images, data, 3, TOTAL_PAGES); // 3
  drawBlueprintPage(addPage(), fonts, images, data, { mulank, bhagyank, firstNameNumber, fullNameNumber, fullNameCompound }, 4, TOTAL_PAGES); // 4
  drawScienceOfNamesPage(addPage(), fonts, images, data, 5, TOTAL_PAGES); // 5
  drawChaldeanSystemPage(addPage(), fonts, images, data, 6, TOTAL_PAGES); // 6
  drawWhatWellAnalyzePage(addPage(), fonts, images, data, 7, TOTAL_PAGES); // 7
  drawCurrentNameBreakdownPage(
    addPage(), fonts, images, data,
    { heading: "First Name Number", nameLabel: "First Name", nameValue: data.firstName, total: firstNameSum, reducedTo: firstNameNumber, bullets: FIRST_NAME_BLOCKS[comboKey(facts.firstNameToMulank, facts.firstNameToBhagyank)] },
    8, TOTAL_PAGES
  ); // 8
  drawCurrentNameBreakdownPage(
    addPage(), fonts, images, data,
    { heading: "Full Name Number", nameLabel: "Full Name", nameValue: fullName, total: fullNameSum, reducedTo: fullNameNumber, bullets: FULL_NAME_BLOCKS[comboKey(facts.fullNameToMulank, facts.fullNameToBhagyank)] },
    9, TOTAL_PAGES
  ); // 9
  drawCurrentNameBreakdownPage(
    addPage(), fonts, images, data,
    { heading: "Full Name Compound Number", nameLabel: "Full Name", nameValue: fullName, total: fullNameCompound, bullets: COMPOUND_BLOCKS[compoundTier] },
    10, TOTAL_PAGES
  ); // 10
  drawWhyCriticalPage(addPage(), fonts, images, data, { ruleId: matchedRuleId, verdict, isFallback }, 11, TOTAL_PAGES); // 11
  drawPricingPage(addPage(), fonts, images, data, 12, TOTAL_PAGES); // 12
  drawConnectPage(addPage(), fonts, images, data, 13, TOTAL_PAGES); // 13
  drawServicesPage(addPage(), fonts, images, data, 14, TOTAL_PAGES); // 14
  drawBackCoverPage(addPage(), fonts, images, data); // 15

  return pdfDoc.save();
}

/** Convenience helper for client-side "Download PDF" buttons. */
export function downloadNameCheckReportPdf(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Convenience helper to get a Blob directly (e.g. for Supabase Storage upload). */
export function nameCheckReportPdfToBlob(bytes: Uint8Array): Blob {
  return new Blob([bytes], { type: "application/pdf" });
}

export { runNameCheck } from "@/lib/name-check/rule-engine";
export { chaldeanRawSum, getFullNameCompoundNumber } from "@/lib/name-check/numerology";
export const numerology = {
  splitName,
  NUMBER_KEYWORDS,
};
