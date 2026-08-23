
// /**
//  * NameCheckReportGenerator.tsx
//  * -----------------------------------------------------------------------
//  * Ankshaastra-branded Name Check Report PDF generator.
//  * ------------------------------------page.drawText(row.no, {-----------------------------------
//  */

// import { PDFDocument, PDFPage, PDFFont, PDFImage, StandardFonts, rgb, RGB, PDFString, PDFName, PDFArray } from "pdf-lib";
// import fontkit from "@pdf-lib/fontkit";
// import { runNameCheck } from "@/lib/name-check/rule-engine";
// import { chaldeanRawSum, getFullNameCompoundNumber } from "@/lib/name-check/numerology";
// import { FIRST_NAME_BLOCKS, FULL_NAME_BLOCKS, COMPOUND_BLOCKS, comboKey } from "@/lib/name-check/content-blocks";
// import { ALL_RULES } from "@/lib/name-check/hr-oa-nr-blocks";

// export interface NameCheckReportInput {
//   reportId: string;
//   customerName: string;
//   email: string;
//   phone: string;
//   dob: string;
//   gender: string;
//   generatedDate?: string;
//   firstName?: string;
//   middleName?: string;
//   lastName?: string;
//   // Matches the exact field NameCheckReportsModule.tsx sends (mapped from the
//   // DB's `is_middle_name_father_husband` boolean column).
//   // true  = middle name is the father's/husband's name → exclude from numerology.
//   // false/unset = middle name is part of the person's own name → include it.
//  isMiddleNameFatherHusband?: boolean;

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

// const PAGE_WIDTH = 595.28; // A4 portrait, points
// const PAGE_HEIGHT = 841.89;

// /**
//  * Canva → PDF unit conversion. The client's reference file was designed on a
//  * 1860 x 2631 px Canva canvas — same aspect ratio as A4 — so any font size
//  * read off Canva's toolbar converts straight to PDF points via this factor.
//  */
// const CANVA_SCALE = PAGE_WIDTH / 1860; // ≈ 0.32005
// const px = (v: number) => Math.round(v * CANVA_SCALE * 10) / 10;

// /**
//  * ------------------------------------------------------------------------
//  * CENTRAL SPACING / TYPOGRAPHY SCALE
//  * ------------------------------------------------------------------------
//  * Every page used to hardcode its own gap/row-height/font-size numbers,
//  * which is why the two reference builds ("Priyanka" vs "Bindhu") drifted
//  * apart — a fix on one page never propagated anywhere else. Everything
//  * below is now sourced from this single table. To make the WHOLE report
//  * roomier or tighter, change these numbers once instead of hunting through
//  * 15 draw functions.
//  *
//  * bodySize matches px(45) (~14.4pt) — the base paragraph size used
//  * everywhere. Gaps are expressed as multiples of that so they scale
//  * together if bodySize ever changes.
//  */
// const TYPE = {
//   bodySize: px(45), // ~14.4pt — base paragraph / bullet text size
//   lineGap: 5, // extra px added to font size for line-height inside a paragraph
//   bulletGap: 14, // vertical gap BETWEEN bullet items (was inconsistently 4/8/12/16 per page)
//   bulletDotOffsetRatio: 0.32, // dot's y-offset below the text baseline, as a fraction of font size
//   cardPadding: 46, // standard top padding inside a rounded content box, banner to first line of text
// };

// const COLOR = {
//   blush: rgb(0.988, 0.945, 0.925),
//   blushPanel: rgb(0.965, 0.902, 0.89),
//   maroon: rgb(0.686, 0.271, 0.259),
//   maroonDark: rgb(0.6, 0.22, 0.21),
//   ink: rgb(0.686, 0.271, 0.259),
//   muted: rgb(0.62, 0.42, 0.4),
//   white: rgb(1, 1, 1),
//   cream: rgb(0.99, 0.97, 0.95),
//   green: rgb(0.15, 0.45, 0.2),
//   red: rgb(0.6, 0.15, 0.15),
// };

// interface Fonts {
//   sans: PDFFont;
//   sansBold: PDFFont;
//   heading: PDFFont;
//   quote: PDFFont;
// }

// const ASSET_PATHS = {
//   background: "/name-check-assets/background-border.png",
//   backCoverBackground: "/name-check-assets/background-back-cover.png",
//   logo: "/name-check-assets/logo-ankshaastra.png",
//   loshuGrid: "/name-check-assets/loshu-turtle-grid.png",
//   starIcon: "/name-check-assets/star-icon.png",
//   handsPraying: "/name-check-assets/praying-hands.png",
//   socialInstagram: "/name-check-assets/social-instagram.png",
//   socialLinkedin: "/name-check-assets/social-linkedin.png",
//   socialYoutube: "/name-check-assets/social-youtube.png",
//   socialFacebook: "/name-check-assets/social-facebook.png",
//   offerIconPen: "/name-check-assets/offer-icon-pen.png",
//   offerIconDigits: "/name-check-assets/offer-icon-digits.png",
//   fonts: {
//     quicksandRegular: "/name-check-assets/fonts/Quicksand-Regular.ttf",
//     quicksandBold: "/name-check-assets/fonts/Quicksand-Bold.ttf",
//     cinzelDecorativeBold: "/name-check-assets/fonts/CinzelDecorative-Bold.ttf",
//     cardoRegular: "/name-check-assets/fonts/Cardo-Regular.ttf",
//   },
// };

// async function fetchAssetBytes(path: string): Promise<Uint8Array> {
//   const res = await fetch(path);
//   if (!res.ok) {
//     throw new Error(`Name Check PDF: failed to fetch design asset "${path}" (${res.status}). Check it was uploaded to /public${path}.`);
//   }
//   return new Uint8Array(await res.arrayBuffer());
// }

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

// /** Pure measurement (no drawing) — mirrors drawWrappedText's line count, for pre-sizing boxes. */
// function measureWrappedTextHeight(text: string, font: PDFFont, size: number, maxWidth: number, lineHeight: number): number {
//   return wrapText(text, font, size, maxWidth).length * lineHeight;
// }

// /** Pure measurement (no drawing) — mirrors drawBulletList's total consumed height, for pre-sizing boxes. */
// function measureBulletListHeight(items: string[], font: PDFFont, size: number, maxWidth: number, lineHeight: number, gap: number): number {
//   let total = 0;
//   items.forEach((item) => {
//     const lineCount = wrapText(item, font, size, maxWidth - 14).length;
//     total += lineCount * lineHeight + gap;
//   });
//   return total;
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

// function drawBulletList(
//   page: PDFPage,
//   items: string[],
//   opts: { x: number; y: number; font: PDFFont; size: number; maxWidth: number; lineHeight: number; gap: number; color: RGB }
// ): number {
//   let y = opts.y;
//   // Dot sits relative to the font size, not a fixed "-4" — that fixed offset
//   // is what made bullets look mis-centered once font sizes ever changed.
//   const dotY = -opts.size * TYPE.bulletDotOffsetRatio;
//   items.forEach((item) => {
//     page.drawCircle({ x: opts.x + 3, y: y + dotY, size: 2.4, color: COLOR.maroon });
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

// /**
//  * Rich-text centered wrap: a sequence of {text, bold} word-tokens, wrapped to maxWidth
//  * and horizontally centered per line, switching between opts.font (regular) and
//  * opts.boldFont for individual words. Used for the Welcome-page quote, where the
//  * numerologist's credential phrase must render bold mid-paragraph.
//  */
// function drawRichWrappedTextCentered(
//   page: PDFPage,
//   tokens: { text: string; bold: boolean }[],
//   opts: { centerX: number; y: number; font: PDFFont; boldFont: PDFFont; size: number; maxWidth: number; lineHeight: number; color: RGB }
// ): number {
//   const lines: { text: string; bold: boolean }[][] = [];
//   let currentLine: { text: string; bold: boolean }[] = [];
//   let currentWidth = 0;
//   const spaceWidth = opts.font.widthOfTextAtSize(" ", opts.size);

//   tokens.forEach((tok) => {
//     const font = tok.bold ? opts.boldFont : opts.font;
//     const wordWidth = font.widthOfTextAtSize(tok.text, opts.size);
//     const addWidth = (currentLine.length > 0 ? spaceWidth : 0) + wordWidth;
//     if (currentWidth + addWidth > opts.maxWidth && currentLine.length > 0) {
//       lines.push(currentLine);
//       currentLine = [tok];
//       currentWidth = wordWidth;
//     } else {
//       currentLine.push(tok);
//       currentWidth += addWidth;
//     }
//   });
//   if (currentLine.length > 0) lines.push(currentLine);

//   let cursorY = opts.y;
//   lines.forEach((line) => {
//     const lineWidth = line.reduce((sum, tok, i) => {
//       const font = tok.bold ? opts.boldFont : opts.font;
//       return sum + font.widthOfTextAtSize(tok.text, opts.size) + (i > 0 ? spaceWidth : 0);
//     }, 0);
//     let x = opts.centerX - lineWidth / 2;
//     line.forEach((tok) => {
//       const font = tok.bold ? opts.boldFont : opts.font;
//       page.drawText(tok.text, { x, y: cursorY, size: opts.size, font, color: opts.color });
//       x += font.widthOfTextAtSize(tok.text, opts.size) + spaceWidth;
//     });
//     cursorY -= opts.lineHeight;
//   });
//   return cursorY;
// }

// /** Left-aligned counterpart to drawRichWrappedTextCentered — wraps rich (bold/regular) tokens starting at a fixed x. */
// function drawRichWrappedText(
//   page: PDFPage,
//   tokens: { text: string; bold: boolean }[],
//   opts: { x: number; y: number; font: PDFFont; boldFont: PDFFont; size: number; maxWidth: number; lineHeight: number; color: RGB }
// ): number {
//   const lines: { text: string; bold: boolean }[][] = [];
//   let currentLine: { text: string; bold: boolean }[] = [];
//   let currentWidth = 0;
//   const spaceWidth = opts.font.widthOfTextAtSize(" ", opts.size);

//   tokens.forEach((tok) => {
//     const font = tok.bold ? opts.boldFont : opts.font;
//     const wordWidth = font.widthOfTextAtSize(tok.text, opts.size);
//     const addWidth = (currentLine.length > 0 ? spaceWidth : 0) + wordWidth;
//     if (currentWidth + addWidth > opts.maxWidth && currentLine.length > 0) {
//       lines.push(currentLine);
//       currentLine = [tok];
//       currentWidth = wordWidth;
//     } else {
//       currentLine.push(tok);
//       currentWidth += addWidth;
//     }
//   });
//   if (currentLine.length > 0) lines.push(currentLine);

//   let cursorY = opts.y;
//   lines.forEach((line) => {
//     let x = opts.x;
//     line.forEach((tok) => {
//       const font = tok.bold ? opts.boldFont : opts.font;
//       page.drawText(tok.text, { x, y: cursorY, size: opts.size, font, color: opts.color });
//       x += font.widthOfTextAtSize(tok.text, opts.size) + spaceWidth;
//     });
//     cursorY -= opts.lineHeight;
//   });
//   return cursorY;
// }

// /**
//  * Bullet list where each item's lead phrase (before the first " — ") renders
//  * bold, matching the Bindhu reference's "First Name Number — your personal
//  * identity..." style. Falls back to a plain bullet if no " — " is found.
//  */
// function drawBulletListBoldLead(
//   page: PDFPage,
//   items: string[],
//   opts: { x: number; y: number; font: PDFFont; boldFont: PDFFont; size: number; maxWidth: number; lineHeight: number; gap: number; color: RGB }
// ): number {
//   let y = opts.y;
//   const dotY = -opts.size * TYPE.bulletDotOffsetRatio;
//   items.forEach((item) => {
//     page.drawCircle({ x: opts.x + 3, y: y + dotY, size: 2.4, color: COLOR.maroon });
//     const sepIdx = item.indexOf(" — ");
//     const tokens =
//       sepIdx === -1
//         ? item.split(/\s+/).map((w) => ({ text: w, bold: false }))
//         : buildBoldPhraseTokens(item, item.slice(0, sepIdx));
//     y = drawRichWrappedText(page, tokens, {
//       x: opts.x + 14,
//       y,
//       font: opts.font,
//       boldFont: opts.boldFont,
//       size: opts.size,
//       maxWidth: opts.maxWidth - 14,
//       lineHeight: opts.lineHeight,
//       color: opts.color,
//     });
//     y -= opts.gap;
//   });
//   return y;
// }

// /** Splits "prefix BOLDPHRASE suffix" into word-tokens with a bold flag, for drawRichWrappedTextCentered. */
// function buildBoldPhraseTokens(fullText: string, boldPhrase: string): { text: string; bold: boolean }[] {
//   const idx = fullText.indexOf(boldPhrase);
//   if (idx === -1) return fullText.split(/\s+/).map((w) => ({ text: w, bold: false }));
//   const before = fullText.slice(0, idx);
//   const bold = fullText.slice(idx, idx + boldPhrase.length);
//   const after = fullText.slice(idx + boldPhrase.length);
//   return [
//     ...before.split(/\s+/).filter(Boolean).map((w) => ({ text: w, bold: false })),
//     ...bold.split(/\s+/).filter(Boolean).map((w) => ({ text: w, bold: true })),
//     ...after.split(/\s+/).filter(Boolean).map((w) => ({ text: w, bold: false })),
//   ];
// }

// interface Assets {
//   background: PDFImage;
//   backCoverBackground: PDFImage;
//   logo: PDFImage;
//   loshuGrid: PDFImage;
//   starIcon: PDFImage;
//   handsPraying: PDFImage;
//   socialInstagram: PDFImage;
//   socialLinkedin: PDFImage;
//   socialYoutube: PDFImage;
//   socialFacebook: PDFImage;
//   offerIconPen: PDFImage;
//   offerIconDigits: PDFImage;
// }

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

// function roundedRectSvgPath(width: number, height: number, radius: number): string {
//   const r = Math.min(radius, width / 2, height / 2);
//   return [
//     `M ${r} 0`,
//     `H ${width - r}`,
//     `A ${r} ${r} 0 0 1 ${width} ${r}`,
//     `V ${height - r}`,
//     `A ${r} ${r} 0 0 1 ${width - r} ${height}`,
//     `H ${r}`,
//     `A ${r} ${r} 0 0 1 0 ${height - r}`,
//     `V ${r}`,
//     `A ${r} ${r} 0 0 1 ${r} 0`,
//     `Z`,
//   ].join(" ");
// }

