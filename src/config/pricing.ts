/**
 * Centralized pricing configuration.
 *
 * All values are sourced from Vite environment variables (VITE_ prefix) so
 * non-developers can update prices via the Vercel dashboard without code
 * changes. Each value falls back to a safe default if the env var is missing.
 *
 * Add a new entry here once, then reference it from any component:
 *   import { pricing, formatINR } from "@/config/pricing";
 *   <span>{formatINR(pricing.kundali.single)}</span>
 */

const num = (value: string | undefined, fallback: number): number => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const env = import.meta.env;

export const pricing = {
  // ── Consultation: Audio ──
  audioCall: {
    min45: num(env.VITE_AUDIO_45, 3998),
    min60: num(env.VITE_AUDIO_60, 4997),
    min75: num(env.VITE_AUDIO_75, 5997),
  },
  // ── Consultation: Video ──
  videoCall: {
    min45: num(env.VITE_VIDEO_45, 5997),
    min60: num(env.VITE_VIDEO_60, 7497),
    min75: num(env.VITE_VIDEO_75, 8997),
  },
  // ── Payment page: short audio packs ──
  audioPack: {
    min45: num(env.VITE_AUDIO_PACK_45, 1987),
    min60: num(env.VITE_AUDIO_PACK_60, 2496),
    min75: num(env.VITE_AUDIO_PACK_75, 3108),
  },
  // ── Payment page: short video packs ──
  videoPack: {
    min45: num(env.VITE_VIDEO_PACK_45, 3648),
    min60: num(env.VITE_VIDEO_PACK_60, 4297),
    min75: num(env.VITE_VIDEO_PACK_75, 4986),
  },
  // ── WhatsApp question packs ──
  whatsapp: {
    q3: num(env.VITE_WHATSAPP_3, 497),
    q6: num(env.VITE_WHATSAPP_6, 777),
    q10: num(env.VITE_WHATSAPP_10, 1111),
  },
  // ── Personal numerology ──
  nameCorrection: {
    standard: num(env.VITE_NAME_CORRECTION, 2447),
    nameCheck: num(env.VITE_NAME_CHECK, 293),
  },
  luckyNumber: {
    vehicle: num(env.VITE_LUCKY_VEHICLE, 1100),
    mobile: num(env.VITE_LUCKY_MOBILE, 1100),
    flat: num(env.VITE_LUCKY_FLAT, 1100),
  },
  // ── Family ──
  baby: {
    cSectionEssential: num(env.VITE_C_SECTION_ESSENTIAL, 1100),
    cSectionPremium: num(env.VITE_C_SECTION_PREMIUM, 4987),
    perfectName: num(env.VITE_BABY_NAME, 1997),
    perfectNameOriginal: num(env.VITE_BABY_NAME_ORIGINAL, 5100),
  },
  relationship: {
    analysis: num(env.VITE_RELATIONSHIP_ANALYSIS, 987),
  },
  // ── Reports ──
  reports: {
    kundaliSingle: num(env.VITE_KUNDALI_SINGLE, 699),
    kundaliDouble: num(env.VITE_KUNDALI_DOUBLE, 1199),
    kundaliTriple: num(env.VITE_KUNDALI_TRIPLE, 1599),
    varshphal: num(env.VITE_VARSHPHAL, 699),
  },
  // ── Business & brand ──
  business: {
    nameCorrection: num(env.VITE_BUSINESS_NAME_CORRECTION, 4894),
    phoneNumber: num(env.VITE_BUSINESS_PHONE, 1499),
    tagline: num(env.VITE_BUSINESS_TAGLINE, 1997),
    partnerCompat: num(env.VITE_BUSINESS_PARTNER, 1997),
    directorCompat: num(env.VITE_BUSINESS_DIRECTOR, 1997),
  },
  // ── Auspicious dates ──
  dates: {
    companyRegistration: num(env.VITE_DATE_COMPANY_REG, 1997),
    bankAccount: num(env.VITE_DATE_BANK_ACCOUNT, 1997),
    landPurchase: num(env.VITE_DATE_LAND_PURCHASE, 1997),
  },
  // ── Vastu ──
  vastu: {
    ceoCabin: num(env.VITE_VASTU_CEO, 2499),
    management: num(env.VITE_VASTU_MANAGEMENT, 1997),
    cashCounter: num(env.VITE_VASTU_CASH, 1997),
    interiorColors: num(env.VITE_VASTU_COLORS, 1997),
    departmental: num(env.VITE_VASTU_DEPARTMENTAL, 4998),
    officeRemote: num(env.VITE_VASTU_OFFICE_REMOTE, 3999),
    officeOnsite: num(env.VITE_VASTU_OFFICE_ONSITE, 11000),
  },
  // ── Property ──
  property: {
    plotAnalysis: num(env.VITE_PROPERTY_PLOT, 1499),
    exhibitionStall: num(env.VITE_PROPERTY_STALL, 999),
    commercial: num(env.VITE_PROPERTY_COMMERCIAL, 2499),
  },
  // ── Shop products ──
  shop: {
    blueSapphire: num(env.VITE_SHOP_BLUE_SAPPHIRE, 15999),
    blueSapphireOriginal: num(env.VITE_SHOP_BLUE_SAPPHIRE_ORIGINAL, 19999),
    sriYantra: num(env.VITE_SHOP_SRI_YANTRA, 2499),
    sriYantraOriginal: num(env.VITE_SHOP_SRI_YANTRA_ORIGINAL, 3499),
    pearl: num(env.VITE_SHOP_PEARL, 4999),
    pearlOriginal: num(env.VITE_SHOP_PEARL_ORIGINAL, 6999),
    rudraksha: num(env.VITE_SHOP_RUDRAKSHA, 1999),
    rudrakshaOriginal: num(env.VITE_SHOP_RUDRAKSHA_ORIGINAL, 2499),
    navratna: num(env.VITE_SHOP_NAVRATNA, 24999),
    navratnaOriginal: num(env.VITE_SHOP_NAVRATNA_ORIGINAL, 29999),
    vedicBook: num(env.VITE_SHOP_VEDIC_BOOK, 999),
    vedicBookOriginal: num(env.VITE_SHOP_VEDIC_BOOK_ORIGINAL, 1299),
    yellowSapphire: num(env.VITE_SHOP_YELLOW_SAPPHIRE, 12999),
    yellowSapphireOriginal: num(env.VITE_SHOP_YELLOW_SAPPHIRE_ORIGINAL, 15999),
    lakshmiYantra: num(env.VITE_SHOP_LAKSHMI_YANTRA, 1999),
    lakshmiYantraOriginal: num(env.VITE_SHOP_LAKSHMI_YANTRA_ORIGINAL, 2999),
    freeShippingThreshold: num(env.VITE_SHOP_FREE_SHIPPING, 999),
  },
} as const;

/** Format a numeric price as Indian Rupees, e.g. 1997 → "₹1,997". */
export const formatINR = (value: number): string =>
  `₹${value.toLocaleString("en-IN")}`;

export type Pricing = typeof pricing;