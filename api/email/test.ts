import { getUserFromAuthHeader, isAdminUser } from '../lib/auth-api.js';
import { sendEmail } from '../lib/email-engine.js';
import { assertSmtpConfigured, getSmtpConfigStatus } from '../lib/smtp-config.js';
import { wrapEmailLayout } from '../lib/templates/email-layout.js';

type Req = {
  method?: string;
  headers?: { authorization?: string; Authorization?: string };
  body?: { to?: string };
};

type Res = {
  status: (n: number) => { json: (o: unknown) => void; end: () => void };
};

/** POST — admin-only: send a test email to verify SMTP configuration */
export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).end();

  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  const user = await getUserFromAuthHeader(authHeader);
  if (!user || !(await isAdminUser(user.id))) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const to = String(req.body?.to || user.email || '').trim();
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return res.status(400).json({ error: 'A valid recipient email is required' });
  }

  const config = getSmtpConfigStatus();
  try {
    assertSmtpConfigured();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'SMTP is not configured';
    return res.status(500).json({ error: msg, smtp: config });
  }

  const sentAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const html = wrapEmailLayout(
    `
      <h2 style="color:#d4af37;margin:0 0 16px">Test Email</h2>
      <p>This is a test message from the Ankshaastra Operations Console.</p>
      <p>If you received this email, SMTP delivery is working correctly.</p>
      <p style="font-size:13px;color:#9ca3af">Sent at ${sentAt} (IST) to ${to}</p>
    `,
    'Ankshaastra SMTP test',
  );

  try {
    const result = await sendEmail({
      to,
      subject: 'Ankshaastra — SMTP Test Email',
      html,
      templateSlug: 'smtp_test',
    });

    return res.status(200).json({
      ok: true,
      to,
      messageId: result.messageId,
      smtp: config,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Test email failed';
    console.error('[email-test]', msg, e);
    return res.status(500).json({
      error: msg,
      smtp: config,
    });
  }
}
