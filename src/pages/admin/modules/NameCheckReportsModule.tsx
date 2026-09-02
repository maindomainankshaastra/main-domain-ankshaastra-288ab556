

// import { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   FileSearch,
//   RefreshCw,
//   Plus,
//   Search,
//   Eye,
//   Pencil,
//   FileCog,
//   FileEdit,
//   Download,
//   Printer,
//   MoreVertical,
//   Trash2,
//   ChevronLeft,
//   ChevronRight,
//   Loader2,
//   FileX2,
//   BadgeCheck,
//   CalendarIcon,
//   X,
//   ArrowLeft,
// } from "lucide-react";
// import { format } from "date-fns";
// import { getMulank, getBhagyank } from "@/lib/name-check/lo-shu";
// import type { DateRange } from "react-day-picker";

// import { AdminPage } from "@/components/admin/AdminPage";
// import { supabase } from "@/integrations/supabase/client";
// import { useToast } from "@/hooks/use-toast";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Calendar } from "@/components/ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Textarea } from "@/components/ui/textarea";

// import {
//   generateNameCheckReportPdf,
//   nameCheckReportPdfToBlob,
//   computeNameCheckReportContent,
//   type NameCheckReportContent,
// } from "@/components/NameCheckReportGenerator";

// /* ------------------------------------------------------------------ */
// /*  Types                                                              */
// /* ------------------------------------------------------------------ */

// type ReportStatus = "draft" | "generating" | "completed" | "failed" | "archived";

// interface NameCheckReportRow {
//   id: string;
//   report_id: string;
//   customer_name: string;
//   first_name: string | null;
//   middle_name: string | null;
//   last_name: string | null;
//   is_middle_name_father_husband: boolean;
//   email: string;
//   phone: string;
//   dob: string;
//   gender: string;
//   status: ReportStatus;
//   pdf_url: string | null;
//   /** Admin's saved correction of the computed report content, if any (see NameCheckReportGenerator.tsx). NULL = PDF uses the live rule-engine calculation. */
//   content_overrides: NameCheckReportContent | null;
//   created_at: string;
//   updated_at: string;
// }

// interface ReportFormValues {
//   first_name: string;
//   middle_name: string;
//   last_name: string;
//   is_middle_name_father_husband: boolean;
//   email: string;
//   phone: string;
//   dob: string;
//   gender: string;
//   status: ReportStatus;
// }

// const EMPTY_FORM: ReportFormValues = {
//   first_name: "",
//   middle_name: "",
//   last_name: "",
//   is_middle_name_father_husband: false,
//   email: "",
//   phone: "",
//   dob: "",
//   gender: "",
//   status: "draft",
// };

// /** Combines First/Middle/Last into the single display/search name used elsewhere. */
// function buildCustomerName(values: { first_name: string; middle_name: string; last_name: string }): string {
//   return [values.first_name, values.middle_name, values.last_name].map((s) => s.trim()).filter(Boolean).join(" ");
// }

// const CREATE_DRAFT_KEY = "name-check-create-report-draft";

// /** Loads a saved in-progress "Generate Report" form draft from localStorage, if any. */
// function loadCreateDraft(): ReportFormValues {
//   try {
//     const raw = window.localStorage.getItem(CREATE_DRAFT_KEY);
//     if (!raw) return EMPTY_FORM;
//     const parsed = JSON.parse(raw);
//     // Merge over EMPTY_FORM so a draft saved before a schema change (missing a
//     // newly-added field) doesn't crash the form — missing keys just fall back.
//     return { ...EMPTY_FORM, ...parsed };
//   } catch {
//     return EMPTY_FORM;
//   }
// }

// /** Clears the saved draft — called after a successful create, or when the user explicitly discards it. */
// function clearCreateDraft() {
//   try {
//     window.localStorage.removeItem(CREATE_DRAFT_KEY);
//   } catch {
//     // Ignore — nothing to clean up if storage isn't available.
//   }
// }

// const CREATE_OPEN_KEY = "name-check-create-report-open";

// /** Whether the "Generate Report" dialog was left open last time — reopens it automatically on return. */
// function loadCreateOpenFlag(): boolean {
//   try {
//     return window.localStorage.getItem(CREATE_OPEN_KEY) === "1";
//   } catch {
//     return false;
//   }
// }

// /* ------------------------------------------------------------------ */
// /*  Preview/Edit dialog persistence                                    */
// /* ------------------------------------------------------------------ */

// // Without this, navigating to another admin screen and coming back
// // unmounts this whole component — React wipes viewTarget/viewMode/
// // contentEditForm back to their initial (closed) values, so the preview or
// // in-progress "Edit Report Content" form the admin left open just
// // disappears. Persisting the minimal state needed to reopen it here fixes
// // that, mirroring the CREATE_OPEN_KEY/CREATE_DRAFT_KEY pattern above.
// const VIEW_DIALOG_KEY = "name-check-view-dialog-state";

// interface SavedViewDialogState {
//   reportId: string;
//   viewMode: "details" | "edit";
//   contentEditForm: NameCheckReportContent | null;
// }

// function loadSavedViewDialogState(): SavedViewDialogState | null {
//   try {
//     const raw = window.localStorage.getItem(VIEW_DIALOG_KEY);
//     return raw ? (JSON.parse(raw) as SavedViewDialogState) : null;
//   } catch {
//     return null;
//   }
// }

// const PAGE_SIZE = 10;
// const TABLE_NAME = "name_check_reports";
// const STORAGE_BUCKET = "name-check-reports";
// const ACTIVITY_LOG_TABLE = "report_activity_log";

// const STATUS_META: Record<ReportStatus, { label: string; badgeClass: string }> = {
//   draft: { label: "Draft", badgeClass: "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-100" },
//   generating: { label: "Generating", badgeClass: "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100" },
//   completed: { label: "Completed", badgeClass: "bg-green-100 text-green-800 border-green-300 hover:bg-green-100" },
//   failed: { label: "Failed", badgeClass: "bg-red-100 text-red-800 border-red-300 hover:bg-red-100" },
//   archived: { label: "Archived", badgeClass: "bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-200" },
// };

// function generateReportId() {
//   const stamp = Date.now().toString(36).toUpperCase();
//   const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
//   return `NCR-${stamp}-${rand}`;
// }

// function formatDate(value: string | null | undefined) {
//   if (!value) return "—";
//   const d = new Date(value);
//   if (isNaN(d.getTime())) return value;
//   return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
// }

// /** Appends a cache-busting query param so the iframe never shows a stale cached
//  * copy of a PDF we just re-uploaded to the SAME storage path (upsert keeps the
//  * URL identical, so without this the browser's HTTP cache can serve the old file). */
// function withCacheBust(url: string | null): string | null {
//   if (!url) return null;
//   return `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`;
// }

// /* ------------------------------------------------------------------ */
// /*  Component                                                          */
// /* ------------------------------------------------------------------ */

// export default function NameCheckReports() {
//   const { toast } = useToast();

//   const [reports, setReports] = useState<NameCheckReportRow[]>([]);
//   const [totalCount, setTotalCount] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   // Filters
//   const [searchTerm, setSearchTerm] = useState("");
//   const [debouncedSearch, setDebouncedSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all");
//   const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
//   const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
//   const [page, setPage] = useState(1);

//   // Dialog state
//   const [editTarget, setEditTarget] = useState<NameCheckReportRow | null>(null);
//   const [editForm, setEditForm] = useState<ReportFormValues>(EMPTY_FORM);
//   const [createOpen, setCreateOpen] = useState(() => loadCreateOpenFlag());
//   const [createForm, setCreateForm] = useState<ReportFormValues>(() => loadCreateDraft());
//   const [deleteTarget, setDeleteTarget] = useState<NameCheckReportRow | null>(null);
//   const [regenerateTarget, setRegenerateTarget] = useState<NameCheckReportRow | null>(null);

//   // Unified "Report" dialog — a single dialog that shows either the PDF
//   // PREVIEW (viewMode "details") or the content-correction FORM (viewMode
//   // "edit"), for the report in `viewTarget`. Previously these were two
//   // separate dialogs; now "Edit Report Content" is reachable directly from
//   // inside the preview, and saving an edit flips straight back to showing
//   // the freshly-regenerated preview instead of closing everything.
//   const [viewTarget, setViewTarget] = useState<NameCheckReportRow | null>(null);
//   const [viewMode, setViewMode] = useState<"details" | "edit">("details");
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
//   const [contentEditForm, setContentEditForm] = useState<NameCheckReportContent | null>(null);
//   const [loadingContentEdit, setLoadingContentEdit] = useState(false);
//   const [savingContentEdit, setSavingContentEdit] = useState(false);

//   // Gates the save-effect below until the restore-effect has had its first
//   // chance to read localStorage — without this, the save-effect's own
//   // mount-time run (viewTarget still null) wipes the saved key a tick
//   // before the restore-effect gets to read it, so restoring silently never
//   // works.
//   const [hasHydratedViewDialog, setHasHydratedViewDialog] = useState(false);

//   // Persist whether the "Generate Report" dialog was left open, so navigating
//   // away and coming back re-opens it automatically instead of just keeping
//   // the form data in the background.
//   useEffect(() => {
//     try {
//       window.localStorage.setItem(CREATE_OPEN_KEY, createOpen ? "1" : "0");
//     } catch {
//       // Ignore — worst case the dialog just doesn't auto-reopen.
//     }
//   }, [createOpen]);

//   // Persist the "Generate Report" form as a draft so it survives navigating
//   // away and coming back (e.g. checking a customer's details in another tab
//   // mid-fill). Cleared automatically once the report is successfully created.
//   useEffect(() => {
//     try {
//       window.localStorage.setItem(CREATE_DRAFT_KEY, JSON.stringify(createForm));
//     } catch {
//       // Storage can fail (private browsing, quota) — losing the draft-save is fine, don't crash the form.
//     }
//   }, [createForm]);

//   // Persists the preview/edit dialog across navigation — without this,
//   // moving to another screen and coming back unmounts this component and
//   // wipes its local state (viewTarget resets to null, closing the dialog
//   // and losing any in-progress "Edit Report Content" text).
//   useEffect(() => {
//     if (!hasHydratedViewDialog) return; // don't touch storage until restore has run
//     try {
//       if (viewTarget) {
//         window.localStorage.setItem(
//           VIEW_DIALOG_KEY,
//           JSON.stringify({ reportId: viewTarget.id, viewMode, contentEditForm })
//         );
//       } else {
//         window.localStorage.removeItem(VIEW_DIALOG_KEY);
//       }
//     } catch {
//       // Ignore — worst case the dialog just doesn't auto-restore.
//     }
//   }, [viewTarget, viewMode, contentEditForm, hasHydratedViewDialog]);

//   // Restores the preview/edit dialog on mount, if one was left open before
//   // navigating away. Fetches the row fresh (not from the paginated `reports`
//   // list) since that list may not include this report on the current page.
//   useEffect(() => {
//     const saved = loadSavedViewDialogState();
//     if (!saved?.reportId) {
//       setHasHydratedViewDialog(true); // nothing to restore — unblock the save-effect
//       return;
//     }

//     (async () => {
//       const { data, error } = await supabase
//         .from(TABLE_NAME)
//         .select("*")
//         .eq("id", saved.reportId)
//         .single();
//       if (error || !data) {
//         window.localStorage.removeItem(VIEW_DIALOG_KEY);
//         setHasHydratedViewDialog(true);
//         return;
//       }
//       const row = data as NameCheckReportRow;
//       setViewTarget(row);
//       setViewMode(saved.viewMode);
//       setPreviewUrl(withCacheBust(row.pdf_url));
//       if (saved.viewMode === "edit") {
//         setContentEditForm(
//           saved.contentEditForm ??
//             row.content_overrides ??
//             computeNameCheckReportContent({
//               customerName: row.customer_name,
//               dob: row.dob,
//               firstName: row.first_name ?? undefined,
//               middleName: row.middle_name ?? undefined,
//               lastName: row.last_name ?? undefined,
//               isMiddleNameFatherHusband: row.is_middle_name_father_husband,
//             })
//         );
//       }
//       setHasHydratedViewDialog(true); // unblock the save-effect only after restore is fully applied
//     })();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const [savingEdit, setSavingEdit] = useState(false);
//   const [creating, setCreating] = useState(false);
//   const [deleting, setDeleting] = useState(false);
//   const [generatingId, setGeneratingId] = useState<string | null>(null);

//   // Bulk selection state
//   const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
//   const [bulkDeleting, setBulkDeleting] = useState(false);
//   const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

//   // Debounce search input
//   useEffect(() => {
//     const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
//     return () => clearTimeout(t);
//   }, [searchTerm]);

//   useEffect(() => {
//     setPage(1);
//   }, [debouncedSearch, statusFilter, sortOrder, dateRange]);

