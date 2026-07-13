-- Service catalog audit: align prices, deactivate deprecated catalog entries.
-- Source: Service_Update_Doc.md

-- Deactivate services not in the approved catalog
UPDATE public.services
SET is_active = false, updated_at = now()
WHERE is_active = true
  AND lower(title) NOT IN (
    lower('1:1 Call Consultation Audio 45'),
    lower('1:1 Call Consultation Audio 60'),
    lower('1:1 Call Consultation Audio 75'),
    lower('1:1 Call Consultation Video 45'),
    lower('1:1 Call Consultation Video 60'),
    lower('1:1 Call Consultation Video 75'),
    lower('Varshphal Report 2026'),
    lower('Pyaar Shaastra Report'),
    lower('Pyaar Shaastra Report Original'),
    lower('Premium Personalised Kundli 2.0 Single'),
    lower('Premium Personalised Kundli 2.0 Double'),
    lower('Premium Personalised Kundli 2.0 Triple'),
    lower('Name Correction'),
    lower('Name Correction + Complete Blueprint'),
    lower('Name Check'),
    lower('Name Check 2'),
    lower('Name Check 3'),
    lower('Lucky Vehicle Number'),
    lower('Lucky Vehicle Color'),
    lower('Lucky Vehicle Purchase Date'),
    lower('Lucky Mobile Number'),
    lower('Lucky Flat / Plot Number'),
    lower('Relationship Analysis'),
    lower('Business Name Correction'),
    lower('Business Mobile Number'),
    lower('Business Tagline Analysis'),
    lower('Company Registration Date'),
    lower('Company Bank Account Opening Date'),
    lower('Land Purchase Date'),
    lower('Plot Number Analysis'),
    lower('Exhibition Stall Number'),
    lower('Commercial Space Analysis'),
    lower('Business Partner Compatibility'),
    lower('Departmental Sitting'),
    lower('CEO/MD Cabin Sitting'),
    lower('Management Sitting'),
    lower('Cash Counter Direction'),
    lower('Office Interior Colors'),
    lower('Office Vastu Remote'),
    lower('Office Vastu Onsite')
  );

-- Correct Kundli 2.0 package pricing
UPDATE public.services SET price = 497, updated_at = now()
WHERE lower(title) = lower('Premium Personalised Kundli 2.0 Double');
UPDATE public.services SET price = 597, updated_at = now()
WHERE lower(title) = lower('Premium Personalised Kundli 2.0 Triple');

-- Seed Pyaar Shaastra Original if missing
INSERT INTO public.services (title, description, category, price, gst_rate, is_active)
SELECT 'Pyaar Shaastra Report Original', 'Love and compatibility numerology report — full price tier.', 'Reports', 699, 18, true
WHERE NOT EXISTS (SELECT 1 FROM public.services s WHERE lower(s.title) = lower('Pyaar Shaastra Report Original'));

-- Seed Business Partner Compatibility if missing
INSERT INTO public.services (title, description, category, price, gst_rate, is_active)
SELECT 'Business Partner Compatibility', 'Business partner compatibility numerology analysis.', 'Business', 1997, 18, true
WHERE NOT EXISTS (SELECT 1 FROM public.services s WHERE lower(s.title) = lower('Business Partner Compatibility'));

-- CMS cleanup (skipped if service_pages tables are not deployed yet)
DO $$
BEGIN
  IF to_regclass('public.service_pages') IS NOT NULL THEN
    UPDATE public.service_pages
    SET status = 'archived', updated_at = now()
    WHERE slug IN ('name-correction-blueprint')
       OR lower(title) IN (lower('Mobile Numerology'), lower('Name Correction Blueprint'));
  END IF;

  IF to_regclass('public.service_pages') IS NOT NULL
     AND to_regclass('public.service_packages') IS NOT NULL THEN
    UPDATE public.service_packages sp
    SET price = 497, updated_at = now()
    FROM public.service_pages pg
    WHERE sp.page_id = pg.id
      AND pg.slug = 'personalized-kundali'
      AND sp.name ILIKE '%double%';

    UPDATE public.service_packages sp
    SET price = 597, updated_at = now()
    FROM public.service_pages pg
    WHERE sp.page_id = pg.id
      AND pg.slug = 'personalized-kundali'
      AND sp.name ILIKE '%triple%';

    INSERT INTO public.service_packages (page_id, name, price, form_type, payment_service_title, sort_order, is_active)
    SELECT sp.id, 'Pyaar Shaastra Report Original', 699, 'pyaar-shastra', 'Pyaar Shaastra Report Original', 2, true
    FROM public.service_pages sp
    WHERE sp.slug = 'pyaar-shastra'
      AND NOT EXISTS (
        SELECT 1 FROM public.service_packages p
        WHERE p.page_id = sp.id AND p.name = 'Pyaar Shaastra Report Original'
      );
  END IF;
END $$;
