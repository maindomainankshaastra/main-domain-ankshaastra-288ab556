-- Admin-editable billing copy for invoices and payment emails
ALTER TABLE gst_config
  ADD COLUMN IF NOT EXISTS thank_you_message text,
  ADD COLUMN IF NOT EXISTS invoice_footer text,
  ADD COLUMN IF NOT EXISTS terms_conditions text;

-- Migrate legacy single footer field into invoice_footer
UPDATE gst_config
SET invoice_footer = terms_footer
WHERE invoice_footer IS NULL
  AND terms_footer IS NOT NULL
  AND terms_footer NOT LIKE '{"_billing"%';
