-- Allow authenticated users to view invoices that match their account email
-- (covers guest checkout before user_id was linked on the invoice row).
CREATE POLICY "Users can view invoices by customer email"
ON public.invoices
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND customer_email IS NOT NULL
  AND lower(customer_email) = lower(coalesce(
    (SELECT email FROM public.profiles WHERE user_id = auth.uid() LIMIT 1),
    auth.jwt() ->> 'email'
  ))
);
