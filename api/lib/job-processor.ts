import { getSupabaseAdmin } from "./supabase-admin.js";
import { processInvoiceJob } from "./invoice-engine.js";

const HANDLERS: Record<string, (payload: Record<string, unknown>) => Promise<void>> = {
  generate_and_deliver_invoice: async (payload) => {
    const orderId = String(payload.orderId);
    await processInvoiceJob(orderId);
  },
  send_invoice_email: async (payload) => {
    const { deliverInvoice } = await import("./invoice-engine");
    await deliverInvoice(String(payload.invoiceId));
  },
  retry_communication: async (payload) => {
    const { deliverInvoice } = await import("./invoice-engine");
    if (payload.invoiceId) await deliverInvoice(String(payload.invoiceId));
  },
};

export async function processPendingJobs(limit = 10) {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data: jobs } = await supabase
    .from("automation_jobs")
    .select("*")
    .in("status", ["pending", "failed"])
    .lte("scheduled_at", now)
    .lt("attempts", 5)
    .order("priority", { ascending: true })
    .order("scheduled_at", { ascending: true })
    .limit(limit);

  const results: Array<{ id: string; ok: boolean; error?: string }> = [];

  for (const job of jobs || []) {
    await supabase.from("automation_jobs").update({ status: "processing", started_at: now }).eq("id", job.id);

    const handler = HANDLERS[job.job_type];
    if (!handler) {
      await supabase
        .from("automation_jobs")
        .update({ status: "dead_letter", last_error: `Unknown job type: ${job.job_type}`, completed_at: now })
        .eq("id", job.id);
      results.push({ id: job.id, ok: false, error: "unknown_type" });
      continue;
    }

    try {
      await handler(job.payload as Record<string, unknown>);
      await supabase
        .from("automation_jobs")
        .update({ status: "completed", completed_at: new Date().toISOString(), attempts: job.attempts + 1 })
        .eq("id", job.id);
      results.push({ id: job.id, ok: true });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Job failed";
      const attempts = job.attempts + 1;
      const maxAttempts = job.max_attempts || 5;
      const status = attempts >= maxAttempts ? "dead_letter" : "failed";
      const retryDelay = Math.min(3600, 60 * Math.pow(2, attempts));
      await supabase
        .from("automation_jobs")
        .update({
          status,
          attempts,
          last_error: msg,
          scheduled_at: new Date(Date.now() + retryDelay * 1000).toISOString(),
        })
        .eq("id", job.id);
      results.push({ id: job.id, ok: false, error: msg });
    }
  }

  return results;
}
