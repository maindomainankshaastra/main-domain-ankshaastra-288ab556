import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { 
  Star, Calendar, ScrollText, ArrowRight, CheckCircle, 
  Sparkles, TrendingUp, Shield, Heart, Briefcase, DollarSign
} from "lucide-react";

const highlights = [
  { icon: TrendingUp, title: "Career & Growth", desc: "Month-by-month career insights and optimal periods for key decisions." },
  { icon: Heart, title: "Relationships", desc: "Understanding relationship dynamics and harmony periods through the year." },
  { icon: DollarSign, title: "Financial Guidance", desc: "Favorable periods for investments, savings, and financial decisions." },
  { icon: Shield, title: "Health & Wellness", desc: "Health alerts and wellness guidance for every month of the year." },
  { icon: Briefcase, title: "Business Strategy", desc: "Strategic timing for business moves, partnerships, and expansions." },
  { icon: Sparkles, title: "Lucky Periods", desc: "Identification of your most powerful and favorable time windows." },
];

const features = [
  "Personalised Mulank & Bhagyank Analysis",
  "Month-by-Month Predictions for 2026",
  "Lucky Numbers, Colors & Directions",
  "Career & Business Timing",
  "Relationship & Health Insights",
  "Remedial Lal Kitab Suggestions",
  "Loshu Grid Analysis",
  "40+ Page Detailed PDF Report",
];

const VarshphalReport = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 overflow-hidden">
          <motion.div animate={{ y: [0, -20, 0], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-[10%] w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="section-container relative z-10 py-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-6">
              <Calendar className="w-4 h-4 text-amber-200" />
              <span className="text-sm text-white font-medium">Varshphal Report 2026</span>
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
              Your Complete{" "}
              <span className="text-gradient-amber">Yearly Numerology</span>{" "}
              Guide for 2026
            </h1>
            <p className="text-lg text-white/80 mb-8 leading-relaxed max-w-2xl mx-auto">
              A detailed, personalised prediction report covering all aspects of your life — career, relationships, 
              health, finances, and more — powered by Numerology & Lal Kitab wisdom.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/payment" className="group inline-flex items-center justify-center gap-3 bg-white text-primary font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <span>Order Report — ₹2,499</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* What's Included */}
      <section className="section-padding">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">What's Covered</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Comprehensive Life <span className="text-gradient-primary">Predictions</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {highlights.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl border border-border p-8 text-center hover:shadow-xl hover:border-primary/30 transition-all duration-300 group">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Report Features */}
      <section className="section-padding bg-muted/30">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                What Your Report <span className="text-gradient-primary">Includes</span>
              </h2>
              <ul className="space-y-4">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="relative bg-card rounded-2xl border border-primary shadow-lg shadow-primary/10 p-10 text-center">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  VARSHPHAL 2026
                </div>
                <ScrollText className="w-16 h-16 text-primary mx-auto mb-6" />
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">Complete Yearly Report</h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-4xl font-bold text-primary">₹2,499</span>
                  <span className="text-muted-foreground line-through">₹3,499</span>
                </div>
                <p className="text-muted-foreground text-sm mb-6">40+ page detailed PDF report</p>
                <div className="flex items-center justify-center gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">4.9/5 rating</span>
                </div>
                <Link to="/payment" className="btn-primary w-full inline-flex items-center justify-center gap-2 py-4 text-lg">
                  Order Now <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="section-container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Start 2026 with <span className="text-gradient-primary">Clarity & Confidence</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Know what's coming. Plan smarter. Make empowered decisions with your personalised Varshphal Report.
            </p>
            <Link to="/payment" className="btn-primary inline-flex items-center gap-2 text-lg px-10 py-4">
              Get Your Report Now <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default VarshphalReport;
