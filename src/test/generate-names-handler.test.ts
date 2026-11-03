import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../server/lib/auth-api", () => ({
  getUserFromAuthHeader: vi.fn(async (h?: string) => (h === "Bearer ok" ? { id: "u1" } : null)),
  isAdminUser: vi.fn(async () => true),
}));

import handler from "../../server/handlers/generate-names";

function mockRes() {
  const r: any = { code: 0, body: null };
  r.status = (n: number) => { r.code = n; return { json: (o: unknown) => { r.body = o; }, end: () => {} }; };
  return r;
}

// Candidates: some valid for number 3 starting with "Vi", some deliberately wrong.
const CANDIDATES = [
  { base: "Viraj", spelling: "Viiraj", meaning: "Radiant, majestic", score: 9 },   // 12 -> 3 OK
  { base: "Vivaan", spelling: "Vivaan", meaning: "Full of life", score: 9 },        // wrong number
  { base: "Viraj", spelling: "Virajo", meaning: "bad spelling", score: 8 },         // added letter
  { base: "Raj", spelling: "Raj", meaning: "wrong start", score: 8 },
];

beforeEach(() => {
  process.env.ANTHROPIC_API_KEY = "test-key";
  (globalThis as any).fetch = vi.fn(async () => ({
    ok: true,
    json: async () => ({
      content: [{ type: "text", text: JSON.stringify(CANDIDATES) }],
      usage: { input_tokens: 500, output_tokens: 400 },
    }),
  }));
});

describe("POST generate-names", () => {
  it("rejects users who are not signed in", async () => {
    const res = mockRes();
    await handler({ method: "POST", headers: {}, body: { number: 3, starts: ["Vi"] } } as any, res);
    expect(res.code).toBe(401);
  });

  it("returns only names that pass the code checks, with token and cost stats", async () => {
    const res = mockRes();
    await handler({ method: "POST", headers: { authorization: "Bearer ok" }, body: { gender: "boy", number: 3, starts: ["Vi"] } } as any, res);
    expect(res.code).toBe(200);
    expect(res.body.names.map((n: any) => n.name)).toEqual(["Viiraj"]);
    expect(res.body.names[0].number).toBe(3);
    expect(res.body.stats.rounds).toBe(3);                 // keeps asking until it has enough or hits the cap
    expect(res.body.stats.costUsd).toBeGreaterThan(0);
  });

  it("validates input", async () => {
    const res = mockRes();
    await handler({ method: "POST", headers: { authorization: "Bearer ok" }, body: { number: 12, starts: ["Vi"] } } as any, res);
    expect(res.code).toBe(400);
  });
});
