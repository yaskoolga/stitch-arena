import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

/**
 * GET /api/feed
 * Get community activity feed (new public projects and logs)
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "all"; // all, projects, logs
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    const feedItems: Array<{
      id: string;
      type: "project" | "log";
      createdAt: Date;
      data: any;
    }> = [];

    // Fetch new public projects
    if (type === "all" || type === "projects") {
      const projects = await prisma.project.findMany({
        where: { isPublic: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: { likes: true, comments: true },
          },
          logs: {
            select: { totalStitches: true },
            orderBy: { date: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
        take: type === "projects" ? limit : Math.ceil(limit / 2),
        skip: type === "projects" ? offset : 0,
      });

      projects.forEach(project => {
        const projectThemes = project.themes ? JSON.parse(project.themes) : [];

        feedItems.push({
          id: `project-${project.id}`,
          type: "project",
          createdAt: project.createdAt,
          data: {
            ...project,
            themes: projectThemes,
            completedStitches: project.logs[0]?.totalStitches || 0,
            likeCount: project._count.likes,
            commentCount: project._count.comments,
          },
        });
      });
    }

    // Fetch new logs from public projects (with photos)
    if (type === "all" || type === "logs") {
      const logs = await prisma.dailyLog.findMany({
        where: {
          photoUrl: { not: null },
          project: { isPublic: true },
        },
        include: {
          project: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: type === "logs" ? limit : Math.ceil(limit / 2),
        skip: type === "logs" ? offset : 0,
      });

      logs.forEach(log => {
        const projectThemes = log.project.themes ? JSON.parse(log.project.themes) : [];

        feedItems.push({
          id: `log-${log.id}`,
          type: "log",
          createdAt: log.createdAt,
          data: {
            id: log.id,
            date: log.date,
            photoUrl: log.photoUrl,
            totalStitches: log.totalStitches,
            dailyStitches: log.dailyStitches,
            notes: log.notes,
            project: {
              ...log.project,
              themes: projectThemes,
            },
          },
        });
      });
    }

    // Sort all items by creation date
    feedItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply limit and offset for "all" type
    const paginatedItems = type === "all"
      ? feedItems.slice(offset, offset + limit)
      : feedItems;

    return NextResponse.json({
      items: paginatedItems,
      hasMore: feedItems.length === limit,
    });
  } catch (error) {
    console.error("Error fetching feed:", error);
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 }
    );
  }
}