// function roundedTopRectSvgPath(width: number, height: number, radius: number): string {
//   const r = Math.min(radius, width / 2, height);
//   return [
//     `M ${r} 0`,
//     `H ${width - r}`,
//     `A ${r} ${r} 0 0 1 ${width} ${r}`,
//     `V ${height}`,
//     `H 0`,
//     `V ${r}`,
//     `A ${r} ${r} 0 0 1 ${r} 0`,
//     `Z`,
//   ].join(" ");
// }

// function drawRoundedRect(
//   page: PDFPage,
//   opts: { x: number; y: number; width: number; height: number; radius: number; color?: RGB; borderColor?: RGB; borderWidth?: number }
// ) {
//   page.drawSvgPath(roundedRectSvgPath(opts.width, opts.height, opts.radius), {
//     x: opts.x,
//     y: opts.y + opts.height,
//     scale: 1,
//     color: opts.color,
//     borderColor: opts.borderColor,
//     borderWidth: opts.borderWidth,
//   });
// }

// /** Fully-rounded maroon pill banner used for section headers. Text = 45px-Canva ≈14.4pt. */
// function drawMaroonBanner(page: PDFPage, fonts: Fonts, text: string, boxX: number, boxTopY: number, boxWidth: number, height = 34) {
//   const label = text.toUpperCase();
//   const size = px(45);
//   const textWidth = fonts.sansBold.widthOfTextAtSize(label, size);
//   const width = Math.min(boxWidth - 16, textWidth + 56);
//   const x = boxX + boxWidth / 2 - width / 2;
//   const y = boxTopY - height / 2;
//   drawRoundedRect(page, { x, y, width, height, radius: height / 2, color: COLOR.maroon });
//   page.drawText(label, {
//     x: x + width / 2 - textWidth / 2,
//     y: y + height / 2 - size * 0.35,
//     size,
//     font: fonts.sansBold,
//     color: COLOR.white,
//   });
// }

// function drawContentBox(page: PDFPage, opts: { x: number; y: number; width: number; height: number }): number {
//   drawRoundedRect(page, {
//     x: opts.x,
//     y: opts.y - opts.height,
//     width: opts.width,
//     height: opts.height,
//     radius: 18,
//     color: COLOR.blushPanel,
//     borderColor: COLOR.maroon,
//     borderWidth: 1,
//   });
//   return opts.y;
// }

// function drawWrappedTextCentered(
//   page: PDFPage,
//   text: string,
//   opts: { centerX: number; y: number; font: PDFFont; size: number; maxWidth: number; lineHeight: number; color: RGB }
// ): number {
//   const lines = wrapText(text, opts.font, opts.size, opts.maxWidth);
//   let cursorY = opts.y;
//   for (const line of lines) {
//     page.drawText(line, {
//       x: opts.centerX - opts.font.widthOfTextAtSize(line, opts.size) / 2,
//       y: cursorY,
//       size: opts.size,
//       font: opts.font,
//       color: opts.color,
//     });
//     cursorY -= opts.lineHeight;
//   }
//   return cursorY;
// }

// function drawStarGlyph(page: PDFPage, cx: number, cy: number, r: number, color: RGB) {
//   const path = `M ${r} 0 L ${r * 1.32} ${r * 0.68} L ${r * 2} ${r} L ${r * 1.32} ${r * 1.32} L ${r} ${r * 2} L ${r * 0.68} ${r * 1.32} L 0 ${r} L ${r * 0.68} ${r * 0.68} Z`;
//   page.drawSvgPath(path, { x: cx - r, y: cy + r, color });
// }

// /** Adds an invisible clickable-URL region over a page area (used for the social icons on page 13). */
// function addLinkAnnotation(page: PDFPage, url: string, rect: { x: number; y: number; width: number; height: number }) {
//   const doc = page.doc;
//   const linkAnnotRef = doc.context.register(
//     doc.context.obj({
//       Type: "Annot",
//       Subtype: "Link",
//       Rect: [rect.x, rect.y, rect.x + rect.width, rect.y + rect.height],
//       Border: [0, 0, 0],
//       A: {
//         Type: "Action",
//         S: "URI",
//         URI: PDFString.of(url),
//       },
//     })
//   );
//   const existingAnnots = page.node.Annots();
//   if (existingAnnots) {
//     existingAnnots.push(linkAnnotRef);
//   } else {
//     page.node.set(PDFName.of("Annots"), doc.context.obj([linkAnnotRef]));
//   }
// }

// type OfferIconType = "pen" | "grid" | "digits" | "letter" | "document";

// /**
//  * Pricing-card bullet-row icon badges. Every icon is fit-to-contain within a
//  * box no larger than the badge circle's INSCRIBED SQUARE (r * SQRT2 would
//  * touch the circle exactly at the four corners — that's the mathematical
//  * ceiling). The old code used `r * 1.3`, which is fine in theory, but the
//  * "digits" image itself ships with very little internal padding, so at
//  * 1.3x it was visually grazing / poking past the circle's own stroke width.
//  * Dropping to `r * 1.05` and shrinking further via `scale * 0.92` below
//  * guarantees a visible gap between icon and circle edge at every badge size,
//  * matching the reference's comfortable icon-in-circle look.
//  */
// function drawOfferIcon(page: PDFPage, fonts: Fonts, assets: Assets, type: OfferIconType, cx: number, cy: number, r: number) {
//   const white = COLOR.white;
//   const maxBox = r * 1.05; // safe inscribed bound with visible breathing room from the circle's edge

//   const drawContainedImage = (img: PDFImage) => {
//     const scale = Math.min(maxBox / img.width, maxBox / img.height) * 0.92;
//     const w = img.width * scale;
//     const h = img.height * scale;
//     page.drawImage(img, { x: cx - w / 2, y: cy - h / 2, width: w, height: h });
//   };

//   switch (type) {
//     case "pen": {
//       drawContainedImage(assets.offerIconPen);
//       break;
//     }
//     case "digits": {
//       drawContainedImage(assets.offerIconDigits);
//       break;
//     }
//     case "grid": {
//       const gridSize = maxBox;
//       const cell = gridSize / 3;
//       const originX = cx - gridSize / 2;
//       const originY = cy - gridSize / 2;
//       for (let i = 0; i <= 3; i++) {
//         page.drawLine({ start: { x: originX + i * cell, y: originY }, end: { x: originX + i * cell, y: originY + gridSize }, thickness: 0.9, color: white });
//         page.drawLine({ start: { x: originX, y: originY + i * cell }, end: { x: originX + gridSize, y: originY + i * cell }, thickness: 0.9, color: white });
//       }
//       const numSize = cell * 0.62;
//       const placeNum = (label: string, col: number, row: number) => {
//         const ccx = originX + col * cell + cell / 2;
//         const ccy = originY + gridSize - row * cell - cell / 2;
//         page.drawText(label, { x: ccx - fonts.sansBold.widthOfTextAtSize(label, numSize) / 2, y: ccy - numSize * 0.36, size: numSize, font: fonts.sansBold, color: white });
//       };
//       placeNum("1", 0, 0);
//       placeNum("8", 2, 0);
//       placeNum("7", 1, 1);
//       break;
//     }
//     case "letter": {
//       const label = "A";
//       const size = maxBox * 1.0;
//       page.drawText(label, { x: cx - fonts.heading.widthOfTextAtSize(label, size) / 2, y: cy - size * 0.36, size, font: fonts.heading, color: white });
//       break;
//     }
//     case "document": {
//       const w = maxBox * 0.6;
//       const h = maxBox * 0.76;
//       const offset = 2.2;
//       for (let i = 2; i >= 0; i--) {
//         const x = cx - w / 2 + i * offset;
//         const y = cy - h / 2 - i * offset;
//         page.drawRectangle({ x, y, width: w, height: h, borderColor: white, borderWidth: 0.9 });
//       }
//       const lineX = cx - w / 2 + 3;
//       const lineW = w - 6;
//       [0.3, 0.5, 0.7].forEach((f) => {
//         page.drawLine({ start: { x: lineX, y: cy - h / 2 + h * f }, end: { x: lineX + lineW, y: cy - h / 2 + h * f }, thickness: 0.8, color: white });
//       });
//       break;
//     }
//   }
// }

// function drawPageChrome(
//   page: PDFPage,
//   fonts: Fonts,
//   assets: Assets,
//   opts: { title: string; subtitle?: string; pageNumber: number; totalPages: number; brand: BrandConfig }
// ) {
//   drawPageBackground(page, assets);

//   const centerX = PAGE_WIDTH / 2;
//   const titleLines = opts.title.split("\n");
//   let titleY = PAGE_HEIGHT - 96;
//   const maxTitleWidth = PAGE_WIDTH - 96;

//   const kickerSize = px(50);
//   const mainSize = px(80);

//   titleLines.forEach((line, i) => {
//     const isLast = i === titleLines.length - 1;
//     let size = isLast ? mainSize : kickerSize;
//     const font = fonts.heading;
//     while (font.widthOfTextAtSize(line, size) > maxTitleWidth && size > 11) size -= 1;
//     page.drawText(line, {
//       x: centerX - font.widthOfTextAtSize(line, size) / 2,
//       y: titleY,
//       size,
//       font,
//       color: COLOR.maroon,
//     });
//     titleY -= isLast ? mainSize + 10 : kickerSize + 10;
//   });

//   const dividerY = titleY + 12;
//   page.drawLine({ start: { x: centerX - 165, y: dividerY }, end: { x: centerX - 14, y: dividerY }, thickness: 1, color: COLOR.maroon });
//   page.drawLine({ start: { x: centerX + 14, y: dividerY }, end: { x: centerX + 165, y: dividerY }, thickness: 1, color: COLOR.maroon });
//   drawStarGlyph(page, centerX, dividerY, 6, COLOR.maroon);

//   if (opts.subtitle) {
//     const subLabel = opts.subtitle.toUpperCase();
//     const subSize = px(45);
//     page.drawText(subLabel, {
//       x: centerX - fonts.sansBold.widthOfTextAtSize(subLabel, subSize) / 2,
//       y: dividerY - subSize - 8,
//       size: subSize,
//       font: fonts.sansBold,
//       color: COLOR.maroonDark,
//     });
//   }

//   drawFooterPill(page, fonts, opts.brand);
// }

// function drawFooterPill(page: PDFPage, fonts: Fonts, brand: BrandConfig) {
//   const centerX = PAGE_WIDTH / 2;
//   const pill = `WWW.${brand.website.replace(/^www\./i, "").toUpperCase()}`;
//   const size = px(45);
//   const pillWidth = fonts.sansBold.widthOfTextAtSize(pill, size) + 44;
//   const height = size + 18;
//   drawRoundedRect(page, { x: centerX - pillWidth / 2, y: 40, width: pillWidth, height, radius: height / 2, color: COLOR.maroon });
//   page.drawText(pill, {
//     x: centerX - fonts.sansBold.widthOfTextAtSize(pill, size) / 2,
//     y: 40 + height / 2 - size * 0.35,
//     size,
//     font: fonts.sansBold,
//     color: COLOR.white,
//   });
// }

// function drawDataTable(
//   page: PDFPage,
//   fonts: Fonts,
//   rows: [string, string][],
//   opts: { x: number; y: number; width: number; rowHeight?: number }
// ): number {
//   const size = px(45);
//   const rowHeight = opts.rowHeight ?? Math.max(32, size + 18);
//   const totalHeight = rowHeight * rows.length;
//   const borderTint = rgb(0.82, 0.68, 0.66);
//   const labelColCenter = opts.x + opts.width / 4;
//   const valueColCenter = opts.x + (opts.width * 3) / 4;

//   drawRoundedRect(page, { x: opts.x, y: opts.y - totalHeight, width: opts.width, height: totalHeight, radius: 16, color: COLOR.blushPanel, borderColor: COLOR.maroon, borderWidth: 1 });

//   let y = opts.y;
//   rows.forEach(([label, value], i) => {
//     if (i > 0) {
//       page.drawLine({ start: { x: opts.x, y }, end: { x: opts.x + opts.width, y }, thickness: 0.5, color: borderTint });
//     }
//     page.drawText(label, {
//       x: labelColCenter - fonts.sansBold.widthOfTextAtSize(label, size) / 2,
//       y: y - rowHeight / 2 - size * 0.35,
//       size,
//       font: fonts.sansBold,
//       color: COLOR.maroonDark,
//     });
//         const isPillRow = label === "Date of Birth" || label === "Gender";
//     const displayText = label === "Gender" && value ? `${value} ⌄` : value || "—";
//     if (isPillRow) {
//       const pillW = fonts.sansBold.widthOfTextAtSize(displayText, size) + 26;
//       const pillH = size + 12;
//       drawRoundedRect(page, {
//         x: valueColCenter - pillW / 2,
//         y: y - rowHeight / 2 - pillH / 2,
//         width: pillW,
//         height: pillH,
//         radius: pillH / 2,
//         color: rgb(0.94, 0.87, 0.85),
//       });
//     }
//     page.drawText(displayText, {
//       x: valueColCenter - fonts.sansBold.widthOfTextAtSize(displayText, size) / 2,
//       y: y - rowHeight / 2 - size * 0.35,
//       size,
//       font: fonts.sansBold,
//       color: COLOR.ink,
//     });
//     page.drawLine({
//       start: { x: opts.x + opts.width / 2, y },
//       end: { x: opts.x + opts.width / 2, y: y - rowHeight },
//       thickness: 0.5,
//       color: borderTint,
//     });
//     y -= rowHeight;
//   });
//   return opts.y - totalHeight;
// }

// function formatDate(iso: string): string {
//   const d = new Date(iso);
//   if (isNaN(d.getTime())) return iso;
//   return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
// }

// /* ------------------------------------------------------------------ */
// /*  Page builders                                                       */
// /* ------------------------------------------------------------------ */

