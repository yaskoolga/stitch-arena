"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SpeedBadge } from "@/components/achievements/speed-badge";
import { Zap, TrendingUp, TrendingDown } from "lucide-react";

interface ProjectSpeedData {
  id: string;
  title: string;
  avgSpeed: number;
  totalStitches: number;
  completedStitches: number;
  progress: number;
  status: string;
}

interface ProjectSpeedComparisonProps {
  projects: ProjectSpeedData[];
}

export function ProjectSpeedComparison({ projects }: ProjectSpeedComparisonProps) {
  const t = useTranslations("dashboard.stats");

  // Filter only active projects with speed data
  const activeProjects = useMemo(
    () => projects
      .filter(p => p.status === "in_progress" && p.avgSpeed > 0)
      .sort((a, b) => b.avgSpeed - a.avgSpeed)
      .slice(0, 5),
    [projects]
  );

  const maxSpeed = useMemo(
    () => activeProjects.length > 0 ? activeProjects[0].avgSpeed : 0,
    [activeProjects]
  );

  if (activeProjects.length === 0) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Project Speed Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No active projects with speed data yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Project Speed Comparison
        </CardTitle>
        <CardDescription>
          Average stitches per day across active projects
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeProjects.map((project, index) => {
          const speedPercentage = maxSpeed > 0 ? (project.avgSpeed / maxSpeed) * 100 : 0;
          const isFastest = index === 0;
          const isSlowest = index === activeProjects.length - 1 && activeProjects.length > 1;

          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block group"
            >
              <div className="space-y-2 p-3 rounded-xl hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                        {project.title}
                      </h4>
                      {isFastest && (
                        <TrendingUp className="h-3.5 w-3.5 text-success shrink-0" />
                      )}
                      {isSlowest && activeProjects.length > 2 && (
                        <TrendingDown className="h-3.5 w-3.5 text-warning shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {project.completedStitches.toLocaleString()} / {project.totalStitches.toLocaleString()}
                      {" · "}
                      {project.progress}%
                    </p>
                  </div>
                  <SpeedBadge avgStitchesPerDay={project.avgSpeed} size="sm" />
                </div>

                {/* Speed comparison bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {project.avgSpeed.toLocaleString()} stitches/day
                    </span>
                    {!isFastest && (
                      <span className="text-muted-foreground">
                        {Math.round((project.avgSpeed / maxSpeed) * 100)}% of fastest
                      </span>
                    )}
                  </div>
                  <Progress
                    value={speedPercentage}
                    className={`h-2 ${isFastest ? 'bg-success/20' : 'bg-muted'}`}
                  />
                </div>
              </div>
            </Link>
          );
        })}

        {activeProjects.length < projects.filter(p => p.status === "in_progress").length && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            Showing top {activeProjects.length} fastest projects
          </p>
        )}
      </CardContent>
    </Card>
  );
}
