import { AdminPage } from "@/components/admin/AdminPage";
import { useAdminTable } from "@/hooks/useAdminData";
import { statusBadge } from "./logHelpers";

export default function WebhooksModule() {
  const { rows, loading } = useAdminTable<Record<string, unknown>>("webhooks_log");
  return (
    <AdminPage title="Webhook Logs" description="Razorpay, WhatsApp, email callbacks with deduplication." loading={loading} empty={!rows.length}>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={String(r.id)} className="border border-border rounded-lg p-4">
            <div className="flex justify-between gap-2">
              <p className="font-medium">{String(r.source)} · {String(r.event_type)}</p>
              {statusBadge(String(r.status))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{new Date(String(r.created_at)).toLocaleString()}</p>
            {Boolean(r.error_message) && <p className="text-xs text-destructive mt-1">{String(r.error_message)}</p>}
          </div>
        ))}
      </div>
    </AdminPage>
  );
}
