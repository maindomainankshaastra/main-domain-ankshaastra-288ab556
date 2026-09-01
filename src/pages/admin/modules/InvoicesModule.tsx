
// import { useEffect, useMemo, useState } from "react";
// import { useSearchParams } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";
// import { useAuth } from "@/hooks/useAuth";
// import { AdminPage } from "@/components/admin/AdminPage";
// import { useAdminTable } from "@/hooks/useAdminData";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
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
// import {
//   Download,
//   FileArchive,
//   Loader2,
//   Eye,
//   Trash2,
//   SlidersHorizontal,
//   MoreVertical,
//   Plus,
//   Mail,
//   ArrowLeft,
//   RotateCcw,
// } from "lucide-react";
// import { downloadMonthlyInvoiceZip, fetchInvoiceDownloadUrl } from "@/lib/invoice-download";
// import { createManualInvoice, sendInvoiceEmail } from "@/lib/invoice-actions";
// import { CONNECTED_SITE_OPTIONS } from "@/lib/connected-sites";
// import { toast } from "sonner";
// import { cn } from "@/lib/utils";

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
//   // NOTE: the actual columns written by invoice-engine.ts are
//   // `billing_address` and `customer_gstin` — not `customer_address` /
//   // `gst_number`. Using the real column names here so the View dialog
//   // below actually finds the data instead of always showing "—".
//   customer_email?: string;
//   billing_address?: string;
//   customer_gstin?: string;
//   gst_amount?: number;
//   cgst_amount?: number;
//   sgst_amount?: number;
//   igst_amount?: number;
//   created_at?: string;
//   // The order this invoice was generated from — shown in the View dialog
//   // (and exported to Sales Register / GSTR Excel) so an invoice can always
//   // be traced back to its original order.
//   order_id?: string | null;
//   // Soft-delete: set when an admin deletes the invoice from Invoice
//   // Manager. NULL/undefined = active invoice. Rows with this set are
//   // hidden from the default list (and from GST Reports) but stay in the
//   // database so they can be restored — see confirmDeleteInvoice /
//   // restoreInvoice below.
//   deleted_at?: string | null;
// };

// const MONTHS = [
//   "January", "February", "March", "April", "May", "June",
//   "July", "August", "September", "October", "November", "December",
// ];

// // Matches the state names resolved by stateCodeFromName() in the invoice
// // engine (indian-states.js) — picking one of these ensures the backend can
// // correctly resolve place of supply and CGST/SGST vs IGST.
// const INDIAN_STATES = [
//   "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
//   "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
//   "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
//   "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
//   "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
//   "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
//   "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
//   "Ladakh", "Lakshadweep", "Puducherry",
// ];

// const PAGE_SIZE = 10;

// // Same fixed status → color mapping used on Orders & Bookings, so "paid"
// // looks the same shade of green everywhere instead of each screen inventing
// // its own status color.
// const STATUS_STYLES: Record<string, string> = {
//   paid: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
//   pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
//   failed: "bg-red-100 text-red-700 hover:bg-red-100",
//   refunded: "bg-slate-200 text-slate-700 hover:bg-slate-200",
//   cancelled: "bg-slate-200 text-slate-600 hover:bg-slate-200",
// };

// // GST rate is fixed at 18% for manually-created invoices — no dropdown, no
// // admin choice. If a different rate is ever needed for a specific service,
// // that should go through the GST Configuration module instead.
// const FIXED_GST_RATE = 18;

// const PAYMENT_STATUS_OPTIONS = ["paid", "pending", "failed"];

// type CreateInvoiceForm = {
//   customerName: string;
//   customerEmail: string;
//   customerPhone: string;
//   sourceWebsite: string;
//   serviceTitle: string;
//   price: string;
//   paymentStatus: string;
//   invoiceDate: string;
//   notes: string;
//   customerCity: string;
//   customerState: string;
//   customerPincode: string;
//   customerGstin: string;
// };

// function emptyCreateForm(): CreateInvoiceForm {
//   const today = new Date().toISOString().slice(0, 10);
//   return {
//     customerName: "",
//     customerEmail: "",
//     customerPhone: "",
//     sourceWebsite: CONNECTED_SITE_OPTIONS[0]?.value || "ankshaastra.com",
//     serviceTitle: "",
//     price: "",
//     paymentStatus: "paid",
//     invoiceDate: today,
//     notes: "",
//     customerCity: "",
//     customerState: "",
//     customerPincode: "",
//     customerGstin: "",
//   };
// }

// // Matches the format used for invoiceDate in server/lib/build-invoice-template.ts
// // (en-GB, 2-digit day) so Invoice Date reads identically in the PDF, the
// // customer email, and this admin panel — e.g. "04 Aug 2026" everywhere.
// function formatDate(iso: string) {
//   return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
// }

// function formatDateTime(iso: string) {
//   const d = new Date(iso);
//   return `${formatDate(iso)}, ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
// }

// // Writes one row to audit_logs for an Invoice action (delete/restore).
// // Mirrors the local logAudit() in OrdersModule.tsx — same table, same
// // column names — so Invoice deletes/restores show up in the Audit Logs
// // page the same way Order deletes already do. Fire-and-forget: a logging
// // failure must never block or throw into the delete/restore action itself,
// // which has already succeeded by the time this runs.
// async function logAudit(
//   actionType: "delete" | "restore",
//   targetId: string,
//   targetName: string,
//   actorRole?: string | null,
//   sourceWebsite?: string | null,
// ) {
//   try {
//     const { data } = await supabase.auth.getUser();
//     const actor = data.user;
//     const { error } = await supabase.from("audit_logs").insert({
//       user_id: actor?.id ?? null,
//       user_name: actor?.user_metadata?.full_name || actor?.email || null,
//       user_email: actor?.email ?? null,
//       user_role: actorRole ?? null,
//       action_type: actionType,
//       module: "invoices",
//       record_id: targetId,
//       record_name: targetName,
//       source_website: sourceWebsite ?? null,
//     });
//     if (error) {
//       console.warn("[audit-log] failed to write invoices entry:", error.message);
//     }
//   } catch (err) {
//     console.warn("[audit-log] unexpected error writing invoices entry:", err);
//   }
// }

// export default function InvoicesModule() {
//   const { role } = useAuth();
//   const { rows, loading, reload } = useAdminTable<Invoice>("invoices", "invoice_date");
//   const [downloadingId, setDownloadingId] = useState<string | null>(null);
//   const [bulkLoading, setBulkLoading] = useState(false);
//   const [bulkProgress, setBulkProgress] = useState<string | null>(null);
//   const [searchParams, setSearchParams] = useSearchParams();

//   const now = new Date();
//   const [bulkYear, setBulkYear] = useState(String(now.getFullYear()));
//   const [bulkMonth, setBulkMonth] = useState(String(now.getMonth() + 1));
//   const [siteFilter, setSiteFilter] = useState("all");

//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [monthFilter, setMonthFilter] = useState("all");
//   const [yearFilter, setYearFilter] = useState("all");
//   const [dateFrom, setDateFrom] = useState("");
//   const [dateTo, setDateTo] = useState("");

//   const [showFilters, setShowFilters] = useState(false);

//   const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

//   // Deep-link support: Global Search sends ?open=<invoice id>. Instead of
//   // auto-opening a read-only dialog, scroll to and briefly highlight that
//   // exact row in the list, so the admin can use any action on it (View,
//   // Download, Email, Delete) themselves — not just see a static popup.
//   const [highlightedId, setHighlightedId] = useState<string | null>(null);
//   useEffect(() => {
//     const openId = searchParams.get("open");
//     if (!openId || !rows.length) return;
//     const match = rows.find((i) => i.id === openId);
//     if (match) {
//       setHighlightedId(openId);
//       setSearchParams({}, { replace: true });
//       // Wait a tick for the list to render, then scroll the row into view.
//       setTimeout(() => {
//         document.getElementById(`invoice-row-${openId}`)?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       }, 100);
//       // Remove the highlight after a few seconds.
//       setTimeout(() => setHighlightedId(null), 3000);
//     }
//   }, [searchParams, rows, setSearchParams]);

//   const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null);
//   const [deleting, setDeleting] = useState(false);

//   // Trash view: default list only ever shows active (non-deleted)
//   // invoices. Flipping this shows exactly the opposite — only
//   // soft-deleted ones — with a Restore action instead of Delete/Email/etc.
//   const [showDeleted, setShowDeleted] = useState(false);
//   const [restoringId, setRestoringId] = useState<string | null>(null);

//   const [page, setPage] = useState(1);

//   const [createOpen, setCreateOpen] = useState(false);
//   const [createStep, setCreateStep] = useState<"form" | "preview">("form");
//   const [createForm, setCreateForm] = useState<CreateInvoiceForm>(emptyCreateForm());
//   const [creating, setCreating] = useState(false);
//   const [createFormTouched, setCreateFormTouched] = useState(false);

//   const [emailInvoice, setEmailInvoice] = useState<Invoice | null>(null);
//   const [emailTo, setEmailTo] = useState("");
//   const [emailSubject, setEmailSubject] = useState("");
//   const [emailMessage, setEmailMessage] = useState("");
//   const [emailAttachPdf, setEmailAttachPdf] = useState(true);
//   const [sendingEmail, setSendingEmail] = useState(false);

//   const yearOptions = useMemo(() => {
//   const START_YEAR = 2026;
//   const END_YEAR = 2034;
//   return Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => String(START_YEAR + i));
// }, []);

//   const statusOptions = useMemo(() => {
//     const unique = Array.from(new Set(rows.map((i) => i.status).filter(Boolean)));
//     return unique;
//   }, [rows]);

//   const activeSecondaryFilterCount = [
//     statusFilter !== "all",
//     monthFilter !== "all",
//     yearFilter !== "all",
//     !!dateFrom,
//     !!dateTo,
//   ].filter(Boolean).length;

//   const filteredRows = useMemo(() => {
//     // Trash view flips this: normal browsing only ever shows active
//     // invoices, Trash only shows soft-deleted ones.
//     let data = rows.filter((i) => (showDeleted ? !!i.deleted_at : !i.deleted_at));

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
//   }, [rows, showDeleted, siteFilter, statusFilter, monthFilter, yearFilter, dateFrom, dateTo, search]);

//   useMemo(() => {
//     setPage(1);
//   }, [showDeleted, siteFilter, statusFilter, monthFilter, yearFilter, dateFrom, dateTo, search]);

//   const deletedCount = useMemo(() => rows.filter((i) => !!i.deleted_at).length, [rows]);

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

//   // Soft delete: stamps deleted_at/deleted_by instead of removing the row,
//   // so the invoice disappears from the normal list and from GST Reports
//   // (server filters deleted_at IS NULL) but can be brought back via
//   // restoreInvoice below. Email logs are left alone — they're history of
//   // what was actually sent, independent of whether the invoice is later
//   // deleted.
//   const confirmDeleteInvoice = async () => {
//     if (!deleteInvoiceId) return;
//     setDeleting(true);
//     try {
//       const { data: sessionData } = await supabase.auth.getSession();
//       const userId = sessionData.session?.user?.id;

//       const { error } = await supabase
//         .from("invoices")
//         .update({ deleted_at: new Date().toISOString(), deleted_by: userId })
//         .eq("id", deleteInvoiceId);

//       if (error) {
//         toast.error(error.message || "Failed to delete invoice");
//       } else {
//         const deletedInvoice = rows.find((i) => i.id === deleteInvoiceId);
//         void logAudit(
//           "delete",
//           deleteInvoiceId,
//           deletedInvoice?.invoice_number || deleteInvoiceId,
//           role,
//           deletedInvoice?.source_website,
//         );
//         toast.success("Invoice moved to Trash — you can restore it from there anytime");
//         reload();
//       }
//     } catch (e: unknown) {
//       toast.error(e instanceof Error ? e.message : "Failed to delete invoice");
//     } finally {
//       setDeleting(false);
//       setDeleteInvoiceId(null);
//     }
//   };

//   const restoreInvoice = async (invoiceId: string) => {
//     setRestoringId(invoiceId);
//     try {
//       const { error } = await supabase
//         .from("invoices")
//         .update({ deleted_at: null, deleted_by: null })
//         .eq("id", invoiceId);
//       if (error) {
//         toast.error(error.message || "Failed to restore invoice");
//       } else {
//         const restoredInvoice = rows.find((i) => i.id === invoiceId);
//         void logAudit(
//           "restore",
//           invoiceId,
//           restoredInvoice?.invoice_number || invoiceId,
//           role,
//           restoredInvoice?.source_website,
//         );
//         toast.success("Invoice restored");
//         reload();
//       }
//     } catch (e: unknown) {
//       toast.error(e instanceof Error ? e.message : "Failed to restore invoice");
//     } finally {
//       setRestoringId(null);
//     }
//   };

//   const openCreateModal = () => {
//     setCreateForm(emptyCreateForm());
//     setCreateStep("form");
//     setCreateFormTouched(false);
//     setCreateOpen(true);
//   };

//   const closeCreateModal = () => {
//     setCreateOpen(false);
//     setCreateStep("form");
//     setCreateForm(emptyCreateForm());
//     setCreateFormTouched(false);
//   };

//   const updateCreateForm = <K extends keyof CreateInvoiceForm>(key: K, value: CreateInvoiceForm[K]) => {
//     setCreateForm((f) => ({ ...f, [key]: value }));
//   };

//   const pincodeIsValid = /^\d{6}$/.test(createForm.customerPincode.trim());

//   const createFormIsValid =
//     !!createForm.customerName.trim() &&
//     !!createForm.customerEmail.trim() &&
//     !!createForm.serviceTitle.trim() &&
//     Number(createForm.price) > 0 &&
//     !!createForm.customerCity.trim() &&
//     !!createForm.customerState.trim() &&
//     pincodeIsValid;

//   const showCityError = createFormTouched && !createForm.customerCity.trim();
//   const showStateError = createFormTouched && !createForm.customerState.trim();
//   const showPincodeError = createFormTouched && !pincodeIsValid;

//   // Price entered by the admin is treated as GST-INCLUSIVE (i.e. it's the
//   // final amount the customer pays) — so the taxable value and GST portion
//   // are both back-calculated out of it, instead of adding GST on top of it.
//   // GST rate itself is fixed at 18% (FIXED_GST_RATE) — no admin choice.
//   const previewTotal = Number(createForm.price) || 0;
//   const previewAmount = previewTotal / (1 + FIXED_GST_RATE / 100);
//   const previewGstAmount = previewTotal - previewAmount;

//   const goToPreview = () => {
//     setCreateFormTouched(true);
//     if (!createFormIsValid) {
//       toast.error("Please fill customer name, email, service, price, city, state and a valid 6-digit pincode.");
//       return;
//     }
//     setCreateStep("preview");
//   };

//   const confirmCreateInvoice = async () => {
//     setCreating(true);
//     try {
//       const result = await createManualInvoice({
//         customerName: createForm.customerName.trim(),
//         customerEmail: createForm.customerEmail.trim(),
//         customerPhone: createForm.customerPhone.trim() || undefined,
//         sourceWebsite: createForm.sourceWebsite,
//         serviceTitle: createForm.serviceTitle.trim(),
//         // IMPORTANT: send the raw, GST-inclusive total the customer actually
//         // pays — invoice-engine.js (via processInvoiceJob) already divides
//         // this by (1 + gstRate/100) internally to derive the taxable amount
//         // and CGST/SGST/IGST split (confirmed from a real generated PDF:
//         // total_amount 293 -> taxable 248.31 -> matches 293 / 1.18). Sending
//         // previewAmount (the already-back-calculated taxable value) here
//         // instead would make the backend divide by 1.18 a second time.
//         price: previewTotal,
//         gstRate: FIXED_GST_RATE,
//         paymentStatus: createForm.paymentStatus,
//         invoiceDate: createForm.invoiceDate,
//         notes: createForm.notes.trim() || undefined,
//         customerCity: createForm.customerCity.trim() || undefined,
//         customerState: createForm.customerState.trim() || undefined,
//         customerPincode: createForm.customerPincode.trim() || undefined,
//         customerGstin: createForm.customerGstin.trim() || undefined,
//       });

//       if (result.ok === false) {
//         toast.error(result.error || "Invoice is still being generated — refresh in a few seconds.");
//         return;
//       }

//       toast.success(
//         result.invoice_number ? `Invoice ${result.invoice_number} created successfully` : "Invoice created successfully",
//       );
//       closeCreateModal();
//       reload();
//     } catch (e) {
//       toast.error(e instanceof Error ? e.message : "Could not create invoice");
//     } finally {
//       setCreating(false);
//     }
//   };

//   const openEmailModal = (inv: Invoice) => {
//     setEmailInvoice(inv);
//     setEmailTo(inv.customer_email || "");
//     setEmailSubject(`Invoice ${inv.invoice_number} — ${inv.service_title}`);
//     setEmailMessage(
//       `Dear ${inv.customer_name || "Customer"},\n\nPlease find your invoice ${inv.invoice_number} attached.\n\nThank you for choosing us.`,
//     );
//     setEmailAttachPdf(true);
//   };

//   const closeEmailModal = () => {
//     setEmailInvoice(null);
//     setEmailTo("");
//     setEmailSubject("");
//     setEmailMessage("");
//     setEmailAttachPdf(true);
//   };

//   const confirmSendEmail = async () => {
//     if (!emailInvoice) return;
//     if (!emailTo.trim()) {
//       toast.error("Recipient email is required");
//       return;
//     }
//     if (!emailSubject.trim()) {
//       toast.error("Subject is required");
//       return;
//     }

//     setSendingEmail(true);
//     try {
//       await sendInvoiceEmail({
//         invoiceId: emailInvoice.id,
//         to: emailTo.trim(),
//         subject: emailSubject.trim(),
//         message: emailMessage,
//         attachPdf: emailAttachPdf,
//       });
//       toast.success("Invoice email sent successfully");
//       closeEmailModal();
//     } catch (e) {
//       toast.error(e instanceof Error ? e.message : "Could not send invoice email");
//     } finally {
//       setSendingEmail(false);
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
//       <Button size="sm" variant="default" onClick={openCreateModal}>
//         <Plus className="w-4 h-4 mr-2" />
//         Create Invoice
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
//       <div className="mb-3 flex flex-wrap items-center gap-3">
//         <Input
//           placeholder="Search by invoice number, customer, email or service..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="w-full max-w-md"
//         />

//         <Select value={siteFilter} onValueChange={setSiteFilter}>
//           <SelectTrigger className="w-[200px]"><SelectValue placeholder="All sites" /></SelectTrigger>
//           <SelectContent>
//             {CONNECTED_SITE_OPTIONS.map((opt) => (
//               <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
//             ))}
//           </SelectContent>
//         </Select>

//         <Button
//           size="sm"
//           variant={activeSecondaryFilterCount > 0 ? "secondary" : "outline"}
//           onClick={() => setShowFilters((v) => !v)}
//         >
//           <SlidersHorizontal className="w-4 h-4 mr-1.5" />
//           Filters
//           {activeSecondaryFilterCount > 0 && (
//             <Badge variant="outline" className="ml-1.5 h-5 min-w-5 px-1 text-xs">
//               {activeSecondaryFilterCount}
//             </Badge>
//           )}
//         </Button>

