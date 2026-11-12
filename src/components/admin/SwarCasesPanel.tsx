// import { useCallback, useEffect, useMemo, useState } from "react";
// import { Loader2, RefreshCw } from "lucide-react";
// import { supabase } from "@/integrations/supabase/client";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { useToast } from "@/hooks/use-toast";
// import { setCaseStatus, STATUS_META, STATUS_ORDER, type CaseStatus, type SwarCaseRow } from "@/lib/swar/swarCases";

// interface Props {
//   /** Opens the case in the calculator (all steps filled as they were left). */
//   onOpen: (row: SwarCaseRow) => void;
//   /** Bumped by the parent whenever a case was saved, so the list refreshes. */
//   refreshKey?: number;
// }

// const fmt = (iso: string) => {
//   const d = new Date(iso);
//   return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
// };

// export function SwarCasesPanel({ onOpen, refreshKey = 0 }: Props) {
//   const { toast } = useToast();
//   const [rows, setRows] = useState<SwarCaseRow[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [q, setQ] = useState("");
//   const [filter, setFilter] = useState<CaseStatus | "all">("all");

//   const load = useCallback(async () => {
//     setLoading(true);
//     try {
//       const { data, error } = await (supabase as any).from("swar_cases").select("*").order("updated_at", { ascending: false }).limit(500);
//       if (error) throw error;
//       setRows((data ?? []) as SwarCaseRow[]);
//     } catch (e: any) {
//       toast({ title: "Could not load cases", description: e?.message ?? "Run the swar_cases SQL migration first.", variant: "destructive" });
//     } finally { setLoading(false); }
//   }, [toast]);

//   useEffect(() => { void load(); }, [load, refreshKey]);

//   const counts = useMemo(() => {
//     const c: Record<string, number> = { all: rows.length };
//     for (const s of STATUS_ORDER) c[s] = rows.filter((r) => r.status === s).length;
//     return c;
//   }, [rows]);

//   const shown = useMemo(() => {
//     const needle = q.trim().toLowerCase();
//     return rows.filter((r) => (filter === "all" || r.status === filter)
//       && (!needle || [r.customer_name, r.phone, r.package_label, r.dob, r.order_id].some((v) => String(v ?? "").toLowerCase().includes(needle))));
//   }, [rows, q, filter]);

//   const change = async (row: SwarCaseRow, status: CaseStatus) => {
//     try {
//       const saved = await setCaseStatus(supabase as any, row, status);
//       setRows((prev) => prev.map((r) => (r.id === saved.id ? saved : r)));
//     } catch (e: any) {
//       toast({ title: "Could not change status", description: e?.message, variant: "destructive" });
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <div className="flex flex-wrap items-center gap-2">
//         <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All ({counts.all})</Button>
//         {STATUS_ORDER.map((s) => (
//           <button
//             key={s}
//             type="button"
//             onClick={() => setFilter(filter === s ? "all" : s)}
//             className={`rounded-full border px-3 py-1 text-xs font-medium ${STATUS_META[s].badge} ${filter === s ? "ring-2 ring-offset-1 ring-foreground/40" : ""}`}
//           >
//             {STATUS_META[s].label} ({counts[s]})
//           </button>
//         ))}
//         <div className="ml-auto flex items-center gap-2">
//           <Input className="w-64" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, DOB, package" />
//           <Button size="icon" variant="outline" onClick={load} disabled={loading} title="Refresh">
//             {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
//           </Button>
//         </div>
//       </div>

//       <div className="overflow-x-auto rounded-md border">
//         <table className="w-full text-left text-sm">
//           <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
//             <tr>
//               <th className="px-3 py-2">Customer</th><th className="px-3 py-2">DOB</th><th className="px-3 py-2">Package</th>
//               <th className="px-3 py-2">Status</th><th className="px-3 py-2">Change status</th><th className="px-3 py-2">Updated</th><th className="px-3 py-2" />
//             </tr>
//           </thead>
//           <tbody>
//             {shown.map((r) => {
//               const meta = STATUS_META[r.status] ?? STATUS_META.new;
//               const trail = (r.status_history ?? []).map((h) => `${STATUS_META[h.status]?.label ?? h.status} (${h.by}) ${fmt(h.at)}`).join("\n");
//               return (
//                 <tr key={r.id} className="border-t align-middle">
//                   <td className="px-3 py-2"><div className="font-medium">{r.customer_name || "-"}</div><div className="text-xs text-muted-foreground">{r.phone || ""}</div></td>
//                   <td className="px-3 py-2">{r.dob || "-"}</td>
//                   <td className="px-3 py-2 text-xs">{r.package_label || "-"}</td>
//                   <td className="px-3 py-2"><Badge variant="outline" className={`${meta.badge} whitespace-nowrap`} title={trail}>{meta.label}</Badge></td>
//                   <td className="px-3 py-2">
//                     <Select value={r.status} onValueChange={(v) => change(r, v as CaseStatus)}>
//                       <SelectTrigger className="h-8 w-52"><SelectValue /></SelectTrigger>
//                       <SelectContent>
//                         {STATUS_ORDER.map((s) => (
//                           <SelectItem key={s} value={s}><span className="flex items-center gap-2"><span className={`inline-block h-2 w-2 rounded-full ${STATUS_META[s].dot}`} />{STATUS_META[s].label}</span></SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </td>
//                   <td className="px-3 py-2 text-xs text-muted-foreground">{fmt(r.updated_at)}</td>
//                   <td className="px-3 py-2 text-right"><Button size="sm" variant="outline" onClick={() => onOpen(r)}>Open</Button></td>
//                 </tr>
//               );
//             })}
//             {!shown.length && (
//               <tr><td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">{loading ? "Loading..." : "No cases yet. A case is created automatically when you send the Swar message in step 1."}</td></tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//       <p className="text-xs text-muted-foreground">Status moves forward automatically when you send WhatsApp or download the report. If a message was not really sent (or was sent another way), change the status here by hand. Hover a status to see its history.</p>
//     </div>
//   );
// }



