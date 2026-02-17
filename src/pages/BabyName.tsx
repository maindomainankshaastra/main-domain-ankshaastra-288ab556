import { motion } from "framer-motion";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Baby, ArrowRight, CheckCircle, Star, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import serviceBabyName from "@/assets/service-baby-name.png";

const plan = {
  name: "Perfect Baby Name",
  price: "₹1,987",
  originalPrice: "₹5,100",
  features: [
    "2 Baby Name Options (As per Numerology)",
    "Mulank & Bhagyank Analysis",
    "50+ Page PDF Report",
    "Name Alphabet Analysis (Vedic)",
    "Personalised Loshu Grid Analysis",
  ],
};

const BabyName = () => {
  const [formData, setFormData] = useState({
    parentName: "",
    kidDob: "",
    kidGender: "",
    city: "",
    email: "",
    mobile: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Perfect Baby Name Request:\nParent Name: ${formData.parentName}\nKid's DOB: ${formData.kidDob}\nGender: ${formData.kidGender}\nCity: ${formData.city}\nEmail: ${formData.email}\nMobile: ${formData.mobile}`;
    window.open(`https://wa.me/919667305557?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="section-container relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-6">
                <Heart className="w-4 h-4 text-amber-200" />
                <span className="text-sm text-white font-medium">Perfect Baby Name</span>
              </span>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
                The Perfect Baby Name Can Bring{" "}
                <span className="text-gradient-amber">Everything Back in Tune</span>
              </h1>
              <p className="text-lg text-white/80 mb-8 leading-relaxed max-w-lg">
                A numerology-aligned name lays a strong foundation for your child's identity, confidence, and future success.
              </p>
              <a href="#form" className="btn-primary inline-flex items-center gap-2 text-lg">
                Get Baby Name Now <ArrowRight className="w-5 h-5" />
              </a>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="hidden lg:block">
              <img src={serviceBabyName} alt="Perfect Baby Name" className="w-full max-w-md mx-auto rounded-3xl shadow-2xl border-4 border-white/20" />
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Pricing */}
      <section className="section-padding">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-lg mx-auto">
            <div className="relative bg-card rounded-2xl border border-primary shadow-lg shadow-primary/10 p-8 text-center">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                BEST VALUE
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center gap-2 mb-6">
                <span className="text-4xl font-bold text-primary">{plan.price}</span>
                <span className="text-muted-foreground line-through">{plan.originalPrice}</span>
              </div>
              <ul className="space-y-3 mb-8 text-left">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#form" className="btn-primary w-full inline-flex items-center justify-center gap-2 py-3">
                Order Now <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Intake Form */}
      <section id="form" className="section-padding bg-muted/30">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Get the <span className="text-gradient-primary">Perfect Baby Name</span>
              </h2>
              <p className="text-muted-foreground">Share your details and we'll craft the perfect name.</p>
            </div>
            <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-8 shadow-lg space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Parent's Full Name *</label>
                  <Input required value={formData.parentName} onChange={(e) => setFormData({...formData, parentName: e.target.value})} placeholder="Enter full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Kid's Date of Birth *</label>
                  <Input required type="date" value={formData.kidDob} onChange={(e) => setFormData({...formData, kidDob: e.target.value})} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Kid's Gender *</label>
                  <select required value={formData.kidGender} onChange={(e) => setFormData({...formData, kidGender: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">City *</label>
                  <Input required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} placeholder="Your city" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email ID *</label>
                  <Input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Mobile Number *</label>
                  <Input required type="tel" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} placeholder="+91 XXXXX XXXXX" />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2">
                Submit & Connect on WhatsApp <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default BabyName;
