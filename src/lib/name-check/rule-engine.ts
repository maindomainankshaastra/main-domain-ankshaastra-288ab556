


// /**
//  * RULE ENGINE
//  * 1. computeFacts() — runs all calculations once for a given input.
//  * 2. matchRule() — priority-matches the computed facts against the 18
//  *    HR/OA/NR rules (2nd revision) and returns the one that applies.
//  *
//  * See hr-oa-nr-blocks.ts header for the full old-doc -> new-doc change
//  * log. Summary of what changed here vs. the previous engine version:
//  *
//  *  - Restricted numbers (4/8/9): CONFIRMED — always resolve to the plain
//  *    HR-07/08/09 rule, even if BOTH first and full name are restricted
//  *    (same or different numbers). No more dual-restricted special rules.
//  *    First name takes priority if both are restricted.
//  *  - Enemy-relation combos (HR-01 to HR-05): CONFIRMED — resolve
//  *    directly off the First/Full name relation, compound tier is NOT
//  *    considered for any of these five. (E-F is now HR-05, upgraded from
//  *    the old OA-01.)
//  *  - Lo Shu "repetition/over-amplification" is CONFIRMED to no longer be
//  *    part of rule matching at all (facts.firstNameOverAmplified /
//  *    fullNameOverAmplified are computed but intentionally unused below).
//  *  - F-F combo still branches on compound tier + weak-friendly + the new
//  *    Rajyog Potential check, in that priority order (most specific /
//  *    most severe first): Bad compound > Weak friendly > Rajyog Potential
//  *    > Excellent/Good/Conditional compound (NR-01/02/03).
//  *  - F-N / N-F / N-N: CONFIRMED — resolve to a single fixed rule
//  *    (OA-02 / OA-03 / OA-01) regardless of compound tier.
//  *  - Name-equals-Mulank/Bhagyank is CONFIRMED no longer tracked for
//  *    verdict matching (old OA-12/13 dropped, not replaced).
//  *  - Fallback: CONFIRMED this should essentially never happen with the
//  *    18-rule set. The one known theoretical gap is F-F + Moderate/Neutral
//  *    compound with no weak-friendly and no Rajyog potential (there is no
//  *    rule for this specific combination in the new doc). Per client:
//  *    if the fallback path is ever hit, log a console.warn for internal
//  *    visibility ONLY — never surface anything about it to the end
//  *    customer. The existing admin-correction workflow (see
//  *    NameCheckReportsModule.tsx) is where a human manually fills in the
//  *    right content before the report ships.
//  */

// import { getRelation, type Relation } from "./friendship-table";
// import { getCompoundTier } from "./compound-table";
// import { buildLoShuGrid, getMulank, getBhagyank, isOverAmplified, getRajyogPotential } from "./lo-shu";
// import {
//   getFirstNameNumber,
//   getFullNameNumber,
//   getFullNameCompoundNumber,
//   isRestrictedNumber,
// } from "./numerology";
// import type { NameCheckInput, NameCheckFacts, NameCheckResult } from "./types";

// // ---------------------------------------------------------------------------
// // STEP 1 — compute all facts once
// // ---------------------------------------------------------------------------
// export function computeFacts(input: NameCheckInput): NameCheckFacts {
//   const { day, month, year } = input.dob;

//   const mulank = getMulank(day);
//   const bhagyank = getBhagyank(day, month, year);
//   const grid = buildLoShuGrid(day, month, year);

//   const firstNameNumber = getFirstNameNumber(input.firstName);
//   const fullNameNumber = getFullNameNumber(input.fullName);
//   const fullNameCompoundNumber = getFullNameCompoundNumber(input.fullName);
//   const compoundTier = getCompoundTier(fullNameCompoundNumber);

//   return {
//     mulank,
//     bhagyank,
//     firstNameNumber,
//     fullNameNumber,
//     fullNameCompoundNumber,
//     compoundTier,

//     firstNameToMulank: getRelation(mulank, firstNameNumber),
//     firstNameToBhagyank: getRelation(bhagyank, firstNameNumber),
//     fullNameToMulank: getRelation(mulank, fullNameNumber),
//     fullNameToBhagyank: getRelation(bhagyank, fullNameNumber),

//     firstNameRestricted: isRestrictedNumber(firstNameNumber),
//     fullNameRestricted: isRestrictedNumber(fullNameNumber),

