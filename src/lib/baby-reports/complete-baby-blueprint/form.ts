// /** Complete Baby Blueprint — admin form (same 14 fields as Perfect Baby Name). */
// import type { BabyReportFormValues } from "../perfect-baby-name/form";

// export type { BabyNamePreference, BabyReportStatus, BabyReportFormValues } from "../perfect-baby-name/form";
// export {
//   BABY_NAME_PREFERENCE_OPTIONS, EMPTY_BABY_FORM, buildBabyCustomerName, normaliseAlphabet,
// } from "../perfect-baby-name/form";

// /** True when an option field is empty or means "none" (NA, N/A, none, nil, -). */
// export function isNaName(raw: string | null | undefined): boolean {
//   const s = (raw ?? "").trim();
//   return s === "" || /^(n\/?a|n\.a\.?|none|nil|[-–—])$/i.test(s);
// }

// /**
//  * Complete Baby Blueprint validation. Unlike Perfect Baby Name, Option 2 (or
//  * Option 1) may be left empty / "NA" — at least one real name option is needed,
//  * and every name that IS given must start with the chosen first alphabet.
//  */
// export function validateBabyForm(v: BabyReportFormValues): string | null {
//   if (!v.first_name.trim()) return "First name is required.";
//   if (!v.email.trim()) return "Email is required.";
//   if (!v.phone.trim()) return "WhatsApp number is required.";
//   if (!v.dob) return "Date of birth is required.";
//   if (!v.gender) return "Gender is required.";
//   if (!v.first_alphabet) return "First alphabet is required (A–Z).";
//   const names = [v.option1_name, v.option2_name].filter((n) => !isNaName(n));
//   if (names.length === 0) return "At least one name option is required (type NA in the other if you have only one).";
//   const a = v.first_alphabet.toUpperCase();
//   if (names.some((n) => n.trim()[0]?.toUpperCase() !== a)) {
//     return `Name options should start with the chosen first alphabet "${a}".`;
//   }
//   return null;
// }


/** Complete Baby Blueprint — admin form (same 14 fields as Perfect Baby Name). */
import type { BabyReportFormValues } from "../perfect-baby-name/form";

export type { BabyNamePreference, BabyReportStatus, BabyReportFormValues } from "../perfect-baby-name/form";
export {
  BABY_NAME_PREFERENCE_OPTIONS, EMPTY_BABY_FORM, buildBabyCustomerName, normaliseAlphabet,
} from "../perfect-baby-name/form";

/** True when an option field is empty or means "none" (NA, N/A, none, nil, -). */
export function isNaName(raw: string | null | undefined): boolean {
  const s = (raw ?? "").trim();
  return s === "" || /^(n\/?a|n\.a\.?|none|nil|[-–—])$/i.test(s);
}

/**
 * Complete Baby Blueprint validation. Unlike Perfect Baby Name, Option 2 (or
 * Option 1) may be left empty / "NA" — at least one real name option is needed,
 * and every name that IS given must start with the chosen first alphabet.
 */
export function validateBabyForm(v: BabyReportFormValues): string | null {
  if (!v.first_name.trim()) return "First name is required.";
  if (!v.email.trim()) return "Email is required.";
  if (!v.phone.trim()) return "WhatsApp number is required.";
  if (!v.dob) return "Date of birth is required.";
  if (!v.gender) return "Gender is required.";
  if (!v.first_alphabet) return "First alphabet is required (A–Z).";
  const names = [v.option1_name, v.option2_name].filter((n) => !isNaName(n));
  if (names.length === 0) return "At least one name option is required (type NA in the other if you have only one).";
  return null;
}
