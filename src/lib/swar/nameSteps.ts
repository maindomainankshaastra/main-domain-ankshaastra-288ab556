import { getBhagyank, getMulank } from "@/lib/name-check/lo-shu";
import { FRIENDSHIP_TABLE } from "@/lib/name-check/friendship-table";
import { chaldeanRawSum } from "@/lib/name-check/numerology";
import { reduceToSingleDigit } from "@/lib/name-check/lo-shu";
import { runNameCheck } from "@/lib/name-check/rule-engine";
import type { NameCheckFacts } from "@/lib/name-check/types";

const RESTRICTED = [4, 8, 9];

export interface CoreNumbers {
  mulank: number;
  bhagyank: number;
  /** Chaldean numbers friendly to BOTH Mulank and Bhagyank (restricted 4/8/9 removed). Best targets for the Name Generator. */
  suggested: number[];
}

/** "2026-10-14" -> Mulank, Bhagyank and the Chaldean numbers to aim for. */
export function coreNumbersFromDob(dob: string): CoreNumbers | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!m) return null;
  const year = Number(m[1]), month = Number(m[2]), day = Number(m[3]);
  const mulank = getMulank(day);
  const bhagyank = getBhagyank(day, month, year);
  const fm = FRIENDSHIP_TABLE[mulank].friendly;
  const fb = FRIENDSHIP_TABLE[bhagyank].friendly;
  let suggested = fm.filter((n) => fb.includes(n) && !RESTRICTED.includes(n));
  if (!suggested.length) suggested = [...new Set([...fm, ...fb])].filter((n) => !RESTRICTED.includes(n)).sort();
  return { mulank, bhagyank, suggested };
}

export type Grade = "good" | "ok" | "avoid";

export interface NameAnalysis {
  name: string;
  total: number;
  number: number;
  firstToMulank: string;
  firstToBhagyank: string;
  fullToMulank: string;
  fullToBhagyank: string;
  compoundTier: string;
  ruleId: string;
  grade: Grade;
  error?: string;
}

/** Splits "Dheer, Darsh  Advik\nVyom" into a clean list. */
export function parseNames(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(/[,\n;]+/)) {
    const n = part.replace(/[^A-Za-z ]/g, "").trim().replace(/\s+/g, " ");
    if (n && !seen.has(n.toLowerCase())) { seen.add(n.toLowerCase()); out.push(n); }
  }
  return out;
}

/** Runs the same rule engine used by the Name Check report for a brand-new baby name. */
export function analyseName(dob: string, name: string, surname = ""): NameAnalysis {
  const total = chaldeanRawSum(name);
  const base: NameAnalysis = {
    name, total, number: reduceToSingleDigit(total),
    firstToMulank: "", firstToBhagyank: "", fullToMulank: "", fullToBhagyank: "",
    compoundTier: "", ruleId: "", grade: "ok",
  };
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!m) return { ...base, error: "Enter date of birth in step 1" };
  try {
    const full = surname.trim() ? `${name} ${surname.trim()}` : name;
    const r = runNameCheck({
      dob: { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) },
      firstName: name, fullName: full,
    });
    const f: NameCheckFacts = r.facts;
    return {
      ...base,
      number: f.firstNameNumber,
      firstToMulank: f.firstNameToMulank, firstToBhagyank: f.firstNameToBhagyank,
      fullToMulank: f.fullNameToMulank, fullToBhagyank: f.fullNameToBhagyank,
      compoundTier: f.compoundTier, ruleId: r.matchedRuleId,
      // For a NEW baby name: "NR" = no correction needed (good), "OA" = acceptable, "HR" = would need correction (avoid).
      grade: r.verdict === "NR" ? "good" : r.verdict === "OA" ? "ok" : "avoid",
    };
  } catch (e: any) {
    return { ...base, error: e?.message || "Could not analyse" };
  }
}

export const GRADE_LABEL: Record<Grade, string> = {
  good: "✅ Highly suitable",
  ok: "🟡 Acceptable",
  avoid: "❌ Not recommended",
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Step 5 message: detailed analysis of the names the customer picked. */
export function buildAnalysisMessage(dob: string, rows: NameAnalysis[], mulank?: number, bhagyank?: number): string {
  const lines: string[] = ["*Namaskar,* 🙏", "", "Here is the detailed numerology analysis of your shortlisted names:", ""];
  if (mulank && bhagyank) lines.push(`🔢 *Mulank:* ${mulank}   |   *Bhagyank:* ${bhagyank}`, "");
  rows.forEach((r, i) => {
    lines.push(`*${i + 1}. ${r.name}*  (${r.total} → ${r.number})`);
    if (r.error) { lines.push(`   ⚠️ ${r.error}`, ""); return; }
    lines.push(
      `   • Relation with Mulank: ${cap(r.firstToMulank)}`,
      `   • Relation with Bhagyank: ${cap(r.firstToBhagyank)}`,
      `   • Compound number: ${cap(r.compoundTier)}`,
      `   • Verdict: ${GRADE_LABEL[r.grade]}`,
      "",
    );
  });
  const best = rows.filter((r) => r.grade === "good").map((r) => r.name);
  if (best.length) lines.push(`⭐ *Our recommendation:* ${best.join(", ")}`, "");
  lines.push("Let us know which name you would like to finalise. We will share the complete report for it.", "", "*Warm Regards,*", "*Ankshaastra – Empower Your Name*");
  return lines.join("\n");
}
