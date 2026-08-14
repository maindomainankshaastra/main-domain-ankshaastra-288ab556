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
  isPowerfulNumberMatch: boolean;
}

export interface NameCheckResult {
  facts: NameCheckFacts;
  verdict: Verdict;
  matchedRuleId: string;
  /** True when the match fell through to a fallback because no specific rule applied. */
  isFallback: boolean;
}