//         <Button
//           size="sm"
//           variant={showDeleted ? "secondary" : "outline"}
//           onClick={() => setShowDeleted((v) => !v)}
//         >
//           <Trash2 className="w-4 h-4 mr-1.5" />
//           {showDeleted ? "Back to Invoices" : "Trash"}
//           {deletedCount > 0 && (
//             <Badge variant="outline" className="ml-1.5 h-5 min-w-5 px-1 text-xs">
//               {deletedCount}
//             </Badge>
//           )}
//         </Button>
//       </div>

//       {showDeleted && (
//         <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
//           Showing deleted invoices. These are excluded from GST Reports and the normal list until restored.
//         </div>
//       )}

//       {showFilters && (
//         <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
//           <Select value={statusFilter} onValueChange={setStatusFilter}>
//             <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All statuses</SelectItem>
//               {statusOptions.map((s) => (
//                 <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           <Select value={monthFilter} onValueChange={setMonthFilter}>
//             <SelectTrigger className="w-[140px]"><SelectValue placeholder="Month" /></SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All months</SelectItem>
//               {MONTHS.map((label, index) => (
//                 <SelectItem key={label} value={String(index + 1)}>{label}</SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           <Select value={yearFilter} onValueChange={setYearFilter}>
//             <SelectTrigger className="w-[110px]"><SelectValue placeholder="Year" /></SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All years</SelectItem>
//               {yearOptions.map((year) => (
//                 <SelectItem key={year} value={year}>{year}</SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           <div className="flex items-center gap-2">
//             <Input
//               type="date"
//               value={dateFrom}
//               onChange={(e) => setDateFrom(e.target.value)}
//               className="w-[150px]"
//             />
//             <span className="text-xs text-muted-foreground">to</span>
//             <Input
//               type="date"
//               value={dateTo}
//               onChange={(e) => setDateTo(e.target.value)}
//               className="w-[150px]"
//             />
//           </div>

//           {(activeSecondaryFilterCount > 0 || search) && (
//             <Button
//               size="sm"
//               variant="ghost"
//               onClick={() => {
//                 setStatusFilter("all");
//                 setMonthFilter("all");
//                 setYearFilter("all");
//                 setDateFrom("");
//                 setDateTo("");
//               }}
//             >
//               Clear filters
//             </Button>
//           )}
//         </div>
//       )}

//       <div className="space-y-2">
//         {paginatedRows.map((i) => (
//           <div
//             key={i.id}
//             id={`invoice-row-${i.id}`}
//             className={cn(
//               "flex flex-wrap justify-between gap-3 border rounded-lg p-4 transition-colors",
//               highlightedId === i.id
//                 ? "border-primary ring-2 ring-primary/40 bg-primary/5"
//                 : "border-border"
//             )}
//           >
//             <div>
//               <div className="flex items-center gap-2 mb-1">
//                 <Badge variant="outline" className="text-xs">
//                   {i.source_website || "ankshaastra.com"}
//                 </Badge>
//                 <p className="font-semibold text-primary">{i.invoice_number}</p>
//               </div>
//               <p className="text-sm text-muted-foreground">{i.customer_name} · {i.service_title}</p>
//               <p className="text-xs text-muted-foreground mt-1">{formatDate(i.invoice_date)}</p>
//             </div>
//             <div className="flex items-center gap-3">
//               <span className="font-semibold">₹{Number(i.total_amount).toLocaleString()}</span>

//               <Badge className={cn("capitalize border-0", STATUS_STYLES[i.status] || STATUS_STYLES.cancelled)}>
//                 {i.status}
//               </Badge>

//               {showDeleted ? (
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   disabled={restoringId === i.id}
//                   onClick={() => restoreInvoice(i.id)}
//                 >
//                   {restoringId === i.id ? (
//                     <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
//                   ) : (
//                     <RotateCcw className="w-4 h-4 mr-1.5" />
//                   )}
//                   Restore
//                 </Button>
//               ) : (
//                 <>
//                   {(i.pdf_storage_path || i.pdf_url) && (
//                     <Button
//                       size="icon"
//                       variant="ghost"
//                       className="h-8 w-8"
//                       disabled={downloadingId === i.id}
//                       onClick={() => downloadInvoice(i)}
//                       aria-label="Download invoice PDF"
//                     >
//                       {downloadingId === i.id ? (
//                         <Loader2 className="w-4 h-4 animate-spin" />
//                       ) : (
//                         <Download className="w-4 h-4" />
//                       )}
//                     </Button>
//                   )}

//                   <Button
//                     size="icon"
//                     variant="ghost"
//                     className="h-8 w-8"
//                     onClick={() => setViewInvoice(i)}
//                     aria-label="View invoice details"
//                   >
//                     <Eye className="w-4 h-4" />
//                   </Button>

//                   <Button
//                     size="icon"
//                     variant="ghost"
//                     className="h-8 w-8"
//                     onClick={() => openEmailModal(i)}
//                     aria-label="Send invoice email"
//                   >
//                     <Mail className="w-4 h-4" />
//                   </Button>

//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="More actions">
//                         <MoreVertical className="w-4 h-4" />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end">
//                       <DropdownMenuItem
//                         onClick={() => setDeleteInvoiceId(i.id)}
//                         className="text-destructive focus:text-destructive"
//                       >
//                         <Trash2 className="w-4 h-4 mr-2" />
//                         Delete
//                       </DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       {filteredRows.length > 0 && (
//         <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//           <p className="text-xs text-muted-foreground">
//             Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredRows.length)} of{" "}
//             {filteredRows.length}
//           </p>
//           <div className="flex items-center gap-3">
//             <Button size="sm" variant="outline" onClick={goToPreviousPage} disabled={page <= 1}>
//               Previous
//             </Button>
//             <p className="text-xs text-muted-foreground whitespace-nowrap">
//               Page {page} of {totalPages}
//             </p>
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
//                 <span className="text-muted-foreground">Order ID</span>
//                 <span className="font-medium font-mono text-xs">{viewInvoice.order_id || "—"}</span>
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
//                 <span className="font-medium text-right">{viewInvoice.billing_address || "—"}</span>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">GST Number</span>
//                 <span className="font-medium">{viewInvoice.customer_gstin || "—"}</span>
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
//                 <span className="text-muted-foreground">
//                   {Number(viewInvoice.igst_amount || 0) > 0 ? "IGST Amount" : "CGST + SGST Amount"}
//                 </span>
//                 <span className="font-medium">
//                   ₹{(
//                     Number(viewInvoice.cgst_amount || 0) +
//                     Number(viewInvoice.sgst_amount || 0) +
//                     Number(viewInvoice.igst_amount || 0)
//                   ).toLocaleString()}
//                 </span>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Total</span>
//                 <span className="font-medium">
//                   ₹{Number(viewInvoice.total_amount).toLocaleString()}
//                 </span>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Status</span>
//                 <Badge className={cn("capitalize border-0", STATUS_STYLES[viewInvoice.status] || STATUS_STYLES.cancelled)}>
//                   {viewInvoice.status}
//                 </Badge>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Website</span>
//                 <span className="font-medium">{viewInvoice.source_website || "ankshaastra.com"}</span>
//               </div>
//               <div className="flex justify-between pb-1">
//                 <span className="text-muted-foreground">Created Date</span>
//                 <span className="font-medium">
//                   {formatDateTime(viewInvoice.created_at || viewInvoice.invoice_date)}
//                 </span>
//               </div>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Create Invoice Dialog (two steps: form → preview) */}
//       <Dialog open={createOpen} onOpenChange={(open) => !open && !creating && closeCreateModal()}>
//         <DialogContent className="max-h-[85vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>
//               {createStep === "form" ? "Create Invoice" : "Preview Invoice"}
//             </DialogTitle>
//             <DialogDescription>
//               {createStep === "form"
//                 ? "Enter customer and service details to generate a new invoice."
//                 : "Review the details below, then confirm to generate the invoice."}
//             </DialogDescription>
//           </DialogHeader>

//           {createStep === "form" ? (
//             <div className="space-y-4 py-1">
//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1.5">
//                   <Label htmlFor="inv-customer-name">Customer Name</Label>
//                   <Input
//                     id="inv-customer-name"
//                     value={createForm.customerName}
//                     onChange={(e) => updateCreateForm("customerName", e.target.value)}
//                     placeholder="Full name"
//                   />
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label htmlFor="inv-customer-email">Customer Email</Label>
//                   <Input
//                     id="inv-customer-email"
//                     type="email"
//                     value={createForm.customerEmail}
//                     onChange={(e) => updateCreateForm("customerEmail", e.target.value)}
//                     placeholder="name@example.com"
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1.5">
//                   <Label htmlFor="inv-phone">Phone</Label>
//                   <Input
//                     id="inv-phone"
//                     value={createForm.customerPhone}
//                     onChange={(e) => updateCreateForm("customerPhone", e.target.value)}
//                     placeholder="+91 XXXXX XXXXX"
//                   />
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label>Website</Label>
//                   <Select
//                     value={createForm.sourceWebsite}
//                     onValueChange={(v) => updateCreateForm("sourceWebsite", v)}
//                   >
//                     <SelectTrigger><SelectValue placeholder="Select site" /></SelectTrigger>
//                     <SelectContent>
//                       {CONNECTED_SITE_OPTIONS.map((opt) => (
//                         <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1.5">
//                   <Label htmlFor="inv-city">
//                     City <span className="text-destructive">*</span>
//                   </Label>
//                   <Input
//                     id="inv-city"
//                     value={createForm.customerCity}
//                     onChange={(e) => updateCreateForm("customerCity", e.target.value)}
//                     placeholder="e.g. Jaipur"
//                     aria-invalid={showCityError}
//                     className={cn(showCityError && "border-destructive focus-visible:ring-destructive")}
//                   />
//                   {showCityError && (
//                     <p className="text-xs text-destructive">City is required.</p>
//                   )}
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label>
//                     State <span className="text-destructive">*</span>
//                   </Label>
//                   <Select
//                     value={createForm.customerState}
//                     onValueChange={(v) => updateCreateForm("customerState", v)}
//                   >
//                     <SelectTrigger
//                       aria-invalid={showStateError}
//                       className={cn(showStateError && "border-destructive focus-visible:ring-destructive")}
//                     >
//                       <SelectValue placeholder="Select state" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {INDIAN_STATES.map((state) => (
//                         <SelectItem key={state} value={state}>{state}</SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   {showStateError && (
//                     <p className="text-xs text-destructive">State is required.</p>
//                   )}
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1.5">
//                   <Label htmlFor="inv-pincode">
//                     Pincode <span className="text-destructive">*</span>
//                   </Label>
//                   <Input
//                     id="inv-pincode"
//                     value={createForm.customerPincode}
//                     onChange={(e) =>
//                       updateCreateForm("customerPincode", e.target.value.replace(/\D/g, "").slice(0, 6))
//                     }
//                     placeholder="e.g. 302001"
//                     inputMode="numeric"
//                     maxLength={6}
//                     aria-invalid={showPincodeError}
//                     className={cn(showPincodeError && "border-destructive focus-visible:ring-destructive")}
//                   />
//                   {showPincodeError && (
//                     <p className="text-xs text-destructive">Enter a valid 6-digit pincode.</p>
//                   )}
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label htmlFor="inv-gstin">Customer GSTIN (optional, for B2B)</Label>
//                   <Input
//                     id="inv-gstin"
//                     value={createForm.customerGstin}
//                     onChange={(e) => updateCreateForm("customerGstin", e.target.value.toUpperCase())}
//                     placeholder="e.g. 09AAFFE7583B1ZD"
//                     className="uppercase"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-1.5">
//                 <Label htmlFor="inv-service">Service</Label>
//                 <Input
//                   id="inv-service"
//                   value={createForm.serviceTitle}
//                   onChange={(e) => updateCreateForm("serviceTitle", e.target.value)}
//                   placeholder="e.g. Astrology Consultation"
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1.5">
//                   <Label htmlFor="inv-price">Price (₹, inclusive of GST)</Label>
//                   <Input
//                     id="inv-price"
//                     type="number"
//                     min="0"
//                     value={createForm.price}
//                     onChange={(e) => updateCreateForm("price", e.target.value)}
//                     placeholder="0.00"
//                   />
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label>GST %</Label>
//                   {/* Fixed at 18% — no dropdown, no admin choice. */}
//                   <Input value={`${FIXED_GST_RATE}% (fixed)`} disabled readOnly />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1.5">
//                   <Label>Payment Status</Label>
//                   <Select
//                     value={createForm.paymentStatus}
//                     onValueChange={(v) => updateCreateForm("paymentStatus", v)}
//                   >
//                     <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
//                     <SelectContent>
//                       {PAYMENT_STATUS_OPTIONS.map((s) => (
//                         <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label htmlFor="inv-date">Invoice Date</Label>
//                   <Input
//                     id="inv-date"
//                     type="date"
//                     value={createForm.invoiceDate}
//                     onChange={(e) => updateCreateForm("invoiceDate", e.target.value)}
//                   />
//                 </div>
//               </div>

//               <div className="space-y-1.5">
//                 <Label htmlFor="inv-notes">Notes</Label>
//                 <Textarea
//                   id="inv-notes"
//                   value={createForm.notes}
//                   onChange={(e) => updateCreateForm("notes", e.target.value)}
//                   placeholder="Optional internal notes"
//                   rows={3}
//                 />
//               </div>

//               <DialogFooter className="pt-2">
//                 <Button variant="outline" onClick={closeCreateModal}>Cancel</Button>
//                 <Button onClick={goToPreview}>Preview Invoice</Button>
//               </DialogFooter>
//             </div>
//           ) : (
//             <div className="space-y-4 py-1">
//               <div className="space-y-2 text-sm rounded-lg border border-border p-4">
//                 <div className="flex justify-between border-b border-border pb-2">
//                   <span className="text-muted-foreground">Invoice Number</span>
//                   <span className="font-medium">Auto-generated on save</span>
//                 </div>
//                 <div className="flex justify-between border-b border-border pb-2">
//                   <span className="text-muted-foreground">Customer</span>
//                   <span className="font-medium text-right">
//                     {createForm.customerName}
//                     <br />
//                     <span className="text-xs text-muted-foreground">{createForm.customerEmail}</span>
//                   </span>
//                 </div>
//                 <div className="flex justify-between border-b border-border pb-2">
//                   <span className="text-muted-foreground">Billing Address</span>
//                   <span className="font-medium text-right">
//                     {[createForm.customerCity, createForm.customerState, createForm.customerPincode]
//                       .filter(Boolean)
//                       .join(", ") || "—"}
//                   </span>
//                 </div>
//                 <div className="flex justify-between border-b border-border pb-2">
//                   <span className="text-muted-foreground">Customer GSTIN</span>
//                   <span className="font-medium">{createForm.customerGstin || "—"}</span>
//                 </div>
//                 <div className="flex justify-between border-b border-border pb-2">
//                   <span className="text-muted-foreground">Website</span>
//                   <span className="font-medium">
//                     {CONNECTED_SITE_OPTIONS.find((o) => o.value === createForm.sourceWebsite)?.label ||
//                       createForm.sourceWebsite}
//                   </span>
//                 </div>
//                 <div className="flex justify-between border-b border-border pb-2">
//                   <span className="text-muted-foreground">Service</span>
//                   <span className="font-medium text-right">{createForm.serviceTitle}</span>
//                 </div>
//                 <div className="flex justify-between border-b border-border pb-2">
//                   <span className="text-muted-foreground">Price (incl. GST)</span>
//                   <span className="font-medium">₹{previewTotal.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between border-b border-border pb-2">
//                   <span className="text-muted-foreground">Taxable Amount</span>
//                   <span className="font-medium">₹{previewAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
//                 </div>
//                 <div className="flex justify-between border-b border-border pb-2">
//                   <span className="text-muted-foreground">GST ({FIXED_GST_RATE}%, included)</span>
//                   <span className="font-medium">₹{previewGstAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
//                 </div>
//                 <div className="flex justify-between border-b border-border pb-2">
//                   <span className="text-muted-foreground">Total (Customer Pays)</span>
//                   <span className="font-semibold">₹{previewTotal.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between pb-1">
//                   <span className="text-muted-foreground">Email</span>
//                   <span className="font-medium">{createForm.customerEmail}</span>
//                 </div>
//               </div>

//               <p className="text-xs text-muted-foreground">
//                 This is an estimated preview. The final CGST/SGST vs IGST split is calculated by the
//                 system based on the business's GST configuration and the customer's state at the time
//                 the invoice is generated.
//               </p>

//               <DialogFooter className="pt-2">
//                 <Button variant="outline" onClick={() => setCreateStep("form")} disabled={creating}>
//                   <ArrowLeft className="w-4 h-4 mr-1.5" />
//                   Back
//                 </Button>
//                 <Button onClick={confirmCreateInvoice} disabled={creating}>
//                   {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
//                   Confirm &amp; Create
//                 </Button>
//               </DialogFooter>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Send Email Dialog */}
//       <Dialog open={!!emailInvoice} onOpenChange={(open) => !open && !sendingEmail && closeEmailModal()}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Send Invoice Email</DialogTitle>
//             <DialogDescription>
//               {emailInvoice ? `Send invoice ${emailInvoice.invoice_number} to the customer.` : ""}
//             </DialogDescription>
//           </DialogHeader>

//           <div className="space-y-4 py-1">
//             <div className="space-y-1.5">
//               <Label htmlFor="email-to">Customer Email</Label>
//               <Input
//                 id="email-to"
//                 type="email"
//                 value={emailTo}
//                 onChange={(e) => setEmailTo(e.target.value)}
//                 placeholder="name@example.com"
//               />
//             </div>

//             <div className="space-y-1.5">
//               <Label htmlFor="email-subject">Subject</Label>
//               <Input
//                 id="email-subject"
//                 value={emailSubject}
//                 onChange={(e) => setEmailSubject(e.target.value)}
//               />
//             </div>

//             <div className="space-y-1.5">
//               <Label htmlFor="email-message">Message</Label>
//               <Textarea
//                 id="email-message"
//                 rows={5}
//                 value={emailMessage}
//                 onChange={(e) => setEmailMessage(e.target.value)}
//               />
//             </div>

//             <div className="flex items-center gap-2">
//               <Checkbox
//                 id="email-attach-pdf"
//                 checked={emailAttachPdf}
//                 onCheckedChange={(checked) => setEmailAttachPdf(checked === true)}
//               />
//               <Label htmlFor="email-attach-pdf" className="cursor-pointer font-normal">
//                 Attach PDF
//               </Label>
//             </div>
//           </div>

//           <DialogFooter>
//             <Button variant="outline" onClick={closeEmailModal} disabled={sendingEmail}>
//               Cancel
//             </Button>
//             <Button onClick={confirmSendEmail} disabled={sendingEmail}>
//               {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
//               Send Invoice
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Delete Invoice Confirmation Dialog */}
//       <AlertDialog open={!!deleteInvoiceId} onOpenChange={(open) => !open && setDeleteInvoiceId(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete this invoice?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This invoice will move to Trash and be excluded from GST Reports. You can restore it
//               anytime from the Trash tab — nothing is permanently removed.
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


