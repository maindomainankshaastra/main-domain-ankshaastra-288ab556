import { z } from "zod";

const nameRx = /^[a-zA-Z\s.'-]+$/;
export const phoneField = z.string().trim().min(7, "Enter a valid WhatsApp number").max(20).regex(/^[+]?[0-9\s-]{7,20}$/, "Enter a valid number");
export const emailField = z.string().trim().min(1, "Email is required").email("Enter a valid email").max(100);
export const pincodeField = z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode");
export const dobField = z.object({
  day: z.string().min(1, "Day required"),
  month: z.string().min(1, "Month required"),
  year: z.string().min(1, "Year required"),
});
export const tobField = z.object({
  hour: z.string().min(1, "Hour required"),
  minute: z.string().min(1, "Minute required"),
  meridiem: z.enum(["AM", "PM"], { required_error: "AM/PM required" }),
});
export const genderField = z.enum(["male", "female", "other"], { required_error: "Select gender" });

const contactFields = {
  email: emailField,
  whatsapp: phoneField,
};

export const luckyVehicleSchema = z.object({
  fullName: z.string().trim().min(2, "Full name required").max(100).regex(nameRx, "Letters only"),
  dob: dobField,
  gender: genderField,
  vehicleType: z.enum(["car", "bike"], { required_error: "Select vehicle type" }),
  vehicleUsage: z.enum(["personal", "business", "luxury"], { required_error: "Select usage" }),
  purchaseAmount: z.string().trim().min(1, "Enter amount"),
  stateCode: z.string().trim().min(2, "State code required").max(5),
  rtoCode: z.string().trim().min(1, "RTO code required").max(10),
  numberOptions: z.string().trim().max(200).optional().or(z.literal("")),
  ...contactFields,
});

export const luckyVehicleColorSchema = z.object({
  fullName: z.string().trim().min(2, "Full name required").max(100).regex(nameRx, "Letters only"),
  dob: dobField,
  gender: genderField,
  colorOptions: z.string().trim().min(2, "Share color preferences").max(500),
  ...contactFields,
});

export const luckyVehicleDateSchema = z.object({
  fullName: z.string().trim().min(2, "Full name required").max(100).regex(nameRx, "Letters only"),
  dob: dobField,
  gender: genderField,
  purchaseWindow: z.string().trim().min(3, "Share tentative window").max(300),
  ...contactFields,
});

export const luckyMobileSchema = z.object({
  fullName: z.string().trim().min(2, "Full name required").max(100).regex(nameRx, "Letters only"),
  dob: dobField,
  currentCity: z.string().trim().min(2, "City required").max(80),
  currentState: z.string().trim().min(2, "State required").max(80),
  gender: genderField,
  currentMobile: z.string().trim().max(20).optional().or(z.literal("")),
  preferredSeries: z.string().trim().max(100).optional().or(z.literal("")),
  preferredDigits: z.string().trim().max(100).optional().or(z.literal("")),
  avoidDigits: z.string().trim().max(100).optional().or(z.literal("")),
  purpose: z.enum(["personal", "business", "professional", "financial"], { required_error: "Select purpose" }),
  ...contactFields,
});

export const luckyFlatSchema = z.object({
  fullName: z.string().trim().min(2, "Full name required").max(100).regex(nameRx, "Letters only"),
  dob: dobField,
  currentCity: z.string().trim().min(2, "City required").max(80),
  currentState: z.string().trim().min(2, "State required").max(80),
  gender: genderField,
  towerBlock: z.string().trim().max(80).optional().or(z.literal("")),
  floorNumber: z.string().trim().max(20).optional().or(z.literal("")),
  propertyPurpose: z.enum(["self", "investment", "rental", "business"], { required_error: "Select purpose" }),
  facingDirection: z.string().trim().max(80).optional().or(z.literal("")),
  connectedNumber: z.string().trim().max(80).optional().or(z.literal("")),
  ...contactFields,
});

const partnerPersonSchema = z.object({
  fullName: z.string().trim().min(2, "Full name required").max(100).regex(nameRx, "Letters only"),
  dob: dobField,
  tob: tobField,
  pincode: pincodeField,
  pob: z.string().trim().min(2, "Place of birth required").max(120),
  gender: genderField,
});

export const relationshipAnalysisSchema = z.object({
  person1: partnerPersonSchema,
  person2: partnerPersonSchema,
  purpose: z.enum(["partnership", "personal", "friendship", "other"], { required_error: "Select purpose" }),
  ...contactFields,
});

export const businessBrandSchema = z.object({
  firstName: z.string().trim().min(1, "First name required").max(50).regex(nameRx, "Letters only"),
  middleName: z.string().trim().max(50).regex(/^[a-zA-Z\s.'-]*$/, "Letters only").optional().or(z.literal("")),
  lastName: z.string().trim().min(1, "Last name required").max(50).regex(nameRx, "Letters only"),
  middleIsFatherName: z.enum(["yes", "no"], { required_error: "Please select" }),
  gender: genderField,
  brandName: z.string().trim().min(2, "Brand name required").max(120),
  legalName: z.string().trim().min(2, "Legal name required").max(160),
  tagline: z.string().trim().max(200).optional().or(z.literal("")),
  industry: z.string().trim().min(2, "Industry required").max(120),
  incorporationDate: z.string().trim().max(40).optional().or(z.literal("")),
  entityType: z.enum(["pvt_ltd", "llp", "pub_ltd", "partnership", "other"], { required_error: "Select entity type" }),
  mobileNumber: z.string().trim().max(20).optional().or(z.literal("")),
  reason: z.string().trim().min(10, "Please explain (min 10 chars)").max(2000),
  ...contactFields,
});

export const businessDatesSchema = z.object({
  fullName: z.string().trim().min(2, "Full name required").max(100).regex(nameRx, "Letters only"),
  dob: dobField,
  gender: genderField,
  reason: z.string().trim().min(10, "Please explain").max(2000),
  ...contactFields,
});

export const businessPropertySchema = z.object({
  fullName: z.string().trim().min(2, "Full name required").max(100).regex(nameRx, "Letters only"),
  dob: dobField,
  gender: genderField,
  numberOptions: z.string().trim().min(1, "Share number options").max(300),
  floorNumber: z.string().trim().max(20).optional().or(z.literal("")),
  businessType: z.string().trim().min(2, "Business type required").max(120),
  facingDirection: z.string().trim().max(80).optional().or(z.literal("")),
  ...contactFields,
});

export const businessPartnerSchema = z.object({
  person1: partnerPersonSchema,
  person2: partnerPersonSchema,
  purpose: z.literal("business_partnership"),
  industry: z.string().trim().min(2, "Industry required").max(120),
  ...contactFields,
});

export const officeVastuSchema = z.object({
  fullName: z.string().trim().min(2, "Full name required").max(100).regex(nameRx, "Letters only"),
  dob: dobField,
  tob: tobField,
  pincode: pincodeField,
  pob: z.string().trim().min(2, "Place of birth required").max(120),
  gender: genderField,
  officePincode: pincodeField,
  officeCity: z.string().trim().min(2, "Office city required").max(80),
  officeState: z.string().trim().min(2, "Office state required").max(80),
  layoutAvailable: z.enum(["yes", "no", "optional"], { required_error: "Select option" }),
  businessIndustry: z.string().trim().min(2, "Industry required").max(120),
  companyLegalName: z.string().trim().min(2, "Company legal name required").max(160),
  ...contactFields,
});

export type ExtendedFormType =
  | "lucky-vehicle"
  | "lucky-vehicle-color"
  | "lucky-vehicle-date"
  | "lucky-mobile"
  | "lucky-flat"
  | "relationship-analysis"
  | "business-brand"
  | "business-dates"
  | "business-property"
  | "business-partner"
  | "office-vastu";

export const EXTENDED_FORM_TYPES: ExtendedFormType[] = [
  "lucky-vehicle",
  "lucky-vehicle-color",
  "lucky-vehicle-date",
  "lucky-mobile",
  "lucky-flat",
  "relationship-analysis",
  "business-brand",
  "business-dates",
  "business-property",
  "business-partner",
  "office-vastu",
];

export function inferExtendedFormType(service: string | null): ExtendedFormType | null {
  if (!service) return null;
  const s = service.toLowerCase();
  if (s.includes("lucky vehicle color") || s.includes("vehicle color")) return "lucky-vehicle-color";
  if (s.includes("vehicle purchase date") || s.includes("purchase date")) return "lucky-vehicle-date";
  if (s.includes("lucky vehicle") || s.includes("vehicle number")) return "lucky-vehicle";
  if (s.includes("lucky mobile") || s.includes("mobile number")) return "lucky-mobile";
  if (s.includes("lucky flat") || s.includes("flat number") || s.includes("plot number")) return "lucky-flat";
  if (s.includes("relationship analysis")) return "relationship-analysis";
  if (s.includes("business partner")) return "business-partner";
  if (s.includes("company registration") || s.includes("bank account") || s.includes("land purchase")) return "business-dates";
  if (s.includes("plot") || s.includes("exhibition stall") || s.includes("commercial space")) return "business-property";
  if (s.includes("business name") || s.includes("business tagline") || s.includes("brand tagline") || s.includes("business phone") || s.includes("business mobile")) return "business-brand";
  if (s.includes("office vastu") || s.includes("ceo") || s.includes("departmental") || s.includes("cash counter") || s.includes("management sitting") || s.includes("interior color")) return "office-vastu";
  return null;
}

export function getExtendedSchema(formType: ExtendedFormType) {
  switch (formType) {
    case "lucky-vehicle": return luckyVehicleSchema;
    case "lucky-vehicle-color": return luckyVehicleColorSchema;
    case "lucky-vehicle-date": return luckyVehicleDateSchema;
    case "lucky-mobile": return luckyMobileSchema;
    case "lucky-flat": return luckyFlatSchema;
    case "relationship-analysis": return relationshipAnalysisSchema;
    case "business-brand": return businessBrandSchema;
    case "business-dates": return businessDatesSchema;
    case "business-property": return businessPropertySchema;
    case "business-partner": return businessPartnerSchema;
    case "office-vastu": return officeVastuSchema;
  }
}

export function getExtendedDefaultValues(formType: ExtendedFormType): Record<string, unknown> {
  const emptyDob = { day: "", month: "", year: "" };
  const emptyTob = { hour: "", minute: "", meridiem: "AM" as const };
  const emptyPerson = { fullName: "", dob: emptyDob, tob: emptyTob, pincode: "", pob: "", gender: undefined };
  const contact = { email: "", whatsapp: "" };

  switch (formType) {
    case "lucky-vehicle":
      return { fullName: "", dob: emptyDob, gender: undefined, vehicleType: undefined, vehicleUsage: undefined, purchaseAmount: "", stateCode: "", rtoCode: "", numberOptions: "", ...contact };
    case "lucky-vehicle-color":
      return { fullName: "", dob: emptyDob, gender: undefined, colorOptions: "", ...contact };
    case "lucky-vehicle-date":
      return { fullName: "", dob: emptyDob, gender: undefined, purchaseWindow: "", ...contact };
    case "lucky-mobile":
      return { fullName: "", dob: emptyDob, currentCity: "", currentState: "", gender: undefined, currentMobile: "", preferredSeries: "", preferredDigits: "", avoidDigits: "", purpose: undefined, ...contact };
    case "lucky-flat":
      return { fullName: "", dob: emptyDob, currentCity: "", currentState: "", gender: undefined, towerBlock: "", floorNumber: "", propertyPurpose: undefined, facingDirection: "", connectedNumber: "", ...contact };
    case "relationship-analysis":
      return { person1: emptyPerson, person2: emptyPerson, purpose: undefined, ...contact };
    case "business-brand":
      return { firstName: "", middleName: "", lastName: "", middleIsFatherName: undefined, gender: undefined, brandName: "", legalName: "", tagline: "", industry: "", incorporationDate: "", entityType: undefined, mobileNumber: "", reason: "", ...contact };
    case "business-dates":
      return { fullName: "", dob: emptyDob, gender: undefined, reason: "", ...contact };
    case "business-property":
      return { fullName: "", dob: emptyDob, gender: undefined, numberOptions: "", floorNumber: "", businessType: "", facingDirection: "", ...contact };
    case "business-partner":
      return { person1: emptyPerson, person2: emptyPerson, purpose: "business_partnership" as const, industry: "", ...contact };
    case "office-vastu":
      return { fullName: "", dob: emptyDob, tob: emptyTob, pincode: "", pob: "", gender: undefined, officePincode: "", officeCity: "", officeState: "", layoutAvailable: undefined, businessIndustry: "", companyLegalName: "", ...contact };
  }
}
