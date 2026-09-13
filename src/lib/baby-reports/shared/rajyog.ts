/**
 * RAJYOG ANALYSIS (shared across Name Correction, Perfect Baby Name, and
 * Complete Baby Blueprint reports).
 * Source: client's docx, "PART-10 : How Rajyog Status Is Determined".
 *
 * Every Lo Shu grid contains three special combinations:
 *   Rajyog-1 = 9-5-1
 *   Rajyog-2 = 4-5-6
 *   Rajyog-3 = 2-5-8
 * A Rajyog is complete only when ALL THREE of its numbers are present.
 *
 * Status logic (client-confirmed, verbatim steps):
 *  Step 1 — check the natural grid (DOB digits + Mulank + Bhagyank).
 *           If all 3 numbers are already present -> "Naturally Present".
 *  Step 2 — if not naturally complete, check whether the ONE missing number
 *           can be supplied by the corrected First Name Number or corrected
 *           Full Name Number, and ONLY if that missing number is 1, 5, or 6
 *           — or 2, when 2 is favourable for this specific profile.
 *           If so -> "Completed Through Numerologically Aligned Name".
 *  Step 3 — otherwise -> "Not Present". This covers: the missing number is
 *           4, 8, or 9 (never safe to carry through a name); 2 is missing
 *           but not favourable for this profile; or more than one number
 *           is missing from the Rajyog.
 */

export type RajyogStatus =
  | "Naturally Present"
  | "Completed Through Numerologically Aligned Name"
  | "Not Present";

export interface RajyogDefinition {
  id: "Rajyog-1" | "Rajyog-2" | "Rajyog-3";
  numbers: [number, number, number];
}

export const RAJYOG_DEFINITIONS: RajyogDefinition[] = [
  { id: "Rajyog-1", numbers: [9, 5, 1] },
  { id: "Rajyog-2", numbers: [4, 5, 6] },
  { id: "Rajyog-3", numbers: [2, 5, 8] },
];

/** Numbers that can safely be carried into a Rajyog via a corrected name. */
const NAME_SAFE_RAJYOG_NUMBERS = [1, 5, 6];

export interface RajyogResult {
  id: RajyogDefinition["id"];
  numbers: [number, number, number];
  status: RajyogStatus;
  /** Which number(s), if any, were missing from the natural grid. */
  missingFromNaturalGrid: number[];
}

export interface RajyogInput {
  /** Digits present at least once in the natural Lo Shu grid (DOB + Mulank + Bhagyank). */
  naturalGridPresent: number[];
  correctedFirstNameNumber: number;
  correctedFullNameNumber: number;
  /**
   * Whether 2 is favourable for this specific profile. Per the client's
   * doc, this is a per-profile judgment call (not a fixed rule) — pass it
   * in from wherever that determination is made for this report type.
   */
  isTwoFavorableForProfile: boolean;
}

export function evaluateRajyog(
  def: RajyogDefinition,
  input: RajyogInput,
): RajyogResult {
  const missing = def.numbers.filter((n) => !input.naturalGridPresent.includes(n));

  // Step 1 — naturally present.
  if (missing.length === 0) {
    return { id: def.id, numbers: def.numbers, status: "Naturally Present", missingFromNaturalGrid: [] };
  }

  // Step 2 — can the corrected name supply the single missing number?
  if (missing.length === 1) {
    const missingNumber = missing[0];
    const canCarryViaName =
      NAME_SAFE_RAJYOG_NUMBERS.includes(missingNumber) ||
      (missingNumber === 2 && input.isTwoFavorableForProfile);

    const nameSuppliesIt =
      input.correctedFirstNameNumber === missingNumber ||
      input.correctedFullNameNumber === missingNumber;

    if (canCarryViaName && nameSuppliesIt) {
      return {
        id: def.id,
        numbers: def.numbers,
        status: "Completed Through Numerologically Aligned Name",
        missingFromNaturalGrid: missing,
      };
    }
  }

  // Step 3 — everything else falls back to Not Present (2+ missing, or the
  // missing number is 4/8/9, or 2 is missing but not favourable here).
  return { id: def.id, numbers: def.numbers, status: "Not Present", missingFromNaturalGrid: missing };
}

export function evaluateAllRajyogs(input: RajyogInput): RajyogResult[] {
  return RAJYOG_DEFINITIONS.map((def) => evaluateRajyog(def, input));
}
