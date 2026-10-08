import { Link } from "react-router-dom";
import { ArrowRight, Clock, Lock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { nameCorrectionPackages } from "@/data/serviceCatalog";
import { formatINR, payLink } from "@/config/pricing";
import nameCheckCover from "@/assets/name_check_report_cover.webp.asset.json";
import correctionCover from "@/assets/name-blueprint-book.png";

const reports = [
  { title: "Name Check", badge: "Quick Check", description: "Check whether one chosen name aligns with your birth date and numerological profile.", cover: nameCheckCover.url, delivery: "Delivered within 12–24 Hrs." },
  { title: "Name Correction", badge: "Best Value", description: "A personalised name analysis with corrected name options and clear numerological guidance.", cover: correctionCover, delivery: "Delivered within 24–48 Hrs." },
  { title: "Name Correction + Complete Blueprint", badge: "Full Blueprint", description: "Name correction and complete numerology guidance for two people, including numbers, colours and remedies.", cover: correctionCover, delivery: "Delivered within 24–48 Hrs." },
];

export default function NameReportPackages() {
  return (
    <section id="name-correction-packages" className="bg-background py-16 lg:py-20 scroll-mt-24 font-body">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <h2 className="text-center text-3xl md:text-4xl font-semibold mb-10 text-foreground">Select Your Name Report</h2>
        <div className="grid lg:grid-cols-3 gap-6 items-stretch">
          {reports.map((report, index) => {
            const pkg = nameCorrectionPackages.find((item) => item.serviceTitle === report.title);
            if (!pkg) return null;
            const saving = pkg.originalPrice ? pkg.originalPrice - pkg.price : 0;
            const discount = pkg.originalPrice ? Math.round(saving / pkg.originalPrice * 100) : 0;
            return (
              <article key={report.title} id={index === 0 ? "package-name-check" : index === 1 ? "package-name-correction" : "package-complete-blueprint"} className={`relative flex flex-col rounded-lg border bg-card text-card-foreground p-6 scroll-mt-28 ${index === 1 ? "border-report-gold shadow-md" : "border-border"}`}>
                <span className={`self-start px-3 py-1.5 rounded-full text-xs uppercase font-semibold mb-3 ${index === 1 ? "bg-report-gold text-report-gold-foreground" : "bg-report-ink text-report-ink-foreground"}`}>{report.badge}</span>
                <div className="h-64 md:h-72 flex items-center justify-center mb-4">
                  <img src={report.cover} alt={`${pkg.name} report cover`} className="max-h-full max-w-full object-contain" loading="lazy" />
                </div>
                {index === 0 && <div className="flex items-center gap-1 text-sm mb-2"><Star className="w-4 h-4 text-report-gold fill-current" /><span className="font-semibold">4.9</span></div>}
                <h3 className="text-3xl leading-tight font-semibold min-h-[76px] mb-4">{pkg.name}</h3>
                <p className="text-muted-foreground text-base leading-relaxed mb-8 flex-1">{report.description}</p>
                <div className="flex items-baseline flex-wrap gap-3 mb-2">
                  <span className="font-display text-4xl font-bold">{formatINR(pkg.price)}</span>
                  {pkg.originalPrice && <span className="text-muted-foreground line-through text-sm">{formatINR(pkg.originalPrice)}</span>}
                </div>
                {saving > 0 && <div className="flex flex-wrap gap-2 text-report-saving text-xs font-semibold mb-6"><span className="bg-report-saving/10 px-2 py-1 rounded-full">Save {formatINR(saving)}</span><span className="py-1">({discount}% OFF)</span></div>}
                <Button asChild size="lg" className={`w-full h-12 rounded-full text-base font-semibold ${index === 1 ? "bg-report-gold text-report-gold-foreground hover:bg-report-gold/90" : "bg-report-ink text-report-ink-foreground hover:bg-report-ink/90"}`}>
                  <Link to={payLink(pkg.serviceTitle, pkg.price, pkg.formType)} aria-label={`Get ${pkg.name} Report`}>Get Report <ArrowRight /></Link>
                </Button>
                <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground mt-4"><span><Clock className="inline w-3 h-3 mr-1" />{report.delivery}</span><span><Lock className="inline w-3 h-3 mr-1" />Secure</span></div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}