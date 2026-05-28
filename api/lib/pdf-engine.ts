import { renderInvoiceHtml, type InvoiceTemplateData } from './templates/invoice-html.js';

/** Renders invoice HTML to a PDF buffer via Puppeteer. */
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

    return Buffer.from(pdf);
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
  const buffer = await renderPdfFromHtml(html);

  return {
    buffer,
    html,
    mimeType: 'application/pdf',
  };
}

