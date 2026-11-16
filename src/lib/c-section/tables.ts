/**
 * Reference tables copied 1:1 from the client's "C-Section_Auspicious_Date_Databaseses.xlsx"
 * (sheet "Monthly Database", reference tables AB:BD). Do not edit the numbers here without
 * the client's approval - the grading in engine.ts is built on them.
 *
 * Tier: 4 = Highly Auspicious, 3 = Auspicious, 2 = Neutral, 1 = Avoided.
 */

/** Nakshatra -> tier. (Excel marks Ashwini/Revati "Highly Auspicious *" and Magha/Ashlesha/Jyeshtha/Mula "Avoided *"). */
export const NAKSHATRA_TIER: Record<string, number> = {
  "Pushya": 4,
  "Shravana": 4,
  "Rohini": 4,
  "Anuradha": 4,
  "Hasta": 4,
  "Swati": 4,
  "Punarvasu": 4,
  "Mrigashira": 4,
  "Ashwini": 4,
  "Revati": 4,
  "Uttara Ashadha": 3,
  "Uttara Bhadrapada": 3,
  "Uttara Phalguni": 3,
  "Chitra": 3,
  "Purva Ashadha": 3,
  "Purva Phalguni": 3,
  "Dhanishta": 2,
  "Shatabhisha": 2,
  "Purva Bhadrapada": 2,
  "Bharani": 2,
  "Krittika": 1,
  "Vishakha": 1,
  "Magha": 1,
  "Ardra": 1,
  "Ashlesha": 1,
  "Jyeshtha": 1,
  "Mula": 1,
};

/** Tithi name -> tier + tithi number inside its paksha (1..15). */
export const TITHI_TIER: Record<string, { tier: number; no: number }> = {
  Panchami: { tier: 4, no: 5 },
  Dashami: { tier: 4, no: 10 },
  Purnima: { tier: 4, no: 15 },
  Dwitiya: { tier: 3, no: 2 },
  Saptami: { tier: 3, no: 7 },
  Dwadashi: { tier: 3, no: 12 },
  Pratipada: { tier: 2, no: 1 },
  Shashthi: { tier: 2, no: 6 },
  Ekadashi: { tier: 2, no: 11 },
  Tritiya: { tier: 2, no: 3 },
  Ashtami: { tier: 2, no: 8 },
  Trayodashi: { tier: 2, no: 13 },
  Chaturthi: { tier: 1, no: 4 },
  Navami: { tier: 1, no: 9 },
  Chaturdashi: { tier: 1, no: 14 },
  Amavasya: { tier: 1, no: 15 },
};

/** Moon sign (rashi) -> tier. */
export const MOON_SIGN_TIER: Record<string, number> = {
  Taurus: 4,
  Cancer: 4,
  Pisces: 3,
  Sagittarius: 3,
  Libra: 3,
  Gemini: 3,
  Leo: 3,
  Capricorn: 2,
  Aquarius: 2,
  Virgo: 2,
  Aries: 2,
  Scorpio: 1,
};

/** Dagdha tithi (number inside paksha) that is avoided on each weekday. */
export const DAGDHA_TITHI_NO: Record<string, number> = { Sunday: 12, Monday: 11, Tuesday: 5, Wednesday: 3, Thursday: 6, Friday: 8, Saturday: 9 };

/** Numerology luck % grid: row = Mulank 1..9, column = Bhagyank 1..9. */
export const LUCK_GRID: number[][] = [
  [100, 80, 70, 70, 80, 75, 60, 0, 100],
  [90, 40, 50, 20, 60, 45, 45, 0, 20],
  [70, 45, 60, 40, 60, 0, 80, 40, 80],
  [70, 40, 50, 30, 60, 60, 80, 20, 20],
  [80, 70, 60, 40, 80, 90, 60, 60, 60],
  [70, 40, 0, 60, 90, 90, 70, 60, 60],
  [60, 40, 60, 60, 60, 80, 20, 20, 80],
  [0, 0, 40, 20, 60, 60, 40, 20, 20],
  [80, 20, 50, 30, 60, 40, 20, 40, 20],
];
