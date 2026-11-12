


// /**
//  * Which package did the customer buy, and how many name slots does the report get?
//  *
//  *   Perfect Baby Name Report (Rs 3437), no add-on ........ 12 names  (report page 9 only)
//  *   Complete Baby Name Blueprint (Rs 5957), no add-on .... 24 names  (pages 9 + 10)
//  *   Complete Baby Name Blueprint + "10+ extra names" ..... 32 names  (pages 9 + 10 + 11)
//  *
//  * The client did not say what Perfect Baby Name + extra names should give: it falls back to 24 (change
//  * PERFECT_WITH_EXTRA_NAMES below if the client wants something else).
//  *
//  * Orders store the package in metadata.formSnapshot.packageType ("single" = Perfect, "premium" = Blueprint),
//  * the add-ons inside nameOptions as "[ADD-ON: +10 names (Rs 737)]", and the money in total_amount.
//  */

// export type PackageTier = "perfect" | "blueprint";

// export interface PackageChoice {
//   tier: PackageTier;
//   /** "10+ extra numerologically aligned names" add-on (Rs 737). */
//   extraNames: boolean;
// }

// export const PACKAGE_PRICE: Record<PackageTier, number> = { perfect: 3437, blueprint: 5957 };
// export const EXTRA_NAMES_PRICE = 737;
// export const NICKNAME_PRICE = 737;

// export const NAMES_PER_PAGE = [12, 12, 8] as const; // report pages 9, 10, 11
// const PERFECT_WITH_EXTRA_NAMES = 24;

// export function nameSlots(p: PackageChoice): number {
//   if (p.tier === "blueprint") return p.extraNames ? 32 : 24;
//   return p.extraNames ? PERFECT_WITH_EXTRA_NAMES : 12;
// }

// /** How many of the three "New Name Suggestions" pages (9, 10, 11) are kept. */
// export function namePageCount(slots: number): 1 | 2 | 3 {
//   return slots <= 12 ? 1 : slots <= 24 ? 2 : 3;
// }

// export interface DetectedOrder {
//   choice: PackageChoice | null;
//   amount: number | null;
//   /** Why the guess was made, shown to the operator. */
//   note: string;
// }

// const flat = (v: unknown): string => {
//   try { return typeof v === "string" ? v : JSON.stringify(v ?? ""); } catch { return ""; }
// };

// export function detectPackage(order: Record<string, any>): DetectedOrder {
//   const meta = (order.metadata ?? {}) as Record<string, any>;
//   const snap = (meta.formSnapshot ?? meta) as Record<string, any>;
//   const amount = Number(order.total_amount ?? order.amount ?? NaN);
//   const title = `${order.service_title ?? ""} ${snap.packageName ?? ""} ${snap.packageType ?? ""}`.toLowerCase();

//   let tier: PackageTier | null = null;
//   let how = "";
//   if (/complete.*blueprint|blueprint/.test(title) || snap.packageType === "premium") { tier = "blueprint"; how = "package name"; }
//   else if (/perfect.*baby|baby.*name.*report/.test(title) || snap.packageType === "single") { tier = "perfect"; how = "package name"; }
//   else if ([5957, 6694, 7431].includes(amount)) { tier = "blueprint"; how = `amount ${amount}`; }
//   else if ([3437, 4174, 4911].includes(amount)) { tier = "perfect"; how = `amount ${amount}`; }
//   if (!tier) return { choice: null, amount: Number.isFinite(amount) ? amount : null, note: "Package not recognised, choose it manually." };

//   const addonText = `${flat(snap.nameOptions)} ${flat(snap.addons)} ${flat(snap.addOns)}`;
//   const extraNames = /\+?\s*10\+?\s*(extra\s*)?(numerologically\s*aligned\s*)?names|extra\s*names/i.test(addonText);
//   return {
//     choice: { tier, extraNames },
//     amount: Number.isFinite(amount) ? amount : null,
//     note: `${tier === "blueprint" ? "Complete Baby Name Blueprint" : "Perfect Baby Name Report"} (${how})${extraNames ? ", +10 extra names add-on" : ""}`,
//   };
// }

// /** Pulls the birth details out of an order's form snapshot so the operator does not retype them. */
// export interface OrderPrefill {
//   dob?: string;          // yyyy-mm-dd
//   time?: string;         // HH:mm
//   place?: string;
//   gender?: "boy" | "girl";
//   middleName?: string;
//   middleIsFather?: boolean;
//   lastName?: string;
//   phone?: string;
//   customerName?: string;
// }

