


// import { useEffect, useMemo, useRef, useState } from "react";
// import { Copy, Download, FileText, Image as ImageIcon, Loader2, MessageCircle, Sparkles, TriangleAlert } from "lucide-react";
// import { AdminPage } from "@/components/admin/AdminPage";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { useToast } from "@/hooks/use-toast";
// import { supabase } from "@/integrations/supabase/client";
// import { calculateSwar, type SwarResult } from "@/lib/swar/swarCalculator";
// import { buildDetailMessage, formatDob, formatTime12, getWhatsAppMode, openWhatsApp, setWhatsAppMode, type WhatsAppMode } from "@/lib/swar/swarMessage";
// import { PlacePicker } from "@/components/admin/PlacePicker";
// import { buildNameFinderProfile, type Gender } from "@/lib/swar/nameFinder";
// import { generateNameFinderReport, type AnalysisRow } from "@/lib/swar/nameFinderReport";
// import { detectPackage, nameSlots, orderMatchesPhone, prefillFromOrder, PACKAGE_PRICE, type PackageChoice, type PackageTier } from "@/lib/swar/nameFinderPackage";
// import { chaldeanRawSum } from "@/lib/name-check/numerology";
// import { reduceToSingleDigit } from "@/lib/name-check/lo-shu";
// import { loadImage, renderSwarImage } from "@/lib/swar/swarImage";
// import { analyseName, buildAnalysisMessage, coreNumbersFromDob, GRADE_LABEL, parseNames, type NameAnalysis } from "@/lib/swar/nameSteps";

// const API_BASE =
//   typeof window !== "undefined" && window.location.hostname === "localhost" ? "http://localhost:8081" : "";

// interface GeneratedName { name: string; base: string; meaning: string; total: number; number: number }
// interface NamesResponse {
//   names: GeneratedName[];
//   stats: { rounds: number; rejected: number; inputTokens: number; outputTokens: number; costUsd: number; model: string };
// }

// export default function SwarCalculatorModule() {
//   const { toast } = useToast();
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   // ---- step 1: birth details -> swar ----
//   const [dob, setDob] = useState("");
//   const [time, setTime] = useState("");
//   const [place, setPlace] = useState("");
//   const [phone, setPhone] = useState("");
//   const [tz, setTz] = useState("5.5");
//   const [result, setResult] = useState<SwarResult | null>(null);
//   const [swarText, setSwarText] = useState("");
//   const [altText, setAltText] = useState("");
//   const [bg, setBg] = useState<HTMLImageElement | null>(null);
//   const [logo, setLogo] = useState<HTMLImageElement | null>(null);

//   useEffect(() => {
//     loadImage("/swar-bg.jpg").then((i) => (i ? i : loadImage("/swar-bg.png"))).then(setBg);
//     loadImage("/swar-logo.png").then((i) => (i ? i : loadImage("/logo.jpg"))).then(setLogo);
//   }, []);

//   const compute = () => {
//     if (!dob || !time) { toast({ title: "Enter date and time of birth", variant: "destructive" }); return; }
//     try {
//       const r = calculateSwar(dob, time, Number(tz));
//       setResult(r);
//       setSwarText(r.entry.variants.join(", "));
//       setAltText(r.alternatives.join(", "));
//       const core = coreNumbersFromDob(dob);
//       if (core?.suggested.length) setNumber((prev) => prev || String(core.suggested[0]));
//     } catch (e: any) {
//       toast({ title: "Could not calculate", description: e?.message, variant: "destructive" });
//     }
//   };

//   const imageData = useMemo(() => {
//     if (!result) return null;
//     return {
//       dob: formatDob(dob), place: place || "—", time: formatTime12(time),
//       nakshatra: result.entry.nakshatra, pada: String(result.entry.pada),
//       swar: swarText, alternatives: altText,
//     };
//   }, [result, dob, place, time, swarText, altText]);

//   useEffect(() => {
//     if (imageData && canvasRef.current) renderSwarImage(canvasRef.current, imageData, bg, logo);
//   }, [imageData, bg, logo]);

//   const detail = result
//     ? buildDetailMessage({
//         dob, place: place || "—", time, nakshatra: result.entry.nakshatra,
//         pada: result.entry.pada, swar: swarText, alternatives: altText,
//       })
//     : "";
//   // Step 1 goes out as the image + the full hand-written template as its caption.
//   const caption = detail;
//   const [waMode, setWaMode] = useState<WhatsAppMode>(() => getWhatsAppMode());
//   const changeWaMode = (m: WhatsAppMode) => { setWaMode(m); setWhatsAppMode(m); };
//   const sendWhatsApp = (text: string) => openWhatsApp(phone, text, waMode);

//   const copy = async (text: string, label: string) => {
//     await navigator.clipboard.writeText(text);
//     toast({ title: `${label} copied` });
//   };
//   const downloadPng = () => {
//     canvasRef.current?.toBlob((b) => {
//       if (!b) return;
//       const a = document.createElement("a");
//       a.href = URL.createObjectURL(b);
//       a.download = `swar-${result?.entry.nakshatra}-pada${result?.entry.pada}.png`;
//       a.click();
//     });
//   };
//   const copyImage = () => {
//     canvasRef.current?.toBlob(async (b) => {
//       if (!b) return;
//       try {
//         await navigator.clipboard.write([new ClipboardItem({ "image/png": b })]);
//         toast({ title: "Image copied", description: "Paste it in WhatsApp (Ctrl+V)." });
//       } catch {
//         toast({ title: "Copy not supported here", description: "Use Download image instead.", variant: "destructive" });
//       }
//     });
//   };

//   // One click: copy the image to the clipboard, then open the customer's WhatsApp chat with the
//   // message already typed in. Operator then presses Ctrl+V (image preview opens) and Send.
//   const sendOnWhatsApp = async () => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     try {
//       const blob: Blob = await new Promise((resolve, reject) =>
//         canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("no image"))), "image/png"),
//       );
//       await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
//       toast({ title: "Image copied", description: "WhatsApp is opening. Click the message box, press Ctrl+V, then Send." });
//     } catch {
//       toast({ title: "Could not copy the image", description: "Use Download image and attach it manually.", variant: "destructive" });
//     }
//     sendWhatsApp(caption);
//   };

//   // ---- step 2: names ----
//   const [gender, setGender] = useState("boy");
//   const [surname, setSurname] = useState("");
//   const [middle, setMiddle] = useState("");
//   const [middleNotFather, setMiddleNotFather] = useState(false);
//   const [preference, setPreference] = useState("");
//   const [reportBusy, setReportBusy] = useState(false);
//   // Package bought (decides how many name slots the report has) + order lookup
//   const [pkg, setPkg] = useState<PackageChoice>({ tier: "perfect", extraNames: false });
//   const [orders, setOrders] = useState<any[]>([]);
//   const [orderBusy, setOrderBusy] = useState(false);
//   const [orderNote, setOrderNote] = useState("");
//   const slots = nameSlots(pkg);
//   const [number, setNumber] = useState("");
//   const [starts, setStarts] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [names, setNames] = useState<NamesResponse | null>(null);
//   const [picked, setPicked] = useState<Set<string>>(new Set());
//   const core = useMemo(() => coreNumbersFromDob(dob), [dob]);
//   // Logic-engine profile: Mulank, Bhagyank, Kua, surname block and the combination table.
//   const profile = useMemo(
//     () => buildNameFinderProfile(dob, gender as Gender, surname, middle, middleNotFather),
//     [dob, gender, surname, middle, middleNotFather],
//   );
//   const targetsKey = profile?.targets.join(",") ?? "";
//   // Keep the number on a target the table allows (only when the targets change, never fights a manual choice).
//   useEffect(() => {
//     if (profile?.targets.length && !profile.targets.includes(Number(number))) setNumber(String(profile.targets[0]));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [targetsKey]);
//   const surnameText = profile?.surname?.text ?? surname.trim();
//   const selectedRow = profile?.table?.find((r) => r.n === Number(number));

//   // ---- step 4: names the customer chose -> analysis ----
//   const [chosenRaw, setChosenRaw] = useState("");
//   const [analysis, setAnalysis] = useState<NameAnalysis[] | null>(null);

//   const addPickedToChosen = () => {
//     setChosenRaw(parseNames([chosenRaw, ...picked].join(",")).join(", "));
//   };
//   const runAnalysis = () => {
//     const list = parseNames(chosenRaw);
//     if (!dob) { toast({ title: "Enter date of birth in step 1", variant: "destructive" }); return; }
//     if (!list.length) { toast({ title: "Enter the names the customer chose", variant: "destructive" }); return; }
//     setAnalysis(list.map((n) => analyseName(dob, n, surnameText)));
//   };
//   const analysisMessage = analysis ? buildAnalysisMessage(dob, analysis, core?.mulank, core?.bhagyank) : "";

//   /** Fill the form + package from the customer's order (matched by the WhatsApp number). */
//   const applyOrder = (o: any) => {
//     const d = detectPackage(o);
//     if (d.choice) setPkg(d.choice);
//     const f = prefillFromOrder(o);
//     if (f.dob) setDob(f.dob);
//     if (f.time) setTime(f.time);
//     if (f.place) setPlace(f.place);
//     if (f.gender) setGender(f.gender);
//     if (f.lastName) setSurname(f.lastName);
//     if (f.middleName !== undefined) setMiddle(f.middleName);
//     setMiddleNotFather(!!f.middleName && f.middleIsFather === false);
//     setOrderNote(`${d.note}${d.amount ? ` · ₹${d.amount}` : ""}${d.choice ? ` → ${nameSlots(d.choice)} names` : ""}`);
//     toast({ title: "Order details loaded", description: "Check the details, then press Calculate in step 1." });
//   };
//   const findOrders = async () => {
//     if (phone.replace(/\D/g, "").length < 10) { toast({ title: "Enter the customer's 10-digit WhatsApp number", variant: "destructive" }); return; }
//     setOrderBusy(true);
//     try {
//       // Search ALL sites (ankshaastra / empower / miraclebaby): first by the phone column directly (no 400-row limit),
//       // then also scan the newest 400 orders for the number inside the form data, and merge both.
//       const last10 = phone.replace(/\D/g, "").slice(-10);
//       const [byPhone, recent] = await Promise.all([
//         (supabase as any).from("orders").select("*").ilike("customer_phone", `%${last10}%`).order("created_at", { ascending: false }).limit(200),
//         (supabase as any).from("orders").select("*").order("created_at", { ascending: false }).limit(400),
//       ]);
//       if (byPhone.error && recent.error) throw recent.error;
//       const merged = new Map<string, any>();
//       for (const o of (byPhone.data ?? [])) merged.set(o.id, o);
//       for (const o of (recent.data ?? [])) if (orderMatchesPhone(o, phone)) merged.set(o.id, o);
//       const list = [...merged.values()].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
//       setOrders(list);
//       if (!list.length) toast({ title: "No order found for this number", variant: "destructive" });
//       else if (list.length === 1) applyOrder(list[0]);
//     } catch (e: any) {
//       toast({ title: "Could not fetch orders", description: e?.message, variant: "destructive" });
//     } finally { setOrderBusy(false); }
//   };

