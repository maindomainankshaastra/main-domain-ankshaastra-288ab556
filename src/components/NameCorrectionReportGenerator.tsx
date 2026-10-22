
// /**
//  * NameCorrectionReportGenerator.tsx
//  * -----------------------------------------------------------------------
//  * Ankshaastra-branded Name Correction Report PDF generator (50 pages, A4).
//  *
//  * HOW THE 50 PAGES ARE BUILT
//  *   - 32 pages are identical for every customer (cover, index, science of
//  *     names, Chaldean chart, timeline, FAQ, agreement, closing, back cover…).
//  *     They ship as full-page JPGs in /public/name-correction-assets/
//  *     (static-pNN.jpg, NN = page number) and are dropped in as-is.
//  *   - 18 pages change per customer and are drawn here with pdf-lib:
//  *       4  Welcome note                 5  Numerological blueprint (profile)
//  *      10  First Name Number           11  Full Name Number
//  *      12  Full Name Compound Number   13  Why This Is Critical (HR/OA/NR)
//  *      14-16 First Letter Significance 17-18 New Name options 1 & 2
//  *      19  Recommendation level        20  Personal Loshu Grid
//  *      21-23 Rajyog 1/2/3             24  Rajyog note
//  *      38  Success mantra
//  * -----------------------------------------------------------------------
//  */

// import { PDFDocument, PDFPage, PDFFont, PDFImage, PDFName, PDFString, rgb, RGB, setCharacterSpacing } from "pdf-lib";
// import fontkit from "@pdf-lib/fontkit";

// import { computeFacts, matchRule, getRuleBlock, type NameCorrectionInput } from "@/lib/baby-reports/name-correction/rule-engine";
// import type { Verdict } from "@/lib/baby-reports/name-correction/hr-oa-nr-blocks";
// import { getLetterBlock, type LetterBlock } from "@/lib/baby-reports/shared/first-letter-index";
// import { buildStandardLoShuGrid, toGridCells } from "@/lib/baby-reports/shared/loshu-grid";
// import { evaluateAllRajyogs, type RajyogResult, type RajyogStatus } from "@/lib/baby-reports/shared/rajyog";
// import { RECOMMENDATION_BLOCKS, pickRecommendationCase, type RecommendationCase } from "@/lib/baby-reports/shared/recommendation";
// import { getFirstNameExplanation, getFullNameExplanation, getCompoundExplanation } from "@/lib/baby-reports/shared/number-explanations";
// import { getRelation, type Relation } from "@/lib/name-check/friendship-table";
// import { getCompoundTier, type CompoundTier } from "@/lib/name-check/compound-table";
// import { buildLoShuGrid, isOverAmplified } from "@/lib/name-check/lo-shu";
// import {
//   chaldeanRawSum, getFirstNameNumber, getFullNameNumber, getFullNameCompoundNumber, isRestrictedNumber,
// } from "@/lib/name-check/numerology";
// import {
//   FIRST_NAME_BLOCKS, FULL_NAME_BLOCKS, COMPOUND_BLOCKS, comboKey,
//   LOSHU_OVERAMP_FIRST_NAME_BLOCK, LOSHU_OVERAMP_FULL_NAME_BLOCK,
// } from "@/lib/name-check/content-blocks";

// /** Form dropdown "Preference". Stored with the report; the recommendation itself is always computed. */
// export type NameCorrectionPreference = "na" | "option1" | "option2" | "both";
// export const NAME_CORRECTION_PREFERENCE_OPTIONS: { value: NameCorrectionPreference; label: string }[] = [
//   { value: "na", label: "NA" },
//   { value: "option1", label: "Option 1" },
//   { value: "option2", label: "Option 2" },
//   { value: "both", label: "Both" },
// ];

// export interface NameCorrectionReportInput {
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
//   isMiddleNameFatherHusband?: boolean;
//   brand?: Partial<BrandConfig>;
//   /** Father's name, shown on the Personal Information page (falls back to the middle name when it is the father's/husband's). */
//   fatherName?: string;
//   /** The two candidate new names compared on the New Name Recommendation pages. */
//   option1Name?: string;
//   option2Name?: string;
//   /** Form dropdown "Preference" (NA / Option 1 / Option 2 / Both). Not used for drawing. */
//   preference?: NameCorrectionPreference;
//   /** Per-profile call on whether 2 is favourable (feeds the Rajyog check). Defaults to false (never over-claims). */
//   isTwoFavorableForProfile?: boolean;
//   /** Admin correction — same override pattern as the Name Check report. */
//   contentOverride?: Partial<NameCorrectionReportContent>;
// }

// /**
//  * Mirrors NameCheckReportContent's shape/purpose exactly — every computed
//  * number + paragraph in one editable, serialisable object, stored on
//  * `name_correction_reports.content_overrides`.
//  */
// export interface NameCorrectionReportContent {
//   mulank: number;
//   bhagyank: number;
//   firstNameNumber: number;
//   fullNameNumber: number;
//   fullNameCompound: number;
//   compoundTier: "excellent" | "good" | "neutral" | "conditional" | "avoid";
//   verdict: Verdict;
//   matchedRuleId: string;
//   isFallback: boolean;
//   /** HR/OA/NR rule paragraphs, minus the closing line. */
//   verdictBullets: string[];
//   /** Closing verdict-badge line. */
//   verdictNote: string;
// }

// export function computeNameCorrectionReportContent(
//   input: Pick<NameCorrectionReportInput, "customerName" | "dob" | "firstName" | "middleName" | "lastName" | "isMiddleNameFatherHusband" | "isTwoFavorableForProfile">
// ): NameCorrectionReportContent {
//   const split = splitName(input.customerName);
//   const firstName = input.firstName ?? split.first;
//   const middleName = input.middleName ?? split.middle;
//   const lastName = input.lastName ?? split.last;

//   const dobDate = new Date(input.dob);
//   const middleNameForNumerology = input.isMiddleNameFatherHusband === true ? "" : middleName;
//   const fullName = [firstName, middleNameForNumerology, lastName].filter(Boolean).join(" ").trim();

//   const engineInput: NameCorrectionInput = {
//     dob: { day: dobDate.getDate(), month: dobDate.getMonth() + 1, year: dobDate.getFullYear() },
//     firstName,
//     fullName,
//     // TODO: client confirmed this is a per-profile judgment call for the
//     // Rajyog check — wire up wherever that determination actually gets
//     // made for this report; defaulting false is the safe/conservative
//     // choice in the meantime (never over-claims a Rajyog completion).
//     isTwoFavorableForProfile: input.isTwoFavorableForProfile ?? false,
//   };

//   const facts = computeFacts(engineInput);
//   const match = matchRule(facts);
//   const rule = getRuleBlock(match.ruleId);

//   const rawParagraphs = rule?.paragraphs ?? [
//     "Name correction guidance could not be determined for this combination — please review this report manually before sending it to the customer.",
//   ];
//   const verdictBullets = rawParagraphs.length > 1 ? rawParagraphs.slice(0, -1) : rawParagraphs;
//   const verdictNote = rawParagraphs.length > 1 ? rawParagraphs[rawParagraphs.length - 1] : rawParagraphs[0];

//   return {
//     mulank: facts.mulank,
//     bhagyank: facts.bhagyank,
//     firstNameNumber: facts.firstNameNumber,
//     fullNameNumber: facts.fullNameNumber,
//     fullNameCompound: facts.fullNameCompoundNumber,
//     compoundTier: facts.compoundTier,
//     verdict: match.verdict,
//     matchedRuleId: match.ruleId,
//     isFallback: match.isFallback,
//     verdictBullets,
//     verdictNote,
//   };
// }


// type ResolvedInput = Omit<Required<NameCorrectionReportInput>, "brand" | "option1Name" | "option2Name" | "isTwoFavorableForProfile"> & {
//   brand: BrandConfig;
//   option1Name: string;
//   option2Name: string;
//   isTwoFavorableForProfile: boolean;
// };

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

// const PAGE_WIDTH = 595.28; // A4 portrait, points
// const PAGE_HEIGHT = 841.89;
// const CENTER_X = PAGE_WIDTH / 2;
// /** Convert a distance measured from the TOP of the page into a pdf-lib y coordinate. */
// const T = (fromTop: number) => PAGE_HEIGHT - fromTop;

// /**
//  * Palette — sampled directly from the client's reference PDF
//  * (Prashanth_Name_Correction_Report_Ankshaastra.pdf, Canva export).
//  */
// const COLOR = {
//   bg: rgb(0.0275, 0.051, 0.102), // box / pill fill  #070D1A
//   white: rgb(1, 1, 1), // body text
//   gold: rgb(1, 0.839, 0.6), // section labels, hairlines, page border, URL  #FFD699
//   goldLabel: rgb(0.89, 0.69, 0.44), // table labels, big page titles  #E3B070
//   goldDeep: rgb(0.87, 0.68, 0.43), // rail dots, name on welcome page  #DEAD6E
//   boxStroke: rgb(0.91, 0.749, 0.573), // box outlines, table lines, pill shadow plates  #E8BF92
// };

// /** Letter-spacing (in em) used by the reference. Quicksand is tracked; Cinzel is not. */
// const TRACK = { body: 0.05, label: 0.1, head: 0.08 };

// /** Type scale (pt) used by the reference. */
// const SZ = { small: 16, big: 25.6, h1: 17.6, label: 14.4, table: 12.8, body: 11.2, url: 14.1 };

// interface Fonts {
//   sans: PDFFont; // Quicksand Regular
//   sansBold: PDFFont; // Quicksand Bold
//   heading: PDFFont; // Cinzel Decorative REGULAR (falls back to Bold if the file is missing)
//   headingBold: PDFFont; // Cinzel Decorative Bold
//   cinzel: PDFFont; // Cinzel Regular (falls back to heading)
//   cinzelBold: PDFFont; // Cinzel Bold (falls back to headingBold)
// }

// const ASSET_BASE = "/name-correction-assets";
// const FONT_BASE = "/name-check-assets/fonts";
// const ASSET_PATHS = {
//   background: `${ASSET_BASE}/background-plain.png`, // plain navy gradient, NO border (border is drawn as a thin vector)
//   logo: `${ASSET_BASE}/logo-ankshaastra-white-hd.png`, // white/cream logo, as in the reference
//   hands: `${ASSET_BASE}/icon-hands-ref.png`,
//   lotus: `${ASSET_BASE}/icon-lotus-ref.png`,
//   star: `${ASSET_BASE}/divider-star.png`, // thin sparkle in the middle of every divider
//   person: `${ASSET_BASE}/icon-person.png`,
//   badgeWarning: `${ASSET_BASE}/badge-warning.png`,
//   badgeFist: `${ASSET_BASE}/badge-fist.png`,
//   badgeCrown: `${ASSET_BASE}/badge-crown.png`,
//   badgeStar: `${ASSET_BASE}/badge-star.png`,
//   fonts: {
//     quicksandRegular: `${FONT_BASE}/Quicksand-Regular.ttf`,
//     quicksandBold: `${FONT_BASE}/Quicksand-Bold.ttf`,
//     cinzelDecorativeBold: `${FONT_BASE}/CinzelDecorative-Bold.ttf`,
//     // Optional — add these three files (Google Fonts, OFL) for a pixel-exact match.
//     cinzelDecorativeRegular: `${FONT_BASE}/CinzelDecorative-Regular.ttf`,
//     cinzelRegular: `${FONT_BASE}/Cinzel-Regular.ttf`,
//     cinzelBold: `${FONT_BASE}/Cinzel-Bold.ttf`,
//   },
// };

// /**
//  * The 32 pages of the report that are identical for every customer. They are
//  * exported once from the client's Canva sample as full-page JPGs
//  * (/public/name-correction-assets/static-pNN.jpg, NN = page number in the
//  * 50-page report) and simply dropped in as full-bleed images.
//  */
// const STATIC_PAGE_NUMBERS = [
//   1, 2, 3, 6, 7, 8, 9, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37,
//   39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
// ];
// const staticPagePath = (n: number) => `${ASSET_BASE}/static-p${String(n).padStart(2, "0")}.jpg`;

// /* ------------------------------------------------------------------ */
// /*  Clickable social / review links on the static "Connect With Me"      */
// /*  pages (27 and 44). Rects are measured on the 924x1308 page exports  */
// /*  and converted to PDF points at draw time.                           */
// /* ------------------------------------------------------------------ */

// const SOCIAL_LINKS = {
//   instagram: "https://www.instagram.com/ankshaastra?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
//   linkedin: "https://www.linkedin.com/company/ankshaastra/?viewAsMember=true",
//   facebook: "https://www.facebook.com/p/Ankshaastra-61561549995939/",
//   youtube: "https://www.youtube.com/@Ankshaastra",
//   review: "https://share.google/RzRonHbVF8Q1lUHc4",
// };
// const LINK_REF_W = 924;
// const LINK_REF_H = 1308;
// /** [x0, y0, x1, y1] in the 924x1308 reference image (origin top-left) — icon + "Click Me" together. */
// const CONNECT_PAGE_LINKS: { url: string; box: [number, number, number, number] }[] = [
//   { url: SOCIAL_LINKS.instagram, box: [165, 325, 412, 402] },
//   { url: SOCIAL_LINKS.linkedin, box: [482, 325, 728, 402] },
//   { url: SOCIAL_LINKS.facebook, box: [165, 439, 412, 516] },
//   { url: SOCIAL_LINKS.youtube, box: [488, 439, 728, 516] },
//   // "Click Below To" text + the "LEAVE A REVIEW" pill
//   { url: SOCIAL_LINKS.review, box: [196, 884, 386, 914] },
//   { url: SOCIAL_LINKS.review, box: [181, 934, 402, 998] },
// ];
// const CONNECT_PAGES = [27, 44];

// function addLinkAnnotations(doc: PDFDocument, page: PDFPage, links: typeof CONNECT_PAGE_LINKS) {
//   const sx = PAGE_WIDTH / LINK_REF_W;
//   const sy = PAGE_HEIGHT / LINK_REF_H;
//   const annots = links.map(({ url, box }) => {
//     const [x0, y0, x1, y1] = box;
//     return doc.context.register(
//       doc.context.obj({
//         Type: "Annot",
//         Subtype: "Link",
//         Rect: [x0 * sx, PAGE_HEIGHT - y1 * sy, x1 * sx, PAGE_HEIGHT - y0 * sy],
//         Border: [0, 0, 0],
//         A: { Type: "Action", S: "URI", URI: PDFString.of(url) },
//       }),
//     );
//   });
//   page.node.set(PDFName.of("Annots"), doc.context.obj(annots));
// }

// async function fetchAssetBytes(path: string): Promise<Uint8Array> {
//   const res = await fetch(path);
//   if (!res.ok) {
//     throw new Error(`Name Correction PDF: failed to fetch design asset "${path}" (${res.status}). Check it was uploaded to /public${path}.`);
//   }
//   return new Uint8Array(await res.arrayBuffer());
// }

// /** Optional font: returns null (instead of throwing) when the file is absent or the SPA served index.html for it. */
// async function fetchOptionalFont(path: string): Promise<Uint8Array | null> {
//   try {
//     const res = await fetch(path);
//     if (!res.ok) return null;
//     const bytes = new Uint8Array(await res.arrayBuffer());
//     const magic = String.fromCharCode(...bytes.slice(0, 4));
//     const isFont = (bytes[0] === 0 && bytes[1] === 1 && bytes[2] === 0 && bytes[3] === 0) || magic === "true" || magic === "OTTO";
//     return isFont ? bytes : null;
//   } catch {
//     return null;
//   }
// }

// /* ------------------------------------------------------------------ */
// /*  Text helpers (tracked text — the reference uses 0.05em / 0.08em /   */
// /*  0.1em letter-spacing on Quicksand)                                  */
// /* ------------------------------------------------------------------ */

// /** Width of `text` including tracking (no trailing space after the last glyph). */
// function tw(font: PDFFont, text: string, size: number, trackEm = 0) {
//   return font.widthOfTextAtSize(text, size) + Math.max(0, text.length - 1) * trackEm * size;
// }

