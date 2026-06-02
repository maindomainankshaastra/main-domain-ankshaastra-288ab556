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

/** Download all invoice PDFs for a month as a ZIP bundle (admin only). */
export async function downloadMonthlyInvoiceZip(year: number, month: number): Promise<{ included: number; skipped: number }> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error("Please sign in again");

  const res = await fetch(
    `/api/invoices/bulk-download?year=${year}&month=${month}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || "Bulk download failed");
  }

  const included = Number(res.headers.get("X-Invoices-Included") || 0);
  const skipped = Number(res.headers.get("X-Invoices-Skipped") || 0);
  const blob = await res.blob();
  const label = `${year}-${String(month).padStart(2, "0")}`;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `invoices-${label}.zip`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);

  return { included, skipped };
}
