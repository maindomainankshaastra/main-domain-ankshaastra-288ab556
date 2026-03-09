import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Sparkles, ScrollText, Heart, Gem, Star,
  Crown, Building, Smartphone, ArrowRight
} from "lucide-react";

import serviceNameCorrection from "@/assets/service-name-correction.png";
import serviceBabyName from "@/assets/service-baby-name.png";
import serviceBusinessNumerology from "@/assets/service-business-numerology.png";
import serviceCsectionDates from "@/assets/service-csection-dates.png";
import serviceOfficeVastu from "@/assets/service-office-vastu.png";
import serviceMobileNumerology from "@/assets/service-mobile-numerology.png";
import serviceCallConsultation from "@/assets/service-call-consultation.png";
import serviceVarshphalReport from "@/assets/service-varshphal-report.png";
import BusinessNumerologyModal from "./BusinessNumerologyModal";

const services = [
  {
    icon: Sparkles,
    title: "Call Consultation",
    link: "/consultation",
    accent: "from-amber to-primary",
    image: serviceCallConsultation,
  },
  {
    icon: ScrollText,
    title: "Name Correction",
    link: "https://empower.ankshaastra.com",
    external: true,
    accent: "from-violet-500 to-purple-600",
    image: serviceNameCorrection,
  },
  {
    icon: Heart,
    title: "Perfect Baby Name",
    link: "https://empower.ankshaastra.com",
    external: true,
    accent: "from-rose-500 to-pink-600",
    image: serviceBabyName,
  },
  {
    icon: Gem,
    title: "Business Numerology",
    link: "#",
    action: "business-modal",
    accent: "from-emerald to-teal-600",
    image: serviceBusinessNumerology,
  },
  {
    icon: Star,
    title: "C-Section Dates",
    link: "/services/csection-dates",
    accent: "from-blue-500 to-indigo-600",
    image: serviceCsectionDates,
  },
  {
    icon: Crown,
    title: "Varshphal Report 2026",
    link: "/services/varshphal-report",
    accent: "from-amber to-orange",
    image: serviceVarshphalReport,
  },
  {
    icon: Building,
    title: "Office Vastu",
    link: "/services/office-vastu",
    accent: "from-slate-500 to-zinc-600",
    image: serviceOfficeVastu,
  },
  {
    icon: Smartphone,
    title: "Mobile Numerology",
    link: "/services/mobile-numerology",
    accent: "from-cyan-500 to-blue-600",
    image: serviceMobileNumerology,
  },
];

const ServicesSection = () => {
  const [showBusinessModal, setShowBusinessModal] = useState(false);

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Rich dark background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[#faf6f0] to-background" />
      
      {/* Subtle texture */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
        backgroundSize: '48px 48px'
      }} />
      
      {/* Warm glow accents */}
      <motion.div 
        animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-[5%] w-64 h-64 bg-primary/5 rounded-full blur-[100px]" 
      />
      <motion.div 
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-32 right-[8%] w-80 h-80 bg-amber/5 rounded-full blur-[100px]" 
      />
      
      {/* Divider lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
      
      <div className="section-container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/8 border border-primary/15 text-primary text-sm font-semibold mb-5 tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Our Services
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5">
            Explore Our <span className="text-gradient-primary">Offerings</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Comprehensive numerology solutions to guide you through every aspect of life
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((service, index) => {
            const cardContent = (
              <div className="group relative flex flex-col h-full w-full overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/40 hover:border-primary/30 shadow-sm hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] hover:-translate-y-2 transition-all duration-500 text-center cursor-pointer">
                {/* Image or gradient area */}
                {service.image ? (
                  <div className="relative w-full h-52 overflow-hidden">
                    <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                    {/* Shimmer on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                ) : (
                  <div className={`relative w-full h-52 bg-gradient-to-br ${service.accent} flex items-center justify-center overflow-hidden`}>
                    <service.icon className="w-16 h-16 text-white/50 group-hover:scale-110 group-hover:text-white/70 transition-all duration-700" strokeWidth={1} />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                )}
                
                {/* Content */}
                <div className="px-5 py-5 flex flex-col flex-grow">
                  <h3 className="font-display text-base font-bold text-foreground mb-5 group-hover:text-primary transition-colors duration-300">
                    {service.title}
                  </h3>
                  <div className="mt-auto inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-primary/8 text-primary font-semibold text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    ORDER NOW
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            );

            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className="flex"
              >
                {service.action === "business-modal" ? (
                  <div onClick={() => setShowBusinessModal(true)} className="w-full">
                    {cardContent}
                  </div>
                ) : service.external ? (
                  <a href={service.link} target="_blank" rel="noopener noreferrer" className="w-full">
                    {cardContent}
                  </a>
                ) : (
                  <Link to={service.link} className="w-full">
                    {cardContent}
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* View All */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <Link to="/services" className="group inline-flex items-center gap-3 bg-gradient-to-r from-primary to-orange-dark text-primary-foreground font-bold px-10 py-4 rounded-xl shadow-[0_8px_30px_rgba(234,88,12,0.25)] hover:shadow-[0_12px_40px_rgba(234,88,12,0.35)] hover:-translate-y-0.5 transition-all duration-300">
            View All Services
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>

      <BusinessNumerologyModal isOpen={showBusinessModal} onClose={() => setShowBusinessModal(false)} />
    </section>
  );
};

export default ServicesSection;
