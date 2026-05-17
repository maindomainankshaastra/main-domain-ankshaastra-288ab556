import crypto from "crypto";
import { getSupabaseAdmin } from "./supabase-admin";

export async function logWebhook(params: {
  source: string;
  eventType: string;
  payload: unknown;
  idempotencyKey?: string;
  signatureValid?: boolean;
}) {
  const supabase = getSupabaseAdmin();

  if (params.idempotencyKey) {
    const { data: dup } = await supabase
      .from("webhooks_log")
      .select("id")
      .eq("idempotency_key", params.idempotencyKey)
      .maybeSingle();
    if (dup) return { duplicate: true, id: dup.id };
  }

  const { data, error } = await supabase
    .from("webhooks_log")
    .insert({
      source: params.source,
      event_type: params.eventType,
      payload: params.payload as object,
      idempotency_key: params.idempotencyKey,
      signature_valid: params.signatureValid,
      status: "received",
    })
    .select("id")
    .single();

  if (error) throw error;
  return { duplicate: false, id: data.id };
}

export function verifyRazorpaySignature(body: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export function verifyApiKey(provided: string | undefined): boolean {
  const keys = (process.env.OPERATIONS_API_KEYS || "").split(",").map((k) => k.trim()).filter(Boolean);
  if (!keys.length) return false;
  return !!provided && keys.includes(provided);
}