// interface TxtOpts { x: number; y: number; font: PDFFont; size: number; color: RGB; track?: number }
// /** Draw tracked text. `y` is a pdf-lib baseline (use T(baselineFromTop)). */
// function txt(page: PDFPage, text: string, o: TxtOpts) {
//   const t = (o.track ?? 0) * o.size;
//   if (t) page.pushOperators(setCharacterSpacing(t));
//   page.drawText(text, { x: o.x, y: o.y, size: o.size, font: o.font, color: o.color });
//   if (t) page.pushOperators(setCharacterSpacing(0));
// }

// /** Centered tracked text. `base` = baseline measured from the TOP of the page. */
// function txtC(page: PDFPage, text: string, o: { base: number; font: PDFFont; size: number; color: RGB; track?: number; cx?: number }) {
//   const cx = o.cx ?? CENTER_X;
//   txt(page, text, { x: cx - tw(o.font, text, o.size, o.track) / 2, y: T(o.base), font: o.font, size: o.size, color: o.color, track: o.track });
// }

// /** Centered run of differently-coloured segments on one baseline. */
// function txtSegC(page: PDFPage, segs: { t: string; c: RGB }[], o: { base: number; font: PDFFont; size: number; track?: number; cx?: number }) {
//   const cx = o.cx ?? CENTER_X;
//   const tr = (o.track ?? 0) * o.size;
//   const widths = segs.map((s) => o.font.widthOfTextAtSize(s.t, o.size) + s.t.length * tr);
//   const total = widths.reduce((a, b) => a + b, 0) - tr;
//   let x = cx - total / 2;
//   segs.forEach((s, i) => {
//     txt(page, s.t, { x, y: T(o.base), font: o.font, size: o.size, color: s.c, track: o.track });
//     x += widths[i];
//   });
// }

// function wrap(text: string, font: PDFFont, size: number, maxWidth: number, trackEm = 0): string[] {
//   const words = text.split(/\s+/).filter(Boolean);
//   const lines: string[] = [];
//   let current = "";
//   for (const word of words) {
//     const trial = current ? `${current} ${word}` : word;
//     if (tw(font, trial, size, trackEm) > maxWidth && current) {
//       lines.push(current);
//       current = word;
//     } else {
//       current = trial;
//     }
//   }
//   if (current) lines.push(current);
//   return lines;
// }

// interface ParaOpts {
//   x: number; base: number; maxW: number; lh: number;
//   font: PDFFont; size: number; color: RGB; track?: number;
//   align?: "left" | "center" | "justify";
// }
// /** Wrapped paragraph. `base` = FIRST baseline from the page top. Returns the LAST baseline (from top). */
// function para(page: PDFPage, text: string, o: ParaOpts): number {
//   const lines = wrap(text, o.font, o.size, o.maxW, o.track);
//   lines.forEach((line, i) => {
//     const base = o.base + i * o.lh;
//     const isLast = i === lines.length - 1;
//     if (o.align === "justify" && !isLast && line.includes(" ")) {
//       const words = line.split(" ");
//       const wordsWidth = words.reduce((s, w) => s + tw(o.font, w, o.size, o.track), 0);
//       const gap = (o.maxW - wordsWidth) / (words.length - 1);
//       let x = o.x;
//       words.forEach((w) => {
//         txt(page, w, { x, y: T(base), font: o.font, size: o.size, color: o.color, track: o.track });
//         x += tw(o.font, w, o.size, o.track) + gap;
//       });
//     } else if (o.align === "center") {
//       txtC(page, line, { base, font: o.font, size: o.size, color: o.color, track: o.track, cx: o.x + o.maxW / 2 });
//     } else {
//       txt(page, line, { x: o.x, y: T(base), font: o.font, size: o.size, color: o.color, track: o.track });
//     }
//   });
//   return o.base + (lines.length - 1) * o.lh;
// }

// function lineCount(text: string, font: PDFFont, size: number, maxW: number, track = 0) {
//   return wrap(text, font, size, maxW, track).length;
// }

// /* ------------------------------------------------------------------ */
// /*  Shape helpers                                                       */
// /* ------------------------------------------------------------------ */

// function roundedRectSvgPath(width: number, height: number, radius: number): string {
//   const r = Math.min(radius, width / 2, height / 2);
//   return [
//     `M ${r} 0`, `H ${width - r}`, `A ${r} ${r} 0 0 1 ${width} ${r}`, `V ${height - r}`,
//     `A ${r} ${r} 0 0 1 ${width - r} ${height}`, `H ${r}`, `A ${r} ${r} 0 0 1 0 ${height - r}`,
//     `V ${r}`, `A ${r} ${r} 0 0 1 ${r} 0`, `Z`,
//   ].join(" ");
// }

// /** (x, y) is the BOTTOM-left corner in pdf-lib coordinates. */
// function drawRoundedRect(
//   page: PDFPage,
//   opts: { x: number; y: number; width: number; height: number; radius: number; color?: RGB; borderColor?: RGB; borderWidth?: number },
// ) {
//   page.drawSvgPath(roundedRectSvgPath(opts.width, opts.height, opts.radius), {
//     x: opts.x, y: opts.y + opts.height, scale: 1,
//     color: opts.color, borderColor: opts.borderColor, borderWidth: opts.borderWidth,
//   });
// }

// const BOX_STROKE = 0.9;
// /** Navy box with the reference's soft-gold outline. `top` is measured from the page top. */
// function drawBox(page: PDFPage, x: number, top: number, w: number, h: number, r = 10) {
//   drawRoundedRect(page, { x, y: T(top) - h, width: w, height: h, radius: r, color: COLOR.bg, borderColor: COLOR.boxStroke, borderWidth: BOX_STROKE });
// }

// /** Navy "pill / card" with the offset gold plate behind it (Rajyog status pill, Important Note, etc). */
// function drawPlate(page: PDFPage, x: number, top: number, w: number, h: number, r: number, dx = 6.1, dy = 5.8) {
//   drawRoundedRect(page, { x: x + dx, y: T(top) - h - dy, width: w, height: h, radius: r, color: COLOR.boxStroke });
//   drawRoundedRect(page, { x, y: T(top) - h, width: w, height: h, radius: r, color: COLOR.bg, borderColor: COLOR.boxStroke, borderWidth: BOX_STROKE });
// }

// /** Hairline (0.3pt) horizontal rule centred on CENTER_X — the reference's divider / underline weight. */
// function drawRule(page: PDFPage, y: number, w: number, cx = CENTER_X) {
//   page.drawRectangle({ x: cx - w / 2, y: T(y) - 0.15, width: w, height: 0.3, color: COLOR.gold });
// }

// /** Table rule: 0.96pt line in the reference's box-stroke colour. */
// function drawTableLine(page: PDFPage, x1: number, y1Top: number, x2: number, y2Top: number, thickness = 0.9) {
//   page.drawLine({ start: { x: x1, y: T(y1Top) }, end: { x: x2, y: T(y2Top) }, thickness, color: COLOR.boxStroke });
// }

// /** Image centred on (cx, cyFromTop) at the given width. */
// function drawIcon(page: PDFPage, img: PDFImage, cx: number, cyFromTop: number, width: number) {
//   const h = (img.height / img.width) * width;
//   page.drawImage(img, { x: cx - width / 2, y: T(cyFromTop) - h / 2, width, height: h });
// }

// /** Page background (plain navy gradient) + the thin reference border (0.65pt, #FFD699, r≈11.8). */
// function drawFrame(page: PDFPage, assets: Assets) {
//   page.drawImage(assets.background, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });
//   drawRoundedRect(page, { x: 24.9, y: T(816.5), width: 545.5, height: 796.1, radius: 11.8, borderColor: COLOR.gold, borderWidth: 0.65 });
// }

// /** Hairline divider with the sparkle in the middle. `y` = distance from page top. */
// function drawDivider(page: PDFPage, assets: Assets, y: number, cx = CENTER_X) {
//   const yy = T(y);
//   page.drawRectangle({ x: cx - 130.55, y: yy - 0.15, width: 110.1, height: 0.3, color: COLOR.gold });
//   page.drawRectangle({ x: cx + 20.45, y: yy - 0.15, width: 110.1, height: 0.3, color: COLOR.gold });
//   drawIcon(page, assets.star, cx, y, 31.5);
// }

// interface HeaderPos { smallBase: number; bigBase: number; dividerY: number }
// /** Title block geometry used by the reference (two layouts: "A" for pages 10-19, "B" for pages 16 & 20-24). */
// const HEADER_A: HeaderPos = { smallBase: 58.6, bigBase: 94.4, dividerY: 119.2 };
// const HEADER_B: HeaderPos = { smallBase: 74.9, bigBase: 114.0, dividerY: 142.0 };

// /** "Small line / Big line" title (Cinzel Decorative Regular 16 / 25.6) with the sparkle divider. */
// function drawHeader(page: PDFPage, fonts: Fonts, assets: Assets, small: string, big: string, pos: HeaderPos = HEADER_A, bigColor: RGB = COLOR.goldLabel) {
//   txtC(page, small, { base: pos.smallBase, font: fonts.heading, size: SZ.small, color: COLOR.white });
//   txtC(page, big, { base: pos.bigBase, font: fonts.heading, size: SZ.big, color: bigColor });
//   drawDivider(page, assets, pos.dividerY);
// }

// /** Section label (Quicksand 14.4, gold, 0.08em) with an optional hairline under it. */
// function drawLabel(page: PDFPage, fonts: Fonts, text: string, base: number, rule?: { y: number; w: number }) {
//   txtC(page, text, { base, font: fonts.sans, size: SZ.label, color: COLOR.gold, track: TRACK.head });
//   if (rule) drawRule(page, rule.y, rule.w);
// }

// /** Page footer: lotus ornament (+ tracked URL on the pages that carry it). */
// function drawFooter(page: PDFPage, fonts: Fonts, assets: Assets, brand: BrandConfig, opts: { withUrl: boolean }) {
//   if (!opts.withUrl) {
//     drawIcon(page, assets.lotus, CENTER_X, 787.9, 75.8);
//     return;
//   }
//   drawIcon(page, assets.lotus, CENTER_X, 756.3, 75.9);
//   const url = brand.website.toUpperCase();
//   // fit the tracked URL to the reference width (309.1pt)
//   const track = (309.1 - fonts.sans.widthOfTextAtSize(url, SZ.url)) / Math.max(1, url.length - 1);
//   txt(page, url, { x: CENTER_X - 309.1 / 2, y: T(798.2), font: fonts.sans, size: SZ.url, color: COLOR.gold, track: track / SZ.url });
// }

// const BODY = { size: SZ.body, line: 22.3, track: TRACK.body };

// /**
//  * "What this name will do for you" style box: navy rounded box, paragraphs justified,
//  * thin rail with a gold dot at the start of each paragraph. `top` from page top.
//  */
// function drawRailBox(page: PDFPage, fonts: Fonts, paragraphs: string[], box: { top: number; minH: number }) {
//   const x = 59.5;
//   const w = 476.3;
//   const textX = x + 37.7;
//   const textW = w - 75.4;
//   const firstBase = box.top + 35.7;
//   const counts = paragraphs.map((p) => lineCount(p, fonts.sans, BODY.size, textW, BODY.track));
//   let base = firstBase;
//   const bases: number[] = [];
//   counts.forEach((n) => {
//     bases.push(base);
//     base += (n - 1) * BODY.line + 2 * BODY.line; // blank line between paragraphs
//   });
//   const lastBase = bases.length ? bases[bases.length - 1] + (counts[counts.length - 1] - 1) * BODY.line : firstBase;
//   const h = Math.max(box.minH, lastBase + 23.5 - box.top);
//   drawBox(page, x, box.top, w, h, 10);
//   const dotX = x + 24.3;
//   paragraphs.forEach((p, i) => {
//     para(page, p, { x: textX, base: bases[i], maxW: textW, lh: BODY.line, font: fonts.sans, size: BODY.size, color: COLOR.white, track: BODY.track, align: "justify" });
//   });
//   railDots(page, bases.map((b) => b - 5.8), dotX);
// }

// /** Vertical gold rail with a dot at every y (distances from the page top). */
// function railDots(page: PDFPage, ys: number[], x: number) {
//   if (!ys.length) return;
//   if (ys.length > 1) {
//     page.drawLine({ start: { x, y: T(ys[0]) }, end: { x, y: T(ys[ys.length - 1]) }, thickness: 1, color: COLOR.goldDeep });
//   }
//   ys.forEach((y) => page.drawCircle({ x, y: T(y), size: 3.55, color: COLOR.goldDeep }));
// }

// function formatDate(iso: string): string {
//   const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
//   if (m) return `${m[3]}/${m[2]}/${m[1]}`;
//   const d = new Date(iso);
//   if (isNaN(d.getTime())) return iso;
//   return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
// }

// function parseDob(iso: string): { day: number; month: number; year: number } {
//   const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
//   if (m) return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
//   const d = new Date(iso);
//   return { day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear() };
// }

// /** Kua number — the client's "Kua Number Calculation Logic" (docx). */
// export function computeKuaNumber(year: number, gender: string): number | null {
//   const g = gender.trim().toLowerCase();
//   const male = g === "male" || g === "m";
//   const female = g === "female" || g === "f";
//   if (!male && !female) return null;
//   const reduce = (n: number): number => (n > 9 ? reduce(String(n).split("").reduce((s, d) => s + Number(d), 0)) : n);
//   const digit = reduce(String(year).split("").reduce((s, d) => s + Number(d), 0));
//   let kua = reduce(male ? 11 - digit : digit + 4);
//   if (kua === 5) kua = male ? 2 : 8;
//   return kua;
// }

// interface Assets {
//   background: PDFImage;
//   logo: PDFImage;
//   hands: PDFImage;
//   lotus: PDFImage;
//   star: PDFImage;
//   person: PDFImage;
//   badgeWarning: PDFImage;
//   badgeFist: PDFImage;
//   badgeCrown: PDFImage;
//   badgeStar: PDFImage;
//   statics: Map<number, PDFImage>;
// }

// /* ------------------------------------------------------------------ */
// /*  Derived numerology for a candidate (current or new) name            */
// /* ------------------------------------------------------------------ */

// interface NameFacts {
//   displayName: string;
//   firstName: string;
//   firstRawSum: number;
//   firstNumber: number;
//   fullRawSum: number; // == compound number
//   fullNumber: number;
//   compound: number;
//   compoundTier: CompoundTier;
//   firstVsMulank: Relation;
//   firstVsBhagyank: Relation;
//   fullVsMulank: Relation;
//   fullVsBhagyank: Relation;
//   firstOverAmp: boolean;
//   fullOverAmp: boolean;
// }

// function analyseName(fullName: string, mulank: number, bhagyank: number, dob: { day: number; month: number; year: number }): NameFacts {
//   const clean = fullName.trim().replace(/\s+/g, " ");
//   const firstName = clean.split(" ")[0] ?? "";
//   const grid = buildLoShuGrid(dob.day, dob.month, dob.year);
//   const firstNumber = getFirstNameNumber(firstName);
//   const fullNumber = getFullNameNumber(clean);
//   const compound = getFullNameCompoundNumber(clean);
//   return {
//     displayName: clean,
//     firstName,
//     firstRawSum: chaldeanRawSum(firstName),
//     firstNumber,
//     fullRawSum: compound,
//     fullNumber,
//     compound,
//     compoundTier: getCompoundTier(compound),
//     firstVsMulank: getRelation(mulank, firstNumber),
//     firstVsBhagyank: getRelation(bhagyank, firstNumber),
//     fullVsMulank: getRelation(mulank, fullNumber),
//     fullVsBhagyank: getRelation(bhagyank, fullNumber),
//     firstOverAmp: isOverAmplified(firstNumber, grid),
//     fullOverAmp: isOverAmplified(fullNumber, grid),
//   };
// }

// const REL_SCORE: Record<Relation, number> = { friendly: 0, neutral: 1, enemy: 2 };
// const TIER_SCORE: Record<CompoundTier, number> = { excellent: 0, good: 1, neutral: 2, conditional: 3, avoid: 4 };

