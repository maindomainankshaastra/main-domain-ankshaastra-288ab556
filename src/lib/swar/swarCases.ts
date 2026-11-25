

// /**
//  * Swar Calculator cases + status.
//  *
//  *   new -> swar_shared -> names_shared -> confirmation_received -> report_shared
//  *
//  * AUTOMATIC: the tool only ever moves a case forward (a later step is never pushed back by accident).
//  * MANUAL: the operator can set any status, forwards or backwards, from the dropdown.
//  * Note: a WhatsApp link only opens the chat; the tool cannot know the message was really sent,
//  * which is why the manual dropdown exists.
//  */

// export type CaseStatus = "new" | "swar_shared" | "names_shared" | "confirmation_received" | "report_shared";

// export const STATUS_ORDER: CaseStatus[] = ["new", "swar_shared", "names_shared", "confirmation_received", "report_shared"];

// export const STATUS_META: Record<CaseStatus, { label: string; badge: string; dot: string }> = {
//   new: { label: "New", badge: "bg-gray-100 text-gray-700 border-gray-300", dot: "bg-gray-400" },
//   swar_shared: { label: "Swar Alphabet Shared", badge: "bg-blue-100 text-blue-800 border-blue-300", dot: "bg-blue-500" },
//   names_shared: { label: "Names PDF Shared", badge: "bg-orange-100 text-orange-800 border-orange-300", dot: "bg-orange-500" },
//   confirmation_received: { label: "Final Confirmation Received", badge: "bg-purple-100 text-purple-800 border-purple-300", dot: "bg-purple-500" },
//   report_shared: { label: "Final Report Shared", badge: "bg-green-100 text-green-800 border-green-300", dot: "bg-green-500" },
// };

// export const statusRank = (s: CaseStatus) => STATUS_ORDER.indexOf(s);
// export const isStatus = (v: unknown): v is CaseStatus => STATUS_ORDER.includes(v as CaseStatus);

// export interface HistoryEntry { status: CaseStatus; at: string; by: "auto" | "manual" }

// export interface SwarCaseRow {
//   id: string;
//   created_at: string;
//   updated_at: string;
//   order_id: string | null;
//   customer_name: string | null;
//   phone: string | null;
//   dob: string | null;
//   package_label: string | null;
//   status: CaseStatus;
//   status_history: HistoryEntry[];
//   data: Record<string, any>;
// }

// /** Everything needed to re-open a case in the tool. */
// export interface CaseSnapshot {
//   dob: string; time: string; place: string; tz: string; phone: string; customerName: string;
//   swarText: string; altText: string;
//   gender: string; surname: string; middle: string; middleNotFather: boolean; preference: string;
//   pkg: { tier: "perfect" | "blueprint"; extraNames: boolean };
//   starts: string; number: string;
//     /** Optional nick name the customer wants (Step 4); fills the report's Nick Name field. */
//   nickName?: string;
//   /** Total AI usage for the names of this case (every generate / replace adds to it). */
//   namesStats?: { rounds: number; rejected: number; inputTokens: number; outputTokens: number; costUsd: number; model: string };
// }

// export const phoneDigits = (p: string) => p.replace(/\D/g, "").slice(-10);

// /** Decide the new status. Auto never moves a case backwards; manual always applies. */
// export function resolveStatus(current: CaseStatus, target: CaseStatus, by: "auto" | "manual"): CaseStatus {
//   if (by === "manual") return target;
//   return statusRank(target) > statusRank(current) ? target : current;
// }

// export interface SaveCaseInput {
//   /** Id of the case already linked to this form (ignored if it no longer matches the customer). */
//   id?: string | null;
//   orderId?: string | null;
//   snapshot: CaseSnapshot;
//   packageLabel?: string;
//   target: CaseStatus;
//   by: "auto" | "manual";
// }

// /** Creates or updates the case and moves its status. Returns the saved row. */
// export async function saveCase(client: any, input: SaveCaseInput): Promise<SwarCaseRow> {
//   const { snapshot: s } = input;
//   const phone = phoneDigits(s.phone);
//   const base = {
//     order_id: input.orderId || null,
//     customer_name: s.customerName.trim() || s.surname.trim() || null,
//     phone: phone || null,
//     dob: s.dob || null,
//     package_label: input.packageLabel ?? null,
//     data: s,
//   };

//   // find the existing case: linked id, else the same order, else the same phone + date of birth
//   let existing: SwarCaseRow | null = null;
//   if (input.id) {
//     const { data } = await client.from("swar_cases").select("*").eq("id", input.id).maybeSingle();
//     existing = data ?? null;
//   }
//   if (!existing && input.orderId) {
//     const { data } = await client.from("swar_cases").select("*").eq("order_id", input.orderId).maybeSingle();
//     existing = data ?? null;
//   }
//   if (!existing && phone && s.dob) {
//     const { data } = await client.from("swar_cases").select("*").eq("phone", phone).eq("dob", s.dob)
//       .order("updated_at", { ascending: false }).limit(1);
//     existing = data?.[0] ?? null;
//   }

