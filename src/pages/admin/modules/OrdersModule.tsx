import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage } from "@/components/admin/AdminPage";
import { useAdminTable } from "@/hooks/useAdminData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, Loader2 } from "lucide-react";
import { generateInvoiceForOrder } from "@/lib/invoice-admin";

type Order = {
  id: string;
  service_title: string;
  total_amount: number;
  status: string;
  workflow_stage?: string;
  source_website?: string;
  customer_name?: string;
  created_at: string;
};

type OrderStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";

const orderStatuses: OrderStatus[] = ["pending", "paid", "failed", "refunded", "cancelled"];

export default function OrdersModule() {
  const { rows, loading, reload } = useAdminTable<Order>("orders");
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const runGenerateInvoice = async (orderId: string) => {
    setGeneratingId(orderId);
    try {
      const result = await generateInvoiceForOrder(orderId);
      toast.success(
        result.invoice_number
          ? `Invoice ${result.invoice_number} generated and emailed`
          : "Invoice generated and emailed",
      );
      reload();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to generate invoice");
    } finally {
      setGeneratingId(null);
    }
  };

  const updateStatus = async (id: string, status: OrderStatus) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Updated");
      reload();
    }
  };

  const markPaidAndInvoice = async (order: Order) => {
    if (order.status !== "paid") {
      const { error } = await supabase
        .from("orders")
        .update({ status: "paid", workflow_stage: "payment_received" })
        .eq("id", order.id);
      if (error) {
        toast.error(error.message);
        return;
      }
    }
    await runGenerateInvoice(order.id);
  };

  return (
    <AdminPage title="Orders & Bookings" description="All orders across connected websites." loading={loading} empty={!rows.length}>
      <div className="space-y-2">
        {rows.map((o) => (
          <div key={o.id} className="flex flex-wrap gap-3 justify-between items-center border border-border rounded-lg p-4">
            <div className="min-w-0">
              <p className="font-semibold truncate">{o.service_title}</p>
              <p className="text-xs text-muted-foreground">
                {o.customer_name || "Guest"} · {o.source_website || "ankshaastra.com"} · {new Date(o.created_at).toLocaleString()}
              </p>
              {o.workflow_stage && <Badge variant="outline" className="mt-1 text-xs">{o.workflow_stage}</Badge>}
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">₹{Number(o.total_amount).toLocaleString()}</span>
              {o.status === "paid" ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={generatingId === o.id}
                  onClick={() => runGenerateInvoice(o.id)}
                >
                  {generatingId === o.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-1" />
                      Generate Invoice
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={generatingId === o.id}
                  onClick={() => markPaidAndInvoice(o)}
                >
                  {generatingId === o.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Mark paid + Invoice"
                  )}
                </Button>
              )}
              <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v as OrderStatus)}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {orderStatuses.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
    </AdminPage>
  );
}
