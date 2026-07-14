import { getUserFromAuthHeader, isAdminUser } from '../lib/auth-api.js';
import { getSupabaseAdmin } from '../lib/supabase-admin.js';
import { normalizeSourceWebsite } from '../lib/connected-sites.js';
import { processInvoiceJob } from '../lib/invoice-engine.js';

type Req = {
  method?: string;
  headers?: { authorization?: string; Authorization?: string };
  body?: {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    sourceWebsite?: string;
    serviceTitle?: string;
    packageName?: string;
    price?: number | string;
    gstRate?: number | string;
    paymentStatus?: string;
    invoiceDate?: string;
    notes?: string;
  };
};

type Res = {
  status: (n: number) => { json: (o: unknown) => void; end: () => void };
};

/**
 * POST /api/invoices/create-manual — admin-only.
 *
 * Creates an `orders` row from manually-entered fields (used by the admin
 * "Create Invoice" modal), then hands off to the EXISTING invoice engine
 * (processInvoiceJob) to do GST calculation, PDF generation, storage and
 * email delivery — no invoice logic is duplicated here.
 *
 * NOTE: `gstRate` and `invoiceDate` are stored on the order's metadata for
 * reference only. The underlying engine (generateInvoiceForOrder) currently
 * always derives GST from `gst_config.default_gst_rate` and always stamps
 * today's date — it does not yet accept per-order overrides. If you need
 * these two fields to actually change the generated invoice, that requires
 * a small follow-up change inside invoice-engine.ts itself.
 */
export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).end();

  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  const user = await getUserFromAuthHeader(authHeader);
  if (!user || !(await isAdminUser(user.id))) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const body = req.body || {};
  const customerName = String(body.customerName || '').trim();
  const customerEmail = String(body.customerEmail || '').trim();
  const serviceTitle = String(body.serviceTitle || '').trim();
  const price = Number(body.price);

  if (!customerName) return res.status(400).json({ error: 'Customer name is required' });
  if (!customerEmail) return res.status(400).json({ error: 'Customer email is required' });
  if (!serviceTitle) return res.status(400).json({ error: 'Service is required' });
  if (!price || price <= 0) return res.status(400).json({ error: 'A valid price is required' });

  const sourceWebsite = normalizeSourceWebsite(body.sourceWebsite);
  const paymentStatus = String(body.paymentStatus || 'paid');

  const supabase = getSupabaseAdmin();

  try {
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: body.customerPhone ? String(body.customerPhone) : null,
        service_title: body.packageName ? `${serviceTitle} — ${body.packageName}` : serviceTitle,
        amount: price,
        total_amount: price,
        status: paymentStatus,
        workflow_stage: paymentStatus === 'paid' ? 'payment_received' : 'order_created',
        source_website: sourceWebsite,
        order_type: 'manual',
        payment_method: 'manual',
        metadata: {
          notes: body.notes || null,
          packageName: body.packageName || null,
          requestedGstRate: body.gstRate != null && body.gstRate !== '' ? Number(body.gstRate) : null,
          requestedInvoiceDate: body.invoiceDate || null,
          createdByAdmin: user.id,
          manualEntry: true,
        },
      })
      .select('*')
      .single();

    if (orderErr || !order) {
      return res.status(500).json({ error: orderErr?.message || 'Could not create order' });
    }

    const result = await processInvoiceJob(order.id, { forceDeliver: paymentStatus === 'paid' });

    if (result.skipped || !result.invoiceId) {
      return res.status(202).json({
        ok: false,
        order_id: order.id,
        error: 'Invoice generation is still in progress. Please refresh in a few seconds.',
      });
    }

    return res.status(201).json({
      ok: true,
      order_id: order.id,
      invoice_id: result.invoiceId,
      invoice_number: result.invoiceNumber,
      duplicate: result.duplicate ?? false,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Invoice creation failed';
    console.error('[invoices-create-manual]', msg, e);
    return res.status(500).json({ error: msg });
  }
}