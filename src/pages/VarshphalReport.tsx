import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { lazy, Suspense, useState } from "react";
import VarshphalSections from "@/components/services/VarshphalSections";
import { varshphalInclusions } from "@/data/varshphalReport";
import { ArrowLeft, ArrowRight, Check, LockKeyhole, FileText } from "lucide-react";
import { formatINR } from "@/config/pricing";
import { varshphalPackages } from "@/data/serviceCatalog";
import hero from "@/assets/varshphal-2027-hero.webp";
import cover from "@/assets/varshphal-2027-cover.webp";
import saturn from "@/assets/varshphal-saturn.webp";
import personal from "@/assets/varshphal-personal.webp";
import language from "@/assets/varshphal-language.webp";
import remedies from "@/assets/varshphal-remedies.webp";
import pdf from "@/assets/varshphal-pdf.webp";
import expert from "@/assets/name-report-expert.webp";

const questions = [
  "When is the right time to start something new?",
  "Which months suit big money decisions?",
  "Is this the year to change my job?",
  "Is this a good year for marriage?",
];
const benefits = [
  { image: personal, tag: "PERSONALISED INSIGHTS", title: "Deeply Personal", description: "Built around your exact birth details, annual chart and Muntha. Personalised guidance for the year ahead — not a one-size-fits-all prediction.", tone: "personal" },
  { image: language, tag: "ZERO JARGON", title: "Plain Language", description: "Easy-to-understand guidance for career, relationships, health and finances. No prior numerology knowledge needed.", tone: "language" },
  { image: remedies, tag: "MONTHLY REMEDIES", title: "Practical", description: "Month-by-month remedies for the next 12 months, alongside guidance to support more informed everyday decisions.", tone: "remedies" },
  { image: pdf, tag: "YOUR PDF", title: "Yours to Keep", description: "A detailed 30+ page PDF report delivered via email. Revisit your month-by-month insights whenever you need them.", tone: "pdf" },
];
const PaymentPage = lazy(() => import("@/pages/Payment"));

