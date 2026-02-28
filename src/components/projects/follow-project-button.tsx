"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface FollowProjectButtonProps {
  projectId: string;
  projectOwnerId?: string;
  showCount?: boolean;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function FollowProjectButton({
  projectId,
  projectOwnerId,
  showCount = true,
  variant = "outline",
  size = "default",
  className,
}: FollowProjectButtonProps) {
  const t = useTranslations();
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data } = useQuery<{ followerCount: number; isFollowing: boolean }>({
    queryKey: ["projectfollow", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/follow`);
      if (!res.ok) throw new Error("Failed to fetch follow status");
      return res.json();
    },
  });

  const toggleFollow = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/follow`, {
        method: "POST",
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Unknown error" }));
        console.error("Follow error:", error);
        throw new Error(error.error || "Failed to toggle follow");
      }
      return res.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["projectfollow", projectId] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
      queryClient.invalidateQueries({ queryKey: ["public-projects"] });

      if (result.isFollowing) {
        toast.success(t("toast.success.followed"));
      } else {
        toast.success(t("toast.success.unfollowed"));
      }
    },
    onError: (error: Error) => {
      console.error("Follow mutation error:", error);
      toast.error(error.message || t("toast.error.generic"));
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      toast.error(t("auth.loginRequired"));
      return;
    }

    toggleFollow.mutate();
  };

  const followerCount = data?.followerCount || 0;
  const isFollowing = data?.isFollowing || false;

  // Don't show follow button for own projects
  if (session?.user?.id && projectOwnerId && session.user.id === projectOwnerId) {
    return null;
  }

  return (
    <Button
      variant={isFollowing ? "outline" : variant}
      size={size}
      onClick={handleClick}
      disabled={toggleFollow.isPending}
      className={cn("gap-2", className)}
    >
      {isFollowing ? (
        <BellOff className="h-4 w-4" />
      ) : (
        <Bell className="h-4 w-4" />
      )}
      {size !== "icon" && (
        <span>
          {isFollowing ? t("projects.unfollow") : t("projects.follow")}
        </span>
      )}
      {showCount && followerCount > 0 && (
        <span className="text-muted-foreground">({followerCount})</span>
      )}
    </Button>
  );
}
