import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Heart, Check, Plus, Minus, Sparkles, Clock, Shield, MessageCircle, Star, Users, HeartCrack, HeartHandshake, Brain, Wallet, HandHeart, Home, Sprout, Mail } from "lucide-react";
import { pricing, formatINR } from "@/config/pricing";

const reportName = "Pyaar Shaastra Report";
const payLink = `/payment?service=${encodeURIComponent(reportName)}&amount=${pricing.pyaarShastra.price}&formType=pyaar-shastra`;

const audiences = [
  {
    Icon: HeartHandshake,
    title: "Life Mein Kya Expectations Honi Chahiye",
    text: "Pyaar Shaastra Report yahi batati hai. Jo sirf accurate compatibility check karta hai — judgement nahi karta. Aapko clarity deta hai ki aage ka safar kaisa hoga.",
  },
  {
    Icon: HeartCrack,
    title: "Pehli Baar Dil Toot Gaya",
    text: "Ab sab sahi se hona chahiye. Pyaar Shaastra Report aapko batata hai ki is rishte ki quality kaisi hogi — peace, stability, aur emotional depth ke terms mein.",
  },
  {
    Icon: Users,
    title: "Confused Ho — Decision Nahi Ho Raha",
    text: "Feelings hain, par certainty nahi. Ghar wale kuch aur bol rahe hain, dil kuch aur. Pyaar Shaastra Report ek neutral expert ki tarah kaam karta hai — jo sirf data dekhta hai.",
  },
];

const discoveries = [
  { Icon: Brain, title: "Shanti aur Samajh", text: "Dono ke beech mental compatibility kitni hogi — ek doosre ko kitna samjhoge, arguments kitne hote hain, resolution kaisa hoga." },
  { Icon: Wallet, title: "Financial Life Ki Quality", text: "Paise ke mamle mein dono ki soch milti hai ya nahi — spending, saving, decisions — sab analyze hota hai." },
  { Icon: HandHeart, title: "Emotional Bonding Ki Gehraai", text: "Affection, support, aur emotional intimacy — yeh rishte ki neev hoti hai. Pyaar Shaastra Report batata hai yeh kitni strong hai." },
  { Icon: Home, title: "Ghar Ka Mahaul", text: "Roz ki zindagi kaisi hogi — routine, family involvement, priorities — day-to-day harmony ka analysis." },
  { Icon: Sprout, title: "Personal Growth Saath Mein", text: "Kya yeh rishta dono ko aage badhata hai? Career, dreams, aur personal goals ke liye yeh saath kitna supportive hoga." },
  { Icon: Users, title: "In-Laws Ke Saath Relation", text: "Sasural ke saath kaisa rishta banega — adjustment, respect, aur family harmony ka deep analysis. Yeh aksar relationship ki sabse badi test hoti hai." },
];

const differentiators = [
  "Ashtakoot 8-factor compatibility / 36 Guns — score ke saath explanation",
  "KP System planetary analysis — woh layer jo 90% log miss karte hain",
  "Moon, Sun, Navamsa — teen chart perspectives",
  "Manglik Dosha analysis — with remedy if needed",
  "Vimsottari Dasa — timing guidance",
  "103 pages — sirf numbers nahi, meaning bhi",
];

const inclusions = [
  "Love & Life Compatibility Analysis",
  "Emotional Compatibility",
  "Financial Harmony Analysis",
  "Marriage & Long-Term Stability Insights",
  "Compatibility Timing Guidance",
  "PDF Report on Email within 9 Hours",
];

const faqs = [
  { q: "Kya yeh batata hai ki rishta hona chahiye ya nahi?", a: "Bilkul nahi. Pyaar Shaastra Report yeh decide nahi karta. Yeh sirf batata hai ki aapke saath ki zindagi ki quality kaisi hogi — sukoon, samajh, aur harmony ke terms mein. Decision aapka hai, hamesha." },
  { q: "Kya mujhe birth time pata hona chahiye?", a: "Accurate report ke liye helpful hai. Agar exact time nahi pata — toh bhi analysis ho sakti hai. Pehle WhatsApp karein, hum guide karenge." },
  { q: "Report kitne time mein milegi?", a: "24 ghante ke andar — directly WhatsApp pe PDF mein." },
  { q: "Kya yeh sirf shaadi ke liye hai?", a: "Nahi. Jo bhi serious relationship mein hain — engaged, live-in, committed, ya sirf sure hona chahte hain — sabke liye hai." },
  { q: "Kya yeh report confidential rehti hai?", a: "100%. Aapki details aur report sirf aapke saath share hoti hai — koi aur nahi." },
];

