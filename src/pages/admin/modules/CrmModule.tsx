// // // // import { AdminPage } from "@/components/admin/AdminPage";
// // // // import { useAdminTable } from "@/hooks/useAdminData";
// // // // import { Badge } from "@/components/ui/badge";

// // // // type Customer = {
// // // //   id: string;
// // // //   full_name: string;
// // // //   email?: string;
// // // //   phone?: string;
// // // //   source_website?: string;
// // // //   lifecycle_stage?: string;
// // // //   created_at: string;
// // // // };

// // // // export default function CrmModule() {
// // // //   const { rows, loading } = useAdminTable<Customer>("customers");
// // // //   return (
// // // //     <AdminPage title="CRM" description="Customer lifecycle across all properties." loading={loading} empty={!rows.length}>
// // // //       <div className="space-y-2">
// // // //         {rows.map((c) => (
// // // //           <div key={c.id} className="border border-border rounded-lg p-4 flex justify-between gap-3">
// // // //             <div>
// // // //               <p className="font-semibold">{c.full_name}</p>
// // // //               <p className="text-sm text-muted-foreground">{c.email || "—"} · {c.phone || "—"}</p>
// // // //               <p className="text-xs text-muted-foreground mt-1">{c.source_website}</p>
// // // //             </div>
// // // //             <Badge variant="outline">{c.lifecycle_stage || "lead"}</Badge>
// // // //           </div>
// // // //         ))}
// // // //       </div>
// // // //     </AdminPage>
// // // //   );
// // // // }


// // // // import { useEffect, useMemo, useState } from "react";
// // // // import { AdminPage } from "@/components/admin/AdminPage";
// // // // import { useAdminTable } from "@/hooks/useAdminData";
// // // // import { supabase } from "@/integrations/supabase/client";
// // // // import { Badge } from "@/components/ui/badge";
// // // // import { Button } from "@/components/ui/button";
// // // // import { Input } from "@/components/ui/input";
// // // // import { Label } from "@/components/ui/label";
// // // // import {
// // // //   Select,
// // // //   SelectContent,
// // // //   SelectItem,
// // // //   SelectTrigger,
// // // //   SelectValue,
// // // // } from "@/components/ui/select";
// // // // import {
// // // //   Dialog,
// // // //   DialogContent,
// // // //   DialogDescription,
// // // //   DialogFooter,
// // // //   DialogHeader,
// // // //   DialogTitle,
// // // // } from "@/components/ui/dialog";
// // // // import {
// // // //   AlertDialog,
// // // //   AlertDialogAction,
// // // //   AlertDialogCancel,
// // // //   AlertDialogContent,
// // // //   AlertDialogDescription,
// // // //   AlertDialogFooter,
// // // //   AlertDialogHeader,
// // // //   AlertDialogTitle,
// // // // } from "@/components/ui/alert-dialog";
// // // // import { toast } from "sonner";
// // // // import { Search as SearchIcon } from "lucide-react";

// // // // type Customer = {
// // // //   id: string;
// // // //   full_name: string;
// // // //   email?: string;
// // // //   phone?: string;
// // // //   source_website?: string;
// // // //   lifecycle_stage?: string;
// // // //   created_at: string;
// // // // };

// // // // type RelatedRecord = {
// // // //   id: string;
// // // //   status?: string;
// // // //   total?: number | string;
// // // //   amount?: number | string;
// // // //   created_at?: string;
// // // //   [key: string]: any;
// // // // };

// // // // const WEBSITE_OPTIONS = ["All", "Ankshaastra", "Miracle Baby", "Empower"];
// // // // const LEAD_STATUS_OPTIONS = ["All", "Lead", "Qualified", "Customer", "Completed", "Lost"];
// // // // const DATE_FILTER_OPTIONS = [
// // // //   { value: "all", label: "All Time" },
// // // //   { value: "today", label: "Today" },
// // // //   { value: "week", label: "This Week" },
// // // //   { value: "month", label: "This Month" },
// // // // ];

// // // // const PAGE_SIZE = 10;

// // // // function isSameDay(a: Date, b: Date) {
// // // //   return (
// // // //     a.getFullYear() === b.getFullYear() &&
// // // //     a.getMonth() === b.getMonth() &&
// // // //     a.getDate() === b.getDate()
// // // //   );
// // // // }

// // // // function isThisWeek(date: Date, now: Date) {
// // // //   const startOfWeek = new Date(now);
// // // //   const diffToMonday = (now.getDay() + 6) % 7; // week starts Monday
// // // //   startOfWeek.setDate(now.getDate() - diffToMonday);
// // // //   startOfWeek.setHours(0, 0, 0, 0);
// // // //   const endOfWeek = new Date(startOfWeek);
// // // //   endOfWeek.setDate(startOfWeek.getDate() + 7);
// // // //   return date >= startOfWeek && date < endOfWeek;
// // // // }

// // // // function isThisMonth(date: Date, now: Date) {
// // // //   return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
// // // // }

// // // // export default function CrmModule() {
// // // //   const { rows, loading } = useAdminTable<Customer>("customers");

// // // //   // Local mirror of the hook's data so we can refresh/mutate after edits & deletes
// // // //   // without needing to change the shared useAdminTable hook.
// // // //   const [customers, setCustomers] = useState<Customer[]>([]);
// // // //   const [refreshing, setRefreshing] = useState(false);

// // // //   const [searchTerm, setSearchTerm] = useState("");
// // // //   const [websiteFilter, setWebsiteFilter] = useState("All");
// // // //   const [leadStatusFilter, setLeadStatusFilter] = useState("All");
// // // //   const [dateFilter, setDateFilter] = useState("all");
// // // //   const [page, setPage] = useState(1);

// // // //   const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
// // // //   const [editLifecycleStage, setEditLifecycleStage] = useState("Lead");
// // // //   const [savingEdit, setSavingEdit] = useState(false);
// // // //   const [orders, setOrders] = useState<RelatedRecord[]>([]);
// // // //   const [invoices, setInvoices] = useState<RelatedRecord[]>([]);
// // // //   const [loadingRelated, setLoadingRelated] = useState(false);

// // // //   const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
// // // //   const [deleting, setDeleting] = useState(false);

// // // //   useEffect(() => {
// // // //     setCustomers(rows);
// // // //   }, [rows]);

// // // //   useEffect(() => {
// // // //     setPage(1);
// // // //   }, [searchTerm, websiteFilter, leadStatusFilter, dateFilter]);

// // // //   const refetchCustomers = async () => {
// // // //     setRefreshing(true);
// // // //     try {
// // // //       const { data, error } = await supabase
// // // //         .from("customers")
// // // //         .select("*")
// // // //         .order("created_at", { ascending: false });
// // // //       if (error) throw error;
// // // //       setCustomers((data as Customer[]) || []);
// // // //     } catch (err) {
// // // //       console.error("Failed to refresh customers", err);
// // // //       toast.error("Couldn't refresh customers", {
// // // //         description: "Please try again.",
// // // //       });
// // // //     } finally {
// // // //       setRefreshing(false);
// // // //     }
// // // //   };

// // // //   const filteredCustomers = useMemo(() => {
// // // //     const now = new Date();
// // // //     const term = searchTerm.trim().toLowerCase();

// // // //     return customers.filter((c) => {
// // // //       if (term) {
// // // //         const haystack = [c.full_name, c.email, c.phone, c.source_website]
// // // //           .filter(Boolean)
// // // //           .join(" ")
// // // //           .toLowerCase();
// // // //         if (!haystack.includes(term)) return false;
// // // //       }

// // // //       if (websiteFilter !== "All" && c.source_website !== websiteFilter) {
// // // //         return false;
// // // //       }

// // // //       if (leadStatusFilter !== "All") {
// // // //         const stage = c.lifecycle_stage || "Lead";
// // // //         if (stage.toLowerCase() !== leadStatusFilter.toLowerCase()) return false;
// // // //       }

// // // //       if (dateFilter !== "all" && c.created_at) {
// // // //         const created = new Date(c.created_at);
// // // //         if (dateFilter === "today" && !isSameDay(created, now)) return false;
// // // //         if (dateFilter === "week" && !isThisWeek(created, now)) return false;
// // // //         if (dateFilter === "month" && !isThisMonth(created, now)) return false;
// // // //       }

// // // //       return true;
// // // //     });
// // // //   }, [customers, searchTerm, websiteFilter, leadStatusFilter, dateFilter]);

// // // //   const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / PAGE_SIZE));
// // // //   const paginatedCustomers = useMemo(() => {
// // // //     const start = (page - 1) * PAGE_SIZE;
// // // //     return filteredCustomers.slice(start, start + PAGE_SIZE);
// // // //   }, [filteredCustomers, page]);

// // // //   const hasActiveFilters =
// // // //     !!searchTerm || websiteFilter !== "All" || leadStatusFilter !== "All" || dateFilter !== "all";

// // // //   const clearFilters = () => {
// // // //     setSearchTerm("");
// // // //     setWebsiteFilter("All");
// // // //     setLeadStatusFilter("All");
// // // //     setDateFilter("all");
// // // //   };

// // // //   const openViewDialog = async (customer: Customer) => {
// // // //     setViewCustomer(customer);
// // // //     setEditLifecycleStage(customer.lifecycle_stage || "Lead");
// // // //     setOrders([]);
// // // //     setInvoices([]);
// // // //     setLoadingRelated(true);
// // // //     try {
// // // //       const [ordersRes, invoicesRes] = await Promise.all([
// // // //         supabase.from("orders").select("*").eq("customer_id", customer.id),
// // // //         supabase.from("invoices").select("*").eq("customer_id", customer.id),
// // // //       ]);
// // // //       if (!ordersRes.error && ordersRes.data) setOrders(ordersRes.data as RelatedRecord[]);
// // // //       if (!invoicesRes.error && invoicesRes.data) setInvoices(invoicesRes.data as RelatedRecord[]);
// // // //     } catch (err) {
// // // //       // Orders/invoices tables may not exist in every deployment — fail quietly, they're optional.
// // // //       console.warn("Orders/invoices lookup skipped:", err);
// // // //     } finally {
// // // //       setLoadingRelated(false);
// // // //     }
// // // //   };

// // // //   const closeViewDialog = () => {
// // // //     setViewCustomer(null);
// // // //     setOrders([]);
// // // //     setInvoices([]);
// // // //   };

// // // //   const handleSaveEdit = async () => {
// // // //     if (!viewCustomer) return;
// // // //     setSavingEdit(true);
// // // //     try {
// // // //       const { error } = await supabase
// // // //         .from("customers")
// // // //         .update({ lifecycle_stage: editLifecycleStage })
// // // //         .eq("id", viewCustomer.id);
// // // //       if (error) throw error;

// // // //       setCustomers((prev) =>
// // // //         prev.map((c) =>
// // // //           c.id === viewCustomer.id ? { ...c, lifecycle_stage: editLifecycleStage } : c
// // // //         )
// // // //       );
// // // //       toast.success("Customer updated", {
// // // //         description: `${viewCustomer.full_name}'s lead status was saved.`,
// // // //       });
// // // //       closeViewDialog();
// // // //     } catch (err) {
// // // //       console.error("Failed to update customer", err);
// // // //       toast.error("Couldn't save changes", {
// // // //         description: "Please try again.",
// // // //       });
// // // //     } finally {
// // // //       setSavingEdit(false);
// // // //     }
// // // //   };

// // // //   const handleDelete = async () => {
// // // //     if (!deleteTarget) return;
// // // //     setDeleting(true);
// // // //     try {
// // // //       const { error } = await supabase.from("customers").delete().eq("id", deleteTarget.id);
// // // //       if (error) throw error;

// // // //       toast.success("Customer deleted", {
// // // //         description: `${deleteTarget.full_name} was removed.`,
// // // //       });
// // // //       setDeleteTarget(null);
// // // //       await refetchCustomers();
// // // //     } catch (err) {
// // // //       console.error("Failed to delete customer", err);
// // // //       toast.error("Couldn't delete customer", {
// // // //         description: "Please try again.",
// // // //       });
// // // //     } finally {
// // // //       setDeleting(false);
// // // //     }
// // // //   };

// // // //   return (
// // // //     <AdminPage
// // // //       title="CRM"
// // // //       description="Customer lifecycle across all properties."
// // // //       loading={loading}
// // // //       empty={!loading && !customers.length}
// // // //     >
// // // //       <div className="space-y-4">
// // // //         {/* Search + Filters */}
// // // //         <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
// // // //           <div className="relative w-full sm:max-w-xs">
// // // //             <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
// // // //             <Input
// // // //               value={searchTerm}
// // // //               onChange={(e) => setSearchTerm(e.target.value)}
// // // //               placeholder="Search name, email, phone, website..."
// // // //               className="pl-8"
// // // //             />
// // // //           </div>

// // // //           <Select value={websiteFilter} onValueChange={setWebsiteFilter}>
// // // //             <SelectTrigger className="w-full sm:w-[180px]">
// // // //               <SelectValue placeholder="Website" />
// // // //             </SelectTrigger>
// // // //             <SelectContent>
// // // //               {WEBSITE_OPTIONS.map((opt) => (
// // // //                 <SelectItem key={opt} value={opt}>
// // // //                   {opt}
// // // //                 </SelectItem>
// // // //               ))}
// // // //             </SelectContent>
// // // //           </Select>

// // // //           <Select value={leadStatusFilter} onValueChange={setLeadStatusFilter}>
// // // //             <SelectTrigger className="w-full sm:w-[180px]">
// // // //               <SelectValue placeholder="Lead Status" />
// // // //             </SelectTrigger>
// // // //             <SelectContent>
// // // //               {LEAD_STATUS_OPTIONS.map((opt) => (
// // // //                 <SelectItem key={opt} value={opt}>
// // // //                   {opt}
// // // //                 </SelectItem>
// // // //               ))}
// // // //             </SelectContent>
// // // //           </Select>

// // // //           <Select value={dateFilter} onValueChange={setDateFilter}>
// // // //             <SelectTrigger className="w-full sm:w-[160px]">
// // // //               <SelectValue placeholder="Date" />
// // // //             </SelectTrigger>
// // // //             <SelectContent>
// // // //               {DATE_FILTER_OPTIONS.map((opt) => (
// // // //                 <SelectItem key={opt.value} value={opt.value}>
// // // //                   {opt.label}
// // // //                 </SelectItem>
// // // //               ))}
// // // //             </SelectContent>
// // // //           </Select>

// // // //           {hasActiveFilters && (
// // // //             <Button variant="ghost" size="sm" onClick={clearFilters}>
// // // //               Clear filters
// // // //             </Button>
// // // //           )}
// // // //         </div>

// // // //         <p className="text-sm text-muted-foreground">
// // // //           {filteredCustomers.length} customer{filteredCustomers.length === 1 ? "" : "s"} found
// // // //           {refreshing ? " · refreshing…" : ""}
// // // //         </p>

// // // //         {/* Customer list */}
// // // //         <div className="space-y-2">
// // // //           {paginatedCustomers.map((c) => (
// // // //             <div
// // // //               key={c.id}
// // // //               className="border border-border rounded-lg p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
// // // //             >
// // // //               <div className="min-w-0">
// // // //                 <p className="font-semibold truncate">{c.full_name}</p>
// // // //                 <p className="text-sm text-muted-foreground truncate">
// // // //                   {c.email || "—"} · {c.phone || "—"}
// // // //                 </p>
// // // //               </div>

// // // //               <div className="flex flex-wrap items-center gap-2 sm:justify-end">
// // // //                 {c.source_website && <Badge variant="secondary">{c.source_website}</Badge>}
// // // //                 <Badge variant="outline">{c.lifecycle_stage || "Lead"}</Badge>

// // // //                 <div className="flex gap-2 sm:ml-2">
// // // //                   <Button size="sm" variant="outline" onClick={() => openViewDialog(c)}>
// // // //                     View
// // // //                   </Button>
// // // //                   <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(c)}>
// // // //                     Delete
// // // //                   </Button>
// // // //                 </div>
// // // //               </div>
// // // //             </div>
// // // //           ))}

// // // //           {!loading && !paginatedCustomers.length && (
// // // //             <p className="text-sm text-muted-foreground text-center py-8">
// // // //               No customers match your search or filters.
// // // //             </p>
// // // //           )}
// // // //         </div>

// // // //         {/* Pagination */}
// // // //         {filteredCustomers.length > 0 && (
// // // //           <div className="flex items-center justify-between pt-2">
// // // //             <p className="text-sm text-muted-foreground">
// // // //               Page {page} of {totalPages}
// // // //             </p>
// // // //             <div className="flex gap-2">
// // // //               <Button
// // // //                 size="sm"
// // // //                 variant="outline"
// // // //                 disabled={page <= 1}
// // // //                 onClick={() => setPage((p) => Math.max(1, p - 1))}
// // // //               >
// // // //                 Previous
// // // //               </Button>
// // // //               <Button
// // // //                 size="sm"
// // // //                 variant="outline"
// // // //                 disabled={page >= totalPages}
// // // //                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
// // // //               >
// // // //                 Next
// // // //               </Button>
// // // //             </div>
// // // //           </div>
// // // //         )}
// // // //       </div>

// // // //       {/* View / Edit Dialog */}
// // // //       <Dialog open={!!viewCustomer} onOpenChange={(open) => !open && closeViewDialog()}>
// // // //         <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
// // // //           {viewCustomer && (
// // // //             <>
// // // //               <DialogHeader>
// // // //                 <DialogTitle>{viewCustomer.full_name}</DialogTitle>
// // // //                 <DialogDescription>Customer details</DialogDescription>
// // // //               </DialogHeader>

// // // //               <div className="space-y-4 py-2">
// // // //                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
// // // //                   <div>
// // // //                     <p className="text-muted-foreground">Email</p>
// // // //                     <p className="font-medium break-all">{viewCustomer.email || "—"}</p>
// // // //                   </div>
// // // //                   <div>
// // // //                     <p className="text-muted-foreground">Phone</p>
// // // //                     <p className="font-medium">{viewCustomer.phone || "—"}</p>
// // // //                   </div>
// // // //                   <div>
// // // //                     <p className="text-muted-foreground">Website</p>
// // // //                     <p className="font-medium">{viewCustomer.source_website || "—"}</p>
// // // //                   </div>
// // // //                   <div>
// // // //                     <p className="text-muted-foreground">Created</p>
// // // //                     <p className="font-medium">
// // // //                       {viewCustomer.created_at
// // // //                         ? new Date(viewCustomer.created_at).toLocaleString()
// // // //                         : "—"}
// // // //                     </p>
// // // //                   </div>
// // // //                 </div>

// // // //                 <div className="space-y-1.5">
// // // //                   <Label htmlFor="lead-status">Lead Status</Label>
// // // //                   <Select value={editLifecycleStage} onValueChange={setEditLifecycleStage}>
// // // //                     <SelectTrigger id="lead-status">
// // // //                       <SelectValue />
// // // //                     </SelectTrigger>
// // // //                     <SelectContent>
// // // //                       {LEAD_STATUS_OPTIONS.filter((o) => o !== "All").map((opt) => (
// // // //                         <SelectItem key={opt} value={opt}>
// // // //                           {opt}
// // // //                         </SelectItem>
// // // //                       ))}
// // // //                     </SelectContent>
// // // //                   </Select>
// // // //                 </div>

