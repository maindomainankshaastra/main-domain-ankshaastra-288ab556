import { verifyApiKey } from '../lib/webhook-utils.js';
import { getSupabaseAdmin } from '../lib/supabase-admin.js';
import { calculateGst } from '../lib/gst.js';
import { scheduleInvoiceGeneration } from '../lib/schedule-invoice.js';
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

/**
 * Finds an existing CRM customer for this order, or creates one.
 *
 * Matching rule: same email OR same phone (case-insensitive email,
 * whitespace-trimmed) is treated as the same person, regardless of which
 * connected site they originally signed up on. This prevents a customer who
 * orders from Ankshaastra, then later from Miracle Baby or Empower, from
 * being duplicated into multiple CRM rows.
 *
 * If neither email nor phone is provided (some partner-site payloads omit
 * customer details entirely), we skip creating a customer record rather
 * than inserting a blank "Unknown" placeholder — the order itself still
 * gets created and still carries customer_name/email/phone directly, so no
 * data is lost, it just isn't linked to a CRM customer row.
 */
async function findOrCreateCustomer(params: {
  supabase: ReturnType<typeof getSupabaseAdmin>;
  name?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  sourceWebsite: string;
  metadata: Record<string, unknown>;
}): Promise<{ id: string } | null> {
  const { supabase, name, email, phone, whatsapp, sourceWebsite, metadata } = params;

  const normalizedEmail = email ? String(email).trim().toLowerCase() : null;
  const normalizedPhone = phone ? String(phone).trim() : null;

  // Nothing to match or store — don't create a junk customer row.
  if (!normalizedEmail && !normalizedPhone) {
    return null;
  }

  // Look for an existing customer by email OR phone, across all sites.
  let query = supabase.from('customers').select('id, full_name, email, phone, source_website').limit(1);
  if (normalizedEmail && normalizedPhone) {
    query = query.or(`email.eq.${normalizedEmail},phone.eq.${normalizedPhone}`);
  } else if (normalizedEmail) {
    query = query.eq('email', normalizedEmail);
  } else {
    query = query.eq('phone', normalizedPhone as string);
  }

  const { data: existing, error: lookupError } = await query.maybeSingle();
  if (lookupError) {
    console.error('[order-ingest] Customer lookup failed:', lookupError);
  }

  if (existing?.id) {
    // Update with any new/better information from this order. Only
    // overwrite fields that actually have a non-empty new value, so we
    // never blank out previously-known data (e.g. a returning customer
    // ordering from a form that doesn't collect their name again).
    const updatePayload: Record<string, unknown> = {
      source_website: sourceWebsite,
    };
    if (name) updatePayload.full_name = name;
    if (normalizedEmail) updatePayload.email = normalizedEmail;
    if (normalizedPhone) updatePayload.phone = normalizedPhone;
    if (whatsapp || normalizedPhone) updatePayload.whatsapp = whatsapp || normalizedPhone;

    const { error: updateError } = await supabase
      .from('customers')
      .update(updatePayload)
      .eq('id', existing.id);
    if (updateError) {
      console.error('[order-ingest] Customer update failed:', updateError);
    }
    return { id: existing.id };
  }

  const { data: created, error: insertError } = await supabase
    .from('customers')
    .insert({
      full_name: name || 'Customer',
      email: normalizedEmail,
      phone: normalizedPhone,
      whatsapp: whatsapp || normalizedPhone,
      source_website: sourceWebsite,
      metadata,
    })
    .select('id')
    .single();

  if (insertError) {
    console.error('[order-ingest] Customer creation failed:', insertError);
    return null;
  }

  return created ? { id: created.id } : null;
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

  // Find-or-create (upsert) the CRM customer instead of always inserting a
  // brand new row. Matches by email or phone across all connected sites.
  const customerRow = await findOrCreateCustomer({
    supabase,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    whatsapp: customer.whatsapp,
    sourceWebsite,
    metadata,
  });

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      customer_id: customerRow?.id ?? null,
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

  // FIX: this used to call `enqueueJob('generate_and_deliver_invoice', ...)`
  // directly, which only ever gets picked up by the daily cron job queue —
  // there was no attempt to generate the invoice right away. That's the
  // actual reason Empower/Miracle Baby orders coming through this route
  // never got an automatic invoice, while Ankshaastra's own checkout
  // (which goes through `fulfillPayment()` -> `scheduleInvoiceGeneration()`)
  // always did: that path tries inline generation FIRST and only falls back
  // to the same daily queue if the inline attempt fails. Calling
  // `scheduleInvoiceGeneration()` here instead gives partner-site orders
  // the exact same "generate now, queue as last resort" behavior as the
  // main site — no more relying on a daily cron alone.
  if (autoInvoice && order.status === 'paid') {
    await scheduleInvoiceGeneration(order.id, paymentId || undefined);
  }

  return res.status(201).json({
    success: true,
    orderId: order.id,
    customerId: customerRow?.id ?? null,
    sourceWebsite,
  });
}
