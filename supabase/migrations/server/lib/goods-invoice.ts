import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from 'pdf-lib';
import { loadInvoiceLogoBytes } from './invoice-logo.js';
import { round2, type GstBreakdown } from './gst.js';
import type { InvoiceTemplateData } from './templates/invoice-html.js';

/**
 * GOODS invoice (Shopify store, shop.ankshaastra.com).
 *
 * Same overall look as the service invoice, with a different accent colour and the
 * goods-specific fields: per-line HSN + UoM, discount, shipping / COD lines, HSN-wise
 * tax summary, round-off, payment mode, courier + AWB, reverse charge, Bill To / Ship To,
 * place of supply = delivery state, dispatch-from address, optional IRN/QR.
 *
 * Serverless-safe (pdf-lib only, no Chromium).
 */

export type GoodsLine = {
  kind: 'goods' | 'shipping' | 'cod';
  description: string;
  hsn: string;
  quantity: number;
  uom: string;
  /** Unit price before discount, excluding GST. */
  unitRate: number;
  /** Discount excluding GST (0 when none). */
  discount: number;
  taxable: number;
  taxAmount: number;
  /** GST-inclusive line total. */
  amount: number;
};

export type GoodsHsnRow = {
  hsn: string;
  rate: number;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
};

export type GoodsParty = {
  name: string;
  addressLines: string[];
  phone?: string;
  gstin?: string;
};

export type GoodsInvoiceData = {
  lines: GoodsLine[];
  hsnSummary: GoodsHsnRow[];
  paymentMode: 'prepaid' | 'cod';
  billTo: GoodsParty;
  shipTo: GoodsParty;
  placeOfSupply: string;
  supplierState: string;
  dispatchFrom: string;
  courierName?: string;
  awbNumber?: string;
  irn?: string;
  reverseCharge: 'No';
  roundOff: number;
};

type Obj = Record<string, unknown>;

function str(v: unknown): string {
  return v === null || v === undefined ? '' : String(v).trim();
}

function pick(o: Obj | undefined, keys: string[]): string {
  if (!o) return '';
  for (const k of keys) {
    const v = str(o[k]);
    if (v) return v;
  }
  return '';
}

