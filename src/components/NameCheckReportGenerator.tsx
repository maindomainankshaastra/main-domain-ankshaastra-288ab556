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
 *   npm install pdf-lib @pdf-lib/fontkit
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

import { PDFDocument, PDFPage, PDFFont, PDFImage, StandardFonts, rgb, RGB } from "pdf-lib";
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
/*  Numerology engine — lives in src/lib/name-check/*                  */
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
  blush: rgb(0.988, 0.945, 0.925), // pale rose page background — sampled directly from the reference PDF
  blushPanel: rgb(0.965, 0.902, 0.89), // slightly deeper rose panel fill
  maroon: rgb(0.686, 0.271, 0.259), // primary brand maroon — exact match, sampled from reference (RGB 175,69,66)
  maroonDark: rgb(0.6, 0.22, 0.21),
  ink: rgb(0.686, 0.271, 0.259), // body text — the reference uses the SAME maroon for body copy, not a neutral black/gray
  muted: rgb(0.62, 0.42, 0.4),
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
  handsPraying: "/name-check-assets/praying-hands.png",
  // Social icons — filled maroon circle + white glyph, drawn on the "Connect With Me" page.
  socialInstagram: "/name-check-assets/social-instagram.png",
  socialLinkedin: "/name-check-assets/social-linkedin.png",
  socialYoutube: "/name-check-assets/social-youtube.png",
  socialFacebook: "/name-check-assets/social-facebook.png",
  // Offer-page bullet badge icons (page 12) — extracted from the client's reference PDF.
  offerIconPen: "/name-check-assets/offer-icon-pen.png",
  offerIconDigits: "/name-check-assets/offer-icon-digits.png",
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
  background: PDFImage;
  logo: PDFImage;
  loshuGrid: PDFImage;
  starIcon: PDFImage;
  handsPraying: PDFImage;
  socialInstagram: PDFImage;
  socialLinkedin: PDFImage;
  socialYoutube: PDFImage;
  socialFacebook: PDFImage;
  offerIconPen: PDFImage;
  offerIconDigits: PDFImage;
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

/** Builds an SVG path string for a rounded rectangle (top-left origin, y-down SVG convention). */
function roundedRectSvgPath(width: number, height: number, radius: number): string {
  const r = Math.min(radius, width / 2, height / 2);
  return [
    `M ${r} 0`,
    `H ${width - r}`,
    `A ${r} ${r} 0 0 1 ${width} ${r}`,
    `V ${height - r}`,
    `A ${r} ${r} 0 0 1 ${width - r} ${height}`,
    `H ${r}`,
    `A ${r} ${r} 0 0 1 0 ${height - r}`,
    `V ${r}`,
    `A ${r} ${r} 0 0 1 ${r} 0`,
    `Z`,
  ].join(" ");
}

/** Rounded rect with only the TOP two corners rounded (bottom stays square) — used for a maroon header
 *  row that sits flush on top of an otherwise-rounded card, e.g. the name/value row on breakdown pages. */
function roundedTopRectSvgPath(width: number, height: number, radius: number): string {
  const r = Math.min(radius, width / 2, height);
  return [
    `M ${r} 0`,
    `H ${width - r}`,
    `A ${r} ${r} 0 0 1 ${width} ${r}`,
    `V ${height}`,
    `H 0`,
    `V ${r}`,
    `A ${r} ${r} 0 0 1 ${r} 0`,
    `Z`,
  ].join(" ");
}

/** Draws a rounded rectangle (fill and/or border) — pdf-lib has no native rounded rect, so this uses drawSvgPath. */
function drawRoundedRect(
  page: PDFPage,
  opts: { x: number; y: number; width: number; height: number; radius: number; color?: RGB; borderColor?: RGB; borderWidth?: number }
) {
  page.drawSvgPath(roundedRectSvgPath(opts.width, opts.height, opts.radius), {
    x: opts.x,
    y: opts.y + opts.height,
    scale: 1,
    color: opts.color,
    borderColor: opts.borderColor,
    borderWidth: opts.borderWidth,
  });
}

/** Fully-rounded maroon pill banner used for section headers, floating centered over a content box's top edge. */
function drawMaroonBanner(page: PDFPage, fonts: Fonts, text: string, boxX: number, boxTopY: number, boxWidth: number, height = 34) {
  const label = text.toUpperCase();
  const textWidth = fonts.sansBold.widthOfTextAtSize(label, 10.5);
  const width = Math.min(boxWidth - 16, textWidth + 56);
  const x = boxX + boxWidth / 2 - width / 2;
  const y = boxTopY - height / 2;
  drawRoundedRect(page, { x, y, width, height, radius: height / 2, color: COLOR.maroon });
  page.drawText(label, {
    x: x + width / 2 - textWidth / 2,
    y: y + height / 2 - 3.7,
    size: 10.5,
    font: fonts.sansBold,
    color: COLOR.white,
  });
}

/** A rounded-rect content box (matches the client's card treatment) — returns the inner top-Y to start drawing content at. */
function drawContentBox(page: PDFPage, opts: { x: number; y: number; width: number; height: number }): number {
  drawRoundedRect(page, {
    x: opts.x,
    y: opts.y - opts.height,
    width: opts.width,
    height: opts.height,
    radius: 18,
    color: COLOR.blushPanel,
    borderColor: COLOR.maroon,
    borderWidth: 1,
  });
  return opts.y;
}

/** Wrapped body text, each line horizontally centered within maxWidth (matches the reference's centered paragraphs). */
function drawWrappedTextCentered(
  page: PDFPage,
  text: string,
  opts: { centerX: number; y: number; font: PDFFont; size: number; maxWidth: number; lineHeight: number; color: RGB }
): number {
  const lines = wrapText(text, opts.font, opts.size, opts.maxWidth);
  let cursorY = opts.y;
  for (const line of lines) {
    page.drawText(line, {
      x: opts.centerX - opts.font.widthOfTextAtSize(line, opts.size) / 2,
      y: cursorY,
      size: opts.size,
      font: opts.font,
      color: opts.color,
    });
    cursorY -= opts.lineHeight;
  }
  return cursorY;
}

