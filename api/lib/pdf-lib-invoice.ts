import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from 'pdf-lib';
import type { InvoiceTemplateData } from './templates/invoice-html.js';

function fmt(n: number) {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** pdf-lib StandardFonts only support WinAnsi — strip unsupported characters. */
function sanitizePdfText(value: string): string {
  return value.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ' ').replace(/\s+/g, ' ').trim();
}

async function embedLogo(pdfDoc: PDFDocument, logoUrl?: string) {
  if (!logoUrl) return null;
  try {
    const res = await fetch(logoUrl);
    if (!res.ok) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.length < 4) return null;

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

function drawRightText(page: PDFPage, text: string, xRight: number, y: number, size: number, font: PDFFont, color = rgb(0, 0, 0)) {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: xRight - width, y, size, font, color });
}

/** Serverless-safe PDF generation (no Chromium). */
export async function generateInvoicePdfWithPdfLib(data: InvoiceTemplateData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const blue = rgb(0.29, 0.47, 0.75);
  const gray = rgb(0.35, 0.35, 0.35);
  const black = rgb(0, 0, 0);
  const margin = 36;
  let y = height - margin;

  page.drawText('TAX INVOICE', { x: margin, y, size: 20, font: fontBold, color: blue });
  drawRightText(page, '1', width - margin, y + 4, 10, font, gray);
  y -= 28;

  const logo = await embedLogo(pdfDoc, data.logoUrl);
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

  const companyWidth = width - margin * 2 - (logo ? logoWidth + 16 : 0);
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
    page.drawText(sanitizePdfText(line).slice(0, 90), { x: margin, y, size: 8, font, color: gray });
    y -= 11;
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
  page.drawText(`Name ${sanitizePdfText(data.customerName)}`.slice(0, 42), { x: margin, y, size: 8, font, color: black });
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

  y = 120;
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

  page.drawText(`For ${data.businessName}`.slice(0, 50), { x: width - margin - 150, y: 90, size: 8, font, color: black });
  page.drawText('Authorized Signatory', { x: width - margin - 120, y: 56, size: 8, font: fontBold, color: black });

  if (data.termsFooter) {
    page.drawText(data.termsFooter.slice(0, 120), { x: margin, y: 36, size: 7, font, color: gray });
  }

  return Buffer.from(await pdfDoc.save());
}
