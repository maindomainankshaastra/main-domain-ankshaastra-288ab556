// // import { createClient, type User } from '@supabase/supabase-js';
// // import { getSupabaseAdmin } from './supabase-admin.js';

// // function getSupabaseUrl() {
// //   return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
// // }

// // function getAnonKey() {
// //   return process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';
// // }

// // export async function getUserFromAuthHeader(
// //   authHeader: string | undefined,
// // ): Promise<User | null> {
// //   if (!authHeader?.startsWith('Bearer ')) return null;

// //   const token = authHeader.slice(7).trim();
// //   if (!token) return null;

// //   const url = getSupabaseUrl();
// //   const anonKey = getAnonKey();
// //   if (!url || !anonKey) return null;

// //   const client = createClient(url, anonKey);
// //   const { data, error } = await client.auth.getUser(token);
// //   if (error || !data.user) return null;
// //   return data.user;
// // }

// // export async function isAdminUser(userId: string) {
// //   const supabase = getSupabaseAdmin();
// //   const { data } = await supabase
// //     .from('user_roles')
// //     .select('role')
// //     .eq('user_id', userId)
// //     .eq('role', 'admin')
// //     .maybeSingle();
// //   return Boolean(data?.role);
// // }

// // export async function userCanAccessInvoice(user: User, invoice: Record<string, unknown>) {
// //   if (await isAdminUser(user.id)) return true;
// //   if (invoice.user_id === user.id) return true;

// //   const invoiceEmail = String(invoice.customer_email || '').toLowerCase();
// //   const userEmail = String(user.email || '').toLowerCase();
// //   if (invoiceEmail && userEmail && invoiceEmail === userEmail) return true;

// //   const supabase = getSupabaseAdmin();
// //   const { data: profile } = await supabase
// //     .from('profiles')
// //     .select('email')
// //     .eq('user_id', user.id)
// //     .maybeSingle();

// //   const profileEmail = String(profile?.email || '').toLowerCase();
// //   return Boolean(invoiceEmail && profileEmail && invoiceEmail === profileEmail);
// // }


// import { createClient, type User } from '@supabase/supabase-js';
// import { getSupabaseAdmin } from './supabase-admin.js';

// function getSupabaseUrl() {
//   return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
// }

// function getAnonKey() {
//   return process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';
// }

// export async function getUserFromAuthHeader(
//   authHeader: string | undefined,
// ): Promise<User | null> {
//   if (!authHeader?.startsWith('Bearer ')) return null;

//   const token = authHeader.slice(7).trim();
//   if (!token) return null;

//   const url = getSupabaseUrl();
//   const anonKey = getAnonKey();

//   // ---- DEBUG START (remove after fixing) ----
//   console.log('[auth-api] getSupabaseUrl():', url || '(EMPTY)');
//   console.log('[auth-api] getAnonKey() present:', !!anonKey, 'length:', anonKey.length);
//   // ---- DEBUG END ----

//   if (!url || !anonKey) {
//     console.log('[auth-api] FAILED: url or anonKey missing');
//     return null;
//   }

//   const client = createClient(url, anonKey);
//   const { data, error } = await client.auth.getUser(token);

//   // ---- DEBUG START ----
//   if (error) {
//     console.log('[auth-api] supabase getUser() error:', error.message);
//   } else {
//     console.log('[auth-api] supabase getUser() success, user id:', data.user?.id);
//   }
//   // ---- DEBUG END ----

//   if (error || !data.user) return null;
//   return data.user;
// }

// export async function isAdminUser(userId: string) {
//   const supabase = getSupabaseAdmin();
//   const { data } = await supabase
//     .from('user_roles')
//     .select('role')
//     .eq('user_id', userId)
//     .eq('role', 'admin')
//     .maybeSingle();
//   return Boolean(data?.role);
// }

// export async function userCanAccessInvoice(user: User, invoice: Record<string, unknown>) {
//   if (await isAdminUser(user.id)) return true;
//   if (invoice.user_id === user.id) return true;

