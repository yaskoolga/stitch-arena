"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Trophy,
  Image,
  FolderPlus,
  PartyPopper,
  Flame,
  Check,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  resourceId?: string;
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  // Fetch notifications
  const { data, isLoading } = useQuery<{ notifications: Notification[]; unreadCount: number }>({
    queryKey: ["notifications", filter],
    queryFn: async () => {
      const url = filter === "unread"
        ? "/api/notifications?unreadOnly=true&limit=100"
        : "/api/notifications?limit=100";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
    enabled: !!session,
    refetchInterval: 30000, // Poll every 30 seconds
  });

  // Mark all as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications", {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Failed to mark all as read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
  });

  // Mark single as read
  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Failed to mark as read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }

    // Navigate based on type
    if (notification.resourceId) {
      if (
        notification.type === "like" ||
        notification.type === "comment" ||
        notification.type === "projectfollow" ||
        notification.type === "newlog" ||
        notification.type === "newproject" ||
        notification.type === "completion"
      ) {
        router.push(`/projects/${notification.resourceId}`);
      } else if (notification.type === "follow") {
        router.push(`/dashboard/${notification.resourceId}`);
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-5 w-5 text-red-500" />;
      case "comment":
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case "follow":
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case "projectfollow":
        return <Bell className="h-5 w-5 text-purple-500" />;
      case "achievement":
        return <Trophy className="h-5 w-5 text-amber-500" />;
      case "newlog":
        return <Image className="h-5 w-5 text-cyan-500" />;
      case "newproject":
        return <FolderPlus className="h-5 w-5 text-indigo-500" />;
      case "completion":
        return <PartyPopper className="h-5 w-5 text-pink-500" />;
      case "streak":
        return <Flame className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const groupByDate = (notifications: Notification[]) => {
    const groups: Record<string, Notification[]> = {
      Today: [],
      Yesterday: [],
      "This Week": [],
      Older: [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);

    notifications.forEach((notif) => {
      const date = new Date(notif.createdAt);
      if (date >= today) {
        groups.Today.push(notif);
      } else if (date >= yesterday) {
        groups.Yesterday.push(notif);
      } else if (date >= thisWeek) {
        groups["This Week"].push(notif);
      } else {
        groups.Older.push(notif);
      }
    });

    return groups;
  };

  if (!session) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card className="p-8 text-center">
          <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Sign in to view notifications</h2>
          <p className="text-muted-foreground">
            You need to be signed in to see your notifications.
          </p>
        </Card>
      </div>
    );
  }

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;
  const filteredNotifications =
    filter === "unread" ? notifications.filter((n) => !n.isRead) :
    filter === "read" ? notifications.filter((n) => n.isRead) :
    notifications;
  const grouped = groupByDate(filteredNotifications);

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
            className="rounded-full"
          >
            {markAllAsRead.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Mark all read
          </Button>
        )}
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mb-6">
        <TabsList className="grid w-full grid-cols-3 rounded-full">
          <TabsTrigger value="all" className="rounded-full">All</TabsTrigger>
          <TabsTrigger value="unread" className="rounded-full">
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
          <TabsTrigger value="read" className="rounded-full">Read</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <Card className="p-8 text-center">
          <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading notifications...</p>
        </Card>
      ) : filteredNotifications.length === 0 ? (
        <Card className="p-8 text-center rounded-2xl">
          <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-semibold mb-2">No notifications</h2>
          <p className="text-muted-foreground">
            {filter === "unread"
              ? "You're all caught up!"
              : filter === "read"
              ? "No read notifications yet"
              : "You don't have any notifications yet"}
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([label, notifs]) => {
            if (notifs.length === 0) return null;
            return (
              <div key={label}>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-2">
                  {label}
                </h2>
                <div className="space-y-2">
                  {notifs.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-md rounded-2xl ${
                        !notification.isRead ? "bg-primary/5 border-primary/20" : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1 flex-shrink-0">{getIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm leading-relaxed">{notification.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <Badge variant="default" className="flex-shrink-0 rounded-full">
                            New
                          </Badge>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
