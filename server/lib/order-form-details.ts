const SKIP_KEYS = new Set([
  'userId',
  'user_id',
  'razorpay_order_id',
  'razorpay_payment_id',
  'razorpay_signature',
]);

const FIELD_LABELS: Record<string, string> = {
  fullName: 'Full Name',
  firstName: 'First Name',
  middleName: 'Middle Name',
  lastName: 'Last Name',
  middleIsFatherName: 'Middle name is father name',
  email: 'Email',
  whatsapp: 'WhatsApp',
  gender: 'Gender',
  dob: 'Date of Birth',
  tob: 'Time of Birth',
  pincode: 'Birth Pincode',
  pob: 'Place of Birth',
  currentCity: 'Current City',
  currentState: 'Current State',
  currentMobile: 'Current Mobile',
  vehicleType: 'Vehicle Type',
  vehicleUsage: 'Vehicle Usage',
  purchaseAmount: 'Purchase Amount',
  stateCode: 'State Code',
  rtoCode: 'RTO Code',
  numberOptions: 'Number Options',
  colorOptions: 'Color Options',
  purchaseWindow: 'Purchase Window',
  preferredSeries: 'Preferred Series',
  preferredDigits: 'Preferred Digits',
  avoidDigits: 'Digits to Avoid',
  purpose: 'Purpose',
  towerBlock: 'Tower / Block',
  floorNumber: 'Floor Number',
  propertyPurpose: 'Property Purpose',
  facingDirection: 'Facing Direction',
  connectedNumber: 'Connected Number',
  brandName: 'Brand Name',
  legalName: 'Legal Name',
  tagline: 'Tagline',
  industry: 'Industry',
  incorporationDate: 'Incorporation Date',
  entityType: 'Entity Type',
  mobileNumber: 'Mobile Number',
  reason: 'Reason',
  businessType: 'Business Type',
  officePincode: 'Office Pincode',
  officeCity: 'Office City',
  officeState: 'Office State',
  layoutAvailable: 'Layout Available',
  businessIndustry: 'Business Industry',
  companyLegalName: 'Company Legal Name',
  partnerName: 'Partner Name',
  partnerDob: 'Partner Date of Birth',
  partnerTob: 'Partner Time of Birth',
  partnerPincode: 'Partner Birth Pincode',
  partnerPob: 'Partner Place of Birth',
  partnerGender: 'Partner Gender',
  formType: 'Form Type',
  serviceSlug: 'Service',
  addons: 'Add-ons',
  // Miracle Baby booking form fields — added so these read naturally
  // instead of relying only on the generic camelCase auto-formatter below.
  motherName: "Mother's Name",
  fatherName: "Father's Name",
  expectedDeliveryFrom: 'Expected Delivery — From',
  expectedDeliveryTo: 'Expected Delivery — To',
  pinCode: 'Pin Code',
  hospitalName: 'Hospital Name',
  avoidOrPreferNumbers: 'Numbers to Avoid / Prefer',
  preferredDeity: 'Preferred Deity',
  qualities: 'Qualities to Manifest',
  city: 'City',
};

function formatDob(value: unknown): string {
  if (!value || typeof value !== 'object') return String(value ?? '');
  const d = value as { day?: string; month?: string; year?: string };
  if (!d.day || !d.month || !d.year) return '';
  return `${d.day.padStart(2, '0')}/${d.month.padStart(2, '0')}/${d.year}`;
}

function formatTob(value: unknown): string {
  if (!value || typeof value !== 'object') return String(value ?? '');
  const t = value as { hour?: string; minute?: string; meridiem?: string };
  if (!t.hour || !t.minute) return '';
  return `${t.hour}:${t.minute} ${t.meridiem || ''}`.trim();
}

// FIX (per client request 2026-08-02): HTML <input type="date"> fields
// (e.g. "Expected Delivery — From/To") always store their value internally
// as ISO "YYYY-MM-DD", regardless of how the date picker displays it on
// screen. That raw ISO string was passed straight through into the email,
// showing "2026-09-14" instead of a readable date. This detects any plain
// ISO date string — for any field, not just delivery dates — and reformats
// it to DD/MM/YYYY, matching how the booking form itself displays dates.
function formatIsoDateIfPresent(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  if (key === 'dob' || key.endsWith('Dob')) return formatDob(value);
  if (key === 'tob' || key.endsWith('Tob')) return formatTob(value);
  if (key === 'addons' && Array.isArray(value)) {
    return value
      .map((a) => {
        if (a && typeof a === 'object') {
          const item = a as { label?: string; price?: number; id?: string };
          return item.label ? `${item.label}${item.price ? ` (₹${item.price})` : ''}` : item.id || '';
        }
        return String(a);
      })
      .filter(Boolean)
      .join(', ');
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return '';
  const str = String(value).trim();
  const isoDate = formatIsoDateIfPresent(str);
  return isoDate || str;
}

function labelForKey(key: string): string {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  if (key.startsWith('person')) {
    const suffix = key.replace(/^person\d+_?/, '');
    const base = FIELD_LABELS[suffix] || suffix.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
    return `Person ${key.match(/\d+/)?.[0] || ''} — ${base}`.trim();
  }
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
}

function flattenFormEntries(obj: Record<string, unknown>, prefix = ''): Array<[string, string]> {
  const rows: Array<[string, string]> = [];

  for (const [key, value] of Object.entries(obj)) {
    if (SKIP_KEYS.has(key)) continue;

    if (value && typeof value === 'object' && !Array.isArray(value) && key !== 'dob' && key !== 'tob' && !key.endsWith('Dob') && !key.endsWith('Tob')) {
      if (key === 'person1' || key === 'person2' || key === 'person3' || /^person\d+$/.test(key)) {
        const nested = value as Record<string, unknown>;
        for (const [nestedKey, nestedVal] of Object.entries(nested)) {
          const compositeKey = `${key}_${nestedKey}`;
          const formatted = formatValue(nestedKey, nestedVal);
          if (formatted) rows.push([labelForKey(compositeKey), formatted]);
        }
        continue;
      }
    }

    const formatted = formatValue(key, value);
    if (formatted) rows.push([labelForKey(key), formatted]);
  }

  return rows;
}

/** Strip internal fields and keep a JSON-safe snapshot for order.metadata.formSnapshot. */
export function sanitizeFormSnapshot(formData: Record<string, unknown>): Record<string, unknown> {
  const snapshot: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(formData || {})) {
    if (SKIP_KEYS.has(key)) continue;
    if (value === null || value === undefined || value === '') continue;
    snapshot[key] = value;
  }
  return snapshot;
}