//   const generate = async () => {
//     const list = starts.split(/[ ,]+/).map((s) => s.trim()).filter(Boolean);
//     if (!number || !list.length) { toast({ title: "Choose a number and starting alphabets", variant: "destructive" }); return; }
//     setLoading(true); setNames(null); setPicked(new Set());
//     try {
//       const { data: sess } = await supabase.auth.getSession();
//       const resp = await fetch(`${API_BASE}/api/admin/generate-names`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Authorization: `Bearer ${sess.session?.access_token ?? ""}` },
//         body: JSON.stringify({ gender, number: Number(number), starts: list, preference: preference.trim(), count: slots }),
//       });
//       const raw = await resp.text();
//       let json: any = null;
//       try { json = JSON.parse(raw); } catch { /* server returned non-JSON (e.g. timeout page) */ }
//       if (!json) throw new Error(resp.status === 504 || /timeout/i.test(raw) ? "Server timed out. Please try again (add more starting alphabets)." : `Server error ${resp.status}: ${raw.slice(0, 120)}`);
//       if (!resp.ok) throw new Error(json.error || "Request failed");
//       setNames(json);
//     } catch (e: any) {
//       toast({ title: "Name generation failed", description: e?.message, variant: "destructive" });
//     } finally { setLoading(false); }
//   };

//   /** Full-name number (first name + surname block), or null when no surname was entered. */
//   const fullNumber = (name: string): number | null => {
//     if (!surnameText) return null;
//     const total = chaldeanRawSum(`${name} ${surnameText}`);
//     return reduceToSingleDigit(total);
//   };

//   const downloadReport = async () => {
//     if (!names || !profile || !dob) { toast({ title: "Generate names first", variant: "destructive" }); return; }
//     setReportBusy(true);
//     try {
//       const chosen = names.names.filter((n) => picked.size === 0 || picked.has(n.name)).slice(0, slots);
//       const analysisRows: AnalysisRow[] = (analysis ?? []).map((a) => ({
//         name: a.name,
//         firstNo: a.error ? "-" : a.number,
//         fullNo: fullNumber(a.name) ?? "-",
//         suitability: a.error ? "-" : a.grade === "good" ? "Yes" : a.grade === "ok" ? "Moderate" : "No",
//       }));
//       const bytes = await generateNameFinderReport({
//         dob, time, place, gender: gender as Gender,
//         middleName: middle.trim(), middleIsFather: !middleNotFather, lastName: surname.trim(),
//         swar: swarText, firstAlphabets: starts, preference: preference.trim(),
//         profile, package: pkg,
//         names: chosen.map((n) => ({ name: n.name, meaning: n.meaning })),
//         analysis: analysisRows,
//       });
//       const url = URL.createObjectURL(new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }));
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `Numerologically-Aligned-Baby-Names-${dob}.pdf`;
//       a.click();
//       setTimeout(() => URL.revokeObjectURL(url), 5000);
//     } catch (e: any) {
//       toast({ title: "Could not build the report", description: e?.message, variant: "destructive" });
//     } finally { setReportBusy(false); }
//   };

//   const namesMessage = () => {
//     if (!names) return "";
//     const chosen = names.names.filter((n) => picked.size === 0 || picked.has(n.name));
//     const body = chosen.map((n) => `*${n.name}* – ${n.meaning}`).join("\n\n");
//     return `Namaskar,\n\nPlease find numerologically curated names specifically designed for your child:\n\n${body}\n\nKindly share your top 4–5 preferred names in order of priority. I will then provide a detailed analysis of the selected names.\n\nRegards,\nAnkshaastra-Empower Your Name`;
//   };

//   return (
//     <div className="space-y-6">
//       <AdminPage title="Step 1 · Swar Calculator" description="Enter birth details → Nakshatra, Pada, Swar and the customer image/message are ready.">
//         <div className="grid gap-4 md:grid-cols-5">
//           <div><Label>Date of birth</Label><Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} /></div>
//           <div><Label>Time of birth</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
//           <div><Label>Place</Label><PlacePicker value={place} onChange={setPlace} indiaOnly={tz === "5.5"} onPick={(p) => { if (p.timezone === "Asia/Kolkata") setTz("5.5"); }} /></div>
//           <div>
//             <Label>Time zone</Label>
//             <Select value={tz} onValueChange={setTz}>
//               <SelectTrigger><SelectValue /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="5.5">India (IST, UTC+5:30)</SelectItem>
//                 <SelectItem value="0">UK (UTC+0)</SelectItem>
//                 <SelectItem value="4">UAE (UTC+4)</SelectItem>
//                 <SelectItem value="-5">US East (UTC-5)</SelectItem>
//                 <SelectItem value="-8">US West (UTC-8)</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//           <div className="flex items-end"><Button onClick={compute} className="w-full"><Sparkles className="w-4 h-4 mr-2" />Calculate</Button></div>
//         </div>

//         {result && (
//           <div className="mt-6 grid gap-6 lg:grid-cols-2">
//             <div className="space-y-4">
//               <div className="flex flex-wrap items-center gap-2">
//                 <Badge>{result.entry.nakshatra}</Badge><Badge variant="secondary">Pada {result.entry.pada}</Badge>
//                 <Badge variant="outline">Drik Swar: {result.entry.drik}</Badge>
//                 <span className="text-xs text-muted-foreground">Moon {result.longitude.toFixed(2)}°</span>
//               </div>
//               {result.nearBoundary && (
//                 <div className="flex gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
//                   <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
//                   Moon is very close to a Pada boundary ({result.edgeDistance.toFixed(3)}°). Please double-check this one on Drik Panchang.
//                 </div>
//               )}
//               {!result.entry.confirmed && (
//                 <div className="flex gap-2 rounded-md border border-sky-300 bg-sky-50 p-3 text-sm text-sky-900">
//                   <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
//                   The extra spellings for this Swar are auto-generated, not yet verified. Edit below if needed.
//                 </div>
//               )}
//               <div><Label>Swar (editable)</Label><Input value={swarText} onChange={(e) => setSwarText(e.target.value)} /></div>
//               <div><Label>Numerology alternatives (editable)</Label><Input value={altText} onChange={(e) => setAltText(e.target.value)} /></div>
//               <div><Label>Customer WhatsApp number (optional)</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98XXXXXXXX" /></div>
//               <div className="flex flex-wrap items-center gap-2">
//                 <Button type="button" variant="outline" onClick={findOrders} disabled={orderBusy}>
//                   {orderBusy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}Fetch order details
//                 </Button>
//                 {orders.length > 1 && (
//                   <Select onValueChange={(id) => { const o = orders.find((x) => x.id === id); if (o) applyOrder(o); }}>
//                     <SelectTrigger className="w-72"><SelectValue placeholder={`${orders.length} orders found, pick one`} /></SelectTrigger>
//                     <SelectContent>
//                       {orders.map((o) => <SelectItem key={o.id} value={o.id}>{`${String(o.source_website || "ankshaastra.com").replace(".ankshaastra.com", "").replace("ankshaastra.com", "main")} · ${o.service_title} · ₹${o.total_amount} · ${new Date(o.created_at).toLocaleDateString()}`}</SelectItem>)}
//                     </SelectContent>
//                   </Select>
//                 )}
//                 {orderNote && <span className="text-xs text-muted-foreground">{orderNote}</span>}
//               </div>

//               <div className="rounded-md border p-3 text-sm whitespace-pre-wrap bg-muted/40">{caption}</div>
//               <div className="flex flex-wrap gap-2">
//                 <Button variant="outline" onClick={() => copy(caption, "Message")}><Copy className="w-4 h-4 mr-2" />Copy message</Button>
//                 <Button onClick={sendOnWhatsApp}><MessageCircle className="w-4 h-4 mr-2" />Send on WhatsApp (image + message)</Button>
//               </div>
//               <div className="flex flex-wrap items-center gap-2 text-sm">
//                 <span className="text-muted-foreground">Open WhatsApp in:</span>
//                 <Button size="sm" variant={waMode === "web" ? "default" : "outline"} onClick={() => changeWaMode("web")}>Browser (WhatsApp Web)</Button>
//                 <Button size="sm" variant={waMode === "app" ? "default" : "outline"} onClick={() => changeWaMode("app")}>Desktop app (no QR scan)</Button>
//               </div>
//               <p className="text-xs text-muted-foreground">The image is copied automatically. After WhatsApp opens, click the message box, press Ctrl+V (image preview opens), then Send. WhatsApp links cannot attach pictures by themselves. If WhatsApp Web keeps asking for the QR code, pick “Desktop app”: it stays logged in.</p>
//             </div>

//             <div className="space-y-3">
//               <canvas ref={canvasRef} className="w-full max-w-[520px] rounded-lg border shadow-sm" />
//               <div className="flex gap-2">
//                 <Button variant="outline" onClick={downloadPng}><Download className="w-4 h-4 mr-2" />Download image</Button>
//                 <Button variant="outline" onClick={copyImage}><ImageIcon className="w-4 h-4 mr-2" />Copy image</Button>
//               </div>
//               {!bg && <p className="text-xs text-muted-foreground">Using the built-in background. Put the art-only background (no text) at <code>public/swar-bg.jpg</code> to use it automatically.</p>}
//             </div>
//           </div>
//         )}
//       </AdminPage>

//       <AdminPage title="Step 2 · Customer’s chosen alphabets" description="Customer replied with the alphabets they like (e.g. V, N, M, G, B). Type them here.">
//         <div className="grid gap-4 md:grid-cols-[1fr_auto]">
//           <div><Label>Starting alphabets / Swar</Label><Input value={starts} onChange={(e) => setStarts(e.target.value)} placeholder="V, N, M, G, B  or  Pra, Rai" /></div>
//           <div className="flex items-end">
//             <Button variant="outline" disabled={!swarText} onClick={() => setStarts(swarText)}>Use Swar from step 1</Button>
//           </div>
//         </div>
//       </AdminPage>

//       <AdminPage title="Step 3 · Name Generator" description="Surname + first-name number + alphabets → verified names (every total is re-checked by code).">
//         <div className="grid gap-4 md:grid-cols-4">
//           <div>
//             <Label>Gender</Label>
//             <Select value={gender} onValueChange={setGender}>
//               <SelectTrigger><SelectValue /></SelectTrigger>
//               <SelectContent><SelectItem value="boy">Boy</SelectItem><SelectItem value="girl">Girl</SelectItem></SelectContent>
//             </Select>
//           </div>
//           <div><Label>Surname (last name)</Label><Input value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="Gokal" /></div>
//           <div><Label>Middle name (optional)</Label><Input value={middle} onChange={(e) => setMiddle(e.target.value)} placeholder="Deshraj" /></div>
//           <label className="flex items-end gap-2 pb-2 text-sm">
//             <input type="checkbox" className="mb-1" checked={middleNotFather} onChange={(e) => setMiddleNotFather(e.target.checked)} disabled={!middle.trim()} />
//             <span>Middle name is <b>not</b> father/husband’s name (add it to the surname)</span>
//           </label>
//         </div>

