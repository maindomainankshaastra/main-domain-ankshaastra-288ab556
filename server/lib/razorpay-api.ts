type RazorpayPayment = {
  id: string;
  status: string;
  order_id: string;
};

type RazorpayOrder = {
  id: string;
  status: string;
  amount: number;
};

function getAuthHeader(): string {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay credentials missing");
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

export async function fetchRazorpayOrder(orderId: string): Promise<RazorpayOrder | null> {
  const resp = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
    headers: { Authorization: getAuthHeader() },
  });
  if (!resp.ok) return null;
  return (await resp.json()) as RazorpayOrder;
}

export async function fetchCapturedPaymentForOrder(orderId: string): Promise<RazorpayPayment | null> {
  const resp = await fetch(`https://api.razorpay.com/v1/orders/${orderId}/payments`, {
    headers: { Authorization: getAuthHeader() },
  });
  if (!resp.ok) return null;

  const data = (await resp.json()) as { items?: RazorpayPayment[] };
  const items = data.items || [];
  const captured = items.find((p) => p.status === "captured");
  if (captured) return captured;

  const authorized = items.find((p) => p.status === "authorized");
  return authorized || null;
}

export async function pollRazorpayPaidOrder(
  orderId: string,
  attempts = 5,
  delayMs = 1500,
): Promise<{ order: RazorpayOrder; payment: RazorpayPayment } | null> {
  for (let i = 0; i < attempts; i++) {
    const order = await fetchRazorpayOrder(orderId);
    if (order?.status === "paid") {
      const payment = await fetchCapturedPaymentForOrder(orderId);
      if (payment) return { order, payment };
    }
    if (i < attempts - 1) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return null;
}
