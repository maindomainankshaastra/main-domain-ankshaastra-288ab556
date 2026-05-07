import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import {
  Sparkles, Check, ArrowRight, ChevronDown, Globe2, UserCheck, BookOpen,
  Star, ShieldCheck, Clock, Award, MessageCircle, Quote
} from "lucide-react";
import geetaImg from "@/assets/celebrities/geeta-tyagi.png";
import darshanImg from "@/assets/celebrities/darshan-patil.jpg";

const WHATSAPP_URL =
  "https://wa.me/919667305577?text=" +
  encodeURIComponent(
    "Hi Himansshu Ji, I'd like to order the Name Correction Blueprint. Please share the next steps."
  );

const trustCards = [
  { icon: Globe2, title: "Globally Trusted", text: "Clients served across 20+ countries on every continent." },
  { icon: UserCheck, title: "Truly Personalised", text: "Hand-analysed by Himansshu Ji — never an automated PDF." },
  { icon: BookOpen, title: "Ancient Wisdom", text: "Rooted in Vedic numerology blended with modern Chaldean science." },
];

const includesBasic = [
  "Personalised name analysis based on your birth date",
  "Insights into your Mulank, Bhagyaank & name vibration",
  "Identification of hidden negative vibrations",
  "Hand-crafted by Himansshu Ji — not computer generated",
  "Clear guidance on whether name correction is needed",
];

const includesPro = [
  ...includesBasic,
  "Complete corrected name suggestions with reasoning",
  "Best date to start using your new name",
  "30-minute call consultation with Himansshu Ji",
  "50+ page premium PDF report",
];

const testimonials = [
  { name: "Khushi Kapoor", text: "The blueprint didn't just suggest a spelling — it explained my life path and gave me a 10-year direction. Worth every rupee." },
  { name: "Shivani Chauhan", text: "I was jobless for 6 months. Within 2 months of using my corrected name, I landed the role I'd been chasing since 2022." },
  { name: "Gaurav Gupta", text: "The compatibility section gave me clarity I never had about my partner. Our relationship has felt lighter ever since." },
];

const faqs = [
  { q: "Do I have to legally change my name?", a: "No. The corrected spelling can be used on social media, business cards, signature, and daily life. Legal change is optional." },
  { q: "How quickly will I see results?", a: "Most clients begin noticing shifts in mindset and small opportunities within the first few weeks of consistent use." },
  { q: "How long does delivery take?", a: "Your Name Correction Blueprint is delivered to your email within 24–48 hours of receiving your details." },
  { q: "What if I don't connect with the suggested name?", a: "You'll receive multiple suggestions — each with its numerology meaning — so you can choose the one that resonates." },
  { q: "How is the report delivered?", a: "As a beautifully designed PDF on your email and WhatsApp, followed by a call consultation with Himansshu Ji." },
  { q: "Is there a refund policy?", a: "Because each report is hand-crafted personally for you, refunds are not applicable once delivered. Please review details before ordering." },
];

const StarField = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 70 }).map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full bg-white"
        style={{
          width: `${Math.random() * 2 + 1}px`,
          height: `${Math.random() * 2 + 1}px`,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          opacity: Math.random() * 0.6 + 0.1,
          animation: `twinkle ${Math.random() * 4 + 3}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 5}s`,
        }}
      />
    ))}
  </div>
);

const NameCorrectionPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <Layout>
      <SEOHead
        title="Name Correction Report — Ankshaastra"
        description="A small tweak in your name can change your life. Get your personalised Name Correction Blueprint hand-crafted by Himansshu Agarwal Ji."
        canonical="/services/name-correction"
      />
      <style>{`
        @keyframes twinkle { 0%,100%{opacity:.1} 50%{opacity:.85} }
        .cosmic-bg { background: linear-gradient(180deg,#0a0015 0%,#0d0a2e 50%,#0a0015 100%); }
        .nebula-blob { background: radial-gradient(ellipse at center,rgba(168,85,247,.18) 0%,rgba(13,10,46,0) 70%); }
        .nebula-blob-gold { background: radial-gradient(ellipse at center,rgba(232,184,75,.12) 0%,rgba(13,10,46,0) 70%); }
        .glass-card { background: rgba(255,255,255,.05); border:1px solid rgba(180,100,255,.3); backdrop-filter: blur(12px); }
        .glass-card-glow { background: rgba(255,255,255,.07); border:1px solid rgba(232,184,75,.45); backdrop-filter: blur(12px); box-shadow: 0 0 20px rgba(200,150,255,.35), 0 0 40px rgba(232,184,75,.15); }
        .cosmic-heading { color:#f5d78e; }
        .cosmic-body { color:#c9c0e0; }
        .cosmic-label { color:#9b7fc7; text-transform:uppercase; letter-spacing:.12em; font-size:.72rem; font-weight:600; }
        .gold-text { background: linear-gradient(135deg,#e8b84b,#a855f7); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .btn-cosmic-gold { background: linear-gradient(135deg,#e8b84b 0%,#a855f7 100%); color:#0a0015; font-weight:700; border-radius:9999px; padding:14px 32px; font-size:1.05rem; transition:all .3s ease; display:inline-flex; align-items:center; gap:8px; }
        .btn-cosmic-gold:hover { transform: translateY(-2px); box-shadow:0 8px 30px rgba(232,184,75,.45); }
        .btn-outline-cosmic { border:1px solid rgba(232,184,75,.5); color:#f5d78e; border-radius:9999px; padding:13px 30px; font-weight:600; display:inline-flex; align-items:center; gap:8px; transition:all .3s; }
        .btn-outline-cosmic:hover { background: rgba(232,184,75,.1); }
      `}</style>

      {/* HERO */}
      <section className="pt-16 pb-20 cosmic-bg relative overflow-hidden">
        <StarField />
        <div className="absolute -top-20 -right-20 w-[600px] h-[600px] nebula-blob" />
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] nebula-blob-gold" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1 rounded-full glass-card cosmic-label mb-5">
                Expert-Led Name Correction Report
              </span>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 leading-tight cosmic-heading">
                A Small Tweak In Your Name <span className="gold-text">Can Change Your Life</span>
              </h1>
              <p className="font-body text-lg cosmic-body mb-8 max-w-xl">
                Hand-crafted by Himansshu Agarwal Ji — India's trusted Astro Numerologist with
                <span className="gold-text font-semibold"> 5,000+ corrections</span> and a 10+ year legacy.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-cosmic-gold">
                  <MessageCircle className="w-5 h-5" /> Get Your Report on WhatsApp
                </a>
                <a href="#packages" className="btn-outline-cosmic">View Packages <ArrowRight className="w-4 h-4" /></a>
              </div>

              <div className="flex flex-wrap items-center gap-6 cosmic-body text-sm">
                <div className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-300 fill-amber-300" /> 4.9/5 rating</div>
                <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-amber-300" /> 5,000+ corrections</div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-300" /> 24–48 hr delivery</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-10 nebula-blob-gold pointer-events-none" />
              <div className="glass-card-glow rounded-3xl p-10 relative">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="text-center"
                >
                  <Sparkles className="w-20 h-20 mx-auto mb-4" style={{ color: "#e8b84b" }} />
                </motion.div>
                <h3 className="font-display text-3xl text-center cosmic-heading mb-2">Name Correction Blueprint</h3>
                <p className="text-center cosmic-body mb-6">Personalised • Hand-analysed • Premium PDF</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="glass-card rounded-xl p-3">
                    <p className="cosmic-label">Pages</p>
                    <p className="font-display text-2xl cosmic-heading">50+</p>
                  </div>
                  <div className="glass-card rounded-xl p-3">
                    <p className="cosmic-label">Delivery</p>
                    <p className="font-display text-2xl cosmic-heading">48h</p>
                  </div>
                  <div className="glass-card rounded-xl p-3">
                    <p className="cosmic-label">Call</p>
                    <p className="font-display text-2xl cosmic-heading">Yes</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHAT IS */}
      <section className="py-20 cosmic-bg relative overflow-hidden">
        <StarField />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] nebula-blob" />
        <div className="container mx-auto px-4 relative z-10 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="cosmic-label">What you receive</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 cosmic-heading">
              What is the <span className="gold-text">Name Correction Report?</span>
            </h2>
            <p className="cosmic-body mt-4 text-lg">Led by experts. Backed by mathematical science.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Receive a destiny-aligned name — never a random suggestion",
              "Unlock results when previous name changes failed to deliver",
              "Break through the 'stuck' feeling despite your hard work",
              "Dissolve patterns of repeated failure and unexplained delays",
              "Optimise your business name for high-vibrational growth",
              "Re-align your signature, brand and digital identity",
            ].map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-2xl p-5 flex gap-4"
              >
                <div className="w-10 h-10 rounded-full glass-card-glow flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5" style={{ color: "#e8b84b" }} />
                </div>
                <p className="cosmic-body">{line}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY TRUST */}
      <section className="py-20 cosmic-bg relative overflow-hidden">
        <StarField />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] nebula-blob-gold" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="cosmic-label">Why trust this report?</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 cosmic-heading">
              Built on <span className="gold-text">trust, science & legacy</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {trustCards.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card-glow rounded-2xl p-8 text-center"
              >
                <div className="w-16 h-16 mx-auto rounded-full glass-card flex items-center justify-center mb-5">
                  <c.icon className="w-8 h-8" style={{ color: "#e8b84b" }} />
                </div>
                <h3 className="font-display text-2xl cosmic-heading mb-3">{c.title}</h3>
                <p className="cosmic-body">{c.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PACKAGES */}
      <section id="packages" className="py-20 cosmic-bg relative overflow-hidden">
        <StarField />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] nebula-blob" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="cosmic-label">Choose your package</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 cosmic-heading">
              Pick the <span className="gold-text">right blueprint</span> for you
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Basic */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-3xl p-8 flex flex-col"
            >
              <h3 className="font-display text-2xl cosmic-heading mb-2">Name Analysis</h3>
              <p className="cosmic-body mb-6">Understand the energy of your current name and how it impacts your life.</p>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-bold gold-text">₹997</span>
                <span className="cosmic-body line-through">₹2,500</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {includesBasic.map((f) => (
                  <li key={f} className="flex gap-3 cosmic-body">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "#e8b84b" }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-outline-cosmic justify-center">
                Order on WhatsApp <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>

            {/* Pro */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-card-glow rounded-3xl p-8 flex flex-col relative"
            >
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold" style={{ background: "linear-gradient(135deg,#e8b84b,#a855f7)", color: "#0a0015" }}>
                MOST POPULAR
              </span>
              <h3 className="font-display text-2xl cosmic-heading mb-2">Name Analysis + Correction</h3>
              <p className="cosmic-body mb-6">Everything in Analysis, plus corrected name suggestions, remedies and the best date to start using your new name.</p>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-bold gold-text">₹1,997</span>
                <span className="cosmic-body line-through">₹4,999</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {includesPro.map((f) => (
                  <li key={f} className="flex gap-3 cosmic-body">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "#e8b84b" }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-cosmic-gold justify-center">
                <MessageCircle className="w-5 h-5" /> Buy Now
              </a>
            </motion.div>
          </div>
          <p className="text-center cosmic-body mt-6 text-sm opacity-70">
            Strict no-refund policy — each report is personally hand-crafted for you.
          </p>
        </div>
      </section>

      {/* CELEBRITIES (blurred) */}
      <section className="py-20 cosmic-bg relative overflow-hidden">
        <StarField />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="cosmic-label">Trusted by public figures</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 cosmic-heading">
              Names who took the <span className="gold-text">numerological plunge</span>
            </h2>
            <p className="cosmic-body mt-3">Identities protected at the request of our clients.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[geetaImg, darshanImg, geetaImg, darshanImg].map((src, i) => (
              <div key={i} className="relative aspect-square rounded-2xl overflow-hidden glass-card">
                <img src={src} alt="Identity protected client" className="w-full h-full object-cover blur-xl scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0015]/70 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs cosmic-label glass-card">
                  Identity Protected
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT EXPERT */}
      <section className="py-20 cosmic-bg relative overflow-hidden">
        <StarField />
        <div className="absolute -top-20 left-1/4 w-[500px] h-[500px] nebula-blob-gold" />
        <div className="container mx-auto px-4 relative z-10 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card-glow rounded-3xl p-8 md:p-12 text-center">
            <Award className="w-14 h-14 mx-auto mb-5" style={{ color: "#e8b84b" }} />
            <span className="cosmic-label">About the expert</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-3 cosmic-heading">
              Himansshu Agarwal Ji
            </h2>
            <p className="cosmic-body mt-1 mb-6">Astro Numerologist • Name Correction Expert • Lal Kitab Remedy Specialist</p>
            <p className="cosmic-body leading-relaxed">
              With a 10+ year legacy and over 5,000 personalised corrections, Himansshu Ji blends Vedic numerology
              with the precision of Chaldean science. His belief is simple — numerology is not a matter of belief,
              it is a precise, mathematical science that, when applied correctly, brings clarity, direction and
              measurable change to your life.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div><p className="font-display text-3xl gold-text">10+</p><p className="cosmic-label mt-1">Years Legacy</p></div>
              <div><p className="font-display text-3xl gold-text">5,000+</p><p className="cosmic-label mt-1">Corrections</p></div>
              <div><p className="font-display text-3xl gold-text">4.9/5</p><p className="cosmic-label mt-1">Avg Rating</p></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 cosmic-bg relative overflow-hidden">
        <StarField />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="cosmic-label">Our happy clients</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 cosmic-heading">
              Real stories. <span className="gold-text">Real shifts.</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-6"
              >
                <Quote className="w-7 h-7 mb-3" style={{ color: "#e8b84b" }} />
                <p className="cosmic-body mb-5 leading-relaxed">{t.text}</p>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full glass-card-glow flex items-center justify-center font-display text-sm cosmic-heading">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="cosmic-heading font-semibold text-sm">{t.name}</p>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, j) => <Star key={j} className="w-3 h-3 fill-amber-300 text-amber-300" />)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 cosmic-bg relative overflow-hidden">
        <StarField />
        <div className="container mx-auto px-4 relative z-10 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="cosmic-label">FAQ</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 cosmic-heading">
              Frequently <span className="gold-text">Asked Questions</span>
            </h2>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={f.q} className="glass-card rounded-2xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                  <span className="cosmic-heading font-display text-lg pr-4">{f.q}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform flex-shrink-0 ${openFaq === i ? "rotate-180" : ""}`} style={{ color: "#e8b84b" }} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <p className="px-5 pb-5 cosmic-body leading-relaxed">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 cosmic-bg relative overflow-hidden">
        <StarField />
        <div className="absolute inset-0 nebula-blob-gold" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl md:text-5xl font-bold cosmic-heading mb-5">
              Ready to align your name with <span className="gold-text">your destiny?</span>
            </h2>
            <p className="cosmic-body mb-8 text-lg">
              Send your details on WhatsApp — Himansshu Ji's team will guide you through the next steps.
            </p>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-cosmic-gold">
              <MessageCircle className="w-5 h-5" /> Start on WhatsApp
            </a>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default NameCorrectionPage;
