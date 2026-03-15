import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";
import {
  CheckCircle, ScrollText, ArrowRight, Pen, Hash, Sparkles,
  Star, Clock, Shield, ChevronDown
} from "lucide-react";

const faqs = [
  { q: "What is a Name Correction Blueprint?", a: "A Name Correction Blueprint is a personalised numerology report that analyzes your current name, identifies vibrational misalignments, and suggests corrected spellings or modifications to attract success, prosperity, and positive energy." },
  { q: "How is this different from a general name reading?", a: "Unlike generic readings, this Blueprint is crafted specifically for you based on your date of birth, current name, and life goals. It goes beyond just analysis — it provides actionable spelling corrections with explanations." },
  { q: "Will I need to legally change my name?", a: "Not necessarily. Many corrections are subtle spelling changes (e.g., adding or modifying one letter) that can be applied to your social, professional, or digital presence without any legal formality." },
  { q: "How long does it take to receive the report?", a: "Your Name Correction Blueprint will be delivered to your email within 24–48 hours of purchase and receiving your details." },
  { q: "What information do I need to provide?", a: "You'll need to provide your full name (as used officially), date of birth, gender, and a brief note about your current life challenges or goals." },
  { q: "Is there a refund policy?", a: "Due to the deeply personalised nature of this report, refunds are not applicable once the report has been delivered to your email or WhatsApp." },
];

const includes = [
  "First Name numerological analysis",
  "Full Name numerological analysis",
  "Compound Number analysis",
  "First Alphabet analysis",
  "50+ page detailed report",
  "Call consultation included",
  "Corrected name suggestions with detailed reasoning",
];

const NameCorrectionBlueprint = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <Layout>
      <SEOHead title="Name Correction Blueprint" description="Align your name's vibration for success. Get a personalized name correction blueprint by Himansshu Agarwal Ji based on numerology analysis." canonical="/reports/name-correction-blueprint" />
      {/* Hero */}
      <section className="relative min-h-[75vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -25, 0], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-16 right-[8%] w-80 h-80 rounded-full bg-white/10 blur-3xl"
          />
          <motion.div
            animate={{ y: [0, 20, 0], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-20 left-[5%] w-60 h-60 rounded-full bg-white/10 blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-6">
              <Pen className="w-4 h-4 text-amber-200" />
              <span className="text-sm text-white font-medium">Name Correction Blueprint</span>
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
              Your Name Holds{" "}
              <span className="text-gradient-amber">Hidden Power.</span>{" "}
              Unlock It.
            </h1>
            <p className="text-lg text-white/80 mb-10 leading-relaxed max-w-2xl mx-auto">
              A deeply personalised report that identifies your name's vibrational misalignments and provides precise corrections — crafted by Himansshu Agarwal Ji using Vedic Numerology & Lal Kitab principles.
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-10 text-white/70 text-sm">
              <span className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-300 fill-amber-300" /> 4.9/5 Rating</span>
              <span className="flex items-center gap-2"><ScrollText className="w-4 h-4 text-amber-300" /> 1000+ Reports Delivered</span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-300" /> Delivered in 24–48 Hours</span>
              <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-amber-300" /> 100% Confidential</span>
            </div>

            <Link
              to="/payment"
              className="inline-flex items-center gap-3 bg-white text-primary font-bold px-10 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg"
            >
              Order Your Blueprint — ₹1,997
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L1440 80L1440 40C1200 60 960 70 720 65C480 60 240 30 0 40Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* Why Your Name Matters */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">Why It Matters</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                Your Name Is More Than an Identity — It's a{" "}
                <span className="text-gradient-gold">Vibration</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-5">
                Every letter carries a numerical value and planetary energy. When your name's total vibration conflicts with your Life Path Number, it creates friction — in career, relationships, finances, and health.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                A Name Correction Blueprint identifies exactly where the misalignment lies and provides specific, actionable corrections — sometimes as simple as changing one letter — to bring your name into harmony with your destiny.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Hash, text: "Vedic Numerology" },
                  { icon: Sparkles, text: "Lal Kitab Remedies" },
                  { icon: Pen, text: "Precise Corrections" },
                  { icon: Shield, text: "Strictly Confidential" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3 text-muted-foreground">
                    <item.icon className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
                <div className="text-center mb-8">
                  <Sparkles className="w-14 h-14 text-primary mx-auto mb-4" />
                  <h3 className="font-display text-xl font-bold text-foreground">Name Analysis Example</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-5 rounded-xl bg-destructive/5 border border-destructive/20">
                    <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Current Name</p>
                    <p className="text-xl font-display text-foreground font-bold">RAHUL SHARMA</p>
                    <p className="text-sm text-destructive mt-2 font-medium">Name Number: 4 — Creates friction & delays</p>
                  </div>
                  <div className="flex justify-center">
                    <ArrowRight className="w-6 h-6 text-primary rotate-90" />
                  </div>
                  <div className="p-5 rounded-xl bg-primary/5 border border-primary/30">
                    <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Corrected Name</p>
                    <p className="text-xl font-display text-foreground font-bold">RAHULL SHARMA</p>
                    <p className="text-sm text-primary mt-2 font-medium">Name Number: 6 — Harmony & prosperity</p>
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground mt-5">*For illustration purposes only. Each report is unique.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Your Blueprint <span className="text-gradient-gold">Includes</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Every detail crafted personally by Himansshu Agarwal Ji — not generated by software.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {includes.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="flex items-start gap-3 bg-card border border-border rounded-xl p-4"
              >
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground text-sm">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-lg mx-auto">
            <div className="relative bg-card border-2 border-primary rounded-2xl p-10 text-center shadow-2xl shadow-primary/10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider">
                Most Popular
              </div>
              <ScrollText className="w-14 h-14 text-primary mx-auto mb-5" />
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">Name Correction Blueprint</h3>
              <p className="text-muted-foreground text-sm mb-6">Personalised by Himansshu Agarwal Ji</p>
              <div className="flex items-baseline justify-center gap-3 mb-2">
                <span className="text-5xl font-bold text-gradient-gold">₹1,997</span>
                <span className="text-xl text-muted-foreground line-through">₹3,999</span>
              </div>
              <p className="text-muted-foreground text-sm mb-8">Delivered within 24–48 hours</p>
              <div className="flex items-center justify-center gap-1 mb-8">
                {[1,2,3,4,5].map((s) => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                <span className="text-sm text-muted-foreground ml-2">4.9/5 (1000+ reports)</span>
              </div>
              <Link to="/payment" className="block w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:opacity-90 transition-opacity text-lg">
                Order Now
              </Link>
              <p className="text-xs text-muted-foreground mt-4">100% Confidential · No Refunds After Delivery</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked <span className="text-gradient-gold">Questions</span>
            </h2>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="font-medium text-foreground text-sm pr-4">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-primary flex-shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Align Your Name with <span className="text-gradient-gold">Your Destiny?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              One small correction. One big shift. Let Himansshu Agarwal Ji show you the path.
            </p>
            <Link to="/payment" className="inline-flex items-center gap-3 bg-primary text-primary-foreground font-bold px-10 py-4 rounded-xl hover:opacity-90 transition-opacity text-lg">
              Get My Blueprint — ₹1,997 <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default NameCorrectionBlueprint;
