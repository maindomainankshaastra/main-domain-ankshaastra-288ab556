// import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from 'pdf-lib';
// import { loadInvoiceLogoBytes } from './invoice-logo.js';
// import type { InvoiceTemplateData } from './templates/invoice-html.js';

// function fmt(n: number) {
//   return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// }

// /** pdf-lib StandardFonts only support WinAnsi — strip unsupported characters. */
// function sanitizePdfText(value: string): string {
//   return value.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ' ').replace(/\s+/g, ' ').trim();
// }

// async function embedLogo(pdfDoc: PDFDocument) {
//   try {
//     const bytes = await loadInvoiceLogoBytes();
//     if (!bytes || bytes.length < 4) return null;

//     const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
//     const isJpg = bytes[0] === 0xff && bytes[1] === 0xd8;

//     if (isPng) return await pdfDoc.embedPng(bytes);
//     if (isJpg) return await pdfDoc.embedJpg(bytes);
//     return null;
//   } catch (err) {
//     console.warn('[invoice-pdf] Logo embed skipped:', err instanceof Error ? err.message : err);
//     return null;
//   }
// }

// // Wraps text into lines that fit maxChars, honoring existing newlines.
// function wrapLines(text: string, maxChars: number): string[] {
//   return sanitizePdfText(text)
//     .split(/\r?\n/)
//     .flatMap((paragraph) => {
//       const words = paragraph.split(' ').filter(Boolean);
//       if (words.length === 0) return [''];
//       const wrapped: string[] = [];
//       let current = words[0];
//       for (let i = 1; i < words.length; i += 1) {
//         const next = `${current} ${words[i]}`;
//         if (next.length <= maxChars) current = next;
//         else {
//           wrapped.push(current);
//           current = words[i];
//         }
//       }
//       wrapped.push(current);
//       return wrapped;
//     });
// }

// function drawRightText(page: PDFPage, text: string, xRight: number, y: number, size: number, font: PDFFont, color = rgb(0, 0, 0)) {
//   const width = font.widthOfTextAtSize(text, size);
//   page.drawText(text, { x: xRight - width, y, size, font, color });
// }

// const MANDATORY_TERMS = [
//   '1. Services provided by Ankshaastra Occult Experts LLP are digital consultation and advisory services in nature.',
//   '2. Payment once made is non-refundable and non-transferable unless otherwise stated in writing by Ankshaastra Occult Experts LLP.',
//   '3. Service delivery timelines may vary depending on the nature of the service purchased.',
//   '4. The company shall not be liable for any indirect, incidental, or consequential losses arising from the use of its services.',
//   '5. Any dispute relating to services, payments, or invoices shall be subject to the jurisdiction of the competent courts of Uttar Pradesh, India.',
//   '6. All applicable taxes have been charged in accordance with prevailing GST regulations.',
//   '7. The SAC Code applicable to the services rendered under this invoice is 999799.',
//   '8. Customers are advised to retain this invoice for future reference and tax-related purposes.',
//   '9. By making payment, the customer acknowledges acceptance of these terms and conditions.',
// ];

// /** Serverless-safe PDF generation (no Chromium). */
// export async function generateInvoicePdfWithPdfLib(data: InvoiceTemplateData): Promise<Buffer> {
//   const pdfDoc = await PDFDocument.create();
//   let page = pdfDoc.addPage([595.28, 841.89]);
//   const { width, height } = page.getSize();
//   const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
//   const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

//   const blue = rgb(0.29, 0.47, 0.75);
//   const gray = rgb(0.35, 0.35, 0.35);
//   const black = rgb(0, 0, 0);
//   const margin = 36;
//   const BOTTOM_MARGIN = 50;
//   let y = height - margin;

//   function ensureSpace(neededHeight: number) {
//     if (y - neededHeight < BOTTOM_MARGIN) {
//       page = pdfDoc.addPage([width, height]);
//       y = height - margin;
//       page.drawText(`Invoice ${data.invoiceNumber} — continued`, {
//         x: margin, y, size: 8, font, color: gray,
//       });
//       y -= 20;
//     }
//   }

