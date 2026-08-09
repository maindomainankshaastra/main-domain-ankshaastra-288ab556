
// const SKIP_KEYS = new Set([
//   'userId',
//   'user_id',
//   'razorpay_order_id',
//   'razorpay_payment_id',
//   'razorpay_signature',
//   // Internal/admin-only fields seen on manually-created orders (order.metadata.manualEntry
//   // === true) — set by staff creating an invoice by hand, not filled in by the customer.
//   // These must never appear on a customer-facing invoice PDF/email.
//   'manualEntry',
//   'createdByAdmin',
//   'requestedGstRate',
//   'requestedInvoiceDate',
//   'packageName',
//   // Internal package/service identifiers (e.g. "namecheck-1", "single") — the service
//   // itself is already shown via the invoice's own "Item" line, so this would be redundant.
//   'packageType',
// ]);

// const FIELD_LABELS: Record<string, string> = {
//   fullName: 'Full Name',
//   firstName: 'First Name',
//   middleName: 'Middle Name',
//   lastName: 'Last Name',
//   middleIsFatherName: 'Middle name is father name',
//   email: 'Email',
//   whatsapp: 'WhatsApp',
//   gender: 'Gender',
//   dob: 'Date of Birth',
//   tob: 'Time of Birth',
//   pincode: 'Birth Pincode',
//   pob: 'Place of Birth',
//   currentCity: 'Current City',
//   currentState: 'Current State',
//   currentMobile: 'Current Mobile',
//   vehicleType: 'Vehicle Type',
//   vehicleUsage: 'Vehicle Usage',
//   purchaseAmount: 'Purchase Amount',
//   stateCode: 'State Code',
//   rtoCode: 'RTO Code',
//   numberOptions: 'Number Options',
//   colorOptions: 'Color Options',
//   purchaseWindow: 'Purchase Window',
//   preferredSeries: 'Preferred Series',
//   preferredDigits: 'Preferred Digits',
//   avoidDigits: 'Digits to Avoid',
//   purpose: 'Purpose',
//   towerBlock: 'Tower / Block',
//   floorNumber: 'Floor Number',
//   propertyPurpose: 'Property Purpose',
//   facingDirection: 'Facing Direction',
//   connectedNumber: 'Connected Number',
//   brandName: 'Brand Name',
//   legalName: 'Legal Name',
//   tagline: 'Tagline',
//   industry: 'Industry',
//   incorporationDate: 'Incorporation Date',
//   entityType: 'Entity Type',
//   mobileNumber: 'Mobile Number',
//   reason: 'Reason',
//   businessType: 'Business Type',
//   officePincode: 'Office Pincode',
//   officeCity: 'Office City',
//   officeState: 'Office State',
//   layoutAvailable: 'Layout Available',
//   businessIndustry: 'Business Industry',
//   companyLegalName: 'Company Legal Name',
//   partnerName: 'Partner Name',
//   partnerDob: 'Partner Date of Birth',
//   partnerTob: 'Partner Time of Birth',
//   partnerPincode: 'Partner Birth Pincode',
//   partnerPob: 'Partner Place of Birth',
//   partnerGender: 'Partner Gender',
//   formType: 'Form Type',
//   serviceSlug: 'Service',
//   addons: 'Add-ons',
//   // Miracle Baby booking form fields — confirmed against real order.metadata
//   // (2026-08-05) so these read naturally instead of relying only on the
//   // generic camelCase auto-formatter below.
//   motherName: "Mother's Name",
//   fatherName: "Father's Name",
//   motherDob: "Mother's Date of Birth",
//   fatherDob: "Father's Date of Birth",
//   expectedDeliveryFrom: 'Expected Delivery — From',
//   expectedDeliveryTo: 'Expected Delivery — To',
//   pinCode: 'Pin Code',
//   hospitalName: 'Hospital Name',
//   avoidOrPreferNumbers: 'Numbers to Avoid / Prefer',
//   preferredDeity: 'Preferred Deity',
//   qualities: 'Qualities to Manifest',
//   city: 'City',
//   notes: 'Notes / Special Request',
//   // Empower Name Check (namecheck-1 / namecheck-2) form fields — confirmed
//   // against real order.metadata (2026-08-05). Empower stores each person's
//   // fields as flat "person1Xxx"/"person2Xxx"/"person3Xxx" keys (not nested
//   // objects), which the person-prefix logic in labelForKey() below already
//   // turns into "Person 1 — Xxx" / "Person 2 — Xxx" automatically.
//   timeOfBirth: 'Time of Birth',
//   placeOfBirth: 'Place of Birth',
//   // Empower Baby Name Report (Perfect Baby Name / Complete Baby Name
//   // Blueprint) form fields.
//   childDob: "Child's Date of Birth",
//   childMiddleName: "Child's Middle Name",
//   childLastName: "Child's Last Name",
//   fatherFullName: "Father's Full Name",
//   fatherFirstName: "Father's First Name",
//   fatherMiddleName: "Father's Middle Name",
//   fatherLastName: "Father's Last Name",
//   fatherFirstNameAsMiddleName: "Father's First Name Used as Child's Middle Name?",
//   lastNameSpellingChangeOk: 'Comfortable Changing Last Name Spelling?',
//   // The booking form saves Name Style / Notes / Add-ons as one combined
//   // free-text field, e.g. "[NAME STYLE: Mix of All] [NOTES: ...] [ADD-ON: ...]"
//   // — so it's rendered as a single field rather than split into several.
//   nameOptions: 'Name Preferences & Notes',
// };

// // A key ending in one of these (case-insensitive) gets the label below,
// // combined with whatever prefix precedes it (see baseLabelForSuffix) —
// // covers new/unknown service fields automatically without needing a new
// // FIELD_LABELS entry every time a field name is a minor variant (e.g. a
// // future "guardianWhatsapp" or "childEmailId"). This, plus FIELD_LABELS
// // above, is what keeps future services working without code changes.
// const SUFFIX_LABEL_OVERRIDES: Array<[RegExp, string]> = [
//   [/dob$/i, 'Date of Birth'],
//   [/tob$/i, 'Time of Birth'],
//   [/whatsapp(number)?$/i, 'WhatsApp Number'],
//   [/email(id)?$/i, 'Email ID'],
//   [/pincode$/i, 'Pincode'],
//   // Empower Name Check: person1MiddleNameType / person2MiddleNameType
//   // ("yes"/"no"/null) = "Is the middle name father's/husband's name?"
//   [/middlenametype$/i, "Middle Name Is Father's/Husband's Name?"],
// ];

// function formatDob(value: unknown): string {
//   if (!value || typeof value !== 'object') return String(value ?? '');
//   const d = value as { day?: string; month?: string; year?: string };
//   if (!d.day || !d.month || !d.year) return '';
//   return `${d.day.padStart(2, '0')}/${d.month.padStart(2, '0')}/${d.year}`;
// }

// function formatTob(value: unknown): string {
//   if (!value || typeof value !== 'object') return String(value ?? '');
//   const t = value as { hour?: string; minute?: string; meridiem?: string };
//   if (!t.hour || !t.minute) return '';
//   return `${t.hour}:${t.minute} ${t.meridiem || ''}`.trim();
// }

// // FIX (per client request 2026-08-02): HTML <input type="date"> fields
// // (e.g. "Expected Delivery — From/To") always store their value internally
// // as ISO "YYYY-MM-DD", regardless of how the date picker displays it on
// // screen. That raw ISO string was passed straight through into the email,
// // showing "2026-09-14" instead of a readable date. This detects any plain
// // ISO date string — for any field, not just delivery dates — and reformats
// // it to DD/MM/YYYY, matching how the booking form itself displays dates.
// function formatIsoDateIfPresent(value: string): string | null {
//   const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
//   if (!match) return null;
//   const [, year, month, day] = match;
//   return `${day}/${month}/${year}`;
// }