/** pdf-lib StandardFonts are WinAnsi only: drop other scripts and the empty "( )" they leave behind. */
function clean(value: string): string {
  return value
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ' ')
    .replace(/\(\s*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function fmt(n: number): string {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function partyFrom(addr: Obj | undefined, fallbackName: string, fallbackPhone?: string): GoodsParty {
  const line1 = pick(addr, ['line1', 'address1', 'address', 'street']);
  const line2 = pick(addr, ['line2', 'address2']);
  const city = pick(addr, ['city']);
  const state = pick(addr, ['state', 'province']);
  const pin = pick(addr, ['pincode', 'zip', 'postalCode']);
  const tail = [city, state].filter(Boolean).join(', ') + (pin ? ` - ${pin}` : '');
  return {
    name: pick(addr, ['name']) || fallbackName,
    addressLines: [line1, line2, tail].map(clean).filter(Boolean),
    phone: pick(addr, ['phone']) || fallbackPhone || undefined,
  };
}

export function isGoodsSite(site?: unknown): boolean {
  return str(site).toLowerCase().startsWith('shop.');
}

type LineInput = {
  name: string;
  quantity: number;
  amount: number; // inclusive, after discount
  listAmount?: number; // inclusive, before discount
  hsn?: string;
  uom?: string;
};

/**
 * Splits the invoice into lines (goods, shipping, COD) and allocates tax so that the lines
 * add up EXACTLY to the invoice-level GST breakdown (last line absorbs paise differences).
 */
export function buildGoodsInvoiceData(input: {
  order: Obj;
  gst: GstBreakdown;
  gstRate: number;
  fallbackHsn: string;
  fallbackDescription: string;
  customerName: string;
  customerPhone?: string;
  customerGstin?: string;
  businessStateCode: string;
  businessStateName?: string;
  businessAddress?: string;
  placeOfSupply?: string;
}): GoodsInvoiceData {
  const { order, gst, gstRate: r } = input;
  const meta = (order.metadata as Obj | undefined) || {};
  const total = gst.grandTotal;

  // ---- raw components -------------------------------------------------------------
  const rawLines = Array.isArray(meta.lineItems) ? (meta.lineItems as Obj[]) : [];
  let goods: LineInput[] = rawLines
    .map((l) => ({
      name: clean(str(l.name) || str(l.title)),
      quantity: Math.max(1, Number(l.quantity) || 1),
      amount: round2(Number(l.amount) || 0),
      listAmount: Number(l.listAmount) > 0 ? round2(Number(l.listAmount)) : undefined,
      hsn: str(l.hsn) || undefined,
      uom: str(l.uom) || undefined,
    }))
    .filter((l) => l.amount > 0);

  const shipping = round2(Number(meta.shippingShare) || 0);
  const cod = round2(Number(meta.codShare) || 0);

  const goodsSum = round2(goods.reduce((s, l) => s + l.amount, 0));
  const extras = round2(shipping + cod);
  const drift = round2(total - (goodsSum + extras));

  if (!goods.length || Math.abs(drift) > 1) {
    // No usable line detail (e.g. manually created invoice): one line for the whole amount.
    goods = [{ name: clean(input.fallbackDescription) || 'Goods', quantity: 1, amount: round2(total - extras) }];
  } else if (drift !== 0) {
    goods[goods.length - 1].amount = round2(goods[goods.length - 1].amount + drift); // paise only
  }

  type Comp = { kind: GoodsLine['kind']; name: string; qty: number; uom: string; hsn: string; amount: number; list?: number };
  const principal = goods.reduce((a, b) => (b.amount > a.amount ? b : a));
  const principalHsn = principal.hsn || input.fallbackHsn;
  const comps: Comp[] = goods.map((l) => ({
    kind: 'goods',
    name: l.name || 'Goods',
    qty: l.quantity,
    uom: l.uom || 'NOS',
    hsn: l.hsn || input.fallbackHsn,
    amount: l.amount,
    list: l.listAmount,
  }));
  if (shipping > 0) comps.push({ kind: 'shipping', name: 'Shipping / Freight Charges', qty: 1, uom: '', hsn: principalHsn, amount: shipping });
  if (cod > 0) comps.push({ kind: 'cod', name: 'COD Handling Charges', qty: 1, uom: '', hsn: principalHsn, amount: cod });

  // ---- tax allocation (sums match gst.subtotal / gst.gstTotal exactly) ---------------
  const lines: GoodsLine[] = [];
  let taxableSoFar = 0;
  comps.forEach((c, i) => {
    const isLast = i === comps.length - 1;
    const taxable = isLast ? round2(gst.subtotal - taxableSoFar) : round2(c.amount / (1 + r / 100));
    taxableSoFar = round2(taxableSoFar + taxable);
    const discount = c.list && c.list > c.amount ? round2((c.list - c.amount) / (1 + r / 100)) : 0;
    lines.push({
      kind: c.kind,
      description: c.name,
      hsn: c.hsn,
      quantity: c.qty,
      uom: c.uom,
      unitRate: round2((taxable + discount) / Math.max(1, c.qty)),
      discount,
      taxable,
      taxAmount: round2(c.amount - taxable),
      amount: c.amount,
    });
  });

  // ---- HSN-wise summary ---------------------------------------------------------------
  const byHsn = new Map<string, GoodsHsnRow>();
  for (const l of lines) {
    const row = byHsn.get(l.hsn) || { hsn: l.hsn, rate: r, taxable: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0 };
    row.taxable = round2(row.taxable + l.taxable);
    row.totalTax = round2(row.totalTax + l.taxAmount);
    byHsn.set(l.hsn, row);
  }
  const hsnSummary = [...byHsn.values()];
  let cgstLeft = gst.cgst;
  let sgstLeft = gst.sgst;
  hsnSummary.forEach((row, i) => {
    const last = i === hsnSummary.length - 1;
    if (gst.isIntraState) {
      row.cgst = last ? round2(cgstLeft) : round2(row.totalTax / 2);
      row.sgst = last ? round2(sgstLeft) : round2(row.totalTax - row.cgst);
      cgstLeft = round2(cgstLeft - row.cgst);
      sgstLeft = round2(sgstLeft - row.sgst);
    } else {
      row.igst = row.totalTax;
    }
  });

  // ---- parties, addresses, logistics ------------------------------------------------
  const ship = partyFrom(meta.shippingAddress as Obj | undefined, input.customerName, input.customerPhone);
  const bill = meta.billingAddress ? partyFrom(meta.billingAddress as Obj, input.customerName, input.customerPhone) : { ...ship };
  bill.gstin = input.customerGstin || str(meta.customerGstin) || undefined;

  const modeRaw = str(meta.paymentMode).toLowerCase();
  const paymentMode: 'prepaid' | 'cod' = /cod|cash/.test(modeRaw) ? 'cod' : 'prepaid';

  const state = input.businessStateName ? clean(input.businessStateName) : '';
  return {
    lines,
    hsnSummary,
    paymentMode,
    billTo: bill,
    shipTo: ship,
    placeOfSupply: input.placeOfSupply || '',
    supplierState: `${state ? state + ' ' : ''}(${input.businessStateCode})`,
    dispatchFrom: clean(process.env.SHOP_DISPATCH_FROM_ADDRESS || input.businessAddress || ''),
    courierName: str(meta.courierName) || undefined,
    awbNumber: str(meta.awbNumber) || undefined,
    irn: str(meta.irn) || undefined,
    reverseCharge: 'No',
    roundOff: round2(total - (gst.subtotal + gst.gstTotal)),
  };
}

// ======================================================================================
// PDF
// ======================================================================================

const ACCENT = rgb(0.72, 0.31, 0.1); // saffron-brown (goods)  — service invoice stays blue
const ACCENT_BG = rgb(0.99, 0.95, 0.9);
const GRAY = rgb(0.35, 0.35, 0.35);
const BLACK = rgb(0, 0, 0);
const GREEN = rgb(0.12, 0.48, 0.12);
const RULE = rgb(0.85, 0.87, 0.9);

export const GOODS_TERMS = [
  '1. This invoice is generated electronically and is valid without a physical signature or company seal.',
  '2. Shipping and delivery: dispatch and delivery timelines are indicative and may vary by location, courier and circumstances beyond our control. Risk in the goods passes to the buyer on delivery.',
  '3. Returns, replacement and damage: any damage or wrong item must be reported within 48 hours of delivery, with a continuous unboxing video (parcel seal intact, opened on camera) and photos. Claims without an unboxing video may not be accepted. Approved cases are replaced or refunded as per our policy.',
  '4. RTO and COD refusal: parcels refused or returned to origin (RTO) without a valid reason may attract forward and reverse shipping and COD handling charges, and future COD may be disabled for that customer.',
  '5. Spiritual and astrological products are offered on faith and tradition. We do not guarantee any particular result, outcome or benefit.',
  '6. Product variation: natural stones, crystals and Rudraksha vary in colour, shape, size and pattern. Images are for reference and the delivered item may differ slightly.',
  '7. Payment once made is non-transferable. Refunds, where applicable, are processed to the original mode of payment.',
  '8. The company shall not be liable for any indirect, incidental, or consequential losses arising from the use of its products.',
  '9. Any dispute relating to services, payments, or invoices shall be subject to the jurisdiction of the competent courts of Uttar Pradesh, India.',
  '10. All applicable taxes have been charged in accordance with prevailing GST regulations. Please retain this invoice for future reference and tax-related purposes.',
];

function wrapByWidth(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const out: string[] = [];
  for (const para of clean(text).split(/\r?\n/)) {
    const words = para.split(' ').filter(Boolean);
    if (!words.length) continue;
    let cur = '';
    for (const w of words) {
      const next = cur ? `${cur} ${w}` : w;
      if (font.widthOfTextAtSize(next, size) <= maxWidth || !cur) cur = next;
      else {
        out.push(cur);
        cur = w;
      }
    }
    if (cur) out.push(cur);
  }
  return out;
}

async function embedLogo(pdfDoc: PDFDocument) {
  try {
    const bytes = await loadInvoiceLogoBytes();
    if (!bytes || bytes.length < 4) return null;
    if (bytes[0] === 0x89 && bytes[1] === 0x50) return await pdfDoc.embedPng(bytes);
    if (bytes[0] === 0xff && bytes[1] === 0xd8) return await pdfDoc.embedJpg(bytes);
  } catch (err) {
    console.warn('[goods-invoice] logo skipped:', err instanceof Error ? err.message : err);
  }
  return null;
}

export async function generateGoodsInvoicePdf(data: InvoiceTemplateData): Promise<Buffer> {
  const g = data.goods;
  if (!g) throw new Error('generateGoodsInvoicePdf called without goods data');

  const pdfDoc = await PDFDocument.create();
  const W = 595.28;
  const H = 841.89;
  let page: PDFPage = pdfDoc.addPage([W, H]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const M = 36;
  const XR = W - M;
  const BOTTOM = 52;
  let y = H - M;

  const text = (t: string, x: number, yy: number, size = 8, f: PDFFont = font, color = BLACK) =>
    page.drawText(clean(t), { x, y: yy, size, font: f, color });
  const textR = (t: string, xRight: number, yy: number, size = 8, f: PDFFont = font, color = BLACK) => {
    const s = clean(t);
    page.drawText(s, { x: xRight - f.widthOfTextAtSize(s, size), y: yy, size, font: f, color });
  };
  const newPage = () => {
    page = pdfDoc.addPage([W, H]);
    y = H - M;
    text(`Invoice ${data.invoiceNumber} - continued`, M, y, 8, font, GRAY);
    y -= 20;
  };
  const ensure = (needed: number) => {
    if (y - needed < BOTTOM) {
      newPage();
      return true;
    }
    return false;
  };
  const flow = (t: string, size: number, f: PDFFont, color: ReturnType<typeof rgb>, lh: number, maxW = XR - M) => {
    for (const line of wrapByWidth(t, f, size, maxW)) {
      ensure(lh);
      text(line, M, y, size, f, color);
      y -= lh;
    }
  };

  // ---- header ---------------------------------------------------------------------
  text('TAX INVOICE', M, y, 20, bold, ACCENT);
  text('Supply of Goods', M + 132, y + 2, 8, bold, GRAY);
  y -= 26;

  const logo = await embedLogo(pdfDoc);
  if (logo) {
    const lw = 72;
    const s = lw / logo.width;
    page.drawImage(logo, { x: XR - lw, y: y - logo.height * s + 10, width: lw, height: logo.height * s });
  }

  text((data.businessName || 'Ankshaastra').slice(0, 52), M, y, 13, bold);
  y -= 14;
  const biz = [
    data.businessGstin ? `GSTIN ${data.businessGstin}   |   State: ${g.supplierState}` : '',
    data.businessAddress || '',
    data.businessPhone ? `Mobile ${data.businessPhone}` : '',
    data.businessEmail ? `Email ${data.businessEmail}` : '',
    data.businessWebsite ? `Website ${data.businessWebsite}` : '',
  ].filter(Boolean);
  for (const l of biz) {
    for (const w of wrapByWidth(l, font, 8, 400)) {
      text(w, M, y, 8, font, GRAY);
      y -= 11;
    }
  }

  // ---- meta row ---------------------------------------------------------------------
  y -= 8;
  const meta: Array<[string, string]> = [
    ['Invoice #', data.invoiceNumber],
    ['Invoice Date', data.invoiceDate],
    ['Payment Mode', g.paymentMode === 'cod' ? 'COD (Cash on Delivery)' : 'Prepaid'],
    ['Reverse Charge', g.reverseCharge],
  ];
  const colW = (XR - M) / 4;
  meta.forEach(([label, value], i) => {
    text(label, M + colW * i, y, 8, bold, GRAY);
    text(value, M + colW * i, y - 12, 9);
  });
  y -= 30;

  if (data.orderId) {
    text(`Order ID: ${data.orderId}`, M, y, 8);
    y -= 11;
  }
  if (g.courierName || g.awbNumber) {
    const parts = [g.courierName ? `Courier: ${g.courierName}` : '', g.awbNumber ? `AWB / Tracking No: ${g.awbNumber}` : ''];
    text(parts.filter(Boolean).join('   |   '), M, y, 8);
    y -= 11;
  }
  if (g.irn) {
    text(`IRN: ${g.irn}`, M, y, 7, font, GRAY);
    y -= 11;
  }
  y -= 6;

  // ---- Bill To / Ship To ----------------------------------------------------------------
  const half = (XR - M) / 2 - 10;
  const xShip = M + half + 20;
  const blockTop = y;
  const drawParty = (title: string, p: typeof g.billTo, x: number): number => {
    let yy = blockTop;
    text(title, x, yy, 9, bold, ACCENT);
    yy -= 13;
    text(p.name.slice(0, 44), x, yy, 8.5, bold);
    yy -= 11;
    for (const al of p.addressLines) {
      for (const w of wrapByWidth(al, font, 8, half)) {
        text(w, x, yy, 8);
        yy -= 10.5;
      }
    }
    if (p.phone) {
      text(`Phone: ${p.phone}`, x, yy, 8);
      yy -= 10.5;
    }
    if (p.gstin) {
      text(`Customer GSTIN: ${p.gstin}`, x, yy, 8, bold);
      yy -= 10.5;
    }
    return yy;
  };
  const yBill = drawParty('Bill To', g.billTo, M);
  const yShip = drawParty('Ship To / Delivery Address', g.shipTo, xShip);
  y = Math.min(yBill, yShip) - 4;

  text(`Place of Supply (delivery state): ${g.placeOfSupply || '-'}`, M, y, 8, bold);
  y -= 12;
  if (g.dispatchFrom) {
    for (const [i, w] of wrapByWidth(`Dispatch From: ${g.dispatchFrom}`, font, 7.5, XR - M).entries()) {
      text(w, M, y, 7.5, i === 0 ? font : font, GRAY);
      y -= 10;
    }
  }
  y -= 8;

  // ---- items table --------------------------------------------------------------------------
  const hasDisc = g.lines.some((l) => l.discount > 0);
  const gap = 6;
  const defs: Array<{ k: string; w: number; label: string; left?: boolean }> = [
    { k: 'amount', w: 56, label: 'Amount' },
    { k: 'tax', w: 50, label: 'Tax' },
    { k: 'taxable', w: 54, label: 'Taxable' },
    ...(hasDisc ? [{ k: 'disc', w: 42, label: 'Discount' }] : []),
    { k: 'rate', w: 50, label: 'Rate' },
    { k: 'qty', w: 40, label: 'Qty' },
    { k: 'hsn', w: 36, label: 'HSN', left: true },
  ];
  const cols: Record<string, { left: number; right: number }> = {};
  let cursor = XR;
  for (const d of defs) {
    cols[d.k] = { right: cursor, left: cursor - d.w };
    cursor = cursor - d.w - gap;
  }
  const itemLeft = M + 16;
  const itemWidth = cols.hsn.left - gap - itemLeft;

  const drawHeader = () => {
    page.drawRectangle({ x: M, y: y - 4, width: XR - M, height: 16, color: ACCENT_BG });
    text('#', M + 2, y, 7, bold);
    text('Item description', itemLeft, y, 7, bold);
    for (const d of defs) {
      if (d.left) text(d.label, cols[d.k].left, y, 7, bold);
      else textR(d.label, cols[d.k].right, y, 7, bold);
    }
    y -= 14;
  };
  ensure(60);
  drawHeader();

  g.lines.forEach((l, idx) => {
    const desc = wrapByWidth(l.description, bold, 7.5, itemWidth).slice(0, 4);
    const rowH = Math.max(desc.length * 9.5, 22) + 6;
    if (ensure(rowH + 4)) drawHeader();
    const top = y;
    text(String(idx + 1), M + 2, top, 8);
    desc.forEach((d, i) => text(d, itemLeft, top - i * 9.5, 7.5, bold));
    text(l.hsn, cols.hsn.left, top, 7.5);
    textR(`${l.quantity} ${l.uom}`.trim(), cols.qty.right, top, 7.5);
    textR(fmt(l.unitRate), cols.rate.right, top, 7.5);
    if (hasDisc) textR(l.discount > 0 ? fmt(l.discount) : '-', cols.disc.right, top, 7.5);
    textR(fmt(l.taxable), cols.taxable.right, top, 7.5);
    textR(fmt(l.taxAmount), cols.tax.right, top, 7.5);
    textR(`(${data.gstRate}%)`, cols.tax.right, top - 9, 6.5, font, GRAY);
    textR(fmt(l.amount), cols.amount.right, top, 7.5, bold);
    y = top - rowH + 8;
    page.drawLine({ start: { x: M, y: y + 3 }, end: { x: XR, y: y + 3 }, thickness: 0.5, color: RULE });
    y -= 8;
  });
  y -= 6;

  // ---- totals ----------------------------------------------------------------------------------
  ensure(110);
  const tx = XR - 200;
  const row = (label: string, value: string, f: PDFFont = font, color = BLACK, size = 8) => {
    text(label, tx, y, size, f, color);
    textR(value, XR, y, size, f, color);
    y -= 13;
  };
  const totalsTop = y;
  row('Taxable Amount', fmt(data.gst.subtotal));
  if (data.gst.isIntraState) {
    row(`CGST @ ${data.gstRate / 2}%`, fmt(data.gst.cgst));
    row(`SGST @ ${data.gstRate / 2}%`, fmt(data.gst.sgst));
  } else {
    row(`IGST @ ${data.gstRate}%`, fmt(data.gst.igst));
  }
  row('Round Off', (g.roundOff >= 0 ? '' : '-') + fmt(Math.abs(g.roundOff)));
  page.drawLine({ start: { x: tx, y: y + 9 }, end: { x: XR, y: y + 9 }, thickness: 0.5, color: RULE });
  row('Total (INR)', fmt(data.gst.grandTotal), bold, BLACK, 9);

  // left column next to totals: amount in words + payment status
  let yl = totalsTop;
  if (data.amountInWords) {
    for (const w of wrapByWidth(`Total amount (in words): ${data.amountInWords}`, font, 7, tx - M - 12)) {
      text(w, M, yl, 7, font, GRAY);
      yl -= 10;
    }
  }
  yl -= 4;
  if (g.paymentMode === 'cod') {
    text(`Amount to be Collected (COD): INR ${fmt(data.gst.grandTotal)}`, M, yl, 9, bold, ACCENT);
  } else {
    text(`Amount Paid: INR ${fmt(data.gst.grandTotal)}`, M, yl, 9, bold, GREEN);
  }
  y = Math.min(y, yl) - 16;

  // ---- HSN-wise tax summary --------------------------------------------------------------------
  const intra = data.gst.isIntraState;
  const hs: Array<{ label: string; w: number; left?: boolean }> = [
    { label: 'HSN / SAC', w: 80, left: true },
    { label: 'Taxable Value', w: 90 },
    { label: 'Rate', w: 50 },
    ...(intra ? [{ label: 'CGST', w: 70 }, { label: 'SGST', w: 70 }] : [{ label: 'IGST', w: 90 }]),
    { label: 'Total Tax', w: 80 },
  ];
  ensure(44 + (g.hsnSummary.length + 1) * 13);
  text('HSN-wise Tax Summary', M, y, 9, bold, ACCENT);
  y -= 18;
  const hsScale = (XR - M) / hs.reduce((s, c) => s + c.w, 0);
  hs.forEach((c) => (c.w = c.w * hsScale));
  page.drawRectangle({ x: M, y: y - 4, width: XR - M, height: 15, color: ACCENT_BG });
  let hx = M;
  const hxs: number[] = [];
  hs.forEach((c) => {
    hxs.push(hx);
    if (c.left) text(c.label, hx + 3, y, 7, bold);
    else textR(c.label, hx + c.w - 3, y, 7, bold);
    hx += c.w;
  });
  y -= 14;
  const sum = { taxable: 0, cgst: 0, sgst: 0, igst: 0, tax: 0 };
  const drawHsnRow = (cells: string[], f: PDFFont) => {
    cells.forEach((c, i) => {
      if (hs[i].left) text(c, hxs[i] + 3, y, 7.5, f);
      else textR(c, hxs[i] + hs[i].w - 3, y, 7.5, f);
    });
    y -= 13;
  };
  for (const r of g.hsnSummary) {
    sum.taxable += r.taxable;
    sum.cgst += r.cgst;
    sum.sgst += r.sgst;
    sum.igst += r.igst;
    sum.tax += r.totalTax;
    drawHsnRow(
      [r.hsn, fmt(r.taxable), `${r.rate}%`, ...(intra ? [fmt(r.cgst), fmt(r.sgst)] : [fmt(r.igst)]), fmt(r.totalTax)],
      font,
    );
  }
  page.drawLine({ start: { x: M, y: y + 10 }, end: { x: XR, y: y + 10 }, thickness: 0.5, color: RULE });
  drawHsnRow(
    ['Total', fmt(sum.taxable), '', ...(intra ? [fmt(sum.cgst), fmt(sum.sgst)] : [fmt(sum.igst)]), fmt(sum.tax)],
    bold,
  );
  y -= 10;

  // ---- bank + signatory --------------------------------------------------------------------------
  ensure(120);
  const bankTop = y;
  text('Bank Details', M, y, 9, bold);
  y -= 14;
  for (const l of [
    data.bankName ? `Bank Name: ${data.bankName}` : '',
    data.bankAccountHolder ? `Account Holder Name: ${data.bankAccountHolder}` : '',
    data.bankAccountNumber ? `Account #: ${data.bankAccountNumber}` : '',
    data.bankIfsc ? `IFSC Code: ${data.bankIfsc}` : '',
    data.bankBranch ? `Branch: ${data.bankBranch}` : '',
  ].filter(Boolean)) {
    text(l.slice(0, 70), M, y, 8);
    y -= 11;
  }
  text(`For ${data.businessName}`.slice(0, 50), XR - 170, bankTop - 30, 8);
  text('Authorized Signatory', XR - 120, bankTop - 64, 8, bold);

  if (data.qrCodeDataUrl && /^data:image\/png;base64,/.test(data.qrCodeDataUrl)) {
    try {
      const qr = await pdfDoc.embedPng(Buffer.from(data.qrCodeDataUrl.split(',')[1], 'base64'));
      page.drawImage(qr, { x: M + 260, y: bankTop - 62, width: 62, height: 62 });
    } catch {
      /* QR is optional */
    }
  }
  y = Math.min(y, bankTop - 64) - 22;

  // ---- thank you + terms -------------------------------------------------------------------------
  if (data.thankYouMessage) {
    ensure(24);
    text('Thank You', M, y, 8, bold);
    y -= 12;
    flow(data.thankYouMessage, 7, font, GRAY, 9);
    y -= 6;
  }
  ensure(30);
  text('Terms & Conditions', M, y, 9, bold);
  y -= 13;
  for (const clause of GOODS_TERMS) flow(clause, 7, font, GRAY, 9);

  // ---- page numbers ----------------------------------------------------------------------------
  const pages = pdfDoc.getPages();
  if (pages.length > 1) {
    pages.forEach((p, i) => {
      const label = `Page ${i + 1} of ${pages.length}`;
      p.drawText(label, { x: XR - font.widthOfTextAtSize(label, 7), y: 20, size: 7, font, color: GRAY });
    });
  }

  return Buffer.from(await pdfDoc.save());
}
