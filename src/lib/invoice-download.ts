import { supabase } from "@/integrations/supabase/client";

/** Returns a fresh signed URL for an invoice PDF (private Supabase storage). */
export async function fetchInvoiceDownloadUrl(invoiceId: string): Promise<string | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) return null;

  const res = await fetch(`/api/invoices/download?invoiceId=${encodeURIComponent(invoiceId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;
  const body = (await res.json()) as { url?: string };
  return body.url || null;
}
