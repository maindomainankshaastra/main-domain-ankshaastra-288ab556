import { getSupabaseAdmin } from './supabase-admin.js';
import { round2 } from './gst.js';

/**
 * Product-wise HSN + GST for the Shopify store.
 *
 * Shopify Flow sends `lineItems` (name/sku/quantity/amount). Each line is matched
 * against `product_catalog` (title or sku) to get its HSN and GST rate. Lines that
 * share the same GST RATE are grouped (each line keeps its own HSN), and ONE order
 * (=> one invoice) is created per rate group by re-using the normal order-ingest logic.
 * A cart where every item has the same rate (the common case) therefore produces exactly
 * one invoice, with an HSN-wise summary when HSNs differ. Shipping and COD charges are
 * separate lines on each invoice, taxed at that invoice's rate.
 *
 * Nothing is guessed: if any line cannot be matched, the order is saved but NO
 * invoice is generated, and the unmatched names are returned so the catalog can be
 * fixed and the invoice triggered afterwards.
 */

export type ShopLineItem = {
  name?: string;
  title?: string;
  variantTitle?: string;
  sku?: string;
  quantity?: number;
  /** Line total AFTER discounts, GST-inclusive, in INR. */
  amount?: number;
  /** Line total BEFORE discounts, GST-inclusive, in INR (optional; enables the Discount column). */
  listAmount?: number;
  /** Unit of measure: NOS (default), PCS, GMS ... */
  uom?: string;
};

type CatalogRow = { sku: string | null; title: string; gst_rate: number | string; hsn_sac_code: string | null };

