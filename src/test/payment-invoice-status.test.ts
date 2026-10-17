import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ ready: false, finishGeneration: true }));
vi.mock("../../server/lib/supabase-admin", () => ({
  getSupabaseAdmin: () => {
    const query = {
      select: () => query, eq: () => query, order: () => query, limit: () => query,
      maybeSingle: async () => ({ data: { metadata: {}, invoice_number: "INV-test" } }),
    };
    return { from: () => query };
  },
}));
vi.mock("../../server/lib/invoice-engine", () => ({
  paymentHasDeliverableInvoice: async () => state.ready,
  orderHasDeliverableInvoice: async () => state.ready,
}));
vi.mock("../../server/lib/schedule-invoice", () => ({
  scheduleInvoiceGeneration: async () => { state.ready = state.finishGeneration; },
}));
vi.mock("../../server/lib/payment-order-map", () => ({
  resolveOrderForPayment: async () => ({ orderId: "db-test", alreadyPaid: true }),
  resolveOrderAfterConflict: vi.fn(),
}));
vi.mock("../../server/lib/service-persons-store", () => ({
  resolvePurchaserName: () => "Test Person", syncServicePersonsForOrder: vi.fn(),
}));

import { fulfillPayment } from "../../server/lib/fulfill-payment";
import { verifyPaymentAndInvoice } from "@/lib/payment-verification";

beforeEach(() => { state.ready = false; state.finishGeneration = true; vi.unstubAllGlobals(); });

describe("Invoice status after awaited generation", () => {
  const input = { razorpay_order_id: "order_test", razorpay_payment_id: "pay_test", razorpay_signature: "test-signature", formData: {}, amount: 699 };
  it("returns the generated invoice so the client does not start a duplicate completion request", async () => {
    const result = await fulfillPayment(input);
    expect(result.invoice_ready).toBe(true);
    expect(result.invoice_number).toBe("INV-test");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, ...result }) });
    vi.stubGlobal("fetch", fetchMock);
    expect(await verifyPaymentAndInvoice(input)).toMatchObject({ invoice_ready: true, invoice_number: "INV-test" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("keeps invoice status pending when generation has not completed", async () => {
    state.finishGeneration = false;
    expect(await fulfillPayment(input)).toMatchObject({ invoice_ready: false, invoice_number: undefined });
  });
});