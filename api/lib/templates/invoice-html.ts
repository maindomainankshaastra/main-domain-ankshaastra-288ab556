import type { GstBreakdown } from "../gst.js";

export type InvoiceTemplateData = {
  invoiceNumber: string;
  invoiceDate: string;
  businessName: string;
  businessGstin?: string;
  businessAddress?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerGstin?: string;
  serviceTitle: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    hsnSac?: string;
    lineTotal: number;
  }>;
  gst: GstBreakdown;
  paymentMethod?: string;
  transactionId?: string;
  qrCodeDataUrl?: string;
  status: string;
  termsFooter?: string;
};

export function renderInvoiceHtml(data: InvoiceTemplateData): string {
  const itemRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #2a2a2a;color:#e8e8e8">${escape(item.description)}</td>
        <td style="padding:12px;border-bottom:1px solid #2a2a2a;color:#9ca3af;text-align:center">${item.quantity}</td>
        <td style="padding:12px;border-bottom:1px solid #2a2a2a;color:#9ca3af;text-align:right">₹${fmt(item.unitPrice)}</td>
        <td style="padding:12px;border-bottom:1px solid #2a2a2a;color:#d4af37;text-align:right;font-weight:600">₹${fmt(item.lineTotal)}</td>
      </tr>`
    )
    .join("");

  const taxRows = data.gst.isIntraState
    ? `<tr><td style="color:#9ca3af">CGST</td><td style="text-align:right;color:#e8e8e8">₹${fmt(data.gst.cgst)}</td></tr>
       <tr><td style="color:#9ca3af">SGST</td><td style="text-align:right;color:#e8e8e8">₹${fmt(data.gst.sgst)}</td></tr>`
    : `<tr><td style="color:#9ca3af">IGST</td><td style="text-align:right;color:#e8e8e8">₹${fmt(data.gst.igst)}</td></tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${escape(data.invoiceNumber)}</title>
  <style>@page { size: A4; margin: 16mm; } body { margin: 0; font-family: Georgia, 'Segoe UI', serif; background: #0a0a0a; color: #f5f5f5; }</style>
</head>
<body>
  <div style="max-width:800px;margin:0 auto;padding:40px;background:linear-gradient(145deg,#0d0d0d,#1a1a1a);border:1px solid #d4af37">
    <table width="100%"><tr>
      <td><div style="font-size:28px;font-weight:700;color:#d4af37;letter-spacing:2px">ANKSHAASTRA</div>
          <div style="font-size:11px;color:#9ca3af;margin-top:4px">Luxury Spiritual Consultancy & Products</div></td>
      <td style="text-align:right"><div style="font-size:22px;font-weight:600;color:#d4af37">TAX INVOICE</div>
          <div style="font-size:13px;color:#9ca3af;margin-top:8px">${escape(data.invoiceNumber)}</div>
          <div style="font-size:12px;color:#6b7280">${escape(data.invoiceDate)}</div></td>
    </tr></table>
    <div style="height:1px;background:linear-gradient(90deg,transparent,#d4af37,transparent);margin:24px 0"></div>
    <table width="100%" style="margin-bottom:24px"><tr>
      <td width="50%"><div style="font-size:10px;color:#d4af37;text-transform:uppercase;margin-bottom:8px">From</div>
          <div style="font-weight:600">${escape(data.businessName)}</div>
          ${data.businessGstin ? `<div style="font-size:12px;color:#9ca3af">GSTIN: ${escape(data.businessGstin)}</div>` : ""}
          ${data.businessAddress ? `<div style="font-size:12px;color:#9ca3af">${escape(data.businessAddress)}</div>` : ""}</td>
      <td width="50%" style="text-align:right"><div style="font-size:10px;color:#d4af37;text-transform:uppercase;margin-bottom:8px">Bill To</div>
          <div style="font-weight:600">${escape(data.customerName)}</div>
          ${data.customerEmail ? `<div style="font-size:12px;color:#9ca3af">${escape(data.customerEmail)}</div>` : ""}
          ${data.customerPhone ? `<div style="font-size:12px;color:#9ca3af">${escape(data.customerPhone)}</div>` : ""}</td>
    </tr></table>
    <table width="100%" style="margin-bottom:24px"><thead><tr style="background:#1a1a1a">
      <th style="padding:12px;text-align:left;color:#d4af37;font-size:11px">Description</th>
      <th style="padding:12px;color:#d4af37;font-size:11px">Qty</th>
      <th style="padding:12px;text-align:right;color:#d4af37;font-size:11px">Rate</th>
      <th style="padding:12px;text-align:right;color:#d4af37;font-size:11px">Amount</th>
    </tr></thead><tbody>${itemRows}</tbody></table>
    <table width="100%"><tr>
      <td width="55%">${data.qrCodeDataUrl ? `<img src="${data.qrCodeDataUrl}" width="100" height="100" alt="QR" />` : ""}
        <div style="font-size:11px;color:#6b7280;margin-top:12px">Payment: ${escape(data.paymentMethod || "Online")}
        ${data.transactionId ? `<br/>Txn: ${escape(data.transactionId)}` : ""}</div>
        <div style="margin-top:16px;border:1px solid #d4af37;color:#d4af37;padding:8px 12px;display:inline-block;font-size:11px">${escape(data.status)}</div></td>
      <td width="45%"><table width="100%">
        <tr><td style="color:#9ca3af">Subtotal</td><td style="text-align:right">₹${fmt(data.gst.subtotal)}</td></tr>
        <tr><td style="color:#9ca3af">GST</td><td style="text-align:right">₹${fmt(data.gst.gstTotal)}</td></tr>
        ${taxRows}
        <tr><td style="padding-top:12px;font-weight:700;color:#d4af37">Grand Total</td>
            <td style="padding-top:12px;text-align:right;font-size:18px;font-weight:700;color:#d4af37">₹${fmt(data.gst.grandTotal)}</td></tr>
      </table></td>
    </tr></table>
    <div style="margin-top:32px;font-size:10px;color:#6b7280;border-top:1px solid #2a2a2a;padding-top:16px">
      ${escape(data.termsFooter || "Computer-generated invoice. Thank you for choosing Ankshaastra.")}
    </div>
  </div>
</body>
</html>`;
}

function escape(s: string): string {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function fmt(n: number): string {
  return Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
