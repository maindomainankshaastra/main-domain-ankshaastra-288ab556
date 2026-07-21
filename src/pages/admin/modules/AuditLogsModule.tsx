import { useEffect, useMemo, useState } from "react";
import { AdminPage } from "@/components/admin/AdminPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Loader2, Search as SearchIcon, ShieldAlert, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONNECTED_SITE_OPTIONS } from "@/lib/connected-sites";
import { fetchAuditLogs, type AuditLogRow } from "@/lib/audit-logs";

// Mirrors the action_type values written by server/lib/audit-log.ts /
// requirement #2's list.
const ACTION_TYPE_OPTIONS = [
  { value: "all", label: "All Actions" },
  { value: "login", label: "Login" },
  { value: "logout", label: "Logout" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "invoice_generated", label: "Invoice Generated" },
  { value: "order_status_changed", label: "Order Status Changed" },
  { value: "crm_status_changed", label: "CRM Status Changed" },
  { value: "export_csv", label: "Export CSV" },
  { value: "team_member_added", label: "Team Member Added" },
  { value: "team_member_removed", label: "Team Member Removed" },
  { value: "permissions_changed", label: "Permissions Changed" },
  { value: "gst_settings_updated", label: "GST Settings Updated" },
  { value: "email_template_updated", label: "Email Template Updated" },
  { value: "workflow_updated", label: "Workflow Updated" },
];

// ASSUMPTION: module names as written by the various handlers' logAudit()
// calls. Adjust this list once every handler is wired up, so filter options
// always match real stored values (same lesson learned from the Website
// filter bug in Email Center).
const MODULE_OPTIONS = [
  { value: "all", label: "All Modules" },
  { value: "orders", label: "Orders & Bookings" },
  { value: "invoices", label: "Invoice Manager" },
  { value: "crm", label: "CRM" },
  { value: "gst", label: "GST" },
  { value: "team", label: "Team & Permissions" },
  { value: "workflows", label: "Workflows" },
  { value: "email", label: "Email Center" },
  { value: "auth", label: "Login / Logout" },
];

const PAGE_SIZE = 25;

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getActionLabel(actionType: string) {
  return ACTION_TYPE_OPTIONS.find((o) => o.value === actionType)?.label || actionType;
}

function getModuleLabel(module: string) {
  return MODULE_OPTIONS.find((o) => o.value === module)?.label || module;
}

