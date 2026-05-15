/**
 * Centralized business / contact configuration.
 *
 * All values come from Vite env vars (VITE_ prefix) so they can be updated in
 * the Vercel dashboard without code changes. Safe defaults are provided.
 */

const str = (value: string | undefined, fallback: string): string =>
  value && value.trim() !== "" ? value : fallback;

const env = import.meta.env;

export const business = {
  // Primary support phone (E.164 without "+", e.g. 919667305577)
  supportPhone: str(env.VITE_SUPPORT_PHONE, "919667305577"),
  // Primary WhatsApp number (can differ from support phone)
  whatsappNumber: str(env.VITE_WHATSAPP_NUMBER, "919667305577"),
  // Secondary WhatsApp used by some lead-capture pages
  leadWhatsappNumber: str(env.VITE_LEAD_WHATSAPP_NUMBER, "919667305557"),
  supportEmail: str(env.VITE_SUPPORT_EMAIL, "social@ankshaastra.com"),
  contactEmail: str(env.VITE_CONTACT_EMAIL, "contact@ankshaastra.com"),
  // Razorpay public key (frontend checkout)
  razorpayKeyId: str(env.VITE_RAZORPAY_KEY_ID, ""),
  // Optional API base URL
  apiBaseUrl: str(env.VITE_API_BASE_URL, ""),
  businessAddress: str(env.VITE_BUSINESS_ADDRESS, "India"),
} as const;

/** Build a tel: href from the configured support phone. */
export const telHref = (phone: string = business.supportPhone): string =>
  `tel:+${phone.replace(/[^0-9]/g, "")}`;

/** Build a wa.me link with optional pre-filled message. */
export const whatsappHref = (
  message?: string,
  phone: string = business.whatsappNumber,
): string => {
  const base = `https://wa.me/${phone.replace(/[^0-9]/g, "")}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};

export type Business = typeof business;