//     // NOTE: computed for reference/display, but intentionally NOT used in
//     // matchRule() anymore — client confirmed Lo Shu repetition no longer
//     // affects verdict matching.
//     firstNameOverAmplified: isOverAmplified(firstNameNumber, grid),
//     fullNameOverAmplified: isOverAmplified(fullNameNumber, grid),

//     firstNameEqualsMulank: firstNameNumber === mulank,
//     fullNameEqualsBhagyank: fullNameNumber === bhagyank,

//     // CONFIRMED: weak friendly = friendly to both Mulank and Bhagyank, AND
//     // the name number itself is 2 or 7.
//     firstNameIsWeakFriendly:
//       getRelation(mulank, firstNameNumber) === "friendly" &&
//       getRelation(bhagyank, firstNameNumber) === "friendly" &&
//       WEAK_FRIENDLY_NUMBERS.includes(firstNameNumber),
//     fullNameIsWeakFriendly:
//       getRelation(mulank, fullNameNumber) === "friendly" &&
//       getRelation(bhagyank, fullNameNumber) === "friendly" &&
//       WEAK_FRIENDLY_NUMBERS.includes(fullNameNumber),

//     // Kept for reference only — no rule currently consumes this (old
//     // HR-22 was dropped in the 18-rule revision).
//     isPowerfulNumberMatch:
//       mulank === bhagyank && bhagyank === firstNameNumber && firstNameNumber === fullNameNumber,

//     // CONFIRMED (2nd round): Rajyog Potential — see lo-shu.ts for the
//     // exact 9-5-1 / 2-5-8 / 4-5-6 present/missing logic. Used by HR-11.
//     hasRajyogPotential: getRajyogPotential(grid).hasPotential,
//   };
// }

// // CONFIRMED by client: weak friendly numbers are 2 and 7.
// const WEAK_FRIENDLY_NUMBERS = [2, 7];

// // Helper: relation code letter, F/N/E — mirrors comboKey() in content-blocks.ts
// function code(r: Relation): "F" | "N" | "E" {
//   return r === "friendly" ? "F" : r === "neutral" ? "N" : "E";
// }

// // "Bad" compound = avoid tier. "Good"/"Moderate"(neutral)/"Conditional" map directly.
// const isBadCompound = (facts: NameCheckFacts) => facts.compoundTier === "avoid";
// const isExcellentCompound = (facts: NameCheckFacts) => facts.compoundTier === "excellent";
// const isGoodCompound = (facts: NameCheckFacts) => facts.compoundTier === "good";
// const isConditionalCompound = (facts: NameCheckFacts) => facts.compoundTier === "conditional";

// // ---------------------------------------------------------------------------
// // STEP 2 — PRIORITY ORDER (18-rule revision, client-confirmed)
// //
// // Tier 1 — Restricted numbers (4/8/9). Docx says these apply "regardless
// //          of the friendship table result". First name takes priority if
// //          both first and full name are restricted (client confirmed:
// //          always a single plain rule, no dual-restricted special case).
// // Tier 2 — Enemy-relation combos, HR-01 to HR-05. Compound tier is not
// //          considered for any of these.
// // Tier 3 — F-F combo: Bad compound > Weak friendly > Rajyog Potential >
// //          Excellent/Good/Conditional compound (NR-01/02/03).
// // Tier 4 — F-N -> OA-02, N-F -> OA-03, N-N -> OA-01 (fixed, no compound
// //          branching for any of these three).
// // Tier 5 — OA-04 (Compound Conditional, standalone). Note: with every
// //          Friendly/Neutral/Enemy combo already resolved by Tiers 2-4,
// //          this tier may be unreachable in practice. Kept because it's a
// //          defined rule in the client's doc; flagged for client review.
// // Tier 6 — Fallback. Known gap: F-F + Moderate/Neutral compound with no
// //          weak-friendly and no Rajyog potential has no defined rule.
// // ---------------------------------------------------------------------------

// export function matchRule(facts: NameCheckFacts): { ruleId: string; verdict: "HR" | "OA" | "NR"; isFallback: boolean } {
//   const firstRel = facts.firstNameToMulank;
//   const fullRel = facts.fullNameToBhagyank;
//   const comboCode = `${code(firstRel)}-${code(fullRel)}`;

