import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";
import {
  Star, ArrowRight, CheckCircle, ScrollText, Moon, Sun, Sparkles,
  Clock, Shield, ChevronDown, Globe, Heart, Briefcase, TrendingUp, DollarSign
} from "lucide-react";
import { useState } from "react";

const coverageAreas = [
  { icon: TrendingUp, title: "Career & Professional Life", desc: "Identify your strongest career paths, favorable periods for growth, and how to leverage planetary support for professional success." },
  { icon: Heart, title: "Marriage & Relationships", desc: "Understand compatibility, relationship dynamics, and auspicious timing for major relationship milestones." },
  { icon: DollarSign, title: "Financial Wealth", desc: "Pinpoint wealth-building periods, potential financial challenges, and the most favorable directions for investments." },
  { icon: Shield, title: "Health & Wellness", desc: "Astrological indicators of health tendencies, vulnerable periods, and preventive guidance aligned to your chart." },
  { icon: Globe, title: "Travel & Foreign Settlements", desc: "Insights into foreign travel, relocation possibilities, and the best periods for international opportunities." },
  { icon: Sparkles, title: "Spirituality & Life Purpose", desc: "Understand your soul's journey, karmic patterns, and the deeper purpose embedded in your birth chart." },
];

const includes = [
  "Complete Janam Kundali (birth chart) preparation",
  "Lagna (ascendant) & all house analysis",
  "Planetary positions & their effects",
  "Mahadasha & Antardasha predictions",
  "Favorable & unfavorable periods (next 5 years)",
  "Auspicious dates for major life decisions",
  "Gemstone & remedy recommendations",
  "Lal Kitab corrective measures",
  "Lucky numbers, colors & directions",
  "50+ page detailed PDF report",
];

const faqs = [
  { q: "What information do I need to provide?", a: "You'll need to provide your full name, exact date of birth, time of birth, and place of birth. The accuracy of your birth time significantly impacts the precision of the analysis." },
  { q: "What if I don't know my exact birth time?", a: "We can still prepare a partial reading using your date and place of birth. However, an accurate birth time allows for a more detailed and precise Kundali." },
  { q: "How is this different from free online Kundali generators?", a: "Your Personalized Kundali is hand-crafted by Himansshu Agarwal Ji — not software. Every interpretation, prediction, and remedy is personally assessed and written for your unique chart." },
  { q: "How long will it take to receive my report?", a: "Your Personalized Kundali will be delivered to your email within 5 business days of receiving your birth details and payment confirmation." },
  { q: "In which language is the report delivered?", a: "The report is delivered in English. If you prefer Hindi, please mention it at the time of booking." },
  { q: "Can I ask questions after receiving the report?", a: "Yes. You will receive email support for 7 days after delivery to clarify any doubts about the report's contents." },
  { q: "Is there a refund policy?", a: "Due to the personalised nature of the report, refunds are not applicable once the report has been delivered to your email or WhatsApp." },
];

const PersonalizedKundali = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <Layout>
      <SEOHead title="Personalized Kundali Report" description="Get a hand-crafted birth chart covering career, wealth, relationships, and life path predictions by Himansshu Agarwal Ji." canonical="/reports/personalized-kundali" />
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-white/10"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full border border-white/10"
          />
          <motion.div
            animate={{ y: [0, -20, 0], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute top-20 right-[15%] w-64 h-64 rounded-full bg-white/8 blur-3xl"
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
              <Moon className="w-4 h-4 text-amber-200" />
              <span className="text-sm text-white font-medium">Personalized Kundali Report</span>
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
              Your Stars Tell{" "}
              <span className="text-gradient-amber">A Unique Story.</span>{" "}
              Read It.
            </h1>
            <p className="text-lg text-white/80 mb-10 leading-relaxed max-w-2xl mx-auto">
              A complete, hand-crafted Janam Kundali prepared personally by Himansshu Agarwal Ji — covering all 12 houses, planetary periods, and life predictions across career, relationships, wealth, and more.
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-10 text-white/70 text-sm">
              <span className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-300 fill-amber-300" /> 4.9/5 Rating</span>
              <span className="flex items-center gap-2"><ScrollText className="w-4 h-4 text-amber-300" /> 50+ Page Report</span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-300" /> Delivered in 5 Days</span>
              <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-amber-300" /> 100% Confidential</span>
            </div>

            <Link
              to="/payment"
              className="inline-flex items-center gap-3 bg-white text-primary font-bold px-10 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg"
            >
              Order Your Kundali — ₹3,497
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

      {/* About Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">Not Software. Not Automated.</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Every Kundali is Personally Crafted by{" "}
              <span className="text-gradient-gold">Himansshu Agarwal Ji</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
              With over 10 years of dedicated research in Vedic astrology, Lal Kitab, and numerology, Himansshu Agarwal Ji personally analyzes each birth chart — line by line — to deliver predictions and remedies that are accurate, practical, and deeply meaningful.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Coverage Areas */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Your Kundali <span className="text-gradient-gold">Covers</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">A complete picture of your life — past patterns, present challenges, and future opportunities.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {coverageAreas.map((area, i) => {
              const Icon = area.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-2xl p-8 hover:border-primary/30 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-3">{area.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{area.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What's Included + Pricing */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto items-start">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="font-display text-3xl font-bold text-foreground mb-8">
                What's <span className="text-gradient-gold">Included</span>
              </h2>
              <ul className="space-y-4">
                {includes.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="relative bg-card border-2 border-primary rounded-2xl p-10 text-center shadow-2xl shadow-primary/10">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider">
                  Complete Report
                </div>
                <div className="flex justify-center mb-5 gap-3">
                  <Sun className="w-10 h-10 text-amber-400" />
                  <Moon className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">Personalized Kundali</h3>
                <p className="text-muted-foreground text-sm mb-6">Hand-crafted by Himansshu Agarwal Ji</p>
                <div className="flex items-baseline justify-center gap-3 mb-2">
                  <span className="text-5xl font-bold text-gradient-gold">₹3,497</span>
                  <span className="text-xl text-muted-foreground line-through">₹5,499</span>
                </div>
                <p className="text-muted-foreground text-sm mb-8">Delivered within 5 business days</p>
                <div className="flex items-center justify-center gap-1 mb-8">
                  {[1,2,3,4,5].map((s) => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  <span className="text-sm text-muted-foreground ml-2">4.9/5</span>
                </div>
                <Link to="/payment" className="block w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:opacity-90 transition-opacity text-lg">
                  Order My Kundali
                </Link>
                <p className="text-xs text-muted-foreground mt-4">Strictly Confidential · 50+ Page PDF</p>
              </div>
            </motion.div>
          </div>
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
              Understand Your Destiny. <span className="text-gradient-gold">Begin Today.</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Your birth chart holds the answers. Let Himansshu Agarwal Ji decode them for you.
            </p>
            <Link to="/payment" className="inline-flex items-center gap-3 bg-primary text-primary-foreground font-bold px-10 py-4 rounded-xl hover:opacity-90 transition-opacity text-lg">
              Order My Kundali — ₹3,497 <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default PersonalizedKundali;
