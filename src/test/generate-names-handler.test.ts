

// import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.mock("../../server/lib/auth-api", () => ({
//   getUserFromAuthHeader: vi.fn(async (h?: string) => (h === "Bearer ok" ? { id: "u1" } : null)),
//   isAdminUser: vi.fn(async () => true),
// }));

// import handler from "../../server/handlers/generate-names";

// function mockRes() {
//   const r: any = { code: 0, body: null };
//   r.status = (n: number) => { r.code = n; return { json: (o: unknown) => { r.body = o; }, end: () => {} }; };
//   return r;
// }

// // The AI now only suggests REAL names; code finds the numerology spelling that adds up to the target.
// const REAL_NAMES = ["Viraj", "Vivaan", "Vihaan", "Vedant", "Raj"]; // "Raj" does not start with "Vi"

// beforeEach(() => {
//   process.env.ANTHROPIC_API_KEY = "test-key";
//   (globalThis as any).fetch = vi.fn(async () => ({
//     ok: true,
//     json: async () => ({
//       content: [{ type: "text", text: JSON.stringify(REAL_NAMES.map((name) => ({ name, meaning: "Radiant, majestic", score: 9 }))) }],
//       usage: { input_tokens: 500, output_tokens: 400 },
//     }),
//   }));
// });

// describe("POST generate-names", () => {
//   it("rejects users who are not signed in", async () => {
//     const res = mockRes();
//     await handler({ method: "POST", headers: {}, body: { number: 3, starts: ["Vi"] } } as any, res);
//     expect(res.code).toBe(401);
//   });

//   it("returns only names that pass the code checks, with token and cost stats", async () => {
//     const res = mockRes();
//     await handler({ method: "POST", headers: { authorization: "Bearer ok" }, body: { gender: "boy", number: 3, starts: ["Vi"] } } as any, res);
//     expect(res.code).toBe(200);
//     const names = res.body.names.map((n: any) => n.name);
//     expect(names).toContain("Viiraj");                       // Viraj with one doubled vowel adds up to 3
//     expect(names).not.toContain("Raj");                      // wrong start
//     expect(res.body.names.every((n: any) => n.number === 3 && /^vi/i.test(n.name))).toBe(true);
//     expect(res.body.stats.rounds).toBe(3);                   // keeps asking until it has enough or hits the cap
//     expect(res.body.stats.costUsd).toBeGreaterThan(0);
//     expect(res.body.note).toMatch(/Only \d+ names fit/);     // fewer than 12 exist here, so the operator is told
//   });

//   it("asks for a single replacement name and passes feedback and the names to avoid", async () => {
//     const res = mockRes();
//     await handler({ method: "POST", headers: { authorization: "Bearer ok" },
//       body: { gender: "boy", number: 3, starts: ["Vi"], count: 1, avoid: ["Viiraj"], feedback: "more modern" } } as any, res);
//     expect(res.code).toBe(200);
//     expect(res.body.names).toHaveLength(1);
//     expect(res.body.names[0].name).not.toBe("Viiraj");
//     const sent = JSON.parse(((globalThis as any).fetch as any).mock.calls[0][1].body).messages[0].content;
//     expect(sent).toContain("more modern");
//     expect(sent).toContain("Viiraj");
//   });

//   it("validates input", async () => {
//     const res = mockRes();
//     await handler({ method: "POST", headers: { authorization: "Bearer ok" }, body: { number: 12, starts: ["Vi"] } } as any, res);
//     expect(res.code).toBe(400);
//   });
// });


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

// The AI now only suggests REAL names; code finds the numerology spelling that adds up to the target.
const REAL_NAMES = ["Viraj", "Vivaan", "Vihaan", "Vedant", "Raj"]; // "Raj" does not start with "Vi"

beforeEach(() => {
  process.env.ANTHROPIC_API_KEY = "test-key";
  (globalThis as any).fetch = vi.fn(async () => ({
    ok: true,
    json: async () => ({
      content: [{ type: "text", text: JSON.stringify(REAL_NAMES.map((name) => ({ name, meaning: "Radiant, majestic", score: 9 }))) }],
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
    const names = res.body.names.map((n: any) => n.name);
    expect(names).toContain("Viiraj");                       // Viraj with one doubled vowel adds up to 3
    expect(names).not.toContain("Raj");                      // wrong start
    expect(res.body.names.every((n: any) => n.number === 3 && /^vi/i.test(n.name))).toBe(true);
    expect(res.body.stats.rounds).toBe(3);                   // keeps asking until it has enough or hits the cap
    expect(res.body.stats.costUsd).toBeGreaterThan(0);
    expect(res.body.note).toMatch(/Only \d+ names fit/);     // fewer than 12 exist here, so the operator is told
  });

  it("asks for a single replacement name and passes feedback and the names to avoid", async () => {
    const res = mockRes();
    await handler({ method: "POST", headers: { authorization: "Bearer ok" },
      body: { gender: "boy", number: 3, starts: ["Vi"], count: 1, avoid: ["Viiraj"], feedback: "more modern" } } as any, res);
    expect(res.code).toBe(200);
    expect(res.body.names).toHaveLength(1);
    expect(res.body.names[0].name).not.toBe("Viiraj");
    const sent = JSON.parse(((globalThis as any).fetch as any).mock.calls[0][1].body).messages[0].content;
    expect(sent).toContain("more modern");
    expect(sent).toContain("Viiraj");
  });

  it("returns exactly the asked number of names when exact is set (replacing ticked names)", async () => {
    const res = mockRes();
    await handler({ method: "POST", headers: { authorization: "Bearer ok" },
      body: { gender: "boy", number: 3, starts: ["Vi"], count: 2, exact: true, avoid: ["Viraj"] } } as any, res);
    expect(res.code).toBe(200);
    expect(res.body.names).toHaveLength(2);
    expect(res.body.names.map((n: any) => n.base)).not.toContain("Viraj");
  });

  it("validates input", async () => {
    const res = mockRes();
    await handler({ method: "POST", headers: { authorization: "Bearer ok" }, body: { number: 12, starts: ["Vi"] } } as any, res);
    expect(res.code).toBe(400);
  });
});