//   // --- Tier 1: restricted numbers, single plain rule ------------------------
//   if (facts.firstNameRestricted || facts.fullNameRestricted) {
//     const restrictedNumber = facts.firstNameRestricted ? facts.firstNameNumber : facts.fullNameNumber;
//     if (restrictedNumber === 4) return { ruleId: "HR-07", verdict: "HR", isFallback: false };
//     if (restrictedNumber === 8) return { ruleId: "HR-08", verdict: "HR", isFallback: false };
//     if (restrictedNumber === 9) return { ruleId: "HR-09", verdict: "HR", isFallback: false };
//   }

//   // --- Tier 2: plain Enemy-relation combos (HR-01 to HR-05) ------------------
//   if (comboCode === "E-E") return { ruleId: "HR-01", verdict: "HR", isFallback: false };
//   if (comboCode === "E-N") return { ruleId: "HR-02", verdict: "HR", isFallback: false };
//   if (comboCode === "N-E") return { ruleId: "HR-03", verdict: "HR", isFallback: false };
//   if (comboCode === "F-E") return { ruleId: "HR-04", verdict: "HR", isFallback: false };
//   if (comboCode === "E-F") return { ruleId: "HR-05", verdict: "HR", isFallback: false };

//   // --- Tier 3: F-F combo — compound / weak-friendly / Rajyog ----------------
//   if (comboCode === "F-F") {
//     if (isBadCompound(facts)) return { ruleId: "HR-06", verdict: "HR", isFallback: false };
//     if (facts.firstNameIsWeakFriendly && facts.fullNameIsWeakFriendly) {
//       return { ruleId: "HR-10", verdict: "HR", isFallback: false };
//     }
//     if (facts.hasRajyogPotential) return { ruleId: "HR-11", verdict: "HR", isFallback: false };
//     if (isExcellentCompound(facts)) return { ruleId: "NR-01", verdict: "NR", isFallback: false };
//     if (isGoodCompound(facts)) return { ruleId: "NR-02", verdict: "NR", isFallback: false };
//     if (isConditionalCompound(facts)) return { ruleId: "NR-03", verdict: "NR", isFallback: false };
//     // F-F + Moderate/Neutral compound falls through to the fallback below —
//     // no rule defined for this exact combination in the new 18-rule doc.
//   }

//   // --- Tier 4: plain Friendly/Neutral combos (fixed, no compound check) ----
//   if (comboCode === "F-N") return { ruleId: "OA-02", verdict: "OA", isFallback: false };
//   if (comboCode === "N-F") return { ruleId: "OA-03", verdict: "OA", isFallback: false };
//   if (comboCode === "N-N") return { ruleId: "OA-01", verdict: "OA", isFallback: false };

//   // --- Tier 5: Compound Conditional, standalone -----------------------------
//   // NOTE: given Tiers 2-4 above already resolve every possible
//   // Friendly/Neutral/Enemy combo, this tier is likely unreachable in
//   // practice. Kept per the client's doc; flag for client review if this
//   // is ever confirmed to be dead code.
//   if (isConditionalCompound(facts)) return { ruleId: "OA-04", verdict: "OA", isFallback: false };

//   // --- Fallback: nothing matched ---------------------------------------------
//   // CLIENT CONFIRMED: this should essentially never happen with the
//   // 18-rule set. If it is ever hit, log a console.warn for internal/admin
//   // visibility only — nothing about this is shown to the end customer.
//   // The admin-correction workflow (NameCheckReportsModule.tsx) is where a
//   // human fills in the correct content manually before the report ships.
//   return { ruleId: "NR-02", verdict: "NR", isFallback: true };
// }

// export function runNameCheck(input: NameCheckInput): NameCheckResult {
//   const facts = computeFacts(input);
//   const { ruleId, verdict, isFallback } = matchRule(facts);
//   return { facts, verdict, matchedRuleId: ruleId, isFallback };
// }





