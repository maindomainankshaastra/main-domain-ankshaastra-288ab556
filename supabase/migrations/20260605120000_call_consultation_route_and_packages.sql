-- Point 1:1 Call Consultation CMS page to /consultation and sync catalog packages.

DO $$
BEGIN
  IF to_regclass('public.service_pages') IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.service_pages
  SET
    route = '/consultation',
    title = '1:1 Call Consultation',
    subtitle = 'Personal guidance from Himansshu Agarwal Ji',
    description = 'Structured 3-call consultation over audio or video.',
    category = 'Consultation',
    form_type = 'consultation',
    status = 'published',
    updated_at = now()
  WHERE slug = 'call-consultation';

  INSERT INTO public.service_packages (page_id, name, price, form_type, payment_service_title, sort_order, is_popular, is_active, gst_rate)
  SELECT sp.id, pkg.name, pkg.price, pkg.form_type, pkg.service_title, pkg.sort_order, pkg.is_popular, true, 18
  FROM public.service_pages sp
  CROSS JOIN (VALUES
    ('Audio Consultation 45 Minutes', 3977, 'consultation', '1:1 Call Consultation Audio 45', 1, false),
    ('Audio Consultation 60 Minutes', 4967, 'consultation', '1:1 Call Consultation Audio 60', 2, true),
    ('Audio Consultation 75 Minutes', 5957, 'consultation', '1:1 Call Consultation Audio 75', 3, false),
    ('Video Consultation 45 Minutes', 5957, 'consultation', '1:1 Call Consultation Video 45', 4, false),
    ('Video Consultation 60 Minutes', 7397, 'consultation', '1:1 Call Consultation Video 60', 5, false),
    ('Video Consultation 75 Minutes', 8927, 'consultation', '1:1 Call Consultation Video 75', 6, false)
  ) AS pkg(name, price, form_type, service_title, sort_order, is_popular)
  WHERE sp.slug = 'call-consultation'
    AND NOT EXISTS (
      SELECT 1 FROM public.service_packages p
      WHERE p.page_id = sp.id AND lower(p.payment_service_title) = lower(pkg.service_title)
    );

  UPDATE public.service_packages p
  SET
    name = v.name,
    price = v.price,
    form_type = v.form_type,
    sort_order = v.sort_order,
    is_popular = v.is_popular,
    is_active = true,
    updated_at = now()
  FROM public.service_pages sp
  JOIN (VALUES
    ('Audio Consultation 45 Minutes', 3977, 'consultation', '1:1 Call Consultation Audio 45', 1, false),
    ('Audio Consultation 60 Minutes', 4967, 'consultation', '1:1 Call Consultation Audio 60', 2, true),
    ('Audio Consultation 75 Minutes', 5957, 'consultation', '1:1 Call Consultation Audio 75', 3, false),
    ('Video Consultation 45 Minutes', 5957, 'consultation', '1:1 Call Consultation Video 45', 4, false),
    ('Video Consultation 60 Minutes', 7397, 'consultation', '1:1 Call Consultation Video 60', 5, false),
    ('Video Consultation 75 Minutes', 8927, 'consultation', '1:1 Call Consultation Video 75', 6, false)
  ) AS v(name, price, form_type, service_title, sort_order, is_popular)
    ON lower(p.payment_service_title) = lower(v.service_title)
  WHERE p.page_id = sp.id AND sp.slug = 'call-consultation';
END $$;

-- Keep checkout service rows aligned with catalog pricing.
UPDATE public.services SET price = 3977, is_active = true WHERE lower(title) = lower('1:1 Call Consultation Audio 45');
UPDATE public.services SET price = 4967, is_active = true WHERE lower(title) = lower('1:1 Call Consultation Audio 60');
UPDATE public.services SET price = 5957, is_active = true WHERE lower(title) = lower('1:1 Call Consultation Audio 75');
UPDATE public.services SET price = 5957, is_active = true WHERE lower(title) = lower('1:1 Call Consultation Video 45');
UPDATE public.services SET price = 7397, is_active = true WHERE lower(title) = lower('1:1 Call Consultation Video 60');
UPDATE public.services SET price = 8927, is_active = true WHERE lower(title) = lower('1:1 Call Consultation Video 75');
