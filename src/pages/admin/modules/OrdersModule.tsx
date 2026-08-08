

// import { useEffect, useMemo, useState } from "react";
// import { useSearchParams } from "react-router-dom";
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
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { toast } from "sonner";
// import { FileText, Loader2, Eye, Trash2, MoreVertical, Download } from "lucide-react";
// import { generateInvoiceForOrder } from "@/lib/invoice-admin";
// import { CONNECTED_SITE_OPTIONS } from "@/lib/connected-sites";
// import { cn } from "@/lib/utils";
// import { exportRowsAsCsv } from "@/lib/csv-export";

// type Order = {
//   id: string;
//   service_title: string;
//   total_amount: number;
//   status: string;
//   source_website?: string;
//   customer_name?: string;
//   customer_email?: string;
//   customer_phone?: string;
//   razorpay_payment_id?: string;
//   payment_method?: string;
//   invoice_number?: string;
//   created_at: string;
//   // fulfill-payment.ts (mergeOrderMetadata) actually saves the customer's
//   // submitted form fields nested one level down, under `formSnapshot` — not
//   // directly on `metadata`. Field names also vary by service form
//   // (currentCity/currentState for personal services, officeCity/officeState
//   // for business services), so there is no single fixed key.
//   //
//   // Manual invoices (create-manual.ts) are the one exception: they save
//   // billing fields directly on `metadata` (not nested under formSnapshot)
//   // using the exact keys `currentCity`, `customerState`, `pincode`,
//   // `customerGstin` — matching what resolveCustomerBilling() expects on the
//   // backend. Both shapes are handled below.
//   metadata?: {
//     formSnapshot?: Record<string, unknown>;
//     [key: string]: unknown;
//   };
// };

// // Human-readable label for each backend status value. This is display-only —
// // the underlying value always comes from Supabase (Razorpay webhooks are the
// // real source of truth for status; nothing here writes back to the
// // database). Anything not in this map falls back to a title-cased version of
// // the raw value instead of being hardcoded, so an unexpected/new status still
// // renders sensibly rather than disappearing.
// const STATUS_LABELS: Record<string, string> = {
//   payment_received: "Paid",
//   completed: "Completed",
//   pending: "Pending",
//   failed: "Failed",
//   cancelled: "Cancelled",
//   refunded: "Refunded",
// };

// function getStatusLabel(status: string) {
//   if (STATUS_LABELS[status]) return STATUS_LABELS[status];
//   if (!status) return "Unknown";
//   return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
// }

// // Fixed, consistent status → color mapping, used everywhere a status badge
// // appears: green = paid/completed, amber = pending, red = failed/refunded,
// // gray = other. Keyed by the same real backend status values as STATUS_LABELS.
// const STATUS_STYLES: Record<string, string> = {
//   payment_received: "bg-emerald-100 text-emerald-700",
//   completed: "bg-emerald-100 text-emerald-700",
//   pending: "bg-amber-100 text-amber-700",
//   failed: "bg-red-100 text-red-700",
//   refunded: "bg-red-100 text-red-700",
//   cancelled: "bg-slate-200 text-slate-600",
// };

// // Whether an order is in a paid/completed state — used both to decide if
// // "Generate Invoice" should be offered, and to filter the list below so
// // Orders & Bookings only ever shows orders that have actually been paid.
// function isPaidStatus(status: string) {
//   return status === "payment_received" || status === "completed" || status === "paid";
// }

// // Returns the first non-empty string value found under any of the given
// // keys in `source` — used because different service forms (personal vs.
// // business) save the customer's city/state/GSTIN under different field
// // names, and the real data lives inside metadata.formSnapshot, not
// // directly on metadata.
// function pickFirst(source: Record<string, unknown> | undefined, keys: string[]): string | undefined {
//   if (!source) return undefined;
//   for (const key of keys) {
//     const value = source[key];
//     if (value !== null && value !== undefined && String(value).trim() !== "") {
//       return String(value).trim();
//     }
//   }
//   return undefined;
// }

