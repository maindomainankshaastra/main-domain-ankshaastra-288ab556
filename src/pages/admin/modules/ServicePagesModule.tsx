// import { useEffect, useMemo, useState, type FormEvent } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import { AdminPage } from "@/components/admin/AdminPage";
// import { useAdminTable } from "@/hooks/useAdminData";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import { Switch } from "@/components/ui/switch";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { toast } from "sonner";
// import { Loader2, Plus, Pencil, Trash2, Globe, FileText, Package } from "lucide-react";
// import { formatINR } from "@/config/pricing";
// import {
//   catalogPackageToAdminPayload,
//   getCatalogSyncForSlug,
// } from "@/data/adminCatalogSync";

// type ServicePage = {
//   id: string;
//   slug: string;
//   route: string;
//   page_type: string;
//   title: string;
//   subtitle: string | null;
//   description: string | null;
//   category: string | null;
//   seo_title: string | null;
//   seo_description: string | null;
//   hero_image_url: string | null;
//   content: Record<string, unknown>;
//   form_type: string;
//   status: "draft" | "published";
//   sort_order: number;
//   published_at: string | null;
// };

// type ServicePackage = {
//   id: string;
//   page_id: string;
//   name: string;
//   tag: string | null;
//   description: string | null;
//   price: number;
//   original_price: number | null;
//   gst_rate: number;
//   features: string[];
//   excluded: string[];
//   form_type: string | null;
//   payment_service_title: string | null;
//   is_popular: boolean;
//   is_active: boolean;
//   sort_order: number;
// };

// const blankPage = {
//   slug: "",
//   route: "",
//   page_type: "service",
//   title: "",
//   subtitle: "",
//   description: "",
//   category: "",
//   seo_title: "",
//   seo_description: "",
//   hero_image_url: "",
//   content: { features: [] as string[], faqs: [] as { q: string; a: string }[] },
//   form_type: "default",
//   status: "draft" as const,
//   sort_order: 0,
// };

// const blankPackage = {
//   page_id: "",
//   name: "",
//   tag: "",
//   description: "",
//   price: 0,
//   original_price: 0,
//   gst_rate: 18,
//   features: [] as string[],
//   excluded: [] as string[],
//   form_type: "",
//   payment_service_title: "",
//   is_popular: false,
//   is_active: true,
//   sort_order: 0,
// };

// const FORM_TYPES = [
//   "default",
//   "kundali",
//   "kundali-multi",
//   "consultation",
//   "name-correction",
//   "name-correction-couple",
//   "name-check",
//   "couple",
//   "pyaar-shastra",
//   "lucky-vehicle",
//   "lucky-vehicle-color",
//   "lucky-vehicle-date",
//   "lucky-mobile",
//   "lucky-flat",
//   "relationship-analysis",
//   "business-brand",
//   "business-dates",
//   "business-property",
//   "business-partner",
//   "office-vastu",
// ];

// function slugify(value: string) {
//   return value
//     .toLowerCase()
//     .trim()
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/^-+|-+$/g, "");
// }

// export default function ServicePagesModule() {
//   const { rows: pages, loading: pagesLoading, reload: reloadPages } = useAdminTable<ServicePage>(
//     "service_pages",
//     "sort_order",
//     true,
//   );
//   const { rows: packages, loading: packagesLoading, reload: reloadPackages } = useAdminTable<ServicePackage>(
//     "service_packages",
//     "sort_order",
//     true,
//   );