/** Small 4-point sparkle/star glyph, drawn with two crossed diamonds (used in the centered title divider). */
function drawStarGlyph(page: PDFPage, cx: number, cy: number, r: number, color: RGB) {
  // Path built in LOCAL coordinates (0..2r, y-down) then offset via x/y — drawSvgPath treats
  // path coordinates as relative to the given origin, so passing absolute page coordinates
  // straight into the path string (with no x/y offset) was placing this off-page/invisible.
  const path = `M ${r} 0 L ${r * 1.32} ${r * 0.68} L ${r * 2} ${r} L ${r * 1.32} ${r * 1.32} L ${r} ${r * 2} L ${r * 0.68} ${r * 1.32} L 0 ${r} L ${r * 0.68} ${r * 0.68} Z`;
  page.drawSvgPath(path, { x: cx - r, y: cy + r, color });
}

/**
 * Small white glyph icons drawn INSIDE a filled maroon circle badge — used on the pricing/
 * offer page (page 12) so each bullet gets a distinct icon instead of a plain blank dot,
 * matching the reference ("Bindhu") sample: pen/edit, grid, stacked digits, letter, document.
 */
type OfferIconType = "pen" | "grid" | "digits" | "letter" | "document";

function drawOfferIcon(page: PDFPage, fonts: Fonts, assets: Assets, type: OfferIconType, cx: number, cy: number, r: number) {
  const white = COLOR.white;
  switch (type) {
    case "pen": {
      // Real extracted "document + pencil" icon from the reference PDF.
      const img = assets.offerIconPen;
      const targetW = r * 1.65;
      const scale = targetW / img.width;
      const w = img.width * scale;
      const h = img.height * scale;
      page.drawImage(img, { x: cx - w / 2, y: cy - h / 2, width: w, height: h });
      break;
    }
    case "digits": {
      // Real extracted colorful "0-9 digits" icon from the reference PDF.
      const img = assets.offerIconDigits;
      const targetW = r * 1.75;
      const scale = targetW / img.width;
      const w = img.width * scale;
      const h = img.height * scale;
      page.drawImage(img, { x: cx - w / 2, y: cy - h / 2, width: w, height: h });
      break;
    }
    case "grid": {
      // 2x2 outlined squares — small "table / spelling options" grid glyph.
      const cell = r * 0.62;
      const gap = r * 0.22;
      const originX = cx - cell - gap / 2;
      const originY = cy - cell - gap / 2;
      [0, 1].forEach((row) => {
        [0, 1].forEach((col) => {
          page.drawRectangle({
            x: originX + col * (cell + gap),
            y: originY + row * (cell + gap),
            width: cell,
            height: cell,
            borderColor: white,
            borderWidth: 1.1,
          });
        });
      });
      break;
    }
    case "letter": {
      const label = "A";
      page.drawText(label, {
        x: cx - fonts.sansBold.widthOfTextAtSize(label, 14) / 2,
        y: cy - 5,
        size: 14,
        font: fonts.sansBold,
        color: white,
      });
      break;
    }
    case "document": {
      // Simple document/pages glyph — outlined rect with a folded top-right corner + two lines.
      const w = r * 1.05;
      const h = r * 1.3;
      const x = cx - w / 2;
      const y = cy - h / 2;
      const fold = 4;
      const path = `M 0 0 L ${w - fold} 0 L ${w} ${fold} L ${w} ${h} L 0 ${h} Z`;
      page.drawSvgPath(path, { x, y: y + h, borderColor: white, borderWidth: 1.1 });
      [0.38, 0.6].forEach((f) => {
        page.drawLine({ start: { x: x + 3, y: y + h * (1 - f) }, end: { x: x + w - 4, y: y + h * (1 - f) }, thickness: 1, color: white });
      });
      break;
    }
  }
}

/**
 * Standard page chrome, matching the reference design: real background border image, a big
 * CENTERED decorative title (optionally two lines) with a centered underline + star divider,
 * and a centered website pill footer. Every page in the reference — Index, Welcome, Blueprint,
 * Science, Systems, Breakdown, etc. — uses this same centered treatment; there is no "left"
 * variant in the client's actual template, so this always centers.
 */
function drawPageChrome(
  page: PDFPage,
  fonts: Fonts,
  assets: Assets,
  opts: { title: string; subtitle?: string; pageNumber: number; totalPages: number; brand: BrandConfig }
) {
  drawPageBackground(page, assets);

  const centerX = PAGE_WIDTH / 2;
  const titleLines = opts.title.split("\n");
  let titleY = PAGE_HEIGHT - 96;
  const maxTitleWidth = PAGE_WIDTH - 96;

  titleLines.forEach((line, i) => {
    const isLast = i === titleLines.length - 1;
    let size = isLast ? 24 : 15;
    const font = fonts.heading;
    // Auto-shrink to fit (e.g. long customer names on the welcome page) instead of overflowing.
    while (font.widthOfTextAtSize(line, size) > maxTitleWidth && size > 11) size -= 1;
    page.drawText(line, {
      x: centerX - font.widthOfTextAtSize(line, size) / 2, // always centered — matches every page of the reference
      y: titleY,
      size,
      font,
      color: COLOR.maroon,
    });
    titleY -= isLast ? 34 : 26;
  });

  // Centered underline + star divider, matching the reference on every interior page.
  const dividerY = titleY + 12;
  page.drawLine({ start: { x: centerX - 165, y: dividerY }, end: { x: centerX - 14, y: dividerY }, thickness: 1, color: COLOR.maroon });
  page.drawLine({ start: { x: centerX + 14, y: dividerY }, end: { x: centerX + 165, y: dividerY }, thickness: 1, color: COLOR.maroon });
  drawStarGlyph(page, centerX, dividerY, 6, COLOR.maroon);

  if (opts.subtitle) {
    const subLabel = opts.subtitle.toUpperCase();
    page.drawText(subLabel, {
      x: centerX - fonts.sansBold.widthOfTextAtSize(subLabel, 11) / 2,
      y: dividerY - 22,
      size: 11,
      font: fonts.sansBold,
      color: COLOR.maroonDark,
    });
  }

  drawFooterPill(page, fonts, opts.brand);
}

