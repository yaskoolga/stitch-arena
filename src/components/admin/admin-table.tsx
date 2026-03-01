"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  loading?: boolean;
  emptyMessage?: string;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

export function AdminTable<T extends { id: string }>({
  columns,
  data,
  pagination,
  loading = false,
  emptyMessage = "No data available",
  selectable = false,
  selectedIds = [],
  onSelectionChange,
}: AdminTableProps<T>) {
  const allSelected = data.length > 0 && data.every((item) => selectedIds.includes(item.id));
  const someSelected = selectedIds.length > 0 && !allSelected;

  const handleSelectAll = () => {
    if (!onSelectionChange) return;

    if (allSelected) {
      // Deselect all on current page
      const currentPageIds = data.map((item) => item.id);
      onSelectionChange(selectedIds.filter((id) => !currentPageIds.includes(id)));
    } else {
      // Select all on current page
      const currentPageIds = data.map((item) => item.id);
      const newSelected = [...new Set([...selectedIds, ...currentPageIds])];
      onSelectionChange(newSelected);
    }
  };

  const handleSelectRow = (id: string) => {
    if (!onSelectionChange) return;

    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    className={someSelected ? "data-[state=checked]:bg-muted-foreground" : ""}
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                {selectable && (
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(item.id)}
                      onCheckedChange={() => handleSelectRow(item.id)}
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.render
                      ? column.render(item)
                      : (item as any)[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
