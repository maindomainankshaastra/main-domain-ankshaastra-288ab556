

// import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { Copy, ExternalLink, FileText, Image as ImageIcon, Loader2, MessageCircle, RefreshCw } from "lucide-react";
// import { supabase } from "@/integrations/supabase/client";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { useToast } from "@/hooks/use-toast";
// import { EMPTY_BABY_FORM, validateBabyForm, type BabyReportFormValues } from "@/lib/baby-reports/perfect-baby-name/form";
// import { BabyReportForm } from "@/components/admin/BabyReportForm";
// import { prefillFromOrder, type OrderPrefill, type PackageTier } from "@/lib/swar/nameFinderPackage";
// import { AUTO_GENERATE_AFTER_REDIRECT, buildReportValues, newReportId, reportColumns, reportMessage, reportOpenUrl, reportTarget, shortReportLink } from "@/lib/swar/finalReport";
// import { reportCardBlob } from "@/lib/swar/reportCard";

// interface Props {
//   /** The saved case this report belongs to (null until the case has been saved, e.g. after the Step 4 check). */
//   caseId: string | null;
//   orderId: string | null;
//   tier: PackageTier;
//   dob: string; phone: string; gender: string;
//   surname: string; middle: string; middleNotFather: boolean;
//   /** Names the customer finalised in Step 4. */
//   chosenNames: string[];
//   /** Optional nick name typed in Step 4. */
//   nickName: string;
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

// export function SwarFinalReport({ caseId, orderId, tier, dob, phone, gender, surname, middle, middleNotFather, chosenNames, nickName, sendWhatsApp, onSent }: Props) {
//   const { toast } = useToast();
//   const navigate = useNavigate();
//   const target = useMemo(() => reportTarget(tier), [tier]);
//   const [report, setReport] = useState<any | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);

//   // The form has every field of the Perfect / Complete report form. It is filled from Step 4 and the order, and the
//   // operator can change any field. A field the operator edited is never overwritten again by an automatic refill.
//   const [form, setForm] = useState<BabyReportFormValues>(EMPTY_BABY_FORM);
//   const [orderEmail, setOrderEmail] = useState("");
//   const [orderFather, setOrderFather] = useState("");
//   // Everything the order form already holds (DOB, gender, middle / last name, phone). Used whenever the matching Step 1-3 field is empty.
//   const [orderData, setOrderData] = useState<OrderPrefill | null>(null);
//   const chosenKey = chosenNames.join("|");
//   const touched = useRef<Set<keyof BabyReportFormValues>>(new Set());

//   const base = useMemo(() => buildReportValues({
//     name1: chosenNames[0] ?? "", name2: chosenNames[1] ?? "",
//     middle: middle || orderData?.middleName || "",
//     middleIsFather: middle ? !middleNotFather : (orderData?.middleIsFather ?? !middleNotFather),
//     surname: surname || orderData?.lastName || "",
//     gender: gender || orderData?.gender || "",
//     email: orderEmail, phone: phone || String(orderData?.phone ?? ""), dob: dob || orderData?.dob || "",
//     fatherName: orderFather, nickName, preference: "na",
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }), [chosenKey, middle, middleNotFather, surname, gender, orderEmail, phone, dob, orderFather, nickName, orderData]);

//   const applyBase = useCallback((all: boolean) => {
//     if (all) touched.current.clear();
//     setForm((cur) => {
//       const next = { ...cur };
//       (Object.keys(base) as (keyof BabyReportFormValues)[]).forEach((k) => {
//         if (k === "status" || k === "preference") return;
//         if (all || !touched.current.has(k)) (next as any)[k] = base[k];
//       });
//       return next;
//     });
//   }, [base]);
//   useEffect(() => { applyBase(false); }, [applyBase]);

//   const onFormChange = (v: BabyReportFormValues) => {
//     (Object.keys(v) as (keyof BabyReportFormValues)[]).forEach((k) => { if (v[k] !== form[k]) touched.current.add(k); });
//     setForm(v);
//   };

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
//         if (data) setOrderData(prefillFromOrder(data as Record<string, any>));
//         if (s.email) setOrderEmail(String(s.email));
//         const father = s.fatherFullName ?? s.fatherName;
//         if (father) setOrderFather(String(father));
//       } catch { /* optional prefill only */ }
//     })();
//     return () => { live = false; };
//   }, [orderId]);