// function resolveBillingAddress(order: Order): string {
//   const meta = order.metadata || {};
//   const snapshot = meta.formSnapshot || meta;
//   // "customerState" and "pincode" are the exact keys create-manual.ts saves
//   // for manual invoices; the rest are the various website-form field names.
//   const city = pickFirst(snapshot, ["currentCity", "officeCity", "city"]);
//   const state = pickFirst(snapshot, ["customerState", "currentState", "officeState", "state"]);
//   const pincode = pickFirst(snapshot, ["pincode", "officePincode", "billingPincode"]);
//   return (
//     [city, state, pincode ? `Pincode: ${pincode}` : undefined].filter(Boolean).join(", ") || "—"
//   );
// }

// function resolveCustomerGstin(order: Order): string {
//   const meta = order.metadata || {};
//   const snapshot = meta.formSnapshot || meta;
//   return pickFirst(snapshot, ["customerGstin", "gstin", "businessGstin"]) || "—";
// }

// const PAGE_SIZE = 10;

// function formatDateTime(iso: string) {
//   const d = new Date(iso);
//   const datePart = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
//   const timePart = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
//   return `${datePart}, ${timePart}`;
// }

// export default function OrdersModule() {
//   const { rows, loading, reload } = useAdminTable<Order>("orders");
//   const [generatingId, setGeneratingId] = useState<string | null>(null);
//   const [siteFilter, setSiteFilter] = useState("all");
//   const [search, setSearch] = useState("");
//   const [searchParams, setSearchParams] = useSearchParams();

//   // View Order Details dialog state
//   const [viewOrder, setViewOrder] = useState<Order | null>(null);

//   // Deep-link support: Global Search sends ?open=<order id>. Instead of
//   // auto-opening a read-only dialog, scroll to and briefly highlight that
//   // exact row in the list, so the admin can use any action on it (View,
//   // Generate Invoice, Delete) themselves — not just see a static popup.
//   const [highlightedId, setHighlightedId] = useState<string | null>(null);
//   useEffect(() => {
//     const openId = searchParams.get("open");
//     if (!openId || !rows.length) return;
//     const match = rows.find((o) => o.id === openId);
//     if (match) {
//       setHighlightedId(openId);
//       setSearchParams({}, { replace: true });
//       setTimeout(() => {
//         document.getElementById(`order-row-${openId}`)?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       }, 100);
//       setTimeout(() => setHighlightedId(null), 3000);
//     }
//   }, [searchParams, rows, setSearchParams]);

//   // Delete Order dialog state
//   const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
//   const [deleting, setDeleting] = useState(false);

//   // Pagination state
//   const [page, setPage] = useState(1);

//   const filteredRows = useMemo(() => {
//     // Orders & Bookings only ever shows orders that have actually been
//     // paid — pending/failed/cancelled/refunded orders are noise here and
//     // clutter the list with bookings that never converted. Orders created
//     // via the Invoice Manager's "Create Invoice" modal are tagged
//     // metadata.manualEntry = true by create-manual.ts — those already show
//     // up in Invoice Manager, so they're excluded here to avoid duplicates.
//     let data = rows.filter(
//       (o) => isPaidStatus(o.status) && !(o.metadata && (o.metadata as Record<string, unknown>).manualEntry === true)
//     );

//     if (siteFilter !== "all") {
//       data = data.filter(
//         (o) => (o.source_website || "ankshaastra.com") === siteFilter
//       );
//     }

//     if (search.trim()) {
//       const q = search.toLowerCase();

//       data = data.filter(
//         (o) =>
//           (o.customer_name || "").toLowerCase().includes(q) ||
//           (o.customer_email || "").toLowerCase().includes(q) ||
//           (o.customer_phone || "").toLowerCase().includes(q) ||
//           (o.service_title || "").toLowerCase().includes(q) ||
//           (o.status || "").toLowerCase().includes(q) ||
//           o.id.toLowerCase().includes(q)
//       );
//     }

//     return data;
//   }, [rows, siteFilter, search]);

//   // Reset to page 1 whenever filters/search change the result set
//   useMemo(() => {
//     setPage(1);
//   }, [siteFilter, search]);

//   const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));

//   const paginatedRows = useMemo(() => {
//     const start = (page - 1) * PAGE_SIZE;
//     return filteredRows.slice(start, start + PAGE_SIZE);
//   }, [filteredRows, page]);

//   const goToPreviousPage = () => setPage((p) => Math.max(1, p - 1));
//   const goToNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

