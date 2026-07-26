import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Check, X, ClipboardList } from "lucide-react";
import { applyApprovalRequest, type ApprovalRequest } from "@/lib/approvalGate";
import { useAuth } from "@/hooks/useAuth";

function formatDateTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ACTION_BADGE: Record<string, string> = {
  insert: "bg-green-100 text-green-700 border-green-200",
  update: "bg-blue-100 text-blue-700 border-blue-200",
  delete: "bg-red-100 text-red-700 border-red-200",
};

export default function ApprovalsModule() {
  // Confirmed shape from TeamManagementModule.tsx: useAuth() returns `user`
  // (an object with `.id`), not a bare `userId`.
  const { user: currentUser } = useAuth();
  const userId = currentUser?.id;

  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadPending = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("approval_requests")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
      setRequests([]);
    } else {
      setRequests((data as ApprovalRequest[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (req: ApprovalRequest) => {
    setProcessingId(req.id);
    const { error: applyError } = await applyApprovalRequest(req);
    if (applyError) {
      setProcessingId(null);
      toast.error(`Couldn't apply change: ${applyError}`);
      return;
    }
    const { error } = await supabase
      .from("approval_requests")
      .update({ status: "approved", reviewed_by: userId, reviewed_at: new Date().toISOString() })
      .eq("id", req.id);
    setProcessingId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Approved: ${req.summary}`);
    loadPending();
  };

  const handleReject = async (req: ApprovalRequest) => {
    setProcessingId(req.id);
    const { error } = await supabase
      .from("approval_requests")
      .update({ status: "rejected", reviewed_by: userId, reviewed_at: new Date().toISOString() })
      .eq("id", req.id);
    setProcessingId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Rejected: ${req.summary}`);
    loadPending();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary" />
          Pending Approvals
        </CardTitle>
        <CardDescription>
          Changes submitted by non-admin team members. Nothing here has been applied yet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        ) : requests.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No pending approvals.</p>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="border border-border rounded-lg p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge variant="outline" className={ACTION_BADGE[req.action_type]}>
                      {req.action_type}
                    </Badge>
                    <Badge variant="secondary">{req.module}</Badge>
                  </div>
                  <p className="font-medium truncate">{req.summary}</p>
                  <p className="text-xs text-muted-foreground">
                    Requested {formatDateTime(req.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={processingId === req.id}
                    onClick={() => handleReject(req)}
                  >
                    {processingId === req.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4 mr-1 text-destructive" />
                    )}
                    Reject
                  </Button>
                  <Button size="sm" disabled={processingId === req.id} onClick={() => handleApprove(req)}>
                    {processingId === req.id ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-1" />
                    )}
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}