// Fixed color mapping so destructive-ish actions (delete, permissions,
// team removed) stand out, consistent with the red/green/amber convention
// already used across Orders/CRM/Invoices.
function getActionBadgeClass(actionType: string) {
  if (["delete", "team_member_removed", "permissions_changed"].includes(actionType)) {
    return "bg-red-100 text-red-700";
  }
  if (["create", "invoice_generated", "team_member_added", "login"].includes(actionType)) {
    return "bg-emerald-100 text-emerald-700";
  }
  if (["update", "order_status_changed", "crm_status_changed", "gst_settings_updated", "email_template_updated", "workflow_updated"].includes(actionType)) {
    return "bg-blue-100 text-blue-700";
  }
  return "bg-slate-200 text-slate-600";
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export default function AuditLogsModule() {
  const [rows, setRows] = useState<AuditLogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [actionType, setActionType] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [websiteFilter, setWebsiteFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const [selectedLog, setSelectedLog] = useState<AuditLogRow | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const hasActiveFilters =
    !!search || actionType !== "all" || moduleFilter !== "all" || websiteFilter !== "all" || !!dateFrom || !!dateTo;

  const clearFilters = () => {
    setSearch("");
    setActionType("all");
    setModuleFilter("all");
    setWebsiteFilter("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const loadLogs = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await fetchAuditLogs({
        search: search.trim() || undefined,
        actionType: actionType !== "all" ? actionType : undefined,
        module: moduleFilter !== "all" ? moduleFilter : undefined,
        sourceWebsite: websiteFilter !== "all" ? websiteFilter : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo ? `${dateTo}T23:59:59` : undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setRows(result.rows);
      setTotal(result.total);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not load audit logs";
      if (msg.toLowerCase().includes("access denied")) {
        setAccessDenied(true);
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 whenever a filter changes, then (re)load.
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, actionType, moduleFilter, websiteFilter, dateFrom, dateTo]);

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, actionType, moduleFilter, websiteFilter, dateFrom, dateTo, page]);

  // --------------------------------------------------------------
  // Access Denied screen — shown if the backend returns 403. This is the
  // enforcement path if a non-Super-Admin somehow lands on this route
  // (e.g. by typing /admin/audit-logs directly) even though the menu item
  // and route guard should normally prevent that from happening at all.
  // --------------------------------------------------------------
  if (accessDenied) {
    return (
      <AdminPage title="Audit Logs" description="Accountability and security log." loading={false} empty={false}>
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <ShieldAlert className="h-10 w-10 text-destructive" />
          <p className="text-lg font-semibold">403 — Access Denied</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Audit Logs are only visible to Super Admins. If you believe you should have access,
            contact your administrator.
          </p>
        </div>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Audit Logs"
      description="Every important admin-panel action, for accountability and security."
      loading={false}
      empty={false}
    >
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, email, module, action, record..."
              className="pl-8"
            />
          </div>

          <Select value={actionType} onValueChange={setActionType}>
            <SelectTrigger className="w-full sm:w-[190px]">
              <SelectValue placeholder="Action Type" />
            </SelectTrigger>
            <SelectContent>
              {ACTION_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-full sm:w-[190px]">
              <SelectValue placeholder="Module" />
            </SelectTrigger>
            <SelectContent>
              {MODULE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={websiteFilter} onValueChange={setWebsiteFilter}>
            <SelectTrigger className="w-full sm:w-[190px]">
              <SelectValue placeholder="Website" />
            </SelectTrigger>
            <SelectContent>
              {CONNECTED_SITE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[150px]" />
            <span className="text-xs text-muted-foreground">to</span>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[150px]" />
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          {total} log{total === 1 ? "" : "s"} found
        </p>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : errorMessage ? (
          <p className="text-sm text-destructive text-center py-8">{errorMessage}</p>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-14 text-center border border-dashed border-border rounded-lg">
            <ClipboardList className="w-8 h-8 text-muted-foreground" />
            <p className="text-muted-foreground text-sm font-medium">No audit logs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-left text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Time</th>
                  <th className="px-4 py-2 font-medium">User</th>
                  <th className="px-4 py-2 font-medium">Role</th>
                  <th className="px-4 py-2 font-medium">Module</th>
                  <th className="px-4 py-2 font-medium">Action</th>
                  <th className="px-4 py-2 font-medium">Record</th>
                  <th className="px-4 py-2 font-medium">Website</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedLog(row)}
                    className="border-t border-border hover:bg-muted/40 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
                      {formatDateTime(row.created_at)}
                    </td>
                    <td className="px-4 py-2">
                      <p className="font-medium truncate max-w-[160px]">{row.user_name || "—"}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                        {row.user_email || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-2 capitalize">{(row.user_role || "—").replace(/_/g, " ")}</td>
                    <td className="px-4 py-2">{getModuleLabel(row.module)}</td>
                    <td className="px-4 py-2">
                      <Badge className={cn("border-0", getActionBadgeClass(row.action_type))}>
                        {getActionLabel(row.action_type)}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 truncate max-w-[180px]">{row.record_name || row.record_id || "—"}</td>
                    <td className="px-4 py-2 truncate max-w-[160px]">{row.source_website || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 0 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Side panel — full details including old/new values */}
      <Sheet open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Audit Log Details</SheetTitle>
            <SheetDescription>Complete record for this action.</SheetDescription>
          </SheetHeader>

          {selectedLog && (
            <div className="space-y-3 text-sm mt-4">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Timestamp</span>
                <span className="font-medium">{formatDateTime(selectedLog.created_at)}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">User Name</span>
                <span className="font-medium">{selectedLog.user_name || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">User Email</span>
                <span className="font-medium break-all text-right">{selectedLog.user_email || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">User Role</span>
                <span className="font-medium capitalize">{(selectedLog.user_role || "—").replace(/_/g, " ")}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Action Type</span>
                <Badge className={cn("border-0", getActionBadgeClass(selectedLog.action_type))}>
                  {getActionLabel(selectedLog.action_type)}
                </Badge>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Module</span>
                <span className="font-medium">{getModuleLabel(selectedLog.module)}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Record ID</span>
                <span className="font-medium break-all text-right">{selectedLog.record_id || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Record Name</span>
                <span className="font-medium text-right">{selectedLog.record_name || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Website</span>
                <span className="font-medium">{selectedLog.source_website || "—"}</span>
              </div>

              {(selectedLog.old_value !== null && selectedLog.old_value !== undefined) && (
                <div className="space-y-1.5">
                  <p className="text-muted-foreground">Old Value</p>
                  <pre className="rounded-md border border-border bg-muted/30 p-3 text-xs overflow-x-auto whitespace-pre-wrap">
                    {formatValue(selectedLog.old_value)}
                  </pre>
                </div>
              )}

              {(selectedLog.new_value !== null && selectedLog.new_value !== undefined) && (
                <div className="space-y-1.5">
                  <p className="text-muted-foreground">New Value</p>
                  <pre className="rounded-md border border-border bg-muted/30 p-3 text-xs overflow-x-auto whitespace-pre-wrap">
                    {formatValue(selectedLog.new_value)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AdminPage>
  );
}