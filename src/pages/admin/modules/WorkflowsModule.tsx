// import { AdminPage } from "@/components/admin/AdminPage";
// import { useAdminTable } from "@/hooks/useAdminData";
// import { Badge } from "@/components/ui/badge";
// import { statusBadge } from "./logHelpers";

// export default function WorkflowsModule() {
//   const { rows: events, loading: eLoading } = useAdminTable<Record<string, unknown>>("workflow_events");
//   const { rows: jobs, loading: jLoading } = useAdminTable<Record<string, unknown>>("automation_jobs");

//   return (
//     <div className="space-y-6">
//       <AdminPage title="Automation Jobs" description="Queue-based workflow processor (serverless)." loading={jLoading} empty={!jobs.length}>
//         <div className="space-y-2">
//           {jobs.map((j) => (
//             <div key={String(j.id)} className="border border-border rounded-lg p-4 flex justify-between">
//               <div>
//                 <p className="font-medium">{String(j.job_type)}</p>
//                 <p className="text-xs text-muted-foreground">Attempts: {String(j.attempts)}</p>
//               </div>
//               {statusBadge(String(j.status))}
//             </div>
//           ))}
//         </div>
//       </AdminPage>
//       <AdminPage title="Workflow Events" description="Order lifecycle audit trail." loading={eLoading} empty={!events.length}>
//         <div className="space-y-2">
//           {events.map((e) => (
//             <div key={String(e.id)} className="border border-border rounded-lg p-4 text-sm">
//               <span className="font-medium">{String(e.event_type)}</span>
//               <span className="text-muted-foreground"> · {String(e.from_stage)} → {String(e.to_stage)}</span>
//               <p className="text-xs text-muted-foreground mt-1">{new Date(String(e.created_at)).toLocaleString()}</p>
//             </div>
//           ))}
//         </div>
//       </AdminPage>
//     </div>
//   );
// }


// import { useMemo, useState } from "react";
// import { AdminPage } from "@/components/admin/AdminPage";
// import { useAdminTable } from "@/hooks/useAdminData";
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
//   Search,
//   ChevronLeft,
//   ChevronRight,
//   RefreshCw,
//   PlayCircle,
//   RotateCcw,
//   Eye,
//   ListChecks,
//   Clock,
//   CheckCircle2,
//   XCircle,
//   Timer,
// } from "lucide-react";
// import { statusBadge } from "./logHelpers";

// // ------------------------------------------------------------------
// // Types
// // ------------------------------------------------------------------

// interface AutomationJobRow {
//   id: string;
//   job_type?: string | null;
//   payload?: unknown;
//   status?: string | null;
//   priority?: number | null;
//   attempts?: number | null;
//   max_attempts?: number | null;
//   scheduled_at?: string | null;
//   started_at?: string | null;
//   completed_at?: string | null;
//   last_error?: string | null;
//   idempotency_key?: string | null;
//   created_at?: string | null;
//   [key: string]: unknown;
// }

// // Real enum values on automation_jobs.status (automation_job_status):
// // pending | processing | completed | failed | dead_letter
// type StatusFilter = "all" | "pending" | "processing" | "completed" | "failed" | "dead_letter";

// const PAGE_SIZE = 10;

// const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
//   { value: "all", label: "All Statuses" },
//   { value: "pending", label: "Pending" },
//   { value: "processing", label: "Running" },
//   { value: "completed", label: "Completed" },
//   { value: "failed", label: "Failed" },
//   { value: "dead_letter", label: "Dead Letter" },
// ];

// // ------------------------------------------------------------------
// // Backend availability flags
// // ------------------------------------------------------------------
// // No run-now / retry backend action exists anywhere in the project for
// // automation_jobs today. Flip these to true and wire the real call
// // (e.g. a supabase.functions.invoke(...) or RPC) once one exists.
// const RUN_NOW_API_AVAILABLE = false;
// const RETRY_API_AVAILABLE = false;

// // ------------------------------------------------------------------
// // Helpers
// // ------------------------------------------------------------------

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

// function formatDuration(ms: number): string {
//   if (ms < 0) ms = 0;
//   const totalSeconds = Math.floor(ms / 1000);
//   const hours = Math.floor(totalSeconds / 3600);
//   const minutes = Math.floor((totalSeconds % 3600) / 60);
//   const seconds = totalSeconds % 60;
//   if (hours > 0) return `${hours}h ${minutes}m`;
//   if (minutes > 0) return `${minutes}m ${seconds}s`;
//   return `${seconds}s`;
// }

