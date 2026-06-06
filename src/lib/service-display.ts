import {
  callConsultationHub,
  nameCorrectionPackages,
  officeVastuPackages,
  kundli20Packages,
  varshphalPackages,
  pyaarShastraPackages,
  businessNumerologyHub,
  businessPartnerPackage,
  type CatalogPackage,
} from "@/data/serviceCatalog";
import { standaloneServices } from "@/data/standaloneServices";

export type ServiceDisplayInfo = {
  packageName: string;
  hubTitle?: string;
  price: number;
  summary: string;
};

const allPackages: Array<{ hub?: string; pkg: CatalogPackage }> = [
  ...callConsultationHub.packages.map((pkg) => ({ hub: callConsultationHub.title, pkg })),
  ...nameCorrectionPackages.map((pkg) => ({ hub: "Name Correction", pkg })),
  ...officeVastuPackages.map((pkg) => ({ hub: "Office Vastu", pkg })),
  ...kundli20Packages.map((pkg) => ({ hub: "Premium Personalised Kundli 2.0", pkg })),
  ...varshphalPackages.map((pkg) => ({ hub: "Reports", pkg })),
  ...pyaarShastraPackages.map((pkg) => ({ hub: "Reports", pkg })),
  ...businessNumerologyHub.packages.map((pkg) => ({ hub: businessNumerologyHub.title, pkg })),
  { hub: "Business & Brand Numerology", pkg: businessPartnerPackage },
];

const displayByTitle = new Map<string, ServiceDisplayInfo>();

for (const { hub, pkg } of allPackages) {
  displayByTitle.set(pkg.serviceTitle.toLowerCase(), {
    packageName: pkg.name,
    hubTitle: hub,
    price: pkg.price,
    summary: pkg.description || pkg.name,
  });
}

for (const s of standaloneServices) {
  displayByTitle.set(s.serviceTitle.toLowerCase(), {
    packageName: s.title,
    hubTitle: s.category,
    price: s.price,
    summary: s.subtitle,
  });
}

export function resolveServiceDisplay(serviceTitle: string | null): ServiceDisplayInfo | null {
  if (!serviceTitle) return null;
  return displayByTitle.get(serviceTitle.toLowerCase()) ?? null;
}
