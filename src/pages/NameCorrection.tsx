import { useState } from "react";
import { Plus, Minus, ArrowRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import NameReportPackages from "@/components/services/NameReportPackages";
import NameReportTrust from "@/components/services/NameReportTrust";
import NameReportExpert from "@/components/services/NameReportExpert";
import NameReportPodcasts from "@/components/services/NameReportPodcasts";
import NameReportPhilosophy from "@/components/services/NameReportPhilosophy";
import NameReportMarquee from "@/components/services/NameReportMarquee";
import NameReportTestimonials from "@/components/services/NameReportTestimonials";
import NameReportChallenge from "@/components/services/NameReportChallenge";
import PaymentPage from "@/pages/Payment";
import { nameCorrectionPackages } from "@/data/serviceCatalog";
import { nameReportOffers } from "@/data/nameReportOffers";
import { formatINR } from "@/config/pricing";
import heroDesktop from "@/assets/name-check-desktop-restored.webp";
import heroMobile from "@/assets/name-check-mobile-restored.webp";

const faqs = [
  { q: "Will this change my name in official documents?", a: "No. The corrected name can be used in your signature, social media, business cards, and daily life. Legal documentation change is optional and entirely up to you." },
  { q: "How is this different from a software-generated report?", a: "Every report is personally analyzed by Himansshu Agarwal Ji using Chaldean and Vedic numerology — not auto-generated PDFs." },
  { q: "How long does delivery take?", a: "Name Check: 12–24 hours. Check your email / spam box after 6 hours. Name Correction: 24–48 hours. Complete Name Blueprint: 24–28 hours. Name Correction and Complete Blueprint reports are delivered on WhatsApp." },
  { q: "What information do I need to provide?", a: "Your full name, date of birth, time and place of birth (if available)." },
  { q: "Is a live session included in all packages?", a: "Live video sessions with Himansshu Ji are included only in the Premium 'Name Correction + Live Session' package." },
];

const scrollToPackages = () => {
  document.getElementById("name-correction-packages")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
};

export default function NameCorrection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selected, setSelected] = useState(0);
  const selectedPackage = nameCorrectionPackages.find(item => item.serviceTitle === nameReportOffers[selected]?.serviceTitle);
  const bookReport = (index: number) => {
    setSelected(index);
    requestAnimationFrame(() => document.getElementById("name-report-booking")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" }));
  };
  return (
    <Layout minimal>
      <SEOHead title="Name Correction Report by Himansshu Agarwal Ji" description="Expert-led Name Check and Name Correction reports with personalised numerological analysis by Himansshu Agarwal Ji." canonical="/services/name-correction" jsonLd={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
      <div className="name-ad-page pb-20 lg:pb-0 font-body">
        <section aria-label="Name Check report" className="relative overflow-hidden isolate">
          <Button variant="ghost" onClick={scrollToPackages} aria-label="Get Name Check — scroll to package selection" className="block h-auto w-full cursor-pointer rounded-none border-0 bg-transparent p-0 hover:bg-transparent">
            <picture className="block w-full">
              <source media="(min-width: 768px)" srcSet={heroDesktop} />
              <img src={heroMobile} alt="A Small Tweak In Your Name Can Change Your Life — Expert-Led Name Correction Report" className="block h-auto w-full" width={768} height={1661} loading="eager" fetchPriority="high" />
            </picture>
          </Button>
        </section>
        <NameReportMarquee />
        <NameReportTrust />
        <NameReportPhilosophy />
        <NameReportPackages selected={selected} onSelect={setSelected} onBook={bookReport} />
        <NameReportTestimonials />
        <NameReportPodcasts />
        {selectedPackage && <PaymentPage key={selectedPackage.serviceTitle} inline reportService={selectedPackage} />}
        <NameReportChallenge />
        <NameReportExpert />
        <section className="bg-background py-12 lg:py-16" aria-labelledby="name-faq-heading">
          <div className="mx-auto max-w-[900px] px-5">
            <h2 id="name-faq-heading" className="mb-8 text-center font-display text-3xl font-bold text-report-ink md:text-4xl">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((f, i) => <article key={f.q} className="name-package-card rounded-lg border border-border px-5">
                <Button variant="ghost" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i} aria-controls={`name-faq-${i}`} className="h-auto w-full justify-between gap-4 whitespace-normal px-0 py-5 text-left text-base hover:bg-transparent">
                  <span>{f.q}</span>{openFaq === i ? <Minus className="shrink-0 text-report-gold" /> : <Plus className="shrink-0 text-report-gold" />}
                </Button>
                {openFaq === i && <p id={`name-faq-${i}`} className="name-package-muted pb-5 text-sm leading-relaxed">{f.a}</p>}
              </article>)}
            </div>
          </div>
        </section>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-report-gold/30 bg-background/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-xs text-report-ink">{nameReportOffers[selected]?.title}</p><p className="font-display text-xl font-bold text-report-gold">{selectedPackage ? formatINR(selectedPackage.price) : ""}</p></div><Button onClick={() => bookReport(selected)} className="h-12 shrink-0 bg-report-gold text-report-gold-foreground hover:bg-report-gold/90">Get Report <ArrowRight /></Button></div>
      </div>
    </Layout>
  );
}