export function normalizeProductKey(input: string): string {
  return String(input || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/\s*([-|:,/()])\s*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

type GroupLine = { name: string; quantity: number; amount: number; listAmount?: number; hsn: string; uom: string };
type Group = {
  rate: number;
  lines: GroupLine[];
  amount: number;
};

function captureRes() {
  let status = 200;
  let payload: unknown;
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
  return { res, result: () => ({ status, payload }) };
}

export async function handleLineItemOrder(
  req: any,
  res: any,
  body: Record<string, any>,
  site: string,
  ingestOne: (req: any, res: any) => Promise<unknown>,
) {
  const supabase = getSupabaseAdmin();
  const lineItems = (body.lineItems as ShopLineItem[]).filter((l) => Number(l?.amount) > 0);
  if (!lineItems.length) return res.status(400).json({ error: 'lineItems must have at least one line with amount > 0' });

  const { data: catalog, error } = await supabase
    .from('product_catalog')
    .select('sku, title, gst_rate, hsn_sac_code')
    .eq('is_active', true)
    .contains('source_websites', [site]);
  if (error) return res.status(500).json({ error: `Catalog lookup failed: ${error.message}` });

  const byTitle = new Map<string, CatalogRow>();
  const bySku = new Map<string, CatalogRow>();
  for (const row of (catalog || []) as CatalogRow[]) {
    byTitle.set(normalizeProductKey(row.title), row);
    if (row.sku) bySku.set(String(row.sku).trim().toLowerCase(), row);
  }

  const unmatched: string[] = [];
  const groups = new Map<string, Group>();

  for (const line of lineItems) {
    const title = String(line.title || '').trim();
    const variant = String(line.variantTitle || '').trim();
    const displayName = String(line.name || (variant ? `${title} - ${variant}` : title)).trim();
    const candidates = [line.name, variant ? `${title} - ${variant}` : '', title, variant]
      .map((c) => normalizeProductKey(String(c || '')))
      .filter(Boolean);

    let row: CatalogRow | undefined = line.sku ? bySku.get(String(line.sku).trim().toLowerCase()) : undefined;
    for (const c of candidates) {
      if (row) break;
      row = byTitle.get(c);
    }

    const hsn = String(row?.hsn_sac_code || '').trim();
    if (!row || !/^(\d{4}|\d{6}|\d{8})$/.test(hsn) || !Number.isFinite(Number(row.gst_rate))) {
      unmatched.push(displayName);
      continue;
    }

    const rate = Number(row.gst_rate);
    const key = String(rate);
    const g = groups.get(key) || { rate, lines: [], amount: 0 };
    const amount = round2(Number(line.amount));
    const listAmount = Number(line.listAmount) > amount ? round2(Number(line.listAmount)) : undefined;
    g.lines.push({
      name: displayName,
      quantity: Math.max(1, Number(line.quantity) || 1),
      amount,
      listAmount,
      hsn,
      uom: String(line.uom || 'NOS').trim().toUpperCase() || 'NOS',
    });
    g.amount = round2(g.amount + amount);
    groups.set(key, g);
  }

  // Shipping and COD charges are spread across the rate groups in proportion to their value,
  // so the invoices add up to what the customer actually paid (same GST rate as the goods).
  const goodsTotal = round2([...groups.values()].reduce((s, g) => s + g.amount, 0) + 0);
  const shipping = Math.max(0, Number(body.shippingAmount) || 0);
  const codCharge = Math.max(0, Number(body.codAmount) || 0);
  const grandTotal = round2(lineItems.reduce((s, l) => s + Number(l.amount), 0) + shipping + codCharge);
  const declaredTotal = Number(body.totalAmount || body.amount);
  const totalMismatch = Number.isFinite(declaredTotal) && Math.abs(declaredTotal - grandTotal) > 1;

  const holdInvoice = unmatched.length > 0 || totalMismatch;
  const holdReason = unmatched.length
    ? 'unmatched_products'
    : totalMismatch
      ? 'total_mismatch'
      : undefined;

  // Unmatched lines: keep the order, skip the invoice, tell the caller.
  if (unmatched.length) {
    const fallback = lineItems.map((l) => ({ name: String(l.name || l.title || ''), quantity: l.quantity || 1, amount: l.amount }));
    const cap = captureRes();
    await ingestOne(
      { ...req, method: 'POST', body: {
        ...body,
        lineItems: undefined,
        shippingAmount: undefined,
        codAmount: undefined,
        serviceTitle: fallback.map((f) => f.name).join(', ').slice(0, 250) || 'Shop order',
        totalAmount: grandTotal,
        autoInvoice: false,
        metadata: { ...(body.metadata || {}), lineItems: fallback, taxReview: { required: true, reason: holdReason, unmatched } },
      } },
      cap.res,
    );
    const out = cap.result();
    return res.status(202).json({ success: true, invoiceHeld: true, reason: holdReason, unmatched, ingest: out.payload });
  }

  const results: unknown[] = [];
  const list = [...groups.values()];
  let shipAllocated = 0;
  let codAllocated = 0;
  for (let i = 0; i < list.length; i++) {
    const g = list[i];
    const last = i === list.length - 1;
    const share = (pool: number) => (goodsTotal > 0 ? round2((pool * g.amount) / goodsTotal) : 0);
    const shipShare = last ? round2(shipping - shipAllocated) : share(shipping);
    const codShare = last ? round2(codCharge - codAllocated) : share(codCharge);
    shipAllocated = round2(shipAllocated + shipShare);
    codAllocated = round2(codAllocated + codShare);
    const total = round2(g.amount + shipShare + codShare);

    // Principal HSN (largest value) is stored on the invoice row; every line keeps its own HSN.
    const byHsn = new Map<string, number>();
    for (const l of g.lines) byHsn.set(l.hsn, round2((byHsn.get(l.hsn) || 0) + l.amount));
    const principalHsn = [...byHsn.entries()].sort((a, b) => b[1] - a[1])[0][0];

    const basePayment = body.paymentId ? String(body.paymentId) : null;
    const paymentId = basePayment ? (list.length === 1 ? basePayment : `${basePayment}:${g.rate}`) : null;
    const serviceTitle =
      g.lines.map((l) => (l.quantity > 1 ? `${l.name} x${l.quantity}` : l.name)).join(', ').slice(0, 250) || 'Shop order';

    const cap = captureRes();
    await ingestOne(
      { ...req, method: 'POST', body: {
        ...body,
        lineItems: undefined,
        shippingAmount: undefined,
        codAmount: undefined,
        serviceTitle,
        totalAmount: total,
        gstInclusive: true,
        paymentId,
        autoInvoice: holdInvoice ? false : body.autoInvoice !== false,
        metadata: {
          ...(body.metadata || {}),
          gstRate: g.rate,
          hsnCode: principalHsn,
          lineItems: g.lines,
          shippingShare: shipShare,
          codShare,
          ...(totalMismatch ? { taxReview: { required: true, reason: holdReason } } : {}),
        },
      } },
      cap.res,
    );
    results.push({ gstRate: g.rate, hsn: principalHsn, total, ...(cap.result() as object) });
  }

  return res.status(201).json({ success: true, invoiceHeld: holdInvoice, reason: holdReason, groups: results });
}