//   // Clear selection whenever the underlying list changes (page/filter/data reload)
//   useEffect(() => {
//     setSelectedIds(new Set());
//   }, [page, debouncedSearch, statusFilter, sortOrder, dateRange]);

//   /* ------------------------- Activity logging ------------------------ */

//   const logActivity = useCallback(async (reportId: string, action: string, metadata?: Record<string, unknown>) => {
//     try {
//       await supabase.from(ACTIVITY_LOG_TABLE).insert({
//         report_id: reportId,
//         action,
//         metadata: metadata ?? {},
//       });
//     } catch (e) {
//       // Never block the primary action if logging fails.
//       console.error("activity log failed", e);
//     }
//   }, []);

//   const fetchReports = useCallback(
//     async (opts?: { silent?: boolean }) => {
//       opts?.silent ? setRefreshing(true) : setLoading(true);
//       try {
//         const from = (page - 1) * PAGE_SIZE;
//         const to = from + PAGE_SIZE - 1;

//         let query = supabase.from(TABLE_NAME).select("*", { count: "exact" });

//         if (debouncedSearch) {
//           const term = debouncedSearch.replace(/%/g, "");
//           query = query.or(
//             `customer_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%,report_id.ilike.%${term}%`
//           );
//         }
//         if (statusFilter !== "all") {
//           query = query.eq("status", statusFilter);
//         }
//         if (dateRange?.from) {
//           query = query.gte("created_at", dateRange.from.toISOString());
//         }
//         if (dateRange?.to) {
//           const endOfDay = new Date(dateRange.to);
//           endOfDay.setHours(23, 59, 59, 999);
//           query = query.lte("created_at", endOfDay.toISOString());
//         }
//         query = query.order("created_at", { ascending: sortOrder === "oldest" }).range(from, to);

//         const { data, error, count } = await query;
//         if (error) throw error;

//         setReports((data as NameCheckReportRow[]) ?? []);
//         setTotalCount(count ?? 0);
//       } catch (err) {
//         console.error(err);
//         toast({
//           title: "Failed to load reports",
//           description: err instanceof Error ? err.message : "Unexpected error while fetching reports.",
//           variant: "destructive",
//         });
//       } finally {
//         setLoading(false);
//         setRefreshing(false);
//       }
//     },
//     [page, debouncedSearch, statusFilter, sortOrder, dateRange, toast]
//   );

//   useEffect(() => {
//     fetchReports();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [page, debouncedSearch, statusFilter, sortOrder, dateRange]);

//   const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

//   /* ---------------------------- Actions ---------------------------- */

//   const handleCreateReport = async () => {
//     if (!createForm.first_name || !createForm.email || !createForm.dob) {
//       toast({ title: "Missing details", description: "First name, email and date of birth are required.", variant: "destructive" });
//       return;
//     }
//     setCreating(true);
//     try {
//       const newReportId = generateReportId();
//       const { data, error } = await supabase
//         .from(TABLE_NAME)
//         .insert({
//           report_id: newReportId,
//           customer_name: buildCustomerName(createForm),
//           first_name: createForm.first_name,
//           middle_name: createForm.middle_name || null,
//           last_name: createForm.last_name || null,
//           is_middle_name_father_husband: createForm.is_middle_name_father_husband,
//           email: createForm.email,
//           phone: createForm.phone,
//           dob: createForm.dob,
//           gender: createForm.gender,
//           status: createForm.status,
//           pdf_url: null,
//         })
//         .select("id")
//         .single();
//       if (error) throw error;

//       if (data?.id) {
//         logActivity(data.id, "create", { report_id: newReportId });
//       }

//       toast({ title: "Report created", description: "A new Name Check Report submission has been added." });
//       setCreateOpen(false);
//       setCreateForm(EMPTY_FORM);
//       clearCreateDraft();
//       setPage(1);
//       fetchReports();
//     } catch (err) {
//       toast({
//         title: "Could not create report",
//         description: err instanceof Error ? err.message : "Unexpected error.",
//         variant: "destructive",
//       });
//     } finally {
//       setCreating(false);
//     }
//   };

//   const openEditDialog = (report: NameCheckReportRow) => {
//     setEditTarget(report);
//     setEditForm({
//       first_name: report.first_name ?? report.customer_name.split(/\s+/)[0] ?? "",
//       middle_name: report.middle_name ?? "",
//       last_name: report.last_name ?? "",
//       is_middle_name_father_husband: report.is_middle_name_father_husband ?? false,
//       email: report.email,
//       phone: report.phone ?? "",
//       dob: report.dob,
//       gender: report.gender ?? "",
//       status: report.status,
//     });
//   };

//   const handleSaveEdit = async () => {
//     if (!editTarget) return;
//     setSavingEdit(true);
//     try {
//       const { error } = await supabase
//         .from(TABLE_NAME)
//         .update({
//           customer_name: buildCustomerName(editForm),
//           first_name: editForm.first_name,
//           middle_name: editForm.middle_name || null,
//           last_name: editForm.last_name || null,
//           is_middle_name_father_husband: editForm.is_middle_name_father_husband,
//           email: editForm.email,
//           phone: editForm.phone,
//           dob: editForm.dob,
//           gender: editForm.gender,
//           status: editForm.status,
//           updated_at: new Date().toISOString(),
//         })
//         .eq("id", editTarget.id);
//       if (error) throw error;

//       logActivity(editTarget.id, "edit");

//       toast({ title: "Report updated", description: `${buildCustomerName(editForm)}'s record has been saved.` });
//       setEditTarget(null);
//       fetchReports({ silent: true });
//     } catch (err) {
//       toast({
//         title: "Could not save changes",
//         description: err instanceof Error ? err.message : "Unexpected error.",
//         variant: "destructive",
//       });
//     } finally {
//       setSavingEdit(false);
//     }
//   };

//   const handleChangeStatus = async (report: NameCheckReportRow, status: ReportStatus) => {
//     try {
//       const { error } = await supabase
//         .from(TABLE_NAME)
//         .update({ status, updated_at: new Date().toISOString() })
//         .eq("id", report.id);
//       if (error) throw error;

//       logActivity(report.id, "status_change", { from: report.status, to: status });

//       toast({ title: "Status updated", description: `${report.customer_name} is now marked as ${STATUS_META[status].label}.` });
//       fetchReports({ silent: true });
//     } catch (err) {
//       toast({
//         title: "Could not update status",
//         description: err instanceof Error ? err.message : "Unexpected error.",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleDelete = async () => {
//     if (!deleteTarget) return;
//     setDeleting(true);
//     try {
//       const { error } = await supabase.from(TABLE_NAME).delete().eq("id", deleteTarget.id);
//       if (error) throw error;

//       logActivity(deleteTarget.id, "delete", { report_id: deleteTarget.report_id });

//       toast({ title: "Report deleted", description: `Report ${deleteTarget.report_id} has been removed.` });
//       setDeleteTarget(null);
//       fetchReports({ silent: true });
//     } catch (err) {
//       toast({
//         title: "Could not delete report",
//         description: err instanceof Error ? err.message : "Unexpected error.",
//         variant: "destructive",
//       });
//     } finally {
//       setDeleting(false);
//     }
//   };

//   /** Opens the unified Report dialog in PREVIEW mode for the given report. */
//   const openPreview = (report: NameCheckReportRow) => {
//     setViewTarget(report);
//     setViewMode("details");
//     setContentEditForm(null);
//     setPreviewUrl(withCacheBust(report.pdf_url));
//   };

//   const runGeneratePdf = async (report: NameCheckReportRow) => {
//     setGeneratingId(report.id);
//     try {
//       const bytes = await generateNameCheckReportPdf({
//         reportId: report.report_id,
//         customerName: report.customer_name,
//         firstName: report.first_name ?? undefined,
//         middleName: report.middle_name ?? undefined,
//         lastName: report.last_name ?? undefined,
//         isMiddleNameFatherHusband: report.is_middle_name_father_husband,
//         email: report.email,
//         phone: report.phone,
//         dob: report.dob,
//         gender: report.gender,
//         generatedDate: new Date().toISOString(),
//         // Respect any admin correction saved via "Edit Report Content" —
//         // otherwise a plain Regenerate would silently wipe it out.
//         contentOverride: report.content_overrides ?? undefined,
//       });

//       const blob = nameCheckReportPdfToBlob(bytes);
//       const filePath = `${report.report_id}.pdf`;

//       const { error: uploadError } = await supabase.storage
//         .from(STORAGE_BUCKET)
//         .upload(filePath, blob, { contentType: "application/pdf", upsert: true });
//       if (uploadError) throw uploadError;

//       const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
//       const pdfUrl = publicUrlData?.publicUrl ?? null;

//       const { error: updateError } = await supabase
//         .from(TABLE_NAME)
//         .update({ pdf_url: pdfUrl, status: "completed", updated_at: new Date().toISOString() })
//         .eq("id", report.id);
//       if (updateError) throw updateError;

//       logActivity(report.id, "regenerate", { report_id: report.report_id });

//       toast({ title: "PDF generated", description: `Report ${report.report_id} is ready to review.` });

//       // Open the preview automatically right after generating, with "Edit
//       // Report Content" reachable from inside it — this is the flow the
//       // admin actually wants instead of just a toast + having to hunt for
//       // the file afterwards.
//       const updatedRow: NameCheckReportRow = { ...report, pdf_url: pdfUrl, status: "completed" };
//       openPreview(updatedRow);

//       fetchReports({ silent: true });
//     } catch (err) {
//       toast({
//         title: "PDF generation failed",
//         description: err instanceof Error ? err.message : "Unexpected error while generating the PDF.",
//         variant: "destructive",
//       });
//     } finally {
//       setGeneratingId(null);
//       setRegenerateTarget(null);
//     }
//   };

//   const handleGeneratePdfClick = (report: NameCheckReportRow) => {
//     if (report.pdf_url) {
//       // Regenerating an existing PDF needs confirmation.
//       setRegenerateTarget(report);
//     } else {
//       runGeneratePdf(report);
//     }
//   };

//   /**
//    * Switches the unified Report dialog into EDIT mode for the given report.
//    * If the admin has already saved a correction for this report, that's
//    * loaded as-is; otherwise the form is prefilled with what the rule engine
//    * currently computes, so the admin is always editing real (not blank)
//    * values.
//    */
//   const enterContentEditMode = async (report: NameCheckReportRow) => {
//     setViewTarget(report);
//     setViewMode("edit");
//     setContentEditForm(null);
//     setLoadingContentEdit(true);
//     try {
//       if (report.content_overrides) {
//         setContentEditForm(report.content_overrides);
//       } else {
//         const computed = computeNameCheckReportContent({
//           customerName: report.customer_name,
//           dob: report.dob,
//           firstName: report.first_name ?? undefined,
//           middleName: report.middle_name ?? undefined,
//           lastName: report.last_name ?? undefined,
//           isMiddleNameFatherHusband: report.is_middle_name_father_husband,
//         });
//         setContentEditForm(computed);
//       }
//     } catch (err) {
//       toast({
//         title: "Could not load report content",
//         description: err instanceof Error ? err.message : "Unexpected error.",
//         variant: "destructive",
//       });
//       setViewMode("details");
//     } finally {
//       setLoadingContentEdit(false);
//     }
//   };

//   /** Discards any in-progress edits and returns to the preview pane, without closing the dialog. */
//   const backToPreview = () => {
//     setViewMode("details");
//     setContentEditForm(null);
//   };

//   /** Saves the admin's correction, regenerates the PDF, and flips the SAME dialog back to showing the fresh preview. */
//   const handleSaveContentEdit = async () => {
//     if (!viewTarget || !contentEditForm) return;
//     setSavingContentEdit(true);
//     try {
//       const bytes = await generateNameCheckReportPdf({
//         reportId: viewTarget.report_id,
//         customerName: viewTarget.customer_name,
//         firstName: viewTarget.first_name ?? undefined,
//         middleName: viewTarget.middle_name ?? undefined,
//         lastName: viewTarget.last_name ?? undefined,
//         isMiddleNameFatherHusband: viewTarget.is_middle_name_father_husband,
//         email: viewTarget.email,
//         phone: viewTarget.phone,
//         dob: viewTarget.dob,
//         gender: viewTarget.gender,
//         generatedDate: new Date().toISOString(),
//         contentOverride: contentEditForm,
//       });

//       const blob = nameCheckReportPdfToBlob(bytes);
//       const filePath = `${viewTarget.report_id}.pdf`;

//       const { error: uploadError } = await supabase.storage
//         .from(STORAGE_BUCKET)
//         .upload(filePath, blob, { contentType: "application/pdf", upsert: true });
//       if (uploadError) throw uploadError;

//       const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
//       const pdfUrl = publicUrlData?.publicUrl ?? null;

