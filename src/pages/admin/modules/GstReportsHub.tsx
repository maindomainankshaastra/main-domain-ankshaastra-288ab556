// import { useState } from "react";
// import { SiteTabs } from "@/components/admin/SiteTabs";
// import GstReportsModule from "./GstReportsModule";
// import ShopGstReportsModule from "./ShopGstReportsModule";

// const TABS = [
//   { key: "all", label: "All sites (combined GSTR-1)" },
//   { key: "shop", label: "Shop only" },
// ];

// /**
//  * Admin > GSTR Reports: one menu item, two tabs. One GSTIN files ONE GSTR-1 for every site, so the
//  * first tab (used for Mark Ready / Mark Filed) includes the Shop; the Shop tab is a review/export view.
//  */
// export default function GstReportsHub() {
//   const [tab, setTab] = useState("all");
//   return (
//     <div>
//       <SiteTabs tabs={TABS} value={tab} onChange={setTab} />
//       {tab === "shop" ? <ShopGstReportsModule key="shop" /> : <GstReportsModule key="all" />}
//     </div>
//   );
// }


import { useState } from "react";
import { cn } from "@/lib/utils";
import GstReportsModule from "./GstReportsModule";
import ShopGstReportsModule from "./ShopGstReportsModule";

const TABS = [
  { key: "all", label: "Service" },
  { key: "shop", label: "Shopify" },
];

export default function GstReportsHub() {
  const [tab, setTab] = useState("all");
  return (
    <div>
      <div role="tablist" className="mb-4 flex flex-wrap gap-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-lg border px-6 py-2 text-sm font-medium transition-colors",
              tab === t.key
                ? "border-primary bg-background text-primary shadow-sm"
                : "border-border bg-muted/40 text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "shop" ? <ShopGstReportsModule key="shop" /> : <GstReportsModule key="all" />}
    </div>
  );
}
