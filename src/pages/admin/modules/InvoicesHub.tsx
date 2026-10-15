import { useState } from "react";
import { SiteTabs } from "@/components/admin/SiteTabs";
import InvoicesModule from "./InvoicesModule";
import ShopInvoicesModule from "./ShopInvoicesModule";

const TABS = [
  { key: "main", label: "Ankshaastra · Empower · Miracle Baby" },
  { key: "shop", label: "Shop" },
];

/** Admin > Invoice Manager: one menu item, two tabs (the original three sites | the Shopify store). */
export default function InvoicesHub() {
  const [tab, setTab] = useState("main");
  return (
    <div>
      <SiteTabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === "shop" ? <ShopInvoicesModule key="shop" /> : <InvoicesModule key="main" />}
    </div>
  );
}
