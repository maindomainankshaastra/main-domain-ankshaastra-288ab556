import InvoicesModule from "./InvoicesModule";
import { SHOP_SOURCE } from "@/lib/connected-sites";

/** Admin > Shop Invoices — same Invoice Manager, pinned to the Shopify store (series S26-27/0001…). */
export default function ShopInvoicesModule() {
  return <InvoicesModule lockedSite={SHOP_SOURCE} title="Shop Invoices" />;
}
