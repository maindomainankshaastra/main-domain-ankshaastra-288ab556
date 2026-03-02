import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";
import BackToTop from "../ui/BackToTop";
import WhatsAppButton from "../ui/WhatsAppButton";
import PageTransition from "../PageTransition";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-20 pb-16 xl:pb-0">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <Footer />
      <MobileBottomNav />
      <BackToTop />
      <WhatsAppButton />
    </div>
  );
};

export default Layout;
