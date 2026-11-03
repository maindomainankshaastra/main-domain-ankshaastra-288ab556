import { nakshatraForBirth } from "./moon";
import { getSwar, type SwarEntry } from "./swarData";
import { numerologyAlternatives } from "./chaldean";

export interface SwarResult {
  entry: SwarEntry;
  longitude: number;
  nearBoundary: boolean;
  edgeDistance: number;
  alternatives: string[];
}

export function calculateSwar(dob: string, time: string, utcOffsetHours = 5.5): SwarResult {
  const n = nakshatraForBirth(dob, time, utcOffsetHours);
  const entry = getSwar(n.nakshatraNo, n.pada);
  return {
    entry,
    longitude: n.longitude,
    nearBoundary: n.nearBoundary,
    edgeDistance: n.edgeDistance,
    alternatives: numerologyAlternatives(entry.startLetter),
  };
}
