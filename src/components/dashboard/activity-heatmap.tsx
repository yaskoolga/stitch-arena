"use client";

import { useMemo } from "react";
import { format, eachDayOfInterval, startOfMonth, endOfMonth, addMonths, subMonths, getDay, startOfWeek, endOfWeek } from "date-fns";
import { cn } from "@/lib/utils";

interface ActivityHeatmapProps {
  data: Array<{ date: string; count: number }>;
  months?: number;
}

export function ActivityHeatmap({ data, months = 12 }: ActivityHeatmapProps) {
  const { weeks, monthLabels, monthBoundaries, maxCount } = useMemo(() => {
    // Create a map for quick lookup
    const dataMap = new Map(data.map(d => [d.date, d.count]));

    // Calculate date range - align to week boundaries (Monday to Sunday)
    const today = new Date();
    const monthsAgo = subMonths(today, months);

    // Start from Monday of the week containing the date 12 months ago
    const startDate = startOfWeek(monthsAgo, { weekStartsOn: 1 }); // 1 = Monday
    // End on Sunday of the current week
    const endDate = endOfWeek(today, { weekStartsOn: 1 });

    // Get all days in range
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    // Find max count for color scaling
    const max = Math.max(...data.map(d => d.count), 1);

    // Group all days into weeks (Monday-Sunday)
    const allWeeks: Array<Array<{ date: Date; count: number }>> = [[]];

    allDays.forEach(date => {
      const dayOfWeek = getDay(date); // 0=Sun, 1=Mon, ..., 6=Sat
      const dateStr = format(date, "yyyy-MM-dd");
      const count = dataMap.get(dateStr) || 0;

      // Start new week on Monday (dayOfWeek === 1)
      if (dayOfWeek === 1 && allWeeks[allWeeks.length - 1].length > 0) {
        allWeeks.push([]);
      }

      allWeeks[allWeeks.length - 1].push({ date, count });
    });

    // Calculate month labels and boundaries
    const labels: Array<{ weekIndex: number; month: string }> = [];
    const monthsShown = new Set<string>();
    const monthBoundaries = new Set<number>(); // Week indices where a new month starts

    allWeeks.forEach((week, weekIndex) => {
      if (week.length === 0) return;

      // Get the first day of the week (should be Monday since we aligned to week boundaries)
      const firstDay = week[0];
      if (!firstDay) return;

      const monthKey = format(firstDay.date, "yyyy-MM");

      // Show month label on the first week of each month
      if (!monthsShown.has(monthKey)) {
        labels.push({
          weekIndex,
          month: format(firstDay.date, "MMM"),
        });
        monthsShown.add(monthKey);
        if (weekIndex > 0) {
          monthBoundaries.add(weekIndex);
        }
      }
    });

    return { weeks: allWeeks, monthLabels: labels, monthBoundaries, maxCount: max };
  }, [data, months]);

  const getColor = (count: number) => {
    if (count === 0) return "bg-muted";
    const intensity = Math.min(count / maxCount, 1);
    if (intensity < 0.25) return "bg-green-200 dark:bg-green-900";
    if (intensity < 0.5) return "bg-green-400 dark:bg-green-700";
    if (intensity < 0.75) return "bg-green-600 dark:bg-green-500";
    return "bg-green-800 dark:bg-green-300";
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="w-full">
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex gap-2 min-w-max">
          {/* Day labels (vertical) */}
          <div className="flex flex-col justify-start gap-1 pt-5">
            {weekDays.map((day, i) => (
              <div key={i} className="h-3 flex items-center">
                <span className="text-xs text-muted-foreground w-8 text-right pr-1">
                  {i % 2 === 0 ? day : ''}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            {/* Month labels */}
            <div className="relative h-4 mb-1">
              {monthLabels.map((label, idx) => {
                // Calculate position with month boundaries
                // Base: weekIndex * 16 (12px width + 4px gap)
                // Add for each boundary: 2px border + 4px ml-1 + 8px pl-2 = 14px
                const boundariesBefore = Array.from(monthBoundaries).filter(b => b <= label.weekIndex).length;
                const leftPosition = label.weekIndex * 16 + boundariesBefore * 14;
                return (
                  <span
                    key={idx}
                    className="absolute text-xs text-muted-foreground"
                    style={{ left: `${leftPosition}px` }}
                  >
                    {label.month}
                  </span>
                );
              })}
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-1">
              {weeks.map((week, weekIdx) => {
                // Determine month for alternating background
                const firstDay = week[0];
                const monthNum = firstDay ? firstDay.date.getMonth() : 0;
                const isEvenMonth = monthNum % 2 === 0;

                return (
                  <div
                    key={weekIdx}
                    className={cn(
                      "flex flex-col gap-1",
                      monthBoundaries.has(weekIdx) && "border-l-2 border-border pl-2 ml-1"
                    )}
                  >
                    {Array.from({ length: 7 }).map((_, dayIdx) => {
                      // Convert dayIdx to match Monday=0, Sunday=6
                      // getDay(): Sun=0, Mon=1, Tue=2, ... Sat=6
                      // We want: Mon=0, Tue=1, ... Sun=6
                      const actualDayOfWeek = (dayIdx + 1) % 7; // Mon=1, Tue=2, ... Sun=0
                      const day = week.find(d => getDay(d.date) === actualDayOfWeek);
                      if (!day) {
                        return <div key={dayIdx} className="w-3 h-3" />;
                      }
                      return (
                        <div
                          key={dayIdx}
                          className={cn(
                            "w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-primary",
                            getColor(day.count)
                          )}
                          title={`${format(day.date, "MMM d, yyyy")}: ${day.count} stitches`}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-muted" />
                <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
                <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
                <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500" />
                <div className="w-3 h-3 rounded-sm bg-green-800 dark:bg-green-300" />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