//         <div className="mt-4 grid gap-4 md:grid-cols-4">
//           <div>
//             <Label>Package bought</Label>
//             <Select value={pkg.tier} onValueChange={(v) => setPkg({ ...pkg, tier: v as PackageTier })}>
//               <SelectTrigger><SelectValue /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="perfect">{`Perfect Baby Name (₹${PACKAGE_PRICE.perfect})`}</SelectItem>
//                 <SelectItem value="blueprint">{`Complete Blueprint (₹${PACKAGE_PRICE.blueprint})`}</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//           <label className="flex items-end gap-2 pb-2 text-sm">
//             <input type="checkbox" className="mb-1" checked={pkg.extraNames} onChange={(e) => setPkg({ ...pkg, extraNames: e.target.checked })} />
//             <span>“10+ extra names” add-on bought</span>
//           </label>
//           <div className="flex items-end pb-2 text-sm text-muted-foreground md:col-span-2">
//             Report has <b className="mx-1">{slots}</b> name slots ({slots <= 12 ? "page 9" : slots <= 24 ? "pages 9-10" : "pages 9-11"}).
//           </div>
//         </div>

//         <div className="mt-4 grid gap-4 md:grid-cols-4">
//           <div><Label>First alphabet(s)</Label><Input value={starts} onChange={(e) => setStarts(e.target.value)} placeholder="Gaa, Go, G" /></div>
//           <div>
//             <Label>First-name Chaldean number</Label>
//             <Select value={number} onValueChange={setNumber}>
//               <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
//               <SelectContent>{[1,2,3,4,5,6,7,8,9].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
//             </Select>
//           </div>
//           <div><Label>Name preference (optional)</Label><Input value={preference} onChange={(e) => setPreference(e.target.value)} placeholder="e.g. Lord Shiva names, modern, short" /></div>
//           <div className="flex items-end">
//             <Button onClick={generate} disabled={loading} className="w-full">
//               {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}Generate names
//             </Button>
//           </div>
//         </div>

//         {profile ? (
//           <div className="mt-4 space-y-3 text-sm">
//             <div className="flex flex-wrap items-center gap-2">
//               <Badge variant="outline">Mulank {profile.mulank}</Badge>
//               <Badge variant="outline">Bhagyank {profile.bhagyank}</Badge>
//               <Badge variant="outline">Kua {profile.kua}</Badge>
//               <Badge variant="outline">Lucky numbers: {profile.luckyPool.join(", ") || "-"}</Badge>
//               {profile.surname && <Badge variant="secondary">Surname {profile.surname.text} = {profile.surname.display}</Badge>}
//             </div>
//             {profile.table ? (
//               <>
//                 <div className="flex flex-wrap items-center gap-2">
//                   <span className="text-muted-foreground">Best first-name numbers for this surname:</span>
//                   {profile.targets.length ? profile.targets.map((n) => {
//                     const row = profile.table!.find((r) => r.n === n)!;
//                     return (
//                       <Button key={n} size="sm" variant={number === String(n) ? "default" : "outline"} onClick={() => setNumber(String(n))}>
//                         {row.star ? "★ " : ""}{n} → {row.total}
//                       </Button>
//                     );
//                   }) : <span className="text-red-600">No first-name number works with this surname. See the table below.</span>}
//                 </div>
//                 {selectedRow?.mark === "cross" && (
//                   <div className="flex gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-red-900">
//                     <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />Number {selectedRow.n} is crossed: {selectedRow.reason}.
//                   </div>
//                 )}
//                 <details className="rounded-md border p-3">
//                   <summary className="cursor-pointer font-medium">Combination table (first name + surname {profile.surname?.number})</summary>
//                   <table className="mt-3 w-full text-left text-xs md:text-sm">
//                     <thead><tr className="text-muted-foreground"><th className="py-1 pr-2">First</th><th className="pr-2">Full</th><th className="pr-2">Status</th><th>Reason</th></tr></thead>
//                     <tbody>
//                       {profile.table.map((r) => (
//                         <tr key={r.n} className={`border-t ${r.star ? "bg-amber-50" : ""}`}>
//                           <td className="py-1 pr-2 font-medium">{r.n}</td>
//                           <td className="pr-2">{r.total}</td>
//                           <td className="pr-2">{r.mark === "tick" ? (r.star ? "✓ ★" : "✓") : r.mark === "circle" ? "○" : "✗"}</td>
//                           <td className="text-muted-foreground">{r.reason}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </details>
//               </>
//             ) : (
//               <p className="text-xs text-muted-foreground">
//                 Enter the surname to see which first-name numbers work (first name + surname must stay Friendly). Until then the lucky numbers are used:
//                 {" "}{profile.targets.map((n) => (
//                   <Button key={n} size="sm" className="ml-1" variant={number === String(n) ? "default" : "outline"} onClick={() => setNumber(String(n))}>{n}</Button>
//                 ))}
//               </p>
//             )}
//           </div>
//         ) : (
//           <p className="mt-3 text-xs text-muted-foreground">Enter the date of birth in step 1 to see Mulank, Bhagyank, Kua and the suggested numbers.</p>
//         )}

//         {names && (
//           <div className="mt-6 space-y-3">
//             {names.names.length === 0 && <p className="text-sm text-muted-foreground">No name passed the number and spelling checks. Try again or relax the alphabets.</p>}
//             <div className="grid gap-2 md:grid-cols-2">
//               {names.names.map((n, i) => (
//                 <label key={n.name} className="flex items-start gap-3 rounded-md border p-3 cursor-pointer">
//                   <input type="checkbox" className="mt-1" checked={picked.has(n.name)}
//                     onChange={() => setPicked((p) => { const x = new Set(p); x.has(n.name) ? x.delete(n.name) : x.add(n.name); return x; })} />
//                   <div>
//                     <div className="font-medium">{i + 1}. {n.name} <span className="text-xs text-muted-foreground">({n.total} → {n.number}){fullNumber(n.name) !== null ? ` · with surname → ${fullNumber(n.name)}` : ""}</span></div>
//                     <div className="text-sm text-muted-foreground">{n.meaning}</div>
//                   </div>
//                 </label>
//               ))}
//             </div>
//             <p className="text-xs text-muted-foreground">
//               {names.stats.rounds} AI round(s), {names.stats.rejected} names dropped by the checks · {names.stats.inputTokens + names.stats.outputTokens} tokens · about ${names.stats.costUsd} (₹{(names.stats.costUsd * 90).toFixed(2)}) · {names.stats.model}
//             </p>
//             {names.names.length > 0 && (
//               <div className="flex gap-2">
//                 <Button variant="outline" onClick={() => copy(namesMessage(), "Names message")}><Copy className="w-4 h-4 mr-2" />Copy names message{picked.size ? ` (${picked.size} selected)` : ""}</Button>
//                 <Button onClick={() => sendWhatsApp(namesMessage())}><MessageCircle className="w-4 h-4 mr-2" />Open in WhatsApp</Button>
//                 {picked.size > 0 && <Button variant="outline" onClick={addPickedToChosen}>Add {picked.size} selected to step 4</Button>}
//                 <Button variant="outline" onClick={downloadReport} disabled={reportBusy}>
//                   {reportBusy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}Download report PDF{picked.size ? ` (${picked.size} selected)` : ""}
//                 </Button>
//               </div>
//             )}
//           </div>
//         )}
//       </AdminPage>

//       <AdminPage title="Step 4 · Customer’s chosen names" description="Customer replied with their top names (even ones that were not in your list). Enter them and check every name against the DOB.">
//         <div className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
//           <div><Label>Names (comma or new line)</Label><Textarea rows={3} value={chosenRaw} onChange={(e) => setChosenRaw(e.target.value)} placeholder="Dheer, Darsh, Advik, Vyom" /></div>
//           <div><Label>Surname (optional)</Label><Input value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="Sharma" /></div>
//           <div className="flex items-end"><Button onClick={runAnalysis}><Sparkles className="w-4 h-4 mr-2" />Check names</Button></div>
//         </div>
//       </AdminPage>

//       <AdminPage title="Step 5 · Detailed analysis" description="Verified by the same rule engine as the Name Check report. Copy or send it to the customer.">
//         {!analysis ? (
//           <p className="text-sm text-muted-foreground">Enter the customer’s names in step 4 and press “Check names”.</p>
//         ) : (
//           <div className="space-y-4">
//             <div className="overflow-x-auto rounded-md border">
//               <table className="w-full text-sm">
//                 <thead className="bg-muted/50 text-left">
//                   <tr><th className="p-2">Name</th><th className="p-2">Total → No.</th><th className="p-2">vs Mulank</th><th className="p-2">vs Bhagyank</th><th className="p-2">Compound</th><th className="p-2">Verdict</th></tr>
//                 </thead>
//                 <tbody>
//                   {analysis.map((r) => (
//                     <tr key={r.name} className="border-t">
//                       <td className="p-2 font-medium">{r.name}</td>
//                       <td className="p-2">{r.total} → {r.number}</td>
//                       {r.error ? <td className="p-2 text-destructive" colSpan={4}>{r.error}</td> : (
//                         <>
//                           <td className="p-2 capitalize">{r.firstToMulank}</td>
//                           <td className="p-2 capitalize">{r.firstToBhagyank}</td>
//                           <td className="p-2 capitalize">{r.compoundTier}</td>
//                           <td className="p-2">{GRADE_LABEL[r.grade]}</td>
//                         </>
//                       )}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             <div className="rounded-md border p-3 text-sm whitespace-pre-wrap bg-muted/40">{analysisMessage}</div>
//             <div className="flex flex-wrap gap-2">
//               <Button variant="outline" onClick={() => copy(analysisMessage, "Analysis message")}><Copy className="w-4 h-4 mr-2" />Copy analysis message</Button>
//               <Button onClick={() => sendWhatsApp(analysisMessage)}><MessageCircle className="w-4 h-4 mr-2" />Send on WhatsApp</Button>
//             </div>
//           </div>
//         )}
//       </AdminPage>
//     </div>
//   );
// }


