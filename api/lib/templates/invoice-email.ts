import type { GstBreakdown } from '../gst.js';
import { DEFAULT_SAC_CODE } from '../invoice-constants.js';

function fmt(value: number) {
  return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildInvoicePaymentEmailHtml(input: {
  customerName: string;
  serviceTitle: string;
  invoiceNumber: string;
  gst: GstBreakdown;
  gstRate: number;
  sacCode?: string;
  placeOfSupply?: string;
  paymentMethod?: string;
  transactionId?: string;
  orderDetailsHtml?: string;
  downloadLinkHtml?: string;
}): string {
  const sac = input.sacCode || DEFAULT_SAC_CODE;
  const taxRows = input.gst.isIntraState
    ? `<tr><td style="padding:8px 12px;border-top:1px solid #e5e7eb;">CGST @ ${input.gstRate / 2}%</td><td style="padding:8px 12px;border-top:1px solid #e5e7eb;text-align:right;">₹${fmt(input.gst.cgst)}</td></tr>
       <tr><td style="padding:8px 12px;">SGST @ ${input.gstRate / 2}%</td><td style="padding:8px 12px;text-align:right;">₹${fmt(input.gst.sgst)}</td></tr>`
    : `<tr><td style="padding:8px 12px;border-top:1px solid #e5e7eb;">IGST @ ${input.gstRate}%</td><td style="padding:8px 12px;border-top:1px solid #e5e7eb;text-align:right;">₹${fmt(input.gst.igst)}</td></tr>`;

  return `
    <p style="margin:0 0 16px;font-size:16px;color:#4b77be;font-weight:700;">Payment Successful</p>
    <p style="margin:0 0 12px;">Dear ${escapeHtml(input.customerName)},</p>
    <p style="margin:0 0 16px;">Thank you for your payment for <strong>${escapeHtml(input.serviceTitle)}</strong>. Your invoice <strong>${escapeHtml(input.invoiceNumber)}</strong> is attached with this email.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #d9dee7;border-radius:8px;overflow:hidden;margin:0 0 18px;font-size:14px;">
      <tr style="background:#f3f5f8;">
        <td colspan="2" style="padding:12px 16px;font-weight:700;color:#111827;">Invoice Summary</td>
      </tr>
      <tr>
        <td style="padding:10px 16px;border-top:1px solid #e5e7eb;">Service</td>
        <td style="padding:10px 16px;border-top:1px solid #e5e7eb;text-align:right;">${escapeHtml(input.serviceTitle)}<br/><span style="color:#6b7280;font-size:12px;">SAC: ${escapeHtml(sac)}</span></td>
      </tr>
      ${input.placeOfSupply ? `<tr><td style="padding:10px 16px;border-top:1px solid #e5e7eb;">Place of Supply</td><td style="padding:10px 16px;border-top:1px solid #e5e7eb;text-align:right;">${escapeHtml(input.placeOfSupply)}</td></tr>` : ''}
      <tr><td style="padding:10px 16px;border-top:1px solid #e5e7eb;">Taxable Amount</td><td style="padding:10px 16px;border-top:1px solid #e5e7eb;text-align:right;">₹${fmt(input.gst.subtotal)}</td></tr>
      ${taxRows}
      <tr><td style="padding:10px 16px;border-top:1px solid #e5e7eb;font-weight:700;">Total Paid</td><td style="padding:10px 16px;border-top:1px solid #e5e7eb;text-align:right;font-weight:700;color:#111827;">₹${fmt(input.gst.grandTotal)}</td></tr>
    </table>

    ${input.paymentMethod ? `<p style="margin:0 0 8px;font-size:14px;"><strong>Payment Method:</strong> ${escapeHtml(input.paymentMethod)}</p>` : ''}
    ${input.transactionId ? `<p style="margin:0 0 16px;font-size:14px;"><strong>Transaction ID:</strong> ${escapeHtml(input.transactionId)}</p>` : ''}
    <p style="margin:0 0 16px;padding:10px 14px;background:#ecfdf3;border:1px solid #bbf7d0;border-radius:8px;color:#166534;font-weight:700;">✓ Amount Paid</p>
    ${input.orderDetailsHtml || ''}
    ${input.downloadLinkHtml || ''}
    <p style="margin-top:20px;">Thank you for choosing Ankshaastra Occult Experts LLP.</p>
  `;
}
