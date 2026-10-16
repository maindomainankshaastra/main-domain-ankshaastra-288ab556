/**
 * NameCorrectionReportGenerator.tsx
 * -----------------------------------------------------------------------
 * Ankshaastra-branded Name Correction Report PDF generator (50 pages, A4).
 *
 * HOW THE 50 PAGES ARE BUILT
 *   - 32 pages are identical for every customer (cover, index, science of
 *     names, Chaldean chart, timeline, FAQ, agreement, closing, back cover…).
 *     They ship as full-page JPGs in /public/name-correction-assets/
 *     (static-pNN.jpg, NN = page number) and are dropped in as-is.
 *   - 18 pages change per customer and are drawn here with pdf-lib:
 *       4  Welcome note                 5  Numerological blueprint (profile)
 *      10  First Name Number           11  Full Name Number
 *      12  Full Name Compound Number   13  Why This Is Critical (HR/OA/NR)
 *      14-16 First Letter Significance 17-18 New Name options 1 & 2
 *      19  Recommendation level        20  Personal Loshu Grid
 *      21-23 Rajyog 1/2/3             24  Rajyog note
 *      38  Success mantra
 * -----------------------------------------------------------------------
 */

import { PDFDocument, PDFPage, PDFFont, PDFImage, rgb, RGB } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

import { computeFacts, matchRule, getRuleBlock, type NameCorrectionInput } from "@/lib/baby-reports/name-correction/rule-engine";
import type { Verdict } from "@/lib/baby-reports/name-correction/hr-oa-nr-blocks";
import { getLetterBlock, type LetterBlock } from "@/lib/baby-reports/shared/first-letter-index";
import { buildStandardLoShuGrid, toGridCells } from "@/lib/baby-reports/shared/loshu-grid";
import { evaluateAllRajyogs, type RajyogResult, type RajyogStatus } from "@/lib/baby-reports/shared/rajyog";
import { RECOMMENDATION_BLOCKS, pickRecommendationCase, type RecommendationCase } from "@/lib/baby-reports/shared/recommendation";
import { getFirstNameExplanation, getFullNameExplanation, getCompoundExplanation } from "@/lib/baby-reports/shared/number-explanations";
import { getRelation, type Relation } from "@/lib/name-check/friendship-table";
import { getCompoundTier, type CompoundTier } from "@/lib/name-check/compound-table";
import { buildLoShuGrid, isOverAmplified } from "@/lib/name-check/lo-shu";
import {
  chaldeanRawSum, getFirstNameNumber, getFullNameNumber, getFullNameCompoundNumber, isRestrictedNumber,
} from "@/lib/name-check/numerology";
import {
  FIRST_NAME_BLOCKS, FULL_NAME_BLOCKS, COMPOUND_BLOCKS, comboKey,
  LOSHU_OVERAMP_FIRST_NAME_BLOCK, LOSHU_OVERAMP_FULL_NAME_BLOCK,
} from "@/lib/name-check/content-blocks";

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
  /** Father's name, shown on the Personal Information page (falls back to the middle name when it is the father's/husband's). */
  fatherName?: string;
  /** The two candidate new names compared on the New Name Recommendation pages. */
  option1Name?: string;
  option2Name?: string;
  /** Per-profile call on whether 2 is favourable (feeds the Rajyog check). Defaults to false (never over-claims). */
  isTwoFavorableForProfile?: boolean;
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
  input: Pick<NameCorrectionReportInput, "customerName" | "dob" | "firstName" | "middleName" | "lastName" | "isMiddleNameFatherHusband" | "isTwoFavorableForProfile">
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
    isTwoFavorableForProfile: input.isTwoFavorableForProfile ?? false,
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


type ResolvedInput = Omit<Required<NameCorrectionReportInput>, "brand" | "option1Name" | "option2Name" | "isTwoFavorableForProfile"> & {
  brand: BrandConfig;
  option1Name: string;
  option2Name: string;
  isTwoFavorableForProfile: boolean;
};

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
const CENTER_X = PAGE_WIDTH / 2;
/** Convert a distance measured from the TOP of the page into a pdf-lib y coordinate. */
const T = (fromTop: number) => PAGE_HEIGHT - fromTop;

/** Navy + gold palette, sampled from the client's sample PDF. */
const COLOR = {
  bg: rgb(0.039, 0.055, 0.137),
  gold: rgb(0.788, 0.663, 0.38),
  goldDim: rgb(0.65, 0.54, 0.32),
  goldLine: rgb(0.55, 0.46, 0.27),
  ink: rgb(0.94, 0.93, 0.89),
  muted: rgb(0.72, 0.7, 0.65),
};

interface Fonts {
  sans: PDFFont;
  sansBold: PDFFont;
  heading: PDFFont;
  quote: PDFFont;
}

const ASSET_BASE = "/name-correction-assets";
const ASSET_PATHS = {
  background: `${ASSET_BASE}/background-border.png`,
  logo: `${ASSET_BASE}/logo-ankshaastra-gold-hd.png`,
  hands: `${ASSET_BASE}/icon-hands.png`,
  lotus: `${ASSET_BASE}/icon-lotus.png`,
  person: `${ASSET_BASE}/icon-person.png`,
  badgeWarning: `${ASSET_BASE}/badge-warning.png`,
  badgeFist: `${ASSET_BASE}/badge-fist.png`,
  badgeCrown: `${ASSET_BASE}/badge-crown.png`,
  badgeStar: `${ASSET_BASE}/badge-star.png`,
  fonts: {
    quicksandRegular: "/name-check-assets/fonts/Quicksand-Regular.ttf",
    quicksandBold: "/name-check-assets/fonts/Quicksand-Bold.ttf",
    cinzelDecorativeBold: "/name-check-assets/fonts/CinzelDecorative-Bold.ttf",
    cardoRegular: "/name-check-assets/fonts/Cardo-Regular.ttf",
  },
};

/**
 * The 32 pages of the report that are identical for every customer. They are
 * exported once from the client's Canva sample as full-page JPGs
 * (/public/name-correction-assets/static-pNN.jpg, NN = page number in the
 * 50-page report) and simply dropped in as full-bleed images.
 */
const STATIC_PAGE_NUMBERS = [
  1, 2, 3, 6, 7, 8, 9, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37,
  39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
];
const staticPagePath = (n: number) => `${ASSET_BASE}/static-p${String(n).padStart(2, "0")}.jpg`;