// // // //                 <div>
// // // //                   <p className="text-sm font-semibold mb-1.5">Orders</p>
// // // //                   {loadingRelated ? (
// // // //                     <p className="text-sm text-muted-foreground">Loading…</p>
// // // //                   ) : orders.length ? (
// // // //                     <div className="space-y-1.5">
// // // //                       {orders.map((o) => (
// // // //                         <div
// // // //                           key={o.id}
// // // //                           className="text-sm border border-border rounded-md px-3 py-2 flex justify-between"
// // // //                         >
// // // //                           <span>{o.id}</span>
// // // //                           <span className="text-muted-foreground">
// // // //                             {o.status || "—"} {o.total ? `· ${o.total}` : ""}
// // // //                           </span>
// // // //                         </div>
// // // //                       ))}
// // // //                     </div>
// // // //                   ) : (
// // // //                     <p className="text-sm text-muted-foreground">No orders available.</p>
// // // //                   )}
// // // //                 </div>

// // // //                 <div>
// // // //                   <p className="text-sm font-semibold mb-1.5">Invoices</p>
// // // //                   {loadingRelated ? (
// // // //                     <p className="text-sm text-muted-foreground">Loading…</p>
// // // //                   ) : invoices.length ? (
// // // //                     <div className="space-y-1.5">
// // // //                       {invoices.map((inv) => (
// // // //                         <div
// // // //                           key={inv.id}
// // // //                           className="text-sm border border-border rounded-md px-3 py-2 flex justify-between"
// // // //                         >
// // // //                           <span>{inv.id}</span>
// // // //                           <span className="text-muted-foreground">
// // // //                             {inv.status || "—"} {inv.amount ? `· ${inv.amount}` : ""}
// // // //                           </span>
// // // //                         </div>
// // // //                       ))}
// // // //                     </div>
// // // //                   ) : (
// // // //                     <p className="text-sm text-muted-foreground">No invoices available.</p>
// // // //                   )}
// // // //                 </div>
// // // //               </div>

// // // //               <DialogFooter>
// // // //                 <Button variant="outline" onClick={closeViewDialog} disabled={savingEdit}>
// // // //                   Cancel
// // // //                 </Button>
// // // //                 <Button onClick={handleSaveEdit} disabled={savingEdit}>
// // // //                   {savingEdit ? "Saving…" : "Save changes"}
// // // //                 </Button>
// // // //               </DialogFooter>
// // // //             </>
// // // //           )}
// // // //         </DialogContent>
// // // //       </Dialog>

// // // //       {/* Delete confirmation */}
// // // //       <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
// // // //         <AlertDialogContent>
// // // //           <AlertDialogHeader>
// // // //             <AlertDialogTitle>Delete customer?</AlertDialogTitle>
// // // //             <AlertDialogDescription>
// // // //               This will permanently delete{" "}
// // // //               <span className="font-medium">{deleteTarget?.full_name}</span> from your customer
// // // //               records. This action cannot be undone.
// // // //             </AlertDialogDescription>
// // // //           </AlertDialogHeader>
// // // //           <AlertDialogFooter>
// // // //             <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
// // // //             <AlertDialogAction onClick={handleDelete} disabled={deleting}>
// // // //               {deleting ? "Deleting…" : "Delete"}
// // // //             </AlertDialogAction>
// // // //           </AlertDialogFooter>
// // // //         </AlertDialogContent>
// // // //       </AlertDialog>
// // // //     </AdminPage>
// // // //   );
// // // // }

// // // import { useEffect, useMemo, useState } from "react";
// // // import { AdminPage } from "@/components/admin/AdminPage";
// // // import { useAdminTable } from "@/hooks/useAdminData";
// // // import { supabase } from "@/integrations/supabase/client";
// // // import { Badge } from "@/components/ui/badge";
// // // import { Button } from "@/components/ui/button";
// // // import { Input } from "@/components/ui/input";
// // // import { Label } from "@/components/ui/label";
// // // import {
// // //   Select,
// // //   SelectContent,
// // //   SelectItem,
// // //   SelectTrigger,
// // //   SelectValue,
// // // } from "@/components/ui/select";
// // // import {
// // //   Dialog,
// // //   DialogContent,
// // //   DialogDescription,
// // //   DialogFooter,
// // //   DialogHeader,
// // //   DialogTitle,
// // // } from "@/components/ui/dialog";
// // // import {
// // //   AlertDialog,
// // //   AlertDialogAction,
// // //   AlertDialogCancel,
// // //   AlertDialogContent,
// // //   AlertDialogDescription,
// // //   AlertDialogFooter,
// // //   AlertDialogHeader,
// // //   AlertDialogTitle,
// // // } from "@/components/ui/alert-dialog";
// // // import { toast } from "sonner";
// // // import { Search as SearchIcon, Eye, Trash2 } from "lucide-react";
// // // import { cn } from "@/lib/utils";

// // // type Customer = {
// // //   id: string;
// // //   full_name: string;
// // //   email?: string;
// // //   phone?: string;
// // //   source_website?: string;
// // //   lifecycle_stage?: string;
// // //   created_at: string;
// // // };

// // // type RelatedRecord = {
// // //   id: string;
// // //   status?: string;
// // //   total?: number | string;
// // //   amount?: number | string;
// // //   created_at?: string;
// // //   [key: string]: any;
// // // };

// // // const WEBSITE_OPTIONS = ["All", "Ankshaastra", "Miracle Baby", "Empower"];
// // // const LEAD_STATUS_OPTIONS = ["All", "Lead", "Qualified", "Customer", "Completed", "Lost"];
// // // const DATE_FILTER_OPTIONS = [
// // //   { value: "all", label: "All Time" },
// // //   { value: "today", label: "Today" },
// // //   { value: "week", label: "This Week" },
// // //   { value: "month", label: "This Month" },
// // // ];

// // // const PAGE_SIZE = 10;

// // // // Color-coded lifecycle badge styles — one fixed mapping so status always
// // // // means the same thing everywhere (matches the semantic-color pattern used
// // // // on Workflows: green = good / amber = in-progress / red = lost or dead-end).
// // // const LIFECYCLE_BADGE_STYLES: Record<string, string> = {
// // //   lead: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
// // //   qualified: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
// // //   customer: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
// // //   completed: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
// // //   lost: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
// // // };

// // // function getLifecycleBadgeClass(stage?: string) {
// // //   const key = (stage || "lead").toLowerCase();
// // //   return LIFECYCLE_BADGE_STYLES[key] || LIFECYCLE_BADGE_STYLES.lead;
// // // }

// // // function isSameDay(a: Date, b: Date) {
// // //   return (
// // //     a.getFullYear() === b.getFullYear() &&
// // //     a.getMonth() === b.getMonth() &&
// // //     a.getDate() === b.getDate()
// // //   );
// // // }

// // // function isThisWeek(date: Date, now: Date) {
// // //   const startOfWeek = new Date(now);
// // //   const diffToMonday = (now.getDay() + 6) % 7; // week starts Monday
// // //   startOfWeek.setDate(now.getDate() - diffToMonday);
// // //   startOfWeek.setHours(0, 0, 0, 0);
// // //   const endOfWeek = new Date(startOfWeek);
// // //   endOfWeek.setDate(startOfWeek.getDate() + 7);
// // //   return date >= startOfWeek && date < endOfWeek;
// // // }

// // // function isThisMonth(date: Date, now: Date) {
// // //   return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
// // // }

// // // export default function CrmModule() {
// // //   const { rows, loading } = useAdminTable<Customer>("customers");

// // //   // Local mirror of the hook's data so we can refresh/mutate after edits & deletes
// // //   // without needing to change the shared useAdminTable hook.
// // //   const [customers, setCustomers] = useState<Customer[]>([]);
// // //   const [refreshing, setRefreshing] = useState(false);

// // //   const [searchTerm, setSearchTerm] = useState("");
// // //   const [websiteFilter, setWebsiteFilter] = useState("All");
// // //   const [leadStatusFilter, setLeadStatusFilter] = useState("All");
// // //   const [dateFilter, setDateFilter] = useState("all");
// // //   const [page, setPage] = useState(1);

// // //   const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
// // //   const [editLifecycleStage, setEditLifecycleStage] = useState("Lead");
// // //   const [savingEdit, setSavingEdit] = useState(false);
// // //   const [orders, setOrders] = useState<RelatedRecord[]>([]);
// // //   const [invoices, setInvoices] = useState<RelatedRecord[]>([]);
// // //   const [loadingRelated, setLoadingRelated] = useState(false);

// // //   const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
// // //   const [deleting, setDeleting] = useState(false);

// // //   useEffect(() => {
// // //     setCustomers(rows);
// // //   }, [rows]);

// // //   useEffect(() => {
// // //     setPage(1);
// // //   }, [searchTerm, websiteFilter, leadStatusFilter, dateFilter]);

// // //   const refetchCustomers = async () => {
// // //     setRefreshing(true);
// // //     try {
// // //       const { data, error } = await supabase
// // //         .from("customers")
// // //         .select("*")
// // //         .order("created_at", { ascending: false });
// // //       if (error) throw error;
// // //       setCustomers((data as Customer[]) || []);
// // //     } catch (err) {
// // //       console.error("Failed to refresh customers", err);
// // //       toast.error("Couldn't refresh customers", {
// // //         description: "Please try again.",
// // //       });
// // //     } finally {
// // //       setRefreshing(false);
// // //     }
// // //   };

// // //   const filteredCustomers = useMemo(() => {
// // //     const now = new Date();
// // //     const term = searchTerm.trim().toLowerCase();

// // //     return customers.filter((c) => {
// // //       if (term) {
// // //         const haystack = [c.full_name, c.email, c.phone, c.source_website]
// // //           .filter(Boolean)
// // //           .join(" ")
// // //           .toLowerCase();
// // //         if (!haystack.includes(term)) return false;
// // //       }

// // //       if (websiteFilter !== "All" && c.source_website !== websiteFilter) {
// // //         return false;
// // //       }

// // //       if (leadStatusFilter !== "All") {
// // //         const stage = c.lifecycle_stage || "Lead";
// // //         if (stage.toLowerCase() !== leadStatusFilter.toLowerCase()) return false;
// // //       }

// // //       if (dateFilter !== "all" && c.created_at) {
// // //         const created = new Date(c.created_at);
// // //         if (dateFilter === "today" && !isSameDay(created, now)) return false;
// // //         if (dateFilter === "week" && !isThisWeek(created, now)) return false;
// // //         if (dateFilter === "month" && !isThisMonth(created, now)) return false;
// // //       }

// // //       return true;
// // //     });
// // //   }, [customers, searchTerm, websiteFilter, leadStatusFilter, dateFilter]);

// // //   const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / PAGE_SIZE));
// // //   const paginatedCustomers = useMemo(() => {
// // //     const start = (page - 1) * PAGE_SIZE;
// // //     return filteredCustomers.slice(start, start + PAGE_SIZE);
// // //   }, [filteredCustomers, page]);

// // //   const hasActiveFilters =
// // //     !!searchTerm || websiteFilter !== "All" || leadStatusFilter !== "All" || dateFilter !== "all";

// // //   const clearFilters = () => {
// // //     setSearchTerm("");
// // //     setWebsiteFilter("All");
// // //     setLeadStatusFilter("All");
// // //     setDateFilter("all");
// // //   };

// // //   const openViewDialog = async (customer: Customer) => {
// // //     setViewCustomer(customer);
// // //     setEditLifecycleStage(customer.lifecycle_stage || "Lead");
// // //     setOrders([]);
// // //     setInvoices([]);
// // //     setLoadingRelated(true);
// // //     try {
// // //       const [ordersRes, invoicesRes] = await Promise.all([
// // //         supabase.from("orders").select("*").eq("customer_id", customer.id),
// // //         supabase.from("invoices").select("*").eq("customer_id", customer.id),
// // //       ]);
// // //       if (!ordersRes.error && ordersRes.data) setOrders(ordersRes.data as RelatedRecord[]);
// // //       if (!invoicesRes.error && invoicesRes.data) setInvoices(invoicesRes.data as RelatedRecord[]);
// // //     } catch (err) {
// // //       // Orders/invoices tables may not exist in every deployment — fail quietly, they're optional.
// // //       console.warn("Orders/invoices lookup skipped:", err);
// // //     } finally {
// // //       setLoadingRelated(false);
// // //     }
// // //   };

// // //   const closeViewDialog = () => {
// // //     setViewCustomer(null);
// // //     setOrders([]);
// // //     setInvoices([]);
// // //   };

// // //   const handleSaveEdit = async () => {
// // //     if (!viewCustomer) return;
// // //     setSavingEdit(true);
// // //     try {
// // //       const { error } = await supabase
// // //         .from("customers")
// // //         .update({ lifecycle_stage: editLifecycleStage })
// // //         .eq("id", viewCustomer.id);
// // //       if (error) throw error;

// // //       setCustomers((prev) =>
// // //         prev.map((c) =>
// // //           c.id === viewCustomer.id ? { ...c, lifecycle_stage: editLifecycleStage } : c
// // //         )
// // //       );
// // //       toast.success("Customer updated", {
// // //         description: `${viewCustomer.full_name}'s lead status was saved.`,
// // //       });
// // //       closeViewDialog();
// // //     } catch (err) {
// // //       console.error("Failed to update customer", err);
// // //       toast.error("Couldn't save changes", {
// // //         description: "Please try again.",
// // //       });
// // //     } finally {
// // //       setSavingEdit(false);
// // //     }
// // //   };

// // //   const handleDelete = async () => {
// // //     if (!deleteTarget) return;
// // //     setDeleting(true);
// // //     try {
// // //       const { error } = await supabase.from("customers").delete().eq("id", deleteTarget.id);
// // //       if (error) throw error;

// // //       toast.success("Customer deleted", {
// // //         description: `${deleteTarget.full_name} was removed.`,
// // //       });
// // //       setDeleteTarget(null);
// // //       await refetchCustomers();
// // //     } catch (err) {
// // //       console.error("Failed to delete customer", err);
// // //       toast.error("Couldn't delete customer", {
// // //         description: "Please try again.",
// // //       });
// // //     } finally {
// // //       setDeleting(false);
// // //     }
// // //   };

// // //   return (
// // //     <AdminPage
// // //       title="CRM"
// // //       description="Customer lifecycle across all properties."
// // //       loading={loading}
// // //       empty={!loading && !customers.length}
// // //     >
// // //       <div className="space-y-4">
// // //         {/* Search + Filters */}
// // //         <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
// // //           <div className="relative w-full sm:max-w-xs">
// // //             <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
// // //             <Input
// // //               value={searchTerm}
// // //               onChange={(e) => setSearchTerm(e.target.value)}
// // //               placeholder="Search name, email, phone, website..."
// // //               className="pl-8"
// // //             />
// // //           </div>

// // //           <Select value={websiteFilter} onValueChange={setWebsiteFilter}>
// // //             <SelectTrigger className="w-full sm:w-[180px]">
// // //               <SelectValue placeholder="Website" />
// // //             </SelectTrigger>
// // //             <SelectContent>
// // //               {WEBSITE_OPTIONS.map((opt) => (
// // //                 <SelectItem key={opt} value={opt}>
// // //                   {opt}
// // //                 </SelectItem>
// // //               ))}
// // //             </SelectContent>
// // //           </Select>

// // //           <Select value={leadStatusFilter} onValueChange={setLeadStatusFilter}>
// // //             <SelectTrigger className="w-full sm:w-[180px]">
// // //               <SelectValue placeholder="Lead Status" />
// // //             </SelectTrigger>
// // //             <SelectContent>
// // //               {LEAD_STATUS_OPTIONS.map((opt) => (
// // //                 <SelectItem key={opt} value={opt}>
// // //                   {opt}
// // //                 </SelectItem>
// // //               ))}
// // //             </SelectContent>
// // //           </Select>

// // //           <Select value={dateFilter} onValueChange={setDateFilter}>
// // //             <SelectTrigger className="w-full sm:w-[160px]">
// // //               <SelectValue placeholder="Date" />
// // //             </SelectTrigger>
// // //             <SelectContent>
// // //               {DATE_FILTER_OPTIONS.map((opt) => (
// // //                 <SelectItem key={opt.value} value={opt.value}>
// // //                   {opt.label}
// // //                 </SelectItem>
// // //               ))}
// // //             </SelectContent>
// // //           </Select>

// // //           {hasActiveFilters && (
// // //             <Button variant="ghost" size="sm" onClick={clearFilters}>
// // //               Clear filters
// // //             </Button>
// // //           )}
// // //         </div>

// // //         <p className="text-sm text-muted-foreground">
// // //           {filteredCustomers.length} customer{filteredCustomers.length === 1 ? "" : "s"} found
// // //           {refreshing ? " · refreshing…" : ""}
// // //         </p>

// // //         {/* Customer list */}
// // //         <div className="space-y-2">
// // //           {paginatedCustomers.map((c) => (
// // //             <div
// // //               key={c.id}
// // //               className="border border-border rounded-lg p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
// // //             >
// // //               <div className="min-w-0">
// // //                 <p className="font-semibold truncate">{c.full_name}</p>
// // //                 <p className="text-sm text-muted-foreground truncate">
// // //                   {c.email || "—"} · {c.phone || "—"}
// // //                 </p>
// // //               </div>

// // //               <div className="flex flex-wrap items-center gap-2 sm:justify-end">
// // //                 {c.source_website && <Badge variant="secondary">{c.source_website}</Badge>}
// // //                 <Badge
// // //                   variant="outline"
// // //                   className={cn("font-medium", getLifecycleBadgeClass(c.lifecycle_stage))}
// // //                 >
// // //                   {c.lifecycle_stage || "Lead"}
// // //                 </Badge>

// // //                 <div className="flex items-center gap-1 sm:ml-2">
// // //                   <Button
// // //                     size="icon"
// // //                     variant="ghost"
// // //                     className="h-8 w-8 text-muted-foreground hover:text-foreground"
// // //                     onClick={() => openViewDialog(c)}
// // //                     aria-label={`View ${c.full_name}`}
// // //                     title="View"
// // //                   >
// // //                     <Eye className="h-4 w-4" />
// // //                   </Button>
// // //                   <Button
// // //                     size="icon"
// // //                     variant="ghost"
// // //                     className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
// // //                     onClick={() => setDeleteTarget(c)}
// // //                     aria-label={`Delete ${c.full_name}`}
// // //                     title="Delete"
// // //                   >
// // //                     <Trash2 className="h-4 w-4" />
// // //                   </Button>
// // //                 </div>
// // //               </div>
// // //             </div>
// // //           ))}

// // //           {!loading && !paginatedCustomers.length && (
// // //             <p className="text-sm text-muted-foreground text-center py-8">
// // //               No customers match your search or filters.
// // //             </p>
// // //           )}
// // //         </div>

// // //         {/* Pagination */}
// // //         {filteredCustomers.length > 0 && (
// // //           <div className="flex items-center justify-between pt-2">
// // //             <p className="text-sm text-muted-foreground">
// // //               Page {page} of {totalPages}
// // //             </p>
// // //             <div className="flex gap-2">
// // //               <Button
// // //                 size="sm"
// // //                 variant="outline"
// // //                 disabled={page <= 1}
// // //                 onClick={() => setPage((p) => Math.max(1, p - 1))}
// // //               >
// // //                 Previous
// // //               </Button>
// // //               <Button
// // //                 size="sm"
// // //                 variant="outline"
// // //                 disabled={page >= totalPages}
// // //                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
// // //               >
// // //                 Next
// // //               </Button>
// // //             </div>
// // //           </div>
// // //         )}
// // //       </div>

// // //       {/* View / Edit Dialog */}
// // //       <Dialog open={!!viewCustomer} onOpenChange={(open) => !open && closeViewDialog()}>
// // //         <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
// // //           {viewCustomer && (
// // //             <>
// // //               <DialogHeader>
// // //                 <DialogTitle>{viewCustomer.full_name}</DialogTitle>
// // //                 <DialogDescription>Customer details</DialogDescription>
// // //               </DialogHeader>

