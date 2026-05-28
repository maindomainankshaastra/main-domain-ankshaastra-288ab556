import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "../ui/BackToTop";
import WhatsAppButton from "../ui/WhatsAppButton";
import PageTransition from "../PageTransition";

interface LayoutProps {
  children: ReactNode;
  /** When true, hides Navbar, Footer, and floating WhatsApp button. Used for focused report pages. */
  minimal?: boolean;
}

const Layout = ({ children, minimal = false }: LayoutProps) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!minimal && <Navbar />}
      {minimal && (
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border/60">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <Link
              to="/"
              className="font-display text-lg font-bold text-primary tracking-wide"
            >
              Ankshaastra
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              aria-label="Home"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </div>
        </header>
      )}
      <main className={`flex-1 ${minimal ? "" : "pt-16 lg:pt-[4.25rem]"}`}>
        <PageTransition>{children}</PageTransition>
      </main>
      {!minimal && <Footer />}
      <BackToTop />
      {!minimal && <WhatsAppButton />}
    </div>
  );
};

export default Layout;
