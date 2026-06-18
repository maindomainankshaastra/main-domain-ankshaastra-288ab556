/** Default SAC for numerology / astrology / online consultation services (overridden by gst_config). */
export const DEFAULT_SAC_CODE = '998314';

export function resolveSacCode(gstConfig?: { default_sac_code?: string | null } | null): string {
  const fromConfig = String(gstConfig?.default_sac_code || '').trim();
  if (/^\d{6}$/.test(fromConfig)) return fromConfig;
  return DEFAULT_SAC_CODE;
}
