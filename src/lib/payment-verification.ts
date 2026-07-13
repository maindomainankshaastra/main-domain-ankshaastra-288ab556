/** Session storage key for post-checkout verification on the thank-you page. */
export const PENDING_PAYMENT_KEY = "ankshaastra_pending_payment";

export type PendingPaymentVerification = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  dbOrderId?: string;
  formData: Record<string, unknown>;
  service?: string;
  amount: number;
  userId?: string;
};

export function storePendingPaymentVerification(data: PendingPaymentVerification): void {
  try {
    sessionStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(data));
  } catch {
    // sessionStorage may be unavailable in private mode
  }
}

export function consumePendingPaymentVerification(): PendingPaymentVerification | null {
  try {
    const raw = sessionStorage.getItem(PENDING_PAYMENT_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PENDING_PAYMENT_KEY);
    return JSON.parse(raw) as PendingPaymentVerification;
  } catch {
    return null;
  }
}

async function tryCompleteOrderInvoice(payload: PendingPaymentVerification): Promise<{
  invoice_number?: string;
  invoice_ready?: boolean;
}> {
  const completed = await fetch("/api/invoices/complete-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      razorpay_order_id: payload.razorpay_order_id,
      razorpay_payment_id: payload.razorpay_payment_id,
      razorpay_signature: payload.razorpay_signature,
      dbOrderId: payload.dbOrderId,
    }),
  });

  const completedData = (await completed.json().catch(() => ({}))) as {
    invoice_number?: string;
    invoice_ready?: boolean;
  };

  if (completed.ok || completed.status === 202) {
    return {
      invoice_number: completedData.invoice_number,
      invoice_ready: completedData.invoice_ready,
    };
  }

  return {};
}

export async function verifyPaymentAndInvoice(payload: PendingPaymentVerification): Promise<{
  invoice_number?: string;
  invoice_ready?: boolean;
  error?: string;
}> {
  const verifyRes = await fetch("/api/verify-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      razorpay_order_id: payload.razorpay_order_id,
      razorpay_payment_id: payload.razorpay_payment_id,
      razorpay_signature: payload.razorpay_signature,
      dbOrderId: payload.dbOrderId,
      formData: { ...payload.formData, userId: payload.userId },
      service: payload.service,
      amount: payload.amount,
    }),
  });

  const verifyData = (await verifyRes.json().catch(() => ({}))) as {
    success?: boolean;
    invoice_number?: string;
    invoice_ready?: boolean;
    error?: string;
  };

  if (verifyRes.ok && verifyData?.success !== false) {
    if (verifyData.invoice_ready) {
      return {
        invoice_number: verifyData.invoice_number,
        invoice_ready: true,
      };
    }

    const completed = await tryCompleteOrderInvoice(payload);
    return {
      invoice_number: completed.invoice_number || verifyData.invoice_number,
      invoice_ready: completed.invoice_ready ?? verifyData.invoice_ready,
    };
  }

  const { syncPaymentStatus } = await import("@/lib/sync-payment");
  const synced = await syncPaymentStatus({
    razorpay_order_id: payload.razorpay_order_id,
    dbOrderId: payload.dbOrderId,
    formData: { ...payload.formData, userId: payload.userId },
    service: payload.service,
    amount: payload.amount,
    pollAttempts: 4,
  });

  if (!synced.paid) {
    return {
      error: verifyData.error || synced.error || "Payment verification failed",
    };
  }

  if (synced.invoice_ready) {
    return {
      invoice_number: synced.invoice_number,
      invoice_ready: true,
    };
  }

  const completed = await tryCompleteOrderInvoice({
    ...payload,
    razorpay_payment_id: synced.razorpay_payment_id || payload.razorpay_payment_id,
    razorpay_order_id: synced.razorpay_order_id || payload.razorpay_order_id,
  });

  return {
    invoice_number: completed.invoice_number || synced.invoice_number,
    invoice_ready: completed.invoice_ready ?? synced.invoice_ready,
  };
}