async function fetchAssetBytes(path: string): Promise<Uint8Array> {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Name Correction PDF: failed to fetch design asset "${path}" (${res.status}). Check it was uploaded to /public${path}.`);
  }
  return new Uint8Array(await res.arrayBuffer());
}

/* ------------------------------------------------------------------ */
/*  Generic layout helpers                                              */
/* ------------------------------------------------------------------ */

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
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

function textWidth(font: PDFFont, text: string, size: number) {
  return font.widthOfTextAtSize(text, size);
}

function drawCentered(page: PDFPage, text: string, opts: { y: number; font: PDFFont; size: number; color: RGB; centerX?: number }) {
  const cx = opts.centerX ?? CENTER_X;
  page.drawText(text, { x: cx - textWidth(opts.font, text, opts.size) / 2, y: opts.y, size: opts.size, font: opts.font, color: opts.color });
}

/** Wrapped paragraph; `justify` spreads the spaces of every line except the last, like the sample. */
function drawParagraph(
  page: PDFPage, text: string,
  opts: { x: number; y: number; font: PDFFont; size: number; maxWidth: number; lineHeight: number; color: RGB; justify?: boolean; align?: "left" | "center" },
): number {
  const lines = wrapText(text, opts.font, opts.size, opts.maxWidth);
  let y = opts.y;
  lines.forEach((line, i) => {
    const isLast = i === lines.length - 1;
    if (opts.justify && !isLast && line.includes(" ")) {
      const words = line.split(" ");
      const wordsWidth = words.reduce((s, w) => s + textWidth(opts.font, w, opts.size), 0);
      const gap = (opts.maxWidth - wordsWidth) / (words.length - 1);
      let x = opts.x;
      words.forEach((w) => {
        page.drawText(w, { x, y, size: opts.size, font: opts.font, color: opts.color });
        x += textWidth(opts.font, w, opts.size) + gap;
      });
    } else if (opts.align === "center") {
      page.drawText(line, { x: opts.x + opts.maxWidth / 2 - textWidth(opts.font, line, opts.size) / 2, y, size: opts.size, font: opts.font, color: opts.color });
    } else {
      page.drawText(line, { x: opts.x, y, size: opts.size, font: opts.font, color: opts.color });
    }
    y -= opts.lineHeight;
  });
  return y;
}

function paragraphHeight(text: string, font: PDFFont, size: number, maxWidth: number, lineHeight: number) {
  return wrapText(text, font, size, maxWidth).length * lineHeight;
}

function roundedRectSvgPath(width: number, height: number, radius: number): string {
  const r = Math.min(radius, width / 2, height / 2);
  return [
    `M ${r} 0`, `H ${width - r}`, `A ${r} ${r} 0 0 1 ${width} ${r}`, `V ${height - r}`,
    `A ${r} ${r} 0 0 1 ${width - r} ${height}`, `H ${r}`, `A ${r} ${r} 0 0 1 0 ${height - r}`,
    `V ${r}`, `A ${r} ${r} 0 0 1 ${r} 0`, `Z`,
  ].join(" ");
}

/** (x, y) is the BOTTOM-left corner in pdf-lib coordinates. */
function drawRoundedRect(
  page: PDFPage,
  opts: { x: number; y: number; width: number; height: number; radius: number; color?: RGB; borderColor?: RGB; borderWidth?: number },
) {
  page.drawSvgPath(roundedRectSvgPath(opts.width, opts.height, opts.radius), {
    x: opts.x, y: opts.y + opts.height, scale: 1,
    color: opts.color, borderColor: opts.borderColor, borderWidth: opts.borderWidth,
  });
}

/** Outline-only rounded box; `top` is measured from the top of the page. */
function drawOutlineBox(page: PDFPage, x: number, top: number, width: number, height: number, radius = 10, borderWidth = 0.8) {
  drawRoundedRect(page, { x, y: T(top) - height, width, height, radius, borderColor: COLOR.gold, borderWidth });
}

function drawStarGlyph(page: PDFPage, cx: number, cy: number, r: number, color: RGB) {
  const path = `M ${r} 0 L ${r * 1.32} ${r * 0.68} L ${r * 2} ${r} L ${r * 1.32} ${r * 1.32} L ${r} ${r * 2} L ${r * 0.68} ${r * 1.32} L 0 ${r} L ${r * 0.68} ${r * 0.68} Z`;
  page.drawSvgPath(path, { x: cx - r, y: cy + r, color });
}

/** A classic 5-point star (used for badges). */
function drawFivePointStar(page: PDFPage, cx: number, cy: number, r: number, opts: { color?: RGB; borderColor?: RGB; borderWidth?: number }) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${i === 0 ? "M" : "L"} ${(r + rad * Math.cos(a)).toFixed(2)} ${(r + rad * Math.sin(a)).toFixed(2)}`);
  }
  page.drawSvgPath(pts.join(" ") + " Z", { x: cx - r, y: cy + r, ...opts });
}

/** Draws a transparent PNG ornament centred on (cx, cy) at the given width. */
function drawIcon(page: PDFPage, img: PDFImage, cx: number, cy: number, width: number) {
  const h = (img.height / img.width) * width;
  page.drawImage(img, { x: cx - width / 2, y: cy - h / 2, width, height: h });
}

function drawFooter(page: PDFPage, fonts: Fonts, assets: Assets, brand: BrandConfig, opts: { withUrl: boolean }) {
  drawIcon(page, assets.lotus, CENTER_X, opts.withUrl ? 84 : 46, 58);
  if (opts.withUrl) {
    const url = `W W W . ${brand.website.replace(/^www\./i, "").toUpperCase().split("").join(" ")}`;
    drawCentered(page, url, { y: 36, font: fonts.sans, size: 10.5, color: COLOR.gold });
  }
}

function drawPageBackground(page: PDFPage, assets: Assets) {
  page.drawImage(assets.background, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });
}

/** "SMALL LINE / Big Line" title with the star divider below. Returns nothing; divider sits at `dividerTop`. */
function drawTitleBlock(page: PDFPage, fonts: Fonts, small: string, big: string, opts: { smallTop?: number; bigTop?: number; dividerTop?: number; bigSize?: number } = {}) {
  const smallTop = opts.smallTop ?? 52;
  const bigTop = opts.bigTop ?? 86;
  const dividerTop = opts.dividerTop ?? 122;
  drawCentered(page, small.toUpperCase(), { y: T(smallTop), font: fonts.heading, size: 13.5, color: COLOR.ink });
  drawCentered(page, big, { y: T(bigTop), font: fonts.heading, size: opts.bigSize ?? 24, color: COLOR.gold });
  const y = T(dividerTop);
  page.drawLine({ start: { x: CENTER_X - 118, y }, end: { x: CENTER_X - 11, y }, thickness: 0.8, color: COLOR.gold });
  page.drawLine({ start: { x: CENTER_X + 11, y }, end: { x: CENTER_X + 118, y }, thickness: 0.8, color: COLOR.gold });
  drawStarGlyph(page, CENTER_X, y, 4.5, COLOR.gold);
}

/** Gold section label with a short underline (e.g. "Numerological Breakdown"). */
function drawSectionLabel(page: PDFPage, fonts: Fonts, text: string, top: number, centerX = CENTER_X) {
  drawCentered(page, text, { y: T(top), font: fonts.sans, size: 12.5, color: COLOR.gold, centerX });
  const w = Math.min(80, textWidth(fonts.sans, text, 12.5) * 0.6);
  page.drawLine({ start: { x: centerX - w / 2, y: T(top) - 7 }, end: { x: centerX + w / 2, y: T(top) - 7 }, thickness: 0.7, color: COLOR.gold });
}

const BODY = { size: 12, line: 24, gap: 20 };

/** Paragraphs joined by a thin gold rail with a dot at the start of each (the "What this name will do" style). */
function drawRailedParagraphs(page: PDFPage, fonts: Fonts, paragraphs: string[], box: { x: number; top: number; width: number; height: number }) {
  const textX = box.x + 20;
  const maxW = box.width - 40;
  const needed = 44 + paragraphs.reduce((sum, p) => sum + paragraphHeight(p, fonts.sans, BODY.size, maxW, BODY.line) + BODY.gap, 0) - BODY.gap;
  drawOutlineBox(page, box.x, box.top, box.width, Math.max(box.height, needed), 6);
  let y = T(box.top) - 26;
  const dotYs: number[] = [];
  paragraphs.forEach((p) => {
    dotYs.push(y + BODY.size * 0.35);
    y = drawParagraph(page, p, { x: textX, y, font: fonts.sans, size: BODY.size, maxWidth: maxW, lineHeight: BODY.line, color: COLOR.ink, justify: true });
    y -= BODY.gap;
  });
  if (dotYs.length) {
    page.drawLine({ start: { x: box.x + 9, y: dotYs[0] }, end: { x: box.x + 9, y: dotYs[dotYs.length - 1] - 2 }, thickness: 0.8, color: COLOR.gold });
    dotYs.forEach((dy) => page.drawCircle({ x: box.x + 9, y: dy, size: 2.3, color: COLOR.gold }));
  }
}

/** Bullet list drawn with plain white dots (letter-analysis style). Returns the y after the list. */
function drawPlainBullets(page: PDFPage, fonts: Fonts, items: string[], x: number, y: number, size = 11.5, lineHeight = 20): number {
  let cursor = y;
  items.forEach((item) => {
    page.drawCircle({ x: x + 2.5, y: cursor + size * 0.33, size: 1.7, color: COLOR.ink });
    page.drawText(item, { x: x + 11, y: cursor, size, font: fonts.sans, color: COLOR.ink });
    cursor -= lineHeight;
  });
  return cursor;
}

function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function parseDob(iso: string): { day: number; month: number; year: number } {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (m) return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
  const d = new Date(iso);
  return { day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear() };
}

/** Kua number — the client's "Kua Number Calculation Logic" (docx). */
export function computeKuaNumber(year: number, gender: string): number | null {
  const g = gender.trim().toLowerCase();
  const male = g === "male" || g === "m";
  const female = g === "female" || g === "f";
  if (!male && !female) return null;
  const reduce = (n: number): number => (n > 9 ? reduce(String(n).split("").reduce((s, d) => s + Number(d), 0)) : n);
  const digit = reduce(String(year).split("").reduce((s, d) => s + Number(d), 0));
  let kua = reduce(male ? 11 - digit : digit + 4);
  if (kua === 5) kua = male ? 2 : 8;
  return kua;
}

