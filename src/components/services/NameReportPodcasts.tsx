import { useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import numerology from "@/assets/name-podcast-numerology.webp";
import dhoniKohli from "@/assets/name-podcast-dhoni_kohli.webp";
import predictions from "@/assets/name-podcast-predictions.webp";

const podcasts = [
  { id: "yF9ufbKJYcs", thumbnail: numerology, title: "Numerology and your future" },
  { id: "1ilCeIyAVsI", thumbnail: dhoniKohli, title: "Dhoni, Kohli and numerology" },
  { id: "WB17QfVWPlE", thumbnail: predictions, title: "Ankshaastra predictions" },
];

export default function NameReportPodcasts() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  return (
    <section aria-labelledby="name-podcasts-heading" className="name-report-philosophy py-12 lg:py-16 font-body">
      <div className="mx-auto max-w-[1200px] px-5">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase text-report-gold">Learn More</span>
          <h2 id="name-podcasts-heading" className="mt-3 font-display text-3xl font-bold md:text-4xl">Insightful <span className="text-report-gold">Podcasts</span></h2>
          <p className="mt-4 text-base leading-relaxed md:text-lg">Learn how numerology and Vedic principles can shape your name and destiny.</p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3 lg:mt-10">
          {podcasts.map((video) => <article key={video.id} className="rounded-lg border border-report-gold/40 bg-report-ink p-3"><div className="relative aspect-video overflow-hidden rounded-md">
            {playingId === video.id ? <iframe src={`https://www.youtube.com/embed/${video.id}?autoplay=1`} title={video.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full" /> : <Button variant="ghost" aria-label={`Play ${video.title}`} onClick={() => setPlayingId(video.id)} className="group relative block h-full w-full rounded-none p-0 hover:bg-transparent"><img src={video.thumbnail} alt={video.title} loading="lazy" className="h-full w-full object-cover" /><span className="absolute inset-0 flex items-center justify-center"><span className="name-podcast-play flex h-16 w-16 items-center justify-center rounded-full"><Play className="h-7 w-7 fill-current" /></span></span></Button>}
          </div></article>)}
        </div>
      </div>
    </section>
  );
}