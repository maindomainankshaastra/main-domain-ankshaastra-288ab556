import crypto from "crypto";
import { getSupabaseAdmin } from "./supabase-admin.js";
import { advanceWorkflow, enqueueJob } from "./workflow-engine.js";
import { processInvoiceJob, orderHasDeliverableInvoice, orderInvoiceGenerationActive, paymentHasDeliverableInvoice, paymentInvoiceGenerationActive } from "./invoice-engine.js";
import {
  resolveOrderForPayment,
  resolveOrderAfterConflict,
  invoiceJobKey,
} from "./payment-order-map.js";
import { mergeOrderMetadata } from "./order-form-details.js";

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

async function triggerJobProcessor(): Promise<void> {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return;

  const host = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (!host) return;

  void fetch(`${host}/api/operations/process-jobs`, {
    headers: { Authorization: `Bearer ${cronSecret}` },
  }).catch((err) => console.warn("[fulfill-payment] Could not trigger job processor:", err));
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
    } else {
      orderId = created?.id || null;
    }
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

  if (Object.keys(formData).length > 0) {
    try {
      const { data: existingOrder } = await supabase.from("orders").select("metadata").eq("id", orderId).maybeSingle();
      const metadata = mergeOrderMetadata(
        existingOrder?.metadata as Record<string, unknown> | undefined,
        formData,
      );
      await supabase.from("orders").update({ metadata }).eq("id", orderId);
    } catch (metaErr) {
      console.warn("[fulfill-payment] Could not save form metadata:", metaErr);
    }
  }

  if (!alreadyPaid) {
    try {
      await advanceWorkflow(orderId, "payment_received", "payment.captured", {
        razorpay_payment_id,
      });
    } catch (wfErr) {
      console.warn("[fulfill-payment] Workflow advance failed:", wfErr);
    }
  }

  let invoiceError: string | undefined;
  const hasInvoice =
    (await paymentHasDeliverableInvoice(razorpay_payment_id)) ||
    (await orderHasDeliverableInvoice(orderId));
  const invoiceActive =
    (await paymentInvoiceGenerationActive(razorpay_payment_id)) ||
    (await orderInvoiceGenerationActive(orderId));

  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

  if (!hasInvoice && !invoiceActive) {
    if (isServerless) {
      // Never block payment confirmation on invoice PDF/email — queue and return quickly.
      try {
        await enqueueJob(
          "generate_and_deliver_invoice",
          { orderId, paymentId: razorpay_payment_id },
          { idempotencyKey: invoiceJobKey(orderId, razorpay_payment_id), priority: 1 },
        );
        await triggerJobProcessor();
      } catch (queueErr) {
        invoiceError = queueErr instanceof Error ? queueErr.message : "Invoice queue failed";
        console.error("[fulfill-payment] Invoice queue error:", queueErr);
      }
    } else {
      try {
        await processInvoiceJob(orderId, {
          paymentId: razorpay_payment_id,
        });
      } catch (invoiceErr: unknown) {
        invoiceError = invoiceErr instanceof Error ? invoiceErr.message : "Invoice generation failed";
        console.error("[fulfill-payment] Invoice pipeline error:", invoiceErr);
        try {
          await enqueueJob(
            "generate_and_deliver_invoice",
            { orderId, paymentId: razorpay_payment_id },
            { idempotencyKey: invoiceJobKey(orderId, razorpay_payment_id), priority: 1 },
          );
        } catch (queueErr) {
          console.error("[fulfill-payment] Invoice queue fallback failed:", queueErr);
        }
      }
    }
  }

  const { data: invoice } = await supabase
    .from("invoices")
    .select("invoice_number, pdf_storage_path, pdf_url")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true })
    .limit(1)
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
