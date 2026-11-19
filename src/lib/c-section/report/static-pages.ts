/**
 * The Canva-designed pages that are identical in every report (see public/c-section-static).
 * They are embedded (scaled to A4: Canva's 930 x 1315.5 pt has the same aspect ratio) instead of being redrawn.
 */
import { PDFArray, PDFDict, PDFDocument, PDFName, PDFNumber, PDFPage, PDFString, type PDFEmbeddedPage } from "pdf-lib";
import { linkAnnotation } from "./draw.ts";
import { PAGE_H, PAGE_W } from "./theme.ts";

/** File inside public/c-section-static (served as /c-section-static/...). */
export const STATIC_FILE = "static/ALL-static-pages-combined.pdf";

/** Position of each page inside that combined PDF (0-based; same order as manifest.json). */
export const ST = {
  quote: 0, disclaimer: 1, why1: 2, why2: 3, why3: 4, support: 5, offers: 6, postBirth: 7, testimonial: 8,
  terms1: 9, terms2: 10, terms3: 11, terms4: 12, agreement: 13, expectations: 14, yourResp: 15, myResp: 16,
  reminders: 17, mantra: 18, finalWord: 19, promise: 20, services: 21, connect: 22, finalBlessing: 23, backCover: 24,
  /** Canva original pages 1, 5 and 11: the cover, the personal-details frame (values are overlaid) and the medical window page. */
  cover: 25, personal: 26, medical: 27, welcome: 28,
  /** Canva FAQ (3 pages; Q9 answer corrected), Closing Blessings, wishes and welcome-baby pages, with names and he/him wording made neutral. */
  faq1: 29, faq2: 30, faq3: 31, closing: 32, wishBaby: 33, wishParents: 34, welcomeBaby: 35,
} as const;
export type StaticKey = keyof typeof ST;
/** Number of pages the combined PDF must have (one more than the highest index in ST). Also used to bust the browser cache. */
export const STATIC_PAGE_COUNT = Math.max(...Object.values(ST)) + 1;

interface Link { x: number; top: number; w: number; h: number; url: string }
export interface StaticPages { embedded: PDFEmbeddedPage[]; links: Link[][] }

function readLinks(p: PDFPage, k: number): Link[] {
  const out: Link[] = [];
  const seen = new Set<string>();
  const annots = p.node.lookupMaybe(PDFName.of("Annots"), PDFArray);
  if (!annots) return out;
  const H = p.getHeight();
  for (let i = 0; i < annots.size(); i++) {
    const a = annots.lookupMaybe(i, PDFDict);
    const act = a?.lookupMaybe(PDFName.of("A"), PDFDict);
    const uri = act?.lookupMaybe(PDFName.of("URI"), PDFString);
    const rect = a?.lookupMaybe(PDFName.of("Rect"), PDFArray);
    if (!uri || !rect) continue;
    const [x1, y1, x2, y2] = [0, 1, 2, 3].map((n) => (rect.lookup(n, PDFNumber) as PDFNumber).asNumber());
    const l = { x: x1 * k, top: (H - y2) * k, w: (x2 - x1) * k, h: (y2 - y1) * k, url: uri.decodeText() };
    const key = `${l.url}|${l.x.toFixed(1)}|${l.top.toFixed(1)}`;
    if (!seen.has(key)) { seen.add(key); out.push(l); }
  }
  return out;
}

export async function loadStaticPages(doc: PDFDocument, bytes: Uint8Array): Promise<StaticPages> {
  const src = await PDFDocument.load(bytes);
  const pages = src.getPages();
  if (pages.length < STATIC_PAGE_COUNT)
    throw new Error(`The file public/c-section-static/ALL-static-pages-combined.pdf is out of date: it has ${pages.length} pages but ${STATIC_PAGE_COUNT} are needed. Upload the latest copy and hard-refresh (Ctrl+F5).`);
  const k = PAGE_W / pages[0].getWidth();
  return { embedded: await doc.embedPages(pages), links: pages.map((p) => readLinks(p, k)) };
}

/** Appends one static page (links kept) and returns it. */
export function addStaticPage(doc: PDFDocument, S: StaticPages, key: StaticKey): PDFPage {
  const i = ST[key];
  const page = doc.addPage([PAGE_W, PAGE_H]);
  page.drawPage(S.embedded[i], { x: 0, y: 0, width: PAGE_W, height: PAGE_H });
  for (const l of S.links[i]) linkAnnotation(doc, page, l.x, l.top, l.w, l.h, l.url);
  return page;
}

/**
 * Embedding copies the shared background image once per page. This points every identical image stream at one copy
 * (keeps each report around 3-4 MB instead of 15 MB+).
 */
export async function dedupeImages(doc: PDFDocument) {
  await doc.flush(); // embedded pages are written into the context lazily
  const { context } = doc;
  const canon = new Map<string, import("pdf-lib").PDFRef>();
  const remap = new Map<import("pdf-lib").PDFRef, import("pdf-lib").PDFRef>();
  for (const [ref, obj] of context.enumerateIndirectObjects()) {
    const dict = (obj as { dict?: PDFDict }).dict;
    const contents = (obj as { contents?: Uint8Array }).contents;
    if (!dict || !contents || dict.get(PDFName.of("Subtype")) !== PDFName.of("Image")) continue;
    let h = 2166136261 >>> 0;
    for (let i = 0; i < contents.length; i++) h = Math.imul(h ^ contents[i], 16777619) >>> 0;
    const key = `${contents.length}:${h}:${dict.get(PDFName.of("Width"))}x${dict.get(PDFName.of("Height"))}:${dict.get(PDFName.of("SMask")) ? "m" : ""}`;
    const first = canon.get(key);
    if (first && first !== ref) remap.set(ref, first); else canon.set(key, ref);
  }
  if (!remap.size) return;
  const fix = (v: unknown, owner: PDFDict | PDFArray, k: PDFName | number) => {
    if (v && typeof v === "object" && remap.has(v as never)) {
      if (owner instanceof PDFDict) owner.set(k as PDFName, remap.get(v as never)!); else owner.set(k as number, remap.get(v as never)!);
    }
  };
  const walk = (o: unknown) => {
    if (o instanceof PDFDict) {
      for (const [k, v] of o.entries()) { fix(v, o, k); if (v instanceof PDFDict || v instanceof PDFArray) walk(v); }
    } else if (o instanceof PDFArray) {
      for (let i = 0; i < o.size(); i++) { const v = o.get(i); fix(v, o, i); if (v instanceof PDFDict || v instanceof PDFArray) walk(v); }
    }
  };
  for (const [, obj] of context.enumerateIndirectObjects()) {
    walk(obj);
    const d = (obj as { dict?: PDFDict }).dict;
    if (d) walk(d);
  }
  // SMask pointers inside dropped duplicates no longer matter; remove the duplicates themselves
  for (const ref of remap.keys()) context.delete(ref);
}
