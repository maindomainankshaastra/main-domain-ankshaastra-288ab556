import crypto from "crypto";
import { getSupabaseAdmin } from "./supabase-admin.js";
import { advanceWorkflow, enqueueJob } from "./workflow-engine.js";
import { processInvoiceJob } from "./invoice-engine.js";

export type FulfillPaymentInput = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature?: string;
  formData?: Record<string, unknown>;
  service?: string;
  amount?: number;
  dbOrderId?: string | null;
};

export type FulfillPaymentResult = {
  order_id: string;
  invoice_number?: string;
  invoice_ready: boolean;
  invoice_warning?: string;
  already_paid?: boolean;
};

export function buildPaymentSignature(orderId: string, paymentId: string): string | null {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return null;
  return crypto.createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
}

export async function fulfillPayment(input: FulfillPaymentInput): Promise<FulfillPaymentResult> {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    formData = {},
    service = "Service",
    amount = 0,
    dbOrderId: dbOrderIdFromClient = null,
  } = input;

  const supabase = getSupabaseAdmin();

  const customer_name =
    (formData.fullName as string) ||
    [formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(" ") ||
    "Customer";
  const customer_email = formData.email ? String(formData.email) : null;
  const customer_phone = formData.whatsapp ? String(formData.whatsapp) : null;
  const userId = formData.userId || formData.user_id || null;

  let orderId: string | null = null;
  let alreadyPaid = false;

  if (dbOrderIdFromClient) {
    const { data: byId } = await supabase
      .from("orders")
      .select("id, razorpay_order_id, status")
      .eq("id", dbOrderIdFromClient)
      .maybeSingle();
    if (byId?.razorpay_order_id === razorpay_order_id) {
      orderId = byId.id;
      alreadyPaid = byId.status === "paid";
    }
  }

  if (!orderId) {
    const { data: order } = await supabase
      .from("orders")
      .select("id, status")
      .eq("razorpay_order_id", razorpay_order_id)
      .maybeSingle();
    orderId = order?.id || null;
    if (order?.status === "paid") alreadyPaid = true;
  }

  const signature = razorpay_signature || buildPaymentSignature(razorpay_order_id, razorpay_payment_id) || null;

  if (!orderId) {
    const gstAmount = Math.round(amount * 0.18 * 100) / 100;
    const { data: created } = await supabase
      .from("orders")
      .insert({
        service_title: service,
        amount: amount - gstAmount,
        gst_amount: gstAmount,
        total_amount: amount,
        status: "paid",
        workflow_stage: "payment_received",
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature: signature,
        customer_name,
        customer_email,
        customer_phone,
        user_id: userId,
        source_website: "ankshaastra.com",
      })
      .select("id")
      .single();
    orderId = created?.id || null;
  } else if (!alreadyPaid) {
    await supabase
      .from("orders")
      .update({
        status: "paid",
        workflow_stage: "payment_received",
        razorpay_payment_id,
        razorpay_signature: signature,
        payment_method: "razorpay",
        customer_name,
        customer_email,
        customer_phone,
        ...(userId ? { user_id: userId } : {}),
      })
      .eq("id", orderId);
  }

  if (!orderId) throw new Error("Could not resolve order");

  if (!alreadyPaid) {
    await advanceWorkflow(orderId, "payment_received", "payment.captured", {
      razorpay_payment_id,
    });
  }

  let invoiceError: string | undefined;
  const { data: existingInvoice } = await supabase
    .from("invoices")
    .select("invoice_number, pdf_storage_path, pdf_url")
    .eq("order_id", orderId)
    .maybeSingle();

  const hasInvoice = Boolean(existingInvoice?.pdf_storage_path || existingInvoice?.pdf_url);

  if (!hasInvoice) {
    try {
      await processInvoiceJob(orderId, {
        paymentId: razorpay_payment_id,
        forceDeliver: true,
      });
    } catch (invoiceErr: unknown) {
      invoiceError = invoiceErr instanceof Error ? invoiceErr.message : "Invoice generation failed";
      console.error("[fulfill-payment] Invoice pipeline error:", invoiceErr);
      await enqueueJob(
        "generate_and_deliver_invoice",
        { orderId },
        { idempotencyKey: `invoice-retry-${orderId}-${Date.now()}`, priority: 1 },
      );
    }
  }

  const { data: invoice } = await supabase
    .from("invoices")
    .select("invoice_number, pdf_storage_path, pdf_url")
    .eq("order_id", orderId)
    .maybeSingle();

  const invoiceReady = Boolean(invoice?.pdf_storage_path || invoice?.pdf_url);

  return {
    order_id: orderId,
    invoice_number: invoice?.invoice_number,
    invoice_ready: invoiceReady,
    invoice_warning: invoiceError,
    already_paid: alreadyPaid,
  };
}
