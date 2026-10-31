/**
 * Name Check — CRM follow-up summary + monthly ZIP download.
 *
 * One row per report that went (or can go) to a customer:
 *   customer details · Mulank · Bhagyank · First Name Total · Full Name Total ·
 *   Compound number + tier · "Name correction advised?" Yes/No · email record ·
 *   follow-up status. The team calls these customers to follow up.
 *
 * Numbers/verdict come from the columns the automatic flow stores on
 * name_check_reports; for older/manual reports (no stored summary) they are
 * calculated on the fly from the same rule-engine the PDF uses.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import JSZip from "jszip";
import { ChevronDown, ChevronUp, Download, Loader2, RefreshCw, RotateCw, Search } from "lucide-react";

import { legacyDatabase as supabase } from "@/lib/legacy-database-client";
import { useToast } from "@/hooks/use-toast";
import { computeNameCheckReportContent } from "@/components/NameCheckReportGenerator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type CrmRow = {
  id: string;
  report_id: string;
  order_id: string | null;
  customer_name: string;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  is_middle_name_father_husband: boolean | null;
  email: string;
  phone: string | null;
  dob: string;
  gender: string | null;
  pdf_url: string | null;
  status: string;
  created_at: string;
  mulank: number | null;
  bhagyank: number | null;
  first_name_total: number | null;
  full_name_total: number | null;
  compound_number: number | null;
  compound_tier: string | null;
  correction_advised: boolean | null;
  auto_status: string | null;
  auto_error: string | null;
  emailed_at: string | null;
  emailed_to: string | null;
  follow_up_status: string | null;
  follow_up_note: string | null;
};

type Summary = {
  mulank: number | null;
  bhagyank: number | null;
  firstTotal: number | null;
  fullTotal: number | null;
  compound: number | null;
  tier: string | null;
  advised: boolean | null;
};

const FOLLOW_UP = [
  { value: "pending", label: "To call" },
  { value: "called", label: "Called" },
  { value: "interested", label: "Interested" },
  { value: "not_interested", label: "Not interested" },
  { value: "converted", label: "Converted" },
];

function summaryOf(r: CrmRow): Summary {
  if (r.mulank !== null && r.bhagyank !== null && r.correction_advised !== null) {
    return {
      mulank: r.mulank,
      bhagyank: r.bhagyank,
      firstTotal: r.first_name_total,
      fullTotal: r.full_name_total,
      compound: r.compound_number,
      tier: r.compound_tier,
      advised: r.correction_advised,
    };
  }
  try {
    const c = computeNameCheckReportContent({
      customerName: r.customer_name,
      dob: r.dob,
      firstName: r.first_name ?? undefined,
      middleName: r.middle_name ?? undefined,
      lastName: r.last_name ?? undefined,
      isMiddleNameFatherHusband: r.is_middle_name_father_husband ?? undefined,
    });
    return {
      mulank: c.mulank,
      bhagyank: c.bhagyank,
      firstTotal: c.firstNameSum,
      fullTotal: c.fullNameSum,
      compound: c.fullNameCompound,
      tier: c.compoundTier,
      advised: c.verdict !== "NR",
    };
  } catch {
    return { mulank: null, bhagyank: null, firstTotal: null, fullTotal: null, compound: null, tier: null, advised: null };
  }
}

const cap = (s: string | null) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—");
const dash = (n: number | null) => (n === null || n === undefined ? "—" : String(n));

function monthOptions() {
  const out: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 18; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
    });
  }
  return out;
}

function csvCell(v: unknown) {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const safe = (s: string) => s.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "Report";

export default function NameCheckCrmPanel() {
  const { toast } = useToast();
  const months = useMemo(monthOptions, []);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(months[0].value);
  const [advisedFilter, setAdvisedFilter] = useState<"all" | "yes" | "no">("all");
  const [followFilter, setFollowFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<CrmRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState("");
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [y, m] = month.split("-").map(Number);
      const from = new Date(y, m - 1, 1).toISOString();
      const to = new Date(y, m, 1).toISOString();
      const { data, error } = await supabase
        .from("name_check_reports")
        .select("*")
        .gte("created_at", from)
        .lt("created_at", to)
        .order("created_at", { ascending: false })
        .limit(2000);
      if (error) throw error;
      setRows((data as unknown as CrmRow[]) ?? []);
    } catch (e) {
      toast({ title: "Could not load CRM summary", description: e instanceof Error ? e.message : "Unexpected error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [month, toast]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  const view = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows
      .map((r) => ({ r, s: summaryOf(r) }))
      .filter(({ r, s }) => {
        if (advisedFilter === "yes" && s.advised !== true) return false;
        if (advisedFilter === "no" && s.advised !== false) return false;
        if (followFilter !== "all" && (r.follow_up_status ?? "pending") !== followFilter) return false;
        if (term && !`${r.customer_name} ${r.email} ${r.phone ?? ""} ${r.report_id}`.toLowerCase().includes(term)) return false;
        return true;
      });
  }, [rows, advisedFilter, followFilter, search]);

  const updateFollowUp = async (id: string, patch: Partial<Pick<CrmRow, "follow_up_status" | "follow_up_note">>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    const { error } = await supabase.from("name_check_reports").update(patch).eq("id", id);
    if (error) {
      toast({ title: "Could not save follow-up", description: error.message, variant: "destructive" });
      void load();
    }
  };

  const retry = async (r: CrmRow) => {
    setRetryingId(r.id);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Please sign in again");
      const res = await fetch("/api/name-check-reports/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reportId: r.id }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || "Retry failed");
      toast({ title: "Report sent", description: `${r.customer_name}'s report was generated and emailed.` });
      void load();
    } catch (e) {
      toast({ title: "Retry failed", description: e instanceof Error ? e.message : "Unexpected error", variant: "destructive" });
    } finally {
      setRetryingId(null);
    }
  };

  const downloadMonthZip = async () => {
    const withPdf = view.filter(({ r }) => r.pdf_url);
    if (!withPdf.length) {
      toast({ title: "Nothing to download", description: "No generated PDFs for this selection." });
      return;
    }
    setZipping(true);
    try {
      const zip = new JSZip();
      const used = new Set<string>();
      let done = 0;
      let failed = 0;
      const queue = [...withPdf];
      const worker = async () => {
        while (queue.length) {
          const item = queue.shift();
          if (!item) break;
          const { r } = item;
          try {
            const res = await fetch(r.pdf_url as string);
            if (!res.ok) throw new Error(String(res.status));
            let name = `${safe(r.customer_name)}_${r.report_id}.pdf`;
            while (used.has(name)) name = `${safe(r.customer_name)}_${r.report_id}_${used.size}.pdf`;
            used.add(name);
            zip.file(name, await res.arrayBuffer());
          } catch {
            failed += 1;
          }
          done += 1;
          setZipProgress(`${done}/${withPdf.length}`);
        }
      };
      await Promise.all([worker(), worker(), worker(), worker()]);

      const header = ["Report ID", "Customer", "Email", "Phone", "Mulank", "Bhagyank", "First Name Total", "Full Name Total", "Compound No.", "Compound Tier", "Name Correction Advised", "Emailed At", "Follow-up"];
      const lines = [header.join(",")].concat(
        view.map(({ r, s }) =>
          [r.report_id, r.customer_name, r.email, r.phone, s.mulank, s.bhagyank, s.firstTotal, s.fullTotal, s.compound, cap(s.tier), s.advised === null ? "" : s.advised ? "Yes" : "No", r.emailed_at ?? "", r.follow_up_status ?? "pending"]
            .map(csvCell)
            .join(","),
        ),
      );
      zip.file("summary.csv", lines.join("\n"));

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Name_Check_Reports_${month}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast({
        title: "ZIP downloaded",
        description: `${withPdf.length - failed} PDF(s) in Name_Check_Reports_${month}.zip${failed ? ` — ${failed} could not be fetched` : ""}.`,
      });
    } catch (e) {
      toast({ title: "ZIP failed", description: e instanceof Error ? e.message : "Unexpected error", variant: "destructive" });
    } finally {
      setZipping(false);
      setZipProgress("");
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <button type="button" className="flex w-full items-center justify-between text-left" onClick={() => setOpen((v) => !v)}>
          <div>
            <div className="text-base font-semibold">CRM Follow-up Summary &amp; Monthly ZIP</div>
            <div className="text-sm text-muted-foreground">
              Every report sent to a customer, with the numbers and "name correction advised?" for follow-up calls.
            </div>
          </div>
          {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>

        {open && (
          <>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-full md:w-[200px]"><SelectValue placeholder="Month" /></SelectTrigger>
                <SelectContent>
                  {months.map((m) => (<SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select value={advisedFilter} onValueChange={(v) => setAdvisedFilter(v as "all" | "yes" | "no")}>
                <SelectTrigger className="w-full md:w-[220px]"><SelectValue placeholder="Correction advised" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Correction: All</SelectItem>
                  <SelectItem value="yes">Correction advised: Yes</SelectItem>
                  <SelectItem value="no">Correction advised: No</SelectItem>
                </SelectContent>
              </Select>
              <Select value={followFilter} onValueChange={setFollowFilter}>
                <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Follow-up" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Follow-up: All</SelectItem>
                  {FOLLOW_UP.map((f) => (<SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>))}
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, phone, report ID" className="pl-9" />
              </div>
              <Button variant="outline" onClick={() => void load()} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
              </Button>
              <Button onClick={() => void downloadMonthZip()} disabled={zipping || loading}>
                {zipping ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                {zipping ? `Zipping ${zipProgress}` : "Download ZIP"}
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              {view.length} report(s) · {view.filter(({ s }) => s.advised).length} with name correction advised
            </div>

            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Customer</th>
                    <th className="px-3 py-2">Mulank</th>
                    <th className="px-3 py-2">Bhagyank</th>
                    <th className="px-3 py-2">First Name Total</th>
                    <th className="px-3 py-2">Full Name Total</th>
                    <th className="px-3 py-2">Compound</th>
                    <th className="px-3 py-2">Correction Advised?</th>
                    <th className="px-3 py-2">Email Record</th>
                    <th className="px-3 py-2">Follow-up</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (<tr><td colSpan={9} className="px-3 py-6 text-center text-muted-foreground">Loading…</td></tr>)}
                  {!loading && view.length === 0 && (<tr><td colSpan={9} className="px-3 py-6 text-center text-muted-foreground">No reports for this selection.</td></tr>)}
                  {!loading && view.map(({ r, s }) => (
                    <tr key={r.id} className="border-t align-top">
                      <td className="px-3 py-2">
                        <div className="font-medium">{r.customer_name}</div>
                        <div className="text-xs text-muted-foreground">{r.email}</div>
                        <div className="text-xs text-muted-foreground">{r.phone || "—"}</div>
                        <div className="text-[11px] text-muted-foreground">{r.report_id}</div>
                      </td>
                      <td className="px-3 py-2">{dash(s.mulank)}</td>
                      <td className="px-3 py-2">{dash(s.bhagyank)}</td>
                      <td className="px-3 py-2">{dash(s.firstTotal)}</td>
                      <td className="px-3 py-2">{dash(s.fullTotal)}</td>
                      <td className="px-3 py-2">{dash(s.compound)} <span className="text-muted-foreground">({cap(s.tier)})</span></td>
                      <td className="px-3 py-2">
                        {s.advised === null ? "—" : s.advised
                          ? <Badge className="border-red-300 bg-red-100 text-red-800 hover:bg-red-100">Yes</Badge>
                          : <Badge className="border-green-300 bg-green-100 text-green-800 hover:bg-green-100">No</Badge>}
                      </td>
                      <td className="px-3 py-2">
                        {r.emailed_at ? (
                          <div>
                            <Badge className="border-green-300 bg-green-100 text-green-800 hover:bg-green-100">Sent</Badge>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {new Date(r.emailed_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                            </div>
                            <div className="text-xs text-muted-foreground">{r.emailed_to}</div>
                          </div>
                        ) : r.order_id ? (
                          <div>
                            <Badge className="border-red-300 bg-red-100 text-red-800 hover:bg-red-100">
                              {r.auto_status === "processing" ? "Processing" : "Not sent"}
                            </Badge>
                            {r.auto_error && <div className="mt-1 max-w-[220px] text-xs text-red-700">{r.auto_error}</div>}
                            <Button size="sm" variant="outline" className="mt-1" disabled={retryingId === r.id} onClick={() => void retry(r)}>
                              {retryingId === r.id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <RotateCw className="mr-1 h-3 w-3" />}
                              Retry
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Manual report</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <Select value={r.follow_up_status ?? "pending"} onValueChange={(v) => void updateFollowUp(r.id, { follow_up_status: v })}>
                          <SelectTrigger className="h-8 w-[140px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {FOLLOW_UP.map((f) => (<SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>))}
                          </SelectContent>
                        </Select>
                        <Input
                          className="mt-1 h-8 w-[140px] text-xs"
                          placeholder="Note"
                          defaultValue={r.follow_up_note ?? ""}
                          onBlur={(e) => {
                            if (e.target.value !== (r.follow_up_note ?? "")) void updateFollowUp(r.id, { follow_up_note: e.target.value });
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
