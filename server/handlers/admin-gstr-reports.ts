import { getUserFromAuthHeader, isAdminUser } from '../lib/auth-api.js';
import { getSupabaseAdmin } from '../lib/supabase-admin.js';
import { normalizeInvoiceForGstr } from '../lib/gst-auto-fix.js';
import { filterInvoicesByPeriod } from '../lib/gstr-aggregate.js';
import {
  buildGstr1Workbook,
  buildGstSummaryWorkbook,
  buildSalesRegisterWorkbook,
  buildSacSummaryWorkbook,
  type GstExportMeta,
} from '../lib/gstr-excel-export.js';
import {
  buildGstrDashboard,
  buildValidationReport,
  validateGstConfig,
  validateInvoicesForGstr,
  type GstValidationIssue,
  type InvoiceGstRow,
} from '../lib/gst-validation.js';
import { resolveGstConfigExtras } from '../lib/gst-config-fields.js';

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
    .select('*, orders:order_id(id, metadata)')
    .gte('invoice_date', start)
    .lt('invoice_date', end)
    .in('status', ['paid', 'generating'])
    .order('invoice_date', { ascending: true });

  if (error) throw error;
  return (data || []) as Record<string, unknown>[];
}

function prepareInvoices(
  raw: Record<string, unknown>[],
  gstConfig: Record<string, unknown> | null,
): { invoices: InvoiceGstRow[]; info: GstValidationIssue[] } {
  const info: GstValidationIssue[] = [];
  const invoices = raw.map((row) => {
    const order = (row.orders as Record<string, unknown> | null) || null;
    const { invoice, info: rowInfo } = normalizeInvoiceForGstr(row, order, gstConfig);
    info.push(...rowInfo);
    return {
      ...invoice,
      invoice_date: String(invoice.invoice_date || '').slice(0, 10),
      total_amount: Number(invoice.total_amount || 0),
    } as InvoiceGstRow;
  });
  return { invoices, info };
}

async function getFilingStatus(periodLabel: string): Promise<'draft' | 'ready_to_file' | 'filed'> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('gstr_export_runs')
    .select('status')
    .eq('filing_period', periodLabel)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const status = String(data?.status || 'draft');
  if (status === 'filed') return 'filed';
  if (status === 'ready_to_file' || status === 'exported') return 'ready_to_file';
  return 'draft';
}

async function runValidation(year: number, month: number) {
  const supabase = getSupabaseAdmin();
  const { data: config } = await supabase.from('gst_config').select('*').limit(1).single();
  const configIssues = validateGstConfig((config || {}) as Record<string, unknown>);
  const raw = await loadPeriodInvoices(year, month);
  const filtered = filterInvoicesByPeriod(
    raw.map((r) => ({
      ...r,
      invoice_date: String(r.invoice_date || '').slice(0, 10),
      total_amount: Number(r.total_amount || 0),
    })) as Parameters<typeof filterInvoicesByPeriod>[0],
    year,
    month,
  );
  const rawById = new Map(raw.map((r) => [String(r.id), r]));
  const preparedRaw = filtered.map((inv) => rawById.get(String(inv.id)) || inv);
  const { invoices, info } = prepareInvoices(preparedRaw, (config || {}) as Record<string, unknown>);
  const invoiceIssues = validateInvoicesForGstr(invoices);
  const report = buildValidationReport(configIssues, invoiceIssues, info);
  const dashboard = buildGstrDashboard(invoices, invoiceIssues);
  const storedStatus = await getFilingStatus(`${year}-${String(month).padStart(2, '0')}`);
  const filingStatus = report.errors.length > 0 ? 'draft' : storedStatus === 'filed' ? 'filed' : report.filingStatus;

  return { invoices, report, dashboard, filingStatus };
}

function exportMeta(
  config: Record<string, unknown>,
  periodLabel: string,
  generatedBy: string,
): GstExportMeta {
  return {
    companyName: String(config.legal_name || config.business_name || 'ANKSHAASTRA OCCULT EXPERTS LLP'),
    gstin: String(config.gstin || '09AAFFE7583B1ZD'),
    filingPeriod: periodLabel,
    generatedAt: new Date().toISOString(),
    generatedBy,
  };
}

/** GET validate / POST export / POST mark-ready GSTR reports */
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
    const { report, dashboard, filingStatus } = await runValidation(period.year, period.month);
    return res.status(200).json({
      period: period.label,
      filingStatus,
      dashboard,
      ...report,
    });
  }

  if (req.method === 'POST' && action === 'mark-ready') {
    const { report } = await runValidation(period.year, period.month);
    if (!report.readyToFile) {
      return res.status(400).json({
        error: 'Cannot mark ready — fix errors first',
        period: period.label,
        ...report,
      });
    }
    const supabase = getSupabaseAdmin();
    await supabase.from('gstr_export_runs').insert({
      filing_period: period.label,
      export_type: 'status',
      status: 'ready_to_file',
      validation_errors: report.errors,
      validation_warnings: report.warnings,
      ready_to_file: true,
      generated_by: user.id,
      metadata: { info: report.info },
    });
    return res.status(200).json({ ok: true, period: period.label, filingStatus: 'ready_to_file' });
  }

  if (req.method === 'POST' && action === 'mark-filed') {
    const supabase = getSupabaseAdmin();
    await supabase.from('gstr_export_runs').insert({
      filing_period: period.label,
      export_type: 'status',
      status: 'filed',
      ready_to_file: true,
      generated_by: user.id,
    });
    return res.status(200).json({ ok: true, period: period.label, filingStatus: 'filed' });
  }

  if (req.method === 'POST') {
    const { invoices, report } = await runValidation(period.year, period.month);
    if (!report.readyToFile) {
      return res.status(400).json({
        error: 'Validation failed — fix errors before export',
        period: period.label,
        ...report,
      });
    }

    const supabase = getSupabaseAdmin();
    const { data: config } = await supabase.from('gst_config').select('*').limit(1).single();

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
        validation_errors: report.errors,
        validation_warnings: report.warnings,
        ready_to_file: true,
        generated_by: user.id,
        metadata: { info: report.info },
      });
    } catch {
      // table may not exist until migration runs
    }

    return res.status(200).json({
      filename,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      data: buffer.toString('base64'),
      warnings: report.warnings,
    });
  }

  return res.status(405).end();
}