// /** Lower = more favourable. Same ingredients as the client's HR/OA/NR rules (relations, restricted numbers, compound tier). */
// function favourabilityRank(f: NameFacts): number {
//   return (
//     REL_SCORE[f.firstVsMulank] + REL_SCORE[f.firstVsBhagyank] +
//     REL_SCORE[f.fullVsMulank] + REL_SCORE[f.fullVsBhagyank] +
//     TIER_SCORE[f.compoundTier] +
//     (isRestrictedNumber(f.firstNumber) ? 2 : 0) + (isRestrictedNumber(f.fullNumber) ? 2 : 0) +
//     (f.firstOverAmp ? 0.5 : 0) + (f.fullOverAmp ? 0.5 : 0)
//   );
// }

// function impactLabel(rank: number, best: boolean): string {
//   if (rank <= 3) return best ? "Highest" : "High";
//   if (rank <= 6) return best ? "High" : "Moderate";
//   return best ? "Moderate" : "Low";
// }

// /* ------------------------------------------------------------------ */
// /*  The 18 dynamic pages — geometry measured from the reference PDF     */
// /*  (all positions in pt; "base" = text baseline measured from top)     */
// /* ------------------------------------------------------------------ */

// const BOX_X = 59.5; // every full-width box: x 59.5 → 535.8 (centred on the page)
// const BOX_W = 476.3;

// /** Page 4 — personalised welcome note. */
// function drawWelcomePage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput) {
//   drawFrame(page, assets);
//   drawIcon(page, assets.logo, CENTER_X, 79.6, 335.5);
//   drawDivider(page, assets, 261.3);
//   txtC(page, "“Namaskar", { base: 205.2, font: fonts.heading, size: SZ.big, color: COLOR.white });
//   txtC(page, `${data.firstName.toUpperCase()} ji,”`, { base: 235.9, font: fonts.heading, size: SZ.big, color: COLOR.goldDeep });

//   const size = 12.8;
//   const lh = 19.2;
//   const maxW = 432;
//   const track = TRACK.body;
//   const name = data.brand.numerologistName;
//   const lead = "“This personalized name correction report has been prepared after careful analysis of your birth date and current name by celebrity ";
//   const gold = `Astro-Numerologist ${name}.`;
//   const tail = " The new name suggested is rooted in the approach of Chaldean Numerology and the Loshu Grid. The purpose of this report is to harmonize the cosmic energies influencing your life.";
//   // word list with colour, wrapped as plain text
//   const goldWords = gold.split(/\s+/).length;
//   const words = (lead + gold + tail).split(/\s+/).filter(Boolean);
//   const goldStart = lead.trim().split(/\s+/).length;
//   const lines: string[][] = [];
//   let cur: number[] = [];
//   const widthOf = (idx: number[]) => tw(fonts.sans, idx.map((i) => words[i]).join(" "), size, track);
//   words.forEach((_, i) => {
//     if (cur.length && widthOf([...cur, i]) > maxW) { lines.push(cur.map(String)); cur = []; }
//     cur.push(i);
//   });
//   if (cur.length) lines.push(cur.map(String));
//   let base = 321.8;
//   lines.forEach((l) => {
//     const segs: { t: string; c: RGB }[] = [];
//     l.forEach((s, k) => {
//       const i = Number(s);
//       const c = i >= goldStart && i < goldStart + goldWords ? COLOR.gold : COLOR.white;
//       const t = words[i] + (k < l.length - 1 ? " " : "");
//       if (segs.length && segs[segs.length - 1].c === c) segs[segs.length - 1].t += t; else segs.push({ t, c });
//     });
//     txtSegC(page, segs, { base, font: fonts.sans, size, track });
//     base += lh;
//   });
//   base -= lh; // last baseline of paragraph 1
//   const p2 = "Please approach these practices with faith, consistency, and pure intention. Divine grace flows to those who practice with devotion.";
//   const p2Last = para(page, p2, { x: CENTER_X - maxW / 2, base: base + 2 * lh, maxW, lh, font: fonts.sans, size, color: COLOR.white, track, align: "center" });
//   const div2 = p2Last + 34.0;
//   drawDivider(page, assets, div2);
//   para(page, "May this guide illuminate your path towards prosperity, peace, and spiritual growth.”", {
//     x: CENTER_X - maxW / 2, base: div2 + 42.8, maxW, lh, font: fonts.sans, size, color: COLOR.white, track, align: "center",
//   });
//   drawIcon(page, assets.hands, CENTER_X, 736.4, 100.8);
// }

// /** Page 5 — personal profile table. */
// function drawBlueprintPage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput, c: NameCorrectionReportContent, kua: number | null) {
//   drawFrame(page, assets);
//   drawHeader(page, fonts, assets, "Understanding Your", "Numerological Blueprint", { smallBase: 73.9, bigBase: 108.9, dividerY: 130.2 });
//   drawLabel(page, fonts, "Personal Information", 178.6, { y: 184.3, w: 110.6 });

//   const father = data.fatherName || (data.isMiddleNameFatherHusband ? data.middleName : "");
//   const rows: [string, string][] = [
//     ["First Name:", data.firstName],
//     ["Middle Name :", data.middleName || "-"],
//     ["Last Name:", data.lastName || "-"],
//     ["Date of Birth:", formatDate(data.dob)],
//     ["Gender:", data.gender],
//     ["Fathers Name:", father || "-"],
//     ["Mulank:", String(c.mulank)],
//     ["Bhagyank:", String(c.bhagyank)],
//     ["Kua No.:", kua == null ? "-" : String(kua)],
//     ["First Name Number", String(c.firstNameNumber)],
//     ["Full Name Number", String(c.fullNameNumber)],
//     ["Full Name Compound Number", String(c.fullNameCompound)],
//   ];
//   const top = 199.7;
//   const totalH = 562.6;
//   const rowH = totalH / rows.length;
//   const splitX = 300.9;
//   drawBox(page, BOX_X, top, BOX_W, totalH, 14);
//   drawTableLine(page, splitX, top, splitX, top + totalH);
//   rows.forEach(([label, value], i) => {
//     const rowTop = top + i * rowH;
//     if (i > 0) drawTableLine(page, BOX_X, rowTop, BOX_X + BOX_W, rowTop, 0.5);
//     const mid = rowTop + rowH / 2;
//     txtC(page, label, { base: mid + 4.6, font: fonts.sans, size: SZ.table, color: COLOR.goldLabel, track: TRACK.label, cx: (BOX_X + splitX) / 2 });
//     const lines = wrap(value, fonts.sans, SZ.table, 220, TRACK.body);
//     lines.forEach((ln, li) => {
//       txtC(page, ln, { base: mid + 4.6 - ((lines.length - 1) * 15) / 2 + li * 15, font: fonts.sans, size: SZ.table, color: COLOR.white, track: TRACK.body, cx: (splitX + BOX_X + BOX_W) / 2 });
//     });
//   });
//   drawFooter(page, fonts, assets, data.brand, { withUrl: false });
// }

// /** Pages 10–12 — Current Name Analysis (first name / full name / compound). */
// function drawCurrentNamePage(
//   page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput,
//   cfg: { heading: string; nameLabel: string; nameValue: string; total: number; reducedTo?: number; paragraphs: string[] },
// ) {
//   drawFrame(page, assets);
//   drawHeader(page, fonts, assets, "Current", "Name Analysis");
//   txtC(page, cfg.heading.toUpperCase(), { base: 163.5, font: fonts.sans, size: SZ.h1, color: COLOR.gold, track: TRACK.head });
//   drawRule(page, 204.7, 124.3);
//   drawLabel(page, fonts, "Numerological Breakdown", 236.5);

//   const top = 248.2;
//   const h = 111;
//   const mid = 305.2;
//   const v1 = BOX_X + 137.7;
//   drawBox(page, BOX_X, top, BOX_W, h, 10);
//   drawTableLine(page, BOX_X, mid, BOX_X + BOX_W, mid);
//   drawTableLine(page, v1, top, v1, top + h);
//   const b1 = (top + mid) / 2 + 5.5;
//   const b2 = (mid + top + h) / 2 + 5.5;
//   txtC(page, cfg.nameLabel, { base: b1, font: fonts.sans, size: SZ.table, color: COLOR.goldLabel, track: TRACK.label, cx: (BOX_X + v1) / 2 });
//   txtC(page, cfg.nameValue, { base: b1, font: fonts.sans, size: SZ.table, color: COLOR.white, track: TRACK.body, cx: (v1 + BOX_X + BOX_W) / 2 });
//   txtC(page, "Total", { base: b2, font: fonts.sans, size: SZ.table, color: COLOR.goldLabel, track: TRACK.label, cx: (BOX_X + v1) / 2 });
//   if (cfg.reducedTo !== undefined) {
//     const v2 = BOX_X + 202.2;
//     const v3 = BOX_X + 405.7;
//     drawTableLine(page, v2, mid, v2, top + h);
//     drawTableLine(page, v3, mid, v3, top + h);
//     txtC(page, String(cfg.total), { base: b2, font: fonts.sans, size: SZ.table, color: COLOR.white, track: TRACK.body, cx: (v1 + v2) / 2 });
//     txtC(page, "Reduced To", { base: b2, font: fonts.sans, size: SZ.table, color: COLOR.goldLabel, track: TRACK.label, cx: (v2 + v3) / 2 });
//     txtC(page, String(cfg.reducedTo), { base: b2, font: fonts.sans, size: SZ.table, color: COLOR.white, track: TRACK.body, cx: (v3 + BOX_X + BOX_W) / 2 });
//   } else {
//     txtC(page, String(cfg.total), { base: b2, font: fonts.sans, size: SZ.table, color: COLOR.white, track: TRACK.body, cx: (v1 + BOX_X + BOX_W) / 2 });
//   }

//   drawLabel(page, fonts, "What This Name Will Do For You", 452.9, { y: 465.1, w: 87.7 });
//   drawRailBox(page, fonts, cfg.paragraphs, { top: 485.9, minH: 304.8 });
// }

// /** Page 13 — Why This Is Critical (HR/OA/NR verdict text). */
// function drawWhyCriticalPage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput, c: NameCorrectionReportContent) {
//   drawFrame(page, assets);
//   drawHeader(page, fonts, assets, "Current", "Name Analysis");
//   txtC(page, "WHY THIS IS CRITICAL", { base: 163.5, font: fonts.sans, size: SZ.h1, color: COLOR.gold, track: TRACK.head });
//   drawRule(page, 204.7, 124.3);
//   const paragraphs = [...c.verdictBullets, ...(c.verdictNote && !c.verdictBullets.includes(c.verdictNote) ? [c.verdictNote] : [])];
//   drawRailBox(page, fonts, paragraphs, { top: 249.4, minH: 282.6 });
//   void data;
// }

// /** Page 14 — First Letter: identity table, core essence, communication style. */
// function drawLetterAnalysisPage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput, letter: LetterBlock) {
//   drawFrame(page, assets);
//   drawHeader(page, fonts, assets, "The Power Of Your", "First Letter");
//   drawLabel(page, fonts, "First Letter Analysis", 185.3, { y: 194.4, w: 124.3 });

//   const edges = [220.4, 278.9, 331.4, 383.1];
//   const vx = 296.0;
//   drawBox(page, BOX_X, edges[0], BOX_W, edges[3] - edges[0], 12);
//   drawTableLine(page, vx, edges[0], vx, edges[3]);
//   drawTableLine(page, BOX_X, edges[1], BOX_X + BOX_W, edges[1]);
//   drawTableLine(page, BOX_X, edges[2], BOX_X + BOX_W, edges[2]);
//   const rows: [string, string][] = [
//     ["Your Name Begins With:", letter.letter],
//     ["Numerical Value:", String(letter.numerologicalValue)],
//     ["Archetype:", letter.archetype],
//   ];
//   rows.forEach(([label, value], i) => {
//     const mid = (edges[i] + edges[i + 1]) / 2 + 5.5;
//     txtC(page, label, { base: mid, font: fonts.sans, size: SZ.table, color: COLOR.goldLabel, track: TRACK.label, cx: (BOX_X + vx) / 2 });
//     txtC(page, value, { base: mid, font: fonts.sans, size: SZ.table, color: COLOR.white, track: TRACK.body, cx: (vx + BOX_X + BOX_W) / 2 });
//   });

//   drawLabel(page, fonts, "Core Essence", 418.8, { y: 431.1, w: 87.7 });
//   drawBox(page, BOX_X, 447.7, BOX_W, 90.3, 10);
//   para(page, letter.coreEssence, { x: CENTER_X - 220, base: 484.5, maxW: 440, lh: 25.5, font: fonts.sans, size: SZ.table, color: COLOR.white, track: TRACK.body, align: "center" });

//   drawLabel(page, fonts, "Communication Style", 571.1, { y: 578.9, w: 95.2 });
//   const cw = 278.4;
//   drawBox(page, CENTER_X - cw / 2, 593.2, cw, 121.2, 8);
//   letter.communicationStyle.slice(0, 4).forEach((line, i) => {
//     txtC(page, line, { base: 622.8 + i * 25.5, font: fonts.sans, size: SZ.table, color: COLOR.white, track: TRACK.body });
//   });
//   drawFooter(page, fonts, assets, data.brand, { withUrl: true });
// }

// /** Page 15 — First Letter: challenges and strengths. */
// function drawLetterTraitsPage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput, letter: LetterBlock) {
//   drawFrame(page, assets);
//   drawHeader(page, fonts, assets, "The Power Of Your", "First Letter");
//   page.drawCircle({ x: CENTER_X, y: T(163.05), size: 34.05, color: COLOR.bg, borderColor: COLOR.gold, borderWidth: 0.9 });
//   txtC(page, letter.letter, { base: 178.7, font: fonts.heading, size: 44.2, color: COLOR.goldLabel });

//   const challenges = letter.challenges.slice(0, 6);
//   const strengths = letter.strengths.slice(0, 6);
//   const section = (top: number, title: string, items: string[], badge: PDFImage) => {
//     const h = 224.7;
//     drawBox(page, BOX_X, top, BOX_W, h, 14);
//     drawIcon(page, badge, CENTER_X, top, 56.8);
//     txtC(page, title, { base: top + 53.1, font: fonts.sans, size: SZ.label, color: COLOR.gold, track: TRACK.head });
//     items.forEach((item, i) => {
//       const base = top + 81.8 + i * 25.45;
//       page.drawCircle({ x: BOX_X + 54, y: T(base - 6.5), size: 2.05, color: COLOR.white });
//       txt(page, item, { x: BOX_X + 61.7, y: T(base), font: fonts.sans, size: SZ.table, color: COLOR.white, track: TRACK.body });
//     });
//   };
//   section(234.1, `Challenges of ${letter.letter}`, challenges, assets.badgeWarning);
//   section(507.8, `Strengths of ${letter.letter}`, strengths, assets.badgeFist);
//   drawFooter(page, fonts, assets, data.brand, { withUrl: true });
// }

// /** Page 16 — First Letter: famous names, spiritual significance, mantra, how to maximise. */
// function drawLetterSpiritPage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput, letter: LetterBlock) {
//   drawFrame(page, assets);
//   drawHeader(page, fonts, assets, "THE POWER OF YOUR", "FIRST LETTER", HEADER_B, COLOR.gold);
//   const L = letter.letter;
//   const rule43 = (y: number) => drawRule(page, y, 43.5);
//   const bulletList = (items: string[], firstBase: number) => {
//     const dots: number[] = [];
//     let base = firstBase;
//     items.forEach((it) => {
//       dots.push(base - 6.5);
//       const last = para(page, it, { x: 107.6, base, maxW: 455, lh: 20, font: fonts.sans, size: SZ.table, color: COLOR.white, track: TRACK.body });
//       base = last + 25.45;
//     });
//     railDots(page, dots, 86);
//     return base - 25.45;
//   };

