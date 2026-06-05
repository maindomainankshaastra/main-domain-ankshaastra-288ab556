# Service Routing & Forms Audit

**Status:** Routing corrected. Form field updates pending client form specifications.

---

## Page types

| Type | Behavior | Examples |
|------|----------|----------|
| **Packaged** | Custom page with multiple package cards → `/payment?service=&amount=&formType=` | Call Consultation, Name Correction, Office Vastu, Business Numerology |
| **Report** | Report layout (`minimal`) with package tiers | Kundli 2.0, Varshphal, Pyaar Shaastra |
| **Quick** | Single-service summary page → direct checkout | Lucky H–L, Relationship Analysis, individual business URLs |
| **Redirect** | Legacy URL → new URL | `/services/lucky-numerology` → `/services/lucky-vehicle-number` |

---

## Packaged service pages (multi-package)

### 1:1 Call Consultation
- **URL:** `/services/call-consultation`
- **Page:** `CallConsultation.tsx` → `ServiceHubPage`

| Package | Price | Payment service title | formType |
|---------|-------|----------------------|----------|
| Audio 45 min | ₹3,977 | 1:1 Call Consultation Audio 45 | `consultation` |
| Audio 60 min | ₹4,967 | 1:1 Call Consultation Audio 60 | `consultation` |
| Audio 75 min | ₹5,957 | 1:1 Call Consultation Audio 75 | `consultation` |
| Video 45 min | ₹5,957 | 1:1 Call Consultation Video 45 | `consultation` |
| Video 60 min | ₹7,397 | 1:1 Call Consultation Video 60 | `consultation` |
| Video 75 min | ₹8,927 | 1:1 Call Consultation Video 75 | `consultation` |

**Checkout add-ons:** Personalised Premium Kundli 2.0 (₹299)

---

### Name Correction
- **URL:** `/services/name-correction`
- **Page:** `NameCorrection.tsx` (custom UI)

| Package | Price | Payment service title | formType | Notes |
|---------|-------|----------------------|----------|-------|
| Name Check | ₹293 | Name Check | `name-check` | |
| Name Check 2 | ₹528 | Name Check 2 | `name-check` | |
| Name Check 3 | ₹747 | Name Check 3 | `name-check` | |
| Name Correction | ₹2,447 | Name Correction | `name-correction` | |
| Name Correction + Blueprint | ₹7,397 | Name Correction + Complete Blueprint | `name-correction` | ⚠️ Review: may need `name-correction-couple` (2-person) |

**Checkout add-ons:** Kundli 2.0, Lucky Color & Number, Missing Number Remedy

---

### Office Vastu
- **URL:** `/services/office-vastu`
- **Page:** `OfficeVastu.tsx`

| Package | Price | formType |
|---------|-------|----------|
| All Departmental Sitting | ₹4,987 | `office-vastu` |
| CEO/MD Cabin | ₹2,447 | `office-vastu` |
| KMP/Manager Seating | ₹1,997 | `office-vastu` |
| Cash Counter | ₹1,997 | `office-vastu` |
| Interior Colors | ₹1,997 | `office-vastu` |
| Office Vastu Remote | ₹3,977 | `office-vastu` |
| Office Vastu Onsite | ₹9,987 | `office-vastu` |

---

### Business & Brand Numerology (hub)
- **URL:** `/services/business-numerology` ✅ **restored**
- **Page:** `BusinessNumerology.tsx` → `ServiceHubPage`

| Package | Price | formType |
|---------|-------|----------|
| Business Name Correction | ₹4,967 | `business-brand` |
| Business Mobile Number | ₹1,457 | `business-brand` |
| Business Tagline Analysis | ₹1,457 | `business-brand` |
| Company Registration Date | ₹1,997 | `business-dates` |
| Company Bank Account Opening Date | ₹1,997 | `business-dates` |
| Land Purchase Date | ₹1,997 | `business-dates` |
| Plot Number Analysis | ₹1,457 | `business-property` |
| Exhibition Stall Number | ₹917 | `business-property` |
| Commercial Space Analysis | ₹2,447 | `business-property` |

**Also:** Business Partner Compatibility (₹1,997) — standalone only at `/services/business-partner-compatibility` → `business-partner`

