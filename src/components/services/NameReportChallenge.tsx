const challenges = [
  { title: "Overwhelmed by Choices", text: "With so many name spellings and opinions to consider, it can be difficult to know which option feels right for you." },
  { title: "Worried About Compatibility", text: "Does your name align with your date of birth? A personal numerological analysis helps you explore that question." },
  { title: "Family Expectations & Identity", text: "You want to respect your family connections while choosing a name that reflects your own identity." },
  { title: "Fear of Getting It Wrong", text: "Changing a name is a personal decision. You need clear guidance, not more confusion." },
];

export default function NameReportChallenge() {
  return <section aria-labelledby="name-challenge-heading" className="name-report-philosophy py-14 lg:py-20">
    <div className="mx-auto max-w-5xl px-5">
      <div className="mx-auto max-w-2xl text-center"><span className="text-xs font-semibold uppercase text-report-gold">The Challenge</span><h2 id="name-challenge-heading" className="mt-4 font-display text-3xl font-bold md:text-5xl">Struggling to Choose the <span className="text-report-gold">Right Name for You?</span></h2><p className="mt-4 leading-relaxed">Your name is part of your identity. Finding the right spelling should bring clarity, not uncertainty.</p></div>
      <div className="mt-10 divide-y divide-report-gold/20 border-y border-report-gold/30">{challenges.map((item, index) => <div key={item.title} className="grid gap-3 py-6 md:grid-cols-[64px_240px_1fr]"><span className="font-display text-3xl text-report-gold">0{index + 1}</span><h3 className="font-display text-xl font-semibold">{item.title}</h3><p className="text-sm leading-relaxed">{item.text}</p></div>)}</div>
    </div>
  </section>;
}