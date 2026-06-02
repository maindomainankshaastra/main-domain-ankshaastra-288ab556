import { logWebhook, verifyRazorpaySignature } from "../../api/lib/webhook-utils.js";
import { getSupabaseAdmin } from "../../api/lib/supabase-admin.js";
import { enqueueJob } from "../../api/lib/workflow-engine.js";
import {
  processInvoiceJob,
  orderHasDeliverableInvoice,
  orderInvoiceGenerationActive,
  paymentHasDeliverableInvoice,
  paymentInvoiceGenerationActive,
} from "../../api/lib/invoice-engine.js";
import { invoiceJobKey } from "../../api/lib/payment-order-map.js";

async function readRawBody(req: { on: (e: string, cb: (c: Buffer) => void) => void }): Promise<string> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).end();

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const rawBody = typeof req.body === "string" ? req.body : await readRawBody(req);
  const signature = req.headers["x-razorpay-signature"] as string;

  let signatureValid = false;
  if (secret && signature) {
    try {
      signatureValid = verifyRazorpaySignature(rawBody, signature, secret);
      if (!signatureValid) return res.status(401).json({ error: "Invalid signature" });
    } catch {
      return res.status(401).json({ error: "Signature verification failed" });
    }
  }

  const payload = JSON.parse(rawBody);
  const event = payload.event as string;
  const entity = payload.payload?.payment?.entity || payload.payload?.order?.entity;
  const idempotencyKey = entity?.id ? `razorpay-${event}-${entity.id}` : undefined;

  const { duplicate, id: logId } = await logWebhook({
    source: "razorpay",
    eventType: event,
    payload,
    idempotencyKey,
    signatureValid,
  });

  if (duplicate) return res.status(200).json({ ok: true, duplicate: true });

  try {
    if (event === "payment.captured" && entity?.order_id) {
      const supabase = getSupabaseAdmin();
      let orderRecord: { id: string; status: string } | null = null;

      if (entity.id) {
        const { data: byPayment } = await supabase
          .from("orders")
          .select("id, status")
          .eq("razorpay_payment_id", entity.id)
          .maybeSingle();
        if (byPayment) orderRecord = byPayment;
      }

      if (!orderRecord) {
        const { data: byRzOrder } = await supabase
          .from("orders")
          .select("id, status")
          .eq("razorpay_order_id", entity.order_id)
          .maybeSingle();
        orderRecord = byRzOrder;
      }

      if (orderRecord) {
        const order = orderRecord;
        if (order.status !== "paid") {
          await supabase
            .from("orders")
            .update({
              status: "paid",
              workflow_stage: "payment_received",
              razorpay_payment_id: entity.id,
              payment_method: entity.method,
            })
            .eq("id", order.id);
        }

        const hasInvoice =
          (entity.id && (await paymentHasDeliverableInvoice(entity.id))) ||
          (await orderHasDeliverableInvoice(order.id));
        const invoiceActive =
          (entity.id && (await paymentInvoiceGenerationActive(entity.id))) ||
          (await orderInvoiceGenerationActive(order.id));
        if (hasInvoice || invoiceActive) {
          await getSupabaseAdmin().from("webhooks_log").update({ status: "processed", processed_at: new Date().toISOString() }).eq("id", logId);
          return res.status(200).json({ ok: true, invoice_exists: true });
        }

        try {
          await processInvoiceJob(order.id, { paymentId: entity.id });
        } catch (invoiceErr) {
          console.error("[razorpay-webhook] Invoice pipeline error:", invoiceErr);
          await enqueueJob(
            "generate_and_deliver_invoice",
            { orderId: order.id, paymentId: entity.id },
            { idempotencyKey: invoiceJobKey(order.id, entity.id), priority: 1 },
          );
        }
      }
    }

    await getSupabaseAdmin().from("webhooks_log").update({ status: "processed", processed_at: new Date().toISOString() }).eq("id", logId);
    return res.status(200).json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Processing failed";
    await getSupabaseAdmin().from("webhooks_log").update({ status: "failed", error_message: msg }).eq("id", logId);
    return res.status(500).json({ error: msg });
  }
}
