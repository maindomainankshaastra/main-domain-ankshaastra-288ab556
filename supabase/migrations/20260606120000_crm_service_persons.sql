-- CRM Phase 1: service subjects (persons) + service person configuration
-- Separates purchaser (orders.customer_*) from analyzed persons (service_persons)

CREATE TABLE IF NOT EXISTS public.service_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  person_index INT NOT NULL CHECK (person_index >= 1),
  first_name TEXT,
  middle_name TEXT,
  last_name TEXT,
  full_name TEXT NOT NULL,
  gender TEXT,
  dob JSONB,
  birth_time JSONB,
  birth_place TEXT,
  birth_pincode TEXT,
  additional_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (order_id, person_index)
);

CREATE INDEX IF NOT EXISTS idx_service_persons_order_id ON public.service_persons (order_id);
CREATE INDEX IF NOT EXISTS idx_service_persons_service_id ON public.service_persons (service_id);
CREATE INDEX IF NOT EXISTS idx_service_persons_full_name ON public.service_persons (lower(full_name));

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS min_persons INT NOT NULL DEFAULT 1 CHECK (min_persons >= 1),
  ADD COLUMN IF NOT EXISTS max_persons INT NOT NULL DEFAULT 1 CHECK (max_persons >= min_persons);

-- CMS package person counts (only when service_pages / service_packages exist)
DO $$
BEGIN
  IF to_regclass('public.service_packages') IS NOT NULL
     AND to_regclass('public.service_pages') IS NOT NULL THEN
    ALTER TABLE public.service_packages
      ADD COLUMN IF NOT EXISTS min_persons INT CHECK (min_persons IS NULL OR min_persons >= 1),
      ADD COLUMN IF NOT EXISTS max_persons INT CHECK (max_persons IS NULL OR max_persons >= min_persons);

    UPDATE public.service_packages sp
    SET
      min_persons = CASE
        WHEN lower(sp.payment_service_title) LIKE '%name check 3%' THEN 3
        WHEN lower(sp.payment_service_title) LIKE '%name check 2%' THEN 2
        WHEN lower(sp.payment_service_title) LIKE '%name check%' THEN 1
        WHEN lower(sp.payment_service_title) LIKE '%complete blueprint%' THEN 2
        WHEN lower(sp.payment_service_title) = 'name correction' THEN 1
        ELSE sp.min_persons
      END,
      max_persons = CASE
        WHEN lower(sp.payment_service_title) LIKE '%name check 3%' THEN 3
        WHEN lower(sp.payment_service_title) LIKE '%name check 2%' THEN 2
        WHEN lower(sp.payment_service_title) LIKE '%name check%' THEN 1
        WHEN lower(sp.payment_service_title) LIKE '%complete blueprint%' THEN 2
        WHEN lower(sp.payment_service_title) = 'name correction' THEN 1
        ELSE sp.max_persons
      END
    FROM public.service_pages pg
    WHERE sp.page_id = pg.id
      AND pg.slug IN ('name-correction', 'name-correction-report');
  END IF;
END $$;

UPDATE public.services
SET
  min_persons = CASE
    WHEN lower(title) LIKE '%name check 3%' THEN 3
    WHEN lower(title) LIKE '%name check 2%' THEN 2
    WHEN lower(title) LIKE '%name check%' THEN 1
    WHEN lower(title) LIKE '%complete blueprint%' THEN 2
    WHEN lower(title) LIKE '%triple%' OR lower(title) LIKE '%family%' OR lower(title) LIKE '%for 3%' THEN 3
    WHEN lower(title) LIKE '%double%' OR lower(title) LIKE '%for 2%' OR lower(title) LIKE '%couple%' THEN 2
    ELSE min_persons
  END,
  max_persons = CASE
    WHEN lower(title) LIKE '%name check 3%' THEN 3
    WHEN lower(title) LIKE '%name check 2%' THEN 2
    WHEN lower(title) LIKE '%name check%' THEN 1
    WHEN lower(title) LIKE '%complete blueprint%' THEN 2
    WHEN lower(title) LIKE '%triple%' OR lower(title) LIKE '%family%' OR lower(title) LIKE '%for 3%' THEN 3
    WHEN lower(title) LIKE '%double%' OR lower(title) LIKE '%for 2%' OR lower(title) LIKE '%couple%' THEN 2
    ELSE max_persons
  END
WHERE is_active = true;

ALTER TABLE public.service_persons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage service persons" ON public.service_persons;
CREATE POLICY "Admins manage service persons"
  ON public.service_persons FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users view own order service persons" ON public.service_persons;
CREATE POLICY "Users view own order service persons"
  ON public.service_persons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = service_persons.order_id
        AND o.user_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION public.touch_service_persons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS service_persons_updated_at ON public.service_persons;
