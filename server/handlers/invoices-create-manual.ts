// import { getUserFromAuthHeader, isAdminUser } from '../lib/auth-api.js';
// import { getSupabaseAdmin } from '../lib/supabase-admin.js';
// import { normalizeSourceWebsite } from '../lib/connected-sites.js';
// import { processInvoiceJob } from '../lib/invoice-engine.js';

// type Req = {
//   method?: string;
//   headers?: { authorization?: string; Authorization?: string };
//   body?: {
//     customerName?: string;
//     customerEmail?: string;
//     customerPhone?: string;
//     sourceWebsite?: string;
//     serviceTitle?: string;
//     packageName?: string;
//     price?: number | string;
//     gstRate?: number | string;
//     paymentStatus?: string;
//     invoiceDate?: string;
//     notes?: string;
//   };
// };

// type Res = {
//   status: (n: number) => { json: (o: unknown) => void; end: () => void };
// };

// /**
//  * POST /api/invoices/create-manual — admin-only.
//  *
//  * Creates an `orders` row from manually-entered fields (used by the admin
//  * "Create Invoice" modal), then hands off to the EXISTING invoice engine
//  * (processInvoiceJob) to do GST calculation, PDF generation, storage and
//  * email delivery — no invoice logic is duplicated here.
//  *
//  * NOTE: `gstRate` and `invoiceDate` are stored on the order's metadata for
//  * reference only. The underlying engine (generateInvoiceForOrder) currently
//  * always derives GST from `gst_config.default_gst_rate` and always stamps
//  * today's date — it does not yet accept per-order overrides. If you need
//  * these two fields to actually change the generated invoice, that requires
//  * a small follow-up change inside invoice-engine.ts itself.
//  */
// export default async function handler(req: Req, res: Res) {
//   if (req.method !== 'POST') return res.status(405).end();

//   const authHeader = req.headers?.authorization || req.headers?.Authorization;
//   const user = await getUserFromAuthHeader(authHeader);
//   if (!user || !(await isAdminUser(user.id))) {
//     return res.status(403).json({ error: 'Admin access required' });
//   }

//   const body = req.body || {};
//   const customerName = String(body.customerName || '').trim();
//   const customerEmail = String(body.customerEmail || '').trim();
//   const serviceTitle = String(body.serviceTitle || '').trim();
//   const price = Number(body.price);

//   if (!customerName) return res.status(400).json({ error: 'Customer name is required' });
//   if (!customerEmail) return res.status(400).json({ error: 'Customer email is required' });
//   if (!serviceTitle) return res.status(400).json({ error: 'Service is required' });
//   if (!price || price <= 0) return res.status(400).json({ error: 'A valid price is required' });

//   const sourceWebsite = normalizeSourceWebsite(body.sourceWebsite);
//   const paymentStatus = String(body.paymentStatus || 'paid');

//   const supabase = getSupabaseAdmin();

//   try {
//     const { data: order, error: orderErr } = await supabase
//       .from('orders')
//       .insert({
//         customer_name: customerName,
//         customer_email: customerEmail,
//         customer_phone: body.customerPhone ? String(body.customerPhone) : null,
//         service_title: body.packageName ? `${serviceTitle} — ${body.packageName}` : serviceTitle,
//         amount: price,
//         total_amount: price,
//         status: paymentStatus,
//         workflow_stage: paymentStatus === 'paid' ? 'payment_received' : 'order_created',
//         source_website: sourceWebsite,
//         order_type: 'manual',
//         payment_method: 'manual',
//         metadata: {
//           notes: body.notes || null,
//           packageName: body.packageName || null,
//           requestedGstRate: body.gstRate != null && body.gstRate !== '' ? Number(body.gstRate) : null,
//           requestedInvoiceDate: body.invoiceDate || null,
//           createdByAdmin: user.id,
//           manualEntry: true,
//         },
//       })
//       .select('*')
//       .single();

