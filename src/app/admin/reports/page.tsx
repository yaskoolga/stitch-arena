"use client";

import { useEffect, useState } from "react";
import { AdminTable } from "@/components/admin/admin-table";
import { ReportReviewDialog } from "@/components/admin/report-review-dialog";
import { BulkActionBar, reportBulkActions } from "@/components/admin/bulk-action-bar";
import { ExportButton } from "@/components/admin/export-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    avatar: string | null;
  };
  reportedUser: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  } | null;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    report: Report | null;
  }>({ open: false, report: null });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        status: statusFilter,
      });

      const res = await fetch(`/api/admin/reports?${params}`);
      const data = await res.json();

      setReports(data.reports);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, statusFilter]);

  const handleResolve = async (
    reportId: string,
    status: string,
    adminNote?: string
  ) => {
    const res = await fetch(`/api/admin/reports/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNote }),
    });

    if (res.ok) {
      fetchReports();
    } else {
      throw new Error("Failed to resolve report");
    }
  };

  const handleBulkAction = async (action: string, metadata?: any) => {
    const res = await fetch("/api/admin/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        targetType: "report",
        targetIds: selectedIds,
        metadata,
      }),
    });

    if (res.ok) {
      setSelectedIds([]);
      fetchReports();
    } else {
      const error = await res.json();
      throw new Error(error.error || "Bulk action failed");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: "destructive",
      reviewed: "default",
      resolved: "outline",
      dismissed: "secondary",
    };

    return (
      <Badge variant={variants[status] || "outline"} className="rounded-full">
        {status}
      </Badge>
    );
  };

  const getReasonBadge = (reason: string) => {
    const labels: Record<string, string> = {
      spam: "Spam",
      inappropriate: "Inappropriate",
      harassment: "Harassment",
      other: "Other",
    };

    return (
      <Badge variant="outline" className="rounded-full">
        {labels[reason] || reason}
      </Badge>
    );
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns = [
    {
      key: "type",
      label: "Type",
      render: (report: Report) => (
        <span className="text-sm">{getTypeLabel(report.type)}</span>
      ),
    },
    {
      key: "reason",
      label: "Reason",
      render: (report: Report) => getReasonBadge(report.reason),
    },
    {
      key: "reporter",
      label: "Reporter",
      render: (report: Report) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={report.reporter.avatar || undefined} />
            <AvatarFallback className="text-xs">
              {report.reporter.name?.[0] || report.reporter.email[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{report.reporter.name || report.reporter.email}</span>
        </div>
      ),
    },
    {
      key: "reportedUser",
      label: "Reported User",
      render: (report: Report) =>
        report.reportedUser ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={report.reportedUser.avatar || undefined} />
              <AvatarFallback className="text-xs">
                {report.reportedUser.name?.[0] ||
                  report.reportedUser.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">
              {report.reportedUser.name || report.reportedUser.email}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">N/A</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (report: Report) => getStatusBadge(report.status),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (report: Report) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(report.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (report: Report) => (
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => setReviewDialog({ open: true, report })}
        >
          <Eye className="h-4 w-4 mr-1" />
          Review
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Review and manage user reports</p>
        </div>
        <ExportButton type="reports" />
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[200px] rounded-full">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <AdminTable
        columns={columns}
        data={reports}
        loading={loading}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
        }}
        emptyMessage="No reports found"
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Bulk Actions */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        actions={reportBulkActions}
        onAction={handleBulkAction}
      />

      {/* Review Dialog */}
      <ReportReviewDialog
        open={reviewDialog.open}
        onOpenChange={(open) => setReviewDialog({ open, report: null })}
        report={reviewDialog.report}
        onResolve={handleResolve}
      />
    </div>
  );
}
