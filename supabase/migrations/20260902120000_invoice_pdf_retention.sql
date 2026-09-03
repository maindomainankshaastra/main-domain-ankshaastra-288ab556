-- Invoice PDF retention: old PDF *files* are purged from Supabase Storage
-- after 6 months to control Storage usage. The `invoices` table row itself
-- (amounts, GST fields, customer info, dates, gstr_category, etc.) is NEVER
-- deleted — GSTR reporting and the Google Sheet CRM sync both read this
-- table and must keep working for all historical invoices.
--
-- pdf_purged_at is set the moment a PDF is removed from Storage, so it's
-- easy to audit what was purged and when, and to make the purge job
-- idempotent (skip invoices that were already purged).

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS pdf_purged_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_invoices_pdf_purge_candidates
  ON public.invoices (created_at)
  WHERE pdf_storage_path IS NOT NULL AND pdf_purged_at IS NULL;

COMMENT ON COLUMN public.invoices.pdf_purged_at IS
  'Set when the PDF file (not the invoice row) was deleted from Supabase Storage by the retention job. Row data is retained indefinitely for GSTR/CRM.';