//       const { error: updateError } = await supabase
//         .from(TABLE_NAME)
//         .update({
//           content_overrides: contentEditForm,
//           pdf_url: pdfUrl,
//           status: "completed",
//           updated_at: new Date().toISOString(),
//         })
//         .eq("id", viewTarget.id);
//       if (updateError) throw updateError;

//       logActivity(viewTarget.id, "edit_content", { report_id: viewTarget.report_id });

//       toast({ title: "Report content updated", description: `A corrected PDF for ${viewTarget.report_id} has been generated.` });

//       // Flip back to the preview pane of the SAME dialog, now showing the
//       // just-regenerated PDF — this is the "edit inside the preview" flow.
//       const updatedRow: NameCheckReportRow = {
//         ...viewTarget,
//         pdf_url: pdfUrl,
//         status: "completed",
//         content_overrides: contentEditForm,
//       };
//       setViewTarget(updatedRow);
//       setPreviewUrl(withCacheBust(pdfUrl));
//       setViewMode("details");
//       setContentEditForm(null);

//       fetchReports({ silent: true });
//     } catch (err) {
//       toast({
//         title: "Could not save report content",
//         description: err instanceof Error ? err.message : "Unexpected error while regenerating the PDF.",
//         variant: "destructive",
//       });
//     } finally {
//       setSavingContentEdit(false);
//     }
//   };

//   /** Helper for editing one of the 3-paragraph analysis blocks in the content-edit form. */
//   const updateContentParagraph = (
//     field: "firstNameAnalysis" | "fullNameAnalysis" | "compoundAnalysis" | "verdictBullets",
//     index: number,
//     value: string
//   ) => {
//     setContentEditForm((prev) => {
//       if (!prev) return prev;
//       const next = [...prev[field]];
//       next[index] = value;
//       return { ...prev, [field]: next };
//     });
//   };

//   /** Builds the customer-facing download filename: FirstName_Name Check_M<mulank>B<bhagyank>.pdf */
//   function buildDownloadFilename(report: NameCheckReportRow): string {
//     const firstNameRaw = (report.first_name || report.customer_name.trim().split(/\s+/)[0] || "Report");
//     const firstName = firstNameRaw.replace(/[^a-zA-Z0-9]/g, ""); // strip anything unsafe for a filename

//     const dobDate = new Date(report.dob);
//     if (isNaN(dobDate.getTime())) {
//       return `${firstName}_Name Check_${report.report_id}.pdf`;
//     }
//     const mulank = getMulank(dobDate.getDate());
//     const bhagyank = getBhagyank(dobDate.getDate(), dobDate.getMonth() + 1, dobDate.getFullYear());

//     return `${firstName}_Name Check_M${mulank}B${bhagyank}.pdf`;
//   }

//   const handleDownloadPdf = async (report: NameCheckReportRow) => {
//     if (!report.pdf_url) {
//       toast({ title: "No PDF available", description: "Generate the PDF for this report first.", variant: "destructive" });
//       return;
//     }
//     try {
//       // Fetch the PDF bytes ourselves first — the download="filename" attribute
//       // is silently ignored by browsers for cross-origin links (our PDF lives on
//       // Supabase Storage, a different origin from this admin panel), so a direct
//       // <a href={report.pdf_url} download> just opens the file instead of naming it.
//       // Fetching it into a same-origin blob: URL makes the custom filename work.
//       const res = await fetch(report.pdf_url);
//       if (!res.ok) throw new Error(`Failed to fetch PDF (${res.status})`);
//       const blob = await res.blob();
//       const blobUrl = URL.createObjectURL(blob);

//       const link = document.createElement("a");
//       link.href = blobUrl;
//       link.download = buildDownloadFilename(report);
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       URL.revokeObjectURL(blobUrl);

//       logActivity(report.id, "download");
//     } catch (err) {
//       toast({ title: "Download failed", description: err instanceof Error ? err.message : "Could not download the PDF.", variant: "destructive" });
//     }
//   };

//   const handlePrint = (report: NameCheckReportRow) => {
//     if (!report.pdf_url) {
//       toast({ title: "No PDF available", description: "Generate the PDF for this report first.", variant: "destructive" });
//       return;
//     }
//     const win = window.open(report.pdf_url, "_blank");
//     if (win) {
//       win.addEventListener("load", () => win.print());
//     }

//     logActivity(report.id, "print");
//   };

//   const searchPlaceholder = "Search by name, email, phone or report ID...";

//   const emptyState = useMemo(() => !loading && reports.length === 0, [loading, reports]);

//   /* ---------------------------- Bulk actions ---------------------------- */

//   const toggleSelect = (id: string) => {
//     setSelectedIds((prev) => {
//       const next = new Set(prev);
//       if (next.has(id)) next.delete(id);
//       else next.add(id);
//       return next;
//     });
//   };

//   const allSelected = reports.length > 0 && selectedIds.size === reports.length;

//   const toggleSelectAll = () => {
//     if (allSelected) setSelectedIds(new Set());
//     else setSelectedIds(new Set(reports.map((r) => r.id)));
//   };

//   const clearSelection = () => setSelectedIds(new Set());

//   const handleBulkDelete = async () => {
//     setBulkDeleting(true);
//     try {
//       const ids = Array.from(selectedIds);
//       const { error } = await supabase.from(TABLE_NAME).delete().in("id", ids);
//       if (error) throw error;

//       ids.forEach((id) => logActivity(id, "bulk_delete"));

//       toast({ title: "Deleted", description: `${ids.length} report(s) removed.` });
//       clearSelection();
//       setConfirmBulkDelete(false);
//       fetchReports({ silent: true });
//     } catch (err) {
//       toast({
//         title: "Bulk delete failed",
//         description: err instanceof Error ? err.message : "Unexpected error.",
//         variant: "destructive",
//       });
//     } finally {
//       setBulkDeleting(false);
//     }
//   };

//   const handleBulkStatusChange = async (status: ReportStatus) => {
//     try {
//       const ids = Array.from(selectedIds);
//       const { error } = await supabase
//         .from(TABLE_NAME)
//         .update({ status, updated_at: new Date().toISOString() })
//         .in("id", ids);
//       if (error) throw error;

//       ids.forEach((id) => logActivity(id, "bulk_status_change", { to: status }));

//       toast({ title: "Status updated", description: `${ids.length} report(s) marked ${STATUS_META[status].label}.` });
//       clearSelection();
//       fetchReports({ silent: true });
//     } catch (err) {
//       toast({
//         title: "Bulk update failed",
//         description: err instanceof Error ? err.message : "Unexpected error.",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleBulkDownload = () => {
//     const targets = reports.filter((r) => selectedIds.has(r.id) && r.pdf_url);
//     if (targets.length === 0) {
//       toast({ title: "No PDFs available", description: "Selected reports have no generated PDF.", variant: "destructive" });
//       return;
//     }
//     targets.forEach((r, i) => {
//       // Stagger downloads slightly so browsers don't block multiple popups/downloads at once.
//       setTimeout(() => handleDownloadPdf(r), i * 400);
//     });
//   };

//   const handleBulkExportCsv = () => {
//     const targets = reports.filter((r) => selectedIds.has(r.id));
//     if (targets.length === 0) return;

//     const header = ["Report ID", "Customer Name", "Email", "Phone", "DOB", "Gender", "Status", "Created At"];
//     const rows = targets.map((r) => [
//       r.report_id,
//       r.customer_name,
//       r.email,
//       r.phone,
//       r.dob,
//       r.gender,
//       STATUS_META[r.status].label,
//       r.created_at,
//     ]);
//     const csv = [header, ...rows]
//       .map((row) => row.map((v) => `"${(v ?? "").toString().replace(/"/g, '""')}"`).join(","))
//       .join("\n");
//     const blob = new Blob([csv], { type: "text/csv" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = `name-check-reports-${Date.now()}.csv`;
//     link.click();
//     URL.revokeObjectURL(url);

//     targets.forEach((r) => logActivity(r.id, "bulk_export_csv"));
//   };

//   /* ------------------------------ UI -------------------------------- */

//   return (
//     <AdminPage>
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <h1 className="text-2xl font-semibold tracking-tight">Name Check Reports</h1>
//             <p className="text-sm text-muted-foreground">Manage all Name Check Report submissions.</p>
//           </div>
//           <div className="flex items-center gap-2">
//             <Button variant="outline" onClick={() => fetchReports({ silent: true })} disabled={refreshing}>
//               <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
//               Refresh
//             </Button>
//             <Button onClick={() => setCreateOpen(true)}>
//               <Plus className="mr-2 h-4 w-4" />
//               Generate Report
//             </Button>
//           </div>
//         </div>

//         {/* Filters */}
//         <Card>
//           <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//               <Input
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 placeholder={searchPlaceholder}
//                 className="pl-9"
//               />
//             </div>
//             <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ReportStatus | "all")}>
//               <SelectTrigger className="w-full md:w-[180px]">
//                 <SelectValue placeholder="Status" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Statuses</SelectItem>
//                 {(Object.keys(STATUS_META) as ReportStatus[]).map((status) => (
//                   <SelectItem key={status} value={status}>
//                     {STATUS_META[status].label}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as "newest" | "oldest")}>
//               <SelectTrigger className="w-full md:w-[180px]">
//                 <SelectValue placeholder="Sort" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="newest">Newest First</SelectItem>
//                 <SelectItem value="oldest">Oldest First</SelectItem>
//               </SelectContent>
//             </Select>
//             <Popover>
//               <PopoverTrigger asChild>
//                 <Button variant="outline" className="w-full md:w-[220px] justify-start text-left font-normal">
//                   <CalendarIcon className="mr-2 h-4 w-4" />
//                   {dateRange?.from
//                     ? dateRange.to
//                       ? `${format(dateRange.from, "dd MMM")} - ${format(dateRange.to, "dd MMM")}`
//                       : format(dateRange.from, "dd MMM yyyy")
//                     : "Date Range"}
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent className="w-auto p-0" align="start">
//                 <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
//                 {dateRange && (
//                   <div className="border-t p-2">
//                     <Button variant="ghost" size="sm" className="w-full" onClick={() => setDateRange(undefined)}>
//                       Clear
//                     </Button>
//                   </div>
//                 )}
//               </PopoverContent>
//             </Popover>
//           </CardContent>
//         </Card>

//         {/* Bulk action toolbar */}
//         {selectedIds.size > 0 && (
//           <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/50 p-3">
//             <span className="text-sm font-medium">{selectedIds.size} selected</span>
//             <Button variant="outline" size="sm" onClick={handleBulkDownload}>
//               <Download className="mr-1.5 h-4 w-4" />
//               Download
//             </Button>
//             <Button variant="outline" size="sm" onClick={handleBulkExportCsv}>
//               Export CSV
//             </Button>
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="outline" size="sm">
//                   Change Status
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent>
//                 {(Object.keys(STATUS_META) as ReportStatus[]).map((s) => (
//                   <DropdownMenuItem key={s} onClick={() => handleBulkStatusChange(s)}>
//                     {STATUS_META[s].label}
//                   </DropdownMenuItem>
//                 ))}
//               </DropdownMenuContent>
//             </DropdownMenu>
//             <Button variant="destructive" size="sm" onClick={() => setConfirmBulkDelete(true)}>
//               <Trash2 className="mr-1.5 h-4 w-4" />
//               Delete
//             </Button>
//             <Button variant="ghost" size="sm" className="ml-auto" onClick={clearSelection}>
//               <X className="mr-1 h-4 w-4" />
//               Clear
//             </Button>
//           </div>
//         )}

//         {/* Select all (only meaningful once there's a list to select from) */}
//         {!loading && !emptyState && (
//           <div className="flex items-center gap-2 px-1">
//             <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} id="select-all" />
//             <Label htmlFor="select-all" className="cursor-pointer text-sm text-muted-foreground">
//               Select all on this page
//             </Label>
//           </div>
//         )}

