import { analyze, type CSectionInput, type CSectionResult } from "./engine.ts";
import { astronomyEphemeris } from "./ephemeris.ts";

export * from "./engine.ts";
export * from "./panchang.ts";
export { dateNumerology } from "./numerology.ts";
export { fmtDate, fmtRange, fmtTime } from "./time.ts";

/** Runs the engine with the real (astronomy-engine) ephemeris. */
export function analyzeCSection(input: CSectionInput): CSectionResult {
  return analyze(input, astronomyEphemeris);
}
