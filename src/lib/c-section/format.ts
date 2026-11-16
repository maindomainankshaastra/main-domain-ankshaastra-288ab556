import { GRADE_LABEL, type AvoidPeriod, type CSectionResult, type DayResult } from "./engine.ts";
import { fmtDate, fmtRange } from "./time.ts";

const AVOID_ORDER: AvoidPeriod["kind"][] = ["rahu", "yamaganda", "gulika", "gandmool", "gandanta", "grading", "bhadra", "yoga", "panchak", "lagna-gandanta"];

/** Avoid periods, grouped by label, in a stable order. */
export function avoidLines(d: DayResult, tz: string): string[] {
  const sorted = [...d.avoid].sort((a, b) => AVOID_ORDER.indexOf(a.kind) - AVOID_ORDER.indexOf(b.kind) || a.start.getTime() - b.start.getTime());
  return sorted.map((a) => `${a.label}: ${fmtRange(a.start, a.end, tz)}`);
}

/** Plain-text summary (for WhatsApp / email). */
export function summaryText(r: CSectionResult, names?: { mother?: string; father?: string }): string {
  const tz = r.input.location.tz;
  const who = [names?.mother, names?.father].filter(Boolean).join(" & ");
  const out: string[] = [];
  out.push(`*Auspicious C-Section Dates*${who ? ` - ${who}` : ""}`);
  out.push(`Hospital location: ${r.input.location.name ?? ""}`.trim());
  out.push(`Doctor's window: ${fmtDate(r.input.windowStart)} to ${fmtDate(r.input.windowEnd)} | OT hours ${r.input.otStart}-${r.input.otEnd}`);
  r.top.forEach((d, i) => {
    out.push("");
    out.push(`*Priority ${i + 1}: ${fmtDate(d.date)} (${d.weekday})*`);
    out.push(`Mulank ${d.numerology.mulank}, Bhagyank ${d.numerology.bhagyank}, Luck ${d.numerology.luckPct}% (${d.numerology.classification})`);
    if (!d.windows.length) { out.push(`No clean shubh time: ${d.noWindowReason ?? ""}`); }
    else {
      out.push("Shubh time:");
      for (const w of d.recommended) out.push(`- ${fmtRange(w.start, w.end, tz)} (${GRADE_LABEL[w.grade]}, ${w.lagna} lagna${w.tags.length ? ", " + w.tags.join(" + ") : ""})${w.cautions.length ? " - caution: " + w.cautions.join(", ") : ""}`);
    }
    const av = avoidLines(d, tz);
    if (av.length) { out.push("Time to avoid:"); for (const l of av) out.push(`- ${l}`); }
  });
  out.push("");
  out.push("Numerology and Muhurat guidance only. Always confirm the final date and time with the treating obstetrician.");
  return out.join("\n");
}
