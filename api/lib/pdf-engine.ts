import { renderInvoiceHtml, type InvoiceTemplateData } from "./templates/invoice-html.js";

/** Renders invoice HTML to a PDF buffer via Puppeteer. */
export async function renderPdfFromHtml(html: string): Promise<Buffer> {
  let browser: Awaited<ReturnType<(typeof import("puppeteer-core"))["default"]["launch"]>> | undefined;

  try {
    const puppeteer = await import("puppeteer-core");
    const chromium = await import("@sparticuz/chromium");
    browser = await puppeteer.default.launch({
      args: chromium.default.args,
      defaultViewport: chromium.default.defaultViewport,
      executablePath: await chromium.default.executablePath(),
      headless: chromium.default.headless,
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" },
    });

    return Buffer.from(pdf);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown PDF rendering error";
    throw new Error(`Invoice PDF generation failed: ${message}`);
  } finally {
    await browser?.close();
  }
}

export async function generateInvoicePdf(data: InvoiceTemplateData): Promise<{ buffer: Buffer; html: string; mimeType: string }> {
  const html = renderInvoiceHtml(data);
  const buffer = await renderPdfFromHtml(html);
  const isPdf = buffer[0] === 0x25 && buffer[1] === 0x50; // %P
  if (!isPdf) throw new Error("Invoice PDF generation failed: renderer did not return a PDF buffer.");
  return { buffer, html, mimeType: "application/pdf" };
}
