import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/reports
 * Create a new report (complaint)
 * Public endpoint - any authenticated user can report
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, reason, description, resourceId, reportedUserId } = body;

    // Validate required fields
    if (!type || !reason || !resourceId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ["comment", "project", "user", "dailyLog"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Validate reason
    const validReasons = ["spam", "inappropriate", "harassment", "other"];
    if (!validReasons.includes(reason)) {
      return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
    }

    // Cannot report yourself
    if (reportedUserId && reportedUserId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot report yourself" },
        { status: 400 }
      );
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        type,
        reason,
        description: description || null,
        resourceId,
        reporterId: session.user.id,
        reportedUserId: reportedUserId || null,
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      reportId: report.id,
    });
  } catch (error) {
    console.error("Failed to create report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}
