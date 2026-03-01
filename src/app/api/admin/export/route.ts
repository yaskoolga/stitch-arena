import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

// Helper to convert data to CSV
function toCSV(data: any[], headers: string[]): string {
  const escape = (val: any) => {
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = [headers.join(",")];

  for (const item of data) {
    const row = headers.map((header) => escape(item[header]));
    rows.push(row.join(","));
  }

  return rows.join("\n");
}

export async function GET(request: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // users | projects | comments | reports | logs

    if (!type) {
      return NextResponse.json(
        { error: "Missing type parameter" },
        { status: 400 }
      );
    }

    let data: any[] = [];
    let headers: string[] = [];
    let filename = "";

    switch (type) {
      case "users":
        const users = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isBanned: true,
            bannedReason: true,
            totalStitches: true,
            projectsCount: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        });

        data = users.map((u) => ({
          id: u.id,
          name: u.name || "",
          email: u.email,
          role: u.role,
          isBanned: u.isBanned,
          bannedReason: u.bannedReason || "",
          totalStitches: u.totalStitches,
          projectsCount: u.projectsCount,
          createdAt: u.createdAt.toISOString(),
        }));

        headers = [
          "id",
          "name",
          "email",
          "role",
          "isBanned",
          "bannedReason",
          "totalStitches",
          "projectsCount",
          "createdAt",
        ];
        filename = "users.csv";
        break;

      case "projects":
        const projects = await prisma.project.findMany({
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            isPublic: true,
            totalStitches: true,
            createdAt: true,
            user: {
              select: {
                email: true,
                name: true,
              },
            },
            _count: {
              select: {
                logs: true,
                comments: true,
                likes: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        data = projects.map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description || "",
          status: p.status,
          isPublic: p.isPublic,
          totalStitches: p.totalStitches,
          authorEmail: p.user.email,
          authorName: p.user.name || "",
          logsCount: p._count.logs,
          commentsCount: p._count.comments,
          likesCount: p._count.likes,
          createdAt: p.createdAt.toISOString(),
        }));

        headers = [
          "id",
          "title",
          "description",
          "status",
          "isPublic",
          "totalStitches",
          "authorEmail",
          "authorName",
          "logsCount",
          "commentsCount",
          "likesCount",
          "createdAt",
        ];
        filename = "projects.csv";
        break;

      case "comments":
        const comments = await prisma.comment.findMany({
          select: {
            id: true,
            text: true,
            createdAt: true,
            user: {
              select: {
                email: true,
                name: true,
              },
            },
            project: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        data = comments.map((c) => ({
          id: c.id,
          text: c.text,
          authorEmail: c.user.email,
          authorName: c.user.name || "",
          projectId: c.project.id,
          projectTitle: c.project.title,
          createdAt: c.createdAt.toISOString(),
        }));

        headers = [
          "id",
          "text",
          "authorEmail",
          "authorName",
          "projectId",
          "projectTitle",
          "createdAt",
        ];
        filename = "comments.csv";
        break;

      case "reports":
        const reports = await prisma.report.findMany({
          select: {
            id: true,
            type: true,
            reason: true,
            description: true,
            status: true,
            resourceId: true,
            adminNote: true,
            createdAt: true,
            resolvedAt: true,
            reporter: {
              select: {
                email: true,
                name: true,
              },
            },
            reportedUser: {
              select: {
                email: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        data = reports.map((r) => ({
          id: r.id,
          type: r.type,
          reason: r.reason,
          description: r.description || "",
          status: r.status,
          resourceId: r.resourceId || "",
          reporterEmail: r.reporter.email,
          reporterName: r.reporter.name || "",
          reportedUserEmail: r.reportedUser?.email || "",
          reportedUserName: r.reportedUser?.name || "",
          adminNote: r.adminNote || "",
          createdAt: r.createdAt.toISOString(),
          resolvedAt: r.resolvedAt?.toISOString() || "",
        }));

        headers = [
          "id",
          "type",
          "reason",
          "description",
          "status",
          "resourceId",
          "reporterEmail",
          "reporterName",
          "reportedUserEmail",
          "reportedUserName",
          "adminNote",
          "createdAt",
          "resolvedAt",
        ];
        filename = "reports.csv";
        break;

      case "logs":
        const logs = await prisma.adminLog.findMany({
          select: {
            id: true,
            action: true,
            targetType: true,
            targetId: true,
            metadata: true,
            createdAt: true,
            admin: {
              select: {
                email: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10000, // Limit to 10k records
        });

        data = logs.map((l) => ({
          id: l.id,
          action: l.action,
          targetType: l.targetType,
          targetId: l.targetId,
          metadata: l.metadata || "",
          adminEmail: l.admin.email,
          adminName: l.admin.name || "",
          createdAt: l.createdAt.toISOString(),
        }));

        headers = [
          "id",
          "action",
          "targetType",
          "targetId",
          "metadata",
          "adminEmail",
          "adminName",
          "createdAt",
        ];
        filename = "admin-logs.csv";
        break;

      default:
        return NextResponse.json(
          { error: `Invalid export type: ${type}` },
          { status: 400 }
        );
    }

    const csv = toCSV(data, headers);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Failed to export data:", err);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
