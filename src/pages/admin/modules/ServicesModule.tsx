// // import { useState } from "react";
// // import { supabase } from "@/integrations/supabase/client";
// // import { AdminPage } from "@/components/admin/AdminPage";
// // import { useAdminTable } from "@/hooks/useAdminData";
// // import { existingServicePages } from "@/data/servicePages";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { Textarea } from "@/components/ui/textarea";
// // import { Badge } from "@/components/ui/badge";
// // import { Switch } from "@/components/ui/switch";
// // import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// // import { toast } from "sonner";
// // import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";

// // type Service = {
// //   id: string;
// //   title: string;
// //   description: string | null;
// //   category: string | null;
// //   price: number;
// //   gst_rate: number;
// //   hsn_sac_code: string | null;
// //   is_active: boolean;
// // };

// // const blank = { title: "", description: "", category: "", price: 0, gst_rate: 18, hsn_sac_code: "", is_active: true };

// // export default function ServicesModule() {
// //   const { rows: services, loading, reload } = useAdminTable<Service>("services");
// //   const [open, setOpen] = useState(false);
// //   const [editing, setEditing] = useState<Service | null>(null);
// //   const [form, setForm] = useState(blank);
// //   const [saving, setSaving] = useState(false);

// //   const missingPageServices = existingServicePages.filter(
// //     (page) => !services.some((service) => service.title === page.title)
// //   );

// //   const save = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     setSaving(true);
// //     const payload = { ...form, price: Number(form.price), gst_rate: Number(form.gst_rate) };
// //     const { error } = editing
// //       ? await supabase.from("services").update(payload).eq("id", editing.id)
// //       : await supabase.from("services").insert(payload);
// //     setSaving(false);
// //     if (error) toast.error(error.message);
// //     else { toast.success("Saved"); setOpen(false); reload(); }
// //   };

// //   const addPageService = async (page: typeof existingServicePages[number]) => {
// //     const payload = {
// //       title: page.title,
// //       description: page.description,
// //       category: page.category,
// //       price: page.price,
// //       gst_rate: page.gst_rate,
// //       hsn_sac_code: null,
// //       is_active: true,
// //     };

// //     const { error } = await supabase.from("services").insert(payload);
// //     if (error) {
// //       toast.error(error.message);
// //     } else {
// //       toast.success(`Added ${page.title}`);
// //       reload();
// //     }
// //   };

// //   return (
// //     <AdminPage
// //       title="Service Catalog"
// //       description="Manage the live site services currently available to customers. For landing pages, packages, and publish workflow, use Pages & Packages."
// //       loading={loading}
// //       empty={!services.length && !missingPageServices.length}
// //       emptyMessage='No services. Click "New Service" to add.'
// //       actions={
// //         <Dialog open={open} onOpenChange={setOpen}>
// //           <DialogTrigger asChild>
// //             <Button onClick={() => { setEditing(null); setForm(blank); }}><Plus className="w-4 h-4 mr-2" />New</Button>
// //           </DialogTrigger>
// //           <DialogContent>
// //             <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} Service</DialogTitle></DialogHeader>
// //             <form onSubmit={save} className="space-y-3">
// //               <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
// //               <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
// //               <div className="grid grid-cols-2 gap-2">
// //                 <div><Label>Price</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
// //                 <div><Label>GST %</Label><Input type="number" value={form.gst_rate} onChange={(e) => setForm({ ...form, gst_rate: Number(e.target.value) })} /></div>
// //               </div>
// //               <DialogFooter><Button type="submit" disabled={saving}>Save</Button></DialogFooter>
// //             </form>
// //           </DialogContent>
// //         </Dialog>
// //       }
// //     >
// //       {missingPageServices.length > 0 && (
// //         <div className="border border-border rounded-2xl p-4 mb-4 bg-muted/70">
// //           <div className="mb-3 flex items-center justify-between gap-4">
// //             <div>
// //               <p className="font-semibold">Detected existing service pages</p>
// //               <p className="text-sm text-muted-foreground">These pages already exist in the app but are not yet in the live service catalog.</p>
// //             </div>
// //           </div>
// //           <div className="grid gap-3">
// //             {missingPageServices.map((page) => (
// //               <div key={page.route} className="rounded-xl border border-border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
// //                 <div>
// //                   <p className="font-semibold">{page.title}</p>
// //                   <p className="text-sm text-muted-foreground">{page.category} · ₹{page.price.toLocaleString()} · {page.gst_rate}% GST</p>
// //                 </div>
// //                 <Button size="sm" onClick={() => addPageService(page)}>Add to Catalog</Button>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       )}

// //       <div className="space-y-2">
// //         {services.map((s) => (
// //           <div key={s.id} className="border border-border rounded-lg p-4 flex justify-between gap-3">
// //             <div>
// //               <p className="font-semibold">{s.title} {!s.is_active && <Badge variant="secondary">Off</Badge>}</p>
// //               <p className="text-sm text-muted-foreground">{s.category} · GST {s.gst_rate}%</p>
// //             </div>
// //             <div className="flex items-center gap-2">
// //               <span className="font-semibold">₹{Number(s.price).toLocaleString()}</span>
// //               <Button size="icon" variant="outline" onClick={() => { setEditing(s); setForm({ ...s, description: s.description || "", category: s.category || "", hsn_sac_code: s.hsn_sac_code || "" }); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
// //               <Button size="icon" variant="outline" onClick={async () => { if (confirm("Delete?")) { await supabase.from("services").delete().eq("id", s.id); reload(); } }}><Trash2 className="w-4 h-4" /></Button>
// //             </div>
// //           </div>
// //         ))}
// //       </div>
// //     </AdminPage>
// //   );
// // }

// import { useMemo, useState } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import { AdminPage } from "@/components/admin/AdminPage";
// import { useAdminTable } from "@/hooks/useAdminData";
// import { existingServicePages } from "@/data/servicePages";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import { Switch } from "@/components/ui/switch";
// import { Card, CardContent } from "@/components/ui/card";
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
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
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
// import {
//   Loader2,
//   Plus,
//   Pencil,
//   Trash2,
//   Eye,
//   Copy,
//   Search,
//   ChevronLeft,
//   ChevronRight,
//   ListChecks,
//   CheckCircle2,
//   XCircle,
//   PackageSearch,
// } from "lucide-react";

// // ------------------------------------------------------------------
// // Types — matches the real `services` table exactly. No new columns.
// // ------------------------------------------------------------------

// type Service = {
//   id: string;
//   title: string;
//   description: string | null;
//   category: string | null;
//   price: number;
//   gst_rate: number;
//   hsn_sac_code: string | null;
//   is_active: boolean;
//   min_persons: number | null;
//   max_persons: number | null;
//   created_at: string;
//   updated_at: string;
// };

// type ServiceForm = {
//   title: string;
//   description: string;
//   category: string;
//   price: string;
//   gst_rate: string;
//   hsn_sac_code: string;
//   is_active: boolean;
//   min_persons: string;
//   max_persons: string;
// };

// type StatusFilter = "all" | "active" | "inactive";

// const PAGE_SIZE = 10;

// const blankForm: ServiceForm = {
//   title: "",
//   description: "",
//   category: "",
//   price: "",
//   gst_rate: "18",
//   hsn_sac_code: "",
//   is_active: true,
//   min_persons: "",
//   max_persons: "",
// };

// // ------------------------------------------------------------------
// // Helpers
// // ------------------------------------------------------------------

// function normalize(value: unknown): string {
//   return String(value ?? "").trim().toLowerCase();
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

// function formatINRLocal(value: number): string {
//   if (Number.isNaN(value)) return "—";
//   return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
// }

// function finalPrice(price: number, gstRate: number): number {
//   const p = Number(price) || 0;
//   const g = Number(gstRate) || 0;
//   return p + (p * g) / 100;
// }

// function serviceToForm(s: Service): ServiceForm {
//   return {
//     title: s.title,
//     description: s.description || "",
//     category: s.category || "",
//     price: String(s.price ?? ""),
//     gst_rate: String(s.gst_rate ?? "18"),
//     hsn_sac_code: s.hsn_sac_code || "",
//     is_active: s.is_active,
//     min_persons: s.min_persons != null ? String(s.min_persons) : "",
//     max_persons: s.max_persons != null ? String(s.max_persons) : "",
//   };
// }

// // Validates the form and returns a map of field -> error message.
// // Empty object means the form is valid.
// function validateForm(form: ServiceForm): Record<string, string> {
//   const errors: Record<string, string> = {};

//   if (!form.title.trim()) {
//     errors.title = "Service name is required.";
//   }

//   const price = Number(form.price);
//   if (form.price.trim() === "" || Number.isNaN(price) || price < 0) {
//     errors.price = "Enter a valid price (0 or more).";
//   }

//   const gst = Number(form.gst_rate);
//   if (form.gst_rate.trim() === "" || Number.isNaN(gst) || gst < 0 || gst > 100) {
//     errors.gst_rate = "GST must be between 0 and 100.";
//   }

//   if (form.min_persons.trim() !== "") {
//     const min = Number(form.min_persons);
//     if (Number.isNaN(min) || min < 0) errors.min_persons = "Min persons must be 0 or more.";
//   }

//   if (form.max_persons.trim() !== "") {
//     const max = Number(form.max_persons);
//     if (Number.isNaN(max) || max < 0) errors.max_persons = "Max persons must be 0 or more.";
//   }

//   if (form.min_persons.trim() !== "" && form.max_persons.trim() !== "") {
//     const min = Number(form.min_persons);
//     const max = Number(form.max_persons);
//     if (!Number.isNaN(min) && !Number.isNaN(max) && max < min) {
//       errors.max_persons = "Max persons can't be less than min persons.";
//     }
//   }

//   return errors;
// }

// function formToPayload(form: ServiceForm) {
//   return {
//     title: form.title.trim(),
//     description: form.description.trim() || null,
//     category: form.category.trim() || null,
//     price: Number(form.price),
//     gst_rate: Number(form.gst_rate),
//     hsn_sac_code: form.hsn_sac_code.trim() || null,
//     is_active: form.is_active,
//     min_persons: form.min_persons.trim() !== "" ? Number(form.min_persons) : null,
//     max_persons: form.max_persons.trim() !== "" ? Number(form.max_persons) : null,
//   };
// }

// // ------------------------------------------------------------------
// // Component
// // ------------------------------------------------------------------

// export default function ServicesModule() {
//   const { rows, loading, reload } = useAdminTable<Service>("services");
//   const services = rows;

