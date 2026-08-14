/**
 * RULE ENGINE
 * 1. computeFacts() — runs all calculations once for a given input.
 * 2. matchRule() — priority-matches the computed facts against the 39
 *    HR/OA/NR rules and returns the one that applies.
 *
 * CLIENT CONFIRMATIONS APPLIED HERE:
 *  - Lo Shu over-amplification threshold: 2+ occurrences (already the default).
 *  - Compound numbers > 100: reduced to a double-digit number before lookup
 *    (see compound-table.ts).
 *  - HR-16 "weak friendly" = friendly relation on number 2 or 7. Implemented.
 *  - HR-20 "Rajyog Potential": client said SKIP — not implemented, never matched.
 *  - HR-22 "powerful number" = Mulank, Bhagyank, First Name Number, and Full
 *    Name Number all equal. Implemented.
 *  - Restricted numbers (4/8/9) override every other rule — Tier 1 below.
 *  - Client confirmed a real customer will only ever match ONE rule in
 *    practice (no real-world overlaps), so the tiered order below is a
 *    safety net rather than something actively relied upon — but it's kept
 *    "most specific/severe first" regardless, as sane default behaviour.
 *  - NR fallback should never trigger per client (NR only via the 4 defined
 *    rules) — the fallback path still exists defensively but logs a warning
 *    if hit, since that would mean a real, unexpected gap.
 *
 * NOTE: HR-18 ("First Name Friendly + Full Name Friendly, same number
 * repeating between the two names") was in the docx but missed in the first
 * draft of this engine — it doesn't depend on any open question, so it's
 * implemented here now too.
 */

import { getRelation, type Relation } from "./friendship-table";
import { getCompoundTier } from "./compound-table";
import { buildLoShuGrid, getMulank, getBhagyank, isOverAmplified } from "./lo-shu";
import {
  getFirstNameNumber,
  getFullNameNumber,
  getFullNameCompoundNumber,
  isRestrictedNumber,
} from "./numerology";
import { HR_RULES, OA_RULES, NR_RULES } from "./hr-oa-nr-blocks";
import type { NameCheckInput, NameCheckFacts, NameCheckResult } from "./types";

// ---------------------------------------------------------------------------
// STEP 1 — compute all facts once
// ---------------------------------------------------------------------------
export function computeFacts(input: NameCheckInput): NameCheckFacts {
  const { day, month, year } = input.dob;

  const mulank = getMulank(day);
  const bhagyank = getBhagyank(day, month, year);
  const grid = buildLoShuGrid(day, month, year);

  const firstNameNumber = getFirstNameNumber(input.firstName);
  const fullNameNumber = getFullNameNumber(input.fullName);
  const fullNameCompoundNumber = getFullNameCompoundNumber(input.fullName);
  const compoundTier = getCompoundTier(fullNameCompoundNumber);

  return {
    mulank,
    bhagyank,
    firstNameNumber,
    fullNameNumber,
    fullNameCompoundNumber,
    compoundTier,

    firstNameToMulank: getRelation(mulank, firstNameNumber),
    firstNameToBhagyank: getRelation(bhagyank, firstNameNumber),
    fullNameToMulank: getRelation(mulank, fullNameNumber),
    fullNameToBhagyank: getRelation(bhagyank, fullNameNumber),

    firstNameRestricted: isRestrictedNumber(firstNameNumber),
    fullNameRestricted: isRestrictedNumber(fullNameNumber),

    firstNameOverAmplified: isOverAmplified(firstNameNumber, grid),
    fullNameOverAmplified: isOverAmplified(fullNameNumber, grid),

    firstNameEqualsMulank: firstNameNumber === mulank,
    fullNameEqualsBhagyank: fullNameNumber === bhagyank,

    // CONFIRMED: weak friendly = friendly to both Mulank and Bhagyank, AND
    // the name number itself is 2 or 7.
    firstNameIsWeakFriendly:
      getRelation(mulank, firstNameNumber) === "friendly" &&
      getRelation(bhagyank, firstNameNumber) === "friendly" &&
      WEAK_FRIENDLY_NUMBERS.includes(firstNameNumber),
    fullNameIsWeakFriendly:
      getRelation(mulank, fullNameNumber) === "friendly" &&
      getRelation(bhagyank, fullNameNumber) === "friendly" &&
      WEAK_FRIENDLY_NUMBERS.includes(fullNameNumber),

    // CONFIRMED: powerful number = Mulank, Bhagyank, First Name Number and
    // Full Name Number are all the same single number.
    isPowerfulNumberMatch:
      mulank === bhagyank && bhagyank === firstNameNumber && firstNameNumber === fullNameNumber,
  };
}

// CONFIRMED by client: weak friendly numbers are 2 and 7.
const WEAK_FRIENDLY_NUMBERS = [2, 7];

