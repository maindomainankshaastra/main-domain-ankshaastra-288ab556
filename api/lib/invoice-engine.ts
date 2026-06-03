import { getSupabaseAdmin } from './supabase-admin.js';
import { nextInvoiceNumber } from './gst.js';
import { type InvoiceTemplateData } from './templates/invoice-html.js';
import { buildInvoiceTemplateData, resolveCustomerBilling } from './build-invoice-template.js';
import { DEFAULT_SAC_CODE } from './invoice-constants.js';
import { generateInvoicePdf } from './pdf-engine.js';
import { sendEmail, type SendEmailInput } from './email-engine.js';
import { advanceWorkflow } from './workflow-engine.js';
import { downloadInvoicePdfBuffer, invoiceStoragePath, uploadInvoicePdf } from './invoice-storage.js';

import { wrapEmailLayout } from './templates/email-layout.js';
import { buildInvoicePaymentEmailHtml } from './templates/invoice-email.js';
import { buildOrderDetailsHtml } from './order-form-details.js';
import { buildInvoiceEmailSubject } from './schedule-invoice.js';

export type GenerateInvoiceInput = {
  orderId: string;
  paymentId?: string;
  paymentMethod?: string;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

async function getExistingInvoiceForOrder(orderId: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('invoices')
    .select('id, invoice_number, pdf_storage_path, pdf_url, status, order_id, razorpay_payment_id')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  return data;
}

async function getExistingInvoiceByPaymentId(paymentId: string) {
  if (!paymentId) return null;
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('invoices')
    .select('id, invoice_number, pdf_storage_path, pdf_url, status, order_id, razorpay_payment_id')
    .eq('razorpay_payment_id', paymentId)
    .maybeSingle();
  return data;
}

async function tryAcquireInvoiceLock(orderId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc('try_invoice_generation_lock', { p_order_id: orderId });
  if (error) {
    console.warn('[invoice] Advisory lock RPC unavailable, continuing without lock:', error.message);
    return true;
  }
  return Boolean(data);
}

async function waitForExistingInvoice(orderId: string, attempts = 8) {
  for (let i = 0; i < attempts; i++) {
    const existing = await getExistingInvoiceForOrder(orderId);
    if (existing?.pdf_storage_path || existing?.pdf_url) {
      return existing;
    }
    await sleep(400);
  }
  return null;
}

async function wasOrderInvoiceEmailSent(orderId: string, templateSlug: string): Promise<boolean> {
  if (!orderId) return false;
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('email_logs')
    .select('id')
    .eq('order_id', orderId)
    .eq('template_slug', templateSlug)
    .eq('status', 'sent')
    .limit(1)
    .maybeSingle();
  return Boolean(data?.id);
}

async function wasInvoiceEmailSent(invoiceId: string, templateSlug: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('email_logs')
    .select('id')
    .eq('invoice_id', invoiceId)
    .eq('template_slug', templateSlug)
    .eq('status', 'sent')
    .limit(1)
    .maybeSingle();
  return Boolean(data?.id);
}

export async function generateInvoiceForOrder(input: GenerateInvoiceInput) {
  const supabase = getSupabaseAdmin();
  const { data: order, error } = await supabase.from('orders').select('*').eq('id', input.orderId).single();
  if (error || !order) throw new Error('Order not found');

  const paymentId = input.paymentId || (order.razorpay_payment_id as string | undefined);

  if (paymentId) {
    const byPayment = await getExistingInvoiceByPaymentId(paymentId);
    if (byPayment?.pdf_storage_path || byPayment?.pdf_url) {
      return {
        invoiceId: byPayment.id,
        invoiceNumber: byPayment.invoice_number,
        duplicate: true,
        orderId: byPayment.order_id,
      };
    }
    if (byPayment?.id) {
      const waited = await waitForExistingInvoice(byPayment.order_id as string);
      if (waited?.id) {
        return {
          invoiceId: waited.id,
          invoiceNumber: waited.invoice_number,
          duplicate: true,
          orderId: waited.order_id,
        };
      }
      return {
        invoiceId: byPayment.id,
        invoiceNumber: byPayment.invoice_number,
        duplicate: true,
        skipped: true,
        orderId: byPayment.order_id,
      };
    }
  }

  const existing = await getExistingInvoiceForOrder(order.id);
  if (existing?.pdf_storage_path || existing?.pdf_url) {
    return { invoiceId: existing.id, invoiceNumber: existing.invoice_number, duplicate: true };
  }
  if (existing?.id) {
    const waited = await waitForExistingInvoice(order.id);
    if (waited?.id) {
      return { invoiceId: waited.id, invoiceNumber: waited.invoice_number, duplicate: true };
    }
    return {
      invoiceId: existing.id,
      invoiceNumber: existing.invoice_number,
      duplicate: true,
      skipped: true,
    };
  }

  const lockAcquired = await tryAcquireInvoiceLock(order.id);
  if (!lockAcquired) {
    const waited = await waitForExistingInvoice(order.id);
    if (waited?.id) {
      return { invoiceId: waited.id, invoiceNumber: waited.invoice_number, duplicate: true };
    }
    return { invoiceId: undefined, invoiceNumber: undefined, duplicate: true, skipped: true };
  }

  const afterLock = await getExistingInvoiceForOrder(order.id);
  if (afterLock?.pdf_storage_path || afterLock?.pdf_url) {
    return { invoiceId: afterLock.id, invoiceNumber: afterLock.invoice_number, duplicate: true };
  }

  const customerId = await upsertCustomerFromOrder(order);
  const { data: gstConfig } = await supabase.from('gst_config').select('*').limit(1).single();

  const invoiceNumber = await nextInvoiceNumber(supabase);
  const invoiceUserId = await resolveInvoiceUserId(order, customerId);

  if (invoiceUserId && !order.user_id) {
    await supabase.from('orders').update({ user_id: invoiceUserId }).eq('id', order.id);
  }

  const { templateData, gst } = buildInvoiceTemplateData({
    order,
    gstConfig,
    invoiceNumber,
    paymentId,
    paymentMethod: input.paymentMethod || (order.payment_method as string | undefined),
  });

  // Reserve invoice row BEFORE PDF generation so concurrent requests hit unique constraint.
  const { data: reserved, error: reserveErr } = await supabase
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
      cgst_rate: gst.isIntraState ? templateData.gstRate / 2 : 0,
      cgst_amount: gst.cgst,
      sgst_rate: gst.isIntraState ? templateData.gstRate / 2 : 0,
      sgst_amount: gst.sgst,
      igst_rate: gst.isIntraState ? 0 : templateData.gstRate,
      igst_amount: gst.igst,
      total_amount: gst.grandTotal,
      gst_inclusive: true,
      status: 'generating',
      source_website: order.source_website,
      payment_method: input.paymentMethod || order.payment_method || 'razorpay',
      razorpay_payment_id: paymentId || input.paymentId || order.razorpay_payment_id,
    })
    .select('id')
    .single();

  if (reserveErr) {
    if (reserveErr.code === '23505') {
      if (paymentId) {
        const dupByPayment = await getExistingInvoiceByPaymentId(paymentId);
        if (dupByPayment?.id) {
          return {
            invoiceId: dupByPayment.id,
            invoiceNumber: dupByPayment.invoice_number,
            duplicate: true,
            orderId: dupByPayment.order_id,
          };
        }
      }
      const dup = await getExistingInvoiceForOrder(order.id);
      if (dup?.id) {
        return { invoiceId: dup.id, invoiceNumber: dup.invoice_number, duplicate: true };
      }
    }
    throw reserveErr;
  }

  const invoiceId = reserved.id as string;
  const qrPayload = `upi://pay?pa=${gstConfig?.upi_id || 'ankshaastra@upi'}&am=${gst.grandTotal}&tn=${invoiceNumber}`;

  let qrCodeDataUrl: string | undefined;
  try {
    const QRCode = await import('qrcode');
    qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      margin: 1,
      width: 120,
      color: { dark: '#4b77be', light: '#ffffff' },
    });
  } catch {
    /* optional */
  }

  const finalTemplateData: InvoiceTemplateData = {
    ...templateData,
    qrCodeDataUrl,
  };

  try {
    const { buffer, mimeType } = await generateInvoicePdf(finalTemplateData);
    const storagePath = invoiceStoragePath(invoiceNumber);
    const pdfUrl = await uploadInvoicePdf(storagePath, buffer, mimeType);

    const { data: invoice, error: updateErr } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        qr_code_data: qrPayload,
        pdf_url: pdfUrl,
        pdf_storage_path: storagePath,
      })
      .eq('id', invoiceId)
      .select('*')
      .single();

    if (updateErr) throw updateErr;

    await supabase.from('invoice_items').insert({
      invoice_id: invoiceId,
      description: order.service_title,
      quantity: 1,
      unit_price: gst.subtotal,
      hsn_sac_code: DEFAULT_SAC_CODE,
      taxable_amount: gst.subtotal,
      gst_rate: templateData.gstRate,
      cgst_amount: gst.cgst,
      sgst_amount: gst.sgst,
      igst_amount: gst.igst,
      line_total: gst.grandTotal,
    });

    if (input.paymentId) {
      const { error: payErr } = await supabase.from('payments').insert({
        order_id: order.id,
        invoice_id: invoiceId,
        customer_id: customerId,
        amount: gst.grandTotal,
        provider: 'razorpay',
        provider_payment_id: input.paymentId,
        provider_order_id: order.razorpay_order_id,
        status: 'captured',
      });
      if (payErr && payErr.code !== '23505') throw payErr;
    }

    await advanceWorkflow(order.id, 'invoice_generated', 'invoice.created', { invoiceId });
    return { invoiceId, invoiceNumber, invoice, pdfUrl, duplicate: false };
  } catch (genErr) {
    await supabase.from('invoices').delete().eq('id', invoiceId);
    throw genErr;
  }
}

