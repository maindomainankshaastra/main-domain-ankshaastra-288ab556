import { getSupabaseAdmin } from "./supabase-admin.js";
import { invoiceJobKey } from "./payment-order-map.js";

export type WorkflowStage =
  | "order_created"
  | "payment_pending"
  | "payment_received"
  | "invoice_generated"
  | "email_sent"
  | "whatsapp_sent"
  | "ai_report_pending"
  | "ai_report_generated"
  | "report_delivered"
  | "follow_up_scheduled"
  | "completed"
  | "cancelled";

export async function advanceWorkflow(
  orderId: string,
  toStage: WorkflowStage,
  eventType: string,
  payload: Record<string, unknown> = {}
) {
  const supabase = getSupabaseAdmin();
  const { data: order } = await supabase.from("orders").select("workflow_stage, customer_id").eq("id", orderId).single();

  await supabase.from("orders").update({ workflow_stage: toStage }).eq("id", orderId);
  await supabase.from("workflow_events").insert({
    order_id: orderId,
    customer_id: order?.customer_id,
    event_type: eventType,
    from_stage: order?.workflow_stage,
    to_stage: toStage,
    payload,
    triggered_by: "system",
  });
}

export async function enqueueJob(
  jobType: string,
  payload: Record<string, unknown>,
  opts?: { idempotencyKey?: string; priority?: number; delaySeconds?: number }
) {
  const supabase = getSupabaseAdmin();
  const scheduledAt = new Date(Date.now() + (opts?.delaySeconds ?? 0) * 1000).toISOString();

  const row = {
    job_type: jobType,
    payload,
    priority: opts?.priority ?? 5,
    scheduled_at: scheduledAt,
    idempotency_key: opts?.idempotencyKey,
  };

  if (opts?.idempotencyKey) {
    const { data: existing } = await supabase
      .from("automation_jobs")
      .select("id")
      .eq("idempotency_key", opts.idempotencyKey)
      .maybeSingle();
    if (existing) return { jobId: existing.id, duplicate: true };
  }

  const { data, error } = await supabase.from("automation_jobs").insert(row).select("id").single();
  if (error) throw error;
  return { jobId: data.id, duplicate: false };
}

export async function runPostPaymentWorkflow(orderId: string, paymentId?: string) {
  await enqueueJob(
    "generate_and_deliver_invoice",
    { orderId, ...(paymentId ? { paymentId } : {}) },
    {
      idempotencyKey: invoiceJobKey(orderId, paymentId),
      priority: 1,
    },
  );
}
