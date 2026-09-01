

// // import { supabase } from "@/integrations/supabase/client";

// // async function getAuthToken(): Promise<string> {
// //   const { data } = await supabase.auth.getSession();
// //   const token = data.session?.access_token;
// //   if (!token) throw new Error("Please sign in again");
// //   return token;
// // }

// // export type CreateManualInvoiceInput = {
// //   customerName: string;
// //   customerEmail: string;
// //   customerPhone?: string;
// //   sourceWebsite: string;
// //   serviceTitle: string;
// //   packageName?: string;
// //   price: number;
// //   gstRate: number;
// //   paymentStatus: string;
// //   invoiceDate: string;
// //   notes?: string;
// //   // Billing details — required so resolveCustomerBilling() can correctly
// //   // determine place of supply (CGST/SGST vs IGST) and populate the
// //   // customer's address/GSTIN on the invoice. Without these, the backend
// //   // silently falls back to treating the customer as being in the
// //   // business's own state, generating incorrect GST.
// //   customerCity?: string;
// //   customerState?: string;
// //   customerPincode?: string;
// //   customerGstin?: string;
// // };

// // export type CreateManualInvoiceResult = {
// //   ok: boolean;
// //   order_id: string;
// //   invoice_id?: string;
// //   invoice_number?: string;
// //   error?: string;
// // };

// // export async function createManualInvoice(
// //   input: CreateManualInvoiceInput,
// // ): Promise<CreateManualInvoiceResult> {
// //   const token = await getAuthToken();
// //   const res = await fetch("/api/invoices/create-manual", {
// //     method: "POST",
// //     headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
// //     body: JSON.stringify(input),
// //   });
// //   const data = (await res.json().catch(() => ({}))) as CreateManualInvoiceResult;
// //   if (!res.ok) throw new Error(data.error || "Could not create invoice");
// //   return data;
// // }

// // export type SendInvoiceEmailInput = {
// //   invoiceId: string;
// //   to: string;
// //   subject: string;
// //   message: string;
// //   attachPdf: boolean;
// // };

// // export async function sendInvoiceEmail(input: SendInvoiceEmailInput): Promise<{ ok: boolean }> {
// //   const token = await getAuthToken();
// //   const res = await fetch("/api/invoices/send-email", {
// //     method: "POST",
// //     headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
// //     body: JSON.stringify(input),
// //   });
// //   const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
// //   if (!res.ok) throw new Error(data.error || "Could not send email");
// //   return { ok: true };
// // }



// import { supabase } from "@/integrations/supabase/client";

// async function getAuthToken(): Promise<string> {
//   const { data } = await supabase.auth.getSession();
//   const token = data.session?.access_token;
//   if (!token) throw new Error("Please sign in again");
//   return token;
// }

// export type CreateManualInvoiceInput = {
//   customerName: string;
//   customerEmail: string;
//   customerPhone?: string;
//   sourceWebsite: string;
//   serviceTitle: string;
//   packageName?: string;
//   price: number;
//   gstRate: number;
//   paymentStatus: string;
//   invoiceDate: string;
//   notes?: string;
//   // Billing details — required so resolveCustomerBilling() can correctly
//   // determine place of supply (CGST/SGST vs IGST) and populate the
//   // customer's address/GSTIN on the invoice. Without these, the backend
//   // silently falls back to treating the customer as being in the
//   // business's own state, generating incorrect GST.
//   customerCity?: string;
//   customerState?: string;
//   customerPincode?: string;
//   customerGstin?: string;
// };

// export type CreateManualInvoiceResult = {
//   ok: boolean;
//   order_id: string;
//   invoice_id?: string;
//   invoice_number?: string;
//   // Backend now responds as soon as the order is created and hands PDF
//   // generation + email off to the background — "generating" means the
//   // invoice isn't ready yet, it'll show up in the list once done.
//   status?: "generating" | "ready";
//   message?: string;
//   error?: string;
// };

// export async function createManualInvoice(
//   input: CreateManualInvoiceInput,
// ): Promise<CreateManualInvoiceResult> {
//   const token = await getAuthToken();
//   const res = await fetch("/api/invoices/create-manual", {
//     method: "POST",
//     headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//     body: JSON.stringify(input),
//   });
//   const data = (await res.json().catch(() => ({}))) as CreateManualInvoiceResult;
//   if (!res.ok) throw new Error(data.error || "Could not create invoice");
//   return data;
// }

