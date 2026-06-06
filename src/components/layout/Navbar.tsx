import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, User, LogOut, ShieldCheck, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.jpg";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { reportsNavItems } from "@/data/navMenu";

type DropdownMenuConfig = {
  name: string;
  pathPrefix: string;
  items: typeof servicesNavItems;
};

const navLinks: Array<
  | { name: string; path: string; external?: boolean }
  | { name: string; path: string; hasDropdown: true; dropdown: DropdownMenuConfig }
> = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  {
    name: "Reports",
    path: "/reports",
    hasDropdown: true,
    dropdown: { name: "Reports", pathPrefix: "/reports", items: reportsNavItems },
  },
  { name: "About", path: "/about" },
  { name: "Podcasts", path: "/podcast" },
  { name: "Courses", path: "/courses" },
  { name: "Calculators", path: "/calculator" },
  { name: "Shop", path: "https://ankshaastra.in", external: true },
  { name: "Blog", path: "/blog" },
  { name: "Consultation", path: "/consultation" },
];

function NavDropdown({
  config,
  isOpen,
  onOpen,
  onClose,
  isActive,
}: {
  config: DropdownMenuConfig;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  isActive: boolean;
}) {
  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button
        type="button"
        onClick={() => (isOpen ? onClose() : onOpen())}
        className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
          isActive ? "bg-amber/20 text-cream-light" : "text-cream-light/85 hover:text-cream-light hover:bg-amber/15"
        }`}
      >
        {config.name}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full left-0 mt-2 w-80 max-h-[70vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-xl z-[100]"
          >
            <div className="p-2">
              {config.items.map((item) => {
                const Icon = item.icon;
                if (item.external) {
                  return (
                    <a
                      key={item.name}
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors group"
                    >
                      {Icon && (
                        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-accent/30 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary">{item.name}</p>
                        {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
                      </div>
                    </a>
                  );
                }
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors group"
                  >
                    {Icon && (
                      <div className="w-9 h-9 rounded-lg bg-primary/10 border border-accent/30 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary">{item.name}</p>
                      {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
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

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
  const location = useLocation();
  const { user, role, signOut } = useAuth();
  const desktopNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsOpen(false);
    setOpenDropdown(null);
    setMobileDropdown(null);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (desktopNavRef.current && !desktopNavRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isDropdownActive = (prefix: string) => location.pathname.startsWith(prefix);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-secondary border-b border-amber/20 shadow-sm" style={{ isolation: "isolate" }}>
      <nav className="w-full px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 lg:h-[4.25rem] max-w-[1920px] mx-auto gap-4">
          <Link to="/" className="flex-shrink-0 flex items-center">
            <img src={logo} alt="Ankshaastra" className="h-9 sm:h-10 lg:h-11 w-auto max-w-[140px] sm:max-w-[160px] object-contain object-left" />
          </Link>

          <div ref={desktopNavRef} className="hidden xl:flex items-center gap-0.5">
            {navLinks.map((link) => {
              if ("hasDropdown" in link && link.hasDropdown) {
                return (
                  <NavDropdown
                    key={link.name}
                    config={link.dropdown}
                    isOpen={openDropdown === link.name}
                    onOpen={() => setOpenDropdown(link.name)}
                    onClose={() => setOpenDropdown(null)}
                    isActive={isDropdownActive(link.dropdown.pathPrefix)}
                  />
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
                    location.pathname === link.path ? "bg-amber/20 text-cream-light" : "text-cream-light/85 hover:text-cream-light hover:bg-amber/15"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

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

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="xl:hidden overflow-hidden bg-card border-t border-border rounded-b-2xl"
            >
              <div className="py-4 space-y-1 max-h-[70vh] overflow-y-auto">
                {navLinks.map((link) => {
                  if ("hasDropdown" in link && link.hasDropdown) {
                    const expanded = mobileDropdown === link.name;
                    return (
                      <div key={link.name}>
                        <button
                          type="button"
                          onClick={() => setMobileDropdown(expanded ? null : link.name)}
                          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg"
                        >
                          {link.name}
                          <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {expanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="ml-4 border-l-2 border-accent pl-3 overflow-hidden"
                            >
                              {link.dropdown.items.map((item) =>
                                item.external ? (
                                  <a
                                    key={item.name}
                                    href={item.path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary"
                                  >
                                    {item.name}
                                  </a>
                                ) : (
                                  <Link key={item.name} to={item.path} className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary">
                                    {item.name}
                                  </Link>
                                ),
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }

                  if (link.external) {
                    return (
                      <a key={link.path} href={link.path} target="_blank" rel="noopener noreferrer" className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg">
                        {link.name}
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`block px-4 py-3 text-sm font-medium rounded-lg ${
                        location.pathname === link.path ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
                {user ? (
                  <>
                    <Link to="/dashboard" className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg">My Dashboard</Link>
                    {role === "admin" && (
                      <Link to="/admin" className="block px-4 py-3 text-sm font-medium text-primary hover:bg-muted rounded-lg">Admin Panel</Link>
                    )}
                    <button type="button" onClick={signOut} className="w-full text-left block px-4 py-3 text-sm font-medium text-destructive hover:bg-muted rounded-lg">
                      Sign Out
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