// function formatValue(key: string, value: unknown): string {
//   if (value === null || value === undefined || value === '') return '';
//   if (key === 'dob' || key.endsWith('Dob')) {
//     if (value && typeof value === 'object') return formatDob(value);
//     const str = String(value ?? '').trim();
//     return formatIsoDateIfPresent(str) || str;
//   }
//   if (key === 'tob' || key.endsWith('Tob')) return formatTob(value);
//   if (key === 'addons' && Array.isArray(value)) {
//     return value
//       .map((a) => {
//         if (a && typeof a === 'object') {
//           const item = a as { label?: string; price?: number; id?: string };
//           return item.label ? `${item.label}${item.price ? ` (₹${item.price})` : ''}` : item.id || '';
//         }
//         return String(a);
//       })
//       .filter(Boolean)
//       .join(', ');
//   }
//   if (typeof value === 'boolean') return value ? 'Yes' : 'No';
//   if (typeof value === 'string' && /^(yes|no)$/i.test(value.trim())) {
//     return value.trim()[0].toUpperCase() + value.trim().slice(1).toLowerCase();
//   }
//   if (typeof value === 'object') return '';
//   const str = String(value).trim();
//   const isoDate = formatIsoDateIfPresent(str);
//   return isoDate || str;
// }

// function titleCaseFromKey(key: string): string {
//   return key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();
// }

// function baseLabelForSuffix(suffix: string): string {
//   if (FIELD_LABELS[suffix]) return FIELD_LABELS[suffix];
//   const override = SUFFIX_LABEL_OVERRIDES.find(([pattern]) => pattern.test(suffix));
//   if (override) {
//     const [pattern, label] = override;
//     // Preserve any meaningful prefix before the recognized suffix, e.g.
//     // "motherDob" -> "Mother — Date of Birth", "fatherDob" -> "Father —
//     // Date of Birth" (not both collapsing to plain "Date of Birth").
//     const prefix = suffix.replace(new RegExp(pattern.source, 'i'), '');
//     const prefixLabel = prefix ? titleCaseFromKey(prefix) : '';
//     return prefixLabel ? `${prefixLabel} — ${label}` : label;
//   }
//   return titleCaseFromKey(suffix);
// }

// function labelForKey(key: string): string {
//   if (FIELD_LABELS[key]) return FIELD_LABELS[key];
//   if (key.startsWith('person')) {
//     const suffix = key.replace(/^person\d+_?/, '');
//     const base = baseLabelForSuffix(suffix);
//     return `Person ${key.match(/\d+/)?.[0] || ''} — ${base}`.trim();
//   }
//   return baseLabelForSuffix(key);
// }

// function flattenFormEntries(obj: Record<string, unknown>, prefix = ''): Array<[string, string]> {
//   const rows: Array<[string, string]> = [];

//   for (const [key, value] of Object.entries(obj)) {
//     if (SKIP_KEYS.has(key)) continue;

//     if (value && typeof value === 'object' && !Array.isArray(value) && key !== 'dob' && key !== 'tob' && !key.endsWith('Dob') && !key.endsWith('Tob')) {
//       if (key === 'person1' || key === 'person2' || key === 'person3' || /^person\d+$/.test(key)) {
//         const nested = value as Record<string, unknown>;
//         for (const [nestedKey, nestedVal] of Object.entries(nested)) {
//           const compositeKey = `${key}_${nestedKey}`;
//           const formatted = formatValue(nestedKey, nestedVal);
//           if (formatted) rows.push([labelForKey(compositeKey), formatted]);
//         }
//         continue;
//       }
//     }

//     const formatted = formatValue(key, value);
//     if (formatted) rows.push([labelForKey(key), formatted]);
//   }

//   return rows;
// }

// /** Strip internal fields and keep a JSON-safe snapshot for order.metadata.formSnapshot. */
// export function sanitizeFormSnapshot(formData: Record<string, unknown>): Record<string, unknown> {
//   const snapshot: Record<string, unknown> = {};
//   for (const [key, value] of Object.entries(formData || {})) {
//     if (SKIP_KEYS.has(key)) continue;
//     if (value === null || value === undefined || value === '') continue;
//     snapshot[key] = value;
//   }
//   return snapshot;
// }

// export function mergeOrderMetadata(
//   existing: Record<string, unknown> | null | undefined,
//   formData: Record<string, unknown>,
// ): Record<string, unknown> {
//   const snapshot = sanitizeFormSnapshot(formData);
//   const base = { ...(existing || {}) };
//   if (!Object.keys(snapshot).length) return base;
//   return {
//     ...base,
//     formSnapshot: snapshot,
//     formSnapshotAt: new Date().toISOString(),
//   };
// }

// function escapeHtml(text: string): string {
//   return text
//     .replace(/&/g, '&amp;')
//     .replace(/</g, '&lt;')
//     .replace(/>/g, '&gt;')
//     .replace(/"/g, '&quot;');
// }

// // FIX (per client request 2026-08-02): sections were previously wrapped in
// // a bordered, background-filled "box" (like the TAX INVOICE intro above
// // them). The client wants only that intro to stay boxed — the Order
// // Information / Customer Contact / Order Details sections below it should
// // be plain text/rows with no surrounding box, so the customer can easily
// // select and copy the details straight out of the email.
// function sectionTable(rows: FormRow[]): string {
//   if (!rows.length) return '';
//   return rows
//     .map((row) =>
//       row.kind === 'section'
//         ? `<p style="margin:16px 0 6px;font-size:13px;font-weight:700;color:#4b77be;">${escapeHtml(row.title)}</p>`
//         : `<p style="margin:0 0 8px;font-size:14px;line-height:1.5;"><strong style="color:#444;">${escapeHtml(row.label)}:</strong> ${escapeHtml(row.value)}</p>`,
//     )
//     .join('');
// }

// function sectionHeading(title: string): string {
//   return `<h3 style="margin:20px 0 8px;font-size:15px;color:#4b77be;border-bottom:1px solid #e5e7eb;padding-bottom:6px;">${escapeHtml(title)}</h3>`;
// }

// // Splits Empower's combined "nameOptions" free-text field — which bundles
// // Preferred Name Style, Name Options/Specific Letter, Additional Notes, and
// // Add-ons into one string with bracketed tags, e.g.:
// //   "Y or H letters [NAME STYLE: Mix of All] [NOTES: ...] [ADD-ON: +10 names (₹737)]"
// // — back into the separate fields the booking form actually presented to
// // the customer.
// function parseNameOptions(raw: unknown): {
//   nameStyle?: string;
//   specificLetter?: string;
//   notes?: string;
//   addons?: string;
// } {
//   const text = typeof raw === 'string' ? raw.trim() : '';
//   if (!text) return {};
//   const tagRe = /\[([A-Za-z][A-Za-z\s-]*):\s*([\s\S]*?)\]/g;
//   const tags: Record<string, string> = {};
//   const addons: string[] = [];
//   let leftover = text;
//   let m: RegExpExecArray | null;
//   while ((m = tagRe.exec(text))) {
//     const tag = m[1].trim().toUpperCase();
//     const val = m[2].trim();
//     if (tag === 'ADD-ON') addons.push(val);
//     else tags[tag] = val;
//     leftover = leftover.split(m[0]).join('');
//   }
//   leftover = leftover.replace(/\s+/g, ' ').trim();
//   return {
//     nameStyle: tags['NAME STYLE'],
//     notes: tags['NOTES'],
//     addons: addons.length ? addons.join('; ') : undefined,
//     specificLetter: leftover || undefined,
//   };
// }

// export type FormRow = { kind: 'section'; title: string } | { kind: 'field'; label: string; value: string };

// function field(label: string, value: unknown, key = label): FormRow {
//   // Reuses formatValue()'s existing date/yes-no formatting by key pattern
//   // (e.g. a label ending "Date of Birth" still needs its *Dob key passed in
//   // for the ISO->DD/MM/YYYY conversion below) — falls back to plain string.
//   const formatted = value === null || value === undefined || value === '' ? '' : formatValue(key, value);
//   return { kind: 'field', label, value: formatted || '-' };
// }

// function section(title: string): FormRow {
//   return { kind: 'section', title };
// }

