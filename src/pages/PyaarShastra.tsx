import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import {
  Heart, Check, ChevronDown, Sparkles, Clock, Shield, Star, Users,
  HeartCrack, HeartHandshake, Brain, Wallet, HandHeart, Home, Sprout, Mail, ArrowRight,
} from "lucide-react";
import { pricing, formatINR } from "@/config/pricing";

const reportName = "Pyaar Shaastra Report";
const payLink = `/payment?service=${encodeURIComponent(reportName)}&amount=${pricing.pyaarShastra.price}&formType=pyaar-shastra`;

const audiences = [
  { Icon: HeartHandshake, title: "Life Mein Kya Expectations Honi Chahiye", text: "Pyaar Shaastra Report yahi batati hai. Jo sirf accurate compatibility check karta hai — judgement nahi karta. Aapko clarity deta hai ki aage ka safar kaisa hoga." },
  { Icon: HeartCrack, title: "Pehli Baar Dil Toot Gaya", text: "Ab sab sahi se hona chahiye. Pyaar Shaastra Report aapko batata hai ki is rishte ki quality kaisi hogi — peace, stability, aur emotional depth ke terms mein." },
  { Icon: Users, title: "Confused Ho — Decision Nahi Ho Raha", text: "Feelings hain, par certainty nahi. Ghar wale kuch aur bol rahe hain, dil kuch aur. Pyaar Shaastra Report ek neutral expert ki tarah kaam karta hai — jo sirf data dekhta hai." },
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
  { q: "Kya mujhe birth time pata hona chahiye?", a: "Haan, 100% exact time of birth, place of birth aur date of birth mandatory hai accurate results ke liye. In details ke bina report ki accuracy compromise ho jaati hai." },
  { q: "Report kitne time mein milegi?", a: "9 ghante ke andar — directly aapke email pe PDF mein deliver hoti hai." },
  { q: "Kya yeh sirf shaadi ke liye hai?", a: "Nahi. Jo bhi serious relationship mein hain — engaged, live-in, committed, ya sirf sure hona chahte hain — sabke liye hai." },
  { q: "Kya yeh report confidential rehti hai?", a: "100%. Aapki details aur report sirf aapke saath share hoti hai — koi aur nahi." },
];