//   function drawFlowingText(text: string, size: number, useFont: PDFFont, color: ReturnType<typeof rgb>, maxChars: number, lineHeight: number) {
//     for (const line of wrapLines(text, maxChars)) {
//       ensureSpace(lineHeight);
//       page.drawText(line, { x: margin, y, size, font: useFont, color });
//       y -= lineHeight;
//     }
//   }

//   page.drawText('TAX INVOICE', { x: margin, y, size: 20, font: fontBold, color: blue });
//   drawRightText(page, '1', width - margin, y + 4, 10, font, gray);
//   y -= 28;

//   const logo = await embedLogo(pdfDoc);
//   const logoWidth = 72;
//   if (logo) {
//     const scale = logoWidth / logo.width;
//     page.drawImage(logo, {
//       x: width - margin - logoWidth,
//       y: y - logo.height * scale + 10,
//       width: logoWidth,
//       height: logo.height * scale,
//     });
//   }

//   page.drawText((data.businessName || 'Ankshaastra').slice(0, 48), { x: margin, y, size: 13, font: fontBold, color: black });
//   y -= 14;
//   const companyLines = [
//     data.businessGstin ? `GSTIN ${data.businessGstin}` : '',
//     data.businessAddress || '',
//     data.businessPhone ? `Mobile ${data.businessPhone}` : '',
//     data.businessEmail ? `Email ${data.businessEmail}` : '',
//     data.businessWebsite ? `Website ${data.businessWebsite}` : '',
//   ].filter(Boolean);

//   for (const line of companyLines) {
//     for (const wrapped of wrapLines(line, 90)) {
//       page.drawText(wrapped, { x: margin, y, size: 8, font, color: gray });
//       y -= 11;
//     }
//   }

//   y -= 10;
//   const metaY = y;
//   page.drawText('Invoice #', { x: margin, y: metaY, size: 8, font: fontBold, color: gray });
//   page.drawText(sanitizePdfText(data.invoiceNumber), { x: margin, y: metaY - 12, size: 9, font, color: black });
//   page.drawText('Invoice Date', { x: margin + 170, y: metaY, size: 8, font: fontBold, color: gray });
//   page.drawText(sanitizePdfText(data.invoiceDate), { x: margin + 170, y: metaY - 12, size: 9, font, color: black });
//   page.drawText('Due Date', { x: margin + 340, y: metaY, size: 8, font: fontBold, color: gray });
//   page.drawText(sanitizePdfText(data.dueDate), { x: margin + 340, y: metaY - 12, size: 9, font, color: black });
//   y = metaY - 34;