interface Assets {
  background: PDFImage;
  logo: PDFImage;
  hands: PDFImage;
  lotus: PDFImage;
  person: PDFImage;
  badgeWarning: PDFImage;
  badgeFist: PDFImage;
  badgeCrown: PDFImage;
  badgeStar: PDFImage;
  statics: Map<number, PDFImage>;
}

/* ------------------------------------------------------------------ */
/*  Derived numerology for a candidate (current or new) name            */
/* ------------------------------------------------------------------ */

interface NameFacts {
  displayName: string;
  firstName: string;
  firstRawSum: number;
  firstNumber: number;
  fullRawSum: number; // == compound number
  fullNumber: number;
  compound: number;
  compoundTier: CompoundTier;
  firstVsMulank: Relation;
  firstVsBhagyank: Relation;
  fullVsMulank: Relation;
  fullVsBhagyank: Relation;
  firstOverAmp: boolean;
  fullOverAmp: boolean;
}

function analyseName(fullName: string, mulank: number, bhagyank: number, dob: { day: number; month: number; year: number }): NameFacts {
  const clean = fullName.trim().replace(/\s+/g, " ");
  const firstName = clean.split(" ")[0] ?? "";
  const grid = buildLoShuGrid(dob.day, dob.month, dob.year);
  const firstNumber = getFirstNameNumber(firstName);
  const fullNumber = getFullNameNumber(clean);
  const compound = getFullNameCompoundNumber(clean);
  return {
    displayName: clean,
    firstName,
    firstRawSum: chaldeanRawSum(firstName),
    firstNumber,
    fullRawSum: compound,
    fullNumber,
    compound,
    compoundTier: getCompoundTier(compound),
    firstVsMulank: getRelation(mulank, firstNumber),
    firstVsBhagyank: getRelation(bhagyank, firstNumber),
    fullVsMulank: getRelation(mulank, fullNumber),
    fullVsBhagyank: getRelation(bhagyank, fullNumber),
    firstOverAmp: isOverAmplified(firstNumber, grid),
    fullOverAmp: isOverAmplified(fullNumber, grid),
  };
}

const REL_SCORE: Record<Relation, number> = { friendly: 0, neutral: 1, enemy: 2 };
const TIER_SCORE: Record<CompoundTier, number> = { excellent: 0, good: 1, neutral: 2, conditional: 3, avoid: 4 };

/** Lower = more favourable. Same ingredients as the client's HR/OA/NR rules (relations, restricted numbers, compound tier). */
function favourabilityRank(f: NameFacts): number {
  return (
    REL_SCORE[f.firstVsMulank] + REL_SCORE[f.firstVsBhagyank] +
    REL_SCORE[f.fullVsMulank] + REL_SCORE[f.fullVsBhagyank] +
    TIER_SCORE[f.compoundTier] +
    (isRestrictedNumber(f.firstNumber) ? 2 : 0) + (isRestrictedNumber(f.fullNumber) ? 2 : 0) +
    (f.firstOverAmp ? 0.5 : 0) + (f.fullOverAmp ? 0.5 : 0)
  );
}

function impactLabel(rank: number, best: boolean): string {
  if (rank <= 3) return best ? "Highest" : "High";
  if (rank <= 6) return best ? "High" : "Moderate";
  return best ? "Moderate" : "Low";
}

/* ------------------------------------------------------------------ */
/*  The 18 dynamic pages                                                */
/* ------------------------------------------------------------------ */

/** Page 4 — personalised welcome note. */
function drawWelcomePage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput) {
  drawPageBackground(page, assets);
  const boxX = 62;
  const boxW = PAGE_WIDTH - 124;
  const logoW = 230;
  const logoH = (assets.logo.height / assets.logo.width) * logoW;
  page.drawImage(assets.logo, { x: CENTER_X - logoW / 2, y: T(62) - logoH / 2, width: logoW, height: logoH });
  page.drawLine({ start: { x: CENTER_X - 118, y: T(140) }, end: { x: CENTER_X - 9, y: T(140) }, thickness: 0.7, color: COLOR.goldLine });
  page.drawLine({ start: { x: CENTER_X + 9, y: T(140) }, end: { x: CENTER_X + 118, y: T(140) }, thickness: 0.7, color: COLOR.goldLine });
  drawStarGlyph(page, CENTER_X, T(140), 3, COLOR.gold);
  drawIcon(page, assets.hands, CENTER_X, T(746), 86);
  drawCentered(page, "“Namaskar", { y: T(215), font: fonts.heading, size: 26, color: COLOR.ink });
  drawCentered(page, `${data.firstName.toUpperCase()} JI,”`, { y: T(252), font: fonts.heading, size: 26, color: COLOR.gold });
  page.drawLine({ start: { x: CENTER_X - 108, y: T(278) }, end: { x: CENTER_X - 10, y: T(278) }, thickness: 0.8, color: COLOR.gold });
  page.drawLine({ start: { x: CENTER_X + 10, y: T(278) }, end: { x: CENTER_X + 108, y: T(278) }, thickness: 0.8, color: COLOR.gold });
  drawStarGlyph(page, CENTER_X, T(278), 3.5, COLOR.gold);

  const size = 12.5;
  const lh = 24;
  const p = (text: string, top: number) =>
    drawParagraph(page, text, { x: boxX, y: T(top), font: fonts.sans, size, maxWidth: boxW, lineHeight: lh, color: COLOR.ink, align: "center" });
  let y = p(
    `“This personalized name correction report has been prepared after careful analysis of your birth date and current name by celebrity Astro-Numerologist ${data.brand.numerologistName}. The new name suggested is rooted in the approach of Chaldean Numerology and the Loshu Grid. The purpose of this report is to harmonize the cosmic energies influencing your life.`,
    322,
  );
  y -= 14;
  y = drawParagraph(page, "Please approach these practices with faith, consistency, and pure intention. Divine grace flows to those who practice with devotion.", {
    x: boxX, y, font: fonts.sans, size, maxWidth: boxW, lineHeight: lh, color: COLOR.ink, align: "center",
  });
  y -= 18;
  page.drawLine({ start: { x: CENTER_X - 62, y }, end: { x: CENTER_X - 8, y }, thickness: 0.8, color: COLOR.gold });
  page.drawLine({ start: { x: CENTER_X + 8, y }, end: { x: CENTER_X + 62, y }, thickness: 0.8, color: COLOR.gold });
  drawStarGlyph(page, CENTER_X, y, 3, COLOR.gold);
  y -= 24;
  drawParagraph(page, "May this guide illuminate your path towards prosperity, peace, and spiritual growth.”", {
    x: boxX, y, font: fonts.sans, size, maxWidth: boxW, lineHeight: lh, color: COLOR.ink, align: "center",
  });
}

