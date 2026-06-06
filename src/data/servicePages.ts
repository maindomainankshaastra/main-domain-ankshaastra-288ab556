import { pricing } from "@/config/pricing";
import { standaloneServices } from "@/data/standaloneServices";

export type ServicePage = {
  title: string;
  description: string;
  category: string;
  price: number;
  gst_rate: number;
  route: string;
};

const hubPages: ServicePage[] = [
  {
    title: "1:1 Call Consultation",
    description: "Structured personal consultation with Himansshu Agarwal Ji over audio or video call.",
    category: "Consultation",
    price: pricing.audioCall.min45,
    gst_rate: 18,
    route: "/consultation",
  },
  {
    title: "Premium Personalised Kundli 2.0",
    description: "Get a personalized kundali report for compatibility, career, wealth and relationships.",
    category: "Services",
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
    title: "C-Section Dates",
    description: "Choose the best C-section date with numerology guidance to support your child's future.",
    category: "Baby & Family",
    price: pricing.baby.cSectionEssential,
    gst_rate: 18,
    route: "https://miraclebaby.ankshaastra.com",
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

const reportPages: ServicePage[] = [
  {
    title: "Varshphal Report",
    description: "A complete year-ahead numerology forecast to help you prepare for 2026 with confidence.",
    category: "Reports",
    price: pricing.reports.varshphal,
    gst_rate: 18,
    route: "/reports/varshphal-report",
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

const standalonePages: ServicePage[] = standaloneServices.map((s) => ({
  title: s.title,
  description: s.description,
  category: s.category,
  price: s.price,
  gst_rate: 18,
  route: s.route,
}));

/** Canonical pages for admin seed hints and catalog sync. */
export const existingServicePages: ServicePage[] = [
  ...hubPages,
  ...standalonePages,
  ...reportPages,
];
