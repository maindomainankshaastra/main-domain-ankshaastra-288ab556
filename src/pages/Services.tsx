import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { 
  Phone, Video, MessageSquare, User, Baby, Building2, Calendar,
  Armchair, Building, ArrowRight, Sparkles, ChevronDown, ExternalLink,
  Gem, Zap, Car, Smartphone, Home as HomeIcon, Heart, Tag, Users,
  UserCheck, Landmark, MapPin, Grid3X3, Store, Paintbrush, Crown,
  type LucideIcon
} from "lucide-react";

/* ─── Service icon map for decorative per-card icons ─── */
const serviceIconMap: Record<string, LucideIcon> = {
  "1:1 Audio Call": Phone,
  "1:1 Video Call": Video,
  "Name Correction": Sparkles,
  "Lucky Vehicle Number": Car,
  "Lucky Mobile Number": Smartphone,
  "Lucky Flat / Plot Number": HomeIcon,
  "C-Section Baby Dates": Calendar,
  "Perfect Baby Name": Baby,
  "Relationship Analysis": Heart,
  "Business Name Correction": Building2,
  "Business Phone Number": Phone,
  "Brand Tagline Correction": Tag,
  "Business Partner Compatibility": Users,
  "Director Name Compatibility": UserCheck,
  "Company Registration Date": Landmark,
  "Bank Account Opening Date": Calendar,
  "Land Purchase Date": MapPin,
  "CEO/MD Cabin Sitting": Crown,
  "Management Sitting": Armchair,
  "Cash Counter Direction": Store,
  "Office Interior Colors": Paintbrush,
  "Departmental Sitting": Grid3X3,
  "Plot Number Analysis": MapPin,
  "Exhibition Stall Number": Store,
  "Commercial Space Analysis": Building,
};