export async function deliverInvoice(invoiceId: string, opts?: { force?: boolean }) {
  const supabase = getSupabaseAdmin();
  const { data: invoice } = await supabase.from('invoices').select('*, orders(*)').eq('id', invoiceId).single();
  if (!invoice) throw new Error('Invoice not found');

  const attachments = await getInvoiceAttachment(invoice);
  const force = opts?.force ?? false;
  const orderId = invoice.order_id as string | null;
  const order = (invoice.orders as Record<string, unknown> | null) || {};
  const orderDetailsHtml = buildOrderDetailsHtml(order);
  const billing = resolveCustomerBilling(order);
  const serviceTitle = String(invoice.service_title || order.service_title || 'Service');
  const emailSubject = buildInvoiceEmailSubject(serviceTitle, String(invoice.invoice_number));
  const gstRate = Number(invoice.cgst_rate || 0) + Number(invoice.sgst_rate || 0) + Number(invoice.igst_rate || 0) || 18;
  const gst = {
    subtotal: Number(invoice.subtotal || 0),
    gstTotal: Number(invoice.gst_total || 0),
    cgst: Number(invoice.cgst_amount || 0),
    sgst: Number(invoice.sgst_amount || 0),
    igst: Number(invoice.igst_amount || 0),
    grandTotal: Number(invoice.total_amount || 0),
    isIntraState: Number(invoice.igst_amount || 0) === 0,
  };
  const downloadLink = invoice.pdf_url
    ? `<p style="margin-top:16px;">You can also <a href="${invoice.pdf_url}" style="color:#4b77be;font-weight:600;">download your invoice PDF</a>.</p>`
    : '';

  if (invoice.customer_email) {
    const orderAlreadySent = orderId ? await wasOrderInvoiceEmailSent(orderId, 'invoice_email') : false;
    const invoiceAlreadySent = !force && (await wasInvoiceEmailSent(invoiceId, 'invoice_email'));
    if (!orderAlreadySent && !invoiceAlreadySent) {
      const customerHtml = wrapEmailLayout(
        buildInvoicePaymentEmailHtml({
          customerName: String(invoice.customer_name || 'Customer'),
          serviceTitle,
          invoiceNumber: String(invoice.invoice_number),
          gst,
          gstRate,
          placeOfSupply: billing.placeOfSupply,
          paymentMethod: String(invoice.payment_method || order.payment_method || 'Razorpay'),
          transactionId: invoice.razorpay_payment_id ? String(invoice.razorpay_payment_id) : undefined,
          orderDetailsHtml,
          downloadLinkHtml: downloadLink,
        }),
        emailSubject,
      );

      try {
        await sendEmail({
          to: invoice.customer_email,
          subject: emailSubject,
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
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.INVOICE_ADMIN_EMAIL || '';
  if (adminEmail) {
    const orderAdminSent = orderId ? await wasOrderInvoiceEmailSent(orderId, 'invoice_admin') : false;
    const adminAlreadySent = !force && (await wasInvoiceEmailSent(invoiceId, 'invoice_admin'));
    if (!orderAdminSent && !adminAlreadySent) {
      const adminHtml = wrapEmailLayout(
        `
      <p style="margin:0 0 16px;font-size:16px;color:#4b77be;font-weight:700;">New Order Received</p>
      ${buildInvoicePaymentEmailHtml({
        customerName: String(invoice.customer_name || 'Customer'),
        serviceTitle,
        invoiceNumber: String(invoice.invoice_number),
        gst,
        gstRate,
        paymentMethod: String(invoice.payment_method || order.payment_method || 'Razorpay'),
        transactionId: invoice.razorpay_payment_id ? String(invoice.razorpay_payment_id) : undefined,
        orderDetailsHtml,
      })}
      <p style="margin-top:16px;">Invoice PDF is attached.</p>
    `,
        `New order: ${serviceTitle}`,
      );

      try {
        await sendEmail({
          to: adminEmail,
          subject: emailSubject,
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
  }

  if (invoice.order_id) {
    await advanceWorkflow(invoice.order_id, 'completed', 'invoice.delivery_completed');
  }

  return { ok: true };
}

/** Single entry point: generate invoice once and send email once per order. */
export async function processInvoiceJob(orderId: string, opts?: { paymentId?: string; forceDeliver?: boolean }) {
  const result = await generateInvoiceForOrder({
    orderId,
    paymentId: opts?.paymentId,
  });

  if (!result.invoiceId) return result;

  // Never auto-send email for duplicate/skipped invoices — only the first successful generation.
  if (result.duplicate && !opts?.forceDeliver) {
    return result;
  }

  await deliverInvoice(result.invoiceId, { force: opts?.forceDeliver });
  return result;
}

export async function orderHasDeliverableInvoice(orderId: string): Promise<boolean> {
  const existing = await getExistingInvoiceForOrder(orderId);
  return Boolean(existing?.pdf_storage_path || existing?.pdf_url);
}

export async function paymentHasDeliverableInvoice(paymentId: string): Promise<boolean> {
  const existing = await getExistingInvoiceByPaymentId(paymentId);
  return Boolean(existing?.pdf_storage_path || existing?.pdf_url);
}

/** True when an invoice row exists (including in-progress PDF generation). */
export async function orderInvoiceGenerationActive(orderId: string): Promise<boolean> {
  const existing = await getExistingInvoiceForOrder(orderId);
  return Boolean(existing?.id);
}

export async function paymentInvoiceGenerationActive(paymentId: string): Promise<boolean> {
  const existing = await getExistingInvoiceByPaymentId(paymentId);
  return Boolean(existing?.id);
}
