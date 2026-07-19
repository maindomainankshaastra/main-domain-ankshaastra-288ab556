import { supabase } from "@/integrations/supabase/client";

/**
 * Basic audit logging.
 *
 * Reuses the existing Supabase auth session to identify the actor —
 * no separate auth mechanism is introduced.
 *
 * Logging is fire-and-forget: `logAuditEvent` returns immediately and
 * never throws. A failed insert (network issue, missing table, RLS
 * denial, etc.) is only reported to the console — it can NEVER block
 * or fail the primary action (GST fix, team change, CRM delete, ...).
 */

export type AuditModule = "gst-maintenance" | "team-management" | "crm";

interface AuditLogInput {
  module: AuditModule;
  action: string;
  /** The record the action applied to, if any (customer id, user id, etc.) */
  targetId?: string | null;
}

export function logAuditEvent({ module, action, targetId }: AuditLogInput): void {
  // Intentionally not awaited by callers — this kicks off in the
  // background and swallows its own errors.
  void (async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) {
        console.warn("Audit log skipped: no authenticated user in session.");
        return;
      }

      const actorName =
        (user.user_metadata as { full_name?: string } | undefined)?.full_name ||
        user.email ||
        user.id;

      const { error } = await supabase.from("audit_logs").insert({
        actor_id: user.id,
        actor_name: actorName,
        module,
        action,
        target_id: targetId ?? null,
      });

      if (error) {
        console.warn(`Audit log insert failed [${module} / ${action}]:`, error.message);
      }
    } catch (err) {
      console.warn(`Audit log failed [${module} / ${action}]:`, err);
    }
  })();
}