//   const [pageOpen, setPageOpen] = useState(false);
//   const [pkgOpen, setPkgOpen] = useState(false);
//   const [editingPage, setEditingPage] = useState<ServicePage | null>(null);
//   const [editingPkg, setEditingPkg] = useState<ServicePackage | null>(null);
//   const [pageForm, setPageForm] = useState(blankPage);
//   const [pkgForm, setPkgForm] = useState(blankPackage);
//   const [featuresText, setFeaturesText] = useState("");
//   const [faqsText, setFaqsText] = useState("");
//   const [pkgFeaturesText, setPkgFeaturesText] = useState("");
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     if (pages.length && !pkgForm.page_id) {
//       setPkgForm((prev) => ({ ...prev, page_id: pages[0].id }));
//     }
//   }, [pages, pkgForm.page_id]);

//   const packagesByPage = useMemo(() => {
//     const map = new Map<string, ServicePackage[]>();
//     for (const pkg of packages) {
//       const list = map.get(pkg.page_id) || [];
//       list.push(pkg);
//       map.set(pkg.page_id, list);
//     }
//     return map;
//   }, [packages]);

//   const openEditPage = (page: ServicePage) => {
//     setEditingPage(page);
//     const content = page.content || {};
//     setPageForm({
//       slug: page.slug,
//       route: page.route,
//       page_type: page.page_type,
//       title: page.title,
//       subtitle: page.subtitle || "",
//       description: page.description || "",
//       category: page.category || "",
//       seo_title: page.seo_title || "",
//       seo_description: page.seo_description || "",
//       hero_image_url: page.hero_image_url || "",
//       content,
//       form_type: page.form_type,
//       status: page.status,
//       sort_order: page.sort_order,
//     });
//     setFeaturesText(Array.isArray(content.features) ? (content.features as string[]).join("\n") : "");
//     setFaqsText(
//       Array.isArray(content.faqs)
//         ? (content.faqs as { q: string; a: string }[]).map((f) => `${f.q}|||${f.a}`).join("\n")
//         : "",
//     );
//     setPageOpen(true);
//   };

//   const savePage = async (e: FormEvent) => {
//     e.preventDefault();
//     setSaving(true);

//     const slug = pageForm.slug || slugify(pageForm.title);
//     const route =
//       pageForm.route ||
//       (slug === "call-consultation"
//         ? "/consultation"
//         : pageForm.page_type === "report"
//           ? `/reports/${slug}`
//           : `/services/${slug}`);

//     const faqs = faqsText
//       .split("\n")
//       .map((line) => line.trim())
//       .filter(Boolean)
//       .map((line) => {
//         const [q, a] = line.split("|||");
//         return { q: (q || "").trim(), a: (a || "").trim() };
//       })
//       .filter((f) => f.q);

//     const payload = {
//       slug,
//       route,
//       page_type: pageForm.page_type,
//       title: pageForm.title,
//       subtitle: pageForm.subtitle || null,
//       description: pageForm.description || null,
//       category: pageForm.category || null,
//       seo_title: pageForm.seo_title || pageForm.title,
//       seo_description: pageForm.seo_description || pageForm.description,
//       hero_image_url: pageForm.hero_image_url || null,
//       content: {
//         ...pageForm.content,
//         features: featuresText.split("\n").map((l) => l.trim()).filter(Boolean),
//         faqs,
//       },
//       form_type: pageForm.form_type,
//       status: pageForm.status,
//       sort_order: Number(pageForm.sort_order) || 0,
//       published_at: pageForm.status === "published" ? new Date().toISOString() : null,
//     };

//     const { error } = editingPage
//       ? await supabase.from("service_pages").update(payload).eq("id", editingPage.id)
//       : await supabase.from("service_pages").insert(payload);

//     setSaving(false);
//     if (error) toast.error(error.message);
//     else {
//       toast.success(editingPage ? "Page updated" : "Page created");
//       setPageOpen(false);
//       reloadPages();
//     }
//   };

//   const savePackage = async (e: FormEvent) => {
//     e.preventDefault();
//     if (!pkgForm.page_id) {
//       toast.error("Select a page for this package");
//       return;
//     }
//     setSaving(true);

//     const payload = {
//       page_id: pkgForm.page_id,
//       name: pkgForm.name,
//       tag: pkgForm.tag || null,
//       description: pkgForm.description || null,
//       price: Number(pkgForm.price),
//       original_price: pkgForm.original_price ? Number(pkgForm.original_price) : null,
//       gst_rate: Number(pkgForm.gst_rate) || 18,
//       features: pkgFeaturesText.split("\n").map((l) => l.trim()).filter(Boolean),
//       excluded: [],
//       form_type: pkgForm.form_type || null,
//       payment_service_title: pkgForm.payment_service_title || pkgForm.name,
//       is_popular: pkgForm.is_popular,
//       is_active: pkgForm.is_active,
//       sort_order: Number(pkgForm.sort_order) || 0,
//     };

//     const { error } = editingPkg
//       ? await supabase.from("service_packages").update(payload).eq("id", editingPkg.id)
//       : await supabase.from("service_packages").insert(payload);

//     setSaving(false);
//     if (error) toast.error(error.message);
//     else {
//       toast.success(editingPkg ? "Package updated" : "Package created");
//       setPkgOpen(false);
//       reloadPackages();
//     }
//   };

//   const syncCatalogForPage = async (page: ServicePage) => {
//     const catalog = getCatalogSyncForSlug(page.slug);
//     if (!catalog) {
//       toast.error("No code catalog defined for this page slug");
//       return;
//     }

//     setSaving(true);
//     const { hub } = catalog;

//     const { error: pageError } = await supabase
//       .from("service_pages")
//       .update({
//         route: hub.route,
//         title: hub.title,
//         subtitle: hub.subtitle,
//         description: hub.subtitle,
//         category: hub.category,
//         form_type: hub.packages[0]?.formType || page.form_type,
//         updated_at: new Date().toISOString(),
//       })
//       .eq("id", page.id);

//     if (pageError) {
//       setSaving(false);
//       toast.error(pageError.message);
//       return;
//     }

//     const pagePackages = packagesByPage.get(page.id) || [];
//     let synced = 0;

//     for (let i = 0; i < hub.packages.length; i++) {
//       const pkg = hub.packages[i];
//       const payload = catalogPackageToAdminPayload(page.id, pkg, i + 1);
//       const existing = pagePackages.find(
//         (p) =>
//           (p.payment_service_title || "").toLowerCase() === pkg.serviceTitle.toLowerCase() ||
//           p.name.toLowerCase() === pkg.name.toLowerCase(),
//       );

//       const { error } = existing
//         ? await supabase.from("service_packages").update(payload).eq("id", existing.id)
//         : await supabase.from("service_packages").insert(payload);

//       if (error) {
//         setSaving(false);
//         toast.error(error.message);
//         return;
//       }
//       synced += 1;

//       await supabase
//         .from("services")
//         .update({ price: pkg.price, is_active: true, category: hub.category })
//         .ilike("title", pkg.serviceTitle);
//     }

//     setSaving(false);
//     toast.success(`Synced ${hub.title}: route, ${synced} package(s), and service catalog prices`);
//     reloadPages();
//     reloadPackages();
//   };

//   const togglePublish = async (page: ServicePage) => {
//     const nextStatus = page.status === "published" ? "draft" : "published";
//     const { error } = await supabase
//       .from("service_pages")
//       .update({
//         status: nextStatus,
//         published_at: nextStatus === "published" ? new Date().toISOString() : null,
//       })
//       .eq("id", page.id);

//     if (error) toast.error(error.message);
//     else {
//       toast.success(nextStatus === "published" ? "Page published" : "Page unpublished");
//       reloadPages();
//     }
//   };

//   return (
//     <AdminPage
//       title="Services & Packages"
//       description="Create service pages, manage pricing packages, checkout forms, and publish to the live site."
//       loading={pagesLoading || packagesLoading}
//       empty={!pages.length}
//       emptyMessage='No service pages yet. Create your first page to get started.'
//       actions={
//         <div className="flex gap-2">
//           <Dialog
//             open={pageOpen}
//             onOpenChange={(open) => {
//               setPageOpen(open);
//               if (!open) setEditingPage(null);
//             }}
//           >
//             <DialogTrigger asChild>
//               <Button
//                 onClick={() => {
//                   setEditingPage(null);
//                   setPageForm(blankPage);
//                   setFeaturesText("");
//                   setFaqsText("");
//                 }}
//               >
//                 <Plus className="w-4 h-4 mr-2" />
//                 New Page
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle>{editingPage ? "Edit" : "New"} Service Page</DialogTitle>
//               </DialogHeader>
//               <form onSubmit={savePage} className="space-y-3">
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <Label>Title</Label>
//                     <Input
//                       value={pageForm.title}
//                       onChange={(e) => {
//                         const title = e.target.value;
//                         setPageForm({
//                           ...pageForm,
//                           title,
//                           slug: editingPage ? pageForm.slug : slugify(title),
//                           route: editingPage
//                             ? pageForm.route
//                             : pageForm.page_type === "report"
//                               ? `/reports/${slugify(title)}`
//                               : `/services/${slugify(title)}`,
//                         });
//                       }}
//                       required
//                     />
//                   </div>
//                   <div>
//                     <Label>Category</Label>
//                     <Input
//                       value={pageForm.category}
//                       onChange={(e) => setPageForm({ ...pageForm, category: e.target.value })}
//                     />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <Label>Slug</Label>
//                     <Input
//                       value={pageForm.slug}
//                       onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })}
//                       required
//                     />
//                   </div>
//                   <div>
//                     <Label>Route</Label>
//                     <Input
//                       value={pageForm.route}
//                       onChange={(e) => setPageForm({ ...pageForm, route: e.target.value })}
//                       required
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <Label>Subtitle</Label>
//                   <Input
//                     value={pageForm.subtitle}
//                     onChange={(e) => setPageForm({ ...pageForm, subtitle: e.target.value })}
//                   />
//                 </div>
//                 <div>
//                   <Label>Description</Label>
//                   <Textarea
//                     value={pageForm.description}
//                     onChange={(e) => setPageForm({ ...pageForm, description: e.target.value })}
//                     rows={3}
//                   />
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <Label>Page Type</Label>
//                     <Select
//                       value={pageForm.page_type}
//                       onValueChange={(v) => setPageForm({ ...pageForm, page_type: v })}
//                     >
//                       <SelectTrigger><SelectValue /></SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="service">Service</SelectItem>
//                         <SelectItem value="report">Report</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div>
//                     <Label>Checkout Form</Label>
//                     <Select
//                       value={pageForm.form_type}
//                       onValueChange={(v) => setPageForm({ ...pageForm, form_type: v })}
//                     >
//                       <SelectTrigger><SelectValue /></SelectTrigger>
//                       <SelectContent>
//                         {FORM_TYPES.map((ft) => (
//                           <SelectItem key={ft} value={ft}>{ft}</SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//                 <div>
//                   <Label>Features (one per line)</Label>
//                   <Textarea value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} rows={4} />
//                 </div>
//                 <div>
//                   <Label>FAQs (format: Question|||Answer, one per line)</Label>
//                   <Textarea value={faqsText} onChange={(e) => setFaqsText(e.target.value)} rows={4} />
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <Label>SEO Title</Label>
//                     <Input
//                       value={pageForm.seo_title}
//                       onChange={(e) => setPageForm({ ...pageForm, seo_title: e.target.value })}
//                     />
//                   </div>
//                   <div>
//                     <Label>Sort Order</Label>
//                     <Input
//                       type="number"
//                       value={pageForm.sort_order}
//                       onChange={(e) => setPageForm({ ...pageForm, sort_order: Number(e.target.value) })}
//                     />
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Switch
//                     checked={pageForm.status === "published"}
//                     onCheckedChange={(checked) =>
//                       setPageForm({ ...pageForm, status: checked ? "published" : "draft" })
//                     }
//                   />
//                   <Label>Publish immediately</Label>
//                 </div>
//                 <DialogFooter>
//                   <Button type="submit" disabled={saving}>
//                     {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
//                     Save Page
//                   </Button>
//                 </DialogFooter>
//               </form>
//             </DialogContent>
//           </Dialog>

//           <Dialog
//             open={pkgOpen}
//             onOpenChange={(open) => {
//               setPkgOpen(open);
//               if (!open) setEditingPkg(null);
//             }}
//           >
//             <DialogTrigger asChild>
//               <Button
//                 variant="outline"
//                 disabled={!pages.length}
//                 onClick={() => {
//                   setEditingPkg(null);
//                   setPkgForm({ ...blankPackage, page_id: pages[0]?.id || "" });
//                   setPkgFeaturesText("");
//                 }}
//               >
//                 <Plus className="w-4 h-4 mr-2" />
//                 New Package
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle>{editingPkg ? "Edit" : "New"} Package</DialogTitle>
//               </DialogHeader>
//               <form onSubmit={savePackage} className="space-y-3">
//                 <div>
//                   <Label>Service Page</Label>
//                   <Select value={pkgForm.page_id} onValueChange={(v) => setPkgForm({ ...pkgForm, page_id: v })}>
//                     <SelectTrigger><SelectValue placeholder="Select page" /></SelectTrigger>
//                     <SelectContent>
//                       {pages.map((p) => (
//                         <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div>
//                   <Label>Package Name</Label>
//                   <Input
//                     value={pkgForm.name}
//                     onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
//                     required
//                   />
//                 </div>
//                 <div>
//                   <Label>Tag / Badge</Label>
//                   <Input value={pkgForm.tag} onChange={(e) => setPkgForm({ ...pkgForm, tag: e.target.value })} />
//                 </div>
//                 <div>
//                   <Label>Payment Service Title</Label>
//                   <Input
//                     value={pkgForm.payment_service_title}
//                     onChange={(e) => setPkgForm({ ...pkgForm, payment_service_title: e.target.value })}
//                     placeholder="Exact title sent to checkout"
//                   />
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <Label>Price (₹)</Label>
//                     <Input
//                       type="number"
//                       value={pkgForm.price}
//                       onChange={(e) => setPkgForm({ ...pkgForm, price: Number(e.target.value) })}
//                       required
//                     />
//                   </div>
//                   <div>
//                     <Label>Original Price</Label>
//                     <Input
//                       type="number"
//                       value={pkgForm.original_price}
//                       onChange={(e) => setPkgForm({ ...pkgForm, original_price: Number(e.target.value) })}
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <Label>Checkout Form Override</Label>
//                   <Select
//                     value={pkgForm.form_type || pageForm.form_type}
//                     onValueChange={(v) => setPkgForm({ ...pkgForm, form_type: v })}
//                   >
//                     <SelectTrigger><SelectValue placeholder="Use page default" /></SelectTrigger>
//                     <SelectContent>
//                       {FORM_TYPES.map((ft) => (
//                         <SelectItem key={ft} value={ft}>{ft}</SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div>
//                   <Label>Features (one per line)</Label>
//                   <Textarea
//                     value={pkgFeaturesText}
//                     onChange={(e) => setPkgFeaturesText(e.target.value)}
//                     rows={4}
//                   />
//                 </div>
//                 <div className="flex items-center gap-4">
//                   <div className="flex items-center gap-2">
//                     <Switch
//                       checked={pkgForm.is_popular}
//                       onCheckedChange={(v) => setPkgForm({ ...pkgForm, is_popular: v })}
//                     />
//                     <Label>Popular</Label>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <Switch
//                       checked={pkgForm.is_active}
//                       onCheckedChange={(v) => setPkgForm({ ...pkgForm, is_active: v })}
//                     />
//                     <Label>Active</Label>
//                   </div>
//                 </div>
//                 <DialogFooter>
//                   <Button type="submit" disabled={saving}>
//                     {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
//                     Save Package
//                   </Button>
//                 </DialogFooter>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>
//       }
//     >
//       <Tabs defaultValue="pages">
//         <TabsList>
//           <TabsTrigger value="pages"><FileText className="w-4 h-4 mr-2" />Pages</TabsTrigger>
//           <TabsTrigger value="packages"><Package className="w-4 h-4 mr-2" />Packages</TabsTrigger>
//         </TabsList>

//         <TabsContent value="pages" className="space-y-3 mt-4">
//           {pages.map((page) => (
//             <div key={page.id} className="border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//               <div>
//                 <div className="flex items-center gap-2 flex-wrap">
//                   <p className="font-semibold">{page.title}</p>
//                   <Badge variant={page.status === "published" ? "default" : "secondary"}>
//                     {page.status}
//                   </Badge>
//                   <Badge variant="outline">{page.page_type}</Badge>
//                 </div>
//                 <p className="text-sm text-muted-foreground mt-1">
//                   {page.route} · {page.category || "Uncategorized"} · Form: {page.form_type}
//                 </p>
//                 <p className="text-xs text-muted-foreground mt-1">
//                   {(packagesByPage.get(page.id) || []).length} package(s)
//                 </p>
//               </div>
//               <div className="flex items-center gap-2 flex-wrap">
//                 {getCatalogSyncForSlug(page.slug) && (
//                   <Button size="sm" variant="secondary" disabled={saving} onClick={() => syncCatalogForPage(page)}>
//                     <Package className="w-4 h-4 mr-1" />
//                     Sync Catalog
//                   </Button>
//                 )}
//                 <Button size="sm" variant="outline" onClick={() => togglePublish(page)}>
//                   <Globe className="w-4 h-4 mr-1" />
//                   {page.status === "published" ? "Unpublish" : "Publish"}
//                 </Button>
//                 <Button size="icon" variant="outline" onClick={() => openEditPage(page)}>
//                   <Pencil className="w-4 h-4" />
//                 </Button>
//                 <Button
//                   size="icon"
//                   variant="outline"
//                   onClick={async () => {
//                     if (!confirm("Delete this page and all its packages?")) return;
//                     await supabase.from("service_pages").delete().eq("id", page.id);
//                     reloadPages();
//                     reloadPackages();
//                   }}
//                 >
//                   <Trash2 className="w-4 h-4" />
//                 </Button>
//               </div>
//             </div>
//           ))}
//         </TabsContent>

//         <TabsContent value="packages" className="space-y-3 mt-4">
//           {packages.map((pkg) => {
//             const page = pages.find((p) => p.id === pkg.page_id);
//             return (
//               <div key={pkg.id} className="border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//                 <div>
//                   <div className="flex items-center gap-2 flex-wrap">
//                     <p className="font-semibold">{pkg.name}</p>
//                     {pkg.is_popular && <Badge>Popular</Badge>}
//                     {!pkg.is_active && <Badge variant="secondary">Inactive</Badge>}
//                   </div>
//                   <p className="text-sm text-muted-foreground">
//                     {page?.title || "Unknown page"} · {formatINR(Number(pkg.price))}
//                     {pkg.original_price ? ` (was ${formatINR(Number(pkg.original_price))})` : ""}
//                   </p>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Button
//                     size="icon"
//                     variant="outline"
//                     onClick={() => {
//                       setEditingPkg(pkg);
//                       setPkgForm({
//                         page_id: pkg.page_id,
//                         name: pkg.name,
//                         tag: pkg.tag || "",
//                         description: pkg.description || "",
//                         price: Number(pkg.price),
//                         original_price: Number(pkg.original_price || 0),
//                         gst_rate: Number(pkg.gst_rate),
//                         features: pkg.features || [],
//                         excluded: pkg.excluded || [],
//                         form_type: pkg.form_type || "",
//                         payment_service_title: pkg.payment_service_title || "",
//                         is_popular: pkg.is_popular,
//                         is_active: pkg.is_active,
//                         sort_order: pkg.sort_order,
//                       });
//                       setPkgFeaturesText((pkg.features || []).join("\n"));
//                       setPkgOpen(true);
//                     }}
//                   >
//                     <Pencil className="w-4 h-4" />
//                   </Button>
//                   <Button
//                     size="icon"
//                     variant="outline"
//                     onClick={async () => {
//                       if (!confirm("Delete package?")) return;
//                       await supabase.from("service_packages").delete().eq("id", pkg.id);
//                       reloadPackages();
//                     }}
//                   >
//                     <Trash2 className="w-4 h-4" />
//                   </Button>
//                 </div>
//               </div>
//             );
//           })}
//         </TabsContent>
//       </Tabs>
//     </AdminPage>
//   );
// }

// import { useEffect, useMemo, useState, type FormEvent } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import { AdminPage } from "@/components/admin/AdminPage";
// import { useAdminTable } from "@/hooks/useAdminData";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import { Switch } from "@/components/ui/switch";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { ConfirmLiveUpdateDialog } from "@/components/admin/ConfirmLiveUpdateDialog";
// import { toast } from "sonner";
// import { Loader2, Plus, Pencil, Trash2, Globe, FileText, Package } from "lucide-react";
// import { formatINR } from "@/config/pricing";
// import {
//   catalogPackageToAdminPayload,
//   getCatalogSyncForSlug,
// } from "@/data/adminCatalogSync";

// type ServicePage = {
//   id: string;
//   slug: string;
//   route: string;
//   page_type: string;
//   title: string;
//   subtitle: string | null;
//   description: string | null;
//   category: string | null;
//   seo_title: string | null;
//   seo_description: string | null;
//   hero_image_url: string | null;
//   content: Record<string, unknown>;
//   form_type: string;
//   status: "draft" | "published";
//   sort_order: number;
//   published_at: string | null;
// };

// type ServicePackage = {
//   id: string;
//   page_id: string;
//   name: string;
//   tag: string | null;
//   description: string | null;
//   price: number;
//   original_price: number | null;
//   gst_rate: number;
//   features: string[];
//   excluded: string[];
//   form_type: string | null;
//   payment_service_title: string | null;
//   is_popular: boolean;
//   is_active: boolean;
//   sort_order: number;
// };

// const blankPage = {
//   slug: "",
//   route: "",
//   page_type: "service",
//   title: "",
//   subtitle: "",
//   description: "",
//   category: "",
//   seo_title: "",
//   seo_description: "",
//   hero_image_url: "",
//   content: { features: [] as string[], faqs: [] as { q: string; a: string }[] },
//   form_type: "default",
//   status: "draft" as const,
//   sort_order: 0,
// };

// const blankPackage = {
//   page_id: "",
//   name: "",
//   tag: "",
//   description: "",
//   price: 0,
//   original_price: 0,
//   gst_rate: 18,
//   features: [] as string[],
//   excluded: [] as string[],
//   form_type: "",
//   payment_service_title: "",
//   is_popular: false,
//   is_active: true,
//   sort_order: 0,
// };

// const FORM_TYPES = [
//   "default",
//   "kundali",
//   "kundali-multi",
//   "consultation",
//   "name-correction",
//   "name-correction-couple",
//   "name-check",
//   "couple",
//   "pyaar-shastra",
//   "lucky-vehicle",
//   "lucky-vehicle-color",
//   "lucky-vehicle-date",
//   "lucky-mobile",
//   "lucky-flat",
//   "relationship-analysis",
//   "business-brand",
//   "business-dates",
//   "business-property",
//   "business-partner",
//   "office-vastu",
// ];

// function slugify(value: string) {
//   return value
//     .toLowerCase()
//     .trim()
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/^-+|-+$/g, "");
// }

// export default function ServicePagesModule() {
//   const { rows: pages, loading: pagesLoading, reload: reloadPages } = useAdminTable<ServicePage>(
//     "service_pages",
//     "sort_order",
//     true,
//   );
//   const { rows: packages, loading: packagesLoading, reload: reloadPackages } = useAdminTable<ServicePackage>(
//     "service_packages",
//     "sort_order",
//     true,
//   );

//   const [pageOpen, setPageOpen] = useState(false);
//   const [pkgOpen, setPkgOpen] = useState(false);
//   const [editingPage, setEditingPage] = useState<ServicePage | null>(null);
//   const [editingPkg, setEditingPkg] = useState<ServicePackage | null>(null);
//   const [pageForm, setPageForm] = useState(blankPage);
//   const [pkgForm, setPkgForm] = useState(blankPackage);
//   const [featuresText, setFeaturesText] = useState("");
//   const [faqsText, setFaqsText] = useState("");
//   const [pkgFeaturesText, setPkgFeaturesText] = useState("");
//   const [saving, setSaving] = useState(false);

//   // Live-update confirmation state — one flag/target per action that writes
//   // directly to live site data. Each dialog calls the existing, unchanged
//   // handler on confirm; nothing about the handlers themselves changes.
//   const [showPageSaveConfirm, setShowPageSaveConfirm] = useState(false);
//   const [showPkgSaveConfirm, setShowPkgSaveConfirm] = useState(false);
//   const [publishTarget, setPublishTarget] = useState<ServicePage | null>(null);
//   const [syncTarget, setSyncTarget] = useState<ServicePage | null>(null);
//   const [deletePageTarget, setDeletePageTarget] = useState<ServicePage | null>(null);
//   const [deletePkgTarget, setDeletePkgTarget] = useState<ServicePackage | null>(null);
//   const [deletingPage, setDeletingPage] = useState(false);
//   const [deletingPkg, setDeletingPkg] = useState(false);

//   useEffect(() => {
//     if (pages.length && !pkgForm.page_id) {
//       setPkgForm((prev) => ({ ...prev, page_id: pages[0].id }));
//     }
//   }, [pages, pkgForm.page_id]);

//   const packagesByPage = useMemo(() => {
//     const map = new Map<string, ServicePackage[]>();
//     for (const pkg of packages) {
//       const list = map.get(pkg.page_id) || [];
//       list.push(pkg);
//       map.set(pkg.page_id, list);
//     }
//     return map;
//   }, [packages]);