import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { syncOrdersToCases } from "@/lib/swar/orderCases";
import { setCaseStatus, STATUS_META, STATUS_ORDER, type CaseStatus, type SwarCaseRow } from "@/lib/swar/swarCases";

interface Props {
  /** Opens the case in the calculator (all steps filled as they were left). */
  onOpen: (row: SwarCaseRow) => void;
  /** Bumped by the parent whenever a case was saved, so the list refreshes. */
  refreshKey?: number;
}

const fmt = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

export function SwarCasesPanel({ onOpen, refreshKey = 0 }: Props) {
  const { toast } = useToast();
  const [rows, setRows] = useState<SwarCaseRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<CaseStatus | "all">("all");

  const load = useCallback(async () => {
    setLoading(true);
    // First pull in any paid order that has no case yet (details come from the order form), then list everything.
    try {
      const r = await syncOrdersToCases(supabase as any);
      if (r.created + r.linked > 0) toast({ title: `${r.created + r.linked} new order${r.created + r.linked === 1 ? "" : "s"} added`, description: "Open a case to see the Swar already calculated." });
    } catch (e: any) {
      toast({ title: "Could not read new orders", description: e?.message, variant: "destructive" });
    }
    try {
      const { data, error } = await (supabase as any).from("swar_cases").select("*").order("updated_at", { ascending: false }).limit(500);
      if (error) throw error;
      setRows((data ?? []) as SwarCaseRow[]);
    } catch (e: any) {
      toast({ title: "Could not load cases", description: e?.message ?? "Run the swar_cases SQL migration first.", variant: "destructive" });
    } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { void load(); }, [load, refreshKey]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const s of STATUS_ORDER) c[s] = rows.filter((r) => r.status === s).length;
    return c;
  }, [rows]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => (filter === "all" || r.status === filter)
      && (!needle || [r.customer_name, r.phone, r.package_label, r.dob, r.order_id].some((v) => String(v ?? "").toLowerCase().includes(needle))));
  }, [rows, q, filter]);

  const change = async (row: SwarCaseRow, status: CaseStatus) => {
    try {
      const saved = await setCaseStatus(supabase as any, row, status);
      setRows((prev) => prev.map((r) => (r.id === saved.id ? saved : r)));
    } catch (e: any) {
      toast({ title: "Could not change status", description: e?.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All ({counts.all})</Button>
        {STATUS_ORDER.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(filter === s ? "all" : s)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${STATUS_META[s].badge} ${filter === s ? "ring-2 ring-offset-1 ring-foreground/40" : ""}`}
          >
            {STATUS_META[s].label} ({counts[s]})
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <Input className="w-64" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, DOB, package" />
          <Button size="icon" variant="outline" onClick={load} disabled={loading} title="Refresh">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Customer</th><th className="px-3 py-2">DOB</th><th className="px-3 py-2">Package</th>
              <th className="px-3 py-2">Status</th><th className="px-3 py-2">Change status</th><th className="px-3 py-2">Updated</th><th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => {
              const meta = STATUS_META[r.status] ?? STATUS_META.new;
              const trail = (r.status_history ?? []).map((h) => `${STATUS_META[h.status]?.label ?? h.status} (${h.by}) ${fmt(h.at)}`).join("\n");
              return (
                <tr key={r.id} className="border-t align-middle">
                  <td className="px-3 py-2" title={r.data?.orderNotes || undefined}>
                    <div className="font-medium">{r.customer_name || "-"}</div>
                    <div className="text-xs text-muted-foreground">{r.phone || ""}</div>
                    {Array.isArray(r.data?.orderMissing) && r.data.orderMissing.length > 0 && r.status === "new" && (
                      <div className="text-xs text-amber-700">Missing in order: {r.data.orderMissing.join(", ")}</div>
                    )}
                  </td>
                  <td className="px-3 py-2">{r.dob || "-"}</td>
                  <td className="px-3 py-2 text-xs">{r.package_label || "-"}</td>
                  <td className="px-3 py-2"><Badge variant="outline" className={`${meta.badge} whitespace-nowrap`} title={trail}>{meta.label}</Badge></td>
                  <td className="px-3 py-2">
                    <Select value={r.status} onValueChange={(v) => change(r, v as CaseStatus)}>
                      <SelectTrigger className="h-8 w-52"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUS_ORDER.map((s) => (
                          <SelectItem key={s} value={s}><span className="flex items-center gap-2"><span className={`inline-block h-2 w-2 rounded-full ${STATUS_META[s].dot}`} />{STATUS_META[s].label}</span></SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{fmt(r.updated_at)}</td>
                  <td className="px-3 py-2 text-right"><Button size="sm" variant="outline" onClick={() => onOpen(r)}>Open</Button></td>
                </tr>
              );
            })}
            {!shown.length && (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">{loading ? "Loading..." : "No cases yet. Every paid Perfect / Complete order appears here automatically."}</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">Status moves forward automatically when you send WhatsApp or download the report. If a message was not really sent (or was sent another way), change the status here by hand. Hover a status to see its history.</p>
    </div>
  );
}