export function mergeOrderMetadata(
  existing: Record<string, unknown> | null | undefined,
  formData: Record<string, unknown>,
): Record<string, unknown> {
  const snapshot = sanitizeFormSnapshot(formData);
  const base = { ...(existing || {}) };
  if (!Object.keys(snapshot).length) return base;
  return {
    ...base,
    formSnapshot: snapshot,
    formSnapshotAt: new Date().toISOString(),
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// FIX (per client request 2026-08-02): sections were previously wrapped in
// a bordered, background-filled "box" (like the TAX INVOICE intro above
// them). The client wants only that intro to stay boxed — the Order
// Information / Customer Contact / Order Details sections below it should
// be plain text/rows with no surrounding box, so the customer can easily
// select and copy the details straight out of the email.
function sectionTable(rows: Array<[string, string]>): string {
  if (!rows.length) return '';
  return rows
    .map(
      ([label, value]) =>
        `<p style="margin:0 0 8px;font-size:14px;line-height:1.5;"><strong style="color:#444;">${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`,
    )
    .join('');
}

function sectionHeading(title: string): string {
  return `<h3 style="margin:20px 0 8px;font-size:15px;color:#4b77be;border-bottom:1px solid #e5e7eb;padding-bottom:6px;">${escapeHtml(title)}</h3>`;
}

// FIX (per client request 2026-08-01): buildOrderDetailsHtml previously
// emitted a single flat "Order Details" table mixing order metadata,
// contact info, and every raw form field together. It's now split into
// three clearly labeled sections — Order Information, Customer Contact,
// and Order Details (Form Filled) — matching the layout the client asked
// for. Fields already shown in "Order Information" / "Customer Contact"
// are excluded from the "Form Filled" section so nothing is duplicated.
export function buildOrderDetailsHtml(order: Record<string, unknown>): string {
  const metadata = (order.metadata as Record<string, unknown> | undefined) || {};
  const snapshotFromMeta = metadata.formSnapshot as Record<string, unknown> | undefined;
  const legacyMeta: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (key === 'formSnapshot' || key === 'formSnapshotAt' || key === 'serviceId') continue;
    if (value !== null && value !== undefined && value !== '') legacyMeta[key] = value;
  }
  const formSnapshot = {
    ...legacyMeta,
    ...(snapshotFromMeta || {}),
  };

  // ── Order Information ────────────────────────────────────────────────────
  const orderInfoRows: Array<[string, string]> = [];
  const orderIdValue = order.id || order.razorpay_order_id;
  if (orderIdValue) orderInfoRows.push(['Order ID', String(orderIdValue)]);
  if (order.service_title) orderInfoRows.push(['Package', String(order.service_title)]);
  const amountValue = order.total_amount ?? order.amount;
  if (amountValue !== undefined && amountValue !== null && amountValue !== '') {
    orderInfoRows.push(['Amount', `₹${Number(amountValue).toLocaleString('en-IN')}`]);
  }
  if (order.razorpay_payment_id) orderInfoRows.push(['Transaction ID', String(order.razorpay_payment_id)]);
  if (order.status) orderInfoRows.push(['Status', String(order.status).toUpperCase()]);

  // ── Customer Contact ─────────────────────────────────────────────────────
  const contactRows: Array<[string, string]> = [];
  if (order.customer_name) contactRows.push(['Name', String(order.customer_name)]);
  if (order.customer_email) contactRows.push(['Email', String(order.customer_email)]);
  if (order.customer_phone) contactRows.push(['Mobile', String(order.customer_phone)]);
  const cityValue = formSnapshot.city || formSnapshot.currentCity || formSnapshot.officeCity;
  if (cityValue) contactRows.push(['City', String(cityValue)]);

  // Keys already surfaced above — excluded from the generic form dump below
  // so nothing appears twice.
  const alreadyShownKeys = new Set(['city', 'currentCity', 'officeCity', 'email', 'whatsapp']);
  const formEntries = Object.fromEntries(
    Object.entries(formSnapshot).filter(([key]) => !alreadyShownKeys.has(key)),
  );

  // ── Order Details (Form Filled) ──────────────────────────────────────────
  const formRows = flattenFormEntries(formEntries);

  if (!orderInfoRows.length && !contactRows.length && !formRows.length) return '';

  return `
    ${orderInfoRows.length ? sectionHeading('Order Information') + sectionTable(orderInfoRows) : ''}
    ${contactRows.length ? sectionHeading('Customer Contact') + sectionTable(contactRows) : ''}
    ${formRows.length ? sectionHeading('Order Details (Form Filled)') + sectionTable(formRows) : ''}
  `;
}
