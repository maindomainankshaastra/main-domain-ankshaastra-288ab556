
// import { getUserFromAuthHeader, isAdminUser } from '../lib/auth-api.js';
import { getUserFromAuthHeader, hasModuleAccess } from '../lib/auth-api.js';
import { getSupabaseAdmin } from '../lib/supabase-admin.js';
import { normalizeSourceWebsite } from '../lib/connected-sites.js';
import { processInvoiceJob } from '../lib/invoice-engine.js';
import { logAuditForUser } from '../lib/audit-log.js';

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

  // const adminCheck = await isAdminUser(user.id);
  const adminCheck = await hasModuleAccess(user.id, 'invoices');

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

    await logAuditForUser(user, {
      actionType: 'invoice_generated',
      module: 'invoices',
      recordId: result.invoiceId,
      recordName: result.invoiceNumber,
    });

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




// // import { getUserFromAuthHeader, isAdminUser } from '../lib/auth-api.js';
// import { getUserFromAuthHeader, hasModuleAccess } from '../lib/auth-api.js';
// import { getSupabaseAdmin } from '../lib/supabase-admin.js';
// import { normalizeSourceWebsite } from '../lib/connected-sites.js';
// import { triggerInvoiceGenerationInBackground } from '../lib/schedule-invoice.js';
// import { logAuditForUser } from '../lib/audit-log.js';

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
//     customerCity?: string;
//     customerState?: string;
//     customerPincode?: string;
//     customerGstin?: string;
//   };
// };

// type Res = {
//   status: (n: number) => { json: (o: unknown) => void; end: () => void };
// };

// export default async function handler(req: Req, res: Res) {
//   if (req.method !== 'POST') return res.status(405).end();

//   const authHeader = req.headers?.authorization || req.headers?.Authorization;

//   // ---- DEBUG START (remove after fixing 403) ----
//   console.log('=== [create-manual] DEBUG ===');
//   console.log('authHeader present:', !!authHeader);
//   console.log('authHeader value (first 30 chars):', authHeader?.slice(0, 30));
//   // ---- DEBUG END ----

//   const user = await getUserFromAuthHeader(authHeader);

//   // ---- DEBUG START ----
//   console.log('resolved user:', user ? { id: user.id, email: user.email } : null);
//   // ---- DEBUG END ----

//   if (!user) {
//     console.log('[create-manual] FAILED: getUserFromAuthHeader returned null — token invalid or env vars missing');
//     return res.status(403).json({ error: 'Admin access required' });
//   }

//   // const adminCheck = await isAdminUser(user.id);
//   const adminCheck = await hasModuleAccess(user.id, 'invoices');

//   // ---- DEBUG START ----
//   console.log('isAdminUser result:', adminCheck, 'for user id:', user.id);
//   // ---- DEBUG END ----

//   if (!adminCheck) {
//     console.log('[create-manual] FAILED: isAdminUser returned false for user:', user.id);
//     return res.status(403).json({ error: 'Admin access required' });
//   }

//   console.log('[create-manual] === ADMIN CHECK PASSED ===');

//   const body = req.body || {};
//   const customerName = String(body.customerName || '').trim();
//   const customerEmail = String(body.customerEmail || '').trim();
//   const serviceTitle = String(body.serviceTitle || '').trim();
//   const price = Number(body.price);

//   if (!customerName) return res.status(400).json({ error: 'Customer name is required' });
//   if (!customerEmail) return res.status(400).json({ error: 'Customer email is required' });
//   if (!serviceTitle) return res.status(400).json({ error: 'Service is required' });
//   if (!price || price <= 0) return res.status(400).json({ error: 'A valid price is required' });

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
//         order_type: 'service',
//         payment_method: 'manual',
//         metadata: {
//           notes: body.notes || null,
//           packageName: body.packageName || null,
//           requestedGstRate: body.gstRate != null && body.gstRate !== '' ? Number(body.gstRate) : null,
//           requestedInvoiceDate: body.invoiceDate || null,
//           createdByAdmin: user.id,
//           manualEntry: true,
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

//     // Don't block this request on PDF render + email send (previously the
//     // "Confirm & Create" button waited on the full processInvoiceJob()
//     // pipeline — puppeteer/chromium launch + storage upload + email —
//     // which is what made invoice creation feel very slow). Fire it in the
//     // background and respond immediately; the invoice row will appear in
//     // the list once generation finishes (job queue + cron is the safety
//     // net if the fire-and-forget call itself gets interrupted).
//     await triggerInvoiceGenerationInBackground(order.id, { forceDeliver: paymentStatus === 'paid' });

//     await logAuditForUser(user, {
//       actionType: 'invoice_generation_queued',
//       module: 'invoices',
//       recordId: order.id,
//       recordName: customerName,
//     });

//     return res.status(202).json({
//       ok: true,
//       order_id: order.id,
//       status: 'generating',
//       message: 'Invoice is being generated and will appear in the list shortly.',
//     });
//   } catch (e: unknown) {
//     const msg = e instanceof Error ? e.message : 'Invoice creation failed';
//     console.error('[invoices-create-manual]', msg, e);
//     return res.status(500).json({ error: msg });
//   }
// }
