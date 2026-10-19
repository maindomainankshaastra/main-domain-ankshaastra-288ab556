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
  first_name: "", middle_name: "", is_middle_name_father_husband: false, last_name: "",
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
  if (!v.option1_name.trim() || !v.option2_name.trim()) return "Option 1 and Option 2 names are required.";
  const a = v.first_alphabet.toUpperCase();
  if (v.option1_name.trim()[0]?.toUpperCase() !== a || v.option2_name.trim()[0]?.toUpperCase() !== a) {
    return `Both options should start with the chosen first alphabet "${a}".`;
  }
  return null;
}
