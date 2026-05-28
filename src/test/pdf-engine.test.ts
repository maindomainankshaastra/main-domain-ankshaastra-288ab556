import { describe, expect, it, vi } from "vitest";
import { generateInvoicePdf } from "../../api/lib/pdf-engine";
import type { InvoiceTemplateData } from "../../api/lib/templates/invoice-html";

const pdfMock = vi.hoisted(() => ({
  output: Buffer.from("%PDF-1.4\nmock"),
  close: vi.fn(),
  setContent: vi.fn(),
  pdf: vi.fn(),
}));

vi.mock("puppeteer-core", () => ({
  default: {
    launch: vi.fn(async () => ({
      newPage: vi.fn(async () => ({
        setContent: pdfMock.setContent,
        pdf: pdfMock.pdf.mockImplementation(async () => pdfMock.output),
      })),
      close: pdfMock.close,
    })),
  },
}));

vi.mock("@sparticuz/chromium", () => ({
  default: {
    args: [],
    defaultViewport: { width: 1280, height: 720 },
    executablePath: vi.fn(async () => "/mock/chromium"),
    headless: true,
  },
}));

const invoiceData: InvoiceTemplateData = {
  invoiceNumber: "INV-TEST-00001",
  invoiceDate: "28/05/2026",
  businessName: "Ankshaastra",
  customerName: "Test Customer",
  serviceTitle: "Test Service",
  items: [{ description: "Test Service", quantity: 1, unitPrice: 100, lineTotal: 100 }],
  gst: {
    subtotal: 100,
    gstTotal: 18,
    cgst: 9,
    sgst: 9,
    igst: 0,
    grandTotal: 118,
    isIntraState: true,
  },
  status: "PAID",
};

describe("generateInvoicePdf", () => {
  it("returns only a PDF mime type when the renderer returns a PDF buffer", async () => {
    pdfMock.output = Buffer.from("%PDF-1.4\nmock");

    const result = await generateInvoicePdf(invoiceData);

    expect(result.mimeType).toBe("application/pdf");
    expect(result.buffer.subarray(0, 4).toString()).toBe("%PDF");
    expect(result.html).toContain("INV-TEST-00001");
    expect(pdfMock.close).toHaveBeenCalled();
  });

  it("throws instead of falling back to HTML when the renderer does not return a PDF", async () => {
    pdfMock.output = Buffer.from("<html>not a pdf</html>");

    await expect(generateInvoicePdf(invoiceData)).rejects.toThrow("renderer did not return a PDF buffer");
  });
});
