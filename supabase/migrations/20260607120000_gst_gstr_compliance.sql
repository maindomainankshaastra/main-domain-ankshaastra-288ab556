-- GST & GSTR-1 compliance: SAC codes, customer place of supply, GSTR classification

-- Supplier registered in Uttar Pradesh (GST state code 09)
UPDATE public.gst_config SET state_code = '09' WHERE state_code IS NULL OR state_code = '27';

ALTER TABLE public.gst_config
  ADD COLUMN IF NOT EXISTS trade_name TEXT,
  ADD COLUMN IF NOT EXISTS registered_state TEXT DEFAULT 'Uttar Pradesh',
  ADD COLUMN IF NOT EXISTS default_sac_code TEXT DEFAULT '998314',
  ADD COLUMN IF NOT EXISTS financial_year TEXT,
  ADD COLUMN IF NOT EXISTS gst_filing_frequency TEXT DEFAULT 'monthly';

UPDATE public.gst_config
SET
  registered_state = COALESCE(registered_state, 'Uttar Pradesh'),
  default_sac_code = COALESCE(default_sac_code, '998314'),
  gst_filing_frequency = COALESCE(gst_filing_frequency, 'monthly')
WHERE id IS NOT NULL;

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS customer_state TEXT,
  ADD COLUMN IF NOT EXISTS customer_state_code TEXT,
  ADD COLUMN IF NOT EXISTS place_of_supply TEXT,
  ADD COLUMN IF NOT EXISTS gstr_category TEXT,
  ADD COLUMN IF NOT EXISTS sac_code TEXT;

CREATE INDEX IF NOT EXISTS idx_invoices_gstr_category ON public.invoices (gstr_category);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_state_code ON public.invoices (customer_state_code);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON public.invoices (invoice_date);

-- GSTR export run log (validation + filing readiness)
CREATE TABLE IF NOT EXISTS public.gstr_export_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filing_period TEXT NOT NULL,
  export_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  validation_errors JSONB NOT NULL DEFAULT '[]',
  validation_warnings JSONB NOT NULL DEFAULT '[]',
  ready_to_file BOOLEAN NOT NULL DEFAULT false,
  generated_by UUID REFERENCES auth.users(id),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gstr_export_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage gstr_export_runs"
  ON public.gstr_export_runs FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));
