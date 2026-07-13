import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileSearch,
  RefreshCw,
  Plus,
  Search,
  Eye,
  Pencil,
  FileCog,
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
} from "lucide-react";
import { format } from "date-fns";
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

import { generateNameCheckReportPdf, nameCheckReportPdfToBlob } from "@/components/NameCheckReportGenerator";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ReportStatus = "draft" | "generating" | "completed" | "failed" | "archived";

interface NameCheckReportRow {
  id: string;
  report_id: string;
  customer_name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  status: ReportStatus;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

interface ReportFormValues {
  customer_name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  status: ReportStatus;
}

const EMPTY_FORM: ReportFormValues = {
  customer_name: "",
  email: "",
  phone: "",
  dob: "",
  gender: "",
  status: "draft",
};

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
  const [viewTarget, setViewTarget] = useState<NameCheckReportRow | null>(null);
  const [editTarget, setEditTarget] = useState<NameCheckReportRow | null>(null);
  const [editForm, setEditForm] = useState<ReportFormValues>(EMPTY_FORM);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<ReportFormValues>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<NameCheckReportRow | null>(null);
  const [regenerateTarget, setRegenerateTarget] = useState<NameCheckReportRow | null>(null);

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
    if (!createForm.customer_name || !createForm.email || !createForm.dob) {
      toast({ title: "Missing details", description: "Name, email and date of birth are required.", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const newReportId = generateReportId();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert({
          report_id: newReportId,
          customer_name: createForm.customer_name,
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
      customer_name: report.customer_name,
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
          customer_name: editForm.customer_name,
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

      toast({ title: "Report updated", description: `${editForm.customer_name}'s record has been saved.` });
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

  const runGeneratePdf = async (report: NameCheckReportRow) => {
    setGeneratingId(report.id);
    try {
      const bytes = await generateNameCheckReportPdf({
        reportId: report.report_id,
        customerName: report.customer_name,
        email: report.email,
        phone: report.phone,
        dob: report.dob,
        gender: report.gender,
        generatedDate: new Date().toISOString(),
      });

      const blob = nameCheckReportPdfToBlob(bytes);
      const filePath = `${report.report_id}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, blob, { contentType: "application/pdf", upsert: true });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
      const pdfUrl = publicUrlData?.publicUrl ?? null;

      const { error: updateError } = await supabase
        .from(TABLE_NAME)
        .update({ pdf_url: pdfUrl, status: "completed", updated_at: new Date().toISOString() })
        .eq("id", report.id);
      if (updateError) throw updateError;

      logActivity(report.id, "regenerate", { report_id: report.report_id });

      toast({ title: "PDF generated", description: `Report ${report.report_id} is ready to download.` });
      fetchReports({ silent: true });
    } catch (err) {
      toast({
        title: "PDF generation failed",
        description: err instanceof Error ? err.message : "Unexpected error while generating the PDF.",
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

  const handleDownloadPdf = (report: NameCheckReportRow) => {
    if (!report.pdf_url) {
      toast({ title: "No PDF available", description: "Generate the PDF for this report first.", variant: "destructive" });
      return;
    }
    const link = document.createElement("a");
    link.href = report.pdf_url;
    link.download = `${report.report_id}.pdf`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logActivity(report.id, "download");
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
                  <Button variant="ghost" size="icon" title="View" onClick={() => setViewTarget(report)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Edit" onClick={() => openEditDialog(report)}>
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

      {/* View Dialog */}
      <Dialog open={!!viewTarget} onOpenChange={(open) => !open && setViewTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSearch className="h-5 w-5" /> Report Details
            </DialogTitle>
            <DialogDescription>{viewTarget?.report_id}</DialogDescription>
          </DialogHeader>
          {viewTarget && (
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
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">{formatDate(viewTarget.created_at)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-medium">{formatDate(viewTarget.updated_at)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Report Generated</p>
                <p className="font-medium">{viewTarget.pdf_url ? "Yes" : "No"}</p>
              </div>
              {viewTarget.pdf_url && (
                <div className="col-span-2 overflow-hidden rounded-md border" style={{ height: 420 }}>
                  <iframe src={viewTarget.pdf_url} title="PDF Preview" className="h-full w-full" />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewTarget(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
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
      <div className="sm:col-span-2">
        <Label htmlFor="customer_name">Customer Name</Label>
        <Input
          id="customer_name"
          value={values.customer_name}
          onChange={(e) => set("customer_name", e.target.value)}
          placeholder="Full name"
        />
      </div>
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