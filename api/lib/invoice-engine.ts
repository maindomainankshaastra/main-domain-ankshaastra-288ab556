import { getSupabaseAdmin } from "./supabase-admin";
import { calculateGst, nextInvoiceNumber } from "./gst";
import { renderInvoiceHtml, type InvoiceTemplateData } from "./templates/invoice-html";
import { generateInvoicePdf } from "./pdf-engine";
import { sendTemplatedEmail } from "./email-engine";
import { sendTemplatedWhatsApp } from "./whatsapp-engine";
import { advanceWorkflow } from "./workflow-engine";

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

  let pdfUrl: string | null = null;
  try {
    await supabase.storage.from("invoices").upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: true,
    });
    const { data: signed } = await supabase.storage.from("invoices").createSignedUrl(storagePath, 60 * 60 * 24 * 365);
    pdfUrl = signed?.signedUrl ?? null;
  } catch {
    pdfUrl = null;
  }

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
      payment_method: input.paymentMethod,
      razorpay_payment_id: input.paymentId,
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

  const vars = {
    customer_name: invoice.customer_name,
    invoice_number: invoice.invoice_number,
    service_title: invoice.service_title,
    total_amount: invoice.total_amount,
  };

  if (invoice.customer_email) {
    await sendTemplatedEmail("invoice_email", invoice.customer_email, vars, {
      customerId: invoice.customer_id,
      orderId: invoice.order_id,
      invoiceId: invoice.id,
    });
    if (invoice.order_id) await advanceWorkflow(invoice.order_id, "email_sent", "invoice.email_sent");
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