/** Centered rounded maroon website pill, used as the footer on every interior page (matches the reference exactly). */
function drawFooterPill(page: PDFPage, fonts: Fonts, brand: BrandConfig) {
  const centerX = PAGE_WIDTH / 2;
  const pill = `WWW.${brand.website.replace(/^www\./i, "").toUpperCase()}`;
  const pillWidth = fonts.sansBold.widthOfTextAtSize(pill, 10) + 44;
  const height = 28;
  drawRoundedRect(page, { x: centerX - pillWidth / 2, y: 40, width: pillWidth, height, radius: height / 2, color: COLOR.maroon });
  page.drawText(pill, {
    x: centerX - fonts.sansBold.widthOfTextAtSize(pill, 10) / 2,
    y: 40 + height / 2 - 3.5,
    size: 10,
    font: fonts.sansBold,
    color: COLOR.white,
  });
}

/** Two-column data table: label + value, BOTH CENTERED within their half-column — matches the
 *  reference's plain bordered-row style exactly (Title Case label, centered; value centered). */
function drawDataTable(
  page: PDFPage,
  fonts: Fonts,
  rows: [string, string][],
  opts: { x: number; y: number; width: number; rowHeight?: number }
): number {
  const rowHeight = opts.rowHeight ?? 32;
  const totalHeight = rowHeight * rows.length;
  const borderTint = rgb(0.82, 0.68, 0.66);
  const labelColCenter = opts.x + opts.width / 4;
  const valueColCenter = opts.x + (opts.width * 3) / 4;

  drawRoundedRect(page, { x: opts.x, y: opts.y - totalHeight, width: opts.width, height: totalHeight, radius: 16, color: COLOR.blushPanel, borderColor: COLOR.maroon, borderWidth: 1 });

  let y = opts.y;
  rows.forEach(([label, value], i) => {
    if (i > 0) {
      page.drawLine({ start: { x: opts.x, y }, end: { x: opts.x + opts.width, y }, thickness: 0.5, color: borderTint });
    }
    page.drawText(label, {
      x: labelColCenter - fonts.sansBold.widthOfTextAtSize(label, 11) / 2,
      y: y - rowHeight / 2 - 4,
      size: 11,
      font: fonts.sansBold,
      color: COLOR.maroonDark,
    });
    const valueText = value || "—";
    page.drawText(valueText, {
      x: valueColCenter - fonts.sansBold.widthOfTextAtSize(valueText, 11) / 2,
      y: y - rowHeight / 2 - 4,
      size: 11,
      font: fonts.sansBold,
      color: COLOR.ink,
    });
    // Divider between label/value columns
    page.drawLine({
      start: { x: opts.x + opts.width / 2, y },
      end: { x: opts.x + opts.width / 2, y: y - rowHeight },
      thickness: 0.5,
      color: borderTint,
    });
    y -= rowHeight;
  });
  return opts.y - totalHeight;
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

  // Logo (real wordmark image) — sized to a fixed TARGET width, not a raw scale factor.
  const LOGO_TARGET_WIDTH = 210;
  const logoScale = LOGO_TARGET_WIDTH / assets.logo.width;
  const logoDims = assets.logo.scale(logoScale);
  let y = PAGE_HEIGHT - 66;
  page.drawImage(assets.logo, { x: centerX - logoDims.width / 2, y: y - logoDims.height, width: logoDims.width, height: logoDims.height });
  y -= logoDims.height + 60;

  // Real turtle-grid illustration, also sized to a fixed target width.
  const GRID_TARGET_WIDTH = 230;
  const gridScale = GRID_TARGET_WIDTH / assets.loshuGrid.width;
  const gridDims = assets.loshuGrid.scale(gridScale);
  page.drawImage(assets.loshuGrid, { x: centerX - gridDims.width / 2, y: y - gridDims.height, width: gridDims.width, height: gridDims.height });
  y -= gridDims.height + 56;

  page.drawText("NAME CHECK", {
    x: centerX - fonts.heading.widthOfTextAtSize("NAME CHECK", 30) / 2,
    y,
    size: 30,
    font: fonts.heading,
    color: COLOR.maroon,
  });
  y -= 38;
  page.drawText("REPORT", {
    x: centerX - fonts.heading.widthOfTextAtSize("REPORT", 30) / 2,
    y,
    size: 30,
    font: fonts.heading,
    color: COLOR.maroon,
  });
  y -= 46;

  // Cover byline is the numerologist's/brand's name — NOT the customer's name.
  // This matches the reference exactly: every reference cover (regardless of which
  // customer the report is for) shows "HIMANSSHU AGARWAL" here. The customer is
  // greeted by name starting on the Welcome page (page 3) and the Blueprint table
  // (page 4) instead — the cover is a fixed brand/author credit, not a personalization slot.
  const byline = data.brand.numerologistName.replace(/\s+Ji$/i, "").toUpperCase();
  page.drawText(byline, {
    x: centerX - fonts.heading.widthOfTextAtSize(byline, 18) / 2,
    y,
    size: 18,
    font: fonts.heading,
    color: COLOR.maroonDark,
  });
  y -= 14;
  page.drawLine({ start: { x: centerX - 60, y }, end: { x: centerX + 60, y }, thickness: 1, color: COLOR.maroon });

  drawFooterPill(page, fonts, data.brand);
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

  let y = PAGE_HEIGHT - 190;
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

  let y = PAGE_HEIGHT - 190;
  const message = `"This personalised Name Check Report has been prepared after careful analysis of your birth date and current name by celebrity Astro-Numerologist ${data.brand.numerologistName}. The name analysis is rooted in the approach of Chaldean Numerology and the Loshu Grid. The purpose of this report is to identify how the cosmic energies influencing your life align with your current name. Please approach these insights with faith, consistency and pure intention. May this guide illuminate your path towards prosperity, peace and spiritual growth."`;

  y = drawWrappedTextCentered(page, message, {
    centerX: PAGE_WIDTH / 2,
    y,
    font: fonts.quote,
    size: 12,
    maxWidth: PAGE_WIDTH - 140,
    lineHeight: 20,
  color: COLOR.maroonDark,
  });

  // Real praying-hands illustration, sized modestly (matches the reference: a small
  // centered accent well below the quote, NOT a page-filling image).
  const HANDS_TARGET_WIDTH = 130; // pt — keep deliberately small; the source art is ~1:1
  const handsScale = HANDS_TARGET_WIDTH / assets.handsPraying.width;
  const handsDims = assets.handsPraying.scale(handsScale);
  const HANDS_BOTTOM_Y = 190; // fixed anchor, well above the footer pill
  const handsTop = Math.min(y - 30, HANDS_BOTTOM_Y + handsDims.height);
  page.drawImage(assets.handsPraying, {
    x: PAGE_WIDTH / 2 - handsDims.width / 2,
    y: Math.min(handsTop - handsDims.height, HANDS_BOTTOM_Y),
    width: handsDims.width,
    height: handsDims.height,
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

  const boxX = 44;
  const boxWidth = PAGE_WIDTH - 88;

  // Full-width maroon banner (NOT a small centered pill) — matches the reference exactly.
  const bannerY = PAGE_HEIGHT - 165;
  const bannerHeight = 40;
  drawRoundedRect(page, { x: boxX, y: bannerY - bannerHeight, width: boxWidth, height: bannerHeight, radius: bannerHeight / 2, color: COLOR.maroon });
  page.drawText("PERSONAL INFORMATION", {
    x: boxX + 24,
    y: bannerY - bannerHeight / 2 - 4,
    size: 11.5,
    font: fonts.sansBold,
    color: COLOR.white,
  });

  // Plain Title Case labels — NOT "(As per Aadhar Card)" and NOT forced uppercase;
  // the reference just says "First Name", "Middle Name", "Last Name", etc.
  const rows: [string, string][] = [
    ["First Name", data.firstName || "—"],
    ["Middle Name", data.middleName || "—"],
    ["Last Name", data.lastName || "—"],
    ["Date of Birth", formatDate(data.dob)],
    ["Gender", data.gender || "—"],
    ["Mulank", String(numbers.mulank)],
    ["Bhagyank", String(numbers.bhagyank)],
    ["First Name Number", String(numbers.firstNameNumber)],
    ["Full Name Number", String(numbers.fullNameNumber)],
    ["Full Name Compound Number", String(numbers.fullNameCompound)],
  ];

  drawDataTable(page, fonts, rows, { x: boxX, y: bannerY - bannerHeight - 12, width: boxWidth, rowHeight: 32 });
}

function drawScienceOfNamesPage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
  drawPageChrome(page, fonts, assets, { title: "The Science of\nName Numbers", pageNumber, totalPages, brand: data.brand });

  const boxX = 44;
  const boxWidth = PAGE_WIDTH - 88;

  let y = PAGE_HEIGHT - 165;
  let boxTop = y;
  let boxHeight = 208;
  drawContentBox(page, { x: boxX, y: boxTop, width: boxWidth, height: boxHeight });
  drawMaroonBanner(page, fonts, "What Is Name Numerology", boxX, boxTop, boxWidth);
  let cy = boxTop - 44;
  cy = drawWrappedText(
    page,
    "Every letter in the alphabet carries a specific numeric vibration. When combined, the letters of a name create unique energy patterns that influence:",
    { x: 62, y: cy, font: fonts.sans, size: 11, maxWidth: boxWidth - 36, lineHeight: 15, color: COLOR.ink }
  );
  cy -= 8;
  drawBulletList(
    page,
    [
      "How others perceive you",
      "Your natural talents and abilities",
      "Career and financial opportunities",
      "Relationship dynamics",
      "Mental and emotional patterns",
      "Life challenges and lessons",
    ],
    { x: 62, y: cy, font: fonts.sans, size: 11, maxWidth: boxWidth - 36, lineHeight: 15, gap: 4, color: COLOR.ink }
  );

  y = boxTop - boxHeight - 32;
  boxTop = y;
  boxHeight = 118;
  drawContentBox(page, { x: boxX, y: boxTop, width: boxWidth, height: boxHeight });
  drawMaroonBanner(page, fonts, "Why Your Name Matters", boxX, boxTop, boxWidth);
  drawWrappedTextCentered(
    page,
    "You hear and respond to your name thousands of times throughout life. Each utterance reinforces the vibrational pattern, making your name a constant affirmation — positive or negative — depending on its alignment with your destiny.",
    { centerX: boxX + boxWidth / 2, y: boxTop - 50, font: fonts.sans, size: 11, maxWidth: boxWidth - 64, lineHeight: 16, color: COLOR.ink }
  );
}

function drawChaldeanSystemPage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
  drawPageChrome(page, fonts, assets, { title: "Numerological\nSystems Used", subtitle: "This Report Analyzes Your Name Using", pageNumber, totalPages, brand: data.brand });

  const boxX = 44;
  const boxWidth = PAGE_WIDTH - 88;
  let boxTop = PAGE_HEIGHT - 195;
  const boxHeight = 150;
  drawContentBox(page, { x: boxX, y: boxTop, width: boxWidth, height: boxHeight });
  drawMaroonBanner(page, fonts, "Chaldean Numerology", boxX, boxTop, boxWidth);
  drawBulletList(
    page,
    [
      "Ancient Babylonian system — considered the most accurate approach for name analysis.",
      "Values run 1 to 8 (9 is considered sacred and is never assigned to a letter).",
      "Focuses on the sound vibration and energy of each letter, rather than its position in the alphabet.",
    ],
    { x: 62, y: boxTop - 46, font: fonts.sans, size: 10.5, maxWidth: boxWidth - 36, lineHeight: 14, gap: 8, color: COLOR.ink }
  );

  const chartTop = boxTop - boxHeight - 32;
  drawMaroonBanner(page, fonts, "The Chaldean Number Chart", boxX, chartTop, boxWidth);

  // Reference-accurate 8-column x 6-row letter grid: row 0 = digits 1-8, rows 1-5 = the
  // letters that carry that Chaldean value (padded with "-" so every column is even).
  const columns = [
    ["A", "I", "J", "Q", "Y"],
    ["B", "K", "R"],
    ["C", "G", "L", "S"],
    ["D", "M", "T"],
    ["E", "H", "N", "X"],
    ["U", "V", "W"],
    ["O", "Z"],
    ["F", "P"],
  ];
  const gridRows = 1 + Math.max(...columns.map((c) => c.length));
  const gridX = boxX;
  const gridWidth = boxWidth;
  const gridTop = chartTop - 30;
  const rowHeight = 30;
  const colWidth = gridWidth / 8;

  drawRoundedRect(page, { x: gridX, y: gridTop - rowHeight * gridRows, width: gridWidth, height: rowHeight * gridRows, radius: 14, color: COLOR.blushPanel, borderColor: COLOR.maroon, borderWidth: 1 });
  for (let r = 1; r < gridRows; r++) {
    const ly = gridTop - r * rowHeight;
    page.drawLine({ start: { x: gridX, y: ly }, end: { x: gridX + gridWidth, y: ly }, thickness: 0.5, color: rgb(0.82, 0.68, 0.66) });
  }
  for (let c = 1; c < 8; c++) {
    const lx = gridX + c * colWidth;
    page.drawLine({ start: { x: lx, y: gridTop }, end: { x: lx, y: gridTop - rowHeight * gridRows }, thickness: 0.5, color: rgb(0.82, 0.68, 0.66) });
  }
  for (let c = 0; c < 8; c++) {
    const numStr = String(c + 1);
    page.drawText(numStr, {
      x: gridX + c * colWidth + colWidth / 2 - fonts.sansBold.widthOfTextAtSize(numStr, 12) / 2,
      y: gridTop - rowHeight / 2 - 4,
      size: 12,
      font: fonts.sansBold,
      color: COLOR.maroon,
    });
    columns[c].forEach((letter, r) => {
      page.drawText(letter, {
        x: gridX + c * colWidth + colWidth / 2 - fonts.sans.widthOfTextAtSize(letter, 11) / 2,
        y: gridTop - (r + 2) * rowHeight + rowHeight / 2 - 4,
        size: 11,
        font: fonts.sans,
        color: COLOR.maroonDark,
      });
    });
  }
}

