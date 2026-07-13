import { AdminPage } from "@/components/admin/AdminPage";
import { useAdminTable } from "@/hooks/useAdminData";
import { Badge } from "@/components/ui/badge";

export default function AiReportsModule() {
  const { rows, loading } = useAdminTable<Record<string, unknown>>("ai_reports");
  return (
    <AdminPage title="AI Reports" description="Kundali, numerology, and AI report generation logs." loading={loading} empty={!rows.length}>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={String(r.id)} className="border border-border rounded-lg p-4 flex justify-between">
            <div>
              <p className="font-medium">{String(r.report_type)}</p>
              <p className="text-xs text-muted-foreground">{new Date(String(r.created_at)).toLocaleString()}</p>
            </div>
            <Badge>{String(r.status)}</Badge>
          </div>
        ))}
      </div>
    </AdminPage>
  );
}
