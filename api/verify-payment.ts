import crypto from "crypto";

// Safely escape a few HTML characters for email bodies.
// (Keep this simple to avoid escaping/tooling issues.)
const escapeHtml = (input: string) => {
  return String(input)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "<")
    .replaceAll(">", ">")
    .replaceAll('"', "&quot;");
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).end();

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    formData,
    service,
    amount,
  } = req.body || {};

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return res
      .status(500)
      .json({ success: false, error: "Razorpay credentials missing (RAZORPAY_KEY_SECRET)." });
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, error: "Missing Razorpay fields." });
  }

  const generated_signature = crypto
    .createHmac("sha256", keySecret)
    .update(String(razorpay_order_id) + "|" + String(razorpay_payment_id))
    .digest("hex");

  if (generated_signature !== razorpay_signature) {
    return res.status(400).json({ success: false, error: "Invalid signature" });
  }

  try {
    const { createClient } = await import("@supabase/supabase-js");

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return res.status(500).json({
        success: false,
        error: "Supabase server credentials missing (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).",
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const customer_name: string | null = formData?.fullName
      ? String(formData.fullName)
      : [formData?.firstName, formData?.middleName, formData?.lastName]
          .filter(Boolean)
          .join(" ") || null;

    const customer_email: string | null = formData?.email ? String(formData.email) : null;
    const customer_phone: string | null = formData?.whatsapp ? String(formData.whatsapp) : null;

    const order_id = String(razorpay_order_id);
    const razorpay_payment_id_str = String(razorpay_payment_id);

    const service_title = service ? String(service) : "Service";
    const total_amount = typeof amount === "number" ? amount : parseInt(String(amount ?? 0), 10) || 0;

    const invoice_number = `INV-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${razorpay_payment_id_str.slice(-6)}`;

    const { data: existing } = await supabaseAdmin
      .from("invoices")
      .select("id")
      .eq("order_id", order_id)
      .maybeSingle();

    if (!existing) {
      const insertPayload = {
        user_id: (formData?.user_id ? String(formData.user_id) : undefined) as any,
        order_id,
        service_title,
        customer_name: customer_name || "Customer",
        customer_email,
        customer_phone,
        total_amount,
        status: "paid",
        invoice_date: new Date().toISOString(),
        invoice_number,
        pdf_url: null,

        base_amount: total_amount,
        cgst_rate: null,
        sgst_rate: null,
        igst_rate: null,
        cgst_amount: null,
        sgst_amount: null,
        igst_amount: null,
      };

      const { error: insertError } = await supabaseAdmin.from("invoices").insert(insertPayload);
      if (insertError) return res.status(500).json({ success: false, error: insertError.message });

      const customerEmailTo = customer_email || process.env.CUSTOMER_EMAIL_TO;
      const adminEmailTo = process.env.ADMIN_EMAIL_TO;
      const fromEmail = process.env.EMAIL_FROM || "no-reply@ankshaastra.com";
      const emailEnabled = !!(customerEmailTo || adminEmailTo);

      if (emailEnabled) {
        const subject = `Invoice ${invoice_number} - ${escapeHtml(service_title)}`;
        const html = `<div style="font-family:Arial;line-height:1.5">
  <h2 style="margin:0 0 8px 0">Invoice ${escapeHtml(invoice_number)}</h2>
  <p><b>Service:</b> ${escapeHtml(service_title)}</p>
  <p><b>Amount:</b> ₹${total_amount}</p>
  <p><b>Payment ID:</b> ${escapeHtml(razorpay_payment_id_str)}</p>
  <p style="color:#666">Generated automatically after successful payment.</p>
</div>`;

        const mailerProvider = process.env.MAILER_PROVIDER || "console";

        if (mailerProvider === "smtp") {
          const nodemailer = await import("nodemailer");
          const smtpHost = process.env.SMTP_HOST;
          const smtpPort = process.env.SMTP_PORT;
          const smtpUser = process.env.SMTP_USER;
          const smtpPass = process.env.SMTP_PASS;

          if (smtpHost && smtpPort && smtpUser && smtpPass) {
            const transporter = nodemailer.createTransport({
              host: smtpHost,
              port: parseInt(String(smtpPort), 10),
              secure: String(smtpPort) === "465",
              auth: { user: smtpUser, pass: smtpPass },
            });

            const recipients = [customerEmailTo, adminEmailTo].filter(Boolean);
            if (recipients.length) {
              await transporter.sendMail({
                from: fromEmail,
                to: recipients.join(","),
                subject,
                html,
              });
            }
          }
        } else {
          console.log("Invoice email payload:", {
            fromEmail,
            customerEmailTo,
            adminEmailTo,
            subject,
            html,
          });
        }
      }
    }

    await supabaseAdmin
      .from("orders")
      .update({
        status: "paid",
        razorpay_payment_id: razorpay_payment_id_str,
        razorpay_signature,
      })
      .eq("razorpay_order_id", order_id);

    return res.status(200).json({
      success: true,
      invoice_number,
      order_id,
      razorpay_payment_id: razorpay_payment_id_str,
    });
  } catch (e: any) {
    console.error("Invoice creation failed:", e);
    return res.status(500).json({ success: false, error: e?.message || "Invoice creation failed" });
  }
}