// // //               <div className="space-y-4 py-2">
// // //                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
// // //                   <div>
// // //                     <p className="text-muted-foreground">Email</p>
// // //                     <p className="font-medium break-all">{viewCustomer.email || "—"}</p>
// // //                   </div>
// // //                   <div>
// // //                     <p className="text-muted-foreground">Phone</p>
// // //                     <p className="font-medium">{viewCustomer.phone || "—"}</p>
// // //                   </div>
// // //                   <div>
// // //                     <p className="text-muted-foreground">Website</p>
// // //                     <p className="font-medium">{viewCustomer.source_website || "—"}</p>
// // //                   </div>
// // //                   <div>
// // //                     <p className="text-muted-foreground">Created</p>
// // //                     <p className="font-medium">
// // //                       {viewCustomer.created_at
// // //                         ? new Date(viewCustomer.created_at).toLocaleString()
// // //                         : "—"}
// // //                     </p>
// // //                   </div>
// // //                 </div>

// // //                 <div className="space-y-1.5">
// // //                   <Label htmlFor="lead-status">Lead Status</Label>
// // //                   <Select value={editLifecycleStage} onValueChange={setEditLifecycleStage}>
// // //                     <SelectTrigger id="lead-status">
// // //                       <SelectValue />
// // //                     </SelectTrigger>
// // //                     <SelectContent>
// // //                       {LEAD_STATUS_OPTIONS.filter((o) => o !== "All").map((opt) => (
// // //                         <SelectItem key={opt} value={opt}>
// // //                           {opt}
// // //                         </SelectItem>
// // //                       ))}
// // //                     </SelectContent>
// // //                   </Select>
// // //                 </div>

// // //                 <div>
// // //                   <p className="text-sm font-semibold mb-1.5">Orders</p>
// // //                   {loadingRelated ? (
// // //                     <p className="text-sm text-muted-foreground">Loading…</p>
// // //                   ) : orders.length ? (
// // //                     <div className="space-y-1.5">
// // //                       {orders.map((o) => (
// // //                         <div
// // //                           key={o.id}
// // //                           className="text-sm border border-border rounded-md px-3 py-2 flex justify-between"
// // //                         >
// // //                           <span>{o.id}</span>
// // //                           <span className="text-muted-foreground">
// // //                             {o.status || "—"} {o.total ? `· ${o.total}` : ""}
// // //                           </span>
// // //                         </div>
// // //                       ))}
// // //                     </div>
// // //                   ) : (
// // //                     <p className="text-sm text-muted-foreground">No orders available.</p>
// // //                   )}
// // //                 </div>

// // //                 <div>
// // //                   <p className="text-sm font-semibold mb-1.5">Invoices</p>
// // //                   {loadingRelated ? (
// // //                     <p className="text-sm text-muted-foreground">Loading…</p>
// // //                   ) : invoices.length ? (
// // //                     <div className="space-y-1.5">
// // //                       {invoices.map((inv) => (
// // //                         <div
// // //                           key={inv.id}
// // //                           className="text-sm border border-border rounded-md px-3 py-2 flex justify-between"
// // //                         >
// // //                           <span>{inv.id}</span>
// // //                           <span className="text-muted-foreground">
// // //                             {inv.status || "—"} {inv.amount ? `· ${inv.amount}` : ""}
// // //                           </span>
// // //                         </div>
// // //                       ))}
// // //                     </div>
// // //                   ) : (
// // //                     <p className="text-sm text-muted-foreground">No invoices available.</p>
// // //                   )}
// // //                 </div>
// // //               </div>

// // //               <DialogFooter>
// // //                 <Button variant="outline" onClick={closeViewDialog} disabled={savingEdit}>
// // //                   Cancel
// // //                 </Button>
// // //                 <Button onClick={handleSaveEdit} disabled={savingEdit}>
// // //                   {savingEdit ? "Saving…" : "Save changes"}
// // //                 </Button>
// // //               </DialogFooter>
// // //             </>
// // //           )}
// // //         </DialogContent>
// // //       </Dialog>

// // //       {/* Delete confirmation */}
// // //       <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
// // //         <AlertDialogContent>
// // //           <AlertDialogHeader>
// // //             <AlertDialogTitle>Delete customer?</AlertDialogTitle>
// // //             <AlertDialogDescription>
// // //               This will permanently delete{" "}
// // //               <span className="font-medium">{deleteTarget?.full_name}</span> from your customer
// // //               records. This action cannot be undone.
// // //             </AlertDialogDescription>
// // //           </AlertDialogHeader>
// // //           <AlertDialogFooter>
// // //             <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
// // //             <AlertDialogAction onClick={handleDelete} disabled={deleting}>
// // //               {deleting ? "Deleting…" : "Delete"}
// // //             </AlertDialogAction>
// // //           </AlertDialogFooter>
// // //         </AlertDialogContent>
// // //       </AlertDialog>
// // //     </AdminPage>
// // //   );
// // // }

// // import { useEffect, useMemo, useState } from "react";
// // import { AdminPage } from "@/components/admin/AdminPage";
// // import { useAdminTable } from "@/hooks/useAdminData";
// // import { supabase } from "@/integrations/supabase/client";
// // import { Badge } from "@/components/ui/badge";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select";
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogDescription,
// //   DialogFooter,
// //   DialogHeader,
// //   DialogTitle,
// // } from "@/components/ui/dialog";
// // import {
// //   AlertDialog,
// //   AlertDialogAction,
// //   AlertDialogCancel,
// //   AlertDialogContent,
// //   AlertDialogDescription,
// //   AlertDialogFooter,
// //   AlertDialogHeader,
// //   AlertDialogTitle,
// // } from "@/components/ui/alert-dialog";
// // import { toast } from "sonner";
// // import { Search as SearchIcon, Eye, Trash2, RotateCcw, XCircle } from "lucide-react";
// // import { cn } from "@/lib/utils";

// // type Customer = {
// //   id: string;
// //   full_name: string;
// //   email?: string;
// //   phone?: string;
// //   source_website?: string;
// //   lifecycle_stage?: string;
// //   created_at: string;
// //   // Soft-delete marker. Nullable timestamp: null/undefined = active record,
// //   // a timestamp = when the record was soft deleted.
// //   deleted_at?: string | null;
// // };

// // type RelatedRecord = {
// //   id: string;
// //   status?: string;
// //   total?: number | string;
// //   amount?: number | string;
// //   created_at?: string;
// //   [key: string]: any;
// // };

// // const WEBSITE_OPTIONS = ["All", "Ankshaastra", "Miracle Baby", "Empower"];
// // const LEAD_STATUS_OPTIONS = ["All", "Lead", "Qualified", "Customer", "Completed", "Lost"];
// // const DATE_FILTER_OPTIONS = [
// //   { value: "all", label: "All Time" },
// //   { value: "today", label: "Today" },
// //   { value: "week", label: "This Week" },
// //   { value: "month", label: "This Month" },
// // ];
// // // Record-status filter — Active hides soft-deleted rows, Deleted shows only them.
// // const RECORD_STATUS_OPTIONS = [
// //   { value: "active", label: "Active" },
// //   { value: "deleted", label: "Deleted" },
// // ];

// // const PAGE_SIZE = 10;

// // // Color-coded lifecycle badge styles — one fixed mapping so status always
// // // means the same thing everywhere (matches the semantic-color pattern used
// // // on Workflows: green = good / amber = in-progress / red = lost or dead-end).
// // const LIFECYCLE_BADGE_STYLES: Record<string, string> = {
// //   lead: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
// //   qualified: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
// //   customer: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
// //   completed: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
// //   lost: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
// // };

// // function getLifecycleBadgeClass(stage?: string) {
// //   const key = (stage || "lead").toLowerCase();
// //   return LIFECYCLE_BADGE_STYLES[key] || LIFECYCLE_BADGE_STYLES.lead;
// // }

// // function isSameDay(a: Date, b: Date) {
// //   return (
// //     a.getFullYear() === b.getFullYear() &&
// //     a.getMonth() === b.getMonth() &&
// //     a.getDate() === b.getDate()
// //   );
// // }

// // function isThisWeek(date: Date, now: Date) {
// //   const startOfWeek = new Date(now);
// //   const diffToMonday = (now.getDay() + 6) % 7; // week starts Monday
// //   startOfWeek.setDate(now.getDate() - diffToMonday);
// //   startOfWeek.setHours(0, 0, 0, 0);
// //   const endOfWeek = new Date(startOfWeek);
// //   endOfWeek.setDate(startOfWeek.getDate() + 7);
// //   return date >= startOfWeek && date < endOfWeek;
// // }

// // function isThisMonth(date: Date, now: Date) {
// //   return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
// // }

// // export default function CrmModule() {
// //   const { rows, loading } = useAdminTable<Customer>("customers");

// //   // Local mirror of the hook's data so we can refresh/mutate after edits & deletes
// //   // without needing to change the shared useAdminTable hook.
// //   const [customers, setCustomers] = useState<Customer[]>([]);
// //   const [refreshing, setRefreshing] = useState(false);

// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [websiteFilter, setWebsiteFilter] = useState("All");
// //   const [leadStatusFilter, setLeadStatusFilter] = useState("All");
// //   const [dateFilter, setDateFilter] = useState("all");
// //   // Active vs Deleted view. Defaults to Active so soft-deleted records stay
// //   // hidden from the normal listing.
// //   const [recordStatusFilter, setRecordStatusFilter] = useState<"active" | "deleted">("active");
// //   const [page, setPage] = useState(1);

// //   const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
// //   const [editLifecycleStage, setEditLifecycleStage] = useState("Lead");
// //   const [savingEdit, setSavingEdit] = useState(false);
// //   const [orders, setOrders] = useState<RelatedRecord[]>([]);
// //   const [invoices, setInvoices] = useState<RelatedRecord[]>([]);
// //   const [loadingRelated, setLoadingRelated] = useState(false);

// //   // Soft-delete confirmation target (Active view)
// //   const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
// //   const [deleting, setDeleting] = useState(false);

// //   // Permanent-delete confirmation target (Deleted view only)
// //   const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<Customer | null>(null);
// //   const [permanentDeleting, setPermanentDeleting] = useState(false);

// //   // Restoring a record back to Active
// //   const [restoringId, setRestoringId] = useState<string | null>(null);

// //   useEffect(() => {
// //     setCustomers(rows);
// //   }, [rows]);

// //   useEffect(() => {
// //     setPage(1);
// //   }, [searchTerm, websiteFilter, leadStatusFilter, dateFilter, recordStatusFilter]);

// //   const refetchCustomers = async () => {
// //     setRefreshing(true);
// //     try {
// //       const { data, error } = await supabase
// //         .from("customers")
// //         .select("*")
// //         .order("created_at", { ascending: false });
// //       if (error) throw error;
// //       setCustomers((data as Customer[]) || []);
// //     } catch (err) {
// //       console.error("Failed to refresh customers", err);
// //       toast.error("Couldn't refresh customers", {
// //         description: "Please try again.",
// //       });
// //     } finally {
// //       setRefreshing(false);
// //     }
// //   };

// //   const filteredCustomers = useMemo(() => {
// //     const now = new Date();
// //     const term = searchTerm.trim().toLowerCase();

// //     return customers.filter((c) => {
// //       // Active / Deleted view — soft-deleted records are hidden from the
// //       // normal listing and only surfaced under the Deleted filter.
// //       const isDeleted = !!c.deleted_at;
// //       if (recordStatusFilter === "active" && isDeleted) return false;
// //       if (recordStatusFilter === "deleted" && !isDeleted) return false;

// //       if (term) {
// //         const haystack = [c.full_name, c.email, c.phone, c.source_website]
// //           .filter(Boolean)
// //           .join(" ")
// //           .toLowerCase();
// //         if (!haystack.includes(term)) return false;
// //       }

// //       if (websiteFilter !== "All" && c.source_website !== websiteFilter) {
// //         return false;
// //       }

// //       if (leadStatusFilter !== "All") {
// //         const stage = c.lifecycle_stage || "Lead";
// //         if (stage.toLowerCase() !== leadStatusFilter.toLowerCase()) return false;
// //       }

// //       if (dateFilter !== "all" && c.created_at) {
// //         const created = new Date(c.created_at);
// //         if (dateFilter === "today" && !isSameDay(created, now)) return false;
// //         if (dateFilter === "week" && !isThisWeek(created, now)) return false;
// //         if (dateFilter === "month" && !isThisMonth(created, now)) return false;
// //       }

// //       return true;
// //     });
// //   }, [customers, searchTerm, websiteFilter, leadStatusFilter, dateFilter, recordStatusFilter]);

// //   const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / PAGE_SIZE));
// //   const paginatedCustomers = useMemo(() => {
// //     const start = (page - 1) * PAGE_SIZE;
// //     return filteredCustomers.slice(start, start + PAGE_SIZE);
// //   }, [filteredCustomers, page]);

// //   const hasActiveFilters =
// //     !!searchTerm || websiteFilter !== "All" || leadStatusFilter !== "All" || dateFilter !== "all";

// //   const clearFilters = () => {
// //     setSearchTerm("");
// //     setWebsiteFilter("All");
// //     setLeadStatusFilter("All");
// //     setDateFilter("all");
// //   };

// //   const openViewDialog = async (customer: Customer) => {
// //     setViewCustomer(customer);
// //     setEditLifecycleStage(customer.lifecycle_stage || "Lead");
// //     setOrders([]);
// //     setInvoices([]);
// //     setLoadingRelated(true);
// //     try {
// //       const [ordersRes, invoicesRes] = await Promise.all([
// //         supabase.from("orders").select("*").eq("customer_id", customer.id),
// //         supabase.from("invoices").select("*").eq("customer_id", customer.id),
// //       ]);
// //       if (!ordersRes.error && ordersRes.data) setOrders(ordersRes.data as RelatedRecord[]);
// //       if (!invoicesRes.error && invoicesRes.data) setInvoices(invoicesRes.data as RelatedRecord[]);
// //     } catch (err) {
// //       // Orders/invoices tables may not exist in every deployment — fail quietly, they're optional.
// //       console.warn("Orders/invoices lookup skipped:", err);
// //     } finally {
// //       setLoadingRelated(false);
// //     }
// //   };

// //   const closeViewDialog = () => {
// //     setViewCustomer(null);
// //     setOrders([]);
// //     setInvoices([]);
// //   };

// //   const handleSaveEdit = async () => {
// //     if (!viewCustomer) return;
// //     setSavingEdit(true);
// //     try {
// //       const { error } = await supabase
// //         .from("customers")
// //         .update({ lifecycle_stage: editLifecycleStage })
// //         .eq("id", viewCustomer.id);
// //       if (error) throw error;

// //       setCustomers((prev) =>
// //         prev.map((c) =>
// //           c.id === viewCustomer.id ? { ...c, lifecycle_stage: editLifecycleStage } : c
// //         )
// //       );
// //       toast.success("Customer updated", {
// //         description: `${viewCustomer.full_name}'s lead status was saved.`,
// //       });
// //       closeViewDialog();
// //     } catch (err) {
// //       console.error("Failed to update customer", err);
// //       toast.error("Couldn't save changes", {
// //         description: "Please try again.",
// //       });
// //     } finally {
// //       setSavingEdit(false);
// //     }
// //   };

// //   // Soft delete: marks deleted_at instead of removing the row.
// //   const handleSoftDelete = async () => {
// //     if (!deleteTarget) return;
// //     setDeleting(true);
// //     try {
// //       const { error } = await supabase
// //         .from("customers")
// //         .update({ deleted_at: new Date().toISOString() })
// //         .eq("id", deleteTarget.id);
// //       if (error) throw error;

// //       toast.success("CRM record deleted", {
// //         description: `${deleteTarget.full_name} was moved to Deleted. You can restore it anytime.`,
// //       });
// //       setDeleteTarget(null);
// //       await refetchCustomers();
// //     } catch (err) {
// //       console.error("Failed to soft delete customer", err);
// //       toast.error("Couldn't delete this record", {
// //         description: "Please try again.",
// //       });
// //     } finally {
// //       setDeleting(false);
// //     }
// //   };

// //   // Restore: clears deleted_at, moving the record back to Active.
// //   const handleRestore = async (customer: Customer) => {
// //     setRestoringId(customer.id);
// //     try {
// //       const { error } = await supabase
// //         .from("customers")
// //         .update({ deleted_at: null })
// //         .eq("id", customer.id);
// //       if (error) throw error;

// //       toast.success("CRM record restored", {
// //         description: `${customer.full_name} is active again.`,
// //       });
// //       await refetchCustomers();
// //     } catch (err) {
// //       console.error("Failed to restore customer", err);
// //       toast.error("Couldn't restore this record", {
// //         description: "Please try again.",
// //       });
// //     } finally {
// //       setRestoringId(null);
// //     }
// //   };

// //   // Permanent delete: real row removal. Only reachable from the Deleted filter.
// //   const handlePermanentDelete = async () => {
// //     if (!permanentDeleteTarget) return;
// //     setPermanentDeleting(true);
// //     try {
// //       const { error } = await supabase
// //         .from("customers")
// //         .delete()
// //         .eq("id", permanentDeleteTarget.id);
// //       if (error) throw error;

// //       toast.success("CRM record permanently deleted", {
// //         description: `${permanentDeleteTarget.full_name} was permanently removed.`,
// //       });
// //       setPermanentDeleteTarget(null);
// //       await refetchCustomers();
// //     } catch (err) {
// //       console.error("Failed to permanently delete customer", err);
// //       toast.error("Couldn't permanently delete this record", {
// //         description: "Please try again.",
// //       });
// //     } finally {
// //       setPermanentDeleting(false);
// //     }
// //   };

// //   return (
// //     <AdminPage
// //       title="CRM"
// //       description="Customer lifecycle across all properties."
// //       loading={loading}
// //       empty={!loading && !customers.length}
// //     >
// //       <div className="space-y-4">
// //         {/* Search + Filters */}
// //         <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
// //           <div className="relative w-full sm:max-w-xs">
// //             <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
// //             <Input
// //               value={searchTerm}
// //               onChange={(e) => setSearchTerm(e.target.value)}
// //               placeholder="Search name, email, phone, website..."
// //               className="pl-8"
// //             />
// //           </div>

// //           <Select value={websiteFilter} onValueChange={setWebsiteFilter}>
// //             <SelectTrigger className="w-full sm:w-[180px]">
// //               <SelectValue placeholder="Website" />
// //             </SelectTrigger>
// //             <SelectContent>
// //               {WEBSITE_OPTIONS.map((opt) => (
// //                 <SelectItem key={opt} value={opt}>
// //                   {opt}
// //                 </SelectItem>
// //               ))}
// //             </SelectContent>
// //           </Select>

// //           <Select value={leadStatusFilter} onValueChange={setLeadStatusFilter}>
// //             <SelectTrigger className="w-full sm:w-[180px]">
// //               <SelectValue placeholder="Lead Status" />
// //             </SelectTrigger>
// //             <SelectContent>
// //               {LEAD_STATUS_OPTIONS.map((opt) => (
// //                 <SelectItem key={opt} value={opt}>
// //                   {opt}
// //                 </SelectItem>
// //               ))}
// //             </SelectContent>
// //           </Select>

// //           <Select value={dateFilter} onValueChange={setDateFilter}>
// //             <SelectTrigger className="w-full sm:w-[160px]">
// //               <SelectValue placeholder="Date" />
// //             </SelectTrigger>
// //             <SelectContent>
// //               {DATE_FILTER_OPTIONS.map((opt) => (
// //                 <SelectItem key={opt.value} value={opt.value}>
// //                   {opt.label}
// //                 </SelectItem>
// //               ))}
// //             </SelectContent>
// //           </Select>