// // import { useEffect, useMemo, useState } from "react";
// // import { useSearchParams } from "react-router-dom";
// // import { supabase } from "@/integrations/supabase/client";
// // import { AdminPage } from "@/components/admin/AdminPage";
// // import { useAdminTable } from "@/hooks/useAdminData";
// // import { Badge } from "@/components/ui/badge";
// // import { Button } from "@/components/ui/button";
// // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { Textarea } from "@/components/ui/textarea";
// // import { Checkbox } from "@/components/ui/checkbox";
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogHeader,
// //   DialogTitle,
// //   DialogDescription,
// //   DialogFooter,
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
// // import {
// //   DropdownMenu,
// //   DropdownMenuContent,
// //   DropdownMenuItem,
// //   DropdownMenuSeparator,
// //   DropdownMenuTrigger,
// // } from "@/components/ui/dropdown-menu";
// // import {
// //   Download,
// //   FileArchive,
// //   Loader2,
// //   Eye,
// //   Trash2,
// //   SlidersHorizontal,
// //   MoreVertical,
// //   Plus,
// //   Mail,
// //   ArrowLeft,
// // } from "lucide-react";
// // import { downloadMonthlyInvoiceZip, fetchInvoiceDownloadUrl } from "@/lib/invoice-download";
// // import { createManualInvoice, sendInvoiceEmail } from "@/lib/invoice-actions";
// // import { CONNECTED_SITE_OPTIONS } from "@/lib/connected-sites";
// // import { toast } from "sonner";
// // import { cn } from "@/lib/utils";

// // type Invoice = {
// //   id: string;
// //   invoice_number: string;
// //   customer_name: string;
// //   service_title: string;
// //   total_amount: number;
// //   status: string;
// //   source_website?: string;
// //   pdf_url?: string;
// //   pdf_storage_path?: string | null;
// //   invoice_date: string;
// //   // NOTE: the actual columns written by invoice-engine.ts are
// //   // `billing_address` and `customer_gstin` — not `customer_address` /
// //   // `gst_number`. Using the real column names here so the View dialog
// //   // below actually finds the data instead of always showing "—".
// //   customer_email?: string;
// //   billing_address?: string;
// //   customer_gstin?: string;
// //   gst_amount?: number;
// //   cgst_amount?: number;
// //   sgst_amount?: number;
// //   igst_amount?: number;
// //   created_at?: string;
// // };

// // const MONTHS = [
// //   "January", "February", "March", "April", "May", "June",
// //   "July", "August", "September", "October", "November", "December",
// // ];

// // // Matches the state names resolved by stateCodeFromName() in the invoice
// // // engine (indian-states.js) — picking one of these ensures the backend can
// // // correctly resolve place of supply and CGST/SGST vs IGST.
// // const INDIAN_STATES = [
// //   "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
// //   "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
// //   "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
// //   "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
// //   "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
// //   "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
// //   "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
// //   "Ladakh", "Lakshadweep", "Puducherry",
// // ];

// // const PAGE_SIZE = 10;

// // // Same fixed status → color mapping used on Orders & Bookings, so "paid"
// // // looks the same shade of green everywhere instead of each screen inventing
// // // its own status color.
// // const STATUS_STYLES: Record<string, string> = {
// //   paid: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
// //   pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
// //   failed: "bg-red-100 text-red-700 hover:bg-red-100",
// //   refunded: "bg-slate-200 text-slate-700 hover:bg-slate-200",
// //   cancelled: "bg-slate-200 text-slate-600 hover:bg-slate-200",
// // };

// // // GST rate is fixed at 18% for manually-created invoices — no dropdown, no
// // // admin choice. If a different rate is ever needed for a specific service,
// // // that should go through the GST Configuration module instead.
// // const FIXED_GST_RATE = 18;

// // const PAYMENT_STATUS_OPTIONS = ["paid", "pending", "failed"];

// // type CreateInvoiceForm = {
// //   customerName: string;
// //   customerEmail: string;
// //   customerPhone: string;
// //   sourceWebsite: string;
// //   serviceTitle: string;
// //   price: string;
// //   paymentStatus: string;
// //   invoiceDate: string;
// //   notes: string;
// //   customerCity: string;
// //   customerState: string;
// //   customerPincode: string;
// //   customerGstin: string;
// // };

// // function emptyCreateForm(): CreateInvoiceForm {
// //   const today = new Date().toISOString().slice(0, 10);
// //   return {
// //     customerName: "",
// //     customerEmail: "",
// //     customerPhone: "",
// //     sourceWebsite: CONNECTED_SITE_OPTIONS[0]?.value || "ankshaastra.com",
// //     serviceTitle: "",
// //     price: "",
// //     paymentStatus: "paid",
// //     invoiceDate: today,
// //     notes: "",
// //     customerCity: "",
// //     customerState: "",
// //     customerPincode: "",
// //     customerGstin: "",
// //   };
// // }

// // // Matches the format used for invoiceDate in server/lib/build-invoice-template.ts
// // // (en-GB, 2-digit day) so Invoice Date reads identically in the PDF, the
// // // customer email, and this admin panel — e.g. "04 Aug 2026" everywhere.
// // function formatDate(iso: string) {
// //   return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
// // }

// // function formatDateTime(iso: string) {
// //   const d = new Date(iso);
// //   return `${formatDate(iso)}, ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
// // }

// // export default function InvoicesModule() {
// //   const { rows, loading, reload } = useAdminTable<Invoice>("invoices", "invoice_date");
// //   const [downloadingId, setDownloadingId] = useState<string | null>(null);
// //   const [bulkLoading, setBulkLoading] = useState(false);
// //   const [bulkProgress, setBulkProgress] = useState<string | null>(null);
// //   const [searchParams, setSearchParams] = useSearchParams();

// //   const now = new Date();
// //   const [bulkYear, setBulkYear] = useState(String(now.getFullYear()));
// //   const [bulkMonth, setBulkMonth] = useState(String(now.getMonth() + 1));
// //   const [siteFilter, setSiteFilter] = useState("all");

// //   const [search, setSearch] = useState("");
// //   const [statusFilter, setStatusFilter] = useState("all");
// //   const [monthFilter, setMonthFilter] = useState("all");
// //   const [yearFilter, setYearFilter] = useState("all");
// //   const [dateFrom, setDateFrom] = useState("");
// //   const [dateTo, setDateTo] = useState("");

// //   const [showFilters, setShowFilters] = useState(false);

// //   const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

// //   // Deep-link support: Global Search sends ?open=<invoice id>. Instead of
// //   // auto-opening a read-only dialog, scroll to and briefly highlight that
// //   // exact row in the list, so the admin can use any action on it (View,
// //   // Download, Email, Delete) themselves — not just see a static popup.
// //   const [highlightedId, setHighlightedId] = useState<string | null>(null);
// //   useEffect(() => {
// //     const openId = searchParams.get("open");
// //     if (!openId || !rows.length) return;
// //     const match = rows.find((i) => i.id === openId);
// //     if (match) {
// //       setHighlightedId(openId);
// //       setSearchParams({}, { replace: true });
// //       // Wait a tick for the list to render, then scroll the row into view.
// //       setTimeout(() => {
// //         document.getElementById(`invoice-row-${openId}`)?.scrollIntoView({
// //           behavior: "smooth",
// //           block: "center",
// //         });
// //       }, 100);
// //       // Remove the highlight after a few seconds.
// //       setTimeout(() => setHighlightedId(null), 3000);
// //     }
// //   }, [searchParams, rows, setSearchParams]);

// //   const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null);
// //   const [deleting, setDeleting] = useState(false);

// //   const [page, setPage] = useState(1);

// //   const [createOpen, setCreateOpen] = useState(false);
// //   const [createStep, setCreateStep] = useState<"form" | "preview">("form");
// //   const [createForm, setCreateForm] = useState<CreateInvoiceForm>(emptyCreateForm());
// //   const [creating, setCreating] = useState(false);
// //   const [createFormTouched, setCreateFormTouched] = useState(false);

// //   const [emailInvoice, setEmailInvoice] = useState<Invoice | null>(null);
// //   const [emailTo, setEmailTo] = useState("");
// //   const [emailSubject, setEmailSubject] = useState("");
// //   const [emailMessage, setEmailMessage] = useState("");
// //   const [emailAttachPdf, setEmailAttachPdf] = useState(true);
// //   const [sendingEmail, setSendingEmail] = useState(false);

// //   const yearOptions = useMemo(() => {
// //   const START_YEAR = 2026;
// //   const END_YEAR = 2034;
// //   return Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => String(START_YEAR + i));
// // }, []);

// //   const statusOptions = useMemo(() => {
// //     const unique = Array.from(new Set(rows.map((i) => i.status).filter(Boolean)));
// //     return unique;
// //   }, [rows]);

// //   const activeSecondaryFilterCount = [
// //     statusFilter !== "all",
// //     monthFilter !== "all",
// //     yearFilter !== "all",
// //     !!dateFrom,
// //     !!dateTo,
// //   ].filter(Boolean).length;

// //   const filteredRows = useMemo(() => {
// //     let data = rows;

// //     if (siteFilter !== "all") {
// //       data = data.filter((i) => (i.source_website || "ankshaastra.com") === siteFilter);
// //     }
// //     if (statusFilter !== "all") {
// //       data = data.filter((i) => i.status === statusFilter);
// //     }
// //     if (monthFilter !== "all") {
// //       data = data.filter((i) => {
// //         const d = new Date(i.invoice_date);
// //         return String(d.getMonth() + 1) === monthFilter;
// //       });
// //     }
// //     if (yearFilter !== "all") {
// //       data = data.filter((i) => {
// //         const d = new Date(i.invoice_date);
// //         return String(d.getFullYear()) === yearFilter;
// //       });
// //     }
// //     if (dateFrom) {
// //       const from = new Date(dateFrom);
// //       data = data.filter((i) => new Date(i.invoice_date) >= from);
// //     }
// //     if (dateTo) {
// //       const to = new Date(dateTo);
// //       to.setHours(23, 59, 59, 999);
// //       data = data.filter((i) => new Date(i.invoice_date) <= to);
// //     }
// //     if (search.trim()) {
// //       const q = search.toLowerCase();
// //       data = data.filter(
// //         (i) =>
// //           (i.invoice_number || "").toLowerCase().includes(q) ||
// //           (i.customer_name || "").toLowerCase().includes(q) ||
// //           (i.customer_email || "").toLowerCase().includes(q) ||
// //           (i.service_title || "").toLowerCase().includes(q)
// //       );
// //     }
// //     return data;
// //   }, [rows, siteFilter, statusFilter, monthFilter, yearFilter, dateFrom, dateTo, search]);

// //   useMemo(() => {
// //     setPage(1);
// //   }, [siteFilter, statusFilter, monthFilter, yearFilter, dateFrom, dateTo, search]);

// //   const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));

// //   const paginatedRows = useMemo(() => {
// //     const start = (page - 1) * PAGE_SIZE;
// //     return filteredRows.slice(start, start + PAGE_SIZE);
// //   }, [filteredRows, page]);

// //   const goToPreviousPage = () => setPage((p) => Math.max(1, p - 1));
// //   const goToNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

// //   const downloadInvoice = async (inv: Invoice) => {
// //     setDownloadingId(inv.id);
// //     try {
// //       const url = (await fetchInvoiceDownloadUrl(inv.id)) || inv.pdf_url;
// //       if (!url) {
// //         toast.error("Invoice PDF is not available yet.");
// //         return;
// //       }
// //       window.open(url, "_blank", "noopener,noreferrer");
// //     } catch {
// //       toast.error("Could not download invoice");
// //     } finally {
// //       setDownloadingId(null);
// //     }
// //   };

// //   const downloadMonthlyBundle = async () => {
// //     setBulkLoading(true);
// //     setBulkProgress("Preparing…");
// //     try {
// //       const result = await downloadMonthlyInvoiceZip(Number(bulkYear), Number(bulkMonth), (p) => {
// //         if (p.phase === "listing") {
// //           setBulkProgress("Loading invoice list…");
// //         } else if (p.phase === "downloading") {
// //           setBulkProgress(`Downloading PDFs ${p.done}/${p.total}…`);
// //         } else {
// //           setBulkProgress("Creating ZIP file…");
// //         }
// //       });
// //       const monthLabel = MONTHS[Number(bulkMonth) - 1];
// //       toast.success(
// //         `Downloaded ${result.included} invoice${result.included === 1 ? "" : "s"} for ${monthLabel} ${bulkYear}` +
// //           (result.skipped ? ` (${result.skipped} skipped)` : ""),
// //       );
// //     } catch (e) {
// //       toast.error(e instanceof Error ? e.message : "Bulk download failed");
// //     } finally {
// //       setBulkLoading(false);
// //       setBulkProgress(null);
// //     }
// //   };

// //   const confirmDeleteInvoice = async () => {
// //     if (!deleteInvoiceId) return;
// //     setDeleting(true);
// //     try {
// //       const { error: emailLogsError } = await supabase
// //         .from("email_logs")
// //         .delete()
// //         .eq("invoice_id", deleteInvoiceId);

// //       if (emailLogsError && emailLogsError.code !== "42703") {
// //         toast.error(emailLogsError.message || "Failed to delete related email logs");
// //         return;
// //       }

// //       const { error } = await supabase.from("invoices").delete().eq("id", deleteInvoiceId);
// //       if (error) {
// //         toast.error(error.message || "Failed to delete invoice");
// //       } else {
// //         toast.success("Invoice deleted successfully");
// //         reload();
// //       }
// //     } catch (e: unknown) {
// //       toast.error(e instanceof Error ? e.message : "Failed to delete invoice");
// //     } finally {
// //       setDeleting(false);
// //       setDeleteInvoiceId(null);
// //     }
// //   };

// //   const openCreateModal = () => {
// //     setCreateForm(emptyCreateForm());
// //     setCreateStep("form");
// //     setCreateFormTouched(false);
// //     setCreateOpen(true);
// //   };

// //   const closeCreateModal = () => {
// //     setCreateOpen(false);
// //     setCreateStep("form");
// //     setCreateForm(emptyCreateForm());
// //     setCreateFormTouched(false);
// //   };

// //   const updateCreateForm = <K extends keyof CreateInvoiceForm>(key: K, value: CreateInvoiceForm[K]) => {
// //     setCreateForm((f) => ({ ...f, [key]: value }));
// //   };

// //   const pincodeIsValid = /^\d{6}$/.test(createForm.customerPincode.trim());

// //   const createFormIsValid =
// //     !!createForm.customerName.trim() &&
// //     !!createForm.customerEmail.trim() &&
// //     !!createForm.serviceTitle.trim() &&
// //     Number(createForm.price) > 0 &&
// //     !!createForm.customerCity.trim() &&
// //     !!createForm.customerState.trim() &&
// //     pincodeIsValid;

// //   const showCityError = createFormTouched && !createForm.customerCity.trim();
// //   const showStateError = createFormTouched && !createForm.customerState.trim();
// //   const showPincodeError = createFormTouched && !pincodeIsValid;

// //   // Price entered by the admin is treated as GST-INCLUSIVE (i.e. it's the
// //   // final amount the customer pays) — so the taxable value and GST portion
// //   // are both back-calculated out of it, instead of adding GST on top of it.
// //   // GST rate itself is fixed at 18% (FIXED_GST_RATE) — no admin choice.
// //   const previewTotal = Number(createForm.price) || 0;
// //   const previewAmount = previewTotal / (1 + FIXED_GST_RATE / 100);
// //   const previewGstAmount = previewTotal - previewAmount;

// //   const goToPreview = () => {
// //     setCreateFormTouched(true);
// //     if (!createFormIsValid) {
// //       toast.error("Please fill customer name, email, service, price, city, state and a valid 6-digit pincode.");
// //       return;
// //     }
// //     setCreateStep("preview");
// //   };

// //   const confirmCreateInvoice = async () => {
// //     setCreating(true);
// //     try {
// //       const result = await createManualInvoice({
// //         customerName: createForm.customerName.trim(),
// //         customerEmail: createForm.customerEmail.trim(),
// //         customerPhone: createForm.customerPhone.trim() || undefined,
// //         sourceWebsite: createForm.sourceWebsite,
// //         serviceTitle: createForm.serviceTitle.trim(),
// //         // IMPORTANT: send the raw, GST-inclusive total the customer actually
// //         // pays — invoice-engine.js (via processInvoiceJob) already divides
// //         // this by (1 + gstRate/100) internally to derive the taxable amount
// //         // and CGST/SGST/IGST split (confirmed from a real generated PDF:
// //         // total_amount 293 -> taxable 248.31 -> matches 293 / 1.18). Sending
// //         // previewAmount (the already-back-calculated taxable value) here
// //         // instead would make the backend divide by 1.18 a second time.
// //         price: previewTotal,
// //         gstRate: FIXED_GST_RATE,
// //         paymentStatus: createForm.paymentStatus,
// //         invoiceDate: createForm.invoiceDate,
// //         notes: createForm.notes.trim() || undefined,
// //         customerCity: createForm.customerCity.trim() || undefined,
// //         customerState: createForm.customerState.trim() || undefined,
// //         customerPincode: createForm.customerPincode.trim() || undefined,
// //         customerGstin: createForm.customerGstin.trim() || undefined,
// //       });

// //       if (result.ok === false) {
// //         toast.error(result.error || "Invoice is still being generated — refresh in a few seconds.");
// //         return;
// //       }

// //       toast.success(
// //         result.invoice_number ? `Invoice ${result.invoice_number} created successfully` : "Invoice created successfully",
// //       );
// //       closeCreateModal();
// //       reload();
// //     } catch (e) {
// //       toast.error(e instanceof Error ? e.message : "Could not create invoice");
// //     } finally {
// //       setCreating(false);
// //     }
// //   };

// //   const openEmailModal = (inv: Invoice) => {
// //     setEmailInvoice(inv);
// //     setEmailTo(inv.customer_email || "");
// //     setEmailSubject(`Invoice ${inv.invoice_number} — ${inv.service_title}`);
// //     setEmailMessage(
// //       `Dear ${inv.customer_name || "Customer"},\n\nPlease find your invoice ${inv.invoice_number} attached.\n\nThank you for choosing us.`,
// //     );
// //     setEmailAttachPdf(true);
// //   };

// //   const closeEmailModal = () => {
// //     setEmailInvoice(null);
// //     setEmailTo("");
// //     setEmailSubject("");
// //     setEmailMessage("");
// //     setEmailAttachPdf(true);
// //   };

// //   const confirmSendEmail = async () => {
// //     if (!emailInvoice) return;
// //     if (!emailTo.trim()) {
// //       toast.error("Recipient email is required");
// //       return;
// //     }
// //     if (!emailSubject.trim()) {
// //       toast.error("Subject is required");
// //       return;
// //     }

// //     setSendingEmail(true);
// //     try {
// //       await sendInvoiceEmail({
// //         invoiceId: emailInvoice.id,
// //         to: emailTo.trim(),
// //         subject: emailSubject.trim(),
// //         message: emailMessage,
// //         attachPdf: emailAttachPdf,
// //       });
// //       toast.success("Invoice email sent successfully");
// //       closeEmailModal();
// //     } catch (e) {
// //       toast.error(e instanceof Error ? e.message : "Could not send invoice email");
// //     } finally {
// //       setSendingEmail(false);
// //     }
// //   };