//   // Exports exactly what's currently filtered/searched (not just the current
//   // page), so "Export CSV" always matches what the admin is looking at.
//   // Columns mirror every field visible on the Orders screen — both the list
//   // row and the "View Details" dialog — with one status column, driven by
//   // the same `status` field as the badge.
//   const handleExportCsv = () => {
//     if (!filteredRows.length) {
//       toast.error("No records to export.");
//       return;
//     }
//     exportRowsAsCsv("orders", filteredRows, [
//       { label: "Order ID", value: (o) => o.id },
//       { label: "Customer", value: (o) => o.customer_name || "Guest" },
//       { label: "Phone", value: (o) => o.customer_phone || "" },
//       { label: "Email", value: (o) => o.customer_email },
//       { label: "Service", value: (o) => o.service_title },
//       { label: "Amount", value: (o) => Number(o.total_amount) },
//       { label: "Status", value: (o) => getStatusLabel(o.status) },
//       { label: "Payment Method", value: (o) => o.payment_method || "" },
//       { label: "Payment Reference", value: (o) => o.razorpay_payment_id || "" },
//       { label: "Invoice Number", value: (o) => o.invoice_number || "" },
//       { label: "Site", value: (o) => o.source_website || "ankshaastra.com" },
//       { label: "Created At", value: (o) => (o.created_at ? new Date(o.created_at).toLocaleString() : "") },
//     ]);
//   };

//   const runGenerateInvoice = async (orderId: string) => {
//     setGeneratingId(orderId);
//     try {
//       const result = await generateInvoiceForOrder(orderId);
//       toast.success(
//         result.invoice_number
//           ? `Invoice ${result.invoice_number} generated and emailed`
//           : "Invoice generated and emailed",
//       );
//       reload();
//     } catch (e: unknown) {
//       toast.error(e instanceof Error ? e.message : "Failed to generate invoice");
//     } finally {
//       setGeneratingId(null);
//     }
//   };

//   const confirmDeleteOrder = async () => {
//     if (!deleteOrderId) return;
//     setDeleting(true);
//     try {
//       const { error } = await supabase.from("orders").delete().eq("id", deleteOrderId);
//       if (error) {
//         toast.error(error.message || "Failed to delete order");
//       } else {
//         toast.success("Order deleted successfully");
//         reload();
//       }
//     } catch (e: unknown) {
//       toast.error(e instanceof Error ? e.message : "Failed to delete order");
//     } finally {
//       setDeleting(false);
//       setDeleteOrderId(null);
//     }
//   };

//   return (
//     <AdminPage title="Orders & Bookings" description="Paid orders across connected websites (main, Empower, Miracle Baby)." loading={loading} empty={!filteredRows.length}>
//       <div className="mb-4 flex flex-wrap items-center gap-3">
//         <Input
//           placeholder="Search by customer, email, phone, service, order id or status..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="w-[280px]"
//         />

//         <Select value={siteFilter} onValueChange={setSiteFilter}>
//           <SelectTrigger className="w-[220px]">
//             <SelectValue />
//           </SelectTrigger>

//           <SelectContent>
//             {CONNECTED_SITE_OPTIONS.map((opt) => (
//               <SelectItem key={opt.value} value={opt.value}>
//                 {opt.label}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>

//         <Button variant="outline" size="sm" onClick={handleExportCsv} className="sm:ml-auto">
//           <Download className="h-4 w-4 mr-1.5" />
//           Export CSV
//         </Button>
//       </div>

//       <div className="space-y-2">
//         {paginatedRows.map((o) => (
//           <div
//             key={o.id}
//             id={`order-row-${o.id}`}
//             className={cn(
//               "flex flex-wrap gap-3 justify-between items-center border rounded-lg p-4 transition-colors",
//               highlightedId === o.id
//                 ? "border-primary ring-2 ring-primary/40 bg-primary/5"
//                 : "border-border"
//             )}
//           >
//             <div className="min-w-0">
//               <p className="font-semibold truncate">{o.service_title}</p>
//               <p className="text-xs text-muted-foreground">
//                 {o.customer_name || "Guest"} · {formatDateTime(o.created_at)}
//               </p>
//             </div>

//             <div className="flex items-center gap-3">
//               <span className="font-semibold">₹{Number(o.total_amount).toLocaleString()}</span>

