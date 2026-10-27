
// import { useCallback, useEffect, useMemo, useState } from "react";
// import { Link } from "react-router-dom";
// import {
//   Plus, Loader2, Trash2, Pencil, FileCog, Download, Printer, Mail, Eye, MoreVertical, RefreshCw, Search,
//   Calendar as CalendarIcon, BadgeCheck, FileX2, ChevronLeft, ChevronRight, X,
// } from "lucide-react";
// import { format } from "date-fns";
// import type { DateRange } from "react-day-picker";

// import { AdminPage } from "@/components/admin/AdminPage";
// import { legacyDatabase as supabase } from "@/lib/legacy-database-client";
// import { useToast } from "@/hooks/use-toast";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Textarea } from "@/components/ui/textarea";
// import { Calendar } from "@/components/ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import {
//   DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import {
//   AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
//   AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
// } from "@/components/ui/alert-dialog";

// import { generateCompleteBabyBlueprintReportPdf, completeBabyBlueprintReportPdfToBlob } from "@/components/CompleteBabyBlueprintReportGenerator";
// import {
//   BABY_NAME_PREFERENCE_OPTIONS, EMPTY_BABY_FORM, buildBabyCustomerName, normaliseAlphabet, validateBabyForm,
//   type BabyNamePreference, type BabyReportFormValues, type BabyReportStatus,
// } from "@/lib/baby-reports/complete-baby-blueprint/form";

// const TABLE_NAME = "complete_baby_blueprint_reports";
// const STORAGE_BUCKET = "complete-baby-blueprint-reports";
// const PROFILES_TABLE = "profiles";
// const PAGE_SIZE = 10;
// const DRAFT_KEY = "complete-baby-blueprint-create-report-draft";

// interface BabyReportRow {
//   id: string;
//   report_id: string;
//   customer_name: string;
//   first_name: string | null;
//   middle_name: string | null;
//   last_name: string | null;
//   father_name?: string | null;
//   is_middle_name_father_husband: boolean;
//   gender: string | null;
//   email: string;
//   phone: string | null;
//   dob: string;
//   first_alphabet: string;
//   option1_name: string;
//   option2_name: string;
//   nick_name: string | null;
//   preference: BabyNamePreference;
//   status: BabyReportStatus;
//   pdf_url: string | null;
//   generated_by?: string | null;
//   created_at: string;
// }

// const STATUS_BADGE: Record<BabyReportStatus, string> = {
//   draft: "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-100",
//   generating: "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100",
//   completed: "bg-green-100 text-green-800 border-green-300 hover:bg-green-100",
//   failed: "bg-red-100 text-red-800 border-red-300 hover:bg-red-100",
//   archived: "bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-200",
// };

// const STATUS_LABEL: Record<BabyReportStatus, string> = {
//   draft: "Draft", generating: "Generating", completed: "Completed", failed: "Failed", archived: "Archived",
// };

// function generateReportId() {
//   return `CBB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
// }

// function loadDraft(): BabyReportFormValues {
//   try {
//     const raw = window.localStorage.getItem(DRAFT_KEY);
//     return raw ? { ...EMPTY_BABY_FORM, ...JSON.parse(raw) } : EMPTY_BABY_FORM;
//   } catch {
//     return EMPTY_BABY_FORM;
//   }
// }

// function rowToForm(r: BabyReportRow): BabyReportFormValues {
//   return {
//     first_name: r.first_name ?? "",
//     middle_name: r.middle_name ?? "",
//     is_middle_name_father_husband: r.is_middle_name_father_husband,
//     last_name: r.last_name ?? "",
//     father_name: r.father_name ?? "",
//     gender: r.gender ?? "",
//     email: r.email,
//     phone: r.phone ?? "",
//     dob: r.dob,
//     first_alphabet: r.first_alphabet,
//     option1_name: r.option1_name,
//     option2_name: r.option2_name,
//     nick_name: r.nick_name ?? "",
//     preference: r.preference,
//     status: r.status,
//   };
// }

// function formToColumns(v: BabyReportFormValues) {
//   return {
//     customer_name: buildBabyCustomerName(v),
//     first_name: v.first_name.trim(),
//     middle_name: v.middle_name.trim() || null,
//     last_name: v.last_name.trim() || null,
//     father_name: v.father_name.trim() || null,
//     is_middle_name_father_husband: v.middle_name.trim() ? v.is_middle_name_father_husband : false,
//     gender: v.gender,
//     email: v.email.trim(),
//     phone: v.phone.trim(),
//     dob: v.dob,
//     first_alphabet: v.first_alphabet,
//     option1_name: v.option1_name.trim(),
//     option2_name: v.option2_name.trim(),
//     nick_name: v.nick_name.trim() || null,
//     preference: v.preference,
//     status: v.status,
//   };
// }

// /** The "Generate Report" form — field order follows the client's list. */
// function BabyReportForm({ values, onChange, includeStatus }: {
//   values: BabyReportFormValues;
//   onChange: (v: BabyReportFormValues) => void;
//   includeStatus?: boolean;
// }) {
//   const set = <K extends keyof BabyReportFormValues>(key: K, value: BabyReportFormValues[K]) =>
//     onChange({ ...values, [key]: value });
//   const hasMiddle = values.middle_name.trim().length > 0;

//   return (
//     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//       <div>
//         <Label htmlFor="pbn_first_name">First Name</Label>
//         <Input id="pbn_first_name" value={values.first_name} onChange={(e) => set("first_name", e.target.value)} placeholder="First name" />
//       </div>
//       <div>
//         <Label htmlFor="pbn_middle_name">Middle Name</Label>
//         <Input
//           id="pbn_middle_name"
//           value={values.middle_name}
//           onChange={(e) => {
//             const next = e.target.value;
//             onChange({ ...values, middle_name: next, is_middle_name_father_husband: next.trim() ? values.is_middle_name_father_husband : false });
//           }}
//           placeholder="Middle name"
//         />
//       </div>
//       {hasMiddle && (
//         <div className="sm:col-span-2">
//           <Label htmlFor="pbn_is_father">Is Middle Name Father's / Husband's Name?</Label>
//           <Select value={values.is_middle_name_father_husband ? "yes" : "no"} onValueChange={(v) => set("is_middle_name_father_husband", v === "yes")}>
//             <SelectTrigger id="pbn_is_father"><SelectValue /></SelectTrigger>
//             <SelectContent>
//               <SelectItem value="no">No</SelectItem>
//               <SelectItem value="yes">Yes</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       )}
//       <div>
//         <Label htmlFor="pbn_last_name">Last Name</Label>
//         <Input id="pbn_last_name" value={values.last_name} onChange={(e) => set("last_name", e.target.value)} placeholder="Last name" />
//       </div>
//       <div className="sm:col-span-2">
//         <Label htmlFor="pbn_father_name">Father's Name</Label>
//         <Input id="pbn_father_name" value={values.father_name} onChange={(e) => set("father_name", e.target.value)} placeholder="Father's name (shown on the Personal Information page)" />
//       </div>
//       <div>
//         <Label htmlFor="pbn_gender">Gender</Label>
//         <Select value={values.gender} onValueChange={(v) => set("gender", v)}>
//           <SelectTrigger id="pbn_gender"><SelectValue placeholder="Select gender" /></SelectTrigger>
//           <SelectContent>
//             <SelectItem value="Male">Male</SelectItem>
//             <SelectItem value="Female">Female</SelectItem>
//             <SelectItem value="Other">Other</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>
//       <div>
//         <Label htmlFor="pbn_email">Email</Label>
//         <Input id="pbn_email" type="email" value={values.email} onChange={(e) => set("email", e.target.value)} placeholder="name@example.com" />
//       </div>
//       <div>
//         <Label htmlFor="pbn_phone">WhatsApp Number</Label>
//         <Input id="pbn_phone" value={values.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91..." />
//       </div>
//       <div>
//         <Label htmlFor="pbn_dob">DOB</Label>
//         <Input id="pbn_dob" type="date" value={values.dob} onChange={(e) => set("dob", e.target.value)} />
//       </div>
//       <div>
//         <Label htmlFor="pbn_first_alphabet">First Alphabet</Label>
//         <Input
//           id="pbn_first_alphabet"
//           value={values.first_alphabet}
//           maxLength={1}
//           onChange={(e) => set("first_alphabet", normaliseAlphabet(e.target.value))}
//           placeholder="A–Z"
//           className="uppercase"
//         />
//       </div>
//       <div className="sm:col-span-2">
//         <Label htmlFor="pbn_option1">Option 1: First Name + Middle &amp; Last Name</Label>
//         <Input id="pbn_option1" value={values.option1_name} onChange={(e) => set("option1_name", e.target.value)} placeholder="Full name, e.g. Shanvi S Das" />
//       </div>
//       <div className="sm:col-span-2">
//         <Label htmlFor="pbn_option2">Option 2: First Name + Middle &amp; Last Name</Label>
//         <Input id="pbn_option2" value={values.option2_name} onChange={(e) => set("option2_name", e.target.value)} placeholder="Full name, e.g. Shanvi Dass" />
//       </div>
//       <div className="sm:col-span-2">
//         <Label htmlFor="pbn_nick_name">Nick Name (optional)</Label>
//         <Input id="pbn_nick_name" value={values.nick_name} onChange={(e) => set("nick_name", e.target.value)} placeholder="e.g. Shanu — leave empty to skip the Nick Name page" />
//         <p className="mt-1 text-xs text-muted-foreground">If filled, the report includes the Nick Name Recommendation page (page 22). If empty, that page is left out.</p>
//       </div>
//       <div className="sm:col-span-2">
//         <Label htmlFor="pbn_preference">Preference</Label>
//         <Select value={values.preference} onValueChange={(v) => set("preference", v as BabyNamePreference)}>
//           <SelectTrigger id="pbn_preference"><SelectValue placeholder="Select preference" /></SelectTrigger>
//           <SelectContent>
//             {BABY_NAME_PREFERENCE_OPTIONS.map((o) => (
//               <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>
//       {includeStatus && (
//         <div className="sm:col-span-2">
//           <Label htmlFor="pbn_status">Status</Label>
//           <Select value={values.status} onValueChange={(v) => set("status", v as BabyReportStatus)}>
//             <SelectTrigger id="pbn_status"><SelectValue /></SelectTrigger>
//             <SelectContent>
//               {(Object.keys(STATUS_LABEL) as BabyReportStatus[]).map((s) => (
//                 <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//       )}
//     </div>
//   );
// }

// function formatDate(value: string | null | undefined) {
//   if (!value) return "—";
//   const d = new Date(value);
//   if (isNaN(d.getTime())) return value;
//   return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
// }

// function withCacheBust(url: string | null): string | null {
//   if (!url) return null;
//   return `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`;
// }

// function errMsg(err: unknown, fallback: string): string {
//   if (err instanceof Error) return err.message;
//   if (err && typeof err === "object" && "message" in err && typeof (err as { message?: unknown }).message === "string") {
//     return (err as { message: string }).message;
//   }
//   return fallback;
// }

// async function getCurrentAdminId(): Promise<string | null> {
//   try {
//     const { data } = await supabase.auth.getUser();
//     return data.user?.id ?? null;
//   } catch {
//     return null;
//   }
// }

// /** Download name: "<Option 1 name>_Complete Baby Blueprint_Ankshaastra.pdf" */
// function buildDownloadFilename(r: BabyReportRow): string {
//   const base = (r.option1_name || r.customer_name || "Report").replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, " ").trim() || "Report";
//   return `${base}_Complete Baby Blueprint_Ankshaastra.pdf`;
// }

// export default function CompleteBabyBlueprintReports() {
//   const { toast } = useToast();

//   const [rows, setRows] = useState<BabyReportRow[]>([]);
//   const [totalCount, setTotalCount] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const [searchTerm, setSearchTerm] = useState("");
//   const [debouncedSearch, setDebouncedSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState<BabyReportStatus | "all">("all");
//   const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
//   const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
//   const [page, setPage] = useState(1);
//   const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

//   const [createOpen, setCreateOpen] = useState(false);
//   const [createForm, setCreateForm] = useState<BabyReportFormValues>(() => loadDraft());
//   const [editTarget, setEditTarget] = useState<BabyReportRow | null>(null);
//   const [editForm, setEditForm] = useState<BabyReportFormValues>(EMPTY_BABY_FORM);
//   const [deleteTarget, setDeleteTarget] = useState<BabyReportRow | null>(null);
//   const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
//   const [regenerateTarget, setRegenerateTarget] = useState<BabyReportRow | null>(null);
//   const [saving, setSaving] = useState(false);
//   const [generatingId, setGeneratingId] = useState<string | null>(null);

//   const [viewTarget, setViewTarget] = useState<BabyReportRow | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);

//   const [emailTarget, setEmailTarget] = useState<BabyReportRow | null>(null);
//   const [emailTo, setEmailTo] = useState("");
//   const [emailSubject, setEmailSubject] = useState("");
//   const [emailMessage, setEmailMessage] = useState("");
//   const [sendingEmail, setSendingEmail] = useState(false);

//   const [generatedByNames, setGeneratedByNames] = useState<Record<string, string>>({});

//   useEffect(() => {
//     const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350);
//     return () => clearTimeout(t);
//   }, [searchTerm]);
//   useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter, sortOrder, dateRange]);
//   useEffect(() => { setSelectedIds(new Set()); }, [page, debouncedSearch, statusFilter, sortOrder, dateRange]);

