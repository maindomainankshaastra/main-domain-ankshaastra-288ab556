import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function MobileReportSheet({ open, onOpenChange, service, steps, onContinue, onReview, review }: {
  open: boolean; onOpenChange: (open: boolean) => void; service: string;
  steps: Array<{ title: string; fields: ReactNode }>;
  onContinue: (step: number) => Promise<boolean>; onReview: () => void; review: ReactNode;
}) {
  const [step, setStep] = useState(0);
  const [checking, setChecking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (open && !review) setStep(0); }, [open]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }); }, [step, review]);
  const next = async () => {
    if (checking) return;
    setChecking(true);
    try {
      if (!await onContinue(step)) {
        scrollRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.scrollIntoView({ block: "center", behavior: "smooth" });
        return;
      }
      if (step < steps.length - 1) setStep(step + 1); else onReview();
    } finally { setChecking(false); }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="report-mobile-sheet">
      <div className="mx-auto mb-1 h-1.5 w-12 rounded-full bg-border" />
      <header className="flex items-center gap-3 pr-8">
        <Button variant="ghost" size="icon" aria-label="Previous step" onClick={() => step > 0 && !review ? setStep(step - 1) : onOpenChange(false)}><ChevronLeft className="h-6 w-6" /></Button>
        <div><p className="mb-2 text-sm text-muted-foreground">{review ? "Final Review" : `Step ${step + 1} of ${steps.length}`}</p><DialogTitle className="font-body text-xl leading-tight tracking-normal">{review ? "Review & Pay" : steps[step]?.title}</DialogTitle></div>
      </header>
      <DialogDescription className="sr-only">{service} booking details</DialogDescription>
      {!review && <div className="my-3 flex gap-2" aria-label={`Step ${step + 1} of ${steps.length}`}>{steps.map((item, index) => <span key={item.title} className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-primary" : "bg-border"}`} />)}</div>}
      <div ref={scrollRef} className="report-sheet-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4" onKeyDown={e => { if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") { e.preventDefault(); void next(); } }}>
        {review || <div className="space-y-4"><p className="rounded-lg border border-border bg-muted px-4 py-2.5 text-sm font-semibold">{service}</p>{steps[step]?.fields}</div>}
      </div>
      {!review && <footer className="space-y-2 border-t border-border pt-3"><Button type="button" disabled={checking} className="h-14 w-full rounded-full text-base active:scale-[0.98] transition-transform" onClick={() => void next()}>{step === steps.length - 1 ? "Review & Pay" : "Continue"}</Button><p className="text-center text-xs leading-relaxed text-muted-foreground">Your details are confidential and used only for your report.</p></footer>}
    </DialogContent>
  </Dialog>;
}