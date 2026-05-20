import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Heart, Check, Plus, Minus, Sparkles, Clock, Shield, MessageCircle, Star } from "lucide-react";
import { pricing, formatINR } from "@/config/pricing";

const payLink = `/payment?service=${encodeURIComponent("Pyaar Shastra Compatibility Report")}&amount=${pricing.pyaarShastra.price}&formType=pyaar-shastra`;

const audiences = [
  {
    emoji: "💑",
    title: "Tum Dono Pehle Se Saath Ho",
    text: "Pyaar hai — commitment bhi hai. Bas yeh jaanna hai ki aage ka safar kaisa hoga. Kitni harmony hogi, kitni understanding hogi, life mein kya expect karo — Pyaar Shastra yahi batata hai.",
  },
  {
    emoji: "😕",
    title: "Confused Ho — Decision Nahi Ho Raha",
    text: "Feelings hain, par certainty nahi. Ghar wale kuch aur bol rahe hain, dil kuch aur. Pyaar Shastra ek neutral expert ki tarah kaam karta hai — jo sirf data dekhta hai, judgment nahi karta.",
  },
  {
    emoji: "💍",
    title: "Dobaara Shuru Karna Chahte Ho",
    text: "Pehli baar mein jo toot gaya — usse seekha. Ab sab sahi karna hai. Pyaar Shastra aapko batata hai ki is rishte ki quality kaisi hogi — peace, stability, aur emotional depth ke terms mein.",
  },
];

const discoveries = [
  { icon: "☮️", title: "Shanti aur Samajh", text: "Dono ke beech mental compatibility kitni hogi — ek doosre ko kitna samjhoge, arguments kitne hote hain, resolution kaisa hoga." },
  { icon: "💰", title: "Financial Life Ki Quality", text: "Paise ke mamle mein dono ki soch milti hai ya nahi — spending, saving, decisions — sab analyze hota hai." },
  { icon: "❤️", title: "Emotional Bonding Ki Gehraai", text: "Affection, support, aur emotional intimacy — yeh rishte ki neev hoti hai. Pyaar Shastra batata hai yeh kitni strong hai." },
  { icon: "🏡", title: "Ghar Ka Mahaul", text: "Roz ki zindagi kaisi hogi — routine, family involvement, priorities — day-to-day harmony ka analysis." },
  { icon: "🌱", title: "Personal Growth Saath Mein", text: "Kya yeh rishta dono ko aage badhata hai? Career, dreams, aur personal goals ke liye yeh saath kitna supportive hoga." },
  { icon: "⏰", title: "Sabse Acha Waqt", text: "Life ke important moments ke liye sabse favorable timing — shaadi, naya ghar, naya chapter — kab shuru karna best rahega." },
];

const differentiators = [
  "Ashtakoot 8-factor compatibility — score ke saath explanation",
  "KP System planetary analysis — woh layer jo 90% log miss karte hain",
  "Moon, Sun, Navamsa — teen chart perspectives",
  "Manglik Dosha analysis — with remedy if needed",
  "Vimsottari Dasa — timing guidance",
  "Detailed compatibility interpretation — sirf numbers nahi, meaning bhi",
  "24 hours mein WhatsApp pe deliver",
  "4.9 stars — 79+ verified reviews",
];

const inclusions = [
  "Love & Life Compatibility Analysis",
  "Emotional Compatibility",
  "Financial Harmony Analysis",
  "Marriage & Long-Term Stability Insights",
  "Compatibility Timing Guidance",
  "PDF Report on WhatsApp within 24 Hours",
];

const faqs = [
  { q: "Kya yeh batata hai ki rishta hona chahiye ya nahi?", a: "Bilkul nahi. Pyaar Shastra yeh decide nahi karta. Yeh sirf batata hai ki aapke saath ki zindagi ki quality kaisi hogi — sukoon, samajh, aur harmony ke terms mein. Decision aapka hai, hamesha." },
  { q: "Kya mujhe birth time pata hona chahiye?", a: "Accurate report ke liye helpful hai. Agar exact time nahi pata — toh bhi analysis ho sakti hai. Pehle WhatsApp karein, hum guide karenge." },
  { q: "Report kitne time mein milegi?", a: "24 ghante ke andar — directly WhatsApp pe PDF mein." },
  { q: "Kya yeh sirf shaadi ke liye hai?", a: "Nahi. Jo bhi serious relationship mein hain — engaged, live-in, committed, ya sirf sure hona chahte hain — sabke liye hai." },
  { q: "Kya yeh report confidential rehti hai?", a: "100%. Aapki details aur report sirf aapke saath share hoti hai — koi aur nahi." },
];