// import { useEffect, useMemo, useRef, useState } from "react";
// import { Copy, Download, Image as ImageIcon, Loader2, MessageCircle, Sparkles, TriangleAlert } from "lucide-react";
// import { AdminPage } from "@/components/admin/AdminPage";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { useToast } from "@/hooks/use-toast";
// import { supabase } from "@/integrations/supabase/client";
// import { calculateSwar, type SwarResult } from "@/lib/swar/swarCalculator";
// import { buildDetailMessage, buildImageCaption, formatDob, formatTime12, whatsappLink } from "@/lib/swar/swarMessage";
// import { loadImage, renderSwarImage } from "@/lib/swar/swarImage";

// const API_BASE =
//   typeof window !== "undefined" && window.location.hostname === "localhost" ? "http://localhost:8081" : "";

// interface GeneratedName { name: string; base: string; meaning: string; total: number; number: number }
// interface NamesResponse {
//   names: GeneratedName[];
//   stats: { rounds: number; rejected: number; inputTokens: number; outputTokens: number; costUsd: number; model: string };
// }

// export default function SwarCalculatorModule() {
//   const { toast } = useToast();
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   // ---- step 1: birth details -> swar ----
//   const [dob, setDob] = useState("");
//   const [time, setTime] = useState("");
//   const [place, setPlace] = useState("");
//   const [phone, setPhone] = useState("");
//   const [tz, setTz] = useState("5.5");
//   const [result, setResult] = useState<SwarResult | null>(null);
//   const [swarText, setSwarText] = useState("");
//   const [altText, setAltText] = useState("");
//   const [bg, setBg] = useState<HTMLImageElement | null>(null);
//   const [logo, setLogo] = useState<HTMLImageElement | null>(null);

//   useEffect(() => {
//     loadImage("/swar-bg.jpg").then((i) => (i ? i : loadImage("/swar-bg.png"))).then(setBg);
//     loadImage("/swar-logo.png").then((i) => (i ? i : loadImage("/logo.jpg"))).then(setLogo);
//   }, []);

//   const compute = () => {
//     if (!dob || !time) { toast({ title: "Enter date and time of birth", variant: "destructive" }); return; }
//     try {
//       const r = calculateSwar(dob, time, Number(tz));
//       setResult(r);
//       setSwarText(r.entry.variants.join(", "));
//       setAltText(r.alternatives.join(", "));
//     } catch (e: any) {
//       toast({ title: "Could not calculate", description: e?.message, variant: "destructive" });
//     }
//   };

//   const imageData = useMemo(() => {
//     if (!result) return null;
//     return {
//       dob: formatDob(dob), place: place || "—", time: formatTime12(time),
//       nakshatra: result.entry.nakshatra, pada: String(result.entry.pada),
//       swar: swarText, alternatives: altText,
//     };
//   }, [result, dob, place, time, swarText, altText]);

//   useEffect(() => {
//     if (imageData && canvasRef.current) renderSwarImage(canvasRef.current, imageData, bg, logo);
//   }, [imageData, bg, logo]);

//   const caption = buildImageCaption();
//   const detail = result
//     ? buildDetailMessage({
//         dob, place: place || "—", time, nakshatra: result.entry.nakshatra,
//         pada: result.entry.pada, swar: swarText, alternatives: altText,
//       })
//     : "";

//   const copy = async (text: string, label: string) => {
//     await navigator.clipboard.writeText(text);
//     toast({ title: `${label} copied` });
//   };
//   const downloadPng = () => {
//     canvasRef.current?.toBlob((b) => {
//       if (!b) return;
//       const a = document.createElement("a");
//       a.href = URL.createObjectURL(b);
//       a.download = `swar-${result?.entry.nakshatra}-pada${result?.entry.pada}.png`;
//       a.click();
//     });
//   };
//   const copyImage = () => {
//     canvasRef.current?.toBlob(async (b) => {
//       if (!b) return;
//       try {
//         await navigator.clipboard.write([new ClipboardItem({ "image/png": b })]);
//         toast({ title: "Image copied", description: "Paste it in WhatsApp (Ctrl+V)." });
//       } catch {
//         toast({ title: "Copy not supported here", description: "Use Download image instead.", variant: "destructive" });
//       }
//     });
//   };

//   // One click: copy the image to the clipboard, then open the customer's WhatsApp chat with the
//   // message already typed in. Operator then presses Ctrl+V (image preview opens) and Send.
//   const sendOnWhatsApp = async () => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     try {
//       const blob: Blob = await new Promise((resolve, reject) =>
//         canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("no image"))), "image/png"),
//       );
//       await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
//       toast({ title: "Image copied", description: "WhatsApp is opening. Click the message box, press Ctrl+V, then Send." });
//     } catch {
//       toast({ title: "Could not copy the image", description: "Use Download image and attach it manually.", variant: "destructive" });
//     }
//     // window.open(whatsappLink(phone, caption), "_blank");
//     window.open(whatsappLink(phone, caption), "ankshaastra_whatsapp");
//   };

//   // ---- step 2: names ----
//   const [gender, setGender] = useState("boy");
//   const [number, setNumber] = useState("");
//   const [starts, setStarts] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [names, setNames] = useState<NamesResponse | null>(null);
//   const [picked, setPicked] = useState<Set<string>>(new Set());

//   const generate = async () => {
//     const list = starts.split(/[ ,]+/).map((s) => s.trim()).filter(Boolean);
//     if (!number || !list.length) { toast({ title: "Choose a number and starting alphabets", variant: "destructive" }); return; }
//     setLoading(true); setNames(null); setPicked(new Set());
//     try {
//       const { data: sess } = await supabase.auth.getSession();
//       const resp = await fetch(`${API_BASE}/api/admin/generate-names`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Authorization: `Bearer ${sess.session?.access_token ?? ""}` },
//         body: JSON.stringify({ gender, number: Number(number), starts: list }),
//       });
//       const raw = await resp.text();
//       let json: any = null;
//       try { json = JSON.parse(raw); } catch { /* server returned non-JSON (e.g. timeout page) */ }
//       if (!json) throw new Error(resp.status === 504 || /timeout/i.test(raw) ? "Server timed out. Please try again (add more starting alphabets)." : `Server error ${resp.status}: ${raw.slice(0, 120)}`);
//       if (!resp.ok) throw new Error(json.error || "Request failed");
//       setNames(json);
//     } catch (e: any) {
//       toast({ title: "Name generation failed", description: e?.message, variant: "destructive" });
//     } finally { setLoading(false); }
//   };

//   const namesMessage = () => {
//     if (!names) return "";
//     const chosen = names.names.filter((n) => picked.size === 0 || picked.has(n.name));
//     const body = chosen.map((n) => `*${n.name}* – ${n.meaning}`).join("\n\n");
//     return `Namaskar,\n\nPlease find numerologically curated names specifically designed for your child:\n\n${body}\n\nKindly share your top 4–5 preferred names in order of priority. I will then provide a detailed analysis of the selected names.\n\nRegards,\nAnkshaastra-Empower Your Name`;
//   };

//   return (
//     <div className="space-y-6">
//       <AdminPage title="Swar Calculator" description="Enter birth details → Nakshatra, Pada, Swar and the customer image/message are ready.">
//         <div className="grid gap-4 md:grid-cols-5">
//           <div><Label>Date of birth</Label><Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} /></div>
//           <div><Label>Time of birth</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
//           <div><Label>Place</Label><Input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Dehradun, Uttarakhand" /></div>
//           <div>
//             <Label>Time zone</Label>
//             <Select value={tz} onValueChange={setTz}>
//               <SelectTrigger><SelectValue /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="5.5">India (IST, UTC+5:30)</SelectItem>
//                 <SelectItem value="0">UK (UTC+0)</SelectItem>
//                 <SelectItem value="4">UAE (UTC+4)</SelectItem>
//                 <SelectItem value="-5">US East (UTC-5)</SelectItem>
//                 <SelectItem value="-8">US West (UTC-8)</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//           <div className="flex items-end"><Button onClick={compute} className="w-full"><Sparkles className="w-4 h-4 mr-2" />Calculate</Button></div>
//         </div>

//         {result && (
//           <div className="mt-6 grid gap-6 lg:grid-cols-2">
//             <div className="space-y-4">
//               <div className="flex flex-wrap items-center gap-2">
//                 <Badge>{result.entry.nakshatra}</Badge><Badge variant="secondary">Pada {result.entry.pada}</Badge>
//                 <Badge variant="outline">Drik Swar: {result.entry.drik}</Badge>
//                 <span className="text-xs text-muted-foreground">Moon {result.longitude.toFixed(2)}°</span>
//               </div>
//               {result.nearBoundary && (
//                 <div className="flex gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
//                   <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
//                   Moon is very close to a Pada boundary ({result.edgeDistance.toFixed(3)}°). Please double-check this one on Drik Panchang.
//                 </div>
//               )}
//               {!result.entry.confirmed && (
//                 <div className="flex gap-2 rounded-md border border-sky-300 bg-sky-50 p-3 text-sm text-sky-900">
//                   <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
//                   The extra spellings for this Swar are auto-generated, not yet verified. Edit below if needed.
//                 </div>
//               )}
//               <div><Label>Swar (editable)</Label><Input value={swarText} onChange={(e) => setSwarText(e.target.value)} /></div>
//               <div><Label>Numerology alternatives (editable)</Label><Input value={altText} onChange={(e) => setAltText(e.target.value)} /></div>
//               <div><Label>Customer WhatsApp number (optional)</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98XXXXXXXX" /></div>

//               <div className="rounded-md border p-3 text-sm whitespace-pre-wrap bg-muted/40">{caption}</div>
//               <div className="flex flex-wrap gap-2">
//                 <Button variant="outline" onClick={() => copy(caption, "Message")}><Copy className="w-4 h-4 mr-2" />Copy message</Button>
//                 <Button variant="outline" onClick={() => copy(detail, "Full details message")}><Copy className="w-4 h-4 mr-2" />Copy text-only version</Button>
//                 <Button onClick={sendOnWhatsApp}><MessageCircle className="w-4 h-4 mr-2" />Send on WhatsApp (image + message)</Button>
//               </div>
//               <p className="text-xs text-muted-foreground">The image is copied automatically. After WhatsApp opens, click the message box, press Ctrl+V (image preview opens), then Send. WhatsApp links cannot attach pictures by themselves.</p>
//             </div>

//             <div className="space-y-3">
//               <canvas ref={canvasRef} className="w-full max-w-[520px] rounded-lg border shadow-sm" />
//               <div className="flex gap-2">
//                 <Button variant="outline" onClick={downloadPng}><Download className="w-4 h-4 mr-2" />Download image</Button>
//                 <Button variant="outline" onClick={copyImage}><ImageIcon className="w-4 h-4 mr-2" />Copy image</Button>
//               </div>
//               {!bg && <p className="text-xs text-muted-foreground">Using the built-in background. Put the art-only background (no text) at <code>public/swar-bg.jpg</code> to use it automatically.</p>}
//             </div>
//           </div>
//         )}
//       </AdminPage>

