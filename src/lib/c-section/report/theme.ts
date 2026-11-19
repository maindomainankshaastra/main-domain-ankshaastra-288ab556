import { rgb } from "pdf-lib";

/** A4 in PDF points. */
export const PAGE_W = 595.28;
export const PAGE_H = 841.89;

/** Left / right edge of the text area and the last usable line (distances from the top). */
export const MARGIN_L = 66;
export const MARGIN_R = PAGE_W - 66;
export const CONTENT_W = MARGIN_R - MARGIN_L;
export const BOTTOM = 726;

export const C = {
  navy: rgb(0.17, 0.24, 0.34),
  navyDeep: rgb(0.12, 0.18, 0.27),
  ink: rgb(0.14, 0.18, 0.24),
  muted: rgb(0.4, 0.46, 0.54),
  accent: rgb(0.3, 0.45, 0.6),
  panel: rgb(0.82, 0.86, 0.9),
  panelLight: rgb(0.93, 0.95, 0.97),
  line: rgb(0.68, 0.74, 0.81),
  white: rgb(1, 1, 1),
  green: rgb(0.18, 0.55, 0.34),
  greenBg: rgb(0.83, 0.93, 0.87),
  amber: rgb(0.72, 0.47, 0.08),
  amberBg: rgb(0.98, 0.91, 0.74),
  red: rgb(0.7, 0.18, 0.16),
  redBg: rgb(0.97, 0.84, 0.83),
  gold: rgb(0.85, 0.65, 0.12),
};

export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/ankshaastra",
  linkedin: "https://www.linkedin.com/company/ankshaastra/",
  facebook: "https://www.facebook.com/p/Ankshaastra-61561549995939/",
  youtube: "https://www.youtube.com/@Ankshaastra",
  review: "https://share.google/RzRonHbVF8Q1lUHc4",
};

export const DEFAULT_CONTACT = { phone: "9667305577", email: "social@ankshaastra.com", site: "www.ankshaastra.com" };