//         {/* Listing */}
//         {loading ? (
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
//             {Array.from({ length: 6 }).map((_, i) => (
//               <Card key={i}>
//                 <CardContent className="space-y-3 p-5">
//                   <Skeleton className="h-5 w-2/3" />
//                   <Skeleton className="h-4 w-1/2" />
//                   <Skeleton className="h-4 w-full" />
//                   <Skeleton className="h-4 w-full" />
//                   <Skeleton className="h-4 w-3/4" />
//                   <div className="flex gap-2 pt-2">
//                     <Skeleton className="h-8 w-8 rounded-md" />
//                     <Skeleton className="h-8 w-8 rounded-md" />
//                     <Skeleton className="h-8 w-8 rounded-md" />
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         ) : emptyState ? (
//           <Card>
//             <CardContent className="flex flex-col items-center justify-center gap-3 p-16 text-center">
//               <FileX2 className="h-14 w-14 text-muted-foreground" />
//               <h3 className="text-lg font-medium">No Name Check Reports Found</h3>
//               <p className="max-w-sm text-sm text-muted-foreground">
//                 Try adjusting your search or filters, or generate a new report to get started.
//               </p>
//               <Button onClick={() => setCreateOpen(true)} className="mt-2">
//                 <Plus className="mr-2 h-4 w-4" />
//                 Generate Report
//               </Button>
//             </CardContent>
//           </Card>
//         ) : (
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
//             {reports.map((report) => (
//               <Card key={report.id} className="flex flex-col justify-between">
//                 <CardContent className="flex flex-1 flex-col gap-3 p-5">
//                   <div className="flex items-start justify-between gap-2">
//                     <div className="flex items-start gap-2">
//                       <Checkbox
//                         checked={selectedIds.has(report.id)}
//                         onCheckedChange={() => toggleSelect(report.id)}
//                         className="mt-1"
//                       />
//                       <div>
//                         <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
//                           {report.report_id}
//                         </p>
//                         <h3 className="text-base font-semibold leading-tight">{report.customer_name}</h3>
//                       </div>
//                     </div>
//                     <Badge variant="outline" className={STATUS_META[report.status].badgeClass}>
//                       {STATUS_META[report.status].label}
//                     </Badge>
//                   </div>

//                   <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
//                     <div className="col-span-2 truncate text-muted-foreground">{report.email}</div>
//                     <div className="text-muted-foreground">{report.phone || "—"}</div>
//                     <div className="text-muted-foreground">{report.gender || "—"}</div>
//                     <div className="text-muted-foreground">DOB: {formatDate(report.dob)}</div>
//                     <div className="text-muted-foreground">Created: {formatDate(report.created_at)}</div>
//                   </div>

//                   <div className="flex items-center gap-1.5 text-xs">
//                     {report.pdf_url ? (
//                       <span className="inline-flex items-center gap-1 text-green-700">
//                         <BadgeCheck className="h-3.5 w-3.5" /> Report Generated
//                       </span>
//                     ) : (
//                       <span className="inline-flex items-center gap-1 text-muted-foreground">
//                         <FileX2 className="h-3.5 w-3.5" /> Not Generated
//                       </span>
//                     )}
//                   </div>
//                 </CardContent>

//                 <div className="flex flex-wrap items-center gap-1.5 border-t p-3">
//                   <Button variant="ghost" size="icon" title="Preview" onClick={() => openPreview(report)}>
//                     <Eye className="h-4 w-4" />
//                   </Button>
//                   <Button variant="ghost" size="icon" title="Edit customer details" onClick={() => openEditDialog(report)}>
//                     <Pencil className="h-4 w-4" />
//                   </Button>
                  
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     title={report.pdf_url ? "Regenerate PDF" : "Generate PDF"}
//                     onClick={() => handleGeneratePdfClick(report)}
//                     disabled={generatingId === report.id}
//                   >
//                     {generatingId === report.id ? (
//                       <Loader2 className="h-4 w-4 animate-spin" />
//                     ) : (
//                       <FileCog className="h-4 w-4" />
//                     )}
//                   </Button>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     title="Download PDF"
//                     onClick={() => handleDownloadPdf(report)}
//                     disabled={!report.pdf_url}
//                   >
//                     <Download className="h-4 w-4" />
//                   </Button>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     title="Print"
//                     onClick={() => handlePrint(report)}
//                     disabled={!report.pdf_url}
//                   >
//                     <Printer className="h-4 w-4" />
//                   </Button>

//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button variant="ghost" size="icon" title="More" className="ml-auto">
//                         <MoreVertical className="h-4 w-4" />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end">
//                       <DropdownMenuLabel>Change Status</DropdownMenuLabel>
//                       {(Object.keys(STATUS_META) as ReportStatus[]).map((status) => (
//                         <DropdownMenuItem
//                           key={status}
//                           disabled={status === report.status}
//                           onClick={() => handleChangeStatus(report, status)}
//                         >
//                           {STATUS_META[status].label}
//                         </DropdownMenuItem>
//                       ))}
//                       <DropdownMenuSeparator />
//                       <DropdownMenuItem
//                         className="text-red-600 focus:text-red-600"
//                         onClick={() => setDeleteTarget(report)}
//                       >
//                         <Trash2 className="mr-2 h-4 w-4" />
//                         Delete
//                       </DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </div>
//               </Card>
//             ))}
//           </div>
//         )}

//         {/* Pagination */}
//         {!loading && !emptyState && (
//           <div className="flex items-center justify-between pt-2">
//             <p className="text-sm text-muted-foreground">
//               Page {page} of {totalPages} &middot; {totalCount} report{totalCount === 1 ? "" : "s"}
//             </p>
//             <div className="flex gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => setPage((p) => Math.max(1, p - 1))}
//                 disabled={page <= 1}
//               >
//                 <ChevronLeft className="mr-1 h-4 w-4" />
//                 Previous
//               </Button>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                 disabled={page >= totalPages}
//               >
//                 Next
//                 <ChevronRight className="ml-1 h-4 w-4" />
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Unified Report Dialog — PREVIEW (viewMode="details") or the content
//           EDIT form (viewMode="edit"), for `viewTarget`. "Edit Report Content"
//           from inside the preview switches this same dialog into edit mode;
//           saving switches it straight back to a refreshed preview. */}
//       <Dialog
//         open={!!viewTarget}
//         onOpenChange={(open) => {
//           if (!open) {
//             setViewTarget(null);
//             setViewMode("details");
//             setContentEditForm(null);
//             setPreviewUrl(null);
//           }
//         }}
//       >
//         <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2">
//               {viewMode === "edit" ? (
//                 <>
//                   <FileEdit className="h-5 w-5" /> Edit Report Content
//                 </>
//               ) : (
//                 <>
//                   <FileSearch className="h-5 w-5" /> Report Preview
//                 </>
//               )}
//             </DialogTitle>
//             <DialogDescription>
//               {viewTarget?.report_id}
//               {viewMode === "edit" && " — corrects what actually appears in the PDF. Saving regenerates it immediately."}
//             </DialogDescription>
//           </DialogHeader>

//           {viewMode === "details" && viewTarget && (
//             <div className="space-y-4">
//               <div className="grid grid-cols-2 gap-4 text-sm">
//                 <div>
//                   <p className="text-muted-foreground">Customer Name</p>
//                   <p className="font-medium">{viewTarget.customer_name}</p>
//                 </div>
//                 <div>
//                   <p className="text-muted-foreground">Status</p>
//                   <Badge variant="outline" className={STATUS_META[viewTarget.status].badgeClass}>
//                     {STATUS_META[viewTarget.status].label}
//                   </Badge>
//                 </div>
//                 <div>
//                   <p className="text-muted-foreground">Email</p>
//                   <p className="font-medium">{viewTarget.email}</p>
//                 </div>
//                 <div>
//                   <p className="text-muted-foreground">Phone</p>
//                   <p className="font-medium">{viewTarget.phone || "—"}</p>
//                 </div>
//                 <div>
//                   <p className="text-muted-foreground">Date of Birth</p>
//                   <p className="font-medium">{formatDate(viewTarget.dob)}</p>
//                 </div>
//                 <div>
//                   <p className="text-muted-foreground">Gender</p>
//                   <p className="font-medium">{viewTarget.gender || "—"}</p>
//                 </div>
//               </div>

//               {previewUrl ? (
//                 <div className="overflow-hidden rounded-md border" style={{ height: 480 }}>
//                   <iframe src={previewUrl} title="PDF Preview" className="h-full w-full" />
//                 </div>
//               ) : (
//                 <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
//                   <FileX2 className="h-8 w-8" />
//                   No PDF generated yet for this report.
//                 </div>
//               )}

//               <div className="flex flex-wrap items-center gap-2 pt-1">
//                 <Button variant="outline" onClick={() => enterContentEditMode(viewTarget)}>
//                   <FileEdit className="mr-2 h-4 w-4" />
//                   Edit Report Content
//                 </Button>
//                 {viewTarget.pdf_url && (
//                   <>
//                     <Button variant="outline" onClick={() => handleDownloadPdf(viewTarget)}>
//                       <Download className="mr-2 h-4 w-4" />
//                       Download
//                     </Button>
//                     <Button variant="outline" onClick={() => handlePrint(viewTarget)}>
//                       <Printer className="mr-2 h-4 w-4" />
//                       Print
//                     </Button>
//                   </>
//                 )}
//               </div>
//             </div>
//           )}

//           {viewMode === "edit" && (
//             <>
//               {loadingContentEdit || !contentEditForm ? (
//                 <div className="flex items-center justify-center py-10">
//                   <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
//                 </div>
//               ) : (
//                 <div className="space-y-6">
//                   {/* Numbers */}
//                   <div>
//                     <Label className="text-sm font-semibold">Core Numbers</Label>
//                     <div className="grid grid-cols-3 gap-3 mt-2">
//                       {(
//                         [
//                           ["mulank", "Mulank"],
//                           ["bhagyank", "Bhagyank"],
//                           ["firstNameNumber", "First Name No."],
//                           ["firstNameSum", "First Name Total"],
//                           ["fullNameNumber", "Full Name No."],
//                           ["fullNameSum", "Full Name Total"],
//                           ["fullNameCompound", "Compound No."],
//                         ] as const
//                       ).map(([field, label]) => (
//                         <div key={field}>
//                           <Label className="text-xs text-muted-foreground">{label}</Label>
//                           <Input
//                             type="number"
//                             value={contentEditForm[field]}
//                             onChange={(e) =>
//                               setContentEditForm((prev) =>
//                                 prev ? { ...prev, [field]: Number(e.target.value) } : prev
//                               )
//                             }
//                           />
//                         </div>
//                       ))}
//                       <div>
//                         <Label className="text-xs text-muted-foreground">Compound Tier</Label>
//                         <Select
//                           value={contentEditForm.compoundTier}
//                           onValueChange={(v) =>
//                             setContentEditForm((prev) => (prev ? { ...prev, compoundTier: v as NameCheckReportContent["compoundTier"] } : prev))
//                           }
//                         >
//                           <SelectTrigger>
//                             <SelectValue />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {["excellent", "good", "neutral", "conditional", "avoid"].map((tier) => (
//                               <SelectItem key={tier} value={tier}>
//                                 {tier.charAt(0).toUpperCase() + tier.slice(1)}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                       </div>
//                     </div>
//                   </div>

//                   {/* First Name analysis */}
//                   <div>
//                     <Label className="text-sm font-semibold">First Name Number — "What This Represents"</Label>
//                     <div className="space-y-2 mt-2">
//                       {contentEditForm.firstNameAnalysis.map((para, i) => (
//                         <Textarea
//                           key={i}
//                           value={para}
//                           rows={2}
//                           onChange={(e) => updateContentParagraph("firstNameAnalysis", i, e.target.value)}
//                         />
//                       ))}
//                     </div>
//                   </div>

//                   {/* Full Name analysis */}
//                   <div>
//                     <Label className="text-sm font-semibold">Full Name Number — "What This Represents"</Label>
//                     <div className="space-y-2 mt-2">
//                       {contentEditForm.fullNameAnalysis.map((para, i) => (
//                         <Textarea
//                           key={i}
//                           value={para}
//                           rows={2}
//                           onChange={(e) => updateContentParagraph("fullNameAnalysis", i, e.target.value)}
//                         />
//                       ))}
//                     </div>
//                   </div>

//                   {/* Compound analysis */}
//                   <div>
//                     <Label className="text-sm font-semibold">Compound Number — "What This Represents"</Label>
//                     <div className="space-y-2 mt-2">
//                       {contentEditForm.compoundAnalysis.map((para, i) => (
//                         <Textarea
//                           key={i}
//                           value={para}
//                           rows={2}
//                           onChange={(e) => updateContentParagraph("compoundAnalysis", i, e.target.value)}
//                         />
//                       ))}
//                     </div>
//                   </div>

//                   {/* Verdict */}
//                   <div>
//                     <Label className="text-sm font-semibold">Why This Is Critical</Label>
//                     <div className="grid grid-cols-2 gap-3 mt-2">
//                       <div>
//                         <Label className="text-xs text-muted-foreground">Verdict</Label>
//                         <Select
//                           value={contentEditForm.verdict}
//                           onValueChange={(v) =>
//                             setContentEditForm((prev) => (prev ? { ...prev, verdict: v as NameCheckReportContent["verdict"] } : prev))
//                           }
//                         >
//                           <SelectTrigger>
//                             <SelectValue />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="HR">Highly Recommended</SelectItem>
//                             <SelectItem value="OA">Optional / Advisable</SelectItem>
//                             <SelectItem value="NR">Not Required</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>
//                     </div>
//                     <div className="space-y-2 mt-3">
//                       <Label className="text-xs text-muted-foreground">Bullets</Label>
//                       {contentEditForm.verdictBullets.map((para, i) => (
//                         <Textarea
//                           key={i}
//                           value={para}
//                           rows={2}
//                           onChange={(e) => updateContentParagraph("verdictBullets", i, e.target.value)}
//                         />
//                       ))}
//                       <Label className="text-xs text-muted-foreground">Closing verdict line (shown in the maroon badge)</Label>
//                       <Textarea
//                         value={contentEditForm.verdictNote}
//                         rows={2}
//                         onChange={(e) =>
//                           setContentEditForm((prev) => (prev ? { ...prev, verdictNote: e.target.value } : prev))
//                         }
//                       />
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}