/**
 * RULE ENGINE
 * 1. computeFacts() — runs all calculations once for a given input.
 * 2. matchRule() — priority-matches the computed facts against the 18
 *    HR/OA/NR rules (2nd revision) and returns the one that applies.
 *
 * See hr-oa-nr-blocks.ts header for the full old-doc -> new-doc change
 * log. Summary of what changed here vs. the previous engine version:
 *
 *  - Restricted numbers (4/8/9): CONFIRMED — always resolve to the plain
 *    HR-07/08/09 rule, even if BOTH first and full name are restricted
 *    (same or different numbers). No more dual-restricted special rules.
 *    First name takes priority if both are restricted.
 *  - Enemy-relation combos (HR-01 to HR-05): CONFIRMED — resolve
 *    directly off the First/Full name relation, compound tier is NOT
 *    considered for any of these five. (E-F is now HR-05, upgraded from
 *    the old OA-01.)
 *  - Lo Shu "repetition/over-amplification" is CONFIRMED to no longer be
 *    part of rule matching at all (facts.firstNameOverAmplified /
 *    fullNameOverAmplified are computed but intentionally unused below).
 *  - F-F combo still branches on compound tier + weak-friendly + the new
 *    Rajyog Potential check, in that priority order (most specific /
 *    most severe first): Bad compound > Weak friendly > Rajyog Potential
 *    > Excellent/Good/Conditional compound (NR-01/02/03).
 *  - F-N / N-F / N-N: CONFIRMED — resolve to a single fixed rule
 *    (OA-02 / OA-03 / OA-01) regardless of compound tier.
 *  - Name-equals-Mulank/Bhagyank is CONFIRMED no longer tracked for
 *    verdict matching (old OA-12/13 dropped, not replaced).
 *  - Fallback: CONFIRMED this should essentially never happen with the
 *    18-rule set. The one known theoretical gap is F-F + Moderate/Neutral
 *    compound with no weak-friendly and no Rajyog potential (there is no
 *    rule for this specific combination in the new doc). Per client:
 *    if the fallback path is ever hit, log a console.warn for internal
 *    visibility ONLY — never surface anything about it to the end
 *    customer. The existing admin-correction workflow (see
 *    NameCheckReportsModule.tsx) is where a human manually fills in the
 *    right content before the report ships.
 */

import { getRelation, type Relation } from "./friendship-table";
import { getCompoundTier } from "./compound-table";
import { buildLoShuGrid, getMulank, getBhagyank, isOverAmplified, getRajyogPotential } from "./lo-shu";
import {
  getFirstNameNumber,
  getFullNameNumber,
  getFullNameCompoundNumber,
  isRestrictedNumber,
} from "./numerology";
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

    // NOTE: computed for reference/display, but intentionally NOT used in
    // matchRule() anymore — client confirmed Lo Shu repetition no longer
    // affects verdict matching.
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

    // Kept for reference only — no rule currently consumes this (old
    // HR-22 was dropped in the 18-rule revision).
    isPowerfulNumberMatch:
      mulank === bhagyank && bhagyank === firstNameNumber && firstNameNumber === fullNameNumber,

    // CONFIRMED (2nd round): Rajyog Potential — see lo-shu.ts for the
    // exact 9-5-1 / 2-5-8 / 4-5-6 present/missing logic. Used by HR-11.
    // 3rd round: potential = one number of 9-5-1 / 2-5-8 / 4-5-6 missing in the
    // birth chart, and that number is not 9/4/8/2 and not an Enemy of
    // Mulank or Bhagyank (see lo-shu.ts -> getRajyogPotential).
    hasRajyogPotential: getRajyogPotential(
      grid,
      (n) => getRelation(mulank, n) !== "enemy" && getRelation(bhagyank, n) !== "enemy",
    ).hasPotential,
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
const isExcellentCompound = (facts: NameCheckFacts) => facts.compoundTier === "excellent";
const isGoodCompound = (facts: NameCheckFacts) => facts.compoundTier === "good";
const isConditionalCompound = (facts: NameCheckFacts) => facts.compoundTier === "conditional";

// ---------------------------------------------------------------------------
// STEP 2 — PRIORITY ORDER (18-rule revision, client-confirmed)
//
// Tier 1 — Restricted numbers (4/8/9). Docx says these apply "regardless
//          of the friendship table result". First name takes priority if
//          both first and full name are restricted (client confirmed:
//          always a single plain rule, no dual-restricted special case).
// Tier 2 — Enemy-relation combos, HR-01 to HR-05. Compound tier is not
//          considered for any of these.
// Tier 3 — F-F combo: Bad compound > Weak friendly > Rajyog Potential >
//          Excellent/Good/Conditional compound (NR-01/02/03).
// Tier 4 — F-N -> OA-02, N-F -> OA-03, N-N -> OA-01 (fixed, no compound
//          branching for any of these three).
// Tier 5 — OA-04 (Compound Conditional, standalone). Note: with every
//          Friendly/Neutral/Enemy combo already resolved by Tiers 2-4,
//          this tier may be unreachable in practice. Kept because it's a
//          defined rule in the client's doc; flagged for client review.
// Tier 6 — Fallback. Known gap: F-F + Moderate/Neutral compound with no
//          weak-friendly and no Rajyog potential has no defined rule.
// ---------------------------------------------------------------------------

