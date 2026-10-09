import unseen from "@/assets/press-unseen-times.webp";
import hindustan from "@/assets/press-hindustan-bytes.webp";
import dailyhunt from "@/assets/press-dailyhunt.webp";
import inc91 from "@/assets/press-inc91.webp";

const claims = ["10+ YEARS EXPERIENCE", "CELEBRITY ASTRO-NUMEROLOGIST", "48K GLOBAL CONSULTATIONS", "99% SATISFACTION", "WIDE MEDIA COVERAGE", "4.9 STAR AVERAGE RATING"];
const logos = [{ name: "Hindustan Bytes", image: hindustan }, { name: "Unseen Times", image: unseen }, { name: "INC91", image: inc91 }, { name: "Dailyhunt", image: dailyhunt }];

export default function NameReportMarquee({ media = false }: { media?: boolean }) {
  return <div className={media ? "report-media-marquee overflow-hidden" : "report-credibility-marquee overflow-hidden border-y border-report-gold/40"} role="region" aria-label={media ? "Media coverage" : "Ankshaastra experience and reputation"} tabIndex={0}>
    <div className="report-marquee-track flex w-max">
      {[0, 1].map(copy => <div key={copy} aria-hidden={copy === 1 ? true : undefined} className="flex shrink-0 items-center">
        {media ? logos.map(logo => <div key={logo.name} className="flex h-24 w-44 shrink-0 items-center justify-center px-6"><img src={logo.image} alt={logo.name} className="max-h-14 max-w-full object-contain" loading="lazy" /></div>) : claims.map(claim => <span key={claim} className="flex shrink-0 items-center gap-8 px-4 py-3 text-xs font-bold"><span>{claim}</span><span aria-hidden="true" className="text-report-gold/50">|</span></span>)}
      </div>)}
    </div>
  </div>;
}