/** Page 5 — personal profile table. */
function drawBlueprintPage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput, c: NameCorrectionReportContent, kua: number | null, fullName: string) {
  drawPageBackground(page, assets);
  drawCentered(page, "UNDERSTANDING YOUR", { y: T(60), font: fonts.heading, size: 12, color: COLOR.ink });
  drawCentered(page, "Numerological Blueprint", { y: T(92), font: fonts.heading, size: 23, color: COLOR.gold });
  const dy = T(122);
  page.drawLine({ start: { x: CENTER_X - 118, y: dy }, end: { x: CENTER_X - 11, y: dy }, thickness: 0.8, color: COLOR.gold });
  page.drawLine({ start: { x: CENTER_X + 11, y: dy }, end: { x: CENTER_X + 118, y: dy }, thickness: 0.8, color: COLOR.gold });
  drawStarGlyph(page, CENTER_X, dy, 4.5, COLOR.gold);
  drawSectionLabel(page, fonts, "Personal Information", 160);

  const father = data.fatherName || (data.isMiddleNameFatherHusband ? data.middleName : "");
  const rows: [string, string][] = [
    ["First Name:", data.firstName],
    ["Middle Name :", data.middleName || "-"],
    ["Last Name:", data.lastName || "-"],
    ["Date of Birth:", formatDate(data.dob)],
    ["Gender:", data.gender],
    ["Fathers Name:", father || "-"],
    ["Mulank:", String(c.mulank)],
    ["Bhagyank:", String(c.bhagyank)],
    ["Kua No.:", kua == null ? "-" : String(kua)],
    ["First Name Number", String(c.firstNameNumber)],
    ["Full Name Number", String(c.fullNameNumber)],
    ["Full Name Compound Number", String(c.fullNameCompound)],
  ];
  void fullName;

  const x = 68;
  const w = PAGE_WIDTH - 136;
  const top = 190;
  const rowH = 40;
  const totalH = rowH * rows.length;
  drawRoundedRect(page, { x, y: T(top) - totalH, width: w, height: totalH, radius: 14, borderColor: COLOR.gold, borderWidth: 0.9 });
  const splitX = x + w * 0.4;
  page.drawLine({ start: { x: splitX, y: T(top) }, end: { x: splitX, y: T(top) - totalH }, thickness: 0.7, color: COLOR.gold });
  rows.forEach(([label, value], i) => {
    const rowTop = T(top) - i * rowH;
    if (i > 0) page.drawLine({ start: { x, y: rowTop }, end: { x: x + w, y: rowTop }, thickness: 0.6, color: COLOR.goldLine });
    const midY = rowTop - rowH / 2;
    drawCentered(page, label, { y: midY - 3.2, font: fonts.sans, size: 12.5, color: COLOR.gold, centerX: x + (splitX - x) / 2 });
    const valueW = x + w - splitX - 16;
    const lines = wrapText(value, fonts.sans, 11, valueW);
    const blockH = lines.length * 12;
    lines.forEach((ln, li) => {
      drawCentered(page, ln, { y: midY + blockH / 2 - 9 - li * 12 + 3, font: fonts.sans, size: 13, color: COLOR.ink, centerX: splitX + (x + w - splitX) / 2 });
    });
  });
  drawFooter(page, fonts, assets, data.brand, { withUrl: false });
}

/** Pages 10–12 — Current Name Analysis (first name / full name / compound). */
function drawCurrentNamePage(
  page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput,
  cfg: { heading: string; nameLabel: string; nameValue: string; total: number; reducedTo?: number; paragraphs: string[] },
) {
  drawPageBackground(page, assets);
  drawTitleBlock(page, fonts, "Current", "Name Analysis");
  drawCentered(page, cfg.heading.toUpperCase(), { y: T(158), font: fonts.sans, size: 16.5, color: COLOR.ink });
  page.drawLine({ start: { x: CENTER_X - 36, y: T(188) }, end: { x: CENTER_X + 36, y: T(188) }, thickness: 0.7, color: COLOR.goldLine });
  drawSectionLabel(page, fonts, "Numerological Breakdown", 224);

  const x = 62;
  const w = PAGE_WIDTH - 124;
  const top = 246;
  const rowH = 52;
  const rows = 2;
  const compound = cfg.reducedTo === undefined;
  void compound;
  // outer frame + rows
  page.drawRectangle({ x, y: T(top) - rowH * rows, width: w, height: rowH * rows, borderColor: COLOR.gold, borderWidth: 0.8 });
  page.drawLine({ start: { x, y: T(top) - rowH }, end: { x: x + w, y: T(top) - rowH }, thickness: 0.8, color: COLOR.gold });
  const labelW = 140;
  page.drawLine({ start: { x: x + labelW, y: T(top) }, end: { x: x + labelW, y: T(top) - rowH * rows }, thickness: 0.8, color: COLOR.gold });
  drawCentered(page, cfg.nameLabel, { y: T(top) - rowH / 2 - 3.5, font: fonts.sans, size: 13, color: COLOR.gold, centerX: x + labelW / 2 });
  drawCentered(page, cfg.nameValue, { y: T(top) - rowH / 2 - 3.5, font: fonts.sans, size: 13, color: COLOR.ink, centerX: x + labelW + (w - labelW) / 2 });
  const row2Mid = T(top) - rowH - rowH / 2 - 3.5;
  drawCentered(page, "Total", { y: row2Mid, font: fonts.sans, size: 13, color: COLOR.gold, centerX: x + labelW / 2 });
  if (cfg.reducedTo !== undefined) {
    const c1 = x + labelW + 64;
    const c2 = x + w - 64;
    page.drawLine({ start: { x: c1, y: T(top) - rowH }, end: { x: c1, y: T(top) - rowH * rows }, thickness: 0.8, color: COLOR.gold });
    page.drawLine({ start: { x: c2, y: T(top) - rowH }, end: { x: c2, y: T(top) - rowH * rows }, thickness: 0.8, color: COLOR.gold });
    drawCentered(page, String(cfg.total), { y: row2Mid, font: fonts.sans, size: 13, color: COLOR.ink, centerX: x + labelW + 32 });
    drawCentered(page, "Reduced To", { y: row2Mid, font: fonts.sans, size: 13, color: COLOR.gold, centerX: (c1 + c2) / 2 });
    drawCentered(page, String(cfg.reducedTo), { y: row2Mid, font: fonts.sans, size: 13, color: COLOR.ink, centerX: c2 + 32 });
  } else {
    drawCentered(page, String(cfg.total), { y: row2Mid, font: fonts.sans, size: 13, color: COLOR.ink, centerX: x + labelW + (w - labelW) / 2 });
  }

  drawSectionLabel(page, fonts, "What This Name Will Do For You", 448);
  drawRailedParagraphs(page, fonts, cfg.paragraphs, { x, top: 478, width: w, height: 312 });
}

/** Page 13 — Why This Is Critical (HR/OA/NR verdict text). */
function drawWhyCriticalPage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput, c: NameCorrectionReportContent) {
  drawPageBackground(page, assets);
  drawTitleBlock(page, fonts, "Current", "Name Analysis");
  drawCentered(page, "WHY THIS IS CRITICAL", { y: T(158), font: fonts.sans, size: 16.5, color: COLOR.ink });
  page.drawLine({ start: { x: CENTER_X - 36, y: T(188) }, end: { x: CENTER_X + 36, y: T(188) }, thickness: 0.7, color: COLOR.goldLine });
  const paragraphs = [...c.verdictBullets, ...(c.verdictNote && !c.verdictBullets.includes(c.verdictNote) ? [c.verdictNote] : [])];
  const x = 62;
  const w = PAGE_WIDTH - 124;
  const h = Math.max(220, 40 + paragraphs.reduce((s, p) => s + paragraphHeight(p, fonts.sans, BODY.size, w - 40, BODY.line) + BODY.gap, 0));
  drawRailedParagraphs(page, fonts, paragraphs, { x, top: 236, width: w, height: h });
  void data;
}

/** Page 14 — First Letter: identity table, core essence, communication style. */
function drawLetterAnalysisPage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput, letter: LetterBlock) {
  drawPageBackground(page, assets);
  drawTitleBlock(page, fonts, "The Power of Your", "First Letter");
  drawSectionLabel(page, fonts, "First Letter Analysis", 190);

  const x = 66;
  const w = PAGE_WIDTH - 132;
  const rowH = 38;
  const rows: [string, string][] = [
    ["Your Name Begins With:", letter.letter],
    ["Numerical Value:", String(letter.numerologicalValue)],
    ["Archetype:", letter.archetype],
  ];
  const top = 214;
  drawRoundedRect(page, { x, y: T(top) - rowH * rows.length, width: w, height: rowH * rows.length, radius: 7, borderColor: COLOR.gold, borderWidth: 0.8 });
  const splitX = x + w / 2;
  page.drawLine({ start: { x: splitX, y: T(top) }, end: { x: splitX, y: T(top) - rowH * rows.length }, thickness: 0.7, color: COLOR.gold });
  rows.forEach(([label, value], i) => {
    const rowTop = T(top) - i * rowH;
    if (i > 0) page.drawLine({ start: { x, y: rowTop }, end: { x: x + w, y: rowTop }, thickness: 0.6, color: COLOR.goldLine });
    drawCentered(page, label, { y: rowTop - rowH / 2 - 3.3, font: fonts.sans, size: 13, color: COLOR.gold, centerX: x + w / 4 });
    drawCentered(page, value, { y: rowTop - rowH / 2 - 3.3, font: fonts.sans, size: 13, color: COLOR.ink, centerX: x + (3 * w) / 4 });
  });

  drawSectionLabel(page, fonts, "Core Essence", 354);
  const essenceH = 70;
  drawOutlineBox(page, x, 374, w, essenceH, 7);
  drawParagraph(page, letter.coreEssence, { x: x + 20, y: T(374) - 26, font: fonts.sans, size: 13, maxWidth: w - 40, lineHeight: 22, color: COLOR.ink, align: "center" });

  drawSectionLabel(page, fonts, "Communication Style", 490);
  const cw = 190;
  const ch = 18 + letter.communicationStyle.length * 20 + 6;
  drawOutlineBox(page, CENTER_X - cw / 2, 510, cw, ch, 5);
  letter.communicationStyle.forEach((line, i) => {
    drawCentered(page, line, { y: T(510) - 24 - i * 20, font: fonts.sans, size: 10.5, color: COLOR.ink });
  });
  drawFooter(page, fonts, assets, data.brand, { withUrl: true });
}

