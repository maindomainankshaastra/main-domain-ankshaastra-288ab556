import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, ScrollText, Baby, Star, Calendar, User, LogOut, ShieldCheck, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.jpg";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const reportsDropdown = [
  { name: "Name Correction Blueprint", path: "/reports/name-correction-blueprint", icon: ScrollText, description: "Align your name's vibration for success" },
  { name: "Perfect Baby Name Report", path: "https://empower.ankshaastra.com", icon: Baby, description: "Numerology-based baby name selection", external: true },
  { name: "Personalized Kundali", path: "/reports/personalized-kundali", icon: Star, description: "Complete birth chart & life predictions" },
  { name: "Varshphal Report 2026", path: "/services/varshphal-report", icon: Calendar, description: "Your complete yearly numerology guide" },
];

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Reports", path: "/reports", hasDropdown: true },
  { name: "Services", path: "/services" },
  { name: "About", path: "/about" },
  { name: "Podcasts", path: "/podcast" },
  { name: "Courses", path: "/courses" },
  { name: "Calculators", path: "/calculator" },
  { name: "Shop", path: "https://ankshaastra.in", external: true },
  { name: "Blog", path: "/blog" },
  { name: "Consultation", path: "/consultation" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [mobileReportsOpen, setMobileReportsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { user, role, signOut } = useAuth();

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
      className="fixed top-0 left-0 right-0 z-50 w-full bg-secondary border-b border-amber/20 shadow-sm"
      style={{ isolation: "isolate" }}
    >
      <nav className="w-full px-4 lg:px-6">
        <div className="flex items-center justify-between h-20 max-w-[1920px] mx-auto gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-3">
            <img
              src={logo}
              alt="Ankshaastra"
              className="h-14 lg:h-16 w-auto object-contain rounded-md bg-cream-light/95 p-1"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center gap-0.5">
            {navLinks.map((link) => {
              if (link.hasDropdown) {
                return (
                  <div key={link.path} className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setReportsOpen(!reportsOpen)}
                      onMouseEnter={() => setReportsOpen(true)}
                      className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                        location.pathname.startsWith("/reports")
                          ? "bg-amber/20 text-cream-light"
                          : "text-cream-light/85 hover:text-cream-light hover:bg-amber/15"
                      }`}
                    >
                      {link.name}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${reportsOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {reportsOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.18 }}
                          onMouseLeave={() => setReportsOpen(false)}
                          className="absolute top-full left-0 mt-2 w-72 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-[100]"
                        >
                          <div className="p-2">
                            {reportsDropdown.map((item) => {
                              const Icon = item.icon;
                              const Comp: any = item.external ? "a" : Link;
                              const props: any = item.external
                                ? { href: item.path, target: "_blank", rel: "noopener noreferrer" }
                                : { to: item.path };
                              return (
                                <Comp
                                  key={item.name}
                                  {...props}
                                  className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-muted transition-colors group"
                                >
                                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Icon className="w-4 h-4 text-primary" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                      {item.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                                  </div>
                                </Comp>
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
                    className="px-3 py-2 text-sm font-medium rounded-lg text-cream-light/85 hover:text-cream-light hover:bg-amber/15 transition-all whitespace-nowrap"
                  >
                    {link.name}
                  </a>
                );
              }

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                    location.pathname === link.path
                      ? "bg-amber/20 text-cream-light"
                      : "text-cream-light/85 hover:text-cream-light hover:bg-amber/15"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right: Language + Auth + mobile toggle */}
          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-full bg-amber/20 border border-cream-light/40 text-cream-light text-sm font-medium hover:bg-amber/30 transition-all">
                    <User className="w-4 h-4" />
                    <span className="max-w-[100px] truncate">{user.email?.split("@")[0]}</span>
                    {role === "admin" && <ShieldCheck className="w-3.5 h-3.5 text-amber" />}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 z-[100]">
                  <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer"><LayoutDashboard className="w-4 h-4 mr-2" />My Dashboard</Link>
                  </DropdownMenuItem>
                  {role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer"><ShieldCheck className="w-4 h-4 mr-2" />Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" className="hidden md:inline-flex bg-amber hover:bg-amber/90 text-secondary font-semibold rounded-full">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="xl:hidden p-2 text-cream-light hover:text-amber transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="xl:hidden overflow-hidden bg-card border-t border-border rounded-b-2xl"
            >
              <div className="py-4 space-y-1 max-h-[70vh] overflow-y-auto">
                {navLinks.map((link) => {
                  if (link.hasDropdown) {
                    return (
                      <div key={link.path}>
                        <button
                          onClick={() => setMobileReportsOpen(!mobileReportsOpen)}
                          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg"
                        >
                          {link.name}
                          <ChevronDown className={`w-4 h-4 transition-transform ${mobileReportsOpen ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {mobileReportsOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="ml-4 border-l-2 border-accent pl-4 overflow-hidden"
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
                                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-primary rounded-lg hover:bg-muted"
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
                                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-primary rounded-lg hover:bg-muted"
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
                        className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg"
                      >
                        {link.name}
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`block px-4 py-3 text-sm font-medium rounded-lg ${
                        location.pathname === link.path
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
                {user ? (
                  <>
                    <Link to="/dashboard" className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg">
                      <LayoutDashboard className="w-4 h-4 inline mr-2" />My Dashboard
                    </Link>
                    {role === "admin" && (
                      <Link to="/admin" className="block px-4 py-3 text-sm font-medium text-primary hover:bg-muted rounded-lg">
                        <ShieldCheck className="w-4 h-4 inline mr-2" />Admin Panel
                      </Link>
                    )}
                    <button onClick={signOut} className="w-full text-left block px-4 py-3 text-sm font-medium text-destructive hover:bg-muted rounded-lg">
                      <LogOut className="w-4 h-4 inline mr-2" />Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/auth" className="block mx-4 mt-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold text-center">
                    Sign In / Sign Up
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Navbar;
