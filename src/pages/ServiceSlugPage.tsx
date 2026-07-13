import { Navigate, useParams } from "react-router-dom";
import DynamicServicePage from "@/pages/DynamicServicePage";
import QuickServiceDetailPage from "@/components/services/QuickServiceDetailPage";
import { getStandaloneBySlug } from "@/data/standaloneServices";
import { isQuickServiceSlug, reservedServiceSlugs } from "@/data/serviceRoutes";
import { payLink } from "@/config/pricing";

// Services that should skip the detail page and go straight to the checkout form.
const DIRECT_TO_CHECKOUT_SLUGS = new Set([
  "lucky-vehicle-number",
  "lucky-vehicle-color",
  "lucky-vehicle-purchase-date",
  "lucky-flat-number",
  "exhibition-stall-number",
  "plot-number-analysis",
  "land-purchase-date",
  "company-bank-account-opening-date",
  "company-registration-date",
]);

/**
 * Catch-all for /services/:slug
 * 1. Reserved packaged pages are handled by explicit App routes (never hit here)
 * 2. Quick standalone services (H–M, individual business) → QuickServiceDetailPage
 * 3. CMS pages from Supabase → DynamicServicePage
 */
export default function ServiceSlugPage() {
  const { slug = "" } = useParams();

  if (reservedServiceSlugs.has(slug)) {
    return <Navigate to="/services" replace />;
  }

  if (DIRECT_TO_CHECKOUT_SLUGS.has(slug)) {
    const standalone = getStandaloneBySlug(slug);
    if (standalone) {
      return (
        <Navigate
          to={payLink(standalone.serviceTitle, standalone.price, standalone.formType)}
          replace
        />
      );
    }
  }

  if (isQuickServiceSlug(slug)) {
    const standalone = getStandaloneBySlug(slug);
    if (standalone) {
      return <QuickServiceDetailPage service={standalone} />;
    }
  }

  const standalone = getStandaloneBySlug(slug);
  if (standalone) {
    return <QuickServiceDetailPage service={standalone} />;
  }

  return <DynamicServicePage />;
}
