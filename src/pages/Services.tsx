import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { 
  Phone, Video, MessageSquare, User, Baby, Building2, Calendar,
  Armchair, Building, ArrowRight, Sparkles, ExternalLink,
  Gem, Zap, Car, Smartphone, Home as HomeIcon, Heart, Tag, Users,
  UserCheck, Landmark, MapPin, Grid3X3, Store, Paintbrush, Crown,
  Search, X, type LucideIcon
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
      { title: "1:1 Audio Call", description: "A private audio call designed for detailed discussion while maintaining flexibility and confidentiality.", price: "₹3,998", rawPrice: 3998, link: "/consultation", highlight: true },
      { title: "1:1 Video Call", description: "A face-to-face consultation for deeper engagement, visual explanations, and interactive guidance.", price: "₹5,997", rawPrice: 5997, link: "/consultation", highlight: true },
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
      { title: "Name Correction", description: "Analysis and correction of name vibration to support smoother personal and professional progress.", price: "₹2,447", rawPrice: 2447, link: "/services/name-correction", highlight: true },
      { title: "Lucky Vehicle Number", description: "Compatibility analysis of vehicle numbers for comfort, safety, and daily harmony.", price: "₹1,100", rawPrice: 1100, link: "/payment" },
      { title: "Lucky Mobile Number", description: "Assessment of mobile number vibration and its influence on communication and opportunities.", price: "₹1,100", rawPrice: 1100, link: "/payment" },
      { title: "Lucky Flat / Plot Number", description: "Suitability analysis of residential numbers before purchase or occupancy.", price: "₹1,100", rawPrice: 1100, link: "/payment" },
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
      { title: "C-Section Baby Dates", description: "Numerology-based guidance for selecting supportive C-section birth dates within medically approved range.", price: "₹1,100", rawPrice: 1100, link: "https://miraclebaby.ankshaastra.com", external: true },
      { title: "Perfect Baby Name", description: "Carefully aligned baby name suggestions based on numerology principles for foundational harmony.", price: "₹2,447", rawPrice: 2447, link: "https://empower.ankshaastra.com", external: true, highlight: true },
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
      { title: "Business Name Correction", description: "Strategic analysis to identify misalignment and suggest corrected options for brand resonance.", price: "₹4,894", rawPrice: 4894, link: "/payment", highlight: true },
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

/* ─────────────── Service Card (clean reference style) ─────────────── */
const ServiceCard = ({ service, index }: { service: any; index: number }) => {
  const ServiceIcon = serviceIconMap[service.title] || Sparkles;

  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 8) * 0.05, duration: 0.4 }}
      className="group relative h-full flex flex-col bg-card border border-accent/40 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 hover:border-primary/40 transition-all duration-300"
    >
      {/* Badge */}
      <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
        {service.highlight && <Zap className="w-3 h-3" />}
        {service.badge || (service.highlight ? "Popular" : "Book")}
      </span>

      {/* Circular icon */}
      <div className="w-16 h-16 rounded-full border-2 border-accent flex items-center justify-center mb-5 group-hover:border-primary group-hover:bg-primary/5 transition-all">
        <ServiceIcon className="w-7 h-7 text-primary" strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-tight pr-16">
        {service.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-grow">
        {service.description}
      </p>

      {/* Price */}
      <div className="font-display text-lg font-bold text-foreground mb-4">
        {service.price}
      </div>

      {/* CTA */}
      <button className="w-full py-2.5 rounded-lg border-2 border-primary text-primary text-sm font-semibold uppercase tracking-wider group-hover:bg-primary group-hover:text-primary-foreground transition-all inline-flex items-center justify-center gap-2">
        Book Now
        {service.external ? <ExternalLink className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
      </button>
    </motion.div>
  );

  const paymentLink = service.external
    ? service.link
    : service.link === "/payment"
      ? `/payment?service=${encodeURIComponent(service.title)}&amount=${service.rawPrice || 0}`
      : service.link;

  if (service.external) {
    return <a href={service.link} target="_blank" rel="noopener noreferrer" className="block h-full">{inner}</a>;
  }
  return <Link to={paymentLink} className="block h-full">{inner}</Link>;
};

/* ─────────────── Main Page ─────────────── */
const ServicesPage = () => {
  const totalServices = serviceCategories.reduce((acc, cat) => acc + cat.services.length, 0);
  const tabs = [{ id: "all", title: "All" }, ...serviceCategories.map((c) => ({ id: c.id, title: c.title }))];
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const visibleServices = useMemo(() => {
    const all = serviceCategories.flatMap((cat) =>
      cat.services.map((s) => ({ ...s, _categoryId: cat.id }))
    );
    const byTab = activeTab === "all" ? all : all.filter((s) => s._categoryId === activeTab);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return byTab;
    return byTab.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }, [activeTab, searchQuery]);

  return (
    <Layout>
      <SEOHead title="Numerology Services" description="Explore our numerology services including name correction, baby name selection, C-section date analysis, mobile numerology, and office vastu by Himansshu Agarwal Ji." canonical="/services" />

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse,hsl(var(--amber)/0.18),transparent_70%)]" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,hsl(var(--amber-light)/0.12),transparent_70%)]" />
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
              <span className="text-amber-light">Sacred Numerology</span>
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

      {/* ── Services (filterable grid) ── */}
      <section className="relative py-16 md:py-20 lg:py-24 bg-cream">
        <div className="section-container relative z-10">
          {/* Centered heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="text-foreground">Our </span>
              <span className="text-primary italic">Services</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the service that fits your needs and start your journey toward clarity
            </p>
          </motion.div>

          {/* Filter tabs with underline */}
          <div className="flex flex-wrap items-center justify-center gap-1 md:gap-2 mb-12 border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 md:px-6 py-3 text-sm md:text-base font-semibold transition-colors ${
                  activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.title}
                {activeTab === tab.id && (
                  <motion.span
                    layoutId="services-active-tab"
                    className="absolute -bottom-px left-0 right-0 h-0.5 bg-primary rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="max-w-xl mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services by name or description..."
                aria-label="Search services"
                className="w-full pl-12 pr-12 py-3.5 rounded-full bg-card border border-accent/40 text-foreground placeholder:text-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-center text-sm text-muted-foreground mt-3">
                {visibleServices.length} {visibleServices.length === 1 ? "result" : "results"} for "{searchQuery}"
              </p>
            )}
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {visibleServices.map((service, i) => (
              <ServiceCard key={`${service._categoryId}-${service.title}`} service={service} index={i} />
            ))}
          </div>

          {visibleServices.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No services found. Try a different search or category.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="relative overflow-hidden py-20 md:py-24">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,hsl(var(--amber)/0.15),transparent_70%)]" />
        </div>
        <div className="section-container relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.1] text-amber-light text-sm font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Need Guidance?
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
              Not Sure Which Service is{" "}
              <span className="text-amber-light">Right for You?</span>
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
