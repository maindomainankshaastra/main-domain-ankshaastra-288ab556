import { motion } from "framer-motion";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { 
  Smartphone, Star, CheckCircle, Shield, 
  ArrowRight, Award, Users, ChevronDown, 
  Phone, Sparkles, Zap, BarChart3, Hash,
  TrendingUp, AlertTriangle, Target
} from "lucide-react";
import { Input } from "@/components/ui/input";
import serviceMobileNumerology from "@/assets/service-mobile-numerology.png";
import { pricing, formatINR } from "@/config/pricing";

const faqs = [
  {
    q: "1. What is Mobile Numerology?",
    a: "Mobile Numerology is the study of how your phone number's vibrations influence your personal and professional life. Each digit carries a specific energy that can attract or repel opportunities."
  },
  {
    q: "2. Can my mobile number really affect my life?",
    a: "Yes. Just like your name carries vibrations, your mobile number—which you use daily—constantly emits a frequency that interacts with your personal numerological chart."
  },
  {
    q: "3. What will I receive in the analysis?",
    a: "You'll receive a detailed breakdown of your number's total vibration, individual digit analysis, compatibility with your date of birth, and recommendations for improvement if needed."
  },
  {
    q: "4. Do I need to change my number?",
    a: "Not necessarily. In many cases, small adjustments or awareness of the number's energy can help. If the number is highly incompatible, a change may be suggested."
  },
  {
    q: "5. How long does the analysis take?",
    a: "The analysis is typically delivered within 24–48 hours after receiving your details."
  },
  {
    q: "6. What details are required?",
    a: "Your full name, date of birth, current mobile number, and any alternate numbers you use regularly."
  },
  {
    q: "7. Can I get analysis for multiple numbers?",
    a: "Yes, you can get analysis for multiple numbers. Each additional number is evaluated separately for a small extra fee."
  },
  {
    q: "8. Is this service available internationally?",
    a: "Yes, mobile numerology works on universal numerological principles and is applicable to phone numbers from any country."
  },
];

const benefits = [
  { icon: TrendingUp, title: "Attract Opportunities", desc: "Align your number's vibration with growth and success energy." },
  { icon: Shield, title: "Remove Blockages", desc: "Identify if your number is creating invisible obstacles in life." },
  { icon: Target, title: "Enhanced Focus", desc: "A harmonious number supports mental clarity and decision-making." },
  { icon: Sparkles, title: "Better Relationships", desc: "Your number's energy affects how people perceive and connect with you." },
];

