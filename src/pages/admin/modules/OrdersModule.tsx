// import { useMemo, useState } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import { AdminPage } from "@/components/admin/AdminPage";
// import { useAdminTable } from "@/hooks/useAdminData";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { toast } from "sonner";
// import { FileText, Loader2 } from "lucide-react";
// import { generateInvoiceForOrder } from "@/lib/invoice-admin";
// import { CONNECTED_SITE_OPTIONS } from "@/lib/connected-sites";

// type Order = {
//   id: string;
//   service_title: string;
//   total_amount: number;
//   status: string;
//   workflow_stage?: string;
//   source_website?: string;
//   customer_name?: string;
//   created_at: string;
// };

// type OrderStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";

// const orderStatuses: OrderStatus[] = ["pending", "paid", "failed", "refunded", "cancelled"];

// export default function OrdersModule() {
//   const { rows, loading, reload } = useAdminTable<Order>("orders");
//   const [generatingId, setGeneratingId] = useState<string | null>(null);
//   const [siteFilter, setSiteFilter] = useState("all");

//   const filteredRows = useMemo(() => {
//     if (siteFilter === "all") return rows;
//     return rows.filter((o) => (o.source_website || "ankshaastra.com") === siteFilter);
//   }, [rows, siteFilter]);

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

//   const updateStatus = async (id: string, status: OrderStatus) => {
//     const { error } = await supabase.from("orders").update({ status }).eq("id", id);
//     if (error) toast.error(error.message);
//     else {
//       toast.success("Updated");
//       reload();
//     }
//   };

//   const markPaidAndInvoice = async (order: Order) => {
//     if (order.status !== "paid") {
//       const { error } = await supabase
//         .from("orders")
//         .update({ status: "paid", workflow_stage: "payment_received" })
//         .eq("id", order.id);
//       if (error) {
//         toast.error(error.message);
//         return;
//       }
//     }
//     await runGenerateInvoice(order.id);
//   };

