// // import { useState } from "react";
// // import { AdminPage } from "@/components/admin/AdminPage";
// // import { useAdminTable } from "@/hooks/useAdminData";
// // import { LogRow, statusBadge } from "./logHelpers";
// // import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { Button } from "@/components/ui/button";
// // import { Loader2, Mail } from "lucide-react";
// // import { toast } from "sonner";
// // import { sendTestEmail } from "@/lib/email-admin";
// // import { useAuth } from "@/hooks/useAuth";

// // export default function EmailModule() {
// //   const { user } = useAuth();
// //   const { rows, loading, reload } = useAdminTable<Record<string, unknown>>("email_logs", "created_at");
// //   const [testTo, setTestTo] = useState(user?.email || "");
// //   const [sending, setSending] = useState(false);

// //   const runTestEmail = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (!testTo.trim()) {
// //       toast.error("Enter a recipient email");
// //       return;
// //     }
// //     setSending(true);
// //     try {
// //       const result = await sendTestEmail(testTo.trim());
// //       toast.success(`Test email sent to ${testTo.trim()}${result.messageId ? ` (${result.messageId})` : ""}`);
// //       reload();
// //     } catch (err: unknown) {
// //       toast.error(err instanceof Error ? err.message : "Test email failed");
// //     } finally {
// //       setSending(false);
// //     }
// //   };

// //   return (
// //     <AdminPage title="Email Center" description="SMTP delivery logs and test sending." loading={false} empty={false}>
// //       <Card className="mb-6">
// //         <CardHeader>
// //           <CardTitle className="text-base flex items-center gap-2">
// //             <Mail className="w-4 h-4 text-primary" />
// //             Send test email
// //           </CardTitle>
// //           <CardDescription>
// //             Verify SMTP on Vercel: SMTP_HOST must be a server hostname (e.g. mail.ankshaastra.com), not your mailbox email. Use SMTP_USER for Mail@ankshaastra.com, SMTP_PASSWORD or SMTP_PASS, SMTP_PORT, and EMAIL_FROM.
// //           </CardDescription>
// //         </CardHeader>
// //         <CardContent>
// //           <form onSubmit={runTestEmail} className="flex flex-wrap items-end gap-3 max-w-xl">
// //             <div className="flex-1 min-w-[220px] space-y-2">
// //               <Label htmlFor="test-email-to">Recipient</Label>
// //               <Input
// //                 id="test-email-to"
// //                 type="email"
// //                 value={testTo}
// //                 onChange={(e) => setTestTo(e.target.value)}
// //                 placeholder="you@example.com"
// //               />
// //             </div>
// //             <Button type="submit" disabled={sending}>
// //               {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
// //               Send test
// //             </Button>
// //           </form>
// //         </CardContent>
// //       </Card>

// //       <h3 className="text-sm font-medium text-muted-foreground mb-3">Delivery log</h3>
// //       {loading ? (
// //         <p className="text-muted-foreground text-sm">Loading logs…</p>
// //       ) : !rows.length ? (
// //         <p className="text-muted-foreground text-sm py-8 text-center border border-dashed border-border rounded-lg">
// //           No emails logged yet. Send a test email above.
// //         </p>
// //       ) : (
// //         <div className="space-y-2">
// //           {rows.map((r) => (
// //             <LogRow key={String(r.id)}>
// //               <div className="min-w-0">
// //                 <p className="font-medium truncate">{String(r.subject)}</p>
// //                 <p className="text-sm text-muted-foreground">
// //                   To: {String(r.to_email)} · {String(r.provider)}
// //                   {r.template_slug ? ` · ${String(r.template_slug)}` : ""}
// //                 </p>
// //                 {r.error_message ? (
// //                   <p className="text-xs text-destructive mt-1">{String(r.error_message)}</p>
// //                 ) : null}
// //               </div>
// //               {statusBadge(String(r.status))}
// //             </LogRow>
// //           ))}
// //         </div>
// //       )}
// //     </AdminPage>
// //   );
// // }


// import { useEffect, useMemo, useState } from "react";
// import { AdminPage } from "@/components/admin/AdminPage";
// import { useAdminTable } from "@/hooks/useAdminData";
// import { supabase } from "@/integrations/supabase/client";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Loader2,
//   Mail,
//   Search,
//   ChevronLeft,
//   ChevronRight,
//   RotateCcw,
//   Inbox,
//   Eye,
// } from "lucide-react";
// import { toast } from "sonner";
// import { sendTestEmail } from "@/lib/email-admin";
// import { useAuth } from "@/hooks/useAuth";

// // ------------------------------------------------------------------
// // Types
// // ------------------------------------------------------------------

// interface EmailLogRow {
//   id: string;
//   customer_id?: string | null;
//   order_id?: string | null;
//   invoice_id?: string | null;
//   to_email?: string | null;
//   subject?: string | null;
//   status?: string | null;
//   provider?: string | null;
//   provider_message_id?: string | null;
//   template_slug?: string | null;
//   error_message?: string | null;
//   sent_at?: string | null;
//   created_at?: string | null;
//   // Not real columns on email_logs — these are filled in via the orders join below.
//   customer_name?: string | null;
//   source_website?: string | null;
//   [key: string]: unknown;
// }

