import { supabase } from "@/integrations/supabase/client";

export async function generateInvoiceForOrder(orderId: string) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error("Not signed in");

  const res = await fetch("/api/invoices/generate", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderId }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((body as { error?: string }).error || "Invoice generation failed");
  }
  return body as { ok: boolean; invoice_number?: string };
}
