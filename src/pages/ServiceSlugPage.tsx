import { Navigate, useParams } from "react-router-dom";
import DynamicServicePage from "@/pages/DynamicServicePage";
import QuickServiceDetailPage from "@/components/services/QuickServiceDetailPage";
import { getStandaloneBySlug } from "@/data/standaloneServices";
import { isQuickServiceSlug, reservedServiceSlugs } from "@/data/serviceRoutes";

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