// // Minimal shape of the orders row we join on, used to enrich each email log
// // with the customer name and website that email_logs itself doesn't store.
// interface OrderJoinInfo {
//   customer_name: string | null;
//   source_website: string | null;
// }

// type StatusFilter = "all" | "success" | "failed" | "pending";
// type WebsiteFilter = "all" | "ankshaastra" | "miracle-baby" | "empower";

// const PAGE_SIZE = 10;

// const WEBSITE_OPTIONS: { value: WebsiteFilter; label: string }[] = [
//   { value: "all", label: "All Websites" },
//   { value: "ankshaastra", label: "Ankshaastra" },
//   { value: "miracle-baby", label: "Miracle Baby" },
//   { value: "empower", label: "Empower" },
// ];

// const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
//   { value: "all", label: "All Statuses" },
//   { value: "success", label: "Success" },
//   { value: "failed", label: "Failed" },
//   { value: "pending", label: "Pending" },
// ];

// // ------------------------------------------------------------------
// // Helpers
// // ------------------------------------------------------------------

// function normalize(value: unknown): string {
//   return String(value ?? "")
//     .toLowerCase()
//     .replace(/[^a-z0-9]/g, "");
// }

// function safeString(value: unknown, fallback = "—"): string {
//   if (value === null || value === undefined || value === "") return fallback;
//   return String(value);
// }

// function formatDateTime(value: unknown): string {
//   if (!value) return "—";
//   const d = new Date(String(value));
//   if (Number.isNaN(d.getTime())) return String(value);
//   return d.toLocaleString(undefined, {
//     year: "numeric",
//     month: "short",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// }

// function StatusBadge({ status }: { status: unknown }) {
//   const normalized = normalize(status);
//   if (normalized === "success" || normalized === "sent" || normalized === "delivered") {
//     return (
//       <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border border-green-200">
//         Success
//       </Badge>
//     );
//   }
//   if (normalized === "failed" || normalized === "error") {
//     return (
//       <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border border-red-200">
//         Failed
//       </Badge>
//     );
//   }
//   if (normalized === "pending" || normalized === "queued" || normalized === "processing") {
//     return (
//       <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border border-yellow-200">
//         Pending
//       </Badge>
//     );
//   }
//   return <Badge variant="outline">{safeString(status, "Unknown")}</Badge>;
// }

// // No resend/retry backend function currently exists for email_logs.
// // Flip this to true once one is wired up (e.g. a Supabase edge function
// // or an existing send-email endpoint that accepts a log id), and swap the
// // disabled Retry buttons below back to calling handleRetry.
// const RETRY_API_AVAILABLE = false;

// // TODO: wire this up once a real resend/retry endpoint exists, e.g.:
// // await supabase.functions.invoke("resend-email", { body: { id } });
// async function retryEmail(_id: string): Promise<void> {
//   throw new Error("Retry API not implemented yet");
// }

// // ------------------------------------------------------------------
// // Component
// // ------------------------------------------------------------------

// export default function EmailModule() {
//   const { user } = useAuth();
//   const { rows, loading, reload } = useAdminTable<Record<string, unknown>>("email_logs");

//   // Test email form state (existing functionality — unchanged)
//   const [testTo, setTestTo] = useState(user?.email || "");
//   const [sending, setSending] = useState(false);

//   // New: search / filters / pagination / dialog state
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
//   const [websiteFilter, setWebsiteFilter] = useState<WebsiteFilter>("all");
//   const [dateFilter, setDateFilter] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedLog, setSelectedLog] = useState<EmailLogRow | null>(null);
//   const [retryingId, setRetryingId] = useState<string | null>(null); // kept for when RETRY_API_AVAILABLE flips to true

//   const runTestEmail = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!testTo.trim()) {
//       toast.error("Enter a recipient email");
//       return;
//     }
//     setSending(true);
//     try {
//       const result = await sendTestEmail(testTo.trim());
//       toast.success(`Test email sent to ${testTo.trim()}${result.messageId ? ` (${result.messageId})` : ""}`);
//       reload();
//     } catch (err: unknown) {
//       toast.error(err instanceof Error ? err.message : "Test email failed");
//     } finally {
//       setSending(false);
//     }
//   };

//   const handleRetry = async (row: EmailLogRow, e?: React.MouseEvent) => {
//     e?.stopPropagation();
//     if (!RETRY_API_AVAILABLE) return; // button is disabled in the UI, this is just a safety net
//     setRetryingId(row.id);
//     try {
//       await retryEmail(row.id);
//       reload();
//     } catch (err: unknown) {
//       toast.error(err instanceof Error ? err.message : "Retry failed");
//     } finally {
//       setRetryingId(null);
//     }
//   };

//   // --------------------------------------------------------------
//   // Derived data: join orders -> sort -> filter -> paginate
//   // --------------------------------------------------------------

//   const typedRows = rows as EmailLogRow[];

//   // email_logs has no customer_name / source_website columns of its own —
//   // both live on orders, linked via email_logs.order_id -> orders.id.
//   // We fetch just those two columns for the order_ids currently on screen
//   // and merge them in, so every existing safeString(row.customer_name) /
//   // safeString(row.source_website) call below keeps working unchanged.
//   const [ordersById, setOrdersById] = useState<Record<string, OrderJoinInfo>>({});
//   const [ordersLoading, setOrdersLoading] = useState(false);

