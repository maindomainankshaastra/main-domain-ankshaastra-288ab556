-- Seed full service catalog with updated pricing and CMS pages/packages.

INSERT INTO public.services (title, description, category, price, gst_rate, is_active, slug)
SELECT v.title, v.description, v.category, v.price, 18, true, v.slug
FROM (VALUES
  ('1:1 Call Consultation Audio 45', 'Personal numerology consultation — 45 min audio call.', 'Consultation', 3977, 'call-audio-45'),
  ('1:1 Call Consultation Audio 60', 'Personal numerology consultation — 60 min audio call.', 'Consultation', 4967, 'call-audio-60'),
  ('1:1 Call Consultation Audio 75', 'Personal numerology consultation — 75 min audio call.', 'Consultation', 5957, 'call-audio-75'),
  ('1:1 Call Consultation Video 45', 'Personal numerology consultation — 45 min video call.', 'Consultation', 5957, 'call-video-45'),
  ('1:1 Call Consultation Video 60', 'Personal numerology consultation — 60 min video call.', 'Consultation', 7397, 'call-video-60'),
  ('1:1 Call Consultation Video 75', 'Personal numerology consultation — 75 min video call.', 'Consultation', 8927, 'call-video-75'),
  ('Varshphal Report 2026', 'Complete year-ahead numerology forecast for 2026.', 'Reports', 699, 'varshphal-2026'),
  ('Pyaar Shaastra Report', 'Love and compatibility numerology report.', 'Reports', 299, 'pyaar-shaastra'),
  ('Premium Personalised Kundli 2.0 Single', 'Single personalized kundli report.', 'Reports', 299, 'kundli-20-single'),
  ('Premium Personalised Kundli 2.0 Double', 'Two personalized kundli reports.', 'Reports', 497, 'kundli-20-double'),
  ('Premium Personalised Kundli 2.0 Triple', 'Three personalized kundli reports.', 'Reports', 597, 'kundli-20-triple'),
  ('Name Correction + Complete Blueprint', 'Name correction with complete blueprint.', 'Name & Numerology', 7397, 'name-correction-blueprint'),
  ('Name Check 2', 'Quick name check for 2 names.', 'Name & Numerology', 528, 'name-check-2'),
  ('Name Check 3', 'Quick name check for 3 names.', 'Name & Numerology', 747, 'name-check-3'),
  ('Lucky Vehicle Color', 'Numerology guidance for lucky vehicle colors.', 'Personal Numerology', 497, 'lucky-vehicle-color'),
  ('Lucky Vehicle Purchase Date', 'Auspicious vehicle purchase dates.', 'Personal Numerology', 1097, 'lucky-vehicle-date'),
  ('Relationship Analysis', 'Relationship compatibility numerology analysis.', 'Relationships', 917, 'relationship-analysis')
) AS v(title, description, category, price, slug)
WHERE NOT EXISTS (SELECT 1 FROM public.services s WHERE lower(s.title) = lower(v.title));

-- CMS pages (published)
INSERT INTO public.service_pages (slug, route, page_type, title, subtitle, description, category, form_type, status, sort_order, published_at, content)
VALUES
  ('call-consultation', '/services/call-consultation', 'service', '1:1 Call Consultation', 'Personal guidance from Himansshu Agarwal Ji', 'Structured 3-call consultation over audio or video.', 'Consultation', 'consultation', 'published', 1, now(), '{"features":["3-step structured consultation","Written remedies via Email/WhatsApp","Highly confidential"]}'),
  ('lucky-numerology', '/services/lucky-numerology', 'service', 'Lucky Numerology', 'Aligned numbers for vehicle, mobile, flat and more', 'Expert numerology for lucky numbers and dates.', 'Personal Numerology', 'lucky-mobile', 'published', 2, now(), '{}'),
  ('business-numerology', '/services/business-numerology', 'service', 'Business & Brand Numerology', 'Grow your business with aligned names and numbers', 'Business name, tagline, dates, and partner compatibility.', 'Business', 'business-brand', 'published', 3, now(), '{}'),
  ('varshphal-report', '/services/varshphal-report', 'service', 'Varshphal Report 2026', 'Your complete yearly guide', 'Month-by-month predictions for 2026.', 'Reports', 'kundali', 'published', 4, now(), '{}'),
  ('personalized-kundali', '/reports/personalized-kundali', 'report', 'Premium Personalised Kundli 2.0', 'Deep astrological insights', 'Single, double, and triple kundli packages.', 'Reports', 'kundali', 'published', 5, now(), '{}'),
  ('pyaar-shastra', '/reports/pyaar-shastra', 'report', 'Pyaar Shaastra Report', 'Love & compatibility insights', 'Relationship numerology report.', 'Reports', 'pyaar-shastra', 'published', 6, now(), '{}'),
  ('name-correction', '/services/name-correction', 'service', 'Name Correction', 'Align your name vibration', 'Expert name correction packages.', 'Name & Numerology', 'name-correction', 'published', 7, now(), '{}'),
  ('office-vastu', '/services/office-vastu', 'service', 'Office Vastu', 'Harmonize your workspace', 'Remote and onsite office vastu packages.', 'Vastu', 'office-vastu', 'published', 8, now(), '{}')
ON CONFLICT (slug) DO NOTHING;

-- Packages for call consultation
INSERT INTO public.service_packages (page_id, name, price, form_type, payment_service_title, sort_order, is_active)
SELECT sp.id, pkg.name, pkg.price, pkg.form_type, pkg.service_title, pkg.sort_order, true
FROM public.service_pages sp
CROSS JOIN (VALUES
  ('Audio — 45 Minutes', 3977, 'consultation', '1:1 Call Consultation Audio 45', 1),
  ('Audio — 60 Minutes', 4967, 'consultation', '1:1 Call Consultation Audio 60', 2),
  ('Audio — 75 Minutes', 5957, 'consultation', '1:1 Call Consultation Audio 75', 3),
  ('Video — 45 Minutes', 5957, 'consultation', '1:1 Call Consultation Video 45', 4),
  ('Video — 60 Minutes', 7397, 'consultation', '1:1 Call Consultation Video 60', 5),
  ('Video — 75 Minutes', 8927, 'consultation', '1:1 Call Consultation Video 75', 6)
) AS pkg(name, price, form_type, service_title, sort_order)
WHERE sp.slug = 'call-consultation'
  AND NOT EXISTS (SELECT 1 FROM public.service_packages p WHERE p.page_id = sp.id AND p.name = pkg.name);
