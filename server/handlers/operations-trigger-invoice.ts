import { verifyApiKey } from '../lib/webhook-utils.js';
import { scheduleInvoiceGeneration } from '../lib/schedule-invoice.js';

/**
 * POST /api/operations/trigger-invoice
 *
 * For connected sites (like Empower) that write orders directly into the
 * shared Supabase `orders` table instead of going through
 * `operations/order-ingest` — that direct-insert path creates the order
 * row but has no way to trigger invoice generation itself (it doesn't have
 * access to the hub's internal lib functions, only a Supabase client).
 * This endpoint is the missing piece: given an orderId that already exists
 * in the shared DB, it runs the exact same
 * generate-now-else-queue-as-fallback logic (`scheduleInvoiceGeneration`)
 * that the hub's own checkout and `order-ingest` use.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = req.headers['x-api-key'] as string | undefined;
  if (!verifyApiKey(apiKey)) return res.status(401).json({ error: 'Unauthorized' });

  const body = req.body || {};
  const orderId = body.orderId ? String(body.orderId) : '';
  const paymentId = body.paymentId ? String(body.paymentId) : undefined;

  if (!orderId) {
    return res.status(400).json({ error: 'orderId is required' });
  }

  try {
    await scheduleInvoiceGeneration(orderId, paymentId);
    return res.status(200).json({ success: true, orderId });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Invoice trigger failed';
    console.error('[trigger-invoice]', msg, e);
    return res.status(500).json({ success: false, error: msg });
  }
}
