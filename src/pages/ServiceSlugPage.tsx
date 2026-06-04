import { useParams } from "react-router-dom";
import DynamicServicePage from "@/pages/DynamicServicePage";
import QuickServiceDetailPage from "@/components/services/QuickServiceDetailPage";
import { getStandaloneBySlug } from "@/data/standaloneServices";

/** Resolves static standalone service pages before CMS dynamic pages. */
export default function ServiceSlugPage() {
  const { slug = "" } = useParams();
  const standalone = getStandaloneBySlug(slug);

  if (standalone) {
    return <QuickServiceDetailPage service={standalone} />;
  }

  return <DynamicServicePage />;
}
