import { renderInvoiceHtml, type InvoiceTemplateData } from "./templates/invoice-html";

/** Renders invoice HTML to PDF buffer via Puppeteer (serverless-compatible). */
export async function renderPdfFromHtml(html: string): Promise<Buffer> {
  const usePuppeteer = process.env.PDF_ENGINE !== "html-only";

  if (usePuppeteer) {
    try {
      const puppeteer = await import("puppeteer-core");
      const chromium = await import("@sparticuz/chromium");
      const browser = await puppeteer.default.launch({
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
      await browser.close();
      return Buffer.from(pdf);
    } catch (e) {
      console.warn("Puppeteer PDF failed, storing HTML fallback:", e);
    }
  }

  // Fallback: return HTML as buffer for storage (admin can print to PDF)
  return Buffer.from(html, "utf-8");
}

export async function generateInvoicePdf(data: InvoiceTemplateData): Promise<{ buffer: Buffer; html: string; mimeType: string }> {
  const html = renderInvoiceHtml(data);
  const buffer = await renderPdfFromHtml(html);
  const isPdf = buffer[0] === 0x25 && buffer[1] === 0x50; // %P
  return { buffer, html, mimeType: isPdf ? "application/pdf" : "text/html" };
}