// function drawCoverPage(page: PDFPage, fonts: Fonts, data: Required<NameCheckReportInput>, assets: Assets) {
//   drawPageBackground(page, assets);
//   const centerX = PAGE_WIDTH / 2;

//   const LOGO_TARGET_WIDTH = 210;
//   const logoScale = LOGO_TARGET_WIDTH / assets.logo.width;
//   const logoDims = assets.logo.scale(logoScale);
//   let y = PAGE_HEIGHT - 40;
//   page.drawImage(assets.logo, { x: centerX - logoDims.width / 2, y: y - logoDims.height, width: logoDims.width, height: logoDims.height });
//   y -= logoDims.height + 60;

//   const GRID_TARGET_WIDTH = 230;
//   const gridScale = GRID_TARGET_WIDTH / assets.loshuGrid.width;
//   const gridDims = assets.loshuGrid.scale(gridScale);
//   page.drawImage(assets.loshuGrid, { x: centerX - gridDims.width / 2, y: y - gridDims.height, width: gridDims.width, height: gridDims.height });
//   y -= gridDims.height + 56;

//   const titleSize = px(124);
//   page.drawText("NAME CHECK", {
//     x: centerX - fonts.heading.widthOfTextAtSize("NAME CHECK", titleSize) / 2,
//     y,
//     size: titleSize,
//     font: fonts.heading,
//     color: COLOR.maroon,
//   });
//   y -= titleSize + 8;
//   page.drawText("REPORT", {
//     x: centerX - fonts.heading.widthOfTextAtSize("REPORT", titleSize) / 2,
//     y,
//     size: titleSize,
//     font: fonts.heading,
//     color: COLOR.maroon,
//   });
//   y -= titleSize + 16;

//   const bylineSize = px(100);
//   const byline = data.brand.numerologistName.replace(/\s+Ji$/i, "").toUpperCase();
//   page.drawText(byline, {
//     x: centerX - fonts.heading.widthOfTextAtSize(byline, bylineSize) / 2,
//     y,
//     size: bylineSize,
//     font: fonts.heading,
//     color: COLOR.maroonDark,
//   });
//   y -= 14;
//   page.drawLine({ start: { x: centerX - 60, y }, end: { x: centerX + 60, y }, thickness: 1, color: COLOR.maroon });

//   drawFooterPill(page, fonts, data.brand);
// }

// function drawIndexPage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
//   drawPageBackground(page, assets);
//   const centerX = PAGE_WIDTH / 2;

//   const titleSize = px(100);
//   page.drawText("INDEX", {
//     x: centerX - fonts.heading.widthOfTextAtSize("INDEX", titleSize) / 2,
//     y: PAGE_HEIGHT - 96,
//     size: titleSize,
//     font: fonts.heading,
//     color: COLOR.maroon,
//   });
//   const dividerY = PAGE_HEIGHT - 96 - titleSize + 10;
//   page.drawLine({ start: { x: centerX - 165, y: dividerY }, end: { x: centerX - 14, y: dividerY }, thickness: 1, color: COLOR.maroon });
//   page.drawLine({ start: { x: centerX + 14, y: dividerY }, end: { x: centerX + 165, y: dividerY }, thickness: 1, color: COLOR.maroon });
//   drawStarGlyph(page, centerX, dividerY, 6, COLOR.maroon);
//   drawFooterPill(page, fonts, data.brand);

//   const rows: { no: string; title: string; items: string[] }[] = [
//     { no: "01", title: "Personal Information & Introduction", items: ["Your Personal Profile", "Welcome Message"] },
//     {
//       no: "02",
//       title: "Understanding Name Numerology",
//       items: ["The Science of Name Numbers", "The Chaldean Number Chart", "What We'll Analyze"],
//     },
//     {
//       no: "03",
//       title: "Current Name Breakdown",
//       items: ["Part 1: First Name Number", "Part 2: Full Name Number", "Part 3: Full Name Compound Number"],
//     },
//   ];

//   const numSize = px(160);
//   const bodySize = px(45);

//     let y = dividerY - 60;
//   const tableX = 44;
//   const tableWidth = PAGE_WIDTH - 88;
//   const numColW = 84;
//   const titleColW = 170;
//   const titleInnerWidth = titleColW - 20;

//   const itemsTextX = tableX + numColW + titleColW + 10;
//   const itemsInnerWidth = tableX + tableWidth - 10 - itemsTextX;

//   rows.forEach((row) => {
//     // Title is uppercased + bold to match the reference styling, so its wrap
//     // must be measured with that same font/case — not the raw mixed-case
//     // string — or a short-looking title can silently overflow into the
//     // items column once transformed.
//     const titleLines = wrapText(row.title.toUpperCase(), fonts.sansBold, bodySize, titleInnerWidth);
//     const itemLineTotal = row.items.reduce((sum, item) => sum + wrapText(`• ${item}`, fonts.sans, bodySize, itemsInnerWidth).length, 0);
//     // Title and items sit in two SIDE-BY-SIDE columns, not stacked in one —
//     // the row only needs to be as tall as the taller of the two columns.
//     // (Previously this summed both line counts, which made the row far
//     // taller than its content, leaving the big centered "01"/"02"/"03"
//     // numeral visually sunk well below the top-anchored, much shorter title.)
//     const tallerLineCount = Math.max(titleLines.length, itemLineTotal);
//     const rowHeight = Math.max(numSize + 20, 26 + tallerLineCount * (bodySize + 6) + 16);
//     page.drawRectangle({
//       x: tableX,
//       y: y - rowHeight,
//       width: tableWidth,
//       height: rowHeight,
//       borderColor: COLOR.maroon,
//       borderWidth: 0.75,
//     });
//     page.drawLine({ start: { x: tableX + numColW, y }, end: { x: tableX + numColW, y: y - rowHeight }, thickness: 0.5, color: COLOR.maroon });
//     page.drawLine({ start: { x: tableX + numColW + titleColW, y }, end: { x: tableX + numColW + titleColW, y: y - rowHeight }, thickness: 0.5, color: COLOR.maroon });
//     page.drawText(row.no, {
//       x: tableX + numColW / 2 - fonts.heading.widthOfTextAtSize(row.no, numSize) / 2,
//       y: y - 10 - (titleLines.length * (bodySize + 6)) / 2 - numSize * 0.18,
//       size: numSize,
//       font: fonts.heading,
//       color: COLOR.maroon,
//     });
//     let titleY = y - bodySize - 10;
//     titleLines.forEach((line) => {
//       page.drawText(line, { x: tableX + numColW + 10, y: titleY, size: bodySize, font: fonts.sansBold, color: COLOR.maroonDark });
//       titleY -= bodySize + 6;
//     });
//         let itemY = y - bodySize - 10;
//     row.items.forEach((item) => {
//       itemY = drawWrappedText(page, `• ${item}`, { x: itemsTextX, y: itemY, font: fonts.sans, size: bodySize, maxWidth: itemsInnerWidth, lineHeight: bodySize + 6, color: COLOR.ink });
//     });
//     y -= rowHeight;
//   });
// }

// function drawWelcomePage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
//   drawPageBackground(page, assets);
//   const centerX = PAGE_WIDTH / 2;

//   const LOGO_TARGET_WIDTH = 150;
//   const logoScale = LOGO_TARGET_WIDTH / assets.logo.width;
//   const logoDims = assets.logo.scale(logoScale);
//   let y = PAGE_HEIGHT - 40;
//   page.drawImage(assets.logo, { x: centerX - logoDims.width / 2, y: y - logoDims.height, width: logoDims.width, height: logoDims.height });
//   y -= logoDims.height + 34;

//   const titleSize = px(80);
//   const nameStr = data.firstName || data.customerName;
//   const line1 = `"Namaskar`;
//   const line2 = `${nameStr} Ji"`;
//   [line1, line2].forEach((line) => {
//     let size = titleSize;
//     while (fonts.heading.widthOfTextAtSize(line, size) > PAGE_WIDTH - 96 && size > 14) size -= 1;
//     page.drawText(line, { x: centerX - fonts.heading.widthOfTextAtSize(line, size) / 2, y, size, font: fonts.heading, color: COLOR.maroon });
//     y -= size + 10;
//   });

//   const dividerY = y + 6;
//   page.drawLine({ start: { x: centerX - 165, y: dividerY }, end: { x: centerX - 14, y: dividerY }, thickness: 1, color: COLOR.maroon });
//   page.drawLine({ start: { x: centerX + 14, y: dividerY }, end: { x: centerX + 165, y: dividerY }, thickness: 1, color: COLOR.maroon });
//   drawStarGlyph(page, centerX, dividerY, 6, COLOR.maroon);
//   drawFooterPill(page, fonts, data.brand);

//   let cy = dividerY - 40;
//   const bodySize = px(45);
//   const boldPhrase = `Astro-Numerologist ${data.brand.numerologistName}.`;
//   const message = `"This personalised Name Check Report has been prepared after careful analysis of your birth date and current name by celebrity ${boldPhrase} The name analysis is rooted in the approach of Chaldean Numerology and the Loshu Grid. The purpose of this report is to identify how the cosmic energies influencing your life align with your current name. Please approach these insights with faith, consistency and pure intention. May this guide illuminate your path towards prosperity, peace and spiritual growth."`;

//   const tokens = buildBoldPhraseTokens(message, boldPhrase);
//   cy = drawRichWrappedTextCentered(page, tokens, {
//     centerX,
//     y: cy,
//     font: fonts.quote,
//     boldFont: fonts.sansBold,
//     size: bodySize,
//     maxWidth: PAGE_WIDTH - 140,
//     lineHeight: bodySize + 8,
//     color: COLOR.maroonDark,
//   });

//   const HANDS_TARGET_WIDTH = 130;
//   const handsScale = HANDS_TARGET_WIDTH / assets.handsPraying.width;
//   const handsDims = assets.handsPraying.scale(handsScale);
//   const HANDS_BOTTOM_Y = 190;
//   const handsTop = Math.min(cy - 30, HANDS_BOTTOM_Y + handsDims.height);
//   page.drawImage(assets.handsPraying, {
//     x: centerX - handsDims.width / 2,
//     y: Math.min(handsTop - handsDims.height, HANDS_BOTTOM_Y),
//     width: handsDims.width,
//     height: handsDims.height,
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
//   drawPageBackground(page, assets);
//   const centerX = PAGE_WIDTH / 2;

//   const titleSize = px(80);
//   const title = "Numerological Blueprint";
//   page.drawText(title, {
//     x: centerX - fonts.heading.widthOfTextAtSize(title, titleSize) / 2,
//     y: PAGE_HEIGHT - 96,
//     size: titleSize,
//     font: fonts.heading,
//     color: COLOR.maroon,
//   });
//   const dividerY = PAGE_HEIGHT - 96 - titleSize + 10;
//   page.drawLine({ start: { x: centerX - 165, y: dividerY }, end: { x: centerX - 14, y: dividerY }, thickness: 1, color: COLOR.maroon });
//   page.drawLine({ start: { x: centerX + 14, y: dividerY }, end: { x: centerX + 165, y: dividerY }, thickness: 1, color: COLOR.maroon });
//   drawStarGlyph(page, centerX, dividerY, 6, COLOR.maroon);
//   drawFooterPill(page, fonts, data.brand);

//   const boxX = 44;
//   const boxWidth = PAGE_WIDTH - 88;
//   const bannerSize = px(45);
//   const bannerY = dividerY - 90;
//   const bannerHeight = bannerSize + 26;
//   drawRoundedRect(page, { x: boxX, y: bannerY - bannerHeight, width: boxWidth, height: bannerHeight, radius: bannerHeight / 2, color: COLOR.maroon });
//   page.drawText("PERSONAL INFORMATION", {
//     x: boxX + 24,
//     y: bannerY - bannerHeight / 2 - bannerSize * 0.35,
//     size: bannerSize,
//     font: fonts.sansBold,
//     color: COLOR.white,
//   });

//   const rows: [string, string][] = [
//     ["First Name", data.firstName || "—"],
//     ["Middle Name", data.middleName || "—"],
//     ["Last Name", data.lastName || "—"],
//     ["Date of Birth", formatDate(data.dob)],
//     ["Gender", data.gender || "—"],
//     ["Mulank", String(numbers.mulank)],
//     ["Bhagyank", String(numbers.bhagyank)],
//     ["First Name Number", String(numbers.firstNameNumber)],
//     ["Full Name Number", String(numbers.fullNameNumber)],
//     ["Full Name Compound Number", String(numbers.fullNameCompound)],
//   ];

//   drawDataTable(page, fonts, rows, { x: boxX, y: bannerY - bannerHeight - 12, width: boxWidth });
// }

// function drawScienceOfNamesPage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
//   drawPageChrome(page, fonts, assets, { title: "The Science of\nName Numbers", pageNumber, totalPages, brand: data.brand });

//   const boxX = 44;
//   const boxWidth = PAGE_WIDTH - 88;
//   const bodySize = TYPE.bodySize;
//   const lineHeight = bodySize + TYPE.lineGap;
//   const innerWidth = boxWidth - 36;
//   const introText =
//     "Every letter in the alphabet carries a specific numeric vibration. When combined, the letters of a name create unique energy patterns that influence:";
//   const bulletItems = [
//     "How others perceive you",
//     "Your natural talents and abilities",
//     "Career and financial opportunities",
//     "Relationship dynamics",
//     "Mental and emotional patterns",
//     "Life challenges and lessons",
//   ];

//   const introHeight = measureWrappedTextHeight(introText, fonts.sans, bodySize, innerWidth, lineHeight);
//   // gap was a flat "4" here — far tighter than every other bullet list in the
//   // document (8/12/14/16 elsewhere) which is exactly why this box looked
//   // cramped next to the reference. Now uses the shared TYPE.bulletGap so it
//   // matches every other list, and the box height below grows to match.
//   const bulletsHeight = measureBulletListHeight(bulletItems, fonts.sans, bodySize, innerWidth, lineHeight, TYPE.bulletGap);
//   const box1Height = TYPE.cardPadding + introHeight + 10 + bulletsHeight + 24;

