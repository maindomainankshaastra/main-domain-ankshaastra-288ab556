import { useMemo, useState } from "react";
import { AdminPage } from "@/components/admin/AdminPage";
import { useAdminTable } from "@/hooks/useAdminData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileArchive, Loader2 } from "lucide-react";
import { downloadMonthlyInvoiceZip, fetchInvoiceDownloadUrl } from "@/lib/invoice-download";
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

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function InvoicesModule() {
  const { rows, loading } = useAdminTable<Invoice>("invoices", "invoice_date");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const now = new Date();
  const [bulkYear, setBulkYear] = useState(String(now.getFullYear()));
  const [bulkMonth, setBulkMonth] = useState(String(now.getMonth() + 1));

  const yearOptions = useMemo(() => {
    const current = now.getFullYear();
    return Array.from({ length: 5 }, (_, i) => String(current - i));
  }, [now]);

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

  const downloadMonthlyBundle = async () => {
    setBulkLoading(true);
    try {
      const result = await downloadMonthlyInvoiceZip(Number(bulkYear), Number(bulkMonth));
      const monthLabel = MONTHS[Number(bulkMonth) - 1];
      toast.success(
        `Downloaded ${result.included} invoice${result.included === 1 ? "" : "s"} for ${monthLabel} ${bulkYear}` +
          (result.skipped ? ` (${result.skipped} skipped)` : ""),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bulk download failed");
    } finally {
      setBulkLoading(false);
    }
  };

  const bulkActions = (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={bulkMonth} onValueChange={setBulkMonth}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((label, index) => (
            <SelectItem key={label} value={String(index + 1)}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={bulkYear} onValueChange={setBulkYear}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {yearOptions.map((year) => (
            <SelectItem key={year} value={year}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button size="sm" disabled={bulkLoading} onClick={() => void downloadMonthlyBundle()}>
        {bulkLoading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <FileArchive className="w-4 h-4 mr-2" />
        )}
        Download ZIP
      </Button>
    </div>
  );

  return (
    <AdminPage
      title="Invoice Manager"
      description="GST invoices stored in Supabase — download PDFs individually or as a monthly ZIP bundle."
      loading={loading}
      empty={!rows.length}
      emptyMessage="No invoices yet. You can still download a monthly ZIP if PDFs exist for that period."
      actions={bulkActions}
    >
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
