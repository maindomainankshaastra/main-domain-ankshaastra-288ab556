import { verifyApiKey } from '../lib/webhook-utils.js';
import { getSupabaseAdmin } from '../lib/supabase-admin.js';
import { processInvoiceJob } from '../lib/invoice-engine.js';

/**
 * POST /api/operations/backfill-invoices
 * Regenerates invoices for paid orders stuck at payment_received (no invoice row).
 * Header: x-api-key (OPERATIONS_API_KEYS)
 * Body: { orderId?: string, limit?: number }
 */
export default async function handler(req: { method?: string; body?: Record<string, unknown>; headers?: Record<string, string | string[] | undefined> }, res: { status: (n: number) => { json: (o: unknown) => void; end: () => void } }) {
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = req.headers?.['x-api-key'];
  if (!verifyApiKey(typeof apiKey === 'string' ? apiKey : undefined)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const body = req.body || {};
  const orderId = body.orderId ? String(body.orderId) : null;
  const limit = Math.min(Number(body.limit) || 20, 50);

  try {
    const supabase = getSupabaseAdmin();
    const results: Array<{ orderId: string; ok: boolean; invoiceNumber?: string; error?: string }> = [];

    if (orderId) {
      const result = await processInvoiceJob(orderId);
      return res.status(200).json({
        ok: true,
        processed: 1,
        results: [{ orderId, ok: true, invoiceNumber: result.invoiceNumber }],
      });
    }

    const { data: orders } = await supabase
      .from('orders')
      .select('id, razorpay_payment_id, workflow_stage, status')
      .eq('status', 'paid')
      .in('workflow_stage', ['payment_received', 'payment_pending'])
      .order('created_at', { ascending: false })
      .limit(limit);

    for (const order of orders || []) {
      const { data: existing } = await supabase
        .from('invoices')
        .select('id, pdf_storage_path')
        .eq('order_id', order.id)
        .maybeSingle();

      if (existing?.pdf_storage_path) {
        results.push({ orderId: order.id, ok: true, invoiceNumber: 'already_exists' });
        continue;
      }

      try {
        const result = await processInvoiceJob(order.id, {
          paymentId: order.razorpay_payment_id || undefined,
        });
        results.push({ orderId: order.id, ok: true, invoiceNumber: result.invoiceNumber });
      } catch (e: unknown) {
        results.push({
          orderId: order.id,
          ok: false,
          error: e instanceof Error ? e.message : 'failed',
        });
      }
    }

    return res.status(200).json({ ok: true, processed: results.length, results });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Backfill failed';
    return res.status(500).json({ error: msg });
  }
}