//   const orderIdsKey = useMemo(() => {
//     const ids = new Set<string>();
//     for (const r of typedRows) {
//       if (typeof r.order_id === "string" && r.order_id) ids.add(r.order_id);
//     }
//     return Array.from(ids).sort().join(",");
//   }, [typedRows]);

//   useEffect(() => {
//     const orderIds = orderIdsKey ? orderIdsKey.split(",") : [];
//     if (orderIds.length === 0) {
//       setOrdersById({});
//       return;
//     }

//     let cancelled = false;
//     setOrdersLoading(true);

//     supabase
//       .from("orders")
//       .select("id, customer_name, source_website")
//       .in("id", orderIds)
//       .then(({ data, error }) => {
//         if (cancelled) return;
//         if (!error && data) {
//           const map: Record<string, OrderJoinInfo> = {};
//           for (const o of data as { id: string; customer_name: string | null; source_website: string | null }[]) {
//             map[o.id] = { customer_name: o.customer_name, source_website: o.source_website };
//           }
//           setOrdersById(map);
//         } else if (error) {
//           toast.error("Could not load customer/website details from orders");
//         }
//         setOrdersLoading(false);
//       });

//     return () => {
//       cancelled = true;
//     };
//   }, [orderIdsKey]);

//   const enrichedRows = useMemo(() => {
//     return typedRows.map((r) => {
//       const orderInfo = r.order_id ? ordersById[r.order_id] : undefined;
//       return {
//         ...r,
//         customer_name: orderInfo?.customer_name ?? r.customer_name ?? null,
//         source_website: orderInfo?.source_website ?? r.source_website ?? null,
//       };
//     });
//   }, [typedRows, ordersById]);

//   const isLoading = loading || (orderIdsKey !== "" && ordersLoading);

//   const sortedRows = useMemo(() => {
//     return [...enrichedRows].sort((a, b) => {
//       const dateA = new Date(String(a.created_at ?? 0)).getTime();
//       const dateB = new Date(String(b.created_at ?? 0)).getTime();
//       return dateB - dateA; // newest first
//     });
//   }, [enrichedRows]);

//   const filteredRows = useMemo(() => {
//     const q = search.trim().toLowerCase();

//     return sortedRows.filter((row) => {
//       // Search: customer_name, to_email, subject
//       if (q) {
//         const haystack = [row.customer_name, row.to_email, row.subject]
//           .map((v) => String(v ?? "").toLowerCase())
//           .join(" ");
//         if (!haystack.includes(q)) return false;
//       }

//       // Status filter
//       if (statusFilter !== "all") {
//         const normalizedStatus = normalize(row.status);
//         const matchesSuccess =
//           statusFilter === "success" &&
//           ["success", "sent", "delivered"].includes(normalizedStatus);
//         const matchesFailed =
//           statusFilter === "failed" && ["failed", "error"].includes(normalizedStatus);
//         const matchesPending =
//           statusFilter === "pending" &&
//           ["pending", "queued", "processing"].includes(normalizedStatus);
//         if (!(matchesSuccess || matchesFailed || matchesPending)) return false;
//       }

//       // Website filter
//       if (websiteFilter !== "all") {
//         if (normalize(row.source_website) !== normalize(websiteFilter)) return false;
//       }

//       // Date filter (matches the created_at calendar date)
//       if (dateFilter) {
//         if (!row.created_at) return false;
//         const rowDate = new Date(String(row.created_at));
//         if (Number.isNaN(rowDate.getTime())) return false;
//         const rowDateStr = rowDate.toISOString().slice(0, 10);
//         if (rowDateStr !== dateFilter) return false;
//       }

//       return true;
//     });
//   }, [sortedRows, search, statusFilter, websiteFilter, dateFilter]);

//   const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
//   const safePage = Math.min(currentPage, totalPages);

//   const paginatedRows = useMemo(() => {
//     const start = (safePage - 1) * PAGE_SIZE;
//     return filteredRows.slice(start, start + PAGE_SIZE);
//   }, [filteredRows, safePage]);

//   const pageNumbers = useMemo(() => {
//     const pages: number[] = [];
//     const maxButtons = 5;
//     let start = Math.max(1, safePage - Math.floor(maxButtons / 2));
//     const end = Math.min(totalPages, start + maxButtons - 1);
//     start = Math.max(1, end - maxButtons + 1);
//     for (let i = start; i <= end; i++) pages.push(i);
//     return pages;
//   }, [safePage, totalPages]);

//   function updateFilterAndResetPage<T>(setter: (v: T) => void) {
//     return (value: T) => {
//       setter(value);
//       setCurrentPage(1);
//     };
//   }

//   const onSearchChange = (value: string) => {
//     setSearch(value);
//     setCurrentPage(1);
//   };

//   const onStatusChange = updateFilterAndResetPage<StatusFilter>(setStatusFilter);
//   const onWebsiteChange = updateFilterAndResetPage<WebsiteFilter>(setWebsiteFilter);
//   const onDateChange = (value: string) => {
//     setDateFilter(value);
//     setCurrentPage(1);
//   };