// // Exact, fixed field lists per service — client-provided spec (2026-08-06).
// // Keyed by "<source_website>::<packageType>". A match here takes priority
// // over the generic auto-detected field list below, so these render in the
// // precise order/labels/grouping given, regardless of what other keys exist
// // in metadata. Add more entries here (and for Ankshaastra / Miracle Baby)
// // as their exact specs are provided — anything not listed still falls back
// // to the generic, future-proof auto-formatter, so nothing is ever blank.
// const SERVICE_TEMPLATES: Record<string, (snapshot: Record<string, unknown>) => FormRow[]> = {
//   'empower.ankshaastra.com::namecheck-1': (s) => [
//     section('Person 1 Details'),
//     field('First Name', s.person1FirstName, 'person1FirstName'),
//     field('Middle Name', s.person1MiddleName, 'person1MiddleName'),
//     field('Last Name', s.person1SurName, 'person1SurName'),
//     field("Is the middle name father's / husband's name?", s.person1MiddleNameType, 'person1MiddleNameType'),
//     field('Date of Birth', s.person1Dob, 'person1Dob'),
//     field('Gender', s.person1Gender, 'person1Gender'),
//     section('Contact Details'),
//     field('WhatsApp Number', s.mobile, 'mobile'),
//     field('Email ID', s.email, 'email'),
//     field('City of Birth', s.city, 'city'),
//     field('State/Province', s.state ?? s.customerState, 'state'),
//     field('PIN Code', s.pinCode ?? s.pincode, 'pinCode'),
//     field("Parents Profession", s.parentsProfession ?? s.parentProfession, 'parentsProfession'),
//   ],
//   'empower.ankshaastra.com::namecheck-2': (s) => [
//     section('Person 1 Details'),
//     field('First Name', s.person1FirstName, 'person1FirstName'),
//     field('Middle Name', s.person1MiddleName, 'person1MiddleName'),
//     field('Last Name', s.person1SurName, 'person1SurName'),
//     field("Is the middle name father's / husband's name?", s.person1MiddleNameType, 'person1MiddleNameType'),
//     field('Date of Birth', s.person1Dob, 'person1Dob'),
//     field('Gender', s.person1Gender, 'person1Gender'),
//     section('Person 2 Details'),
//     field('First Name', s.person2FirstName, 'person2FirstName'),
//     field('Middle Name', s.person2MiddleName, 'person2MiddleName'),
//     field('Last Name', s.person2SurName, 'person2SurName'),
//     field("Is the middle name father's / husband's name?", s.person2MiddleNameType, 'person2MiddleNameType'),
//     field('Date of Birth', s.person2Dob, 'person2Dob'),
//     field('Gender', s.person2Gender, 'person2Gender'),
//     section('Contact Details'),
//     field('WhatsApp Number', s.mobile, 'mobile'),
//     field('Email ID', s.email, 'email'),
//     field('City of Birth', s.city, 'city'),
//     field('State/Province', s.state ?? s.customerState, 'state'),
//     field('PIN Code', s.pinCode ?? s.pincode, 'pinCode'),
//     field("Parents Profession", s.parentsProfession ?? s.parentProfession, 'parentsProfession'),
//   ],
//   // Covers both "Perfect Baby Name Report" and "Complete Baby Name
//   // Blueprint" — both save as packageType "single" with an identical field
//   // set; the add-ons each package offers already come through inside
//   // nameOptions' "[ADD-ON: ...]" tag(s), so no separate template is needed.
//   'empower.ankshaastra.com::single': (s) => {
//     const parsed = parseNameOptions(s.nameOptions);
//     return [
//       section('Baby Name Details'),
//       field("Child's Date of Birth", s.childDob, 'childDob'),
//       field('Exact Time of Birth', s.timeOfBirth, 'timeOfBirth'),
//       field('Gender', s.gender, 'gender'),
//       field("Father's Full Name", s.fatherFullName, 'fatherFullName'),
//       field("Child's Middle Name", s.childMiddleName, 'childMiddleName'),
//       field("Child's Last Name", s.childLastName, 'childLastName'),
//       field("Is the father's first name used as the child's middle name?", s.fatherFirstNameAsMiddleName, 'fatherFirstNameAsMiddleName'),
//       field('Comfortable changing last name spelling if required?', s.lastNameSpellingChangeOk, 'lastNameSpellingChangeOk'),
//       field('Preferred Name Style', parsed.nameStyle),
//       field('Name Options / Specific Letter', parsed.specificLetter),
//       field('Additional Notes', parsed.notes),
//       field('Add-on(s)', parsed.addons),
//       section('Contact Details'),
//       field('WhatsApp Number', s.mobile, 'mobile'),
//       field('Email ID', s.email, 'email'),
//       field('City of Birth', s.city, 'city'),
//       field('State/Province', s.state ?? s.customerState, 'state'),
//       field('PIN Code', s.pinCode ?? s.pincode, 'pinCode'),
//       field("Parents Profession", s.parentsProfession ?? s.parentProfession, 'parentsProfession'),
//     ];
//   },
// };

// // Miracle Baby — client-provided spec (2026-08-07). Both packages share the
// // same field list; keyed by order.service_title since Miracle Baby's
// // metadata has no packageType.
// function miracleBabyTemplate(s: Record<string, unknown>): FormRow[] {
//   return [
//     // NOTE: "Add On" (e.g. "Delivery Date Change Protection") was in the
//     // client's spec but is NOT saved anywhere in order.metadata (checked
//     // across 15 real orders, ₹1 to ₹5,884) — Miracle Baby's checkout form
//     // doesn't record which add-on was chosen, only folds it into the final
//     // price. Left out here rather than always showing "-"; add it back
//     // (field('Add On', s.addOn, 'addOn')) once Miracle Baby's form is
//     // updated to actually save this.
//     field("Mother's Full Name", s.motherName, 'motherName'),
//     field("Mother's DOB", s.motherDob, 'motherDob'),
//     field("Father's Full Name", s.fatherName, 'fatherName'),
//     field("Father's DOB", s.fatherDob, 'fatherDob'),
//     field('Expected Delivery Date - From', s.expectedDeliveryFrom, 'expectedDeliveryFrom'),
//     field('Expected Delivery Date - To', s.expectedDeliveryTo, 'expectedDeliveryTo'),
//     field('Hospital Name', s.hospitalName, 'hospitalName'),
//     field('Numbers To Avoid/Prefer', s.avoidOrPreferNumbers, 'avoidOrPreferNumbers'),
//     field('Preferred Deity', s.preferredDeity, 'preferredDeity'),
//     field('Qualities To Manifest', s.qualities, 'qualities'),
//     field('Notes/Special Request', s.notes, 'notes'),
//     section('Contact Details'),
//     field('WhatsApp Number', s.whatsapp, 'whatsapp'),
//     field('Email ID', s.email, 'email'),
//     field('City of Birth', s.city, 'city'),
//     field('State/Province', s.state ?? s.customerState, 'state'),
//   ];
// }
// SERVICE_TEMPLATES['miraclebaby.ankshaastra.com::Complete Package'] = miracleBabyTemplate;
// SERVICE_TEMPLATES['miraclebaby.ankshaastra.com::Essentials Package'] = miracleBabyTemplate;

// // ───────────────────────────────────────────────────────────────────────
// // Ankshaastra's own services. Extracted directly from the Zod schemas in
// // src/pages/Payment.tsx (defaultSchema, kundaliSchema, consultationSchema,
// // nameCorrectionSchema, nameCheckSchema, nameCorrectionCoupleSchema,
// // pyaarShastraSchema, kundaliMultiSchema) — these ARE the fields the
// // checkout form collects, so no guessing is needed here the way it was
// // for Empower/Miracle Baby.
// // ───────────────────────────────────────────────────────────────────────

// const CURRENT_LOCATION_ROWS = (s: Record<string, unknown>): FormRow[] => [
//   section('Current Address'),
//   field('Current City', s.currentCity, 'currentCity'),
//   field('Current State', s.currentState, 'currentState'),
//   field('Current Pincode', s.currentPincode, 'currentPincode'),
// ];

