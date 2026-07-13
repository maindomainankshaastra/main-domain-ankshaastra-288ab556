# SERVICE AUDIT, CLEANUP & ADMIN PANEL FIX REQUIREMENT

## Objective

Perform a complete audit and cleanup of the Services Module, Service Pages, Packages, Forms, Pricing Structure, Checkout Flow, and Admin Panel.

The system must only contain the services, packages, pricing, add-ons, and forms listed below.

Any old, duplicate, hidden, deprecated, test, draft, inactive, or incorrect services/packages must be removed completely from both:

* Frontend Website
* Admin Database
* Service Listings
* Search Results
* Checkout Pages
* API Responses
* Internal References

---

# PHASE 1: SERVICE AUDIT

Perform a complete audit of all existing services.

Create a report containing:

### Existing Services Found

* Service Name
* URL
* Status
* Package Count
* Form Attached
* Active / Inactive

### Required Action

For each service mark:

* KEEP
* UPDATE
* REMOVE
* MERGE

Any service not listed in this document must be removed.

---

# PHASE 2: REQUIRED SERVICE STRUCTURE

## A. 1:1 CALL CONSULTATION

Type: Dedicated Service Page

Packages:

* Audio Consultation 45 Minutes – ₹3,977

* Audio Consultation 60 Minutes – ₹4,967

* Audio Consultation 75 Minutes – ₹5,957

* Video Consultation 45 Minutes – ₹5,957

* Video Consultation 60 Minutes – ₹7,397

* Video Consultation 75 Minutes – ₹8,927

Add-On:

* Personalised Premium Kundli 2.0 – ₹299

---

## B. VARSHPHAL REPORT

Type: Dedicated Service Page

Package:

* Varshphal Report – ₹699

Add-On:

* Personalised Premium Kundli 2.0 – ₹299

---

## C. PYAAR SHAASTRA REPORT

Type: Dedicated Service Page

Packages:

* Pyaar Shaastra Report – ₹299
* Pyaar Shaastra Report Original – ₹699

---

## D. PREMIUM PERSONALISED KUNDLI 2.0

Type: Dedicated Service Page

Packages:

* Single Person – ₹299

* Single Person Original – ₹699

* Double Person – ₹497

* Double Person Original – ₹1,200

* Triple Person – ₹597

* Triple Person Original – ₹1,800

---

## E. NAME CORRECTION

Type: Dedicated Service Page

Packages:

* Name Correction – ₹2,447

* Name Correction Original – ₹7,500

* Name Correction + Complete Blueprint – ₹7,397

* Name Correction + Complete Blueprint Original – ₹10,076

* Name Check – ₹293

* Name Check 2 – ₹528

* Name Check 2 Original – ₹586

* Name Check 3 – ₹747

* Name Check 3 Original – ₹879

Add-Ons:

* Personalised Premium Kundli 2.0 – ₹299
* Lucky Color & Number – ₹497
* Missing Number & Repeating Number Remedy – ₹917

---

## F. PERFECT BABY NAME

Type: Re-route to Empower

Packages:

* Perfect Baby Name – ₹2,447

* Perfect Baby Name Original – ₹7,500

* Complete Baby Name Blueprint – ₹4,967

* Complete Baby Name Blueprint Original – ₹15,051

* Name Check – ₹293

* Name Check 2 – ₹528

* Name Check 2 Original – ₹586

* Name Check 3 – ₹747

* Name Check 3 Original – ₹879

Add-Ons:

* Nick Name – ₹497
* 10+ Extra Names – ₹497
* Kundli 2.0 – ₹299

---

## G. C-SECTION DATES

Type: Re-route to MiracleBaby

Packages:

* Essential – ₹1,097
* Complete – ₹3,167
* Premium – ₹5,507

---

# LUCKY NUMEROLOGY

Display as Quick Summary + Direct Form

## H. Lucky Vehicle Number – ₹1,097

## I. Lucky Vehicle Color – ₹497

## J. Lucky Vehicle Purchase Date – ₹1,097

## K. Lucky Mobile Number – ₹1,097

## L. Lucky Flat Number – ₹1,097

Global Add-Ons:

* Missing Number & Repeating Number Remedy – ₹917
* Lucky Color & Number – ₹497

---

## M. RELATIONSHIP ANALYSIS

Package:

* Relationship Analysis – ₹917

---

# BUSINESS & BRAND NUMEROLOGY

Display as Quick Summary + Direct Form

## N. Business Name Correction – ₹4,967

Additional Services:

* Business Mobile Number – ₹1,457
* Business Tagline Analysis – ₹1,457
* Company Registration Date – ₹1,997
* Company Bank Account Opening Date – ₹1,997
* Land Purchase Date – ₹1,997
* Plot Number Analysis – ₹1,457
* Exhibition Stall Number – ₹917
* Commercial Space Analysis – ₹2,447

---

## O. BUSINESS PARTNER COMPATIBILITY

Package:

* Business Partner Compatibility – ₹1,997

---

# OFFICE VASTU

Display as Quick Summary + Direct Form

## P. Office Vastu

Packages:

* All Departmental Sitting – ₹4,987
* CEO/MD Cabin Direction & Seating – ₹2,447
* KMP/Manager Seating Direction – ₹1,997
* Cash Counter Billing Direction – ₹1,997
* Office Interior Color Consultation – ₹1,997
* Office Vastu Remote – ₹3,977
* Office Vastu Onsite – ₹9,987

---

# PHASE 3: FORM VALIDATION

Ensure every service loads the correct form.

Requirements:

* Required field validation
* Email validation
* WhatsApp validation
* DOB validation
* PIN code validation
* Auto-fetch city/state/place from PIN code
* Time selector
* Conditional fields
* Dynamic package-based fields

Examples:

### Kundli 2.0

If user selects:

Single → 1 Person Form

Double → 2 Person Form

Triple → 3 Person Form

### Name Correction

Show additional relationship and parent/spouse fields.

### Business Services

Show service-specific fields dynamically.

---

# PHASE 4: ADMIN PANEL FIXES

Critical Issue:

Currently when services are deleted from Admin Panel:

* They disappear temporarily
* But continue appearing on website
* Continue appearing in service listings
* Continue appearing in API responses

This indicates Soft Delete or Cache Issues.

Investigate and fix.

Required:

### Delete Service

When Admin deletes a service:

* Remove from database
* Remove from frontend
* Remove from API
* Remove from search
* Remove from sitemap
* Remove from menus

### Verify

Deleted service must not reappear after:

* Refresh
* Rebuild
* Deployment
* Cache clear
* Server restart

---

# PHASE 5: DATABASE CLEANUP

Remove:

* Duplicate services
* Duplicate packages
* Orphan records
* Broken URLs
* Unused forms
* Inactive service references
* Test services
* Hidden services

Create migration if required.

---

# PHASE 6: QUALITY ASSURANCE

Verify:

✓ Service page loads correctly

✓ Correct pricing

✓ Correct original pricing

✓ Correct add-ons

✓ Correct forms

✓ Correct checkout flow

✓ Correct email notifications

✓ Correct admin management

✓ Delete functionality works

✓ No duplicate services exist

✓ No hidden services exist

✓ No orphan database records exist

Provide a final audit report before deployment showing:

1. Services Kept
2. Services Updated
3. Services Removed
4. Database Records Removed
5. Admin Panel Issues Fixed
6. Final Service Count
