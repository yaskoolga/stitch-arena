"use client";

import { useEffect, useState } from "react";
import { AdminTable } from "@/components/admin/admin-table";
import { BulkActionBar, commentBulkActions } from "@/components/admin/bulk-action-bar";
import { ExportButton } from "@/components/admin/export-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface Comment {
  id: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  };
  project: {
    id: string;
    title: string;
    user: {
      id: string;
      name: string | null;
    };
  };
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    comment: Comment | null;
  }>({ open: false, comment: null });

  const fetchComments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        search,
      });

      const res = await fetch(`/api/admin/comments?${params}`);
      const data = await res.json();

      setComments(data.comments);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [page, search]);

  const handleDelete = async (commentId: string) => {
    const res = await fetch(`/api/admin/comments/${commentId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchComments();
    } else {
      throw new Error("Failed to delete comment");
    }
  };

  const handleBulkAction = async (action: string, metadata?: any) => {
    const res = await fetch("/api/admin/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        targetType: "comment",
        targetIds: selectedIds,
        metadata,
      }),
    });

    if (res.ok) {
      setSelectedIds([]);
      fetchComments();
    } else {
      const error = await res.json();
      throw new Error(error.error || "Bulk action failed");
    }
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
      key: "text",
      label: "Comment",
      render: (comment: Comment) => (
        <div className="max-w-md">
          <p className="text-sm line-clamp-2">{comment.text}</p>
        </div>
      ),
    },
    {
      key: "user",
      label: "Author",
      render: (comment: Comment) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={comment.user.avatar || undefined} />
            <AvatarFallback className="text-xs">
              {comment.user.name?.[0] || comment.user.email[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{comment.user.name || comment.user.email}</span>
        </div>
      ),
    },
    {
      key: "project",
      label: "Project",
      render: (comment: Comment) => (
        <div>
          <p className="font-medium text-sm">{comment.project.title}</p>
          <p className="text-xs text-muted-foreground">
            by {comment.project.user.name || "Anonymous"}
          </p>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (comment: Comment) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(comment.createdAt)}
        </span>
      ),
    },
    {
      key: "updatedAt",
      label: "Updated",
      render: (comment: Comment) => (
        <span className="text-xs text-muted-foreground">
          {comment.updatedAt !== comment.createdAt
            ? formatDate(comment.updatedAt)
            : "-"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (comment: Comment) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={() => window.open(`/projects/${comment.project.id}`, "_blank")}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-destructive hover:text-destructive"
            onClick={() => setDeleteDialog({ open: true, comment })}
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
          <h1 className="text-3xl font-bold">Comments</h1>
          <p className="text-muted-foreground">Moderate user comments</p>
        </div>
        <ExportButton type="comments" />
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search comments..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 rounded-full"
          />
        </div>
      </div>

      {/* Table */}
      <AdminTable
        columns={columns}
        data={comments}
        loading={loading}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
        }}
        emptyMessage="No comments found"
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Bulk Actions */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        actions={commentBulkActions}
        onAction={handleBulkAction}
      />

      {/* Delete Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, comment: null })}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this comment. This action cannot be undone.
              <div className="mt-3 p-3 bg-muted rounded-xl text-sm">
                "{deleteDialog.comment?.text}"
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive hover:bg-destructive/90"
              onClick={async () => {
                if (deleteDialog.comment) {
                  await handleDelete(deleteDialog.comment.id);
                  setDeleteDialog({ open: false, comment: null });
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
