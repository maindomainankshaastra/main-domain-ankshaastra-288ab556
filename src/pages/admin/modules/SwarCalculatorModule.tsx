import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Download, Image as ImageIcon, Loader2, MessageCircle, Sparkles, TriangleAlert } from "lucide-react";
import { AdminPage } from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { calculateSwar, type SwarResult } from "@/lib/swar/swarCalculator";
import { buildDetailMessage, buildImageCaption, formatDob, formatTime12, whatsappLink } from "@/lib/swar/swarMessage";
import { loadImage, renderSwarImage } from "@/lib/swar/swarImage";

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

  const caption = buildImageCaption();
  const detail = result
    ? buildDetailMessage({
        dob, place: place || "—", time, nakshatra: result.entry.nakshatra,
        pada: result.entry.pada, swar: swarText, alternatives: altText,
      })
    : "";

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
    window.open(whatsappLink(phone, caption), "_blank");
  };

  // ---- step 2: names ----
  const [gender, setGender] = useState("boy");
  const [number, setNumber] = useState("");
  const [starts, setStarts] = useState("");
  const [loading, setLoading] = useState(false);
  const [names, setNames] = useState<NamesResponse | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const generate = async () => {
    const list = starts.split(/[ ,]+/).map((s) => s.trim()).filter(Boolean);
    if (!number || !list.length) { toast({ title: "Choose a number and starting alphabets", variant: "destructive" }); return; }
    setLoading(true); setNames(null); setPicked(new Set());
    try {
      const { data: sess } = await supabase.auth.getSession();
      const resp = await fetch(`${API_BASE}/api/admin/generate-names`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sess.session?.access_token ?? ""}` },
        body: JSON.stringify({ gender, number: Number(number), starts: list }),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || "Request failed");
      setNames(json);
    } catch (e: any) {
      toast({ title: "Name generation failed", description: e?.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const namesMessage = () => {
    if (!names) return "";
    const chosen = names.names.filter((n) => picked.size === 0 || picked.has(n.name));
    const body = chosen.map((n) => `*${n.name}* – ${n.meaning}`).join("\n\n");
    return `Namaskar,\n\nPlease find numerologically curated names specifically designed for your child:\n\n${body}\n\nKindly share your top 4–5 preferred names in order of priority. I will then provide a detailed analysis of the selected names.\n\nRegards,\nAnkshaastra-Empower Your Name`;
  };

  return (
    <div className="space-y-6">
      <AdminPage title="Swar Calculator" description="Enter birth details → Nakshatra, Pada, Swar and the customer image/message are ready.">
        <div className="grid gap-4 md:grid-cols-5">
          <div><Label>Date of birth</Label><Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} /></div>
          <div><Label>Time of birth</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
          <div><Label>Place</Label><Input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Dehradun, Uttarakhand" /></div>
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

              <div className="rounded-md border p-3 text-sm whitespace-pre-wrap bg-muted/40">{caption}</div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => copy(caption, "Message")}><Copy className="w-4 h-4 mr-2" />Copy message</Button>
                <Button variant="outline" onClick={() => copy(detail, "Full details message")}><Copy className="w-4 h-4 mr-2" />Copy text-only version</Button>
                <Button onClick={sendOnWhatsApp}><MessageCircle className="w-4 h-4 mr-2" />Send on WhatsApp (image + message)</Button>
              </div>
              <p className="text-xs text-muted-foreground">The image is copied automatically. After WhatsApp opens, click the message box, press Ctrl+V (image preview opens), then Send. WhatsApp links cannot attach pictures by themselves.</p>
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

      <AdminPage title="Name Generator" description="Customer’s chosen alphabets + Chaldean number → verified names (every total is re-checked by code).">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <Label>Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="boy">Boy</SelectItem><SelectItem value="girl">Girl</SelectItem></SelectContent>
            </Select>
          </div>
          <div>
            <Label>Chaldean number</Label>
            <Select value={number} onValueChange={setNumber}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{[1,2,3,4,5,6,7,8,9].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Starting alphabets / Swar</Label><Input value={starts} onChange={(e) => setStarts(e.target.value)} placeholder="V, N, M, G, B  or  Pra, Rai" /></div>
          <div className="flex items-end">
            <Button onClick={generate} disabled={loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}Generate names
            </Button>
          </div>
        </div>

        {names && (
          <div className="mt-6 space-y-3">
            {names.names.length === 0 && <p className="text-sm text-muted-foreground">No name passed the number and spelling checks. Try again or relax the alphabets.</p>}
            <div className="grid gap-2 md:grid-cols-2">
              {names.names.map((n, i) => (
                <label key={n.name} className="flex items-start gap-3 rounded-md border p-3 cursor-pointer">
                  <input type="checkbox" className="mt-1" checked={picked.has(n.name)}
                    onChange={() => setPicked((p) => { const x = new Set(p); x.has(n.name) ? x.delete(n.name) : x.add(n.name); return x; })} />
                  <div>
                    <div className="font-medium">{i + 1}. {n.name} <span className="text-xs text-muted-foreground">({n.total} → {n.number})</span></div>
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
                <Button onClick={() => window.open(whatsappLink(phone, namesMessage()), "_blank")}><MessageCircle className="w-4 h-4 mr-2" />Open in WhatsApp</Button>
              </div>
            )}
          </div>
        )}
      </AdminPage>
    </div>
  );
}
