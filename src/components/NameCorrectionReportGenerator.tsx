/**
 * NameCorrectionReportGenerator.tsx
 * -----------------------------------------------------------------------
 * Ankshaastra-branded Name Correction Report PDF generator.
 *
 * ARCHITECTURE NOTE: this deliberately mirrors NameCheckReportGenerator.tsx
 * almost line-for-line — same pdf-lib approach (no Puppeteer/HTML anywhere
 * in this codebase), same helper functions (wrapText, drawWrappedText,
 * drawBulletList, drawRoundedRect, drawMaroonBanner-style pattern, etc.),
 * same CANVA_SCALE/TYPE/px() sizing system. Only three things differ:
 *   1. COLOR — dark-navy + gold instead of blush + maroon (see below).
 *   2. ASSET_PATHS — a new asset folder (see NEXT STEP note at the bottom).
 *   3. Content source — our new rule-engine/content-blocks under
 *      src/lib/baby-reports/name-correction/ and src/lib/baby-reports/shared/
 *      instead of src/lib/name-check/.
 * Keeping the architecture identical means any future layout fix made in
 * one generator can be ported to the others (Perfect Baby Name, Complete
 * Blueprint) with the same mechanical diff.
 *
 * THIS FILE IMPLEMENTS: Cover, Index, and Personal Info + Current Name
 * Analysis pages as the working pattern (enough to generate a real,
 * correctly-themed PDF end to end). The remaining pages (First Letter
 * Significance, New Name Recommendation, Loshu Grid & Rajyog, FAQ, Action
 * Plan, Agreement, Connect, Closing) follow the EXACT SAME pattern as the
 * equivalent pages in NameCheckReportGenerator.tsx — copy the matching
 * draw*Page() function, swap its content source, done.
 * -----------------------------------------------------------------------
 */

import { PDFDocument, PDFPage, PDFFont, PDFImage, rgb, RGB, PDFString, PDFName } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

import { computeFacts, matchRule, getRuleBlock, type NameCorrectionInput } from "@/lib/baby-reports/name-correction/rule-engine";
import type { Verdict } from "@/lib/baby-reports/name-correction/hr-oa-nr-blocks";
import { getLetterBlock } from "@/lib/baby-reports/shared/first-letter-index";
import { buildStandardLoShuGrid } from "@/lib/baby-reports/shared/loshu-grid";
import { evaluateAllRajyogs } from "@/lib/baby-reports/shared/rajyog";

export interface NameCorrectionReportInput {
  reportId: string;
  customerName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  generatedDate?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  isMiddleNameFatherHusband?: boolean;
  brand?: Partial<BrandConfig>;
  /** Admin correction — same override pattern as the Name Check report. */
  contentOverride?: Partial<NameCorrectionReportContent>;
}

/**
 * Mirrors NameCheckReportContent's shape/purpose exactly — every computed
 * number + paragraph in one editable, serialisable object, stored on
 * `name_correction_reports.content_overrides`.
 */
export interface NameCorrectionReportContent {
  mulank: number;
  bhagyank: number;
  firstNameNumber: number;
  fullNameNumber: number;
  fullNameCompound: number;
  compoundTier: "excellent" | "good" | "neutral" | "conditional" | "avoid";
  verdict: Verdict;
  matchedRuleId: string;
  isFallback: boolean;
  /** HR/OA/NR rule paragraphs, minus the closing line. */
  verdictBullets: string[];
  /** Closing verdict-badge line. */
  verdictNote: string;
}

