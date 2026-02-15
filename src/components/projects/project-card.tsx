"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { SpeedBadge } from "@/components/achievements/speed-badge";
import { calculateForecast } from "@/lib/stats";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

interface ProjectCardProps {
  id: string;
  title: string;
  totalStitches: number;
  completedStitches?: number;
  status: string;
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
  canvasType,
  coverImage,
  schemaImage,
  imageUrl,
  themes = [],
  avgSpeed = 0,
  onDelete
}: ProjectCardProps) {
  const t = useTranslations();
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
    <Card className="group overflow-hidden transition-shadow hover:shadow-md relative">
      <Link href={`/projects/${id}`}>
        {imageSrc && (
          <div className="relative aspect-video w-full">
            <Image src={imageSrc} alt={title} fill className="object-cover" />
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{title}</CardTitle>
            <div className="flex items-center gap-2">
              {avgSpeed > 0 && (
                <SpeedBadge avgStitchesPerDay={avgSpeed} size="sm" />
              )}
              <Badge variant={status === "completed" ? "default" : "secondary"}>
                {status === "in_progress" ? t("projects.status.inProgress") : status === "completed" ? t("projects.status.completed") : t("projects.status.paused")}
              </Badge>
            </div>
          </div>

          {/* Theme tags */}
          {themes && themes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {themes.slice(0, 3).map((theme) => (
                <Badge key={theme} variant="outline" className="text-xs">
                  {theme}
                </Badge>
              ))}
              {themes.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{themes.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {canvasType && <p className="mb-2 text-sm text-muted-foreground">{canvasType}</p>}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{safeCompletedStitches.toLocaleString()} / {safeTotalStitches.toLocaleString()}</span>
              <span>{pct}%</span>
            </div>
            <Progress value={pct} />
          </div>

          {/* Forecast completion date */}
          {forecastDate && (
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
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
          className="absolute top-2 right-2 h-7 w-7 p-0 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
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
  );
}
