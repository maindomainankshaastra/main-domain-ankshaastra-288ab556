// import { useMemo, useState } from "react";
// import { CalendarCheck, Copy, Loader2, TriangleAlert } from "lucide-react";
// import { AdminPage } from "@/components/admin/AdminPage";
// import { PlacePicker } from "@/components/admin/PlacePicker";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { useToast } from "@/hooks/use-toast";
// import { analyzeCSection, GRADE_LABEL, type CSectionResult, type DayResult } from "@/lib/c-section/index.ts";
// import { avoidLines, summaryText } from "@/lib/c-section/format.ts";
// import { fmtDate, fmtRange, fmtTime } from "@/lib/c-section/time.ts";

// const gradeClass: Record<number, string> = {
//   4: "bg-emerald-100 text-emerald-800 border-emerald-300",
//   3: "bg-green-50 text-green-800 border-green-300",
//   2: "bg-amber-50 text-amber-800 border-amber-300",
//   1: "bg-red-50 text-red-800 border-red-300",
// };

// interface Place { name: string; lat: number; lon: number; tz: string }

// function DayCard({ d, tz, rank }: { d: DayResult; tz: string; rank: number }) {
//   const avoid = avoidLines(d, tz);
//   return (
//     <div className="rounded-lg border bg-card p-4 space-y-3">
//       <div className="flex flex-wrap items-center gap-2">
//         <Badge variant="outline" className="text-sm">Priority {rank}</Badge>
//         <h3 className="font-display text-lg">{fmtDate(d.date)} <span className="text-muted-foreground">({d.weekday})</span></h3>
//         <Badge variant="outline" className={gradeClass[d.grade]}>{GRADE_LABEL[d.grade]}</Badge>
//         {d.relaxed && <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300">Has cautions</Badge>}
//         {d.notes.length > 0 && <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300">Panchak (caution only)</Badge>}
//       </div>
//       <p className="text-sm text-muted-foreground">
//         Mulank {d.numerology.mulank} | Bhagyank {d.numerology.bhagyank} | Luck {d.numerology.luckPct}% ({d.numerology.classification})
//         {d.sunrise && d.sunset && <> | Sunrise {fmtTime(d.sunrise, tz)}, Sunset {fmtTime(d.sunset, tz)}</>}
//       </p>
//       {d.atSunrise && (
//         <p className="text-sm">
//           At sunrise: {d.atSunrise.paksha} {d.atSunrise.tithi} | {d.atSunrise.nakshatra} | Moon in {d.atSunrise.rashi} | {d.atSunrise.yoga} yoga | {d.atSunrise.karana} karana
//         </p>
//       )}
//       {d.changes.length > 0 && (
//         <p className="text-xs text-muted-foreground">
//           Changes: {d.changes.map((c) => `${fmtTime(c.at, tz)} ${c.what}`).join("; ")}
//         </p>
//       )}
//       <div className="grid gap-4 md:grid-cols-2">
//         <div>
//           <p className="mb-1 text-sm font-medium text-emerald-700">
//             {d.relaxed ? "Shubh time (has cautions, see each line)" : "Shubh time (clear of every avoid time)"}
//           </p>
//           {d.windows.length === 0 ? (
//             <p className="text-sm text-red-700">{d.noWindowReason}</p>
//           ) : (
//             <ul className="space-y-1 text-sm">
//               {d.windows.map((w, i) => {
//                 const best = d.recommended.includes(w);
//                 return (
//                   <li key={i} className={best ? "font-medium" : ""}>
//                     {fmtRange(w.start, w.end, tz)}
//                     <span className="text-muted-foreground"> | {GRADE_LABEL[w.grade]} | {w.lagna} lagna | {w.nakshatra}</span>
//                     {w.tags.map((t) => <Badge key={t} variant="secondary" className="ml-1">{t}</Badge>)}
//                     {best && <Badge className="ml-1">Best</Badge>}
//                     {w.cautions.length > 0 && <span className="block text-xs text-amber-700">Caution: {w.cautions.join(", ")}</span>}
//                   </li>
//                 );
//               })}
//             </ul>
//           )}
//         </div>
//         <div>
//           <p className="mb-1 text-sm font-medium text-red-700">Time to avoid (during OT hours)</p>
//           {avoid.length === 0 ? <p className="text-sm text-muted-foreground">Nothing in OT hours.</p> : (
//             <ul className="space-y-1 text-sm">{avoid.map((l, i) => <li key={i}>{l}</li>)}</ul>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function CSectionCalculatorModule() {
//   const { toast } = useToast();
//   const [mother, setMother] = useState("");
//   const [father, setFather] = useState("");
//   const [start, setStart] = useState("");
//   const [end, setEnd] = useState("");
//   const [placeText, setPlaceText] = useState("");
//   const [place, setPlace] = useState<Place | null>(null);
//   const [otStart, setOtStart] = useState("08:00");
//   const [otEnd, setOtEnd] = useState("18:00");
//   const [gandMool, setGandMool] = useState<"nakshatra" | "gandanta-only">("nakshatra");
//   const [busy, setBusy] = useState(false);
//   const [error, setError] = useState("");
//   const [result, setResult] = useState<CSectionResult | null>(null);