export function computeNameCorrectionReportContent(
  input: Pick<NameCorrectionReportInput, "customerName" | "dob" | "firstName" | "middleName" | "lastName" | "isMiddleNameFatherHusband">
): NameCorrectionReportContent {
  const split = splitName(input.customerName);
  const firstName = input.firstName ?? split.first;
  const middleName = input.middleName ?? split.middle;
  const lastName = input.lastName ?? split.last;

  const dobDate = new Date(input.dob);
  const middleNameForNumerology = input.isMiddleNameFatherHusband === true ? "" : middleName;
  const fullName = [firstName, middleNameForNumerology, lastName].filter(Boolean).join(" ").trim();

  const engineInput: NameCorrectionInput = {
    dob: { day: dobDate.getDate(), month: dobDate.getMonth() + 1, year: dobDate.getFullYear() },
    firstName,
    fullName,
    // TODO: client confirmed this is a per-profile judgment call for the
    // Rajyog check — wire up wherever that determination actually gets
    // made for this report; defaulting false is the safe/conservative
    // choice in the meantime (never over-claims a Rajyog completion).
    isTwoFavorableForProfile: false,
  };

  const facts = computeFacts(engineInput);
  const match = matchRule(facts);
  const rule = getRuleBlock(match.ruleId);

  const rawParagraphs = rule?.paragraphs ?? [
    "Name correction guidance could not be determined for this combination — please review this report manually before sending it to the customer.",
  ];
  const verdictBullets = rawParagraphs.length > 1 ? rawParagraphs.slice(0, -1) : rawParagraphs;
  const verdictNote = rawParagraphs.length > 1 ? rawParagraphs[rawParagraphs.length - 1] : rawParagraphs[0];

  return {
    mulank: facts.mulank,
    bhagyank: facts.bhagyank,
    firstNameNumber: facts.firstNameNumber,
    fullNameNumber: facts.fullNameNumber,
    fullNameCompound: facts.fullNameCompoundNumber,
    compoundTier: facts.compoundTier,
    verdict: match.verdict,
    matchedRuleId: match.ruleId,
    isFallback: match.isFallback,
    verdictBullets,
    verdictNote,
  };
}

type ResolvedInput = Omit<Required<NameCorrectionReportInput>, "brand"> & { brand: BrandConfig };

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

function splitName(fullName: string): { first: string; middle: string; last: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "", middle: "", last: "" };
  if (parts.length === 1) return { first: parts[0], middle: "", last: "" };
  if (parts.length === 2) return { first: parts[0], middle: "", last: parts[1] };
  return { first: parts[0], middle: parts.slice(1, -1).join(" "), last: parts[parts.length - 1] };
}

const PAGE_WIDTH = 595.28; // A4 portrait, points
const PAGE_HEIGHT = 841.89;
const CANVA_SCALE = PAGE_WIDTH / 1860;
const px = (v: number) => Math.round(v * CANVA_SCALE * 10) / 10;

const TYPE = {
  bodySize: px(45),
  lineGap: 5,
  bulletGap: 14,
  bulletDotOffsetRatio: 0.32,
  cardPadding: 46,
};

// ---------------------------------------------------------------------------
// COLOR — the one deliberate departure from NameCheckReportGenerator.tsx.
// Dark navy + gold, matching the client's sample PDF
// (Prashanth_Name_Correction_Report_Ankshaastra.pdf), replacing that file's
// blush + maroon palette. Every COLOR.* name below is kept IDENTICAL to the
// Name Check generator so every draw*() helper function can be copied over
// verbatim with zero changes.
// ---------------------------------------------------------------------------
const COLOR = {
  blush: rgb(0.039, 0.055, 0.137), // page background — dark navy (was light blush)
  blushPanel: rgb(0.051, 0.071, 0.188), // card fill — slightly lighter navy (was light pink panel)
  maroon: rgb(0.788, 0.663, 0.38), // primary accent — gold (was maroon)
  maroonDark: rgb(0.65, 0.54, 0.32), // secondary/softer gold
  ink: rgb(0.94, 0.93, 0.89), // body text — warm off-white (was dark maroon text)
  muted: rgb(0.72, 0.70, 0.65), // muted/caption text
  white: rgb(1, 1, 1),
  cream: rgb(0.94, 0.93, 0.89),
  green: rgb(0.3, 0.65, 0.35),
  red: rgb(0.75, 0.3, 0.3),
  black: rgb(0.9, 0.9, 0.9), // "black" text on a dark page reads as near-white
};

interface Fonts {
  sans: PDFFont;
  sansBold: PDFFont;
  heading: PDFFont;
  quote: PDFFont;
}

