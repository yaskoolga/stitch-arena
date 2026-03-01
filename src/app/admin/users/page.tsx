"use client";

import { useEffect, useState } from "react";
import { AdminTable } from "@/components/admin/admin-table";
import { UserBanDialog } from "@/components/admin/user-ban-dialog";
import { BulkActionBar, userBulkActions } from "@/components/admin/bulk-action-bar";
import { ExportButton } from "@/components/admin/export-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ban, Shield, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: string;
  isBanned: boolean;
  bannedAt: Date | null;
  bannedReason: string | null;
  createdAt: Date;
  _count: {
    projects: number;
    comments: number;
    reportsMade: number;
    reportsReceived: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [banDialog, setBanDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({ open: false, user: null });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        search,
        filter,
      });

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();

      setUsers(data.users);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, filter]);

  const handleBan = async (userId: string, banned: boolean, reason?: string) => {
    const res = await fetch(`/api/admin/users/${userId}/ban`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ banned, reason }),
    });

    if (res.ok) {
      fetchUsers();
    } else {
      throw new Error("Failed to ban user");
    }
  };

  const handleBulkAction = async (action: string, metadata?: any) => {
    const res = await fetch("/api/admin/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        targetType: "user",
        targetIds: selectedIds,
        metadata,
      }),
    });

    if (res.ok) {
      setSelectedIds([]);
      fetchUsers();
    } else {
      const error = await res.json();
      throw new Error(error.error || "Bulk action failed");
    }
  };

  const columns = [
    {
      key: "user",
      label: "User",
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar || undefined} />
            <AvatarFallback>
              {user.name?.[0] || user.email[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.name || "No name"}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (user: User) => (
        <Badge variant={user.role === "admin" ? "default" : "secondary"} className="rounded-full">
          {user.role === "admin" && <Shield className="h-3 w-3 mr-1" />}
          {user.role}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (user: User) =>
        user.isBanned ? (
          <Badge variant="destructive" className="rounded-full">
            <Ban className="h-3 w-3 mr-1" />
            Banned
          </Badge>
        ) : (
          <Badge variant="outline" className="rounded-full">Active</Badge>
        ),
    },
    {
      key: "projects",
      label: "Projects",
      render: (user: User) => user._count.projects,
    },
    {
      key: "comments",
      label: "Comments",
      render: (user: User) => user._count.comments,
    },
    {
      key: "reports",
      label: "Reports",
      render: (user: User) => (
        <span className="text-xs">
          <span className="text-destructive">{user._count.reportsReceived}</span>
          {" / "}
          <span className="text-muted-foreground">{user._count.reportsMade}</span>
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (user: User) => (
        <Button
          variant={user.isBanned ? "outline" : "destructive"}
          size="sm"
          className="rounded-full"
          onClick={() => setBanDialog({ open: true, user })}
        >
          {user.isBanned ? "Unban" : "Ban"}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage user accounts</p>
        </div>
        <ExportButton type="users" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 rounded-full"
          />
        </div>
        <Select
          value={filter}
          onValueChange={(value) => {
            setFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px] rounded-full">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <AdminTable
        columns={columns}
        data={users}
        loading={loading}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
        }}
        emptyMessage="No users found"
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Bulk Actions */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        actions={userBulkActions}
        onAction={handleBulkAction}
      />

      {/* Ban Dialog */}
      <UserBanDialog
        open={banDialog.open}
        onOpenChange={(open) => setBanDialog({ open, user: null })}
        user={banDialog.user}
        onConfirm={handleBan}
      />
    </div>
  );
}
