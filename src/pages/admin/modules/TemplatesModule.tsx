import { AdminPage } from "@/components/admin/AdminPage";
import { useAdminTable } from "@/hooks/useAdminData";
import { Badge } from "@/components/ui/badge";

export default function TemplatesModule() {
  const { rows, loading } = useAdminTable<Record<string, unknown>>("communication_templates");
  return (
    <AdminPage title="Template Manager" description="Email notification templates." loading={loading} empty={!rows.length}>
      <div className="space-y-2">
        {rows.map((t) => (
          <div key={String(t.id)} className="border border-border rounded-lg p-4 flex justify-between">
            <div>
              <p className="font-semibold">{String(t.name)}</p>
              <p className="text-xs text-muted-foreground font-mono">{String(t.slug)}</p>
            </div>
            <Badge variant="outline">{String(t.channel)}</Badge>
          </div>
        ))}
      </div>
    </AdminPage>
  );
}