//     if (orderErr || !order) {
//       return res.status(500).json({ error: orderErr?.message || 'Could not create order' });
//     }

//     const result = await processInvoiceJob(order.id, { forceDeliver: paymentStatus === 'paid' });

//     if (result.skipped || !result.invoiceId) {
//       return res.status(202).json({
//         ok: false,
//         order_id: order.id,
//         error: 'Invoice generation is still in progress. Please refresh in a few seconds.',
//       });
//     }

//     return res.status(201).json({
//       ok: true,
//       order_id: order.id,
//       invoice_id: result.invoiceId,
//       invoice_number: result.invoiceNumber,
//       duplicate: result.duplicate ?? false,
//     });
//   } catch (e: unknown) {
//     const msg = e instanceof Error ? e.message : 'Invoice creation failed';
//     console.error('[invoices-create-manual]', msg, e);
//     return res.status(500).json({ error: msg });
//   }
// }

// import { getUserFromAuthHeader, isAdminUser } from '../lib/auth-api.js';
// import { getSupabaseAdmin } from '../lib/supabase-admin.js';
// import { normalizeSourceWebsite } from '../lib/connected-sites.js';
// import { processInvoiceJob } from '../lib/invoice-engine.js';

// type Req = {
//   method?: string;
//   headers?: { authorization?: string; Authorization?: string };
//   body?: {
//     customerName?: string;
//     customerEmail?: string;
//     customerPhone?: string;
//     sourceWebsite?: string;
//     serviceTitle?: string;
//     packageName?: string;
//     price?: number | string;
//     gstRate?: number | string;
//     paymentStatus?: string;
//     invoiceDate?: string;
//     notes?: string;
//     // Billing details — required by resolveCustomerBilling() to correctly
//     // determine place of supply (CGST/SGST vs IGST). Without these, the
//     // engine falls back to treating the customer as being in the
//     // business's own state, generating incorrect GST for out-of-state
//     // customers.
//     customerCity?: string;
//     customerState?: string;
//     customerPincode?: string;
//     customerGstin?: string;
//   };
// };

// type Res = {
//   status: (n: number) => { json: (o: unknown) => void; end: () => void };
// };

// /**
//  * POST /api/invoices/create-manual — admin-only.
//  *
//  * Creates an `orders` row from manually-entered fields (used by the admin
//  * "Create Invoice" modal), then hands off to the EXISTING invoice engine
//  * (processInvoiceJob) to do GST calculation, PDF generation, storage and
//  * email delivery — no invoice logic is duplicated here.
//  *
//  * NOTE: `gstRate` and `invoiceDate` are stored on the order's metadata for
//  * reference only. The underlying engine (generateInvoiceForOrder) currently
//  * always derives GST from `gst_config.default_gst_rate` and always stamps
//  * today's date — it does not yet accept per-order overrides. If you need
//  * these two fields to actually change the generated invoice, that requires
//  * a small follow-up change inside invoice-engine.ts itself.
//  */
// export default async function handler(req: Req, res: Res) {
//   if (req.method !== 'POST') return res.status(405).end();

//   const authHeader = req.headers?.authorization || req.headers?.Authorization;
//   const user = await getUserFromAuthHeader(authHeader);
//   if (!user || !(await isAdminUser(user.id))) {
//     return res.status(403).json({ error: 'Admin access required' });
//   }

//   const body = req.body || {};
//   const customerName = String(body.customerName || '').trim();
//   const customerEmail = String(body.customerEmail || '').trim();
//   const serviceTitle = String(body.serviceTitle || '').trim();
//   const price = Number(body.price);

//   if (!customerName) return res.status(400).json({ error: 'Customer name is required' });
//   if (!customerEmail) return res.status(400).json({ error: 'Customer email is required' });
//   if (!serviceTitle) return res.status(400).json({ error: 'Service is required' });
//   if (!price || price <= 0) return res.status(400).json({ error: 'A valid price is required' });