//   page.drawText('Customer Details', { x: margin, y, size: 9, font: fontBold, color: black });
//   page.drawText('Billing Address', { x: margin + 250, y, size: 9, font: fontBold, color: black });
//   y -= 14;
//   const purchasedBy = data.purchasedByName || data.customerName;
//   page.drawText(`Purchased By ${sanitizePdfText(purchasedBy)}`.slice(0, 48), { x: margin, y, size: 8, font, color: black });
//   y -= 11;
//   // FIX (per client request 2026-08-02): only show the "Subject" line when
//   // it's actually a different person from the purchaser (e.g. a parent
//   // booking on behalf of a child) — previously it always showed for a
//   // single subject, which duplicated the name already shown right above in
//   // "Purchased By X" whenever the purchaser and subject were the same
//   // person.
//   const subjects = data.serviceSubjects || [];
//   const isSameAsPurchaser = (name: string) =>
//     sanitizePdfText(name).toLowerCase() === sanitizePdfText(purchasedBy).toLowerCase();
//   if (subjects.length === 1) {
//     if (!isSameAsPurchaser(subjects[0].full_name)) {
//       page.drawText(`Subject ${sanitizePdfText(subjects[0].full_name)}`.slice(0, 48), { x: margin, y, size: 8, font, color: black });
//       y -= 11;
//     }
//   } else if (subjects.length > 1) {
//     subjects.slice(0, 3).forEach((subject, index) => {
//       page.drawText(`${index + 1}. ${sanitizePdfText(subject.full_name)}`.slice(0, 48), { x: margin, y, size: 8, font, color: black });
//       y -= 11;
//     });
//   }
//   // FIX (per client request 2026-08-01): show City / State / Pincode as
//   // three explicit labeled fields, each falling back to a plain hyphen (-)
//   // when that piece is missing. (An em-dash was tried first but pdf-lib's
//   // WinAnsi-only StandardFonts silently render it as blank, not as a
//   // visible dash — a plain "-" is in WinAnsi and always renders.)
//   const billingLine =
//     `City: ${data.customerCity || '-'}, ` +
//     `State: ${data.customerState || '-'}, ` +
//     `Pincode: ${data.customerPincode || '-'}`;
//   for (const wrapped of wrapLines(billingLine, 42)) {
//     page.drawText(wrapped, { x: margin + 250, y, size: 8, font, color: black });
//     y -= 11;
//   }
//   if (data.customerPhone) {
//     page.drawText(`Phone ${sanitizePdfText(data.customerPhone)}`.slice(0, 42), { x: margin, y, size: 8, font, color: black });
//     y -= 11;
//   }
//   if (data.placeOfSupply) {
//     y -= 4;
//     page.drawText(`Place of Supply: ${sanitizePdfText(data.placeOfSupply)}`.slice(0, 80), { x: margin, y, size: 8, font, color: black });
//     y -= 14;
//   }

//   // NOTE (2026-08-08, per client): the dynamic per-service "Service
//   // Details" block (Person 1/2 Details, Contact Details, etc.) that used to
//   // render here has been removed from the PDF — the client's upcoming new
//   // invoice design will include this itself, so the current PDF shouldn't
//   // duplicate it. It's still shown in the confirmation EMAIL (unaffected —
//   // see buildOrderDetailsHtml() in order-form-details.ts). If a future PDF
//   // redesign needs it back, data.serviceFormFields still has everything:
//   // an array of { kind: 'section', title } | { kind: 'field', label, value }.

//   const item = data.items[0];
//   const tableTop = y;
//   const cols = [margin, margin + 18, margin + 210, margin + 285, margin + 330, margin + 405, margin + 470];
//   const headers = ['#', 'Item', 'Rate', 'Qty', 'Taxable', 'Tax', 'Amount'];
//   page.drawRectangle({ x: margin, y: tableTop - 14, width: width - margin * 2, height: 16, color: rgb(0.95, 0.96, 0.98) });
//   headers.forEach((header, index) => {
//     page.drawText(header, { x: cols[index], y: tableTop - 10, size: 7, font: fontBold, color: black });
//   });
//   y = tableTop - 28;
//   page.drawText('1', { x: cols[0], y, size: 8, font, color: black });
//   page.drawText(sanitizePdfText(item.description).slice(0, 34), { x: cols[1], y: y + 8, size: 8, font: fontBold, color: black });
//   page.drawText(`SAC: ${item.hsnSac || data.sacCode}`, { x: cols[1], y: y - 4, size: 7, font, color: gray });
//   drawRightText(page, fmt(item.unitPrice), cols[2] + 40, y, 8, font);
//   drawRightText(page, `${item.quantity} QTY`, cols[3] + 30, y, 8, font);
//   drawRightText(page, fmt(item.taxableValue), cols[4] + 45, y, 8, font);
//   drawRightText(page, `${fmt(item.taxAmount)} (${data.gstRate}%)`, cols[5] + 50, y, 8, font);
//   drawRightText(page, fmt(item.lineTotal), width - margin, y, 8, font);
//   y -= 24;
//   page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: rgb(0.85, 0.87, 0.9) });
//   y -= 18;

