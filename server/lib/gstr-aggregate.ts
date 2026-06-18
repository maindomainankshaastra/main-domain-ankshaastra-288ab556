import { stateNameFromCode } from './indian-states.js';
import type { GstrCategory } from './gstr-classification.js';

export type GstrInvoiceRecord = {
  id: string;
  invoice_number: string;
  invoice_date: string;
  customer_name: string;
  customer_gstin?: string | null;
  customer_state?: string | null;
  customer_state_code?: string | null;
  place_of_supply?: string | null;
  service_title: string;
  sac_code?: string | null;
  hsn_sac_code?: string | null;
  subtotal?: number | null;
  base_amount?: number | null;
  cgst_amount?: number | null;
  sgst_amount?: number | null;
  igst_amount?: number | null;
  gst_total?: number | null;
  total_amount: number;
  cgst_rate?: number | null;
  sgst_rate?: number | null;
  igst_rate?: number | null;
  gstr_category?: string | null;
  status?: string | null;
};

export type B2csAggregateRow = {
  stateName: string;
  stateCode: string;
  gstRate: number;
  invoiceCount: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
  grossValue: number;
};

export type SacSummaryRow = {
  sacCode: string;
  gstRate: number;
  invoiceCount: number;
  quantity: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
  grossValue: number;
};

function taxableOf(inv: GstrInvoiceRecord): number {
  return Number(inv.subtotal ?? inv.base_amount ?? 0);
}

function gstRateOf(inv: GstrInvoiceRecord): number {
  const igst = Number(inv.igst_rate || 0);
  if (igst > 0) return igst;
  return Number(inv.cgst_rate || 0) + Number(inv.sgst_rate || 0);
}

function sacOf(inv: GstrInvoiceRecord): string {
  return String(inv.sac_code || inv.hsn_sac_code || '').trim();
}

function categoryOf(inv: GstrInvoiceRecord): GstrCategory {
  return (inv.gstr_category as GstrCategory) || 'B2CS';
}

export function aggregateB2cs(invoices: GstrInvoiceRecord[]): B2csAggregateRow[] {
  const map = new Map<string, B2csAggregateRow>();

  for (const inv of invoices) {
    if (categoryOf(inv) !== 'B2CS') continue;

    const stateCode = String(inv.customer_state_code || '09').padStart(2, '0').slice(-2);
    const stateName = inv.customer_state || stateNameFromCode(stateCode) || stateCode;
    const gstRate = gstRateOf(inv);
    const key = `${stateCode}|${gstRate}`;

    const row = map.get(key) || {
      stateName,
      stateCode,
      gstRate,
      invoiceCount: 0,
      taxableValue: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      totalGst: 0,
      grossValue: 0,
    };

    row.invoiceCount += 1;
    row.taxableValue += taxableOf(inv);
    row.cgst += Number(inv.cgst_amount || 0);
    row.sgst += Number(inv.sgst_amount || 0);
    row.igst += Number(inv.igst_amount || 0);
    row.totalGst += Number(inv.gst_total || 0);
    row.grossValue += Number(inv.total_amount || 0);
    map.set(key, row);
  }

  return [...map.values()].sort((a, b) => a.stateName.localeCompare(b.stateName));
}

export function aggregateSacSummary(invoices: GstrInvoiceRecord[]): SacSummaryRow[] {
  const map = new Map<string, SacSummaryRow>();

  for (const inv of invoices) {
    const sacCode = sacOf(inv) || '999799';
    const gstRate = gstRateOf(inv);
    const key = `${sacCode}|${gstRate}`;

    const row = map.get(key) || {
      sacCode,
      gstRate,
      invoiceCount: 0,
      quantity: 0,
      taxableValue: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      totalGst: 0,
      grossValue: 0,
    };

    row.invoiceCount += 1;
    row.quantity += 1;
    row.taxableValue += taxableOf(inv);
    row.cgst += Number(inv.cgst_amount || 0);
    row.sgst += Number(inv.sgst_amount || 0);
    row.igst += Number(inv.igst_amount || 0);
    row.totalGst += Number(inv.gst_total || 0);
    row.grossValue += Number(inv.total_amount || 0);
    map.set(key, row);
  }

  return [...map.values()].sort((a, b) => a.sacCode.localeCompare(b.sacCode));
}

export function filterInvoicesByPeriod(
  invoices: GstrInvoiceRecord[],
  year: number,
  month: number,
): GstrInvoiceRecord[] {
  return invoices.filter((inv) => {
    const d = new Date(inv.invoice_date);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });
}

export function invoicesByCategory(invoices: GstrInvoiceRecord[]): Record<GstrCategory, GstrInvoiceRecord[]> {
  const groups: Record<GstrCategory, GstrInvoiceRecord[]> = {
    B2B: [],
    B2CS: [],
    B2CL: [],
    CDNR: [],
    CDNUR: [],
  };
  for (const inv of invoices) {
    const cat = categoryOf(inv);
    groups[cat].push(inv);
  }
  return groups;
}
