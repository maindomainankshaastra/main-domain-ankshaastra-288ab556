import { describe, expect, it } from "vitest";
import { astronomyEphemeris } from "./ephemeris.ts";
import { analyze } from "./engine.ts";

// Reference: Drik Panchang for Patna, Thursday 26 Nov 2026 (printed times, IST)
describe("Drik Panchang muhurat times (Patna, 26 Nov 2026)", () => {
  const r = analyze({ windowStart: "2026-11-26", windowEnd: "2026-11-26", location: { lat: 25.594, lon: 85.136, tz: "Asia/Kolkata", name: "Patna" } }, astronomyEphemeris);
  const day = r.days[0];
  const hm = (d: Date) => d.toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });
  const get = (list: { label: string; start: Date; end: Date }[], label: string) => list.filter((p) => p.label === label).map((p) => `${hm(p.start)}-${hm(p.end)}`);
  const near = (got: string, want: string) => {
    const t = (s: string) => s.split("-").map((x) => Number(x.slice(0, 2)) * 60 + Number(x.slice(3)));
    const [a, b] = t(got), [c, d] = t(want);
    expect(Math.abs(a - c)).toBeLessThanOrEqual(2); expect(Math.abs(b - d)).toBeLessThanOrEqual(2);
  };
  it("auspicious", () => {
    near(get(day.muhurats.auspicious, "Brahma Muhurta")[0], "04:29-05:22");
    near(get(day.muhurats.auspicious, "Pratah Sandhya")[0], "04:55-06:15");
    near(get(day.muhurats.auspicious, "Abhijit Muhurta")[0], "11:15-11:58");
    near(get(day.muhurats.auspicious, "Vijaya Muhurta")[0], "13:24-14:07");
    near(get(day.muhurats.auspicious, "Godhuli Muhurta")[0], "16:56-17:23");
    near(get(day.muhurats.auspicious, "Sayahna Sandhya")[0], "16:58-18:18");
    near(get(day.muhurats.auspicious, "Nishita Muhurta")[0], "23:10-00:04");
  });
  it("inauspicious", () => {
    near(get(day.muhurats.inauspicious, "Rahu Kalam")[0], "12:57-14:18");
    near(get(day.muhurats.inauspicious, "Yamaganda")[0], "06:15-07:35");
    near(get(day.muhurats.inauspicious, "Gulika Kalam")[0], "08:56-10:16");
    near(get(day.muhurats.inauspicious, "Varjyam")[0], "01:15-02:41");
    const dur = get(day.muhurats.inauspicious, "Dur Muhurtam");
    near(dur[0], "09:49-10:32"); near(dur[1], "14:07-14:50");
  });
});