const serviceCategories = [
  {
    id: "remedial",
    title: "Remedial Guidance",
    subtitle: "1:1 Call Consultation",
    description: "Personal guidance and clarity through direct consultation with Himansshu Agarwal Ji.",
    icon: Phone,
    gradient: "from-primary to-amber",
    borderAccent: "hsl(var(--orange))",
    services: [
      { title: "1:1 Audio Call", description: "A private audio call designed for detailed discussion while maintaining flexibility and confidentiality.", price: "₹1,987", rawPrice: 1987, link: "/consultation", highlight: true },
      { title: "1:1 Video Call", description: "A face-to-face consultation for deeper engagement, visual explanations, and interactive guidance.", price: "₹3,648", rawPrice: 3648, link: "/consultation", highlight: true },
    ]
  },
  {
    id: "personal",
    title: "Personal Numerology",
    subtitle: "Identity Alignment",
    description: "Aligning personal identity elements with numerological principles for smoother life progress.",
    icon: User,
    gradient: "from-blue-500 to-cyan-500",
    borderAccent: "hsl(210, 80%, 55%)",
    services: [
      { title: "Name Correction", description: "Analysis and correction of name vibration to support smoother personal and professional progress.", price: "₹1,997", rawPrice: 1997, link: "https://empower.ankshaastra.com", external: true, highlight: true },
      { title: "Lucky Vehicle Number", description: "Compatibility analysis of vehicle numbers for comfort, safety, and daily harmony.", price: "₹998", rawPrice: 998, link: "/payment" },
      { title: "Lucky Mobile Number", description: "Assessment of mobile number vibration and its influence on communication and opportunities.", price: "₹998", rawPrice: 998, link: "/payment" },
      { title: "Lucky Flat / Plot Number", description: "Suitability analysis of residential numbers before purchase or occupancy.", price: "₹998", rawPrice: 998, link: "/payment" },
    ]
  },
  {
    id: "family",
    title: "Baby, Family & Relationships",
    subtitle: "Emotional Harmony",
    description: "Designed for family planning, relationships, and emotional harmony.",
    icon: Baby,
    gradient: "from-pink-500 to-rose-500",
    borderAccent: "hsl(340, 70%, 55%)",
    services: [
      { title: "C-Section Baby Dates", description: "Numerology-based guidance for selecting supportive C-section birth dates within medically approved range.", price: "₹1,100", rawPrice: 1100, link: "/services/csection-dates" },
      { title: "Perfect Baby Name", description: "Carefully aligned baby name suggestions based on numerology principles for foundational harmony.", price: "₹1,997", rawPrice: 1997, link: "https://empower.ankshaastra.com", external: true, highlight: true },
      { title: "Relationship Analysis", description: "Analysis of emotional dynamics and compatibility between partners for healthier communication.", price: "₹987", rawPrice: 987, link: "/payment" },
    ]
  },
  {
    id: "business",
    title: "Business & Brand",
    subtitle: "Strategic Numerology",
    description: "Business growth, branding, and stability through strategic numerology alignment.",
    icon: Building2,
    gradient: "from-emerald to-teal-500",
    borderAccent: "hsl(var(--emerald))",
    services: [
      { title: "Business Name Correction", description: "Strategic analysis to identify misalignment and suggest corrected options for brand resonance.", price: "₹3,878", rawPrice: 3878, link: "/payment", highlight: true },
      { title: "Business Phone Number", description: "Selection or evaluation of business phone numbers aligned with brand numerology.", price: "₹1,499", rawPrice: 1499, link: "/payment" },
      { title: "Brand Tagline Correction", description: "Analysis of brand taglines to ensure wording aligns with business intent and positioning.", price: "₹1,997", rawPrice: 1997, link: "/payment" },
      { title: "Business Partner Compatibility", description: "Compatibility analysis between business partners' names for smoother collaboration.", price: "₹1,997", rawPrice: 1997, link: "/payment" },
      { title: "Director Name Compatibility", description: "Evaluation of director or leadership names to assess alignment with company vibration.", price: "₹1,997", rawPrice: 1997, link: "/payment" },
    ]
  },
  {
    id: "dates",
    title: "Company & Financial",
    subtitle: "Date Selection",
    description: "Support important business and financial decisions with auspicious date selection.",
    icon: Calendar,
    gradient: "from-violet-500 to-purple-500",
    borderAccent: "hsl(260, 60%, 55%)",
    services: [
      { title: "Company Registration Date", description: "Selection of supportive dates for company registration to encourage smoother beginnings.", price: "₹1,997", rawPrice: 1997, link: "/payment" },
      { title: "Bank Account Opening Date", description: "Numerology-based date selection for opening business bank accounts, supporting financial flow.", price: "₹1,997", rawPrice: 1997, link: "/payment" },
      { title: "Land Purchase Date", description: "Guidance on selecting favourable dates for land or property purchase for stability.", price: "₹1,997", rawPrice: 1997, link: "/payment" },
    ]
  },
  {
    id: "vastu",
    title: "Office Vastu",
    subtitle: "Spatial Numerology",
    description: "Integration of numerology with workspace planning for improved productivity.",
    icon: Armchair,
    gradient: "from-amber to-amber-dark",
    borderAccent: "hsl(var(--amber))",
    services: [
      { title: "CEO/MD Cabin Sitting", description: "Guidance on cabin direction and seating alignment to support leadership clarity and authority.", price: "₹2,499", rawPrice: 2499, link: "/payment" },
      { title: "Management Sitting", description: "Numerology-based seating recommendations for key managers to improve efficiency.", price: "₹1,997", rawPrice: 1997, link: "/payment" },
      { title: "Cash Counter Direction", description: "Alignment of cash counters and billing areas to support smoother financial transactions.", price: "₹1,997", rawPrice: 1997, link: "/payment" },
      { title: "Office Interior Colors", description: "Color recommendations for office interiors aligned with numerology for focus and balance.", price: "₹1,997", rawPrice: 1997, link: "/payment" },
      { title: "Departmental Sitting", description: "Structured seating alignment for departments to reduce friction and improve workflow.", price: "₹4,998", rawPrice: 4998, link: "/payment" },
    ]
  },
  {
    id: "property",
    title: "Property, Space & Events",
    subtitle: "Location Numerology",
    description: "Analysis of spaces used for business or events for better visibility and growth.",
    icon: Building,
    gradient: "from-slate-500 to-zinc-600",
    borderAccent: "hsl(220, 13%, 40%)",
    services: [
      { title: "Plot Number Analysis", description: "Numerological evaluation of plot numbers to assess suitability and long-term alignment.", price: "₹1,499", rawPrice: 1499, link: "/payment" },
      { title: "Exhibition Stall Number", description: "Analysis of exhibition stall numbers to support visibility and business opportunities.", price: "₹999", rawPrice: 999, link: "/payment" },
      { title: "Commercial Space Analysis", description: "Assessment of commercial spaces through numerology to evaluate suitability for operations.", price: "₹2,499", rawPrice: 2499, link: "/payment" },
    ]
  }
];

