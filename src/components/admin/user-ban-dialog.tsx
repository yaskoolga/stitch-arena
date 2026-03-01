"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface UserBanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    name: string | null;
    email: string;
    isBanned: boolean;
  } | null;
  onConfirm: (userId: string, banned: boolean, reason?: string) => Promise<void>;
}

export function UserBanDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
}: UserBanDialogProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(user.id, !user.isBanned, reason || undefined);
      onOpenChange(false);
      setReason("");
    } catch (error) {
      console.error("Failed to update user:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {user.isBanned ? "Unban User" : "Ban User"}
          </DialogTitle>
          <DialogDescription>
            {user.isBanned
              ? `Remove ban from ${user.name || user.email}?`
              : `Are you sure you want to ban ${user.name || user.email}?`}
          </DialogDescription>
        </DialogHeader>

        {!user.isBanned && (
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              placeholder="Enter ban reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="rounded-xl"
            />
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button
            variant={user.isBanned ? "default" : "destructive"}
            onClick={handleConfirm}
            disabled={loading}
            className="rounded-full"
          >
            {loading
              ? "Processing..."
              : user.isBanned
              ? "Unban User"
              : "Ban User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
