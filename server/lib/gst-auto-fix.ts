import { classifyGstrInvoice } from './gstr-classification.js';
import { GST_COMPANY_DEFAULTS, UNKNOWN_STATE_CODE } from './gst-company-defaults.js';
import { detectCustomerState } from './gst-state-detection.js';
import { formatPlaceOfSupply } from './indian-states.js';
import { resolveSacCode } from './invoice-constants.js';
import type { GstValidationIssue } from './gst-validation.js';

export type GstInvoiceRow = Record<string, unknown>;

export type GstFixResult = {
  patch: Record<string, unknown>;
  info: GstValidationIssue[];
  corrected: boolean;
};

function sacOf(inv: GstInvoiceRow): string {
  return String(inv.sac_code || inv.hsn_sac_code || '').trim();
}

function gstRateOf(inv: GstInvoiceRow): number {
  const igst = Number(inv.igst_rate || 0);
  if (igst > 0) return igst;
  return Number(inv.cgst_rate || 0) + Number(inv.sgst_rate || 0);
}

export function buildGstFixPatch(
  invoice: GstInvoiceRow,
  order?: GstInvoiceRow | null,
  gstConfig?: GstInvoiceRow | null,
): GstFixResult {
  const patch: Record<string, unknown> = {};
  const info: GstValidationIssue[] = [];
  const num = String(invoice.invoice_number || invoice.id || '');
  const defaultSac = resolveSacCode(gstConfig as { default_sac_code?: string | null });
  const defaultRate = Number(gstConfig?.default_gst_rate ?? GST_COMPANY_DEFAULTS.defaultGstRate);

  if (!/^\d{6}$/.test(sacOf(invoice))) {
    patch.sac_code = defaultSac;
    patch.hsn_sac_code = defaultSac;
    info.push({
      level: 'info',
      code: 'AUTO_SAC',
      message: `Auto-assigned SAC ${defaultSac} on invoice ${num}`,
      invoiceId: String(invoice.id || ''),
      invoiceNumber: num,
    });
  }

  const stateCode = String(invoice.customer_state_code || '').trim();
  if (!stateCode || stateCode === UNKNOWN_STATE_CODE) {
    const detected = detectCustomerState(invoice, order);
    patch.customer_state = detected.stateName;
    patch.customer_state_code = detected.stateCode;
    patch.place_of_supply = formatPlaceOfSupply(detected.stateCode) || detected.stateName;
    info.push({
      level: 'info',
      code: 'AUTO_STATE',
      message: `Auto-detected customer state ${detected.stateName} (${detected.stateCode}) on invoice ${num}`,
      invoiceId: String(invoice.id || ''),
      invoiceNumber: num,
    });
  }

  const mergedForRate = { ...invoice, ...patch };
  const rate = gstRateOf(mergedForRate);
  if (!Number.isFinite(rate) || rate <= 0) {
    const effectiveState = String(mergedForRate.customer_state_code || UNKNOWN_STATE_CODE).padStart(2, '0');
    const isIntra = effectiveState === GST_COMPANY_DEFAULTS.stateCode;
    patch.cgst_rate = isIntra ? defaultRate / 2 : 0;
    patch.sgst_rate = isIntra ? defaultRate / 2 : 0;
    patch.igst_rate = isIntra ? 0 : defaultRate;
    info.push({
      level: 'info',
      code: 'AUTO_GST_RATE',
      message: `Auto-assigned GST rate ${defaultRate}% on invoice ${num}`,
      invoiceId: String(invoice.id || ''),
      invoiceNumber: num,
    });
  }

  const merged = { ...invoice, ...patch };
  const supplierState = GST_COMPANY_DEFAULTS.stateCode;
  const customerStateCode = String(merged.customer_state_code || UNKNOWN_STATE_CODE);
  const gstrCategory = classifyGstrInvoice({
    customerGstin: merged.customer_gstin as string | null,
    invoiceValue: Number(merged.total_amount || 0),
    customerStateCode,
    supplierStateCode: supplierState,
  });
  if (merged.gstr_category !== gstrCategory) {
    patch.gstr_category = gstrCategory;
  }

  const corrected = Object.keys(patch).length > 0;
  if (corrected) {
    patch.gst_auto_corrected = true;
  }

  return { patch, info, corrected };
}

export function normalizeInvoiceForGstr(
  invoice: GstInvoiceRow,
  order?: GstInvoiceRow | null,
  gstConfig?: GstInvoiceRow | null,
): { invoice: GstInvoiceRow; info: GstValidationIssue[] } {
  const { patch, info } = buildGstFixPatch(invoice, order, gstConfig);
  return { invoice: { ...invoice, ...patch }, info };
}

export type GstBulkFixSummary = {
  processed: number;
  corrected: number;
  remainingWarnings: number;
  info: GstValidationIssue[];
};

export async function fixAllHistoricalGstData(
  supabase: ReturnType<typeof import('./supabase-admin.js').getSupabaseAdmin>,
): Promise<GstBulkFixSummary> {
  const { data: config } = await supabase.from('gst_config').select('*').limit(1).single();
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*, orders:order_id(id, metadata)')
    .order('invoice_date', { ascending: true });

  if (error) throw error;

  let corrected = 0;
  const allInfo: GstValidationIssue[] = [];
  let remainingWarnings = 0;

  for (const row of invoices || []) {
    const inv = row as GstInvoiceRow;
    const order = (inv.orders as GstInvoiceRow | null) || null;
    const { patch, info, corrected: wasCorrected } = buildGstFixPatch(inv, order, config as GstInvoiceRow);

    if (wasCorrected && inv.id) {
      const { error: updateErr } = await supabase.from('invoices').update(patch).eq('id', inv.id);
      if (!updateErr) corrected += 1;
    }

    allInfo.push(...info);

    const merged = { ...inv, ...patch };
    if (
      !merged.customer_state_code ||
      String(merged.customer_state_code) === UNKNOWN_STATE_CODE ||
      !merged.billing_address
    ) {
      remainingWarnings += 1;
    }
  }

  return {
    processed: (invoices || []).length,
    corrected,
    remainingWarnings,
    info: allInfo,
  };
}
