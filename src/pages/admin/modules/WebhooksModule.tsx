// import { AdminPage } from "@/components/admin/AdminPage";
// import { useAdminTable } from "@/hooks/useAdminData";
// import { statusBadge } from "./logHelpers";

// export default function WebhooksModule() {
//   const { rows, loading } = useAdminTable<Record<string, unknown>>("webhooks_log");
//   return (
//     <AdminPage title="Webhook Logs" description="Razorpay payment webhooks with deduplication." loading={loading} empty={!rows.length}>
//       <div className="space-y-2">
//         {rows.map((r) => (
//           <div key={String(r.id)} className="border border-border rounded-lg p-4">
//             <div className="flex justify-between gap-2">
//               <p className="font-medium">{String(r.source)} · {String(r.event_type)}</p>
//               {statusBadge(String(r.status))}
//             </div>
//             <p className="text-xs text-muted-foreground mt-2">{new Date(String(r.created_at)).toLocaleString()}</p>
//             {Boolean(r.error_message) && <p className="text-xs text-destructive mt-1">{String(r.error_message)}</p>}
//           </div>
//         ))}
//       </div>
//     </AdminPage>
//   );
// }

import { useMemo, useState } from "react";
import { AdminPage } from "@/components/admin/AdminPage";
import { useAdminTable } from "@/hooks/useAdminData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, ChevronLeft, ChevronRight, RotateCcw, Inbox, Eye } from "lucide-react";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

// Real columns on webhooks_log (confirmed via information_schema — nothing
// here is guessed). Payment ID / Order ID / Website are NOT columns; they
// only exist, if at all, nested inside the `payload` jsonb blob below.
interface WebhookLogRow {
  id: string;
  source?: string | null;
  event_type?: string | null;
  payload?: unknown;
  status?: string | null;
  error_message?: string | null;
  processed_at?: string | null;
  created_at?: string | null;
  idempotency_key?: string | null;
  retry_count?: number | null;
  next_retry_at?: string | null;
  signature_valid?: boolean | null;
  [key: string]: unknown;
}

type StatusFilter = "all" | "success" | "failed" | "pending";
type WebsiteFilter = "all" | "ankshaastra" | "miracle-baby" | "empower";

const PAGE_SIZE = 10;

