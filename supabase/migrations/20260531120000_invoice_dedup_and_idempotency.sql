-- Fix duplicate invoices: keep best row per order, then enforce one invoice per order.

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY order_id
      ORDER BY
        CASE WHEN pdf_storage_path IS NOT NULL OR pdf_url IS NOT NULL THEN 0 ELSE 1 END,
        created_at ASC
    ) AS rn
  FROM public.invoices
)
DELETE FROM public.invoices
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

CREATE UNIQUE INDEX IF NOT EXISTS invoices_order_id_unique ON public.invoices (order_id);

CREATE OR REPLACE FUNCTION public.next_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  config_row public.gst_config%ROWTYPE;
  seq INT;
  prefix TEXT;
  date_part TEXT;
BEGIN
  SELECT * INTO config_row FROM public.gst_config LIMIT 1 FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'gst_config not found';
  END IF;

  seq := config_row.invoice_sequence;
  prefix := regexp_replace(regexp_replace(trim(config_row.invoice_prefix), '[/\\]+$', ''), '[/\\]', '-', 'g');
  IF prefix = '' OR prefix IS NULL THEN
    prefix := 'INV';
  END IF;
  date_part := to_char(now(), 'YYYYMMDD');

  UPDATE public.gst_config SET invoice_sequence = seq + 1 WHERE id = config_row.id;

  RETURN prefix || '-' || date_part || '-' || lpad(seq::text, 5, '0');
END;
$$;
