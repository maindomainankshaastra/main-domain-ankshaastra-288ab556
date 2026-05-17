import { getSupabaseAdmin } from "./supabase-admin";
import { interpolate } from "./templates/email-layout";

export type SendWhatsAppInput = {
  to: string;
  message: string;
  templateSlug?: string;
  mediaUrl?: string;
  customerId?: string;
  orderId?: string;
  invoiceId?: string;
};

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").replace(/^0/, "");
}

export async function sendWhatsApp(input: SendWhatsAppInput): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  const supabase = getSupabaseAdmin();
  const provider = process.env.WHATSAPP_PROVIDER || "console";
  const to = normalizePhone(input.to);

  const { data: log } = await supabase
    .from("whatsapp_logs")
    .insert({
      to_phone: to,
      template_slug: input.templateSlug,
      customer_id: input.customerId,
      order_id: input.orderId,
      invoice_id: input.invoiceId,
      provider,
      status: "queued",
      media_url: input.mediaUrl,
    })
    .select("id")
    .single();

  try {
    if (provider === "cloud_api" && process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID) {
      const payload: Record<string, unknown> = {
        messaging_product: "whatsapp",
        to,
        type: input.mediaUrl ? "document" : "text",
      };
      if (input.mediaUrl) {
        payload.document = { link: input.mediaUrl, caption: input.message };
      } else {
        payload.text = { body: input.message };
      }
      const res = await fetch(`https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const body = await res.json();
      const msgId = body.messages?.[0]?.id;
      if (log?.id) await supabase.from("whatsapp_logs").update({ status: "sent", sent_at: new Date().toISOString(), provider_message_id: msgId }).eq("id", log.id);
      return { ok: true, messageId: msgId };
    }

    console.log("[whatsapp]", { to, message: input.message.slice(0, 80) });
    if (log?.id) await supabase.from("whatsapp_logs").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", log.id);
    return { ok: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "WhatsApp send failed";
    if (log?.id) await supabase.from("whatsapp_logs").update({ status: "failed", error_message: msg }).eq("id", log.id);
    return { ok: false, error: msg };
  }
}

export async function sendTemplatedWhatsApp(
  templateSlug: string,
  to: string,
  vars: Record<string, string | number>,
  ctx?: { customerId?: string; orderId?: string; invoiceId?: string; mediaUrl?: string }
) {
  const supabase = getSupabaseAdmin();
  const { data: tpl } = await supabase.from("communication_templates").select("*").eq("slug", templateSlug).maybeSingle();
  const message = interpolate(tpl?.body_text || tpl?.body_html?.replace(/<[^>]+>/g, "") || "Hello {{customer_name}}", vars);
  return sendWhatsApp({ to, message, templateSlug, mediaUrl: ctx?.mediaUrl, ...ctx });
}