//   const openEditPage = (page: ServicePage) => {
//     setEditingPage(page);
//     const content = page.content || {};
//     setPageForm({
//       slug: page.slug,
//       route: page.route,
//       page_type: page.page_type,
//       title: page.title,
//       subtitle: page.subtitle || "",
//       description: page.description || "",
//       category: page.category || "",
//       seo_title: page.seo_title || "",
//       seo_description: page.seo_description || "",
//       hero_image_url: page.hero_image_url || "",
//       content,
//       form_type: page.form_type,
//       status: page.status,
//       sort_order: page.sort_order,
//     });
//     setFeaturesText(Array.isArray(content.features) ? (content.features as string[]).join("\n") : "");
//     setFaqsText(
//       Array.isArray(content.faqs)
//         ? (content.faqs as { q: string; a: string }[]).map((f) => `${f.q}|||${f.a}`).join("\n")
//         : "",
//     );
//     setPageOpen(true);
//   };

//   // Step 1: form submit — HTML5 "required" validation has already run by
//   // the time this fires. We just ask for confirmation before writing.
//   const handlePageSubmit = (e: FormEvent) => {
//     e.preventDefault();
//     setShowPageSaveConfirm(true);
//   };

//   // Step 2: identical to the original `savePage` body — only the trigger changed.
//   const performSavePage = async () => {
//     setSaving(true);

//     const slug = pageForm.slug || slugify(pageForm.title);
//     const route =
//       pageForm.route ||
//       (slug === "call-consultation"
//         ? "/consultation"
//         : pageForm.page_type === "report"
//           ? `/reports/${slug}`
//           : `/services/${slug}`);

//     const faqs = faqsText
//       .split("\n")
//       .map((line) => line.trim())
//       .filter(Boolean)
//       .map((line) => {
//         const [q, a] = line.split("|||");
//         return { q: (q || "").trim(), a: (a || "").trim() };
//       })
//       .filter((f) => f.q);

//     const payload = {
//       slug,
//       route,
//       page_type: pageForm.page_type,
//       title: pageForm.title,
//       subtitle: pageForm.subtitle || null,
//       description: pageForm.description || null,
//       category: pageForm.category || null,
//       seo_title: pageForm.seo_title || pageForm.title,
//       seo_description: pageForm.seo_description || pageForm.description,
//       hero_image_url: pageForm.hero_image_url || null,
//       content: {
//         ...pageForm.content,
//         features: featuresText.split("\n").map((l) => l.trim()).filter(Boolean),
//         faqs,
//       },
//       form_type: pageForm.form_type,
//       status: pageForm.status,
//       sort_order: Number(pageForm.sort_order) || 0,
//       published_at: pageForm.status === "published" ? new Date().toISOString() : null,
//     };

//     const { error } = editingPage
//       ? await supabase.from("service_pages").update(payload).eq("id", editingPage.id)
//       : await supabase.from("service_pages").insert(payload);

//     setSaving(false);
//     setShowPageSaveConfirm(false);
//     if (error) toast.error(error.message);
//     else {
//       toast.success(editingPage ? "Page updated" : "Page created");
//       setPageOpen(false);
//       reloadPages();
//     }
//   };

//   // Step 1: form submit -> confirm
//   const handlePkgSubmit = (e: FormEvent) => {
//     e.preventDefault();
//     if (!pkgForm.page_id) {
//       toast.error("Select a page for this package");
//       return;
//     }
//     setShowPkgSaveConfirm(true);
//   };

//   // Step 2: identical to the original `savePackage` body.
//   const performSavePackage = async () => {
//     setSaving(true);

//     const payload = {
//       page_id: pkgForm.page_id,
//       name: pkgForm.name,
//       tag: pkgForm.tag || null,
//       description: pkgForm.description || null,
//       price: Number(pkgForm.price),
//       original_price: pkgForm.original_price ? Number(pkgForm.original_price) : null,
//       gst_rate: Number(pkgForm.gst_rate) || 18,
//       features: pkgFeaturesText.split("\n").map((l) => l.trim()).filter(Boolean),
//       excluded: [],
//       form_type: pkgForm.form_type || null,
//       payment_service_title: pkgForm.payment_service_title || pkgForm.name,
//       is_popular: pkgForm.is_popular,
//       is_active: pkgForm.is_active,
//       sort_order: Number(pkgForm.sort_order) || 0,
//     };

//     const { error } = editingPkg
//       ? await supabase.from("service_packages").update(payload).eq("id", editingPkg.id)
//       : await supabase.from("service_packages").insert(payload);

//     setSaving(false);
//     setShowPkgSaveConfirm(false);
//     if (error) toast.error(error.message);
//     else {
//       toast.success(editingPkg ? "Package updated" : "Package created");
//       setPkgOpen(false);
//       reloadPackages();
//     }
//   };

//   // Unchanged business logic — now only called after the admin confirms via syncTarget.
//   const syncCatalogForPage = async (page: ServicePage) => {
//     const catalog = getCatalogSyncForSlug(page.slug);
//     if (!catalog) {
//       toast.error("No code catalog defined for this page slug");
//       return;
//     }

//     setSaving(true);
//     const { hub } = catalog;

//     const { error: pageError } = await supabase
//       .from("service_pages")
//       .update({
//         route: hub.route,
//         title: hub.title,
//         subtitle: hub.subtitle,
//         description: hub.subtitle,
//         category: hub.category,
//         form_type: hub.packages[0]?.formType || page.form_type,
//         updated_at: new Date().toISOString(),
//       })
//       .eq("id", page.id);

//     if (pageError) {
//       setSaving(false);
//       setSyncTarget(null);
//       toast.error(pageError.message);
//       return;
//     }

//     const pagePackages = packagesByPage.get(page.id) || [];
//     let synced = 0;

//     for (let i = 0; i < hub.packages.length; i++) {
//       const pkg = hub.packages[i];
//       const payload = catalogPackageToAdminPayload(page.id, pkg, i + 1);
//       const existing = pagePackages.find(
//         (p) =>
//           (p.payment_service_title || "").toLowerCase() === pkg.serviceTitle.toLowerCase() ||
//           p.name.toLowerCase() === pkg.name.toLowerCase(),
//       );

//       const { error } = existing
//         ? await supabase.from("service_packages").update(payload).eq("id", existing.id)
//         : await supabase.from("service_packages").insert(payload);

//       if (error) {
//         setSaving(false);
//         setSyncTarget(null);
//         toast.error(error.message);
//         return;
//       }
//       synced += 1;

//       await supabase
//         .from("services")
//         .update({ price: pkg.price, is_active: true, category: hub.category })
//         .ilike("title", pkg.serviceTitle);
//     }

//     setSaving(false);
//     setSyncTarget(null);
//     toast.success(`Synced ${hub.title}: route, ${synced} package(s), and service catalog prices`);
//     reloadPages();
//     reloadPackages();
//   };

//   // Unchanged business logic — now only called after the admin confirms via publishTarget.
//   const togglePublish = async (page: ServicePage) => {
//     const nextStatus = page.status === "published" ? "draft" : "published";
//     const { error } = await supabase
//       .from("service_pages")
//       .update({
//         status: nextStatus,
//         published_at: nextStatus === "published" ? new Date().toISOString() : null,
//       })
//       .eq("id", page.id);

//     setPublishTarget(null);
//     if (error) toast.error(error.message);
//     else {
//       toast.success(nextStatus === "published" ? "Page published" : "Page unpublished");
//       reloadPages();
//     }
//   };

//   const performDeletePage = async () => {
//     if (!deletePageTarget) return;
//     setDeletingPage(true);
//     await supabase.from("service_pages").delete().eq("id", deletePageTarget.id);
//     setDeletingPage(false);
//     setDeletePageTarget(null);
//     reloadPages();
//     reloadPackages();
//   };

//   const performDeletePkg = async () => {
//     if (!deletePkgTarget) return;
//     setDeletingPkg(true);
//     await supabase.from("service_packages").delete().eq("id", deletePkgTarget.id);
//     setDeletingPkg(false);
//     setDeletePkgTarget(null);
//     reloadPackages();
//   };

//   return (
//     <AdminPage
//       title="Services & Packages"
//       description="Create service pages, manage pricing packages, checkout forms, and publish to the live site."
//       loading={pagesLoading || packagesLoading}
//       empty={!pages.length}
//       emptyMessage='No service pages yet. Create your first page to get started.'
//       actions={
//         <div className="flex gap-2">
//           <Dialog
//             open={pageOpen}
//             onOpenChange={(open) => {
//               setPageOpen(open);
//               if (!open) setEditingPage(null);
//             }}
//           >
//             <DialogTrigger asChild>
//               <Button
//                 onClick={() => {
//                   setEditingPage(null);
//                   setPageForm(blankPage);
//                   setFeaturesText("");
//                   setFaqsText("");
//                 }}
//               >
//                 <Plus className="w-4 h-4 mr-2" />
//                 New Page
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle>{editingPage ? "Edit" : "New"} Service Page</DialogTitle>
//               </DialogHeader>
//               <form onSubmit={handlePageSubmit} className="space-y-3">
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <Label>Title</Label>
//                     <Input
//                       value={pageForm.title}
//                       onChange={(e) => {
//                         const title = e.target.value;
//                         setPageForm({
//                           ...pageForm,
//                           title,
//                           slug: editingPage ? pageForm.slug : slugify(title),
//                           route: editingPage
//                             ? pageForm.route
//                             : pageForm.page_type === "report"
//                               ? `/reports/${slugify(title)}`
//                               : `/services/${slugify(title)}`,
//                         });
//                       }}
//                       required
//                     />
//                   </div>
//                   <div>
//                     <Label>Category</Label>
//                     <Input
//                       value={pageForm.category}
//                       onChange={(e) => setPageForm({ ...pageForm, category: e.target.value })}
//                     />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <Label>Slug</Label>
//                     <Input
//                       value={pageForm.slug}
//                       onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })}
//                       required
//                     />
//                   </div>
//                   <div>
//                     <Label>Route</Label>
//                     <Input
//                       value={pageForm.route}
//                       onChange={(e) => setPageForm({ ...pageForm, route: e.target.value })}
//                       required
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <Label>Subtitle</Label>
//                   <Input
//                     value={pageForm.subtitle}
//                     onChange={(e) => setPageForm({ ...pageForm, subtitle: e.target.value })}
//                   />
//                 </div>
//                 <div>
//                   <Label>Description</Label>
//                   <Textarea
//                     value={pageForm.description}
//                     onChange={(e) => setPageForm({ ...pageForm, description: e.target.value })}
//                     rows={3}
//                   />
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <Label>Page Type</Label>
//                     <Select
//                       value={pageForm.page_type}
//                       onValueChange={(v) => setPageForm({ ...pageForm, page_type: v })}
//                     >
//                       <SelectTrigger><SelectValue /></SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="service">Service</SelectItem>
//                         <SelectItem value="report">Report</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div>
//                     <Label>Checkout Form</Label>
//                     <Select
//                       value={pageForm.form_type}
//                       onValueChange={(v) => setPageForm({ ...pageForm, form_type: v })}
//                     >
//                       <SelectTrigger><SelectValue /></SelectTrigger>
//                       <SelectContent>
//                         {FORM_TYPES.map((ft) => (
//                           <SelectItem key={ft} value={ft}>{ft}</SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//                 <div>
//                   <Label>Features (one per line)</Label>
//                   <Textarea value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} rows={4} />
//                 </div>
//                 <div>
//                   <Label>FAQs (format: Question|||Answer, one per line)</Label>
//                   <Textarea value={faqsText} onChange={(e) => setFaqsText(e.target.value)} rows={4} />
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <Label>SEO Title</Label>
//                     <Input
//                       value={pageForm.seo_title}
//                       onChange={(e) => setPageForm({ ...pageForm, seo_title: e.target.value })}
//                     />
//                   </div>
//                   <div>
//                     <Label>Sort Order</Label>
//                     <Input
//                       type="number"
//                       value={pageForm.sort_order}
//                       onChange={(e) => setPageForm({ ...pageForm, sort_order: Number(e.target.value) })}
//                     />
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Switch
//                     checked={pageForm.status === "published"}
//                     onCheckedChange={(checked) =>
//                       setPageForm({ ...pageForm, status: checked ? "published" : "draft" })
//                     }
//                   />
//                   <Label>Publish immediately</Label>
//                 </div>
//                 <DialogFooter>
//                   <Button type="submit" disabled={saving}>
//                     {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
//                     Save Page
//                   </Button>
//                 </DialogFooter>
//               </form>
//             </DialogContent>
//           </Dialog>

//           <Dialog
//             open={pkgOpen}
//             onOpenChange={(open) => {
//               setPkgOpen(open);
//               if (!open) setEditingPkg(null);
//             }}
//           >
//             <DialogTrigger asChild>
//               <Button
//                 variant="outline"
//                 disabled={!pages.length}
//                 onClick={() => {
//                   setEditingPkg(null);
//                   setPkgForm({ ...blankPackage, page_id: pages[0]?.id || "" });
//                   setPkgFeaturesText("");
//                 }}
//               >
//                 <Plus className="w-4 h-4 mr-2" />
//                 New Package
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle>{editingPkg ? "Edit" : "New"} Package</DialogTitle>
//               </DialogHeader>
//               <form onSubmit={handlePkgSubmit} className="space-y-3">
//                 <div>
//                   <Label>Service Page</Label>
//                   <Select value={pkgForm.page_id} onValueChange={(v) => setPkgForm({ ...pkgForm, page_id: v })}>
//                     <SelectTrigger><SelectValue placeholder="Select page" /></SelectTrigger>
//                     <SelectContent>
//                       {pages.map((p) => (
//                         <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div>
//                   <Label>Package Name</Label>
//                   <Input
//                     value={pkgForm.name}
//                     onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
//                     required
//                   />
//                 </div>
//                 <div>
//                   <Label>Tag / Badge</Label>
//                   <Input value={pkgForm.tag} onChange={(e) => setPkgForm({ ...pkgForm, tag: e.target.value })} />
//                 </div>
//                 <div>
//                   <Label>Payment Service Title</Label>
//                   <Input
//                     value={pkgForm.payment_service_title}
//                     onChange={(e) => setPkgForm({ ...pkgForm, payment_service_title: e.target.value })}
//                     placeholder="Exact title sent to checkout"
//                   />
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <Label>Price (₹)</Label>
//                     <Input
//                       type="number"
//                       value={pkgForm.price}
//                       onChange={(e) => setPkgForm({ ...pkgForm, price: Number(e.target.value) })}
//                       required
//                     />
//                   </div>
//                   <div>
//                     <Label>Original Price</Label>
//                     <Input
//                       type="number"
//                       value={pkgForm.original_price}
//                       onChange={(e) => setPkgForm({ ...pkgForm, original_price: Number(e.target.value) })}
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <Label>Checkout Form Override</Label>
//                   <Select
//                     value={pkgForm.form_type || pageForm.form_type}
//                     onValueChange={(v) => setPkgForm({ ...pkgForm, form_type: v })}
//                   >
//                     <SelectTrigger><SelectValue placeholder="Use page default" /></SelectTrigger>
//                     <SelectContent>
//                       {FORM_TYPES.map((ft) => (
//                         <SelectItem key={ft} value={ft}>{ft}</SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div>
//                   <Label>Features (one per line)</Label>
//                   <Textarea
//                     value={pkgFeaturesText}
//                     onChange={(e) => setPkgFeaturesText(e.target.value)}
//                     rows={4}
//                   />
//                 </div>
//                 <div className="flex items-center gap-4">
//                   <div className="flex items-center gap-2">
//                     <Switch
//                       checked={pkgForm.is_popular}
//                       onCheckedChange={(v) => setPkgForm({ ...pkgForm, is_popular: v })}
//                     />
//                     <Label>Popular</Label>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <Switch
//                       checked={pkgForm.is_active}
//                       onCheckedChange={(v) => setPkgForm({ ...pkgForm, is_active: v })}
//                     />
//                     <Label>Active</Label>
//                   </div>
//                 </div>
//                 <DialogFooter>
//                   <Button type="submit" disabled={saving}>
//                     {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
//                     Save Package
//                   </Button>
//                 </DialogFooter>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>
//       }
//     >
//       <Tabs defaultValue="pages">
//         <TabsList>
//           <TabsTrigger value="pages"><FileText className="w-4 h-4 mr-2" />Pages</TabsTrigger>
//           <TabsTrigger value="packages"><Package className="w-4 h-4 mr-2" />Packages</TabsTrigger>
//         </TabsList>