---

## Report pages

### Premium Personalised Kundli 2.0
- **URL:** `/reports/personalized-kundali`

| Package | Price | formType |
|---------|-------|----------|
| Single Person | ₹299 | `kundali` (1 person) |
| Double Person | ₹497 | `kundali-multi` (2 people) |
| Triple Person | ₹597 | `kundali-multi` (3 people) |

---

### Varshphal Report
- **URL:** `/reports/varshphal-report` (redirect from `/services/varshphal-report`)

| Package | Price | formType |
|---------|-------|----------|
| Varshphal Report 2026 | ₹699 | `kundali` |

---

### Pyaar Shaastra Report
- **URL:** `/reports/pyaar-shastra`

| Package | Price | formType |
|---------|-------|----------|
| Pyaar Shaastra Report | ₹299 | `pyaar-shastra` |
| Pyaar Shaastra Report Original | ₹699 | `pyaar-shastra` |

**Checkout add-on:** Personalized Kundali (₹299)

---

## Quick standalone pages (H–M + business singles)

Each has URL `/services/{slug}` → `QuickServiceDetailPage` → checkout.

| Service | URL | Price | formType |
|---------|-----|-------|----------|
| Lucky Vehicle Number | `/services/lucky-vehicle-number` | ₹1,097 | `lucky-vehicle` |
| Lucky Vehicle Color | `/services/lucky-vehicle-color` | ₹497 | `lucky-vehicle-color` |
| Lucky Vehicle Purchase Date | `/services/lucky-vehicle-purchase-date` | ₹1,097 | `lucky-vehicle-date` |
| Lucky Mobile Number | `/services/lucky-mobile-number` | ₹1,097 | `lucky-mobile` |
| Lucky Flat Number | `/services/lucky-flat-number` | ₹1,097 | `lucky-flat` |
| Relationship Analysis | `/services/relationship-analysis` | ₹917 | `relationship-analysis` |

Individual business URLs mirror hub packages (same formTypes) — useful for SEO/nav; hub remains at `/services/business-numerology`.

---

## Form types implemented in Payment.tsx

| formType | Key fields |
|----------|------------|
| `consultation` | Name parts, DOB, TOB, POB, pincode, gender, issues |
| `kundali` | Full name, DOB, TOB, POB, pincode, gender, language |
| `kundali-multi` | person1/2(/3) with DOB, TOB, POB, pincode |
| `name-correction` | Name parts, relations, parent/spouse names, profession, reason |
| `name-check` | Name parts, DOB, POB, pincode |
| `name-correction-couple` | 2 persons + shared contact |
| `pyaar-shastra` | 2 persons (male/female defaults), language |
| `lucky-vehicle` | Vehicle type, usage, RTO, state code, etc. |
| `lucky-vehicle-color` | Color preferences |
| `lucky-vehicle-date` | Purchase window |
| `lucky-mobile` | City, state, mobile prefs, purpose |
| `lucky-flat` | Property purpose, floor, facing |
| `relationship-analysis` | 2 persons + reason |
| `business-brand` | Business name, tagline, mobile, etc. |
| `business-dates` | Date-related business fields |
| `business-property` | Property/stall/plot fields |
| `business-partner` | 2 partners compatibility |
| `office-vastu` | Office layout / vastu fields |

**Shared:** Email validation, WhatsApp validation, DOB picker, pincode → city/state/place auto-fetch (India Post API).

---

## Pending: client form specifications

Please share form requirements per package in this format:

```
Service: [name]
Package: [name]
formType: [current or new]
Required fields: [...]
Optional fields: [...]
Conditional fields: [...]
Add-ons at checkout: [...]
```

We will update `Payment.tsx`, `payment-form-ext.ts`, and `ExtendedPaymentFields.tsx` to match.

---

## Routing fixes applied this session

1. Restored `/services/business-numerology` multi-package hub (was incorrectly redirecting to a single business page).
2. Added `src/data/serviceRoutes.ts` as the canonical route registry.
3. `ServiceSlugPage` respects reserved packaged slugs and quick-service slugs.
4. Fixed `relationship-analysis` form inference (was falling back to `couple`).
