// import { getUserFromAuthHeader, isAdminUser } from '../lib/auth-api.js';
import { getUserFromAuthHeader, hasModuleAccess } from '../lib/auth-api.js';
import { getSupabaseAdmin } from '../lib/supabase-admin.js';
import { normalizeSourceWebsite } from '../lib/connected-sites.js';
import { processInvoiceJob } from '../lib/invoice-engine.js';

type Req = {
  method?: string;
  headers?: { authorization?: string; Authorization?: string };
  body?: {
    invoiceId?: string;
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
    customerCity?: string;
    customerState?: string;
    customerPincode?: string;
    customerGstin?: string;
  };
};

type Res = {
  status: (n: number) => { json: (o: unknown) => void; end: () => void };
};

/**
 * Edits a manually-created invoice — including paid ones, per business decision.
 *
 * NOTE: editing a paid invoice regenerates the invoice number and PDF, which
 * can create a mismatch against any copy the customer already received by
 * email, and can affect GST filings that referenced the original invoice
 * number/amount. This tradeoff was made knowingly.
 *
 * Implementation choice: this does NOT re-derive GST math itself. It updates
 * the underlying order, deletes the old invoice + its line items, then
 * re-runs processInvoiceJob() — the exact same generation pipeline
 * invoices-create-manual.ts uses.
 *
 * Edits never auto-email the customer (forceDeliver: false below) — sending
 * only happens via the explicit "Send Invoice Email" button in the UI.
 */
export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).end();

  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  const user = await getUserFromAuthHeader(authHeader);
  if (!user) return res.status(403).json({ error: 'Admin access required' });

  // const adminCheck = await isAdminUser(user.id);
  const adminCheck = await hasModuleAccess(user.id, 'invoices');
  if (!adminCheck) return res.status(403).json({ error: 'Admin access required' });

  const body = req.body || {};
  const invoiceId = String(body.invoiceId || '').trim();
  if (!invoiceId) return res.status(400).json({ error: 'invoiceId is required' });

  const customerName = String(body.customerName || '').trim();
  const customerEmail = String(body.customerEmail || '').trim();
  const serviceTitle = String(body.serviceTitle || '').trim();
  const price = Number(body.price);

  if (!customerName) return res.status(400).json({ error: 'Customer name is required' });
  if (!customerEmail) return res.status(400).json({ error: 'Customer email is required' });
  if (!serviceTitle) return res.status(400).json({ error: 'Service is required' });
  if (!price || price <= 0) return res.status(400).json({ error: 'A valid price is required' });

  const customerCity = body.customerCity ? String(body.customerCity).trim() : '';
  const customerState = body.customerState ? String(body.customerState).trim() : '';
  const customerPincode = body.customerPincode ? String(body.customerPincode).trim() : '';
  const customerGstin = body.customerGstin ? String(body.customerGstin).trim().toUpperCase() : '';

  const sourceWebsite = normalizeSourceWebsite(body.sourceWebsite);
  const paymentStatus = String(body.paymentStatus || 'pending');

  const supabase = getSupabaseAdmin();

  try {
    const { data: existingInvoice, error: fetchErr } = await supabase
      .from('invoices')
      .select('id, order_id')
      .eq('id', invoiceId)
      .single();

    if (fetchErr || !existingInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const orderId = existingInvoice.order_id as string;
    if (!orderId) {
      return res.status(500).json({ error: 'Invoice has no linked order — cannot regenerate' });
    }

    const { data: order, error: orderFetchErr } = await supabase
      .from('orders')
      .select('metadata')
      .eq('id', orderId)
      .single();
    if (orderFetchErr || !order) {
      return res.status(500).json({ error: 'Linked order not found' });
    }

    const existingMetadata = (order.metadata as Record<string, unknown>) || {};

    const { error: orderUpdateErr } = await supabase
      .from('orders')
      .update({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: body.customerPhone ? String(body.customerPhone) : null,
        service_title: body.packageName ? `${serviceTitle} — ${body.packageName}` : serviceTitle,
        amount: price,
        total_amount: price,
        status: paymentStatus,
        workflow_stage: paymentStatus === 'paid' ? 'payment_received' : 'order_created',
        source_website: sourceWebsite,
        metadata: {
          ...existingMetadata,
          notes: body.notes || null,
          packageName: body.packageName || null,
          requestedGstRate: body.gstRate != null && body.gstRate !== '' ? Number(body.gstRate) : null,
          requestedInvoiceDate: body.invoiceDate || null,
          editedByAdmin: user.id,
          currentCity: customerCity || null,
          customerState: customerState || null,
          pincode: customerPincode || null,
          customerGstin: customerGstin || null,
        },
      })
      .eq('id', orderId);

    if (orderUpdateErr) {
      return res.status(500).json({ error: orderUpdateErr.message });
    }

    await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId);
    await supabase.from('invoices').delete().eq('id', invoiceId);

    const result = await processInvoiceJob(orderId, { forceDeliver: false });

    if (result.skipped || !result.invoiceId) {
      return res.status(202).json({
        ok: false,
        order_id: orderId,
        error: 'Invoice regeneration is still in progress. Please refresh in a few seconds.',
      });
    }

    return res.status(200).json({
      ok: true,
      order_id: orderId,
      invoice_id: result.invoiceId,
      invoice_number: result.invoiceNumber,
      duplicate: result.duplicate ?? false,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Invoice update failed';
    console.error('[invoices-update-manual]', msg, e);
    return res.status(500).json({ error: msg });
  }
}