//       <AdminPage title="Name Generator" description="Customer’s chosen alphabets + Chaldean number → verified names (every total is re-checked by code).">
//         <div className="grid gap-4 md:grid-cols-4">
//           <div>
//             <Label>Gender</Label>
//             <Select value={gender} onValueChange={setGender}>
//               <SelectTrigger><SelectValue /></SelectTrigger>
//               <SelectContent><SelectItem value="boy">Boy</SelectItem><SelectItem value="girl">Girl</SelectItem></SelectContent>
//             </Select>
//           </div>
//           <div>
//             <Label>Chaldean number</Label>
//             <Select value={number} onValueChange={setNumber}>
//               <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
//               <SelectContent>{[1,2,3,4,5,6,7,8,9].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
//             </Select>
//           </div>
//           <div><Label>Starting alphabets / Swar</Label><Input value={starts} onChange={(e) => setStarts(e.target.value)} placeholder="V, N, M, G, B  or  Pra, Rai" /></div>
//           <div className="flex items-end">
//             <Button onClick={generate} disabled={loading} className="w-full">
//               {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}Generate names
//             </Button>
//           </div>
//         </div>

//         {names && (
//           <div className="mt-6 space-y-3">
//             {names.names.length === 0 && <p className="text-sm text-muted-foreground">No name passed the number and spelling checks. Try again or relax the alphabets.</p>}
//             <div className="grid gap-2 md:grid-cols-2">
//               {names.names.map((n, i) => (
//                 <label key={n.name} className="flex items-start gap-3 rounded-md border p-3 cursor-pointer">
//                   <input type="checkbox" className="mt-1" checked={picked.has(n.name)}
//                     onChange={() => setPicked((p) => { const x = new Set(p); x.has(n.name) ? x.delete(n.name) : x.add(n.name); return x; })} />
//                   <div>
//                     <div className="font-medium">{i + 1}. {n.name} <span className="text-xs text-muted-foreground">({n.total} → {n.number})</span></div>
//                     <div className="text-sm text-muted-foreground">{n.meaning}</div>
//                   </div>
//                 </label>
//               ))}
//             </div>
//             <p className="text-xs text-muted-foreground">
//               {names.stats.rounds} AI round(s), {names.stats.rejected} names dropped by the checks · {names.stats.inputTokens + names.stats.outputTokens} tokens · about ${names.stats.costUsd} (₹{(names.stats.costUsd * 90).toFixed(2)}) · {names.stats.model}
//             </p>
//             {names.names.length > 0 && (
//               <div className="flex gap-2">
//                 <Button variant="outline" onClick={() => copy(namesMessage(), "Names message")}><Copy className="w-4 h-4 mr-2" />Copy names message{picked.size ? ` (${picked.size} selected)` : ""}</Button>
//                 <Button onClick={() => window.open(whatsappLink(phone, namesMessage()), "_blank")}><MessageCircle className="w-4 h-4 mr-2" />Open in WhatsApp</Button>
//               </div>
//             )}
//           </div>
//         )}
//       </AdminPage>
//     </div>
//   );
// }


// import { useEffect, useMemo, useRef, useState } from "react";
// import { Copy, Download, Image as ImageIcon, Loader2, MessageCircle, Sparkles, TriangleAlert } from "lucide-react";
// import { AdminPage } from "@/components/admin/AdminPage";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { useToast } from "@/hooks/use-toast";
// import { supabase } from "@/integrations/supabase/client";
// import { calculateSwar, type SwarResult } from "@/lib/swar/swarCalculator";
// import { buildDetailMessage, buildImageCaption, formatDob, formatTime12, whatsappLink } from "@/lib/swar/swarMessage";
// import { loadImage, renderSwarImage } from "@/lib/swar/swarImage";

// const API_BASE =
//   typeof window !== "undefined" && window.location.hostname === "localhost" ? "http://localhost:8081" : "";

// interface GeneratedName { name: string; base: string; meaning: string; total: number; number: number }
// interface NamesResponse {
//   names: GeneratedName[];
//   stats: { rounds: number; rejected: number; inputTokens: number; outputTokens: number; costUsd: number; model: string };
// }

// export default function SwarCalculatorModule() {
//   const { toast } = useToast();
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   // ---- step 1: birth details -> swar ----
//   const [dob, setDob] = useState("");
//   const [time, setTime] = useState("");
//   const [place, setPlace] = useState("");
//   const [phone, setPhone] = useState("");
//   const [tz, setTz] = useState("5.5");
//   const [result, setResult] = useState<SwarResult | null>(null);
//   const [swarText, setSwarText] = useState("");
//   const [altText, setAltText] = useState("");
//   const [bg, setBg] = useState<HTMLImageElement | null>(null);
//   const [logo, setLogo] = useState<HTMLImageElement | null>(null);

//   useEffect(() => {
//     loadImage("/swar-bg.jpg").then((i) => (i ? i : loadImage("/swar-bg.png"))).then(setBg);
//     loadImage("/swar-logo.png").then((i) => (i ? i : loadImage("/logo.jpg"))).then(setLogo);
//   }, []);

//   const compute = () => {
//     if (!dob || !time) { toast({ title: "Enter date and time of birth", variant: "destructive" }); return; }
//     try {
//       const r = calculateSwar(dob, time, Number(tz));
//       setResult(r);
//       setSwarText(r.entry.variants.join(", "));
//       setAltText(r.alternatives.join(", "));
//     } catch (e: any) {
//       toast({ title: "Could not calculate", description: e?.message, variant: "destructive" });
//     }
//   };

//   const imageData = useMemo(() => {
//     if (!result) return null;
//     return {
//       dob: formatDob(dob), place: place || "—", time: formatTime12(time),
//       nakshatra: result.entry.nakshatra, pada: String(result.entry.pada),
//       swar: swarText, alternatives: altText,
//     };
//   }, [result, dob, place, time, swarText, altText]);

//   useEffect(() => {
//     if (imageData && canvasRef.current) renderSwarImage(canvasRef.current, imageData, bg, logo);
//   }, [imageData, bg, logo]);

//   const caption = buildImageCaption();
//   const detail = result
//     ? buildDetailMessage({
//         dob, place: place || "—", time, nakshatra: result.entry.nakshatra,
//         pada: result.entry.pada, swar: swarText, alternatives: altText,
//       })
//     : "";

//   const copy = async (text: string, label: string) => {
//     await navigator.clipboard.writeText(text);
//     toast({ title: `${label} copied` });
//   };
//   const downloadPng = () => {
//     canvasRef.current?.toBlob((b) => {
//       if (!b) return;
//       const a = document.createElement("a");
//       a.href = URL.createObjectURL(b);
//       a.download = `swar-${result?.entry.nakshatra}-pada${result?.entry.pada}.png`;
//       a.click();
//     });
//   };
//   const copyImage = () => {
//     canvasRef.current?.toBlob(async (b) => {
//       if (!b) return;
//       try {
//         await navigator.clipboard.write([new ClipboardItem({ "image/png": b })]);
//         toast({ title: "Image copied", description: "Paste it in WhatsApp (Ctrl+V)." });
//       } catch {
//         toast({ title: "Copy not supported here", description: "Use Download image instead.", variant: "destructive" });
//       }
//     });
//   };

//   // One click: copy the image to the clipboard, then open the customer's WhatsApp chat with the
//   // message already typed in. Operator then presses Ctrl+V (image preview opens) and Send.
//   const sendOnWhatsApp = async () => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     try {
//       const blob: Blob = await new Promise((resolve, reject) =>
//         canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("no image"))), "image/png"),
//       );
//       await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
//       toast({ title: "Image copied", description: "WhatsApp is opening. Click the message box, press Ctrl+V, then Send." });
//     } catch {
//       toast({ title: "Could not copy the image", description: "Use Download image and attach it manually.", variant: "destructive" });
//     }
//     // window.open(whatsappLink(phone, caption), "_blank");
//     window.open(whatsappLink(phone, caption), "ankshaastra_whatsapp");
//   };

//   // ---- step 2: names ----
//   const [gender, setGender] = useState("boy");
//   const [number, setNumber] = useState("");
//   const [starts, setStarts] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [names, setNames] = useState<NamesResponse | null>(null);
//   const [picked, setPicked] = useState<Set<string>>(new Set());

//   const generate = async () => {
//     const list = starts.split(/[ ,]+/).map((s) => s.trim()).filter(Boolean);
//     if (!number || !list.length) { toast({ title: "Choose a number and starting alphabets", variant: "destructive" }); return; }
//     setLoading(true); setNames(null); setPicked(new Set());
//     try {
//       const { data: sess } = await supabase.auth.getSession();
//       const resp = await fetch(`${API_BASE}/api/admin/generate-names`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Authorization: `Bearer ${sess.session?.access_token ?? ""}` },
//         body: JSON.stringify({ gender, number: Number(number), starts: list }),
//       });
//       const json = await resp.json();
//       if (!resp.ok) throw new Error(json.error || "Request failed");
//       setNames(json);
//     } catch (e: any) {
//       toast({ title: "Name generation failed", description: e?.message, variant: "destructive" });
//     } finally { setLoading(false); }
//   };

//   const namesMessage = () => {
//     if (!names) return "";
//     const chosen = names.names.filter((n) => picked.size === 0 || picked.has(n.name));
//     const body = chosen.map((n) => `*${n.name}* – ${n.meaning}`).join("\n\n");
//     return `Namaskar,\n\nPlease find numerologically curated names specifically designed for your child:\n\n${body}\n\nKindly share your top 4–5 preferred names in order of priority. I will then provide a detailed analysis of the selected names.\n\nRegards,\nAnkshaastra-Empower Your Name`;
//   };

//   return (
//     <div className="space-y-6">
//       <AdminPage title="Swar Calculator" description="Enter birth details → Nakshatra, Pada, Swar and the customer image/message are ready.">
//         <div className="grid gap-4 md:grid-cols-5">
//           <div><Label>Date of birth</Label><Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} /></div>
//           <div><Label>Time of birth</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
//           <div><Label>Place</Label><Input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Dehradun, Uttarakhand" /></div>
//           <div>
//             <Label>Time zone</Label>
//             <Select value={tz} onValueChange={setTz}>
//               <SelectTrigger><SelectValue /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="5.5">India (IST, UTC+5:30)</SelectItem>
//                 <SelectItem value="0">UK (UTC+0)</SelectItem>
//                 <SelectItem value="4">UAE (UTC+4)</SelectItem>
//                 <SelectItem value="-5">US East (UTC-5)</SelectItem>
//                 <SelectItem value="-8">US West (UTC-8)</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//           <div className="flex items-end"><Button onClick={compute} className="w-full"><Sparkles className="w-4 h-4 mr-2" />Calculate</Button></div>
//         </div>

