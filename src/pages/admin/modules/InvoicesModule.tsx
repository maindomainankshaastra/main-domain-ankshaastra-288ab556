// import { useMemo, useState } from "react";
// import { AdminPage } from "@/components/admin/AdminPage";
// import { useAdminTable } from "@/hooks/useAdminData";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Download, FileArchive, Loader2 } from "lucide-react";
// import { downloadMonthlyInvoiceZip, fetchInvoiceDownloadUrl } from "@/lib/invoice-download";
// import { CONNECTED_SITE_OPTIONS } from "@/lib/connected-sites";
// import { toast } from "sonner";

// type Invoice = {
//   id: string;
//   invoice_number: string;
//   customer_name: string;
//   service_title: string;
//   total_amount: number;
//   status: string;
//   source_website?: string;
//   pdf_url?: string;
//   pdf_storage_path?: string | null;
//   invoice_date: string;
// };

// const MONTHS = [
//   "January", "February", "March", "April", "May", "June",
//   "July", "August", "September", "October", "November", "December",
// ];

// export default function InvoicesModule() {
//   const { rows, loading } = useAdminTable<Invoice>("invoices", "invoice_date");
//   const [downloadingId, setDownloadingId] = useState<string | null>(null);
//   const [bulkLoading, setBulkLoading] = useState(false);
//   const [bulkProgress, setBulkProgress] = useState<string | null>(null);

//   const now = new Date();
//   const [bulkYear, setBulkYear] = useState(String(now.getFullYear()));
//   const [bulkMonth, setBulkMonth] = useState(String(now.getMonth() + 1));
//   const [siteFilter, setSiteFilter] = useState("all");

//   const filteredRows = useMemo(() => {
//     if (siteFilter === "all") return rows;
//     return rows.filter((i) => (i.source_website || "ankshaastra.com") === siteFilter);
//   }, [rows, siteFilter]);

//   const yearOptions = useMemo(() => {
//     const current = now.getFullYear();
//     return Array.from({ length: 5 }, (_, i) => String(current - i));
//   }, [now]);

//   const downloadInvoice = async (inv: Invoice) => {
//     setDownloadingId(inv.id);
//     try {
//       const url = (await fetchInvoiceDownloadUrl(inv.id)) || inv.pdf_url;
//       if (!url) {
//         toast.error("Invoice PDF is not available yet.");
//         return;
//       }
//       window.open(url, "_blank", "noopener,noreferrer");
//     } catch {
//       toast.error("Could not download invoice");
//     } finally {
//       setDownloadingId(null);
//     }
//   };

//   const downloadMonthlyBundle = async () => {
//     setBulkLoading(true);
//     setBulkProgress("Preparing…");
//     try {
//       const result = await downloadMonthlyInvoiceZip(Number(bulkYear), Number(bulkMonth), (p) => {
//         if (p.phase === "listing") {
//           setBulkProgress("Loading invoice list…");
//         } else if (p.phase === "downloading") {
//           setBulkProgress(`Downloading PDFs ${p.done}/${p.total}…`);
//         } else {
//           setBulkProgress("Creating ZIP file…");
//         }
//       });
//       const monthLabel = MONTHS[Number(bulkMonth) - 1];
//       toast.success(
//         `Downloaded ${result.included} invoice${result.included === 1 ? "" : "s"} for ${monthLabel} ${bulkYear}` +
//           (result.skipped ? ` (${result.skipped} skipped)` : ""),
//       );
//     } catch (e) {
//       toast.error(e instanceof Error ? e.message : "Bulk download failed");
//     } finally {
//       setBulkLoading(false);
//       setBulkProgress(null);
//     }
//   };

//   const bulkActions = (
//     <div className="flex flex-wrap items-center gap-2">
//       <Select value={bulkMonth} onValueChange={setBulkMonth}>
//         <SelectTrigger className="w-[140px]">
//           <SelectValue placeholder="Month" />
//         </SelectTrigger>
//         <SelectContent>
//           {MONTHS.map((label, index) => (
//             <SelectItem key={label} value={String(index + 1)}>
//               {label}
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>
//       <Select value={bulkYear} onValueChange={setBulkYear}>
//         <SelectTrigger className="w-[100px]">
//           <SelectValue placeholder="Year" />
//         </SelectTrigger>
//         <SelectContent>
//           {yearOptions.map((year) => (
//             <SelectItem key={year} value={year}>
//               {year}
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>
//       <Button size="sm" disabled={bulkLoading} onClick={() => void downloadMonthlyBundle()}>
//         {bulkLoading ? (
//           <Loader2 className="w-4 h-4 animate-spin mr-2" />
//         ) : (
//           <FileArchive className="w-4 h-4 mr-2" />
//         )}
//         {bulkProgress || "Download ZIP"}
//       </Button>
//     </div>
//   );