//   const tz = result?.input.location.tz ?? "Asia/Kolkata";
//   const text = useMemo(() => (result ? summaryText(result, { mother, father }) : ""), [result, mother, father]);

//   const calculate = () => {
//     setError("");
//     if (!start || !end) return setError("Enter the doctor's delivery window (start and end date).");
//     if (!place) return setError("Pick the hospital's city from the suggestions so latitude, longitude and time zone are known.");
//     setBusy(true);
//     // let the spinner paint before the (CPU-heavy) calculation
//     setTimeout(() => {
//       try {
//         setResult(analyzeCSection({
//           windowStart: start, windowEnd: end,
//           location: { lat: place.lat, lon: place.lon, tz: place.tz, name: place.name },
//           otStart, otEnd, gandMoolMode: gandMool,
//         }));
//       } catch (e) {
//         setResult(null);
//         setError(e instanceof Error ? e.message : "Could not calculate");
//       } finally { setBusy(false); }
//     }, 30);
//   };

//   const copy = async () => {
//     try { await navigator.clipboard.writeText(text); toast({ title: "Copied", description: "Summary copied for WhatsApp / email." }); }
//     catch { toast({ title: "Could not copy", variant: "destructive" }); }
//   };

//   return (
//     <div className="space-y-6">
//       <AdminPage title="C-Section Dates Calculator" description="Enter the delivery window and hospital location. Panchang is calculated automatically for every date.">
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//           <div><Label>Mother's name</Label><Input value={mother} onChange={(e) => setMother(e.target.value)} /></div>
//           <div><Label>Father's name</Label><Input value={father} onChange={(e) => setFather(e.target.value)} /></div>
//           <div>
//             <Label>Hospital location</Label>
//             <PlacePicker
//               value={placeText}
//               onChange={(v) => { setPlaceText(v); setPlace(null); }}
//               onPick={(s) => {
//                 if (s.latitude != null && s.longitude != null) setPlace({ name: s.value, lat: s.latitude, lon: s.longitude, tz: s.timezone || "Asia/Kolkata" });
//               }}
//               placeholder="Type the hospital's city"
//             />
//             {place && <p className="mt-1 text-xs text-muted-foreground">{place.lat.toFixed(3)}, {place.lon.toFixed(3)} | {place.tz}</p>}
//           </div>
//           <div><Label>Delivery window: from</Label><Input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></div>
//           <div><Label>Delivery window: to</Label><Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
//           <div className="grid grid-cols-2 gap-2">
//             <div><Label>OT opens</Label><Input type="time" value={otStart} onChange={(e) => setOtStart(e.target.value)} /></div>
//             <div><Label>OT closes</Label><Input type="time" value={otEnd} onChange={(e) => setOtEnd(e.target.value)} /></div>
//           </div>
//           <div>
//             <Label>Gand Mool rule</Label>
//             <Select value={gandMool} onValueChange={(v) => setGandMool(v as "nakshatra" | "gandanta-only")}>
//               <SelectTrigger><SelectValue /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="nakshatra">Avoid all 6 Gand Mool nakshatras</SelectItem>
//                 <SelectItem value="gandanta-only">Avoid only the Gandanta junction</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </div>
//         <div className="mt-4 flex items-center gap-3">
//           <Button onClick={calculate} disabled={busy}>
//             {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarCheck className="mr-2 h-4 w-4" />}
//             Calculate top 3 dates
//           </Button>
//           {error && <p className="flex items-center gap-1 text-sm text-red-700"><TriangleAlert className="h-4 w-4" />{error}</p>}
//         </div>
//       </AdminPage>