const MobileNumerology = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    mobile: "",
    email: "",
    city: "",
    alternateMobile: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Mobile Numerology Analysis Request:\nName: ${formData.fullName}\nDOB: ${formData.dob}\nMobile: ${formData.mobile}\nAlternate Mobile: ${formData.alternateMobile}\nEmail: ${formData.email}\nCity: ${formData.city}`;
    window.open(`https://wa.me/919667305557?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700" />
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
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
                <Smartphone className="w-4 h-4 text-cyan-200" />
                <span className="text-sm text-white/90 font-medium">Mobile Number Numerology</span>
              </motion.span>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.08] mb-6">
                Is Your Mobile Number{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">Working For You</span>
                  <motion.div className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-cyan-300 to-blue-400"
                    initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.8, duration: 0.6 }} />
                </span>{" "}
                or Against You?
              </h1>

              <p className="text-lg text-white/75 mb-10 leading-relaxed max-w-lg">
                Your mobile number emits a constant vibration that influences your energy, opportunities, and relationships every single day.
                Discover if your number is aligned with your destiny.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                {[
                  { icon: Star, value: "4.8", label: "Star Rating" },
                  { icon: Users, value: "5000+", label: "Numbers Analysed" },
                  { icon: Award, value: "10+", label: "Years Experience" },
                ].map((stat, i) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-cyan-200" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg leading-none">{stat.value}</div>
                      <div className="text-white/60 text-xs">{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.a href="#plans" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                className="btn-primary inline-flex items-center gap-3 text-lg px-8 py-4 rounded-2xl shadow-2xl shadow-blue-500/30">
                Get My Number Analysed
                <ArrowRight className="w-5 h-5" />
              </motion.a>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.85, rotate: 3 }} animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.4 }} className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-[2rem] blur-2xl" />
                <img src={serviceMobileNumerology} alt="Mobile Numerology" className="relative w-full max-w-md rounded-3xl shadow-2xl border-2 border-white/20" />
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Hash className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-foreground font-bold text-sm">Every Digit</div>
                    <div className="text-muted-foreground text-xs">Carries Energy</div>
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

      {/* Benefits */}
      <section className="section-padding">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">Why It Matters</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              How Your Mobile Number <span className="text-gradient-primary">Impacts You</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Your phone number is your most used number. Its vibration affects every call, message, and connection you make.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="group bg-card rounded-3xl border border-border p-7 text-center hover:shadow-2xl hover:border-primary/20 transition-all duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="section-padding bg-muted/30">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-5">What's Included</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
                Complete Mobile Number <span className="text-gradient-primary">Analysis</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Get a thorough evaluation of your mobile number and understand how each digit contributes to the overall vibration affecting your daily life.
              </p>
              <div className="space-y-4">
                {[
                  "Total number vibration breakdown",
                  "Individual digit energy analysis",
                  "Compatibility with your date of birth",
                  "Impact on career & financial growth",
                  "Relationship & communication effects",
                  "Recommendations for number optimisation",
                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground font-medium text-sm">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="bg-card rounded-3xl border border-border p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <BarChart3 className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-4">Sample Analysis Preview</h3>
                  <div className="space-y-3 mb-6">
                    {[
                      { label: "Total Vibration", value: "Number 6 — Venus Energy" },
                      { label: "Career Impact", value: "Strong growth potential" },
                      { label: "Relationship", value: "Harmonious connections" },
                      { label: "Compatibility", value: "85% aligned with DOB" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between bg-muted/50 rounded-xl px-4 py-3">
                        <span className="text-muted-foreground text-sm">{item.label}</span>
                        <span className="text-foreground text-sm font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground italic">*This is a sample preview. Actual analysis will be personalised.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="plans" className="section-padding">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">Pricing</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Choose Your <span className="text-gradient-primary">Plan</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {[
              {
                name: "Basic Analysis",
                price: formatINR(pricing.mobile.audit),
                originalPrice: formatINR(pricing.mobile.auditOriginal),
                features: ["Total Number Vibration Analysis", "Mulank & Bhagyank Compatibility", "Career & Relationship Impact", "Verbal Recommendations"],
                excluded: ["No PDF Report"],
                highlighted: false,
              },
              {
                name: "Detailed Report",
                price: formatINR(pricing.mobile.premium),
                originalPrice: formatINR(pricing.mobile.premiumOriginal),
                badge: "BEST VALUE",
                features: ["Total Number Vibration Analysis", "Mulank & Bhagyank Compatibility", "Career & Relationship Impact", "Detailed PDF Report (20+ Pages)", "Lucky Number Suggestions", "Personalised Loshu Grid Analysis", "1 Follow-up Consultation"],
                excluded: [],
                highlighted: true,
              },
            ].map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className={`relative bg-card rounded-3xl border ${plan.highlighted ? 'border-primary shadow-2xl shadow-primary/10 scale-[1.02]' : 'border-border shadow-lg'} p-8 flex flex-col`}>
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold tracking-wider">BEST VALUE</span>
                  </div>
                )}
                <h3 className="font-display text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-lg text-muted-foreground line-through">{plan.originalPrice}</span>
                </div>
                <div className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground text-sm">{f}</span>
                    </div>
                  ))}
                  {plan.excluded.map((f) => (
                    <div key={f} className="flex items-start gap-3 opacity-50">
                      <AlertTriangle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground text-sm">{f}</span>
                    </div>
                  ))}
                </div>
                <a href="#form" className={`w-full py-3.5 rounded-2xl font-semibold text-center transition-all duration-300 block ${plan.highlighted ? 'btn-primary' : 'bg-muted text-foreground hover:bg-primary/10'}`}>
                  Get Started
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section id="form" className="section-padding bg-muted/30">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">Get Started</span>
              <h2 className="font-display text-3xl font-bold text-foreground mb-3">Request Your <span className="text-gradient-primary">Analysis</span></h2>
              <p className="text-muted-foreground">Fill in your details and we'll get back to you on WhatsApp</p>
            </div>
            <form onSubmit={handleSubmit} className="bg-card rounded-3xl border border-border p-8 shadow-xl space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Full Name *</label>
                  <Input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Your full name" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Date of Birth *</label>
                  <Input required type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Mobile Number *</label>
                  <Input required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} placeholder="Number to analyse" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Alternate Mobile</label>
                  <Input value={formData.alternateMobile} onChange={e => setFormData({...formData, alternateMobile: e.target.value})} placeholder="Optional" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Email *</label>
                  <Input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="your@email.com" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">City *</label>
                  <Input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Your city" />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full py-4 rounded-2xl text-lg flex items-center justify-center gap-3">
                <Phone className="w-5 h-5" />
                Submit via WhatsApp
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">FAQs</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Frequently Asked <span className="text-gradient-primary">Questions</span></h2>
          </motion.div>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl border border-border overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left">
                  <span className="font-display font-semibold text-foreground text-sm pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <motion.div initial={false} animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                  className="overflow-hidden">
                  <p className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 bg-muted/30">
        <div className="section-container">
          <p className="text-center text-xs text-muted-foreground max-w-2xl mx-auto">
            Mobile numerology analysis is advisory in nature and is intended to provide insights based on numerological principles. 
            Results may vary. This service does not guarantee specific outcomes.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default MobileNumerology;
