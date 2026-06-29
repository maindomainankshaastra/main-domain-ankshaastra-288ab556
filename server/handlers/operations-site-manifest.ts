import {
  CONNECTED_SITES,
  empowerIntegrationManifest,
  HUB_API_BASE,
  HUB_SITE_URL,
} from '../lib/connected-sites.js';

/** GET /api/operations/site-manifest — integration config for connected sites (Empower, etc.) */
export default async function handler(
  req: { method?: string; query?: Record<string, string | string[] | undefined> },
  res: { status: (n: number) => { json: (o: unknown) => void; end: () => void } },
) {
  if (req.method !== 'GET') return res.status(405).end();

  const site = String(req.query?.site || 'empower').toLowerCase();

  if (site === 'empower' || site === CONNECTED_SITES.EMPOWER) {
    return res.status(200).json(empowerIntegrationManifest());
  }

  return res.status(200).json({
    hubUrl: HUB_SITE_URL,
    apiBase: HUB_API_BASE,
    connectedSites: Object.values(CONNECTED_SITES),
    sites: {
      empower: empowerIntegrationManifest(),
    },
  });
}