//           <DialogFooter>
//             {viewMode === "edit" ? (
//               <>
//                 <Button variant="outline" onClick={backToPreview} disabled={savingContentEdit}>
//                   <ArrowLeft className="mr-2 h-4 w-4" />
//                   Back to Preview
//                 </Button>
//                 <Button onClick={handleSaveContentEdit} disabled={savingContentEdit || loadingContentEdit || !contentEditForm}>
//                   {savingContentEdit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                   Save & Regenerate PDF
//                 </Button>
//               </>
//             ) : (
//               <Button
//                 variant="outline"
//                 onClick={() => {
//                   setViewTarget(null);
//                   setPreviewUrl(null);
//                 }}
//               >
//                 Close
//               </Button>
//             )}
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Edit Dialog (customer input fields — name, DOB, gender, etc.) */}
//       <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
//         <DialogContent className="sm:max-w-lg">
//           <DialogHeader>
//             <DialogTitle>Edit Report</DialogTitle>
//             <DialogDescription>{editTarget?.report_id}</DialogDescription>
//           </DialogHeader>
//           <ReportForm values={editForm} onChange={setEditForm} includeStatus />
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setEditTarget(null)} disabled={savingEdit}>
//               Cancel
//             </Button>
//             <Button onClick={handleSaveEdit} disabled={savingEdit}>
//               {savingEdit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//               Save Changes
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Create / Generate Report Dialog */}
//       <Dialog open={createOpen} onOpenChange={(open) => !open && setCreateOpen(false)}>
//         <DialogContent className="sm:max-w-lg">
//           <DialogHeader>
//             <DialogTitle>Generate New Report</DialogTitle>
//             <DialogDescription>Create a new Name Check Report submission.</DialogDescription>
//           </DialogHeader>
//           <ReportForm values={createForm} onChange={setCreateForm} />
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
//               Cancel
//             </Button>
//             <Button onClick={handleCreateReport} disabled={creating}>
//               {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//               Create Report
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Delete Confirmation */}
//       <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete this report?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This will permanently delete the report for{" "}
//               <span className="font-medium">{deleteTarget?.customer_name}</span> ({deleteTarget?.report_id}). This
//               action cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
//               {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//       {/* Bulk Delete Confirmation */}
//       <AlertDialog open={confirmBulkDelete} onOpenChange={setConfirmBulkDelete}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete {selectedIds.size} reports?</AlertDialogTitle>
//             <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={bulkDeleting}>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handleBulkDelete} disabled={bulkDeleting} className="bg-red-600 hover:bg-red-700">
//               {bulkDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//       {/* Regenerate PDF Confirmation */}
//       <AlertDialog open={!!regenerateTarget} onOpenChange={(open) => !open && setRegenerateTarget(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Regenerate PDF report?</AlertDialogTitle>
//             <AlertDialogDescription>
//               A PDF already exists for <span className="font-medium">{regenerateTarget?.customer_name}</span> (
//               {regenerateTarget?.report_id}). Regenerating will replace the existing file.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={!!generatingId}>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={() => regenerateTarget && runGeneratePdf(regenerateTarget)}
//               disabled={!!generatingId}
//             >
//               {generatingId && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//               Regenerate
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </AdminPage>
//   );
// }

// /* ------------------------------------------------------------------ */
// /*  Shared create/edit form                                            */
// /* ------------------------------------------------------------------ */

// function ReportForm({
//   values,
//   onChange,
//   includeStatus,
// }: {
//   values: ReportFormValues;
//   onChange: (values: ReportFormValues) => void;
//   includeStatus?: boolean;
// }) {
//   const set = <K extends keyof ReportFormValues>(key: K, value: ReportFormValues[K]) =>
//     onChange({ ...values, [key]: value });

//   return (
//     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//       <div>
//         <Label htmlFor="first_name">First Name</Label>
//         <Input
//           id="first_name"
//           value={values.first_name}
//           onChange={(e) => set("first_name", e.target.value)}
//           placeholder="First name"
//         />
//       </div>
//       <div>
//         <Label htmlFor="last_name">Last Name</Label>
//         <Input
//           id="last_name"
//           value={values.last_name}
//           onChange={(e) => set("last_name", e.target.value)}
//           placeholder="Last name"
//         />
//       </div>
//       <div>
//         <Label htmlFor="middle_name">Middle Name</Label>
//         <Input
//           id="middle_name"
//           value={values.middle_name}
//           onChange={(e) => {
//             const next = e.target.value;
//             set("middle_name", next);
//             // Field only makes sense when there's a middle name to classify —
//             // clear any stale "Yes" so it can't be silently submitted once
//             // the middle name is emptied out again.
//             if (!next.trim() && values.is_middle_name_father_husband) {
//               set("is_middle_name_father_husband", false);
//             }
//           }}
//           placeholder="Middle name"
//         />
//       </div>
//       {values.middle_name.trim().length > 0 && (
//         <div>
//           <Label htmlFor="is_middle_name_father_husband">Is Middle Name Father's / Husband's Name?</Label>
//           <Select
//             value={values.is_middle_name_father_husband ? "yes" : "no"}
//             onValueChange={(v) => set("is_middle_name_father_husband", v === "yes")}
//           >
//             <SelectTrigger id="is_middle_name_father_husband">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="no">No</SelectItem>
//               <SelectItem value="yes">Yes</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       )}
//       <div>
//         <Label htmlFor="email">Email</Label>
//         <Input
//           id="email"
//           type="email"
//           value={values.email}
//           onChange={(e) => set("email", e.target.value)}
//           placeholder="name@example.com"
//         />
//       </div>
//       <div>
//         <Label htmlFor="phone">Phone</Label>
//         <Input id="phone" value={values.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91..." />
//       </div>
//       <div>
//         <Label htmlFor="dob">Date of Birth</Label>
//         <Input id="dob" type="date" value={values.dob} onChange={(e) => set("dob", e.target.value)} />
//       </div>
//       <div>
//         <Label htmlFor="gender">Gender</Label>
//         <Select value={values.gender} onValueChange={(v) => set("gender", v)}>
//           <SelectTrigger id="gender">
//             <SelectValue placeholder="Select gender" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="Male">Male</SelectItem>
//             <SelectItem value="Female">Female</SelectItem>
//             <SelectItem value="Other">Other</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>
//       {includeStatus && (
//         <div className="sm:col-span-2">
//           <Label htmlFor="status">Status</Label>
//           <Select value={values.status} onValueChange={(v) => set("status", v as ReportStatus)}>
//             <SelectTrigger id="status">
//               <SelectValue placeholder="Select status" />
//             </SelectTrigger>
//             <SelectContent>
//               {(Object.keys(STATUS_META) as ReportStatus[]).map((status) => (
//                 <SelectItem key={status} value={status}>
//                   {STATUS_META[status].label}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//       )}
//     </div>
//   );
// }

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileSearch,
  RefreshCw,
  Plus,
  Search,
  Eye,
  Pencil,
  FileCog,
  FileEdit,
  Download,
  Printer,
  MoreVertical,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileX2,
  BadgeCheck,
  CalendarIcon,
  X,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import { getMulank, getBhagyank } from "@/lib/name-check/lo-shu";
import type { DateRange } from "react-day-picker";

import { AdminPage } from "@/components/admin/AdminPage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";

import {
  generateNameCheckReportPdf,
  nameCheckReportPdfToBlob,
  computeNameCheckReportContent,
  type NameCheckReportContent,
} from "@/components/NameCheckReportGenerator";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ReportStatus = "draft" | "generating" | "completed" | "failed" | "archived";

interface NameCheckReportRow {
  id: string;
  report_id: string;
  customer_name: string;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  is_middle_name_father_husband: boolean;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  status: ReportStatus;
  pdf_url: string | null;
  /** Admin's saved correction of the computed report content, if any (see NameCheckReportGenerator.tsx). NULL = PDF uses the live rule-engine calculation. */
  content_overrides: NameCheckReportContent | null;
  /** Who last generated/regenerated the PDF (admin email/name) — stamped directly on the row instead of going through Audit Logs, so it shows right on the card/preview. NULL = never generated, or generated before this field existed. */
  generated_by: string | null;
  created_at: string;
  updated_at: string;
}

interface ReportFormValues {
  first_name: string;
  middle_name: string;
  last_name: string;
  is_middle_name_father_husband: boolean;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  status: ReportStatus;
}

const EMPTY_FORM: ReportFormValues = {
  first_name: "",
  middle_name: "",
  last_name: "",
  is_middle_name_father_husband: false,
  email: "",
  phone: "",
  dob: "",
  gender: "",
  status: "draft",
};

/** Combines First/Middle/Last into the single display/search name used elsewhere. */
function buildCustomerName(values: { first_name: string; middle_name: string; last_name: string }): string {
  return [values.first_name, values.middle_name, values.last_name].map((s) => s.trim()).filter(Boolean).join(" ");
}

const CREATE_DRAFT_KEY = "name-check-create-report-draft";

/** Loads a saved in-progress "Generate Report" form draft from localStorage, if any. */
function loadCreateDraft(): ReportFormValues {
  try {
    const raw = window.localStorage.getItem(CREATE_DRAFT_KEY);
    if (!raw) return EMPTY_FORM;
    const parsed = JSON.parse(raw);
    // Merge over EMPTY_FORM so a draft saved before a schema change (missing a
    // newly-added field) doesn't crash the form — missing keys just fall back.
    return { ...EMPTY_FORM, ...parsed };
  } catch {
    return EMPTY_FORM;
  }
}

/** Clears the saved draft — called after a successful create, or when the user explicitly discards it. */
function clearCreateDraft() {
  try {
    window.localStorage.removeItem(CREATE_DRAFT_KEY);
  } catch {
    // Ignore — nothing to clean up if storage isn't available.
  }
}

const CREATE_OPEN_KEY = "name-check-create-report-open";

