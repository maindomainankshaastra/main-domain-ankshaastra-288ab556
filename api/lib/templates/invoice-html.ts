import type { GstBreakdown } from '../gst.js';

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
        <td>${escape(item.description)}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">₹${fmt(item.unitPrice)}</td>
        <td style="text-align:right">₹${fmt(item.lineTotal)}</td>
      </tr>`
    )
    .join('');

  const taxRows = data.gst.isIntraState
    ? `
      <tr>
        <td>CGST</td>
        <td style="text-align:right">₹${fmt(data.gst.cgst)}</td>
      </tr>
      <tr>
        <td>SGST</td>
        <td style="text-align:right">₹${fmt(data.gst.sgst)}</td>
      </tr>`
    : `
      <tr>
        <td>IGST</td>
        <td style="text-align:right">₹${fmt(data.gst.igst)}</td>
      </tr>`;


  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Invoice ${escape(data.invoiceNumber)}</title>
<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background: #ffffff;
  padding: 20px;
  color: #333;
}

.invoice-container {
  max-width: 800px;
  margin: auto;
  padding: 30px;
  border: 1px solid #ddd;
}

.header {
  display: flex;
  justify-content: space-between;
  border-bottom: 2px solid #8B5CF6;
  padding-bottom: 20px;
  margin-bottom: 30px;
}

.company-info h1 {
  color: #8B5CF6;
  margin-bottom: 10px;
}

.company-info p,
.invoice-details p {
  font-size: 13px;
  margin-bottom: 5px;
}

.customer-section {
  margin-bottom: 30px;
}

.customer-section h3 {
  margin-bottom: 10px;
  color: #8B5CF6;
}

.invoice-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
}

.invoice-table th {
  background: #8B5CF6;
  color: white;
  padding: 12px;
  text-align: left;
}

.invoice-table td {
  border: 1px solid #ddd;
  padding: 12px;
}

.totals {
  width: 300px;
  margin-left: auto;
}

.totals table {
  width: 100%;
}

.totals td {
  padding: 8px;
}

.footer {
  margin-top: 40px;
  text-align: center;
  font-size: 12px;
  color: #666;
}
</style>
</head>
<body>
<div class="invoice-container">

<div class="header">
  <div class="company-info">
    <h1>${escape(data.businessName)}</h1>
    <p>${escape(data.businessAddress || '')}</p>
    <p>GSTIN: ${escape(data.businessGstin || '')}</p>
  </div>

  <div class="invoice-details">
    <h2>INVOICE</h2>
    <p><strong>Invoice:</strong> ${escape(data.invoiceNumber)}</p>
    <p><strong>Date:</strong> ${escape(data.invoiceDate)}</p>
    <p><strong>Status:</strong> ${escape(data.status)}</p>
  </div>
</div>

<div class="customer-section">
  <h3>Customer Details</h3>
  <p><strong>Name:</strong> ${escape(data.customerName)}</p>
  <p><strong>Email:</strong> ${escape(data.customerEmail || '')}</p>
  <p><strong>Phone:</strong> ${escape(data.customerPhone || '')}</p>
</div>

<table class="invoice-table">
<thead>
<tr>
  <th>Description</th>
  <th>Qty</th>
  <th>Price</th>
  <th>Total</th>
</tr>
</thead>
<tbody>
${itemRows}
</tbody>
</table>

<div class="totals">
<table>
<tr>
  <td>Subtotal</td>
  <td style="text-align:right">₹${fmt(data.gst.subtotal)}</td>

</tr>
${taxRows}
<tr>
  <td><strong>Grand Total</strong></td>
  <td style="text-align:right"><strong>₹${fmt(data.gst.grandTotal)}</strong></td>

</tr>
</table>
</div>

<div class="footer">
<p>Thank you for choosing Ankshaastra.</p>
<p>${escape(data.termsFooter || '')}</p>
</div>

</div>
</body>
</html>`;
}

function fmt(value: number) {
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function escape(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
}

