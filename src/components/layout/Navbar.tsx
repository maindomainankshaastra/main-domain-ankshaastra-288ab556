import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, ScrollText, Baby, Star, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.jpg";

const reportsDropdown = [
  {
    name: "Name Correction Blueprint",
    path: "/reports/name-correction-blueprint",
    icon: ScrollText,
    description: "Align your name's vibration for success",
  },
  {
    name: "Perfect Baby Name Report",
    path: "https://empower.ankshaastra.com",
    icon: Baby,
    description: "Numerology-based baby name selection",
    external: true,
  },
  {
    name: "Personalized Kundali",
    path: "/reports/personalized-kundali",
    icon: Star,
    description: "Complete birth chart & life predictions",
  },
  {
    name: "Varshphal Report 2026",
    path: "/services/varshphal-report",
    icon: Calendar,
    description: "Your complete yearly numerology guide",
  },
];

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Reports", path: "/reports", hasDropdown: true },
  { name: "Services", path: "/services" },
  { name: "About", path: "/about" },
  { name: "Podcasts", path: "/podcast" },
  { name: "Courses", path: "/courses" },
  { name: "Calculators", path: "/calculator" },
  { name: "Shop Rudraksha and Crystals", path: "https://ankshaastra.in", external: true },
  { name: "Name Correction", path: "https://empower.ankshaastra.com", external: true },
  { name: "Consultation", path: "/consultation" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [mobileReportsOpen, setMobileReportsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setReportsOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setReportsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-card/95 backdrop-blur-md shadow-lg"
          : "bg-card/90 backdrop-blur-sm"
      }`}
    >
      <nav className="w-full px-4 lg:px-6">
        <div className="flex items-center h-20 max-w-[1920px] mx-auto relative">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img
              src={logo}
              alt="Ankshaastra - Empower Your Name"
              className="h-12 lg:h-16 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center gap-1 ml-auto">
            {navLinks.map((link) => {
              if (link.hasDropdown) {
                return (
                  <div key={link.path} className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setReportsOpen(!reportsOpen)}
                      onMouseEnter={() => setReportsOpen(true)}
                      className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                        location.pathname.startsWith("/reports") || location.pathname.startsWith("/services/varshphal")
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted hover:text-primary"
                      }`}
                    >
                      {link.name}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${reportsOpen ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {reportsOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.97 }}
                          transition={{ duration: 0.18 }}
                          onMouseLeave={() => setReportsOpen(false)}
                          className="absolute top-full left-0 mt-1 w-72 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-[100]"
                        >
                          <div className="p-2">
                            {reportsDropdown.map((item) => {
                              const Icon = item.icon;
                              if (item.external) {
                                return (
                                  <a
                                    key={item.name}
                                    href={item.path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-muted transition-colors group"
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors mt-0.5">
                                      <Icon className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.name}</p>
                                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                                    </div>
                                  </a>
                                );
                              }
                              return (
                                <Link
                                  key={item.name}
                                  to={item.path}
                                  className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-muted transition-colors group"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors mt-0.5">
                                    <Icon className="w-4 h-4 text-primary" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.name}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              if (link.external) {
                return (
                  <a
                    key={link.path}
                    href={link.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap text-foreground hover:bg-muted hover:text-primary"
                  >
                    {link.name}
                  </a>
                );
              }

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                    location.pathname === link.path
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted hover:text-primary"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="xl:hidden p-2 text-foreground hover:text-primary transition-colors ml-auto"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="xl:hidden overflow-hidden bg-card border-t border-border"
            >
              <div className="py-4 space-y-1 max-h-[70vh] overflow-y-auto">
                {navLinks.map((link) => {
                  if (link.hasDropdown) {
                    return (
                      <div key={link.path}>
                        <button
                          onClick={() => setMobileReportsOpen(!mobileReportsOpen)}
                          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors text-foreground hover:bg-muted"
                        >
                          {link.name}
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileReportsOpen ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {mobileReportsOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="ml-4 border-l border-border pl-4 overflow-hidden"
                            >
                              {reportsDropdown.map((item) => {
                                const Icon = item.icon;
                                if (item.external) {
                                  return (
                                    <a
                                      key={item.name}
                                      href={item.path}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-primary rounded-lg hover:bg-muted transition-colors"
                                    >
                                      <Icon className="w-4 h-4 flex-shrink-0" />
                                      {item.name}
                                    </a>
                                  );
                                }
                                return (
                                  <Link
                                    key={item.name}
                                    to={item.path}
                                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-primary rounded-lg hover:bg-muted transition-colors"
                                  >
                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                    {item.name}
                                  </Link>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }

                  if (link.external) {
                    return (
                      <a
                        key={link.path}
                        href={link.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-3 text-sm font-medium rounded-lg transition-colors text-foreground hover:bg-muted"
                      >
                        {link.name}
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        location.pathname === link.path
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Navbar;