//   const current: CaseStatus = existing && isStatus(existing.status) ? existing.status : "new";
//   const next = resolveStatus(current, input.target, input.by);
//   const history: HistoryEntry[] = Array.isArray(existing?.status_history) ? [...existing!.status_history] : [];
//   if (!existing || next !== current) history.push({ status: next, at: new Date().toISOString(), by: input.by });

//   if (existing) {
//     const { data, error } = await client.from("swar_cases")
//       .update({ ...base, order_id: base.order_id ?? existing.order_id, status: next, status_history: history })
//       .eq("id", existing.id).select("*").single();
//     if (error) throw error;
//     return data as SwarCaseRow;
//   }
//   const { data, error } = await client.from("swar_cases").insert({ ...base, status: next, status_history: history }).select("*").single();
//   if (error) throw error;
//   return data as SwarCaseRow;
// }

// /** Manual change from the list (no snapshot needed). */
// export async function setCaseStatus(client: any, row: SwarCaseRow, target: CaseStatus): Promise<SwarCaseRow> {
//   const history = [...(Array.isArray(row.status_history) ? row.status_history : []), { status: target, at: new Date().toISOString(), by: "manual" as const }];
//   const { data, error } = await client.from("swar_cases").update({ status: target, status_history: history }).eq("id", row.id).select("*").single();
//   if (error) throw error;
//   return data as SwarCaseRow;
// }

// /**
//  * Delete from the Cases list.
//  * - Hand-made case (no order): the row is removed for good.
//  * - Case that came from an order: the row is only marked data.deleted = true and hidden. A real delete would be
//  *   undone by syncOrdersToCases, which re-creates a case for every paid order that has none (last 15 days).
//  */
// export async function deleteCase(client: any, row: SwarCaseRow): Promise<"removed" | "hidden"> {
//   if (!row.order_id) {
//     const { error } = await client.from("swar_cases").delete().eq("id", row.id);
//     if (error) throw error;
//     return "removed";
//   }
//   const { error } = await client.from("swar_cases")
//     .update({ data: { ...(row.data ?? {}), deleted: true, deletedAt: new Date().toISOString() } }).eq("id", row.id);
//   if (error) throw error;
//   return "hidden";
// }


/**
 * Swar Calculator cases + status.
 *
 *   new -> swar_shared -> names_shared -> confirmation_received -> report_shared
 *
 * AUTOMATIC: the tool only ever moves a case forward (a later step is never pushed back by accident).
 * MANUAL: the operator can set any status, forwards or backwards, from the dropdown.
 * Note: a WhatsApp link only opens the chat; the tool cannot know the message was really sent,
 * which is why the manual dropdown exists.
 */

export type CaseStatus = "new" | "swar_shared" | "names_shared" | "confirmation_received" | "report_shared";

export const STATUS_ORDER: CaseStatus[] = ["new", "swar_shared", "names_shared", "confirmation_received", "report_shared"];

export const STATUS_META: Record<CaseStatus, { label: string; badge: string; dot: string }> = {
  new: { label: "New", badge: "bg-gray-100 text-gray-700 border-gray-300", dot: "bg-gray-400" },
  swar_shared: { label: "Swar Alphabet Shared", badge: "bg-blue-100 text-blue-800 border-blue-300", dot: "bg-blue-500" },
  names_shared: { label: "Names PDF Shared", badge: "bg-orange-100 text-orange-800 border-orange-300", dot: "bg-orange-500" },
  confirmation_received: { label: "Final Confirmation Received", badge: "bg-purple-100 text-purple-800 border-purple-300", dot: "bg-purple-500" },
  report_shared: { label: "Final Report Shared", badge: "bg-green-100 text-green-800 border-green-300", dot: "bg-green-500" },
};

export const statusRank = (s: CaseStatus) => STATUS_ORDER.indexOf(s);
export const isStatus = (v: unknown): v is CaseStatus => STATUS_ORDER.includes(v as CaseStatus);

export interface HistoryEntry { status: CaseStatus; at: string; by: "auto" | "manual" }

export interface SwarCaseRow {
  id: string;
  created_at: string;
  updated_at: string;
  order_id: string | null;
  customer_name: string | null;
  phone: string | null;
  dob: string | null;
  package_label: string | null;
  status: CaseStatus;
  status_history: HistoryEntry[];
  data: Record<string, any>;
}

/** Everything needed to re-open a case in the tool. */
export interface CaseSnapshot {
  dob: string; time: string; place: string; tz: string; phone: string; customerName: string;
  swarText: string; altText: string;
  gender: string; surname: string; middle: string; middleNotFather: boolean; preference: string;
  pkg: { tier: "perfect" | "blueprint"; extraNames: boolean };
  starts: string; number: string;
    /** Optional nick name the customer wants (Step 4); fills the report's Nick Name field. */
  nickName?: string;
  /** Total AI usage for the names of this case (every generate / replace adds to it). */
  namesStats?: { rounds: number; rejected: number; inputTokens: number; outputTokens: number; costUsd: number; model: string };
}

export const phoneDigits = (p: string) => p.replace(/\D/g, "").slice(-10);