//         <TabsContent value="pages" className="space-y-3 mt-4">
//           {pages.map((page) => (
//             <div key={page.id} className="border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//               <div>
//                 <div className="flex items-center gap-2 flex-wrap">
//                   <p className="font-semibold">{page.title}</p>
//                   <Badge variant={page.status === "published" ? "default" : "secondary"}>
//                     {page.status}
//                   </Badge>
//                   <Badge variant="outline">{page.page_type}</Badge>
//                 </div>
//                 <p className="text-sm text-muted-foreground mt-1">
//                   {page.route} · {page.category || "Uncategorized"} · Form: {page.form_type}
//                 </p>
//                 <p className="text-xs text-muted-foreground mt-1">
//                   {(packagesByPage.get(page.id) || []).length} package(s)
//                 </p>
//               </div>
//               <div className="flex items-center gap-2 flex-wrap">
//                 {getCatalogSyncForSlug(page.slug) && (
//                   <Button size="sm" variant="secondary" disabled={saving} onClick={() => setSyncTarget(page)}>
//                     <Package className="w-4 h-4 mr-1" />
//                     Sync Catalog
//                   </Button>
//                 )}
//                 <Button size="sm" variant="outline" onClick={() => setPublishTarget(page)}>
//                   <Globe className="w-4 h-4 mr-1" />
//                   {page.status === "published" ? "Unpublish" : "Publish"}
//                 </Button>
//                 <Button size="icon" variant="outline" onClick={() => openEditPage(page)}>
//                   <Pencil className="w-4 h-4" />
//                 </Button>
//                 <Button
//                   size="icon"
//                   variant="outline"
//                   onClick={() => setDeletePageTarget(page)}
//                 >
//                   <Trash2 className="w-4 h-4" />
//                 </Button>
//               </div>
//             </div>
//           ))}
//         </TabsContent>

//         <TabsContent value="packages" className="space-y-3 mt-4">
//           {packages.map((pkg) => {
//             const page = pages.find((p) => p.id === pkg.page_id);
//             return (
//               <div key={pkg.id} className="border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//                 <div>
//                   <div className="flex items-center gap-2 flex-wrap">
//                     <p className="font-semibold">{pkg.name}</p>
//                     {pkg.is_popular && <Badge>Popular</Badge>}
//                     {!pkg.is_active && <Badge variant="secondary">Inactive</Badge>}
//                   </div>
//                   <p className="text-sm text-muted-foreground">
//                     {page?.title || "Unknown page"} · {formatINR(Number(pkg.price))}
//                     {pkg.original_price ? ` (was ${formatINR(Number(pkg.original_price))})` : ""}
//                   </p>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Button
//                     size="icon"
//                     variant="outline"
//                     onClick={() => {
//                       setEditingPkg(pkg);
//                       setPkgForm({
//                         page_id: pkg.page_id,
//                         name: pkg.name,
//                         tag: pkg.tag || "",
//                         description: pkg.description || "",
//                         price: Number(pkg.price),
//                         original_price: Number(pkg.original_price || 0),
//                         gst_rate: Number(pkg.gst_rate),
//                         features: pkg.features || [],
//                         excluded: pkg.excluded || [],
//                         form_type: pkg.form_type || "",
//                         payment_service_title: pkg.payment_service_title || "",
//                         is_popular: pkg.is_popular,
//                         is_active: pkg.is_active,
//                         sort_order: pkg.sort_order,
//                       });
//                       setPkgFeaturesText((pkg.features || []).join("\n"));
//                       setPkgOpen(true);
//                     }}
//                   >
//                     <Pencil className="w-4 h-4" />
//                   </Button>
//                   <Button
//                     size="icon"
//                     variant="outline"
//                     onClick={() => setDeletePkgTarget(pkg)}
//                   >
//                     <Trash2 className="w-4 h-4" />
//                   </Button>
//                 </div>
//               </div>
//             );
//           })}
//         </TabsContent>
//       </Tabs>

//       {/* New/Edit Page — live-update confirmation, shown after required-field validation passes */}
//       <ConfirmLiveUpdateDialog
//         open={showPageSaveConfirm}
//         onOpenChange={setShowPageSaveConfirm}
//         onConfirm={performSavePage}
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

//       {/* New/Edit Package — live-update confirmation */}
//       <ConfirmLiveUpdateDialog
//         open={showPkgSaveConfirm}
//         onOpenChange={setShowPkgSaveConfirm}
//         onConfirm={performSavePackage}
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

//       {/* Publish / Unpublish confirmation */}
//       <ConfirmLiveUpdateDialog
//         open={!!publishTarget}
//         onOpenChange={(o) => !o && setPublishTarget(null)}
//         onConfirm={() => publishTarget && togglePublish(publishTarget)}
//         title="Confirm Live Website Update"
//         description={
//           <>
//             <p>
//               {publishTarget?.status === "published"
//                 ? `Unpublishing "${publishTarget?.title}" will immediately remove it from the live website.`
//                 : `Publishing "${publishTarget?.title}" will immediately update the live website.`}
//             </p>
//             <p>Please confirm that you want to continue.</p>
//             <p>This change will be visible to customers immediately.</p>
//           </>
//         }
//         confirmLabel="Confirm & Publish"
//       />

//       {/* Sync Catalog confirmation — overwrites live page + package + service pricing data */}
//       <ConfirmLiveUpdateDialog
//         open={!!syncTarget}
//         onOpenChange={(o) => !o && setSyncTarget(null)}
//         onConfirm={() => syncTarget && syncCatalogForPage(syncTarget)}
//         loading={saving}
//         title="Confirm Live Website Update"
//         description={
//           <>
//             <p>
//               Syncing "{syncTarget?.title}" will immediately update its route, packages, and service
//               catalog prices on the live website.
//             </p>
//             <p>Please confirm that you want to continue.</p>
//             <p>This change will be visible to customers immediately.</p>
//           </>
//         }
//         confirmLabel="Confirm & Publish"
//       />

//       {/* Delete Page confirmation — destructive variant */}
//       <ConfirmLiveUpdateDialog
//         open={!!deletePageTarget}
//         onOpenChange={(o) => !o && setDeletePageTarget(null)}
//         onConfirm={performDeletePage}
//         loading={deletingPage}
//         variant="destructive"
//         title="Delete Service"
//         description={
//           <>
//             <p>
//               "{deletePageTarget?.title}" and all its packages will be removed from the live website.
//             </p>
//             <p>This action may affect customer bookings.</p>
//             <p>Are you sure?</p>
//           </>
//         }
//         confirmLabel="Delete Service"
//       />

//       {/* Delete Package confirmation — destructive variant */}
//       <ConfirmLiveUpdateDialog
//         open={!!deletePkgTarget}
//         onOpenChange={(o) => !o && setDeletePkgTarget(null)}
//         onConfirm={performDeletePkg}
//         loading={deletingPkg}
//         variant="destructive"
//         title="Delete Service"
//         description={
//           <>
//             <p>
//               "{deletePkgTarget?.name}" will be removed from the live website.
//             </p>
//             <p>This action may affect customer bookings.</p>
//             <p>Are you sure?</p>
//           </>
//         }
//         confirmLabel="Delete Service"
//       />
//     </AdminPage>
//   );
// }

// import { useEffect, useMemo, useState, type FormEvent } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import { AdminPage } from "@/components/admin/AdminPage";
// import { useAdminTable } from "@/hooks/useAdminData";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import { Switch } from "@/components/ui/switch";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { ConfirmLiveUpdateDialog } from "@/components/admin/ConfirmLiveUpdateDialog";
// import { toast } from "sonner";
// import { Loader2, Plus, Pencil, Trash2, Globe, FileText, Package } from "lucide-react";
// import { formatINR } from "@/config/pricing";
// import {
//   catalogPackageToAdminPayload,
//   getCatalogSyncForSlug,
// } from "@/data/adminCatalogSync";

// type ServicePage = {
//   id: string;
//   slug: string;
//   route: string;
//   page_type: string;
//   title: string;
//   subtitle: string | null;
//   description: string | null;
//   category: string | null;
//   seo_title: string | null;
//   seo_description: string | null;
//   hero_image_url: string | null;
//   content: Record<string, unknown>;
//   form_type: string;
//   status: "draft" | "published";
//   sort_order: number;
//   published_at: string | null;
// };

// type ServicePackage = {
//   id: string;
//   page_id: string;
//   name: string;
//   tag: string | null;
//   description: string | null;
//   price: number;
//   original_price: number | null;
//   gst_rate: number;
//   features: string[];
//   excluded: string[];
//   form_type: string | null;
//   payment_service_title: string | null;
//   is_popular: boolean;
//   is_active: boolean;
//   sort_order: number;
// };

// const blankPage = {
//   slug: "",
//   route: "",
//   page_type: "service",
//   title: "",
//   subtitle: "",
//   description: "",
//   category: "",
//   seo_title: "",
//   seo_description: "",
//   hero_image_url: "",
//   content: { features: [] as string[], faqs: [] as { q: string; a: string }[] },
//   form_type: "default",
//   status: "draft" as const,
//   sort_order: 0,
// };

// const blankPackage = {
//   page_id: "",
//   name: "",
//   tag: "",
//   description: "",
//   price: 0,
//   original_price: 0,
//   gst_rate: 18,
//   features: [] as string[],
//   excluded: [] as string[],
//   form_type: "",
//   payment_service_title: "",
//   is_popular: false,
//   is_active: true,
//   sort_order: 0,
// };

// const FORM_TYPES = [
//   "default",
//   "kundali",
//   "kundali-multi",
//   "consultation",
//   "name-correction",
//   "name-correction-couple",
//   "name-check",
//   "couple",
//   "pyaar-shastra",
//   "lucky-vehicle",
//   "lucky-vehicle-color",
//   "lucky-vehicle-date",
//   "lucky-mobile",
//   "lucky-flat",
//   "relationship-analysis",
//   "business-brand",
//   "business-dates",
//   "business-property",
//   "business-partner",
//   "office-vastu",
// ];

// function slugify(value: string) {
//   return value
//     .toLowerCase()
//     .trim()
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/^-+|-+$/g, "");
// }

// export default function ServicePagesModule() {
//   const { rows: pages, loading: pagesLoading, reload: reloadPages } = useAdminTable<ServicePage>(
//     "service_pages",
//     "sort_order",
//     true,
//   );
//   const { rows: packages, loading: packagesLoading, reload: reloadPackages } = useAdminTable<ServicePackage>(
//     "service_packages",
//     "sort_order",
//     true,
//   );

//   const [pageOpen, setPageOpen] = useState(false);
//   const [pkgOpen, setPkgOpen] = useState(false);
//   const [editingPage, setEditingPage] = useState<ServicePage | null>(null);
//   const [editingPkg, setEditingPkg] = useState<ServicePackage | null>(null);
//   const [pageForm, setPageForm] = useState(blankPage);
//   const [pkgForm, setPkgForm] = useState(blankPackage);
//   const [featuresText, setFeaturesText] = useState("");
//   const [faqsText, setFaqsText] = useState("");
//   const [pkgFeaturesText, setPkgFeaturesText] = useState("");
//   const [saving, setSaving] = useState(false);

//   // Live-update confirmation state — one flag/target per action that writes
//   // directly to live site data. Each dialog calls the existing, unchanged
//   // handler on confirm; nothing about the handlers themselves changes.
//   const [showPageSaveConfirm, setShowPageSaveConfirm] = useState(false);
//   const [showPkgSaveConfirm, setShowPkgSaveConfirm] = useState(false);
//   const [publishTarget, setPublishTarget] = useState<ServicePage | null>(null);
//   const [syncTarget, setSyncTarget] = useState<ServicePage | null>(null);
//   const [deletePageTarget, setDeletePageTarget] = useState<ServicePage | null>(null);
//   const [deletePkgTarget, setDeletePkgTarget] = useState<ServicePackage | null>(null);
//   const [deletingPage, setDeletingPage] = useState(false);
//   const [deletingPkg, setDeletingPkg] = useState(false);

//   useEffect(() => {
//     if (pages.length && !pkgForm.page_id) {
//       setPkgForm((prev) => ({ ...prev, page_id: pages[0].id }));
//     }
//   }, [pages, pkgForm.page_id]);

//   const packagesByPage = useMemo(() => {
//     const map = new Map<string, ServicePackage[]>();
//     for (const pkg of packages) {
//       const list = map.get(pkg.page_id) || [];
//       list.push(pkg);
//       map.set(pkg.page_id, list);
//     }
//     return map;
//   }, [packages]);

//   // ------------------------------------------------------------------
//   // Catalog auto-sync — keeps the "services" table (used by Services
//   // Management / Orders / Invoices for pricing, GST, and active status)
//   // in step with Pages & Packages, without relying on the admin
//   // remembering to click "Add to Catalog" or on a hardcoded slug mapping.
//   //
//   // A package's `payment_service_title` (falling back to its name) is the
//   // same string used elsewhere as `service_title` on orders/invoices, so
//   // it's the natural match key against `services.title`.
//   // ------------------------------------------------------------------
//   const syncServiceForPackage = async (
//     pkg: {
//       name: string;
//       payment_service_title?: string | null;
//       price: number;
//       gst_rate: number;
//       is_active: boolean;
//     },
//     page: { category: string | null; status: "draft" | "published" } | undefined,
//   ) => {
//     const title = (pkg.payment_service_title || pkg.name || "").trim();
//     if (!title) return;

