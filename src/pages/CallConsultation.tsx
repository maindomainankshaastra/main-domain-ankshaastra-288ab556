import ServiceHubPage from "@/components/services/ServiceHubPage";
import { callConsultationHub } from "@/data/serviceCatalog";

const features = [
  "3-step structured consultation with Himansshu Agarwal Ji",
  "Written remedies shared over Email / WhatsApp after calls",
  "Highly confidential — no intermediaries",
  "Audio or video — choose what suits you",
];

export default function CallConsultation() {
  return <ServiceHubPage hub={callConsultationHub} features={features} />;
}