//   // Billing details — required for correct GST classification.
//   // City, state and pincode are enforced as required by the admin UI, but
//   // we defensively trim/normalize here too since this is a server boundary.
//   const customerCity = body.customerCity ? String(body.customerCity).trim() : '';
//   const customerState = body.customerState ? String(body.customerState).trim() : '';
//   const customerPincode = body.customerPincode ? String(body.customerPincode).trim() : '';
//   const customerGstin = body.customerGstin ? String(body.customerGstin).trim().toUpperCase() : '';

//   const sourceWebsite = normalizeSourceWebsite(body.sourceWebsite);
//   const paymentStatus = String(body.paymentStatus || 'paid');

//   const supabase = getSupabaseAdmin();

//   try {
//     const { data: order, error: orderErr } = await supabase
//       .from('orders')
//       .insert({
//         customer_name: customerName,
//         customer_email: customerEmail,
//         customer_phone: body.customerPhone ? String(body.customerPhone) : null,
//         service_title: body.packageName ? `${serviceTitle} — ${body.packageName}` : serviceTitle,
//         amount: price,
//         total_amount: price,
//         status: paymentStatus,
//         workflow_stage: paymentStatus === 'paid' ? 'payment_received' : 'order_created',
//         source_website: sourceWebsite,
//         order_type: 'manual',
//         payment_method: 'manual',
//         metadata: {
//           notes: body.notes || null,
//           packageName: body.packageName || null,
//           requestedGstRate: body.gstRate != null && body.gstRate !== '' ? Number(body.gstRate) : null,
//           requestedInvoiceDate: body.invoiceDate || null,
//           createdByAdmin: user.id,
//           manualEntry: true,
//           // Exact keys expected by resolveCustomerBilling() — do not rename.
//           currentCity: customerCity || null,
//           customerState: customerState || null,
//           pincode: customerPincode || null,
//           customerGstin: customerGstin || null,
//         },
//       })
//       .select('*')
//       .single();

//     if (orderErr || !order) {
//       return res.status(500).json({ error: orderErr?.message || 'Could not create order' });
//     }

//     const result = await processInvoiceJob(order.id, { forceDeliver: paymentStatus === 'paid' });

//     if (result.skipped || !result.invoiceId) {
//       return res.status(202).json({
//         ok: false,
//         order_id: order.id,
//         error: 'Invoice generation is still in progress. Please refresh in a few seconds.',
//       });
//     }

//     return res.status(201).json({
//       ok: true,
//       order_id: order.id,
//       invoice_id: result.invoiceId,
//       invoice_number: result.invoiceNumber,
//       duplicate: result.duplicate ?? false,
//     });
//   } catch (e: unknown) {
//     const msg = e instanceof Error ? e.message : 'Invoice creation failed';
//     console.error('[invoices-create-manual]', msg, e);
//     return res.status(500).json({ error: msg });
//   }
// }


import { getUserFromAuthHeader, isAdminUser } from '../lib/auth-api.js';
import { getSupabaseAdmin } from '../lib/supabase-admin.js';
import { normalizeSourceWebsite } from '../lib/connected-sites.js';
import { processInvoiceJob } from '../lib/invoice-engine.js';

type Req = {
  method?: string;
  headers?: { authorization?: string; Authorization?: string };
  body?: {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    sourceWebsite?: string;
    serviceTitle?: string;
    packageName?: string;
    price?: number | string;
    gstRate?: number | string;
    paymentStatus?: string;
    invoiceDate?: string;
    notes?: string;
    customerCity?: string;
    customerState?: string;
    customerPincode?: string;
    customerGstin?: string;
  };
};