// // duration isn't a stored column — derived from started_at/completed_at.
// // Still "processing" jobs show elapsed time so far.
// function getDuration(row: AutomationJobRow): string {
//   if (!row.started_at) return "—";
//   const start = new Date(row.started_at).getTime();
//   if (Number.isNaN(start)) return "—";
//   const end = row.completed_at ? new Date(row.completed_at).getTime() : Date.now();
//   if (Number.isNaN(end)) return "—";
//   return formatDuration(end - start);
// }

// function JobStatusBadge({ status }: { status: unknown }) {
//   const s = String(status ?? "").toLowerCase();
//   if (s === "completed") {
//     return (
//       <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border border-green-200">
//         Completed
//       </Badge>
//     );
//   }
//   if (s === "processing") {
//     return (
//       <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border border-blue-200">
//         Running
//       </Badge>
//     );
//   }
//   if (s === "pending") {
//     return (
//       <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border border-orange-200">
//         Pending
//       </Badge>
//     );
//   }
//   if (s === "failed") {
//     return (
//       <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border border-red-200">
//         Failed
//       </Badge>
//     );
//   }
//   if (s === "dead_letter") {
//     return (
//       <Badge className="bg-slate-200 text-slate-800 hover:bg-slate-200 border border-slate-300">
//         Dead Letter
//       </Badge>
//     );
//   }
//   return <Badge variant="outline">{safeString(status, "Unknown")}</Badge>;
// }

// // ------------------------------------------------------------------
// // Component
// // ------------------------------------------------------------------

// function AutomationJobsSection() {
//   const { rows, loading, reload } = useAdminTable<Record<string, unknown>>("automation_jobs");

//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedJob, setSelectedJob] = useState<AutomationJobRow | null>(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const [actingId, setActingId] = useState<string | null>(null);

//   const typedRows = rows as AutomationJobRow[];

//   // useAdminTable already orders by created_at descending by default —
//   // newest-first requirement is already satisfied by the hook call.

//   const stats = useMemo(() => {
//     const total = typedRows.length;
//     let pending = 0;
//     let processing = 0;
//     let completed = 0;
//     let failed = 0;
//     for (const r of typedRows) {
//       const s = String(r.status ?? "").toLowerCase();
//       if (s === "pending") pending++;
//       else if (s === "processing") processing++;
//       else if (s === "completed") completed++;
//       else if (s === "failed" || s === "dead_letter") failed++; // dead_letter counted as a failure for the summary card
//     }
//     return { total, pending, processing, completed, failed };
//   }, [typedRows]);

//   const filteredRows = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     return typedRows.filter((row) => {
//       if (q) {
//         const haystack = String(row.job_type ?? "").toLowerCase();
//         if (!haystack.includes(q)) return false;
//       }
//       if (statusFilter !== "all") {
//         if (String(row.status ?? "").toLowerCase() !== statusFilter) return false;
//       }
//       return true;
//     });
//   }, [typedRows, search, statusFilter]);

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

//   const onSearchChange = (value: string) => {
//     setSearch(value);
//     setCurrentPage(1);
//   };