//     // A service should only be live/orderable when BOTH the package is
//     // marked active AND its parent page is published.
//     const effectiveActive = pkg.is_active && page?.status === "published";

//     try {
//       const { data: existing } = await supabase
//         .from("services")
//         .select("id")
//         .ilike("title", title)
//         .maybeSingle();

//       if (existing?.id) {
//         await supabase
//           .from("services")
//           .update({
//             price: pkg.price,
//             gst_rate: pkg.gst_rate,
//             category: page?.category || null,
//             is_active: effectiveActive,
//           })
//           .eq("id", existing.id);
//       } else {
//         await supabase.from("services").insert({
//           title,
//           price: pkg.price,
//           gst_rate: pkg.gst_rate,
//           category: page?.category || null,
//           is_active: effectiveActive,
//         });
//       }
//     } catch (e) {
//       // Never let a catalog-sync failure block the page/package save itself
//       // — surface it as a secondary warning instead.
//       console.error("[service-pages] catalog sync failed:", e);
//       toast.warning(`"${title}" saved, but syncing it to the Service Catalog failed.`);
//     }
//   };

//   // Deactivates (never deletes) the service row matching a package's title —
//   // used when a package or page is deleted/unpublished, so historical
//   // orders/invoices that reference the service title stay intact.
//   const deactivateServiceByTitle = async (title: string | null | undefined) => {
//     const t = (title || "").trim();
//     if (!t) return;
//     try {
//       await supabase.from("services").update({ is_active: false }).ilike("title", t);
//     } catch (e) {
//       console.error("[service-pages] catalog deactivate failed:", e);
//     }
//   };

//   const openEditPage = (page: ServicePage) => {
//     setEditingPage(page);
//     const content = page.content || {};
//     setPageForm({
//       slug: page.slug,
//       route: page.route,
//       page_type: page.page_type,
//       title: page.title,
//       subtitle: page.subtitle || "",
//       description: page.description || "",
//       category: page.category || "",
//       seo_title: page.seo_title || "",
//       seo_description: page.seo_description || "",
//       hero_image_url: page.hero_image_url || "",
//       content,
//       form_type: page.form_type,
//       status: page.status,
//       sort_order: page.sort_order,
//     });
//     setFeaturesText(Array.isArray(content.features) ? (content.features as string[]).join("\n") : "");
//     setFaqsText(
//       Array.isArray(content.faqs)
//         ? (content.faqs as { q: string; a: string }[]).map((f) => `${f.q}|||${f.a}`).join("\n")
//         : "",
//     );
//     setPageOpen(true);
//   };

//   // Step 1: form submit — HTML5 "required" validation has already run by
//   // the time this fires. We deliberately do NOT close the form dialog here
//   // — closing it and immediately opening a second Radix dialog in the same
//   // tick caused a race where the first dialog's scroll-lock/overlay cleanup
//   // never finished, leaving the screen unclickable. Both dialogs can be
//   // mounted at once; the form dialog only closes for real once the save
//   // actually succeeds (see performSavePage).
//   //
//   // TEMP DEBUG: alert() calls below are only for tracing the "Save Page
//   // does nothing" issue and should be removed once confirmed working.
//   const handlePageSubmit = (e: FormEvent) => {
//     e.preventDefault();
//     alert("Save Page button ka click chala — form submit ho gaya!");
//     setShowPageSaveConfirm(true);
//   };

//   // Step 2: identical to the original `savePage` body — only the trigger changed.

//   const performSavePage = async () => {
//     alert("performSavePage function chal raha hai — save ho raha hai!");
//     setSaving(true);

//     const slug = pageForm.slug || slugify(pageForm.title);
//     const route =
//       pageForm.route ||
//       (slug === "call-consultation"
//         ? "/consultation"
//         : pageForm.page_type === "report"
//           ? `/reports/${slug}`
//           : `/services/${slug}`);

//     const faqs = faqsText
//       .split("\n")
//       .map((line) => line.trim())
//       .filter(Boolean)
//       .map((line) => {
//         const [q, a] = line.split("|||");
//         return { q: (q || "").trim(), a: (a || "").trim() };
//       })
//       .filter((f) => f.q);

//     const payload = {
//       slug,
//       route,
//       page_type: pageForm.page_type,
//       title: pageForm.title,
//       subtitle: pageForm.subtitle || null,
//       description: pageForm.description || null,
//       category: pageForm.category || null,
//       seo_title: pageForm.seo_title || pageForm.title,
//       seo_description: pageForm.seo_description || pageForm.description,
//       hero_image_url: pageForm.hero_image_url || null,
//       content: {
//         ...pageForm.content,
//         features: featuresText.split("\n").map((l) => l.trim()).filter(Boolean),
//         faqs,
//       },
//       form_type: pageForm.form_type,
//       status: pageForm.status,
//       sort_order: Number(pageForm.sort_order) || 0,
//       published_at: pageForm.status === "published" ? new Date().toISOString() : null,
//     };

//     const result = editingPage
//   ? await supabase.from("service_pages").update(payload).eq("id", editingPage.id).select()
//   : await supabase.from("service_pages").insert(payload).select();

// console.log("SERVICE PAGE RESULT:", result);
// alert(JSON.stringify(result.error));

// const { error } = result;
//     if (!error) {
//       // Category or publish-status may have changed — keep every package
//       // under this page in sync with the catalog (active status depends on
//       // page.status, so this must re-run even if only the page changed).
//       const pageId = editingPage?.id;
//       if (pageId) {
//         const pagePackages = packagesByPage.get(pageId) || [];
//         for (const pkg of pagePackages) {
//           await syncServiceForPackage(pkg, { category: payload.category, status: payload.status });
//         }
//       }
//     }

//     setSaving(false);
//     setShowPageSaveConfirm(false);
//     if (error) toast.error(error.message);
//     else {
//       toast.success(editingPage ? "Page updated" : "Page created");
//       setPageOpen(false);
//       reloadPages();
//       reloadPackages();
//     }
//   };

//   // Step 1: form submit -> confirm
//   const handlePkgSubmit = (e: FormEvent) => {
//     e.preventDefault();
//     if (!pkgForm.page_id) {
//       toast.error("Select a page for this package");
//       return;
//     }
//     setShowPkgSaveConfirm(true);
//   };

//   // Step 2: identical to the original `savePackage` body, plus an automatic
//   // catalog sync so this package's price/GST/active-status immediately
//   // reflects in Services Management — no manual "Add to Catalog" needed.
//   const performSavePackage = async () => {
//     setSaving(true);

//     const payload = {
//       page_id: pkgForm.page_id,
//       name: pkgForm.name,
//       tag: pkgForm.tag || null,
//       description: pkgForm.description || null,
//       price: Number(pkgForm.price),
//       original_price: pkgForm.original_price ? Number(pkgForm.original_price) : null,
//       gst_rate: Number(pkgForm.gst_rate) || 18,
//       features: pkgFeaturesText.split("\n").map((l) => l.trim()).filter(Boolean),
//       excluded: [],
//       form_type: pkgForm.form_type || null,
//       payment_service_title: pkgForm.payment_service_title || pkgForm.name,
//       is_popular: pkgForm.is_popular,
//       is_active: pkgForm.is_active,
//       sort_order: Number(pkgForm.sort_order) || 0,
//     };

//     const { error } = editingPkg
//       ? await supabase.from("service_packages").update(payload).eq("id", editingPkg.id)
//       : await supabase.from("service_packages").insert(payload);

//     if (!error) {
//       const parentPage = pages.find((p) => p.id === payload.page_id);
//       // If the old title changed, deactivate the stale catalog entry so it
//       // doesn't linger as a separate, no-longer-editable service.
//       if (
//         editingPkg &&
//         editingPkg.payment_service_title &&
//         editingPkg.payment_service_title.trim().toLowerCase() !==
//           (payload.payment_service_title || "").trim().toLowerCase()
//       ) {
//         await deactivateServiceByTitle(editingPkg.payment_service_title);
//       }
//       await syncServiceForPackage(payload, parentPage ? { category: parentPage.category, status: parentPage.status } : undefined);
//     }

//     setSaving(false);
//     setShowPkgSaveConfirm(false);
//     if (error) toast.error(error.message);
//     else {
//       toast.success(editingPkg ? "Package updated" : "Package created");
//       setPkgOpen(false);
//       reloadPackages();
//     }
//   };

//   // Unchanged business logic — now only called after the admin confirms via syncTarget.
//   const syncCatalogForPage = async (page: ServicePage) => {
//     const catalog = getCatalogSyncForSlug(page.slug);
//     if (!catalog) {
//       toast.error("No code catalog defined for this page slug");
//       return;
//     }

//     setSaving(true);
//     const { hub } = catalog;

//     const { error: pageError } = await supabase
//       .from("service_pages")
//       .update({
//         route: hub.route,
//         title: hub.title,
//         subtitle: hub.subtitle,
//         description: hub.subtitle,
//         category: hub.category,
//         form_type: hub.packages[0]?.formType || page.form_type,
//         updated_at: new Date().toISOString(),
//       })
//       .eq("id", page.id);

//     if (pageError) {
//       setSaving(false);
//       setSyncTarget(null);
//       toast.error(pageError.message);
//       return;
//     }

//     const pagePackages = packagesByPage.get(page.id) || [];
//     let synced = 0;

//     for (let i = 0; i < hub.packages.length; i++) {
//       const pkg = hub.packages[i];
//       const payload = catalogPackageToAdminPayload(page.id, pkg, i + 1);
//       const existing = pagePackages.find(
//         (p) =>
//           (p.payment_service_title || "").toLowerCase() === pkg.serviceTitle.toLowerCase() ||
//           p.name.toLowerCase() === pkg.name.toLowerCase(),
//       );

//       const { error } = existing
//         ? await supabase.from("service_packages").update(payload).eq("id", existing.id)
//         : await supabase.from("service_packages").insert(payload);

//       if (error) {
//         setSaving(false);
//         setSyncTarget(null);
//         toast.error(error.message);
//         return;
//       }
//       synced += 1;

//       await supabase
//         .from("services")
//         .update({ price: pkg.price, is_active: true, category: hub.category })
//         .ilike("title", pkg.serviceTitle);
//     }

//     setSaving(false);
//     setSyncTarget(null);
//     toast.success(`Synced ${hub.title}: route, ${synced} package(s), and service catalog prices`);
//     reloadPages();
//     reloadPackages();
//   };

//   // Unchanged business logic — now only called after the admin confirms via publishTarget.
//   // Also keeps the catalog's active status in step, since a service should
//   // never be orderable while its page is unpublished.
//   const togglePublish = async (page: ServicePage) => {
//     const nextStatus = page.status === "published" ? "draft" : "published";
//     const { error } = await supabase
//       .from("service_pages")
//       .update({
//         status: nextStatus,
//         published_at: nextStatus === "published" ? new Date().toISOString() : null,
//       })
//       .eq("id", page.id);

//     if (!error) {
//       const pagePackages = packagesByPage.get(page.id) || [];
//       for (const pkg of pagePackages) {
//         await syncServiceForPackage(pkg, { category: page.category, status: nextStatus });
//       }
//     }

//     setPublishTarget(null);
//     if (error) toast.error(error.message);
//     else {
//       toast.success(nextStatus === "published" ? "Page published" : "Page unpublished");
//       reloadPages();
//       reloadPackages();
//     }
//   };

//   const performDeletePage = async () => {
//     if (!deletePageTarget) return;
//     setDeletingPage(true);
//     // Deactivate (not delete) every catalog entry backed by this page's
//     // packages before removing them, so past orders/invoices referencing
//     // these titles remain intact and reportable.
//     const pagePackages = packagesByPage.get(deletePageTarget.id) || [];
//     for (const pkg of pagePackages) {
//       await deactivateServiceByTitle(pkg.payment_service_title || pkg.name);
//     }
//     await supabase.from("service_pages").delete().eq("id", deletePageTarget.id);
//     setDeletingPage(false);
//     setDeletePageTarget(null);
//     reloadPages();
//     reloadPackages();
//   };

//   const performDeletePkg = async () => {
//     if (!deletePkgTarget) return;
//     setDeletingPkg(true);
//     await deactivateServiceByTitle(deletePkgTarget.payment_service_title || deletePkgTarget.name);
//     await supabase.from("service_packages").delete().eq("id", deletePkgTarget.id);
//     setDeletingPkg(false);
//     setDeletePkgTarget(null);
//     reloadPackages();
//   };