//   return (
//     <AdminPage
//       title="Invoice Manager"
//       description="GST invoices stored in Supabase — download PDFs individually or as a monthly ZIP bundle."
//       loading={loading}
//       empty={!filteredRows.length}
//       emptyMessage="No invoices yet. You can still download a monthly ZIP if PDFs exist for that period."
//       actions={bulkActions}
//     >
//       <div className="mb-4 flex items-center gap-3">
//         <span className="text-sm text-muted-foreground">Filter by site</span>
//         <Select value={siteFilter} onValueChange={setSiteFilter}>
//           <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
//           <SelectContent>
//             {CONNECTED_SITE_OPTIONS.map((opt) => (
//               <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>
//       <div className="space-y-2">
//         {filteredRows.map((i) => (
//           <div key={i.id} className="flex flex-wrap justify-between gap-3 border border-border rounded-lg p-4">
//             <div>
//               <p className="font-semibold text-primary">{i.invoice_number}</p>
//               <p className="text-sm text-muted-foreground">{i.customer_name} · {i.service_title}</p>
//               <p className="text-xs text-muted-foreground mt-1">{i.source_website} · {new Date(i.invoice_date).toLocaleDateString()}</p>
//             </div>
//             <div className="flex items-center gap-3">
//               <span className="font-semibold">₹{Number(i.total_amount).toLocaleString()}</span>
//               <Badge>{i.status}</Badge>
//               {(i.pdf_storage_path || i.pdf_url) && (
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   disabled={downloadingId === i.id}
//                   onClick={() => downloadInvoice(i)}
//                 >
//                   {downloadingId === i.id ? (
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                   ) : (
//                     <Download className="w-4 h-4" />
//                   )}
//                 </Button>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>
//     </AdminPage>
//   );
// }


// import { useMemo, useState } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import { AdminPage } from "@/components/admin/AdminPage";
// import { useAdminTable } from "@/hooks/useAdminData";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { Download, FileArchive, Loader2, Eye, Trash2 } from "lucide-react";
// import { downloadMonthlyInvoiceZip, fetchInvoiceDownloadUrl } from "@/lib/invoice-download";
// import { CONNECTED_SITE_OPTIONS } from "@/lib/connected-sites";
// import { toast } from "sonner";

// type Invoice = {
//   id: string;
//   invoice_number: string;
//   customer_name: string;
//   service_title: string;
//   total_amount: number;
//   status: string;
//   source_website?: string;
//   pdf_url?: string;
//   pdf_storage_path?: string | null;
//   invoice_date: string;
//   // Optional fields — present only if these columns exist in your
//   // Supabase "invoices" table. Rendered as "—" when undefined.
//   customer_email?: string;
//   customer_address?: string;
//   gst_number?: string;
//   gst_amount?: number;
//   payment_status?: string;
//   created_at?: string;
// };

// const MONTHS = [
//   "January", "February", "March", "April", "May", "June",
//   "July", "August", "September", "October", "November", "December",
// ];

// const PAGE_SIZE = 10;

// export default function InvoicesModule() {
//   const { rows, loading, reload } = useAdminTable<Invoice>("invoices", "invoice_date");
//   const [downloadingId, setDownloadingId] = useState<string | null>(null);
//   const [bulkLoading, setBulkLoading] = useState(false);
//   const [bulkProgress, setBulkProgress] = useState<string | null>(null);

//   const now = new Date();
//   const [bulkYear, setBulkYear] = useState(String(now.getFullYear()));
//   const [bulkMonth, setBulkMonth] = useState(String(now.getMonth() + 1));
//   const [siteFilter, setSiteFilter] = useState("all");

//   // New: search + filters
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [monthFilter, setMonthFilter] = useState("all");
//   const [yearFilter, setYearFilter] = useState("all");
//   const [dateFrom, setDateFrom] = useState("");
//   const [dateTo, setDateTo] = useState("");

//   // View dialog state
//   const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

//   // Delete dialog state
//   const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null);
//   const [deleting, setDeleting] = useState(false);

//   // Pagination state
//   const [page, setPage] = useState(1);

//   const yearOptions = useMemo(() => {
//     const current = now.getFullYear();
//     return Array.from({ length: 5 }, (_, i) => String(current - i));
//   }, [now]);

//   const statusOptions = useMemo(() => {
//     const unique = Array.from(new Set(rows.map((i) => i.status).filter(Boolean)));
//     return unique;
//   }, [rows]);

//   const filteredRows = useMemo(() => {
//     let data = rows;

//     if (siteFilter !== "all") {
//       data = data.filter((i) => (i.source_website || "ankshaastra.com") === siteFilter);
//     }

//     if (statusFilter !== "all") {
//       data = data.filter((i) => i.status === statusFilter);
//     }

//     if (monthFilter !== "all") {
//       data = data.filter((i) => {
//         const d = new Date(i.invoice_date);
//         return String(d.getMonth() + 1) === monthFilter;
//       });
//     }

//     if (yearFilter !== "all") {
//       data = data.filter((i) => {
//         const d = new Date(i.invoice_date);
//         return String(d.getFullYear()) === yearFilter;
//       });
//     }

//     if (dateFrom) {
//       const from = new Date(dateFrom);
//       data = data.filter((i) => new Date(i.invoice_date) >= from);
//     }

//     if (dateTo) {
//       const to = new Date(dateTo);
//       to.setHours(23, 59, 59, 999);
//       data = data.filter((i) => new Date(i.invoice_date) <= to);
//     }

//     if (search.trim()) {
//       const q = search.toLowerCase();
//       data = data.filter(
//         (i) =>
//           (i.invoice_number || "").toLowerCase().includes(q) ||
//           (i.customer_name || "").toLowerCase().includes(q) ||
//           (i.customer_email || "").toLowerCase().includes(q) ||
//           (i.service_title || "").toLowerCase().includes(q)
//       );
//     }

//     return data;
//   }, [rows, siteFilter, statusFilter, monthFilter, yearFilter, dateFrom, dateTo, search]);

//   // Reset to page 1 whenever filters/search change the result set
//   useMemo(() => {
//     setPage(1);
//   }, [siteFilter, statusFilter, monthFilter, yearFilter, dateFrom, dateTo, search]);

//   const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));

//   const paginatedRows = useMemo(() => {
//     const start = (page - 1) * PAGE_SIZE;
//     return filteredRows.slice(start, start + PAGE_SIZE);
//   }, [filteredRows, page]);

//   const goToPreviousPage = () => setPage((p) => Math.max(1, p - 1));
//   const goToNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

//   const downloadInvoice = async (inv: Invoice) => {
//     setDownloadingId(inv.id);
//     try {
//       const url = (await fetchInvoiceDownloadUrl(inv.id)) || inv.pdf_url;
//       if (!url) {
//         toast.error("Invoice PDF is not available yet.");
//         return;
//       }
//       window.open(url, "_blank", "noopener,noreferrer");
//     } catch {
//       toast.error("Could not download invoice");
//     } finally {
//       setDownloadingId(null);
//     }
//   };

//   const downloadMonthlyBundle = async () => {
//     setBulkLoading(true);
//     setBulkProgress("Preparing…");
//     try {
//       const result = await downloadMonthlyInvoiceZip(Number(bulkYear), Number(bulkMonth), (p) => {
//         if (p.phase === "listing") {
//           setBulkProgress("Loading invoice list…");
//         } else if (p.phase === "downloading") {
//           setBulkProgress(`Downloading PDFs ${p.done}/${p.total}…`);
//         } else {
//           setBulkProgress("Creating ZIP file…");
//         }
//       });
//       const monthLabel = MONTHS[Number(bulkMonth) - 1];
//       toast.success(
//         `Downloaded ${result.included} invoice${result.included === 1 ? "" : "s"} for ${monthLabel} ${bulkYear}` +
//           (result.skipped ? ` (${result.skipped} skipped)` : ""),
//       );
//     } catch (e) {
//       toast.error(e instanceof Error ? e.message : "Bulk download failed");
//     } finally {
//       setBulkLoading(false);
//       setBulkProgress(null);
//     }
//   };

//   const confirmDeleteInvoice = async () => {
//     if (!deleteInvoiceId) return;
//     setDeleting(true);
//     try {
//       // Safety net: delete dependent rows first in case a FK
//       // constraint exists (e.g. email_logs.invoice_id -> invoices.id).
//       // Ideally this should be ON DELETE CASCADE at the DB level.
//       const { error: emailLogsError } = await supabase
//         .from("email_logs")
//         .delete()
//         .eq("invoice_id", deleteInvoiceId);

//       if (emailLogsError && emailLogsError.code !== "42703") {
//         // 42703 = column does not exist, meaning there's no such FK — safe to ignore.
//         toast.error(emailLogsError.message || "Failed to delete related email logs");
//         return;
//       }

//       const { error } = await supabase.from("invoices").delete().eq("id", deleteInvoiceId);
//       if (error) {
//         toast.error(error.message || "Failed to delete invoice");
//       } else {
//         toast.success("Invoice deleted successfully");
//         reload();
//       }
//     } catch (e: unknown) {
//       toast.error(e instanceof Error ? e.message : "Failed to delete invoice");
//     } finally {
//       setDeleting(false);
//       setDeleteInvoiceId(null);
//     }
//   };

//   const bulkActions = (
//     <div className="flex flex-wrap items-center gap-2">
//       <Select value={bulkMonth} onValueChange={setBulkMonth}>
//         <SelectTrigger className="w-[140px]">
//           <SelectValue placeholder="Month" />
//         </SelectTrigger>
//         <SelectContent>
//           {MONTHS.map((label, index) => (
//             <SelectItem key={label} value={String(index + 1)}>
//               {label}
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>
//       <Select value={bulkYear} onValueChange={setBulkYear}>
//         <SelectTrigger className="w-[100px]">
//           <SelectValue placeholder="Year" />
//         </SelectTrigger>
//         <SelectContent>
//           {yearOptions.map((year) => (
//             <SelectItem key={year} value={year}>
//               {year}
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>
//       <Button size="sm" disabled={bulkLoading} onClick={() => void downloadMonthlyBundle()}>
//         {bulkLoading ? (
//           <Loader2 className="w-4 h-4 animate-spin mr-2" />
//         ) : (
//           <FileArchive className="w-4 h-4 mr-2" />
//         )}
//         {bulkProgress || "Download ZIP"}
//       </Button>
//     </div>
//   );

//   return (
//     <AdminPage
//       title="Invoice Manager"
//       description="GST invoices stored in Supabase — download PDFs individually or as a monthly ZIP bundle."
//       loading={loading}
//       empty={!filteredRows.length}
//       emptyMessage="No invoices yet. You can still download a monthly ZIP if PDFs exist for that period."
//       actions={bulkActions}
//     >
//       {/* Search */}
//       <div className="mb-3">
//         <Input
//           placeholder="Search by invoice number, customer, email or service..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="w-full max-w-md"
//         />
//       </div>

//       {/* Filters */}
//       <div className="mb-4 flex flex-wrap items-center gap-3">
//         <Select value={siteFilter} onValueChange={setSiteFilter}>
//           <SelectTrigger className="w-[200px]"><SelectValue placeholder="All sites" /></SelectTrigger>
//           <SelectContent>
//             {CONNECTED_SITE_OPTIONS.map((opt) => (
//               <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
//             ))}
//           </SelectContent>
//         </Select>

//         <Select value={statusFilter} onValueChange={setStatusFilter}>
//           <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All statuses</SelectItem>
//             {statusOptions.map((s) => (
//               <SelectItem key={s} value={s}>{s}</SelectItem>
//             ))}
//           </SelectContent>
//         </Select>

//         <Select value={monthFilter} onValueChange={setMonthFilter}>
//           <SelectTrigger className="w-[140px]"><SelectValue placeholder="Month" /></SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All months</SelectItem>
//             {MONTHS.map((label, index) => (
//               <SelectItem key={label} value={String(index + 1)}>{label}</SelectItem>
//             ))}
//           </SelectContent>
//         </Select>

//         <Select value={yearFilter} onValueChange={setYearFilter}>
//           <SelectTrigger className="w-[110px]"><SelectValue placeholder="Year" /></SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All years</SelectItem>
//             {yearOptions.map((year) => (
//               <SelectItem key={year} value={year}>{year}</SelectItem>
//             ))}
//           </SelectContent>
//         </Select>

//         <div className="flex items-center gap-2">
//           <Input
//             type="date"
//             value={dateFrom}
//             onChange={(e) => setDateFrom(e.target.value)}
//             className="w-[150px]"
//           />
//           <span className="text-xs text-muted-foreground">to</span>
//           <Input
//             type="date"
//             value={dateTo}
//             onChange={(e) => setDateTo(e.target.value)}
//             className="w-[150px]"
//           />
//         </div>

//         {(siteFilter !== "all" || statusFilter !== "all" || monthFilter !== "all" || yearFilter !== "all" || dateFrom || dateTo || search) && (
//           <Button
//             size="sm"
//             variant="ghost"
//             onClick={() => {
//               setSiteFilter("all");
//               setStatusFilter("all");
//               setMonthFilter("all");
//               setYearFilter("all");
//               setDateFrom("");
//               setDateTo("");
//               setSearch("");
//             }}
//           >
//             Clear filters
//           </Button>
//         )}
//       </div>

//       {/* Invoice listing — multi-domain, each with website name visible */}
//       <div className="space-y-2">
//         {paginatedRows.map((i) => (
//           <div key={i.id} className="flex flex-wrap justify-between gap-3 border border-border rounded-lg p-4">
//             <div>
//               <div className="flex items-center gap-2 mb-1">
//                 <Badge variant="outline" className="text-xs">
//                   {i.source_website || "ankshaastra.com"}
//                 </Badge>
//                 <p className="font-semibold text-primary">{i.invoice_number}</p>
//               </div>
//               <p className="text-sm text-muted-foreground">{i.customer_name} · {i.service_title}</p>
//               <p className="text-xs text-muted-foreground mt-1">{new Date(i.invoice_date).toLocaleDateString()}</p>
//             </div>
//             <div className="flex items-center gap-3">
//               <span className="font-semibold">₹{Number(i.total_amount).toLocaleString()}</span>
//               <Badge>{i.status}</Badge>
//               {(i.pdf_storage_path || i.pdf_url) && (
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   disabled={downloadingId === i.id}
//                   onClick={() => downloadInvoice(i)}
//                 >
//                   {downloadingId === i.id ? (
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                   ) : (
//                     <Download className="w-4 h-4" />
//                   )}
//                 </Button>
//               )}
//               <Button size="sm" variant="outline" onClick={() => setViewInvoice(i)}>
//                 <Eye className="w-4 h-4 mr-1" />
//                 View
//               </Button>
//               <Button size="sm" variant="destructive" onClick={() => setDeleteInvoiceId(i.id)}>
//                 <Trash2 className="w-4 h-4 mr-1" />
//                 Delete
//               </Button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Pagination controls */}
//       {filteredRows.length > 0 && (
//         <div className="mt-4 flex items-center justify-between">
//           <p className="text-xs text-muted-foreground">
//             Page {page} of {totalPages} · {filteredRows.length} invoices
//           </p>
//           <div className="flex items-center gap-2">
//             <Button size="sm" variant="outline" onClick={goToPreviousPage} disabled={page <= 1}>
//               Previous
//             </Button>
//             <Button size="sm" variant="outline" onClick={goToNextPage} disabled={page >= totalPages}>
//               Next
//             </Button>
//           </div>
//         </div>
//       )}

//       {/* View Invoice Dialog */}
//       <Dialog open={!!viewInvoice} onOpenChange={(open) => !open && setViewInvoice(null)}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Invoice Details</DialogTitle>
//             <DialogDescription>Full details for this invoice.</DialogDescription>
//           </DialogHeader>
//           {viewInvoice && (
//             <div className="space-y-2 text-sm max-h-[70vh] overflow-y-auto pr-1">
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Invoice Number</span>
//                 <span className="font-medium">{viewInvoice.invoice_number}</span>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Customer Name</span>
//                 <span className="font-medium">{viewInvoice.customer_name}</span>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Email</span>
//                 <span className="font-medium">{viewInvoice.customer_email || "—"}</span>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Address</span>
//                 <span className="font-medium text-right">{viewInvoice.customer_address || "—"}</span>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">GST Number</span>
//                 <span className="font-medium">{viewInvoice.gst_number || "—"}</span>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Service</span>
//                 <span className="font-medium text-right">{viewInvoice.service_title}</span>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Amount</span>
//                 <span className="font-medium">₹{Number(viewInvoice.total_amount).toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">GST Amount</span>
//                 <span className="font-medium">
//                   {viewInvoice.gst_amount != null ? `₹${Number(viewInvoice.gst_amount).toLocaleString()}` : "—"}
//                 </span>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Total</span>
//                 <span className="font-medium">
//                   ₹{(Number(viewInvoice.total_amount) + Number(viewInvoice.gst_amount || 0)).toLocaleString()}
//                 </span>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Status</span>
//                 <Badge>{viewInvoice.status}</Badge>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Payment Status</span>
//                 <span className="font-medium">{viewInvoice.payment_status || "—"}</span>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Website</span>
//                 <span className="font-medium">{viewInvoice.source_website || "ankshaastra.com"}</span>
//               </div>
//               <div className="flex justify-between pb-1">
//                 <span className="text-muted-foreground">Created Date</span>
//                 <span className="font-medium">
//                   {new Date(viewInvoice.created_at || viewInvoice.invoice_date).toLocaleString()}
//                 </span>
//               </div>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Delete Invoice Confirmation Dialog */}
//       <AlertDialog open={!!deleteInvoiceId} onOpenChange={(open) => !open && setDeleteInvoiceId(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete this invoice?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This action cannot be undone. This will permanently delete the invoice from Supabase.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={confirmDeleteInvoice}
//               disabled={deleting}
//               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//             >
//               {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </AdminPage>
//   );
// }

import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage } from "@/components/admin/AdminPage";
import { useAdminTable } from "@/hooks/useAdminData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileArchive, Loader2, Eye, Trash2, SlidersHorizontal, MoreVertical } from "lucide-react";
import { downloadMonthlyInvoiceZip, fetchInvoiceDownloadUrl } from "@/lib/invoice-download";
import { CONNECTED_SITE_OPTIONS } from "@/lib/connected-sites";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Invoice = {
  id: string;
  invoice_number: string;
  customer_name: string;
  service_title: string;
  total_amount: number;
  status: string;
  source_website?: string;
  pdf_url?: string;
  pdf_storage_path?: string | null;
  invoice_date: string;
  // Optional fields — present only if these columns exist in your
  // Supabase "invoices" table. Rendered as "—" when undefined.
  customer_email?: string;
  customer_address?: string;
  gst_number?: string;
  gst_amount?: number;
  payment_status?: string;
  created_at?: string;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const PAGE_SIZE = 10;

// Same fixed status → color mapping used on Orders & Bookings, so "paid"
// looks the same shade of green everywhere instead of each screen inventing
// its own status color.
const STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  failed: "bg-red-100 text-red-700 hover:bg-red-100",
  refunded: "bg-slate-200 text-slate-700 hover:bg-slate-200",
  cancelled: "bg-slate-200 text-slate-600 hover:bg-slate-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return `${formatDate(iso)}, ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
}