// function personRows(title: string, p: Record<string, unknown> | undefined, extra: FormRow[] = []): FormRow[] {
//   const s = p || {};
//   return [
//     section(title),
//     field('Full Name', s.fullName, 'fullName'),
//     field('Date of Birth', s.dob, 'dob'),
//     field('Time of Birth', s.tob, 'tob'),
//     field('Place of Birth', s.pob, 'pob'),
//     field('Gender', s.gender, 'gender'),
//     field('Pincode', s.pincode, 'pincode'),
//     ...extra,
//   ];
// }

// function nameCorrectionPersonRows(title: string, p: Record<string, unknown> | undefined): FormRow[] {
//   const s = p || {};
//   return [
//     section(title),
//     field('First Name', s.firstName, 'firstName'),
//     field('Middle Name', s.middleName, 'middleName'),
//     field('Last Name', s.lastName, 'lastName'),
//     field("Is the middle name father's / husband's name?", s.middleIsFatherName, 'middleIsFatherName'),
//     field('Comfortable changing last name spelling?', s.lastNameChangeOk, 'lastNameChangeOk'),
//     field('Date of Birth', s.dob, 'dob'),
//     field('Time of Birth', s.tob, 'tob'),
//     field('Place of Birth', s.pob, 'pob'),
//     field('Gender', s.gender, 'gender'),
//     field('Relationship with Father', s.relationFather, 'relationFather'),
//     field('Relationship with Mother', s.relationMother, 'relationMother'),
//     field('Relationship with Spouse', s.relationSpouse, 'relationSpouse'),
//     field("Father's Name", s.fatherName, 'fatherName'),
//     field("Mother's Name", s.motherName, 'motherName'),
//     field("Spouse's Name", s.spouseName, 'spouseName'),
//     field('Profession', s.profession, 'profession'),
//   ];
// }

// const ANKSHAASTRA_TEMPLATES: Record<string, (s: Record<string, unknown>) => FormRow[]> = {
//   default: (s) => [
//     section('Personal Details'),
//     field('Full Name', s.fullName, 'fullName'),
//     field('WhatsApp Number', s.whatsapp, 'whatsapp'),
//     field('Email ID', s.email, 'email'),
//     field('Date of Birth', s.dob, 'dob'),
//     field('Time of Birth', s.tob, 'tob'),
//     field('Place of Birth', s.pob, 'pob'),
//     field('Gender', s.gender, 'gender'),
//     field('Pincode', s.pincode, 'pincode'),
//     ...CURRENT_LOCATION_ROWS(s),
//   ],
//   kundali: (s) => [
//     section('Personal Details'),
//     field('Full Name', s.fullName, 'fullName'),
//     field('WhatsApp Number', s.whatsapp, 'whatsapp'),
//     field('Email ID', s.email, 'email'),
//     field('Date of Birth', s.dob, 'dob'),
//     field('Time of Birth', s.tob, 'tob'),
//     field('Place of Birth', s.pob, 'pob'),
//     field('Gender', s.gender, 'gender'),
//     field('Pincode', s.pincode, 'pincode'),
//     field('Preferred Language', s.language, 'language'),
//     ...CURRENT_LOCATION_ROWS(s),
//   ],
//   'kundali-multi': (s) => [
//     ...personRows('Person 1 Details', s.person1 as Record<string, unknown>),
//     ...personRows('Person 2 Details', s.person2 as Record<string, unknown>),
//     ...(s.person3 ? personRows('Person 3 Details', s.person3 as Record<string, unknown>) : []),
//     section('Contact Details'),
//     field('Email ID', s.email, 'email'),
//     field('WhatsApp Number', s.whatsapp, 'whatsapp'),
//     field('Preferred Language', s.language, 'language'),
//     ...CURRENT_LOCATION_ROWS(s),
//   ],
//   consultation: (s) => [
//     section('Personal Details'),
//     field('First Name', s.firstName, 'firstName'),
//     field('Middle Name', s.middleName, 'middleName'),
//     field('Last Name', s.lastName, 'lastName'),
//     field("Is the middle name father's / husband's name?", s.middleIsFatherName, 'middleIsFatherName'),
//     field('Email ID', s.email, 'email'),
//     field('WhatsApp Number', s.whatsapp, 'whatsapp'),
//     field('Date of Birth', s.dob, 'dob'),
//     field('Time of Birth', s.tob, 'tob'),
//     field('Place of Birth', s.pob, 'pob'),
//     field('Pincode', s.pincode, 'pincode'),
//     field('Gender', s.gender, 'gender'),
//     field('Issues to Discuss', s.issues, 'issues'),
//     ...CURRENT_LOCATION_ROWS(s),
//   ],
//   'name-correction': (s) => [
//     ...nameCorrectionPersonRows('Personal Details', s),
//     section('Contact Details'),
//     field('Email ID', s.email, 'email'),
//     field('WhatsApp Number', s.whatsapp, 'whatsapp'),
//     field('Reason for Correction', s.reason, 'reason'),
//     ...CURRENT_LOCATION_ROWS(s),
//   ],
//   'name-check': (s) => [
//     section('Personal Details'),
//     field('First Name', s.firstName, 'firstName'),
//     field('Middle Name', s.middleName, 'middleName'),
//     field('Last Name', s.lastName, 'lastName'),
//     field("Is the middle name father's / husband's name?", s.middleIsFatherName, 'middleIsFatherName'),
//     field('WhatsApp Number', s.whatsapp, 'whatsapp'),
//     field('Email ID', s.email, 'email'),
//     field('Pincode', s.pincode, 'pincode'),
//     field('Date of Birth', s.dob, 'dob'),
//     field('Place of Birth', s.pob, 'pob'),
//     field('Gender', s.gender, 'gender'),
//     ...CURRENT_LOCATION_ROWS(s),
//   ],
//   'name-correction-couple': (s) => [
//     ...nameCorrectionPersonRows('Person 1 Details', s.person1 as Record<string, unknown>),
//     ...nameCorrectionPersonRows('Person 2 Details', s.person2 as Record<string, unknown>),
//     section('Contact Details'),
//     field('Email ID', s.email, 'email'),
//     field('WhatsApp Number', s.whatsapp, 'whatsapp'),
//     field('Reason for Correction', s.reason, 'reason'),
//     ...CURRENT_LOCATION_ROWS(s),
//   ],
//   'pyaar-shastra': (s) => [
//     ...personRows('Person 1 Details', s.person1 as Record<string, unknown>),
//     ...personRows('Person 2 Details', s.person2 as Record<string, unknown>),
//     section('Contact Details'),
//     field('Email ID', s.email, 'email'),
//     field('WhatsApp Number', s.whatsapp, 'whatsapp'),
//     field('Preferred Language', s.language, 'language'),
//     ...CURRENT_LOCATION_ROWS(s),
//   ],
//   // From luckyMobileSchema in src/lib/payment-form-ext.ts.
//   'lucky-mobile': (s) => [
//     section('Personal Details'),
//     field('Full Name', s.fullName, 'fullName'),
//     field('Date of Birth', s.dob, 'dob'),
//     field('Gender', s.gender, 'gender'),
//     section('Mobile Number Details'),
//     field('Current Mobile Number', s.currentMobile, 'currentMobile'),
//     field('Preferred Series', s.preferredSeries, 'preferredSeries'),
//     field('Preferred Digits', s.preferredDigits, 'preferredDigits'),
//     field('Digits to Avoid', s.avoidDigits, 'avoidDigits'),
//     field('Purpose', s.purpose, 'purpose'),
//     section('Contact Details'),
//     field('Email ID', s.email, 'email'),
//     field('WhatsApp Number', s.whatsapp, 'whatsapp'),
//     ...CURRENT_LOCATION_ROWS(s),
//   ],
// };

