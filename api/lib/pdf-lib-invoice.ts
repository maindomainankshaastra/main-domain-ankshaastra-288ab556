import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { InvoiceTemplateData } from './templates/invoice-html.js';

function fmt(n: number) {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Serverless-safe PDF generation (no Chromium). */
export async function generateInvoicePdfWithPdfLib(data: InvoiceTemplateData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const purple = rgb(0.18, 0.1, 0.28);
  const gold = rgb(0.83, 0.69, 0.22);
  const gray = rgb(0.4, 0.4, 0.4);
  const black = rgb(0, 0, 0);

  const margin = 40;
  let y = height - margin;

  page.drawRectangle({ x: 0, y: height - 72, width, height: 72, color: purple });
  page.drawText(data.businessName || 'Ankshaastra', { x: margin, y: height - 36, size: 18, font: fontBold, color: gold });
  page.drawText('TAX INVOICE', {
    x: width - margin - fontBold.widthOfTextAtSize('TAX INVOICE', 14),
    y: height - 36,
    size: 14,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  if (data.businessGstin) {
    page.drawText(`GSTIN: ${data.businessGstin}`, { x: margin, y: height - 54, size: 8, font, color: rgb(1, 1, 1) });
  }

  y = height - 96;
  page.drawText(`Invoice No: ${data.invoiceNumber}`, { x: margin, y, size: 10, font: fontBold, color: black });
  page.drawText(`Date: ${data.invoiceDate}`, {
    x: width - margin - font.widthOfTextAtSize(`Date: ${data.invoiceDate}`, 10),
    y,
    size: 10,
    font,
    color: black,
  });
  page.drawText(`Status: ${data.status}`, { x: margin, y: y - 14, size: 9, font, color: gray });

  y -= 40;
  page.drawText('Bill To', { x: margin, y, size: 10, font: fontBold, color: black });
  y -= 14;
  page.drawText(data.customerName, { x: margin, y, size: 10, font, color: black });
  if (data.customerEmail) {
    y -= 12;
    page.drawText(data.customerEmail, { x: margin, y, size: 9, font, color: gray });
  }
  if (data.customerPhone) {
    y -= 12;
    page.drawText(data.customerPhone, { x: margin, y, size: 9, font, color: gray });
  }

  y -= 28;
  const colDesc = margin;
  const colQty = width - margin - 180;
  const colRate = width - margin - 110;
  const colAmt = width - margin - 50;

  page.drawText('Description', { x: colDesc, y, size: 9, font: fontBold, color: black });
  page.drawText('Qty', { x: colQty, y, size: 9, font: fontBold, color: black });
  page.drawText('Rate', { x: colRate, y, size: 9, font: fontBold, color: black });
  page.drawText('Amount', { x: colAmt, y, size: 9, font: fontBold, color: black });
  y -= 4;
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: gray });
  y -= 16;

  for (const item of data.items) {
    page.drawText(item.description.slice(0, 48), { x: colDesc, y, size: 9, font, color: black });
    page.drawText(String(item.quantity), { x: colQty, y, size: 9, font, color: black });
    page.drawText(`Rs.${fmt(item.unitPrice)}`, { x: colRate, y, size: 9, font, color: black });
    page.drawText(`Rs.${fmt(item.lineTotal)}`, { x: colAmt, y, size: 9, font, color: black });
    y -= 16;
  }

  y -= 8;
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: gray });
  y -= 18;

  const totalsX = width - margin - 160;
  const drawTotalRow = (label: string, value: string, bold = false) => {
    const f = bold ? fontBold : font;
    page.drawText(label, { x: totalsX, y, size: 9, font: f, color: black });
    page.drawText(value, { x: colAmt, y, size: 9, font: f, color: black });
    y -= 14;
  };

  drawTotalRow('Subtotal', `Rs.${fmt(data.gst.subtotal)}`);
  if (data.gst.isIntraState) {
    drawTotalRow('CGST', `Rs.${fmt(data.gst.cgst)}`);
    drawTotalRow('SGST', `Rs.${fmt(data.gst.sgst)}`);
  } else {
    drawTotalRow('IGST', `Rs.${fmt(data.gst.igst)}`);
  }
  drawTotalRow('Grand Total', `Rs.${fmt(data.gst.grandTotal)}`, true);

  y -= 10;
  if (data.paymentMethod) {
    page.drawText(`Payment: ${data.paymentMethod}`, { x: margin, y, size: 9, font, color: black });
    y -= 12;
  }
  if (data.transactionId) {
    page.drawText(`Transaction ID: ${data.transactionId}`, { x: margin, y, size: 8, font, color: gray });
    y -= 12;
  }

  if (data.termsFooter) {
    y -= 8;
    page.drawText(data.termsFooter.slice(0, 120), { x: margin, y, size: 8, font, color: gray });
  }

  page.drawText('Thank you for your business.', {
    x: margin,
    y: margin,
    size: 9,
    font,
    color: gray,
  });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
