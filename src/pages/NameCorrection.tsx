import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import {
  Check,
  X,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Lock,
  Clock
} from "lucide-react";
import { pricing, formatINR } from "@/config/pricing";
import NameReportPackages from "@/components/services/NameReportPackages";
import NameReportTrust from "@/components/services/NameReportTrust";
import NameReportPhilosophy from "@/components/services/NameReportPhilosophy";
import { Button } from "@/components/ui/button";
import expertPhoto from "@/assets/expert-himansshu.jpg";
import heroDesktop from "@/assets/name-check-desktop-restored.webp";
import heroMobile from "@/assets/name-check-mobile-restored.webp";
import geetaImg from "@/assets/celebrities/geeta-tyagi.png";
import darshanImg from "@/assets/celebrities/darshan-patil.jpg";

const COLORS = {
  amber: "#C17A1A",
  amberDark: "#A8660E",
  cream: "#FDF3E3",
  creamAlt: "#FFF8EE",
  brown: "#5C2E00",
  gold: "#D4870A",
  goldLight: "#FFD580",
  cardBorder: "#E8D5B0",
  white: "#FFFFFF",
  green: "#2E7D32",
  red: "#C62828",
};

const payLink = (service: string, amount: number, formType?: string) =>
  `/payment?service=${encodeURIComponent(service)}&amount=${amount}${formType ? `&formType=${formType}` : ""}`;

const heading = { fontFamily: "'Cormorant Garamond', serif" };
const body = { fontFamily: "'Jost', sans-serif" };

const Diamond = ({ color = COLORS.amber }: { color?: string }) => (
  <span style={{ color, marginRight: 12, fontSize: 14 }}>◆</span>
);

const bullets1 = [
  "Give your destiny-aligned name, not just a random one",
  "Unlock results if previous name changes have failed to deliver",
  "Break through the feeling of being \"stuck\" despite your hard work",
  "Dissolve patterns of repeated failures and unexplained delays",
  "Optimize your business name for growth and high-vibrational branding",
];

const trustCards = [
  { title: "Globally Trusted", text: "Trusted by clients across India and internationally." },
  { title: "Truly Personalized", text: "Not a software PDF. Analyzed by Himansshu Agarwal Ji personally." },
  { title: "Ancient Wisdom", text: "Based on Chaldean and Vedic Numerology." },
];

const tableRows = [
  ["Mulank & Bhagyank Analysis", true, true, true],
  ["Quick Name Compatibility Check", true, true, true],
  ["Clear Yes/No Recommendation", true, true, true],
  ["Expert Analysis Summary", true, true, true],
  ["Compound Number Analysis", false, true, true],
  ["Personal Lo Shu Grid Analysis", false, true, true],
  ["First Alphabet Analysis", false, true, true],
  ["Corrected Name Suggestions", false, true, true],
  ["PDF Report (50+ Pages)", false, true, true],
  ["Call Consultation Included", false, false, true],
  ["20-Min Live Video with Himansshu Agarwal Ji", false, false, true],
] as const;

const testimonials = [
  { name: "Rahul Sharma, Delhi", text: "My business name was corrected by Himansshu Ji and within 3 months I saw a visible shift in client inquiries and revenue." },
  { name: "Priya Mehta, Mumbai", text: "The report was so detailed and personalized. Nothing like a software-generated PDF. Truly expert work." },
  { name: "Amit Verma, Pune", text: "The Lo Shu Grid and compound number analysis was incredibly eye-opening. I finally understood what was blocking me." },
];

const celebrities = [
  { name: "Geita Tyagi", role: "TV & Film Actress", work: "Jagaddhatri · Doli Armaano Ki", image: geetaImg },
  { name: "Darshan Patil", role: "Film Actor", work: "Dhurandhar · Thumbs Up", image: darshanImg },
];

const pressLogos = ["INC91", "DailyHunt", "Hindustan Bytes", "Unseen Times"];

const faqs = [
  { q: "Will this change my name in official documents?", a: "No. The corrected name can be used in your signature, social media, business cards, and daily life. Legal documentation change is optional and entirely up to you." },
  { q: "How is this different from a software-generated report?", a: "Every report is personally analyzed by Himansshu Agarwal Ji using Chaldean and Vedic numerology — not auto-generated PDFs." },
  { q: "How long does delivery take?", a: "Reports are delivered within 24–48 hours of receiving your details." },
  { q: "What information do I need to provide?", a: "Your full name, date of birth, time and place of birth (if available)." },
  { q: "Is a live session included in all packages?", a: "Live video sessions with Himansshu Ji are included only in the Premium 'Name Correction + Live Session' package." },
];