function drawBadge(page: PDFPage, assets: Assets, cx: number, cy: number, kind: "warning" | "strength") {
  drawIcon(page, kind === "warning" ? assets.badgeWarning : assets.badgeFist, cx, cy, 52);
}

/** Page 15 — First Letter: challenges and strengths. */
function drawLetterTraitsPage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput, letter: LetterBlock) {
  drawPageBackground(page, assets);
  drawTitleBlock(page, fonts, "The Power of Your", "First Letter");
  const circleY = T(168);
  page.drawCircle({ x: CENTER_X, y: circleY, size: 30, color: COLOR.bg, borderColor: COLOR.gold, borderWidth: 1 });
  drawCentered(page, letter.letter, { y: circleY - 10, font: fonts.heading, size: 28, color: COLOR.gold });

  const x = 66;
  const w = PAGE_WIDTH - 132;
  const challenges = letter.challenges.slice(0, 6);
  const strengths = letter.strengths.slice(0, 6);
  const boxH = (n: number) => 52 + n * 18 + 14;
  const top1 = 222;
  const h1 = boxH(challenges.length);
  drawOutlineBox(page, x, top1, w, h1, 10);
  drawBadge(page, assets, CENTER_X, T(top1), "warning");
  drawCentered(page, `Challenges of ${letter.letter}`, { y: T(top1) - 38, font: fonts.sans, size: 13, color: COLOR.gold });
  drawPlainBullets(page, fonts, challenges, x + 28, T(top1) - 64, 11.5, 20);

  const top2 = top1 + h1 + 36;
  const h2 = boxH(strengths.length);
  drawOutlineBox(page, x, top2, w, h2, 10);
  drawBadge(page, assets, CENTER_X, T(top2), "strength");
  drawCentered(page, `Strengths of ${letter.letter}`, { y: T(top2) - 38, font: fonts.sans, size: 13, color: COLOR.gold });
  drawPlainBullets(page, fonts, strengths, x + 28, T(top2) - 64, 11.5, 20);
  drawFooter(page, fonts, assets, data.brand, { withUrl: true });
}

/** Page 16 — First Letter: famous names, spiritual significance, mantra, how to maximise. */
function drawLetterSpiritPage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput, letter: LetterBlock) {
  drawPageBackground(page, assets);
  drawTitleBlock(page, fonts, "The Power of Your", "First Letter");
  const L = letter.letter;
  const colX = 66;
  const colW = PAGE_WIDTH - 132;

  drawSectionLabel(page, fonts, `Famous “${L}” Names`, 164);
  const railTop = T(184);
  let y = T(190);
  const dots: number[] = [];
  letter.famousNames.slice(0, 4).forEach((n) => {
    dots.push(y + 3);
    y = drawParagraph(page, n, { x: colX + 22, y, font: fonts.sans, size: 12.5, maxWidth: colW - 22, lineHeight: 20, color: COLOR.ink }) - 8;
  });
  if (dots.length) {
    page.drawLine({ start: { x: colX + 8, y: dots[0] }, end: { x: colX + 8, y: dots[dots.length - 1] }, thickness: 0.8, color: COLOR.gold });
    dots.forEach((d) => page.drawCircle({ x: colX + 8, y: d, size: 2.2, color: COLOR.gold }));
  }
  void railTop;

  y -= 10;
  drawCentered(page, "Spiritual Significance:", { y, font: fonts.sans, size: 13, color: COLOR.gold });
  page.drawLine({ start: { x: CENTER_X - 36, y: y - 7 }, end: { x: CENTER_X + 36, y: y - 7 }, thickness: 0.7, color: COLOR.gold });
  y -= 28;
  y = drawParagraph(page, letter.spiritualSignificance, { x: colX, y, font: fonts.sans, size: 12.5, maxWidth: colW, lineHeight: 21, color: COLOR.ink, align: "center" });

  y -= 14;
  drawCentered(page, `Mantra for “${L}” Names`, { y, font: fonts.sans, size: 13, color: COLOR.gold });
  page.drawLine({ start: { x: CENTER_X - 36, y: y - 7 }, end: { x: CENTER_X + 36, y: y - 7 }, thickness: 0.7, color: COLOR.gold });
  y -= 28;
  y = drawParagraph(page, letter.mantra, { x: colX + 20, y, font: fonts.sans, size: 12.5, maxWidth: colW - 40, lineHeight: 20, color: COLOR.ink, align: "center" });

  y -= 18;
  drawCentered(page, `How to Maximise ${L} Energy`, { y, font: fonts.sans, size: 13, color: COLOR.gold });
  page.drawLine({ start: { x: CENTER_X - 36, y: y - 7 }, end: { x: CENTER_X + 36, y: y - 7 }, thickness: 0.7, color: COLOR.gold });
  y -= 30;
  const dots2: number[] = [];
  letter.howToMaximize.slice(0, 6).forEach((tip) => {
    dots2.push(y + 3);
    y = drawParagraph(page, tip, { x: colX + 22, y, font: fonts.sans, size: 12.5, maxWidth: colW - 22, lineHeight: 20, color: COLOR.ink }) - 9;
  });
  if (dots2.length) {
    page.drawLine({ start: { x: colX + 8, y: dots2[0] }, end: { x: colX + 8, y: dots2[dots2.length - 1] }, thickness: 0.8, color: COLOR.gold });
    dots2.forEach((d) => page.drawCircle({ x: colX + 8, y: d, size: 2.2, color: COLOR.gold }));
  }
  drawFooter(page, fonts, assets, data.brand, { withUrl: true });
}

/** Pages 17–18 — New Name Recommendation, Option N. */
function drawOptionPage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput, optionNo: 1 | 2, f: NameFacts | null, optionName: string) {
  drawPageBackground(page, assets);
  drawTitleBlock(page, fonts, "New Name", "Recommendation");
  drawCentered(page, `OPTION ${optionNo}: ${(optionName || "—").toUpperCase()}`, { y: T(158), font: fonts.sans, size: 13.5, color: COLOR.ink });
  page.drawLine({ start: { x: CENTER_X - 36, y: T(188) }, end: { x: CENTER_X + 36, y: T(188) }, thickness: 0.7, color: COLOR.goldLine });
  drawSectionLabel(page, fonts, "Numerological Breakdown", 224);

  const x = 62;
  const w = PAGE_WIDTH - 124;
  const rows: [string, string][] = [
    ["First Name Number", f ? String(f.firstNumber) : "—"],
    ["Full Name Number", f ? String(f.fullNumber) : "—"],
    ["Full Name Compound Number", f ? String(f.compound) : "—"],
  ];
  const rowH = 36;
  const top = 246;
  page.drawRectangle({ x, y: T(top) - rowH * 3, width: w, height: rowH * 3, borderColor: COLOR.gold, borderWidth: 0.8 });
  const splitX = x + w * 0.78;
  page.drawLine({ start: { x: splitX, y: T(top) }, end: { x: splitX, y: T(top) - rowH * 3 }, thickness: 0.8, color: COLOR.gold });
  rows.forEach(([label, value], i) => {
    const rowTop = T(top) - i * rowH;
    if (i > 0) page.drawLine({ start: { x, y: rowTop }, end: { x: x + w, y: rowTop }, thickness: 0.8, color: COLOR.gold });
    page.drawText(label, { x: x + 22, y: rowTop - rowH / 2 - 3.3, size: 13, font: fonts.sans, color: COLOR.gold });
    drawCentered(page, value, { y: rowTop - rowH / 2 - 3.3, font: fonts.sans, size: 13, color: COLOR.ink, centerX: splitX + (x + w - splitX) / 2 });
  });

  drawSectionLabel(page, fonts, "What This Name Will Do For You", 396);
  const paragraphs = f
    ? [
        `First Name (${f.firstNumber}): ${getFirstNameExplanation(f.firstNumber)}`,
        `Full Name (${f.fullNumber}): ${getFullNameExplanation(f.fullNumber)}`,
        `Compound Number (${f.compound}): ${getCompoundExplanation(f.compound)}`,
      ]
    : ["Option name not provided for this report."];
  drawRailedParagraphs(page, fonts, paragraphs, { x, top: 426, width: w, height: 300 });
  void data;
}

