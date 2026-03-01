import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    // Delete project (cascade will handle logs, comments, etc.)
    await prisma.project.delete({
      where: { id },
    });

    // Log action
    await logAdminAction(session!.user.id, "delete_project", "project", id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete project:", err);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
