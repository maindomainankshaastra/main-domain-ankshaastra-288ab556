/**
 * NameCheckReportGenerator.tsx
 * -----------------------------------------------------------------------
 * Ankshaastra-branded Name Check Report PDF generator.
 *
 * Rebuilt to match the client-supplied "Ankshaastra — Empower Your Name"
 * template: Chaldean Numerology (not Pythagorean), Mulank / Bhagyank /
 * First Name Number / Full Name Number / Full Name Compound Number, and
 * the same page-by-page structure and rose/maroon branding as the
 * reference PDF. Built on pdf-lib only — runs in the browser (admin
 * "Generate PDF" action) or in a Supabase Edge Function / Node script.
 *
 * Install:
 *   npm install pdf-lib
 *
 * Usage (unchanged from before — same public API):
 *   import { generateNameCheckReportPdf, nameCheckReportPdfToBlob } from "@/components/NameCheckReportGenerator";
 *
 *   const bytes = await generateNameCheckReportPdf({
 *     reportId: report.report_id,
 *     customerName: report.customer_name,   // "Vivaan Amey Madye" — auto split into first/middle/last
 *     email: report.email,
 *     phone: report.phone,
 *     dob: report.dob,
 *     gender: report.gender,
 *     generatedDate: new Date().toISOString(),
 *   });
 * -----------------------------------------------------------------------
 */

import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb, RGB } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { runNameCheck } from "@/lib/name-check/rule-engine";
import { chaldeanRawSum, getFullNameCompoundNumber } from "@/lib/name-check/numerology";
import { FIRST_NAME_BLOCKS, FULL_NAME_BLOCKS, COMPOUND_BLOCKS, comboKey } from "@/lib/name-check/content-blocks";
import { ALL_RULES } from "@/lib/name-check/hr-oa-nr-blocks";

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
}

const DEFAULT_BRAND: BrandConfig = {
  companyName: "Ankshaastra",
  tagline: "Empower Your Name",
  numerologistName: "Himansshu Agarwal Ji",
  email: "support@ankshaastra.com",
  phone: "+91 98765 43210",
  website: "www.ankshaastra.com",
};

/* ------------------------------------------------------------------ */
/*  Numerology engine — now lives in src/lib/name-check/*              */
/*  (friendship-table.ts, compound-table.ts, lo-shu.ts, numerology.ts, */
/*  rule-engine.ts). Only name-splitting stays local to this file.     */
/* ------------------------------------------------------------------ */

/** Splits a full name into first / middle / last, best-effort. */
function splitName(fullName: string): { first: string; middle: string; last: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "", middle: "", last: "" };
  if (parts.length === 1) return { first: parts[0], middle: "", last: "" };
  if (parts.length === 2) return { first: parts[0], middle: "", last: parts[1] };
  return { first: parts[0], middle: parts.slice(1, -1).join(" "), last: parts[parts.length - 1] };
}

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

const COLOR = {
  blush: rgb(0.976, 0.933, 0.925), // pale rose page background
  blushPanel: rgb(0.965, 0.902, 0.89), // slightly deeper rose panel fill
  maroon: rgb(0.545, 0.161, 0.176), // primary brand maroon/red
  maroonDark: rgb(0.42, 0.11, 0.13),
  ink: rgb(0.2, 0.13, 0.13),
  muted: rgb(0.5, 0.4, 0.4),
  white: rgb(1, 1, 1),
  cream: rgb(0.99, 0.97, 0.95),
  green: rgb(0.15, 0.45, 0.2),
  red: rgb(0.6, 0.15, 0.15),
};

interface Fonts {
  sans: PDFFont; // Quicksand Regular — all body text, labels, bullets
  sansBold: PDFFont; // Quicksand Bold — bold labels, table headers, banners
  heading: PDFFont; // Cinzel Decorative Bold — big decorative section/report titles
  quote: PDFFont; // Cardo Regular — italic-style welcome message quote only
}

/**
 * Design assets extracted from the client's reference PDF (Bindhu Sree Reddy
 * sample). Must be uploaded to the project's /public folder at these exact
 * paths — see design-assets/ handoff for the source files.
 */
const ASSET_PATHS = {
  background: "/name-check-assets/background-border.png",
  logo: "/name-check-assets/logo-ankshaastra.png",
  loshuGrid: "/name-check-assets/loshu-turtle-grid.png",
  starIcon: "/name-check-assets/star-icon.png",
  fonts: {
    quicksandRegular: "/name-check-assets/fonts/Quicksand-Regular.ttf",
    quicksandBold: "/name-check-assets/fonts/Quicksand-Bold.ttf",
    cinzelDecorativeBold: "/name-check-assets/fonts/CinzelDecorative-Bold.ttf",
    cardoRegular: "/name-check-assets/fonts/Cardo-Regular.ttf",
    // NotoSans-Regular.ttf is fetched too but currently unused directly —
    // reserved as a fallback for any glyph Quicksand/Cardo don't cover.
  },
};

