-- Service pages CMS: admin-managed landing pages, packages, and checkout forms.

CREATE TYPE public.page_status AS ENUM ('draft', 'published');

CREATE TABLE public.service_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  route TEXT NOT NULL UNIQUE,
  page_type TEXT NOT NULL DEFAULT 'service',
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  category TEXT,
  seo_title TEXT,
  seo_description TEXT,
  hero_image_url TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  form_type TEXT NOT NULL DEFAULT 'default',
  status public.page_status NOT NULL DEFAULT 'draft',
  sort_order INT NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.service_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.service_pages(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  tag TEXT,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  gst_rate NUMERIC(5,2) NOT NULL DEFAULT 18.00,
  features JSONB NOT NULL DEFAULT '[]',
  excluded JSONB NOT NULL DEFAULT '[]',
  form_type TEXT,
  payment_service_title TEXT,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS page_id UUID REFERENCES public.service_pages(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS services_slug_unique ON public.services (slug) WHERE slug IS NOT NULL;

CREATE INDEX idx_service_pages_status ON public.service_pages (status);
CREATE INDEX idx_service_packages_page_id ON public.service_packages (page_id);

ALTER TABLE public.service_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published service pages"
  ON public.service_pages FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can manage service pages"
  ON public.service_pages FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active packages on published pages"
  ON public.service_packages FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.service_pages sp
      WHERE sp.id = service_packages.page_id AND sp.status = 'published'
    )
  );

CREATE POLICY "Admins can manage service packages"
  ON public.service_packages FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER service_pages_updated_at
  BEFORE UPDATE ON public.service_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER service_packages_updated_at
  BEFORE UPDATE ON public.service_packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed payment-only catalog services missing from dedicated landing pages.
INSERT INTO public.services (title, description, category, price, gst_rate, is_active, slug)
SELECT v.title, v.description, v.category, v.price, 18, true, v.slug
FROM (VALUES
  ('1:1 Audio Call', 'Personal numerology consultation over audio call with Himansshu Agarwal Ji.', 'Consultation', 3998, 'audio-call'),
  ('1:1 Video Call', 'Face-to-face numerology consultation over video call.', 'Consultation', 5997, 'video-call'),
  ('Lucky Vehicle Number', 'Find a numerologically aligned vehicle registration number.', 'Personal Numerology', 1100, 'lucky-vehicle-number'),
  ('Lucky Mobile Number', 'Choose a mobile number that supports your numerology profile.', 'Personal Numerology', 1100, 'lucky-mobile-number'),
  ('Lucky Flat / Plot Number', 'Select flat or plot numbers with favourable vibrations.', 'Personal Numerology', 1100, 'lucky-flat-number'),
  ('Relationship Analysis', 'Understand compatibility and relationship dynamics through numerology.', 'Relationships', 987, 'relationship-analysis'),
  ('Business Name Correction', 'Align your business name with numerology for growth and success.', 'Business', 4894, 'business-name-correction'),
  ('Business Phone Number', 'Optimize your business phone number for better outcomes.', 'Business', 1499, 'business-phone-number'),
  ('Brand Tagline Correction', 'Craft a tagline with strong numerological vibration.', 'Business', 1997, 'brand-tagline-correction'),
  ('Business Partner Compatibility', 'Check numerological compatibility between business partners.', 'Business', 1997, 'business-partner-compatibility'),
  ('Director Name Compatibility', 'Evaluate director name compatibility for your company.', 'Business', 1997, 'director-name-compatibility'),
  ('Company Registration Date', 'Choose an auspicious date for company registration.', 'Auspicious Dates', 1997, 'company-registration-date'),
  ('Bank Account Opening Date', 'Select the best date to open a business bank account.', 'Auspicious Dates', 1997, 'bank-account-opening-date'),
  ('Land Purchase Date', 'Find numerologically favourable dates for land purchase.', 'Auspicious Dates', 1997, 'land-purchase-date'),
  ('CEO/MD Cabin Sitting', 'Vastu guidance for CEO/MD cabin placement.', 'Vastu', 2499, 'ceo-cabin-sitting'),
  ('Management Sitting', 'Optimize management team seating as per vastu.', 'Vastu', 1997, 'management-sitting'),
  ('Cash Counter Direction', 'Correct cash counter direction for business prosperity.', 'Vastu', 1997, 'cash-counter-direction'),
  ('Office Interior Colors', 'Vastu-aligned interior color recommendations for offices.', 'Vastu', 1997, 'office-interior-colors'),
  ('Departmental Sitting', 'Department-wise seating plan as per vastu principles.', 'Vastu', 4998, 'departmental-sitting'),
  ('Plot Number Analysis', 'Numerology and vastu analysis for plot numbers.', 'Property', 1499, 'plot-number-analysis'),
  ('Exhibition Stall Number', 'Choose favourable stall numbers for exhibitions.', 'Property', 999, 'exhibition-stall-number'),
  ('Commercial Space Analysis', 'Complete vastu analysis for commercial spaces.', 'Property', 2499, 'commercial-space-analysis')
) AS v(title, description, category, price, slug)
WHERE NOT EXISTS (
  SELECT 1 FROM public.services s WHERE lower(s.title) = lower(v.title)
);
