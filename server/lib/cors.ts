import { partnerOrigins, PARTNER_API_ROUTES } from './connected-sites.js';

type ReqLike = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
};

type ResLike = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => { end: () => void };
};

export function isPartnerPublicRoute(routeKey: string): boolean {
  return PARTNER_API_ROUTES.has(routeKey);
}

function readOrigin(req: ReqLike): string | undefined {
  const raw = req.headers?.origin;
  if (Array.isArray(raw)) return raw[0];
  return raw;
}

/** Apply CORS headers for partner sites. Returns true if OPTIONS preflight was handled. */
export function applyPartnerCors(req: ReqLike, res: ResLike): boolean {
  const origin = readOrigin(req);
  const allowed = partnerOrigins();
  const allowOrigin = origin && allowed.includes(origin) ? origin : allowed[0] || '*';

  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Api-Key');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}