// // Mirrors inferFormType() in src/pages/Payment.tsx exactly, so the same
// // service title always maps to the same form here as it did at checkout.
// function inferAnkshaastraFormType(serviceTitle: string, hasConsultationType: boolean): string {
//   if (hasConsultationType) return 'consultation';
//   if (!serviceTitle) return 'default';
//   const s = serviceTitle.toLowerCase();
//   // Widened beyond the exact "1:1 call" substring Payment.tsx checks for —
//   // the real order data has titles like "1:1 Audio Call" / "1:1 Video
//   // Call" which don't literally contain "1:1 call" as a substring.
//   if (s.includes('call consultation') || s.includes('1:1') || s.includes('audio call') || s.includes('video call'))
//     return 'consultation';
//   if (s.includes('pyaar shastra') || s.includes('pyaar shaastra')) return 'pyaar-shastra';
//   if (s.includes('name check')) return 'name-check';
//   if (s.includes('complete blueprint') || s.includes('for 2 people')) return 'name-correction-couple';
//   if (s.includes('name correction')) return 'name-correction';
//   if (
//     (s.includes('kundali') || s.includes('kundli')) &&
//     (s.includes('triple') || s.includes('family') || s.includes('for 3') || s.includes('double') || s.includes('for 2') || s.includes('2 kundli') || s.includes('3 kundli'))
//   )
//     return 'kundali-multi';
//   if (s.includes('kundali') || s.includes('kundli') || s.includes('varshphal')) return 'kundali';
//   // From inferExtendedFormType() in src/lib/payment-form-ext.ts.
//   if (s.includes('lucky mobile') || (s.includes('mobile number') && !s.includes('business'))) return 'lucky-mobile';
//   return 'default';
// }
// // order — e.g. Person 1 — First Name, Hospital Name, Expected Delivery — From,
// // etc. — whatever fields were actually filled in for whatever service was
// // purchased, on whichever of the three sites. Used by the invoice PDF so it
// // shows the correct fields for every service automatically, without any
// // per-service code changes. (Order ID/Amount/customer contact rows are
// // intentionally excluded here since the PDF already renders those itself.)
// export function getOrderFormRows(order: Record<string, unknown>): FormRow[] {
//   const metadata = (order.metadata as Record<string, unknown> | undefined) || {};
//   const snapshotFromMeta = metadata.formSnapshot as Record<string, unknown> | undefined;
//   const legacyMeta: Record<string, unknown> = {};
//   for (const [key, value] of Object.entries(metadata)) {
//     if (key === 'formSnapshot' || key === 'formSnapshotAt' || key === 'serviceId') continue;
//     if (value !== null && value !== undefined && value !== '') legacyMeta[key] = value;
//   }
//   const formSnapshot = { ...legacyMeta, ...(snapshotFromMeta || {}) };

//   // Exact, client-specced template takes priority when one matches this
//   // order's website + service — see SERVICE_TEMPLATES above. Different
//   // sites identify "which service" differently: Empower saves
//   // metadata.packageType (e.g. "namecheck-1"); Miracle Baby has no such
//   // key and instead relies on order.service_title (e.g. "Complete
//   // Package") — so both are tried as lookup keys.
//   const sourceWebsite = String(order.source_website || '');
//   const packageType = String(formSnapshot.packageType || '');
//   const serviceTitle = String(order.service_title || '');
//   const templateFn =
//     SERVICE_TEMPLATES[`${sourceWebsite}::${packageType}`] || SERVICE_TEMPLATES[`${sourceWebsite}::${serviceTitle}`];
//   if (templateFn) return templateFn(formSnapshot);

//   if (sourceWebsite === 'ankshaastra.com') {
//     const hasConsultationType = Boolean(formSnapshot.consultationType);
//     const formType = inferAnkshaastraFormType(serviceTitle, hasConsultationType);
//     const ankshaastraTemplate = ANKSHAASTRA_TEMPLATES[formType];
//     if (ankshaastraTemplate) return ankshaastraTemplate(formSnapshot);
//   }

//   // These duplicate what's already shown elsewhere on the invoice (header
//   // "Purchased By" / "Phone" lines, and the Billing Address block, which is
//   // resolved separately in resolveCustomerBilling() using the same aliases)
//   // — confirmed against real order.metadata from all three sites (2026-08-05).
//   const alreadyShownKeys = new Set([
//     'city', 'currentCity', 'officeCity',
//     'state', 'customerState', 'currentState', 'officeState', 'deliveryState',
//     'pincode', 'pinCode', 'officePincode',
//     'email', 'whatsapp',
//     'name', 'mobile', 'mobileNumber', 'currentMobile',
//   ]);
//   // Manually-created orders (staff typing up an invoice by hand) sometimes
//   // use "notes" for an internal comment, not a customer-submitted special
//   // request — keep it off the customer-facing PDF/email in that case only.
//   if (metadata.manualEntry === true) alreadyShownKeys.add('notes');
//   // Empower forms save single-purchaser info twice — once as bare
//   // dob/gender/name, again as person1Dob/person1Gender/person1Name. Keep
//   // only the more detailed "Person 1 — ..." version when both are present.
//   if (formSnapshot.person1Dob) alreadyShownKeys.add('dob');
//   if (formSnapshot.person1Gender) alreadyShownKeys.add('gender');
//   if (formSnapshot.person1Name) alreadyShownKeys.add('name');
//   const formEntries = Object.fromEntries(
//     Object.entries(formSnapshot).filter(([key]) => !alreadyShownKeys.has(key)),
//   );

//   return flattenFormEntries(formEntries).map(([label, value]) => ({ kind: 'field' as const, label, value }));
// }

// // FIX (per client request 2026-08-01): buildOrderDetailsHtml previously
// // emitted a single flat "Order Details" table mixing order metadata,
// // contact info, and every raw form field together. It's now split into
// // three clearly labeled sections — Order Information, Customer Contact,
// // and Order Details (Form Filled) — matching the layout the client asked
// // for. Fields already shown in "Order Information" / "Customer Contact"
// // are excluded from the "Form Filled" section so nothing is duplicated.
// export function buildOrderDetailsHtml(order: Record<string, unknown>): string {
//   const metadata = (order.metadata as Record<string, unknown> | undefined) || {};
//   const snapshotFromMeta = metadata.formSnapshot as Record<string, unknown> | undefined;
//   const legacyMeta: Record<string, unknown> = {};
//   for (const [key, value] of Object.entries(metadata)) {
//     if (key === 'formSnapshot' || key === 'formSnapshotAt' || key === 'serviceId') continue;
//     if (value !== null && value !== undefined && value !== '') legacyMeta[key] = value;
//   }
//   const formSnapshot = {
//     ...legacyMeta,
//     ...(snapshotFromMeta || {}),
//   };
//   // ── Order Information ────────────────────────────────────────────────────
//   const orderInfoRows: Array<[string, string]> = [];
//   const orderIdValue = order.id || order.razorpay_order_id;
//   if (orderIdValue) orderInfoRows.push(['Order ID', String(orderIdValue)]);
//   if (order.service_title) orderInfoRows.push(['Package', String(order.service_title)]);
//   const amountValue = order.total_amount ?? order.amount;
//   if (amountValue !== undefined && amountValue !== null && amountValue !== '') {
//     orderInfoRows.push(['Amount', `₹${Number(amountValue).toLocaleString('en-IN')}`]);
//   }
//   if (order.razorpay_payment_id) orderInfoRows.push(['Transaction ID', String(order.razorpay_payment_id)]);
//   if (order.status) orderInfoRows.push(['Status', String(order.status).toUpperCase()]);

//   // ── Customer Contact ─────────────────────────────────────────────────────
//   const contactRows: Array<[string, string]> = [];
//   if (order.customer_name) contactRows.push(['Name', String(order.customer_name)]);
//   if (order.customer_email) contactRows.push(['Email', String(order.customer_email)]);
//   if (order.customer_phone) contactRows.push(['Mobile', String(order.customer_phone)]);
//   const cityValue = formSnapshot.city || formSnapshot.currentCity || formSnapshot.officeCity;
//   if (cityValue) contactRows.push(['City', String(cityValue)]);

