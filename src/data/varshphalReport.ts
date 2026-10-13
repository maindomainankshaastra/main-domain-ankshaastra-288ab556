import { z } from "zod";
import { pricing } from "@/config/pricing";

export const varshphalInclusions = [
  "Month-by-month guidance for the next 12 months",
  "Month-by-month remedies for the next 12 months",
  "Your year's main focus, shown by your Muntha",
  "Detailed 30+ page PDF to keep forever",
];

export const varshphalAdditionalReport = {
  id: "additional-varshphal",
  label: "Additional Varshphal Report — 20% off",
  note: "One additional person · same 2027 report",
  price: Math.round(pricing.reports.varshphal * 0.8 * 100) / 100,
};

export const varshphalFaqs = [
  { question: "How is Varshphal different from a normal horoscope?", answer: "A normal horoscope offers general predictions, while your Varshphal Report is personalised using your birth details, annual chart, Muntha and Tajik astrology principles to interpret the year ahead." },
  { question: "What is included in the Varshphal Report?", answer: "Your report covers your annual planetary influences, key life themes, month-by-month outlook, favourable periods, potential challenges and important dates to watch throughout 2027." },
  { question: "When will I receive my report, and where can I find it?", answer: "Your personalised report will be prepared using the birth details submitted with your order. Once ready, it will be shared digitally through the delivery method specified at checkout. Please refer to the product page for the applicable delivery timeline." },
  { question: "What does the Varshphal Report 2027 cover?", answer: "The report offers an annual outlook for January to December 2027, covering career, finances, business, relationships, family, health and personal growth, along with key opportunities and periods requiring greater care." },
];

export const varshphalPersonSchema = z.object({
  fullName: z.string().trim().min(2, "Full name required").max(100).regex(/^[a-zA-Z\s.'-]+$/, "Letters only"),
  gender: z.enum(["male", "female", "other"], { required_error: "Select gender" }),
  pob: z.string().trim().min(2, "Exact place of birth required").max(120),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit birth PIN"),
  dob: z.object({ day: z.string().min(1, "Day required"), month: z.string().min(1, "Month required"), year: z.string().min(1, "Year required") }),
  tob: z.object({ hour: z.string().regex(/^(?:[1-9]|1[0-2])$/, "Exact birth hour required"), minute: z.string().regex(/^[0-5][0-9]$/, "Exact birth minute required"), meridiem: z.enum(["AM", "PM"], { required_error: "AM/PM required" }) }),
});

export const makeVarshphalSchema = (additional: boolean) => varshphalPersonSchema.extend({
  email: z.string().trim().email("Enter a valid email"),
  whatsapp: z.string().trim().regex(/^[+]?[0-9\s-]{7,20}$/, "Enter a valid WhatsApp number"),
  language: z.enum(["english", "hindi", "gujarati"], { required_error: "Select language" }),
  currentPincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit PIN"),
  currentCity: z.string().trim().min(2, "City required"),
  currentState: z.string().trim().min(2, "State required"),
  ...(additional ? { person2: varshphalPersonSchema } : {}),
});

export function prepareVarshphalSnapshot(data: Record<string, unknown>, additional: boolean) {
  if (!additional) { const { person2, ...single } = data; return single; }
  const { fullName, gender, dob, tob, pob, pincode } = data;
  return { ...data, purchaserName: fullName, person1: { fullName, gender, dob, tob, pob, pincode } };
}