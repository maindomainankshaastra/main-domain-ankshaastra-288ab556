import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Phone, MessageCircle, Sparkles } from "lucide-react";
import { pricing } from "@/config/pricing";

const CTASection = () => {
  return (
    <section className="section-padding bg-cream">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden p-8 md:p-16 text-center bg-secondary text-cream-light"
        >
          {/* Glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-amber/20 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-orange/15 blur-[80px] rounded-full" />
          </div>
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--cream-light)) 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cream-light/10 border border-cream-light/25 text-amber-light text-xs font-semibold mb-6 tracking-[0.2em] uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Start Your Journey
            </div>

            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-cream-light mb-5">
              Ready to Transform <span className="italic text-amber-light">Your Life?</span>
            </h2>

            <p className="text-base md:text-lg text-cream-light/75 max-w-2xl mx-auto mb-9 leading-relaxed">
              Personalized guidance from Himansshu Agarwal Ji — take the first step toward your destiny today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link
                to="/consultation"
                className="inline-flex items-center justify-center gap-2.5 bg-primary hover:bg-orange-dark text-primary-foreground font-semibold px-8 py-3.5 rounded-lg shadow-amber transition-all hover:-translate-y-0.5"
              >
                Book Consultation Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/services/name-correction"
                className="inline-flex items-center justify-center gap-2.5 border-2 border-cream-light/70 text-cream-light hover:bg-cream-light hover:text-secondary font-semibold px-8 py-3.5 rounded-lg transition-all"
              >
                Get Name Check @ ₹{pricing.nameCorrection.nameCheck}
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-cream-light/70 text-sm">
              <a href="tel:+919667305577" className="flex items-center gap-2 hover:text-amber-light transition-colors">
                <Phone className="w-4 h-4" />
                +91 96673 05577
              </a>
              <a href="https://wa.me/919667305577" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-amber-light transition-colors">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
