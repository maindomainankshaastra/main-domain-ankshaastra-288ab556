import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Calculator from "./pages/Calculator";
import Consultation from "./pages/Consultation";
import Reports from "./pages/Reports";
import NameCorrectionBlueprint from "./pages/NameCorrectionBlueprint";
import PersonalizedKundali from "./pages/PersonalizedKundali";
import Courses from "./pages/Courses";
import Shop from "./pages/Shop";
import NameCorrection from "./pages/NameCorrection";
import Payment from "./pages/Payment";
import About from "./pages/About";
import CSectionDates from "./pages/CSectionDates";
import BabyName from "./pages/BabyName";
import VarshphalReport from "./pages/VarshphalReport";
import MobileNumerology from "./pages/MobileNumerology";
import OfficeVastu from "./pages/OfficeVastu";
import Podcast from "./pages/Podcast";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import TermsOfService from "./pages/TermsOfService";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/name-correction" element={<NameCorrection />} />
            <Route path="/services/csection-dates" element={<CSectionDates />} />
            <Route path="/services/baby-name" element={<BabyName />} />
            <Route path="/services/varshphal-report" element={<VarshphalReport />} />
            <Route path="/services/mobile-numerology" element={<MobileNumerology />} />
            <Route path="/services/office-vastu" element={<OfficeVastu />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/consultation" element={<Consultation />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/name-correction-blueprint" element={<NameCorrectionBlueprint />} />
            <Route path="/reports/personalized-kundali" element={<PersonalizedKundali />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/about" element={<About />} />
            <Route path="/podcast" element={<Podcast />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/refund" element={<RefundPolicy />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
