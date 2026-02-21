"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  userId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function FollowButton({
  userId,
  variant = "default",
  size = "default",
  className,
}: FollowButtonProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data } = useQuery<{ isFollowing: boolean; followerCount: number }>({
    queryKey: ["follow", userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/follow`);
      if (!res.ok) throw new Error("Failed to fetch follow status");
      return res.json();
    },
  });

  const toggleFollow = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to toggle follow");
      }
      return res.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["follow", userId] });
      queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["user-profile", session?.user?.id] });

      if (result.isFollowing) {
        toast.success("Now following!");
      } else {
        toast.success("Unfollowed");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleClick = () => {
    if (!session) {
      toast.error("Sign in to follow users");
      return;
    }

    toggleFollow.mutate();
  };

  const isFollowing = data?.isFollowing || false;

  return (
    <Button
      variant={isFollowing ? "outline" : variant}
      size={size}
      onClick={handleClick}
      disabled={toggleFollow.isPending}
      className={cn("gap-2", className)}
    >
      {toggleFollow.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="h-4 w-4" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Follow
        </>
      )}
    </Button>
  );
}
