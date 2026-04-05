import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Phone, MessageCircle, Sparkles } from "lucide-react";

const CTASection = () => {
  return (
    <section className="section-padding">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden p-8 md:p-16 text-center"
        >
          {/* Deep dark background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a00] via-[#2d1200] to-[#0d0500]" />
          
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-primary/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-amber/10 rounded-full blur-[80px]" />
          
          {/* Grain */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          }} />
          
          {/* Border glow */}
          <div className="absolute inset-0 rounded-3xl border border-amber/10" />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber/10 border border-amber/20 text-amber text-sm font-semibold mb-8 tracking-wider uppercase"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Start Your Journey
            </motion.div>

            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform{" "}
              <span className="bg-gradient-to-r from-amber to-primary bg-clip-text text-transparent">Your Life?</span>
            </h2>

            <p className="text-lg text-white/40 max-w-2xl mx-auto mb-10 leading-relaxed">
              Get personalized guidance from Himansshu Agarwal Ji and take control of your destiny today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/consultation"
                  className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber to-primary text-foreground font-bold px-10 py-4 rounded-xl shadow-[0_8px_32px_rgba(243,178,41,0.3)] hover:shadow-[0_12px_48px_rgba(243,178,41,0.45)] transition-all duration-300"
                >
                  Book Consultation Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                <a
                  href="https://empower.ankshaastra.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 bg-white/[0.06] backdrop-blur-md border border-white/15 text-white font-bold px-10 py-4 rounded-xl hover:bg-white/[0.12] hover:border-amber/30 transition-all duration-300"
                >
                  Get Your Name Checked at Just ₹293/-
                </a>
              </motion.div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-white/40">
              <a href="tel:+919667305577" className="flex items-center gap-2 hover:text-amber transition-colors duration-300">
                <Phone className="w-5 h-5" />
                +91 96673 05577
              </a>
              <a href="https://wa.me/919667305577" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-amber transition-colors duration-300">
                <MessageCircle className="w-5 h-5" />
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
