/**
 * astronomy-engine plug-in for the Panchang engine. Pure TypeScript, no API calls, works offline.
 * Sun/Moon use the same Lahiri ayanamsa as src/lib/swar/moon.ts (checked against Swiss Ephemeris there).
 */
import * as Astronomy from "astronomy-engine";
import { lahiriAyanamsa } from "../swar/moon.ts";
import type { Ephemeris, Location } from "./panchang.ts";

const norm = (x: number) => ((x % 360) + 360) % 360;
const RAD = Math.PI / 180;

export const astronomyEphemeris: Ephemeris = {
  sunSidereal: (t) => norm(Astronomy.SunPosition(t).elon - lahiriAyanamsa(t)),
  moonSidereal: (t) => norm(Astronomy.EclipticGeoMoon(t).lon - lahiriAyanamsa(t)),

  ascendantSidereal(t, loc: Location) {
    const gast = Astronomy.SiderealTime(t); // hours, Greenwich apparent sidereal time
    const ramc = norm(gast * 15 + loc.lon) * RAD;
    const T = Astronomy.MakeTime(t).tt / 36525;
    const eps = (23.439291 - 0.0130042 * T) * RAD;
    const asc = Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(loc.lat * RAD) * Math.sin(eps)));
    return norm(asc / RAD - lahiriAyanamsa(t));
  },

  sunrise(from, loc) {
    const r = Astronomy.SearchRiseSet(Astronomy.Body.Sun, new Astronomy.Observer(loc.lat, loc.lon, 0), +1, from, 1);
    return r ? r.date : null;
  },
  sunset(from, loc) {
    const r = Astronomy.SearchRiseSet(Astronomy.Body.Sun, new Astronomy.Observer(loc.lat, loc.lon, 0), -1, from, 1);
    return r ? r.date : null;
  },
};