//   let y = PAGE_HEIGHT - 185;
//   let boxTop = y;
//   drawContentBox(page, { x: boxX, y: boxTop, width: boxWidth, height: box1Height });
//   drawMaroonBanner(page, fonts, "What Is Name Numerology", boxX, boxTop, boxWidth);
//   let cy = boxTop - TYPE.cardPadding;
//   cy = drawWrappedText(page, introText, { x: 62, y: cy, font: fonts.sans, size: bodySize, maxWidth: innerWidth, lineHeight, color: COLOR.ink });
//   cy -= 10;
//   drawBulletList(page, bulletItems, { x: 62, y: cy, font: fonts.sans, size: bodySize, maxWidth: innerWidth, lineHeight, gap: TYPE.bulletGap, color: COLOR.ink });

//   const box2Text =
//     "You hear and respond to your name thousands of times throughout life. Each utterance reinforces the vibrational pattern, making your name a constant affirmation — positive or negative — depending on its alignment with your destiny.";
//   const box2InnerWidth = boxWidth - 64;
//   const box2LineHeight = bodySize + TYPE.lineGap + 2;
//   const box2TextHeight = measureWrappedTextHeight(box2Text, fonts.sans, bodySize, box2InnerWidth, box2LineHeight);
//   const box2Height = TYPE.cardPadding + 6 + box2TextHeight + 22;

//   y = boxTop - box1Height - 32;
//   boxTop = y;
//   drawContentBox(page, { x: boxX, y: boxTop, width: boxWidth, height: box2Height });
//   drawMaroonBanner(page, fonts, "Why Your Name Matters", boxX, boxTop, boxWidth);
//   drawWrappedTextCentered(page, box2Text, { centerX: boxX + boxWidth / 2, y: boxTop - TYPE.cardPadding - 6, font: fonts.sans, size: bodySize, maxWidth: box2InnerWidth, lineHeight: box2LineHeight, color: COLOR.ink });
// }

// function drawChaldeanSystemPage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
//   drawPageChrome(page, fonts, assets, { title: "Numerological\nSystems Used", subtitle: "This Report Analyzes Your Name Using", pageNumber, totalPages, brand: data.brand });

//   const boxX = 44;
//   const boxWidth = PAGE_WIDTH - 88;
//   const bodySize = TYPE.bodySize;
//   const lineHeight = bodySize + TYPE.lineGap;
//     let boxTop = PAGE_HEIGHT - 210;
//   const chaldeanBullets = [
//     "Ancient Babylonian system — considered the most accurate approach for name analysis.",
//     "Values run 1 to 8 (9 is considered sacred and is never assigned to a letter).",
//     "Focuses on the sound vibration and energy of each letter, rather than its position in the alphabet.",
//   ];
//   const chaldeanInnerWidth = boxWidth - 36;
//   const chaldeanBulletsHeight = measureBulletListHeight(chaldeanBullets, fonts.sans, bodySize, chaldeanInnerWidth, lineHeight, TYPE.bulletGap);
//   const boxHeight = TYPE.cardPadding + chaldeanBulletsHeight + 18;
//   drawContentBox(page, { x: boxX, y: boxTop, width: boxWidth, height: boxHeight });
//   drawMaroonBanner(page, fonts, "Chaldean Numerology", boxX, boxTop, boxWidth);
//   drawBulletList(page, chaldeanBullets, { x: 62, y: boxTop - TYPE.cardPadding, font: fonts.sans, size: bodySize, maxWidth: chaldeanInnerWidth, lineHeight, gap: TYPE.bulletGap, color: COLOR.ink });

//   const chartTop = boxTop - boxHeight - 32;
//   drawMaroonBanner(page, fonts, "The Chaldean Number Chart", boxX, chartTop, boxWidth);

//   const columns = [
//     ["A", "I", "J", "Q", "Y"],
//     ["B", "K", "R"],
//     ["C", "G", "L", "S"],
//     ["D", "M", "T"],
//     ["E", "H", "N", "X"],
//     ["U", "V", "W"],
//     ["O", "Z"],
//     ["F", "P"],
//   ];
//   const cellSize = px(36.7);
//   const gridRows = 1 + Math.max(...columns.map((c) => c.length));
//   const gridX = boxX;
//   const gridWidth = boxWidth;
//   const gridTop = chartTop - 30;
//   const rowHeight = 30;
//   const colWidth = gridWidth / 8;

//   drawRoundedRect(page, { x: gridX, y: gridTop - rowHeight * gridRows, width: gridWidth, height: rowHeight * gridRows, radius: 14, color: COLOR.blushPanel, borderColor: COLOR.maroon, borderWidth: 1 });
//   for (let r = 1; r < gridRows; r++) {
//     const ly = gridTop - r * rowHeight;
//     page.drawLine({ start: { x: gridX, y: ly }, end: { x: gridX + gridWidth, y: ly }, thickness: 0.5, color: rgb(0.82, 0.68, 0.66) });
//   }
//   for (let c = 1; c < 8; c++) {
//     const lx = gridX + c * colWidth;
//     page.drawLine({ start: { x: lx, y: gridTop }, end: { x: lx, y: gridTop - rowHeight * gridRows }, thickness: 0.5, color: rgb(0.82, 0.68, 0.66) });
//   }
//   for (let c = 0; c < 8; c++) {
//     const numStr = String(c + 1);
//     page.drawText(numStr, {
//       x: gridX + c * colWidth + colWidth / 2 - fonts.sansBold.widthOfTextAtSize(numStr, cellSize) / 2,
//       y: gridTop - rowHeight / 2 - cellSize * 0.35,
//       size: cellSize,
//       font: fonts.sansBold,
//       color: COLOR.maroon,
//     });
//     columns[c].forEach((letter, r) => {
//       page.drawText(letter, {
//         x: gridX + c * colWidth + colWidth / 2 - fonts.sans.widthOfTextAtSize(letter, cellSize) / 2,
//         y: gridTop - (r + 2) * rowHeight + rowHeight / 2 - cellSize * 0.35,
//         size: cellSize,
//         font: fonts.sans,
//         color: COLOR.maroonDark,
//       });
//     });
//     // Bindhu reference fills every empty cell below the shortest columns with
//     // a "-" placeholder instead of leaving it blank — replicate that here.
//     for (let r = columns[c].length; r < gridRows - 1; r++) {
//       const placeholder = "-";
//       page.drawText(placeholder, {
//         x: gridX + c * colWidth + colWidth / 2 - fonts.sans.widthOfTextAtSize(placeholder, cellSize) / 2,
//         y: gridTop - (r + 2) * rowHeight + rowHeight / 2 - cellSize * 0.35,
//         size: cellSize,
//         font: fonts.sans,
//         color: COLOR.maroonDark,
//       });
//     }
//   }
// }

// function drawWhatWellAnalyzePage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
//   drawPageChrome(page, fonts, assets, { title: "Numerological\nSystems Used", pageNumber, totalPages, brand: data.brand });

//   const boxX = 44;
//   const boxWidth = PAGE_WIDTH - 88;
//   const bodySize = TYPE.bodySize;
//   const lineHeight = bodySize + TYPE.lineGap + 0.5;
//   const innerWidth = boxWidth - 36;
//   const items = [
//     "First Name Number — your personal identity and self-expression.",
//     "Full Name Number — your complete destiny and life purpose.",
//     "Full Name Compound Number — hidden influences and karmic patterns.",
//     "Complete Date of Birth — its influence on your name number, via Mulank and Bhagyank.",
//   ];
//   const itemsHeight = measureBulletListHeight(items, fonts.sans, bodySize, innerWidth, lineHeight, TYPE.bulletGap + 2);
//   const boxTop = PAGE_HEIGHT - 195;
//   const boxHeight = TYPE.cardPadding + itemsHeight + 18;
//   drawContentBox(page, { x: boxX, y: boxTop, width: boxWidth, height: boxHeight });
//   drawMaroonBanner(page, fonts, "What We'll Analyze", boxX, boxTop, boxWidth);

//   drawBulletListBoldLead(page, items, { x: 62, y: boxTop - TYPE.cardPadding, font: fonts.sans, boldFont: fonts.sansBold, size: bodySize, maxWidth: innerWidth, lineHeight, gap: TYPE.bulletGap + 2, color: COLOR.ink });
// }

// function drawCurrentNameBreakdownPage(
//   page: PDFPage,
//   fonts: Fonts,
//   assets: Assets,
//   data: Required<NameCheckReportInput>,
//   opts: { heading: string; nameLabel: string; nameValue: string; total: number; reducedTo?: number; bullets: string[] },
//   pageNumber: number,
//   totalPages: number
// ) {
//   drawPageChrome(page, fonts, assets, { title: "Current Name\nBreakdown", subtitle: opts.heading, pageNumber, totalPages, brand: data.brand });

//   const boxX = 44;
//   const boxWidth = PAGE_WIDTH - 88;
//   const bodySize = TYPE.bodySize;
//   const lineHeight = bodySize + TYPE.lineGap;
//   // Both rows were a flat "34" — noticeably thinner than the reference's
//   // roomy name/totals band. Bumped to give the header its own visual weight
//   // and match the taller reference proportions.
//   const nameRowH = 58;
//   const totalsRowH = 56;
//   let y = PAGE_HEIGHT - 215;

//   drawRoundedRect(page, { x: boxX, y: y - nameRowH - totalsRowH, width: boxWidth, height: nameRowH + totalsRowH, radius: 16, color: COLOR.blushPanel, borderColor: COLOR.maroon, borderWidth: 1 });
//   page.drawSvgPath(roundedTopRectSvgPath(boxWidth, nameRowH, 16), { x: boxX, y, color: COLOR.maroon });
//   const nameLabelSize = 13;
//   const nameValueSize = 14;
//   page.drawText(opts.nameLabel.toUpperCase(), {
//     x: boxX + boxWidth * 0.27 - fonts.sansBold.widthOfTextAtSize(opts.nameLabel.toUpperCase(), nameLabelSize) / 2,
//     y: y - nameRowH / 2 - nameLabelSize * 0.35,
//     size: nameLabelSize,
//     font: fonts.sansBold,
//     color: COLOR.white,
//   });
//   page.drawText(opts.nameValue, {
//     x: boxX + boxWidth * 0.65 - fonts.sansBold.widthOfTextAtSize(opts.nameValue, nameValueSize) / 2,
//     y: y - nameRowH / 2 - nameValueSize * 0.35,
//     size: nameValueSize,
//     font: fonts.sansBold,
//     color: COLOR.white,
//   });

//   const totalsY = y - nameRowH;
//   page.drawLine({ start: { x: boxX, y: totalsY }, end: { x: boxX + boxWidth, y: totalsY }, thickness: 0.5, color: rgb(0.82, 0.68, 0.66) });
//   if (opts.reducedTo !== undefined) {
//     const cols = [
//       { label: "TOTAL", value: String(opts.total) },
//       { label: "REDUCED TO", value: String(opts.reducedTo) },
//     ];
//     const colW = boxWidth / 4;
//     const labelSize = 12;
//     const valueSize = 16;
//     [cols[0].label, cols[0].value, cols[1].label, cols[1].value].forEach((txt, i) => {
//       const isLabel = i % 2 === 0;
//       const size = isLabel ? labelSize : valueSize;
//       const cx = boxX + colW * i + colW / 2;
//       page.drawText(txt, {
//         x: cx - fonts.sansBold.widthOfTextAtSize(txt, size) / 2,
//         y: totalsY - totalsRowH / 2 - size * 0.35,
//         size,
//         font: fonts.sansBold,
//         color: COLOR.maroonDark,
//       });
//       if (i > 0) {
//         page.drawLine({ start: { x: boxX + colW * i, y: totalsY }, end: { x: boxX + colW * i, y: totalsY - totalsRowH }, thickness: 0.5, color: rgb(0.82, 0.68, 0.66) });
//       }
//     });
//   } else {
//     const txt = `Total: ${opts.total}`;
//     const size = 16;
//     page.drawText(txt, {
//       x: boxX + boxWidth / 2 - fonts.sansBold.widthOfTextAtSize(txt, size) / 2,
//       y: totalsY - totalsRowH / 2 - size * 0.35,
//       size,
//       font: fonts.sansBold,
//       color: COLOR.maroonDark,
//     });
//   }

//   y = totalsY - totalsRowH - 34;
//   const contentBoxTop = y;
//   const innerWidth = boxWidth - 36;
//   const bulletsHeight = measureBulletListHeight(opts.bullets, fonts.sans, bodySize, innerWidth, lineHeight, TYPE.bulletGap);
//   const contentBoxHeight = TYPE.cardPadding + bulletsHeight + 22;
//   drawContentBox(page, { x: boxX, y: contentBoxTop, width: boxWidth, height: contentBoxHeight });
//   drawMaroonBanner(page, fonts, "What This Represents", boxX, contentBoxTop, boxWidth);
//   drawBulletList(page, opts.bullets, { x: 62, y: contentBoxTop - TYPE.cardPadding, font: fonts.sans, size: bodySize, maxWidth: innerWidth, lineHeight, gap: TYPE.bulletGap, color: COLOR.ink });
// }

// const VERDICT_LABEL: Record<"HR" | "OA" | "NR", string> = {
//   HR: "Highly Recommended",
//   OA: "Optional / Advisable",
//   NR: "Not Required",
// };

// function drawWhyCriticalPage(
//   page: PDFPage,
//   fonts: Fonts,
//   assets: Assets,
//   data: Required<NameCheckReportInput>,
//   matched: { ruleId: string; verdict: "HR" | "OA" | "NR"; isFallback: boolean },
//   pageNumber: number,
//   totalPages: number
// ) {
//   drawPageChrome(page, fonts, assets, { title: "Current Name\nBreakdown", subtitle: "Why This Is Critical", pageNumber, totalPages, brand: data.brand });

//   const rule = ALL_RULES.find((r) => r.id === matched.ruleId);
//   const boxX = 44;
//   const boxWidth = PAGE_WIDTH - 88;
//   const bodySize = TYPE.bodySize;
//   const lineHeight = bodySize + TYPE.lineGap + 0.5;
//   const boxTop = PAGE_HEIGHT - 215;
//   const innerWidth = boxWidth - 36;