//   // keep the in-progress "Generate Report" form across reloads
//   useEffect(() => {
//     try { window.localStorage.setItem(DRAFT_KEY, JSON.stringify(createForm)); } catch { /* ignore */ }
//   }, [createForm]);

//   const resolveGeneratedByNames = useCallback(async (ids: (string | null | undefined)[]) => {
//     const unique = Array.from(new Set(ids.filter((id): id is string => !!id)));
//     if (unique.length === 0) return;
//     try {
//       const { data, error } = await supabase.from(PROFILES_TABLE).select("user_id, full_name").in("user_id", unique);
//       if (error || !data) return;
//       setGeneratedByNames((prev) => {
//         const next = { ...prev };
//         for (const row of data as { user_id: string; full_name: string | null }[]) next[row.user_id] = row.full_name || "Unknown";
//         return next;
//       });
//     } catch { /* non-critical */ }
//   }, []);

//   const generatedByLabel = (id: string | null | undefined): string => (!id ? "—" : generatedByNames[id] ?? "…");

//   const fetchRows = useCallback(async (opts?: { silent?: boolean }) => {
//     opts?.silent ? setRefreshing(true) : setLoading(true);
//     try {
//       const from = (page - 1) * PAGE_SIZE;
//       const to = from + PAGE_SIZE - 1;
//       let query = supabase.from(TABLE_NAME).select("*", { count: "exact" });
//       if (debouncedSearch) {
//         const term = debouncedSearch.replace(/%/g, "");
//         query = query.or(`customer_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%,report_id.ilike.%${term}%`);
//       }
//       if (statusFilter !== "all") query = query.eq("status", statusFilter);
//       if (dateRange?.from) query = query.gte("created_at", dateRange.from.toISOString());
//       if (dateRange?.to) {
//         const end = new Date(dateRange.to);
//         end.setHours(23, 59, 59, 999);
//         query = query.lte("created_at", end.toISOString());
//       }
//       query = query.order("created_at", { ascending: sortOrder === "oldest" }).range(from, to);
//       const { data, error, count } = await query;
//       if (error) throw error;
//       const list = (data ?? []) as BabyReportRow[];
//       setRows(list);
//       setTotalCount(count ?? 0);
//       resolveGeneratedByNames(list.map((r) => r.generated_by));
//     } catch (err) {
//       console.error(err);
//       toast({ title: "Could not load reports", description: errMsg(err, "Unexpected error while fetching reports."), variant: "destructive" });
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [page, debouncedSearch, statusFilter, sortOrder, dateRange, resolveGeneratedByNames]);

//   useEffect(() => { fetchRows(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [page, debouncedSearch, statusFilter, sortOrder, dateRange]);

//   const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
//   const emptyState = useMemo(() => !loading && rows.length === 0, [loading, rows]);

//   /* ---------------------------- Actions ---------------------------- */

//   const handleCreate = async () => {
//     const problem = validateBabyForm(createForm);
//     if (problem) {
//       toast({ title: "Missing details", description: problem, variant: "destructive" });
//       return;
//     }
//     setSaving(true);
//     const { error } = await supabase.from(TABLE_NAME).insert({ report_id: generateReportId(), ...formToColumns(createForm), pdf_url: null });
//     setSaving(false);
//     if (error) {
//       toast({ title: "Could not create report", description: error.message, variant: "destructive" });
//       return;
//     }
//     toast({ title: "Report created", description: "Complete Baby Blueprint Report submission added." });
//     setCreateOpen(false);
//     setCreateForm(EMPTY_BABY_FORM);
//     try { window.localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
//     fetchRows({ silent: true });
//   };

//   const handleSaveEdit = async () => {
//     if (!editTarget) return;
//     const problem = validateBabyForm(editForm);
//     if (problem) {
//       toast({ title: "Missing details", description: problem, variant: "destructive" });
//       return;
//     }
//     setSaving(true);
//     const { error } = await supabase.from(TABLE_NAME).update({ ...formToColumns(editForm), updated_at: new Date().toISOString() }).eq("id", editTarget.id);
//     setSaving(false);
//     if (error) {
//       toast({ title: "Could not save changes", description: error.message, variant: "destructive" });
//       return;
//     }
//     toast({ title: "Report updated" });
//     setEditTarget(null);
//     fetchRows({ silent: true });
//   };

//   const handleChangeStatus = async (r: BabyReportRow, status: BabyReportStatus) => {
//     const { error } = await supabase.from(TABLE_NAME).update({ status, updated_at: new Date().toISOString() }).eq("id", r.id);
//     if (error) {
//       toast({ title: "Could not change status", description: error.message, variant: "destructive" });
//       return;
//     }
//     toast({ title: "Status updated", description: `${r.report_id} → ${STATUS_LABEL[status]}` });
//     fetchRows({ silent: true });
//   };

//   const handleDelete = async () => {
//     if (!deleteTarget) return;
//     const { error } = await supabase.from(TABLE_NAME).delete().eq("id", deleteTarget.id);
//     if (error) {
//       toast({ title: "Could not delete report", description: error.message, variant: "destructive" });
//     } else {
//       toast({ title: "Report deleted" });
//       fetchRows({ silent: true });
//     }
//     setDeleteTarget(null);
//   };

//   const openPreview = (r: BabyReportRow) => {
//     setViewTarget(r);
//     setPreviewUrl(withCacheBust(r.pdf_url));
//   };

//   const runGeneratePdf = async (r: BabyReportRow) => {
//     setGeneratingId(r.id);
//     try {
//       const bytes = await generateCompleteBabyBlueprintReportPdf({
//         reportId: r.report_id,
//         customerName: r.customer_name,
//         firstName: r.first_name ?? "",
//         middleName: r.middle_name ?? "",
//         lastName: r.last_name ?? "",
//         fatherName: r.father_name ?? "",
//         isMiddleNameFatherHusband: r.is_middle_name_father_husband,
//         gender: r.gender ?? "",
//         email: r.email,
//         phone: r.phone ?? "",
//         dob: r.dob,
//         firstAlphabet: r.first_alphabet,
//         option1Name: r.option1_name,
//         option2Name: r.option2_name,
//         nickName1: r.nick_name ?? "",
//         preference: r.preference,
//       });

//       const blob = completeBabyBlueprintReportPdfToBlob(bytes);
//       const filePath = `${r.report_id}.pdf`;
//       const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, blob, { contentType: "application/pdf", upsert: true });
//       if (uploadError) throw uploadError;
//       const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
//       const pdfUrl = publicUrlData?.publicUrl ?? null;
//       const generatedById = await getCurrentAdminId();

//       const { error: updateError } = await supabase
//         .from(TABLE_NAME)
//         .update({ pdf_url: pdfUrl, status: "completed", generated_by: generatedById, updated_at: new Date().toISOString() })
//         .eq("id", r.id);
//       if (updateError) throw updateError;

//       toast({ title: "PDF generated", description: `Report ${r.report_id} is ready to review.` });
//       resolveGeneratedByNames([generatedById]);
//       openPreview({ ...r, pdf_url: pdfUrl, status: "completed", generated_by: generatedById });
//       fetchRows({ silent: true });
//     } catch (err) {
//       console.error("[CompleteBabyBlueprintReports] PDF generation failed:", err);
//       toast({ title: "PDF generation failed", description: errMsg(err, "Unexpected error while generating the PDF."), variant: "destructive" });
//     } finally {
//       setGeneratingId(null);
//       setRegenerateTarget(null);
//     }
//   };

//   const handleGeneratePdfClick = (r: BabyReportRow) => {
//     if (r.pdf_url) setRegenerateTarget(r);
//     else runGeneratePdf(r);
//   };

//   const handleDownloadPdf = async (r: BabyReportRow) => {
//     if (!r.pdf_url) {
//       toast({ title: "No PDF available", description: "Generate the PDF for this report first.", variant: "destructive" });
//       return;
//     }
//     try {
//       const res = await fetch(r.pdf_url);
//       if (!res.ok) throw new Error(`Failed to fetch PDF (${res.status})`);
//       const blobUrl = URL.createObjectURL(await res.blob());
//       const link = document.createElement("a");
//       link.href = blobUrl;
//       link.download = buildDownloadFilename(r);
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       URL.revokeObjectURL(blobUrl);
//     } catch (err) {
//       toast({ title: "Download failed", description: errMsg(err, "Could not download the PDF."), variant: "destructive" });
//     }
//   };

//   const handlePrint = (r: BabyReportRow) => {
//     if (!r.pdf_url) {
//       toast({ title: "No PDF available", description: "Generate the PDF for this report first.", variant: "destructive" });
//       return;
//     }
//     const win = window.open(r.pdf_url, "_blank");
//     if (win) win.addEventListener("load", () => win.print());
//   };

//   const openEmailDialog = (r: BabyReportRow) => {
//     setEmailTarget(r);
//     setEmailTo(r.email || "");
//     setEmailSubject(`Your Complete Baby Blueprint Report — ${r.report_id}`);
//     setEmailMessage(
//       "Namaste, 🙏\n\nPlease find attached the Complete Baby Blueprint Report prepared based on the baby's Date of Birth and numerology analysis.\n\nIt shares the recommended name options and what each of them brings to your child's life.\n\nKindly review it at your convenience.\n\nIf you would like the report to be explained over a phone call, you may request the same.\n\nWarm Regards,\nAnkshaastra – Empower Your Name",
//     );
//   };

//   const closeEmailDialog = () => {
//     setEmailTarget(null);
//     setEmailTo("");
//     setEmailSubject("");
//     setEmailMessage("");
//   };

//   const confirmSendEmail = async () => {
//     if (!emailTarget) return;
//     if (!emailTo.trim()) { toast({ title: "Recipient email is required", variant: "destructive" }); return; }
//     if (!emailSubject.trim()) { toast({ title: "Subject is required", variant: "destructive" }); return; }
//     setSendingEmail(true);
//     try {
//       const { data: sessionData } = await supabase.auth.getSession();
//       const token = sessionData.session?.access_token;
//       if (!token) throw new Error("Please sign in again");
//       const res = await fetch("/api/complete-baby-blueprint-reports/send-email", {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//         body: JSON.stringify({ reportId: emailTarget.id, to: emailTo.trim(), subject: emailSubject.trim(), message: emailMessage, attachPdf: true }),
//       });
//       const result = await res.json().catch(() => ({}));
//       if (!res.ok) throw new Error(result.error || "Could not send report email");
//       toast({ title: "Email sent", description: `Report ${emailTarget.report_id} was emailed to ${emailTo.trim()}.` });
//       closeEmailDialog();
//     } catch (err) {
//       toast({ title: "Could not send email", description: errMsg(err, "Unexpected error."), variant: "destructive" });
//     } finally {
//       setSendingEmail(false);
//     }
//   };

//   /* ----------------------------- Selection ----------------------------- */

//   const toggleSelect = (id: string) =>
//     setSelectedIds((prev) => {
//       const next = new Set(prev);
//       if (next.has(id)) next.delete(id); else next.add(id);
//       return next;
//     });
//   const allSelected = rows.length > 0 && selectedIds.size === rows.length;
//   const toggleSelectAll = () => setSelectedIds(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
//   const clearSelection = () => setSelectedIds(new Set());

//   const handleBulkDelete = async () => {
//     const ids = Array.from(selectedIds);
//     const { error } = await supabase.from(TABLE_NAME).delete().in("id", ids);
//     if (error) toast({ title: "Could not delete reports", description: error.message, variant: "destructive" });
//     else toast({ title: `${ids.length} report${ids.length === 1 ? "" : "s"} deleted` });
//     setConfirmBulkDelete(false);
//     clearSelection();
//     fetchRows({ silent: true });
//   };

//   const handleBulkStatusChange = async (status: BabyReportStatus) => {
//     const ids = Array.from(selectedIds);
//     const { error } = await supabase.from(TABLE_NAME).update({ status, updated_at: new Date().toISOString() }).in("id", ids);
//     if (error) toast({ title: "Could not change status", description: error.message, variant: "destructive" });
//     else toast({ title: "Status updated", description: `${ids.length} report${ids.length === 1 ? "" : "s"} → ${STATUS_LABEL[status]}` });
//     clearSelection();
//     fetchRows({ silent: true });
//   };

//   const handleBulkDownload = () => {
//     rows.filter((r) => selectedIds.has(r.id) && r.pdf_url).forEach((r) => { void handleDownloadPdf(r); });
//   };

//   return (
//     <AdminPage title="Complete Baby Blueprint Reports" loading={false}>
//       <div className="space-y-6">
//         <div className="flex flex-wrap items-start justify-between gap-4">
//           <div>
//             <Link to="/admin/reports" className="text-sm text-muted-foreground hover:text-foreground">← Back to Reports</Link>
//             <h2 className="mt-2 text-2xl font-semibold">Complete Baby Blueprint</h2>
//             <p className="text-sm text-muted-foreground">Manage all Complete Baby Blueprint Report submissions.</p>
//           </div>
//           <div className="flex gap-2">
//             <Button variant="outline" onClick={() => fetchRows({ silent: true })} disabled={refreshing}>
//               <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
//               Refresh
//             </Button>
//             <Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 h-4 w-4" />Generate Report</Button>
//           </div>
//         </div>

