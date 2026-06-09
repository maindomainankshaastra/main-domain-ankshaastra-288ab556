import type { GstBreakdown } from '../gst.js';

export type InvoiceTemplateData = {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  businessName: string;
  businessGstin?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessWebsite?: string;
  businessStateName?: string;
  logoUrl?: string;
  customerName: string;
  purchasedByName?: string;
  serviceSubjects?: Array<{ person_index: number; full_name: string }>;
  customerEmail?: string;
  customerPhone?: string;
  customerBillingAddress?: string;
  customerCity?: string;
  customerState?: string;
  customerPincode?: string;
  placeOfSupply?: string;
  serviceTitle: string;
  sacCode: string;
  gstRate: number;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    hsnSac?: string;
    lineTotal: number;
    taxableValue: number;
    taxAmount: number;
  }>;
  gst: GstBreakdown;
  paymentMethod?: string;
  transactionId?: string;
  qrCodeDataUrl?: string;
  status: string;
  amountInWords?: string;
  bankName?: string;
  bankAccountHolder?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankBranch?: string;
  thankYouMessage?: string;
  invoiceFooter?: string;
  termsConditions?: string;
};

export function renderInvoiceHtml(data: InvoiceTemplateData): string {
  const item = data.items[0];
  const taxLabel = data.gst.isIntraState ? 'CGST + SGST' : 'IGST';
  const taxPercent = `${data.gstRate}%`;
  const taxRows = data.gst.isIntraState
    ? `
      <tr><td style="padding:8px 12px;border-top:1px solid #d9dee7;">CGST @ ${data.gstRate / 2}%</td><td style="padding:8px 12px;border-top:1px solid #d9dee7;text-align:right;">₹${fmt(data.gst.cgst)}</td></tr>
      <tr><td style="padding:8px 12px;">SGST @ ${data.gstRate / 2}%</td><td style="padding:8px 12px;text-align:right;">₹${fmt(data.gst.sgst)}</td></tr>`
    : `<tr><td style="padding:8px 12px;border-top:1px solid #d9dee7;">IGST @ ${taxPercent}</td><td style="padding:8px 12px;border-top:1px solid #d9dee7;text-align:right;">₹${fmt(data.gst.igst)}</td></tr>`;

  const billingLines = [
    data.customerCity,
    data.customerState,
    data.customerPincode ? `Pincode: ${data.customerPincode}` : '',
  ]
    .filter(Boolean)
    .map((line) => `<div>${escape(line)}</div>`)
    .join('');

  const purchasedBy = data.purchasedByName || data.customerName;
  const subjects = data.serviceSubjects || [];
  const subjectBlock =
    subjects.length === 0
      ? ''
      : subjects.length === 1
        ? `<div style="margin-top:8px;"><strong>Service Subject:</strong> ${escape(subjects[0].full_name)}</div>`
        : `<div style="margin-top:8px;"><strong>Service Subjects:</strong><ol style="margin:6px 0 0 18px;padding:0;">${subjects
            .map((s) => `<li>${escape(s.full_name)}</li>`)
            .join('')}</ol></div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Tax Invoice ${escape(data.invoiceNumber)}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 24px; font-family: Arial, Helvetica, sans-serif; color: #222; background: #fff; }
  .page { max-width: 820px; margin: 0 auto; }
  .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
  .tax-title { color: #4b77be; font-size: 28px; font-weight: 700; letter-spacing: 0.5px; }
  .page-no { color: #666; font-size: 13px; }
  .header { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 22px; }
  .company h1 { margin: 0 0 10px; font-size: 24px; font-weight: 800; text-transform: uppercase; }
  .company p { margin: 0 0 4px; font-size: 12px; line-height: 1.5; color: #333; }
  .logo { width: 110px; height: 110px; object-fit: contain; }
  .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 18px; font-size: 12px; }
  .meta-grid strong { display: block; color: #666; font-size: 11px; margin-bottom: 4px; text-transform: uppercase; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 16px; font-size: 12px; }
  .section-title { font-weight: 700; margin-bottom: 8px; font-size: 13px; }
  .supply { margin-bottom: 18px; font-size: 12px; }
  table.items { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 18px; }
  table.items th { background: #f3f5f8; border: 1px solid #d9dee7; padding: 10px 8px; text-align: left; font-weight: 700; }
  table.items td { border: 1px solid #d9dee7; padding: 10px 8px; vertical-align: top; }
  .num { text-align: right; white-space: nowrap; }
  .totals-wrap { display: flex; justify-content: space-between; gap: 24px; margin-top: 8px; }
  .totals { width: 320px; margin-left: auto; font-size: 12px; }
  .totals table { width: 100%; border-collapse: collapse; }
  .totals td { padding: 8px 12px; }
  .paid { margin-top: 14px; font-size: 13px; font-weight: 700; color: #1f7a1f; }
  .footer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 28px; font-size: 12px; }
  .bank p { margin: 0 0 4px; }
  .signatory { text-align: right; margin-top: 40px; }
  .terms { margin-top: 24px; font-size: 11px; color: #666; }
</style>
</head>
<body>
<div class="page">
  <div class="top-bar">
    <div class="tax-title">TAX INVOICE</div>
    <div class="page-no">1</div>
  </div>

  <div class="header">
    <div class="company">
      <h1>${escape(data.businessName)}</h1>
      ${data.businessGstin ? `<p><strong>GSTIN</strong> ${escape(data.businessGstin)}</p>` : ''}
      ${data.businessAddress ? `<p>${escape(data.businessAddress)}</p>` : ''}
      ${data.businessPhone ? `<p><strong>Mobile</strong> ${escape(data.businessPhone)}</p>` : ''}
      ${data.businessEmail ? `<p><strong>Email</strong> ${escape(data.businessEmail)}</p>` : ''}
      ${data.businessWebsite ? `<p><strong>Website</strong> ${escape(data.businessWebsite)}</p>` : ''}
    </div>
    ${data.logoUrl ? `<img class="logo" src="${escapeAttr(data.logoUrl)}" alt="Logo" />` : ''}
  </div>

  <div class="meta-grid">
    <div><strong>Invoice #</strong>${escape(data.invoiceNumber)}</div>
    <div><strong>Invoice Date</strong>${escape(data.invoiceDate)}</div>
    <div><strong>Due Date</strong>${escape(data.dueDate)}</div>
  </div>

  <div class="two-col">
    <div>
      <div class="section-title">Customer Details</div>
      <div><strong>Purchased By</strong> ${escape(purchasedBy)}</div>
      ${subjectBlock}
      ${data.customerPhone ? `<div style="margin-top:8px;"><strong>Phone</strong> ${escape(data.customerPhone)}</div>` : ''}
      ${data.customerEmail ? `<div><strong>Email</strong> ${escape(data.customerEmail)}</div>` : ''}
    </div>
    <div>
      <div class="section-title">Billing Address</div>
      ${billingLines || (data.customerBillingAddress ? `<div>${escape(data.customerBillingAddress)}</div>` : '<div>—</div>')}
    </div>
  </div>

  ${data.placeOfSupply ? `<div class="supply"><strong>Place of Supply:</strong> ${escape(data.placeOfSupply)}</div>` : ''}

  <table class="items">
    <thead>
      <tr>
        <th style="width:28px;">#</th>
        <th>Item</th>
        <th class="num">Rate / Item</th>
        <th class="num">Qty</th>
        <th class="num">Taxable Value</th>
        <th class="num">Tax Amount</th>
        <th class="num">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>
          <strong>${escape(item.description)}</strong><br/>
          <span style="color:#666;">SAC: ${escape(item.hsnSac || data.sacCode)}</span>
        </td>
        <td class="num">₹${fmt(item.unitPrice)}</td>
        <td class="num">${item.quantity} QTY</td>
        <td class="num">₹${fmt(item.taxableValue)}</td>
        <td class="num">₹${fmt(item.taxAmount)}<br/><span style="color:#666;">(${taxPercent})</span></td>
        <td class="num">₹${fmt(item.lineTotal)}</td>
      </tr>
    </tbody>
  </table>

  <div class="totals-wrap">
    <div></div>
    <div class="totals">
      <table>
        <tr><td>Taxable Amount</td><td class="num">₹${fmt(data.gst.subtotal)}</td></tr>
        ${taxRows}
        <tr><td style="font-weight:700;border-top:1px solid #d9dee7;">Total</td><td class="num" style="font-weight:700;border-top:1px solid #d9dee7;">₹${fmt(data.gst.grandTotal)}</td></tr>
      </table>
      ${data.amountInWords ? `<div style="margin-top:12px;font-size:11px;color:#555;">Total amount (in words): ${escape(data.amountInWords)}</div>` : ''}
      <div class="paid">✓ Amount Paid</div>
      ${data.thankYouMessage ? `<div style="margin-top:12px;font-size:12px;color:#333;line-height:1.5;">${formatMultiline(data.thankYouMessage)}</div>` : ''}
    </div>
  </div>

  <div class="footer-grid">
    <div class="bank">
      <div class="section-title">Bank Details</div>
      ${data.bankName ? `<p><strong>Bank Name:</strong> ${escape(data.bankName)}</p>` : ''}
      ${data.bankAccountHolder ? `<p><strong>Account Holder Name:</strong> ${escape(data.bankAccountHolder)}</p>` : ''}
      ${data.bankAccountNumber ? `<p><strong>Account #:</strong> ${escape(data.bankAccountNumber)}</p>` : ''}
      ${data.bankIfsc ? `<p><strong>IFSC Code:</strong> ${escape(data.bankIfsc)}</p>` : ''}
      ${data.bankBranch ? `<p><strong>Branch:</strong> ${escape(data.bankBranch)}</p>` : ''}
    </div>
    <div class="signatory">
      <div>For ${escape(data.businessName)}</div>
      <div style="margin-top:48px;font-weight:700;">Authorized Signatory</div>
    </div>
  </div>

  ${data.invoiceFooter ? `<div class="terms"><div class="section-title">Invoice Footer</div>${formatMultiline(data.invoiceFooter)}</div>` : ''}
  ${data.termsConditions ? `<div class="terms"><div class="section-title">Terms &amp; Conditions</div>${formatMultiline(data.termsConditions)}</div>` : ''}
</div>
</body>
</html>`;
}

function fmt(value: number) {
  return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function escape(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatMultiline(value: string) {
  return escape(value).replace(/\r?\n/g, '<br/>');
}

function escapeAttr(value: string) {
  return escape(value);
}
