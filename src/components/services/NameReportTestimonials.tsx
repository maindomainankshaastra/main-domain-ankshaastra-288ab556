import { Star } from "lucide-react";

const reviews = [
  { name: "Rajesh Kumar", location: "Delhi", text: "The name correction guidance was incredibly accurate. My business started growing within 3 months." },
  { name: "Amit Verma", location: "Bangalore", text: "I was skeptical about numerology, but his insights are profound and practical." },
  { name: "Vikram Singh", location: "Jaipur", text: "Best numerologist I've consulted. The call revealed things about my life nobody else knew." },
];

export default function NameReportTestimonials() {
  return <section aria-labelledby="name-testimonials-heading" className="bg-background px-5 py-12 lg:py-16"><div className="mx-auto max-w-6xl"><h2 id="name-testimonials-heading" className="text-center font-display text-3xl font-bold text-report-ink md:text-4xl">What Our Clients Say</h2><div className="mt-8 grid gap-4 md:grid-cols-3">{reviews.map(review => <article key={review.name} className="name-package-card rounded-lg border border-border p-5"><div className="mb-4 flex gap-1 text-report-gold" aria-label="5 stars">{[0,1,2,3,4].map(star => <Star key={star} className="h-4 w-4 fill-current" />)}</div><blockquote className="text-sm leading-relaxed name-package-muted">“{review.text}”</blockquote><p className="mt-5 font-semibold">{review.name}</p><p className="text-xs name-package-muted">{review.location}</p></article>)}</div></div></section>;
}