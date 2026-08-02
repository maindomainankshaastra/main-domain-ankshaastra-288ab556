import { calculateGst, type GstBreakdown } from './gst.js';
import { amountInWordsInr } from './amount-in-words.js';
import { resolveSacCode, resolveDefaultGstRate } from './invoice-constants.js';
import { UNKNOWN_STATE_CODE, UNKNOWN_STATE_NAME } from './gst-company-defaults.js';
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

// FIX (per client request 2026-08-02): some booking forms (e.g. Ankshaastra's
// own "Perfect Baby Name" / numerology forms) never collect a standalone
// "city" field at all — only a combined "Place of Birth" string like
// "Gautam Buddha Nagar, Uttar Pradesh, India". Previously city could only
// come from currentCity/officeCity/city keys, so it was always blank for
// these orders. This takes the first comma-separated segment of the place-
// of-birth text as a city fallback, the same way parseStateFromPob() above
// already derives the state from it.
function parseCityFromPob(pob?: string): string | undefined {
  if (!pob) return undefined;
  const parts = pob.split(',').map((part) => part.trim()).filter(Boolean);
  if (!parts.length) return undefined;
  const candidate = parts[0];
  if (!candidate || candidate.toLowerCase() === 'india') return undefined;
  return candidate;
}

// FIX (website field): the "Website" line on the invoice/email previously
// always came from a single, shared GST config value — the same for every
// order regardless of which of the three sites (Ankshaastra, Miracle Baby,
// Empower) it came from. It also occasionally rendered raw Markdown link
// syntax (e.g. "[www.ankshaastra.com](https://www.ankshaastra.com)") because
// that's literally what was typed into the config field. This helper strips
// any accidental Markdown link syntax down to plain text, and is used as a
// safety net regardless of which source (order or config) the website text
// came from.
function stripMarkdownLink(text?: string): string | undefined {
  if (!text) return undefined;
  // "[label](url)" -> "label"
  const withoutMarkdown = text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  return withoutMarkdown.replace(/^https?:\/\//, '').replace(/\/$/, '').trim() || undefined;
}

// FIX (per client request 2026-08-02): rather than maintaining an
// ever-growing exact-name list for every field-naming convention each of
// the three sites happens to use (city / currentCity / cityOfDelivery /
// deliveryCity / ...), this scans every key in the form snapshot and
// returns the value of the first one whose KEY NAME matches the given
// pattern, case-insensitively — regardless of exact naming. Used as a
// fallback after the explicit alias list, so any new site/form field
// naming convention is picked up automatically without further edits here.
function findByKeyPattern(
  snapshot: Record<string, unknown>,
  pattern: RegExp,
): string | undefined {
  for (const [key, value] of Object.entries(snapshot)) {
    if (pattern.test(key) && value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return undefined;
}
  const metadata = (order.metadata as Record<string, unknown> | undefined) || {};
  const snapshot = (metadata.formSnapshot as Record<string, unknown> | undefined) || metadata;

  const city =
    pickString(snapshot, ['currentCity', 'officeCity', 'city']) ||
    findByKeyPattern(snapshot, /city/i) ||
    parseCityFromPob(pickString(snapshot, ['pob', 'placeOfBirth']));
  const stateName =
    pickString(snapshot, ['customerState', 'currentState', 'officeState', 'state', 'deliveryState']) ||
    findByKeyPattern(snapshot, /state/i) ||
    parseStateFromPob(pickString(snapshot, ['pob', 'placeOfBirth']));
  const pincode =
    pickString(snapshot, ['pincode', 'officePincode', 'pinCode']) ||
    findByKeyPattern(snapshot, /pin.?code/i);
  const stateCode =
    pickString(snapshot, ['customerStateCode', 'stateCode']) ||
    pickString(metadata, ['state_code']) ||
    stateCodeFromName(stateName);

  const customerGstin = pickString(snapshot, ['customerGstin', 'gstin', 'gstNumber']);

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
    customerGstin,
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
  // FIX: previously fell back to `businessStateCode` when the customer's state
  // couldn't be resolved, which silently treated unknown-state customers as
  // being in the same state as the business (forcing CGST+SGST instead of
  // correctly flagging the state as unknown). Now it falls back to
  // UNKNOWN_STATE_CODE, matching the invoice-engine's own fallback and
  // preventing an incorrect same-state assumption.
  const customerStateCode = billing.stateCode || UNKNOWN_STATE_CODE;
  const customerStateName =
    billing.stateName ||
    (customerStateCode === UNKNOWN_STATE_CODE ? UNKNOWN_STATE_NAME : undefined);
  const gstRate = resolveDefaultGstRate(gstConfig);

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

  const sacCode = resolveSacCode(gstConfig);

  // FIX (website field): resolve the displayed website per-ORDER, not from a
  // single shared config value. Priority:
  //   1. order.source_website (e.g. "miraclebaby.ankshaastra.com",
  //      "empower.ankshaastra.com", "ankshaastra.com") — this is what the
  //      customer actually bought through, so it's always correct.
  //   2. gst_config.website_url — used only if the order somehow has no
  //      source_website (legacy/manual rows).
  //   3. SITE_URL / NEXT_PUBLIC_SITE_URL env var, then a hardcoded default.
  // stripMarkdownLink() also cleans up any accidental "[label](url)" text
  // that was pasted into the config field, regardless of which of the three
  // sources above ends up being used.
  const resolvedWebsite =
    stripMarkdownLink(order.source_website ? String(order.source_website) : undefined) ||
    stripMarkdownLink(configExtras.website_url) ||
    siteUrl.replace(/^https?:\/\//, '');

  const templateData: InvoiceTemplateData = {
    invoiceNumber,
    invoiceDate,
    dueDate: invoiceDate,
    businessName: String(gstConfig?.legal_name || gstConfig?.business_name || 'ANKSHAASTRA OCCULT EXPERTS LLP'),
    businessGstin: gstConfig?.gstin ? String(gstConfig.gstin) : '09AAFFE7583B1ZD',
    businessAddress: configExtras.address || undefined,
    businessPhone: configExtras.business_phone || process.env.BUSINESS_PHONE,
    businessEmail: configExtras.business_email || process.env.ADMIN_EMAIL || process.env.INVOICE_ADMIN_EMAIL,
    businessWebsite: resolvedWebsite,
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
    sacCode,
    gstRate,
    items: [
      {
        description: serviceTitle,
        quantity: 1,
        unitPrice: gst.subtotal,
        hsnSac: sacCode,
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
