import ServiceHubPage from "@/components/services/ServiceHubPage";
import { businessNumerologyHub } from "@/data/serviceCatalog";

const features = [
  "Business name, tagline, and mobile number analysis",
  "Auspicious dates for registration, banking, and land purchase",
  "Partner compatibility for business ventures",
  "Property and commercial space numerology guidance",
];

export default function BusinessNumerology() {
  return <ServiceHubPage hub={businessNumerologyHub} features={features} />;
}
