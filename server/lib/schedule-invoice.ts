

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

// export function buildInvoiceEmailSubject(serviceTitle: string, invoiceNumber: string): string {
//   const service = serviceTitle.trim() || "Service";
//   return `${service} ${invoiceNumber}`;
// }




import { enqueueJob } from "./workflow-engine.js";
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

/**
 * True fire-and-forget trigger for invoice generation — used by request
 * paths where the CALLER must respond immediately instead of waiting for
 * PDF render + email send to finish (e.g. the admin "Confirm & Create"
 * button in InvoicesModule.tsx, which used to block on the full
 * scheduleInvoiceGeneration() chain and felt very slow).
 *
 * Unlike scheduleInvoiceGeneration() (which awaits the whole pipeline
 * inline), this function only awaits the cheap part — enqueuing a durable
 * job row — then kicks off the async route WITHOUT awaiting it. The
 * enqueued job is the safety net: if the fire-and-forget call gets cut off
 * when the caller's response is sent, the daily
 * /api/operations/process-jobs cron (and manual retry via
 * operations-retry-job.ts) will still pick it up.
 */
export async function triggerInvoiceGenerationInBackground(
  orderId: string,
  opts?: { paymentId?: string | null; forceDeliver?: boolean },
): Promise<void> {
  try {
    await enqueueJob(
      "generate_and_deliver_invoice",
      { orderId, ...(opts?.paymentId ? { paymentId: opts.paymentId } : {}) },
      { idempotencyKey: invoiceJobKey(orderId, opts?.paymentId), priority: 1 },
    );
  } catch (err) {
    console.error("[schedule-invoice] Could not enqueue background invoice job:", err);
  }

  const secret = getInternalSecret();
  const host = getPublicApiHost();
  if (!host || !secret) {
    console.warn("[schedule-invoice] Missing SITE_URL/VERCEL_URL or CRON_SECRET — relying on job queue only.");
    return;
  }

  // Deliberately not awaited — this is what makes it non-blocking.
  fetch(`${host}/api/invoices/generate-async`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orderId,
      paymentId: opts?.paymentId || undefined,
      forceDeliver: opts?.forceDeliver ?? false,
    }),
  }).catch((err) => {
    console.warn("[schedule-invoice] Fire-and-forget async route call failed (job queue will retry):", err);
  });
}

export function buildInvoiceEmailSubject(serviceTitle: string, invoiceNumber: string): string {
  const service = serviceTitle.trim() || "Service";
  return `${service} ${invoiceNumber}`;
}
