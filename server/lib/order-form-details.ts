const SKIP_KEYS = new Set([
  'userId',
  'user_id',
  'razorpay_order_id',
  'razorpay_payment_id',
  'razorpay_signature',
  // Internal/admin-only fields seen on manually-created orders (order.metadata.manualEntry
  // === true) — set by staff creating an invoice by hand, not filled in by the customer.
  // These must never appear on a customer-facing invoice PDF/email.
  'manualEntry',
  'createdByAdmin',
  'requestedGstRate',
  'requestedInvoiceDate',
  'packageName',
  // Internal package/service identifiers (e.g. "namecheck-1", "single") — the service
  // itself is already shown via the invoice's own "Item" line, so this would be redundant.
  'packageType',
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
  // Miracle Baby booking form fields — confirmed against real order.metadata
  // (2026-08-05) so these read naturally instead of relying only on the
  // generic camelCase auto-formatter below.
  motherName: "Mother's Name",
  fatherName: "Father's Name",
  motherDob: "Mother's Date of Birth",
  fatherDob: "Father's Date of Birth",
  expectedDeliveryFrom: 'Expected Delivery — From',
  expectedDeliveryTo: 'Expected Delivery — To',
  pinCode: 'Pin Code',
  hospitalName: 'Hospital Name',
  avoidOrPreferNumbers: 'Numbers to Avoid / Prefer',
  preferredDeity: 'Preferred Deity',
  qualities: 'Qualities to Manifest',
  city: 'City',
  notes: 'Notes / Special Request',
  // Empower Name Check (namecheck-1 / namecheck-2) form fields — confirmed
  // against real order.metadata (2026-08-05). Empower stores each person's
  // fields as flat "person1Xxx"/"person2Xxx"/"person3Xxx" keys (not nested
  // objects), which the person-prefix logic in labelForKey() below already
  // turns into "Person 1 — Xxx" / "Person 2 — Xxx" automatically.
  timeOfBirth: 'Time of Birth',
  placeOfBirth: 'Place of Birth',
  // Empower Baby Name Report (Perfect Baby Name / Complete Baby Name
  // Blueprint) form fields.
  childDob: "Child's Date of Birth",
  childMiddleName: "Child's Middle Name",
  childLastName: "Child's Last Name",
  fatherFullName: "Father's Full Name",
  fatherFirstName: "Father's First Name",
  fatherMiddleName: "Father's Middle Name",
  fatherLastName: "Father's Last Name",
  fatherFirstNameAsMiddleName: "Father's First Name Used as Child's Middle Name?",
  lastNameSpellingChangeOk: 'Comfortable Changing Last Name Spelling?',
  // The booking form saves Name Style / Notes / Add-ons as one combined
  // free-text field, e.g. "[NAME STYLE: Mix of All] [NOTES: ...] [ADD-ON: ...]"
  // — so it's rendered as a single field rather than split into several.
  nameOptions: 'Name Preferences & Notes',
};

// A key ending in one of these (case-insensitive) gets the label below,
// combined with whatever prefix precedes it (see baseLabelForSuffix) —
// covers new/unknown service fields automatically without needing a new
// FIELD_LABELS entry every time a field name is a minor variant (e.g. a
// future "guardianWhatsapp" or "childEmailId"). This, plus FIELD_LABELS
// above, is what keeps future services working without code changes.
const SUFFIX_LABEL_OVERRIDES: Array<[RegExp, string]> = [
  [/dob$/i, 'Date of Birth'],
  [/tob$/i, 'Time of Birth'],
  [/whatsapp(number)?$/i, 'WhatsApp Number'],
  [/email(id)?$/i, 'Email ID'],
  [/pincode$/i, 'Pincode'],
  // Empower Name Check: person1MiddleNameType / person2MiddleNameType
  // ("yes"/"no"/null) = "Is the middle name father's/husband's name?"
  [/middlenametype$/i, "Middle Name Is Father's/Husband's Name?"],
];

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
  if (key === 'dob' || key.endsWith('Dob')) {
    if (value && typeof value === 'object') return formatDob(value);
    const str = String(value ?? '').trim();
    return formatIsoDateIfPresent(str) || str;
  }
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
  if (typeof value === 'string' && /^(yes|no)$/i.test(value.trim())) {
    return value.trim()[0].toUpperCase() + value.trim().slice(1).toLowerCase();
  }
  if (typeof value === 'object') return '';
  const str = String(value).trim();
  const isoDate = formatIsoDateIfPresent(str);
  return isoDate || str;
}