//   const rawBullets = rule?.paragraphs ?? [
//     "Name correction guidance could not be determined for this combination — please review this report manually before sending it to the customer.",
//   ];
//   // The LAST paragraph is a recommendation/verdict statement ("Name correction
//   // is advisable for the full name...") rather than a supporting fact — it
//   // belongs inside the "Optional / Advisable" verdict box below, not as a
//   // bullet in the main "Why This Is Critical" box.
//   const bullets = rawBullets.length > 1 ? rawBullets.slice(0, -1) : rawBullets;
//   const verdictNote = rawBullets.length > 1 ? rawBullets[rawBullets.length - 1] : null;

//   const bulletsHeight = measureBulletListHeight(bullets, fonts.sans, bodySize, innerWidth, lineHeight, TYPE.bulletGap);
//   const boxHeight = TYPE.cardPadding + bulletsHeight + 22;

//   drawContentBox(page, { x: boxX, y: boxTop, width: boxWidth, height: boxHeight });
//   drawMaroonBanner(page, fonts, "Why This Is Critical", boxX, boxTop, boxWidth);
//   drawBulletList(page, bullets, { x: 62, y: boxTop - TYPE.cardPadding, font: fonts.sans, size: bodySize, maxWidth: innerWidth, lineHeight, gap: TYPE.bulletGap, color: COLOR.ink });

//   // Bindhu reference renders this box as a single centered paragraph — no
//   // separate bold "Highly Recommended" / "Optional / Advisable" label line.
//   // The recommendation strength is already implied by the paragraph's own
//   // wording (e.g. "Name correction is highly recommended..."), so if we have
//   // that dedicated verdict sentence we show ONLY it; the verdict-tier label
//   // is kept purely as a fallback for the rare case a rule has no such line.
//   const verdictLabel = `${VERDICT_LABEL[matched.verdict]}${matched.isFallback ? " (fallback — review recommended)" : ""}`;
//   const verdictText = verdictNote ?? verdictLabel;
//   const verdictTop = boxTop - boxHeight - 46;

//   const verdictTextSize = 13;
//   const verdictTextLineHeight = verdictTextSize + 7;
//   const verdictTextInnerWidth = boxWidth - 60;
//   const verdictTextLines = wrapText(verdictText, fonts.sans, verdictTextSize, verdictTextInnerWidth);
//   const verdictTopPadding = 26;
//   const verdictBottomPadding = 22;
//   const verdictHeight = Math.max(84, verdictTopPadding + verdictTextLines.length * verdictTextLineHeight + verdictBottomPadding);

//   drawRoundedRect(page, { x: boxX, y: verdictTop - verdictHeight, width: boxWidth, height: verdictHeight, radius: 18, color: COLOR.maroon, borderColor: COLOR.maroon, borderWidth: 1 });

//   const verdictCursorY = verdictTop - verdictTopPadding - (verdictTextLineHeight - 6);
//   drawWrappedTextCentered(page, verdictText, {
//     centerX: boxX + boxWidth / 2,
//     y: verdictCursorY,
//     font: fonts.sans,
//     size: verdictTextSize,
//     maxWidth: verdictTextInnerWidth,
//     lineHeight: verdictTextLineHeight,
//     color: COLOR.white,
//   });
//   const badgeR = 15;
//   page.drawCircle({ x: boxX + boxWidth / 2, y: verdictTop, size: badgeR, color: COLOR.blush, borderColor: COLOR.maroon, borderWidth: 1.5 });
//   drawStarGlyph(page, boxX + boxWidth / 2, verdictTop, 7, COLOR.maroon);
// }

// function drawServicesPage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
//   drawPageChrome(page, fonts, assets, { title: "Illuminating Lives\nThrough Ancient Wisdom", subtitle: "Services Offered", pageNumber, totalPages, brand: data.brand });

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

//   let y = PAGE_HEIGHT - 220;
//   const dotR = 9;
//   const bodySize = TYPE.bodySize;
//   services.forEach((service) => {
//     page.drawCircle({ x: 44 + dotR, y: y - 5, size: dotR, borderColor: COLOR.maroon, borderWidth: 1 });
//     drawStarGlyph(page, 44 + dotR, y - 5, 3.6, COLOR.maroon);
//     page.drawText(service, { x: 44 + dotR * 2 + 14, y: y - bodySize * 0.35 - 5, size: bodySize, font: fonts.sans, color: COLOR.ink });
//     y -= bodySize + 20;
//   });
// }

// /**
//  * Page 12 — the two upsell offer cards, side by side.
//  * -----------------------------------------------------------------------
//  * This page previously used its own tiny hand-picked font sizes (9 / 8.5 /
//  * 10 / 11 / 12 / 13pt) instead of the shared TYPE scale, which is why it
//  * looked noticeably smaller/denser than every other page and than the
//  * Bindhu reference. All sizes below are lifted roughly to TYPE.bodySize
//  * territory and the badge/row geometry grown to match — this is the fix
//  * for "price wale page same bilkul bindhu wale pdf jaisa" and for the
//  * icons that were poking past their circles (see drawOfferIcon above).
//  */
// function drawPricingPage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
//   drawPageBackground(page, assets);
//   const centerX = PAGE_WIDTH / 2;

//   const logoDims = assets.logo.scale(0.16);
//   page.drawImage(assets.logo, { x: centerX - logoDims.width / 2, y: PAGE_HEIGHT - 56 - logoDims.height, width: logoDims.width, height: logoDims.height });

//   let titleY = PAGE_HEIGHT - 100 - logoDims.height;
//   page.drawText("YOUR NAME DECIDES", { x: centerX - fonts.heading.widthOfTextAtSize("YOUR NAME DECIDES", 15) / 2, y: titleY, size: 15, font: fonts.heading, color: COLOR.maroon });
//   titleY -= 28;
//   page.drawText("YOUR SPEED IN LIFE", { x: centerX - fonts.heading.widthOfTextAtSize("YOUR SPEED IN LIFE", 23) / 2, y: titleY, size: 23, font: fonts.heading, color: COLOR.maroon });
//   const dividerY = titleY - 18;
//   page.drawLine({ start: { x: centerX - 150, y: dividerY }, end: { x: centerX - 14, y: dividerY }, thickness: 1, color: COLOR.maroon });
//   page.drawLine({ start: { x: centerX + 14, y: dividerY }, end: { x: centerX + 150, y: dividerY }, thickness: 1, color: COLOR.maroon });
//   drawStarGlyph(page, centerX, dividerY, 6, COLOR.maroon);

//   type Offer = { price: string; strike: string; off: string; title: string; bullets: string[]; icons: OfferIconType[]; note: string };
//   const offers: Offer[] = [
//     {
//       price: "₹2,987",
//       strike: "₹ 7,500",
//       off: "GET 60% OFF",
//       title: "Name Correction Report",
//       bullets: ["First Name & Full Name Analysis", "2 Corrected Name Spelling Options", "Compound Number Analysis", "First Alphabet Analysis"],
//       icons: ["pen", "grid", "digits", "letter"],
//       note: "Comprehensive report with detailed name correction and analysis.",
//     },
//     {
//       price: "₹3,437",
//       strike: "₹ 7,500",
//       off: "GET 54% OFF",
//       title: "Perfect Baby Name Report",
//       bullets: ["10+ Numerologically Aligned Names", "Mulank, Bhagyank & Rajyog Analysis", "First, Full & Compound Number Analysis", "45+ Page Report & Call Consultation Included"],
//       icons: ["pen", "grid", "digits", "document"],
//       note: "Get 10+ Numerologically Aligned Names for your child.",
//     },
//   ];

//   const colGap = 18;
//   const colWidth = (PAGE_WIDTH - 88 - colGap) / 2;
//   const colTop = dividerY - 40;

//   const digitsSize = px(105); // was px(105) — the reference price badge text reads noticeably larger
//   const rupeeSize = Math.round(digitsSize * 0.82 * 10) / 10;

//   // Row/font sizes below were 9 / 8.5 / 10 / 11 / 12 / 13pt in the old code —
//   // all bumped roughly 25-35% to match TYPE.bodySize-era proportions.
//   const strikeSize = 12;
//   const offSize = 15;
//   const cardTitleSize = 14;
//   const bulletTextSize = 11.5;
//   const noteSize = 10.5;
//   const btnLabelSize = 13;
//   const badgeR = 18; // was 13 — bigger badge so icons have real room to sit inside

//   offers.forEach((offer, i) => {
//     const cx = 44 + i * (colWidth + colGap);

//     const priceDigits = offer.price.replace(/^\D*/, "");
//     const rupeeWidth = fonts.sansBold.widthOfTextAtSize("₹", rupeeSize);
//     const digitsWidth = fonts.heading.widthOfTextAtSize(priceDigits, digitsSize);
//     const priceWidth = rupeeWidth + digitsWidth + 56;
//     const priceH = digitsSize + 24;

//     let iy = colTop - priceH - 30;
//     const strikeWidth = fonts.sans.widthOfTextAtSize(offer.strike, strikeSize);
//     page.drawText(offer.strike, { x: cx + colWidth / 2 - strikeWidth / 2, y: iy, size: strikeSize, font: fonts.sans, color: COLOR.muted });
//     page.drawLine({ start: { x: cx + colWidth / 2 - strikeWidth / 2, y: iy + 4 }, end: { x: cx + colWidth / 2 + strikeWidth / 2, y: iy + 4 }, thickness: 0.9, color: COLOR.red });
//     iy -= 26;
//     page.drawText(offer.off, { x: cx + colWidth / 2 - fonts.sansBold.widthOfTextAtSize(offer.off, offSize) / 2, y: iy, size: offSize, font: fonts.sansBold, color: COLOR.ink });
//     iy -= 28;
//     page.drawText(offer.title, { x: cx + colWidth / 2 - fonts.sansBold.widthOfTextAtSize(offer.title, cardTitleSize) / 2, y: iy, size: cardTitleSize, font: fonts.sansBold, color: COLOR.maroon });
//     iy -= 20;
//     page.drawLine({ start: { x: cx + colWidth / 2 - 52, y: iy }, end: { x: cx + colWidth / 2 + 52, y: iy }, thickness: 0.75, color: COLOR.maroon });
//     iy -= 26;

//     const bulletTextX = 52; // was 44 — gives the bigger badge (radius 18 vs 13) room before the text starts
//     offer.bullets.forEach((b, bi) => {
//       const textWidth = colWidth - 28 - bulletTextX - 14;
//       const lines = wrapText(b, fonts.sans, bulletTextSize, textWidth);
//       const rowH = Math.max(badgeR * 2 + 10, 26 + Math.max(0, lines.length - 1) * 15);
//       drawRoundedRect(page, { x: cx + 14, y: iy - rowH, width: colWidth - 28, height: rowH, radius: 14, borderColor: COLOR.maroon, borderWidth: 0.75 });
//       const badgeCx = cx + 14 + badgeR + 6;
//       const badgeCy = iy - rowH / 2;
//       page.drawCircle({ x: badgeCx, y: badgeCy, size: badgeR, color: COLOR.maroon });
//       drawOfferIcon(page, fonts, assets, offer.icons[bi] ?? "letter", badgeCx, badgeCy, badgeR);
//       let ty = iy - rowH / 2 + (lines.length - 1) * 7.5 + 4;
//       lines.forEach((line) => {
//         page.drawText(line, { x: cx + 14 + bulletTextX, y: ty, size: bulletTextSize, font: fonts.sans, color: COLOR.maroonDark });
//         ty -= 15;
//       });
//       iy -= rowH + 10;
//     });

//     iy -= 8;
//     wrapText(offer.note, fonts.sans, noteSize, colWidth - 40).forEach((line) => {
//       page.drawText(line, { x: cx + colWidth / 2 - fonts.sans.widthOfTextAtSize(line, noteSize) / 2, y: iy, size: noteSize, font: fonts.sans, color: COLOR.muted });
//       iy -= 14;
//     });

//     iy -= 8;
//     const btnH = 38;
//     const btnY = iy - 22;
//     const cardBottom = btnY - 16;
//     drawRoundedRect(page, { x: cx, y: cardBottom, width: colWidth, height: colTop - cardBottom, radius: 18, borderColor: COLOR.maroon, borderWidth: 1 });
//     drawRoundedRect(page, { x: cx + colWidth / 2 - priceWidth / 2, y: colTop - priceH / 2, width: priceWidth, height: priceH, radius: priceH / 2, color: COLOR.maroon });
//     const priceStartX = cx + colWidth / 2 - (rupeeWidth + digitsWidth) / 2;
//     page.drawText("₹", { x: priceStartX, y: colTop - priceH / 2 + priceH * 0.32, size: rupeeSize, font: fonts.sansBold, color: COLOR.white });
//     page.drawText(priceDigits, { x: priceStartX + rupeeWidth, y: colTop - priceH / 2 + priceH * 0.3, size: digitsSize, font: fonts.heading, color: COLOR.white });

//     drawRoundedRect(page, { x: cx + 12, y: btnY, width: colWidth - 24, height: btnH, radius: btnH / 2, color: COLOR.maroon });
//     const btnLabel = "CLICK NOW";
//     page.drawText(btnLabel, { x: cx + colWidth / 2 - fonts.sansBold.widthOfTextAtSize(btnLabel, btnLabelSize) / 2, y: btnY + btnH / 2 - btnLabelSize * 0.35, size: btnLabelSize, font: fonts.sansBold, color: COLOR.white });
//   });

//   drawFooterPill(page, fonts, data.brand);
// }

// /** Page 13 — social follow icons, each linking out to the real Ankshaastra profile. */
// function drawConnectPage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
//   drawPageBackground(page, assets);
//   const centerX = PAGE_WIDTH / 2;

//   const titleSize = px(80);
//   const title = "Connect With Me";
//   page.drawText(title, { x: centerX - fonts.heading.widthOfTextAtSize(title, titleSize) / 2, y: PAGE_HEIGHT - 96, size: titleSize, font: fonts.heading, color: COLOR.maroon });
//   const dividerY = PAGE_HEIGHT - 96 - titleSize + 10;
//   page.drawLine({ start: { x: centerX - 165, y: dividerY }, end: { x: centerX - 14, y: dividerY }, thickness: 1, color: COLOR.maroon });
//   page.drawLine({ start: { x: centerX + 14, y: dividerY }, end: { x: centerX + 165, y: dividerY }, thickness: 1, color: COLOR.maroon });
//   drawStarGlyph(page, centerX, dividerY, 6, COLOR.maroon);
//   drawFooterPill(page, fonts, data.brand);

