import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  variant?: "default" | "compact";
  color?: "primary" | "success" | "warning" | "info" | "muted";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  variant = "default",
  color = "primary",
}: EmptyStateProps) {
  const isCompact = variant === "compact";

  // Soft & Rounded style - pastel icon backgrounds
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    info: "bg-info/10 text-info",
    muted: "bg-muted text-muted-foreground",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        isCompact ? "py-6" : "py-12",
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            "mb-3 rounded-full",
            colorClasses[color],
            isCompact ? "p-2" : "p-3"
          )}
        >
          <Icon className={cn(isCompact ? "h-5 w-5" : "h-6 w-6")} />
        </div>
      )}
      <h3
        className={cn(
          "font-semibold text-foreground",
          isCompact ? "text-base" : "text-lg"
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            "mt-1 text-muted-foreground",
            isCompact ? "text-xs" : "text-sm",
            isCompact ? "max-w-xs" : "max-w-md"
          )}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
