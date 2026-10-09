const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

export type SmtpConfigStatus = {
  host: boolean;
  port: boolean;
  user: boolean;
  password: boolean;
  from: boolean;
  secure: boolean;
};

function trim(value: string | undefined): string {
  return String(value ?? '').trim();
}

/** True when the value is an email address, not a mail-server hostname. */
export function looksLikeEmailAddress(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

/**
 * Resolves SMTP settings from environment variables.
 * Fixes a common misconfiguration where the mailbox address was set as SMTP_HOST.
 */
export function resolveSmtpConfig(): SmtpConfig {
  let host = trim(process.env.SMTP_HOST);
  let user = trim(process.env.SMTP_USER);
  const pass = trim(process.env.SMTP_PASSWORD || process.env.SMTP_PASS);
  const from = trim(process.env.EMAIL_FROM);
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === 'true';

  if (host && looksLikeEmailAddress(host)) {
    const mailbox = host;
    const domain = mailbox.split('@')[1]?.toLowerCase();
    if (!domain) {
      throw new Error(
        `SMTP_HOST is set to "${mailbox}", which is an email address. Set SMTP_HOST to your mail server hostname (e.g. mail.${domain ?? 'yourdomain.com'}).`,
      );
    }
    if (!user) {
      user = mailbox;
    }
    host = `mail.${domain}`;
    console.warn(
      `[smtp] SMTP_HOST was an email address (${mailbox}); using inferred host "${host}". Set SMTP_HOST explicitly on Vercel.`,
    );
  }

  return { host, port, secure, user, pass, from };
}
/**
 * Per-site sender. The Shopify store (shop.ankshaastra.com) sends from
 * no-reply@ankshaastra.in by default. Everything else keeps the global SMTP_* / EMAIL_FROM.
 *
 * Optional overrides (Vercel env), all fall back to the global SMTP_* values:
 *   SHOP_EMAIL_FROM, SHOP_SMTP_HOST, SHOP_SMTP_PORT, SHOP_SMTP_SECURE,
 *   SHOP_SMTP_USER, SHOP_SMTP_PASSWORD
 */
export const SHOP_DEFAULT_FROM = 'Ankshaastra <no-reply@ankshaastra.in>';
export const SHOP_DEFAULT_ADMIN_EMAIL = 'orders@ankshaastra.in';

export function isShopSite(site?: string | null): boolean {
  return String(site || '').trim().toLowerCase().startsWith('shop.');
}

export function resolveSmtpConfigForSite(site?: string | null): SmtpConfig {
  const base = resolveSmtpConfig();
  if (!isShopSite(site)) return base;

  const port = trim(process.env.SHOP_SMTP_PORT);
  const secure = trim(process.env.SHOP_SMTP_SECURE);
  return {
    host: trim(process.env.SHOP_SMTP_HOST) || base.host,
    port: port ? Number(port) : base.port,
    secure: secure ? secure === 'true' : base.secure,
    user: trim(process.env.SHOP_SMTP_USER) || base.user,
    pass: trim(process.env.SHOP_SMTP_PASSWORD) || base.pass,
    from: trim(process.env.SHOP_EMAIL_FROM) || SHOP_DEFAULT_FROM,
  };
}

export function assertSmtpConfiguredForSite(site?: string | null): SmtpConfig {
  if (!isShopSite(site)) return assertSmtpConfigured();
  // Validate with the same rules, but against the shop profile.
  const cfg = resolveSmtpConfigForSite(site);
  if (!cfg.host || !cfg.user || !cfg.pass || !cfg.from) {
    throw new Error(
      'SMTP is not fully configured for the shop. Set SMTP_HOST/SMTP_USER/SMTP_PASSWORD (or the SHOP_SMTP_* overrides) on the server.',
    );
  }
  if (looksLikeEmailAddress(cfg.host)) {
    throw new Error(`SMTP host must be a mail server hostname, not "${cfg.host}".`);
  }
  if (!Number.isFinite(cfg.port) || cfg.port <= 0) {
    throw new Error('SHOP_SMTP_PORT / SMTP_PORT must be a valid port number.');
  }
  return cfg;
}

export function getSmtpConfigStatus(): SmtpConfigStatus {
  const cfg = resolveSmtpConfig();
  return {
    host: Boolean(cfg.host),
    port: Boolean(process.env.SMTP_PORT || cfg.port),
    user: Boolean(cfg.user),
    password: Boolean(cfg.pass),
    from: Boolean(cfg.from),
    secure: cfg.secure,
  };
}

export function assertSmtpConfigured(): SmtpConfig {
  const cfg = resolveSmtpConfig();

  if (!cfg.host || !cfg.user || !cfg.pass || !cfg.from) {
    throw new Error(
      'SMTP is not fully configured. Set SMTP_HOST (hostname), SMTP_USER, SMTP_PASSWORD (or SMTP_PASS), and EMAIL_FROM on the server.',
    );
  }

  if (looksLikeEmailAddress(cfg.host)) {
    throw new Error(
      `SMTP_HOST must be a mail server hostname (e.g. mail.ankshaastra.com), not "${cfg.host}". Use SMTP_USER for the mailbox address.`,
    );
  }

  if (!Number.isFinite(cfg.port) || cfg.port <= 0) {
    throw new Error(`SMTP_PORT must be a valid port number (got "${process.env.SMTP_PORT ?? ''}").`);
  }

  return cfg;
}

export function formatSmtpError(error: unknown, host?: string): string {
  const err = error as { code?: string; message?: string };
  const message = err?.message || 'Email send failed';

  if (err?.code === 'EAUTH') {
    return 'SMTP authentication failed. Check SMTP_USER and SMTP_PASSWORD (or SMTP_PASS) in Vercel.';
  }
  if (err?.code === 'ECONNECTION' || err?.code === 'ETIMEDOUT') {
    return `Cannot reach SMTP server${host ? ` at ${host}` : ''}. Check SMTP_HOST, SMTP_PORT, and SMTP_SECURE.`;
  }
  if (/getaddrinfo/i.test(message)) {
    const badHost = host || message.split(/\s+/).pop();
    if (badHost && looksLikeEmailAddress(badHost)) {
      return `SMTP_HOST is set to "${badHost}" (an email address). Use your mail server hostname instead (e.g. mail.ankshaastra.com) and put the mailbox in SMTP_USER.`;
    }
    return `DNS lookup failed for SMTP host${badHost ? ` "${badHost}"` : ''}. Verify SMTP_HOST is correct and reachable from Vercel.`;
  }

  return message;
}
