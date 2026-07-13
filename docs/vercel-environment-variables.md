# Vercel Environment Variables

Use this checklist in Vercel: Project Settings -> Environment Variables.

Set these for Production, Preview, and Development unless noted otherwise.

## Required

### Supabase

| Variable | Where to find it | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Supabase Dashboard -> Project Settings -> API -> Project URL | Browser-safe. Used by the React app. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase Dashboard -> Project Settings -> API -> anon/public key | Browser-safe. RLS still applies. |
| `SUPABASE_URL` | Same value as `VITE_SUPABASE_URL` | Serverless API routes use this. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard -> Project Settings -> API -> service_role key | Secret. Required for invoice upload, admin inserts, and webhooks. Never expose in frontend code. |

### Razorpay

| Variable | Where to find it | Notes |
| --- | --- | --- |
| `VITE_RAZORPAY_KEY_ID` | Razorpay Dashboard -> Account & Settings -> API Keys | Browser-safe key used by Razorpay Checkout. |
| `RAZORPAY_KEY_ID` | Razorpay Dashboard -> Account & Settings -> API Keys | Server-side order creation. |
| `RAZORPAY_KEY_SECRET` | Razorpay Dashboard -> Account & Settings -> API Keys | Secret. Server-side order creation and payment verification. |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Dashboard -> Webhooks -> webhook secret | Secret. Required for `/api/webhooks/razorpay`. |

### Email

Choose one provider path.

#### SMTP Option

| Variable | Example | Notes |
| --- | --- | --- |
| `MAILER_PROVIDER` | `smtp` | Enables SMTP sending. |
| `EMAIL_FROM` | `Ankshaastra <no-reply@ankshaastra.com>` | Sender shown to customer/admin. |
| `SMTP_HOST` | `mail.ankshaastra.com` | Mail **server hostname** only — not your mailbox email. |
| `SMTP_PORT` | `587` | Use `465` for secure SMTP if your provider requires it. |
| `SMTP_USER` | `Mail@ankshaastra.com` | SMTP username (usually your full mailbox address). |
| `SMTP_PASS` or `SMTP_PASSWORD` | `smtp-password` | Secret SMTP password. |

#### Resend Option

| Variable | Example | Notes |
| --- | --- | --- |
| `MAILER_PROVIDER` | `resend` | Enables Resend sending. |
| `EMAIL_FROM` | `Ankshaastra <no-reply@ankshaastra.com>` | Must be a verified Resend sender/domain. |
| `RESEND_API_KEY` | `re_...` | Secret Resend API key. |

### Invoice/Admin Notifications

| Variable | Example | Notes |
| --- | --- | --- |
| `ADMIN_EMAIL` | `social@ankshaastra.com` | Admin receives the invoice email and attachment here. |
| `INVOICE_ADMIN_EMAIL` | `no-reply@ankshaastra.com` | Optional fallback if `ADMIN_EMAIL` is not set. |

## Recommended

### Job Processing

| Variable | Example | Notes |
| --- | --- | --- |
| `CRON_SECRET` | long random string | Used to authorize `/api/operations/process-jobs`. Required if you call the job processor from Vercel Cron. |
| `OPERATIONS_API_KEYS` | `empower_prod_key_xxxxx` | API keys for `/api/operations/order-ingest` (Empower server-side). |
| `PARTNER_SITE_ORIGINS` | `https://empower.ankshaastra.com` | CORS origins for partner checkout APIs. Defaults include Empower. |
| `SITE_URL` | `https://ankshaastra.com` | Hub URL returned in `/api/operations/site-manifest`. |

## Frontend Business Settings

These are browser-safe `VITE_` values used by the UI.

| Variable | Example |
| --- | --- |
| `VITE_SUPPORT_PHONE` | `919667305577` |
| `VITE_WHATSAPP_NUMBER` | `919667305577` |
| `VITE_LEAD_WHATSAPP_NUMBER` | `919667305557` |
| `VITE_SUPPORT_EMAIL` | `social@ankshaastra.com` |
| `VITE_CONTACT_EMAIL` | `contact@ankshaastra.com` |
| `VITE_BUSINESS_ADDRESS` | `India` |
| `VITE_API_BASE_URL` | leave blank unless using a separate API host |

### Partner site integration (Empower, Miracle Baby)

| Variable | Example |
| --- | --- |
| `OPERATIONS_API_KEYS` | `empower_prod_key_xxxxx` |
| `PARTNER_SITE_ORIGINS` | `https://empower.ankshaastra.com` |
| `SITE_URL` | `https://ankshaastra.com` |

See [EMPOWER_CENTRAL_HUB_PLAN.md](./EMPOWER_CENTRAL_HUB_PLAN.md) for phase-wise rollout.

Pricing variables are already listed in `.env.example`. Add them to Vercel only if you want to override the defaults in `src/config/pricing.ts`.

## Supabase Storage Required For Invoices

The invoice system stores files in a private Supabase Storage bucket:

```text
Bucket: invoices
Public: false
Allowed MIME types: application/pdf
File size limit: 10 MB
```

A migration was added to create/update this bucket:

```text
supabase/migrations/20260527093000_invoice_storage_bucket.sql
```

Generated invoice files are uploaded as PDF only:

```text
invoices/INV-YYYYMMDD-00001.pdf
```

The `invoices` database table stores:

| Column | Purpose |
| --- | --- |
| `pdf_storage_path` | Private bucket path. |
| `pdf_url` | Signed URL shown in customer dashboard and admin invoice panel. |

## Minimum Production Set

For invoice generation, storage, payment verification, and email delivery, Vercel must have at least:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
VITE_RAZORPAY_KEY_ID=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
MAILER_PROVIDER=smtp
EMAIL_FROM=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
ADMIN_EMAIL=
```
