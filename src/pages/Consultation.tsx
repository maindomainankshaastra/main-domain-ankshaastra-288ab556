import { motion } from "framer-motion";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import {
  Phone, Video, ArrowRight, CheckCircle, Shield, Clock, Award, Users,
  Heart, Briefcase, TrendingUp, Baby, Brain, Sparkles, ChevronRight,
  Mail, FileText, AlertCircle
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const consultationAreas = [
  {
    icon: Briefcase,
    title: "Career & Professional Direction",
    desc: "Feeling stuck despite effort often signals misalignment, not lack of ability. Numerology analysis helps identify strengths, suitable career paths, and supportive timing, enabling clearer professional decisions and steady, purpose-driven growth.",
  },
  {
    icon: TrendingUp,
    title: "Business & Growth Alignment",
    desc: "Inconsistent results despite effort indicate misalignment. Business numerology aligns names, numbers, pricing, and timing, helping entrepreneurs reduce friction, clarify strategy, and support consistent, balanced growth.",
  },
  {
    icon: Heart,
    title: "Love & Relationships",
    desc: "Repeated misunderstandings or emotional distance arise from compatibility gaps. Numerology reveals emotional patterns and dynamics, helping individuals improve understanding, communication, and balance, allowing relationships to progress with clarity, awareness, and emotional stability.",
  },
  {
    icon: Users,
    title: "Marriage & Compatibility",
    desc: "Marriage delays or uncertainty often stem from timing or compatibility mismatches. Numerology assesses readiness and alignment, enabling informed decisions and helping individuals approach commitment with clarity, confidence, and emotional preparedness.",
  },
  {
    icon: Brain,
    title: "Health & Mental Well-Being",
    desc: "Persistent stress or imbalance often reflects deeper energetic patterns. Numerology highlights mental and lifestyle tendencies, helping individuals recognize corrective areas, adopt calmer choices, and support emotional stability and overall well-being.",
  },
  {
    icon: Baby,
    title: "Child & Future Planning",
    desc: "Early numerological planning supports a balanced foundation. Name alignment and birth-timing analysis help parents understand tendencies, enabling thoughtful decisions that encourage harmony, stability, and long-term development.",
  },
];

const callSteps = [
  {
    num: "1",
    title: "Understanding the Core Issue",
    desc: "A detailed conversation to understand your concerns, background, and current challenges. This call focuses on listening, identifying patterns, and gathering all necessary information for accurate analysis.",
  },
  {
    num: "2",
    title: "Questions & Deep Clarity",
    desc: "This session is dedicated to your specific questions. You will be asked multiple questions depending on your chart readings and planet placements to understand the core issues basis your lal kitab kundali.",
  },
  {
    num: "3",
    title: "Remedies & Implementation",
    desc: "The final call explains recommended remedies and corrective measures in detail. You receive clear instructions on application, timelines, and practical integration, ensuring remedies are understood and applied correctly.",
  },
];

const audioPricing = [
  { duration: "45 Minutes", price: "₹1,987" },
  { duration: "60 Minutes", price: "₹2,496" },
  { duration: "75 Minutes", price: "₹3,108" },
];

const videoPricing = [
  { duration: "45 Minutes", price: "₹3,648" },
  { duration: "60 Minutes", price: "₹4,297" },
  { duration: "75 Minutes", price: "₹4,986" },
];

const importantNotes = [
  "Once your consultation is booked, you will be allotted the next available slot.",
  "In case of any rescheduling due to Himansshu Agarwal Ji's pre-committed schedule, your appointment will be treated as a priority and reassigned to the earliest possible alternative slot.",
  "The details shared at the time of booking will be considered final and no change will be entertained later in any circumstances. Please make sure to fill the correct details.",
  "All consultation calls are scheduled only after successful payment.",
  "Every Call is Followed by Written Remedies Shared With You Over Email / WhatsApp.",
  "This is a one-time consultation service with 3 Step Call Consultation Structure.",
  "Once the consultation is booked and completed, no refunds or cancellations will be applicable under any circumstances.",
];

const faqs = [
  {
    q: "Will Himansshu Agarwal Ji personally listen to my concerns and guide me?",
    a: "Yes. Every consultation—audio or video—is conducted personally by Himansshu Agarwal Ji. There is no team member or intermediary involved.",
  },
  {
    q: "Can I discuss multiple topics in a single consultation?",
    a: "Yes. You may discuss multiple related concerns within the booked duration. However, the depth of discussion will depend on the selected time slot.",
  },
  {
    q: "Will remedies be shared during the consultation?",
    a: "Yes. Remedies and corrective guidance are shared after proper analysis, following the structured consultation process. Remedies are explained clearly, along with their purpose and method of implementation.",
  },
  {
    q: "Will my personal data and discussion remain confidential?",
    a: "Absolutely. All consultations are strictly confidential. Your personal information, charts, and discussions are never shared or disclosed.",
  },
  {
    q: "What is the 3-Step Consultation Structure?",
    a: "Every consultation with Himansshu Agarwal Ji follows a structured three-step call process, ensuring clarity, depth, and proper implementation.\n\nCall 1 – Understanding the Core Issue: A detailed conversation to understand your concerns, background, and current challenges.\n\nCall 2 – Questions & Deep Clarity: Dedicated to your specific questions based on chart readings and planet placements.\n\nCall 3 – Remedies & Implementation: Clear instructions on application, timelines, and practical integration.",
  },
  {
    q: "Can I book this for someone else?",
    a: "Yes, but one chart per session. Please share correct birth details at booking.",
  },
];

const trustPoints = [
  "Highly Confidential",
  "Practical & Experience-Based Guidance",
  "No Guesswork • No Fear-Based Advice",
  "3-Call Consultation Structure",
  "Low Cost Written Remedies Included",
];

const ConsultationPage = () => {
  const [mode, setMode] = useState<"audio" | "video">("audio");

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 overflow-hidden">
          <motion.div animate={{ y: [0, -25, 0], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-10 right-[10%] w-96 h-96 rounded-full bg-amber-300/10 blur-3xl" />
          <motion.div animate={{ y: [0, 20, 0], opacity: [0.1, 0.25, 0.1] }} transition={{ duration: 10, repeat: Infinity }} className="absolute bottom-20 left-[5%] w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="section-container relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-6">
                <Phone className="w-4 h-4 text-amber-200" />
                <span className="text-sm text-white font-medium">1:1 Consultation</span>
              </span>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
                One Honest Conversation{" "}
                <span className="text-gradient-amber">Can Bring Absolute Clarity.</span>
              </h1>
              <p className="text-lg text-white/80 mb-6 leading-relaxed max-w-lg">
                Speak directly with Himansshu Agarwal Ji for a deeply personalised one-to-one lal kitab consultation.
              </p>
              <p className="text-base text-amber-200/90 font-semibold mb-8">
                Consultation Investment: Starting at ₹1,987/-
              </p>

              {/* Trust Points */}
              <div className="space-y-2.5 mb-8">
                {trustPoints.map((point) => (
                  <div key={point} className="flex items-center gap-2.5 text-white/85 text-sm">
                    <CheckCircle className="w-4 h-4 text-amber-300 flex-shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#pricing" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
                  Book Audio Consultation <ArrowRight className="w-5 h-5" />
                </a>
                <a href="#pricing" className="inline-flex items-center gap-2 text-lg px-8 py-4 rounded-xl border-2 border-white/20 text-white hover:bg-white/10 transition-all font-semibold">
                  Book Video Consultation
                </a>
              </div>
            </motion.div>

            {/* Stats Card */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/15 p-10 space-y-8">
                <div className="text-center">
                  <h3 className="font-display text-2xl font-bold text-white mb-2">Why Parents & Professionals Trust Us</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-5 bg-white/5 rounded-2xl border border-white/10">
                    <Award className="w-8 h-8 text-amber-300 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">10+</p>
                    <p className="text-xs text-white/60">Years of Legacy</p>
                  </div>
                  <div className="text-center p-5 bg-white/5 rounded-2xl border border-white/10">
                    <Users className="w-8 h-8 text-amber-300 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">5000+</p>
                    <p className="text-xs text-white/60">Consultations Done</p>
                  </div>
                  <div className="text-center p-5 bg-white/5 rounded-2xl border border-white/10">
                    <Sparkles className="w-8 h-8 text-amber-300 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">4.9/5</p>
                    <p className="text-xs text-white/60">Average Rating</p>
                  </div>
                  <div className="text-center p-5 bg-white/5 rounded-2xl border border-white/10">
                    <Shield className="w-8 h-8 text-amber-300 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">100%</p>
                    <p className="text-xs text-white/60">Confidential</p>
                  </div>
                </div>
                <p className="text-center text-white/50 text-sm italic">
                  The right guidance, at the right moment, can change your direction.
                </p>
                <div className="text-center">
                  <span className="text-amber-200 text-sm">👉 Limited slots available</span>
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

      {/* Select What Resonates */}
      <section className="section-padding">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">Select What Resonates With You</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              The right guidance, at the right moment, <span className="text-gradient-primary">can change your direction.</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {consultationAreas.map((area, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-card rounded-2xl border border-border p-7 hover:shadow-xl hover:border-primary/30 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <area.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-3">{area.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{area.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3-Call Structure */}
      <section className="section-padding bg-muted/30">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              🔄 3-Call Consultation Structure
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Structured for <span className="text-gradient-primary">Clarity & Depth</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every consultation with Himansshu Agarwal Ji follows a structured three-step call process, ensuring clarity, depth, and proper implementation.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {callSteps.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="relative">
                <div className="bg-card rounded-2xl border border-border p-8 text-center hover:shadow-lg hover:border-primary/30 transition-all h-full">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 border-2 border-primary/20">
                    <span className="font-display text-2xl font-bold text-primary">{step.num}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-3">Call {step.num} – {step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 z-10">
                    <ChevronRight className="w-8 h-8 text-primary/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing with Toggle */}
      <section id="pricing" className="section-padding">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">Choose Your Mode</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Book Your <span className="text-gradient-primary">Consultation</span>
            </h2>
            {/* Toggle */}
            <div className="inline-flex items-center bg-muted rounded-xl p-1.5 border border-border">
              <button onClick={() => setMode("audio")}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all ${mode === "audio" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}>
                <Phone className="w-4 h-4" /> Audio Call
              </button>
              <button onClick={() => setMode("video")}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all ${mode === "video" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}>
                <Video className="w-4 h-4" /> Video Call
              </button>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {(mode === "audio" ? audioPricing : videoPricing).map((tier, i) => (
              <motion.div key={`${mode}-${i}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className={`relative bg-card rounded-2xl border p-8 text-center transition-all hover:shadow-xl ${i === 1 ? "border-primary shadow-lg shadow-primary/10 scale-[1.03]" : "border-border"}`}>
                {i === 1 && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    POPULAR
                  </div>
                )}
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  {mode === "audio" ? <Phone className="w-6 h-6 text-primary" /> : <Video className="w-6 h-6 text-primary" />}
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-1">{mode === "audio" ? "Audio" : "Video"} Call</h3>
                <p className="text-sm text-muted-foreground mb-4">{tier.duration}</p>
                <p className="text-3xl font-bold text-primary mb-6">{tier.price}</p>
                <ul className="space-y-2.5 text-left mb-6">
                  <li className="flex items-start gap-2 text-sm"><CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /><span className="text-foreground">Personal session with Himansshu Ji</span></li>
                  <li className="flex items-start gap-2 text-sm"><CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /><span className="text-foreground">3-Call structured process</span></li>
                  <li className="flex items-start gap-2 text-sm"><CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /><span className="text-foreground">Written remedies via Email/WhatsApp</span></li>
                  <li className="flex items-start gap-2 text-sm"><CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /><span className="text-foreground">Lal Kitab remedies included</span></li>
                </ul>
                <Link to={`/payment?type=${mode}`} className="btn-primary w-full inline-flex items-center justify-center gap-2 py-3.5">
                  Book Now <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="section-padding bg-muted/30">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="w-6 h-6 text-primary" />
                <h2 className="font-display text-2xl font-bold text-foreground">Important Notes</h2>
              </div>
              <div className="bg-card rounded-2xl border border-border p-8 space-y-4">
                {importantNotes.map((note, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-muted-foreground text-sm leading-relaxed">{note}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section-padding">
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
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5 whitespace-pre-line">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-muted/30">
        <div className="section-container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready for <span className="text-gradient-primary">Absolute Clarity?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Choose your preferred consultation mode and take the first step toward aligned, purpose-driven decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#pricing" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
                <Phone className="w-5 h-5" /> Book Audio Call
              </a>
              <a href="#pricing" className="inline-flex items-center gap-2 text-lg px-8 py-4 rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all font-semibold">
                <Video className="w-5 h-5" /> Book Video Call
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ConsultationPage;