//   const create = async () => {
//     if (!caseId) { toast({ title: "Save the case first", description: "Run the Step 4 check, it saves the case.", variant: "destructive" }); return; }
//     const problem = validateBabyForm(form);
//     if (problem) { toast({ title: "Report not created", description: problem, variant: "destructive" }); return; }
//     setSaving(true);
//     try {
//       const { data, error } = await (supabase as any).from(target.table)
//         .insert({ report_id: newReportId(tier), ...reportColumns({ ...form, status: "draft" }), pdf_url: null, order_id: orderId, swar_case_id: caseId })
//         .select("*").single();
//       if (error) throw error;
//       setReport(data);
//       toast({ title: "Report created", description: `${data.report_id}: opening ${target.label}${AUTO_GENERATE_AFTER_REDIRECT ? " and generating the PDF" : ""}...` });
//       // The Swar page opens this case again when the operator comes back (see SwarCalculatorModule).
//       try { sessionStorage.setItem("swar_restore_case", String(caseId)); } catch { /* private mode: nothing to keep */ }
//       navigate(reportOpenUrl(tier, data.report_id, AUTO_GENERATE_AFTER_REDIRECT));
//     } catch (e: any) {
//       toast({ title: "Could not create the report", description: e?.message, variant: "destructive" });
//     } finally { setSaving(false); }
//   };

//   // The name on the card = the name(s) the report was made for (First + Middle + Last).
//   const cardName = (): string => String(report?.customer_name || report?.first_name || "").trim();
//   const shortLink = report ? shortReportLink(report.report_id) : "";
//   const message = () => reportMessage(tier, report?.first_name || report?.customer_name || "", shortLink);

//   // One click: copy the "Report is Ready" card (with the customer's name) to the clipboard, then open the customer's
//   // WhatsApp chat with the message typed in. The operator presses Ctrl+V (image) and Send.
//   const send = async () => {
//     if (!report?.pdf_url) return;
//     try {
//       const blob = await reportCardBlob(tier, cardName());
//       await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
//       toast({ title: "Image copied, WhatsApp is opening", description: "Click the message box, press Ctrl+V, then Send." });
//     } catch {
//       toast({ title: "Could not copy the image", description: "Use Download image and attach it manually.", variant: "destructive" });
//     }
//     sendWhatsApp(message());
//     onSent();
//   };

//   const copyCard = async () => {
//     try {
//       const blob = await reportCardBlob(tier, cardName());
//       await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
//       toast({ title: "Image copied", description: "Paste it in WhatsApp (Ctrl+V)." });
//     } catch {
//       toast({ title: "Copy not supported here", description: "Use Download image instead.", variant: "destructive" });
//     }
//   };

