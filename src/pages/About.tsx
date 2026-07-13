import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Award, Users, BookOpen, Heart, ArrowRight, Star, CheckCircle2 } from "lucide-react";
import expertImg from "@/assets/expert-himansshu.jpg";

const stats = [
  { icon: Users, value: "5000+", label: "Lives Transformed" },
  { icon: Award, value: "10+", label: "Years of Mastery" },
  { icon: BookOpen, value: "5000+", label: "Name Corrections" },
  { icon: Star, value: "4.9", label: "Client Rating" },
];

const values = [
  { icon: Heart, title: "Authenticity", desc: "Rooted in classical Vedic numerology, every guidance is genuine, never generic." },
  { icon: Sparkles, title: "Precision", desc: "Each chart, name, and number is hand-analysed with painstaking detail." },
  { icon: CheckCircle2, title: "Trust", desc: "5000+ corrections delivered with discretion, integrity, and follow-through." },
];

const About = () => {
  return (
    <Layout>
      <SEOHead title="About Himansshu Agarwal Ji" description="Learn about Himansshu Agarwal Ji – a renowned name correction expert and Lal Kitab remedy specialist with 10+ years of experience in numerology." canonical="/about" />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28 gradient-hero">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse,hsl(var(--amber)/0.18),transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: '32px 32px' }} />
        <div className="section-container relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-amber-light text-sm font-semibold mb-6 tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Our Story
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              About <span className="text-amber-light">Ankshaastra</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed">
              A premium Vedic numerology practice led by <span className="text-amber-light font-semibold">Himansshu Agarwal Ji</span> — guiding individuals, families, and businesses toward alignment, clarity, and lasting growth.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-background">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card-warm p-6 text-center"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl gradient-primary flex items-center justify-center shadow-md">
                  <stat.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="font-display text-3xl font-bold text-gradient-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Story */}
      <section className="py-16 md:py-20 bg-card">
        <div className="section-container">
          <div className="grid lg:grid-cols-5 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="relative aspect-[4/5] max-w-sm mx-auto lg:mx-0 rounded-3xl overflow-hidden shadow-xl border-2 border-accent/40">
                <img
                  src={expertImg}
                  alt="Himansshu Agarwal Ji - Numerology Expert"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6">
                  <h3 className="font-display text-2xl font-bold text-white mb-1">Himansshu Agarwal Ji</h3>
                  <p className="text-amber-light text-xs font-semibold tracking-wider uppercase">Numerology Expert</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-4 tracking-wider uppercase">
                <Award className="w-3.5 h-3.5" />
                Meet the Expert
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                A Decade of <span className="text-gradient-primary">Vedic Mastery</span>
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  With over <strong className="text-foreground">10 years of dedicated research</strong> and practical experience, Himansshu Agarwal Ji is one of India's most trusted Name Correction Experts and Lal Kitab Remedy Specialists.
                </p>
                <p>
                  Having delivered <strong className="text-foreground">5000+ name corrections</strong> across India and abroad, his work blends classical Vedic numerology, Lal Kitab traditions, and modern psychological insight — producing remedies that are both spiritually grounded and practically actionable.
                </p>
                <p>
                  Featured on YouTube podcasts and trusted by entrepreneurs, families, and professionals, his mission is simple: help every soul align their name and numbers with their true purpose.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-20 bg-background">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              What We <span className="text-gradient-primary">Stand For</span>
            </h2>
            <p className="text-muted-foreground">The principles that shape every consultation, every report, every remedy.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-warm p-8 text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center shadow-md">
                  <v.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-3">{v.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-20 gradient-hero">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,hsl(var(--amber)/0.15),transparent_70%)]" />
        <div className="section-container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Begin Your <span className="text-amber-light">Journey?</span>
            </h2>
            <p className="text-primary-foreground/80 mb-8">Book a personal consultation with Himansshu Agarwal Ji and take the first step toward alignment.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/consultation" className="inline-flex items-center justify-center gap-2 btn-primary group">
                Book Consultation
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/services" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-primary-foreground/30 text-primary-foreground font-semibold hover:bg-primary-foreground/10 transition-all">
                Explore Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default About;