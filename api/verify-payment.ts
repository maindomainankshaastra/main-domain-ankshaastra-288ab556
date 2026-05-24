import crypto from "crypto";
import { getSupabaseAdmin } from "./lib/supabase-admin.js";
import { advanceWorkflow, runPostPaymentWorkflow } from "./lib/workflow-engine.js";
import { processPendingJobs } from "./lib/job-processor.js";

export default async function handler(req: { method?: string; body?: Record<string, unknown> }, res: { status: (n: number) => { json: (o: unknown) => void; end: () => void } }) {
  if (req.method !== "POST") return res.status(405).end();

  const body = req.body || {};
  const razorpay_order_id = String(body.razorpay_order_id || "");
  const razorpay_payment_id = String(body.razorpay_payment_id || "");
  const razorpay_signature = String(body.razorpay_signature || "");
  const formData = (body.formData as Record<string, unknown>) || {};
  const service = body.service ? String(body.service) : "Service";
  const amount = Number(body.amount) || 0;

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return res.status(500).json({ success: false, error: "Razorpay secret missing" });
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, error: "Missing Razorpay fields" });
  }

  const expected = crypto.createHmac("sha256", keySecret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
  if (expected !== razorpay_signature) {
    return res.status(400).json({ success: false, error: "Invalid signature" });
  }

  try {
    const supabase = getSupabaseAdmin();

    const customer_name =
      (formData.fullName as string) ||
      [formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(" ") ||
      "Customer";
    const customer_email = formData.email ? String(formData.email) : null;
    const customer_phone = formData.whatsapp ? String(formData.whatsapp) : null;

    const { data: order } = await supabase
      .from("orders")
      .select("id")
      .eq("razorpay_order_id", razorpay_order_id)
      .maybeSingle();

    let orderId = order?.id;

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
          razorpay_signature,
          customer_name,
          customer_email,
          customer_phone,
          user_id: formData.user_id || null,
          source_website: "ankshaastra.com",
        })
        .select("id")
        .single();
      orderId = created?.id;
    } else {
      await supabase
        .from("orders")
        .update({
          status: "paid",
          workflow_stage: "payment_received",
          razorpay_payment_id,
          razorpay_signature,
          payment_method: "razorpay",
          customer_name,
          customer_email,
          customer_phone,
        })
        .eq("id", orderId);
    }

    if (!orderId) throw new Error("Could not resolve order");

    await advanceWorkflow(orderId, "payment_received", "payment.captured", {
      razorpay_payment_id,
    });

    await runPostPaymentWorkflow(orderId);
    await processPendingJobs(3);

    const { data: invoice } = await supabase
      .from("invoices")
      .select("invoice_number")
      .eq("order_id", orderId)
      .maybeSingle();

    return res.status(200).json({
      success: true,
      order_id: orderId,
      invoice_number: invoice?.invoice_number,
      razorpay_payment_id,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Verification failed";
    console.error(msg, e);
    return res.status(500).json({ success: false, error: msg });
  }
}