/** Page 19 — comparison table + professional recommendation. */
function drawRecommendationLevelPage(
  page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput,
  labels: [string, string], recCase: RecommendationCase,
) {
  drawPageBackground(page, assets);
  drawTitleBlock(page, fonts, "New Name", "Recommendation Level", { bigSize: 20 });
  drawSectionLabel(page, fonts, "Recommendation Comparison", 164);

  const x = 62;
  const w = PAGE_WIDTH - 124;
  const rowH = 34;
  const top = 188;
  page.drawRectangle({ x, y: T(top) - rowH * 3, width: w, height: rowH * 3, borderColor: COLOR.gold, borderWidth: 0.8 });
  const splitX = x + w / 2;
  page.drawLine({ start: { x: splitX, y: T(top) }, end: { x: splitX, y: T(top) - rowH * 3 }, thickness: 0.8, color: COLOR.gold });
  const table: [string, string][] = [["OPTIONS", "IMPACT LEVEL"], ["OPTION 1", labels[0]], ["OPTION 2", labels[1]]];
  table.forEach(([a, b], i) => {
    const rowTop = T(top) - i * rowH;
    if (i > 0) page.drawLine({ start: { x, y: rowTop }, end: { x: x + w, y: rowTop }, thickness: 0.8, color: COLOR.gold });
    drawCentered(page, a, { y: rowTop - rowH / 2 - 3.3, font: fonts.sans, size: 13, color: COLOR.gold, centerX: x + w / 4 });
    drawCentered(page, b, { y: rowTop - rowH / 2 - 3.3, font: fonts.sans, size: 13, color: i === 0 ? COLOR.gold : COLOR.ink, centerX: x + (3 * w) / 4 });
  });

  drawSectionLabel(page, fonts, "MY PROFESSIONAL RECOMMENDATION", 330);
  const boxTop = 356;
  const boxH = 214;
  // offset "shadow" plate behind the card, like the sample
  drawRoundedRect(page, { x: x + 5, y: T(boxTop) - boxH - 5, width: w, height: boxH, radius: 8, color: rgb(0.88, 0.74, 0.5) });
  drawRoundedRect(page, { x, y: T(boxTop) - boxH, width: w, height: boxH, radius: 8, color: COLOR.bg, borderColor: COLOR.gold, borderWidth: 1 });
  const leftW = 150;
  page.drawLine({ start: { x: x + leftW, y: T(boxTop) - 12 }, end: { x: x + leftW, y: T(boxTop) - boxH + 12 }, thickness: 0.7, color: COLOR.goldLine });

  const cx = x + leftW / 2;
  drawIcon(page, assets.badgeStar, cx, T(boxTop) - 52, 52);
  drawCentered(page, "For You,", { y: T(boxTop) - 108, font: fonts.sans, size: 14, color: COLOR.ink, centerX: cx });
  drawCentered(page, "I Suggest:", { y: T(boxTop) - 126, font: fonts.sans, size: 14, color: COLOR.ink, centerX: cx });
  const pick = recCase === "option1Better" ? "OPTION 1" : recCase === "option2Better" ? "OPTION 2" : "EITHER OPTION";
  const pickSize = recCase === "equal" ? 13 : 16;
  drawCentered(page, pick, { y: T(boxTop) - 150, font: fonts.heading, size: pickSize, color: COLOR.gold, centerX: cx });

  const paragraphs = RECOMMENDATION_BLOCKS[recCase];
  let y = T(boxTop) - 34;
  const tx = x + leftW + 22;
  const tw = w - leftW - 40;
  paragraphs.forEach((p) => {
    page.drawCircle({ x: tx - 8, y: y + 3, size: 1.6, color: COLOR.ink });
    y = drawParagraph(page, p, { x: tx, y, font: fonts.sans, size: 12.5, maxWidth: tw, lineHeight: 21, color: COLOR.ink }) - 14;
  });
  drawFooter(page, fonts, assets, data.brand, { withUrl: true });
}

/** Page 20 — personal Loshu Grid. */
function drawLoshuPage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput) {
  drawPageBackground(page, assets);
  drawTitleBlock(page, fonts, "Your Personal", "Loshu Grid");
  drawSectionLabel(page, fonts, "Your Personal Loshu Grid", 176);

  const dob = parseDob(data.dob);
  const grid = buildStandardLoShuGrid(dob.day, dob.month, dob.year);
  const cells = toGridCells(grid);
  const size = 332;
  const x0 = CENTER_X - size / 2;
  const top = 214;
  const cell = size / 3;
  page.drawRectangle({ x: x0, y: T(top) - size, width: size, height: size, borderColor: COLOR.ink, borderWidth: 1 });
  for (let i = 1; i < 3; i++) {
    page.drawLine({ start: { x: x0 + cell * i, y: T(top) }, end: { x: x0 + cell * i, y: T(top) - size }, thickness: 1, color: COLOR.ink });
    page.drawLine({ start: { x: x0, y: T(top) - cell * i }, end: { x: x0 + size, y: T(top) - cell * i }, thickness: 1, color: COLOR.ink });
  }
  cells.forEach((row, r) =>
    row.forEach(({ digit, count }, col) => {
      if (count <= 0) return;
      const label = String(digit).repeat(count);
      const fs = count > 3 ? 26 : 36;
      drawCentered(page, label, { y: T(top) - cell * r - cell / 2 - fs * 0.33, font: fonts.sansBold, size: fs, color: COLOR.gold, centerX: x0 + cell * col + cell / 2 });
    }),
  );
  drawFooter(page, fonts, assets, data.brand, { withUrl: true });
}

const RAJYOG_COPY: Record<string, { subtitle: string; text: string }> = {
  "Rajyog-1": {
    subtitle: "(9-5-1 Line)",
    text: "Your Loshu Grid contains the powerful Rajyog, formed by the diagonal presence of numbers 9, 5, and 1. This combination blends the leadership and authority of Mars (9), the adaptability and business acumen of Mercury (5), and the confidence and vitality of the Sun (1). Individuals with this Rajyog are naturally driven towards success, recognition, and financial prosperity. It indicates strong willpower, sharp decision-making ability, and the potential to rise to positions of influence through consistent effort and self-belief.",
  },
  "Rajyog-2": {
    subtitle: "(4-5-6 Line)",
    text: "Your Loshu Grid reveals the auspicious Golden Rajyog, formed by the alignment of numbers 4, 5, and 6. This combination brings together the discipline and structure of Rahu (4), the intelligence and communication skills of Mercury (5), and the charm and creativity of Venus (6). Individuals blessed with this Rajyog often experience steady financial growth, strong problem-solving ability, and success in fields requiring both analytical thinking and aesthetic sense. This alignment is considered highly favorable for wealth accumulation and material stability.",
  },
  "Rajyog-3": {
    subtitle: "(2-5-8 Line)",
    text: "Your Loshu Grid contains the beneficial Silver Rajyog, formed by the presence of numbers 2, 5, and 8. This combination merges the emotional intelligence and intuition of the Moon (2), the versatility and quick thinking of Mercury (5), and the discipline and perseverance of Saturn (8). Individuals with this Rajyog tend to be hardworking, patient, and capable of building long-term stability through consistent effort. It supports steady progress in career and finances, though success often comes through sustained discipline rather than sudden gains.",
  },
};

