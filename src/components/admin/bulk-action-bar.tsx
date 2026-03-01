"use client";

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { X, Trash2, Ban, CheckCircle } from "lucide-react";
import { useState } from "react";

interface BulkAction {
  action: string;
  label: string;
  icon: React.ReactNode;
  variant?: "default" | "destructive";
  requiresReason?: boolean;
}

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  actions: BulkAction[];
  onAction: (action: string, metadata?: any) => Promise<void>;
}

export function BulkActionBar({
  selectedCount,
  onClear,
  actions,
  onAction,
}: BulkActionBarProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: BulkAction | null;
  }>({ open: false, action: null });
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (selectedCount === 0) return null;

  const handleActionClick = (action: BulkAction) => {
    if (action.requiresReason) {
      setConfirmDialog({ open: true, action });
      setReason("");
    } else {
      setConfirmDialog({ open: true, action });
    }
  };

  const handleConfirm = async () => {
    if (!confirmDialog.action) return;

    setLoading(true);
    try {
      const metadata = confirmDialog.action.requiresReason && reason ? { reason } : undefined;
      await onAction(confirmDialog.action.action, metadata);
      setConfirmDialog({ open: false, action: null });
      setReason("");
    } catch (error) {
      console.error("Bulk action failed:", error);
      alert("Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-primary text-primary-foreground rounded-full shadow-lg px-6 py-3 flex items-center gap-4">
          <span className="font-medium">{selectedCount} selected</span>
          <div className="h-4 w-px bg-primary-foreground/20" />
          <div className="flex gap-2">
            {actions.map((action) => (
              <Button
                key={action.action}
                variant={action.variant === "destructive" ? "destructive" : "ghost"}
                size="sm"
                onClick={() => handleActionClick(action)}
                className="rounded-full"
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
          <div className="h-4 w-px bg-primary-foreground/20" />
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmDialog({ open: false, action: null });
            setReason("");
          }
        }}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Action</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to perform "{confirmDialog.action?.label}" on {selectedCount}{" "}
              item(s). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {confirmDialog.action?.requiresReason && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason..."
                className="rounded-xl"
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full" disabled={loading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={loading || (confirmDialog.action?.requiresReason && !reason)}
              className="rounded-full bg-destructive hover:bg-destructive/90"
            >
              {loading ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Pre-defined action sets for common use cases
export const userBulkActions: BulkAction[] = [
  {
    action: "ban",
    label: "Ban",
    icon: <Ban className="h-4 w-4 mr-1" />,
    variant: "destructive",
    requiresReason: true,
  },
  {
    action: "unban",
    label: "Unban",
    icon: <CheckCircle className="h-4 w-4 mr-1" />,
  },
];

export const projectBulkActions: BulkAction[] = [
  {
    action: "delete",
    label: "Delete",
    icon: <Trash2 className="h-4 w-4 mr-1" />,
    variant: "destructive",
  },
];

export const commentBulkActions: BulkAction[] = [
  {
    action: "delete",
    label: "Delete",
    icon: <Trash2 className="h-4 w-4 mr-1" />,
    variant: "destructive",
  },
];

export const reportBulkActions: BulkAction[] = [
  {
    action: "resolve",
    label: "Resolve",
    icon: <CheckCircle className="h-4 w-4 mr-1" />,
  },
  {
    action: "dismiss",
    label: "Dismiss",
    icon: <X className="h-4 w-4 mr-1" />,
  },
];
