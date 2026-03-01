import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const body = await request.json();
    const { banned, reason } = body;

    // Validate
    if (typeof banned !== "boolean") {
      return NextResponse.json(
        { error: "Invalid ban status" },
        { status: 400 }
      );
    }

    // Cannot ban yourself
    if (id === session!.user.id) {
      return NextResponse.json(
        { error: "Cannot ban yourself" },
        { status: 400 }
      );
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: {
        isBanned: banned,
        bannedAt: banned ? new Date() : null,
        bannedReason: banned ? reason || null : null,
      },
    });

    // Log action
    await logAdminAction(
      session!.user.id,
      banned ? "ban_user" : "unban_user",
      "user",
      id,
      { reason }
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        isBanned: user.isBanned,
        bannedAt: user.bannedAt,
        bannedReason: user.bannedReason,
      },
    });
  } catch (err) {
    console.error("Failed to ban/unban user:", err);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
