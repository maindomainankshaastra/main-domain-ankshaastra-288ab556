import expertPhoto from "@/assets/name-report-expert.webp";

export default function NameReportExpert() {
  return (
    <section aria-labelledby="name-expert-heading" className="border-y border-report-gold/30 bg-background py-12 lg:py-16 font-body">
      <div className="mx-auto grid max-w-[1120px] gap-8 px-5 md:grid-cols-2 md:items-center lg:gap-12">
        <img src={expertPhoto} alt="Himansshu Agarwal Ji seated during a podcast" loading="lazy" width={500} height={625} className="aspect-[4/5] w-full rounded-lg object-cover object-center" />
        <div>
          <p className="text-xs font-semibold uppercase text-report-gold">Meet the Expert</p>
          <h2 id="name-expert-heading" className="mt-3 font-display text-3xl font-bold text-report-ink md:text-4xl">Himansshu Agarwal Ji</h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed name-package-muted">
            <p>A widely recognized <strong className="text-report-gold">Name Correction Expert</strong> and <strong className="text-report-gold">Celebrity Astro-Numerologist</strong> with over 10 years of experience, he specializes in numerologically aligned name spelling and name correction. Through <strong className="text-report-ink">Ankshaastra</strong>, he has guided thousands of families in choosing meaningful and numerologically compatible names based on your date of birth, helping create a harmonious connection between your name and birth details.</p>
            <p>He is also a <strong className="text-report-gold">Lal Kitab Remedy Specialist</strong>, offering personalized guidance based on traditional Lal Kitab principles. His expertise has been trusted by families, professionals, entrepreneurs, and celebrities seeking guidance in numerology, name correction, and remedies. Through Ankshaastra, his aim is to make these ancient sciences simple, practical, and accessible to everyone.</p>
          </div>
          <div className="mt-6 grid grid-cols-3 border-y border-report-gold/30 text-center">
            {[{ value: "48k", label: "Global Consultations" }, { value: "10+", label: "Years Research" }, { value: "4.9★", label: "User Rating" }].map((stat) => <div key={stat.label} className="border-r border-report-gold/30 px-2 py-5 last:border-r-0"><p className="font-display text-3xl font-bold text-report-ink">{stat.value}</p><p className="mt-1 text-[10px] font-semibold uppercase name-package-muted sm:text-xs">{stat.label}</p></div>)}
          </div>
        </div>
      </div>
    </section>
  );
}