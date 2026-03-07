import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projectCreateSchema } from "@/lib/validations";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    include: {
      logs: {
        select: { totalStitches: true, dailyStitches: true, date: true },
        orderBy: { date: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = projects.map((p) => {
    const completedStitches = p.logs[0]?.totalStitches || p.initialStitches;
    const actualStitched = Math.max(0, completedStitches - p.initialStitches);
    return {
      ...p,
      completedStitches,
      actualStitched,
    };
  });

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = projectCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const {
    title,
    description,
    manufacturer,
    articleNumber,
    totalStitches,
    initialStitches,
    initialPhotoUrl,
    aiDetectedInitial,
    aiConfidenceInitial,
    userCorrectedInitial,
    width,
    height,
    canvasType,
    calibrationData,
    isPublic,
    coverImage,
    themes
  } = parsed.data;

  // Auto-calculate totalStitches if width and height provided
  let finalTotalStitches = totalStitches;
  if (width && height && !totalStitches) {
    finalTotalStitches = width * height;
  }

  const project = await prisma.project.create({
    data: {
      userId: session.user.id,
      title,
      description,
      manufacturer,
      articleNumber,
      totalStitches: finalTotalStitches,
      initialStitches: initialStitches || 0,
      width,
      height,
      canvasType,
      calibrationData,
      isPublic,
      coverImage,
      schemaImage: null, // Removed schemaImage feature
      themes: JSON.stringify(themes || []),
    },
  });

  // If initial stitches were provided with a photo, create the first daily log
  if (initialPhotoUrl && initialStitches && initialStitches > 0) {
    await prisma.dailyLog.create({
      data: {
        projectId: project.id,
        date: new Date(), // Date when project was created
        dailyStitches: 0, // No new stitches, this is the initial state
        totalStitches: initialStitches,
        photoUrl: initialPhotoUrl,
        notes: "Initial stitches before tracking started",
        aiDetected: aiDetectedInitial || null,
        aiConfidence: aiConfidenceInitial || null,
        userCorrected: userCorrectedInitial || false,
      },
    });
  }

  return NextResponse.json(project, { status: 201 });
}
