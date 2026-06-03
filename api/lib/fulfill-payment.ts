import crypto from "crypto";
import { getSupabaseAdmin } from "./supabase-admin.js";
import {
  orderHasDeliverableInvoice,
  paymentHasDeliverableInvoice,
} from "./invoice-engine.js";
import {
  resolveOrderForPayment,
  resolveOrderAfterConflict,
} from "./payment-order-map.js";
import { mergeOrderMetadata } from "./order-form-details.js";
import { scheduleInvoiceGeneration } from "./schedule-invoice.js";

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

async function saveOrderMetadata(orderId: string, formData: Record<string, unknown>): Promise<void> {
  if (!Object.keys(formData).length) return;
  const supabase = getSupabaseAdmin();
  const { data: existingOrder } = await supabase.from("orders").select("metadata").eq("id", orderId).maybeSingle();
  const metadata = mergeOrderMetadata(
    existingOrder?.metadata as Record<string, unknown> | undefined,
    formData,
  );
  await supabase.from("orders").update({ metadata }).eq("id", orderId);
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

  const resolved = await resolveOrderForPayment({
    razorpay_payment_id,
    razorpay_order_id,
    dbOrderId: dbOrderIdFromClient,
  });
  orderId = resolved.orderId;
  alreadyPaid = resolved.alreadyPaid;

  const signature = razorpay_signature || buildPaymentSignature(razorpay_order_id, razorpay_payment_id) || null;

  if (!orderId) {
    const gstAmount = Math.round(amount * 0.18 * 100) / 100;
    const { data: created, error: createErr } = await supabase
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

    if (createErr?.code === "23505") {
      const existing = await resolveOrderAfterConflict(razorpay_payment_id, razorpay_order_id);
      orderId = existing.orderId;
      alreadyPaid = existing.alreadyPaid;
    } else if (createErr) {
      throw createErr;
    } else {
      orderId = created?.id || null;
    }
  } else if (!alreadyPaid) {
    const { error: updateErr } = await supabase
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
    if (updateErr) throw updateErr;
  }

  if (!orderId) throw new Error("Could not resolve order");

  void saveOrderMetadata(orderId, formData).catch((err) => {
    console.warn("[fulfill-payment] Could not save form metadata:", err);
  });

  const hasInvoice =
    (await paymentHasDeliverableInvoice(razorpay_payment_id)) ||
    (await orderHasDeliverableInvoice(orderId));

  if (!hasInvoice) {
    await scheduleInvoiceGeneration(orderId, razorpay_payment_id);
  }

  let invoice_number: string | undefined;
  if (hasInvoice) {
    const { data: invoice } = await supabase
      .from("invoices")
      .select("invoice_number")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    invoice_number = invoice?.invoice_number;
  }

  return {
    order_id: orderId,
    invoice_number,
    invoice_ready: hasInvoice,
    invoice_warning: hasInvoice ? undefined : "Invoice is being generated and will be emailed shortly.",
    already_paid: alreadyPaid,
  };
}
