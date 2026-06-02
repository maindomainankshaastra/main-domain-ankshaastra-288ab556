-- One Razorpay payment → one order → one invoice (payment ID is the canonical key).

-- Dedupe orders that share the same captured payment
WITH ranked_orders AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY razorpay_payment_id
      ORDER BY
        CASE WHEN status = 'paid' THEN 0 ELSE 1 END,
        created_at ASC
    ) AS rn
  FROM public.orders
  WHERE razorpay_payment_id IS NOT NULL
)
DELETE FROM public.orders
WHERE id IN (SELECT id FROM ranked_orders WHERE rn > 1);

CREATE UNIQUE INDEX IF NOT EXISTS orders_razorpay_payment_id_unique
  ON public.orders (razorpay_payment_id)
  WHERE razorpay_payment_id IS NOT NULL;

-- Backfill invoice payment IDs from their orders
UPDATE public.invoices i
SET razorpay_payment_id = o.razorpay_payment_id
FROM public.orders o
WHERE i.order_id = o.id
  AND i.razorpay_payment_id IS NULL
  AND o.razorpay_payment_id IS NOT NULL;

-- Dedupe invoices that share the same payment
WITH ranked_invoices AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY razorpay_payment_id
      ORDER BY
        CASE WHEN pdf_storage_path IS NOT NULL OR pdf_url IS NOT NULL THEN 0 ELSE 1 END,
        created_at ASC
    ) AS rn
  FROM public.invoices
  WHERE razorpay_payment_id IS NOT NULL
)
DELETE FROM public.invoices
WHERE id IN (SELECT id FROM ranked_invoices WHERE rn > 1);

CREATE UNIQUE INDEX IF NOT EXISTS invoices_razorpay_payment_id_unique
  ON public.invoices (razorpay_payment_id)
  WHERE razorpay_payment_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS payments_provider_payment_id_unique
  ON public.payments (provider_payment_id)
  WHERE provider_payment_id IS NOT NULL;
