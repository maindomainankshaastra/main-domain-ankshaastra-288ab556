# Safari & Cross-Device Compatibility Audit

**Date:** June 2026  
**Site:** ankshaastra.com

---

## Executive summary

Most site pages use standard React Router + HTTPS links and work on Safari. The main customer complaint matches **Razorpay UPI checkout on iPhone Safari**, not broken internal page routes.

**Screenshot diagnosis:** *"Safari cannot open the page because the address is invalid"* during Razorpay → UPI app redirect. This occurs when Safari tries to open a custom URL scheme (`upi://`, `phonepe://`, `gpay://`) and the app is missing or the intent URL is rejected.

---

## Site-wide link audit

| Area | Status | Notes |
|------|--------|-------|
| React Router (`App.tsx`) | OK | All routes use `BrowserRouter`; Vercel SPA rewrite configured |
| Navbar internal links | OK | `Link` for internal; `https://` external for Shop |
| Services catalog | OK | Internal `Link`; external baby/C-section use full HTTPS URLs |
| Reports / Consultation | OK | `payLink()` builds encoded `/payment?...` URLs |
| Legacy redirects | OK | `/services/call-consultation` → `/consultation`, etc. |
| External subdomains | OK | empower.ankshaastra.com, miraclebaby.ankshaastra.com |
| Admin / Dashboard | OK | Protected routes; no custom schemes |

**No broken empty `href` or malformed internal paths found.**

---

## Known Safari-specific issues

### 1. Razorpay UPI on iOS Safari (HIGH — matches customer screenshot)

**Cause:** UPI intent deep links from Razorpay modal.  
**Workaround for customers:** Use **UPI ID / VPA** field, or **card/netbanking**.  
**Fixes applied:**
- Removed duplicate `checkout.js` load (`index.html` + dynamic loader)
- Normalized phone to 10 digits for Razorpay `prefill.contact`
- Added `retry`, safer `modal` options
- iOS Safari toast with guidance before checkout opens

### 2. Double Razorpay script (MEDIUM)

Loading checkout.js twice could cause modal glitches on WebKit. **Fixed:** single dynamic load from `Payment.tsx`.

### 3. ScrollToTop `behavior: "instant"` (LOW)

Not supported on older Safari. **Fixed:** uses `behavior: "auto"`.

### 4. External redirects (LOW)

`window.location.replace` can fail silently in edge cases. **Fixed:** `ExternalRedirect` shows manual Continue link fallback.

### 5. `window.open` for WhatsApp (LOW)

Works on Safari; may be blocked if called outside user gesture. Current usage is on button click — OK.

---

## Device testing checklist

Test on **real devices** (simulators miss UPI intent behavior):

| Flow | iPhone Safari | Android Chrome | Desktop Safari | Desktop Chrome |
|------|---------------|----------------|----------------|----------------|
| Home → Services → package → Pay | | | | |
| Name Correction → checkout | | | | |
| Consultation → package → Pay | | | | |
| UPI payment (intent) | Expect app handoff | OK | N/A | N/A |
| UPI ID / VPA payment | Should work | OK | N/A | N/A |
| Card payment | OK | OK | OK | OK |
| Thank-you + invoice email | | | | |
| External: Perfect Baby Name | | | | |
| Shop link (ankshaastra.in) | | | | |
| Sign in / Dashboard | | | | |

---

## Recommendations (future)

1. **Razorpay Payment Links** for iOS-heavy traffic (full-page redirect, better UPI support).
2. **Enable UPI Collect** prominently in Razorpay dashboard for iOS.
3. **Add Playwright** mobile Safari smoke tests in CI for `/`, `/services`, `/payment` load.
4. Monitor Razorpay failed payments by user-agent (iOS vs Android).

---

## Files changed for Safari compatibility

- `index.html` — remove duplicate Razorpay script; `format-detection`
- `src/lib/safari-compat.ts` — iOS detection, phone normalize, safe external URLs
- `src/pages/Payment.tsx` — Razorpay iOS guidance + contact normalize
- `src/components/ScrollToTop.tsx` — Safari-safe scroll
- `src/components/ExternalRedirect.tsx` — fallback link