//   const downloadCard = async () => {
//     try {
//       const blob = await reportCardBlob(tier, cardName());
//       const a = document.createElement("a");
//       a.href = URL.createObjectURL(blob);
//       a.download = `${report.report_id}-ready.png`;
//       a.click();
//     } catch (e: any) { toast({ title: "Could not make the image", description: e?.message, variant: "destructive" }); }
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
//           <BabyReportForm values={form} onChange={onFormChange} />
//           <Button type="button" variant="outline" size="sm" onClick={() => applyBase(true)}>Re-fill from Step 4 and the order</Button>
//           <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
//             Will be saved as: <b>{form.option1_name || "-"}</b>{form.option2_name && form.option2_name !== "NA" ? <> and <b>{form.option2_name}</b></> : null} · {form.gender || "-"} · DOB {form.dob || "-"} · first alphabet {form.first_alphabet || "-"}
//           </div>
//           <Button onClick={create} disabled={saving}>
//             {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}Create and open {target.label}
//           </Button>
//         </>
//       ) : (
//         <div className="space-y-3">
//           <div className="rounded-md border p-3 text-sm">
//             <div className="font-medium">{report.option1_name}{report.option2_name && !/^na$/i.test(report.option2_name) ? ` · ${report.option2_name}` : ""}</div>
//             <div className="text-xs text-muted-foreground">{report.email} · {report.phone}</div>
//           </div>
//           {report.pdf_url ? (
//             <>
//             <div className="flex flex-wrap gap-2">
//               <Button variant="outline" asChild><a href={report.pdf_url} target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4 mr-2" />View PDF</a></Button>
//               <Button onClick={send}><MessageCircle className="w-4 h-4 mr-2" />Send image + link on WhatsApp</Button>
//               <Button variant="outline" onClick={copyCard}><ImageIcon className="w-4 h-4 mr-2" />Copy image</Button>
//               <Button variant="outline" onClick={downloadCard}><ImageIcon className="w-4 h-4 mr-2" />Download image</Button>
//               <Button variant="outline" onClick={async () => { await navigator.clipboard.writeText(message()); toast({ title: "Message copied" }); }}><Copy className="w-4 h-4 mr-2" />Copy message</Button>
//             </div>
//             <p className="text-xs text-muted-foreground">Short link sent to the customer: <b>{shortLink}</b></p>
//             </>
//           ) : (
//             <p className="text-sm text-muted-foreground">The report is a draft. Press Open this report to generate the PDF, then come back here and press refresh. The WhatsApp button appears once the PDF is ready. (To send it by email, use the Send email button on that page.)</p>
//           )}
//           <div className="flex flex-wrap gap-2">
//           <Button variant="outline" onClick={async () => { await navigator.clipboard.writeText(report.report_id); toast({ title: "Report ID copied", description: "Paste it in the search box on that page." }); }}>
//             Copy report ID
//           </Button>
//           <Button variant="outline" asChild><Link onClick={() => { try { sessionStorage.setItem("swar_restore_case", String(caseId)); } catch { /* ignore */ } }} to={reportOpenUrl(tier, report.report_id, AUTO_GENERATE_AFTER_REDIRECT && !report.pdf_url)}><ExternalLink className="w-4 h-4 mr-2" />Open this report</Link></Button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Copy, ExternalLink, FileText, Image as ImageIcon, Loader2, MessageCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { EMPTY_BABY_FORM, validateBabyForm, type BabyReportFormValues } from "@/lib/baby-reports/perfect-baby-name/form";
import { BabyReportForm } from "@/components/admin/BabyReportForm";
import { prefillFromOrder, type OrderPrefill, type PackageTier } from "@/lib/swar/nameFinderPackage";
import { AUTO_GENERATE_AFTER_REDIRECT, buildReportValues, newReportId, reportColumns, reportMessage, reportOpenUrl, reportTarget, shortReportLink } from "@/lib/swar/finalReport";
import { reportCardBlob } from "@/lib/swar/reportCard";

interface Props {
  /** The saved case this report belongs to (null until the case has been saved, e.g. after the Step 4 check). */
  caseId: string | null;
  orderId: string | null;
  tier: PackageTier;
  dob: string; phone: string; gender: string;
  surname: string; middle: string; middleNotFather: boolean;
  /** Names the customer finalised in Step 4. */
  chosenNames: string[];
  /** Optional nick name typed in Step 4. */
  nickName: string;
  /** Opens the customer's WhatsApp chat with the text typed in. */
  sendWhatsApp: (text: string) => void;
  /** Called when the report link was sent -> case becomes "Final Report Shared". */
  onSent: () => void;
  /** Called right before the page moves to the report page, so the latest Step 1-4 values are saved in the case. */
  onBeforeLeave?: () => Promise<void> | void;
}

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 border-gray-300",
  generating: "bg-blue-100 text-blue-800 border-blue-300",
  completed: "bg-green-100 text-green-800 border-green-300",
  failed: "bg-red-100 text-red-800 border-red-300",
  archived: "bg-slate-200 text-slate-700 border-slate-300",
};

