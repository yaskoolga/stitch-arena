"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AchievementsSection } from "@/components/achievements/achievements-section";
import { ProjectCard } from "@/components/projects/project-card";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Award, FolderOpen, Edit2, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";
import { calculate6MonthAverage } from "@/lib/stats";

export default function ProfilePage() {
  const t = useTranslations();
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetch("/api/profile").then((r) => r.json()),
    enabled: !!session,
  });

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => fetch("/api/projects").then((r) => r.json()),
    enabled: !!session,
  });

  const update = useMutation({
    mutationFn: (body: { name?: string; bio?: string; avatar?: string }) =>
      fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setEditing(false);
      toast.success(t("toast.success.profileUpdated"));
    },
    onError: () => toast.error(t("toast.error.generic")),
  });

  if (status === "loading") return <ProfileSkeleton />;
  if (!session) redirect("/login");

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      const { url } = await res.json();
      setAvatarUrl(url);
    } else {
      toast.error(t("toast.error.uploadFailed"));
    }
    setUploading(false);
  }

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    update.mutate({
      name: form.get("name") as string,
      bio: form.get("bio") as string,
      avatar: avatarUrl || profile?.avatar || undefined,
    });
  }

  const displayAvatar = avatarUrl || profile?.avatar;
  const projectsList = projects || [];
  const totalProjects = projectsList.length;
  const completedProjects = projectsList.filter((p: any) => p.status === "completed").length;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Profile Header */}
      <Card className="gap-4 py-6 mb-6 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background">
        <CardContent className="px-6 pb-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              {displayAvatar ? (
                <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-primary/20 shadow-lg">
                  <Image src={displayAvatar} alt="Avatar" fill className="object-cover" />
                </div>
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 border-4 border-primary/20 text-3xl font-bold text-primary-foreground shadow-lg">
                  {(profile?.name?.[0] || profile?.email?.[0] || "?").toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold mb-2">
                {profile?.name || "Stitcher"}
              </h1>
              {profile?.bio && (
                <p className="text-muted-foreground mb-3 max-w-2xl">
                  {profile.bio}
                </p>
              )}
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  {profile?.email}
                </div>
                {profile?.createdAt && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {t("profile.fields.joined", { date: format(new Date(profile.createdAt), "MMM yyyy") })}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 mt-4 justify-center sm:justify-start">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{totalProjects}</div>
                  <div className="text-xs text-muted-foreground">{t("profile.stats.projects")}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{completedProjects}</div>
                  <div className="text-xs text-muted-foreground">{t("profile.stats.completed")}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {totalProjects - completedProjects}
                  </div>
                  <div className="text-xs text-muted-foreground">{t("profile.stats.inProgress")}</div>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            {!editing && (
              <Button
                onClick={() => setEditing(true)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Edit2 className="h-4 w-4" />
                {t("profile.editProfile")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      {editing && (
        <Card className="gap-3 py-4 mb-6">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-lg">{t("profile.editProfile")}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-0">
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="avatar">{t("profile.fields.avatar")}</Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="cursor-pointer"
                />
                {uploading && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("common.loading")}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="name">{t("profile.fields.name")}</Label>
                <Input id="name" name="name" defaultValue={profile?.name ?? ""} />
              </div>
              <div>
                <Label htmlFor="bio">{t("profile.fields.bio")}</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  defaultValue={profile?.bio ?? ""}
                  placeholder={t("profile.fields.bio")}
                  className="resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={update.isPending || uploading}>
                  {t("common.save")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    setAvatarUrl("");
                  }}
                >
                  {t("common.cancel")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="projects" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            {t("profile.tabs.projects")}
          </TabsTrigger>
          <TabsTrigger value="achievements" className="gap-2">
            <Award className="h-4 w-4" />
            {t("profile.tabs.achievements")}
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <User className="h-4 w-4" />
            {t("profile.tabs.stats")}
          </TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          {projectsLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="gap-3 py-4">
                  <CardHeader className="px-4 pb-0">
                    <Skeleton className="h-5 w-3/4" />
                  </CardHeader>
                  <CardContent className="px-4 pb-0">
                    <Skeleton className="h-32 w-full mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : projectsList.length === 0 ? (
            <Card className="gap-3 py-12">
              <CardContent className="text-center px-4 pb-0">
                <FolderOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">{t("profile.empty")}</h3>
                <p className="text-muted-foreground mb-4">
                  {t("projects.startFirst")}
                </p>
                <Link href="/projects/new">
                  <Button>{t("profile.createFirst")}</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projectsList.map((p: any) => {
                const themes = p.themes ? JSON.parse(p.themes) : [];
                const avgSpeed = p.logs ? calculate6MonthAverage(p.logs) : 0;
                return (
                  <ProjectCard
                    key={p.id}
                    {...p}
                    themes={themes}
                    avgSpeed={avgSpeed}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements">
          <AchievementsSection />
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <Card className="gap-3 py-4">
            <CardHeader className="px-4 pb-0">
              <CardTitle>{t("profile.tabs.stats")}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-0">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t("profile.stats.projects")}</p>
                  <p className="text-2xl font-bold">{totalProjects}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t("profile.stats.completed")}</p>
                  <p className="text-2xl font-bold text-green-600">
                    {completedProjects}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t("profile.stats.inProgress")}</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {projectsList.filter((p: any) => p.status === "in_progress")
                      .length}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t("profile.stats.paused")}</p>
                  <p className="text-2xl font-bold text-muted-foreground">
                    {projectsList.filter((p: any) => p.status === "paused").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="max-w-5xl mx-auto">
      <Card className="gap-4 py-6 mb-6">
        <CardContent className="px-6 pb-0">
          <div className="flex items-center gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64 mb-3" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Skeleton className="h-12 w-full mb-6" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    </div>
  );
}
