import { pricing } from "@/config/pricing";

export type ServicePage = {
  title: string;
  description: string;
  category: string;
  price: number;
  gst_rate: number;
  route: string;
};

export const existingServicePages: ServicePage[] = [
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
    route: "/services/baby-name",
  },
  {
    title: "C-Section Baby Dates",
    description: "Choose the best C-section date with numerology guidance to support your child's future.",
    category: "Baby & Family",
    price: pricing.baby.cSectionEssential,
    gst_rate: 18,
    route: "/services/csection-dates",
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
    title: "Mobile Numerology",
    description: "Audit your mobile number for vibration, luck, and compatibility with your numerology profile.",
    category: "Numerology",
    price: pricing.mobile.audit,
    gst_rate: 18,
    route: "/services/mobile-numerology",
  },
  {
    title: "Office Vastu",
    description: "Optimize your work environment with office vastu recommendations for energy, productivity and growth.",
    category: "Vastu",
    price: pricing.vastu.management,
    gst_rate: 18,
    route: "/services/office-vastu",
  },
  {
    title: "Personalized Kundali",
    description: "Get a personalized kundali report for compatibility, career, wealth and relationships.",
    category: "Reports",
    price: pricing.reports.kundaliSingle,
    gst_rate: 18,
    route: "/reports/personalized-kundali",
  },
  {
    title: "Pyaar Shaastra Report",
    description: "Unlock relationship insights with a numerology report designed for love and compatibility.",
    category: "Reports",
    price: pricing.pyaarShastra.price,
    gst_rate: 18,
    route: "/reports/pyaar-shastra",
  },
];
