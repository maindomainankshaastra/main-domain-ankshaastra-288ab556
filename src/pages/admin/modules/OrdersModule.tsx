import { supabase } from "@/integrations/supabase/client";
import { AdminPage } from "@/components/admin/AdminPage";
import { useAdminTable } from "@/hooks/useAdminData";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

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

  const updateStatus = async (id: string, status: OrderStatus) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Updated"); reload(); }
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