// //   const bulkActions = (
// //     <div className="flex flex-wrap items-center gap-2">
// //       <Select value={bulkMonth} onValueChange={setBulkMonth}>
// //         <SelectTrigger className="w-[140px]">
// //           <SelectValue placeholder="Month" />
// //         </SelectTrigger>
// //         <SelectContent>
// //           {MONTHS.map((label, index) => (
// //             <SelectItem key={label} value={String(index + 1)}>
// //               {label}
// //             </SelectItem>
// //           ))}
// //         </SelectContent>
// //       </Select>
// //       <Select value={bulkYear} onValueChange={setBulkYear}>
// //         <SelectTrigger className="w-[100px]">
// //           <SelectValue placeholder="Year" />
// //         </SelectTrigger>
// //         <SelectContent>
// //           {yearOptions.map((year) => (
// //             <SelectItem key={year} value={year}>
// //               {year}
// //             </SelectItem>
// //           ))}
// //         </SelectContent>
// //       </Select>
// //       <Button size="sm" disabled={bulkLoading} onClick={() => void downloadMonthlyBundle()}>
// //         {bulkLoading ? (
// //           <Loader2 className="w-4 h-4 animate-spin mr-2" />
// //         ) : (
// //           <FileArchive className="w-4 h-4 mr-2" />
// //         )}
// //         {bulkProgress || "Download ZIP"}
// //       </Button>
// //       <Button size="sm" variant="default" onClick={openCreateModal}>
// //         <Plus className="w-4 h-4 mr-2" />
// //         Create Invoice
// //       </Button>
// //     </div>
// //   );

// //   return (
// //     <AdminPage
// //       title="Invoice Manager"
// //       description="GST invoices stored in Supabase — download PDFs individually or as a monthly ZIP bundle."
// //       loading={loading}
// //       empty={!filteredRows.length}
// //       emptyMessage="No invoices yet. You can still download a monthly ZIP if PDFs exist for that period."
// //       actions={bulkActions}
// //     >
// //       <div className="mb-3 flex flex-wrap items-center gap-3">
// //         <Input
// //           placeholder="Search by invoice number, customer, email or service..."
// //           value={search}
// //           onChange={(e) => setSearch(e.target.value)}
// //           className="w-full max-w-md"
// //         />

// //         <Select value={siteFilter} onValueChange={setSiteFilter}>
// //           <SelectTrigger className="w-[200px]"><SelectValue placeholder="All sites" /></SelectTrigger>
// //           <SelectContent>
// //             {CONNECTED_SITE_OPTIONS.map((opt) => (
// //               <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
// //             ))}
// //           </SelectContent>
// //         </Select>

// //         <Button
// //           size="sm"
// //           variant={activeSecondaryFilterCount > 0 ? "secondary" : "outline"}
// //           onClick={() => setShowFilters((v) => !v)}
// //         >
// //           <SlidersHorizontal className="w-4 h-4 mr-1.5" />
// //           Filters
// //           {activeSecondaryFilterCount > 0 && (
// //             <Badge variant="outline" className="ml-1.5 h-5 min-w-5 px-1 text-xs">
// //               {activeSecondaryFilterCount}
// //             </Badge>
// //           )}
// //         </Button>
// //       </div>

// //       {showFilters && (
// //         <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
// //           <Select value={statusFilter} onValueChange={setStatusFilter}>
// //             <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
// //             <SelectContent>
// //               <SelectItem value="all">All statuses</SelectItem>
// //               {statusOptions.map((s) => (
// //                 <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
// //               ))}
// //             </SelectContent>
// //           </Select>

// //           <Select value={monthFilter} onValueChange={setMonthFilter}>
// //             <SelectTrigger className="w-[140px]"><SelectValue placeholder="Month" /></SelectTrigger>
// //             <SelectContent>
// //               <SelectItem value="all">All months</SelectItem>
// //               {MONTHS.map((label, index) => (
// //                 <SelectItem key={label} value={String(index + 1)}>{label}</SelectItem>
// //               ))}
// //             </SelectContent>
// //           </Select>

// //           <Select value={yearFilter} onValueChange={setYearFilter}>
// //             <SelectTrigger className="w-[110px]"><SelectValue placeholder="Year" /></SelectTrigger>
// //             <SelectContent>
// //               <SelectItem value="all">All years</SelectItem>
// //               {yearOptions.map((year) => (
// //                 <SelectItem key={year} value={year}>{year}</SelectItem>
// //               ))}
// //             </SelectContent>
// //           </Select>

// //           <div className="flex items-center gap-2">
// //             <Input
// //               type="date"
// //               value={dateFrom}
// //               onChange={(e) => setDateFrom(e.target.value)}
// //               className="w-[150px]"
// //             />
// //             <span className="text-xs text-muted-foreground">to</span>
// //             <Input
// //               type="date"
// //               value={dateTo}
// //               onChange={(e) => setDateTo(e.target.value)}
// //               className="w-[150px]"
// //             />
// //           </div>

// //           {(activeSecondaryFilterCount > 0 || search) && (
// //             <Button
// //               size="sm"
// //               variant="ghost"
// //               onClick={() => {
// //                 setStatusFilter("all");
// //                 setMonthFilter("all");
// //                 setYearFilter("all");
// //                 setDateFrom("");
// //                 setDateTo("");
// //               }}
// //             >
// //               Clear filters
// //             </Button>
// //           )}
// //         </div>
// //       )}

// //       <div className="space-y-2">
// //         {paginatedRows.map((i) => (
// //           <div
// //             key={i.id}
// //             id={`invoice-row-${i.id}`}
// //             className={cn(
// //               "flex flex-wrap justify-between gap-3 border rounded-lg p-4 transition-colors",
// //               highlightedId === i.id
// //                 ? "border-primary ring-2 ring-primary/40 bg-primary/5"
// //                 : "border-border"
// //             )}
// //           >
// //             <div>
// //               <div className="flex items-center gap-2 mb-1">
// //                 <Badge variant="outline" className="text-xs">
// //                   {i.source_website || "ankshaastra.com"}
// //                 </Badge>
// //                 <p className="font-semibold text-primary">{i.invoice_number}</p>
// //               </div>
// //               <p className="text-sm text-muted-foreground">{i.customer_name} · {i.service_title}</p>
// //               <p className="text-xs text-muted-foreground mt-1">{formatDate(i.invoice_date)}</p>
// //             </div>
// //             <div className="flex items-center gap-3">
// //               <span className="font-semibold">₹{Number(i.total_amount).toLocaleString()}</span>

// //               <Badge className={cn("capitalize border-0", STATUS_STYLES[i.status] || STATUS_STYLES.cancelled)}>
// //                 {i.status}
// //               </Badge>

// //               {(i.pdf_storage_path || i.pdf_url) && (
// //                 <Button
// //                   size="icon"
// //                   variant="ghost"
// //                   className="h-8 w-8"
// //                   disabled={downloadingId === i.id}
// //                   onClick={() => downloadInvoice(i)}
// //                   aria-label="Download invoice PDF"
// //                 >
// //                   {downloadingId === i.id ? (
// //                     <Loader2 className="w-4 h-4 animate-spin" />
// //                   ) : (
// //                     <Download className="w-4 h-4" />
// //                   )}
// //                 </Button>
// //               )}

// //               <Button
// //                 size="icon"
// //                 variant="ghost"
// //                 className="h-8 w-8"
// //                 onClick={() => setViewInvoice(i)}
// //                 aria-label="View invoice details"
// //               >
// //                 <Eye className="w-4 h-4" />
// //               </Button>

// //               <Button
// //                 size="icon"
// //                 variant="ghost"
// //                 className="h-8 w-8"
// //                 onClick={() => openEmailModal(i)}
// //                 aria-label="Send invoice email"
// //               >
// //                 <Mail className="w-4 h-4" />
// //               </Button>

// //               <DropdownMenu>
// //                 <DropdownMenuTrigger asChild>
// //                   <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="More actions">
// //                     <MoreVertical className="w-4 h-4" />
// //                   </Button>
// //                 </DropdownMenuTrigger>
// //                 <DropdownMenuContent align="end">
// //                   <DropdownMenuItem
// //                     onClick={() => setDeleteInvoiceId(i.id)}
// //                     className="text-destructive focus:text-destructive"
// //                   >
// //                     <Trash2 className="w-4 h-4 mr-2" />
// //                     Delete
// //                   </DropdownMenuItem>
// //                 </DropdownMenuContent>
// //               </DropdownMenu>
// //             </div>
// //           </div>
// //         ))}
// //       </div>

// //       {filteredRows.length > 0 && (
// //         <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
// //           <p className="text-xs text-muted-foreground">
// //             Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredRows.length)} of{" "}
// //             {filteredRows.length}
// //           </p>
// //           <div className="flex items-center gap-3">
// //             <Button size="sm" variant="outline" onClick={goToPreviousPage} disabled={page <= 1}>
// //               Previous
// //             </Button>
// //             <p className="text-xs text-muted-foreground whitespace-nowrap">
// //               Page {page} of {totalPages}
// //             </p>
// //             <Button size="sm" variant="outline" onClick={goToNextPage} disabled={page >= totalPages}>
// //               Next
// //             </Button>
// //           </div>
// //         </div>
// //       )}

// //       {/* View Invoice Dialog */}
// //       <Dialog open={!!viewInvoice} onOpenChange={(open) => !open && setViewInvoice(null)}>
// //         <DialogContent>
// //           <DialogHeader>
// //             <DialogTitle>Invoice Details</DialogTitle>
// //             <DialogDescription>Full details for this invoice.</DialogDescription>
// //           </DialogHeader>
// //           {viewInvoice && (
// //             <div className="space-y-2 text-sm max-h-[70vh] overflow-y-auto pr-1">
// //               <div className="flex justify-between border-b border-border pb-2">
// //                 <span className="text-muted-foreground">Invoice Number</span>
// //                 <span className="font-medium">{viewInvoice.invoice_number}</span>
// //               </div>
// //               <div className="flex justify-between border-b border-border pb-2">
// //                 <span className="text-muted-foreground">Customer Name</span>
// //                 <span className="font-medium">{viewInvoice.customer_name}</span>
// //               </div>
// //               <div className="flex justify-between border-b border-border pb-2">
// //                 <span className="text-muted-foreground">Email</span>
// //                 <span className="font-medium">{viewInvoice.customer_email || "—"}</span>
// //               </div>
// //               <div className="flex justify-between border-b border-border pb-2">
// //                 <span className="text-muted-foreground">Address</span>
// //                 <span className="font-medium text-right">{viewInvoice.billing_address || "—"}</span>
// //               </div>
// //               <div className="flex justify-between border-b border-border pb-2">
// //                 <span className="text-muted-foreground">GST Number</span>
// //                 <span className="font-medium">{viewInvoice.customer_gstin || "—"}</span>
// //               </div>
// //               <div className="flex justify-between border-b border-border pb-2">
// //                 <span className="text-muted-foreground">Service</span>
// //                 <span className="font-medium text-right">{viewInvoice.service_title}</span>
// //               </div>
// //               <div className="flex justify-between border-b border-border pb-2">
// //                 <span className="text-muted-foreground">Amount</span>
// //                 <span className="font-medium">₹{Number(viewInvoice.total_amount).toLocaleString()}</span>
// //               </div>
// //               <div className="flex justify-between border-b border-border pb-2">
// //                 <span className="text-muted-foreground">
// //                   {Number(viewInvoice.igst_amount || 0) > 0 ? "IGST Amount" : "CGST + SGST Amount"}
// //                 </span>
// //                 <span className="font-medium">
// //                   ₹{(
// //                     Number(viewInvoice.cgst_amount || 0) +
// //                     Number(viewInvoice.sgst_amount || 0) +
// //                     Number(viewInvoice.igst_amount || 0)
// //                   ).toLocaleString()}
// //                 </span>
// //               </div>
// //               <div className="flex justify-between border-b border-border pb-2">
// //                 <span className="text-muted-foreground">Total</span>
// //                 <span className="font-medium">
// //                   ₹{Number(viewInvoice.total_amount).toLocaleString()}
// //                 </span>
// //               </div>
// //               <div className="flex justify-between border-b border-border pb-2">
// //                 <span className="text-muted-foreground">Status</span>
// //                 <Badge className={cn("capitalize border-0", STATUS_STYLES[viewInvoice.status] || STATUS_STYLES.cancelled)}>
// //                   {viewInvoice.status}
// //                 </Badge>
// //               </div>
// //               <div className="flex justify-between border-b border-border pb-2">
// //                 <span className="text-muted-foreground">Website</span>
// //                 <span className="font-medium">{viewInvoice.source_website || "ankshaastra.com"}</span>
// //               </div>
// //               <div className="flex justify-between pb-1">
// //                 <span className="text-muted-foreground">Created Date</span>
// //                 <span className="font-medium">
// //                   {formatDateTime(viewInvoice.created_at || viewInvoice.invoice_date)}
// //                 </span>
// //               </div>
// //             </div>
// //           )}
// //         </DialogContent>
// //       </Dialog>

// //       {/* Create Invoice Dialog (two steps: form → preview) */}
// //       <Dialog open={createOpen} onOpenChange={(open) => !open && !creating && closeCreateModal()}>
// //         <DialogContent className="max-h-[85vh] overflow-y-auto">
// //           <DialogHeader>
// //             <DialogTitle>
// //               {createStep === "form" ? "Create Invoice" : "Preview Invoice"}
// //             </DialogTitle>
// //             <DialogDescription>
// //               {createStep === "form"
// //                 ? "Enter customer and service details to generate a new invoice."
// //                 : "Review the details below, then confirm to generate the invoice."}
// //             </DialogDescription>
// //           </DialogHeader>

// //           {createStep === "form" ? (
// //             <div className="space-y-4 py-1">
// //               <div className="grid grid-cols-2 gap-3">
// //                 <div className="space-y-1.5">
// //                   <Label htmlFor="inv-customer-name">Customer Name</Label>
// //                   <Input
// //                     id="inv-customer-name"
// //                     value={createForm.customerName}
// //                     onChange={(e) => updateCreateForm("customerName", e.target.value)}
// //                     placeholder="Full name"
// //                   />
// //                 </div>
// //                 <div className="space-y-1.5">
// //                   <Label htmlFor="inv-customer-email">Customer Email</Label>
// //                   <Input
// //                     id="inv-customer-email"
// //                     type="email"
// //                     value={createForm.customerEmail}
// //                     onChange={(e) => updateCreateForm("customerEmail", e.target.value)}
// //                     placeholder="name@example.com"
// //                   />
// //                 </div>
// //               </div>

// //               <div className="grid grid-cols-2 gap-3">
// //                 <div className="space-y-1.5">
// //                   <Label htmlFor="inv-phone">Phone</Label>
// //                   <Input
// //                     id="inv-phone"
// //                     value={createForm.customerPhone}
// //                     onChange={(e) => updateCreateForm("customerPhone", e.target.value)}
// //                     placeholder="+91 XXXXX XXXXX"
// //                   />
// //                 </div>
// //                 <div className="space-y-1.5">
// //                   <Label>Website</Label>
// //                   <Select
// //                     value={createForm.sourceWebsite}
// //                     onValueChange={(v) => updateCreateForm("sourceWebsite", v)}
// //                   >
// //                     <SelectTrigger><SelectValue placeholder="Select site" /></SelectTrigger>
// //                     <SelectContent>
// //                       {CONNECTED_SITE_OPTIONS.map((opt) => (
// //                         <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
// //                       ))}
// //                     </SelectContent>
// //                   </Select>
// //                 </div>
// //               </div>

// //               <div className="grid grid-cols-2 gap-3">
// //                 <div className="space-y-1.5">
// //                   <Label htmlFor="inv-city">
// //                     City <span className="text-destructive">*</span>
// //                   </Label>
// //                   <Input
// //                     id="inv-city"
// //                     value={createForm.customerCity}
// //                     onChange={(e) => updateCreateForm("customerCity", e.target.value)}
// //                     placeholder="e.g. Jaipur"
// //                     aria-invalid={showCityError}
// //                     className={cn(showCityError && "border-destructive focus-visible:ring-destructive")}
// //                   />
// //                   {showCityError && (
// //                     <p className="text-xs text-destructive">City is required.</p>
// //                   )}
// //                 </div>
// //                 <div className="space-y-1.5">
// //                   <Label>
// //                     State <span className="text-destructive">*</span>
// //                   </Label>
// //                   <Select
// //                     value={createForm.customerState}
// //                     onValueChange={(v) => updateCreateForm("customerState", v)}
// //                   >
// //                     <SelectTrigger
// //                       aria-invalid={showStateError}
// //                       className={cn(showStateError && "border-destructive focus-visible:ring-destructive")}
// //                     >
// //                       <SelectValue placeholder="Select state" />
// //                     </SelectTrigger>
// //                     <SelectContent>
// //                       {INDIAN_STATES.map((state) => (
// //                         <SelectItem key={state} value={state}>{state}</SelectItem>
// //                       ))}
// //                     </SelectContent>
// //                   </Select>
// //                   {showStateError && (
// //                     <p className="text-xs text-destructive">State is required.</p>
// //                   )}
// //                 </div>
// //               </div>

// //               <div className="grid grid-cols-2 gap-3">
// //                 <div className="space-y-1.5">
// //                   <Label htmlFor="inv-pincode">
// //                     Pincode <span className="text-destructive">*</span>
// //                   </Label>
// //                   <Input
// //                     id="inv-pincode"
// //                     value={createForm.customerPincode}
// //                     onChange={(e) =>
// //                       updateCreateForm("customerPincode", e.target.value.replace(/\D/g, "").slice(0, 6))
// //                     }
// //                     placeholder="e.g. 302001"
// //                     inputMode="numeric"
// //                     maxLength={6}
// //                     aria-invalid={showPincodeError}
// //                     className={cn(showPincodeError && "border-destructive focus-visible:ring-destructive")}
// //                   />
// //                   {showPincodeError && (
// //                     <p className="text-xs text-destructive">Enter a valid 6-digit pincode.</p>
// //                   )}
// //                 </div>
// //                 <div className="space-y-1.5">
// //                   <Label htmlFor="inv-gstin">Customer GSTIN (optional, for B2B)</Label>
// //                   <Input
// //                     id="inv-gstin"
// //                     value={createForm.customerGstin}
// //                     onChange={(e) => updateCreateForm("customerGstin", e.target.value.toUpperCase())}
// //                     placeholder="e.g. 09AAFFE7583B1ZD"
// //                     className="uppercase"
// //                   />
// //                 </div>
// //               </div>

// //               <div className="space-y-1.5">
// //                 <Label htmlFor="inv-service">Service</Label>
// //                 <Input
// //                   id="inv-service"
// //                   value={createForm.serviceTitle}
// //                   onChange={(e) => updateCreateForm("serviceTitle", e.target.value)}
// //                   placeholder="e.g. Astrology Consultation"
// //                 />
// //               </div>

// //               <div className="grid grid-cols-2 gap-3">
// //                 <div className="space-y-1.5">
// //                   <Label htmlFor="inv-price">Price (₹, inclusive of GST)</Label>
// //                   <Input
// //                     id="inv-price"
// //                     type="number"
// //                     min="0"
// //                     value={createForm.price}
// //                     onChange={(e) => updateCreateForm("price", e.target.value)}
// //                     placeholder="0.00"
// //                   />
// //                 </div>
// //                 <div className="space-y-1.5">
// //                   <Label>GST %</Label>
// //                   {/* Fixed at 18% — no dropdown, no admin choice. */}
// //                   <Input value={`${FIXED_GST_RATE}% (fixed)`} disabled readOnly />
// //                 </div>
// //               </div>

// //               <div className="grid grid-cols-2 gap-3">
// //                 <div className="space-y-1.5">
// //                   <Label>Payment Status</Label>
// //                   <Select
// //                     value={createForm.paymentStatus}
// //                     onValueChange={(v) => updateCreateForm("paymentStatus", v)}
// //                   >
// //                     <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
// //                     <SelectContent>
// //                       {PAYMENT_STATUS_OPTIONS.map((s) => (
// //                         <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
// //                       ))}
// //                     </SelectContent>
// //                   </Select>
// //                 </div>
// //                 <div className="space-y-1.5">
// //                   <Label htmlFor="inv-date">Invoice Date</Label>
// //                   <Input
// //                     id="inv-date"
// //                     type="date"
// //                     value={createForm.invoiceDate}
// //                     onChange={(e) => updateCreateForm("invoiceDate", e.target.value)}
// //                   />
// //                 </div>
// //               </div>

