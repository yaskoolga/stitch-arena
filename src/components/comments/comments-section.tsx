"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { ReportButton } from "@/components/report-button";

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
}

interface CommentsSectionProps {
  projectId: string;
  projectOwnerId: string;
}

export function CommentsSection({ projectId, projectOwnerId }: CommentsSectionProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const t = useTranslations();
  const [newComment, setNewComment] = useState("");

  const { data: comments, isLoading } = useQuery<Comment[]>({
    queryKey: ["comments", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/comments`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      return res.json();
    },
  });

  const createComment = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch(`/api/projects/${projectId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to post comment");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", projectId] });
      setNewComment("");
      toast.success(t("comments.posted"));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete comment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", projectId] });
      toast.success(t("comments.deleted"));
    },
    onError: () => {
      toast.error(t("comments.deleteFailed"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    createComment.mutate(newComment);
  };

  const canDeleteComment = (comment: Comment) => {
    return (
      session?.user?.id === comment.user.id ||
      session?.user?.id === projectOwnerId
    );
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t("comments.title")}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {comments?.length || 0}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add comment form */}
        {session && (
          <form onSubmit={handleSubmit} className="space-y-2">
            <Textarea
              placeholder={t("comments.writeComment")}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={1000}
              rows={3}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {newComment.length}/1000
              </span>
              <Button
                type="submit"
                disabled={!newComment.trim() || createComment.isPending}
                className="rounded-full"
              >
                {createComment.isPending ? t("comments.posting") : t("comments.postComment")}
              </Button>
            </div>
          </form>
        )}

        {!session && (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("comments.signInToComment")}
          </p>
        )}

        {/* Comments list */}
        <div className="space-y-4 mt-6">
          {isLoading ? (
            <>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              ))}
            </>
          ) : comments && comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={comment.user.avatar || undefined} />
                  <AvatarFallback>
                    {comment.user.name?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-sm">
                        {comment.user.name || "Anonymous"}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {session && session.user.id !== comment.user.id && (
                        <ReportButton
                          type="comment"
                          resourceId={comment.id}
                          reportedUserId={comment.user.id}
                          variant="ghost"
                          size="icon"
                        />
                      )}
                      {canDeleteComment(comment) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full text-destructive hover:text-destructive"
                          onClick={() => deleteComment.mutate(comment.id)}
                          disabled={deleteComment.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {comment.text}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t("comments.beFirst")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