CREATE TRIGGER service_persons_updated_at
  BEFORE UPDATE ON public.service_persons
  FOR EACH ROW EXECUTE FUNCTION public.touch_service_persons_updated_at();

-- Helper: extract persons from legacy formSnapshot JSONB
CREATE OR REPLACE FUNCTION public.extract_service_persons_from_snapshot(snapshot JSONB)
RETURNS TABLE (
  person_index INT,
  first_name TEXT,
  middle_name TEXT,
  last_name TEXT,
  full_name TEXT,
  gender TEXT,
  dob JSONB,
  birth_time JSONB,
  birth_place TEXT,
  birth_pincode TEXT,
  additional_data JSONB
)
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  person_key TEXT;
  person_data JSONB;
  idx INT;
  fn TEXT;
  mn TEXT;
  ln TEXT;
  built_name TEXT;
BEGIN
  FOR person_key, person_data IN
    SELECT je.key, je.value
    FROM jsonb_each(snapshot) AS je(key, value)
    WHERE je.key ~ '^person[0-9]+$'
    ORDER BY (NULLIF(regexp_replace(je.key, '\D', '', 'g'), ''))::INT
  LOOP
    idx := NULLIF(regexp_replace(person_key, '\D', '', 'g'), '')::INT;
    IF idx IS NULL THEN CONTINUE; END IF;

    fn := NULLIF(trim(person_data->>'firstName'), '');
    mn := NULLIF(trim(person_data->>'middleName'), '');
    ln := NULLIF(trim(person_data->>'lastName'), '');
    built_name := COALESCE(
      NULLIF(trim(person_data->>'fullName'), ''),
      NULLIF(trim(concat_ws(' ', fn, mn, ln)), ''),
      'Person ' || idx
    );

    person_index := idx;
    first_name := fn;
    middle_name := mn;
    last_name := ln;
    full_name := built_name;
    gender := NULLIF(trim(person_data->>'gender'), '');
    dob := person_data->'dob';
    birth_time := COALESCE(person_data->'tob', person_data->'birth_time');
    birth_place := COALESCE(NULLIF(trim(person_data->>'pob'), ''), NULLIF(trim(person_data->>'placeOfBirth'), ''));
    birth_pincode := NULLIF(trim(person_data->>'pincode'), '');
    additional_data := person_data - 'firstName' - 'middleName' - 'lastName' - 'fullName'
      - 'gender' - 'dob' - 'tob' - 'birth_time' - 'pob' - 'placeOfBirth' - 'pincode';
    RETURN NEXT;
  END LOOP;

  IF NOT EXISTS (
    SELECT 1 FROM jsonb_each(snapshot) AS je(key, value) WHERE je.key ~ '^person[0-9]+$'
  ) THEN
    fn := NULLIF(trim(snapshot->>'firstName'), '');
    mn := NULLIF(trim(snapshot->>'middleName'), '');
    ln := NULLIF(trim(snapshot->>'lastName'), '');
    built_name := COALESCE(
      NULLIF(trim(snapshot->>'fullName'), ''),
      NULLIF(trim(concat_ws(' ', fn, mn, ln)), '')
    );

    IF built_name IS NOT NULL THEN
      person_index := 1;
      first_name := fn;
      middle_name := mn;
      last_name := ln;
      full_name := built_name;
      gender := NULLIF(trim(snapshot->>'gender'), '');
      dob := snapshot->'dob';
      birth_time := COALESCE(snapshot->'tob', snapshot->'birth_time');
      birth_place := COALESCE(NULLIF(trim(snapshot->>'pob'), ''), NULLIF(trim(snapshot->>'placeOfBirth'), ''));
      birth_pincode := NULLIF(trim(snapshot->>'pincode'), '');
      additional_data := '{}'::jsonb;
      RETURN NEXT;
    END IF;
  END IF;

  RETURN;
END;
$$;

-- Backfill service_persons from existing paid orders (best-effort JSON extraction)
INSERT INTO public.service_persons (
  order_id,
  service_id,
  person_index,
  first_name,
  middle_name,
  last_name,
  full_name,
  gender,
  dob,
  birth_time,
  birth_place,
  birth_pincode,
  additional_data
)
SELECT
  o.id,
  o.service_id,
  persons.person_index,
  persons.first_name,
  persons.middle_name,
  persons.last_name,
  persons.full_name,
  persons.gender,
  persons.dob,
  persons.birth_time,
  persons.birth_place,
  persons.birth_pincode,
  persons.additional_data
FROM public.orders o
CROSS JOIN LATERAL (
  SELECT * FROM public.extract_service_persons_from_snapshot(
    COALESCE(o.metadata->'formSnapshot', o.metadata)::jsonb
  )
) AS persons
WHERE o.status IN ('paid', 'pending')
  AND o.metadata IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.service_persons sp WHERE sp.order_id = o.id
  )
ON CONFLICT (order_id, person_index) DO NOTHING;