//         <Card>
//           <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//               <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name, email, phone or report ID..." className="pl-9" />
//             </div>
//             <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as BabyReportStatus | "all")}>
//               <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Statuses</SelectItem>
//                 {(Object.keys(STATUS_LABEL) as BabyReportStatus[]).map((s) => (
//                   <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as "newest" | "oldest")}>
//               <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Sort" /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="newest">Newest First</SelectItem>
//                 <SelectItem value="oldest">Oldest First</SelectItem>
//               </SelectContent>
//             </Select>
//             <Popover>
//               <PopoverTrigger asChild>
//                 <Button variant="outline" className="w-full justify-start text-left font-normal md:w-[220px]">
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
//                     <Button variant="ghost" size="sm" className="w-full" onClick={() => setDateRange(undefined)}>Clear</Button>
//                   </div>
//                 )}
//               </PopoverContent>
//             </Popover>
//           </CardContent>
//         </Card>

//         {selectedIds.size > 0 && (
//           <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/50 p-3">
//             <span className="text-sm font-medium">{selectedIds.size} selected</span>
//             <Button variant="outline" size="sm" onClick={handleBulkDownload}><Download className="mr-1.5 h-4 w-4" />Download</Button>
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild><Button variant="outline" size="sm">Change Status</Button></DropdownMenuTrigger>
//               <DropdownMenuContent>
//                 {(Object.keys(STATUS_LABEL) as BabyReportStatus[]).map((s) => (
//                   <DropdownMenuItem key={s} onClick={() => handleBulkStatusChange(s)}>{STATUS_LABEL[s]}</DropdownMenuItem>
//                 ))}
//               </DropdownMenuContent>
//             </DropdownMenu>
//             <Button variant="destructive" size="sm" onClick={() => setConfirmBulkDelete(true)}><Trash2 className="mr-1.5 h-4 w-4" />Delete</Button>
//             <Button variant="ghost" size="sm" className="ml-auto" onClick={clearSelection}><X className="mr-1 h-4 w-4" />Clear</Button>
//           </div>
//         )}

//         {!loading && !emptyState && (
//           <div className="flex items-center gap-2 px-1">
//             <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} id="pbn-select-all" />
//             <Label htmlFor="pbn-select-all" className="cursor-pointer text-sm text-muted-foreground">Select all on this page</Label>
//           </div>
//         )}

//         {loading ? (
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
//             {Array.from({ length: 6 }).map((_, i) => (
//               <Card key={i}>
//                 <CardContent className="space-y-3 p-5">
//                   <Skeleton className="h-5 w-2/3" />
//                   <Skeleton className="h-4 w-1/2" />
//                   <Skeleton className="h-4 w-full" />
//                   <Skeleton className="h-4 w-3/4" />
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         ) : emptyState ? (
//           <Card>
//             <CardContent className="flex flex-col items-center justify-center gap-3 p-16 text-center">
//               <FileX2 className="h-14 w-14 text-muted-foreground" />
//               <h3 className="text-lg font-medium">No Complete Baby Blueprint Reports Found</h3>
//               <p className="max-w-sm text-sm text-muted-foreground">Try adjusting your search or filters, or generate a new report to get started.</p>
//               <Button onClick={() => setCreateOpen(true)} className="mt-2"><Plus className="mr-2 h-4 w-4" />Generate Report</Button>
//             </CardContent>
//           </Card>
//         ) : (
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
//             {rows.map((r) => (
//               <Card key={r.id} className="flex flex-col justify-between">
//                 <CardContent className="flex flex-1 flex-col gap-3 p-5">
//                   <div className="flex items-start justify-between gap-2">
//                     <div className="flex items-start gap-2">
//                       <Checkbox checked={selectedIds.has(r.id)} onCheckedChange={() => toggleSelect(r.id)} className="mt-1" />
//                       <div>
//                         <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{r.report_id}</p>
//                         <h3 className="text-base font-semibold leading-tight">{r.customer_name}</h3>
//                       </div>
//                     </div>
//                     <Badge variant="outline" className={STATUS_BADGE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
//                   </div>

//                   <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
//                     <div className="col-span-2 truncate text-muted-foreground">{r.email}</div>
//                     <div className="text-muted-foreground">{r.phone || "—"}</div>
//                     <div className="text-muted-foreground">{r.gender || "—"}</div>
//                     <div className="text-muted-foreground">DOB: {formatDate(r.dob)}</div>
//                     <div className="text-muted-foreground">Created: {formatDate(r.created_at)}</div>
//                     <div className="col-span-2 truncate text-muted-foreground">Options: {r.option1_name} · {r.option2_name}</div>
//                     {r.nick_name ? <div className="col-span-2 truncate text-muted-foreground">Nick Name: {r.nick_name}</div> : null}
//                     <div className="col-span-2 truncate text-muted-foreground">Generated by: {generatedByLabel(r.generated_by)}</div>
//                   </div>

//                   <div className="flex items-center gap-1.5 text-xs">
//                     {r.pdf_url ? (
//                       <span className="inline-flex items-center gap-1 text-green-700"><BadgeCheck className="h-3.5 w-3.5" /> Report Generated</span>
//                     ) : (
//                       <span className="inline-flex items-center gap-1 text-muted-foreground"><FileX2 className="h-3.5 w-3.5" /> Not Generated</span>
//                     )}
//                   </div>
//                 </CardContent>

//                 <div className="flex flex-wrap items-center gap-1.5 border-t p-3">
//                   <Button variant="ghost" size="icon" title="Preview" onClick={() => openPreview(r)}><Eye className="h-4 w-4" /></Button>
//                   <Button variant="ghost" size="icon" title="Edit customer details" onClick={() => { setEditTarget(r); setEditForm(rowToForm(r)); }}><Pencil className="h-4 w-4" /></Button>
//                   <Button variant="ghost" size="icon" title={r.pdf_url ? "Regenerate PDF" : "Generate PDF"} onClick={() => handleGeneratePdfClick(r)} disabled={generatingId === r.id}>
//                     {generatingId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCog className="h-4 w-4" />}
//                   </Button>
//                   <Button variant="ghost" size="icon" title="Download PDF" onClick={() => handleDownloadPdf(r)} disabled={!r.pdf_url}><Download className="h-4 w-4" /></Button>
//                   <Button variant="ghost" size="icon" title="Print" onClick={() => handlePrint(r)} disabled={!r.pdf_url}><Printer className="h-4 w-4" /></Button>
//                   <Button variant="ghost" size="icon" title="Send Email" onClick={() => openEmailDialog(r)} disabled={!r.pdf_url}><Mail className="h-4 w-4" /></Button>

//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button variant="ghost" size="icon" title="More" className="ml-auto"><MoreVertical className="h-4 w-4" /></Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end">
//                       <DropdownMenuLabel>Change Status</DropdownMenuLabel>
//                       {(Object.keys(STATUS_LABEL) as BabyReportStatus[]).map((s) => (
//                         <DropdownMenuItem key={s} disabled={s === r.status} onClick={() => handleChangeStatus(r, s)}>{STATUS_LABEL[s]}</DropdownMenuItem>
//                       ))}
//                       <DropdownMenuSeparator />
//                       <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setDeleteTarget(r)}>
//                         <Trash2 className="mr-2 h-4 w-4" />Delete
//                       </DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </div>
//               </Card>
//             ))}
//           </div>
//         )}

//         {!loading && !emptyState && (
//           <div className="flex items-center justify-between pt-2">
//             <p className="text-sm text-muted-foreground">
//               Page {page} of {totalPages} &middot; {totalCount} report{totalCount === 1 ? "" : "s"}
//             </p>
//             <div className="flex gap-2">
//               <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
//                 <ChevronLeft className="mr-1 h-4 w-4" />Previous
//               </Button>
//               <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
//                 Next<ChevronRight className="ml-1 h-4 w-4" />
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Create */}
//       <Dialog open={createOpen} onOpenChange={setCreateOpen}>
//         <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
//           <DialogHeader><DialogTitle>Generate Complete Baby Blueprint Report</DialogTitle></DialogHeader>
//           <BabyReportForm values={createForm} onChange={setCreateForm} />
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
//             <Button onClick={handleCreate} disabled={saving}>{saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Create</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Edit */}
//       <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
//         <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
//           <DialogHeader><DialogTitle>Edit report {editTarget?.report_id}</DialogTitle></DialogHeader>
//           <BabyReportForm values={editForm} onChange={setEditForm} includeStatus />
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
//             <Button onClick={handleSaveEdit} disabled={saving}>{saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Save</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Preview */}
//       <Dialog open={!!viewTarget} onOpenChange={(o) => { if (!o) { setViewTarget(null); setPreviewUrl(null); } }}>
//         <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
//           <DialogHeader><DialogTitle>{viewTarget?.customer_name} — {viewTarget?.report_id}</DialogTitle></DialogHeader>
//           {viewTarget && (
//             <div className="space-y-4">
//               <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
//                 <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium">{viewTarget.email}</p></div>
//                 <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium">{viewTarget.phone || "—"}</p></div>
//                 <div><p className="text-xs text-muted-foreground">DOB</p><p className="font-medium">{formatDate(viewTarget.dob)}</p></div>
//                 <div><p className="text-xs text-muted-foreground">Option 1</p><p className="font-medium">{viewTarget.option1_name}</p></div>
//                 <div><p className="text-xs text-muted-foreground">Option 2</p><p className="font-medium">{viewTarget.option2_name}</p></div>
//                 <div><p className="text-xs text-muted-foreground">Nick Name</p><p className="font-medium">{viewTarget.nick_name || "—"}</p></div>
//                 <div><p className="text-xs text-muted-foreground">Generated by</p><p className="font-medium">{generatedByLabel(viewTarget.generated_by)}</p></div>
//               </div>
//               {previewUrl ? (
//                 <iframe title="Report preview" src={previewUrl} className="h-[65vh] w-full rounded-md border" />
//               ) : (
//                 <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-md border text-sm text-muted-foreground">
//                   <FileX2 className="h-8 w-8" />
//                   PDF not generated yet.
//                   <Button size="sm" onClick={() => runGeneratePdf(viewTarget)} disabled={generatingId === viewTarget.id}>
//                     {generatingId === viewTarget.id && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Generate PDF
//                   </Button>
//                 </div>
//               )}
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Email */}
//       <Dialog open={!!emailTarget} onOpenChange={(o) => !o && !sendingEmail && closeEmailDialog()}>
//         <DialogContent className="max-w-xl">
//           <DialogHeader><DialogTitle>Send Email</DialogTitle></DialogHeader>
//           <div className="space-y-3">
//             <div><Label htmlFor="pbn_email_to">To</Label><Input id="pbn_email_to" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} /></div>
//             <div><Label htmlFor="pbn_email_subject">Subject</Label><Input id="pbn_email_subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} /></div>
//             <div><Label htmlFor="pbn_email_msg">Message</Label><Textarea id="pbn_email_msg" rows={10} value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} /></div>
//             <p className="text-xs text-muted-foreground">The report PDF is attached automatically.</p>
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={closeEmailDialog} disabled={sendingEmail}>Cancel</Button>
//             <Button onClick={confirmSendEmail} disabled={sendingEmail}>{sendingEmail && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Send Email</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Regenerate confirm */}
//       <AlertDialog open={!!regenerateTarget} onOpenChange={(o) => !o && setRegenerateTarget(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Regenerate this PDF?</AlertDialogTitle>
//             <AlertDialogDescription>The existing PDF for {regenerateTarget?.report_id} will be replaced.</AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={() => regenerateTarget && runGeneratePdf(regenerateTarget)}>Regenerate</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//       {/* Delete */}
//       <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete this report?</AlertDialogTitle>
//             <AlertDialogDescription>{deleteTarget?.customer_name} ({deleteTarget?.report_id}) will be removed permanently.</AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//       <AlertDialog open={confirmBulkDelete} onOpenChange={setConfirmBulkDelete}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete {selectedIds.size} report{selectedIds.size === 1 ? "" : "s"}?</AlertDialogTitle>
//             <AlertDialogDescription>They will be removed permanently.</AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handleBulkDelete}>Delete</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </AdminPage>
//   );
// }



// import { useCallback, useEffect, useMemo, useState } from "react";
// import { Link } from "react-router-dom";
// import {
//   Plus, Loader2, Trash2, Pencil, FileCog, Download, Printer, Mail, Eye, MoreVertical, RefreshCw, Search,
//   Calendar as CalendarIcon, BadgeCheck, FileX2, ChevronLeft, ChevronRight, X,
// } from "lucide-react";
// import { format } from "date-fns";
// import type { DateRange } from "react-day-picker";

// import { AdminPage } from "@/components/admin/AdminPage";
// import { legacyDatabase as supabase } from "@/lib/legacy-database-client";
// import { useToast } from "@/hooks/use-toast";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Textarea } from "@/components/ui/textarea";
// import { Calendar } from "@/components/ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import {
//   DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import {
//   AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
//   AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
// } from "@/components/ui/alert-dialog";

// import { generateCompleteBabyBlueprintReportPdf, completeBabyBlueprintReportPdfToBlob } from "@/components/CompleteBabyBlueprintReportGenerator";
// import {
//   BABY_NAME_PREFERENCE_OPTIONS, EMPTY_BABY_FORM, buildBabyCustomerName, normaliseAlphabet, validateBabyForm,
//   type BabyNamePreference, type BabyReportFormValues, type BabyReportStatus,
// } from "@/lib/baby-reports/complete-baby-blueprint/form";

