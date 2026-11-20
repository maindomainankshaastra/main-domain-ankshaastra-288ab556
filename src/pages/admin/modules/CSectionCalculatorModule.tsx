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


import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarCheck, Copy, FileDown, Loader2, MessageCircle, TriangleAlert, ExternalLink } from "lucide-react";
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

const DRAFT_KEY = "c-section-calculator-draft";
function loadDraft(): Record<string, any> {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}") || {}; } catch { return {}; }
}

const BUCKET = "c-section-reports";
const TABLE = "c_section_reports";

interface SavedReport {
  id: string; created_at: string; mother_name: string; father_name: string; phone: string | null;
  hospital: string | null; city: string | null; window_start: string; window_end: string;
  top_dates: string | null; pdf_url: string; whatsapp_sent_at: string | null;
}

function shortPdfUrl(path: string): string {
  const host = window.location.origin;
  if (/localhost|127\.0\.0\.1/.test(host)) return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  return `${host}/cs/${path}`;
}

function PreviousReports({ rows, loading, loadError, onSend }: { rows: SavedReport[]; loading: boolean; loadError: string; onSend: (r: SavedReport) => void }) {
  const [q, setQ] = useState("");
  const shown = rows.filter((r) => `${r.mother_name} ${r.father_name} ${r.phone ?? ""} ${r.hospital ?? ""}`.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <AdminPage title="Previous C-Section reports" description="Every report you generate is saved here, so you can open the PDF or send the link again on WhatsApp.">
      {loadError && <p className="mb-3 flex items-start gap-2 rounded-md border border-red-300 bg-red-50 p-2 text-sm text-red-800"><TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />Could not load the history: {loadError}. Run the c_section_reports SQL in Supabase.</p>}
      <p className="mb-2 text-sm font-medium">Total reports: {rows.length} | Sent on WhatsApp: {rows.filter((r) => r.whatsapp_sent_at).length}</p>
      <div className="mb-3 max-w-sm"><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone or hospital" /></div>
      {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : shown.length === 0 ? (
        <p className="text-sm text-muted-foreground">{rows.length ? "No report matches your search." : "No reports yet. They appear here once you download or send one."}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left"><tr>
              <th className="p-2">Created</th><th className="p-2">Parents</th><th className="p-2">WhatsApp</th><th className="p-2">Hospital</th><th className="p-2">Window</th><th className="p-2">Top dates</th><th className="p-2">Actions</th>
            </tr></thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} className="border-t align-top">
                  <td className="p-2 whitespace-nowrap">{new Date(r.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="p-2">{r.mother_name} &amp; {r.father_name}</td>
                  <td className="p-2 whitespace-nowrap">{r.phone || "-"}{r.whatsapp_sent_at && <div className="text-xs text-green-700">Sent {new Date(r.whatsapp_sent_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</div>}</td>
                  <td className="p-2">{[r.hospital, r.city].filter(Boolean).join(", ") || "-"}</td>
                  <td className="p-2 whitespace-nowrap">{fmtDate(r.window_start)} to {fmtDate(r.window_end)}</td>
                  <td className="p-2 whitespace-pre-line text-xs">{r.top_dates}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" asChild><a href={r.pdf_url} target="_blank" rel="noreferrer"><ExternalLink className="mr-1 h-3.5 w-3.5" />PDF</a></Button>
                      <Button size="sm" className="bg-green-600 text-white hover:bg-green-700" onClick={() => onSend(r)}><MessageCircle className="mr-1 h-3.5 w-3.5" />Send</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPage>
  );
}

export default function CSectionCalculatorModule() {
  const { toast } = useToast();
  const draft = useMemo(loadDraft, []);
  const [mother, setMother] = useState(draft.mother ?? "");
  const [father, setFather] = useState(draft.father ?? "");
  const [motherDob, setMotherDob] = useState(draft.motherDob ?? "");
  const [fatherDob, setFatherDob] = useState(draft.fatherDob ?? "");
  const [hospital, setHospital] = useState(draft.hospital ?? "");
  const [pdfBusy, setPdfBusy] = useState(false);
  const [phone, setPhone] = useState(draft.phone ?? "");
  const [waBusy, setWaBusy] = useState(false);
  const [history, setHistory] = useState<SavedReport[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [start, setStart] = useState(draft.start ?? "");
  const [end, setEnd] = useState(draft.end ?? "");
  const [placeText, setPlaceText] = useState(draft.placeText ?? "");
  const [place, setPlace] = useState<Place | null>(draft.place ?? null);
  const [otStart, setOtStart] = useState(draft.otStart ?? "08:00");
  const [otEnd, setOtEnd] = useState(draft.otEnd ?? "18:00");
  const [gandMool, setGandMool] = useState<"nakshatra" | "gandanta-only">(draft.gandMool ?? "nakshatra");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CSectionResult | null>(null);

  // keep the form across page refreshes (this browser only)
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ mother, father, motherDob, fatherDob, hospital, phone, start, end, placeText, place, otStart, otEnd, gandMool }));
    } catch { /* storage not available: form simply won't be remembered */ }
  }, [mother, father, motherDob, fatherDob, hospital, phone, start, end, placeText, place, otStart, otEnd, gandMool]);

  const loadHistory = useCallback(async () => {
    const { data, error: err } = await supabase.from(TABLE).select("*").order("created_at", { ascending: false }).limit(200);
    if (err) setHistoryError(err.message);
    else { setHistoryError(""); setHistory((data ?? []) as unknown as SavedReport[]); }
    setHistoryLoading(false);
  }, []);
  useEffect(() => { void loadHistory(); }, [loadHistory]);

  const clearForm = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    setMother(""); setFather(""); setMotherDob(""); setFatherDob(""); setHospital(""); setPhone("");
    setStart(""); setEnd(""); setPlaceText(""); setPlace(null); setOtStart("08:00"); setOtEnd("18:00");
    setGandMool("nakshatra"); setResult(null); setError("");
  };

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

  /** Upload the PDF to storage and save a history row. Returns the short public link. */
  const saveReport = async (bytes: Uint8Array, sentAt: string | null): Promise<string> => {
    const slug = firstName(mother).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12) || "report";
    const path = `${slug}-${Math.random().toString(36).slice(2, 8)}.pdf`;
    const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
    const up = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: "application/pdf", upsert: true });
    if (up.error) throw new Error(`Upload failed: ${up.error.message}. Create the public bucket "${BUCKET}" in Supabase (see the SQL file).`);
    const pdfUrl = shortPdfUrl(path);
    if (result) {
      const tops = result.top.slice(0, 3).map((d, i) => `${i + 1}. ${fmtDate(d.date)} (${d.weekday.slice(0, 3)})`).join("\n");
      const ins = await supabase.from(TABLE).insert({
        mother_name: mother.trim(), father_name: father.trim(), phone: phone.replace(/\D/g, "") || null,
        hospital: hospital.trim() || null, city: place?.name ?? null,
        window_start: result.input.windowStart, window_end: result.input.windowEnd,
        top_dates: tops, pdf_path: path, pdf_url: pdfUrl, whatsapp_sent_at: sentAt,
      });
      if (ins.error) toast({ title: "Report not added to history", description: `${ins.error.message}. Run the c_section_reports SQL in Supabase.`, variant: "destructive" });
      else void loadHistory();
    }
    return pdfUrl;
  };

  const sendWhatsApp = async () => {
    if (!result) return;
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) { toast({ title: "Enter the customer's WhatsApp number", variant: "destructive" }); return; }
    const full = digits.length === 10 ? `91${digits}` : digits;
    setWaBusy(true);
    try {
      const bytes = await buildPdf();
      const pdfUrl = await saveReport(bytes, new Date().toISOString());
      const res = openWhatsApp(full, whatsappMessage(result, { mother, father, pdfUrl }));
      toast({
        title: res === "opened" ? "WhatsApp opened" : res === "copied" ? "Message copied" : "Pop-up blocked",
        description: res === "opened" ? "Check the message and press Send." : "Message copied. Open the chat, press Ctrl+V and Send.",
      });
    } catch (e) {
      toast({ title: "Could not send", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally { setWaBusy(false); }
  };

  /** Re-send the link of an already generated report (no new PDF). */
  const resend = async (r: SavedReport) => {
    const digits = (r.phone ?? "").replace(/\D/g, "");
    if (digits.length < 10) { toast({ title: "This report has no WhatsApp number", variant: "destructive" }); return; }
    const first = r.mother_name.trim().split(/\s+/)[0];
    const msg = `Namaste ${first} ji 🙏\n\nYour *C-Section Dates Report* from *Ankshaastra* is ready.\n\n📄 *Full detailed report (PDF):*\n${r.pdf_url}\n\n🗓 Doctor's window: ${fmtDate(r.window_start)} to ${fmtDate(r.window_end)}\n\nPlease share these dates with your doctor and confirm the final date and time with them.\n\nWarm regards,\nTeam Ankshaastra ✨`;
    openWhatsApp(digits.length === 10 ? `91${digits}` : digits, msg);
    await supabase.from(TABLE).update({ whatsapp_sent_at: new Date().toISOString() }).eq("id", r.id);
    void loadHistory();
  };

  const copyWhatsAppText = async () => {
    if (!result) return;
    try { await navigator.clipboard.writeText(whatsappMessage(result, { mother, father })); toast({ title: "Message copied" }); }
    catch { toast({ title: "Could not copy", variant: "destructive" }); }
  };

  const downloadPdf = async () => {
    if (!result) return;
    if (!mother.trim() || !father.trim()) { toast({ title: "Enter both parents' names first", variant: "destructive" }); return; }
    if (!motherDob || !fatherDob) { toast({ title: "Enter both parents' dates of birth first", variant: "destructive" }); return; }
    setPdfBusy(true);
    try {
      const bytes = await buildPdf();
      try { await saveReport(bytes, null); } catch (e) { toast({ title: "Downloaded, but not saved to history", description: e instanceof Error ? e.message : undefined, variant: "destructive" }); }
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
          <Button variant="outline" onClick={clearForm} disabled={busy}>Clear form</Button>
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

      <PreviousReports rows={history} loading={historyLoading} loadError={historyError} onSend={resend} />
    </div>
  );
}
