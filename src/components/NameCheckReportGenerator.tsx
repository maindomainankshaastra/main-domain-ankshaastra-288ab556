/**
 * NameCheckReportGenerator.tsx
 * -----------------------------------------------------------------------
 * Ankshaastra-branded Name Check Report PDF generator.
 * -----------------------------------------------------------------------
 */

import { PDFDocument, PDFPage, PDFFont, PDFImage, StandardFonts, rgb, RGB, PDFString, PDFName, PDFArray } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { runNameCheck } from "@/lib/name-check/rule-engine";
import { chaldeanRawSum, getFullNameCompoundNumber } from "@/lib/name-check/numerology";
import { FIRST_NAME_BLOCKS, FULL_NAME_BLOCKS, COMPOUND_BLOCKS, comboKey } from "@/lib/name-check/content-blocks";
import { ALL_RULES } from "@/lib/name-check/hr-oa-nr-blocks";

export interface NameCheckReportInput {
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
  // yes = father's/husband's name, don't count middle name
  // no = normal middle name, count it in numerology
  middleNameType?: 'yes' | 'no';

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

const PAGE_WIDTH = 595.28; // A4 portrait, points
const PAGE_HEIGHT = 841.89;

/**
 * Canva → PDF unit conversion. The client's reference file was designed on a
 * 1860 x 2631 px Canva canvas — same aspect ratio as A4 — so any font size
 * read off Canva's toolbar converts straight to PDF points via this factor.
 */
const CANVA_SCALE = PAGE_WIDTH / 1860; // ≈ 0.32005
const px = (v: number) => Math.round(v * CANVA_SCALE * 10) / 10;

const COLOR = {
  blush: rgb(0.988, 0.945, 0.925),
  blushPanel: rgb(0.965, 0.902, 0.89),
  maroon: rgb(0.686, 0.271, 0.259),
  maroonDark: rgb(0.6, 0.22, 0.21),
  ink: rgb(0.686, 0.271, 0.259),
  muted: rgb(0.62, 0.42, 0.4),
  white: rgb(1, 1, 1),
  cream: rgb(0.99, 0.97, 0.95),
  green: rgb(0.15, 0.45, 0.2),
  red: rgb(0.6, 0.15, 0.15),
};

interface Fonts {
  sans: PDFFont;
  sansBold: PDFFont;
  heading: PDFFont;
  quote: PDFFont;
}

const ASSET_PATHS = {
  background: "/name-check-assets/background-border.png",
  backCoverBackground: "/name-check-assets/background-back-cover.png",
  logo: "/name-check-assets/logo-ankshaastra.png",
  loshuGrid: "/name-check-assets/loshu-turtle-grid.png",
  starIcon: "/name-check-assets/star-icon.png",
  handsPraying: "/name-check-assets/praying-hands.png",
  socialInstagram: "/name-check-assets/social-instagram.png",
  socialLinkedin: "/name-check-assets/social-linkedin.png",
  socialYoutube: "/name-check-assets/social-youtube.png",
  socialFacebook: "/name-check-assets/social-facebook.png",
  offerIconPen: "/name-check-assets/offer-icon-pen.png",
  offerIconDigits: "/name-check-assets/offer-icon-digits.png",
  fonts: {
    quicksandRegular: "/name-check-assets/fonts/Quicksand-Regular.ttf",
    quicksandBold: "/name-check-assets/fonts/Quicksand-Bold.ttf",
    cinzelDecorativeBold: "/name-check-assets/fonts/CinzelDecorative-Bold.ttf",
    cardoRegular: "/name-check-assets/fonts/Cardo-Regular.ttf",
  },
};

async function fetchAssetBytes(path: string): Promise<Uint8Array> {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Name Check PDF: failed to fetch design asset "${path}" (${res.status}). Check it was uploaded to /public${path}.`);
  }
  return new Uint8Array(await res.arrayBuffer());
}

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

/** Pure measurement (no drawing) — mirrors drawWrappedText's line count, for pre-sizing boxes. */
function measureWrappedTextHeight(text: string, font: PDFFont, size: number, maxWidth: number, lineHeight: number): number {
  return wrapText(text, font, size, maxWidth).length * lineHeight;
}

/** Pure measurement (no drawing) — mirrors drawBulletList's total consumed height, for pre-sizing boxes. */
function measureBulletListHeight(items: string[], font: PDFFont, size: number, maxWidth: number, lineHeight: number, gap: number): number {
  let total = 0;
  items.forEach((item) => {
    const lineCount = wrapText(item, font, size, maxWidth - 14).length;
    total += lineCount * lineHeight + gap;
  });
  return total;
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

/**
 * Rich-text centered wrap: a sequence of {text, bold} word-tokens, wrapped to maxWidth
 * and horizontally centered per line, switching between opts.font (regular) and
 * opts.boldFont for individual words. Used for the Welcome-page quote, where the
 * numerologist's credential phrase must render bold mid-paragraph.
 */
function drawRichWrappedTextCentered(
  page: PDFPage,
  tokens: { text: string; bold: boolean }[],
  opts: { centerX: number; y: number; font: PDFFont; boldFont: PDFFont; size: number; maxWidth: number; lineHeight: number; color: RGB }
): number {
  const lines: { text: string; bold: boolean }[][] = [];
  let currentLine: { text: string; bold: boolean }[] = [];
  let currentWidth = 0;
  const spaceWidth = opts.font.widthOfTextAtSize(" ", opts.size);

  tokens.forEach((tok) => {
    const font = tok.bold ? opts.boldFont : opts.font;
    const wordWidth = font.widthOfTextAtSize(tok.text, opts.size);
    const addWidth = (currentLine.length > 0 ? spaceWidth : 0) + wordWidth;
    if (currentWidth + addWidth > opts.maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = [tok];
      currentWidth = wordWidth;
    } else {
      currentLine.push(tok);
      currentWidth += addWidth;
    }
  });
  if (currentLine.length > 0) lines.push(currentLine);

  let cursorY = opts.y;
  lines.forEach((line) => {
    const lineWidth = line.reduce((sum, tok, i) => {
      const font = tok.bold ? opts.boldFont : opts.font;
      return sum + font.widthOfTextAtSize(tok.text, opts.size) + (i > 0 ? spaceWidth : 0);
    }, 0);
    let x = opts.centerX - lineWidth / 2;
    line.forEach((tok) => {
      const font = tok.bold ? opts.boldFont : opts.font;
      page.drawText(tok.text, { x, y: cursorY, size: opts.size, font, color: opts.color });
      x += font.widthOfTextAtSize(tok.text, opts.size) + spaceWidth;
    });
    cursorY -= opts.lineHeight;
  });
  return cursorY;
}

/** Splits "prefix BOLDPHRASE suffix" into word-tokens with a bold flag, for drawRichWrappedTextCentered. */
function buildBoldPhraseTokens(fullText: string, boldPhrase: string): { text: string; bold: boolean }[] {
  const idx = fullText.indexOf(boldPhrase);
  if (idx === -1) return fullText.split(/\s+/).map((w) => ({ text: w, bold: false }));
  const before = fullText.slice(0, idx);
  const bold = fullText.slice(idx, idx + boldPhrase.length);
  const after = fullText.slice(idx + boldPhrase.length);
  return [
    ...before.split(/\s+/).filter(Boolean).map((w) => ({ text: w, bold: false })),
    ...bold.split(/\s+/).filter(Boolean).map((w) => ({ text: w, bold: true })),
    ...after.split(/\s+/).filter(Boolean).map((w) => ({ text: w, bold: false })),
  ];
}

interface Assets {
  background: PDFImage;
  backCoverBackground: PDFImage;
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

/** Fully-rounded maroon pill banner used for section headers. Text = 45px-Canva ≈14.4pt. */
function drawMaroonBanner(page: PDFPage, fonts: Fonts, text: string, boxX: number, boxTopY: number, boxWidth: number, height = 34) {
  const label = text.toUpperCase();
  const size = px(45);
  const textWidth = fonts.sansBold.widthOfTextAtSize(label, size);
  const width = Math.min(boxWidth - 16, textWidth + 56);
  const x = boxX + boxWidth / 2 - width / 2;
  const y = boxTopY - height / 2;
  drawRoundedRect(page, { x, y, width, height, radius: height / 2, color: COLOR.maroon });
  page.drawText(label, {
    x: x + width / 2 - textWidth / 2,
    y: y + height / 2 - size * 0.35,
    size,
    font: fonts.sansBold,
    color: COLOR.white,
  });
}

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

function drawStarGlyph(page: PDFPage, cx: number, cy: number, r: number, color: RGB) {
  const path = `M ${r} 0 L ${r * 1.32} ${r * 0.68} L ${r * 2} ${r} L ${r * 1.32} ${r * 1.32} L ${r} ${r * 2} L ${r * 0.68} ${r * 1.32} L 0 ${r} L ${r * 0.68} ${r * 0.68} Z`;
  page.drawSvgPath(path, { x: cx - r, y: cy + r, color });
}

/** Adds an invisible clickable-URL region over a page area (used for the social icons on page 13). */
function addLinkAnnotation(page: PDFPage, url: string, rect: { x: number; y: number; width: number; height: number }) {
  const doc = page.doc;
  const linkAnnotRef = doc.context.register(
    doc.context.obj({
      Type: "Annot",
      Subtype: "Link",
      Rect: [rect.x, rect.y, rect.x + rect.width, rect.y + rect.height],
      Border: [0, 0, 0],
      A: {
        Type: "Action",
        S: "URI",
        URI: PDFString.of(url),
      },
    })
  );
  const existingAnnots = page.node.Annots();
  if (existingAnnots) {
    existingAnnots.push(linkAnnotRef);
  } else {
    page.node.set(PDFName.of("Annots"), doc.context.obj([linkAnnotRef]));
  }
}

type OfferIconType = "pen" | "grid" | "digits" | "letter" | "document";

/**
 * Pricing-card bullet-row icon badges. "pen" and "digits" use the REAL glyphs
 * extracted from the client's reference PDF (see ASSET_PATHS.offerIconPen /
 * offerIconDigits) — both are fit-to-contain within a box no larger than the
 * badge circle's inscribed square, so they can never poke outside the circle.
 * "grid" / "letter" / "document" are vector-drawn to match the reference
 * exactly (grid: 1 top-left, 8 top-right, 7 center — verified against the
 * reference PDF pixel-for-pixel; letter: a large single "A" in the heading
 * font; document: a stack of report pages).
 */
function drawOfferIcon(page: PDFPage, fonts: Fonts, assets: Assets, type: OfferIconType, cx: number, cy: number, r: number) {
  const white = COLOR.white;
  const maxBox = r * 1.3; // inscribed-square-ish bound — keeps every icon safely inside the circle

  const drawContainedImage = (img: PDFImage) => {
    const scale = Math.min(maxBox / img.width, maxBox / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    page.drawImage(img, { x: cx - w / 2, y: cy - h / 2, width: w, height: h });
  };

  switch (type) {
    case "pen": {
      drawContainedImage(assets.offerIconPen);
      break;
    }
    case "digits": {
      drawContainedImage(assets.offerIconDigits);
      break;
    }
    case "grid": {
      const gridSize = maxBox;
      const cell = gridSize / 3;
      const originX = cx - gridSize / 2;
      const originY = cy - gridSize / 2;
      for (let i = 0; i <= 3; i++) {
        page.drawLine({ start: { x: originX + i * cell, y: originY }, end: { x: originX + i * cell, y: originY + gridSize }, thickness: 0.9, color: white });
        page.drawLine({ start: { x: originX, y: originY + i * cell }, end: { x: originX + gridSize, y: originY + i * cell }, thickness: 0.9, color: white });
      }
      const numSize = cell * 0.62;
      const placeNum = (label: string, col: number, row: number) => {
        const ccx = originX + col * cell + cell / 2;
        const ccy = originY + gridSize - row * cell - cell / 2;
        page.drawText(label, { x: ccx - fonts.sansBold.widthOfTextAtSize(label, numSize) / 2, y: ccy - numSize * 0.36, size: numSize, font: fonts.sansBold, color: white });
      };
      placeNum("1", 0, 0);
      placeNum("8", 2, 0);
      placeNum("7", 1, 1);
      break;
    }
    case "letter": {
      const label = "A";
      const size = maxBox * 1.05;
      page.drawText(label, { x: cx - fonts.heading.widthOfTextAtSize(label, size) / 2, y: cy - size * 0.36, size, font: fonts.heading, color: white });
      break;
    }
    case "document": {
      const w = maxBox * 0.62;
      const h = maxBox * 0.8;
      const offset = 2.6;
      for (let i = 2; i >= 0; i--) {
        const x = cx - w / 2 + i * offset;
        const y = cy - h / 2 - i * offset;
        page.drawRectangle({ x, y, width: w, height: h, borderColor: white, borderWidth: 0.9 });
      }
      const lineX = cx - w / 2 + 3;
      const lineW = w - 6;
      [0.3, 0.5, 0.7].forEach((f) => {
        page.drawLine({ start: { x: lineX, y: cy - h / 2 + h * f }, end: { x: lineX + lineW, y: cy - h / 2 + h * f }, thickness: 0.8, color: white });
      });
      break;
    }
  }
}

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

  const kickerSize = px(50);
  const mainSize = px(80);

  titleLines.forEach((line, i) => {
    const isLast = i === titleLines.length - 1;
    let size = isLast ? mainSize : kickerSize;
    const font = fonts.heading;
    while (font.widthOfTextAtSize(line, size) > maxTitleWidth && size > 11) size -= 1;
    page.drawText(line, {
      x: centerX - font.widthOfTextAtSize(line, size) / 2,
      y: titleY,
      size,
      font,
      color: COLOR.maroon,
    });
    titleY -= isLast ? mainSize + 10 : kickerSize + 10;
  });

  const dividerY = titleY + 12;
  page.drawLine({ start: { x: centerX - 165, y: dividerY }, end: { x: centerX - 14, y: dividerY }, thickness: 1, color: COLOR.maroon });
  page.drawLine({ start: { x: centerX + 14, y: dividerY }, end: { x: centerX + 165, y: dividerY }, thickness: 1, color: COLOR.maroon });
  drawStarGlyph(page, centerX, dividerY, 6, COLOR.maroon);

  if (opts.subtitle) {
    const subLabel = opts.subtitle.toUpperCase();
    const subSize = px(45);
    page.drawText(subLabel, {
      x: centerX - fonts.sansBold.widthOfTextAtSize(subLabel, subSize) / 2,
      y: dividerY - subSize - 8,
      size: subSize,
      font: fonts.sansBold,
      color: COLOR.maroonDark,
    });
  }

  drawFooterPill(page, fonts, opts.brand);
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
    size,
    font: fonts.sansBold,
    color: COLOR.white,
  });
}

function drawDataTable(
  page: PDFPage,
  fonts: Fonts,
  rows: [string, string][],
  opts: { x: number; y: number; width: number; rowHeight?: number }
): number {
  const size = px(45);
  const rowHeight = opts.rowHeight ?? Math.max(32, size + 18);
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
      x: labelColCenter - fonts.sansBold.widthOfTextAtSize(label, size) / 2,
      y: y - rowHeight / 2 - size * 0.35,
      size,
      font: fonts.sansBold,
      color: COLOR.maroonDark,
    });
    const valueText = value || "—";
    page.drawText(valueText, {
      x: valueColCenter - fonts.sansBold.widthOfTextAtSize(valueText, size) / 2,
      y: y - rowHeight / 2 - size * 0.35,
      size,
      font: fonts.sansBold,
      color: COLOR.ink,
    });
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

  const LOGO_TARGET_WIDTH = 210;
  const logoScale = LOGO_TARGET_WIDTH / assets.logo.width;
  const logoDims = assets.logo.scale(logoScale);
  let y = PAGE_HEIGHT - 40;
  page.drawImage(assets.logo, { x: centerX - logoDims.width / 2, y: y - logoDims.height, width: logoDims.width, height: logoDims.height });
  y -= logoDims.height + 60;

  const GRID_TARGET_WIDTH = 230;
  const gridScale = GRID_TARGET_WIDTH / assets.loshuGrid.width;
  const gridDims = assets.loshuGrid.scale(gridScale);
  page.drawImage(assets.loshuGrid, { x: centerX - gridDims.width / 2, y: y - gridDims.height, width: gridDims.width, height: gridDims.height });
  y -= gridDims.height + 56;

  const titleSize = px(124);
  page.drawText("NAME CHECK", {
    x: centerX - fonts.heading.widthOfTextAtSize("NAME CHECK", titleSize) / 2,
    y,
    size: titleSize,
    font: fonts.heading,
    color: COLOR.maroon,
  });
  y -= titleSize + 8;
  page.drawText("REPORT", {
    x: centerX - fonts.heading.widthOfTextAtSize("REPORT", titleSize) / 2,
    y,
    size: titleSize,
    font: fonts.heading,
    color: COLOR.maroon,
  });
  y -= titleSize + 16;

  const bylineSize = px(100);
  const byline = data.brand.numerologistName.replace(/\s+Ji$/i, "").toUpperCase();
  page.drawText(byline, {
    x: centerX - fonts.heading.widthOfTextAtSize(byline, bylineSize) / 2,
    y,
    size: bylineSize,
    font: fonts.heading,
    color: COLOR.maroonDark,
  });
  y -= 14;
  page.drawLine({ start: { x: centerX - 60, y }, end: { x: centerX + 60, y }, thickness: 1, color: COLOR.maroon });

  drawFooterPill(page, fonts, data.brand);
}

function drawIndexPage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
  drawPageBackground(page, assets);
  const centerX = PAGE_WIDTH / 2;

  const titleSize = px(100);
  page.drawText("INDEX", {
    x: centerX - fonts.heading.widthOfTextAtSize("INDEX", titleSize) / 2,
    y: PAGE_HEIGHT - 96,
    size: titleSize,
    font: fonts.heading,
    color: COLOR.maroon,
  });
  const dividerY = PAGE_HEIGHT - 96 - titleSize + 10;
  page.drawLine({ start: { x: centerX - 165, y: dividerY }, end: { x: centerX - 14, y: dividerY }, thickness: 1, color: COLOR.maroon });
  page.drawLine({ start: { x: centerX + 14, y: dividerY }, end: { x: centerX + 165, y: dividerY }, thickness: 1, color: COLOR.maroon });
  drawStarGlyph(page, centerX, dividerY, 6, COLOR.maroon);
  drawFooterPill(page, fonts, data.brand);

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
      items: ["Part 1: First Name Number", "Part 2: Full Name Number", "Part 3: Full Name Compound Number"],
    },
  ];

  const numSize = px(160);
  const bodySize = px(45);

    let y = dividerY - 60;
  const tableX = 44;
  const tableWidth = PAGE_WIDTH - 88;
  const numColW = 84;
  const titleColW = 170;

  const itemsTextX = tableX + numColW + titleColW + 10;
  const itemsInnerWidth = tableX + tableWidth - 10 - itemsTextX;

  rows.forEach((row) => {
    const titleLineCount = row.title.split("\n").length;
    const itemLineTotal = row.items.reduce((sum, item) => sum + wrapText(`• ${item}`, fonts.sans, bodySize, itemsInnerWidth).length, 0);
    const rowHeight = Math.max(numSize + 20, 26 + titleLineCount * (bodySize + 6) + itemLineTotal * (bodySize + 6) + 16);
    page.drawRectangle({
      x: tableX,
      y: y - rowHeight,
      width: tableWidth,
      height: rowHeight,
      borderColor: COLOR.maroon,
      borderWidth: 0.75,
    });
    page.drawLine({ start: { x: tableX + numColW, y }, end: { x: tableX + numColW, y: y - rowHeight }, thickness: 0.5, color: COLOR.maroon });
    page.drawLine({ start: { x: tableX + numColW + titleColW, y }, end: { x: tableX + numColW + titleColW, y: y - rowHeight }, thickness: 0.5, color: COLOR.maroon });
    page.drawText(row.no, {
      x: tableX + numColW / 2 - fonts.sansBold.widthOfTextAtSize(row.no, numSize) / 2,
      y: y - rowHeight / 2 - numSize * 0.35,
      size: numSize,
      font: fonts.sansBold,
      color: COLOR.maroon,
    });
    let titleY = y - bodySize - 10;
    row.title.split("\n").forEach((line) => {
      page.drawText(line, { x: tableX + numColW + 10, y: titleY, size: bodySize, font: fonts.sans, color: COLOR.maroonDark });
      titleY -= bodySize + 6;
    });
        let itemY = y - bodySize - 10;
    row.items.forEach((item) => {
      itemY = drawWrappedText(page, `• ${item}`, { x: itemsTextX, y: itemY, font: fonts.sans, size: bodySize, maxWidth: itemsInnerWidth, lineHeight: bodySize + 6, color: COLOR.ink });
    });
    y -= rowHeight;
  });
}

function drawWelcomePage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
  drawPageBackground(page, assets);
  const centerX = PAGE_WIDTH / 2;

  const LOGO_TARGET_WIDTH = 150;
  const logoScale = LOGO_TARGET_WIDTH / assets.logo.width;
  const logoDims = assets.logo.scale(logoScale);
  let y = PAGE_HEIGHT - 40;
  page.drawImage(assets.logo, { x: centerX - logoDims.width / 2, y: y - logoDims.height, width: logoDims.width, height: logoDims.height });
  y -= logoDims.height + 34;

  const titleSize = px(80);
  const nameStr = data.firstName || data.customerName;
  const line1 = `"Namaskar`;
  const line2 = `${nameStr} Ji"`;
  [line1, line2].forEach((line) => {
    let size = titleSize;
    while (fonts.heading.widthOfTextAtSize(line, size) > PAGE_WIDTH - 96 && size > 14) size -= 1;
    page.drawText(line, { x: centerX - fonts.heading.widthOfTextAtSize(line, size) / 2, y, size, font: fonts.heading, color: COLOR.maroon });
    y -= size + 10;
  });

  const dividerY = y + 6;
  page.drawLine({ start: { x: centerX - 165, y: dividerY }, end: { x: centerX - 14, y: dividerY }, thickness: 1, color: COLOR.maroon });
  page.drawLine({ start: { x: centerX + 14, y: dividerY }, end: { x: centerX + 165, y: dividerY }, thickness: 1, color: COLOR.maroon });
  drawStarGlyph(page, centerX, dividerY, 6, COLOR.maroon);
  drawFooterPill(page, fonts, data.brand);

  let cy = dividerY - 40;
  const bodySize = px(45);
  const boldPhrase = `Astro-Numerologist ${data.brand.numerologistName}.`;
  const message = `"This personalised Name Check Report has been prepared after careful analysis of your birth date and current name by celebrity ${boldPhrase} The name analysis is rooted in the approach of Chaldean Numerology and the Loshu Grid. The purpose of this report is to identify how the cosmic energies influencing your life align with your current name. Please approach these insights with faith, consistency and pure intention. May this guide illuminate your path towards prosperity, peace and spiritual growth."`;

  const tokens = buildBoldPhraseTokens(message, boldPhrase);
  cy = drawRichWrappedTextCentered(page, tokens, {
    centerX,
    y: cy,
    font: fonts.quote,
    boldFont: fonts.sansBold,
    size: bodySize,
    maxWidth: PAGE_WIDTH - 140,
    lineHeight: bodySize + 8,
    color: COLOR.maroonDark,
  });

  const HANDS_TARGET_WIDTH = 130;
  const handsScale = HANDS_TARGET_WIDTH / assets.handsPraying.width;
  const handsDims = assets.handsPraying.scale(handsScale);
  const HANDS_BOTTOM_Y = 190;
  const handsTop = Math.min(cy - 30, HANDS_BOTTOM_Y + handsDims.height);
  page.drawImage(assets.handsPraying, {
    x: centerX - handsDims.width / 2,
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
  drawPageBackground(page, assets);
  const centerX = PAGE_WIDTH / 2;

  const titleSize = px(80);
  const title = "Numerological Blueprint";
  page.drawText(title, {
    x: centerX - fonts.heading.widthOfTextAtSize(title, titleSize) / 2,
    y: PAGE_HEIGHT - 96,
    size: titleSize,
    font: fonts.heading,
    color: COLOR.maroon,
  });
  const dividerY = PAGE_HEIGHT - 96 - titleSize + 10;
  page.drawLine({ start: { x: centerX - 165, y: dividerY }, end: { x: centerX - 14, y: dividerY }, thickness: 1, color: COLOR.maroon });
  page.drawLine({ start: { x: centerX + 14, y: dividerY }, end: { x: centerX + 165, y: dividerY }, thickness: 1, color: COLOR.maroon });
  drawStarGlyph(page, centerX, dividerY, 6, COLOR.maroon);
  drawFooterPill(page, fonts, data.brand);

  const boxX = 44;
  const boxWidth = PAGE_WIDTH - 88;
  const bannerSize = px(45);
  const bannerY = dividerY - 40;
  const bannerHeight = bannerSize + 26;
  drawRoundedRect(page, { x: boxX, y: bannerY - bannerHeight, width: boxWidth, height: bannerHeight, radius: bannerHeight / 2, color: COLOR.maroon });
  page.drawText("PERSONAL INFORMATION", {
    x: boxX + 24,
    y: bannerY - bannerHeight / 2 - bannerSize * 0.35,
    size: bannerSize,
    font: fonts.sansBold,
    color: COLOR.white,
  });

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

function drawScienceOfNamesPage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
  drawPageChrome(page, fonts, assets, { title: "The Science of\nName Numbers", pageNumber, totalPages, brand: data.brand });

  const boxX = 44;
  const boxWidth = PAGE_WIDTH - 88;
  const bodySize = px(45);
  const innerWidth = boxWidth - 36;
  const introText =
    "Every letter in the alphabet carries a specific numeric vibration. When combined, the letters of a name create unique energy patterns that influence:";
  const bulletItems = [
    "How others perceive you",
    "Your natural talents and abilities",
    "Career and financial opportunities",
    "Relationship dynamics",
    "Mental and emotional patterns",
    "Life challenges and lessons",
  ];

  const introHeight = measureWrappedTextHeight(introText, fonts.sans, bodySize, innerWidth, bodySize + 4);
  const bulletsHeight = measureBulletListHeight(bulletItems, fonts.sans, bodySize, innerWidth, bodySize + 4, 4);
  const box1Height = 44 + introHeight + 8 + bulletsHeight + 22;

  let y = PAGE_HEIGHT - 185;
  let boxTop = y;
  drawContentBox(page, { x: boxX, y: boxTop, width: boxWidth, height: box1Height });
  drawMaroonBanner(page, fonts, "What Is Name Numerology", boxX, boxTop, boxWidth);
  let cy = boxTop - 44;
  cy = drawWrappedText(page, introText, { x: 62, y: cy, font: fonts.sans, size: bodySize, maxWidth: innerWidth, lineHeight: bodySize + 4, color: COLOR.ink });
  cy -= 8;
  drawBulletList(page, bulletItems, { x: 62, y: cy, font: fonts.sans, size: bodySize, maxWidth: innerWidth, lineHeight: bodySize + 4, gap: 4, color: COLOR.ink });

  const box2Text =
    "You hear and respond to your name thousands of times throughout life. Each utterance reinforces the vibrational pattern, making your name a constant affirmation — positive or negative — depending on its alignment with your destiny.";
  const box2InnerWidth = boxWidth - 64;
  const box2TextHeight = measureWrappedTextHeight(box2Text, fonts.sans, bodySize, box2InnerWidth, bodySize + 5);
  const box2Height = 50 + box2TextHeight + 20;

  y = boxTop - box1Height - 32;
  boxTop = y;
  drawContentBox(page, { x: boxX, y: boxTop, width: boxWidth, height: box2Height });
  drawMaroonBanner(page, fonts, "Why Your Name Matters", boxX, boxTop, boxWidth);
  drawWrappedTextCentered(page, box2Text, { centerX: boxX + boxWidth / 2, y: boxTop - 50, font: fonts.sans, size: bodySize, maxWidth: box2InnerWidth, lineHeight: bodySize + 5, color: COLOR.ink });
}

function drawChaldeanSystemPage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
  drawPageChrome(page, fonts, assets, { title: "Numerological\nSystems Used", subtitle: "This Report Analyzes Your Name Using", pageNumber, totalPages, brand: data.brand });

  const boxX = 44;
  const boxWidth = PAGE_WIDTH - 88;
  const bodySize = px(45);
    let boxTop = PAGE_HEIGHT - 210;
  const chaldeanBullets = [
    "Ancient Babylonian system — considered the most accurate approach for name analysis.",
    "Values run 1 to 8 (9 is considered sacred and is never assigned to a letter).",
    "Focuses on the sound vibration and energy of each letter, rather than its position in the alphabet.",
  ];
  const chaldeanInnerWidth = boxWidth - 36;
  const chaldeanBulletsHeight = measureBulletListHeight(chaldeanBullets, fonts.sans, bodySize, chaldeanInnerWidth, bodySize + 3, 8);
  const boxHeight = 46 + chaldeanBulletsHeight + 18;
  drawContentBox(page, { x: boxX, y: boxTop, width: boxWidth, height: boxHeight });
  drawMaroonBanner(page, fonts, "Chaldean Numerology", boxX, boxTop, boxWidth);
  drawBulletList(page, chaldeanBullets, { x: 62, y: boxTop - 46, font: fonts.sans, size: bodySize, maxWidth: chaldeanInnerWidth, lineHeight: bodySize + 3, gap: 8, color: COLOR.ink });

  const chartTop = boxTop - boxHeight - 32;
  drawMaroonBanner(page, fonts, "The Chaldean Number Chart", boxX, chartTop, boxWidth);

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
  const cellSize = px(36.7);
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
      x: gridX + c * colWidth + colWidth / 2 - fonts.sansBold.widthOfTextAtSize(numStr, cellSize) / 2,
      y: gridTop - rowHeight / 2 - cellSize * 0.35,
      size: cellSize,
      font: fonts.sansBold,
      color: COLOR.maroon,
    });
    columns[c].forEach((letter, r) => {
      page.drawText(letter, {
        x: gridX + c * colWidth + colWidth / 2 - fonts.sans.widthOfTextAtSize(letter, cellSize) / 2,
        y: gridTop - (r + 2) * rowHeight + rowHeight / 2 - cellSize * 0.35,
        size: cellSize,
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
  const bodySize = px(45);
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
  drawBulletList(page, items, { x: 62, y: boxTop - 46, font: fonts.sans, size: bodySize, maxWidth: boxWidth - 36, lineHeight: bodySize + 4.5, gap: 16, color: COLOR.ink });
}

function drawCurrentNameBreakdownPage(
  page: PDFPage,
  fonts: Fonts,
  assets: Assets,
  data: Required<NameCheckReportInput>,
  opts: { heading: string; nameLabel: string; nameValue: string; total: number; reducedTo?: number; bullets: string[] },
  pageNumber: number,
  totalPages: number
) {
  drawPageChrome(page, fonts, assets, { title: "Current Name\nBreakdown", subtitle: opts.heading, pageNumber, totalPages, brand: data.brand });

  const boxX = 44;
  const boxWidth = PAGE_WIDTH - 88;
  const bodySize = px(45);
  const nameRowH = 34;
  const totalsRowH = 34;
  let y = PAGE_HEIGHT - 215;

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
        x: cx - fonts.sansBold.widthOfTextAtSize(txt, isLabel ? 10 : 13) / 2,
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
  const innerWidth = boxWidth - 36;
  const bulletsHeight = measureBulletListHeight(opts.bullets, fonts.sans, bodySize, innerWidth, bodySize + 4, 12);
  const contentBoxHeight = 46 + bulletsHeight + 22;
  drawContentBox(page, { x: boxX, y: contentBoxTop, width: boxWidth, height: contentBoxHeight });
  drawMaroonBanner(page, fonts, "What This Represents", boxX, contentBoxTop, boxWidth);
  drawBulletList(page, opts.bullets, { x: 62, y: contentBoxTop - 46, font: fonts.sans, size: bodySize, maxWidth: innerWidth, lineHeight: bodySize + 4, gap: 12, color: COLOR.ink });
}

const VERDICT_LABEL: Record<"HR" | "OA" | "NR", string> = {
  HR: "Highly Recommended",
  OA: "Optional / Advisable",
  NR: "Not Required",
};

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
  const bodySize = px(45);
  const boxTop = PAGE_HEIGHT - 215;
  const innerWidth = boxWidth - 36;

  const rawBullets = rule?.paragraphs ?? [
    "Name correction guidance could not be determined for this combination — please review this report manually before sending it to the customer.",
  ];
  // The LAST paragraph is a recommendation/verdict statement ("Name correction
  // is advisable for the full name...") rather than a supporting fact — it
  // belongs inside the "Optional / Advisable" verdict box below, not as a
  // bullet in the main "Why This Is Critical" box.
  const bullets = rawBullets.length > 1 ? rawBullets.slice(0, -1) : rawBullets;
  const verdictNote = rawBullets.length > 1 ? rawBullets[rawBullets.length - 1] : null;

  const bulletsHeight = measureBulletListHeight(bullets, fonts.sans, bodySize, innerWidth, bodySize + 4.5, 14);
  const boxHeight = 46 + bulletsHeight + 22;

  drawContentBox(page, { x: boxX, y: boxTop, width: boxWidth, height: boxHeight });
  drawMaroonBanner(page, fonts, "Why This Is Critical", boxX, boxTop, boxWidth);
  drawBulletList(page, bullets, { x: 62, y: boxTop - 46, font: fonts.sans, size: bodySize, maxWidth: innerWidth, lineHeight: bodySize + 4.5, gap: 14, color: COLOR.ink });

  const verdictLabel = `${VERDICT_LABEL[matched.verdict]}${matched.isFallback ? " (fallback — review recommended)" : ""}`;
  const verdictTop = boxTop - boxHeight - 46;

  const verdictLabelLineHeight = 17;
  const verdictLabelLines = wrapText(verdictLabel, fonts.sansBold, 13, boxWidth - 60);
  const verdictNoteSize = 10;
  const verdictNoteLineHeight = verdictNoteSize + 4;
  const verdictNoteInnerWidth = boxWidth - 60;
  const verdictNoteLines = verdictNote ? wrapText(verdictNote, fonts.sans, verdictNoteSize, verdictNoteInnerWidth) : [];
  const verdictTopPadding = 22;
  const verdictBottomPadding = 18;
  const verdictGap = 8;
  const verdictContentHeight =
    verdictLabelLines.length * verdictLabelLineHeight + (verdictNote ? verdictGap + verdictNoteLines.length * verdictNoteLineHeight : 0);
  const verdictHeight = Math.max(78, verdictTopPadding + verdictContentHeight + verdictBottomPadding);

  drawRoundedRect(page, { x: boxX, y: verdictTop - verdictHeight, width: boxWidth, height: verdictHeight, radius: 18, color: COLOR.maroon, borderColor: COLOR.maroon, borderWidth: 1 });

  let verdictCursorY = verdictTop - verdictTopPadding - (verdictLabelLineHeight - 6);
  verdictCursorY = drawWrappedTextCentered(page, verdictLabel, {
    centerX: boxX + boxWidth / 2,
    y: verdictCursorY,
    font: fonts.sansBold,
    size: 13,
    maxWidth: boxWidth - 60,
    lineHeight: verdictLabelLineHeight,
    color: COLOR.white,
  });
  if (verdictNote) {
    verdictCursorY -= verdictGap - (verdictLabelLineHeight - verdictNoteLineHeight);
    drawWrappedTextCentered(page, verdictNote, {
      centerX: boxX + boxWidth / 2,
      y: verdictCursorY,
      font: fonts.sans,
      size: verdictNoteSize,
      maxWidth: verdictNoteInnerWidth,
      lineHeight: verdictNoteLineHeight,
      color: COLOR.white,
    });
  }
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

  let y = PAGE_HEIGHT - 220;
  const dotR = 9;
  const bodySize = px(45);
  services.forEach((service) => {
    page.drawCircle({ x: 44 + dotR, y: y - 5, size: dotR, borderColor: COLOR.maroon, borderWidth: 1 });
    drawStarGlyph(page, 44 + dotR, y - 5, 3.6, COLOR.maroon);
    page.drawText(service, { x: 44 + dotR * 2 + 14, y: y - bodySize * 0.35 - 5, size: bodySize, font: fonts.sans, color: COLOR.ink });
    y -= bodySize + 20;
  });
}

/** Page 12 — the two upsell offer cards, side by side. */
function drawPricingPage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
  drawPageBackground(page, assets);
  const centerX = PAGE_WIDTH / 2;

  const logoDims = assets.logo.scale(0.16);
  page.drawImage(assets.logo, { x: centerX - logoDims.width / 2, y: PAGE_HEIGHT - 56 - logoDims.height, width: logoDims.width, height: logoDims.height });

  let titleY = PAGE_HEIGHT - 100 - logoDims.height;
  page.drawText("YOUR NAME DECIDES", { x: centerX - fonts.heading.widthOfTextAtSize("YOUR NAME DECIDES", 14) / 2, y: titleY, size: 14, font: fonts.heading, color: COLOR.maroon });
  titleY -= 26;
  page.drawText("YOUR SPEED IN LIFE", { x: centerX - fonts.heading.widthOfTextAtSize("YOUR SPEED IN LIFE", 21) / 2, y: titleY, size: 21, font: fonts.heading, color: COLOR.maroon });
  const dividerY = titleY - 16;
  page.drawLine({ start: { x: centerX - 150, y: dividerY }, end: { x: centerX - 14, y: dividerY }, thickness: 1, color: COLOR.maroon });
  page.drawLine({ start: { x: centerX + 14, y: dividerY }, end: { x: centerX + 150, y: dividerY }, thickness: 1, color: COLOR.maroon });
  drawStarGlyph(page, centerX, dividerY, 6, COLOR.maroon);

  type Offer = { price: string; strike: string; off: string; title: string; bullets: string[]; icons: OfferIconType[]; note: string };
  const offers: Offer[] = [
    {
      price: "₹2,987",
      strike: "₹ 7,500",
      off: "GET 60% OFF",
      title: "Name Correction Report",
      bullets: ["First Name & Full Name Analysis", "2 Corrected Name Spelling Options", "Compound Number Analysis", "First Alphabet Analysis"],
      icons: ["pen", "grid", "digits", "letter"],
      note: "Comprehensive report with detailed name correction and analysis.",
    },
    {
      price: "₹3,437",
      strike: "₹ 7,500",
      off: "GET 54% OFF",
      title: "Perfect Baby Name Report",
      bullets: ["10+ Numerologically Aligned Names", "Mulank, Bhagyank & Rajyog Analysis", "First, Full & Compound Number Analysis", "45+ Page Report & Call Consultation Included"],
      icons: ["pen", "grid", "digits", "document"],
      note: "Get 10+ Numerologically Aligned Names for your child.",
    },
  ];

  const colGap = 16;
  const colWidth = (PAGE_WIDTH - 88 - colGap) / 2;
  const colTop = dividerY - 34;

  const digitsSize = px(105);
  const rupeeSize = Math.round(digitsSize * 0.82 * 10) / 10;

  offers.forEach((offer, i) => {
    const cx = 44 + i * (colWidth + colGap);

    const priceDigits = offer.price.replace(/^\D*/, "");
    const rupeeWidth = fonts.sansBold.widthOfTextAtSize("₹", rupeeSize);
    const digitsWidth = fonts.heading.widthOfTextAtSize(priceDigits, digitsSize);
    const priceWidth = rupeeWidth + digitsWidth + 50;
    const priceH = digitsSize + 22;

    let iy = colTop - priceH - 26;
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

    const bulletTextX = 44;
    offer.bullets.forEach((b, bi) => {
      const textWidth = colWidth - 28 - bulletTextX - 14;
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

    iy -= 6;
    const btnH = 34;
    const btnY = iy - 20;
    const cardBottom = btnY - 14;
    drawRoundedRect(page, { x: cx, y: cardBottom, width: colWidth, height: colTop - cardBottom, radius: 18, borderColor: COLOR.maroon, borderWidth: 1 });
    drawRoundedRect(page, { x: cx + colWidth / 2 - priceWidth / 2, y: colTop - priceH / 2, width: priceWidth, height: priceH, radius: priceH / 2, color: COLOR.maroon });
    const priceStartX = cx + colWidth / 2 - (rupeeWidth + digitsWidth) / 2;
    page.drawText("₹", { x: priceStartX, y: colTop - priceH / 2 + priceH * 0.32, size: rupeeSize, font: fonts.sansBold, color: COLOR.white });
    page.drawText(priceDigits, { x: priceStartX + rupeeWidth, y: colTop - priceH / 2 + priceH * 0.3, size: digitsSize, font: fonts.heading, color: COLOR.white });

    drawRoundedRect(page, { x: cx + 12, y: btnY, width: colWidth - 24, height: btnH, radius: btnH / 2, color: COLOR.maroon });
    const btnLabel = "CLICK NOW";
    page.drawText(btnLabel, { x: cx + colWidth / 2 - fonts.sansBold.widthOfTextAtSize(btnLabel, 11) / 2, y: btnY + btnH / 2 - 4, size: 11, font: fonts.sansBold, color: COLOR.white });
  });

  drawFooterPill(page, fonts, data.brand);
}

/** Page 13 — social follow icons, each linking out to the real Ankshaastra profile. */
function drawConnectPage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
  drawPageBackground(page, assets);
  const centerX = PAGE_WIDTH / 2;

  const titleSize = px(80);
  const title = "Connect With Me";
  page.drawText(title, { x: centerX - fonts.heading.widthOfTextAtSize(title, titleSize) / 2, y: PAGE_HEIGHT - 96, size: titleSize, font: fonts.heading, color: COLOR.maroon });
  const dividerY = PAGE_HEIGHT - 96 - titleSize + 10;
  page.drawLine({ start: { x: centerX - 165, y: dividerY }, end: { x: centerX - 14, y: dividerY }, thickness: 1, color: COLOR.maroon });
  page.drawLine({ start: { x: centerX + 14, y: dividerY }, end: { x: centerX + 165, y: dividerY }, thickness: 1, color: COLOR.maroon });
  drawStarGlyph(page, centerX, dividerY, 6, COLOR.maroon);
  drawFooterPill(page, fonts, data.brand);

  const subtitleSize = px(45);
  const subtitle = "FOLLOW FOR DAILY WISDOM, TIPS, AND INSPIRATION";
  page.drawText(subtitle, { x: centerX - fonts.sansBold.widthOfTextAtSize(subtitle, subtitleSize) / 2, y: dividerY - subtitleSize - 20, size: subtitleSize, font: fonts.sansBold, color: COLOR.maroonDark });

  const platforms: { image: PDFImage; url: string }[] = [
    { image: assets.socialInstagram, url: "https://www.instagram.com/ankshaastra/" },
    { image: assets.socialLinkedin, url: "https://www.linkedin.com/company/ankshaastra/?viewAsMember=true" },
    { image: assets.socialYoutube, url: "https://www.youtube.com/@Ankshaastra" },
    { image: assets.socialFacebook, url: "https://www.facebook.com/p/Ankshaastra-61561549995939/" },
  ];
  const colXs = [centerX - 155, centerX + 155];
  const rowYs = [dividerY - subtitleSize - 110, dividerY - subtitleSize - 240];
  let idx = 0;
  rowYs.forEach((ry) => {
    colXs.forEach((cx) => {
      const { image, url } = platforms[idx++];

      // Outer "halo" ring — thin maroon outline with a gap before the filled circle,
      // matching the reference's double-ring look. Drawn UNFILLED so the page
      // background shows through the gap.
      page.drawCircle({ x: cx, y: ry, size: 40, borderColor: COLOR.maroon, borderWidth: 1.25 });
      page.drawCircle({ x: cx, y: ry, size: 34, color: COLOR.maroon });
      const iconW = 30;
      const iconH = (image.height / image.width) * iconW;
      page.drawImage(image, { x: cx - iconW / 2, y: ry - iconH / 2, width: iconW, height: iconH });

      const btnW = 96;
      const btnH = 26;
      drawRoundedRect(page, { x: cx - btnW / 2, y: ry - 60, width: btnW, height: btnH, radius: btnH / 2, color: COLOR.maroon });
      const btnLabel = "CLICK ME";
      const btnLabelSize = 9.5;
      const btnLabelWidth = fonts.sansBold.widthOfTextAtSize(btnLabel, btnLabelSize);
      const btnLabelX = cx - btnLabelWidth / 2;
      const btnLabelY = ry - 60 + btnH / 2 - 3.4;
      page.drawText(btnLabel, { x: btnLabelX, y: btnLabelY, size: btnLabelSize, font: fonts.sansBold, color: COLOR.white });
      // Underline beneath "CLICK ME" — matches the reference's underlined button label.
      page.drawLine({ start: { x: btnLabelX, y: btnLabelY - 2 }, end: { x: btnLabelX + btnLabelWidth, y: btnLabelY - 2 }, thickness: 0.75, color: COLOR.white });

      // Single clickable region spanning the icon circle + the button below it.
      addLinkAnnotation(page, url, { x: cx - btnW / 2, y: ry - 60, width: btnW, height: ry + 40 - (ry - 60) });
    });
  });

  const closingSize = px(60);
  const closingY = rowYs[1] - 90;
  ["STAY CONNECTED FOR", "ONGOING GUIDANCE & SUPPORT"].forEach((line, i) => {
    page.drawText(line, { x: centerX - fonts.sansBold.widthOfTextAtSize(line, closingSize) / 2, y: closingY - i * (closingSize + 6), size: closingSize, font: fonts.sansBold, color: COLOR.maroonDark });
  });
}

/** Page 15 — minimal back cover: centered logo + website pill + report ID. */
function drawBackCoverPage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>) {
  page.drawImage(assets.backCoverBackground, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });
  const centerX = PAGE_WIDTH / 2;

  const LOGO_TARGET_WIDTH = px(1572.7);
  const logoScale = LOGO_TARGET_WIDTH / assets.logo.width;
  const logoDims = assets.logo.scale(logoScale);
  const logoTopY = PAGE_HEIGHT - px(876.4);
  page.drawImage(assets.logo, { x: centerX - logoDims.width / 2, y: logoTopY - logoDims.height, width: logoDims.width, height: logoDims.height });

  drawFooterPill(page, fonts, data.brand);
  const reportIdText = `Report ID: ${data.reportId}`;
  page.drawText(reportIdText, { x: centerX - fonts.sans.widthOfTextAtSize(reportIdText, 8) / 2, y: 20, size: 8, font: fonts.sans, color: COLOR.muted });
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

  const middleNameForNumerology =
  data.middleNameType === 'no' ? data.middleName : '';

const fullName = [
  data.firstName,
  middleNameForNumerology,
  data.lastName,
]
  .filter(Boolean)
  .join(' ')
  .trim();

  const { facts, verdict, matchedRuleId, isFallback } = runNameCheck({
    dob: { day: dobDate.getDate(), month: dobDate.getMonth() + 1, year: dobDate.getFullYear() },
    firstName: data.firstName,
    fullName,
  });

  if (isFallback) {
    console.warn(`Name Check PDF: rule engine hit FALLBACK for "${data.customerName}" (report ${data.reportId}) — matched ${matchedRuleId} by default. Recommend manual review before sending to customer.`);
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
  pdfDoc.setTitle(`Name Check Report - ${data.customerName}`);
  pdfDoc.setSubject("Chaldean Numerology Name Check Report");
  pdfDoc.setProducer(data.brand.companyName);
  pdfDoc.setCreator(data.brand.companyName);
  pdfDoc.registerFontkit(fontkit);

  const [
    backgroundBytes,
    backCoverBackgroundBytes,
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
    fetchAssetBytes(ASSET_PATHS.backCoverBackground),
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
    backCoverBackground: await pdfDoc.embedPng(backCoverBackgroundBytes),
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

  drawCoverPage(addPage(), fonts, data, assets);
  drawIndexPage(addPage(), fonts, assets, data, 2, TOTAL_PAGES);
  drawWelcomePage(addPage(), fonts, assets, data, 3, TOTAL_PAGES);
  drawBlueprintPage(addPage(), fonts, assets, data, { mulank, bhagyank, firstNameNumber, fullNameNumber, fullNameCompound }, 4, TOTAL_PAGES);
  drawScienceOfNamesPage(addPage(), fonts, assets, data, 5, TOTAL_PAGES);
  drawChaldeanSystemPage(addPage(), fonts, assets, data, 6, TOTAL_PAGES);
  drawWhatWellAnalyzePage(addPage(), fonts, assets, data, 7, TOTAL_PAGES);
  drawCurrentNameBreakdownPage(
    addPage(),
    fonts,
    assets,
    data,
    { heading: "First Name Number", nameLabel: "First Name", nameValue: data.firstName, total: firstNameSum, reducedTo: firstNameNumber, bullets: FIRST_NAME_BLOCKS[comboKey(facts.firstNameToMulank, facts.firstNameToBhagyank)] },
    8,
    TOTAL_PAGES
  );
  drawCurrentNameBreakdownPage(
    addPage(),
    fonts,
    assets,
    data,
    { heading: "Full Name Number", nameLabel: "First Name", nameValue: fullName, total: fullNameSum, reducedTo: fullNameNumber, bullets: FULL_NAME_BLOCKS[comboKey(facts.fullNameToMulank, facts.fullNameToBhagyank)] },
    9,
    TOTAL_PAGES
  );
  drawCurrentNameBreakdownPage(
    addPage(),
    fonts,
    assets,
    data,
    { heading: "Full Name Compound Number", nameLabel: "First Name", nameValue: fullName, total: fullNameCompound, bullets: COMPOUND_BLOCKS[compoundTier] },
    10,
    TOTAL_PAGES
  );
  drawWhyCriticalPage(addPage(), fonts, assets, data, { ruleId: matchedRuleId, verdict, isFallback }, 11, TOTAL_PAGES);
  drawPricingPage(addPage(), fonts, assets, data, 12, TOTAL_PAGES);
  drawConnectPage(addPage(), fonts, assets, data, 13, TOTAL_PAGES);
  drawServicesPage(addPage(), fonts, assets, data, 14, TOTAL_PAGES);
  drawBackCoverPage(addPage(), fonts, assets, data);

  return pdfDoc.save();
}

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

export function nameCheckReportPdfToBlob(bytes: Uint8Array): Blob {
  return new Blob([bytes], { type: "application/pdf" });
}

export { runNameCheck } from "@/lib/name-check/rule-engine";
export { chaldeanRawSum, getFullNameCompoundNumber } from "@/lib/name-check/numerology";
export const numerology = {
  splitName,
  NUMBER_KEYWORDS,
};