// const TABLE_NAME = "complete_baby_blueprint_reports";
// const STORAGE_BUCKET = "complete-baby-blueprint-reports";
// const PROFILES_TABLE = "profiles";
// const PAGE_SIZE = 10;
// const DRAFT_KEY = "complete-baby-blueprint-create-report-draft";

// interface BabyReportRow {
//   id: string;
//   report_id: string;
//   customer_name: string;
//   first_name: string | null;
//   middle_name: string | null;
//   last_name: string | null;
//   is_middle_name_father_husband: boolean;
//   gender: string | null;
//   email: string;
//   phone: string | null;
//   dob: string;
//   first_alphabet: string;
//   option1_name: string;
//   option2_name: string;
//   nick_name: string | null;
//   preference: BabyNamePreference;
//   status: BabyReportStatus;
//   pdf_url: string | null;
//   generated_by?: string | null;
//   created_at: string;
// }

// const STATUS_BADGE: Record<BabyReportStatus, string> = {
//   draft: "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-100",
//   generating: "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100",
//   completed: "bg-green-100 text-green-800 border-green-300 hover:bg-green-100",
//   failed: "bg-red-100 text-red-800 border-red-300 hover:bg-red-100",
//   archived: "bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-200",
// };

// const STATUS_LABEL: Record<BabyReportStatus, string> = {
//   draft: "Draft", generating: "Generating", completed: "Completed", failed: "Failed", archived: "Archived",
// };

// function generateReportId() {
//   return `CBB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
// }

// function loadDraft(): BabyReportFormValues {
//   try {
//     const raw = window.localStorage.getItem(DRAFT_KEY);
//     return raw ? { ...EMPTY_BABY_FORM, ...JSON.parse(raw) } : EMPTY_BABY_FORM;
//   } catch {
//     return EMPTY_BABY_FORM;
//   }
// }

// function rowToForm(r: BabyReportRow): BabyReportFormValues {
//   return {
//     first_name: r.first_name ?? "",
//     middle_name: r.middle_name ?? "",
//     is_middle_name_father_husband: r.is_middle_name_father_husband,
//     last_name: r.last_name ?? "",
//     gender: r.gender ?? "",
//     email: r.email,
//     phone: r.phone ?? "",
//     dob: r.dob,
//     first_alphabet: r.first_alphabet,
//     option1_name: r.option1_name,
//     option2_name: r.option2_name,
//     nick_name: r.nick_name ?? "",
//     preference: r.preference,
//     status: r.status,
//   };
// }

// function formToColumns(v: BabyReportFormValues) {
//   return {
//     customer_name: buildBabyCustomerName(v),
//     first_name: v.first_name.trim(),
//     middle_name: v.middle_name.trim() || null,
//     last_name: v.last_name.trim() || null,
//     is_middle_name_father_husband: v.middle_name.trim() ? v.is_middle_name_father_husband : false,
//     gender: v.gender,
//     email: v.email.trim(),
//     phone: v.phone.trim(),
//     dob: v.dob,
//     first_alphabet: v.first_alphabet,
//     option1_name: v.option1_name.trim(),
//     option2_name: v.option2_name.trim(),
//     nick_name: v.nick_name.trim() || null,
//     preference: v.preference,
//     status: v.status,
//   };
// }

// /** The "Generate Report" form — field order follows the client's list. */
// function BabyReportForm({ values, onChange, includeStatus }: {
//   values: BabyReportFormValues;
//   onChange: (v: BabyReportFormValues) => void;
//   includeStatus?: boolean;
// }) {
//   const set = <K extends keyof BabyReportFormValues>(key: K, value: BabyReportFormValues[K]) =>
//     onChange({ ...values, [key]: value });
//   const hasMiddle = values.middle_name.trim().length > 0;

//   return (
//     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//       <div>
//         <Label htmlFor="pbn_first_name">First Name</Label>
//         <Input id="pbn_first_name" value={values.first_name} onChange={(e) => set("first_name", e.target.value)} placeholder="First name" />
//       </div>
//       <div>
//         <Label htmlFor="pbn_middle_name">Middle Name</Label>
//         <Input
//           id="pbn_middle_name"
//           value={values.middle_name}
//           onChange={(e) => {
//             const next = e.target.value;
//             onChange({ ...values, middle_name: next, is_middle_name_father_husband: next.trim() ? values.is_middle_name_father_husband : false });
//           }}
//           placeholder="Middle name"
//         />
//       </div>
//       {hasMiddle && (
//         <div className="sm:col-span-2">
//           <Label htmlFor="pbn_is_father">Is Middle Name Father's / Husband's Name?</Label>
//           <Select value={values.is_middle_name_father_husband ? "yes" : "no"} onValueChange={(v) => set("is_middle_name_father_husband", v === "yes")}>
//             <SelectTrigger id="pbn_is_father"><SelectValue /></SelectTrigger>
//             <SelectContent>
//               <SelectItem value="no">No</SelectItem>
//               <SelectItem value="yes">Yes</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       )}
//       <div>
//         <Label htmlFor="pbn_last_name">Last Name</Label>
//         <Input id="pbn_last_name" value={values.last_name} onChange={(e) => set("last_name", e.target.value)} placeholder="Last name" />
//       </div>
//       <div>
//         <Label htmlFor="pbn_gender">Gender</Label>
//         <Select value={values.gender} onValueChange={(v) => set("gender", v)}>
//           <SelectTrigger id="pbn_gender"><SelectValue placeholder="Select gender" /></SelectTrigger>
//           <SelectContent>
//             <SelectItem value="Male">Male</SelectItem>
//             <SelectItem value="Female">Female</SelectItem>
//             <SelectItem value="Other">Other</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>
//       <div>
//         <Label htmlFor="pbn_email">Email</Label>
//         <Input id="pbn_email" type="email" value={values.email} onChange={(e) => set("email", e.target.value)} placeholder="name@example.com" />
//       </div>
//       <div>
//         <Label htmlFor="pbn_phone">WhatsApp Number</Label>
//         <Input id="pbn_phone" value={values.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91..." />
//       </div>
//       <div>
//         <Label htmlFor="pbn_dob">DOB</Label>
//         <Input id="pbn_dob" type="date" value={values.dob} onChange={(e) => set("dob", e.target.value)} />
//       </div>
//       <div>
//         <Label htmlFor="pbn_first_alphabet">First Alphabet</Label>
//         <Input
//           id="pbn_first_alphabet"
//           value={values.first_alphabet}
//           maxLength={1}
//           onChange={(e) => set("first_alphabet", normaliseAlphabet(e.target.value))}
//           placeholder="A–Z"
//           className="uppercase"
//         />
//       </div>
//       <div className="sm:col-span-2">
//         <Label htmlFor="pbn_option1">Option 1: First Name + Middle &amp; Last Name</Label>
//         <Input id="pbn_option1" value={values.option1_name} onChange={(e) => set("option1_name", e.target.value)} placeholder="Full name, e.g. Shanvi S Das" />
//       </div>
//       <div className="sm:col-span-2">
//         <Label htmlFor="pbn_option2">Option 2: First Name + Middle &amp; Last Name</Label>
//         <Input id="pbn_option2" value={values.option2_name} onChange={(e) => set("option2_name", e.target.value)} placeholder="Full name, e.g. Shanvi Dass" />
//       </div>
//       <div className="sm:col-span-2">
//         <Label htmlFor="pbn_nick_name">Nick Name (optional)</Label>
//         <Input id="pbn_nick_name" value={values.nick_name} onChange={(e) => set("nick_name", e.target.value)} placeholder="e.g. Shanu — leave empty to skip the Nick Name page" />
//         <p className="mt-1 text-xs text-muted-foreground">If filled, the report includes the Nick Name Recommendation page (page 22). If empty, that page is left out.</p>
//       </div>
//       <div className="sm:col-span-2">
//         <Label htmlFor="pbn_preference">Preference</Label>
//         <Select value={values.preference} onValueChange={(v) => set("preference", v as BabyNamePreference)}>
//           <SelectTrigger id="pbn_preference"><SelectValue placeholder="Select preference" /></SelectTrigger>
//           <SelectContent>
//             {BABY_NAME_PREFERENCE_OPTIONS.map((o) => (
//               <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>
//       {includeStatus && (
//         <div className="sm:col-span-2">
//           <Label htmlFor="pbn_status">Status</Label>
//           <Select value={values.status} onValueChange={(v) => set("status", v as BabyReportStatus)}>
//             <SelectTrigger id="pbn_status"><SelectValue /></SelectTrigger>
//             <SelectContent>
//               {(Object.keys(STATUS_LABEL) as BabyReportStatus[]).map((s) => (
//                 <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//       )}
//     </div>
//   );
// }

// function formatDate(value: string | null | undefined) {
//   if (!value) return "—";
//   const d = new Date(value);
//   if (isNaN(d.getTime())) return value;
//   return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
// }

// function withCacheBust(url: string | null): string | null {
//   if (!url) return null;
//   return `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`;
// }

// function errMsg(err: unknown, fallback: string): string {
//   if (err instanceof Error) return err.message;
//   if (err && typeof err === "object" && "message" in err && typeof (err as { message?: unknown }).message === "string") {
//     return (err as { message: string }).message;
//   }
//   return fallback;
// }

// async function getCurrentAdminId(): Promise<string | null> {
//   try {
//     const { data } = await supabase.auth.getUser();
//     return data.user?.id ?? null;
//   } catch {
//     return null;
//   }
// }

// function buildDownloadFilename(r: BabyReportRow): string {
//   const first = (r.first_name || r.customer_name.trim().split(/\s+/)[0] || "Report").replace(/[^a-zA-Z0-9]/g, "");
//   return `${first}_Complete Baby Blueprint_${r.report_id}.pdf`;
// }

// export default function CompleteBabyBlueprintReports() {
//   const { toast } = useToast();

//   const [rows, setRows] = useState<BabyReportRow[]>([]);
//   const [totalCount, setTotalCount] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const [searchTerm, setSearchTerm] = useState("");
//   const [debouncedSearch, setDebouncedSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState<BabyReportStatus | "all">("all");
//   const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
//   const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
//   const [page, setPage] = useState(1);
//   const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

//   const [createOpen, setCreateOpen] = useState(false);
//   const [createForm, setCreateForm] = useState<BabyReportFormValues>(() => loadDraft());
//   const [editTarget, setEditTarget] = useState<BabyReportRow | null>(null);
//   const [editForm, setEditForm] = useState<BabyReportFormValues>(EMPTY_BABY_FORM);
//   const [deleteTarget, setDeleteTarget] = useState<BabyReportRow | null>(null);
//   const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
//   const [regenerateTarget, setRegenerateTarget] = useState<BabyReportRow | null>(null);
//   const [saving, setSaving] = useState(false);
//   const [generatingId, setGeneratingId] = useState<string | null>(null);

//   const [viewTarget, setViewTarget] = useState<BabyReportRow | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);

//   const [emailTarget, setEmailTarget] = useState<BabyReportRow | null>(null);
//   const [emailTo, setEmailTo] = useState("");
//   const [emailSubject, setEmailSubject] = useState("");
//   const [emailMessage, setEmailMessage] = useState("");
//   const [sendingEmail, setSendingEmail] = useState(false);

//   const [generatedByNames, setGeneratedByNames] = useState<Record<string, string>>({});

//   useEffect(() => {
//     const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350);
//     return () => clearTimeout(t);
//   }, [searchTerm]);
//   useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter, sortOrder, dateRange]);
//   useEffect(() => { setSelectedIds(new Set()); }, [page, debouncedSearch, statusFilter, sortOrder, dateRange]);

//   // keep the in-progress "Generate Report" form across reloads
//   useEffect(() => {
//     try { window.localStorage.setItem(DRAFT_KEY, JSON.stringify(createForm)); } catch { /* ignore */ }
//   }, [createForm]);

//   const resolveGeneratedByNames = useCallback(async (ids: (string | null | undefined)[]) => {
//     const unique = Array.from(new Set(ids.filter((id): id is string => !!id)));
//     if (unique.length === 0) return;
//     try {
//       const { data, error } = await supabase.from(PROFILES_TABLE).select("user_id, full_name").in("user_id", unique);
//       if (error || !data) return;
//       setGeneratedByNames((prev) => {
//         const next = { ...prev };
//         for (const row of data as { user_id: string; full_name: string | null }[]) next[row.user_id] = row.full_name || "Unknown";
//         return next;
//       });
//     } catch { /* non-critical */ }
//   }, []);

//   const generatedByLabel = (id: string | null | undefined): string => (!id ? "—" : generatedByNames[id] ?? "…");

