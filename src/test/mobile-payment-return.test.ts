import crypto from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import paymentCallback from "../../server/handlers/payment-callback";
import { resolveMobilePaymentReturn, type PendingCheckout } from "@/lib/payment-verification";

afterEach(() => vi.unstubAllEnvs());

describe("Mobile payment return", () => {
  it("immediately redirects a signed POST to Thank You with an explicit GET transition", async () => {
    vi.stubEnv("RAZORPAY_KEY_SECRET", "unit-test-only-secret");
    const signature = crypto.createHmac("sha256", "unit-test-only-secret").update("order_test|pay_test").digest("hex");
    const res = { writeHead: vi.fn(), end: vi.fn() };
    await paymentCallback({ method: "POST", body: { razorpay_order_id: "order_test", razorpay_payment_id: "pay_test", razorpay_signature: signature } }, res);
    const [status, headers] = res.writeHead.mock.calls[0];
    expect(status).toBe(303);
    const url = new URL(headers.Location, "https://example.test");
    expect(url.pathname).toBe("/thank-you");
    expect(url.searchParams.get("payment_id")).toBe("pay_test");
    expect(url.searchParams.has("razorpay_signature")).toBe(false);
    expect(new URLSearchParams(url.hash.slice(1)).get("razorpay_signature")).toBe(signature);
    expect(res.end).toHaveBeenCalledOnce();
  });

  it("never returns a success page for an invalid signature", async () => {
    vi.stubEnv("RAZORPAY_KEY_SECRET", "unit-test-only-secret");
    const res = { writeHead: vi.fn(), end: vi.fn() };
    await paymentCallback({ method: "POST", body: { razorpay_order_id: "order_test", razorpay_payment_id: "pay_test", razorpay_signature: "invalid" } }, res);
    expect(res.writeHead.mock.calls[0][1].Location).toBe("/?payment_status=failed");
  });

  const saved: PendingCheckout = { razorpayOrderId: "order_test", dbOrderId: "db_test", formData: { fullName: "Test Person", email: "test@example.test" }, amount: 699, service: "Varshphal Report 2027", savedAt: Date.now() };
  const url = new URL("https://example.test/thank-you?order_id=order_test&payment_id=pay_test#razorpay_signature=test-signature");

  it("restores matching service, price and details before checkout storage is cleared", () => {
    const result = resolveMobilePaymentReturn(url, saved);
    expect(result?.amount).toBe(699);
    expect(result?.service).toBe("Varshphal Report 2027");
    expect(result?.formData.fullName).toBe("Test Person");
    expect(result?.razorpay_payment_id).toBe("pay_test");
  });

  it("does not mix a previous customer's checkout into a different order", () => {
    const result = resolveMobilePaymentReturn(url, { ...saved, razorpayOrderId: "different_order" });
    expect(result?.dbOrderId).toBeUndefined();
    expect(result?.formData).toEqual({});
    expect(result?.amount).toBe(0);
  });

  it("supports signed returns without local storage and ignores unsigned URLs", () => {
    expect(resolveMobilePaymentReturn(url, null)?.razorpay_order_id).toBe("order_test");
    expect(resolveMobilePaymentReturn(new URL("https://example.test/thank-you?order_id=order_test&payment_id=pay_test"), saved)).toBeNull();
  });
});