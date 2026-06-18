/**
 * Client-side helpers for service subject extraction (mirrors server/lib/service-persons.ts).
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

function trim(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function buildFullName(data: Record<string, unknown>): string {
  const full = trim(data.fullName);
  if (full) return full;
  return [data.firstName, data.middleName, data.lastName].map(trim).filter(Boolean).join(' ');
}

function personFromObject(data: Record<string, unknown>, index: number): ServicePersonRecord | null {
  const full_name = buildFullName(data);
  if (!full_name) return null;
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
  };
}

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

export function resolvePurchaserName(
  formData: Record<string, unknown>,
  options?: { fallback?: string },
): string {
  const explicit =
    trim(formData.purchaserName) || trim(formData.billingName) || trim(formData.contactName);
  if (explicit) return explicit;

  const subjects = extractServicePersonsFromSnapshot(formData);
  if (subjects.length <= 1) {
    const flat = buildFullName(formData);
    if (flat) return flat;
    if (subjects[0]?.full_name) return subjects[0].full_name;
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
