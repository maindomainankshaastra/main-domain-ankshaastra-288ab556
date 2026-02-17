import { motion } from "framer-motion";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { 
  Baby, Star, CheckCircle, Shield, Heart, 
  ArrowRight, Calendar, Award, Users, 
  ChevronDown, ChevronUp, Phone, Mail
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import serviceCsectionDates from "@/assets/service-csection-dates.png";

const faqs = [
  {
    q: "What is C-Section baby date selection?",
    a: "C-Section baby date selection is a numerology-based guidance process that helps parents choose a supportive birth date when a planned medical delivery is already decided."
  },
  {
    q: "Does this replace medical advice or my doctor's recommendation?",
    a: "No. Medical safety always comes first. Numerology guidance is provided only within the medically approved date range suggested by your doctor."
  },
  {
    q: "How are the dates selected?",
    a: "Dates are evaluated using numerology principles, considering factors like day vibration and overall numerical balance to support harmony, confidence, and stability for the child."
  },
  {
    q: "How many date options will I receive?",
    a: "You will typically receive 2–3 carefully evaluated date options, from which you can choose in coordination with your doctor."
  },
  {
    q: "Is this service only for numerology believers?",
    a: "Not at all. The guidance is shared in simple, practical language, helping parents make an informed and thoughtful decision without requiring prior numerology knowledge."
  },
  {
    q: "What details are required from parents?",
    a: "You will be asked for the expected delivery window, medical constraints (if any), and basic parental details required for numerology evaluation."
  },
  {
    q: "Can this be done at the last minute?",
    a: "Yes, urgent requests can be handled depending on availability. However, early planning allows for better evaluation and flexibility."
  },
  {
    q: "Will choosing a date guarantee a specific outcome for my child?",
    a: "No. Date selection is a supportive alignment tool, not a guarantee. A child's growth is shaped by upbringing, environment, and care along with timing."
  },
  {
    q: "How will I receive the suggested dates?",
    a: "The guidance is shared through a personalised report or message, delivered digitally via WhatsApp or email."
  },
  {
    q: "Is my personal information kept confidential?",
    a: "Absolutely. All details shared for C-Section date guidance are strictly confidential and used only for this consultation."
  },
];

const plans = [
  {
    name: "Essential Plan",
    price: "₹1,100",
    originalPrice: "₹5,100",
    features: [
      "3 Priority Wise Auspicious Dates",
      "Panchang Tithi & Nakshatra Alignment",
      "Mulank & Bhagyank Analysis",
    ],
    highlighted: false,
  },
  {
    name: "Premium Plan",
    price: "₹4,987",
    originalPrice: "₹11,000",
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
    highlighted: true,
  },
];

const CSectionDates = () => {
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
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-[10%] w-72 h-72 rounded-full bg-white/10 blur-3xl"
          />
        </div>
        <div className="section-container relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-6">
                <Baby className="w-4 h-4 text-amber-200" />
                <span className="text-sm text-white font-medium">C-Section Baby Date Selection</span>
              </span>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
                Let Me Choose the Most{" "}
                <span className="text-gradient-amber">Powerful Birth Date</span>{" "}
                for Your Child
              </h1>
              <p className="text-lg text-white/80 mb-8 leading-relaxed max-w-lg">
                When a C-section is planned, the birth date becomes more than a medical decision. 
                Numerology helps identify dates that align with harmony, stability, and a strong foundation.
              </p>
              <div className="flex flex-wrap gap-6 mb-8">
                {[
                  { icon: Star, label: "4.9 Star Rating" },
                  { icon: Users, label: "99% Parents Confident" },
                  { icon: Award, label: "100% Reliable" },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
                    <stat.icon className="w-5 h-5 text-amber-200" />
                    <span className="text-white text-sm font-medium">{stat.label}</span>
                  </div>
                ))}
              </div>
              <a href="#plans" className="btn-primary inline-flex items-center gap-2 text-lg">
                Get My C-Section Baby Dates Now
                <ArrowRight className="w-5 h-5" />
              </a>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block"
            >
              <img src={serviceCsectionDates} alt="C-Section Baby Dates" className="w-full max-w-md mx-auto rounded-3xl shadow-2xl border-4 border-white/20" />
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
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                If You Are Planning a <span className="text-gradient-primary">C-Section</span>
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Confused Between 1, 10, 19, 28? Because all are Mulank 1. Choose a beginning that supports balance and strength.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                With multiple possible dates suggested medically, selecting one can feel overwhelming. 
                Numerology-based guidance helps narrow down suitable options, offering clarity and confidence in your decision.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
                <h3 className="font-display text-xl font-bold text-foreground mb-4">More Than Just a Scheduled Date</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Numerology helps identify dates that align with harmony, stability, and a strong foundation, 
                  supporting your child's natural rhythm from the very beginning.
                </p>
                <div className="space-y-3">
                  {["Harmony & balance alignment", "Emotional stability support", "Confidence & strength foundation"].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Who Should Consider */}
      <section className="section-padding bg-muted/30">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Who Should Consider C-Section Baby Date <span className="text-gradient-primary">Guidance?</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Calendar, title: "Confused About Choosing the Right Date?", desc: "Unsure whether a chosen date aligns well with numerological principles? This guidance evaluates potential imbalances and suggests dates that support emotional balance, confidence, and long-term stability." },
              { icon: Heart, title: "Planning a Conscious Beginning?", desc: "If you want to plan your child's birth thoughtfully, numerology offers insight into dates that complement overall alignment—helping parents feel assured about the start of a new life journey." },
              { icon: Shield, title: "Concerned About Date Compatibility?", desc: "Worried about how the chosen date may affect your child's foundational energy? Get numerology-backed evaluation for peace of mind." },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl border border-border p-8 text-center hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Himansshu Agarwal Ji */}
      <section className="section-padding">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">About the Expert</span>
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
      <section id="plans" className="section-padding bg-muted/30">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">Pricing</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Unlock a Thoughtful <span className="text-gradient-primary">Beginning</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className={`relative bg-card rounded-2xl border p-8 transition-all duration-300 hover:shadow-xl ${plan.highlighted ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]" : "border-border"}`}>
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="font-display text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-bold text-primary">{plan.price}</span>
                  <span className="text-muted-foreground line-through text-sm">{plan.originalPrice}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <a href="#form" className={`inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold transition-all duration-300 ${plan.highlighted ? "bg-primary text-primary-foreground hover:shadow-lg" : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"}`}>
                  Get Started <ArrowRight className="w-4 h-4" />
                </a>
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
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Get Your <span className="text-gradient-primary">C-Section Baby Dates</span>
              </h2>
              <p className="text-muted-foreground">Fill in your details and we'll get back to you shortly.</p>
            </div>
            <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-8 shadow-lg space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Parent's Full Name *</label>
                  <Input required value={formData.parentName} onChange={(e) => setFormData({...formData, parentName: e.target.value})} placeholder="Enter full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Contact Number *</label>
                  <Input required type="tel" value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} placeholder="+91 XXXXX XXXXX" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email ID *</label>
                  <Input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">City *</label>
                  <Input required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} placeholder="Your city" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Tentative Baby Dates *</label>
                <Textarea required value={formData.tentativeDates} onChange={(e) => setFormData({...formData, tentativeDates: e.target.value})} placeholder="E.g., Doctor suggested between 15th March to 25th March" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Hospital Name *</label>
                <Input required value={formData.hospitalName} onChange={(e) => setFormData({...formData, hospitalName: e.target.value})} placeholder="Hospital / Clinic name" />
              </div>
              <button type="submit" className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2">
                Submit & Connect on WhatsApp <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-muted/30">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked <span className="text-gradient-primary">Questions</span>
            </h2>
          </motion.div>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                  <span className="font-medium text-foreground pr-4">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 bg-muted/50">
        <div className="section-container">
          <p className="text-center text-muted-foreground text-xs leading-relaxed max-w-3xl mx-auto">
            <strong>Disclaimer:</strong> Date selection is advisory in nature and does not replace medical advice. 
            Final decisions should always be taken in consultation with your doctor.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default CSectionDates;
