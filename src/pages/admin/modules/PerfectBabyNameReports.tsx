import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Loader2, Trash2, Pencil, FileDown } from "lucide-react";

import { AdminPage } from "@/components/admin/AdminPage";
import { legacyDatabase as supabase } from "@/lib/legacy-database-client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { generatePerfectBabyNameReportPdf, downloadPerfectBabyNameReportPdf } from "@/components/PerfectBabyNameReportGenerator";
import {
  BABY_NAME_PREFERENCE_OPTIONS, EMPTY_BABY_FORM, buildBabyCustomerName, normaliseAlphabet, validateBabyForm,
  type BabyNamePreference, type BabyReportFormValues, type BabyReportStatus,
} from "@/lib/baby-reports/perfect-baby-name/form";

const TABLE_NAME = "perfect_baby_name_reports";
const DRAFT_KEY = "perfect-baby-name-create-report-draft";

interface BabyReportRow {
  id: string;
  report_id: string;
  customer_name: string;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  is_middle_name_father_husband: boolean;
  gender: string | null;
  email: string;
  phone: string | null;
  dob: string;
  first_alphabet: string;
  option1_name: string;
  option2_name: string;
  preference: BabyNamePreference;
  status: BabyReportStatus;
  pdf_url: string | null;
  created_at: string;
}

const STATUS_LABEL: Record<BabyReportStatus, string> = {
  draft: "Draft", generating: "Generating", completed: "Completed", failed: "Failed", archived: "Archived",
};

function generateReportId() {
  return `PBN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
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
    gender: r.gender ?? "",
    email: r.email,
    phone: r.phone ?? "",
    dob: r.dob,
    first_alphabet: r.first_alphabet,
    option1_name: r.option1_name,
    option2_name: r.option2_name,
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
    is_middle_name_father_husband: v.middle_name.trim() ? v.is_middle_name_father_husband : false,
    gender: v.gender,
    email: v.email.trim(),
    phone: v.phone.trim(),
    dob: v.dob,
    first_alphabet: v.first_alphabet,
    option1_name: v.option1_name.trim(),
    option2_name: v.option2_name.trim(),
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
        <Label htmlFor="pbn_option2">Option 2: First Name + Middle &amp; Last Name</Label>
        <Input id="pbn_option2" value={values.option2_name} onChange={(e) => set("option2_name", e.target.value)} placeholder="Full name, e.g. Shanvi Dass" />
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

export default function PerfectBabyNameReports() {
  const { toast } = useToast();
  const [rows, setRows] = useState<BabyReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<BabyReportFormValues>(() => loadDraft());
  const [editTarget, setEditTarget] = useState<BabyReportRow | null>(null);
  const [editForm, setEditForm] = useState<BabyReportFormValues>(EMPTY_BABY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<BabyReportRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from(TABLE_NAME).select("*").order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Could not load reports", description: error.message, variant: "destructive" });
    } else {
      setRows((data ?? []) as BabyReportRow[]);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  // keep the in-progress "Generate Report" form across reloads
  useEffect(() => {
    try { window.localStorage.setItem(DRAFT_KEY, JSON.stringify(createForm)); } catch { /* ignore */ }
  }, [createForm]);

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
    toast({ title: "Report created", description: "Perfect Baby Name Report submission added." });
    setCreateOpen(false);
    setCreateForm(EMPTY_BABY_FORM);
    try { window.localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    fetchRows();
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    const problem = validateBabyForm(editForm);
    if (problem) {
      toast({ title: "Missing details", description: problem, variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({ ...formToColumns(editForm), updated_at: new Date().toISOString() })
      .eq("id", editTarget.id);
    setSaving(false);
    if (error) {
      toast({ title: "Could not save changes", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Report updated" });
    setEditTarget(null);
    fetchRows();
  };

  const handleGeneratePdf = async (r: BabyReportRow) => {
    setGeneratingId(r.id);
    try {
      const bytes = await generatePerfectBabyNameReportPdf({
        reportId: r.report_id,
        customerName: r.customer_name,
        firstName: r.first_name ?? "",
        middleName: r.middle_name ?? "",
        lastName: r.last_name ?? "",
        isMiddleNameFatherHusband: r.is_middle_name_father_husband,
        gender: r.gender ?? "",
        email: r.email,
        phone: r.phone ?? "",
        dob: r.dob,
        firstAlphabet: r.first_alphabet,
        option1Name: r.option1_name,
        option2Name: r.option2_name,
        preference: r.preference,
      });
      downloadPerfectBabyNameReportPdf(bytes, `${r.customer_name.replace(/\s+/g, "_")}_Perfect_Baby_Name_Report_Ankshaastra.pdf`);
      await supabase.from(TABLE_NAME).update({ status: "completed", updated_at: new Date().toISOString() }).eq("id", r.id);
      fetchRows();
    } catch (err) {
      toast({ title: "PDF generation failed", description: err instanceof Error ? err.message : String(err), variant: "destructive" });
    } finally {
      setGeneratingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from(TABLE_NAME).delete().eq("id", deleteTarget.id);
    if (error) {
      toast({ title: "Could not delete report", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Report deleted" });
      fetchRows();
    }
    setDeleteTarget(null);
  };

  return (
    <AdminPage title="Perfect Baby Name Reports" loading={loading} empty={!loading && rows.length === 0} emptyMessage="No reports yet. Click “Generate Report” to add one.">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Link to="/admin/reports" className="text-sm text-muted-foreground hover:text-foreground">← Reports</Link>
          <Button onClick={() => setCreateOpen(true)}><Plus className="mr-1 h-4 w-4" />Generate Report</Button>
        </div>

        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3">Report ID</th><th className="p-3">Name</th><th className="p-3">DOB</th>
                <th className="p-3">Letter</th><th className="p-3">Option 1</th><th className="p-3">Option 2</th>
                <th className="p-3">Status</th><th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3 font-mono text-xs">{r.report_id}</td>
                  <td className="p-3">{r.customer_name}</td>
                  <td className="p-3">{r.dob}</td>
                  <td className="p-3">{r.first_alphabet}</td>
                  <td className="p-3">{r.option1_name}</td>
                  <td className="p-3">{r.option2_name}</td>
                  <td className="p-3"><Badge variant="outline">{STATUS_LABEL[r.status]}</Badge></td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <Button size="icon" variant="ghost" title="Generate & download PDF" disabled={generatingId === r.id} onClick={() => handleGeneratePdf(r)}>
                      {generatingId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => { setEditTarget(r); setEditForm(rowToForm(r)); }}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(r)}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>Generate Perfect Baby Name Report</DialogTitle></DialogHeader>
          <BabyReportForm values={createForm} onChange={setCreateForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </AdminPage>
  );
}