/** Fetches a static asset from /public and returns its raw bytes. */
async function fetchAssetBytes(path: string): Promise<Uint8Array> {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Name Check PDF: failed to fetch design asset "${path}" (${res.status}). Check it was uploaded to /public${path}.`);
  }
  return new Uint8Array(await res.arrayBuffer());
}

/* ------------------------------------------------------------------ */
/*  Drawing helpers                                                    */
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
  opts: { x: number; y: number; font: PDFFont; size: number; maxWidth: number; lineHeight: number; color: RGB }
): number {
  const lines = wrapText(text, opts.font, opts.size, opts.maxWidth);
  let cursorY = opts.y;
  for (const line of lines) {
    page.drawText(line, { x: opts.x, y: cursorY, size: opts.size, font: opts.font, color: opts.color });
    cursorY -= opts.lineHeight;
  }
  return cursorY;
}

/** Bulleted list helper — small maroon dot + wrapped text, returns new Y. */
function drawBulletList(
  page: PDFPage,
  items: string[],
  opts: { x: number; y: number; font: PDFFont; size: number; maxWidth: number; lineHeight: number; gap: number; color: RGB }
): number {
  let y = opts.y;
  items.forEach((item) => {
    page.drawCircle({ x: opts.x + 3, y: y - 4, size: 2.4, color: COLOR.maroon });
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

interface Assets {
  background: import("pdf-lib").PDFImage;
  logo: import("pdf-lib").PDFImage;
  loshuGrid: import("pdf-lib").PDFImage;
  starIcon: import("pdf-lib").PDFImage;
}

/** Draws the real background/border image full-bleed — replaces the old flat COLOR.blush + drawFrame(). */
function drawPageBackground(page: PDFPage, assets: Assets) {
  page.drawImage(assets.background, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });
}

function drawFrame(page: PDFPage) {
  const inset = 16;
  page.drawRectangle({
    x: inset,
    y: inset,
    width: PAGE_WIDTH - inset * 2,
    height: PAGE_HEIGHT - inset * 2,
    borderColor: COLOR.maroon,
    borderWidth: 1,
  });
}

/** Rounded-ish pill/banner used for section headers throughout the template. */
function drawMaroonBanner(page: PDFPage, fonts: Fonts, text: string, x: number, y: number, width: number, height = 30) {
  page.drawRectangle({ x, y: y - height, width, height, color: COLOR.maroon });
  page.drawText(text.toUpperCase(), {
    x: x + width / 2 - fonts.sansBold.widthOfTextAtSize(text.toUpperCase(), 10) / 2,
    y: y - height / 2 - 3.5,
    size: 10,
    font: fonts.sansBold,
    color: COLOR.white,
  });
}

/** Standard page chrome: real background image, small logo, header title, footer. */
function drawPageChrome(
  page: PDFPage,
  fonts: Fonts,
  assets: Assets,
  opts: { title: string; subtitle?: string; pageNumber: number; totalPages: number; brand: BrandConfig }
) {
  drawPageBackground(page, assets);

  // Small logo, top-left, on every interior page (matches client's repeated header treatment)
  const logoDims = assets.logo.scale(0.16);
  page.drawImage(assets.logo, { x: 44, y: PAGE_HEIGHT - 44 - logoDims.height, width: logoDims.width, height: logoDims.height });

  page.drawText(opts.title, {
    x: 44,
    y: PAGE_HEIGHT - 80 - logoDims.height,
    size: 20,
    font: fonts.heading,
    color: COLOR.maroon,
  });
  page.drawLine({
    start: { x: 44, y: PAGE_HEIGHT - 92 - logoDims.height },
    end: { x: 44 + 70, y: PAGE_HEIGHT - 92 - logoDims.height },
    thickness: 1.5,
    color: COLOR.maroon,
  });
  if (opts.subtitle) {
    page.drawText(opts.subtitle, {
      x: 44,
      y: PAGE_HEIGHT - 108 - logoDims.height,
      size: 10.5,
      font: fonts.sans,
      color: COLOR.muted,
    });
  }

  // Footer
  page.drawLine({
    start: { x: 44, y: 50 },
    end: { x: PAGE_WIDTH - 44, y: 50 },
    thickness: 0.75,
    color: COLOR.maroon,
  });
  page.drawText(`WWW.${opts.brand.website.replace(/^www\./i, "").toUpperCase()}`, {
    x: 44,
    y: 34,
    size: 8,
    font: fonts.sansBold,
    color: COLOR.muted,
  });
  const pageStr = `Page ${opts.pageNumber} of ${opts.totalPages}`;
  page.drawText(pageStr, {
    x: PAGE_WIDTH - 44 - fonts.sans.widthOfTextAtSize(pageStr, 8),
    y: 34,
    size: 8,
    font: fonts.sans,
    color: COLOR.muted,
  });
}

/** Two-column data table: label left, value right, alternating row tint. */
function drawDataTable(
  page: PDFPage,
  fonts: Fonts,
  rows: [string, string][],
  opts: { x: number; y: number; width: number; rowHeight?: number }
): number {
  const rowHeight = opts.rowHeight ?? 32;
  let y = opts.y;
  rows.forEach(([label, value], i) => {
    if (i % 2 === 0) {
      page.drawRectangle({ x: opts.x, y: y - rowHeight, width: opts.width, height: rowHeight, color: COLOR.blushPanel });
    }
    page.drawRectangle({
      x: opts.x,
      y: y - rowHeight,
      width: opts.width,
      height: rowHeight,
      borderColor: rgb(0.86, 0.76, 0.74),
      borderWidth: 0.5,
    });
    page.drawText(label, { x: opts.x + 12, y: y - rowHeight / 2 - 4, size: 10.5, font: fonts.sansBold, color: COLOR.maroonDark });
    page.drawText(value || "—", {
      x: opts.x + opts.width / 2 + 12,
      y: y - rowHeight / 2 - 4,
      size: 11,
      font: fonts.sans,
      color: COLOR.ink,
    });
    // Divider between label/value columns
    page.drawLine({
      start: { x: opts.x + opts.width / 2, y },
      end: { x: opts.x + opts.width / 2, y: y - rowHeight },
      thickness: 0.5,
      color: rgb(0.86, 0.76, 0.74),
    });
    y -= rowHeight;
  });
  return y;
}

/** Simple 3x3 Loshu-style number grid (approximates the turtle illustration). */
function drawLoshuGrid(page: PDFPage, fonts: Fonts, centerX: number, topY: number, cellSize = 46) {
  const grid = [
    [4, 9, 2],
    [3, 5, 7],
    [8, 1, 6],
  ];
  const gridWidth = cellSize * 3;
  const startX = centerX - gridWidth / 2;
  grid.forEach((row, r) => {
    row.forEach((val, c) => {
      const cx = startX + c * cellSize;
      const cy = topY - r * cellSize;
      page.drawRectangle({
        x: cx,
        y: cy - cellSize,
        width: cellSize,
        height: cellSize,
        color: COLOR.blushPanel,
        borderColor: COLOR.maroon,
        borderWidth: 1,
      });
      const s = String(val);
      page.drawText(s, {
        x: cx + cellSize / 2 - fonts.sansBold.widthOfTextAtSize(s, 20) / 2,
        y: cy - cellSize / 2 - 7,
        size: 20,
        font: fonts.sansBold,
        color: COLOR.maroon,
      });
    });
  });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/* ------------------------------------------------------------------ */
/*  Page builders                                                       */
/* ------------------------------------------------------------------ */

function drawCoverPage(page: PDFPage, fonts: Fonts, data: Required<NameCheckReportInput>, assets: Assets) {
  drawPageBackground(page, assets);

  const centerX = PAGE_WIDTH / 2;

  // Logo (real wordmark image, replaces the old text-drawn brand name)
  const logoDims = assets.logo.scale(0.42);
  page.drawImage(assets.logo, {
    x: centerX - logoDims.width / 2,
    y: PAGE_HEIGHT - 70 - logoDims.height,
    width: logoDims.width,
    height: logoDims.height,
  });

  // Real turtle-grid illustration (static template graphic, matches client's cover exactly)
  const gridDims = assets.loshuGrid.scale(0.62);
  page.drawImage(assets.loshuGrid, {
    x: centerX - gridDims.width / 2,
    y: PAGE_HEIGHT - 300 - gridDims.height,
    width: gridDims.width,
    height: gridDims.height,
  });

  page.drawText("NAME CHECK", {
    x: centerX - fonts.heading.widthOfTextAtSize("NAME CHECK", 30) / 2,
    y: PAGE_HEIGHT - 480,
    size: 30,
    font: fonts.heading,
    color: COLOR.maroon,
  });
  page.drawText("REPORT", {
    x: centerX - fonts.heading.widthOfTextAtSize("REPORT", 30) / 2,
    y: PAGE_HEIGHT - 518,
    size: 30,
    font: fonts.heading,
    color: COLOR.maroon,
  });

  const nameStr = data.customerName.toUpperCase();
  page.drawText(nameStr, {
    x: centerX - fonts.heading.widthOfTextAtSize(nameStr, 18) / 2,
    y: PAGE_HEIGHT - 565,
    size: 18,
    font: fonts.heading,
    color: COLOR.maroonDark,
  });
  page.drawLine({
    start: { x: centerX - 60, y: PAGE_HEIGHT - 558 },
    end: { x: centerX + 60, y: PAGE_HEIGHT - 558 },
    thickness: 1,
    color: COLOR.maroon,
  });

  // Website pill at the bottom
  const pill = `WWW.${data.brand.website.replace(/^www\./i, "").toUpperCase()}`;
  const pillWidth = fonts.sansBold.widthOfTextAtSize(pill, 10) + 40;
  page.drawRectangle({
    x: centerX - pillWidth / 2,
    y: 70,
    width: pillWidth,
    height: 26,
    color: COLOR.maroon,
  });
  page.drawText(pill, {
    x: centerX - fonts.sansBold.widthOfTextAtSize(pill, 10) / 2,
    y: 79,
    size: 10,
    font: fonts.sansBold,
    color: COLOR.white,
  });
}

function drawIndexPage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
  drawPageChrome(page, fonts, assets, { title: "Index", pageNumber, totalPages, brand: data.brand });

  const rows: { no: string; title: string; items: string[] }[] = [
    { no: "01", title: "Personal Information &\nIntroduction", items: ["Your Personal Profile", "Welcome Message"] },
    {
      no: "02",
      title: "Understanding Name\nNumerology",
      items: ["The Science of Name Numbers", "The Chaldean Number Chart", "What We'll Analyze"],
    },
    {
      no: "03",
      title: "Current Name\nBreakdown",
      items: [
        "Part 1: First Name Number",
        "Part 2: Full Name Number",
        "Part 3: Full Name Compound Number",
      ],
    },
  ];

  let y = PAGE_HEIGHT - 170;
  const tableX = 44;
  const tableWidth = PAGE_WIDTH - 88;
  const numColW = 70;
  const titleColW = 160;

  rows.forEach((row) => {
    const rowHeight = 22 + row.items.length * 16 + 16;
    page.drawRectangle({
      x: tableX,
      y: y - rowHeight,
      width: tableWidth,
      height: rowHeight,
      borderColor: COLOR.maroon,
      borderWidth: 0.75,
    });
    page.drawLine({
      start: { x: tableX + numColW, y },
      end: { x: tableX + numColW, y: y - rowHeight },
      thickness: 0.5,
      color: COLOR.maroon,
    });
    page.drawLine({
      start: { x: tableX + numColW + titleColW, y },
      end: { x: tableX + numColW + titleColW, y: y - rowHeight },
      thickness: 0.5,
      color: COLOR.maroon,
    });
    page.drawText(row.no, {
      x: tableX + numColW / 2 - fonts.sansBold.widthOfTextAtSize(row.no, 24) / 2,
      y: y - rowHeight / 2 - 8,
      size: 24,
      font: fonts.sansBold,
      color: COLOR.maroon,
    });
    let titleY = y - 24;
    row.title.split("\n").forEach((line) => {
      page.drawText(line, { x: tableX + numColW + 10, y: titleY, size: 9.5, font: fonts.sansBold, color: COLOR.maroonDark });
      titleY -= 13;
    });
    let itemY = y - 24;
    row.items.forEach((item) => {
      page.drawText(`• ${item}`, {
        x: tableX + numColW + titleColW + 10,
        y: itemY,
        size: 9.5,
        font: fonts.sans,
        color: COLOR.ink,
      });
      itemY -= 15;
    });
    y -= rowHeight;
  });
}

function drawWelcomePage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
  drawPageChrome(page, fonts, assets, { title: `"Namaskar ${data.firstName || data.customerName} Ji"`, pageNumber, totalPages, brand: data.brand });

  let y = PAGE_HEIGHT - 150;
  const message = `"This personalised Name Check Report has been prepared after careful analysis of your birth date and current name by celebrity Astro-Numerologist ${data.brand.numerologistName}. The name analysis is rooted in the approach of Chaldean Numerology and the Loshu Grid. The purpose of this report is to identify how the cosmic energies influencing your life align with your current name. Please approach these insights with faith, consistency and pure intention. May this guide illuminate your path towards prosperity, peace and spiritual growth."`;

  y = drawWrappedText(page, message, {
    x: 54,
    y,
    font: fonts.quote,
    size: 12,
    maxWidth: PAGE_WIDTH - 108,
    lineHeight: 19,
    color: COLOR.maroonDark,
  });

  y -= 60;
  page.drawCircle({ x: PAGE_WIDTH / 2, y: y - 40, size: 48, color: COLOR.blushPanel, borderColor: COLOR.maroon, borderWidth: 1 });
  const namasteText = "Namaste";
  page.drawText(namasteText, {
    x: PAGE_WIDTH / 2 - fonts.sansBold.widthOfTextAtSize(namasteText, 13) / 2,
    y: y - 45,
    size: 13,
    font: fonts.sansBold,
    color: COLOR.maroon,
  });
}

function drawBlueprintPage(
  page: PDFPage,
  fonts: Fonts,
  assets: Assets,
  data: Required<NameCheckReportInput>,
  numbers: { mulank: number; bhagyank: number; firstNameNumber: number; fullNameNumber: number; fullNameCompound: number },
  pageNumber: number,
  totalPages: number
) {
  drawPageChrome(page, fonts, assets, { title: "Numerological Blueprint", pageNumber, totalPages, brand: data.brand });

  drawMaroonBanner(page, fonts, "Personal Information", 44, PAGE_HEIGHT - 140, PAGE_WIDTH - 88);

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

  drawDataTable(page, fonts, rows, { x: 44, y: PAGE_HEIGHT - 150, width: PAGE_WIDTH - 88, rowHeight: 30 });
}

function drawScienceOfNamesPage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
  drawPageChrome(page, fonts, assets, { title: "The Science of Name Numbers", pageNumber, totalPages, brand: data.brand });

  let y = PAGE_HEIGHT - 140;
  drawMaroonBanner(page, fonts, "What Is Name Numerology", 44, y, PAGE_WIDTH - 88);
  y -= 46;
  y = drawWrappedText(
    page,
    "Every letter in the alphabet carries a specific numeric vibration. When combined, the letters of a name create unique energy patterns that influence:",
    { x: 54, y, font: fonts.sans, size: 11, maxWidth: PAGE_WIDTH - 108, lineHeight: 15, color: COLOR.ink }
  );
  y -= 8;
  y = drawBulletList(
    page,
    [
      "How others perceive you",
      "Your natural talents and abilities",
      "Career and financial opportunities",
      "Relationship dynamics",
      "Mental and emotional patterns",
      "Life challenges and lessons",
    ],
    { x: 54, y, font: fonts.sans, size: 11, maxWidth: PAGE_WIDTH - 108, lineHeight: 15, gap: 4, color: COLOR.ink }
  );

  y -= 30;
  drawMaroonBanner(page, fonts, "Why Your Name Matters", 44, y, PAGE_WIDTH - 88);
  y -= 46;
  drawWrappedText(
    page,
    "You hear and respond to your name thousands of times throughout life. Each utterance reinforces the vibrational pattern, making your name a constant affirmation — positive or negative — depending on its alignment with your destiny.",
    { x: 54, y, font: fonts.sans, size: 11, maxWidth: PAGE_WIDTH - 108, lineHeight: 15, color: COLOR.ink }
  );
}

function drawChaldeanSystemPage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
  drawPageChrome(page, fonts, assets, { title: "Numerological Systems Used", pageNumber, totalPages, brand: data.brand });

  let y = PAGE_HEIGHT - 140;
  drawMaroonBanner(page, fonts, "Chaldean Numerology", 44, y, PAGE_WIDTH - 88);
  y -= 46;
  y = drawBulletList(
    page,
    [
      "Ancient Babylonian system — considered the most accurate approach for name analysis.",
      "Values run 1 to 8 (9 is considered sacred and is never assigned to a letter).",
      "Focuses on the sound vibration and energy of each letter, rather than its position in the alphabet.",
    ],
    { x: 54, y, font: fonts.sans, size: 10.5, maxWidth: PAGE_WIDTH - 108, lineHeight: 14, gap: 6, color: COLOR.ink }
  );

  y -= 26;
  drawMaroonBanner(page, fonts, "The Chaldean Number Chart", 44, y, PAGE_WIDTH - 88);
  y -= 40;

  const groups: [number, string][] = [
    [1, "A I J Q Y"],
    [2, "B K R"],
    [3, "C G L S"],
    [4, "D M T"],
    [5, "E H N X"],
    [6, "U V W"],
    [7, "O Z"],
    [8, "F P"],
  ];
  const colWidth = (PAGE_WIDTH - 88) / 4;
  groups.forEach(([num, letters], i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const cx = 44 + col * colWidth;
    const cy = y - row * 90;
    page.drawRectangle({
      x: cx,
      y: cy - 80,
      width: colWidth - 8,
      height: 80,
      color: COLOR.blushPanel,
      borderColor: COLOR.maroon,
      borderWidth: 0.75,
    });
    const numStr = String(num);
    page.drawText(numStr, {
      x: cx + (colWidth - 8) / 2 - fonts.sansBold.widthOfTextAtSize(numStr, 22) / 2,
      y: cy - 34,
      size: 22,
      font: fonts.sansBold,
      color: COLOR.maroon,
    });
    page.drawText(letters, {
      x: cx + (colWidth - 8) / 2 - fonts.sansBold.widthOfTextAtSize(letters, 9) / 2,
      y: cy - 62,
      size: 9,
      font: fonts.sansBold,
      color: COLOR.maroonDark,
    });
  });
}

function drawWhatWellAnalyzePage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
  drawPageChrome(page, fonts, assets, { title: "What We'll Analyze", pageNumber, totalPages, brand: data.brand });

  let y = PAGE_HEIGHT - 150;
  const items = [
    "First Name Number — your personal identity and self-expression.",
    "Full Name Number — your complete destiny and life purpose.",
    "Full Name Compound Number — hidden influences and karmic patterns.",
    "Complete Date of Birth — its influence on your name number, via Mulank and Bhagyank.",
  ];
  drawBulletList(page, items, {
    x: 54,
    y,
    font: fonts.sans,
    size: 11.5,
    maxWidth: PAGE_WIDTH - 108,
    lineHeight: 16,
    gap: 14,
    color: COLOR.ink,
  });
}

function drawCurrentNameBreakdownPage(
  page: PDFPage,
  fonts: Fonts,
  assets: Assets,
  data: Required<NameCheckReportInput>,
  opts: {
    heading: string;
    nameLabel: string;
    nameValue: string;
    total: number;
    reducedTo?: number;
    bullets: string[];
  },
  pageNumber: number,
  totalPages: number
) {
  drawPageChrome(page, fonts, assets, { title: "Current Name Breakdown", subtitle: opts.heading, pageNumber, totalPages, brand: data.brand });

  let y = PAGE_HEIGHT - 150;
  const tableRows: [string, string][] = [[opts.nameLabel, opts.nameValue]];
  drawDataTable(page, fonts, tableRows, { x: 44, y, width: PAGE_WIDTH - 88, rowHeight: 32 });
  y -= 32;

  const summaryRow = opts.reducedTo !== undefined
    ? `Total: ${opts.total}     Reduced To: ${opts.reducedTo}`
    : `Total: ${opts.total}`;
  page.drawRectangle({ x: 44, y: y - 32, width: PAGE_WIDTH - 88, height: 32, color: COLOR.blushPanel, borderColor: rgb(0.86, 0.76, 0.74), borderWidth: 0.5 });
  page.drawText(summaryRow, {
    x: 44 + (PAGE_WIDTH - 88) / 2 - fonts.sansBold.widthOfTextAtSize(summaryRow, 12) / 2,
    y: y - 20,
    size: 12,
    font: fonts.sansBold,
    color: COLOR.maroonDark,
  });
  y -= 60;

  drawMaroonBanner(page, fonts, "What This Represents", 44, y, PAGE_WIDTH - 88);
  y -= 44;
  drawBulletList(page, opts.bullets, {
    x: 54,
    y,
    font: fonts.sans,
    size: 10.5,
    maxWidth: PAGE_WIDTH - 108,
    lineHeight: 14.5,
    gap: 12,
    color: COLOR.ink,
  });
}

const VERDICT_LABEL: Record<"HR" | "OA" | "NR", string> = {
  HR: "Highly Recommended",
  OA: "Optional / Advisable",
  NR: "Not Required",
};

/**
 * Renders the actual matched HR/OA/NR rule (from src/lib/name-check/rule-engine.ts
 * + hr-oa-nr-blocks.ts) — replaces the old hardcoded "restricted number only" logic.
 */
function drawWhyCriticalPage(
  page: PDFPage,
  fonts: Fonts,
  assets: Assets,
  data: Required<NameCheckReportInput>,
  matched: { ruleId: string; verdict: "HR" | "OA" | "NR"; isFallback: boolean },
  pageNumber: number,
  totalPages: number
) {
  drawPageChrome(page, fonts, assets, { title: "Current Name Breakdown", subtitle: "Why This Is Critical", pageNumber, totalPages, brand: data.brand });

  const rule = ALL_RULES.find((r) => r.id === matched.ruleId);
  let y = PAGE_HEIGHT - 150;

  drawMaroonBanner(page, fonts, "Why This Is Critical", 44, y, PAGE_WIDTH - 88);
  y -= 44;

  const bullets = rule?.paragraphs ?? [
    "Name correction guidance could not be determined for this combination — please review this report manually before sending it to the customer.",
  ];

  y = drawBulletList(page, bullets, {
    x: 54,
    y,
    font: fonts.sans,
    size: 11,
    maxWidth: PAGE_WIDTH - 108,
    lineHeight: 15.5,
    gap: 14,
    color: COLOR.ink,
  });

  y -= 20;
  const verdictLabel = `${VERDICT_LABEL[matched.verdict]}${matched.isFallback ? " (fallback — review recommended)" : ""}`;

  const boxHeight = 60;
  page.drawRectangle({ x: 44, y: y - boxHeight, width: PAGE_WIDTH - 88, height: boxHeight, color: COLOR.maroon });
  page.drawText(verdictLabel, {
    x: 44 + (PAGE_WIDTH - 88) / 2 - fonts.sansBold.widthOfTextAtSize(verdictLabel, 13) / 2,
    y: y - boxHeight / 2 - 5,
    size: 13,
    font: fonts.sansBold,
    color: COLOR.white,
  });
}

function drawServicesPage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
  drawPageChrome(page, fonts, assets, { title: "Services Offered", subtitle: "Illuminating Lives Through Ancient Wisdom", pageNumber, totalPages, brand: data.brand });

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

  drawBulletList(page, services, {
    x: 60,
    y: PAGE_HEIGHT - 150,
    font: fonts.sans,
    size: 11.5,
    maxWidth: PAGE_WIDTH - 120,
    lineHeight: 16,
    gap: 12,
    color: COLOR.ink,
  });
}

function drawContactPage(page: PDFPage, fonts: Fonts, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: COLOR.blush });
  drawFrame(page);

  const centerX = PAGE_WIDTH / 2;

  page.drawText(data.brand.companyName.toUpperCase(), {
    x: centerX - fonts.sansBold.widthOfTextAtSize(data.brand.companyName.toUpperCase(), 30) / 2,
    y: PAGE_HEIGHT - 340,
    size: 30,
    font: fonts.sansBold,
    color: COLOR.maroon,
  });
  page.drawText(data.brand.tagline.toUpperCase(), {
    x: centerX - fonts.sansBold.widthOfTextAtSize(data.brand.tagline.toUpperCase(), 10) / 2,
    y: PAGE_HEIGHT - 358,
    size: 10,
    font: fonts.sansBold,
    color: COLOR.muted,
  });

  const contactLines = [data.brand.email, data.brand.phone, data.brand.website];
  let ly = PAGE_HEIGHT - 420;
  contactLines.forEach((line) => {
    page.drawText(line, {
      x: centerX - fonts.sans.widthOfTextAtSize(line, 11) / 2,
      y: ly,
      size: 11,
      font: fonts.sans,
      color: COLOR.maroonDark,
    });
    ly -= 18;
  });

  const pill = `WWW.${data.brand.website.replace(/^www\./i, "").toUpperCase()}`;
  const pillWidth = fonts.sansBold.widthOfTextAtSize(pill, 10) + 40;
  page.drawRectangle({ x: centerX - pillWidth / 2, y: 70, width: pillWidth, height: 26, color: COLOR.maroon });
  page.drawText(pill, {
    x: centerX - fonts.sansBold.widthOfTextAtSize(pill, 10) / 2,
    y: 79,
    size: 10,
    font: fonts.sansBold,
    color: COLOR.white,
  });

  page.drawText(`Report ID: ${data.reportId}`, {
    x: centerX - fonts.sans.widthOfTextAtSize(`Report ID: ${data.reportId}`, 8) / 2,
    y: 44,
    size: 8,
    font: fonts.sans,
    color: COLOR.muted,
  });
}

/* ------------------------------------------------------------------ */
/*  "What This Represents" copy — now sourced verbatim from             */
/*  src/lib/name-check/content-blocks.ts (client's exact wording),      */
/*  looked up via FIRST_NAME_BLOCKS / FULL_NAME_BLOCKS / COMPOUND_BLOCKS*/
/*  directly inside generateNameCheckReportPdf() below.                */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Main entry point                                                    */
/* ------------------------------------------------------------------ */

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
  const firstNameSum = chaldeanRawSum(data.firstName); // raw total, for display on the breakdown page
  const fullNameNumber = facts.fullNameNumber;
  const fullNameSum = getFullNameCompoundNumber(fullName); // raw total, same as fullNameCompound below
  const fullNameCompound = facts.fullNameCompoundNumber;

  const compoundTier = facts.compoundTier; // "excellent" | "good" | "neutral" | "conditional" | "avoid"

  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`Name Check Report - ${data.customerName}`);
  pdfDoc.setSubject("Chaldean Numerology Name Check Report");
  pdfDoc.setProducer(data.brand.companyName);
  pdfDoc.setCreator(data.brand.companyName);

  // Custom TTF embedding requires fontkit to be registered first.
  pdfDoc.registerFontkit(fontkit);

  // Fetch all design assets (images + fonts) from /public in parallel.
  const [backgroundBytes, logoBytes, loshuGridBytes, starIconBytes, quicksandRegularBytes, quicksandBoldBytes, cinzelDecorativeBoldBytes, cardoRegularBytes] =
    await Promise.all([
      fetchAssetBytes(ASSET_PATHS.background),
      fetchAssetBytes(ASSET_PATHS.logo),
      fetchAssetBytes(ASSET_PATHS.loshuGrid),
      fetchAssetBytes(ASSET_PATHS.starIcon),
      fetchAssetBytes(ASSET_PATHS.fonts.quicksandRegular),
      fetchAssetBytes(ASSET_PATHS.fonts.quicksandBold),
      fetchAssetBytes(ASSET_PATHS.fonts.cinzelDecorativeBold),
      fetchAssetBytes(ASSET_PATHS.fonts.cardoRegular),
    ]);

  const assets: Assets = {
    background: await pdfDoc.embedPng(backgroundBytes),
    logo: await pdfDoc.embedPng(logoBytes),
    loshuGrid: await pdfDoc.embedPng(loshuGridBytes),
    starIcon: await pdfDoc.embedPng(starIconBytes),
  };

  const fonts: Fonts = {
    sans: await pdfDoc.embedFont(quicksandRegularBytes),
    sansBold: await pdfDoc.embedFont(quicksandBoldBytes),
    heading: await pdfDoc.embedFont(cinzelDecorativeBoldBytes),
    quote: await pdfDoc.embedFont(cardoRegularBytes),
  };

  const TOTAL_PAGES = 12;
  const addPage = () => pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

  // 1. Cover
  drawCoverPage(addPage(), fonts, data, assets);
  // 2. Index
  drawIndexPage(addPage(), fonts, assets, data, 2, TOTAL_PAGES);
  // 3. Welcome message
  drawWelcomePage(addPage(), fonts, assets, data, 3, TOTAL_PAGES);
  // 4. Numerological Blueprint
  drawBlueprintPage(addPage(), fonts, assets, data, { mulank, bhagyank, firstNameNumber, fullNameNumber, fullNameCompound }, 4, TOTAL_PAGES);
  // 5. Science of Name Numbers
  drawScienceOfNamesPage(addPage(), fonts, assets, data, 5, TOTAL_PAGES);
  // 6. Chaldean System + Chart
  drawChaldeanSystemPage(addPage(), fonts, assets, data, 6, TOTAL_PAGES);
  // 7. What We'll Analyze
  drawWhatWellAnalyzePage(addPage(), fonts, assets, data, 7, TOTAL_PAGES);
  // 8. Current Name Breakdown — First Name Number
  drawCurrentNameBreakdownPage(
    addPage(),
    fonts,
    assets,
    data,
    {
      heading: "First Name Number",
      nameLabel: "First Name",
      nameValue: data.firstName,
      total: firstNameSum,
      reducedTo: firstNameNumber,
      bullets: FIRST_NAME_BLOCKS[comboKey(facts.firstNameToMulank, facts.firstNameToBhagyank)],
    },
    8,
    TOTAL_PAGES
  );
  // 9. Current Name Breakdown — Full Name Number
  drawCurrentNameBreakdownPage(
    addPage(),
    fonts,
    assets,
    data,
    {
      heading: "Full Name Number",
      nameLabel: "First Name",
      nameValue: fullName,
      total: fullNameSum,
      reducedTo: fullNameNumber,
      bullets: FULL_NAME_BLOCKS[comboKey(facts.fullNameToMulank, facts.fullNameToBhagyank)],
    },
    9,
    TOTAL_PAGES
  );
  // 10. Current Name Breakdown — Full Name Compound Number
  drawCurrentNameBreakdownPage(
    addPage(),
    fonts,
    assets,
    data,
    {
      heading: "Full Name Compound Number",
      nameLabel: "First Name",
      nameValue: fullName,
      total: fullNameCompound,
      bullets: COMPOUND_BLOCKS[compoundTier],
    },
    10,
    TOTAL_PAGES
  );
  // 11. Why This Is Critical — now shows the actual matched HR/OA/NR rule
  drawWhyCriticalPage(addPage(), fonts, assets, data, { ruleId: matchedRuleId, verdict, isFallback }, 11, TOTAL_PAGES);
  // 12. Services / Contact
  drawServicesPage(addPage(), fonts, assets, data, 12, TOTAL_PAGES);

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

// Exported for reuse/testing elsewhere in the app (e.g. showing a live
// preview of the computed numbers before the PDF is generated).
// Core calculations now live in src/lib/name-check/* — re-exported here
// only for convenience/backwards-compatibility with existing call sites.
export { runNameCheck } from "@/lib/name-check/rule-engine";
export { chaldeanRawSum, getFullNameCompoundNumber } from "@/lib/name-check/numerology";
export const numerology = {
  splitName,
  NUMBER_KEYWORDS,
};