// //               <div className="space-y-1.5">
// //                 <Label htmlFor="inv-notes">Notes</Label>
// //                 <Textarea
// //                   id="inv-notes"
// //                   value={createForm.notes}
// //                   onChange={(e) => updateCreateForm("notes", e.target.value)}
// //                   placeholder="Optional internal notes"
// //                   rows={3}
// //                 />
// //               </div>

// //               <DialogFooter className="pt-2">
// //                 <Button variant="outline" onClick={closeCreateModal}>Cancel</Button>
// //                 <Button onClick={goToPreview}>Preview Invoice</Button>
// //               </DialogFooter>
// //             </div>
// //           ) : (
// //             <div className="space-y-4 py-1">
// //               <div className="space-y-2 text-sm rounded-lg border border-border p-4">
// //                 <div className="flex justify-between border-b border-border pb-2">
// //                   <span className="text-muted-foreground">Invoice Number</span>
// //                   <span className="font-medium">Auto-generated on save</span>
// //                 </div>
// //                 <div className="flex justify-between border-b border-border pb-2">
// //                   <span className="text-muted-foreground">Customer</span>
// //                   <span className="font-medium text-right">
// //                     {createForm.customerName}
// //                     <br />
// //                     <span className="text-xs text-muted-foreground">{createForm.customerEmail}</span>
// //                   </span>
// //                 </div>
// //                 <div className="flex justify-between border-b border-border pb-2">
// //                   <span className="text-muted-foreground">Billing Address</span>
// //                   <span className="font-medium text-right">
// //                     {[createForm.customerCity, createForm.customerState, createForm.customerPincode]
// //                       .filter(Boolean)
// //                       .join(", ") || "—"}
// //                   </span>
// //                 </div>
// //                 <div className="flex justify-between border-b border-border pb-2">
// //                   <span className="text-muted-foreground">Customer GSTIN</span>
// //                   <span className="font-medium">{createForm.customerGstin || "—"}</span>
// //                 </div>
// //                 <div className="flex justify-between border-b border-border pb-2">
// //                   <span className="text-muted-foreground">Website</span>
// //                   <span className="font-medium">
// //                     {CONNECTED_SITE_OPTIONS.find((o) => o.value === createForm.sourceWebsite)?.label ||
// //                       createForm.sourceWebsite}
// //                   </span>
// //                 </div>
// //                 <div className="flex justify-between border-b border-border pb-2">
// //                   <span className="text-muted-foreground">Service</span>
// //                   <span className="font-medium text-right">{createForm.serviceTitle}</span>
// //                 </div>
// //                 <div className="flex justify-between border-b border-border pb-2">
// //                   <span className="text-muted-foreground">Price (incl. GST)</span>
// //                   <span className="font-medium">₹{previewTotal.toLocaleString()}</span>
// //                 </div>
// //                 <div className="flex justify-between border-b border-border pb-2">
// //                   <span className="text-muted-foreground">Taxable Amount</span>
// //                   <span className="font-medium">₹{previewAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
// //                 </div>
// //                 <div className="flex justify-between border-b border-border pb-2">
// //                   <span className="text-muted-foreground">GST ({FIXED_GST_RATE}%, included)</span>
// //                   <span className="font-medium">₹{previewGstAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
// //                 </div>
// //                 <div className="flex justify-between border-b border-border pb-2">
// //                   <span className="text-muted-foreground">Total (Customer Pays)</span>
// //                   <span className="font-semibold">₹{previewTotal.toLocaleString()}</span>
// //                 </div>
// //                 <div className="flex justify-between pb-1">
// //                   <span className="text-muted-foreground">Email</span>
// //                   <span className="font-medium">{createForm.customerEmail}</span>
// //                 </div>
// //               </div>

// //               <p className="text-xs text-muted-foreground">
// //                 This is an estimated preview. The final CGST/SGST vs IGST split is calculated by the
// //                 system based on the business's GST configuration and the customer's state at the time
// //                 the invoice is generated.
// //               </p>

// //               <DialogFooter className="pt-2">
// //                 <Button variant="outline" onClick={() => setCreateStep("form")} disabled={creating}>
// //                   <ArrowLeft className="w-4 h-4 mr-1.5" />
// //                   Back
// //                 </Button>
// //                 <Button onClick={confirmCreateInvoice} disabled={creating}>
// //                   {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
// //                   Confirm &amp; Create
// //                 </Button>
// //               </DialogFooter>
// //             </div>
// //           )}
// //         </DialogContent>
// //       </Dialog>

// //       {/* Send Email Dialog */}
// //       <Dialog open={!!emailInvoice} onOpenChange={(open) => !open && !sendingEmail && closeEmailModal()}>
// //         <DialogContent>
// //           <DialogHeader>
// //             <DialogTitle>Send Invoice Email</DialogTitle>
// //             <DialogDescription>
// //               {emailInvoice ? `Send invoice ${emailInvoice.invoice_number} to the customer.` : ""}
// //             </DialogDescription>
// //           </DialogHeader>

// //           <div className="space-y-4 py-1">
// //             <div className="space-y-1.5">
// //               <Label htmlFor="email-to">Customer Email</Label>
// //               <Input
// //                 id="email-to"
// //                 type="email"
// //                 value={emailTo}
// //                 onChange={(e) => setEmailTo(e.target.value)}
// //                 placeholder="name@example.com"
// //               />
// //             </div>

// //             <div className="space-y-1.5">
// //               <Label htmlFor="email-subject">Subject</Label>
// //               <Input
// //                 id="email-subject"
// //                 value={emailSubject}
// //                 onChange={(e) => setEmailSubject(e.target.value)}
// //               />
// //             </div>

// //             <div className="space-y-1.5">
// //               <Label htmlFor="email-message">Message</Label>
// //               <Textarea
// //                 id="email-message"
// //                 rows={5}
// //                 value={emailMessage}
// //                 onChange={(e) => setEmailMessage(e.target.value)}
// //               />
// //             </div>

// //             <div className="flex items-center gap-2">
// //               <Checkbox
// //                 id="email-attach-pdf"
// //                 checked={emailAttachPdf}
// //                 onCheckedChange={(checked) => setEmailAttachPdf(checked === true)}
// //               />
// //               <Label htmlFor="email-attach-pdf" className="cursor-pointer font-normal">
// //                 Attach PDF
// //               </Label>
// //             </div>
// //           </div>

// //           <DialogFooter>
// //             <Button variant="outline" onClick={closeEmailModal} disabled={sendingEmail}>
// //               Cancel
// //             </Button>
// //             <Button onClick={confirmSendEmail} disabled={sendingEmail}>
// //               {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
// //               Send Invoice
// //             </Button>
// //           </DialogFooter>
// //         </DialogContent>
// //       </Dialog>

// //       {/* Delete Invoice Confirmation Dialog */}
// //       <AlertDialog open={!!deleteInvoiceId} onOpenChange={(open) => !open && setDeleteInvoiceId(null)}>
// //         <AlertDialogContent>
// //           <AlertDialogHeader>
// //             <AlertDialogTitle>Delete this invoice?</AlertDialogTitle>
// //             <AlertDialogDescription>
// //               This action cannot be undone. This will permanently delete the invoice from Supabase.
// //             </AlertDialogDescription>
// //           </AlertDialogHeader>
// //           <AlertDialogFooter>
// //             <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
// //             <AlertDialogAction
// //               onClick={confirmDeleteInvoice}
// //               disabled={deleting}
// //               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
// //             >
// //               {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
// //               Delete
// //             </AlertDialogAction>
// //           </AlertDialogFooter>
// //         </AlertDialogContent>
// //       </AlertDialog>
// //     </AdminPage>
// //   );
// // }


// import { useEffect, useMemo, useState } from "react";
// import { useSearchParams } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";
// import { AdminPage } from "@/components/admin/AdminPage";
// import { useAdminTable } from "@/hooks/useAdminData";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
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
// import {
//   Download,
//   FileArchive,
//   Loader2,
//   Eye,
//   Trash2,
//   SlidersHorizontal,
//   MoreVertical,
//   Plus,
//   Mail,
//   ArrowLeft,
//   RotateCcw,
// } from "lucide-react";
// import { downloadMonthlyInvoiceZip, fetchInvoiceDownloadUrl } from "@/lib/invoice-download";
// import { createManualInvoice, sendInvoiceEmail } from "@/lib/invoice-actions";
// import { CONNECTED_SITE_OPTIONS } from "@/lib/connected-sites";
// import { toast } from "sonner";
// import { cn } from "@/lib/utils";

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
//   // NOTE: the actual columns written by invoice-engine.ts are
//   // `billing_address` and `customer_gstin` — not `customer_address` /
//   // `gst_number`. Using the real column names here so the View dialog
//   // below actually finds the data instead of always showing "—".
//   customer_email?: string;
//   billing_address?: string;
//   customer_gstin?: string;
//   gst_amount?: number;
//   cgst_amount?: number;
//   sgst_amount?: number;
//   igst_amount?: number;
//   created_at?: string;
//   // The order this invoice was generated from — shown in the View dialog
//   // (and exported to Sales Register / GSTR Excel) so an invoice can always
//   // be traced back to its original order.
//   order_id?: string | null;
//   // Soft-delete: set when an admin deletes the invoice from Invoice
//   // Manager. NULL/undefined = active invoice. Rows with this set are
//   // hidden from the default list (and from GST Reports) but stay in the
//   // database so they can be restored — see confirmDeleteInvoice /
//   // restoreInvoice below.
//   deleted_at?: string | null;
// };

// const MONTHS = [
//   "January", "February", "March", "April", "May", "June",
//   "July", "August", "September", "October", "November", "December",
// ];

// // Matches the state names resolved by stateCodeFromName() in the invoice
// // engine (indian-states.js) — picking one of these ensures the backend can
// // correctly resolve place of supply and CGST/SGST vs IGST.
// const INDIAN_STATES = [
//   "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
//   "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
//   "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
//   "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
//   "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
//   "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
//   "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
//   "Ladakh", "Lakshadweep", "Puducherry",
// ];

// const PAGE_SIZE = 10;

// // Same fixed status → color mapping used on Orders & Bookings, so "paid"
// // looks the same shade of green everywhere instead of each screen inventing
// // its own status color.
// const STATUS_STYLES: Record<string, string> = {
//   paid: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
//   pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
//   failed: "bg-red-100 text-red-700 hover:bg-red-100",
//   refunded: "bg-slate-200 text-slate-700 hover:bg-slate-200",
//   cancelled: "bg-slate-200 text-slate-600 hover:bg-slate-200",
// };

// // GST rate is fixed at 18% for manually-created invoices — no dropdown, no
// // admin choice. If a different rate is ever needed for a specific service,
// // that should go through the GST Configuration module instead.
// const FIXED_GST_RATE = 18;

// const PAYMENT_STATUS_OPTIONS = ["paid", "pending", "failed"];

// type CreateInvoiceForm = {
//   customerName: string;
//   customerEmail: string;
//   customerPhone: string;
//   sourceWebsite: string;
//   serviceTitle: string;
//   price: string;
//   paymentStatus: string;
//   invoiceDate: string;
//   notes: string;
//   customerCity: string;
//   customerState: string;
//   customerPincode: string;
//   customerGstin: string;
// };

// function emptyCreateForm(): CreateInvoiceForm {
//   const today = new Date().toISOString().slice(0, 10);
//   return {
//     customerName: "",
//     customerEmail: "",
//     customerPhone: "",
//     sourceWebsite: CONNECTED_SITE_OPTIONS[0]?.value || "ankshaastra.com",
//     serviceTitle: "",
//     price: "",
//     paymentStatus: "paid",
//     invoiceDate: today,
//     notes: "",
//     customerCity: "",
//     customerState: "",
//     customerPincode: "",
//     customerGstin: "",
//   };
// }

// // Matches the format used for invoiceDate in server/lib/build-invoice-template.ts
// // (en-GB, 2-digit day) so Invoice Date reads identically in the PDF, the
// // customer email, and this admin panel — e.g. "04 Aug 2026" everywhere.
// function formatDate(iso: string) {
//   return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
// }

// function formatDateTime(iso: string) {
//   const d = new Date(iso);
//   return `${formatDate(iso)}, ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
// }

// export default function InvoicesModule() {
//   const { rows, loading, reload } = useAdminTable<Invoice>("invoices", "invoice_date");
//   const [downloadingId, setDownloadingId] = useState<string | null>(null);
//   const [bulkLoading, setBulkLoading] = useState(false);
//   const [bulkProgress, setBulkProgress] = useState<string | null>(null);
//   const [searchParams, setSearchParams] = useSearchParams();

//   const now = new Date();
//   const [bulkYear, setBulkYear] = useState(String(now.getFullYear()));
//   const [bulkMonth, setBulkMonth] = useState(String(now.getMonth() + 1));
//   const [siteFilter, setSiteFilter] = useState("all");

//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [monthFilter, setMonthFilter] = useState("all");
//   const [yearFilter, setYearFilter] = useState("all");
//   const [dateFrom, setDateFrom] = useState("");
//   const [dateTo, setDateTo] = useState("");

//   const [showFilters, setShowFilters] = useState(false);

//   const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

//   // Deep-link support: Global Search sends ?open=<invoice id>. Instead of
//   // auto-opening a read-only dialog, scroll to and briefly highlight that
//   // exact row in the list, so the admin can use any action on it (View,
//   // Download, Email, Delete) themselves — not just see a static popup.
//   const [highlightedId, setHighlightedId] = useState<string | null>(null);
//   useEffect(() => {
//     const openId = searchParams.get("open");
//     if (!openId || !rows.length) return;
//     const match = rows.find((i) => i.id === openId);
//     if (match) {
//       setHighlightedId(openId);
//       setSearchParams({}, { replace: true });
//       // Wait a tick for the list to render, then scroll the row into view.
//       setTimeout(() => {
//         document.getElementById(`invoice-row-${openId}`)?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       }, 100);
//       // Remove the highlight after a few seconds.
//       setTimeout(() => setHighlightedId(null), 3000);
//     }
//   }, [searchParams, rows, setSearchParams]);

//   const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null);
//   const [deleting, setDeleting] = useState(false);

//   // Trash view: default list only ever shows active (non-deleted)
//   // invoices. Flipping this shows exactly the opposite — only
//   // soft-deleted ones — with a Restore action instead of Delete/Email/etc.
//   const [showDeleted, setShowDeleted] = useState(false);
//   const [restoringId, setRestoringId] = useState<string | null>(null);

//   const [page, setPage] = useState(1);

//   const [createOpen, setCreateOpen] = useState(false);
//   const [createStep, setCreateStep] = useState<"form" | "preview">("form");
//   const [createForm, setCreateForm] = useState<CreateInvoiceForm>(emptyCreateForm());
//   const [creating, setCreating] = useState(false);
//   const [createFormTouched, setCreateFormTouched] = useState(false);

//   const [emailInvoice, setEmailInvoice] = useState<Invoice | null>(null);
//   const [emailTo, setEmailTo] = useState("");
//   const [emailSubject, setEmailSubject] = useState("");
//   const [emailMessage, setEmailMessage] = useState("");
//   const [emailAttachPdf, setEmailAttachPdf] = useState(true);
//   const [sendingEmail, setSendingEmail] = useState(false);

//   const yearOptions = useMemo(() => {
//   const START_YEAR = 2026;
//   const END_YEAR = 2034;
//   return Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => String(START_YEAR + i));
// }, []);

//   const statusOptions = useMemo(() => {
//     const unique = Array.from(new Set(rows.map((i) => i.status).filter(Boolean)));
//     return unique;
//   }, [rows]);

//   const activeSecondaryFilterCount = [
//     statusFilter !== "all",
//     monthFilter !== "all",
//     yearFilter !== "all",
//     !!dateFrom,
//     !!dateTo,
//   ].filter(Boolean).length;

//   const filteredRows = useMemo(() => {
//     // Trash view flips this: normal browsing only ever shows active
//     // invoices, Trash only shows soft-deleted ones.
//     let data = rows.filter((i) => (showDeleted ? !!i.deleted_at : !i.deleted_at));

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
//   }, [rows, showDeleted, siteFilter, statusFilter, monthFilter, yearFilter, dateFrom, dateTo, search]);

//   useMemo(() => {
//     setPage(1);
//   }, [showDeleted, siteFilter, statusFilter, monthFilter, yearFilter, dateFrom, dateTo, search]);

//   const deletedCount = useMemo(() => rows.filter((i) => !!i.deleted_at).length, [rows]);

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

//   // Soft delete: stamps deleted_at/deleted_by instead of removing the row,
//   // so the invoice disappears from the normal list and from GST Reports
//   // (server filters deleted_at IS NULL) but can be brought back via
//   // restoreInvoice below. Email logs are left alone — they're history of
//   // what was actually sent, independent of whether the invoice is later
//   // deleted.
//   const confirmDeleteInvoice = async () => {
//     if (!deleteInvoiceId) return;
//     setDeleting(true);
//     try {
//       const { data: sessionData } = await supabase.auth.getSession();
//       const userId = sessionData.session?.user?.id;

//       const { error } = await supabase
//         .from("invoices")
//         .update({ deleted_at: new Date().toISOString(), deleted_by: userId })
//         .eq("id", deleteInvoiceId);

//       if (error) {
//         toast.error(error.message || "Failed to delete invoice");
//       } else {
//         toast.success("Invoice moved to Trash — you can restore it from there anytime");
//         reload();
//       }
//     } catch (e: unknown) {
//       toast.error(e instanceof Error ? e.message : "Failed to delete invoice");
//     } finally {
//       setDeleting(false);
//       setDeleteInvoiceId(null);
//     }
//   };

//   const restoreInvoice = async (invoiceId: string) => {
//     setRestoringId(invoiceId);
//     try {
//       const { error } = await supabase
//         .from("invoices")
//         .update({ deleted_at: null, deleted_by: null })
//         .eq("id", invoiceId);
//       if (error) {
//         toast.error(error.message || "Failed to restore invoice");
//       } else {
//         toast.success("Invoice restored");
//         reload();
//       }
//     } catch (e: unknown) {
//       toast.error(e instanceof Error ? e.message : "Failed to restore invoice");
//     } finally {
//       setRestoringId(null);
//     }
//   };

//   const openCreateModal = () => {
//     setCreateForm(emptyCreateForm());
//     setCreateStep("form");
//     setCreateFormTouched(false);
//     setCreateOpen(true);
//   };

//   const closeCreateModal = () => {
//     setCreateOpen(false);
//     setCreateStep("form");
//     setCreateForm(emptyCreateForm());
//     setCreateFormTouched(false);
//   };

//   const updateCreateForm = <K extends keyof CreateInvoiceForm>(key: K, value: CreateInvoiceForm[K]) => {
//     setCreateForm((f) => ({ ...f, [key]: value }));
//   };

//   const pincodeIsValid = /^\d{6}$/.test(createForm.customerPincode.trim());

//   const createFormIsValid =
//     !!createForm.customerName.trim() &&
//     !!createForm.customerEmail.trim() &&
//     !!createForm.serviceTitle.trim() &&
//     Number(createForm.price) > 0 &&
//     !!createForm.customerCity.trim() &&
//     !!createForm.customerState.trim() &&
//     pincodeIsValid;