//   const fetchRows = useCallback(async (opts?: { silent?: boolean }) => {
//     opts?.silent ? setRefreshing(true) : setLoading(true);
//     try {
//       const from = (page - 1) * PAGE_SIZE;
//       const to = from + PAGE_SIZE - 1;
//       let query = supabase.from(TABLE_NAME).select("*", { count: "exact" });
//       if (debouncedSearch) {
//         const term = debouncedSearch.replace(/%/g, "");
//         query = query.or(`customer_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%,report_id.ilike.%${term}%`);
//       }
//       if (statusFilter !== "all") query = query.eq("status", statusFilter);
//       if (dateRange?.from) query = query.gte("created_at", dateRange.from.toISOString());
//       if (dateRange?.to) {
//         const end = new Date(dateRange.to);
//         end.setHours(23, 59, 59, 999);
//         query = query.lte("created_at", end.toISOString());
//       }
//       query = query.order("created_at", { ascending: sortOrder === "oldest" }).range(from, to);
//       const { data, error, count } = await query;
//       if (error) throw error;
//       const list = (data ?? []) as BabyReportRow[];
//       setRows(list);
//       setTotalCount(count ?? 0);
//       resolveGeneratedByNames(list.map((r) => r.generated_by));
//     } catch (err) {
//       console.error(err);
//       toast({ title: "Could not load reports", description: errMsg(err, "Unexpected error while fetching reports."), variant: "destructive" });
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [page, debouncedSearch, statusFilter, sortOrder, dateRange, resolveGeneratedByNames]);

//   useEffect(() => { fetchRows(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [page, debouncedSearch, statusFilter, sortOrder, dateRange]);

//   const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
//   const emptyState = useMemo(() => !loading && rows.length === 0, [loading, rows]);

//   /* ---------------------------- Actions ---------------------------- */

//   const handleCreate = async () => {
//     const problem = validateBabyForm(createForm);
//     if (problem) {
//       toast({ title: "Missing details", description: problem, variant: "destructive" });
//       return;
//     }
//     setSaving(true);
//     const { error } = await supabase.from(TABLE_NAME).insert({ report_id: generateReportId(), ...formToColumns(createForm), pdf_url: null });
//     setSaving(false);
//     if (error) {
//       toast({ title: "Could not create report", description: error.message, variant: "destructive" });
//       return;
//     }
//     toast({ title: "Report created", description: "Complete Baby Blueprint Report submission added." });
//     setCreateOpen(false);
//     setCreateForm(EMPTY_BABY_FORM);
//     try { window.localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
//     fetchRows({ silent: true });
//   };

//   const handleSaveEdit = async () => {
//     if (!editTarget) return;
//     const problem = validateBabyForm(editForm);
//     if (problem) {
//       toast({ title: "Missing details", description: problem, variant: "destructive" });
//       return;
//     }
//     setSaving(true);
//     const { error } = await supabase.from(TABLE_NAME).update({ ...formToColumns(editForm), updated_at: new Date().toISOString() }).eq("id", editTarget.id);
//     setSaving(false);
//     if (error) {
//       toast({ title: "Could not save changes", description: error.message, variant: "destructive" });
//       return;
//     }
//     toast({ title: "Report updated" });
//     setEditTarget(null);
//     fetchRows({ silent: true });
//   };

//   const handleChangeStatus = async (r: BabyReportRow, status: BabyReportStatus) => {
//     const { error } = await supabase.from(TABLE_NAME).update({ status, updated_at: new Date().toISOString() }).eq("id", r.id);
//     if (error) {
//       toast({ title: "Could not change status", description: error.message, variant: "destructive" });
//       return;
//     }
//     toast({ title: "Status updated", description: `${r.report_id} → ${STATUS_LABEL[status]}` });
//     fetchRows({ silent: true });
//   };

//   const handleDelete = async () => {
//     if (!deleteTarget) return;
//     const { error } = await supabase.from(TABLE_NAME).delete().eq("id", deleteTarget.id);
//     if (error) {
//       toast({ title: "Could not delete report", description: error.message, variant: "destructive" });
//     } else {
//       toast({ title: "Report deleted" });
//       fetchRows({ silent: true });
//     }
//     setDeleteTarget(null);
//   };

//   const openPreview = (r: BabyReportRow) => {
//     setViewTarget(r);
//     setPreviewUrl(withCacheBust(r.pdf_url));
//   };

//   const runGeneratePdf = async (r: BabyReportRow) => {
//     setGeneratingId(r.id);
//     try {
//       const bytes = await generateCompleteBabyBlueprintReportPdf({
//         reportId: r.report_id,
//         customerName: r.customer_name,
//         firstName: r.first_name ?? "",
//         middleName: r.middle_name ?? "",
//         lastName: r.last_name ?? "",
//         isMiddleNameFatherHusband: r.is_middle_name_father_husband,
//         gender: r.gender ?? "",
//         email: r.email,
//         phone: r.phone ?? "",
//         dob: r.dob,
//         firstAlphabet: r.first_alphabet,
//         option1Name: r.option1_name,
//         option2Name: r.option2_name,
//         nickName1: r.nick_name ?? "",
//         preference: r.preference,
//       });

//       const blob = completeBabyBlueprintReportPdfToBlob(bytes);
//       const filePath = `${r.report_id}.pdf`;
//       const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, blob, { contentType: "application/pdf", upsert: true });
//       if (uploadError) throw uploadError;
//       const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
//       const pdfUrl = publicUrlData?.publicUrl ?? null;
//       const generatedById = await getCurrentAdminId();

//       const { error: updateError } = await supabase
//         .from(TABLE_NAME)
//         .update({ pdf_url: pdfUrl, status: "completed", generated_by: generatedById, updated_at: new Date().toISOString() })
//         .eq("id", r.id);
//       if (updateError) throw updateError;

//       toast({ title: "PDF generated", description: `Report ${r.report_id} is ready to review.` });
//       resolveGeneratedByNames([generatedById]);
//       openPreview({ ...r, pdf_url: pdfUrl, status: "completed", generated_by: generatedById });
//       fetchRows({ silent: true });
//     } catch (err) {
//       console.error("[CompleteBabyBlueprintReports] PDF generation failed:", err);
//       toast({ title: "PDF generation failed", description: errMsg(err, "Unexpected error while generating the PDF."), variant: "destructive" });
//     } finally {
//       setGeneratingId(null);
//       setRegenerateTarget(null);
//     }
//   };

//   const handleGeneratePdfClick = (r: BabyReportRow) => {
//     if (r.pdf_url) setRegenerateTarget(r);
//     else runGeneratePdf(r);
//   };

//   const handleDownloadPdf = async (r: BabyReportRow) => {
//     if (!r.pdf_url) {
//       toast({ title: "No PDF available", description: "Generate the PDF for this report first.", variant: "destructive" });
//       return;
//     }
//     try {
//       const res = await fetch(r.pdf_url);
//       if (!res.ok) throw new Error(`Failed to fetch PDF (${res.status})`);
//       const blobUrl = URL.createObjectURL(await res.blob());
//       const link = document.createElement("a");
//       link.href = blobUrl;
//       link.download = buildDownloadFilename(r);
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       URL.revokeObjectURL(blobUrl);
//     } catch (err) {
//       toast({ title: "Download failed", description: errMsg(err, "Could not download the PDF."), variant: "destructive" });
//     }
//   };

//   const handlePrint = (r: BabyReportRow) => {
//     if (!r.pdf_url) {
//       toast({ title: "No PDF available", description: "Generate the PDF for this report first.", variant: "destructive" });
//       return;
//     }
//     const win = window.open(r.pdf_url, "_blank");
//     if (win) win.addEventListener("load", () => win.print());
//   };

//   const openEmailDialog = (r: BabyReportRow) => {
//     setEmailTarget(r);
//     setEmailTo(r.email || "");
//     setEmailSubject(`Your Complete Baby Blueprint Report — ${r.report_id}`);
//     setEmailMessage(
//       "Namaste, 🙏\n\nPlease find attached the Complete Baby Blueprint Report prepared based on the baby's Date of Birth and numerology analysis.\n\nIt shares the recommended name options and what each of them brings to your child's life.\n\nKindly review it at your convenience.\n\nIf you would like the report to be explained over a phone call, you may request the same.\n\nWarm Regards,\nAnkshaastra – Empower Your Name",
//     );
//   };

//   const closeEmailDialog = () => {
//     setEmailTarget(null);
//     setEmailTo("");
//     setEmailSubject("");
//     setEmailMessage("");
//   };

//   const confirmSendEmail = async () => {
//     if (!emailTarget) return;
//     if (!emailTo.trim()) { toast({ title: "Recipient email is required", variant: "destructive" }); return; }
//     if (!emailSubject.trim()) { toast({ title: "Subject is required", variant: "destructive" }); return; }
//     setSendingEmail(true);
//     try {
//       const { data: sessionData } = await supabase.auth.getSession();
//       const token = sessionData.session?.access_token;
//       if (!token) throw new Error("Please sign in again");
//       const res = await fetch("/api/complete-baby-blueprint-reports/send-email", {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//         body: JSON.stringify({ reportId: emailTarget.id, to: emailTo.trim(), subject: emailSubject.trim(), message: emailMessage, attachPdf: true }),
//       });
//       const result = await res.json().catch(() => ({}));
//       if (!res.ok) throw new Error(result.error || "Could not send report email");
//       toast({ title: "Email sent", description: `Report ${emailTarget.report_id} was emailed to ${emailTo.trim()}.` });
//       closeEmailDialog();
//     } catch (err) {
//       toast({ title: "Could not send email", description: errMsg(err, "Unexpected error."), variant: "destructive" });
//     } finally {
//       setSendingEmail(false);
//     }
//   };

//   /* ----------------------------- Selection ----------------------------- */

//   const toggleSelect = (id: string) =>
//     setSelectedIds((prev) => {
//       const next = new Set(prev);
//       if (next.has(id)) next.delete(id); else next.add(id);
//       return next;
//     });
//   const allSelected = rows.length > 0 && selectedIds.size === rows.length;
//   const toggleSelectAll = () => setSelectedIds(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
//   const clearSelection = () => setSelectedIds(new Set());

//   const handleBulkDelete = async () => {
//     const ids = Array.from(selectedIds);
//     const { error } = await supabase.from(TABLE_NAME).delete().in("id", ids);
//     if (error) toast({ title: "Could not delete reports", description: error.message, variant: "destructive" });
//     else toast({ title: `${ids.length} report${ids.length === 1 ? "" : "s"} deleted` });
//     setConfirmBulkDelete(false);
//     clearSelection();
//     fetchRows({ silent: true });
//   };

//   const handleBulkStatusChange = async (status: BabyReportStatus) => {
//     const ids = Array.from(selectedIds);
//     const { error } = await supabase.from(TABLE_NAME).update({ status, updated_at: new Date().toISOString() }).in("id", ids);
//     if (error) toast({ title: "Could not change status", description: error.message, variant: "destructive" });
//     else toast({ title: "Status updated", description: `${ids.length} report${ids.length === 1 ? "" : "s"} → ${STATUS_LABEL[status]}` });
//     clearSelection();
//     fetchRows({ silent: true });
//   };

//   const handleBulkDownload = () => {
//     rows.filter((r) => selectedIds.has(r.id) && r.pdf_url).forEach((r) => { void handleDownloadPdf(r); });
//   };

//   return (
//     <AdminPage title="Complete Baby Blueprint Reports" loading={false}>
//       <div className="space-y-6">
//         <div className="flex flex-wrap items-start justify-between gap-4">
//           <div>
//             <Link to="/admin/reports" className="text-sm text-muted-foreground hover:text-foreground">← Back to Reports</Link>
//             <h2 className="mt-2 text-2xl font-semibold">Complete Baby Blueprint</h2>
//             <p className="text-sm text-muted-foreground">Manage all Complete Baby Blueprint Report submissions.</p>
//           </div>
//           <div className="flex gap-2">
//             <Button variant="outline" onClick={() => fetchRows({ silent: true })} disabled={refreshing}>
//               <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
//               Refresh
//             </Button>
//             <Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 h-4 w-4" />Generate Report</Button>
//           </div>
//         </div>

//         <Card>
//           <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//               <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name, email, phone or report ID..." className="pl-9" />
//             </div>
//             <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as BabyReportStatus | "all")}>
//               <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Statuses</SelectItem>
//                 {(Object.keys(STATUS_LABEL) as BabyReportStatus[]).map((s) => (
//                   <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as "newest" | "oldest")}>
//               <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Sort" /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="newest">Newest First</SelectItem>
//                 <SelectItem value="oldest">Oldest First</SelectItem>
//               </SelectContent>
//             </Select>
//             <Popover>
//               <PopoverTrigger asChild>
//                 <Button variant="outline" className="w-full justify-start text-left font-normal md:w-[220px]">
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
//                     <Button variant="ghost" size="sm" className="w-full" onClick={() => setDateRange(undefined)}>Clear</Button>
//                   </div>
//                 )}
//               </PopoverContent>
//             </Popover>
//           </CardContent>
//         </Card>

//         {selectedIds.size > 0 && (
//           <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/50 p-3">
//             <span className="text-sm font-medium">{selectedIds.size} selected</span>
//             <Button variant="outline" size="sm" onClick={handleBulkDownload}><Download className="mr-1.5 h-4 w-4" />Download</Button>
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild><Button variant="outline" size="sm">Change Status</Button></DropdownMenuTrigger>
//               <DropdownMenuContent>
//                 {(Object.keys(STATUS_LABEL) as BabyReportStatus[]).map((s) => (
//                   <DropdownMenuItem key={s} onClick={() => handleBulkStatusChange(s)}>{STATUS_LABEL[s]}</DropdownMenuItem>
//                 ))}
//               </DropdownMenuContent>
//             </DropdownMenu>
//             <Button variant="destructive" size="sm" onClick={() => setConfirmBulkDelete(true)}><Trash2 className="mr-1.5 h-4 w-4" />Delete</Button>
//             <Button variant="ghost" size="sm" className="ml-auto" onClick={clearSelection}><X className="mr-1 h-4 w-4" />Clear</Button>
//           </div>
//         )}

