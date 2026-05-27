import { getSupabaseAdmin } from "./supabase-admin.js";
import { calculateGst, nextInvoiceNumber } from "./gst.js";
import { type InvoiceTemplateData } from "./templates/invoice-html.js";
import { generateInvoicePdf } from "./pdf-engine.js";
import { sendEmail, sendTemplatedEmail, type SendEmailInput } from "./email-engine.js";
import { sendTemplatedWhatsApp } from "./whatsapp-engine.js";
import { advanceWorkflow } from "./workflow-engine.js";
import { wrapEmailLayout } from "./templates/email-layout.js";

export type GenerateInvoiceInput = {
  orderId: string;
  paymentId?: string;
  paymentMethod?: string;
};

export async function upsertCustomerFromOrder(order: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  const email = order.customer_email as string | undefined;
  const phone = order.customer_phone as string | undefined;
  const name = (order.customer_name as string) || "Customer";

  if (order.customer_id) return order.customer_id as string;

  let query = supabase.from("customers").select("id");
  if (email) query = query.eq("email", email);
  else if (phone) query = query.eq("phone", phone);
  const { data: existing } = await query.maybeSingle();

  if (existing?.id) {
    await supabase.from("orders").update({ customer_id: existing.id }).eq("id", order.id);
    return existing.id;
  }

  const { data: created } = await supabase
    .from("customers")
    .insert({
      full_name: name,
      email,
      phone,
      whatsapp: phone,
      source_website: order.source_website || "ankshaastra.com",
      user_id: order.user_id || null,
    })
    .select("id")
    .single();

  if (created?.id) await supabase.from("orders").update({ customer_id: created.id }).eq("id", order.id);
  return created?.id;
}

async function ensureInvoiceBucket() {
  const supabase = getSupabaseAdmin();
  const { data: bucket } = await supabase.storage.getBucket("invoices");
  if (bucket) return;

  const { error } = await supabase.storage.createBucket("invoices", {
    public: false,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ["application/pdf", "text/html"],
  });

  if (error && !/already exists/i.test(error.message)) {
    throw error;
  }
}

async function uploadInvoiceFile(storagePath: string, buffer: Buffer, mimeType: string) {
  const supabase = getSupabaseAdmin();
  await ensureInvoiceBucket();

  const { error } = await supabase.storage.from("invoices").upload(storagePath, buffer, {
    contentType: mimeType,
    upsert: true,
  });
  if (error) throw error;

  const { data: signed, error: signedError } = await supabase.storage
    .from("invoices")
    .createSignedUrl(storagePath, 60 * 60 * 24 * 365);
  if (signedError) throw signedError;

  return signed?.signedUrl ?? null;
}

async function getInvoiceAttachment(invoice: Record<string, unknown>): Promise<SendEmailInput["attachments"]> {
  const storagePath = invoice.pdf_storage_path as string | undefined;
  if (!storagePath) return undefined;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage.from("invoices").download(storagePath);
  if (error || !data) return undefined;

  const bytes = Buffer.from(await data.arrayBuffer());
  const isPdf = storagePath.toLowerCase().endsWith(".pdf");
  const invoiceNumber = String(invoice.invoice_number || invoice.id || "invoice").replace(/[^\w.-]+/g, "_");

  return [
    {
      filename: `${invoiceNumber}.${isPdf ? "pdf" : "html"}`,
      content: bytes,
      contentType: isPdf ? "application/pdf" : "text/html",
    },
  ];
}

