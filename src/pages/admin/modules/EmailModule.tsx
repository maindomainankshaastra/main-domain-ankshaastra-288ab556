import { useState } from "react";
import { AdminPage } from "@/components/admin/AdminPage";
import { useAdminTable } from "@/hooks/useAdminData";
import { LogRow, statusBadge } from "./logHelpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { sendTestEmail } from "@/lib/email-admin";
import { useAuth } from "@/hooks/useAuth";

export default function EmailModule() {
  const { user } = useAuth();
  const { rows, loading, reload } = useAdminTable<Record<string, unknown>>("email_logs", "created_at");
  const [testTo, setTestTo] = useState(user?.email || "");
  const [sending, setSending] = useState(false);

  const runTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTo.trim()) {
      toast.error("Enter a recipient email");
      return;
    }
    setSending(true);
    try {
      const result = await sendTestEmail(testTo.trim());
      toast.success(`Test email sent to ${testTo.trim()}${result.messageId ? ` (${result.messageId})` : ""}`);
      reload();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Test email failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminPage title="Email Center" description="SMTP delivery logs and test sending." loading={false} empty={false}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            Send test email
          </CardTitle>
          <CardDescription>
            Verify SMTP settings on Vercel (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM). A successful test appears in the log below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={runTestEmail} className="flex flex-wrap items-end gap-3 max-w-xl">
            <div className="flex-1 min-w-[220px] space-y-2">
              <Label htmlFor="test-email-to">Recipient</Label>
              <Input
                id="test-email-to"
                type="email"
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <Button type="submit" disabled={sending}>
              {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
              Send test
            </Button>
          </form>
        </CardContent>
      </Card>

      <h3 className="text-sm font-medium text-muted-foreground mb-3">Delivery log</h3>
      {loading ? (
        <p className="text-muted-foreground text-sm">Loading logs…</p>
      ) : !rows.length ? (
        <p className="text-muted-foreground text-sm py-8 text-center border border-dashed border-border rounded-lg">
          No emails logged yet. Send a test email above.
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <LogRow key={String(r.id)}>
              <div className="min-w-0">
                <p className="font-medium truncate">{String(r.subject)}</p>
                <p className="text-sm text-muted-foreground">
                  To: {String(r.to_email)} · {String(r.provider)}
                  {r.template_slug ? ` · ${String(r.template_slug)}` : ""}
                </p>
                {r.error_message ? (
                  <p className="text-xs text-destructive mt-1">{String(r.error_message)}</p>
                ) : null}
              </div>
              {statusBadge(String(r.status))}
            </LogRow>
          ))}
        </div>
      )}
    </AdminPage>
  );
}