//   // ── Order Details (Form Filled) ──────────────────────────────────────────
//   // (city/email/whatsapp already surfaced above are excluded inside
//   // getOrderFormRows so nothing appears twice)
//   const formRows = getOrderFormRows(order);

//   if (!orderInfoRows.length && !contactRows.length && !formRows.length) return '';

//   return `
//     ${orderInfoRows.length ? sectionHeading('Order Information') + sectionTable(orderInfoRows.map(([label, value]) => ({ kind: 'field' as const, label, value }))) : ''}
//     ${contactRows.length ? sectionHeading('Customer Contact') + sectionTable(contactRows.map(([label, value]) => ({ kind: 'field' as const, label, value }))) : ''}
//     ${formRows.length ? sectionHeading('Order Details (Form Filled)') + sectionTable(formRows) : ''}
//   `;
// }


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
function sectionTable(rows: FormRow[]): string {
  if (!rows.length) return '';
  return rows
    .map((row) =>
      row.kind === 'section'
        ? `<p style="margin:16px 0 6px;font-size:13px;font-weight:700;color:#4b77be;">${escapeHtml(row.title)}</p>`
        : `<p style="margin:0 0 8px;font-size:14px;line-height:1.5;"><strong style="color:#444;">${escapeHtml(row.label)}:</strong> ${escapeHtml(row.value)}</p>`,
    )
    .join('');
}

function sectionHeading(title: string): string {
  return `<h3 style="margin:20px 0 8px;font-size:15px;color:#4b77be;border-bottom:1px solid #e5e7eb;padding-bottom:6px;">${escapeHtml(title)}</h3>`;
}

// Splits Empower's combined "nameOptions" free-text field — which bundles
// Preferred Name Style, Name Options/Specific Letter, Additional Notes, and
// Add-ons into one string with bracketed tags, e.g.:
//   "Y or H letters [NAME STYLE: Mix of All] [NOTES: ...] [ADD-ON: +10 names (₹737)]"
// — back into the separate fields the booking form actually presented to
// the customer.
function parseNameOptions(raw: unknown): {
  nameStyle?: string;
  specificLetter?: string;
  notes?: string;
  addons?: string;
} {
  const text = typeof raw === 'string' ? raw.trim() : '';
  if (!text) return {};
  const tagRe = /\[([A-Za-z][A-Za-z\s-]*):\s*([\s\S]*?)\]/g;
  const tags: Record<string, string> = {};
  const addons: string[] = [];
  let leftover = text;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(text))) {
    const tag = m[1].trim().toUpperCase();
    const val = m[2].trim();
    if (tag === 'ADD-ON') addons.push(val);
    else tags[tag] = val;
    leftover = leftover.split(m[0]).join('');
  }
  leftover = leftover.replace(/\s+/g, ' ').trim();
  return {
    nameStyle: tags['NAME STYLE'],
    notes: tags['NOTES'],
    addons: addons.length ? addons.join('; ') : undefined,
    specificLetter: leftover || undefined,
  };
}

export type FormRow = { kind: 'section'; title: string } | { kind: 'field'; label: string; value: string };

function field(label: string, value: unknown, key = label): FormRow {
  // Reuses formatValue()'s existing date/yes-no formatting by key pattern
  // (e.g. a label ending "Date of Birth" still needs its *Dob key passed in
  // for the ISO->DD/MM/YYYY conversion below) — falls back to plain string.
  const formatted = value === null || value === undefined || value === '' ? '' : formatValue(key, value);
  return { kind: 'field', label, value: formatted || '-' };
}

function section(title: string): FormRow {
  return { kind: 'section', title };
}

// Exact, fixed field lists per service — client-provided spec (2026-08-06).
// Keyed by "<source_website>::<packageType>". A match here takes priority
// over the generic auto-detected field list below, so these render in the
// precise order/labels/grouping given, regardless of what other keys exist
// in metadata. Add more entries here (and for Ankshaastra / Miracle Baby)
// as their exact specs are provided — anything not listed still falls back
// to the generic, future-proof auto-formatter, so nothing is ever blank.
const SERVICE_TEMPLATES: Record<string, (snapshot: Record<string, unknown>) => FormRow[]> = {
  'empower.ankshaastra.com::namecheck-1': (s) => [
    section('Person 1 Details'),
    field('First Name', s.person1FirstName, 'person1FirstName'),
    field('Middle Name', s.person1MiddleName, 'person1MiddleName'),
    field('Last Name', s.person1SurName, 'person1SurName'),
    field("Is the middle name father's / husband's name?", s.person1MiddleNameType, 'person1MiddleNameType'),
    field('Date of Birth', s.person1Dob, 'person1Dob'),
    field('Gender', s.person1Gender, 'person1Gender'),
    section('Contact Details'),
    field('WhatsApp Number', s.mobile, 'mobile'),
    field('Email ID', s.email, 'email'),
    field('City of Birth', s.city, 'city'),
    field('State/Province', s.state ?? s.customerState, 'state'),
    field('PIN Code', s.pinCode ?? s.pincode, 'pinCode'),
    field("Parents Profession", s.parentsProfession ?? s.parentProfession, 'parentsProfession'),
  ],
  'empower.ankshaastra.com::namecheck-2': (s) => [
    section('Person 1 Details'),
    field('First Name', s.person1FirstName, 'person1FirstName'),
    field('Middle Name', s.person1MiddleName, 'person1MiddleName'),
    field('Last Name', s.person1SurName, 'person1SurName'),
    field("Is the middle name father's / husband's name?", s.person1MiddleNameType, 'person1MiddleNameType'),
    field('Date of Birth', s.person1Dob, 'person1Dob'),
    field('Gender', s.person1Gender, 'person1Gender'),
    section('Person 2 Details'),
    field('First Name', s.person2FirstName, 'person2FirstName'),
    field('Middle Name', s.person2MiddleName, 'person2MiddleName'),
    field('Last Name', s.person2SurName, 'person2SurName'),
    field("Is the middle name father's / husband's name?", s.person2MiddleNameType, 'person2MiddleNameType'),
    field('Date of Birth', s.person2Dob, 'person2Dob'),
    field('Gender', s.person2Gender, 'person2Gender'),
    section('Contact Details'),
    field('WhatsApp Number', s.mobile, 'mobile'),
    field('Email ID', s.email, 'email'),
    field('City of Birth', s.city, 'city'),
    field('State/Province', s.state ?? s.customerState, 'state'),
    field('PIN Code', s.pinCode ?? s.pincode, 'pinCode'),
    field("Parents Profession", s.parentsProfession ?? s.parentProfession, 'parentsProfession'),
  ],
  // Covers both "Perfect Baby Name Report" and "Complete Baby Name
  // Blueprint" — both save as packageType "single" with an identical field
  // set; the add-ons each package offers already come through inside
  // nameOptions' "[ADD-ON: ...]" tag(s), so no separate template is needed.
  'empower.ankshaastra.com::single': (s) => {
    const parsed = parseNameOptions(s.nameOptions);
    return [
      section('Baby Name Details'),
      field("Child's Date of Birth", s.childDob, 'childDob'),
      field('Exact Time of Birth', s.timeOfBirth, 'timeOfBirth'),
      field('Gender', s.gender, 'gender'),
      field("Father's Full Name", s.fatherFullName, 'fatherFullName'),
      field("Child's Middle Name", s.childMiddleName, 'childMiddleName'),
      field("Child's Last Name", s.childLastName, 'childLastName'),
      field("Is the father's first name used as the child's middle name?", s.fatherFirstNameAsMiddleName, 'fatherFirstNameAsMiddleName'),
      field('Comfortable changing last name spelling if required?', s.lastNameSpellingChangeOk, 'lastNameSpellingChangeOk'),
      field('Preferred Name Style', parsed.nameStyle),
      field('Name Options / Specific Letter', parsed.specificLetter),
      field('Additional Notes', parsed.notes),
      field('Add-on(s)', parsed.addons),
      section('Contact Details'),
      field('WhatsApp Number', s.mobile, 'mobile'),
      field('Email ID', s.email, 'email'),
      field('City of Birth', s.city, 'city'),
      field('State/Province', s.state ?? s.customerState, 'state'),
      field('PIN Code', s.pinCode ?? s.pincode, 'pinCode'),
      field("Parents Profession", s.parentsProfession ?? s.parentProfession, 'parentsProfession'),
    ];
  },
};

