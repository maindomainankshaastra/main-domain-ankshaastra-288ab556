import crypto from 'crypto';
import { getSupabaseAdmin } from '../lib/supabase-admin.js';
import { logWebhook } from '../lib/webhook-utils.js';
import { CONNECTED_SITES } from '../lib/connected-sites.js';
import { round2 } from '../lib/gst.js';
import { stateCodeFromName } from '../lib/indian-states.js';
import ingestOrder from './operations-order-ingest.js';

/**
 * POST /api/webhooks/shopify
 *
 * Receives Shopify order webhooks (orders/paid, orders/create, orders/fulfilled) for
 * shop.ankshaastra.com, verifies Shopify's HMAC signature, converts the Shopify order into
 * the payload understood by /api/operations/order-ingest and hands it over. Everything after
 * that (product-wise HSN/GST, S26-27/0001 numbering, goods PDF, emails) is the normal pipeline.
 *
 * Safe to receive the same order several times: the payment id `shopify_<order id>` makes
 * the ingest step idempotent (and the DB has a unique index on it).
 */

type Obj = Record<string, any>;

// ---------------------------------------------------------------------------------------
// raw body (needed for the HMAC) — never touch `req.body` first: on Vercel it consumes the stream
// ---------------------------------------------------------------------------------------
async function readStream(req: any, timeoutMs = 4000): Promise<string | null> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    const timer = setTimeout(() => resolve(null), timeoutMs);
    req.on('data', (c: Buffer | string) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on('end', () => {
      clearTimeout(timer);
      resolve(Buffer.concat(chunks).toString('utf8'));
    });
    req.on('error', () => {
      clearTimeout(timer);
      resolve(null);
    });
  });
}

async function getRawBody(req: any): Promise<{ raw: string | null; source: string }> {
  if (typeof req.rawBody === 'string') return { raw: req.rawBody, source: 'rawBody' };
  if (Buffer.isBuffer(req.rawBody)) return { raw: req.rawBody.toString('utf8'), source: 'rawBody' };

  if (req.readable && !req.readableEnded && typeof req.on === 'function') {
    const raw = await readStream(req);
    if (raw !== null) return { raw, source: 'stream' };
  }
  if (typeof req.body === 'string') return { raw: req.body, source: 'body-string' };
  if (Buffer.isBuffer(req.body)) return { raw: req.body.toString('utf8'), source: 'body-buffer' };
  if (req.body && typeof req.body === 'object') return { raw: JSON.stringify(req.body), source: 'body-reserialised' };
  return { raw: null, source: 'none' };
}

function validSignature(raw: string, header: string | undefined, secret: string): boolean {
  if (!header) return false;
  const expected = crypto.createHmac('sha256', secret).update(raw, 'utf8').digest();
  let provided: Buffer;
  try {
    provided = Buffer.from(header, 'base64');
  } catch {
    return false;
  }
  return provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
}

// ---------------------------------------------------------------------------------------
// Shopify order -> order-ingest payload
// ---------------------------------------------------------------------------------------
const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const str = (v: unknown) => (v === null || v === undefined ? '' : String(v).trim());
const COD_RE = /\bcod\b|cash on delivery|cash_on_delivery/i;

function mapAddress(a: Obj | null | undefined) {
  if (!a) return undefined;
  return {
    name: str(a.name) || [str(a.first_name), str(a.last_name)].filter(Boolean).join(' '),
    line1: str(a.address1),
    line2: str(a.address2),
    city: str(a.city),
    state: str(a.province),
    pincode: str(a.zip),
    phone: str(a.phone),
  };
}

