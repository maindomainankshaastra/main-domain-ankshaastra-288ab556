import { describe, expect, it } from "vitest";
import { isSameCase, phoneDigits, saveCase, updateCaseData } from "@/lib/swar/swarCases";

/** Tiny in-memory stand-in for the Supabase client: only what saveCase / updateCaseData use. */
function mockClient() {
  const rows: any[] = [];
  let n = 0;
  const from = () => {
    const filters: ((r: any) => boolean)[] = [];
    let mode = "select", payload: any, lim = 999;
    const run = (one: boolean) => {
      let hit = rows.filter((r) => filters.every((f) => f(r)));
      if (mode === "insert") { const r = { id: `case${++n}`, ...payload }; rows.push(r); return Promise.resolve({ data: r, error: null }); }
      if (mode === "update") { hit.forEach((r) => Object.assign(r, payload)); return Promise.resolve({ data: hit[0], error: null }); }
      hit = hit.slice(0, lim);
      return Promise.resolve({ data: one ? (hit[0] ?? null) : hit, error: null });
    };
    const b: any = {
      select: () => b, order: () => b, limit: (l: number) => { lim = l; return b; },
      eq: (k: string, v: any) => { filters.push((r) => r[k] === v); return b; },
      insert: (p: any) => { mode = "insert"; payload = p; return b; },
      update: (p: any) => { mode = "update"; payload = p; return b; },
      maybeSingle: () => run(true), single: () => run(true),
      then: (res: any, rej: any) => run(false).then(res, rej),
    };
    return b;
  };
  return { from, rows } as any;
}

const DOB = "2026-10-14";

/** The same decision SwarCalculatorModule.autoStatus makes. */
function makeSession(client: any) {
  let caseId: string | null = null, caseKey = "";
  return {
    get caseId() { return caseId; },
    async action(phone: string, name: string, target: any = "swar_shared") {
      const row = await saveCase(client, {
        id: isSameCase(caseKey, phone, DOB) ? caseId : null, orderId: null, packageLabel: "Perfect",
        snapshot: { dob: DOB, phone, customerName: name, surname: "" } as any, target, by: "auto",
      } as any);
      caseId = row.id; caseKey = `${phoneDigits(phone)}|${DOB}`;
      return row;
    },
  };
}

describe("manual case: name + number typed after the first save", () => {
  it("keeps ONE case and stores the name and number in it (no blank twin)", async () => {
    const c = mockClient(); const s = makeSession(c);
    await s.action("", "");                                    // Calculate & send: boxes were not there yet
    await s.action("9876543210", "Ravi Sharma", "confirmation_received");
    expect(c.rows).toHaveLength(1);
    expect(c.rows[0]).toMatchObject({ customer_name: "Ravi Sharma", phone: "9876543210", status: "confirmation_received" });
  });
  it("a different customer's number (after a number was already saved) still starts a separate case", async () => {
    const c = mockClient(); const s = makeSession(c);
    await s.action("9876543210", "Ravi");
    await s.action("9123456789", "Meena");
    expect(c.rows).toHaveLength(2);
  });
});

describe("isSameCase", () => {
  it("same number + date, or number added after a number-less first save", () => {
    expect(isSameCase(`9876543210|${DOB}`, "98765 43210", DOB)).toBe(true);
    expect(isSameCase(`|${DOB}`, "9876543210", DOB)).toBe(true);
    expect(isSameCase(`|${DOB}`, "", DOB)).toBe(true);
  });
  it("not the same when the number or the date changed", () => {
    expect(isSameCase(`9876543210|${DOB}`, "9123456789", DOB)).toBe(false);
    expect(isSameCase(`|${DOB}`, "9876543210", "2025-01-01")).toBe(false);
    expect(isSameCase("", "9876543210", DOB)).toBe(false);
  });
});

describe("updateCaseData (quiet auto-save)", () => {
  it("writes the latest name and number into the open case and leaves the status alone", async () => {
    const c = mockClient(); const s = makeSession(c);
    await s.action("9876543210", "Ravi", "names_shared");
    const ok = await updateCaseData(c, s.caseId!, { dob: DOB, phone: "9876543210", customerName: "Ravi Sharma", surname: "" } as any, "Perfect");
    expect(ok).toBe(true);
    expect(c.rows).toHaveLength(1);
    expect(c.rows[0]).toMatchObject({ customer_name: "Ravi Sharma", status: "names_shared" });
    expect(c.rows[0].data.customerName).toBe("Ravi Sharma");
  });
  it("never creates a case that does not exist", async () => {
    const c = mockClient();
    expect(await updateCaseData(c, "gone", { dob: DOB, phone: "1", customerName: "x", surname: "" } as any)).toBe(false);
    expect(c.rows).toHaveLength(0);
  });
  it("does not bring back a case that was hidden from the list", async () => {
    const c = mockClient(); const s = makeSession(c);
    await s.action("9876543210", "Ravi");
    c.rows[0].data = { ...c.rows[0].data, deleted: true };
    expect(await updateCaseData(c, s.caseId!, { dob: DOB, phone: "9876543210", customerName: "New", surname: "" } as any)).toBe(false);
    expect(c.rows[0].data.deleted).toBe(true);
    expect(c.rows[0].customer_name).toBe("Ravi");
  });
});