// Miracle Baby — client-provided spec (2026-08-07). Both packages share the
// same field list; keyed by order.service_title since Miracle Baby's
// metadata has no packageType.
function miracleBabyTemplate(s: Record<string, unknown>): FormRow[] {
  return [
    // NOTE: "Add On" (e.g. "Delivery Date Change Protection") was in the
    // client's spec but is NOT saved anywhere in order.metadata (checked
    // across 15 real orders, ₹1 to ₹5,884) — Miracle Baby's checkout form
    // doesn't record which add-on was chosen, only folds it into the final
    // price. Left out here rather than always showing "-"; add it back
    // (field('Add On', s.addOn, 'addOn')) once Miracle Baby's form is
    // updated to actually save this.
    field("Mother's Full Name", s.motherName, 'motherName'),
    field("Mother's DOB", s.motherDob, 'motherDob'),
    field("Father's Full Name", s.fatherName, 'fatherName'),
    field("Father's DOB", s.fatherDob, 'fatherDob'),
    field('Expected Delivery Date - From', s.expectedDeliveryFrom, 'expectedDeliveryFrom'),
    field('Expected Delivery Date - To', s.expectedDeliveryTo, 'expectedDeliveryTo'),
    field('Hospital Name', s.hospitalName, 'hospitalName'),
    field('Numbers To Avoid/Prefer', s.avoidOrPreferNumbers, 'avoidOrPreferNumbers'),
    field('Preferred Deity', s.preferredDeity, 'preferredDeity'),
    field('Qualities To Manifest', s.qualities, 'qualities'),
    field('Notes/Special Request', s.notes, 'notes'),
    section('Contact Details'),
    field('WhatsApp Number', s.whatsapp, 'whatsapp'),
    field('Email ID', s.email, 'email'),
    field('City of Birth', s.city, 'city'),
    field('State/Province', s.state ?? s.customerState, 'state'),
  ];
}
SERVICE_TEMPLATES['miraclebaby.ankshaastra.com::Complete Package'] = miracleBabyTemplate;
SERVICE_TEMPLATES['miraclebaby.ankshaastra.com::Essentials Package'] = miracleBabyTemplate;

// ───────────────────────────────────────────────────────────────────────
// Ankshaastra's own services. Extracted directly from the Zod schemas in
// src/pages/Payment.tsx (defaultSchema, kundaliSchema, consultationSchema,
// nameCorrectionSchema, nameCheckSchema, nameCorrectionCoupleSchema,
// pyaarShastraSchema, kundaliMultiSchema) — these ARE the fields the
// checkout form collects, so no guessing is needed here the way it was
// for Empower/Miracle Baby.
// ───────────────────────────────────────────────────────────────────────

const CURRENT_LOCATION_ROWS = (s: Record<string, unknown>): FormRow[] => [
  section('Current Address'),
  field('Current City', s.currentCity, 'currentCity'),
  field('Current State', s.currentState, 'currentState'),
  field('Current Pincode', s.currentPincode, 'currentPincode'),
];

function personRows(title: string, p: Record<string, unknown> | undefined, extra: FormRow[] = []): FormRow[] {
  const s = p || {};
  return [
    section(title),
    field('Full Name', s.fullName, 'fullName'),
    field('Date of Birth', s.dob, 'dob'),
    field('Time of Birth', s.tob, 'tob'),
    field('Place of Birth', s.pob, 'pob'),
    field('Gender', s.gender, 'gender'),
    field('Pincode', s.pincode, 'pincode'),
    ...extra,
  ];
}

function nameCorrectionPersonRows(title: string, p: Record<string, unknown> | undefined): FormRow[] {
  const s = p || {};
  return [
    section(title),
    field('First Name', s.firstName, 'firstName'),
    field('Middle Name', s.middleName, 'middleName'),
    field('Last Name', s.lastName, 'lastName'),
    field("Is the middle name father's / husband's name?", s.middleIsFatherName, 'middleIsFatherName'),
    field('Comfortable changing last name spelling?', s.lastNameChangeOk, 'lastNameChangeOk'),
    field('Date of Birth', s.dob, 'dob'),
    field('Time of Birth', s.tob, 'tob'),
    field('Place of Birth', s.pob, 'pob'),
    field('Gender', s.gender, 'gender'),
    field('Relationship with Father', s.relationFather, 'relationFather'),
    field('Relationship with Mother', s.relationMother, 'relationMother'),
    field('Relationship with Spouse', s.relationSpouse, 'relationSpouse'),
    field("Father's Name", s.fatherName, 'fatherName'),
    field("Mother's Name", s.motherName, 'motherName'),
    field("Spouse's Name", s.spouseName, 'spouseName'),
    field('Profession', s.profession, 'profession'),
  ];
}

const ANKSHAASTRA_TEMPLATES: Record<string, (s: Record<string, unknown>) => FormRow[]> = {
  default: (s) => [
    section('Personal Details'),
    field('Full Name', s.fullName, 'fullName'),
    field('WhatsApp Number', s.whatsapp, 'whatsapp'),
    field('Email ID', s.email, 'email'),
    field('Date of Birth', s.dob, 'dob'),
    field('Time of Birth', s.tob, 'tob'),
    field('Place of Birth', s.pob, 'pob'),
    field('Gender', s.gender, 'gender'),
    field('Pincode', s.pincode, 'pincode'),
    ...CURRENT_LOCATION_ROWS(s),
  ],
  kundali: (s) => [
    section('Personal Details'),
    field('Full Name', s.fullName, 'fullName'),
    field('WhatsApp Number', s.whatsapp, 'whatsapp'),
    field('Email ID', s.email, 'email'),
    field('Date of Birth', s.dob, 'dob'),
    field('Time of Birth', s.tob, 'tob'),
    field('Place of Birth', s.pob, 'pob'),
    field('Gender', s.gender, 'gender'),
    field('Pincode', s.pincode, 'pincode'),
    field('Preferred Language', s.language, 'language'),
    ...CURRENT_LOCATION_ROWS(s),
  ],
  'kundali-multi': (s) => [
    ...personRows('Person 1 Details', s.person1 as Record<string, unknown>),
    ...personRows('Person 2 Details', s.person2 as Record<string, unknown>),
    ...(s.person3 ? personRows('Person 3 Details', s.person3 as Record<string, unknown>) : []),
    section('Contact Details'),
    field('Email ID', s.email, 'email'),
    field('WhatsApp Number', s.whatsapp, 'whatsapp'),
    field('Preferred Language', s.language, 'language'),
    ...CURRENT_LOCATION_ROWS(s),
  ],
  consultation: (s) => [
    section('Personal Details'),
    field('First Name', s.firstName, 'firstName'),
    field('Middle Name', s.middleName, 'middleName'),
    field('Last Name', s.lastName, 'lastName'),
    field("Is the middle name father's / husband's name?", s.middleIsFatherName, 'middleIsFatherName'),
    field('Email ID', s.email, 'email'),
    field('WhatsApp Number', s.whatsapp, 'whatsapp'),
    field('Date of Birth', s.dob, 'dob'),
    field('Time of Birth', s.tob, 'tob'),
    field('Place of Birth', s.pob, 'pob'),
    field('Pincode', s.pincode, 'pincode'),
    field('Gender', s.gender, 'gender'),
    field('Issues to Discuss', s.issues, 'issues'),
    ...CURRENT_LOCATION_ROWS(s),
  ],
  'name-correction': (s) => [
    ...nameCorrectionPersonRows('Personal Details', s),
    section('Contact Details'),
    field('Email ID', s.email, 'email'),
    field('WhatsApp Number', s.whatsapp, 'whatsapp'),
    field('Reason for Correction', s.reason, 'reason'),
    ...CURRENT_LOCATION_ROWS(s),
  ],
  'name-check': (s) => [
    section('Personal Details'),
    field('First Name', s.firstName, 'firstName'),
    field('Middle Name', s.middleName, 'middleName'),
    field('Last Name', s.lastName, 'lastName'),
    field("Is the middle name father's / husband's name?", s.middleIsFatherName, 'middleIsFatherName'),
    field('WhatsApp Number', s.whatsapp, 'whatsapp'),
    field('Email ID', s.email, 'email'),
    field('Pincode', s.pincode, 'pincode'),
    field('Date of Birth', s.dob, 'dob'),
    field('Place of Birth', s.pob, 'pob'),
    field('Gender', s.gender, 'gender'),
    ...CURRENT_LOCATION_ROWS(s),
  ],
  'name-correction-couple': (s) => [
    ...nameCorrectionPersonRows('Person 1 Details', s.person1 as Record<string, unknown>),
    ...nameCorrectionPersonRows('Person 2 Details', s.person2 as Record<string, unknown>),
    section('Contact Details'),
    field('Email ID', s.email, 'email'),
    field('WhatsApp Number', s.whatsapp, 'whatsapp'),
    field('Reason for Correction', s.reason, 'reason'),
    ...CURRENT_LOCATION_ROWS(s),
  ],
  'pyaar-shastra': (s) => [
    ...personRows('Person 1 Details', s.person1 as Record<string, unknown>),
    ...personRows('Person 2 Details', s.person2 as Record<string, unknown>),
    section('Contact Details'),
    field('Email ID', s.email, 'email'),
    field('WhatsApp Number', s.whatsapp, 'whatsapp'),
    field('Preferred Language', s.language, 'language'),
    ...CURRENT_LOCATION_ROWS(s),
  ],
  // From luckyMobileSchema in src/lib/payment-form-ext.ts.
  'lucky-mobile': (s) => [
    section('Personal Details'),
    field('Full Name', s.fullName, 'fullName'),
    field('Date of Birth', s.dob, 'dob'),
    field('Gender', s.gender, 'gender'),
    section('Mobile Number Details'),
    field('Current Mobile Number', s.currentMobile, 'currentMobile'),
    field('Preferred Series', s.preferredSeries, 'preferredSeries'),
    field('Preferred Digits', s.preferredDigits, 'preferredDigits'),
    field('Digits to Avoid', s.avoidDigits, 'avoidDigits'),
    field('Purpose', s.purpose, 'purpose'),
    section('Contact Details'),
    field('Email ID', s.email, 'email'),
    field('WhatsApp Number', s.whatsapp, 'whatsapp'),
    ...CURRENT_LOCATION_ROWS(s),
  ],
};

