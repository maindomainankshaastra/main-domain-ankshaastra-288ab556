import { enqueueJob } from "./workflow-engine.js";
import { processInvoiceJob } from "./invoice-engine.js";
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
 * Kick off invoice PDF + email without blocking the payment response.
 * Uses a dedicated API route on Vercel; falls back to inline processing locally.
 */
export function scheduleInvoiceGeneration(orderId: string, paymentId?: string | null): void {
  const secret = getInternalSecret();
  const host = getPublicApiHost();

  if (host && secret) {
    void fetch(`${host}/api/invoices/generate-async`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId, paymentId: paymentId || undefined }),
    }).catch(async (err) => {
      console.warn("[schedule-invoice] Async trigger failed, enqueueing job:", err);
      try {
        await enqueueJob(
          "generate_and_deliver_invoice",
          { orderId, ...(paymentId ? { paymentId } : {}) },
          { idempotencyKey: invoiceJobKey(orderId, paymentId), priority: 1 },
        );
      } catch (queueErr) {
        console.error("[schedule-invoice] Queue fallback failed:", queueErr);
      }
    });
    return;
  }

  void processInvoiceJob(orderId, { paymentId: paymentId || undefined }).catch((err) => {
    console.error("[schedule-invoice] Inline invoice generation failed:", err);
  });
}

export function buildInvoiceEmailSubject(serviceTitle: string, invoiceNumber: string): string {
  const service = serviceTitle.trim() || "Service";
  return `Ankshaastra Payment ${service} ${invoiceNumber}`;
}
