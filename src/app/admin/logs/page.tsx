"use client";

import { useEffect, useState } from "react";
import { AdminTable } from "@/components/admin/admin-table";
import { ExportButton } from "@/components/admin/export-button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AdminLog {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: string | null;
  createdAt: Date;
  admin: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  };
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState("all");
  const [targetTypeFilter, setTargetTypeFilter] = useState("all");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
        action: actionFilter,
        targetType: targetTypeFilter,
      });

      const res = await fetch(`/api/admin/logs?${params}`);
      const data = await res.json();

      setLogs(data.logs);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, targetTypeFilter]);

  const getActionBadge = (action: string) => {
    const variants: Record<string, any> = {
      ban_user: "destructive",
      unban_user: "default",
      delete_comment: "destructive",
      delete_project: "destructive",
      resolve_report: "outline",
      dismiss_report: "secondary",
    };

    const labels: Record<string, string> = {
      ban_user: "Ban User",
      unban_user: "Unban User",
      delete_comment: "Delete Comment",
      delete_project: "Delete Project",
      resolve_report: "Resolve Report",
      dismiss_report: "Dismiss Report",
    };

    return (
      <Badge variant={variants[action] || "outline"} className="rounded-full">
        {labels[action] || action}
      </Badge>
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const columns = [
    {
      key: "admin",
      label: "Admin",
      render: (log: AdminLog) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={log.admin.avatar || undefined} />
            <AvatarFallback className="text-xs">
              {log.admin.name?.[0] || log.admin.email[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{log.admin.name || log.admin.email}</span>
        </div>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (log: AdminLog) => getActionBadge(log.action),
    },
    {
      key: "targetType",
      label: "Target Type",
      render: (log: AdminLog) => (
        <Badge variant="secondary" className="rounded-full">
          {log.targetType}
        </Badge>
      ),
    },
    {
      key: "targetId",
      label: "Target ID",
      render: (log: AdminLog) => (
        <span className="text-xs font-mono text-muted-foreground">
          {log.targetId.substring(0, 8)}...
        </span>
      ),
    },
    {
      key: "metadata",
      label: "Details",
      render: (log: AdminLog) => {
        if (!log.metadata) return <span className="text-xs text-muted-foreground">-</span>;

        try {
          const data = JSON.parse(log.metadata);
          if (data.reason) {
            return <span className="text-xs">{data.reason}</span>;
          }
          if (data.bulk) {
            return <Badge variant="outline" className="rounded-full text-xs">Bulk</Badge>;
          }
          return <span className="text-xs text-muted-foreground">-</span>;
        } catch {
          return <span className="text-xs text-muted-foreground">-</span>;
        }
      },
    },
    {
      key: "createdAt",
      label: "Timestamp",
      render: (log: AdminLog) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(log.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">View all admin actions</p>
        </div>
        <ExportButton type="logs" />
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select
          value={actionFilter}
          onValueChange={(value) => {
            setActionFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[200px] rounded-full">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="ban_user">Ban User</SelectItem>
            <SelectItem value="unban_user">Unban User</SelectItem>
            <SelectItem value="delete_project">Delete Project</SelectItem>
            <SelectItem value="delete_comment">Delete Comment</SelectItem>
            <SelectItem value="resolve_report">Resolve Report</SelectItem>
            <SelectItem value="dismiss_report">Dismiss Report</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={targetTypeFilter}
          onValueChange={(value) => {
            setTargetTypeFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[200px] rounded-full">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="project">Project</SelectItem>
            <SelectItem value="comment">Comment</SelectItem>
            <SelectItem value="report">Report</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <AdminTable
        columns={columns}
        data={logs}
        loading={loading}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
        }}
        emptyMessage="No logs found"
      />
    </div>
  );
}