//         {!loading && !emptyState && (
//           <div className="flex items-center gap-2 px-1">
//             <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} id="pbn-select-all" />
//             <Label htmlFor="pbn-select-all" className="cursor-pointer text-sm text-muted-foreground">Select all on this page</Label>
//           </div>
//         )}

//         {loading ? (
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
//             {Array.from({ length: 6 }).map((_, i) => (
//               <Card key={i}>
//                 <CardContent className="space-y-3 p-5">
//                   <Skeleton className="h-5 w-2/3" />
//                   <Skeleton className="h-4 w-1/2" />
//                   <Skeleton className="h-4 w-full" />
//                   <Skeleton className="h-4 w-3/4" />
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         ) : emptyState ? (
//           <Card>
//             <CardContent className="flex flex-col items-center justify-center gap-3 p-16 text-center">
//               <FileX2 className="h-14 w-14 text-muted-foreground" />
//               <h3 className="text-lg font-medium">No Complete Baby Blueprint Reports Found</h3>
//               <p className="max-w-sm text-sm text-muted-foreground">Try adjusting your search or filters, or generate a new report to get started.</p>
//               <Button onClick={() => setCreateOpen(true)} className="mt-2"><Plus className="mr-2 h-4 w-4" />Generate Report</Button>
//             </CardContent>
//           </Card>
//         ) : (
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
//             {rows.map((r) => (
//               <Card key={r.id} className="flex flex-col justify-between">
//                 <CardContent className="flex flex-1 flex-col gap-3 p-5">
//                   <div className="flex items-start justify-between gap-2">
//                     <div className="flex items-start gap-2">
//                       <Checkbox checked={selectedIds.has(r.id)} onCheckedChange={() => toggleSelect(r.id)} className="mt-1" />
//                       <div>
//                         <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{r.report_id}</p>
//                         <h3 className="text-base font-semibold leading-tight">{r.customer_name}</h3>
//                       </div>
//                     </div>
//                     <Badge variant="outline" className={STATUS_BADGE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
//                   </div>

//                   <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
//                     <div className="col-span-2 truncate text-muted-foreground">{r.email}</div>
//                     <div className="text-muted-foreground">{r.phone || "—"}</div>
//                     <div className="text-muted-foreground">{r.gender || "—"}</div>
//                     <div className="text-muted-foreground">DOB: {formatDate(r.dob)}</div>
//                     <div className="text-muted-foreground">Created: {formatDate(r.created_at)}</div>
//                     <div className="col-span-2 truncate text-muted-foreground">Options: {r.option1_name} · {r.option2_name}</div>
//                     {r.nick_name ? <div className="col-span-2 truncate text-muted-foreground">Nick Name: {r.nick_name}</div> : null}
//                     <div className="col-span-2 truncate text-muted-foreground">Generated by: {generatedByLabel(r.generated_by)}</div>
//                   </div>

//                   <div className="flex items-center gap-1.5 text-xs">
//                     {r.pdf_url ? (
//                       <span className="inline-flex items-center gap-1 text-green-700"><BadgeCheck className="h-3.5 w-3.5" /> Report Generated</span>
//                     ) : (
//                       <span className="inline-flex items-center gap-1 text-muted-foreground"><FileX2 className="h-3.5 w-3.5" /> Not Generated</span>
//                     )}
//                   </div>
//                 </CardContent>

//                 <div className="flex flex-wrap items-center gap-1.5 border-t p-3">
//                   <Button variant="ghost" size="icon" title="Preview" onClick={() => openPreview(r)}><Eye className="h-4 w-4" /></Button>
//                   <Button variant="ghost" size="icon" title="Edit customer details" onClick={() => { setEditTarget(r); setEditForm(rowToForm(r)); }}><Pencil className="h-4 w-4" /></Button>
//                   <Button variant="ghost" size="icon" title={r.pdf_url ? "Regenerate PDF" : "Generate PDF"} onClick={() => handleGeneratePdfClick(r)} disabled={generatingId === r.id}>
//                     {generatingId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCog className="h-4 w-4" />}
//                   </Button>
//                   <Button variant="ghost" size="icon" title="Download PDF" onClick={() => handleDownloadPdf(r)} disabled={!r.pdf_url}><Download className="h-4 w-4" /></Button>
//                   <Button variant="ghost" size="icon" title="Print" onClick={() => handlePrint(r)} disabled={!r.pdf_url}><Printer className="h-4 w-4" /></Button>
//                   <Button variant="ghost" size="icon" title="Send Email" onClick={() => openEmailDialog(r)} disabled={!r.pdf_url}><Mail className="h-4 w-4" /></Button>

//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button variant="ghost" size="icon" title="More" className="ml-auto"><MoreVertical className="h-4 w-4" /></Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end">
//                       <DropdownMenuLabel>Change Status</DropdownMenuLabel>
//                       {(Object.keys(STATUS_LABEL) as BabyReportStatus[]).map((s) => (
//                         <DropdownMenuItem key={s} disabled={s === r.status} onClick={() => handleChangeStatus(r, s)}>{STATUS_LABEL[s]}</DropdownMenuItem>
//                       ))}
//                       <DropdownMenuSeparator />
//                       <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setDeleteTarget(r)}>
//                         <Trash2 className="mr-2 h-4 w-4" />Delete
//                       </DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </div>
//               </Card>
//             ))}
//           </div>
//         )}

//         {!loading && !emptyState && (
//           <div className="flex items-center justify-between pt-2">
//             <p className="text-sm text-muted-foreground">
//               Page {page} of {totalPages} &middot; {totalCount} report{totalCount === 1 ? "" : "s"}
//             </p>
//             <div className="flex gap-2">
//               <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
//                 <ChevronLeft className="mr-1 h-4 w-4" />Previous
//               </Button>
//               <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
//                 Next<ChevronRight className="ml-1 h-4 w-4" />
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Create */}
//       <Dialog open={createOpen} onOpenChange={setCreateOpen}>
//         <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
//           <DialogHeader><DialogTitle>Generate Complete Baby Blueprint Report</DialogTitle></DialogHeader>
//           <BabyReportForm values={createForm} onChange={setCreateForm} />
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
//             <Button onClick={handleCreate} disabled={saving}>{saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Create</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Edit */}
//       <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
//         <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
//           <DialogHeader><DialogTitle>Edit report {editTarget?.report_id}</DialogTitle></DialogHeader>
//           <BabyReportForm values={editForm} onChange={setEditForm} includeStatus />
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
//             <Button onClick={handleSaveEdit} disabled={saving}>{saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Save</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Preview */}
//       <Dialog open={!!viewTarget} onOpenChange={(o) => { if (!o) { setViewTarget(null); setPreviewUrl(null); } }}>
//         <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
//           <DialogHeader><DialogTitle>{viewTarget?.customer_name} — {viewTarget?.report_id}</DialogTitle></DialogHeader>
//           {viewTarget && (
//             <div className="space-y-4">
//               <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
//                 <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium">{viewTarget.email}</p></div>
//                 <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium">{viewTarget.phone || "—"}</p></div>
//                 <div><p className="text-xs text-muted-foreground">DOB</p><p className="font-medium">{formatDate(viewTarget.dob)}</p></div>
//                 <div><p className="text-xs text-muted-foreground">Option 1</p><p className="font-medium">{viewTarget.option1_name}</p></div>
//                 <div><p className="text-xs text-muted-foreground">Option 2</p><p className="font-medium">{viewTarget.option2_name}</p></div>
//                 <div><p className="text-xs text-muted-foreground">Nick Name</p><p className="font-medium">{viewTarget.nick_name || "—"}</p></div>
//                 <div><p className="text-xs text-muted-foreground">Generated by</p><p className="font-medium">{generatedByLabel(viewTarget.generated_by)}</p></div>
//               </div>
//               {previewUrl ? (
//                 <iframe title="Report preview" src={previewUrl} className="h-[65vh] w-full rounded-md border" />
//               ) : (
//                 <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-md border text-sm text-muted-foreground">
//                   <FileX2 className="h-8 w-8" />
//                   PDF not generated yet.
//                   <Button size="sm" onClick={() => runGeneratePdf(viewTarget)} disabled={generatingId === viewTarget.id}>
//                     {generatingId === viewTarget.id && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Generate PDF
//                   </Button>
//                 </div>
//               )}
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Email */}
//       <Dialog open={!!emailTarget} onOpenChange={(o) => !o && !sendingEmail && closeEmailDialog()}>
//         <DialogContent className="max-w-xl">
//           <DialogHeader><DialogTitle>Send Email</DialogTitle></DialogHeader>
//           <div className="space-y-3">
//             <div><Label htmlFor="pbn_email_to">To</Label><Input id="pbn_email_to" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} /></div>
//             <div><Label htmlFor="pbn_email_subject">Subject</Label><Input id="pbn_email_subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} /></div>
//             <div><Label htmlFor="pbn_email_msg">Message</Label><Textarea id="pbn_email_msg" rows={10} value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} /></div>
//             <p className="text-xs text-muted-foreground">The report PDF is attached automatically.</p>
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={closeEmailDialog} disabled={sendingEmail}>Cancel</Button>
//             <Button onClick={confirmSendEmail} disabled={sendingEmail}>{sendingEmail && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Send Email</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Regenerate confirm */}
//       <AlertDialog open={!!regenerateTarget} onOpenChange={(o) => !o && setRegenerateTarget(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Regenerate this PDF?</AlertDialogTitle>
//             <AlertDialogDescription>The existing PDF for {regenerateTarget?.report_id} will be replaced.</AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={() => regenerateTarget && runGeneratePdf(regenerateTarget)}>Regenerate</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//       {/* Delete */}
//       <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete this report?</AlertDialogTitle>
//             <AlertDialogDescription>{deleteTarget?.customer_name} ({deleteTarget?.report_id}) will be removed permanently.</AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//       <AlertDialog open={confirmBulkDelete} onOpenChange={setConfirmBulkDelete}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete {selectedIds.size} report{selectedIds.size === 1 ? "" : "s"}?</AlertDialogTitle>
//             <AlertDialogDescription>They will be removed permanently.</AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handleBulkDelete}>Delete</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </AdminPage>
//   );
// }


import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus, Loader2, Trash2, Pencil, FileCog, Download, Printer, Mail, Eye, MoreVertical, RefreshCw, Search,
  Calendar as CalendarIcon, BadgeCheck, FileX2, ChevronLeft, ChevronRight, X,
} from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

import { AdminPage } from "@/components/admin/AdminPage";
import { legacyDatabase as supabase } from "@/lib/legacy-database-client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { generateCompleteBabyBlueprintReportPdf, completeBabyBlueprintReportPdfToBlob } from "@/components/CompleteBabyBlueprintReportGenerator";
import {
  BABY_NAME_PREFERENCE_OPTIONS, EMPTY_BABY_FORM, buildBabyCustomerName, normaliseAlphabet, validateBabyForm,
  type BabyNamePreference, type BabyReportFormValues, type BabyReportStatus,
  isNaName,
} from "@/lib/baby-reports/complete-baby-blueprint/form";

const TABLE_NAME = "complete_baby_blueprint_reports";
const STORAGE_BUCKET = "complete-baby-blueprint-reports";
const PROFILES_TABLE = "profiles";
const PAGE_SIZE = 10;
const DRAFT_KEY = "complete-baby-blueprint-create-report-draft";

interface BabyReportRow {
  id: string;
  report_id: string;
  customer_name: string;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  father_name?: string | null;
  is_middle_name_father_husband: boolean;
  gender: string | null;
  email: string;
  phone: string | null;
  dob: string;
  first_alphabet: string;
  option1_name: string;
  option2_name: string;
  nick_name: string | null;
  preference: BabyNamePreference;
  status: BabyReportStatus;
  pdf_url: string | null;
  generated_by?: string | null;
  created_at: string;
}

const STATUS_BADGE: Record<BabyReportStatus, string> = {
  draft: "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-100",
  generating: "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100",
  completed: "bg-green-100 text-green-800 border-green-300 hover:bg-green-100",
  failed: "bg-red-100 text-red-800 border-red-300 hover:bg-red-100",
  archived: "bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-200",
};

const STATUS_LABEL: Record<BabyReportStatus, string> = {
  draft: "Draft", generating: "Generating", completed: "Completed", failed: "Failed", archived: "Archived",
};