//   // Create / Edit dialog state
//   const [open, setOpen] = useState(false);
//   const [editing, setEditing] = useState<Service | null>(null);
//   const [form, setForm] = useState<ServiceForm>(blankForm);
//   const [formErrors, setFormErrors] = useState<Record<string, string>>({});
//   const [saving, setSaving] = useState(false);

//   // View dialog state
//   const [viewing, setViewing] = useState<Service | null>(null);

//   // Delete confirmation state
//   const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
//   const [deleting, setDeleting] = useState(false);

//   // Duplicate-in-progress state (per row)
//   const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

//   // Add-to-catalog-in-progress state (per detected page)
//   const [addingRoute, setAddingRoute] = useState<string | null>(null);

//   // Search / filters / pagination
//   const [search, setSearch] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState<string>("all");
//   const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
//   const [currentPage, setCurrentPage] = useState(1);

//   const categories = useMemo(() => {
//     const set = new Set<string>();
//     for (const s of services) {
//       if (s.category && s.category.trim()) set.add(s.category.trim());
//     }
//     return Array.from(set).sort((a, b) => a.localeCompare(b));
//   }, [services]);

//   const stats = useMemo(() => {
//     const total = services.length;
//     const active = services.filter((s) => s.is_active).length;
//     const inactive = total - active;
//     return { total, active, inactive };
//   }, [services]);

//   // Detected existing service pages not yet in the catalog — trim + lowercase
//   // comparison so "Kundali " and "kundali" aren't both offered/added.
//   const missingPageServices = useMemo(() => {
//     return existingServicePages.filter(
//       (page) => !services.some((service) => normalize(service.title) === normalize(page.title)),
//     );
//   }, [services]);

//   const filteredRows = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     return services.filter((s) => {
//       if (q) {
//         const haystack = `${s.title} ${s.category ?? ""}`.toLowerCase();
//         if (!haystack.includes(q)) return false;
//       }
//       if (categoryFilter !== "all" && normalize(s.category) !== normalize(categoryFilter)) {
//         return false;
//       }
//       if (statusFilter === "active" && !s.is_active) return false;
//       if (statusFilter === "inactive" && s.is_active) return false;
//       return true;
//     });
//   }, [services, search, categoryFilter, statusFilter]);

//   const sortedRows = useMemo(() => {
//     return [...filteredRows].sort((a, b) => {
//       const dateA = new Date(a.updated_at ?? a.created_at ?? 0).getTime();
//       const dateB = new Date(b.updated_at ?? b.created_at ?? 0).getTime();
//       return dateB - dateA;
//     });
//   }, [filteredRows]);

//   const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
//   const safePage = Math.min(currentPage, totalPages);

//   const paginatedRows = useMemo(() => {
//     const start = (safePage - 1) * PAGE_SIZE;
//     return sortedRows.slice(start, start + PAGE_SIZE);
//   }, [sortedRows, safePage]);

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
//   const onCategoryChange = (value: string) => {
//     setCategoryFilter(value);
//     setCurrentPage(1);
//   };
//   const onStatusChange = (value: StatusFilter) => {
//     setStatusFilter(value);
//     setCurrentPage(1);
//   };

//   const openCreate = () => {
//     setEditing(null);
//     setForm(blankForm);
//     setFormErrors({});
//     setOpen(true);
//   };

//   const openEdit = (s: Service) => {
//     setEditing(s);
//     setForm(serviceToForm(s));
//     setFormErrors({});
//     setOpen(true);
//   };

//   const save = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const errors = validateForm(form);
//     setFormErrors(errors);
//     if (Object.keys(errors).length > 0) {
//       toast.error("Please fix the highlighted fields.");
//       return;
//     }

//     setSaving(true);
//     const payload = formToPayload(form);
//     const { error } = editing
//       ? await supabase.from("services").update(payload).eq("id", editing.id)
//       : await supabase.from("services").insert(payload);
//     setSaving(false);

//     if (error) {
//       toast.error(error.message);
//     } else {
//       toast.success(editing ? "Service updated" : "Service created");
//       setOpen(false);
//       reload();
//     }
//   };

//   const confirmDelete = async () => {
//     if (!deleteTarget) return;
//     setDeleting(true);
//     const { error } = await supabase.from("services").delete().eq("id", deleteTarget.id);
//     setDeleting(false);
//     if (error) {
//       toast.error(error.message);
//     } else {
//       toast.success(`"${deleteTarget.title}" deleted`);
//       setDeleteTarget(null);
//       reload();
//     }
//   };

//   const duplicateService = async (s: Service) => {
//     setDuplicatingId(s.id);
//     // New copies are created inactive by default so a duplicate never goes
//     // live in the catalog by accident — the admin flips it active once ready.
//     const payload = {
//       title: `${s.title} (Copy)`,
//       description: s.description,
//       category: s.category,
//       price: s.price,
//       gst_rate: s.gst_rate,
//       hsn_sac_code: s.hsn_sac_code,
//       is_active: false,
//       min_persons: s.min_persons,
//       max_persons: s.max_persons,
//     };
//     const { error } = await supabase.from("services").insert(payload);
//     setDuplicatingId(null);
//     if (error) {
//       toast.error(error.message);
//     } else {
//       toast.success(`Duplicated "${s.title}"`);
//       reload();
//     }
//   };

//   const addPageService = async (page: (typeof existingServicePages)[number]) => {
//     // Guard against a double-click / race adding the same page twice.
//     if (services.some((service) => normalize(service.title) === normalize(page.title))) {
//       toast.error(`"${page.title}" is already in the catalog`);
//       return;
//     }

//     setAddingRoute(page.route);
//     const payload = {
//       title: page.title,
//       description: page.description,
//       category: page.category,
//       price: page.price,
//       gst_rate: page.gst_rate,
//       hsn_sac_code: null,
//       is_active: true,
//     };

//     const { error } = await supabase.from("services").insert(payload);
//     setAddingRoute(null);
//     if (error) {
//       toast.error(error.message);
//     } else {
//       toast.success(`Added "${page.title}" to catalog`);
//       reload();
//     }
//   };

//   return (
//     <AdminPage
//       title="Service Catalog"
//       description="Manage the live site services currently available to customers. For landing pages, SEO, and publish workflow, use Services & Packages."
//       loading={false}
//       empty={false}
//       actions={
//         <Dialog
//           open={open}
//           onOpenChange={(o) => {
//             setOpen(o);
//             if (!o) setFormErrors({});
//           }}
//         >
//           <DialogTrigger asChild>
//             <Button onClick={openCreate}>
//               <Plus className="w-4 h-4 mr-2" />
//               New Service
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="max-h-[85vh] overflow-y-auto">
//             <DialogHeader>
//               <DialogTitle>{editing ? "Edit" : "New"} Service</DialogTitle>
//               <DialogDescription>
//                 {editing ? "Update the details for this service." : "Add a new service to the catalog."}
//               </DialogDescription>
//             </DialogHeader>
//             <form onSubmit={save} className="space-y-3">
//               <div className="space-y-1.5">
//                 <Label htmlFor="svc-title">Service Name</Label>
//                 <Input
//                   id="svc-title"
//                   value={form.title}
//                   onChange={(e) => setForm({ ...form, title: e.target.value })}
//                 />
//                 {formErrors.title && <p className="text-xs text-destructive">{formErrors.title}</p>}
//               </div>

//               <div className="space-y-1.5">
//                 <Label htmlFor="svc-category">Category</Label>
//                 <Input
//                   id="svc-category"
//                   value={form.category}
//                   onChange={(e) => setForm({ ...form, category: e.target.value })}
//                   placeholder="e.g. Consultation"
//                 />
//               </div>

//               <div className="space-y-1.5">
//                 <Label htmlFor="svc-description">Description</Label>
//                 <Textarea
//                   id="svc-description"
//                   value={form.description}
//                   onChange={(e) => setForm({ ...form, description: e.target.value })}
//                   rows={3}
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1.5">
//                   <Label htmlFor="svc-price">Price (₹)</Label>
//                   <Input
//                     id="svc-price"
//                     type="number"
//                     step="0.01"
//                     value={form.price}
//                     onChange={(e) => setForm({ ...form, price: e.target.value })}
//                   />
//                   {formErrors.price && <p className="text-xs text-destructive">{formErrors.price}</p>}
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label htmlFor="svc-gst">GST %</Label>
//                   <Input
//                     id="svc-gst"
//                     type="number"
//                     step="0.01"
//                     value={form.gst_rate}
//                     onChange={(e) => setForm({ ...form, gst_rate: e.target.value })}
//                   />
//                   {formErrors.gst_rate && <p className="text-xs text-destructive">{formErrors.gst_rate}</p>}
//                 </div>
//               </div>

//               <div className="space-y-1.5">
//                 <Label htmlFor="svc-hsn">HSN/SAC Code</Label>
//                 <Input
//                   id="svc-hsn"
//                   value={form.hsn_sac_code}
//                   onChange={(e) => setForm({ ...form, hsn_sac_code: e.target.value })}
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1.5">
//                   <Label htmlFor="svc-min">Min Persons</Label>
//                   <Input
//                     id="svc-min"
//                     type="number"
//                     value={form.min_persons}
//                     onChange={(e) => setForm({ ...form, min_persons: e.target.value })}
//                   />
//                   {formErrors.min_persons && (
//                     <p className="text-xs text-destructive">{formErrors.min_persons}</p>
//                   )}
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label htmlFor="svc-max">Max Persons</Label>
//                   <Input
//                     id="svc-max"
//                     type="number"
//                     value={form.max_persons}
//                     onChange={(e) => setForm({ ...form, max_persons: e.target.value })}
//                   />
//                   {formErrors.max_persons && (
//                     <p className="text-xs text-destructive">{formErrors.max_persons}</p>
//                   )}
//                 </div>
//               </div>

//               <div className="flex items-center gap-2">
//                 <Switch
//                   checked={form.is_active}
//                   onCheckedChange={(v) => setForm({ ...form, is_active: v })}
//                 />
//                 <Label>Active (visible to customers)</Label>
//               </div>

