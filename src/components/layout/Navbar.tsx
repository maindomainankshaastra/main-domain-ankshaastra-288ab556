import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.jpg";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Reports", path: "/reports" },
  { name: "Services", path: "/services" },
  { name: "About", path: "/about" },
  { name: "Podcasts", path: "/podcast" },
  { name: "Courses", path: "/courses" },
  { name: "Calculators", path: "/calculator" },
  { name: "Shop", path: "/shop" },
  { name: "Name Correction", path: "https://www.ankshaastra.empower.com", external: true },
  { name: "Consultation", path: "/consultation" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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
  }, [location]);

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
          {/* Logo - Top Left */}
          <Link to="/" className="flex-shrink-0">
            <img 
              src={logo} 
              alt="Ankshaastra - Empower Your Name" 
              className="h-12 lg:h-16 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation - All items in single row */}
          <div className="hidden xl:flex items-center gap-1 ml-auto">
            {navLinks.map((link) => (
              link.external ? (
                <a
                  key={link.path}
                  href={link.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap text-foreground hover:bg-muted hover:text-primary"
                >
                  {link.name}
                </a>
              ) : (
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
              )
            ))}
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
                {navLinks.map((link) => (
                  link.external ? (
                    <a
                      key={link.path}
                      href={link.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-3 text-sm font-medium rounded-lg transition-colors text-foreground hover:bg-muted"
                    >
                      {link.name}
                    </a>
                  ) : (
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
                  )
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Navbar;
