import { describe, expect, it, vi } from "vitest";
import { generateInvoicePdf } from "../../server/lib/pdf-engine";
import type { InvoiceTemplateData } from "../../server/lib/templates/invoice-html";

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
  dueDate: "28/05/2026",
  businessName: "Ankshaastra Occult Experts LLP",
  customerName: "Test Customer",
  serviceTitle: "Test Service",
  sacCode: "999799",
  gstRate: 18,
  items: [{
    description: "Test Service",
    quantity: 1,
    unitPrice: 100,
    hsnSac: "999799",
    lineTotal: 118,
    taxableValue: 100,
    taxAmount: 18,
  }],
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

  it("falls back to pdf-lib when puppeteer does not return a PDF buffer", async () => {
    pdfMock.output = Buffer.from("<html>not a pdf</html>");

    const result = await generateInvoicePdf(invoiceData);

    expect(result.mimeType).toBe("application/pdf");
    expect(result.buffer.subarray(0, 4).toString()).toBe("%PDF");
  });
});