function mapShopifyOrder(order: Obj): { body?: Obj; skip?: string } {
  const orderId = str(order.id);
  if (!orderId) return { skip: 'No order id' };

  const gateways: string[] = Array.isArray(order.payment_gateway_names) ? order.payment_gateway_names.map(str) : [];
  const isCod = gateways.some((g) => COD_RE.test(g)) || COD_RE.test(str(order.gateway));
  const financial = str(order.financial_status).toLowerCase();
  const paid = financial === 'paid' || financial === 'partially_refunded';

  if (!paid && !isCod) return { skip: `Not paid yet (financial_status: ${financial || 'unknown'})` };
  if (['refunded', 'voided'].includes(financial)) return { skip: `Order is ${financial}` };

  const taxesIncluded = order.taxes_included !== false;
  const sumTax = (lines: Obj[] | undefined) => (lines || []).reduce((s, t) => s + num(t.price), 0);

  const lineItems = (Array.isArray(order.line_items) ? order.line_items : [])
    .filter((li: Obj) => !li.gift_card)
    .map((li: Obj) => {
      const qty = Math.max(1, num(li.quantity) || 1);
      const allocated = (li.discount_allocations || []).reduce((s: number, d: Obj) => s + num(d.amount), 0);
      const discount = Math.max(num(li.total_discount), allocated);
      const extraTax = taxesIncluded ? 0 : sumTax(li.tax_lines);
      const list = round2(num(li.price) * qty + extraTax);
      return {
        name: str(li.name) || str(li.title),
        title: str(li.title),
        variantTitle: str(li.variant_title),
        sku: str(li.sku),
        quantity: qty,
        listAmount: list,
        amount: round2(list - discount),
      };
    });
  if (!lineItems.length) return { skip: 'No product lines' };

  // Shipping lines; a "COD" shipping line is treated as the COD handling charge.
  let shipping = 0;
  let codCharge = 0;
  for (const sl of Array.isArray(order.shipping_lines) ? order.shipping_lines : []) {
    const price = num(sl.discounted_price ?? sl.price) + (taxesIncluded ? 0 : sumTax(sl.tax_lines));
    if (COD_RE.test(str(sl.title)) || COD_RE.test(str(sl.code))) codCharge += price;
    else shipping += price;
  }

  const ship = mapAddress(order.shipping_address) || mapAddress(order.billing_address);
  const bill = mapAddress(order.billing_address) || ship;
  const customerObj: Obj = order.customer || {};
  const name =
    str(ship?.name) ||
    [str(customerObj.first_name), str(customerObj.last_name)].filter(Boolean).join(' ') ||
    str(order.email) ||
    'Customer';

  const fulfilment = (Array.isArray(order.fulfillments) ? order.fulfillments : []).find(
    (f: Obj) => str(f.tracking_number) || (Array.isArray(f.tracking_numbers) && f.tracking_numbers.length),
  );

  const gstinAttr = (Array.isArray(order.note_attributes) ? order.note_attributes : []).find((a: Obj) =>
    /gst/i.test(str(a.name)),
  );
  const customerGstin = gstinAttr ? str(gstinAttr.value).toUpperCase() : '';

  const body: Obj = {
    sourceWebsite: CONNECTED_SITES.SHOP,
    orderType: 'product',
    totalAmount: num(order.total_price),
    shippingAmount: round2(shipping),
    codAmount: round2(codCharge),
    paymentStatus: 'paid',
    paymentId: `shopify_${orderId}`,
    paymentMethod: isCod ? 'cod' : gateways[0] || 'shopify',
    autoInvoice: true,
    gstInclusive: true,
    lineItems,
    customer: {
      name,
      email: str(order.email) || str(customerObj.email),
      phone: str(order.phone) || str(ship?.phone) || str(customerObj.phone),
    },
    metadata: {
      paymentMode: isCod ? 'cod' : 'prepaid',
      shippingAddress: ship,
      billingAddress: bill,
      customerState: ship?.state || undefined,
      customerStateCode: ship?.state ? stateCodeFromName(ship.state) : undefined,
      pincode: ship?.pincode || undefined,
      customerGstin: customerGstin || undefined,
      courierName: fulfilment ? str(fulfilment.tracking_company) || undefined : undefined,
      awbNumber: fulfilment
        ? str(fulfilment.tracking_number) || str((fulfilment.tracking_numbers || [])[0]) || undefined
        : undefined,
      shopifyOrderId: orderId,
      shopifyOrderName: str(order.name),
    },
  };
  return { body };
}

