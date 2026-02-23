"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ProgressChart } from "@/components/projects/progress-chart";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { SkeletonProjectDetail } from "@/components/skeleton-card";
import { ImageDialog } from "@/components/ui/image-dialog";
import { CommentsSection } from "@/components/comments/comments-section";
import { LikeButton } from "@/components/projects/like-button";
import { ExportButtons } from "@/components/projects/export-buttons";
import { Palette, Calendar, TrendingUp, Edit, Trash2, Plus, Upload } from "lucide-react";

interface Log {
  id: string;
  date: string;
  totalStitches?: number;
  dailyStitches?: number;
  stitches?: number; // Old format (for backwards compatibility)
  notes?: string | null;
  photoUrl?: string | null;
  imageUrl?: string | null; // Old format (for backwards compatibility)
}

interface Project {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  manufacturer?: string | null;
  coverImage?: string | null;    // Cover photo from package
  schemaImage?: string | null;   // Technical pattern reference
  imageUrl?: string | null;      // Old format (for backwards compatibility)
  totalStitches: number;
  initialStitches: number;       // Stitches already done before tracking
  completedStitches?: number | null;
  actualStitched?: number;       // Stitches done while tracking (excluding initial)
  canvasType?: string | null;
  status: string;
  isPublic?: boolean;
  themes?: string | null;        // JSON string of theme array
  logs: Log[];
}