function drawWhatWellAnalyzePage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
  drawPageChrome(page, fonts, assets, { title: "Numerological\nSystems Used", pageNumber, totalPages, brand: data.brand });

  const boxX = 44;
  const boxWidth = PAGE_WIDTH - 88;
  const boxTop = PAGE_HEIGHT - 195;
  const boxHeight = 250;
  drawContentBox(page, { x: boxX, y: boxTop, width: boxWidth, height: boxHeight });
  drawMaroonBanner(page, fonts, "What We'll Analyze", boxX, boxTop, boxWidth);

  const items = [
    "First Name Number — your personal identity and self-expression.",
    "Full Name Number — your complete destiny and life purpose.",
    "Full Name Compound Number — hidden influences and karmic patterns.",
    "Complete Date of Birth — its influence on your name number, via Mulank and Bhagyank.",
  ];
  drawBulletList(page, items, {
    x: 62,
    y: boxTop - 46,
    font: fonts.sans,
    size: 11,
    maxWidth: boxWidth - 36,
    lineHeight: 15.5,
    gap: 16,
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
  drawPageChrome(page, fonts, assets, { title: "Current Name\nBreakdown", subtitle: opts.heading, pageNumber, totalPages, brand: data.brand });

  const boxX = 44;
  const boxWidth = PAGE_WIDTH - 88;
  const nameRowH = 34;
  const totalsRowH = 34;
  let y = PAGE_HEIGHT - 195;

  // Name/value + Total(/Reduced To) card — rounded outer shell, solid-maroon name row on top.
  drawRoundedRect(page, { x: boxX, y: y - nameRowH - totalsRowH, width: boxWidth, height: nameRowH + totalsRowH, radius: 16, color: COLOR.blushPanel, borderColor: COLOR.maroon, borderWidth: 1 });
  page.drawSvgPath(roundedTopRectSvgPath(boxWidth, nameRowH, 16), { x: boxX, y, color: COLOR.maroon });
  page.drawText(opts.nameLabel.toUpperCase(), {
    x: boxX + boxWidth * 0.27 - fonts.sansBold.widthOfTextAtSize(opts.nameLabel.toUpperCase(), 11) / 2,
    y: y - nameRowH / 2 - 4,
    size: 11,
    font: fonts.sansBold,
    color: COLOR.white,
  });
  page.drawText(opts.nameValue, {
    x: boxX + boxWidth * 0.65 - fonts.sansBold.widthOfTextAtSize(opts.nameValue, 12) / 2,
    y: y - nameRowH / 2 - 4,
    size: 12,
    font: fonts.sansBold,
    color: COLOR.white,
  });

  const totalsY = y - nameRowH;
  page.drawLine({ start: { x: boxX, y: totalsY }, end: { x: boxX + boxWidth, y: totalsY }, thickness: 0.5, color: rgb(0.82, 0.68, 0.66) });
  if (opts.reducedTo !== undefined) {
    const cols = [
      { label: "TOTAL", value: String(opts.total) },
      { label: "REDUCED TO", value: String(opts.reducedTo) },
    ];
    const colW = boxWidth / 4;
    [cols[0].label, cols[0].value, cols[1].label, cols[1].value].forEach((txt, i) => {
      const isLabel = i % 2 === 0;
      const cx = boxX + colW * i + colW / 2;
      page.drawText(txt, {
        x: cx - (isLabel ? fonts.sansBold : fonts.sansBold).widthOfTextAtSize(txt, isLabel ? 10 : 13) / 2,
        y: totalsY - totalsRowH / 2 - 4,
        size: isLabel ? 10 : 13,
        font: fonts.sansBold,
        color: COLOR.maroonDark,
      });
      if (i > 0) {
        page.drawLine({ start: { x: boxX + colW * i, y: totalsY }, end: { x: boxX + colW * i, y: totalsY - totalsRowH }, thickness: 0.5, color: rgb(0.82, 0.68, 0.66) });
      }
    });
  } else {
    const txt = `Total: ${opts.total}`;
    page.drawText(txt, {
      x: boxX + boxWidth / 2 - fonts.sansBold.widthOfTextAtSize(txt, 13) / 2,
      y: totalsY - totalsRowH / 2 - 4,
      size: 13,
      font: fonts.sansBold,
      color: COLOR.maroonDark,
    });
  }

  y = totalsY - totalsRowH - 34;
  const contentBoxTop = y;
  const contentBoxHeight = 230;
  drawContentBox(page, { x: boxX, y: contentBoxTop, width: boxWidth, height: contentBoxHeight });
  drawMaroonBanner(page, fonts, "What This Represents", boxX, contentBoxTop, boxWidth);
  drawBulletList(page, opts.bullets, {
    x: 62,
    y: contentBoxTop - 46,
    font: fonts.sans,
    size: 10.5,
    maxWidth: boxWidth - 36,
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
  drawPageChrome(page, fonts, assets, { title: "Current Name\nBreakdown", subtitle: "Why This Is Critical", pageNumber, totalPages, brand: data.brand });

  const rule = ALL_RULES.find((r) => r.id === matched.ruleId);
  const boxX = 44;
  const boxWidth = PAGE_WIDTH - 88;
  const boxTop = PAGE_HEIGHT - 195;
  const boxHeight = 220;

  drawContentBox(page, { x: boxX, y: boxTop, width: boxWidth, height: boxHeight });
  drawMaroonBanner(page, fonts, "Why This Is Critical", boxX, boxTop, boxWidth);

  const bullets = rule?.paragraphs ?? [
    "Name correction guidance could not be determined for this combination — please review this report manually before sending it to the customer.",
  ];
  drawBulletList(page, bullets, {
    x: 62,
    y: boxTop - 46,
    font: fonts.sans,
    size: 11,
    maxWidth: boxWidth - 36,
    lineHeight: 15.5,
    gap: 14,
    color: COLOR.ink,
  });

  // Verdict pill — solid maroon rounded card with a small circular star badge straddling the top border.
  const verdictLabel = `${VERDICT_LABEL[matched.verdict]}${matched.isFallback ? " (fallback — review recommended)" : ""}`;
  const verdictTop = boxTop - boxHeight - 46;
  const verdictHeight = 78;
  drawRoundedRect(page, { x: boxX, y: verdictTop - verdictHeight, width: boxWidth, height: verdictHeight, radius: 18, color: COLOR.maroon, borderColor: COLOR.maroon, borderWidth: 1 });
  drawWrappedTextCentered(page, verdictLabel, {
    centerX: boxX + boxWidth / 2,
    y: verdictTop - verdictHeight / 2 + 6,
    font: fonts.sansBold,
    size: 13,
    maxWidth: boxWidth - 60,
    lineHeight: 17,
    color: COLOR.white,
  });
  // Small circular star badge centered on the box's top edge (matches the reference).
  const badgeR = 15;
  page.drawCircle({ x: boxX + boxWidth / 2, y: verdictTop, size: badgeR, color: COLOR.blush, borderColor: COLOR.maroon, borderWidth: 1.5 });
  drawStarGlyph(page, boxX + boxWidth / 2, verdictTop, 7, COLOR.maroon);
}

function drawServicesPage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
  drawPageChrome(page, fonts, assets, { title: "Illuminating Lives\nThrough Ancient Wisdom", subtitle: "Services Offered", pageNumber, totalPages, brand: data.brand });

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

  let y = PAGE_HEIGHT - 200;
  const dotR = 9;
  services.forEach((service) => {
    page.drawCircle({ x: 44 + dotR, y: y - 5, size: dotR, borderColor: COLOR.maroon, borderWidth: 1 });
    drawStarGlyph(page, 44 + dotR, y - 5, 3.6, COLOR.maroon);
    page.drawText(service, { x: 44 + dotR * 2 + 14, y: y - 9, size: 11.5, font: fonts.sans, color: COLOR.ink });
    y -= 34;
  });
}

/** Page 12 (reference) — the two upsell offer cards, side by side. */
function drawPricingPage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
  drawPageBackground(page, assets);
  const centerX = PAGE_WIDTH / 2;

  const logoDims = assets.logo.scale(0.16);
  page.drawImage(assets.logo, { x: centerX - logoDims.width / 2, y: PAGE_HEIGHT - 56 - logoDims.height, width: logoDims.width, height: logoDims.height });

  let titleY = PAGE_HEIGHT - 100 - logoDims.height;
  page.drawText("YOUR NAME DECIDES", {
    x: centerX - fonts.heading.widthOfTextAtSize("YOUR NAME DECIDES", 14) / 2,
    y: titleY,
    size: 14,
    font: fonts.heading,
    color: COLOR.maroon,
  });
  titleY -= 26;
  page.drawText("YOUR SPEED IN LIFE", {
    x: centerX - fonts.heading.widthOfTextAtSize("YOUR SPEED IN LIFE", 21) / 2,
    y: titleY,
    size: 21,
    font: fonts.heading,
    color: COLOR.maroon,
  });
  const dividerY = titleY - 16;
  page.drawLine({ start: { x: centerX - 150, y: dividerY }, end: { x: centerX - 14, y: dividerY }, thickness: 1, color: COLOR.maroon });
  page.drawLine({ start: { x: centerX + 14, y: dividerY }, end: { x: centerX + 150, y: dividerY }, thickness: 1, color: COLOR.maroon });
  drawStarGlyph(page, centerX, dividerY, 6, COLOR.maroon);

  type Offer = { price: string; strike: string; off: string; title: string; bullets: string[]; icons: OfferIconType[]; note: string };
  const offers: Offer[] = [
    {
      price: "\u20B92,987",
      strike: "\u20B9 7,500",
      off: "GET 60% OFF",
      title: "Name Correction Report",
      bullets: ["First Name & Full Name Analysis", "2 Corrected Name Spelling Options", "Compound Number Analysis", "First Alphabet Analysis"],
      icons: ["pen", "grid", "digits", "letter"],
      note: "Comprehensive report with detailed name correction and analysis.",
    },
    {
      price: "\u20B93,437",
      strike: "\u20B9 7,500",
      off: "GET 54% OFF",
      title: "Perfect Baby Name Report",
      bullets: ["10+ Numerologically Aligned Names", "Mulank, Bhagyank & Rajyog Analysis", "First, Full & Compound Number Analysis", "45+ Page Report & Call Consultation Included"],
      icons: ["pen", "grid", "digits", "document"],
      note: "Get 10+ Numerologically Aligned Names for your child.",
    },
  ];

  const colGap = 16;
  const colWidth = (PAGE_WIDTH - 88 - colGap) / 2;
  const colTop = dividerY - 30;

  offers.forEach((offer, i) => {
    const cx = 44 + i * (colWidth + colGap);

    // Price pill straddling the top edge. The rupee sign (₹) isn't present in the Cinzel
    // Decorative font file, so it's drawn separately with Quicksand (which does have it)
    // and the numeral stays in the heading font — otherwise the ₹ silently disappears.
    const priceDigits = offer.price.replace(/^\D*/, "");
    const rupeeSize = 17;
    const digitsSize = 19;
    const rupeeWidth = fonts.sansBold.widthOfTextAtSize("₹", rupeeSize);
    const digitsWidth = fonts.heading.widthOfTextAtSize(priceDigits, digitsSize);
    const priceWidth = rupeeWidth + digitsWidth + 50;
    const priceH = 40;

    let iy = colTop - priceH - 22;
    const strikeWidth = fonts.sans.widthOfTextAtSize(offer.strike, 10);
    page.drawText(offer.strike, { x: cx + colWidth / 2 - strikeWidth / 2, y: iy, size: 10, font: fonts.sans, color: COLOR.muted });
    page.drawLine({ start: { x: cx + colWidth / 2 - strikeWidth / 2, y: iy + 3.5 }, end: { x: cx + colWidth / 2 + strikeWidth / 2, y: iy + 3.5 }, thickness: 0.75, color: COLOR.red });
    iy -= 22;
    page.drawText(offer.off, { x: cx + colWidth / 2 - fonts.sansBold.widthOfTextAtSize(offer.off, 13) / 2, y: iy, size: 13, font: fonts.sansBold, color: COLOR.ink });
    iy -= 24;
    page.drawText(offer.title, { x: cx + colWidth / 2 - fonts.sansBold.widthOfTextAtSize(offer.title, 12) / 2, y: iy, size: 12, font: fonts.sansBold, color: COLOR.maroon });
    iy -= 18;
    page.drawLine({ start: { x: cx + colWidth / 2 - 46, y: iy }, end: { x: cx + colWidth / 2 + 46, y: iy }, thickness: 0.75, color: COLOR.maroon });
    iy -= 22;

    const bulletTextX = 44; // offset from the row's left edge (cx + 14) to where text starts
    offer.bullets.forEach((b, bi) => {
      const textWidth = colWidth - 28 - bulletTextX - 14; // row width minus text-start offset minus right padding
      const lines = wrapText(b, fonts.sans, 9, textWidth);
      const rowH = 22 + Math.max(0, lines.length - 1) * 12;
      drawRoundedRect(page, { x: cx + 14, y: iy - rowH, width: colWidth - 28, height: rowH, radius: 12, borderColor: COLOR.maroon, borderWidth: 0.75 });
      const badgeCx = cx + 14 + 20;
      const badgeCy = iy - rowH / 2;
      page.drawCircle({ x: badgeCx, y: badgeCy, size: 13, color: COLOR.maroon });
      drawOfferIcon(page, fonts, assets, offer.icons[bi] ?? "letter", badgeCx, badgeCy, 13);
      let ty = iy - rowH / 2 + (lines.length - 1) * 6 + 3;
      lines.forEach((line) => {
        page.drawText(line, { x: cx + 14 + bulletTextX, y: ty, size: 9, font: fonts.sans, color: COLOR.maroonDark });
        ty -= 12;
      });
      iy -= rowH + 8;
    });

    iy -= 6;
    wrapText(offer.note, fonts.sans, 8.5, colWidth - 40).forEach((line) => {
      page.drawText(line, { x: cx + colWidth / 2 - fonts.sans.widthOfTextAtSize(line, 8.5) / 2, y: iy, size: 8.5, font: fonts.sans, color: COLOR.muted });
      iy -= 12;
    });

    // Button + card border both hug the content that was just measured out above.
    iy -= 6; // small buffer so the button never overlaps the last note line's descender
    const btnH = 34;
    const btnY = iy - 20;
    const cardBottom = btnY - 14;
    drawRoundedRect(page, { x: cx, y: cardBottom, width: colWidth, height: colTop - cardBottom, radius: 18, borderColor: COLOR.maroon, borderWidth: 1 });
    drawRoundedRect(page, { x: cx + colWidth / 2 - priceWidth / 2, y: colTop - priceH / 2, width: priceWidth, height: priceH, radius: priceH / 2, color: COLOR.maroon });
    const priceStartX = cx + colWidth / 2 - (rupeeWidth + digitsWidth) / 2;
    page.drawText("₹", { x: priceStartX, y: colTop - priceH / 2 + 14, size: rupeeSize, font: fonts.sansBold, color: COLOR.white });
    page.drawText(priceDigits, { x: priceStartX + rupeeWidth, y: colTop - priceH / 2 + 13, size: digitsSize, font: fonts.heading, color: COLOR.white });

    drawRoundedRect(page, { x: cx + 12, y: btnY, width: colWidth - 24, height: btnH, radius: btnH / 2, color: COLOR.maroon });
    const btnLabel = "CLICK NOW";
    page.drawText(btnLabel, {
      x: cx + colWidth / 2 - fonts.sansBold.widthOfTextAtSize(btnLabel, 11) / 2,
      y: btnY + btnH / 2 - 4,
      size: 11,
      font: fonts.sansBold,
      color: COLOR.white,
    });
  });

  drawFooterPill(page, fonts, data.brand);
}

/** Page 13 (reference) — social follow icons: filled maroon circle + white glyph + "CLICK ME" pill. */
function drawConnectPage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
  drawPageChrome(page, fonts, assets, { title: "Connect With Me", pageNumber, totalPages, brand: data.brand });

  const centerX = PAGE_WIDTH / 2;
  const subtitle = "FOLLOW FOR DAILY WISDOM, TIPS, AND INSPIRATION";
  page.drawText(subtitle, {
    x: centerX - fonts.sansBold.widthOfTextAtSize(subtitle, 11) / 2,
    y: PAGE_HEIGHT - 210,
    size: 11,
    font: fonts.sansBold,
    color: COLOR.maroonDark,
  });

  // Real extracted icons (white glyph, transparent background) drawn on a filled maroon
  // circle — matches the reference exactly. Order: Instagram, LinkedIn, YouTube, Facebook.
  const platforms: { image: PDFImage }[] = [
    { image: assets.socialInstagram },
    { image: assets.socialLinkedin },
    { image: assets.socialYoutube },
    { image: assets.socialFacebook },
  ];
  const colXs = [centerX - 155, centerX + 155];
  const rowYs = [PAGE_HEIGHT - 300, PAGE_HEIGHT - 430];
  let idx = 0;
  rowYs.forEach((ry) => {
    colXs.forEach((cx) => {
      const { image } = platforms[idx++];
      page.drawCircle({ x: cx, y: ry, size: 34, color: COLOR.maroon });
      const iconW = 30;
      const iconH = (image.height / image.width) * iconW;
      page.drawImage(image, { x: cx - iconW / 2, y: ry - iconH / 2, width: iconW, height: iconH });

      const btnW = 96;
      const btnH = 26;
      drawRoundedRect(page, { x: cx - btnW / 2, y: ry - 60, width: btnW, height: btnH, radius: btnH / 2, color: COLOR.maroon });
      const btnLabel = "CLICK ME";
      page.drawText(btnLabel, { x: cx - fonts.sansBold.widthOfTextAtSize(btnLabel, 9.5) / 2, y: ry - 60 + btnH / 2 - 3.4, size: 9.5, font: fonts.sansBold, color: COLOR.white });
    });
  });

  const closingY = PAGE_HEIGHT - 500;
  ["STAY CONNECTED FOR", "ONGOING GUIDANCE & SUPPORT"].forEach((line, i) => {
    page.drawText(line, { x: centerX - fonts.sansBold.widthOfTextAtSize(line, 13) / 2, y: closingY - i * 20, size: 13, font: fonts.sansBold, color: COLOR.maroonDark });
  });
}

