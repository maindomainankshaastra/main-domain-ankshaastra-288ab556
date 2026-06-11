import kundliHeroBg from "@/assets/kundli-hero-bg.jpg";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";
import {
  Star, ArrowRight, CheckCircle, Moon, Sun, Sparkles,
  Clock, Shield, ChevronDown, Heart, Briefcase, TrendingUp,
  DollarSign, Users, UserCheck, BookOpen, Zap, Award
} from "lucide-react";
import { useState } from "react";
import { pricing, formatINR, payLink } from "@/config/pricing";
import { kundli20Packages } from "@/data/serviceCatalog";

const pricingPlans = kundli20Packages.map((pkg) => ({
  count: pkg.name,
  price: formatINR(pkg.price),
  original: pkg.originalPrice ? formatINR(pkg.originalPrice) : undefined,
  amount: pkg.price,
  service: pkg.serviceTitle,
  tag: pkg.tag || "",
  desc: pkg.description || "",
  popular: pkg.popular,
  link: payLink(pkg.serviceTitle, pkg.price, pkg.formType),
}));

const whatsInside = [
  "Clear direction for every important decision",
  "Personalized Power Remedies – Rudraksh, Gemstones & Mantras curated for your life",
  "Dasha Insights – Understand every phase of your journey",
  "Varshphal (Annual Predictions) to plan your best year",
  "A complete guide to your life, not just a chart",
];

const whoIsThisFor = [
  "You often feel like luck is never on your side",
  "You're unsure what direction to take in life",
  "You want clarity about your timing, struggles, and right path",
  "You're tired of people asking, \"Shaadi kab kar rahe ho?\"",
];

const whyChoose = [
  { title: "Birth Chart Insight", desc: "Your report is based on your exact birth details, not a random horoscope" },
  { title: "Simple Remedies You Can Use", desc: "Easy and practical remedies for life, health, money & relationships" },
  { title: "Guidance for Every Area of Life", desc: "Career, money, health, love, and spiritual growth" },
  { title: "Delivered in 9 Hours", desc: "Fast, reliable, direct to your Email as a PDF" },
];

const reportCovers = [
  "Detailed Birth Chart Analysis (Lagna, Moon Chart, Navamsa D9)",
  "Detailed Bhav Phal – All 12 houses explained",
  "Rahu–Ketu Axis Analysis",
  "Charakarakas Analysis",
  "Dasha & Mahadasha Predictions",
  "Career & Professional Growth Analysis",
  "Marriage & Relationship Insights",
  "Financial & Wealth Predictions",
  "Health Analysis",
  "Numerology Insights",
  "Spiritual Growth Guidance",
  "Rudraksha Guidance",
  "Powerful Remedies – Mantra, Gemstone, Rudraksha & Lifestyle Practices",
];

const expertStats = [
  { label: "10+ Years Legacy", icon: Award },
  { label: "4.9/5 Rating", icon: Star },
  { label: "5000+ Consultations", icon: Users },
  { label: "Name Correction Expert", icon: UserCheck },
  { label: "Lal Kitab Specialist", icon: BookOpen },
];

const reviews = [
  { name: "Kajal", text: "This report nailed things I've never told anyone. Finally found direction. Thank you!" },
  { name: "Deepak", text: "So much clarity in one report. It felt like someone finally understood my chart, not just my problems." },
  { name: "Nitya", text: "Got job after 6 months of applying. Remedies worked. Hats off!!" },
];

const faqs = [
  { q: "Is this a free kundli?", a: "No. This is a personalized, expert-reviewed report." },
  { q: "Is it based on Vedic Astrology?", a: "Yes, combined with Numerology and Lal Kitab." },
  { q: "Will I understand it without knowing astrology?", a: "Absolutely. Written in simple, easy language." },
  { q: "Can I order reports for 2 or 3 people together?", a: "Yes — choose the 2 Kundli or 3 Kundli plan to receive complete personalized reports for each person (partner, parents, children or loved ones)." },
  { q: "What details are required?", a: "Date of Birth, Exact Time of Birth, Place of Birth." },
  { q: "How will I receive it?", a: "As a PDF via email within 9 hours." },
];

