# Ankshaastra CRM — Migration & Implementation Plan

## Pre-flight checklist

- [ ] Backup production Supabase before migrations
- [ ] Run migrations on staging first
- [ ] Verify Razorpay webhooks + invoice generation smoke test after each phase
- [ ] Regenerate `src/integrations/supabase/types.ts` after schema changes (`supabase gen types`)

---

## Phase 1 — Customer data model refactor

### 1.1 Database migration

**File:** `supabase/migrations/20260606120000_crm_service_persons.sql`

- Create `service_persons` table (FK `order_id`, optional `service_id`)
- Add `min_persons`, `max_persons` to `services` and `service_packages`
- Seed person counts for name correction / name check / kundli packages
- RLS policies (admin + order owner read)
- Optional: SQL backfill from `orders.metadata->formSnapshot`

### 1.2 Backend

| File | Change |
|------|--------|
| `api/lib/service-persons.ts` | **NEW** — extract persons from snapshot, sync to DB, resolve purchaser |
| `api/lib/fulfill-payment.ts` | Use purchaser resolver; await `syncServicePersonsForOrder` |
| `api/lib/invoice-engine.ts` | Ensure persons synced before PDF |
| `server/handlers/create-order.ts` | Store `metadata.purchaserName` |

### 1.3 Frontend

| File | Change |
|------|--------|
| `src/lib/service-persons.ts` | **NEW** — shared extract + person count helpers |
| `src/lib/service-person-config.ts` | **NEW** — min/max from catalog + service title |
| `src/pages/Payment.tsx` | Purchaser name field; dynamic person blocks; validation |
| `src/data/serviceCatalog.ts` | Document min/max on packages |

### 1.4 Validation rules

- Block submit if `persons.length < min_persons` or `> max_persons`
- Name Check 2 → 2 person blocks; Name Check 3 → 3 blocks

### 1.5 Commit message (when requested)

```
feat(crm): add service_persons table and checkout person extraction
```

---

## Phase 2 — Invoice correction

### 2.1 Files

| File | Change |
|------|--------|
| `api/lib/build-invoice-template.ts` | Load subjects from `service_persons`; set `purchasedByName`, `serviceSubjects` |
| `api/lib/templates/invoice-html.ts` | Render Purchased By + Service Subject(s) |
| `api/lib/pdf-lib-invoice.ts` | Same layout for serverless PDF |
| `api/lib/order-form-details.ts` | Header: purchaser vs subjects |
| `api/lib/templates/invoice-email.ts` | Greeting uses purchaser name |

### 2.2 Commit message

```
fix(invoice): show purchaser and service subjects separately on PDF
```

---

## Phase 3 — CRM home dashboard

### 3.1 Database

- Materialized view or RPC `crm_dashboard_stats()` for revenue KPIs

### 3.2 Files

| File | Change |
|------|--------|
| `src/pages/admin/AdminDashboard.tsx` | Widgets + charts (recharts) |
| `server/handlers/admin-crm-dashboard.ts` | **NEW** — aggregated stats API |
| `api/index.ts` | Register route |

---

## Phase 4 — Customer CRM module

### 4.1 Database

- `customer_notes`, `customer_tags`, `customer_tag_assignments`

### 4.2 Files

| File | Change |
|------|--------|
| `src/pages/admin/modules/CrmModule.tsx` | List + search + export |
| `src/pages/admin/modules/CustomerProfileModule.tsx` | **NEW** — 360° profile |
| `src/App.tsx` | Route `/admin/crm/:customerId` |

---

## Phase 5 — Lead management

### 5.1 Database

```sql
CREATE TABLE crm_leads (
  id, name, phone, email, source, campaign, status,
  assigned_to, remarks, follow_up_at, converted_customer_id, metadata
);
```

### 5.2 Files

- `src/pages/admin/modules/LeadsModule.tsx`
- Pipeline status enum + filters

---

## Phase 6 — Sales pipeline (Kanban)

