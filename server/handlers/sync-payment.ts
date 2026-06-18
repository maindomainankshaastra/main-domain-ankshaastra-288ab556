import { fulfillPayment, buildPaymentSignature } from "../lib/fulfill-payment.js";
import { pollRazorpayPaidOrder } from "../lib/razorpay-api.js";

/**
 * POST /api/sync-payment
 * Reconcile a Razorpay order when the checkout handler did not run (common with UPI QR on mobile).
 */
export default async function handler(
  req: { method?: string; body?: Record<string, unknown> },
  res: { status: (n: number) => { json: (o: unknown) => void; end: () => void } },
) {
  if (req.method !== "POST") return res.status(405).end();

  const body = req.body || {};
  const razorpay_order_id = String(body.razorpay_order_id || "");
  const dbOrderId = body.dbOrderId ? String(body.dbOrderId) : null;
  const formData = (body.formData as Record<string, unknown>) || {};
  const service = body.service ? String(body.service) : "Service";
  const amount = Number(body.amount) || 0;
  const pollAttempts = Math.min(Number(body.pollAttempts) || 5, 8);

  if (!razorpay_order_id) {
    return res.status(400).json({ success: false, paid: false, error: "Missing razorpay_order_id" });
  }

  try {
    const paid = await pollRazorpayPaidOrder(razorpay_order_id, pollAttempts, 1500);
    if (!paid) {
      return res.status(200).json({
        success: true,
        paid: false,
        razorpay_order_id,
      });
    }

    const razorpay_payment_id = paid.payment.id;
    const razorpay_signature = buildPaymentSignature(razorpay_order_id, razorpay_payment_id);

    const result = await fulfillPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature: razorpay_signature || undefined,
      formData,
      service,
      amount: amount || paid.order.amount / 100,
      dbOrderId,
    });

    return res.status(200).json({
      success: true,
      paid: true,
      verifiedBy: "api_poll",
      order_id: result.order_id,
      invoice_number: result.invoice_number,
      invoice_ready: result.invoice_ready,
      invoice_warning: result.invoice_warning,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Sync failed";
    console.error("[sync-payment]", msg, e);
    return res.status(500).json({ success: false, paid: false, error: msg });
  }
}