/* ─────────────── Service Card Component ─────────────── */
const ServiceCard = ({ service, index }: { service: any; index: number }) => {
  const ServiceIcon = serviceIconMap[service.title] || Sparkles;

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.5 }}
      className={`group relative overflow-hidden rounded-2xl h-full cursor-pointer transition-all duration-500
        ${service.highlight
          ? 'hover:-translate-y-1 hover:shadow-[0_20px_50px_-12px_hsl(var(--orange)/0.35)]'
          : 'hover:-translate-y-1 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)]'}
      `}
    >
      {/* Card border — double layer for highlighted */}
      {service.highlight ? (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary via-amber to-primary p-[1.5px]">
          <div className="w-full h-full rounded-2xl bg-card" />
        </div>
      ) : (
        <div className="absolute inset-0 rounded-2xl border border-border/60 group-hover:border-primary/30 transition-colors duration-500" />
      )}

      {/* Glassmorphism background */}
      <div className="absolute inset-[1.5px] rounded-2xl bg-card/90 backdrop-blur-xl" />

      {/* Warm ambient glow for highlighted */}
      {service.highlight && (
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-amber/5 pointer-events-none" />
      )}

      {/* Shimmer sweep on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] ease-in-out pointer-events-none" />

      {/* Content */}
      <div className="relative p-7 md:p-8 flex flex-col h-full">
        {/* Top row: icon + popular badge */}
        <div className="flex items-start justify-between mb-5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-amber/10 border border-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:border-primary/25 transition-all duration-500">
            <ServiceIcon className="w-5 h-5 text-primary" strokeWidth={1.8} />
          </div>
          {service.highlight && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-primary/15 to-amber/15 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-wider"
            >
              <Zap className="w-3 h-3" />
              Popular
            </motion.span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display text-[20px] leading-tight font-bold text-foreground group-hover:text-primary transition-colors duration-300 mb-2.5">
          {service.title}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground text-[15px] leading-relaxed mb-6 flex-grow">
          {service.description}
        </p>

        {/* Bottom row: price + CTA */}
        <div className="flex items-center justify-between mt-auto">
          <span className="font-display text-xl font-bold text-foreground">
            {service.price}
          </span>
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-orange-dark text-primary-foreground text-sm font-bold shadow-[0_4px_15px_hsl(var(--orange)/0.2)] group-hover:shadow-[0_6px_20px_hsl(var(--orange)/0.35)] group-hover:gap-3 transition-all duration-300">
            Book Now
            {service.external ? (
              <ExternalLink className="w-3.5 h-3.5" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
            )}
          </span>
        </div>
      </div>
    </motion.div>
  );

  const getPaymentLink = () => {
    if (service.external) return service.link;
    if (service.link === "/payment") {
      return `/payment?service=${encodeURIComponent(service.title)}&amount=${service.rawPrice || 0}`;
    }
    return service.link;
  };

  if (service.external) {
    return (
      <a href={service.link} target="_blank" rel="noopener noreferrer" className="block h-full">
        {content}
      </a>
    );
  }
  return (
    <Link to={getPaymentLink()} className="block h-full">
      {content}
    </Link>
  );
};

