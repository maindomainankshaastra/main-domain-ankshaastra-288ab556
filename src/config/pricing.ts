/**
 * Centralized pricing configuration.
 * Admin catalog in Supabase should mirror these values.
 * Source of truth: Service_Update_Doc.md
 */

export const pricing = {
  audioCall: { min45: 3977, min60: 4967, min75: 5957 },
  videoCall: { min45: 5957, min60: 7397, min75: 8927 },
  /** Legacy consultation channel — not in public service catalog */
  whatsapp: { q3: 497, q6: 777, q10: 1111 },
  addons: {
    kundli20: 299,
    luckyColorNumber: 497,
    shubhMuhrat: 497,
    missingNumberRemedy: 917,
    nickName: 497,
    extraNames: 497,
  },
  nameCorrection: {
    standard: 2447,
    standardOriginal: 7500,
    withBlueprint: 7397,
    withBlueprintOriginal: 10076,
    nameCheck: 293,
    nameCheck2: 528,
    nameCheck2Original: 586,
    nameCheck3: 747,
    nameCheck3Original: 879,
  },
  luckyNumber: {
    vehicle: 1097,
    vehicleColor: 497,
    vehiclePurchaseDate: 1097,
    mobile: 1097,
    flat: 1097,
  },
  baby: {
    perfectName: 2447,
    perfectNameOriginal: 7500,
    blueprint: 4967,
    blueprintOriginal: 15051,
    cSectionEssential: 1097,
    cSectionComplete: 3167,
    cSectionPremium: 5507,
  },
  relationship: { analysis: 917 },
  pyaarShastra: { price: 299, originalPrice: 699, kundaliAddon: 299 },
  reports: {
    kundaliSingle: 299,
    kundaliSingleOriginal: 699,
    kundaliDouble: 497,
    kundaliDoubleOriginal: 1200,
    kundaliTriple: 597,
    kundaliTripleOriginal: 1800,
    varshphal: 699,
  },
  business: {
    nameCorrection: 4967,
    phoneNumber: 1457,
    tagline: 1457,
    partnerCompat: 1997,
    companyRegistration: 1997,
    bankAccount: 1997,
    landPurchase: 1997,
    plotAnalysis: 1457,
    exhibitionStall: 917,
    commercial: 2447,
  },
  vastu: {
    departmental: 4987,
    ceoCabin: 2447,
    management: 1997,
    cashCounter: 1997,
    interiorColors: 1997,
    officeRemote: 3977,
    officeOnsite: 9987,
  },
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

export const formatINR = (value: number): string =>
  `₹${value.toLocaleString("en-IN")}`;

export type Pricing = typeof pricing;

/** Build payment URL with service title, amount, and form type. */
export const payLink = (service: string, amount: number, formType?: string) => {
  const params = new URLSearchParams({
    service,
    amount: String(amount),
  });
  if (formType) params.set("formType", formType);
  return `/payment?${params.toString()}`;
};
