INSERT INTO public.websites (slug, domain, display_name)
VALUES ('shop', 'shop.ankshaastra.com', 'Ankshaastra Shop')
ON CONFLICT (slug) DO NOTHING;
