import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * Birth-place picker. Typing a city shows a dropdown with state + district (like Drik Panchang), so
 * "Aligarh, Uttar Pradesh" and "Aligarh, ..." can be told apart. Uses the free Open-Meteo geocoding API
 * (no key). If the lookup fails the field still works as plain text.
 */

interface Suggestion {
  key: string;
  /** What gets written into the field and sent to the customer: "Aligarh, Uttar Pradesh". */
  value: string;
  title: string;
  subtitle: string;
  timezone?: string;
}

interface GeoResult {
  id?: number;
  name: string;
  admin1?: string;
  admin2?: string;
  country?: string;
  country_code?: string;
  timezone?: string;
}

export interface PlacePickerProps {
  value: string;
  onChange: (value: string) => void;
  /** Called when the operator picks a suggestion (use it to set the time zone). */
  onPick?: (s: { value: string; timezone?: string; countryCode?: string }) => void;
  /** Restrict to India (default). Turn off for customers born abroad. */
  indiaOnly?: boolean;
  placeholder?: string;
}

const ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";

export function PlacePicker({ value, onChange, onPick, indiaOnly = true, placeholder = "Type a city, e.g. Aligarh" }: PlacePickerProps) {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(-1);
  const box = useRef<HTMLDivElement>(null);
  // Only search while the operator is typing, not after a suggestion was picked.
  const typed = useRef(false);

  useEffect(() => {
    const q = value.split(",")[0].trim();
    if (!typed.current || q.length < 2) { setItems([]); return; }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true); setFailed(false);
      try {
        const url = `${ENDPOINT}?name=${encodeURIComponent(q)}&count=10&language=en&format=json${indiaOnly ? "&countryCode=IN" : ""}`;
        const r = await fetch(url, { signal: ctrl.signal });
        if (!r.ok) throw new Error(String(r.status));
        const j: { results?: GeoResult[] } = await r.json();
        const seen = new Set<string>();
        const list: Suggestion[] = [];
        for (const g of j.results ?? []) {
          const state = g.admin1 || g.country || "";
          const value = [g.name, state].filter(Boolean).join(", ");
          const district = g.admin2 && g.admin2 !== g.name ? `${g.admin2} district` : "";
          const subtitle = [district, state, indiaOnly ? "" : g.country].filter(Boolean).join(" · ");
          const key = `${value}|${district}`;
          if (seen.has(key)) continue;
          seen.add(key);
          list.push({ key, value, title: g.name, subtitle, timezone: g.timezone });
        }
        setItems(list); setActive(-1); setOpen(true);
      } catch (e: any) {
        if (e?.name !== "AbortError") { setFailed(true); setItems([]); }
      } finally { setLoading(false); }
    }, 300);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [value, indiaOnly]);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const pick = (s: Suggestion) => {
    typed.current = false;
    onChange(s.value);
    onPick?.({ value: s.value, timezone: s.timezone });
    setOpen(false); setItems([]);
  };

  return (
    <div ref={box} className="relative">
      <Input
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => { typed.current = true; onChange(e.target.value); }}
        onFocus={() => items.length && setOpen(true)}
        onKeyDown={(e) => {
          if (!open || !items.length) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, items.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
          else if (e.key === "Enter" && active >= 0) { e.preventDefault(); pick(items[active]); }
          else if (e.key === "Escape") setOpen(false);
        }}
      />
      {loading && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
      {open && items.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          {items.map((s, i) => (
            <li
              key={s.key}
              onMouseDown={(e) => { e.preventDefault(); pick(s); }}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-start gap-2 px-3 py-2 text-sm ${i === active ? "bg-accent" : ""}`}
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span>
                <span className="font-medium">{s.title}</span>
                {s.subtitle && <span className="block text-xs text-muted-foreground">{s.subtitle}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
      {failed && <p className="mt-1 text-xs text-muted-foreground">Suggestions unavailable right now, type the place manually.</p>}
    </div>
  );
}