// //           <Select
// //             value={recordStatusFilter}
// //             onValueChange={(v) => setRecordStatusFilter(v as "active" | "deleted")}
// //           >
// //             <SelectTrigger className="w-full sm:w-[140px]">
// //               <SelectValue placeholder="Record Status" />
// //             </SelectTrigger>
// //             <SelectContent>
// //               {RECORD_STATUS_OPTIONS.map((opt) => (
// //                 <SelectItem key={opt.value} value={opt.value}>
// //                   {opt.label}
// //                 </SelectItem>
// //               ))}
// //             </SelectContent>
// //           </Select>

// //           {hasActiveFilters && (
// //             <Button variant="ghost" size="sm" onClick={clearFilters}>
// //               Clear filters
// //             </Button>
// //           )}
// //         </div>

// //         <p className="text-sm text-muted-foreground">
// //           {filteredCustomers.length} customer{filteredCustomers.length === 1 ? "" : "s"} found
// //           {recordStatusFilter === "deleted" ? " · viewing deleted" : ""}
// //           {refreshing ? " · refreshing…" : ""}
// //         </p>

// //         {/* Customer list */}
// //         <div className="space-y-2">
// //           {paginatedCustomers.map((c) => (
// //             <div
// //               key={c.id}
// //               className="border border-border rounded-lg p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
// //             >
// //               <div className="min-w-0">
// //                 <p className="font-semibold truncate">{c.full_name}</p>
// //                 <p className="text-sm text-muted-foreground truncate">
// //                   {c.email || "—"} · {c.phone || "—"}
// //                 </p>
// //               </div>

// //               <div className="flex flex-wrap items-center gap-2 sm:justify-end">
// //                 {c.source_website && <Badge variant="secondary">{c.source_website}</Badge>}
// //                 <Badge
// //                   variant="outline"
// //                   className={cn("font-medium", getLifecycleBadgeClass(c.lifecycle_stage))}
// //                 >
// //                   {c.lifecycle_stage || "Lead"}
// //                 </Badge>

// //                 <div className="flex items-center gap-1 sm:ml-2">
// //                   {recordStatusFilter === "active" ? (
// //                     <>
// //                       <Button
// //                         size="icon"
// //                         variant="ghost"
// //                         className="h-8 w-8 text-muted-foreground hover:text-foreground"
// //                         onClick={() => openViewDialog(c)}
// //                         aria-label={`View ${c.full_name}`}
// //                         title="View"
// //                       >
// //                         <Eye className="h-4 w-4" />
// //                       </Button>
// //                       <Button
// //                         size="icon"
// //                         variant="ghost"
// //                         className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
// //                         onClick={() => setDeleteTarget(c)}
// //                         aria-label={`Delete ${c.full_name}`}
// //                         title="Delete"
// //                       >
// //                         <Trash2 className="h-4 w-4" />
// //                       </Button>
// //                     </>
// //                   ) : (
// //                     <>
// //                       <Button
// //                         size="sm"
// //                         variant="outline"
// //                         className="h-8 gap-1.5"
// //                         onClick={() => handleRestore(c)}
// //                         disabled={restoringId === c.id}
// //                         aria-label={`Restore ${c.full_name}`}
// //                         title="Restore"
// //                       >
// //                         <RotateCcw className="h-3.5 w-3.5" />
// //                         {restoringId === c.id ? "Restoring…" : "Restore"}
// //                       </Button>
// //                       <Button
// //                         size="sm"
// //                         variant="ghost"
// //                         className="h-8 gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
// //                         onClick={() => setPermanentDeleteTarget(c)}
// //                         aria-label={`Permanently delete ${c.full_name}`}
// //                         title="Permanently Delete"
// //                       >
// //                         <XCircle className="h-3.5 w-3.5" />
// //                         Permanently Delete
// //                       </Button>
// //                     </>
// //                   )}
// //                 </div>
// //               </div>
// //             </div>
// //           ))}

// //           {!loading && !paginatedCustomers.length && (
// //             <p className="text-sm text-muted-foreground text-center py-8">
// //               {recordStatusFilter === "deleted"
// //                 ? "No deleted records."
// //                 : "No customers match your search or filters."}
// //             </p>
// //           )}
// //         </div>

// //         {/* Pagination */}
// //         {filteredCustomers.length > 0 && (
// //           <div className="flex items-center justify-between pt-2">
// //             <p className="text-sm text-muted-foreground">
// //               Page {page} of {totalPages}
// //             </p>
// //             <div className="flex gap-2">
// //               <Button
// //                 size="sm"
// //                 variant="outline"
// //                 disabled={page <= 1}
// //                 onClick={() => setPage((p) => Math.max(1, p - 1))}
// //               >
// //                 Previous
// //               </Button>
// //               <Button
// //                 size="sm"
// //                 variant="outline"
// //                 disabled={page >= totalPages}
// //                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
// //               >
// //                 Next
// //               </Button>
// //             </div>
// //           </div>
// //         )}
// //       </div>

// //       {/* View / Edit Dialog */}
// //       <Dialog open={!!viewCustomer} onOpenChange={(open) => !open && closeViewDialog()}>
// //         <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
// //           {viewCustomer && (
// //             <>
// //               <DialogHeader>
// //                 <DialogTitle>{viewCustomer.full_name}</DialogTitle>
// //                 <DialogDescription>Customer details</DialogDescription>
// //               </DialogHeader>

// //               <div className="space-y-4 py-2">
// //                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
// //                   <div>
// //                     <p className="text-muted-foreground">Email</p>
// //                     <p className="font-medium break-all">{viewCustomer.email || "—"}</p>
// //                   </div>
// //                   <div>
// //                     <p className="text-muted-foreground">Phone</p>
// //                     <p className="font-medium">{viewCustomer.phone || "—"}</p>
// //                   </div>
// //                   <div>
// //                     <p className="text-muted-foreground">Website</p>
// //                     <p className="font-medium">{viewCustomer.source_website || "—"}</p>
// //                   </div>
// //                   <div>
// //                     <p className="text-muted-foreground">Created</p>
// //                     <p className="font-medium">
// //                       {viewCustomer.created_at
// //                         ? new Date(viewCustomer.created_at).toLocaleString()
// //                         : "—"}
// //                     </p>
// //                   </div>
// //                 </div>

// //                 <div className="space-y-1.5">
// //                   <Label htmlFor="lead-status">Lead Status</Label>
// //                   <Select value={editLifecycleStage} onValueChange={setEditLifecycleStage}>
// //                     <SelectTrigger id="lead-status">
// //                       <SelectValue />
// //                     </SelectTrigger>
// //                     <SelectContent>
// //                       {LEAD_STATUS_OPTIONS.filter((o) => o !== "All").map((opt) => (
// //                         <SelectItem key={opt} value={opt}>
// //                           {opt}
// //                         </SelectItem>
// //                       ))}
// //                     </SelectContent>
// //                   </Select>
// //                 </div>

// //                 <div>
// //                   <p className="text-sm font-semibold mb-1.5">Orders</p>
// //                   {loadingRelated ? (
// //                     <p className="text-sm text-muted-foreground">Loading…</p>
// //                   ) : orders.length ? (
// //                     <div className="space-y-1.5">
// //                       {orders.map((o) => (
// //                         <div
// //                           key={o.id}
// //                           className="text-sm border border-border rounded-md px-3 py-2 flex justify-between"
// //                         >
// //                           <span>{o.id}</span>
// //                           <span className="text-muted-foreground">
// //                             {o.status || "—"} {o.total ? `· ${o.total}` : ""}
// //                           </span>
// //                         </div>
// //                       ))}
// //                     </div>
// //                   ) : (
// //                     <p className="text-sm text-muted-foreground">No orders available.</p>
// //                   )}
// //                 </div>

// //                 <div>
// //                   <p className="text-sm font-semibold mb-1.5">Invoices</p>
// //                   {loadingRelated ? (
// //                     <p className="text-sm text-muted-foreground">Loading…</p>
// //                   ) : invoices.length ? (
// //                     <div className="space-y-1.5">
// //                       {invoices.map((inv) => (
// //                         <div
// //                           key={inv.id}
// //                           className="text-sm border border-border rounded-md px-3 py-2 flex justify-between"
// //                         >
// //                           <span>{inv.id}</span>
// //                           <span className="text-muted-foreground">
// //                             {inv.status || "—"} {inv.amount ? `· ${inv.amount}` : ""}
// //                           </span>
// //                         </div>
// //                       ))}
// //                     </div>
// //                   ) : (
// //                     <p className="text-sm text-muted-foreground">No invoices available.</p>
// //                   )}
// //                 </div>
// //               </div>

// //               <DialogFooter>
// //                 <Button variant="outline" onClick={closeViewDialog} disabled={savingEdit}>
// //                   Cancel
// //                 </Button>
// //                 <Button onClick={handleSaveEdit} disabled={savingEdit}>
// //                   {savingEdit ? "Saving…" : "Save changes"}
// //                 </Button>
// //               </DialogFooter>
// //             </>
// //           )}
// //         </DialogContent>
// //       </Dialog>

// //       {/* Soft delete confirmation (Active view) */}
// //       <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
// //         <AlertDialogContent>
// //           <AlertDialogHeader>
// //             <AlertDialogTitle>Delete CRM Record?</AlertDialogTitle>
// //             <AlertDialogDescription>
// //               Are you sure you want to delete this CRM record?
// //               <br />
// //               This action can be restored later.
// //             </AlertDialogDescription>
// //           </AlertDialogHeader>
// //           <AlertDialogFooter>
// //             <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
// //             <AlertDialogAction onClick={handleSoftDelete} disabled={deleting}>
// //               {deleting ? "Deleting…" : "Delete"}
// //             </AlertDialogAction>
// //           </AlertDialogFooter>
// //         </AlertDialogContent>
// //       </AlertDialog>

// //       {/* Permanent delete confirmation (Deleted view only) */}
// //       <AlertDialog
// //         open={!!permanentDeleteTarget}
// //         onOpenChange={(open) => !open && setPermanentDeleteTarget(null)}
// //       >
// //         <AlertDialogContent>
// //           <AlertDialogHeader>
// //             <AlertDialogTitle>Permanently Delete Record?</AlertDialogTitle>
// //             <AlertDialogDescription>
// //               This will permanently delete{" "}
// //               <span className="font-medium">{permanentDeleteTarget?.full_name}</span> from your
// //               CRM. This action cannot be undone.
// //             </AlertDialogDescription>
// //           </AlertDialogHeader>
// //           <AlertDialogFooter>
// //             <AlertDialogCancel disabled={permanentDeleting}>Cancel</AlertDialogCancel>
// //             <AlertDialogAction onClick={handlePermanentDelete} disabled={permanentDeleting}>
// //               {permanentDeleting ? "Deleting…" : "Permanently Delete"}
// //             </AlertDialogAction>
// //           </AlertDialogFooter>
// //         </AlertDialogContent>
// //       </AlertDialog>
// //     </AdminPage>
// //   );
// // }

// // import { useEffect, useMemo, useState } from "react";
// // import { AdminPage } from "@/components/admin/AdminPage";
// // import { useAdminTable } from "@/hooks/useAdminData";
// // import { supabase } from "@/integrations/supabase/client";
// // import { Badge } from "@/components/ui/badge";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select";
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogDescription,
// //   DialogFooter,
// //   DialogHeader,
// //   DialogTitle,
// // } from "@/components/ui/dialog";
// // import {
// //   AlertDialog,
// //   AlertDialogAction,
// //   AlertDialogCancel,
// //   AlertDialogContent,
// //   AlertDialogDescription,
// //   AlertDialogFooter,
// //   AlertDialogHeader,
// //   AlertDialogTitle,
// // } from "@/components/ui/alert-dialog";
// // import { toast } from "sonner";
// // import { Search as SearchIcon, Eye, Trash2, RotateCcw, XCircle } from "lucide-react";
// // import { cn } from "@/lib/utils";

// // type Customer = {
// //   id: string;
// //   full_name: string;
// //   email?: string;
// //   phone?: string;
// //   source_website?: string;
// //   lifecycle_stage?: string;
// //   created_at: string;
// //   // Soft-delete marker. Nullable timestamp: null/undefined = active record,
// //   // a timestamp = when the record was soft deleted.
// //   deleted_at?: string | null;
// // };

// // type RelatedRecord = {
// //   id: string;
// //   status?: string;
// //   total?: number | string;
// //   amount?: number | string;
// //   created_at?: string;
// //   [key: string]: any;
// // };

// // const WEBSITE_OPTIONS = ["All", "Ankshaastra", "Miracle Baby", "Empower"];
// // const LEAD_STATUS_OPTIONS = ["All", "Lead", "Qualified", "Customer", "Completed", "Lost"];
// // const DATE_FILTER_OPTIONS = [
// //   { value: "all", label: "All Time" },
// //   { value: "today", label: "Today" },
// //   { value: "week", label: "This Week" },
// //   { value: "month", label: "This Month" },
// // ];
// // // Record-status filter — Active hides soft-deleted rows, Deleted shows only them.
// // const RECORD_STATUS_OPTIONS = [
// //   { value: "active", label: "Active" },
// //   { value: "deleted", label: "Deleted" },
// // ];

// // const PAGE_SIZE = 10;

// // // Color-coded lifecycle badge styles — one fixed mapping so status always
// // // means the same thing everywhere (matches the semantic-color pattern used
// // // on Workflows: green = good / amber = in-progress / red = lost or dead-end).
// // const LIFECYCLE_BADGE_STYLES: Record<string, string> = {
// //   lead: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
// //   qualified: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
// //   customer: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
// //   completed: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
// //   lost: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
// // };

// // function getLifecycleBadgeClass(stage?: string) {
// //   const key = (stage || "lead").toLowerCase();
// //   return LIFECYCLE_BADGE_STYLES[key] || LIFECYCLE_BADGE_STYLES.lead;
// // }

// // function isSameDay(a: Date, b: Date) {
// //   return (
// //     a.getFullYear() === b.getFullYear() &&
// //     a.getMonth() === b.getMonth() &&
// //     a.getDate() === b.getDate()
// //   );
// // }

// // function isThisWeek(date: Date, now: Date) {
// //   const startOfWeek = new Date(now);
// //   const diffToMonday = (now.getDay() + 6) % 7; // week starts Monday
// //   startOfWeek.setDate(now.getDate() - diffToMonday);
// //   startOfWeek.setHours(0, 0, 0, 0);
// //   const endOfWeek = new Date(startOfWeek);
// //   endOfWeek.setDate(startOfWeek.getDate() + 7);
// //   return date >= startOfWeek && date < endOfWeek;
// // }

// // function isThisMonth(date: Date, now: Date) {
// //   return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
// // }

// // export default function CrmModule() {
// //   const { rows, loading } = useAdminTable<Customer>("customers");

// //   // Local mirror of the hook's data so we can refresh/mutate after edits & deletes
// //   // without needing to change the shared useAdminTable hook.
// //   const [customers, setCustomers] = useState<Customer[]>([]);
// //   const [refreshing, setRefreshing] = useState(false);

// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [websiteFilter, setWebsiteFilter] = useState("All");
// //   const [leadStatusFilter, setLeadStatusFilter] = useState("All");
// //   const [dateFilter, setDateFilter] = useState("all");
// //   // Active vs Deleted view. Defaults to Active so soft-deleted records stay
// //   // hidden from the normal listing.
// //   const [recordStatusFilter, setRecordStatusFilter] = useState<"active" | "deleted">("active");
// //   const [page, setPage] = useState(1);

// //   const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
// //   const [editLifecycleStage, setEditLifecycleStage] = useState("Lead");
// //   const [savingEdit, setSavingEdit] = useState(false);
// //   const [orders, setOrders] = useState<RelatedRecord[]>([]);
// //   const [invoices, setInvoices] = useState<RelatedRecord[]>([]);
// //   const [loadingRelated, setLoadingRelated] = useState(false);

// //   // Soft-delete confirmation target (Active view)
// //   const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
// //   const [deleting, setDeleting] = useState(false);

// //   // Permanent-delete confirmation target (Deleted view only)
// //   const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<Customer | null>(null);
// //   const [permanentDeleting, setPermanentDeleting] = useState(false);

// //   // Restoring a record back to Active
// //   const [restoringId, setRestoringId] = useState<string | null>(null);

// //   useEffect(() => {
// //     setCustomers(rows);
// //   }, [rows]);

// //   useEffect(() => {
// //     setPage(1);
// //   }, [searchTerm, websiteFilter, leadStatusFilter, dateFilter, recordStatusFilter]);

// //   const refetchCustomers = async () => {
// //     setRefreshing(true);
// //     try {
// //       const { data, error } = await supabase
// //         .from("customers")
// //         .select("*")
// //         .order("created_at", { ascending: false });
// //       if (error) throw error;
// //       setCustomers((data as Customer[]) || []);
// //     } catch (err) {
// //       console.error("Failed to refresh customers", err);
// //       toast.error("Couldn't refresh customers", {
// //         description: "Please try again.",
// //       });
// //     } finally {
// //       setRefreshing(false);
// //     }
// //   };

// //   const filteredCustomers = useMemo(() => {
// //     const now = new Date();
// //     const term = searchTerm.trim().toLowerCase();

// //     return customers.filter((c) => {
// //       // Active / Deleted view — soft-deleted records are hidden from the
// //       // normal listing and only surfaced under the Deleted filter.
// //       const isDeleted = !!c.deleted_at;
// //       if (recordStatusFilter === "active" && isDeleted) return false;
// //       if (recordStatusFilter === "deleted" && !isDeleted) return false;

// //       if (term) {
// //         const haystack = [c.full_name, c.email, c.phone, c.source_website]
// //           .filter(Boolean)
// //           .join(" ")
// //           .toLowerCase();
// //         if (!haystack.includes(term)) return false;
// //       }

// //       if (websiteFilter !== "All" && c.source_website !== websiteFilter) {
// //         return false;
// //       }

// //       if (leadStatusFilter !== "All") {
// //         const stage = c.lifecycle_stage || "Lead";
// //         if (stage.toLowerCase() !== leadStatusFilter.toLowerCase()) return false;
// //       }

// //       if (dateFilter !== "all" && c.created_at) {
// //         const created = new Date(c.created_at);
// //         if (dateFilter === "today" && !isSameDay(created, now)) return false;
// //         if (dateFilter === "week" && !isThisWeek(created, now)) return false;
// //         if (dateFilter === "month" && !isThisMonth(created, now)) return false;
// //       }

// //       return true;
// //     });
// //   }, [customers, searchTerm, websiteFilter, leadStatusFilter, dateFilter, recordStatusFilter]);

// //   const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / PAGE_SIZE));
// //   const paginatedCustomers = useMemo(() => {
// //     const start = (page - 1) * PAGE_SIZE;
// //     return filteredCustomers.slice(start, start + PAGE_SIZE);
// //   }, [filteredCustomers, page]);

// //   const hasActiveFilters =
// //     !!searchTerm || websiteFilter !== "All" || leadStatusFilter !== "All" || dateFilter !== "all";

// //   const clearFilters = () => {
// //     setSearchTerm("");
// //     setWebsiteFilter("All");
// //     setLeadStatusFilter("All");
// //     setDateFilter("all");
// //   };

