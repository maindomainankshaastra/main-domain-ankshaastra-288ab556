import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ExternalRedirect from "@/components/ExternalRedirect";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import ThankYou from "./pages/ThankYou";
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
const VarshphalReport = lazy(() => import("./pages/VarshphalReport"));
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
const GstReportsModule = lazy(() => import("./pages/admin/modules/GstReportsModule"));
const PricingModule = lazy(() => import("./pages/admin/modules/PricingModule"));
const ServicePagesModule = lazy(() => import("./pages/admin/modules/ServicePagesModule"));
const DynamicServicePage = lazy(() => import("./pages/DynamicServicePage"));
const BusinessNumerology = lazy(() => import("./pages/BusinessNumerology"));
const ServiceSlugPage = lazy(() => import("./pages/ServiceSlugPage"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/name-correction" element={<NameCorrection />} />
            <Route path="/services/csection-dates" element={<ExternalRedirect url="https://miraclebaby.ankshaastra.com" />} />
            <Route path="/services/baby-name" element={<ExternalRedirect url="https://empower.ankshaastra.com" />} />
            <Route path="/services/varshphal-report" element={<Navigate to="/reports/varshphal-report" replace />} />
            <Route path="/services/mobile-numerology" element={<Navigate to="/services/lucky-mobile-number" replace />} />
            <Route path="/services/lucky-numerology" element={<Navigate to="/services/lucky-vehicle-number" replace />} />
            <Route path="/services/business-numerology" element={<BusinessNumerology />} />
            <Route path="/services/office-vastu" element={<OfficeVastu />} />
            <Route path="/services/call-consultation" element={<Navigate to="/consultation" replace />} />
            <Route path="/services/:slug" element={<ServiceSlugPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/consultation" element={<Consultation />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/varshphal-report" element={<VarshphalReport />} />
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
              <Route path="gst-reports" element={<GstReportsModule />} />
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
