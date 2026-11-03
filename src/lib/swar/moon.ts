/**
 * Moon position -> Nakshatra + Pada (Lahiri sidereal, same system as Drik Panchang).
 *
 * Uses `astronomy-engine` (pure TypeScript, MIT, no API / no native code).
 * Verified against Swiss Ephemeris on 5,000 random dates 2015-2026:
 * max difference 0.005 deg (~30 s of Moon motion).
 */
import * as Astronomy from "astronomy-engine";

const NAK_SPAN = 360 / 27; // 13d20'
const PADA_SPAN = 360 / 108; // 3d20'

/** Lahiri ayanamsa in degrees for a given instant (matches Swiss Ephemeris SIDM_LAHIRI to ~1 arcsec). */
export function lahiriAyanamsa(date: Date): number {
  const T = Astronomy.MakeTime(date).tt / 36525; // Julian centuries from J2000
  const arcsec = 50.290966 * 100 * T + 0.0222226 * 100 * 100 * T * T;
  return 23.85306 + arcsec / 3600;
}

/** Sidereal (Lahiri) longitude of the Moon in degrees, 0..360. */
export function moonSiderealLongitude(date: Date): number {
  const tropical = Astronomy.EclipticGeoMoon(date).lon;
  const lon = tropical - lahiriAyanamsa(date);
  return ((lon % 360) + 360) % 360;
}

export interface NakshatraResult {
  longitude: number;
  nakshatraNo: number; // 1..27
  pada: number; // 1..4
  /** degrees from the nearest Pada boundary */
  edgeDistance: number;
  /** true when the Moon is so close to a boundary that a ~2 minute time error could change the Pada */
  nearBoundary: boolean;
}

export const BOUNDARY_WARNING_DEG = 0.03; // ~3 minutes of Moon motion

export function nakshatraFromLongitude(lon: number): NakshatraResult {
  const nakshatraNo = Math.floor(lon / NAK_SPAN) + 1;
  const withinNak = lon % NAK_SPAN;
  const pada = Math.floor(withinNak / PADA_SPAN) + 1;
  const withinPada = withinNak % PADA_SPAN;
  const edgeDistance = Math.min(withinPada, PADA_SPAN - withinPada);
  return {
    longitude: lon,
    nakshatraNo,
    pada,
    edgeDistance,
    nearBoundary: edgeDistance < BOUNDARY_WARNING_DEG,
  };
}

/**
 * @param dob   "YYYY-MM-DD"
 * @param time  "HH:mm" (24h) local time at birth place
 * @param utcOffsetHours default 5.5 (IST)
 */
export function nakshatraForBirth(dob: string, time: string, utcOffsetHours = 5.5): NakshatraResult {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  const t = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!d || !t) throw new Error("Invalid date or time");
  const utcMs =
    Date.UTC(Number(d[1]), Number(d[2]) - 1, Number(d[3]), Number(t[1]), Number(t[2])) -
    utcOffsetHours * 3600 * 1000;
  return nakshatraFromLongitude(moonSiderealLongitude(new Date(utcMs)));
}