//   drawLabel(page, fonts, `Famous “${L}” Names`, 174.3);
//   rule43(182.6);
//   bulletList(letter.famousNames.slice(0, 4), 213.0);

//   drawLabel(page, fonts, "Spiritual Significance:", 332.0);
//   rule43(340.3);
//   const spiritLast = para(page, letter.spiritualSignificance, { x: CENTER_X - 250, base: 370.8, maxW: 500, lh: 25.45, font: fonts.sans, size: SZ.table, color: COLOR.white, track: TRACK.body, align: "center" });

//   const mantraLabel = Math.max(441.0, spiritLast + 19.3);
//   drawLabel(page, fonts, `Mantra for “${L}” Names`, mantraLabel);
//   rule43(mantraLabel + 8.4);
//   const mantraLast = para(page, letter.mantra, { x: CENTER_X - 200, base: mantraLabel + 31.9, maxW: 400, lh: 25.45, font: fonts.sans, size: SZ.table, color: COLOR.white, track: TRACK.body, align: "center" });

//   const maxLabel = Math.max(549.4, mantraLast + 51.1);
//   drawLabel(page, fonts, `How to Maximise ${L} Energy`, maxLabel);
//   rule43(maxLabel + 8.3);
//   bulletList(letter.howToMaximize.slice(0, 6), maxLabel + 44.5);
//   drawFooter(page, fonts, assets, data.brand, { withUrl: true });
// }

// /** Pages 17–18 — New Name Recommendation, Option N. */
// function drawOptionPage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput, optionNo: 1 | 2, f: NameFacts | null, optionName: string) {
//   drawFrame(page, assets);
//   drawHeader(page, fonts, assets, "NEW NAME", "RECOMMENDATION");
//   txtC(page, `OPTION ${optionNo}: ${(optionName || "—").toUpperCase()}`, { base: 163.5, font: fonts.sans, size: SZ.h1, color: COLOR.gold, track: TRACK.head });
//   drawRule(page, 204.7, 124.3);
//   drawLabel(page, fonts, "Numerological Breakdown", 236.5);

//   const top = 251.9;
//   const edges = [top, 309.8, 362.9, 414.6];
//   const vx = BOX_X + 325.2;
//   drawBox(page, BOX_X, top, BOX_W, edges[3] - top, 10);
//   drawTableLine(page, vx, top, vx, edges[3]);
//   drawTableLine(page, BOX_X, edges[1], BOX_X + BOX_W, edges[1]);
//   drawTableLine(page, BOX_X, edges[2], BOX_X + BOX_W, edges[2]);
//   const rows: [string, string][] = [
//     ["First Name Number", f ? String(f.firstNumber) : "—"],
//     ["Full Name Number", f ? String(f.fullNumber) : "—"],
//     ["Full Name Compound Number", f ? String(f.compound) : "—"],
//   ];
//   rows.forEach(([label, value], i) => {
//     const base = (edges[i] + edges[i + 1]) / 2 + 5.5;
//     txt(page, label, { x: BOX_X + 28, y: T(base), font: fonts.sans, size: SZ.table, color: COLOR.goldLabel, track: TRACK.label });
//     txtC(page, value, { base, font: fonts.sans, size: SZ.table, color: COLOR.white, track: TRACK.body, cx: (vx + BOX_X + BOX_W) / 2 });
//   });

//   drawLabel(page, fonts, "What This Name Will Do For You", 452.9, { y: 465.1, w: 87.7 });
//   const paragraphs = f
//     ? [
//         `First Name (${f.firstNumber}): ${getFirstNameExplanation(f.firstNumber)}`,
//         `Full Name (${f.fullNumber}): ${getFullNameExplanation(f.fullNumber)}`,
//         `Compound Number (${f.compound}): ${getCompoundExplanation(f.compound)}`,
//       ]
//     : ["Option name not provided for this report."];
//   drawRailBox(page, fonts, paragraphs, { top: 485.9, minH: 304.8 });
//   void data;
// }

// /** Page 19 — comparison table + professional recommendation. */
// function drawRecommendationLevelPage(
//   page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput,
//   labels: [string, string], recCase: RecommendationCase,
// ) {
//   drawFrame(page, assets);
//   drawHeader(page, fonts, assets, "New Name", "Recommendation Level");
//   drawLabel(page, fonts, "Recommendation Comparison", 154.3, { y: 167.9, w: 110.7 });

//   const top = 182.7;
//   const edges = [top, 235.8, 290.4, 345.4];
//   const vx = 296.5;
//   drawBox(page, BOX_X, top, BOX_W, edges[3] - top, 10);
//   drawTableLine(page, vx, top, vx, edges[3]);
//   drawTableLine(page, BOX_X, edges[1], BOX_X + BOX_W, edges[1]);
//   drawTableLine(page, BOX_X, edges[2], BOX_X + BOX_W, edges[2]);
//   const table: [string, string][] = [["OPTIONS", "IMPACT LEVEL"], ["OPTION 1", labels[0]], ["OPTION 2", labels[1]]];
//   table.forEach(([a, b], i) => {
//     const base = (edges[i] + edges[i + 1]) / 2 + 5.5;
//     txtC(page, a, { base, font: fonts.sans, size: SZ.table, color: COLOR.goldLabel, track: TRACK.label, cx: 146.3 });
//     txtC(page, b, { base, font: fonts.sans, size: SZ.table, color: i === 0 ? COLOR.goldLabel : COLOR.white, track: i === 0 ? TRACK.label : TRACK.body, cx: 409.0 });
//   });

//   drawLabel(page, fonts, "MY PROFESSIONAL RECOMMENDATION", 385.0, { y: 397.3, w: 110.7 });
//   const boxTop = 414.5;
//   const boxH = 303.5;
//   const leftW = 188.9;
//   drawBox(page, BOX_X, boxTop, BOX_W, boxH, 12);
//   drawBox(page, BOX_X, boxTop, leftW, boxH, 12);
//   const lcx = BOX_X + leftW / 2;
//   drawIcon(page, assets.badgeStar, lcx, 517.0, 89.3);
//   txtC(page, "For You,", { base: 598.6, font: fonts.heading, size: SZ.small, color: COLOR.white, cx: lcx });
//   txtC(page, "I Suggest:", { base: 622.3, font: fonts.heading, size: SZ.small, color: COLOR.white, cx: lcx });
//   const pick = recCase === "option1Better" ? "OPTION 1" : recCase === "option2Better" ? "OPTION 2" : "EITHER OPTION";
//   const pickSize = Math.min(SZ.big, (leftW - 24) / (fonts.headingBold.widthOfTextAtSize(pick, 1)));
//   txtC(page, pick, { base: 656.4, font: fonts.headingBold, size: pickSize, color: COLOR.gold, cx: lcx });

//   const paragraphs = RECOMMENDATION_BLOCKS[recCase];
//   let base = 441.3;
//   paragraphs.forEach((p) => {
//     page.drawCircle({ x: 263.35, y: T(base - 6.5), size: 2.05, color: COLOR.white });
//     const last = para(page, p, { x: 271.1, base, maxW: 239.2, lh: 24, font: fonts.sans, size: SZ.table, color: COLOR.white, track: TRACK.body, align: "justify" });
//     base = last + 48;
//   });
//   drawFooter(page, fonts, assets, data.brand, { withUrl: true });
// }

// /** Page 20 — personal Loshu Grid. */
// function drawLoshuPage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput) {
//   drawFrame(page, assets);
//   drawHeader(page, fonts, assets, "YOUR PERSONAL", "LOSHU GRID", HEADER_B, COLOR.gold);
//   drawLabel(page, fonts, "Your Personal Loshu Grid", 208.3, { y: 216.6, w: 43.5 });

//   const dob = parseDob(data.dob);
//   const grid = buildStandardLoShuGrid(dob.day, dob.month, dob.year);
//   const cells = toGridCells(grid);
//   const top = 251.9;
//   const gridH = 408.6;
//   const cw = BOX_W / 3;
//   const ch = gridH / 3;
//   for (let i = 0; i <= 3; i++) {
//     page.drawLine({ start: { x: BOX_X + cw * i, y: T(top) }, end: { x: BOX_X + cw * i, y: T(top + gridH) }, thickness: 1.3, color: COLOR.gold });
//     page.drawLine({ start: { x: BOX_X, y: T(top + ch * i) }, end: { x: BOX_X + BOX_W, y: T(top + ch * i) }, thickness: 1.3, color: COLOR.gold });
//   }
//   cells.forEach((row, r) =>
//     row.forEach(({ digit, count }, col) => {
//       if (count <= 0) return;
//       const label = String(digit).repeat(count);
//       let fs = 38.4;
//       while (fs > 20 && tw(fonts.sansBold, label, fs) > cw - 24) fs -= 2;
//       txtC(page, label, { base: top + ch * r + ch / 2 + fs * 0.37, font: fonts.sansBold, size: fs, color: COLOR.goldLabel, cx: BOX_X + cw * col + cw / 2 });
//     }),
//   );
//   drawFooter(page, fonts, assets, data.brand, { withUrl: true });
// }

// const RAJYOG_COPY: Record<string, { subtitle: string; text: string }> = {
//   "Rajyog-1": {
//     subtitle: "(9-5-1 Line)",
//     text: "Your Loshu Grid contains the powerful Rajyog, formed by the diagonal presence of numbers 9, 5, and 1. This combination blends the leadership and authority of Mars (9), the adaptability and business acumen of Mercury (5), and the confidence and vitality of the Sun (1). Individuals with this Rajyog are naturally driven towards success, recognition, and financial prosperity. It indicates strong willpower, sharp decision-making ability, and the potential to rise to positions of influence through consistent effort and self-belief.",
//   },
//   "Rajyog-2": {
//     subtitle: "(4-5-6 Line)",
//     text: "Your Loshu Grid reveals the auspicious Golden Rajyog, formed by the alignment of numbers 4, 5, and 6. This combination brings together the discipline and structure of Rahu (4), the intelligence and communication skills of Mercury (5), and the charm and creativity of Venus (6). Individuals blessed with this Rajyog often experience steady financial growth, strong problem-solving ability, and success in fields requiring both analytical thinking and aesthetic sense. This alignment is considered highly favorable for wealth accumulation and material stability.",
//   },
//   "Rajyog-3": {
//     subtitle: "(2-5-8 Line)",
//     text: "Your Loshu Grid contains the beneficial Silver Rajyog, formed by the presence of numbers 2, 5, and 8. This combination merges the emotional intelligence and intuition of the Moon (2), the versatility and quick thinking of Mercury (5), and the discipline and perseverance of Saturn (8). Individuals with this Rajyog tend to be hardworking, patient, and capable of building long-term stability through consistent effort. It supports steady progress in career and finances, though success often comes through sustained discipline rather than sudden gains.",
//   },
// };

// /** Gold plate + navy pill (Rajyog status, Important Note). `top` = plate top. */
// function drawPill(page: PDFPage, top: number) {
//   drawRoundedRect(page, { x: 179.2, y: T(top) - 48.8, width: 236.9, height: 48.8, radius: 24.4, color: COLOR.boxStroke });
//   drawRoundedRect(page, { x: 180.8, y: T(top + 1.5) - 41.4, width: 229.2, height: 41.4, radius: 20.7, color: COLOR.bg });
// }

// /** Pages 21–23 — one Rajyog each. */
// function drawRajyogPage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput, result: RajyogResult) {
//   drawFrame(page, assets);
//   drawHeader(page, fonts, assets, "Your Rajyog", "ANALYSIS", HEADER_B, COLOR.gold);
//   const copy = RAJYOG_COPY[result.id];
//   txtC(page, result.id, { base: 201.5, font: fonts.cinzel, size: SZ.small, color: COLOR.gold });
//   txtC(page, copy.subtitle, { base: 232.0, font: fonts.cinzel, size: 22.4, color: COLOR.gold });

//   const bx = 70.7;
//   const bw = 453.9;
//   const top = 258.7;
//   const n = lineCount(copy.text, fonts.sans, SZ.body, 421.5, BODY.track);
//   const h = Math.max(205, 31.1 + (n - 1) * BODY.line + 17.6);
//   drawBox(page, bx, top, bw, h, 10);
//   para(page, copy.text, { x: 86.6, base: top + 31.1, maxW: 421.5, lh: BODY.line, font: fonts.sans, size: BODY.size, color: COLOR.white, track: BODY.track, align: "justify" });
//   drawIcon(page, assets.badgeCrown, bx, top, 45);
//   drawIcon(page, assets.badgeCrown, bx + bw, top, 45);

//   const pillTop = top + h + 32;
//   drawPill(page, pillTop);
//   txtC(page, `YOUR ${result.id.toUpperCase()} STATUS`, { base: pillTop + 29.5, font: fonts.cinzel, size: 14.7, color: COLOR.gold, cx: 297.0 });

//   const statuses: RajyogStatus[] = ["Naturally Present", "Completed Through Numerologically Aligned Name", "Not Present"];
//   const sTop = pillTop + 73.7;
//   drawBox(page, 70.9, sTop, 454.1, 116.3, 10);
//   statuses.forEach((s, i) => {
//     const base = sTop + 29.1 + i * 35.7;
//     const cy = base - 6.8;
//     const on = result.status === s;
//     drawRoundedRect(page, { x: 89.2, y: T(cy) - 5.65, width: 11.3, height: 11.3, radius: 2.5, color: on ? COLOR.white : COLOR.bg, borderColor: COLOR.white, borderWidth: 0.9 });
//     if (on) {
//       page.drawLine({ start: { x: 91.4, y: T(cy) - 0.2 }, end: { x: 93.9, y: T(cy) - 3 }, thickness: 1.3, color: COLOR.bg });
//       page.drawLine({ start: { x: 93.9, y: T(cy) - 3 }, end: { x: 98.4, y: T(cy) + 3 }, thickness: 1.3, color: COLOR.bg });
//     }
//     txt(page, s, { x: 114.9, y: T(base), font: fonts.sans, size: SZ.body, color: COLOR.white, track: TRACK.label });
//   });
//   drawFooter(page, fonts, assets, data.brand, { withUrl: true });
// }

// /** Page 24 — important note about Rajyogs. */
// function drawRajyogNotePage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput) {
//   drawFrame(page, assets);
//   drawHeader(page, fonts, assets, "Your Rajyog", "ANALYSIS", HEADER_B, COLOR.gold);
//   drawPill(page, 222.2);
//   txtC(page, "Important Note", { base: 251.3, font: fonts.cinzelBold, size: SZ.small, color: COLOR.white, cx: 297.0 });

//   const text =
//     "Numerologically Aligned Names can only create / strengthen a Rajyog when the missing number is one that is safe and beneficial to carry in a name — specifically 1, 5, 6, or 2 (when favorable to your profile). Numbers 4 (Rahu), 8 (Saturn), and 9 (Mars) are never used in name alignment, even when doing so would complete a Rajyog, as these energies are considered unstable or restrictive when carried in a name's vibration on a daily basis. Where a Rajyog remains incomplete for this reason, it reflects a deliberate numerological safeguard, not an oversight.";
//   const n = lineCount(text, fonts.sans, SZ.body, 380.4, BODY.track);
//   const h = 34 + (n - 1) * BODY.line + 20.5;
//   drawPlate(page, 74.7, 301.9, 445.8, h, 6, 6.2, 6.3);
//   para(page, text, { x: 107.2, base: 301.9 + 34, maxW: 380.4, lh: BODY.line, font: fonts.sans, size: BODY.size, color: COLOR.white, track: BODY.track, align: "justify" });
//   drawFooter(page, fonts, assets, data.brand, { withUrl: true });
// }

