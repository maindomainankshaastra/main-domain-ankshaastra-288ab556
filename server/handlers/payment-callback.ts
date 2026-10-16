import crypto from "crypto";
import { getSupabaseAdmin } from "../lib/supabase-admin.js";
import { fulfillPayment } from "../lib/fulfill-payment.js";

/**
 * POST /api/payment-callback
 * Razorpay mobile redirect flow: after payment, Razorpay POSTs
 * (form-urlencoded) razorpay_payment_id / razorpay_order_id / razorpay_signature here.
 * We verify, fulfil the order, and redirect the browser to /thank-you.
 */
async function readRaw(req: any): Promise<string> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function redirect(res: any, location: string) {
  res.writeHead(302, { Location: location, "Cache-Control": "no-store" });
  res.end();
}

export default async function handler(req: any, res: any) {
  // Razorpay may also open the callback URL with GET after some flows.
  if (req.method !== "POST") return redirect(res, "/");

  let fields: Record<string, string> = {};
  try {
    if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
      fields = req.body as Record<string, string>;
    } else {
      const raw = typeof req.body === "string" ? req.body : await readRaw(req);
      const ct = String(req.headers?.["content-type"] || "");
      if (ct.includes("application/json")) fields = JSON.parse(raw || "{}");
      else fields = Object.fromEntries(new URLSearchParams(raw));
    }
  } catch {
    return redirect(res, "/?payment_status=failed");
  }

  const razorpay_order_id = String(fields.razorpay_order_id || "");
  const razorpay_payment_id = String(fields.razorpay_payment_id || "");
  const razorpay_signature = String(fields.razorpay_signature || "");

  // Failed / cancelled payment -> Razorpay sends error[...] fields, no signature.
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return redirect(res, "/?payment_status=failed");
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return redirect(res, "/?payment_status=error");

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(razorpay_signature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return redirect(res, "/?payment_status=failed");
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: order } = await supabase
      .from("orders")
      .select("id, service_title, total_amount, customer_name, customer_email, metadata")
      .eq("razorpay_order_id", razorpay_order_id)
      .maybeSingle();

    const meta = (order?.metadata as Record<string, any> | null) || {};
    const formData = (meta.formSnapshot as Record<string, unknown>) || {};
    const amount = Number(order?.total_amount) || 0;
    const service = order?.service_title || "Service";

    const result = await fulfillPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      formData,
      service,
      amount,
      dbOrderId: order?.id ?? null,
    });

    const params = new URLSearchParams({
      service,
      amount: String(amount),
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      invoice: result.invoice_number || "",
      name: String(order?.customer_name || formData.fullName || ""),
      email: String(order?.customer_email || formData.email || ""),
    });
    return redirect(res, `/thank-you?${params.toString()}`);
  } catch (e) {
    console.error("[payment-callback]", e);
    // Payment is verified & captured at Razorpay; webhook/sync will still fulfil it.
    const params = new URLSearchParams({
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
    });
    return redirect(res, `/thank-you?${params.toString()}`);
  }
}
