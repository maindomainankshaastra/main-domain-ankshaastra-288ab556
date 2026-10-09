import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Clock, Lock, Star } from "lucide-react";
import { nameCorrectionPackages } from "@/data/serviceCatalog";
import { nameReportOffers } from "@/data/nameReportOffers";
import { formatINR } from "@/config/pricing";

export default function NameReportPackages({ selected, onSelect, onBook }: { selected: number; onSelect: (index: number) => void; onBook: (index: number) => void }) {
  return <section id="name-correction-packages" aria-labelledby="name-packages-heading" className="scroll-mt-20 bg-background px-4 py-10 lg:py-16 font-body">
    <div className="mx-auto max-w-6xl">
      <p className="text-center text-xs font-semibold uppercase text-report-gold">Choose Your Package</p>
      <h2 id="name-packages-heading" className="mt-3 text-center font-display text-3xl font-bold text-report-ink md:text-4xl">Select Your <span className="text-report-gold">Personalised Report</span></h2>
      <div role="tablist" aria-label="Report packages" className="my-6 grid grid-cols-3 gap-1 rounded-lg border border-border bg-card p-1 lg:hidden">{nameReportOffers.map((report, index) => <Button key={report.tab} role="tab" id={`report-tab-${index}`} aria-selected={selected === index} aria-controls={`report-panel-${index}`} variant={selected === index ? "default" : "ghost"} onClick={() => onSelect(index)} className={`h-10 px-1 text-xs ${selected === index ? "bg-report-ink text-report-ink-foreground hover:bg-report-ink/90" : "text-report-ink"}`}>{report.tab}</Button>)}</div>
      <div className="grid items-stretch gap-5 lg:mt-8 lg:grid-cols-3">
        {nameReportOffers.map((report, index) => {
          const pkg = nameCorrectionPackages.find(item => item.serviceTitle === report.serviceTitle);
          if (!pkg) return null;
          const saving = (pkg.originalPrice || pkg.price) - pkg.price;
          return <article id={`report-panel-${index}`} key={report.title} aria-label={`${report.title} package`} className={`name-package-card overflow-hidden rounded-lg border ${index === 1 ? "border-report-gold" : "border-border"} ${selected === index ? "flex" : "hidden lg:flex"} flex-col`}>
            <div className="grid grid-cols-[100px_minmax(0,1fr)] gap-4 p-4 lg:grid-cols-1 lg:p-5">
              <div className="flex flex-col items-center"><span className="mb-3 self-start rounded bg-report-gold px-2 py-1 text-[10px] font-bold uppercase text-report-gold-foreground">{report.badge}</span><img src={report.cover} alt={`${report.title} report cover`} className="h-36 w-full object-contain lg:h-56" loading="lazy" /></div>
              <div>{report.rating && <div className="mb-2 flex flex-wrap items-center gap-1 text-xs"><Star className="h-4 w-4 fill-current text-report-gold" /><strong>{report.rating}</strong><span className="name-package-muted">({report.sold})</span></div>}<h3 className="font-display text-2xl font-bold leading-tight lg:text-3xl">{report.title}</h3><p className="mt-2 text-xs leading-relaxed name-package-muted lg:text-sm">{report.description}</p></div>
            </div>
            <div className="px-4 pb-4 lg:px-5"><div className="flex flex-wrap items-baseline gap-3"><span className="font-display text-3xl font-bold">{formatINR(pkg.price)}</span>{pkg.originalPrice && <span className="text-xs line-through name-package-muted">{formatINR(pkg.originalPrice)}</span>}{saving > 0 && <span className="text-xs font-semibold text-report-saving">Save {formatINR(saving)}</span>}</div><Button onClick={() => onBook(index)} aria-label={`Get ${report.title} Report`} className="mt-3 h-11 w-full bg-report-ink text-report-ink-foreground hover:bg-report-ink/90">Get Report <ArrowRight /></Button></div>
            <div className="name-package-details flex-1 border-t border-border px-4 py-4 lg:px-5"><h4 className="mb-3 text-xs font-bold uppercase">What's Inside</h4><ul className="space-y-2 text-xs leading-relaxed name-package-muted lg:text-sm">{report.inclusions.map(item => <li key={item} className="flex items-start gap-2"><Check className="h-4 w-4 shrink-0 text-report-saving" /><span>{item}</span></li>)}</ul></div>
            <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3 text-[11px] name-package-muted"><span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-report-gold" />{report.delivery}</span><span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5 text-report-gold" />Secure Payment</span></div>
          </article>;
        })}
      </div>
    </div>
  </section>;
}
