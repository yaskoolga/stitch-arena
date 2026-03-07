"use client";

import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { OverallStatsData } from "./compact-stats";

// Dynamic import for charts (Recharts is heavy)
const ProgressChart = dynamic(
  () => import("./progress-chart").then(mod => ({ default: mod.ProgressChart })),
  { ssr: false }
);

const ProjectSpeedComparison = dynamic(
  () => import("./project-speed-comparison").then(mod => ({ default: mod.ProjectSpeedComparison })),
  { ssr: false }
);

interface StatsChartsProps {
  userId?: string;
}

export function StatsCharts({ userId }: StatsChartsProps) {
  const statsEndpoint = userId ? `/api/stats/user/${userId}` : '/api/stats/overall';

  const { data, isLoading } = useQuery<OverallStatsData>({
    queryKey: ["overall-stats", userId],
    queryFn: async () => {
      const res = await fetch(statsEndpoint);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading || !data) {
    return null;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 mt-6">
      {data.progressData && data.progressData.length > 0 && (
        <ProgressChart data={data.progressData} period="month" />
      )}

      {data.projectsWithSpeed && data.projectsWithSpeed.length > 0 && (
        <ProjectSpeedComparison projects={data.projectsWithSpeed} />
      )}
    </div>
  );
}
