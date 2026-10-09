-- Per-site invoice series, e.g. Shopify store => S26-27/0001, S26-27/0002 ...
-- Financial year (April-March, IST) is computed automatically and the counter
-- restarts at 1 on 1 April, so the series becomes S27-28/0001 next year.

CREATE TABLE IF NOT EXISTS public.invoice_series (
  source_website public.website_source PRIMARY KEY,
  prefix         TEXT    NOT NULL,            -- e.g. 'S'
  padding        INT     NOT NULL DEFAULT 4,  -- 0001
  current_fy     TEXT,                        -- e.g. '26-27'
  next_seq       INT     NOT NULL DEFAULT 1,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.invoice_series ENABLE ROW LEVEL SECURITY;  -- service role only

INSERT INTO public.invoice_series (source_website, prefix, padding, current_fy, next_seq)
VALUES ('shop.ankshaastra.com', 'S', 4, '26-27', 1)
ON CONFLICT (source_website) DO NOTHING;

-- Returns NULL when the site has no dedicated series, so the caller can fall
-- back to the existing global next_invoice_number().
CREATE OR REPLACE FUNCTION public.next_invoice_number_for_site(p_site TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s public.invoice_series%ROWTYPE;
  ist TIMESTAMP := (now() AT TIME ZONE 'Asia/Kolkata');
  fy_start INT;
  fy TEXT;
  seq INT;
BEGIN
  SELECT * INTO s FROM public.invoice_series
   WHERE source_website::text = p_site FOR UPDATE;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  fy_start := CASE WHEN EXTRACT(MONTH FROM ist) >= 4
                   THEN EXTRACT(YEAR FROM ist)::INT
                   ELSE EXTRACT(YEAR FROM ist)::INT - 1 END;
  fy := lpad((fy_start % 100)::text, 2, '0') || '-' || lpad(((fy_start + 1) % 100)::text, 2, '0');

  IF s.current_fy IS DISTINCT FROM fy THEN
    seq := 1;                      -- new financial year: restart numbering
  ELSE
    seq := s.next_seq;
  END IF;

  UPDATE public.invoice_series
     SET current_fy = fy, next_seq = seq + 1, updated_at = now()
   WHERE source_website = s.source_website;

  RETURN s.prefix || fy || '/' || lpad(seq::text, s.padding, '0');
END;
$$;

REVOKE ALL ON FUNCTION public.next_invoice_number_for_site(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.next_invoice_number_for_site(TEXT) TO service_role;
