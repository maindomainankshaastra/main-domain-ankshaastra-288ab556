import { describe, it, expect } from "vitest";
import { buildNamesMessage, tidyMeaning, whatsappChatLink } from "@/lib/swar/swarMessage";

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
