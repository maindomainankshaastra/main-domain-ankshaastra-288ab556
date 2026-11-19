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
  cleanName, drawAvoidDates, drawBackCover, drawCalendar, drawConnect, drawCover, drawIndex, drawLoshuPages, drawMedicalWindow,
  drawMuhurat, drawOffers, drawPersonalDetails, drawQuote, drawTimelines, drawTopDates, firstName, type ReportInput,
} from "./pages.ts";
import { DEFAULT_CONTACT } from "./theme.ts";

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
    otHours: `${fmt12(r.otStart)} to ${fmt12(r.otEnd)}`, windowText: `${r.windowStart} to ${r.windowEnd}`, city: input.city,
  };
  const S = textSections(ctx);
  const marks: Mark[] = [];
  const section = (s: Section) => { new Flow(doc, f, assets, s.l1, s.l2, marks, s.index).render(s.blocks); };

  drawCover(doc, f, assets, input);
  const indexPage = newPage(doc, f, assets);
  drawQuote(doc, f, assets, marks);
  drawPersonalDetails(doc, f, assets, marks, input);
  section(S.disclaimer);
  section(S.welcome);
  section(S.cosmic);
  section(S.science);
  section(S.balance);
  drawMedicalWindow(doc, f, assets, marks, input);
  section(S.chosen);
  drawCalendar(doc, f, assets, marks, input);
  drawTopDates(doc, f, assets, marks, input);
  drawTimelines(doc, f, assets, marks, input);
  drawLoshuPages(doc, f, assets, marks, input);
  drawAvoidDates(doc, f, assets, marks, input);
  drawMuhurat(doc, f, assets, marks, input);
  section(S.support);
  drawOffers(doc, f, assets, marks, input);
  section(S.postBirth);
  section(S.testimonial);
  section(S.terms);
  section(S.agreement);
  section(S.faq);
  section(S.reminders);
  section(S.mantra);
  section(S.finalWord);
  section(S.closing);
  section(S.wishBaby);
  section(S.wishParents);
  section(S.promise);
  section(S.services);
  drawConnect(doc, f, assets, marks, input);
  section(S.welcomeBaby);
  section(S.finalBlessing);
  drawBackCover(doc, f, assets);

  drawIndex(indexPage, f, marks);
  return doc.save();
}
