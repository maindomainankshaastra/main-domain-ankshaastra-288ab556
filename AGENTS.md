# Project architecture

- Name Correction package cards read prices and checkout destinations from the shared service catalog so page offers and checkout summaries stay aligned.
- Name Correction's celebrity-and-reviews section is a dedicated presentation component directly below its banner, keeping trust content separate from checkout offers.
- Legacy dynamic admin queries reuse the managed client through an isolated compatibility adapter; generated schema files and database access policies remain untouched.
- PDF drawing helpers accept fully resolved report inputs with complete branding; partial branding remains supported only at the generation entry point.
- Name Correction uses dedicated expert and podcast components immediately after trust content, followed by press/philosophy and catalog-backed packages, keeping ad-page presentation independent of checkout pricing.
- Name report checkout uses the minimal layout and omits cross-service add-ons; report confirmation is scoped by service identity so other checkout flows stay unchanged.
- Name report offers share presentation metadata across selector, review and confirmation, and the existing payment flow supports inline booking with a pre-payment review stage so ad visitors stay on the report page.
- Site images are bundled as regular Vite imports from src/assets, not Lovable Assets pointers, because the production domain is hosted on Vercel where the Lovable asset endpoint does not exist.