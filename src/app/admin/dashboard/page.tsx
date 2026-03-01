"use client";

import { useEffect, useState } from "react";
import { AdminStatsCard } from "@/components/admin/admin-stats-card";
import { Users, FileText, MessageSquare, Trophy, Flag, Ban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalComments: number;
  totalChallenges: number;
  pendingReports: number;
  bannedUsers: number;
  trends: {
    users: {
      value: number;
      isPositive: boolean;
    };
    projects: {
      value: number;
      isPositive: boolean;
    };
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load stats:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-destructive">Failed to load statistics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of platform statistics</p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AdminStatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          trend={stats.trends.users}
        />
        <AdminStatsCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={FileText}
          trend={stats.trends.projects}
        />
        <AdminStatsCard
          title="Total Comments"
          value={stats.totalComments}
          icon={MessageSquare}
        />
        <AdminStatsCard
          title="Active Challenges"
          value={stats.totalChallenges}
          icon={Trophy}
        />
        <AdminStatsCard
          title="Pending Reports"
          value={stats.pendingReports}
          icon={Flag}
          description={
            stats.pendingReports > 0
              ? "Requires attention"
              : "No pending reports"
          }
        />
        <AdminStatsCard
          title="Banned Users"
          value={stats.bannedUsers}
          icon={Ban}
        />
      </div>

      {/* Recent Activity */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              • Check{" "}
              <a
                href="/admin/reports"
                className="text-primary hover:underline font-medium"
              >
                pending reports
              </a>
            </p>
            <p className="text-muted-foreground">
              • Review{" "}
              <a
                href="/admin/users"
                className="text-primary hover:underline font-medium"
              >
                user accounts
              </a>
            </p>
            <p className="text-muted-foreground">
              • Moderate{" "}
              <a
                href="/admin/projects"
                className="text-primary hover:underline font-medium"
              >
                projects
              </a>{" "}
              and{" "}
              <a
                href="/admin/comments"
                className="text-primary hover:underline font-medium"
              >
                comments
              </a>
            </p>
            <p className="text-muted-foreground">
              • View{" "}
              <a
                href="/admin/logs"
                className="text-primary hover:underline font-medium"
              >
                audit logs
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