// //   const openViewDialog = async (customer: Customer) => {
// //     setViewCustomer(customer);
// //     setEditLifecycleStage(customer.lifecycle_stage || "Lead");
// //     setOrders([]);
// //     setInvoices([]);
// //     setLoadingRelated(true);
// //     try {
// //       const [ordersRes, invoicesRes] = await Promise.all([
// //         supabase.from("orders").select("*").eq("customer_id", customer.id),
// //         supabase.from("invoices").select("*").eq("customer_id", customer.id),
// //       ]);
// //       if (!ordersRes.error && ordersRes.data) setOrders(ordersRes.data as RelatedRecord[]);
// //       if (!invoicesRes.error && invoicesRes.data) setInvoices(invoicesRes.data as RelatedRecord[]);
// //     } catch (err) {
// //       // Orders/invoices tables may not exist in every deployment — fail quietly, they're optional.
// //       console.warn("Orders/invoices lookup skipped:", err);
// //     } finally {
// //       setLoadingRelated(false);
// //     }
// //   };

// //   const closeViewDialog = () => {
// //     setViewCustomer(null);
// //     setOrders([]);
// //     setInvoices([]);
// //   };

// //   const handleSaveEdit = async () => {
// //     if (!viewCustomer) return;
// //     setSavingEdit(true);
// //     try {
// //       const { error } = await supabase
// //         .from("customers")
// //         .update({ lifecycle_stage: editLifecycleStage })
// //         .eq("id", viewCustomer.id);
// //       if (error) throw error;

// //       setCustomers((prev) =>
// //         prev.map((c) =>
// //           c.id === viewCustomer.id ? { ...c, lifecycle_stage: editLifecycleStage } : c
// //         )
// //       );
// //       toast.success("Customer updated", {
// //         description: `${viewCustomer.full_name}'s lead status was saved.`,
// //       });
// //       closeViewDialog();
// //     } catch (err) {
// //       console.error("Failed to update customer", err);
// //       toast.error("Couldn't save changes", {
// //         description: "Please try again.",
// //       });
// //     } finally {
// //       setSavingEdit(false);
// //     }
// //   };

// //   // Soft delete: marks deleted_at instead of removing the row.
// //   const handleSoftDelete = async () => {
// //     if (!deleteTarget) return;
// //     setDeleting(true);
// //     try {
// //       const { error } = await supabase
// //         .from("customers")
// //         .update({ deleted_at: new Date().toISOString() })
// //         .eq("id", deleteTarget.id);
// //       if (error) throw error;

// //       toast.success("CRM record deleted", {
// //         description: `${deleteTarget.full_name} was moved to Deleted. You can restore it anytime.`,
// //       });
// //       setDeleteTarget(null);
// //       await refetchCustomers();
// //     } catch (err) {
// //       console.error("Failed to soft delete customer", err);
// //       toast.error("Couldn't delete this record", {
// //         description: "Please try again.",
// //       });
// //     } finally {
// //       setDeleting(false);
// //     }
// //   };

// //   // Restore: clears deleted_at, moving the record back to Active.
// //   const handleRestore = async (customer: Customer) => {
// //     setRestoringId(customer.id);
// //     try {
// //       const { error } = await supabase
// //         .from("customers")
// //         .update({ deleted_at: null })
// //         .eq("id", customer.id);
// //       if (error) throw error;

// //       toast.success("CRM record restored", {
// //         description: `${customer.full_name} is active again.`,
// //       });
// //       await refetchCustomers();
// //     } catch (err) {
// //       console.error("Failed to restore customer", err);
// //       toast.error("Couldn't restore this record", {
// //         description: "Please try again.",
// //       });
// //     } finally {
// //       setRestoringId(null);
// //     }
// //   };

// //   // Permanent delete: real row removal. Only reachable from the Deleted filter.
// //   const handlePermanentDelete = async () => {
// //     if (!permanentDeleteTarget) return;
// //     setPermanentDeleting(true);
// //     try {
// //       const { error } = await supabase
// //         .from("customers")
// //         .delete()
// //         .eq("id", permanentDeleteTarget.id);
// //       if (error) throw error;

// //       toast.success("CRM record permanently deleted", {
// //         description: `${permanentDeleteTarget.full_name} was permanently removed.`,
// //       });
// //       setPermanentDeleteTarget(null);
// //       await refetchCustomers();
// //     } catch (err) {
// //       console.error("Failed to permanently delete customer", err);
// //       toast.error("Couldn't permanently delete this record", {
// //         description: "Please try again.",
// //       });
// //     } finally {
// //       setPermanentDeleting(false);
// //     }
// //   };

// //   return (
// //     <AdminPage
// //       title="CRM"
// //       description="Customer lifecycle across all properties."
// //       loading={loading}
// //       empty={!loading && !customers.length}
// //     >
// //       <div className="space-y-4">
// //         {/* Search + Filters */}
// //         <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
// //           <div className="relative w-full sm:max-w-xs">
// //             <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
// //             <Input
// //               value={searchTerm}
// //               onChange={(e) => setSearchTerm(e.target.value)}
// //               placeholder="Search name, email, phone, website..."
// //               className="pl-8"
// //             />
// //           </div>

// //           <Select value={websiteFilter} onValueChange={setWebsiteFilter}>
// //             <SelectTrigger className="w-full sm:w-[180px]">
// //               <SelectValue placeholder="Website" />
// //             </SelectTrigger>
// //             <SelectContent>
// //               {WEBSITE_OPTIONS.map((opt) => (
// //                 <SelectItem key={opt} value={opt}>
// //                   {opt}
// //                 </SelectItem>
// //               ))}
// //             </SelectContent>
// //           </Select>

// //           <Select value={leadStatusFilter} onValueChange={setLeadStatusFilter}>
// //             <SelectTrigger className="w-full sm:w-[180px]">
// //               <SelectValue placeholder="Lead Status" />
// //             </SelectTrigger>
// //             <SelectContent>
// //               {LEAD_STATUS_OPTIONS.map((opt) => (
// //                 <SelectItem key={opt} value={opt}>
// //                   {opt}
// //                 </SelectItem>
// //               ))}
// //             </SelectContent>
// //           </Select>

// //           <Select value={dateFilter} onValueChange={setDateFilter}>
// //             <SelectTrigger className="w-full sm:w-[160px]">
// //               <SelectValue placeholder="Date" />
// //             </SelectTrigger>
// //             <SelectContent>
// //               {DATE_FILTER_OPTIONS.map((opt) => (
// //                 <SelectItem key={opt.value} value={opt.value}>
// //                   {opt.label}
// //                 </SelectItem>
// //               ))}
// //             </SelectContent>
// //           </Select>

// //           <Select
// //             value={recordStatusFilter}
// //             onValueChange={(v) => setRecordStatusFilter(v as "active" | "deleted")}
// //           >
// //             <SelectTrigger className="w-full sm:w-[140px]">
// //               <SelectValue placeholder="Record Status" />
// //             </SelectTrigger>
// //             <SelectContent>
// //               {RECORD_STATUS_OPTIONS.map((opt) => (
// //                 <SelectItem key={opt.value} value={opt.value}>
// //                   {opt.label}
// //                 </SelectItem>
// //               ))}
// //             </SelectContent>
// //           </Select>

// //           {hasActiveFilters && (
// //             <Button variant="ghost" size="sm" onClick={clearFilters}>
// //               Clear filters
// //             </Button>
// //           )}
// //         </div>

// //         <p className="text-sm text-muted-foreground">
// //           {filteredCustomers.length} customer{filteredCustomers.length === 1 ? "" : "s"} found
// //           {recordStatusFilter === "deleted" ? " · viewing deleted" : ""}
// //           {refreshing ? " · refreshing…" : ""}
// //         </p>

// //         {/* Customer list */}
// //         <div className="space-y-2">
// //           {paginatedCustomers.map((c) => (
// //             <div
// //               key={c.id}
// //               className="border border-border rounded-lg p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
// //             >
// //               <div className="min-w-0">
// //                 <p className="font-semibold truncate">{c.full_name}</p>
// //                 <p className="text-sm text-muted-foreground truncate">
// //                   {c.email || "—"} · {c.phone || "—"}
// //                 </p>
// //               </div>

// //               <div className="flex flex-wrap items-center gap-2 sm:justify-end">
// //                 {c.source_website && <Badge variant="secondary">{c.source_website}</Badge>}
// //                 <Badge
// //                   variant="outline"
// //                   className={cn("font-medium", getLifecycleBadgeClass(c.lifecycle_stage))}
// //                 >
// //                   {c.lifecycle_stage || "Lead"}
// //                 </Badge>

// //                 <div className="flex items-center gap-1 sm:ml-2">
// //                   {recordStatusFilter === "active" ? (
// //                     <>
// //                       <Button
// //                         size="icon"
// //                         variant="ghost"
// //                         className="h-8 w-8 text-muted-foreground hover:text-foreground"
// //                         onClick={() => openViewDialog(c)}
// //                         aria-label={`View ${c.full_name}`}
// //                         title="View"
// //                       >
// //                         <Eye className="h-4 w-4" />
// //                       </Button>
// //                       <Button
// //                         size="icon"
// //                         variant="ghost"
// //                         className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
// //                         onClick={() => setDeleteTarget(c)}
// //                         aria-label={`Delete ${c.full_name}`}
// //                         title="Delete"
// //                       >
// //                         <Trash2 className="h-4 w-4" />
// //                       </Button>
// //                     </>
// //                   ) : (
// //                     <>
// //                       <Button
// //                         size="sm"
// //                         variant="outline"
// //                         className="h-8 gap-1.5"
// //                         onClick={() => handleRestore(c)}
// //                         disabled={restoringId === c.id}
// //                         aria-label={`Restore ${c.full_name}`}
// //                         title="Restore"
// //                       >
// //                         <RotateCcw className="h-3.5 w-3.5" />
// //                         {restoringId === c.id ? "Restoring…" : "Restore"}
// //                       </Button>
// //                       <Button
// //                         size="sm"
// //                         variant="ghost"
// //                         className="h-8 gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
// //                         onClick={() => setPermanentDeleteTarget(c)}
// //                         aria-label={`Permanently delete ${c.full_name}`}
// //                         title="Permanently Delete"
// //                       >
// //                         <XCircle className="h-3.5 w-3.5" />
// //                         Permanently Delete
// //                       </Button>
// //                     </>
// //                   )}
// //                 </div>
// //               </div>
// //             </div>
// //           ))}

// //           {!loading && !paginatedCustomers.length && (
// //             <p className="text-sm text-muted-foreground text-center py-8">
// //               {recordStatusFilter === "deleted"
// //                 ? "No deleted records."
// //                 : "No customers match your search or filters."}
// //             </p>
// //           )}
// //         </div>

// //         {/* Pagination */}
// //         {filteredCustomers.length > 0 && (
// //           <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
// //             <p className="text-sm text-muted-foreground">
// //               Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredCustomers.length)} of{" "}
// //               {filteredCustomers.length}
// //             </p>
// //             <div className="flex items-center gap-3">
// //               <Button
// //                 size="sm"
// //                 variant="outline"
// //                 disabled={page <= 1}
// //                 onClick={() => setPage((p) => Math.max(1, p - 1))}
// //               >
// //                 Previous
// //               </Button>
// //               <p className="text-sm text-muted-foreground whitespace-nowrap">
// //                 Page {page} of {totalPages}
// //               </p>
// //               <Button
// //                 size="sm"
// //                 variant="outline"
// //                 disabled={page >= totalPages}
// //                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
// //               >
// //                 Next
// //               </Button>
// //             </div>
// //           </div>
// //         )}
// //       </div>

// //       {/* View / Edit Dialog */}
// //       <Dialog open={!!viewCustomer} onOpenChange={(open) => !open && closeViewDialog()}>
// //         <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
// //           {viewCustomer && (
// //             <>
// //               <DialogHeader>
// //                 <DialogTitle>{viewCustomer.full_name}</DialogTitle>
// //                 <DialogDescription>Customer details</DialogDescription>
// //               </DialogHeader>

// //               <div className="space-y-4 py-2">
// //                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
// //                   <div>
// //                     <p className="text-muted-foreground">Email</p>
// //                     <p className="font-medium break-all">{viewCustomer.email || "—"}</p>
// //                   </div>
// //                   <div>
// //                     <p className="text-muted-foreground">Phone</p>
// //                     <p className="font-medium">{viewCustomer.phone || "—"}</p>
// //                   </div>
// //                   <div>
// //                     <p className="text-muted-foreground">Website</p>
// //                     <p className="font-medium">{viewCustomer.source_website || "—"}</p>
// //                   </div>
// //                   <div>
// //                     <p className="text-muted-foreground">Created</p>
// //                     <p className="font-medium">
// //                       {viewCustomer.created_at
// //                         ? new Date(viewCustomer.created_at).toLocaleString()
// //                         : "—"}
// //                     </p>
// //                   </div>
// //                 </div>

// //                 <div className="space-y-1.5">
// //                   <Label htmlFor="lead-status">Lead Status</Label>
// //                   <Select value={editLifecycleStage} onValueChange={setEditLifecycleStage}>
// //                     <SelectTrigger id="lead-status">
// //                       <SelectValue />
// //                     </SelectTrigger>
// //                     <SelectContent>
// //                       {LEAD_STATUS_OPTIONS.filter((o) => o !== "All").map((opt) => (
// //                         <SelectItem key={opt} value={opt}>
// //                           {opt}
// //                         </SelectItem>
// //                       ))}
// //                     </SelectContent>
// //                   </Select>
// //                 </div>

// //                 <div>
// //                   <p className="text-sm font-semibold mb-1.5">Orders</p>
// //                   {loadingRelated ? (
// //                     <p className="text-sm text-muted-foreground">Loading…</p>
// //                   ) : orders.length ? (
// //                     <div className="space-y-1.5">
// //                       {orders.map((o) => (
// //                         <div
// //                           key={o.id}
// //                           className="text-sm border border-border rounded-md px-3 py-2 flex justify-between"
// //                         >
// //                           <span>{o.id}</span>
// //                           <span className="text-muted-foreground">
// //                             {o.status || "—"} {o.total ? `· ${o.total}` : ""}
// //                           </span>
// //                         </div>
// //                       ))}
// //                     </div>
// //                   ) : (
// //                     <p className="text-sm text-muted-foreground">No orders available.</p>
// //                   )}
// //                 </div>

// //                 <div>
// //                   <p className="text-sm font-semibold mb-1.5">Invoices</p>
// //                   {loadingRelated ? (
// //                     <p className="text-sm text-muted-foreground">Loading…</p>
// //                   ) : invoices.length ? (
// //                     <div className="space-y-1.5">
// //                       {invoices.map((inv) => (
// //                         <div
// //                           key={inv.id}
// //                           className="text-sm border border-border rounded-md px-3 py-2 flex justify-between"
// //                         >
// //                           <span>{inv.id}</span>
// //                           <span className="text-muted-foreground">
// //                             {inv.status || "—"} {inv.amount ? `· ${inv.amount}` : ""}
// //                           </span>
// //                         </div>
// //                       ))}
// //                     </div>
// //                   ) : (
// //                     <p className="text-sm text-muted-foreground">No invoices available.</p>
// //                   )}
// //                 </div>
// //               </div>

// //               <DialogFooter>
// //                 <Button variant="outline" onClick={closeViewDialog} disabled={savingEdit}>
// //                   Cancel
// //                 </Button>
// //                 <Button onClick={handleSaveEdit} disabled={savingEdit}>
// //                   {savingEdit ? "Saving…" : "Save changes"}
// //                 </Button>
// //               </DialogFooter>
// //             </>
// //           )}
// //         </DialogContent>
// //       </Dialog>

// //       {/* Soft delete confirmation (Active view) */}
// //       <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
// //         <AlertDialogContent>
// //           <AlertDialogHeader>
// //             <AlertDialogTitle>Delete CRM Record?</AlertDialogTitle>
// //             <AlertDialogDescription>
// //               Are you sure you want to delete this CRM record?
// //               <br />
// //               This action can be restored later.
// //             </AlertDialogDescription>
// //           </AlertDialogHeader>
// //           <AlertDialogFooter>
// //             <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
// //             <AlertDialogAction onClick={handleSoftDelete} disabled={deleting}>
// //               {deleting ? "Deleting…" : "Delete"}
// //             </AlertDialogAction>
// //           </AlertDialogFooter>
// //         </AlertDialogContent>
// //       </AlertDialog>

// //       {/* Permanent delete confirmation (Deleted view only) */}
// //       <AlertDialog
// //         open={!!permanentDeleteTarget}
// //         onOpenChange={(open) => !open && setPermanentDeleteTarget(null)}
// //       >
// //         <AlertDialogContent>
// //           <AlertDialogHeader>
// //             <AlertDialogTitle>Permanently Delete Record?</AlertDialogTitle>
// //             <AlertDialogDescription>
// //               This will permanently delete{" "}
// //               <span className="font-medium">{permanentDeleteTarget?.full_name}</span> from your
// //               CRM. This action cannot be undone.
// //             </AlertDialogDescription>
// //           </AlertDialogHeader>
// //           <AlertDialogFooter>
// //             <AlertDialogCancel disabled={permanentDeleting}>Cancel</AlertDialogCancel>
// //             <AlertDialogAction onClick={handlePermanentDelete} disabled={permanentDeleting}>
// //               {permanentDeleting ? "Deleting…" : "Permanently Delete"}
// //             </AlertDialogAction>
// //           </AlertDialogFooter>
// //         </AlertDialogContent>
// //       </AlertDialog>
// //     </AdminPage>
// //   );
// // }

// import { useEffect, useMemo, useState } from "react";
// import { AdminPage } from "@/components/admin/AdminPage";
// import { useAdminTable } from "@/hooks/useAdminData";
// import { supabase } from "@/integrations/supabase/client";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
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
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
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
// import { Search as SearchIcon, Eye, Trash2, RotateCcw, XCircle, Download } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { exportRowsAsCsv } from "@/lib/csv-export";

// type Customer = {
//   id: string;
//   full_name: string;
//   email?: string;
//   phone?: string;
//   source_website?: string;
//   lifecycle_stage?: string;
//   created_at: string;
//   // Soft-delete marker. Nullable timestamp: null/undefined = active record,
//   // a timestamp = when the record was soft deleted.
//   deleted_at?: string | null;
//   // Optional — present only if these columns exist in your Supabase
//   // "customers" table. Used by CSV export; rendered as "—" when absent.
//   assigned_to?: string;
//   updated_at?: string;
// };

// type RelatedRecord = {
//   id: string;
//   status?: string;
//   total?: number | string;
//   amount?: number | string;
//   created_at?: string;
//   [key: string]: any;
// };

// const WEBSITE_OPTIONS = ["All", "Ankshaastra", "Miracle Baby", "Empower"];
// const LEAD_STATUS_OPTIONS = ["All", "Lead", "Qualified", "Customer", "Completed", "Lost"];
// const DATE_FILTER_OPTIONS = [
//   { value: "all", label: "All Time" },
//   { value: "today", label: "Today" },
//   { value: "week", label: "This Week" },
//   { value: "month", label: "This Month" },
// ];
// // Record-status filter — Active hides soft-deleted rows, Deleted shows only them.
// const RECORD_STATUS_OPTIONS = [
//   { value: "active", label: "Active" },
//   { value: "deleted", label: "Deleted" },
// ];

// const PAGE_SIZE = 10;

// // Color-coded lifecycle badge styles — one fixed mapping so status always
// // means the same thing everywhere (matches the semantic-color pattern used
// // on Workflows: green = good / amber = in-progress / red = lost or dead-end).
// const LIFECYCLE_BADGE_STYLES: Record<string, string> = {
//   lead: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
//   qualified: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
//   customer: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
//   completed: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
//   lost: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
// };

// function getLifecycleBadgeClass(stage?: string) {
//   const key = (stage || "lead").toLowerCase();
//   return LIFECYCLE_BADGE_STYLES[key] || LIFECYCLE_BADGE_STYLES.lead;
// }

// function isSameDay(a: Date, b: Date) {
//   return (
//     a.getFullYear() === b.getFullYear() &&
//     a.getMonth() === b.getMonth() &&
//     a.getDate() === b.getDate()
//   );
// }