/* Floating hearts decoration */
const FloatingHearts = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
    <motion.div
      animate={{ y: [-20, -400], opacity: [1, 1, 0], x: [0, 20, -10] }}
      transition={{ duration: 12, repeat: Infinity, repeatDelay: 2, ease: "linear" }}
      className="absolute bottom-0 left-[10%] text-rose-300/30 text-2xl"
    >
      <Heart className="w-6 h-6 fill-current" />
    </motion.div>
    <motion.div
      animate={{ y: [-20, -350], opacity: [1, 1, 0], x: [0, -15, 10] }}
      transition={{ duration: 15, repeat: Infinity, repeatDelay: 5, ease: "linear" }}
      className="absolute bottom-0 left-[30%] text-rose-300/25 text-xl"
    >
      <Heart className="w-5 h-5 fill-current" />
    </motion.div>
    <motion.div
      animate={{ y: [-20, -450], opacity: [1, 1, 0], x: [0, 25, -20] }}
      transition={{ duration: 18, repeat: Infinity, repeatDelay: 3, ease: "linear" }}
      className="absolute bottom-0 left-[60%] text-rose-300/35 text-3xl"
    >
      <Heart className="w-8 h-8 fill-current" />
    </motion.div>
    <motion.div
      animate={{ y: [-20, -380], opacity: [1, 1, 0], x: [0, -20, 15] }}
      transition={{ duration: 14, repeat: Infinity, repeatDelay: 7, ease: "linear" }}
      className="absolute bottom-0 left-[80%] text-rose-300/20 text-lg"
    >
      <Heart className="w-4 h-4 fill-current" />
    </motion.div>
    <motion.div
      animate={{ y: [-20, -320], opacity: [1, 1, 0], x: [0, 10, -5] }}
      transition={{ duration: 10, repeat: Infinity, repeatDelay: 4, ease: "linear" }}
      className="absolute bottom-0 left-[45%] text-rose-300/25 text-2xl"
    >
      <Heart className="w-6 h-6 fill-current" />
    </motion.div>
  </div>
);

