import { prisma } from "@/lib/prisma";

/**
 * Create a notification for a user
 */
async function createNotification({
  userId,
  type,
  actorId,
  resourceId,
  content,
}: {
  userId: string;
  type: string;
  actorId?: string;
  resourceId?: string;
  content: string;
}) {
  // Don't notify yourself
  if (actorId && userId === actorId) {
    return null;
  }

  try {
    return await prisma.notification.create({
      data: {
        userId,
        type,
        actorId,
        resourceId,
        content,
      },
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

/**
 * Notify when someone likes a project
 */
export async function notifyLike({
  projectId,
  likedByUserId,
  likedByUserName,
}: {
  projectId: string;
  likedByUserId: string;
  likedByUserName: string;
}) {
  // Get project owner
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { userId: true, title: true },
  });

  if (!project) return null;

  return createNotification({
    userId: project.userId,
    type: "like",
    actorId: likedByUserId,
    resourceId: projectId,
    content: `${likedByUserName} liked your project "${project.title}"`,
  });
}

/**
 * Notify when someone comments on a project
 */
export async function notifyComment({
  projectId,
  commentedByUserId,
  commentedByUserName,
}: {
  projectId: string;
  commentedByUserId: string;
  commentedByUserName: string;
}) {
  // Get project owner
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { userId: true, title: true },
  });

  if (!project) return null;

  return createNotification({
    userId: project.userId,
    type: "comment",
    actorId: commentedByUserId,
    resourceId: projectId,
    content: `${commentedByUserName} commented on your project "${project.title}"`,
  });
}

/**
 * Notify when someone follows you
 */
export async function notifyFollow({
  followedUserId,
  followerUserId,
  followerUserName,
}: {
  followedUserId: string;
  followerUserId: string;
  followerUserName: string;
}) {
  return createNotification({
    userId: followedUserId,
    type: "follow",
    actorId: followerUserId,
    resourceId: followerUserId,
    content: `${followerUserName} started following you`,
  });
}

/**
 * Notify when user unlocks an achievement
 */
export async function notifyAchievement({
  userId,
  achievementId,
  achievementName,
}: {
  userId: string;
  achievementId: string;
  achievementName: string;
}) {
  return createNotification({
    userId,
    type: "achievement",
    resourceId: achievementId,
    content: `You unlocked: ${achievementName}`,
  });
}
