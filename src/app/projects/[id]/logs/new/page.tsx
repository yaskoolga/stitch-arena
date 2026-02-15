/**
 * Add Daily Log Page
 * Page for creating a new daily log entry
 */

"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyLogForm } from "@/components/projects/daily-log-form";
import { ArrowLeft, Loader2 } from "lucide-react";

interface DailyLog {
  id: string;
  date: string;
  photoUrl: string | null;
  totalStitches: number;
  dailyStitches: number;
}

interface Project {
  id: string;
  title: string;
  description?: string | null;
  totalStitches: number;
  completedStitches: number;
  calibrationData?: string | null;
  canvasType?: string | null;
  status: string;
  logs: DailyLog[];
}

export default function AddDailyLogPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const t = useTranslations('logs');
  const tCommon = useTranslations('common');

  // Fetch project data
  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["project", id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch project");
      }
      return res.json();
    },
    enabled: !!session && !!id,
  });

  // Get the latest log (for previous photo comparison)
  const latestLog = project?.logs?.[0] || null;

  if (authStatus === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  if (!project) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">{t('projectNotFound')}</p>
          <div className="flex justify-center mt-4">
            <Link href="/dashboard">
              <Button variant="outline">{t('backToDashboard')}</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <Link href={`/projects/${id}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t('backToProject')}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{t('addDailyLog')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('trackProgress')} <span className="font-medium">{project.title}</span>
          </p>
        </div>
      </div>

      {/* Project Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('currentProgress')}</CardTitle>
          <CardDescription>{t('currentProgressDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{project.totalStitches.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{t('totalStitches')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {project.completedStitches.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">{t('completed')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {Math.round((project.completedStitches / project.totalStitches) * 100)}%
              </p>
              <p className="text-sm text-muted-foreground">{t('progressPercent')}</p>
            </div>
          </div>
          {latestLog && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {t('lastLogged')} <span className="font-medium">{latestLog.totalStitches.toLocaleString()}</span> {t('stitchesTotal')}
                {latestLog.dailyStitches > 0 && (
                  <span className="text-green-600"> (+{latestLog.dailyStitches.toLocaleString()} {t('newStitches')})</span>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Log Form */}
      <DailyLogForm
        projectId={id}
        previousLog={latestLog ? {
          photoUrl: latestLog.photoUrl,
          totalStitches: latestLog.totalStitches
        } : null}
        calibrationData={project.calibrationData}
      />

      {/* Tips */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <p className="font-medium">{t('tipsTitle')}</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
              <li>{t('tip1')}</li>
              <li>{t('tip2')}</li>
              <li>{t('tip3')}</li>
              <li>{t('tip4')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