//   return (
//     <AdminPage title="Orders & Bookings" description="All orders across connected websites (main, Empower, Miracle Baby)." loading={loading} empty={!filteredRows.length}>
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
//         {filteredRows.map((o) => (
//           <div key={o.id} className="flex flex-wrap gap-3 justify-between items-center border border-border rounded-lg p-4">
//             <div className="min-w-0">
//               <p className="font-semibold truncate">{o.service_title}</p>
//               <p className="text-xs text-muted-foreground">
//                 {o.customer_name || "Guest"} · {o.source_website || "ankshaastra.com"} · {new Date(o.created_at).toLocaleString()}
//               </p>
//               {o.workflow_stage && <Badge variant="outline" className="mt-1 text-xs">{o.workflow_stage}</Badge>}
//             </div>
//             <div className="flex items-center gap-3">
//               <span className="font-semibold">₹{Number(o.total_amount).toLocaleString()}</span>
//               {o.status === "paid" ? (
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   disabled={generatingId === o.id}
//                   onClick={() => runGenerateInvoice(o.id)}
//                 >
//                   {generatingId === o.id ? (
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                   ) : (
//                     <>
//                       <FileText className="w-4 h-4 mr-1" />
//                       Generate Invoice
//                     </>
//                   )}
//                 </Button>
//               ) : (
//                 <Button
//                   size="sm"
//                   variant="secondary"
//                   disabled={generatingId === o.id}
//                   onClick={() => markPaidAndInvoice(o)}
//                 >
//                   {generatingId === o.id ? (
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                   ) : (
//                     "Mark paid + Invoice"
//                   )}
//                 </Button>
//               )}
//               <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v as OrderStatus)}>
//                 <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
//                 <SelectContent>
//                   {orderStatuses.map((s) => (
//                     <SelectItem key={s} value={s}>{s}</SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
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
// import { toast } from "sonner";
// import { FileText, Loader2, Eye, Trash2 } from "lucide-react";
// import { generateInvoiceForOrder } from "@/lib/invoice-admin";
// import { CONNECTED_SITE_OPTIONS } from "@/lib/connected-sites";

// type Order = {
//   id: string;
//   service_title: string;
//   total_amount: number;
//   status: string;
//   workflow_stage?: string;
//   source_website?: string;
//   customer_name?: string;
//   created_at: string;
// };

// type OrderStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";

// const orderStatuses: OrderStatus[] = ["pending", "paid", "failed", "refunded", "cancelled"];

// const PAGE_SIZE = 10;

// export default function OrdersModule() {
//   const { rows, loading, reload } = useAdminTable<Order>("orders");
//   const [generatingId, setGeneratingId] = useState<string | null>(null);
//   const [siteFilter, setSiteFilter] = useState("all");
//   const [search, setSearch] = useState("");

//   // View Order Details dialog state
//   const [viewOrder, setViewOrder] = useState<Order | null>(null);

//   // Delete Order dialog state
//   const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
//   const [deleting, setDeleting] = useState(false);

//   // Pagination state
//   const [page, setPage] = useState(1);

//   const filteredRows = useMemo(() => {
//     let data = rows;

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

//   const updateStatus = async (id: string, status: OrderStatus) => {
//     const { error } = await supabase.from("orders").update({ status }).eq("id", id);
//     if (error) toast.error(error.message);
//     else {
//       toast.success("Updated");
//       reload();
//     }
//   };

//   const markPaidAndInvoice = async (order: Order) => {
//     if (order.status !== "paid") {
//       const { error } = await supabase
//         .from("orders")
//         .update({ status: "paid", workflow_stage: "payment_received" })
//         .eq("id", order.id);
//       if (error) {
//         toast.error(error.message);
//         return;
//       }
//     }
//     await runGenerateInvoice(order.id);
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
//     <AdminPage title="Orders & Bookings" description="All orders across connected websites (main, Empower, Miracle Baby)." loading={loading} empty={!filteredRows.length}>
//       <div className="mb-4 flex flex-wrap items-center gap-3">
//         <Input
//           placeholder="Search by customer, service, order id or status..."
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
//       </div>

//       <div className="space-y-2">
//         {paginatedRows.map((o) => (
//           <div key={o.id} className="flex flex-wrap gap-3 justify-between items-center border border-border rounded-lg p-4">
//             <div className="min-w-0">
//               <p className="font-semibold truncate">{o.service_title}</p>
//               <p className="text-xs text-muted-foreground">
//                 {o.customer_name || "Guest"} · {o.source_website || "ankshaastra.com"} · {new Date(o.created_at).toLocaleString()}
//               </p>
//               {o.workflow_stage && <Badge variant="outline" className="mt-1 text-xs">{o.workflow_stage}</Badge>}
//             </div>
//             <div className="flex items-center gap-3">
//               <span className="font-semibold">₹{Number(o.total_amount).toLocaleString()}</span>
//               {o.status === "paid" ? (
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   disabled={generatingId === o.id}
//                   onClick={() => runGenerateInvoice(o.id)}
//                 >
//                   {generatingId === o.id ? (
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                   ) : (
//                     <>
//                       <FileText className="w-4 h-4 mr-1" />
//                       Generate Invoice
//                     </>
//                   )}
//                 </Button>
//               ) : (
//                 <Button
//                   size="sm"
//                   variant="secondary"
//                   disabled={generatingId === o.id}
//                   onClick={() => markPaidAndInvoice(o)}
//                 >
//                   {generatingId === o.id ? (
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                   ) : (
//                     "Mark paid + Invoice"
//                   )}
//                 </Button>
//               )}
//               <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v as OrderStatus)}>
//                 <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
//                 <SelectContent>
//                   {orderStatuses.map((s) => (
//                     <SelectItem key={s} value={s}>{s}</SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>

//               <Button
//                 size="sm"
//                 variant="outline"
//                 onClick={() => setViewOrder(o)}
//               >
//                 <Eye className="w-4 h-4 mr-1" />
//                 View
//               </Button>

//               <Button
//                 size="sm"
//                 variant="destructive"
//                 onClick={() => setDeleteOrderId(o.id)}
//               >
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
//             Page {page} of {totalPages} · {filteredRows.length} orders
//           </p>
//           <div className="flex items-center gap-2">
//             <Button
//               size="sm"
//               variant="outline"
//               onClick={goToPreviousPage}
//               disabled={page <= 1}
//             >
//               Previous
//             </Button>
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
//                 <span className="text-muted-foreground">Service</span>
//                 <span className="font-medium text-right">{viewOrder.service_title}</span>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Amount</span>
//                 <span className="font-medium">₹{Number(viewOrder.total_amount).toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Status</span>
//                 <Badge variant="outline">{viewOrder.status}</Badge>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Website</span>
//                 <span className="font-medium">{viewOrder.source_website || "ankshaastra.com"}</span>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Workflow Stage</span>
//                 <span className="font-medium">{viewOrder.workflow_stage || "—"}</span>
//               </div>
//               <div className="flex justify-between pb-1">
//                 <span className="text-muted-foreground">Created Date</span>
//                 <span className="font-medium">{new Date(viewOrder.created_at).toLocaleString()}</span>
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
import { toast } from "sonner";
import { FileText, Loader2, Eye, Trash2, MoreVertical } from "lucide-react";
import { generateInvoiceForOrder } from "@/lib/invoice-admin";
import { CONNECTED_SITE_OPTIONS } from "@/lib/connected-sites";
import { cn } from "@/lib/utils";

type Order = {
  id: string;
  service_title: string;
  total_amount: number;
  status: string;
  workflow_stage?: string;
  source_website?: string;
  customer_name?: string;
  created_at: string;
};

type OrderStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";

const orderStatuses: OrderStatus[] = ["pending", "paid", "failed", "refunded", "cancelled"];

// Fixed, consistent status → color mapping, used everywhere a status badge
// appears: green = paid/completed, amber = pending, red = failed, gray = other.
// This is the only place status colors are defined, so every screen stays
// visually consistent instead of inventing its own shade.
const STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  pending: "bg-amber-100 text-amber-700 hover:bg-amber-200",
  failed: "bg-red-100 text-red-700 hover:bg-red-200",
  refunded: "bg-slate-200 text-slate-700 hover:bg-slate-300",
  cancelled: "bg-slate-200 text-slate-600 hover:bg-slate-300",
};

