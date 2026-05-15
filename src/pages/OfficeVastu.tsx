import { motion } from "framer-motion";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { 
  Building, Star, CheckCircle, Shield, 
  ArrowRight, Award, Users, ChevronDown, 
  Phone, Sparkles, Zap, MapPin, Compass,
  TrendingUp, AlertTriangle, Landmark, DoorOpen, Layout as LayoutIcon
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import serviceOfficeVastu from "@/assets/service-office-vastu.png";

const faqs = [
  {
    q: "1. What is Office Vastu?",
    a: "Office Vastu is the application of Vastu Shastra principles to your workplace to harmonise the energy flow, supporting productivity, growth, and positive business outcomes."
  },
  {
    q: "2. Can Vastu really impact my business?",
    a: "Yes. The spatial arrangement, directions, and placements in your office create energy patterns that can either support or hinder your business activities and employee well-being."
  },
  {
    q: "3. Do I need to renovate my office?",
    a: "Not necessarily. Many Vastu corrections are non-structural—simple adjustments like rearranging furniture, adding specific elements, or using colour corrections can make a significant difference."
  },
  {
    q: "4. What information do you need for the consultation?",
    a: "We require your office layout/floor plan, the direction your office faces, photographs of key areas, and details about any specific challenges you're experiencing."
  },
  {
    q: "5. Is this service available for home offices?",
    a: "Yes, we provide Vastu guidance for home offices, co-working spaces, shops, factories, and traditional office setups."
  },
  {
    q: "6. How long does the consultation take?",
    a: "The initial analysis and report are typically delivered within 3–5 business days. Follow-up consultations are scheduled as needed."
  },
  {
    q: "7. Can Vastu help with employee retention and morale?",
    a: "Absolutely. Proper Vastu alignment creates a harmonious workspace that positively affects employee satisfaction, focus, and overall workplace energy."
  },
  {
    q: "8. Do you offer on-site visits?",
    a: "Yes, on-site visits are available for comprehensive consultations. Remote analysis via floor plans and photos is also effective for most cases."
  },
];

const issues = [
  { icon: TrendingUp, title: "Business Not Growing?", desc: "Stagnant revenue despite efforts could indicate Vastu imbalances blocking growth energy." },
  { icon: Users, title: "High Employee Turnover?", desc: "Workspace energy affects retention. Vastu corrections can create a more supportive environment." },
  { icon: Zap, title: "Constant Conflicts?", desc: "Frequent disagreements or negativity in the office often trace back to directional imbalances." },
  { icon: Shield, title: "Financial Leakages?", desc: "Unexpected expenses or cash flow issues may relate to placement of financial zones in your office." },
];

const OfficeVastu = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    mobile: "",
    email: "",
    city: "",
    officeAddress: "",
    concerns: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Office Vastu Consultation Request:\nName: ${formData.fullName}\nBusiness: ${formData.businessName}\nMobile: ${formData.mobile}\nEmail: ${formData.email}\nCity: ${formData.city}\nOffice Address: ${formData.officeAddress}\nConcerns: ${formData.concerns}`;
    window.open(`https://wa.me/919667305557?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-gray-700 to-zinc-800" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1)_0%,_transparent_60%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_rgba(0,0,0,0.3)_0%,_transparent_60%)]" />
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
                <Building className="w-4 h-4 text-amber-200" />
                <span className="text-sm text-white/90 font-medium">Office Vastu Consultation</span>
              </motion.span>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.08] mb-6">
                Transform Your Workspace with{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-amber-200 to-orange-200 bg-clip-text text-transparent">Vastu Energy</span>
                  <motion.div className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-amber-300 to-orange-400"
                    initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.8, duration: 0.6 }} />
                </span>
              </h1>

              <p className="text-lg text-white/75 mb-10 leading-relaxed max-w-lg">
                Your office space holds the key to business growth, team harmony, and financial stability. 
                Align your workspace with Vastu principles for measurable positive change.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                {[
                  { icon: Star, value: "4.9", label: "Star Rating" },
                  { icon: Landmark, value: "500+", label: "Offices Aligned" },
                  { icon: Award, value: "10+", label: "Years Experience" },
                ].map((stat, i) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10">
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

              <motion.a href="#plans" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                className="btn-primary inline-flex items-center gap-3 text-lg px-8 py-4 rounded-2xl shadow-2xl shadow-orange-500/30">
                Get Vastu Consultation
                <ArrowRight className="w-5 h-5" />
              </motion.a>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.85, rotate: 3 }} animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.4 }} className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-[2rem] blur-2xl" />
                <img src={serviceOfficeVastu} alt="Office Vastu" className="relative w-full max-w-md rounded-3xl shadow-2xl border-2 border-white/20" />
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Compass className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-foreground font-bold text-sm">Direction Matters</div>
                    <div className="text-muted-foreground text-xs">Energy Alignment</div>
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

      {/* Common Issues */}
      <section className="section-padding">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">Signs You Need Vastu</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Is Your Office Energy <span className="text-gradient-primary">Working Against You?</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">These common workplace challenges often have roots in Vastu imbalances that can be corrected.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {issues.map((item, i) => (
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

      {/* What We Cover */}
      <section className="section-padding bg-muted/30">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-5">Consultation Covers</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
                Comprehensive Vastu <span className="text-gradient-primary">Evaluation</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Every corner, direction, and element in your office is evaluated to create a workspace that supports your business goals.
              </p>
              <div className="space-y-4">
                {[
                  "Entrance & reception area alignment",
                  "Boss/owner cabin direction optimisation",
                  "Employee seating arrangement",
                  "Financial zone & cash register placement",
                  "Colour & element corrections",
                  "Kitchen/pantry & washroom placement",
                  "Remedies without structural changes",
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
                    <LayoutIcon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-4">Key Vastu Zones</h3>
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {[
                      { dir: "NW", label: "Air", color: "bg-blue-50 text-blue-600 border-blue-200" },
                      { dir: "N", label: "Water", color: "bg-cyan-50 text-cyan-600 border-cyan-200" },
                      { dir: "NE", label: "Spirit", color: "bg-violet-50 text-violet-600 border-violet-200" },
                      { dir: "W", label: "Space", color: "bg-gray-50 text-gray-600 border-gray-200" },
                      { dir: "C", label: "Brahma", color: "bg-amber-50 text-amber-600 border-amber-200" },
                      { dir: "E", label: "Sun", color: "bg-orange-50 text-orange-600 border-orange-200" },
                      { dir: "SW", label: "Earth", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
                      { dir: "S", label: "Fire", color: "bg-red-50 text-red-600 border-red-200" },
                      { dir: "SE", label: "Agni", color: "bg-rose-50 text-rose-600 border-rose-200" },
                    ].map((zone) => (
                      <div key={zone.dir} className={`${zone.color} border rounded-xl p-3 text-center`}>
                        <div className="font-bold text-xs">{zone.dir}</div>
                        <div className="text-[10px] opacity-75">{zone.label}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground italic">*Each zone governs specific aspects of your business. Misalignment in any zone can create challenges.</p>
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
                name: "Remote Consultation",
                price: formatINR(pricing.vastu.officeRemote),
                originalPrice: formatINR(pricing.vastu.officeRemote * 2),
                features: ["Floor Plan Analysis", "Directional Assessment", "Seating Arrangement Guide", "Colour & Element Recommendations", "Detailed PDF Report", "1 Follow-up Call"],
                excluded: ["No On-Site Visit"],
                highlighted: false,
              },
              {
                name: "On-Site Consultation",
                price: formatINR(pricing.vastu.officeOnsite),
                originalPrice: formatINR(Math.round(pricing.vastu.officeOnsite * 1.9)),
                badge: "COMPREHENSIVE",
                features: ["Personal Office Visit", "Complete Directional Analysis", "Zone-Wise Evaluation", "Employee Seating Optimisation", "Detailed Report (50+ Pages)", "Non-Structural Remedies", "3 Follow-up Consultations", "Priority WhatsApp Support (1 Month)"],
                excluded: [],
                highlighted: true,
              },
            ].map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className={`relative bg-card rounded-3xl border ${plan.highlighted ? 'border-primary shadow-2xl shadow-primary/10 scale-[1.02]' : 'border-border shadow-lg'} p-8 flex flex-col`}>
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold tracking-wider">COMPREHENSIVE</span>
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
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">Book Now</span>
              <h2 className="font-display text-3xl font-bold text-foreground mb-3">Request Your <span className="text-gradient-primary">Consultation</span></h2>
              <p className="text-muted-foreground">Fill in your details and we'll connect with you on WhatsApp</p>
            </div>
            <form onSubmit={handleSubmit} className="bg-card rounded-3xl border border-border p-8 shadow-xl space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Full Name *</label>
                  <Input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Your full name" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Business Name *</label>
                  <Input required value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} placeholder="Company/Business name" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Mobile Number *</label>
                  <Input required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} placeholder="Your mobile number" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Email *</label>
                  <Input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="your@email.com" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">City *</label>
                  <Input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Your city" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Office Address</label>
                  <Input value={formData.officeAddress} onChange={e => setFormData({...formData, officeAddress: e.target.value})} placeholder="Office address" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Specific Concerns</label>
                <Textarea value={formData.concerns} onChange={e => setFormData({...formData, concerns: e.target.value})} placeholder="Describe any specific issues or concerns..." rows={3} />
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
            Vastu consultation is advisory in nature and provides guidance based on traditional Vastu Shastra principles. 
            Results may vary based on implementation and other factors. This service does not guarantee specific business outcomes.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default OfficeVastu;
