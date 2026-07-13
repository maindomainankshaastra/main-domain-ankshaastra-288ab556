# Empower.ankshaastra.com — Hub Integration Guide

> **Master plan (phases, storage, database, capacity):** see [EMPOWER_CENTRAL_HUB_PLAN.md](./EMPOWER_CENTRAL_HUB_PLAN.md)

This document explains how to connect **empower.ankshaastra.com** to the central **ankshaastra.com** operations hub (orders, invoices, GST/GSTR-1).

## Architecture

```
empower.ankshaastra.com          ankshaastra.com (hub)
┌─────────────────────┐          ┌──────────────────────────┐
│ Checkout UI         │  CORS    │ /api/create-order        │
│ Razorpay modal      │ ───────► │ /api/verify-payment      │
│ Pincode → state     │          │ /api/services            │
└─────────────────────┘          │ Invoice + email engine   │
         │                         │ GSTR-1 admin             │
         │ server-only (optional)  └───────────┬──────────────┘
         └──────────────────────────────────►│ Shared Supabase │
              POST /api/operations/order-ingest
              Header: x-api-key
```

**One GST entity:** ANKSHAASTRA OCCULT EXPERTS LLP (`09AAFFE7583B1ZD`). All Empower invoices file in the same GSTR-1 as the main site.

---

## Hub setup (main domain — already done)

| Feature | Location |
|---------|----------|
| CORS for Empower origin | `server/lib/cors.ts` |
| Connected sites registry | `server/lib/connected-sites.ts` |
| Integration manifest API | `GET /api/operations/site-manifest?site=empower` |
| Order ingest API | `POST /api/operations/order-ingest` |
| Admin site filters | Orders & Invoices modules |

### Hub Vercel environment variables

Add on **ankshaastra.com** Vercel project:

| Variable | Example | Purpose |
|----------|---------|---------|
| `OPERATIONS_API_KEYS` | `empower_prod_key_xxxxx` | Auth for server-side order ingest from Empower |
| `PARTNER_SITE_ORIGINS` | `https://empower.ankshaastra.com` | CORS (defaults include Empower; override if needed) |
| `SITE_URL` | `https://ankshaastra.com` | Hub URL in integration manifest |

Generate a strong API key:

```bash
openssl rand -hex 32
```

Store the same key on Empower (server-only) as `HUB_OPERATIONS_API_KEY`.

---

## Empower site environment variables

Add on **empower.ankshaastra.com** Vercel/hosting:

### Required (browser)

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | Same as main site |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Same as main site |
| `VITE_RAZORPAY_KEY_ID` | Shared Razorpay key (or Empower-specific) |
| `VITE_HUB_API_BASE` | `https://ankshaastra.com/api` |
| `VITE_SOURCE_WEBSITE` | `empower.ankshaastra.com` |

### Required (server / API routes on Empower — if using ingest)

| Variable | Value |
|----------|-------|
| `HUB_API_BASE` | `https://ankshaastra.com/api` |
| `HUB_OPERATIONS_API_KEY` | Same as `OPERATIONS_API_KEYS` on hub |

---

## Integration Option A — Browser checkout via hub API (recommended)

Empower checkout calls the hub directly. CORS is enabled for Empower.

### 1. Fetch integration manifest

```http
GET https://ankshaastra.com/api/operations/site-manifest?site=empower
```

### 2. Load services catalog

```http
GET https://ankshaastra.com/api/services?source=empower
```

### 3. Create Razorpay order

```http
POST https://ankshaastra.com/api/create-order
Content-Type: application/json

{
  "amount": 2999,
  "serviceTitle": "Perfect Baby Name Package",
  "sourceWebsite": "empower.ankshaastra.com",
  "orderType": "service",
  "customerName": "Parent Name",
  "customerEmail": "parent@example.com",
  "customerPhone": "+919876543210",
  "metadata": {
    "formSnapshot": {
      "fullName": "Parent Name",
      "email": "parent@example.com",
      "whatsapp": "+919876543210",
      "pincode": "110001",
      "customerState": "Delhi",
      "customerStateCode": "07"
    }
  }
}
```

### 4. Open Razorpay checkout

Use `VITE_RAZORPAY_KEY_ID` and the `id` from step 3.

### 5. Verify payment

```http
POST https://ankshaastra.com/api/verify-payment
Content-Type: application/json

{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature",
  "dbOrderId": "uuid-from-create-order",
  "amount": 2999,
  "service": "Perfect Baby Name Package",
  "sourceWebsite": "empower.ankshaastra.com",
  "formData": {
    "fullName": "Parent Name",
    "email": "parent@example.com",
    "whatsapp": "+919876543210",
    "pincode": "110001",
    "customerState": "Delhi",
    "customerStateCode": "07",
    "sourceWebsite": "empower.ankshaastra.com"
  }
}
```

---

## Integration Option B — Server-side order ingest

Call from Empower **server only** (never expose API key in browser).

```http
POST https://ankshaastra.com/api/operations/order-ingest
Content-Type: application/json
x-api-key: YOUR_OPERATIONS_API_KEY

{
  "sourceWebsite": "empower.ankshaastra.com",
  "serviceTitle": "Perfect Baby Name Package",
  "totalAmount": 2999,
  "paymentStatus": "paid",
  "paymentId": "pay_xxxxxxxx",
  "autoInvoice": true,
  "customer": {
    "name": "Parent Name",
    "email": "parent@example.com",
    "phone": "+919876543210"
  },
  "metadata": {
    "formSnapshot": {
      "pincode": "110001",
      "customerState": "Delhi",
      "customerStateCode": "07"
    }
  }
}
```

---

## Empower client helper (copy to Empower repo)

Create `src/lib/hub-api.ts`:

```typescript
const HUB_API = import.meta.env.VITE_HUB_API_BASE || "https://ankshaastra.com/api";
const SOURCE = import.meta.env.VITE_SOURCE_WEBSITE || "empower.ankshaastra.com";

export async function hubCreateOrder(payload: {
  amount: number;
  serviceTitle: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  formSnapshot: Record<string, unknown>;
}) {
  const res = await fetch(`${HUB_API}/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: payload.amount,
      serviceTitle: payload.serviceTitle,
      sourceWebsite: SOURCE,
      orderType: "service",
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      customerPhone: payload.customerPhone,
      metadata: { formSnapshot: { ...payload.formSnapshot, sourceWebsite: SOURCE } },
    }),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Create order failed");
  return res.json();
}

export async function hubVerifyPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  dbOrderId: string;
  amount: number;
  service: string;
  formData: Record<string, unknown>;
}) {
  const res = await fetch(`${HUB_API}/verify-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, sourceWebsite: SOURCE }),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Payment verification failed");
  return res.json();
}
```

---

## Admin panel (hub)

| Module | Filter |
|--------|--------|
| Orders & Bookings | `empower.ankshaastra.com` |
| Invoice Manager | `empower.ankshaastra.com` |
| GSTR Reports | All sites (one GSTIN) |

---

## API reference

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/operations/site-manifest?site=empower` | None |
| GET | `/api/services?source=empower` | None |
| POST | `/api/create-order` | CORS |
| POST | `/api/verify-payment` | CORS |
| POST | `/api/operations/order-ingest` | `x-api-key` |

See also: `docs/vercel-environment-variables.md`
