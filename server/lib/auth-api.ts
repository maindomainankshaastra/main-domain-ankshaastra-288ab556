import { createClient, type User } from '@supabase/supabase-js';
import { getSupabaseAdmin } from './supabase-admin.js';

function getSupabaseUrl() {
  return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
}

function getAnonKey() {
  return process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';
}

export async function getUserFromAuthHeader(
  authHeader: string | undefined,
): Promise<User | null> {
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7).trim();
  if (!token) return null;

  const url = getSupabaseUrl();
  const anonKey = getAnonKey();
  if (!url || !anonKey) return null;

  const client = createClient(url, anonKey);
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

export async function isAdminUser(userId: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();
  return Boolean(data?.role);
}

export async function userCanAccessInvoice(user: User, invoice: Record<string, unknown>) {
  if (await isAdminUser(user.id)) return true;
  if (invoice.user_id === user.id) return true;

  const invoiceEmail = String(invoice.customer_email || '').toLowerCase();
  const userEmail = String(user.email || '').toLowerCase();
  if (invoiceEmail && userEmail && invoiceEmail === userEmail) return true;

  const supabase = getSupabaseAdmin();
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('user_id', user.id)
    .maybeSingle();

  const profileEmail = String(profile?.email || '').toLowerCase();
  return Boolean(invoiceEmail && profileEmail && invoiceEmail === profileEmail);
}