//   return (
//     <AdminPage title="Email Center" description="SMTP delivery logs and test sending." loading={false} empty={false}>
//       <Card className="mb-6">
//         <CardHeader>
//           <CardTitle className="text-base flex items-center gap-2">
//             <Mail className="w-4 h-4 text-primary" />
//             Send test email
//           </CardTitle>
//           <CardDescription>
//             Verify SMTP on Vercel: SMTP_HOST must be a server hostname (e.g. mail.ankshaastra.com), not your mailbox email. Use SMTP_USER for Mail@ankshaastra.com, SMTP_PASSWORD or SMTP_PASS, SMTP_PORT, and EMAIL_FROM.
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={runTestEmail} className="flex flex-wrap items-end gap-3 max-w-xl">
//             <div className="flex-1 min-w-[220px] space-y-2">
//               <Label htmlFor="test-email-to">Recipient</Label>
//               <Input
//                 id="test-email-to"
//                 type="email"
//                 value={testTo}
//                 onChange={(e) => setTestTo(e.target.value)}
//                 placeholder="you@example.com"
//               />
//             </div>
//             <Button type="submit" disabled={sending}>
//               {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
//               Send test
//             </Button>
//           </form>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle className="text-base">Delivery log</CardTitle>
//           <CardDescription>Search, filter, and manage all outgoing email records.</CardDescription>
//         </CardHeader>
//         <CardContent>
//           {/* Filters toolbar */}
//           <div className="flex flex-col gap-3 mb-4 md:flex-row md:flex-wrap md:items-end">
//             <div className="flex-1 min-w-[220px] space-y-2">
//               <Label htmlFor="email-log-search">Search</Label>
//               <div className="relative">
//                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
//                 <Input
//                   id="email-log-search"
//                   value={search}
//                   onChange={(e) => onSearchChange(e.target.value)}
//                   placeholder="Name, email, or subject…"
//                   className="pl-9"
//                 />
//               </div>
//             </div>

//             <div className="w-full md:w-44 space-y-2">
//               <Label>Status</Label>
//               <Select value={statusFilter} onValueChange={(v) => onStatusChange(v as StatusFilter)}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="All Statuses" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {STATUS_OPTIONS.map((opt) => (
//                     <SelectItem key={opt.value} value={opt.value}>
//                       {opt.label}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="w-full md:w-48 space-y-2">
//               <Label>Website</Label>
//               <Select value={websiteFilter} onValueChange={(v) => onWebsiteChange(v as WebsiteFilter)}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="All Websites" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {WEBSITE_OPTIONS.map((opt) => (
//                     <SelectItem key={opt.value} value={opt.value}>
//                       {opt.label}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="w-full md:w-44 space-y-2">
//               <Label htmlFor="email-log-date">Date</Label>
//               <Input
//                 id="email-log-date"
//                 type="date"
//                 value={dateFilter}
//                 onChange={(e) => onDateChange(e.target.value)}
//               />
//             </div>

//             {(search || statusFilter !== "all" || websiteFilter !== "all" || dateFilter) && (
//               <Button
//                 type="button"
//                 variant="ghost"
//                 onClick={() => {
//                   setSearch("");
//                   setStatusFilter("all");
//                   setWebsiteFilter("all");
//                   setDateFilter("");
//                   setCurrentPage(1);
//                 }}
//               >
//                 Clear filters
//               </Button>
//             )}
//           </div>

