"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { LikeButton } from "@/components/projects/like-button";
import { AchievementBadges } from "@/components/profile/achievement-badges";
import { FollowButton } from "@/components/profile/follow-button";
import {
  User,
  Calendar,
  Trophy,
  Target,
  Heart,
  MessageCircle,
  Scissors,
  CheckCircle2,
  Image as ImageIcon,
  Edit
} from "lucide-react";
import { format } from "date-fns";

interface UserProfile {
  id: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  createdAt: string;
  isOwnProfile: boolean;
  stats: {
    totalProjects: number;
    publicProjects: number;
    completedProjects: number;
    totalStitches: number;
    achievements: number;
    comments: number;
    likes: number;
    followers: number;
    following: number;
  };
  achievements: Array<{
    achievementId: string;
    unlockedAt: string;
    progress: number;
  }>;
  publicProjects: Array<any>;
  allProjects?: Array<any>; // Only present if viewing own profile
}

export default function ProfilePage() {
  const params = useParams();
  const userId = params?.userId as string;
  const { data: session } = useSession();
  const t = useTranslations();
  const [showAllProjects, setShowAllProjects] = useState(true);

  const isOwnProfile = session?.user?.id === userId;

  const { data: profile, isLoading, error } = useQuery<UserProfile>({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("User not found");
        throw new Error("Failed to fetch profile");
      }
      return res.json();
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">
              {error?.message === "User not found" ? "User not found" : "Error loading profile"}
            </h3>
            <p className="text-muted-foreground">
              {error?.message === "User not found"
                ? "This user does not exist."
                : "Please try again later."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar */}
            <Avatar className="h-24 w-24 md:h-32 md:w-32">
              <AvatarImage src={profile.avatar || undefined} />
              <AvatarFallback className="text-3xl md:text-4xl">
                {profile.name?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-1">
                    {profile.name || "Anonymous"}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Joined {format(new Date(profile.createdAt), "MMMM yyyy")}
                    </span>
                  </div>
                  {/* Followers/Following */}
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="font-semibold">{profile.stats.followers}</span>{" "}
                      <span className="text-muted-foreground">Followers</span>
                    </div>
                    <div>
                      <span className="font-semibold">{profile.stats.following}</span>{" "}
                      <span className="text-muted-foreground">Following</span>
                    </div>
                  </div>
                </div>

                {/* Edit or Follow button */}
                {isOwnProfile ? (
                  <Link href="/settings">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  </Link>
                ) : (
                  <FollowButton userId={userId} size="sm" />
                )}
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-muted-foreground">{profile.bio}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Target className="h-5 w-5" />}
          label="Total Projects"
          value={profile.stats.totalProjects}
          className="bg-blue-50 dark:bg-blue-950/20"
        />
        <StatCard
          icon={<Scissors className="h-5 w-5" />}
          label="Total Stitches"
          value={profile.stats.totalStitches.toLocaleString()}
          className="bg-purple-50 dark:bg-purple-950/20"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Completed"
          value={profile.stats.completedProjects}
          className="bg-green-50 dark:bg-green-950/20"
        />
        <StatCard
          icon={<Trophy className="h-5 w-5" />}
          label="Achievements"
          value={profile.stats.achievements}
          className="bg-amber-50 dark:bg-amber-950/20"
        />
      </div>

      {/* Special Badges */}
      <AchievementBadges
        achievementIds={profile.achievements.map((a) => a.achievementId)}
        maxDisplay={5}
      />

      {/* Tabs: Projects / Achievements */}
      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="projects" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Projects ({profile.stats.publicProjects})
          </TabsTrigger>
          <TabsTrigger value="achievements" className="gap-2">
            <Trophy className="h-4 w-4" />
            Achievements ({profile.stats.achievements})
          </TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          {/* All/Public toggle for own profile */}
          {profile.isOwnProfile && profile.allProjects && (
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant={showAllProjects ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAllProjects(true)}
              >
                All Projects ({profile.stats.totalProjects})
              </Button>
              <Button
                variant={!showAllProjects ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAllProjects(false)}
              >
                Public Only ({profile.stats.publicProjects})
              </Button>
            </div>
          )}

          {(() => {
            // Determine which projects to show
            const projectsToShow = profile.isOwnProfile && showAllProjects && profile.allProjects
              ? profile.allProjects
              : profile.publicProjects;

            return projectsToShow.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No public projects yet</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile
                    ? "Make your projects public to share them with the community!"
                    : "This user hasn't shared any projects yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projectsToShow.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          );
          })()}
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          {profile.achievements.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No achievements yet</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile
                    ? "Start stitching to unlock achievements!"
                    : "This user hasn't unlocked any achievements yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {profile.achievements.map((achievement) => (
                <AchievementCard
                  key={achievement.achievementId}
                  achievement={achievement}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  className
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="text-primary">{icon}</div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectCard({ project }: { project: any }) {
  const t = useTranslations();
  const pct = Math.min(
    100,
    Math.round((project.completedStitches / project.totalStitches) * 100)
  );
  const imageSrc = project.coverImage || project.schemaImage;

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]">
      <Link href={`/projects/${project.id}`}>
        {imageSrc && (
          <div className="relative aspect-video w-full">
            <Image
              src={imageSrc}
              alt={project.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-1">
              {project.title}
            </CardTitle>
            {project.status === "completed" && (
              <Badge variant="default" className="bg-green-600 flex-shrink-0">
                <CheckCircle2 className="h-3 w-3" />
              </Badge>
            )}
          </div>

          {/* Themes */}
          {project.themes && project.themes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.themes.slice(0, 2).map((theme: string) => (
                <Badge key={theme} variant="outline" className="text-xs">
                  {theme}
                </Badge>
              ))}
              {project.themes.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{project.themes.length - 2}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="pb-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                {project.completedStitches.toLocaleString()} /{" "}
                {project.totalStitches.toLocaleString()}
              </span>
              <span className="font-medium">{pct}%</span>
            </div>
            <Progress value={pct} className="h-1.5" />
          </div>
        </CardContent>
      </Link>
      <CardContent className="pt-0 pb-3 flex items-center gap-1 border-t">
        <LikeButton projectId={project.id} variant="ghost" size="sm" />
        <Button variant="ghost" size="sm" className="gap-1.5 h-8" asChild>
          <Link href={`/projects/${project.id}#comments`}>
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">{project.commentCount}</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function AchievementCard({ achievement }: { achievement: any }) {
  // You can import achievement definitions from a constants file
  // For now, just display the ID and unlock date
  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm line-clamp-1">
              {achievement.achievementId.replace(/_/g, " ")}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(achievement.unlockedAt), "MMM dd, yyyy")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-6">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