type Res = {
  status: (n: number) => { json: (o: unknown) => void; end: () => void };
};

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).end();

  const authHeader = req.headers?.authorization || req.headers?.Authorization;

  // ---- DEBUG START (remove after fixing 403) ----
  console.log('=== [create-manual] DEBUG ===');
  console.log('authHeader present:', !!authHeader);
  console.log('authHeader value (first 30 chars):', authHeader?.slice(0, 30));
  // ---- DEBUG END ----

  const user = await getUserFromAuthHeader(authHeader);

  // ---- DEBUG START ----
  console.log('resolved user:', user ? { id: user.id, email: user.email } : null);
  // ---- DEBUG END ----

  if (!user) {
    console.log('[create-manual] FAILED: getUserFromAuthHeader returned null — token invalid or env vars missing');
    return res.status(403).json({ error: 'Admin access required' });
  }

  const adminCheck = await isAdminUser(user.id);

  // ---- DEBUG START ----
  console.log('isAdminUser result:', adminCheck, 'for user id:', user.id);
  // ---- DEBUG END ----

  if (!adminCheck) {
    console.log('[create-manual] FAILED: isAdminUser returned false for user:', user.id);
    return res.status(403).json({ error: 'Admin access required' });
  }

  console.log('[create-manual] === ADMIN CHECK PASSED ===');

  const body = req.body || {};
  const customerName = String(body.customerName || '').trim();
  const customerEmail = String(body.customerEmail || '').trim();
  const serviceTitle = String(body.serviceTitle || '').trim();
  const price = Number(body.price);

  if (!customerName) return res.status(400).json({ error: 'Customer name is required' });
  if (!customerEmail) return res.status(400).json({ error: 'Customer email is required' });
  if (!serviceTitle) return res.status(400).json({ error: 'Service is required' });
  if (!price || price <= 0) return res.status(400).json({ error: 'A valid price is required' });

  const customerCity = body.customerCity ? String(body.customerCity).trim() : '';
  const customerState = body.customerState ? String(body.customerState).trim() : '';
  const customerPincode = body.customerPincode ? String(body.customerPincode).trim() : '';
  const customerGstin = body.customerGstin ? String(body.customerGstin).trim().toUpperCase() : '';

  const sourceWebsite = normalizeSourceWebsite(body.sourceWebsite);
  const paymentStatus = String(body.paymentStatus || 'paid');

  const supabase = getSupabaseAdmin();

  try {
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: body.customerPhone ? String(body.customerPhone) : null,
        service_title: body.packageName ? `${serviceTitle} — ${body.packageName}` : serviceTitle,
        amount: price,
        total_amount: price,
        status: paymentStatus,
        workflow_stage: paymentStatus === 'paid' ? 'payment_received' : 'order_created',
        source_website: sourceWebsite,
        order_type: 'service',
        payment_method: 'manual',
        metadata: {
          notes: body.notes || null,
          packageName: body.packageName || null,
          requestedGstRate: body.gstRate != null && body.gstRate !== '' ? Number(body.gstRate) : null,
          requestedInvoiceDate: body.invoiceDate || null,
          createdByAdmin: user.id,
          manualEntry: true,
          currentCity: customerCity || null,
          customerState: customerState || null,
          pincode: customerPincode || null,
          customerGstin: customerGstin || null,
        },
      })
      .select('*')
      .single();

    if (orderErr || !order) {
      return res.status(500).json({ error: orderErr?.message || 'Could not create order' });
    }

    const result = await processInvoiceJob(order.id, { forceDeliver: paymentStatus === 'paid' });

    if (result.skipped || !result.invoiceId) {
      return res.status(202).json({
        ok: false,
        order_id: order.id,
        error: 'Invoice generation is still in progress. Please refresh in a few seconds.',
      });
    }

    return res.status(201).json({
      ok: true,
      order_id: order.id,
      invoice_id: result.invoiceId,
      invoice_number: result.invoiceNumber,
      duplicate: result.duplicate ?? false,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Invoice creation failed';
    console.error('[invoices-create-manual]', msg, e);
    return res.status(500).json({ error: msg });
  }
}