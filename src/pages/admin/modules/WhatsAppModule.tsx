import { AdminPage } from "@/components/admin/AdminPage";
import { useAdminTable } from "@/hooks/useAdminData";
import { LogRow, statusBadge } from "./logHelpers";

export default function WhatsAppModule() {
  const { rows, loading } = useAdminTable<Record<string, unknown>>("whatsapp_logs");
  return (
    <AdminPage title="WhatsApp Center" description="WhatsApp automation delivery logs." loading={loading} empty={!rows.length}>
      <div className="space-y-2">
        {rows.map((r) => (
          <LogRow key={String(r.id)}>
            <div>
              <p className="font-medium">{String(r.to_phone)}</p>
              <p className="text-sm text-muted-foreground">{String(r.provider)} · {String(r.template_slug || "—")}</p>
            </div>
            {statusBadge(String(r.status))}
          </LogRow>
        ))}
      </div>
    </AdminPage>
  );
}
