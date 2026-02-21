"use client";

import { useMemo } from "react";
import { format, eachDayOfInterval, startOfMonth, endOfMonth, addMonths, subMonths, getDay } from "date-fns";
import { cn } from "@/lib/utils";

interface ActivityHeatmapProps {
  data: Array<{ date: string; count: number }>;
  months?: number;
}

export function ActivityHeatmap({ data, months = 12 }: ActivityHeatmapProps) {
  const { grid, maxCount } = useMemo(() => {
    // Create a map for quick lookup
    const dataMap = new Map(data.map(d => [d.date, d.count]));

    // Calculate date range
    const endDate = new Date();
    const startDate = subMonths(endDate, months);

    // Get all days in range
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    // Find max count for color scaling
    const max = Math.max(...data.map(d => d.count), 1);

    // Group by month and week
    const monthsData: Array<{
      month: string;
      weeks: Array<Array<{ date: Date; count: number }>>;
    }> = [];

    let currentMonth = startOfMonth(startDate);
    while (currentMonth <= endDate) {
      const monthEnd = endOfMonth(currentMonth);
      const monthDays = allDays.filter(
        d => d >= currentMonth && d <= monthEnd
      );

      // Group into weeks (starting Sunday = 0)
      const weeks: Array<Array<{ date: Date; count: number }>> = [[]];
      monthDays.forEach(date => {
        const dayOfWeek = getDay(date);
        const dateStr = format(date, "yyyy-MM-dd");
        const count = dataMap.get(dateStr) || 0;

        // Start new week on Sunday
        if (dayOfWeek === 0 && weeks[weeks.length - 1].length > 0) {
          weeks.push([]);
        }

        weeks[weeks.length - 1].push({ date, count });
      });

      monthsData.push({
        month: format(currentMonth, "MMM"),
        weeks,
      });

      currentMonth = addMonths(currentMonth, 1);
    }

    return { grid: monthsData, maxCount: max };
  }, [data, months]);

  const getColor = (count: number) => {
    if (count === 0) return "bg-muted";
    const intensity = Math.min(count / maxCount, 1);
    if (intensity < 0.25) return "bg-green-200 dark:bg-green-900";
    if (intensity < 0.5) return "bg-green-400 dark:bg-green-700";
    if (intensity < 0.75) return "bg-green-600 dark:bg-green-500";
    return "bg-green-800 dark:bg-green-300";
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex flex-col gap-1 min-w-max">
          {/* Month labels */}
          <div className="flex gap-1 mb-1">
            {grid.map((monthData, i) => (
              <div
                key={i}
                className="flex-shrink-0"
                style={{ width: `${monthData.weeks.length * 14}px` }}
              >
                <span className="text-xs text-muted-foreground">
                  {monthData.month}
                </span>
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex gap-1">
            {grid.map((monthData, monthIdx) => (
              <div key={monthIdx} className="flex gap-1">
                {monthData.weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-1">
                    {Array.from({ length: 7 }).map((_, dayIdx) => {
                      const day = week.find(d => getDay(d.date) === dayIdx);
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
                ))}
              </div>
            ))}
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
  );
}
