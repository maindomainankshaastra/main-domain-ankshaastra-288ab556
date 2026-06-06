import { pricing, payLink } from "@/config/pricing";

export type CatalogPackage = {
  name: string;
  serviceTitle: string;
  price: number;
  originalPrice?: number;
  formType: string;
  tag?: string;
  popular?: boolean;
  description?: string;
  externalUrl?: string;
};

export type ServiceHub = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  route: string;
  canonical: string;
  packages: CatalogPackage[];
  hubAddons?: Array<{ label: string; price: number }>;
};

export const callConsultationHub: ServiceHub = {
  id: "call-consultation",
  title: "1:1 Call Consultation",
  subtitle: "Personal guidance from Himansshu Agarwal Ji over audio or video call.",
  category: "Consultation",
  route: "/consultation",
  canonical: "/consultation",
  hubAddons: [{ label: "Personalised Premium Kundli 2.0", price: pricing.addons.kundli20 }],
  packages: [
    { name: "Audio Consultation 45 Minutes", serviceTitle: "1:1 Call Consultation Audio 45", price: pricing.audioCall.min45, formType: "consultation" },
    { name: "Audio Consultation 60 Minutes", serviceTitle: "1:1 Call Consultation Audio 60", price: pricing.audioCall.min60, formType: "consultation", popular: true },
    { name: "Audio Consultation 75 Minutes", serviceTitle: "1:1 Call Consultation Audio 75", price: pricing.audioCall.min75, formType: "consultation" },
    { name: "Video Consultation 45 Minutes", serviceTitle: "1:1 Call Consultation Video 45", price: pricing.videoCall.min45, formType: "consultation" },
    { name: "Video Consultation 60 Minutes", serviceTitle: "1:1 Call Consultation Video 60", price: pricing.videoCall.min60, formType: "consultation" },
    { name: "Video Consultation 75 Minutes", serviceTitle: "1:1 Call Consultation Video 75", price: pricing.videoCall.min75, formType: "consultation" },
  ],
};

export const varshphalPackages: CatalogPackage[] = [
  { name: "Varshphal Report", serviceTitle: "Varshphal Report 2026", price: pricing.reports.varshphal, formType: "kundali", popular: true },
];

export const pyaarShastraPackages: CatalogPackage[] = [
  { name: "Pyaar Shaastra Report", serviceTitle: "Pyaar Shaastra Report", price: pricing.pyaarShastra.price, originalPrice: pricing.pyaarShastra.originalPrice, formType: "pyaar-shastra", popular: true },
  { name: "Pyaar Shaastra Report Original", serviceTitle: "Pyaar Shaastra Report Original", price: pricing.pyaarShastra.originalPrice, formType: "pyaar-shastra" },
];

export const luckyNumerologyHub: ServiceHub = {
  id: "lucky-numerology",
  title: "Lucky Numerology",
  subtitle: "Find numerologically aligned numbers for vehicle, mobile, flat, and more.",
  category: "Personal Numerology",
  route: "/services/lucky-numerology",
  canonical: "/services/lucky-numerology",
  hubAddons: [
    { label: "Missing Number & Repeating Number Remedy", price: pricing.addons.missingNumberRemedy },
    { label: "Lucky Color & Number", price: pricing.addons.luckyColorNumber },
  ],
  packages: [
    { name: "Lucky Vehicle Number", serviceTitle: "Lucky Vehicle Number", price: pricing.luckyNumber.vehicle, formType: "lucky-vehicle" },
    { name: "Lucky Vehicle Color", serviceTitle: "Lucky Vehicle Color", price: pricing.luckyNumber.vehicleColor, formType: "lucky-vehicle-color" },
    { name: "Lucky Vehicle Purchase Date", serviceTitle: "Lucky Vehicle Purchase Date", price: pricing.luckyNumber.vehiclePurchaseDate, formType: "lucky-vehicle-date" },
    { name: "Lucky Mobile Number", serviceTitle: "Lucky Mobile Number", price: pricing.luckyNumber.mobile, formType: "lucky-mobile" },
    { name: "Lucky Flat Number", serviceTitle: "Lucky Flat / Plot Number", price: pricing.luckyNumber.flat, formType: "lucky-flat" },
  ],
};

