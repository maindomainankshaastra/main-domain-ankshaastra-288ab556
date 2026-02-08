import { Link } from "react-router-dom";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  MessageCircle
} from "lucide-react";
import logo from "@/assets/logo.jpg";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="section-container section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: About */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img 
                src={logo} 
                alt="Ankshaastra - Empower Your Name" 
                className="h-12 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-background/70 text-sm leading-relaxed mb-6">
              Your trusted guide to numerology and Lal Kitab remedies. Transform your 
              life with personalized guidance from Himansshu Agarwal Ji.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { name: "Home", path: "/" },
                { name: "Reports", path: "/reports" },
                { name: "Services", path: "/services" },
                { name: "About", path: "/about" },
                { name: "Insightful Podcasts", path: "/podcast" },
                { name: "Courses", path: "/courses" },
                { name: "Free Calculators", path: "/calculator" },
                { name: "Shop", path: "/shop" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-background/70 hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-6">Our Services</h4>
            <ul className="space-y-3">
              {[
                { name: "Name Correction", path: "https://www.ankshaastra.empower.com", external: true },
                { name: "Call Consultation", path: "/consultation" },
                { name: "Kundali Analysis", path: "/reports" },
                { name: "Baby Name Selection", path: "/services" },
                { name: "Business Numerology", path: "/services" },
                { name: "C-Section Dates", path: "/services" },
                { name: "Ved Gurukul Courses", path: "/courses" },
                { name: "Shop", path: "/shop" },
              ].map((link, index) => (
                <li key={index}>
                  {link.external ? (
                    <a
                      href={link.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-background/70 hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      to={link.path}
                      className="text-background/70 hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-background/70 text-sm">
                  Unit No. O-622, Block E, Eye of Noida, Sector-140A, Noida-201305
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <a
                  href="mailto:social@ankshaastra.com"
                  className="text-background/70 hover:text-primary transition-colors text-sm"
                >
                  social@ankshaastra.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <a
                  href="tel:+919667305577"
                  className="text-background/70 hover:text-primary transition-colors text-sm"
                >
                  +91 96673 05577
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <a
                  href="https://wa.me/919667305577"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/70 hover:text-primary transition-colors text-sm"
                >
                  WhatsApp Chat
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-background/70 text-sm">
                  Monday-Sunday: 8:34 AM - 8:34 PM
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="section-container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-background/60 text-sm">
              © {currentYear} Ankshaastra. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                to="/privacy"
                className="text-background/60 hover:text-background transition-colors text-sm"
              >
                Privacy Policy
              </Link>
              <span className="text-background/30">|</span>
              <Link
                to="/terms"
                className="text-background/60 hover:text-background transition-colors text-sm"
              >
                Terms & Conditions
              </Link>
              <span className="text-background/30">|</span>
              <Link
                to="/refund"
                className="text-background/60 hover:text-background transition-colors text-sm"
              >
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;