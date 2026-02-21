import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const themesParam = searchParams.get("themes");

  // Parse themes filter
  const themesFilter = themesParam ? themesParam.split(",").map(t => t.trim()) : null;

  const projects = await prisma.project.findMany({
    where: {
      isPublic: true,
      status: "completed", // Only show completed projects in gallery
    },
    include: {
      user: { select: { name: true, avatar: true } },
      logs: {
        select: { totalStitches: true, photoUrl: true, imageUrl: true },
        orderBy: { date: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  let filteredProjects = projects;

  // Apply themes filter client-side (since SQLite stores as JSON string)
  if (themesFilter && themesFilter.length > 0) {
    filteredProjects = projects.filter(p => {
      const projectThemes = p.themes ? JSON.parse(p.themes) : [];
      return themesFilter.some(theme => projectThemes.includes(theme));
    });
  }

  const result = filteredProjects.map((p) => {
    const projectThemes = p.themes ? JSON.parse(p.themes) : [];
    const latestLog = p.logs[0];
    const finalPhoto = latestLog?.photoUrl || latestLog?.imageUrl; // Final progress photo

    return {
      id: p.id,
      title: p.title,
      description: p.description,
      finalPhoto: finalPhoto, // Final photo from last log (completed work)
      coverImage: p.coverImage, // Cover photo from package (fallback)
      schemaImage: p.schemaImage, // Technical pattern reference (fallback)
      totalStitches: p.totalStitches,
      completedStitches: latestLog?.totalStitches || 0, // Latest cumulative total
      canvasType: p.canvasType,
      status: p.status,
      themes: projectThemes,
      user: p.user,
    };
  });

  return NextResponse.json(result);
}
