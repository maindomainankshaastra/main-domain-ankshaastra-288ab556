import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, FileText, Mail, MessageCircle, Webhook, GitBranch, Download, Loader2 } from "lucide-react";
import { fetchInvoiceDownloadUrl } from "@/lib/invoice-download";
import { toast } from "sonner";

type RecentInvoice = {
  id: string;
  invoice_number: string;
  customer_name: string;
  service_title: string;
  total_amount: number;
  status: string;
  invoice_date: string;
  pdf_url: string | null;
  pdf_storage_path: string | null;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ orders: 0, invoices: 0, emails: 0, whatsapp: 0, webhooks: 0, jobs: 0 });
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const tables = ["orders", "invoices", "email_logs", "whatsapp_logs", "webhooks_log", "automation_jobs"] as const;
      const db = supabase as unknown as { from: (table: string) => ReturnType<typeof supabase.from> };
      const results = await Promise.all(tables.map((t) => db.from(t).select("id", { count: "exact", head: true })));
      setStats({
        orders: results[0].count ?? 0,
        invoices: results[1].count ?? 0,
        emails: results[2].count ?? 0,
        whatsapp: results[3].count ?? 0,
        webhooks: results[4].count ?? 0,
        jobs: results[5].count ?? 0,
      });

      const { data } = await supabase
        .from("invoices")
        .select("id, invoice_number, customer_name, service_title, total_amount, status, invoice_date, pdf_url, pdf_storage_path")
        .order("invoice_date", { ascending: false })
        .limit(5);
      setRecentInvoices((data as RecentInvoice[]) || []);
    })();
  }, []);

  const downloadInvoice = async (inv: RecentInvoice) => {
    setDownloadingId(inv.id);
    try {
      const url = (await fetchInvoiceDownloadUrl(inv.id)) || inv.pdf_url;
      if (!url) {
        toast.error("Invoice PDF is not available yet.");
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Could not download invoice");
    } finally {
      setDownloadingId(null);
    }
  };

  const cards = [
    { label: "Orders", value: stats.orders, icon: Package, color: "text-amber-500" },
    { label: "Invoices", value: stats.invoices, icon: FileText, color: "text-primary" },
    { label: "Emails", value: stats.emails, icon: Mail, color: "text-blue-400" },
    { label: "WhatsApp", value: stats.whatsapp, icon: MessageCircle, color: "text-green-500" },
    { label: "Webhooks", value: stats.webhooks, icon: Webhook, color: "text-purple-400" },
    { label: "Automation Jobs", value: stats.jobs, icon: GitBranch, color: "text-rose-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-card to-background p-6">
        <h2 className="font-display text-xl font-semibold text-foreground">Ankshaastra Operations Platform</h2>
        <p className="text-muted-foreground mt-2 text-sm max-w-2xl">
          Central hub for empower.ankshaastra.com, miraclebaby.ankshaastra.com, ankshaastra.com, and ankshaastra.in —
          orders, GST invoices, email & WhatsApp automation, and workflow orchestration.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Icon className={`w-4 h-4 ${color}`} />
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold font-display">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">Recent Invoices</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/invoices">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentInvoices.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No invoices generated yet.</p>
          ) : (
            <div className="space-y-2">
              {recentInvoices.map((inv) => (
                <div key={inv.id} className="flex flex-wrap items-center justify-between gap-3 border border-border rounded-lg p-3">
                  <div>
                    <p className="font-semibold text-sm text-primary">{inv.invoice_number}</p>
                    <p className="text-xs text-muted-foreground">{inv.customer_name} · {inv.service_title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">₹{Number(inv.total_amount).toLocaleString()}</span>
                    <Badge variant="secondary" className="text-xs">{inv.status}</Badge>
                    {(inv.pdf_storage_path || inv.pdf_url) && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={downloadingId === inv.id}
                        onClick={() => downloadInvoice(inv)}
                      >
                        {downloadingId === inv.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
