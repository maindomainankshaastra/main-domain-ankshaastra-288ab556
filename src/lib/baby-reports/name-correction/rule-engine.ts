/**
 * NAME CORRECTION REPORT — RULE ENGINE
 * 1. computeFacts() — runs all calculations once for a given input.
 * 2. matchRule()   — priority-matches the computed facts against the 18
 *    confirmed HR/OA/NR rules (see ./hr-oa-nr-blocks.ts) and returns the
 *    one that applies.
 *
 * This reuses the same base calculations as the existing `name-check`
 * module (Chaldean numbers, friendship table, compound tiers, Lo Shu grid)
 * — see the imports below. Only the RULE SET and MATCHING TIERS differ,
 * because the client confirmed a deliberately smaller rule set for this
 * report (18 rules vs. the older 39-rule reference).
 *
 * CLIENT CONFIRMATIONS APPLIED HERE (13 Sept 2026):
 *  - Dropped entirely (do NOT implement): Enemy + Lo Shu repetition combos,
 *    same/different restricted-number-on-both-sides edge cases, Enemy/
 *    Friendly + moderate-compound stacking, Lo-Shu-repetition-alone cases,
 *    "Name Number = Mulank/Bhagyank" OA cases, and the N-F + good-compound
 *    NR case. All confirmed intentional removals — do not re-add.
 *  - "First Name (Enemy) + Full Name (Friendly)" (HR-05 here) is
 *    CONFIRMED upgraded from OA to HR severity.
 *  - HR-11 ("Rajyog Potential") IS implemented here (unlike the older
 *    name-check engine, which skipped it) — it uses the shared Rajyog
 *    module (../shared/rajyog.ts) to check whether the corrected full
 *    name number would complete a Rajyog.
 *  - Weak-friendly numbers = 2 and 7 (same convention as name-check).
 */

import { getRelation, type Relation } from "@/lib/name-check/friendship-table";
import { getCompoundTier } from "@/lib/name-check/compound-table";
import { buildLoShuGrid, getMulank, getBhagyank, isOverAmplified } from "@/lib/name-check/lo-shu";
import {
  getFirstNameNumber,
  getFullNameNumber,
  getFullNameCompoundNumber,
  isRestrictedNumber,
} from "@/lib/name-check/numerology";
import { evaluateAllRajyogs, type RajyogInput } from "../shared/rajyog";
import { HR_RULES, OA_RULES, NR_RULES, type Verdict } from "./hr-oa-nr-blocks";

export interface NameCorrectionInput {
  dob: { day: number; month: number; year: number };
  firstName: string;
  fullName: string;
  /** Per-profile call on whether 2 is favourable — feeds the Rajyog check. */
  isTwoFavorableForProfile: boolean;
}

export interface NameCorrectionFacts {
  mulank: number;
  bhagyank: number;
  firstNameNumber: number;
  fullNameNumber: number;
  fullNameCompoundNumber: number;
  compoundTier: "excellent" | "good" | "neutral" | "conditional" | "avoid";

  firstNameToMulank: Relation;
  fullNameToBhagyank: Relation;

  firstNameRestricted: boolean;
  fullNameRestricted: boolean;

  firstNameOverAmplified: boolean;
  fullNameOverAmplified: boolean;

  firstNameIsWeakFriendly: boolean;
  fullNameIsWeakFriendly: boolean;

  /** True if correcting the full name number would complete a Rajyog. */
  rajyogCompletableViaFullName: boolean;
}

// CONFIRMED by client: weak friendly numbers are 2 and 7.
const WEAK_FRIENDLY_NUMBERS = [2, 7];

export function computeFacts(input: NameCorrectionInput): NameCorrectionFacts {
  const { day, month, year } = input.dob;

  const mulank = getMulank(day);
  const bhagyank = getBhagyank(day, month, year);
  const grid = buildLoShuGrid(day, month, year);

  const firstNameNumber = getFirstNameNumber(input.firstName);
  const fullNameNumber = getFullNameNumber(input.fullName);
  const fullNameCompoundNumber = getFullNameCompoundNumber(input.fullName);
  const compoundTier = getCompoundTier(fullNameCompoundNumber);

  const firstNameToMulank = getRelation(mulank, firstNameNumber);
  const fullNameToBhagyank = getRelation(bhagyank, fullNameNumber);

  const rajyogInput: RajyogInput = {
    naturalGridPresent: grid.present,
    correctedFirstNameNumber: firstNameNumber,
    correctedFullNameNumber: fullNameNumber,
    isTwoFavorableForProfile: input.isTwoFavorableForProfile,
  };
  const rajyogResults = evaluateAllRajyogs(rajyogInput);
  const rajyogCompletableViaFullName = rajyogResults.some(
    (r) =>
      r.status === "Completed Through Numerologically Aligned Name" &&
      r.missingFromNaturalGrid.includes(fullNameNumber),
  );

  return {
    mulank,
    bhagyank,
    firstNameNumber,
    fullNameNumber,
    fullNameCompoundNumber,
    compoundTier,

    firstNameToMulank,
    fullNameToBhagyank,

    firstNameRestricted: isRestrictedNumber(firstNameNumber),
    fullNameRestricted: isRestrictedNumber(fullNameNumber),

    firstNameOverAmplified: isOverAmplified(firstNameNumber, grid),
    fullNameOverAmplified: isOverAmplified(fullNameNumber, grid),

    firstNameIsWeakFriendly:
      firstNameToMulank === "friendly" && WEAK_FRIENDLY_NUMBERS.includes(firstNameNumber),
    fullNameIsWeakFriendly:
      fullNameToBhagyank === "friendly" && WEAK_FRIENDLY_NUMBERS.includes(fullNameNumber),

    rajyogCompletableViaFullName,
  };
}

