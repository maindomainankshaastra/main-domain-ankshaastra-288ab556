import ServiceHubPage from "@/components/services/ServiceHubPage";
import { luckyNumerologyHub } from "@/data/serviceCatalog";

const features = [
  "Personalized numerology analysis for your specific need",
  "Expert-reviewed recommendations — not auto-generated",
  "Delivered with clear guidance on implementation",
  "Add-ons available for remedies and lucky colors",
];

export default function LuckyNumerology() {
  return <ServiceHubPage hub={luckyNumerologyHub} features={features} />;
}
