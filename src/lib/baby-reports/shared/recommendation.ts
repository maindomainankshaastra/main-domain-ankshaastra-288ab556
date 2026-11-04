// /**
//  * NAME RECOMMENDATION (shared across Name Correction, Perfect Baby Name, and
//  * Complete Baby Blueprint reports).
//  * Source: client's docx, "PART 8 — MY PERSONAL RECOMMENDATION".
//  * Verbatim client copy — do NOT paraphrase/edit.
//  *
//  * Three cases only: Option 1 wins, Option 2 wins, or both are equal. There is
//  * no partial/close-call case in the client's text — comparison is a strict
//  * "which option's numbers are more favourable" call made upstream (wherever
//  * Option 1 vs Option 2 facts are compared), not decided in this file.
//  */

// export type RecommendationCase = "option1Better" | "option2Better" | "equal";

// export const RECOMMENDATION_BLOCKS: Record<RecommendationCase, string[]> = {
//   option1Better: [
//     "After careful numerological analysis, Option 1 holds a stronger vibration compared to Option 2.",
//     "The first name number, full name number, and compound number of Option 1 are more favorable and aligned with your birth energies.",
//     "Therefore, I personally recommend going with Option 1 for the best results.",
//   ],
//   option2Better: [
//     "After careful numerological analysis, Option 2 holds a stronger vibration compared to Option 1.",
//     "The first name number, full name number, and compound number of Option 2 are more favorable and aligned with your birth energies.",
//     "Therefore, I personally recommend going with Option 2 for the best results.",
//   ],
//   equal: [
//     "Both options carry identical numerological vibrations, with the same first name, full name, and compound numbers.",
//     "Neither name holds any numerical advantage over the other.",
//     "You may confidently choose the one that resonates with you the most.",
//   ],
// };

// export interface OptionFacts {
//   firstNameNumber: number;
//   fullNameNumber: number;
//   compoundNumber: number;
//   /**
//    * Overall favourability score for this option, e.g. derived from the same
//    * HR/OA/NR verdict tier used elsewhere (lower tier index = more favourable).
//    * Pass in whatever ranking your rule-engine already produces — this module
//    * only picks the case, it doesn't re-derive favourability itself.
//    */
//   favorabilityRank: number;
// }

// /** Lower favorabilityRank wins. Equal rank -> "equal" case. */
// export function pickRecommendationCase(
//   option1: OptionFacts,
//   option2: OptionFacts,
// ): RecommendationCase {
//   const sameNumbers =
//     option1.firstNameNumber === option2.firstNameNumber &&
//     option1.fullNameNumber === option2.fullNameNumber &&
//     option1.compoundNumber === option2.compoundNumber;

//   if (sameNumbers || option1.favorabilityRank === option2.favorabilityRank) {
//     return "equal";
//   }
//   return option1.favorabilityRank < option2.favorabilityRank ? "option1Better" : "option2Better";
// }



/**
 * NAME RECOMMENDATION (shared across Name Correction, Perfect Baby Name, and
 * Complete Baby Blueprint reports).
 * Source: client's docx, "PART 8 — MY PERSONAL RECOMMENDATION".
 * Verbatim client copy — do NOT paraphrase/edit.
 *
 * Three cases only: Option 1 wins, Option 2 wins, or both are equal. There is
 * no partial/close-call case in the client's text — comparison is a strict
 * "which option's numbers are more favourable" call made upstream (wherever
 * Option 1 vs Option 2 facts are compared), not decided in this file.
 */

export type RecommendationCase = "option1Better" | "option2Better" | "equal";

export const RECOMMENDATION_BLOCKS: Record<RecommendationCase, string[]> = {
  option1Better: [
    "After careful numerological analysis, Option 1 holds a stronger vibration compared to Option 2.",
    "The first name number, full name number, and compound number of Option 1 are more favorable and aligned with your birth energies.",
    "Therefore, I personally recommend going with Option 1 for the best results.",
  ],
  option2Better: [
    "After careful numerological analysis, Option 2 holds a stronger vibration compared to Option 1.",
    "The first name number, full name number, and compound number of Option 2 are more favorable and aligned with your birth energies.",
    "Therefore, I personally recommend going with Option 2 for the best results.",
  ],
  equal: [
    "Both options carry identical numerological vibrations, with the same first name, full name, and compound numbers.",
    "Neither name holds any numerical advantage over the other.",
    "You may confidently choose the one that resonates with you the most.",
  ],
};

export interface OptionFacts {
  firstNameNumber: number;
  fullNameNumber: number;
  compoundNumber: number;
  /**
   * Overall favourability score for this option, e.g. derived from the same
   * HR/OA/NR verdict tier used elsewhere (lower tier index = more favourable).
   * Pass in whatever ranking your rule-engine already produces — this module
   * only picks the case, it doesn't re-derive favourability itself.
   */
  favorabilityRank: number;
}

/** Lower favorabilityRank wins. Equal rank -> "equal" case. */
export function pickRecommendationCase(
  option1: OptionFacts,
  option2: OptionFacts,
): RecommendationCase {
  const sameNumbers =
    option1.firstNameNumber === option2.firstNameNumber &&
    option1.fullNameNumber === option2.fullNameNumber &&
    option1.compoundNumber === option2.compoundNumber;

  if (sameNumbers || option1.favorabilityRank === option2.favorabilityRank) {
    return "equal";
  }
  return option1.favorabilityRank < option2.favorabilityRank ? "option1Better" : "option2Better";
}

/**
 * Case 4 — Comparison Not Applicable. Used when only ONE name was finalised
 * (the other option is empty / "NA"). Client's verbatim copy.
 */
export const SINGLE_OPTION_BLOCK: string[] = [
  "Since only one name has been finalized, a comparison between options is not possible.",
  "The name has been analysed on its own merits (first name, full name, and compound numbers) in the sections above.",
  "You may confidently go ahead with the name analysed above.",
];

export type NamePreference = "na" | "option1" | "option2" | "both" | null | undefined;

/**
 * Single source of truth for which recommendation case a report shows.
 *  - only one name           -> Case 4 ("single"), preference ignored
 *  - preference = Option 1   -> Case 1
 *  - preference = Option 2   -> Case 2
 *  - preference = Both       -> Case 3
 *  - preference = NA / empty -> computed from the numbers
 */
export function resolveRecommendationCase(args: {
  hasOption1: boolean;
  hasOption2: boolean;
  preference: NamePreference;
  computedCase: RecommendationCase;
}): RecommendationCase | "single" {
  const { hasOption1, hasOption2, preference, computedCase } = args;
  if (!(hasOption1 && hasOption2)) return "single";
  if (preference === "option1") return "option1Better";
  if (preference === "option2") return "option2Better";
  if (preference === "both") return "equal";
  return computedCase;
}

/**
 * Impact Level labels [Option 1, Option 2].
 *  - equal (same numerological value / "Both") -> Highest + Highest
 *  - preference Option 1 / Option 2 -> chosen one Highest, other High
 *  - otherwise the computed labels are kept
 */
export function impactLabelsForCase(
  recCase: RecommendationCase,
  preference: NamePreference,
  computed: [string, string],
): [string, string] {
  if (recCase === "equal") return ["Highest", "Highest"];
  if (preference === "option1") return ["Highest", "High"];
  if (preference === "option2") return ["High", "Highest"];
  return computed;
}