// Relation code letter, F/N/E — mirrors comboKey() in name-check/content-blocks.ts
function code(r: Relation): "F" | "N" | "E" {
  return r === "friendly" ? "F" : r === "neutral" ? "N" : "E";
}

export interface MatchResult {
  ruleId: string;
  verdict: Verdict;
  isFallback: boolean;
}

// ---------------------------------------------------------------------------
// TIER ORDER (most specific / severe first):
//  1. Restricted numbers (4/8/9) — overrides everything else.
//  2. Plain Enemy-relation combos (HR-01..05).
//  3. Friendly/Friendly + bad compound (HR-06).
//  4. Friendly/Friendly, both weak-friendly (HR-10).
//  5. Friendly/Friendly, Rajyog completable via full name (HR-11).
//  6. Plain Neutral/Friendly combos (OA-01..03).
//  7. Compound conditional alone (OA-04).
//  8. NR — clean Friendly/Friendly cases by compound tier.
// ---------------------------------------------------------------------------
export function matchRule(facts: NameCorrectionFacts): MatchResult {
  const comboCode = `${code(facts.firstNameToMulank)}-${code(facts.fullNameToBhagyank)}`;

  // --- Tier 1: restricted numbers (4/8/9) -----------------------------------
  if (facts.firstNameRestricted || facts.fullNameRestricted) {
    const restrictedNumber = facts.firstNameRestricted ? facts.firstNameNumber : facts.fullNameNumber;
    if (restrictedNumber === 4) return { ruleId: "HR-07", verdict: "HR", isFallback: false };
    if (restrictedNumber === 8) return { ruleId: "HR-08", verdict: "HR", isFallback: false };
    if (restrictedNumber === 9) return { ruleId: "HR-09", verdict: "HR", isFallback: false };
  }

  // --- Tier 2: plain Enemy-relation combos (HR-01 to HR-05) -----------------
  if (comboCode === "E-E") return { ruleId: "HR-01", verdict: "HR", isFallback: false };
  if (comboCode === "E-N") return { ruleId: "HR-02", verdict: "HR", isFallback: false };
  if (comboCode === "N-E") return { ruleId: "HR-03", verdict: "HR", isFallback: false };
  if (comboCode === "F-E") return { ruleId: "HR-04", verdict: "HR", isFallback: false };
  if (comboCode === "E-F") return { ruleId: "HR-05", verdict: "HR", isFallback: false };

  // --- Tier 3: Friendly/Friendly + bad compound -----------------------------
  if (comboCode === "F-F" && facts.compoundTier === "avoid") {
    return { ruleId: "HR-06", verdict: "HR", isFallback: false };
  }

  // --- Tier 4: Friendly/Friendly, both weak-friendly ------------------------
  if (comboCode === "F-F" && facts.firstNameIsWeakFriendly && facts.fullNameIsWeakFriendly) {
    return { ruleId: "HR-10", verdict: "HR", isFallback: false };
  }

  // --- Tier 5: Friendly/Friendly, Rajyog completable via full name ---------
  if (comboCode === "F-F" && facts.rajyogCompletableViaFullName) {
    return { ruleId: "HR-11", verdict: "HR", isFallback: false };
  }

  // --- Tier 6: plain Neutral/Friendly combos (OA-01 to OA-03) ---------------
  if (comboCode === "N-N") return { ruleId: "OA-01", verdict: "OA", isFallback: false };
  if (comboCode === "F-N") return { ruleId: "OA-02", verdict: "OA", isFallback: false };
  if (comboCode === "N-F") return { ruleId: "OA-03", verdict: "OA", isFallback: false };

  // --- Tier 7: compound conditional alone (only remaining F-F case) --------
  if (comboCode === "F-F" && facts.compoundTier === "conditional") {
    return { ruleId: "OA-04", verdict: "OA", isFallback: false };
  }

  // --- Tier 8: NR (clean Friendly/Friendly cases) ---------------------------
  if (comboCode === "F-F" && facts.compoundTier === "excellent" && !facts.firstNameOverAmplified && !facts.fullNameOverAmplified) {
    return { ruleId: "NR-01", verdict: "NR", isFallback: false };
  }
  if (comboCode === "F-F" && facts.compoundTier === "good") {
    return { ruleId: "NR-02", verdict: "NR", isFallback: false };
  }
  // Redundant safety net: if a conditional-compound F-F case wasn't caught by
  // OA-04 above for some reason, NR-03 covers the same condition per docx.
  if (comboCode === "F-F" && facts.compoundTier === "conditional") {
    return { ruleId: "NR-03", verdict: "NR", isFallback: false };
  }

  // --- Fallback: nothing matched ---------------------------------------------
  // Not expected to trigger with real data (client confirmed the 18 rules
  // cover every real-world combination), but kept defensively. The most
  // likely gap, if this ever fires, is an F-F combo with a NEUTRAL compound
  // tier — that specific case was dropped from the 39-rule set and the
  // client hasn't specified where it should land in the 18-rule set. Log
  // and default to the mildest verdict (NR-02) rather than blocking report
  // generation.
  console.warn(
    `[name-correction/rule-engine] No rule matched (comboCode=${comboCode}, compoundTier=${facts.compoundTier}). Falling back to NR-02 — flag this combination to the client.`,
  );
  return { ruleId: "NR-02", verdict: "NR", isFallback: true };
}

export function getRuleBlock(ruleId: string) {
  return [...HR_RULES, ...OA_RULES, ...NR_RULES].find((r) => r.id === ruleId);
}
