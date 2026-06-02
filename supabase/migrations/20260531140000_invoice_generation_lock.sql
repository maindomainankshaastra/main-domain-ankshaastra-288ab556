-- Stronger idempotency: one order per Razorpay payment, one invoice per order, order-level email dedup.

-- Remove duplicate invoices (keep best per order)
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY order_id
      ORDER BY
        CASE WHEN pdf_storage_path IS NOT NULL OR pdf_url IS NOT NULL THEN 0 ELSE 1 END,
        created_at ASC
    ) AS rn
  FROM public.invoices
)
DELETE FROM public.invoices
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

CREATE UNIQUE INDEX IF NOT EXISTS invoices_order_id_unique ON public.invoices (order_id);

CREATE UNIQUE INDEX IF NOT EXISTS orders_razorpay_order_id_unique
  ON public.orders (razorpay_order_id)
  WHERE razorpay_order_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS email_logs_order_template_sent_unique
  ON public.email_logs (order_id, template_slug)
  WHERE status = 'sent' AND order_id IS NOT NULL AND template_slug IS NOT NULL;

-- Transaction-scoped advisory lock per order (prevents concurrent PDF generation).
CREATE OR REPLACE FUNCTION public.try_invoice_generation_lock(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN pg_try_advisory_xact_lock(hashtext(p_order_id::text));
END;
$$;
