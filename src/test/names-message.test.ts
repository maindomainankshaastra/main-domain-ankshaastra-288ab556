import { describe, it, expect } from "vitest";
import { buildNamesMessage, tidyMeaning, whatsappAppLink, whatsappChatLink, whatsappLink } from "@/lib/swar/swarMessage";

describe("buildNamesMessage", () => {
  it("numbers every name in the numerologist's layout", () => {
    const msg = buildNamesMessage([
      { name: "Tanisha", meaning: "Queen, ruler, noble and gracious" },
      { name: "Tvisha", meaning: "Radiance, brilliance, divine glow" },
      { name: "Tarika", meaning: "Star, bright and shining" },
    ]);
    expect(msg).toBe([
      "Namaskar,",
      "",
      "Please find numerologically curated names specifically designed for your child:",
      "",
      "1. *Tanisha* — Queen, ruler, noble and gracious",
      "2. *Tvisha* — Radiance, brilliance and divine glow",
      "3. *Tarika* — Star, bright and shining",
      "",
      "Please share 4–5 names in priority list, basis which I will share the detailed analysis of these names.",
      "",
      "Regards,",
      "Ankshaastra-Empower Your Name",
    ].join("\n"));
  });
  it("only adds 'and' to meanings with three or more parts and no 'and'", () => {
    expect(tidyMeaning("Devotion, penance, dedicated focus")).toBe("Devotion, penance and dedicated focus");
    expect(tidyMeaning("Lion, brave and noble")).toBe("Lion, brave and noble");
    expect(tidyMeaning("Mother of Mahavira, royal")).toBe("Mother of Mahavira, royal");
  });
});

describe("whatsappChatLink", () => {
  it("never carries an empty text= parameter", () => {
    expect(whatsappChatLink("9830015879", "app")).toBe("whatsapp://send?phone=919830015879");
    expect(whatsappChatLink("", "app")).toBe("whatsapp://");
    expect(whatsappChatLink("9830015879", "web")).not.toContain("text=");
  });
});

describe("link length", () => {
  const meaning = "Devotion, penance, dedicated focus";
  const make = (n: number) => buildNamesMessage(Array.from({ length: n }, (_, i) => ({ name: `Name${i + 1}`, meaning })));
  it("uses + for spaces and plain commas in web links, %20 in app links by default", () => {
    expect(whatsappLink("9830015879", "a, b: c")).toContain("text=a,+b:+c");
    expect(whatsappAppLink("9830015879", "a, b: c")).toContain("text=a,%20b:%20c");
    expect(whatsappAppLink("9830015879", "a, b: c", true)).toContain("text=a,+b:+c");
  });
  it("12 names fit the desktop app link (Windows drops links over ~2000 characters), 32 fit the web link", () => {
    expect(whatsappAppLink("9830015879", make(12)).length).toBeLessThan(2000);
    expect(whatsappLink("9830015879", make(32)).length).toBeLessThan(4000);
  });
  it("the compact app link is clearly shorter, which is what lets 24 names through", () => {
    const m = make(24);
    expect(whatsappAppLink("9830015879", m, true).length).toBeLessThan(whatsappAppLink("9830015879", m).length - 300);
  });
});