/* ─────────────── Category Section Component ─────────────── */
const CategorySection = ({ category, index }: { category: typeof serviceCategories[0]; index: number }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      {/* Category Header — with decorative band */}
      <div className="relative mb-8">
        {/* Subtle gradient band behind header */}
        <div className="absolute -inset-x-4 -inset-y-2 rounded-2xl bg-gradient-to-r from-transparent via-muted/50 to-transparent pointer-events-none" />

        <button
          onClick={() => setExpanded(!expanded)}
          className="relative w-full flex items-center gap-4 md:gap-5 group cursor-pointer text-left"
        >
          {/* Icon */}
          <div className={`relative w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
            <category.icon className="w-7 h-7 md:w-8 md:h-8 text-primary-foreground" strokeWidth={1.5} />
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${category.gradient} opacity-30 blur-xl -z-10`} />
          </div>

          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2.5 mb-1">
              {/* Title with gradient underline accent */}
              <h2 className="font-display text-xl md:text-2xl lg:text-[28px] font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                {category.title}
              </h2>
              <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-primary/8 border border-primary/10 text-primary text-xs font-semibold tracking-wide">
                {category.subtitle}
              </span>
            </div>
            <p className="text-muted-foreground text-sm md:text-[15px] line-clamp-1">
              {category.description}
            </p>
            {/* Decorative gradient underline */}
            <div className="mt-2 h-[2px] w-16 rounded-full bg-gradient-to-r from-primary/60 to-amber/40 group-hover:w-24 transition-all duration-500" />
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
              {category.services.length} services
            </span>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="w-9 h-9 rounded-full bg-muted/80 border border-border/40 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300"
            >
              <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.div>
          </div>
        </button>
      </div>

      {/* Services Grid */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 pb-4">
              {category.services.map((service, serviceIndex) => (
                <ServiceCard key={service.title} service={service} index={serviceIndex} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ─────────────── Main Page ─────────────── */
const ServicesPage = () => {
  const totalServices = serviceCategories.reduce((acc, cat) => acc + cat.services.length, 0);

  return (
    <Layout>
      <SEOHead title="Numerology Services" description="Explore our numerology services including name correction, baby name selection, C-section date analysis, mobile numerology, and office vastu by Himansshu Agarwal Ji." canonical="/services" />

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a00] via-[#2a1205] to-[#1a0a00]" />
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse,hsl(24_95%_53%/0.12),transparent_70%)]" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,hsl(43_96%_56%/0.08),transparent_70%)]" />
        </div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: '32px 32px' }} />

        {/* Sacred geometry */}
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[300px] h-[300px] border border-white/[0.04] rounded-full hidden lg:block" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 90, repeat: Infinity, ease: "linear" }} className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[220px] h-[220px] border border-white/[0.06] rounded-full hidden lg:block" />

        <div className="section-container relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center max-w-3xl mx-auto">
            <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/[0.08] backdrop-blur-sm border border-white/[0.1] text-amber-light text-sm font-semibold mb-6 tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              {totalServices}+ Services Available
            </motion.span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Transform Your Life with{" "}
              <span className="text-gradient-primary">Sacred Numerology</span>
            </h1>
            <p className="text-lg text-primary-foreground/70 max-w-2xl mx-auto leading-relaxed mb-10">
              Comprehensive numerology solutions designed for clarity, alignment, and positive transformation across all aspects of life and business.
            </p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex items-center justify-center gap-8 md:gap-12">
              {[
                { label: "Categories", value: "7" },
                { label: "Services", value: `${totalServices}+` },
                { label: "Consultations", value: "5000+" }
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">{stat.value}</div>
                  <div className="text-xs md:text-sm text-primary-foreground/50 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ── Quick Nav Pills ── */}
      <section className="sticky top-16 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="section-container">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            {serviceCategories.map((cat) => (
              <a key={cat.id} href={`#${cat.id}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-muted/60 hover:bg-primary/10 border border-transparent hover:border-primary/15 text-muted-foreground hover:text-primary text-xs font-semibold whitespace-nowrap transition-all duration-300 flex-shrink-0">
                <cat.icon className="w-3.5 h-3.5" />
                {cat.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Service Categories ── */}
      <section className="relative py-16 md:py-20 lg:py-24">
        {/* Warm gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-[hsl(40,60%,97%)] to-background" />
        {/* Subtle warm accents */}
        <div className="absolute top-40 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle,hsl(24_95%_53%/0.03),transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-40 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,hsl(43_96%_56%/0.03),transparent_70%)] pointer-events-none" />
        {/* Subtle texture */}
        <div className="absolute inset-0 opacity-[0.012]" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`, backgroundSize: '48px 48px' }} />

        <div className="section-container relative z-10">
          <div className="space-y-14 md:space-y-20">
            {serviceCategories.map((category, index) => (
              <div key={category.id} id={category.id}>
                {index > 0 && (
                  <div className="mb-14 md:mb-20 flex items-center gap-4">
                    <div className="flex-grow h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/10 to-amber/10 border border-primary/15 flex items-center justify-center">
                      <Gem className="w-3.5 h-3.5 text-primary/50" />
                    </div>
                    <div className="flex-grow h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
                  </div>
                )}
                <CategorySection category={category} index={index} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="relative overflow-hidden py-20 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a00] via-[#2a1205] to-[#1a0a00]" />
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,hsl(24_95%_53%/0.1),transparent_70%)]" />
        </div>
        <div className="section-container relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.1] text-amber-light text-sm font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Need Guidance?
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
              Not Sure Which Service is{" "}
              <span className="text-gradient-primary">Right for You?</span>
            </h2>
            <p className="text-lg text-primary-foreground/60 mb-10 max-w-2xl mx-auto">
              Book a quick consultation call and we'll guide you to the perfect solution for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/consultation" className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-orange-dark text-primary-foreground font-bold px-8 py-4 rounded-xl shadow-[0_8px_30px_hsl(var(--orange)/0.3)] hover:shadow-[0_12px_40px_hsl(var(--orange)/0.4)] hover:-translate-y-0.5 transition-all duration-300">
                Book Consultation
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="https://wa.me/919667305557" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-primary-foreground/20 text-primary-foreground font-bold hover:bg-primary-foreground/10 transition-all duration-300">
                <MessageSquare className="w-5 h-5" />
                WhatsApp Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ServicesPage;
