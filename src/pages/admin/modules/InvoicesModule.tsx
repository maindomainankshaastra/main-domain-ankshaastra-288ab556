import { useState } from "react";
import { AdminPage } from "@/components/admin/AdminPage";
import { useAdminTable } from "@/hooks/useAdminData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { fetchInvoiceDownloadUrl } from "@/lib/invoice-download";
import { toast } from "sonner";

type Invoice = {
  id: string;
  invoice_number: string;
  customer_name: string;
  service_title: string;
  total_amount: number;
  status: string;
  source_website?: string;
  pdf_url?: string;
  pdf_storage_path?: string | null;
  invoice_date: string;
};

export default function InvoicesModule() {
  const { rows, loading } = useAdminTable<Invoice>("invoices", "invoice_date");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const downloadInvoice = async (inv: Invoice) => {
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

  return (
    <AdminPage title="Invoice Manager" description="GST invoices stored in Supabase — download PDFs and track delivery." loading={loading} empty={!rows.length}>
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
              {(i.pdf_storage_path || i.pdf_url) && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={downloadingId === i.id}
                  onClick={() => downloadInvoice(i)}
                >
                  {downloadingId === i.id ? (
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
    </AdminPage>
  );
}
