import { useState } from "react";
import { motion } from "framer-motion";
import { Play, ExternalLink } from "lucide-react";

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
    <section className="section-padding relative overflow-hidden">
      {/* Dark premium background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a00] via-[#2d1200] to-[#1a0a00]" />
      
      {/* Warm glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
      
      {/* Grain texture */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
      }} />

      <div className="section-container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber/10 border border-amber/20 text-amber text-sm font-semibold mb-5 tracking-wider uppercase">
            <Play className="w-3.5 h-3.5 fill-amber" />
            Watch & Learn
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5">
            Insightful <span className="bg-gradient-to-r from-amber to-primary bg-clip-text text-transparent">Podcasts</span>
          </h2>
          <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed">
            Explore our collection of insightful videos on numerology, name correction, and spiritual growth.
          </p>
        </motion.div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="group"
            >
              <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm hover:border-amber/20 shadow-lg hover:shadow-[0_20px_60px_-15px_rgba(243,178,41,0.15)] transition-all duration-500 hover:-translate-y-1">
                <div className="relative aspect-video overflow-hidden">
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
                      <img src={video.thumbnail} alt="Video thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                        <motion.div 
                          whileHover={{ scale: 1.1 }}
                          className="w-16 h-16 rounded-full bg-gradient-to-br from-amber to-primary flex items-center justify-center shadow-[0_0_30px_rgba(243,178,41,0.4)]"
                        >
                          <Play className="w-7 h-7 text-white ml-1 fill-white" />
                        </motion.div>
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
          className="text-center"
        >
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-10 py-4 rounded-xl bg-gradient-to-r from-amber to-primary text-foreground font-bold shadow-[0_8px_30px_rgba(243,178,41,0.25)] hover:shadow-[0_12px_40px_rgba(243,178,41,0.35)] hover:-translate-y-0.5 transition-all duration-300"
          >
            <span>More Videos</span>
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default YouTubeSection;
