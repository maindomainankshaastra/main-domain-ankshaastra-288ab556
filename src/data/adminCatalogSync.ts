import { callConsultationHub, type CatalogPackage, type ServiceHub } from "@/data/serviceCatalog";

export type CatalogPageSync = {
  slug: string;
  hub: ServiceHub;
};

/** Hubs whose packages/route are defined in code and can be synced into admin CMS. */
export const catalogPageSyncList: CatalogPageSync[] = [
  { slug: "call-consultation", hub: callConsultationHub },
];

export function getCatalogSyncForSlug(slug: string): CatalogPageSync | undefined {
  return catalogPageSyncList.find((entry) => entry.slug === slug);
}

export function catalogPackageToAdminPayload(
  pageId: string,
  pkg: CatalogPackage,
  sortOrder: number,
) {
  return {
    page_id: pageId,
    name: pkg.name,
    tag: pkg.tag || null,
    description: pkg.description || null,
    price: pkg.price,
    original_price: pkg.originalPrice ?? null,
    gst_rate: 18,
    features: [] as string[],
    excluded: [] as string[],
    form_type: pkg.formType,
    payment_service_title: pkg.serviceTitle,
    is_popular: Boolean(pkg.popular),
    is_active: true,
    sort_order: sortOrder,
  };
}
