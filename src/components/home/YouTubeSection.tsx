import { useState } from "react";
import { motion } from "framer-motion";
import { Play, ExternalLink, X } from "lucide-react";

export const videos = [
  {
    id: "yF9ufbKJYcs",
    thumbnail: "https://img.youtube.com/vi/yF9ufbKJYcs/hqdefault.jpg",
  },
  {
    id: "1ilCeIyAVsI",
    thumbnail: "https://img.youtube.com/vi/1ilCeIyAVsI/hqdefault.jpg",
  },
  {
    id: "WB17QfVWPlE",
    thumbnail: "https://img.youtube.com/vi/WB17QfVWPlE/hqdefault.jpg",
  },
];

const YouTubeSection = () => {
  const [playingId, setPlayingId] = useState<string | null>(null);

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
                <div className="relative aspect-video bg-muted overflow-hidden">
                  {playingId === video.id ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                      title="YouTube video"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  ) : (
                    <button
                      onClick={() => setPlayingId(video.id)}
                      className="block w-full h-full relative cursor-pointer"
                    >
                      <img src={video.thumbnail} alt="Video thumbnail" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Play className="w-7 h-7 text-primary-foreground ml-1" />
                        </div>
                      </div>
                    </button>
                  )}
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
