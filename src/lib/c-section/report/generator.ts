/**
 * C-Section Dates report (PDF) generator.
 * Layout, text and page order live in this folder; the numbers come from the calculator result (CSectionResult).
 * Fonts and images are supplied through `ReportDeps`, so the same code runs in the browser (see browser.ts) and in tests.
 */
import { PDFDocument } from "pdf-lib";
import { textSections, type TextCtx } from "./content.ts";
import { newPage, type Assets, type Fonts } from "./draw.ts";
import { Flow, type Mark, type Section } from "./flow.ts";
import {
  cleanName, drawAvoidDates, drawCalendar, drawChosen, drawIndex, drawLoshuPages, drawWelcome,
  drawMuhurat, drawMuhuratDetails, drawOffers, drawPersonalDetails, drawTimelines, drawTopDates, firstName, type ReportInput,
} from "./pages.ts";
import { DEFAULT_CONTACT } from "./theme.ts";
import { addStaticPage, dedupeImages, loadStaticPages, STATIC_FILE, type StaticKey } from "./static-pages.ts";

export type { ReportInput } from "./pages.ts";

export interface ReportDeps {
  /** Bytes of a file in public/c-section-assets (background.jpg, illustration.png, logo-navy.png, lotus.png). */
  loadBytes(file: string): Promise<Uint8Array>;
  /** Embeds the four fonts into the document. */
  makeFonts(doc: PDFDocument): Promise<Fonts>;
}

const fmt12 = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return `${String(h % 12 || 12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

export async function generateCSectionReport(input: ReportInput, deps: ReportDeps): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const parents = `${cleanName(input.motherName)} & ${cleanName(input.fatherName)}`;
  doc.setTitle(`C-Section Dates Blueprint - ${parents}`);
  doc.setAuthor("Ankshaastra");
  doc.setSubject("Auspicious C-section dates and shubh muhurat");

  const f = await deps.makeFonts(doc);
  const assets: Assets = {
    bg: await doc.embedJpg(await deps.loadBytes("background.jpg")),
    illustration: await doc.embedPng(await deps.loadBytes("illustration.png")),
    logo: await doc.embedPng(await deps.loadBytes("logo-navy.png")),
    lotus: await doc.embedPng(await deps.loadBytes("lotus.png")),
  };

  const contact = input.contact ?? DEFAULT_CONTACT;
  const r = input.result.input;
  const ctx: TextCtx = {
    parents, motherFirst: firstName(input.motherName), phone: contact.phone, email: contact.email,
    otHours: r.otCustom ? `your hospital's operation theatre hours (${fmt12(r.otStart)} to ${fmt12(r.otEnd)})` : `the daytime hours (${fmt12(r.otStart)} to ${fmt12(r.otEnd)})`, windowText: `${r.windowStart} to ${r.windowEnd}`, city: input.city,
  };
  const S = textSections(ctx);
  const marks: Mark[] = [];
  const section = (s: Section) => { new Flow(doc, f, assets, s.l1, s.l2, marks, s.index).render(s.blocks); };

  const SP = await loadStaticPages(doc, await deps.loadBytes(STATIC_FILE));
  /** Adds a Canva page; `title` puts it in the index. */
  const fixed = (key: StaticKey, title?: string) => {
    addStaticPage(doc, SP, key);
    if (title) marks.push({ title, page: doc.getPageCount() });
  };

  fixed("cover");
  const indexPages = [newPage(doc, f, assets), newPage(doc, f, assets)];
  fixed("quote");
  drawPersonalDetails(doc, f, SP, marks, input);
  fixed("disclaimer", "Important Medical Disclaimer");
  drawWelcome(doc, f, SP, marks);
  fixed("why1", "Why Birth Timing & Birth Date Matters");
  fixed("why2"); fixed("why3");
  fixed("medical", "Your Medical Window Analysis");
  drawChosen(doc, f, assets, marks, S.chosen);
  drawCalendar(doc, f, assets, marks, input);
  drawTopDates(doc, f, assets, marks, input);
  drawMuhuratDetails(doc, f, assets, marks, input);
  drawTimelines(doc, f, assets, marks, input);
  drawLoshuPages(doc, f, assets, marks, input);
  drawAvoidDates(doc, f, assets, marks, input);
  drawMuhurat(doc, f, assets, marks, input);
  fixed("support", "Follow-Up & Ongoing Support");
  if (input.offers) drawOffers(doc, f, assets, marks, input); else fixed("offers", "Your Name Decides Your Speed in Life");
  fixed("postBirth", "Post Birth Update Form");
  fixed("testimonial", "Testimonial Request");
  fixed("terms1", "Terms & Understanding");
  fixed("terms2"); fixed("terms3"); fixed("terms4");
  fixed("agreement", "Agreement & Mutual Understanding");
  fixed("expectations", "Realistic Expectations");
  fixed("yourResp", "Your Responsibilities");
  fixed("myResp", "My Responsibilities");
  fixed("faq1", "Frequently Asked Questions"); fixed("faq2"); fixed("faq3");
  fixed("reminders", "Important Reminders");
  fixed("mantra", "Success Mantra");
  fixed("finalWord", "A Final Word to Parents");
  fixed("closing", "Closing Blessings");
  fixed("wishBaby", "What We Wish for Your Baby");
  fixed("wishParents", "What We Wish for You");
  fixed("promise", "Our Promise to You");
  fixed("services", "Services Offered");
  fixed("connect", "Connect With Us");
  fixed("welcomeBaby", "As You Welcome Your Baby");
  fixed("finalBlessing", "Final Blessing");
  fixed("backCover");

  drawIndex(indexPages, f, marks);
  await dedupeImages(doc);
  return doc.save();
}
