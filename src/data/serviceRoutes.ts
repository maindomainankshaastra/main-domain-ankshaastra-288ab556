/**
 * Canonical routing map: which URLs use custom multi-package pages vs quick checkout pages.
 * Used for audits, redirects, and admin sync — keep in sync with App.tsx explicit routes.
 */

export type PageKind = "packaged" | "quick" | "report" | "external" | "redirect";

export type ServiceRouteEntry = {
  slug: string;
  path: string;
  title: string;
  kind: PageKind;
  redirectTo?: string;
  packagesSource?: string;
  notes?: string;
};

/** Multi-package landing pages (custom React pages with package cards). */
export const packagedServiceRoutes: ServiceRouteEntry[] = [
  {
    slug: "call-consultation",
    path: "/consultation",
    title: "1:1 Call Consultation",
    kind: "packaged",
    packagesSource: "callConsultationHub",
    notes: "Consultation page — 6 audio/video packages → formType: consultation",
  },
  {
    slug: "name-correction",
    path: "/services/name-correction",
    title: "Name Correction",
    kind: "packaged",
    packagesSource: "nameCorrectionPackages",
    notes: "Custom page with Name Check / Correction / Blueprint cards",
  },
  {
    slug: "office-vastu",
    path: "/services/office-vastu",
    title: "Office Vastu",
    kind: "packaged",
    packagesSource: "officeVastuPackages",
    notes: "7 vastu packages → formType: office-vastu",
  },
  {
    slug: "business-numerology",
    path: "/services/business-numerology",
    title: "Business & Brand Numerology",
    kind: "packaged",
    packagesSource: "businessNumerologyHub",
    notes: "9 business packages on one hub page",
  },
];

export const reportRoutes: ServiceRouteEntry[] = [
  {
    slug: "personalized-kundali",
    path: "/reports/personalized-kundali",
    title: "Premium Personalised Kundli 2.0",
    kind: "report",
    packagesSource: "kundli20Packages",
    notes: "Single/Double/Triple → kundali / kundali-multi",
  },
  {
    slug: "varshphal-report",
    path: "/reports/varshphal-report",
    title: "Varshphal Report",
    kind: "report",
    packagesSource: "varshphalPackages",
    notes: "Single package → formType: kundali",
  },
  {
    slug: "pyaar-shastra",
    path: "/reports/pyaar-shastra",
    title: "Pyaar Shaastra Report",
    kind: "report",
    packagesSource: "pyaarShastraPackages",
    notes: "Standard + Original tiers → formType: pyaar-shastra",
  },
];

/** Single-service quick summary pages (H–M + individual business checkout pages). */
export const quickServiceSlugs = [
  "lucky-vehicle-number",
  "lucky-vehicle-color",
  "lucky-vehicle-purchase-date",
  "lucky-mobile-number",
  "lucky-flat-number",
  "relationship-analysis",
  "business-name-correction",
  "business-mobile-number",
  "business-tagline-analysis",
  "company-registration-date",
  "company-bank-account-opening-date",
  "land-purchase-date",
  "plot-number-analysis",
  "exhibition-stall-number",
  "commercial-space-analysis",
  "business-partner-compatibility",
] as const;

export const legacyRedirects: ServiceRouteEntry[] = [
  { slug: "call-consultation-legacy", path: "/services/call-consultation", title: "1:1 Call Consultation (legacy)", kind: "redirect", redirectTo: "/consultation" },
  { slug: "lucky-numerology", path: "/services/lucky-numerology", title: "Lucky Numerology (legacy)", kind: "redirect", redirectTo: "/services/lucky-vehicle-number" },
  { slug: "mobile-numerology", path: "/services/mobile-numerology", title: "Mobile Numerology (legacy)", kind: "redirect", redirectTo: "/services/lucky-mobile-number" },
  { slug: "varshphal-report-services", path: "/services/varshphal-report", title: "Varshphal (legacy path)", kind: "redirect", redirectTo: "/reports/varshphal-report" },
];

export const reservedServiceSlugs = new Set([
  ...packagedServiceRoutes.map((r) => r.slug),
  "csection-dates",
  "baby-name",
]);

export const isQuickServiceSlug = (slug: string) =>
  (quickServiceSlugs as readonly string[]).includes(slug);
