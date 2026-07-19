import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage } from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, FileSpreadsheet, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type ValidationIssue = {
  level: "error" | "warning" | "info";
  code: string;
  message: string;
  invoiceNumber?: string;
};

type Dashboard = {
  totalInvoices: number;
  totalSales: number;
  taxableValue: number;
  cgstCollected: number;
  sgstCollected: number;
  igstCollected: number;
  b2bCount: number;
  b2csCount: number;
  b2clCount: number;
  creditNotesCount: number;
  validInvoices: number;
  warningInvoices: number;
  errorInvoices: number;
  autoCorrectedInvoices: number;
};

type ValidationReport = {
  period: string;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  info: ValidationIssue[];
  readyToFile: boolean;
  filingStatus: "draft" | "ready_to_file" | "filed";
  dashboard?: Dashboard;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function downloadBase64Xlsx(filename: string, base64: string) {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

export default function GstReportsModule() {
  const now = new Date();
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [validating, setValidating] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [report, setReport] = useState<ValidationReport | null>(null);

  const yearOptions = useMemo(() => {
    const current = now.getFullYear();
    return Array.from({ length: 5 }, (_, i) => String(current - i));
  }, [now]);

  const canExport = report ? report.errors.length === 0 : false;

  const runValidate = async () => {
    setValidating(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Not signed in");

      const res = await fetch(
        `/api/admin/gstr-reports?year=${year}&month=${month}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const withPeriod = (await res.json()) as ValidationReport & { error?: string };
      if (!res.ok) throw new Error(withPeriod.error || "Validation failed");

      setReport(withPeriod);
      if (withPeriod.errors.length === 0) {
        toast.success("Validation passed — warnings do not block filing");
      } else {
        toast.error(`${withPeriod.errors.length} error(s) must be fixed before filing`);
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Validation failed");
    } finally {
      setValidating(false);
    }
  };

  const postAction = async (action: string, extra?: Record<string, unknown>) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) throw new Error("Not signed in");

    const res = await fetch("/api/admin/gstr-reports", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action, year: Number(year), month: Number(month), ...extra }),
    });
    const data = (await res.json()) as ValidationReport & { error?: string; filename?: string; data?: string };
    if (!res.ok) {
      if (data.errors) setReport(data);
      throw new Error(data.error || "Request failed");
    }
    return data;
  };

  const exportReport = async (type: string, label: string) => {
    setExporting(type);
    try {
      const result = await postAction("export", { type });
      if (result.filename && result.data) {
        downloadBase64Xlsx(result.filename, result.data);
        toast.success(`${label} downloaded`);
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(null);
    }
  };

  const markReady = async () => {
    try {
      await postAction("mark-ready");
      toast.success("Marked Ready To File");
      await runValidate();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not update status");
    }
  };

  const markFiled = async () => {
    try {
      await postAction("mark-filed");
      toast.success("Marked as Filed");
      await runValidate();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not update status");
    }
  };

  const d = report?.dashboard;
  const statusLabel = {
    draft: "Draft",
    ready_to_file: "Ready To File",
    filed: "Filed",
  }[report?.filingStatus || "draft"];

  return (
    <AdminPage
      title="GST & GSTR-1 Reports"
    //   description="ANKSHAASTRA OCCULT EXPERTS LLP — SAC 999799, UP (09), monthly GSTR-1. Only errors block filing."
    >
      <div className="space-y-6 max-w-5xl">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Year</p>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Month</p>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MONTHS.map((label, i) => (
                  <SelectItem key={label} value={String(i + 1)}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={runValidate} disabled={validating}>
            {validating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
            Validate Period
          </Button>
          {canExport && (
            <>
              <Button variant="secondary" onClick={markReady}>Mark Ready To File</Button>
              <Button variant="outline" onClick={markFiled}>Mark Filed</Button>
            </>
          )}
        </div>

        {report && (
          <Alert variant={report.errors.length ? "destructive" : "default"}>
            {report.errors.length ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            <AlertTitle className="flex items-center gap-2 flex-wrap">
              Period {report.period}
              <Badge variant={report.errors.length ? "destructive" : "default"}>{statusLabel}</Badge>
              {report.warnings.length > 0 && (
                <Badge variant="outline">{report.warnings.length} warning(s)</Badge>
              )}
            </AlertTitle>
            <AlertDescription className="mt-2 space-y-1 max-h-48 overflow-y-auto">
              {report.errors.map((issue) => (
                <p key={`e-${issue.code}-${issue.invoiceNumber}`} className="text-sm"><strong>Error:</strong> {issue.message}</p>
              ))}
              {report.warnings.map((issue) => (
                <p key={`w-${issue.code}-${issue.invoiceNumber}`} className="text-sm text-muted-foreground"><strong>Warning:</strong> {issue.message}</p>
              ))}
              {report.info.slice(0, 10).map((issue) => (
                <p key={`i-${issue.code}-${issue.invoiceNumber}`} className="text-sm text-muted-foreground"><strong>Info:</strong> {issue.message}</p>
              ))}
              {report.info.length > 10 && (
                <p className="text-xs text-muted-foreground">+ {report.info.length - 10} auto-correction info messages</p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {d && (
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            <StatCard label="Total Invoices" value={d.totalInvoices} />
            <StatCard label="Total Sales" value={`₹${d.totalSales.toLocaleString("en-IN")}`} />
            <StatCard label="Taxable Value" value={`₹${d.taxableValue.toLocaleString("en-IN")}`} />
            <StatCard label="CGST" value={`₹${d.cgstCollected.toLocaleString("en-IN")}`} />
            <StatCard label="SGST" value={`₹${d.sgstCollected.toLocaleString("en-IN")}`} />
            <StatCard label="IGST" value={`₹${d.igstCollected.toLocaleString("en-IN")}`} />
            <StatCard label="B2B" value={d.b2bCount} />
            <StatCard label="B2CS" value={d.b2csCount} />
            <StatCard label="B2CL" value={d.b2clCount} />
            <StatCard label="Credit Notes" value={d.creditNotesCount} />
            <StatCard label="Valid" value={d.validInvoices} />
            <StatCard label="Warnings" value={d.warningInvoices} />
            <StatCard label="Errors" value={d.errorInvoices} />
            <StatCard label="Auto Corrected" value={d.autoCorrectedInvoices} />
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { type: "gstr1", label: "GSTR-1 Excel" },
            { type: "summary", label: "GST Summary Excel" },
            { type: "sales", label: "Monthly Sales Register" },
            { type: "sac", label: "SAC Summary Report" },
          ].map(({ type, label }) => (
            <Button
              key={type}
              variant="outline"
              className="justify-start h-auto py-3"
              disabled={!!exporting || !canExport}
              onClick={() => exportReport(type, label)}
            >
              {exporting === type ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 mr-2 shrink-0" />
              )}
              {label}
            </Button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          GSTIN 09AAFFE7583B1ZD · SAC 999799 · UP (09). B2CS rows are aggregated by state and rate.
          Warnings (missing state, address) do not block export or filing.
        </p>
      </div>
    </AdminPage>
  );
}

