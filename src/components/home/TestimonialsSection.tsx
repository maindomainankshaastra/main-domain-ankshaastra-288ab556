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
    <section className="section-padding">
      <div className="section-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            What Our <span className="text-gradient-primary">Clients Say</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-border rounded-xl p-6 relative"
            >
              <Quote className="w-10 h-10 text-primary/20 absolute top-4 right-4" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber text-amber" />
                ))}
              </div>

              {/* Text */}
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
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