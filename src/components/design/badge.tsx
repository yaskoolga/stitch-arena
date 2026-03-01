import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Soft & Rounded style - pastel backgrounds with rounded-full
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary",
        secondary:
          "bg-secondary/10 text-secondary-foreground",
        success:
          "bg-success/10 text-success",
        warning:
          "bg-warning/10 text-warning",
        destructive:
          "bg-destructive/10 text-destructive",
        info:
          "bg-info/10 text-info",
        outline: "border border-border text-foreground",
        ghost: "hover:bg-accent/10 hover:text-accent-foreground",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  dot?: boolean;
}

function Badge({
  className,
  variant,
  size,
  icon,
  dot,
  children,
  ...props
}: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      )}
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
