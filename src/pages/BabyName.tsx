import { motion } from "framer-motion";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { 
  Baby, ArrowRight, CheckCircle, Star, Heart, Sparkles, 
  Mail, Clock, FileText, Shield, Users, Award, ChevronRight,
  Quote
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import serviceBabyName from "@/assets/service-baby-name.png";

const plan = {
  name: "Perfect Baby Name Report",
  price: "₹1,997",
  originalPrice: "₹5,100",
  features: [
    "2 Baby Name Options (As per Numerology)",
    "Mulank & Bhagyank Analysis",
    "50+ Page PDF Report",
    "Name Alphabet Analysis (Vedic)",
    "Personalised Loshu Grid Analysis",
  ],
};

const forYouIfItems = [
  "Your business is running but growth feels inconsistent",
  "Branding efforts are high but results are unpredictable",
  "You're launching a new brand or startup",
  "You run a business and want better branding energy",
  "You want a name that supports scale and stability",
];

const reportHighlights = [
  "3 meaningful, well-aligned name options",
  "Clear explanation with each suggestion",
  "Simple, easy-to-understand report",
];

const testimonials = [
  {
    name: "Priya & Rajan",
    location: "Mumbai",
    text: "We were confused between so many names. The report gave us clarity and confidence. Our baby's name feels just right!",
    rating: 5,
  },
  {
    name: "Sneha Gupta",
    location: "Delhi",
    text: "Himansshu Ji's analysis was so thorough. The 50+ page report was beyond our expectations. Highly recommended!",
    rating: 5,
  },
  {
    name: "Amit & Kavita",
    location: "Bangalore",
    text: "We didn't know numerology could be so insightful for naming. The name suggestions perfectly aligned with our baby's birth details.",
    rating: 5,
  },
];

const faqs = [
  {
    q: "Is This an Instant Automated Report?",
    a: "No, your Baby Name Numerology Report is not an instant, automated report. Each report is crafted specifically for your child based on the information you provide.",
  },
  {
    q: "How and When Will I Receive My Report?",
    a: "Your personalised Baby Name Numerology Report will be delivered to your email address within 3 business days following your purchase. Be sure to check your inbox's spam and promotions folders in case the report lands there.",
  },
  {
    q: "What is the Report Language?",
    a: "Your Baby Name Numerology Report will be delivered in English.",
  },
  {
    q: "What if I'm not familiar with numerology?",
    a: "Our reports are designed to be user-friendly, even for those new to numerology. Each report includes clear explanations of the numerological concepts used. Additionally, you can find resources on our website to learn more about numerology and its principles.",
  },
  {
    q: "Is numerology a reliable method for selecting a baby's name?",
    a: "Numerology is a popular, ancient and respected method for selecting a baby's name. While its reliability may vary depending on individual beliefs, many parents find it helpful in providing insight into their child's personality traits and potential.",
  },
  {
    q: "Can I get a refund on the report?",
    a: "Unfortunately, due to the personalised nature of the reports, we don't offer refunds once the report has been delivered to your email address / WhatsApp.",
  },
  {
    q: "Are there specific numerological techniques used to analyze baby names?",
    a: "Yes, numerological techniques used to analyze baby names include calculating the Life Path Number, Destiny Number, and Compound Number based on the numerical values of letters in the name. These calculations help determine the name's compatibility with the child's energy.",
  },
  {
    q: "How does numerology influence baby names?",
    a: "Numerology assigns numerical values to each letter in a name, influencing its energy and significance. When choosing a baby name, parents often consider these numerical vibrations to align with their child's potential.",
  },
  {
    q: "What are the key factors considered in a baby name report based on numerology?",
    a: "Baby name report by Himansshu Agarwal Ji, based on numerology considers factors such as the numerical value of each letter in the name, overall numerical vibration, and alignment with the baby's birth date and destiny number.",
  },
  {
    q: "What is the significance of numerology in choosing a baby's name?",
    a: "Numerology is significant as it provides insights into a child's potential, personality traits, and life path through their name's numerical vibrations. Understanding these influences can help parents select a name that resonates positively with their baby's essence.",
  },
];

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
      <SEOHead title="Perfect Baby Name Numerology Report" description="Get a personalized baby name report crafted by Himansshu Agarwal Ji using numerology and vedic principles. 3 name options aligned with your child's birth chart." canonical="/services/baby-name" />
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 overflow-hidden">
          <motion.div animate={{ y: [0, -20, 0], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-10 right-[15%] w-96 h-96 rounded-full bg-amber-300/10 blur-3xl" />
          <motion.div animate={{ y: [0, 15, 0], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 10, repeat: Infinity }} className="absolute bottom-20 left-[10%] w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="section-container relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-6">
                <Heart className="w-4 h-4 text-amber-200" />
                <span className="text-sm text-white font-medium">Perfect Baby Name</span>
              </span>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
                Because a Name Is the{" "}
                <span className="text-gradient-amber">First Gift</span>{" "}
                You Give Your Child
              </h1>
              <p className="text-lg text-white/80 mb-4 leading-relaxed max-w-lg">
                Choose a name that grows with your child — crafted using numerology principles, vedic principles and your baby's birth details.
              </p>
              <p className="text-base text-white/60 mb-8 italic">
                Personalised Baby Name Report by Himansshu Agarwal Ji
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                {reportHighlights.map((h) => (
                  <span key={h} className="inline-flex items-center gap-2 text-sm text-white/90">
                    <CheckCircle className="w-4 h-4 text-amber-300 flex-shrink-0" />
                    {h}
                  </span>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <a href="#form" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
                  Empower My Child Now <ArrowRight className="w-5 h-5" />
                </a>
              </div>
              {/* Trust Stats */}
              <div className="flex flex-wrap gap-6 mt-8">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <span className="text-white/80 text-sm">4.9 Star Rating</span>
                </div>
                <div className="text-white/80 text-sm">Over 99% Parents Felt Confident</div>
                <div className="text-white/80 text-sm">100% Reliable Results</div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="hidden lg:block">
              <div className="relative">
                <img src={serviceBabyName} alt="Perfect Baby Name" className="w-full max-w-md mx-auto rounded-3xl shadow-2xl border-4 border-white/20" />
                <div className="absolute -bottom-4 -right-4 bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-xl">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Trusted by</p>
                      <p className="font-bold text-foreground text-sm">1000+ Families</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -left-4 bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-xl">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">₹1,997</p>
                    <p className="text-xs text-muted-foreground line-through">₹5,100</p>
                  </div>
                </div>
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

      {/* More Than Just a Beautiful Name */}
      <section className="section-padding">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">Unlock Your Baby's Potential</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                More Than Just a <span className="text-gradient-primary">Beautiful Name</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Every child is unique. Numerology helps identify names that resonate with your baby's natural tendencies, supporting harmony, confidence, and a positive foundation for the future.
              </p>
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-xl p-5 border border-border">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Struggling to Choose the Perfect Baby Name?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    With countless baby names out there, choosing the "perfect" one can be overwhelming. Our report provides a clear path, reducing decision fatigue. It helps you narrow down your options based on numerological compatibility.
                  </p>
                </div>
                <div className="bg-muted/50 rounded-xl p-5 border border-border">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Feeling Unsure About Name Compatibility?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Worried about your chosen name clashing with your child's birthdate or numerological chart? Our report can identify potential conflicts and suggest alternatives that harmonize with their inner essence.
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
                <h3 className="font-display text-xl font-bold text-foreground mb-6">Thousands of Happy Parents</h3>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="text-center p-4 bg-primary/5 rounded-xl">
                    <p className="text-3xl font-bold text-primary">1000+</p>
                    <p className="text-sm text-muted-foreground">Families Served</p>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-xl">
                    <div className="flex justify-center mb-1">
                      {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="text-sm text-muted-foreground">4.9 Star Rating</p>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-xl">
                    <p className="text-3xl font-bold text-primary">99%</p>
                    <p className="text-sm text-muted-foreground">Parents Confident</p>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-xl">
                    <p className="text-3xl font-bold text-primary">100%</p>
                    <p className="text-sm text-muted-foreground">Reliable Results</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic text-center">
                  Join the growing community of parents who have taken a conscious step toward strategic name alignment with numerology.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Who Should Consider */}
      <section className="section-padding bg-muted/30">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">Is This For You?</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Who Should Consider a <span className="text-gradient-primary">Baby Name Report?</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The perfect baby name can bring everything back in tune
            </p>
          </motion.div>
          <div className="max-w-3xl mx-auto">
            <div className="grid sm:grid-cols-2 gap-4">
              {forYouIfItems.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3 bg-card rounded-xl border border-border p-5 hover:border-primary/30 hover:shadow-md transition-all">
                  <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground text-sm">{item}</span>
                </motion.div>
              ))}
            </div>
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-6 text-center">
              <div className="bg-card rounded-xl border border-border p-5 inline-flex items-start gap-3 hover:border-primary/30 transition-all">
                <Baby className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground text-sm">Thinking about changing your child's name? Our report makes it a breeze to find a name that matches their potential and boosts their development.</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">Testimonials</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Their Words Say <span className="text-gradient-primary">It All</span>
            </h2>
            <p className="text-muted-foreground">Trusted by Parents Seeking Clarity</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:border-primary/20 transition-all">
                <Quote className="w-8 h-8 text-primary/20 mb-4" />
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-1 mb-3">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Himansshu Agarwal Ji */}
      <section className="section-padding bg-muted/30">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">Your Guide</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                About <span className="text-gradient-primary">Himansshu Agarwal Ji</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Himansshu Agarwal Ji is a widely recognised Name Correction Expert and Lal Kitab Remedy Specialist, with over 10 years of dedicated research and practical experience in name vibration patterns, brand failure case studies, and corrective Lal Kitab remedies.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg border border-border">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="text-sm text-foreground">10+ Years Experience</span>
                </div>
                <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg border border-border">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-sm text-foreground">5000+ Corrections</span>
                </div>
                <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg border border-border">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="text-sm text-foreground">Lal Kitab Specialist</span>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              {/* Pricing Card */}
              <div className="relative bg-card rounded-2xl border border-primary shadow-lg shadow-primary/10 p-8 text-center">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold tracking-wide">
                  BEST VALUE
                </div>
                <Baby className="w-14 h-14 text-primary mx-auto mb-4" />
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-2 mb-1">
                  <span className="text-4xl font-bold text-primary">{plan.price}</span>
                  <span className="text-muted-foreground line-through">{plan.originalPrice}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">50+ page detailed PDF report</p>
                <ul className="space-y-3 mb-8 text-left">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-center gap-1 mb-6">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
                  <span className="text-sm text-muted-foreground ml-2">4.9/5 rating</span>
                </div>
                <a href="#form" className="btn-primary w-full inline-flex items-center justify-center gap-2 py-4 text-lg">
                  Claim Your Report <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Embark Section */}
      <section className="section-padding">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Embark on a <span className="text-gradient-primary">New Beginning</span> with Numerology!
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              Thinking about changing your child's name? Our report makes it a breeze to find a name that matches their potential and boosts their development. It's all about starting anew, guided by the magic of numerology!
            </p>
            <p className="text-muted-foreground mb-8">
              Over <strong className="text-foreground">1000+ Families</strong> have taken this conscious step toward better name alignment.
            </p>
            <a href="#form" className="btn-primary inline-flex items-center gap-2 text-lg px-10 py-4">
              Empower My Child Now <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section-padding bg-muted/30">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">FAQs</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked <span className="text-gradient-primary">Questions</span>
            </h2>
          </motion.div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="bg-card rounded-xl border border-border px-6 overflow-hidden">
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Intake Form */}
      <section id="form" className="section-padding">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">Get Started</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Claim Your <span className="text-gradient-primary">Baby Name Report</span>
              </h2>
              <p className="text-muted-foreground">Share your details and we'll craft the perfect name for your child.</p>
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
              <p className="text-xs text-muted-foreground text-center">
                Now at <strong>₹1,987/-</strong> • Report delivered within 3 business days
              </p>
            </form>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default BabyName;
