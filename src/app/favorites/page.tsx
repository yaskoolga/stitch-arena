"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LikeButton } from "@/components/projects/like-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";

interface FavoriteProject {
  id: string;
  title: string;
  description: string | null;
  schemaImage: string | null;
  totalStitches: number;
  completedStitches: number;
  canvasType: string | null;
  status: string;
  themes: string[];
  likeCount: number;
  user: {
    name: string | null;
    avatar: string | null;
  };
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();

  const { data: favorites, isLoading } = useQuery<FavoriteProject[]>({
    queryKey: ["favorites"],
    queryFn: async () => {
      const res = await fetch("/api/favorites");
      if (!res.ok) throw new Error("Failed to fetch favorites");
      return res.json();
    },
    enabled: !!session,
  });

  if (status === "loading") return <p>Loading...</p>;
  if (!session) redirect("/login");

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Heart className="h-8 w-8 text-red-500 fill-red-500" />
        <h1 className="text-2xl font-bold">My Favorites</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Projects you've liked from the community
      </p>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden rounded-2xl">
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
        <Card className="rounded-2xl">
          <CardContent className="py-12 text-center">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-base font-medium mb-2">No favorites yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Explore the gallery and like projects you love
            </p>
            <Link href="/gallery">
              <button className="text-sm text-primary hover:underline">
                Browse Gallery →
              </button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favorites.map((project) => {
            const pct = Math.min(
              100,
              Math.round((project.completedStitches / project.totalStitches) * 100)
            );

            return (
              <Card
                key={project.id}
                className="overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] rounded-2xl"
              >
                <Link href={`/projects/${project.id}`}>
                  {project.schemaImage && (
                    <div className="relative aspect-video w-full">
                      <Image
                        src={project.schemaImage}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-1.5 px-3 pt-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{project.title}</CardTitle>
                      <div className="flex items-center gap-1.5">
                        <LikeButton projectId={project.id} variant="ghost" size="sm" />
                        <Badge
                          variant={
                            project.status === "completed" ? "default" : "secondary"
                          }
                          className="text-[10px] px-2 py-0.5 rounded-full"
                        >
                          {project.status === "in_progress"
                            ? "In Progress"
                            : project.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      by {project.user.name || "Anonymous"}
                    </p>

                    {/* Theme badges */}
                    {project.themes && project.themes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {project.themes.slice(0, 3).map((theme) => (
                          <Badge key={theme} variant="outline" className="text-[10px] rounded-full">
                            {theme}
                          </Badge>
                        ))}
                        {project.themes.length > 3 && (
                          <Badge variant="outline" className="text-[10px] rounded-full">
                            +{project.themes.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    {project.description && (
                      <p className="mb-1.5 text-xs text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    {project.canvasType && (
                      <p className="mb-1.5 text-[10px] text-muted-foreground">
                        {project.canvasType}
                      </p>
                    )}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-xs">
                        <span>
                          {project.completedStitches.toLocaleString()} /{" "}
                          {project.totalStitches.toLocaleString()}
                        </span>
                        <span className="font-medium">{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-1.5 rounded-full" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
