import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage } from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, FileSpreadsheet, ShieldCheck, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

type ValidationIssue = {
  level: "error" | "warning";
  code: string;
  message: string;
  invoiceNumber?: string;
};

type ValidationReport = {
  period: string;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  readyToFile: boolean;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

async function apiCall(
  token: string,
  method: "GET" | "POST",
  body?: Record<string, unknown>,
): Promise<unknown> {
  const res = await fetch("/api/admin/gstr-reports", {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: method === "POST" ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw Object.assign(new Error(String(data.error || "Request failed")), { data });
  return data;
}

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
      if (withPeriod.readyToFile) {
        toast.success("Validation passed — ready to export");
      } else {
        toast.error(`${withPeriod.errors?.length || 0} validation error(s) — fix before filing`);
      }
    } catch (e: unknown) {
      const err = e as { message?: string; data?: ValidationReport };
      if (err.data?.errors) setReport(err.data as ValidationReport);
      toast.error(err.message || "Validation failed");
    } finally {
      setValidating(false);
    }
  };

  const exportReport = async (type: string, label: string) => {
    setExporting(type);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Not signed in");

      const result = (await apiCall(token, "POST", {
        action: "export",
        type,
        year: Number(year),
        month: Number(month),
      })) as { filename: string; data: string };

      downloadBase64Xlsx(result.filename, result.data);
      toast.success(`${label} downloaded`);
    } catch (e: unknown) {
      const err = e as { message?: string; data?: ValidationReport };
      if (err.data?.errors) setReport(err.data as ValidationReport);
      toast.error(err.message || "Export failed");
    } finally {
      setExporting(null);
    }
  };

  return (
    <AdminPage
      title="GST & GSTR-1 Reports"
      description="Validate invoices for a filing period and export GSTR-1, SAC summary, sales register, and GST summary workbooks."
    >
      <div className="space-y-6 max-w-3xl">
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
        </div>

        {report && (
          <Alert variant={report.readyToFile ? "default" : "destructive"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="flex items-center gap-2">
              Filing period {report.period}
              <Badge variant={report.readyToFile ? "default" : "destructive"}>
                {report.readyToFile ? "Ready To File" : "Not Ready"}
              </Badge>
            </AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              {report.errors.length === 0 && report.warnings.length === 0 && (
                <p>No validation issues found.</p>
              )}
              {report.errors.map((issue) => (
                <p key={`${issue.code}-${issue.invoiceNumber || issue.message}`} className="text-sm">
                  <strong>Error:</strong> {issue.message}
                </p>
              ))}
              {report.warnings.map((issue) => (
                <p key={`${issue.code}-w-${issue.invoiceNumber || issue.message}`} className="text-sm text-muted-foreground">
                  <strong>Warning:</strong> {issue.message}
                </p>
              ))}
            </AlertDescription>
          </Alert>
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
              disabled={!!exporting || !report?.readyToFile}
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
          Supplier state: Uttar Pradesh (09). B2CS invoices are aggregated by state and GST rate in the GSTR-1 export.
          Exports are blocked when validation errors exist.
        </p>
      </div>
    </AdminPage>
  );
}