//   const onStatusChange = (value: StatusFilter) => {
//     setStatusFilter(value);
//     setCurrentPage(1);
//   };

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     try {
//       await reload();
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   // Safety nets only — both buttons are disabled in the UI since no
//   // run-now / retry backend exists yet for automation_jobs.
//   const handleRunNow = async (row: AutomationJobRow, e?: React.MouseEvent) => {
//     e?.stopPropagation();
//     if (!RUN_NOW_API_AVAILABLE) return;
//     setActingId(row.id);
//     try {
//       // await supabase.functions.invoke("run-automation-job", { body: { id: row.id } });
//       await reload();
//     } finally {
//       setActingId(null);
//     }
//   };

//   const handleRetry = async (row: AutomationJobRow, e?: React.MouseEvent) => {
//     e?.stopPropagation();
//     if (!RETRY_API_AVAILABLE) return;
//     setActingId(row.id);
//     try {
//       // await supabase.functions.invoke("retry-automation-job", { body: { id: row.id } });
//       await reload();
//     } finally {
//       setActingId(null);
//     }
//   };

//   const isFailedState = (row: AutomationJobRow) => {
//     const s = String(row.status ?? "").toLowerCase();
//     return s === "failed" || s === "dead_letter";
//   };

//   return (
//     <AdminPage
//       title="Automation Jobs"
//       description="Queue-based workflow processor (serverless)."
//       loading={false}
//       empty={false}
//       actions={
//         <Button size="sm" variant="outline" onClick={handleRefresh} disabled={refreshing || loading}>
//           {refreshing || loading ? (
//             <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
//           ) : (
//             <RefreshCw className="w-3.5 h-3.5 mr-2" />
//           )}
//           Refresh
//         </Button>
//       }
//     >
//       {/* Stat cards */}
//       <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-3 lg:grid-cols-5">
//         <Card>
//           <CardContent className="p-4 flex items-center justify-between">
//             <div>
//               <p className="text-xs text-muted-foreground">Total Jobs</p>
//               <p className="text-2xl font-semibold">{stats.total}</p>
//             </div>
//             <ListChecks className="w-5 h-5 text-muted-foreground" />
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4 flex items-center justify-between">
//             <div>
//               <p className="text-xs text-muted-foreground">Running</p>
//               <p className="text-2xl font-semibold text-blue-600">{stats.processing}</p>
//             </div>
//             <PlayCircle className="w-5 h-5 text-blue-500" />
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4 flex items-center justify-between">
//             <div>
//               <p className="text-xs text-muted-foreground">Completed</p>
//               <p className="text-2xl font-semibold text-green-600">{stats.completed}</p>
//             </div>
//             <CheckCircle2 className="w-5 h-5 text-green-500" />
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4 flex items-center justify-between">
//             <div>
//               <p className="text-xs text-muted-foreground">Failed</p>
//               <p className="text-2xl font-semibold text-red-600">{stats.failed}</p>
//             </div>
//             <XCircle className="w-5 h-5 text-red-500" />
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4 flex items-center justify-between">
//             <div>
//               <p className="text-xs text-muted-foreground">Pending</p>
//               <p className="text-2xl font-semibold text-orange-600">{stats.pending}</p>
//             </div>
//             <Clock className="w-5 h-5 text-orange-500" />
//           </CardContent>
//         </Card>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle className="text-base">Job queue</CardTitle>
//           <CardDescription>Search, filter, and manage all automation jobs.</CardDescription>
//         </CardHeader>
//         <CardContent>
//           {/* Filters toolbar */}
//           <div className="flex flex-col gap-3 mb-4 md:flex-row md:flex-wrap md:items-end">
//             <div className="flex-1 min-w-[220px] space-y-2">
//               <Label htmlFor="job-search">Search</Label>
//               <div className="relative">
//                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
//                 <Input
//                   id="job-search"
//                   value={search}
//                   onChange={(e) => onSearchChange(e.target.value)}
//                   placeholder="Job name…"
//                   className="pl-9"
//                 />
//               </div>
//             </div>

//             <div className="w-full md:w-48 space-y-2">
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

//             {(search || statusFilter !== "all") && (
//               <Button
//                 type="button"
//                 variant="ghost"
//                 onClick={() => {
//                   setSearch("");
//                   setStatusFilter("all");
//                   setCurrentPage(1);
//                 }}
//               >
//                 Clear filters
//               </Button>
//             )}
//           </div>

//           {/* Loading skeleton (same pattern as Email Center) */}
//           {loading ? (
//             <div className="space-y-2">
//               {Array.from({ length: 5 }).map((_, i) => (
//                 <Skeleton key={i} className="h-14 w-full rounded-lg" />
//               ))}
//             </div>
//           ) : filteredRows.length === 0 ? (
//             <div className="flex flex-col items-center justify-center gap-2 py-14 text-center border border-dashed border-border rounded-lg">
//               <ListChecks className="w-8 h-8 text-muted-foreground" />
//               <p className="text-muted-foreground text-sm font-medium">No Automation Jobs Found</p>
//               <p className="text-muted-foreground text-xs">
//                 Automation jobs will appear here after workflows are executed.
//               </p>
//             </div>
//           ) : (
//             <>
//               {/* Desktop table */}
//               <div className="hidden md:block overflow-x-auto rounded-lg border border-border">
//                 <table className="w-full text-sm">
//                   <thead>
//                     <tr className="bg-muted/50 text-left text-muted-foreground">
//                       <th className="px-4 py-2 font-medium">Job Name</th>
//                       <th className="px-4 py-2 font-medium">Attempts</th>
//                       <th className="px-4 py-2 font-medium">Status</th>
//                       <th className="px-4 py-2 font-medium">Created At</th>
//                       <th className="px-4 py-2 font-medium">Last Run</th>
//                       <th className="px-4 py-2 font-medium">Duration</th>
//                       <th className="px-4 py-2 font-medium text-right">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {paginatedRows.map((row) => (
//                       <tr
//                         key={row.id}
//                         onClick={() => setSelectedJob(row)}
//                         className="border-t border-border hover:bg-muted/40 cursor-pointer transition-colors"
//                       >
//                         <td className="px-4 py-2 font-medium truncate max-w-[220px]">
//                           {safeString(row.job_type)}
//                         </td>
//                         <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">
//                           {safeString(row.attempts, "0")}
//                           {row.max_attempts != null ? ` / ${row.max_attempts}` : ""}
//                         </td>
//                         <td className="px-4 py-2">
//                           <JobStatusBadge status={row.status} />
//                         </td>
//                         <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
//                           {formatDateTime(row.created_at)}
//                         </td>
//                         <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
//                           {formatDateTime(row.started_at)}
//                         </td>
//                         <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
//                           {getDuration(row)}
//                         </td>
//                         <td className="px-4 py-2 text-right">
//                           <div className="flex items-center justify-end gap-2">
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 setSelectedJob(row);
//                               }}
//                             >
//                               <Eye className="w-3.5 h-3.5 mr-1" />
//                               View Logs
//                             </Button>
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               disabled={!RUN_NOW_API_AVAILABLE || actingId === row.id}
//                               title="Run API not implemented."
//                               onClick={(e) => handleRunNow(row, e)}
//                             >
//                               <PlayCircle className="w-3.5 h-3.5 mr-1" />
//                               Run Now
//                             </Button>
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               disabled={!RETRY_API_AVAILABLE || actingId === row.id}
//                               title="Retry API not implemented."
//                               onClick={(e) => handleRetry(row, e)}
//                             >
//                               <RotateCcw className="w-3.5 h-3.5 mr-1" />
//                               Retry
//                             </Button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Mobile cards */}
//               <div className="md:hidden space-y-3">
//                 {paginatedRows.map((row) => (
//                   <div
//                     key={row.id}
//                     onClick={() => setSelectedJob(row)}
//                     className="rounded-lg border border-border p-3 space-y-2 active:bg-muted/40"
//                   >
//                     <div className="flex items-start justify-between gap-2">
//                       <p className="font-medium truncate">{safeString(row.job_type)}</p>
//                       <JobStatusBadge status={row.status} />
//                     </div>
//                     <div className="flex items-center justify-between text-xs text-muted-foreground">
//                       <span>
//                         Attempts: {safeString(row.attempts, "0")}
//                         {row.max_attempts != null ? ` / ${row.max_attempts}` : ""}
//                       </span>
//                       <span>{getDuration(row)}</span>
//                     </div>
//                     <div className="flex items-center justify-between text-xs text-muted-foreground">
//                       <span>Created {formatDateTime(row.created_at)}</span>
//                       <span>Last run {formatDateTime(row.started_at)}</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         className="flex-1"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setSelectedJob(row);
//                         }}
//                       >
//                         <Eye className="w-3.5 h-3.5 mr-1" />
//                         Logs
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         className="flex-1"
//                         disabled={!RUN_NOW_API_AVAILABLE || actingId === row.id}
//                         title="Run API not implemented."
//                         onClick={(e) => handleRunNow(row, e)}
//                       >
//                         <PlayCircle className="w-3.5 h-3.5 mr-1" />
//                         Run
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         className="flex-1"
//                         disabled={!RETRY_API_AVAILABLE || actingId === row.id}
//                         title="Retry API not implemented."
//                         onClick={(e) => handleRetry(row, e)}
//                       >
//                         <RotateCcw className="w-3.5 h-3.5 mr-1" />
//                         Retry
//                       </Button>
//                     </div>
//                   </div>
//                 ))}
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

//       {/* View Logs dialog — every real field on the row */}
//       <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
//         <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Job Details</DialogTitle>
//             <DialogDescription>Full record for this automation job.</DialogDescription>
//           </DialogHeader>
//           {selectedJob && (
//             <div className="space-y-3 text-sm">
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Job Name</span>
//                 <span className="col-span-2 font-medium">{safeString(selectedJob.job_type)}</span>
//               </div>
//               <div className="grid grid-cols-3 gap-2 items-center">
//                 <span className="text-muted-foreground">Status</span>
//                 <span className="col-span-2">
//                   <JobStatusBadge status={selectedJob.status} />
//                 </span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Attempts</span>
//                 <span className="col-span-2 font-medium">
//                   {safeString(selectedJob.attempts, "0")}
//                   {selectedJob.max_attempts != null ? ` / ${selectedJob.max_attempts}` : ""}
//                 </span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Priority</span>
//                 <span className="col-span-2 font-medium">{safeString(selectedJob.priority)}</span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Scheduled At</span>
//                 <span className="col-span-2 font-medium">{formatDateTime(selectedJob.scheduled_at)}</span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Created Time</span>
//                 <span className="col-span-2 font-medium">{formatDateTime(selectedJob.created_at)}</span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Started Time</span>
//                 <span className="col-span-2 font-medium">{formatDateTime(selectedJob.started_at)}</span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Completed Time</span>
//                 <span className="col-span-2 font-medium">{formatDateTime(selectedJob.completed_at)}</span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Duration</span>
//                 <span className="col-span-2 font-medium">{getDuration(selectedJob)}</span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Idempotency Key</span>
//                 <span className="col-span-2 font-medium break-all">
//                   {safeString(selectedJob.idempotency_key)}
//                 </span>
//               </div>
//               {selectedJob.last_error && (
//                 <div className="grid grid-cols-3 gap-2">
//                   <span className="text-muted-foreground">Error Message</span>
//                   <span className="col-span-2 text-destructive break-words">
//                     {safeString(selectedJob.last_error)}
//                   </span>
//                 </div>
//               )}
//               <div className="space-y-1">
//                 <span className="text-muted-foreground">Raw JSON (payload)</span>
//                 <pre className="bg-muted/50 border border-border rounded-lg p-3 text-xs overflow-x-auto whitespace-pre-wrap break-all">
//                   {JSON.stringify(selectedJob.payload ?? null, null, 2)}
//                 </pre>
//               </div>

//               <div className="flex items-center gap-2 pt-2">
//                 <Button
//                   className="flex-1"
//                   variant="outline"
//                   disabled={!RUN_NOW_API_AVAILABLE}
//                   title="Run API not implemented."
//                   onClick={() => handleRunNow(selectedJob)}
//                 >
//                   <PlayCircle className="w-4 h-4 mr-2" />
//                   Run Now
//                 </Button>
//                 <Button
//                   className="flex-1"
//                   variant="outline"
//                   disabled={!RETRY_API_AVAILABLE}
//                   title="Retry API not implemented."
//                   onClick={() => handleRetry(selectedJob)}
//                 >
//                   <RotateCcw className="w-4 h-4 mr-2" />
//                   Retry
//                 </Button>
//               </div>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </AdminPage>
//   );
// }

// export default function WorkflowsModule() {
//   const { rows: events, loading: eLoading } = useAdminTable<Record<string, unknown>>("workflow_events");

//   return (
//     <div className="space-y-6">
//       <AutomationJobsSection />

//       {/* Workflow Events left untouched — out of scope for this upgrade */}
//       <AdminPage title="Workflow Events" description="Order lifecycle audit trail." loading={eLoading} empty={!events.length}>
//         <div className="space-y-2">
//           {events.map((e) => (
//             <div key={String(e.id)} className="border border-border rounded-lg p-4 text-sm">
//               <span className="font-medium">{String(e.event_type)}</span>
//               <span className="text-muted-foreground"> · {String(e.from_stage)} → {String(e.to_stage)}</span>
//               <p className="text-xs text-muted-foreground mt-1">{new Date(String(e.created_at)).toLocaleString()}</p>
//             </div>
//           ))}
//         </div>
//       </AdminPage>
//     </div>
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
import {
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  PlayCircle,
  RotateCcw,
  Eye,
  ListChecks,
  Clock,
  CheckCircle2,
  XCircle,
  Timer,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { statusBadge } from "./logHelpers";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

interface AutomationJobRow {
  id: string;
  job_type?: string | null;
  payload?: unknown;
  status?: string | null;
  priority?: number | null;
  attempts?: number | null;
  max_attempts?: number | null;
  scheduled_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  last_error?: string | null;
  idempotency_key?: string | null;
  created_at?: string | null;
  [key: string]: unknown;
}

// Real enum values on automation_jobs.status (automation_job_status):
// pending | processing | completed | failed | dead_letter
type StatusFilter = "all" | "pending" | "processing" | "completed" | "failed" | "dead_letter";

const PAGE_SIZE = 10;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Running" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "dead_letter", label: "Dead Letter" },
];

// ------------------------------------------------------------------
// Backend availability flags
// ------------------------------------------------------------------
// No run-now / retry backend action exists anywhere in the project for
// automation_jobs today. Flip these to true and wire the real call
// (e.g. a supabase.functions.invoke(...) or RPC) once one exists.
const RUN_NOW_API_AVAILABLE = false;
const RETRY_API_AVAILABLE = false;

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

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

function formatDuration(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

// duration isn't a stored column — derived from started_at/completed_at.
// Still "processing" jobs show elapsed time so far.
function getDuration(row: AutomationJobRow): string {
  if (!row.started_at) return "—";
  const start = new Date(row.started_at).getTime();
  if (Number.isNaN(start)) return "—";
  const end = row.completed_at ? new Date(row.completed_at).getTime() : Date.now();
  if (Number.isNaN(end)) return "—";
  return formatDuration(end - start);
}

function JobStatusBadge({ status }: { status: unknown }) {
  const s = String(status ?? "").toLowerCase();
  if (s === "completed") {
    return (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border border-green-200">
        Completed
      </Badge>
    );
  }
  if (s === "processing") {
    return (
      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border border-blue-200">
        Running
      </Badge>
    );
  }
  if (s === "pending") {
    return (
      <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border border-orange-200">
        Pending
      </Badge>
    );
  }
  if (s === "failed") {
    return (
      <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border border-red-200">
        Failed
      </Badge>
    );
  }
  if (s === "dead_letter") {
    return (
      <Badge className="bg-slate-200 text-slate-800 hover:bg-slate-200 border border-slate-300">
        Dead Letter
      </Badge>
    );
  }
  return <Badge variant="outline">{safeString(status, "Unknown")}</Badge>;
}

// Small dot-strip next to the "1/5" text so jobs close to their retry
// limit are scannable at a glance without reading the numbers.
function AttemptsIndicator({
  attempts,
  maxAttempts,
}: {
  attempts: number;
  maxAttempts?: number | null;
}) {
  const label = `${attempts}${maxAttempts != null ? ` / ${maxAttempts}` : ""}`;

  if (!maxAttempts || maxAttempts <= 0) {
    return <span className="whitespace-nowrap">{label}</span>;
  }

  const ratio = attempts / maxAttempts;
  const dotColor =
    ratio >= 1 ? "bg-red-500" : ratio >= 0.6 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <span className="tabular-nums">{label}</span>
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: maxAttempts }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              i < attempts ? dotColor : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  );
}

