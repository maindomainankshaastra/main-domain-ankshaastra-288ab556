-- =============================================================================
-- Empower data checks — WHERE TO RUN
-- =============================================================================
-- Run in Supabase Dashboard → SQL Editor on the MAIN DOMAIN project only:
--   Project ID: iiihikzsewdyhgmpsyaj  (ankshaastra.com central hub)
--
-- If Empower and main site already share this one database (your case):
--   • Run this file ONCE on main domain Supabase.
--   • Skip cross-database migration — data is already in the hub.
--   • Use sections B–G to see empower.ankshaastra.com rows, duplicates, GST.
--
-- Only run on a SECOND Supabase project if Empower still has its own old DB
-- (separate from iiihikzsewdyhgmpsyaj) and you are copying rows into central.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A) Confirm project — note DB name + website rows
-- -----------------------------------------------------------------------------
SELECT current_database() AS database_name, now() AS checked_at;

SELECT id, slug, domain::text, display_name, is_active
FROM public.websites
ORDER BY domain;

-- -----------------------------------------------------------------------------
-- B) Volume by source_website (critical for scope)
-- -----------------------------------------------------------------------------
SELECT 'orders' AS entity, COALESCE(source_website::text, '(null)') AS site, COUNT(*) AS cnt
FROM public.orders
GROUP BY source_website

UNION ALL

SELECT 'invoices', COALESCE(source_website::text, '(null)'), COUNT(*)
FROM public.invoices
GROUP BY source_website

UNION ALL

SELECT 'customers', COALESCE(source_website::text, '(null)'), COUNT(*)
FROM public.customers
GROUP BY source_website

ORDER BY entity, site;

-- -----------------------------------------------------------------------------
-- C) Empower-only counts
-- -----------------------------------------------------------------------------
SELECT
  (SELECT COUNT(*) FROM public.orders WHERE source_website = 'empower.ankshaastra.com') AS empower_orders,
  (SELECT COUNT(*) FROM public.invoices WHERE source_website = 'empower.ankshaastra.com') AS empower_invoices,
  (SELECT COUNT(*) FROM public.customers WHERE source_website = 'empower.ankshaastra.com') AS empower_customers,
  (SELECT COUNT(*) FROM public.service_persons sp
   JOIN public.orders o ON o.id = sp.order_id
   WHERE o.source_website = 'empower.ankshaastra.com') AS empower_service_persons,
  (SELECT COUNT(*) FROM public.payments p
   JOIN public.orders o ON o.id = p.order_id
   WHERE o.source_website = 'empower.ankshaastra.com') AS empower_payments;

-- -----------------------------------------------------------------------------
-- D) Duplicates that will FAIL on hub unique indexes
-- -----------------------------------------------------------------------------
SELECT 'orders.razorpay_payment_id' AS check_name, razorpay_payment_id AS key_value, COUNT(*) AS cnt
FROM public.orders
WHERE razorpay_payment_id IS NOT NULL
GROUP BY razorpay_payment_id
HAVING COUNT(*) > 1

UNION ALL

SELECT 'invoices.razorpay_payment_id', razorpay_payment_id, COUNT(*)
FROM public.invoices
WHERE razorpay_payment_id IS NOT NULL
GROUP BY razorpay_payment_id
HAVING COUNT(*) > 1

UNION ALL

SELECT 'payments.provider_payment_id', provider_payment_id, COUNT(*)
FROM public.payments
WHERE provider_payment_id IS NOT NULL
GROUP BY provider_payment_id
HAVING COUNT(*) > 1

UNION ALL

SELECT 'invoices.invoice_number', invoice_number, COUNT(*)
FROM public.invoices
GROUP BY invoice_number
HAVING COUNT(*) > 1

ORDER BY check_name, cnt DESC;

-- -----------------------------------------------------------------------------
-- E) Orphan rows (broken FKs — fix before export)
-- -----------------------------------------------------------------------------
SELECT 'invoice_items without invoice' AS issue, COUNT(*) AS cnt
FROM public.invoice_items ii
LEFT JOIN public.invoices i ON i.id = ii.invoice_id
WHERE i.id IS NULL

UNION ALL

SELECT 'invoices without order', COUNT(*)
FROM public.invoices i
LEFT JOIN public.orders o ON o.id = i.order_id
WHERE o.id IS NULL

UNION ALL

SELECT 'service_persons without order', COUNT(*)
FROM public.service_persons sp
LEFT JOIN public.orders o ON o.id = sp.order_id
WHERE o.id IS NULL

UNION ALL

SELECT 'payments without order', COUNT(*)
FROM public.payments p
LEFT JOIN public.orders o ON o.id = p.order_id
WHERE p.order_id IS NOT NULL AND o.id IS NULL;

-- -----------------------------------------------------------------------------
-- F) GST field completeness (empower invoices)
-- -----------------------------------------------------------------------------
SELECT
  COUNT(*) AS total_empower_invoices,
  COUNT(*) FILTER (WHERE customer_state_code IS NOT NULL AND customer_state_code <> '') AS has_state_code,
  COUNT(*) FILTER (WHERE COALESCE(sac_code, hsn_sac_code) IS NOT NULL) AS has_sac,
  COUNT(*) FILTER (WHERE gstr_category IS NOT NULL) AS has_gstr_category,
  COUNT(*) FILTER (WHERE customer_gstin IS NOT NULL AND customer_gstin <> '') AS b2b_candidates
FROM public.invoices
WHERE source_website = 'empower.ankshaastra.com';

-- -----------------------------------------------------------------------------
-- G) Invoice PDF coverage
-- -----------------------------------------------------------------------------
SELECT
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE pdf_storage_path IS NOT NULL) AS has_storage_path,
  COUNT(*) FILTER (WHERE pdf_url IS NOT NULL) AS has_pdf_url,
  COUNT(*) FILTER (WHERE pdf_storage_path IS NULL AND pdf_url IS NULL) AS missing_pdf
FROM public.invoices
WHERE source_website = 'empower.ankshaastra.com';

-- Sample paths for storage copy planning
SELECT invoice_number, pdf_storage_path, pdf_url
FROM public.invoices
WHERE source_website = 'empower.ankshaastra.com'
  AND (pdf_storage_path IS NOT NULL OR pdf_url IS NOT NULL)
ORDER BY created_at DESC
LIMIT 20;

-- -----------------------------------------------------------------------------
-- H) Export ID lists for hub overlap check (copy results to compare on central)
-- -----------------------------------------------------------------------------
SELECT id, razorpay_payment_id, created_at::date
FROM public.orders
WHERE source_website = 'empower.ankshaastra.com'
ORDER BY created_at;

SELECT id, invoice_number, razorpay_payment_id, order_id, created_at::date
FROM public.invoices
WHERE source_website = 'empower.ankshaastra.com'
ORDER BY created_at;

-- -----------------------------------------------------------------------------
-- I) gst_config on Empower (DO NOT import to hub — reference only)
-- -----------------------------------------------------------------------------
SELECT
  business_name, trade_name, gstin, state_code, default_sac_code,
  invoice_prefix, invoice_sequence, financial_year
FROM public.gst_config
LIMIT 1;

-- -----------------------------------------------------------------------------
-- J) Hub sequence safety — max invoice number pattern on Empower
-- -----------------------------------------------------------------------------
SELECT
  MAX(invoice_sequence) AS empower_gst_config_seq
FROM public.gst_config;

SELECT invoice_number, created_at
FROM public.invoices
ORDER BY created_at DESC
LIMIT 10;
