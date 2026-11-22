import { Badge } from "@/components/ui/badge";
import type { CSectionResult, DayResult } from "@/lib/c-section/index.ts";
import { avoidReasons, dayStatus, mergedAvoid, type DayStatus } from "@/lib/c-section/insights.ts";
import { babyLoshu } from "@/lib/c-section/loshu.ts";
import { fmtDate, fmtRange, weekdayOf, zonedToUtc } from "@/lib/c-section/time.ts";

const STATUS_CELL: Record<DayStatus, string> = {
  green: "bg-emerald-100 border-emerald-400 text-emerald-900",
  yellow: "bg-amber-100 border-amber-400 text-amber-900",
  red: "bg-red-100 border-red-300 text-red-900",
};
const STATUS_LABEL: Record<DayStatus, string> = {
  green: "Clean shubh time",
  yellow: "Shubh time with cautions",
  red: "Avoid",
};
const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** 1) Calendar of the whole window: green / yellow / red per date. */
export function CalendarView({ result }: { result: CSectionResult }) {
  const days = result.days;
  const cells: (DayResult | null)[] = [...Array(weekdayOf(days[0].date)).fill(null), ...days];
  while (cells.length % 7 !== 0) cells.push(null);
  return (
    <div>
      <p className="mb-2 text-sm font-medium">Calendar view</p>
      <div className="grid max-w-xl grid-cols-7 gap-1">
        {WEEK.map((w) => <div key={w} className="text-center text-xs text-muted-foreground">{w}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const st = dayStatus(d);
          const dayNo = Number(d.date.slice(8));
          const showMonth = dayNo === 1 || d.date === days[0].date;
          const isTop = d.rank != null && d.rank <= result.input.topN && d.windows.length > 0;
          return (
            <div
              key={d.date}
              title={`${fmtDate(d.date)} (${d.weekday}) | ${STATUS_LABEL[st]} | Mulank ${d.numerology.mulank}, Bhagyank ${d.numerology.bhagyank}, Luck ${d.numerology.luckPct}%`}
              className={`flex min-h-[3.5rem] flex-col items-center justify-center rounded-md border p-1 text-center ${STATUS_CELL[st]}`}
            >
              <span className="text-base font-semibold leading-none">{dayNo}</span>
              {showMonth && <span className="text-[10px] leading-tight">{MONTH[Number(d.date.slice(5, 7)) - 1]}</span>}
              {isTop && <span className="mt-0.5 rounded bg-white/70 px-1 text-[10px] font-semibold">P{d.rank}</span>}
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
        {(["green", "yellow", "red"] as DayStatus[]).map((s) => (
          <span key={s} className="flex items-center gap-1"><span className={`inline-block h-3 w-3 rounded border ${STATUS_CELL[s]}`} />{STATUS_LABEL[s]}</span>
        ))}
        <span>P1-P3 = top dates</span>
      </div>
    </div>
  );
}

/** 2) Dates to avoid, with the reason. */
function AvoidDates({ result }: { result: CSectionResult }) {
  const tz = result.input.location.tz;
  const bad = result.days.filter((d) => d.windows.length === 0);
  return (
    <div>
      <p className="mb-2 text-sm font-medium">Dates to avoid</p>
      {bad.length === 0 ? (
        <p className="text-sm text-muted-foreground">Every date in this window has at least one clean shubh time.</p>
      ) : (
        <div className="space-y-2">
          {bad.map((d) => (
            <div key={d.date} className="rounded-md border border-red-200 bg-red-50/60 p-3 text-sm">
              <p className="font-medium">{fmtDate(d.date)} ({d.weekday})</p>
              <ul className="ml-4 list-disc text-red-900">
                {avoidReasons(d, tz).map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** 3) One bar per date: shubh (green), avoid (red), Abhijit / Vijaya (gold) across OT hours. */
function DayTimelines({ result }: { result: CSectionResult }) {
  const { otStart, otEnd, location } = result.input;
  const tz = location.tz;
  const startH = Number(otStart.slice(0, 2));
  const endH = Number(otEnd.slice(0, 2));
  const ticks: number[] = [];
  for (let h = startH; h <= endH; h++) if (h % 2 === 0) ticks.push(h);
  const hourLabel = (h: number) => `${h % 12 || 12}${h < 12 ? "a" : "p"}`;

  return (
    <div>
      <p className="mb-2 text-sm font-medium">Day timeline ({result.input.otCustom ? "OT" : "day hours"} {otStart} to {otEnd})</p>
      <div className="mb-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-4 rounded-sm bg-emerald-500" />Shubh time</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-4 rounded-sm bg-red-500" />Avoid (Rahu, Yamaganda, Gulika, Gand Mool, Gandanta, Bhadra...)</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-4 rounded-sm bg-yellow-500" />Abhijit / Vijaya muhurat</span>
      </div>
      <div className="space-y-3">
        {result.ranked.map((d) => {
          const s = zonedToUtc(d.date, otStart, tz).getTime();
          const e = zonedToUtc(d.date, otEnd, tz).getTime();
          const pct = (t: number) => Math.max(0, Math.min(100, ((t - s) / (e - s)) * 100));
          const box = (a: number, b: number) => ({ left: `${pct(a)}%`, width: `${Math.max(0.6, pct(b) - pct(a))}%` });
          const gold = d.parts ? [d.parts.abhijit, d.parts.vijaya] : [];
          return (
            <div key={d.date} className="grid grid-cols-[7.5rem_1fr] items-center gap-2">
              <div className="text-xs">
                <p className="font-medium">{fmtDate(d.date).slice(0, 6)} {d.weekday.slice(0, 3)}</p>
                <p className="text-muted-foreground">Rank {d.rank}</p>
              </div>
              <div>
                <div className="space-y-px rounded bg-muted p-px">
                  <div className="relative h-2.5">
                    {gold.map((g, i) => <div key={i} className="absolute h-full rounded-sm bg-yellow-500" style={box(g.start.getTime(), g.end.getTime())} title={i === 0 ? `Abhijit ${fmtRange(g.start, g.end, tz)}` : `Vijaya ${fmtRange(g.start, g.end, tz)}`} />)}
                  </div>
                  <div className="relative h-3">
                    {d.windows.map((w, i) => <div key={i} className="absolute h-full rounded-sm bg-emerald-500" style={box(w.start.getTime(), w.end.getTime())} title={`Shubh ${fmtRange(w.start, w.end, tz)} (${w.lagna} lagna)`} />)}
                  </div>
                  <div className="relative h-3">
                    {d.avoid.map((a, i) => <div key={i} className="absolute h-full rounded-sm bg-red-500/80" style={box(a.start.getTime(), a.end.getTime())} title={`${a.label} ${fmtRange(a.start, a.end, tz)}`} />)}
                  </div>
                </div>
                <div className="relative mt-0.5 h-3 text-[10px] text-muted-foreground">
                  {ticks.map((h) => (
                    <span key={h} className="absolute -translate-x-1/2" style={{ left: `${pct(zonedToUtc(d.date, `${String(h).padStart(2, "0")}:00`, tz).getTime())}%` }}>{hourLabel(h)}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 4) Baby's Lo Shu grid for every date in the window (not the parents'). */
function BabyLoshuGrids({ result }: { result: CSectionResult }) {
  return (
    <div>
      <p className="mb-1 text-sm font-medium">Baby's Lo Shu grid for every date</p>
      <p className="mb-3 text-xs text-muted-foreground">Digits of the birth date + Bhagyank (+ Mulank, except on days 1-9, 10, 20, 30). Grey digit = missing, amber = repeated.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {result.ranked.map((d) => {
          const l = babyLoshu(d.date);
          const st = dayStatus(d);
          return (
            <div key={d.date} className={`rounded-md border p-3 ${st === "red" ? "opacity-70" : ""}`}>
              <div className="mb-2 flex flex-wrap items-center gap-1">
                <span className="text-sm font-medium">{fmtDate(d.date)}</span>
                <span className="text-xs text-muted-foreground">({d.weekday.slice(0, 3)})</span>
                <Badge variant="outline" className={`ml-auto ${STATUS_CELL[st]}`}>{d.windows.length ? `Rank ${d.rank}` : "Avoid"}</Badge>
              </div>
              <div className="mx-auto grid w-40 grid-cols-3 gap-1">
                {l.grid.flat().map((c) => (
                  <div
                    key={c.digit}
                    className={`flex h-12 items-center justify-center rounded border text-base font-semibold ${
                      c.count === 0 ? "border-dashed text-muted-foreground/40" : c.count >= 2 ? "border-amber-400 bg-amber-100 text-amber-900" : "border-emerald-400 bg-emerald-50 text-emerald-900"
                    }`}
                  >
                    {c.count === 0 ? c.digit : String(c.digit).repeat(c.count)}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs">Mulank {l.mulank}, Bhagyank {l.bhagyank}{l.mulankInGrid ? "" : " (Mulank not added on this day)"}</p>
              <p className="text-xs"><span className="text-muted-foreground">Missing:</span> {l.missing.length ? l.missing.join(", ") : "none"}</p>
              <p className="text-xs"><span className="text-muted-foreground">Repeated:</span> {l.repeated.length ? l.repeated.map((r) => `${r.digit} (x${r.count})`).join(", ") : "none"}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Avoid dates + timelines + baby Lo Shu grids. (CalendarView is placed separately, above the top-3 cards.) */
export function CSectionExtras({ result }: { result: CSectionResult }) {
  return (
    <div className="space-y-8">
      <AvoidDates result={result} />
      <DayTimelines result={result} />
      <BabyLoshuGrids result={result} />
    </div>
  );
}