//       {result && (
//         <AdminPage
//           title="Top dates"
//           description={`${fmtDate(result.input.windowStart)} to ${fmtDate(result.input.windowEnd)} | OT ${result.input.otStart}-${result.input.otEnd} | ${result.input.location.name ?? ""}`}
//           actions={<Button variant="outline" onClick={copy}><Copy className="mr-2 h-4 w-4" />Copy summary</Button>}
//         >
//           <div className="space-y-4">
//             {result.warnings.map((w, i) => (
//               <p key={i} className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-2 text-sm text-amber-900"><TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />{w}</p>
//             ))}
//             {result.top.map((d, i) => <DayCard key={d.date} d={d} tz={tz} rank={i + 1} />)}

//             <div>
//               <p className="mb-2 text-sm font-medium">All dates in the window</p>
//               <div className="overflow-x-auto rounded-md border">
//                 <table className="w-full text-sm">
//                   <thead className="bg-muted/50 text-left">
//                     <tr><th className="p-2">Rank</th><th className="p-2">Date</th><th className="p-2">Mulank / Bhagyank / Luck</th><th className="p-2">Panchang grade (Excel)</th><th className="p-2">Clean shubh time</th></tr>
//                   </thead>
//                   <tbody>
//                     {result.ranked.map((d) => (
//                       <tr key={d.date} className="border-t">
//                         <td className="p-2">{d.rank}</td>
//                         <td className="p-2">{fmtDate(d.date)} ({d.weekday.slice(0, 3)})</td>
//                         <td className="p-2">{d.numerology.mulank} / {d.numerology.bhagyank} / {d.numerology.luckPct}%</td>
//                         <td className="p-2"><Badge variant="outline" className={gradeClass[d.excelGrade]}>{GRADE_LABEL[d.excelGrade]}</Badge></td>
//                         <td className="p-2">{d.windows.length ? `${Math.round(d.cleanMinutes)} min${d.relaxed ? " (cautions)" : ""}` : <span className="text-red-700">{d.noWindowReason}</span>}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//             <p className="text-xs text-muted-foreground">Numerology and Muhurat guidance only. Always confirm the final date and time with the treating obstetrician.</p>
//           </div>
//         </AdminPage>
//       )}
//     </div>
//   );
// }


import { useMemo, useState } from "react";
import { CalendarCheck, Copy, FileDown, Loader2, MessageCircle, TriangleAlert } from "lucide-react";
import { AdminPage } from "@/components/admin/AdminPage";
import { PlacePicker } from "@/components/admin/PlacePicker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { analyzeCSection, GRADE_LABEL, type CSectionResult, type DayResult } from "@/lib/c-section/index.ts";
import { avoidLines, summaryText, whatsappMessage } from "@/lib/c-section/format.ts";
import { fmtDate, fmtRange, fmtTime } from "@/lib/c-section/time.ts";
import { legacyDatabase as supabase } from "@/lib/legacy-database-client";
import { openWhatsApp } from "@/lib/swar/swarMessage";
import { CalendarView, CSectionExtras } from "@/components/admin/c-section/CSectionVisuals";
import { generateCSectionReportInBrowser } from "@/lib/c-section/report/browser";
import { firstName } from "@/lib/c-section/report/pages";

const gradeClass: Record<number, string> = {
  4: "bg-emerald-100 text-emerald-800 border-emerald-300",
  3: "bg-green-50 text-green-800 border-green-300",
  2: "bg-amber-50 text-amber-800 border-amber-300",
  1: "bg-red-50 text-red-800 border-red-300",
};

interface Place { name: string; lat: number; lon: number; tz: string }