/** Page 15 (reference) — minimal logo-only back cover, plus the internal report ID for support lookups. */
function drawBackCoverPage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>) {
  drawPageBackground(page, assets);
  const centerX = PAGE_WIDTH / 2;

  const logoDims = assets.logo.scale(0.5);
  page.drawImage(assets.logo, {
    x: centerX - logoDims.width / 2,
    y: PAGE_HEIGHT / 2 - logoDims.height / 2 + 30,
    width: logoDims.width,
    height: logoDims.height,
  });

  drawFooterPill(page, fonts, data.brand);
  const reportIdText = `Report ID: ${data.reportId}`;
  page.drawText(reportIdText, {
    x: centerX - fonts.sans.widthOfTextAtSize(reportIdText, 8) / 2,
    y: 20,
    size: 8,
    font: fonts.sans,
    color: COLOR.muted,
  });
}

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
 const [
    backgroundBytes,
    logoBytes,
    loshuGridBytes,
    starIconBytes,
    handsPrayingBytes,
    socialInstagramBytes,
    socialLinkedinBytes,
    socialYoutubeBytes,
    socialFacebookBytes,
    offerIconPenBytes,
    offerIconDigitsBytes,
    quicksandRegularBytes,
    quicksandBoldBytes,
    cinzelDecorativeBoldBytes,
    cardoRegularBytes,
  ] = await Promise.all([
    fetchAssetBytes(ASSET_PATHS.background),
    fetchAssetBytes(ASSET_PATHS.logo),
    fetchAssetBytes(ASSET_PATHS.loshuGrid),
    fetchAssetBytes(ASSET_PATHS.starIcon),
    fetchAssetBytes(ASSET_PATHS.handsPraying),
    fetchAssetBytes(ASSET_PATHS.socialInstagram),
    fetchAssetBytes(ASSET_PATHS.socialLinkedin),
    fetchAssetBytes(ASSET_PATHS.socialYoutube),
    fetchAssetBytes(ASSET_PATHS.socialFacebook),
    fetchAssetBytes(ASSET_PATHS.offerIconPen),
    fetchAssetBytes(ASSET_PATHS.offerIconDigits),
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
    handsPraying: await pdfDoc.embedPng(handsPrayingBytes),
    socialInstagram: await pdfDoc.embedPng(socialInstagramBytes),
    socialLinkedin: await pdfDoc.embedPng(socialLinkedinBytes),
    socialYoutube: await pdfDoc.embedPng(socialYoutubeBytes),
    socialFacebook: await pdfDoc.embedPng(socialFacebookBytes),
    offerIconPen: await pdfDoc.embedPng(offerIconPenBytes),
    offerIconDigits: await pdfDoc.embedPng(offerIconDigitsBytes),
  };

  const fonts: Fonts = {
    sans: await pdfDoc.embedFont(quicksandRegularBytes),
    sansBold: await pdfDoc.embedFont(quicksandBoldBytes),
    heading: await pdfDoc.embedFont(cinzelDecorativeBoldBytes),
    quote: await pdfDoc.embedFont(cardoRegularBytes),
  };

  const TOTAL_PAGES = 15;
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
  // 11. Why This Is Critical — shows the actual matched HR/OA/NR rule
  drawWhyCriticalPage(addPage(), fonts, assets, data, { ruleId: matchedRuleId, verdict, isFallback }, 11, TOTAL_PAGES);
  // 12. Pricing / upsell offers
  drawPricingPage(addPage(), fonts, assets, data, 12, TOTAL_PAGES);
  // 13. Connect With Me (social)
  drawConnectPage(addPage(), fonts, assets, data, 13, TOTAL_PAGES);
  // 14. Services Offered
  drawServicesPage(addPage(), fonts, assets, data, 14, TOTAL_PAGES);
  // 15. Back cover
  drawBackCoverPage(addPage(), fonts, assets, data);

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
