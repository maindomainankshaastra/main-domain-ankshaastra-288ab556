# Empower Site Analysis — Services, Packages & GSTR-1 Invoice Gap

**Site:** https://empower.ankshaastra.com  
**Analysed:** 2026-06-04 (live JS bundle + reference API code in `docs/reference/`)

---

## 1. Executive summary

| Topic | Finding |
|-------|---------|
| **Supabase on Empower** | **Not used as primary DB.** Checkout writes to **PostgreSQL** schema `ankshaastra` via `DATABASE_URL` (Vercel/server). Supabase is optional **only** for PDF upload to `invoices` bucket. |
| **Main domain Supabase** | Hub CRM (`public.orders`, `public.invoices`, …) — separate from Empower’s Postgres. |
| **Invoices today** | PDF generated on payment → **email attachment** + HTML invoice in email. DB row in `ankshaastra.invoices` is **minimal** (no SAC, state code, GSTR category). Storage upload is **best-effort** (often fails silently). |
| **GSTR-1** | **Cannot file Empower sales from email-only invoices.** Need hub `invoice-engine` → `public.invoices` + `invoice_items` + PDF in central `invoices` storage bucket. |

---

## 2. Services & packages (live on empower.ankshaastra.com)

Pricing is defined in `packagePricing-BAca_baT.js` (env overrides via `VITE_PACKAGE_*`).

### 2.1 Name Check (`packageType`: `namecheck-1` / `namecheck-2` / `namecheck-3`)

| Tier | API `packageType` | Price (₹) | Original (₹) | Savings |
|------|-------------------|----------:|-------------:|--------:|
| 1 name | `namecheck-1` | **293** | 293 | — |
| 2 names | `namecheck-2` | **528** | 586 | 29 |
| 3 names | `namecheck-3` | **747** | 879 | 44 |

- Hero CTA: “Get Name Check @ ₹293”
- Form collects person 1–3 names/DOB/gender depending on tier.

### 2.2 Perfect Baby Name Report (`packageType`: `single`)

| Field | Value |
|-------|-------|
| Display name | Perfect Baby Name Report |
| Price (₹) | **3,437** |
| Original (₹) | 7,500 |
| Form | Baby/child birth details, father name, place/time of birth, pincode |

### 2.3 Complete Baby Name Blueprint (`packageType`: `premium`)

| Field | Value |
|-------|-------|
| Display name | Complete Baby Name Blueprint |
| Price (₹) | **5,957** |
| Original (₹) | 15,051 |
| Includes | Premium package + optional live session path in UI |

### 2.4 Live Video Consultation (`packageType`: `premium` / `live` / `consultation`)

| Field | Value |
|-------|-------|
| Display name | Live Video Consultation |
| Price (₹) | **8,927** (from env `VITE_PACKAGE_CONSULTATION_PRICE`) |
| Note | Listed in admin service types alongside Name Check and Perfect Baby Name |

### 2.5 Optional add-ons (checkout form)

| Add-on | Price (₹) | When |
|--------|----------:|------|
| 10+ extra numerologically aligned names | **737** | Baby report packages |
| Numerologically aligned nickname | **737** | Baby report packages |

**Example totals:** Perfect Baby + both add-ons = 3437 + 737 + 737 = **4,911**

### 2.6 `/baby-name` landing (secondary funnel)

- Promotional display **₹2,497** (“Get Report”) — separate marketing page; verify active checkout amount in Razorpay before backfill.

### 2.7 Site routes (customer-facing)

| Route | Purpose |
|-------|---------|
| `/` | Main landing + pricing + order form |
| `/baby-name` | Alternate baby name landing |
| `/payment-status`, `/payment/success`, `/payment/failed` | Post-payment |
| `/admin`, `/admin/panel` | Internal CRM (orders, clients, revenue) |

### 2.8 Admin service types (internal labels)

`Name Check` · `Perfect Baby Name` · `Live Video Consultation`

---

## 3. Payment & invoice flow (current Empower stack)

```
Customer form
    → POST /api/initiate-payment
    → ankshaastra.orders + ankshaastra.customer_details (Postgres)
    → Razorpay checkout

Payment success
    → /api/payment-webhook or /api/payment-status
    → generateInvoicePDF() (pdf-lib, EYN{FY}/{NNNN} numbering)
    → saveInvoiceRecord → ankshaastra.invoices (minimal columns)
    → optional upload → Supabase Storage invoices/{year}/{month}/...
    → send-email.js → HTML invoice + PDF attachment to customer
    → WhatsApp notification (optional)
```

### What `ankshaastra.invoices` stores (legacy)

- `order_id`, `invoice_number`, `financial_year`, `customer_name`, `customer_email`, `amount`, `package_type`, `transaction_id`
- **Missing for GSTR-1:** `customer_state_code`, `place_of_supply`, `sac_code`, `cgst/sgst/igst` split, `gstr_category`, `source_website`, `pdf_storage_path` link to hub bucket

### What hub `public.invoices` needs (GSTR-1)

