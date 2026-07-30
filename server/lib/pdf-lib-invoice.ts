import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from 'pdf-lib';
import { loadInvoiceLogoBytes } from './invoice-logo.js';
import type { InvoiceTemplateData } from './templates/invoice-html.js';

function fmt(n: number) {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** pdf-lib StandardFonts only support WinAnsi — strip unsupported characters. */
function sanitizePdfText(value: string): string {
  return value.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ' ').replace(/\s+/g, ' ').trim();
}

async function embedLogo(pdfDoc: PDFDocument) {
  try {
    const bytes = await loadInvoiceLogoBytes();
    if (!bytes || bytes.length < 4) return null;

    const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
    const isJpg = bytes[0] === 0xff && bytes[1] === 0xd8;

    if (isPng) return await pdfDoc.embedPng(bytes);
    if (isJpg) return await pdfDoc.embedJpg(bytes);
    return null;
  } catch (err) {
    console.warn('[invoice-pdf] Logo embed skipped:', err instanceof Error ? err.message : err);
    return null;
  }
}

// Wraps text into lines that fit maxChars, honoring existing newlines.
// FIX: previously callers used `.slice(0, N)` on single lines (e.g. the
// business address), which hard-cuts text mid-word instead of wrapping —
// this is what produced "...Aligarh-202001. Cor" in the real invoice.
// `drawWrappedText` already wrapped correctly; the bug was that not every
// caller used it, and where it was used, `maxLines` silently dropped any
// remaining lines (see FIX notes below at the Terms & Conditions section).
function wrapLines(text: string, maxChars: number): string[] {
  return sanitizePdfText(text)
    .split(/\r?\n/)
    .flatMap((paragraph) => {
      const words = paragraph.split(' ').filter(Boolean);
      if (words.length === 0) return [''];
      const wrapped: string[] = [];
      let current = words[0];
      for (let i = 1; i < words.length; i += 1) {
        const next = `${current} ${words[i]}`;
        if (next.length <= maxChars) current = next;
        else {
          wrapped.push(current);
          current = words[i];
        }
      }
      wrapped.push(current);
      return wrapped;
    });
}

function drawRightText(page: PDFPage, text: string, xRight: number, y: number, size: number, font: PDFFont, color = rgb(0, 0, 0)) {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: xRight - width, y, size, font, color });
}

const MANDATORY_TERMS = [
  '1. Services provided by Ankshaastra Occult Experts LLP are digital consultation and advisory services in nature.',
  '2. Payment once made is non-refundable and non-transferable unless otherwise stated in writing by Ankshaastra Occult Experts LLP.',
  '3. Service delivery timelines may vary depending on the nature of the service purchased.',
  '4. The company shall not be liable for any indirect, incidental, or consequential losses arising from the use of its services.',
  '5. Any dispute relating to services, payments, or invoices shall be subject to the jurisdiction of the competent courts of Uttar Pradesh, India.',
  '6. All applicable taxes have been charged in accordance with prevailing GST regulations.',
  '7. The SAC Code applicable to the services rendered under this invoice is 999799.',
  '8. Customers are advised to retain this invoice for future reference and tax-related purposes.',
  '9. By making payment, the customer acknowledges acceptance of these terms and conditions.',
];

