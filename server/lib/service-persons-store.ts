import { getSupabaseAdmin } from './supabase-admin.js';
import {
  extractServicePersonsFromSnapshot,
  type ServicePersonRecord,
} from './service-persons.js';

export type { ServicePersonRecord };
export {
  extractServicePersonsFromSnapshot,
  resolvePurchaserName,
  inferPersonCountFromServiceTitle,
} from './service-persons.js';

/** Replace service_persons rows for an order from form snapshot. */
export async function syncServicePersonsForOrder(
  orderId: string,
  snapshot: Record<string, unknown> | null | undefined,
): Promise<ServicePersonRecord[]> {
  const persons = extractServicePersonsFromSnapshot(snapshot);
  if (!persons.length) return [];

  const supabase = getSupabaseAdmin();
  const { data: order } = await supabase
    .from('orders')
    .select('service_id')
    .eq('id', orderId)
    .maybeSingle();

  await supabase.from('service_persons').delete().eq('order_id', orderId);

  const rows = persons.map((person) => ({
    order_id: orderId,
    service_id: order?.service_id ?? null,
    person_index: person.person_index,
    first_name: person.first_name,
    middle_name: person.middle_name,
    last_name: person.last_name,
    full_name: person.full_name,
    gender: person.gender,
    dob: person.dob ?? null,
    birth_time: person.birth_time ?? null,
    birth_place: person.birth_place,
    birth_pincode: person.birth_pincode,
    additional_data: person.additional_data ?? {},
  }));

  const { error } = await supabase.from('service_persons').insert(rows);
  if (error) {
    console.warn('[service-persons] sync failed:', error.message);
    throw error;
  }

  return persons;
}

export async function getServicePersonsForOrder(orderId: string): Promise<ServicePersonRecord[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('service_persons')
    .select(
      'person_index, first_name, middle_name, last_name, full_name, gender, dob, birth_time, birth_place, birth_pincode, additional_data',
    )
    .eq('order_id', orderId)
    .order('person_index', { ascending: true });

  if (error || !data?.length) return [];

  return data.map((row) => ({
    person_index: row.person_index,
    first_name: row.first_name,
    middle_name: row.middle_name,
    last_name: row.last_name,
    full_name: row.full_name,
    gender: row.gender,
    dob: row.dob,
    birth_time: row.birth_time,
    birth_place: row.birth_place,
    birth_pincode: row.birth_pincode,
    additional_data: (row.additional_data as Record<string, unknown>) ?? {},
  }));
}

export async function resolveOrderServiceSubjects(
  order: Record<string, unknown>,
): Promise<ServicePersonRecord[]> {
  const orderId = String(order.id || '');
  if (orderId) {
    const persisted = await getServicePersonsForOrder(orderId);
    if (persisted.length) return persisted;
  }

  const metadata = (order.metadata as Record<string, unknown> | undefined) || {};
  const snapshot = (metadata.formSnapshot as Record<string, unknown> | undefined) || metadata;
  return extractServicePersonsFromSnapshot(snapshot);
}
