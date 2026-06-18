import { round2 } from './gst.js';
import { UNKNOWN_STATE_CODE } from './gst-company-defaults.js';
import { stateNameFromCode } from './indian-states.js';

export type GstValidationLevel = 'error' | 'warning' | 'info';

export type GstValidationIssue = {
  level: GstValidationLevel;
  code: string;
  message: string;
  invoiceId?: string;
  invoiceNumber?: string;
};

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const SAC_REGEX = /^[0-9]{6}$/;

export function validateGstin(gstin?: string | null): boolean {
  const value = String(gstin || '').trim().toUpperCase();
  if (!value) return true;
  return GSTIN_REGEX.test(value);
}

export function validateSacCode(sac?: string | null): boolean {
  const value = String(sac || '').trim();
  if (!value) return false;
  return SAC_REGEX.test(value);
}

export function validateStateCode(code?: string | null): boolean {
  const value = String(code || '').trim().padStart(2, '0').slice(-2);
  if (!value) return false;
  if (value === UNKNOWN_STATE_CODE) return true;
  return /^\d{2}$/.test(value) && Boolean(stateNameFromCode(value));
}

export type InvoiceGstRow = {
  id: string;
  invoice_number: string;
  invoice_date?: string | null;
  customer_gstin?: string | null;
  customer_state?: string | null;
  customer_state_code?: string | null;
  billing_address?: string | null;
  hsn_sac_code?: string | null;
  sac_code?: string | null;
  subtotal?: number | null;
  base_amount?: number | null;
  cgst_rate?: number | null;
  sgst_rate?: number | null;
  igst_rate?: number | null;
  cgst_amount?: number | null;
  sgst_amount?: number | null;
  igst_amount?: number | null;
  gst_total?: number | null;
  total_amount?: number | null;
  status?: string | null;
  gstr_category?: string | null;
  gst_auto_corrected?: boolean | null;
};

export type GstConfigValidation = {
  gstin?: string | null;
  state_code?: string | null;
  default_sac_code?: string | null;
  default_gst_rate?: number | null;
};

export function validateGstConfig(config: GstConfigValidation): GstValidationIssue[] {
  const issues: GstValidationIssue[] = [];

  if (!config.gstin?.trim()) {
    issues.push({ level: 'warning', code: 'CONFIG_GSTIN_MISSING', message: 'Supplier GSTIN is not configured in GST Settings.' });
  } else if (!validateGstin(config.gstin)) {
    issues.push({ level: 'warning', code: 'CONFIG_GSTIN_INVALID', message: 'Supplier GSTIN format looks invalid in GST Settings.' });
  }

  if (!validateStateCode(config.state_code || '09')) {
    issues.push({ level: 'error', code: 'CONFIG_STATE_INVALID', message: 'Supplier state code must be valid (09 for Uttar Pradesh).' });
  }

  const sac = config.default_sac_code || '';
  if (!validateSacCode(sac)) {
    issues.push({ level: 'warning', code: 'CONFIG_SAC_INVALID', message: 'Default SAC code should be a 6-digit SAC (e.g. 999799).' });
  }

  const rate = Number(config.default_gst_rate ?? 18);
  if (!Number.isFinite(rate) || rate < 0 || rate > 28) {
    issues.push({ level: 'error', code: 'CONFIG_GST_RATE', message: 'Default GST rate must be between 0 and 28.' });
  }

  return issues;
}

function taxableOf(inv: InvoiceGstRow): number {
  return Number(inv.subtotal ?? inv.base_amount ?? 0);
}

function validateGstMath(inv: InvoiceGstRow): boolean {
  const taxable = taxableOf(inv);
  if (!Number.isFinite(taxable) || taxable <= 0) return false;

  const total = Number(inv.total_amount || 0);
  if (!Number.isFinite(total) || total <= 0) return false;

  const cgst = Number(inv.cgst_amount || 0);
  const sgst = Number(inv.sgst_amount || 0);
  const igst = Number(inv.igst_amount || 0);
  const gstSum = round2(cgst + sgst + igst);

  if (gstSum <= 0 && total >= taxable) return true;

  return Math.abs(round2(taxable + gstSum) - total) <= 0.05;
}