//   const invoiceEmail = String(invoice.customer_email || '').toLowerCase();
//   const userEmail = String(user.email || '').toLowerCase();
//   if (invoiceEmail && userEmail && invoiceEmail === userEmail) return true;

//   const supabase = getSupabaseAdmin();
//   const { data: profile } = await supabase
//     .from('profiles')
//     .select('email')
//     .eq('user_id', user.id)
//     .maybeSingle();

//   const profileEmail = String(profile?.email || '').toLowerCase();
//   return Boolean(invoiceEmail && profileEmail && invoiceEmail === profileEmail);
// }

// import { createClient, type User } from '@supabase/supabase-js';
// import { getSupabaseAdmin } from './supabase-admin.js';

// function getSupabaseUrl() {
//   return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
// }

// function getAnonKey() {
//   return process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';
// }

// export async function getUserFromAuthHeader(
//   authHeader: string | undefined,
// ): Promise<User | null> {
//   if (!authHeader?.startsWith('Bearer ')) return null;

//   const token = authHeader.slice(7).trim();
//   if (!token) return null;

//   const url = getSupabaseUrl();
//   const anonKey = getAnonKey();
//   if (!url || !anonKey) return null;

//   const client = createClient(url, anonKey);
//   const { data, error } = await client.auth.getUser(token);
//   if (error || !data.user) return null;
//   return data.user;
// }

// export async function isAdminUser(userId: string) {
//   const supabase = getSupabaseAdmin();
//   const { data } = await supabase
//     .from('user_roles')
//     .select('role')
//     .eq('user_id', userId)
//     .eq('role', 'admin')
//     .maybeSingle();
//   return Boolean(data?.role);
// }

// export async function userCanAccessInvoice(user: User, invoice: Record<string, unknown>) {
//   if (await isAdminUser(user.id)) return true;
//   if (invoice.user_id === user.id) return true;

//   const invoiceEmail = String(invoice.customer_email || '').toLowerCase();
//   const userEmail = String(user.email || '').toLowerCase();
//   if (invoiceEmail && userEmail && invoiceEmail === userEmail) return true;

//   const supabase = getSupabaseAdmin();
//   const { data: profile } = await supabase
//     .from('profiles')
//     .select('email')
//     .eq('user_id', user.id)
//     .maybeSingle();

//   const profileEmail = String(profile?.email || '').toLowerCase();
//   return Boolean(invoiceEmail && profileEmail && invoiceEmail === profileEmail);
// }


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

  // ---- DEBUG START (remove after fixing) ----
  console.log('[auth-api] getSupabaseUrl():', url || '(EMPTY)');
  console.log('[auth-api] getAnonKey() present:', !!anonKey, 'length:', anonKey.length);
  // ---- DEBUG END ----

  if (!url || !anonKey) {
    console.log('[auth-api] FAILED: url or anonKey missing');
    return null;
  }

  const client = createClient(url, anonKey);
  const { data, error } = await client.auth.getUser(token);

  // ---- DEBUG START ----
  if (error) {
    console.log('[auth-api] supabase getUser() error:', error.message);
  } else {
    console.log('[auth-api] supabase getUser() success, user id:', data.user?.id);
  }
  // ---- DEBUG END ----

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

// Audit Logs access control — mirrors isAdminUser() exactly, but checks for
// the 'super_admin' role value instead of 'admin'. ASSUMPTION: your
// user_roles.role column actually stores the string 'super_admin' for
// Super Admins. If your team-management UI uses a different literal value
// (e.g. 'owner', 'superadmin'), change the .eq('role', 'super_admin') line
// below to match — nothing else needs to change.
export async function isSuperAdminUser(userId: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'super_admin')
    .maybeSingle();
  return Boolean(data?.role);
}

// Returns every role assigned to this user (a user can have more than one
// row in user_roles), so audit log entries can record an accurate role
// label instead of just a true/false admin flag.
export async function getUserRoles(userId: string): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId);
  return (data || []).map((r: { role: string }) => r.role).filter(Boolean);
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