//   const subtitleSize = px(45);
//   const subtitle = "FOLLOW FOR DAILY WISDOM, TIPS, AND INSPIRATION";
//   page.drawText(subtitle, { x: centerX - fonts.sansBold.widthOfTextAtSize(subtitle, subtitleSize) / 2, y: dividerY - subtitleSize - 20, size: subtitleSize, font: fonts.sansBold, color: COLOR.maroonDark });

//   const platforms: { image: PDFImage; url: string }[] = [
//     { image: assets.socialInstagram, url: "https://www.instagram.com/ankshaastra/" },
//     { image: assets.socialLinkedin, url: "https://www.linkedin.com/company/ankshaastra/?viewAsMember=true" },
//     { image: assets.socialYoutube, url: "https://www.youtube.com/@Ankshaastra" },
//     { image: assets.socialFacebook, url: "https://www.facebook.com/p/Ankshaastra-61561549995939/" },
//   ];
//   const colXs = [centerX - 155, centerX + 155];
//   const rowYs = [dividerY - subtitleSize - 110, dividerY - subtitleSize - 240];
//   let idx = 0;
//   rowYs.forEach((ry) => {
//     colXs.forEach((cx) => {
//       const { image, url } = platforms[idx++];

//       // Outer "halo" ring — thin maroon outline with a gap before the filled circle,
//       // matching the reference's double-ring look. Drawn UNFILLED so the page
//       // background shows through the gap.
//       page.drawCircle({ x: cx, y: ry, size: 40, borderColor: COLOR.maroon, borderWidth: 1.25 });
//       page.drawCircle({ x: cx, y: ry, size: 34, color: COLOR.maroon });
//       const iconW = 30;
//       const iconH = (image.height / image.width) * iconW;
//       page.drawImage(image, { x: cx - iconW / 2, y: ry - iconH / 2, width: iconW, height: iconH });

//       const btnW = 96;
//       const btnH = 26;
//       drawRoundedRect(page, { x: cx - btnW / 2, y: ry - 60, width: btnW, height: btnH, radius: btnH / 2, color: COLOR.maroon });
//       const btnLabel = "CLICK ME";
//       const btnLabelSize = 9.5;
//       const btnLabelWidth = fonts.sansBold.widthOfTextAtSize(btnLabel, btnLabelSize);
//       const btnLabelX = cx - btnLabelWidth / 2;
//       const btnLabelY = ry - 60 + btnH / 2 - 3.4;
//       page.drawText(btnLabel, { x: btnLabelX, y: btnLabelY, size: btnLabelSize, font: fonts.sansBold, color: COLOR.white });
//       // Underline beneath "CLICK ME" — matches the reference's underlined button label.
//       page.drawLine({ start: { x: btnLabelX, y: btnLabelY - 2 }, end: { x: btnLabelX + btnLabelWidth, y: btnLabelY - 2 }, thickness: 0.75, color: COLOR.white });

//       // Single clickable region spanning the icon circle + the button below it.
//       addLinkAnnotation(page, url, { x: cx - btnW / 2, y: ry - 60, width: btnW, height: ry + 40 - (ry - 60) });
//     });
//   });

//   const closingSize = px(60);
//   const closingY = rowYs[1] - 90;
//   ["STAY CONNECTED FOR", "ONGOING GUIDANCE & SUPPORT"].forEach((line, i) => {
//     page.drawText(line, { x: centerX - fonts.sansBold.widthOfTextAtSize(line, closingSize) / 2, y: closingY - i * (closingSize + 6), size: closingSize, font: fonts.sansBold, color: COLOR.maroonDark });
//   });
// }

// /** Page 15 — minimal back cover: centered logo + website pill + report ID. */
// function drawBackCoverPage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>) {
//   page.drawImage(assets.backCoverBackground, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });
//   const centerX = PAGE_WIDTH / 2;

//   const LOGO_TARGET_WIDTH = px(1572.7);
//   const logoScale = LOGO_TARGET_WIDTH / assets.logo.width;
//   const logoDims = assets.logo.scale(logoScale);
//   const logoTopY = PAGE_HEIGHT - px(876.4);
//   page.drawImage(assets.logo, { x: centerX - logoDims.width / 2, y: logoTopY - logoDims.height, width: logoDims.width, height: logoDims.height });

//   drawFooterPill(page, fonts, data.brand);
//   const reportIdText = `Report ID: ${data.reportId}`;
//   page.drawText(reportIdText, { x: centerX - fonts.sans.widthOfTextAtSize(reportIdText, 8) / 2, y: 20, size: 8, font: fonts.sans, color: COLOR.muted });
// }

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
//     isMiddleNameFatherHusband: false,
//     ...input,
//     brand: { ...DEFAULT_BRAND, ...input.brand },
//   };

//     const dobDate = new Date(data.dob);

//   // Only exclude the middle name when the admin explicitly marked it as the
//   // father's/husband's name (true). Anything else — false, undefined, or an
//   // older report created before this field existed — safely defaults to
//   // including it, never silently drops real name data.
//   const excludeMiddleNameFromNumerology = data.isMiddleNameFatherHusband === true;
//   const middleNameForNumerology = excludeMiddleNameFromNumerology ? '' : data.middleName;

//   const fullName = [
//     data.firstName,
//     middleNameForNumerology,
//     data.lastName,
//   ]
//     .filter(Boolean)
//     .join(' ')
//     .trim();

//   const { facts, verdict, matchedRuleId, isFallback } = runNameCheck({
//     dob: { day: dobDate.getDate(), month: dobDate.getMonth() + 1, year: dobDate.getFullYear() },
//     firstName: data.firstName,
//     fullName,
//   });

//   if (isFallback) {
//     console.warn(`Name Check PDF: rule engine hit FALLBACK for "${data.customerName}" (report ${data.reportId}) — matched ${matchedRuleId} by default. Recommend manual review before sending to customer.`);
//   }

//   const mulank = facts.mulank;
//   const bhagyank = facts.bhagyank;
//   const firstNameNumber = facts.firstNameNumber;
//   const firstNameSum = chaldeanRawSum(data.firstName);
//   const fullNameNumber = facts.fullNameNumber;
//   const fullNameSum = getFullNameCompoundNumber(fullName);
//   const fullNameCompound = facts.fullNameCompoundNumber;
//   const compoundTier = facts.compoundTier;

//   const pdfDoc = await PDFDocument.create();
//   pdfDoc.setTitle(`Name Check Report - ${data.customerName}`);
//   pdfDoc.setSubject("Chaldean Numerology Name Check Report");
//   pdfDoc.setProducer(data.brand.companyName);
//   pdfDoc.setCreator(data.brand.companyName);
//   pdfDoc.registerFontkit(fontkit);

//   const [
//     backgroundBytes,
//     backCoverBackgroundBytes,
//     logoBytes,
//     loshuGridBytes,
//     starIconBytes,
//     handsPrayingBytes,
//     socialInstagramBytes,
//     socialLinkedinBytes,
//     socialYoutubeBytes,
//     socialFacebookBytes,
//     offerIconPenBytes,
//     offerIconDigitsBytes,
//     quicksandRegularBytes,
//     quicksandBoldBytes,
//     cinzelDecorativeBoldBytes,
//     cardoRegularBytes,
//   ] = await Promise.all([
//     fetchAssetBytes(ASSET_PATHS.background),
//     fetchAssetBytes(ASSET_PATHS.backCoverBackground),
//     fetchAssetBytes(ASSET_PATHS.logo),
//     fetchAssetBytes(ASSET_PATHS.loshuGrid),
//     fetchAssetBytes(ASSET_PATHS.starIcon),
//     fetchAssetBytes(ASSET_PATHS.handsPraying),
//     fetchAssetBytes(ASSET_PATHS.socialInstagram),
//     fetchAssetBytes(ASSET_PATHS.socialLinkedin),
//     fetchAssetBytes(ASSET_PATHS.socialYoutube),
//     fetchAssetBytes(ASSET_PATHS.socialFacebook),
//     fetchAssetBytes(ASSET_PATHS.offerIconPen),
//     fetchAssetBytes(ASSET_PATHS.offerIconDigits),
//     fetchAssetBytes(ASSET_PATHS.fonts.quicksandRegular),
//     fetchAssetBytes(ASSET_PATHS.fonts.quicksandBold),
//     fetchAssetBytes(ASSET_PATHS.fonts.cinzelDecorativeBold),
//     fetchAssetBytes(ASSET_PATHS.fonts.cardoRegular),
//   ]);

//   const assets: Assets = {
//     background: await pdfDoc.embedPng(backgroundBytes),
//     backCoverBackground: await pdfDoc.embedPng(backCoverBackgroundBytes),
//     logo: await pdfDoc.embedPng(logoBytes),
//     loshuGrid: await pdfDoc.embedPng(loshuGridBytes),
//     starIcon: await pdfDoc.embedPng(starIconBytes),
//     handsPraying: await pdfDoc.embedPng(handsPrayingBytes),
//     socialInstagram: await pdfDoc.embedPng(socialInstagramBytes),
//     socialLinkedin: await pdfDoc.embedPng(socialLinkedinBytes),
//     socialYoutube: await pdfDoc.embedPng(socialYoutubeBytes),
//     socialFacebook: await pdfDoc.embedPng(socialFacebookBytes),
//     offerIconPen: await pdfDoc.embedPng(offerIconPenBytes),
//     offerIconDigits: await pdfDoc.embedPng(offerIconDigitsBytes),
//   };

//   // NOTE: `features: { liga: false }` is required here. Without it, fontkit's
//   // default OpenType feature set silently substitutes "ff" (and other) letter
//   // pairs with a ligature glyph whose advance width pdf-lib/fontkit doesn't
//   // reconcile correctly against the rest of the run — the visible symptom is
//   // words like "effort" and "offers" rendering with a stray gap ("eff ort",
//   // "off ers"). Disabling ligatures fixes this while leaving kerning intact.
//   const NO_LIGATURES = { features: { liga: false } } as const;
//   const fonts: Fonts = {
//     sans: await pdfDoc.embedFont(quicksandRegularBytes, NO_LIGATURES),
//     sansBold: await pdfDoc.embedFont(quicksandBoldBytes, NO_LIGATURES),
//     heading: await pdfDoc.embedFont(cinzelDecorativeBoldBytes, NO_LIGATURES),
//     quote: await pdfDoc.embedFont(cardoRegularBytes, NO_LIGATURES),
//   };

//   const TOTAL_PAGES = 15;
//   const addPage = () => pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

//   drawCoverPage(addPage(), fonts, data, assets);
//   drawIndexPage(addPage(), fonts, assets, data, 2, TOTAL_PAGES);
//   drawWelcomePage(addPage(), fonts, assets, data, 3, TOTAL_PAGES);
//   drawBlueprintPage(addPage(), fonts, assets, data, { mulank, bhagyank, firstNameNumber, fullNameNumber, fullNameCompound }, 4, TOTAL_PAGES);
//   drawScienceOfNamesPage(addPage(), fonts, assets, data, 5, TOTAL_PAGES);
//   drawChaldeanSystemPage(addPage(), fonts, assets, data, 6, TOTAL_PAGES);
//   drawWhatWellAnalyzePage(addPage(), fonts, assets, data, 7, TOTAL_PAGES);
//   drawCurrentNameBreakdownPage(
//     addPage(),
//     fonts,
//     assets,
//     data,
//     { heading: "First Name Number", nameLabel: "First Name", nameValue: data.firstName, total: firstNameSum, reducedTo: firstNameNumber, bullets: FIRST_NAME_BLOCKS[comboKey(facts.firstNameToMulank, facts.firstNameToBhagyank)] },
//     8,
//     TOTAL_PAGES
//   );
//   drawCurrentNameBreakdownPage(
//     addPage(),
//     fonts,
//     assets,
//     data,
//     { heading: "Full Name Number", nameLabel: "Full Name", nameValue: fullName, total: fullNameSum, reducedTo: fullNameNumber, bullets: FULL_NAME_BLOCKS[comboKey(facts.fullNameToMulank, facts.fullNameToBhagyank)] },
//     9,
//     TOTAL_PAGES
//   );
//   drawCurrentNameBreakdownPage(
//     addPage(),
//     fonts,
//     assets,
//     data,
//     { heading: "Full Name Compound Number", nameLabel: "Full Name", nameValue: fullName, total: fullNameCompound, bullets: COMPOUND_BLOCKS[compoundTier] },
//     10,
//     TOTAL_PAGES
//   );
//   drawWhyCriticalPage(addPage(), fonts, assets, data, { ruleId: matchedRuleId, verdict, isFallback }, 11, TOTAL_PAGES);
//   drawPricingPage(addPage(), fonts, assets, data, 12, TOTAL_PAGES);
//   drawConnectPage(addPage(), fonts, assets, data, 13, TOTAL_PAGES);
//   drawServicesPage(addPage(), fonts, assets, data, 14, TOTAL_PAGES);
//   drawBackCoverPage(addPage(), fonts, assets, data);

//   return pdfDoc.save();
// }

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

// export function nameCheckReportPdfToBlob(bytes: Uint8Array): Blob {
//   return new Blob([bytes], { type: "application/pdf" });
// }

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
  // Matches the exact field NameCheckReportsModule.tsx sends (mapped from the
  // DB's `is_middle_name_father_husband` boolean column).
  // true  = middle name is the father's/husband's name → exclude from numerology.
  // false/unset = middle name is part of the person's own name → include it.
 isMiddleNameFatherHusband?: boolean;

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

/**
 * ------------------------------------------------------------------------
 * CENTRAL SPACING / TYPOGRAPHY SCALE
 * ------------------------------------------------------------------------
 * Every page used to hardcode its own gap/row-height/font-size numbers,
 * which is why the two reference builds ("Priyanka" vs "Bindhu") drifted
 * apart — a fix on one page never propagated anywhere else. Everything
 * below is now sourced from this single table. To make the WHOLE report
 * roomier or tighter, change these numbers once instead of hunting through
 * 15 draw functions.
 *
 * bodySize matches px(45) (~14.4pt) — the base paragraph size used
 * everywhere. Gaps are expressed as multiples of that so they scale
 * together if bodySize ever changes.
 */
