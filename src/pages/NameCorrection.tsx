import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Sparkles, Check, ArrowRight, Pen, Hash, RefreshCw, Award } from "lucide-react";

const pulseGlow = {
  animate: {
    scale: [1, 1.15, 1],
    opacity: [0.7, 1, 0.7],
    filter: [
      "drop-shadow(0 0 8px rgba(232,184,75,0.4))",
      "drop-shadow(0 0 20px rgba(232,184,75,0.8))",
      "drop-shadow(0 0 8px rgba(232,184,75,0.4))",
    ],
  },
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

const StarField = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 80 }).map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full bg-white"
        style={{
          width: `${Math.random() * 2 + 1}px`,
          height: `${Math.random() * 2 + 1}px`,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          opacity: Math.random() * 0.6 + 0.1,
          animation: `twinkle ${Math.random() * 4 + 3}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 5}s`,
        }}
      />
    ))}
  </div>
);

const NameCorrectionPage = () => {
  return (
    <Layout>
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.8; }
        }
        .cosmic-bg {
          background: linear-gradient(180deg, #0a0015 0%, #0d0a2e 50%, #0a0015 100%);
        }
        .nebula-blob {
          background: radial-gradient(ellipse at center, rgba(168,85,247,0.15) 0%, rgba(13,10,46,0) 70%);
        }
        .nebula-blob-gold {
          background: radial-gradient(ellipse at center, rgba(232,184,75,0.08) 0%, rgba(13,10,46,0) 70%);
        }
        .glass-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(180,100,255,0.3);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .glass-card-glow {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(232,184,75,0.4);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 0 20px rgba(200,150,255,0.4), 0 0 40px rgba(232,184,75,0.15);
        }
        .cosmic-heading {
          color: #f5d78e;
        }
        .cosmic-body {
          color: #c9c0e0;
        }
        .cosmic-label {
          color: #9b7fc7;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .icon-glow {
          background: radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%);
        }
        .btn-cosmic-gold {
          background: linear-gradient(135deg, #e8b84b 0%, #a855f7 100%);
          color: #0a0015;
          font-weight: 700;
          border-radius: 9999px;
          padding: 14px 32px;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-cosmic-gold:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(232,184,75,0.4);
        }
      `}</style>

      {/* Hero Section */}
      <section className="pt-12 pb-24 cosmic-bg relative overflow-hidden">
        <StarField />
        <div className="absolute inset-0 nebula-blob" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-1 rounded-full glass-card cosmic-label mb-4">
              Numerology Service
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 cosmic-heading">
              Name <span style={{ background: "linear-gradient(135deg, #e8b84b, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Correction</span>
            </h1>
            <p className="font-body text-xl cosmic-body mb-8">
              Align your name with cosmic vibrations to unlock success, prosperity, and positive energy flow in your life
            </p>
            <a href="https://www.ankshaastra.empower.com" target="_blank" rel="noopener noreferrer" className="btn-cosmic-gold">
              Get Your Name Analysis
            </a>
          </motion.div>
        </div>
      </section>

      {/* What is Name Correction */}
      <section className="py-24 cosmic-bg relative overflow-hidden">
        <StarField />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] nebula-blob pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 cosmic-heading">
                What is <span style={{ background: "linear-gradient(135deg, #e8b84b, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Name Correction?</span>
              </h2>
              <p className="font-body text-lg cosmic-body mb-6 leading-relaxed">
                Name Correction is a powerful numerological technique that aligns your name's 
                vibration with your birth date and planetary positions. Based on ancient Vedic 
                numerology, we analyze the numerical value of your name and suggest modifications 
                to enhance positive energy flow.
              </p>
              <p className="font-body text-lg cosmic-body mb-8 leading-relaxed">
                Every letter has a specific numerical value and planetary association. When your 
                name's vibration matches your destiny number, it creates harmony that attracts 
                success, wealth, and happiness.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Hash, text: "Numerology Based" },
                  { icon: Sparkles, text: "Energy Alignment" },
                  { icon: Pen, text: "Spelling Changes" },
                  { icon: RefreshCw, text: "Life Transformation" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full icon-glow flex items-center justify-center">
                      <item.icon className="w-5 h-5" style={{ color: "#e8b84b" }} />
                    </div>
                    <span className="cosmic-body">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Nebula behind card */}
              <div className="absolute -inset-10 nebula-blob-gold pointer-events-none" />
              <div className="glass-card rounded-2xl p-8 space-y-6 relative">
                <div className="text-center mb-8">
                  <motion.div {...pulseGlow}>
                    <Sparkles className="w-16 h-16 mx-auto mb-4" style={{ color: "#e8b84b" }} />
                  </motion.div>
                  <h3 className="font-display text-2xl font-bold cosmic-heading">Name Analysis Example</h3>
                </div>
                <div className="space-y-4">
                  <div className="glass-card rounded-lg p-4">
                    <p className="cosmic-label mb-2">Current Name</p>
                    <p className="text-xl font-display" style={{ color: "#ffffff" }}>RAHUL SHARMA</p>
                    <p className="text-sm mt-2" style={{ color: "#f87171" }}>Name Number: 4 (Unfavorable)</p>
                  </div>
                  <ArrowRight className="w-6 h-6 mx-auto" style={{ color: "#a855f7" }} />
                  <div className="glass-card-glow rounded-lg p-4">
                    <p className="cosmic-label mb-2">Corrected Name</p>
                    <p className="text-xl font-display" style={{ color: "#ffffff" }}>RAHULL SHARMA</p>
                    <p className="text-sm mt-2" style={{ color: "#e8b84b" }}>Name Number: 6 (Highly Favorable)</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 cosmic-bg relative overflow-hidden">
        <StarField />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] nebula-blob pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 cosmic-heading">
              Benefits of <span style={{ background: "linear-gradient(135deg, #e8b84b, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Name Correction</span>
            </h2>
            <p className="font-body text-xl cosmic-body max-w-2xl mx-auto">
              Experience positive transformation in all areas of your life
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Career Growth", description: "Attract better opportunities and recognition in your professional life.", icon: "📈" },
              { title: "Financial Prosperity", description: "Remove blocks to wealth and invite abundance into your life.", icon: "💰" },
              { title: "Improved Relationships", description: "Enhance harmony in personal and professional relationships.", icon: "❤️" },
              { title: "Better Health", description: "Positive name vibrations can improve overall well-being.", icon: "🏥" },
              { title: "Success in Business", description: "Align your business name for maximum growth and profits.", icon: "🏢" },
              { title: "Mental Peace", description: "Experience clarity of thought and emotional stability.", icon: "🧘" },
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl p-8 text-center hover:-translate-y-1 transition-transform duration-300"
              >
                <span className="text-5xl mb-4 block">{benefit.icon}</span>
                <h3 className="font-display text-xl font-semibold cosmic-heading mb-3">
                  {benefit.title}
                </h3>
                <p className="cosmic-body">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 cosmic-bg relative overflow-hidden">
        <StarField />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] nebula-blob-gold pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="glass-card-glow rounded-2xl p-8 md:p-12 text-center">
              <motion.div {...pulseGlow}>
                <Award className="w-16 h-16 mx-auto mb-6" style={{ color: "#e8b84b" }} />
              </motion.div>
              <h2 className="font-display text-3xl font-bold cosmic-heading mb-4">
                Complete Name Correction Package
              </h2>
              <div className="flex items-baseline justify-center gap-3 mb-6">
                <span className="text-5xl font-bold" style={{ background: "linear-gradient(135deg, #e8b84b, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>₹1,997</span>
                <span className="text-xl cosmic-body line-through">₹4,999</span>
              </div>
              <ul className="space-y-4 mb-8 text-left max-w-md mx-auto">
                {[
                  "Detailed numerology analysis of current name",
                  "Multiple name correction suggestions",
                  "Lucky number recommendations",
                  "Signature analysis & correction",
                  "Auspicious date for name change",
                  "Email support for 30 days",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 cosmic-body">
                    <div className="w-6 h-6 rounded-full icon-glow flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4" style={{ color: "#e8b84b" }} />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a href="https://www.ankshaastra.empower.com" target="_blank" rel="noopener noreferrer" className="btn-cosmic-gold w-full justify-center py-4 text-lg">
                Get Started Now
              </a>
              <p className="text-sm cosmic-body mt-4" style={{ opacity: 0.7 }}>
                Delivery within 48 hours via email
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default NameCorrectionPage;
