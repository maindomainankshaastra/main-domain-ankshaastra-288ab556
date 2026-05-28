import { getSupabaseAdmin } from './supabase-admin.js';
import { calculateGst, nextInvoiceNumber } from './gst.js';
import { type InvoiceTemplateData } from './templates/invoice-html.js';
import { generateInvoicePdf } from './pdf-engine.js';
import { sendEmail, type SendEmailInput } from './email-engine.js';
import { advanceWorkflow } from './workflow-engine.js';
import { downloadInvoicePdfBuffer, invoiceStoragePath, uploadInvoicePdf } from './invoice-storage.js';

import { wrapEmailLayout } from './templates/email-layout.js';

export type GenerateInvoiceInput = {
  orderId: string;
  paymentId?: string;
  paymentMethod?: string;
};

export async function upsertCustomerFromOrder(order: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  const email = order.customer_email as string | undefined;
  const phone = order.customer_phone as string | undefined;
  const name = (order.customer_name as string) || 'Customer';

  if (order.customer_id) return order.customer_id as string;

  let query = supabase.from('customers').select('id');
  if (email) query = query.eq('email', email);
  else if (phone) query = query.eq('phone', phone);
  const { data: existing } = await query.maybeSingle();

  if (existing?.id) {
    await supabase.from('orders').update({ customer_id: existing.id }).eq('id', order.id);
    return existing.id;
  }

  const { data: created } = await supabase
    .from('customers')
    .insert({
      full_name: name,
      email,
      phone,
      whatsapp: phone,
      source_website: order.source_website || 'ankshaastra.com',
      user_id: order.user_id || null,
    })
    .select('id')
    .single();

  if (created?.id) await supabase.from('orders').update({ customer_id: created.id }).eq('id', order.id);
  return created?.id;
}

async function resolveInvoiceUserId(
  order: Record<string, unknown>,
  customerId?: string | null,
): Promise<string | null> {
  if (order.user_id) return order.user_id as string;

  const supabase = getSupabaseAdmin();

  if (customerId) {
    const { data: customer } = await supabase.from('customers').select('user_id').eq('id', customerId).maybeSingle();
    if (customer?.user_id) return customer.user_id;
  }

  const email = order.customer_email ? String(order.customer_email).toLowerCase() : '';
  if (email) {
    const { data: profile } = await supabase.from('profiles').select('user_id').ilike('email', email).maybeSingle();
    if (profile?.user_id) return profile.user_id;
  }

  return null;
}

async function getInvoiceAttachment(invoice: Record<string, unknown>): Promise<SendEmailInput['attachments']> {
  const storagePath = invoice.pdf_storage_path as string | undefined;
  if (!storagePath) {
    console.warn('[invoice] Missing pdf_storage_path on invoice:', invoice?.id);
    return undefined;
  }

  try {
    const bytes = await downloadInvoicePdfBuffer(storagePath);
    if (!bytes) {
      console.error('[invoice] Failed to download invoice pdf from storage:', storagePath);
      return undefined;
    }

    const invoiceNumber = String(invoice.invoice_number || invoice.id || 'invoice').replace(/[^\w.-]+/g, '_');

    return [
      {
        filename: `${invoiceNumber}.pdf`,
        content: bytes,
        contentType: 'application/pdf',
      },
    ];
  } catch (e) {
    console.error('[invoice] getInvoiceAttachment threw:', e);
    return undefined;
  }
}