export function matchRule(facts: NameCheckFacts): { ruleId: string; verdict: "HR" | "OA" | "NR"; isFallback: boolean } {
  const firstRel = facts.firstNameToMulank;
  const fullRel = facts.fullNameToBhagyank;
  const comboCode = `${code(firstRel)}-${code(fullRel)}`;

  // --- Tier 1: restricted numbers, single plain rule ------------------------
  if (facts.firstNameRestricted || facts.fullNameRestricted) {
    const restrictedNumber = facts.firstNameRestricted ? facts.firstNameNumber : facts.fullNameNumber;
    if (restrictedNumber === 4) return { ruleId: "HR-07", verdict: "HR", isFallback: false };
    if (restrictedNumber === 8) return { ruleId: "HR-08", verdict: "HR", isFallback: false };
    if (restrictedNumber === 9) return { ruleId: "HR-09", verdict: "HR", isFallback: false };
  }

  // --- Tier 2: plain Enemy-relation combos (HR-01 to HR-05) ------------------
  if (comboCode === "E-E") return { ruleId: "HR-01", verdict: "HR", isFallback: false };
  if (comboCode === "E-N") return { ruleId: "HR-02", verdict: "HR", isFallback: false };
  if (comboCode === "N-E") return { ruleId: "HR-03", verdict: "HR", isFallback: false };
  if (comboCode === "F-E") return { ruleId: "HR-04", verdict: "HR", isFallback: false };
  if (comboCode === "E-F") return { ruleId: "HR-05", verdict: "HR", isFallback: false };

  // --- Tier 3: F-F combo — compound / weak-friendly / Rajyog ----------------
  if (comboCode === "F-F") {
    if (isBadCompound(facts)) return { ruleId: "HR-06", verdict: "HR", isFallback: false };
    if (facts.firstNameIsWeakFriendly && facts.fullNameIsWeakFriendly) {
      return { ruleId: "HR-10", verdict: "HR", isFallback: false };
    }
    if (facts.hasRajyogPotential) return { ruleId: "HR-11", verdict: "HR", isFallback: false };
    if (isExcellentCompound(facts)) return { ruleId: "NR-01", verdict: "NR", isFallback: false };
    if (isGoodCompound(facts)) return { ruleId: "NR-02", verdict: "NR", isFallback: false };
    if (isConditionalCompound(facts)) return { ruleId: "NR-03", verdict: "NR", isFallback: false };
    // F-F + Moderate/Neutral compound falls through to the fallback below —
    // no rule defined for this exact combination in the new 18-rule doc.
  }

  // --- Tier 4: plain Friendly/Neutral combos (fixed, no compound check) ----
  if (comboCode === "F-N") return { ruleId: "OA-02", verdict: "OA", isFallback: false };
  if (comboCode === "N-F") return { ruleId: "OA-03", verdict: "OA", isFallback: false };
  if (comboCode === "N-N") return { ruleId: "OA-01", verdict: "OA", isFallback: false };

  // --- Tier 5: Compound Conditional, standalone -----------------------------
  // NOTE: given Tiers 2-4 above already resolve every possible
  // Friendly/Neutral/Enemy combo, this tier is likely unreachable in
  // practice. Kept per the client's doc; flag for client review if this
  // is ever confirmed to be dead code.
  if (isConditionalCompound(facts)) return { ruleId: "OA-04", verdict: "OA", isFallback: false };

  // --- Fallback: nothing matched ---------------------------------------------
  // CLIENT CONFIRMED: this should essentially never happen with the
  // 18-rule set. If it is ever hit, log a console.warn for internal/admin
  // visibility only — nothing about this is shown to the end customer.
  // The admin-correction workflow (NameCheckReportsModule.tsx) is where a
  // human fills in the correct content manually before the report ships.
  return { ruleId: "NR-02", verdict: "NR", isFallback: true };
}

export function runNameCheck(input: NameCheckInput): NameCheckResult {
  const facts = computeFacts(input);
  const { ruleId, verdict, isFallback } = matchRule(facts);
  return { facts, verdict, matchedRuleId: ruleId, isFallback };
}
