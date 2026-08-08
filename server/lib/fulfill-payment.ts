// import crypto from "crypto";
// import { getSupabaseAdmin } from "./supabase-admin.js";
// import {
//   orderHasDeliverableInvoice,
//   paymentHasDeliverableInvoice,
// } from "./invoice-engine.js";
// import {
//   resolveOrderForPayment,
//   resolveOrderAfterConflict,
// } from "./payment-order-map.js";
// import { mergeOrderMetadata } from "./order-form-details.js";
// import { scheduleInvoiceGeneration } from "./schedule-invoice.js";
// import { normalizeSourceWebsite } from "./connected-sites.js";
// import {
//   resolvePurchaserName,
//   syncServicePersonsForOrder,
// } from "./service-persons-store.js";
// const GOOGLE_SHEET_WEBHOOK =
//   "https://script.google.com/macros/s/AKfycbyhmp4MP7urN_PcRpaLYq1KCX137s-qtGIMvMaHO5AyKf2bIQeVpF-pYW1DZRggxzXWcA/exec";

// export type FulfillPaymentInput = {
//   razorpay_order_id: string;
//   razorpay_payment_id: string;
//   razorpay_signature?: string;
//   formData?: Record<string, unknown>;
//   service?: string;
//   amount?: number;
//   dbOrderId?: string | null;
// };

// export type FulfillPaymentResult = {
//   order_id: string;
//   invoice_number?: string;
//   invoice_ready: boolean;
//   invoice_warning?: string;
//   already_paid?: boolean;
// };

// export function buildPaymentSignature(orderId: string, paymentId: string): string | null {
//   const keySecret = process.env.RAZORPAY_KEY_SECRET;
//   if (!keySecret) return null;
//   return crypto.createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
// }

// async function saveOrderMetadata(orderId: string, formData: Record<string, unknown>): Promise<void> {
//   if (!Object.keys(formData).length) return;
//   const supabase = getSupabaseAdmin();
//   const { data: existingOrder } = await supabase.from("orders").select("metadata").eq("id", orderId).maybeSingle();
//   const metadata = mergeOrderMetadata(
//     existingOrder?.metadata as Record<string, unknown> | undefined,
//     formData,
//   );
//   await supabase.from("orders").update({ metadata }).eq("id", orderId);
// }

// export async function fulfillPayment(input: FulfillPaymentInput): Promise<FulfillPaymentResult> {
//   const {
//     razorpay_order_id,
//     razorpay_payment_id,
//     razorpay_signature,
//     formData = {},
//     service = "Service",
//     amount = 0,
//     dbOrderId: dbOrderIdFromClient = null,
//   } = input;

//   const supabase = getSupabaseAdmin();

//   const customer_name = resolvePurchaserName(formData, {
//     fallback: (formData.fullName as string) || "Customer",
//   });
//   const customer_email = formData.email ? String(formData.email) : null;
//   const customer_phone = formData.whatsapp ? String(formData.whatsapp) : null;
//   const userId = formData.userId || formData.user_id || null;
//   const sourceWebsite = normalizeSourceWebsite(
//     (formData.sourceWebsite as string | undefined) || (formData.source_website as string | undefined),
//   );

//   let orderId: string | null = null;
//   let alreadyPaid = false;

//   const resolved = await resolveOrderForPayment({
//     razorpay_payment_id,
//     razorpay_order_id,
//     dbOrderId: dbOrderIdFromClient,
//   });
//   orderId = resolved.orderId;
//   alreadyPaid = resolved.alreadyPaid;

//   const signature = razorpay_signature || buildPaymentSignature(razorpay_order_id, razorpay_payment_id) || null;

//   if (!orderId) {
//     const gstAmount = Math.round(amount * 0.18 * 100) / 100;
//     const { data: created, error: createErr } = await supabase
//       .from("orders")
//       .insert({
//         service_title: service,
//         amount: amount - gstAmount,
//         gst_amount: gstAmount,
//         total_amount: amount,
//         status: "paid",
//         workflow_stage: "payment_received",
//         razorpay_order_id,
//         razorpay_payment_id,
//         razorpay_signature: signature,
//         customer_name,
//         customer_email,
//         customer_phone,
//         user_id: userId,
//         source_website: sourceWebsite,
//         metadata: { formSnapshot: formData, sourceWebsite },
//       })
//       .select("id")
//       .single();

//     if (createErr?.code === "23505") {
//       const existing = await resolveOrderAfterConflict(razorpay_payment_id, razorpay_order_id);
//       orderId = existing.orderId;
//       alreadyPaid = existing.alreadyPaid;
//     } else if (createErr) {
//       throw createErr;
//     } else {
//       orderId = created?.id || null;
//     }
//   } else if (!alreadyPaid) {
//     const { error: updateErr } = await supabase
//       .from("orders")
//       .update({
//         status: "paid",
//         workflow_stage: "payment_received",
//         razorpay_payment_id,
//         razorpay_signature: signature,
//         payment_method: "razorpay",
//         customer_name,
//         customer_email,
//         customer_phone,
//         ...(userId ? { user_id: userId } : {}),
//       })
//       .eq("id", orderId);
//     if (updateErr) throw updateErr;
//   }

