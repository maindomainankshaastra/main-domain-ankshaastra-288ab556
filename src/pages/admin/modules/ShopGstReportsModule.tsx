import GstReportsModule from "./GstReportsModule";
import { SHOP_SOURCE } from "@/lib/connected-sites";

/** Admin > Shop GSTR Reports — same report engine, limited to the Shopify store's invoices. */
export default function ShopGstReportsModule() {
  return <GstReportsModule site={SHOP_SOURCE} title="Shop GST & GSTR-1 Reports" />;
}
