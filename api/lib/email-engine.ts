import nodemailer from "nodemailer";
import { getSupabaseAdmin } from "./supabase-admin.js";
import { wrapEmailLayout, interpolate } from "./templates/email-layout.js";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  templateSlug?: string;
  customerId?: string;
  orderId?: string;
  invoiceId?: string;
};

export async function sendEmail(input: SendEmailInput): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  const supabase = getSupabaseAdmin();
  const provider = process.env.MAILER_PROVIDER || "console";
  const from = process.env.EMAIL_FROM || "no-reply@ankshaastra.com";

  const logRow = {
    to_email: input.to,
    subject: input.subject,
    template_slug: input.templateSlug,
    customer_id: input.customerId,
    order_id: input.orderId,
    invoice_id: input.invoiceId,
    provider,
    status: "queued" as const,
  };

  const { data: log } = await supabase.from("email_logs").insert(logRow).select("id").single();

  try {
    if (provider === "resend" && process.env.RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [input.to],
          subject: input.subject,
          html: input.html,
          attachments: input.attachments?.map((attachment) => ({
            filename: attachment.filename,
            content:
              typeof attachment.content === "string"
                ? attachment.content
                : attachment.content.toString("base64"),
            content_type: attachment.contentType,
          })),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const body = await res.json();
      if (log?.id) await supabase.from("email_logs").update({ status: "sent", sent_at: new Date().toISOString(), provider_message_id: body.id }).eq("id", log.id);
      return { ok: true, messageId: body.id };
    }

    if (provider === "smtp" && process.env.SMTP_HOST) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587", 10),
        secure: process.env.SMTP_PORT === "465",
        auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
      });
      const info = await transporter.sendMail({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        attachments: input.attachments,
      });
      if (log?.id) await supabase.from("email_logs").update({ status: "sent", sent_at: new Date().toISOString(), provider_message_id: info.messageId }).eq("id", log.id);
      return { ok: true, messageId: info.messageId };
    }

    console.log("[email]", { to: input.to, subject: input.subject });
    if (log?.id) await supabase.from("email_logs").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", log.id);
    return { ok: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Email send failed";
    if (log?.id) await supabase.from("email_logs").update({ status: "failed", error_message: msg }).eq("id", log.id);
    return { ok: false, error: msg };
  }
}

export async function sendTemplatedEmail(
  templateSlug: string,
  to: string,
  vars: Record<string, string | number>,
  ctx?: {
    customerId?: string;
    orderId?: string;
    invoiceId?: string;
    attachments?: SendEmailInput["attachments"];
  }
) {
  const supabase = getSupabaseAdmin();
  const { data: tpl } = await supabase.from("communication_templates").select("*").eq("slug", templateSlug).eq("is_active", true).maybeSingle();
  const subject = interpolate(tpl?.subject || `Ankshaastra — ${templateSlug}`, vars);
  const body = interpolate(tpl?.body_html || "<p>{{customer_name}}</p>", vars);
  const html = wrapEmailLayout(body, subject);
  return sendEmail({ to, subject, html, templateSlug, ...ctx });
}