//           {/* Loading skeleton */}
//           {isLoading ? (
//             <div className="space-y-2">
//               {Array.from({ length: 5 }).map((_, i) => (
//                 <Skeleton key={i} className="h-14 w-full rounded-lg" />
//               ))}
//             </div>
//           ) : filteredRows.length === 0 ? (
//             <div className="flex flex-col items-center justify-center gap-2 py-14 text-center border border-dashed border-border rounded-lg">
//               <Inbox className="w-8 h-8 text-muted-foreground" />
//               <p className="text-muted-foreground text-sm font-medium">No Email Logs Found</p>
//             </div>
//           ) : (
//             <>
//               {/* Desktop table */}
//               <div className="hidden md:block overflow-x-auto rounded-lg border border-border">
//                 <table className="w-full text-sm">
//                   <thead>
//                     <tr className="bg-muted/50 text-left text-muted-foreground">
//                       <th className="px-4 py-2 font-medium">Customer</th>
//                       <th className="px-4 py-2 font-medium">Subject</th>
//                       <th className="px-4 py-2 font-medium">Website</th>
//                       <th className="px-4 py-2 font-medium">Status</th>
//                       <th className="px-4 py-2 font-medium">Created</th>
//                       <th className="px-4 py-2 font-medium text-right">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {paginatedRows.map((row) => {
//                       const isFailed = normalize(row.status) === "failed" || normalize(row.status) === "error";
//                       return (
//                         <tr
//                           key={row.id}
//                           onClick={() => setSelectedLog(row)}
//                           className="border-t border-border hover:bg-muted/40 cursor-pointer transition-colors"
//                         >
//                           <td className="px-4 py-2">
//                             <p className="font-medium truncate max-w-[180px]">
//                               {safeString(row.customer_name)}
//                             </p>
//                             <p className="text-xs text-muted-foreground truncate max-w-[180px]">
//                               {safeString(row.to_email)}
//                             </p>
//                           </td>
//                           <td className="px-4 py-2 truncate max-w-[240px]">{safeString(row.subject)}</td>
//                           <td className="px-4 py-2 truncate max-w-[180px]">
//                             {safeString(row.source_website, "Unknown")}
//                           </td>
//                           <td className="px-4 py-2">
//                             <StatusBadge status={row.status} />
//                           </td>
//                           <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
//                             {formatDateTime(row.created_at)}
//                           </td>
//                           <td className="px-4 py-2 text-right">
//                             <div className="flex items-center justify-end gap-2">
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   setSelectedLog(row);
//                                 }}
//                               >
//                                 <Eye className="w-3.5 h-3.5 mr-1" />
//                                 View
//                               </Button>
//                               {isFailed && (
//                                 <Button
//                                   size="sm"
//                                   variant="outline"
//                                   disabled={!RETRY_API_AVAILABLE || retryingId === row.id}
//                                   title="Retry isn't wired up yet — no resend API exists"
//                                   onClick={(e) => handleRetry(row, e)}
//                                 >
//                                   {retryingId === row.id ? (
//                                     <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
//                                   ) : (
//                                     <RotateCcw className="w-3.5 h-3.5 mr-1" />
//                                   )}
//                                   Retry Email
//                                 </Button>
//                               )}
//                             </div>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Mobile cards */}
//               <div className="md:hidden space-y-3">
//                 {paginatedRows.map((row) => {
//                   const isFailed = normalize(row.status) === "failed" || normalize(row.status) === "error";
//                   return (
//                     <div
//                       key={row.id}
//                       onClick={() => setSelectedLog(row)}
//                       className="rounded-lg border border-border p-3 space-y-2 active:bg-muted/40"
//                     >
//                       <div className="flex items-start justify-between gap-2">
//                         <div className="min-w-0">
//                           <p className="font-medium truncate">{safeString(row.customer_name)}</p>
//                           <p className="text-xs text-muted-foreground truncate">{safeString(row.to_email)}</p>
//                         </div>
//                         <StatusBadge status={row.status} />
//                       </div>
//                       <p className="text-sm truncate">{safeString(row.subject)}</p>
//                       <div className="flex items-center justify-between text-xs text-muted-foreground">
//                         <span className="truncate">{safeString(row.source_website, "Unknown")}</span>
//                         <span>{formatDateTime(row.created_at)}</span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           className="flex-1"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             setSelectedLog(row);
//                           }}
//                         >
//                           <Eye className="w-3.5 h-3.5 mr-1" />
//                           View
//                         </Button>
//                         {isFailed && (
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             className="flex-1"
//                             disabled={!RETRY_API_AVAILABLE || retryingId === row.id}
//                             title="Retry isn't wired up yet — no resend API exists"
//                             onClick={(e) => handleRetry(row, e)}
//                           >
//                             {retryingId === row.id ? (
//                               <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
//                             ) : (
//                               <RotateCcw className="w-3.5 h-3.5 mr-1" />
//                             )}
//                             Retry
//                           </Button>
//                         )}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Pagination */}
//               <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
//                 <p className="text-xs text-muted-foreground">
//                   Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredRows.length)} of{" "}
//                   {filteredRows.length}
//                 </p>
//                 <div className="flex items-center gap-1">
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     disabled={safePage <= 1}
//                     onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                   >
//                     <ChevronLeft className="w-4 h-4" />
//                     Previous
//                   </Button>
//                   {pageNumbers[0] > 1 && <span className="px-1 text-muted-foreground">…</span>}
//                   {pageNumbers.map((num) => (
//                     <Button
//                       key={num}
//                       size="sm"
//                       variant={num === safePage ? "default" : "outline"}
//                       onClick={() => setCurrentPage(num)}
//                       className="w-9"
//                     >
//                       {num}
//                     </Button>
//                   ))}
//                   {pageNumbers[pageNumbers.length - 1] < totalPages && (
//                     <span className="px-1 text-muted-foreground">…</span>
//                   )}
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     disabled={safePage >= totalPages}
//                     onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//                   >
//                     Next
//                     <ChevronRight className="w-4 h-4" />
//                   </Button>
//                 </div>
//               </div>
//             </>
//           )}
//         </CardContent>
//       </Card>