/** Serverless-safe PDF generation (no Chromium). */
export async function generateInvoicePdfWithPdfLib(data: InvoiceTemplateData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const blue = rgb(0.29, 0.47, 0.75);
  const gray = rgb(0.35, 0.35, 0.35);
  const black = rgb(0, 0, 0);
  const margin = 36;
  const BOTTOM_MARGIN = 50;
  let y = height - margin;

  // FIX (layout): the whole rest of the function used to position content
  // via hardcoded absolute y-values (`y = 120`, `y: 90`, `y: 56`,
  // `footerY = 48`) that had nothing to do with how much space was left on
  // the page. Whatever landed after those fixed points — Bank Details,
  // Signatory, Thank You, Invoice Footer, and Terms & Conditions — was
  // squeezed into whatever few points remained (as little as 48pt),
  // pushing most of it below y=0 where it's invisible. `ensureSpace()`
  // replaces every one of those hardcoded values: it checks the room left
  // on the CURRENT page and only starts a new page if there truly isn't
  // enough, so content always flows continuously and nothing is discarded.
  function ensureSpace(neededHeight: number) {
    if (y - neededHeight < BOTTOM_MARGIN) {
      page = pdfDoc.addPage([width, height]);
      y = height - margin;
      page.drawText(`Invoice ${data.invoiceNumber} — continued`, {
        x: margin, y, size: 8, font, color: gray,
      });
      y -= 20;
    }
  }

  // Draws wrapped text at the cursor, breaking across pages if needed, and
  // never silently dropping lines (no maxLines cap).
  function drawFlowingText(text: string, size: number, useFont: PDFFont, color: ReturnType<typeof rgb>, maxChars: number, lineHeight: number) {
    for (const line of wrapLines(text, maxChars)) {
      ensureSpace(lineHeight);
      page.drawText(line, { x: margin, y, size, font: useFont, color });
      y -= lineHeight;
    }
  }

  page.drawText('TAX INVOICE', { x: margin, y, size: 20, font: fontBold, color: blue });
  drawRightText(page, '1', width - margin, y + 4, 10, font, gray);
  y -= 28;

  const logo = await embedLogo(pdfDoc);
  const logoWidth = 72;
  if (logo) {
    const scale = logoWidth / logo.width;
    page.drawImage(logo, {
      x: width - margin - logoWidth,
      y: y - logo.height * scale + 10,
      width: logoWidth,
      height: logo.height * scale,
    });
  }

  page.drawText((data.businessName || 'Ankshaastra').slice(0, 48), { x: margin, y, size: 13, font: fontBold, color: black });
  y -= 14;
  const companyLines = [
    data.businessGstin ? `GSTIN ${data.businessGstin}` : '',
    data.businessAddress || '',
    data.businessPhone ? `Mobile ${data.businessPhone}` : '',
    data.businessEmail ? `Email ${data.businessEmail}` : '',
    data.businessWebsite ? `Website ${data.businessWebsite}` : '',
  ].filter(Boolean);

  // FIX: each line used to be `.slice(0, 90)` — a hard character-count cut
  // with no wrapping, which is exactly what truncated the business address
  // mid-word in the real invoice ("...Aligarh-202001. Cor"). Long lines
  // (the address in particular) now wrap onto as many lines as needed.
  for (const line of companyLines) {
    for (const wrapped of wrapLines(line, 90)) {
      page.drawText(wrapped, { x: margin, y, size: 8, font, color: gray });
      y -= 11;
    }
  }

  y -= 10;
  const metaY = y;
  page.drawText('Invoice #', { x: margin, y: metaY, size: 8, font: fontBold, color: gray });
  page.drawText(sanitizePdfText(data.invoiceNumber), { x: margin, y: metaY - 12, size: 9, font, color: black });
  page.drawText('Invoice Date', { x: margin + 170, y: metaY, size: 8, font: fontBold, color: gray });
  page.drawText(sanitizePdfText(data.invoiceDate), { x: margin + 170, y: metaY - 12, size: 9, font, color: black });
  page.drawText('Due Date', { x: margin + 340, y: metaY, size: 8, font: fontBold, color: gray });
  page.drawText(sanitizePdfText(data.dueDate), { x: margin + 340, y: metaY - 12, size: 9, font, color: black });
  y = metaY - 34;

  page.drawText('Customer Details', { x: margin, y, size: 9, font: fontBold, color: black });
  page.drawText('Billing Address', { x: margin + 250, y, size: 9, font: fontBold, color: black });
  y -= 14;
  const purchasedBy = data.purchasedByName || data.customerName;
  page.drawText(`Purchased By ${sanitizePdfText(purchasedBy)}`.slice(0, 48), { x: margin, y, size: 8, font, color: black });
  y -= 11;
  const subjects = data.serviceSubjects || [];
  if (subjects.length === 1) {
    page.drawText(`Subject ${sanitizePdfText(subjects[0].full_name)}`.slice(0, 48), { x: margin, y, size: 8, font, color: black });
    y -= 11;
  } else if (subjects.length > 1) {
    subjects.slice(0, 3).forEach((subject, index) => {
      page.drawText(`${index + 1}. ${sanitizePdfText(subject.full_name)}`.slice(0, 48), { x: margin, y, size: 8, font, color: black });
      y -= 11;
    });
  }
  const billing = [data.customerCity, data.customerState, data.customerPincode ? `Pincode ${data.customerPincode}` : ''].filter(Boolean).join(', ');
  page.drawText(sanitizePdfText(billing || data.customerBillingAddress || '-').slice(0, 48), { x: margin + 250, y, size: 8, font, color: black });
  y -= 11;
  if (data.customerPhone) {
    page.drawText(`Phone ${sanitizePdfText(data.customerPhone)}`.slice(0, 42), { x: margin, y, size: 8, font, color: black });
    y -= 11;
  }
  if (data.placeOfSupply) {
    y -= 4;
    page.drawText(`Place of Supply: ${sanitizePdfText(data.placeOfSupply)}`.slice(0, 80), { x: margin, y, size: 8, font, color: black });
    y -= 14;
  }

  const item = data.items[0];
  const tableTop = y;
  const cols = [margin, margin + 18, margin + 210, margin + 285, margin + 330, margin + 405, margin + 470];
  const headers = ['#', 'Item', 'Rate', 'Qty', 'Taxable', 'Tax', 'Amount'];
  page.drawRectangle({ x: margin, y: tableTop - 14, width: width - margin * 2, height: 16, color: rgb(0.95, 0.96, 0.98) });
  headers.forEach((header, index) => {
    page.drawText(header, { x: cols[index], y: tableTop - 10, size: 7, font: fontBold, color: black });
  });
  y = tableTop - 28;
  page.drawText('1', { x: cols[0], y, size: 8, font, color: black });
  page.drawText(sanitizePdfText(item.description).slice(0, 34), { x: cols[1], y: y + 8, size: 8, font: fontBold, color: black });
  page.drawText(`SAC: ${item.hsnSac || data.sacCode}`, { x: cols[1], y: y - 4, size: 7, font, color: gray });
  drawRightText(page, fmt(item.unitPrice), cols[2] + 40, y, 8, font);
  drawRightText(page, `${item.quantity} QTY`, cols[3] + 30, y, 8, font);
  drawRightText(page, fmt(item.taxableValue), cols[4] + 45, y, 8, font);
  drawRightText(page, `${fmt(item.taxAmount)} (${data.gstRate}%)`, cols[5] + 50, y, 8, font);
  drawRightText(page, fmt(item.lineTotal), width - margin, y, 8, font);
  y -= 24;
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: rgb(0.85, 0.87, 0.9) });
  y -= 18;

  const totalsX = width - margin - 170;
  const drawTotal = (label: string, value: string, bold = false) => {
    const f = bold ? fontBold : font;
    page.drawText(label, { x: totalsX, y, size: 8, font: f, color: black });
    drawRightText(page, value, width - margin, y, 8, f);
    y -= 13;
  };

  drawTotal('Taxable Amount', fmt(data.gst.subtotal));
  if (data.gst.isIntraState) {
    drawTotal(`CGST @ ${data.gstRate / 2}%`, fmt(data.gst.cgst));
    drawTotal(`SGST @ ${data.gstRate / 2}%`, fmt(data.gst.sgst));
  } else {
    drawTotal(`IGST @ ${data.gstRate}%`, fmt(data.gst.igst));
  }
  drawTotal('Total', fmt(data.gst.grandTotal), true);

  if (data.amountInWords) {
    y -= 4;
    page.drawText(sanitizePdfText(`Total amount (in words): ${data.amountInWords}`).slice(0, 95), { x: totalsX - 40, y, size: 7, font, color: gray });
    y -= 14;
  }
  page.drawText('Amount Paid', { x: totalsX, y, size: 9, font: fontBold, color: rgb(0.12, 0.48, 0.12) });
  y -= 30;

  // ── Bank Details & Signatory ────────────────────────────────────────────
  // FIX (layout): was `y = 120` — a fixed jump to a hardcoded spot near the
  // bottom regardless of where the totals section actually ended. Now it
  // continues naturally from the current cursor (with a modest fixed gap
  // above), and ensureSpace() moves the whole block to a new page together
  // if there isn't enough room left on this one.
  ensureSpace(140);
  const bankBlockTop = y;
  page.drawText('Bank Details', { x: margin, y, size: 9, font: fontBold, color: black });
  y -= 14;
  const bankLines = [
    data.bankName ? `Bank Name: ${data.bankName}` : '',
    data.bankAccountHolder ? `Account Holder Name: ${data.bankAccountHolder}` : '',
    data.bankAccountNumber ? `Account #: ${data.bankAccountNumber}` : '',
    data.bankIfsc ? `IFSC Code: ${data.bankIfsc}` : '',
    data.bankBranch ? `Branch: ${data.bankBranch}` : '',
  ].filter(Boolean);
  for (const line of bankLines) {
    page.drawText(sanitizePdfText(line).slice(0, 70), { x: margin, y, size: 8, font, color: black });
    y -= 11;
  }

  // Signatory column — was hardcoded to y:90/y:56; now anchored to the same
  // reference point as the Bank Details title so the two columns always
  // line up, wherever that title ends up landing.
  page.drawText(`For ${data.businessName}`.slice(0, 50), { x: width - margin - 150, y: bankBlockTop - 34, size: 8, font, color: black });
  page.drawText('Authorized Signatory', { x: width - margin - 120, y: bankBlockTop - 68, size: 8, font: fontBold, color: black });
  y = Math.min(y, bankBlockTop - 68) - 24;

  // ── Footer ───────────────────────────────────────────────────────────────
  // FIX (layout + content): was `footerY = 48` with only ~48pt of vertical
  // room left for Thank You + Invoice Footer + Terms & Conditions combined
  // — nowhere near enough, and each block was additionally hard-capped via
  // `maxLines` (3 / 4 / 6), silently discarding any content beyond that
  // even when there would have been room. Both problems are fixed below:
  // sections now flow with ensureSpace()/drawFlowingText() (no maxLines
  // cap, no lost content), and the legally-required footer text is now
  // always drawn in full regardless of what's configured in `invoiceFooter`.
  if (data.thankYouMessage) {
    ensureSpace(24);
    page.drawText('Thank You', { x: margin, y, size: 8, font: fontBold, color: black });
    y -= 12;
    drawFlowingText(data.thankYouMessage, 7, font, gray, 95, 9);
    y -= 6;
  }

  if (data.invoiceFooter) {
    ensureSpace(24);
    page.drawText('Invoice Footer', { x: margin, y, size: 8, font: fontBold, color: black });
    y -= 12;
    drawFlowingText(data.invoiceFooter, 7, font, gray, 95, 9);
    y -= 6;
  }

  // Mandatory legal footer — always rendered in full, independent of GST
  // config data, so it can never be missing or incomplete on any invoice.
  ensureSpace(20);
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 0.5, color: rgb(0.85, 0.87, 0.9) });
  y -= 14;

  const legalFooterLines: Array<{ text: string; bold?: boolean; gap?: boolean }> = [
    { text: 'Registered Address:', bold: true },
    { text: '5/56 A, Agarwal Marg,' },
    { text: 'Behind Sarsol Police Chowki,' },
    { text: 'Aligarh - 202001.' },
    { gap: true, text: '' },
    { text: 'Corporate Address:', bold: true },
    { text: 'Unit No. O-622,' },
    { text: 'Block-E,' },
    { text: 'Eye of Noida,' },
    { text: 'Sector 140A,' },
    { text: 'Noida - 201305.' },
    { gap: true, text: '' },
  ];
  for (const line of legalFooterLines) {
    if (line.gap) { y -= 5; continue; }
    ensureSpace(11);
    page.drawText(line.text, { x: margin, y, size: 8, font: line.bold ? fontBold : font, color: line.bold ? black : gray });
    y -= 11;
  }
  drawFlowingText('This is a computer-generated invoice and does not require a physical signature.', 8, font, gray, 95, 11);
  y -= 5;
  drawFlowingText('For support regarding this invoice or the associated service, please contact our customer support team.', 8, font, gray, 95, 11);
  y -= 5;
  ensureSpace(11);
  page.drawText('Ankshaastra Occult Experts LLP', { x: margin, y, size: 8, font: fontBold, color: black });
  y -= 11;
  for (const line of ['GSTIN: 09AAFFE7583B1ZD', 'Email: social@ankshaastra.com', 'Website: www.ankshaastra.com']) {
    ensureSpace(11);
    page.drawText(line, { x: margin, y, size: 8, font, color: gray });
    y -= 11;
  }
  y -= 12;

  // ── Terms & Conditions ───────────────────────────────────────────────────
  // FIX: always renders all 9 mandatory clauses in full (previously capped
  // at `maxLines: 6`, so clauses 7-9 were silently dropped even before the
  // off-page clipping bug). Uses `data.termsConditions` from GST config
  // when present (so it can still be customised there), but falls back to
  // the mandatory clauses if that config value is missing — never blank.
  const termsSource = data.termsConditions
    ? wrapLines(data.termsConditions, 95)
    : MANDATORY_TERMS.flatMap((clause) => wrapLines(clause, 95));

  ensureSpace(24);
  page.drawText('Terms & Conditions', { x: margin, y, size: 9, font: fontBold, color: black });
  y -= 14;
  for (const line of termsSource) {
    ensureSpace(9);
    page.drawText(line, { x: margin, y, size: 7, font, color: gray });
    y -= 9;
  }

  // ── Page numbers (only stamped when the invoice spans multiple pages) ────
  const totalPages = pdfDoc.getPageCount();
  if (totalPages > 1) {
    pdfDoc.getPages().forEach((p, idx) => {
      const label = `Page ${idx + 1} of ${totalPages}`;
      p.drawText(label, {
        x: width - margin - font.widthOfTextAtSize(label, 7),
        y: 20,
        size: 7,
        font,
        color: gray,
      });
    });
  }

  return Buffer.from(await pdfDoc.save());
}
