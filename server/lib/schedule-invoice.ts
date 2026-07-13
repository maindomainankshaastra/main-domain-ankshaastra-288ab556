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
 * Generate invoice PDF + email after payment.
 * Runs inline first (works on Vercel Hobby without frequent cron).
 * Falls back to async route + daily job queue only if inline fails.
 */
export async function scheduleInvoiceGeneration(orderId: string, paymentId?: string | null): Promise<void> {
  try {
    await processInvoiceJob(orderId, { paymentId: paymentId || undefined });
    return;
  } catch (err) {
    console.error("[schedule-invoice] Inline generation failed:", err);
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

export function buildInvoiceEmailSubject(serviceTitle: string, invoiceNumber: string): string {
  const service = serviceTitle.trim() || "Service";
  return `Ankshaastra Payment ${service} ${invoiceNumber}`;
}
