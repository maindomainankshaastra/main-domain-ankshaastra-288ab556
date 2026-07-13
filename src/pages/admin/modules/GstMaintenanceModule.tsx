import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage } from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Wrench } from "lucide-react";
import { toast } from "sonner";

type FixSummary = {
  processed: number;
  corrected: number;
  remainingWarnings: number;
};

export default function GstMaintenanceModule() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<FixSummary | null>(null);

  const fixAll = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Not signed in");

      const res = await fetch("/api/admin/gst-maintenance", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = (await res.json()) as { error?: string; summary?: FixSummary };
      if (!res.ok) throw new Error(body.error || "Fix failed");

      setSummary(body.summary || null);
      toast.success(`Corrected ${body.summary?.corrected ?? 0} invoice(s)`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "GST fix failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminPage
      title="GST Maintenance"
      description="Auto-fix historical invoices: assign SAC 999799, GST rate 18%, detect customer state, and reclassify GSTR categories."
    >
      <div className="space-y-6 max-w-xl">
        <Alert>
          <Wrench className="h-4 w-4" />
          <AlertTitle>Auto Fix Historical GST Data</AlertTitle>
          <AlertDescription className="mt-2 space-y-2 text-sm">
            <p>For all invoices this will:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Assign SAC <strong>999799</strong> when missing</li>
              <li>Assign GST rate <strong>18%</strong> when missing</li>
              <li>Detect customer state from billing address / order form snapshot</li>
              <li>Set Unknown (00) when state cannot be detected</li>
              <li>Mark records as <code>gst_auto_corrected</code></li>
            </ul>
          </AlertDescription>
        </Alert>

        <Button onClick={fixAll} disabled={loading} size="lg">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wrench className="w-4 h-4 mr-2" />}
          Fix All GST Data
        </Button>

        {summary && (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Invoices Processed</p>
              <p className="text-2xl font-bold">{summary.processed}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Invoices Corrected</p>
              <p className="text-2xl font-bold text-primary">{summary.corrected}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Remaining Warnings</p>
              <p className="text-2xl font-bold">{summary.remainingWarnings}</p>
            </div>
          </div>
        )}
      </div>
    </AdminPage>
  );
}
