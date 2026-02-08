import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Sparkles, Check, ArrowRight, Pen, Hash, RefreshCw, Award } from "lucide-react";

const NameCorrectionPage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-12 pb-24 gradient-hero">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-1 rounded-full bg-muted border border-border text-secondary text-sm mb-4">
              Numerology Service
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6">
              Name <span className="text-gradient-gold">Correction</span>
            </h1>
            <p className="font-elegant text-xl text-muted-foreground mb-8">
              Align your name with cosmic vibrations to unlock success, prosperity, and positive energy flow in your life
            </p>
            <a href="https://www.ankshaastra.empower.com" target="_blank" rel="noopener noreferrer" className="btn-gold text-lg px-8 py-4">
              Get Your Name Analysis
            </a>
          </motion.div>
        </div>
      </section>

      {/* What is Name Correction */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                What is <span className="text-gradient-gold">Name Correction?</span>
              </h2>
              <p className="font-elegant text-lg text-muted-foreground mb-6 leading-relaxed">
                Name Correction is a powerful numerological technique that aligns your name's 
                vibration with your birth date and planetary positions. Based on ancient Vedic 
                numerology, we analyze the numerical value of your name and suggest modifications 
                to enhance positive energy flow.
              </p>
              <p className="font-elegant text-lg text-muted-foreground mb-8 leading-relaxed">
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
                  <div key={item.text} className="flex items-center gap-3 text-muted-foreground">
                    <item.icon className="w-5 h-5 text-secondary" />
                    <span>{item.text}</span>
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
              <div className="card-mystical p-8 space-y-6">
                <div className="text-center mb-8">
                  <Sparkles className="w-16 h-16 text-secondary mx-auto mb-4" />
                  <h3 className="font-display text-2xl font-bold text-foreground">Name Analysis Example</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Original Name</p>
                    <p className="text-xl font-display text-foreground">RAHUL SHARMA</p>
                    <p className="text-sm text-destructive mt-2">Name Number: 4 (Unfavorable)</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-secondary mx-auto" />
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                    <p className="text-sm text-muted-foreground mb-2">Corrected Name</p>
                    <p className="text-xl font-display text-foreground">RAHULL SHARMA</p>
                    <p className="text-sm text-secondary mt-2">Name Number: 6 (Highly Favorable)</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-midnight">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Benefits of <span className="text-gradient-gold">Name Correction</span>
            </h2>
            <p className="font-elegant text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience positive transformation in all areas of your life
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Career Growth",
                description: "Attract better opportunities and recognition in your professional life.",
                icon: "📈",
              },
              {
                title: "Financial Prosperity",
                description: "Remove blocks to wealth and invite abundance into your life.",
                icon: "💰",
              },
              {
                title: "Improved Relationships",
                description: "Enhance harmony in personal and professional relationships.",
                icon: "❤️",
              },
              {
                title: "Better Health",
                description: "Positive name vibrations can improve overall well-being.",
                icon: "🏥",
              },
              {
                title: "Success in Business",
                description: "Align your business name for maximum growth and profits.",
                icon: "🏢",
              },
              {
                title: "Mental Peace",
                description: "Experience clarity of thought and emotional stability.",
                icon: "🧘",
              },
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-mystical p-8 text-center"
              >
                <span className="text-5xl mb-4 block">{benefit.icon}</span>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="card-mystical p-8 md:p-12 text-center border-secondary">
              <Award className="w-16 h-16 text-secondary mx-auto mb-6" />
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                Complete Name Correction Package
              </h2>
              <div className="flex items-baseline justify-center gap-3 mb-6">
                <span className="text-5xl font-bold text-gradient-gold">₹2,999</span>
                <span className="text-xl text-muted-foreground line-through">₹4,999</span>
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
                  <li key={feature} className="flex items-center gap-3 text-muted-foreground">
                    <Check className="w-5 h-5 text-secondary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a href="https://www.ankshaastra.empower.com" target="_blank" rel="noopener noreferrer" className="btn-gold w-full py-4 text-lg">
                Get Started Now
              </a>
              <p className="text-sm text-muted-foreground mt-4">
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