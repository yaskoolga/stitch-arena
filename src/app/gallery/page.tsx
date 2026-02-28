"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LikeButton } from "@/components/projects/like-button";
import { FollowProjectButton } from "@/components/projects/follow-project-button";
import { PROJECT_THEMES } from "@/lib/constants";
import {
  X,
  Search,
  Heart,
  Bell,
  Sparkles,
  MessageCircle,
  Image as ImageIcon,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";

interface PublicProject {
  id: string;
  title: string;
  description?: string | null;
  manufacturer?: string | null;
  finalPhoto?: string | null;
  coverImage?: string | null;
  schemaImage?: string | null;
  totalStitches: number;
  completedStitches: number;
  canvasType?: string | null;
  status: string;
  themes?: string[];
  user: { id: string; name?: string | null; avatar?: string | null };
}

interface FavoriteProject {
  id: string;
  title: string;
  description: string | null;
  schemaImage: string | null;
  coverImage: string | null;
  finalPhoto: string | null;
  totalStitches: number;
  completedStitches: number;
  canvasType: string | null;
  status: string;
  themes: string[];
  likeCount: number;
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
}

interface FollowingProject {
  id: string;
  title: string;
  description: string | null;
  schemaImage: string | null;
  coverImage: string | null;
  finalPhoto: string | null;
  totalStitches: number;
  completedStitches: number;
  canvasType: string | null;
  status: string;
  themes: string[];
  likeCount: number;
  followerCount: number;
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
}

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

export default function GalleryPage() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"all" | "feed" | "favorites" | "following">("all");

  // Shared photo dialog state for all tabs
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; project: PublicProject; index: number; projects: PublicProject[] } | null>(null);

  const navigatePhoto = useCallback((direction: 'prev' | 'next') => {
    if (!selectedPhoto) return;

    let newIndex = selectedPhoto.index;
    const step = direction === 'prev' ? -1 : 1;

    // Find next project with image
    while (true) {
      newIndex += step;

      // Check boundaries
      if (newIndex < 0 || newIndex >= selectedPhoto.projects.length) {
        break;
      }

      const newProject = selectedPhoto.projects[newIndex];
      const newImageSrc = newProject.finalPhoto || newProject.coverImage || newProject.schemaImage;

      if (newImageSrc) {
        setSelectedPhoto({ url: newImageSrc, project: newProject, index: newIndex, projects: selectedPhoto.projects });
        break;
      }
    }
  }, [selectedPhoto]);

  // Add keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!photoDialogOpen) return;
      if (e.key === 'ArrowLeft') navigatePhoto('prev');
      if (e.key === 'ArrowRight') navigatePhoto('next');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photoDialogOpen, navigatePhoto]);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">{t("gallery.title")}</h1>
      <p className="mb-4 text-sm text-muted-foreground">{t("gallery.subtitle")}</p>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="all">{t("gallery.tabs.all")}</TabsTrigger>
          <TabsTrigger value="feed">{t("gallery.tabs.feed")}</TabsTrigger>
          <TabsTrigger value="favorites">{t("gallery.tabs.favorites")}</TabsTrigger>
          <TabsTrigger value="following">{t("gallery.tabs.following")}</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <AllProjectsTab setPhotoDialogOpen={setPhotoDialogOpen} setSelectedPhoto={setSelectedPhoto} />
        </TabsContent>

        <TabsContent value="feed">
          <FeedTab />
        </TabsContent>

        <TabsContent value="favorites">
          <FavoritesTab setPhotoDialogOpen={setPhotoDialogOpen} setSelectedPhoto={setSelectedPhoto} />
        </TabsContent>

        <TabsContent value="following">
          <FollowingTab setPhotoDialogOpen={setPhotoDialogOpen} setSelectedPhoto={setSelectedPhoto} />
        </TabsContent>
      </Tabs>

      {/* Shared Photo Dialog */}
      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden flex flex-col">
          {selectedPhoto && (
            <>
              {/* Hidden title for accessibility */}
              <DialogTitle className="sr-only">
                {selectedPhoto.project.title}
              </DialogTitle>

              {/* Image */}
              <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
                <Image
                  src={selectedPhoto.url}
                  alt={selectedPhoto.project.title}
                  width={1200}
                  height={1200}
                  className="max-w-full max-h-[calc(90vh-120px)] w-auto h-auto object-contain"
                  priority
                />

                {/* Navigation Buttons */}
                {selectedPhoto.index > 0 && (
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full shadow-lg hover:scale-110 transition-transform"
                    onClick={() => navigatePhoto('prev')}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                )}
                {selectedPhoto.index < selectedPhoto.projects.length - 1 && (
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full shadow-lg hover:scale-110 transition-transform"
                    onClick={() => navigatePhoto('next')}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                )}

                {/* Counter */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                  {selectedPhoto.index + 1} / {selectedPhoto.projects.length}
                </div>
              </div>

              {/* Action Bar */}
              <div className="bg-background border-t px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{selectedPhoto.project.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t("gallery.by")} {selectedPhoto.project.user.name || t("common.anonymous")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <LikeButton projectId={selectedPhoto.project.id} variant="outline" size="default" />
                    <FollowProjectButton
                      projectId={selectedPhoto.project.id}
                      projectOwnerId={selectedPhoto.project.user.id}
                      variant="outline"
                      size="default"
                      showCount={false}
                    />
                    <Link href={`/projects/${selectedPhoto.project.id}`}>
                      <Button variant="default" size="default">
                        {t("gallery.openProject")}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Tab 1: All Projects (public gallery with filters)
interface TabProps {
  setPhotoDialogOpen: (open: boolean) => void;
  setSelectedPhoto: (photo: { url: string; project: PublicProject; index: number; projects: PublicProject[] } | null) => void;
}

function AllProjectsTab({ setPhotoDialogOpen, setSelectedPhoto }: TabProps) {
  const t = useTranslations();
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"newest" | "progress">("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [manufacturerFilter, setManufacturerFilter] = useState<string>("");

  const { data: projects, isLoading } = useQuery<PublicProject[]>({
    queryKey: ["public-projects", selectedThemes, searchQuery, manufacturerFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedThemes.length > 0) params.set("themes", selectedThemes.join(","));
      if (searchQuery) params.set("search", searchQuery);
      if (manufacturerFilter) params.set("manufacturer", manufacturerFilter);

      const queryString = params.toString();
      return fetch(`/api/projects/public${queryString ? `?${queryString}` : ""}`).then((r) => r.json());
    },
  });

  const manufacturers = useMemo(() => {
    if (!projects) return [];
    const uniqueManufacturers = Array.from(new Set(
      projects.map(p => p.manufacturer).filter(Boolean)
    )).sort();
    return uniqueManufacturers as string[];
  }, [projects]);

  const sortedProjects = useMemo(() => {
    if (!projects) return [];
    const list = [...projects];
    if (sortBy === "progress") {
      list.sort((a, b) => {
        const pctA = (a.completedStitches / a.totalStitches) * 100;
        const pctB = (b.completedStitches / b.totalStitches) * 100;
        return pctB - pctA;
      });
    }
    return list;
  }, [projects, sortBy]);

  const toggleTheme = (theme: string) => {
    setSelectedThemes((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
    );
  };

  return (
    <>
      {/* Filters */}
      <div className="mb-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("gallery.filters.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <select
            value={manufacturerFilter}
            onChange={(e) => setManufacturerFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm w-full sm:w-48"
          >
            <option value="">{t("gallery.filters.allManufacturers")}</option>
            {manufacturers.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "newest" | "progress")}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm w-full sm:w-40"
          >
            <option value="newest">{t("gallery.filters.newest")}</option>
            <option value="progress">{t("gallery.filters.byProgress")}</option>
          </select>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium">{t("gallery.filters.themes")}</h3>
          <div className="flex flex-wrap gap-2">
            {PROJECT_THEMES.map((theme) => (
              <Button
                key={theme}
                variant={selectedThemes.includes(theme) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleTheme(theme)}
              >
                {t(`themes.${theme}` as any)}
                {selectedThemes.includes(theme) && (
                  <X className="ml-1 h-3 w-3" />
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <p>{t("common.loading")}</p>
      ) : !sortedProjects?.length ? (
        <p className="text-muted-foreground">
          {selectedThemes.length > 0
            ? t("common.noResults")
            : t("gallery.beFirst")}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedProjects.map((p, index) => {
            const pct = Math.min(100, Math.round((p.completedStitches / p.totalStitches) * 100));
            const imageSrc = p.finalPhoto || p.coverImage || p.schemaImage;

            return (
              <Card
                key={p.id}
                className="overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]"
              >
                <div className="group relative cursor-pointer">
                  {imageSrc ? (
                    <>
                      <div
                        className="relative aspect-square w-full bg-muted"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedPhoto({ url: imageSrc, project: p, index, projects: sortedProjects });
                          setPhotoDialogOpen(true);
                        }}
                      >
                        <Image
                          src={imageSrc}
                          alt={p.title}
                          fill
                          className="object-contain"
                        />
                        {/* Magnifying glass icon on hover */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 transform group-hover:scale-110 transition-transform">
                            <Search className="h-8 w-8 text-gray-800" />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="aspect-square w-full bg-muted flex items-center justify-center">
                      <p className="text-muted-foreground text-sm">{t("common.noImage")}</p>
                    </div>
                  )}
                </div>

                <Link href={`/projects/${p.id}`}>
                  <CardHeader className="pb-1.5 px-3 pt-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base group-hover:text-primary transition-colors">
                        {p.title}
                      </CardTitle>
                      <Badge
                        variant={p.status === "completed" ? "default" : "secondary"}
                        className={`text-[10px] px-2 py-0.5 ${p.status === "completed" ? "bg-green-600" : ""}`}
                      >
                        {p.status === "in_progress"
                          ? t("projects.status.inProgress")
                          : p.status === "completed"
                            ? t("projects.status.completed")
                            : t("projects.status.paused")}
                      </Badge>
                    </div>
                    <p
                      className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `/dashboard/${p.user.id}`;
                      }}
                    >
                      {t("gallery.by")} {p.user.name || t("common.anonymous")}
                    </p>

                    {p.themes && p.themes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {p.themes.slice(0, 3).map((theme) => (
                          <Badge key={theme} variant="outline" className="text-[10px]">
                            {t(`themes.${theme}` as any)}
                          </Badge>
                        ))}
                        {p.themes.length > 3 && (
                          <Badge variant="outline" className="text-[10px]">
                            +{p.themes.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    {p.description && <p className="mb-1.5 text-xs text-muted-foreground line-clamp-2">{p.description}</p>}
                    <div className="flex gap-2 mb-1.5 text-[10px] text-muted-foreground">
                      {p.manufacturer && <span className="font-medium">{p.manufacturer}</span>}
                      {p.manufacturer && p.canvasType && <span>•</span>}
                      {p.canvasType && <span>{p.canvasType}</span>}
                    </div>
                    <div className="space-y-0.5 mb-2">
                      <div className="flex justify-between text-xs">
                        <span>{p.completedStitches.toLocaleString()} / {p.totalStitches.toLocaleString()}</span>
                        <span className="font-medium">{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  </CardContent>
                </Link>
                <CardContent className="pt-0 px-3 pb-3 flex gap-2">
                  <LikeButton projectId={p.id} variant="ghost" size="sm" />
                  <FollowProjectButton projectId={p.id} projectOwnerId={p.user.id} variant="ghost" size="sm" showCount={false} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

// Tab 2: Feed (community activity stream)
function FeedTab() {
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
      {/* Filters */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-4">
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
      <div className="space-y-2.5">
        {isLoading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="gap-2 py-3">
                <CardHeader className="px-3 pb-0">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-3 w-28 mb-1" />
                      <Skeleton className="h-2.5 w-40" />
                    </div>
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                </CardHeader>
                <CardContent className="px-3 pb-0">
                  <Skeleton className="h-40 w-full rounded-lg mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-1.5" />
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-2/3" />
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

// Tab 3: Favorites
function FavoritesTab({ setPhotoDialogOpen, setSelectedPhoto }: TabProps) {
  const t = useTranslations();
  const { data: session } = useSession();

  const { data: favorites, isLoading } = useQuery<FavoriteProject[]>({
    queryKey: ["favorites"],
    queryFn: async () => {
      const res = await fetch("/api/favorites");
      if (!res.ok) throw new Error("Failed to fetch favorites");
      return res.json();
    },
    enabled: !!session,
  });

  if (!session) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-base font-medium mb-2">{t("auth.loginRequired")}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t("auth.loginToViewFavorites")}
          </p>
          <Link href="/login">
            <Button>{t("nav.login")}</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardHeader className="px-3 pt-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2 mt-1.5" />
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-1.5 w-full mt-1.5" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !favorites?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-base font-medium mb-2">{t("favorites.empty")}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("favorites.explore")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favorites.map((project, index) => {
            const pct = Math.min(100, Math.round((project.completedStitches / project.totalStitches) * 100));
            const imageSrc = project.finalPhoto || project.coverImage || project.schemaImage;

            return (
              <Card key={project.id} className="group overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]">
                <div className="group relative cursor-pointer">
                  {imageSrc ? (
                    <>
                      <div
                        className="relative aspect-square w-full bg-muted"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedPhoto({ url: imageSrc, project, index, projects: favorites });
                          setPhotoDialogOpen(true);
                        }}
                      >
                        <Image
                          src={imageSrc}
                          alt={project.title}
                          fill
                          className="object-contain"
                        />
                        {/* Magnifying glass icon on hover */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 transform group-hover:scale-110 transition-transform">
                            <Search className="h-8 w-8 text-gray-800" />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="aspect-square w-full bg-muted flex items-center justify-center">
                      <p className="text-muted-foreground text-sm">{t("common.noImage")}</p>
                    </div>
                  )}
                </div>
                <Link href={`/projects/${project.id}`}>
                  <CardHeader className="pb-1.5 px-3 pt-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base group-hover:text-primary transition-colors">{project.title}</CardTitle>
                      <Badge variant={project.status === "completed" ? "default" : "secondary"} className={`text-[10px] px-2 py-0.5 ${project.status === "completed" ? "bg-green-600" : ""}`}>
                        {project.status === "in_progress" ? t("projects.status.inProgress") : project.status === "completed" ? t("projects.status.completed") : t("projects.status.paused")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{t("gallery.by")} {project.user.name || t("common.anonymous")}</p>
                    {project.themes && project.themes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {project.themes.slice(0, 3).map((theme) => (
                          <Badge key={theme} variant="outline" className="text-[10px]">{t(`themes.${theme}` as any)}</Badge>
                        ))}
                        {project.themes.length > 3 && <Badge variant="outline" className="text-[10px]">+{project.themes.length - 3}</Badge>}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    {project.description && <p className="mb-1.5 text-xs text-muted-foreground line-clamp-2">{project.description}</p>}
                    {project.canvasType && <p className="mb-1.5 text-[10px] text-muted-foreground">{project.canvasType}</p>}
                    <div className="space-y-0.5 mb-2">
                      <div className="flex justify-between text-xs">
                        <span>{project.completedStitches.toLocaleString()} / {project.totalStitches.toLocaleString()}</span>
                        <span className="font-medium">{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  </CardContent>
                </Link>
                <CardContent className="pt-0 px-3 pb-3 flex gap-2">
                  <LikeButton projectId={project.id} variant="ghost" size="sm" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

// Tab 4: Following
function FollowingTab({ setPhotoDialogOpen, setSelectedPhoto }: TabProps) {
  const t = useTranslations();
  const { data: session } = useSession();

  const { data: following, isLoading } = useQuery<FollowingProject[]>({
    queryKey: ["following"],
    queryFn: async () => {
      const res = await fetch("/api/projects/following");
      if (!res.ok) throw new Error("Failed to fetch following projects");
      return res.json();
    },
    enabled: !!session,
  });

  if (!session) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-base font-medium mb-2">{t("auth.loginRequired")}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t("auth.loginToViewFollowing")}
          </p>
          <Link href="/login">
            <Button>{t("nav.login")}</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardHeader className="px-3 pt-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2 mt-1.5" />
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-1.5 w-full mt-1.5" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !following?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-base font-medium mb-2">{t("following.empty")}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("following.explore")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {following.map((project, index) => {
            const pct = Math.min(100, Math.round((project.completedStitches / project.totalStitches) * 100));
            const imageSrc = project.finalPhoto || project.coverImage || project.schemaImage;

            return (
              <Card key={project.id} className="group overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]">
                <div className="group relative cursor-pointer">
                  {imageSrc ? (
                    <>
                      <div
                        className="relative aspect-square w-full bg-muted"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedPhoto({ url: imageSrc, project, index, projects: following });
                          setPhotoDialogOpen(true);
                        }}
                      >
                        <Image
                          src={imageSrc}
                          alt={project.title}
                          fill
                          className="object-contain"
                        />
                        {/* Magnifying glass icon on hover */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 transform group-hover:scale-110 transition-transform">
                            <Search className="h-8 w-8 text-gray-800" />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="aspect-square w-full bg-muted flex items-center justify-center">
                      <p className="text-muted-foreground text-sm">{t("common.noImage")}</p>
                    </div>
                  )}
                </div>
                <Link href={`/projects/${project.id}`}>
                  <CardHeader className="pb-1.5 px-3 pt-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base group-hover:text-primary transition-colors">{project.title}</CardTitle>
                      <Badge variant={project.status === "completed" ? "default" : "secondary"} className={`text-[10px] px-2 py-0.5 ${project.status === "completed" ? "bg-green-600" : ""}`}>
                        {project.status === "in_progress" ? t("projects.status.inProgress") : project.status === "completed" ? t("projects.status.completed") : t("projects.status.paused")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{t("gallery.by")} {project.user.name || t("common.anonymous")}</p>
                    {project.themes && project.themes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {project.themes.slice(0, 3).map((theme) => (
                          <Badge key={theme} variant="outline" className="text-[10px]">{t(`themes.${theme}` as any)}</Badge>
                        ))}
                        {project.themes.length > 3 && <Badge variant="outline" className="text-[10px]">+{project.themes.length - 3}</Badge>}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    {project.description && <p className="mb-1.5 text-xs text-muted-foreground line-clamp-2">{project.description}</p>}
                    {project.canvasType && <p className="mb-1.5 text-[10px] text-muted-foreground">{project.canvasType}</p>}
                    <div className="space-y-0.5 mb-2">
                      <div className="flex justify-between text-xs">
                        <span>{project.completedStitches.toLocaleString()} / {project.totalStitches.toLocaleString()}</span>
                        <span className="font-medium">{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  </CardContent>
                </Link>
                <CardContent className="pt-0 px-3 pb-3 flex gap-2">
                  <LikeButton projectId={project.id} variant="ghost" size="sm" />
                  <FollowProjectButton projectId={project.id} projectOwnerId={project.user.id} variant="ghost" size="sm" showCount={false} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

// Feed card components
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
    <Card className="gap-2 py-3 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
      <CardHeader className="px-3 pb-0">
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/${project.user.id}`}>
            <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
              <AvatarImage src={project.user.avatar || undefined} />
              <AvatarFallback className="text-xs">
                {project.user.name?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/dashboard/${project.user.id}`}>
              <p className="font-medium text-xs hover:text-primary transition-colors cursor-pointer">
                {project.user.name || t("common.anonymous")}
              </p>
            </Link>
            <p className="text-[10px] text-muted-foreground">
              {t("community.activity.createdProject")} • {format(new Date(createdAt), "dd.MM.yyyy")}
            </p>
          </div>
          <Badge variant="secondary" className="gap-1 text-[10px] px-2 py-0.5">
            <Sparkles className="h-2.5 w-2.5" />
            {t("projects.createNew").split(" ")[0]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-0">
        <Link href={`/projects/${project.id}`} className="block group">
          <div className="flex gap-2">
            {(project.schemaImage || project.coverImage) && (
              <div className="relative h-40 w-40 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                <Image
                  src={project.schemaImage || project.coverImage}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold mb-0.5 group-hover:text-primary transition-colors line-clamp-1">
                {project.title}
              </h3>

              {project.description && (
                <p className="text-xs text-muted-foreground mb-1.5 line-clamp-1">
                  {project.description}
                </p>
              )}

              {project.themes && project.themes.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {project.themes.slice(0, 3).map((theme: string) => (
                    <Badge key={theme} variant="outline" className="text-[10px]">
                      {t(`themes.${theme}` as any)}
                    </Badge>
                  ))}
                  {project.themes.length > 3 && (
                    <Badge variant="outline" className="text-[10px]">
                      +{project.themes.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="space-y-0.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">
                    {project.completedStitches.toLocaleString()} /{" "}
                    {project.totalStitches.toLocaleString()} {t("logs.fields.stitches")}
                  </span>
                  <span className="font-medium">{pct}%</span>
                </div>
                <Progress value={pct} className="h-1" />
              </div>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-1 pt-1.5 border-t mt-2">
          <LikeButton projectId={project.id} variant="ghost" size="sm" />
          <Link href={`/projects/${project.id}#comments`}>
            <Button variant="ghost" size="sm" className="gap-1 h-7">
              <MessageCircle className="h-3 w-3" />
              <span className="text-xs">{project.commentCount}</span>
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
    <Card className="gap-2 py-3 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
      <CardHeader className="px-3 pb-0">
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/${log.project.user.id}`}>
            <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
              <AvatarImage src={log.project.user.avatar || undefined} />
              <AvatarFallback className="text-xs">
                {log.project.user.name?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/dashboard/${log.project.user.id}`}>
              <p className="font-medium text-xs hover:text-primary transition-colors cursor-pointer">
                {log.project.user.name || t("common.anonymous")}
              </p>
            </Link>
            <p className="text-[10px] text-muted-foreground">
              {t("community.activity.updatedProgress")} • {format(new Date(createdAt), "dd.MM.yyyy")}
            </p>
          </div>
          <Badge variant="secondary" className="gap-1 text-[10px] px-2 py-0.5">
            <ImageIcon className="h-2.5 w-2.5" />
            {t("community.tabs.updates")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-0">
        <Link href={`/projects/${log.project.id}`} className="block group">
          <div className="flex gap-2">
            {log.photoUrl && (
              <div className="relative h-40 w-40 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                <Image
                  src={log.photoUrl}
                  alt="Progress photo"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">
                {t("projects.onProject")}:{" "}
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {log.project.title}
                </span>
              </p>

              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                <Badge variant="outline" className="gap-1 text-[10px] bg-green-50 text-green-700 border-green-200">
                  +{log.dailyStitches.toLocaleString()}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {t("logs.fields.total")}: {log.totalStitches.toLocaleString()}
                </span>
              </div>

              {log.notes && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {log.notes}
                </p>
              )}
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-1 pt-1.5 border-t mt-2">
          <LikeButton projectId={log.project.id} variant="ghost" size="sm" />
        </div>
      </CardContent>
    </Card>
  );
}