function generateReportId() {
  return `CBB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function loadDraft(): BabyReportFormValues {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? { ...EMPTY_BABY_FORM, ...JSON.parse(raw) } : EMPTY_BABY_FORM;
  } catch {
    return EMPTY_BABY_FORM;
  }
}

function rowToForm(r: BabyReportRow): BabyReportFormValues {
  return {
    first_name: r.first_name ?? "",
    middle_name: r.middle_name ?? "",
    is_middle_name_father_husband: r.is_middle_name_father_husband,
    last_name: r.last_name ?? "",
    father_name: r.father_name ?? "",
    gender: r.gender ?? "",
    email: r.email,
    phone: r.phone ?? "",
    dob: r.dob,
    first_alphabet: r.first_alphabet,
    option1_name: r.option1_name,
    option2_name: r.option2_name,
    nick_name: r.nick_name ?? "",
    preference: r.preference,
    status: r.status,
  };
}

function formToColumns(v: BabyReportFormValues) {
  return {
    customer_name: buildBabyCustomerName(v),
    first_name: v.first_name.trim(),
    middle_name: v.middle_name.trim() || null,
    last_name: v.last_name.trim() || null,
    father_name: v.father_name.trim() || null,
    is_middle_name_father_husband: v.middle_name.trim() ? v.is_middle_name_father_husband : false,
    gender: v.gender,
    email: v.email.trim(),
    phone: v.phone.trim(),
    dob: v.dob,
    first_alphabet: v.first_alphabet,
    option1_name: v.option1_name.trim(),
    option2_name: v.option2_name.trim(),
    nick_name: v.nick_name.trim() || null,
    preference: v.preference,
    status: v.status,
  };
}

/** The "Generate Report" form — field order follows the client's list. */
function BabyReportForm({ values, onChange, includeStatus }: {
  values: BabyReportFormValues;
  onChange: (v: BabyReportFormValues) => void;
  includeStatus?: boolean;
}) {
  const set = <K extends keyof BabyReportFormValues>(key: K, value: BabyReportFormValues[K]) =>
    onChange({ ...values, [key]: value });
  const hasMiddle = values.middle_name.trim().length > 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="pbn_first_name">First Name</Label>
        <Input id="pbn_first_name" value={values.first_name} onChange={(e) => set("first_name", e.target.value)} placeholder="First name" />
      </div>
      <div>
        <Label htmlFor="pbn_middle_name">Middle Name</Label>
        <Input
          id="pbn_middle_name"
          value={values.middle_name}
          onChange={(e) => {
            const next = e.target.value;
            onChange({ ...values, middle_name: next, is_middle_name_father_husband: next.trim() ? values.is_middle_name_father_husband : false });
          }}
          placeholder="Middle name"
        />
      </div>
      {hasMiddle && (
        <div className="sm:col-span-2">
          <Label htmlFor="pbn_is_father">Is Middle Name Father's / Husband's Name?</Label>
          <Select value={values.is_middle_name_father_husband ? "yes" : "no"} onValueChange={(v) => set("is_middle_name_father_husband", v === "yes")}>
            <SelectTrigger id="pbn_is_father"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="yes">Yes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div>
        <Label htmlFor="pbn_last_name">Last Name</Label>
        <Input id="pbn_last_name" value={values.last_name} onChange={(e) => set("last_name", e.target.value)} placeholder="Last name" />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="pbn_father_name">Father's Name</Label>
        <Input id="pbn_father_name" value={values.father_name} onChange={(e) => set("father_name", e.target.value)} placeholder="Father's name (shown on the Personal Information page)" />
      </div>
      <div>
        <Label htmlFor="pbn_gender">Gender</Label>
        <Select value={values.gender} onValueChange={(v) => set("gender", v)}>
          <SelectTrigger id="pbn_gender"><SelectValue placeholder="Select gender" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="pbn_email">Email</Label>
        <Input id="pbn_email" type="email" value={values.email} onChange={(e) => set("email", e.target.value)} placeholder="name@example.com" />
      </div>
      <div>
        <Label htmlFor="pbn_phone">WhatsApp Number</Label>
        <Input id="pbn_phone" value={values.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91..." />
      </div>
      <div>
        <Label htmlFor="pbn_dob">DOB</Label>
        <Input id="pbn_dob" type="date" value={values.dob} onChange={(e) => set("dob", e.target.value)} />
      </div>
      <div>
        <Label htmlFor="pbn_first_alphabet">First Alphabet</Label>
        <Input
          id="pbn_first_alphabet"
          value={values.first_alphabet}
          maxLength={1}
          onChange={(e) => set("first_alphabet", normaliseAlphabet(e.target.value))}
          placeholder="A–Z"
          className="uppercase"
        />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="pbn_option1">Option 1: First Name + Middle &amp; Last Name</Label>
        <Input id="pbn_option1" value={values.option1_name} onChange={(e) => set("option1_name", e.target.value)} placeholder="Full name, e.g. Shanvi S Das" />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="pbn_option2">Option 2: First Name + Middle &amp; Last Name (type NA if none)</Label>
        <Input id="pbn_option2" value={values.option2_name} onChange={(e) => set("option2_name", e.target.value)} placeholder="Full name, e.g. Shanvi Dass — or NA" />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="pbn_nick_name">Nick Name (optional)</Label>
        <Input id="pbn_nick_name" value={values.nick_name} onChange={(e) => set("nick_name", e.target.value)} placeholder="e.g. Shanu — leave empty to skip the Nick Name page" />
        <p className="mt-1 text-xs text-muted-foreground">If filled, the report includes the Nick Name Recommendation page (page 23). If empty, that page is left out.</p>
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="pbn_preference">Preference</Label>
        <Select value={values.preference} onValueChange={(v) => set("preference", v as BabyNamePreference)}>
          <SelectTrigger id="pbn_preference"><SelectValue placeholder="Select preference" /></SelectTrigger>
          <SelectContent>
            {BABY_NAME_PREFERENCE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {includeStatus && (
        <div className="sm:col-span-2">
          <Label htmlFor="pbn_status">Status</Label>
          <Select value={values.status} onValueChange={(v) => set("status", v as BabyReportStatus)}>
            <SelectTrigger id="pbn_status"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(STATUS_LABEL) as BabyReportStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function withCacheBust(url: string | null): string | null {
  if (!url) return null;
  return `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`;
}

function errMsg(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err && typeof (err as { message?: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  return fallback;
}

async function getCurrentAdminId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

/** Download name: "<Option 1 name>_Complete Baby Blueprint_Ankshaastra.pdf" */
function buildDownloadFilename(r: BabyReportRow): string {
  const base = ([r.option1_name, r.option2_name].find((n) => !isNaName(n)) || r.customer_name || "Report").replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, " ").trim() || "Report";
  return `${base}_Complete Baby Blueprint_Ankshaastra.pdf`;
}

/** Supabase object keys: keep letters, digits, spaces and a few safe symbols; everything else becomes "_". */
function storageSafeName(name: string): string {
  return name.normalize("NFKD").replace(/[^A-Za-z0-9 _.\-()&]/g, "_").replace(/_+/g, "_");
}

/** Object path inside the bucket, taken from a public URL (null if it isn't one of ours). */
function storagePathFromUrl(url: string | null): string | null {
  if (!url) return null;
  const marker = `/${STORAGE_BUCKET}/`;
  const i = url.indexOf(marker);
  if (i < 0) return null;
  const rest = url.slice(i + marker.length).split("?")[0];
  try { return decodeURIComponent(rest); } catch { return rest; }
}

export default function CompleteBabyBlueprintReports() {
  const { toast } = useToast();

  const [rows, setRows] = useState<BabyReportRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BabyReportStatus | "all">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<BabyReportFormValues>(() => loadDraft());
  const [editTarget, setEditTarget] = useState<BabyReportRow | null>(null);
  const [editForm, setEditForm] = useState<BabyReportFormValues>(EMPTY_BABY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<BabyReportRow | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [regenerateTarget, setRegenerateTarget] = useState<BabyReportRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const [viewTarget, setViewTarget] = useState<BabyReportRow | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [emailTarget, setEmailTarget] = useState<BabyReportRow | null>(null);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  const [generatedByNames, setGeneratedByNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);
  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter, sortOrder, dateRange]);
  useEffect(() => { setSelectedIds(new Set()); }, [page, debouncedSearch, statusFilter, sortOrder, dateRange]);

  // keep the in-progress "Generate Report" form across reloads
  useEffect(() => {
    try { window.localStorage.setItem(DRAFT_KEY, JSON.stringify(createForm)); } catch { /* ignore */ }
  }, [createForm]);

  const resolveGeneratedByNames = useCallback(async (ids: (string | null | undefined)[]) => {
    const unique = Array.from(new Set(ids.filter((id): id is string => !!id)));
    if (unique.length === 0) return;
    try {
      const { data, error } = await supabase.from(PROFILES_TABLE).select("user_id, full_name").in("user_id", unique);
      if (error || !data) return;
      setGeneratedByNames((prev) => {
        const next = { ...prev };
        for (const row of data as { user_id: string; full_name: string | null }[]) next[row.user_id] = row.full_name || "Unknown";
        return next;
      });
    } catch { /* non-critical */ }
  }, []);

  const generatedByLabel = (id: string | null | undefined): string => (!id ? "—" : generatedByNames[id] ?? "…");

  const fetchRows = useCallback(async (opts?: { silent?: boolean }) => {
    opts?.silent ? setRefreshing(true) : setLoading(true);
    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      let query = supabase.from(TABLE_NAME).select("*", { count: "exact" });
      if (debouncedSearch) {
        const term = debouncedSearch.replace(/%/g, "");
        query = query.or(`customer_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%,report_id.ilike.%${term}%`);
      }
      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      if (dateRange?.from) query = query.gte("created_at", dateRange.from.toISOString());
      if (dateRange?.to) {
        const end = new Date(dateRange.to);
        end.setHours(23, 59, 59, 999);
        query = query.lte("created_at", end.toISOString());
      }
      query = query.order("created_at", { ascending: sortOrder === "oldest" }).range(from, to);
      const { data, error, count } = await query;
      if (error) throw error;
      const list = (data ?? []) as BabyReportRow[];
      setRows(list);
      setTotalCount(count ?? 0);
      resolveGeneratedByNames(list.map((r) => r.generated_by));
    } catch (err) {
      console.error(err);
      toast({ title: "Could not load reports", description: errMsg(err, "Unexpected error while fetching reports."), variant: "destructive" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, statusFilter, sortOrder, dateRange, resolveGeneratedByNames]);

  useEffect(() => { fetchRows(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [page, debouncedSearch, statusFilter, sortOrder, dateRange]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const emptyState = useMemo(() => !loading && rows.length === 0, [loading, rows]);

  /* ---------------------------- Actions ---------------------------- */

  const handleCreate = async () => {
    const problem = validateBabyForm(createForm);
    if (problem) {
      toast({ title: "Missing details", description: problem, variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from(TABLE_NAME).insert({ report_id: generateReportId(), ...formToColumns(createForm), pdf_url: null });
    setSaving(false);
    if (error) {
      toast({ title: "Could not create report", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Report created", description: "Complete Baby Blueprint Report submission added." });
    setCreateOpen(false);
    setCreateForm(EMPTY_BABY_FORM);
    try { window.localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    fetchRows({ silent: true });
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    const problem = validateBabyForm(editForm);
    if (problem) {
      toast({ title: "Missing details", description: problem, variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from(TABLE_NAME).update({ ...formToColumns(editForm), updated_at: new Date().toISOString() }).eq("id", editTarget.id);
    setSaving(false);
    if (error) {
      toast({ title: "Could not save changes", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Report updated" });
    setEditTarget(null);
    fetchRows({ silent: true });
  };

  const handleChangeStatus = async (r: BabyReportRow, status: BabyReportStatus) => {
    const { error } = await supabase.from(TABLE_NAME).update({ status, updated_at: new Date().toISOString() }).eq("id", r.id);
    if (error) {
      toast({ title: "Could not change status", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Status updated", description: `${r.report_id} → ${STATUS_LABEL[status]}` });
    fetchRows({ silent: true });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from(TABLE_NAME).delete().eq("id", deleteTarget.id);
    if (error) {
      toast({ title: "Could not delete report", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Report deleted" });
      fetchRows({ silent: true });
    }
    setDeleteTarget(null);
  };

  const openPreview = (r: BabyReportRow) => {
    setViewTarget(r);
    setPreviewUrl(withCacheBust(r.pdf_url));
  };

  const runGeneratePdf = async (r: BabyReportRow) => {
    setGeneratingId(r.id);
    try {
      const bytes = await generateCompleteBabyBlueprintReportPdf({
        reportId: r.report_id,
        customerName: r.customer_name,
        firstName: r.first_name ?? "",
        middleName: r.middle_name ?? "",
        lastName: r.last_name ?? "",
        fatherName: r.father_name ?? "",
        isMiddleNameFatherHusband: r.is_middle_name_father_husband,
        gender: r.gender ?? "",
        email: r.email,
        phone: r.phone ?? "",
        dob: r.dob,
        firstAlphabet: r.first_alphabet,
        option1Name: r.option1_name,
        option2Name: r.option2_name,
        nickName1: r.nick_name ?? "",
        preference: r.preference,
      });

      const blob = completeBabyBlueprintReportPdfToBlob(bytes);
      // Stored under the readable file name so Preview / Print / "Save as" show it too:
      //   <report id>/<Option 1 name>_Complete Baby Blueprint_Ankshaastra.pdf
      const filePath = `${r.report_id}/${storageSafeName(buildDownloadFilename(r))}`;
      const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, blob, { contentType: "application/pdf", upsert: true });
      if (uploadError) throw uploadError;
      // The name can change (e.g. Option 1 edited) or an older PDF used the plain "<report id>.pdf" name — remove the stale file.
      const oldPath = storagePathFromUrl(r.pdf_url);
      if (oldPath && oldPath !== filePath) {
        void supabase.storage.from(STORAGE_BUCKET).remove([oldPath]);
      }
      const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
      const pdfUrl = publicUrlData?.publicUrl ?? null;
      const generatedById = await getCurrentAdminId();

      const { error: updateError } = await supabase
        .from(TABLE_NAME)
        .update({ pdf_url: pdfUrl, status: "completed", generated_by: generatedById, updated_at: new Date().toISOString() })
        .eq("id", r.id);
      if (updateError) throw updateError;

      toast({ title: "PDF generated", description: `Report ${r.report_id} is ready to review.` });
      resolveGeneratedByNames([generatedById]);
      openPreview({ ...r, pdf_url: pdfUrl, status: "completed", generated_by: generatedById });
      fetchRows({ silent: true });
    } catch (err) {
      console.error("[CompleteBabyBlueprintReports] PDF generation failed:", err);
      toast({ title: "PDF generation failed", description: errMsg(err, "Unexpected error while generating the PDF."), variant: "destructive" });
    } finally {
      setGeneratingId(null);
      setRegenerateTarget(null);
    }
  };

  const handleGeneratePdfClick = (r: BabyReportRow) => {
    if (r.pdf_url) setRegenerateTarget(r);
    else runGeneratePdf(r);
  };

  const handleDownloadPdf = async (r: BabyReportRow) => {
    if (!r.pdf_url) {
      toast({ title: "No PDF available", description: "Generate the PDF for this report first.", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch(r.pdf_url);
      if (!res.ok) throw new Error(`Failed to fetch PDF (${res.status})`);
      const blobUrl = URL.createObjectURL(await res.blob());
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = buildDownloadFilename(r);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      toast({ title: "Download failed", description: errMsg(err, "Could not download the PDF."), variant: "destructive" });
    }
  };

  const handlePrint = (r: BabyReportRow) => {
    if (!r.pdf_url) {
      toast({ title: "No PDF available", description: "Generate the PDF for this report first.", variant: "destructive" });
      return;
    }
    const win = window.open(r.pdf_url, "_blank");
    if (win) win.addEventListener("load", () => win.print());
  };

  const openEmailDialog = (r: BabyReportRow) => {
    setEmailTarget(r);
    setEmailTo(r.email || "");
    setEmailSubject(`Your Complete Baby Blueprint Report — ${r.report_id}`);
    setEmailMessage(
      "Namaste, 🙏\n\nPlease find attached the Complete Baby Blueprint Report prepared based on the baby's Date of Birth and numerology analysis.\n\nIt shares the recommended name options and what each of them brings to your child's life.\n\nKindly review it at your convenience.\n\nIf you would like the report to be explained over a phone call, you may request the same.\n\nWarm Regards,\nAnkshaastra – Empower Your Name",
    );
  };

  const closeEmailDialog = () => {
    setEmailTarget(null);
    setEmailTo("");
    setEmailSubject("");
    setEmailMessage("");
  };

  const confirmSendEmail = async () => {
    if (!emailTarget) return;
    if (!emailTo.trim()) { toast({ title: "Recipient email is required", variant: "destructive" }); return; }
    if (!emailSubject.trim()) { toast({ title: "Subject is required", variant: "destructive" }); return; }
    setSendingEmail(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Please sign in again");
      const res = await fetch("/api/complete-baby-blueprint-reports/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reportId: emailTarget.id, to: emailTo.trim(), subject: emailSubject.trim(), message: emailMessage, attachPdf: true }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || "Could not send report email");
      toast({ title: "Email sent", description: `Report ${emailTarget.report_id} was emailed to ${emailTo.trim()}.` });
      closeEmailDialog();
    } catch (err) {
      toast({ title: "Could not send email", description: errMsg(err, "Unexpected error."), variant: "destructive" });
    } finally {
      setSendingEmail(false);
    }
  };

  /* ----------------------------- Selection ----------------------------- */

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  const allSelected = rows.length > 0 && selectedIds.size === rows.length;
  const toggleSelectAll = () => setSelectedIds(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    const { error } = await supabase.from(TABLE_NAME).delete().in("id", ids);
    if (error) toast({ title: "Could not delete reports", description: error.message, variant: "destructive" });
    else toast({ title: `${ids.length} report${ids.length === 1 ? "" : "s"} deleted` });
    setConfirmBulkDelete(false);
    clearSelection();
    fetchRows({ silent: true });
  };

  const handleBulkStatusChange = async (status: BabyReportStatus) => {
    const ids = Array.from(selectedIds);
    const { error } = await supabase.from(TABLE_NAME).update({ status, updated_at: new Date().toISOString() }).in("id", ids);
    if (error) toast({ title: "Could not change status", description: error.message, variant: "destructive" });
    else toast({ title: "Status updated", description: `${ids.length} report${ids.length === 1 ? "" : "s"} → ${STATUS_LABEL[status]}` });
    clearSelection();
    fetchRows({ silent: true });
  };

  const handleBulkDownload = () => {
    rows.filter((r) => selectedIds.has(r.id) && r.pdf_url).forEach((r) => { void handleDownloadPdf(r); });
  };

  return (
    <AdminPage title="Complete Baby Blueprint Reports" loading={false}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link to="/admin/reports" className="text-sm text-muted-foreground hover:text-foreground">← Back to Reports</Link>
            <h2 className="mt-2 text-2xl font-semibold">Complete Baby Blueprint</h2>
            <p className="text-sm text-muted-foreground">Manage all Complete Baby Blueprint Report submissions.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => fetchRows({ silent: true })} disabled={refreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 h-4 w-4" />Generate Report</Button>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name, email, phone or report ID..." className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as BabyReportStatus | "all")}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {(Object.keys(STATUS_LABEL) as BabyReportStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as "newest" | "oldest")}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Sort" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal md:w-[220px]">
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
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => setDateRange(undefined)}>Clear</Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>

        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/50 p-3">
            <span className="text-sm font-medium">{selectedIds.size} selected</span>
            <Button variant="outline" size="sm" onClick={handleBulkDownload}><Download className="mr-1.5 h-4 w-4" />Download</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="outline" size="sm">Change Status</Button></DropdownMenuTrigger>
              <DropdownMenuContent>
                {(Object.keys(STATUS_LABEL) as BabyReportStatus[]).map((s) => (
                  <DropdownMenuItem key={s} onClick={() => handleBulkStatusChange(s)}>{STATUS_LABEL[s]}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="destructive" size="sm" onClick={() => setConfirmBulkDelete(true)}><Trash2 className="mr-1.5 h-4 w-4" />Delete</Button>
            <Button variant="ghost" size="sm" className="ml-auto" onClick={clearSelection}><X className="mr-1 h-4 w-4" />Clear</Button>
          </div>
        )}

        {!loading && !emptyState && (
          <div className="flex items-center gap-2 px-1">
            <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} id="pbn-select-all" />
            <Label htmlFor="pbn-select-all" className="cursor-pointer text-sm text-muted-foreground">Select all on this page</Label>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="space-y-3 p-5">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : emptyState ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 p-16 text-center">
              <FileX2 className="h-14 w-14 text-muted-foreground" />
              <h3 className="text-lg font-medium">No Complete Baby Blueprint Reports Found</h3>
              <p className="max-w-sm text-sm text-muted-foreground">Try adjusting your search or filters, or generate a new report to get started.</p>
              <Button onClick={() => setCreateOpen(true)} className="mt-2"><Plus className="mr-2 h-4 w-4" />Generate Report</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((r) => (
              <Card key={r.id} className="flex flex-col justify-between">
                <CardContent className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <Checkbox checked={selectedIds.has(r.id)} onCheckedChange={() => toggleSelect(r.id)} className="mt-1" />
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{r.report_id}</p>
                        <h3 className="text-base font-semibold leading-tight">{r.customer_name}</h3>
                      </div>
                    </div>
                    <Badge variant="outline" className={STATUS_BADGE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
                    <div className="col-span-2 truncate text-muted-foreground">{r.email}</div>
                    <div className="text-muted-foreground">{r.phone || "—"}</div>
                    <div className="text-muted-foreground">{r.gender || "—"}</div>
                    <div className="text-muted-foreground">DOB: {formatDate(r.dob)}</div>
                    <div className="text-muted-foreground">Created: {formatDate(r.created_at)}</div>
                    <div className="col-span-2 truncate text-muted-foreground">Options: {[r.option1_name, r.option2_name].filter((n) => !isNaName(n)).join(" · ") || "—"}</div>
                    {r.nick_name ? <div className="col-span-2 truncate text-muted-foreground">Nick Name: {r.nick_name}</div> : null}
                    <div className="col-span-2 truncate text-muted-foreground">Generated by: {generatedByLabel(r.generated_by)}</div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    {r.pdf_url ? (
                      <span className="inline-flex items-center gap-1 text-green-700"><BadgeCheck className="h-3.5 w-3.5" /> Report Generated</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted-foreground"><FileX2 className="h-3.5 w-3.5" /> Not Generated</span>
                    )}
                  </div>
                </CardContent>

                <div className="flex flex-wrap items-center gap-1.5 border-t p-3">
                  <Button variant="ghost" size="icon" title="Preview" onClick={() => openPreview(r)}><Eye className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" title="Edit customer details" onClick={() => { setEditTarget(r); setEditForm(rowToForm(r)); }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" title={r.pdf_url ? "Regenerate PDF" : "Generate PDF"} onClick={() => handleGeneratePdfClick(r)} disabled={generatingId === r.id}>
                    {generatingId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCog className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" title="Download PDF" onClick={() => handleDownloadPdf(r)} disabled={!r.pdf_url}><Download className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" title="Print" onClick={() => handlePrint(r)} disabled={!r.pdf_url}><Printer className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" title="Send Email" onClick={() => openEmailDialog(r)} disabled={!r.pdf_url}><Mail className="h-4 w-4" /></Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" title="More" className="ml-auto"><MoreVertical className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                      {(Object.keys(STATUS_LABEL) as BabyReportStatus[]).map((s) => (
                        <DropdownMenuItem key={s} disabled={s === r.status} onClick={() => handleChangeStatus(r, s)}>{STATUS_LABEL[s]}</DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setDeleteTarget(r)}>
                        <Trash2 className="mr-2 h-4 w-4" />Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && !emptyState && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages} &middot; {totalCount} report{totalCount === 1 ? "" : "s"}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                <ChevronLeft className="mr-1 h-4 w-4" />Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                Next<ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>Generate Complete Baby Blueprint Report</DialogTitle></DialogHeader>
          <BabyReportForm values={createForm} onChange={setCreateForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>Edit report {editTarget?.report_id}</DialogTitle></DialogHeader>
          <BabyReportForm values={editForm} onChange={setEditForm} includeStatus />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={saving}>{saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview */}
      <Dialog open={!!viewTarget} onOpenChange={(o) => { if (!o) { setViewTarget(null); setPreviewUrl(null); } }}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
          <DialogHeader><DialogTitle>{viewTarget?.customer_name} — {viewTarget?.report_id}</DialogTitle></DialogHeader>
          {viewTarget && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium">{viewTarget.email}</p></div>
                <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium">{viewTarget.phone || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">DOB</p><p className="font-medium">{formatDate(viewTarget.dob)}</p></div>
                <div><p className="text-xs text-muted-foreground">Option 1</p><p className="font-medium">{viewTarget.option1_name}</p></div>
                <div><p className="text-xs text-muted-foreground">Option 2</p><p className="font-medium">{isNaName(viewTarget.option2_name) ? "—" : viewTarget.option2_name}</p></div>
                <div><p className="text-xs text-muted-foreground">Nick Name</p><p className="font-medium">{viewTarget.nick_name || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Generated by</p><p className="font-medium">{generatedByLabel(viewTarget.generated_by)}</p></div>
              </div>
              {previewUrl ? (
                <iframe title="Report preview" src={previewUrl} className="h-[65vh] w-full rounded-md border" />
              ) : (
                <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-md border text-sm text-muted-foreground">
                  <FileX2 className="h-8 w-8" />
                  PDF not generated yet.
                  <Button size="sm" onClick={() => runGeneratePdf(viewTarget)} disabled={generatingId === viewTarget.id}>
                    {generatingId === viewTarget.id && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Generate PDF
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Email */}
      <Dialog open={!!emailTarget} onOpenChange={(o) => !o && !sendingEmail && closeEmailDialog()}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Send Email</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label htmlFor="pbn_email_to">To</Label><Input id="pbn_email_to" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} /></div>
            <div><Label htmlFor="pbn_email_subject">Subject</Label><Input id="pbn_email_subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} /></div>
            <div><Label htmlFor="pbn_email_msg">Message</Label><Textarea id="pbn_email_msg" rows={10} value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} /></div>
            <p className="text-xs text-muted-foreground">The report PDF is attached automatically.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEmailDialog} disabled={sendingEmail}>Cancel</Button>
            <Button onClick={confirmSendEmail} disabled={sendingEmail}>{sendingEmail && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Send Email</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regenerate confirm */}
      <AlertDialog open={!!regenerateTarget} onOpenChange={(o) => !o && setRegenerateTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate this PDF?</AlertDialogTitle>
            <AlertDialogDescription>The existing PDF for {regenerateTarget?.report_id} will be replaced.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => regenerateTarget && runGeneratePdf(regenerateTarget)}>Regenerate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this report?</AlertDialogTitle>
            <AlertDialogDescription>{deleteTarget?.customer_name} ({deleteTarget?.report_id}) will be removed permanently.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmBulkDelete} onOpenChange={setConfirmBulkDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} report{selectedIds.size === 1 ? "" : "s"}?</AlertDialogTitle>
            <AlertDialogDescription>They will be removed permanently.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPage>
  );
}
