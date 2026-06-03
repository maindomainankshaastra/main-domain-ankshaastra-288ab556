-- Invoice numbers: admin prefix + sequence only (e.g. EYN26-27K-7000 + 1 => EYN26-27K-70001).

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

  UPDATE public.gst_config SET invoice_sequence = seq + 1 WHERE id = config_row.id;

  RETURN prefix || seq::text;
END;
$$;