//   const showCityError = createFormTouched && !createForm.customerCity.trim();
//   const showStateError = createFormTouched && !createForm.customerState.trim();
//   const showPincodeError = createFormTouched && !pincodeIsValid;

//   // Price entered by the admin is treated as GST-INCLUSIVE (i.e. it's the
//   // final amount the customer pays) — so the taxable value and GST portion
//   // are both back-calculated out of it, instead of adding GST on top of it.
//   // GST rate itself is fixed at 18% (FIXED_GST_RATE) — no admin choice.
//   const previewTotal = Number(createForm.price) || 0;
//   const previewAmount = previewTotal / (1 + FIXED_GST_RATE / 100);
//   const previewGstAmount = previewTotal - previewAmount;

//   const goToPreview = () => {
//     setCreateFormTouched(true);
//     if (!createFormIsValid) {
//       toast.error("Please fill customer name, email, service, price, city, state and a valid 6-digit pincode.");
//       return;
//     }
//     setCreateStep("preview");
//   };

//   const confirmCreateInvoice = async () => {
//     setCreating(true);
//     try {
//       const result = await createManualInvoice({
//         customerName: createForm.customerName.trim(),
//         customerEmail: createForm.customerEmail.trim(),
//         customerPhone: createForm.customerPhone.trim() || undefined,
//         sourceWebsite: createForm.sourceWebsite,
//         serviceTitle: createForm.serviceTitle.trim(),
//         // IMPORTANT: send the raw, GST-inclusive total the customer actually
//         // pays — invoice-engine.js (via processInvoiceJob) already divides
//         // this by (1 + gstRate/100) internally to derive the taxable amount
//         // and CGST/SGST/IGST split (confirmed from a real generated PDF:
//         // total_amount 293 -> taxable 248.31 -> matches 293 / 1.18). Sending
//         // previewAmount (the already-back-calculated taxable value) here
//         // instead would make the backend divide by 1.18 a second time.
//         price: previewTotal,
//         gstRate: FIXED_GST_RATE,
//         paymentStatus: createForm.paymentStatus,
//         invoiceDate: createForm.invoiceDate,
//         notes: createForm.notes.trim() || undefined,
//         customerCity: createForm.customerCity.trim() || undefined,
//         customerState: createForm.customerState.trim() || undefined,
//         customerPincode: createForm.customerPincode.trim() || undefined,
//         customerGstin: createForm.customerGstin.trim() || undefined,
//       });

//       if (result.ok === false) {
//         toast.error(result.error || "Invoice is still being generated — refresh in a few seconds.");
//         return;
//       }

//       toast.success(
//         result.invoice_number ? `Invoice ${result.invoice_number} created successfully` : "Invoice created successfully",
//       );
//       closeCreateModal();
//       reload();
//     } catch (e) {
//       toast.error(e instanceof Error ? e.message : "Could not create invoice");
//     } finally {
//       setCreating(false);
//     }
//   };

//   const openEmailModal = (inv: Invoice) => {
//     setEmailInvoice(inv);
//     setEmailTo(inv.customer_email || "");
//     setEmailSubject(`Invoice ${inv.invoice_number} — ${inv.service_title}`);
//     setEmailMessage(
//       `Dear ${inv.customer_name || "Customer"},\n\nPlease find your invoice ${inv.invoice_number} attached.\n\nThank you for choosing us.`,
//     );
//     setEmailAttachPdf(true);
//   };

//   const closeEmailModal = () => {
//     setEmailInvoice(null);
//     setEmailTo("");
//     setEmailSubject("");
//     setEmailMessage("");
//     setEmailAttachPdf(true);
//   };

//   const confirmSendEmail = async () => {
//     if (!emailInvoice) return;
//     if (!emailTo.trim()) {
//       toast.error("Recipient email is required");
//       return;
//     }
//     if (!emailSubject.trim()) {
//       toast.error("Subject is required");
//       return;
//     }

//     setSendingEmail(true);
//     try {
//       await sendInvoiceEmail({
//         invoiceId: emailInvoice.id,
//         to: emailTo.trim(),
//         subject: emailSubject.trim(),
//         message: emailMessage,
//         attachPdf: emailAttachPdf,
//       });
//       toast.success("Invoice email sent successfully");
//       closeEmailModal();
//     } catch (e) {
//       toast.error(e instanceof Error ? e.message : "Could not send invoice email");
//     } finally {
//       setSendingEmail(false);
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
//       <Button size="sm" variant="default" onClick={openCreateModal}>
//         <Plus className="w-4 h-4 mr-2" />
//         Create Invoice
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
//       <div className="mb-3 flex flex-wrap items-center gap-3">
//         <Input
//           placeholder="Search by invoice number, customer, email or service..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="w-full max-w-md"
//         />

//         <Select value={siteFilter} onValueChange={setSiteFilter}>
//           <SelectTrigger className="w-[200px]"><SelectValue placeholder="All sites" /></SelectTrigger>
//           <SelectContent>
//             {CONNECTED_SITE_OPTIONS.map((opt) => (
//               <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
//             ))}
//           </SelectContent>
//         </Select>

//         <Button
//           size="sm"
//           variant={activeSecondaryFilterCount > 0 ? "secondary" : "outline"}
//           onClick={() => setShowFilters((v) => !v)}
//         >
//           <SlidersHorizontal className="w-4 h-4 mr-1.5" />
//           Filters
//           {activeSecondaryFilterCount > 0 && (
//             <Badge variant="outline" className="ml-1.5 h-5 min-w-5 px-1 text-xs">
//               {activeSecondaryFilterCount}
//             </Badge>
//           )}
//         </Button>

//         <Button
//           size="sm"
//           variant={showDeleted ? "secondary" : "outline"}
//           onClick={() => setShowDeleted((v) => !v)}
//         >
//           <Trash2 className="w-4 h-4 mr-1.5" />
//           {showDeleted ? "Back to Invoices" : "Trash"}
//           {deletedCount > 0 && (
//             <Badge variant="outline" className="ml-1.5 h-5 min-w-5 px-1 text-xs">
//               {deletedCount}
//             </Badge>
//           )}
//         </Button>
//       </div>

//       {showDeleted && (
//         <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
//           Showing deleted invoices. These are excluded from GST Reports and the normal list until restored.
//         </div>
//       )}

//       {showFilters && (
//         <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
//           <Select value={statusFilter} onValueChange={setStatusFilter}>
//             <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All statuses</SelectItem>
//               {statusOptions.map((s) => (
//                 <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           <Select value={monthFilter} onValueChange={setMonthFilter}>
//             <SelectTrigger className="w-[140px]"><SelectValue placeholder="Month" /></SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All months</SelectItem>
//               {MONTHS.map((label, index) => (
//                 <SelectItem key={label} value={String(index + 1)}>{label}</SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           <Select value={yearFilter} onValueChange={setYearFilter}>
//             <SelectTrigger className="w-[110px]"><SelectValue placeholder="Year" /></SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All years</SelectItem>
//               {yearOptions.map((year) => (
//                 <SelectItem key={year} value={year}>{year}</SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           <div className="flex items-center gap-2">
//             <Input
//               type="date"
//               value={dateFrom}
//               onChange={(e) => setDateFrom(e.target.value)}
//               className="w-[150px]"
//             />
//             <span className="text-xs text-muted-foreground">to</span>
//             <Input
//               type="date"
//               value={dateTo}
//               onChange={(e) => setDateTo(e.target.value)}
//               className="w-[150px]"
//             />
//           </div>

//           {(activeSecondaryFilterCount > 0 || search) && (
//             <Button
//               size="sm"
//               variant="ghost"
//               onClick={() => {
//                 setStatusFilter("all");
//                 setMonthFilter("all");
//                 setYearFilter("all");
//                 setDateFrom("");
//                 setDateTo("");
//               }}
//             >
//               Clear filters
//             </Button>
//           )}
//         </div>
//       )}

//       <div className="space-y-2">
//         {paginatedRows.map((i) => (
//           <div
//             key={i.id}
//             id={`invoice-row-${i.id}`}
//             className={cn(
//               "flex flex-wrap justify-between gap-3 border rounded-lg p-4 transition-colors",
//               highlightedId === i.id
//                 ? "border-primary ring-2 ring-primary/40 bg-primary/5"
//                 : "border-border"
//             )}
//           >
//             <div>
//               <div className="flex items-center gap-2 mb-1">
//                 <Badge variant="outline" className="text-xs">
//                   {i.source_website || "ankshaastra.com"}
//                 </Badge>
//                 <p className="font-semibold text-primary">{i.invoice_number}</p>
//               </div>
//               <p className="text-sm text-muted-foreground">{i.customer_name} · {i.service_title}</p>
//               <p className="text-xs text-muted-foreground mt-1">{formatDate(i.invoice_date)}</p>
//             </div>
//             <div className="flex items-center gap-3">
//               <span className="font-semibold">₹{Number(i.total_amount).toLocaleString()}</span>

//               <Badge className={cn("capitalize border-0", STATUS_STYLES[i.status] || STATUS_STYLES.cancelled)}>
//                 {i.status}
//               </Badge>

//               {showDeleted ? (
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   disabled={restoringId === i.id}
//                   onClick={() => restoreInvoice(i.id)}
//                 >
//                   {restoringId === i.id ? (
//                     <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
//                   ) : (
//                     <RotateCcw className="w-4 h-4 mr-1.5" />
//                   )}
//                   Restore
//                 </Button>
//               ) : (
//                 <>
//                   {(i.pdf_storage_path || i.pdf_url) && (
//                     <Button
//                       size="icon"
//                       variant="ghost"
//                       className="h-8 w-8"
//                       disabled={downloadingId === i.id}
//                       onClick={() => downloadInvoice(i)}
//                       aria-label="Download invoice PDF"
//                     >
//                       {downloadingId === i.id ? (
//                         <Loader2 className="w-4 h-4 animate-spin" />
//                       ) : (
//                         <Download className="w-4 h-4" />
//                       )}
//                     </Button>
//                   )}

//                   <Button
//                     size="icon"
//                     variant="ghost"
//                     className="h-8 w-8"
//                     onClick={() => setViewInvoice(i)}
//                     aria-label="View invoice details"
//                   >
//                     <Eye className="w-4 h-4" />
//                   </Button>

//                   <Button
//                     size="icon"
//                     variant="ghost"
//                     className="h-8 w-8"
//                     onClick={() => openEmailModal(i)}
//                     aria-label="Send invoice email"
//                   >
//                     <Mail className="w-4 h-4" />
//                   </Button>

//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="More actions">
//                         <MoreVertical className="w-4 h-4" />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end">
//                       <DropdownMenuItem
//                         onClick={() => setDeleteInvoiceId(i.id)}
//                         className="text-destructive focus:text-destructive"
//                       >
//                         <Trash2 className="w-4 h-4 mr-2" />
//                         Delete
//                       </DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       {filteredRows.length > 0 && (
//         <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//           <p className="text-xs text-muted-foreground">
//             Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredRows.length)} of{" "}
//             {filteredRows.length}
//           </p>
//           <div className="flex items-center gap-3">
//             <Button size="sm" variant="outline" onClick={goToPreviousPage} disabled={page <= 1}>
//               Previous
//             </Button>
//             <p className="text-xs text-muted-foreground whitespace-nowrap">
//               Page {page} of {totalPages}
//             </p>
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
//                 <span className="text-muted-foreground">Order ID</span>
//                 <span className="font-medium font-mono text-xs">{viewInvoice.order_id || "—"}</span>
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
//                 <span className="font-medium text-right">{viewInvoice.billing_address || "—"}</span>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">GST Number</span>
//                 <span className="font-medium">{viewInvoice.customer_gstin || "—"}</span>
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
//                 <span className="text-muted-foreground">
//                   {Number(viewInvoice.igst_amount || 0) > 0 ? "IGST Amount" : "CGST + SGST Amount"}
//                 </span>
//                 <span className="font-medium">
//                   ₹{(
//                     Number(viewInvoice.cgst_amount || 0) +
//                     Number(viewInvoice.sgst_amount || 0) +
//                     Number(viewInvoice.igst_amount || 0)
//                   ).toLocaleString()}
//                 </span>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Total</span>
//                 <span className="font-medium">
//                   ₹{Number(viewInvoice.total_amount).toLocaleString()}
//                 </span>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Status</span>
//                 <Badge className={cn("capitalize border-0", STATUS_STYLES[viewInvoice.status] || STATUS_STYLES.cancelled)}>
//                   {viewInvoice.status}
//                 </Badge>
//               </div>
//               <div className="flex justify-between border-b border-border pb-2">
//                 <span className="text-muted-foreground">Website</span>
//                 <span className="font-medium">{viewInvoice.source_website || "ankshaastra.com"}</span>
//               </div>
//               <div className="flex justify-between pb-1">
//                 <span className="text-muted-foreground">Created Date</span>
//                 <span className="font-medium">
//                   {formatDateTime(viewInvoice.created_at || viewInvoice.invoice_date)}
//                 </span>
//               </div>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Create Invoice Dialog (two steps: form → preview) */}
//       <Dialog open={createOpen} onOpenChange={(open) => !open && !creating && closeCreateModal()}>
//         <DialogContent className="max-h-[85vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>
//               {createStep === "form" ? "Create Invoice" : "Preview Invoice"}
//             </DialogTitle>
//             <DialogDescription>
//               {createStep === "form"
//                 ? "Enter customer and service details to generate a new invoice."
//                 : "Review the details below, then confirm to generate the invoice."}
//             </DialogDescription>
//           </DialogHeader>

//           {createStep === "form" ? (
//             <div className="space-y-4 py-1">
//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1.5">
//                   <Label htmlFor="inv-customer-name">Customer Name</Label>
//                   <Input
//                     id="inv-customer-name"
//                     value={createForm.customerName}
//                     onChange={(e) => updateCreateForm("customerName", e.target.value)}
//                     placeholder="Full name"
//                   />
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label htmlFor="inv-customer-email">Customer Email</Label>
//                   <Input
//                     id="inv-customer-email"
//                     type="email"
//                     value={createForm.customerEmail}
//                     onChange={(e) => updateCreateForm("customerEmail", e.target.value)}
//                     placeholder="name@example.com"
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1.5">
//                   <Label htmlFor="inv-phone">Phone</Label>
//                   <Input
//                     id="inv-phone"
//                     value={createForm.customerPhone}
//                     onChange={(e) => updateCreateForm("customerPhone", e.target.value)}
//                     placeholder="+91 XXXXX XXXXX"
//                   />
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label>Website</Label>
//                   <Select
//                     value={createForm.sourceWebsite}
//                     onValueChange={(v) => updateCreateForm("sourceWebsite", v)}
//                   >
//                     <SelectTrigger><SelectValue placeholder="Select site" /></SelectTrigger>
//                     <SelectContent>
//                       {CONNECTED_SITE_OPTIONS.map((opt) => (
//                         <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1.5">
//                   <Label htmlFor="inv-city">
//                     City <span className="text-destructive">*</span>
//                   </Label>
//                   <Input
//                     id="inv-city"
//                     value={createForm.customerCity}
//                     onChange={(e) => updateCreateForm("customerCity", e.target.value)}
//                     placeholder="e.g. Jaipur"
//                     aria-invalid={showCityError}
//                     className={cn(showCityError && "border-destructive focus-visible:ring-destructive")}
//                   />
//                   {showCityError && (
//                     <p className="text-xs text-destructive">City is required.</p>
//                   )}
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label>
//                     State <span className="text-destructive">*</span>
//                   </Label>
//                   <Select
//                     value={createForm.customerState}
//                     onValueChange={(v) => updateCreateForm("customerState", v)}
//                   >
//                     <SelectTrigger
//                       aria-invalid={showStateError}
//                       className={cn(showStateError && "border-destructive focus-visible:ring-destructive")}
//                     >
//                       <SelectValue placeholder="Select state" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {INDIAN_STATES.map((state) => (
//                         <SelectItem key={state} value={state}>{state}</SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   {showStateError && (
//                     <p className="text-xs text-destructive">State is required.</p>
//                   )}
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1.5">
//                   <Label htmlFor="inv-pincode">
//                     Pincode <span className="text-destructive">*</span>
//                   </Label>
//                   <Input
//                     id="inv-pincode"
//                     value={createForm.customerPincode}
//                     onChange={(e) =>
//                       updateCreateForm("customerPincode", e.target.value.replace(/\D/g, "").slice(0, 6))
//                     }
//                     placeholder="e.g. 302001"
//                     inputMode="numeric"
//                     maxLength={6}
//                     aria-invalid={showPincodeError}
//                     className={cn(showPincodeError && "border-destructive focus-visible:ring-destructive")}
//                   />
//                   {showPincodeError && (
//                     <p className="text-xs text-destructive">Enter a valid 6-digit pincode.</p>
//                   )}
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label htmlFor="inv-gstin">Customer GSTIN (optional, for B2B)</Label>
//                   <Input
//                     id="inv-gstin"
//                     value={createForm.customerGstin}
//                     onChange={(e) => updateCreateForm("customerGstin", e.target.value.toUpperCase())}
//                     placeholder="e.g. 09AAFFE7583B1ZD"
//                     className="uppercase"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-1.5">
//                 <Label htmlFor="inv-service">Service</Label>
//                 <Input
//                   id="inv-service"
//                   value={createForm.serviceTitle}
//                   onChange={(e) => updateCreateForm("serviceTitle", e.target.value)}
//                   placeholder="e.g. Astrology Consultation"
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1.5">
//                   <Label htmlFor="inv-price">Price (₹, inclusive of GST)</Label>
//                   <Input
//                     id="inv-price"
//                     type="number"
//                     min="0"
//                     value={createForm.price}
//                     onChange={(e) => updateCreateForm("price", e.target.value)}
//                     placeholder="0.00"
//                   />
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label>GST %</Label>
//                   {/* Fixed at 18% — no dropdown, no admin choice. */}
//                   <Input value={`${FIXED_GST_RATE}% (fixed)`} disabled readOnly />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1.5">
//                   <Label>Payment Status</Label>
//                   <Select
//                     value={createForm.paymentStatus}
//                     onValueChange={(v) => updateCreateForm("paymentStatus", v)}
//                   >
//                     <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
//                     <SelectContent>
//                       {PAYMENT_STATUS_OPTIONS.map((s) => (
//                         <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label htmlFor="inv-date">Invoice Date</Label>
//                   <Input
//                     id="inv-date"
//                     type="date"
//                     value={createForm.invoiceDate}
//                     onChange={(e) => updateCreateForm("invoiceDate", e.target.value)}
//                   />
//                 </div>
//               </div>

//               <div className="space-y-1.5">
//                 <Label htmlFor="inv-notes">Notes</Label>
//                 <Textarea
//                   id="inv-notes"
//                   value={createForm.notes}
//                   onChange={(e) => updateCreateForm("notes", e.target.value)}
//                   placeholder="Optional internal notes"
//                   rows={3}
//                 />
//               </div>