const TYPE = {
  bodySize: px(45), // ~14.4pt — base paragraph / bullet text size
  lineGap: 5, // extra px added to font size for line-height inside a paragraph
  bulletGap: 14, // vertical gap BETWEEN bullet items (was inconsistently 4/8/12/16 per page)
  bulletDotOffsetRatio: 0.32, // dot's y-offset below the text baseline, as a fraction of font size
  cardPadding: 46, // standard top padding inside a rounded content box, banner to first line of text
};

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
  // Dot sits relative to the font size, not a fixed "-4" — that fixed offset
  // is what made bullets look mis-centered once font sizes ever changed.
  const dotY = -opts.size * TYPE.bulletDotOffsetRatio;
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

/** Left-aligned counterpart to drawRichWrappedTextCentered — wraps rich (bold/regular) tokens starting at a fixed x. */
function drawRichWrappedText(
  page: PDFPage,
  tokens: { text: string; bold: boolean }[],
  opts: { x: number; y: number; font: PDFFont; boldFont: PDFFont; size: number; maxWidth: number; lineHeight: number; color: RGB }
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
    let x = opts.x;
    line.forEach((tok) => {
      const font = tok.bold ? opts.boldFont : opts.font;
      page.drawText(tok.text, { x, y: cursorY, size: opts.size, font, color: opts.color });
      x += font.widthOfTextAtSize(tok.text, opts.size) + spaceWidth;
    });
    cursorY -= opts.lineHeight;
  });
  return cursorY;
}

/**
 * Bullet list where each item's lead phrase (before the first " — ") renders
 * bold, matching the Bindhu reference's "First Name Number — your personal
 * identity..." style. Falls back to a plain bullet if no " — " is found.
 */
function drawBulletListBoldLead(
  page: PDFPage,
  items: string[],
  opts: { x: number; y: number; font: PDFFont; boldFont: PDFFont; size: number; maxWidth: number; lineHeight: number; gap: number; color: RGB }
): number {
  let y = opts.y;
  const dotY = -opts.size * TYPE.bulletDotOffsetRatio;
  items.forEach((item) => {
    page.drawCircle({ x: opts.x + 3, y: y + dotY, size: 2.4, color: COLOR.maroon });
    const sepIdx = item.indexOf(" — ");
    const tokens =
      sepIdx === -1
        ? item.split(/\s+/).map((w) => ({ text: w, bold: false }))
        : buildBoldPhraseTokens(item, item.slice(0, sepIdx));
    y = drawRichWrappedText(page, tokens, {
      x: opts.x + 14,
      y,
      font: opts.font,
      boldFont: opts.boldFont,
      size: opts.size,
      maxWidth: opts.maxWidth - 14,
      lineHeight: opts.lineHeight,
      color: opts.color,
    });
    y -= opts.gap;
  });
  return y;
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
 * Pricing-card bullet-row icon badges. Every icon is fit-to-contain within a
 * box no larger than the badge circle's INSCRIBED SQUARE (r * SQRT2 would
 * touch the circle exactly at the four corners — that's the mathematical
 * ceiling). The old code used `r * 1.3`, which is fine in theory, but the
 * "digits" image itself ships with very little internal padding, so at
 * 1.3x it was visually grazing / poking past the circle's own stroke width.
 * Dropping to `r * 1.05` and shrinking further via `scale * 0.92` below
 * guarantees a visible gap between icon and circle edge at every badge size,
 * matching the reference's comfortable icon-in-circle look.
 */
