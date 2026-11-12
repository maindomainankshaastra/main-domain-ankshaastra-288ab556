/**
 * Orders -> Swar cases, automatically.
 *
 * Every paid Perfect / Complete order becomes a "New" case in swar_cases with the birth details already filled
 * in from the order form, so nobody has to type the phone number or the date of birth again. The operator opens the
 * case and the Swar is calculated straight away (see openCase in SwarCalculatorModule).
 *
 * Safe to run any number of times: an order that already has a case is skipped (order_id is unique), and a
 * hand-made case for the same phone + date of birth is linked to the order instead of getting a twin.
 */
import { detectPackage, prefillFromOrder, PACKAGE_PRICE } from "@/lib/swar/nameFinderPackage";
import { phoneDigits, type CaseSnapshot, type HistoryEntry } from "@/lib/swar/swarCases";

/** service_title values of the two products that need a Swar. Add a slug here if a new product should appear. */
export const BABY_SERVICE_SLUGS = ["perfect-baby-name-report", "complete-baby-name-blueprint"];

/** Orders that never got paid (checkout abandoned, failed, cancelled) must not become cases. */
export const isPaidLike = (o: Record<string, any>): boolean =>
  !/pending|fail|cancel|abandon|unpaid|created|refund/i.test(String(o.status ?? ""));

export interface OrderCase {
  orderId: string;
  customerName: string | null;
  phone: string | null;
  dob: string | null;
  packageLabel: string;
  snapshot: CaseSnapshot;
  /** Things the order form did not give us (the operator fills these in by hand). */
  missing: string[];
}

export function packageLabelOf(tier: "perfect" | "blueprint", extraNames: boolean): string {
  const base = tier === "blueprint" ? `Complete Blueprint ₹${PACKAGE_PRICE.blueprint}` : `Perfect Baby Name ₹${PACKAGE_PRICE.perfect}`;
  return `${base}${extraNames ? " + extra names" : ""}`;
}

export function caseFromOrder(order: Record<string, any>): OrderCase {
  const f = prefillFromOrder(order);
  const d = detectPackage(order);
  const pkg = d.choice ?? { tier: "perfect" as const, extraNames: false };
  const phone = phoneDigits(String(f.phone ?? order.customer_phone ?? ""));

  const missing: string[] = [];
  if (!f.dob) missing.push("date of birth");
  if (!f.time) missing.push("time of birth");
  if (!f.place) missing.push("place");
  if (!f.gender) missing.push("gender");
  if (phone.length < 10) missing.push("phone");
  if (!d.choice) missing.push("package");

  const snapshot: CaseSnapshot = {
    dob: f.dob ?? "", time: f.time ?? "", place: f.place ?? "", tz: "5.5", phone,
    customerName: f.customerName ?? "",
    swarText: "", altText: "",
    gender: f.gender ?? "boy", surname: f.lastName ?? "", middle: f.middleName ?? "",
    middleNotFather: !!f.middleName && f.middleIsFather === false,
    preference: f.preference ?? "",
    pkg, starts: "", number: "", names: [], picked: [], chosenRaw: "",
  };
  return {
    orderId: String(order.id),
    customerName: (f.customerName ?? "").trim() || f.lastName || null,
    phone: phone || null,
    dob: f.dob ?? null,
    packageLabel: packageLabelOf(pkg.tier, pkg.extraNames),
    snapshot,
    missing,
  };
}

export interface SyncResult { created: number; linked: number; scanned: number }

/** Creates a "New" case for every paid baby-name order that has none yet. */
export async function syncOrdersToCases(client: any): Promise<SyncResult> {
  const { data: orders, error } = await client
    .from("orders").select("*").in("service_title", BABY_SERVICE_SLUGS)
    .order("created_at", { ascending: false }).limit(300);
  if (error) throw error;
  const paid = (orders ?? []).filter(isPaidLike);
  if (!paid.length) return { created: 0, linked: 0, scanned: 0 };

  const ids = paid.map((o: any) => String(o.id));
  const { data: have, error: e2 } = await client.from("swar_cases").select("order_id").in("order_id", ids);
  if (e2) throw e2;
  const done = new Set((have ?? []).map((r: any) => String(r.order_id)));

  let created = 0, linked = 0;
  for (const o of paid) {
    if (done.has(String(o.id))) continue;
    const c = caseFromOrder(o);
    const data = { ...c.snapshot, orderMissing: c.missing, orderNotes: c.snapshot.preference };

    // A case the operator already made by hand for this customer (same phone + date of birth): attach the order to it.
    if (c.phone && c.dob) {
      const { data: manual } = await client.from("swar_cases").select("id, data")
        .eq("phone", c.phone).eq("dob", c.dob).is("order_id", null).limit(1);
      if (manual?.[0]) {
        const { error: ue } = await client.from("swar_cases").update({
          order_id: c.orderId, package_label: c.packageLabel,
          data: { ...(manual[0].data ?? {}), orderMissing: c.missing },
        }).eq("id", manual[0].id);
        if (!ue) { linked++; continue; }
      }
    }

    const history: HistoryEntry[] = [{ status: "new", at: new Date().toISOString(), by: "auto" }];
    const { error: ie } = await client.from("swar_cases").insert({
      order_id: c.orderId, customer_name: c.customerName, phone: c.phone, dob: c.dob,
      package_label: c.packageLabel, status: "new", status_history: history, data,
    });
    if (!ie) created++;
    else if (ie.code !== "23505") throw ie; // 23505 = another admin created it a moment ago, fine
  }
  return { created, linked, scanned: paid.length };
}
