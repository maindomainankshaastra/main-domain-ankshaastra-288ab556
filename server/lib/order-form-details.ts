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
  return String(value).trim();
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

  const rows: Array<[string, string]> = [];

  if (order.service_title) rows.push(['Service', String(order.service_title)]);
  if (order.customer_name) rows.push(['Customer Name', String(order.customer_name)]);
  if (order.customer_email) rows.push(['Email', String(order.customer_email)]);
  if (order.customer_phone) rows.push(['WhatsApp / Phone', String(order.customer_phone)]);
  if (order.razorpay_payment_id) rows.push(['Payment ID', String(order.razorpay_payment_id)]);

  const formRows = flattenFormEntries(formSnapshot);
  for (const row of formRows) {
    if (!rows.some(([label]) => label === row[0])) rows.push(row);
  }

  if (rows.length === 0) return '';

  const tableRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px 6px 0;font-weight:600;vertical-align:top;color:#444;">${escapeHtml(label)}</td><td style="padding:6px 0;vertical-align:top;">${escapeHtml(value)}</td></tr>`,
    )
    .join('');

  return `
    <h3 style="margin:24px 0 12px;font-size:16px;color:#4b77be;">Order Details</h3>
    <table style="border-collapse:collapse;width:100%;max-width:560px;font-size:14px;line-height:1.5;background:#f8fafc;border:1px solid #d9dee7;border-radius:8px;padding:4px 12px;">
      ${tableRows}
    </table>
  `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
