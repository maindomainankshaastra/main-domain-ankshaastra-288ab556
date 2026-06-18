-- Ankshaastra Occult Experts LLP GST defaults, auto-correction, and historical backfill

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS gst_auto_corrected BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.gst_config
  ALTER COLUMN default_sac_code SET DEFAULT '999799';

UPDATE public.gst_config
SET
  gstin = COALESCE(NULLIF(TRIM(gstin), ''), '09AAFFE7583B1ZD'),
  legal_name = COALESCE(NULLIF(TRIM(legal_name), ''), 'ANKSHAASTRA OCCULT EXPERTS LLP'),
  business_name = COALESCE(NULLIF(TRIM(business_name), ''), 'ANKSHAASTRA OCCULT EXPERTS LLP'),
  trade_name = COALESCE(NULLIF(TRIM(trade_name), ''), 'ANKSHAASTRA OCCULT EXPERTS LLP'),
  registered_state = COALESCE(NULLIF(TRIM(registered_state), ''), 'Uttar Pradesh'),
  state_code = COALESCE(NULLIF(TRIM(state_code), ''), '09'),
  default_sac_code = COALESCE(NULLIF(TRIM(default_sac_code), ''), '999799'),
  default_gst_rate = COALESCE(default_gst_rate, 18),
  gst_filing_frequency = COALESCE(NULLIF(TRIM(gst_filing_frequency), ''), 'monthly')
WHERE id IS NOT NULL;

-- Backfill missing SAC codes
UPDATE public.invoices
SET
  sac_code = '999799',
  hsn_sac_code = '999799',
  gst_auto_corrected = true,
  updated_at = now()
WHERE (sac_code IS NULL OR TRIM(sac_code) = '' OR sac_code !~ '^\d{6}$')
   OR (hsn_sac_code IS NULL OR TRIM(hsn_sac_code) = '' OR hsn_sac_code !~ '^\d{6}$');

-- Backfill missing GST rates (assume 18% intra-state UP when state unknown/missing)
UPDATE public.invoices
SET
  cgst_rate = CASE WHEN COALESCE(customer_state_code, '09') = '09' THEN 9 ELSE 0 END,
  sgst_rate = CASE WHEN COALESCE(customer_state_code, '09') = '09' THEN 9 ELSE 0 END,
  igst_rate = CASE WHEN COALESCE(customer_state_code, '09') = '09' THEN 0 ELSE 18 END,
  gst_auto_corrected = true,
  updated_at = now()
WHERE (COALESCE(cgst_rate, 0) + COALESCE(sgst_rate, 0) + COALESCE(igst_rate, 0)) <= 0;

-- Default GSTR category for unclassified invoices
UPDATE public.invoices
SET gstr_category = CASE
  WHEN customer_gstin IS NOT NULL AND TRIM(customer_gstin) <> '' THEN 'B2B'
  WHEN total_amount > 100000 AND COALESCE(customer_state_code, '09') <> '09' THEN 'B2CL'
  ELSE 'B2CS'
END
WHERE gstr_category IS NULL OR TRIM(gstr_category) = '';

-- Unknown place of supply where state still missing
UPDATE public.invoices
SET
  customer_state = 'Unknown',
  customer_state_code = '00',
  place_of_supply = '00-UNKNOWN',
  gst_auto_corrected = true,
  updated_at = now()
WHERE customer_state_code IS NULL OR TRIM(customer_state_code) = '';

CREATE INDEX IF NOT EXISTS idx_invoices_gst_auto_corrected ON public.invoices (gst_auto_corrected);