// Lightweight JSON syntax highlighter — no dependency needed for a small
// payload preview. Keys, strings, numbers, and booleans each get a color.
function highlightJson(json: string): string {
  const escaped = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "text-blue-600 dark:text-blue-400"; // number
      if (/^"/.test(match)) {
        cls = /:$/.test(match)
          ? "text-slate-500 dark:text-slate-400 font-medium" // key
          : "text-emerald-600 dark:text-emerald-400"; // string value
      } else if (/^(true|false)$/.test(match)) {
        cls = "text-purple-600 dark:text-purple-400";
      } else if (match === "null") {
        cls = "text-muted-foreground";
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

// Collapsed-by-default raw payload viewer with a copy button and
// syntax highlighting, so it stops looking like a raw debug dump.
function JsonPayloadViewer({ payload }: { payload: unknown }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const jsonString = useMemo(() => JSON.stringify(payload ?? null, null, 2), [payload]);
  const highlighted = useMemo(() => highlightJson(jsonString), [jsonString]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      toast.success("Payload copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy payload");
    }
  };

  return (
    <div className="space-y-1.5 pt-2 border-t border-border">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs font-medium uppercase tracking-wide"
      >
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
        Raw JSON (payload)
      </button>

      {expanded && (
        <div className="relative">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="absolute top-1.5 right-1.5 h-7 px-2 text-xs"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="w-3 h-3 mr-1" />
            ) : (
              <Copy className="w-3 h-3 mr-1" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
          <pre className="bg-muted/50 border border-border rounded-lg p-3 pt-9 text-xs overflow-x-auto whitespace-pre-wrap break-all font-mono">
            <code dangerouslySetInnerHTML={{ __html: highlighted }} />
          </pre>
        </div>
      )}
    </div>
  );
}

// Minimal stat card — no icon. A thin left accent border carries the status
// color instead, and the value itself is tinted to match. Reads clean and
// typographic rather than icon-heavy.
type StatTone = "neutral" | "blue" | "green" | "red" | "orange";

const STAT_TONE_STYLES: Record<StatTone, { accent: string; value: string }> = {
  neutral: { accent: "border-l-slate-300 dark:border-l-slate-600", value: "text-foreground" },
  blue: { accent: "border-l-blue-500", value: "text-blue-600 dark:text-blue-400" },
  green: { accent: "border-l-green-500", value: "text-green-600 dark:text-green-400" },
  red: { accent: "border-l-red-500", value: "text-red-600 dark:text-red-400" },
  orange: { accent: "border-l-orange-500", value: "text-orange-600 dark:text-orange-400" },
};

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: StatTone;
}) {
  const t = STAT_TONE_STYLES[tone];
  return (
    <Card className={cn("border-l-4", t.accent)}>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("text-2xl font-semibold leading-tight tabular-nums mt-1", t.value)}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

// Small field row used inside the grouped Job Details sections.
function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2 items-center">
      <span className="text-muted-foreground">{label}</span>
      <span className="col-span-2 font-medium">{children}</span>
    </div>
  );
}

function DetailSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-1">
      {children}
    </p>
  );
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

function AutomationJobsSection() {
  const { rows, loading, reload } = useAdminTable<Record<string, unknown>>("automation_jobs");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<AutomationJobRow | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);

  const typedRows = rows as AutomationJobRow[];

  // useAdminTable already orders by created_at descending by default —
  // newest-first requirement is already satisfied by the hook call.

  const stats = useMemo(() => {
    const total = typedRows.length;
    let pending = 0;
    let processing = 0;
    let completed = 0;
    let failed = 0;
    for (const r of typedRows) {
      const s = String(r.status ?? "").toLowerCase();
      if (s === "pending") pending++;
      else if (s === "processing") processing++;
      else if (s === "completed") completed++;
      else if (s === "failed" || s === "dead_letter") failed++; // dead_letter counted as a failure for the summary card
    }
    return { total, pending, processing, completed, failed };
  }, [typedRows]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return typedRows.filter((row) => {
      if (q) {
        const haystack = String(row.job_type ?? "").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (statusFilter !== "all") {
        if (String(row.status ?? "").toLowerCase() !== statusFilter) return false;
      }
      return true;
    });
  }, [typedRows, search, statusFilter]);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await reload();
    } finally {
      setRefreshing(false);
    }
  };

  // Safety nets only — both buttons are disabled in the UI since no
  // run-now / retry backend exists yet for automation_jobs.
  const handleRunNow = async (row: AutomationJobRow, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!RUN_NOW_API_AVAILABLE) return;
    setActingId(row.id);
    try {
      // await supabase.functions.invoke("run-automation-job", { body: { id: row.id } });
      await reload();
    } finally {
      setActingId(null);
    }
  };

  const handleRetry = async (row: AutomationJobRow, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!RETRY_API_AVAILABLE) return;
    setActingId(row.id);
    try {
      // await supabase.functions.invoke("retry-automation-job", { body: { id: row.id } });
      await reload();
    } finally {
      setActingId(null);
    }
  };

  const isFailedState = (row: AutomationJobRow) => {
    const s = String(row.status ?? "").toLowerCase();
    return s === "failed" || s === "dead_letter";
  };

  return (
    <AdminPage
      title="Automation Jobs"
      description="Queue-based workflow processor (serverless)."
      loading={false}
      empty={false}
      actions={
        <Button size="sm" variant="outline" onClick={handleRefresh} disabled={refreshing || loading}>
          {refreshing || loading ? (
            <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5 mr-2" />
          )}
          Refresh
        </Button>
      }
    >
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total Jobs" value={stats.total} tone="neutral" />
        <StatCard label="Running" value={stats.processing} tone="blue" />
        <StatCard label="Completed" value={stats.completed} tone="green" />
        <StatCard label="Failed" value={stats.failed} tone="red" />
        <StatCard label="Pending" value={stats.pending} tone="orange" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Job queue</CardTitle>
          <CardDescription>Search, filter, and manage all automation jobs.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters toolbar */}
          <div className="flex flex-col gap-3 mb-4 md:flex-row md:flex-wrap md:items-end">
            <div className="flex-1 min-w-[220px] space-y-2">
              <Label htmlFor="job-search">Search</Label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="job-search"
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Job name…"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="w-full md:w-48 space-y-2">
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

            {(search || statusFilter !== "all") && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}
              >
                Clear filters
              </Button>
            )}
          </div>

          {/* Loading skeleton (same pattern as Email Center) */}
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-14 text-center border border-dashed border-border rounded-lg">
              <ListChecks className="w-8 h-8 text-muted-foreground" />
              <p className="text-muted-foreground text-sm font-medium">No Automation Jobs Found</p>
              <p className="text-muted-foreground text-xs">
                Automation jobs will appear here after workflows are executed.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-left text-muted-foreground">
                      <th className="px-4 py-2 font-medium">Job Name</th>
                      <th className="px-4 py-2 font-medium">Attempts</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                      <th className="px-4 py-2 font-medium">Created At</th>
                      <th className="px-4 py-2 font-medium">Last Run</th>
                      <th className="px-4 py-2 font-medium">Duration</th>
                      <th className="px-4 py-2 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedJob(row)}
                        className="border-t border-border hover:bg-muted/40 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-2 font-medium truncate max-w-[220px]">
                          {safeString(row.job_type)}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">
                          <AttemptsIndicator
                            attempts={Number(row.attempts ?? 0)}
                            maxAttempts={row.max_attempts != null ? Number(row.max_attempts) : null}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <JobStatusBadge status={row.status} />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
                          {formatDateTime(row.created_at)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
                          {formatDateTime(row.started_at)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
                          {getDuration(row)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedJob(row);
                              }}
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              View Logs
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!RUN_NOW_API_AVAILABLE || actingId === row.id}
                              title="Run API not implemented."
                              onClick={(e) => handleRunNow(row, e)}
                            >
                              <PlayCircle className="w-3.5 h-3.5 mr-1" />
                              Run Now
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!RETRY_API_AVAILABLE || actingId === row.id}
                              title="Retry API not implemented."
                              onClick={(e) => handleRetry(row, e)}
                            >
                              <RotateCcw className="w-3.5 h-3.5 mr-1" />
                              Retry
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {paginatedRows.map((row) => (
                  <div
                    key={row.id}
                    onClick={() => setSelectedJob(row)}
                    className="rounded-lg border border-border p-3 space-y-2 active:bg-muted/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium truncate">{safeString(row.job_type)}</p>
                      <JobStatusBadge status={row.status} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <AttemptsIndicator
                        attempts={Number(row.attempts ?? 0)}
                        maxAttempts={row.max_attempts != null ? Number(row.max_attempts) : null}
                      />
                      <span>{getDuration(row)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Created {formatDateTime(row.created_at)}</span>
                      <span>Last run {formatDateTime(row.started_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedJob(row);
                        }}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Logs
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        disabled={!RUN_NOW_API_AVAILABLE || actingId === row.id}
                        title="Run API not implemented."
                        onClick={(e) => handleRunNow(row, e)}
                      >
                        <PlayCircle className="w-3.5 h-3.5 mr-1" />
                        Run
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        disabled={!RETRY_API_AVAILABLE || actingId === row.id}
                        title="Retry API not implemented."
                        onClick={(e) => handleRetry(row, e)}
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        Retry
                      </Button>
                    </div>
                  </div>
                ))}
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

      {/* View Logs dialog — every real field on the row, grouped so it
          reads as a document instead of a flat data dump. */}
      <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
            <DialogDescription>Full record for this automation job.</DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-3 text-sm">
              {/* Overview */}
              <DetailSectionLabel>Overview</DetailSectionLabel>
              <DetailRow label="Job Name">{safeString(selectedJob.job_type)}</DetailRow>
              <DetailRow label="Status">
                <JobStatusBadge status={selectedJob.status} />
              </DetailRow>
              <DetailRow label="Attempts">
                <AttemptsIndicator
                  attempts={Number(selectedJob.attempts ?? 0)}
                  maxAttempts={
                    selectedJob.max_attempts != null ? Number(selectedJob.max_attempts) : null
                  }
                />
              </DetailRow>
              <DetailRow label="Priority">{safeString(selectedJob.priority)}</DetailRow>
              {selectedJob.last_error && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">Error Message</span>
                  <span className="col-span-2 text-destructive break-words">
                    {safeString(selectedJob.last_error)}
                  </span>
                </div>
              )}

              {/* Timing */}
              <DetailSectionLabel>Timing</DetailSectionLabel>
              <DetailRow label="Scheduled At">{formatDateTime(selectedJob.scheduled_at)}</DetailRow>
              <DetailRow label="Created Time">{formatDateTime(selectedJob.created_at)}</DetailRow>
              <DetailRow label="Started Time">{formatDateTime(selectedJob.started_at)}</DetailRow>
              <DetailRow label="Completed Time">{formatDateTime(selectedJob.completed_at)}</DetailRow>
              <DetailRow label="Duration">{getDuration(selectedJob)}</DetailRow>

              {/* Technical details */}
              <DetailSectionLabel>Technical Details</DetailSectionLabel>
              <DetailRow label="Idempotency Key">
                <span className="break-all">{safeString(selectedJob.idempotency_key)}</span>
              </DetailRow>
              <JsonPayloadViewer payload={selectedJob.payload} />

              <div className="flex items-center gap-2 pt-2">
                <Button
                  className="flex-1"
                  variant="outline"
                  disabled={!RUN_NOW_API_AVAILABLE}
                  title="Run API not implemented."
                  onClick={() => handleRunNow(selectedJob)}
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Run Now
                </Button>
                <Button
                  className="flex-1"
                  variant="outline"
                  disabled={!RETRY_API_AVAILABLE}
                  title="Retry API not implemented."
                  onClick={() => handleRetry(selectedJob)}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}

export default function WorkflowsModule() {
  const { rows: events, loading: eLoading } = useAdminTable<Record<string, unknown>>("workflow_events");

  return (
    <div className="space-y-6">
      <AutomationJobsSection />

      {/* Workflow Events left untouched — out of scope for this upgrade */}
      <AdminPage title="Workflow Events" description="Order lifecycle audit trail." loading={eLoading} empty={!events.length}>
        <div className="space-y-2">
          {events.map((e) => (
            <div key={String(e.id)} className="border border-border rounded-lg p-4 text-sm">
              <span className="font-medium">{String(e.event_type)}</span>
              <span className="text-muted-foreground"> · {String(e.from_stage)} → {String(e.to_stage)}</span>
              <p className="text-xs text-muted-foreground mt-1">{new Date(String(e.created_at)).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </AdminPage>
    </div>
  );
}