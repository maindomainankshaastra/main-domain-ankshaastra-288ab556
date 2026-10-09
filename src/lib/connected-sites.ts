/** Connected website domains — keep in sync with server/lib/connected-sites.ts */
export const CONNECTED_SITE_OPTIONS = [
  { value: "all", label: "All sites" },
  { value: "ankshaastra.com", label: "ankshaastra.com" },
  { value: "empower.ankshaastra.com", label: "empower.ankshaastra.com" },
  { value: "miraclebaby.ankshaastra.com", label: "miraclebaby.ankshaastra.com" },
    { value: "shop.ankshaastra.com", label: "shop.ankshaastra.com" },
  
] as const;

export const EMPOWER_SOURCE = "empower.ankshaastra.com";
export const SHOP_SOURCE = "shop.ankshaastra.com";

export const HUB_API_BASE =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? `${window.location.origin}/api`
    : "https://ankshaastra.com/api";