// export type SendInvoiceEmailInput = {
//   invoiceId: string;
//   to: string;
//   subject: string;
//   message: string;
//   attachPdf: boolean;
// };

// export async function sendInvoiceEmail(input: SendInvoiceEmailInput): Promise<{ ok: boolean }> {
//   const token = await getAuthToken();
//   const res = await fetch("/api/invoices/send-email", {
//     method: "POST",
//     headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//     body: JSON.stringify(input),
//   });
//   const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
//   if (!res.ok) throw new Error(data.error || "Could not send email");
//   return { ok: true };
// }

// /**
//  * Fetches the business's home GST state code (e.g. "09" for Uttar Pradesh)
//  * from gst_config — used to preview whether an invoice will be IGST
//  * (different state) or CGST+SGST (same state) before it's generated.
//  * Mirrors the server-side comparison in server/lib/gst.ts (calculateGst).
//  * Returns undefined if unavailable (e.g. the signed-in admin doesn't have
//  * "settings" module access) — callers should fall back to a generic label.
//  */
// export async function getBusinessGstStateCode(): Promise<string | undefined> {
//   try {
//     const token = await getAuthToken();
//     const res = await fetch("/api/admin/gst-config", {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     if (!res.ok) return undefined;
//     const body = await res.json().catch(() => null);
//     const stateCode = (body as { config?: { state_code?: string } } | null)?.config?.state_code;
//     return stateCode ? String(stateCode).padStart(2, "0").slice(-2) : undefined;
//   } catch {
//     return undefined;
//   }
// }


import { supabase } from "@/integrations/supabase/client";
 
async function getAuthToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Please sign in again");
  return token;
}
 
export type CreateManualInvoiceInput = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  sourceWebsite: string;
  serviceTitle: string;
  packageName?: string;
  price: number;
  gstRate: number;
  paymentStatus: string;
  invoiceDate: string;
  notes?: string;
  // Billing details — required so resolveCustomerBilling() can correctly
  // determine place of supply (CGST/SGST vs IGST) and populate the
  // customer's address/GSTIN on the invoice. Without these, the backend
  // silently falls back to treating the customer as being in the
  // business's own state, generating incorrect GST.
  customerCity?: string;
  customerState?: string;
  customerPincode?: string;
  customerGstin?: string;
};
 
export type CreateManualInvoiceResult = {
  ok: boolean;
  order_id: string;
  invoice_id?: string;
  invoice_number?: string;
  error?: string;
  // TEMPORARY: step-by-step timing breakdown (ms) for debugging the slow
  // invoice-creation issue — remove once resolved.
  timings?: Record<string, number>;
};
 
export async function createManualInvoice(
  input: CreateManualInvoiceInput,
): Promise<CreateManualInvoiceResult> {
  const token = await getAuthToken();
  const res = await fetch("/api/invoices/create-manual", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  const data = (await res.json().catch(() => ({}))) as CreateManualInvoiceResult;
  if (!res.ok) throw new Error(data.error || "Could not create invoice");
  return data;
}
 
export type SendInvoiceEmailInput = {
  invoiceId: string;
  to: string;
  subject: string;
  message: string;
  attachPdf: boolean;
};
 
export async function sendInvoiceEmail(input: SendInvoiceEmailInput): Promise<{ ok: boolean }> {
  const token = await getAuthToken();
  const res = await fetch("/api/invoices/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!res.ok) throw new Error(data.error || "Could not send email");
  return { ok: true };
}
 
/**
 * Fetches the business's home GST state code (e.g. "09" for Uttar Pradesh)
 * from gst_config — used to preview whether an invoice will be IGST
 * (different state) or CGST+SGST (same state) before it's generated.
 * Mirrors the server-side comparison in server/lib/gst.ts (calculateGst).
 * Returns undefined if unavailable (e.g. the signed-in admin doesn't have
 * "settings" module access) — callers should fall back to a generic label.
 */
export async function getBusinessGstStateCode(): Promise<string | undefined> {
  try {
    const token = await getAuthToken();
    const res = await fetch("/api/admin/gst-config", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return undefined;
    const body = await res.json().catch(() => null);
    const stateCode = (body as { config?: { state_code?: string } } | null)?.config?.state_code;
    return stateCode ? String(stateCode).padStart(2, "0").slice(-2) : undefined;
  } catch {
    return undefined;
  }
}