export default function ProjectDetailPage() {
  const t = useTranslations();
  const { id } = useParams<{ id: string }>();
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false);
  const [deleteLogId, setDeleteLogId] = useState<string | null>(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["project", id],
    queryFn: () => fetch(`/api/projects/${id}`).then((r) => r.json()),
    enabled: !!session,
  });

  const deleteLog = useMutation({
    mutationFn: (logId: string) =>
      fetch(`/api/logs/${logId}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      toast.success(t("toast.success.logDeleted"));
    },
    onError: () => toast.error(t("toast.error.generic")),
  });

  const deleteProject = useMutation({
    mutationFn: () => fetch(`/api/projects/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => {
      toast.success(t("toast.success.projectDeleted"));
      router.push("/dashboard");
    },
    onError: () => toast.error(t("toast.error.generic")),
  });

  const handleQuickPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      // Upload photo
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("Failed to upload photo");
      const { url } = await uploadRes.json();

      // Create log with photo
      const previousTotal = sortedLogs[0]?.totalStitches || 0;
      const logData = {
        date: new Date().toISOString().split('T')[0],
        dailyStitches: 0,
        totalStitches: previousTotal,
        photoUrl: url,
        previousPhotoUrl: sortedLogs[0]?.photoUrl || null,
        notes: null,
        aiDetected: null,
        aiConfidence: null,
        userCorrected: false,
      };

      const logRes = await fetch(`/api/projects/${id}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logData),
      });
      if (!logRes.ok) throw new Error("Failed to create log");

      toast.success(t("toast.success.photoAdded"));
      queryClient.invalidateQueries({ queryKey: ["project", id] });

      // Reset file input
      e.target.value = '';
    } catch (error) {
      toast.error(t("toast.error.generic"));
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (authStatus === "loading" || isLoading) {
    return <SkeletonProjectDetail />;
  }
  if (!session) redirect("/login");
  if (!project) return <p>{t("common.noResults")}</p>;

  const completedStitches = project.completedStitches ?? 0;
  const totalStitches = project.totalStitches ?? 0;
  const pct = totalStitches > 0 ? Math.min(100, Math.round((completedStitches / totalStitches) * 100)) : 0;
  const sortedLogs = [...project.logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={deleteProjectOpen}
        onOpenChange={setDeleteProjectOpen}
        title={t("projects.deleteProject")}
        description={t("projects.deleteProject")}
        onConfirm={() => deleteProject.mutate()}
        loading={deleteProject.isPending}
      />
      <ConfirmDialog
        open={!!deleteLogId}
        onOpenChange={(open) => { if (!open) setDeleteLogId(null); }}
        title={t("logs.deleteLog")}
        description={t("logs.deleteLog")}
        onConfirm={() => { if (deleteLogId) deleteLog.mutate(deleteLogId); }}
        loading={deleteLog.isPending}
      />

      {/* Enhanced Project Header */}
      <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/5 via-background to-background p-6 shadow-sm">
        <div className="relative z-10">
          <div className="flex items-start gap-6 mb-5">
            {(project.coverImage || project.schemaImage || project.imageUrl) && (
              <ImageDialog
                src={project.coverImage || project.schemaImage || project.imageUrl || ''}
                alt={project.title}
                thumbnailClassName="h-48 w-48 flex-shrink-0 overflow-hidden rounded-lg border-2 border-primary/20 shadow-lg"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      {project.title}
                    </h1>
                    <div className="flex items-center gap-1">
                      <ExportButtons project={project} />
                      <Link href={`/projects/${id}/edit`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          title={t("projects.editProject")}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Project Metadata - Vertical Layout */}
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{t("projects.startedOn")} {format(new Date(project.logs[0]?.date || Date.now()), "dd.MM.yyyy")}</span>
                    </div>
                    {project.manufacturer && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Palette className="h-4 w-4 text-primary" />
                        <span className="font-medium">{project.manufacturer}</span>
                      </div>
                    )}
                    {project.themes && JSON.parse(project.themes).length > 0 && (
                      <div className="flex items-start gap-2">
                        <div className="flex flex-wrap gap-1">
                          {JSON.parse(project.themes).slice(0, 5).map((theme: string) => (
                            <Badge key={theme} variant="outline" className="text-xs">
                              {theme}
                            </Badge>
                          ))}
                          {JSON.parse(project.themes).length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{JSON.parse(project.themes).length - 5}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    {project.canvasType && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span>{project.canvasType}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Badge
                  variant={project.status === "completed" ? "default" : "secondary"}
                  className="text-xs px-2.5 py-0.5"
                >
                  {project.status === "in_progress" ? t("projects.status.inProgress") : project.status === "completed" ? t("projects.status.completed") : t("projects.status.paused")}
                </Badge>
              </div>

              {project.description && (
                <p className="text-sm text-muted-foreground leading-relaxed mt-2">{project.description}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap mb-5">
            {project.isPublic && (
              <LikeButton projectId={id} variant="outline" />
            )}
            <Link href={`/projects/${id}/logs/new`}>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t("logs.addLog")}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteProjectOpen(true)}
              className="ml-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title={t("projects.deleteProject")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{completedStitches.toLocaleString()} / {totalStitches.toLocaleString()} {t("logs.fields.stitches")}</span>
              <span className="font-bold text-primary">{pct}%</span>
            </div>
            <Progress value={pct} className="h-2" />
            {project.initialStitches > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {t("projects.progress.initialNote", {
                  initial: project.initialStitches.toLocaleString(),
                  actual: (project.actualStitched || 0).toLocaleString()
                })}
              </p>
            )}
          </div>
        </div>

        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
      </div>

      <StatsCards
        totalStitches={totalStitches}
        completedStitches={completedStitches}
        totalLogs={project.logs.length}
        firstLogDate={sortedLogs.length > 0 ? sortedLogs[sortedLogs.length - 1].date : undefined}
      />

      {/* Progress Photos Gallery */}
      <Card className="gap-3 py-4">
        <CardHeader className="px-4 pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{t("logs.fields.photo")}</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('quick-photo-upload')?.click()}
                disabled={uploadingPhoto}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {uploadingPhoto ? t("common.uploading") : t("logs.addPhoto")}
              </Button>
              {sortedLogs.filter(log => log.photoUrl || log.imageUrl).length > 5 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllPhotos(!showAllPhotos)}
                >
                  {showAllPhotos ? `↑ ${t("common.back")}` : t("common.loadMore")}
                </Button>
              )}
            </div>
            <input
              id="quick-photo-upload"
              type="file"
              accept="image/*"
              onChange={handleQuickPhotoUpload}
              disabled={uploadingPhoto}
              className="hidden"
            />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-0">
          {sortedLogs.some(log => log.photoUrl || log.imageUrl) ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {sortedLogs
                  .filter(log => log.photoUrl || log.imageUrl)
                  .slice(0, showAllPhotos ? undefined : 5)
                  .map((log) => {
                    const photoSrc = log.photoUrl || log.imageUrl;
                    return (
                      <div key={log.id} className="group relative">
                        <ImageDialog
                          src={photoSrc!}
                          alt={`${t("projects.progressPhotoAlt")} ${format(new Date(log.date), "dd.MM.yyyy")}`}
                          thumbnailClassName="aspect-square w-full overflow-hidden rounded-lg border-2 border-muted hover:border-primary/50 transition-all"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-lg">
                          <p className="text-xs text-white font-medium">
                            {format(new Date(log.date), "dd.MM")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
              {!showAllPhotos && sortedLogs.filter(log => log.photoUrl || log.imageUrl).length > 5 && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  {t("common.viewMore")}: {sortedLogs.filter(log => log.photoUrl || log.imageUrl).length - 5} {t("logs.fields.photo").toLowerCase()}
                </p>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t("logs.noPhotos")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments Section - only for public projects */}
      {project.isPublic && (
        <CommentsSection projectId={id} projectOwnerId={project.userId} />
      )}

      {/* Log History Table */}
      <Card className="gap-3 py-4">
        <CardHeader className="px-4 pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{t("logs.title")}</CardTitle>
            {sortedLogs.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {sortedLogs.length} {t("projects.progress.logs")}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-0">
          {sortedLogs.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-3">{t("logs.noLogs")}</p>
              <Link href={`/projects/${id}/logs/new`}>
                <Button size="sm">{t("logs.addLog")}</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">{t("logs.fields.date")}</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">{t("logs.fields.daily")}</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">{t("logs.fields.total")}</th>
                    <th className="w-8 py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLogs
                    .filter(log => (log.dailyStitches ?? 0) > 0)
                    .map((log) => {
                    const stitchCount = log.totalStitches ?? log.stitches ?? 0;
                    const dailyCount = log.dailyStitches ?? 0;

                    return (
                      <tr key={log.id} className="group border-b hover:bg-muted/50 transition-colors">
                        <td className="py-2 px-3 font-medium">
                          {format(new Date(log.date), "dd.MM.yyyy")}
                          {log.notes && (
                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">{log.notes}</p>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {dailyCount > 0 ? (
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              +{dailyCount.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-medium">
                          {stitchCount.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteLogId(log.id)}
                            title={t("logs.deleteLog")}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Total Row */}
                  <tr className="bg-muted/50 font-semibold">
                    <td className="py-2 px-3">{t("logs.fields.total")}</td>
                    <td className="py-2 px-3 text-right">
                      {sortedLogs.reduce((sum, log) => sum + (log.dailyStitches ?? 0), 0).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right text-primary">
                      {completedStitches.toLocaleString()}
                    </td>
                    <td className="py-2 px-3"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Chart */}
      <Card className="gap-3 py-4">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="text-lg">{t("projects.progress.title")}</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-0">
          <ProgressChart logs={project.logs} />
        </CardContent>
      </Card>
    </div>
  );
}