// Helper: relation code letter, F/N/E — mirrors comboKey() in content-blocks.ts
function code(r: Relation): "F" | "N" | "E" {
  return r === "friendly" ? "F" : r === "neutral" ? "N" : "E";
}

// "Bad" compound = avoid tier. "Good"/"Moderate"(neutral)/"Conditional" map directly.
const isBadCompound = (facts: NameCheckFacts) => facts.compoundTier === "avoid";
const isModerateCompound = (facts: NameCheckFacts) => facts.compoundTier === "neutral";
const isGoodCompound = (facts: NameCheckFacts) => facts.compoundTier === "good";
const isExcellentCompound = (facts: NameCheckFacts) => facts.compoundTier === "excellent";
const isConditionalCompound = (facts: NameCheckFacts) => facts.compoundTier === "conditional";

// ---------------------------------------------------------------------------
// STEP 2 — PRIORITY DESIGN (draft, needs client sign-off)
//
// Tier 1 — Restricted numbers (4/8/9). Docx says these apply "regardless
//          of the friendship table result", so they're checked first.
//          Most-specific restricted combos (double/triple) before single.
// Tier 2 — Enemy-relation + Lo Shu repetition combos (most severe non-
//          restricted case).
// Tier 3 — Plain Enemy-relation combos (First/Full = Enemy on either side).
// Tier 4 — Combo + bad/moderate compound stacking (HR-14/15/17/19, OA-05/06/07).
// Tier 5 — Plain Friendly/Neutral combos (OA-01 to OA-04).
// Tier 6 — Lo Shu repetition alone on a friendly/neutral number (OA-08/09).
// Tier 7 — Compound tier alone (OA-10/11).
// Tier 8 — Name-equals-Mulank/Bhagyank (OA-12/13).
// Tier 9 — NR rules (only reached when nothing above matched — i.e. a
//          genuinely clean case).
//
// Rules requiring undefined criteria (HR-16, HR-18 "repetition between
// first vs full name numbers" edge case, HR-20, HR-22) are deliberately
// left unchecked below — see file header.
// ---------------------------------------------------------------------------

