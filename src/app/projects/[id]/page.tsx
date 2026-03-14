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
import { Input } from "@/components/ui/input";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ProgressChart } from "@/components/projects/progress-chart";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { SkeletonProjectDetail } from "@/components/skeleton-card";
import { ImageDialog } from "@/components/ui/image-dialog";
import { CommentsSection } from "@/components/comments/comments-section";
import { LikeButton } from "@/components/projects/like-button";
import { FollowProjectButton } from "@/components/projects/follow-project-button";
import { useCVDetection } from "@/hooks/useCVDetection";
import { LevelUpCelebration } from "@/components/level-up-celebration";
import type { Level } from "@/lib/levels";
import { Palette, Calendar, TrendingUp, Edit, Trash2, Plus, Upload, Hash } from "lucide-react";

interface Log {
  id: string;
  date: string;
  totalStitches?: number;
  dailyStitches?: number;
  stitches?: number; // Old format (for backwards compatibility)
  notes?: string | null;
  photoUrl?: string | null;
  imageUrl?: string | null; // Old format (for backwards compatibility)
  aiDetected?: number | null;
  aiConfidence?: number | null;
  userCorrected?: boolean;
}

interface Project {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  manufacturer?: string | null;
  articleNumber?: string | null;
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
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editDailyStitches, setEditDailyStitches] = useState<string>("");
  const [newLevel, setNewLevel] = useState<Level | null>(null);

  // CV Detection hook
  const { detectProgress, isLoading: isDetecting } = useCVDetection();

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

  const updateLog = useMutation({
    mutationFn: ({ logId, dailyStitches, totalStitches }: { logId: string; dailyStitches: number; totalStitches: number }) =>
      fetch(`/api/logs/${logId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dailyStitches, totalStitches, userCorrected: true }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      setEditingLogId(null);
      toast.success(t("toast.success.logUpdated"));
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
      if (!uploadRes.ok) {
        let errorMessage = "Failed to upload photo";
        try {
          // Read response as text first
          const text = await uploadRes.text();
          // Try to parse as JSON
          try {
            const errorData = JSON.parse(text);
            errorMessage = errorData.error || errorMessage;
          } catch {
            // Not JSON, use the text itself
            errorMessage = text || `Upload failed (${uploadRes.status})`;
          }
        } catch {
          errorMessage = `Upload failed (${uploadRes.status})`;
        }
        throw new Error(errorMessage);
      }
      const { url } = await uploadRes.json();

      // Trigger CV detection
      const previousPhotoUrl = sortedLogs[0]?.photoUrl || null;
      const previousPhotoFile = previousPhotoUrl
        ? await fetch(previousPhotoUrl).then(r => r.blob()).then(blob => new File([blob], "previous.jpg", { type: blob.type }))
        : null;

      const cvResult = await detectProgress(file, previousPhotoFile);

      let dailyStitches = 0;
      let aiDetected = null;
      let aiConfidence = null;
      let successMessage = t("toast.success.photoAdded");

      if (cvResult && cvResult.success) {
        if (cvResult.confidence >= 0.5) {
          // Auto-apply AI result if confidence is high enough
          dailyStitches = cvResult.daily_stitches;
          aiDetected = cvResult.daily_stitches;
          aiConfidence = cvResult.confidence;
          const confidencePercent = Math.round(cvResult.confidence * 100);
          successMessage = `✅ Detected ${dailyStitches.toLocaleString()} stitches (${confidencePercent}% confident)`;
        } else {
          // Low confidence - use 0 and warn user
          toast.warning(t("projects.ai.lowConfidence"));
        }
      } else {
        // Detection failed - use 0 and inform user
        toast.info(t("projects.ai.serviceError"));
      }

      // Create log with photo and AI data
      const previousTotal = sortedLogs[0]?.totalStitches || 0;
      const logData = {
        date: new Date().toISOString().split('T')[0],
        dailyStitches,
        totalStitches: previousTotal + dailyStitches,
        photoUrl: url,
        previousPhotoUrl,
        notes: null,
        aiDetected,
        aiConfidence,
        userCorrected: false,
      };

      const logRes = await fetch(`/api/projects/${id}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logData),
      });
      if (!logRes.ok) throw new Error("Failed to create log");

      const logResData = await logRes.json();

      // Check for level up
      if (logResData.levelUp) {
        setNewLevel(logResData.levelUp);
      }

      toast.success(successMessage);
      queryClient.invalidateQueries({ queryKey: ["project", id] });

      // Reset file input
      e.target.value = '';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t("toast.error.generic");
      toast.error(errorMessage);
      console.error('Quick photo upload error:', error);
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
  const sortedLogs = [...(project.logs || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Get today's date in YYYY-MM-DD format for comparison
  const todayStr = new Date().toISOString().split('T')[0];

  const handleEditLog = (log: Log) => {
    setEditingLogId(log.id);
    setEditDailyStitches((log.dailyStitches ?? 0).toString());
  };

  const handleSaveEdit = (logId: string) => {
    const newDailyStitches = Number(editDailyStitches);
    if (isNaN(newDailyStitches) || newDailyStitches < 0) {
      toast.error(t("toast.error.generic"));
      return;
    }

    // Find the log being edited
    const editedLog = sortedLogs.find(log => log.id === logId);
    if (!editedLog) return;

    // Find the previous log (by date)
    const editedLogIndex = sortedLogs.findIndex(log => log.id === logId);
    const previousLog = editedLogIndex < sortedLogs.length - 1 ? sortedLogs[editedLogIndex + 1] : null;
    const previousTotal = previousLog?.totalStitches ?? 0;

    // Calculate new totalStitches
    const newTotalStitches = previousTotal + newDailyStitches;

    updateLog.mutate({
      logId,
      dailyStitches: newDailyStitches,
      totalStitches: newTotalStitches
    });
  };

  const handleCancelEdit = () => {
    setEditingLogId(null);
    setEditDailyStitches("");
  };

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
      <div className="relative overflow-hidden rounded-2xl border bg-background p-6 shadow-sm">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 mb-5">
            {(project.coverImage || project.schemaImage || project.imageUrl) && (
              <ImageDialog
                src={project.coverImage || project.schemaImage || project.imageUrl || ''}
                alt={project.title}
                thumbnailClassName="w-full sm:w-48 sm:h-48 h-auto max-h-64 sm:flex-shrink-0 overflow-hidden rounded-2xl border-2 border-primary/20 shadow-lg"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                      {project.title}
                    </h1>
                    {session?.user?.id === project.userId && (
                      <div className="flex items-center gap-1">
                        <Link href={`/projects/${id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary"
                            title={t("projects.editProject")}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Project Metadata - Vertical Layout */}
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{t("projects.startedOn")} {format(new Date((project.logs && project.logs[0]?.date) || Date.now()), "dd.MM.yyyy")}</span>
                    </div>
                    {project.manufacturer && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Palette className="h-4 w-4 text-primary" />
                        <span className="font-medium">{project.manufacturer}</span>
                      </div>
                    )}
                    {project.articleNumber && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Hash className="h-4 w-4 text-primary" />
                        <span>{project.articleNumber}</span>
                      </div>
                    )}
                    {project.themes && JSON.parse(project.themes).length > 0 && (
                      <div className="flex items-start gap-2">
                        <div className="flex flex-wrap gap-1">
                          {JSON.parse(project.themes).slice(0, 5).map((theme: string) => (
                            <Badge key={theme} variant="outline" className="text-xs rounded-full">
                              {t(`themes.${theme}` as any)}
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
            {project.isPublic && session?.user?.id !== project.userId && (
              <>
                <LikeButton projectId={id} variant="outline" className="rounded-full" />
                <FollowProjectButton projectId={id} projectOwnerId={project.userId} variant="outline" showCount className="rounded-full" />
              </>
            )}
            {session?.user?.id === project.userId && (
              <Link href={`/projects/${id}/logs/new`}>
                <Button className="gap-2 rounded-full">
                  <Plus className="h-4 w-4" />
                  {t("logs.addLog")}
                </Button>
              </Link>
            )}
            {session?.user?.id === project.userId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteProjectOpen(true)}
                className="ml-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                title={t("projects.deleteProject")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{completedStitches.toLocaleString()} / {totalStitches.toLocaleString()} {t("logs.fields.stitches")}</span>
              <span className="font-bold text-primary">{pct}%</span>
            </div>
            <Progress value={pct} className="h-2 rounded-full" />
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
        totalLogs={project.logs?.length || 0}
        firstLogDate={sortedLogs.length > 0 ? sortedLogs[sortedLogs.length - 1].date : undefined}
      />

      {/* Progress Photos Gallery */}
      <Card className="gap-3 py-4 rounded-2xl">
        <CardHeader className="px-4 pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{t("logs.fields.photo")}</CardTitle>
            <div className="flex gap-2">
              {session?.user?.id === project.userId && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('quick-photo-upload')?.click()}
                    disabled={uploadingPhoto || isDetecting}
                    className="gap-2 rounded-full"
                  >
                    <Upload className="h-4 w-4" />
                    {uploadingPhoto || isDetecting
                      ? uploadingPhoto
                        ? t("common.uploading")
                        : t("projects.ai.detecting")
                      : t("logs.addPhoto")}
                  </Button>
                  <input
                    id="quick-photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleQuickPhotoUpload}
                    disabled={uploadingPhoto || isDetecting}
                    className="hidden"
                  />
                </>
              )}
              {sortedLogs.filter(log => log.photoUrl || log.imageUrl).length > 5 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllPhotos(!showAllPhotos)}
                  className="rounded-full"
                >
                  {showAllPhotos ? `↑ ${t("common.back")}` : t("common.loadMore")}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-0">
          {sortedLogs.some(log => log.photoUrl || log.imageUrl) ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedLogs
                  .filter(log => log.photoUrl || log.imageUrl)
                  .slice(0, showAllPhotos ? undefined : 5)
                  .map((log) => {
                    const photoSrc = log.photoUrl || log.imageUrl;
                    return (
                      <div key={log.id} className="group relative flex flex-col">
                        <ImageDialog
                          src={photoSrc!}
                          alt={`${t("projects.progressPhotoAlt")} ${format(new Date(log.date), "dd.MM.yyyy")}`}
                          thumbnailClassName="w-full h-auto min-h-[300px] overflow-hidden rounded-2xl border-2 border-muted hover:border-primary/50 transition-all"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-2xl">
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
          ) : session?.user?.id === project.userId ? (
            <div className="text-center py-6">
              <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t("logs.noPhotos")}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Comments Section - only for public projects */}
      {project.isPublic && (
        <CommentsSection projectId={id} projectOwnerId={project.userId} />
      )}

      {/* Log History Table */}
      <Card className="gap-3 py-4 rounded-2xl">
        <CardHeader className="px-4 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{t("logs.title")}</CardTitle>
              {sortedLogs.length > 0 && (
                <Badge variant="secondary" className="text-xs rounded-full">
                  {sortedLogs.length} {t("projects.progress.logs")}
                </Badge>
              )}
            </div>
            {session?.user?.id === project.userId && sortedLogs.length > 0 && (
              <Link href={`/projects/${id}/logs/new`}>
                <Button size="sm" variant="outline" className="gap-2 rounded-full">
                  <Plus className="h-4 w-4" />
                  {t("logs.addLog")}
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-0">
          {sortedLogs.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-3">{t("logs.noLogs")}</p>
              {session?.user?.id === project.userId && (
                <Link href={`/projects/${id}/logs/new`}>
                  <Button size="sm" className="rounded-full">{t("logs.addLog")}</Button>
                </Link>
              )}
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
                  {sortedLogs.map((log) => {
                    const stitchCount = log.totalStitches ?? log.stitches ?? 0;
                    const dailyCount = log.dailyStitches ?? 0;
                    const isToday = log.date.split('T')[0] === todayStr;
                    const isEditing = editingLogId === log.id;
                    const isInitial = dailyCount === 0 && stitchCount > 0;

                    return (
                      <tr key={log.id} className={`group border-b hover:bg-muted/50 transition-colors ${isInitial ? 'bg-primary/5' : ''}`}>
                        <td className="py-2 px-3 font-medium">
                          <div className="flex items-center gap-2">
                            {format(new Date(log.date), "dd.MM.yyyy")}
                            {isInitial && (
                              <Badge variant="secondary" className="text-xs rounded-full">
                                {t("logs.initial")}
                              </Badge>
                            )}
                          </div>
                          {log.notes && (
                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">{log.notes}</p>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {isEditing ? (
                            <Input
                              type="number"
                              min={0}
                              value={editDailyStitches}
                              onChange={(e) => setEditDailyStitches(e.target.value)}
                              className="h-8 w-24 text-right"
                              autoFocus
                            />
                          ) : isInitial ? (
                            <span className="text-muted-foreground italic text-xs">
                              {t("logs.initialStitches")}
                            </span>
                          ) : dailyCount > 0 ? (
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
                          {session?.user?.id === project.userId && (
                            <>
                              {isEditing ? (
                                <div className="flex gap-1 justify-end">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-full text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                                    onClick={() => handleSaveEdit(log.id)}
                                    title={t("common.save")}
                                  >
                                    ✓
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
                                    onClick={handleCancelEdit}
                                    title={t("common.cancel")}
                                  >
                                    ✕
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex gap-1 justify-end">
                                  {isToday && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary hover:bg-primary/10"
                                      onClick={() => handleEditLog(log)}
                                      title={t("common.edit")}
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => setDeleteLogId(log.id)}
                                    title={t("logs.deleteLog")}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              )}
                            </>
                          )}
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
      <Card className="gap-3 py-4 rounded-2xl">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="text-lg">{t("projects.progress.title")}</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-0">
          <ProgressChart logs={project.logs || []} />
        </CardContent>
      </Card>

      {/* Level Up Celebration */}
      {newLevel && (
        <LevelUpCelebration
          newLevel={newLevel}
          onClose={() => setNewLevel(null)}
        />
      )}
    </div>
  );
}
