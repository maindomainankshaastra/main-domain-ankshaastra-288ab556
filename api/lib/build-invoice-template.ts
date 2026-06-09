import { calculateGst, type GstBreakdown } from './gst.js';
import { amountInWordsInr } from './amount-in-words.js';
import { DEFAULT_SAC_CODE } from './invoice-constants.js';
import {
  formatPlaceOfSupply,
  stateCodeFromGstin,
  stateCodeFromName,
  stateNameFromCode,
} from './indian-states.js';
import { resolveGstConfigBillingTexts, resolveGstConfigExtras } from './gst-config-fields.js';
import { getInvoiceLogoUrl } from './invoice-logo.js';
import type { InvoiceTemplateData } from './templates/invoice-html.js';

type GstConfigRow = Record<string, unknown>;
type OrderRow = Record<string, unknown>;

function pickString(source: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return undefined;
}

function parseStateFromPob(pob?: string): string | undefined {
  if (!pob) return undefined;
  const parts = pob.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return undefined;
  const maybeState = parts[parts.length - 2];
  if (!maybeState || maybeState.toLowerCase() === 'india') return undefined;
  return maybeState;
}

export function resolveCustomerBilling(order: OrderRow) {
  const metadata = (order.metadata as Record<string, unknown> | undefined) || {};
  const snapshot = (metadata.formSnapshot as Record<string, unknown> | undefined) || metadata;

  const city = pickString(snapshot, ['currentCity', 'officeCity']);
  const stateName = pickString(snapshot, ['currentState', 'officeState']) || parseStateFromPob(pickString(snapshot, ['pob', 'placeOfBirth']));
  const pincode = pickString(snapshot, ['pincode', 'officePincode']);
  const stateCode =
    pickString(metadata, ['state_code']) ||
    pickString(snapshot, ['stateCode']) ||
    stateCodeFromName(stateName);

  const billingParts = [city, stateName, pincode ? `Pincode: ${pincode}` : undefined].filter(Boolean);

  const purchaserName =
    pickString(metadata, ['purchaserName']) ||
    pickString(snapshot, ['purchaserName', 'billingName', 'contactName']) ||
    (order.customer_name ? String(order.customer_name) : undefined) ||
    pickString(snapshot, ['fullName', 'firstName']) ||
    'Customer';

  return {
    name: purchaserName,
    email: String(order.customer_email || pickString(snapshot, ['email']) || ''),
    phone: String(order.customer_phone || pickString(snapshot, ['whatsapp', 'mobileNumber', 'currentMobile']) || ''),
    city,
    stateName,
    stateCode,
    pincode,
    billingAddress: billingParts.join(', '),
    placeOfSupply: formatPlaceOfSupply(stateCode),
  };
}

export function resolveBusinessStateCode(gstConfig?: GstConfigRow | null): string {
  return (
    stateCodeFromGstin(String(gstConfig?.gstin || '')) ||
    String(gstConfig?.state_code || '09').padStart(2, '0').slice(-2)
  );
}

export function resolveCustomerStateCode(order: OrderRow): string | undefined {
  const billing = resolveCustomerBilling(order);
  return billing.stateCode;
}

export function buildInvoiceTemplateData(input: {
  order: OrderRow;
  gstConfig?: GstConfigRow | null;
  invoiceNumber: string;
  paymentId?: string;
  paymentMethod?: string;
  serviceSubjects?: Array<{ person_index: number; full_name: string }>;
}): { templateData: InvoiceTemplateData; gst: GstBreakdown } {
  const { order, gstConfig, invoiceNumber, paymentId, paymentMethod, serviceSubjects = [] } = input;
  const billing = resolveCustomerBilling(order);
  const businessStateCode = resolveBusinessStateCode(gstConfig);
  const customerStateCode = billing.stateCode || businessStateCode;
  const gstRate = Number(gstConfig?.default_gst_rate ?? 18);

  const gst = calculateGst({
    amount: Number(order.total_amount || order.amount || 0),
    gstRate,
    isGstInclusive: gstConfig?.is_gst_inclusive_default ?? true,
    businessStateCode,
    customerStateCode,
  });

  const invoiceDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const serviceTitle = String(order.service_title || 'Service');
  const siteUrl = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://ankshaastra.com').replace(/\/$/, '');
  const configExtras = resolveGstConfigExtras(gstConfig);
  const billingTexts = resolveGstConfigBillingTexts(gstConfig);

  const templateData: InvoiceTemplateData = {
    invoiceNumber,
    invoiceDate,
    dueDate: invoiceDate,
    businessName: String(gstConfig?.legal_name || gstConfig?.business_name || 'Ankshaastra Occult Experts LLP'),
    businessGstin: gstConfig?.gstin ? String(gstConfig.gstin) : undefined,
    businessAddress: configExtras.address || undefined,
    businessPhone: configExtras.business_phone || process.env.BUSINESS_PHONE,
    businessEmail: configExtras.business_email || process.env.ADMIN_EMAIL || process.env.INVOICE_ADMIN_EMAIL,
    businessWebsite: configExtras.website_url || siteUrl.replace(/^https?:\/\//, ''),
    logoUrl: getInvoiceLogoUrl(),
    customerName: billing.name,
    purchasedByName: billing.name,
    serviceSubjects,
    customerEmail: billing.email || undefined,
    customerPhone: billing.phone || undefined,
    customerBillingAddress: billing.billingAddress || undefined,
    customerCity: billing.city,
    customerState: billing.stateName,
    customerPincode: billing.pincode,
    placeOfSupply: billing.placeOfSupply || formatPlaceOfSupply(businessStateCode),
    businessStateName: stateNameFromCode(businessStateCode),
    serviceTitle,
    sacCode: DEFAULT_SAC_CODE,
    gstRate,
    items: [
      {
        description: serviceTitle,
        quantity: 1,
        unitPrice: gst.subtotal,
        hsnSac: DEFAULT_SAC_CODE,
        lineTotal: gst.grandTotal,
        taxableValue: gst.subtotal,
        taxAmount: gst.gstTotal,
      },
    ],
    gst,
    paymentMethod: paymentMethod || String(order.payment_method || 'Razorpay'),
    transactionId: paymentId || (order.razorpay_payment_id ? String(order.razorpay_payment_id) : undefined),
    status: 'PAID',
    amountInWords: amountInWordsInr(gst.grandTotal),
    bankName: gstConfig?.bank_name ? String(gstConfig.bank_name) : undefined,
    bankAccountHolder: String(gstConfig?.legal_name || gstConfig?.business_name || 'Ankshaastra Occult Experts LLP'),
    bankAccountNumber: gstConfig?.bank_account ? String(gstConfig.bank_account) : undefined,
    bankIfsc: gstConfig?.bank_ifsc ? String(gstConfig.bank_ifsc) : undefined,
    bankBranch: configExtras.bank_branch,
    thankYouMessage: billingTexts.thank_you_message || undefined,
    invoiceFooter: billingTexts.invoice_footer || undefined,
    termsConditions: billingTexts.terms_conditions || undefined,
  };

  return { templateData, gst };
}
