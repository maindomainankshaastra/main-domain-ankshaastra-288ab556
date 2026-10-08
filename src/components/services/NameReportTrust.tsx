import { Film, Star, Tv } from "lucide-react";
import geita from "@/assets/celebrities/geeta-tyagi.png";
import darshan from "@/assets/celebrities/darshan-patil.jpg";
import prashantt from "@/assets/prashantt-client.webp.asset.json";

const clients = [
  { name: "Geita Tyagi", role: "TV & Film Actress", work: "Jagaddhatri · Doli Armaano Ki", image: geita, icon: Tv },
  { name: "Prashantt Sambargi", role: "South Actor & Entrepreneur", work: "Bigg Boss Kannada", image: prashantt.url, icon: Tv },
  { name: "Darshan Patil", role: "Film Actor", work: "Dhurandhar · Thumbs Up", image: darshan, icon: Film },
];

export default function NameReportTrust() {
  return (
    <section aria-labelledby="name-report-trust-heading" className="name-report-trust border-y border-report-gold/30 bg-background py-14 lg:py-20 font-body">
      <div className="mx-auto max-w-[1560px] px-6 lg:px-10">
        <p className="mb-3 text-center text-sm font-semibold uppercase text-report-gold">Trusted Across India</p>
        <h2 id="name-report-trust-heading" className="mb-10 text-center font-display text-3xl font-bold leading-tight text-report-ink md:text-4xl lg:text-5xl">
          Celebrities, Press & <span className="text-report-gold">48k Global Consultations</span>
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border border-border/50 bg-card px-5 py-6 shadow-sm">
            <div className="mb-2 flex items-center gap-3 text-lg font-semibold text-report-ink"><span className="name-report-google font-body text-3xl font-bold" aria-hidden="true">G</span>Google Reviews</div>
            <div className="flex gap-1 text-report-gold" aria-label="5 stars">{[0, 1, 2, 3, 4].map((star) => <Star key={star} className="h-5 w-5 fill-current" />)}</div>
            <div className="mt-2 flex items-center gap-1 font-display text-4xl font-bold text-report-gold">4.9<Star className="h-8 w-8 fill-current" /></div>
            <p className="text-sm text-muted-foreground">48k Global Consultations</p>
          </article>
          {clients.map((client) => {
            const Icon = client.icon;
            return (
              <article key={client.name} className="flex min-h-[180px] items-center gap-4 rounded-lg border border-border/50 bg-card px-5 py-6 shadow-sm">
                <img src={client.image} alt={client.name} width={104} height={104} loading="lazy" className="h-[104px] w-[88px] shrink-0 rounded-lg object-cover object-top" />
                <div className="min-w-0">
                  <span className="inline-block rounded px-2 py-1 text-[10px] font-bold uppercase bg-report-gold text-report-gold-foreground">Celebrity Client</span>
                  <h3 className="mt-2 font-display text-2xl font-bold leading-tight text-report-ink">{client.name}</h3>
                  <p className="mt-1 text-sm text-report-gold">{client.role}</p>
                  <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground"><Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-report-gold" />{client.work}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}