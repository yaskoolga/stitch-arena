"use client";

import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LikeButton } from "@/components/projects/like-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Heart, MessageCircle, Sparkles, Image as ImageIcon } from "lucide-react";

interface FeedItem {
  id: string;
  type: "project" | "log";
  createdAt: string;
  data: any;
}

interface FeedResponse {
  items: FeedItem[];
  hasMore: boolean;
}

export default function CommunityPage() {
  const t = useTranslations();
  const [filter, setFilter] = useState<"all" | "projects" | "logs">("all");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery<FeedResponse>({
    queryKey: ["community-feed", filter],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await fetch(
        `/api/feed?type=${filter}&limit=10&offset=${pageParam}`
      );
      if (!res.ok) throw new Error("Failed to fetch feed");
      return res.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.reduce((total, page) => total + page.items.length, 0);
    },
    initialPageParam: 0,
  });

  const allItems = data?.pages.flatMap(page => page.items) || [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">{t("community.title")}</h1>
        </div>
        <p className="text-muted-foreground">
          {t("community.subtitle")}
        </p>
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all" className="text-sm">
            {t("community.tabs.all")}
          </TabsTrigger>
          <TabsTrigger value="projects" className="text-sm">
            {t("community.tabs.projects")}
          </TabsTrigger>
          <TabsTrigger value="logs" className="text-sm">
            {t("community.tabs.updates")}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Feed */}
      <div className="space-y-3">
        {isLoading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="gap-3 py-4">
                <CardHeader className="px-4 pb-0">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1.5" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-0">
                  <Skeleton className="h-48 w-full rounded-lg mb-3" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : allItems.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">{t("community.empty")}</h3>
              <p className="text-muted-foreground">
                {t("community.beFirst")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {allItems.map((item) => (
              <FeedCard key={item.id} item={item} />
            ))}

            {hasNextPage && (
              <div className="flex justify-center py-6">
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  variant="ghost"
                  size="lg"
                  className="text-muted-foreground hover:text-primary"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                      {t("common.loading")}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      {t("common.loadMore")}
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  if (item.type === "project") {
    return <ProjectFeedCard project={item.data} createdAt={item.createdAt} />;
  } else {
    return <LogFeedCard log={item.data} createdAt={item.createdAt} />;
  }
}

function ProjectFeedCard({ project, createdAt }: { project: any; createdAt: string }) {
  const t = useTranslations();
  const pct = Math.min(
    100,
    Math.round((project.completedStitches / project.totalStitches) * 100)
  );

  return (
    <Card className="gap-3 py-4 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
      <CardHeader className="px-4 pb-0">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${project.user.id}`}>
            <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
              <AvatarImage src={project.user.avatar || undefined} />
              <AvatarFallback className="text-sm">
                {project.user.name?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/profile/${project.user.id}`}>
              <p className="font-medium text-sm hover:text-primary transition-colors cursor-pointer">
                {project.user.name || "Anonymous"}
              </p>
            </Link>
            <p className="text-xs text-muted-foreground">
              {t("community.activity.createdProject")} • {format(new Date(createdAt), "dd.MM.yyyy")}
            </p>
          </div>
          <Badge variant="secondary" className="gap-1 text-xs">
            <Sparkles className="h-3 w-3" />
            {t("projects.createNew").split(" ")[0]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-0">
        <Link href={`/projects/${project.id}`} className="block group">
          <div className="flex gap-3">
            {/* Photo left */}
            {project.schemaImage && (
              <div className="relative h-48 w-48 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                <Image
                  src={project.schemaImage}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            {/* Content right */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-1">
                {project.title}
              </h3>

              {project.description && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                  {project.description}
                </p>
              )}

              {project.themes && project.themes.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {project.themes.slice(0, 3).map((theme: string) => (
                    <Badge key={theme} variant="outline" className="text-xs">
                      {theme}
                    </Badge>
                  ))}
                  {project.themes.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{project.themes.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {project.completedStitches.toLocaleString()} /{" "}
                    {project.totalStitches.toLocaleString()} {t("logs.fields.stitches")}
                  </span>
                  <span className="font-medium">{pct}%</span>
                </div>
                <Progress value={pct} className="h-1.5" />
              </div>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-1 pt-2 border-t mt-3">
          <LikeButton projectId={project.id} variant="ghost" size="sm" />
          <Link href={`/projects/${project.id}#comments`}>
            <Button variant="ghost" size="sm" className="gap-1.5 h-8">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{project.commentCount}</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function LogFeedCard({ log, createdAt }: { log: any; createdAt: string }) {
  const t = useTranslations();
  return (
    <Card className="gap-3 py-4 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
      <CardHeader className="px-4 pb-0">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${log.project.user.id}`}>
            <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
              <AvatarImage src={log.project.user.avatar || undefined} />
              <AvatarFallback className="text-sm">
                {log.project.user.name?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/profile/${log.project.user.id}`}>
              <p className="font-medium text-sm hover:text-primary transition-colors cursor-pointer">
                {log.project.user.name || "Anonymous"}
              </p>
            </Link>
            <p className="text-xs text-muted-foreground">
              {t("community.activity.updatedProgress")} • {format(new Date(createdAt), "dd.MM.yyyy")}
            </p>
          </div>
          <Badge variant="secondary" className="gap-1 text-xs">
            <ImageIcon className="h-3 w-3" />
            {t("community.tabs.updates")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-0">
        <Link href={`/projects/${log.project.id}`} className="block group">
          <div className="flex gap-3">
            {/* Photo left */}
            {log.photoUrl && (
              <div className="relative h-48 w-48 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                <Image
                  src={log.photoUrl}
                  alt="Progress photo"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            {/* Content right */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-1.5">
                on project:{" "}
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {log.project.title}
                </span>
              </p>

              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="outline" className="gap-1 text-xs bg-green-50 text-green-700 border-green-200">
                  +{log.dailyStitches.toLocaleString()}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {t("logs.fields.total")}: {log.totalStitches.toLocaleString()}
                </span>
              </div>

              {log.notes && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {log.notes}
                </p>
              )}
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-1 pt-2 border-t mt-3">
          <LikeButton projectId={log.project.id} variant="ghost" size="sm" />
        </div>
      </CardContent>
    </Card>
  );
}