function drawCrown(page: PDFPage, assets: Assets, cx: number, cy: number) {
  drawIcon(page, assets.badgeCrown, cx, cy, 34);
}

/** Pages 21–23 — one Rajyog each. */
function drawRajyogPage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput, result: RajyogResult) {
  drawPageBackground(page, assets);
  drawTitleBlock(page, fonts, "Your Rajyog", "Analysis");
  const copy = RAJYOG_COPY[result.id];
  drawCentered(page, result.id, { y: T(158), font: fonts.sans, size: 13, color: COLOR.gold });
  drawCentered(page, copy.subtitle, { y: T(184), font: fonts.heading, size: 15, color: COLOR.gold });

  const x = 40;
  const w = PAGE_WIDTH - 80;
  const top = 214;
  const h = 50 + paragraphHeight(copy.text, fonts.sans, 12.5, w - 48, 22);
  drawOutlineBox(page, x, top, w, h, 8);
  drawCrown(page, assets, x + 6, T(top));
  drawCrown(page, assets, x + w - 6, T(top));
  drawParagraph(page, copy.text, { x: x + 24, y: T(top) - 28, font: fonts.sans, size: 12.5, maxWidth: w - 48, lineHeight: 22, color: COLOR.ink, justify: true });

  const pillTop = top + h + 34;
  const label = `YOUR ${result.id.toUpperCase()} STATUS`;
  const pillW = textWidth(fonts.sansBold, label, 10) + 44;
  drawRoundedRect(page, { x: CENTER_X - pillW / 2 + 3, y: T(pillTop) - 18 - 3, width: pillW, height: 32, radius: 16, color: rgb(0.88, 0.74, 0.5) });
  drawRoundedRect(page, { x: CENTER_X - pillW / 2, y: T(pillTop) - 15, width: pillW, height: 32, radius: 16, color: COLOR.bg, borderColor: COLOR.gold, borderWidth: 1 });
  drawCentered(page, label, { y: T(pillTop) - 3.5, font: fonts.sansBold, size: 11.5, color: COLOR.gold });

  const statuses: RajyogStatus[] = ["Naturally Present", "Completed Through Numerologically Aligned Name", "Not Present"];
  const boxTop = pillTop + 38;
  const rowH = 26;
  const bw = w - 40;
  const bx = CENTER_X - bw / 2;
  drawOutlineBox(page, bx, boxTop, bw, rowH * 3 + 12, 6);
  statuses.forEach((s, i) => {
    const cy = T(boxTop) - 20 - i * rowH;
    const bxs = bx + 20;
    page.drawRectangle({ x: bxs, y: cy - 6, width: 11, height: 11, borderColor: COLOR.gold, borderWidth: 0.8, color: result.status === s ? COLOR.gold : undefined });
    if (result.status === s) {
      page.drawLine({ start: { x: bxs + 2.2, y: cy - 0.5 }, end: { x: bxs + 4.8, y: cy - 3.6 }, thickness: 1.4, color: COLOR.bg });
      page.drawLine({ start: { x: bxs + 4.8, y: cy - 3.6 }, end: { x: bxs + 9, y: cy + 3 }, thickness: 1.4, color: COLOR.bg });
    }
    page.drawText(s, { x: bxs + 22, y: cy - 4, size: 12.5, font: fonts.sans, color: COLOR.ink });
  });
  drawFooter(page, fonts, assets, data.brand, { withUrl: true });
}

/** Page 24 — important note about Rajyogs. */
function drawRajyogNotePage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput) {
  drawPageBackground(page, assets);
  drawTitleBlock(page, fonts, "Your Rajyog", "Analysis");
  const label = "Important NOte";
  const pillW = textWidth(fonts.heading, label, 14) + 48;
  const pillTop = 232;
  drawRoundedRect(page, { x: CENTER_X - pillW / 2 + 3, y: T(pillTop) - 19, width: pillW, height: 34, radius: 17, color: rgb(0.88, 0.74, 0.5) });
  drawRoundedRect(page, { x: CENTER_X - pillW / 2, y: T(pillTop) - 16, width: pillW, height: 34, radius: 17, color: COLOR.bg, borderColor: COLOR.gold, borderWidth: 1 });
  drawCentered(page, "Important Note", { y: T(pillTop) - 4.5, font: fonts.heading, size: 13, color: COLOR.ink });

  const x = 62;
  const w = PAGE_WIDTH - 124;
  const text =
    "Numerologically Aligned Names can only create / strengthen a Rajyog when the missing number is one that is safe and beneficial to carry in a name — specifically 1, 5, 6, or 2 (when favorable to your profile). Numbers 4 (Rahu), 8 (Saturn), and 9 (Mars) are never used in name alignment, even when doing so would complete a Rajyog, as these energies are considered unstable or restrictive when carried in a name's vibration on a daily basis. Where a Rajyog remains incomplete for this reason, it reflects a deliberate numerological safeguard, not an oversight.";
  const h = 48 + paragraphHeight(text, fonts.sans, 12.5, w - 44, 23);
  const top = 286;
  drawRoundedRect(page, { x: x + 5, y: T(top) - h - 5, width: w, height: h, radius: 8, color: rgb(0.88, 0.74, 0.5) });
  drawRoundedRect(page, { x, y: T(top) - h, width: w, height: h, radius: 8, color: COLOR.bg, borderColor: COLOR.gold, borderWidth: 1 });
  drawParagraph(page, text, { x: x + 22, y: T(top) - 28, font: fonts.sans, size: 12.5, maxWidth: w - 44, lineHeight: 23, color: COLOR.ink, justify: true });
  drawFooter(page, fonts, assets, data.brand, { withUrl: true });
}

