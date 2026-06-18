import { getUserFromAuthHeader, isAdminUser } from '../../api/lib/auth-api.js';
import { getSupabaseAdmin } from '../../api/lib/supabase-admin.js';
import { filterInvoicesByPeriod } from '../../api/lib/gstr-aggregate.js';
import {
  buildGstr1Workbook,
  buildGstSummaryWorkbook,
  buildSalesRegisterWorkbook,
  buildSacSummaryWorkbook,
  type GstExportMeta,
} from '../../api/lib/gstr-excel-export.js';
import {
  buildValidationReport,
  validateGstConfig,
  validateInvoicesForGstr,
  type InvoiceGstRow,
} from '../../api/lib/gst-validation.js';
import { resolveGstConfigExtras } from '../../api/lib/gst-config-fields.js';

type Req = {
  method?: string;
  headers?: { authorization?: string; Authorization?: string };
  body?: Record<string, unknown>;
  query?: Record<string, string | string[] | undefined>;
};

type Res = {
  status: (n: number) => { json: (o: unknown) => void; end: () => void };
};

function parsePeriod(year: number, month: number) {
  const y = Number(year);
  const m = Number(month);
  if (!y || m < 1 || m > 12) throw new Error('Invalid year or month');
  return { year: y, month: m, label: `${y}-${String(m).padStart(2, '0')}` };
}

async function loadPeriodInvoices(year: number, month: number) {
  const supabase = getSupabaseAdmin();
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const end = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .gte('invoice_date', start)
    .lt('invoice_date', end)
    .in('status', ['paid', 'generating'])
    .order('invoice_date', { ascending: true });

  if (error) throw error;
  return (data || []) as Record<string, unknown>[];
}

async function runValidation(year: number, month: number) {
  const supabase = getSupabaseAdmin();
  const { data: config } = await supabase.from('gst_config').select('*').limit(1).single();
  const configIssues = validateGstConfig((config || {}) as Record<string, unknown>);
  const raw = await loadPeriodInvoices(year, month);
  const invoices = filterInvoicesByPeriod(
    raw.map((r) => ({
      ...r,
      invoice_date: String(r.invoice_date || '').slice(0, 10),
      total_amount: Number(r.total_amount || 0),
    })) as Parameters<typeof filterInvoicesByPeriod>[0],
    year,
    month,
  );
  const invoiceIssues = validateInvoicesForGstr(invoices as InvoiceGstRow[]);
  return buildValidationReport(configIssues, invoiceIssues);
}

function exportMeta(
  config: Record<string, unknown>,
  periodLabel: string,
  generatedBy: string,
): GstExportMeta {
  const extras = resolveGstConfigExtras(config);
  return {
    companyName: String(config.legal_name || config.business_name || 'Ankshaastra'),
    gstin: String(config.gstin || ''),
    filingPeriod: periodLabel,
    generatedAt: new Date().toISOString(),
    generatedBy,
  };
}

/** GET validate / POST export GSTR reports */
export default async function handler(req: Req, res: Res) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  const user = await getUserFromAuthHeader(authHeader);
  if (!user || !(await isAdminUser(user.id))) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const body = req.body || {};
  const query = req.query || {};
  const year = Number(body.year ?? query.year);
  const month = Number(body.month ?? query.month);
  const action = String(body.action ?? query.action ?? 'validate');

  let period: ReturnType<typeof parsePeriod>;
  try {
    period = parsePeriod(year, month);
  } catch (e: unknown) {
    return res.status(400).json({ error: e instanceof Error ? e.message : 'Invalid period' });
  }

  if (req.method === 'GET' || action === 'validate') {
    const report = await runValidation(period.year, period.month);
    return res.status(200).json({
      period: period.label,
      ...report,
    });
  }

  if (req.method === 'POST') {
    const validation = await runValidation(period.year, period.month);
    if (!validation.readyToFile) {
      return res.status(400).json({
        error: 'Validation failed — fix errors before export',
        period: period.label,
        ...validation,
      });
    }

    const supabase = getSupabaseAdmin();
    const { data: config } = await supabase.from('gst_config').select('*').limit(1).single();
    const raw = await loadPeriodInvoices(period.year, period.month);
    const invoices = filterInvoicesByPeriod(
      raw.map((r) => ({
        ...r,
        invoice_date: String(r.invoice_date || '').slice(0, 10),
        total_amount: Number(r.total_amount || 0),
      })) as Parameters<typeof filterInvoicesByPeriod>[0],
      period.year,
      period.month,
    );

    const meta = exportMeta(
      (config || {}) as Record<string, unknown>,
      period.label,
      user.email || user.id,
    );

    const exportType = String(body.type || 'gstr1');
    let buffer: Buffer;
    let filename: string;

    switch (exportType) {
      case 'summary':
        buffer = await buildGstSummaryWorkbook(invoices, meta);
        filename = `GST-Summary-${period.label}.xlsx`;
        break;
      case 'sales':
        buffer = await buildSalesRegisterWorkbook(invoices, meta);
        filename = `Sales-Register-${period.label}.xlsx`;
        break;
      case 'sac':
        buffer = await buildSacSummaryWorkbook(invoices, meta);
        filename = `SAC-Summary-${period.label}.xlsx`;
        break;
      case 'gstr1':
      default:
        buffer = await buildGstr1Workbook(invoices, meta);
        filename = `GSTR1-${period.label}.xlsx`;
        break;
    }

    try {
      await supabase.from('gstr_export_runs').insert({
        filing_period: period.label,
        export_type: exportType,
        status: 'exported',
        validation_errors: validation.errors,
        validation_warnings: validation.warnings,
        ready_to_file: true,
        generated_by: user.id,
      });
    } catch {
      // table may not exist until migration runs
    }

    return res.status(200).json({
      filename,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      data: buffer.toString('base64'),
    });
  }

  return res.status(405).end();
}
