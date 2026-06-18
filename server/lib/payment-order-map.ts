import { getSupabaseAdmin } from "./supabase-admin.js";

export type ResolveOrderInput = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  dbOrderId?: string | null;
};

export type ResolvedOrder = {
  orderId: string | null;
  alreadyPaid: boolean;
};

/**
 * Resolve the single DB order for a Razorpay payment.
 * Priority: razorpay_payment_id (canonical) → checkout dbOrderId → razorpay_order_id.
 */
export async function resolveOrderForPayment(input: ResolveOrderInput): Promise<ResolvedOrder> {
  const supabase = getSupabaseAdmin();
  const { razorpay_payment_id, razorpay_order_id, dbOrderId } = input;

  if (razorpay_payment_id) {
    const { data: byPayment } = await supabase
      .from("orders")
      .select("id, status")
      .eq("razorpay_payment_id", razorpay_payment_id)
      .maybeSingle();
    if (byPayment?.id) {
      return { orderId: byPayment.id, alreadyPaid: byPayment.status === "paid" };
    }
  }

  if (dbOrderId) {
    const { data: byId } = await supabase
      .from("orders")
      .select("id, razorpay_order_id, status")
      .eq("id", dbOrderId)
      .maybeSingle();
    if (byId?.razorpay_order_id === razorpay_order_id) {
      return { orderId: byId.id, alreadyPaid: byId.status === "paid" };
    }
  }

  if (razorpay_order_id) {
    const { data: byRzOrder } = await supabase
      .from("orders")
      .select("id, status")
      .eq("razorpay_order_id", razorpay_order_id)
      .maybeSingle();
    if (byRzOrder?.id) {
      return { orderId: byRzOrder.id, alreadyPaid: byRzOrder.status === "paid" };
    }
  }

  return { orderId: null, alreadyPaid: false };
}

/** After a unique-constraint conflict, re-fetch the order created by a parallel request. */
export async function resolveOrderAfterConflict(
  razorpay_payment_id: string,
  razorpay_order_id: string,
): Promise<ResolvedOrder> {
  const byPayment = await resolveOrderForPayment({ razorpay_payment_id, razorpay_order_id });
  if (byPayment.orderId) return byPayment;

  const supabase = getSupabaseAdmin();
  const { data: byRzOrder } = await supabase
    .from("orders")
    .select("id, status")
    .eq("razorpay_order_id", razorpay_order_id)
    .maybeSingle();

  return {
    orderId: byRzOrder?.id || null,
    alreadyPaid: byRzOrder?.status === "paid",
  };
}

export function invoiceJobKey(orderId: string, paymentId?: string | null): string {
  return paymentId ? `invoice-pay-${paymentId}` : `invoice-order-${orderId}`;
}
