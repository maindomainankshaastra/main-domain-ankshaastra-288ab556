# Ankshaastra CRM & Customer Management — Architecture Plan

## Executive summary

The platform currently stores all checkout form data as JSON in `orders.metadata.formSnapshot`, with the payer denormalized on `orders.customer_*`. Service subjects (people being analyzed) are not normalized, which breaks CRM history, invoices, and future automation.

This plan separates **Purchaser** (who paid) from **Service Subjects** (who the service is for), introduces a `service_persons` table, and evolves the admin console into a full CRM in phased releases.

---

## Current architecture (as-is)

```
Payment.tsx
  └─ POST /api/create-order
       └─ orders (customer_name = often first subject, not purchaser)
            └─ metadata.formSnapshot (JSONB: person1, person2, flat fields)
                 └─ POST /api/verify-payment → fulfill-payment.ts
                      └─ invoice-engine.ts → customers (upsert by email)
                           └─ PDF + email (billing name = customer_name)
```

### Key files today

| Layer | Path | Role |
|-------|------|------|
| Checkout UI | `src/pages/Payment.tsx` | Zod schemas, form render, Razorpay |
| Extended forms | `src/lib/payment-form-ext.ts` | Lucky numerology, business, office vastu |
| Order create | `server/handlers/create-order.ts` | Insert pending order |
| Fulfillment | `api/lib/fulfill-payment.ts` | Mark paid, merge metadata |
| Form flatten | `api/lib/order-form-details.ts` | Email order-details HTML |
| Invoice | `api/lib/invoice-engine.ts`, `build-invoice-template.ts` | PDF + GST |
| Admin | `src/pages/admin/modules/*` | Orders, CRM list, invoices |
| DB | `supabase/migrations/*` | Schema + RLS |

### Known bugs driving this work

1. **Name Check 2/3** — priced for multiple names; form collects one person only.
2. **name-correction-couple** — `customer_name` often blank (uses `firstName` triplet, not `fullName`).
3. **Invoice billing** — shows subject or empty string instead of purchaser + subjects.
4. **CRM** — `CrmModule.tsx` is read-only list; no profiles, pipeline, or person history.
5. **Roles** — `moderator` exists in DB but only `admin` is enforced in UI.

---

## Target architecture (to-be)

```
┌─────────────────────────────────────────────────────────────┐
│                     CHECKOUT (Payment.tsx)                   │
│  Purchaser block: purchaserName, email, whatsapp             │
│  Dynamic person blocks: N = service.min_persons..max_persons │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ orders                    │ service_persons (NEW)            │
│  customer_* = purchaser   │  order_id, person_index          │
│  metadata.formSnapshot    │  first/middle/last/full_name     │
│  (audit + backward compat)│  dob, tob, pob, gender, ...    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ customers (purchaser CRM)  │  invoices (purchased by +      │
│  lifecycle, tags, notes    │   service subjects on PDF)     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ CRM MODULES (phased)                                         │
│  Dashboard │ Customers │ Leads │ Sales │ Appointments │ ...  │
└─────────────────────────────────────────────────────────────┘
```

---

## Domain model

### Purchaser (Customer)

- Who paid and receives communication.
- Stored on: `orders.customer_name`, `orders.customer_email`, `orders.customer_phone`.
- CRM record: `customers` (upserted at invoice time today → move to checkout in Phase 1b).

### Service subject (Service Person)

- Person whose name/DOB/etc. is analyzed.
- Stored on: `service_persons` (new), mirrored from `formSnapshot` for backward compatibility.

### Service configuration

| Table | New columns |
|-------|-------------|
| `services` | `min_persons`, `max_persons` |
| `service_packages` | `min_persons`, `max_persons` |

Person count resolution order: package → service → catalog default → form type inference.

---

## Phase map (13 phases → modules)

| Phase | Module | Priority | Depends on |
|-------|--------|----------|------------|
| 1 | Customer data model + dynamic forms | P0 | — |
| 2 | Invoice correction | P0 | Phase 1 |
| 3 | CRM home dashboard | P1 | orders, customers |
| 4 | Customer CRM profiles | P1 | Phase 1, 3 |
| 5 | Lead management | P2 | customers |
| 6 | Sales pipeline (Kanban) | P2 | orders.workflow_stage |
| 7 | Appointments | P2 | new `appointments` table |
| 8 | Consultation CRM | P2 | consultations table |
| 9 | Internal CRM notes | P1 | customers, orders |
| 10 | Communication center | P2 | email_logs, whatsapp_logs |
| 11 | Reporting & export | P2 | all CRM tables |
| 12 | Role-based access | P1 | extend `app_role` enum |
| 13 | Future AI CRM | P3 | metadata JSONB on customers/leads |

---

## API surface (planned additions)

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/admin/crm/dashboard` | Widget aggregates |
| GET | `/api/admin/crm/customers/:id` | Customer 360° |
| PATCH | `/api/admin/crm/customers/:id` | Update lifecycle, tags |
| GET | `/api/admin/crm/orders/:id/persons` | Service subjects |
| POST | `/api/admin/crm/leads` | Lead CRUD |
| GET | `/api/admin/crm/reports/:type` | Export reports |

Existing routes unchanged; `fulfill-payment` extended to sync `service_persons`.

---

## Security & RLS

- `service_persons`: admin all; user SELECT where `orders.user_id = auth.uid()`.
- New CRM tables: admin write; astrologer read assigned records (Phase 12).
- Invoice PDF: subjects are PII — same access rules as orders.

---

## Backward compatibility

1. Keep `metadata.formSnapshot` indefinitely (source of truth for audit).
2. Backfill `service_persons` from existing orders via migration script.
3. Old invoices unchanged; regeneration uses new template when admin triggers regen.
4. Guest checkout unchanged (`user_id` nullable).

---

## Technology choices

- **DB**: Supabase Postgres + RLS (existing).
- **Backend**: Vercel serverless handlers in `server/handlers/` + `api/lib/`.
- **Admin UI**: React + existing `AdminLayout` / `useAdminTable`.
- **Kanban (Phase 6)**: `@dnd-kit/core` or similar.
- **Reports (Phase 11)**: Server-side CSV/XLSX via `exceljs`; PDF via existing Puppeteer/pdf-lib.

---

## Success criteria

- [ ] Every paid order has 1..N `service_persons` rows matching service config.
- [ ] Invoice PDF shows Purchased By + Service Subject(s).
- [ ] Admin customer profile lists all subjects across orders.
- [ ] Name Check 2/3 collect 2/3 persons before checkout.
- [ ] CRM dashboard shows revenue and order KPIs.
