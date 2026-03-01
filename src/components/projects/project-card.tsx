"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Calendar, ZoomIn, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LikeButton } from "@/components/projects/like-button";
import { FollowProjectButton } from "@/components/projects/follow-project-button";
import { SpeedBadge } from "@/components/achievements/speed-badge";
import { calculateForecast } from "@/lib/stats";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";

interface ProjectCardProps {
  id: string;
  title: string;
  totalStitches: number;
  completedStitches?: number;
  status: string;
  manufacturer?: string | null;
  canvasType?: string | null;
  coverImage?: string | null;    // Cover photo from package (main display)
  schemaImage?: string | null;   // Technical pattern reference
  imageUrl?: string | null;      // Old format (for backwards compatibility)
  themes?: string[];
  avgSpeed?: number; // Average stitches per day
  onDelete?: (id: string) => void;
}

export function ProjectCard({
  id,
  title,
  totalStitches,
  completedStitches = 0,
  status,
  manufacturer,
  canvasType,
  coverImage,
  schemaImage,
  imageUrl,
  themes = [],
  avgSpeed = 0,
  onDelete
}: ProjectCardProps) {
  const t = useTranslations();
  const { data: session } = useSession();
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const safeCompletedStitches = completedStitches ?? 0;
  const safeTotalStitches = totalStitches ?? 0;
  const pct = safeTotalStitches > 0 ? Math.min(100, Math.round((safeCompletedStitches / safeTotalStitches) * 100)) : 0;
  // Priority: coverImage (package photo) > schemaImage > old imageUrl
  const imageSrc = coverImage || schemaImage || imageUrl;

  // Calculate forecast completion date
  const forecastDate = avgSpeed > 0 && status === "in_progress"
    ? calculateForecast(safeCompletedStitches, safeTotalStitches, avgSpeed)
    : null;

  return (
    <>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative rounded-2xl">
        {imageSrc && (
          <div
            className="relative aspect-square w-full bg-muted cursor-pointer group/image"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowPhotoDialog(true);
            }}
          >
            <Image src={imageSrc} alt={title} fill className="object-contain" />
            {/* Zoom icon on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 transform group-hover/image:scale-110 transition-transform">
                <ZoomIn className="h-6 w-6 text-gray-800" />
              </div>
            </div>
          </div>
        )}
        <Link href={`/projects/${id}`}>
        <CardHeader className="pb-1.5 px-3 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{title}</CardTitle>
            <div className="flex items-center gap-1.5">
              {avgSpeed > 0 && (
                <SpeedBadge avgStitchesPerDay={avgSpeed} size="sm" />
              )}
              <Badge
                variant={status === "completed" ? "default" : "secondary"}
                className="text-[10px] px-2.5 py-0.5 rounded-full"
              >
                {status === "in_progress" ? t("projects.status.inProgress") : status === "completed" ? t("projects.status.completed") : t("projects.status.paused")}
              </Badge>
            </div>
          </div>

          {/* Theme tags */}
          {themes && themes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {themes.slice(0, 3).map((theme) => (
                <Badge key={theme} variant="outline" className="text-[10px] rounded-full">
                  {theme}
                </Badge>
              ))}
              {themes.length > 3 && (
                <Badge variant="outline" className="text-[10px] rounded-full">
                  +{themes.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="px-3 pb-3">
          {manufacturer && <p className="mb-1.5 text-xs text-muted-foreground">{manufacturer}</p>}
          {canvasType && <p className="mb-1.5 text-xs text-muted-foreground">{canvasType}</p>}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{safeCompletedStitches.toLocaleString()} / {safeTotalStitches.toLocaleString()}</span>
              <span className="font-medium text-primary">{pct}%</span>
            </div>
            <Progress value={pct} className="h-2 rounded-full" />
          </div>

          {/* Forecast completion date */}
          {forecastDate && (
            <div className="flex items-center gap-1.5 mt-2 px-2 py-1 bg-primary/5 rounded-full text-[10px] text-primary">
              <Calendar className="h-3 w-3" />
              <span>{t("projects.progress.estDaysLeft")}: {format(forecastDate, "MMM d, yyyy")}</span>
            </div>
          )}
        </CardContent>
      </Link>
      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-7 w-7 p-0 rounded-full text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 shadow-sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(id);
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
      </Card>

      {/* Photo Dialog */}
      {imageSrc && (
        <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
          <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden flex flex-col">
            <DialogTitle className="sr-only">{title}</DialogTitle>
            <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
              <Image
                src={imageSrc}
                alt={title}
                width={1200}
                height={1200}
                className="max-w-full max-h-[calc(90vh-80px)] w-auto h-auto object-contain"
                priority
              />
            </div>
            <div className="bg-background border-t px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base truncate">{title}</h3>
                  {manufacturer && <p className="text-xs text-muted-foreground">{manufacturer}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <LikeButton projectId={id} variant="outline" size="default" />
                  {session && (
                    <FollowProjectButton
                      projectId={id}
                      projectOwnerId={session.user.id}
                      variant="outline"
                      size="default"
                      showCount={false}
                    />
                  )}
                  <Link href={`/projects/${id}`}>
                    <Button variant="default" size="sm" className="rounded-full">
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      {t("gallery.openProject")}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
