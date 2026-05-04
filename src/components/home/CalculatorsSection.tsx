import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calculator, Heart, Gem, Star, ArrowRight, Hash } from "lucide-react";

const calculators = [
  { icon: Calculator, title: "Numerology Calculator", description: "Discover your life path & destiny number instantly", to: "/calculator?tab=numerology" },
  { icon: Heart, title: "Love Compatibility", description: "Check numerological compatibility with your partner", to: "/calculator?tab=compatibility" },
  { icon: Gem, title: "Lucky Gemstone Finder", description: "Find the perfect gemstone for your birth chart", to: "/calculator?tab=gemstone" },
  { icon: Star, title: "Lucky Number Calculator", description: "Reveal your most auspicious daily numbers", to: "/calculator?tab=lucky-number" },
  { icon: Hash, title: "Mobile Number Check", description: "Test if your mobile number is vibrationally aligned", to: "/services/mobile-numerology" },
  { icon: Calculator, title: "Name Number Test", description: "Calculate the numerological value of any name", to: "/calculator?tab=name-number" },
];

const CalculatorsSection = () => {
  return (
    <section className="section-padding bg-cream-light">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="text-foreground">Free </span>
            <span className="text-primary italic">Calculators</span>
          </h2>
          <p className="text-base md:text-lg text-primary/80 max-w-2xl mx-auto">
            Begin your numerology journey with our complimentary tools
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {calculators.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <Link
                  to={c.to}
                  className="group flex items-center gap-5 bg-card border border-accent/50 rounded-2xl p-5 md:p-6 hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 border-2 border-accent flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                    <Icon className="w-6 h-6 md:w-7 md:h-7 text-primary group-hover:text-primary-foreground transition-colors" strokeWidth={1.5} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-display text-lg md:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {c.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{c.description}</p>
                  </div>
                  <span className="hidden sm:inline-flex flex-shrink-0 items-center gap-1.5 px-4 py-2 border-2 border-primary text-primary text-xs font-semibold uppercase tracking-wider rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    Calculate Free
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CalculatorsSection;