//               <DialogFooter>
//                 <Button type="submit" disabled={saving}>
//                   {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
//                   Save
//                 </Button>
//               </DialogFooter>
//             </form>
//           </DialogContent>
//         </Dialog>
//       }
//     >
//       {/* Stat cards — reflect the real two-state model (is_active only) */}
//       <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-3">
//         <Card>
//           <CardContent className="p-4 flex items-center justify-between">
//             <div>
//               <p className="text-xs text-muted-foreground">Total Services</p>
//               <p className="text-2xl font-semibold">{stats.total}</p>
//             </div>
//             <ListChecks className="w-5 h-5 text-muted-foreground" />
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4 flex items-center justify-between">
//             <div>
//               <p className="text-xs text-muted-foreground">Active</p>
//               <p className="text-2xl font-semibold text-green-600">{stats.active}</p>
//             </div>
//             <CheckCircle2 className="w-5 h-5 text-green-500" />
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4 flex items-center justify-between">
//             <div>
//               <p className="text-xs text-muted-foreground">Inactive</p>
//               <p className="text-2xl font-semibold text-muted-foreground">{stats.inactive}</p>
//             </div>
//             <XCircle className="w-5 h-5 text-muted-foreground" />
//           </CardContent>
//         </Card>
//       </div>

//       {/* Detected existing service pages */}
//       {missingPageServices.length > 0 && (
//         <div className="border border-border rounded-2xl p-4 mb-6 bg-muted/70">
//           <div className="mb-3">
//             <p className="font-semibold">Detected existing service pages</p>
//             <p className="text-sm text-muted-foreground">
//               These pages already exist in the app but are not yet in the live service catalog.
//             </p>
//           </div>
//           <div className="grid gap-3">
//             {missingPageServices.map((page) => (
//               <div
//                 key={page.route}
//                 className="rounded-xl border border-border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-background"
//               >
//                 <div>
//                   <p className="font-semibold">{page.title}</p>
//                   <p className="text-sm text-muted-foreground">
//                     {page.category} · {formatINRLocal(page.price)} · {page.gst_rate}% GST
//                   </p>
//                 </div>
//                 <Button
//                   size="sm"
//                   disabled={addingRoute === page.route}
//                   onClick={() => addPageService(page)}
//                 >
//                   {addingRoute === page.route ? (
//                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                   ) : (
//                     <Plus className="w-4 h-4 mr-2" />
//                   )}
//                   Add to Catalog
//                 </Button>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       <Card>
//         <CardContent className="p-4">
//           {/* Filters toolbar */}
//           <div className="flex flex-col gap-3 mb-4 md:flex-row md:flex-wrap md:items-end">
//             <div className="flex-1 min-w-[220px] space-y-2">
//               <Label htmlFor="svc-search">Search</Label>
//               <div className="relative">
//                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
//                 <Input
//                   id="svc-search"
//                   value={search}
//                   onChange={(e) => onSearchChange(e.target.value)}
//                   placeholder="Service name or category…"
//                   className="pl-9"
//                 />
//               </div>
//             </div>

//             <div className="w-full md:w-48 space-y-2">
//               <Label>Category</Label>
//               <Select value={categoryFilter} onValueChange={onCategoryChange}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="All Categories" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Categories</SelectItem>
//                   {categories.map((c) => (
//                     <SelectItem key={c} value={c}>
//                       {c}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="w-full md:w-44 space-y-2">
//               <Label>Status</Label>
//               <Select value={statusFilter} onValueChange={(v) => onStatusChange(v as StatusFilter)}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="All" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All</SelectItem>
//                   <SelectItem value="active">Active</SelectItem>
//                   <SelectItem value="inactive">Inactive</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             {(search || categoryFilter !== "all" || statusFilter !== "all") && (
//               <Button
//                 type="button"
//                 variant="ghost"
//                 onClick={() => {
//                   setSearch("");
//                   setCategoryFilter("all");
//                   setStatusFilter("all");
//                   setCurrentPage(1);
//                 }}
//               >
//                 Clear filters
//               </Button>
//             )}
//           </div>

//           {/* Loading skeleton */}
//           {loading ? (
//             <div className="space-y-2">
//               {Array.from({ length: 5 }).map((_, i) => (
//                 <Skeleton key={i} className="h-14 w-full rounded-lg" />
//               ))}
//             </div>
//           ) : sortedRows.length === 0 ? (
//             <div className="flex flex-col items-center justify-center gap-2 py-14 text-center border border-dashed border-border rounded-lg">
//               <PackageSearch className="w-8 h-8 text-muted-foreground" />
//               <p className="text-muted-foreground text-sm font-medium">No Services Found</p>
//               <p className="text-muted-foreground text-xs">
//                 {services.length === 0
//                   ? 'Click "New Service" to add your first service.'
//                   : "Try adjusting your search or filters."}
//               </p>
//             </div>
//           ) : (
//             <>
//               {/* Desktop table */}
//               <div className="hidden md:block overflow-x-auto rounded-lg border border-border">
//                 <table className="w-full text-sm">
//                   <thead>
//                     <tr className="bg-muted/50 text-left text-muted-foreground">
//                       <th className="px-4 py-2 font-medium">Service Name</th>
//                       <th className="px-4 py-2 font-medium">Category</th>
//                       <th className="px-4 py-2 font-medium">Base Price</th>
//                       <th className="px-4 py-2 font-medium">GST</th>
//                       <th className="px-4 py-2 font-medium">Final Price</th>
//                       <th className="px-4 py-2 font-medium">Status</th>
//                       <th className="px-4 py-2 font-medium">Updated</th>
//                       <th className="px-4 py-2 font-medium text-right">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {paginatedRows.map((s) => (
//                       <tr
//                         key={s.id}
//                         onClick={() => setViewing(s)}
//                         className="border-t border-border hover:bg-muted/40 cursor-pointer transition-colors"
//                       >
//                         <td className="px-4 py-2 font-medium truncate max-w-[220px]">{s.title}</td>
//                         <td className="px-4 py-2 text-muted-foreground">{safeString(s.category)}</td>
//                         <td className="px-4 py-2 whitespace-nowrap">{formatINRLocal(Number(s.price))}</td>
//                         <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
//                           {Number(s.gst_rate)}%
//                         </td>
//                         <td className="px-4 py-2 whitespace-nowrap font-medium">
//                           {formatINRLocal(finalPrice(s.price, s.gst_rate))}
//                         </td>
//                         <td className="px-4 py-2">
//                           {s.is_active ? (
//                             <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border border-green-200">
//                               Active
//                             </Badge>
//                           ) : (
//                             <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border border-slate-200">
//                               Inactive
//                             </Badge>
//                           )}
//                         </td>
//                         <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
//                           {formatDateTime(s.updated_at)}
//                         </td>
//                         <td className="px-4 py-2 text-right">
//                           <div className="flex items-center justify-end gap-2">
//                             <Button
//                               size="icon"
//                               variant="outline"
//                               title="View"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 setViewing(s);
//                               }}
//                             >
//                               <Eye className="w-4 h-4" />
//                             </Button>
//                             <Button
//                               size="icon"
//                               variant="outline"
//                               title="Edit"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 openEdit(s);
//                               }}
//                             >
//                               <Pencil className="w-4 h-4" />
//                             </Button>
//                             <Button
//                               size="icon"
//                               variant="outline"
//                               title="Duplicate"
//                               disabled={duplicatingId === s.id}
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 duplicateService(s);
//                               }}
//                             >
//                               {duplicatingId === s.id ? (
//                                 <Loader2 className="w-4 h-4 animate-spin" />
//                               ) : (
//                                 <Copy className="w-4 h-4" />
//                               )}
//                             </Button>
//                             <Button
//                               size="icon"
//                               variant="outline"
//                               title="Delete"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 setDeleteTarget(s);
//                               }}
//                             >
//                               <Trash2 className="w-4 h-4" />
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
//                 {paginatedRows.map((s) => (
//                   <div
//                     key={s.id}
//                     onClick={() => setViewing(s)}
//                     className="rounded-lg border border-border p-3 space-y-2 active:bg-muted/40"
//                   >
//                     <div className="flex items-start justify-between gap-2">
//                       <p className="font-medium truncate">{s.title}</p>
//                       {s.is_active ? (
//                         <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border border-green-200">
//                           Active
//                         </Badge>
//                       ) : (
//                         <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border border-slate-200">
//                           Inactive
//                         </Badge>
//                       )}
//                     </div>
//                     <div className="flex items-center justify-between text-xs text-muted-foreground">
//                       <span>{safeString(s.category)}</span>
//                       <span>{formatDateTime(s.updated_at)}</span>
//                     </div>
//                     <div className="flex items-center justify-between text-sm">
//                       <span className="text-muted-foreground">
//                         {formatINRLocal(Number(s.price))} + {Number(s.gst_rate)}% GST
//                       </span>
//                       <span className="font-semibold">{formatINRLocal(finalPrice(s.price, s.gst_rate))}</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         className="flex-1"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setViewing(s);
//                         }}
//                       >
//                         <Eye className="w-3.5 h-3.5 mr-1" />
//                         View
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         className="flex-1"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           openEdit(s);
//                         }}
//                       >
//                         <Pencil className="w-3.5 h-3.5 mr-1" />
//                         Edit
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         className="flex-1"
//                         disabled={duplicatingId === s.id}
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           duplicateService(s);
//                         }}
//                       >
//                         {duplicatingId === s.id ? (
//                           <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
//                         ) : (
//                           <Copy className="w-3.5 h-3.5 mr-1" />
//                         )}
//                         Copy
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         className="flex-1"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setDeleteTarget(s);
//                         }}
//                       >
//                         <Trash2 className="w-3.5 h-3.5 mr-1" />
//                         Delete
//                       </Button>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Pagination — client-side (useAdminTable fetches the full set, no server pagination available) */}
//               <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
//                 <p className="text-xs text-muted-foreground">
//                   Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, sortedRows.length)} of{" "}
//                   {sortedRows.length}
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

//       {/* View dialog */}
//       <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
//         <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Service Details</DialogTitle>
//             <DialogDescription>Full record for this catalog entry.</DialogDescription>
//           </DialogHeader>
//           {viewing && (
//             <div className="space-y-3 text-sm">
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Service Name</span>
//                 <span className="col-span-2 font-medium">{viewing.title}</span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Category</span>
//                 <span className="col-span-2 font-medium">{safeString(viewing.category)}</span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Description</span>
//                 <span className="col-span-2">{safeString(viewing.description)}</span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Base Price</span>
//                 <span className="col-span-2 font-medium">{formatINRLocal(Number(viewing.price))}</span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">GST</span>
//                 <span className="col-span-2 font-medium">{Number(viewing.gst_rate)}%</span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Final Price</span>
//                 <span className="col-span-2 font-semibold">
//                   {formatINRLocal(finalPrice(viewing.price, viewing.gst_rate))}
//                 </span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">HSN/SAC Code</span>
//                 <span className="col-span-2 font-medium">{safeString(viewing.hsn_sac_code)}</span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Min / Max Persons</span>
//                 <span className="col-span-2 font-medium">
//                   {safeString(viewing.min_persons, "—")} / {safeString(viewing.max_persons, "—")}
//                 </span>
//               </div>
//               <div className="grid grid-cols-3 gap-2 items-center">
//                 <span className="text-muted-foreground">Status</span>
//                 <span className="col-span-2">
//                   {viewing.is_active ? (
//                     <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border border-green-200">
//                       Active
//                     </Badge>
//                   ) : (
//                     <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border border-slate-200">
//                       Inactive
//                     </Badge>
//                   )}
//                 </span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Created</span>
//                 <span className="col-span-2 font-medium">{formatDateTime(viewing.created_at)}</span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Updated</span>
//                 <span className="col-span-2 font-medium">{formatDateTime(viewing.updated_at)}</span>
//               </div>

