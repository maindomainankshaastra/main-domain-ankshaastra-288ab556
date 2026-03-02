import { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { videos } from "@/components/home/YouTubeSection";

const Podcast = () => {
  const [playingId, setPlayingId] = useState<string | null>(null);

  return (
    <Layout>
      <SEOHead title="Insightful Podcasts" description="Watch numerology insights, Lal Kitab remedies, and name correction tips by Himansshu Agarwal Ji on the Ankshaastra podcast." canonical="/podcast" />
      <div className="section-container section-padding">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
          The <span className="text-gradient-primary">Ankshaastra Podcast</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mb-10">
          Listen to insightful conversations about numerology, life guidance, and spiritual wisdom.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {videos.map((video) => (
            <div key={video.id} className="group">
              <div className="bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300">
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
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Podcast;