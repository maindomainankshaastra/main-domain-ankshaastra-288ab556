import { ArrowRight, Flower2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { varshphalFaqs } from "@/data/varshphalReport";
import expert from "@/assets/name-report-expert.webp";

// Existing brand consultation feedback, not claims of Varshphal purchases.
const reviews = [
  { name: "Amit Verma", text: "I was skeptical about numerology, but his insights are profound and practical." },
  { name: "Vikram Singh", text: "Best numerologist I've consulted. The call revealed things about my life nobody else knew." },
];

export default function VarshphalSections() {
  return <>
    <section className="varshphal-feedback section-padding" aria-labelledby="varshphal-reviews-heading">
      <div className="section-container">
        <h2 id="varshphal-reviews-heading" className="varshphal-section-title text-center text-3xl italic sm:text-4xl">What Our Users Say</h2>
        <p className="varshphal-body mt-3 text-center text-sm">Feedback from Ankshaastra consultation clients</p>
        <div className="varshphal-review-track mt-8 flex gap-5 overflow-x-auto pb-3">{reviews.map(review => <article key={review.name} className="varshphal-review flex min-h-64 w-[340px] max-w-[85vw] shrink-0 flex-col rounded-lg p-7">
          <div className="varshphal-check flex gap-1" aria-label="5 stars">{[0,1,2,3,4].map(star => <Star key={star} className="h-4 w-4 fill-current" />)}</div>
          <blockquote className="mt-5 flex-1 text-base italic leading-relaxed">“{review.text}”</blockquote>
          <div className="mt-6 flex items-center gap-3"><span className="varshphal-edition flex h-10 w-10 items-center justify-center rounded-full font-bold">{review.name.charAt(0)}</span><strong className="text-sm">{review.name}</strong></div>
        </article>)}</div>
      </div>
    </section>
    <section className="varshphal-feedback section-padding">
      <div className="section-container grid items-center gap-8 md:grid-cols-[.8fr_1.8fr] lg:gap-14">
        <img src={expert} alt="Himansshu Agarwal Ji" width={600} height={750} loading="lazy" className="mx-auto aspect-square w-full max-w-sm rounded-lg object-cover object-top" />
        <div><p className="varshphal-check text-xs font-bold">A NOTE FROM HIMANSSHU AGARWAL JI</p><h2 className="varshphal-section-title mt-5 text-3xl italic leading-tight sm:text-4xl">Understand your year.<br />Make more informed decisions.</h2><div className="varshphal-note-rule my-6 h-0.5 w-14" /><p className="varshphal-body leading-relaxed">Your Varshphal Report brings your annual chart, Muntha and Tajik astrology principles together in plain language. Explore your year's main focus, month-by-month guidance and personalised remedies for the next 12 months.</p><div className="mt-6 flex flex-wrap gap-3">{["Annual Chart & Muntha", "Personalised Guidance", "Prepared with Care"].map(item => <span key={item} className="varshphal-edition rounded-full px-4 py-2 text-sm">{item}</span>)}</div></div>
      </div>
    </section>
    <section className="varshphal-closing section-padding text-center">
      <div className="section-container"><Flower2 className="mx-auto h-12 w-12" strokeWidth={1} /><h2 className="mt-6 font-display text-4xl leading-tight">Your year has a story.<br />It's time you read it.</h2><p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed">Created from your exact birth date, time and place, your Varshphal Report helps you understand your annual theme, month-by-month outlook and the key periods shaping 2027. A clearer view of the year ahead, in a detailed PDF to keep forever.</p><Button asChild size="lg" className="varshphal-closing-button mt-7 h-auto min-h-12 rounded-full px-7 py-3"><a href="#varshphal-booking">Unlock My Varshphal Report <ArrowRight /></a></Button><p className="mt-4 text-xs">Exact birth time required · Personalised PDF via email</p></div>
    </section>
    <section className="section-padding" aria-labelledby="varshphal-faq-heading"><div className="section-container max-w-4xl"><h2 id="varshphal-faq-heading" className="varshphal-section-title text-center text-3xl sm:text-4xl">Frequently Asked Questions</h2><Accordion type="single" collapsible className="mt-8">{varshphalFaqs.map((faq, index) => <AccordionItem key={faq.question} value={`faq-${index}`}><AccordionTrigger className="gap-4 text-left text-base">{faq.question}</AccordionTrigger><AccordionContent className="varshphal-body text-base leading-relaxed">{faq.answer}</AccordionContent></AccordionItem>)}</Accordion></div></section>
  </>;
}