function drawOfferIcon(page: PDFPage, fonts: Fonts, assets: Assets, type: OfferIconType, cx: number, cy: number, r: number) {
  const white = COLOR.white;
  const maxBox = r * 1.05; // safe inscribed bound with visible breathing room from the circle's edge

  const drawContainedImage = (img: PDFImage) => {
    const scale = Math.min(maxBox / img.width, maxBox / img.height) * 0.92;
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
      const size = maxBox * 1.0;
      page.drawText(label, { x: cx - fonts.heading.widthOfTextAtSize(label, size) / 2, y: cy - size * 0.36, size, font: fonts.heading, color: white });
      break;
    }
    case "document": {
      const w = maxBox * 0.6;
      const h = maxBox * 0.76;
      const offset = 2.2;
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

    // Date of Birth / Gender get a rounded "pill" background behind the value,
    // matching the Bindhu reference. IMPORTANT: the little dropdown indicator
    // next to "Gender" is drawn as a small filled triangle (an actual vector
    // shape), NOT as a unicode arrow character (⌄/▾) baked into the text
    // string. Baking it into the string meant it depended on that glyph
    // existing in Quicksand-Bold — it doesn't, so it rendered as a "tofu" box
    // (☐) instead of an arrow. Drawing it as a tiny SVG triangle sidesteps
    // font-glyph-coverage entirely.
    const displayText = value || "—";
    const isPillRow = label === "Date of Birth" || label === "Gender";
    const rowCenterY = y - rowHeight / 2;
    if (isPillRow) {
      const extraForArrow = label === "Gender" ? 22 : 0;
      const pillW = fonts.sansBold.widthOfTextAtSize(displayText, size) + 26 + extraForArrow;
      const pillH = size + 12;
      const pillX = valueColCenter - pillW / 2;
      drawRoundedRect(page, {
        x: pillX,
        y: rowCenterY - pillH / 2,
        width: pillW,
        height: pillH,
        radius: pillH / 2,
        color: rgb(0.94, 0.87, 0.85),
      });
      if (label === "Gender") {
        // Small downward-pointing triangle, vector-drawn so it always renders
        // regardless of font glyph coverage.
        const triW = 8;
        const triH = 5;
        const triCx = pillX + pillW - 16;
        const triTopY = rowCenterY + triH / 2;
        page.drawSvgPath(`M 0 0 L ${triW} 0 L ${triW / 2} ${-triH} Z`, {
          x: triCx - triW / 2,
          y: triTopY,
          color: COLOR.maroonDark,
        });
      }
    }

    page.drawText(displayText, {
      x: valueColCenter - fonts.sansBold.widthOfTextAtSize(displayText, size) / 2,
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
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
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
    { no: "01", title: "Personal Information & Introduction", items: ["Your Personal Profile", "Welcome Message"] },
    {
      no: "02",
      title: "Understanding Name Numerology",
      items: ["The Science of Name Numbers", "The Chaldean Number Chart", "What We'll Analyze"],
    },
    {
      no: "03",
      title: "Current Name Breakdown",
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
  const titleInnerWidth = titleColW - 20;

  const itemsTextX = tableX + numColW + titleColW + 10;
  const itemsInnerWidth = tableX + tableWidth - 10 - itemsTextX;

  rows.forEach((row) => {
    // Title is uppercased + bold to match the reference styling, so its wrap
    // must be measured with that same font/case — not the raw mixed-case
    // string — or a short-looking title can silently overflow into the
    // items column once transformed.
    const titleLines = wrapText(row.title.toUpperCase(), fonts.sansBold, bodySize, titleInnerWidth);
    const itemLineTotal = row.items.reduce((sum, item) => sum + wrapText(`• ${item}`, fonts.sans, bodySize, itemsInnerWidth).length, 0);
    // Title and items sit in two SIDE-BY-SIDE columns, not stacked in one —
    // the row only needs to be as tall as the taller of the two columns.
    const tallerLineCount = Math.max(titleLines.length, itemLineTotal);
    const rowHeight = Math.max(numSize + 20, 26 + tallerLineCount * (bodySize + 6) + 16);
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

    // The numeral ("01"/"02"/"03") is aligned to the vertical CENTER OF THE
    // TITLE BLOCK, not the center of the whole row. The row's height is
    // driven by whichever column (title vs items) has more lines, so on
    // rows where items has more lines than the title, centering on the full
    // row height leaves the numeral sitting well below the (shorter,
    // top-anchored) title — which is the "01/02/03 went lower" bug. Deriving
    // the numeral's position from the title block's own height keeps it
    // visually paired with the title regardless of how tall items make the
    // row.
    const titleBlockHeight = titleLines.length * (bodySize + 6);
    const titleBlockCenterY = y - 10 - titleBlockHeight / 2;
    page.drawText(row.no, {
      x: tableX + numColW / 2 - fonts.heading.widthOfTextAtSize(row.no, numSize) / 2,
      y: titleBlockCenterY - numSize * 0.32,
      size: numSize,
      font: fonts.heading,
      color: COLOR.maroon,
    });

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
  const bannerY = dividerY - 90;
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
  const bodySize = TYPE.bodySize;
  const lineHeight = bodySize + TYPE.lineGap;
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

  const introHeight = measureWrappedTextHeight(introText, fonts.sans, bodySize, innerWidth, lineHeight);
  const bulletsHeight = measureBulletListHeight(bulletItems, fonts.sans, bodySize, innerWidth, lineHeight, TYPE.bulletGap);
  const box1Height = TYPE.cardPadding + introHeight + 10 + bulletsHeight + 24;

  let y = PAGE_HEIGHT - 185;
  let boxTop = y;
  drawContentBox(page, { x: boxX, y: boxTop, width: boxWidth, height: box1Height });
  drawMaroonBanner(page, fonts, "What Is Name Numerology", boxX, boxTop, boxWidth);
  let cy = boxTop - TYPE.cardPadding;
  cy = drawWrappedText(page, introText, { x: 62, y: cy, font: fonts.sans, size: bodySize, maxWidth: innerWidth, lineHeight, color: COLOR.ink });
  cy -= 10;
  drawBulletList(page, bulletItems, { x: 62, y: cy, font: fonts.sans, size: bodySize, maxWidth: innerWidth, lineHeight, gap: TYPE.bulletGap, color: COLOR.ink });

  const box2Text =
    "You hear and respond to your name thousands of times throughout life. Each utterance reinforces the vibrational pattern, making your name a constant affirmation — positive or negative — depending on its alignment with your destiny.";
  const box2InnerWidth = boxWidth - 64;
  const box2LineHeight = bodySize + TYPE.lineGap + 2;
  const box2TextHeight = measureWrappedTextHeight(box2Text, fonts.sans, bodySize, box2InnerWidth, box2LineHeight);
  const box2Height = TYPE.cardPadding + 6 + box2TextHeight + 22;

  y = boxTop - box1Height - 32;
  boxTop = y;
  drawContentBox(page, { x: boxX, y: boxTop, width: boxWidth, height: box2Height });
  drawMaroonBanner(page, fonts, "Why Your Name Matters", boxX, boxTop, boxWidth);
  drawWrappedTextCentered(page, box2Text, { centerX: boxX + boxWidth / 2, y: boxTop - TYPE.cardPadding - 6, font: fonts.sans, size: bodySize, maxWidth: box2InnerWidth, lineHeight: box2LineHeight, color: COLOR.ink });
}

function drawChaldeanSystemPage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
  drawPageChrome(page, fonts, assets, { title: "Numerological\nSystems Used", subtitle: "This Report Analyzes Your Name Using", pageNumber, totalPages, brand: data.brand });

  const boxX = 44;
  const boxWidth = PAGE_WIDTH - 88;
  const bodySize = TYPE.bodySize;
  const lineHeight = bodySize + TYPE.lineGap;
    let boxTop = PAGE_HEIGHT - 210;
  const chaldeanBullets = [
    "Ancient Babylonian system — considered the most accurate approach for name analysis.",
    "Values run 1 to 8 (9 is considered sacred and is never assigned to a letter).",
    "Focuses on the sound vibration and energy of each letter, rather than its position in the alphabet.",
  ];
  const chaldeanInnerWidth = boxWidth - 36;
  const chaldeanBulletsHeight = measureBulletListHeight(chaldeanBullets, fonts.sans, bodySize, chaldeanInnerWidth, lineHeight, TYPE.bulletGap);
  const boxHeight = TYPE.cardPadding + chaldeanBulletsHeight + 18;
  drawContentBox(page, { x: boxX, y: boxTop, width: boxWidth, height: boxHeight });
  drawMaroonBanner(page, fonts, "Chaldean Numerology", boxX, boxTop, boxWidth);
  drawBulletList(page, chaldeanBullets, { x: 62, y: boxTop - TYPE.cardPadding, font: fonts.sans, size: bodySize, maxWidth: chaldeanInnerWidth, lineHeight, gap: TYPE.bulletGap, color: COLOR.ink });

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
    // Bindhu reference fills every empty cell below the shortest columns with
    // a "-" placeholder instead of leaving it blank — replicate that here.
    for (let r = columns[c].length; r < gridRows - 1; r++) {
      const placeholder = "-";
      page.drawText(placeholder, {
        x: gridX + c * colWidth + colWidth / 2 - fonts.sans.widthOfTextAtSize(placeholder, cellSize) / 2,
        y: gridTop - (r + 2) * rowHeight + rowHeight / 2 - cellSize * 0.35,
        size: cellSize,
        font: fonts.sans,
        color: COLOR.maroonDark,
      });
    }
  }
}

function drawWhatWellAnalyzePage(page: PDFPage, fonts: Fonts, assets: Assets, data: Required<NameCheckReportInput>, pageNumber: number, totalPages: number) {
  drawPageChrome(page, fonts, assets, { title: "Numerological\nSystems Used", pageNumber, totalPages, brand: data.brand });

  const boxX = 44;
  const boxWidth = PAGE_WIDTH - 88;
  const bodySize = TYPE.bodySize;
  const lineHeight = bodySize + TYPE.lineGap + 0.5;
  const innerWidth = boxWidth - 36;
  const items = [
    "First Name Number — your personal identity and self-expression.",
    "Full Name Number — your complete destiny and life purpose.",
    "Full Name Compound Number — hidden influences and karmic patterns.",
    "Complete Date of Birth — its influence on your name number, via Mulank and Bhagyank.",
  ];
  const itemsHeight = measureBulletListHeight(items, fonts.sans, bodySize, innerWidth, lineHeight, TYPE.bulletGap + 2);
  const boxTop = PAGE_HEIGHT - 195;
  const boxHeight = TYPE.cardPadding + itemsHeight + 18;
  drawContentBox(page, { x: boxX, y: boxTop, width: boxWidth, height: boxHeight });
  drawMaroonBanner(page, fonts, "What We'll Analyze", boxX, boxTop, boxWidth);

  drawBulletListBoldLead(page, items, { x: 62, y: boxTop - TYPE.cardPadding, font: fonts.sans, boldFont: fonts.sansBold, size: bodySize, maxWidth: innerWidth, lineHeight, gap: TYPE.bulletGap + 2, color: COLOR.ink });
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
  const bodySize = TYPE.bodySize;
  const lineHeight = bodySize + TYPE.lineGap;
  const nameRowH = 58;
  const totalsRowH = 56;
  let y = PAGE_HEIGHT - 215;

  drawRoundedRect(page, { x: boxX, y: y - nameRowH - totalsRowH, width: boxWidth, height: nameRowH + totalsRowH, radius: 16, color: COLOR.blushPanel, borderColor: COLOR.maroon, borderWidth: 1 });
  page.drawSvgPath(roundedTopRectSvgPath(boxWidth, nameRowH, 16), { x: boxX, y, color: COLOR.maroon });
  const nameLabelSize = 13;
  const nameValueSize = 14;
  page.drawText(opts.nameLabel.toUpperCase(), {
    x: boxX + boxWidth * 0.27 - fonts.sansBold.widthOfTextAtSize(opts.nameLabel.toUpperCase(), nameLabelSize) / 2,
    y: y - nameRowH / 2 - nameLabelSize * 0.35,
    size: nameLabelSize,
    font: fonts.sansBold,
    color: COLOR.white,
  });
  page.drawText(opts.nameValue, {
    x: boxX + boxWidth * 0.65 - fonts.sansBold.widthOfTextAtSize(opts.nameValue, nameValueSize) / 2,
    y: y - nameRowH / 2 - nameValueSize * 0.35,
    size: nameValueSize,
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
    const labelSize = 12;
    const valueSize = 16;
    [cols[0].label, cols[0].value, cols[1].label, cols[1].value].forEach((txt, i) => {
      const isLabel = i % 2 === 0;
      const size = isLabel ? labelSize : valueSize;
      const cx = boxX + colW * i + colW / 2;
      page.drawText(txt, {
        x: cx - fonts.sansBold.widthOfTextAtSize(txt, size) / 2,
        y: totalsY - totalsRowH / 2 - size * 0.35,
        size,
        font: fonts.sansBold,
        color: COLOR.maroonDark,
      });
      if (i > 0) {
        page.drawLine({ start: { x: boxX + colW * i, y: totalsY }, end: { x: boxX + colW * i, y: totalsY - totalsRowH }, thickness: 0.5, color: rgb(0.82, 0.68, 0.66) });
      }
    });
  } else {
    const txt = `Total: ${opts.total}`;
    const size = 16;
    page.drawText(txt, {
      x: boxX + boxWidth / 2 - fonts.sansBold.widthOfTextAtSize(txt, size) / 2,
      y: totalsY - totalsRowH / 2 - size * 0.35,
      size,
      font: fonts.sansBold,
      color: COLOR.maroonDark,
    });
  }

  y = totalsY - totalsRowH - 34;
  const contentBoxTop = y;
  const innerWidth = boxWidth - 36;
  const bulletsHeight = measureBulletListHeight(opts.bullets, fonts.sans, bodySize, innerWidth, lineHeight, TYPE.bulletGap);
  const contentBoxHeight = TYPE.cardPadding + bulletsHeight + 22;
  drawContentBox(page, { x: boxX, y: contentBoxTop, width: boxWidth, height: contentBoxHeight });
  drawMaroonBanner(page, fonts, "What This Represents", boxX, contentBoxTop, boxWidth);
  drawBulletList(page, opts.bullets, { x: 62, y: contentBoxTop - TYPE.cardPadding, font: fonts.sans, size: bodySize, maxWidth: innerWidth, lineHeight, gap: TYPE.bulletGap, color: COLOR.ink });
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
  const bodySize = TYPE.bodySize;
  const lineHeight = bodySize + TYPE.lineGap + 0.5;
  const boxTop = PAGE_HEIGHT - 215;
  const innerWidth = boxWidth - 36;

  const rawBullets = rule?.paragraphs ?? [
    "Name correction guidance could not be determined for this combination — please review this report manually before sending it to the customer.",
  ];
  const bullets = rawBullets.length > 1 ? rawBullets.slice(0, -1) : rawBullets;
  const verdictNote = rawBullets.length > 1 ? rawBullets[rawBullets.length - 1] : null;

  const bulletsHeight = measureBulletListHeight(bullets, fonts.sans, bodySize, innerWidth, lineHeight, TYPE.bulletGap);
  const boxHeight = TYPE.cardPadding + bulletsHeight + 22;

  drawContentBox(page, { x: boxX, y: boxTop, width: boxWidth, height: boxHeight });
  drawMaroonBanner(page, fonts, "Why This Is Critical", boxX, boxTop, boxWidth);
  drawBulletList(page, bullets, { x: 62, y: boxTop - TYPE.cardPadding, font: fonts.sans, size: bodySize, maxWidth: innerWidth, lineHeight, gap: TYPE.bulletGap, color: COLOR.ink });

  const verdictLabel = `${VERDICT_LABEL[matched.verdict]}${matched.isFallback ? " (fallback — review recommended)" : ""}`;
  const verdictText = verdictNote ?? verdictLabel;
  const verdictTop = boxTop - boxHeight - 46;

  const verdictTextSize = 13;
  const verdictTextLineHeight = verdictTextSize + 7;
  const verdictTextInnerWidth = boxWidth - 60;
  const verdictTextLines = wrapText(verdictText, fonts.sans, verdictTextSize, verdictTextInnerWidth);
  const verdictTopPadding = 26;
  const verdictBottomPadding = 22;
  const verdictHeight = Math.max(84, verdictTopPadding + verdictTextLines.length * verdictTextLineHeight + verdictBottomPadding);

  drawRoundedRect(page, { x: boxX, y: verdictTop - verdictHeight, width: boxWidth, height: verdictHeight, radius: 18, color: COLOR.maroon, borderColor: COLOR.maroon, borderWidth: 1 });

  const verdictCursorY = verdictTop - verdictTopPadding - (verdictTextLineHeight - 6);
  drawWrappedTextCentered(page, verdictText, {
    centerX: boxX + boxWidth / 2,
    y: verdictCursorY,
    font: fonts.sans,
    size: verdictTextSize,
    maxWidth: verdictTextInnerWidth,
    lineHeight: verdictTextLineHeight,
    color: COLOR.white,
  });
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
  const bodySize = TYPE.bodySize;
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
  page.drawText("YOUR NAME DECIDES", { x: centerX - fonts.heading.widthOfTextAtSize("YOUR NAME DECIDES", 15) / 2, y: titleY, size: 15, font: fonts.heading, color: COLOR.maroon });
  titleY -= 28;
  page.drawText("YOUR SPEED IN LIFE", { x: centerX - fonts.heading.widthOfTextAtSize("YOUR SPEED IN LIFE", 23) / 2, y: titleY, size: 23, font: fonts.heading, color: COLOR.maroon });
  const dividerY = titleY - 18;
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

  const colGap = 18;
  const colWidth = (PAGE_WIDTH - 88 - colGap) / 2;
  const colTop = dividerY - 40;

  const digitsSize = px(105);
  const rupeeSize = Math.round(digitsSize * 0.82 * 10) / 10;

  const strikeSize = 12;
  const offSize = 15;
  const cardTitleSize = 14;
  const bulletTextSize = 11.5;
  const noteSize = 10.5;
  const btnLabelSize = 13;
  const badgeR = 18;

  offers.forEach((offer, i) => {
    const cx = 44 + i * (colWidth + colGap);

    const priceDigits = offer.price.replace(/^\D*/, "");
    const rupeeWidth = fonts.sansBold.widthOfTextAtSize("₹", rupeeSize);
    const digitsWidth = fonts.heading.widthOfTextAtSize(priceDigits, digitsSize);
    const priceWidth = rupeeWidth + digitsWidth + 56;
    const priceH = digitsSize + 24;

    let iy = colTop - priceH - 30;
    const strikeWidth = fonts.sans.widthOfTextAtSize(offer.strike, strikeSize);
    page.drawText(offer.strike, { x: cx + colWidth / 2 - strikeWidth / 2, y: iy, size: strikeSize, font: fonts.sans, color: COLOR.muted });
    page.drawLine({ start: { x: cx + colWidth / 2 - strikeWidth / 2, y: iy + 4 }, end: { x: cx + colWidth / 2 + strikeWidth / 2, y: iy + 4 }, thickness: 0.9, color: COLOR.red });
    iy -= 26;
    page.drawText(offer.off, { x: cx + colWidth / 2 - fonts.sansBold.widthOfTextAtSize(offer.off, offSize) / 2, y: iy, size: offSize, font: fonts.sansBold, color: COLOR.ink });
    iy -= 28;
    page.drawText(offer.title, { x: cx + colWidth / 2 - fonts.sansBold.widthOfTextAtSize(offer.title, cardTitleSize) / 2, y: iy, size: cardTitleSize, font: fonts.sansBold, color: COLOR.maroon });
    iy -= 20;
    page.drawLine({ start: { x: cx + colWidth / 2 - 52, y: iy }, end: { x: cx + colWidth / 2 + 52, y: iy }, thickness: 0.75, color: COLOR.maroon });
    iy -= 26;

    const bulletTextX = 52;
    offer.bullets.forEach((b, bi) => {
      const textWidth = colWidth - 28 - bulletTextX - 14;
      const lines = wrapText(b, fonts.sans, bulletTextSize, textWidth);
      const rowH = Math.max(badgeR * 2 + 10, 26 + Math.max(0, lines.length - 1) * 15);
      drawRoundedRect(page, { x: cx + 14, y: iy - rowH, width: colWidth - 28, height: rowH, radius: 14, borderColor: COLOR.maroon, borderWidth: 0.75 });
      const badgeCx = cx + 14 + badgeR + 6;
      const badgeCy = iy - rowH / 2;
      page.drawCircle({ x: badgeCx, y: badgeCy, size: badgeR, color: COLOR.maroon });
      drawOfferIcon(page, fonts, assets, offer.icons[bi] ?? "letter", badgeCx, badgeCy, badgeR);
      let ty = iy - rowH / 2 + (lines.length - 1) * 7.5 + 4;
      lines.forEach((line) => {
        page.drawText(line, { x: cx + 14 + bulletTextX, y: ty, size: bulletTextSize, font: fonts.sans, color: COLOR.maroonDark });
        ty -= 15;
      });
      iy -= rowH + 10;
    });

    iy -= 8;
    wrapText(offer.note, fonts.sans, noteSize, colWidth - 40).forEach((line) => {
      page.drawText(line, { x: cx + colWidth / 2 - fonts.sans.widthOfTextAtSize(line, noteSize) / 2, y: iy, size: noteSize, font: fonts.sans, color: COLOR.muted });
      iy -= 14;
    });

    iy -= 8;
    const btnH = 38;
    const btnY = iy - 22;
    const cardBottom = btnY - 16;
    drawRoundedRect(page, { x: cx, y: cardBottom, width: colWidth, height: colTop - cardBottom, radius: 18, borderColor: COLOR.maroon, borderWidth: 1 });
    drawRoundedRect(page, { x: cx + colWidth / 2 - priceWidth / 2, y: colTop - priceH / 2, width: priceWidth, height: priceH, radius: priceH / 2, color: COLOR.maroon });
    const priceStartX = cx + colWidth / 2 - (rupeeWidth + digitsWidth) / 2;
    page.drawText("₹", { x: priceStartX, y: colTop - priceH / 2 + priceH * 0.32, size: rupeeSize, font: fonts.sansBold, color: COLOR.white });
    page.drawText(priceDigits, { x: priceStartX + rupeeWidth, y: colTop - priceH / 2 + priceH * 0.3, size: digitsSize, font: fonts.heading, color: COLOR.white });

    drawRoundedRect(page, { x: cx + 12, y: btnY, width: colWidth - 24, height: btnH, radius: btnH / 2, color: COLOR.maroon });
    const btnLabel = "CLICK NOW";
    page.drawText(btnLabel, { x: cx + colWidth / 2 - fonts.sansBold.widthOfTextAtSize(btnLabel, btnLabelSize) / 2, y: btnY + btnH / 2 - btnLabelSize * 0.35, size: btnLabelSize, font: fonts.sansBold, color: COLOR.white });
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
      page.drawLine({ start: { x: btnLabelX, y: btnLabelY - 2 }, end: { x: btnLabelX + btnLabelWidth, y: btnLabelY - 2 }, thickness: 0.75, color: COLOR.white });

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
    isMiddleNameFatherHusband: false,
    ...input,
    brand: { ...DEFAULT_BRAND, ...input.brand },
  };

    const dobDate = new Date(data.dob);

  const excludeMiddleNameFromNumerology = data.isMiddleNameFatherHusband === true;
  const middleNameForNumerology = excludeMiddleNameFromNumerology ? '' : data.middleName;

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

  const NO_LIGATURES = { features: { liga: false } } as const;
  const fonts: Fonts = {
    sans: await pdfDoc.embedFont(quicksandRegularBytes, NO_LIGATURES),
    sansBold: await pdfDoc.embedFont(quicksandBoldBytes, NO_LIGATURES),
    heading: await pdfDoc.embedFont(cinzelDecorativeBoldBytes, NO_LIGATURES),
    quote: await pdfDoc.embedFont(cardoRegularBytes, NO_LIGATURES),
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
    { heading: "Full Name Number", nameLabel: "Full Name", nameValue: fullName, total: fullNameSum, reducedTo: fullNameNumber, bullets: FULL_NAME_BLOCKS[comboKey(facts.fullNameToMulank, facts.fullNameToBhagyank)] },
    9,
    TOTAL_PAGES
  );
  drawCurrentNameBreakdownPage(
    addPage(),
    fonts,
    assets,
    data,
    { heading: "Full Name Compound Number", nameLabel: "Full Name", nameValue: fullName, total: fullNameCompound, bullets: COMPOUND_BLOCKS[compoundTier] },
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