// const toIso = (v: unknown): string | undefined => {
//   const s = String(v ?? "").trim();
//   let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
//   if (m) return `${m[1]}-${m[2]}-${m[3]}`;
//   m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/.exec(s);
//   return m ? `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` : undefined;
// };
// const toTime24 = (v: unknown): string | undefined => {
//   const m = /^(\d{1,2}):(\d{2})\s*(am|pm)?/i.exec(String(v ?? "").trim());
//   if (!m) return undefined;
//   let h = Number(m[1]);
//   if (m[3]) { const pm = m[3].toLowerCase() === "pm"; if (pm && h < 12) h += 12; if (!pm && h === 12) h = 0; }
//   return `${String(h).padStart(2, "0")}:${m[2]}`;
// };
// const yes = (v: unknown) => /^(yes|y|true|1)$/i.test(String(v ?? "").trim());

// export function prefillFromOrder(order: Record<string, any>): OrderPrefill {
//   const meta = (order.metadata ?? {}) as Record<string, any>;
//   const s = (meta.formSnapshot ?? meta) as Record<string, any>;
//   const g = String(s.gender ?? "").toLowerCase();
//   const place = [s.placeOfBirth ?? s.city, s.pinCode ?? s.pincode].filter(Boolean).join(", ");
//   return {
//     dob: toIso(s.childDob ?? s.dob),
//     time: toTime24(s.timeOfBirth),
//     place: place || undefined,
//     gender: /^(f|girl|female)/.test(g) ? "girl" : /^(m|boy|male)/.test(g) ? "boy" : undefined,
//     middleName: s.childMiddleName ? String(s.childMiddleName) : undefined,
//     middleIsFather: s.fatherFirstNameAsMiddleName !== undefined ? yes(s.fatherFirstNameAsMiddleName) : undefined,
//     lastName: s.childLastName ? String(s.childLastName) : undefined,
//     phone: s.mobileNumber ?? s.mobile ?? s.phone ?? order.customer_phone,
//     customerName: String(order.customer_name ?? s.fullName ?? s.customerName ?? s.name ?? "").trim() || undefined,
//   };
// }

// export function orderMatchesPhone(order: Record<string, any>, phone: string): boolean {
//   const digits = phone.replace(/\D/g, "").slice(-10);
//   if (digits.length < 10) return false;
//   return flat(order).replace(/\D/g, "").includes(digits);
// }


/**
 * Which package did the customer buy, and how many name slots does the report get?
 *
 *   Perfect Baby Name Report (Rs 3437), no add-on ........ 12 names  (report page 9 only)
 *   Complete Baby Name Blueprint (Rs 5957), no add-on .... 24 names  (pages 9 + 10)
 *   Complete Baby Name Blueprint + "10+ extra names" ..... 32 names  (pages 9 + 10 + 11)
 *
 * The client did not say what Perfect Baby Name + extra names should give: it falls back to 24 (change
 * PERFECT_WITH_EXTRA_NAMES below if the client wants something else).
 *
 * Orders store the package in metadata.formSnapshot.packageType ("single" = Perfect, "premium" = Blueprint),
 * the add-ons inside nameOptions as "[ADD-ON: +10 names (Rs 737)]", and the money in total_amount.
 */

export type PackageTier = "perfect" | "blueprint";

export interface PackageChoice {
  tier: PackageTier;
  /** "10+ extra numerologically aligned names" add-on (Rs 737). */
  extraNames: boolean;
}

export const PACKAGE_PRICE: Record<PackageTier, number> = { perfect: 3437, blueprint: 5957 };
export const EXTRA_NAMES_PRICE = 737;
export const NICKNAME_PRICE = 737;

export const NAMES_PER_PAGE = [12, 12, 8] as const; // report pages 9, 10, 11
const PERFECT_WITH_EXTRA_NAMES = 24;

export function nameSlots(p: PackageChoice): number {
  if (p.tier === "blueprint") return p.extraNames ? 32 : 24;
  return p.extraNames ? PERFECT_WITH_EXTRA_NAMES : 12;
}

/** How many of the three "New Name Suggestions" pages (9, 10, 11) are kept. */
export function namePageCount(slots: number): 1 | 2 | 3 {
  return slots <= 12 ? 1 : slots <= 24 ? 2 : 3;
}

export interface DetectedOrder {
  choice: PackageChoice | null;
  amount: number | null;
  /** Why the guess was made, shown to the operator. */
  note: string;
}

const flat = (v: unknown): string => {
  try { return typeof v === "string" ? v : JSON.stringify(v ?? ""); } catch { return ""; }
};

