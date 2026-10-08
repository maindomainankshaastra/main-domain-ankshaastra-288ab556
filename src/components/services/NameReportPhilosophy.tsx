const analysis = [
  { title: "Rajyog Analysis", text: "Powerful number combinations are studied to identify potential for leadership, recognition, prosperity and favourable opportunities." },
  { title: "Loshu Grid Analysis", text: "Your personal grid reveals present and missing numbers, natural strengths, emotional patterns and areas requiring balance." },
  { title: "First & Full Name Analysis", text: "Your first name, complete name and compound number are reviewed together for identity, public vibration and birth-date alignment." },
];

export default function NameReportPhilosophy() {
  return (
    <>
      <section aria-label="As featured in" className="border-y border-report-gold/30 bg-background py-10 font-body">
        <p className="mb-7 text-center text-xs font-semibold uppercase text-report-gold">As Featured In</p>
        <div className="mx-auto grid max-w-7xl grid-cols-2 items-center gap-x-6 gap-y-7 bg-card px-6 py-6 text-center sm:grid-cols-3 lg:grid-cols-6">
          {["Hindustan Bytes", "Unseen Times", "India Times Online", "India Breaking Buzz", "INC91", "Dailyhunt"].map((name) => <span key={name} className="font-display text-lg font-bold text-report-ink">{name}</span>)}
        </div>
      </section>
      <section aria-labelledby="name-philosophy-heading" className="name-report-philosophy py-16 lg:py-20 font-body">
        <div className="mx-auto max-w-[1000px] px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-semibold uppercase text-report-gold">The Philosophy</span>
            <h2 id="name-philosophy-heading" className="mt-4 font-display text-3xl font-bold leading-tight md:text-4xl">More Than Just a <span className="text-report-gold">Beautiful Name</span></h2>
            <p className="mt-4 text-base leading-relaxed">You are unique. Numerology helps identify names that resonate with your natural tendencies — supporting harmony, confidence, and a positive foundation.</p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {analysis.map((item, index) => (
              <article key={item.title} className="rounded-lg border border-report-gold/30 bg-report-ink px-6 py-6">
                <span className="font-display text-xs text-report-gold">0{index + 1}</span>
                <h3 className="mt-2 font-display text-xl font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}