export function SwarFinalReport({ caseId, orderId, tier, dob, phone, gender, surname, middle, middleNotFather, chosenNames, nickName, sendWhatsApp, onSent, onBeforeLeave }: Props) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const target = useMemo(() => reportTarget(tier), [tier]);
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // The form has every field of the Perfect / Complete report form. It is filled from Step 4 and the order, and the
  // operator can change any field. A field the operator edited is never overwritten again by an automatic refill.
  const [form, setForm] = useState<BabyReportFormValues>(EMPTY_BABY_FORM);
  const [orderEmail, setOrderEmail] = useState("");
  const [orderFather, setOrderFather] = useState("");
  // Everything the order form already holds (DOB, gender, middle / last name, phone). Used whenever the matching Step 1-3 field is empty.
  const [orderData, setOrderData] = useState<OrderPrefill | null>(null);
  const chosenKey = chosenNames.join("|");
  const touched = useRef<Set<keyof BabyReportFormValues>>(new Set());

  const base = useMemo(() => buildReportValues({
    name1: chosenNames[0] ?? "", name2: chosenNames[1] ?? "",
    middle: middle || orderData?.middleName || "",
    middleIsFather: middle ? !middleNotFather : (orderData?.middleIsFather ?? !middleNotFather),
    surname: surname || orderData?.lastName || "",
    gender: gender || orderData?.gender || "",
    email: orderEmail, phone: phone || String(orderData?.phone ?? ""), dob: dob || orderData?.dob || "",
    fatherName: orderFather, nickName, preference: "na",
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [chosenKey, middle, middleNotFather, surname, gender, orderEmail, phone, dob, orderFather, nickName, orderData]);

  const applyBase = useCallback((all: boolean) => {
    if (all) touched.current.clear();
    setForm((cur) => {
      const next = { ...cur };
      (Object.keys(base) as (keyof BabyReportFormValues)[]).forEach((k) => {
        if (k === "status" || k === "preference") return;
        if (all || !touched.current.has(k)) (next as any)[k] = base[k];
      });
      return next;
    });
  }, [base]);
  useEffect(() => { applyBase(false); }, [applyBase]);

  const onFormChange = (v: BabyReportFormValues) => {
    (Object.keys(v) as (keyof BabyReportFormValues)[]).forEach((k) => { if (v[k] !== form[k]) touched.current.add(k); });
    setForm(v);
  };

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
        if (data) setOrderData(prefillFromOrder(data as Record<string, any>));
        if (s.email) setOrderEmail(String(s.email));
        const father = s.fatherFullName ?? s.fatherName;
        if (father) setOrderFather(String(father));
      } catch { /* optional prefill only */ }
    })();
    return () => { live = false; };
  }, [orderId]);

  const create = async () => {
    if (!caseId) { toast({ title: "Save the case first", description: "Run the Step 4 check, it saves the case.", variant: "destructive" }); return; }
    const problem = validateBabyForm(form);
    if (problem) { toast({ title: "Report not created", description: problem, variant: "destructive" }); return; }
    setSaving(true);
    try {
      const { data, error } = await (supabase as any).from(target.table)
        .insert({ report_id: newReportId(tier), ...reportColumns({ ...form, status: "draft" }), pdf_url: null, order_id: orderId, swar_case_id: caseId })
        .select("*").single();
      if (error) throw error;
      setReport(data);
      toast({ title: "Report created", description: `${data.report_id}: opening ${target.label}${AUTO_GENERATE_AFTER_REDIRECT ? " and generating the PDF" : ""}...` });
      // The Swar page opens this case again when the operator comes back (see SwarCalculatorModule). The latest
      // Step 1-4 values are saved first, because the case is read back from the database on return.
      try { await onBeforeLeave?.(); } catch { /* the quiet save must never block opening the report */ }
      try { sessionStorage.setItem("swar_restore_case", String(caseId)); } catch { /* private mode: nothing to keep */ }
      navigate(reportOpenUrl(tier, data.report_id, AUTO_GENERATE_AFTER_REDIRECT));
    } catch (e: any) {
      toast({ title: "Could not create the report", description: e?.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  // The name on the card = the name(s) the report was made for (First + Middle + Last).
  const cardName = (): string => String(report?.customer_name || report?.first_name || "").trim();
  const shortLink = report ? shortReportLink(report.report_id) : "";
  const message = () => reportMessage(tier, report?.first_name || report?.customer_name || "", shortLink);

  // One click: copy the "Report is Ready" card (with the customer's name) to the clipboard, then open the customer's
  // WhatsApp chat with the message typed in. The operator presses Ctrl+V (image) and Send.
  const send = async () => {
    if (!report?.pdf_url) return;
    try {
      const blob = await reportCardBlob(tier, cardName());
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast({ title: "Image copied, WhatsApp is opening", description: "Click the message box, press Ctrl+V, then Send." });
    } catch {
      toast({ title: "Could not copy the image", description: "Use Download image and attach it manually.", variant: "destructive" });
    }
    sendWhatsApp(message());
    onSent();
  };

  const copyCard = async () => {
    try {
      const blob = await reportCardBlob(tier, cardName());
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast({ title: "Image copied", description: "Paste it in WhatsApp (Ctrl+V)." });
    } catch {
      toast({ title: "Copy not supported here", description: "Use Download image instead.", variant: "destructive" });
    }
  };

  const downloadCard = async () => {
    try {
      const blob = await reportCardBlob(tier, cardName());
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${report.report_id}-ready.png`;
      a.click();
    } catch (e: any) { toast({ title: "Could not make the image", description: e?.message, variant: "destructive" }); }
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
          <BabyReportForm values={form} onChange={onFormChange} />
          <Button type="button" variant="outline" size="sm" onClick={() => applyBase(true)}>Re-fill from Step 4 and the order</Button>
          <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
            Will be saved as: <b>{form.option1_name || "-"}</b>{form.option2_name && form.option2_name !== "NA" ? <> and <b>{form.option2_name}</b></> : null} · {form.gender || "-"} · DOB {form.dob || "-"} · first alphabet {form.first_alphabet || "-"}
          </div>
          <Button onClick={create} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}Create and open {target.label}
          </Button>
        </>
      ) : (
        <div className="space-y-3">
          <div className="rounded-md border p-3 text-sm">
            <div className="font-medium">{report.option1_name}{report.option2_name && !/^na$/i.test(report.option2_name) ? ` · ${report.option2_name}` : ""}</div>
            <div className="text-xs text-muted-foreground">{report.email} · {report.phone}</div>
          </div>
          {report.pdf_url ? (
            <>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild><a href={report.pdf_url} target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4 mr-2" />View PDF</a></Button>
              <Button onClick={send}><MessageCircle className="w-4 h-4 mr-2" />Send image + link on WhatsApp</Button>
              <Button variant="outline" onClick={copyCard}><ImageIcon className="w-4 h-4 mr-2" />Copy image</Button>
              <Button variant="outline" onClick={downloadCard}><ImageIcon className="w-4 h-4 mr-2" />Download image</Button>
              <Button variant="outline" onClick={async () => { await navigator.clipboard.writeText(message()); toast({ title: "Message copied" }); }}><Copy className="w-4 h-4 mr-2" />Copy message</Button>
            </div>
            <p className="text-xs text-muted-foreground">Short link sent to the customer: <b>{shortLink}</b></p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">The report is a draft. Press Open this report to generate the PDF, then come back here and press refresh. The WhatsApp button appears once the PDF is ready. (To send it by email, use the Send email button on that page.)</p>
          )}
          <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={async () => { await navigator.clipboard.writeText(report.report_id); toast({ title: "Report ID copied", description: "Paste it in the search box on that page." }); }}>
            Copy report ID
          </Button>
          <Button variant="outline" asChild><Link onClick={() => { void onBeforeLeave?.(); try { sessionStorage.setItem("swar_restore_case", String(caseId)); } catch { /* ignore */ } }} to={reportOpenUrl(tier, report.report_id, AUTO_GENERATE_AFTER_REDIRECT && !report.pdf_url)}><ExternalLink className="w-4 h-4 mr-2" />Open this report</Link></Button>
          </div>
        </div>
      )}
    </div>
  );
}
