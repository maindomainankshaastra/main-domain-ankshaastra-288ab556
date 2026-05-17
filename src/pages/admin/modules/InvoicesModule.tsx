import { AdminPage } from "@/components/admin/AdminPage";
import { useAdminTable } from "@/hooks/useAdminData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

type Invoice = {
  id: string;
  invoice_number: string;
  customer_name: string;
  service_title: string;
  total_amount: number;
  status: string;
  source_website?: string;
  pdf_url?: string;
  invoice_date: string;
};

export default function InvoicesModule() {
  const { rows, loading } = useAdminTable<Invoice>("invoices", "invoice_date");

  return (
    <AdminPage title="Invoice Manager" description="GST invoices with PDF export and delivery tracking." loading={loading} empty={!rows.length}>
      <div className="space-y-2">
        {rows.map((i) => (
          <div key={i.id} className="flex flex-wrap justify-between gap-3 border border-border rounded-lg p-4">
            <div>
              <p className="font-semibold text-primary">{i.invoice_number}</p>
              <p className="text-sm text-muted-foreground">{i.customer_name} · {i.service_title}</p>
              <p className="text-xs text-muted-foreground mt-1">{i.source_website} · {new Date(i.invoice_date).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">₹{Number(i.total_amount).toLocaleString()}</span>
              <Badge>{i.status}</Badge>
              {i.pdf_url && (
                <Button size="sm" variant="outline" asChild>
                  <a href={i.pdf_url} target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4" /></a>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </AdminPage>
  );
}