//               {/* Status is READ ONLY: a plain badge driven entirely by the
//                   real `status` value from Supabase (Razorpay/webhooks are the
//                   source of truth). No dropdown, no click action, no inline
//                   editing — admins can view but never manually change it. */}
//               <Badge
//                 className={cn(
//                   "rounded-full border-0 px-3 py-1 text-xs font-medium",
//                   STATUS_STYLES[o.status] || STATUS_STYLES.cancelled
//                 )}
//               >
//                 {getStatusLabel(o.status)}
//               </Badge>

//               {/* View: kept as its own icon-only button since it's the most
//                   common action and shouldn't require an extra click through a menu. */}
//               <Button
//                 size="icon"
//                 variant="ghost"
//                 className="h-8 w-8"
//                 onClick={() => setViewOrder(o)}
//                 aria-label="View order details"
//               >
//                 <Eye className="w-4 h-4" />
//               </Button>

//               {/* Less-frequent / destructive actions live behind a kebab menu so
//                   Delete no longer sits at the same size and prominence as every
//                   other action on the row. */}
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button
//                     size="icon"
//                     variant="ghost"
//                     className="h-8 w-8"
//                     aria-label="More actions"
//                   >
//                     <MoreVertical className="w-4 h-4" />
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end">
//                   {isPaidStatus(o.status) && (
//                     <>
//                       <DropdownMenuItem
//                         disabled={generatingId === o.id}
//                         onClick={() => runGenerateInvoice(o.id)}
//                       >
//                         {generatingId === o.id ? (
//                           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                         ) : (
//                           <FileText className="w-4 h-4 mr-2" />
//                         )}
//                         Generate Invoice
//                       </DropdownMenuItem>
//                       <DropdownMenuSeparator />
//                     </>
//                   )}
//                   <DropdownMenuItem
//                     onClick={() => setDeleteOrderId(o.id)}
//                     className="text-destructive focus:text-destructive"
//                   >
//                     <Trash2 className="w-4 h-4 mr-2" />
//                     Delete
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Pagination controls */}
//       {filteredRows.length > 0 && (
//         <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//           <p className="text-xs text-muted-foreground">
//             Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredRows.length)} of{" "}
//             {filteredRows.length}
//           </p>
//           <div className="flex items-center gap-3">
//             <Button
//               size="sm"
//               variant="outline"
//               onClick={goToPreviousPage}
//               disabled={page <= 1}
//             >
//               Previous
//             </Button>
//             <p className="text-xs text-muted-foreground whitespace-nowrap">
//               Page {page} of {totalPages}
//             </p>
//             <Button
//               size="sm"
//               variant="outline"
//               onClick={goToNextPage}
//               disabled={page >= totalPages}
//             >
//               Next
//             </Button>
//           </div>
//         </div>
//       )}

//       {/* View Order Details Dialog */}
//       <Dialog open={!!viewOrder} onOpenChange={(open) => !open && setViewOrder(null)}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Order Details</DialogTitle>
//             <DialogDescription>Full details for this order.</DialogDescription>
//           </DialogHeader>
//           {viewOrder && (
//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Order ID</span>
//                 <span className="font-medium break-all text-right">{viewOrder.id}</span>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Customer Name</span>
//                 <span className="font-medium">{viewOrder.customer_name || "Guest"}</span>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Phone</span>
//                 <span className="font-medium">{viewOrder.customer_phone || "—"}</span>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Email</span>
//                 <span className="font-medium break-all text-right">{viewOrder.customer_email || "—"}</span>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Billing Address</span>
//                 <span className="font-medium text-right">{resolveBillingAddress(viewOrder)}</span>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Customer GSTIN</span>
//                 <span className="font-medium">{resolveCustomerGstin(viewOrder)}</span>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Service</span>
//                 <span className="font-medium text-right">{viewOrder.service_title}</span>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Amount</span>
//                 <span className="font-medium">₹{Number(viewOrder.total_amount).toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Status</span>
//                 <Badge
//                   className={cn("border-0", STATUS_STYLES[viewOrder.status] || STATUS_STYLES.cancelled)}
//                 >
//                   {getStatusLabel(viewOrder.status)}
//                 </Badge>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Payment Method</span>
//                 <span className="font-medium capitalize">{viewOrder.payment_method || "—"}</span>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Payment Reference</span>
//                 <span className="font-medium break-all text-right">{viewOrder.razorpay_payment_id || "—"}</span>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Invoice Number</span>
//                 <span className="font-medium">{viewOrder.invoice_number || "—"}</span>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Website</span>
//                 <span className="font-medium">{viewOrder.source_website || "ankshaastra.com"}</span>
//               </div>
//               <div className="flex justify-between pb-1">
//                 <span className="text-muted-foreground">Created Date</span>
//                 <span className="font-medium">{formatDateTime(viewOrder.created_at)}</span>
//               </div>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Delete Order Confirmation Dialog */}
//       <AlertDialog open={!!deleteOrderId} onOpenChange={(open) => !open && setDeleteOrderId(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete this order?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This action cannot be undone. This will permanently delete the order from Supabase.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={confirmDeleteOrder}
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

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Loader2, Eye, Trash2, MoreVertical, Download } from "lucide-react";
import { CONNECTED_SITE_OPTIONS } from "@/lib/connected-sites";
import { cn } from "@/lib/utils";
import { exportRowsAsCsv } from "@/lib/csv-export";

