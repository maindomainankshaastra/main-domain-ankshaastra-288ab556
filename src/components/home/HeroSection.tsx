import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Users, Award, CheckCircle, Sparkles, Phone } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Deep rich background - dark base with warm overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a00] via-[#2d1200] to-[#0d0500]" />
      
      {/* Warm radial glow */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[80%] bg-gradient-radial from-primary/25 via-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[60%] h-[60%] bg-gradient-radial from-amber/15 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      {/* Noise/grain texture overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
      }} />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ y: [0, -20, 0], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-[10%] w-72 h-72 rounded-full bg-amber/20 blur-[100px]"
        />
        <motion.div
          animate={{ y: [0, 20, 0], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 left-[5%] w-96 h-96 rounded-full bg-primary/15 blur-[100px]"
        />
        
        {/* Sacred geometry */}
        <div className="absolute inset-0 opacity-[0.06]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-amber/30 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-amber/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-amber/10 rounded-full" />
        </div>

        {/* Gold particle dots */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0, 0.6, 0], scale: [0.5, 1, 0.5] }}
            transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 5 }}
            className="absolute w-1 h-1 rounded-full bg-amber"
            style={{ top: `${10 + Math.random() * 80}%`, left: `${5 + Math.random() * 90}%` }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="section-container relative z-10 py-20 lg:py-0">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-7 text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber/10 backdrop-blur-md border border-amber/20 mb-8"
            >
              <Sparkles className="w-4 h-4 text-amber" />
              <span className="text-sm text-amber font-medium tracking-widest uppercase">
                India's Trusted Numerology Expert
              </span>
            </motion.div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
              <span className="text-white/95">Transform Your</span>
              <br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-amber via-amber-light to-primary bg-clip-text text-transparent">
                  Destiny
                </span>
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="absolute -bottom-2 left-0 h-[3px] bg-gradient-to-r from-amber to-primary rounded-full"
                />
              </span>
              <span className="text-white/95"> with</span>
              <br />
              <span className="text-white/95">Numerology</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-white/50 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Personalized guidance through <span className="text-amber/90 font-medium">Numerology</span> & <span className="text-amber/90 font-medium">Lal Kitab Remedies</span> by Himansshu Agarwal Ji. 
              Over 3000+ successful name corrections. 5000+ consultations.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                <a
                  href="https://empower.ankshaastra.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber via-amber-dark to-primary font-bold px-8 py-4 rounded-xl shadow-[0_8px_32px_rgba(243,178,41,0.3)] hover:shadow-[0_12px_48px_rgba(243,178,41,0.45)] transition-all duration-300 text-foreground"
                >
                  <span>Get Name Check @ ₹293</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/consultation"
                  className="inline-flex items-center justify-center gap-3 bg-white/[0.06] backdrop-blur-md border border-white/15 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/[0.12] hover:border-amber/30 transition-all duration-300"
                >
                  <Phone className="w-5 h-5 text-amber" />
                  <span>Book Consultation</span>
                </Link>
              </motion.div>
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-wrap justify-center lg:justify-start gap-4 md:gap-6"
            >
              {[
                { icon: Award, number: "10+", label: "Years Legacy" },
                { icon: Users, number: "5000+", label: "Corrections" },
                { icon: CheckCircle, number: "99%", label: "Satisfaction" },
              ].map((stat, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 bg-white/[0.04] backdrop-blur-sm rounded-xl px-5 py-3 border border-white/[0.08]"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber/20 to-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-amber" />
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold text-white">{stat.number}</p>
                    <p className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Sacred Mandala */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-5 hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full max-w-md aspect-square">
              {/* Outer glow */}
              <div className="absolute inset-[-20%] rounded-full bg-gradient-radial from-amber/10 via-transparent to-transparent" />
              
              {/* Outer ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-amber/15"
                style={{ borderStyle: 'dashed', borderSpacing: '8px' }}
              />
              
              {/* Middle ring */}
              <div className="absolute inset-6 rounded-full bg-gradient-to-br from-amber/10 to-primary/5 backdrop-blur-sm border border-amber/10 shadow-[0_0_60px_rgba(243,178,41,0.1)]" />
              
              {/* Inner circle */}
              <div className="absolute inset-16 rounded-full bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-md border border-white/10 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber to-primary flex items-center justify-center shadow-[0_0_40px_rgba(243,178,41,0.3)]"
                  >
                    <span className="text-3xl font-display font-bold text-foreground">ॐ</span>
                  </motion.div>
                  <p className="text-amber/60 text-sm mt-4 font-medium tracking-widest uppercase">Sacred Numerology</p>
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-8 right-8 w-12 h-12 rounded-full bg-amber/10 backdrop-blur-sm flex items-center justify-center border border-amber/20"
              >
                <Star className="w-5 h-5 text-amber/70" />
              </motion.div>
              
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-12 left-4 w-10 h-10 rounded-full bg-white/[0.06] backdrop-blur-sm flex items-center justify-center border border-white/10"
              >
                <span className="text-lg text-amber/70 font-bold">9</span>
              </motion.div>
              
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-1/3 left-0 w-8 h-8 rounded-full bg-amber/10 backdrop-blur-sm flex items-center justify-center"
              >
                <span className="text-sm text-amber/70 font-bold">7</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