// function isThisWeek(date: Date, now: Date) {
//   const startOfWeek = new Date(now);
//   const diffToMonday = (now.getDay() + 6) % 7; // week starts Monday
//   startOfWeek.setDate(now.getDate() - diffToMonday);
//   startOfWeek.setHours(0, 0, 0, 0);
//   const endOfWeek = new Date(startOfWeek);
//   endOfWeek.setDate(startOfWeek.getDate() + 7);
//   return date >= startOfWeek && date < endOfWeek;
// }

// function isThisMonth(date: Date, now: Date) {
//   return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
// }

// export default function CrmModule() {
//   const { rows, loading } = useAdminTable<Customer>("customers");

//   // Local mirror of the hook's data so we can refresh/mutate after edits & deletes
//   // without needing to change the shared useAdminTable hook.
//   const [customers, setCustomers] = useState<Customer[]>([]);
//   const [refreshing, setRefreshing] = useState(false);

//   const [searchTerm, setSearchTerm] = useState("");
//   const [websiteFilter, setWebsiteFilter] = useState("All");
//   const [leadStatusFilter, setLeadStatusFilter] = useState("All");
//   const [dateFilter, setDateFilter] = useState("all");
//   // Active vs Deleted view. Defaults to Active so soft-deleted records stay
//   // hidden from the normal listing.
//   const [recordStatusFilter, setRecordStatusFilter] = useState<"active" | "deleted">("active");
//   const [page, setPage] = useState(1);

//   const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
//   const [editLifecycleStage, setEditLifecycleStage] = useState("Lead");
//   const [savingEdit, setSavingEdit] = useState(false);
//   const [orders, setOrders] = useState<RelatedRecord[]>([]);
//   const [invoices, setInvoices] = useState<RelatedRecord[]>([]);
//   const [loadingRelated, setLoadingRelated] = useState(false);

//   // Soft-delete confirmation target (Active view)
//   const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
//   const [deleting, setDeleting] = useState(false);

//   // Permanent-delete confirmation target (Deleted view only)
//   const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<Customer | null>(null);
//   const [permanentDeleting, setPermanentDeleting] = useState(false);

//   // Restoring a record back to Active
//   const [restoringId, setRestoringId] = useState<string | null>(null);

//   useEffect(() => {
//     setCustomers(rows);
//   }, [rows]);

//   useEffect(() => {
//     setPage(1);
//   }, [searchTerm, websiteFilter, leadStatusFilter, dateFilter, recordStatusFilter]);

