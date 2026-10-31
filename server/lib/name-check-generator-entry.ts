/**
 * Entry file for the SERVER bundle of the Name Check PDF generator.
 *
 * The browser generator (src/components/NameCheckReportGenerator.tsx) uses the
 * "@/" alias and extension-less imports, which Node ESM on Vercel can't run
 * directly. We therefore bundle it once into
 *   server/lib/generated/name-check-generator.js
 * and the server imports that file. Re-run `npm run build:name-check-server`
 * whenever the generator or anything in src/lib/name-check changes.
 */
export {
  generateNameCheckReportPdf,
  computeNameCheckReportContent,
} from "../../src/components/NameCheckReportGenerator";
export type {
  NameCheckReportInput,
  NameCheckReportContent,
  PricingVariant,
} from "../../src/components/NameCheckReportGenerator";
