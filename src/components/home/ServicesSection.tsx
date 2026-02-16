import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Sparkles, 
  ScrollText, 
  Heart, 
  Gem, 
  Star,
  Crown,
  Building,
  Smartphone,
  ArrowRight
} from "lucide-react";

import serviceNameCorrection from "@/assets/service-name-correction.png";
import serviceBabyName from "@/assets/service-baby-name.png";
import serviceBusinessNumerology from "@/assets/service-business-numerology.png";
import serviceCsectionDates from "@/assets/service-csection-dates.png";
import serviceOfficeVastu from "@/assets/service-office-vastu.png";
import serviceMobileNumerology from "@/assets/service-mobile-numerology.png";

const services = [
  {
    icon: Sparkles,
    title: "Call Consultation",
    description: "1:1 audio/video consultation with Himansshu Agarwal Ji for personalized guidance.",
    link: "/consultation",
    gradient: "from-amber-500 via-orange-500 to-rose-500",
  },
  {
    icon: ScrollText,
    title: "Name Correction",
    description: "Detailed name analysis to identify misalignment and corrective suggestions.",
    link: "https://www.ankshaastra.empower.com",
    external: true,
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    image: serviceNameCorrection,
  },
  {
    icon: Heart,
    title: "Perfect Baby Name",
    description: "Numerology-based baby name suggestions aligned with birth details.",
    link: "/services",
    gradient: "from-pink-500 via-rose-500 to-red-500",
    image: serviceBabyName,
  },
  {
    icon: Gem,
    title: "Business Numerology",
    description: "Business name alignment, brand logo colors, and strategic guidance.",
    link: "/services",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    image: serviceBusinessNumerology,
  },
  {
    icon: Star,
    title: "C-Section Dates",
    description: "Numerology-based guidance for selecting supportive birth dates.",
    link: "/services",
    gradient: "from-blue-500 via-indigo-500 to-violet-500",
    image: serviceCsectionDates,
  },
  {
    icon: Crown,
    title: "Varshphal Report 2026",
    description: "Detailed yearly prediction report with personalized numerology insights.",
    link: "/reports",
    gradient: "from-yellow-500 via-amber-500 to-orange-500",
  },
  {
    icon: Building,
    title: "Office Vastu",
    description: "Numerology-integrated workspace planning for improved productivity and harmony.",
    link: "/services",
    gradient: "from-slate-500 via-gray-500 to-zinc-600",
    image: serviceOfficeVastu,
  },
  {
    icon: Smartphone,
    title: "Mobile Numerology",
    description: "Assessment of mobile number vibration and its influence on opportunities.",
    link: "/services",
    gradient: "from-cyan-500 via-blue-500 to-indigo-500",
    image: serviceMobileNumerology,
  },
];

const ServicesSection = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Elegant background with subtle patterns */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      
      {/* Subtle geometric pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
        backgroundSize: '48px 48px'
      }} />
      
      {/* Animated floating orbs */}
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
      <motion.div 
        animate={{ y: [0, 10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/3 rounded-full blur-3xl" 
      />
      
      {/* Floating geometric shapes */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 45, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-32 right-[15%] w-20 h-20 border border-primary/10 rounded-2xl"
      />
      <motion.div
        animate={{ y: [0, 8, 0], rotate: [45, 90, 45] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute bottom-40 left-[12%] w-16 h-16 border border-accent/10 rounded-xl"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 right-[5%] w-32 h-32 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full"
      />
      
      {/* Subtle floating rings */}
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 left-[20%] w-48 h-48 border border-dashed border-primary/5 rounded-full"
      />
      <motion.div
        animate={{ rotate: [360, 0] }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/4 right-[20%] w-36 h-36 border border-dashed border-accent/5 rounded-full"
      />
      
      {/* Small floating dots */}
      <motion.div
        animate={{ y: [0, -15, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-40 left-[30%] w-2 h-2 bg-primary/20 rounded-full"
      />
      <motion.div
        animate={{ y: [0, 12, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-60 right-[25%] w-3 h-3 bg-accent/20 rounded-full"
      />
      <motion.div
        animate={{ y: [0, -8, 0], opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-48 left-[40%] w-2 h-2 bg-primary/15 rounded-full"
      />
      
      {/* Elegant border accents */}
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
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex"
            >
              <div className="flex flex-col h-full w-full group relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 text-center">
                {/* Service Image */}
                {service.image ? (
                  <div className="relative w-full h-40 overflow-hidden">
                    <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className={`absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent`} />
                  </div>
                ) : (
                  <div className={`relative w-full h-40 bg-gradient-to-br ${service.gradient} flex items-center justify-center`}>
                    <service.icon className="w-16 h-16 text-white/80" strokeWidth={1} />
                    <div className={`absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent`} />
                  </div>
                )}
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="relative font-display text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="relative text-muted-foreground mb-6 leading-relaxed text-sm flex-grow">
                    {service.description}
                  </p>
                
                {/* Order Now Button */}
                {service.external ? (
                  <a 
                    href={service.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-full border-2 border-primary text-primary font-semibold text-sm hover:bg-primary hover:text-white transition-all duration-300 group/btn"
                  >
                    <span className="w-3 h-3 rounded-full border-2 border-current flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-current scale-0 group-hover/btn:scale-100 transition-transform duration-200" />
                    </span>
                    ORDER NOW
                    <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all duration-300" />
                  </a>
                ) : (
                  <Link 
                    to={service.link}
                    className="relative inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-full border-2 border-primary text-primary font-semibold text-sm hover:bg-primary hover:text-white transition-all duration-300 group/btn"
                  >
                    <span className="w-3 h-3 rounded-full border-2 border-current flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-current scale-0 group-hover/btn:scale-100 transition-transform duration-200" />
                    </span>
                    ORDER NOW
                    <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all duration-300" />
                  </Link>
                )}
                </div>
              </div>
            </motion.div>
          ))}
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
    </section>
  );
};

export default ServicesSection;