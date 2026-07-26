import { supabase } from "@/integrations/supabase/client";

export type ApprovalActionType = "insert" | "update" | "delete";

export type ApprovalRequest = {
  id: string;
  requested_by: string;
  module: string;
  action_type: ApprovalActionType;
  target_table: string;
  target_id: string | null;
  payload: Record<string, unknown> | null;
  summary: string;
  status: "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

// Call this from a module's save/delete handler INSTEAD OF writing directly,
// when the current user is not an admin. It queues the change; nothing is
// applied to the real table until an admin approves it.
export async function submitForApproval(params: {
  userId: string;
  module: string;
  actionType: ApprovalActionType;
  table: string;
  targetId?: string | null;
  payload?: Record<string, unknown> | null;
  summary: string; // human-readable, e.g. `Update service "Kundali"`
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from("approval_requests").insert({
    requested_by: params.userId,
    module: params.module,
    action_type: params.actionType,
    target_table: params.table,
    target_id: params.targetId ?? null,
    payload: params.payload ?? null,
    summary: params.summary,
    status: "pending",
  });
  return { error: error?.message ?? null };
}

// Generic apply — works for ANY module/table, because insert/update/delete
// are the same Supabase call shape regardless of what the data represents.
// This is what the Admin Approvals page calls on "Approve".
export async function applyApprovalRequest(req: ApprovalRequest): Promise<{ error: string | null }> {
  if (req.action_type === "insert") {
    const { error } = await supabase.from(req.target_table).insert(req.payload ?? {});
    return { error: error?.message ?? null };
  }
  if (req.action_type === "update") {
    if (!req.target_id) return { error: "Missing target_id for update request" };
    const { error } = await supabase
      .from(req.target_table)
      .update(req.payload ?? {})
      .eq("id", req.target_id);
    return { error: error?.message ?? null };
  }
  if (req.action_type === "delete") {
    if (!req.target_id) return { error: "Missing target_id for delete request" };
    const { error } = await supabase.from(req.target_table).delete().eq("id", req.target_id);
    return { error: error?.message ?? null };
  }
  return { error: `Unknown action_type: ${req.action_type}` };
}