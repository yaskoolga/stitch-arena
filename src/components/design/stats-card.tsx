import React from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  color?: "primary" | "success" | "warning" | "info" | "destructive";
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = "primary",
  className,
}: StatsCardProps) {
  // Pastel backgrounds with colored text (Soft & Rounded style)
  const colorClasses = {
    primary: {
      bg: "bg-primary/5 border-primary/10",
      text: "text-primary",
      icon: "bg-primary text-primary-foreground",
    },
    success: {
      bg: "bg-success/5 border-success/10",
      text: "text-success",
      icon: "bg-success text-success-foreground",
    },
    warning: {
      bg: "bg-warning/5 border-warning/10",
      text: "text-warning",
      icon: "bg-warning text-warning-foreground",
    },
    info: {
      bg: "bg-info/5 border-info/10",
      text: "text-info",
      icon: "bg-info text-info-foreground",
    },
    destructive: {
      bg: "bg-destructive/5 border-destructive/10",
      text: "text-destructive",
      icon: "bg-destructive text-destructive-foreground",
    },
  };

  const colors = colorClasses[color];
  const trendIsPositive = trend && trend.value > 0;

  return (
    <Card
      className={cn(
        "rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 h-full",
        colors.bg,
        className
      )}
    >
      <CardContent className="p-3 h-full">
        <div className="flex items-start justify-between gap-2 h-full">
          <div className="flex-1 min-w-0 flex flex-col">
            <p className={cn("text-xs font-medium", colors.text)}>
              {title}
            </p>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <h3 className={cn("text-xl font-bold", colors.text)}>
                {typeof value === "number" ? value.toLocaleString() : value}
              </h3>
              {trend && (
                <span
                  className={cn(
                    "flex items-center gap-0.5 text-xs font-medium",
                    trendIsPositive ? "text-success" : "text-destructive"
                  )}
                >
                  {trendIsPositive ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                  {Math.abs(trend.value)}%
                </span>
              )}
            </div>
            <p className={cn("text-xs truncate mt-auto", colors.text, "opacity-70")}>
              {description || "\u00A0"}
            </p>
          </div>
          {Icon && (
            <div className={cn("rounded-full p-2 flex-shrink-0", colors.icon)}>
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
