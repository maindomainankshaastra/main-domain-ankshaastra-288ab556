import crypto from 'crypto';
import { getSupabaseAdmin } from '../../api/lib/supabase-admin.js';
import { processInvoiceJob } from '../../api/lib/invoice-engine.js';
import { enqueueJob } from '../../api/lib/workflow-engine.js';

type Req = {
  method?: string;
  body?: Record<string, unknown>;
};

type Res = {
  status: (n: number) => { json: (o: unknown) => void; end: () => void };
};

/**
 * POST /api/invoices/complete-order
 * Secured by Razorpay payment signature — used when verify-payment times out
 * but payment was captured. Idempotent.
 */
export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).end();

  const body = req.body || {};
  const razorpay_order_id = String(body.razorpay_order_id || '');
  const razorpay_payment_id = String(body.razorpay_payment_id || '');
  const razorpay_signature = String(body.razorpay_signature || '');
  const dbOrderId = body.dbOrderId ? String(body.dbOrderId) : null;

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return res.status(500).json({ error: 'Razorpay secret missing' });
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing Razorpay fields' });
  }

  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expected !== razorpay_signature) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    const supabase = getSupabaseAdmin();

    let orderId = dbOrderId;
    if (orderId) {
      const { data: byId } = await supabase
        .from('orders')
        .select('id, razorpay_order_id, status')
        .eq('id', orderId)
        .maybeSingle();
      if (!byId || byId.razorpay_order_id !== razorpay_order_id) {
        orderId = null;
      }
    }

    if (!orderId) {
      const { data: byRz } = await supabase
        .from('orders')
        .select('id')
        .eq('razorpay_order_id', razorpay_order_id)
        .maybeSingle();
      orderId = byRz?.id || null;
    }

    if (!orderId) return res.status(404).json({ error: 'Order not found' });

    const { data: existing } = await supabase
      .from('invoices')
      .select('invoice_number, pdf_storage_path, pdf_url')
      .eq('order_id', orderId)
      .maybeSingle();

    if (existing?.pdf_storage_path || existing?.pdf_url) {
      return res.status(200).json({
        ok: true,
        invoice_number: existing.invoice_number,
        invoice_ready: true,
        already_exists: true,
      });
    }

    const result = await processInvoiceJob(orderId, {
      paymentId: razorpay_payment_id,
      forceDeliver: true,
    });

    const { data: invoice } = await supabase
      .from('invoices')
      .select('invoice_number, pdf_storage_path, pdf_url')
      .eq('order_id', orderId)
      .maybeSingle();

    if (!invoice?.pdf_storage_path && !invoice?.pdf_url) {
      await enqueueJob(
        'generate_and_deliver_invoice',
        { orderId },
        { idempotencyKey: `invoice-retry-${orderId}-${Date.now()}`, priority: 1 },
      );
      return res.status(202).json({
        ok: false,
        error: 'Invoice is still processing',
        order_id: orderId,
      });
    }

    return res.status(200).json({
      ok: true,
      invoice_number: result.invoiceNumber || invoice?.invoice_number,
      invoice_ready: true,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Invoice completion failed';
    console.error('[complete-order]', msg, e);
    return res.status(500).json({ error: msg });
  }
}
