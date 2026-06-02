import crypto from 'crypto';
import { getSupabaseAdmin } from '../../api/lib/supabase-admin.js';
import {
  processInvoiceJob,
  orderHasDeliverableInvoice,
  orderInvoiceGenerationActive,
  paymentHasDeliverableInvoice,
  paymentInvoiceGenerationActive,
} from '../../api/lib/invoice-engine.js';
import { enqueueJob } from '../../api/lib/workflow-engine.js';
import { resolveOrderForPayment, invoiceJobKey } from '../../api/lib/payment-order-map.js';

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

    const resolved = await resolveOrderForPayment({
      razorpay_payment_id,
      razorpay_order_id,
      dbOrderId,
    });
    const orderId = resolved.orderId;

    if (!orderId) return res.status(404).json({ error: 'Order not found' });

    const hasInvoice =
      (await paymentHasDeliverableInvoice(razorpay_payment_id)) ||
      (await orderHasDeliverableInvoice(orderId));
    const invoiceActive =
      (await paymentInvoiceGenerationActive(razorpay_payment_id)) ||
      (await orderInvoiceGenerationActive(orderId));

    if (hasInvoice || invoiceActive) {
      const { data: existing } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      return res.status(200).json({
        ok: true,
        invoice_number: existing?.invoice_number,
        invoice_ready: true,
        already_exists: true,
      });
    }

    const result = await processInvoiceJob(orderId, {
      paymentId: razorpay_payment_id,
    });

    const { data: invoice } = await supabase
      .from('invoices')
      .select('invoice_number, pdf_storage_path, pdf_url')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!invoice?.pdf_storage_path && !invoice?.pdf_url) {
      await enqueueJob(
        'generate_and_deliver_invoice',
        { orderId, paymentId: razorpay_payment_id },
        { idempotencyKey: invoiceJobKey(orderId, razorpay_payment_id), priority: 1 },
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