/** Page 38 — success mantra (uses the recommended new name). */
function drawMantraPage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput, newName: string) {
  drawPageBackground(page, assets);
  drawCentered(page, "SUCCESS", { y: T(252), font: fonts.heading, size: 12, color: COLOR.ink });
  drawCentered(page, "Mantra", { y: T(284), font: fonts.heading, size: 24, color: COLOR.gold });
  const ly = T(304);
  page.drawLine({ start: { x: CENTER_X - 118, y: ly }, end: { x: CENTER_X - 11, y: ly }, thickness: 0.8, color: COLOR.gold });
  page.drawLine({ start: { x: CENTER_X + 11, y: ly }, end: { x: CENTER_X + 118, y: ly }, thickness: 0.8, color: COLOR.gold });
  drawStarGlyph(page, CENTER_X, ly, 4.5, COLOR.gold);

  const x = 62;
  const w = PAGE_WIDTH - 124;
  const mantra = `“My name is my frequency. I align with my highest vibration. I welcome the transformation that is my birthright. I am ${newName || "[New Name]"}, and I claim my destiny.”`;
  const h = 40 + paragraphHeight(mantra, fonts.sans, 13.5, w - 56, 25);
  drawOutlineBox(page, x, 336, w, h, 8);
  drawParagraph(page, mantra, { x: x + 28, y: T(336) - 30, font: fonts.sans, size: 13.5, maxWidth: w - 56, lineHeight: 25, color: COLOR.ink, align: "center" });

  const cy = T(336) - h - 54;
  drawParagraph(page, "CHANT THIS DAILY DURING YOUR NAME TRANSITION.", {
    x: x + 30, y: cy, font: fonts.quote, size: 17, maxWidth: w - 60, lineHeight: 28, color: COLOR.gold, align: "center",
  });
  drawIcon(page, assets.person, CENTER_X, cy - 90, 96);
  drawFooter(page, fonts, assets, data.brand, { withUrl: false });
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
    fatherName: "",
    option1Name: "",
    option2Name: "",
    isTwoFavorableForProfile: false,
    ...input,
    brand: { ...DEFAULT_BRAND, ...input.brand },
    contentOverride: input.contentOverride ?? {},
  } as ResolvedInput;

  const computed = computeNameCorrectionReportContent(data);
  const content: NameCorrectionReportContent = { ...computed, ...input.contentOverride };
  if (content.isFallback) {
    console.warn(`Name Correction PDF: rule engine hit FALLBACK for "${data.customerName}" (report ${data.reportId}) — matched ${content.matchedRuleId} by default. Recommend manual review before sending to customer.`);
  }

  const dob = parseDob(data.dob);
  const mulank = content.mulank;
  const bhagyank = content.bhagyank;
  const fullNameForNumerology = [data.firstName, data.isMiddleNameFatherHusband ? "" : data.middleName, data.lastName].filter(Boolean).join(" ");
  const current = analyseName(fullNameForNumerology, mulank, bhagyank, dob);
  const kua = computeKuaNumber(dob.year, data.gender);

  // --- candidate (new) names -------------------------------------------------
  const opt1 = data.option1Name.trim() ? analyseName(data.option1Name, mulank, bhagyank, dob) : null;
  const opt2 = data.option2Name.trim() ? analyseName(data.option2Name, mulank, bhagyank, dob) : null;
  if (!opt1 || !opt2) {
    console.warn(`Name Correction PDF: report ${data.reportId} has no Option ${!opt1 ? "1" : ""}${!opt1 && !opt2 ? " / " : ""}${!opt2 ? "2" : ""} name — the New Name Recommendation pages will show placeholders.`);
  }
  const rank1 = opt1 ? favourabilityRank(opt1) : 99;
  const rank2 = opt2 ? favourabilityRank(opt2) : 99;
  const recCase: RecommendationCase =
    opt1 && opt2
      ? pickRecommendationCase(
          { firstNameNumber: opt1.firstNumber, fullNameNumber: opt1.fullNumber, compoundNumber: opt1.compound, favorabilityRank: rank1 },
          { firstNameNumber: opt2.firstNumber, fullNameNumber: opt2.fullNumber, compoundNumber: opt2.compound, favorabilityRank: rank2 },
        )
      : "equal";
  const bestRank = Math.min(rank1, rank2);
  const label1 = impactLabel(rank1, rank1 === bestRank);
  const label2 = impactLabel(rank2, rank2 === bestRank);
  const recommended = recCase === "option1Better" ? opt1 : recCase === "option2Better" ? opt2 : opt2 ?? opt1;

  // --- loshu + rajyog (computed against the RECOMMENDED corrected name) -----
  const grid = buildStandardLoShuGrid(dob.day, dob.month, dob.year);
  const rajyogs = evaluateAllRajyogs({
    naturalGridPresent: grid.present,
    correctedFirstNameNumber: recommended?.firstNumber ?? current.firstNumber,
    correctedFullNameNumber: recommended?.fullNumber ?? current.fullNumber,
    isTwoFavorableForProfile: data.isTwoFavorableForProfile,
  });

  const letter = getLetterBlock((data.firstName || "A").charAt(0));
  if (!letter) throw new Error(`Name Correction PDF: no First Letter content for "${data.firstName}".`);

  // --- current-name paragraphs (pages 10–12) -------------------------------
  const firstParas = current.firstOverAmp
    ? LOSHU_OVERAMP_FIRST_NAME_BLOCK
    : FIRST_NAME_BLOCKS[comboKey(current.firstVsMulank, current.firstVsBhagyank)];
  const fullParas = current.fullOverAmp
    ? LOSHU_OVERAMP_FULL_NAME_BLOCK
    : FULL_NAME_BLOCKS[comboKey(current.fullVsMulank, current.fullVsBhagyank)];
  const compoundParas = COMPOUND_BLOCKS[content.compoundTier];

  // --- document --------------------------------------------------------------
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`Name Correction Report - ${data.customerName}`);
  pdfDoc.setSubject("Chaldean Numerology Name Correction Report");
  pdfDoc.setProducer(data.brand.companyName);
  pdfDoc.setCreator(data.brand.companyName);
  pdfDoc.registerFontkit(fontkit);

  const iconKeys = ["logo", "hands", "lotus", "person", "badgeWarning", "badgeFist", "badgeCrown", "badgeStar"] as const;
  const [backgroundBytes, quicksandRegularBytes, quicksandBoldBytes, cinzelBytes, cardoBytes, ...restBytes] = await Promise.all([
    fetchAssetBytes(ASSET_PATHS.background),
    fetchAssetBytes(ASSET_PATHS.fonts.quicksandRegular),
    fetchAssetBytes(ASSET_PATHS.fonts.quicksandBold),
    fetchAssetBytes(ASSET_PATHS.fonts.cinzelDecorativeBold),
    fetchAssetBytes(ASSET_PATHS.fonts.cardoRegular),
    ...iconKeys.map((k) => fetchAssetBytes(ASSET_PATHS[k])),
    ...STATIC_PAGE_NUMBERS.map((n) => fetchAssetBytes(staticPagePath(n))),
  ]);
  const iconBytes = restBytes.slice(0, iconKeys.length);
  const staticBytes = restBytes.slice(iconKeys.length);

  const statics = new Map<number, PDFImage>();
  for (let i = 0; i < STATIC_PAGE_NUMBERS.length; i++) {
    statics.set(STATIC_PAGE_NUMBERS[i], await pdfDoc.embedJpg(staticBytes[i]));
  }
  const icons = {} as Record<(typeof iconKeys)[number], PDFImage>;
  for (let i = 0; i < iconKeys.length; i++) icons[iconKeys[i]] = await pdfDoc.embedPng(iconBytes[i]);
  const assets: Assets = { background: await pdfDoc.embedPng(backgroundBytes), ...icons, statics };

  const NO_LIGATURES = { features: { liga: false } } as const;
  const fonts: Fonts = {
    sans: await pdfDoc.embedFont(quicksandRegularBytes, NO_LIGATURES),
    sansBold: await pdfDoc.embedFont(quicksandBoldBytes, NO_LIGATURES),
    heading: await pdfDoc.embedFont(cinzelBytes, NO_LIGATURES),
    quote: await pdfDoc.embedFont(cardoBytes, NO_LIGATURES),
  };

  /** Page-number -> builder for the 18 pages that change per customer. */
  const dynamicPages: Record<number, (page: PDFPage) => void> = {
    4: (p) => drawWelcomePage(p, fonts, assets, data),
    5: (p) => drawBlueprintPage(p, fonts, assets, data, content, kua, fullNameForNumerology),
    10: (p) => drawCurrentNamePage(p, fonts, assets, data, { heading: "First Name Number", nameLabel: "First Name", nameValue: data.firstName, total: current.firstRawSum, reducedTo: content.firstNameNumber, paragraphs: [...firstParas] }),
    11: (p) => drawCurrentNamePage(p, fonts, assets, data, { heading: "Full Name Number", nameLabel: "Full Name", nameValue: current.displayName, total: current.fullRawSum, reducedTo: content.fullNameNumber, paragraphs: [...fullParas] }),
    12: (p) => drawCurrentNamePage(p, fonts, assets, data, { heading: "Full Name Compound Number", nameLabel: "Full Name", nameValue: current.displayName, total: content.fullNameCompound, paragraphs: [...compoundParas] }),
    13: (p) => drawWhyCriticalPage(p, fonts, assets, data, content),
    14: (p) => drawLetterAnalysisPage(p, fonts, assets, data, letter),
    15: (p) => drawLetterTraitsPage(p, fonts, assets, data, letter),
    16: (p) => drawLetterSpiritPage(p, fonts, assets, data, letter),
    17: (p) => drawOptionPage(p, fonts, assets, data, 1, opt1, opt1?.displayName ?? data.option1Name),
    18: (p) => drawOptionPage(p, fonts, assets, data, 2, opt2, opt2?.displayName ?? data.option2Name),
    19: (p) => drawRecommendationLevelPage(p, fonts, assets, data, [label1, label2], recCase),
    20: (p) => drawLoshuPage(p, fonts, assets, data),
    21: (p) => drawRajyogPage(p, fonts, assets, data, rajyogs[0]),
    22: (p) => drawRajyogPage(p, fonts, assets, data, rajyogs[1]),
    23: (p) => drawRajyogPage(p, fonts, assets, data, rajyogs[2]),
    24: (p) => drawRajyogNotePage(p, fonts, assets, data),
    38: (p) => drawMantraPage(p, fonts, assets, data, recommended?.displayName ?? ""),
  };

  const TOTAL_PAGES = 50;
  for (let n = 1; n <= TOTAL_PAGES; n++) {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    const build = dynamicPages[n];
    if (build) {
      build(page);
    } else {
      const img = assets.statics.get(n);
      if (!img) throw new Error(`Name Correction PDF: page ${n} is neither dynamic nor a static asset.`);
      page.drawImage(img, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });
    }
  }

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
