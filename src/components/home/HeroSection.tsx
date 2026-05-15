import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Phone } from "lucide-react";
import zodiacWheel from "@/assets/zodiac-wheel.png";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-secondary text-cream-light">
      {/* Subtle warm radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[60%] h-[80%] bg-amber/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[60%] bg-orange/15 blur-[120px] rounded-full" />
      </div>

      {/* Decorative ornament pattern */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--cream-light)) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="section-container relative z-10 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cream-light/10 border border-cream-light/25 backdrop-blur-sm mb-7">
              <Sparkles className="w-3.5 h-3.5 text-amber-light" />
              <span className="text-[11px] sm:text-xs text-cream-light/95 font-medium tracking-[0.2em] uppercase">
                ✦ Vedic Astrology & Spiritual Guidance
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6 text-cream-light">
              Transform Your{" "}
              <span className="italic text-amber-light">Destiny</span>
              <br />
              Through Sacred
              <br />
              <span className="text-amber-light">Numerology</span>
            </h1>

            <p className="text-base md:text-lg text-cream-light/80 max-w-xl mx-auto lg:mx-0 leading-relaxed mb-9">
              Personalized guidance from Himansshu Agarwal Ji — India's trusted Numerology
              & Lal Kitab expert. 5000+ name corrections, 99% client satisfaction.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/services/name-correction"
                className="group inline-flex items-center justify-center gap-2.5 bg-primary hover:bg-orange-dark text-primary-foreground font-semibold px-7 py-3.5 rounded-lg shadow-amber transition-all duration-300 hover:-translate-y-0.5"
              >
                <span>Get Name Check @ ₹{pricing.nameCorrection.nameCheck}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/consultation"
                className="inline-flex items-center justify-center gap-2.5 border-2 border-cream-light/70 text-cream-light hover:bg-cream-light hover:text-secondary font-semibold px-7 py-3.5 rounded-lg transition-all duration-300"
              >
                <Phone className="w-4 h-4" />
                <span>Book Consultation</span>
              </Link>
            </div>

            {/* Carousel dots */}
            <div className="flex items-center justify-center lg:justify-start gap-2 mt-12">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === 0 ? "w-8 bg-amber-light" : "w-1.5 bg-cream-light/30"
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* Right - zodiac wheel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="relative flex items-center justify-center"
          >
            <div className="relative w-full max-w-[520px] aspect-square">
              {/* Outer glow */}
              <div className="absolute inset-[-15%] rounded-full bg-amber/20 blur-3xl" />
              {/* Slowly rotating wheel */}
              <motion.img
                src={zodiacWheel}
                alt="Vedic zodiac wheel with sacred book and diya"
                width={1024}
                height={1024}
                className="relative w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)] animate-slow-spin"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
