/** GSTR-1 invoice category per Empower & Ankshaastra GST rules. */

export type GstrCategory = 'B2B' | 'B2CS' | 'B2CL' | 'CDNR' | 'CDNUR';

export const B2CL_THRESHOLD_INR = 100_000;
export const SUPPLIER_STATE_CODE = '09';

export type GstrClassifyInput = {
  customerGstin?: string | null;
  invoiceValue: number;
  customerStateCode?: string | null;
  supplierStateCode?: string;
  isCreditNote?: boolean;
  originalInvoiceValue?: number;
};

export function classifyGstrInvoice(input: GstrClassifyInput): GstrCategory {
  const {
    customerGstin,
    invoiceValue,
    customerStateCode,
    supplierStateCode = SUPPLIER_STATE_CODE,
    isCreditNote = false,
    originalInvoiceValue = 0,
  } = input;

  const gstin = String(customerGstin || '').trim().toUpperCase();
  const stateCode = String(customerStateCode || supplierStateCode).padStart(2, '0').slice(-2);

  if (isCreditNote) {
    if (gstin) return 'CDNR';
    if (originalInvoiceValue > B2CL_THRESHOLD_INR) return 'CDNUR';
    return 'CDNUR';
  }

  if (gstin.length >= 15) return 'B2B';

  if (
    invoiceValue > B2CL_THRESHOLD_INR &&
    stateCode !== supplierStateCode
  ) {
    return 'B2CL';
  }

  return 'B2CS';
}

export function gstrCategoryLabel(category: GstrCategory): string {
  const labels: Record<GstrCategory, string> = {
    B2B: 'B2B — Registered customer (GSTIN)',
    B2CS: 'B2CS — Unregistered consumer (aggregate in GSTR-1)',
    B2CL: 'B2CL — Large unregistered inter-state',
    CDNR: 'CDNR — Credit note (GST registered)',
    CDNUR: 'CDNUR — Credit note (unregistered)',
  };
  return labels[category];
}
