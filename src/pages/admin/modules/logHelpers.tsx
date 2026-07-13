import { Badge } from "@/components/ui/badge";

export function statusBadge(status: string) {
  const v =
    status === "sent" || status === "paid" || status === "processed" || status === "delivered"
      ? "default"
      : status === "failed"
        ? "destructive"
        : "secondary";
  return <Badge variant={v}>{status}</Badge>;
}

export function LogRow({ children }: { children: React.ReactNode }) {
  return <div className="border border-border rounded-lg p-4 flex justify-between gap-3 flex-wrap">{children}</div>;
}
