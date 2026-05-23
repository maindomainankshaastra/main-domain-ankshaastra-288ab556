import { ReactNode } from "react";
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
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!minimal && <Navbar />}
      <main className={`flex-1 ${minimal ? "" : "pt-20"}`}>
        <PageTransition>{children}</PageTransition>
      </main>
      {!minimal && <Footer />}
      <BackToTop />
      {!minimal && <WhatsAppButton />}
    </div>
  );
};

export default Layout;
