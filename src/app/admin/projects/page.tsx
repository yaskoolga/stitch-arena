"use client";

import { useEffect, useState } from "react";
import { AdminTable } from "@/components/admin/admin-table";
import { BulkActionBar, projectBulkActions } from "@/components/admin/bulk-action-bar";
import { ExportButton } from "@/components/admin/export-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Search, Trash2, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  isPublic: boolean;
  totalStitches: number;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  };
  _count: {
    logs: number;
    comments: number;
    likes: number;
  };
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    project: Project | null;
  }>({ open: false, project: null });

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        search,
        status: statusFilter,
      });

      const res = await fetch(`/api/admin/projects?${params}`);
      const data = await res.json();

      setProjects(data.projects);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [page, search, statusFilter]);

  const handleDelete = async (projectId: string) => {
    const res = await fetch(`/api/admin/projects/${projectId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchProjects();
    } else {
      throw new Error("Failed to delete project");
    }
  };

  const handleBulkAction = async (action: string, metadata?: any) => {
    const res = await fetch("/api/admin/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        targetType: "project",
        targetIds: selectedIds,
        metadata,
      }),
    });

    if (res.ok) {
      setSelectedIds([]);
      fetchProjects();
    } else {
      const error = await res.json();
      throw new Error(error.error || "Bulk action failed");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      in_progress: "default",
      completed: "outline",
      paused: "secondary",
    };

    const labels: Record<string, string> = {
      in_progress: "In Progress",
      completed: "Completed",
      paused: "Paused",
    };

    return (
      <Badge variant={variants[status] || "outline"} className="rounded-full">
        {labels[status] || status}
      </Badge>
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const columns = [
    {
      key: "title",
      label: "Project",
      render: (project: Project) => (
        <div>
          <p className="font-medium">{project.title}</p>
          {project.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {project.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "user",
      label: "Author",
      render: (project: Project) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={project.user.avatar || undefined} />
            <AvatarFallback className="text-xs">
              {project.user.name?.[0] || project.user.email[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{project.user.name || project.user.email}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (project: Project) => getStatusBadge(project.status),
    },
    {
      key: "visibility",
      label: "Visibility",
      render: (project: Project) => (
        <Badge variant={project.isPublic ? "default" : "secondary"} className="rounded-full">
          {project.isPublic ? "Public" : "Private"}
        </Badge>
      ),
    },
    {
      key: "stats",
      label: "Stats",
      render: (project: Project) => (
        <div className="text-xs space-y-0.5">
          <div>{project.totalStitches.toLocaleString()} stitches</div>
          <div className="text-muted-foreground">
            {project._count.logs} logs • {project._count.comments} comments •{" "}
            {project._count.likes} likes
          </div>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (project: Project) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(project.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (project: Project) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={() => window.open(`/projects/${project.id}`, "_blank")}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-destructive hover:text-destructive"
            onClick={() => setDeleteDialog({ open: true, project })}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Moderate user projects</p>
        </div>
        <ExportButton type="projects" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 rounded-full"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px] rounded-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <AdminTable
        columns={columns}
        data={projects}
        loading={loading}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
        }}
        emptyMessage="No projects found"
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Bulk Actions */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        actions={projectBulkActions}
        onAction={handleBulkAction}
      />

      {/* Delete Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, project: null })}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteDialog.project?.title}" and all its logs, comments, and likes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive hover:bg-destructive/90"
              onClick={async () => {
                if (deleteDialog.project) {
                  await handleDelete(deleteDialog.project.id);
                  setDeleteDialog({ open: false, project: null });
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
