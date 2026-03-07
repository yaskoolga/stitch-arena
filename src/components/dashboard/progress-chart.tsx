"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Calendar } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

interface DailyLogData {
  date: string;
  count: number;
}

interface ProgressChartProps {
  data: DailyLogData[];
  period?: "week" | "month" | "3months";
}

export function ProgressChart({ data, period = "month" }: ProgressChartProps) {
  const t = useTranslations("dashboard.stats");

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const today = new Date();
    const daysToShow = period === "week" ? 7 : period === "month" ? 30 : 90;
    const startDate = subDays(today, daysToShow - 1);

    // Create array of all dates in range
    const dateRange = eachDayOfInterval({ start: startDate, end: today });

    // Map data to date range
    const dataMap = new Map(
      data.map(item => [format(new Date(item.date), "yyyy-MM-dd"), item.count])
    );

    return dateRange.map(date => {
      const dateStr = format(date, "yyyy-MM-dd");
      const count = dataMap.get(dateStr) || 0;

      return {
        date: dateStr,
        displayDate: format(date, period === "week" ? "EEE" : "MMM d"),
        stitches: count,
      };
    });
  }, [data, period]);

  const totalStitches = useMemo(
    () => chartData.reduce((sum, item) => sum + item.stitches, 0),
    [chartData]
  );

  const avgStitches = useMemo(
    () => chartData.length > 0 ? Math.round(totalStitches / chartData.length) : 0,
    [totalStitches, chartData]
  );

  if (!data || data.length === 0) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progress Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No activity data yet. Start logging your daily stitches!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          {period === "week"
            ? "Last 7 Days"
            : period === "month"
            ? "Last 30 Days"
            : "Last 90 Days"}
        </CardTitle>
        <CardDescription>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">Total:</span>
              <span className="font-semibold text-sm">{totalStitches.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">Avg/day:</span>
              <span className="font-semibold text-sm">{avgStitches.toLocaleString()}</span>
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorStitches" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 11 }}
              tickLine={false}
              className="text-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              className="text-muted-foreground"
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-xl border bg-background p-3 shadow-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        {payload[0].payload.displayDate}
                      </p>
                      <p className="font-semibold">
                        {payload[0].value?.toLocaleString()} stitches
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="stitches"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#colorStitches)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
