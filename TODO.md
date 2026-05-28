# TODO - Ankshaastra Invoice PDF & Email Template Migration

## Step 1: Update invoice HTML template
- Replace `api/lib/templates/invoice-html.ts` with the provided code from the migration guide.

## Step 2: Update PDF engine
- Replace `api/lib/pdf-engine.ts` with the provided code from the migration guide.

## Step 3: Update email engine
- Replace `api/lib/email-engine.ts` with the provided SMTP version from the migration guide (removing Supabase email_logs/resend routing as requested).

## Step 4: Update invoice engine
- Update `api/lib/invoice-engine.ts` to ensure customer + admin email logic matches the guide (customer “Payment Successful” and admin “New Order Received”, both with PDF attachment).
- Verify existing functions still compile.

## Step 5: Install/verify deps
- Ensure `nodemailer`, `puppeteer-core`, `@sparticuz/chromium` are installed.

## Step 6: Typecheck/test
- Run `npm run build` (or available TS check) and any existing tests.

