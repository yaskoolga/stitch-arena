import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const { action, targetType, targetIds, metadata } = body;

    // Validate input
    if (!action || !targetType || !Array.isArray(targetIds) || targetIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. Required: action, targetType, targetIds" },
        { status: 400 }
      );
    }

    let result: any = {};

    switch (targetType) {
      case "user":
        if (action === "ban") {
          // Check that admin is not banning themselves
          if (targetIds.includes(session!.user.id)) {
            return NextResponse.json(
              { error: "Cannot ban yourself" },
              { status: 400 }
            );
          }

          const reason = metadata?.reason || "Bulk ban by admin";

          result = await prisma.user.updateMany({
            where: { id: { in: targetIds } },
            data: {
              isBanned: true,
              bannedAt: new Date(),
              bannedReason: reason,
            },
          });

          // Log each action
          for (const id of targetIds) {
            await logAdminAction(
              session!.user.id,
              "ban_user",
              "user",
              id,
              { reason, bulk: true }
            );
          }
        } else if (action === "unban") {
          result = await prisma.user.updateMany({
            where: { id: { in: targetIds } },
            data: {
              isBanned: false,
              bannedAt: null,
              bannedReason: null,
            },
          });

          // Log each action
          for (const id of targetIds) {
            await logAdminAction(
              session!.user.id,
              "unban_user",
              "user",
              id,
              { bulk: true }
            );
          }
        } else {
          return NextResponse.json(
            { error: `Invalid action for user: ${action}` },
            { status: 400 }
          );
        }
        break;

      case "project":
        if (action === "delete") {
          result = await prisma.project.deleteMany({
            where: { id: { in: targetIds } },
          });

          // Log each action
          for (const id of targetIds) {
            await logAdminAction(
              session!.user.id,
              "delete_project",
              "project",
              id,
              { bulk: true }
            );
          }
        } else {
          return NextResponse.json(
            { error: `Invalid action for project: ${action}` },
            { status: 400 }
          );
        }
        break;

      case "comment":
        if (action === "delete") {
          result = await prisma.comment.deleteMany({
            where: { id: { in: targetIds } },
          });

          // Log each action
          for (const id of targetIds) {
            await logAdminAction(
              session!.user.id,
              "delete_comment",
              "comment",
              id,
              { bulk: true }
            );
          }
        } else {
          return NextResponse.json(
            { error: `Invalid action for comment: ${action}` },
            { status: 400 }
          );
        }
        break;

      case "report":
        if (action === "resolve" || action === "dismiss") {
          const status = action === "resolve" ? "resolved" : "dismissed";

          result = await prisma.report.updateMany({
            where: { id: { in: targetIds } },
            data: {
              status,
              resolvedBy: session!.user.id,
              resolvedAt: new Date(),
              adminNote: metadata?.note || `Bulk ${action} by admin`,
            },
          });

          // Log each action
          for (const id of targetIds) {
            await logAdminAction(
              session!.user.id,
              `${action}_report`,
              "report",
              id,
              { bulk: true }
            );
          }
        } else {
          return NextResponse.json(
            { error: `Invalid action for report: ${action}` },
            { status: 400 }
          );
        }
        break;

      default:
        return NextResponse.json(
          { error: `Invalid target type: ${targetType}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      count: result.count || targetIds.length,
    });
  } catch (err) {
    console.error("Failed to perform bulk action:", err);
    return NextResponse.json(
      { error: "Failed to perform bulk action" },
      { status: 500 }
    );
  }
}
