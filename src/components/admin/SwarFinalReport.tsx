// import { useCallback, useEffect, useMemo, useState } from "react";
// import { Link } from "react-router-dom";
// import { ExternalLink, FileText, Loader2, MessageCircle, RefreshCw } from "lucide-react";
// import { supabase } from "@/integrations/supabase/client";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { useToast } from "@/hooks/use-toast";
// import { BABY_NAME_PREFERENCE_OPTIONS, validateBabyForm, type BabyNamePreference } from "@/lib/baby-reports/perfect-baby-name/form";
// import type { PackageTier } from "@/lib/swar/nameFinderPackage";
// import { buildReportValues, newReportId, reportColumns, reportMessage, reportTarget } from "@/lib/swar/finalReport";

// interface Props {
//   /** The saved case this report belongs to (null until the case has been saved, e.g. after the Step 4 check). */
//   caseId: string | null;
//   orderId: string | null;
//   tier: PackageTier;
//   dob: string; phone: string; gender: string;
//   surname: string; middle: string; middleNotFather: boolean;
//   /** Names the customer finalised in Step 4. */
//   chosenNames: string[];
//   /** Opens the customer's WhatsApp chat with the text typed in. */
//   sendWhatsApp: (text: string) => void;
//   /** Called when the report link was sent -> case becomes "Final Report Shared". */
//   onSent: () => void;
// }

// const STATUS_BADGE: Record<string, string> = {
//   draft: "bg-gray-100 text-gray-800 border-gray-300",
//   generating: "bg-blue-100 text-blue-800 border-blue-300",
//   completed: "bg-green-100 text-green-800 border-green-300",
//   failed: "bg-red-100 text-red-800 border-red-300",
//   archived: "bg-slate-200 text-slate-700 border-slate-300",
// };

// export function SwarFinalReport({ caseId, orderId, tier, dob, phone, gender, surname, middle, middleNotFather, chosenNames, sendWhatsApp, onSent }: Props) {
//   const { toast } = useToast();
//   const target = useMemo(() => reportTarget(tier), [tier]);
//   const [report, setReport] = useState<any | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);

//   const [name1, setName1] = useState("");
//   const [name2, setName2] = useState("");
//   const [email, setEmail] = useState("");
//   const [fatherName, setFatherName] = useState("");
//   const [nickName, setNickName] = useState("");
//   const [preference, setPreference] = useState<BabyNamePreference>("na");

//   // Names typed in Step 4 become the defaults (first = Option 1, second = Option 2); the operator can change them.
//   const chosenKey = chosenNames.join("|");
//   useEffect(() => {
//     setName1((p) => p || chosenNames[0] || "");
//     setName2((p) => p || chosenNames[1] || "");
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [chosenKey]);

//   const loadReport = useCallback(async () => {
//     if (!caseId) { setReport(null); return; }
//     setLoading(true);
//     try {
//       const { data, error } = await (supabase as any).from(target.table).select("*").eq("swar_case_id", caseId).order("created_at", { ascending: false }).limit(1);
//       if (error) throw error;
//       setReport(data?.[0] ?? null);
//     } catch (e: any) {
//       toast({ title: "Could not load the report", description: e?.message ?? "Has the report_swar_link SQL migration been run?", variant: "destructive" });
//     } finally { setLoading(false); }
//   }, [caseId, target.table, toast]);
//   useEffect(() => { void loadReport(); }, [loadReport]);

//   // Email and father's name are in the order form, so the operator does not have to ask again.
//   useEffect(() => {
//     if (!orderId) return;
//     let live = true;
//     (async () => {
//       try {
//         const { data } = await (supabase as any).from("orders").select("*").eq("id", orderId).maybeSingle();
//         const m = (data?.metadata ?? {}) as Record<string, any>;
//         const s = (m.formSnapshot ?? m) as Record<string, any>;
//         if (!live) return;
//         if (s.email) setEmail((p) => p || String(s.email));
//         const father = s.fatherFullName ?? s.fatherName;
//         if (father) setFatherName((p) => p || String(father));
//       } catch { /* optional prefill only */ }
//     })();
//     return () => { live = false; };
//   }, [orderId]);

