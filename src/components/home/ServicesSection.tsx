import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, ScrollText, Heart, Gem, Star, Crown, Building, Smartphone } from "lucide-react";
import BusinessNumerologyModal from "./BusinessNumerologyModal";

type Category = "All" | "Consultations" | "Reports" | "Kundli" | "Online Puja";

const services: Array<{
  icon: any;
  title: string;
  description: string;
  link: string;
  external?: boolean;
  action?: string;
  badge: string;
  cta: string;
  category: Exclude<Category, "All">;
}> = [
  { icon: Sparkles, title: "Call Consultation", description: "1-on-1 personal guidance with Himansshu Ji on call", link: "/consultation", badge: "1-on-1", cta: "Book Now", category: "Consultations" },
  { icon: ScrollText, title: "Name Correction", description: "Align your name's vibration for lasting success", link: "https://empower.ankshaastra.com", external: true, badge: "India's No.1", cta: "Order Now", category: "Reports" },
  { icon: Heart, title: "Perfect Baby Name", description: "Numerology-based auspicious baby naming", link: "https://empower.ankshaastra.com", external: true, badge: "Bestseller", cta: "Order Now", category: "Reports" },
  { icon: Gem, title: "Business Numerology", description: "Brand & business name alignment for growth", link: "#", action: "business-modal", badge: "For Owners", cta: "Check Now", category: "Consultations" },
  { icon: Star, title: "C-Section Dates", description: "Auspicious birth dates for your newborn", link: "/services/csection-dates", badge: "Specialist", cta: "Book Now", category: "Kundli" },
  { icon: Crown, title: "Varshphal 2026", description: "Your complete annual numerology forecast", link: "/services/varshphal-report", badge: "New", cta: "Order Now", category: "Reports" },
  { icon: Building, title: "Office Vastu", description: "Workplace alignment for prosperity & harmony", link: "/services/office-vastu", badge: "FREE", cta: "Check Now", category: "Online Puja" },
  { icon: Smartphone, title: "Mobile Numerology", description: "Lucky mobile number for vibrational alignment", link: "/services/mobile-numerology", badge: "Quick", cta: "Check Now", category: "Reports" },
];

const tabs: Category[] = ["All", "Consultations", "Reports", "Kundli", "Online Puja"];

const ServicesSection = () => {
  const [active, setActive] = useState<Category>("All");
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const visible = active === "All" ? services : services.filter((s) => s.category === active);

  return (
    <section className="section-padding bg-cream relative">
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="text-foreground">Our </span>
            <span className="text-primary italic">Services</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Trusted Vedic guidance, personalized for every chapter of your life
          </p>
        </motion.div>

        {/* Filter tabs */}
        <div className="flex flex-wrap items-center justify-center gap-1 md:gap-2 mb-10 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`relative px-4 md:px-6 py-3 text-sm md:text-base font-semibold transition-colors ${
                active === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {active === tab && (
                <motion.span
                  layoutId="active-tab-underline"
                  className="absolute -bottom-px left-0 right-0 h-0.5 bg-primary rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {visible.map((service, i) => {
            const Icon = service.icon;
            const inner = (
              <div className="group relative h-full flex flex-col bg-card border border-accent/40 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 hover:border-primary/40 transition-all duration-300">
                {/* Badge */}
                <span className="absolute top-4 right-4 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {service.badge}
                </span>

                {/* Icon */}
                <div className="w-16 h-16 rounded-full border-2 border-accent flex items-center justify-center mb-5 group-hover:border-primary group-hover:bg-primary/5 transition-all">
                  <Icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-grow">
                  {service.description}
                </p>

                {/* CTA */}
                <button className="w-full py-2.5 rounded-lg border-2 border-primary text-primary text-sm font-semibold uppercase tracking-wider group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  {service.cta}
                </button>
              </div>
            );

            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                {service.action === "business-modal" ? (
                  <div onClick={() => setShowBusinessModal(true)} className="cursor-pointer h-full">{inner}</div>
                ) : service.external ? (
                  <a href={service.link} target="_blank" rel="noopener noreferrer" className="block h-full">{inner}</a>
                ) : (
                  <Link to={service.link} className="block h-full">{inner}</Link>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 bg-primary hover:bg-orange-dark text-primary-foreground font-semibold px-8 py-3.5 rounded-lg shadow-amber transition-all hover:-translate-y-0.5"
          >
            View All Services
          </Link>
        </div>
      </div>

      <BusinessNumerologyModal isOpen={showBusinessModal} onClose={() => setShowBusinessModal(false)} />
    </section>
  );
};

export default ServicesSection;