function titleCaseFromKey(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();
}

function baseLabelForSuffix(suffix: string): string {
  if (FIELD_LABELS[suffix]) return FIELD_LABELS[suffix];
  const override = SUFFIX_LABEL_OVERRIDES.find(([pattern]) => pattern.test(suffix));
  if (override) {
    const [pattern, label] = override;
    // Preserve any meaningful prefix before the recognized suffix, e.g.
    // "motherDob" -> "Mother — Date of Birth", "fatherDob" -> "Father —
    // Date of Birth" (not both collapsing to plain "Date of Birth").
    const prefix = suffix.replace(new RegExp(pattern.source, 'i'), '');
    const prefixLabel = prefix ? titleCaseFromKey(prefix) : '';
    return prefixLabel ? `${prefixLabel} — ${label}` : label;
  }
  return titleCaseFromKey(suffix);
}

function labelForKey(key: string): string {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  if (key.startsWith('person')) {
    const suffix = key.replace(/^person\d+_?/, '');
    const base = baseLabelForSuffix(suffix);
    return `Person ${key.match(/\d+/)?.[0] || ''} — ${base}`.trim();
  }
  return baseLabelForSuffix(key);
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

// Returns just the service-specific form fields (label/value pairs) for an
// order — e.g. Person 1 — First Name, Hospital Name, Expected Delivery — From,
// etc. — whatever fields were actually filled in for whatever service was
// purchased, on whichever of the three sites. Used by the invoice PDF so it
// shows the correct fields for every service automatically, without any
// per-service code changes. (Order ID/Amount/customer contact rows are
// intentionally excluded here since the PDF already renders those itself.)
export function getOrderFormRows(order: Record<string, unknown>): Array<[string, string]> {
  const metadata = (order.metadata as Record<string, unknown> | undefined) || {};
  const snapshotFromMeta = metadata.formSnapshot as Record<string, unknown> | undefined;
  const legacyMeta: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (key === 'formSnapshot' || key === 'formSnapshotAt' || key === 'serviceId') continue;
    if (value !== null && value !== undefined && value !== '') legacyMeta[key] = value;
  }
  const formSnapshot = { ...legacyMeta, ...(snapshotFromMeta || {}) };

  // These duplicate what's already shown elsewhere on the invoice (header
  // "Purchased By" / "Phone" lines, and the Billing Address block, which is
  // resolved separately in resolveCustomerBilling() using the same aliases)
  // — confirmed against real order.metadata from all three sites (2026-08-05).
  const alreadyShownKeys = new Set([
    'city', 'currentCity', 'officeCity',
    'state', 'customerState', 'currentState', 'officeState', 'deliveryState',
    'pincode', 'pinCode', 'officePincode',
    'email', 'whatsapp',
    'name', 'mobile', 'mobileNumber', 'currentMobile',
  ]);
  // Manually-created orders (staff typing up an invoice by hand) sometimes
  // use "notes" for an internal comment, not a customer-submitted special
  // request — keep it off the customer-facing PDF/email in that case only.
  if (metadata.manualEntry === true) alreadyShownKeys.add('notes');
  // Empower forms save single-purchaser info twice — once as bare
  // dob/gender/name, again as person1Dob/person1Gender/person1Name. Keep
  // only the more detailed "Person 1 — ..." version when both are present.
  if (formSnapshot.person1Dob) alreadyShownKeys.add('dob');
  if (formSnapshot.person1Gender) alreadyShownKeys.add('gender');
  if (formSnapshot.person1Name) alreadyShownKeys.add('name');
  const formEntries = Object.fromEntries(
    Object.entries(formSnapshot).filter(([key]) => !alreadyShownKeys.has(key)),
  );

  return flattenFormEntries(formEntries);
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

  // ── Order Details (Form Filled) ──────────────────────────────────────────
  // (city/email/whatsapp already surfaced above are excluded inside
  // getOrderFormRows so nothing appears twice)
  const formRows = getOrderFormRows(order);

  if (!orderInfoRows.length && !contactRows.length && !formRows.length) return '';

  return `
    ${orderInfoRows.length ? sectionHeading('Order Information') + sectionTable(orderInfoRows) : ''}
    ${contactRows.length ? sectionHeading('Customer Contact') + sectionTable(contactRows) : ''}
    ${formRows.length ? sectionHeading('Order Details (Form Filled)') + sectionTable(formRows) : ''}
  `;
}
