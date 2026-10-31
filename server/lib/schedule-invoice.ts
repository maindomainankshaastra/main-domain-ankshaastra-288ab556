



// import { enqueueJob } from "./workflow-engine.js";
// import { processInvoiceJob, orderHasDeliverableInvoice } from "./invoice-engine.js";
// import { invoiceJobKey } from "./payment-order-map.js";

// function getPublicApiHost(): string | null {
//   const site = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
//   if (site) return site.replace(/\/$/, "");
//   if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
//   return null;
// }

// function getInternalSecret(): string | null {
//   return process.env.CRON_SECRET || process.env.INTERNAL_API_SECRET || null;
// }

// /**
//  * Generate invoice PDF + email after payment.
//  * Runs inline first (works on Vercel Hobby without frequent cron).
//  * Falls back to async route + daily job queue only if inline fails.
//  *
//  * FIX (duplicate invoice emails): each fallback used to fire unconditionally
//  * on ANY error from the previous step — even an error thrown by a later,
//  * unrelated part of processInvoiceJob (Google Sheet sync, admin-copy email,
//  * workflow update) AFTER the customer invoice email had already been sent
//  * successfully. That let a single order run the full generate+deliver flow
//  * up to 3 times (inline → async route → job queue), sending the same
//  * invoice email 2-3 times. Each fallback now re-checks
//  * orderHasDeliverableInvoice() first — if the PDF+email already went out,
//  * it stops here instead of repeating the whole flow.
//  */
// export async function scheduleInvoiceGeneration(orderId: string, paymentId?: string | null): Promise<void> {
//   try {
//     await processInvoiceJob(orderId, { paymentId: paymentId || undefined });
//     return;
//   } catch (err) {
//     console.error("[schedule-invoice] Inline generation failed:", err);
//   }

//   if (await orderHasDeliverableInvoice(orderId)) {
//     console.warn("[schedule-invoice] Inline generation actually succeeded before failing later — skipping fallback to avoid a duplicate email.");
//     return;
//   }

//   const secret = getInternalSecret();
//   const host = getPublicApiHost();

//   if (host && secret) {
//     try {
//       const controller = new AbortController();
//       const timeout = setTimeout(() => controller.abort(), 15000);
//       await fetch(`${host}/api/invoices/generate-async`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${secret}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ orderId, paymentId: paymentId || undefined }),
//         signal: controller.signal,
//       }).finally(() => clearTimeout(timeout));
//       return;
//     } catch (err) {
//       console.warn("[schedule-invoice] Async route fallback failed:", err);
//     }
//   }

//   if (await orderHasDeliverableInvoice(orderId)) {
//     console.warn("[schedule-invoice] Async route actually succeeded before failing later — skipping job-queue fallback to avoid a duplicate email.");
//     return;
//   }

//   try {
//     await enqueueJob(
//       "generate_and_deliver_invoice",
//       { orderId, ...(paymentId ? { paymentId } : {}) },
//       { idempotencyKey: invoiceJobKey(orderId, paymentId), priority: 1 },
//     );
//   } catch (err) {
//     console.error("[schedule-invoice] Could not enqueue daily retry job:", err);
//   }
// }

// // REMOVED (2026-08-31): triggerInvoiceGenerationInBackground() used to live
// // here — a fire-and-forget trigger meant to let the "Confirm & Create"
// // request return immediately. Removed because this hosting plan's daily-only
// // cron + lack of a waitUntil-style primitive means fire-and-forget work
// // reliably gets cut off before it completes, silently dropping invoice
// // generation and email delivery. Do not reintroduce this pattern without a
// // hosting change that actually supports background execution (e.g.
// // @vercel/functions waitUntil on a plan that supports it, or a real job
// // worker) — until then, invoice generation must stay inline/awaited, same as
// // scheduleInvoiceGeneration() above.

// // Sirf wo naam jo apne aap saaf nahi ban sakte (short codes) — baaki sab auto-saaf hote hain.
// const INVOICE_SUBJECT_OVERRIDES: Record<string, string> = {
//   "single": "Perfect Baby Name",
//   "premium": "Complete Baby Blueprint",
//   "perfect-baby-name-report": "Perfect Baby Name",
//   "perfect baby name report": "Perfect Baby Name",
//   "complete-baby-name-blueprint": "Complete Baby Blueprint",
//   "complete baby name blueprint": "Complete Baby Blueprint",
//   "namecheck": "Name Check",
//   "namecheck-1": "Name Check",
// };

// // Kisi bhi service ka naam saaf karo:
// //  - "name-check" / "lucky_mobile_number" -> "Name Check" / "Lucky Mobile Number"
// //  - "Business Name Correction | Ankshaastra" -> "Business Name Correction"
// //  - pehle se saaf naam ("Lucky Mobile Number") jaise ke taise rehte hain
// function prettifyServiceTitle(raw: string): string {
//   let t = String(raw || "").trim();
//   t = t.replace(/\s*[|—–-]\s*Ankshaastra.*$/i, "").trim();
//   if (!t) return "Service";

//   const override = INVOICE_SUBJECT_OVERRIDES[t.toLowerCase()];
//   if (override) return override;

//   // raw code jaisa dikhe (poora lowercase, space nahi, - ya _ ke saath) to Title Case banao
//   if (/^[a-z0-9]+([-_][a-z0-9]+)*$/.test(t)) {
//     return t
//       .split(/[-_]/)
//       .filter(Boolean)
//       .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
//       .join(" ");
//   }
//   return t;
// }

// export function buildInvoiceEmailSubject(serviceTitle: string, invoiceNumber: string): string {
//   return `${prettifyServiceTitle(serviceTitle)} ${invoiceNumber}`;
// }