// Mirrors inferFormType() in src/pages/Payment.tsx exactly, so the same
// service title always maps to the same form here as it did at checkout.
function inferAnkshaastraFormType(serviceTitle: string, hasConsultationType: boolean): string {
  if (hasConsultationType) return 'consultation';
  if (!serviceTitle) return 'default';
  const s = serviceTitle.toLowerCase();
  // Widened beyond the exact "1:1 call" substring Payment.tsx checks for —
  // the real order data has titles like "1:1 Audio Call" / "1:1 Video
  // Call" which don't literally contain "1:1 call" as a substring.
  if (s.includes('call consultation') || s.includes('1:1') || s.includes('audio call') || s.includes('video call'))
    return 'consultation';
  if (s.includes('pyaar shastra') || s.includes('pyaar shaastra')) return 'pyaar-shastra';
  if (s.includes('name check')) return 'name-check';
  if (s.includes('complete blueprint') || s.includes('for 2 people')) return 'name-correction-couple';
  if (s.includes('name correction')) return 'name-correction';
  if (
    (s.includes('kundali') || s.includes('kundli')) &&
    (s.includes('triple') || s.includes('family') || s.includes('for 3') || s.includes('double') || s.includes('for 2') || s.includes('2 kundli') || s.includes('3 kundli'))
  )
    return 'kundali-multi';
  if (s.includes('kundali') || s.includes('kundli') || s.includes('varshphal')) return 'kundali';
  // From inferExtendedFormType() in src/lib/payment-form-ext.ts.
  if (s.includes('lucky mobile') || (s.includes('mobile number') && !s.includes('business'))) return 'lucky-mobile';
  return 'default';
}
// order — e.g. Person 1 — First Name, Hospital Name, Expected Delivery — From,
// etc. — whatever fields were actually filled in for whatever service was
// purchased, on whichever of the three sites. Used by the invoice PDF so it
// shows the correct fields for every service automatically, without any
// per-service code changes. (Order ID/Amount/customer contact rows are
// intentionally excluded here since the PDF already renders those itself.)
// Turns Empower's raw namecheck-N slug into a readable display name for the
// invoice/email — everything else (including packageType "single", which
// covers two differently-named services with no single correct display
// name, and Ankshaastra/Miracle Baby's own already-readable service_title
// values) is left exactly as order.service_title already has it, per
// client's explicit choice (2026-08-08).
export function formatServiceDisplayName(order: Record<string, unknown>): string {
  const rawTitle = String(order.service_title || 'Service');
  const metadata = (order.metadata as Record<string, unknown> | undefined) || {};
  const snapshot = (metadata.formSnapshot as Record<string, unknown> | undefined) || metadata;
  const packageType = String(snapshot.packageType || '');
  const namecheckMatch = /^namecheck-(\d+)$/i.exec(packageType);
  if (namecheckMatch) return `Name Check - ${namecheckMatch[1]}`;
  return rawTitle;
}

export function getOrderFormRows(order: Record<string, unknown>): FormRow[] {
  const metadata = (order.metadata as Record<string, unknown> | undefined) || {};
  const snapshotFromMeta = metadata.formSnapshot as Record<string, unknown> | undefined;
  const legacyMeta: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (key === 'formSnapshot' || key === 'formSnapshotAt' || key === 'serviceId') continue;
    if (value !== null && value !== undefined && value !== '') legacyMeta[key] = value;
  }
  const formSnapshot = { ...legacyMeta, ...(snapshotFromMeta || {}) };

  // Exact, client-specced template takes priority when one matches this
  // order's website + service — see SERVICE_TEMPLATES above. Different
  // sites identify "which service" differently: Empower saves
  // metadata.packageType (e.g. "namecheck-1"); Miracle Baby has no such
  // key and instead relies on order.service_title (e.g. "Complete
  // Package") — so both are tried as lookup keys.
  const sourceWebsite = String(order.source_website || '');
  const packageType = String(formSnapshot.packageType || '');
  const serviceTitle = String(order.service_title || '');
  const templateFn =
    SERVICE_TEMPLATES[`${sourceWebsite}::${packageType}`] || SERVICE_TEMPLATES[`${sourceWebsite}::${serviceTitle}`];
  if (templateFn) return templateFn(formSnapshot);

  if (sourceWebsite === 'ankshaastra.com') {
    const hasConsultationType = Boolean(formSnapshot.consultationType);
    const formType = inferAnkshaastraFormType(serviceTitle, hasConsultationType);
    const ankshaastraTemplate = ANKSHAASTRA_TEMPLATES[formType];
    if (ankshaastraTemplate) return ankshaastraTemplate(formSnapshot);
  }

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

  return flattenFormEntries(formEntries).map(([label, value]) => ({ kind: 'field' as const, label, value }));
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
    ${orderInfoRows.length ? sectionHeading('Order Information') + sectionTable(orderInfoRows.map(([label, value]) => ({ kind: 'field' as const, label, value }))) : ''}
    ${contactRows.length ? sectionHeading('Customer Contact') + sectionTable(contactRows.map(([label, value]) => ({ kind: 'field' as const, label, value }))) : ''}
    ${formRows.length ? sectionHeading('Order Details (Form Filled)') + sectionTable(formRows) : ''}
  `;
}
