// import { useState } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import { AdminPage } from "@/components/admin/AdminPage";
// import { Button } from "@/components/ui/button";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Loader2, Wrench } from "lucide-react";
// import { toast } from "sonner";

// type FixSummary = {
//   processed: number;
//   corrected: number;
//   remainingWarnings: number;
// };

// export default function GstMaintenanceModule() {
//   const [loading, setLoading] = useState(false);
//   const [summary, setSummary] = useState<FixSummary | null>(null);

//   const fixAll = async () => {
//     setLoading(true);
//     try {
//       const { data: sessionData } = await supabase.auth.getSession();
//       const token = sessionData.session?.access_token;
//       if (!token) throw new Error("Not signed in");

//       const res = await fetch("/api/admin/gst-maintenance", {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const body = (await res.json()) as { error?: string; summary?: FixSummary };
//       if (!res.ok) throw new Error(body.error || "Fix failed");

//       setSummary(body.summary || null);
//       toast.success(`Corrected ${body.summary?.corrected ?? 0} invoice(s)`);
//     } catch (e: unknown) {
//       toast.error(e instanceof Error ? e.message : "GST fix failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <AdminPage
//       title="GST Maintenance"
//       description="Auto-fix historical invoices: assign SAC 999799, GST rate 18%, detect customer state, and reclassify GSTR categories."
//     >
//       <div className="space-y-6 max-w-xl">
//         <Alert>
//           <Wrench className="h-4 w-4" />
//           <AlertTitle>Auto Fix Historical GST Data</AlertTitle>
//           <AlertDescription className="mt-2 space-y-2 text-sm">
//             <p>For all invoices this will:</p>
//             <ul className="list-disc pl-5 space-y-1">
//               <li>Assign SAC <strong>999799</strong> when missing</li>
//               <li>Assign GST rate <strong>18%</strong> when missing</li>
//               <li>Detect customer state from billing address / order form snapshot</li>
//               <li>Set Unknown (00) when state cannot be detected</li>
//               <li>Mark records as <code>gst_auto_corrected</code></li>
//             </ul>
//           </AlertDescription>
//         </Alert>

//         <Button onClick={fixAll} disabled={loading} size="lg">
//           {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wrench className="w-4 h-4 mr-2" />}
//           Fix All GST Data
//         </Button>

//         {summary && (
//           <div className="grid gap-3 sm:grid-cols-3">
//             <div className="rounded-lg border p-4">
//               <p className="text-xs text-muted-foreground">Invoices Processed</p>
//               <p className="text-2xl font-bold">{summary.processed}</p>
//             </div>
//             <div className="rounded-lg border p-4">
//               <p className="text-xs text-muted-foreground">Invoices Corrected</p>
//               <p className="text-2xl font-bold text-primary">{summary.corrected}</p>
//             </div>
//             <div className="rounded-lg border p-4">
//               <p className="text-xs text-muted-foreground">Remaining Warnings</p>
//               <p className="text-2xl font-bold">{summary.remainingWarnings}</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </AdminPage>
//   );
// }


import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage } from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Wrench, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

type FixSummary = {
  processed: number;
  corrected: number;
  remainingWarnings: number;
};

const CONFIRM_WORD = "FIX";

export default function GstMaintenanceModule() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<FixSummary | null>(null);

  // Step 1: explanation modal shown right after clicking "Fix All GST Data".
  const [explainOpen, setExplainOpen] = useState(false);
  // Step 2: type-to-confirm modal, only reachable after "Continue" on step 1.
  const [typeConfirmOpen, setTypeConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const runEnabled = confirmText.trim().toUpperCase() === CONFIRM_WORD;

  // Existing fix logic — untouched. Only the error branch now shows a
  // friendly message instead of the raw API/exception text; the actual
  // error is still logged to the console for debugging.
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
      console.error("GST fix failed:", e);
      toast.error("Couldn't fix GST data", {
        description: "Something went wrong while updating GST records. Please try again or contact support.",
      });
    } finally {
      setLoading(false);
    }
  };

  const openConfirmFlow = () => {
    setConfirmText("");
    setExplainOpen(true);
  };

  const handleContinueFromExplain = () => {
    setExplainOpen(false);
    setConfirmText("");
    setTypeConfirmOpen(true);
  };

  const handleCancelTypeConfirm = () => {
    setTypeConfirmOpen(false);
    setConfirmText("");
  };

  const handleRun = async () => {
    if (!runEnabled) return;
    setTypeConfirmOpen(false);
    setConfirmText("");
    await fixAll();
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

        <Button onClick={openConfirmFlow} disabled={loading} size="lg">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wrench className="w-4 h-4 mr-2" />}
          {loading ? "Fixing GST Data…" : "Fix All GST Data"}
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

      {/* Step 1: explanation modal — warning styling, no destructive action yet */}
      <AlertDialog open={explainOpen} onOpenChange={(open) => !open && setExplainOpen(false)}>
        <AlertDialogContent className="border-amber-300 dark:border-amber-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              Fix All GST Data?
            </AlertDialogTitle>
          </AlertDialogHeader>

          <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <p>
              This operation will update historical GST information for existing invoices and
              orders. Changes may include:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Missing customer state</li>
              <li>Missing billing address</li>
              <li>Missing GST classification</li>
              <li>Missing SAC code</li>
              <li>GST compliance corrections</li>
            </ul>
            <p className="mt-2 font-medium">This operation cannot be easily undone.</p>
          </div>

          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setExplainOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={handleContinueFromExplain}
            >
              Continue
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Step 2: type-to-confirm modal — final safety gate before running the fix */}
      <AlertDialog
        open={typeConfirmOpen}
        onOpenChange={(open) => !open && handleCancelTypeConfirm()}
      >
        <AlertDialogContent className="border-amber-300 dark:border-amber-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              Confirm GST Fix
            </AlertDialogTitle>
          </AlertDialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Type <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">{CONFIRM_WORD}</span>{" "}
              to confirm you want to run this on all historical invoices and orders.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="gst-confirm-word">Type "{CONFIRM_WORD}" to confirm</Label>
              <Input
                id="gst-confirm-word"
                autoFocus
                autoComplete="off"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={CONFIRM_WORD}
                disabled={loading}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <Button variant="outline" onClick={handleCancelTypeConfirm} disabled={loading}>
              Cancel
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
              onClick={handleRun}
              disabled={!runEnabled || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running…
                </>
              ) : (
                "Run"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPage>
  );
}