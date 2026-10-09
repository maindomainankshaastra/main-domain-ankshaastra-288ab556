-- Register the Shopify store as a connected site.
-- NOTE: a new enum value can't be used in the same transaction that adds it,
-- so the websites-table insert lives in the next migration file.
ALTER TYPE public.website_source ADD VALUE IF NOT EXISTS 'shop.ankshaastra.com';
