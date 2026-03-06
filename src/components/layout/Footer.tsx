import { Link } from "react-router-dom";
import { 
  Phone, Mail, MapPin, Clock,
  Facebook, Instagram, Youtube, Linkedin,
  MessageCircle, ArrowRight, Heart
} from "lucide-react";
import logo from "@/assets/logo.jpg";

const quickLinks = [
  { name: "Home", path: "/" },
  { name: "Reports", path: "/reports" },
  { name: "Services", path: "/services" },
  { name: "About", path: "/about" },
  { name: "Insightful Podcasts", path: "/podcast" },
  { name: "Courses", path: "/courses" },
  { name: "Free Calculators", path: "/calculator" },
  { name: "Shop", path: "/shop" },
];

const serviceLinks = [
  { name: "Name Correction", path: "https://empower.ankshaastra.com", external: true },
  { name: "Call Consultation", path: "/consultation" },
  { name: "Kundali Analysis", path: "/reports" },
  { name: "Baby Name Selection", path: "https://empower.ankshaastra.com", external: true },
  { name: "Business Numerology", path: "/services" },
  { name: "C-Section Dates", path: "/services/csection-dates" },
  { name: "Lal Kitab Consultation", path: "/consultation" },
  { name: "Reports", path: "/reports" },
  { name: "Courses", path: "/courses" },
  { name: "Rudraksha & Bracelets", path: "https://ankshaastra.in", external: true },
];

const socials = [
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden">
      {/* Top gradient line */}
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />

      {/* Main Footer */}
      <div className="bg-foreground text-background relative">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />

        <div className="section-container py-16 lg:py-20 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10">
            {/* Column 1: About */}
            <div className="lg:col-span-1">
              <Link to="/" className="inline-block mb-6">
                <img 
                  src={logo} 
                  alt="Ankshaastra - Empower Your Name" 
                  className="h-12 w-auto object-contain brightness-0 invert"
                />
              </Link>
              <p className="text-background/60 text-sm leading-relaxed mb-8">
                Your trusted guide to numerology and Lal Kitab remedies. Transform your 
                life with personalized guidance from Himansshu Agarwal Ji.
              </p>
              <div className="flex items-center gap-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-10 h-10 rounded-xl bg-background/[0.06] border border-background/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300 group"
                  >
                    <s.icon className="w-4 h-4 text-background/60 group-hover:text-background transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-background/40 mb-8">Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-background/60 hover:text-primary transition-colors text-sm inline-flex items-center gap-1.5 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Services */}
            <div>
              <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-background/40 mb-8">Our Services</h4>
              <ul className="space-y-3">
                {serviceLinks.map((link, index) => (
                  <li key={index}>
                    {link.external ? (
                      <a
                        href={link.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-background/60 hover:text-primary transition-colors text-sm inline-flex items-center gap-1.5 group"
                      >
                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                        <span>{link.name}</span>
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        className="text-background/60 hover:text-primary transition-colors text-sm inline-flex items-center gap-1.5 group"
                      >
                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                        <span>{link.name}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div>
              <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-background/40 mb-8">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-background/60 text-sm leading-relaxed">
                    Unit No. O-622, Block E, Eye of Noida, Sector-140A, Noida-201305
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <a href="mailto:social@ankshaastra.com" className="text-background/60 hover:text-primary transition-colors text-sm">
                    social@ankshaastra.com
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <a href="tel:+919667305577" className="text-background/60 hover:text-primary transition-colors text-sm">
                    +91 96673 05577
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-primary" />
                  </div>
                  <a href="https://wa.me/919667305577" target="_blank" rel="noopener noreferrer" className="text-background/60 hover:text-primary transition-colors text-sm">
                    WhatsApp Chat
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-background/60 text-sm">
                    Mon–Sun: 8:34 AM – 8:34 PM
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/[0.08]">
          <div className="section-container py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-background/40 text-sm flex items-center gap-1.5">
                © {currentYear} Ankshaastra. Made with <Heart className="w-3.5 h-3.5 text-primary fill-primary" /> in India
              </p>
              <div className="flex items-center gap-6">
                {[
                  { to: "/privacy", label: "Privacy Policy" },
                  { to: "/terms", label: "Terms & Conditions" },
                  { to: "/refund", label: "Refund Policy" },
                ].map((link, i) => (
                  <span key={link.to} className="flex items-center gap-6">
                    {i > 0 && <span className="text-background/15">·</span>}
                    <Link to={link.to} className="text-background/40 hover:text-background/70 transition-colors text-sm">
                      {link.label}
                    </Link>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
