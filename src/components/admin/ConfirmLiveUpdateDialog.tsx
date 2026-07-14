import type { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

type ConfirmLiveUpdateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  /** Disables Cancel/Confirm while the wrapped action is in-flight. */
  loading?: boolean;
  /** "destructive" is used for permanent removals (red Delete button). */
  variant?: "default" | "destructive";
  title?: string;
  description?: ReactNode;
  confirmLabel?: string;
};

/**
 * Standard "this will go live immediately" confirmation used across the
 * Operations Console wherever an action writes directly to live website
 * data. Wraps the project's existing shadcn/radix AlertDialog — no new
 * modal library, no new visual pattern.
 *
 * This component owns ONLY the confirmation UI. The action itself (save,
 * delete, publish, toggle, etc.) is always the caller's existing handler,
 * passed in as `onConfirm`.
 */
export function ConfirmLiveUpdateDialog({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
  variant = "default",
  title,
  description,
  confirmLabel,
}: ConfirmLiveUpdateDialogProps) {
  const isDestructive = variant === "destructive";

  return (
    <AlertDialog open={open} onOpenChange={(o) => !loading && onOpenChange(o)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {title || "Confirm Live Website Update"}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-1.5">
              {description || (
                <>
                  <p>This action will immediately update the live website.</p>
                  <p>Please confirm that you want to continue.</p>
                  <p>This change will be visible to customers immediately.</p>
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={loading}
            className={
              isDestructive
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : undefined
            }
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {confirmLabel || (isDestructive ? "Delete Service" : "Confirm & Publish")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}