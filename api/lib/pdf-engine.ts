import { renderInvoiceHtml, type InvoiceTemplateData } from './templates/invoice-html.js';
import { generateInvoicePdfWithPdfLib } from './pdf-lib-invoice.js';

function isPdfBuffer(buffer: Buffer): boolean {
  return buffer.length >= 4 && buffer.subarray(0, 4).toString() === '%PDF';
}

/** Renders invoice HTML to a PDF buffer via Puppeteer (may fail on serverless). */
export async function renderPdfFromHtml(html: string): Promise<Buffer> {
  let browser: any;

  try {
    const puppeteer = await import('puppeteer-core');
    const chromium = await import('@sparticuz/chromium');

    browser = await puppeteer.default.launch({
      args: chromium.default.args,
      defaultViewport: chromium.default.defaultViewport,
      executablePath: await chromium.default.executablePath(),
      headless: chromium.default.headless,
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        bottom: '15mm',
        left: '12mm',
        right: '12mm',
      },
    });

    const buffer = Buffer.from(pdf);
    if (!isPdfBuffer(buffer)) {
      throw new Error('Puppeteer renderer did not return a PDF buffer');
    }
    return buffer;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export async function generateInvoicePdf(
  data: InvoiceTemplateData,
): Promise<{
  buffer: Buffer;
  html: string;
  mimeType: string;
}> {
  const html = renderInvoiceHtml(data);

  let buffer: Buffer | null = null;
  let renderer = 'pdf-lib';

  try {
    buffer = await renderPdfFromHtml(html);
    renderer = 'puppeteer';
  } catch (puppeteerError) {
    console.warn('[pdf-engine] Puppeteer failed, using pdf-lib fallback:', puppeteerError);
    buffer = await generateInvoicePdfWithPdfLib(data);
  }

  if (!buffer || !isPdfBuffer(buffer)) {
    throw new Error('Invoice PDF generation failed: renderer did not return a valid PDF buffer');
  }

  console.log(`[pdf-engine] Generated invoice ${data.invoiceNumber} via ${renderer} (${buffer.length} bytes)`);

  return {
    buffer,
    html,
    mimeType: 'application/pdf',
  };
}