const PyaarShastra = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <Layout>
      <SEOHead
        title="Pyaar Shastra — Love & Life Compatibility Report"
        description="India's first love & life quality compatibility report. Ashtakoot, KP System, Manglik & Dasa analysis — delivered on WhatsApp in 24 hours by Himansshu Agarwal Ji."
        canonical="/reports/pyaar-shastra"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />

      {/* HERO */}
      <section className="relative overflow-hidden gradient-hero pt-20 pb-24">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-[radial-gradient(ellipse,hsl(var(--amber)/0.18),transparent_70%)] pointer-events-none" />
        <div className="container mx-auto px-4 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center text-primary-foreground">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 mb-5">
              <Heart className="w-4 h-4 text-amber-light" />
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-light">India's First Love & Life Quality Report</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-5 leading-tight">
              Ek Rishta Nahi — <span className="text-amber-light italic">Ek Zindagi</span> Shuru Hone Wali Hai.
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/85 mb-3 leading-relaxed">
              Pyaar mein hona kaafi hai — par saath mein kaisi zindagi hogi, yeh jaanna aur bhi zaroori hai.
            </p>
            <p className="text-base md:text-lg text-primary-foreground/70 mb-8 leading-relaxed">
              Kitna sukoon hoga? Kitni samajh hogi? Financial life kaisi hogi? Emotional bonding kitni gehri hogi?
            </p>
            <Link to={payLink} className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-amber-light text-secondary font-semibold text-lg shadow-amber hover:-translate-y-0.5 transition">
              Apna Pyaar Shastra Report Lao
              <Heart className="w-5 h-5 fill-current" />
            </Link>
            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mt-8 text-sm text-primary-foreground/80">
              <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-light text-amber-light" /> 4.9 Stars</span>
              <span>79+ Verified Reviews</span>
              <span>Pan India</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Report on WhatsApp in 24 Hours</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* WHO IS THIS FOR */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-center text-foreground mb-12">Yeh Report <span className="text-primary italic">Kinke Liye</span> Hai?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {audiences.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card-warm p-7">
                <div className="text-4xl mb-3">{a.emoji}</div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">{a.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-[15px]">{a.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOU DISCOVER */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">Yeh Report Kya <span className="text-primary italic">Batati Hai?</span></h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Yeh "haan" ya "na" nahi batata. Yeh batata hai — aapka saath kaisa hoga.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {discoveries.map((d, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="card-warm p-7">
                <div className="text-3xl mb-3">{d.icon}</div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">{d.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-[15px]">{d.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ANKSHAASTRA DIFFERENCE */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-foreground mb-4 leading-tight">
            Yeh Ek Report Nahi — <span className="text-primary italic">Ek Expert Ki Nazar</span> Hai Aapke Rishte Par
          </h2>
          <div className="space-y-4 text-muted-foreground leading-[1.8] mt-8 text-[15px] md:text-base">
            <p>Maine khud apni zindagi mein numerology ko pehle try kiya — apna naam correct kiya — aur jo badlav aaya woh main apni aankhon se dekha. Tab jaake main ne doosron ke liye yeh kaam shuru kiya.</p>
            <p>Pyaar Shastra mein jo analysis hoti hai woh koi automated software nahi karta. Main khud — <strong className="text-foreground">Himansshu Agarwal</strong> — personally har report review karta hoon.</p>
          </div>
          <ul className="grid md:grid-cols-2 gap-3 mt-8">
            {differentiators.map((d, i) => (
              <li key={i} className="flex items-start gap-3 p-4 rounded-lg bg-muted/40 border border-border">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">{d}</span>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground italic mt-8 text-center leading-relaxed">
            Main woh ₹200 report nahi banata jo ek software generate karta hai aur koi padhta nahi. Main woh report banata hoon jise padhke aap decide kar sako — confidently.
          </p>
          <p className="text-center text-foreground font-semibold mt-3">— Himansshu Agarwal, Founder, Ankshaastra</p>
        </div>
      </section>

      {/* PACKAGE */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-foreground mb-10 leading-tight">
            Ek Sahi Samajh — <span className="text-primary italic">Poori Zindagi Ka Sukoon</span>
          </h2>
          <div className="card-warm p-8 md:p-10 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-widest">Most Trusted</div>
            <h3 className="font-display text-2xl md:text-3xl font-semibold text-foreground text-center mb-4">Pyaar Shastra Compatibility Report</h3>
            <div className="flex items-baseline justify-center gap-3 mb-6">
              <span className="text-xl line-through text-muted-foreground">{formatINR(pricing.pyaarShastra.originalPrice)}</span>
              <span className="font-display text-5xl md:text-6xl font-bold text-primary">{formatINR(pricing.pyaarShastra.price)}</span>
              <span className="text-sm font-semibold text-primary">Only</span>
            </div>
            <ul className="space-y-3 mb-8 max-w-md mx-auto">
              {inclusions.map((f) => (
                <li key={f} className="flex items-start gap-2 text-foreground"><Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />{f}</li>
              ))}
            </ul>
            <Link to={payLink} className="block w-full text-center btn-primary py-4 text-lg font-semibold">
              Apna Report Book Karo — {formatINR(pricing.pyaarShastra.price)}
            </Link>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 24 Hours</span>
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> 100% Confidential</span>
              <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> WhatsApp Delivery</span>
            </div>
          </div>

          {/* Add-on highlight */}
          <div className="mt-8 card-warm p-6 border-2 border-amber/40">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h4 className="font-display text-lg font-semibold text-foreground">Kundali Add-On</h4>
              <span className="ml-auto font-bold text-primary">+{formatINR(pricing.pyaarShastra.kundaliAddon)}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">150+ Page Detailed Kundali — add at checkout for only {formatINR(pricing.pyaarShastra.kundaliAddon)}.</p>
            <ul className="grid sm:grid-cols-2 gap-1.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-primary" /> Detailed Birth Chart</li>
              <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-primary" /> Career, Marriage & Finance</li>
              <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-primary" /> Dasha & Transit Reading</li>
              <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-primary" /> Remedies & Guidance</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-foreground mb-10">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="card-warm overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                  <span className="font-medium text-foreground pr-4">{f.q}</span>
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                    {openFaq === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <p className="px-5 pb-5 text-muted-foreground leading-relaxed text-[15px]">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 gradient-hero relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse,hsl(var(--amber)/0.18),transparent_70%)] pointer-events-none" />
        <div className="container mx-auto px-4 max-w-3xl text-center relative">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-5 leading-tight">
            Pyaar Toh Hai. Ab Yeh Bhi Jaano — <span className="text-amber-light italic">Saath Kaisa Hoga.</span>
          </h2>
          <p className="text-lg text-primary-foreground/85 mb-10">
            Pyaar Shastra — kyunki ek achhi zindagi sirf feeling se nahi, samajh se bhi banti hai.
          </p>
          <Link to={payLink} className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-amber-light text-secondary font-semibold text-lg shadow-amber hover:-translate-y-0.5 transition">
            Apna Report Book Karo — {formatINR(pricing.pyaarShastra.price)}
            <Heart className="w-5 h-5 fill-current" />
          </Link>
          <ul className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mt-8 text-sm text-primary-foreground/80">
            <li className="flex items-center gap-1"><Sparkles className="w-4 h-4 text-amber-light" /> WhatsApp pe directly order karo</li>
            <li className="flex items-center gap-1"><Clock className="w-4 h-4 text-amber-light" /> 24 ghante mein report delivery</li>
            <li className="flex items-center gap-1"><Heart className="w-4 h-4 text-amber-light" /> Personalized by Ankshaastra</li>
          </ul>
        </div>
      </section>
    </Layout>
  );
};

export default PyaarShastra;