//         {result && (
//           <div className="mt-6 grid gap-6 lg:grid-cols-2">
//             <div className="space-y-4">
//               <div className="flex flex-wrap items-center gap-2">
//                 <Badge>{result.entry.nakshatra}</Badge><Badge variant="secondary">Pada {result.entry.pada}</Badge>
//                 <Badge variant="outline">Drik Swar: {result.entry.drik}</Badge>
//                 <span className="text-xs text-muted-foreground">Moon {result.longitude.toFixed(2)}°</span>
//               </div>
//               {result.nearBoundary && (
//                 <div className="flex gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
//                   <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
//                   Moon is very close to a Pada boundary ({result.edgeDistance.toFixed(3)}°). Please double-check this one on Drik Panchang.
//                 </div>
//               )}
//               {!result.entry.confirmed && (
//                 <div className="flex gap-2 rounded-md border border-sky-300 bg-sky-50 p-3 text-sm text-sky-900">
//                   <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
//                   The extra spellings for this Swar are auto-generated, not yet verified. Edit below if needed.
//                 </div>
//               )}
//               <div><Label>Swar (editable)</Label><Input value={swarText} onChange={(e) => setSwarText(e.target.value)} /></div>
//               <div><Label>Numerology alternatives (editable)</Label><Input value={altText} onChange={(e) => setAltText(e.target.value)} /></div>
//               <div><Label>Customer WhatsApp number (optional)</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98XXXXXXXX" /></div>

//               <div className="rounded-md border p-3 text-sm whitespace-pre-wrap bg-muted/40">{caption}</div>
//               <div className="flex flex-wrap gap-2">
//                 <Button variant="outline" onClick={() => copy(caption, "Message")}><Copy className="w-4 h-4 mr-2" />Copy message</Button>
//                 <Button variant="outline" onClick={() => copy(detail, "Full details message")}><Copy className="w-4 h-4 mr-2" />Copy text-only version</Button>
//                 <Button onClick={sendOnWhatsApp}><MessageCircle className="w-4 h-4 mr-2" />Send on WhatsApp (image + message)</Button>
//               </div>
//               <p className="text-xs text-muted-foreground">The image is copied automatically. After WhatsApp opens, click the message box, press Ctrl+V (image preview opens), then Send. WhatsApp links cannot attach pictures by themselves.</p>
//             </div>

//             <div className="space-y-3">
//               <canvas ref={canvasRef} className="w-full max-w-[520px] rounded-lg border shadow-sm" />
//               <div className="flex gap-2">
//                 <Button variant="outline" onClick={downloadPng}><Download className="w-4 h-4 mr-2" />Download image</Button>
//                 <Button variant="outline" onClick={copyImage}><ImageIcon className="w-4 h-4 mr-2" />Copy image</Button>
//               </div>
//               {!bg && <p className="text-xs text-muted-foreground">Using the built-in background. Put the art-only background (no text) at <code>public/swar-bg.jpg</code> to use it automatically.</p>}
//             </div>
//           </div>
//         )}
//       </AdminPage>

//       <AdminPage title="Name Generator" description="Customer’s chosen alphabets + Chaldean number → verified names (every total is re-checked by code).">
//         <div className="grid gap-4 md:grid-cols-4">
//           <div>
//             <Label>Gender</Label>
//             <Select value={gender} onValueChange={setGender}>
//               <SelectTrigger><SelectValue /></SelectTrigger>
//               <SelectContent><SelectItem value="boy">Boy</SelectItem><SelectItem value="girl">Girl</SelectItem></SelectContent>
//             </Select>
//           </div>
//           <div>
//             <Label>Chaldean number</Label>
//             <Select value={number} onValueChange={setNumber}>
//               <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
//               <SelectContent>{[1,2,3,4,5,6,7,8,9].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
//             </Select>
//           </div>
//           <div><Label>Starting alphabets / Swar</Label><Input value={starts} onChange={(e) => setStarts(e.target.value)} placeholder="V, N, M, G, B  or  Pra, Rai" /></div>
//           <div className="flex items-end">
//             <Button onClick={generate} disabled={loading} className="w-full">
//               {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}Generate names
//             </Button>
//           </div>
//         </div>

//         {names && (
//           <div className="mt-6 space-y-3">
//             {names.names.length === 0 && <p className="text-sm text-muted-foreground">No name passed the number and spelling checks. Try again or relax the alphabets.</p>}
//             <div className="grid gap-2 md:grid-cols-2">
//               {names.names.map((n, i) => (
//                 <label key={n.name} className="flex items-start gap-3 rounded-md border p-3 cursor-pointer">
//                   <input type="checkbox" className="mt-1" checked={picked.has(n.name)}
//                     onChange={() => setPicked((p) => { const x = new Set(p); x.has(n.name) ? x.delete(n.name) : x.add(n.name); return x; })} />
//                   <div>
//                     <div className="font-medium">{i + 1}. {n.name} <span className="text-xs text-muted-foreground">({n.total} → {n.number})</span></div>
//                     <div className="text-sm text-muted-foreground">{n.meaning}</div>
//                   </div>
//                 </label>
//               ))}
//             </div>
//             <p className="text-xs text-muted-foreground">
//               {names.stats.rounds} AI round(s), {names.stats.rejected} names dropped by the checks · {names.stats.inputTokens + names.stats.outputTokens} tokens · about ${names.stats.costUsd} (₹{(names.stats.costUsd * 90).toFixed(2)}) · {names.stats.model}
//             </p>
//             {names.names.length > 0 && (
//               <div className="flex gap-2">
//                 <Button variant="outline" onClick={() => copy(namesMessage(), "Names message")}><Copy className="w-4 h-4 mr-2" />Copy names message{picked.size ? ` (${picked.size} selected)` : ""}</Button>
//                 <Button onClick={() => window.open(whatsappLink(phone, namesMessage()), "_blank")}><MessageCircle className="w-4 h-4 mr-2" />Open in WhatsApp</Button>
//               </div>
//             )}
//           </div>
//         )}
//       </AdminPage>
//     </div>
//   );
// }


import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Download, FileText, Image as ImageIcon, Loader2, MessageCircle, Sparkles, TriangleAlert } from "lucide-react";
import { AdminPage } from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { calculateSwar, type SwarResult } from "@/lib/swar/swarCalculator";
import { buildDetailMessage, buildImageCaption, formatDob, formatTime12, getWhatsAppMode, openWhatsApp, setWhatsAppMode, type WhatsAppMode } from "@/lib/swar/swarMessage";
import { PlacePicker } from "@/components/admin/PlacePicker";
import { buildNameFinderProfile, type Gender } from "@/lib/swar/nameFinder";
import { generateNameFinderReport, type AnalysisRow } from "@/lib/swar/nameFinderReport";
import { detectPackage, nameSlots, orderMatchesPhone, prefillFromOrder, PACKAGE_PRICE, type PackageChoice, type PackageTier } from "@/lib/swar/nameFinderPackage";
import { chaldeanRawSum } from "@/lib/name-check/numerology";
import { reduceToSingleDigit } from "@/lib/name-check/lo-shu";
import { loadImage, renderSwarImage } from "@/lib/swar/swarImage";
import { analyseName, buildAnalysisMessage, coreNumbersFromDob, GRADE_LABEL, parseNames, type NameAnalysis } from "@/lib/swar/nameSteps";

const API_BASE =
  typeof window !== "undefined" && window.location.hostname === "localhost" ? "http://localhost:8081" : "";

interface GeneratedName { name: string; base: string; meaning: string; total: number; number: number }
interface NamesResponse {
  names: GeneratedName[];
  stats: { rounds: number; rejected: number; inputTokens: number; outputTokens: number; costUsd: number; model: string };
}