// ---------------------------------------------------------------------------------------
// internal call into the existing ingest handler
// ---------------------------------------------------------------------------------------
function internalApiKey(): string {
  const raw = [process.env.OPERATIONS_API_KEYS, process.env.PARTNER_API_KEY].filter(Boolean).join(',');
  return raw.split(',').map((s) => s.trim()).filter(Boolean)[0] || '';
}

async function runIngest(body: Obj, key: string): Promise<{ status: number; payload: any }> {
  let status = 200;
  let payload: any;
  const res = {
    status(n: number) {
      status = n;
      return res;
    },
    json(o: unknown) {
      payload = o;
      return res;
    },
    end() {
      return res;
    },
  };
  await ingestOrder({ method: 'POST', headers: { 'x-api-key': key }, body }, res);
  return { status, payload };
}

const isDuplicateError = (v: unknown) => /duplicate key|unique constraint/i.test(JSON.stringify(v || ''));

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();

  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[shopify-webhook] SHOPIFY_WEBHOOK_SECRET is not set');
    return res.status(500).json({ error: 'Webhook is not configured' });
  }

  const { raw, source } = await getRawBody(req);
  if (raw === null) return res.status(400).json({ error: 'Empty body' });

  const signature = (req.headers['x-shopify-hmac-sha256'] as string | undefined) || undefined;
  if (!validSignature(raw, signature, secret)) {
    console.warn(`[shopify-webhook] invalid signature (body source: ${source})`);
    return res.status(401).json({ error: 'Invalid signature', bodySource: source });
  }

  let order: Obj;
  try {
    order = JSON.parse(raw);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const topic = String(req.headers['x-shopify-topic'] || 'unknown');
  let logId: string | undefined;
  try {
    const logged = await logWebhook({
      source: 'shopify',
      eventType: topic,
      payload: { id: order.id, name: order.name, financial_status: order.financial_status },
      signatureValid: true,
    });
    logId = logged.id as string;
  } catch (e) {
    console.warn('[shopify-webhook] could not write webhooks_log:', e);
  }

  const setLog = async (status: 'processed' | 'failed', error?: string) => {
    if (!logId) return;
    try {
      await getSupabaseAdmin()
        .from('webhooks_log')
        .update({
          status,
          ...(status === 'processed' ? { processed_at: new Date().toISOString() } : {}),
          ...(error ? { error_message: error.slice(0, 500) } : {}),
        })
        .eq('id', logId);
    } catch {
      /* logging must never break the webhook */
    }
  };

  try {
    const mapped = mapShopifyOrder(order);
    if (!mapped.body) {
      await setLog('processed', `Ignored: ${mapped.skip}`);
      return res.status(200).json({ ok: true, ignored: mapped.skip });
    }

    const key = internalApiKey();
    if (!key) {
      await setLog('failed', 'No OPERATIONS_API_KEYS / PARTNER_API_KEY configured on the server');
      return res.status(500).json({ error: 'Server API key is not configured' });
    }

    const result = await runIngest(mapped.body, key);
    const p = result.payload || {};

    // Per-group failures are reported inside a 201 by the line-item splitter.
    const failedGroup = Array.isArray(p.groups)
      ? p.groups.find((g: Obj) => g.status >= 400 && !isDuplicateError(g.payload))
      : undefined;

    if ((result.status >= 400 && !isDuplicateError(p)) || failedGroup) {
      const msg = JSON.stringify(failedGroup?.payload || p).slice(0, 400);
      await setLog('failed', msg);
      return res.status(500).json({ error: 'Order could not be processed', detail: msg }); // Shopify will retry
    }

    if (p.invoiceHeld) {
      const why = Array.isArray(p.unmatched) && p.unmatched.length
        ? `Invoice on hold - products not in tax catalog: ${p.unmatched.join(' | ')}`
        : `Invoice on hold (${p.reason || 'review needed'})`;
      await setLog('failed', why);
      return res.status(200).json({ ok: true, invoiceHeld: true, reason: p.reason, unmatched: p.unmatched });
    }

    await setLog('processed');
    return res.status(200).json({ ok: true, duplicate: Boolean(p.duplicate), orders: p.groups?.length ?? 1 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[shopify-webhook] failed:', e);
    await setLog('failed', msg);
    return res.status(500).json({ error: msg }); // Shopify will retry
  }
}
