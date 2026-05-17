import { AdminPage } from "@/components/admin/AdminPage";
import { useAdminTable } from "@/hooks/useAdminData";
import { LogRow, statusBadge } from "./logHelpers";

export default function EmailModule() {
  const { rows, loading } = useAdminTable<Record<string, unknown>>("email_logs");
  return (
    <AdminPage title="Email Center" description="Transactional email delivery logs." loading={loading} empty={!rows.length}>
      <div className="space-y-2">
        {rows.map((r) => (
          <LogRow key={String(r.id)}>
            <div className="min-w-0">
              <p className="font-medium truncate">{String(r.subject)}</p>
              <p className="text-sm text-muted-foreground">To: {String(r.to_email)} · {String(r.provider)}</p>
            </div>
            {statusBadge(String(r.status))}
          </LogRow>
        ))}
      </div>
    </AdminPage>
  );
}