//   return (
//     <AdminPage
//       title="Services & Packages"
//       description="Create service pages, manage pricing packages, checkout forms, and publish to the live site."
//       loading={pagesLoading || packagesLoading}
//       empty={!pages.length}
//       emptyMessage='No service pages yet. Create your first page to get started.'
//       actions={
//         <div className="flex gap-2">
//           <Dialog
//             open={pageOpen}
//             onOpenChange={(open) => {
//               setPageOpen(open);
//               if (!open) setEditingPage(null);
//             }}
//           >
//             <DialogTrigger asChild>
//               <Button
//                 onClick={() => {
//                   setEditingPage(null);
//                   setPageForm(blankPage);
//                   setFeaturesText("");
//                   setFaqsText("");
//                 }}
//               >
//                 <Plus className="w-4 h-4 mr-2" />
//                 New Page
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle>{editingPage ? "Edit" : "New"} Service Page</DialogTitle>
//               </DialogHeader>
//               <form onSubmit={handlePageSubmit} className="space-y-3">
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <Label>Title</Label>
//                     <Input
//                       value={pageForm.title}
//                       onChange={(e) => {
//                         const title = e.target.value;
//                         setPageForm({
//                           ...pageForm,
//                           title,
//                           slug: editingPage ? pageForm.slug : slugify(title),
//                           route: editingPage
//                             ? pageForm.route
//                             : pageForm.page_type === "report"
//                               ? `/reports/${slugify(title)}`
//                               : `/services/${slugify(title)}`,
//                         });
//                       }}
//                       required
//                     />
//                   </div>
//                   <div>
//                     <Label>Category</Label>
//                     <Input
//                       value={pageForm.category}
//                       onChange={(e) => setPageForm({ ...pageForm, category: e.target.value })}
//                     />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <Label>Slug</Label>
//                     <Input
//                       value={pageForm.slug}
//                       onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })}
//                       required
//                     />
//                   </div>
//                   <div>
//                     <Label>Route</Label>
//                     <Input
//                       value={pageForm.route}
//                       onChange={(e) => setPageForm({ ...pageForm, route: e.target.value })}
//                       required
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <Label>Subtitle</Label>
//                   <Input
//                     value={pageForm.subtitle}
//                     onChange={(e) => setPageForm({ ...pageForm, subtitle: e.target.value })}
//                   />
//                 </div>
//                 <div>
//                   <Label>Description</Label>
//                   <Textarea
//                     value={pageForm.description}
//                     onChange={(e) => setPageForm({ ...pageForm, description: e.target.value })}
//                     rows={3}
//                   />
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <Label>Page Type</Label>
//                     <Select
//                       value={pageForm.page_type}
//                       onValueChange={(v) => setPageForm({ ...pageForm, page_type: v })}
//                     >
//                       <SelectTrigger><SelectValue /></SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="service">Service</SelectItem>
//                         <SelectItem value="report">Report</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div>
//                     <Label>Checkout Form</Label>
//                     <Select
//                       value={pageForm.form_type}
//                       onValueChange={(v) => setPageForm({ ...pageForm, form_type: v })}
//                     >
//                       <SelectTrigger><SelectValue /></SelectTrigger>
//                       <SelectContent>
//                         {FORM_TYPES.map((ft) => (
//                           <SelectItem key={ft} value={ft}>{ft}</SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//                 <div>
//                   <Label>Features (one per line)</Label>
//                   <Textarea value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} rows={4} />
//                 </div>
//                 <div>
//                   <Label>FAQs (format: Question|||Answer, one per line)</Label>
//                   <Textarea value={faqsText} onChange={(e) => setFaqsText(e.target.value)} rows={4} />
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <Label>SEO Title</Label>
//                     <Input
//                       value={pageForm.seo_title}
//                       onChange={(e) => setPageForm({ ...pageForm, seo_title: e.target.value })}
//                     />
//                   </div>
//                   <div>
//                     <Label>Sort Order</Label>
//                     <Input
//                       type="number"
//                       value={pageForm.sort_order}
//                       onChange={(e) => setPageForm({ ...pageForm, sort_order: Number(e.target.value) })}
//                     />
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Switch
//                     checked={pageForm.status === "published"}
//                     onCheckedChange={(checked) =>
//                       setPageForm({ ...pageForm, status: checked ? "published" : "draft" })
//                     }
//                   />
//                   <Label>Publish immediately</Label>
//                 </div>
//                 <DialogFooter>
//                   <Button type="submit" disabled={saving}>
//                     {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
//                     Save Page
//                   </Button>
//                 </DialogFooter>
//               </form>
//             </DialogContent>
//           </Dialog>

//           <Dialog
//             open={pkgOpen}
//             onOpenChange={(open) => {
//               setPkgOpen(open);
//               if (!open) setEditingPkg(null);
//             }}
//           >
//             <DialogTrigger asChild>
//               <Button
//                 variant="outline"
//                 disabled={!pages.length}
//                 onClick={() => {
//                   setEditingPkg(null);
//                   setPkgForm({ ...blankPackage, page_id: pages[0]?.id || "" });
//                   setPkgFeaturesText("");
//                 }}
//               >
//                 <Plus className="w-4 h-4 mr-2" />
//                 New Package
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle>{editingPkg ? "Edit" : "New"} Package</DialogTitle>
//               </DialogHeader>
//               <form onSubmit={handlePkgSubmit} className="space-y-3">
//                 <div>
//                   <Label>Service Page</Label>
//                   <Select value={pkgForm.page_id} onValueChange={(v) => setPkgForm({ ...pkgForm, page_id: v })}>
//                     <SelectTrigger><SelectValue placeholder="Select page" /></SelectTrigger>
//                     <SelectContent>
//                       {pages.map((p) => (
//                         <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div>
//                   <Label>Package Name</Label>
//                   <Input
//                     value={pkgForm.name}
//                     onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
//                     required
//                   />
//                 </div>
//                 <div>
//                   <Label>Tag / Badge</Label>
//                   <Input value={pkgForm.tag} onChange={(e) => setPkgForm({ ...pkgForm, tag: e.target.value })} />
//                 </div>
//                 <div>
//                   <Label>Payment Service Title</Label>
//                   <Input
//                     value={pkgForm.payment_service_title}
//                     onChange={(e) => setPkgForm({ ...pkgForm, payment_service_title: e.target.value })}
//                     placeholder="Exact title sent to checkout"
//                   />
//                   <p className="text-xs text-muted-foreground mt-1">
//                     This exact title is what links this package to its entry in the Service Catalog —
//                     keep it unique.
//                   </p>
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <Label>Price (₹)</Label>
//                     <Input
//                       type="number"
//                       value={pkgForm.price}
//                       onChange={(e) => setPkgForm({ ...pkgForm, price: Number(e.target.value) })}
//                       required
//                     />
//                   </div>
//                   <div>
//                     <Label>Original Price</Label>
//                     <Input
//                       type="number"
//                       value={pkgForm.original_price}
//                       onChange={(e) => setPkgForm({ ...pkgForm, original_price: Number(e.target.value) })}
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <Label>Checkout Form Override</Label>
//                   <Select
//                     value={pkgForm.form_type || pageForm.form_type}
//                     onValueChange={(v) => setPkgForm({ ...pkgForm, form_type: v })}
//                   >
//                     <SelectTrigger><SelectValue placeholder="Use page default" /></SelectTrigger>
//                     <SelectContent>
//                       {FORM_TYPES.map((ft) => (
//                         <SelectItem key={ft} value={ft}>{ft}</SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div>
//                   <Label>Features (one per line)</Label>
//                   <Textarea
//                     value={pkgFeaturesText}
//                     onChange={(e) => setPkgFeaturesText(e.target.value)}
//                     rows={4}
//                   />
//                 </div>
//                 <div className="flex items-center gap-4">
//                   <div className="flex items-center gap-2">
//                     <Switch
//                       checked={pkgForm.is_popular}
//                       onCheckedChange={(v) => setPkgForm({ ...pkgForm, is_popular: v })}
//                     />
//                     <Label>Popular</Label>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <Switch
//                       checked={pkgForm.is_active}
//                       onCheckedChange={(v) => setPkgForm({ ...pkgForm, is_active: v })}
//                     />
//                     <Label>Active</Label>
//                   </div>
//                 </div>
//                 <DialogFooter>
//                   <Button type="submit" disabled={saving}>
//                     {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
//                     Save Package
//                   </Button>
//                 </DialogFooter>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>
//       }
//     >
//       <Tabs defaultValue="pages">
//         <TabsList>
//           <TabsTrigger value="pages"><FileText className="w-4 h-4 mr-2" />Pages</TabsTrigger>
//           <TabsTrigger value="packages"><Package className="w-4 h-4 mr-2" />Packages</TabsTrigger>
//         </TabsList>

//         <TabsContent value="pages" className="space-y-3 mt-4">
//           {pages.map((page) => (
//             <div key={page.id} className="border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//               <div>
//                 <div className="flex items-center gap-2 flex-wrap">
//                   <p className="font-semibold">{page.title}</p>
//                   <Badge variant={page.status === "published" ? "default" : "secondary"}>
//                     {page.status}
//                   </Badge>
//                   <Badge variant="outline">{page.page_type}</Badge>
//                 </div>
//                 <p className="text-sm text-muted-foreground mt-1">
//                   {page.route} · {page.category || "Uncategorized"} · Form: {page.form_type}
//                 </p>
//                 <p className="text-xs text-muted-foreground mt-1">
//                   {(packagesByPage.get(page.id) || []).length} package(s)
//                 </p>
//               </div>
//               <div className="flex items-center gap-2 flex-wrap">
//                 {getCatalogSyncForSlug(page.slug) && (
//                   <Button size="sm" variant="secondary" disabled={saving} onClick={() => setSyncTarget(page)}>
//                     <Package className="w-4 h-4 mr-1" />
//                     Sync Catalog
//                   </Button>
//                 )}
//                 <Button size="sm" variant="outline" onClick={() => setPublishTarget(page)}>
//                   <Globe className="w-4 h-4 mr-1" />
//                   {page.status === "published" ? "Unpublish" : "Publish"}
//                 </Button>
//                 <Button size="icon" variant="outline" onClick={() => openEditPage(page)}>
//                   <Pencil className="w-4 h-4" />
//                 </Button>
//                 <Button
//                   size="icon"
//                   variant="outline"
//                   onClick={() => setDeletePageTarget(page)}
//                 >
//                   <Trash2 className="w-4 h-4" />
//                 </Button>
//               </div>
//             </div>
//           ))}
//         </TabsContent>

//         <TabsContent value="packages" className="space-y-3 mt-4">
//           {packages.map((pkg) => {
//             const page = pages.find((p) => p.id === pkg.page_id);
//             return (
//               <div key={pkg.id} className="border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//                 <div>
//                   <div className="flex items-center gap-2 flex-wrap">
//                     <p className="font-semibold">{pkg.name}</p>
//                     {pkg.is_popular && <Badge>Popular</Badge>}
//                     {!pkg.is_active && <Badge variant="secondary">Inactive</Badge>}
//                   </div>
//                   <p className="text-sm text-muted-foreground">
//                     {page?.title || "Unknown page"} · {formatINR(Number(pkg.price))}
//                     {pkg.original_price ? ` (was ${formatINR(Number(pkg.original_price))})` : ""}
//                   </p>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Button
//                     size="icon"
//                     variant="outline"
//                     onClick={() => {
//                       setEditingPkg(pkg);
//                       setPkgForm({
//                         page_id: pkg.page_id,
//                         name: pkg.name,
//                         tag: pkg.tag || "",
//                         description: pkg.description || "",
//                         price: Number(pkg.price),
//                         original_price: Number(pkg.original_price || 0),
//                         gst_rate: Number(pkg.gst_rate),
//                         features: pkg.features || [],
//                         excluded: pkg.excluded || [],
//                         form_type: pkg.form_type || "",
//                         payment_service_title: pkg.payment_service_title || "",
//                         is_popular: pkg.is_popular,
//                         is_active: pkg.is_active,
//                         sort_order: pkg.sort_order,
//                       });
//                       setPkgFeaturesText((pkg.features || []).join("\n"));
//                       setPkgOpen(true);
//                     }}
//                   >
//                     <Pencil className="w-4 h-4" />
//                   </Button>
//                   <Button
//                     size="icon"
//                     variant="outline"
//                     onClick={() => setDeletePkgTarget(pkg)}
//                   >
//                     <Trash2 className="w-4 h-4" />
//                   </Button>
//                 </div>
//               </div>
//             );
//           })}
//         </TabsContent>
//       </Tabs>

//       {/* New/Edit Page — live-update confirmation, shown after required-field validation passes */}
//       <ConfirmLiveUpdateDialog
//         open={showPageSaveConfirm}
//         onOpenChange={(o) => {
//           setShowPageSaveConfirm(o);
//           // Only fires from user-driven closes (Cancel/backdrop/Escape) —
//           // performSavePage() sets this to false directly, not via here —
//           // so this only re-opens the form on cancel, never after a save.
//           if (!o) setPageOpen(true);
//         }}
//         onConfirm={performSavePage}
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

//       {/* New/Edit Package — live-update confirmation */}
//       <ConfirmLiveUpdateDialog
//         open={showPkgSaveConfirm}
//         onOpenChange={(o) => {
//           setShowPkgSaveConfirm(o);
//           if (!o) setPkgOpen(true);
//         }}
//         onConfirm={performSavePackage}
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

//       {/* Publish / Unpublish confirmation */}
//       <ConfirmLiveUpdateDialog
//         open={!!publishTarget}
//         onOpenChange={(o) => !o && setPublishTarget(null)}
//         onConfirm={() => publishTarget && togglePublish(publishTarget)}
//         title="Confirm Live Website Update"
//         description={
//           <>
//             <p>
//               {publishTarget?.status === "published"
//                 ? `Unpublishing "${publishTarget?.title}" will immediately remove it from the live website.`
//                 : `Publishing "${publishTarget?.title}" will immediately update the live website.`}
//             </p>
//             <p>Please confirm that you want to continue.</p>
//             <p>This change will be visible to customers immediately.</p>
//           </>
//         }
//         confirmLabel="Confirm & Publish"
//       />

//       {/* Sync Catalog confirmation — overwrites live page + package + service pricing data */}
//       <ConfirmLiveUpdateDialog
//         open={!!syncTarget}
//         onOpenChange={(o) => !o && setSyncTarget(null)}
//         onConfirm={() => syncTarget && syncCatalogForPage(syncTarget)}
//         loading={saving}
//         title="Confirm Live Website Update"
//         description={
//           <>
//             <p>
//               Syncing "{syncTarget?.title}" will immediately update its route, packages, and service
//               catalog prices on the live website.
//             </p>
//             <p>Please confirm that you want to continue.</p>
//             <p>This change will be visible to customers immediately.</p>
//           </>
//         }
//         confirmLabel="Confirm & Publish"
//       />

//       {/* Delete Page confirmation — destructive variant */}
//       <ConfirmLiveUpdateDialog
//         open={!!deletePageTarget}
//         onOpenChange={(o) => !o && setDeletePageTarget(null)}
//         onConfirm={performDeletePage}
//         loading={deletingPage}
//         variant="destructive"
//         title="Delete Service"
//         description={
//           <>
//             <p>
//               "{deletePageTarget?.title}" and all its packages will be removed from the live website.
//             </p>
//             <p>This action may affect customer bookings.</p>
//             <p>Are you sure?</p>
//           </>
//         }
//         confirmLabel="Delete Service"
//       />

//       {/* Delete Package confirmation — destructive variant */}
//       <ConfirmLiveUpdateDialog
//         open={!!deletePkgTarget}
//         onOpenChange={(o) => !o && setDeletePkgTarget(null)}
//         onConfirm={performDeletePkg}
//         loading={deletingPkg}
//         variant="destructive"
//         title="Delete Service"
//         description={
//           <>
//             <p>
//               "{deletePkgTarget?.name}" will be removed from the live website.
//             </p>
//             <p>This action may affect customer bookings.</p>
//             <p>Are you sure?</p>
//           </>
//         }
//         confirmLabel="Delete Service"
//       />
//     </AdminPage>
//   );
// }

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage } from "@/components/admin/AdminPage";
import { useAdminTable } from "@/hooks/useAdminData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmLiveUpdateDialog } from "@/components/admin/ConfirmLiveUpdateDialog";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Globe, FileText, Package, ArrowLeft } from "lucide-react";
import { formatINR } from "@/config/pricing";
import {
  catalogPackageToAdminPayload,
  getCatalogSyncForSlug,
} from "@/data/adminCatalogSync";