//               <DialogFooter className="pt-2">
//                 <Button variant="outline" onClick={closeCreateModal}>Cancel</Button>
//                 <Button onClick={goToPreview}>Preview Invoice</Button>
//               </DialogFooter>
//             </div>
//           ) : (
//             <div className="space-y-4 py-1">
//               <div className="space-y-2 text-sm rounded-lg border border-border p-4">
//                 <div className="flex justify-between border-b border-border pb-2">
//                   <span className="text-muted-foreground">Invoice Number</span>
//                   <span className="font-medium">Auto-generated on save</span>
//                 </div>
//                 <div className="flex justify-between border-b border-border pb-2">
//                   <span className="text-muted-foreground">Customer</span>
//                   <span className="font-medium text-right">
//                     {createForm.customerName}
//                     <br />
//                     <span className="text-xs text-muted-foreground">{createForm.customerEmail}</span>
//                   </span>
//                 </div>
//                 <div className="flex justify-between border-b border-border pb-2">
//                   <span className="text-muted-foreground">Billing Address</span>
//                   <span className="font-medium text-right">
//                     {[createForm.customerCity, createForm.customerState, createForm.customerPincode]
//                       .filter(Boolean)
//                       .join(", ") || "—"}
//                   </span>
//                 </div>
//                 <div className="flex justify-between border-b border-border pb-2">
//                   <span className="text-muted-foreground">Customer GSTIN</span>
//                   <span className="font-medium">{createForm.customerGstin || "—"}</span>
//                 </div>
//                 <div className="flex justify-between border-b border-border pb-2">
//                   <span className="text-muted-foreground">Website</span>
//                   <span className="font-medium">
//                     {CONNECTED_SITE_OPTIONS.find((o) => o.value === createForm.sourceWebsite)?.label ||
//                       createForm.sourceWebsite}
//                   </span>
//                 </div>
//                 <div className="flex justify-between border-b border-border pb-2">
//                   <span className="text-muted-foreground">Service</span>
//                   <span className="font-medium text-right">{createForm.serviceTitle}</span>
//                 </div>
//                 <div className="flex justify-between border-b border-border pb-2">
//                   <span className="text-muted-foreground">Price (incl. GST)</span>
//                   <span className="font-medium">₹{previewTotal.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between border-b border-border pb-2">
//                   <span className="text-muted-foreground">Taxable Amount</span>
//                   <span className="font-medium">₹{previewAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
//                 </div>
//                 <div className="flex justify-between border-b border-border pb-2">
//                   <span className="text-muted-foreground">GST ({FIXED_GST_RATE}%, included)</span>
//                   <span className="font-medium">₹{previewGstAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
//                 </div>
//                 <div className="flex justify-between border-b border-border pb-2">
//                   <span className="text-muted-foreground">Total (Customer Pays)</span>
//                   <span className="font-semibold">₹{previewTotal.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between pb-1">
//                   <span className="text-muted-foreground">Email</span>
//                   <span className="font-medium">{createForm.customerEmail}</span>
//                 </div>
//               </div>

//               <p className="text-xs text-muted-foreground">
//                 This is an estimated preview. The final CGST/SGST vs IGST split is calculated by the
//                 system based on the business's GST configuration and the customer's state at the time
//                 the invoice is generated.
//               </p>

//               <DialogFooter className="pt-2">
//                 <Button variant="outline" onClick={() => setCreateStep("form")} disabled={creating}>
//                   <ArrowLeft className="w-4 h-4 mr-1.5" />
//                   Back
//                 </Button>
//                 <Button onClick={confirmCreateInvoice} disabled={creating}>
//                   {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
//                   Confirm &amp; Create
//                 </Button>
//               </DialogFooter>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Send Email Dialog */}
//       <Dialog open={!!emailInvoice} onOpenChange={(open) => !open && !sendingEmail && closeEmailModal()}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Send Invoice Email</DialogTitle>
//             <DialogDescription>
//               {emailInvoice ? `Send invoice ${emailInvoice.invoice_number} to the customer.` : ""}
//             </DialogDescription>
//           </DialogHeader>

//           <div className="space-y-4 py-1">
//             <div className="space-y-1.5">
//               <Label htmlFor="email-to">Customer Email</Label>
//               <Input
//                 id="email-to"
//                 type="email"
//                 value={emailTo}
//                 onChange={(e) => setEmailTo(e.target.value)}
//                 placeholder="name@example.com"
//               />
//             </div>

//             <div className="space-y-1.5">
//               <Label htmlFor="email-subject">Subject</Label>
//               <Input
//                 id="email-subject"
//                 value={emailSubject}
//                 onChange={(e) => setEmailSubject(e.target.value)}
//               />
//             </div>

//             <div className="space-y-1.5">
//               <Label htmlFor="email-message">Message</Label>
//               <Textarea
//                 id="email-message"
//                 rows={5}
//                 value={emailMessage}
//                 onChange={(e) => setEmailMessage(e.target.value)}
//               />
//             </div>

//             <div className="flex items-center gap-2">
//               <Checkbox
//                 id="email-attach-pdf"
//                 checked={emailAttachPdf}
//                 onCheckedChange={(checked) => setEmailAttachPdf(checked === true)}
//               />
//               <Label htmlFor="email-attach-pdf" className="cursor-pointer font-normal">
//                 Attach PDF
//               </Label>
//             </div>
//           </div>

//           <DialogFooter>
//             <Button variant="outline" onClick={closeEmailModal} disabled={sendingEmail}>
//               Cancel
//             </Button>
//             <Button onClick={confirmSendEmail} disabled={sendingEmail}>
//               {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
//               Send Invoice
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Delete Invoice Confirmation Dialog */}
//       <AlertDialog open={!!deleteInvoiceId} onOpenChange={(open) => !open && setDeleteInvoiceId(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete this invoice?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This invoice will move to Trash and be excluded from GST Reports. You can restore it
//               anytime from the Trash tab — nothing is permanently removed.
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

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AdminPage } from "@/components/admin/AdminPage";
import { useAdminTable } from "@/hooks/useAdminData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import {
  Download,
  FileArchive,
  Loader2,
  Eye,
  Trash2,
  SlidersHorizontal,
  MoreVertical,
  Plus,
  Mail,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import { downloadMonthlyInvoiceZip, fetchInvoiceDownloadUrl } from "@/lib/invoice-download";
import { createManualInvoice, sendInvoiceEmail, getBusinessGstStateCode } from "@/lib/invoice-actions";
import { stateCodeFromName } from "@/lib/indian-states";
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
  // NOTE: the actual columns written by invoice-engine.ts are
  // `billing_address` and `customer_gstin` — not `customer_address` /
  // `gst_number`. Using the real column names here so the View dialog
  // below actually finds the data instead of always showing "—".
  customer_email?: string;
  billing_address?: string;
  customer_gstin?: string;
  gst_amount?: number;
  cgst_amount?: number;
  sgst_amount?: number;
  igst_amount?: number;
  created_at?: string;
  // The order this invoice was generated from — shown in the View dialog
  // (and exported to Sales Register / GSTR Excel) so an invoice can always
  // be traced back to its original order.
  order_id?: string | null;
  // Soft-delete: set when an admin deletes the invoice from Invoice
  // Manager. NULL/undefined = active invoice. Rows with this set are
  // hidden from the default list (and from GST Reports) but stay in the
  // database so they can be restored — see confirmDeleteInvoice /
  // restoreInvoice below.
  deleted_at?: string | null;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Matches the state names resolved by stateCodeFromName() in the invoice
// engine (indian-states.js) — picking one of these ensures the backend can
// correctly resolve place of supply and CGST/SGST vs IGST.
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry",
];

const PAGE_SIZE = 10;

// India Post's public API only matches text against the post office's own
// NAME, not the city/district — and its records still use old official
// spellings for several renamed cities. So a search for "Bengaluru" often
// returns zero results (every branch there is still filed under
// "Bangalore..."), and the State field would stay blank even though this is
// one of the most common cities admins will type. This small, hand-picked
// map is checked first for well-known cities/aliases before ever calling
// the API, so these always resolve correctly and instantly.
const CITY_STATE_ALIASES: Record<string, string> = {
  bengaluru: "Karnataka", bangalore: "Karnataka", mysuru: "Karnataka", mysore: "Karnataka",
  mumbai: "Maharashtra", bombay: "Maharashtra", pune: "Maharashtra", poona: "Maharashtra", nagpur: "Maharashtra",
  chennai: "Tamil Nadu", madras: "Tamil Nadu", coimbatore: "Tamil Nadu",
  kolkata: "West Bengal", calcutta: "West Bengal",
  hyderabad: "Telangana", secunderabad: "Telangana",
  vishakhapatnam: "Andhra Pradesh", vizag: "Andhra Pradesh", visakhapatnam: "Andhra Pradesh",
  ahmedabad: "Gujarat", vadodara: "Gujarat", baroda: "Gujarat", surat: "Gujarat",
  gurugram: "Haryana", gurgaon: "Haryana", faridabad: "Haryana",
  thiruvananthapuram: "Kerala", trivandrum: "Kerala", kochi: "Kerala", cochin: "Kerala",
  varanasi: "Uttar Pradesh", banaras: "Uttar Pradesh", benares: "Uttar Pradesh",
  prayagraj: "Uttar Pradesh", allahabad: "Uttar Pradesh", lucknow: "Uttar Pradesh", kanpur: "Uttar Pradesh",
  delhi: "Delhi", "new delhi": "Delhi",
  pondicherry: "Puducherry", puducherry: "Puducherry",
  jodhpur: "Rajasthan", jaipur: "Rajasthan", udaipur: "Rajasthan",
  bhubaneswar: "Odisha", panaji: "Goa", panjim: "Goa",
};

// India Post's search API only matches its own (often old/official) branch
// spellings — e.g. no branch is literally named "Bengaluru", they're all
// filed under "Bangalore...". CITY_STATE_ALIASES above fixes the State
// field for these instantly without even calling the API, but Pincode still
// needs a real API result — so for any city whose common name wouldn't
// actually match anything in India Post's records, this swaps in the
// spelling that will.
const CITY_SEARCH_ALIASES: Record<string, string> = {
  bengaluru: "Bangalore", mysuru: "Mysore",
  mumbai: "Bombay", poona: "Pune",
  vadodara: "Baroda",
  thiruvananthapuram: "Trivandrum", kochi: "Cochin",
  prayagraj: "Allahabad",
  gurugram: "Gurgaon",
  vishakhapatnam: "Visakhapatnam",
};

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

// GST rate is fixed at 18% for manually-created invoices — no dropdown, no
// admin choice. If a different rate is ever needed for a specific service,
// that should go through the GST Configuration module instead.
const FIXED_GST_RATE = 18;

const PAYMENT_STATUS_OPTIONS = ["paid", "pending", "failed"];

type CreateInvoiceForm = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  sourceWebsite: string;
  serviceTitle: string;
  price: string;
  paymentStatus: string;
  invoiceDate: string;
  notes: string;
  customerCity: string;
  customerState: string;
  customerPincode: string;
  customerGstin: string;
};

function emptyCreateForm(): CreateInvoiceForm {
  const today = new Date().toISOString().slice(0, 10);
  return {
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    sourceWebsite: CONNECTED_SITE_OPTIONS[0]?.value || "ankshaastra.com",
    serviceTitle: "",
    price: "",
    paymentStatus: "paid",
    invoiceDate: today,
    notes: "",
    customerCity: "",
    customerState: "",
    customerPincode: "",
    customerGstin: "",
  };
}