- Extend `orders.workflow_stage` or add `sales_stage`
- `src/pages/admin/modules/SalesPipelineModule.tsx`
- Drag-drop stage updates → `workflow_events`

---

## Phase 7 — Appointments

```sql
CREATE TABLE appointments (
  id, customer_id, order_id, service_id, astrologer_id,
  scheduled_at, status, meeting_link, notes
);
```

---

## Phase 8 — Consultation CRM

```sql
CREATE TABLE consultation_records (
  id, order_id, call_notes, recording_url, summary,
  recommendations, follow_up_required, follow_up_at
);
```

---

## Phase 9 — Internal CRM notes

- Reuse `customer_notes` with `visibility = 'internal'`
- Order-level notes on `orders.metadata.crmNotes`

---

## Phase 10 — Communication center

- Unify `email_logs`, future `whatsapp_logs`, `sms_logs`
- Timeline component on customer profile

---

## Phase 11 — Reporting

- `server/handlers/admin-crm-reports.ts`
- Export CSV/XLSX/PDF per report type

---

## Phase 12 — Role-based access

### 12.1 Database

```sql
ALTER TYPE app_role ADD VALUE 'astrologer';
ALTER TYPE app_role ADD VALUE 'support';
ALTER TYPE app_role ADD VALUE 'accounts';
ALTER TYPE app_role ADD VALUE 'marketing';
-- permissions table: role, resource, action
```

### 12.2 Files

- `src/hooks/useAuth.tsx` — permission checks
- `src/components/auth/ProtectedRoute.tsx` — resource gates
- Restore user management from legacy `Admin.tsx` into live admin

---

## Phase 13 — Future AI CRM (schema-only prep)

Add nullable JSONB columns:

- `customers.ai_segment`
- `crm_leads.ai_score`
- `customers.metadata->predicted_ltv`

No ML implementation in initial release.

---

## Backfill script (run once post Phase 1)

```bash
# server/scripts/backfill-service-persons.ts
# Iterates paid orders where service_persons count = 0
# Reads metadata.formSnapshot → insert service_persons
```

---

## Affected files summary (all phases)

### Database

- `supabase/migrations/20260606120000_crm_service_persons.sql` ✅ Phase 1
- Future migrations per phase above

### Backend (api/ + server/)

- `api/lib/service-persons.ts` ✅
- `api/lib/fulfill-payment.ts` ✅
- `api/lib/invoice-engine.ts`
- `api/lib/build-invoice-template.ts` ✅
- `api/lib/templates/invoice-html.ts` ✅
- `api/lib/pdf-lib-invoice.ts` ✅
- `api/lib/order-form-details.ts`
- `server/handlers/create-order.ts`

### Frontend

- `src/pages/Payment.tsx`
- `src/lib/service-persons.ts` ✅
- `src/pages/admin/AdminDashboard.tsx`
- `src/pages/admin/modules/CrmModule.tsx`
- New modules per phase

### Types

- `src/integrations/supabase/types.ts` (regenerate)

---

## Testing plan

| Test | Phase |
|------|-------|
| Name Check 1 checkout → 1 service_person row | 1 |
| Name Correction couple → 2 rows, purchaser on invoice | 1–2 |
| Kundli Triple → 3 rows | 1 |
| Legacy order backfill | 1 |
| Invoice PDF regen shows subjects | 2 |
| Admin CRM customer profile shows subjects | 4 |
| Dashboard revenue matches orders sum | 3 |

---

## Rollout order

1. **Week 1:** Phase 1 + 2 (data model + invoices) — **START HERE**
2. **Week 2:** Phase 3 + 4 + 9 (dashboard + customer profiles + notes)
3. **Week 3:** Phase 5 + 6 (leads + sales pipeline)
4. **Week 4:** Phase 7 + 8 + 10 (appointments + consultations + comms)
5. **Week 5:** Phase 11 + 12 (reports + RBAC)
6. **Future:** Phase 13 AI hooks