//   const totalsX = width - margin - 170;
//   const drawTotal = (label: string, value: string, bold = false) => {
//     const f = bold ? fontBold : font;
//     page.drawText(label, { x: totalsX, y, size: 8, font: f, color: black });
//     drawRightText(page, value, width - margin, y, 8, f);
//     y -= 13;
//   };

//   drawTotal('Taxable Amount', fmt(data.gst.subtotal));
//   if (data.gst.isIntraState) {
//     drawTotal(`CGST @ ${data.gstRate / 2}%`, fmt(data.gst.cgst));
//     drawTotal(`SGST @ ${data.gstRate / 2}%`, fmt(data.gst.sgst));
//   } else {
//     drawTotal(`IGST @ ${data.gstRate}%`, fmt(data.gst.igst));
//   }
//   drawTotal('Total', fmt(data.gst.grandTotal), true);

//   if (data.amountInWords) {
//     y -= 4;
//     page.drawText(sanitizePdfText(`Total amount (in words): ${data.amountInWords}`).slice(0, 95), { x: totalsX - 40, y, size: 7, font, color: gray });
//     y -= 14;
//   }
//   page.drawText('Amount Paid', { x: totalsX, y, size: 9, font: fontBold, color: rgb(0.12, 0.48, 0.12) });
//   y -= 30;

//   // ── Bank Details & Signatory ────────────────────────────────────────────
//   ensureSpace(140);
//   const bankBlockTop = y;
//   page.drawText('Bank Details', { x: margin, y, size: 9, font: fontBold, color: black });
//   y -= 14;
//   const bankLines = [
//     data.bankName ? `Bank Name: ${data.bankName}` : '',
//     data.bankAccountHolder ? `Account Holder Name: ${data.bankAccountHolder}` : '',
//     data.bankAccountNumber ? `Account #: ${data.bankAccountNumber}` : '',
//     data.bankIfsc ? `IFSC Code: ${data.bankIfsc}` : '',
//     data.bankBranch ? `Branch: ${data.bankBranch}` : '',
//   ].filter(Boolean);
//   for (const line of bankLines) {
//     page.drawText(sanitizePdfText(line).slice(0, 70), { x: margin, y, size: 8, font, color: black });
//     y -= 11;
//   }

//   page.drawText(`For ${data.businessName}`.slice(0, 50), { x: width - margin - 150, y: bankBlockTop - 34, size: 8, font, color: black });
//   page.drawText('Authorized Signatory', { x: width - margin - 120, y: bankBlockTop - 68, size: 8, font: fontBold, color: black });
//   y = Math.min(y, bankBlockTop - 68) - 24;

//   // ── Footer ───────────────────────────────────────────────────────────────
//   // FIX (per client request 2026-08-01): the previous version of this file
//   // had a hardcoded "Mandatory legal footer" block here — Registered
//   // Address, Corporate Address, GSTIN, email, website, disclaimer lines —
//   // that always rendered regardless of GST Configuration data. That's
//   // exactly why editing the "Invoice Footer" field in the admin panel had
//   // no visible effect and why the address appeared twice (once from the
//   // header, once from this hardcoded block). The client's explicit request
//   // was: after the Thank You line, go straight to Terms & Conditions,
//   // nothing else in between. That hardcoded block is removed entirely —
//   // the business address/GSTIN/email/website are already shown once, in
//   // the header, so nothing legally required is lost.
//   if (data.thankYouMessage) {
//     ensureSpace(24);
//     page.drawText('Thank You', { x: margin, y, size: 8, font: fontBold, color: black });
//     y -= 12;
//     drawFlowingText(data.thankYouMessage, 7, font, gray, 95, 9);
//     y -= 6;
//   }

//   if (data.invoiceFooter) {
//     ensureSpace(24);
//     page.drawText('Invoice Footer', { x: margin, y, size: 8, font: fontBold, color: black });
//     y -= 12;
//     drawFlowingText(data.invoiceFooter, 7, font, gray, 95, 9);
//     y -= 6;
//   }

