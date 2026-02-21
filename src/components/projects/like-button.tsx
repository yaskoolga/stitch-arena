"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  projectId: string;
  showCount?: boolean;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function LikeButton({
  projectId,
  showCount = true,
  variant = "ghost",
  size = "default",
  className,
}: LikeButtonProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data } = useQuery<{ likeCount: number; isLiked: boolean }>({
    queryKey: ["like", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/like`);
      if (!res.ok) throw new Error("Failed to fetch like status");
      return res.json();
    },
  });

  const toggleLike = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/like`, {
        method: "POST",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to toggle like");
      }
      return res.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["like", projectId] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["public-projects"] });

      if (result.liked) {
        toast.success("Added to favorites");
      } else {
        toast.success("Removed from favorites");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      toast.error("Sign in to like projects");
      return;
    }

    toggleLike.mutate();
  };

  const likeCount = data?.likeCount || 0;
  const isLiked = data?.isLiked || false;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={toggleLike.isPending}
      className={cn("gap-2", className)}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-all",
          isLiked && "fill-red-500 text-red-500"
        )}
      />
      {showCount && <span>{likeCount}</span>}
    </Button>
  );
}
