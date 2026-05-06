import { motion } from "framer-motion";
import { Star, Sparkles } from "lucide-react";
import geetaImg from "@/assets/celebrities/geeta-tyagi.png";
import darshanImg from "@/assets/celebrities/darshan-patil.jpg";

const celebrities = [
  {
    name: "Geita Tyagi",
    role: "Indian Television & Film Actress",
    image: geetaImg,
    bio: "Geita Tyagi is an acclaimed Indian television and film actress, celebrated for bringing memorable characters to life on India's most-loved shows.",
    works: [
      { title: "Jagaddhatri (Zee TV)", role: "Jagaddhatri" },
      { title: "Doli Armaano Ki", role: "Shashikala Singh Rathore" },
      { title: "Aap Ke Aa Jane Se", role: "Bimla Agarwal" },
    ],
    note: "Took personal consultation from Himansshu Ji for herself.",
  },
  {
    name: "Darshan Patil",
    role: "Film Actor & Body Double",
    image: darshanImg,
    bio: "Darshan Patil is a versatile Indian film actor known for his work as a body double for leading stars, with appearances in numerous Hindi films.",
    works: [
      { title: "Dhurandhar", role: "Featured Role" },
      { title: "Thumbs Up", role: "Featured Role" },
      { title: "And many more", role: "Body Double / Actor" },
    ],
    note: "Trusted Himansshu Ji's guidance for personal consultation.",
  },
];

const CelebritiesSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-accent/40 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Trusted by Celebrities
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="text-foreground">Consulted by </span>
            <span className="text-primary italic">Leading Names</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Television & film personalities who placed their trust in Himansshu Ji
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {celebrities.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative bg-card border border-accent/40 rounded-3xl overflow-hidden hover:shadow-xl transition-all"
            >
              <div className="absolute top-5 right-5 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold uppercase tracking-wider shadow-md">
                <Star className="w-3 h-3 fill-current" />
                Celebrity Client
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5">
                <div className="sm:col-span-2 relative aspect-square sm:aspect-auto overflow-hidden bg-gradient-to-br from-primary/10 to-accent/20">
                  <img
                    src={c.image}
                    alt={`${c.name} - ${c.role}`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="sm:col-span-3 p-6 md:p-7">
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">
                    {c.name}
                  </h3>
                  <p className="text-sm text-primary font-semibold mb-3">{c.role}</p>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-5">{c.bio}</p>

                  <div className="space-y-2 mb-5">
                    {c.works.map((w) => (
                      <div
                        key={w.title}
                        className="flex items-start justify-between gap-3 p-3 rounded-xl bg-background border border-border"
                      >
                        <span className="text-sm font-semibold text-foreground">{w.title}</span>
                        <span className="text-xs text-muted-foreground text-right">{w.role}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-border flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground italic">{c.note}</p>
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

export default CelebritiesSection;