import { enqueueJob } from "./workflow-engine.js";
import { runNameCheckAutomation } from "./name-check-report-service.js";
import { processInvoiceJob, orderHasDeliverableInvoice } from "./invoice-engine.js";
import { invoiceJobKey } from "./payment-order-map.js";
 
function getPublicApiHost(): string | null {
  const site = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (site) return site.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return null;
}
 
function getInternalSecret(): string | null {
  return process.env.CRON_SECRET || process.env.INTERNAL_API_SECRET || null;
}
 
/**
 * Generate invoice PDF + email after payment.
 * Runs inline first (works on Vercel Hobby without frequent cron).
 * Falls back to async route + daily job queue only if inline fails.
 *
 * FIX (duplicate invoice emails): each fallback used to fire unconditionally
 * on ANY error from the previous step — even an error thrown by a later,
 * unrelated part of processInvoiceJob (Google Sheet sync, admin-copy email,
 * workflow update) AFTER the customer invoice email had already been sent
 * successfully. That let a single order run the full generate+deliver flow
 * up to 3 times (inline → async route → job queue), sending the same
 * invoice email 2-3 times. Each fallback now re-checks
 * orderHasDeliverableInvoice() first — if the PDF+email already went out,
 * it stops here instead of repeating the whole flow.
 */
export async function scheduleInvoiceGeneration(orderId: string, paymentId?: string | null): Promise<void> {
  // Name Check orders also get their report generated + emailed automatically.
  // Runs in parallel with the invoice so the customer gets the report as fast
  // as possible; it never throws, and non-Name-Check orders return immediately.
  await Promise.allSettled([
    scheduleInvoiceGenerationInner(orderId, paymentId),
    runNameCheckAutomation(orderId),
  ]);
}
 
async function scheduleInvoiceGenerationInner(orderId: string, paymentId?: string | null): Promise<void> {
  try {
    await processInvoiceJob(orderId, { paymentId: paymentId || undefined });
    return;
  } catch (err) {
    console.error("[schedule-invoice] Inline generation failed:", err);
  }
 
  if (await orderHasDeliverableInvoice(orderId)) {
    console.warn("[schedule-invoice] Inline generation actually succeeded before failing later — skipping fallback to avoid a duplicate email.");
    return;
  }
 
  const secret = getInternalSecret();
  const host = getPublicApiHost();
 
  if (host && secret) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      await fetch(`${host}/api/invoices/generate-async`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, paymentId: paymentId || undefined }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));
      return;
    } catch (err) {
      console.warn("[schedule-invoice] Async route fallback failed:", err);
    }
  }
 
  if (await orderHasDeliverableInvoice(orderId)) {
    console.warn("[schedule-invoice] Async route actually succeeded before failing later — skipping job-queue fallback to avoid a duplicate email.");
    return;
  }
 
  try {
    await enqueueJob(
      "generate_and_deliver_invoice",
      { orderId, ...(paymentId ? { paymentId } : {}) },
      { idempotencyKey: invoiceJobKey(orderId, paymentId), priority: 1 },
    );
  } catch (err) {
    console.error("[schedule-invoice] Could not enqueue daily retry job:", err);
  }
}
 
// REMOVED (2026-08-31): triggerInvoiceGenerationInBackground() used to live
// here — a fire-and-forget trigger meant to let the "Confirm & Create"
// request return immediately. Removed because this hosting plan's daily-only
// cron + lack of a waitUntil-style primitive means fire-and-forget work
// reliably gets cut off before it completes, silently dropping invoice
// generation and email delivery. Do not reintroduce this pattern without a
// hosting change that actually supports background execution (e.g.
// @vercel/functions waitUntil on a plan that supports it, or a real job
// worker) — until then, invoice generation must stay inline/awaited, same as
// scheduleInvoiceGeneration() above.
 
// Sirf wo naam jo apne aap saaf nahi ban sakte (short codes) — baaki sab auto-saaf hote hain.
const INVOICE_SUBJECT_OVERRIDES: Record<string, string> = {
  "single": "Perfect Baby Name",
  "premium": "Complete Baby Blueprint",
  "perfect-baby-name-report": "Perfect Baby Name",
  "perfect baby name report": "Perfect Baby Name",
  "complete-baby-name-blueprint": "Complete Baby Blueprint",
  "complete baby name blueprint": "Complete Baby Blueprint",
  "namecheck": "Name Check",
  "namecheck-1": "Name Check",
};
 
// Kisi bhi service ka naam saaf karo:
//  - "name-check" / "lucky_mobile_number" -> "Name Check" / "Lucky Mobile Number"
//  - "Business Name Correction | Ankshaastra" -> "Business Name Correction"
//  - pehle se saaf naam ("Lucky Mobile Number") jaise ke taise rehte hain
function prettifyServiceTitle(raw: string): string {
  let t = String(raw || "").trim();
  t = t.replace(/\s*[|—–-]\s*Ankshaastra.*$/i, "").trim();
  if (!t) return "Service";
 
  const override = INVOICE_SUBJECT_OVERRIDES[t.toLowerCase()];
  if (override) return override;
 
  // raw code jaisa dikhe (poora lowercase, space nahi, - ya _ ke saath) to Title Case banao
  if (/^[a-z0-9]+([-_][a-z0-9]+)*$/.test(t)) {
    return t
      .split(/[-_]/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  return t;
}
 
export function buildInvoiceEmailSubject(serviceTitle: string, invoiceNumber: string): string {
  return `${prettifyServiceTitle(serviceTitle)} ${invoiceNumber}`;
}
 
