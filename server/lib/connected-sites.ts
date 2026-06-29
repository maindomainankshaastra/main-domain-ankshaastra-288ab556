/** Registered multi-site domains (matches public.website_source enum). */
export const CONNECTED_SITES = {
  MAIN: 'ankshaastra.com',
  EMPOWER: 'empower.ankshaastra.com',
  MIRACLEBABY: 'miraclebaby.ankshaastra.com',
} as const;

export type ConnectedSiteDomain = (typeof CONNECTED_SITES)[keyof typeof CONNECTED_SITES];

export const HUB_SITE_URL =
  (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://ankshaastra.com').replace(/\/$/, '');

export const HUB_API_BASE = `${HUB_SITE_URL}/api`;

const ALLOWED_SOURCES = new Set<string>(Object.values(CONNECTED_SITES));

export function isAllowedSourceWebsite(site?: string | null): site is ConnectedSiteDomain {
  const value = String(site || '').trim().toLowerCase();
  return ALLOWED_SOURCES.has(value);
}

export function normalizeSourceWebsite(site?: string | null): ConnectedSiteDomain {
  const value = String(site || '').trim().toLowerCase();
  if (isAllowedSourceWebsite(value)) return value;
  return CONNECTED_SITES.MAIN;
}

/** Browser origins allowed to call hub APIs (CORS). */
export function partnerOrigins(): string[] {
  const fromEnv = (process.env.PARTNER_SITE_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const defaults = [
    'https://empower.ankshaastra.com',
    'https://www.empower.ankshaastra.com',
    'https://miraclebaby.ankshaastra.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
  ];

  return [...new Set([...fromEnv, ...defaults])];
}

export const PARTNER_API_ROUTES = new Set([
  'create-order',
  'verify-payment',
  'sync-payment',
  'services',
  'operations/site-manifest',
]);

export function empowerIntegrationManifest() {
  return {
    site: CONNECTED_SITES.EMPOWER,
    displayName: 'Empower — Perfect Baby Name',
    hubUrl: HUB_SITE_URL,
    apiBase: HUB_API_BASE,
    sourceWebsite: CONNECTED_SITES.EMPOWER,
    gst: {
      sacCode: '999799',
      defaultRate: 18,
      supplierStateCode: '09',
    },
    endpoints: {
      siteManifest: `${HUB_API_BASE}/operations/site-manifest`,
      services: `${HUB_API_BASE}/services`,
      createOrder: `${HUB_API_BASE}/create-order`,
      verifyPayment: `${HUB_API_BASE}/verify-payment`,
      syncPayment: `${HUB_API_BASE}/sync-payment`,
      orderIngest: `${HUB_API_BASE}/operations/order-ingest`,
    },
    requiredOrderFields: {
      sourceWebsite: CONNECTED_SITES.EMPOWER,
      metadata: {
        formSnapshot: {
          customerState: 'string — required for GSTR place of supply',
          customerStateCode: 'string — 2-digit GST state code',
          pincode: 'string — 6-digit PIN',
          fullName: 'string',
          email: 'string',
          whatsapp: 'string',
        },
      },
    },
    auth: {
      browserCheckout: 'Uses shared Razorpay keys (VITE_RAZORPAY_KEY_ID on Empower)',
      serverIngest: 'Header x-api-key must match OPERATIONS_API_KEYS on hub Vercel',
    },
  };
}