//   const values = useMemo(() => buildReportValues({
//     name1, name2, middle, middleIsFather: !middleNotFather, surname, gender, email, phone, dob, fatherName, nickName, preference,
//   }), [name1, name2, middle, middleNotFather, surname, gender, email, phone, dob, fatherName, nickName, preference]);

//   const create = async () => {
//     if (!caseId) { toast({ title: "Save the case first", description: "Run the Step 4 check, it saves the case.", variant: "destructive" }); return; }
//     const problem = validateBabyForm(values);
//     if (problem) { toast({ title: "Report not created", description: problem, variant: "destructive" }); return; }
//     setSaving(true);
//     try {
//       const { data, error } = await (supabase as any).from(target.table)
//         .insert({ report_id: newReportId(tier), ...reportColumns(values), pdf_url: null, order_id: orderId, swar_case_id: caseId })
//         .select("*").single();
//       if (error) throw error;
//       setReport(data);
//       toast({ title: "Report created", description: `${data.report_id} is a draft. Open it in ${target.label} to generate the PDF.` });
//     } catch (e: any) {
//       toast({ title: "Could not create the report", description: e?.message, variant: "destructive" });
//     } finally { setSaving(false); }
//   };

//   const send = () => {
//     if (!report?.pdf_url) return;
//     sendWhatsApp(reportMessage(tier, report.first_name || report.customer_name, report.pdf_url));
//     onSent();
//   };

//   if (!caseId) {
//     return <p className="text-sm text-muted-foreground">Run the Step 4 check first. That saves the case, and then the {target.label} can be created from it.</p>;
//   }

//   return (
//     <div className="space-y-4">
//       <div className="flex flex-wrap items-center gap-2 text-sm">
//         <Badge variant="secondary">{target.label}</Badge>
//         {report && <Badge variant="outline" className={STATUS_BADGE[report.status] ?? ""}>{String(report.status)}</Badge>}
//         {report && <span className="text-muted-foreground">{report.report_id}</span>}
//         <Button size="icon" variant="outline" className="ml-auto" onClick={loadReport} disabled={loading} title="Refresh">
//           {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
//         </Button>
//       </div>

//       {!report ? (
//         <>
//           <div className="grid gap-3 md:grid-cols-2">
//             <div>
//               <Label>Final name (Option 1)</Label>
//               <Input list="swar-final-names" value={name1} onChange={(e) => setName1(e.target.value)} placeholder="The name the customer confirmed" />
//             </div>
//             <div>
//               <Label>Second name (Option 2, leave empty if only one)</Label>
//               <Input list="swar-final-names" value={name2} onChange={(e) => setName2(e.target.value)} />
//             </div>
//             <datalist id="swar-final-names">{chosenNames.map((n) => <option key={n} value={n} />)}</datalist>
//             <div><Label>Email (report goes here)</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="from the order, or type it" /></div>
//             <div><Label>Father's name</Label><Input value={fatherName} onChange={(e) => setFatherName(e.target.value)} /></div>
//             <div><Label>Nick name (optional, adds the Nick Name page)</Label><Input value={nickName} onChange={(e) => setNickName(e.target.value)} /></div>
//             <div>
//               <Label>Preference</Label>
//               <Select value={preference} onValueChange={(v) => setPreference(v as BabyNamePreference)}>
//                 <SelectTrigger><SelectValue /></SelectTrigger>
//                 <SelectContent>{BABY_NAME_PREFERENCE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
//               </Select>
//             </div>
//           </div>
//           <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
//             Will be saved as: <b>{values.option1_name || "-"}</b>{values.option2_name !== "NA" ? <> and <b>{values.option2_name}</b></> : null} · {values.gender || "-"} · DOB {values.dob || "-"} · first alphabet {values.first_alphabet || "-"}
//           </div>
//           <Button onClick={create} disabled={saving}>
//             {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}Create {target.label}
//           </Button>
//         </>
//       ) : (
//         <div className="space-y-3">
//           <div className="rounded-md border p-3 text-sm">
//             <div className="font-medium">{report.option1_name}{report.option2_name && !/^na$/i.test(report.option2_name) ? ` · ${report.option2_name}` : ""}</div>
//             <div className="text-xs text-muted-foreground">{report.email} · {report.phone}</div>
//           </div>
//           {report.pdf_url ? (
//             <div className="flex flex-wrap gap-2">
//               <Button variant="outline" asChild><a href={report.pdf_url} target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4 mr-2" />View PDF</a></Button>
//               <Button onClick={send}><MessageCircle className="w-4 h-4 mr-2" />Send report link on WhatsApp</Button>
//             </div>
//           ) : (
//             <p className="text-sm text-muted-foreground">The report is a draft. Open it in {target.label}, press Generate, then come back here and press refresh. The WhatsApp button appears once the PDF is ready. (To send it by email, use the Send email button on that page.)</p>
//           )}
//           <Button variant="outline" asChild><Link to={target.adminPath}><ExternalLink className="w-4 h-4 mr-2" />Open {target.label} page</Link></Button>
//         </div>
//       )}
//     </div>
//   );
// }


