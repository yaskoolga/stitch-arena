import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { validateCommentContent, getFilterErrorMessage, checkRateLimit } from "@/lib/content-filter";
import { notifyComment } from "@/lib/notifications";

const commentCreateSchema = z.object({
  text: z.string().min(1, "Comment cannot be empty").max(1000, "Comment too long"),
});

/**
 * GET /api/projects/[id]/comments
 * Get all comments for a project
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const comments = await prisma.comment.findMany({
      where: { projectId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[id]/comments
 * Create a new comment on a project
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if project exists and is public
    const project = await prisma.project.findUnique({
      where: { id },
      select: { isPublic: true, userId: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Only allow comments on public projects or own projects
    if (!project.isPublic && project.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Cannot comment on private projects" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = commentCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Rate limiting: Check user's last comment time
    const lastComment = await prisma.comment.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    const rateLimitCheck = checkRateLimit(lastComment?.createdAt || null, 10);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: `Please wait ${rateLimitCheck.waitTime} seconds before commenting again`,
        },
        { status: 429 }
      );
    }

    // Content filtering
    const filterResult = validateCommentContent(parsed.data.text);
    if (!filterResult.isValid) {
      return NextResponse.json(
        { error: getFilterErrorMessage(filterResult.reason) },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        text: filterResult.sanitizedText || parsed.data.text,
        userId: session.user.id,
        projectId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Send notification
    notifyComment({
      projectId: id,
      commentedByUserId: session.user.id,
      commentedByUserName: session.user.name || "Someone",
    }).catch(console.error);

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
