import { stateNameFromCode } from './indian-states.js';

export type GstValidationIssue = {
  level: 'error' | 'warning';
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
  const value = String(code || '').trim();
  if (!value) return false;
  return /^\d{2}$/.test(value) && Boolean(stateNameFromCode(value));
}

export type InvoiceGstRow = {
  id: string;
  invoice_number: string;
  customer_gstin?: string | null;
  customer_state_code?: string | null;
  hsn_sac_code?: string | null;
  sac_code?: string | null;
  cgst_rate?: number | null;
  sgst_rate?: number | null;
  igst_rate?: number | null;
  total_amount?: number | null;
  status?: string | null;
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
    issues.push({ level: 'warning', code: 'CONFIG_GSTIN_MISSING', message: 'GSTIN is not configured in GST Settings.' });
  } else if (!validateGstin(config.gstin)) {
    issues.push({ level: 'error', code: 'CONFIG_GSTIN_INVALID', message: 'GSTIN format is invalid in GST Settings.' });
  }

  if (!validateStateCode(config.state_code || '09')) {
    issues.push({ level: 'error', code: 'CONFIG_STATE_INVALID', message: 'Supplier state code must be a valid 2-digit GST code (09 for UP).' });
  }

  const sac = config.default_sac_code || '';
  if (!validateSacCode(sac)) {
    issues.push({ level: 'error', code: 'CONFIG_SAC_INVALID', message: 'Default SAC code must be a 6-digit SAC (e.g. 998314).' });
  }

  const rate = Number(config.default_gst_rate ?? 18);
  if (!Number.isFinite(rate) || rate < 0 || rate > 28) {
    issues.push({ level: 'error', code: 'CONFIG_GST_RATE', message: 'Default GST rate must be between 0 and 28.' });
  }

  return issues;
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

    const gstin = inv.customer_gstin;
    if (gstin && !validateGstin(gstin)) {
      issues.push({
        level: 'error',
        code: 'INV_GSTIN_INVALID',
        message: `Invalid customer GSTIN on invoice ${num}`,
        invoiceId: inv.id,
        invoiceNumber: num,
      });
    }

    const sac = inv.sac_code || inv.hsn_sac_code;
    if (!validateSacCode(sac)) {
      issues.push({
        level: 'warning',
        code: 'INV_SAC_MISSING',
        message: `SAC code missing or invalid on invoice ${num}`,
        invoiceId: inv.id,
        invoiceNumber: num,
      });
    }

    if (!validateStateCode(inv.customer_state_code)) {
      issues.push({
        level: 'warning',
        code: 'INV_STATE_MISSING',
        message: `Customer state code missing on invoice ${num} — place of supply may be incorrect.`,
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
): {
  errors: GstValidationIssue[];
  warnings: GstValidationIssue[];
  readyToFile: boolean;
} {
  const all = [...configIssues, ...invoiceIssues];
  const errors = all.filter((i) => i.level === 'error');
  const warnings = all.filter((i) => i.level === 'warning');
  return {
    errors,
    warnings,
    readyToFile: errors.length === 0,
  };
}