export default function VarshphalReport() {
  const report = varshphalPackages[0];
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingVisited, setBookingVisited] = useState(false);
  const openBooking = () => {
    setBookingVisited(true);
    setBookingOpen(true);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const closeBooking = () => {
    setBookingOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  return <Layout minimal>
    <SEOHead title="Varshphal Report 2027 — Yearly Predictions" description="Plan your 2027 month by month with a personalised Varshphal astrology report by Himansshu Agarwal Ji. Annual chart, Muntha, guidance and monthly remedies in a detailed 30+ page PDF." canonical="/reports/varshphal-report" />
    <div className="varshphal-page">
      <div hidden={bookingOpen} className="varshphal-content">
      <section className="varshphal-hero relative overflow-hidden">
        <img src={hero} alt="Ankshaastra Varshphal Report 2027 with golden planetary artwork" width={1536} height={1024} fetchPriority="high" className="varshphal-hero-art absolute inset-0 h-full w-full object-cover" />
        <div className="section-container relative z-10">
          <div className="varshphal-hero-copy max-w-2xl">
            <span className="varshphal-edition inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold"><span className="varshphal-status h-1.5 w-1.5 rounded-full" />2027 Edition</span>
            <h1 className="mt-8 font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.08]">Varshphal Report —<br />Yearly Predictions</h1>
            <p className="varshphal-hero-subtitle mt-7 font-display text-2xl sm:text-3xl leading-snug">2027 Predictions Are Here,<br className="hidden sm:block" /> More Personalised Than Ever!</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={openBooking} size="lg" className="varshphal-hero-primary h-auto min-h-12 rounded-full px-6 py-3">Unlock My Varshphal <ArrowRight /></Button>
              <Button asChild variant="outline" size="lg" className="varshphal-hero-secondary h-auto min-h-12 rounded-full px-6 py-3"><a href="#varshphal-discover">See What You’ll Discover</a></Button>
            </div>
            <div className="varshphal-author mt-6 flex items-center gap-3 text-sm"><img src={expert} alt="Himansshu Agarwal Ji" width={40} height={40} className="h-10 w-10 rounded-full object-cover object-top" /><span>By <strong>Himansshu Agarwal Ji</strong></span></div>
          </div>
        </div>
      </section>

      <section id="varshphal-discover" className="section-padding scroll-mt-20">
        <div className="section-container grid items-center gap-8 md:grid-cols-[.7fr_2fr] lg:gap-14">
          <img src={saturn} alt="Saturn with its planetary rings" width={768} height={768} loading="lazy" className="mx-auto w-44 md:w-full max-w-xs" />
          <div>
            <h2 className="varshphal-section-title text-3xl sm:text-4xl lg:text-5xl leading-tight italic">Planning the year ahead?<br />You may be asking…</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">{questions.map(question => <div key={question} className="varshphal-question flex min-h-24 items-center rounded-lg border-l-[3px] px-5 py-5 font-display text-xl font-semibold italic">{question}</div>)}</div>
            <p className="varshphal-decision mt-6 rounded-full px-5 py-4 text-center font-semibold">The right month for every decision in your life.</p>
          </div>
        </div>
      </section>

      <section className="varshphal-benefits section-padding">
        <div className="section-container">
          <div className="varshphal-promise border-y py-8 text-center">
            <p className="varshphal-eyebrow text-xs font-bold">YOUR YEAR, WITH GREATER CLARITY</p>
            <h2 className="mt-3 font-display text-2xl sm:text-3xl">Every part of your life, explored month by month.</h2>
            <p className="varshphal-promise-topics mt-3 font-display text-xl sm:text-2xl font-semibold">Career moves · Money decisions · Travel · Health · Relationships</p>
          </div>
          <h3 className="varshphal-benefit-heading mb-7 mt-12 text-center font-body text-sm font-bold">WHAT MAKES THIS VARSHPHAL DIFFERENT</h3>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{benefits.map(benefit => <article key={benefit.title} className={`varshphal-benefit varshphal-tone-${benefit.tone} overflow-hidden rounded-lg border`}>
            <img src={benefit.image} alt={benefit.title} width={384} height={512} loading="lazy" className="h-44 w-full object-cover" />
            <div className="p-5"><span className="varshphal-benefit-tag inline-block rounded-full px-3 py-1 text-[10px] font-bold">{benefit.tag}</span><h4 className="mt-4 font-display text-2xl font-bold">{benefit.title}</h4><p className="varshphal-body mt-3 text-sm leading-relaxed">{benefit.description}</p></div>
          </article>)}</div>
        </div>
      </section>

      <section id="varshphal-report" className="section-padding scroll-mt-20">
        <div className="section-container">
          <h2 className="varshphal-section-title mx-auto max-w-3xl text-center text-3xl sm:text-4xl lg:text-5xl leading-tight italic">Plan The Year Ahead,<br />Month by Month</h2>
          <p className="varshphal-body mb-10 mt-5 text-center">Your next 12 months, in one personalised report.</p>
          <article className="varshphal-offer grid overflow-hidden rounded-lg border md:grid-cols-[.85fr_1.15fr]">
            <div className="varshphal-cover-wrap flex items-center justify-center p-7 sm:p-10"><img src={cover} alt="Varshphal Report 2027 by Ankshaastra" width={706} height={942} loading="lazy" className="w-52 md:w-full max-w-[310px] rounded-sm" /></div>
            <div className="p-6 sm:p-10 lg:p-12">
              <h3 className="varshphal-section-title font-body text-2xl sm:text-3xl font-bold">Varshphal Report 2027</h3>
              <p className="varshphal-body mt-4 text-lg leading-relaxed">Your birth details, your next 12 months, your remedies. In one detailed PDF.</p>
              <ul className="my-7 space-y-4">{varshphalInclusions.map(item => <li key={item} className="flex items-start gap-3 text-sm"><Check className="varshphal-check mt-0.5 h-4 w-4 shrink-0" />{item}</li>)}</ul>
              <label className="varshphal-selected flex cursor-pointer items-start gap-3 rounded-lg border p-4"><input type="radio" name="varshphal-plan" defaultChecked aria-label="Varshphal Report PDF" className="mt-1 h-4 w-4 accent-primary" /><span className="flex-1"><strong className="block">Varshphal Report</strong><span className="varshphal-body mt-1 block text-sm">Your full report as a PDF via email</span></span><strong className="text-2xl">{formatINR(report.price)}</strong></label>
              <Button onClick={openBooking} size="lg" className="varshphal-order mt-5 h-12 w-full">Unlock My Varshphal <ArrowRight /></Button>
              <div className="varshphal-body mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs"><span className="flex items-center gap-1.5"><LockKeyhole className="h-3.5 w-3.5" />100% Confidential</span><span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" />Personalised PDF</span></div>
            </div>
          </article>
        </div>
      </section>
      <VarshphalSections onBook={openBooking} />
      <div className="varshphal-mobile-cta fixed inset-x-0 bottom-0 z-40 px-4 pt-3 md:hidden">
        <Button onClick={openBooking} size="lg" className="varshphal-unlock h-14 w-full rounded-full text-base">Unlock Varshphal · {formatINR(report.price)} <ArrowRight className="ml-2 h-5 w-5" /></Button>
        <p className="varshphal-body mt-2 text-center text-[11px]">Secure checkout · 100% Confidential</p>
      </div>
      </div>
      {bookingVisited && <div hidden={!bookingOpen}>
        <div className="section-container pt-5"><Button variant="ghost" onClick={closeBooking} className="gap-2"><ArrowLeft className="h-4 w-4" />Back to report</Button></div>
        <Suspense fallback={<section className="section-padding text-center" role="status">Loading your booking form…</section>}><PaymentPage inline reportService={report} /></Suspense>
      </div>}
    </div>
  </Layout>;
}
