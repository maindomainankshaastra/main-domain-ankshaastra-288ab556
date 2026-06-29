import Razorpay from "razorpay";
import { getSupabaseAdmin } from "../lib/supabase-admin.js";
import { calculateGst } from "../lib/gst.js";
import { normalizeSourceWebsite } from "../lib/connected-sites.js";

export default async function handler(req: { method?: string; body?: Record<string, unknown> }, res: { status: (n: number) => { json: (o: unknown) => void; end: () => void } }) {
  if (req.method !== "POST") return res.status(405).end();

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return res.status(500).json({ error: "Razorpay credentials missing." });
  }

  const body = req.body || {};
  let amount = Number(body.amount);
  let serviceTitle = String(body.serviceTitle || body.service || "Service");
  const userId = body.userId ? String(body.userId) : null;
  const sourceWebsite = normalizeSourceWebsite(body.sourceWebsite as string | undefined);
  const orderType = String(body.orderType || "service");
  const customerName = body.customerName ? String(body.customerName) : null;
  const customerEmail = body.customerEmail ? String(body.customerEmail) : null;
  const customerPhone = body.customerPhone ? String(body.customerPhone) : null;
  const metadata = (body.metadata as Record<string, unknown>) || {};

  const serviceSlug = String(metadata.serviceSlug || serviceTitle || "").trim();
  const requestedServiceId = metadata.serviceId ? String(metadata.serviceId) : null;
  let resolvedServiceId: string | null = null;
  let gstRate: number | undefined;

  try {
    const supabase = getSupabaseAdmin();

    if (requestedServiceId || serviceSlug) {
      const query = supabase
        .from("services")
        .select("id,title,price,gst_rate,is_active")
        .limit(1);

      const resolvedQuery = requestedServiceId
        ? query.eq("id", requestedServiceId)
        : query.ilike("title", serviceSlug);

      const { data: service, error: serviceError } = await resolvedQuery.maybeSingle();

      if (serviceError) {
        console.error("Service lookup failed:", serviceError);
      }

      if (service) {
        if (!service.is_active) {
          return res.status(400).json({ error: "This service is currently unavailable." });
        }

        serviceTitle = service.title;
        resolvedServiceId = service.id;
        gstRate = service.gst_rate ?? undefined;

        const basePrice = Number(service.price);
        const addons = Array.isArray(metadata.addons)
          ? (metadata.addons as { price?: number }[])
          : [];
        const addonsTotal = addons.reduce((sum, a) => sum + Number(a.price || 0), 0);
        const clientAmount = Number(body.amount);

        // Keep client total when it includes add-ons; otherwise use catalog price + add-ons.
        if (clientAmount > 0 && (addonsTotal > 0 || clientAmount !== basePrice)) {
          amount = clientAmount;
        } else {
          amount = basePrice + addonsTotal;
        }
      }
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const gst = calculateGst({ amount, isGstInclusive: true, gstRate });

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const rzOrder = await razorpay.orders.create({
      amount: Math.round(gst.grandTotal * 100),
      currency: "INR",
      notes: { service: serviceTitle, source: sourceWebsite },
    });

    const orderRow: Record<string, unknown> = {
      service_title: serviceTitle,
      amount: gst.subtotal,
      gst_amount: gst.gstTotal,
      total_amount: gst.grandTotal,
      status: "pending",
      workflow_stage: "payment_pending",
      razorpay_order_id: rzOrder.id,
      source_website: sourceWebsite,
      order_type: orderType,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      metadata,
    };
    if (resolvedServiceId) orderRow.service_id = resolvedServiceId;

    if (userId) orderRow.user_id = userId;

    const { data: dbOrder, error } = await supabase.from("orders").insert(orderRow).select("id").single();
    if (error) {
      console.error("Order insert failed:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      id: rzOrder.id,
      amount: rzOrder.amount,
      currency: rzOrder.currency,
      dbOrderId: dbOrder.id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Order creation failed" });
  }
}