function DayCard({ d, tz, rank }: { d: DayResult; tz: string; rank: number }) {
  const avoid = avoidLines(d, tz);
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="text-sm">Priority {rank}</Badge>
        <h3 className="font-display text-lg">{fmtDate(d.date)} <span className="text-muted-foreground">({d.weekday})</span></h3>
        <Badge variant="outline" className={gradeClass[d.grade]}>{GRADE_LABEL[d.grade]}</Badge>
        {d.relaxed && <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300">Has cautions</Badge>}
        {d.notes.length > 0 && <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300">Panchak (caution only)</Badge>}
      </div>
      <p className="text-sm text-muted-foreground">
        Mulank {d.numerology.mulank} | Bhagyank {d.numerology.bhagyank} | Luck {d.numerology.luckPct}% ({d.numerology.classification})
        {d.sunrise && d.sunset && <> | Sunrise {fmtTime(d.sunrise, tz)}, Sunset {fmtTime(d.sunset, tz)}</>}
      </p>
      {d.atSunrise && (
        <p className="text-sm">
          At sunrise: {d.atSunrise.paksha} {d.atSunrise.tithi} | {d.atSunrise.nakshatra} | Moon in {d.atSunrise.rashi} | {d.atSunrise.yoga} yoga | {d.atSunrise.karana} karana
        </p>
      )}
      {d.changes.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Changes: {d.changes.map((c) => `${fmtTime(c.at, tz)} ${c.what}`).join("; ")}
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-1 text-sm font-medium text-emerald-700">
            {d.relaxed ? "Shubh time (has cautions, see each line)" : "Shubh time (clear of every avoid time)"}
          </p>
          {d.windows.length === 0 ? (
            <p className="text-sm text-red-700">{d.noWindowReason}</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {d.windows.map((w, i) => {
                const best = d.recommended.includes(w);
                return (
                  <li key={i} className={best ? "font-medium" : ""}>
                    {fmtRange(w.start, w.end, tz)}
                    <span className="text-muted-foreground"> | {GRADE_LABEL[w.grade]} | {w.lagna} lagna | {w.nakshatra}</span>
                    {w.tags.map((t) => <Badge key={t} variant="secondary" className="ml-1">{t}</Badge>)}
                    {best && <Badge className="ml-1">Best</Badge>}
                    {w.cautions.length > 0 && <span className="block text-xs text-amber-700">Caution: {w.cautions.join(", ")}</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div>
          <p className="mb-1 text-sm font-medium text-red-700">Time to avoid (during OT hours)</p>
          {avoid.length === 0 ? <p className="text-sm text-muted-foreground">Nothing in OT hours.</p> : (
            <ul className="space-y-1 text-sm">{avoid.map((l, i) => <li key={i}>{l}</li>)}</ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CSectionCalculatorModule() {
  const { toast } = useToast();
  const [mother, setMother] = useState("");
  const [father, setFather] = useState("");
  const [motherDob, setMotherDob] = useState("");
  const [fatherDob, setFatherDob] = useState("");
  const [hospital, setHospital] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);
  const [phone, setPhone] = useState("");
  const [waBusy, setWaBusy] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [placeText, setPlaceText] = useState("");
  const [place, setPlace] = useState<Place | null>(null);
  const [otStart, setOtStart] = useState("08:00");
  const [otEnd, setOtEnd] = useState("18:00");
  const [gandMool, setGandMool] = useState<"nakshatra" | "gandanta-only">("nakshatra");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CSectionResult | null>(null);

  const tz = result?.input.location.tz ?? "Asia/Kolkata";
  const text = useMemo(() => (result ? summaryText(result, { mother, father }) : ""), [result, mother, father]);

  const calculate = () => {
    setError("");
    if (!start || !end) return setError("Enter the doctor's delivery window (start and end date).");
    if (!place) return setError("Pick the hospital's city from the suggestions so latitude, longitude and time zone are known.");
    setBusy(true);
    // let the spinner paint before the (CPU-heavy) calculation
    setTimeout(() => {
      try {
        setResult(analyzeCSection({
          windowStart: start, windowEnd: end,
          location: { lat: place.lat, lon: place.lon, tz: place.tz, name: place.name },
          otStart, otEnd, gandMoolMode: gandMool,
        }));
      } catch (e) {
        setResult(null);
        setError(e instanceof Error ? e.message : "Could not calculate");
      } finally { setBusy(false); }
    }, 30);
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(text); toast({ title: "Copied", description: "Summary copied for WhatsApp / email." }); }
    catch { toast({ title: "Could not copy", variant: "destructive" }); }
  };

  const buildPdf = async () => {
    if (!result) throw new Error("Calculate the dates first");
    if (!mother.trim() || !father.trim()) throw new Error("Enter both parents' names first");
    if (!motherDob || !fatherDob) throw new Error("Enter both parents' dates of birth first");
    return generateCSectionReportInBrowser({
      motherName: mother.trim(), fatherName: father.trim(), motherDob, fatherDob,
      hospitalName: hospital.trim(), city: place?.name ?? "", result,
    });
  };

  const sendWhatsApp = async () => {
    if (!result) return;
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) { toast({ title: "Enter the customer's WhatsApp number", variant: "destructive" }); return; }
    const full = digits.length === 10 ? `91${digits}` : digits;
    setWaBusy(true);
    try {
      const bytes = await buildPdf();
      const fname = `${firstName(mother)}_C-Section_Dates_Ankshaastra`.replace(/[^A-Za-z0-9_-]/g, "");
      const path = `${fname}-${Date.now()}.pdf`;
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      const up = await supabase.storage.from("c-section-reports").upload(path, blob, { contentType: "application/pdf", upsert: true });
      if (up.error) throw new Error(`Upload failed: ${up.error.message}. Create the public bucket "c-section-reports" in Supabase (see the SQL file).`);
      const pdfUrl = supabase.storage.from("c-section-reports").getPublicUrl(path).data.publicUrl;
      const res = openWhatsApp(full, whatsappMessage(result, { mother, pdfUrl }));
      toast({
        title: res === "opened" ? "WhatsApp opened" : res === "copied" ? "Message copied" : "Pop-up blocked",
        description: res === "opened" ? "Check the message and press Send." : "Message copied. Open the chat, press Ctrl+V and Send.",
      });
    } catch (e) {
      toast({ title: "Could not send", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally { setWaBusy(false); }
  };

  const copyWhatsAppText = async () => {
    if (!result) return;
    try { await navigator.clipboard.writeText(whatsappMessage(result, { mother })); toast({ title: "Message copied" }); }
    catch { toast({ title: "Could not copy", variant: "destructive" }); }
  };

  const downloadPdf = async () => {
    if (!result) return;
    if (!mother.trim() || !father.trim()) { toast({ title: "Enter both parents' names first", variant: "destructive" }); return; }
    if (!motherDob || !fatherDob) { toast({ title: "Enter both parents' dates of birth first", variant: "destructive" }); return; }
    setPdfBusy(true);
    try {
      const bytes = await generateCSectionReportInBrowser({
        motherName: mother.trim(), fatherName: father.trim(), motherDob, fatherDob,
        hospitalName: hospital.trim(), city: place?.name ?? "", result,
      });
      const url = URL.createObjectURL(new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${firstName(mother)}_C-Section_Dates_Ankshaastra.pdf`.replace(/[\\/:*?"<>|]/g, "");
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (e) {
      toast({ title: "Could not create the PDF", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally { setPdfBusy(false); }
  };

  return (
    <div className="space-y-6">
      <AdminPage title="C-Section Dates Calculator" description="Enter the delivery window and hospital location. Panchang is calculated automatically for every date.">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div><Label>Mother's name</Label><Input value={mother} onChange={(e) => setMother(e.target.value)} /></div>
          <div><Label>Father's name</Label><Input value={father} onChange={(e) => setFather(e.target.value)} /></div>
          <div><Label>Mother's date of birth</Label><Input type="date" value={motherDob} onChange={(e) => setMotherDob(e.target.value)} /></div>
          <div><Label>Father's date of birth</Label><Input type="date" value={fatherDob} onChange={(e) => setFatherDob(e.target.value)} /></div>
          <div><Label>Customer WhatsApp number</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 98765 43210" inputMode="tel" /></div>
          <div><Label>Hospital name</Label><Input value={hospital} onChange={(e) => setHospital(e.target.value)} placeholder="e.g. Samarpan Hospital" /></div>
          <div>
            <Label>Hospital city</Label>
            <PlacePicker
              value={placeText}
              onChange={(v) => { setPlaceText(v); setPlace(null); }}
              onPick={(s) => {
                if (s.latitude != null && s.longitude != null) setPlace({ name: s.value, lat: s.latitude, lon: s.longitude, tz: s.timezone || "Asia/Kolkata" });
              }}
              placeholder="Type the hospital's city"
            />
            {place && <p className="mt-1 text-xs text-muted-foreground">{place.lat.toFixed(3)}, {place.lon.toFixed(3)} | {place.tz}</p>}
          </div>
          <div><Label>Delivery window: from</Label><Input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></div>
          <div><Label>Delivery window: to</Label><Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>OT opens</Label><Input type="time" value={otStart} onChange={(e) => setOtStart(e.target.value)} /></div>
            <div><Label>OT closes</Label><Input type="time" value={otEnd} onChange={(e) => setOtEnd(e.target.value)} /></div>
          </div>
          <div>
            <Label>Gand Mool rule</Label>
            <Select value={gandMool} onValueChange={(v) => setGandMool(v as "nakshatra" | "gandanta-only")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="nakshatra">Avoid all 6 Gand Mool nakshatras</SelectItem>
                <SelectItem value="gandanta-only">Avoid only the Gandanta junction</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={calculate} disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarCheck className="mr-2 h-4 w-4" />}
            Calculate top 3 dates
          </Button>
          {error && <p className="flex items-center gap-1 text-sm text-red-700"><TriangleAlert className="h-4 w-4" />{error}</p>}
        </div>
      </AdminPage>

      {result && (
        <AdminPage
          title="Top dates"
          description={`${fmtDate(result.input.windowStart)} to ${fmtDate(result.input.windowEnd)} | OT ${result.input.otStart}-${result.input.otEnd} | ${result.input.location.name ?? ""}`}
          actions={<div className="flex gap-2"><Button variant="outline" onClick={copy}><Copy className="mr-2 h-4 w-4" />Copy summary</Button><Button onClick={downloadPdf} disabled={pdfBusy}>{pdfBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}Download PDF report</Button><Button className="bg-green-600 text-white hover:bg-green-700" onClick={sendWhatsApp} disabled={waBusy}>{waBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageCircle className="mr-2 h-4 w-4" />}Send on WhatsApp</Button><Button variant="outline" onClick={copyWhatsAppText}><Copy className="mr-2 h-4 w-4" />Copy WhatsApp text</Button></div>}
        >
          <div className="space-y-4">
            {result.warnings.map((w, i) => (
              <p key={i} className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-2 text-sm text-amber-900"><TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />{w}</p>
            ))}
            <CalendarView result={result} />
            {result.top.map((d, i) => <DayCard key={d.date} d={d} tz={tz} rank={i + 1} />)}

            <div>
              <p className="mb-2 text-sm font-medium">All dates in the window</p>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left">
                    <tr><th className="p-2">Rank</th><th className="p-2">Date</th><th className="p-2">Mulank / Bhagyank / Luck</th><th className="p-2">Panchang grade (Excel)</th><th className="p-2">Clean shubh time</th></tr>
                  </thead>
                  <tbody>
                    {result.ranked.map((d) => (
                      <tr key={d.date} className="border-t">
                        <td className="p-2">{d.rank}</td>
                        <td className="p-2">{fmtDate(d.date)} ({d.weekday.slice(0, 3)})</td>
                        <td className="p-2">{d.numerology.mulank} / {d.numerology.bhagyank} / {d.numerology.luckPct}%</td>
                        <td className="p-2"><Badge variant="outline" className={gradeClass[d.excelGrade]}>{GRADE_LABEL[d.excelGrade]}</Badge></td>
                        <td className="p-2">{d.windows.length ? `${Math.round(d.cleanMinutes)} min${d.relaxed ? " (cautions)" : ""}` : <span className="text-red-700">{d.noWindowReason}</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <CSectionExtras result={result} />
            <p className="text-xs text-muted-foreground">Numerology and Muhurat guidance only. Always confirm the final date and time with the treating obstetrician.</p>
          </div>
        </AdminPage>
      )}
    </div>
  );
}