const WEBSITE_OPTIONS: { value: WebsiteFilter; label: string }[] = [
  { value: "all", label: "All Websites" },
  { value: "ankshaastra", label: "ankshaastra.com" },
  { value: "miracle-baby", label: "miraclebaby" },
  { value: "empower", label: "empower" },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "success", label: "Success" },
  { value: "failed", label: "Failed" },
  { value: "pending", label: "Pending" },
];

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function normalize(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function safeString(value: unknown, fallback = "—"): string {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function formatDateTime(value: unknown): string {
  if (!value) return "—";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Best-effort extraction from Razorpay's documented webhook body shape:
// { event, payload: { payment: { entity: { id, order_id, notes, ... } } } }
// This is Razorpay's own stable, published contract — not a guess about
// this project's schema. It degrades gracefully to "—" if the stored
// payload doesn't match (e.g. only a subset was saved, or it's an
// order.* event instead of a payment.* event).
// NOTE: table is currently empty, so this has not been verified against a
// real row yet — please confirm against the first live webhook.
function extractPaymentId(payload: unknown): string | null {
  const p = payload as Record<string, any> | null | undefined;
  return p?.payload?.payment?.entity?.id ?? p?.payment?.entity?.id ?? null;
}

function extractOrderId(payload: unknown): string | null {
  const p = payload as Record<string, any> | null | undefined;
  return (
    p?.payload?.payment?.entity?.order_id ??
    p?.payload?.order?.entity?.id ??
    p?.payment?.entity?.order_id ??
    null
  );
}

function extractWebsite(payload: unknown): string | null {
  const p = payload as Record<string, any> | null | undefined;
  return (
    p?.payload?.payment?.entity?.notes?.source_website ??
    p?.payload?.order?.entity?.notes?.source_website ??
    p?.notes?.source_website ??
    null
  );
}

function StatusBadge({ status }: { status: unknown }) {
  const normalized = normalize(status);
  if (["success", "processed", "captured", "paid"].includes(normalized)) {
    return (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border border-green-200">
        Success
      </Badge>
    );
  }
  if (["failed", "error"].includes(normalized)) {
    return (
      <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border border-red-200">
        Failed
      </Badge>
    );
  }
  if (["pending", "queued", "processing", "retrying"].includes(normalized)) {
    return (
      <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border border-yellow-200">
        Pending
      </Badge>
    );
  }
  return <Badge variant="outline">{safeString(status, "Unknown")}</Badge>;
}

function PrettyJson({ value }: { value: unknown }) {
  let text: string;
  try {
    text = JSON.stringify(value, null, 2);
  } catch {
    text = String(value);
  }
  return (
    <pre className="max-h-64 overflow-auto rounded-md bg-muted/50 border border-border p-3 text-xs whitespace-pre-wrap break-words">
      {text}
    </pre>
  );
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export default function WebhooksModule() {
  const { rows, loading } = useAdminTable<Record<string, unknown>>("webhooks_log");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [websiteFilter, setWebsiteFilter] = useState<WebsiteFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<WebhookLogRow | null>(null);

  const typedRows = rows as WebhookLogRow[];

  const sortedRows = useMemo(() => {
    return [...typedRows].sort((a, b) => {
      const dateA = new Date(String(a.created_at ?? 0)).getTime();
      const dateB = new Date(String(b.created_at ?? 0)).getTime();
      return dateB - dateA; // newest first
    });
  }, [typedRows]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();

    return sortedRows.filter((row) => {
      const paymentId = extractPaymentId(row.payload);
      const orderId = extractOrderId(row.payload);
      const website = extractWebsite(row.payload);

      if (q) {
        const haystack = [paymentId, orderId].map((v) => String(v ?? "").toLowerCase()).join(" ");
        if (!haystack.includes(q)) return false;
      }

      if (statusFilter !== "all") {
        const normalized = normalize(row.status);
        const matchesSuccess = statusFilter === "success" && ["success", "processed", "captured", "paid"].includes(normalized);
        const matchesFailed = statusFilter === "failed" && ["failed", "error"].includes(normalized);
        const matchesPending = statusFilter === "pending" && ["pending", "queued", "processing", "retrying"].includes(normalized);
        if (!(matchesSuccess || matchesFailed || matchesPending)) return false;
      }

      if (websiteFilter !== "all") {
        if (normalize(website) !== normalize(websiteFilter)) return false;
      }

      return true;
    });
  }, [sortedRows, search, statusFilter, websiteFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, safePage]);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxButtons = 5;
    let start = Math.max(1, safePage - Math.floor(maxButtons / 2));
    const end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [safePage, totalPages]);

  const onSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };
  const onStatusChange = (value: StatusFilter) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };
  const onWebsiteChange = (value: WebsiteFilter) => {
    setWebsiteFilter(value);
    setCurrentPage(1);
  };

  return (
    <AdminPage title="Webhook Logs" description="Razorpay payment webhooks with deduplication." loading={false} empty={false}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Delivery log</CardTitle>
          <CardDescription>Search, filter, and inspect incoming Razorpay webhook events.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters toolbar */}
          <div className="flex flex-col gap-3 mb-4 md:flex-row md:flex-wrap md:items-end">
            <div className="flex-1 min-w-[220px] space-y-2">
              <Label htmlFor="webhook-search">Search</Label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="webhook-search"
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Payment ID or Order ID…"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="w-full md:w-44 space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={(v) => onStatusChange(v as StatusFilter)}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-52 space-y-2">
              <Label>Website</Label>
              <Select value={websiteFilter} onValueChange={(v) => onWebsiteChange(v as WebsiteFilter)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Websites" />
                </SelectTrigger>
                <SelectContent>
                  {WEBSITE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(search || statusFilter !== "all" || websiteFilter !== "all") && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setWebsiteFilter("all");
                  setCurrentPage(1);
                }}
              >
                Clear filters
              </Button>
            )}
          </div>

          {/* Loading skeleton */}
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-14 text-center border border-dashed border-border rounded-lg">
              <Inbox className="w-8 h-8 text-muted-foreground" />
              <p className="text-muted-foreground text-sm font-medium">No Webhook Logs Found</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-left text-muted-foreground">
                      <th className="px-4 py-2 font-medium">Payment ID</th>
                      <th className="px-4 py-2 font-medium">Order ID</th>
                      <th className="px-4 py-2 font-medium">Website</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                      <th className="px-4 py-2 font-medium">Created Date</th>
                      <th className="px-4 py-2 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map((row) => {
                      const isFailed = normalize(row.status) === "failed" || normalize(row.status) === "error";
                      const paymentId = extractPaymentId(row.payload);
                      const orderId = extractOrderId(row.payload);
                      const website = extractWebsite(row.payload);
                      return (
                        <tr
                          key={row.id}
                          onClick={() => setSelectedLog(row)}
                          className="border-t border-border hover:bg-muted/40 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-2 font-mono text-xs truncate max-w-[160px]">{safeString(paymentId)}</td>
                          <td className="px-4 py-2 font-mono text-xs truncate max-w-[160px]">{safeString(orderId)}</td>
                          <td className="px-4 py-2 truncate max-w-[160px]">{safeString(website, "Unknown")}</td>
                          <td className="px-4 py-2">
                            <StatusBadge status={row.status} />
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
                            {formatDateTime(row.created_at)}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLog(row);
                                }}
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" />
                                View
                              </Button>
                              {isFailed && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled
                                  title="Retry API not implemented."
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                                  Retry Webhook
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile / tablet cards */}
              <div className="md:hidden space-y-3">
                {paginatedRows.map((row) => {
                  const isFailed = normalize(row.status) === "failed" || normalize(row.status) === "error";
                  const paymentId = extractPaymentId(row.payload);
                  const orderId = extractOrderId(row.payload);
                  const website = extractWebsite(row.payload);
                  return (
                    <div
                      key={row.id}
                      onClick={() => setSelectedLog(row)}
                      className="rounded-lg border border-border p-3 space-y-2 active:bg-muted/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium font-mono text-xs truncate">{safeString(paymentId)}</p>
                          <p className="text-xs text-muted-foreground font-mono truncate">{safeString(orderId)}</p>
                        </div>
                        <StatusBadge status={row.status} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="truncate">{safeString(website, "Unknown")}</span>
                        <span>{formatDateTime(row.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(row);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View
                        </Button>
                        {isFailed && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            disabled
                            title="Retry API not implemented."
                            onClick={(e) => e.stopPropagation()}
                          >
                            <RotateCcw className="w-3.5 h-3.5 mr-1" />
                            Retry
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                <p className="text-xs text-muted-foreground">
                  Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredRows.length)} of{" "}
                  {filteredRows.length}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  {pageNumbers[0] > 1 && <span className="px-1 text-muted-foreground">…</span>}
                  {pageNumbers.map((num) => (
                    <Button
                      key={num}
                      size="sm"
                      variant={num === safePage ? "default" : "outline"}
                      onClick={() => setCurrentPage(num)}
                      className="w-9"
                    >
                      {num}
                    </Button>
                  ))}
                  {pageNumbers[pageNumbers.length - 1] < totalPages && (
                    <span className="px-1 text-muted-foreground">…</span>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={safePage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Webhook details dialog */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Webhook Details</DialogTitle>
            <DialogDescription>Full record for this webhook event.</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Payment ID</span>
                <span className="col-span-2 font-mono text-xs break-all">
                  {safeString(extractPaymentId(selectedLog.payload))}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Order ID</span>
                <span className="col-span-2 font-mono text-xs break-all">
                  {safeString(extractOrderId(selectedLog.payload))}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Website</span>
                <span className="col-span-2 font-medium">
                  {safeString(extractWebsite(selectedLog.payload), "Unknown")}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 items-center">
                <span className="text-muted-foreground">Status</span>
                <span className="col-span-2">
                  <StatusBadge status={selectedLog.status} />
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Created Time</span>
                <span className="col-span-2 font-medium">{formatDateTime(selectedLog.created_at)}</span>
              </div>
              {typeof selectedLog.retry_count === "number" && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">Retry Count</span>
                  <span className="col-span-2 font-medium">{selectedLog.retry_count}</span>
                </div>
              )}

              {/* Only one payload column exists on webhooks_log — there's no
                  separate response_payload, so that section is intentionally
                  omitted rather than faked. */}
              {selectedLog.payload != null && (
                <div className="space-y-1">
                  <span className="text-muted-foreground">Request Payload</span>
                  <PrettyJson value={selectedLog.payload} />
                </div>
              )}

              {(normalize(selectedLog.status) === "failed" || normalize(selectedLog.status) === "error") &&
                selectedLog.error_message && (
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">Error Message</span>
                    <span className="col-span-2 text-destructive break-words">
                      {safeString(selectedLog.error_message)}
                    </span>
                  </div>
                )}

              {(normalize(selectedLog.status) === "failed" || normalize(selectedLog.status) === "error") && (
                <Button className="w-full mt-2" disabled title="Retry API not implemented.">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retry Webhook
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}
