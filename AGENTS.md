# Project architecture

- Name Correction package cards read prices and checkout destinations from the shared service catalog so page offers and checkout summaries stay aligned.
- Name Correction's celebrity-and-reviews section is a dedicated presentation component directly below its banner, keeping trust content separate from checkout offers.
- Legacy dynamic admin queries reuse the managed client through an isolated compatibility adapter; generated schema files and database access policies remain untouched.
- PDF drawing helpers accept fully resolved report inputs with complete branding; partial branding remains supported only at the generation entry point.
- Name Correction's press and philosophy content lives in a dedicated presentation component after the celebrity section, keeping reference-driven content independent of checkout pricing.
- Site images are bundled as regular Vite imports from src/assets, not Lovable Assets pointers, because the production domain is hosted on Vercel where the Lovable asset endpoint does not exist.