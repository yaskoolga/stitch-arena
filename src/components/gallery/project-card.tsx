"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LikeButton } from "@/components/projects/like-button";
import { FollowProjectButton } from "@/components/projects/follow-project-button";
import { ReportButton } from "@/components/report-button";
import { ZoomIn, ExternalLink } from "lucide-react";
import { useSession } from "next-auth/react";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description?: string | null;
    manufacturer?: string | null;
    articleNumber?: string | null;
    finalPhoto?: string | null;
    coverImage?: string | null;
    schemaImage?: string | null;
    totalStitches: number;
    completedStitches: number;
    canvasType?: string | null;
    status: string;
    themes?: string[];
    user: { id: string; name?: string | null; avatar?: string | null };
  };
  // Вариант для мобильных: "overlay" (тап показывает оверлей) или "buttons" (кнопки всегда видны)
  mobileVariant?: "overlay" | "buttons";
  showFollowButton?: boolean;
}

export function ProjectCard({
  project,
  mobileVariant = "buttons",
  showFollowButton = true
}: ProjectCardProps) {
  const t = useTranslations();
  const { data: session } = useSession();
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [showMobileOverlay, setShowMobileOverlay] = useState(false);

  const pct = Math.min(100, Math.round((project.completedStitches / project.totalStitches) * 100));
  const imageSrc = project.finalPhoto || project.coverImage || project.schemaImage;

  const handleImageClick = (e: React.MouseEvent) => {
    if (mobileVariant === "overlay") {
      e.preventDefault();
      e.stopPropagation();
      setShowMobileOverlay(!showMobileOverlay);
    }
  };

  const handleViewPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPhotoDialog(true);
    setShowMobileOverlay(false);
  };

  const handleGoToProject = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/projects/${project.id}`;
  };

  return (
    <>
      <Card className="group overflow-hidden transition-shadow hover:shadow-md rounded-2xl">
        {/* Image Section */}
        <div className="relative">
          {imageSrc ? (
            <div
              className="relative aspect-square w-full bg-muted cursor-pointer"
              onClick={handleImageClick}
            >
              <Image
                src={imageSrc}
                alt={project.title}
                fill
                className="object-contain"
              />

              {/* Desktop Overlay (hover) */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/40 to-black/70 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-end justify-center pb-6 z-10">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="gap-1.5 h-9 px-4 text-sm shadow-lg"
                    onClick={handleViewPhoto}
                  >
                    <ZoomIn className="h-4 w-4" />
                    {t("gallery.viewPhoto")}
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    className="gap-1.5 h-9 px-4 text-sm shadow-lg"
                    onClick={handleGoToProject}
                  >
                    <ExternalLink className="h-4 w-4" />
                    {t("gallery.openProject")}
                  </Button>
                </div>
              </div>

              {/* Mobile Variant 1: Always Visible Buttons */}
              {mobileVariant === "buttons" && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent pt-8 pb-3 px-3 md:hidden">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1 gap-1.5 text-xs h-9 shadow-lg"
                      onClick={handleViewPhoto}
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                      {t("gallery.viewPhotoShort")}
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      className="flex-1 gap-1.5 text-xs h-9 shadow-lg"
                      onClick={handleGoToProject}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {t("gallery.openProjectShort")}
                    </Button>
                  </div>
                </div>
              )}

              {/* Mobile Variant 2: Tap to Show Overlay */}
              {mobileVariant === "overlay" && showMobileOverlay && (
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/40 to-black/70 flex items-end justify-center pb-6 z-10 md:hidden">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-1.5 h-9 px-4 text-sm shadow-lg"
                      onClick={handleViewPhoto}
                    >
                      <ZoomIn className="h-4 w-4" />
                      {t("gallery.viewPhoto")}
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      className="gap-1.5 h-9 px-4 text-sm shadow-lg"
                      onClick={handleGoToProject}
                    >
                      <ExternalLink className="h-4 w-4" />
                      {t("gallery.openProject")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-square w-full bg-muted flex items-center justify-center">
              <p className="text-muted-foreground text-sm">{t("common.noImage")}</p>
            </div>
          )}
        </div>

        {/* Project Info */}
        <Link href={`/projects/${project.id}`}>
          <CardHeader className="pb-1.5 px-3 pt-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base group-hover:text-primary transition-colors">
                {project.title}
              </CardTitle>
              <Badge
                variant={project.status === "completed" ? "default" : "secondary"}
                className={`text-[11px] px-2 py-0.5 ${project.status === "completed" ? "bg-green-600" : ""}`}
              >
                {project.status === "in_progress"
                  ? t("projects.status.inProgress")
                  : project.status === "completed"
                    ? t("projects.status.completed")
                    : t("projects.status.paused")}
              </Badge>
            </div>
            <p
              className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/dashboard/${project.user.id}`;
              }}
            >
              {t("gallery.by")} {project.user.name || t("common.anonymous")}
            </p>

            {project.themes && project.themes.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {project.themes.slice(0, 3).map((theme) => (
                  <Badge key={theme} variant="outline" className="text-[11px]">
                    {t(`themes.${theme}` as any)}
                  </Badge>
                ))}
                {project.themes.length > 3 && (
                  <Badge variant="outline" className="text-[11px]">
                    +{project.themes.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent className="px-3 pb-3">
            {project.description && (
              <p className="mb-1.5 text-xs text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            )}
            {project.manufacturer && (
              <p className="mb-1.5 text-[11px] text-muted-foreground">
                {project.manufacturer}
              </p>
            )}
            {project.articleNumber && (
              <p className="mb-1.5 text-[11px] text-muted-foreground">
                № {project.articleNumber}
              </p>
            )}
            {project.canvasType && (
              <p className="mb-1.5 text-[11px] text-muted-foreground">
                {project.canvasType}
              </p>
            )}
            <div className="space-y-0.5 mb-2">
              <div className="flex justify-between text-xs">
                <span>
                  {project.completedStitches.toLocaleString()} /{" "}
                  {project.totalStitches.toLocaleString()}
                </span>
                <span className="font-medium">{pct}%</span>
              </div>
              <Progress value={pct} className="h-1.5 rounded-full" aria-label={`Project progress: ${pct}%`} />
            </div>
          </CardContent>
        </Link>

        {/* Action Buttons */}
        <CardContent className="pt-0 px-3 pb-3 flex gap-2">
          <LikeButton projectId={project.id} variant="ghost" size="sm" />
          <FollowProjectButton
            projectId={project.id}
            projectOwnerId={project.user.id}
            variant="ghost"
            size="sm"
            showCount={false}
            className={showFollowButton ? "" : "hidden"}
          />
          {session && session.user.id !== project.user.id && (
            <ReportButton
              type="project"
              resourceId={project.id}
              reportedUserId={project.user.id}
              variant="ghost"
              size="sm"
            />
          )}
        </CardContent>
      </Card>

      {/* Photo Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent className="max-w-4xl w-full p-0">
          <DialogHeader className="px-6 pt-6 pb-3">
            <DialogTitle>{project.title}</DialogTitle>
          </DialogHeader>
          <div className="relative w-full max-h-[80vh] bg-muted">
            {imageSrc && (
              <Image
                src={imageSrc}
                alt={project.title}
                width={1200}
                height={1200}
                className="w-full h-auto object-contain"
                priority
              />
            )}
          </div>
          <div className="px-6 pb-6 pt-3 flex gap-2">
            <Button
              variant="default"
              className="flex-1"
              onClick={() => {
                setShowPhotoDialog(false);
                window.location.href = `/projects/${project.id}`;
              }}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {t("gallery.openProject")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
