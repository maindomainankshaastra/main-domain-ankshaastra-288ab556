// api/_utils/generate-invoice-pdf.js
// Self-contained PDF generation using pdf-lib (no Supabase required)
// Falls back gracefully if pdf-lib is unavailable

/**
 * Generate a professional invoice PDF as a Buffer.
 * Uses pdf-lib which runs in Node.js without any browser/puppeteer dependency.
 *
 * @param {object} invoiceData
 * @returns {Promise<Buffer|null>}
 */
export async function generateInvoicePDFLocal(invoiceData) {
  try {
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

    const {
      orderId,
      invoiceNumber,
      invoiceDate,
      customerName,
      customerEmail,
      customerMobile,
      customerCity,
      pinCode,
      packageType,
      transactionId,
      amount, // in rupees (already converted)
    } = invoiceData;

    // ── GST calculation (GST-inclusive prices) ────────────────────────────────
    const totalWithGst = amount || 0;
    const pin = parseInt(pinCode || '0', 10);
    const isIntraState = pin >= 200000 && pin <= 289999;
    const subtotal = +(totalWithGst / 1.18).toFixed(2);
    const cgstAmount = isIntraState ? +(subtotal * 0.09).toFixed(2) : 0;
    const sgstAmount = isIntraState ? +(subtotal * 0.09).toFixed(2) : 0;
    const igstAmount = isIntraState ? 0 : +(subtotal * 0.18).toFixed(2);

    const packageNames = {
      single: 'Perfect Baby Name Report',
      premium: 'Premium Report + Live Session',
      namecheck: 'Name Check Report',
      'namecheck-1': 'Name Check (1 Person)',
      'namecheck-2': 'Name Check (2 Persons)',
      'namecheck-3': 'Name Check (3 Persons)',
      baby_name: 'Baby Name Numerology Report',
    };
    const packageName = packageNames[packageType] || 'Numerology Report';

    const fmt = (n) => `Rs.${n.toLocaleString('en-IN')}`;

    // ── PDF setup ─────────────────────────────────────────────────────────────
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();

    const font     = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const purple    = rgb(0.18, 0.10, 0.28);   // #2E1A47
    const gold      = rgb(0.79, 0.65, 0.30);   // #C9A84C
    const black     = rgb(0, 0, 0);
    const gray      = rgb(0.40, 0.40, 0.40);
    const lightGray = rgb(0.95, 0.95, 0.95);
    const white     = rgb(1, 1, 1);

    let y = height - 40;
    const L = 40;  // left margin
    const R = width - 40; // right edge
    const BOTTOM_MARGIN = 60; // keep space for page-number stamp + breathing room

    // Generic word-wrapper (pdf-lib has no built-in text wrapping).
    // Parametrised by font/size/maxWidth so it can be reused for both the
    // Terms & Conditions clauses and the new footer sentences.
    function wrapText(textFont, text, size, maxWidth) {
      const words = text.split(' ');
      const lines = [];
      let current = '';
      for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (textFont.widthOfTextAtSize(candidate, size) > maxWidth && current) {
          lines.push(current);
          current = word;
        } else {
          current = candidate;
        }
      }
      if (current) lines.push(current);
      return lines;
    }

    // FIX (layout): the original file drew every element top-down with fixed
    // `y -=` decrements on a single, fixed-height (842pt) page and never
    // checked whether `y` had run past the bottom margin. Once the preceding
    // sections (customer/bank details, notes) took up enough room — and
    // especially once the footer below was expanded to the full required
    // text — the Terms & Conditions and/or footer were pushed past y=0 and
    // got silently clipped off the page. `ensureSpace()` now checks the
    // remaining room before drawing each subsequent block and, if there
    // isn't enough, starts a fresh page instead of drawing off-canvas.
    function ensureSpace(neededHeight) {
      if (y - neededHeight < BOTTOM_MARGIN) {
        page = pdfDoc.addPage([width, height]);
        y = height - 50;
        page.drawText(`Invoice ${invoiceNumber || orderId} — continued`, {
          x: L, y, size: 8, font, color: gray,
        });
        y -= 20;
      }
    }

    // ── Header band ───────────────────────────────────────────────────────────
    page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: purple });
    page.drawText('Ankshaastra', { x: L, y: height - 35, size: 22, font: fontBold, color: gold });
    page.drawText('TAX INVOICE', {
      x: R - fontBold.widthOfTextAtSize('TAX INVOICE', 16),
      y: height - 35, size: 16, font: fontBold, color: white,
    });
    page.drawText('Empower Your Name', { x: L, y: height - 55, size: 9, font, color: white });
    page.drawText(`Invoice No: ${invoiceNumber || orderId}`, {
      x: R - font.widthOfTextAtSize(`Invoice No: ${invoiceNumber || orderId}`, 8),
      y: height - 52, size: 8, font, color: white,
    });
    page.drawText(`Date: ${invoiceDate}`, {
      x: R - font.widthOfTextAtSize(`Date: ${invoiceDate}`, 8),
      y: height - 63, size: 8, font, color: white,
    });

    y = height - 100;

    // ── Company & Bill To ─────────────────────────────────────────────────────
    page.drawText('From:', { x: L, y, size: 9, font: fontBold, color: purple });
    page.drawText('Bill To:', { x: 320, y, size: 9, font: fontBold, color: purple });
    y -= 14;

    const companyLines = [
      'Unit No. O-622, Block-E, Eye of Noida,',
      'Sector 140A, Noida - 201305',
      'Phone: 9667305577',
      'Email: service@ankshaastra.in',
      'GSTIN: 09AAFFE7583B1ZD',
    ];
    for (const line of companyLines) {
      page.drawText(line, { x: L, y, size: 8, font, color: gray });
      y -= 12;
    }

    let billY = height - 114;
    const billLines = [
      customerName || 'Customer',
      customerEmail || '',
      customerMobile ? `Phone: ${customerMobile}` : '',
      customerCity || '',
      pinCode ? `PIN: ${pinCode}` : '',
    ].filter(Boolean);
    for (const line of billLines) {
      page.drawText(line, { x: 320, y: billY, size: 8, font, color: gray });
      billY -= 12;
    }

    y -= 10;

    // Order meta
    page.drawText(`Order ID: ${orderId}`, { x: L, y, size: 8, font, color: gray });
    if (transactionId) {
      page.drawText(`Transaction ID: ${transactionId}`, { x: 320, y, size: 8, font, color: gray });
    }
    y -= 20;

    // Divider
    page.drawLine({ start: { x: L, y }, end: { x: R, y }, thickness: 1.5, color: gold });
    y -= 20;

    // ── Items table header ────────────────────────────────────────────────────
    page.drawRectangle({ x: L, y: y - 6, width: R - L, height: 22, color: purple });
    page.drawText('Description',  { x: L + 8, y, size: 9, font: fontBold, color: white });
    page.drawText('HSN/SAC',      { x: 260, y, size: 9, font: fontBold, color: white });
    page.drawText('Qty',          { x: 350, y, size: 9, font: fontBold, color: white });
    page.drawText('Amount',       { x: R - fontBold.widthOfTextAtSize('Amount', 9) - 5, y, size: 9, font: fontBold, color: white });
    y -= 26;

    // Table row
    page.drawRectangle({ x: L, y: y - 6, width: R - L, height: 22, color: lightGray });
    page.drawText(packageName,    { x: L + 8, y, size: 9, font, color: black });
    page.drawText('998399',       { x: 260, y, size: 9, font, color: black });
    page.drawText('1',            { x: 353, y, size: 9, font, color: black });
    page.drawText(fmt(subtotal),  { x: R - font.widthOfTextAtSize(fmt(subtotal), 9) - 5, y, size: 9, font, color: black });
    y -= 30;

    // ── Totals ────────────────────────────────────────────────────────────────
    const drawRow = (label, value, bold = false, lineAbove = false) => {
      const f = bold ? fontBold : font;
      const sz = bold ? 11 : 9;
      if (lineAbove) {
        page.drawLine({ start: { x: 340, y: y + 14 }, end: { x: R, y: y + 14 }, thickness: 0.5, color: gray });
      }
      page.drawText(label, { x: 340, y, size: sz, font: f, color: bold ? purple : black });
      page.drawText(value, { x: R - f.widthOfTextAtSize(value, sz) - 5, y, size: sz, font: f, color: bold ? purple : black });
      y -= bold ? 18 : 14;
    };

    drawRow('Subtotal:', fmt(subtotal));
    if (isIntraState) {
      drawRow('CGST (9%):', fmt(cgstAmount));
      drawRow('SGST (9%):', fmt(sgstAmount));
    } else {
      drawRow('IGST (18%):', fmt(igstAmount));
    }
    drawRow('Total Amount:', fmt(totalWithGst), true, true);

    y -= 20;

    // ── Bank & UPI ────────────────────────────────────────────────────────────
    // FIX (layout): guard this whole block so it never starts too close to
    // the bottom of the page — if there isn't room, it moves to a fresh page
    // instead of drawing partially off-canvas.
    ensureSpace(150);

    page.drawLine({ start: { x: L, y }, end: { x: R, y }, thickness: 1, color: gold });
    y -= 18;

    page.drawRectangle({ x: L, y: y - 60, width: 240, height: 75, color: lightGray });
    page.drawText('Bank Details', { x: L + 8, y, size: 10, font: fontBold, color: purple });
    y -= 14;
    const bankLines = [
      'Bank: Axis Bank',
      'A/C: 925020055368236',
      'IFSC: UTIB0001837',
      'Holder: Ankshaastra Occult Experts LLP',
      'Branch: Agra Road',
    ];
    for (const line of bankLines) {
      page.drawText(line, { x: L + 8, y, size: 8, font, color: gray });
      y -= 11;
    }

    const upiY = y + 60;
    page.drawRectangle({ x: 310, y: upiY - 35, width: 245, height: 50, color: lightGray });
    page.drawText('UPI Payment', { x: 318, y: upiY, size: 10, font: fontBold, color: purple });
    page.drawText('UPI ID: razorpay.me/@ankshaastraoccultexpertsllp', { x: 318, y: upiY - 15, size: 7.5, font, color: gray });

    y -= 25;

    // ── Notes ─────────────────────────────────────────────────────────────────
    // FIX (layout): guard so the Notes box never starts too close to the
    // bottom margin.
    ensureSpace(90);

    page.drawRectangle({ x: L, y: y - 32, width: R - L, height: 44, color: rgb(1, 0.97, 0.88) });
    page.drawRectangle({ x: L, y: y - 32, width: 3, height: 44, color: rgb(1, 0.76, 0.03) });
    page.drawText('Notes', { x: L + 10, y, size: 10, font: fontBold, color: purple });
    y -= 13;
    page.drawText('Your personalized numerology report will be delivered within 24-48 hours.', { x: L + 10, y, size: 8, font, color: gray });
    y -= 11;
    page.drawText('Report will be sent to your registered WhatsApp number / email address.', { x: L + 10, y, size: 8, font, color: gray });
    y -= 25;

    // ── Footer ────────────────────────────────────────────────────────────────
    // FIX (content + layout): the previous footer only had two generic
    // lines ("Thank you for your business!" + a short computer-generated
    // notice) and did not match the mandated footer text at all. It is
    // replaced here with the exact required footer content. The block's
    // total height is computed up-front (including wrapped long sentences)
    // so `ensureSpace()` can guarantee the ENTIRE footer moves to a new
    // page together if it wouldn't otherwise fit — it never starts if it
    // can't finish, so it can never be cut mid-block.
    const FOOTER_SIZE = 8;
    const FOOTER_LINE_H = 11;
    const FOOTER_GAP_H = 6; // half-height spacer between footer paragraphs

    const footerSentence1 = wrapText(
      font,
      'This is a computer-generated invoice and does not require a physical signature.',
      FOOTER_SIZE,
      R - L,
    );
    const footerSentence2 = wrapText(
      font,
      'For support regarding this invoice or the associated service, please contact our customer support team.',
      FOOTER_SIZE,
      R - L,
    );

    // Each entry is either a text line ({text, bold}) or a spacer ({gap:true}).
    const footerEntries = [
      { text: 'Registered Address:', bold: true },
      { text: '5/56 A, Agarwal Marg,' },
      { text: 'Behind Sarsol Police Chowki,' },
      { text: 'Aligarh – 202001.' },
      { gap: true },
      { text: 'Corporate Address:', bold: true },
      { text: 'Unit No. O-622,' },
      { text: 'Block-E,' },
      { text: 'Eye of Noida,' },
      { text: 'Sector 140A,' },
      { text: 'Noida – 201305.' },
      { gap: true },
      ...footerSentence1.map((line) => ({ text: line })),
      { gap: true },
      ...footerSentence2.map((line) => ({ text: line })),
      { gap: true },
      { text: 'Ankshaastra Occult Experts LLP', bold: true },
      { text: 'GSTIN: 09AAFFE7583B1ZD' },
      { text: 'Email: service@ankshaastra.in' },
      { text: 'Website: www.ankshaastra.com' },
    ];

    const footerBlockHeight =
      12 /* divider + gap above */ +
      footerEntries.reduce((sum, e) => sum + (e.gap ? FOOTER_GAP_H : FOOTER_LINE_H), 0);

    ensureSpace(footerBlockHeight);

    page.drawLine({ start: { x: L, y }, end: { x: R, y }, thickness: 0.5, color: lightGray });
    y -= 14;

    for (const entry of footerEntries) {
      if (entry.gap) {
        y -= FOOTER_GAP_H;
        continue;
      }
      page.drawText(entry.text, {
        x: L,
        y,
        size: FOOTER_SIZE,
        font: entry.bold ? fontBold : font,
        color: entry.bold ? purple : gray,
      });
      y -= FOOTER_LINE_H;
    }

    // ── Terms & Conditions ────────────────────────────────────────────────────
    const termsAndConditions = [
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

    const termsFontSize = 7.5;
    const termsLineHeight = 10;
    const maxTermsWidth = R - L;

    // Wrap every clause up front so we know exactly how tall the whole
    // block is before drawing a single line of it.
    const wrappedTermsLines = termsAndConditions.flatMap((clause) =>
      wrapText(font, clause, termsFontSize, maxTermsWidth),
    );

    // FIX (layout): previously there was no check here at all — this is the
    // block that was actually being clipped. `ensureSpace()` now guarantees
    // the "TERMS & CONDITIONS" heading and every one of the 9 clauses move
    // to a new page together if the current page doesn't have room left,
    // so the block is never split mid-clause and never runs off the page.
    const termsBlockHeight = 22 /* divider + gap */ + 13 /* heading */ + wrappedTermsLines.length * termsLineHeight;
    ensureSpace(termsBlockHeight);

    page.drawLine({ start: { x: L, y }, end: { x: R, y }, thickness: 0.5, color: lightGray });
    y -= 14;
    page.drawText('TERMS & CONDITIONS', { x: L, y, size: 9, font: fontBold, color: purple });
    y -= 13;

    for (const line of wrappedTermsLines) {
      // Per-line safety net: guards against the terms block itself being
      // taller than a single blank page (not expected with this fixed
      // 9-clause text, but keeps the function correct if the clauses are
      // ever edited to be longer).
      ensureSpace(termsLineHeight);
      page.drawText(line, { x: L, y, size: termsFontSize, font, color: gray });
      y -= termsLineHeight;
    }

    // ── Page numbers (only stamped when the invoice spans multiple pages) ─────
    const totalPages = pdfDoc.getPageCount();
    if (totalPages > 1) {
      pdfDoc.getPages().forEach((p, idx) => {
        const label = `Page ${idx + 1} of ${totalPages}`;
        p.drawText(label, {
          x: width - 40 - font.widthOfTextAtSize(label, 7),
          y: 20,
          size: 7,
          font,
          color: gray,
        });
      });
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (err) {
    console.error('❌ generateInvoicePDFLocal error:', err.message);
    return null;
  }
}