export function validateInvoicesForGstr(
  invoices: InvoiceGstRow[],
  seenNumbers: Set<string> = new Set(),
): GstValidationIssue[] {
  const issues: GstValidationIssue[] = [];

  for (const inv of invoices) {
    const num = String(inv.invoice_number || '').trim();
    if (!num) {
      issues.push({
        level: 'error',
        code: 'INV_NUMBER_MISSING',
        message: 'Invoice number is missing.',
        invoiceId: inv.id,
      });
      continue;
    }
    if (seenNumbers.has(num)) {
      issues.push({
        level: 'error',
        code: 'INV_NUMBER_DUPLICATE',
        message: `Duplicate invoice number: ${num}`,
        invoiceId: inv.id,
        invoiceNumber: num,
      });
    }
    seenNumbers.add(num);

    if (!String(inv.invoice_date || '').trim()) {
      issues.push({
        level: 'error',
        code: 'INV_DATE_MISSING',
        message: `Invoice date is missing on ${num}`,
        invoiceId: inv.id,
        invoiceNumber: num,
      });
    }

    const taxable = taxableOf(inv);
    if (!Number.isFinite(taxable) || taxable <= 0) {
      issues.push({
        level: 'error',
        code: 'INV_TAXABLE_INVALID',
        message: `Corrupt or missing taxable value on invoice ${num}`,
        invoiceId: inv.id,
        invoiceNumber: num,
      });
    }

    if (!validateGstMath(inv)) {
      issues.push({
        level: 'error',
        code: 'INV_GST_CALC_INVALID',
        message: `Invalid GST calculation on invoice ${num}`,
        invoiceId: inv.id,
        invoiceNumber: num,
      });
    }

    const gstin = inv.customer_gstin;
    const category = String(inv.gstr_category || 'B2CS');
    if (gstin && !validateGstin(gstin)) {
      issues.push({
        level: 'warning',
        code: 'INV_GSTIN_INVALID',
        message: `Customer GSTIN format may be invalid on invoice ${num}`,
        invoiceId: inv.id,
        invoiceNumber: num,
      });
    } else if (category === 'B2B' && !gstin) {
      issues.push({
        level: 'warning',
        code: 'INV_GSTIN_MISSING',
        message: `B2B invoice ${num} is missing customer GSTIN`,
        invoiceId: inv.id,
        invoiceNumber: num,
      });
    }

    const stateCode = String(inv.customer_state_code || '').trim();
    if (!stateCode || stateCode === UNKNOWN_STATE_CODE) {
      issues.push({
        level: 'warning',
        code: 'INV_STATE_MISSING',
        message: `Customer state could not be confirmed on invoice ${num}`,
        invoiceId: inv.id,
        invoiceNumber: num,
      });
    }

    if (!String(inv.billing_address || '').trim()) {
      issues.push({
        level: 'warning',
        code: 'INV_ADDRESS_MISSING',
        message: `Customer billing address missing on invoice ${num}`,
        invoiceId: inv.id,
        invoiceNumber: num,
      });
    }

    const rate = Number(inv.igst_rate || 0) > 0
      ? Number(inv.igst_rate)
      : Number(inv.cgst_rate || 0) + Number(inv.sgst_rate || 0);
    if (!Number.isFinite(rate) || rate < 0) {
      issues.push({
        level: 'error',
        code: 'INV_GST_RATE',
        message: `Invalid GST rate on invoice ${num}`,
        invoiceId: inv.id,
        invoiceNumber: num,
      });
    }
  }

  return issues;
}

export function buildValidationReport(
  configIssues: GstValidationIssue[],
  invoiceIssues: GstValidationIssue[],
  infoIssues: GstValidationIssue[] = [],
): {
  errors: GstValidationIssue[];
  warnings: GstValidationIssue[];
  info: GstValidationIssue[];
  readyToFile: boolean;
  filingStatus: 'draft' | 'ready_to_file' | 'filed';
} {
  const all = [...configIssues, ...invoiceIssues, ...infoIssues];
  const errors = all.filter((i) => i.level === 'error');
  const warnings = all.filter((i) => i.level === 'warning');
  const info = all.filter((i) => i.level === 'info');
  return {
    errors,
    warnings,
    info,
    readyToFile: errors.length === 0,
    filingStatus: errors.length === 0 ? 'ready_to_file' : 'draft',
  };
}

export type GstrDashboardStats = {
  totalInvoices: number;
  totalSales: number;
  taxableValue: number;
  cgstCollected: number;
  sgstCollected: number;
  igstCollected: number;
  b2bCount: number;
  b2csCount: number;
  b2clCount: number;
  creditNotesCount: number;
  validInvoices: number;
  warningInvoices: number;
  errorInvoices: number;
  autoCorrectedInvoices: number;
};

export function buildGstrDashboard(
  invoices: InvoiceGstRow[],
  invoiceIssues: GstValidationIssue[],
): GstrDashboardStats {
  const errorIds = new Set(
    invoiceIssues.filter((i) => i.level === 'error' && i.invoiceId).map((i) => i.invoiceId!),
  );
  const warningIds = new Set(
    invoiceIssues.filter((i) => i.level === 'warning' && i.invoiceId).map((i) => i.invoiceId!),
  );

  let b2b = 0;
  let b2cs = 0;
  let b2cl = 0;
  let creditNotes = 0;
  let autoCorrected = 0;

  for (const inv of invoices) {
    const cat = String(inv.gstr_category || 'B2CS');
    if (cat === 'B2B') b2b += 1;
    else if (cat === 'B2CS') b2cs += 1;
    else if (cat === 'B2CL') b2cl += 1;
    else if (cat === 'CDNR' || cat === 'CDNUR') creditNotes += 1;
    if (inv.gst_auto_corrected) autoCorrected += 1;
  }

  return {
    totalInvoices: invoices.length,
    totalSales: round2(invoices.reduce((s, r) => s + Number(r.total_amount || 0), 0)),
    taxableValue: round2(invoices.reduce((s, r) => s + taxableOf(r), 0)),
    cgstCollected: round2(invoices.reduce((s, r) => s + Number(r.cgst_amount || 0), 0)),
    sgstCollected: round2(invoices.reduce((s, r) => s + Number(r.sgst_amount || 0), 0)),
    igstCollected: round2(invoices.reduce((s, r) => s + Number(r.igst_amount || 0), 0)),
    b2bCount: b2b,
    b2csCount: b2cs,
    b2clCount: b2cl,
    creditNotesCount: creditNotes,
    validInvoices: invoices.filter((i) => !errorIds.has(i.id) && !warningIds.has(i.id)).length,
    warningInvoices: warningIds.size,
    errorInvoices: errorIds.size,
    autoCorrectedInvoices: autoCorrected,
  };
}
