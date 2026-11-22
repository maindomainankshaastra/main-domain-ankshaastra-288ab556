import type { PDFDocument, PDFPage } from "pdf-lib";
import { C, CONTENT_W, BOTTOM, MARGIN_L, PAGE_H } from "./theme.ts";
import { drawPara, drawText, hLine, newPage, pageTitle, paraHeight, rect, roundRect, wrapLines, type Assets, type Fonts } from "./draw.ts";

export type Block =
  | { t: "h"; text: string }
  | { t: "p"; text: string; center?: boolean; muted?: boolean }
  | { t: "ul"; items: string[] }
  | { t: "qa"; q: string; a: string }
  | { t: "callout"; title?: string; text: string }
  | { t: "cols"; left: { title: string; items: string[] }; right: { title: string; items: string[] } }
  | { t: "gap"; h: number };

export interface Section { index?: string; l1: string; l2?: string; blocks: Block[] }
export interface Mark { title: string; page: number }

const BODY = 11.5;
const LH = 16.5;

/** Flows blocks of text onto as many pages as needed, repeating the page title on continuation pages. */
export class Flow {
  page!: PDFPage;
  top = 0;
  /** Counts pages started by this flow (lets tables redraw their header on a new page). */
  pageNo = 0;
  private first = true;
  constructor(
    readonly doc: PDFDocument, readonly f: Fonts, readonly a: Assets,
    private l1: string, private l2: string | undefined, private marks: Mark[], private indexTitle?: string,
  ) {
    this.newPage();
  }

  newPage() {
    this.pageNo++;
    this.page = newPage(this.doc, this.f, this.a);
    if (this.first) {
      if (this.indexTitle) this.marks.push({ title: this.indexTitle, page: this.doc.getPageCount() });
      this.top = pageTitle(this.page, this.f, this.l1, this.l2);
      this.first = false;
    } else {
      this.top = pageTitle(this.page, this.f, this.l2 ? `${this.l1} ${this.l2}`.slice(0, 40) : this.l1, "(continued)");
    }
    this.top += 6;
  }

  ensure(h: number) {
    if (this.top + h > BOTTOM) this.newPage();
  }

  render(blocks: Block[]) {
    for (const b of blocks) this.block(b);
  }

  /**
   * Table with wrapped cells and automatic page breaks (header repeated). `cols[i].w` are widths in points;
   * rows are arrays of strings ("\n" starts a new line inside a cell). Returns nothing; advances `top`.
   */
  table(cols: { w: number; center?: boolean; bold?: boolean }[], header: string[] | null, rows: string[][], size = 9.6, grid = false, minRow = 36, xLeft?: number) {
    const { f } = this;
    const lh = size * 1.34, padX = 7, padY = 5.5;
    const total = cols.reduce((s, c) => s + c.w, 0);
    const x0 = xLeft ?? MARGIN_L + (CONTENT_W - total) / 2;
    const cellLines = (row: string[]) => row.map((t, i) => wrapLines(cols[i].bold || grid ? f.bold : f.body, size, t, cols[i].w - padX * 2));
    const drawHeader = () => {
      if (!header) return;
      const h = lh + padY * 2;
      if (grid) rect(this.page, x0, this.top, total, h, C.navy); else roundRect(this.page, x0, this.top, total, h, 8, { fill: C.navy });
      let x = x0;
      header.forEach((t, i) => {
        const w = cols[i].w;
        drawText(this.page, t, x + (cols[i].center || grid ? w / 2 - f.bold.widthOfTextAtSize(t, size) / 2 : padX), this.top + padY, { font: f.bold, size, color: C.white });
        x += w;
      });
      this.top += h;
    };
    let pageSeen = this.pageNo;
    this.ensure(header ? 70 : 40);
    pageSeen = this.pageNo;
    drawHeader();
    rows.forEach((row, ri) => {
      const lines = cellLines(row);
      const h = Math.max(Math.max(...lines.map((l) => l.length)) * lh + padY * 2, grid ? minRow : 0);
      this.ensure(h);
      if (this.pageNo !== pageSeen) { pageSeen = this.pageNo; drawHeader(); }
      rect(this.page, x0, this.top, total, h, grid || ri % 2 !== 0 ? C.white : C.panelLight);
      if (grid) {
        const ink = C.ink;
        hLine(this.page, x0, x0 + total, this.top + h, ink, 1.1);
        this.page.drawLine({ start: { x: x0, y: PAGE_H - this.top }, end: { x: x0, y: PAGE_H - this.top - h }, thickness: 1.1, color: ink });
        let vx = x0;
        cols.forEach((c) => { vx += c.w; this.page.drawLine({ start: { x: vx, y: PAGE_H - this.top }, end: { x: vx, y: PAGE_H - this.top - h }, thickness: 1.1, color: ink }); });
      } else hLine(this.page, x0, x0 + total, this.top + h, C.line, 0.5);
      let x = x0;
      lines.forEach((ls, i) => {
        const w = cols[i].w;
        ls.forEach((line, li) => {
          const font = cols[i].bold || grid ? f.bold : f.body;
          const tx = cols[i].center ? x + w / 2 - font.widthOfTextAtSize(line, size) / 2 : x + padX;
          drawText(this.page, line, tx, this.top + (grid ? (h - ls.length * lh) / 2 : padY) + li * lh, { font, size, color: cols[i].bold && !grid ? C.navy : C.ink });
        });
        x += w;
      });
      this.top += h;
    });
    this.top += 12;
  }

