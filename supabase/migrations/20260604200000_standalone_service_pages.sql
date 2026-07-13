-- Seed standalone service pages when CMS tables exist (optional — frontend also serves static pages).

DO $$
BEGIN
  IF to_regclass('public.service_pages') IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.service_pages (slug, route, page_type, title, subtitle, description, category, form_type, status, sort_order, published_at, seo_title, seo_description, content)
  VALUES
    ('lucky-vehicle-number', '/services/lucky-vehicle-number', 'service', 'Lucky Vehicle Number', 'Aligned vehicle registration number', 'Expert numerology for lucky vehicle numbers.', 'Personal Numerology', 'lucky-vehicle', 'published', 10, now(), 'Lucky Vehicle Number | Ankshaastra', 'Personalized lucky vehicle number numerology. ₹1,097.', '{"features":["Birth profile analysis","Lucky number options","Expert summary"]}'),
    ('lucky-vehicle-color', '/services/lucky-vehicle-color', 'service', 'Lucky Vehicle Color', 'Vehicle color numerology', 'Lucky vehicle color through numerology.', 'Personal Numerology', 'lucky-vehicle-color', 'published', 11, now(), 'Lucky Vehicle Color | Ankshaastra', 'Lucky vehicle color guidance. ₹497.', '{}'),
    ('lucky-vehicle-purchase-date', '/services/lucky-vehicle-purchase-date', 'service', 'Lucky Vehicle Purchase Date', 'Auspicious purchase timing', 'Best dates to purchase your vehicle.', 'Personal Numerology', 'lucky-vehicle-date', 'published', 12, now(), 'Lucky Vehicle Purchase Date', 'Auspicious vehicle purchase dates. ₹1,097.', '{}'),
    ('lucky-mobile-number', '/services/lucky-mobile-number', 'service', 'Lucky Mobile Number', 'Mobile numerology', 'Lucky mobile number analysis.', 'Personal Numerology', 'lucky-mobile', 'published', 13, now(), 'Lucky Mobile Number', 'Lucky mobile number numerology. ₹1,097.', '{}'),
    ('lucky-flat-number', '/services/lucky-flat-number', 'service', 'Lucky Flat Number', 'Flat/plot numerology', 'Lucky flat and plot number guidance.', 'Personal Numerology', 'lucky-flat', 'published', 14, now(), 'Lucky Flat Number', 'Lucky flat number numerology. ₹1,097.', '{}'),
    ('relationship-analysis', '/services/relationship-analysis', 'service', 'Relationship Analysis', 'Couple compatibility', 'Relationship numerology analysis.', 'Relationships', 'relationship-analysis', 'published', 15, now(), 'Relationship Analysis', 'Relationship numerology. ₹917.', '{}'),
    ('business-name-correction', '/services/business-name-correction', 'service', 'Business Name Correction', 'Business name alignment', 'Business name numerology correction.', 'Business', 'business-brand', 'published', 20, now(), 'Business Name Correction', 'Business name correction. ₹4,967.', '{}'),
    ('business-mobile-number', '/services/business-mobile-number', 'service', 'Business Mobile Number', 'Business line numerology', 'Business mobile number analysis.', 'Business', 'business-brand', 'published', 21, now(), 'Business Mobile Number', 'Business mobile numerology. ₹1,457.', '{}'),
    ('business-tagline-analysis', '/services/business-tagline-analysis', 'service', 'Business Tagline Analysis', 'Tagline vibration', 'Business tagline numerology.', 'Business', 'business-brand', 'published', 22, now(), 'Business Tagline Analysis', 'Tagline numerology. ₹1,457.', '{}'),
    ('company-registration-date', '/services/company-registration-date', 'service', 'Company Registration Date', 'Registration timing', 'Auspicious company registration dates.', 'Business', 'business-dates', 'published', 23, now(), 'Company Registration Date', 'Registration date numerology. ₹1,997.', '{}'),
    ('company-bank-account-opening-date', '/services/company-bank-account-opening-date', 'service', 'Company Bank Account Opening Date', 'Bank opening timing', 'Best dates for business bank account opening.', 'Business', 'business-dates', 'published', 24, now(), 'Company Bank Account Opening Date', 'Bank account opening date. ₹1,997.', '{}'),
    ('land-purchase-date', '/services/land-purchase-date', 'service', 'Land Purchase Date', 'Land purchase timing', 'Auspicious land purchase dates.', 'Business', 'business-dates', 'published', 25, now(), 'Land Purchase Date', 'Land purchase numerology. ₹1,997.', '{}'),
    ('plot-number-analysis', '/services/plot-number-analysis', 'service', 'Plot Number Analysis', 'Plot numerology', 'Commercial plot number analysis.', 'Business', 'business-property', 'published', 26, now(), 'Plot Number Analysis', 'Plot number numerology. ₹1,457.', '{}'),
    ('exhibition-stall-number', '/services/exhibition-stall-number', 'service', 'Exhibition Stall Number', 'Stall numerology', 'Exhibition stall number guidance.', 'Business', 'business-property', 'published', 27, now(), 'Exhibition Stall Number', 'Stall number analysis. ₹917.', '{}'),
    ('commercial-space-analysis', '/services/commercial-space-analysis', 'service', 'Commercial Space Analysis', 'Commercial property', 'Commercial space numerology review.', 'Business', 'business-property', 'published', 28, now(), 'Commercial Space Analysis', 'Commercial space numerology. ₹2,447.', '{}'),
    ('business-partner-compatibility', '/services/business-partner-compatibility', 'service', 'Business Partner Compatibility', 'Partner compatibility', 'Business partner numerology compatibility.', 'Business', 'business-partner', 'published', 29, now(), 'Business Partner Compatibility', 'Partner compatibility. ₹1,997.', '{}'),
    ('varshphal-report', '/reports/varshphal-report', 'report', 'Varshphal Report', 'Yearly numerology guide', 'Complete Varshphal report for 2026.', 'Reports', 'kundali', 'published', 1, now(), 'Varshphal Report 2026', 'Yearly numerology forecast. ₹699.', '{}')
  ON CONFLICT (slug) DO UPDATE SET
    route = EXCLUDED.route,
    page_type = EXCLUDED.page_type,
    title = EXCLUDED.title,
    status = 'published',
    updated_at = now();

  UPDATE public.service_pages
  SET status = 'archived', updated_at = now()
  WHERE slug IN ('lucky-numerology', 'business-numerology', 'name-correction-blueprint');
END $$;