const PAGE_SIZE = 10;

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const datePart = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const timePart = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return `${datePart}, ${timePart}`;
}

export default function OrdersModule() {
  const { rows, loading, reload } = useAdminTable<Order>("orders");
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [siteFilter, setSiteFilter] = useState("all");
  const [search, setSearch] = useState("");

  // View Order Details dialog state
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  // Delete Order dialog state
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    let data = rows;

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

  const runGenerateInvoice = async (orderId: string) => {
    setGeneratingId(orderId);
    try {
      const result = await generateInvoiceForOrder(orderId);
      toast.success(
        result.invoice_number
          ? `Invoice ${result.invoice_number} generated and emailed`
          : "Invoice generated and emailed",
      );
      reload();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to generate invoice");
    } finally {
      setGeneratingId(null);
    }
  };

  const updateStatus = async (id: string, status: OrderStatus) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Updated");
      reload();
    }
  };

  const markPaidAndInvoice = async (order: Order) => {
    if (order.status !== "paid") {
      const { error } = await supabase
        .from("orders")
        .update({ status: "paid", workflow_stage: "payment_received" })
        .eq("id", order.id);
      if (error) {
        toast.error(error.message);
        return;
      }
    }
    await runGenerateInvoice(order.id);
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
    <AdminPage title="Orders & Bookings" description="All orders across connected websites (main, Empower, Miracle Baby)." loading={loading} empty={!filteredRows.length}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by customer, service, order id or status..."
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
      </div>

      <div className="space-y-2">
        {paginatedRows.map((o) => (
          <div key={o.id} className="flex flex-wrap gap-3 justify-between items-center border border-border rounded-lg p-4">
            <div className="min-w-0">
              <p className="font-semibold truncate">{o.service_title}</p>
              <p className="text-xs text-muted-foreground">
                {o.customer_name || "Guest"} · {o.source_website || "ankshaastra.com"} · {formatDateTime(o.created_at)}
              </p>
              {o.workflow_stage && <Badge variant="outline" className="mt-1 text-xs">{o.workflow_stage}</Badge>}
            </div>

            <div className="flex items-center gap-3">
              <span className="font-semibold">₹{Number(o.total_amount).toLocaleString()}</span>

              {/* Status shown as a color-coded badge (green=paid, amber=pending,
                  red=failed, gray=other) — the dropdown chevron is kept small and
                  muted so it reads as a status indicator first, an editable
                  control second. */}
              <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v as OrderStatus)}>
                <SelectTrigger
                  className={cn(
                    "h-7 w-auto gap-1 rounded-full border-0 px-3 text-xs font-medium capitalize shadow-none [&>svg]:h-3 [&>svg]:w-3 [&>svg]:opacity-60",
                    STATUS_STYLES[o.status] || STATUS_STYLES.cancelled
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {orderStatuses.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

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

              {/* Less-frequent / destructive actions live behind a kebab menu so
                  Delete no longer sits at the same size and prominence as every
                  other action on the row. */}
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
                  {o.status === "paid" ? (
                    <DropdownMenuItem
                      disabled={generatingId === o.id}
                      onClick={() => runGenerateInvoice(o.id)}
                    >
                      {generatingId === o.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4 mr-2" />
                      )}
                      Generate Invoice
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      disabled={generatingId === o.id}
                      onClick={() => markPaidAndInvoice(o)}
                    >
                      {generatingId === o.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4 mr-2" />
                      )}
                      Mark paid + Invoice
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
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
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages} · {filteredRows.length} orders
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={goToPreviousPage}
              disabled={page <= 1}
            >
              Previous
            </Button>
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
                  className={cn("capitalize border-0", STATUS_STYLES[viewOrder.status] || STATUS_STYLES.cancelled)}
                >
                  {viewOrder.status}
                </Badge>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Website</span>
                <span className="font-medium">{viewOrder.source_website || "ankshaastra.com"}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Workflow Stage</span>
                <span className="font-medium">{viewOrder.workflow_stage || "—"}</span>
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