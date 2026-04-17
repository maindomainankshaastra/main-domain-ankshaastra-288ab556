import { Link, useLocation } from "react-router-dom";
import { Home, FileText, Briefcase, Phone, Calculator } from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: FileText, label: "Reports", path: "/reports" },
  { icon: Briefcase, label: "Services", path: "/services" },
  { icon: Phone, label: "Consult", path: "/consultation" },
  { icon: Calculator, label: "Calculator", path: "/calculator" },
];

const MobileBottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 xl:hidden bg-secondary border-t border-amber/20 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = path === "/" ? pathname === "/" : pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-lg transition-colors ${
                isActive ? "text-amber-light" : "text-cream-light/70 hover:text-cream-light"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className={`text-[10px] font-medium ${isActive ? "font-semibold" : ""}`}>
                {label}
              </span>
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-amber-light" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
