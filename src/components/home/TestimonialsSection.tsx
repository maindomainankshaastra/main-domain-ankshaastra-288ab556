import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Rajesh Kumar",
    location: "Delhi",
    text: "The name correction guidance was incredibly accurate. My business started growing within 3 months. Highly recommended!",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    location: "Mumbai",
    text: "Himansshu Ji's remedies for my marriage issues worked wonderfully. My relationship has improved significantly.",
    rating: 5,
  },
  {
    name: "Amit Verma",
    location: "Bangalore",
    text: "I was skeptical about numerology, but after consulting Himansshu Ji, I'm a believer. His insights are profound and practical.",
    rating: 5,
  },
  {
    name: "Sunita Gupta",
    location: "Pune",
    text: "The baby name consultation was detailed and meaningful. We found the perfect name for our daughter.",
    rating: 5,
  },
  {
    name: "Vikram Singh",
    location: "Jaipur",
    text: "Best numerologist I've consulted. The call consultation revealed things about my life that nobody else knew.",
    rating: 5,
  },
  {
    name: "Neha Patel",
    location: "Ahmedabad",
    text: "The business name correction helped us rebrand successfully. Revenue increased by 40% in 6 months!",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Rich background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[#faf6f0] to-background" />
      
      {/* Warm ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/[0.03] rounded-full blur-[100px]" />
      
      <div className="section-container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/8 border border-primary/15 text-primary text-sm font-semibold mb-5 tracking-wider uppercase">
            <Star className="w-3.5 h-3.5 fill-primary" />
            Testimonials
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5">
            What Our <span className="text-gradient-primary">Clients Say</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Join thousands of satisfied clients who have transformed their lives
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="group relative"
            >
              <div className="relative bg-card/80 backdrop-blur-sm border border-border/40 rounded-2xl p-7 hover:border-primary/20 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500">
                {/* Quote icon */}
                <div className="absolute -top-4 right-6 w-8 h-8 rounded-full bg-gradient-to-br from-amber to-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Quote className="w-3.5 h-3.5 text-white" />
                </div>
                
                {/* Rating */}
                <div className="flex gap-1 mb-5">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber text-amber" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-foreground/80 mb-7 leading-relaxed text-[15px]">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-5 border-t border-border/50">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/15 to-amber/10 flex items-center justify-center border border-primary/10">
                    <span className="text-primary font-bold text-sm">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                  </div>
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
