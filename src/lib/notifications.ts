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
  metadata,
}: {
  userId: string;
  type: string;
  actorId?: string;
  resourceId?: string;
  content: string;
  metadata?: any;
}) {
  // Don't notify yourself
  if (actorId && userId === actorId) {
    return null;
  }

  try {
    // Check if user has notifications enabled
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notificationsEnabled: true },
    });

    if (!user || !user.notificationsEnabled) {
      return null; // User has disabled notifications
    }

    return await prisma.notification.create({
      data: {
        userId,
        type,
        actorId,
        resourceId,
        content,
        metadata,
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
    metadata: { user: likedByUserName, project: project.title },
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
    metadata: { user: commentedByUserName, project: project.title },
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
    metadata: { user: followerUserName },
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
    metadata: { achievement: achievementName },
  });
}

/**
 * Notify when someone follows a project
 */
export async function notifyProjectFollow({
  projectId,
  projectTitle,
  followedByUserId,
  followedByUserName,
  projectOwnerId,
}: {
  projectId: string;
  projectTitle: string;
  followedByUserId: string;
  followedByUserName: string;
  projectOwnerId: string;
}) {
  return createNotification({
    userId: projectOwnerId,
    type: "projectfollow",
    actorId: followedByUserId,
    resourceId: projectId,
    content: `${followedByUserName} started following your project "${projectTitle}"`,
    metadata: { user: followedByUserName, project: projectTitle },
  });
}

/**
 * Notify followers when a new log is added to a project
 */
export async function notifyNewLog({
  projectId,
  projectTitle,
  projectOwnerId,
  dailyStitches,
}: {
  projectId: string;
  projectTitle: string;
  projectOwnerId: string;
  dailyStitches: number;
}) {
  // Get all followers of this project (excluding the owner)
  const followers = await prisma.projectFollow.findMany({
    where: {
      projectId,
      userId: { not: projectOwnerId },
    },
    select: { userId: true },
  });

  // Create notification for each follower
  const notifications = followers.map((follower) =>
    createNotification({
      userId: follower.userId,
      type: "newlog",
      actorId: projectOwnerId,
      resourceId: projectId,
      content: `New progress in "${projectTitle}": +${dailyStitches} stitches`,
      metadata: { project: projectTitle, stitches: dailyStitches },
    })
  );

  return Promise.all(notifications);
}

/**
 * Notify followers when user creates a new project
 */
export async function notifyNewProject({
  projectId,
  projectTitle,
  userId,
  userName,
}: {
  projectId: string;
  projectTitle: string;
  userId: string;
  userName: string;
}) {
  // Get all followers of this user
  const followers = await prisma.follow.findMany({
    where: { followingId: userId },
    select: { followerId: true },
  });

  // Create notification for each follower
  const notifications = followers.map((follower) =>
    createNotification({
      userId: follower.followerId,
      type: "newproject",
      actorId: userId,
      resourceId: projectId,
      content: `${userName} started a new project: "${projectTitle}"`,
      metadata: { user: userName, project: projectTitle },
    })
  );

  return Promise.all(notifications);
}

/**
 * Notify user when project is close to completion (95%+)
 */
export async function notifyProjectCompletion({
  userId,
  projectId,
  projectTitle,
  percentage,
}: {
  userId: string;
  projectId: string;
  projectTitle: string;
  percentage: number;
}) {
  // Only notify at exactly 95% to avoid spam
  if (percentage < 95 || percentage >= 100) return null;

  return createNotification({
    userId,
    type: "completion",
    resourceId: projectId,
    content: `Your project "${projectTitle}" is ${percentage}% complete! Almost there! 🎉`,
    metadata: { project: projectTitle, percentage },
  });
}

/**
 * Notify user when streak is in danger (no log in last 20+ hours)
 */
export async function notifyStreakDanger({
  userId,
  currentStreak,
  hoursRemaining,
}: {
  userId: string;
  currentStreak: number;
  hoursRemaining: number;
}) {
  // Only notify if streak is at least 3 days
  if (currentStreak < 3) return null;

  return createNotification({
    userId,
    type: "streak",
    content: `Your ${currentStreak}-day streak is in danger! Log progress in the next ${hoursRemaining} hours to keep it alive 🔥`,
    metadata: { days: currentStreak, hours: hoursRemaining },
  });
}