//   // ── Terms & Conditions ───────────────────────────────────────────────────
//   // Uses data.termsConditions from GST config when present (so it stays
//   // editable from GST Configuration), falling back to the mandatory
//   // clauses only if that config value is ever empty — never blank.
//   const termsSource = data.termsConditions
//     ? wrapLines(data.termsConditions, 95)
//     : MANDATORY_TERMS.flatMap((clause) => wrapLines(clause, 95));

//   ensureSpace(24);
//   page.drawText('Terms & Conditions', { x: margin, y, size: 9, font: fontBold, color: black });
//   y -= 14;
//   for (const line of termsSource) {
//     ensureSpace(9);
//     page.drawText(line, { x: margin, y, size: 7, font, color: gray });
//     y -= 9;
//   }

//   // ── Page numbers (only stamped when the invoice spans multiple pages) ────
//   const totalPages = pdfDoc.getPageCount();
//   if (totalPages > 1) {
//     pdfDoc.getPages().forEach((p, idx) => {
//       const label = `Page ${idx + 1} of ${totalPages}`;
//       p.drawText(label, {
//         x: width - margin - font.widthOfTextAtSize(label, 7),
//         y: 20,
//         size: 7,
//         font,
//         color: gray,
//       });
//     });
//   }

//   return Buffer.from(await pdfDoc.save());
// }

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

