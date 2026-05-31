/**
 * Centralized pricing configuration.
 *
 * This pricing object now uses fixed application defaults rather than
 * runtime environment variables. Pricing values should be managed through
 * the admin catalog and product tables in Supabase.
 *
 * Add a new entry here once, then reference it from any component:
 *   import { pricing, formatINR } from "@/config/pricing";
 *   <span>{formatINR(pricing.kundaliSingle)}</span>
 */

export const pricing = {
  // ── Consultation: Audio ──
  audioCall: {
    min45: 3998,
    min60: 4997,
    min75: 5997,
  },
  // ── Consultation: Video ──
  videoCall: {
    min45: 5997,
    min60: 7497,
    min75: 8997,
  },
  // ── Payment page: short audio packs ──
  audioPack: {
    min45: 1987,
    min60: 2496,
    min75: 3108,
  },
  // ── Payment page: short video packs ──
  videoPack: {
    min45: 3648,
    min60: 4297,
    min75: 4986,
  },
  // ── WhatsApp question packs ──
  whatsapp: {
    q3: 497,
    q6: 777,
    q10: 1111,
  },
  // ── Personal numerology ──
  nameCorrection: {
    standard: 2447,
    standardOriginal: 7500,
    nameCheck: 293,
    blueprintBasic: 1997,
    blueprintBasicOriginal: 3999,
    blueprintPremium: 8927,
    blueprintPremiumOriginal: 18218,
  },
  luckyNumber: {
    vehicle: 1100,
    mobile: 1100,
    flat: 1100,
  },
  // ── Family ──
  baby: {
    cSectionEssential: 1100,
    cSectionPremium: 4987,
    perfectName: 1997,
    perfectNameOriginal: 5100,
  },
  relationship: {
    analysis: 987,
  },
  // ── Pyaar Shastra (love & life compatibility) ──
  pyaarShastra: {
    price: 299,
    originalPrice: 699,
    kundaliAddon: 299,
  },
  // ── Reports ──
  reports: {
    kundaliSingle: 299,
    kundaliSingleOriginal: 699,
    kundaliDouble: 547,
    kundaliDoubleOriginal: 1200,
    kundaliTriple: 737,
    kundaliTripleOriginal: 1800,
    varshphal: 699,
    numerology: 1999,
    numerologyOriginal: 2499,
  },
  // ── Business & brand ──
  business: {
    nameCorrection: 4894,
    phoneNumber: 1499,
    tagline: 1997,
    partnerCompat: 1997,
    directorCompat: 1997,
  },
  // ── Auspicious dates ──
  dates: {
    companyRegistration: 1997,
    bankAccount: 1997,
    landPurchase: 1997,
  },
  // ── Vastu ──
  vastu: {
    ceoCabin: 2499,
    management: 1997,
    cashCounter: 1997,
    interiorColors: 1997,
    departmental: 4998,
    officeRemote: 3999,
    officeOnsite: 11000,
  },
  // ── Property ──
  property: {
    plotAnalysis: 1499,
    exhibitionStall: 999,
    commercial: 2499,
  },
  // ── Mobile numerology page ──
  mobile: {
    audit: 1097,
    auditOriginal: 2500,
    premium: 1097,
    premiumOriginal: 4500,
  },
  // ── Shop products ──
  shop: {
    blueSapphire: 15999,
    blueSapphireOriginal: 19999,
    sriYantra: 2499,
    sriYantraOriginal: 3499,
    pearl: 4999,
    pearlOriginal: 6999,
    rudraksha: 1999,
    rudrakshaOriginal: 2499,
    navratna: 24999,
    navratnaOriginal: 29999,
    vedicBook: 999,
    vedicBookOriginal: 1299,
    yellowSapphire: 12999,
    yellowSapphireOriginal: 15999,
    lakshmiYantra: 1999,
    lakshmiYantraOriginal: 2999,
    freeShippingThreshold: 999,
  },
} as const;

/** Format a numeric price as Indian Rupees, e.g. 1997 → "₹1,997". */
export const formatINR = (value: number): string =>
  `₹${value.toLocaleString("en-IN")}`;

export type Pricing = typeof pricing;