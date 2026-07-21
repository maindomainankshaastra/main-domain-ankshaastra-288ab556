import { getSupabaseAdmin } from './supabase-admin.js';

/**
 * Shared audit-logging helper. Call this from any handler right after a
 * successful create/update/delete/login/etc. action.
 *
 * Role values come from your real `user_roles` table (user_id, role) —
 * the same table auth-api.ts's isAdminUser()/isSuperAdminUser() read from.
 * `userRole` will be whatever string is stored there (e.g. 'super_admin',
 * 'admin'); update auth-api.ts's isSuperAdminUser() if the exact literal
 * your team-management UI writes differs from 'super_admin'.
 */

export type AuditActionType =
  | 'login'
  | 'logout'
  | 'create'
  | 'update'
  | 'delete'
  | 'invoice_generated'
  | 'order_status_changed'
  | 'crm_status_changed'
  | 'export_csv'
  | 'team_member_added'
  | 'team_member_removed'
  | 'permissions_changed'
  | 'gst_settings_updated'
  | 'email_template_updated'
  | 'workflow_updated';

export interface AuditLogInput {
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  actionType: AuditActionType;
  module: string;
  recordId?: string | null;
  recordName?: string | null;
  sourceWebsite?: string | null;
  oldValue?: unknown;
  newValue?: unknown;
}

/**
 * Writes one audit log entry. Never throws — a failure to log should not
 * break the actual business action (e.g. don't fail an invoice creation
 * just because the audit write failed). Errors are logged to the server
 * console instead so they can be investigated separately.
 */
export async function logAudit(input: AuditLogInput): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('audit_logs').insert({
      user_id: input.userId ?? null,
      user_name: input.userName ?? null,
      user_email: input.userEmail ?? null,
      user_role: input.userRole ?? null,
      action_type: input.actionType,
      module: input.module,
      record_id: input.recordId ?? null,
      record_name: input.recordName ?? null,
      source_website: input.sourceWebsite ?? null,
      old_value: input.oldValue ?? null,
      new_value: input.newValue ?? null,
    });

    if (error) {
      console.error('[audit-log] failed to write entry:', error.message, input);
    }
  } catch (e) {
    console.error('[audit-log] unexpected error writing entry:', e, input);
  }
}

// Minimal shape needed from the Supabase auth User object (the same object
// getUserFromAuthHeader() in auth-api.ts already returns) — avoids a second
// import of the full supabase-js User type just for this.
type MinimalAuthUser = {
  id: string;
  email?: string | null;
  user_metadata?: { full_name?: string; name?: string } | null;
};

/**
 * Resolves the caller's role label from the real `user_roles` table
 * (user_id, role) — same table isAdminUser()/isSuperAdminUser() in
 * auth-api.ts already read from. A user can have more than one role row;
 * 'super_admin' is preferred if present, otherwise the first role found.
 */
async function resolveUserRole(userId: string): Promise<string | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId);
    const roles = (data || []).map((r: { role: string }) => r.role).filter(Boolean);
    if (roles.length === 0) return null;
    return roles.includes('super_admin') ? 'super_admin' : roles[0];
  } catch {
    return null;
  }
}

/**
 * Convenience wrapper: takes the auth User object handlers already have
 * (from getUserFromAuthHeader), resolves their role, and writes the audit
 * entry in one call. Name/email come straight off the auth user — no extra
 * table lookup needed for those two fields.
 */
export async function logAuditForUser(
  user: MinimalAuthUser | null | undefined,
  entry: Omit<AuditLogInput, 'userId' | 'userName' | 'userEmail' | 'userRole'>,
): Promise<void> {
  const userRole = user?.id ? await resolveUserRole(user.id) : null;
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || null;

  await logAudit({
    userId: user?.id ?? null,
    userName,
    userEmail: user?.email ?? null,
    userRole,
    ...entry,
  });
}