import { Link } from "react-router-dom";
import { FileText, Phone, Gem, Flame, MessageCircle, BookOpen } from "lucide-react";

const items = [
  { icon: FileText, label: "Explore Reports", to: "/reports" },
  { icon: Phone, label: "Consult Now", to: "/consultation" },
  { icon: Gem, label: "Gems & Rudraksha", to: "https://ankshaastra.in", external: true },
  { icon: Flame, label: "Powerful Poojas", to: "/services" },
  { icon: MessageCircle, label: "Ask Astrologer", to: "/contact" },
  { icon: BookOpen, label: "Occult Gurukul", to: "/courses" },
];

const QuickCategories = () => {
  return (
    <section className="bg-cream py-12 md:py-16">
      <div className="section-container">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
          {items.map(({ icon: Icon, label, to, external }) => {
            const inner = (
              <div className="flex flex-col items-center text-center gap-3 group cursor-pointer">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-accent flex items-center justify-center bg-card group-hover:bg-primary group-hover:border-primary transition-all duration-300 shadow-sm">
                  <Icon className="w-7 h-7 md:w-8 md:h-8 text-primary group-hover:text-primary-foreground transition-colors" strokeWidth={1.5} />
                </div>
                <span className="font-display text-sm md:text-base font-semibold text-foreground leading-tight">
                  {label}
                </span>
              </div>
            );
            return external ? (
              <a key={label} href={to} target="_blank" rel="noopener noreferrer">{inner}</a>
            ) : (
              <Link key={label} to={to}>{inner}</Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QuickCategories;
