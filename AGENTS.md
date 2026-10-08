# Project architecture

- Name Correction package cards read prices and checkout destinations from the shared service catalog so page offers and checkout summaries stay aligned.
- Name Correction's celebrity-and-reviews section is a dedicated presentation component directly below its banner, keeping trust content separate from checkout offers.
- Legacy dynamic admin queries reuse the managed client through an isolated compatibility adapter; generated schema files and database access policies remain untouched.