// FIX (per client report 2026-08-09): the "Terms & Conditions" text saved
// in GST Configuration is one continuous paragraph ("1. ... 2. ... 3.
// ..."), not one line per clause. wrapLines() only breaks on existing
// newlines (there aren't any) or at the character-width limit, so every
// clause ran together into one flowing block instead of each numbered
// point starting on its own line. This splits the paragraph into separate
// clauses right before each clause number, so each one gets its own set of
// wrapped lines below. Only breaks before a 1-2 digit number followed by
// ". " and a capital letter — on purpose, so it doesn't also break in the
// middle of an ordinary number inside a clause (e.g. the 6-digit SAC code
// "999799." in clause 8, right before clause 9 — that "999799." is left
// alone while the following "9. Customers..." still starts a new line).
function splitNumberedClauses(text: string): string[] {
  return sanitizePdfText(text)
    .split(/\s*(?=\d{1,2}\.\s+[A-Z])/)
    .map((clause) => clause.trim())
    .filter(Boolean);
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
  // FIX (per client request 2026-08-02): only show the "Subject" line when
  // it's actually a different person from the purchaser (e.g. a parent
  // booking on behalf of a child) — previously it always showed for a
  // single subject, which duplicated the name already shown right above in
  // "Purchased By X" whenever the purchaser and subject were the same
  // person.
  const subjects = data.serviceSubjects || [];
  const isSameAsPurchaser = (name: string) =>
    sanitizePdfText(name).toLowerCase() === sanitizePdfText(purchasedBy).toLowerCase();
  if (subjects.length === 1) {
    if (!isSameAsPurchaser(subjects[0].full_name)) {
      page.drawText(`Subject ${sanitizePdfText(subjects[0].full_name)}`.slice(0, 48), { x: margin, y, size: 8, font, color: black });
      y -= 11;
    }
  } else if (subjects.length > 1) {
    subjects.slice(0, 3).forEach((subject, index) => {
      page.drawText(`${index + 1}. ${sanitizePdfText(subject.full_name)}`.slice(0, 48), { x: margin, y, size: 8, font, color: black });
      y -= 11;
    });
  }
  // FIX (per client request 2026-08-01): show City / State / Pincode as
  // three explicit labeled fields, each falling back to a plain hyphen (-)
  // when that piece is missing. (An em-dash was tried first but pdf-lib's
  // WinAnsi-only StandardFonts silently render it as blank, not as a
  // visible dash — a plain "-" is in WinAnsi and always renders.)
  const billingLine =
    `City: ${data.customerCity || '-'}, ` +
    `State: ${data.customerState || '-'}, ` +
    `Pincode: ${data.customerPincode || '-'}`;
  for (const wrapped of wrapLines(billingLine, 42)) {
    page.drawText(wrapped, { x: margin + 250, y, size: 8, font, color: black });
    y -= 11;
  }
  if (data.customerPhone) {
    page.drawText(`Phone ${sanitizePdfText(data.customerPhone)}`.slice(0, 42), { x: margin, y, size: 8, font, color: black });
    y -= 11;
  }
  if (data.placeOfSupply) {
    y -= 4;
    page.drawText(`Place of Supply: ${sanitizePdfText(data.placeOfSupply)}`.slice(0, 80), { x: margin, y, size: 8, font, color: black });
    y -= 14;
  }

  // NOTE (2026-08-08, per client): the dynamic per-service "Service
  // Details" block (Person 1/2 Details, Contact Details, etc.) that used to
  // render here has been removed from the PDF — the client's upcoming new
  // invoice design will include this itself, so the current PDF shouldn't
  // duplicate it. It's still shown in the confirmation EMAIL (unaffected —
  // see buildOrderDetailsHtml() in order-form-details.ts). If a future PDF
  // redesign needs it back, data.serviceFormFields still has everything:
  // an array of { kind: 'section', title } | { kind: 'field', label, value }.

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

  // FIX (per client report 2026-08-09): this line was hard-cut at 95
  // characters (.slice(0, 95)) but drawn starting near the right-hand totals
  // box (x = totalsX - 40), which only leaves ~210pt of page width — not
  // enough room for a 95-character line at this font size, so long amounts
  // (e.g. "INR Six Thousand, Six Hundred Ninety Four Rupees Only") ran off
  // the right edge of the page instead of wrapping. Drawn from the left
  // margin instead (nothing else occupies this row at this point — the
  // totals block above it is already fully drawn) and wrapped by actual
  // width instead of an arbitrary character cutoff, so it always stays on
  // the page no matter how long the amount-in-words text is.
  if (data.amountInWords) {
    y -= 4;
    const wordsLine = sanitizePdfText(`Total amount (in words): ${data.amountInWords}`);
    for (const wrapped of wrapLines(wordsLine, 100)) {
      page.drawText(wrapped, { x: margin, y, size: 7, font, color: gray });
      y -= 10;
    }
  }
  page.drawText('Amount Paid', { x: totalsX, y, size: 9, font: fontBold, color: rgb(0.12, 0.48, 0.12) });
  y -= 30;

  // ── Bank Details & Signatory ────────────────────────────────────────────
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

  page.drawText(`For ${data.businessName}`.slice(0, 50), { x: width - margin - 150, y: bankBlockTop - 34, size: 8, font, color: black });
  page.drawText('Authorized Signatory', { x: width - margin - 120, y: bankBlockTop - 68, size: 8, font: fontBold, color: black });
  y = Math.min(y, bankBlockTop - 68) - 24;

  // ── Footer ───────────────────────────────────────────────────────────────
  // FIX (per client request 2026-08-01): the previous version of this file
  // had a hardcoded "Mandatory legal footer" block here — Registered
  // Address, Corporate Address, GSTIN, email, website, disclaimer lines —
  // that always rendered regardless of GST Configuration data. That's
  // exactly why editing the "Invoice Footer" field in the admin panel had
  // no visible effect and why the address appeared twice (once from the
  // header, once from this hardcoded block). The client's explicit request
  // was: after the Thank You line, go straight to Terms & Conditions,
  // nothing else in between. That hardcoded block is removed entirely —
  // the business address/GSTIN/email/website are already shown once, in
  // the header, so nothing legally required is lost.
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

  // ── Terms & Conditions ───────────────────────────────────────────────────
  // Uses data.termsConditions from GST config when present (so it stays
  // editable from GST Configuration), falling back to the mandatory
  // clauses only if that config value is ever empty — never blank.
  const termsClauses = data.termsConditions ? splitNumberedClauses(data.termsConditions) : MANDATORY_TERMS;
  const termsSource = termsClauses.flatMap((clause) => wrapLines(clause, 130));

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