//   if (!orderId) throw new Error("Could not resolve order");

//   await saveOrderMetadata(orderId, formData);

//   try {
//   await fetch(GOOGLE_SHEET_WEBHOOK, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//   website: sourceWebsite,
//   name: customer_name,
//   email: customer_email,
//   phone: customer_phone,
//   service,
//   amount,
//   status: "Paid",
//   orderId,
//   paymentId: razorpay_payment_id,
//   createdAt: new Date().toISOString(),
// }),
//   });
// } catch (err) {
//   console.error("Google Sheet Sync Failed:", err);
// }

//   try {
//     const { data: updatedOrder } = await supabase
//       .from("orders")
//       .select("metadata")
//       .eq("id", orderId)
//       .maybeSingle();
//     const updatedMeta = (updatedOrder?.metadata as Record<string, unknown> | undefined) || {};
//     const snapshot =
//       (updatedMeta.formSnapshot as Record<string, unknown> | undefined) || formData;
//     await syncServicePersonsForOrder(orderId, snapshot);
//   } catch (err) {
//     console.warn("[fulfill-payment] Could not sync service persons:", err);
//   }

//   const hasInvoice =
//     (await paymentHasDeliverableInvoice(razorpay_payment_id)) ||
//     (await orderHasDeliverableInvoice(orderId));

//   if (!hasInvoice) {
//     await scheduleInvoiceGeneration(orderId, razorpay_payment_id);
//   }

//   let invoice_number: string | undefined;
//   if (hasInvoice) {
//     const { data: invoice } = await supabase
//       .from("invoices")
//       .select("invoice_number")
//       .eq("order_id", orderId)
//       .order("created_at", { ascending: true })
//       .limit(1)
//       .maybeSingle();
//     invoice_number = invoice?.invoice_number;
//   }

//   return {
//     order_id: orderId,
//     invoice_number,
//     invoice_ready: hasInvoice,
//     invoice_warning: hasInvoice ? undefined : "Invoice is being generated and will be emailed shortly.",
//     already_paid: alreadyPaid,
//   };
// }


import crypto from "crypto";
import { getSupabaseAdmin } from "./supabase-admin.js";
import {
  orderHasDeliverableInvoice,
  paymentHasDeliverableInvoice,
} from "./invoice-engine.js";
import {
  resolveOrderForPayment,
  resolveOrderAfterConflict,
} from "./payment-order-map.js";
import { mergeOrderMetadata, getOrderFormRows } from "./order-form-details.js";
import { scheduleInvoiceGeneration } from "./schedule-invoice.js";
import { normalizeSourceWebsite } from "./connected-sites.js";
import {
  resolvePurchaserName,
  syncServicePersonsForOrder,
} from "./service-persons-store.js";
const GOOGLE_SHEET_WEBHOOK =
  "https://script.google.com/macros/s/AKfycbyhmp4MP7urN_PcRpaLYq1KCX137s-qtGIMvMaHO5AyKf2bIQeVpF-pYW1DZRggxzXWcA/exec";

export type FulfillPaymentInput = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature?: string;
  formData?: Record<string, unknown>;
  service?: string;
  amount?: number;
  dbOrderId?: string | null;
};

export type FulfillPaymentResult = {
  order_id: string;
  invoice_number?: string;
  invoice_ready: boolean;
  invoice_warning?: string;
  already_paid?: boolean;
};

export function buildPaymentSignature(orderId: string, paymentId: string): string | null {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return null;
  return crypto.createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
}

async function saveOrderMetadata(orderId: string, formData: Record<string, unknown>): Promise<void> {
  if (!Object.keys(formData).length) return;
  const supabase = getSupabaseAdmin();
  const { data: existingOrder } = await supabase.from("orders").select("metadata").eq("id", orderId).maybeSingle();
  const metadata = mergeOrderMetadata(
    existingOrder?.metadata as Record<string, unknown> | undefined,
    formData,
  );
  await supabase.from("orders").update({ metadata }).eq("id", orderId);
}

