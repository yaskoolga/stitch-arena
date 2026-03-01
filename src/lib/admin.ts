import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@stitcharena.com";

/**
 * Require admin authentication for API routes
 * @returns {session, error} - session if authorized, error response if not
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (session.user.email !== ADMIN_EMAIL) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { session };
}

/**
 * Log admin action to database
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  metadata?: object
) {
  await prisma.adminLog.create({
    data: {
      adminId,
      action,
      targetType,
      targetId,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}

/**
 * Check if user is admin (for server components)
 */
export async function isAdmin(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  return email === ADMIN_EMAIL;
}
