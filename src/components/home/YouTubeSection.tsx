import { useState } from "react";
import { motion } from "framer-motion";
import { Play, ExternalLink } from "lucide-react";

export const videos = [
  { id: "yF9ufbKJYcs", thumbnail: "https://img.youtube.com/vi/yF9ufbKJYcs/hqdefault.jpg" },
  { id: "1ilCeIyAVsI", thumbnail: "https://img.youtube.com/vi/1ilCeIyAVsI/hqdefault.jpg" },
  { id: "WB17QfVWPlE", thumbnail: "https://img.youtube.com/vi/WB17QfVWPlE/hqdefault.jpg" },
];

const YouTubeSection = () => {
  const [playingId, setPlayingId] = useState<string | null>(null);

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
            <span className="text-foreground">Insightful </span>
            <span className="text-primary italic">Podcasts</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Wisdom on numerology, name correction, and spiritual growth
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {videos.map((video, i) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="relative rounded-2xl overflow-hidden border border-accent/40 bg-card shadow-sm hover:shadow-lg transition-all"
            >
              <div className="relative aspect-video">
                {playingId === video.id ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                    title="YouTube video"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : (
                  <button onClick={() => setPlayingId(video.id)} className="block w-full h-full relative cursor-pointer group">
                    <img src={video.thumbnail} alt="Video thumbnail" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-secondary/30 group-hover:bg-secondary/20 transition-colors flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-amber group-hover:scale-110 transition-transform">
                        <Play className="w-7 h-7 text-primary-foreground ml-1 fill-primary-foreground" />
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary hover:bg-orange-dark text-primary-foreground font-semibold px-8 py-3.5 rounded-lg shadow-amber transition-all hover:-translate-y-0.5"
          >
            <span>More Videos</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default YouTubeSection;
