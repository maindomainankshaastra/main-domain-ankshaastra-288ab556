import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
const Services = lazy(() => import("./pages/Services"));
const Contact = lazy(() => import("./pages/Contact"));
const Calculator = lazy(() => import("./pages/Calculator"));
const Consultation = lazy(() => import("./pages/Consultation"));
const Reports = lazy(() => import("./pages/Reports"));
const PersonalizedKundali = lazy(() => import("./pages/PersonalizedKundali"));
const PyaarShastra = lazy(() => import("./pages/PyaarShastra"));
const Courses = lazy(() => import("./pages/Courses"));
const Shop = lazy(() => import("./pages/Shop"));
const NameCorrection = lazy(() => import("./pages/NameCorrection"));
const Payment = lazy(() => import("./pages/Payment"));
const About = lazy(() => import("./pages/About"));
const CSectionDates = lazy(() => import("./pages/CSectionDates"));
const BabyName = lazy(() => import("./pages/BabyName"));
const VarshphalReport = lazy(() => import("./pages/VarshphalReport"));
const MobileNumerology = lazy(() => import("./pages/MobileNumerology"));
const OfficeVastu = lazy(() => import("./pages/OfficeVastu"));
const Podcast = lazy(() => import("./pages/Podcast"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const OrdersModule = lazy(() => import("./pages/admin/modules/OrdersModule"));
const InvoicesModule = lazy(() => import("./pages/admin/modules/InvoicesModule"));
const EmailModule = lazy(() => import("./pages/admin/modules/EmailModule"));
const CrmModule = lazy(() => import("./pages/admin/modules/CrmModule"));
const WorkflowsModule = lazy(() => import("./pages/admin/modules/WorkflowsModule"));
const WebhooksModule = lazy(() => import("./pages/admin/modules/WebhooksModule"));
const AiReportsModule = lazy(() => import("./pages/admin/modules/AiReportsModule"));
const ServicesModule = lazy(() => import("./pages/admin/modules/ServicesModule"));
const TemplatesModule = lazy(() => import("./pages/admin/modules/TemplatesModule"));
const SettingsModule = lazy(() => import("./pages/admin/modules/SettingsModule"));
const PricingModule = lazy(() => import("./pages/admin/modules/PricingModule"));
const ServicePagesModule = lazy(() => import("./pages/admin/modules/ServicePagesModule"));
const DynamicServicePage = lazy(() => import("./pages/DynamicServicePage"));
const ThankYou = lazy(() => import("./pages/ThankYou"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/name-correction" element={<NameCorrection />} />
            <Route path="/services/csection-dates" element={<CSectionDates />} />
            <Route path="/services/baby-name" element={<BabyName />} />
            <Route path="/services/varshphal-report" element={<VarshphalReport />} />
            <Route path="/services/mobile-numerology" element={<MobileNumerology />} />
            <Route path="/services/office-vastu" element={<OfficeVastu />} />
            <Route path="/services/:slug" element={<DynamicServicePage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/consultation" element={<Consultation />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/personalized-kundali" element={<PersonalizedKundali />} />
            <Route path="/reports/pyaar-shastra" element={<PyaarShastra />} />
            <Route path="/reports/:slug" element={<DynamicServicePage />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/about" element={<About />} />
            <Route path="/podcast" element={<Podcast />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/refund" element={<RefundPolicy />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<OrdersModule />} />
              <Route path="invoices" element={<InvoicesModule />} />
              <Route path="email" element={<EmailModule />} />
              <Route path="crm" element={<CrmModule />} />
              <Route path="workflows" element={<WorkflowsModule />} />
              <Route path="webhooks" element={<WebhooksModule />} />
              <Route path="ai-reports" element={<AiReportsModule />} />
              <Route path="services" element={<ServicesModule />} />
              <Route path="service-pages" element={<ServicePagesModule />} />
              <Route path="pricing" element={<PricingModule />} />
              <Route path="templates" element={<TemplatesModule />} />
              <Route path="settings" element={<SettingsModule />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
