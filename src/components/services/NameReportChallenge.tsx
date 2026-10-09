const challenges = [
  { title: "Career & Professional Growth", text: "Experiencing career stagnation or seeking better opportunities? Explore how your name's numerological value aligns with your date of birth." },
  { title: "Relationships & Compatibility", text: "Navigating relationship challenges or seeking greater harmony in personal connections? Discover the numerological aspects of your name." },
  { title: "Financial Growth & Opportunities", text: "Looking to improve your financial prospects and unlock new opportunities? Explore your name's numerological alignment for personalised insights." },
  { title: "Confusion About Name Spelling", text: "Unsure whether your current name spelling is numerologically suitable? Get expert guidance on possible spelling corrections based on your date of birth." },
];

export default function NameReportChallenge() {
  return <section aria-labelledby="name-challenge-heading" className="name-report-philosophy py-14 lg:py-20">
    <div className="mx-auto max-w-5xl px-5">
      <div className="mx-auto max-w-2xl text-center"><span className="text-xs font-semibold uppercase text-report-gold">THE CHALLENGE</span><h2 id="name-challenge-heading" className="mt-4 font-display text-3xl font-bold md:text-5xl">Struggling to Choose the <span className="text-report-gold">Right Name Spelling?</span></h2><p className="mt-4 leading-relaxed">Your name is an important part of your identity. If you're exploring name correction, understanding its numerological significance can help you make a more informed decision.</p></div>
      <div className="mt-10 divide-y divide-report-gold/20 border-y border-report-gold/30">{challenges.map((item, index) => <div key={item.title} className="grid gap-3 py-6 md:grid-cols-[64px_240px_1fr]"><span className="font-display text-3xl text-report-gold">0{index + 1}</span><h3 className="font-display text-xl font-semibold">{item.title}</h3><p className="text-sm leading-relaxed">{item.text}</p></div>)}</div>
    </div>
  </section>;
}