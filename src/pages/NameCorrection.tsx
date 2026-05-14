import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Check, X, Plus, Minus, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import bookMockup from "@/assets/name-blueprint-book.png";
import heroBg from "@/assets/name-correction-hero-bg.jpg";
import expertPhoto from "@/assets/expert-himansshu.jpg";

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

const faqs = [
  { q: "Will this change my name in official documents?", a: "No. The corrected name can be used in your signature, social media, business cards, and daily life. Legal documentation change is optional and entirely up to you." },
  { q: "How is this different from a software-generated report?", a: "Every report is personally analyzed by Himansshu Agarwal Ji using Chaldean and Vedic numerology — not auto-generated PDFs." },
  { q: "How long does delivery take?", a: "Reports are delivered within 24–48 hours of receiving your details." },
  { q: "What information do I need to provide?", a: "Your full name, date of birth, time and place of birth (if available)." },
  { q: "Is a live session included in all packages?", a: "Live video sessions with Himansshu Ji are included only in the Premium 'Name Correction + Live Session' package." },
];

const NameCorrection = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeT, setActiveT] = useState(0);
  const [nameQty, setNameQty] = useState<1 | 2 | 3>(1);

  // Card 1 dynamic price
  const card1Base = 293;
  const card1Price = nameQty === 1 ? card1Base : nameQty === 2 ? Math.round(card1Base * nameQty * 0.9) : Math.round(card1Base * nameQty * 0.85);

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

      {/* Countdown bar */}
      <div style={{ background: COLORS.amber, color: COLORS.white, ...body }} className="w-full text-center text-sm font-medium py-2 px-4">
        <Clock className="inline w-4 h-4 mr-2 -mt-0.5" />
        Today's offer ends in: <span className="font-semibold ml-1">{hh}h {mm}m {ss}s</span>
      </div>

      {/* SECTION 1 — HERO */}
      <section
        style={{
          background: `radial-gradient(ellipse at 70% 45%, rgba(193,122,26,0.55) 0%, rgba(92,40,0,0.85) 45%, #1a0a00 85%), linear-gradient(180deg, #2a1200 0%, #0f0500 100%)`,
          ...body,
        }}
        className="relative overflow-hidden isolate"
      >
        {/* Cinematic background layers */}
        <div
          className="absolute inset-0 opacity-[0.18] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Gold particles / film grain */}
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-screen pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,213,128,0.6) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Top + bottom vignette */}
        <div className="absolute inset-x-0 top-0 h-32 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none" style={{ background: "linear-gradient(0deg, #1a0a00 0%, transparent 100%)" }} />

        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 pt-16 lg:pt-24 pb-32 lg:pb-40 grid lg:grid-cols-2 gap-10 items-center relative z-10">
          {/* Left */}
          <div className="text-white text-center lg:text-left">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7 backdrop-blur-sm"
              style={{
                background: "rgba(255,213,128,0.08)",
                border: "1px solid rgba(255,213,128,0.25)",
                color: COLORS.goldLight,
                ...body,
              }}
            >
              <span style={{ fontSize: 12 }}>✦</span>
              <span className="text-[11px] tracking-[0.25em] uppercase font-medium">Expert-Led · Personalized · Sacred</span>
            </div>
            <h1 style={heading} className="font-bold text-4xl sm:text-5xl lg:text-[64px] leading-[1.08] mb-6 tracking-tight">
              A Small Tweak In Your Name<br className="hidden md:block" />
              <span style={{
                background: "linear-gradient(135deg, #FFE9B5 0%, #D4870A 50%, #C17A1A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontStyle: "italic",
              }}>Can Change Your Life</span>
            </h1>
            <div className="flex items-center gap-3 my-5 justify-center lg:justify-start">
              <div className="h-px w-12" style={{ background: "linear-gradient(90deg, transparent, rgba(255,213,128,0.6))" }} />
              <span style={{ color: COLORS.goldLight, fontSize: 12 }}>◆</span>
              <div className="h-px w-12" style={{ background: "linear-gradient(90deg, rgba(255,213,128,0.6), transparent)" }} />
            </div>
            <p style={body} className="text-lg text-white/75 mb-9 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              Introducing the Expert-Led Name Correction Report by Himansshu Agarwal Ji
            </p>
            <Link
              to={payLink("Name Check", 293, "name-check")}
              style={{
                background: "linear-gradient(135deg, #D4870A 0%, #C17A1A 100%)",
                color: COLORS.white,
                ...body,
                borderRadius: 8,
                boxShadow: "0 12px 32px -8px rgba(212,135,10,0.55), inset 0 1px 0 rgba(255,255,255,0.18)",
              }}
              className="inline-block font-medium text-base px-9 py-4 hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300"
            >
              Get Name Check @ ₹293 →
            </Link>
          </div>

          {/* Right — wheel + book */}
          <div className="relative h-[420px] lg:h-[560px] flex items-center justify-center">
            {/* Soft amber glow behind everything */}
            <div
              className="absolute inset-[-10%] rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(212,135,10,0.35) 0%, rgba(193,122,26,0.15) 35%, transparent 70%)",
                filter: "blur(40px)",
              }}
            />
            {/* Mandala with 12 rashi names behind the book */}
            <svg viewBox="0 0 500 500" className="absolute inset-0 w-full h-full animate-spin opacity-60" style={{ animationDuration: "120s" }}>
              <defs>
                {Array.from({ length: 12 }).map((_, i) => {
                  const startAngle = i * 30 - 90;
                  const endAngle = startAngle + 30;
                  const r = 220;
                  const x1 = 250 + r * Math.cos((startAngle * Math.PI) / 180);
                  const y1 = 250 + r * Math.sin((startAngle * Math.PI) / 180);
                  const x2 = 250 + r * Math.cos((endAngle * Math.PI) / 180);
                  const y2 = 250 + r * Math.sin((endAngle * Math.PI) / 180);
                  return (
                    <path
                      key={i}
                      id={`rashi-arc-${i}`}
                      d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
                      fill="none"
                    />
                  );
                })}
              </defs>
              <g fill="none" stroke={COLORS.goldLight} strokeWidth="1">
                <circle cx="250" cy="250" r="240" opacity="0.5" />
                <circle cx="250" cy="250" r="210" opacity="0.7" />
                <circle cx="250" cy="250" r="180" opacity="0.4" />
                <circle cx="250" cy="250" r="120" opacity="0.3" />
                {Array.from({ length: 12 }).map((_, i) => {
                  const a = ((i * 30 - 90) * Math.PI) / 180;
                  return (
                    <line
                      key={i}
                      x1={250 + Math.cos(a) * 120}
                      y1={250 + Math.sin(a) * 120}
                      x2={250 + Math.cos(a) * 210}
                      y2={250 + Math.sin(a) * 210}
                      opacity="0.5"
                    />
                  );
                })}
                {/* 8-petal lotus */}
                {Array.from({ length: 8 }).map((_, i) => {
                  const a = (i * 45 * Math.PI) / 180;
                  return (
                    <ellipse
                      key={`p-${i}`}
                      cx="250"
                      cy="170"
                      rx="22"
                      ry="55"
                      opacity="0.45"
                      transform={`rotate(${i * 45} 250 250)`}
                    />
                  );
                })}
              </g>
              <g fill={COLORS.goldLight} style={{ ...heading, fontSize: 15, letterSpacing: "2px", fontWeight: 600 }}>
                {["MESHA","VRISHABHA","MITHUNA","KARKA","SIMHA","KANYA","TULA","VRISHCHIKA","DHANU","MAKARA","KUMBHA","MEENA"].map((name, i) => (
                  <text key={i} dy="-6">
                    <textPath href={`#rashi-arc-${i}`} startOffset="50%" textAnchor="middle">{name}</textPath>
                  </text>
                ))}
              </g>
            </svg>

            {/* Book mockup — emerging from the scene */}
            <motion.div
              initial={{ opacity: 0, y: 30, rotateY: 25 }}
              animate={{ opacity: 1, y: 0, rotateY: -18 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative z-10 w-[260px] lg:w-[360px]"
              style={{
                transform: "perspective(1400px) rotateY(-18deg) rotateX(4deg)",
                transformStyle: "preserve-3d",
                filter: "drop-shadow(0 40px 50px rgba(0,0,0,0.7)) drop-shadow(0 0 60px rgba(212,135,10,0.35))",
                WebkitMaskImage:
                  "radial-gradient(ellipse 75% 85% at 50% 45%, #000 55%, rgba(0,0,0,0.85) 75%, transparent 100%)",
                maskImage:
                  "radial-gradient(ellipse 75% 85% at 50% 45%, #000 55%, rgba(0,0,0,0.85) 75%, transparent 100%)",
              }}
            >
              <img
                src={bookMockup}
                alt="Ankshaastra Name Alignment Blueprint hardcover book by Himansshu Agarwal"
                className="w-full h-auto"
                style={{ mixBlendMode: "luminosity", opacity: 0.96 }}
                loading="eager"
              />
              {/* Color version layered on top, slightly transparent, to keep richness */}
              <img
                src={bookMockup}
                alt=""
                aria-hidden
                className="w-full h-auto absolute inset-0"
                style={{ opacity: 0.55 }}
              />
              {/* Warm amber light wash on the book */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(212,135,10,0.25) 0%, transparent 40%, rgba(26,10,0,0.45) 100%)",
                  mixBlendMode: "overlay",
                }}
              />
            </motion.div>
          </div>
        </div>

        {/* Trust bar */}
        <div className="absolute left-0 right-0 -bottom-12 lg:-bottom-10 px-4">
          <div className="max-w-[1100px] mx-auto rounded-2xl py-6 px-6 grid grid-cols-3 gap-2 backdrop-blur-xl"
            style={{
              background: "linear-gradient(135deg, rgba(255,248,238,0.98) 0%, rgba(253,243,227,0.95) 100%)",
              boxShadow: "0 20px 60px -10px rgba(0,0,0,0.45), 0 0 0 1px rgba(212,135,10,0.15)",
              color: COLORS.brown,
              ...body,
            }}>
            {[
              { v: "5,000+", l: "Reports Delivered" },
              { v: "4.9/5 ★", l: "Average Rating" },
              { v: "Personalized", l: "Report" },
            ].map((s, i) => (
              <div key={i} className="text-center relative">
                <div style={{ ...heading, background: "linear-gradient(135deg, #C17A1A, #D4870A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }} className="text-2xl md:text-3xl font-semibold">{s.v}</div>
                <div className="text-[12px] mt-1 opacity-70 uppercase tracking-[0.15em]">{s.l}</div>
                {i < 2 && <span className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-px" style={{ background: COLORS.amber, opacity: 0.25 }} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2 — What is Name Correction Report */}
      <section style={{ background: COLORS.cream, ...body }} className="pt-32 lg:pt-36 pb-20 lg:pb-24">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 grid lg:grid-cols-[3fr_2fr] gap-12 items-center">
          <div>
            <h2 style={{ ...heading, color: COLORS.brown }} className="text-3xl md:text-[42px] leading-tight font-semibold mb-4">
              What is <span style={{ color: COLORS.gold }}>Name Correction</span> Report?
            </h2>
            <div className="flex items-center gap-3 my-5">
              <div className="h-px flex-1 max-w-[60px]" style={{ background: COLORS.amber }} />
              <span style={{ color: COLORS.amber, fontSize: 14 }}>◆</span>
              <div className="h-px flex-1 max-w-[60px]" style={{ background: COLORS.amber }} />
            </div>
            <p style={{ color: COLORS.brown }} className="text-base mb-6 italic">
              Led by Experts. Backed by Mathematical Science.
            </p>
            <ul className="space-y-[18px] mb-8">
              {bullets1.map((b, i) => (
                <li key={i} style={{ color: COLORS.brown }} className="flex items-start text-base leading-relaxed">
                  <Diamond /> <span>{b}</span>
                </li>
              ))}
            </ul>
            <Link
              to={payLink("Name Correction Report", 2447)}
              style={{ background: COLORS.gold, color: COLORS.white, borderRadius: 6 }}
              className="inline-block font-medium px-8 py-3.5 hover:opacity-90 transition"
            >
              Order Now
            </Link>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-[420px] aspect-[4/3] rounded-xl flex items-center justify-center"
              style={{ background: COLORS.white, border: `1px solid ${COLORS.cardBorder}`, boxShadow: "0 8px 32px rgba(193,122,26,0.15)" }}>
              <div className="text-center px-8">
                <div style={heading} className="text-3xl font-semibold mb-2" >50+</div>
                <div style={{ color: COLORS.brown }} className="text-sm uppercase tracking-widest">Pages of personalised insight</div>
                <div className="mt-6 grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded text-xs flex items-center justify-center"
                      style={{ background: COLORS.cream, color: COLORS.amber, border: `1px solid ${COLORS.cardBorder}` }}>{i + 1}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — Why Trust */}
      <section style={{ background: COLORS.amber, ...body }} className="py-20 lg:py-24">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <h2 style={{ ...heading, color: COLORS.white }} className="text-center text-3xl md:text-[42px] font-semibold mb-12">
            Why Trust This Report?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {trustCards.map((c, i) => (
              <div key={i} style={{ background: COLORS.cream, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 12, boxShadow: "0 2px 16px rgba(193,122,26,0.10)" }} className="p-8">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-5" style={{ background: COLORS.amber }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12,2 15,9 22,9.5 17,14.5 18.5,22 12,18 5.5,22 7,14.5 2,9.5 9,9" />
                  </svg>
                </div>
                <h3 style={{ ...heading, color: COLORS.brown }} className="text-[22px] font-semibold mb-2">{c.title}</h3>
                <p style={{ color: COLORS.brown }} className="text-[15px] leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      {/* SECTION 5 — Pricing */}
      <section style={{ background: COLORS.cream, ...body }} className="py-20 lg:py-24">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <h2 style={{ ...heading, color: COLORS.brown }} className="text-center text-3xl md:text-[44px] font-semibold mb-12 leading-tight">
            Select the <span style={{ color: COLORS.gold }}>Name Correction Report Package</span>
          </h2>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-5 items-stretch">
            {/* Card 1 — Name Check */}
            <div className="relative rounded-xl p-7 flex flex-col"
              style={{ background: COLORS.white, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 12, boxShadow: "0 2px 16px rgba(193,122,26,0.10)" }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider"
                style={{ background: COLORS.brown, color: COLORS.white }}>NOT SURE?</div>
              <h3 style={{ ...heading, color: COLORS.brown }} className="text-2xl font-semibold mt-2 mb-4">Name Check</h3>
              <div className="flex gap-2 mb-5">
                {[1, 2, 3].map((q) => (
                  <button key={q} onClick={() => setNameQty(q as 1 | 2 | 3)}
                    className="flex-1 py-2 rounded-md text-xs font-medium transition"
                    style={{
                      background: nameQty === q ? COLORS.amber : COLORS.cream,
                      color: nameQty === q ? COLORS.white : COLORS.brown,
                      border: `1px solid ${nameQty === q ? COLORS.amber : COLORS.cardBorder}`,
                    }}>
                    {q} Name{q > 1 ? "s" : ""}{q === 2 ? " — 10% OFF" : q === 3 ? " — 15% OFF" : ""}
                  </button>
                ))}
              </div>
              <div style={{ ...heading, color: COLORS.brown }} className="text-5xl font-bold mb-5">₹{card1Price}</div>
              <ul className="space-y-3 mb-6 flex-1">
                {["Quick Name Compatibility Check", "Mulank & Bhagyank Overview", "Clear Yes/No Recommendation", "Expert Analysis Summary"].map((f, i) => (
                  <li key={i} className="flex items-start text-[15px]" style={{ color: COLORS.brown }}><Diamond />{f}</li>
                ))}
              </ul>
              <Link to={payLink(`Name Check (${nameQty} name${nameQty > 1 ? "s" : ""})`, card1Price, "name-check")}
                className="block w-full text-center py-3.5 rounded-md font-medium transition hover:opacity-90"
                style={{ background: COLORS.brown, color: COLORS.white }}>
                Get Name Check for {nameQty} Name{nameQty > 1 ? "s" : ""}
              </Link>
              <div className="flex items-center justify-center gap-4 mt-3 text-xs" style={{ color: COLORS.brown }}>
                <span><Clock className="inline w-3 h-3 mr-1" />24–48 hr delivery</span>
                <span><Lock className="inline w-3 h-3 mr-1" />Secure</span>
              </div>
            </div>

            {/* Card 2 — Name Correction (Most Popular) */}
            <div className="relative rounded-xl p-7 flex flex-col lg:scale-[1.02]"
              style={{ background: COLORS.white, border: `2px solid ${COLORS.amber}`, borderRadius: 12, boxShadow: "0 8px 28px rgba(193,122,26,0.18)" }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-semibold tracking-wider"
                style={{ background: COLORS.amber, color: COLORS.white }}>★ MOST POPULAR</div>
              <h3 style={{ ...heading, color: COLORS.brown }} className="text-2xl font-semibold mt-2 mb-3">Name Correction</h3>
              <div className="flex items-baseline gap-3 mb-1">
                <span className="line-through text-base" style={{ color: "#987" }}>₹7,500</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: COLORS.gold, color: COLORS.white }}>67% OFF</span>
              </div>
              <div style={{ ...heading, color: COLORS.brown }} className="text-[56px] font-bold leading-tight mb-5">₹2,447</div>
              <ul className="space-y-3 mb-6 flex-1">
                {["Mulank & Bhagyank Analysis", "First Name & Full Name Analysis", "Compound Number Analysis", "Personal Lo Shu Grid", "First Alphabet Analysis", "Corrected Name Suggestions (3–5 options)", "PDF Report (50+ Pages)", "Call Consultation Included"].map((f, i) => (
                  <li key={i} className="flex items-start text-[15px]" style={{ color: COLORS.brown }}><Diamond />{f}</li>
                ))}
              </ul>
              <Link to={payLink("Name Correction Report", 2447)}
                className="block w-full text-center py-3.5 rounded-md font-medium transition hover:opacity-90"
                style={{ background: COLORS.gold, color: COLORS.white }}>
                Get Name Correction Report
              </Link>
              <div className="flex items-center justify-center gap-4 mt-3 text-xs" style={{ color: COLORS.brown }}>
                <span><Clock className="inline w-3 h-3 mr-1" />24–48 hr</span>
                <span><Lock className="inline w-3 h-3 mr-1" />Secure</span>
              </div>
            </div>

            {/* Card 3 — Premium */}
            <div className="relative rounded-xl p-7 flex flex-col"
              style={{ background: COLORS.white, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 12, boxShadow: "0 2px 16px rgba(193,122,26,0.10)" }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider"
                style={{ background: COLORS.brown, color: COLORS.gold }}>✦ PREMIUM</div>
              <h3 style={{ ...heading, color: COLORS.brown }} className="text-2xl font-semibold mt-2 mb-3">Name Correction + Live Session</h3>
              <div className="flex items-baseline gap-3 mb-1">
                <span className="line-through text-base" style={{ color: "#987" }}>₹18,218</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: COLORS.gold, color: COLORS.white }}>51% OFF</span>
              </div>
              <div style={{ ...heading, color: COLORS.brown }} className="text-[56px] font-bold leading-tight mb-5">₹8,927</div>
              <ul className="space-y-2.5 mb-5">
                {["Mulank & Bhagyank Analysis", "First Name & Full Name Analysis", "Compound Number Analysis", "Personal Lo Shu Grid", "First Alphabet Analysis", "PDF Report (50+ Pages)", "Call Consultation Included"].map((f, i) => (
                  <li key={i} className="flex items-start text-[14px]" style={{ color: "#888" }}><Diamond color={COLORS.amber} />{f}</li>
                ))}
              </ul>
              <div className="rounded-lg p-4 mb-6" style={{ border: `2px solid ${COLORS.gold}`, background: "#FFF3DC" }}>
                <div className="text-[15px] font-semibold leading-snug" style={{ color: COLORS.brown, ...body }}>
                  🎥 20-Minute Live Video Consultation with Himansshu Agarwal Ji
                </div>
              </div>
              <Link to={payLink("Name Correction + Live Session", 8927)}
                className="block w-full text-center py-3.5 rounded-md font-medium transition hover:opacity-90 mt-auto"
                style={{ background: COLORS.brown, color: COLORS.white }}>
                Get Premium Report + Live Session
              </Link>
              <div className="flex items-center justify-center gap-4 mt-3 text-xs" style={{ color: COLORS.brown }}>
                <span><Clock className="inline w-3 h-3 mr-1" />24–48 hr</span>
                <span><Lock className="inline w-3 h-3 mr-1" />Secure</span>
              </div>
            </div>
          </div>
        </div>
      </section>

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
      <Link to={payLink("Name Correction Report", 2447)}
        className="lg:hidden fixed left-0 right-0 bottom-16 z-40 block text-center py-3.5 font-medium"
        style={{ background: COLORS.gold, color: COLORS.white, ...body }}>
        Get My Report →
      </Link>

      {/* Social proof toast */}
      <AnimatePresence>
        {proofVisible && (
          <motion.div
            initial={{ opacity: 0, x: -30, y: 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="fixed left-4 bottom-32 lg:bottom-6 z-40 max-w-xs rounded-lg px-4 py-3 flex items-start gap-3"
            style={{ background: COLORS.white, boxShadow: "0 8px 28px rgba(0,0,0,0.15)", border: `1px solid ${COLORS.cardBorder}` }}>
            <Bell className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: COLORS.amber }} />
            <span className="text-[13px] leading-snug" style={{ color: COLORS.brown, ...body }}>{socialProofMessages[proofIdx]}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default NameCorrection;
