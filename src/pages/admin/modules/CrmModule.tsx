import { AdminPage } from "@/components/admin/AdminPage";
import { useAdminTable } from "@/hooks/useAdminData";
import { Badge } from "@/components/ui/badge";

type Customer = {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  source_website?: string;
  lifecycle_stage?: string;
  created_at: string;
};

export default function CrmModule() {
  const { rows, loading } = useAdminTable<Customer>("customers");
  return (
    <AdminPage title="CRM" description="Customer lifecycle across all properties." loading={loading} empty={!rows.length}>
      <div className="space-y-2">
        {rows.map((c) => (
          <div key={c.id} className="border border-border rounded-lg p-4 flex justify-between gap-3">
            <div>
              <p className="font-semibold">{c.full_name}</p>
              <p className="text-sm text-muted-foreground">{c.email || "—"} · {c.phone || "—"}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.source_website}</p>
            </div>
            <Badge variant="outline">{c.lifecycle_stage || "lead"}</Badge>
          </div>
        ))}
      </div>
    </AdminPage>
  );
}
