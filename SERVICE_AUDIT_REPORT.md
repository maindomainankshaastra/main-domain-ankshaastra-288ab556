# Service Audit Report

**Date:** 4 June 2026  
**Source:** `Service_Update_Doc.md`

---

## Phase 1: Existing Services Audit

| Service | URL | Action | Notes |
|---------|-----|--------|-------|
| 1:1 Call Consultation | `/services/call-consultation` | **KEEP** | 6 audio/video packages aligned |
| Varshphal Report 2026 | `/services/varshphal-report` | **KEEP** | ₹699 |
| Pyaar Shaastra Report | `/reports/pyaar-shastra` | **UPDATE** | Added Original tier ₹699 |
| Premium Personalised Kundli 2.0 | `/reports/personalized-kundali` | **UPDATE** | Double ₹497, Triple ₹597 |
| Name Correction | `/services/name-correction` | **KEEP** | Fixed name-check pricing |
| Perfect Baby Name | empower.ankshaastra.com | **KEEP** | External re-route |
| C-Section Baby Dates | miraclebaby.ankshaastra.com | **KEEP** | External re-route |
| Lucky Numerology | `/services/lucky-numerology` | **KEEP** | 5 quick-summary services |
| Relationship Analysis | `/payment?...` | **KEEP** | ₹917 direct form |
| Business & Brand Numerology | `/services/business-numerology` | **UPDATE** | Partner compat moved out |
| Business Partner Compatibility | `/payment?...` | **UPDATE** | Now standalone (was in business hub) |
| Office Vastu | `/services/office-vastu` | **KEEP** | 7 packages |
| Mobile Numerology | `/services/mobile-numerology` | **REMOVE** | Redirects to Lucky Numerology |
| Name Correction Blueprint (standalone) | `/reports/name-correction-blueprint` | **REMOVE** | Merged into Name Correction packages |
| Marriage Compatibility (Reports page) | payment link | **REMOVE** | Not in approved catalog |
| Director Name Compatibility | modal only | **REMOVE** | Not in approved catalog |

---

## Phase 2: Required Structure — Status

| Section | Packages | Status |
|---------|----------|--------|
| A. 1:1 Call Consultation | 6 + Kundli add-on ₹299 | ✓ |
| B. Varshphal Report | ₹699 + Kundli add-on | ✓ |
| C. Pyaar Shaastra | ₹299 / ₹699 | ✓ |
| D. Kundli 2.0 | Single/Double/Triple + originals | ✓ |
| E. Name Correction | 5 packages + 3 add-ons | ✓ |
| F. Perfect Baby Name | External (Empower) | ✓ |
| G. C-Section Dates | External (MiracleBaby) | ✓ |
| H–L. Lucky Numerology | 5 services + global add-ons | ✓ |
| M. Relationship Analysis | ₹917 | ✓ |
| N. Business & Brand | 9 sub-services | ✓ |
| O. Business Partner | ₹1,997 | ✓ |
| P. Office Vastu | 7 packages | ✓ |

---

## Phase 4: Admin Panel Fix

**Root cause:** `/services` merged a hardcoded `existingServicePages` list after API data, so deleted DB rows still appeared on the website.

**Fix applied:**
- Services page now loads **only** from `/api/services` and `/api/service-pages` (no static fallback merge).
- `existingServicePages` trimmed to the approved catalog (used for admin seed hints only).
- Migration deactivates non-catalog `services` rows and archives deprecated CMS pages.

---

## Phase 5: Database Cleanup

Migration: `supabase/migrations/20260604120000_service_catalog_audit.sql`

- Deactivates services outside the approved title list
- Updates Kundli Double/Triple prices
- Seeds Pyaar Original + Business Partner if missing
- Archives `name-correction-blueprint` CMS page
- Updates CMS package prices where applicable

---

## Summary

| Metric | Count |
|--------|-------|
| Services kept | 12 hub/report pages + external re-routes |
| Services updated | 5 |
| Services removed | 4 (Mobile Numerology, Blueprint page, Marriage Compatibility, Director compat) |
| Final approved catalog entries | 40+ package SKUs in `services` table |
| Admin ghost-listing fix | Yes |

---

## Deployment Checklist

1. Run migration: `supabase db push` or apply `20260604120000_service_catalog_audit.sql`
2. Deploy frontend build
3. Verify `/services` shows only API/CMS data after deleting a test service in admin
4. Confirm `/services/mobile-numerology` redirects to Lucky Numerology
5. Smoke-test checkout for Kundli Double (₹497) and Pyaar Original (₹699)
