import { processInvoiceJob } from '../../api/lib/invoice-engine.js';

type Req = {
  method?: string;
  headers?: { authorization?: string; Authorization?: string };
  body?: { orderId?: string; paymentId?: string; forceDeliver?: boolean };
};

type Res = {
  status: (n: number) => { json: (o: unknown) => void; end: () => void };
};

/** POST /api/invoices/generate-async — internal: generate invoice after payment (non-blocking). */
export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).end();

  const secret = process.env.CRON_SECRET || process.env.INTERNAL_API_SECRET;
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const orderId = String(req.body?.orderId || '').trim();
  const paymentId = req.body?.paymentId ? String(req.body.paymentId) : undefined;
  const forceDeliver = Boolean(req.body?.forceDeliver);

  if (!orderId) return res.status(400).json({ error: 'orderId is required' });

  try {
    const result = await processInvoiceJob(orderId, {
      paymentId,
      forceDeliver,
    });

    return res.status(200).json({
      ok: true,
      invoice_number: result.invoiceNumber,
      duplicate: result.duplicate ?? false,
      skipped: (result as { skipped?: boolean }).skipped ?? false,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Invoice generation failed';
    console.error('[generate-async]', msg, e);
    return res.status(500).json({ error: msg });
  }
}
