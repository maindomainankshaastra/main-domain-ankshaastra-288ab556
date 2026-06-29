# Empower → Central Hub — Schema Audit Analysis

**Audit date:** 2026-06-04  
**Database:** Main domain Supabase `iiihikzsewdyhgmpsyaj` (single hub DB — Empower data lives here too)

### Where to run SQL

| File | Where |
|------|--------|
| `EMPOWER_MIGRATION_PREFLIGHT.sql` | [Supabase Dashboard](https://supabase.com/dashboard/project/iiihikzsewdyhgmpsyaj/sql) → **SQL Editor** → paste & run |
| `EMPOWER_SUPABASE_SCHEMA_AUDIT.sql` | Same project (already done) |

No second Empower Supabase project is needed if all tables are already on main domain.

---

## 1. Key finding: schema is already the hub schema

The Empower Supabase project is **not** the old `ankshaastra.orders` (VARCHAR `order_id`) layout from `docs/reference/db.js`. It runs the **same operations platform** as the central hub repo migrations (`20260517120000_operations_platform.sql` onward).

| Implication | Action |
|-------------|--------|
| No column remapping needed | Copy rows table-by-table, not ETL transforms |
| Migration = **data merge** | Two projects with identical DDL |
| Dedup keys matter | `razorpay_payment_id`, `invoice_number`, `provider_payment_id`, UUID `id` |
| `gst_config` | **Do not import** — hub row is source of truth (1 row only) |

### Tables on Empower (from audit)

| Table | ~Rows | Migrate? | Notes |
|-------|------:|----------|-------|
| `websites` | 3 | Skip / merge | Hub already seeds empower |
| `services` | 17 | Maybe | Compare with hub catalog |
| `customers` | 15 | Yes | Merge by email + phone |
| `orders` | 51 | Yes | Filter `source_website` if mixed |
| `service_persons` | 20 | Yes | FK → orders |
| `invoices` | 146 | Yes | Renumber if `invoice_number` clashes |
| `invoice_items` | 146 | Yes | FK → invoices |
| `payments` | 136 | Yes | Unique on `provider_payment_id` |
| `profiles` | 4 | Careful | Needs matching `auth.users` on hub |
| `user_roles` | 4 | Careful | Same as profiles |
| `email_logs` | 304 | Optional | Audit trail |
| `whatsapp_logs` | 8 | Optional | Audit trail |
| `workflow_events` | 459 | Optional | Audit trail |
| `automation_jobs` | 56 | Optional | In-flight jobs only |
| `communication_templates` | 3 | Skip | Hub has templates |
| `gst_config` | 1 | **No** | Hub config wins |
| `gstr_export_runs` | 0 | No | — |
| `product_catalog` | 0 | No | — |
| `ai_reports` | 0 | No | — |
| `webhooks_log` | 0 | No | — |

### Hub tables **not** on Empower (run migrations on Empower first if you need parity)

- `service_pages`
- `service_packages`

These are catalog/admin tables; Empower checkout can read them from the hub API without copying.

---

## 2. First: confirm Empower ≠ Central (same project?)

Run on **both** Empower and Central (`iiihikzsewdyhgmpsyaj`) SQL Editor:

```sql
SELECT current_database() AS db, COUNT(*) AS orders FROM public.orders;
SELECT id, domain FROM public.websites ORDER BY domain;
```

If counts and website UUIDs match exactly, Empower **is** the central project and no migration is needed — only point Empower Vercel env to the hub URL/API.

---

## 3. Pre-flight queries (run on Empower now)

### 3a. Data split by website

```sql
SELECT 'orders' AS entity, source_website::text, COUNT(*) AS cnt
FROM public.orders GROUP BY source_website
UNION ALL
SELECT 'invoices', source_website::text, COUNT(*)
FROM public.invoices GROUP BY source_website
UNION ALL
SELECT 'customers', source_website::text, COUNT(*)
FROM public.customers GROUP BY source_website
ORDER BY entity, source_website;
```

### 3b. Empower-only volume

```sql
SELECT COUNT(*) AS empower_orders
FROM public.orders
WHERE source_website = 'empower.ankshaastra.com';

SELECT COUNT(*) AS empower_invoices
FROM public.invoices
WHERE source_website = 'empower.ankshaastra.com';
```

### 3c. Internal duplicates (fix on Empower before export)

```sql
-- Duplicate Razorpay payments (hub enforces unique index)
SELECT razorpay_payment_id, COUNT(*)
FROM public.orders
WHERE razorpay_payment_id IS NOT NULL
GROUP BY 1 HAVING COUNT(*) > 1;

SELECT razorpay_payment_id, COUNT(*)
FROM public.invoices
WHERE razorpay_payment_id IS NOT NULL
GROUP BY 1 HAVING COUNT(*) > 1;

SELECT provider_payment_id, COUNT(*)
FROM public.payments
WHERE provider_payment_id IS NOT NULL
GROUP BY 1 HAVING COUNT(*) > 1;

-- Duplicate invoice numbers
SELECT invoice_number, COUNT(*)
FROM public.invoices
GROUP BY 1 HAVING COUNT(*) > 1;

-- Orphan FK checks
SELECT COUNT(*) AS orphan_invoice_items
FROM public.invoice_items ii
LEFT JOIN public.invoices i ON i.id = ii.invoice_id
WHERE i.id IS NULL;

SELECT COUNT(*) AS orphan_service_persons
FROM public.service_persons sp
LEFT JOIN public.orders o ON o.id = sp.order_id
WHERE o.id IS NULL;
```

### 3d. GST readiness (for GSTR after merge)

```sql
SELECT
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE customer_state_code IS NOT NULL) AS with_state_code,
  COUNT(*) FILTER (WHERE sac_code IS NOT NULL OR hsn_sac_code IS NOT NULL) AS with_sac,
  COUNT(*) FILTER (WHERE gstr_category IS NOT NULL) AS with_gstr_category
FROM public.invoices
WHERE source_website = 'empower.ankshaastra.com';
```

### 3e. Storage (invoice PDFs)

```sql
SELECT
  COUNT(*) FILTER (WHERE pdf_storage_path IS NOT NULL) AS with_storage_path,
  COUNT(*) FILTER (WHERE pdf_url IS NOT NULL) AS with_pdf_url,
  COUNT(*) FILTER (WHERE pdf_storage_path IS NULL AND pdf_url IS NULL) AS missing_pdf
FROM public.invoices
WHERE source_website = 'empower.ankshaastra.com';
```

---

## 4. Pre-flight on Central (overlap / conflict check)

After exporting Empower `id` lists (or using a temp staging table), run on **hub**:

```sql
-- Replace with CSV import to temp table, or paste UUIDs
-- Example: orders that already exist on hub
SELECT e.id, e.razorpay_payment_id, e.invoice_number
FROM public.orders e
WHERE e.id IN (
  -- paste Empower order UUIDs here
);

-- Invoice number collisions (critical)
SELECT i.invoice_number
FROM public.invoices i
WHERE i.invoice_number IN (
  SELECT invoice_number FROM public.invoices  -- run on Empower, paste results
);
```

Simpler approach — if both DBs are accessible via `postgres` connection strings:

```sql
-- On hub: after loading empower_invoices(invoice_number) staging table
SELECT hub.invoice_number, hub.id AS hub_id, emp.invoice_number AS empower_dup
FROM public.invoices hub
JOIN empower_invoices emp ON emp.invoice_number = hub.invoice_number;
```

---

## 5. Migration order (FK dependencies)

```
1. customers          (no FK to orders)
2. orders             → customers, services
3. service_persons    → orders
4. invoices           → orders, customers
5. invoice_items      → invoices
6. payments           → orders, invoices, customers
7. email_logs         → customers, orders, invoices (optional)
8. whatsapp_logs      → same (optional)
9. workflow_events    → orders, customers (optional)
```

**Skip:** `gst_config`, `websites` (unless empower row missing), `communication_templates`, `profiles`/`user_roles` unless migrating auth users.

---

## 6. Merge strategies

### Option A — Same schema, low volume (~150 invoices): staging + INSERT

1. Export Empower tables as CSV from SQL Editor or `pg_dump --data-only`.
2. Import into hub **staging** tables (`empower_orders`, etc.).
3. `INSERT ... ON CONFLICT DO NOTHING` for UUID primary keys.
4. Resolve `invoice_number` conflicts with prefix remap (e.g. `EMP-` prefix).
5. Copy storage objects: Empower `invoices` bucket → hub `invoices` bucket; fix `pdf_storage_path`.

### Option B — Going forward only (no historical merge)

1. Point Empower env to hub Supabase + hub APIs (Phase 1–2 in hub plan).
2. Leave Empower DB read-only archive.
3. Run hub **GST Maintenance → Fix All** on new empower-tagged invoices only.

### Option C — pg_dump data-only (fastest for full copy)

```bash
# From Empower connection string
pg_dump "$EMPOWER_DATABASE_URL" \
  --data-only \
  --table=public.customers \
  --table=public.orders \
  --table=public.service_persons \
  --table=public.invoices \
  --table=public.invoice_items \
  --table=public.payments \
  -f empower_core_data.sql
```

Then edit SQL on hub: wrap in transaction, add `ON CONFLICT`, fix sequences (`gst_config.invoice_sequence` bump after import).

---

## 7. Column mapping (1:1 — no transform)

Empower columns match hub. Required tags for GSTR:

| Hub column | Empower value |
|------------|---------------|
| `orders.source_website` | `empower.ankshaastra.com` |
| `invoices.source_website` | `empower.ankshaastra.com` |
| `customers.source_website` | `empower.ankshaastra.com` |
| `invoices.sac_code` / `hsn_sac_code` | `999799` (run auto-fix on hub after import) |
| `invoices.customer_state_code` | From checkout metadata |

---

## 8. After merge on hub

1. Admin → **GST Maintenance** → Fix All (backfill SAC, state, GSTR category).
2. Verify `gst_config.invoice_sequence` > max imported invoice sequence.
3. Admin → Orders / Invoices → filter `empower.ankshaastra.com`.
4. GSTR Reports → test export for month with empower invoices.
5. Decommission Empower Supabase (Phase 5) after 30-day read-only period.

---

## 9. What to send next

Run **section 3** queries on Empower and share:

1. `source_website` breakdown (3a)
2. Empower-only counts (3b)
3. Any duplicate payment IDs or invoice numbers (3c)
4. Same row counts from **Central** hub for comparison

With that we can generate the exact `INSERT ... SELECT` staging script and invoice renumbering rules.