/** Decide the new status. Auto never moves a case backwards; manual always applies. */
export function resolveStatus(current: CaseStatus, target: CaseStatus, by: "auto" | "manual"): CaseStatus {
  if (by === "manual") return target;
  return statusRank(target) > statusRank(current) ? target : current;
}

export interface SaveCaseInput {
  /** Id of the case already linked to this form (ignored if it no longer matches the customer). */
  id?: string | null;
  orderId?: string | null;
  snapshot: CaseSnapshot;
  packageLabel?: string;
  target: CaseStatus;
  by: "auto" | "manual";
}

/** Creates or updates the case and moves its status. Returns the saved row. */
export async function saveCase(client: any, input: SaveCaseInput): Promise<SwarCaseRow> {
  const { snapshot: s } = input;
  const phone = phoneDigits(s.phone);
  const base = {
    order_id: input.orderId || null,
    customer_name: s.customerName.trim() || s.surname.trim() || null,
    phone: phone || null,
    dob: s.dob || null,
    package_label: input.packageLabel ?? null,
    data: s,
  };

  // find the existing case: linked id, else the same order, else the same phone + date of birth
  let existing: SwarCaseRow | null = null;
  if (input.id) {
    const { data } = await client.from("swar_cases").select("*").eq("id", input.id).maybeSingle();
    existing = data ?? null;
  }
  if (!existing && input.orderId) {
    const { data } = await client.from("swar_cases").select("*").eq("order_id", input.orderId).maybeSingle();
    existing = data ?? null;
  }
  if (!existing && phone && s.dob) {
    const { data } = await client.from("swar_cases").select("*").eq("phone", phone).eq("dob", s.dob)
      .order("updated_at", { ascending: false }).limit(1);
    existing = data?.[0] ?? null;
  }

  const current: CaseStatus = existing && isStatus(existing.status) ? existing.status : "new";
  const next = resolveStatus(current, input.target, input.by);
  const history: HistoryEntry[] = Array.isArray(existing?.status_history) ? [...existing!.status_history] : [];
  if (!existing || next !== current) history.push({ status: next, at: new Date().toISOString(), by: input.by });

  if (existing) {
    const { data, error } = await client.from("swar_cases")
      .update({ ...base, order_id: base.order_id ?? existing.order_id, status: next, status_history: history })
      .eq("id", existing.id).select("*").single();
    if (error) throw error;
    return data as SwarCaseRow;
  }
  const { data, error } = await client.from("swar_cases").insert({ ...base, status: next, status_history: history }).select("*").single();
  if (error) throw error;
  return data as SwarCaseRow;
}

/**
 * Is the case that is open on the page still the one this form belongs to?
 * Yes when the phone + birth date are unchanged, or when the first save was made before any phone was typed and only
 * the phone was added afterwards (the boxes for name and number appear only after the first Calculate, so that is the
 * normal order for a hand-made case). Without this the phone being added made a second, blank twin of the case.
 */
export function isSameCase(caseKey: string, phone: string, dob: string): boolean {
  return caseKey === `${phoneDigits(phone)}|${dob}` || caseKey === `|${dob}`;
}

/**
 * Writes the latest form values into an EXISTING case. Used for the quiet auto-save: it never creates a case (a case
 * deleted from the list stays deleted), never un-hides a hidden one, and never touches the status.
 */
export async function updateCaseData(client: any, id: string, s: CaseSnapshot, packageLabel?: string): Promise<boolean> {
  const { data: row, error: readError } = await client.from("swar_cases").select("data").eq("id", id).maybeSingle();
  if (readError) throw readError;
  if (!row || row.data?.deleted) return false;
  const { error } = await client.from("swar_cases").update({
    customer_name: s.customerName.trim() || s.surname.trim() || null,
    phone: phoneDigits(s.phone) || null,
    dob: s.dob || null,
    package_label: packageLabel ?? null,
    data: s,
  }).eq("id", id);
  if (error) throw error;
  return true;
}

/** Manual change from the list (no snapshot needed). */
export async function setCaseStatus(client: any, row: SwarCaseRow, target: CaseStatus): Promise<SwarCaseRow> {
  const history = [...(Array.isArray(row.status_history) ? row.status_history : []), { status: target, at: new Date().toISOString(), by: "manual" as const }];
  const { data, error } = await client.from("swar_cases").update({ status: target, status_history: history }).eq("id", row.id).select("*").single();
  if (error) throw error;
  return data as SwarCaseRow;
}

/**
 * Delete from the Cases list.
 * - Hand-made case (no order): the row is removed for good.
 * - Case that came from an order: the row is only marked data.deleted = true and hidden. A real delete would be
 *   undone by syncOrdersToCases, which re-creates a case for every paid order that has none (last 15 days).
 */
export async function deleteCase(client: any, row: SwarCaseRow): Promise<"removed" | "hidden"> {
  if (!row.order_id) {
    const { error } = await client.from("swar_cases").delete().eq("id", row.id);
    if (error) throw error;
    return "removed";
  }
  const { error } = await client.from("swar_cases")
    .update({ data: { ...(row.data ?? {}), deleted: true, deletedAt: new Date().toISOString() } }).eq("id", row.id);
  if (error) throw error;
  return "hidden";
}
