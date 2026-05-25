import { Link } from "react-router-dom";
import {
  Phone, Mail, MapPin, Clock,
  Facebook, Instagram, Youtube, Linkedin,
  MessageCircle, Heart, Sun,
} from "lucide-react";
import logo from "@/assets/New_Logo.png";

const columns = [
  {
    title: "Reports",
    links: [
      { name: "Name Correction", to: "/reports/name-correction-blueprint" },
      { name: "Personalized Kundali", to: "/reports/personalized-kundali" },
      { name: "Varshphal 2026", to: "/services/varshphal-report" },
      { name: "Baby Name", to: "https://empower.ankshaastra.com", external: true },
    ],
  },
  {
    title: "Online Puja",
    links: [
      { name: "Office Vastu", to: "/services/office-vastu" },
      { name: "C-Section Dates", to: "https://miraclebaby.ankshaastra.com", external: true },
      { name: "Mobile Numerology", to: "/services/mobile-numerology" },
      { name: "All Services", to: "/services" },
    ],
  },
  {
    title: "Calculators",
    links: [
      { name: "Free Calculators", to: "/calculator" },
      { name: "Numerology", to: "/calculator" },
      { name: "Compatibility", to: "/calculator" },
      { name: "Lucky Number", to: "/calculator" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", to: "/about" },
      { name: "Podcasts", to: "/podcast" },
      { name: "Courses", to: "/courses" },
      { name: "Blog", to: "/blog" },
      { name: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Shop",
    links: [
      { name: "Rudraksha", to: "https://ankshaastra.in", external: true },
      { name: "Bracelets", to: "https://ankshaastra.in", external: true },
      { name: "Crystals", to: "https://ankshaastra.in", external: true },
      { name: "Gemstones", to: "https://ankshaastra.in", external: true },
    ],
  },
];

const socials = [
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-cream-light relative overflow-hidden">
      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--cream-light)) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="section-container py-14 lg:py-16 relative z-10">
        {/* Top: brand + columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-3 mb-4">
              <img src={logo} alt="Ankshaastra" className="h-12 w-auto rounded-md bg-cream-light/95 p-1" />
              <div className="flex flex-col leading-tight">
                <span className="font-display text-xl font-bold">Ankshaastra</span>
                <span className="text-[10px] text-amber-light/90 tracking-[0.2em] uppercase">Vedic Guidance</span>
              </div>
            </Link>
            <p className="text-cream-light/70 text-sm leading-relaxed mb-5">
              Trusted numerology & Lal Kitab guidance by Himansshu Agarwal Ji. Transforming lives across India.
            </p>
            <div className="flex items-center gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full border border-cream-light/30 flex items-center justify-center hover:bg-amber hover:border-amber transition-all"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-base font-semibold text-amber-light mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link: any) => (
                  <li key={link.name}>
                    {link.external ? (
                      <a
                        href={link.to}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cream-light/75 hover:text-amber-light text-sm transition-colors"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link to={link.to} className="text-cream-light/75 hover:text-amber-light text-sm transition-colors">
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 py-6 border-y border-cream-light/15">
          <a href="tel:+919667305577" className="flex items-center gap-3 hover:text-amber-light transition-colors">
            <Phone className="w-4 h-4 text-amber-light" />
            <span className="text-sm">+91 96673 05577</span>
          </a>
          <a href="mailto:social@ankshaastra.com" className="flex items-center gap-3 hover:text-amber-light transition-colors">
            <Mail className="w-4 h-4 text-amber-light" />
            <span className="text-sm">social@ankshaastra.com</span>
          </a>
          <a href="https://wa.me/919667305577" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-amber-light transition-colors">
            <MessageCircle className="w-4 h-4 text-amber-light" />
            <span className="text-sm">WhatsApp Chat</span>
          </a>
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-amber-light" />
            <span className="text-sm text-cream-light/75">Mon–Sun · 8:30 AM – 8:30 PM</span>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-3 mt-6 text-cream-light/70 text-sm max-w-2xl">
          <MapPin className="w-4 h-4 text-amber-light mt-0.5 flex-shrink-0" />
          <span>Unit No. O-622, Block E, Eye of Noida, Sector-140A, Noida-201305, India</span>
        </div>

        {/* Decorative ornament */}
        <div className="flex items-center justify-center gap-4 my-10">
          <span className="h-px flex-1 max-w-xs bg-gradient-to-r from-transparent via-amber/40 to-amber/40" />
          <Sun className="w-7 h-7 text-amber-light" strokeWidth={1.2} />
          <span className="h-px flex-1 max-w-xs bg-gradient-to-l from-transparent via-amber/40 to-amber/40" />
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-cream-light/60">
          <p className="flex items-center gap-1.5">
            © {year} Ankshaastra. Made with <Heart className="w-3.5 h-3.5 text-amber-light fill-amber-light" /> in India
          </p>
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="hover:text-amber-light transition-colors">Privacy</Link>
            <span className="text-cream-light/25">·</span>
            <Link to="/terms" className="hover:text-amber-light transition-colors">Terms</Link>
            <span className="text-cream-light/25">·</span>
            <Link to="/refund" className="hover:text-amber-light transition-colors">Refund</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
