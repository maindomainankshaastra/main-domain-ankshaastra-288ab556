import { getSupabaseAdmin } from './supabase-admin.js';

const BUCKET = 'invoices';
const RETENTION_MONTHS = 6;
const BATCH_SIZE = 100; // keep each cron run small/fast — remaining rows get picked up next run

/**
 * Deletes invoice PDF *files* from Supabase Storage once they're older than
 * RETENTION_MONTHS. This is Storage-only cleanup:
 *
 *  - The `invoices` DB row is NEVER touched/deleted — invoice_number,
 *    amounts, gstr_category, customer details, dates, etc. all remain
 *    exactly as they were, forever.
 *  - GSTR reports (server/lib/gstr-aggregate.ts) and the Google Sheet CRM
 *    module (src/pages/admin/modules/CrmModule.tsx) both read the
 *    `invoices` table directly — neither is affected by this job.
 *  - Only `pdf_storage_path` / `pdf_url` are cleared (so the UI stops
 *    offering a dead download link) and `pdf_purged_at` is stamped for audit.
 *
 * Purpose: keep Supabase Storage usage low enough to stay on the free tier
 * (Storage, not DB row count, is what triggers the paid-plan prompt).
 */
export async function purgeOldInvoicePdfs() {
  const supabase = getSupabaseAdmin();

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - RETENTION_MONTHS);
  const cutoffIso = cutoff.toISOString();

  const { data: candidates, error: selectError } = await supabase
    .from('invoices')
    .select('id, pdf_storage_path, created_at')
    .not('pdf_storage_path', 'is', null)
    .is('pdf_purged_at', null)
    .lt('created_at', cutoffIso)
    .limit(BATCH_SIZE);

  if (selectError) {
    console.error('[invoice-pdf-retention] failed to query candidates:', selectError.message);
    return { checked: 0, purged: 0, failed: 0, errors: [selectError.message] };
  }

  if (!candidates || candidates.length === 0) {
    return { checked: 0, purged: 0, failed: 0, errors: [] };
  }

  let purged = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const invoice of candidates) {
    try {
      if (invoice.pdf_storage_path) {
        const { error: removeError } = await supabase.storage
          .from(BUCKET)
          .remove([invoice.pdf_storage_path]);

        // "Not found" is fine (already gone) — anything else is a real failure
        // and we skip clearing the DB row so it's retried next run.
        if (removeError && !/not.*found/i.test(removeError.message)) {
          failed += 1;
          errors.push(`${invoice.id}: ${removeError.message}`);
          continue;
        }
      }

      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          pdf_storage_path: null,
          pdf_url: null,
          pdf_purged_at: new Date().toISOString(),
        })
        .eq('id', invoice.id);

      if (updateError) {
        failed += 1;
        errors.push(`${invoice.id}: ${updateError.message}`);
        continue;
      }

      purged += 1;
    } catch (err: any) {
      failed += 1;
      errors.push(`${invoice.id}: ${err?.message || String(err)}`);
    }
  }

  console.log(
    `[invoice-pdf-retention] checked=${candidates.length} purged=${purged} failed=${failed} cutoff=${cutoffIso}`
  );

  return { checked: candidates.length, purged, failed, errors };
}