//   const refetchCustomers = async () => {
//     setRefreshing(true);
//     try {
//       const { data, error } = await supabase
//         .from("customers")
//         .select("*")
//         .order("created_at", { ascending: false });
//       if (error) throw error;
//       setCustomers((data as Customer[]) || []);
//     } catch (err) {
//       console.error("Failed to refresh customers", err);
//       toast.error("Couldn't refresh customers", {
//         description: "Please try again.",
//       });
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   const filteredCustomers = useMemo(() => {
//     const now = new Date();
//     const term = searchTerm.trim().toLowerCase();

//     return customers.filter((c) => {
//       // Active / Deleted view — soft-deleted records are hidden from the
//       // normal listing and only surfaced under the Deleted filter.
//       const isDeleted = !!c.deleted_at;
//       if (recordStatusFilter === "active" && isDeleted) return false;
//       if (recordStatusFilter === "deleted" && !isDeleted) return false;

//       if (term) {
//         const haystack = [c.full_name, c.email, c.phone, c.source_website]
//           .filter(Boolean)
//           .join(" ")
//           .toLowerCase();
//         if (!haystack.includes(term)) return false;
//       }

//       if (websiteFilter !== "All" && c.source_website !== websiteFilter) {
//         return false;
//       }

//       if (leadStatusFilter !== "All") {
//         const stage = c.lifecycle_stage || "Lead";
//         if (stage.toLowerCase() !== leadStatusFilter.toLowerCase()) return false;
//       }

//       if (dateFilter !== "all" && c.created_at) {
//         const created = new Date(c.created_at);
//         if (dateFilter === "today" && !isSameDay(created, now)) return false;
//         if (dateFilter === "week" && !isThisWeek(created, now)) return false;
//         if (dateFilter === "month" && !isThisMonth(created, now)) return false;
//       }

//       return true;
//     });
//   }, [customers, searchTerm, websiteFilter, leadStatusFilter, dateFilter, recordStatusFilter]);

//   const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / PAGE_SIZE));
//   const paginatedCustomers = useMemo(() => {
//     const start = (page - 1) * PAGE_SIZE;
//     return filteredCustomers.slice(start, start + PAGE_SIZE);
//   }, [filteredCustomers, page]);

//   const hasActiveFilters =
//     !!searchTerm || websiteFilter !== "All" || leadStatusFilter !== "All" || dateFilter !== "all";

//   const clearFilters = () => {
//     setSearchTerm("");
//     setWebsiteFilter("All");
//     setLeadStatusFilter("All");
//     setDateFilter("all");
//   };

//   // Exports exactly what's currently filtered/searched (not just the current
//   // page), so "Export CSV" always matches what the admin is looking at.
//   const handleExportCsv = () => {
//     if (!filteredCustomers.length) {
//       toast.error("No records to export.");
//       return;
//     }
//     exportRowsAsCsv("crm", filteredCustomers, [
//       { label: "Customer Name", value: (c) => c.full_name },
//       { label: "Email", value: (c) => c.email },
//       { label: "Phone", value: (c) => c.phone },
//       { label: "Status", value: (c) => c.lifecycle_stage || "Lead" },
//       { label: "Source", value: (c) => c.source_website },
//       { label: "Assigned To", value: (c) => c.assigned_to },
//       { label: "Created At", value: (c) => (c.created_at ? new Date(c.created_at).toLocaleString() : "") },
//       { label: "Updated At", value: (c) => (c.updated_at ? new Date(c.updated_at).toLocaleString() : "") },
//     ]);
//   };

//   const openViewDialog = async (customer: Customer) => {
//     setViewCustomer(customer);
//     setEditLifecycleStage(customer.lifecycle_stage || "Lead");
//     setOrders([]);
//     setInvoices([]);
//     setLoadingRelated(true);
//     try {
//       const [ordersRes, invoicesRes] = await Promise.all([
//         supabase.from("orders").select("*").eq("customer_id", customer.id),
//         supabase.from("invoices").select("*").eq("customer_id", customer.id),
//       ]);
//       if (!ordersRes.error && ordersRes.data) setOrders(ordersRes.data as RelatedRecord[]);
//       if (!invoicesRes.error && invoicesRes.data) setInvoices(invoicesRes.data as RelatedRecord[]);
//     } catch (err) {
//       // Orders/invoices tables may not exist in every deployment — fail quietly, they're optional.
//       console.warn("Orders/invoices lookup skipped:", err);
//     } finally {
//       setLoadingRelated(false);
//     }
//   };

//   const closeViewDialog = () => {
//     setViewCustomer(null);
//     setOrders([]);
//     setInvoices([]);
//   };

//   const handleSaveEdit = async () => {
//     if (!viewCustomer) return;
//     setSavingEdit(true);
//     try {
//       const { error } = await supabase
//         .from("customers")
//         .update({ lifecycle_stage: editLifecycleStage })
//         .eq("id", viewCustomer.id);
//       if (error) throw error;

//       setCustomers((prev) =>
//         prev.map((c) =>
//           c.id === viewCustomer.id ? { ...c, lifecycle_stage: editLifecycleStage } : c
//         )
//       );
//       toast.success("Customer updated", {
//         description: `${viewCustomer.full_name}'s lead status was saved.`,
//       });
//       closeViewDialog();
//     } catch (err) {
//       console.error("Failed to update customer", err);
//       toast.error("Couldn't save changes", {
//         description: "Please try again.",
//       });
//     } finally {
//       setSavingEdit(false);
//     }
//   };

//   // Soft delete: marks deleted_at instead of removing the row.
//   const handleSoftDelete = async () => {
//     if (!deleteTarget) return;
//     setDeleting(true);
//     try {
//       const { error } = await supabase
//         .from("customers")
//         .update({ deleted_at: new Date().toISOString() })
//         .eq("id", deleteTarget.id);
//       if (error) throw error;

//       toast.success("CRM record deleted", {
//         description: `${deleteTarget.full_name} was moved to Deleted. You can restore it anytime.`,
//       });
//       setDeleteTarget(null);
//       await refetchCustomers();
//     } catch (err) {
//       console.error("Failed to soft delete customer", err);
//       toast.error("Couldn't delete this record", {
//         description: "Please try again.",
//       });
//     } finally {
//       setDeleting(false);
//     }
//   };

//   // Restore: clears deleted_at, moving the record back to Active.
//   const handleRestore = async (customer: Customer) => {
//     setRestoringId(customer.id);
//     try {
//       const { error } = await supabase
//         .from("customers")
//         .update({ deleted_at: null })
//         .eq("id", customer.id);
//       if (error) throw error;

//       toast.success("CRM record restored", {
//         description: `${customer.full_name} is active again.`,
//       });
//       await refetchCustomers();
//     } catch (err) {
//       console.error("Failed to restore customer", err);
//       toast.error("Couldn't restore this record", {
//         description: "Please try again.",
//       });
//     } finally {
//       setRestoringId(null);
//     }
//   };

//   // Permanent delete: real row removal. Only reachable from the Deleted filter.
//   const handlePermanentDelete = async () => {
//     if (!permanentDeleteTarget) return;
//     setPermanentDeleting(true);
//     try {
//       const { error } = await supabase
//         .from("customers")
//         .delete()
//         .eq("id", permanentDeleteTarget.id);
//       if (error) throw error;

//       toast.success("CRM record permanently deleted", {
//         description: `${permanentDeleteTarget.full_name} was permanently removed.`,
//       });
//       setPermanentDeleteTarget(null);
//       await refetchCustomers();
//     } catch (err) {
//       console.error("Failed to permanently delete customer", err);
//       toast.error("Couldn't permanently delete this record", {
//         description: "Please try again.",
//       });
//     } finally {
//       setPermanentDeleting(false);
//     }
//   };

//   return (
//     <AdminPage
//       title="CRM"
//       description="Customer lifecycle across all properties."
//       loading={loading}
//       empty={!loading && !customers.length}
//     >
//       <div className="space-y-4">
//         {/* Search + Filters */}
//         <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
//           <div className="relative w-full sm:max-w-xs">
//             <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//             <Input
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               placeholder="Search name, email, phone, website..."
//               className="pl-8"
//             />
//           </div>

//           <Select value={websiteFilter} onValueChange={setWebsiteFilter}>
//             <SelectTrigger className="w-full sm:w-[180px]">
//               <SelectValue placeholder="Website" />
//             </SelectTrigger>
//             <SelectContent>
//               {WEBSITE_OPTIONS.map((opt) => (
//                 <SelectItem key={opt} value={opt}>
//                   {opt}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           <Select value={leadStatusFilter} onValueChange={setLeadStatusFilter}>
//             <SelectTrigger className="w-full sm:w-[180px]">
//               <SelectValue placeholder="Lead Status" />
//             </SelectTrigger>
//             <SelectContent>
//               {LEAD_STATUS_OPTIONS.map((opt) => (
//                 <SelectItem key={opt} value={opt}>
//                   {opt}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           <Select value={dateFilter} onValueChange={setDateFilter}>
//             <SelectTrigger className="w-full sm:w-[160px]">
//               <SelectValue placeholder="Date" />
//             </SelectTrigger>
//             <SelectContent>
//               {DATE_FILTER_OPTIONS.map((opt) => (
//                 <SelectItem key={opt.value} value={opt.value}>
//                   {opt.label}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           <Select
//             value={recordStatusFilter}
//             onValueChange={(v) => setRecordStatusFilter(v as "active" | "deleted")}
//           >
//             <SelectTrigger className="w-full sm:w-[140px]">
//               <SelectValue placeholder="Record Status" />
//             </SelectTrigger>
//             <SelectContent>
//               {RECORD_STATUS_OPTIONS.map((opt) => (
//                 <SelectItem key={opt.value} value={opt.value}>
//                   {opt.label}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           {hasActiveFilters && (
//             <Button variant="ghost" size="sm" onClick={clearFilters}>
//               Clear filters
//             </Button>
//           )}

//           <Button variant="outline" size="sm" onClick={handleExportCsv} className="sm:ml-auto">
//             <Download className="h-4 w-4 mr-1.5" />
//             Export CSV
//           </Button>
//         </div>

//         <p className="text-sm text-muted-foreground">
//           {filteredCustomers.length} customer{filteredCustomers.length === 1 ? "" : "s"} found
//           {recordStatusFilter === "deleted" ? " · viewing deleted" : ""}
//           {refreshing ? " · refreshing…" : ""}
//         </p>

//         {/* Customer list */}
//         <div className="space-y-2">
//           {paginatedCustomers.map((c) => (
//             <div
//               key={c.id}
//               className="border border-border rounded-lg p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
//             >
//               <div className="min-w-0">
//                 <p className="font-semibold truncate">{c.full_name}</p>
//                 <p className="text-sm text-muted-foreground truncate">
//                   {c.email || "—"} · {c.phone || "—"}
//                 </p>
//               </div>

//               <div className="flex flex-wrap items-center gap-2 sm:justify-end">
//                 {c.source_website && <Badge variant="secondary">{c.source_website}</Badge>}
//                 <Badge
//                   variant="outline"
//                   className={cn("font-medium", getLifecycleBadgeClass(c.lifecycle_stage))}
//                 >
//                   {c.lifecycle_stage || "Lead"}
//                 </Badge>

//                 <div className="flex items-center gap-1 sm:ml-2">
//                   {recordStatusFilter === "active" ? (
//                     <>
//                       <Button
//                         size="icon"
//                         variant="ghost"
//                         className="h-8 w-8 text-muted-foreground hover:text-foreground"
//                         onClick={() => openViewDialog(c)}
//                         aria-label={`View ${c.full_name}`}
//                         title="View"
//                       >
//                         <Eye className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         size="icon"
//                         variant="ghost"
//                         className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
//                         onClick={() => setDeleteTarget(c)}
//                         aria-label={`Delete ${c.full_name}`}
//                         title="Delete"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </>
//                   ) : (
//                     <>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         className="h-8 gap-1.5"
//                         onClick={() => handleRestore(c)}
//                         disabled={restoringId === c.id}
//                         aria-label={`Restore ${c.full_name}`}
//                         title="Restore"
//                       >
//                         <RotateCcw className="h-3.5 w-3.5" />
//                         {restoringId === c.id ? "Restoring…" : "Restore"}
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="ghost"
//                         className="h-8 gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
//                         onClick={() => setPermanentDeleteTarget(c)}
//                         aria-label={`Permanently delete ${c.full_name}`}
//                         title="Permanently Delete"
//                       >
//                         <XCircle className="h-3.5 w-3.5" />
//                         Permanently Delete
//                       </Button>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}

//           {!loading && !paginatedCustomers.length && (
//             <p className="text-sm text-muted-foreground text-center py-8">
//               {recordStatusFilter === "deleted"
//                 ? "No deleted records."
//                 : "No customers match your search or filters."}
//             </p>
//           )}
//         </div>

//         {/* Pagination */}
//         {filteredCustomers.length > 0 && (
//           <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
//             <p className="text-sm text-muted-foreground">
//               Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredCustomers.length)} of{" "}
//               {filteredCustomers.length}
//             </p>
//             <div className="flex items-center gap-3">
//               <Button
//                 size="sm"
//                 variant="outline"
//                 disabled={page <= 1}
//                 onClick={() => setPage((p) => Math.max(1, p - 1))}
//               >
//                 Previous
//               </Button>
//               <p className="text-sm text-muted-foreground whitespace-nowrap">
//                 Page {page} of {totalPages}
//               </p>
//               <Button
//                 size="sm"
//                 variant="outline"
//                 disabled={page >= totalPages}
//                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//               >
//                 Next
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* View / Edit Dialog */}
//       <Dialog open={!!viewCustomer} onOpenChange={(open) => !open && closeViewDialog()}>
//         <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
//           {viewCustomer && (
//             <>
//               <DialogHeader>
//                 <DialogTitle>{viewCustomer.full_name}</DialogTitle>
//                 <DialogDescription>Customer details</DialogDescription>
//               </DialogHeader>

//               <div className="space-y-4 py-2">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
//                   <div>
//                     <p className="text-muted-foreground">Email</p>
//                     <p className="font-medium break-all">{viewCustomer.email || "—"}</p>
//                   </div>
//                   <div>
//                     <p className="text-muted-foreground">Phone</p>
//                     <p className="font-medium">{viewCustomer.phone || "—"}</p>
//                   </div>
//                   <div>
//                     <p className="text-muted-foreground">Website</p>
//                     <p className="font-medium">{viewCustomer.source_website || "—"}</p>
//                   </div>
//                   <div>
//                     <p className="text-muted-foreground">Created</p>
//                     <p className="font-medium">
//                       {viewCustomer.created_at
//                         ? new Date(viewCustomer.created_at).toLocaleString()
//                         : "—"}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="space-y-1.5">
//                   <Label htmlFor="lead-status">Lead Status</Label>
//                   <Select value={editLifecycleStage} onValueChange={setEditLifecycleStage}>
//                     <SelectTrigger id="lead-status">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {LEAD_STATUS_OPTIONS.filter((o) => o !== "All").map((opt) => (
//                         <SelectItem key={opt} value={opt}>
//                           {opt}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div>
//                   <p className="text-sm font-semibold mb-1.5">Orders</p>
//                   {loadingRelated ? (
//                     <p className="text-sm text-muted-foreground">Loading…</p>
//                   ) : orders.length ? (
//                     <div className="space-y-1.5">
//                       {orders.map((o) => (
//                         <div
//                           key={o.id}
//                           className="text-sm border border-border rounded-md px-3 py-2 flex justify-between"
//                         >
//                           <span>{o.id}</span>
//                           <span className="text-muted-foreground">
//                             {o.status || "—"} {o.total ? `· ${o.total}` : ""}
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <p className="text-sm text-muted-foreground">No orders available.</p>
//                   )}
//                 </div>

//                 <div>
//                   <p className="text-sm font-semibold mb-1.5">Invoices</p>
//                   {loadingRelated ? (
//                     <p className="text-sm text-muted-foreground">Loading…</p>
//                   ) : invoices.length ? (
//                     <div className="space-y-1.5">
//                       {invoices.map((inv) => (
//                         <div
//                           key={inv.id}
//                           className="text-sm border border-border rounded-md px-3 py-2 flex justify-between"
//                         >
//                           <span>{inv.id}</span>
//                           <span className="text-muted-foreground">
//                             {inv.status || "—"} {inv.amount ? `· ${inv.amount}` : ""}
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <p className="text-sm text-muted-foreground">No invoices available.</p>
//                   )}
//                 </div>
//               </div>

//               <DialogFooter>
//                 <Button variant="outline" onClick={closeViewDialog} disabled={savingEdit}>
//                   Cancel
//                 </Button>
//                 <Button onClick={handleSaveEdit} disabled={savingEdit}>
//                   {savingEdit ? "Saving…" : "Save changes"}
//                 </Button>
//               </DialogFooter>
//             </>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Soft delete confirmation (Active view) */}
//       <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete CRM Record?</AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you want to delete this CRM record?
//               <br />
//               This action can be restored later.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handleSoftDelete} disabled={deleting}>
//               {deleting ? "Deleting…" : "Delete"}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//       {/* Permanent delete confirmation (Deleted view only) */}
//       <AlertDialog
//         open={!!permanentDeleteTarget}
//         onOpenChange={(open) => !open && setPermanentDeleteTarget(null)}
//       >
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Permanently Delete Record?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This will permanently delete{" "}
//               <span className="font-medium">{permanentDeleteTarget?.full_name}</span> from your
//               CRM. This action cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={permanentDeleting}>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handlePermanentDelete} disabled={permanentDeleting}>
//               {permanentDeleting ? "Deleting…" : "Permanently Delete"}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </AdminPage>
//   );
// }


// import { useEffect, useMemo, useState } from "react";
// import { AdminPage } from "@/components/admin/AdminPage";
// import { useAdminTable } from "@/hooks/useAdminData";
// import { supabase } from "@/integrations/supabase/client";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
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
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
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
// import { Search as SearchIcon, Eye, Trash2, RotateCcw, XCircle, Download } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { exportRowsAsCsv } from "@/lib/csv-export";

// type Customer = {
//   id: string;
//   full_name: string;
//   email?: string;
//   phone?: string;
//   source_website?: string;
//   lifecycle_stage?: string;
//   created_at: string;
//   // Soft-delete marker. Nullable timestamp: null/undefined = active record,
//   // a timestamp = when the record was soft deleted.
//   deleted_at?: string | null;
//   // Optional — present only if these columns exist in your Supabase
//   // "customers" table. Used by CSV export; rendered as "—" when absent.
//   assigned_to?: string;
//   updated_at?: string;
// };

// type RelatedRecord = {
//   id: string;
//   status?: string;
//   total?: number | string;
//   amount?: number | string;
//   created_at?: string;
//   [key: string]: any;
// };

// const WEBSITE_OPTIONS = ["All", "Ankshaastra", "Miracle Baby", "Empower"];

// // Time filter — kept to exactly these options, in this exact order.
// // "custom" continues to use the existing date-range inputs below.
// const DATE_FILTER_OPTIONS = [
//   { value: "today", label: "Today" },
//   { value: "week", label: "This Week" },
//   { value: "month", label: "This Month" },
//   { value: "year", label: "This Year" },
//   { value: "lastyear", label: "Last Year" },
//   { value: "all", label: "All Time" },
//   { value: "custom", label: "Custom Range" },
// ];

// // Record-status filter — Active hides soft-deleted rows, Deleted shows only them.
// const RECORD_STATUS_OPTIONS = [
//   { value: "active", label: "Active" },
//   { value: "deleted", label: "Deleted" },
// ];

// const PAGE_SIZE = 10;

// // Color-coded lifecycle badge styles — only two outcomes are shown anywhere
// // in the CRM UI: Completed (payment succeeded) or Dropped (payment
// // failed / never completed). Any stored lifecycle_stage other than
// // "completed" (Lead, Qualified, Customer, Lost, etc.) displays as Dropped.
// // Note: this is a DISPLAY-ONLY simplification — the underlying
// // lifecycle_stage value in the database is left exactly as-is.
// const LIFECYCLE_BADGE_STYLES: Record<string, string> = {
//   completed: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
//   dropped: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
// };

// // Maps any raw lifecycle_stage to the 2 statuses shown in the UI.
// function getDisplayStatus(stage?: string): "Completed" | "Dropped" {
//   return (stage || "").toLowerCase() === "completed" ? "Completed" : "Dropped";
// }

// function getLifecycleBadgeClass(stage?: string) {
//   const key = getDisplayStatus(stage).toLowerCase();
//   return LIFECYCLE_BADGE_STYLES[key];
// }

// function isSameDay(a: Date, b: Date) {
//   return (
//     a.getFullYear() === b.getFullYear() &&
//     a.getMonth() === b.getMonth() &&
//     a.getDate() === b.getDate()
//   );
// }

// function isThisWeek(date: Date, now: Date) {
//   const startOfWeek = new Date(now);
//   const diffToMonday = (now.getDay() + 6) % 7; // week starts Monday
//   startOfWeek.setDate(now.getDate() - diffToMonday);
//   startOfWeek.setHours(0, 0, 0, 0);
//   const endOfWeek = new Date(startOfWeek);
//   endOfWeek.setDate(startOfWeek.getDate() + 7);
//   return date >= startOfWeek && date < endOfWeek;
// }

// function isThisMonth(date: Date, now: Date) {
//   return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
// }

// function isThisYear(date: Date, now: Date) {
//   return date.getFullYear() === now.getFullYear();
// }

// function isLastYear(date: Date, now: Date) {
//   return date.getFullYear() === now.getFullYear() - 1;
// }

// export default function CrmModule() {
//   const { rows, loading } = useAdminTable<Customer>("customers");

//   // Local mirror of the hook's data so we can refresh/mutate after edits & deletes
//   // without needing to change the shared useAdminTable hook.
//   const [customers, setCustomers] = useState<Customer[]>([]);
//   const [refreshing, setRefreshing] = useState(false);

//   const [searchTerm, setSearchTerm] = useState("");
//   const [websiteFilter, setWebsiteFilter] = useState("All");
//   const [dateFilter, setDateFilter] = useState("all");
//   // Custom Range bounds — only used when dateFilter === "custom".
//   const [customStartDate, setCustomStartDate] = useState("");
//   const [customEndDate, setCustomEndDate] = useState("");
//   // Active vs Deleted view. Defaults to Active so soft-deleted records stay
//   // hidden from the normal listing.
//   const [recordStatusFilter, setRecordStatusFilter] = useState<"active" | "deleted">("active");
//   const [page, setPage] = useState(1);

//   const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
//   const [orders, setOrders] = useState<RelatedRecord[]>([]);
//   const [invoices, setInvoices] = useState<RelatedRecord[]>([]);
//   const [loadingRelated, setLoadingRelated] = useState(false);

//   // Soft-delete confirmation target (Active view)
//   const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
//   const [deleting, setDeleting] = useState(false);

//   // Permanent-delete confirmation target (Deleted view only)
//   const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<Customer | null>(null);
//   const [permanentDeleting, setPermanentDeleting] = useState(false);

//   // Restoring a record back to Active
//   const [restoringId, setRestoringId] = useState<string | null>(null);

//   useEffect(() => {
//     setCustomers(rows);
//   }, [rows]);

//   useEffect(() => {
//     setPage(1);
//   }, [searchTerm, websiteFilter, dateFilter, customStartDate, customEndDate, recordStatusFilter]);

//   const refetchCustomers = async () => {
//     setRefreshing(true);
//     try {
//       const { data, error } = await supabase
//         .from("customers")
//         .select("*")
//         .order("created_at", { ascending: false });
//       if (error) throw error;
//       setCustomers((data as Customer[]) || []);
//     } catch (err) {
//       console.error("Failed to refresh customers", err);
//       toast.error("Couldn't refresh customers", {
//         description: "Please try again.",
//       });
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   const filteredCustomers = useMemo(() => {
//     const now = new Date();
//     const term = searchTerm.trim().toLowerCase();

//     return customers.filter((c) => {
//       // Active / Deleted view — soft-deleted records are hidden from the
//       // normal listing and only surfaced under the Deleted filter.
//       const isDeleted = !!c.deleted_at;
//       if (recordStatusFilter === "active" && isDeleted) return false;
//       if (recordStatusFilter === "deleted" && !isDeleted) return false;

//       if (term) {
//         const haystack = [c.full_name, c.email, c.phone, c.source_website]
//           .filter(Boolean)
//           .join(" ")
//           .toLowerCase();
//         if (!haystack.includes(term)) return false;
//       }

//       if (websiteFilter !== "All" && c.source_website !== websiteFilter) {
//         return false;
//       }

//       if (dateFilter !== "all" && c.created_at) {
//         const created = new Date(c.created_at);
//         if (dateFilter === "today" && !isSameDay(created, now)) return false;
//         if (dateFilter === "week" && !isThisWeek(created, now)) return false;
//         if (dateFilter === "month" && !isThisMonth(created, now)) return false;
//         if (dateFilter === "year" && !isThisYear(created, now)) return false;
//         if (dateFilter === "lastyear" && !isLastYear(created, now)) return false;
//         if (dateFilter === "custom") {
//           if (customStartDate && created < new Date(customStartDate)) return false;
//           if (customEndDate) {
//             const end = new Date(customEndDate);
//             end.setHours(23, 59, 59, 999);
//             if (created > end) return false;
//           }
//         }
//       }

//       return true;
//     });
//   }, [customers, searchTerm, websiteFilter, dateFilter, customStartDate, customEndDate, recordStatusFilter]);

//   const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / PAGE_SIZE));
//   const paginatedCustomers = useMemo(() => {
//     const start = (page - 1) * PAGE_SIZE;
//     return filteredCustomers.slice(start, start + PAGE_SIZE);
//   }, [filteredCustomers, page]);

//   const hasActiveFilters =
//     !!searchTerm ||
//     websiteFilter !== "All" ||
//     dateFilter !== "all" ||
//     !!customStartDate ||
//     !!customEndDate;

//   const clearFilters = () => {
//     setSearchTerm("");
//     setWebsiteFilter("All");
//     setDateFilter("all");
//     setCustomStartDate("");
//     setCustomEndDate("");
//   };

//   // Exports exactly what's currently filtered/searched (not just the current
//   // page), so "Export CSV" always matches what the admin is looking at.
//   const handleExportCsv = () => {
//     if (!filteredCustomers.length) {
//       toast.error("No records to export.");
//       return;
//     }
//     exportRowsAsCsv("crm", filteredCustomers, [
//       { label: "Customer Name", value: (c) => c.full_name },
//       { label: "Email", value: (c) => c.email },
//       { label: "Phone", value: (c) => c.phone },
//       { label: "Status", value: (c) => getDisplayStatus(c.lifecycle_stage) },
//       { label: "Source", value: (c) => c.source_website },
//       { label: "Assigned To", value: (c) => c.assigned_to },
//       { label: "Created At", value: (c) => (c.created_at ? new Date(c.created_at).toLocaleString() : "") },
//       { label: "Updated At", value: (c) => (c.updated_at ? new Date(c.updated_at).toLocaleString() : "") },
//     ]);
//   };

//   const openViewDialog = async (customer: Customer) => {
//     setViewCustomer(customer);
//     setOrders([]);
//     setInvoices([]);
//     setLoadingRelated(true);
//     try {
//       const [ordersRes, invoicesRes] = await Promise.all([
//         supabase.from("orders").select("*").eq("customer_id", customer.id),
//         supabase.from("invoices").select("*").eq("customer_id", customer.id),
//       ]);
//       if (!ordersRes.error && ordersRes.data) setOrders(ordersRes.data as RelatedRecord[]);
//       if (!invoicesRes.error && invoicesRes.data) setInvoices(invoicesRes.data as RelatedRecord[]);
//     } catch (err) {
//       // Orders/invoices tables may not exist in every deployment — fail quietly, they're optional.
//       console.warn("Orders/invoices lookup skipped:", err);
//     } finally {
//       setLoadingRelated(false);
//     }
//   };

//   const closeViewDialog = () => {
//     setViewCustomer(null);
//     setOrders([]);
//     setInvoices([]);
//   };

//   // Soft delete: marks deleted_at instead of removing the row.
//   const handleSoftDelete = async () => {
//     if (!deleteTarget) return;
//     setDeleting(true);
//     try {
//       const { error } = await supabase
//         .from("customers")
//         .update({ deleted_at: new Date().toISOString() })
//         .eq("id", deleteTarget.id);
//       if (error) throw error;

//       toast.success("CRM record deleted", {
//         description: `${deleteTarget.full_name} was moved to Deleted. You can restore it anytime.`,
//       });
//       setDeleteTarget(null);
//       await refetchCustomers();
//     } catch (err) {
//       console.error("Failed to soft delete customer", err);
//       toast.error("Couldn't delete this record", {
//         description: "Please try again.",
//       });
//     } finally {
//       setDeleting(false);
//     }
//   };

//   // Restore: clears deleted_at, moving the record back to Active.
//   const handleRestore = async (customer: Customer) => {
//     setRestoringId(customer.id);
//     try {
//       const { error } = await supabase
//         .from("customers")
//         .update({ deleted_at: null })
//         .eq("id", customer.id);
//       if (error) throw error;

//       toast.success("CRM record restored", {
//         description: `${customer.full_name} is active again.`,
//       });
//       await refetchCustomers();
//     } catch (err) {
//       console.error("Failed to restore customer", err);
//       toast.error("Couldn't restore this record", {
//         description: "Please try again.",
//       });
//     } finally {
//       setRestoringId(null);
//     }
//   };

//   // Permanent delete: real row removal. Only reachable from the Deleted filter.
//   const handlePermanentDelete = async () => {
//     if (!permanentDeleteTarget) return;
//     setPermanentDeleting(true);
//     try {
//       const { error } = await supabase
//         .from("customers")
//         .delete()
//         .eq("id", permanentDeleteTarget.id);
//       if (error) throw error;

//       toast.success("CRM record permanently deleted", {
//         description: `${permanentDeleteTarget.full_name} was permanently removed.`,
//       });
//       setPermanentDeleteTarget(null);
//       await refetchCustomers();
//     } catch (err) {
//       console.error("Failed to permanently delete customer", err);
//       toast.error("Couldn't permanently delete this record", {
//         description: "Please try again.",
//       });
//     } finally {
//       setPermanentDeleting(false);
//     }
//   };

//   return (
//     <AdminPage
//       title="CRM"
//       description="Customer lifecycle across all properties."
//       loading={loading}
//       empty={!loading && !customers.length}
//     >
//       <div className="space-y-4">
//         {/* Search + Filters */}
//         <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
//           <div className="relative w-full sm:max-w-xs">
//             <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//             <Input
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               placeholder="Search name, email, phone, website..."
//               className="pl-8"
//             />
//           </div>

//           <Select value={websiteFilter} onValueChange={setWebsiteFilter}>
//             <SelectTrigger className="w-full sm:w-[180px]">
//               <SelectValue placeholder="Website" />
//             </SelectTrigger>
//             <SelectContent>
//               {WEBSITE_OPTIONS.map((opt) => (
//                 <SelectItem key={opt} value={opt}>
//                   {opt}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           <Select value={dateFilter} onValueChange={setDateFilter}>
//             <SelectTrigger className="w-full sm:w-[160px]">
//               <SelectValue placeholder="Time Filter" />
//             </SelectTrigger>
//             <SelectContent>
//               {DATE_FILTER_OPTIONS.map((opt) => (
//                 <SelectItem key={opt.value} value={opt.value}>
//                   {opt.label}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           {dateFilter === "custom" && (
//             <div className="flex items-center gap-2">
//               <Input
//                 type="date"
//                 value={customStartDate}
//                 onChange={(e) => setCustomStartDate(e.target.value)}
//                 className="w-full sm:w-[150px]"
//                 aria-label="Custom range start date"
//               />
//               <span className="text-sm text-muted-foreground">to</span>
//               <Input
//                 type="date"
//                 value={customEndDate}
//                 onChange={(e) => setCustomEndDate(e.target.value)}
//                 className="w-full sm:w-[150px]"
//                 aria-label="Custom range end date"
//               />
//             </div>
//           )}

//           <Select
//             value={recordStatusFilter}
//             onValueChange={(v) => setRecordStatusFilter(v as "active" | "deleted")}
//           >
//             <SelectTrigger className="w-full sm:w-[140px]">
//               <SelectValue placeholder="Record Status" />
//             </SelectTrigger>
//             <SelectContent>
//               {RECORD_STATUS_OPTIONS.map((opt) => (
//                 <SelectItem key={opt.value} value={opt.value}>
//                   {opt.label}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           {hasActiveFilters && (
//             <Button variant="ghost" size="sm" onClick={clearFilters}>
//               Clear filters
//             </Button>
//           )}

//           <Button variant="outline" size="sm" onClick={handleExportCsv} className="sm:ml-auto">
//             <Download className="h-4 w-4 mr-1.5" />
//             Export CSV
//           </Button>
//         </div>

//         <p className="text-sm text-muted-foreground">
//           {filteredCustomers.length} customer{filteredCustomers.length === 1 ? "" : "s"} found
//           {recordStatusFilter === "deleted" ? " · viewing deleted" : ""}
//           {refreshing ? " · refreshing…" : ""}
//         </p>

//         {/* Customer list */}
//         <div className="space-y-2">
//           {paginatedCustomers.map((c) => (
//             <div
//               key={c.id}
//               className="border border-border rounded-lg p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
//             >
//               <div className="min-w-0">
//                 <p className="font-semibold truncate">{c.full_name}</p>
//                 <p className="text-sm text-muted-foreground truncate">
//                   {c.email || "—"} · {c.phone || "—"}
//                 </p>
//               </div>

//               <div className="flex flex-wrap items-center gap-2 sm:justify-end">
//                 {c.source_website && <Badge variant="secondary">{c.source_website}</Badge>}
//                 <Badge
//                   variant="outline"
//                   className={cn("font-medium", getLifecycleBadgeClass(c.lifecycle_stage))}
//                 >
//                   {getDisplayStatus(c.lifecycle_stage)}
//                 </Badge>

//                 <div className="flex items-center gap-1 sm:ml-2">
//                   {recordStatusFilter === "active" ? (
//                     <>
//                       <Button
//                         size="icon"
//                         variant="ghost"
//                         className="h-8 w-8 text-muted-foreground hover:text-foreground"
//                         onClick={() => openViewDialog(c)}
//                         aria-label={`View ${c.full_name}`}
//                         title="View"
//                       >
//                         <Eye className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         size="icon"
//                         variant="ghost"
//                         className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
//                         onClick={() => setDeleteTarget(c)}
//                         aria-label={`Delete ${c.full_name}`}
//                         title="Delete"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </>
//                   ) : (
//                     <>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         className="h-8 gap-1.5"
//                         onClick={() => handleRestore(c)}
//                         disabled={restoringId === c.id}
//                         aria-label={`Restore ${c.full_name}`}
//                         title="Restore"
//                       >
//                         <RotateCcw className="h-3.5 w-3.5" />
//                         {restoringId === c.id ? "Restoring…" : "Restore"}
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="ghost"
//                         className="h-8 gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
//                         onClick={() => setPermanentDeleteTarget(c)}
//                         aria-label={`Permanently delete ${c.full_name}`}
//                         title="Permanently Delete"
//                       >
//                         <XCircle className="h-3.5 w-3.5" />
//                         Permanently Delete
//                       </Button>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}

//           {!loading && !paginatedCustomers.length && (
//             <p className="text-sm text-muted-foreground text-center py-8">
//               {recordStatusFilter === "deleted"
//                 ? "No deleted records."
//                 : "No customers match your search or filters."}
//             </p>
//           )}
//         </div>

//         {/* Pagination */}
//         {filteredCustomers.length > 0 && (
//           <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
//             <p className="text-sm text-muted-foreground">
//               Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredCustomers.length)} of{" "}
//               {filteredCustomers.length}
//             </p>
//             <div className="flex items-center gap-3">
//               <Button
//                 size="sm"
//                 variant="outline"
//                 disabled={page <= 1}
//                 onClick={() => setPage((p) => Math.max(1, p - 1))}
//               >
//                 Previous
//               </Button>
//               <p className="text-sm text-muted-foreground whitespace-nowrap">
//                 Page {page} of {totalPages}
//               </p>
//               <Button
//                 size="sm"
//                 variant="outline"
//                 disabled={page >= totalPages}
//                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//               >
//                 Next
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* View Dialog (read-only — Lead Status can no longer be edited here) */}
//       <Dialog open={!!viewCustomer} onOpenChange={(open) => !open && closeViewDialog()}>
//         <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
//           {viewCustomer && (
//             <>
//               <DialogHeader>
//                 <DialogTitle>{viewCustomer.full_name}</DialogTitle>
//                 <DialogDescription>Customer details</DialogDescription>
//               </DialogHeader>

//               <div className="space-y-4 py-2">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
//                   <div>
//                     <p className="text-muted-foreground">Email</p>
//                     <p className="font-medium break-all">{viewCustomer.email || "—"}</p>
//                   </div>
//                   <div>
//                     <p className="text-muted-foreground">Phone</p>
//                     <p className="font-medium">{viewCustomer.phone || "—"}</p>
//                   </div>
//                   <div>
//                     <p className="text-muted-foreground">Website</p>
//                     <p className="font-medium">{viewCustomer.source_website || "—"}</p>
//                   </div>
//                   <div>
//                     <p className="text-muted-foreground">Created</p>
//                     <p className="font-medium">
//                       {viewCustomer.created_at
//                         ? new Date(viewCustomer.created_at).toLocaleString()
//                         : "—"}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="space-y-1.5">
//                   <Label>Lead Status</Label>
//                   <div>
//                     <Badge
//                       variant="outline"
//                       className={cn(
//                         "font-medium pointer-events-none",
//                         getLifecycleBadgeClass(viewCustomer.lifecycle_stage)
//                       )}
//                     >
//                       {getDisplayStatus(viewCustomer.lifecycle_stage)}
//                     </Badge>
//                   </div>
//                 </div>

//                 <div>
//                   <p className="text-sm font-semibold mb-1.5">Orders</p>
//                   {loadingRelated ? (
//                     <p className="text-sm text-muted-foreground">Loading…</p>
//                   ) : orders.length ? (
//                     <div className="space-y-1.5">
//                       {orders.map((o) => (
//                         <div
//                           key={o.id}
//                           className="text-sm border border-border rounded-md px-3 py-2 flex justify-between"
//                         >
//                           <span>{o.id}</span>
//                           <span className="text-muted-foreground">
//                             {o.status || "—"} {o.total ? `· ${o.total}` : ""}
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <p className="text-sm text-muted-foreground">No orders available.</p>
//                   )}
//                 </div>

//                 <div>
//                   <p className="text-sm font-semibold mb-1.5">Invoices</p>
//                   {loadingRelated ? (
//                     <p className="text-sm text-muted-foreground">Loading…</p>
//                   ) : invoices.length ? (
//                     <div className="space-y-1.5">
//                       {invoices.map((inv) => (
//                         <div
//                           key={inv.id}
//                           className="text-sm border border-border rounded-md px-3 py-2 flex justify-between"
//                         >
//                           <span>{inv.id}</span>
//                           <span className="text-muted-foreground">
//                             {inv.status || "—"} {inv.amount ? `· ${inv.amount}` : ""}
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <p className="text-sm text-muted-foreground">No invoices available.</p>
//                   )}
//                 </div>
//               </div>

//               <DialogFooter>
//                 <Button variant="outline" onClick={closeViewDialog}>
//                   Close
//                 </Button>
//               </DialogFooter>
//             </>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Soft delete confirmation (Active view) */}
//       <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete CRM Record?</AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you want to delete this CRM record?
//               <br />
//               This action can be restored later.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handleSoftDelete} disabled={deleting}>
//               {deleting ? "Deleting…" : "Delete"}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//       {/* Permanent delete confirmation (Deleted view only) */}
//       <AlertDialog
//         open={!!permanentDeleteTarget}
//         onOpenChange={(open) => !open && setPermanentDeleteTarget(null)}
//       >
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Permanently Delete Record?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This will permanently delete{" "}
//               <span className="font-medium">{permanentDeleteTarget?.full_name}</span> from your
//               CRM. This action cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={permanentDeleting}>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handlePermanentDelete} disabled={permanentDeleting}>
//               {permanentDeleting ? "Deleting…" : "Permanently Delete"}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </AdminPage>
//   );
// }
import { useEffect, useMemo, useState } from "react";
import { AdminPage } from "@/components/admin/AdminPage";
import { useAdminTable } from "@/hooks/useAdminData";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { toast } from "sonner";
import { Search as SearchIcon, Eye, Trash2, RotateCcw, XCircle, Download, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";
import { exportRowsAsCsv } from "@/lib/csv-export";
import { GOOGLE_SHEET_URL } from "@/config/googleSheet";

type Customer = {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  source_website?: string;
  lifecycle_stage?: string;
  created_at: string;
  // Soft-delete marker. Nullable timestamp: null/undefined = active record,
  // a timestamp = when the record was soft deleted.
  deleted_at?: string | null;
  // Optional — present only if these columns exist in your Supabase
  // "customers" table. Used by CSV export; rendered as "—" when absent.
  assigned_to?: string;
  updated_at?: string;
};

type RelatedRecord = {
  id: string;
  status?: string;
  total?: number | string;
  amount?: number | string;
  created_at?: string;
  [key: string]: any;
};

const WEBSITE_OPTIONS = ["All", "Ankshaastra", "Miracle Baby", "Empower"];

// Time filter — kept to exactly these options, in this exact order.
// "custom" continues to use the existing date-range inputs below.
const DATE_FILTER_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
  { value: "lastyear", label: "Last Year" },
  { value: "all", label: "All Time" },
  { value: "custom", label: "Custom Range" },
];

// Record-status filter — Active hides soft-deleted rows, Deleted shows only them.
const RECORD_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "deleted", label: "Deleted" },
];

