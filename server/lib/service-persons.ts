/**
 * Service person extraction + persistence.
 * Separates purchaser (orders.customer_*) from analyzed subjects (service_persons).
 */

export type ServicePersonRecord = {
  person_index: number;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  full_name: string;
  gender?: string | null;
  dob?: unknown;
  birth_time?: unknown;
  birth_place?: string | null;
  birth_pincode?: string | null;
  additional_data?: Record<string, unknown>;
};

const NAME_RX = /^[a-zA-Z\s.'-]+$/;

function trim(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function buildFullName(data: Record<string, unknown>): string {
  const full = trim(data.fullName);
  if (full) return full;
  const parts = [data.firstName, data.middleName, data.lastName].map(trim).filter(Boolean);
  return parts.join(' ');
}

function personFromObject(data: Record<string, unknown>, index: number): ServicePersonRecord | null {
  const full_name = buildFullName(data);
  if (!full_name) return null;

  const knownKeys = new Set([
    'firstName',
    'middleName',
    'lastName',
    'fullName',
    'gender',
    'dob',
    'tob',
    'birth_time',
    'pob',
    'placeOfBirth',
    'pincode',
  ]);

  const additional_data: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (!knownKeys.has(key) && value !== null && value !== undefined && value !== '') {
      additional_data[key] = value;
    }
  }

  return {
    person_index: index,
    first_name: trim(data.firstName) || null,
    middle_name: trim(data.middleName) || null,
    last_name: trim(data.lastName) || null,
    full_name,
    gender: trim(data.gender) || null,
    dob: data.dob ?? null,
    birth_time: data.tob ?? data.birth_time ?? null,
    birth_place: trim(data.pob) || trim(data.placeOfBirth) || null,
    birth_pincode: trim(data.pincode) || null,
    additional_data,
  };
}

/** Extract service subjects from a checkout form snapshot (no purchaser/contact fields). */
export function extractServicePersonsFromSnapshot(
  snapshot: Record<string, unknown> | null | undefined,
): ServicePersonRecord[] {
  if (!snapshot || typeof snapshot !== 'object') return [];

  const persons: ServicePersonRecord[] = [];
  const personKeys = Object.keys(snapshot)
    .filter((key) => /^person\d+$/.test(key))
    .sort((a, b) => Number(a.replace(/\D/g, '')) - Number(b.replace(/\D/g, '')));

  for (const key of personKeys) {
    const raw = snapshot[key];
    if (!raw || typeof raw !== 'object') continue;
    const person = personFromObject(raw as Record<string, unknown>, Number(key.replace(/\D/g, '')));
    if (person) persons.push(person);
  }

  if (persons.length === 0) {
    const single = personFromObject(snapshot, 1);
    if (single) persons.push(single);
  }

  return persons;
}

/** Resolve purchaser display name — never use multi-person subject as purchaser by default. */
export function resolvePurchaserName(
  formData: Record<string, unknown>,
  options?: { fallback?: string; subjectCount?: number },
): string {
  const explicit =
    trim(formData.purchaserName) ||
    trim(formData.billingName) ||
    trim(formData.contactName);

  if (explicit) return explicit;

  const subjectCount = options?.subjectCount ?? extractServicePersonsFromSnapshot(formData).length;
  const isMultiSubject = subjectCount > 1;

  if (!isMultiSubject) {
    const subjectName = buildFullName(formData);
    if (subjectName) return subjectName;
    const p1 = formData.person1;
    if (p1 && typeof p1 === 'object') {
      const name = buildFullName(p1 as Record<string, unknown>);
      if (name) return name;
    }
  }

  return trim(options?.fallback) || 'Customer';
}

export function inferPersonCountFromServiceTitle(serviceTitle: string | null | undefined): {
  min: number;
  max: number;
} {
  const s = (serviceTitle || '').toLowerCase();
  if (s.includes('name check 3')) return { min: 3, max: 3 };
  if (s.includes('name check 2')) return { min: 2, max: 2 };
  if (s.includes('complete blueprint') || s.includes('for 2 people')) return { min: 2, max: 2 };
  if (s.includes('triple') || s.includes('family') || s.includes('for 3') || s.includes('3 kundli')) {
    return { min: 3, max: 3 };
  }
  if (s.includes('double') || s.includes('for 2') || s.includes('2 kundli')) return { min: 2, max: 2 };
  return { min: 1, max: 1 };
}

export { NAME_RX };