import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, FileText, Loader2, MessageCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BABY_NAME_PREFERENCE_OPTIONS, validateBabyForm, type BabyNamePreference } from "@/lib/baby-reports/perfect-baby-name/form";
import type { PackageTier } from "@/lib/swar/nameFinderPackage";
import { buildReportValues, newReportId, reportColumns, reportMessage, reportTarget } from "@/lib/swar/finalReport";

interface Props {
  /** The saved case this report belongs to (null until the case has been saved, e.g. after the Step 4 check). */
  caseId: string | null;
  orderId: string | null;
  tier: PackageTier;
  dob: string; phone: string; gender: string;
  surname: string; middle: string; middleNotFather: boolean;
  /** Names the customer finalised in Step 4. */
  chosenNames: string[];
  /** Opens the customer's WhatsApp chat with the text typed in. */
  sendWhatsApp: (text: string) => void;
  /** Called when the report link was sent -> case becomes "Final Report Shared". */
  onSent: () => void;
}

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 border-gray-300",
  generating: "bg-blue-100 text-blue-800 border-blue-300",
  completed: "bg-green-100 text-green-800 border-green-300",
  failed: "bg-red-100 text-red-800 border-red-300",
  archived: "bg-slate-200 text-slate-700 border-slate-300",
};

export function SwarFinalReport({ caseId, orderId, tier, dob, phone, gender, surname, middle, middleNotFather, chosenNames, sendWhatsApp, onSent }: Props) {
  const { toast } = useToast();
  const target = useMemo(() => reportTarget(tier), [tier]);
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [email, setEmail] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [nickName, setNickName] = useState("");
  const [preference, setPreference] = useState<BabyNamePreference>("na");

  // Names typed in Step 4 become the defaults (first = Option 1, second = Option 2); the operator can change them.
  const chosenKey = chosenNames.join("|");
  useEffect(() => {
    setName1((p) => p || chosenNames[0] || "");
    setName2((p) => p || chosenNames[1] || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosenKey]);

  const loadReport = useCallback(async () => {
    if (!caseId) { setReport(null); return; }
    setLoading(true);
    try {
      const { data, error } = await (supabase as any).from(target.table).select("*").eq("swar_case_id", caseId).order("created_at", { ascending: false }).limit(1);
      if (error) throw error;
      setReport(data?.[0] ?? null);
    } catch (e: any) {
      toast({ title: "Could not load the report", description: e?.message ?? "Has the report_swar_link SQL migration been run?", variant: "destructive" });
    } finally { setLoading(false); }
  }, [caseId, target.table, toast]);
  useEffect(() => { void loadReport(); }, [loadReport]);

  // Email and father's name are in the order form, so the operator does not have to ask again.
  useEffect(() => {
    if (!orderId) return;
    let live = true;
    (async () => {
      try {
        const { data } = await (supabase as any).from("orders").select("*").eq("id", orderId).maybeSingle();
        const m = (data?.metadata ?? {}) as Record<string, any>;
        const s = (m.formSnapshot ?? m) as Record<string, any>;
        if (!live) return;
        if (s.email) setEmail((p) => p || String(s.email));
        const father = s.fatherFullName ?? s.fatherName;
        if (father) setFatherName((p) => p || String(father));
      } catch { /* optional prefill only */ }
    })();
    return () => { live = false; };
  }, [orderId]);

  const values = useMemo(() => buildReportValues({
    name1, name2, middle, middleIsFather: !middleNotFather, surname, gender, email, phone, dob, fatherName, nickName, preference,
  }), [name1, name2, middle, middleNotFather, surname, gender, email, phone, dob, fatherName, nickName, preference]);

  const create = async () => {
    if (!caseId) { toast({ title: "Save the case first", description: "Run the Step 4 check, it saves the case.", variant: "destructive" }); return; }
    const problem = validateBabyForm(values);
    if (problem) { toast({ title: "Report not created", description: problem, variant: "destructive" }); return; }
    setSaving(true);
    try {
      const { data, error } = await (supabase as any).from(target.table)
        .insert({ report_id: newReportId(tier), ...reportColumns(values), pdf_url: null, order_id: orderId, swar_case_id: caseId })
        .select("*").single();
      if (error) throw error;
      setReport(data);
      toast({ title: "Report created", description: `${data.report_id} is a draft. Open it in ${target.label} to generate the PDF.` });
    } catch (e: any) {
      toast({ title: "Could not create the report", description: e?.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const send = () => {
    if (!report?.pdf_url) return;
    sendWhatsApp(reportMessage(tier, report.first_name || report.customer_name, report.pdf_url));
    onSent();
  };

  if (!caseId) {
    return <p className="text-sm text-muted-foreground">Run the Step 4 check first. That saves the case, and then the {target.label} can be created from it.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant="secondary">{target.label}</Badge>
        {report && <Badge variant="outline" className={STATUS_BADGE[report.status] ?? ""}>{String(report.status)}</Badge>}
        {report && <span className="text-muted-foreground">{report.report_id}</span>}
        <Button size="icon" variant="outline" className="ml-auto" onClick={loadReport} disabled={loading} title="Refresh">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </div>

      {!report ? (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label>Final name (Option 1)</Label>
              <Input list="swar-final-names" value={name1} onChange={(e) => setName1(e.target.value)} placeholder="The name the customer confirmed" />
            </div>
            <div>
              <Label>Second name (Option 2, leave empty if only one)</Label>
              <Input list="swar-final-names" value={name2} onChange={(e) => setName2(e.target.value)} />
            </div>
            <datalist id="swar-final-names">{chosenNames.map((n) => <option key={n} value={n} />)}</datalist>
            <div><Label>Email (report goes here)</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="from the order, or type it" /></div>
            <div><Label>Father's name</Label><Input value={fatherName} onChange={(e) => setFatherName(e.target.value)} /></div>
            <div><Label>Nick name (optional, adds the Nick Name page)</Label><Input value={nickName} onChange={(e) => setNickName(e.target.value)} /></div>
            <div>
              <Label>Preference</Label>
              <Select value={preference} onValueChange={(v) => setPreference(v as BabyNamePreference)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{BABY_NAME_PREFERENCE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
            Will be saved as: <b>{values.option1_name || "-"}</b>{values.option2_name !== "NA" ? <> and <b>{values.option2_name}</b></> : null} · {values.gender || "-"} · DOB {values.dob || "-"} · first alphabet {values.first_alphabet || "-"}
          </div>
          <Button onClick={create} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}Create {target.label}
          </Button>
        </>
      ) : (
        <div className="space-y-3">
          <div className="rounded-md border p-3 text-sm">
            <div className="font-medium">{report.option1_name}{report.option2_name && !/^na$/i.test(report.option2_name) ? ` · ${report.option2_name}` : ""}</div>
            <div className="text-xs text-muted-foreground">{report.email} · {report.phone}</div>
          </div>
          {report.pdf_url ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild><a href={report.pdf_url} target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4 mr-2" />View PDF</a></Button>
              <Button onClick={send}><MessageCircle className="w-4 h-4 mr-2" />Send report link on WhatsApp</Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">The report is a draft. Open it in {target.label}, press Generate, then come back here and press refresh. The WhatsApp button appears once the PDF is ready. (To send it by email, use the Send email button on that page.)</p>
          )}
          <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={async () => { await navigator.clipboard.writeText(report.report_id); toast({ title: "Report ID copied", description: "Paste it in the search box on that page." }); }}>
            Copy report ID
          </Button>
          <Button variant="outline" asChild><Link to={target.adminPath}><ExternalLink className="w-4 h-4 mr-2" />Open {target.label} page</Link></Button>
          </div>
        </div>
      )}
    </div>
  );
}
