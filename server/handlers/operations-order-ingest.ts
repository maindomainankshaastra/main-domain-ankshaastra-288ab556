import { verifyApiKey } from "../../api/lib/webhook-utils.js";
import { getSupabaseAdmin } from "../../api/lib/supabase-admin.js";
import { calculateGst } from "../../api/lib/gst.js";
import { enqueueJob } from "../../api/lib/workflow-engine.js";

/** Central API gateway for connected websites to submit orders. */
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).end();

  const apiKey = req.headers["x-api-key"] as string | undefined;
  if (!verifyApiKey(apiKey)) return res.status(401).json({ error: "Unauthorized" });

  const body = req.body || {};
  const sourceWebsite = String(body.sourceWebsite || "ankshaastra.com");
  const serviceTitle = String(body.serviceTitle || "Service");
  const amount = Number(body.totalAmount || body.amount);
  const customer = body.customer || {};
  const metadata = body.metadata || {};
  const orderType = body.orderType || "service";
  const autoInvoice = body.autoInvoice !== false;

  if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

  const supabase = getSupabaseAdmin();
  const gst = calculateGst({ amount, isGstInclusive: body.gstInclusive !== false });

  const { data: customerRow } = await supabase
    .from("customers")
    .insert({
      full_name: customer.name || "Customer",
      email: customer.email,
      phone: customer.phone,
      whatsapp: customer.whatsapp || customer.phone,
      source_website: sourceWebsite,
      metadata,
    })
    .select("id")
    .single();

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      customer_id: customerRow?.id,
      service_title: serviceTitle,
      amount: gst.subtotal,
      gst_amount: gst.gstTotal,
      total_amount: gst.grandTotal,
      status: body.paymentStatus || "paid",
      workflow_stage: body.paymentStatus === "paid" ? "payment_received" : "order_created",
      source_website: sourceWebsite,
      order_type: orderType,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone || customer.whatsapp,
      metadata,
      razorpay_payment_id: body.paymentId,
      payment_method: body.paymentMethod,
    })
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });

  if (autoInvoice && order.status === "paid") {
    await enqueueJob("generate_and_deliver_invoice", { orderId: order.id }, {
      idempotencyKey: `ingest-invoice-${order.id}`,
    });
  }

  return res.status(201).json({ success: true, orderId: order.id, customerId: customerRow?.id });
}