/** Whether the "Generate Report" dialog was left open last time — reopens it automatically on return. */
function loadCreateOpenFlag(): boolean {
  try {
    return window.localStorage.getItem(CREATE_OPEN_KEY) === "1";
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  Preview/Edit dialog persistence                                    */
/* ------------------------------------------------------------------ */

// Without this, navigating to another admin screen and coming back
// unmounts this whole component — React wipes viewTarget/viewMode/
// contentEditForm back to their initial (closed) values, so the preview or
// in-progress "Edit Report Content" form the admin left open just
// disappears. Persisting the minimal state needed to reopen it here fixes
// that, mirroring the CREATE_OPEN_KEY/CREATE_DRAFT_KEY pattern above.
const VIEW_DIALOG_KEY = "name-check-view-dialog-state";

interface SavedViewDialogState {
  reportId: string;
  viewMode: "details" | "edit";
  contentEditForm: NameCheckReportContent | null;
}

function loadSavedViewDialogState(): SavedViewDialogState | null {
  try {
    const raw = window.localStorage.getItem(VIEW_DIALOG_KEY);
    return raw ? (JSON.parse(raw) as SavedViewDialogState) : null;
  } catch {
    return null;
  }
}

const PAGE_SIZE = 10;
const TABLE_NAME = "name_check_reports";
const STORAGE_BUCKET = "name-check-reports";
const ACTIVITY_LOG_TABLE = "report_activity_log";

const STATUS_META: Record<ReportStatus, { label: string; badgeClass: string }> = {
  draft: { label: "Draft", badgeClass: "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-100" },
  generating: { label: "Generating", badgeClass: "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100" },
  completed: { label: "Completed", badgeClass: "bg-green-100 text-green-800 border-green-300 hover:bg-green-100" },
  failed: { label: "Failed", badgeClass: "bg-red-100 text-red-800 border-red-300 hover:bg-red-100" },
  archived: { label: "Archived", badgeClass: "bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-200" },
};

function generateReportId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `NCR-${stamp}-${rand}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/** Appends a cache-busting query param so the iframe never shows a stale cached
 * copy of a PDF we just re-uploaded to the SAME storage path (upsert keeps the
 * URL identical, so without this the browser's HTTP cache can serve the old file). */
function withCacheBust(url: string | null): string | null {
  if (!url) return null;
  return `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`;
}

/**
 * Resolves a human-readable identifier for "who did this" — used to stamp
 * generated_by directly on the report row whenever a PDF is generated or
 * regenerated (Generate/Regenerate and Edit Report Content -> Save both call
 * this). Falls back to "Unknown" rather than throwing, since a missing name
 * should never block the actual PDF generation from completing.
 */
async function getCurrentAdminIdentifier(): Promise<string> {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.email ?? "Unknown";
  } catch {
    return "Unknown";
  }
}

/**
 * Extracts a readable message from any thrown value. Supabase errors
 * (PostgrestError / StorageError) are plain objects with a `message`
 * property — they are NOT `instanceof Error` — so `err instanceof Error ?
 * err.message : "Unexpected error"` (used throughout this file) was
 * silently swallowing the real reason for any Supabase failure and always
 * showing the generic fallback text instead. This checks for a `message`
 * property on ANY object, not just real Error instances, so the actual
 * database/storage error (e.g. a missing column, a type mismatch, an RLS
 * rejection) shows up in the toast instead of being hidden.
 */
function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err && typeof (err as { message?: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  return fallback;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function NameCheckReports() {
  const { toast } = useToast();

  const [reports, setReports] = useState<NameCheckReportRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [page, setPage] = useState(1);

  // Dialog state
  const [editTarget, setEditTarget] = useState<NameCheckReportRow | null>(null);
  const [editForm, setEditForm] = useState<ReportFormValues>(EMPTY_FORM);
  const [createOpen, setCreateOpen] = useState(() => loadCreateOpenFlag());
  const [createForm, setCreateForm] = useState<ReportFormValues>(() => loadCreateDraft());
  const [deleteTarget, setDeleteTarget] = useState<NameCheckReportRow | null>(null);
  const [regenerateTarget, setRegenerateTarget] = useState<NameCheckReportRow | null>(null);

  // Unified "Report" dialog — a single dialog that shows either the PDF
  // PREVIEW (viewMode "details") or the content-correction FORM (viewMode
  // "edit"), for the report in `viewTarget`. Previously these were two
  // separate dialogs; now "Edit Report Content" is reachable directly from
  // inside the preview, and saving an edit flips straight back to showing
  // the freshly-regenerated preview instead of closing everything.
  const [viewTarget, setViewTarget] = useState<NameCheckReportRow | null>(null);
  const [viewMode, setViewMode] = useState<"details" | "edit">("details");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [contentEditForm, setContentEditForm] = useState<NameCheckReportContent | null>(null);
  const [loadingContentEdit, setLoadingContentEdit] = useState(false);
  const [savingContentEdit, setSavingContentEdit] = useState(false);

  // Gates the save-effect below until the restore-effect has had its first
  // chance to read localStorage — without this, the save-effect's own
  // mount-time run (viewTarget still null) wipes the saved key a tick
  // before the restore-effect gets to read it, so restoring silently never
  // works.
  const [hasHydratedViewDialog, setHasHydratedViewDialog] = useState(false);

  // Persist whether the "Generate Report" dialog was left open, so navigating
  // away and coming back re-opens it automatically instead of just keeping
  // the form data in the background.
  useEffect(() => {
    try {
      window.localStorage.setItem(CREATE_OPEN_KEY, createOpen ? "1" : "0");
    } catch {
      // Ignore — worst case the dialog just doesn't auto-reopen.
    }
  }, [createOpen]);

  // Persist the "Generate Report" form as a draft so it survives navigating
  // away and coming back (e.g. checking a customer's details in another tab
  // mid-fill). Cleared automatically once the report is successfully created.
  useEffect(() => {
    try {
      window.localStorage.setItem(CREATE_DRAFT_KEY, JSON.stringify(createForm));
    } catch {
      // Storage can fail (private browsing, quota) — losing the draft-save is fine, don't crash the form.
    }
  }, [createForm]);

  // Persists the preview/edit dialog across navigation — without this,
  // moving to another screen and coming back unmounts this component and
  // wipes its local state (viewTarget resets to null, closing the dialog
  // and losing any in-progress "Edit Report Content" text).
  useEffect(() => {
    if (!hasHydratedViewDialog) return; // don't touch storage until restore has run
    try {
      if (viewTarget) {
        window.localStorage.setItem(
          VIEW_DIALOG_KEY,
          JSON.stringify({ reportId: viewTarget.id, viewMode, contentEditForm })
        );
      } else {
        window.localStorage.removeItem(VIEW_DIALOG_KEY);
      }
    } catch {
      // Ignore — worst case the dialog just doesn't auto-restore.
    }
  }, [viewTarget, viewMode, contentEditForm, hasHydratedViewDialog]);

  // Restores the preview/edit dialog on mount, if one was left open before
  // navigating away. Fetches the row fresh (not from the paginated `reports`
  // list) since that list may not include this report on the current page.
  useEffect(() => {
    const saved = loadSavedViewDialogState();
    if (!saved?.reportId) {
      setHasHydratedViewDialog(true); // nothing to restore — unblock the save-effect
      return;
    }

    (async () => {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select("*")
        .eq("id", saved.reportId)
        .single();
      if (error || !data) {
        window.localStorage.removeItem(VIEW_DIALOG_KEY);
        setHasHydratedViewDialog(true);
        return;
      }
      const row = data as NameCheckReportRow;
      setViewTarget(row);
      setViewMode(saved.viewMode);
      setPreviewUrl(withCacheBust(row.pdf_url));
      if (saved.viewMode === "edit") {
        setContentEditForm(
          saved.contentEditForm ??
            row.content_overrides ??
            computeNameCheckReportContent({
              customerName: row.customer_name,
              dob: row.dob,
              firstName: row.first_name ?? undefined,
              middleName: row.middle_name ?? undefined,
              lastName: row.last_name ?? undefined,
              isMiddleNameFatherHusband: row.is_middle_name_father_husband,
            })
        );
      }
      setHasHydratedViewDialog(true); // unblock the save-effect only after restore is fully applied
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [savingEdit, setSavingEdit] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, sortOrder, dateRange]);

  // Clear selection whenever the underlying list changes (page/filter/data reload)
  useEffect(() => {
    setSelectedIds(new Set());
  }, [page, debouncedSearch, statusFilter, sortOrder, dateRange]);

  /* ------------------------- Activity logging ------------------------ */

  const logActivity = useCallback(async (reportId: string, action: string, metadata?: Record<string, unknown>) => {
    try {
      await supabase.from(ACTIVITY_LOG_TABLE).insert({
        report_id: reportId,
        action,
        metadata: metadata ?? {},
      });
    } catch (e) {
      // Never block the primary action if logging fails.
      console.error("activity log failed", e);
    }
  }, []);

  const fetchReports = useCallback(
    async (opts?: { silent?: boolean }) => {
      opts?.silent ? setRefreshing(true) : setLoading(true);
      try {
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        let query = supabase.from(TABLE_NAME).select("*", { count: "exact" });

        if (debouncedSearch) {
          const term = debouncedSearch.replace(/%/g, "");
          query = query.or(
            `customer_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%,report_id.ilike.%${term}%`
          );
        }
        if (statusFilter !== "all") {
          query = query.eq("status", statusFilter);
        }
        if (dateRange?.from) {
          query = query.gte("created_at", dateRange.from.toISOString());
        }
        if (dateRange?.to) {
          const endOfDay = new Date(dateRange.to);
          endOfDay.setHours(23, 59, 59, 999);
          query = query.lte("created_at", endOfDay.toISOString());
        }
        query = query.order("created_at", { ascending: sortOrder === "oldest" }).range(from, to);

        const { data, error, count } = await query;
        if (error) throw error;

        setReports((data as NameCheckReportRow[]) ?? []);
        setTotalCount(count ?? 0);
      } catch (err) {
        console.error(err);
        toast({
          title: "Failed to load reports",
          description: err instanceof Error ? err.message : "Unexpected error while fetching reports.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, debouncedSearch, statusFilter, sortOrder, dateRange, toast]
  );

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, statusFilter, sortOrder, dateRange]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  /* ---------------------------- Actions ---------------------------- */

  const handleCreateReport = async () => {
    if (!createForm.first_name || !createForm.email || !createForm.dob) {
      toast({ title: "Missing details", description: "First name, email and date of birth are required.", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const newReportId = generateReportId();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert({
          report_id: newReportId,
          customer_name: buildCustomerName(createForm),
          first_name: createForm.first_name,
          middle_name: createForm.middle_name || null,
          last_name: createForm.last_name || null,
          is_middle_name_father_husband: createForm.is_middle_name_father_husband,
          email: createForm.email,
          phone: createForm.phone,
          dob: createForm.dob,
          gender: createForm.gender,
          status: createForm.status,
          pdf_url: null,
        })
        .select("id")
        .single();
      if (error) throw error;

      if (data?.id) {
        logActivity(data.id, "create", { report_id: newReportId });
      }

      toast({ title: "Report created", description: "A new Name Check Report submission has been added." });
      setCreateOpen(false);
      setCreateForm(EMPTY_FORM);
      clearCreateDraft();
      setPage(1);
      fetchReports();
    } catch (err) {
      toast({
        title: "Could not create report",
        description: err instanceof Error ? err.message : "Unexpected error.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const openEditDialog = (report: NameCheckReportRow) => {
    setEditTarget(report);
    setEditForm({
      first_name: report.first_name ?? report.customer_name.split(/\s+/)[0] ?? "",
      middle_name: report.middle_name ?? "",
      last_name: report.last_name ?? "",
      is_middle_name_father_husband: report.is_middle_name_father_husband ?? false,
      email: report.email,
      phone: report.phone ?? "",
      dob: report.dob,
      gender: report.gender ?? "",
      status: report.status,
    });
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    setSavingEdit(true);
    try {
      const { error } = await supabase
        .from(TABLE_NAME)
        .update({
          customer_name: buildCustomerName(editForm),
          first_name: editForm.first_name,
          middle_name: editForm.middle_name || null,
          last_name: editForm.last_name || null,
          is_middle_name_father_husband: editForm.is_middle_name_father_husband,
          email: editForm.email,
          phone: editForm.phone,
          dob: editForm.dob,
          gender: editForm.gender,
          status: editForm.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editTarget.id);
      if (error) throw error;

      logActivity(editTarget.id, "edit");

      toast({ title: "Report updated", description: `${buildCustomerName(editForm)}'s record has been saved.` });
      setEditTarget(null);
      fetchReports({ silent: true });
    } catch (err) {
      toast({
        title: "Could not save changes",
        description: err instanceof Error ? err.message : "Unexpected error.",
        variant: "destructive",
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleChangeStatus = async (report: NameCheckReportRow, status: ReportStatus) => {
    try {
      const { error } = await supabase
        .from(TABLE_NAME)
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", report.id);
      if (error) throw error;

      logActivity(report.id, "status_change", { from: report.status, to: status });

      toast({ title: "Status updated", description: `${report.customer_name} is now marked as ${STATUS_META[status].label}.` });
      fetchReports({ silent: true });
    } catch (err) {
      toast({
        title: "Could not update status",
        description: err instanceof Error ? err.message : "Unexpected error.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from(TABLE_NAME).delete().eq("id", deleteTarget.id);
      if (error) throw error;

      logActivity(deleteTarget.id, "delete", { report_id: deleteTarget.report_id });

      toast({ title: "Report deleted", description: `Report ${deleteTarget.report_id} has been removed.` });
      setDeleteTarget(null);
      fetchReports({ silent: true });
    } catch (err) {
      toast({
        title: "Could not delete report",
        description: err instanceof Error ? err.message : "Unexpected error.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  /** Opens the unified Report dialog in PREVIEW mode for the given report. */
  const openPreview = (report: NameCheckReportRow) => {
    setViewTarget(report);
    setViewMode("details");
    setContentEditForm(null);
    setPreviewUrl(withCacheBust(report.pdf_url));
  };

  const runGeneratePdf = async (report: NameCheckReportRow) => {
    setGeneratingId(report.id);
    try {
      const bytes = await generateNameCheckReportPdf({
        reportId: report.report_id,
        customerName: report.customer_name,
        firstName: report.first_name ?? undefined,
        middleName: report.middle_name ?? undefined,
        lastName: report.last_name ?? undefined,
        isMiddleNameFatherHusband: report.is_middle_name_father_husband,
        email: report.email,
        phone: report.phone,
        dob: report.dob,
        gender: report.gender,
        generatedDate: new Date().toISOString(),
        // Respect any admin correction saved via "Edit Report Content" —
        // otherwise a plain Regenerate would silently wipe it out.
        contentOverride: report.content_overrides ?? undefined,
      });

      const blob = nameCheckReportPdfToBlob(bytes);
      const filePath = `${report.report_id}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, blob, { contentType: "application/pdf", upsert: true });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
      const pdfUrl = publicUrlData?.publicUrl ?? null;

      // "Generated by" stamp — who's currently signed in, resolved right
      // before the DB write so it reflects whoever actually clicked
      // Generate/Regenerate, not the person who first created the report.
      const generatedByName = await getCurrentAdminIdentifier();

      const { error: updateError } = await supabase
        .from(TABLE_NAME)
        .update({
          pdf_url: pdfUrl,
          status: "completed",
          generated_by: generatedByName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", report.id);
      if (updateError) throw updateError;

      logActivity(report.id, "regenerate", { report_id: report.report_id });

      toast({ title: "PDF generated", description: `Report ${report.report_id} is ready to review.` });

      // Open the preview automatically right after generating, with "Edit
      // Report Content" reachable from inside it — this is the flow the
      // admin actually wants instead of just a toast + having to hunt for
      // the file afterwards.
      const updatedRow: NameCheckReportRow = {
        ...report,
        pdf_url: pdfUrl,
        status: "completed",
        generated_by: generatedByName,
      };
      openPreview(updatedRow);

      fetchReports({ silent: true });
    } catch (err) {
      console.error("[NameCheckReports] PDF generation failed:", err);
      toast({
        title: "PDF generation failed",
        description: getErrorMessage(err, "Unexpected error while generating the PDF."),
        variant: "destructive",
      });
    } finally {
      setGeneratingId(null);
      setRegenerateTarget(null);
    }
  };

  const handleGeneratePdfClick = (report: NameCheckReportRow) => {
    if (report.pdf_url) {
      // Regenerating an existing PDF needs confirmation.
      setRegenerateTarget(report);
    } else {
      runGeneratePdf(report);
    }
  };

  /**
   * Switches the unified Report dialog into EDIT mode for the given report.
   * If the admin has already saved a correction for this report, that's
   * loaded as-is; otherwise the form is prefilled with what the rule engine
   * currently computes, so the admin is always editing real (not blank)
   * values.
   */
  const enterContentEditMode = async (report: NameCheckReportRow) => {
    setViewTarget(report);
    setViewMode("edit");
    setContentEditForm(null);
    setLoadingContentEdit(true);
    try {
      if (report.content_overrides) {
        setContentEditForm(report.content_overrides);
      } else {
        const computed = computeNameCheckReportContent({
          customerName: report.customer_name,
          dob: report.dob,
          firstName: report.first_name ?? undefined,
          middleName: report.middle_name ?? undefined,
          lastName: report.last_name ?? undefined,
          isMiddleNameFatherHusband: report.is_middle_name_father_husband,
        });
        setContentEditForm(computed);
      }
    } catch (err) {
      toast({
        title: "Could not load report content",
        description: err instanceof Error ? err.message : "Unexpected error.",
        variant: "destructive",
      });
      setViewMode("details");
    } finally {
      setLoadingContentEdit(false);
    }
  };

  /** Discards any in-progress edits and returns to the preview pane, without closing the dialog. */
  const backToPreview = () => {
    setViewMode("details");
    setContentEditForm(null);
  };

  /** Saves the admin's correction, regenerates the PDF, and flips the SAME dialog back to showing the fresh preview. */
  const handleSaveContentEdit = async () => {
    if (!viewTarget || !contentEditForm) return;
    setSavingContentEdit(true);
    try {
      const bytes = await generateNameCheckReportPdf({
        reportId: viewTarget.report_id,
        customerName: viewTarget.customer_name,
        firstName: viewTarget.first_name ?? undefined,
        middleName: viewTarget.middle_name ?? undefined,
        lastName: viewTarget.last_name ?? undefined,
        isMiddleNameFatherHusband: viewTarget.is_middle_name_father_husband,
        email: viewTarget.email,
        phone: viewTarget.phone,
        dob: viewTarget.dob,
        gender: viewTarget.gender,
        generatedDate: new Date().toISOString(),
        contentOverride: contentEditForm,
      });

      const blob = nameCheckReportPdfToBlob(bytes);
      const filePath = `${viewTarget.report_id}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, blob, { contentType: "application/pdf", upsert: true });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
      const pdfUrl = publicUrlData?.publicUrl ?? null;

      // Same "generated by" stamp as a plain Generate/Regenerate — editing
      // content and saving also produces a freshly-regenerated PDF, so it
      // should be attributed the same way.
      const generatedByName = await getCurrentAdminIdentifier();

      const { error: updateError } = await supabase
        .from(TABLE_NAME)
        .update({
          content_overrides: contentEditForm,
          pdf_url: pdfUrl,
          status: "completed",
          generated_by: generatedByName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", viewTarget.id);
      if (updateError) throw updateError;

      logActivity(viewTarget.id, "edit_content", { report_id: viewTarget.report_id });

      toast({ title: "Report content updated", description: `A corrected PDF for ${viewTarget.report_id} has been generated.` });

      // Flip back to the preview pane of the SAME dialog, now showing the
      // just-regenerated PDF — this is the "edit inside the preview" flow.
      const updatedRow: NameCheckReportRow = {
        ...viewTarget,
        pdf_url: pdfUrl,
        status: "completed",
        content_overrides: contentEditForm,
        generated_by: generatedByName,
      };
      setViewTarget(updatedRow);
      setPreviewUrl(withCacheBust(pdfUrl));
      setViewMode("details");
      setContentEditForm(null);

      fetchReports({ silent: true });
    } catch (err) {
      console.error("[NameCheckReports] Save report content failed:", err);
      toast({
        title: "Could not save report content",
        description: getErrorMessage(err, "Unexpected error while regenerating the PDF."),
        variant: "destructive",
      });
    } finally {
      setSavingContentEdit(false);
    }
  };

  /** Helper for editing one of the 3-paragraph analysis blocks in the content-edit form. */
  const updateContentParagraph = (
    field: "firstNameAnalysis" | "fullNameAnalysis" | "compoundAnalysis" | "verdictBullets",
    index: number,
    value: string
  ) => {
    setContentEditForm((prev) => {
      if (!prev) return prev;
      const next = [...prev[field]];
      next[index] = value;
      return { ...prev, [field]: next };
    });
  };

  /** Builds the customer-facing download filename: FirstName_Name Check_M<mulank>B<bhagyank>.pdf */
  function buildDownloadFilename(report: NameCheckReportRow): string {
    const firstNameRaw = (report.first_name || report.customer_name.trim().split(/\s+/)[0] || "Report");
    const firstName = firstNameRaw.replace(/[^a-zA-Z0-9]/g, ""); // strip anything unsafe for a filename

    const dobDate = new Date(report.dob);
    if (isNaN(dobDate.getTime())) {
      return `${firstName}_Name Check_${report.report_id}.pdf`;
    }
    const mulank = getMulank(dobDate.getDate());
    const bhagyank = getBhagyank(dobDate.getDate(), dobDate.getMonth() + 1, dobDate.getFullYear());

    return `${firstName}_Name Check_M${mulank}B${bhagyank}.pdf`;
  }

  const handleDownloadPdf = async (report: NameCheckReportRow) => {
    if (!report.pdf_url) {
      toast({ title: "No PDF available", description: "Generate the PDF for this report first.", variant: "destructive" });
      return;
    }
    try {
      // Fetch the PDF bytes ourselves first — the download="filename" attribute
      // is silently ignored by browsers for cross-origin links (our PDF lives on
      // Supabase Storage, a different origin from this admin panel), so a direct
      // <a href={report.pdf_url} download> just opens the file instead of naming it.
      // Fetching it into a same-origin blob: URL makes the custom filename work.
      const res = await fetch(report.pdf_url);
      if (!res.ok) throw new Error(`Failed to fetch PDF (${res.status})`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = buildDownloadFilename(report);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      logActivity(report.id, "download");
    } catch (err) {
      toast({ title: "Download failed", description: err instanceof Error ? err.message : "Could not download the PDF.", variant: "destructive" });
    }
  };

  const handlePrint = (report: NameCheckReportRow) => {
    if (!report.pdf_url) {
      toast({ title: "No PDF available", description: "Generate the PDF for this report first.", variant: "destructive" });
      return;
    }
    const win = window.open(report.pdf_url, "_blank");
    if (win) {
      win.addEventListener("load", () => win.print());
    }

    logActivity(report.id, "print");
  };

  const searchPlaceholder = "Search by name, email, phone or report ID...";

  const emptyState = useMemo(() => !loading && reports.length === 0, [loading, reports]);

  /* ---------------------------- Bulk actions ---------------------------- */

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSelected = reports.length > 0 && selectedIds.size === reports.length;

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(reports.map((r) => r.id)));
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      const ids = Array.from(selectedIds);
      const { error } = await supabase.from(TABLE_NAME).delete().in("id", ids);
      if (error) throw error;

      ids.forEach((id) => logActivity(id, "bulk_delete"));

      toast({ title: "Deleted", description: `${ids.length} report(s) removed.` });
      clearSelection();
      setConfirmBulkDelete(false);
      fetchReports({ silent: true });
    } catch (err) {
      toast({
        title: "Bulk delete failed",
        description: err instanceof Error ? err.message : "Unexpected error.",
        variant: "destructive",
      });
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleBulkStatusChange = async (status: ReportStatus) => {
    try {
      const ids = Array.from(selectedIds);
      const { error } = await supabase
        .from(TABLE_NAME)
        .update({ status, updated_at: new Date().toISOString() })
        .in("id", ids);
      if (error) throw error;

      ids.forEach((id) => logActivity(id, "bulk_status_change", { to: status }));

      toast({ title: "Status updated", description: `${ids.length} report(s) marked ${STATUS_META[status].label}.` });
      clearSelection();
      fetchReports({ silent: true });
    } catch (err) {
      toast({
        title: "Bulk update failed",
        description: err instanceof Error ? err.message : "Unexpected error.",
        variant: "destructive",
      });
    }
  };

  const handleBulkDownload = () => {
    const targets = reports.filter((r) => selectedIds.has(r.id) && r.pdf_url);
    if (targets.length === 0) {
      toast({ title: "No PDFs available", description: "Selected reports have no generated PDF.", variant: "destructive" });
      return;
    }
    targets.forEach((r, i) => {
      // Stagger downloads slightly so browsers don't block multiple popups/downloads at once.
      setTimeout(() => handleDownloadPdf(r), i * 400);
    });
  };

  const handleBulkExportCsv = () => {
    const targets = reports.filter((r) => selectedIds.has(r.id));
    if (targets.length === 0) return;

    const header = ["Report ID", "Customer Name", "Email", "Phone", "DOB", "Gender", "Status", "Created At"];
    const rows = targets.map((r) => [
      r.report_id,
      r.customer_name,
      r.email,
      r.phone,
      r.dob,
      r.gender,
      STATUS_META[r.status].label,
      r.created_at,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((v) => `"${(v ?? "").toString().replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `name-check-reports-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    targets.forEach((r) => logActivity(r.id, "bulk_export_csv"));
  };

  /* ------------------------------ UI -------------------------------- */

  return (
    <AdminPage>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Name Check Reports</h1>
            <p className="text-sm text-muted-foreground">Manage all Name Check Report submissions.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => fetchReports({ silent: true })} disabled={refreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ReportStatus | "all")}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {(Object.keys(STATUS_META) as ReportStatus[]).map((status) => (
                  <SelectItem key={status} value={status}>
                    {STATUS_META[status].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as "newest" | "oldest")}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full md:w-[220px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from
                    ? dateRange.to
                      ? `${format(dateRange.from, "dd MMM")} - ${format(dateRange.to, "dd MMM")}`
                      : format(dateRange.from, "dd MMM yyyy")
                    : "Date Range"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
                {dateRange && (
                  <div className="border-t p-2">
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => setDateRange(undefined)}>
                      Clear
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>

        {/* Bulk action toolbar */}
        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/50 p-3">
            <span className="text-sm font-medium">{selectedIds.size} selected</span>
            <Button variant="outline" size="sm" onClick={handleBulkDownload}>
              <Download className="mr-1.5 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handleBulkExportCsv}>
              Export CSV
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Change Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(Object.keys(STATUS_META) as ReportStatus[]).map((s) => (
                  <DropdownMenuItem key={s} onClick={() => handleBulkStatusChange(s)}>
                    {STATUS_META[s].label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="destructive" size="sm" onClick={() => setConfirmBulkDelete(true)}>
              <Trash2 className="mr-1.5 h-4 w-4" />
              Delete
            </Button>
            <Button variant="ghost" size="sm" className="ml-auto" onClick={clearSelection}>
              <X className="mr-1 h-4 w-4" />
              Clear
            </Button>
          </div>
        )}

        {/* Select all (only meaningful once there's a list to select from) */}
        {!loading && !emptyState && (
          <div className="flex items-center gap-2 px-1">
            <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} id="select-all" />
            <Label htmlFor="select-all" className="cursor-pointer text-sm text-muted-foreground">
              Select all on this page
            </Label>
          </div>
        )}

        {/* Listing */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="space-y-3 p-5">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : emptyState ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 p-16 text-center">
              <FileX2 className="h-14 w-14 text-muted-foreground" />
              <h3 className="text-lg font-medium">No Name Check Reports Found</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Try adjusting your search or filters, or generate a new report to get started.
              </p>
              <Button onClick={() => setCreateOpen(true)} className="mt-2">
                <Plus className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reports.map((report) => (
              <Card key={report.id} className="flex flex-col justify-between">
                <CardContent className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <Checkbox
                        checked={selectedIds.has(report.id)}
                        onCheckedChange={() => toggleSelect(report.id)}
                        className="mt-1"
                      />
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {report.report_id}
                        </p>
                        <h3 className="text-base font-semibold leading-tight">{report.customer_name}</h3>
                      </div>
                    </div>
                    <Badge variant="outline" className={STATUS_META[report.status].badgeClass}>
                      {STATUS_META[report.status].label}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
                    <div className="col-span-2 truncate text-muted-foreground">{report.email}</div>
                    <div className="text-muted-foreground">{report.phone || "—"}</div>
                    <div className="text-muted-foreground">{report.gender || "—"}</div>
                    <div className="text-muted-foreground">DOB: {formatDate(report.dob)}</div>
                    <div className="text-muted-foreground">Created: {formatDate(report.created_at)}</div>
                    <div className="col-span-2 truncate text-muted-foreground">
                      Generated by: {report.generated_by || "—"}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    {report.pdf_url ? (
                      <span className="inline-flex items-center gap-1 text-green-700">
                        <BadgeCheck className="h-3.5 w-3.5" /> Report Generated
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <FileX2 className="h-3.5 w-3.5" /> Not Generated
                      </span>
                    )}
                  </div>
                </CardContent>

                <div className="flex flex-wrap items-center gap-1.5 border-t p-3">
                  <Button variant="ghost" size="icon" title="Preview" onClick={() => openPreview(report)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Edit customer details" onClick={() => openEditDialog(report)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    title={report.pdf_url ? "Regenerate PDF" : "Generate PDF"}
                    onClick={() => handleGeneratePdfClick(report)}
                    disabled={generatingId === report.id}
                  >
                    {generatingId === report.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileCog className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Download PDF"
                    onClick={() => handleDownloadPdf(report)}
                    disabled={!report.pdf_url}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Print"
                    onClick={() => handlePrint(report)}
                    disabled={!report.pdf_url}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" title="More" className="ml-auto">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                      {(Object.keys(STATUS_META) as ReportStatus[]).map((status) => (
                        <DropdownMenuItem
                          key={status}
                          disabled={status === report.status}
                          onClick={() => handleChangeStatus(report, status)}
                        >
                          {STATUS_META[status].label}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => setDeleteTarget(report)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !emptyState && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages} &middot; {totalCount} report{totalCount === 1 ? "" : "s"}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Unified Report Dialog — PREVIEW (viewMode="details") or the content
          EDIT form (viewMode="edit"), for `viewTarget`. "Edit Report Content"
          from inside the preview switches this same dialog into edit mode;
          saving switches it straight back to a refreshed preview. */}
      <Dialog
        open={!!viewTarget}
        onOpenChange={(open) => {
          if (!open) {
            setViewTarget(null);
            setViewMode("details");
            setContentEditForm(null);
            setPreviewUrl(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewMode === "edit" ? (
                <>
                  <FileEdit className="h-5 w-5" /> Edit Report Content
                </>
              ) : (
                <>
                  <FileSearch className="h-5 w-5" /> Report Preview
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {viewTarget?.report_id}
              {viewMode === "edit" && " — corrects what actually appears in the PDF. Saving regenerates it immediately."}
            </DialogDescription>
          </DialogHeader>

          {viewMode === "details" && viewTarget && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Customer Name</p>
                  <p className="font-medium">{viewTarget.customer_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant="outline" className={STATUS_META[viewTarget.status].badgeClass}>
                    {STATUS_META[viewTarget.status].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{viewTarget.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{viewTarget.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{formatDate(viewTarget.dob)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Gender</p>
                  <p className="font-medium">{viewTarget.gender || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Generated By</p>
                  <p className="font-medium">{viewTarget.generated_by || "—"}</p>
                </div>
              </div>

              {previewUrl ? (
                <div className="overflow-hidden rounded-md border" style={{ height: 480 }}>
                  <iframe src={previewUrl} title="PDF Preview" className="h-full w-full" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
                  <FileX2 className="h-8 w-8" />
                  No PDF generated yet for this report.
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button variant="outline" onClick={() => enterContentEditMode(viewTarget)}>
                  <FileEdit className="mr-2 h-4 w-4" />
                  Edit Report Content
                </Button>
                {viewTarget.pdf_url && (
                  <>
                    <Button variant="outline" onClick={() => handleDownloadPdf(viewTarget)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="outline" onClick={() => handlePrint(viewTarget)}>
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {viewMode === "edit" && (
            <>
              {loadingContentEdit || !contentEditForm ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Numbers */}
                  <div>
                    <Label className="text-sm font-semibold">Core Numbers</Label>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {(
                        [
                          ["mulank", "Mulank"],
                          ["bhagyank", "Bhagyank"],
                          ["firstNameNumber", "First Name No."],
                          ["firstNameSum", "First Name Total"],
                          ["fullNameNumber", "Full Name No."],
                          ["fullNameSum", "Full Name Total"],
                          ["fullNameCompound", "Compound No."],
                        ] as const
                      ).map(([field, label]) => (
                        <div key={field}>
                          <Label className="text-xs text-muted-foreground">{label}</Label>
                          <Input
                            type="number"
                            value={contentEditForm[field]}
                            onChange={(e) =>
                              setContentEditForm((prev) =>
                                prev ? { ...prev, [field]: Number(e.target.value) } : prev
                              )
                            }
                          />
                        </div>
                      ))}
                      <div>
                        <Label className="text-xs text-muted-foreground">Compound Tier</Label>
                        <Select
                          value={contentEditForm.compoundTier}
                          onValueChange={(v) =>
                            setContentEditForm((prev) => (prev ? { ...prev, compoundTier: v as NameCheckReportContent["compoundTier"] } : prev))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["excellent", "good", "neutral", "conditional", "avoid"].map((tier) => (
                              <SelectItem key={tier} value={tier}>
                                {tier.charAt(0).toUpperCase() + tier.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* First Name analysis */}
                  <div>
                    <Label className="text-sm font-semibold">First Name Number — "What This Represents"</Label>
                    <div className="space-y-2 mt-2">
                      {contentEditForm.firstNameAnalysis.map((para, i) => (
                        <Textarea
                          key={i}
                          value={para}
                          rows={2}
                          onChange={(e) => updateContentParagraph("firstNameAnalysis", i, e.target.value)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Full Name analysis */}
                  <div>
                    <Label className="text-sm font-semibold">Full Name Number — "What This Represents"</Label>
                    <div className="space-y-2 mt-2">
                      {contentEditForm.fullNameAnalysis.map((para, i) => (
                        <Textarea
                          key={i}
                          value={para}
                          rows={2}
                          onChange={(e) => updateContentParagraph("fullNameAnalysis", i, e.target.value)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Compound analysis */}
                  <div>
                    <Label className="text-sm font-semibold">Compound Number — "What This Represents"</Label>
                    <div className="space-y-2 mt-2">
                      {contentEditForm.compoundAnalysis.map((para, i) => (
                        <Textarea
                          key={i}
                          value={para}
                          rows={2}
                          onChange={(e) => updateContentParagraph("compoundAnalysis", i, e.target.value)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Verdict */}
                  <div>
                    <Label className="text-sm font-semibold">Why This Is Critical</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Verdict</Label>
                        <Select
                          value={contentEditForm.verdict}
                          onValueChange={(v) =>
                            setContentEditForm((prev) => (prev ? { ...prev, verdict: v as NameCheckReportContent["verdict"] } : prev))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="HR">Highly Recommended</SelectItem>
                            <SelectItem value="OA">Optional / Advisable</SelectItem>
                            <SelectItem value="NR">Not Required</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2 mt-3">
                      <Label className="text-xs text-muted-foreground">Bullets</Label>
                      {contentEditForm.verdictBullets.map((para, i) => (
                        <Textarea
                          key={i}
                          value={para}
                          rows={2}
                          onChange={(e) => updateContentParagraph("verdictBullets", i, e.target.value)}
                        />
                      ))}
                      <Label className="text-xs text-muted-foreground">Closing verdict line (shown in the maroon badge)</Label>
                      <Textarea
                        value={contentEditForm.verdictNote}
                        rows={2}
                        onChange={(e) =>
                          setContentEditForm((prev) => (prev ? { ...prev, verdictNote: e.target.value } : prev))
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <DialogFooter>
            {viewMode === "edit" ? (
              <>
                <Button variant="outline" onClick={backToPreview} disabled={savingContentEdit}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Preview
                </Button>
                <Button onClick={handleSaveContentEdit} disabled={savingContentEdit || loadingContentEdit || !contentEditForm}>
                  {savingContentEdit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save & Regenerate PDF
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setViewTarget(null);
                  setPreviewUrl(null);
                }}
              >
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog (customer input fields — name, DOB, gender, etc.) */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Report</DialogTitle>
            <DialogDescription>{editTarget?.report_id}</DialogDescription>
          </DialogHeader>
          <ReportForm values={editForm} onChange={setEditForm} includeStatus />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={savingEdit}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={savingEdit}>
              {savingEdit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create / Generate Report Dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => !open && setCreateOpen(false)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate New Report</DialogTitle>
            <DialogDescription>Create a new Name Check Report submission.</DialogDescription>
          </DialogHeader>
          <ReportForm values={createForm} onChange={setCreateForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button onClick={handleCreateReport} disabled={creating}>
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this report?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the report for{" "}
              <span className="font-medium">{deleteTarget?.customer_name}</span> ({deleteTarget?.report_id}). This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={confirmBulkDelete} onOpenChange={setConfirmBulkDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} reports?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} disabled={bulkDeleting} className="bg-red-600 hover:bg-red-700">
              {bulkDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Regenerate PDF Confirmation */}
      <AlertDialog open={!!regenerateTarget} onOpenChange={(open) => !open && setRegenerateTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate PDF report?</AlertDialogTitle>
            <AlertDialogDescription>
              A PDF already exists for <span className="font-medium">{regenerateTarget?.customer_name}</span> (
              {regenerateTarget?.report_id}). Regenerating will replace the existing file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!generatingId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => regenerateTarget && runGeneratePdf(regenerateTarget)}
              disabled={!!generatingId}
            >
              {generatingId && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Regenerate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPage>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared create/edit form                                            */
/* ------------------------------------------------------------------ */

function ReportForm({
  values,
  onChange,
  includeStatus,
}: {
  values: ReportFormValues;
  onChange: (values: ReportFormValues) => void;
  includeStatus?: boolean;
}) {
  const set = <K extends keyof ReportFormValues>(key: K, value: ReportFormValues[K]) =>
    onChange({ ...values, [key]: value });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="first_name">First Name</Label>
        <Input
          id="first_name"
          value={values.first_name}
          onChange={(e) => set("first_name", e.target.value)}
          placeholder="First name"
        />
      </div>
      <div>
        <Label htmlFor="last_name">Last Name</Label>
        <Input
          id="last_name"
          value={values.last_name}
          onChange={(e) => set("last_name", e.target.value)}
          placeholder="Last name"
        />
      </div>
      <div>
        <Label htmlFor="middle_name">Middle Name</Label>
        <Input
          id="middle_name"
          value={values.middle_name}
          onChange={(e) => {
            const next = e.target.value;
            set("middle_name", next);
            // Field only makes sense when there's a middle name to classify —
            // clear any stale "Yes" so it can't be silently submitted once
            // the middle name is emptied out again.
            if (!next.trim() && values.is_middle_name_father_husband) {
              set("is_middle_name_father_husband", false);
            }
          }}
          placeholder="Middle name"
        />
      </div>
      {values.middle_name.trim().length > 0 && (
        <div>
          <Label htmlFor="is_middle_name_father_husband">Is Middle Name Father's / Husband's Name?</Label>
          <Select
            value={values.is_middle_name_father_husband ? "yes" : "no"}
            onValueChange={(v) => set("is_middle_name_father_husband", v === "yes")}
          >
            <SelectTrigger id="is_middle_name_father_husband">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="yes">Yes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="name@example.com"
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" value={values.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91..." />
      </div>
      <div>
        <Label htmlFor="dob">Date of Birth</Label>
        <Input id="dob" type="date" value={values.dob} onChange={(e) => set("dob", e.target.value)} />
      </div>
      <div>
        <Label htmlFor="gender">Gender</Label>
        <Select value={values.gender} onValueChange={(v) => set("gender", v)}>
          <SelectTrigger id="gender">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {includeStatus && (
        <div className="sm:col-span-2">
          <Label htmlFor="status">Status</Label>
          <Select value={values.status} onValueChange={(v) => set("status", v as ReportStatus)}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(STATUS_META) as ReportStatus[]).map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_META[status].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
