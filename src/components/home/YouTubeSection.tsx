import { motion } from "framer-motion";
import { Play, ExternalLink } from "lucide-react";

const videos = [
  {
    id: "VIDEO_ID_1",
    title: "Understanding Numerology Basics",
    thumbnail: "https://img.youtube.com/vi/VIDEO_ID_1/hqdefault.jpg",
    placeholder: true,
  },
  {
    id: "VIDEO_ID_2",
    title: "How Name Correction Transforms Lives",
    thumbnail: "https://img.youtube.com/vi/VIDEO_ID_2/hqdefault.jpg",
    placeholder: true,
  },
  {
    id: "VIDEO_ID_3",
    title: "Lal Kitab Remedies Explained",
    thumbnail: "https://img.youtube.com/vi/VIDEO_ID_3/hqdefault.jpg",
    placeholder: true,
  },
];

const YouTubeSection = () => {
  return (
    <section className="section-padding bg-muted/50">
      <div className="section-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            Watch & Learn
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Insightful <span className="text-gradient-primary">Podcasts</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore our collection of insightful videos on numerology, name correction, and spiritual growth.
          </p>
        </motion.div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-10">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group"
            >
              <div className="bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-muted overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-7 h-7 text-primary-foreground ml-1" />
                    </div>
                  </div>
                  {/* Overlay number */}
                  <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-foreground/80 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-sm font-bold text-background">{index + 1}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-display font-semibold text-foreground text-base line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    By Himansshu Agarwal Ji
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* More Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <span>More Videos</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default YouTubeSection;
