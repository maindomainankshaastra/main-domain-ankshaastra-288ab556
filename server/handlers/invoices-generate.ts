import { getUserFromAuthHeader, isAdminUser } from '../../api/lib/auth-api.js';
import { processInvoiceJob } from '../../api/lib/invoice-engine.js';

type Req = {
  method?: string;
  headers?: { authorization?: string; Authorization?: string };
  body?: { orderId?: string };
};

type Res = {
  status: (n: number) => { json: (o: unknown) => void; end: () => void };
};

/** POST — admin-only: generate invoice for a paid order */
export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).end();

  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  const user = await getUserFromAuthHeader(authHeader);
  if (!user || !(await isAdminUser(user.id))) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const orderId = String(req.body?.orderId || '').trim();
  if (!orderId) return res.status(400).json({ error: 'orderId is required' });

  try {
    const result = await processInvoiceJob(orderId, { forceDeliver: true });
    return res.status(200).json({
      ok: true,
      invoice_number: result.invoiceNumber,
      duplicate: result.duplicate ?? false,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Invoice generation failed';
    console.error('[invoice-generate]', msg, e);
    return res.status(500).json({ error: msg });
  }
}