export const businessNumerologyHub: ServiceHub = {
  id: "business-numerology",
  title: "Business & Brand Numerology",
  subtitle: "Align your business name, numbers, and dates with numerology for growth.",
  category: "Business",
  route: "/services/business-numerology",
  canonical: "/services/business-numerology",
  packages: [
    { name: "Business Name Correction", serviceTitle: "Business Name Correction", price: pricing.business.nameCorrection, formType: "business-brand", popular: true },
    { name: "Business Mobile Number", serviceTitle: "Business Mobile Number", price: pricing.business.phoneNumber, formType: "business-brand" },
    { name: "Business Tagline Analysis", serviceTitle: "Business Tagline Analysis", price: pricing.business.tagline, formType: "business-brand" },
    { name: "Company Registration Date", serviceTitle: "Company Registration Date", price: pricing.business.companyRegistration, formType: "business-dates" },
    { name: "Company Bank Account Opening Date", serviceTitle: "Company Bank Account Opening Date", price: pricing.business.bankAccount, formType: "business-dates" },
    { name: "Land Purchase Date", serviceTitle: "Land Purchase Date", price: pricing.business.landPurchase, formType: "business-dates" },
    { name: "Plot Number Analysis", serviceTitle: "Plot Number Analysis", price: pricing.business.plotAnalysis, formType: "business-property" },
    { name: "Exhibition Stall Number", serviceTitle: "Exhibition Stall Number", price: pricing.business.exhibitionStall, formType: "business-property" },
    { name: "Commercial Space Analysis", serviceTitle: "Commercial Space Analysis", price: pricing.business.commercial, formType: "business-property" },
  ],
};

export const businessPartnerPackage: CatalogPackage = {
  name: "Business Partner Compatibility",
  serviceTitle: "Business Partner Compatibility",
  price: pricing.business.partnerCompat,
  formType: "business-partner",
};

export const officeVastuPackages: CatalogPackage[] = [
  { name: "All Departmental Sitting", serviceTitle: "Departmental Sitting", price: pricing.vastu.departmental, formType: "office-vastu" },
  { name: "CEO/MD Cabin Direction & Seating", serviceTitle: "CEO/MD Cabin Sitting", price: pricing.vastu.ceoCabin, formType: "office-vastu" },
  { name: "KMP/Manager Seating Direction", serviceTitle: "Management Sitting", price: pricing.vastu.management, formType: "office-vastu" },
  { name: "Cash Counter Billing Direction", serviceTitle: "Cash Counter Direction", price: pricing.vastu.cashCounter, formType: "office-vastu" },
  { name: "Office Interior Color Consultation", serviceTitle: "Office Interior Colors", price: pricing.vastu.interiorColors, formType: "office-vastu" },
  { name: "Office Vastu Remote", serviceTitle: "Office Vastu Remote", price: pricing.vastu.officeRemote, formType: "office-vastu", popular: true },
  { name: "Office Vastu Onsite", serviceTitle: "Office Vastu Onsite", price: pricing.vastu.officeOnsite, formType: "office-vastu" },
];

export const kundli20Packages: CatalogPackage[] = [
  { name: "Single Person", serviceTitle: "Premium Personalised Kundli 2.0 Single", price: pricing.reports.kundaliSingle, originalPrice: pricing.reports.kundaliSingleOriginal, formType: "kundali", tag: "Best for Personal Analysis" },
  { name: "Double Person", serviceTitle: "Premium Personalised Kundli 2.0 Double", price: pricing.reports.kundaliDouble, originalPrice: pricing.reports.kundaliDoubleOriginal, formType: "kundali-multi", popular: true, tag: "Best for Couples" },
  { name: "Triple Person", serviceTitle: "Premium Personalised Kundli 2.0 Triple", price: pricing.reports.kundaliTriple, originalPrice: pricing.reports.kundaliTripleOriginal, formType: "kundali-multi", tag: "Best for Family" },
];

export const nameCorrectionPackages: CatalogPackage[] = [
  { name: "Name Correction", serviceTitle: "Name Correction", price: pricing.nameCorrection.standard, originalPrice: pricing.nameCorrection.standardOriginal, formType: "name-correction", popular: true },
  { name: "Name Correction + Complete Blueprint", serviceTitle: "Name Correction + Complete Blueprint", price: pricing.nameCorrection.withBlueprint, originalPrice: pricing.nameCorrection.withBlueprintOriginal, formType: "name-correction-couple" },
  { name: "Name Check", serviceTitle: "Name Check", price: pricing.nameCorrection.nameCheck, formType: "name-check" },
  { name: "Name Check 2", serviceTitle: "Name Check 2", price: pricing.nameCorrection.nameCheck2, originalPrice: pricing.nameCorrection.nameCheck2Original, formType: "name-check" },
  { name: "Name Check 3", serviceTitle: "Name Check 3", price: pricing.nameCorrection.nameCheck3, originalPrice: pricing.nameCorrection.nameCheck3Original, formType: "name-check" },
];

export const nameCorrectionHubAddons = [
  { label: "Personalised Premium Kundli 2.0", price: pricing.addons.kundli20 },
  { label: "Lucky Color & Number", price: pricing.addons.luckyColorNumber },
  { label: "Missing Number & Repeating Number Remedy", price: pricing.addons.missingNumberRemedy },
];

/** Hub pages with multiple packages on one landing page. */
export const serviceHubs = [callConsultationHub, businessNumerologyHub];

export { payLink };
