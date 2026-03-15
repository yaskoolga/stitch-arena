import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Skeleton for project cards in gallery
export function SkeletonCard() {
  return (
    <Card className="overflow-hidden rounded-2xl">
      <Skeleton className="aspect-square w-full" />
      <CardContent className="pt-5 pb-6">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton for profile/dashboard header
export function SkeletonProfile() {
  return (
    <Card className="rounded-2xl">
      <CardContent className="px-3 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton for compact profile with achievements
export function SkeletonCompactProfile() {
  return (
    <Card className="rounded-2xl">
      <CardContent className="px-3 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Profile */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>

          <div className="hidden sm:block h-12 w-px bg-border" />

          {/* Level */}
          <div className="w-full sm:min-w-[140px] sm:w-auto space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-1 w-full rounded-full" />
          </div>

          <div className="hidden sm:block h-12 w-px bg-border" />

          {/* Achievements */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-1.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-8 rounded-full shrink-0" />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton for stats cards
export function SkeletonStats() {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-3 w-full" />
      </CardContent>
    </Card>
  );
}

// Skeleton for stats grid (4 cards)
export function SkeletonStatsGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonStats key={i} />
      ))}
    </div>
  );
}

// Skeleton for comments
export function SkeletonComment() {
  return (
    <div className="flex gap-3 py-3">
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

// Skeleton for comment list
export function SkeletonCommentList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComment key={i} />
      ))}
    </div>
  );
}

// Skeleton for project table row
export function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-4 py-4 border-b">
      <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  );
}

// Skeleton for table
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-0">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonTableRow key={i} />
        ))}
      </CardContent>
    </Card>
  );
}

// Skeleton for gallery grid
export function SkeletonGallery({ count = 9 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// Skeleton for activity calendar
export function SkeletonActivityCalendar() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex gap-1">
              {Array.from({ length: 53 }).map((_, j) => (
                <Skeleton key={j} className="h-3 w-3 rounded-sm" />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton for achievement badge
export function SkeletonAchievement() {
  return (
    <div className="flex flex-col items-center gap-2 p-4">
      <Skeleton className="h-16 w-16 rounded-full" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

// Skeleton for achievements grid
export function SkeletonAchievementsGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonAchievement key={i} />
      ))}
    </div>
  );
}

// Generic loading container with text
export function SkeletonContainer({
  children,
  className
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