// /** Page 38 — success mantra (uses the recommended new name). */
// function drawMantraPage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput, newName: string) {
//   drawFrame(page, assets);
//   drawHeader(page, fonts, assets, "Success", "Mantra", { smallBase: 53.4, bigBase: 88.2, dividerY: 112.3 });
//   drawBox(page, BOX_X, 186.2, BOX_W, 152.4, 10);
//   const mantra = `“My name is my frequency. I align with my highest vibration. I welcome the transformation that is my birthright. I am ${newName || "[New Name]"}, and I claim my destiny.”`;
//   const lines = wrap(mantra, fonts.sans, 16, 392, 0);
//   lines.forEach((ln, i) => {
//     const base = 238.9 + i * 31.95;
//     const segs: { t: string; c: RGB }[] = [];
//     let body = ln;
//     if (i === 0) { segs.push({ t: body[0], c: COLOR.gold }); body = body.slice(1); }
//     if (i === lines.length - 1 && body.endsWith("”")) {
//       segs.push({ t: body.slice(0, -1), c: COLOR.white }, { t: "”", c: COLOR.gold });
//     } else segs.push({ t: body, c: COLOR.white });
//     txtSegC(page, segs, { base, font: fonts.sans, size: 16 });
//   });
//   wrap("Chant this daily during your name transition.", fonts.cinzel, 19.2, 360).forEach((ln, i) => {
//     txtC(page, ln, { base: 437.0 + i * 28.8, font: fonts.cinzel, size: 19.2, color: COLOR.gold });
//   });
//   drawIcon(page, assets.person, CENTER_X, 595.35, 119.1);
//   drawFooter(page, fonts, assets, data.brand, { withUrl: true });
// }

// /* ------------------------------------------------------------------ */
// /*  Main entry point                                                    */
// /* ------------------------------------------------------------------ */

// export async function generateNameCorrectionReportPdf(input: NameCorrectionReportInput): Promise<Uint8Array> {
//   const split = splitName(input.customerName);
//   const data: ResolvedInput = {
//     generatedDate: new Date().toISOString(),
//     firstName: split.first,
//     middleName: split.middle,
//     lastName: split.last,
//     isMiddleNameFatherHusband: false,
//     fatherName: "",
//     option1Name: "",
//     option2Name: "",
//     isTwoFavorableForProfile: false,
//     ...input,
//     brand: { ...DEFAULT_BRAND, ...input.brand },
//     contentOverride: input.contentOverride ?? {},
//   } as ResolvedInput;

//   const computed = computeNameCorrectionReportContent(data);
//   const content: NameCorrectionReportContent = { ...computed, ...input.contentOverride };
//   if (content.isFallback) {
//     console.warn(`Name Correction PDF: rule engine hit FALLBACK for "${data.customerName}" (report ${data.reportId}) — matched ${content.matchedRuleId} by default. Recommend manual review before sending to customer.`);
//   }

//   const dob = parseDob(data.dob);
//   const mulank = content.mulank;
//   const bhagyank = content.bhagyank;
//   const fullNameForNumerology = [data.firstName, data.isMiddleNameFatherHusband ? "" : data.middleName, data.lastName].filter(Boolean).join(" ");
//   const current = analyseName(fullNameForNumerology, mulank, bhagyank, dob);
//   const kua = computeKuaNumber(dob.year, data.gender);

//   // --- candidate (new) names -------------------------------------------------
//   const opt1 = data.option1Name.trim() ? analyseName(data.option1Name, mulank, bhagyank, dob) : null;
//   const opt2 = data.option2Name.trim() ? analyseName(data.option2Name, mulank, bhagyank, dob) : null;
//   if (!opt1 || !opt2) {
//     console.warn(`Name Correction PDF: report ${data.reportId} has no Option ${!opt1 ? "1" : ""}${!opt1 && !opt2 ? " / " : ""}${!opt2 ? "2" : ""} name — the New Name Recommendation pages will show placeholders.`);
//   }
//   const rank1 = opt1 ? favourabilityRank(opt1) : 99;
//   const rank2 = opt2 ? favourabilityRank(opt2) : 99;
//   const recCase: RecommendationCase =
//     opt1 && opt2
//       ? pickRecommendationCase(
//           { firstNameNumber: opt1.firstNumber, fullNameNumber: opt1.fullNumber, compoundNumber: opt1.compound, favorabilityRank: rank1 },
//           { firstNameNumber: opt2.firstNumber, fullNameNumber: opt2.fullNumber, compoundNumber: opt2.compound, favorabilityRank: rank2 },
//         )
//       : "equal";
//   const bestRank = Math.min(rank1, rank2);
//   const label1 = impactLabel(rank1, rank1 === bestRank);
//   const label2 = impactLabel(rank2, rank2 === bestRank);
//   const recommended = recCase === "option1Better" ? opt1 : recCase === "option2Better" ? opt2 : opt2 ?? opt1;

//   // --- loshu + rajyog (computed against the RECOMMENDED corrected name) -----
//   const grid = buildStandardLoShuGrid(dob.day, dob.month, dob.year);
//   const rajyogs = evaluateAllRajyogs({
//     naturalGridPresent: grid.present,
//     correctedFirstNameNumber: recommended?.firstNumber ?? current.firstNumber,
//     correctedFullNameNumber: recommended?.fullNumber ?? current.fullNumber,
//     isTwoFavorableForProfile: data.isTwoFavorableForProfile,
//   });

//   const letter = getLetterBlock((data.firstName || "A").charAt(0));
//   if (!letter) throw new Error(`Name Correction PDF: no First Letter content for "${data.firstName}".`);

//   // --- current-name paragraphs (pages 10–12) -------------------------------
//   const firstParas = current.firstOverAmp
//     ? LOSHU_OVERAMP_FIRST_NAME_BLOCK
//     : FIRST_NAME_BLOCKS[comboKey(current.firstVsMulank, current.firstVsBhagyank)];
//   const fullParas = current.fullOverAmp
//     ? LOSHU_OVERAMP_FULL_NAME_BLOCK
//     : FULL_NAME_BLOCKS[comboKey(current.fullVsMulank, current.fullVsBhagyank)];
//   const compoundParas = COMPOUND_BLOCKS[content.compoundTier];

//   // --- document --------------------------------------------------------------
//   const pdfDoc = await PDFDocument.create();
//   pdfDoc.setTitle(`Name Correction Report - ${data.customerName}`);
//   pdfDoc.setSubject("Chaldean Numerology Name Correction Report");
//   pdfDoc.setProducer(data.brand.companyName);
//   pdfDoc.setCreator(data.brand.companyName);
//   pdfDoc.registerFontkit(fontkit);

//   const iconKeys = ["logo", "hands", "lotus", "star", "person", "badgeWarning", "badgeFist", "badgeCrown", "badgeStar"] as const;
//   const [
//     backgroundBytes, quicksandRegularBytes, quicksandBoldBytes, cinzelDecBoldBytes,
//     cinzelDecRegBytes, cinzelRegBytes, cinzelBoldBytes, ...restBytes
//   ] = await Promise.all([
//     fetchAssetBytes(ASSET_PATHS.background),
//     fetchAssetBytes(ASSET_PATHS.fonts.quicksandRegular),
//     fetchAssetBytes(ASSET_PATHS.fonts.quicksandBold),
//     fetchAssetBytes(ASSET_PATHS.fonts.cinzelDecorativeBold),
//     fetchOptionalFont(ASSET_PATHS.fonts.cinzelDecorativeRegular),
//     fetchOptionalFont(ASSET_PATHS.fonts.cinzelRegular),
//     fetchOptionalFont(ASSET_PATHS.fonts.cinzelBold),
//     ...iconKeys.map((k) => fetchAssetBytes(ASSET_PATHS[k])),
//     ...STATIC_PAGE_NUMBERS.map((n) => fetchAssetBytes(staticPagePath(n))),
//   ]);
//   const iconBytes = restBytes.slice(0, iconKeys.length);
//   const staticBytes = restBytes.slice(iconKeys.length);

//   const statics = new Map<number, PDFImage>();
//   for (let i = 0; i < STATIC_PAGE_NUMBERS.length; i++) {
//     statics.set(STATIC_PAGE_NUMBERS[i], await pdfDoc.embedJpg(staticBytes[i]));
//   }
//   const icons = {} as Record<(typeof iconKeys)[number], PDFImage>;
//   for (let i = 0; i < iconKeys.length; i++) icons[iconKeys[i]] = await pdfDoc.embedPng(iconBytes[i]);
//   const assets: Assets = { background: await pdfDoc.embedPng(backgroundBytes), ...icons, statics };

//   const NO_LIGATURES = { features: { liga: false } } as const;
//   const headingBold = await pdfDoc.embedFont(cinzelDecBoldBytes, NO_LIGATURES);
//   const heading = cinzelDecRegBytes ? await pdfDoc.embedFont(cinzelDecRegBytes, NO_LIGATURES) : headingBold;
//   if (!cinzelDecRegBytes) console.warn("Name Correction PDF: CinzelDecorative-Regular.ttf missing — falling back to Bold headings.");
//   const fonts: Fonts = {
//     sans: await pdfDoc.embedFont(quicksandRegularBytes, NO_LIGATURES),
//     sansBold: await pdfDoc.embedFont(quicksandBoldBytes, NO_LIGATURES),
//     heading,
//     headingBold,
//     cinzel: cinzelRegBytes ? await pdfDoc.embedFont(cinzelRegBytes, NO_LIGATURES) : heading,
//     cinzelBold: cinzelBoldBytes ? await pdfDoc.embedFont(cinzelBoldBytes, NO_LIGATURES) : headingBold,
//   };

//   /** Page-number -> builder for the 18 pages that change per customer. */
//   const dynamicPages: Record<number, (page: PDFPage) => void> = {
//     4: (p) => drawWelcomePage(p, fonts, assets, data),
//     5: (p) => drawBlueprintPage(p, fonts, assets, data, content, kua),
//     10: (p) => drawCurrentNamePage(p, fonts, assets, data, { heading: "First Name Number", nameLabel: "First Name", nameValue: data.firstName, total: current.firstRawSum, reducedTo: content.firstNameNumber, paragraphs: [...firstParas] }),
//     11: (p) => drawCurrentNamePage(p, fonts, assets, data, { heading: "Full Name Number", nameLabel: "Full Name", nameValue: current.displayName, total: current.fullRawSum, reducedTo: content.fullNameNumber, paragraphs: [...fullParas] }),
//     12: (p) => drawCurrentNamePage(p, fonts, assets, data, { heading: "Full Name Compound Number", nameLabel: "Full Name", nameValue: current.displayName, total: content.fullNameCompound, paragraphs: [...compoundParas] }),
//     13: (p) => drawWhyCriticalPage(p, fonts, assets, data, content),
//     14: (p) => drawLetterAnalysisPage(p, fonts, assets, data, letter),
//     15: (p) => drawLetterTraitsPage(p, fonts, assets, data, letter),
//     16: (p) => drawLetterSpiritPage(p, fonts, assets, data, letter),
//     17: (p) => drawOptionPage(p, fonts, assets, data, 1, opt1, opt1?.displayName ?? data.option1Name),
//     18: (p) => drawOptionPage(p, fonts, assets, data, 2, opt2, opt2?.displayName ?? data.option2Name),
//     19: (p) => drawRecommendationLevelPage(p, fonts, assets, data, [label1, label2], recCase),
//     20: (p) => drawLoshuPage(p, fonts, assets, data),
//     21: (p) => drawRajyogPage(p, fonts, assets, data, rajyogs[0]),
//     22: (p) => drawRajyogPage(p, fonts, assets, data, rajyogs[1]),
//     23: (p) => drawRajyogPage(p, fonts, assets, data, rajyogs[2]),
//     24: (p) => drawRajyogNotePage(p, fonts, assets, data),
//     38: (p) => drawMantraPage(p, fonts, assets, data, recommended?.displayName ?? ""),
//   };

//   const TOTAL_PAGES = 50;
//   for (let n = 1; n <= TOTAL_PAGES; n++) {
//     const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
//     const build = dynamicPages[n];
//     if (build) {
//       build(page);
//     } else {
//       const img = assets.statics.get(n);
//       if (!img) throw new Error(`Name Correction PDF: page ${n} is neither dynamic nor a static asset.`);
//       page.drawImage(img, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });
//       if (CONNECT_PAGES.includes(n)) addLinkAnnotations(pdfDoc, page, CONNECT_PAGE_LINKS);
//     }
//   }

//   return pdfDoc.save();
// }

// export function nameCorrectionReportPdfToBlob(bytes: Uint8Array): Blob {
//   return new Blob([new Uint8Array(bytes).buffer], { type: "application/pdf" });
// }

// export function downloadNameCorrectionReportPdf(bytes: Uint8Array, filename: string) {
//   const blob = nameCorrectionReportPdfToBlob(bytes);
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement("a");
//   link.href = url;
//   link.download = filename;
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
//   URL.revokeObjectURL(url);
// }

/**
 * NameCorrectionReportGenerator.tsx
 * -----------------------------------------------------------------------
 * Ankshaastra-branded Name Correction Report PDF generator (49 pages, A4 — page 25 "Expected Timeline" omitted).
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

import { PDFDocument, PDFPage, PDFFont, PDFImage, PDFName, PDFString, rgb, RGB, setCharacterSpacing } from "pdf-lib";
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

/** Form dropdown "Preference". Decides the pick shown on page 19 (Option 1 / Option 2 / BOTH); "NA" = use the computed pick. */
export type NameCorrectionPreference = "na" | "option1" | "option2" | "both";
export const NAME_CORRECTION_PREFERENCE_OPTIONS: { value: NameCorrectionPreference; label: string }[] = [
  { value: "na", label: "NA" },
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "both", label: "Both" },
];

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
  /** Form dropdown "Preference" (NA / Option 1 / Option 2 / Both). Drives the page 19 recommendation card. */
  preference?: NameCorrectionPreference;
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

/**
 * Palette — sampled directly from the client's reference PDF
 * (Prashanth_Name_Correction_Report_Ankshaastra.pdf, Canva export).
 */
const COLOR = {
  bg: rgb(0.0275, 0.051, 0.102), // box / pill fill  #070D1A
  white: rgb(1, 1, 1), // body text
  gold: rgb(1, 0.839, 0.6), // section labels, hairlines, page border, URL  #FFD699
  goldLabel: rgb(0.89, 0.69, 0.44), // table labels, big page titles  #E3B070
  goldDeep: rgb(0.87, 0.68, 0.43), // rail dots, name on welcome page  #DEAD6E
  boxStroke: rgb(0.91, 0.749, 0.573), // box outlines, table lines, pill shadow plates  #E8BF92
};

/** Letter-spacing (in em) used by the reference. Quicksand is tracked; Cinzel is not. */
const TRACK = { body: 0.05, label: 0.1, head: 0.08 };

/** Type scale (pt) used by the reference. */
const SZ = { small: 16, big: 25.6, h1: 17.6, label: 14.4, table: 12.8, body: 11.2, url: 14.1 };

interface Fonts {
  sans: PDFFont; // Quicksand Regular
  sansBold: PDFFont; // Quicksand Bold
  heading: PDFFont; // Cinzel Decorative REGULAR (falls back to Bold if the file is missing)
  headingBold: PDFFont; // Cinzel Decorative Bold
  cinzel: PDFFont; // Cinzel Regular (falls back to heading)
  cinzelBold: PDFFont; // Cinzel Bold (falls back to headingBold)
}

const ASSET_BASE = "/name-correction-assets";
const FONT_BASE = "/name-check-assets/fonts";
const ASSET_PATHS = {
  background: `${ASSET_BASE}/background-plain.png`, // plain navy gradient, NO border (border is drawn as a thin vector)
  logo: `${ASSET_BASE}/logo-ankshaastra-white-hd.png`, // white/cream logo, as in the reference
  hands: `${ASSET_BASE}/icon-hands-ref.png`,
  lotus: `${ASSET_BASE}/icon-lotus-ref.png`,
  star: `${ASSET_BASE}/divider-star.png`, // thin sparkle in the middle of every divider
  person: `${ASSET_BASE}/icon-person.png`,
  badgeWarning: `${ASSET_BASE}/badge-warning.png`,
  badgeFist: `${ASSET_BASE}/badge-fist.png`,
  badgeCrown: `${ASSET_BASE}/badge-crown.png`,
  badgeStar: `${ASSET_BASE}/badge-star.png`,
  fonts: {
    quicksandRegular: `${FONT_BASE}/Quicksand-Regular.ttf`,
    quicksandBold: `${FONT_BASE}/Quicksand-Bold.ttf`,
    cinzelDecorativeBold: `${FONT_BASE}/CinzelDecorative-Bold.ttf`,
    // Optional — add these three files (Google Fonts, OFL) for a pixel-exact match.
    cinzelDecorativeRegular: `${FONT_BASE}/CinzelDecorative-Regular.ttf`,
    cinzelRegular: `${FONT_BASE}/Cinzel-Regular.ttf`,
    cinzelBold: `${FONT_BASE}/Cinzel-Bold.ttf`,
  },
};

