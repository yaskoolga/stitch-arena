"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

interface Log {
  id: string;
  date: string;
  totalStitches?: number;
  dailyStitches?: number;
  stitches?: number; // Old format (for backwards compatibility)
  notes?: string | null;
}

export function ProgressChart({ logs }: { logs: Log[] }) {
  const t = useTranslations();
  const sorted = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let cumulative = 0;
  const data = sorted.map((log) => {
    // Handle both old and new format
    const dailyCount = log.dailyStitches ?? log.stitches ?? 0;

    // Use totalStitches if available (new format), otherwise calculate cumulative (old format)
    if (log.totalStitches !== undefined && log.totalStitches !== null) {
      cumulative = log.totalStitches;
    } else {
      cumulative += dailyCount;
    }

    return {
      date: format(new Date(log.date), "MMM d"),
      daily: dailyCount,
      total: cumulative,
    };
  });

  if (data.length === 0) {
    return <p className="text-muted-foreground text-sm">{t("logs.noLogs")}</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" fontSize={12} />
        <YAxis fontSize={12} />
        <Tooltip />
        <Line type="monotone" dataKey="total" stroke="hsl(var(--chart-1))" strokeWidth={2} name={t("logs.totalStitches")} />
        <Line type="monotone" dataKey="daily" stroke="hsl(var(--chart-2))" strokeWidth={2} name={t("logs.dailyStitches")} />
      </LineChart>
    </ResponsiveContainer>
  );
}
