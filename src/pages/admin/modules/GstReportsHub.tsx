import { useState } from "react";
import { SiteTabs } from "@/components/admin/SiteTabs";
import GstReportsModule from "./GstReportsModule";
import ShopGstReportsModule from "./ShopGstReportsModule";

const TABS = [
  { key: "all", label: "All sites (combined GSTR-1)" },
  { key: "shop", label: "Shop only" },
];

/**
 * Admin > GSTR Reports: one menu item, two tabs. One GSTIN files ONE GSTR-1 for every site, so the
 * first tab (used for Mark Ready / Mark Filed) includes the Shop; the Shop tab is a review/export view.
 */
export default function GstReportsHub() {
  const [tab, setTab] = useState("all");
  return (
    <div>
      <SiteTabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === "shop" ? <ShopGstReportsModule key="shop" /> : <GstReportsModule key="all" />}
    </div>
  );
}