// NEXT STEP: these assets don't exist yet. Reuse whatever is reusable
// (fonts, logo, social icons — those aren't theme-specific) directly from
// /public/name-check-assets/, and only create NEW navy/gold versions of the
// ones that are visually theme-specific: background-border (needs a navy+
// gold bordered version instead of the blush one) and loshu-turtle-grid (if
// its artwork itself carries the blush palette).
const ASSET_PATHS = {
  background: "/name-correction-assets/background-border.png",
  backCoverBackground: "/name-correction-assets/background-back-cover.jpeg",
  logo: "/name-check-assets/logo-ankshaastra.png", // reused — not theme-specific
  loshuGrid: "/name-correction-assets/loshu-turtle-grid.png",
  handsPraying: "/name-check-assets/praying-hands.png", // reused
  socialInstagram: "/name-check-assets/social-instagram.png", // reused
  socialLinkedin: "/name-check-assets/social-linkedin.png", // reused
  socialYoutube: "/name-check-assets/social-youtube.png", // reused
  socialFacebook: "/name-check-assets/social-facebook.png", // reused
  fonts: {
    quicksandRegular: "/name-check-assets/fonts/Quicksand-Regular.ttf", // reused
    quicksandBold: "/name-check-assets/fonts/Quicksand-Bold.ttf", // reused
    cinzelDecorativeBold: "/name-check-assets/fonts/CinzelDecorative-Bold.ttf", // reused
    cardoRegular: "/name-check-assets/fonts/Cardo-Regular.ttf", // reused
  },
};

