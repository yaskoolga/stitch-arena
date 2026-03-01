import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const action = searchParams.get("action") || "all";
    const targetType = searchParams.get("targetType") || "all";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (action !== "all") {
      where.action = action;
    }

    if (targetType !== "all") {
      where.targetType = targetType;
    }

    // Fetch logs with admin data
    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({
        where,
        select: {
          id: true,
          action: true,
          targetType: true,
          targetId: true,
          metadata: true,
          createdAt: true,
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.adminLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Failed to fetch admin logs:", err);
    return NextResponse.json(
      { error: "Failed to fetch admin logs" },
      { status: 500 }
    );
  }
}
