import { verifyApiKey } from '../lib/webhook-utils.js';
import { getSupabaseAdmin } from '../lib/supabase-admin.js';
import { calculateGst } from '../lib/gst.js';
import { enqueueJob } from '../lib/workflow-engine.js';
import { normalizeSourceWebsite } from '../lib/connected-sites.js';
import { resolveBusinessStateCode } from '../lib/build-invoice-template.js';
import { stateCodeFromName } from '../lib/indian-states.js';

function pickString(source: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return undefined;
}

function customerStateCodeFromMetadata(metadata: Record<string, unknown>): string | undefined {
  const snapshot = (metadata.formSnapshot as Record<string, unknown> | undefined) || metadata;
  return (
    pickString(snapshot, ['customerStateCode', 'stateCode']) ||
    stateCodeFromName(pickString(snapshot, ['customerState', 'officeState', 'currentState']))
  );
}

/** Central API gateway for connected websites (Empower, Miracle Baby, etc.). */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = req.headers['x-api-key'] as string | undefined;
  if (!verifyApiKey(apiKey)) return res.status(401).json({ error: 'Unauthorized' });

  const body = req.body || {};
  const sourceWebsite = normalizeSourceWebsite(body.sourceWebsite);
  const serviceTitle = String(body.serviceTitle || 'Service');
  const amount = Number(body.totalAmount || body.amount);
  const customer = body.customer || {};
  const metadata = (body.metadata as Record<string, unknown>) || {};
  const orderType = body.orderType || 'service';
  const autoInvoice = body.autoInvoice !== false;
  const paymentId = body.paymentId ? String(body.paymentId) : null;

  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

  const supabase = getSupabaseAdmin();

  if (paymentId) {
    const { data: existing } = await supabase
      .from('orders')
      .select('id, customer_id, status')
      .eq('razorpay_payment_id', paymentId)
      .maybeSingle();
    if (existing?.id) {
      return res.status(200).json({
        success: true,
        duplicate: true,
        orderId: existing.id,
        customerId: existing.customer_id,
        status: existing.status,
      });
    }
  }

  const { data: gstConfig } = await supabase.from('gst_config').select('*').limit(1).single();
  const businessState = resolveBusinessStateCode(gstConfig as Record<string, unknown>);
  const customerStateCode = customerStateCodeFromMetadata(metadata) || businessState;
  const gstRate = Number(gstConfig?.default_gst_rate ?? 18);

  const gst = calculateGst({
    amount,
    isGstInclusive: body.gstInclusive !== false,
    gstRate,
    businessStateCode: businessState,
    customerStateCode,
  });

  const { data: customerRow } = await supabase
    .from('customers')
    .insert({
      full_name: customer.name || 'Customer',
      email: customer.email,
      phone: customer.phone,
      whatsapp: customer.whatsapp || customer.phone,
      source_website: sourceWebsite,
      metadata,
    })
    .select('id')
    .single();

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      customer_id: customerRow?.id,
      service_title: serviceTitle,
      amount: gst.subtotal,
      gst_amount: gst.gstTotal,
      total_amount: gst.grandTotal,
      status: body.paymentStatus || 'paid',
      workflow_stage: body.paymentStatus === 'paid' ? 'payment_received' : 'order_created',
      source_website: sourceWebsite,
      order_type: orderType,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone || customer.whatsapp,
      metadata: {
        ...metadata,
        sourceWebsite,
        ingestedAt: new Date().toISOString(),
      },
      razorpay_payment_id: paymentId,
      razorpay_order_id: body.razorpayOrderId ? String(body.razorpayOrderId) : null,
      payment_method: body.paymentMethod || 'razorpay',
    })
    .select('*')
    .single();

  if (error) return res.status(500).json({ error: error.message });

  if (autoInvoice && order.status === 'paid') {
    await enqueueJob('generate_and_deliver_invoice', { orderId: order.id }, {
      idempotencyKey: `ingest-invoice-${order.id}`,
    });
  }

  return res.status(201).json({
    success: true,
    orderId: order.id,
    customerId: customerRow?.id,
    sourceWebsite,
  });
}