async function fetchAssetBytes(path: string): Promise<Uint8Array> {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Name Correction PDF: failed to fetch design asset "${path}" (${res.status}). Check it was uploaded to /public${path}.`);
  }
  return new Uint8Array(await res.arrayBuffer());
}

// --- Shared drawing primitives — copied verbatim from NameCheckReportGenerator.tsx ---
// (wrapText, drawWrappedText, drawBulletList, drawRoundedRect, drawWrappedTextCentered,
// drawStarGlyph, addLinkAnnotation are pure layout helpers with no color/content baked
// in — identical here. Omitted from this excerpt only for length; copy them unchanged
// from NameCheckReportGenerator.tsx when assembling the final file.)

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

function drawBulletList(
  page: PDFPage,
  items: string[],
  opts: { x: number; y: number; font: PDFFont; size: number; maxWidth: number; lineHeight: number; gap: number; color: RGB }
): number {
  let y = opts.y;
  const dotY = opts.size * TYPE.bulletDotOffsetRatio;
  items.forEach((item) => {
    page.drawCircle({ x: opts.x + 3, y: y + dotY, size: 2.4, color: COLOR.maroon });
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

function roundedRectSvgPath(width: number, height: number, radius: number): string {
  const r = Math.min(radius, width / 2, height / 2);
  return [
    `M ${r} 0`, `H ${width - r}`, `A ${r} ${r} 0 0 1 ${width} ${r}`, `V ${height - r}`,
    `A ${r} ${r} 0 0 1 ${width - r} ${height}`, `H ${r}`, `A ${r} ${r} 0 0 1 0 ${height - r}`,
    `V ${r}`, `A ${r} ${r} 0 0 1 ${r} 0`, `Z`,
  ].join(" ");
}

function drawRoundedRect(
  page: PDFPage,
  opts: { x: number; y: number; width: number; height: number; radius: number; color?: RGB; borderColor?: RGB; borderWidth?: number }
) {
  page.drawSvgPath(roundedRectSvgPath(opts.width, opts.height, opts.radius), {
    x: opts.x, y: opts.y + opts.height, scale: 1,
    color: opts.color, borderColor: opts.borderColor, borderWidth: opts.borderWidth,
  });
}

function drawStarGlyph(page: PDFPage, cx: number, cy: number, r: number, color: RGB) {
  const path = `M ${r} 0 L ${r * 1.32} ${r * 0.68} L ${r * 2} ${r} L ${r * 1.32} ${r * 1.32} L ${r} ${r * 2} L ${r * 0.68} ${r * 1.32} L 0 ${r} L ${r * 0.68} ${r * 0.68} Z`;
  page.drawSvgPath(path, { x: cx - r, y: cy + r, color });
}

function drawWrappedTextCentered(
  page: PDFPage,
  text: string,
  opts: { centerX: number; y: number; font: PDFFont; size: number; maxWidth: number; lineHeight: number; color: RGB }
): number {
  const lines = wrapText(text, opts.font, opts.size, opts.maxWidth);
  let cursorY = opts.y;
  for (const line of lines) {
    page.drawText(line, { x: opts.centerX - opts.font.widthOfTextAtSize(line, opts.size) / 2, y: cursorY, size: opts.size, font: opts.font, color: opts.color });
    cursorY -= opts.lineHeight;
  }
  return cursorY;
}

function drawPageBackground(page: PDFPage, assets: Assets) {
  page.drawImage(assets.background, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });
}

function drawContentBox(page: PDFPage, opts: { x: number; y: number; width: number; height: number }): number {
  drawRoundedRect(page, {
    x: opts.x, y: opts.y - opts.height, width: opts.width, height: opts.height,
    radius: 18, color: COLOR.blushPanel, borderColor: COLOR.maroon, borderWidth: 1,
  });
  return opts.y;
}

/** Gold pill banner — same role as drawMaroonBanner in the Name Check generator, renamed for clarity in this theme. */
function drawGoldBanner(page: PDFPage, fonts: Fonts, text: string, boxX: number, boxTopY: number, boxWidth: number, height = 34) {
  const label = text.toUpperCase();
  const size = px(45);
  const textWidth = fonts.sansBold.widthOfTextAtSize(label, size);
  const width = Math.min(boxWidth - 16, textWidth + 56);
  const x = boxX + boxWidth / 2 - width / 2;
  const y = boxTopY - height / 2;
  drawRoundedRect(page, { x, y, width, height, radius: height / 2, color: COLOR.maroon });
  // Banner text renders dark navy on gold (not white-on-maroon) for contrast.
  page.drawText(label, {
    x: x + width / 2 - textWidth / 2,
    y: y + height / 2 - size * 0.35,
    size, font: fonts.sansBold, color: COLOR.blush,
  });
}

function drawFooterPill(page: PDFPage, fonts: Fonts, brand: BrandConfig) {
  const centerX = PAGE_WIDTH / 2;
  const pill = `WWW.${brand.website.replace(/^www\./i, "").toUpperCase()}`;
  const size = px(45);
  const pillWidth = fonts.sansBold.widthOfTextAtSize(pill, size) + 44;
  const height = size + 18;
  drawRoundedRect(page, { x: centerX - pillWidth / 2, y: 40, width: pillWidth, height, radius: height / 2, color: COLOR.maroon });
  page.drawText(pill, {
    x: centerX - fonts.sansBold.widthOfTextAtSize(pill, size) / 2,
    y: 40 + height / 2 - size * 0.35,
    size, font: fonts.sansBold, color: COLOR.blush,
  });
}

function drawDataTable(page: PDFPage, fonts: Fonts, rows: [string, string][], opts: { x: number; y: number; width: number; rowHeight?: number }): number {
  const size = px(45);
  const rowHeight = opts.rowHeight ?? Math.max(36, size + 26);
  const totalHeight = rowHeight * rows.length;
  const borderTint = rgb(0.25, 0.22, 0.16);
  const labelColCenter = opts.x + opts.width / 4;
  const valueColCenter = opts.x + (opts.width * 3) / 4;

  page.drawRectangle({ x: opts.x, y: opts.y - totalHeight, width: opts.width, height: totalHeight, color: COLOR.blushPanel, borderColor: COLOR.maroon, borderWidth: 1 });
  let y = opts.y;
  rows.forEach(([label, value], i) => {
    if (i > 0) page.drawLine({ start: { x: opts.x, y }, end: { x: opts.x + opts.width, y }, thickness: 0.5, color: borderTint });
    page.drawText(label, { x: labelColCenter - fonts.sansBold.widthOfTextAtSize(label, size) / 2, y: y - rowHeight / 2 - size * 0.35, size, font: fonts.sansBold, color: COLOR.maroonDark });
    const displayText = value || "—";
    page.drawText(displayText, { x: valueColCenter - fonts.sansBold.widthOfTextAtSize(displayText, size) / 2, y: y - rowHeight / 2 - size * 0.35, size, font: fonts.sansBold, color: COLOR.ink });
    page.drawLine({ start: { x: opts.x + opts.width / 2, y }, end: { x: opts.x + opts.width / 2, y: y - rowHeight }, thickness: 0.5, color: borderTint });
    y -= rowHeight;
  });
  return opts.y - totalHeight;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
}

interface Assets {
  background: PDFImage;
  backCoverBackground: PDFImage;
  logo: PDFImage;
  loshuGrid: PDFImage;
  handsPraying: PDFImage;
  socialInstagram: PDFImage;
  socialLinkedin: PDFImage;
  socialYoutube: PDFImage;
  socialFacebook: PDFImage;
}

/* ------------------------------------------------------------------ */
/*  Page builders — Cover, Index, Personal Info (the working pattern)   */
/* ------------------------------------------------------------------ */

function drawCoverPage(page: PDFPage, fonts: Fonts, data: ResolvedInput, assets: Assets) {
  drawPageBackground(page, assets);
  const centerX = PAGE_WIDTH / 2;

  const LOGO_TARGET_WIDTH = 345;
  const logoDims = assets.logo.scale(LOGO_TARGET_WIDTH / assets.logo.width);
  let y = PAGE_HEIGHT - 10;
  page.drawImage(assets.logo, { x: centerX - logoDims.width / 2, y: y - logoDims.height, width: logoDims.width, height: logoDims.height });
  y -= logoDims.height + 24;

  const GRID_TARGET_WIDTH = 400;
  const gridDims = assets.loshuGrid.scale(GRID_TARGET_WIDTH / assets.loshuGrid.width);
  page.drawImage(assets.loshuGrid, { x: centerX - gridDims.width / 2, y: y - gridDims.height, width: gridDims.width, height: gridDims.height });
  y -= gridDims.height + 13;

  const titleSize = px(110);
  ["NAME CORRECTION", "REPORT"].forEach((line) => {
    page.drawText(line, { x: centerX - fonts.heading.widthOfTextAtSize(line, titleSize) / 2, y, size: titleSize, font: fonts.heading, color: COLOR.maroon });
    y -= titleSize + 18;
  });
  y -= 24;

  const bylineSize = px(100);
  const byline = data.brand.numerologistName.replace(/\s+Ji$/i, "").toUpperCase();
  page.drawText(byline, { x: centerX - fonts.heading.widthOfTextAtSize(byline, bylineSize) / 2, y, size: bylineSize, font: fonts.heading, color: COLOR.maroonDark });

  y -= 24;
  page.drawLine({ start: { x: centerX - 112, y }, end: { x: centerX - 11, y }, thickness: 1, color: COLOR.maroon });
  page.drawLine({ start: { x: centerX + 11, y }, end: { x: centerX + 112, y }, thickness: 1, color: COLOR.maroon });
  drawStarGlyph(page, centerX, y, 6, COLOR.maroon);

  drawFooterPill(page, fonts, data.brand);
}

function drawIndexPage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput) {
  drawPageBackground(page, assets);
  const centerX = PAGE_WIDTH / 2;

  const titleSize = px(100);
  page.drawText("INDEX", { x: centerX - fonts.heading.widthOfTextAtSize("INDEX", titleSize) / 2, y: PAGE_HEIGHT - 96, size: titleSize, font: fonts.heading, color: COLOR.maroon });
  const dividerY = PAGE_HEIGHT - 96 - titleSize + 10;
  page.drawLine({ start: { x: centerX - 165, y: dividerY }, end: { x: centerX - 14, y: dividerY }, thickness: 1, color: COLOR.maroon });
  page.drawLine({ start: { x: centerX + 14, y: dividerY }, end: { x: centerX + 165, y: dividerY }, thickness: 1, color: COLOR.maroon });
  drawStarGlyph(page, centerX, dividerY, 6, COLOR.maroon);
  drawFooterPill(page, fonts, data.brand);

  // Matches the sample PDF's section order for this report.
  const rows: { no: string; title: string; items: string[] }[] = [
    { no: "01", title: "Personal Information", items: ["Your Personal Profile"] },
    { no: "02", title: "Name Numerology", items: ["Chaldean Chart", "How Numbers Are Calculated"] },
    { no: "03", title: "Current Name Analysis", items: ["First Name Number", "Full Name Number", "Full Name Compound Number"] },
    { no: "04", title: "First Letter Significance", items: ["Your First Letter's Meaning & Traits"] },
    { no: "05", title: "New Name Recommendation", items: ["Option 1 vs Option 2", "My Professional Recommendation"] },
    { no: "06", title: "Loshu Grid and Rajyog Analysis", items: ["Your Personal Loshu Grid", "Your Personal Rajyog Analysis"] },
    { no: "07", title: "Frequently Asked Questions", items: ["Common Questions About Name Correction"] },
    { no: "08", title: "Your Action Plan", items: ["Commitment Declaration"] },
  ];

  const numSize = px(160);
  const bodySize = px(45);
  let y = dividerY - 60;
  const tableX = 44;
  const tableWidth = PAGE_WIDTH - 88;
  const numColW = 84;
  const titleColW = 170;
  const titleInnerWidth = titleColW - 20;
  const itemsTextX = tableX + numColW + titleColW + 10;
  const itemsInnerWidth = tableX + tableWidth - 10 - itemsTextX;

  rows.forEach((row) => {
    const titleLines = wrapText(row.title.toUpperCase(), fonts.sansBold, bodySize, titleInnerWidth);
    const itemLineTotal = row.items.reduce((sum, item) => sum + wrapText(`• ${item}`, fonts.sans, bodySize, itemsInnerWidth).length, 0);
    const tallerLineCount = Math.max(titleLines.length, itemLineTotal);
    const rowHeight = Math.max(numSize + 20, 26 + tallerLineCount * (bodySize + 6) + 16);

    page.drawRectangle({ x: tableX, y: y - rowHeight, width: tableWidth, height: rowHeight, borderColor: COLOR.maroon, borderWidth: 0.75 });
    page.drawLine({ start: { x: tableX + numColW, y }, end: { x: tableX + numColW, y: y - rowHeight }, thickness: 0.5, color: COLOR.maroon });
    page.drawLine({ start: { x: tableX + numColW + titleColW, y }, end: { x: tableX + numColW + titleColW, y: y - rowHeight }, thickness: 0.5, color: COLOR.maroon });

    const titleBlockHeight = titleLines.length * (bodySize + 6);
    const titleBlockCenterY = y - 10 - titleBlockHeight / 2;
    page.drawText(row.no, { x: tableX + numColW / 2 - fonts.heading.widthOfTextAtSize(row.no, numSize) / 2, y: titleBlockCenterY - numSize * 0.32, size: numSize, font: fonts.heading, color: COLOR.maroon });

    let titleY = y - bodySize - 10;
    titleLines.forEach((line) => {
      page.drawText(line, { x: tableX + numColW + 10, y: titleY, size: bodySize, font: fonts.sansBold, color: COLOR.maroonDark });
      titleY -= bodySize + 6;
    });
    let itemY = y - bodySize - 10;
    row.items.forEach((item) => {
      itemY = drawWrappedText(page, `• ${item}`, { x: itemsTextX, y: itemY, font: fonts.sans, size: bodySize, maxWidth: itemsInnerWidth, lineHeight: bodySize + 6, color: COLOR.ink });
    });
    y -= rowHeight;
  });
}

function drawPersonalInfoPage(
  page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput,
  numbers: { mulank: number; bhagyank: number; firstNameNumber: number; fullNameNumber: number; fullNameCompound: number },
) {
  drawPageBackground(page, assets);
  const centerX = PAGE_WIDTH / 2;

  const titleSize = px(80);
  const title = "Your Current Name Analysis";
  page.drawText(title, { x: centerX - fonts.heading.widthOfTextAtSize(title, titleSize) / 2, y: PAGE_HEIGHT - 96, size: titleSize, font: fonts.heading, color: COLOR.maroon });
  const dividerY = PAGE_HEIGHT - 96 - titleSize + 10;
  page.drawLine({ start: { x: centerX - 165, y: dividerY }, end: { x: centerX - 14, y: dividerY }, thickness: 1, color: COLOR.maroon });
  page.drawLine({ start: { x: centerX + 14, y: dividerY }, end: { x: centerX + 165, y: dividerY }, thickness: 1, color: COLOR.maroon });
  drawStarGlyph(page, centerX, dividerY, 6, COLOR.maroon);
  drawFooterPill(page, fonts, data.brand);

  const boxX = 50;
  const boxWidth = PAGE_WIDTH - 100;
  const bannerSize = px(45);
  const bannerY = dividerY - 90;
  const bannerHeight = bannerSize + 26;
  drawGoldBanner(page, fonts, "Personal Information", boxX, bannerY, boxWidth, bannerHeight);

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

  drawDataTable(page, fonts, rows, { x: boxX, y: bannerY - bannerHeight - 12, width: boxWidth });
}

/** The core verdict page — same role as drawWhyCriticalPage() in the Name Check generator. */
function drawVerdictPage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput, content: NameCorrectionReportContent) {
  drawPageBackground(page, assets);
  const centerX = PAGE_WIDTH / 2;

  const titleSize = px(80);
  const title = "Why This Is Critical";
  page.drawText(title, { x: centerX - fonts.heading.widthOfTextAtSize(title, titleSize) / 2, y: PAGE_HEIGHT - 96, size: titleSize, font: fonts.heading, color: COLOR.maroon });
  const dividerY = PAGE_HEIGHT - 96 - titleSize + 10;
  page.drawLine({ start: { x: centerX - 165, y: dividerY }, end: { x: centerX - 14, y: dividerY }, thickness: 1, color: COLOR.maroon });
  page.drawLine({ start: { x: centerX + 14, y: dividerY }, end: { x: centerX + 165, y: dividerY }, thickness: 1, color: COLOR.maroon });
  drawStarGlyph(page, centerX, dividerY, 6, COLOR.maroon);
  drawFooterPill(page, fonts, data.brand);

  const boxX = 32;
  const boxWidth = PAGE_WIDTH - 64;
  const bodySize = TYPE.bodySize;
  const lineHeight = bodySize + TYPE.lineGap + 0.5;
  const boxTop = dividerY - 60;
  const innerWidth = boxWidth - 36;

  drawContentBox(page, { x: boxX, y: boxTop, width: boxWidth, height: 280 });
  drawGoldBanner(page, fonts, `Verdict: ${content.matchedRuleId}`, boxX, boxTop, boxWidth);
  drawBulletList(page, content.verdictBullets, { x: 62, y: boxTop - TYPE.cardPadding, font: fonts.sans, size: bodySize, maxWidth: innerWidth, lineHeight, gap: TYPE.bulletGap, color: COLOR.ink });

  const noteTop = boxTop - 280 - 40;
  const noteSize = 13;
  const noteLineHeight = noteSize + 7;
  const noteInnerWidth = boxWidth - 60;
  const noteLines = wrapText(content.verdictNote, fonts.sans, noteSize, noteInnerWidth);
  const noteHeight = Math.max(84, 26 + noteLines.length * noteLineHeight + 22);

  drawRoundedRect(page, { x: boxX, y: noteTop - noteHeight, width: boxWidth, height: noteHeight, radius: 18, color: COLOR.maroon });
  drawWrappedTextCentered(page, content.verdictNote, {
    centerX: boxX + boxWidth / 2, y: noteTop - 26 - (noteLineHeight - 6),
    font: fonts.sans, size: noteSize, maxWidth: noteInnerWidth, lineHeight: noteLineHeight, color: COLOR.blush,
  });
}

/* ------------------------------------------------------------------ */
/*  Main entry point                                                    */
/* ------------------------------------------------------------------ */

export async function generateNameCorrectionReportPdf(input: NameCorrectionReportInput): Promise<Uint8Array> {
  const split = splitName(input.customerName);
  const data: ResolvedInput = {
    generatedDate: new Date().toISOString(),
    firstName: split.first,
    middleName: split.middle,
    lastName: split.last,
    isMiddleNameFatherHusband: false,
    ...input,
    brand: { ...DEFAULT_BRAND, ...input.brand },
    contentOverride: input.contentOverride ?? {},
  };

  const computed = computeNameCorrectionReportContent(data);
  const content: NameCorrectionReportContent = { ...computed, ...input.contentOverride };

  if (content.isFallback) {
    console.warn(`Name Correction PDF: rule engine hit FALLBACK for "${data.customerName}" (report ${data.reportId}) — matched ${content.matchedRuleId} by default. Recommend manual review before sending to customer.`);
  }

  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`Name Correction Report - ${data.customerName}`);
  pdfDoc.setSubject("Chaldean Numerology Name Correction Report");
  pdfDoc.setProducer(data.brand.companyName);
  pdfDoc.setCreator(data.brand.companyName);
  pdfDoc.registerFontkit(fontkit);

  const [
    backgroundBytes, logoBytes, loshuGridBytes, handsPrayingBytes,
    socialInstagramBytes, socialLinkedinBytes, socialYoutubeBytes, socialFacebookBytes,
    quicksandRegularBytes, quicksandBoldBytes, cinzelDecorativeBoldBytes, cardoRegularBytes,
  ] = await Promise.all([
    fetchAssetBytes(ASSET_PATHS.background),
    fetchAssetBytes(ASSET_PATHS.logo),
    fetchAssetBytes(ASSET_PATHS.loshuGrid),
    fetchAssetBytes(ASSET_PATHS.handsPraying),
    fetchAssetBytes(ASSET_PATHS.socialInstagram),
    fetchAssetBytes(ASSET_PATHS.socialLinkedin),
    fetchAssetBytes(ASSET_PATHS.socialYoutube),
    fetchAssetBytes(ASSET_PATHS.socialFacebook),
    fetchAssetBytes(ASSET_PATHS.fonts.quicksandRegular),
    fetchAssetBytes(ASSET_PATHS.fonts.quicksandBold),
    fetchAssetBytes(ASSET_PATHS.fonts.cinzelDecorativeBold),
    fetchAssetBytes(ASSET_PATHS.fonts.cardoRegular),
  ]);

  const assets: Assets = {
    background: await pdfDoc.embedPng(backgroundBytes),
    backCoverBackground: await pdfDoc.embedPng(backgroundBytes), // TODO: swap for a real back-cover asset once designed
    logo: await pdfDoc.embedPng(logoBytes),
    loshuGrid: await pdfDoc.embedPng(loshuGridBytes),
    handsPraying: await pdfDoc.embedPng(handsPrayingBytes),
    socialInstagram: await pdfDoc.embedPng(socialInstagramBytes),
    socialLinkedin: await pdfDoc.embedPng(socialLinkedinBytes),
    socialYoutube: await pdfDoc.embedPng(socialYoutubeBytes),
    socialFacebook: await pdfDoc.embedPng(socialFacebookBytes),
  };

  const NO_LIGATURES = { features: { liga: false } } as const;
  const fonts: Fonts = {
    sans: await pdfDoc.embedFont(quicksandRegularBytes, NO_LIGATURES),
    sansBold: await pdfDoc.embedFont(quicksandBoldBytes, NO_LIGATURES),
    heading: await pdfDoc.embedFont(cinzelDecorativeBoldBytes, NO_LIGATURES),
    quote: await pdfDoc.embedFont(cardoRegularBytes, NO_LIGATURES),
  };

  const addPage = () => pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

  drawCoverPage(addPage(), fonts, data, assets);
  drawIndexPage(addPage(), fonts, assets, data);
  drawPersonalInfoPage(addPage(), fonts, assets, data, {
    mulank: content.mulank, bhagyank: content.bhagyank,
    firstNameNumber: content.firstNameNumber, fullNameNumber: content.fullNameNumber,
    fullNameCompound: content.fullNameCompound,
  });
  drawVerdictPage(addPage(), fonts, assets, data, content);

  // TODO — remaining pages, each following the exact pattern above (copy the
  // matching function from NameCheckReportGenerator.tsx, rename
  // drawMaroonBanner -> drawGoldBanner, keep every other helper call the
  // same):
  //   - First Letter Significance: pull from getLetterBlock(data.firstName[0])
  //     (src/lib/baby-reports/shared/first-letter-index.ts, already built)
  //   - New Name Recommendation: src/lib/baby-reports/shared/recommendation.ts
  //     (already built) — needs Option 1 / Option 2 input UI added to the
  //     admin form first, since this report compares two candidate names
  //   - Loshu Grid & Rajyog: buildStandardLoShuGrid() + evaluateAllRajyogs()
  //     (both already built in src/lib/baby-reports/shared/) — render the
  //     3x3 grid via toGridCells() the same way drawChaldeanSystemPage()
  //     renders its letter grid above
  //   - FAQ / Action Plan / Agreement / Connect / Closing: same static-content
  //     page patterns as drawServicesPage()/drawConnectPage()/drawBackCoverPage()
  //     in the Name Check generator — just swap the copy.

  return pdfDoc.save();
}

export function nameCorrectionReportPdfToBlob(bytes: Uint8Array): Blob {
  return new Blob([new Uint8Array(bytes).buffer], { type: "application/pdf" });
}

export function downloadNameCorrectionReportPdf(bytes: Uint8Array, filename: string) {
  const blob = nameCorrectionReportPdfToBlob(bytes);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
