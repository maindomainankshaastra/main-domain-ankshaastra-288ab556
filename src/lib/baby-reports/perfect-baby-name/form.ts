// export type BabyNamePreference = "na" | "option1" | "option2" | "both";

// export const BABY_NAME_PREFERENCE_OPTIONS: { value: BabyNamePreference; label: string }[] = [
//   { value: "na", label: "NA" },
//   { value: "option1", label: "Option 1" },
//   { value: "option2", label: "Option 2" },
//   { value: "both", label: "Both" },
// ];

// export type BabyReportStatus = "draft" | "generating" | "completed" | "failed" | "archived";

// export interface BabyReportFormValues {
//   first_name: string;
//   middle_name: string;
//   is_middle_name_father_husband: boolean;
//   last_name: string;
//   /** Father's name — shown on the "Personal Information" page (Fathers Name row). */
//   father_name: string;
//   gender: string;
//   email: string;
//   phone: string; // WhatsApp number
//   dob: string;
//   first_alphabet: string;
//   option1_name: string;
//   option2_name: string;
//   /** Optional. When filled, the report includes the "Nick Name Recommendation" page (page 22). */
//   nick_name: string;
//   preference: BabyNamePreference;
//   status: BabyReportStatus;
// }

// export const EMPTY_BABY_FORM: BabyReportFormValues = {
//   first_name: "", middle_name: "", is_middle_name_father_husband: false, last_name: "", father_name: "",
//   gender: "", email: "", phone: "", dob: "", first_alphabet: "",
//   option1_name: "", option2_name: "", nick_name: "", preference: "na", status: "draft",
// };

// export function buildBabyCustomerName(v: Pick<BabyReportFormValues, "first_name" | "middle_name" | "last_name">): string {
//   return [v.first_name, v.middle_name, v.last_name].map((s) => s.trim()).filter(Boolean).join(" ");
// }

// export function normaliseAlphabet(raw: string): string {
//   const m = raw.toUpperCase().match(/[A-Z]/);
//   return m ? m[0] : "";
// }

// export function validateBabyForm(v: BabyReportFormValues): string | null {
//   if (!v.first_name.trim()) return "First name is required.";
//   if (!v.email.trim()) return "Email is required.";
//   if (!v.phone.trim()) return "WhatsApp number is required.";
//   if (!v.dob) return "Date of birth is required.";
//   if (!v.gender) return "Gender is required.";
//   if (!v.first_alphabet) return "First alphabet is required (A–Z).";
//   // Option 2 (or Option 1) may be left empty / "NA" — at least one real name is needed.
//   const names = [v.option1_name, v.option2_name].filter((n) => !isNaName(n));
//   if (names.length === 0) return "At least one name option is required (type NA in the other if you have only one).";
//   const a = v.first_alphabet.toUpperCase();
//   if (names.some((n) => n.trim()[0]?.toUpperCase() !== a)) {
//     return `Name options should start with the chosen first alphabet "${a}".`;
//   }
//   return null;
// }

// /** True when an option field is empty or means "none" (NA, N/A, none, nil, -). */
// export function isNaName(raw: string | null | undefined): boolean {
//   const s = (raw ?? "").trim();
//   return s === "" || /^(n\/?a|n\.a\.?|none|nil|[-–—])$/i.test(s);
// }

export type BabyNamePreference = "na" | "option1" | "option2" | "both";

export const BABY_NAME_PREFERENCE_OPTIONS: { value: BabyNamePreference; label: string }[] = [
  { value: "na", label: "NA" },
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "both", label: "Both" },
];

export type BabyReportStatus = "draft" | "generating" | "completed" | "failed" | "archived";

export interface BabyReportFormValues {
  first_name: string;
  middle_name: string;
  is_middle_name_father_husband: boolean;
  last_name: string;
  /** Father's name — shown on the "Personal Information" page (Fathers Name row). */
  father_name: string;
  gender: string;
  email: string;
  phone: string; // WhatsApp number
  dob: string;
  first_alphabet: string;
  option1_name: string;
  option2_name: string;
  /** Optional. When filled, the report includes the "Nick Name Recommendation" page (page 22). */
  nick_name: string;
  preference: BabyNamePreference;
  status: BabyReportStatus;
}

export const EMPTY_BABY_FORM: BabyReportFormValues = {
  first_name: "", middle_name: "", is_middle_name_father_husband: false, last_name: "", father_name: "",
  gender: "", email: "", phone: "", dob: "", first_alphabet: "",
  option1_name: "", option2_name: "", nick_name: "", preference: "na", status: "draft",
};

export function buildBabyCustomerName(v: Pick<BabyReportFormValues, "first_name" | "middle_name" | "last_name">): string {
  return [v.first_name, v.middle_name, v.last_name].map((s) => s.trim()).filter(Boolean).join(" ");
}

export function normaliseAlphabet(raw: string): string {
  const m = raw.toUpperCase().match(/[A-Z]/);
  return m ? m[0] : "";
}

export function validateBabyForm(v: BabyReportFormValues): string | null {
  if (!v.first_name.trim()) return "First name is required.";
  if (!v.email.trim()) return "Email is required.";
  if (!v.phone.trim()) return "WhatsApp number is required.";
  if (!v.dob) return "Date of birth is required.";
  if (!v.gender) return "Gender is required.";
  if (!v.first_alphabet) return "First alphabet is required (A–Z).";
  // Option 2 (or Option 1) may be left empty / "NA" — at least one real name is needed.
  const names = [v.option1_name, v.option2_name].filter((n) => !isNaName(n));
  if (names.length === 0) return "At least one name option is required (type NA in the other if you have only one).";
  return null;
}

/** True when an option field is empty or means "none" (NA, N/A, none, nil, -). */
export function isNaName(raw: string | null | undefined): boolean {
  const s = (raw ?? "").trim();
  return s === "" || /^(n\/?a|n\.a\.?|none|nil|[-–—])$/i.test(s);
}
