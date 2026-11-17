/** Small helpers for the visual sections (calendar colour, why-avoid text). Pure logic, no UI. */
import type { DayResult } from "./engine.ts";
import { fmtRange } from "./time.ts";

export type DayStatus = "green" | "yellow" | "red";

/** green = clean shubh time, yellow = shubh time but with cautions (Bhadra / Ashubh Yoga / Gandanta Lagna), red = avoid. */
export function dayStatus(d: DayResult): DayStatus {
  if (d.windows.length === 0) return "red";
  return d.relaxed ? "yellow" : "green";
}

/** Why a date should not be chosen. Empty for dates that have clean shubh time. */
export function avoidReasons(d: DayResult, tz: string): string[] {
  if (d.windows.length > 0) return [];
  const out: string[] = [...d.dateReasons];
  const seen = new Set<string>();
  for (const a of d.avoid) {
    if (a.kind !== "grading" && a.kind !== "gandmool" && a.kind !== "gandanta") continue;
    const text = `${a.label} (${fmtRange(a.start, a.end, tz)})`;
    if (!seen.has(text)) { seen.add(text); out.push(text); }
  }
  if (!out.length && d.excelGrade < 3) out.push("Tithi, nakshatra and moon sign together only grade Neutral");
  if (!out.length && d.noWindowReason) out.push(d.noWindowReason);
  return out;
}

/** Union of avoid periods, as [startMs, endMs] pairs (for the timeline bar). */
export function mergedAvoid(d: DayResult): [number, number][] {
  const iv = d.avoid.map((a) => [a.start.getTime(), a.end.getTime()] as [number, number]).sort((a, b) => a[0] - b[0]);
  const out: [number, number][] = [];
  for (const cur of iv) {
    const last = out[out.length - 1];
    if (last && cur[0] <= last[1]) last[1] = Math.max(last[1], cur[1]); else out.push([cur[0], cur[1]]);
  }
  return out;
}