export function detectPackage(order: Record<string, any>): DetectedOrder {
  const meta = (order.metadata ?? {}) as Record<string, any>;
  const snap = (meta.formSnapshot ?? meta) as Record<string, any>;
  const amount = Number(order.total_amount ?? order.amount ?? NaN);
  const title = `${order.service_title ?? ""} ${snap.packageName ?? ""} ${snap.packageType ?? ""}`.toLowerCase();

  let tier: PackageTier | null = null;
  let how = "";
  if (/complete.*blueprint|blueprint/.test(title) || snap.packageType === "premium") { tier = "blueprint"; how = "package name"; }
  else if (/perfect.*baby|baby.*name.*report/.test(title) || snap.packageType === "single") { tier = "perfect"; how = "package name"; }
  else if ([5957, 6694, 7431].includes(amount)) { tier = "blueprint"; how = `amount ${amount}`; }
  else if ([3437, 4174, 4911].includes(amount)) { tier = "perfect"; how = `amount ${amount}`; }
  if (!tier) return { choice: null, amount: Number.isFinite(amount) ? amount : null, note: "Package not recognised, choose it manually." };

  const addonText = `${flat(snap.nameOptions)} ${flat(snap.addons)} ${flat(snap.addOns)}`;
  const extraNames = /\+?\s*10\+?\s*(extra\s*)?(numerologically\s*aligned\s*)?names|extra\s*names/i.test(addonText);
  return {
    choice: { tier, extraNames },
    amount: Number.isFinite(amount) ? amount : null,
    note: `${tier === "blueprint" ? "Complete Baby Name Blueprint" : "Perfect Baby Name Report"} (${how})${extraNames ? ", +10 extra names add-on" : ""}`,
  };
}

/** Pulls the birth details out of an order's form snapshot so the operator does not retype them. */
export interface OrderPrefill {
  dob?: string;          // yyyy-mm-dd
  time?: string;         // HH:mm
  place?: string;
  gender?: "boy" | "girl";
  middleName?: string;
  middleIsFather?: boolean;
  lastName?: string;
  phone?: string;
  customerName?: string;
  email?: string;
  /** Name style + notes the customer typed in the order, ready for the name generator's preference box. */
  preference?: string;
}

const toIso = (v: unknown): string | undefined => {
  const s = String(v ?? "").trim();
  let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/.exec(s);
  return m ? `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` : undefined;
};
const toTime24 = (v: unknown): string | undefined => {
  const m = /^(\d{1,2}):(\d{2})\s*(am|pm)?/i.exec(String(v ?? "").trim());
  if (!m) return undefined;
  let h = Number(m[1]);
  if (m[3]) { const pm = m[3].toLowerCase() === "pm"; if (pm && h < 12) h += 12; if (!pm && h === 12) h = 0; }
  return `${String(h).padStart(2, "0")}:${m[2]}`;
};
const yes = (v: unknown) => /^(yes|y|true|1)$/i.test(String(v ?? "").trim());

/** "[NAME STYLE: Mix of All] [NOTES: ...]" -> "Style: Mix of All. Notes: ..." (add-on tags dropped, capped at 400 chars). */
export function preferenceFromNameOptions(raw: unknown): string | undefined {
  const t = String(raw ?? "").replace(/\[ADD-ON:[^\]]*\]/gi, "");
  const style = /\[NAME STYLE:\s*([^\]]*)\]/i.exec(t)?.[1]?.trim();
  const notes = /\[NOTES:\s*([\s\S]*)\]\s*$/i.exec(t.trim())?.[1]?.replace(/\s+/g, " ").trim();
  const out = [style ? `Style: ${style}.` : "", notes ? `Notes: ${notes}` : ""].filter(Boolean).join(" ");
  return out ? out.slice(0, 400) : undefined;
}

/** Place as the customer would say it: city + state (no PIN code), without repeating the same word twice. */
function placeText(s: Record<string, any>): string {
  const parts: string[] = [];
  for (const v of [s.placeOfBirth ?? s.city, s.state]) {
    const t = String(v ?? "").trim();
    if (t && !parts.some((x) => x.toLowerCase() === t.toLowerCase())) parts.push(t);
  }
  return parts.join(", ");
}

export function prefillFromOrder(order: Record<string, any>): OrderPrefill {
  const meta = (order.metadata ?? {}) as Record<string, any>;
  const s = (meta.formSnapshot ?? meta) as Record<string, any>;
  const g = String(s.gender ?? "").toLowerCase();
  const place = placeText(s);
  return {
    dob: toIso(s.childDob ?? s.dob),
    time: toTime24(s.timeOfBirth),
    place: place || undefined,
    gender: /^(f|girl|female)/.test(g) ? "girl" : /^(m|boy|male)/.test(g) ? "boy" : undefined,
    middleName: s.childMiddleName ? String(s.childMiddleName) : undefined,
    middleIsFather: s.fatherFirstNameAsMiddleName !== undefined ? yes(s.fatherFirstNameAsMiddleName) : undefined,
    lastName: s.childLastName ? String(s.childLastName) : undefined,
    phone: s.mobileNumber ?? s.mobile ?? s.phone ?? order.customer_phone,
    customerName: String(order.customer_name ?? s.fullName ?? s.customerName ?? s.name ?? "").trim() || undefined,
    email: s.email ? String(s.email) : undefined,
    preference: preferenceFromNameOptions(s.nameOptions),
  };
}

export function orderMatchesPhone(order: Record<string, any>, phone: string): boolean {
  const digits = phone.replace(/\D/g, "").slice(-10);
  if (digits.length < 10) return false;
  return flat(order).replace(/\D/g, "").includes(digits);
}
