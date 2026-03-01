"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";

interface ExportButtonProps {
  type: "users" | "projects" | "comments" | "reports" | "logs";
  label?: string;
}

export function ExportButton({ type, label }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/export?type=${type}`);

      if (!res.ok) {
        throw new Error("Failed to export data");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={loading}
      className="rounded-full"
    >
      <Download className="h-4 w-4 mr-2" />
      {loading ? "Exporting..." : label || "Export CSV"}
    </Button>
  );
}
