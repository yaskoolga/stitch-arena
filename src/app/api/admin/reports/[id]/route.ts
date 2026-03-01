import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/admin/reports/[id]
 * Update report status (resolve/dismiss)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const body = await request.json();
    const { status, adminNote } = body;

    // Validate status
    const validStatuses = ["pending", "reviewed", "resolved", "dismissed"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update report
    const report = await prisma.report.update({
      where: { id },
      data: {
        status,
        adminNote: adminNote || null,
        resolvedBy: session!.user.id,
        resolvedAt: new Date(),
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reportedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Log admin action
    await logAdminAction(
      session!.user.id,
      "resolve_report",
      "report",
      id,
      {
        status,
        type: report.type,
        reason: report.reason,
        resourceId: report.resourceId,
      }
    );

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err) {
    console.error("Failed to update report:", err);
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    );
  }
}
