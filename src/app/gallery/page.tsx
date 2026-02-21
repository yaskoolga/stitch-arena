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
import { LikeButton } from "@/components/projects/like-button";
import { PROJECT_THEMES } from "@/lib/constants";
import { X } from "lucide-react";

interface PublicProject {
  id: string;
  title: string;
  description?: string | null;
  finalPhoto?: string | null;
  coverImage?: string | null;
  schemaImage?: string | null;
  totalStitches: number;
  completedStitches: number;
  canvasType?: string | null;
  status: string;
  themes?: string[];
  user: { name?: string | null; avatar?: string | null };
}

export default function GalleryPage() {
  const t = useTranslations();
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"newest" | "progress">("newest");

  const { data: projects, isLoading } = useQuery<PublicProject[]>({
    queryKey: ["public-projects", selectedThemes],
    queryFn: () => {
      const params = selectedThemes.length > 0
        ? `?themes=${selectedThemes.join(",")}`
        : "";
      return fetch(`/api/projects/public${params}`).then((r) => r.json());
    },
  });

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
      <h1 className="mb-2 text-3xl font-bold">{t("gallery.title")}</h1>
      <p className="mb-6 text-muted-foreground">{t("gallery.subtitle")}</p>

      {/* Filters */}
      <div className="mb-6 space-y-4">
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
                {theme}
                {selectedThemes.includes(theme) && (
                  <X className="ml-1 h-3 w-3" />
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">{t("common.sort")}:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "newest" | "progress")}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="newest">{t("dashboard.welcome").includes("back") ? "Newest first" : t("common.sort")}</option>
            <option value="progress">{t("projects.progress.title")}</option>
          </select>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {p.title}
                      </CardTitle>
                      <Badge variant="default" className="bg-green-600">
                        {t("projects.status.completed")}
                      </Badge>
                    </div>
                    <Link href={`/profile/${p.user.id}`}>
                      <p className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                        by {p.user.name || "Anonymous"}
                      </p>
                    </Link>

                    {/* Theme badges */}
                    {p.themes && p.themes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {p.themes.slice(0, 3).map((theme) => (
                          <Badge key={theme} variant="outline" className="text-xs">
                            {theme}
                          </Badge>
                        ))}
                        {p.themes.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{p.themes.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    {p.description && <p className="mb-2 text-sm text-muted-foreground line-clamp-2">{p.description}</p>}
                    {p.canvasType && <p className="mb-2 text-xs text-muted-foreground">{p.canvasType}</p>}
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-sm">
                        <span>{p.completedStitches.toLocaleString()} / {p.totalStitches.toLocaleString()}</span>
                        <span className="font-medium">{pct}%</span>
                      </div>
                      <Progress value={pct} />
                    </div>
                  </CardContent>
                </Link>
                <CardContent className="pt-0">
                  <LikeButton projectId={p.id} variant="ghost" size="sm" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