const PAGE_SIZE = 10;

// Color-coded lifecycle badge styles — only two outcomes are shown anywhere
// in the CRM UI: Completed (payment succeeded) or Dropped (payment
// failed / never completed). Any stored lifecycle_stage other than
// "completed" (Lead, Qualified, Customer, Lost, etc.) displays as Dropped.
// Note: this is a DISPLAY-ONLY simplification — the underlying
// lifecycle_stage value in the database is left exactly as-is.
const LIFECYCLE_BADGE_STYLES: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  dropped: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
};

// Maps any raw lifecycle_stage to the 2 statuses shown in the UI.
function getDisplayStatus(stage?: string): "Completed" | "Dropped" {
  return (stage || "").toLowerCase() === "completed" ? "Completed" : "Dropped";
}

function getLifecycleBadgeClass(stage?: string) {
  const key = getDisplayStatus(stage).toLowerCase();
  return LIFECYCLE_BADGE_STYLES[key];
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isThisWeek(date: Date, now: Date) {
  const startOfWeek = new Date(now);
  const diffToMonday = (now.getDay() + 6) % 7; // week starts Monday
  startOfWeek.setDate(now.getDate() - diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return date >= startOfWeek && date < endOfWeek;
}

function isThisMonth(date: Date, now: Date) {
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function isThisYear(date: Date, now: Date) {
  return date.getFullYear() === now.getFullYear();
}

function isLastYear(date: Date, now: Date) {
  return date.getFullYear() === now.getFullYear() - 1;
}

export default function CrmModule() {
  const { rows, loading } = useAdminTable<Customer>("customers");

  // Local mirror of the hook's data so we can refresh/mutate after edits & deletes
  // without needing to change the shared useAdminTable hook.
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [websiteFilter, setWebsiteFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("all");
  // Custom Range bounds — only used when dateFilter === "custom".
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  // Active vs Deleted view. Defaults to Active so soft-deleted records stay
  // hidden from the normal listing.
  const [recordStatusFilter, setRecordStatusFilter] = useState<"active" | "deleted">("active");
  const [page, setPage] = useState(1);

  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<RelatedRecord[]>([]);
  const [invoices, setInvoices] = useState<RelatedRecord[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // Soft-delete confirmation target (Active view)
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Permanent-delete confirmation target (Deleted view only)
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<Customer | null>(null);
  const [permanentDeleting, setPermanentDeleting] = useState(false);

  // Restoring a record back to Active
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    setCustomers(rows);
  }, [rows]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, websiteFilter, dateFilter, customStartDate, customEndDate, recordStatusFilter]);

  const refetchCustomers = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setCustomers((data as Customer[]) || []);
    } catch (err) {
      console.error("Failed to refresh customers", err);
      toast.error("Couldn't refresh customers", {
        description: "Please try again.",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    const now = new Date();
    const term = searchTerm.trim().toLowerCase();

    return customers.filter((c) => {
      // Active / Deleted view — soft-deleted records are hidden from the
      // normal listing and only surfaced under the Deleted filter.
      const isDeleted = !!c.deleted_at;
      if (recordStatusFilter === "active" && isDeleted) return false;
      if (recordStatusFilter === "deleted" && !isDeleted) return false;

      if (term) {
        const haystack = [c.full_name, c.email, c.phone, c.source_website]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }

      if (websiteFilter !== "All" && c.source_website !== websiteFilter) {
        return false;
      }

      if (dateFilter !== "all" && c.created_at) {
        const created = new Date(c.created_at);
        if (dateFilter === "today" && !isSameDay(created, now)) return false;
        if (dateFilter === "week" && !isThisWeek(created, now)) return false;
        if (dateFilter === "month" && !isThisMonth(created, now)) return false;
        if (dateFilter === "year" && !isThisYear(created, now)) return false;
        if (dateFilter === "lastyear" && !isLastYear(created, now)) return false;
        if (dateFilter === "custom") {
          if (customStartDate && created < new Date(customStartDate)) return false;
          if (customEndDate) {
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999);
            if (created > end) return false;
          }
        }
      }

      return true;
    });
  }, [customers, searchTerm, websiteFilter, dateFilter, customStartDate, customEndDate, recordStatusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / PAGE_SIZE));
  const paginatedCustomers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredCustomers.slice(start, start + PAGE_SIZE);
  }, [filteredCustomers, page]);

  const hasActiveFilters =
    !!searchTerm ||
    websiteFilter !== "All" ||
    dateFilter !== "all" ||
    !!customStartDate ||
    !!customEndDate;

  const clearFilters = () => {
    setSearchTerm("");
    setWebsiteFilter("All");
    setDateFilter("all");
    setCustomStartDate("");
    setCustomEndDate("");
  };

  // Opens the configured Google Sheet in a new tab. Never navigates away
  // from the admin panel; shows a toast instead of crashing if no URL
  // has been configured.
  const openGoogleSheet = () => {
    if (!GOOGLE_SHEET_URL) {
      toast.error("Google Sheet is not configured.");
      return;
    }
    window.open(GOOGLE_SHEET_URL, "_blank", "noopener,noreferrer");
  };

  // Exports exactly what's currently filtered/searched (not just the current
  // page), so "Export CSV" always matches what the admin is looking at.
  const handleExportCsv = () => {
    if (!filteredCustomers.length) {
      toast.error("No records to export.");
      return;
    }
    exportRowsAsCsv("crm", filteredCustomers, [
      { label: "Customer Name", value: (c) => c.full_name },
      { label: "Email", value: (c) => c.email },
      { label: "Phone", value: (c) => c.phone },
      { label: "Status", value: (c) => getDisplayStatus(c.lifecycle_stage) },
      { label: "Source", value: (c) => c.source_website },
      { label: "Assigned To", value: (c) => c.assigned_to },
      { label: "Created At", value: (c) => (c.created_at ? new Date(c.created_at).toLocaleString() : "") },
      { label: "Updated At", value: (c) => (c.updated_at ? new Date(c.updated_at).toLocaleString() : "") },
    ]);
  };

  const openViewDialog = async (customer: Customer) => {
    setViewCustomer(customer);
    setOrders([]);
    setInvoices([]);
    setLoadingRelated(true);
    try {
      const [ordersRes, invoicesRes] = await Promise.all([
        supabase.from("orders").select("*").eq("customer_id", customer.id),
        supabase.from("invoices").select("*").eq("customer_id", customer.id),
      ]);
      if (!ordersRes.error && ordersRes.data) setOrders(ordersRes.data as RelatedRecord[]);
      if (!invoicesRes.error && invoicesRes.data) setInvoices(invoicesRes.data as RelatedRecord[]);
    } catch (err) {
      // Orders/invoices tables may not exist in every deployment — fail quietly, they're optional.
      console.warn("Orders/invoices lookup skipped:", err);
    } finally {
      setLoadingRelated(false);
    }
  };

  const closeViewDialog = () => {
    setViewCustomer(null);
    setOrders([]);
    setInvoices([]);
  };

  // Soft delete: marks deleted_at instead of removing the row.
  const handleSoftDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("customers")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", deleteTarget.id);
      if (error) throw error;

      toast.success("CRM record deleted", {
        description: `${deleteTarget.full_name} was moved to Deleted. You can restore it anytime.`,
      });
      setDeleteTarget(null);
      await refetchCustomers();
    } catch (err) {
      console.error("Failed to soft delete customer", err);
      toast.error("Couldn't delete this record", {
        description: "Please try again.",
      });
    } finally {
      setDeleting(false);
    }
  };

  // Restore: clears deleted_at, moving the record back to Active.
  const handleRestore = async (customer: Customer) => {
    setRestoringId(customer.id);
    try {
      const { error } = await supabase
        .from("customers")
        .update({ deleted_at: null })
        .eq("id", customer.id);
      if (error) throw error;

      toast.success("CRM record restored", {
        description: `${customer.full_name} is active again.`,
      });
      await refetchCustomers();
    } catch (err) {
      console.error("Failed to restore customer", err);
      toast.error("Couldn't restore this record", {
        description: "Please try again.",
      });
    } finally {
      setRestoringId(null);
    }
  };

  // Permanent delete: real row removal. Only reachable from the Deleted filter.
  const handlePermanentDelete = async () => {
    if (!permanentDeleteTarget) return;
    setPermanentDeleting(true);
    try {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", permanentDeleteTarget.id);
      if (error) throw error;

      toast.success("CRM record permanently deleted", {
        description: `${permanentDeleteTarget.full_name} was permanently removed.`,
      });
      setPermanentDeleteTarget(null);
      await refetchCustomers();
    } catch (err) {
      console.error("Failed to permanently delete customer", err);
      toast.error("Couldn't permanently delete this record", {
        description: "Please try again.",
      });
    } finally {
      setPermanentDeleting(false);
    }
  };

  return (
    <AdminPage
      title="CRM"
      description="Customer lifecycle across all properties."
      loading={loading}
      empty={!loading && !customers.length}
    >
      <div className="space-y-4">
        {/* Search + Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, email, phone, website..."
              className="pl-8"
            />
          </div>

          <Select value={websiteFilter} onValueChange={setWebsiteFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Website" />
            </SelectTrigger>
            <SelectContent>
              {WEBSITE_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Time Filter" />
            </SelectTrigger>
            <SelectContent>
              {DATE_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {dateFilter === "custom" && (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full sm:w-[150px]"
                aria-label="Custom range start date"
              />
              <span className="text-sm text-muted-foreground">to</span>
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full sm:w-[150px]"
                aria-label="Custom range end date"
              />
            </div>
          )}

          <Select
            value={recordStatusFilter}
            onValueChange={(v) => setRecordStatusFilter(v as "active" | "deleted")}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Record Status" />
            </SelectTrigger>
            <SelectContent>
              {RECORD_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}

          <div className="flex items-center gap-2 sm:ml-auto">
            <Button variant="outline" size="sm" onClick={openGoogleSheet}>
              <FileSpreadsheet className="h-4 w-4 mr-1.5" />
              Open Google Sheet
            </Button>

            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <Download className="h-4 w-4 mr-1.5" />
              Export CSV
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {filteredCustomers.length} customer{filteredCustomers.length === 1 ? "" : "s"} found
          {recordStatusFilter === "deleted" ? " · viewing deleted" : ""}
          {refreshing ? " · refreshing…" : ""}
        </p>

        {/* Customer list */}
        <div className="space-y-2">
          {paginatedCustomers.map((c) => (
            <div
              key={c.id}
              className="border border-border rounded-lg p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold truncate">{c.full_name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {c.email || "—"} · {c.phone || "—"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                {c.source_website && <Badge variant="secondary">{c.source_website}</Badge>}
                <Badge
                  variant="outline"
                  className={cn("font-medium", getLifecycleBadgeClass(c.lifecycle_stage))}
                >
                  {getDisplayStatus(c.lifecycle_stage)}
                </Badge>

                <div className="flex items-center gap-1 sm:ml-2">
                  {recordStatusFilter === "active" ? (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => openViewDialog(c)}
                        aria-label={`View ${c.full_name}`}
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteTarget(c)}
                        aria-label={`Delete ${c.full_name}`}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1.5"
                        onClick={() => handleRestore(c)}
                        disabled={restoringId === c.id}
                        aria-label={`Restore ${c.full_name}`}
                        title="Restore"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        {restoringId === c.id ? "Restoring…" : "Restore"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setPermanentDeleteTarget(c)}
                        aria-label={`Permanently delete ${c.full_name}`}
                        title="Permanently Delete"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Permanently Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {!loading && !paginatedCustomers.length && (
            <p className="text-sm text-muted-foreground text-center py-8">
              {recordStatusFilter === "deleted"
                ? "No deleted records."
                : "No customers match your search or filters."}
            </p>
          )}
        </div>

        {/* Pagination */}
        {filteredCustomers.length > 0 && (
          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredCustomers.length)} of{" "}
              {filteredCustomers.length}
            </p>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <p className="text-sm text-muted-foreground whitespace-nowrap">
                Page {page} of {totalPages}
              </p>
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

      {/* View Dialog (read-only — Lead Status can no longer be edited here) */}
      <Dialog open={!!viewCustomer} onOpenChange={(open) => !open && closeViewDialog()}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          {viewCustomer && (
            <>
              <DialogHeader>
                <DialogTitle>{viewCustomer.full_name}</DialogTitle>
                <DialogDescription>Customer details</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium break-all">{viewCustomer.email || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{viewCustomer.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Website</p>
                    <p className="font-medium">{viewCustomer.source_website || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">
                      {viewCustomer.created_at
                        ? new Date(viewCustomer.created_at).toLocaleString()
                        : "—"}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Lead Status</Label>
                  <div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-medium pointer-events-none",
                        getLifecycleBadgeClass(viewCustomer.lifecycle_stage)
                      )}
                    >
                      {getDisplayStatus(viewCustomer.lifecycle_stage)}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-1.5">Orders</p>
                  {loadingRelated ? (
                    <p className="text-sm text-muted-foreground">Loading…</p>
                  ) : orders.length ? (
                    <div className="space-y-1.5">
                      {orders.map((o) => (
                        <div
                          key={o.id}
                          className="text-sm border border-border rounded-md px-3 py-2 flex justify-between"
                        >
                          <span>{o.id}</span>
                          <span className="text-muted-foreground">
                            {o.status || "—"} {o.total ? `· ${o.total}` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No orders available.</p>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold mb-1.5">Invoices</p>
                  {loadingRelated ? (
                    <p className="text-sm text-muted-foreground">Loading…</p>
                  ) : invoices.length ? (
                    <div className="space-y-1.5">
                      {invoices.map((inv) => (
                        <div
                          key={inv.id}
                          className="text-sm border border-border rounded-md px-3 py-2 flex justify-between"
                        >
                          <span>{inv.id}</span>
                          <span className="text-muted-foreground">
                            {inv.status || "—"} {inv.amount ? `· ${inv.amount}` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No invoices available.</p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={closeViewDialog}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Soft delete confirmation (Active view) */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete CRM Record?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this CRM record?
              <br />
              This action can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSoftDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permanent delete confirmation (Deleted view only) */}
      <AlertDialog
        open={!!permanentDeleteTarget}
        onOpenChange={(open) => !open && setPermanentDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium">{permanentDeleteTarget?.full_name}</span> from your
              CRM. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={permanentDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePermanentDelete} disabled={permanentDeleting}>
              {permanentDeleting ? "Deleting…" : "Permanently Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPage>
  );
}