type ServicePage = {
  id: string;
  slug: string;
  route: string;
  page_type: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  category: string | null;
  seo_title: string | null;
  seo_description: string | null;
  hero_image_url: string | null;
  content: Record<string, unknown>;
  form_type: string;
  status: "draft" | "published";
  sort_order: number;
  published_at: string | null;
};

type ServicePackage = {
  id: string;
  page_id: string;
  name: string;
  tag: string | null;
  description: string | null;
  price: number;
  original_price: number | null;
  gst_rate: number;
  features: string[];
  excluded: string[];
  form_type: string | null;
  payment_service_title: string | null;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
};

const blankPage = {
  slug: "",
  route: "",
  page_type: "service",
  title: "",
  subtitle: "",
  description: "",
  category: "",
  seo_title: "",
  seo_description: "",
  hero_image_url: "",
  content: { features: [] as string[], faqs: [] as { q: string; a: string }[] },
  form_type: "default",
  status: "draft" as const,
  sort_order: 0,
};

const blankPackage = {
  page_id: "",
  name: "",
  tag: "",
  description: "",
  price: 0,
  original_price: 0,
  gst_rate: 18,
  features: [] as string[],
  excluded: [] as string[],
  form_type: "",
  payment_service_title: "",
  is_popular: false,
  is_active: true,
  sort_order: 0,
};