- Full GST breakdown, SAC **999799**, customer state from pincode, `gstr_category` (B2B/B2CS/B2CL)
- `source_website = 'empower.ankshaastra.com'`
- `pdf_storage_path` in central `invoices` bucket
- Linked `orders`, `customers`, `payments`, `invoice_items`

---

## 4. Where data actually lives

| System | Empower production (likely) | Main domain hub |
|--------|----------------------------|-----------------|
| Orders | `DATABASE_URL` → `ankshaastra.orders` | `public.orders` |
| Customers | `ankshaastra.customer_details` | `public.customers` |
| Invoices | `ankshaastra.invoices` | `public.invoices` |
| PDF files | Email only + maybe orphan Supabase files | `invoices` bucket + `pdf_storage_path` |
| GSTR export | ❌ | Admin → GSTR Reports |

**Your Supabase audit (51 orders, 146 invoices)** is the **hub** project — not Empower’s Postgres. Zero Empower rows there unless `source_website = 'empower.ankshaastra.com'`.

---

## 5. Recommended path to GSTR-1 for Empower sales

### Phase A — Stop the leak (new orders) — **priority**

Wire Empower checkout to hub APIs (already built on ankshaastra.com):

1. Empower Vercel env: `VITE_HUB_API_BASE`, `VITE_SOURCE_WEBSITE=empower.ankshaastra.com`
2. Replace `POST /api/initiate-payment` flow with hub `POST /api/create-order` + `verify-payment`
3. Hub `invoice-engine` creates `public.invoices`, uploads PDF, sends email
4. Checkout must send `metadata.formSnapshot` with **pincode / customerState / customerStateCode**

See [EMPOWER_SITE_INTEGRATION.md](./EMPOWER_SITE_INTEGRATION.md).

### Phase B — Historical Empower invoices (for past GSTR periods)

1. **Locate Empower Postgres** — Vercel project → Settings → Environment → `DATABASE_URL` (not Supabase URL).
2. Export paid orders + customer pincode/state:

```sql
-- Run on Empower DATABASE_URL (schema ankshaastra)
SELECT
  o.order_id,
  o.amount,
  o.package_type,
  o.status,
  o.created_at,
  cd.email,
  cd.name,
  cd.mobile,
  cd.pin_code,
  cd.city,
  i.invoice_number,
  i.transaction_id AS razorpay_payment_id
FROM ankshaastra.orders o
LEFT JOIN ankshaastra.customer_details cd ON cd.order_id = o.order_id
LEFT JOIN ankshaastra.invoices i ON i.order_id = o.order_id
WHERE o.status IN ('PAID', 'SUCCESS', 'paid')
ORDER BY o.created_at;
```

3. **Backfill options:**
   - **Hub order-ingest API** per order (idempotent by `paymentId`) — regenerates compliant invoices
   - **GST Maintenance → Fix All** after bulk import
   - **Email archive:** if DB empty but Gmail has PDFs, manual import is last resort (no structured GSTR fields)

4. **Invoice PDFs:** Re-generate via hub engine (preferred) rather than copying old EYN PDFs (old format may lack SAC/state).

### Phase C — Catalog on hub (optional, for admin visibility)

Seed `public.services` / `service_packages` for Empower SKUs:

| Hub service title | Price | SAC | Category |
|-------------------|------:|-----|----------|
| Name Check 1 | 293 | 999799 | Empower |
| Name Check 2 | 528 | 999799 | Empower |
| Name Check 3 | 747 | 999799 | Empower |
| Perfect Baby Name Report | 3437 | 999799 | Empower |
| Complete Baby Name Blueprint | 5957 | 999799 | Empower |
| Live Video Consultation | 8927 | 999799 | Empower |

---

## 6. Quick checks you can run now

### On main domain Supabase (hub)

```sql
SELECT source_website::text, COUNT(*) FROM public.orders GROUP BY 1;
SELECT source_website::text, COUNT(*) FROM public.invoices GROUP BY 1;
```

If empower count = **0**, all historical Empower revenue is still only in Postgres/email.

### On Empower Vercel (find real DB)

- Project: empower.ankshaastra.com hosting
- Env vars: `DATABASE_URL`, `SUPABASE_URL` (optional), `RAZORPAY_*`

---

## 7. Decision matrix

| If… | Then… |
|-----|-------|
| Empower `DATABASE_URL` has paid orders | Backfill via hub ingest + GST fix |
| Only emails, no DB | Parse Razorpay dashboard + manual GSTR for past; fix forward path immediately |
| Hub already has `source_website = empower` rows | Skip migration; verify PDF + GST fields on those invoices |
| Same Razorpay account as hub | Use `razorpay_payment_id` dedup when importing |

---

## 8. Next actions (ordered)

1. Confirm Empower `DATABASE_URL` host and run export SQL (§5 Phase B).
2. Run hub `source_website` counts (§6).
3. Deploy hub API integration on Empower for **new** checkouts (§5 Phase A).
4. Bulk backfill historical orders → hub → **GST Maintenance → Fix All**.
5. Validate GSTR-1 export in admin for a month that includes Empower invoices.