export default function InvoicesModule() {
  const { rows, loading, reload } = useAdminTable<Invoice>("invoices", "invoice_date");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<string | null>(null);

  const now = new Date();
  const [bulkYear, setBulkYear] = useState(String(now.getFullYear()));
  const [bulkMonth, setBulkMonth] = useState(String(now.getMonth() + 1));
  const [siteFilter, setSiteFilter] = useState("all");

  // New: search + filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Secondary filters (status/month/year/date-range) are used occasionally, not
  // on every visit, so they're collapsed behind a toggle — search + site stay
  // visible since those are used every time.
  const [showFilters, setShowFilters] = useState(false);

  // View dialog state
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  // Delete dialog state
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);

  const yearOptions = useMemo(() => {
    const current = now.getFullYear();
    return Array.from({ length: 5 }, (_, i) => String(current - i));
  }, [now]);

  const statusOptions = useMemo(() => {
    const unique = Array.from(new Set(rows.map((i) => i.status).filter(Boolean)));
    return unique;
  }, [rows]);

  const activeSecondaryFilterCount = [
    statusFilter !== "all",
    monthFilter !== "all",
    yearFilter !== "all",
    !!dateFrom,
    !!dateTo,
  ].filter(Boolean).length;

  const filteredRows = useMemo(() => {
    let data = rows;

    if (siteFilter !== "all") {
      data = data.filter((i) => (i.source_website || "ankshaastra.com") === siteFilter);
    }

    if (statusFilter !== "all") {
      data = data.filter((i) => i.status === statusFilter);
    }

    if (monthFilter !== "all") {
      data = data.filter((i) => {
        const d = new Date(i.invoice_date);
        return String(d.getMonth() + 1) === monthFilter;
      });
    }

    if (yearFilter !== "all") {
      data = data.filter((i) => {
        const d = new Date(i.invoice_date);
        return String(d.getFullYear()) === yearFilter;
      });
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      data = data.filter((i) => new Date(i.invoice_date) >= from);
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      data = data.filter((i) => new Date(i.invoice_date) <= to);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (i) =>
          (i.invoice_number || "").toLowerCase().includes(q) ||
          (i.customer_name || "").toLowerCase().includes(q) ||
          (i.customer_email || "").toLowerCase().includes(q) ||
          (i.service_title || "").toLowerCase().includes(q)
      );
    }

    return data;
  }, [rows, siteFilter, statusFilter, monthFilter, yearFilter, dateFrom, dateTo, search]);

  // Reset to page 1 whenever filters/search change the result set
  useMemo(() => {
    setPage(1);
  }, [siteFilter, statusFilter, monthFilter, yearFilter, dateFrom, dateTo, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, page]);

  const goToPreviousPage = () => setPage((p) => Math.max(1, p - 1));
  const goToNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  const downloadInvoice = async (inv: Invoice) => {
    setDownloadingId(inv.id);
    try {
      const url = (await fetchInvoiceDownloadUrl(inv.id)) || inv.pdf_url;
      if (!url) {
        toast.error("Invoice PDF is not available yet.");
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Could not download invoice");
    } finally {
      setDownloadingId(null);
    }
  };

  const downloadMonthlyBundle = async () => {
    setBulkLoading(true);
    setBulkProgress("Preparing…");
    try {
      const result = await downloadMonthlyInvoiceZip(Number(bulkYear), Number(bulkMonth), (p) => {
        if (p.phase === "listing") {
          setBulkProgress("Loading invoice list…");
        } else if (p.phase === "downloading") {
          setBulkProgress(`Downloading PDFs ${p.done}/${p.total}…`);
        } else {
          setBulkProgress("Creating ZIP file…");
        }
      });
      const monthLabel = MONTHS[Number(bulkMonth) - 1];
      toast.success(
        `Downloaded ${result.included} invoice${result.included === 1 ? "" : "s"} for ${monthLabel} ${bulkYear}` +
          (result.skipped ? ` (${result.skipped} skipped)` : ""),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bulk download failed");
    } finally {
      setBulkLoading(false);
      setBulkProgress(null);
    }
  };

  const confirmDeleteInvoice = async () => {
    if (!deleteInvoiceId) return;
    setDeleting(true);
    try {
      // Safety net: delete dependent rows first in case a FK
      // constraint exists (e.g. email_logs.invoice_id -> invoices.id).
      // Ideally this should be ON DELETE CASCADE at the DB level.
      const { error: emailLogsError } = await supabase
        .from("email_logs")
        .delete()
        .eq("invoice_id", deleteInvoiceId);

      if (emailLogsError && emailLogsError.code !== "42703") {
        // 42703 = column does not exist, meaning there's no such FK — safe to ignore.
        toast.error(emailLogsError.message || "Failed to delete related email logs");
        return;
      }

      const { error } = await supabase.from("invoices").delete().eq("id", deleteInvoiceId);
      if (error) {
        toast.error(error.message || "Failed to delete invoice");
      } else {
        toast.success("Invoice deleted successfully");
        reload();
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete invoice");
    } finally {
      setDeleting(false);
      setDeleteInvoiceId(null);
    }
  };

  const bulkActions = (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={bulkMonth} onValueChange={setBulkMonth}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((label, index) => (
            <SelectItem key={label} value={String(index + 1)}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={bulkYear} onValueChange={setBulkYear}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {yearOptions.map((year) => (
            <SelectItem key={year} value={year}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button size="sm" disabled={bulkLoading} onClick={() => void downloadMonthlyBundle()}>
        {bulkLoading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <FileArchive className="w-4 h-4 mr-2" />
        )}
        {bulkProgress || "Download ZIP"}
      </Button>
    </div>
  );

  return (
    <AdminPage
      title="Invoice Manager"
      description="GST invoices stored in Supabase — download PDFs individually or as a monthly ZIP bundle."
      loading={loading}
      empty={!filteredRows.length}
      emptyMessage="No invoices yet. You can still download a monthly ZIP if PDFs exist for that period."
      actions={bulkActions}
    >
      {/* Always-visible row: search + site + filters toggle. Secondary filters
          (status/month/year/date-range) are used occasionally, so they're
          tucked behind "Filters" instead of sitting above every invoice on
          every visit. */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by invoice number, customer, email or service..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md"
        />

        <Select value={siteFilter} onValueChange={setSiteFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="All sites" /></SelectTrigger>
          <SelectContent>
            {CONNECTED_SITE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          size="sm"
          variant={activeSecondaryFilterCount > 0 ? "secondary" : "outline"}
          onClick={() => setShowFilters((v) => !v)}
        >
          <SlidersHorizontal className="w-4 h-4 mr-1.5" />
          Filters
          {activeSecondaryFilterCount > 0 && (
            <Badge variant="outline" className="ml-1.5 h-5 min-w-5 px-1 text-xs">
              {activeSecondaryFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {showFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statusOptions.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Month" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All months</SelectItem>
              {MONTHS.map((label, index) => (
                <SelectItem key={label} value={String(index + 1)}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[110px]"><SelectValue placeholder="Year" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[150px]"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[150px]"
            />
          </div>

          {(activeSecondaryFilterCount > 0 || search) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setStatusFilter("all");
                setMonthFilter("all");
                setYearFilter("all");
                setDateFrom("");
                setDateTo("");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Invoice listing — multi-domain, each with website name visible */}
      <div className="space-y-2">
        {paginatedRows.map((i) => (
          <div key={i.id} className="flex flex-wrap justify-between gap-3 border border-border rounded-lg p-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {i.source_website || "ankshaastra.com"}
                </Badge>
                <p className="font-semibold text-primary">{i.invoice_number}</p>
              </div>
              <p className="text-sm text-muted-foreground">{i.customer_name} · {i.service_title}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatDate(i.invoice_date)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">₹{Number(i.total_amount).toLocaleString()}</span>

              <Badge className={cn("capitalize border-0", STATUS_STYLES[i.status] || STATUS_STYLES.cancelled)}>
                {i.status}
              </Badge>

              {(i.pdf_storage_path || i.pdf_url) && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  disabled={downloadingId === i.id}
                  onClick={() => downloadInvoice(i)}
                  aria-label="Download invoice PDF"
                >
                  {downloadingId === i.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </Button>
              )}

              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setViewInvoice(i)}
                aria-label="View invoice details"
              >
                <Eye className="w-4 h-4" />
              </Button>

              {/* Delete lives behind a kebab menu instead of a full-width red
                  button, since it's a rare, guarded action, not one that should
                  carry the same visual weight as View/Download on every row. */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="More actions">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setDeleteInvoiceId(i.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination controls */}
      {filteredRows.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages} · {filteredRows.length} invoices
          </p>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={goToPreviousPage} disabled={page <= 1}>
              Previous
            </Button>
            <Button size="sm" variant="outline" onClick={goToNextPage} disabled={page >= totalPages}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* View Invoice Dialog */}
      <Dialog open={!!viewInvoice} onOpenChange={(open) => !open && setViewInvoice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>Full details for this invoice.</DialogDescription>
          </DialogHeader>
          {viewInvoice && (
            <div className="space-y-2 text-sm max-h-[70vh] overflow-y-auto pr-1">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Invoice Number</span>
                <span className="font-medium">{viewInvoice.invoice_number}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Customer Name</span>
                <span className="font-medium">{viewInvoice.customer_name}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{viewInvoice.customer_email || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Address</span>
                <span className="font-medium text-right">{viewInvoice.customer_address || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">GST Number</span>
                <span className="font-medium">{viewInvoice.gst_number || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium text-right">{viewInvoice.service_title}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">₹{Number(viewInvoice.total_amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">GST Amount</span>
                <span className="font-medium">
                  {viewInvoice.gst_amount != null ? `₹${Number(viewInvoice.gst_amount).toLocaleString()}` : "—"}
                </span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium">
                  ₹{(Number(viewInvoice.total_amount) + Number(viewInvoice.gst_amount || 0)).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Status</span>
                <Badge className={cn("capitalize border-0", STATUS_STYLES[viewInvoice.status] || STATUS_STYLES.cancelled)}>
                  {viewInvoice.status}
                </Badge>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Payment Status</span>
                <span className="font-medium">{viewInvoice.payment_status || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Website</span>
                <span className="font-medium">{viewInvoice.source_website || "ankshaastra.com"}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-muted-foreground">Created Date</span>
                <span className="font-medium">
                  {formatDateTime(viewInvoice.created_at || viewInvoice.invoice_date)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Invoice Confirmation Dialog */}
      <AlertDialog open={!!deleteInvoiceId} onOpenChange={(open) => !open && setDeleteInvoiceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the invoice from Supabase.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteInvoice}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPage>
  );
}