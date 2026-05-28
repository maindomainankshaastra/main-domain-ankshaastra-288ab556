/** Client fallback: finish invoice PDF + email after payment when verify-payment did not complete in time. */
export async function completeOrderInvoice(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  dbOrderId?: string;
}): Promise<{ invoice_number?: string; invoice_ready?: boolean; error?: string }> {
  const res = await fetch("/api/invoices/complete-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = (await res.json().catch(() => ({}))) as {
    invoice_number?: string;
    invoice_ready?: boolean;
    error?: string;
  };

  if (!res.ok && res.status !== 202) {
    return { error: body.error || "Could not generate invoice" };
  }

  return {
    invoice_number: body.invoice_number,
    invoice_ready: body.invoice_ready,
    error: body.error,
  };
}
