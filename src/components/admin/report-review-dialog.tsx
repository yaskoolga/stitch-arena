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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Report {
  id: string;
  type: string;
  reason: string;
  description: string | null;
  status: string;
  resourceId: string;
  createdAt: Date;
  reporter: {
    id: string;
    name: string | null;
    email: string;
  };
  reportedUser: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface ReportReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: Report | null;
  onResolve: (reportId: string, status: string, adminNote?: string) => Promise<void>;
}

export function ReportReviewDialog({
  open,
  onOpenChange,
  report,
  onResolve,
}: ReportReviewDialogProps) {
  const [status, setStatus] = useState<string>("reviewed");
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(false);

  if (!report) return null;

  const handleResolve = async () => {
    setLoading(true);
    try {
      await onResolve(report.id, status, adminNote || undefined);
      onOpenChange(false);
      setAdminNote("");
      setStatus("reviewed");
    } catch (error) {
      console.error("Failed to resolve report:", error);
    } finally {
      setLoading(false);
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      spam: "Spam",
      inappropriate: "Inappropriate Content",
      harassment: "Harassment",
      other: "Other",
    };
    return labels[reason] || reason;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      comment: "Comment",
      project: "Project",
      user: "User",
      dailyLog: "Daily Log",
    };
    return labels[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review Report</DialogTitle>
          <DialogDescription>
            Review and resolve this user report
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Report Info */}
          <div className="rounded-xl bg-muted p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Type:</span>
              <Badge variant="outline" className="rounded-full">
                {getTypeLabel(report.type)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Reason:</span>
              <Badge variant="destructive" className="rounded-full">
                {getReasonLabel(report.reason)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Resource ID:</span>
              <code className="text-xs bg-background px-2 py-1 rounded">
                {report.resourceId}
              </code>
            </div>
          </div>

          {/* Reporter Info */}
          <div>
            <Label className="text-xs text-muted-foreground">Reported by</Label>
            <div className="text-sm">
              {report.reporter.name || "No name"} ({report.reporter.email})
            </div>
          </div>

          {/* Reported User */}
          {report.reportedUser && (
            <div>
              <Label className="text-xs text-muted-foreground">Reported user</Label>
              <div className="text-sm">
                {report.reportedUser.name || "No name"} ({report.reportedUser.email})
              </div>
            </div>
          )}

          {/* Description */}
          {report.description && (
            <div>
              <Label className="text-xs text-muted-foreground">Description</Label>
              <div className="text-sm bg-muted p-3 rounded-xl">
                {report.description}
              </div>
            </div>
          )}

          {/* Status Selection */}
          <div>
            <Label htmlFor="status">Resolution Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="resolved">Resolved (Action Taken)</SelectItem>
                <SelectItem value="dismissed">Dismissed (No Action)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Admin Note */}
          <div>
            <Label htmlFor="adminNote">Admin Note (optional)</Label>
            <Textarea
              id="adminNote"
              placeholder="Add internal notes about your decision..."
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="rounded-xl"
              rows={3}
            />
          </div>
        </div>

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
            onClick={handleResolve}
            disabled={loading}
            className="rounded-full"
          >
            {loading ? "Processing..." : "Resolve Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