const PersonalizedKundali = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <Layout minimal>
      <SEOHead
        title="Personalised Premium Kundli 2.0"
        description="Get your Personalised Premium Kundli 2.0 covering career, marriage, wealth, health & remedies. Delivered within 9 hours by Himansshu Agarwal Ji."
        canonical="/reports/personalized-kundali"
      />

      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${kundliHeroBg})` }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-white/10" />
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full border border-white/10" />
          <motion.div animate={{ y: [0, -20, 0], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-20 right-[15%] w-64 h-64 rounded-full bg-white/8 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10 py-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-6">
              <Moon className="w-4 h-4 text-amber-200" />
              <span className="text-sm text-white font-medium">Personalised Premium Kundli 2.0</span>
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.15] mb-6">
              <span className="text-gradient-amber">Aapki date of birth mein aapki poori zindagi likhi hai.</span>
            </h1>
            <p className="text-xl md:text-2xl text-white font-medium mb-4">
              Career. Relationships. Money. Timing.
            </p>
            <p className="text-base md:text-lg text-white/80 mb-10 leading-relaxed max-w-2xl mx-auto">
              100% Personalized | Delivered within 9 Hours | Expert-Verified Predictions
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-10 text-white/70 text-sm">
              <span className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-300 fill-amber-300" /> 4.9/5 Rating</span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-300" /> Delivered in 9 Hours</span>
              <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-amber-300" /> 100% Confidential</span>
              <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-amber-300" /> Expert-Verified</span>
            </div>

            <a href="#choose-plan" className="inline-flex items-center gap-3 bg-white text-primary font-bold px-10 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg">
              Get Your Kundli @ ₹299
              <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L1440 80L1440 40C1200 60 960 70 720 65C480 60 240 30 0 40Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* Pricing Plans */}
      <section id="choose-plan" className="py-24 scroll-mt-24">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Choose Your <span className="text-gradient-gold">Kundli Plan</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Select the plan that fits your needs. Every plan includes a complete, expert-verified report.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative bg-card border-2 rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-xl ${plan.popular ? "border-primary shadow-2xl shadow-primary/10 scale-105" : "border-border"}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <h3 className="font-display text-xl font-bold text-foreground mb-2">{plan.count}</h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-lg text-muted-foreground line-through">{plan.original}</span>
                  <span className="text-4xl font-bold text-gradient-gold">{plan.price}</span>
                </div>
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">{plan.tag}</span>
                <p className="text-muted-foreground text-sm mb-6">{plan.desc}</p>
                <Link
                  to={plan.link}
                  className={`block w-full font-bold py-3.5 rounded-xl text-base transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                    plan.popular
                      ? "gradient-primary text-white shadow-lg shadow-orange-500/30"
                      : "border-2 border-primary text-primary bg-white/60 hover:bg-primary hover:text-primary-foreground shadow-md"
                  }`}
                >
                  Buy Now
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Inside */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">Made Exclusively from Your Birth Details</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              What's Inside Your <span className="text-gradient-gold">Janam Kundli Report?</span>
            </h2>
          </motion.div>
          <div className="space-y-4 max-w-2xl mx-auto">
            {whatsInside.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground text-base">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Is This For */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Who Is This <span className="text-gradient-gold">For?</span>
            </h2>
            <p className="text-muted-foreground text-lg">For those wanting clear answers about life and what's ahead.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {whoIsThisFor.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-card border border-border rounded-xl p-6 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground text-sm">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Our <span className="text-gradient-gold">Janam Kundli Report?</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">This is not a random prediction. It is your Personalized Birth Chart.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {whyChoose.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                <h3 className="font-display text-base font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Covered */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              What's Covered in the <span className="text-gradient-gold">Report</span>
            </h2>
            <p className="text-muted-foreground text-sm">Delivery: PDF via email within 9 hours</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {reportCovers.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground text-sm">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Customer <span className="text-gradient-gold">Reviews</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((review, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">"{review.text}"</p>
                <p className="font-display font-bold text-foreground text-sm">{review.name}</p>
              </motion.div>
            ))}
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
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="bg-card border border-border rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-5 text-left">
                  <span className="font-medium text-foreground text-sm pr-4">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-primary flex-shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                      <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">{faq.a}</div>
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
              Your Kundli Holds the Answers. <span className="text-gradient-gold">Get Yours Now.</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Expert-verified, delivered in 9 hours. Start your journey to clarity today.
            </p>
            <a href="#choose-plan" className="inline-flex items-center gap-3 bg-primary text-primary-foreground font-bold px-10 py-4 rounded-xl hover:opacity-90 transition-opacity text-lg">
              Order My Kundli @ ₹299 <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default PersonalizedKundali;
