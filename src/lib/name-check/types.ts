// /**
//  * SHARED TYPES for the name-check engine.
//  */

// import type { Relation } from "./friendship-table";
// import type { CompoundTier } from "./compound-table";
// import type { Verdict } from "./hr-oa-nr-blocks";

// export interface NameCheckInput {
//   dob: { day: number; month: number; year: number };
//   firstName: string;
//   fullName: string;
// }

// /** Every derived number + relation the rule engine needs, computed once up front. */
// export interface NameCheckFacts {
//   mulank: number;
//   bhagyank: number;

//   firstNameNumber: number;
//   fullNameNumber: number;
//   fullNameCompoundNumber: number; // raw/un-reduced, for compound-table lookup
//   compoundTier: CompoundTier;

//   // Relation of the name-number to each core number.
//   firstNameToMulank: Relation;
//   firstNameToBhagyank: Relation;
//   fullNameToMulank: Relation;
//   fullNameToBhagyank: Relation;

//   firstNameRestricted: boolean; // first name number is 4, 8, or 9
//   fullNameRestricted: boolean; // full name number is 4, 8, or 9

//   firstNameOverAmplified: boolean; // first name number repeats in Lo Shu grid
//   fullNameOverAmplified: boolean; // full name number repeats in Lo Shu grid

//   firstNameEqualsMulank: boolean;
//   fullNameEqualsBhagyank: boolean;

//   // CONFIRMED by client: "weak friendly" = friendly relation on number 2 or 7.
//   firstNameIsWeakFriendly: boolean;
//   fullNameIsWeakFriendly: boolean;

//   // CONFIRMED by client: "powerful number" = Mulank, Bhagyank, First Name
//   // Number, and Full Name Number are ALL the same number.
//   isPowerfulNumberMatch: boolean;
// }

// export interface NameCheckResult {
//   facts: NameCheckFacts;
//   verdict: Verdict;
//   matchedRuleId: string;
//   /** True when the match fell through to a fallback because no specific rule applied. */
//   isFallback: boolean;
// }


/**
 * SHARED TYPES for the name-check engine.
 */

import type { Relation } from "./friendship-table";
import type { CompoundTier } from "./compound-table";
import type { Verdict } from "./hr-oa-nr-blocks";

export interface NameCheckInput {
  dob: { day: number; month: number; year: number };
  firstName: string;
  fullName: string;
}

/** Every derived number + relation the rule engine needs, computed once up front. */
export interface NameCheckFacts {
  mulank: number;
  bhagyank: number;

  firstNameNumber: number;
  fullNameNumber: number;
  fullNameCompoundNumber: number; // raw/un-reduced, for compound-table lookup
  compoundTier: CompoundTier;

  // Relation of the name-number to each core number.
  firstNameToMulank: Relation;
  firstNameToBhagyank: Relation;
  fullNameToMulank: Relation;
  fullNameToBhagyank: Relation;

  firstNameRestricted: boolean; // first name number is 4, 8, or 9
  fullNameRestricted: boolean; // full name number is 4, 8, or 9

  firstNameOverAmplified: boolean; // first name number repeats in Lo Shu grid
  fullNameOverAmplified: boolean; // full name number repeats in Lo Shu grid

  firstNameEqualsMulank: boolean;
  fullNameEqualsBhagyank: boolean;

  // CONFIRMED by client: "weak friendly" = friendly relation on number 2 or 7.
  firstNameIsWeakFriendly: boolean;
  fullNameIsWeakFriendly: boolean;

  // CONFIRMED by client: "powerful number" = Mulank, Bhagyank, First Name
  // Number, and Full Name Number are ALL the same number.
  // NOTE: kept for reference only — the rule that used this (old HR-22)
  // was dropped in the 18-rule revision, so this fact is no longer
  // consumed by matchRule(). Left in place in case a future rule needs it.
  isPowerfulNumberMatch: boolean;

  // CONFIRMED by client (2nd round): Rajyog Potential = one of the three
  // Lo Shu lines through 5 (9-5-1, 2-5-8, 4-5-6) has both flanking
  // numbers present in the birth chart's Lo Shu grid while 5 itself is
  // missing. Used by HR-11. See lo-shu.ts -> getRajyogPotential().
  hasRajyogPotential: boolean;
}

export interface NameCheckResult {
  facts: NameCheckFacts;
  verdict: Verdict;
  matchedRuleId: string;
  /** True when the match fell through to a fallback because no specific rule applied. */
  isFallback: boolean;
}
