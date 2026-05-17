import { AdminPage } from "@/components/admin/AdminPage";
import { useAdminTable } from "@/hooks/useAdminData";
import { Badge } from "@/components/ui/badge";
import { statusBadge } from "./logHelpers";

export default function WorkflowsModule() {
  const { rows: events, loading: eLoading } = useAdminTable<Record<string, unknown>>("workflow_events");
  const { rows: jobs, loading: jLoading } = useAdminTable<Record<string, unknown>>("automation_jobs");

  return (
    <div className="space-y-6">
      <AdminPage title="Automation Jobs" description="Queue-based workflow processor (serverless)." loading={jLoading} empty={!jobs.length}>
        <div className="space-y-2">
          {jobs.map((j) => (
            <div key={String(j.id)} className="border border-border rounded-lg p-4 flex justify-between">
              <div>
                <p className="font-medium">{String(j.job_type)}</p>
                <p className="text-xs text-muted-foreground">Attempts: {String(j.attempts)}</p>
              </div>
              {statusBadge(String(j.status))}
            </div>
          ))}
        </div>
      </AdminPage>
      <AdminPage title="Workflow Events" description="Order lifecycle audit trail." loading={eLoading} empty={!events.length}>
        <div className="space-y-2">
          {events.map((e) => (
            <div key={String(e.id)} className="border border-border rounded-lg p-4 text-sm">
              <span className="font-medium">{String(e.event_type)}</span>
              <span className="text-muted-foreground"> · {String(e.from_stage)} → {String(e.to_stage)}</span>
              <p className="text-xs text-muted-foreground mt-1">{new Date(String(e.created_at)).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </AdminPage>
    </div>
  );
}