const scrollToPackage = (targetId: string) => {
  const el = document.getElementById(targetId);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const NameCorrection = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeT, setActiveT] = useState(0);

  return (
    <Layout>
      <SEOHead
        title="Name Correction Report by Himansshu Agarwal Ji"
        description="Expert-led Name Correction Report combining Chaldean & Vedic numerology. 5,000+ reports delivered. Personalized analysis by Himansshu Agarwal Ji."
        canonical="/services/name-correction"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f: { q: string; a: string }) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />

      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Jost:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      {/* SECTION 1 — HERO (minimal) */}
      <section className="relative overflow-hidden isolate" style={body}>
        <Button
          variant="ghost"
          type="button"
          onClick={() => scrollToPackage("package-name-check")}
          aria-label="Get Name Check — scroll to package selection"
          className="block h-auto w-full cursor-pointer border-0 rounded-none p-0 bg-transparent hover:bg-transparent"
        >
          <picture className="block w-full">
            <source media="(min-width: 768px)" srcSet={heroDesktop.url} />
            <img
              src={heroMobile.url}
              alt="A Small Tweak In Your Name Can Change Your Life — Expert-Led Name Correction Report"
              className="w-full h-auto block"
              width={768}
              height={1661}
              loading="eager"
              fetchPriority="high"
            />
          </picture>
        </Button>
      </section>

      <NameReportTrust />

      <NameReportPhilosophy />

      {/* SECTION 4 — Comparison Table */}
      <section style={{ background: COLORS.cream, ...body }} className="py-20 lg:py-24">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <h2 style={{ ...heading, color: COLORS.brown }} className="text-center text-3xl md:text-[44px] font-semibold mb-12 leading-tight">
            Choose your perfect <span style={{ color: COLORS.gold }}>Name Correction Report</span>
          </h2>
          <div className="overflow-x-auto rounded-xl" style={{ border: `1px solid ${COLORS.cardBorder}` }}>
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr>
                  <th className="p-4 text-left" style={{ background: COLORS.white, color: COLORS.brown, border: `1px solid ${COLORS.cardBorder}` }}>Features</th>
                  {["Name Check", "Name Correction", "Name Correction + Live Session"].map((h) => (
                    <th key={h} className="p-4 text-center font-semibold" style={{ background: COLORS.amber, color: COLORS.white, border: `1px solid ${COLORS.cardBorder}`, ...body, fontSize: 16 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? COLORS.cream : COLORS.creamAlt }}>
                    <td className="p-4 text-left text-[15px]" style={{ color: COLORS.brown, border: `1px solid ${COLORS.cardBorder}`, background: COLORS.white }}>{row[0]}</td>
                    {[row[1], row[2], row[3]].map((v, j) => (
                      <td key={j} className="p-4 text-center" style={{ border: `1px solid ${COLORS.cardBorder}` }}>
                        {v ? <Check className="inline w-5 h-5" style={{ color: COLORS.green }} /> : <X className="inline w-5 h-5" style={{ color: COLORS.red }} />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <NameReportPackages />

      {/* SECTION 6 — About */}
      <section style={{ background: COLORS.amber, ...body }} className="py-20 lg:py-24">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <div className="text-[13px] uppercase tracking-[0.25em] mb-3" style={{ color: COLORS.goldLight }}>About</div>
            <h2 style={heading} className="text-4xl md:text-[44px] font-semibold mb-2">Himansshu Agarwal Ji</h2>
            <div style={{ ...heading, color: COLORS.goldLight }} className="text-xl italic mb-5">
              Founder, Ankshaastra | Chaldean Numerology Expert
            </div>
            <div className="flex items-center gap-3 my-5">
              <div className="h-px w-12" style={{ background: COLORS.white, opacity: 0.6 }} />
              <span className="text-white">◆</span>
              <div className="h-px w-12" style={{ background: COLORS.white, opacity: 0.6 }} />
            </div>
            <p className="text-base text-white/85 leading-[1.8] mb-4">
              Himansshu Agarwal Ji is a widely recognised Name Expert with over 10 years of dedicated research and practical experience in name vibration patterns, Vedic numerology, and Lal Kitab Remedies.
            </p>
            <p className="text-base text-white/85 leading-[1.8] mb-6">
              Through his brand Ankshaastra, he has guided thousands of families in choosing names that truly align with their cosmic blueprint — crafted using numerology principles, Vedic principles, and your birth details.
            </p>
            <div className="rounded-lg p-4 flex flex-wrap items-center gap-x-8 gap-y-2 mt-6" style={{ background: COLORS.white }}>
              <span className="text-xs uppercase tracking-widest" style={{ color: COLORS.brown }}>As seen on:</span>
              {["INC91", "Hindustan Bytes", "Ubseeb Time", "Daily Hunt"].map((p) => (
                <span key={p} className="text-sm font-semibold" style={{ color: COLORS.brown, ...heading }}>{p}</span>
              ))}
            </div>
          </div>
          <div className="flex items-end justify-center lg:justify-end">
            <div
              className="relative w-full max-w-[420px] aspect-[3/4] rounded-2xl overflow-hidden"
              style={{
                boxShadow: "0 30px 80px -20px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,213,128,0.25)",
              }}
            >
              <img
                src={expertPhoto}
                alt="Himansshu Agarwal Ji — Founder of Ankshaastra"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              {/* Warm amber wash to blend with section */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(193,122,26,0.08) 0%, transparent 35%, rgba(92,40,0,0.55) 100%)",
                }}
              />
              <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                <div style={heading} className="text-xl font-semibold">Himansshu Agarwal Ji</div>
                <div className="text-xs uppercase tracking-[0.2em] mt-1" style={{ color: COLORS.goldLight }}>
                  Founder · Ankshaastra
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — Testimonials */}
      <section style={{ background: COLORS.cream, ...body }} className="py-20 lg:py-24">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 text-center">
          <h2 style={{ ...heading, color: COLORS.brown }} className="text-3xl md:text-[42px] font-semibold mb-2">Our Happy Customers</h2>
          <p className="text-base mb-10" style={{ color: "#888" }}>We've helped thousands of people</p>

          <div className="relative max-w-3xl mx-auto">
            <button onClick={() => setActiveT((a) => (a - 1 + testimonials.length) % testimonials.length)}
              className="absolute -left-2 lg:-left-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white z-10"
              style={{ background: COLORS.amber }} aria-label="Previous">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setActiveT((a) => (a + 1) % testimonials.length)}
              className="absolute -right-2 lg:-right-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white z-10"
              style={{ background: COLORS.amber }} aria-label="Next">
              <ChevronRight className="w-5 h-5" />
            </button>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeT}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
                className="rounded-xl p-10 text-left"
                style={{ background: COLORS.white, border: `1px solid ${COLORS.cardBorder}`, boxShadow: "0 2px 16px rgba(193,122,26,0.10)" }}>
                <div style={{ color: COLORS.amber, fontSize: 36, ...heading }} className="leading-none mb-3">"</div>
                <p className="text-lg leading-relaxed mb-5" style={{ color: COLORS.brown }}>{testimonials[activeT].text}</p>
                <div className="text-sm font-semibold" style={{ color: COLORS.amber }}>— {testimonials[activeT].name}</div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* SECTION 8 — FAQ */}
      <section style={{ background: COLORS.cream, ...body }} className="py-20 lg:py-24">
        <div className="max-w-[900px] mx-auto px-6 lg:px-8">
          <h2 style={{ ...heading, color: COLORS.brown }} className="text-center text-3xl md:text-[42px] font-semibold mb-10">
            Frequently Asked Questions
          </h2>
          <div>
            {faqs.map((f, i) => (
              <div key={i} style={{ borderBottom: `1px solid ${COLORS.cardBorder}` }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-5 text-left">
                  <span className="text-base md:text-[17px] font-medium" style={{ color: COLORS.brown }}>{f.q}</span>
                  <span className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ml-4" style={{ background: COLORS.amber, color: COLORS.white }}>
                    {openFaq === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <p className="pb-5 text-[15px] leading-relaxed" style={{ color: COLORS.brown, opacity: 0.85 }}>{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky bottom bar mobile */}
      <button
        type="button"
        onClick={() => scrollToPackage("name-correction-packages")}
        className="lg:hidden fixed left-0 right-0 bottom-16 z-40 block w-full text-center py-3.5 font-medium cursor-pointer border-0"
        style={{ background: COLORS.gold, color: COLORS.white, ...body }}>
        Get My Report →
      </button>

    </Layout>
  );
};

export default NameCorrection;
