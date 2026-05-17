import { AdminPage } from "@/components/admin/AdminPage";
import { useAdminTable } from "@/hooks/useAdminData";
import { Badge } from "@/components/ui/badge";

export default function ProductsModule() {
  const { rows, loading } = useAdminTable<Record<string, unknown>>("product_catalog");
  return (
    <AdminPage title="Product Catalog" description="E-commerce & spiritual products (ankshaastra.in)." loading={loading} empty={!rows.length}>
      <div className="space-y-2">
        {rows.map((p) => (
          <div key={String(p.id)} className="border border-border rounded-lg p-4 flex justify-between">
            <div>
              <p className="font-semibold">{String(p.title)}</p>
              <p className="text-sm text-muted-foreground">{String(p.category || "—")} · SKU {String(p.sku || "—")}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">₹{Number(p.price).toLocaleString()}</span>
              {!p.is_active && <Badge variant="secondary">Inactive</Badge>}
            </div>
          </div>
        ))}
      </div>
    </AdminPage>
  );
}
