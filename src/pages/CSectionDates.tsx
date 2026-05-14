import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { 
  Baby, Star, CheckCircle, Shield, Heart, 
  ArrowRight, Calendar, Award, Users, 
  ChevronDown, Phone, Mail, Sparkles,
  Clock, FileText, Zap
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import serviceCsectionDates from "@/assets/service-csection-dates.png";

const faqs = [
  {
    q: "1. What is C-Section baby date selection?",
    a: "C-Section baby date selection is a numerology-based guidance process that helps parents choose a supportive birth date when a planned medical delivery is already decided."
  },
  {
    q: "2. Does this replace medical advice or my doctor's recommendation?",
    a: "No. Medical safety always comes first. Numerology guidance is provided only within the medically approved date range suggested by your doctor."
  },
  {
    q: "3. How are the dates selected?",
    a: "Dates are evaluated using numerology principles, considering factors like day vibration and overall numerical balance to support harmony, confidence, and stability for the child."
  },
  {
    q: "4. How many date options will I receive?",
    a: "You will typically receive 2–3 carefully evaluated date options, from which you can choose in coordination with your doctor."
  },
  {
    q: "5. Is this service only for numerology believers?",
    a: "Not at all. The guidance is shared in simple, practical language, helping parents make an informed and thoughtful decision without requiring prior numerology knowledge."
  },
  {
    q: "6. What details are required from parents?",
    a: "You will be asked for the expected delivery window, medical constraints (if any), and basic parental details required for numerology evaluation."
  },
  {
    q: "7. Can this be done at the last minute?",
    a: "Yes, urgent requests can be handled depending on availability. However, early planning allows for better evaluation and flexibility."
  },
  {
    q: "8. Will choosing a date guarantee a specific outcome for my child?",
    a: "No. Date selection is a supportive alignment tool, not a guarantee. A child's growth is shaped by upbringing, environment, and care along with timing."
  },
  {
    q: "9. How will I receive the suggested dates?",
    a: "The guidance is shared through a personalised report or message, delivered digitally via WhatsApp or email."
  },
  {
    q: "10. Is my personal information kept confidential?",
    a: "Absolutely. All details shared for C-Section date guidance are strictly confidential and used only for this consultation."
  },
];

const plans = [
  {
    name: "Essential Plan",
    price: "₹1,100",
    originalPrice: "₹5,100",
    badge: null,
    features: [
      "3 Priority Wise Auspicious Dates",
      "Panchang Tithi & Nakshatra Alignment",
      "Mulank & Bhagyank Analysis",
    ],
    excluded: ["No PDF File"],
    highlighted: false,
  },
  {
    name: "Premium Plan",
    price: "₹4,987",
    originalPrice: "₹11,000",
    badge: "BEST VALUE",
    features: [
      "3 Priority Wise Auspicious Dates",
      "Panchang Tithi & Nakshatra Alignment",
      "Mulank & Bhagyank Analysis",
      "Vedic Baby Kundali (100+ Pages)",
      "Name Alphabet Analysis",
      "Personalised Loshu Grid Analysis",
      "Baby Name Report with 2 Name Options (50+ Pages)",
      "Lucky Colors & Numbers",
      "Post Birth Name Support (1 Month)",
    ],
    excluded: [],
    highlighted: true,
  },
  {
    name: "Perfect Baby Name",
    price: "₹1,997",
    originalPrice: "₹5,100",
    badge: "ADD-ON",
    features: [
      "2 Baby Name Options (As per Numerology)",
      "Mulank & Bhagyank Analysis",
      "50+ Page PDF Report",
      "Name Alphabet Analysis (Vedic)",
      "Personalised Loshu Grid Analysis",
    ],
    excluded: [],
    highlighted: false,
  },
];

const CSectionDates = () => {
  useEffect(() => {
    window.location.replace("https://miraclebaby.ankshaastra.com");
  }, []);

  return null;

  // legacy unreachable below
  // eslint-disable-next-line @typescript-eslint/no-unreachable-code
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    parentName: "",
    contact: "",
    email: "",
    city: "",
    tentativeDates: "",
    hospitalName: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `C-Section Date Guidance Request:\nParent Name: ${formData.parentName}\nContact: ${formData.contact}\nEmail: ${formData.email}\nCity: ${formData.city}\nTentative Dates: ${formData.tentativeDates}\nHospital: ${formData.hospitalName}`;
    window.open(`https://wa.me/919667305557?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_60%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_rgba(0,0,0,0.2)_0%,_transparent_60%)]" />
        </div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />

        <div className="section-container relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8"
              >
                <Baby className="w-4 h-4 text-amber-200" />
                <span className="text-sm text-white/90 font-medium">C-Section Baby Date Selection</span>
              </motion.span>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.08] mb-6">
                Let Me Choose the Most{" "}
                <span className="relative inline-block">
                  <span className="text-gradient-amber">Powerful Birth Date</span>
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-amber-300 to-amber-500"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  />
                </span>{" "}
                for Your Child
              </h1>

              <p className="text-lg text-white/75 mb-10 leading-relaxed max-w-lg">
                When a C-section is planned, the birth date becomes more than a medical decision. 
                Numerology helps identify dates that align with harmony, stability, and a strong foundation.
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap gap-4 mb-10">
                {[
                  { icon: Star, value: "4.9", label: "Star Rating" },
                  { icon: Users, value: "99%", label: "Parents Confident" },
                  { icon: Award, value: "100%", label: "Reliable Results" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-amber-200" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg leading-none">{stat.value}</div>
                      <div className="text-white/60 text-xs">{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.a
                href="#plans"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="btn-primary inline-flex items-center gap-3 text-lg px-8 py-4 rounded-2xl shadow-2xl shadow-orange-500/30"
              >
                Get My C-Section Baby Dates Now
                <ArrowRight className="w-5 h-5" />
              </motion.a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.85, rotate: 3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="hidden lg:flex justify-center"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-[2rem] blur-2xl" />
                <img
                  src={serviceCsectionDates}
                  alt="C-Section Baby Dates"
                  className="relative w-full max-w-md rounded-3xl shadow-2xl border-2 border-white/20"
                />
                {/* Floating badge */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-foreground font-bold text-sm">Thousands of</div>
                    <div className="text-muted-foreground text-xs">Happy Parents</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* If You Are Planning a C-Section */}
      <section className="section-padding">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-5">Planning Ahead</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
                If You Are Planning a <span className="text-gradient-primary">C-Section</span>
              </h2>
              <div className="bg-accent/10 border border-accent/20 rounded-2xl p-5 mb-6">
                <p className="text-foreground font-semibold mb-1">Confused Between 1, 10, 19, 28?</p>
                <p className="text-muted-foreground text-sm">Because all are Mulank 1. Choose a beginning that supports balance and strength.</p>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                With multiple possible dates suggested medically, selecting one can feel overwhelming. 
                Numerology-based guidance helps narrow down suitable options, offering clarity and confidence in your decision.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="bg-card rounded-3xl border border-border p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <Sparkles className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-4">More Than Just a Scheduled Date</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Numerology helps identify dates that align with harmony, stability, and a strong foundation, 
                    supporting your child's natural rhythm from the very beginning.
                  </p>
                  <div className="space-y-4">
                    {[
                      { icon: Heart, text: "Harmony & balance alignment" },
                      { icon: Shield, text: "Emotional stability support" },
                      { icon: Zap, text: "Confidence & strength foundation" },
                    ].map((item) => (
                      <div key={item.text} className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-foreground text-sm font-medium">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Who Should Consider */}
      <section className="section-padding bg-muted/30">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">Who Is It For?</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Who Should Consider C-Section Date <span className="text-gradient-primary">Guidance?</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Calendar, title: "Confused About Choosing the Right Date?", desc: "Unsure whether a chosen date aligns well with numerological principles? This guidance evaluates potential imbalances and suggests dates that support emotional balance, confidence, and long-term stability." },
              { icon: Heart, title: "Planning a Conscious Beginning?", desc: "If you want to plan your child's birth thoughtfully, numerology offers insight into dates that complement overall alignment—helping parents feel assured about the start of a new life journey." },
              { icon: Shield, title: "Concerned About Date Compatibility?", desc: "Worried about how the chosen date may affect your child's foundational energy? Get numerology-backed evaluation for peace of mind." },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="group bg-card rounded-3xl border border-border p-8 text-center hover:shadow-2xl hover:border-primary/20 transition-all duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Himansshu Agarwal Ji */}
      <section className="section-padding">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-5">About the Expert</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              About <span className="text-gradient-primary">Himansshu Agarwal Ji</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Himansshu Agarwal Ji is a widely recognised Name Correction Expert and Lal Kitab Remedy Specialist, 
              with over 10 years of dedicated research and practical experience in name vibration patterns, 
              brand failure case studies, and corrective Lal Kitab remedies.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section id="plans" className="section-padding bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
        <div className="section-container relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">Pricing Plans</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Unlock a Thoughtful <span className="text-gradient-primary">Beginning</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Choose the plan that fits your needs. Every plan includes carefully evaluated auspicious dates.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className={`relative bg-card rounded-3xl border p-7 transition-all duration-500 hover:shadow-2xl group ${plan.highlighted ? "border-primary shadow-xl shadow-primary/10 scale-[1.03] z-10" : "border-border hover:border-primary/20"}`}>
                {plan.badge && (
                  <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-xs font-bold tracking-wide ${plan.highlighted ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
                    {plan.badge}
                  </div>
                )}
                <div className="pt-2">
                  <h3 className="font-display text-lg font-bold text-foreground mb-3">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-4xl font-bold text-primary">{plan.price}</span>
                    <span className="text-muted-foreground line-through text-sm">{plan.originalPrice}</span>
                  </div>
                  <div className="w-full h-px bg-border mb-6" />
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">{f}</span>
                      </li>
                    ))}
                    {plan.excluded.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm opacity-50">
                        <span className="w-4 h-4 mt-0.5 flex-shrink-0 text-center leading-4">✕</span>
                        <span className="text-muted-foreground line-through">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="#form" className={`inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold transition-all duration-300 ${plan.highlighted ? "bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20" : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"}`}>
                    Get Started <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Intake Form */}
      <section id="form" className="section-padding">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">Get Started</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Get Your <span className="text-gradient-primary">C-Section Baby Dates</span>
              </h2>
              <p className="text-muted-foreground">Fill in your details and we'll get back to you shortly.</p>
            </div>
            <form onSubmit={handleSubmit} className="bg-card rounded-3xl border border-border p-8 shadow-xl space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Parent's Full Name *</label>
                  <Input required value={formData.parentName} onChange={(e) => setFormData({...formData, parentName: e.target.value})} placeholder="Enter full name" className="rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Contact Number *</label>
                  <Input required type="tel" value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} placeholder="+91 XXXXX XXXXX" className="rounded-xl" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email ID *</label>
                  <Input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="your@email.com" className="rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">City *</label>
                  <Input required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} placeholder="Your city" className="rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tentative Baby Dates *</label>
                <Textarea required value={formData.tentativeDates} onChange={(e) => setFormData({...formData, tentativeDates: e.target.value})} placeholder="E.g., Doctor suggested between 15th March to 25th March" rows={3} className="rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Hospital Name *</label>
                <Input required value={formData.hospitalName} onChange={(e) => setFormData({...formData, hospitalName: e.target.value})} placeholder="Hospital / Clinic name" className="rounded-xl" />
              </div>
              <button type="submit" className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 rounded-2xl">
                Submit & Connect on WhatsApp <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-muted/30">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">Got Questions?</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked <span className="text-gradient-primary">Questions</span>
            </h2>
          </motion.div>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                className={`bg-card rounded-2xl border overflow-hidden transition-all duration-300 ${openFaq === i ? "border-primary/30 shadow-lg shadow-primary/5" : "border-border"}`}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left group">
                  <span className="font-semibold text-foreground pr-4 text-sm">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${openFaq === i ? "rotate-180 text-primary" : "text-muted-foreground"}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-5 pb-5">
                        <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-10 bg-foreground/[0.03]">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center border border-border/50 rounded-2xl p-6 bg-card/50 backdrop-blur-sm">
            <Shield className="w-5 h-5 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-xs leading-relaxed">
              <strong>Disclaimer:</strong> Date selection is advisory in nature and does not replace medical advice. 
              Final decisions should always be taken in consultation with your doctor.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CSectionDates;
