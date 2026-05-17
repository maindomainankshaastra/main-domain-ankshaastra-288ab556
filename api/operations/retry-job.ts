import { verifyApiKey } from "../lib/webhook-utils";
import { getSupabaseAdmin } from "../lib/supabase-admin";
import { processPendingJobs } from "../lib/job-processor";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).end();
  if (!verifyApiKey(req.headers["x-api-key"] as string)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { jobId, invoiceId, orderId } = req.body || {};
  const supabase = getSupabaseAdmin();

  if (jobId) {
    await supabase
      .from("automation_jobs")
      .update({ status: "pending", scheduled_at: new Date().toISOString(), attempts: 0 })
      .eq("id", jobId);
  }

  if (invoiceId) {
    await supabase.from("automation_jobs").insert({
      job_type: "retry_communication",
      payload: { invoiceId },
      priority: 1,
    });
  }

  if (orderId) {
    await supabase.from("automation_jobs").insert({
      job_type: "generate_and_deliver_invoice",
      payload: { orderId },
      priority: 1,
      idempotency_key: `retry-${orderId}-${Date.now()}`,
    });
  }

  const results = await processPendingJobs(5);
  return res.status(200).json({ ok: true, results });
}
