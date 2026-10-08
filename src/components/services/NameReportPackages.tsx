import { Link } from "react-router-dom";
import { ArrowRight, Check, Clock, Lock, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { nameCorrectionPackages } from "@/data/serviceCatalog";
import { formatINR, payLink } from "@/config/pricing";
import nameCheckCover from "@/assets/name-check-package.webp";
import correctionCover from "@/assets/name-correction-package.webp";
import blueprintCover from "@/assets/complete-name-package.webp";

const reports = [
  { title: "Name Check", badge: "Quick Check", description: "Check whether one chosen name aligns with the person's birth date and numerological profile.", cover: nameCheckCover, delivery: "Email within 3 Hours" },
  { title: "Name Correction", badge: "Best Value", description: "A personalised name analysis with corrected name options and clear numerological guidance.", cover: correctionCover, delivery: "Email within 3 Hours" },
  { title: "Name Correction + Complete Blueprint", badge: "Full Blueprint", description: "Name correction and complete numerology guidance for two people, including numbers, colours and remedies.", cover: blueprintCover, delivery: "Email within 3 Hours" },
];

const nameCheckInclusions = [
  "Quick Name Compatibility Check",
  "Mulank & Bhagyank Overview",
  "Clear Yes/No Recommendation",
  "Expert Analysis Summary",
];

export default function NameReportPackages() {
  return (
    <section id="name-correction-packages" className="bg-background py-16 lg:py-20 scroll-mt-24 font-body">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <h2 className="text-center text-3xl md:text-4xl font-semibold mb-10 text-foreground">Select Your Name Report</h2>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
          {reports.map((report, index) => {
            const pkg = nameCorrectionPackages.find((item) => item.serviceTitle === report.title);
            if (!pkg) return null;
            const saving = pkg.originalPrice ? pkg.originalPrice - pkg.price : 0;
            const discount = pkg.originalPrice ? Math.round(saving / pkg.originalPrice * 100) : 0;
            return (
              <article key={report.title} id={index === 0 ? "package-name-check" : index === 1 ? "package-name-correction" : "package-complete-blueprint"} className={`name-package-card relative flex flex-col overflow-hidden rounded-lg border scroll-mt-28 ${index === 1 ? "border-report-gold shadow-md" : "border-border"}`}>
                <div className="flex flex-col p-6 flex-1">
                <span className={`self-start px-3 py-1.5 rounded-full text-xs uppercase font-semibold mb-3 ${index === 1 ? "bg-report-gold text-report-gold-foreground" : "bg-report-ink text-report-ink-foreground"}`}>{report.badge}</span>
                <div className="h-72 flex items-center justify-center mb-4">
                  <img src={report.cover} alt={`${pkg.name} report cover`} className="h-full max-w-full object-contain" loading="lazy" />
                </div>
                {index === 0 && <div className="flex items-center gap-2 text-sm mb-4"><Star className="w-5 h-5 text-report-gold fill-current" /><span className="font-semibold">4.9</span><span className="name-package-muted">(18k sold)</span></div>}
                <h3 className="text-3xl leading-tight font-semibold mb-8">{pkg.name}</h3>
                <p className="name-package-muted text-base leading-relaxed mb-12 flex-1">{report.description}</p>
                <div className="flex items-baseline flex-wrap gap-3 mb-2">
                  <span className="font-display text-4xl font-bold">{formatINR(pkg.price)}</span>
                  {pkg.originalPrice && <span className="name-package-muted line-through text-sm">{formatINR(pkg.originalPrice)}</span>}
                </div>
                {saving > 0 && <div className="flex flex-wrap gap-2 text-report-saving text-xs font-semibold mb-6"><span className="bg-report-saving/10 px-2 py-1 rounded-full">Save {formatINR(saving)}</span><span className="py-1">({discount}% OFF)</span></div>}
                <Button asChild size="lg" className={`w-full h-14 rounded-full text-base font-semibold ${index === 1 ? "bg-report-gold text-report-gold-foreground hover:bg-report-gold/90" : "bg-report-ink text-report-ink-foreground hover:bg-report-ink/90"}`}>
                  <Link to={payLink(pkg.serviceTitle, pkg.price, pkg.formType)} aria-label={`Get ${pkg.name} Report`}>Get Report <ArrowRight /></Link>
                </Button>
                </div>
                <div className="name-package-details border-t border-border px-6 pt-7 pb-6">
                  {index === 0 && <>
                    <h4 className="flex items-center gap-3 font-body text-xs font-bold uppercase mb-6"><Sparkles className="w-5 h-5 text-report-gold" />What's Inside</h4>
                    <ul className="space-y-4 mb-12 name-package-muted text-base">
                      {nameCheckInclusions.map((item) => <li key={item} className="flex items-start gap-4"><Check className="w-5 h-5 shrink-0 text-report-saving mt-0.5" /><span>{item}</span></li>)}
                    </ul>
                  </>}
                  <div className={`flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm name-package-muted ${index === 0 ? "border-t border-border pt-5" : ""}`}><span className="inline-flex items-center gap-2"><Clock className="w-4 h-4 text-report-gold" />{report.delivery}</span><span className="inline-flex items-center gap-2"><Lock className="w-4 h-4 text-report-gold" />Secure Payment</span></div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}