type Order = {
  id: string;
  service_title: string;
  total_amount: number;
  status: string;
  source_website?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  razorpay_payment_id?: string;
  payment_method?: string;
  invoice_number?: string;
  created_at: string;
  // fulfill-payment.ts (mergeOrderMetadata) actually saves the customer's
  // submitted form fields nested one level down, under `formSnapshot` — not
  // directly on `metadata`. Field names also vary by service form
  // (currentCity/currentState for personal services, officeCity/officeState
  // for business services), so there is no single fixed key.
  //
  // Manual invoices (create-manual.ts) are the one exception: they save
  // billing fields directly on `metadata` (not nested under formSnapshot)
  // using the exact keys `currentCity`, `customerState`, `pincode`,
  // `customerGstin` — matching what resolveCustomerBilling() expects on the
  // backend. Both shapes are handled below.
  metadata?: {
    formSnapshot?: Record<string, unknown>;
    [key: string]: unknown;
  };
};

// Human-readable label for each backend status value. This is display-only —
// the underlying value always comes from Supabase (Razorpay webhooks are the
// real source of truth for status; nothing here writes back to the
// database). Anything not in this map falls back to a title-cased version of
// the raw value instead of being hardcoded, so an unexpected/new status still
// renders sensibly rather than disappearing.
const STATUS_LABELS: Record<string, string> = {
  payment_received: "Paid",
  completed: "Completed",
  pending: "Pending",
  failed: "Failed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

function getStatusLabel(status: string) {
  if (STATUS_LABELS[status]) return STATUS_LABELS[status];
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
}

// Fixed, consistent status → color mapping, used everywhere a status badge
// appears: green = paid/completed, amber = pending, red = failed/refunded,
// gray = other. Keyed by the same real backend status values as STATUS_LABELS.
const STATUS_STYLES: Record<string, string> = {
  payment_received: "bg-emerald-100 text-emerald-700",
  completed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-red-100 text-red-700",
  cancelled: "bg-slate-200 text-slate-600",
};

// Whether an order is in a paid/completed state — used to filter the list
// below so Orders & Bookings only ever shows orders that have actually been
// paid.
function isPaidStatus(status: string) {
  return status === "payment_received" || status === "completed" || status === "paid";
}

// Returns the first non-empty string value found under any of the given
// keys in `source` — used because different service forms (personal vs.
// business) save the customer's city/state/GSTIN under different field
// names, and the real data lives inside metadata.formSnapshot, not
// directly on metadata.
function pickFirst(source: Record<string, unknown> | undefined, keys: string[]): string | undefined {
  if (!source) return undefined;
  for (const key of keys) {
    const value = source[key];
    if (value !== null && value !== undefined && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return undefined;
}

function resolveBillingAddress(order: Order): string {
  const meta = order.metadata || {};
  const snapshot = meta.formSnapshot || meta;
  // "customerState" and "pincode" are the exact keys create-manual.ts saves
  // for manual invoices; the rest are the various website-form field names.
  const city = pickFirst(snapshot, ["currentCity", "officeCity", "city"]);
  const state = pickFirst(snapshot, ["customerState", "currentState", "officeState", "state"]);
  const pincode = pickFirst(snapshot, ["pincode", "officePincode", "billingPincode"]);
  return (
    [city, state, pincode ? `Pincode: ${pincode}` : undefined].filter(Boolean).join(", ") || "—"
  );
}

function resolveCustomerGstin(order: Order): string {
  const meta = order.metadata || {};
  const snapshot = meta.formSnapshot || meta;
  return pickFirst(snapshot, ["customerGstin", "gstin", "businessGstin"]) || "—";
}

const PAGE_SIZE = 10;

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const datePart = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const timePart = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return `${datePart}, ${timePart}`;
}

export default function OrdersModule() {
  const { rows, loading, reload } = useAdminTable<Order>("orders");
  const [siteFilter, setSiteFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  // View Order Details dialog state
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  // Deep-link support: Global Search sends ?open=<order id>. Instead of
  // auto-opening a read-only dialog, scroll to and briefly highlight that
  // exact row in the list, so the admin can use any action on it (View,
  // Delete) themselves — not just see a static popup.
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  useEffect(() => {
    const openId = searchParams.get("open");
    if (!openId || !rows.length) return;
    const match = rows.find((o) => o.id === openId);
    if (match) {
      setHighlightedId(openId);
      setSearchParams({}, { replace: true });
      setTimeout(() => {
        document.getElementById(`order-row-${openId}`)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
      setTimeout(() => setHighlightedId(null), 3000);
    }
  }, [searchParams, rows, setSearchParams]);

  // Delete Order dialog state
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    // Orders & Bookings only ever shows orders that have actually been
    // paid — pending/failed/cancelled/refunded orders are noise here and
    // clutter the list with bookings that never converted. Orders created
    // via the Invoice Manager's "Create Invoice" modal are tagged
    // metadata.manualEntry = true by create-manual.ts — those already show
    // up in Invoice Manager, so they're excluded here to avoid duplicates.
    let data = rows.filter(
      (o) => isPaidStatus(o.status) && !(o.metadata && (o.metadata as Record<string, unknown>).manualEntry === true)
    );

    if (siteFilter !== "all") {
      data = data.filter(
        (o) => (o.source_website || "ankshaastra.com") === siteFilter
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();

      data = data.filter(
        (o) =>
          (o.customer_name || "").toLowerCase().includes(q) ||
          (o.customer_email || "").toLowerCase().includes(q) ||
          (o.customer_phone || "").toLowerCase().includes(q) ||
          (o.service_title || "").toLowerCase().includes(q) ||
          (o.status || "").toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q)
      );
    }

    return data;
  }, [rows, siteFilter, search]);

  // Reset to page 1 whenever filters/search change the result set
  useMemo(() => {
    setPage(1);
  }, [siteFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, page]);

  const goToPreviousPage = () => setPage((p) => Math.max(1, p - 1));
  const goToNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  // Exports exactly what's currently filtered/searched (not just the current
  // page), so "Export CSV" always matches what the admin is looking at.
  // Columns mirror every field visible on the Orders screen — both the list
  // row and the "View Details" dialog — with one status column, driven by
  // the same `status` field as the badge.
  const handleExportCsv = () => {
    if (!filteredRows.length) {
      toast.error("No records to export.");
      return;
    }
    exportRowsAsCsv("orders", filteredRows, [
      { label: "Order ID", value: (o) => o.id },
      { label: "Customer", value: (o) => o.customer_name || "Guest" },
      { label: "Phone", value: (o) => o.customer_phone || "" },
      { label: "Email", value: (o) => o.customer_email },
      { label: "Service", value: (o) => o.service_title },
      { label: "Amount", value: (o) => Number(o.total_amount) },
      { label: "Status", value: (o) => getStatusLabel(o.status) },
      { label: "Payment Method", value: (o) => o.payment_method || "" },
      { label: "Payment Reference", value: (o) => o.razorpay_payment_id || "" },
      { label: "Invoice Number", value: (o) => o.invoice_number || "" },
      { label: "Site", value: (o) => o.source_website || "ankshaastra.com" },
      { label: "Created At", value: (o) => (o.created_at ? new Date(o.created_at).toLocaleString() : "") },
    ]);
  };

  const confirmDeleteOrder = async () => {
    if (!deleteOrderId) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from("orders").delete().eq("id", deleteOrderId);
      if (error) {
        toast.error(error.message || "Failed to delete order");
      } else {
        toast.success("Order deleted successfully");
        reload();
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete order");
    } finally {
      setDeleting(false);
      setDeleteOrderId(null);
    }
  };

  return (
    <AdminPage title="Orders & Bookings" description="Paid orders across connected websites (main, Empower, Miracle Baby)." loading={loading} empty={!filteredRows.length}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by customer, email, phone, service, order id or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[280px]"
        />

        <Select value={siteFilter} onValueChange={setSiteFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {CONNECTED_SITE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={handleExportCsv} className="sm:ml-auto">
          <Download className="h-4 w-4 mr-1.5" />
          Export CSV
        </Button>
      </div>

      <div className="space-y-2">
        {paginatedRows.map((o) => (
          <div
            key={o.id}
            id={`order-row-${o.id}`}
            className={cn(
              "flex flex-wrap gap-3 justify-between items-center border rounded-lg p-4 transition-colors",
              highlightedId === o.id
                ? "border-primary ring-2 ring-primary/40 bg-primary/5"
                : "border-border"
            )}
          >
            <div className="min-w-0">
              <p className="font-semibold truncate">{o.service_title}</p>
              <p className="text-xs text-muted-foreground">
                {o.customer_name || "Guest"} · {formatDateTime(o.created_at)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-semibold">₹{Number(o.total_amount).toLocaleString()}</span>

              {/* Status is READ ONLY: a plain badge driven entirely by the
                  real `status` value from Supabase (Razorpay/webhooks are the
                  source of truth). No dropdown, no click action, no inline
                  editing — admins can view but never manually change it. */}
              <Badge
                className={cn(
                  "rounded-full border-0 px-3 py-1 text-xs font-medium",
                  STATUS_STYLES[o.status] || STATUS_STYLES.cancelled
                )}
              >
                {getStatusLabel(o.status)}
              </Badge>

              {/* View: kept as its own icon-only button since it's the most
                  common action and shouldn't require an extra click through a menu. */}
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setViewOrder(o)}
                aria-label="View order details"
              >
                <Eye className="w-4 h-4" />
              </Button>

              {/* Only action left behind the kebab menu is Delete —
                  "Generate Invoice" was removed from here. Invoice
                  creation now happens exclusively via Invoice Manager,
                  so there's one source of truth for invoice numbers and
                  GST/PDF generation instead of two entry points. */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    aria-label="More actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setDeleteOrderId(o.id)}
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
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredRows.length)} of{" "}
            {filteredRows.length}
          </p>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={goToPreviousPage}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              Page {page} of {totalPages}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={goToNextPage}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* View Order Details Dialog */}
      <Dialog open={!!viewOrder} onOpenChange={(open) => !open && setViewOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Full details for this order.</DialogDescription>
          </DialogHeader>
          {viewOrder && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-medium break-all text-right">{viewOrder.id}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Customer Name</span>
                <span className="font-medium">{viewOrder.customer_name || "Guest"}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium">{viewOrder.customer_phone || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium break-all text-right">{viewOrder.customer_email || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Billing Address</span>
                <span className="font-medium text-right">{resolveBillingAddress(viewOrder)}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Customer GSTIN</span>
                <span className="font-medium">{resolveCustomerGstin(viewOrder)}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium text-right">{viewOrder.service_title}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">₹{Number(viewOrder.total_amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  className={cn("border-0", STATUS_STYLES[viewOrder.status] || STATUS_STYLES.cancelled)}
                >
                  {getStatusLabel(viewOrder.status)}
                </Badge>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium capitalize">{viewOrder.payment_method || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Payment Reference</span>
                <span className="font-medium break-all text-right">{viewOrder.razorpay_payment_id || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Invoice Number</span>
                <span className="font-medium">{viewOrder.invoice_number || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Website</span>
                <span className="font-medium">{viewOrder.source_website || "ankshaastra.com"}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-muted-foreground">Created Date</span>
                <span className="font-medium">{formatDateTime(viewOrder.created_at)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Order Confirmation Dialog */}
      <AlertDialog open={!!deleteOrderId} onOpenChange={(open) => !open && setDeleteOrderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the order from Supabase.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteOrder}
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