export default function SwarCalculatorModule() {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ---- step 1: birth details -> swar ----
  const [dob, setDob] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [phone, setPhone] = useState("");
  const [tz, setTz] = useState("5.5");
  const [result, setResult] = useState<SwarResult | null>(null);
  const [swarText, setSwarText] = useState("");
  const [altText, setAltText] = useState("");
  const [bg, setBg] = useState<HTMLImageElement | null>(null);
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    loadImage("/swar-bg.jpg").then((i) => (i ? i : loadImage("/swar-bg.png"))).then(setBg);
    loadImage("/swar-logo.png").then((i) => (i ? i : loadImage("/logo.jpg"))).then(setLogo);
  }, []);

  const compute = () => {
    if (!dob || !time) { toast({ title: "Enter date and time of birth", variant: "destructive" }); return; }
    try {
      const r = calculateSwar(dob, time, Number(tz));
      setResult(r);
      setSwarText(r.entry.variants.join(", "));
      setAltText(r.alternatives.join(", "));
      const core = coreNumbersFromDob(dob);
      if (core?.suggested.length) setNumber((prev) => prev || String(core.suggested[0]));
    } catch (e: any) {
      toast({ title: "Could not calculate", description: e?.message, variant: "destructive" });
    }
  };

  const imageData = useMemo(() => {
    if (!result) return null;
    return {
      dob: formatDob(dob), place: place || "—", time: formatTime12(time),
      nakshatra: result.entry.nakshatra, pada: String(result.entry.pada),
      swar: swarText, alternatives: altText,
    };
  }, [result, dob, place, time, swarText, altText]);

  useEffect(() => {
    if (imageData && canvasRef.current) renderSwarImage(canvasRef.current, imageData, bg, logo);
  }, [imageData, bg, logo]);

  const detail = result
    ? buildDetailMessage({
        dob, place: place || "—", time, nakshatra: result.entry.nakshatra,
        pada: result.entry.pada, swar: swarText, alternatives: altText,
      })
    : "";
  // Step 1 goes out as the Swar image + this short caption (the image carries the birth details).
  const caption = buildImageCaption();
  const [waMode, setWaMode] = useState<WhatsAppMode>(() => getWhatsAppMode());
  const changeWaMode = (m: WhatsAppMode) => { setWaMode(m); setWhatsAppMode(m); };
  const sendWhatsApp = (text: string) => openWhatsApp(phone, text, waMode);

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: `${label} copied` });
  };
  const downloadPng = () => {
    canvasRef.current?.toBlob((b) => {
      if (!b) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = `swar-${result?.entry.nakshatra}-pada${result?.entry.pada}.png`;
      a.click();
    });
  };
  const copyImage = () => {
    canvasRef.current?.toBlob(async (b) => {
      if (!b) return;
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": b })]);
        toast({ title: "Image copied", description: "Paste it in WhatsApp (Ctrl+V)." });
      } catch {
        toast({ title: "Copy not supported here", description: "Use Download image instead.", variant: "destructive" });
      }
    });
  };

  // One click: copy the image to the clipboard, then open the customer's WhatsApp chat with the
  // message already typed in. Operator then presses Ctrl+V (image preview opens) and Send.
  const sendOnWhatsApp = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob: Blob = await new Promise((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("no image"))), "image/png"),
      );
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast({ title: "Image copied", description: "WhatsApp is opening. Click the message box, press Ctrl+V, then Send." });
    } catch {
      toast({ title: "Could not copy the image", description: "Use Download image and attach it manually.", variant: "destructive" });
    }
    sendWhatsApp(caption);
  };

  // ---- step 2: names ----
  const [gender, setGender] = useState("boy");
  const [surname, setSurname] = useState("");
  const [middle, setMiddle] = useState("");
  const [middleNotFather, setMiddleNotFather] = useState(false);
  const [preference, setPreference] = useState("");
  const [reportBusy, setReportBusy] = useState(false);
  // Package bought (decides how many name slots the report has) + order lookup
  const [pkg, setPkg] = useState<PackageChoice>({ tier: "perfect", extraNames: false });
  const [orders, setOrders] = useState<any[]>([]);
  const [orderBusy, setOrderBusy] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const slots = nameSlots(pkg);
  const [number, setNumber] = useState("");
  const [starts, setStarts] = useState("");
  const [loading, setLoading] = useState(false);
  const [names, setNames] = useState<NamesResponse | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const core = useMemo(() => coreNumbersFromDob(dob), [dob]);
  // Logic-engine profile: Mulank, Bhagyank, Kua, surname block and the combination table.
  const profile = useMemo(
    () => buildNameFinderProfile(dob, gender as Gender, surname, middle, middleNotFather),
    [dob, gender, surname, middle, middleNotFather],
  );
  const targetsKey = profile?.targets.join(",") ?? "";
  // Keep the number on a target the table allows (only when the targets change, never fights a manual choice).
  useEffect(() => {
    if (profile?.targets.length && !profile.targets.includes(Number(number))) setNumber(String(profile.targets[0]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetsKey]);
  const surnameText = profile?.surname?.text ?? surname.trim();
  const selectedRow = profile?.table?.find((r) => r.n === Number(number));

  // ---- step 4: names the customer chose -> analysis ----
  const [chosenRaw, setChosenRaw] = useState("");
  const [analysis, setAnalysis] = useState<NameAnalysis[] | null>(null);

  const addPickedToChosen = () => {
    setChosenRaw(parseNames([chosenRaw, ...picked].join(",")).join(", "));
  };
  const runAnalysis = () => {
    const list = parseNames(chosenRaw);
    if (!dob) { toast({ title: "Enter date of birth in step 1", variant: "destructive" }); return; }
    if (!list.length) { toast({ title: "Enter the names the customer chose", variant: "destructive" }); return; }
    setAnalysis(list.map((n) => analyseName(dob, n, surnameText)));
  };
  const analysisMessage = analysis ? buildAnalysisMessage(dob, analysis, core?.mulank, core?.bhagyank) : "";

  /** Fill the form + package from the customer's order (matched by the WhatsApp number). */
  const applyOrder = (o: any) => {
    const d = detectPackage(o);
    if (d.choice) setPkg(d.choice);
    const f = prefillFromOrder(o);
    if (f.dob) setDob(f.dob);
    if (f.time) setTime(f.time);
    if (f.place) setPlace(f.place);
    if (f.gender) setGender(f.gender);
    if (f.lastName) setSurname(f.lastName);
    if (f.middleName !== undefined) setMiddle(f.middleName);
    setMiddleNotFather(!!f.middleName && f.middleIsFather === false);
    setOrderNote(`${d.note}${d.amount ? ` · ₹${d.amount}` : ""}${d.choice ? ` → ${nameSlots(d.choice)} names` : ""}`);
    toast({ title: "Order details loaded", description: "Check the details, then press Calculate in step 1." });
  };
  const findOrders = async () => {
    if (phone.replace(/\D/g, "").length < 10) { toast({ title: "Enter the customer's 10-digit WhatsApp number", variant: "destructive" }); return; }
    setOrderBusy(true);
    try {
      const { data, error } = await (supabase as any).from("orders").select("*").order("created_at", { ascending: false }).limit(400);
      if (error) throw error;
      const list = (data ?? []).filter((o: any) => orderMatchesPhone(o, phone));
      setOrders(list);
      if (!list.length) toast({ title: "No order found for this number", variant: "destructive" });
      else if (list.length === 1) applyOrder(list[0]);
    } catch (e: any) {
      toast({ title: "Could not fetch orders", description: e?.message, variant: "destructive" });
    } finally { setOrderBusy(false); }
  };

  const generate = async () => {
    const list = starts.split(/[ ,]+/).map((s) => s.trim()).filter(Boolean);
    if (!number || !list.length) { toast({ title: "Choose a number and starting alphabets", variant: "destructive" }); return; }
    setLoading(true); setNames(null); setPicked(new Set());
    try {
      const { data: sess } = await supabase.auth.getSession();
      const resp = await fetch(`${API_BASE}/api/admin/generate-names`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sess.session?.access_token ?? ""}` },
        body: JSON.stringify({ gender, number: Number(number), starts: list, preference: preference.trim(), count: slots }),
      });
      const raw = await resp.text();
      let json: any = null;
      try { json = JSON.parse(raw); } catch { /* server returned non-JSON (e.g. timeout page) */ }
      if (!json) throw new Error(resp.status === 504 || /timeout/i.test(raw) ? "Server timed out. Please try again (add more starting alphabets)." : `Server error ${resp.status}: ${raw.slice(0, 120)}`);
      if (!resp.ok) throw new Error(json.error || "Request failed");
      setNames(json);
    } catch (e: any) {
      toast({ title: "Name generation failed", description: e?.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  /** Full-name number (first name + surname block), or null when no surname was entered. */
  const fullNumber = (name: string): number | null => {
    if (!surnameText) return null;
    const total = chaldeanRawSum(`${name} ${surnameText}`);
    return reduceToSingleDigit(total);
  };

  const downloadReport = async () => {
    if (!names || !profile || !dob) { toast({ title: "Generate names first", variant: "destructive" }); return; }
    setReportBusy(true);
    try {
      const chosen = names.names.filter((n) => picked.size === 0 || picked.has(n.name)).slice(0, slots);
      const analysisRows: AnalysisRow[] = (analysis ?? []).map((a) => ({
        name: a.name,
        firstNo: a.error ? "-" : a.number,
        fullNo: fullNumber(a.name) ?? "-",
        suitability: a.error ? "-" : a.grade === "good" ? "Yes" : a.grade === "ok" ? "Moderate" : "No",
      }));
      const bytes = await generateNameFinderReport({
        dob, time, place, gender: gender as Gender,
        middleName: middle.trim(), middleIsFather: !middleNotFather, lastName: surname.trim(),
        swar: swarText, firstAlphabets: starts, preference: preference.trim(),
        profile, package: pkg,
        names: chosen.map((n) => ({ name: n.name, meaning: n.meaning })),
        analysis: analysisRows,
      });
      const url = URL.createObjectURL(new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `Numerologically-Aligned-Baby-Names-${dob}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e: any) {
      toast({ title: "Could not build the report", description: e?.message, variant: "destructive" });
    } finally { setReportBusy(false); }
  };

  const namesMessage = () => {
    if (!names) return "";
    const chosen = names.names.filter((n) => picked.size === 0 || picked.has(n.name));
    const body = chosen.map((n) => `*${n.name}* – ${n.meaning}`).join("\n\n");
    return `Namaskar,\n\nPlease find numerologically curated names specifically designed for your child:\n\n${body}\n\nKindly share your top 4–5 preferred names in order of priority. I will then provide a detailed analysis of the selected names.\n\nRegards,\nAnkshaastra-Empower Your Name`;
  };

  return (
    <div className="space-y-6">
      <AdminPage title="Step 1 · Swar Calculator" description="Enter birth details → Nakshatra, Pada, Swar and the customer image/message are ready.">
        <div className="grid gap-4 md:grid-cols-5">
          <div><Label>Date of birth</Label><Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} /></div>
          <div><Label>Time of birth</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
          <div><Label>Place</Label><PlacePicker value={place} onChange={setPlace} indiaOnly={tz === "5.5"} onPick={(p) => { if (p.timezone === "Asia/Kolkata") setTz("5.5"); }} /></div>
          <div>
            <Label>Time zone</Label>
            <Select value={tz} onValueChange={setTz}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="5.5">India (IST, UTC+5:30)</SelectItem>
                <SelectItem value="0">UK (UTC+0)</SelectItem>
                <SelectItem value="4">UAE (UTC+4)</SelectItem>
                <SelectItem value="-5">US East (UTC-5)</SelectItem>
                <SelectItem value="-8">US West (UTC-8)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end"><Button onClick={compute} className="w-full"><Sparkles className="w-4 h-4 mr-2" />Calculate</Button></div>
        </div>

        {result && (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{result.entry.nakshatra}</Badge><Badge variant="secondary">Pada {result.entry.pada}</Badge>
                <Badge variant="outline">Drik Swar: {result.entry.drik}</Badge>
                <span className="text-xs text-muted-foreground">Moon {result.longitude.toFixed(2)}°</span>
              </div>
              {result.nearBoundary && (
                <div className="flex gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                  <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
                  Moon is very close to a Pada boundary ({result.edgeDistance.toFixed(3)}°). Please double-check this one on Drik Panchang.
                </div>
              )}
              {!result.entry.confirmed && (
                <div className="flex gap-2 rounded-md border border-sky-300 bg-sky-50 p-3 text-sm text-sky-900">
                  <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
                  The extra spellings for this Swar are auto-generated, not yet verified. Edit below if needed.
                </div>
              )}
              <div><Label>Swar (editable)</Label><Input value={swarText} onChange={(e) => setSwarText(e.target.value)} /></div>
              <div><Label>Numerology alternatives (editable)</Label><Input value={altText} onChange={(e) => setAltText(e.target.value)} /></div>
              <div><Label>Customer WhatsApp number (optional)</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98XXXXXXXX" /></div>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" onClick={findOrders} disabled={orderBusy}>
                  {orderBusy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}Fetch order details
                </Button>
                {orders.length > 1 && (
                  <Select onValueChange={(id) => { const o = orders.find((x) => x.id === id); if (o) applyOrder(o); }}>
                    <SelectTrigger className="w-72"><SelectValue placeholder={`${orders.length} orders found, pick one`} /></SelectTrigger>
                    <SelectContent>
                      {orders.map((o) => <SelectItem key={o.id} value={o.id}>{`${o.service_title} · ₹${o.total_amount} · ${new Date(o.created_at).toLocaleDateString()}`}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
                {orderNote && <span className="text-xs text-muted-foreground">{orderNote}</span>}
              </div>

              <div className="rounded-md border p-3 text-sm whitespace-pre-wrap bg-muted/40">{caption}</div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => copy(caption, "Message")}><Copy className="w-4 h-4 mr-2" />Copy message</Button>
                <Button onClick={sendOnWhatsApp}><MessageCircle className="w-4 h-4 mr-2" />Send on WhatsApp (image + message)</Button>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">Open WhatsApp in:</span>
                <Button size="sm" variant={waMode === "web" ? "default" : "outline"} onClick={() => changeWaMode("web")}>Browser (WhatsApp Web)</Button>
                <Button size="sm" variant={waMode === "app" ? "default" : "outline"} onClick={() => changeWaMode("app")}>Desktop app (no QR scan)</Button>
              </div>
              <p className="text-xs text-muted-foreground">The image is copied automatically. After WhatsApp opens, click the message box, press Ctrl+V (image preview opens), then Send. WhatsApp links cannot attach pictures by themselves. If WhatsApp Web keeps asking for the QR code, pick “Desktop app”: it stays logged in.</p>
            </div>

            <div className="space-y-3">
              <canvas ref={canvasRef} className="w-full max-w-[520px] rounded-lg border shadow-sm" />
              <div className="flex gap-2">
                <Button variant="outline" onClick={downloadPng}><Download className="w-4 h-4 mr-2" />Download image</Button>
                <Button variant="outline" onClick={copyImage}><ImageIcon className="w-4 h-4 mr-2" />Copy image</Button>
              </div>
              {!bg && <p className="text-xs text-muted-foreground">Using the built-in background. Put the art-only background (no text) at <code>public/swar-bg.jpg</code> to use it automatically.</p>}
            </div>
          </div>
        )}
      </AdminPage>

      <AdminPage title="Step 2 · Customer’s chosen alphabets" description="Customer replied with the alphabets they like (e.g. V, N, M, G, B). Type them here.">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <div><Label>Starting alphabets / Swar</Label><Input value={starts} onChange={(e) => setStarts(e.target.value)} placeholder="V, N, M, G, B  or  Pra, Rai" /></div>
          <div className="flex items-end">
            <Button variant="outline" disabled={!swarText} onClick={() => setStarts(swarText)}>Use Swar from step 1</Button>
          </div>
        </div>
      </AdminPage>

      <AdminPage title="Step 3 · Name Generator" description="Surname + first-name number + alphabets → verified names (every total is re-checked by code).">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <Label>Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="boy">Boy</SelectItem><SelectItem value="girl">Girl</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label>Surname (last name)</Label><Input value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="Gokal" /></div>
          <div><Label>Middle name (optional)</Label><Input value={middle} onChange={(e) => setMiddle(e.target.value)} placeholder="Deshraj" /></div>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input type="checkbox" className="mb-1" checked={middleNotFather} onChange={(e) => setMiddleNotFather(e.target.checked)} disabled={!middle.trim()} />
            <span>Middle name is <b>not</b> father/husband’s name (add it to the surname)</span>
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <div>
            <Label>Package bought</Label>
            <Select value={pkg.tier} onValueChange={(v) => setPkg({ ...pkg, tier: v as PackageTier })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="perfect">{`Perfect Baby Name (₹${PACKAGE_PRICE.perfect})`}</SelectItem>
                <SelectItem value="blueprint">{`Complete Blueprint (₹${PACKAGE_PRICE.blueprint})`}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input type="checkbox" className="mb-1" checked={pkg.extraNames} onChange={(e) => setPkg({ ...pkg, extraNames: e.target.checked })} />
            <span>“10+ extra names” add-on bought</span>
          </label>
          <div className="flex items-end pb-2 text-sm text-muted-foreground md:col-span-2">
            Report has <b className="mx-1">{slots}</b> name slots ({slots <= 12 ? "page 9" : slots <= 24 ? "pages 9-10" : "pages 9-11"}).
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <div><Label>First alphabet(s)</Label><Input value={starts} onChange={(e) => setStarts(e.target.value)} placeholder="Gaa, Go, G" /></div>
          <div>
            <Label>First-name Chaldean number</Label>
            <Select value={number} onValueChange={setNumber}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{[1,2,3,4,5,6,7,8,9].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Name preference (optional)</Label><Input value={preference} onChange={(e) => setPreference(e.target.value)} placeholder="e.g. Lord Shiva names, modern, short" /></div>
          <div className="flex items-end">
            <Button onClick={generate} disabled={loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}Generate names
            </Button>
          </div>
        </div>

        {profile ? (
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Mulank {profile.mulank}</Badge>
              <Badge variant="outline">Bhagyank {profile.bhagyank}</Badge>
              <Badge variant="outline">Kua {profile.kua}</Badge>
              <Badge variant="outline">Lucky numbers: {profile.luckyPool.join(", ") || "-"}</Badge>
              {profile.surname && <Badge variant="secondary">Surname {profile.surname.text} = {profile.surname.display}</Badge>}
            </div>
            {profile.table ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground">Best first-name numbers for this surname:</span>
                  {profile.targets.length ? profile.targets.map((n) => {
                    const row = profile.table!.find((r) => r.n === n)!;
                    return (
                      <Button key={n} size="sm" variant={number === String(n) ? "default" : "outline"} onClick={() => setNumber(String(n))}>
                        {row.star ? "★ " : ""}{n} → {row.total}
                      </Button>
                    );
                  }) : <span className="text-red-600">No first-name number works with this surname. See the table below.</span>}
                </div>
                {selectedRow?.mark === "cross" && (
                  <div className="flex gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-red-900">
                    <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />Number {selectedRow.n} is crossed: {selectedRow.reason}.
                  </div>
                )}
                <details className="rounded-md border p-3">
                  <summary className="cursor-pointer font-medium">Combination table (first name + surname {profile.surname?.number})</summary>
                  <table className="mt-3 w-full text-left text-xs md:text-sm">
                    <thead><tr className="text-muted-foreground"><th className="py-1 pr-2">First</th><th className="pr-2">Full</th><th className="pr-2">Status</th><th>Reason</th></tr></thead>
                    <tbody>
                      {profile.table.map((r) => (
                        <tr key={r.n} className={`border-t ${r.star ? "bg-amber-50" : ""}`}>
                          <td className="py-1 pr-2 font-medium">{r.n}</td>
                          <td className="pr-2">{r.total}</td>
                          <td className="pr-2">{r.mark === "tick" ? (r.star ? "✓ ★" : "✓") : r.mark === "circle" ? "○" : "✗"}</td>
                          <td className="text-muted-foreground">{r.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                Enter the surname to see which first-name numbers work (first name + surname must stay Friendly). Until then the lucky numbers are used:
                {" "}{profile.targets.map((n) => (
                  <Button key={n} size="sm" className="ml-1" variant={number === String(n) ? "default" : "outline"} onClick={() => setNumber(String(n))}>{n}</Button>
                ))}
              </p>
            )}
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">Enter the date of birth in step 1 to see Mulank, Bhagyank, Kua and the suggested numbers.</p>
        )}

        {names && (
          <div className="mt-6 space-y-3">
            {names.names.length === 0 && <p className="text-sm text-muted-foreground">No name passed the number and spelling checks. Try again or relax the alphabets.</p>}
            <div className="grid gap-2 md:grid-cols-2">
              {names.names.map((n, i) => (
                <label key={n.name} className="flex items-start gap-3 rounded-md border p-3 cursor-pointer">
                  <input type="checkbox" className="mt-1" checked={picked.has(n.name)}
                    onChange={() => setPicked((p) => { const x = new Set(p); x.has(n.name) ? x.delete(n.name) : x.add(n.name); return x; })} />
                  <div>
                    <div className="font-medium">{i + 1}. {n.name} <span className="text-xs text-muted-foreground">({n.total} → {n.number}){fullNumber(n.name) !== null ? ` · with surname → ${fullNumber(n.name)}` : ""}</span></div>
                    <div className="text-sm text-muted-foreground">{n.meaning}</div>
                  </div>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {names.stats.rounds} AI round(s), {names.stats.rejected} names dropped by the checks · {names.stats.inputTokens + names.stats.outputTokens} tokens · about ${names.stats.costUsd} (₹{(names.stats.costUsd * 90).toFixed(2)}) · {names.stats.model}
            </p>
            {names.names.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => copy(namesMessage(), "Names message")}><Copy className="w-4 h-4 mr-2" />Copy names message{picked.size ? ` (${picked.size} selected)` : ""}</Button>
                <Button onClick={() => sendWhatsApp(namesMessage())}><MessageCircle className="w-4 h-4 mr-2" />Open in WhatsApp</Button>
                {picked.size > 0 && <Button variant="outline" onClick={addPickedToChosen}>Add {picked.size} selected to step 4</Button>}
                <Button variant="outline" onClick={downloadReport} disabled={reportBusy}>
                  {reportBusy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}Download report PDF{picked.size ? ` (${picked.size} selected)` : ""}
                </Button>
              </div>
            )}
          </div>
        )}
      </AdminPage>

      <AdminPage title="Step 4 · Customer’s chosen names" description="Customer replied with their top names (even ones that were not in your list). Enter them and check every name against the DOB.">
        <div className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
          <div><Label>Names (comma or new line)</Label><Textarea rows={3} value={chosenRaw} onChange={(e) => setChosenRaw(e.target.value)} placeholder="Dheer, Darsh, Advik, Vyom" /></div>
          <div><Label>Surname (optional)</Label><Input value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="Sharma" /></div>
          <div className="flex items-end"><Button onClick={runAnalysis}><Sparkles className="w-4 h-4 mr-2" />Check names</Button></div>
        </div>
      </AdminPage>

      <AdminPage title="Step 5 · Detailed analysis" description="Verified by the same rule engine as the Name Check report. Copy or send it to the customer.">
        {!analysis ? (
          <p className="text-sm text-muted-foreground">Enter the customer’s names in step 4 and press “Check names”.</p>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr><th className="p-2">Name</th><th className="p-2">Total → No.</th><th className="p-2">vs Mulank</th><th className="p-2">vs Bhagyank</th><th className="p-2">Compound</th><th className="p-2">Verdict</th></tr>
                </thead>
                <tbody>
                  {analysis.map((r) => (
                    <tr key={r.name} className="border-t">
                      <td className="p-2 font-medium">{r.name}</td>
                      <td className="p-2">{r.total} → {r.number}</td>
                      {r.error ? <td className="p-2 text-destructive" colSpan={4}>{r.error}</td> : (
                        <>
                          <td className="p-2 capitalize">{r.firstToMulank}</td>
                          <td className="p-2 capitalize">{r.firstToBhagyank}</td>
                          <td className="p-2 capitalize">{r.compoundTier}</td>
                          <td className="p-2">{GRADE_LABEL[r.grade]}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-md border p-3 text-sm whitespace-pre-wrap bg-muted/40">{analysisMessage}</div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => copy(analysisMessage, "Analysis message")}><Copy className="w-4 h-4 mr-2" />Copy analysis message</Button>
              <Button onClick={() => sendWhatsApp(analysisMessage)}><MessageCircle className="w-4 h-4 mr-2" />Send on WhatsApp</Button>
            </div>
          </div>
        )}
      </AdminPage>
    </div>
  );
}
