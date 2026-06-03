import {
  encodeBillingTextsFallback,
  encodeGstConfigAddress,
  GST_CONFIG_OPTIONAL_COLUMNS,
  isMissingOptionalColumnError,
  resolveGstConfigBillingTexts,
  resolveGstConfigExtras,
} from '../../api/lib/gst-config-fields.js';
import { getUserFromAuthHeader, isAdminUser } from '../../api/lib/auth-api.js';
import { getSupabaseAdmin } from '../../api/lib/supabase-admin.js';

type Req = {
  method?: string;
  headers?: { authorization?: string; Authorization?: string };
  body?: Record<string, unknown>;
};

type Res = {
  status: (n: number) => { json: (o: unknown) => void; end: () => void };
};

function buildPayload(body: Record<string, unknown>, includeOptionalColumns: boolean) {
  const encodedAddress = encodeGstConfigAddress(String(body.address || ''), {
    bank_branch: String(body.bank_branch || ''),
    business_phone: String(body.business_phone || ''),
    business_email: String(body.business_email || ''),
    website_url: String(body.website_url || ''),
  });

  const payload: Record<string, unknown> = {
    business_name: body.business_name,
    legal_name: body.legal_name,
    gstin: body.gstin,
    pan: body.pan,
    address: encodedAddress,
    state_code: body.state_code,
    default_gst_rate: Number(body.default_gst_rate ?? 18),
    invoice_prefix: body.invoice_prefix,
    is_gst_inclusive_default: body.is_gst_inclusive_default,
    upi_id: body.upi_id,
    bank_name: body.bank_name,
    bank_account: body.bank_account,
    bank_ifsc: body.bank_ifsc,
  };

  const billingTexts = {
    thank_you_message: String(body.thank_you_message || ''),
    invoice_footer: String(body.invoice_footer || ''),
    terms_conditions: String(body.terms_conditions || ''),
  };

  if (includeOptionalColumns) {
    for (const column of GST_CONFIG_OPTIONAL_COLUMNS) {
      payload[column] = body[column] ?? null;
    }
    payload.address = String(body.address || '');
    payload.terms_footer = billingTexts.invoice_footer || null;
  } else {
    payload.terms_footer = encodeBillingTextsFallback(billingTexts);
  }

  return payload;
}

/** GET/PUT /api/admin/gst-config — admin GST & billing settings */
export default async function handler(req: Req, res: Res) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  const user = await getUserFromAuthHeader(authHeader);
  if (!user || !(await isAdminUser(user.id))) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const supabase = getSupabaseAdmin();

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('gst_config').select('*').limit(1).single();
    if (error) return res.status(500).json({ error: error.message });

    const row = data as Record<string, unknown>;
    const extras = resolveGstConfigExtras(row);
    const billingTexts = resolveGstConfigBillingTexts(row);
    return res.status(200).json({
      config: {
        ...data,
        address: extras.address,
        bank_branch: extras.bank_branch || '',
        business_phone: extras.business_phone || '',
        business_email: extras.business_email || '',
        website_url: extras.website_url || '',
        thank_you_message: billingTexts.thank_you_message,
        invoice_footer: billingTexts.invoice_footer,
        terms_conditions: billingTexts.terms_conditions,
      },
    });
  }

  if (req.method === 'PUT') {
    const body = req.body || {};
    const id = String(body.id || '').trim();
    if (!id) return res.status(400).json({ error: 'id is required' });

    let includeOptionalColumns = true;
    let { error } = await supabase.from('gst_config').update(buildPayload(body, true)).eq('id', id);

    if (error && isMissingOptionalColumnError(error.message)) {
      includeOptionalColumns = false;
      ({ error } = await supabase.from('gst_config').update(buildPayload(body, false)).eq('id', id));
    }

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({
      ok: true,
      used_optional_columns: includeOptionalColumns,
    });
  }

  return res.status(405).end();
}
