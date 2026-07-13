import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  { name: "Rajesh Kumar", location: "Delhi", text: "The name correction guidance was incredibly accurate. My business started growing within 3 months.", rating: 5 },
  { name: "Priya Sharma", location: "Mumbai", text: "Himansshu Ji's remedies for my marriage issues worked wonderfully. My relationship has improved significantly.", rating: 5 },
  { name: "Amit Verma", location: "Bangalore", text: "I was skeptical about numerology, but his insights are profound and practical.", rating: 5 },
  { name: "Sunita Gupta", location: "Pune", text: "The baby name consultation was detailed and meaningful. We found the perfect name for our daughter.", rating: 5 },
  { name: "Vikram Singh", location: "Jaipur", text: "Best numerologist I've consulted. The call revealed things about my life nobody else knew.", rating: 5 },
  { name: "Neha Patel", location: "Ahmedabad", text: "Business name correction helped us rebrand. Revenue increased by 40% in 6 months!", rating: 5 },
];

const TestimonialsSection = () => {
  return (
    <section className="section-padding bg-cream">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="text-foreground">What Our </span>
            <span className="text-primary italic">Clients Say</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Real stories from thousands who have transformed their lives
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="relative bg-card border border-accent/40 rounded-2xl p-7 hover:shadow-lg transition-all"
            >
              <div className="absolute -top-4 right-6 w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-md">
                <Quote className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, idx) => (
                  <Star key={idx} className="w-4 h-4 fill-amber text-amber" />
                ))}
              </div>
              <p className="text-foreground/85 leading-relaxed mb-6 text-[15px]">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-5 border-t border-border">
                <div className="w-11 h-11 rounded-full bg-primary/10 border border-accent/40 flex items-center justify-center">
                  <span className="text-primary font-bold">{t.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