export function matchRule(facts: NameCheckFacts): { ruleId: string; verdict: "HR" | "OA" | "NR"; isFallback: boolean } {
  const firstRel = facts.firstNameToMulank;
  const fullRel = facts.fullNameToBhagyank;

  // --- Tier 1: restricted numbers -----------------------------------------
  if (facts.firstNameRestricted && facts.fullNameRestricted) {
    const sameNumber = facts.firstNameNumber === facts.fullNameNumber;
    if (sameNumber) return { ruleId: "HR-13", verdict: "HR", isFallback: false }; // both same restricted number
    // Different restricted numbers on each side.
    return { ruleId: "HR-21", verdict: "HR", isFallback: false };
  }
  if (facts.firstNameRestricted && facts.firstNameNumber === 4 && facts.firstNameOverAmplified) {
    return { ruleId: "HR-10", verdict: "HR", isFallback: false };
  }
  if (facts.firstNameRestricted && facts.firstNameNumber === 8 && facts.firstNameOverAmplified) {
    return { ruleId: "HR-11", verdict: "HR", isFallback: false };
  }
  if (facts.fullNameRestricted && facts.fullNameNumber === 9 && facts.fullNameOverAmplified) {
    return { ruleId: "HR-12", verdict: "HR", isFallback: false };
  }
  if (facts.firstNameRestricted || facts.fullNameRestricted) {
    const restrictedNumber = facts.firstNameRestricted ? facts.firstNameNumber : facts.fullNameNumber;
    if (restrictedNumber === 4) return { ruleId: "HR-07", verdict: "HR", isFallback: false };
    if (restrictedNumber === 8) return { ruleId: "HR-08", verdict: "HR", isFallback: false };
    if (restrictedNumber === 9) return { ruleId: "HR-09", verdict: "HR", isFallback: false };
  }

  // --- Tier 2: Enemy relation + Lo Shu repetition --------------------------
  if (firstRel === "enemy" && facts.firstNameOverAmplified) {
    return { ruleId: "HR-05", verdict: "HR", isFallback: false };
  }
  if (fullRel === "enemy" && facts.fullNameOverAmplified) {
    return { ruleId: "HR-06", verdict: "HR", isFallback: false };
  }

  // --- Tier 3: plain Enemy-relation combos (HR-01 to HR-04) -----------------
  const comboCode = `${code(firstRel)}-${code(fullRel)}`;
  if (comboCode === "E-E") return { ruleId: "HR-01", verdict: "HR", isFallback: false };
  if (comboCode === "E-N") return { ruleId: "HR-02", verdict: "HR", isFallback: false };
  if (comboCode === "N-E") return { ruleId: "HR-03", verdict: "HR", isFallback: false };
  if (comboCode === "F-E") return { ruleId: "HR-04", verdict: "HR", isFallback: false };

  // --- Tier 4: combo + compound stacking ------------------------------------
  if (comboCode === "F-F" && isBadCompound(facts)) return { ruleId: "HR-14", verdict: "HR", isFallback: false };
  if (comboCode === "N-E" && isBadCompound(facts)) return { ruleId: "HR-15", verdict: "HR", isFallback: false };
  if (comboCode === "F-N" && isBadCompound(facts)) return { ruleId: "HR-17", verdict: "HR", isFallback: false };
  if (comboCode === "E-N" && isBadCompound(facts)) return { ruleId: "HR-19", verdict: "HR", isFallback: false };
  if (comboCode === "E-F" && isModerateCompound(facts)) return { ruleId: "OA-05", verdict: "OA", isFallback: false };
  if (comboCode === "F-N" && isGoodCompound(facts)) return { ruleId: "OA-06", verdict: "OA", isFallback: false };
  if (comboCode === "F-F" && isModerateCompound(facts)) return { ruleId: "OA-07", verdict: "OA", isFallback: false };

  // --- Tier 4b: F-F combo special cases (powerful number, weak friendly, --
  //              repeated number) — checked in this order: most specific
  //              (powerful number + Lo Shu repetition) first, then weak
  //              friendly, then plain same-number repetition. ------------
  if (comboCode === "F-F" && facts.isPowerfulNumberMatch && (facts.firstNameOverAmplified || facts.fullNameOverAmplified)) {
    return { ruleId: "HR-22", verdict: "HR", isFallback: false };
  }
  if (comboCode === "F-F" && facts.firstNameIsWeakFriendly && facts.fullNameIsWeakFriendly) {
    return { ruleId: "HR-16", verdict: "HR", isFallback: false };
  }
  if (comboCode === "F-F" && facts.firstNameNumber === facts.fullNameNumber) {
    return { ruleId: "HR-18", verdict: "HR", isFallback: false };
  }
  // HR-20 (Rajyog Potential) intentionally not implemented — client said skip.

  // --- Tier 5: plain Friendly/Neutral combos (OA-01 to OA-04) ---------------
  if (comboCode === "E-F") return { ruleId: "OA-01", verdict: "OA", isFallback: false };
  if (comboCode === "N-N") return { ruleId: "OA-02", verdict: "OA", isFallback: false };
  if (comboCode === "F-N") return { ruleId: "OA-03", verdict: "OA", isFallback: false };
  if (comboCode === "N-F") return { ruleId: "OA-04", verdict: "OA", isFallback: false };

  // --- Tier 6: Lo Shu repetition alone --------------------------------------
  if (facts.firstNameOverAmplified || facts.fullNameOverAmplified) {
    const rel = facts.firstNameOverAmplified ? firstRel : fullRel;
    if (rel === "friendly") return { ruleId: "OA-08", verdict: "OA", isFallback: false };
    if (rel === "neutral") return { ruleId: "OA-09", verdict: "OA", isFallback: false };
  }

  // --- Tier 7: compound tier alone ------------------------------------------
  if (isModerateCompound(facts)) return { ruleId: "OA-10", verdict: "OA", isFallback: false };
  if (isConditionalCompound(facts)) return { ruleId: "OA-11", verdict: "OA", isFallback: false };

  // --- Tier 8: name equals Mulank/Bhagyank ----------------------------------
  if (facts.firstNameEqualsMulank) return { ruleId: "OA-12", verdict: "OA", isFallback: false };
  if (facts.fullNameEqualsBhagyank) return { ruleId: "OA-13", verdict: "OA", isFallback: false };

  // --- Tier 9: NR (clean cases) ----------------------------------------------
  if (comboCode === "F-F" && isExcellentCompound(facts) && !facts.firstNameOverAmplified && !facts.fullNameOverAmplified) {
    return { ruleId: "NR-01", verdict: "NR", isFallback: false };
  }
  if (comboCode === "F-F" && isGoodCompound(facts)) return { ruleId: "NR-02", verdict: "NR", isFallback: false };
  if (comboCode === "N-F" && isGoodCompound(facts)) return { ruleId: "NR-03", verdict: "NR", isFallback: false };
  if (comboCode === "F-F" && isConditionalCompound(facts)) return { ruleId: "NR-04", verdict: "NR", isFallback: false };

  // --- Fallback: nothing matched ---------------------------------------------
  // CLIENT CONFIRMED this should never happen — NR only applies to the 4
  // defined conditions above. If this path is ever hit in practice, it
  // means a real, unaccounted-for combination exists and needs review —
  // hence the console.warn in runNameCheck() below whenever isFallback is
  // true. Defaulting to NR-02's text here purely as a non-crashing default.
  return { ruleId: "NR-02", verdict: "NR", isFallback: true };
}

export function runNameCheck(input: NameCheckInput): NameCheckResult {
  const facts = computeFacts(input);
  const { ruleId, verdict, isFallback } = matchRule(facts);
  return { facts, verdict, matchedRuleId: ruleId, isFallback };
}