export async function generateInvoiceForOrder(input: GenerateInvoiceInput) {
  const supabase = getSupabaseAdmin();
  const { data: order, error } = await supabase.from('orders').select('*').eq('id', input.orderId).single();
  if (error || !order) throw new Error('Order not found');

  const customerId = await upsertCustomerFromOrder(order);
  const { data: existing } = await supabase
    .from('invoices')
    .select('id, invoice_number, pdf_storage_path')
    .eq('order_id', order.id)
    .maybeSingle();

  if (existing?.pdf_storage_path) {
    return { invoiceId: existing.id, invoiceNumber: existing.invoice_number, duplicate: true };
  }

  if (existing?.id && !existing.pdf_storage_path) {
    await supabase.from('invoices').delete().eq('id', existing.id);
  }

  const { data: gstConfig } = await supabase.from('gst_config').select('*').limit(1).single();
  const gst = calculateGst({
    amount: Number(order.total_amount),
    gstRate: 18,
    isGstInclusive: gstConfig?.is_gst_inclusive_default ?? true,
    businessStateCode: gstConfig?.state_code || '27',
    customerStateCode: order.metadata?.state_code,
  });

  const invoiceNumber = await nextInvoiceNumber(supabase);
  const qrPayload = `upi://pay?pa=${gstConfig?.upi_id || 'ankshaastra@upi'}&am=${gst.grandTotal}&tn=${invoiceNumber}`;

  let qrCodeDataUrl: string | undefined;
  try {
    const QRCode = await import('qrcode');
    qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      margin: 1,
      width: 120,
      color: { dark: '#d4af37', light: '#0a0a0a' },
    });
  } catch {
    /* optional */
  }

  const templateData: InvoiceTemplateData = {
    invoiceNumber,
    invoiceDate: new Date().toLocaleDateString('en-IN'),
    businessName: gstConfig?.business_name || 'Ankshaastra',
    businessGstin: gstConfig?.gstin,
    businessAddress: gstConfig?.address,
    customerName: order.customer_name || 'Customer',
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    serviceTitle: order.service_title,
    items: [{ description: order.service_title, quantity: 1, unitPrice: gst.subtotal, lineTotal: gst.subtotal }],
    gst,
    paymentMethod: input.paymentMethod || order.payment_method || 'Razorpay',
    transactionId: input.paymentId || order.razorpay_payment_id,
    qrCodeDataUrl,
    status: 'PAID',
    termsFooter: gstConfig?.terms_footer,
  };

  const { buffer, mimeType } = await generateInvoicePdf(templateData);
  const storagePath = invoiceStoragePath(invoiceNumber);

  const pdfUrl = await uploadInvoicePdf(storagePath, buffer, mimeType);
  const invoiceUserId = await resolveInvoiceUserId(order, customerId);

  if (invoiceUserId && !order.user_id) {
    await supabase.from('orders').update({ user_id: invoiceUserId }).eq('id', order.id);
  }

  const { data: invoice, error: invErr } = await supabase
    .from('invoices')
    .insert({
      invoice_number: invoiceNumber,
      order_id: order.id,
      user_id: invoiceUserId,
      customer_id: customerId,
      customer_name: order.customer_name || 'Customer',
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      service_title: order.service_title,
      base_amount: gst.subtotal,
      subtotal: gst.subtotal,
      gst_total: gst.gstTotal,
      cgst_rate: gst.isIntraState ? 9 : 0,
      cgst_amount: gst.cgst,
      sgst_rate: gst.isIntraState ? 9 : 0,
      sgst_amount: gst.sgst,
      igst_rate: gst.isIntraState ? 0 : 18,
      igst_amount: gst.igst,
      total_amount: gst.grandTotal,
      gst_inclusive: true,
      status: 'paid',
      source_website: order.source_website,
      payment_method: input.paymentMethod || order.payment_method || 'razorpay',
      razorpay_payment_id: input.paymentId || order.razorpay_payment_id,
      qr_code_data: qrPayload,
      pdf_url: pdfUrl,
      pdf_storage_path: storagePath,
    })
    .select('*')
    .single();

  if (invErr) throw invErr;

  await supabase.from('invoice_items').insert({
    invoice_id: invoice.id,
    description: order.service_title,
    quantity: 1,
    unit_price: gst.subtotal,
    taxable_amount: gst.subtotal,
    gst_rate: 18,
    cgst_amount: gst.cgst,
    sgst_amount: gst.sgst,
    igst_amount: gst.igst,
    line_total: gst.grandTotal,
  });

  if (input.paymentId) {
    await supabase.from('payments').insert({
      order_id: order.id,
      invoice_id: invoice.id,
      customer_id: customerId,
      amount: gst.grandTotal,
      provider: 'razorpay',
      provider_payment_id: input.paymentId,
      provider_order_id: order.razorpay_order_id,
      status: 'captured',
    });
  }

  await advanceWorkflow(order.id, 'invoice_generated', 'invoice.created', { invoiceId: invoice.id });
  return { invoiceId: invoice.id, invoiceNumber, invoice, pdfUrl, duplicate: false };
}

export async function deliverInvoice(invoiceId: string) {
  const supabase = getSupabaseAdmin();
  const { data: invoice } = await supabase.from('invoices').select('*, orders(*)').eq('id', invoiceId).single();
  if (!invoice) throw new Error('Invoice not found');

  const attachments = await getInvoiceAttachment(invoice);

  if (invoice.customer_email) {
    const downloadLink = invoice.pdf_url
      ? `<p>You can also <a href="${invoice.pdf_url}">download your invoice PDF</a>.</p>`
      : '';

    const customerHtml = wrapEmailLayout(`
      <h2>Payment Successful</h2>
      <p>Dear ${invoice.customer_name},</p>
      <p>Your payment has been received successfully.</p>
      <p>Your invoice is attached with this email.</p>
      ${downloadLink}
      <br />
      <p>Thank you for choosing Ankshaastra.</p>
    `);

    try {
      await sendEmail({
        to: invoice.customer_email,
        subject: `Invoice - ${invoice.invoice_number}`,
        html: customerHtml,
        attachments,
        templateSlug: 'invoice_email',
        customerId: invoice.customer_id,
        orderId: invoice.order_id,
        invoiceId: invoice.id,
      });
      if (invoice.order_id) await advanceWorkflow(invoice.order_id, 'email_sent', 'invoice.email_sent');
    } catch (emailErr) {
      console.error('[invoice] Customer email failed:', emailErr);
    }
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.INVOICE_ADMIN_EMAIL || '';
  if (adminEmail) {
    const adminHtml = wrapEmailLayout(`
      <h2>New Order Received</h2>
      <p><strong>Customer:</strong> ${invoice.customer_name}</p>
      <p><strong>Email:</strong> ${invoice.customer_email}</p>
      <p><strong>Amount:</strong> ₹${invoice.total_amount}</p>
      <p><strong>Invoice:</strong> ${invoice.invoice_number}</p>
    `);

    try {
      await sendEmail({
        to: adminEmail,
        subject: `New Order - ${invoice.invoice_number}`,
        html: adminHtml,
        attachments,
        templateSlug: 'invoice_admin',
        orderId: invoice.order_id,
        invoiceId: invoice.id,
      });
    } catch (emailErr) {
      console.error('[invoice] Admin email failed:', emailErr);
    }
  }

  if (invoice.order_id) {
    await advanceWorkflow(invoice.order_id, 'completed', 'invoice.delivery_completed');
  }

  return { ok: true };
}

export async function processInvoiceJob(orderId: string, opts?: { paymentId?: string; forceDeliver?: boolean }) {
  const result = await generateInvoiceForOrder({
    orderId,
    paymentId: opts?.paymentId,
  });

  if (result.invoiceId && (!result.duplicate || opts?.forceDeliver)) {
    await deliverInvoice(result.invoiceId);
  }
  return result;
}

