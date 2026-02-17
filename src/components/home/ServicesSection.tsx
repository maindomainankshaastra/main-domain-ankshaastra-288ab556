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
import BusinessNumerologyModal from "./BusinessNumerologyModal";

const services = [
  {
    icon: Sparkles,
    title: "Call Consultation",
    link: "/consultation",
    gradient: "from-amber-500 via-orange-500 to-rose-500",
  },
  {
    icon: ScrollText,
    title: "Name Correction",
    link: "https://empower.ankshaastra.com",
    external: true,
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    image: serviceNameCorrection,
  },
  {
    icon: Heart,
    title: "Perfect Baby Name",
    link: "/services/baby-name",
    gradient: "from-pink-500 via-rose-500 to-red-500",
    image: serviceBabyName,
  },
  {
    icon: Gem,
    title: "Business Numerology",
    link: "#",
    action: "business-modal",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    image: serviceBusinessNumerology,
  },
  {
    icon: Star,
    title: "C-Section Dates",
    link: "/services/csection-dates",
    gradient: "from-blue-500 via-indigo-500 to-violet-500",
    image: serviceCsectionDates,
  },
  {
    icon: Crown,
    title: "Varshphal Report 2026",
    link: "/services/varshphal-report",
    gradient: "from-yellow-500 via-amber-500 to-orange-500",
  },
  {
    icon: Building,
    title: "Office Vastu",
    link: "/services",
    gradient: "from-slate-500 via-gray-500 to-zinc-600",
    image: serviceOfficeVastu,
  },
  {
    icon: Smartphone,
    title: "Mobile Numerology",
    link: "/services",
    gradient: "from-cyan-500 via-blue-500 to-indigo-500",
    image: serviceMobileNumerology,
  },
];

const ServicesSection = () => {
  const [showBusinessModal, setShowBusinessModal] = useState(false);

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
        backgroundSize: '48px 48px'
      }} />
      
      <motion.div 
        animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-[5%] w-64 h-64 bg-primary/5 rounded-full blur-3xl" 
      />
      <motion.div 
        animate={{ y: [0, 15, 0], scale: [1, 0.95, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-32 right-[8%] w-80 h-80 bg-accent/6 rounded-full blur-3xl" 
      />
      
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
      
      <div className="section-container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Our Services
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Explore Our <span className="text-gradient-primary">Offerings</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive numerology solutions to guide you through every aspect of life
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const cardContent = (
              <div className="flex flex-col h-full w-full group relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-2xl hover:border-primary/30 hover:-translate-y-2 transition-all duration-500 text-center cursor-pointer">
                {service.image ? (
                  <div className="relative w-full h-48 overflow-hidden">
                    <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                  </div>
                ) : (
                  <div className={`relative w-full h-48 bg-gradient-to-br ${service.gradient} flex items-center justify-center overflow-hidden`}>
                    <service.icon className="w-20 h-20 text-white/70 group-hover:scale-110 transition-transform duration-700" strokeWidth={1} />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                )}
                <div className="px-5 py-4 flex flex-col flex-grow">
                  <h3 className="font-display text-base font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                    {service.title}
                  </h3>
                  <div className="mt-auto inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-primary/10 text-primary font-semibold text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
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
                transition={{ delay: index * 0.1 }}
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
          className="text-center mt-12"
        >
          <Link to="/services" className="btn-primary inline-flex items-center gap-2">
            View All Services
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>

      <BusinessNumerologyModal isOpen={showBusinessModal} onClose={() => setShowBusinessModal(false)} />
    </section>
  );
};

export default ServicesSection;