//       {/* Email details dialog */}
//       <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
//         <DialogContent className="max-w-lg">
//           <DialogHeader>
//             <DialogTitle>Email Details</DialogTitle>
//             <DialogDescription>Full record for this delivery log entry.</DialogDescription>
//           </DialogHeader>
//           {selectedLog && (
//             <div className="space-y-3 text-sm">
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Customer Name</span>
//                 <span className="col-span-2 font-medium">{safeString(selectedLog.customer_name)}</span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Customer Email</span>
//                 <span className="col-span-2 font-medium break-all">{safeString(selectedLog.to_email)}</span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Website</span>
//                 <span className="col-span-2 font-medium">{safeString(selectedLog.source_website, "Unknown")}</span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Subject</span>
//                 <span className="col-span-2 font-medium">{safeString(selectedLog.subject)}</span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Template Name</span>
//                 <span className="col-span-2 font-medium">{safeString(selectedLog.template_slug)}</span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Provider</span>
//                 <span className="col-span-2 font-medium">{safeString(selectedLog.provider)}</span>
//               </div>
//               <div className="grid grid-cols-3 gap-2 items-center">
//                 <span className="text-muted-foreground">Status</span>
//                 <span className="col-span-2">
//                   <StatusBadge status={selectedLog.status} />
//                 </span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Created Date & Time</span>
//                 <span className="col-span-2 font-medium">{formatDateTime(selectedLog.created_at)}</span>
//               </div>
//               {(normalize(selectedLog.status) === "failed" || normalize(selectedLog.status) === "error") && (
//                 <>
//                   {selectedLog.error_message && (
//                     <div className="grid grid-cols-3 gap-2">
//                       <span className="text-muted-foreground">Error Message</span>
//                       <span className="col-span-2 text-destructive break-words">
//                         {safeString(selectedLog.error_message)}
//                       </span>
//                     </div>
//                   )}
//                   <Button
//                     className="w-full mt-2"
//                     disabled={!RETRY_API_AVAILABLE || retryingId === selectedLog.id}
//                     title="Retry isn't wired up yet — no resend API exists"
//                     onClick={() => handleRetry(selectedLog)}
//                   >
//                     {retryingId === selectedLog.id ? (
//                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                     ) : (
//                       <RotateCcw className="w-4 h-4 mr-2" />
//                     )}
//                     Retry Email
//                   </Button>
//                 </>
//               )}
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </AdminPage>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import { AdminPage } from "@/components/admin/AdminPage";
import { useAdminTable } from "@/hooks/useAdminData";
import { supabase } from "@/integrations/supabase/client";
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
import {
  Loader2,
  Mail,
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Inbox,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { sendTestEmail } from "@/lib/email-admin";
import { useAuth } from "@/hooks/useAuth";
import { CONNECTED_SITE_OPTIONS } from "@/lib/connected-sites";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

interface EmailLogRow {
  id: string;
  customer_id?: string | null;
  order_id?: string | null;
  invoice_id?: string | null;
  to_email?: string | null;
  subject?: string | null;
  status?: string | null;
  provider?: string | null;
  provider_message_id?: string | null;
  template_slug?: string | null;
  error_message?: string | null;
  sent_at?: string | null;
  created_at?: string | null;
  // Not real columns on email_logs — these are filled in via the orders join below.
  customer_name?: string | null;
  source_website?: string | null;
  [key: string]: unknown;
}

// Minimal shape of the orders row we join on, used to enrich each email log
// with the customer name and website that email_logs itself doesn't store.
interface OrderJoinInfo {
  customer_name: string | null;
  source_website: string | null;
}

type StatusFilter = "all" | "success" | "failed" | "pending";
// Website filter values now come from CONNECTED_SITE_OPTIONS (the same
// real domain values stored in orders.source_website / email_logs' joined
// data), instead of a locally hardcoded, mismatched list — this is what was
// causing the Website filter to always show "No Email Logs Found".
type WebsiteFilter = (typeof CONNECTED_SITE_OPTIONS)[number]["value"];

const PAGE_SIZE = 10;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All Statuses" },
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

function StatusBadge({ status }: { status: unknown }) {
  const normalized = normalize(status);
  if (normalized === "success" || normalized === "sent" || normalized === "delivered") {
    return (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border border-green-200">
        Success
      </Badge>
    );
  }
  if (normalized === "failed" || normalized === "error") {
    return (
      <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border border-red-200">
        Failed
      </Badge>
    );
  }
  if (normalized === "pending" || normalized === "queued" || normalized === "processing") {
    return (
      <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border border-yellow-200">
        Pending
      </Badge>
    );
  }
  return <Badge variant="outline">{safeString(status, "Unknown")}</Badge>;
}

// No resend/retry backend function currently exists for email_logs.
// Flip this to true once one is wired up (e.g. a Supabase edge function
// or an existing send-email endpoint that accepts a log id), and swap the
// disabled Retry buttons below back to calling handleRetry.
const RETRY_API_AVAILABLE = false;

// TODO: wire this up once a real resend/retry endpoint exists, e.g.:
// await supabase.functions.invoke("resend-email", { body: { id } });
async function retryEmail(_id: string): Promise<void> {
  throw new Error("Retry API not implemented yet");
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export default function EmailModule() {
  const { user } = useAuth();
  const { rows, loading, reload } = useAdminTable<Record<string, unknown>>("email_logs");

  // Test email form state (existing functionality — unchanged)
  const [testTo, setTestTo] = useState(user?.email || "");
  const [sending, setSending] = useState(false);

  // New: search / filters / pagination / dialog state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [websiteFilter, setWebsiteFilter] = useState<WebsiteFilter>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<EmailLogRow | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null); // kept for when RETRY_API_AVAILABLE flips to true

  const runTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTo.trim()) {
      toast.error("Enter a recipient email");
      return;
    }
    setSending(true);
    try {
      const result = await sendTestEmail(testTo.trim());
      toast.success(`Test email sent to ${testTo.trim()}${result.messageId ? ` (${result.messageId})` : ""}`);
      reload();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Test email failed");
    } finally {
      setSending(false);
    }
  };

  const handleRetry = async (row: EmailLogRow, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!RETRY_API_AVAILABLE) return; // button is disabled in the UI, this is just a safety net
    setRetryingId(row.id);
    try {
      await retryEmail(row.id);
      reload();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Retry failed");
    } finally {
      setRetryingId(null);
    }
  };

  // --------------------------------------------------------------
  // Derived data: join orders -> sort -> filter -> paginate
  // --------------------------------------------------------------

  const typedRows = rows as EmailLogRow[];

  // email_logs has no customer_name / source_website columns of its own —
  // both live on orders, linked via email_logs.order_id -> orders.id.
  // We fetch just those two columns for the order_ids currently on screen
  // and merge them in, so every existing safeString(row.customer_name) /
  // safeString(row.source_website) call below keeps working unchanged.
  const [ordersById, setOrdersById] = useState<Record<string, OrderJoinInfo>>({});
  const [ordersLoading, setOrdersLoading] = useState(false);

  const orderIdsKey = useMemo(() => {
    const ids = new Set<string>();
    for (const r of typedRows) {
      if (typeof r.order_id === "string" && r.order_id) ids.add(r.order_id);
    }
    return Array.from(ids).sort().join(",");
  }, [typedRows]);

  useEffect(() => {
    const orderIds = orderIdsKey ? orderIdsKey.split(",") : [];
    if (orderIds.length === 0) {
      setOrdersById({});
      return;
    }

    let cancelled = false;
    setOrdersLoading(true);

    supabase
      .from("orders")
      .select("id, customer_name, source_website")
      .in("id", orderIds)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data) {
          const map: Record<string, OrderJoinInfo> = {};
          for (const o of data as { id: string; customer_name: string | null; source_website: string | null }[]) {
            map[o.id] = { customer_name: o.customer_name, source_website: o.source_website };
          }
          setOrdersById(map);
        } else if (error) {
          toast.error("Could not load customer/website details from orders");
        }
        setOrdersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orderIdsKey]);

  const enrichedRows = useMemo(() => {
    return typedRows.map((r) => {
      const orderInfo = r.order_id ? ordersById[r.order_id] : undefined;
      return {
        ...r,
        customer_name: orderInfo?.customer_name ?? r.customer_name ?? null,
        source_website: orderInfo?.source_website ?? r.source_website ?? null,
      };
    });
  }, [typedRows, ordersById]);

  const isLoading = loading || (orderIdsKey !== "" && ordersLoading);

  const sortedRows = useMemo(() => {
    return [...enrichedRows].sort((a, b) => {
      const dateA = new Date(String(a.created_at ?? 0)).getTime();
      const dateB = new Date(String(b.created_at ?? 0)).getTime();
      return dateB - dateA; // newest first
    });
  }, [enrichedRows]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();

    return sortedRows.filter((row) => {
      // Search: customer_name, to_email, subject
      if (q) {
        const haystack = [row.customer_name, row.to_email, row.subject]
          .map((v) => String(v ?? "").toLowerCase())
          .join(" ");
        if (!haystack.includes(q)) return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        const normalizedStatus = normalize(row.status);
        const matchesSuccess =
          statusFilter === "success" &&
          ["success", "sent", "delivered"].includes(normalizedStatus);
        const matchesFailed =
          statusFilter === "failed" && ["failed", "error"].includes(normalizedStatus);
        const matchesPending =
          statusFilter === "pending" &&
          ["pending", "queued", "processing"].includes(normalizedStatus);
        if (!(matchesSuccess || matchesFailed || matchesPending)) return false;
      }

      // Website filter — both sides are now real domain values (e.g.
      // "ankshaastra.com"), normalized the same way, so this actually matches.
      if (websiteFilter !== "all") {
        if (normalize(row.source_website) !== normalize(websiteFilter)) return false;
      }

      // Date filter (matches the created_at calendar date)
      if (dateFilter) {
        if (!row.created_at) return false;
        const rowDate = new Date(String(row.created_at));
        if (Number.isNaN(rowDate.getTime())) return false;
        const rowDateStr = rowDate.toISOString().slice(0, 10);
        if (rowDateStr !== dateFilter) return false;
      }

      return true;
    });
  }, [sortedRows, search, statusFilter, websiteFilter, dateFilter]);

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

  function updateFilterAndResetPage<T>(setter: (v: T) => void) {
    return (value: T) => {
      setter(value);
      setCurrentPage(1);
    };
  }

  const onSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const onStatusChange = updateFilterAndResetPage<StatusFilter>(setStatusFilter);
  const onWebsiteChange = updateFilterAndResetPage<WebsiteFilter>(setWebsiteFilter);
  const onDateChange = (value: string) => {
    setDateFilter(value);
    setCurrentPage(1);
  };

  return (
    <AdminPage title="Email Center" description="SMTP delivery logs and test sending." loading={false} empty={false}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            Send test email
          </CardTitle>
          <CardDescription>
            Verify SMTP on Vercel: SMTP_HOST must be a server hostname (e.g. mail.ankshaastra.com), not your mailbox email. Use SMTP_USER for Mail@ankshaastra.com, SMTP_PASSWORD or SMTP_PASS, SMTP_PORT, and EMAIL_FROM.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={runTestEmail} className="flex flex-wrap items-end gap-3 max-w-xl">
            <div className="flex-1 min-w-[220px] space-y-2">
              <Label htmlFor="test-email-to">Recipient</Label>
              <Input
                id="test-email-to"
                type="email"
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <Button type="submit" disabled={sending}>
              {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
              Send test
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Delivery log</CardTitle>
          <CardDescription>Search, filter, and manage all outgoing email records.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters toolbar */}
          <div className="flex flex-col gap-3 mb-4 md:flex-row md:flex-wrap md:items-end">
            <div className="flex-1 min-w-[220px] space-y-2">
              <Label htmlFor="email-log-search">Search</Label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email-log-search"
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Name, email, or subject…"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="w-full md:w-44 space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={(v) => onStatusChange(v as StatusFilter)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
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

            <div className="w-full md:w-48 space-y-2">
              <Label>Website</Label>
              <Select value={websiteFilter} onValueChange={(v) => onWebsiteChange(v as WebsiteFilter)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Websites" />
                </SelectTrigger>
                <SelectContent>
                  {CONNECTED_SITE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-44 space-y-2">
              <Label htmlFor="email-log-date">Date</Label>
              <Input
                id="email-log-date"
                type="date"
                value={dateFilter}
                onChange={(e) => onDateChange(e.target.value)}
              />
            </div>

            {(search || statusFilter !== "all" || websiteFilter !== "all" || dateFilter) && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setWebsiteFilter("all");
                  setDateFilter("");
                  setCurrentPage(1);
                }}
              >
                Clear filters
              </Button>
            )}
          </div>

          {/* Loading skeleton */}
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-14 text-center border border-dashed border-border rounded-lg">
              <Inbox className="w-8 h-8 text-muted-foreground" />
              <p className="text-muted-foreground text-sm font-medium">No Email Logs Found</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-left text-muted-foreground">
                      <th className="px-4 py-2 font-medium">Customer</th>
                      <th className="px-4 py-2 font-medium">Subject</th>
                      <th className="px-4 py-2 font-medium">Website</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                      <th className="px-4 py-2 font-medium">Created</th>
                      <th className="px-4 py-2 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map((row) => {
                      const isFailed = normalize(row.status) === "failed" || normalize(row.status) === "error";
                      return (
                        <tr
                          key={row.id}
                          onClick={() => setSelectedLog(row)}
                          className="border-t border-border hover:bg-muted/40 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-2">
                            <p className="font-medium truncate max-w-[180px]">
                              {safeString(row.customer_name)}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                              {safeString(row.to_email)}
                            </p>
                          </td>
                          <td className="px-4 py-2 truncate max-w-[240px]">{safeString(row.subject)}</td>
                          <td className="px-4 py-2 truncate max-w-[180px]">
                            {safeString(row.source_website, "Unknown")}
                          </td>
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
                                  disabled={!RETRY_API_AVAILABLE || retryingId === row.id}
                                  title="Retry isn't wired up yet — no resend API exists"
                                  onClick={(e) => handleRetry(row, e)}
                                >
                                  {retryingId === row.id ? (
                                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                                  ) : (
                                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                                  )}
                                  Retry Email
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

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {paginatedRows.map((row) => {
                  const isFailed = normalize(row.status) === "failed" || normalize(row.status) === "error";
                  return (
                    <div
                      key={row.id}
                      onClick={() => setSelectedLog(row)}
                      className="rounded-lg border border-border p-3 space-y-2 active:bg-muted/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{safeString(row.customer_name)}</p>
                          <p className="text-xs text-muted-foreground truncate">{safeString(row.to_email)}</p>
                        </div>
                        <StatusBadge status={row.status} />
                      </div>
                      <p className="text-sm truncate">{safeString(row.subject)}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="truncate">{safeString(row.source_website, "Unknown")}</span>
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
                            disabled={!RETRY_API_AVAILABLE || retryingId === row.id}
                            title="Retry isn't wired up yet — no resend API exists"
                            onClick={(e) => handleRetry(row, e)}
                          >
                            {retryingId === row.id ? (
                              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                            ) : (
                              <RotateCcw className="w-3.5 h-3.5 mr-1" />
                            )}
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

      {/* Email details dialog */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Email Details</DialogTitle>
            <DialogDescription>Full record for this delivery log entry.</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Customer Name</span>
                <span className="col-span-2 font-medium">{safeString(selectedLog.customer_name)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Customer Email</span>
                <span className="col-span-2 font-medium break-all">{safeString(selectedLog.to_email)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Website</span>
                <span className="col-span-2 font-medium">{safeString(selectedLog.source_website, "Unknown")}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Subject</span>
                <span className="col-span-2 font-medium">{safeString(selectedLog.subject)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Template Name</span>
                <span className="col-span-2 font-medium">{safeString(selectedLog.template_slug)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Provider</span>
                <span className="col-span-2 font-medium">{safeString(selectedLog.provider)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 items-center">
                <span className="text-muted-foreground">Status</span>
                <span className="col-span-2">
                  <StatusBadge status={selectedLog.status} />
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Created Date & Time</span>
                <span className="col-span-2 font-medium">{formatDateTime(selectedLog.created_at)}</span>
              </div>
              {(normalize(selectedLog.status) === "failed" || normalize(selectedLog.status) === "error") && (
                <>
                  {selectedLog.error_message && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">Error Message</span>
                      <span className="col-span-2 text-destructive break-words">
                        {safeString(selectedLog.error_message)}
                      </span>
                    </div>
                  )}
                  <Button
                    className="w-full mt-2"
                    disabled={!RETRY_API_AVAILABLE || retryingId === selectedLog.id}
                    title="Retry isn't wired up yet — no resend API exists"
                    onClick={() => handleRetry(selectedLog)}
                  >
                    {retryingId === selectedLog.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RotateCcw className="w-4 h-4 mr-2" />
                    )}
                    Retry Email
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}