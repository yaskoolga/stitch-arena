"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LikeButton } from "@/components/projects/like-button";
import { FollowProjectButton } from "@/components/projects/follow-project-button";
import { PROJECT_THEMES } from "@/lib/constants";
import { X, Search } from "lucide-react";

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

export default function GalleryPage() {
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

  // Get unique manufacturers for filter
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
    <div>
      <h1 className="mb-2 text-2xl font-bold">{t("gallery.title")}</h1>
      <p className="mb-4 text-sm text-muted-foreground">{t("gallery.subtitle")}</p>

      {/* Filters */}
      <div className="mb-4 space-y-3">
        {/* Search and Manufacturer */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("gallery.filters.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Manufacturer filter */}
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

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "newest" | "progress")}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm w-full sm:w-40"
          >
            <option value="newest">{t("gallery.filters.newest")}</option>
            <option value="progress">{t("gallery.filters.byProgress")}</option>
          </select>
        </div>

        {/* Theme filters */}
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
          {sortedProjects.map((p) => {
            const pct = Math.min(100, Math.round((p.completedStitches / p.totalStitches) * 100));
            const imageSrc = p.finalPhoto || p.coverImage || p.schemaImage; // Priority: finalPhoto > coverImage > schemaImage

            return (
              <Card
                key={p.id}
                className="group overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]"
              >
                <Link href={`/projects/${p.id}`}>
                  {imageSrc && (
                    <div className="relative aspect-video w-full">
                      <Image
                        src={imageSrc}
                        alt={p.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
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

                    {/* Theme badges */}
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
                    {p.canvasType && <p className="mb-1.5 text-[10px] text-muted-foreground">{p.canvasType}</p>}
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
    </div>
  );
}
