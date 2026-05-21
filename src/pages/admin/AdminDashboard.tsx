import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, FileText, Mail, MessageCircle, Webhook, GitBranch } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ orders: 0, invoices: 0, emails: 0, whatsapp: 0, webhooks: 0, jobs: 0 });

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
    })();
  }, []);

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
    </div>
  );
};

export default AdminDashboard;