// Matches the format used for invoiceDate in server/lib/build-invoice-template.ts
// (en-GB, 2-digit day) so Invoice Date reads identically in the PDF, the
// customer email, and this admin panel — e.g. "04 Aug 2026" everywhere.
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return `${formatDate(iso)}, ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
}

// Writes one row to audit_logs for an Invoice action (delete/restore).
// Mirrors the local logAudit() in OrdersModule.tsx — same table, same
// column names — so Invoice deletes/restores show up in the Audit Logs
// page the same way Order deletes already do. Fire-and-forget: a logging
// failure must never block or throw into the delete/restore action itself,
// which has already succeeded by the time this runs.
async function logAudit(
  actionType: "delete" | "restore",
  targetId: string,
  targetName: string,
  actorRole?: string | null,
  sourceWebsite?: string | null,
) {
  try {
    const { data } = await supabase.auth.getUser();
    const actor = data.user;
    const { error } = await supabase.from("audit_logs").insert({
      user_id: actor?.id ?? null,
      user_name: actor?.user_metadata?.full_name || actor?.email || null,
      user_email: actor?.email ?? null,
      user_role: actorRole ?? null,
      action_type: actionType,
      module: "invoices",
      record_id: targetId,
      record_name: targetName,
      source_website: sourceWebsite ?? null,
    });
    if (error) {
      console.warn("[audit-log] failed to write invoices entry:", error.message);
    }
  } catch (err) {
    console.warn("[audit-log] unexpected error writing invoices entry:", err);
  }
}

export default function InvoicesModule() {
  const { role } = useAuth();
  const { rows, loading, reload } = useAdminTable<Invoice>("invoices", "created_at");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const now = new Date();
  const [bulkYear, setBulkYear] = useState(String(now.getFullYear()));
  const [bulkMonth, setBulkMonth] = useState(String(now.getMonth() + 1));
  const [siteFilter, setSiteFilter] = useState("all");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [showFilters, setShowFilters] = useState(false);

  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  // Deep-link support: Global Search sends ?open=<invoice id>. Instead of
  // auto-opening a read-only dialog, scroll to and briefly highlight that
  // exact row in the list, so the admin can use any action on it (View,
  // Download, Email, Delete) themselves — not just see a static popup.
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  useEffect(() => {
    const openId = searchParams.get("open");
    if (!openId || !rows.length) return;
    const match = rows.find((i) => i.id === openId);
    if (match) {
      setHighlightedId(openId);
      setSearchParams({}, { replace: true });
      // Wait a tick for the list to render, then scroll the row into view.
      setTimeout(() => {
        document.getElementById(`invoice-row-${openId}`)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
      // Remove the highlight after a few seconds.
      setTimeout(() => setHighlightedId(null), 3000);
    }
  }, [searchParams, rows, setSearchParams]);

  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Trash view: default list only ever shows active (non-deleted)
  // invoices. Flipping this shows exactly the opposite — only
  // soft-deleted ones — with a Restore action instead of Delete/Email/etc.
  const [showDeleted, setShowDeleted] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState<"form" | "preview">("form");
  const [createForm, setCreateForm] = useState<CreateInvoiceForm>(emptyCreateForm());
  const [creating, setCreating] = useState(false);
  const [createFormTouched, setCreateFormTouched] = useState(false);
  // Business's home GST state code, fetched once when the create-invoice
  // modal opens — used only to preview IGST vs CGST+SGST in the preview
  // step. The final split is still always calculated server-side.
  const [businessStateCode, setBusinessStateCode] = useState<string | undefined>(undefined);

  const [emailInvoice, setEmailInvoice] = useState<Invoice | null>(null);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailAttachPdf, setEmailAttachPdf] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);

  const yearOptions = useMemo(() => {
  const START_YEAR = 2026;
  const END_YEAR = 2034;
  return Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => String(START_YEAR + i));
}, []);

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
    // Trash view flips this: normal browsing only ever shows active
    // invoices, Trash only shows soft-deleted ones.
    let data = rows.filter((i) => (showDeleted ? !!i.deleted_at : !i.deleted_at));

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
  }, [rows, showDeleted, siteFilter, statusFilter, monthFilter, yearFilter, dateFrom, dateTo, search]);

  useMemo(() => {
    setPage(1);
  }, [showDeleted, siteFilter, statusFilter, monthFilter, yearFilter, dateFrom, dateTo, search]);

  const deletedCount = useMemo(() => rows.filter((i) => !!i.deleted_at).length, [rows]);

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

  // Soft delete: stamps deleted_at/deleted_by instead of removing the row,
  // so the invoice disappears from the normal list and from GST Reports
  // (server filters deleted_at IS NULL) but can be brought back via
  // restoreInvoice below. Email logs are left alone — they're history of
  // what was actually sent, independent of whether the invoice is later
  // deleted.
  const confirmDeleteInvoice = async () => {
    if (!deleteInvoiceId) return;
    setDeleting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;

      const { error } = await supabase
        .from("invoices")
        .update({ deleted_at: new Date().toISOString(), deleted_by: userId })
        .eq("id", deleteInvoiceId);

      if (error) {
        toast.error(error.message || "Failed to delete invoice");
      } else {
        const deletedInvoice = rows.find((i) => i.id === deleteInvoiceId);
        void logAudit(
          "delete",
          deleteInvoiceId,
          deletedInvoice?.invoice_number || deleteInvoiceId,
          role,
          deletedInvoice?.source_website,
        );
        toast.success("Invoice moved to Trash — you can restore it from there anytime");
        reload();
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete invoice");
    } finally {
      setDeleting(false);
      setDeleteInvoiceId(null);
    }
  };

  const restoreInvoice = async (invoiceId: string) => {
    setRestoringId(invoiceId);
    try {
      const { error } = await supabase
        .from("invoices")
        .update({ deleted_at: null, deleted_by: null })
        .eq("id", invoiceId);
      if (error) {
        toast.error(error.message || "Failed to restore invoice");
      } else {
        const restoredInvoice = rows.find((i) => i.id === invoiceId);
        void logAudit(
          "restore",
          invoiceId,
          restoredInvoice?.invoice_number || invoiceId,
          role,
          restoredInvoice?.source_website,
        );
        toast.success("Invoice restored");
        reload();
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to restore invoice");
    } finally {
      setRestoringId(null);
    }
  };

  const openCreateModal = () => {
    setCreateForm(emptyCreateForm());
    setCreateStep("form");
    setCreateFormTouched(false);
    autoFilledRef.current = { state: false, pincode: false };
    setCreateOpen(true);
    // Fetch once per modal open — only needed to label the preview row,
    // so a failure here just falls back to the generic "GST" label.
    getBusinessGstStateCode().then(setBusinessStateCode);
  };

  const closeCreateModal = () => {
    setCreateOpen(false);
    setCreateStep("form");
    setCreateForm(emptyCreateForm());
    setCreateFormTouched(false);
    autoFilledRef.current = { state: false, pincode: false };
  };

  const updateCreateForm = <K extends keyof CreateInvoiceForm>(key: K, value: CreateInvoiceForm[K]) => {
    setCreateForm((f) => ({ ...f, [key]: value }));
  };

  // Tracks which of State/Pincode currently hold a value the city-lookup
  // effect auto-filled (safe to replace the next time the city changes) vs.
  // a value the admin typed/selected themselves (must never be silently
  // overwritten). Previously the auto-fill only ever wrote into an EMPTY
  // field, which meant: type "Jodhpur", get a wrong auto-filled state,
  // then correct the city to "Jaipur" — State was no longer empty, so it
  // stayed stuck on the first (wrong) guess forever.
  const autoFilledRef = useRef<{ state: boolean; pincode: boolean }>({ state: false, pincode: false });

  const updateCreateFormManually = <K extends "customerState" | "customerPincode">(
    key: K,
    value: CreateInvoiceForm[K],
  ) => {
    autoFilledRef.current[key === "customerState" ? "state" : "pincode"] = false;
    updateCreateForm(key, value);
  };

  // The State <Select> only recognizes the exact strings in INDIAN_STATES.
  // India Post's API doesn't reliably return the same casing/wording (e.g.
  // could return "NCT of Delhi" instead of "Delhi"), so a raw assignment
  // could silently leave the dropdown showing no selection. Resolve via
  // state code (same lookup used for the GST split) instead of trusting
  // the API's string directly.
  const normalizeToStateOption = (raw: string): string | undefined => {
    const trimmed = raw.trim();
    if (!trimmed) return undefined;
    const exact = INDIAN_STATES.find((s) => s.toLowerCase() === trimmed.toLowerCase());
    if (exact) return exact;
    const code = stateCodeFromName(trimmed);
    if (!code) return undefined;
    return INDIAN_STATES.find((s) => stateCodeFromName(s) === code);
  };

  // Auto-fill State + Pincode from the typed City, using the same India
  // Post public API Payment.tsx already uses for the reverse direction
  // (pincode -> city/state). Looking a city UP by name is inherently
  // ambiguous — several places across India share the same name in
  // different states (e.g. there's a small Jodhpur in Gujarat as well as
  // the well-known Jodhpur in Rajasthan) — so this prefers whichever
  // returned post office's District actually matches the typed city,
  // instead of blindly trusting whatever the API lists first. It only
  // ever fills fields the admin hasn't manually edited themselves (see
  // autoFilledRef) — so correcting the city afterwards still updates
  // State/Pincode, but never overwrites something the admin typed in.
  useEffect(() => {
    const city = createForm.customerCity.trim();
    if (city.length < 3 || !createOpen) return;
    const cityLower = city.toLowerCase();

    const timer = setTimeout(async () => {
      // 1) Known city → always-correct state, no network round trip needed.
      let state = CITY_STATE_ALIASES[cityLower]
        ? normalizeToStateOption(CITY_STATE_ALIASES[cityLower])
        : undefined;
      let pincode: string | undefined;

      try {
        const searchTerm = CITY_SEARCH_ALIASES[cityLower] || city;
        const fetchOffices = async (term: string) => {
          const res = await fetch(`https://api.postalpincode.in/postoffice/${encodeURIComponent(term)}`);
          const data = await res.json();
          return (data?.[0]?.PostOffice || []) as Array<{
            District?: string; State?: string; Pincode?: string; Block?: string;
          }>;
        };

        let offices = await fetchOffices(searchTerm);
        // If the alias spelling didn't match anything either, fall back to
        // whatever the admin actually typed as a last resort.
        if (!offices.length && searchTerm !== city) {
          offices = await fetchOffices(city);
        }

        if (offices.length) {
          // Prefer a post office whose District (or, failing that, Block)
          // matches the typed city exactly.
          let po =
            offices.find((o) => (o.District || "").trim().toLowerCase() === cityLower) ||
            offices.find((o) => (o.Block || "").trim().toLowerCase() === cityLower);

          // No exact match (common for big metros, where the district is
          // officially named e.g. "Bangalore Urban", not "Bangalore") — take
          // whichever State most of the search results agree on, instead of
          // blindly trusting whatever happens to be first. A single
          // same-named place in another state (like the small Jodhpur that
          // exists in Gujarat) then can't outvote the real match.
          if (!po) {
            const counts = new Map<string, number>();
            for (const o of offices) {
              const s = (o.State || "").trim();
              if (s) counts.set(s, (counts.get(s) || 0) + 1);
            }
            let bestState: string | undefined;
            let bestCount = 0;
            for (const [s, count] of counts) {
              if (count > bestCount) { bestState = s; bestCount = count; }
            }
            po = offices.find((o) => (o.State || "").trim() === bestState) || offices[0];
          }

          if (!state) state = normalizeToStateOption(String(po.State || ""));
          pincode = String(po.Pincode || "").trim() || undefined;
        }
      } catch {
        // Best-effort only — admin can always fill State/Pincode manually.
        // A known-city alias match above still applies even if this fails.
      }

      if (!state && !pincode) return;
      setCreateForm((f) => {
        // Re-check against the latest form state (not the stale closure)
        // in case the admin kept typing or filled these in while the
        // request was in flight.
        if (f.customerCity.trim() !== city) return f;
        const next = { ...f };
        // Fill if the field is empty, OR still holds a value we
        // auto-filled earlier (so a corrected city can replace a
        // previous — possibly wrong — auto-filled guess). Never touch a
        // value the admin entered/selected themselves.
        if (state && (!f.customerState.trim() || autoFilledRef.current.state)) {
          next.customerState = state;
          autoFilledRef.current.state = true;
        }
        if (pincode && (!f.customerPincode.trim() || autoFilledRef.current.pincode)) {
          next.customerPincode = pincode;
          autoFilledRef.current.pincode = true;
        }
        return next;
      });
    }, 600);

    return () => clearTimeout(timer);
  }, [createForm.customerCity, createOpen]);

  const pincodeIsValid = /^\d{6}$/.test(createForm.customerPincode.trim());

  const createFormIsValid =
    !!createForm.customerName.trim() &&
    !!createForm.customerEmail.trim() &&
    !!createForm.serviceTitle.trim() &&
    Number(createForm.price) > 0 &&
    !!createForm.customerCity.trim() &&
    !!createForm.customerState.trim() &&
    pincodeIsValid;

  const showCityError = createFormTouched && !createForm.customerCity.trim();
  const showStateError = createFormTouched && !createForm.customerState.trim();
  const showPincodeError = createFormTouched && !pincodeIsValid;

  // Price entered by the admin is treated as GST-INCLUSIVE (i.e. it's the
  // final amount the customer pays) — so the taxable value and GST portion
  // are both back-calculated out of it, instead of adding GST on top of it.
  // GST rate itself is fixed at 18% (FIXED_GST_RATE) — no admin choice.
  const previewTotal = Number(createForm.price) || 0;
  const previewAmount = previewTotal / (1 + FIXED_GST_RATE / 100);
  const previewGstAmount = previewTotal - previewAmount;

  // Preview-only label for which GST split will apply — mirrors the
  // server's businessState === customerState comparison (server/lib/gst.ts)
  // using the state the admin picked. Falls back to a generic "GST" label
  // if the business state hasn't loaded yet (e.g. no "settings" module
  // access) — the actual split is still always computed server-side at
  // invoice-generation time regardless of what this shows.
  const previewCustomerStateCode = stateCodeFromName(createForm.customerState);
  const previewGstLabel =
    businessStateCode && previewCustomerStateCode
      ? previewCustomerStateCode === businessStateCode
        ? `CGST + SGST (${FIXED_GST_RATE}%, included)`
        : `IGST (${FIXED_GST_RATE}%, included)`
      : `GST (${FIXED_GST_RATE}%, included)`;

  const goToPreview = () => {
    setCreateFormTouched(true);
    if (!createFormIsValid) {
      toast.error("Please fill customer name, email, service, price, city, state and a valid 6-digit pincode.");
      return;
    }
    setCreateStep("preview");
  };

  const confirmCreateInvoice = async () => {
    setCreating(true);
    try {
      const result = await createManualInvoice({
        customerName: createForm.customerName.trim(),
        customerEmail: createForm.customerEmail.trim(),
        customerPhone: createForm.customerPhone.trim() || undefined,
        sourceWebsite: createForm.sourceWebsite,
        serviceTitle: createForm.serviceTitle.trim(),
        // IMPORTANT: send the raw, GST-inclusive total the customer actually
        // pays — invoice-engine.js (via processInvoiceJob) already divides
        // this by (1 + gstRate/100) internally to derive the taxable amount
        // and CGST/SGST/IGST split (confirmed from a real generated PDF:
        // total_amount 293 -> taxable 248.31 -> matches 293 / 1.18). Sending
        // previewAmount (the already-back-calculated taxable value) here
        // instead would make the backend divide by 1.18 a second time.
        price: previewTotal,
        gstRate: FIXED_GST_RATE,
        paymentStatus: createForm.paymentStatus,
        invoiceDate: createForm.invoiceDate,
        notes: createForm.notes.trim() || undefined,
        customerCity: createForm.customerCity.trim() || undefined,
        customerState: createForm.customerState.trim() || undefined,
        customerPincode: createForm.customerPincode.trim() || undefined,
        customerGstin: createForm.customerGstin.trim() || undefined,
      });

      if (result.ok === false) {
        toast.error(result.error || "Invoice is still being generated — refresh in a few seconds.");
        return;
      }

      // REVERTED (2026-08-31): backend generates the invoice synchronously
      // again (see invoices-create-manual.ts), so invoice_number is always
      // present here on success — no more "generating" placeholder state.
      toast.success(
        result.invoice_number ? `Invoice ${result.invoice_number} created successfully` : "Invoice created successfully",
      );
      closeCreateModal();
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create invoice");
    } finally {
      setCreating(false);
    }
  };

  const openEmailModal = (inv: Invoice) => {
    setEmailInvoice(inv);
    setEmailTo(inv.customer_email || "");
    setEmailSubject(`Invoice ${inv.invoice_number} — ${inv.service_title}`);
    setEmailMessage(
      `Dear ${inv.customer_name || "Customer"},\n\nPlease find your invoice ${inv.invoice_number} attached.\n\nThank you for choosing us.`,
    );
    setEmailAttachPdf(true);
  };

  const closeEmailModal = () => {
    setEmailInvoice(null);
    setEmailTo("");
    setEmailSubject("");
    setEmailMessage("");
    setEmailAttachPdf(true);
  };

  const confirmSendEmail = async () => {
    if (!emailInvoice) return;
    if (!emailTo.trim()) {
      toast.error("Recipient email is required");
      return;
    }
    if (!emailSubject.trim()) {
      toast.error("Subject is required");
      return;
    }

    setSendingEmail(true);
    try {
      await sendInvoiceEmail({
        invoiceId: emailInvoice.id,
        to: emailTo.trim(),
        subject: emailSubject.trim(),
        message: emailMessage,
        attachPdf: emailAttachPdf,
      });
      toast.success("Invoice email sent successfully");
      closeEmailModal();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send invoice email");
    } finally {
      setSendingEmail(false);
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
      <Button size="sm" variant="default" onClick={openCreateModal}>
        <Plus className="w-4 h-4 mr-2" />
        Create Invoice
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

        <Button
          size="sm"
          variant={showDeleted ? "secondary" : "outline"}
          onClick={() => setShowDeleted((v) => !v)}
        >
          <Trash2 className="w-4 h-4 mr-1.5" />
          {showDeleted ? "Back to Invoices" : "Trash"}
          {deletedCount > 0 && (
            <Badge variant="outline" className="ml-1.5 h-5 min-w-5 px-1 text-xs">
              {deletedCount}
            </Badge>
          )}
        </Button>
      </div>

      {showDeleted && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Showing deleted invoices. These are excluded from GST Reports and the normal list until restored.
        </div>
      )}

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

      <div className="space-y-2">
        {paginatedRows.map((i) => (
          <div
            key={i.id}
            id={`invoice-row-${i.id}`}
            className={cn(
              "flex flex-wrap justify-between gap-3 border rounded-lg p-4 transition-colors",
              highlightedId === i.id
                ? "border-primary ring-2 ring-primary/40 bg-primary/5"
                : "border-border"
            )}
          >
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

              {showDeleted ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={restoringId === i.id}
                  onClick={() => restoreInvoice(i.id)}
                >
                  {restoringId === i.id ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  ) : (
                    <RotateCcw className="w-4 h-4 mr-1.5" />
                  )}
                  Restore
                </Button>
              ) : (
                <>
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

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => openEmailModal(i)}
                    aria-label="Send invoice email"
                  >
                    <Mail className="w-4 h-4" />
                  </Button>

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
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredRows.length > 0 && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredRows.length)} of{" "}
            {filteredRows.length}
          </p>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" onClick={goToPreviousPage} disabled={page <= 1}>
              Previous
            </Button>
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              Page {page} of {totalPages}
            </p>
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
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-medium font-mono text-xs">{viewInvoice.order_id || "—"}</span>
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
                <span className="font-medium text-right">{viewInvoice.billing_address || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">GST Number</span>
                <span className="font-medium">{viewInvoice.customer_gstin || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium text-right">{viewInvoice.service_title}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">₹{Number(viewInvoice.total_amount).toLocaleString()}</span>
              </div>
              {Number(viewInvoice.igst_amount || 0) > 0 ? (
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">IGST Amount</span>
                  <span className="font-medium">₹{Number(viewInvoice.igst_amount || 0).toLocaleString()}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">CGST Amount</span>
                    <span className="font-medium">₹{Number(viewInvoice.cgst_amount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">SGST Amount</span>
                    <span className="font-medium">₹{Number(viewInvoice.sgst_amount || 0).toLocaleString()}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium">
                  ₹{Number(viewInvoice.total_amount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Status</span>
                <Badge className={cn("capitalize border-0", STATUS_STYLES[viewInvoice.status] || STATUS_STYLES.cancelled)}>
                  {viewInvoice.status}
                </Badge>
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

      {/* Create Invoice Dialog (two steps: form → preview) */}
      <Dialog open={createOpen} onOpenChange={(open) => !open && !creating && closeCreateModal()}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {createStep === "form" ? "Create Invoice" : "Preview Invoice"}
            </DialogTitle>
            <DialogDescription>
              {createStep === "form"
                ? "Enter customer and service details to generate a new invoice."
                : "Review the details below, then confirm to generate the invoice."}
            </DialogDescription>
          </DialogHeader>

          {createStep === "form" ? (
            <div className="space-y-4 py-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="inv-customer-name">Customer Name</Label>
                  <Input
                    id="inv-customer-name"
                    value={createForm.customerName}
                    onChange={(e) => updateCreateForm("customerName", e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inv-customer-email">Customer Email</Label>
                  <Input
                    id="inv-customer-email"
                    type="email"
                    value={createForm.customerEmail}
                    onChange={(e) => updateCreateForm("customerEmail", e.target.value)}
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="inv-phone">Phone</Label>
                  <Input
                    id="inv-phone"
                    value={createForm.customerPhone}
                    onChange={(e) => updateCreateForm("customerPhone", e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Website</Label>
                  <Select
                    value={createForm.sourceWebsite}
                    onValueChange={(v) => updateCreateForm("sourceWebsite", v)}
                  >
                    <SelectTrigger><SelectValue placeholder="Select site" /></SelectTrigger>
                    <SelectContent>
                      {CONNECTED_SITE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="inv-city">
                    City <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="inv-city"
                    value={createForm.customerCity}
                    onChange={(e) => updateCreateForm("customerCity", e.target.value)}
                    placeholder="e.g. Jaipur"
                    aria-invalid={showCityError}
                    className={cn(showCityError && "border-destructive focus-visible:ring-destructive")}
                  />
                  {showCityError && (
                    <p className="text-xs text-destructive">City is required.</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>
                    State <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={createForm.customerState}
                    onValueChange={(v) => updateCreateFormManually("customerState", v)}
                  >
                    <SelectTrigger
                      aria-invalid={showStateError}
                      className={cn(showStateError && "border-destructive focus-visible:ring-destructive")}
                    >
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showStateError && (
                    <p className="text-xs text-destructive">State is required.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="inv-pincode">
                    Pincode <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="inv-pincode"
                    value={createForm.customerPincode}
                    onChange={(e) =>
                      updateCreateFormManually("customerPincode", e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="e.g. 302001"
                    inputMode="numeric"
                    maxLength={6}
                    aria-invalid={showPincodeError}
                    className={cn(showPincodeError && "border-destructive focus-visible:ring-destructive")}
                  />
                  {showPincodeError && (
                    <p className="text-xs text-destructive">Enter a valid 6-digit pincode.</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inv-gstin">Customer GSTIN (optional, for B2B)</Label>
                  <Input
                    id="inv-gstin"
                    value={createForm.customerGstin}
                    onChange={(e) => updateCreateForm("customerGstin", e.target.value.toUpperCase())}
                    placeholder="e.g. 09AAFFE7583B1ZD"
                    className="uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="inv-service">Service</Label>
                <Input
                  id="inv-service"
                  value={createForm.serviceTitle}
                  onChange={(e) => updateCreateForm("serviceTitle", e.target.value)}
                  placeholder="e.g. Astrology Consultation"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="inv-price">Price (₹, inclusive of GST)</Label>
                  <Input
                    id="inv-price"
                    type="number"
                    min="0"
                    value={createForm.price}
                    onChange={(e) => updateCreateForm("price", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>GST %</Label>
                  {/* Fixed at 18% — no dropdown, no admin choice. */}
                  <Input value={`${FIXED_GST_RATE}% (fixed)`} disabled readOnly />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Payment Status</Label>
                  <Select
                    value={createForm.paymentStatus}
                    onValueChange={(v) => updateCreateForm("paymentStatus", v)}
                  >
                    <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inv-date">Invoice Date</Label>
                  <Input
                    id="inv-date"
                    type="date"
                    value={createForm.invoiceDate}
                    onChange={(e) => updateCreateForm("invoiceDate", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="inv-notes">Notes</Label>
                <Textarea
                  id="inv-notes"
                  value={createForm.notes}
                  onChange={(e) => updateCreateForm("notes", e.target.value)}
                  placeholder="Optional internal notes"
                  rows={3}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button variant="outline" onClick={closeCreateModal}>Cancel</Button>
                <Button onClick={goToPreview}>Preview Invoice</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4 py-1">
              <div className="space-y-2 text-sm rounded-lg border border-border p-4">
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Invoice Number</span>
                  <span className="font-medium">Auto-generated on save</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium text-right">
                    {createForm.customerName}
                    <br />
                    <span className="text-xs text-muted-foreground">{createForm.customerEmail}</span>
                  </span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Billing Address</span>
                  <span className="font-medium text-right">
                    {[createForm.customerPincode, createForm.customerCity, createForm.customerState]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Mobile Number</span>
                  <span className="font-medium">{createForm.customerPhone || "—"}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Customer GSTIN</span>
                  <span className="font-medium">{createForm.customerGstin || "—"}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Website</span>
                  <span className="font-medium">
                    {CONNECTED_SITE_OPTIONS.find((o) => o.value === createForm.sourceWebsite)?.label ||
                      createForm.sourceWebsite}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Service</span>
                  <span className="font-medium text-right">{createForm.serviceTitle}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Price (incl. GST)</span>
                  <span className="font-medium">₹{previewTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Taxable Amount</span>
                  <span className="font-medium">₹{previewAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">{previewGstLabel}</span>
                  <span className="font-medium">₹{previewGstAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Total (Customer Pays)</span>
                  <span className="font-semibold">₹{previewTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{createForm.customerEmail}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                This is an estimated preview. The final CGST/SGST vs IGST split is calculated by the
                system based on the business's GST configuration and the customer's state at the time
                the invoice is generated.
              </p>

              <DialogFooter className="pt-2">
                <Button variant="outline" onClick={() => setCreateStep("form")} disabled={creating}>
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Back
                </Button>
                <Button onClick={confirmCreateInvoice} disabled={creating}>
                  {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Confirm &amp; Create
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={!!emailInvoice} onOpenChange={(open) => !open && !sendingEmail && closeEmailModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Invoice Email</DialogTitle>
            <DialogDescription>
              {emailInvoice ? `Send invoice ${emailInvoice.invoice_number} to the customer.` : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="email-to">Customer Email</Label>
              <Input
                id="email-to"
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email-message">Message</Label>
              <Textarea
                id="email-message"
                rows={5}
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="email-attach-pdf"
                checked={emailAttachPdf}
                onCheckedChange={(checked) => setEmailAttachPdf(checked === true)}
              />
              <Label htmlFor="email-attach-pdf" className="cursor-pointer font-normal">
                Attach PDF
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeEmailModal} disabled={sendingEmail}>
              Cancel
            </Button>
            <Button onClick={confirmSendEmail} disabled={sendingEmail}>
              {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Send Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Invoice Confirmation Dialog */}
      <AlertDialog open={!!deleteInvoiceId} onOpenChange={(open) => !open && setDeleteInvoiceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This invoice will move to Trash and be excluded from GST Reports. You can restore it
              anytime from the Trash tab — nothing is permanently removed.
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
