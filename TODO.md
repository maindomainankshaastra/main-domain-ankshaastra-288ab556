# TODO - Ankshaastra changes

## Plan (ordered)
1. Invoice creation on successful payment
   - Locate current payment verification flow (src/pages/Payment.tsx + /api/verify-payment.ts)
   - Add server-side invoice creation logic after Razorpay signature verification
   - Persist invoice row to Supabase (public.invoices)
   - Generate / store PDF URL (or placeholder if PDF service not present)
   - Send invoice email to customer + admin using configured email provider (implement minimal integration)
   - Send email only after payment is confirmed and invoice exists

2. Speed/load performance fixes
   - Identify heavy components and unnecessary animation / renders on main pages
   - Reduce layout shifts: skeleton fallbacks and remove blocking animations where needed
   - Check network-heavy images: add proper lazy loading and decoding
   - Build and run production bundle to inspect chunks

3. White space / blank screen on /services/name-correction
   - Reproduce by reviewing router and page component used for that route
   - Add an error boundary + fallback UI to prevent full blank screen
   - Fix the underlying runtime error (likely import/asset or undefined state)

4. Pricing via environment variables on Vercel
   - Replace hardcoded prices in src/pages/Services.tsx and src/pages/NameCorrection.tsx (and other price blocks) with values from Vercel env vars
   - Implement a small pricing config module that reads import.meta.env.*
   - Ensure defaults exist for local dev
   - Update any calculation usage (Payment.tsx uses amount query param; ensure query param uses env price)

## Step tracking
- [ ] Step 1: Invoice creation on successful payment
- [ ] Step 2: Speed/load performance fixes
- [ ] Step 3: White space / blank screen fix
- [ ] Step 4: Env-based pricing updates

