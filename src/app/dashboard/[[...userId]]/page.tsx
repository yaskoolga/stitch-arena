"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useTranslations } from 'next-intl';
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectCard } from "@/components/projects/project-card";
import { SkeletonCard } from "@/components/skeleton-card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { CompactProfile } from "@/components/dashboard/compact-profile";
import { CompactStats } from "@/components/dashboard/compact-stats";
import { GamificationOverview } from "@/components/dashboard/gamification-overview";
import { ActivityHeatmapCard } from "@/components/dashboard/activity-heatmap-card";
import { ActiveChallengesWidget } from "@/components/dashboard/active-challenges-widget";
import { calculate6MonthAverage } from "@/lib/stats";
import { Plus, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DailyLog } from "@prisma/client";

interface ProjectItem {
  id: string;
  title: string;
  totalStitches: number;
  completedStitches: number;
  status: string;
  canvasType?: string;
  schemaImage?: string | null;
  imageUrl?: string | null; // Old format (for backwards compatibility)
  themes?: string;
  createdAt: string;
  logs?: Array<{
    dailyStitches: number;
    date: string;
  }>;
}

type FilterStatus = "all" | "in_progress" | "completed" | "paused";
type SortBy = "newest" | "oldest" | "progress" | "name";

interface DashboardPageProps {
  params: Promise<{ userId?: string[] }>;
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [resolvedParams, setResolvedParams] = useState<{ userId?: string[] } | null>(null);

  const t = useTranslations('projects');
  const tDash = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const tToast = useTranslations('toast');

  // Resolve params (Next.js 16 - params is a Promise)
  React.useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  // Extract userId from optional catch-all route
  const userId = resolvedParams?.userId?.[0];
  const isOwnDashboard = !userId || userId === session?.user?.id;
  const targetUserId = userId || session?.user?.id;

  // Redirect if viewing own profile through userId
  if (userId && session?.user?.id && userId === session.user.id) {
    redirect('/dashboard');
  }

  // Determine which projects endpoint to use
  const projectsEndpoint = isOwnDashboard
    ? '/api/projects'  // All projects (public + private)
    : `/api/users/${targetUserId}/projects`;  // Only public projects

  const { data: projects, isLoading } = useQuery<ProjectItem[]>({
    queryKey: ["projects", targetUserId, isOwnDashboard],
    queryFn: () => fetch(projectsEndpoint).then((r) => r.json()),
    enabled: !!session && !!resolvedParams,
  });

  const deleteProject = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/projects/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success(tToast('success.projectDeleted'));
      setDeleteProjectId(null);
    },
    onError: () => toast.error(tToast('error.generic')),
  });

  const filtered = useMemo(() => {
    if (!projects) return [];
    let list = [...projects];

    if (filter !== "all") {
      list = list.filter((p) => p.status === filter);
    }

    switch (sortBy) {
      case "oldest":
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "newest":
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "progress":
        list.sort((a, b) => (b.completedStitches / b.totalStitches) - (a.completedStitches / a.totalStitches));
        break;
      case "name":
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return list;
  }, [projects, filter, sortBy]);

  if (status === "loading" || !resolvedParams) return <p>{tCommon('loading')}</p>;
  if (!session) redirect("/login");

  return (
    <div>
      {/* Профиль + Достижения */}
      <div className="mb-3">
        <CompactProfile userId={targetUserId} isOwn={isOwnDashboard} />
      </div>

      {/* Gamification Overview (only for own dashboard) */}
      {isOwnDashboard && (
        <div className="mb-3">
          <GamificationOverview />
        </div>
      )}

      {/* Компактная статистика */}
      <div className="mb-3">
        <CompactStats userId={isOwnDashboard ? undefined : targetUserId} />
      </div>

      {/* Active Challenges Widget */}
      <div className="mb-4">
        <ActiveChallengesWidget userId={isOwnDashboard ? undefined : targetUserId} />
      </div>

      <ConfirmDialog
        open={deleteProjectId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteProjectId(null);
        }}
        title={t("deleteProject")}
        description={tDash("deleteConfirm")}
        onConfirm={() => {
          if (deleteProjectId) deleteProject.mutate(deleteProjectId);
        }}
        loading={deleteProject.isPending}
      />

      {/* Проекты */}
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {isOwnDashboard ? t("myProjects") : tDash("publicProjects")}
        </h1>
        {isOwnDashboard && (
          <Link href="/projects/new">
            <Button size="sm">
              <Plus className="mr-1 h-3.5 w-3.5" />
              {t("createNew")}
            </Button>
          </Link>
        )}
      </div>

      {/* Фильтры */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            {tDash("filters.all")}
          </Button>
          <Button
            variant={filter === "in_progress" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("in_progress")}
          >
            {tDash("filters.inProgress")}
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("completed")}
          >
            {tDash("filters.completed")}
          </Button>
          <Button
            variant={filter === "paused" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("paused")}
          >
            {tDash("filters.paused")}
          </Button>
        </div>
        <div className="ml-auto">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{tDash("sort.newest")}</SelectItem>
              <SelectItem value="oldest">{tDash("sort.oldest")}</SelectItem>
              <SelectItem value="progress">{tDash("sort.progress")}</SelectItem>
              <SelectItem value="name">{tDash("sort.name")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Сетка проектов */}
      {isLoading ? (
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="mb-4">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <BookOpen className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="mb-4 text-center text-sm text-muted-foreground">
              {filter === "all"
                ? isOwnDashboard
                  ? t("noProjects")
                  : tDash("noPublicProjects")
                : tDash("noProjectsFilter")}
            </p>
            {filter === "all" && isOwnDashboard && (
              <Link href="/projects/new">
                <Button>
                  <Plus className="mr-1 h-4 w-4" />
                  {t("startFirst")}
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => {
            const themes = p.themes ? JSON.parse(p.themes) : [];
            const avgSpeed = p.logs ? calculate6MonthAverage(p.logs as unknown as DailyLog[]) : 0;

            return (
              <ProjectCard
                key={p.id}
                {...p}
                themes={themes}
                avgSpeed={avgSpeed}
                onDelete={isOwnDashboard ? setDeleteProjectId : undefined}
              />
            );
          })}
        </div>
      )}

      {/* Activity Heatmap - only for own dashboard */}
      {isOwnDashboard && <ActivityHeatmapCard />}
    </div>
  );
}