function buildAdminInvoiceEmail(invoice: Record<string, unknown>) {
  const total = Number(invoice.total_amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const html = `
    <p>A paid invoice has been generated and stored in Supabase.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px">
      <tr><td style="padding:8px;border-bottom:1px solid #2a2a2a;color:#9ca3af">Invoice</td><td style="padding:8px;border-bottom:1px solid #2a2a2a">${escapeHtml(invoice.invoice_number || "")}</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #2a2a2a;color:#9ca3af">Customer</td><td style="padding:8px;border-bottom:1px solid #2a2a2a">${escapeHtml(invoice.customer_name || "Customer")}</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #2a2a2a;color:#9ca3af">Email</td><td style="padding:8px;border-bottom:1px solid #2a2a2a">${escapeHtml(invoice.customer_email || "N/A")}</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #2a2a2a;color:#9ca3af">Phone</td><td style="padding:8px;border-bottom:1px solid #2a2a2a">${escapeHtml(invoice.customer_phone || "N/A")}</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #2a2a2a;color:#9ca3af">Service</td><td style="padding:8px;border-bottom:1px solid #2a2a2a">${escapeHtml(invoice.service_title || "")}</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #2a2a2a;color:#9ca3af">Amount</td><td style="padding:8px;border-bottom:1px solid #2a2a2a">INR ${total}</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #2a2a2a;color:#9ca3af">Payment ID</td><td style="padding:8px;border-bottom:1px solid #2a2a2a">${escapeHtml(invoice.razorpay_payment_id || "N/A")}</td></tr>
    </table>
    ${invoice.pdf_url ? `<p style="margin-top:16px"><a href="${invoice.pdf_url}">Open stored invoice</a></p>` : ""}
  `;

  return wrapEmailLayout(html, `Invoice generated: ${invoice.invoice_number || ""}`);
}

function escapeHtml(value: unknown) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function generateInvoiceForOrder(input: GenerateInvoiceInput) {
  const supabase = getSupabaseAdmin();
  const { data: order, error } = await supabase.from("orders").select("*").eq("id", input.orderId).single();
  if (error || !order) throw new Error("Order not found");

  const customerId = await upsertCustomerFromOrder(order);
  const { data: existing } = await supabase.from("invoices").select("id, invoice_number").eq("order_id", order.id).maybeSingle();
  if (existing) return { invoiceId: existing.id, invoiceNumber: existing.invoice_number, duplicate: true };

  const { data: gstConfig } = await supabase.from("gst_config").select("*").limit(1).single();
  const gst = calculateGst({
    amount: Number(order.total_amount),
    gstRate: 18,
    isGstInclusive: gstConfig?.is_gst_inclusive_default ?? true,
    businessStateCode: gstConfig?.state_code || "27",
    customerStateCode: order.metadata?.state_code,
  });

  const invoiceNumber = await nextInvoiceNumber(supabase);
  const qrPayload = `upi://pay?pa=${gstConfig?.upi_id || "ankshaastra@upi"}&am=${gst.grandTotal}&tn=${invoiceNumber}`;

  let qrCodeDataUrl: string | undefined;
  try {
    const QRCode = await import("qrcode");
    qrCodeDataUrl = await QRCode.toDataURL(qrPayload, { margin: 1, width: 120, color: { dark: "#d4af37", light: "#0a0a0a" } });
  } catch {
    /* optional */
  }

  const templateData: InvoiceTemplateData = {
    invoiceNumber,
    invoiceDate: new Date().toLocaleDateString("en-IN"),
    businessName: gstConfig?.business_name || "Ankshaastra",
    businessGstin: gstConfig?.gstin,
    businessAddress: gstConfig?.address,
    customerName: order.customer_name || "Customer",
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    serviceTitle: order.service_title,
    items: [{ description: order.service_title, quantity: 1, unitPrice: gst.subtotal, lineTotal: gst.subtotal }],
    gst,
    paymentMethod: input.paymentMethod || order.payment_method || "Razorpay",
    transactionId: input.paymentId || order.razorpay_payment_id,
    qrCodeDataUrl,
    status: "PAID",
    termsFooter: gstConfig?.terms_footer,
  };

  const { buffer, mimeType } = await generateInvoicePdf(templateData);
  const storagePath = `invoices/${invoiceNumber}.${mimeType === "application/pdf" ? "pdf" : "html"}`;

  const pdfUrl = await uploadInvoiceFile(storagePath, buffer, mimeType);

  const { data: invoice, error: invErr } = await supabase
    .from("invoices")
    .insert({
      invoice_number: invoiceNumber,
      order_id: order.id,
      user_id: order.user_id,
      customer_id: customerId,
      customer_name: order.customer_name || "Customer",
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
      status: "paid",
      source_website: order.source_website,
      payment_method: input.paymentMethod || order.payment_method || "razorpay",
      razorpay_payment_id: input.paymentId || order.razorpay_payment_id,
      qr_code_data: qrPayload,
      pdf_url: pdfUrl,
      pdf_storage_path: storagePath,
    })
    .select("*")
    .single();

  if (invErr) throw invErr;

  await supabase.from("invoice_items").insert({
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
    await supabase.from("payments").insert({
      order_id: order.id,
      invoice_id: invoice.id,
      customer_id: customerId,
      amount: gst.grandTotal,
      provider: "razorpay",
      provider_payment_id: input.paymentId,
      provider_order_id: order.razorpay_order_id,
      status: "captured",
    });
  }

  await advanceWorkflow(order.id, "invoice_generated", "invoice.created", { invoiceId: invoice.id });
  return { invoiceId: invoice.id, invoiceNumber, invoice, pdfUrl, duplicate: false };
}

export async function deliverInvoice(invoiceId: string) {
  const supabase = getSupabaseAdmin();
  const { data: invoice } = await supabase.from("invoices").select("*, orders(*)").eq("id", invoiceId).single();
  if (!invoice) throw new Error("Invoice not found");

  const attachments = await getInvoiceAttachment(invoice);
  const vars = {
    customer_name: invoice.customer_name,
    invoice_number: invoice.invoice_number,
    service_title: invoice.service_title,
    total_amount: invoice.total_amount,
    invoice_download_url: invoice.pdf_url || "",
  };

  if (invoice.customer_email) {
    await sendTemplatedEmail("invoice_email", invoice.customer_email, vars, {
      customerId: invoice.customer_id,
      orderId: invoice.order_id,
      invoiceId: invoice.id,
      attachments,
    });
    if (invoice.order_id) await advanceWorkflow(invoice.order_id, "email_sent", "invoice.email_sent");
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.INVOICE_ADMIN_EMAIL || "social@ankshaastra.com";
  if (adminEmail) {
    await sendEmail({
      to: adminEmail,
      subject: `Invoice generated: ${invoice.invoice_number}`,
      html: buildAdminInvoiceEmail(invoice),
      templateSlug: "invoice_admin_email",
      customerId: invoice.customer_id,
      orderId: invoice.order_id,
      invoiceId: invoice.id,
      attachments,
    });
  }

  if (invoice.customer_phone) {
    await sendTemplatedWhatsApp("invoice_whatsapp", invoice.customer_phone, vars, {
      customerId: invoice.customer_id,
      orderId: invoice.order_id,
      invoiceId: invoice.id,
      mediaUrl: invoice.pdf_url || undefined,
    });
    if (invoice.order_id) await advanceWorkflow(invoice.order_id, "whatsapp_sent", "invoice.whatsapp_sent");
  }

  return { ok: true };
}

export async function processInvoiceJob(orderId: string) {
  const result = await generateInvoiceForOrder({ orderId });
  if (result.invoiceId) await deliverInvoice(result.invoiceId);
  return result;
}