const FORM_TYPES = [
  "default",
  "kundali",
  "kundali-multi",
  "consultation",
  "name-correction",
  "name-correction-couple",
  "name-check",
  "couple",
  "pyaar-shastra",
  "lucky-vehicle",
  "lucky-vehicle-color",
  "lucky-vehicle-date",
  "lucky-mobile",
  "lucky-flat",
  "relationship-analysis",
  "business-brand",
  "business-dates",
  "business-property",
  "business-partner",
  "office-vastu",
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ServicePagesModule() {
  const { rows: pages, loading: pagesLoading, reload: reloadPages } = useAdminTable<ServicePage>(
    "service_pages",
    "sort_order",
    true,
  );
  const { rows: packages, loading: packagesLoading, reload: reloadPackages } = useAdminTable<ServicePackage>(
    "service_packages",
    "sort_order",
    true,
  );

  // Each of these dialogs is a SINGLE Radix Dialog with an internal
  // "form" -> "confirm" step (same pattern as Invoice Manager's Create
  // Invoice modal). Using two separate stacked Dialogs (a form dialog + a
  // confirmation dialog) caused Radix's body pointer-events cleanup to
  // never resolve, freezing the whole page — this avoids that entirely.
  const [pageOpen, setPageOpen] = useState(false);
  const [pageStep, setPageStep] = useState<"form" | "confirm">("form");
  const [pkgOpen, setPkgOpen] = useState(false);
  const [pkgStep, setPkgStep] = useState<"form" | "confirm">("form");

  const [editingPage, setEditingPage] = useState<ServicePage | null>(null);
  const [editingPkg, setEditingPkg] = useState<ServicePackage | null>(null);
  const [pageForm, setPageForm] = useState(blankPage);
  const [pkgForm, setPkgForm] = useState(blankPackage);
  const [featuresText, setFeaturesText] = useState("");
  const [faqsText, setFaqsText] = useState("");
  const [pkgFeaturesText, setPkgFeaturesText] = useState("");
  const [saving, setSaving] = useState(false);

  // Live-update confirmation state for actions triggered directly from the
  // list (no form dialog already open beforehand), so no nesting risk here.
  const [publishTarget, setPublishTarget] = useState<ServicePage | null>(null);
  const [syncTarget, setSyncTarget] = useState<ServicePage | null>(null);
  const [deletePageTarget, setDeletePageTarget] = useState<ServicePage | null>(null);
  const [deletePkgTarget, setDeletePkgTarget] = useState<ServicePackage | null>(null);
  const [deletingPage, setDeletingPage] = useState(false);
  const [deletingPkg, setDeletingPkg] = useState(false);

  useEffect(() => {
    if (pages.length && !pkgForm.page_id) {
      setPkgForm((prev) => ({ ...prev, page_id: pages[0].id }));
    }
  }, [pages, pkgForm.page_id]);

  const packagesByPage = useMemo(() => {
    const map = new Map<string, ServicePackage[]>();
    for (const pkg of packages) {
      const list = map.get(pkg.page_id) || [];
      list.push(pkg);
      map.set(pkg.page_id, list);
    }
    return map;
  }, [packages]);

  // ------------------------------------------------------------------
  // Catalog auto-sync — keeps the "services" table (used by Services
  // Management / Orders / Invoices for pricing, GST, and active status)
  // in step with Pages & Packages, without relying on the admin
  // remembering to click "Add to Catalog" or on a hardcoded slug mapping.
  //
  // A package's `payment_service_title` (falling back to its name) is the
  // same string used elsewhere as `service_title` on orders/invoices, so
  // it's the natural match key against `services.title`.
  // ------------------------------------------------------------------
  const syncServiceForPackage = async (
    pkg: {
      name: string;
      payment_service_title?: string | null;
      price: number;
      gst_rate: number;
      is_active: boolean;
    },
    page: { category: string | null; status: "draft" | "published" } | undefined,
  ) => {
    const title = (pkg.payment_service_title || pkg.name || "").trim();
    if (!title) return;

    // A service should only be live/orderable when BOTH the package is
    // marked active AND its parent page is published.
    const effectiveActive = pkg.is_active && page?.status === "published";

    try {
      const { data: existing } = await supabase
        .from("services")
        .select("id")
        .ilike("title", title)
        .maybeSingle();

      if (existing?.id) {
        await supabase
          .from("services")
          .update({
            price: pkg.price,
            gst_rate: pkg.gst_rate,
            category: page?.category || null,
            is_active: effectiveActive,
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("services").insert({
          title,
          price: pkg.price,
          gst_rate: pkg.gst_rate,
          category: page?.category || null,
          is_active: effectiveActive,
        });
      }
    } catch (e) {
      // Never let a catalog-sync failure block the page/package save itself
      // — surface it as a secondary warning instead.
      console.error("[service-pages] catalog sync failed:", e);
      toast.warning(`"${title}" saved, but syncing it to the Service Catalog failed.`);
    }
  };

  // Deactivates (never deletes) the service row matching a package's title —
  // used when a package or page is deleted/unpublished, so historical
  // orders/invoices that reference the service title stay intact.
  const deactivateServiceByTitle = async (title: string | null | undefined) => {
    const t = (title || "").trim();
    if (!t) return;
    try {
      await supabase.from("services").update({ is_active: false }).ilike("title", t);
    } catch (e) {
      console.error("[service-pages] catalog deactivate failed:", e);
    }
  };

  const openCreatePage = () => {
    setEditingPage(null);
    setPageForm(blankPage);
    setFeaturesText("");
    setFaqsText("");
    setPageStep("form");
    setPageOpen(true);
  };

  const openEditPage = (page: ServicePage) => {
    setEditingPage(page);
    const content = page.content || {};
    setPageForm({
      slug: page.slug,
      route: page.route,
      page_type: page.page_type,
      title: page.title,
      subtitle: page.subtitle || "",
      description: page.description || "",
      category: page.category || "",
      seo_title: page.seo_title || "",
      seo_description: page.seo_description || "",
      hero_image_url: page.hero_image_url || "",
      content,
      form_type: page.form_type,
      status: page.status,
      sort_order: page.sort_order,
    });
    setFeaturesText(Array.isArray(content.features) ? (content.features as string[]).join("\n") : "");
    setFaqsText(
      Array.isArray(content.faqs)
        ? (content.faqs as { q: string; a: string }[]).map((f) => `${f.q}|||${f.a}`).join("\n")
        : "",
    );
    setPageStep("form");
    setPageOpen(true);
  };

  const closePageDialog = () => {
    setPageOpen(false);
    setPageStep("form");
    setEditingPage(null);
  };

  // Step 1: HTML5 "required" validation has already run by the time this
  // fires. Just move to the confirmation step within the SAME dialog.
  const handlePageSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPageStep("confirm");
  };

  // Step 2: identical to the original `savePage` body — only the trigger changed.
  const performSavePage = async () => {
    setSaving(true);

    const slug = pageForm.slug || slugify(pageForm.title);
    const route =
      pageForm.route ||
      (slug === "call-consultation"
        ? "/consultation"
        : pageForm.page_type === "report"
          ? `/reports/${slug}`
          : `/services/${slug}`);

    const faqs = faqsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [q, a] = line.split("|||");
        return { q: (q || "").trim(), a: (a || "").trim() };
      })
      .filter((f) => f.q);

    const payload = {
      slug,
      route,
      page_type: pageForm.page_type,
      title: pageForm.title,
      subtitle: pageForm.subtitle || null,
      description: pageForm.description || null,
      category: pageForm.category || null,
      seo_title: pageForm.seo_title || pageForm.title,
      seo_description: pageForm.seo_description || pageForm.description,
      hero_image_url: pageForm.hero_image_url || null,
      content: {
        ...pageForm.content,
        features: featuresText.split("\n").map((l) => l.trim()).filter(Boolean),
        faqs,
      },
      form_type: pageForm.form_type,
      status: pageForm.status,
      sort_order: Number(pageForm.sort_order) || 0,
      published_at: pageForm.status === "published" ? new Date().toISOString() : null,
    };

    const { error } = editingPage
      ? await supabase.from("service_pages").update(payload).eq("id", editingPage.id)
      : await supabase.from("service_pages").insert(payload);

    if (!error) {
      // Category or publish-status may have changed — keep every package
      // under this page in sync with the catalog (active status depends on
      // page.status, so this must re-run even if only the page changed).
      const pageId = editingPage?.id;
      if (pageId) {
        const pagePackages = packagesByPage.get(pageId) || [];
        for (const pkg of pagePackages) {
          await syncServiceForPackage(pkg, { category: payload.category, status: payload.status });
        }
      }
    }

    setSaving(false);
    if (error) {
      toast.error(error.message);
      setPageStep("form");
    } else {
      toast.success(editingPage ? "Page updated" : "Page created");
      closePageDialog();
      reloadPages();
      reloadPackages();
    }
  };

  const openCreatePackage = () => {
    setEditingPkg(null);
    setPkgForm({ ...blankPackage, page_id: pages[0]?.id || "" });
    setPkgFeaturesText("");
    setPkgStep("form");
    setPkgOpen(true);
  };

  const openEditPackage = (pkg: ServicePackage) => {
    setEditingPkg(pkg);
    setPkgForm({
      page_id: pkg.page_id,
      name: pkg.name,
      tag: pkg.tag || "",
      description: pkg.description || "",
      price: Number(pkg.price),
      original_price: Number(pkg.original_price || 0),
      gst_rate: Number(pkg.gst_rate),
      features: pkg.features || [],
      excluded: pkg.excluded || [],
      form_type: pkg.form_type || "",
      payment_service_title: pkg.payment_service_title || "",
      is_popular: pkg.is_popular,
      is_active: pkg.is_active,
      sort_order: pkg.sort_order,
    });
    setPkgFeaturesText((pkg.features || []).join("\n"));
    setPkgStep("form");
    setPkgOpen(true);
  };

  const closePkgDialog = () => {
    setPkgOpen(false);
    setPkgStep("form");
    setEditingPkg(null);
  };

  // Step 1: form submit -> move to confirm step within the same dialog.
  const handlePkgSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!pkgForm.page_id) {
      toast.error("Select a page for this package");
      return;
    }
    setPkgStep("confirm");
  };

  // Step 2: identical to the original `savePackage` body, plus an automatic
  // catalog sync so this package's price/GST/active-status immediately
  // reflects in Services Management — no manual "Add to Catalog" needed.
  const performSavePackage = async () => {
    setSaving(true);

    const payload = {
      page_id: pkgForm.page_id,
      name: pkgForm.name,
      tag: pkgForm.tag || null,
      description: pkgForm.description || null,
      price: Number(pkgForm.price),
      original_price: pkgForm.original_price ? Number(pkgForm.original_price) : null,
      gst_rate: Number(pkgForm.gst_rate) || 18,
      features: pkgFeaturesText.split("\n").map((l) => l.trim()).filter(Boolean),
      excluded: [],
      form_type: pkgForm.form_type || null,
      payment_service_title: pkgForm.payment_service_title || pkgForm.name,
      is_popular: pkgForm.is_popular,
      is_active: pkgForm.is_active,
      sort_order: Number(pkgForm.sort_order) || 0,
    };

    const { error } = editingPkg
      ? await supabase.from("service_packages").update(payload).eq("id", editingPkg.id)
      : await supabase.from("service_packages").insert(payload);

    if (!error) {
      const parentPage = pages.find((p) => p.id === payload.page_id);
      // If the old title changed, deactivate the stale catalog entry so it
      // doesn't linger as a separate, no-longer-editable service.
      if (
        editingPkg &&
        editingPkg.payment_service_title &&
        editingPkg.payment_service_title.trim().toLowerCase() !==
          (payload.payment_service_title || "").trim().toLowerCase()
      ) {
        await deactivateServiceByTitle(editingPkg.payment_service_title);
      }
      await syncServiceForPackage(payload, parentPage ? { category: parentPage.category, status: parentPage.status } : undefined);
    }

    setSaving(false);
    if (error) {
      toast.error(error.message);
      setPkgStep("form");
    } else {
      toast.success(editingPkg ? "Package updated" : "Package created");
      closePkgDialog();
      reloadPackages();
    }
  };

  // Unchanged business logic — now only called after the admin confirms via syncTarget.
  const syncCatalogForPage = async (page: ServicePage) => {
    const catalog = getCatalogSyncForSlug(page.slug);
    if (!catalog) {
      toast.error("No code catalog defined for this page slug");
      return;
    }

    setSaving(true);
    const { hub } = catalog;

    const { error: pageError } = await supabase
      .from("service_pages")
      .update({
        route: hub.route,
        title: hub.title,
        subtitle: hub.subtitle,
        description: hub.subtitle,
        category: hub.category,
        form_type: hub.packages[0]?.formType || page.form_type,
        updated_at: new Date().toISOString(),
      })
      .eq("id", page.id);

    if (pageError) {
      setSaving(false);
      setSyncTarget(null);
      toast.error(pageError.message);
      return;
    }

    const pagePackages = packagesByPage.get(page.id) || [];
    let synced = 0;

    for (let i = 0; i < hub.packages.length; i++) {
      const pkg = hub.packages[i];
      const payload = catalogPackageToAdminPayload(page.id, pkg, i + 1);
      const existing = pagePackages.find(
        (p) =>
          (p.payment_service_title || "").toLowerCase() === pkg.serviceTitle.toLowerCase() ||
          p.name.toLowerCase() === pkg.name.toLowerCase(),
      );

      const { error } = existing
        ? await supabase.from("service_packages").update(payload).eq("id", existing.id)
        : await supabase.from("service_packages").insert(payload);

      if (error) {
        setSaving(false);
        setSyncTarget(null);
        toast.error(error.message);
        return;
      }
      synced += 1;

      await supabase
        .from("services")
        .update({ price: pkg.price, is_active: true, category: hub.category })
        .ilike("title", pkg.serviceTitle);
    }

    setSaving(false);
    setSyncTarget(null);
    toast.success(`Synced ${hub.title}: route, ${synced} package(s), and service catalog prices`);
    reloadPages();
    reloadPackages();
  };

  // Unchanged business logic — now only called after the admin confirms via publishTarget.
  // Also keeps the catalog's active status in step, since a service should
  // never be orderable while its page is unpublished.
  const togglePublish = async (page: ServicePage) => {
    const nextStatus = page.status === "published" ? "draft" : "published";
    const { error } = await supabase
      .from("service_pages")
      .update({
        status: nextStatus,
        published_at: nextStatus === "published" ? new Date().toISOString() : null,
      })
      .eq("id", page.id);

    if (!error) {
      const pagePackages = packagesByPage.get(page.id) || [];
      for (const pkg of pagePackages) {
        await syncServiceForPackage(pkg, { category: page.category, status: nextStatus });
      }
    }

    setPublishTarget(null);
    if (error) toast.error(error.message);
    else {
      toast.success(nextStatus === "published" ? "Page published" : "Page unpublished");
      reloadPages();
      reloadPackages();
    }
  };

  const performDeletePage = async () => {
    if (!deletePageTarget) return;
    setDeletingPage(true);
    // Deactivate (not delete) every catalog entry backed by this page's
    // packages before removing them, so past orders/invoices referencing
    // these titles remain intact and reportable.
    const pagePackages = packagesByPage.get(deletePageTarget.id) || [];
    for (const pkg of pagePackages) {
      await deactivateServiceByTitle(pkg.payment_service_title || pkg.name);
    }
    await supabase.from("service_pages").delete().eq("id", deletePageTarget.id);
    setDeletingPage(false);
    setDeletePageTarget(null);
    reloadPages();
    reloadPackages();
  };

  const performDeletePkg = async () => {
    if (!deletePkgTarget) return;
    setDeletingPkg(true);
    await deactivateServiceByTitle(deletePkgTarget.payment_service_title || deletePkgTarget.name);
    await supabase.from("service_packages").delete().eq("id", deletePkgTarget.id);
    setDeletingPkg(false);
    setDeletePkgTarget(null);
    reloadPackages();
  };

  return (
    <AdminPage
      title="Services & Packages"
      description="Create service pages, manage pricing packages, checkout forms, and publish to the live site."
      loading={pagesLoading || packagesLoading}
      empty={!pages.length}
      emptyMessage='No service pages yet. Create your first page to get started.'
      actions={
        <div className="flex gap-2">
          {/* New/Edit Page — single Dialog, internal form -> confirm step */}
          <Dialog
            open={pageOpen}
            onOpenChange={(open) => (open ? setPageOpen(true) : closePageDialog())}
          >
            <DialogTrigger asChild>
              <Button onClick={openCreatePage}>
                <Plus className="w-4 h-4 mr-2" />
                New Page
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {pageStep === "form"
                    ? `${editingPage ? "Edit" : "New"} Service Page`
                    : "Confirm Live Website Update"}
                </DialogTitle>
              </DialogHeader>

              {pageStep === "form" ? (
                <form onSubmit={handlePageSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={pageForm.title}
                        onChange={(e) => {
                          const title = e.target.value;
                          setPageForm({
                            ...pageForm,
                            title,
                            slug: editingPage ? pageForm.slug : slugify(title),
                            route: editingPage
                              ? pageForm.route
                              : pageForm.page_type === "report"
                                ? `/reports/${slugify(title)}`
                                : `/services/${slugify(title)}`,
                          });
                        }}
                        required
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Input
                        value={pageForm.category}
                        onChange={(e) => setPageForm({ ...pageForm, category: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Slug</Label>
                      <Input
                        value={pageForm.slug}
                        onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Route</Label>
                      <Input
                        value={pageForm.route}
                        onChange={(e) => setPageForm({ ...pageForm, route: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Subtitle</Label>
                    <Input
                      value={pageForm.subtitle}
                      onChange={(e) => setPageForm({ ...pageForm, subtitle: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={pageForm.description}
                      onChange={(e) => setPageForm({ ...pageForm, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Page Type</Label>
                      <Select
                        value={pageForm.page_type}
                        onValueChange={(v) => setPageForm({ ...pageForm, page_type: v })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="service">Service</SelectItem>
                          <SelectItem value="report">Report</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Checkout Form</Label>
                      <Select
                        value={pageForm.form_type}
                        onValueChange={(v) => setPageForm({ ...pageForm, form_type: v })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FORM_TYPES.map((ft) => (
                            <SelectItem key={ft} value={ft}>{ft}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Features (one per line)</Label>
                    <Textarea value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} rows={4} />
                  </div>
                  <div>
                    <Label>FAQs (format: Question|||Answer, one per line)</Label>
                    <Textarea value={faqsText} onChange={(e) => setFaqsText(e.target.value)} rows={4} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>SEO Title</Label>
                      <Input
                        value={pageForm.seo_title}
                        onChange={(e) => setPageForm({ ...pageForm, seo_title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Sort Order</Label>
                      <Input
                        type="number"
                        value={pageForm.sort_order}
                        onChange={(e) => setPageForm({ ...pageForm, sort_order: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={pageForm.status === "published"}
                      onCheckedChange={(checked) =>
                        setPageForm({ ...pageForm, status: checked ? "published" : "draft" })
                      }
                    />
                    <Label>Publish immediately</Label>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Page</Button>
                  </DialogFooter>
                </form>
              ) : (
                <div className="space-y-4 py-1">
                  <div className="space-y-2 text-sm rounded-lg border border-border p-4">
                    <p className="font-medium">{pageForm.title}</p>
                    <p className="text-muted-foreground">{pageForm.route}</p>
                    <p className="text-muted-foreground">
                      Status: {pageForm.status === "published" ? "Published (live immediately)" : "Draft"}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This action will immediately update the live website. This change will be visible to
                    customers immediately. Please confirm you want to continue.
                  </p>
                  <DialogFooter className="pt-2">
                    <Button variant="outline" onClick={() => setPageStep("form")} disabled={saving}>
                      <ArrowLeft className="w-4 h-4 mr-1.5" />
                      Back
                    </Button>
                    <Button onClick={performSavePage} disabled={saving}>
                      {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Confirm & Publish
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* New/Edit Package — single Dialog, internal form -> confirm step */}
          <Dialog
            open={pkgOpen}
            onOpenChange={(open) => (open ? setPkgOpen(true) : closePkgDialog())}
          >
            <DialogTrigger asChild>
              <Button variant="outline" disabled={!pages.length} onClick={openCreatePackage}>
                <Plus className="w-4 h-4 mr-2" />
                New Package
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {pkgStep === "form"
                    ? `${editingPkg ? "Edit" : "New"} Package`
                    : "Confirm Live Website Update"}
                </DialogTitle>
              </DialogHeader>

              {pkgStep === "form" ? (
                <form onSubmit={handlePkgSubmit} className="space-y-3">
                  <div>
                    <Label>Service Page</Label>
                    <Select value={pkgForm.page_id} onValueChange={(v) => setPkgForm({ ...pkgForm, page_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select page" /></SelectTrigger>
                      <SelectContent>
                        {pages.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Package Name</Label>
                    <Input
                      value={pkgForm.name}
                      onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Tag / Badge</Label>
                    <Input value={pkgForm.tag} onChange={(e) => setPkgForm({ ...pkgForm, tag: e.target.value })} />
                  </div>
                  <div>
                    <Label>Payment Service Title</Label>
                    <Input
                      value={pkgForm.payment_service_title}
                      onChange={(e) => setPkgForm({ ...pkgForm, payment_service_title: e.target.value })}
                      placeholder="Exact title sent to checkout"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This exact title is what links this package to its entry in the Service Catalog —
                      keep it unique.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Price (₹)</Label>
                      <Input
                        type="number"
                        value={pkgForm.price}
                        onChange={(e) => setPkgForm({ ...pkgForm, price: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Original Price</Label>
                      <Input
                        type="number"
                        value={pkgForm.original_price}
                        onChange={(e) => setPkgForm({ ...pkgForm, original_price: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Checkout Form Override</Label>
                    <Select
                      value={pkgForm.form_type || pageForm.form_type}
                      onValueChange={(v) => setPkgForm({ ...pkgForm, form_type: v })}
                    >
                      <SelectTrigger><SelectValue placeholder="Use page default" /></SelectTrigger>
                      <SelectContent>
                        {FORM_TYPES.map((ft) => (
                          <SelectItem key={ft} value={ft}>{ft}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Features (one per line)</Label>
                    <Textarea
                      value={pkgFeaturesText}
                      onChange={(e) => setPkgFeaturesText(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={pkgForm.is_popular}
                        onCheckedChange={(v) => setPkgForm({ ...pkgForm, is_popular: v })}
                      />
                      <Label>Popular</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={pkgForm.is_active}
                        onCheckedChange={(v) => setPkgForm({ ...pkgForm, is_active: v })}
                      />
                      <Label>Active</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Package</Button>
                  </DialogFooter>
                </form>
              ) : (
                <div className="space-y-4 py-1">
                  <div className="space-y-2 text-sm rounded-lg border border-border p-4">
                    <p className="font-medium">{pkgForm.name}</p>
                    <p className="text-muted-foreground">
                      {pkgForm.payment_service_title || pkgForm.name} · ₹{Number(pkgForm.price).toLocaleString()}
                    </p>
                    <p className="text-muted-foreground">
                      {pkgForm.is_active ? "Active" : "Inactive"} in catalog
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This action will immediately update the live website. This change will be visible to
                    customers immediately. Please confirm you want to continue.
                  </p>
                  <DialogFooter className="pt-2">
                    <Button variant="outline" onClick={() => setPkgStep("form")} disabled={saving}>
                      <ArrowLeft className="w-4 h-4 mr-1.5" />
                      Back
                    </Button>
                    <Button onClick={performSavePackage} disabled={saving}>
                      {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Confirm & Publish
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      <Tabs defaultValue="pages">
        <TabsList>
          <TabsTrigger value="pages"><FileText className="w-4 h-4 mr-2" />Pages</TabsTrigger>
          <TabsTrigger value="packages"><Package className="w-4 h-4 mr-2" />Packages</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-3 mt-4">
          {pages.map((page) => (
            <div key={page.id} className="border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold">{page.title}</p>
                  <Badge variant={page.status === "published" ? "default" : "secondary"}>
                    {page.status}
                  </Badge>
                  <Badge variant="outline">{page.page_type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {page.route} · {page.category || "Uncategorized"} · Form: {page.form_type}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(packagesByPage.get(page.id) || []).length} package(s)
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {getCatalogSyncForSlug(page.slug) && (
                  <Button size="sm" variant="secondary" disabled={saving} onClick={() => setSyncTarget(page)}>
                    <Package className="w-4 h-4 mr-1" />
                    Sync Catalog
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => setPublishTarget(page)}>
                  <Globe className="w-4 h-4 mr-1" />
                  {page.status === "published" ? "Unpublish" : "Publish"}
                </Button>
                <Button size="icon" variant="outline" onClick={() => openEditPage(page)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setDeletePageTarget(page)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="packages" className="space-y-3 mt-4">
          {packages.map((pkg) => {
            const page = pages.find((p) => p.id === pkg.page_id);
            return (
              <div key={pkg.id} className="border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{pkg.name}</p>
                    {pkg.is_popular && <Badge>Popular</Badge>}
                    {!pkg.is_active && <Badge variant="secondary">Inactive</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {page?.title || "Unknown page"} · {formatINR(Number(pkg.price))}
                    {pkg.original_price ? ` (was ${formatINR(Number(pkg.original_price))})` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" onClick={() => openEditPackage(pkg)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setDeletePkgTarget(pkg)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* Publish / Unpublish confirmation — triggered directly from the list, no form dialog open beforehand */}
      <ConfirmLiveUpdateDialog
        open={!!publishTarget}
        onOpenChange={(o) => !o && setPublishTarget(null)}
        onConfirm={() => publishTarget && togglePublish(publishTarget)}
        title="Confirm Live Website Update"
        description={
          <>
            <p>
              {publishTarget?.status === "published"
                ? `Unpublishing "${publishTarget?.title}" will immediately remove it from the live website.`
                : `Publishing "${publishTarget?.title}" will immediately update the live website.`}
            </p>
            <p>Please confirm that you want to continue.</p>
            <p>This change will be visible to customers immediately.</p>
          </>
        }
        confirmLabel="Confirm & Publish"
      />

      {/* Sync Catalog confirmation — overwrites live page + package + service pricing data */}
      <ConfirmLiveUpdateDialog
        open={!!syncTarget}
        onOpenChange={(o) => !o && setSyncTarget(null)}
        onConfirm={() => syncTarget && syncCatalogForPage(syncTarget)}
        loading={saving}
        title="Confirm Live Website Update"
        description={
          <>
            <p>
              Syncing "{syncTarget?.title}" will immediately update its route, packages, and service
              catalog prices on the live website.
            </p>
            <p>Please confirm that you want to continue.</p>
            <p>This change will be visible to customers immediately.</p>
          </>
        }
        confirmLabel="Confirm & Publish"
      />

      {/* Delete Page confirmation — destructive variant */}
      <ConfirmLiveUpdateDialog
        open={!!deletePageTarget}
        onOpenChange={(o) => !o && setDeletePageTarget(null)}
        onConfirm={performDeletePage}
        loading={deletingPage}
        variant="destructive"
        title="Delete Service"
        description={
          <>
            <p>
              "{deletePageTarget?.title}" and all its packages will be removed from the live website.
            </p>
            <p>This action may affect customer bookings.</p>
            <p>Are you sure?</p>
          </>
        }
        confirmLabel="Delete Service"
      />

      {/* Delete Package confirmation — destructive variant */}
      <ConfirmLiveUpdateDialog
        open={!!deletePkgTarget}
        onOpenChange={(o) => !o && setDeletePkgTarget(null)}
        onConfirm={performDeletePkg}
        loading={deletingPkg}
        variant="destructive"
        title="Delete Service"
        description={
          <>
            <p>
              "{deletePkgTarget?.name}" will be removed from the live website.
            </p>
            <p>This action may affect customer bookings.</p>
            <p>Are you sure?</p>
          </>
        }
        confirmLabel="Delete Service"
      />
    </AdminPage>
  );
}