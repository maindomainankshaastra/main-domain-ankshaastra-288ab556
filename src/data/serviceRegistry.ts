import { pricing } from "@/config/pricing";
import { standaloneServices, type StandaloneService } from "@/data/standaloneServices";

export type CatalogListingItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  route: string;
  listingType: "service" | "report";
  external?: boolean;
};

const hubListings: CatalogListingItem[] = [
  {
    id: "call-consultation",
    title: "1:1 Call Consultation",
    description: "Structured personal consultation with Himansshu Agarwal Ji over audio or video call.",
    category: "Consultation",
    price: pricing.audioCall.min45,
    route: "/services/call-consultation",
    listingType: "service",
  },
  {
    id: "kundli-20",
    title: "Premium Personalised Kundli 2.0",
    description: "Personalized kundli for career, marriage, wealth, and remedies.",
    category: "Services",
    price: pricing.reports.kundaliSingle,
    route: "/reports/personalized-kundali",
    listingType: "service",
  },
  {
    id: "name-correction",
    title: "Name Correction",
    description: "Correct your name vibration with expert numerology guidance.",
    category: "Name & Numerology",
    price: pricing.nameCorrection.standard,
    route: "/services/name-correction",
    listingType: "service",
  },
  {
    id: "perfect-baby-name",
    title: "Perfect Baby Name",
    description: "Numerology-based auspicious baby naming.",
    category: "Baby & Family",
    price: pricing.baby.perfectName,
    route: "https://empower.ankshaastra.com",
    listingType: "service",
    external: true,
  },
  {
    id: "c-section-dates",
    title: "C-Section Dates",
    description: "Choose auspicious C-section dates with numerology guidance.",
    category: "Baby & Family",
    price: pricing.baby.cSectionEssential,
    route: "https://miraclebaby.ankshaastra.com",
    listingType: "service",
    external: true,
  },
  {
    id: "office-vastu",
    title: "Office Vastu",
    description: "Remote and onsite office vastu packages for workspace harmony.",
    category: "Vastu",
    price: pricing.vastu.officeRemote,
    route: "/services/office-vastu",
    listingType: "service",
  },
];

const reportListings: CatalogListingItem[] = [
  {
    id: "varshphal",
    title: "Varshphal Report",
    description: "Complete year-ahead numerology forecast for 2026.",
    category: "Reports",
    price: pricing.reports.varshphal,
    route: "/reports/varshphal-report",
    listingType: "report",
  },
  {
    id: "pyaar-shaastra",
    title: "Pyaar Shaastra Report",
    description: "Love and life quality compatibility numerology report.",
    category: "Reports",
    price: pricing.pyaarShastra.price,
    route: "/reports/pyaar-shastra",
    listingType: "report",
  },
];

const standaloneToListing = (s: StandaloneService): CatalogListingItem => ({
  id: s.slug,
  title: s.title,
  description: s.description,
  category: s.category,
  price: s.price,
  route: s.route,
  listingType: s.listingType,
});

export const servicesCatalogListings: CatalogListingItem[] = [
  ...hubListings,
  ...standaloneServices.filter((s) => s.listingType === "service").map(standaloneToListing),
];

export const reportsCatalogListings: CatalogListingItem[] = reportListings;

export const allCatalogListings: CatalogListingItem[] = [
  ...servicesCatalogListings,
  ...reportsCatalogListings,
];

export const getListingRoute = (title: string): string | undefined =>
  allCatalogListings.find((l) => l.title.toLowerCase() === title.toLowerCase())?.route;
