import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Phone, MessageCircle } from "lucide-react";

const CTASection = () => {
  return (
    <section className="section-padding">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden gradient-hero p-8 md:p-16 text-center"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform <span className="text-amber-light">Your Life?</span>
          </h2>

          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-10">
            Get personalized guidance from Himansshu Agarwal Ji and take control of your destiny today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              to="/consultation"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary font-semibold px-8 py-4 rounded-lg hover:bg-amber-light transition-all duration-300"
            >
              Book Consultation Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="https://empower.ankshaastra.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white font-semibold px-8 py-4 rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              Get Your Name Checked at Just ₹199/-
            </a>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white">
            <a href="tel:+919667305577" className="flex items-center gap-2 hover:text-amber-light transition-colors">
              <Phone className="w-5 h-5" />
              +91 96673 05577
            </a>
            <a href="https://wa.me/919667305577" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-amber-light transition-colors">
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;