  private block(b: Block) {
    const { f } = this;
    const w = CONTENT_W;
    switch (b.t) {
      case "gap": this.top += b.h; return;
      case "h": {
        this.ensure(62);
        drawText(this.page, b.text.toUpperCase(), MARGIN_L, this.top, { font: f.bold, size: 11.5, color: C.accent });
        hLine(this.page, MARGIN_L, MARGIN_L + w, this.top + 17, C.line, 0.7);
        this.top += 28;
        return;
      }
      case "p": {
        const size = BODY;
        const h = paraHeight(f.body, size, b.text, w, LH);
        this.ensure(Math.min(h, 60));
        // paragraphs may span pages: draw line by line
        for (const line of wrapLines(f.body, size, b.text, w)) {
          this.ensure(LH);
          drawPara(this.page, line, MARGIN_L, this.top, w, { font: f.body, size, color: b.muted ? C.muted : C.ink, lh: LH, align: b.center ? "center" : "left" });
          this.top += LH;
        }
        this.top += 8;
        return;
      }
      case "ul": {
        for (const item of b.items) {
          const lines = wrapLines(f.body, BODY, item, w - 18);
          this.ensure(lines.length * LH);
          drawText(this.page, "•", MARGIN_L + 4, this.top, { font: f.bold, size: BODY, color: C.accent });
          for (const line of lines) { drawText(this.page, line, MARGIN_L + 18, this.top, { font: f.body, size: BODY }); this.top += LH; }
          this.top += 3;
        }
        this.top += 6;
        return;
      }
      case "qa": {
        const qh = paraHeight(f.bold, BODY, b.q, w, LH);
        const ah = paraHeight(f.body, BODY, b.a, w - 14, LH);
        this.ensure(qh + ah + 8);
        this.top = drawPara(this.page, b.q, MARGIN_L, this.top, w, { font: f.bold, size: BODY, color: C.navy, lh: LH });
        this.top += 2;
        this.top = drawPara(this.page, b.a, MARGIN_L + 14, this.top, w - 14, { font: f.body, size: BODY, lh: LH });
        hLine(this.page, MARGIN_L + 40, MARGIN_L + w - 40, this.top + 7, C.line, 0.5);
        this.top += 18;
        return;
      }
      case "callout": {
        const pad = 14;
        const th = b.title ? 20 : 0;
        const h = pad * 2 + th + paraHeight(f.body, BODY, b.text, w - pad * 2, LH);
        this.ensure(h + 6);
        roundRect(this.page, MARGIN_L, this.top, w, h, 12, { fill: C.navy });
        let y = this.top + pad;
        if (b.title) { drawText(this.page, b.title, MARGIN_L + pad, y, { font: f.bold, size: 11.5, color: C.white }); y += th; }
        drawPara(this.page, b.text, MARGIN_L + pad, y, w - pad * 2, { font: f.body, size: BODY, color: C.white, lh: LH });
        this.top += h + 12;
        return;
      }
      case "cols": {
        const gap = 14, cw = (w - gap) / 2, pad = 12;
        const items = (side: { title: string; items: string[] }) =>
          side.items.map((i) => wrapLines(f.body, 10.4, i, cw - pad * 2 - 12));
        const hOf = (side: { title: string; items: string[] }) => pad * 2 + 22 + items(side).reduce((s, l) => s + l.length * 14.2 + 4, 0);
        const h = Math.max(hOf(b.left), hOf(b.right));
        this.ensure(h + 8);
        const draw = (side: { title: string; items: string[] }, x: number, dark: boolean) => {
          roundRect(this.page, x, this.top, cw, h, 12, dark ? { fill: C.navy } : { fill: C.panelLight, stroke: C.line, sw: 0.8 });
          const fg = dark ? C.white : C.navy;
          drawText(this.page, side.title, x + pad, this.top + pad, { font: f.bold, size: 11, color: fg });
          let y = this.top + pad + 22;
          for (const lines of items(side)) {
            drawText(this.page, "•", x + pad, y, { font: f.bold, size: 10.4, color: fg });
            for (const line of lines) { drawText(this.page, line, x + pad + 12, y, { font: f.body, size: 10.4, color: fg }); y += 14.2; }
            y += 4;
          }
        };
        draw(b.left, MARGIN_L, true);
        draw(b.right, MARGIN_L + cw + gap, false);
        this.top += h + 14;
        return;
      }
    }
  }
}