export async function fulfillPayment(input: FulfillPaymentInput): Promise<FulfillPaymentResult> {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    formData = {},
    service = "Service",
    amount = 0,
    dbOrderId: dbOrderIdFromClient = null,
  } = input;

  const supabase = getSupabaseAdmin();

  const customer_name = resolvePurchaserName(formData, {
    fallback: (formData.fullName as string) || "Customer",
  });
  const customer_email = formData.email ? String(formData.email) : null;
  const customer_phone = formData.whatsapp ? String(formData.whatsapp) : null;
  const userId = formData.userId || formData.user_id || null;
  const sourceWebsite = normalizeSourceWebsite(
    (formData.sourceWebsite as string | undefined) || (formData.source_website as string | undefined),
  );

  let orderId: string | null = null;
  let alreadyPaid = false;

  const resolved = await resolveOrderForPayment({
    razorpay_payment_id,
    razorpay_order_id,
    dbOrderId: dbOrderIdFromClient,
  });
  orderId = resolved.orderId;
  alreadyPaid = resolved.alreadyPaid;

  const signature = razorpay_signature || buildPaymentSignature(razorpay_order_id, razorpay_payment_id) || null;

  if (!orderId) {
    const gstAmount = Math.round(amount * 0.18 * 100) / 100;
    const { data: created, error: createErr } = await supabase
      .from("orders")
      .insert({
        service_title: service,
        amount: amount - gstAmount,
        gst_amount: gstAmount,
        total_amount: amount,
        status: "paid",
        workflow_stage: "payment_received",
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature: signature,
        customer_name,
        customer_email,
        customer_phone,
        user_id: userId,
        source_website: sourceWebsite,
        metadata: { formSnapshot: formData, sourceWebsite },
      })
      .select("id")
      .single();

    if (createErr?.code === "23505") {
      const existing = await resolveOrderAfterConflict(razorpay_payment_id, razorpay_order_id);
      orderId = existing.orderId;
      alreadyPaid = existing.alreadyPaid;
    } else if (createErr) {
      throw createErr;
    } else {
      orderId = created?.id || null;
    }
  } else if (!alreadyPaid) {
    const { error: updateErr } = await supabase
      .from("orders")
      .update({
        status: "paid",
        workflow_stage: "payment_received",
        razorpay_payment_id,
        razorpay_signature: signature,
        payment_method: "razorpay",
        customer_name,
        customer_email,
        customer_phone,
        ...(userId ? { user_id: userId } : {}),
      })
      .eq("id", orderId);
    if (updateErr) throw updateErr;
  }

  if (!orderId) throw new Error("Could not resolve order");

  await saveOrderMetadata(orderId, formData);

  try {
  // FIX (2026-08-05): this payload previously only ever sent the fixed
  // columns below — none of the service-specific form fields (Person 1
  // Name/DOB, Hospital Name, Expected Delivery, etc.) were included at
  // all, for any service. This reuses the same labeled-field logic now
  // used for the invoice PDF/email, so the Sheet gets the same data.
  const formFieldRows = getOrderFormRows({ metadata: { formSnapshot: formData } });
  const formFieldsText = formFieldRows
    .map((row) => (row.kind === 'section' ? `— ${row.title} —` : `${row.label}: ${row.value}`))
    .join('\n');

  await fetch(GOOGLE_SHEET_WEBHOOK, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
  website: sourceWebsite,
  name: customer_name,
  email: customer_email,
  phone: customer_phone,
  service,
  amount,
  status: "Paid",
  orderId,
  paymentId: razorpay_payment_id,
  createdAt: new Date().toISOString(),
  // New: service-specific fields, in both forms —
  // formFields (plain text, one "Label: value" per line — easiest to drop
  // straight into a single Sheet column) and formFieldsList (structured
  // array, if the Apps Script would rather build its own columns).
  formFields: formFieldsText,
  formFieldsList: formFieldRows,
}),
  });
} catch (err) {
  console.error("Google Sheet Sync Failed:", err);
}

  try {
    const { data: updatedOrder } = await supabase
      .from("orders")
      .select("metadata")
      .eq("id", orderId)
      .maybeSingle();
    const updatedMeta = (updatedOrder?.metadata as Record<string, unknown> | undefined) || {};
    const snapshot =
      (updatedMeta.formSnapshot as Record<string, unknown> | undefined) || formData;
    await syncServicePersonsForOrder(orderId, snapshot);
  } catch (err) {
    console.warn("[fulfill-payment] Could not sync service persons:", err);
  }

  const hasInvoice =
    (await paymentHasDeliverableInvoice(razorpay_payment_id)) ||
    (await orderHasDeliverableInvoice(orderId));

  if (!hasInvoice) {
    await scheduleInvoiceGeneration(orderId, razorpay_payment_id);
  }

  let invoice_number: string | undefined;
  if (hasInvoice) {
    const { data: invoice } = await supabase
      .from("invoices")
      .select("invoice_number")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    invoice_number = invoice?.invoice_number;
  }

  return {
    order_id: orderId,
    invoice_number,
    invoice_ready: hasInvoice,
    invoice_warning: hasInvoice ? undefined : "Invoice is being generated and will be emailed shortly.",
    already_paid: alreadyPaid,
  };
}
