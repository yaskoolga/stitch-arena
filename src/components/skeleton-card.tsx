"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function SkeletonCard() {
  return (
    <Card className="overflow-hidden rounded-2xl">
      <div className="h-40 bg-muted animate-pulse" />
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div className="h-5 w-32 rounded bg-muted animate-pulse" />
          <div className="h-5 w-20 rounded bg-muted animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="h-4 w-24 rounded bg-muted animate-pulse" />
        <div className="h-3 w-full rounded bg-muted animate-pulse" />
      </CardContent>
    </Card>
  );
}

export function SkeletonProjectDetail() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-6">
        <div className="h-32 w-32 rounded-lg bg-muted animate-pulse" />
        <div className="space-y-3 flex-1">
          <div className="h-8 w-64 rounded bg-muted animate-pulse" />
          <div className="h-4 w-48 rounded bg-muted animate-pulse" />
          <div className="h-5 w-24 rounded bg-muted animate-pulse" />
        </div>
      </div>
      <div className="h-4 w-full rounded bg-muted animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="rounded-2xl">
            <CardHeader className="pb-2">
              <div className="h-4 w-20 rounded bg-muted animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-7 w-16 rounded bg-muted animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="rounded-2xl">
        <CardHeader><div className="h-5 w-32 rounded bg-muted animate-pulse" /></CardHeader>
        <CardContent><div className="h-[300px] rounded bg-muted animate-pulse" /></CardContent>
      </Card>
    </div>
  );
}
