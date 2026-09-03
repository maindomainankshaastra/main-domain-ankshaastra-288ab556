import { getSupabaseAdmin } from './supabase-admin.js';
import { buildInvoiceTemplateData } from './build-invoice-template.js';
import { generateInvoicePdf } from './pdf-engine.js';
import { resolveOrderServiceSubjects } from './service-persons-store.js';

/**
 * Rebuilds an invoice PDF on the fly for invoices whose stored file was
 * purged by the 6-month Storage retention job (see invoice-pdf-retention.ts).
 *
 * This is intentionally NOT written back to Storage — regenerating each
 * time keeps Storage usage at zero for old invoices instead of slowly
 * re-filling it. All source data (invoices row, orders row, service_persons)
 * is permanent and never deleted, so this works for any invoice, however old.
 *
 * The invoice number and original invoice/due dates are taken from the
 * `invoices` row itself (never recalculated), so the reprinted PDF always
 * shows the same number and date it was originally issued with — only the
 * GST breakdown is recomputed from current business config, matching the
 * exact same code path used when the invoice was first generated.
 */
export async function regenerateInvoicePdfBuffer(invoiceId: string): Promise<Buffer | null> {
  const supabase = getSupabaseAdmin();

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();

  if (invoiceError || !invoice) {
    console.error('[invoice-regenerate] invoice not found:', invoiceId, invoiceError?.message);
    return null;
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', invoice.order_id)
    .single();

  if (orderError || !order) {
    console.error('[invoice-regenerate] source order not found for invoice:', invoiceId, orderError?.message);
    return null;
  }

  const { data: gstConfig } = await supabase.from('gst_config').select('*').limit(1).single();

  const paymentId = invoice.razorpay_payment_id || (order.razorpay_payment_id as string | undefined);

  let serviceSubjects: Array<{ person_index: number; full_name: string }> = [];
  try {
    const subjects = await resolveOrderServiceSubjects(order);
    serviceSubjects = subjects.map((p) => ({ person_index: p.person_index, full_name: p.full_name }));
  } catch (err) {
    console.warn('[invoice-regenerate] resolveOrderServiceSubjects failed, continuing without:', err);
  }

  const { templateData } = buildInvoiceTemplateData({
    order,
    gstConfig,
    invoiceNumber: invoice.invoice_number,
    paymentId,
    paymentMethod: order.payment_method as string | undefined,
    serviceSubjects,
  });

  // Preserve the ORIGINAL invoice/due dates exactly as issued — don't let
  // regeneration stamp today's date on an old invoice.
  const formatDate = (value: unknown) => {
    if (!value) return templateData.invoiceDate;
    const d = new Date(String(value));
    if (isNaN(d.getTime())) return templateData.invoiceDate;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  templateData.invoiceDate = formatDate(invoice.invoice_date);
  templateData.dueDate = invoice.due_date ? formatDate(invoice.due_date) : templateData.invoiceDate;

  const { buffer } = await generateInvoicePdf(templateData);
  return buffer;
}
