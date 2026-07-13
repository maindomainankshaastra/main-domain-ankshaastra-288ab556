import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url) {
    throw new Error("SUPABASE_URL or VITE_SUPABASE_URL is required.");
  }

  if (!key) {
    const publishableHint = publishableKey
      ? "A VITE_SUPABASE_PUBLISHABLE_KEY was found, but server-side routes require SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_SERVICE_ROLE_KEY."
      : "Set SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_SERVICE_ROLE_KEY in your environment.";
    throw new Error(publishableHint);
  }

  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}
