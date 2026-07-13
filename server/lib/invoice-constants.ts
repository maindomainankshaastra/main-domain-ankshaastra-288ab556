import { GST_COMPANY_DEFAULTS } from './gst-company-defaults.js';

/** Default SAC for online services / digital reports / consultation (overridden by gst_config). */
export const DEFAULT_SAC_CODE = GST_COMPANY_DEFAULTS.defaultSacCode;

export function resolveSacCode(gstConfig?: { default_sac_code?: string | null } | null): string {
  const fromConfig = String(gstConfig?.default_sac_code || '').trim();
  if (/^\d{6}$/.test(fromConfig)) return fromConfig;
  return DEFAULT_SAC_CODE;
}

export function resolveDefaultGstRate(gstConfig?: { default_gst_rate?: number | null } | null): number {
  const rate = Number(gstConfig?.default_gst_rate ?? GST_COMPANY_DEFAULTS.defaultGstRate);
  return Number.isFinite(rate) ? rate : GST_COMPANY_DEFAULTS.defaultGstRate;
}
