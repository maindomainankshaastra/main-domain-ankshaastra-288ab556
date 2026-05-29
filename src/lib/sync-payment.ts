export type SyncPaymentResult = {
  success?: boolean;
  paid: boolean;
  verifiedBy?: string;
  order_id?: string;
  invoice_number?: string;
  invoice_ready?: boolean;
  invoice_warning?: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  error?: string;
};

export async function syncPaymentStatus(payload: {
  razorpay_order_id: string;
  dbOrderId?: string;
  formData?: Record<string, unknown>;
  service?: string;
  amount?: number;
  pollAttempts?: number;
}): Promise<SyncPaymentResult> {
  const res = await fetch("/api/sync-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = (await res.json().catch(() => ({}))) as SyncPaymentResult;
  if (!res.ok) {
    return { paid: false, error: body.error || "Could not sync payment status" };
  }
  return body;
}