//               <div className="flex items-center gap-2 pt-2">
//                 <Button
//                   className="flex-1"
//                   variant="outline"
//                   onClick={() => {
//                     openEdit(viewing);
//                     setViewing(null);
//                   }}
//                 >
//                   <Pencil className="w-4 h-4 mr-2" />
//                   Edit
//                 </Button>
//                 <Button
//                   className="flex-1"
//                   variant="outline"
//                   disabled={duplicatingId === viewing.id}
//                   onClick={() => duplicateService(viewing)}
//                 >
//                   {duplicatingId === viewing.id ? (
//                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                   ) : (
//                     <Copy className="w-4 h-4 mr-2" />
//                   )}
//                   Duplicate
//                 </Button>
//               </div>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Delete confirmation */}
//       <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete this service?</AlertDialogTitle>
//             <AlertDialogDescription>
//               {deleteTarget && (
//                 <>
//                   This will permanently remove "{deleteTarget.title}" from the catalog. This action cannot
//                   be undone.
//                 </>
//               )}
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={(e) => {
//                 e.preventDefault();
//                 confirmDelete();
//               }}
//               disabled={deleting}
//               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//             >
//               {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </AdminPage>
//   );
// }

// import { useMemo, useState } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import { AdminPage } from "@/components/admin/AdminPage";
// import { useAdminTable } from "@/hooks/useAdminData";
// import { existingServicePages } from "@/data/servicePages";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import { Switch } from "@/components/ui/switch";
// import { Card, CardContent } from "@/components/ui/card";
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
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
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
// import { ConfirmLiveUpdateDialog } from "@/components/admin/ConfirmLiveUpdateDialog";
// import { toast } from "sonner";
// import {
//   Loader2,
//   Plus,
//   Pencil,
//   Trash2,
//   Eye,
//   Copy,
//   Search,
//   ChevronLeft,
//   ChevronRight,
//   ListChecks,
//   CheckCircle2,
//   XCircle,
//   PackageSearch,
// } from "lucide-react";

// // ------------------------------------------------------------------
// // Types — matches the real `services` table exactly. No new columns.
// // ------------------------------------------------------------------

// type Service = {
//   id: string;
//   title: string;
//   description: string | null;
//   category: string | null;
//   price: number;
//   gst_rate: number;
//   hsn_sac_code: string | null;
//   is_active: boolean;
//   min_persons: number | null;
//   max_persons: number | null;
//   created_at: string;
//   updated_at: string;
// };

// type ServiceForm = {
//   title: string;
//   description: string;
//   category: string;
//   price: string;
//   gst_rate: string;
//   hsn_sac_code: string;
//   is_active: boolean;
//   min_persons: string;
//   max_persons: string;
// };

// type StatusFilter = "all" | "active" | "inactive";

// const PAGE_SIZE = 10;

// const blankForm: ServiceForm = {
//   title: "",
//   description: "",
//   category: "",
//   price: "",
//   gst_rate: "18",
//   hsn_sac_code: "",
//   is_active: true,
//   min_persons: "",
//   max_persons: "",
// };

// // ------------------------------------------------------------------
// // Helpers
// // ------------------------------------------------------------------

// function normalize(value: unknown): string {
//   return String(value ?? "").trim().toLowerCase();
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

// function formatINRLocal(value: number): string {
//   if (Number.isNaN(value)) return "—";
//   return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
// }

// function finalPrice(price: number, gstRate: number): number {
//   const p = Number(price) || 0;
//   const g = Number(gstRate) || 0;
//   return p + (p * g) / 100;
// }

// function serviceToForm(s: Service): ServiceForm {
//   return {
//     title: s.title,
//     description: s.description || "",
//     category: s.category || "",
//     price: String(s.price ?? ""),
//     gst_rate: String(s.gst_rate ?? "18"),
//     hsn_sac_code: s.hsn_sac_code || "",
//     is_active: s.is_active,
//     min_persons: s.min_persons != null ? String(s.min_persons) : "",
//     max_persons: s.max_persons != null ? String(s.max_persons) : "",
//   };
// }

// // Validates the form and returns a map of field -> error message.
// // Empty object means the form is valid.
// function validateForm(form: ServiceForm): Record<string, string> {
//   const errors: Record<string, string> = {};

//   if (!form.title.trim()) {
//     errors.title = "Service name is required.";
//   }

//   const price = Number(form.price);
//   if (form.price.trim() === "" || Number.isNaN(price) || price < 0) {
//     errors.price = "Enter a valid price (0 or more).";
//   }

//   const gst = Number(form.gst_rate);
//   if (form.gst_rate.trim() === "" || Number.isNaN(gst) || gst < 0 || gst > 100) {
//     errors.gst_rate = "GST must be between 0 and 100.";
//   }

//   if (form.min_persons.trim() !== "") {
//     const min = Number(form.min_persons);
//     if (Number.isNaN(min) || min < 0) errors.min_persons = "Min persons must be 0 or more.";
//   }

//   if (form.max_persons.trim() !== "") {
//     const max = Number(form.max_persons);
//     if (Number.isNaN(max) || max < 0) errors.max_persons = "Max persons must be 0 or more.";
//   }

//   if (form.min_persons.trim() !== "" && form.max_persons.trim() !== "") {
//     const min = Number(form.min_persons);
//     const max = Number(form.max_persons);
//     if (!Number.isNaN(min) && !Number.isNaN(max) && max < min) {
//       errors.max_persons = "Max persons can't be less than min persons.";
//     }
//   }

//   return errors;
// }

// function formToPayload(form: ServiceForm) {
//   return {
//     title: form.title.trim(),
//     description: form.description.trim() || null,
//     category: form.category.trim() || null,
//     price: Number(form.price),
//     gst_rate: Number(form.gst_rate),
//     hsn_sac_code: form.hsn_sac_code.trim() || null,
//     is_active: form.is_active,
//     min_persons: form.min_persons.trim() !== "" ? Number(form.min_persons) : null,
//     max_persons: form.max_persons.trim() !== "" ? Number(form.max_persons) : null,
//   };
// }

// // ------------------------------------------------------------------
// // Component
// // ------------------------------------------------------------------

// export default function ServicesModule() {
//   const { rows, loading, reload } = useAdminTable<Service>("services");
//   const services = rows;

//   // Create / Edit dialog state
//   const [open, setOpen] = useState(false);
//   const [editing, setEditing] = useState<Service | null>(null);
//   const [form, setForm] = useState<ServiceForm>(blankForm);
//   const [formErrors, setFormErrors] = useState<Record<string, string>>({});
//   const [saving, setSaving] = useState(false);

//   // Live-update confirmation for Create/Edit save (shown after validation passes)
//   const [showSaveConfirm, setShowSaveConfirm] = useState(false);

//   // View dialog state
//   const [viewing, setViewing] = useState<Service | null>(null);

//   // Delete confirmation state
//   const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
//   const [deleting, setDeleting] = useState(false);

//   // Duplicate-in-progress state (per row) — duplicates are created inactive,
//   // so they never go live immediately and do not need a confirmation gate.
//   const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

//   // Add-to-catalog: confirmation target + in-progress state (per detected page).
//   // Adding a detected page creates an ACTIVE service, so it goes live
//   // immediately and requires confirmation like Create Service does.
//   const [addConfirmTarget, setAddConfirmTarget] = useState<(typeof existingServicePages)[number] | null>(
//     null,
//   );
//   const [addingRoute, setAddingRoute] = useState<string | null>(null);

//   // Search / filters / pagination
//   const [search, setSearch] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState<string>("all");
//   const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
//   const [currentPage, setCurrentPage] = useState(1);

//   const categories = useMemo(() => {
//     const set = new Set<string>();
//     for (const s of services) {
//       if (s.category && s.category.trim()) set.add(s.category.trim());
//     }
//     return Array.from(set).sort((a, b) => a.localeCompare(b));
//   }, [services]);

//   const stats = useMemo(() => {
//     const total = services.length;
//     const active = services.filter((s) => s.is_active).length;
//     const inactive = total - active;
//     return { total, active, inactive };
//   }, [services]);

//   // Detected existing service pages not yet in the catalog — trim + lowercase
//   // comparison so "Kundali " and "kundali" aren't both offered/added.
//   const missingPageServices = useMemo(() => {
//     return existingServicePages.filter(
//       (page) => !services.some((service) => normalize(service.title) === normalize(page.title)),
//     );
//   }, [services]);

//   const filteredRows = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     return services.filter((s) => {
//       if (q) {
//         const haystack = `${s.title} ${s.category ?? ""}`.toLowerCase();
//         if (!haystack.includes(q)) return false;
//       }
//       if (categoryFilter !== "all" && normalize(s.category) !== normalize(categoryFilter)) {
//         return false;
//       }
//       if (statusFilter === "active" && !s.is_active) return false;
//       if (statusFilter === "inactive" && s.is_active) return false;
//       return true;
//     });
//   }, [services, search, categoryFilter, statusFilter]);

//   const sortedRows = useMemo(() => {
//     return [...filteredRows].sort((a, b) => {
//       const dateA = new Date(a.updated_at ?? a.created_at ?? 0).getTime();
//       const dateB = new Date(b.updated_at ?? b.created_at ?? 0).getTime();
//       return dateB - dateA;
//     });
//   }, [filteredRows]);

//   const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
//   const safePage = Math.min(currentPage, totalPages);

//   const paginatedRows = useMemo(() => {
//     const start = (safePage - 1) * PAGE_SIZE;
//     return sortedRows.slice(start, start + PAGE_SIZE);
//   }, [sortedRows, safePage]);

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
//   const onCategoryChange = (value: string) => {
//     setCategoryFilter(value);
//     setCurrentPage(1);
//   };
//   const onStatusChange = (value: StatusFilter) => {
//     setStatusFilter(value);
//     setCurrentPage(1);
//   };

//   const openCreate = () => {
//     setEditing(null);
//     setForm(blankForm);
//     setFormErrors({});
//     setOpen(true);
//   };

//   const openEdit = (s: Service) => {
//     setEditing(s);
//     setForm(serviceToForm(s));
//     setFormErrors({});
//     setOpen(true);
//   };

//   // Step 1: validate (unchanged validation), then ask for confirmation
//   // instead of writing straight to the database.
//   const handleSaveSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const errors = validateForm(form);
//     setFormErrors(errors);
//     if (Object.keys(errors).length > 0) {
//       toast.error("Please fix the highlighted fields.");
//       return;
//     }
//     setShowSaveConfirm(true);
//   };

//   // Step 2: the actual save — identical to the original `save` handler,
//   // just triggered from the confirmation dialog instead of form submit.
//   const performSave = async () => {
//     setSaving(true);
//     const payload = formToPayload(form);
//     const { error } = editing
//       ? await supabase.from("services").update(payload).eq("id", editing.id)
//       : await supabase.from("services").insert(payload);
//     setSaving(false);
//     setShowSaveConfirm(false);

//     if (error) {
//       toast.error(error.message);
//     } else {
//       toast.success(editing ? "Service updated" : "Service created");
//       setOpen(false);
//       reload();
//     }
//   };

//   const confirmDelete = async () => {
//     if (!deleteTarget) return;
//     setDeleting(true);
//     const { error } = await supabase.from("services").delete().eq("id", deleteTarget.id);
//     setDeleting(false);
//     if (error) {
//       toast.error(error.message);
//     } else {
//       toast.success(`"${deleteTarget.title}" deleted`);
//       setDeleteTarget(null);
//       reload();
//     }
//   };

//   const duplicateService = async (s: Service) => {
//     setDuplicatingId(s.id);
//     // New copies are created inactive by default so a duplicate never goes
//     // live in the catalog by accident — the admin flips it active once ready.
//     const payload = {
//       title: `${s.title} (Copy)`,
//       description: s.description,
//       category: s.category,
//       price: s.price,
//       gst_rate: s.gst_rate,
//       hsn_sac_code: s.hsn_sac_code,
//       is_active: false,
//       min_persons: s.min_persons,
//       max_persons: s.max_persons,
//     };
//     const { error } = await supabase.from("services").insert(payload);
//     setDuplicatingId(null);
//     if (error) {
//       toast.error(error.message);
//     } else {
//       toast.success(`Duplicated "${s.title}"`);
//       reload();
//     }
//   };

//   // Unchanged business logic — now only called after the admin confirms.
//   const addPageService = async (page: (typeof existingServicePages)[number]) => {
//     // Guard against a double-click / race adding the same page twice.
//     if (services.some((service) => normalize(service.title) === normalize(page.title))) {
//       toast.error(`"${page.title}" is already in the catalog`);
//       return;
//     }

//     setAddingRoute(page.route);
//     const payload = {
//       title: page.title,
//       description: page.description,
//       category: page.category,
//       price: page.price,
//       gst_rate: page.gst_rate,
//       hsn_sac_code: null,
//       is_active: true,
//     };

//     const { error } = await supabase.from("services").insert(payload);
//     setAddingRoute(null);
//     setAddConfirmTarget(null);
//     if (error) {
//       toast.error(error.message);
//     } else {
//       toast.success(`Added "${page.title}" to catalog`);
//       reload();
//     }
//   };

//   return (
//     <AdminPage
//       title="Service Catalog"
//       description="Manage the live site services currently available to customers. For landing pages, SEO, and publish workflow, use Services & Packages."
//       loading={false}
//       empty={false}
//       actions={
//         <Dialog
//           open={open}
//           onOpenChange={(o) => {
//             setOpen(o);
//             if (!o) setFormErrors({});
//           }}
//         >
//           <DialogTrigger asChild>
//             <Button onClick={openCreate}>
//               <Plus className="w-4 h-4 mr-2" />
//               New Service
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="max-h-[85vh] overflow-y-auto">
//             <DialogHeader>
//               <DialogTitle>{editing ? "Edit" : "New"} Service</DialogTitle>
//               <DialogDescription>
//                 {editing ? "Update the details for this service." : "Add a new service to the catalog."}
//               </DialogDescription>
//             </DialogHeader>
//             <form onSubmit={handleSaveSubmit} className="space-y-3">
//               <div className="space-y-1.5">
//                 <Label htmlFor="svc-title">Service Name</Label>
//                 <Input
//                   id="svc-title"
//                   value={form.title}
//                   onChange={(e) => setForm({ ...form, title: e.target.value })}
//                 />
//                 {formErrors.title && <p className="text-xs text-destructive">{formErrors.title}</p>}
//               </div>

//               <div className="space-y-1.5">
//                 <Label htmlFor="svc-category">Category</Label>
//                 <Input
//                   id="svc-category"
//                   value={form.category}
//                   onChange={(e) => setForm({ ...form, category: e.target.value })}
//                   placeholder="e.g. Consultation"
//                 />
//               </div>

//               <div className="space-y-1.5">
//                 <Label htmlFor="svc-description">Description</Label>
//                 <Textarea
//                   id="svc-description"
//                   value={form.description}
//                   onChange={(e) => setForm({ ...form, description: e.target.value })}
//                   rows={3}
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1.5">
//                   <Label htmlFor="svc-price">Price (₹)</Label>
//                   <Input
//                     id="svc-price"
//                     type="number"
//                     step="0.01"
//                     value={form.price}
//                     onChange={(e) => setForm({ ...form, price: e.target.value })}
//                   />
//                   {formErrors.price && <p className="text-xs text-destructive">{formErrors.price}</p>}
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label htmlFor="svc-gst">GST %</Label>
//                   <Input
//                     id="svc-gst"
//                     type="number"
//                     step="0.01"
//                     value={form.gst_rate}
//                     onChange={(e) => setForm({ ...form, gst_rate: e.target.value })}
//                   />
//                   {formErrors.gst_rate && <p className="text-xs text-destructive">{formErrors.gst_rate}</p>}
//                 </div>
//               </div>

//               <div className="space-y-1.5">
//                 <Label htmlFor="svc-hsn">HSN/SAC Code</Label>
//                 <Input
//                   id="svc-hsn"
//                   value={form.hsn_sac_code}
//                   onChange={(e) => setForm({ ...form, hsn_sac_code: e.target.value })}
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1.5">
//                   <Label htmlFor="svc-min">Min Persons</Label>
//                   <Input
//                     id="svc-min"
//                     type="number"
//                     value={form.min_persons}
//                     onChange={(e) => setForm({ ...form, min_persons: e.target.value })}
//                   />
//                   {formErrors.min_persons && (
//                     <p className="text-xs text-destructive">{formErrors.min_persons}</p>
//                   )}
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label htmlFor="svc-max">Max Persons</Label>
//                   <Input
//                     id="svc-max"
//                     type="number"
//                     value={form.max_persons}
//                     onChange={(e) => setForm({ ...form, max_persons: e.target.value })}
//                   />
//                   {formErrors.max_persons && (
//                     <p className="text-xs text-destructive">{formErrors.max_persons}</p>
//                   )}
//                 </div>
//               </div>

//               <div className="flex items-center gap-2">
//                 <Switch
//                   checked={form.is_active}
//                   onCheckedChange={(v) => setForm({ ...form, is_active: v })}
//                 />
//                 <Label>Active (visible to customers)</Label>
//               </div>

//               <DialogFooter>
//                 <Button type="submit" disabled={saving}>
//                   {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
//                   Save
//                 </Button>
//               </DialogFooter>
//             </form>
//           </DialogContent>
//         </Dialog>
//       }
//     >
//       {/* Stat cards — reflect the real two-state model (is_active only) */}
//       <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-3">
//         <Card>
//           <CardContent className="p-4 flex items-center justify-between">
//             <div>
//               <p className="text-xs text-muted-foreground">Total Services</p>
//               <p className="text-2xl font-semibold">{stats.total}</p>
//             </div>
//             <ListChecks className="w-5 h-5 text-muted-foreground" />
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4 flex items-center justify-between">
//             <div>
//               <p className="text-xs text-muted-foreground">Active</p>
//               <p className="text-2xl font-semibold text-green-600">{stats.active}</p>
//             </div>
//             <CheckCircle2 className="w-5 h-5 text-green-500" />
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4 flex items-center justify-between">
//             <div>
//               <p className="text-xs text-muted-foreground">Inactive</p>
//               <p className="text-2xl font-semibold text-muted-foreground">{stats.inactive}</p>
//             </div>
//             <XCircle className="w-5 h-5 text-muted-foreground" />
//           </CardContent>
//         </Card>
//       </div>

//       {/* Detected existing service pages */}
//       {missingPageServices.length > 0 && (
//         <div className="border border-border rounded-2xl p-4 mb-6 bg-muted/70">
//           <div className="mb-3">
//             <p className="font-semibold">Detected existing service pages</p>
//             <p className="text-sm text-muted-foreground">
//               These pages already exist in the app but are not yet in the live service catalog.
//             </p>
//           </div>
//           <div className="grid gap-3">
//             {missingPageServices.map((page) => (
//               <div
//                 key={page.route}
//                 className="rounded-xl border border-border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-background"
//               >
//                 <div>
//                   <p className="font-semibold">{page.title}</p>
//                   <p className="text-sm text-muted-foreground">
//                     {page.category} · {formatINRLocal(page.price)} · {page.gst_rate}% GST
//                   </p>
//                 </div>
//                 <Button
//                   size="sm"
//                   disabled={addingRoute === page.route}
//                   onClick={() => setAddConfirmTarget(page)}
//                 >
//                   {addingRoute === page.route ? (
//                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                   ) : (
//                     <Plus className="w-4 h-4 mr-2" />
//                   )}
//                   Add to Catalog
//                 </Button>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       <Card>
//         <CardContent className="p-4">
//           {/* Filters toolbar */}
//           <div className="flex flex-col gap-3 mb-4 md:flex-row md:flex-wrap md:items-end">
//             <div className="flex-1 min-w-[220px] space-y-2">
//               <Label htmlFor="svc-search">Search</Label>
//               <div className="relative">
//                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
//                 <Input
//                   id="svc-search"
//                   value={search}
//                   onChange={(e) => onSearchChange(e.target.value)}
//                   placeholder="Service name or category…"
//                   className="pl-9"
//                 />
//               </div>
//             </div>

//             <div className="w-full md:w-48 space-y-2">
//               <Label>Category</Label>
//               <Select value={categoryFilter} onValueChange={onCategoryChange}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="All Categories" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Categories</SelectItem>
//                   {categories.map((c) => (
//                     <SelectItem key={c} value={c}>
//                       {c}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="w-full md:w-44 space-y-2">
//               <Label>Status</Label>
//               <Select value={statusFilter} onValueChange={(v) => onStatusChange(v as StatusFilter)}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="All" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All</SelectItem>
//                   <SelectItem value="active">Active</SelectItem>
//                   <SelectItem value="inactive">Inactive</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             {(search || categoryFilter !== "all" || statusFilter !== "all") && (
//               <Button
//                 type="button"
//                 variant="ghost"
//                 onClick={() => {
//                   setSearch("");
//                   setCategoryFilter("all");
//                   setStatusFilter("all");
//                   setCurrentPage(1);
//                 }}
//               >
//                 Clear filters
//               </Button>
//             )}
//           </div>

//           {/* Loading skeleton */}
//           {loading ? (
//             <div className="space-y-2">
//               {Array.from({ length: 5 }).map((_, i) => (
//                 <Skeleton key={i} className="h-14 w-full rounded-lg" />
//               ))}
//             </div>
//           ) : sortedRows.length === 0 ? (
//             <div className="flex flex-col items-center justify-center gap-2 py-14 text-center border border-dashed border-border rounded-lg">
//               <PackageSearch className="w-8 h-8 text-muted-foreground" />
//               <p className="text-muted-foreground text-sm font-medium">No Services Found</p>
//               <p className="text-muted-foreground text-xs">
//                 {services.length === 0
//                   ? 'Click "New Service" to add your first service.'
//                   : "Try adjusting your search or filters."}
//               </p>
//             </div>
//           ) : (
//             <>
//               {/* Desktop table */}
//               <div className="hidden md:block overflow-x-auto rounded-lg border border-border">
//                 <table className="w-full text-sm">
//                   <thead>
//                     <tr className="bg-muted/50 text-left text-muted-foreground">
//                       <th className="px-4 py-2 font-medium">Service Name</th>
//                       <th className="px-4 py-2 font-medium">Category</th>
//                       <th className="px-4 py-2 font-medium">Base Price</th>
//                       <th className="px-4 py-2 font-medium">GST</th>
//                       <th className="px-4 py-2 font-medium">Final Price</th>
//                       <th className="px-4 py-2 font-medium">Status</th>
//                       <th className="px-4 py-2 font-medium">Updated</th>
//                       <th className="px-4 py-2 font-medium text-right">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {paginatedRows.map((s) => (
//                       <tr
//                         key={s.id}
//                         onClick={() => setViewing(s)}
//                         className="border-t border-border hover:bg-muted/40 cursor-pointer transition-colors"
//                       >
//                         <td className="px-4 py-2 font-medium truncate max-w-[220px]">{s.title}</td>
//                         <td className="px-4 py-2 text-muted-foreground">{safeString(s.category)}</td>
//                         <td className="px-4 py-2 whitespace-nowrap">{formatINRLocal(Number(s.price))}</td>
//                         <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
//                           {Number(s.gst_rate)}%
//                         </td>
//                         <td className="px-4 py-2 whitespace-nowrap font-medium">
//                           {formatINRLocal(finalPrice(s.price, s.gst_rate))}
//                         </td>
//                         <td className="px-4 py-2">
//                           {s.is_active ? (
//                             <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border border-green-200">
//                               Active
//                             </Badge>
//                           ) : (
//                             <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border border-slate-200">
//                               Inactive
//                             </Badge>
//                           )}
//                         </td>
//                         <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
//                           {formatDateTime(s.updated_at)}
//                         </td>
//                         <td className="px-4 py-2 text-right">
//                           <div className="flex items-center justify-end gap-2">
//                             <Button
//                               size="icon"
//                               variant="outline"
//                               title="View"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 setViewing(s);
//                               }}
//                             >
//                               <Eye className="w-4 h-4" />
//                             </Button>
//                             <Button
//                               size="icon"
//                               variant="outline"
//                               title="Edit"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 openEdit(s);
//                               }}
//                             >
//                               <Pencil className="w-4 h-4" />
//                             </Button>
//                             <Button
//                               size="icon"
//                               variant="outline"
//                               title="Duplicate"
//                               disabled={duplicatingId === s.id}
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 duplicateService(s);
//                               }}
//                             >
//                               {duplicatingId === s.id ? (
//                                 <Loader2 className="w-4 h-4 animate-spin" />
//                               ) : (
//                                 <Copy className="w-4 h-4" />
//                               )}
//                             </Button>
//                             <Button
//                               size="icon"
//                               variant="outline"
//                               title="Delete"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 setDeleteTarget(s);
//                               }}
//                             >
//                               <Trash2 className="w-4 h-4" />
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
//                 {paginatedRows.map((s) => (
//                   <div
//                     key={s.id}
//                     onClick={() => setViewing(s)}
//                     className="rounded-lg border border-border p-3 space-y-2 active:bg-muted/40"
//                   >
//                     <div className="flex items-start justify-between gap-2">
//                       <p className="font-medium truncate">{s.title}</p>
//                       {s.is_active ? (
//                         <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border border-green-200">
//                           Active
//                         </Badge>
//                       ) : (
//                         <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border border-slate-200">
//                           Inactive
//                         </Badge>
//                       )}
//                     </div>
//                     <div className="flex items-center justify-between text-xs text-muted-foreground">
//                       <span>{safeString(s.category)}</span>
//                       <span>{formatDateTime(s.updated_at)}</span>
//                     </div>
//                     <div className="flex items-center justify-between text-sm">
//                       <span className="text-muted-foreground">
//                         {formatINRLocal(Number(s.price))} + {Number(s.gst_rate)}% GST
//                       </span>
//                       <span className="font-semibold">{formatINRLocal(finalPrice(s.price, s.gst_rate))}</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         className="flex-1"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setViewing(s);
//                         }}
//                       >
//                         <Eye className="w-3.5 h-3.5 mr-1" />
//                         View
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         className="flex-1"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           openEdit(s);
//                         }}
//                       >
//                         <Pencil className="w-3.5 h-3.5 mr-1" />
//                         Edit
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         className="flex-1"
//                         disabled={duplicatingId === s.id}
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           duplicateService(s);
//                         }}
//                       >
//                         {duplicatingId === s.id ? (
//                           <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
//                         ) : (
//                           <Copy className="w-3.5 h-3.5 mr-1" />
//                         )}
//                         Copy
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         className="flex-1"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setDeleteTarget(s);
//                         }}
//                       >
//                         <Trash2 className="w-3.5 h-3.5 mr-1" />
//                         Delete
//                       </Button>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Pagination — client-side (useAdminTable fetches the full set, no server pagination available) */}
//               <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
//                 <p className="text-xs text-muted-foreground">
//                   Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, sortedRows.length)} of{" "}
//                   {sortedRows.length}
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

//       {/* View dialog */}
//       <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
//         <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Service Details</DialogTitle>
//             <DialogDescription>Full record for this catalog entry.</DialogDescription>
//           </DialogHeader>
//           {viewing && (
//             <div className="space-y-3 text-sm">
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Service Name</span>
//                 <span className="col-span-2 font-medium">{viewing.title}</span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Category</span>
//                 <span className="col-span-2 font-medium">{safeString(viewing.category)}</span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Description</span>
//                 <span className="col-span-2">{safeString(viewing.description)}</span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Base Price</span>
//                 <span className="col-span-2 font-medium">{formatINRLocal(Number(viewing.price))}</span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">GST</span>
//                 <span className="col-span-2 font-medium">{Number(viewing.gst_rate)}%</span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Final Price</span>
//                 <span className="col-span-2 font-semibold">
//                   {formatINRLocal(finalPrice(viewing.price, viewing.gst_rate))}
//                 </span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">HSN/SAC Code</span>
//                 <span className="col-span-2 font-medium">{safeString(viewing.hsn_sac_code)}</span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Min / Max Persons</span>
//                 <span className="col-span-2 font-medium">
//                   {safeString(viewing.min_persons, "—")} / {safeString(viewing.max_persons, "—")}
//                 </span>
//               </div>
//               <div className="grid grid-cols-3 gap-2 items-center">
//                 <span className="text-muted-foreground">Status</span>
//                 <span className="col-span-2">
//                   {viewing.is_active ? (
//                     <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border border-green-200">
//                       Active
//                     </Badge>
//                   ) : (
//                     <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border border-slate-200">
//                       Inactive
//                     </Badge>
//                   )}
//                 </span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Created</span>
//                 <span className="col-span-2 font-medium">{formatDateTime(viewing.created_at)}</span>
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <span className="text-muted-foreground">Updated</span>
//                 <span className="col-span-2 font-medium">{formatDateTime(viewing.updated_at)}</span>
//               </div>

//               <div className="flex items-center gap-2 pt-2">
//                 <Button
//                   className="flex-1"
//                   variant="outline"
//                   onClick={() => {
//                     openEdit(viewing);
//                     setViewing(null);
//                   }}
//                 >
//                   <Pencil className="w-4 h-4 mr-2" />
//                   Edit
//                 </Button>
//                 <Button
//                   className="flex-1"
//                   variant="outline"
//                   disabled={duplicatingId === viewing.id}
//                   onClick={() => duplicateService(viewing)}
//                 >
//                   {duplicatingId === viewing.id ? (
//                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                   ) : (
//                     <Copy className="w-4 h-4 mr-2" />
//                   )}
//                   Duplicate
//                 </Button>
//               </div>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Create/Edit live-update confirmation — shown after form validation passes */}
//       <ConfirmLiveUpdateDialog
//         open={showSaveConfirm}
//         onOpenChange={setShowSaveConfirm}
//         onConfirm={performSave}
//         loading={saving}
//         title="Confirm Live Website Update"
//         description={
//           <>
//             <p>This action will immediately update the live website.</p>
//             <p>Please confirm that you want to continue.</p>
//             <p>This change will be visible to customers immediately.</p>
//           </>
//         }
//         confirmLabel="Confirm & Publish"
//       />

//       {/* Add-to-Catalog live-update confirmation (creates an active, customer-visible service) */}
//       <ConfirmLiveUpdateDialog
//         open={!!addConfirmTarget}
//         onOpenChange={(o) => !o && setAddConfirmTarget(null)}
//         onConfirm={() => addConfirmTarget && addPageService(addConfirmTarget)}
//         loading={!!addingRoute}
//         title="Confirm Live Website Update"
//         description={
//           <>
//             <p>
//               Adding "{addConfirmTarget?.title}" will immediately update the live website.
//             </p>
//             <p>Please confirm that you want to continue.</p>
//             <p>This change will be visible to customers immediately.</p>
//           </>
//         }
//         confirmLabel="Confirm & Publish"
//       />

//       {/* Delete confirmation — destructive AlertDialog. Deleting NEVER happens
//           on click; clicking the Trash icon only sets deleteTarget, which opens
//           this dialog. confirmDelete (the existing, unchanged handler) is
//           invoked exclusively from the "Delete Service" button below. */}
//       <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !deleting && !o && setDeleteTarget(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete Service?</AlertDialogTitle>
//             <AlertDialogDescription asChild>
//               <div className="space-y-1.5">
//                 <p>This service will be removed from the live website.</p>
//                 <p>This action may affect customer bookings.</p>
//                 <p>Are you sure you want to continue?</p>
//               </div>
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel type="button" disabled={deleting}>
//               Cancel
//             </AlertDialogCancel>
//             <AlertDialogAction
//               type="button"
//               disabled={deleting}
//               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//               onClick={(e) => {
//                 e.preventDefault();
//                 confirmDelete();
//               }}
//             >
//               {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
//               Delete Service
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
import { existingServicePages } from "@/data/servicePages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
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
import { ConfirmLiveUpdateDialog } from "@/components/admin/ConfirmLiveUpdateDialog";
import { toast } from "sonner";
import {
  Loader2,
  Pencil,
  Trash2,
  Eye,
  Copy,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ListChecks,
  CheckCircle2,
  XCircle,
  PackageSearch,
  PackagePlus,
} from "lucide-react";

// ------------------------------------------------------------------
// Types — matches the real `services` table exactly. No new columns.
// ------------------------------------------------------------------

type Service = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  price: number;
  gst_rate: number;
  hsn_sac_code: string | null;
  is_active: boolean;
  min_persons: number | null;
  max_persons: number | null;
  created_at: string;
  updated_at: string;
};

type ServiceForm = {
  title: string;
  description: string;
  category: string;
  price: string;
  gst_rate: string;
  hsn_sac_code: string;
  is_active: boolean;
  min_persons: string;
  max_persons: string;
};

type StatusFilter = "all" | "active" | "inactive";

const PAGE_SIZE = 10;

const blankForm: ServiceForm = {
  title: "",
  description: "",
  category: "",
  price: "",
  gst_rate: "18",
  hsn_sac_code: "",
  is_active: true,
  min_persons: "",
  max_persons: "",
};

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function normalize(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
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

function formatINRLocal(value: number): string {
  if (Number.isNaN(value)) return "—";
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function finalPrice(price: number, gstRate: number): number {
  const p = Number(price) || 0;
  const g = Number(gstRate) || 0;
  return p + (p * g) / 100;
}

function serviceToForm(s: Service): ServiceForm {
  return {
    title: s.title,
    description: s.description || "",
    category: s.category || "",
    price: String(s.price ?? ""),
    gst_rate: String(s.gst_rate ?? "18"),
    hsn_sac_code: s.hsn_sac_code || "",
    is_active: s.is_active,
    min_persons: s.min_persons != null ? String(s.min_persons) : "",
    max_persons: s.max_persons != null ? String(s.max_persons) : "",
  };
}

// Validates the form and returns a map of field -> error message.
// Empty object means the form is valid.
function validateForm(form: ServiceForm): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.title.trim()) {
    errors.title = "Service name is required.";
  }

  const price = Number(form.price);
  if (form.price.trim() === "" || Number.isNaN(price) || price < 0) {
    errors.price = "Enter a valid price (0 or more).";
  }

  const gst = Number(form.gst_rate);
  if (form.gst_rate.trim() === "" || Number.isNaN(gst) || gst < 0 || gst > 100) {
    errors.gst_rate = "GST must be between 0 and 100.";
  }

  if (form.min_persons.trim() !== "") {
    const min = Number(form.min_persons);
    if (Number.isNaN(min) || min < 0) errors.min_persons = "Min persons must be 0 or more.";
  }

  if (form.max_persons.trim() !== "") {
    const max = Number(form.max_persons);
    if (Number.isNaN(max) || max < 0) errors.max_persons = "Max persons must be 0 or more.";
  }

  if (form.min_persons.trim() !== "" && form.max_persons.trim() !== "") {
    const min = Number(form.min_persons);
    const max = Number(form.max_persons);
    if (!Number.isNaN(min) && !Number.isNaN(max) && max < min) {
      errors.max_persons = "Max persons can't be less than min persons.";
    }
  }

  return errors;
}

function formToPayload(form: ServiceForm) {
  return {
    title: form.title.trim(),
    description: form.description.trim() || null,
    category: form.category.trim() || null,
    price: Number(form.price),
    gst_rate: Number(form.gst_rate),
    hsn_sac_code: form.hsn_sac_code.trim() || null,
    is_active: form.is_active,
    min_persons: form.min_persons.trim() !== "" ? Number(form.min_persons) : null,
    max_persons: form.max_persons.trim() !== "" ? Number(form.max_persons) : null,
  };
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export default function ServicesModule() {
  const { rows, loading, reload } = useAdminTable<Service>("services");
  const services = rows;

  // Edit dialog state. Creation now happens exclusively via "Pages &
  // Packages" (or via "Add to Catalog" below for pages that already exist
  // live), so this dialog is only ever opened through openEdit() — there is
  // no "New Service" trigger anymore.
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceForm>(blankForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Live-update confirmation for Edit save (shown after validation passes)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  // View dialog state
  const [viewing, setViewing] = useState<Service | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Duplicate-in-progress state (per row) — duplicates are created inactive,
  // so they never go live immediately and do not need a confirmation gate.
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  // Add-to-catalog: confirmation target + in-progress state (per detected page).
  // Adding a detected page creates an ACTIVE service, so it goes live
  // immediately and requires confirmation like the Edit dialog does.
  const [addConfirmTarget, setAddConfirmTarget] = useState<(typeof existingServicePages)[number] | null>(
    null,
  );
  const [addingRoute, setAddingRoute] = useState<string | null>(null);

  // Detected-pages panel is collapsed by default — it's a reconciliation
  // tool used occasionally, not something that should push the actual
  // catalog table below the fold on every visit.
  const [showDetectedPages, setShowDetectedPages] = useState(false);

  // Search / filters / pagination
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const s of services) {
      if (s.category && s.category.trim()) set.add(s.category.trim());
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [services]);

  const stats = useMemo(() => {
    const total = services.length;
    const active = services.filter((s) => s.is_active).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [services]);

  // Detected existing service pages not yet in the catalog — trim + lowercase
  // comparison so "Kundali " and "kundali" aren't both offered/added.
  const missingPageServices = useMemo(() => {
    return existingServicePages.filter(
      (page) => !services.some((service) => normalize(service.title) === normalize(page.title)),
    );
  }, [services]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter((s) => {
      if (q) {
        const haystack = `${s.title} ${s.category ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (categoryFilter !== "all" && normalize(s.category) !== normalize(categoryFilter)) {
        return false;
      }
      if (statusFilter === "active" && !s.is_active) return false;
      if (statusFilter === "inactive" && s.is_active) return false;
      return true;
    });
  }, [services, search, categoryFilter, statusFilter]);

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      const dateA = new Date(a.updated_at ?? a.created_at ?? 0).getTime();
      const dateB = new Date(b.updated_at ?? b.created_at ?? 0).getTime();
      return dateB - dateA;
    });
  }, [filteredRows]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return sortedRows.slice(start, start + PAGE_SIZE);
  }, [sortedRows, safePage]);

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
  const onCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };
  const onStatusChange = (value: StatusFilter) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setForm(serviceToForm(s));
    setFormErrors({});
    setOpen(true);
  };

  // Step 1: validate (unchanged validation), then ask for confirmation
  // instead of writing straight to the database.
  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm(form);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setShowSaveConfirm(true);
  };

  // Step 2: the actual save — identical to the original `save` handler,
  // just triggered from the confirmation dialog instead of form submit.
  // `editing` is always set here since this dialog only opens via openEdit().
  const performSave = async () => {
    if (!editing) return;
    setSaving(true);
    const payload = formToPayload(form);
    const { error } = await supabase.from("services").update(payload).eq("id", editing.id);
    setSaving(false);
    setShowSaveConfirm(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Service updated");
      setOpen(false);
      reload();
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from("services").delete().eq("id", deleteTarget.id);
    setDeleting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`"${deleteTarget.title}" deleted`);
      setDeleteTarget(null);
      reload();
    }
  };

  const duplicateService = async (s: Service) => {
    setDuplicatingId(s.id);
    // New copies are created inactive by default so a duplicate never goes
    // live in the catalog by accident — the admin flips it active once ready.
    const payload = {
      title: `${s.title} (Copy)`,
      description: s.description,
      category: s.category,
      price: s.price,
      gst_rate: s.gst_rate,
      hsn_sac_code: s.hsn_sac_code,
      is_active: false,
      min_persons: s.min_persons,
      max_persons: s.max_persons,
    };
    const { error } = await supabase.from("services").insert(payload);
    setDuplicatingId(null);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Duplicated "${s.title}"`);
      reload();
    }
  };

  // Unchanged business logic — now only called after the admin confirms.
  const addPageService = async (page: (typeof existingServicePages)[number]) => {
    // Guard against a double-click / race adding the same page twice.
    if (services.some((service) => normalize(service.title) === normalize(page.title))) {
      toast.error(`"${page.title}" is already in the catalog`);
      return;
    }

    setAddingRoute(page.route);
    const payload = {
      title: page.title,
      description: page.description,
      category: page.category,
      price: page.price,
      gst_rate: page.gst_rate,
      hsn_sac_code: null,
      is_active: true,
    };

    const { error } = await supabase.from("services").insert(payload);
    setAddingRoute(null);
    setAddConfirmTarget(null);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Added "${page.title}" to catalog`);
      reload();
    }
  };

  return (
    <AdminPage
      title="Service Catalog"
      description="Manage the live site services currently available to customers. For landing pages, SEO, and publish workflow, use Services & Packages."
      loading={false}
      empty={false}
    >
      {/* Stat cards — reflect the real two-state model (is_active only) */}
      <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Services</p>
              <p className="text-2xl font-semibold">{stats.total}</p>
            </div>
            <ListChecks className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-2xl font-semibold text-green-600">{stats.active}</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Inactive</p>
              <p className="text-2xl font-semibold text-muted-foreground">{stats.inactive}</p>
            </div>
            <XCircle className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* Detected existing service pages — collapsed behind a toggle so it
          doesn't push the actual catalog table down on every visit. Only
          rendered at all when there's something to reconcile. */}
      {missingPageServices.length > 0 && (
        <div className="border border-border rounded-2xl mb-6 bg-muted/70 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowDetectedPages((v) => !v)}
            className="w-full flex items-center justify-between gap-3 p-4 text-left"
          >
            <div className="flex items-center gap-3">
              <PackagePlus className="w-5 h-5 text-muted-foreground shrink-0" />
              <div>
                <p className="font-semibold">
                  {missingPageServices.length} untracked service page
                  {missingPageServices.length === 1 ? "" : "s"} detected
                </p>
                <p className="text-sm text-muted-foreground">
                  These pages already exist on the site but aren't in the catalog yet.
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-sm font-medium text-primary shrink-0">
              {showDetectedPages ? "Hide" : "Review & Add"}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showDetectedPages ? "rotate-180" : ""}`}
              />
            </span>
          </button>

          {showDetectedPages && (
            <div className="grid gap-3 px-4 pb-4">
              {missingPageServices.map((page) => (
                <div
                  key={page.route}
                  className="rounded-xl border border-border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-background"
                >
                  <div>
                    <p className="font-semibold">{page.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {page.category} · {formatINRLocal(page.price)} · {page.gst_rate}% GST
                    </p>
                  </div>
                  <Button
                    size="sm"
                    disabled={addingRoute === page.route}
                    onClick={() => setAddConfirmTarget(page)}
                  >
                    {addingRoute === page.route ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <PackagePlus className="w-4 h-4 mr-2" />
                    )}
                    Add to Catalog
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Card>
        <CardContent className="p-4">
          {/* Filters toolbar */}
          <div className="flex flex-col gap-3 mb-4 md:flex-row md:flex-wrap md:items-end">
            <div className="flex-1 min-w-[220px] space-y-2">
              <Label htmlFor="svc-search">Search</Label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="svc-search"
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Service name or category…"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="w-full md:w-48 space-y-2">
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={onCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-44 space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={(v) => onStatusChange(v as StatusFilter)}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(search || categoryFilter !== "all" || statusFilter !== "all") && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("all");
                  setStatusFilter("all");
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
          ) : sortedRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-14 text-center border border-dashed border-border rounded-lg">
              <PackageSearch className="w-8 h-8 text-muted-foreground" />
              <p className="text-muted-foreground text-sm font-medium">No Services Found</p>
              <p className="text-muted-foreground text-xs">
                {services.length === 0
                  ? "Add services from Pages & Packages, or use \"Add to Catalog\" above for pages already live."
                  : "Try adjusting your search or filters."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-left text-muted-foreground">
                      <th className="px-4 py-2 font-medium">Service Name</th>
                      <th className="px-4 py-2 font-medium">Category</th>
                      <th className="px-4 py-2 font-medium">Base Price</th>
                      <th className="px-4 py-2 font-medium">GST</th>
                      <th className="px-4 py-2 font-medium">Final Price</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                      <th className="px-4 py-2 font-medium">Updated</th>
                      <th className="px-4 py-2 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map((s) => (
                      <tr
                        key={s.id}
                        onClick={() => setViewing(s)}
                        className="border-t border-border hover:bg-muted/40 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-2 font-medium truncate max-w-[220px]">{s.title}</td>
                        <td className="px-4 py-2 text-muted-foreground">{safeString(s.category)}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{formatINRLocal(Number(s.price))}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
                          {Number(s.gst_rate)}%
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap font-medium">
                          {formatINRLocal(finalPrice(s.price, s.gst_rate))}
                        </td>
                        <td className="px-4 py-2">
                          {s.is_active ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border border-green-200">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border border-slate-200">
                              Inactive
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
                          {formatDateTime(s.updated_at)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              title="View"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewing(s);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              title="Edit"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEdit(s);
                              }}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              title="Duplicate"
                              disabled={duplicatingId === s.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateService(s);
                              }}
                            >
                              {duplicatingId === s.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              title="Delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(s);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
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
                {paginatedRows.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setViewing(s)}
                    className="rounded-lg border border-border p-3 space-y-2 active:bg-muted/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium truncate">{s.title}</p>
                      {s.is_active ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border border-green-200">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border border-slate-200">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{safeString(s.category)}</span>
                      <span>{formatDateTime(s.updated_at)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {formatINRLocal(Number(s.price))} + {Number(s.gst_rate)}% GST
                      </span>
                      <span className="font-semibold">{formatINRLocal(finalPrice(s.price, s.gst_rate))}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewing(s);
                        }}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(s);
                        }}
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        disabled={duplicatingId === s.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateService(s);
                        }}
                      >
                        {duplicatingId === s.id ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 mr-1" />
                        )}
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(s);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination — client-side (useAdminTable fetches the full set, no server pagination available) */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                <p className="text-xs text-muted-foreground">
                  Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, sortedRows.length)} of{" "}
                  {sortedRows.length}
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

      {/* Edit dialog — only ever opened via openEdit() (Pencil icon / row
          click → View → Edit). There is no "New Service" trigger; creation
          happens via Pages & Packages, or via "Add to Catalog" above. */}
      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setFormErrors({});
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>Update the details for this service.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="svc-title">Service Name</Label>
              <Input
                id="svc-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              {formErrors.title && <p className="text-xs text-destructive">{formErrors.title}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="svc-category">Category</Label>
              <Input
                id="svc-category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Consultation"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="svc-description">Description</Label>
              <Textarea
                id="svc-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="svc-price">Price (₹)</Label>
                <Input
                  id="svc-price"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
                {formErrors.price && <p className="text-xs text-destructive">{formErrors.price}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="svc-gst">GST %</Label>
                <Input
                  id="svc-gst"
                  type="number"
                  step="0.01"
                  value={form.gst_rate}
                  onChange={(e) => setForm({ ...form, gst_rate: e.target.value })}
                />
                {formErrors.gst_rate && <p className="text-xs text-destructive">{formErrors.gst_rate}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="svc-hsn">HSN/SAC Code</Label>
              <Input
                id="svc-hsn"
                value={form.hsn_sac_code}
                onChange={(e) => setForm({ ...form, hsn_sac_code: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="svc-min">Min Persons</Label>
                <Input
                  id="svc-min"
                  type="number"
                  value={form.min_persons}
                  onChange={(e) => setForm({ ...form, min_persons: e.target.value })}
                />
                {formErrors.min_persons && (
                  <p className="text-xs text-destructive">{formErrors.min_persons}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="svc-max">Max Persons</Label>
                <Input
                  id="svc-max"
                  type="number"
                  value={form.max_persons}
                  onChange={(e) => setForm({ ...form, max_persons: e.target.value })}
                />
                {formErrors.max_persons && (
                  <p className="text-xs text-destructive">{formErrors.max_persons}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
              <Label>Active (visible to customers)</Label>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View dialog */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Service Details</DialogTitle>
            <DialogDescription>Full record for this catalog entry.</DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Service Name</span>
                <span className="col-span-2 font-medium">{viewing.title}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Category</span>
                <span className="col-span-2 font-medium">{safeString(viewing.category)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Description</span>
                <span className="col-span-2">{safeString(viewing.description)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Base Price</span>
                <span className="col-span-2 font-medium">{formatINRLocal(Number(viewing.price))}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">GST</span>
                <span className="col-span-2 font-medium">{Number(viewing.gst_rate)}%</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Final Price</span>
                <span className="col-span-2 font-semibold">
                  {formatINRLocal(finalPrice(viewing.price, viewing.gst_rate))}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">HSN/SAC Code</span>
                <span className="col-span-2 font-medium">{safeString(viewing.hsn_sac_code)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Min / Max Persons</span>
                <span className="col-span-2 font-medium">
                  {safeString(viewing.min_persons, "—")} / {safeString(viewing.max_persons, "—")}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 items-center">
                <span className="text-muted-foreground">Status</span>
                <span className="col-span-2">
                  {viewing.is_active ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border border-green-200">
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border border-slate-200">
                      Inactive
                    </Badge>
                  )}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Created</span>
                <span className="col-span-2 font-medium">{formatDateTime(viewing.created_at)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Updated</span>
                <span className="col-span-2 font-medium">{formatDateTime(viewing.updated_at)}</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => {
                    openEdit(viewing);
                    setViewing(null);
                  }}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  className="flex-1"
                  variant="outline"
                  disabled={duplicatingId === viewing.id}
                  onClick={() => duplicateService(viewing)}
                >
                  {duplicatingId === viewing.id ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  Duplicate
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit live-update confirmation — shown after form validation passes */}
      <ConfirmLiveUpdateDialog
        open={showSaveConfirm}
        onOpenChange={setShowSaveConfirm}
        onConfirm={performSave}
        loading={saving}
        title="Confirm Live Website Update"
        description={
          <>
            <p>This action will immediately update the live website.</p>
            <p>Please confirm that you want to continue.</p>
            <p>This change will be visible to customers immediately.</p>
          </>
        }
        confirmLabel="Confirm & Publish"
      />

      {/* Add-to-Catalog live-update confirmation (creates an active, customer-visible service) */}
      <ConfirmLiveUpdateDialog
        open={!!addConfirmTarget}
        onOpenChange={(o) => !o && setAddConfirmTarget(null)}
        onConfirm={() => addConfirmTarget && addPageService(addConfirmTarget)}
        loading={!!addingRoute}
        title="Confirm Live Website Update"
        description={
          <>
            <p>
              Adding "{addConfirmTarget?.title}" will immediately update the live website.
            </p>
            <p>Please confirm that you want to continue.</p>
            <p>This change will be visible to customers immediately.</p>
          </>
        }
        confirmLabel="Confirm & Publish"
      />

      {/* Delete confirmation — destructive AlertDialog. Deleting NEVER happens
          on click; clicking the Trash icon only sets deleteTarget, which opens
          this dialog. confirmDelete (the existing, unchanged handler) is
          invoked exclusively from the "Delete Service" button below. */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !deleting && !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-1.5">
                <p>This service will be removed from the live website.</p>
                <p>This action may affect customer bookings.</p>
                <p>Are you sure you want to continue?</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              type="button"
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
            >
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Service
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPage>
  );
}