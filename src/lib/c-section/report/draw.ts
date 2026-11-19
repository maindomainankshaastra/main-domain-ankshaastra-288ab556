import { PDFArray, PDFDocument, PDFName, PDFString, type PDFFont, type PDFImage, type PDFPage, type RGB } from "pdf-lib";
import { C, PAGE_H, PAGE_W } from "./theme.ts";

export interface Fonts { heading: PDFFont; body: PDFFont; bold: PDFFont; serif: PDFFont }
export interface Assets { bg: PDFImage; illustration: PDFImage; logo: PDFImage; lotus: PDFImage }

/** Word-wrap `text` (explicit "\n" respected) to `maxW` points. */
export function wrapLines(font: PDFFont, size: number, text: string, maxW: number): string[] {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    const words = para.split(/\s+/).filter(Boolean);
    if (!words.length) { out.push(""); continue; }
    let line = words[0];
    for (let i = 1; i < words.length; i++) {
      const t = `${line} ${words[i]}`;
      if (font.widthOfTextAtSize(t, size) <= maxW) line = t; else { out.push(line); line = words[i]; }
    }
    out.push(line);
  }
  return out;
}

/** Largest size <= `size` (not below `min`) at which `s` fits in `maxW`. */
export function fitSize(font: PDFFont, size: number, s: string, maxW: number, min = 6.5): number {
  let z = size;
  while (z > min && font.widthOfTextAtSize(s, z) > maxW) z -= 0.25;
  return z;
}

const baseline = (top: number, size: number) => PAGE_H - top - size * 0.78;

export interface TextOpt { font: PDFFont; size: number; color?: RGB }

export function drawText(page: PDFPage, s: string, x: number, top: number, o: TextOpt) {
  if (!s) return;
  page.drawText(s, { x, y: baseline(top, o.size), size: o.size, font: o.font, color: o.color ?? C.ink });
}
export function drawTextC(page: PDFPage, s: string, top: number, o: TextOpt & { cx?: number }) {
  drawText(page, s, (o.cx ?? PAGE_W / 2) - o.font.widthOfTextAtSize(s, o.size) / 2, top, o);
}
export function drawTextR(page: PDFPage, s: string, right: number, top: number, o: TextOpt) {
  drawText(page, s, right - o.font.widthOfTextAtSize(s, o.size), top, o);
}

export interface ParaOpt extends TextOpt { lh?: number; align?: "left" | "center" }

/** Draws a wrapped paragraph; returns the top of the line after the last one. */
export function drawPara(page: PDFPage, s: string, x: number, top: number, w: number, o: ParaOpt): number {
  const lh = o.lh ?? o.size * 1.42;
  let y = top;
  for (const line of wrapLines(o.font, o.size, s, w)) {
    if (o.align === "center") drawTextC(page, line, y, { ...o, cx: x + w / 2 }); else drawText(page, line, x, y, o);
    y += lh;
  }
  return y;
}
export function paraHeight(font: PDFFont, size: number, s: string, w: number, lh?: number): number {
  return wrapLines(font, size, s, w).length * (lh ?? size * 1.42);
}

export function roundRect(page: PDFPage, x: number, top: number, w: number, h: number, r: number, o: { fill?: RGB; stroke?: RGB; sw?: number }) {
  const rr = Math.min(r, w / 2, h / 2);
  const path = `M ${rr} 0 H ${w - rr} A ${rr} ${rr} 0 0 1 ${w} ${rr} V ${h - rr} A ${rr} ${rr} 0 0 1 ${w - rr} ${h} H ${rr} A ${rr} ${rr} 0 0 1 0 ${h - rr} V ${rr} A ${rr} ${rr} 0 0 1 ${rr} 0 Z`;
  page.drawSvgPath(path, { x, y: PAGE_H - top, color: o.fill, borderColor: o.stroke, borderWidth: o.stroke ? (o.sw ?? 1) : 0 });
}

export function rect(page: PDFPage, x: number, top: number, w: number, h: number, fill: RGB) {
  page.drawRectangle({ x, y: PAGE_H - top - h, width: w, height: h, color: fill });
}

export function hLine(page: PDFPage, x1: number, x2: number, top: number, color: RGB = C.line, thickness = 0.8) {
  page.drawLine({ start: { x: x1, y: PAGE_H - top }, end: { x: x2, y: PAGE_H - top }, thickness, color });
}

/** Thin rule with a small diamond in the middle (the report's divider). */
export function ornament(page: PDFPage, top: number, cx = PAGE_W / 2, half = 95) {
  hLine(page, cx - half, cx - 9, top, C.accent, 0.8);
  hLine(page, cx + 9, cx + half, top, C.accent, 0.8);
  page.drawSvgPath("M 0 -4.5 L 4.5 0 L 0 4.5 L -4.5 0 Z", { x: cx, y: PAGE_H - top, color: C.accent });
}

export function linkAnnotation(doc: PDFDocument, page: PDFPage, x: number, top: number, w: number, h: number, url: string) {
  const annot = doc.context.obj({
    Type: "Annot", Subtype: "Link", Rect: [x, PAGE_H - top - h, x + w, PAGE_H - top], Border: [0, 0, 0],
    A: { Type: "Action", S: "URI", URI: PDFString.of(url) },
  });
  const ref = doc.context.register(annot);
  const existing = page.node.get(PDFName.of("Annots"));
  if (existing instanceof PDFArray) existing.push(ref); else page.node.set(PDFName.of("Annots"), doc.context.obj([ref]));
}

/** New page with the report background and the footer (lotus + website pill). */
export function newPage(doc: PDFDocument, f: Fonts, a: Assets): PDFPage {
  const page = doc.addPage([PAGE_W, PAGE_H]);
  page.drawImage(a.bg, { x: 0, y: 0, width: PAGE_W, height: PAGE_H });
  const lw = 30, lh = lw * (a.lotus.height / a.lotus.width);
  page.drawImage(a.lotus, { x: PAGE_W / 2 - lw / 2, y: PAGE_H - 758 - lh / 2, width: lw, height: lh, opacity: 0.85 });
  roundRect(page, PAGE_W / 2 - 100, 768, 200, 22, 11, { fill: C.navy });
  drawTextC(page, "W W W . A N K S H A A S T R A . C O M", 774.5, { font: f.bold, size: 7.5, color: C.white });
  return page;
}

/** Page title: optional small first line + large second line, then the ornament. Returns where content may start. */
export function pageTitle(page: PDFPage, f: Fonts, l1: string, l2?: string): number {
  const maxW = 430;
  if (l2) {
    drawTextC(page, l1, 62, { font: f.heading, size: fitSize(f.heading, 19, l1, maxW), color: C.navy });
    const s2 = fitSize(f.heading, 30, l2, maxW);
    drawTextC(page, l2, 88, { font: f.heading, size: s2, color: C.navy });
    ornament(page, 134);
    return 152;
  }
  drawTextC(page, l1, 66, { font: f.heading, size: fitSize(f.heading, 30, l1, maxW), color: C.navy });
  ornament(page, 114);
  return 134;
}