const PyaarShastra = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <Layout minimal>
      <SEOHead
        title="Pyaar Shaastra Report"
        description="India's first love & life quality compatibility report. Ashtakoot, KP System, Manglik & Dasa analysis — delivered on email in 9 hours by Himansshu Agarwal Ji."
        canonical="/reports/pyaar-shastra"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />

      {/* HERO */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-white/10" />
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full border border-white/10" />
        </div>
        <div className="container mx-auto px-4 relative z-10 py-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-6">
              <Heart className="w-4 h-4 text-amber-200" />
              <span className="text-sm text-white font-medium">India's First Love & Life Quality Report</span>
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white leading-[1.15] mb-5">
              Ek Rishta Nahi — <span className="text-gradient-amber">Ek Zindagi</span> Shuru Hone Wali Hai.
            </h1>
            <p className="text-lg md:text-xl text-white/85 mb-3 leading-relaxed">
              Pyaar mein hona kaafi hai — par saath mein kaisi zindagi hogi, yeh jaanna aur bhi zaroori hai.
            </p>
            <p className="text-base md:text-lg text-white/70 mb-10 leading-relaxed">
              Kitna sukoon hoga? Kitni samajh hogi? Financial life kaisi hogi? Emotional bonding kitni gehri hogi?
            </p>
            <Link to={payLink} className="inline-flex items-center gap-3 bg-white text-primary font-bold px-10 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg">
              Get Clarity Now <ArrowRight className="w-5 h-5" />
            </Link>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8 text-white/75 text-sm">
              <span className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-300 fill-amber-300" /> 4.9 Stars</span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4 text-amber-300" /> 90+ Verified Reviews</span>
              <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-amber-300" /> 100% Confidential</span>
              <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-amber-300" /> Report on Email in 9 Hours</span>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L1440 80L1440 40C1200 60 960 70 720 65C480 60 240 30 0 40Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* WHO IS THIS FOR */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-center text-foreground mb-12">
            Yeh Report <span className="text-gradient-gold">Kinke Liye</span> Hai?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {audiences.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-7 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-primary/10">
                  <a.Icon className="w-6 h-6 text-primary" strokeWidth={1.75} />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3 text-foreground">{a.title}</h3>
                <p className="leading-relaxed text-[15px] text-muted-foreground">{a.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOU DISCOVER */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 text-foreground">
              Yeh Report Kya <span className="text-gradient-gold">Batati Hai?</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto text-muted-foreground">Yeh "haan" ya "na" nahi batata. Yeh batata hai — aapka saath kaisa hoga.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {discoveries.map((d, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="p-7 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-primary/10">
                  <d.Icon className="w-6 h-6 text-primary" strokeWidth={1.75} />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2 text-foreground">{d.title}</h3>
                <p className="leading-relaxed text-[15px] text-muted-foreground">{d.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ANKSHAASTRA DIFFERENCE */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-10 leading-tight text-foreground">
            Yeh Ek Report Nahi — <span className="text-gradient-gold">Ek Expert Ki Nazar</span> Hai Aapke Rishte Par
          </h2>
          <ul className="grid md:grid-cols-2 gap-3">
            {differentiators.map((d, i) => (
              <li key={i} className="flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/30">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary" />
                <span className="text-sm text-foreground">{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PACKAGE */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-10 leading-tight text-foreground">
            Ek Sahi Samajh — <span className="text-gradient-gold">Poori Zindagi Ka Sukoon</span>
          </h2>
          <div className="p-8 md:p-10 relative rounded-2xl border-2 border-primary bg-card shadow-2xl shadow-primary/10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-primary text-primary-foreground">
              Most Trusted
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-semibold text-center mb-4 text-foreground">Pyaar Shaastra Report</h3>
            <div className="flex items-baseline justify-center gap-3 mb-6">
              <span className="text-xl line-through text-muted-foreground">{formatINR(pricing.pyaarShastra.originalPrice)}</span>
              <span className="font-display text-5xl md:text-6xl font-bold text-gradient-gold">{formatINR(pricing.pyaarShastra.price)}</span>
              <span className="text-sm font-semibold text-primary">Only</span>
            </div>
            <ul className="space-y-3 mb-8 max-w-md mx-auto">
              {inclusions.map((f) => (
                <li key={f} className="flex items-start gap-2 text-foreground">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link to={payLink} className="block w-full text-center py-4 text-lg font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all duration-300">
              Apna Report Book Karo — {formatINR(pricing.pyaarShastra.price)}
            </Link>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 9 Hours</span>
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> 100% Confidential</span>
              <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> Email Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-10 text-foreground">
            Frequently Asked <span className="text-gradient-gold">Questions</span>
          </h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-5 text-left">
                  <span className="font-medium text-foreground text-sm pr-4">{f.q}</span>
                  <ChevronDown className={`w-4 h-4 text-primary flex-shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                      <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">{f.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-5 leading-tight">
              Pyaar Toh Hai. Ab Yeh Bhi Jaano — <span className="text-gradient-gold">Saath Kaisa Hoga.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Pyaar Shaastra Report — kyunki ek achhi zindagi sirf feeling se nahi, samajh se bhi banti hai.
            </p>
            <Link to={payLink} className="inline-flex items-center gap-3 bg-primary text-primary-foreground font-bold px-10 py-4 rounded-xl hover:opacity-90 transition-opacity text-lg">
              Apna Report Book Karo — {formatINR(pricing.pyaarShastra.price)} <Heart className="w-5 h-5 fill-current" />
            </Link>
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8 text-sm text-muted-foreground">
              <li className="flex items-center gap-1"><Sparkles className="w-4 h-4 text-primary" /> WhatsApp pe directly order karo</li>
              <li className="flex items-center gap-1"><Mail className="w-4 h-4 text-primary" /> 9 ghante mein email pe delivery</li>
              <li className="flex items-center gap-1"><Heart className="w-4 h-4 text-primary" /> Personalized by Ankshaastra</li>
            </ul>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default PyaarShastra;