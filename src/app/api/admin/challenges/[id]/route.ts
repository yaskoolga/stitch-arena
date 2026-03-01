import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const body = await request.json();
    const { title, description, startDate, endDate, targetValue, isActive } = body;

    // Build update data
    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (targetValue !== undefined) updateData.targetValue = parseInt(targetValue);
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update challenge
    const challenge = await prisma.challenge.update({
      where: { id },
      data: updateData,
    });

    // Log action
    await logAdminAction(
      session!.user.id,
      isActive === false ? "deactivate_challenge" : "update_challenge",
      "challenge",
      id,
      { updates: Object.keys(updateData) }
    );

    return NextResponse.json({ challenge });
  } catch (err) {
    console.error("Failed to update challenge:", err);
    return NextResponse.json(
      { error: "Failed to update challenge" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    // Delete challenge (cascade will handle participants and leaderboard)
    await prisma.challenge.delete({
      where: { id },
    });

    // Log action
    await logAdminAction(session!.user.id, "delete_challenge", "challenge", id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete challenge:", err);
    return NextResponse.json(
      { error: "Failed to delete challenge" },
      { status: 500 }
    );
  }
}
