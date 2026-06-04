import { pricing } from "@/config/pricing";

export type ServicePage = {
  title: string;
  description: string;
  category: string;
  price: number;
  gst_rate: number;
  route: string;
};

/** Canonical service pages aligned with Service_Update_Doc.md */
export const existingServicePages: ServicePage[] = [
  {
    title: "1:1 Call Consultation",
    description: "Structured personal consultation with Himansshu Agarwal Ji over audio or video call.",
    category: "Consultation",
    price: pricing.audioCall.min45,
    gst_rate: 18,
    route: "/services/call-consultation",
  },
  {
    title: "Varshphal Report 2026",
    description: "A complete year-ahead numerology forecast to help you prepare for 2026 with confidence.",
    category: "Reports",
    price: pricing.reports.varshphal,
    gst_rate: 18,
    route: "/services/varshphal-report",
  },
  {
    title: "Pyaar Shaastra Report",
    description: "Unlock relationship insights with a numerology report designed for love and compatibility.",
    category: "Reports",
    price: pricing.pyaarShastra.price,
    gst_rate: 18,
    route: "/reports/pyaar-shastra",
  },
  {
    title: "Premium Personalised Kundli 2.0",
    description: "Get a personalized kundali report for compatibility, career, wealth and relationships.",
    category: "Reports",
    price: pricing.reports.kundaliSingle,
    gst_rate: 18,
    route: "/reports/personalized-kundali",
  },
  {
    title: "Name Correction",
    description: "Correct your name vibration with a personalized numerology report and guidance from Himansshu Agarwal Ji.",
    category: "Name & Numerology",
    price: pricing.nameCorrection.standard,
    gst_rate: 18,
    route: "/services/name-correction",
  },
  {
    title: "Perfect Baby Name",
    description: "Get a personalized baby name report with numerology-backed suggestions tailored for your child.",
    category: "Baby & Family",
    price: pricing.baby.perfectName,
    gst_rate: 18,
    route: "https://empower.ankshaastra.com",
  },
  {
    title: "C-Section Baby Dates",
    description: "Choose the best C-section date with numerology guidance to support your child's future.",
    category: "Baby & Family",
    price: pricing.baby.cSectionEssential,
    gst_rate: 18,
    route: "https://miraclebaby.ankshaastra.com",
  },
  {
    title: "Lucky Numerology",
    description: "Lucky vehicle, mobile, flat numbers and auspicious dates through numerology.",
    category: "Personal Numerology",
    price: pricing.luckyNumber.vehicle,
    gst_rate: 18,
    route: "/services/lucky-numerology",
  },
  {
    title: "Relationship Analysis",
    description: "Understand compatibility and relationship dynamics through numerology.",
    category: "Relationships",
    price: pricing.relationship.analysis,
    gst_rate: 18,
    route: `/payment?service=Relationship%20Analysis&amount=${pricing.relationship.analysis}&formType=relationship-analysis`,
  },
  {
    title: "Business & Brand Numerology",
    description: "Business name, tagline, dates, and property analysis through numerology.",
    category: "Business",
    price: pricing.business.nameCorrection,
    gst_rate: 18,
    route: "/services/business-numerology",
  },
  {
    title: "Business Partner Compatibility",
    description: "Analyze business partner compatibility through numerology.",
    category: "Business",
    price: pricing.business.partnerCompat,
    gst_rate: 18,
    route: `/payment?service=Business%20Partner%20Compatibility&amount=${pricing.business.partnerCompat}&formType=business-partner`,
  },
  {
    title: "Office Vastu",
    description: "Optimize your work environment with office vastu recommendations for energy, productivity and growth.",
    category: "Vastu",
    price: pricing.vastu.officeRemote,
    gst_rate: 18,
    route: "/services/office-vastu",
  },
];