/**
 * The 32 pages of the report that are identical for every customer. They are
 * exported once from the client's Canva sample as full-page JPGs
 * (/public/name-correction-assets/static-pNN.jpg, NN = page number in the
 * 50-page report) and simply dropped in as full-bleed images.
 */
const STATIC_PAGE_NUMBERS = [
  1, 2, 3, 6, 7, 8, 9, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37,
  39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
];
/** Pages of the original 50-page layout that are intentionally left out of the PDF (25 = "Expected Timeline & Result"). The report is 49 pages. */
const OMITTED_PAGES = new Set([25]);
const staticPagePath = (n: number) => `${ASSET_BASE}/static-p${String(n).padStart(2, "0")}.jpg`;

/* ------------------------------------------------------------------ */
/*  Clickable social / review links on the static "Connect With Me"      */
/*  pages (27 and 44). Rects are measured on the 924x1308 page exports  */
/*  and converted to PDF points at draw time.                           */
/* ------------------------------------------------------------------ */

const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/ankshaastra?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
  linkedin: "https://www.linkedin.com/company/ankshaastra/?viewAsMember=true",
  facebook: "https://www.facebook.com/p/Ankshaastra-61561549995939/",
  youtube: "https://www.youtube.com/@Ankshaastra",
  review: "https://share.google/RzRonHbVF8Q1lUHc4",
};
const LINK_REF_W = 924;
const LINK_REF_H = 1308;
/** [x0, y0, x1, y1] in the 924x1308 reference image (origin top-left) — icon + "Click Me" together. */
const CONNECT_PAGE_LINKS: { url: string; box: [number, number, number, number] }[] = [
  { url: SOCIAL_LINKS.instagram, box: [165, 325, 412, 402] },
  { url: SOCIAL_LINKS.linkedin, box: [482, 325, 728, 402] },
  { url: SOCIAL_LINKS.facebook, box: [165, 439, 412, 516] },
  { url: SOCIAL_LINKS.youtube, box: [488, 439, 728, 516] },
  // "Click Below To" text + the "LEAVE A REVIEW" pill
  { url: SOCIAL_LINKS.review, box: [196, 884, 386, 914] },
  { url: SOCIAL_LINKS.review, box: [181, 934, 402, 998] },
];
const CONNECT_PAGES = [27, 44];

function addLinkAnnotations(doc: PDFDocument, page: PDFPage, links: typeof CONNECT_PAGE_LINKS) {
  const sx = PAGE_WIDTH / LINK_REF_W;
  const sy = PAGE_HEIGHT / LINK_REF_H;
  const annots = links.map(({ url, box }) => {
    const [x0, y0, x1, y1] = box;
    return doc.context.register(
      doc.context.obj({
        Type: "Annot",
        Subtype: "Link",
        Rect: [x0 * sx, PAGE_HEIGHT - y1 * sy, x1 * sx, PAGE_HEIGHT - y0 * sy],
        Border: [0, 0, 0],
        A: { Type: "Action", S: "URI", URI: PDFString.of(url) },
      }),
    );
  });
  page.node.set(PDFName.of("Annots"), doc.context.obj(annots));
}