const PyaarShastra = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <Layout>
      <SEOHead
        title="Pyaar Shaastra Report"
        description="India's first love & life quality compatibility report. Ashtakoot, KP System, Manglik & Dasa analysis — delivered on WhatsApp in 24 hours by Himansshu Agarwal Ji."
        canonical="/reports/pyaar-shastra"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />

      {/* ─── PAGE-SCOPED LOVE THEME ─── */}
      <div
        className="relative"
        style={{
          // Override semantic tokens just for this page
          ["--background" as string]: "346 60% 97%",      // #FFF0F3 blush cream
          ["--foreground" as string]: "330 60% 18%",     // #3D0F1F deep plum
          ["--card" as string]: "0 0% 100%",             // white cards
          ["--card-foreground" as string]: "330 60% 18%",
          ["--primary" as string]: "340 75% 45%",        // #D6336C rose
          ["--primary-foreground" as string]: "0 0% 100%",
          ["--secondary" as string]: "330 65% 28%",      // #6B1538 deep plum
          ["--secondary-foreground" as string]: "0 0% 100%",
          ["--accent" as string]: "340 60% 88%",           // #F8D7E3 soft blush
          ["--accent-foreground" as string]: "330 60% 18%",
          ["--muted" as string]: "346 50% 93%",           // #FAE2E9 light pink
          ["--muted-foreground" as string]: "330 30% 35%",
          ["--border" as string]: "340 50% 86%",          // #F2BFD0 pink border
          ["--input" as string]: "340 50% 86%",
          ["--ring" as string]: "340 75% 45%",
          ["--amber" as string]: "340 75% 45%",          // alias primary rose
          ["--amber-light" as string]: "340 85% 75%",    // #F9A8D4 soft pink
          ["--amber-dark" as string]: "330 65% 28%",     // deep plum
          ["--brown" as string]: "330 65% 28%",          // alias secondary
          ["--brown-light" as string]: "340 60% 50%",
          ["--brown-dark" as string]: "330 65% 22%",
          ["--cream" as string]: "346 60% 97%",
          ["--cream-light" as string]: "0 0% 100%",
          ["--cream-dark" as string]: "346 50% 92%",
          ["--orange" as string]: "340 75% 45%",         // alias primary
          ["--orange-light" as string]: "340 85% 75%",
          ["--orange-dark" as string]: "330 65% 28%",
          ["--tan" as string]: "340 60% 88%",
          ["--tan-light" as string]: "340 70% 92%",
        } as React.CSSProperties}
      >
        {/* ─── HERO ─── */}
        <section
          className="relative overflow-hidden pt-20 pb-24"
          style={{
            background: "linear-gradient(135deg, #6B1538 0%, #9D174D 40%, #BE185D 100%)",
          }}
        >
          <FloatingHearts />
          {/* Soft rose glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-[radial-gradient(ellipse,rgba(249,168,212,1),transparent_70%)] pointer-events-none opacity-30" />
          <div className="container mx-auto px-4 relative">
            <motion.div initial={{ opacity: 1, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center" style={{ color: "#FFFFFF" }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 mb-5 backdrop-blur-sm">
                <Heart className="w-4 h-4" style={{ color: "#F9A8D4" }} />
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#F9A8D4" }}>India&apos;s First Love & Life Quality Report</span>
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-5 leading-tight" style={{ color: "#FFFFFF" }}>
                Ek Rishta Nahi — <span className="italic" style={{ color: "#F9A8D4" }}>Ek Zindagi</span> Shuru Hone Wali Hai.
              </h1>
              <p className="text-lg md:text-xl mb-3 leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
                Pyaar mein hona kaafi hai — par saath mein kaisi zindagi hogi, yeh jaanna aur bhi zaroori hai.
              </p>
              <p className="text-base md:text-lg mb-8 leading-relaxed" style={{ color: "rgba(255,255,255,0.70)" }}>
                Kitna sukoon hoga? Kitni samajh hogi? Financial life kaisi hogi? Emotional bonding kitni gehri hogi?
              </p>
              <Link
                to={payLink}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition hover:-translate-y-0.5 shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #F472B6 0%, #F9A8D4 100%)",
                  color: "#6B1538",
                  boxShadow: "0 10px 30px rgba(244,114,182,0.35)",
                }}
              >
                Get Clarity Now
                <Heart className="w-5 h-5 fill-current" />
              </Link>
              <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mt-8 text-sm" style={{ color: "rgba(255,255,255,0.80)" }}>
                <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-current" style={{ color: "#F9A8D4" }} /> 4.9 Stars</span>
                <span>90+ Verified Reviews</span>
                <span>Pan India</span>
                <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> Report on Email in 9 Hours</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── WHO IS THIS FOR ─── */}
        <section className="py-20" style={{ background: "#FFF0F3" }}>
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-center mb-12" style={{ color: "#3D0F1F" }}>
              Yeh Report <span className="italic" style={{ color: "#D6336C" }}>Kinke Liye</span> Hai?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {audiences.map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 1, y: 20 }}
                  whileInView={{ opacity: 1, y: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-7 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-white"
                  style={{ borderColor: "#F2BFD1" }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: "linear-gradient(135deg, #FCE7F3, #FBCFE8)" }}
                  >
                    <a.Icon className="w-6 h-6" style={{ color: "#D6336C" }} strokeWidth={1.75} />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-3" style={{ color: "#3D0F1F" }}>{a.title}</h3>
                  <p className="leading-relaxed text-[15px]" style={{ color: "#6B3A4F" }}>{a.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── WHAT YOU DISCOVER ─── */}
        <section className="py-20" style={{ background: "#FAE2E9" }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-4" style={{ color: "#3D0F1F" }}>
                Yeh Report Kya <span className="italic" style={{ color: "#D6336C" }}>Batati Hai?</span>
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: "#6B3A4F" }}>Yeh &quot;haan&quot; ya &quot;na&quot; nahi batata. Yeh batata hai — aapka saath kaisa hoga.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {discoveries.map((d, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 1, y: 20 }}
                  whileInView={{ opacity: 1, y: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="p-7 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-white"
                  style={{ borderColor: "#F2BFD1" }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: "linear-gradient(135deg, #FCE7F3, #FBCFE8)" }}
                  >
                    <d.Icon className="w-6 h-6" style={{ color: "#D6336C" }} strokeWidth={1.75} />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2" style={{ color: "#3D0F1F" }}>{d.title}</h3>
                  <p className="leading-relaxed text-[15px]" style={{ color: "#6B3A4F" }}>{d.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── ANKSHAASTRA DIFFERENCE ─── */}
        <section className="py-20" style={{ background: "#FFF0F3" }}>
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-10 leading-tight" style={{ color: "#3D0F1F" }}>
              Yeh Ek Report Nahi — <span className="italic" style={{ color: "#D6336C" }}>Ek Expert Ki Nazar</span> Hai Aapke Rishte Par
            </h2>
            <ul className="grid md:grid-cols-2 gap-3">
              {differentiators.map((d, i) => (
                <li key={i} className="flex items-start gap-3 p-4 rounded-lg border" style={{ background: "rgba(250,226,233,0.5)", borderColor: "#F2BFD1" }}>
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#D6336C" }} />
                  <span className="text-sm" style={{ color: "#3D0F1F" }}>{d}</span>
                </li>
              ))}
            </ul>
            <p className="italic mt-8 text-center leading-relaxed" style={{ color: "#6B3A4F" }}>
              Main woh ₹200 report nahi banata jo ek software generate karta hai aur koi padhta nahi. Main woh report banata hoon jise padhke aap decide kar sako — confidently.
            </p>
            <p className="text-center font-semibold mt-3" style={{ color: "#3D0F1F" }}>— Himansshu Agarwal, Founder, Ankshaastra</p>
          </div>
        </section>

        {/* ─── PACKAGE ─── */}
        <section className="py-20" style={{ background: "#FAE2E9" }}>
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-10 leading-tight" style={{ color: "#3D0F1F" }}>
              Ek Sahi Samajh — <span className="italic" style={{ color: "#D6336C" }}>Poori Zindagi Ka Sukoon</span>
            </h2>
            <div className="p-8 md:p-10 relative rounded-2xl border bg-white" style={{ borderColor: "#F2BFD1" }}>
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-white"
                style={{ background: "linear-gradient(135deg, #D6336C, #9D174D)" }}
              >
                Most Trusted
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-semibold text-center mb-4" style={{ color: "#3D0F1F" }}>Pyaar Shaastra Report</h3>
              <div className="flex items-baseline justify-center gap-3 mb-6">
                <span className="text-xl line-through" style={{ color: "#9C6B7D" }}>{formatINR(pricing.pyaarShastra.originalPrice)}</span>
                <span className="font-display text-5xl md:text-6xl font-bold" style={{ color: "#D6336C" }}>{formatINR(pricing.pyaarShastra.price)}</span>
                <span className="text-sm font-semibold" style={{ color: "#D6336C" }}>Only</span>
              </div>
              <ul className="space-y-3 mb-8 max-w-md mx-auto">
                {inclusions.map((f) => (
                  <li key={f} className="flex items-start gap-2" style={{ color: "#3D0F1F" }}>
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#D6336C" }} />{f}
                  </li>
                ))}
              </ul>
              <Link
                to={payLink}
                className="block w-full text-center py-4 text-lg font-semibold rounded-xl text-white transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #D6336C 0%, #9D174D 100%)",
                  boxShadow: "0 10px 25px rgba(214,51,108,0.35)",
                }}
              >
                Apna Report Book Karo — {formatINR(pricing.pyaarShastra.price)}
              </Link>
              <div className="flex items-center justify-center gap-4 mt-4 text-xs" style={{ color: "#6B3A4F" }}>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 9 Hours</span>
                <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> 100% Confidential</span>
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> Email Delivery</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="py-20" style={{ background: "#FFF0F3" }}>
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-10" style={{ color: "#3D0F1F" }}>Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <div key={i} className="rounded-2xl border overflow-hidden bg-white" style={{ borderColor: "#F2BFD1" }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                    <span className="font-medium pr-4" style={{ color: "#3D0F1F" }}>{f.q}</span>
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                      style={{ background: "linear-gradient(135deg, #D6336C, #9D174D)" }}
                    >
                      {openFaq === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <p className="px-5 pb-5 leading-relaxed text-[15px]" style={{ color: "#6B3A4F" }}>{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #6B1538 0%, #9D174D 40%, #BE185D 100%)" }}>
          <FloatingHearts />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse,rgba(249,168,212,1),transparent_70%)] pointer-events-none opacity-25" />
          <div className="container mx-auto px-4 max-w-3xl text-center relative">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-5 leading-tight" style={{ color: "#FFFFFF" }}>
              Pyaar Toh Hai. Ab Yeh Bhi Jaano — <span className="italic" style={{ color: "#F9A8D4" }}>Saath Kaisa Hoga.</span>
            </h2>
            <p className="text-lg mb-10" style={{ color: "rgba(255,255,255,0.85)" }}>
              Pyaar Shaastra Report — kyunki ek achhi zindagi sirf feeling se nahi, samajh se bhi banti hai.
            </p>
            <Link
              to={payLink}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition hover:-translate-y-0.5 shadow-lg"
              style={{
                background: "linear-gradient(135deg, #F472B6 0%, #F9A8D4 100%)",
                color: "#6B1538",
                boxShadow: "0 10px 30px rgba(244,114,182,0.35)",
              }}
            >
              Apna Report Book Karo — {formatINR(pricing.pyaarShastra.price)}
              <Heart className="w-5 h-5 fill-current" />
            </Link>
            <ul className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mt-8 text-sm" style={{ color: "rgba(255,255,255,0.80)" }}>
              <li className="flex items-center gap-1"><Sparkles className="w-4 h-4" style={{ color: "#F9A8D4" }} /> WhatsApp pe directly order karo</li>
              <li className="flex items-center gap-1"><Mail className="w-4 h-4" style={{ color: "#F9A8D4" }} /> 9 ghante mein email pe delivery</li>
              <li className="flex items-center gap-1"><Heart className="w-4 h-4" style={{ color: "#F9A8D4" }} /> Personalized by Ankshaastra</li>
            </ul>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default PyaarShastra;
