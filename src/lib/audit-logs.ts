import { supabase } from "@/integrations/supabase/client";

// ASSUMPTION: mirrors the VITE_API_BASE_URL pattern seen in connected-sites.ts
// (HUB_API_BASE) — adjust the base URL below if your project resolves the
// API differently.
const API_BASE =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8081"
    : "";

export type AuditLogRow = {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  user_role: string | null;
  action_type: string;
  module: string;
  record_id: string | null;
  record_name: string | null;
  source_website: string | null;
  old_value: unknown;
  new_value: unknown;
  created_at: string;
};

export type AuditLogFilters = {
  search?: string;
  actionType?: string;
  module?: string;
  userId?: string;
  sourceWebsite?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
};

export type AuditLogResponse = {
  rows: AuditLogRow[];
  total: number;
  page: number;
  pageSize: number;
};

/**
 * Fetches audit logs from the backend. Throws with a friendly message on
 * 403 (not Super Admin) so the UI can show an Access Denied state instead
 * of a raw error.
 */
export async function fetchAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLogResponse> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error("Not signed in");

  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.actionType) params.set("actionType", filters.actionType);
  if (filters.module) params.set("module", filters.module);
  if (filters.userId) params.set("userId", filters.userId);
  if (filters.sourceWebsite) params.set("sourceWebsite", filters.sourceWebsite);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));

  const res = await fetch(`${API_BASE}/api/admin/audit-logs?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 403) {
    throw new Error("Access Denied — Audit Logs are only visible to Super Admins.");
  }

  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Could not load audit logs");

  return body as AuditLogResponse;
}