async function fetchAssetBytes(path: string): Promise<Uint8Array> {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Name Correction PDF: failed to fetch design asset "${path}" (${res.status}). Check it was uploaded to /public${path}.`);
  }
  return new Uint8Array(await res.arrayBuffer());
}

/** Optional font: returns null (instead of throwing) when the file is absent or the SPA served index.html for it. */
async function fetchOptionalFont(path: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch(path);
    if (!res.ok) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    const magic = String.fromCharCode(...bytes.slice(0, 4));
    const isFont = (bytes[0] === 0 && bytes[1] === 1 && bytes[2] === 0 && bytes[3] === 0) || magic === "true" || magic === "OTTO";
    return isFont ? bytes : null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Text helpers (tracked text — the reference uses 0.05em / 0.08em /   */
/*  0.1em letter-spacing on Quicksand)                                  */
/* ------------------------------------------------------------------ */

/** Width of `text` including tracking (no trailing space after the last glyph). */
function tw(font: PDFFont, text: string, size: number, trackEm = 0) {
  return font.widthOfTextAtSize(text, size) + Math.max(0, text.length - 1) * trackEm * size;
}

interface TxtOpts { x: number; y: number; font: PDFFont; size: number; color: RGB; track?: number }
/** Draw tracked text. `y` is a pdf-lib baseline (use T(baselineFromTop)). */
function txt(page: PDFPage, text: string, o: TxtOpts) {
  const t = (o.track ?? 0) * o.size;
  if (t) page.pushOperators(setCharacterSpacing(t));
  page.drawText(text, { x: o.x, y: o.y, size: o.size, font: o.font, color: o.color });
  if (t) page.pushOperators(setCharacterSpacing(0));
}

/** Centered tracked text. `base` = baseline measured from the TOP of the page. */
function txtC(page: PDFPage, text: string, o: { base: number; font: PDFFont; size: number; color: RGB; track?: number; cx?: number }) {
  const cx = o.cx ?? CENTER_X;
  txt(page, text, { x: cx - tw(o.font, text, o.size, o.track) / 2, y: T(o.base), font: o.font, size: o.size, color: o.color, track: o.track });
}

/** Centered run of differently-coloured segments on one baseline. */
function txtSegC(page: PDFPage, segs: { t: string; c: RGB }[], o: { base: number; font: PDFFont; size: number; track?: number; cx?: number }) {
  const cx = o.cx ?? CENTER_X;
  const tr = (o.track ?? 0) * o.size;
  const widths = segs.map((s) => o.font.widthOfTextAtSize(s.t, o.size) + s.t.length * tr);
  const total = widths.reduce((a, b) => a + b, 0) - tr;
  let x = cx - total / 2;
  segs.forEach((s, i) => {
    txt(page, s.t, { x, y: T(o.base), font: o.font, size: o.size, color: s.c, track: o.track });
    x += widths[i];
  });
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number, trackEm = 0): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const trial = current ? `${current} ${word}` : word;
    if (tw(font, trial, size, trackEm) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = trial;
    }
  }
  if (current) lines.push(current);
  return lines;
}

interface ParaOpts {
  x: number; base: number; maxW: number; lh: number;
  font: PDFFont; size: number; color: RGB; track?: number;
  align?: "left" | "center" | "justify";
}
/** Wrapped paragraph. `base` = FIRST baseline from the page top. Returns the LAST baseline (from top). */
function para(page: PDFPage, text: string, o: ParaOpts): number {
  const lines = wrap(text, o.font, o.size, o.maxW, o.track);
  lines.forEach((line, i) => {
    const base = o.base + i * o.lh;
    const isLast = i === lines.length - 1;
    if (o.align === "justify" && !isLast && line.includes(" ")) {
      const words = line.split(" ");
      const wordsWidth = words.reduce((s, w) => s + tw(o.font, w, o.size, o.track), 0);
      const gap = (o.maxW - wordsWidth) / (words.length - 1);
      let x = o.x;
      words.forEach((w) => {
        txt(page, w, { x, y: T(base), font: o.font, size: o.size, color: o.color, track: o.track });
        x += tw(o.font, w, o.size, o.track) + gap;
      });
    } else if (o.align === "center") {
      txtC(page, line, { base, font: o.font, size: o.size, color: o.color, track: o.track, cx: o.x + o.maxW / 2 });
    } else {
      txt(page, line, { x: o.x, y: T(base), font: o.font, size: o.size, color: o.color, track: o.track });
    }
  });
  return o.base + (lines.length - 1) * o.lh;
}

function lineCount(text: string, font: PDFFont, size: number, maxW: number, track = 0) {
  return wrap(text, font, size, maxW, track).length;
}

/* ------------------------------------------------------------------ */
/*  Shape helpers                                                       */
/* ------------------------------------------------------------------ */

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

const BOX_STROKE = 0.9;
/** Navy box with the reference's soft-gold outline. `top` is measured from the page top. */
function drawBox(page: PDFPage, x: number, top: number, w: number, h: number, r = 10) {
  drawRoundedRect(page, { x, y: T(top) - h, width: w, height: h, radius: r, color: COLOR.bg, borderColor: COLOR.boxStroke, borderWidth: BOX_STROKE });
}

/** Navy "pill / card" with the offset gold plate behind it (Rajyog status pill, Important Note, etc). */
function drawPlate(page: PDFPage, x: number, top: number, w: number, h: number, r: number, dx = 6.1, dy = 5.8) {
  drawRoundedRect(page, { x: x + dx, y: T(top) - h - dy, width: w, height: h, radius: r, color: COLOR.boxStroke });
  drawRoundedRect(page, { x, y: T(top) - h, width: w, height: h, radius: r, color: COLOR.bg, borderColor: COLOR.boxStroke, borderWidth: BOX_STROKE });
}

/** Hairline (0.3pt) horizontal rule centred on CENTER_X — the reference's divider / underline weight. */
function drawRule(page: PDFPage, y: number, w: number, cx = CENTER_X) {
  page.drawRectangle({ x: cx - w / 2, y: T(y) - 0.15, width: w, height: 0.3, color: COLOR.gold });
}

/** Table rule: 0.96pt line in the reference's box-stroke colour. */
function drawTableLine(page: PDFPage, x1: number, y1Top: number, x2: number, y2Top: number, thickness = 0.9) {
  page.drawLine({ start: { x: x1, y: T(y1Top) }, end: { x: x2, y: T(y2Top) }, thickness, color: COLOR.boxStroke });
}

/** Image centred on (cx, cyFromTop) at the given width. */
function drawIcon(page: PDFPage, img: PDFImage, cx: number, cyFromTop: number, width: number) {
  const h = (img.height / img.width) * width;
  page.drawImage(img, { x: cx - width / 2, y: T(cyFromTop) - h / 2, width, height: h });
}

/** Page background (plain navy gradient) + the thin reference border (0.65pt, #FFD699, r≈11.8). */
function drawFrame(page: PDFPage, assets: Assets) {
  page.drawImage(assets.background, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });
  drawRoundedRect(page, { x: 24.9, y: T(816.5), width: 545.5, height: 796.1, radius: 11.8, borderColor: COLOR.gold, borderWidth: 0.65 });
}

/** Hairline divider with the sparkle in the middle. `y` = distance from page top. */
function drawDivider(page: PDFPage, assets: Assets, y: number, cx = CENTER_X) {
  const yy = T(y);
  page.drawRectangle({ x: cx - 130.55, y: yy - 0.15, width: 110.1, height: 0.3, color: COLOR.gold });
  page.drawRectangle({ x: cx + 20.45, y: yy - 0.15, width: 110.1, height: 0.3, color: COLOR.gold });
  drawIcon(page, assets.star, cx, y, 31.5);
}

interface HeaderPos { smallBase: number; bigBase: number; dividerY: number }
/** Title block geometry used by the reference (two layouts: "A" for pages 10-19, "B" for pages 16 & 20-24). */
const HEADER_A: HeaderPos = { smallBase: 58.6, bigBase: 94.4, dividerY: 119.2 };
const HEADER_B: HeaderPos = { smallBase: 74.9, bigBase: 114.0, dividerY: 142.0 };

/** "Small line / Big line" title (Cinzel Decorative Regular 16 / 25.6) with the sparkle divider. */
function drawHeader(page: PDFPage, fonts: Fonts, assets: Assets, small: string, big: string, pos: HeaderPos = HEADER_A, bigColor: RGB = COLOR.goldLabel) {
  txtC(page, small, { base: pos.smallBase, font: fonts.heading, size: SZ.small, color: COLOR.white });
  txtC(page, big, { base: pos.bigBase, font: fonts.heading, size: SZ.big, color: bigColor });
  drawDivider(page, assets, pos.dividerY);
}

/** Section label (Quicksand 14.4, gold, 0.08em) with an optional hairline under it. */
function drawLabel(page: PDFPage, fonts: Fonts, text: string, base: number, rule?: { y: number; w: number }) {
  txtC(page, text, { base, font: fonts.sans, size: SZ.label, color: COLOR.gold, track: TRACK.head });
  if (rule) drawRule(page, rule.y, rule.w);
}

/** Page footer: lotus ornament (+ tracked URL on the pages that carry it). */
function drawFooter(page: PDFPage, fonts: Fonts, assets: Assets, brand: BrandConfig, opts: { withUrl: boolean }) {
  if (!opts.withUrl) {
    drawIcon(page, assets.lotus, CENTER_X, 787.9, 75.8);
    return;
  }
  drawIcon(page, assets.lotus, CENTER_X, 756.3, 75.9);
  const url = brand.website.toUpperCase();
  // fit the tracked URL to the reference width (309.1pt)
  const track = (309.1 - fonts.sans.widthOfTextAtSize(url, SZ.url)) / Math.max(1, url.length - 1);
  txt(page, url, { x: CENTER_X - 309.1 / 2, y: T(798.2), font: fonts.sans, size: SZ.url, color: COLOR.gold, track: track / SZ.url });
}

const BODY = { size: SZ.body, line: 22.3, track: TRACK.body };

/**
 * "What this name will do for you" style box: navy rounded box, paragraphs justified,
 * thin rail with a gold dot at the start of each paragraph. `top` from page top.
 */
function drawRailBox(page: PDFPage, fonts: Fonts, paragraphs: string[], box: { top: number; minH: number }) {
  const x = 59.5;
  const w = 476.3;
  const textX = x + 37.7;
  const textW = w - 75.4;
  const firstBase = box.top + 35.7;
  const counts = paragraphs.map((p) => lineCount(p, fonts.sans, BODY.size, textW, BODY.track));
  let base = firstBase;
  const bases: number[] = [];
  counts.forEach((n) => {
    bases.push(base);
    base += (n - 1) * BODY.line + 2 * BODY.line; // blank line between paragraphs
  });
  const lastBase = bases.length ? bases[bases.length - 1] + (counts[counts.length - 1] - 1) * BODY.line : firstBase;
  const h = Math.max(box.minH, lastBase + 23.5 - box.top);
  drawBox(page, x, box.top, w, h, 10);
  const dotX = x + 24.3;
  paragraphs.forEach((p, i) => {
    para(page, p, { x: textX, base: bases[i], maxW: textW, lh: BODY.line, font: fonts.sans, size: BODY.size, color: COLOR.white, track: BODY.track, align: "justify" });
  });
  railDots(page, bases.map((b) => b - 5.8), dotX);
}

/** Vertical gold rail with a dot at every y (distances from the page top). */
function railDots(page: PDFPage, ys: number[], x: number) {
  if (!ys.length) return;
  if (ys.length > 1) {
    page.drawLine({ start: { x, y: T(ys[0]) }, end: { x, y: T(ys[ys.length - 1]) }, thickness: 1, color: COLOR.goldDeep });
  }
  ys.forEach((y) => page.drawCircle({ x, y: T(y), size: 3.55, color: COLOR.goldDeep }));
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
  star: PDFImage;
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
/*  The 18 dynamic pages — geometry measured from the reference PDF     */
/*  (all positions in pt; "base" = text baseline measured from top)     */
/* ------------------------------------------------------------------ */

const BOX_X = 59.5; // every full-width box: x 59.5 → 535.8 (centred on the page)
const BOX_W = 476.3;

/** Page 4 — personalised welcome note. */
function drawWelcomePage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput) {
  drawFrame(page, assets);
  drawIcon(page, assets.logo, CENTER_X, 79.6, 335.5);
  drawDivider(page, assets, 261.3);
  txtC(page, "“Namaskar", { base: 205.2, font: fonts.heading, size: SZ.big, color: COLOR.white });
  txtC(page, `${data.firstName.toUpperCase()} ji,”`, { base: 235.9, font: fonts.heading, size: SZ.big, color: COLOR.goldDeep });

  const size = 12.8;
  const lh = 19.2;
  const maxW = 432;
  const track = TRACK.body;
  const name = data.brand.numerologistName;
  const lead = "“This personalized name correction report has been prepared after careful analysis of your birth date and current name by celebrity ";
  const gold = `Astro-Numerologist ${name}.`;
  const tail = " The new name suggested is rooted in the approach of Chaldean Numerology and the Loshu Grid. The purpose of this report is to harmonize the cosmic energies influencing your life.";
  // word list with colour, wrapped as plain text
  const goldWords = gold.split(/\s+/).length;
  const words = (lead + gold + tail).split(/\s+/).filter(Boolean);
  const goldStart = lead.trim().split(/\s+/).length;
  const lines: string[][] = [];
  let cur: number[] = [];
  const widthOf = (idx: number[]) => tw(fonts.sans, idx.map((i) => words[i]).join(" "), size, track);
  words.forEach((_, i) => {
    if (cur.length && widthOf([...cur, i]) > maxW) { lines.push(cur.map(String)); cur = []; }
    cur.push(i);
  });
  if (cur.length) lines.push(cur.map(String));
  let base = 321.8;
  lines.forEach((l) => {
    const segs: { t: string; c: RGB }[] = [];
    l.forEach((s, k) => {
      const i = Number(s);
      const c = i >= goldStart && i < goldStart + goldWords ? COLOR.gold : COLOR.white;
      const t = words[i] + (k < l.length - 1 ? " " : "");
      if (segs.length && segs[segs.length - 1].c === c) segs[segs.length - 1].t += t; else segs.push({ t, c });
    });
    txtSegC(page, segs, { base, font: fonts.sans, size, track });
    base += lh;
  });
  base -= lh; // last baseline of paragraph 1
  const p2 = "Please approach these practices with faith, consistency, and pure intention. Divine grace flows to those who practice with devotion.";
  const p2Last = para(page, p2, { x: CENTER_X - maxW / 2, base: base + 2 * lh, maxW, lh, font: fonts.sans, size, color: COLOR.white, track, align: "center" });
  const div2 = p2Last + 34.0;
  drawDivider(page, assets, div2);
  para(page, "May this guide illuminate your path towards prosperity, peace, and spiritual growth.”", {
    x: CENTER_X - maxW / 2, base: div2 + 42.8, maxW, lh, font: fonts.sans, size, color: COLOR.white, track, align: "center",
  });
  drawIcon(page, assets.hands, CENTER_X, 736.4, 100.8);
}

/** Page 5 — personal profile table. */
function drawBlueprintPage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput, c: NameCorrectionReportContent, kua: number | null) {
  drawFrame(page, assets);
  drawHeader(page, fonts, assets, "Understanding Your", "Numerological Blueprint", { smallBase: 73.9, bigBase: 108.9, dividerY: 130.2 });
  drawLabel(page, fonts, "Personal Information", 178.6, { y: 184.3, w: 110.6 });

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
  const top = 199.7;
  const totalH = 562.6;
  const rowH = totalH / rows.length;
  const splitX = 300.9;
  drawBox(page, BOX_X, top, BOX_W, totalH, 14);
  drawTableLine(page, splitX, top, splitX, top + totalH);
  rows.forEach(([label, value], i) => {
    const rowTop = top + i * rowH;
    if (i > 0) drawTableLine(page, BOX_X, rowTop, BOX_X + BOX_W, rowTop, 0.5);
    const mid = rowTop + rowH / 2;
    txtC(page, label, { base: mid + 4.6, font: fonts.sans, size: SZ.table, color: COLOR.goldLabel, track: TRACK.label, cx: (BOX_X + splitX) / 2 });
    const lines = wrap(value, fonts.sans, SZ.table, 220, TRACK.body);
    lines.forEach((ln, li) => {
      txtC(page, ln, { base: mid + 4.6 - ((lines.length - 1) * 15) / 2 + li * 15, font: fonts.sans, size: SZ.table, color: COLOR.white, track: TRACK.body, cx: (splitX + BOX_X + BOX_W) / 2 });
    });
  });
  drawFooter(page, fonts, assets, data.brand, { withUrl: false });
}

/** Pages 10–12 — Current Name Analysis (first name / full name / compound). */
function drawCurrentNamePage(
  page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput,
  cfg: { heading: string; nameLabel: string; nameValue: string; total: number; reducedTo?: number; paragraphs: string[] },
) {
  drawFrame(page, assets);
  drawHeader(page, fonts, assets, "Current", "Name Analysis");
  txtC(page, cfg.heading.toUpperCase(), { base: 163.5, font: fonts.sans, size: SZ.h1, color: COLOR.gold, track: TRACK.head });
  drawRule(page, 204.7, 124.3);
  drawLabel(page, fonts, "Numerological Breakdown", 236.5);

  const top = 248.2;
  const h = 111;
  const mid = 305.2;
  const v1 = BOX_X + 137.7;
  drawBox(page, BOX_X, top, BOX_W, h, 10);
  drawTableLine(page, BOX_X, mid, BOX_X + BOX_W, mid);
  drawTableLine(page, v1, top, v1, top + h);
  const b1 = (top + mid) / 2 + 5.5;
  const b2 = (mid + top + h) / 2 + 5.5;
  txtC(page, cfg.nameLabel, { base: b1, font: fonts.sans, size: SZ.table, color: COLOR.goldLabel, track: TRACK.label, cx: (BOX_X + v1) / 2 });
  txtC(page, cfg.nameValue, { base: b1, font: fonts.sans, size: SZ.table, color: COLOR.white, track: TRACK.body, cx: (v1 + BOX_X + BOX_W) / 2 });
  txtC(page, "Total", { base: b2, font: fonts.sans, size: SZ.table, color: COLOR.goldLabel, track: TRACK.label, cx: (BOX_X + v1) / 2 });
  if (cfg.reducedTo !== undefined) {
    const v2 = BOX_X + 202.2;
    const v3 = BOX_X + 405.7;
    drawTableLine(page, v2, mid, v2, top + h);
    drawTableLine(page, v3, mid, v3, top + h);
    txtC(page, String(cfg.total), { base: b2, font: fonts.sans, size: SZ.table, color: COLOR.white, track: TRACK.body, cx: (v1 + v2) / 2 });
    txtC(page, "Reduced To", { base: b2, font: fonts.sans, size: SZ.table, color: COLOR.goldLabel, track: TRACK.label, cx: (v2 + v3) / 2 });
    txtC(page, String(cfg.reducedTo), { base: b2, font: fonts.sans, size: SZ.table, color: COLOR.white, track: TRACK.body, cx: (v3 + BOX_X + BOX_W) / 2 });
  } else {
    txtC(page, String(cfg.total), { base: b2, font: fonts.sans, size: SZ.table, color: COLOR.white, track: TRACK.body, cx: (v1 + BOX_X + BOX_W) / 2 });
  }

  drawLabel(page, fonts, "What This Name Will Do For You", 452.9, { y: 465.1, w: 87.7 });
  drawRailBox(page, fonts, cfg.paragraphs, { top: 485.9, minH: 304.8 });
}

/** Page 13 — Why This Is Critical (HR/OA/NR verdict text). */
function drawWhyCriticalPage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput, c: NameCorrectionReportContent) {
  drawFrame(page, assets);
  drawHeader(page, fonts, assets, "Current", "Name Analysis");
  txtC(page, "WHY THIS IS CRITICAL", { base: 163.5, font: fonts.sans, size: SZ.h1, color: COLOR.gold, track: TRACK.head });
  drawRule(page, 204.7, 124.3);
  const paragraphs = [...c.verdictBullets, ...(c.verdictNote && !c.verdictBullets.includes(c.verdictNote) ? [c.verdictNote] : [])];
  drawRailBox(page, fonts, paragraphs, { top: 249.4, minH: 282.6 });
  void data;
}

/** Page 14 — First Letter: identity table, core essence, communication style. */
function drawLetterAnalysisPage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput, letter: LetterBlock) {
  drawFrame(page, assets);
  drawHeader(page, fonts, assets, "The Power Of Your", "First Letter");
  drawLabel(page, fonts, "First Letter Analysis", 185.3, { y: 194.4, w: 124.3 });

  const edges = [220.4, 278.9, 331.4, 383.1];
  const vx = 296.0;
  drawBox(page, BOX_X, edges[0], BOX_W, edges[3] - edges[0], 12);
  drawTableLine(page, vx, edges[0], vx, edges[3]);
  drawTableLine(page, BOX_X, edges[1], BOX_X + BOX_W, edges[1]);
  drawTableLine(page, BOX_X, edges[2], BOX_X + BOX_W, edges[2]);
  const rows: [string, string][] = [
    ["Your Name Begins With:", letter.letter],
    ["Numerical Value:", String(letter.numerologicalValue)],
    ["Archetype:", letter.archetype],
  ];
  rows.forEach(([label, value], i) => {
    const mid = (edges[i] + edges[i + 1]) / 2 + 5.5;
    txtC(page, label, { base: mid, font: fonts.sans, size: SZ.table, color: COLOR.goldLabel, track: TRACK.label, cx: (BOX_X + vx) / 2 });
    txtC(page, value, { base: mid, font: fonts.sans, size: SZ.table, color: COLOR.white, track: TRACK.body, cx: (vx + BOX_X + BOX_W) / 2 });
  });

  drawLabel(page, fonts, "Core Essence", 418.8, { y: 431.1, w: 87.7 });
  drawBox(page, BOX_X, 447.7, BOX_W, 90.3, 10);
  para(page, letter.coreEssence, { x: CENTER_X - 220, base: 484.5, maxW: 440, lh: 25.5, font: fonts.sans, size: SZ.table, color: COLOR.white, track: TRACK.body, align: "center" });

  drawLabel(page, fonts, "Communication Style", 571.1, { y: 578.9, w: 95.2 });
  const cw = 278.4;
  drawBox(page, CENTER_X - cw / 2, 593.2, cw, 121.2, 8);
  letter.communicationStyle.slice(0, 4).forEach((line, i) => {
    txtC(page, line, { base: 622.8 + i * 25.5, font: fonts.sans, size: SZ.table, color: COLOR.white, track: TRACK.body });
  });
  drawFooter(page, fonts, assets, data.brand, { withUrl: true });
}

/** Page 15 — First Letter: challenges and strengths. */
function drawLetterTraitsPage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput, letter: LetterBlock) {
  drawFrame(page, assets);
  drawHeader(page, fonts, assets, "The Power Of Your", "First Letter");
  page.drawCircle({ x: CENTER_X, y: T(163.05), size: 34.05, color: COLOR.bg, borderColor: COLOR.gold, borderWidth: 0.9 });
  txtC(page, letter.letter, { base: 178.7, font: fonts.heading, size: 44.2, color: COLOR.goldLabel });

  const challenges = letter.challenges.slice(0, 6);
  const strengths = letter.strengths.slice(0, 6);
  const section = (top: number, title: string, items: string[], badge: PDFImage) => {
    const h = 224.7;
    drawBox(page, BOX_X, top, BOX_W, h, 14);
    drawIcon(page, badge, CENTER_X, top, 56.8);
    txtC(page, title, { base: top + 53.1, font: fonts.sans, size: SZ.label, color: COLOR.gold, track: TRACK.head });
    items.forEach((item, i) => {
      const base = top + 81.8 + i * 25.45;
      page.drawCircle({ x: BOX_X + 54, y: T(base - 6.5), size: 2.05, color: COLOR.white });
      txt(page, item, { x: BOX_X + 61.7, y: T(base), font: fonts.sans, size: SZ.table, color: COLOR.white, track: TRACK.body });
    });
  };
  section(234.1, `Challenges of ${letter.letter}`, challenges, assets.badgeWarning);
  section(507.8, `Strengths of ${letter.letter}`, strengths, assets.badgeFist);
  drawFooter(page, fonts, assets, data.brand, { withUrl: true });
}

/** Page 16 — First Letter: famous names, spiritual significance, mantra, how to maximise. */
function drawLetterSpiritPage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput, letter: LetterBlock) {
  drawFrame(page, assets);
  drawHeader(page, fonts, assets, "THE POWER OF YOUR", "FIRST LETTER", HEADER_B, COLOR.gold);
  const L = letter.letter;
  const rule43 = (y: number) => drawRule(page, y, 43.5);
  const bulletList = (items: string[], firstBase: number) => {
    const dots: number[] = [];
    let base = firstBase;
    items.forEach((it) => {
      dots.push(base - 6.5);
      const last = para(page, it, { x: 107.6, base, maxW: 455, lh: 20, font: fonts.sans, size: SZ.table, color: COLOR.white, track: TRACK.body });
      base = last + 25.45;
    });
    railDots(page, dots, 86);
    return base - 25.45;
  };

  drawLabel(page, fonts, `Famous “${L}” Names`, 174.3);
  rule43(182.6);
  bulletList(letter.famousNames.slice(0, 4), 213.0);

  drawLabel(page, fonts, "Spiritual Significance:", 332.0);
  rule43(340.3);
  const spiritLast = para(page, letter.spiritualSignificance, { x: CENTER_X - 250, base: 370.8, maxW: 500, lh: 25.45, font: fonts.sans, size: SZ.table, color: COLOR.white, track: TRACK.body, align: "center" });

  const mantraLabel = Math.max(441.0, spiritLast + 19.3);
  drawLabel(page, fonts, `Mantra for “${L}” Names`, mantraLabel);
  rule43(mantraLabel + 8.4);
  const mantraLast = para(page, letter.mantra, { x: CENTER_X - 200, base: mantraLabel + 31.9, maxW: 400, lh: 25.45, font: fonts.sans, size: SZ.table, color: COLOR.white, track: TRACK.body, align: "center" });

  const maxLabel = Math.max(549.4, mantraLast + 51.1);
  drawLabel(page, fonts, `How to Maximise ${L} Energy`, maxLabel);
  rule43(maxLabel + 8.3);
  bulletList(letter.howToMaximize.slice(0, 6), maxLabel + 44.5);
  drawFooter(page, fonts, assets, data.brand, { withUrl: true });
}

/** Pages 17–18 — New Name Recommendation, Option N. */
function drawOptionPage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput, optionNo: 1 | 2, f: NameFacts | null, optionName: string) {
  drawFrame(page, assets);
  drawHeader(page, fonts, assets, "NEW NAME", "RECOMMENDATION");
  txtC(page, `OPTION ${optionNo}: ${(optionName || "—").toUpperCase()}`, { base: 163.5, font: fonts.sans, size: SZ.h1, color: COLOR.gold, track: TRACK.head });
  drawRule(page, 204.7, 124.3);
  drawLabel(page, fonts, "Numerological Breakdown", 236.5);

  const top = 251.9;
  const edges = [top, 309.8, 362.9, 414.6];
  const vx = BOX_X + 325.2;
  drawBox(page, BOX_X, top, BOX_W, edges[3] - top, 10);
  drawTableLine(page, vx, top, vx, edges[3]);
  drawTableLine(page, BOX_X, edges[1], BOX_X + BOX_W, edges[1]);
  drawTableLine(page, BOX_X, edges[2], BOX_X + BOX_W, edges[2]);
  const rows: [string, string][] = [
    ["First Name Number", f ? String(f.firstNumber) : "—"],
    ["Full Name Number", f ? String(f.fullNumber) : "—"],
    ["Full Name Compound Number", f ? String(f.compound) : "—"],
  ];
  rows.forEach(([label, value], i) => {
    const base = (edges[i] + edges[i + 1]) / 2 + 5.5;
    txt(page, label, { x: BOX_X + 28, y: T(base), font: fonts.sans, size: SZ.table, color: COLOR.goldLabel, track: TRACK.label });
    txtC(page, value, { base, font: fonts.sans, size: SZ.table, color: COLOR.white, track: TRACK.body, cx: (vx + BOX_X + BOX_W) / 2 });
  });

  drawLabel(page, fonts, "What This Name Will Do For You", 452.9, { y: 465.1, w: 87.7 });
  const paragraphs = f
    ? [
        `First Name (${f.firstNumber}): ${getFirstNameExplanation(f.firstNumber)}`,
        `Full Name (${f.fullNumber}): ${getFullNameExplanation(f.fullNumber)}`,
        `Compound Number (${f.compound}): ${getCompoundExplanation(f.compound)}`,
      ]
    : ["Option name not provided for this report."];
  drawRailBox(page, fonts, paragraphs, { top: 485.9, minH: 304.8 });
  void data;
}

/** Page 19 — comparison table + professional recommendation. */
function drawRecommendationLevelPage(
  page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput,
  labels: [string, string], recCase: RecommendationCase,
) {
  drawFrame(page, assets);
  drawHeader(page, fonts, assets, "New Name", "Recommendation Level");
  drawLabel(page, fonts, "Recommendation Comparison", 154.3, { y: 167.9, w: 110.7 });

  const top = 182.7;
  const edges = [top, 235.8, 290.4, 345.4];
  const vx = 296.5;
  drawBox(page, BOX_X, top, BOX_W, edges[3] - top, 10);
  drawTableLine(page, vx, top, vx, edges[3]);
  drawTableLine(page, BOX_X, edges[1], BOX_X + BOX_W, edges[1]);
  drawTableLine(page, BOX_X, edges[2], BOX_X + BOX_W, edges[2]);
  const table: [string, string][] = [["OPTIONS", "IMPACT LEVEL"], ["OPTION 1", labels[0]], ["OPTION 2", labels[1]]];
  table.forEach(([a, b], i) => {
    const base = (edges[i] + edges[i + 1]) / 2 + 5.5;
    txtC(page, a, { base, font: fonts.sans, size: SZ.table, color: COLOR.goldLabel, track: TRACK.label, cx: 146.3 });
    txtC(page, b, { base, font: fonts.sans, size: SZ.table, color: i === 0 ? COLOR.goldLabel : COLOR.white, track: i === 0 ? TRACK.label : TRACK.body, cx: 409.0 });
  });

  drawLabel(page, fonts, "MY PROFESSIONAL RECOMMENDATION", 385.0, { y: 397.3, w: 110.7 });
  const boxTop = 414.5;
  const boxH = 303.5;
  const leftW = 188.9;
  drawBox(page, BOX_X, boxTop, BOX_W, boxH, 12);
  drawBox(page, BOX_X, boxTop, leftW, boxH, 12);
  const lcx = BOX_X + leftW / 2;
  drawIcon(page, assets.badgeStar, lcx, 517.0, 89.3);
  txtC(page, "For You,", { base: 598.6, font: fonts.heading, size: SZ.small, color: COLOR.white, cx: lcx });
  txtC(page, "I Suggest:", { base: 622.3, font: fonts.heading, size: SZ.small, color: COLOR.white, cx: lcx });
  const pick = recCase === "option1Better" ? "OPTION 1" : recCase === "option2Better" ? "OPTION 2" : "BOTH";
  const pickSize = Math.min(SZ.big, (leftW - 24) / (fonts.headingBold.widthOfTextAtSize(pick, 1)));
  txtC(page, pick, { base: 656.4, font: fonts.headingBold, size: pickSize, color: COLOR.gold, cx: lcx });

  const paragraphs = RECOMMENDATION_BLOCKS[recCase];
  let base = 441.3;
  paragraphs.forEach((p) => {
    page.drawCircle({ x: 263.35, y: T(base - 6.5), size: 2.05, color: COLOR.white });
    const last = para(page, p, { x: 271.1, base, maxW: 239.2, lh: 24, font: fonts.sans, size: SZ.table, color: COLOR.white, track: TRACK.body, align: "justify" });
    base = last + 48;
  });
  drawFooter(page, fonts, assets, data.brand, { withUrl: true });
}

/** Page 20 — personal Loshu Grid. */
function drawLoshuPage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput) {
  drawFrame(page, assets);
  drawHeader(page, fonts, assets, "YOUR PERSONAL", "LOSHU GRID", HEADER_B, COLOR.gold);
  drawLabel(page, fonts, "Your Personal Loshu Grid", 208.3, { y: 216.6, w: 43.5 });

  const dob = parseDob(data.dob);
  const grid = buildStandardLoShuGrid(dob.day, dob.month, dob.year);
  const cells = toGridCells(grid);
  const top = 251.9;
  const gridH = 408.6;
  const cw = BOX_W / 3;
  const ch = gridH / 3;
  for (let i = 0; i <= 3; i++) {
    page.drawLine({ start: { x: BOX_X + cw * i, y: T(top) }, end: { x: BOX_X + cw * i, y: T(top + gridH) }, thickness: 1.3, color: COLOR.gold });
    page.drawLine({ start: { x: BOX_X, y: T(top + ch * i) }, end: { x: BOX_X + BOX_W, y: T(top + ch * i) }, thickness: 1.3, color: COLOR.gold });
  }
  cells.forEach((row, r) =>
    row.forEach(({ digit, count }, col) => {
      if (count <= 0) return;
      const label = String(digit).repeat(count);
      let fs = 38.4;
      while (fs > 20 && tw(fonts.sansBold, label, fs) > cw - 24) fs -= 2;
      txtC(page, label, { base: top + ch * r + ch / 2 + fs * 0.37, font: fonts.sansBold, size: fs, color: COLOR.goldLabel, cx: BOX_X + cw * col + cw / 2 });
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

/** Gold plate + navy pill (Rajyog status, Important Note). `top` = plate top. */
function drawPill(page: PDFPage, top: number) {
  drawRoundedRect(page, { x: 179.2, y: T(top) - 48.8, width: 236.9, height: 48.8, radius: 24.4, color: COLOR.boxStroke });
  drawRoundedRect(page, { x: 180.8, y: T(top + 1.5) - 41.4, width: 229.2, height: 41.4, radius: 20.7, color: COLOR.bg });
}

/** Pages 21–23 — one Rajyog each. */
function drawRajyogPage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput, result: RajyogResult) {
  drawFrame(page, assets);
  drawHeader(page, fonts, assets, "Your Rajyog", "ANALYSIS", HEADER_B, COLOR.gold);
  const copy = RAJYOG_COPY[result.id];
  txtC(page, result.id, { base: 201.5, font: fonts.cinzel, size: SZ.small, color: COLOR.gold });
  txtC(page, copy.subtitle, { base: 232.0, font: fonts.cinzel, size: 22.4, color: COLOR.gold });

  const bx = 70.7;
  const bw = 453.9;
  const top = 258.7;
  const n = lineCount(copy.text, fonts.sans, SZ.body, 421.5, BODY.track);
  const h = Math.max(205, 31.1 + (n - 1) * BODY.line + 17.6);
  drawBox(page, bx, top, bw, h, 10);
  para(page, copy.text, { x: 86.6, base: top + 31.1, maxW: 421.5, lh: BODY.line, font: fonts.sans, size: BODY.size, color: COLOR.white, track: BODY.track, align: "justify" });
  drawIcon(page, assets.badgeCrown, bx, top, 45);
  drawIcon(page, assets.badgeCrown, bx + bw, top, 45);

  const pillTop = top + h + 32;
  drawPill(page, pillTop);
  txtC(page, `YOUR ${result.id.toUpperCase()} STATUS`, { base: pillTop + 29.5, font: fonts.cinzel, size: 14.7, color: COLOR.gold, cx: 297.0 });

  const statuses: RajyogStatus[] = ["Naturally Present", "Completed Through Numerologically Aligned Name", "Not Present"];
  const sTop = pillTop + 73.7;
  drawBox(page, 70.9, sTop, 454.1, 116.3, 10);
  statuses.forEach((s, i) => {
    const base = sTop + 29.1 + i * 35.7;
    const cy = base - 6.8;
    const on = result.status === s;
    drawRoundedRect(page, { x: 89.2, y: T(cy) - 5.65, width: 11.3, height: 11.3, radius: 2.5, color: on ? COLOR.white : COLOR.bg, borderColor: COLOR.white, borderWidth: 0.9 });
    if (on) {
      page.drawLine({ start: { x: 91.4, y: T(cy) - 0.2 }, end: { x: 93.9, y: T(cy) - 3 }, thickness: 1.3, color: COLOR.bg });
      page.drawLine({ start: { x: 93.9, y: T(cy) - 3 }, end: { x: 98.4, y: T(cy) + 3 }, thickness: 1.3, color: COLOR.bg });
    }
    txt(page, s, { x: 114.9, y: T(base), font: fonts.sans, size: SZ.body, color: COLOR.white, track: TRACK.label });
  });
  drawFooter(page, fonts, assets, data.brand, { withUrl: true });
}

/** Page 24 — important note about Rajyogs. */
function drawRajyogNotePage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput) {
  drawFrame(page, assets);
  drawHeader(page, fonts, assets, "Your Rajyog", "ANALYSIS", HEADER_B, COLOR.gold);
  drawPill(page, 222.2);
  txtC(page, "Important Note", { base: 251.3, font: fonts.cinzelBold, size: SZ.small, color: COLOR.white, cx: 297.0 });

  const text =
    "Numerologically Aligned Names can only create / strengthen a Rajyog when the missing number is one that is safe and beneficial to carry in a name — specifically 1, 5, 6, or 2 (when favorable to your profile). Numbers 4 (Rahu), 8 (Saturn), and 9 (Mars) are never used in name alignment, even when doing so would complete a Rajyog, as these energies are considered unstable or restrictive when carried in a name's vibration on a daily basis. Where a Rajyog remains incomplete for this reason, it reflects a deliberate numerological safeguard, not an oversight.";
  const n = lineCount(text, fonts.sans, SZ.body, 380.4, BODY.track);
  const h = 34 + (n - 1) * BODY.line + 20.5;
  drawPlate(page, 74.7, 301.9, 445.8, h, 6, 6.2, 6.3);
  para(page, text, { x: 107.2, base: 301.9 + 34, maxW: 380.4, lh: BODY.line, font: fonts.sans, size: BODY.size, color: COLOR.white, track: BODY.track, align: "justify" });
  drawFooter(page, fonts, assets, data.brand, { withUrl: true });
}

/** Page 38 — success mantra (uses the recommended new name). */
function drawMantraPage(page: PDFPage, fonts: Fonts, assets: Assets, data: ResolvedInput, newName: string) {
  drawFrame(page, assets);
  drawHeader(page, fonts, assets, "Success", "Mantra", { smallBase: 53.4, bigBase: 88.2, dividerY: 112.3 });
  drawBox(page, BOX_X, 186.2, BOX_W, 152.4, 10);
  const mantra = `“My name is my frequency. I align with my highest vibration. I welcome the transformation that is my birthright. I am ${newName || "[New Name]"}, and I claim my destiny.”`;
  const lines = wrap(mantra, fonts.sans, 16, 392, 0);
  lines.forEach((ln, i) => {
    const base = 238.9 + i * 31.95;
    const segs: { t: string; c: RGB }[] = [];
    let body = ln;
    if (i === 0) { segs.push({ t: body[0], c: COLOR.gold }); body = body.slice(1); }
    if (i === lines.length - 1 && body.endsWith("”")) {
      segs.push({ t: body.slice(0, -1), c: COLOR.white }, { t: "”", c: COLOR.gold });
    } else segs.push({ t: body, c: COLOR.white });
    txtSegC(page, segs, { base, font: fonts.sans, size: 16 });
  });
  wrap("Chant this daily during your name transition.", fonts.cinzel, 19.2, 360).forEach((ln, i) => {
    txtC(page, ln, { base: 437.0 + i * 28.8, font: fonts.cinzel, size: 19.2, color: COLOR.gold });
  });
  drawIcon(page, assets.person, CENTER_X, 595.35, 119.1);
  drawFooter(page, fonts, assets, data.brand, { withUrl: true });
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
  const computedCase: RecommendationCase =
    opt1 && opt2
      ? pickRecommendationCase(
          { firstNameNumber: opt1.firstNumber, fullNameNumber: opt1.fullNumber, compoundNumber: opt1.compound, favorabilityRank: rank1 },
          { firstNameNumber: opt2.firstNumber, fullNameNumber: opt2.fullNumber, compoundNumber: opt2.compound, favorabilityRank: rank2 },
        )
      : "equal";
  // The form's Preference (Option 1 / Option 2 / Both) decides what page 19 recommends. "NA" = fall back to the computed pick.
  //   Option 1 -> "OPTION 1" (Highest / High) · Option 2 -> "OPTION 2" (High / Highest) · Both -> "BOTH" (Highest / Highest)
  const recCase: RecommendationCase =
    data.preference === "option1" ? "option1Better"
    : data.preference === "option2" ? "option2Better"
    : data.preference === "both" ? "equal"
    : computedCase;
  const bestRank = Math.min(rank1, rank2);
  const [label1, label2]: [string, string] =
    data.preference === "option1" ? ["Highest", "High"]
    : data.preference === "option2" ? ["High", "Highest"]
    : data.preference === "both" ? ["Highest", "Highest"]
    : [impactLabel(rank1, rank1 === bestRank), impactLabel(rank2, rank2 === bestRank)];
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

  const iconKeys = ["logo", "hands", "lotus", "star", "person", "badgeWarning", "badgeFist", "badgeCrown", "badgeStar"] as const;
  const [
    backgroundBytes, quicksandRegularBytes, quicksandBoldBytes, cinzelDecBoldBytes,
    cinzelDecRegBytes, cinzelRegBytes, cinzelBoldBytes, ...restBytes
  ] = await Promise.all([
    fetchAssetBytes(ASSET_PATHS.background),
    fetchAssetBytes(ASSET_PATHS.fonts.quicksandRegular),
    fetchAssetBytes(ASSET_PATHS.fonts.quicksandBold),
    fetchAssetBytes(ASSET_PATHS.fonts.cinzelDecorativeBold),
    fetchOptionalFont(ASSET_PATHS.fonts.cinzelDecorativeRegular),
    fetchOptionalFont(ASSET_PATHS.fonts.cinzelRegular),
    fetchOptionalFont(ASSET_PATHS.fonts.cinzelBold),
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
  const headingBold = await pdfDoc.embedFont(cinzelDecBoldBytes, NO_LIGATURES);
  const heading = cinzelDecRegBytes ? await pdfDoc.embedFont(cinzelDecRegBytes, NO_LIGATURES) : headingBold;
  if (!cinzelDecRegBytes) console.warn("Name Correction PDF: CinzelDecorative-Regular.ttf missing — falling back to Bold headings.");
  const fonts: Fonts = {
    sans: await pdfDoc.embedFont(quicksandRegularBytes, NO_LIGATURES),
    sansBold: await pdfDoc.embedFont(quicksandBoldBytes, NO_LIGATURES),
    heading,
    headingBold,
    cinzel: cinzelRegBytes ? await pdfDoc.embedFont(cinzelRegBytes, NO_LIGATURES) : heading,
    cinzelBold: cinzelBoldBytes ? await pdfDoc.embedFont(cinzelBoldBytes, NO_LIGATURES) : headingBold,
  };

  /** Page-number -> builder for the 18 pages that change per customer. */
  const dynamicPages: Record<number, (page: PDFPage) => void> = {
    4: (p) => drawWelcomePage(p, fonts, assets, data),
    5: (p) => drawBlueprintPage(p, fonts, assets, data, content, kua),
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
    if (OMITTED_PAGES.has(n)) continue;
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    const build = dynamicPages[n];
    if (build) {
      build(page);
    } else {
      const img = assets.statics.get(n);
      if (!img) throw new Error(`Name Correction PDF: page ${n} is neither dynamic nor a static asset.`);
      page.drawImage(img, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });
      if (CONNECT_PAGES.includes(n)) addLinkAnnotations(pdfDoc, page, CONNECT_PAGE_LINKS);
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




