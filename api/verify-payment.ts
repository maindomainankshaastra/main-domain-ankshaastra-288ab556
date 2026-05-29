import crypto from "crypto";
import { fulfillPayment } from "./lib/fulfill-payment.js";

export default async function handler(
  req: { method?: string; body?: Record<string, unknown> },
  res: { status: (n: number) => { json: (o: unknown) => void; end: () => void } },
) {
  if (req.method !== "POST") return res.status(405).end();

  const body = req.body || {};
  const razorpay_order_id = String(body.razorpay_order_id || "");
  const razorpay_payment_id = String(body.razorpay_payment_id || "");
  const razorpay_signature = String(body.razorpay_signature || "");
  const formData = (body.formData as Record<string, unknown>) || {};
  const service = body.service ? String(body.service) : "Service";
  const amount = Number(body.amount) || 0;
  const dbOrderIdFromClient = body.dbOrderId ? String(body.dbOrderId) : null;

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return res.status(500).json({ success: false, error: "Razorpay secret missing" });
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, error: "Missing Razorpay fields" });
  }

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");
  if (expected !== razorpay_signature) {
    return res.status(400).json({ success: false, error: "Invalid signature" });
  }

  try {
    const result = await fulfillPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      formData,
      service,
      amount,
      dbOrderId: dbOrderIdFromClient,
    });

    return res.status(200).json({
      success: true,
      order_id: result.order_id,
      invoice_number: result.invoice_number,
      invoice_ready: result.invoice_ready,
      invoice_warning: result.invoice_warning,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Verification failed";
    console.error(msg, e);
    return res.status(500).json({ success: false, error: msg });
  }
}
